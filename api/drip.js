// Aevia — drip-cron til velkomstserien (dag 2 + dag 5).
//
// Køres dagligt af Vercel Cron (se "crons" i vercel.json). Henter alle kontakter
// fra Resend Contacts (GET /contacts — Audiences er udfaset) og sender:
//   dag 2: "Sådan læser du dine tal"   (2 ≤ dage siden tilmelding < 3)
//   dag 5: founding member-tilbud      (5 ≤ dage siden tilmelding < 6)
// Dag 0 sendes straks af /api/lead. Buckets på hele dage betyder, at hver mail
// kun rammer én cron-kørsel pr. kontakt — ingen database nødvendig.
//
// Sikkerhed: sæt CRON_SECRET i Vercel; Vercel Cron sender automatisk
// "Authorization: Bearer <CRON_SECRET>" med.
//
// Miljøvariabler: RESEND_API_KEY, MAIL_FROM, BOOKING_SECRET, CRON_SECRET

import { DRIP, KUNDEDRIP, sendMail, unsubUrlFor } from "./_emails.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "RESEND_API_KEY mangler" });
  }

  // Uden ?limit returnerer Resend alle kontakter i ét svar.
  const r = await fetch(`https://api.resend.com/contacts`, {
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
  });
  if (!r.ok) return res.status(502).json({ error: `Resend ${r.status}: ${await r.text()}` });
  const { data: contacts = [] } = await r.json();

  const now = Date.now();
  let sent = 0;
  const errors = [];

  for (const c of contacts) {
    if (c.unsubscribed) continue;

    // Kunder (last_name = "KUNDE[-EN]:YYYY-MM-DD", sat af stripe-webhook):
    // ingen velkomstserie — i stedet Trustpilot (dag 17) og feedback (dag 21)
    // regnet fra købsdatoen (rapporten leveres senest ~14 dage efter køb).
    const kunde = /^KUNDE(-EN)?:(\d{4}-\d{2}-\d{2})$/.exec(c.last_name || "");
    if (kunde) {
      const kday = Math.floor((now - Date.parse(kunde[2])) / DAY_MS);
      if (kday !== 17 && kday !== 21) continue;
      const lang = kunde[1] ? "en" : "da";
      try {
        const tpl = KUNDEDRIP[kday]({ lang, unsubUrl: unsubUrlFor(c.email), email: c.email });
        await sendMail({ to: c.email, subject: tpl.subject, html: tpl.html });
        sent++;
      } catch (err) {
        errors.push(`${c.email}: ${err.message}`);
      }
      continue;
    }

    const created = Date.parse(c.created_at);
    if (Number.isNaN(created)) continue;
    const day = Math.floor((now - created) / DAY_MS);
    if (day !== 2 && day !== 5) continue;

    const lang = c.last_name === "EN" ? "en" : "da";
    try {
      const tpl = DRIP[day]({ lang, unsubUrl: unsubUrlFor(c.email) });
      await sendMail({ to: c.email, subject: tpl.subject, html: tpl.html });
      sent++;
    } catch (err) {
      errors.push(`${c.email}: ${err.message}`);
      console.error("Drip-fejl:", c.email, err.message);
    }
  }

  return res.status(200).json({ ok: true, contacts: contacts.length, sent, errors: errors.length });
}
