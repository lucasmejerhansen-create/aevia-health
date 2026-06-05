// Aevia — venteliste pr. område for det integrerede booking-system.
//   POST /api/waitlist  { area, email, gotcha? }
// Når en tid aflyses (api/min-booking.js eller admin), mailes alle på listen
// automatisk ("først til mølle"), og listen tømmes.

import { waitlistAdd, AREAS, isConfigured } from "./_booking-store.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { area, email, gotcha } = body || {};

  if (gotcha) return res.status(200).json({ ok: true }); // honeypot
  if (!area || !AREAS[area]) return res.status(400).json({ error: "Ukendt område" });
  if (!email || !EMAIL_RE.test(String(email))) return res.status(400).json({ error: "Ugyldig e-mail" });
  if (!isConfigured()) return res.status(503).json({ error: "Ikke konfigureret" });

  try {
    await waitlistAdd(area, email);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Venteliste-fejl:", e.message);
    return res.status(500).json({ error: "Kunne ikke tilmelde" });
  }
}
