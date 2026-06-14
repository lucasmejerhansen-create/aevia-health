// Aevia — admin til det integrerede booking-system.
//   GET  /api/admin-bookings?token=<ADMIN_TOKEN>&area=<område>&date=<YYYY-MM-DD>
//        → liste over bookinger den dag
//   POST /api/admin-bookings  { token, action:"cancel", id }
//        → aflys en booking (frigiver tiden)
//
// Beskyttes af ADMIN_TOKEN i Vercel. Bruges af admin-bookinger.html.

import { listDay, cancel, AREAS, isConfigured, waitlistPop } from "./_booking-store.js";
import { sendMail } from "./_emails.js";
import crypto from "crypto";

function authed(token) {
  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected || !token) return false;
  const a = Buffer.from(String(token));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const { token, area, date } = req.query || {};
    if (!authed(token)) return res.status(403).json({ error: "Adgang nægtet" });
    if (!isConfigured()) return res.status(200).json({ configured: false, bookings: [], areas: Object.keys(AREAS) });
    if (!area || !date) return res.status(200).json({ configured: true, bookings: [], areas: Object.keys(AREAS) });
    try {
      const bookings = (await listDay(String(area), String(date))).sort((a, b) => a.time.localeCompare(b.time));
      return res.status(200).json({ configured: true, area, date, bookings, areas: Object.keys(AREAS) });
    } catch (e) {
      console.error("admin GET-fejl:", e.message);
      return res.status(500).json({ error: "Kunne ikke hente bookinger" });
    }
  }

  if (req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
    const { token, action, id } = body || {};
    if (!authed(token)) return res.status(403).json({ error: "Adgang nægtet" });
    if (action === "cancel" && id) {
      try {
        const r = await cancel(String(id));
        // Frigivet tid → mail ventelisten (først til mølle).
        if (r.ok && process.env.RESEND_API_KEY) {
          try {
            const b = r.booking;
            const waiters = await waitlistPop(b.area);
            const SITE = process.env.SITE_URL || "https://aevia.dk";
            for (const em of waiters) {
              await sendMail({ to: em, subject: `En tid er blevet ledig i ${b.area}`,
                html: `<div style="font-family:Arial,sans-serif"><p>God nyhed — en tid er netop blevet ledig i ${b.area} (${b.date} kl. ${b.time}). Først til mølle:</p><p><a href="${SITE}/book.html" style="display:inline-block;background:#eef2f7;color:#ffffff;font-weight:bold;text-decoration:none;border-radius:999px;padding:12px 24px">Book tiden nu</a></p></div>` });
            }
          } catch (e) { console.error("Venteliste-notifikation:", e.message); }
        }
        return res.status(r.ok ? 200 : 400).json(r);
      } catch (e) {
        console.error("admin cancel-fejl:", e.message);
        return res.status(500).json({ error: "Kunne ikke aflyse" });
      }
    }
    return res.status(400).json({ error: "Ukendt handling" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
