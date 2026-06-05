// Aevia — Stripe webhook.
//
//   checkout.session.completed → bekræftelsesmail + kunde registreres til
//                                 opfølgnings-drip (Trustpilot + feedback).
//   checkout.session.expired   → "din tid er stadig reserveret"-påmindelse
//                                 med nyt betalingslink (glemt betaling).
//
// Opsætning (se EMAIL-SETUP.md):
//   Stripe Dashboard → Developers → Webhooks → endpoint https://aevia.dk/api/stripe-webhook
//   Events: checkout.session.completed OG checkout.session.expired
//   Miljøvariabler: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, MAIL_FROM

import Stripe from "stripe";
import { markPaid, setBookingPaid, getBooking, SVC_LABELS } from "./_booking-store.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SITE = process.env.SITE_URL || "https://aevia.dk";

export const config = { api: { bodyParser: false } };

async function rawBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === "string" ? Buffer.from(c) : c);
  return Buffer.concat(chunks);
}

function kr(amountTotal) {
  return (amountTotal / 100).toLocaleString("da-DK") + " kr.";
}

function shell(eyebrow, inner) {
  return `<!DOCTYPE html><html lang="da"><body style="margin:0;padding:0;background:#0a1628;font-family:Arial,Helvetica,sans-serif">
  <div style="background:#0a1628;padding:44px 16px">
  <div style="max-width:600px;margin:0 auto">
    <div style="text-align:center;padding-bottom:28px">
      <span style="font-size:32px;font-weight:bold;color:#f5f5f0;font-family:Georgia,'Times New Roman',serif;letter-spacing:-.5px">Aevia</span><span style="font-size:32px;font-weight:bold;color:#c9a437;font-family:Georgia,serif">.</span>
    </div>
    <div style="background:#0f1f36;border:1px solid #28394f;border-radius:18px;overflow:hidden">
      <div style="height:3px;background:#c9a437;font-size:0;line-height:0">&nbsp;</div>
      <div style="padding:36px 38px 30px">
        ${eyebrow ? `<p style="margin:0 0 12px;font-size:11px;letter-spacing:3px;color:#c9a437;font-weight:bold;text-transform:uppercase;font-family:Arial,sans-serif">${eyebrow}</p>` : ""}
        ${inner}
      </div>
      <div style="border-top:1px solid #1d2c42;padding:18px 38px;background:#0d1b31">
        <p style="margin:0;color:#94a0b2;font-size:13px">Sp&oslash;rgsm&aring;l? <a href="mailto:kontakt@aevia.dk" style="color:#c9a437;text-decoration:none">kontakt@aevia.dk</a> &nbsp;&middot;&nbsp; <a href="tel:+4528303933" style="color:#c9a437;text-decoration:none">+45 28 30 39 33</a></p>
      </div>
    </div>
    <p style="color:#5a6b80;font-size:12px;margin-top:22px;text-align:center;line-height:1.7">Aevia &middot; CVR 46 52 07 50<br><a href="${SITE}" style="color:#94a0b2;text-decoration:none">aevia.dk</a></p>
  </div></div></body></html>`;
}

const step = (n, title, body) => `<table role="presentation" style="border-collapse:collapse;margin:0 0 16px"><tr>
  <td style="vertical-align:top;padding-right:16px"><div style="width:32px;height:32px;border-radius:50%;background:#142840;border:1px solid #c9a437;color:#c9a437;font-weight:bold;font-size:14px;text-align:center;line-height:32px;font-family:Georgia,serif">${n}</div></td>
  <td style="vertical-align:top"><p style="margin:4px 0 3px;color:#f5f5f0;font-size:15px;font-weight:bold">${title}</p><p style="margin:0;color:#aab4c2;font-size:14px;line-height:1.6">${body}</p></td></tr></table>`;

function fmtPartDate(date, time) {
  try {
    return new Intl.DateTimeFormat("da-DK", {
      weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Copenhagen",
    }).format(new Date(date + "T00:00:00")) + " · " + time;
  } catch { return date + " · " + time; }
}

