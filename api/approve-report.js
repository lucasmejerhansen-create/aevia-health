// Aevia — lægegodkendelse (pipeline-overgang).
//   POST /api/approve-report { token, status, event:"doctor_approve"|"doctor_reject", doctorId, note }
//        → { status: nyTilstand, doctorId, at }
//
// Selve gate-logikken (doctor_approve KRÆVER doctorId; ingen genvej til
// approved_for_release) ligger i motoren (nextState i _engine.mjs) — single
// source of truth. Beskyttes af ADMIN_TOKEN. Bruges af admin-rapport.html.
import crypto from "crypto";
import { nextState } from "./_engine.mjs";
import { setStatus } from "./_store.js";

function authed(token) {
  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected || !token) return false;
  const a = Buffer.from(String(token));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { token, status, event, doctorId, note, reportId } = body || {};
  if (!authed(token)) return res.status(403).json({ error: "Adgang nægtet" });

  try {
    const at = new Date().toISOString();
    const to = nextState(status, event, { doctorId, note, at }); // kaster hvis ulovlig / mangler doctorId
    // Hvis draften ligger i køen, persistér den nye tilstand + revisionsspor.
    if (reportId) { try { await setStatus(reportId, to, doctorId, note, at); } catch (e) { /* lager valgfrit */ } }
    return res.status(200).json({ status: to, doctorId, at });
  } catch (err) {
    // DoctorActionRequiredError / IllegalTransitionError → 400 (forventelig brugerfejl)
    return res.status(400).json({ error: err.message });
  }
}
