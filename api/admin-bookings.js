// Aevia — admin til det integrerede booking-system.
//   GET  /api/admin-bookings?token=<ADMIN_TOKEN>&area=<område>&date=<YYYY-MM-DD>
//        → liste over bookinger den dag
//   POST /api/admin-bookings  { token, action:"cancel", id }
//        → aflys en booking (frigiver tiden)
//
// Beskyttes af ADMIN_TOKEN i Vercel. Bruges af admin-bookinger.html.

import { listDay, cancel, AREAS, isConfigured } from "./_booking-store.js";
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
