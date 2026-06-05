// Aevia — POST /api/book-slot
// Body: { area, date, time, name, email, phone, pkg?, services?, lang?, gotcha? }
//   1) Reserverer tiden atomisk (forhindrer dobbeltbooking).
//   2) Sender kunden en bekræftelse med Stripe-betalingslink (hvis pakke valgt).
//   3) Notificerer klinik/kontakt@aevia.dk.
//
// Erstatter Cal.com-flowet for områder, der er sat ready=true i _booking-store.js.
// Miljøvariabler: KV_REST_API_URL, KV_REST_API_TOKEN, RESEND_API_KEY, MAIL_FROM, SITE_URL

import { reserve, AREAS, bookingSig } from "./_booking-store.js";
import { sendMail } from "./_emails.js";

const SITE = process.env.SITE_URL || "https://aevia.dk";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PKG_MAP = { core: "core", executive: "executive", plus: "executive", elite: "elite" };

function fmtDate(date, time, lang) {
  try {
    return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "da-DK", {
      weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Copenhagen",
    }).format(new Date(date + "T00:00:00")) + " · " + time;
  } catch { return date + " · " + time; }
}

// Kalenderfil (.ics) til bekræftelsesmailen — tiden lander i kundens kalender.
function icsFor({ id, area, date, time, slotMin, lang }) {
  const [h, m] = time.split(":").map(Number);
  const start = date.replace(/-/g, "") + "T" + String(h).padStart(2, "0") + String(m).padStart(2, "0") + "00";
  const endMin = h * 60 + m + (slotMin || 30);
  const end = date.replace(/-/g, "") + "T" + String(Math.floor(endMin / 60)).padStart(2, "0") + String(endMin % 60).padStart(2, "0") + "00";
  const da = lang !== "en";
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Aevia Health//Booking//DA", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:" + id + "@aevia.dk",
    "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
    "DTSTART;TZID=Europe/Copenhagen:" + start,
    "DTEND;TZID=Europe/Copenhagen:" + end,
    "SUMMARY:" + (da ? "Aevia helbredstjek — blodprøve" : "Aevia health check — blood draw"),
    "LOCATION:" + area,
    "DESCRIPTION:" + (da ? "Husk 8-12 timers faste før blodprøven (vand er ok). Detaljer i din bekræftelsesmail." : "Remember to fast 8-12 hours before the blood draw (water is fine). Details in your confirmation email."),
    "BEGIN:VALARM", "TRIGGER:-PT12H", "ACTION:DISPLAY",
    "DESCRIPTION:" + (da ? "Aevia i morgen — start din faste" : "Aevia tomorrow — start fasting"),
    "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ];
  return Buffer.from(lines.join("\r\n")).toString("base64");
}

