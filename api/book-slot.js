// Aevia — POST /api/book-slot
// Body: { area, parts:[{svc,date,time},...], name, email, phone, pkg?, lang?, gotcha? }
//   1) Reserverer ALLE valgte tider atomisk (alt eller intet, m. rollback).
//   2) Sender kunden én samlet bekræftelse: alle tider + .ics-kalenderfil med
//      ét event pr. ydelse + Stripe-betalingslink + flyt/aflys-link.
//   3) Notificerer hver ydelses klinik (eller kontakt@aevia.dk).
//
// Miljøvariabler: KV_REST_API_URL, KV_REST_API_TOKEN, RESEND_API_KEY, MAIL_FROM, SITE_URL

import { reserveMulti, AREAS, SVC_LABELS, bookingSig, isPaid, setBookingPaid } from "./_booking-store.js";
import { sendMail } from "./_emails.js";

const SITE = process.env.SITE_URL || "https://aevia.dk";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PKG_MAP = { core: "core", executive: "executive", plus: "executive", elite: "elite" };

function svcLabel(svc, lang) {
  const l = SVC_LABELS[svc];
  return l ? (lang === "en" ? l.en : l.da) : svc;
}
function clinicFor(area, svc) {
  const c = AREAS[area] && AREAS[area].svcs && AREAS[area].svcs[svc];
  return (c && c.clinic) || "";
}
function fmtDate(date, time, lang) {
  try {
    return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "da-DK", {
      weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Copenhagen",
    }).format(new Date(date + "T00:00:00")) + " · " + time;
  } catch { return date + " · " + time; }
}

