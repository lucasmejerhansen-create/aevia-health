// Aevia — GET /api/slots
//   ?                      → områdeliste + ydelser pr. område (til frontend-init)
//   ?area=<område>&svc=<ydelse> → ledige tider for ÉN ydelse: {ready, days, clinic}
//   ?area=<område>         → ydelses-oversigt for området (bookbar/klinik)

import { AREAS, SVC_LABELS, availability, areaServices, isConfigured } from "./_booking-store.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const area = req.query.area ? String(req.query.area) : "";
    const svc = req.query.svc ? String(req.query.svc) : "";

    if (!area) {
      const areas = await Promise.all(Object.keys(AREAS).map(async (name) => ({
        name, ready: !!AREAS[name].ready, lat: AREAS[name].lat, lng: AREAS[name].lng,
        services: await areaServices(name),
      })));
      return res.status(200).json({ configured: isConfigured(), areas, svcLabels: SVC_LABELS });
    }

    if (!AREAS[area]) return res.status(404).json({ error: "Ukendt område" });

    if (!svc) {
      return res.status(200).json({
        configured: isConfigured(), area, ready: !!AREAS[area].ready,
        services: await areaServices(area), svcLabels: SVC_LABELS,
      });
    }

    if (!SVC_LABELS[svc]) return res.status(404).json({ error: "Ukendt ydelse" });
    const data = await availability(area, svc);
    return res.status(200).json({ configured: isConfigured(), area, svc, ...data });
  } catch (err) {
    console.error("slots-fejl:", err.message);
    return res.status(500).json({ error: "Kunne ikke hente tider" });
  }
}
