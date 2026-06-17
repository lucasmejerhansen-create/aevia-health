// Aevia — lead-endpoint til velkomstserien.
//
// POST /api/lead  { email, source?, lang? ("da"|"en"), gotcha? }
//   1) Gemmer kontakten i Resend Contacts (lead-lagring uden database).
//      Bemærk: Resends "Audiences" er udfaset — kontakter ligger nu direkte på
//      kontoen via POST /contacts, så der kræves IKKE noget audience-ID.
//   2) Sender dag 0-mailen (longevity-tjeklisten) med det samme.
//   Dag 2 og dag 5 sendes af /api/drip (Vercel cron — se vercel.json).
//
// GET /api/lead?unsub=1&e=<email>&sig=<hmac>
//   Afmelder kontakten (unsubscribed=true i Resend). Linket står i alle drip-mails.
//
// Miljøvariabler (Vercel): RESEND_API_KEY, MAIL_FROM, BOOKING_SECRET
// Sproghåndtering: engelske leads gemmes med last_name="EN"; /api/drip bruger
// feltet til at vælge sprog. Kilden (estimator/exit-intent) gemmes i first_name.

import crypto from "crypto";
import { DRIP, sendMail, unsubSig, unsubUrlFor } from "./_emails.js";

const RESEND = "https://api.resend.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function resendFetch(path, options = {}) {
  const res = await fetch(`${RESEND}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  return res;
}

function htmlPage(title, body) {
  return `<!DOCTYPE html><html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head>
<body style="margin:0;background:#eef2f7;color:#0a1628;font-family:Arial,Helvetica,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:24px">
<div><div style="font-size:26px;font-weight:bold;font-family:Georgia,serif">Aevia<span style="color:#8a6d10">.</span></div>
<p style="color:#46505f;max-width:42ch;line-height:1.6">${body}</p>
<a href="https://aevia.dk" style="color:#8a6d10">Tilbage til aevia.dk</a></div></body></html>`;
}

export default async function handler(req, res) {
  // ---- Afmeld (GET) ----
  if (req.method === "GET") {
    const { unsub, e, sig } = req.query || {};
    if (!unsub || !e || !sig) return res.status(400).json({ error: "Bad request" });
    const expected = unsubSig(String(e));
    const ok =
      expected.length === String(sig).length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(sig)));
    if (!ok) return res.status(403).send(htmlPage("Ugyldigt link", "Linket er ugyldigt eller udløbet. Skriv til kontakt@aevia.dk, så afmelder vi dig manuelt."));
    if (process.env.RESEND_API_KEY) {
      try {
        await resendFetch(`/contacts/${encodeURIComponent(String(e).toLowerCase())}`, {
          method: "PATCH",
          body: JSON.stringify({ unsubscribed: true }),
        });
      } catch (err) {
        console.error("Unsub-fejl:", err.message);
      }
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(htmlPage("Afmeldt", "Du er nu afmeldt og modtager ikke flere mails i serien. Du er altid velkommen tilbage."));
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // ---- Nyt lead (POST) ----
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const { email, source, lang, gotcha, estimat, detaljer } = body || {};

  // Honeypot: lad bots tro, det lykkedes.
  if (gotcha) return res.status(200).json({ ok: true });

  if (!email || !EMAIL_RE.test(String(email))) return res.status(400).json({ error: "Ugyldig e-mail" });
  if (!process.env.RESEND_API_KEY) return res.status(500).json({ error: "Mail ikke konfigureret" });

  const cleanEmail = String(email).trim().toLowerCase();
  const isEN = String(lang || "").toLowerCase() === "en";

  // 1) Gem kontakt i Resend Contacts (dubletter giver fejl fra Resend — det er ok).
  let isNew = true;
  try {
    const r = await resendFetch(`/contacts`, {
      method: "POST",
      body: JSON.stringify({
        email: cleanEmail,
        first_name: source ? String(source).slice(0, 50) : "",
        last_name: isEN ? "EN" : "",
        unsubscribed: false,
      }),
    });
    if (!r.ok) {
      isNew = false; // typisk: kontakten findes allerede
      console.error("Resend contact failed:", r.status);
    }
  } catch (err) {
    console.error("Kontakt-fejl:", err.message);
  }

  // 2) Send dag 0-mailen (kun til nye kontakter, så gengangere ikke spammes).
  if (isNew) {
    try {
      const tpl = DRIP[0]({
        lang: isEN ? "en" : "da",
        unsubUrl: unsubUrlFor(cleanEmail),
        estimat: estimat ? String(estimat).slice(0, 200) : "",
        detaljer: detaljer ? String(detaljer).slice(0, 1000) : "",
      });
      await sendMail({ to: cleanEmail, subject: tpl.subject, html: tpl.html });
    } catch (err) {
      console.error("Dag 0-mailfejl:", err.message);
    }
  }

  return res.status(200).json({ ok: true });
}