// `booking` (valgfri): kunden har allerede booket sine tider via widgetten —
// så viser vi tiderne i stedet for "vi kontakter dig".
function confirmedHtml({ name, pkg, total, booking }) {
  const timesRows = booking && Array.isArray(booking.parts)
    ? booking.parts.map((p) => {
        const l = SVC_LABELS[p.svc];
        return `<tr><td style="color:#f5f5f0;font-size:14px;padding:6px 0;border-bottom:1px solid #1d2c42">${l ? l.da : p.svc}</td><td style="color:#c9a437;font-size:14px;font-weight:bold;text-align:right;border-bottom:1px solid #1d2c42">${fmtPartDate(p.date, p.time)}</td></tr>`;
      }).join("")
    : "";
  const stepsBlock = timesRows
    ? `<p style="margin:0 0 10px;color:#f5f5f0;font-size:15px;font-weight:bold">Dine bookede tider</p>
       <table style="width:100%;border-collapse:collapse;margin:0 0 22px">${timesRows}</table>
       ${step(1, "Du får din forberedelsesguide", "Bl.a. 8-12 timers faste før blodprøven — vand er ok. Vi minder dig også om tiden dagen før.")}
       ${step(2, "Din rapport gennemgås 1:1", "Klar inden for 10 arbejdsdage efter prøvetagning — ellers 10% retur.")}`
    : `${step(1, "Vi kontakter dig", "Inden for 1 arbejdsdag aftaler vi tid og sted for din prøvetagning.")}
       ${step(2, "Du får din forberedelsesguide", "Bl.a. 8-12 timers faste før blodprøven — vand er ok.")}
       ${step(3, "Din rapport gennemgås 1:1", "Klar inden for 10 arbejdsdage efter prøvetagning — ellers 10% retur.")}`;
  return shell("Betaling modtaget", `<h1 style="color:#f5f5f0;font-size:24px;margin:0 0 14px;font-family:Georgia,serif;font-weight:normal">Tak for din booking${name ? ", " + name : ""}</h1>
    <p style="color:#aab4c2;font-size:15px;line-height:1.7;margin:0 0 24px">Vi har modtaget din betaling, og dit forløb er bekræftet.</p>
    <div style="background:#0c1830;border:1px solid #1d2c42;border-left:3px solid #c9a437;border-radius:10px;padding:14px 18px;margin:0 0 26px">
      <p style="margin:0;color:#f5f5f0;font-size:15px;font-weight:bold">${pkg}</p>
      <p style="margin:4px 0 0;color:#c9a437;font-size:14px;font-weight:bold">${total}</p>
    </div>
    ${stepsBlock}`);
}

function expiredHtml({ name, pkg, payLink }) {
  return shell("Din reservation", `<h1 style="color:#f5f5f0;font-size:24px;margin:0 0 14px;font-family:Georgia,serif;font-weight:normal">Du var næsten i mål${name ? ", " + name : ""}</h1>
    <p style="color:#aab4c2;font-size:15px;line-height:1.7;margin:0 0 18px">Det ser ud til, at din betaling ikke blev gennemført. Det sker — og der er ingen grund til bekymring: du kan fortsætte præcis, hvor du slap.</p>
    ${pkg ? `<div style="background:#0c1830;border:1px solid #1d2c42;border-left:3px solid #c9a437;border-radius:10px;padding:14px 18px;margin:0 0 24px"><p style="margin:0;color:#f5f5f0;font-size:15px;font-weight:bold">${pkg}</p></div>` : ""}
    <div style="text-align:center;margin:0 0 8px"><a href="${payLink}" style="display:inline-block;background:#c9a437;color:#0a1628;font-weight:bold;text-decoration:none;border-radius:999px;padding:15px 34px;font-size:15px">Genoptag din booking</a></div>
    <p style="color:#94a0b2;font-size:13px;line-height:1.6;margin:14px 0 0;text-align:center">Har du spørgsmål først? Svar på denne mail eller ring — vi hjælper gerne.</p>`);
}

