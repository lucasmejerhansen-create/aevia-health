// Aevia — lægegodkendelse (pipeline-overgang).
//   POST /api/approve-report { token, status, event:"doctor_approve"|"doctor_reject", doctorId, note }
//        → { status: nyTilstand, doctorId, at }
//
// Selve gate-logikken (doctor_approve KRÆVER doctorId; ingen genvej til
// approved_for_release) ligger i motoren (nextState i _engine.mjs) — single
// source of truth. Beskyttes af ADMIN_TOKEN. Bruges af admin-rapport.html.
import crypto from "crypto";
import { tooManyFails, bearerToken, doctorFor, doctorTokensConfigured } from "./_ratelimit.js";
import { nextState } from "./_engine.mjs";
import { setStatus } from "./_store.js";

function adminAuthed(token) {
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
  const { token, status, event, doctorId: bodyDoctorId, note, reportId } = body || {};
  const tok = bearerToken(req) || token;

  // Godkenderens doctorId udledes server-side fra en gyldig læge-token (kan ikke
  // forfalskes). Når DOCTOR_TOKENS ikke er konfigureret, falder vi tilbage til
  // ADMIN_TOKEN + klient-doctorId (uændret adfærd, så intet låses).
  const docId = doctorFor(tok);
  let doctorId = null, authOk = false;
  if (docId) { authOk = true; doctorId = docId; }
  else if (!doctorTokensConfigured() && adminAuthed(tok)) { authOk = true; doctorId = bodyDoctorId; }
  if (!authOk) { if (await tooManyFails(req, "reports")) return res.status(429).json({ error: "For mange forsøg. Prøv igen senere." }); return res.status(403).json({ error: "Adgang nægtet" }); }

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
