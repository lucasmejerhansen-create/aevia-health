// Aevia — POST /api/book-slot
// Body: { area, parts:[{svc,date,time},...], name, email, phone, pkg?, lang?, gotcha? }
//   1) Reserverer ALLE valgte tider atomisk (alt eller intet, m. rollback).
//   2) Sender kunden én samlet bekræftelse: alle tider + .ics-kalenderfil med
//      ét event pr. ydelse + Stripe-betalingslink + flyt/aflys-link.
//   3) Notificerer hver ydelses klinik (eller kontakt@aevia.dk).
//
// Miljøvariabler: KV_REST_API_URL, KV_REST_API_TOKEN, RESEND_API_KEY, MAIL_FROM, SITE_URL

import { reserveMulti, AREAS, SVC_LABELS, bookingSig, isPaid, setBookingPaid, effectiveConf } from "./_booking-store.js";
import { sendMail } from "./_emails.js";

const SITE = process.env.SITE_URL || "https://aevia.dk";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PKG_MAP = { core: "core", executive: "executive", plus: "executive", elite: "elite" };

function svcLabel(svc, lang) {
  const l = SVC_LABELS[svc];
  return l ? (lang === "en" ? l.en : l.da) : svc;
}
// confs = { <svc>: effektiv konfiguration } — klinik-regel ELLER standard.
function clinicFor(confs, svc) {
  return (confs && confs[svc] && confs[svc].clinic) || "";
}
function fmtDate(date, time, lang) {
  try {
    return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "da-DK", {
      weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Copenhagen",
    }).format(new Date(date + "T00:00:00")) + " · " + time;
  } catch { return date + " · " + time; }
}

