// Aevia — Cal.com-webhook: straks-bekræftede klinik-bookinger.
//
// Når en kunde booker direkte i en klinik-kalender (CLINIC_EVENTS i book.html),
// bekræfter Cal.com tiden med det samme. Denne webhook sørger for resten:
//   BOOKING_CREATED   → mail til kunden med bekræftelse + Stripe-betalingslink,
//                       kopi (bcc) til kontakt@aevia.dk
//   BOOKING_CANCELLED → besked til kontakt@aevia.dk
//
// Opsætning i Cal.com (gøres pr. konto — også på klinikkens egen konto, se
// KLINIK-ONBOARDING-calcom.md): Settings → Developer → Webhooks → New:
//   Subscriber URL: https://aevia.dk/api/cal-webhook
//   Events: Booking Created, Booking Cancelled
//   Secret: samme værdi som CAL_WEBHOOK_SECRET i Vercel
//
// Miljøvariabler: CAL_WEBHOOK_SECRET, RESEND_API_KEY, MAIL_FROM, SITE_URL (valgfri)

import crypto from "crypto";
import { sendMail } from "./_emails.js";

export const config = { api: { bodyParser: false } };

const SITE = process.env.SITE_URL || "https://aevia.dk";

async function rawBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === "string" ? Buffer.from(c) : c);
  return Buffer.concat(chunks);
}

function fmtTime(iso, lang) {
  try {
    return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "da-DK", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "Europe/Copenhagen",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// Find pakke-nøglen (core/executive/elite) i bookingens noter/metadata,
// sat af book.html som "Pakke: <nøgle>" i notes-feltet.
function findPkg(payload) {
  const hay = JSON.stringify(payload).toLowerCase();
  const m = hay.match(/pakke:\s*(core|executive|elite)/);
  return m ? m[1] : null;
}

function mailHtml({ lang, name, title, when, payUrl }) {
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
        <tr><td style="color:#94a0b2;font-size:14px;padding:6px 0">${da ? "Aftale" : "Appointment"}</td><td style="color:#f5f5f0;font-size:14px;text-align:right">${title}</td></tr>
        <tr><td style="color:#94a0b2;font-size:14px;padding:6px 0">${da ? "Tidspunkt" : "Time"}</td><td style="color:#c9a437;font-size:14px;font-weight:bold;text-align:right">${when}</td></tr>
      </table>
      <p style="color:#aab4c2;font-size:15px;line-height:1.6;margin:0 0 8px">${
        da
          ? "Din tid er booket direkte i klinikkens kalender og kræver ingen yderligere bekræftelse. Sidste skridt er betalingen af dit forløb:"
          : "Your time is booked directly in the clinic's calendar and needs no further confirmation. The final step is paying for your programme:"
      }</p>
      ${btn}
      <p style="color:#aab4c2;font-size:14px;line-height:1.6;margin:16px 0 0">${
        da
          ? 'Du modtager en forberedelsesguide før din tid (bl.a. 8-12 timers faste — vand er ok). Skal tiden flyttes, bruger du blot linket i kalenderinvitationen. Spørgsmål? Svar på denne mail eller skriv til <a href="mailto:kontakt@aevia.dk" style="color:#c9a437">kontakt@aevia.dk</a>.'
          : 'You will receive a preparation guide before your appointment (incl. 8-12 hours of fasting — water is fine). Need to reschedule? Just use the link in the calendar invitation. Questions? Reply to this email or write to <a href="mailto:kontakt@aevia.dk" style="color:#c9a437">kontakt@aevia.dk</a>.'
      }</p>
    </div>
    <p style="color:#94a0b2;font-size:12px;margin-top:18px;text-align:center">Aevia · CVR 46 52 07 50 · <a href="${SITE}" style="color:#c9a437">aevia.dk</a></p>
  </div>
</body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = await rawBody(req);

  // Verificér signaturen (HMAC-SHA256 af rå body med CAL_WEBHOOK_SECRET).
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: "CAL_WEBHOOK_SECRET mangler" });
  const sig = String(req.headers["x-cal-signature-256"] || "");
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const valid =
    sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!valid) return res.status(403).json({ error: "Ugyldig signatur" });

  let event;
  try {
    event = JSON.parse(body.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Ugyldig JSON" });
  }

  const p = event.payload || {};
  const attendee = (p.attendees && p.attendees[0]) || {};
  const to = attendee.email;
  const name = (attendee.name || "").split(" ")[0];
  const lang = String(attendee?.language?.locale || "").toLowerCase().startsWith("en") ? "en" : "da";
  const title = p.title || p.eventTitle || "Aevia-aftale";
  const when = fmtTime(p.startTime, lang);

  try {
    if (event.triggerEvent === "BOOKING_CREATED" && to) {
      const pkg = findPkg(p);
      const payUrl = pkg ? `${SITE}/api/checkout?pkg=${pkg}${lang === "en" ? "&lang=en" : ""}` : null;
      await sendMail({
        to,
        bcc: "kontakt@aevia.dk",
        subject: lang === "en" ? "Your appointment with Aevia is confirmed" : "Din tid hos Aevia er bekræftet",
        html: mailHtml({ lang, name, title, when, payUrl }),
      });
    } else if (event.triggerEvent === "BOOKING_CANCELLED") {
      await sendMail({
        to: "kontakt@aevia.dk",
        subject: `Aflyst klinik-booking: ${title}`,
        html: `<p style="font-family:Arial,sans-serif">Booking aflyst i klinik-kalenderen:<br><strong>${title}</strong><br>${when}<br>Kunde: ${attendee.name || "?"} (${to || "?"})</p>`,
      });
    }
  } catch (e) {
    console.error("Cal-webhook mailfejl:", e.message);
    // Returnér 200 alligevel, så Cal.com ikke gen-sender uendeligt; fejl ses i Vercel-loggen.
  }

  return res.status(200).json({ received: true });
}