function customerMail({ lang, name, area, when, payUrl, manageUrl }) {
  const da = lang !== "en";
  const btn = payUrl
    ? `<p style="margin:20px 0 6px"><a href="${payUrl}" style="display:inline-block;background:#c9a437;color:#0a1628;font-weight:bold;font-size:15px;text-decoration:none;border-radius:999px;padding:13px 26px">${da ? "Betal dit forløb nu" : "Pay for your programme now"}</a></p>`
    : `<p style="margin:20px 0 6px"><a href="${SITE}/${da ? "" : "en/"}pakker.html" style="display:inline-block;background:#c9a437;color:#0a1628;font-weight:bold;font-size:15px;text-decoration:none;border-radius:999px;padding:13px 26px">${da ? "Vælg og betal dit forløb" : "Choose and pay for your programme"}</a></p>`;
  return `<!DOCTYPE html><html lang="${da ? "da" : "en"}"><body style="margin:0;background:#0a1628;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:36px 24px">
    <div style="font-size:26px;font-weight:bold;color:#f5f5f0;font-family:Georgia,serif">Aevia<span style="color:#c9a437">.</span></div>
    <div style="background:#0f1f36;border:1px solid #28394f;border-radius:14px;padding:28px;margin-top:22px">
      <h1 style="color:#f5f5f0;font-size:20px;margin:0 0 12px;font-family:Georgia,serif">${da ? `Din tid er bekræftet${name ? ", " + name : ""}` : `Your appointment is confirmed${name ? ", " + name : ""}`}</h1>
      <table style="width:100%;border-collapse:collapse;margin:0 0 16px">
        <tr><td style="color:#94a0b2;font-size:14px;padding:6px 0">${da ? "Tidspunkt" : "Time"}</td><td style="color:#c9a437;font-size:14px;font-weight:bold;text-align:right">${when}</td></tr>
        <tr><td style="color:#94a0b2;font-size:14px;padding:6px 0">${da ? "Område" : "Area"}</td><td style="color:#f5f5f0;font-size:14px;text-align:right">${area}</td></tr>
      </table>
      <p style="color:#aab4c2;font-size:15px;line-height:1.6;margin:0 0 8px">${da ? "Din tid er reserveret. Sidste skridt er betalingen af dit forløb:" : "Your time is reserved. The final step is paying for your programme:"}</p>
      ${btn}
      <p style="color:#aab4c2;font-size:14px;line-height:1.6;margin:16px 0 0">${da
        ? `Du modtager en forberedelsesguide før din tid (bl.a. 8-12 timers faste — vand er ok). Tiden ligger også som kalenderfil i denne mail. Skal tiden flyttes eller aflyses? <a href="${manageUrl}" style="color:#c9a437">Administrér din booking her</a>.`
        : `You will receive a preparation guide before your appointment (incl. 8-12 hours of fasting — water is fine). The appointment is attached as a calendar file. Need to reschedule or cancel? <a href="${manageUrl}" style="color:#c9a437">Manage your booking here</a>.`}</p>
    </div>
    <p style="color:#94a0b2;font-size:12px;margin-top:18px;text-align:center">Aevia Health ApS · CVR 46 52 07 50 · <a href="${SITE}" style="color:#c9a437">aevia.dk</a></p>
  </div></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { area, date, time, name, email, phone, pkg, services, lang, gotcha } = body || {};

  if (gotcha) return res.status(200).json({ ok: true }); // honeypot
  if (!area || !AREAS[area]) return res.status(400).json({ error: "Vælg et gyldigt område." });
  if (!date || !time) return res.status(400).json({ error: "Vælg dato og tid." });
  if (!email || !EMAIL_RE.test(String(email))) return res.status(400).json({ error: "Angiv en gyldig e-mail." });
  if (!name) return res.status(400).json({ error: "Angiv dit navn." });

  const isEN = String(lang || "").toLowerCase() === "en";
  const customer = {
    name: String(name).slice(0, 120),
    email: String(email).trim().toLowerCase(),
    phone: phone ? String(phone).slice(0, 40) : "",
    pkg: pkg ? String(pkg).slice(0, 40) : "",
    services: services ? String(services).slice(0, 400) : "",
    lang: isEN ? "en" : "da",
  };

  const r = await reserve({ area, date, time, customer });
  if (!r.ok) return res.status(409).json({ error: r.reason });

  const when = fmtDate(date, time, customer.lang);
  const pkgKey = PKG_MAP[String(pkg || "").toLowerCase()];
  // bid = booking-id i Stripe-metadata, så betaling og booking kan kobles.
  const payUrl = pkgKey ? `${SITE}/api/checkout?pkg=${pkgKey}&bid=${r.id}${isEN ? "&lang=en" : ""}` : null;
  const manageUrl = `${SITE}/api/min-booking?id=${r.id}&sig=${bookingSig(r.id)}${isEN ? "&lang=en" : ""}`;

  // Kunde-bekræftelse (med .ics-kalenderfil vedhæftet)
  try {
    if (process.env.RESEND_API_KEY) {
      await sendMail({
        to: customer.email,
        bcc: "kontakt@aevia.dk",
        subject: isEN ? "Your appointment with Aevia is confirmed" : "Din tid hos Aevia er bekræftet",
        html: customerMail({ lang: customer.lang, name: customer.name.split(" ")[0], area, when, payUrl, manageUrl }),
        attachments: [{ filename: "aevia-booking.ics", content: icsFor({ id: r.id, area, date, time, slotMin: AREAS[area].slot, lang: customer.lang }) }],
      });
    }
  } catch (e) { console.error("Kundemail-fejl:", e.message); }

  // Klinik/intern notifikation
  try {
    if (process.env.RESEND_API_KEY) {
      const to = AREAS[area].clinic || "kontakt@aevia.dk";
      await sendMail({
        to,
        bcc: to === "kontakt@aevia.dk" ? undefined : "kontakt@aevia.dk",
        subject: `Ny booking: ${area} · ${when}`,
        html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0a1628">
          <h2 style="font-family:Georgia,serif">Ny booking</h2>
          <p><b>${when}</b><br>Område: ${area}</p>
          <p>Navn: ${customer.name}<br>E-mail: ${customer.email}<br>Telefon: ${customer.phone || "—"}</p>
          <p>Pakke: ${customer.pkg || "—"}${customer.services ? "<br>Ydelser: " + customer.services : ""}</p>
          <p style="color:#667">Booking-id: ${r.id}</p></div>`,
      });
    }
  } catch (e) { console.error("Kliniknotifikation-fejl:", e.message); }

  return res.status(200).json({ ok: true, id: r.id, when, payUrl, manageUrl });
}
