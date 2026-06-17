/**
 * QA-driver til Aevias deterministiske motor.
 *
 * Kører HELE den deterministiske kæde mod kohorter af syntetiske patienter og
 * skriver én klinisk-relevant opsummering pr. patient til results.ndjson.
 *
 * Rører ALDRIG src/ — importerer udelukkende den KOMPILEREDE dist (Node 24 kan
 * ikke resolve .js→.ts i src-testene, men dist er ren ESM .js).
 *
 *   raw (RawPatientData m. dummy PII)
 *     → deidentify(raw)                         → DeidentifiedData
 *     → classifyAll(deid.markers)               → ClassifiedMarker[]
 *     → estimateBiologicalAge(cm, age, cm)      → BiologicalAge
 *     → computeAeviaScore(cm, ctx)              → AeviaScore
 *     → buildReportDraft(raw, ctx)              → ReportDraft  (kører hele kæden + assertNoPII)
 *     → assertNoPII(draft)                      → kaster ved PII-lækage
 *
 * Brug:  node qa/run-cohort.mjs
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

import {
  deidentify,
  classifyAll,
  estimateBiologicalAge,
  computeAeviaScore,
  buildReportDraft,
  assertNoPII,
} from "../dist/src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COHORT_DIR = join(__dirname, "cohort");
const RESULTS_PATH = join(__dirname, "results.ndjson");

/**
 * Bygger RawPatientData med dummy PII (name/cpr/email) ud fra en kohort-patient.
 * Markørerne får sex/age påført pr. markør, hvis det mangler i kohort-filen, så
 * klassificeringen altid har det den behøver (kønsspecifikke bånd).
 */
function toRawPatient(p) {
  const age = p.age;
  const sex = p.sex;
  const markers = (p.markers ?? []).map((m) => ({
    id: m.id,
    value: m.value,
    unit: m.unit,
    sex: m.sex ?? sex,
    age: m.age ?? age,
  }));
  return {
    name: "QA Testperson",
    cpr: "000000-0000",
    email: "qa@example.invalid",
    age,
    sex,
    markers,
  };
}

/** Standard score-kontekst: baseline (første test) — ren markør-score. */
function scoreContextFor(p) {
  // Tillad at en kohort-patient overstyrer score-konteksten (fx adherence/previous).
  if (p._scoreContext && typeof p._scoreContext === "object") return p._scoreContext;
  return { baseline: true, adherence: 0 };
}

/** Tæl markører pr. status — det første en kliniker scanner. */
function statusCounts(classifiedMarkers) {
  const counts = { optimal: 0, ok: 0, watch: 0, action: 0 };
  for (const m of classifiedMarkers) {
    if (counts[m.status] != null) counts[m.status] += 1;
  }
  return counts;
}

/** Saml de datakvalitets-issues motoren rejste (ukendt markør, enhedsfejl, m.m.). */
function collectIssues(classifiedMarkers) {
  const issues = [];
  for (const m of classifiedMarkers) {
    for (const i of m.issues ?? []) {
      issues.push({ markerId: m.id, code: i.code, message: i.message });
    }
  }
  return issues;
}

/**
 * Komprimér draften til præcis de felter en kliniker skal kunne se i et review,
 * uden at tabe noget klinisk vigtigt.
 */
function summarizeDraft(draft) {
  return {
    pseudoId: draft.pseudoId,
    ageBand: draft.ageBand,
    sex: draft.sex,
    status: draft.status,
    // Status pr. markør (id → status) + samlet optælling.
    markerStatus: Object.fromEntries(draft.classifiedMarkers.map((m) => [m.id, m.status])),
    statusCounts: statusCounts(draft.classifiedMarkers),
    issues: collectIssues(draft.classifiedMarkers),
    // Lægeflagede markører (status === "action").
    flaggedForDoctor: draft.flaggedForDoctor.map((m) => ({
      id: m.id,
      value: m.value,
      unit: m.unit,
      status: m.status,
      deviation: m.deviation,
    })),
    patterns: draft.patterns.map((p) => ({
      id: p.id,
      label: p.label,
      severity: p.severity,
      markers: p.markers,
    })),
    risks: draft.risks.map((r) => ({
      id: r.id,
      label: r.label,
      severity: r.severity,
      criteria: r.criteria,
    })),
    actionPlan: draft.actionPlan.map((a) => ({ category: a.category, title: a.title })),
    biologicalAge: {
      estimatedAge: draft.biologicalAge.estimatedAge,
      available: draft.biologicalAge.available,
      confidenceInterval: draft.biologicalAge.confidenceInterval,
      method: draft.biologicalAge.method,
      inputsUsed: draft.biologicalAge.inputsUsed,
      inputsRequired: draft.biologicalAge.inputsRequired,
      biologicalAgeDisclaimer: draft.biologicalAge.biologicalAgeDisclaimer,
    },
    healthspan: { phase: draft.healthspan.phase, label: draft.healthspan.label },
    aeviaScore: {
      total: draft.aeviaScore.total,
      components: draft.aeviaScore.components,
      breakdown: draft.aeviaScore.breakdown,
      baseline: draft.aeviaScore.baseline,
    },
    percentiles: draft.percentiles,
    validation: draft.validation,
  };
}

/**
 * Kør hele kæden for én patient så realistisk som muligt. Vi kører både de
 * enkelte trin (for at fange fejl tidligt og kunne sammenligne) OG den samlede
 * buildReportDraft, der internt gentager kæden + kalder assertNoPII.
 */