async function sendMail({ to, subject, html, bcc }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM || "Aevia <kontakt@aevia.dk>", to: [to], bcc: bcc ? [bcc] : undefined, subject, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

// Registrér kunden som Resend-kontakt med købsdato i last_name ("KUNDE:YYYY-MM-DD").
// api/drip.js bruger det til Trustpilot- og feedback-mails — og til at undgå
// at sende velkomstserien til betalende kunder.
async function upsertCustomerContact({ email, firstName, lang }) {
  const lastName = `KUNDE${lang === "en" ? "-EN" : ""}:${new Date().toISOString().slice(0, 10)}`;
  const headers = { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" };
  const create = await fetch("https://api.resend.com/contacts", {
    method: "POST", headers,
    body: JSON.stringify({ email, first_name: firstName || "", last_name: lastName, unsubscribed: false }),
  });
  if (!create.ok) {
    // Findes sandsynligvis allerede (var lead) → opdatér i stedet.
    await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
      method: "PATCH", headers,
      body: JSON.stringify({ last_name: lastName }),
    }).catch(() => {});
  }
}

// Byg et nyt checkout-link ud fra sessionens metadata (sat af api/checkout.js).
function retryLink(meta = {}) {
  if (meta.pakke === "gavekort" && meta.gavekort) return `${SITE}/api/checkout?pkg=gavekort&beloeb=${encodeURIComponent(meta.gavekort)}`;
  if (!meta.pakke) return `${SITE}/pakker.html`;
  const addons = meta.tilvalg ? `&addons=${encodeURIComponent(meta.tilvalg)}` : "";
  return `${SITE}/api/checkout?pkg=${encodeURIComponent(meta.pakke)}${addons}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let event;
  try {
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(await rawBody(req), sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  const s = event.data.object || {};
  const to = s.customer_details?.email;
  const name = (s.customer_details?.name || "").split(" ")[0];
  const pkg = s.metadata?.package_name || (s.metadata?.pakke ? "Aevia-forløb" : "Aevia-forløb");

  if (event.type === "checkout.session.completed" && to && process.env.RESEND_API_KEY) {
    // Registrér betalingen, så book-slot ikke beder kunden betale igen,
    // og markér en evt. tilknyttet booking (?bid=) som betalt.
    let booking = null;
    try {
      await markPaid(to, { pkg: s.metadata?.pakke || "", sid: s.id });
      if (s.metadata?.booking_id) {
        await setBookingPaid(s.metadata.booking_id);
        booking = await getBooking(s.metadata.booking_id);
      }
    } catch (e) { console.error("Betalingsstatus-fejl:", e.message); }
    try {
      await sendMail({
        to,
        bcc: "kontakt@aevia.dk",
        subject: "Din booking hos Aevia er bekræftet",
        html: confirmedHtml({ name, pkg, total: kr(s.amount_total || 0), booking }),
      });
    } catch (e) {
      console.error("Mail-fejl (completed):", e.message);
    }
    // Kunde-drip: Trustpilot + feedback senere. Fejler stille.
    try { await upsertCustomerContact({ email: to, firstName: name, lang: s.locale === "en" ? "en" : "da" }); }
    catch (e) { console.error("Kontakt-fejl:", e.message); }
  }

  if (event.type === "checkout.session.expired" && to && process.env.RESEND_API_KEY) {
    // Glemt betaling: venlig påmindelse med nyt checkout-link.
    try {
      await sendMail({
        to,
        bcc: "kontakt@aevia.dk",
        subject: "Din booking venter stadig på dig",
        html: expiredHtml({ name, pkg, payLink: retryLink(s.metadata) }),
      });
    } catch (e) {
      console.error("Mail-fejl (expired):", e.message);
    }
  }

  return res.status(200).json({ received: true });
}
