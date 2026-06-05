// Aevia — GET /api/slots?area=<område>
// Returnerer ledige tider for et område: { ready, days:[{date,times:[...]}], areas:[...] }
// Uden ?area returneres listen over områder + deres ready-status (til frontend-init).

import { AREAS, availability, isConfigured } from "./_booking-store.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const area = req.query.area ? String(req.query.area) : "";

    if (!area) {
      const areas = Object.keys(AREAS).map((name) => ({
        name, ready: !!AREAS[name].ready, lat: AREAS[name].lat, lng: AREAS[name].lng,
      }));
      return res.status(200).json({ configured: isConfigured(), areas });
    }

    if (!AREAS[area]) return res.status(404).json({ error: "Ukendt område" });
    const data = await availability(area);
    return res.status(200).json({ configured: isConfigured(), area, ...data });
  } catch (err) {
    console.error("slots-fejl:", err.message);
    return res.status(500).json({ error: "Kunne ikke hente tider" });
  }
}
