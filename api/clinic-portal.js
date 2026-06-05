// Aevia — klinik-portal: hver partnerklinik kan se dagens bookinger og
// blokere/frigive tider (ferie, sygdom, egne aftaler) — uden at kunne se
// andre områder.
//
//   GET  /api/clinic-portal?token=<kliniktoken>&date=<YYYY-MM-DD>
//        → { area, date, slots:[{time,status}], bookings:[...] }
//   POST /api/clinic-portal { token, action:"block"|"unblock"|"blockday", date, time? }
//
// Tokens sættes i Vercel som CLINIC_TOKENS — JSON der mapper token → område:
//   {"langtilfaeldigstreng1":"Herning-området","langtilfaeldigstreng2":"Aarhus-området"}

import { AREAS, listDay, blockedTimes, blockTime, unblockTime, slotsForDate, isConfigured } from "./_booking-store.js";

function areaForToken(token) {
  try {
    const map = JSON.parse(process.env.CLINIC_TOKENS || "{}");
    return (token && map[String(token)]) || null;
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const { token, date } = req.query || {};
    const area = areaForToken(token);
    if (!area) return res.status(403).json({ error: "Adgang nægtet" });
    if (!isConfigured()) return res.status(200).json({ configured: false, area });
    const d = String(date || new Date().toISOString().slice(0, 10));

    try {
      const all = slotsForDate(area, d);
      const bookings = (await listDay(area, d)).sort((a, b) => a.time.localeCompare(b.time));
      const blocked = new Set(await blockedTimes(area, d));
      const bookedTimes = new Set(bookings.filter((b) => b.status === "confirmed").map((b) => b.time));
      const slots = all.map((t) => ({
        time: t,
        status: bookedTimes.has(t) ? "booked" : blocked.has(t) ? "blocked" : "free",
      }));
      return res.status(200).json({ configured: true, area, date: d, slots, bookings });
    } catch (e) {
      console.error("clinic GET-fejl:", e.message);
      return res.status(500).json({ error: "Kunne ikke hente data" });
    }
  }

  if (req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
    const { token, action, date, time } = body || {};
    const area = areaForToken(token);
    if (!area) return res.status(403).json({ error: "Adgang nægtet" });
    if (!isConfigured()) return res.status(503).json({ error: "Ikke konfigureret" });
    const d = String(date || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return res.status(400).json({ error: "Ugyldig dato" });

    try {
      if (action === "block" && time) { await blockTime(area, d, String(time)); return res.status(200).json({ ok: true }); }
      if (action === "unblock" && time) { await unblockTime(area, d, String(time)); return res.status(200).json({ ok: true }); }
      if (action === "blockday") {
        for (const t of slotsForDate(area, d)) await blockTime(area, d, t);
        return res.status(200).json({ ok: true });
      }
      if (action === "unblockday") {
        for (const t of slotsForDate(area, d)) await unblockTime(area, d, t);
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ error: "Ukendt handling" });
    } catch (e) {
      console.error("clinic POST-fejl:", e.message);
      return res.status(500).json({ error: "Handlingen fejlede" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