function runPatient(p, index) {
  const patientId = p.id ?? `p${index}`;
  const result = {
    patientId,
    ok: false,
    trap: p._trap ?? null,
  };

  try {
    const raw = toRawPatient(p);
    const ctx = scoreContextFor(p);

    // ---- Trin for trin (realistisk pipeline) -----------------------------
    const deid = deidentify(raw);

    // Sikkerhedsnet allerede på de deidentificerede data.
    assertNoPII(deid, "DeidentifiedData");

    const classifiedMarkers = classifyAll(deid.markers);
    const biologicalAge = estimateBiologicalAge(classifiedMarkers, raw.age, classifiedMarkers);
    const aeviaScore = computeAeviaScore(classifiedMarkers, ctx);

    // ---- Samlet draft (gentager kæden internt + assertNoPII) -------------
    const draft = buildReportDraft(raw, ctx);

    // Eksplicit PII-lækage-tjek på draften (ud over draftens egen interne).
    let piiLeak = false;
    let piiLeakDetail = null;
    try {
      assertNoPII(draft, "ReportDraft");
    } catch (e) {
      piiLeak = true;
      piiLeakDetail = e instanceof Error ? e.message : String(e);
    }

    // Sanity: at de enkeltvise trin matcher draftens (deterministisk motor).
    const consistency = {
      scoreMatchesDraft: aeviaScore.total === draft.aeviaScore.total,
      bioAgeMatchesDraft: biologicalAge.estimatedAge === draft.biologicalAge.estimatedAge,
      markerCountMatchesDraft: classifiedMarkers.length === draft.classifiedMarkers.length,
    };

    result.ok = !piiLeak;
    result.piiLeak = piiLeak;
    if (piiLeakDetail) result.piiLeakDetail = piiLeakDetail;
    result.consistency = consistency;
    result.draftSummary = summarizeDraft(draft);
    return result;
  } catch (e) {
    result.ok = false;
    result.crashed = true;
    result.error = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    if (e instanceof Error && e.stack) result.errorStack = e.stack.split("\n").slice(0, 5).join("\n");
    return result;
  }
}

async function main() {
  let files;
  try {
    files = (await readdir(COHORT_DIR)).filter((f) => f.toLowerCase().endsWith(".json"));
  } catch (e) {
    console.error(`Kan ikke læse kohort-mappe ${COHORT_DIR}: ${e.message}`);
    process.exit(1);
  }
  files.sort();

  if (files.length === 0) {
    console.error(`Ingen .json-filer i ${COHORT_DIR}. Læg kohort-filer der og kør igen.`);
    process.exit(1);
  }

  const lines = [];
  let total = 0;
  let okCount = 0;
  let failCount = 0;
  let crashCount = 0;
  let piiCount = 0;
  let trapsHandled = 0;

  for (const file of files) {
    const full = join(COHORT_DIR, file);
    let cohort;
    try {
      const txt = await readFile(full, "utf8");
      cohort = JSON.parse(txt);
    } catch (e) {
      // En ulæselig kohort-fil er i sig selv et resultat værd at logge.
      const rec = { patientId: `FILE:${file}`, ok: false, crashed: true, error: `Kunne ikke parse JSON: ${e.message}` };
      lines.push(JSON.stringify(rec));
      total += 1;
      crashCount += 1;
      failCount += 1;
      console.error(`  ! ${file}: ugyldig JSON — ${e.message}`);
      continue;
    }

    if (!Array.isArray(cohort)) {
      const rec = { patientId: `FILE:${file}`, ok: false, crashed: true, error: "Kohort-fil er ikke et array af patienter." };
      lines.push(JSON.stringify(rec));
      total += 1;
      crashCount += 1;
      failCount += 1;
      console.error(`  ! ${file}: forventede et array af patienter.`);
      continue;
    }

    for (let i = 0; i < cohort.length; i++) {
      const p = cohort[i];
      const idx = `${file.replace(/\.json$/i, "")}#${i}`;
      const rec = runPatient(p, idx);
      rec.sourceFile = file;
      lines.push(JSON.stringify(rec));

      total += 1;
      if (rec.ok) okCount += 1;
      else failCount += 1;
      if (rec.crashed) crashCount += 1;
      if (rec.piiLeak) piiCount += 1;
      if (rec.trap) trapsHandled += 1;
    }
  }

  await writeFile(RESULTS_PATH, lines.join("\n") + "\n", "utf8");

  console.log("");
  console.log("=== Aevia QA-kohorte ===");
  console.log(`Filer:        ${files.length} (${files.join(", ")})`);
  console.log(`Patienter:    ${total}`);
  console.log(`  ok:         ${okCount}`);
  console.log(`  fejl:       ${failCount}`);
  console.log(`  crashes:    ${crashCount}`);
  console.log(`  PII-lækage: ${piiCount}`);
  console.log(`  med _trap:  ${trapsHandled}`);
  console.log(`Resultater:   ${RESULTS_PATH}`);

  // En PII-lækage er en kritisk fejl: returnér ikke-nul exit, så CI kan fange den.
  if (piiCount > 0) {
    console.error("KRITISK: PII-lækage fundet i mindst én draft.");
    process.exit(2);
  }
}

main().catch((e) => {
  console.error("Driver crashede uventet:", e);
  process.exit(1);
});