// .ics med ét VEVENT pr. ydelse.
function icsFor({ id, area, parts, lang, confs }) {
  const da = lang !== "en";
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Aevia Health//Booking//DA", "METHOD:PUBLISH"];
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  parts.forEach((p, i) => {
    const conf = confs && confs[p.svc];
    const slotMin = (conf && conf.slot) || 30;
    const [h, m] = p.time.split(":").map(Number);
    // Beregn via Date, så slut-tider efter midnat ruller datoen korrekt
    // (i stedet for ugyldigt 'T240000').
    const startDt = new Date(p.date + "T" + String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":00");
    const endDt = new Date(startDt.getTime() + slotMin * 60000);
    const z2 = (n) => String(n).padStart(2, "0");
    const fmtLocal = (d) => "" + d.getFullYear() + z2(d.getMonth() + 1) + z2(d.getDate()) + "T" + z2(d.getHours()) + z2(d.getMinutes()) + "00";
    const start = fmtLocal(startDt);
    const end = fmtLocal(endDt);
    const loc = clinicFor(confs, p.svc) || area;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${id}-${i}@aevia.dk`,
      "DTSTAMP:" + stamp,
      "DTSTART;TZID=Europe/Copenhagen:" + start,
      "DTEND;TZID=Europe/Copenhagen:" + end,
      "SUMMARY:Aevia — " + svcLabel(p.svc, lang),
      "LOCATION:" + loc,
      "DESCRIPTION:" + (p.svc === "blod"
        ? (da ? "Husk 8-12 timers faste før blodprøven (vand er ok)." : "Remember to fast 8-12 hours before the blood draw (water is fine).")
        : (da ? "Detaljer i din bekræftelsesmail fra Aevia." : "Details in your Aevia confirmation email.")),
    );
    if (p.svc === "blod") {
      lines.push("BEGIN:VALARM", "TRIGGER:-PT12H", "ACTION:DISPLAY",
        "DESCRIPTION:" + (da ? "Aevia i morgen — start din faste" : "Aevia tomorrow — start fasting"), "END:VALARM");
    }
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return Buffer.from(lines.join("\r\n")).toString("base64");
}

function partsTable(confs, parts, lang) {
  return parts.map((p) => {
    const cl = clinicFor(confs, p.svc);
    return `<tr><td style="color:#0a1628;font-size:14px;padding:7px 0;border-bottom:1px solid #eef1f4">${svcLabel(p.svc, lang)}${cl ? `<br><span style="color:#697585;font-size:12px">${cl}</span>` : ""}</td><td style="color:#8a6d10;font-size:14px;font-weight:bold;text-align:right;border-bottom:1px solid #eef1f4">${fmtDate(p.date, p.time, lang)}</td></tr>`;
  }).join("");
}

function customerMail({ lang, name, area, parts, payUrl, manageUrl, paid, confs }) {
  const da = lang !== "en";
  const h1 = paid
    ? (da ? `Tusind tak${name ? ", " + name : ""} — alt er på plads` : `Thank you${name ? ", " + name : ""} — everything is in place`)
    : (da ? `Tak for din booking${name ? ", " + name : ""}` : `Thank you for your booking${name ? ", " + name : ""}`);
  const intro = paid
    ? (da ? "Tak, fordi du investerer i dit helbred sammen med os — det sætter vi oprigtigt pris på. Dine tider er reserveret, betalingen er registreret, og vi tager os af resten."
          : "Thank you for investing in your health with us — we sincerely appreciate it. Your times are reserved, your payment is registered, and we will take care of the rest.")
    : (da ? "Tak, fordi du har valgt Aevia — det betyder meget for os. Vi har reserveret alle dine tider nedenfor."
          : "Thank you for choosing Aevia — it means a lot to us. We have reserved all your times below.");
  // Allerede betalt → ingen betalingsopfordring; alt er på plads.
  const payBlock = paid
    ? `<div style="background:#f6f8fb;border:1px solid #eef1f4;border-left:3px solid #3fb27f;border-radius:10px;padding:12px 16px;margin:14px 0 6px"><p style="margin:0;color:#3fb27f;font-size:14px;font-weight:bold">${da ? "✓ Betaling registreret — du skal ikke gøre mere" : "✓ Payment registered — nothing more to do"}</p></div>`
    : `<p style="color:#46505f;font-size:15px;line-height:1.6;margin:0 0 8px">${da ? "Sidste skridt er betalingen af dit forløb:" : "The final step is paying for your programme:"}</p>` +
      (payUrl
        ? `<p style="margin:20px 0 6px"><a href="${payUrl}" style="display:inline-block;background:#eef2f7;color:#ffffff;font-weight:bold;font-size:15px;text-decoration:none;border-radius:999px;padding:13px 26px">${da ? "Betal dit forløb nu" : "Pay for your programme now"}</a></p>`
        : `<p style="margin:20px 0 6px"><a href="${SITE}/${da ? "" : "en/"}pakker.html" style="display:inline-block;background:#eef2f7;color:#ffffff;font-weight:bold;font-size:15px;text-decoration:none;border-radius:999px;padding:13px 26px">${da ? "Vælg og betal dit forløb" : "Choose and pay for your programme"}</a></p>`);
  const next = da
    ? `<p style="color:#0a1628;font-size:14px;font-weight:bold;margin:18px 0 8px">Sådan forbereder du dig</p>
       <p style="color:#46505f;font-size:14px;line-height:1.7;margin:0">· Tiderne ligger som kalenderfil i denne mail — én aftale pr. ydelse<br>· 8-12 timers faste før blodprøven (vand og sort kaffe er ok)<br>· Vi minder dig om hver tid dagen før<br>· Din rapport er klar inden for 10 arbejdsdage og gennemgås af en læge</p>`
    : `<p style="color:#0a1628;font-size:14px;font-weight:bold;margin:18px 0 8px">How to prepare</p>
       <p style="color:#46505f;font-size:14px;line-height:1.7;margin:0">· Your appointments are attached as a calendar file — one event per service<br>· Fast 8-12 hours before the blood draw (water and black coffee are fine)<br>· We will remind you the day before each appointment<br>· Your report is ready within 10 working days and reviewed by a physician</p>`;
  return `<!DOCTYPE html><html lang="${da ? "da" : "en"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:36px 24px">
    <div style="font-size:26px;font-weight:bold;color:#0a1628;font-family:Georgia,serif">Aevia<span style="color:#8a6d10">.</span></div>
    <div style="background:#ffffff;border:1px solid #e3e8ee;border-radius:14px;padding:28px;margin-top:22px">
      <h1 style="color:#0a1628;font-size:20px;margin:0 0 12px;font-family:Georgia,serif">${h1}</h1>
      <p style="color:#46505f;font-size:15px;line-height:1.7;margin:0 0 14px">${intro}</p>
      <p style="color:#697585;font-size:13px;margin:0 0 6px">${area}</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 16px">${partsTable(confs, parts, lang)}</table>
      ${payBlock}
      ${next}
      <p style="color:#46505f;font-size:14px;line-height:1.6;margin:16px 0 0">${da
        ? `Skal noget flyttes eller aflyses? <a href="${manageUrl}" style="color:#8a6d10">Administrér din booking her</a> — det tager under et minut.`
        : `Need to reschedule or cancel? <a href="${manageUrl}" style="color:#8a6d10">Manage your booking here</a> — it takes less than a minute.`}</p>
      <p style="color:#0a1628;font-size:14px;line-height:1.6;margin:18px 0 0">${da ? "Vi glæder os til at tage imod dig." : "We look forward to welcoming you."}<br><span style="color:#697585">${da ? "— dit Aevia-team" : "— your Aevia team"}</span></p>
    </div>
    <p style="color:#697585;font-size:12px;margin-top:18px;text-align:center">${da ? "Spørgsmål? Svar blot på denne mail eller ring " : "Questions? Just reply to this email or call "}<a href="tel:+4528303933" style="color:#8a6d10">+45 28 30 39 33</a><br>Aevia · CVR 46 52 07 50 · <a href="${SITE}" style="color:#8a6d10">aevia.dk</a></p>
  </div></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { area, parts, name, email, phone, pkg, lang, gotcha } = body || {};

  if (gotcha) return res.status(200).json({ ok: true }); // honeypot
  if (!area || !AREAS[area]) return res.status(400).json({ error: "Vælg et gyldigt område." });
  if (!Array.isArray(parts) || !parts.length) return res.status(400).json({ error: "Vælg mindst én tid." });
  for (const p of parts) {
    if (!p || !SVC_LABELS[p.svc] || !/^\d{4}-\d{2}-\d{2}$/.test(String(p.date || "")) || !/^\d{2}:\d{2}$/.test(String(p.time || ""))) {
      return res.status(400).json({ error: "Ugyldigt tidsvalg." });
    }
  }
  if (!email || !EMAIL_RE.test(String(email))) return res.status(400).json({ error: "Angiv en gyldig e-mail." });
  if (!name) return res.status(400).json({ error: "Angiv dit navn." });

  const isEN = String(lang || "").toLowerCase() === "en";
  const customer = {
    name: String(name).slice(0, 120),
    email: String(email).trim().toLowerCase(),
    phone: phone ? String(phone).slice(0, 40) : "",
    pkg: pkg ? String(pkg).slice(0, 40) : "",
    lang: isEN ? "en" : "da",
  };
  const cleanParts = parts.map((p) => ({ svc: String(p.svc), date: String(p.date), time: String(p.time) }));

  const r = await reserveMulti({ area, parts: cleanParts, customer });
  if (!r.ok) return res.status(409).json({ error: r.reason, failedSvc: r.failedSvc });

  // Har kunden allerede betalt (fx pakke købt via pakker.html før booking)?
  let alreadyPaid = false;
  try { alreadyPaid = !!(await isPaid(customer.email)); } catch (e) { console.error("isPaid-fejl:", e.message); }
  if (alreadyPaid) { try { await setBookingPaid(r.id); } catch (_) {} }

  const pkgKey = PKG_MAP[String(pkg || "").toLowerCase()];
  const payUrl = !alreadyPaid && pkgKey ? `${SITE}/api/checkout?pkg=${pkgKey}&bid=${r.id}${isEN ? "&lang=en" : ""}` : null;
  const manageUrl = `${SITE}/api/min-booking?id=${r.id}&sig=${bookingSig(r.id)}${isEN ? "&lang=en" : ""}`;
  const whenList = cleanParts.map((p) => `${svcLabel(p.svc, customer.lang)}: ${fmtDate(p.date, p.time, customer.lang)}`);

  // Effektive konfigurationer (klinik-regel ELLER standard) til klinik-navn,
  // slot-længde i .ics og notifikations-mail pr. ydelse.
  const confs = {};
  for (const p of cleanParts) { try { confs[p.svc] = await effectiveConf(area, p.svc); } catch { confs[p.svc] = null; } }

  // Kunde-bekræftelse (én mail, alle tider, .ics med flere events)
  try {
    if (process.env.RESEND_API_KEY) {
      await sendMail({
        to: customer.email,
        bcc: "kontakt@aevia.dk",
        subject: isEN ? "Your appointments with Aevia are confirmed" : "Dine tider hos Aevia er bekræftet",
        html: customerMail({ lang: customer.lang, name: customer.name.split(" ")[0], area, parts: cleanParts, payUrl, manageUrl, paid: alreadyPaid, confs }),
        attachments: [{ filename: "aevia-booking.ics", content: icsFor({ id: r.id, area, parts: cleanParts, lang: customer.lang, confs }) }],
      });
    }
  } catch (e) { console.error("Kundemail-fejl:", e.message); }

  // Klinik-notifikationer — én pr. ydelse (hver klinik får kun sin egen tid)
  try {
    if (process.env.RESEND_API_KEY) {
      for (const p of cleanParts) {
        const conf = confs[p.svc] || {};
        const to = conf.email || "kontakt@aevia.dk";
        await sendMail({
          to,
          bcc: to === "kontakt@aevia.dk" ? undefined : "kontakt@aevia.dk",
          subject: `Ny booking: ${svcLabel(p.svc, "da")} · ${fmtDate(p.date, p.time, "da")}`,
          html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0a1628">
            <h2 style="font-family:Georgia,serif">Ny Aevia-booking</h2>
            <p><b>${svcLabel(p.svc, "da")}</b><br>${fmtDate(p.date, p.time, "da")}<br>Område: ${area}</p>
            <p>Navn: ${customer.name}<br>Kontakt: ${customer.phone || customer.email}</p>
            <p style="color:#667">Booking-id: ${r.id}</p></div>`,
        });
      }
    }
  } catch (e) { console.error("Kliniknotifikation-fejl:", e.message); }

  return res.status(200).json({ ok: true, id: r.id, whenList, payUrl, manageUrl, paid: alreadyPaid });
}
