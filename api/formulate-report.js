// Aevia — AI-FORMULERINGSLAG.
//   POST /api/formulate-report { token, draft, lang? }
//        → { text }   (lægens prosa-udkast — KUN sprog, aldrig klassificering)
//
// KERNEPRINCIPPER:
//  - AI klassificerer ALDRIG. Klassificering, score og biologisk alder er allerede
//    bestemt deterministisk i draften. AI formulerer kun sproget bagefter.
//  - AI ser ALDRIG PII. assertNoPII() kører på draften før kaldet (hård garanti
//    oven på at draften per design er pseudonymiseret).
//  - Output er et UDKAST til lægen — ingen rapport frigives uden lægegodkendelse.
//
// Kræver ANTHROPIC_API_KEY (+ valgfri AEVIA_AI_MODEL). Uden nøgle → klar fejl.
import crypto from "crypto";
import { assertNoPII } from "./_engine.mjs";
import { tooManyFails } from "./_ratelimit.js";

function authed(token) {
  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected || !token) return false;
  const a = Buffer.from(String(token));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const SYSTEM = `Du er en medicinsk skribent for Aevia, en forebyggende helbredsplatform. Din ENESTE opgave er at FORMULERE et prosa-udkast til LÆGENS vurdering ud fra ALLEREDE klassificerede data.

ABSOLUTTE REGLER:
- Du klassificerer ALDRIG og ændrer ALDRIG tal, status, score eller biologisk alder. Brug kun det, der står i de leverede data.
- Du opfinder ALDRIG værdier, diagnoser eller anbefalinger der ikke følger af data.
- Biologisk alder omtales ALTID som et estimat med usikkerhed — aldrig som en diagnose.
- Det er et UDKAST til en læge, der gennemgår og godkender. Skriv nøgternt, fagligt og empatisk.
- Ingen personhenførbare oplysninger findes i data (kun aldersbånd + køn) — referer aldrig til navn/CPR.

Skriv: (1) en kort sammenfatning (3-5 sætninger), (2) "De vigtigste fund" som 3 punkter, (3) en kort kontekst om de flagede markører og mønstre. Hold dig til de leverede data.`;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { token, draft, lang } = body || {};
  if (!authed(token)) { if (await tooManyFails(req, "reports")) return res.status(429).json({ error: "For mange forsøg. Prøv igen senere." }); return res.status(403).json({ error: "Adgang nægtet" }); }
  if (!draft || !Array.isArray(draft.classifiedMarkers)) return res.status(400).json({ error: "Mangler draft" });

  // Hård sikkerhedskontrol: ingen PII må nå AI'en.
  try { assertNoPII(draft, "AI-formulering"); }
  catch (e) { return res.status(400).json({ error: e.message }); }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(503).json({ error: "AI ikke konfigureret — sæt ANTHROPIC_API_KEY i miljøet." });
  }

  const model = process.env.AEVIA_AI_MODEL || "claude-sonnet-4-6";
  const language = lang === "en" ? "engelsk" : "dansk";

  // Send kun det relevante, deterministisk bestemte — på kompakt form.
  const payload = {
    sprog: language,
    aldersbånd: draft.ageBand,
    køn: draft.sex,
    aeviaScore: draft.aeviaScore,
    biologiskAlder: draft.biologicalAge,
    flagedeMarkører: (draft.flaggedForDoctor || []).map((m) => ({ id: m.id, value: m.value, unit: m.unit, status: m.status })),
    mønstre: draft.patterns,
    risici: draft.risks,
    healthspan: draft.healthspan,
    markørStatusOptælling: draft.classifiedMarkers.reduce((a, m) => { a[m.status] = (a[m.status] || 0) + 1; return a; }, {}),
  };

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model,
        max_tokens: 1200,
        system: SYSTEM,
        messages: [{ role: "user", content: `Skriv udkastet på ${language} ud fra disse deterministisk bestemte data:\n\n${JSON.stringify(payload, null, 2)}` }],
      }),
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(502).json({ error: "AI-fejl: " + (data?.error?.message || resp.status) });
    const text = (data.content || []).map((c) => c.text || "").join("").trim();
    return res.status(200).json({ text, model });
  } catch (err) {
    return res.status(502).json({ error: "AI-kald fejlede: " + err.message });
  }
}