// .ics med ét VEVENT pr. ydelse.
function icsFor({ id, area, parts, lang }) {
  const da = lang !== "en";
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Aevia Health//Booking//DA", "METHOD:PUBLISH"];
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  parts.forEach((p, i) => {
    const conf = AREAS[area] && AREAS[area].svcs && AREAS[area].svcs[p.svc];
    const slotMin = (conf && conf.slot) || 30;
    const [h, m] = p.time.split(":").map(Number);
    const start = p.date.replace(/-/g, "") + "T" + String(h).padStart(2, "0") + String(m).padStart(2, "0") + "00";
    const endMin = h * 60 + m + slotMin;
    const end = p.date.replace(/-/g, "") + "T" + String(Math.floor(endMin / 60)).padStart(2, "0") + String(endMin % 60).padStart(2, "0") + "00";
    const loc = clinicFor(area, p.svc) || area;
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

function partsTable(area, parts, lang) {
  return parts.map((p) => {
    const cl = clinicFor(area, p.svc);
    return `<tr><td style="color:#f5f5f0;font-size:14px;padding:7px 0;border-bottom:1px solid #1d2c42">${svcLabel(p.svc, lang)}${cl ? `<br><span style="color:#94a0b2;font-size:12px">${cl}</span>` : ""}</td><td style="color:#c9a437;font-size:14px;font-weight:bold;text-align:right;border-bottom:1px solid #1d2c42">${fmtDate(p.date, p.time, lang)}</td></tr>`;
  }).join("");
}

function customerMail({ lang, name, area, parts, payUrl, manageUrl, paid }) {
  const da = lang !== "en";
  // Allerede betalt → ingen betalingsopfordring; alt er på plads.
  const payBlock = paid
    ? `<p style="color:#aab4c2;font-size:15px;line-height:1.6;margin:0 0 8px">${da ? "Alle tider er reserveret, og dit forløb er allerede betalt — du skal ikke gøre mere." : "All times are reserved, and your programme is already paid for — nothing more to do."}</p>
       <div style="background:#0c1830;border:1px solid #1d2c42;border-left:3px solid #3fb27f;border-radius:10px;padding:12px 16px;margin:14px 0 6px"><p style="margin:0;color:#3fb27f;font-size:14px;font-weight:bold">${da ? "✓ Betaling registreret" : "✓ Payment registered"}</p></div>`
    : `<p style="color:#aab4c2;font-size:15px;line-height:1.6;margin:0 0 8px">${da ? "Alle tider er reserveret. Sidste skridt er betalingen af dit forløb:" : "All times are reserved. The final step is paying for your programme:"}</p>` +
      (payUrl
        ? `<p style="margin:20px 0 6px"><a href="${payUrl}" style="display:inline-block;background:#c9a437;color:#0a1628;font-weight:bold;font-size:15px;text-decoration:none;border-radius:999px;padding:13px 26px">${da ? "Betal dit forløb nu" : "Pay for your programme now"}</a></p>`
        : `<p style="margin:20px 0 6px"><a href="${SITE}/${da ? "" : "en/"}pakker.html" style="display:inline-block;background:#c9a437;color:#0a1628;font-weight:bold;font-size:15px;text-decoration:none;border-radius:999px;padding:13px 26px">${da ? "Vælg og betal dit forløb" : "Choose and pay for your programme"}</a></p>`);
  return `<!DOCTYPE html><html lang="${da ? "da" : "en"}"><body style="margin:0;background:#0a1628;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:36px 24px">
    <div style="font-size:26px;font-weight:bold;color:#f5f5f0;font-family:Georgia,serif">Aevia<span style="color:#c9a437">.</span></div>
    <div style="background:#0f1f36;border:1px solid #28394f;border-radius:14px;padding:28px;margin-top:22px">
      <h1 style="color:#f5f5f0;font-size:20px;margin:0 0 12px;font-family:Georgia,serif">${da ? `Dine tider er bekræftet${name ? ", " + name : ""}` : `Your appointments are confirmed${name ? ", " + name : ""}`}</h1>
      <p style="color:#94a0b2;font-size:13px;margin:0 0 6px">${area}</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 16px">${partsTable(area, parts, lang)}</table>
      ${payBlock}
      <p style="color:#aab4c2;font-size:14px;line-height:1.6;margin:16px 0 0">${da
        ? `Tiderne ligger som kalenderfil i denne mail (én aftale pr. ydelse). Husk 8-12 timers faste før blodprøven — vand er ok. Skal noget flyttes eller aflyses? <a href="${manageUrl}" style="color:#c9a437">Administrér din booking her</a>.`
        : `The appointments are attached as a calendar file (one event per service). Remember to fast 8-12 hours before the blood draw — water is fine. Need to reschedule or cancel? <a href="${manageUrl}" style="color:#c9a437">Manage your booking here</a>.`}</p>
    </div>
    <p style="color:#94a0b2;font-size:12px;margin-top:18px;text-align:center">Aevia Health ApS · CVR 46 52 07 50 · <a href="${SITE}" style="color:#c9a437">aevia.dk</a></p>
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

  // Kunde-bekræftelse (én mail, alle tider, .ics med flere events)
  try {
    if (process.env.RESEND_API_KEY) {
      await sendMail({
        to: customer.email,
        bcc: "kontakt@aevia.dk",
        subject: isEN ? "Your appointments with Aevia are confirmed" : "Dine tider hos Aevia er bekræftet",
        html: customerMail({ lang: customer.lang, name: customer.name.split(" ")[0], area, parts: cleanParts, payUrl, manageUrl, paid: alreadyPaid }),
        attachments: [{ filename: "aevia-booking.ics", content: icsFor({ id: r.id, area, parts: cleanParts, lang: customer.lang }) }],
      });
    }
  } catch (e) { console.error("Kundemail-fejl:", e.message); }

  // Klinik-notifikationer — én pr. ydelse (hver klinik får kun sin egen tid)
  try {
    if (process.env.RESEND_API_KEY) {
      for (const p of cleanParts) {
        const conf = AREAS[area].svcs[p.svc] || {};
        const to = conf.email || "kontakt@aevia.dk";
        await sendMail({
          to,
          bcc: to === "kontakt@aevia.dk" ? undefined : "kontakt@aevia.dk",
          subject: `Ny booking: ${svcLabel(p.svc, "da")} · ${fmtDate(p.date, p.time, "da")}`,
          html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0a1628">
            <h2 style="font-family:Georgia,serif">Ny Aevia-booking</h2>
            <p><b>${svcLabel(p.svc, "da")}</b><br>${fmtDate(p.date, p.time, "da")}<br>Område: ${area}</p>
            <p>Navn: ${customer.name}<br>E-mail: ${customer.email}<br>Telefon: ${customer.phone || "—"}<br>Pakke: ${customer.pkg || "—"}${alreadyPaid ? "<br><b>Betaling: allerede betalt</b>" : ""}</p>
            <p style="color:#667">Booking-id: ${r.id}</p></div>`,
        });
      }
    }
  } catch (e) { console.error("Kliniknotifikation-fejl:", e.message); }

  return res.status(200).json({ ok: true, id: r.id, whenList, payUrl, manageUrl, paid: alreadyPaid });
}
