// Aevia — klinik-portal: hver partnerklinik ser sine egne Aevia-tider og kan
// blokere/frigive dem (ferie, sygdom, egne aftaler).
//
//   GET  /api/clinic-portal?token=<nøgle>&date=<YYYY-MM-DD>[&svc=<ydelse>]
//   POST /api/clinic-portal { token, action:"block"|"unblock"|"blockday"|"unblockday", date, time?, svc }
//
// CLINIC_TOKENS i Vercel — JSON der mapper nøgle → adgang:
//   Hele området:      {"nøgle1":"Herning-området"}
//   Kun én ydelse:     {"nøgle2":"Herning-området:kondition"}
// (En blodklinik får fx kun blod-skemaet; et VO2max-lab kun kondition.)

import { AREAS, SVC_LABELS, listDay, blockedTimes, blockTime, unblockTime, slotsForDate, isConfigured } from "./_booking-store.js";

function accessForToken(token) {
  try {
    const map = JSON.parse(process.env.CLINIC_TOKENS || "{}");
    const v = token && map[String(token)];
    if (!v) return null;
    const [area, svc] = String(v).split(":");
    if (!AREAS[area]) return null;
    return { area, svc: svc || null }; // svc=null → alle ydelser i området
  } catch { return null; }
}

function allowedSvcs(access) {
  const svcsInArea = Object.keys(AREAS[access.area].svcs || {});
  return access.svc ? svcsInArea.filter((s) => s === access.svc) : svcsInArea;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const { token, date, svc } = req.query || {};
    const access = accessForToken(token);
    if (!access) return res.status(403).json({ error: "Adgang nægtet" });
    if (!isConfigured()) return res.status(200).json({ configured: false, area: access.area });

    const svcs = allowedSvcs(access);
    const chosen = svc && svcs.includes(String(svc)) ? String(svc) : svcs[0];
    if (!chosen) return res.status(200).json({ configured: true, area: access.area, svcs: [], slots: [], bookings: [] });
    const d = String(date || new Date().toISOString().slice(0, 10));

    try {
      const all = slotsForDate(access.area, chosen, d);
      const blocked = new Set(await blockedTimes(access.area, chosen, d));
      const dayBookings = (await listDay(access.area, d)).filter((b) => b.status === "confirmed");
      const partRows = [];
      const bookedTimes = new Set();
      for (const b of dayBookings) {
        for (const p of (b.parts || []).filter((p) => p.date === d && p.svc === chosen)) {
          bookedTimes.add(p.time);
          partRows.push({ time: p.time, customer: b.customer });
        }
      }
      const slots = all.map((t) => ({
        time: t,
        status: bookedTimes.has(t) ? "booked" : blocked.has(t) ? "blocked" : "free",
      }));
      partRows.sort((a, b) => a.time.localeCompare(b.time));
      return res.status(200).json({
        configured: true, area: access.area, svc: chosen, date: d,
        svcs: svcs.map((s) => ({ key: s, label: (SVC_LABELS[s] && SVC_LABELS[s].da) || s })),
        slots, bookings: partRows,
      });
    } catch (e) {
      console.error("clinic GET-fejl:", e.message);
      return res.status(500).json({ error: "Kunne ikke hente data" });
    }
  }

  if (req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
    const { token, action, date, time, svc } = body || {};
    const access = accessForToken(token);
    if (!access) return res.status(403).json({ error: "Adgang nægtet" });
    if (!isConfigured()) return res.status(503).json({ error: "Ikke konfigureret" });

    const svcs = allowedSvcs(access);
    const chosen = svc && svcs.includes(String(svc)) ? String(svc) : null;
    if (!chosen) return res.status(400).json({ error: "Ugyldig ydelse" });
    const d = String(date || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return res.status(400).json({ error: "Ugyldig dato" });

    try {
      if (action === "block" && time) { await blockTime(access.area, chosen, d, String(time)); return res.status(200).json({ ok: true }); }
      if (action === "unblock" && time) { await unblockTime(access.area, chosen, d, String(time)); return res.status(200).json({ ok: true }); }
      if (action === "blockday") {
        for (const t of slotsForDate(access.area, chosen, d)) await blockTime(access.area, chosen, d, t);
        return res.status(200).json({ ok: true });
      }
      if (action === "unblockday") {
        for (const t of slotsForDate(access.area, chosen, d)) await unblockTime(access.area, chosen, d, t);
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
