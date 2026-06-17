// Aevia — klassificerings-endpoint.
//   POST /api/classify-report  { token, patient:{name,cpr,email,age,sex,markers[]}, adherence, previous? }
//        → { draft }   (pseudonymiseret ReportDraft — INGEN PII)
//   POST /api/classify-report  { token, patients:[{patient, adherence?, previous?}], adherence? }
//        → { drafts:[{ok, draft|error}] }   (batch — masseindlæsning, INGEN PII)
//
// Motoren (@aevia/engine) er bundlet til ./_engine.mjs (single source of truth i
// lib/aevia-engine). Klassificeringen er deterministisk — AI rører den aldrig.
// Beskyttes af ADMIN_TOKEN i Vercel. Bruges af admin-rapport.html.
//
// ⚠️  Ingen LIVE patientdata før DPIA + DPA-aftaler er på plads.
import crypto from "crypto";
import { tooManyFails } from "./_ratelimit.js";
import { buildReportDraft } from "./_engine.mjs";

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
  const { token, patient, patients, adherence, previous, baseline } = body || {};

  if (!authed(token)) { if (await tooManyFails(req, "reports")) return res.status(429).json({ error: "For mange forsøg. Prøv igen senere." }); return res.status(403).json({ error: "Adgang nægtet" }); }

  // ---- Batch: masseindlæsning af flere patienter ----
  if (Array.isArray(patients)) {
    if (patients.length === 0) return res.status(400).json({ error: "Tom patients-liste" });
    if (patients.length > 500) return res.status(400).json({ error: "Maks 500 patienter pr. kald" });
    const drafts = patients.map((entry) => {
      const p = entry && entry.patient ? entry.patient : entry;
      try {
        if (!p || !Array.isArray(p.markers) || p.markers.length === 0) throw new Error("Mangler markers");
        const a = entry && entry.adherence != null ? entry.adherence : adherence;
        const prev = (entry && entry.previous) || previous;
        const bl = entry && entry.baseline != null ? entry.baseline : baseline;
        const draft = buildReportDraft(p, { adherence: Number(a) || 0, ...(prev ? { previous: prev } : {}), baseline: !!bl });
        return { ok: true, draft };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    });
    return res.status(200).json({ drafts });
  }

  // ---- Enkelt patient ----
  if (!patient || !Array.isArray(patient.markers) || patient.markers.length === 0) {
    return res.status(400).json({ error: "Mangler patient.markers" });
  }
  try {
    const ctx = { adherence: Number(adherence) || 0, ...(previous ? { previous } : {}), baseline: !!baseline };
    const draft = buildReportDraft(patient, ctx);
    // draft er pseudonymiseret og PII-fri (sikret i buildReportDraft + assertNoPII).
    return res.status(200).json({ draft });
  } catch (err) {
    console.error("classify-fejl:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
