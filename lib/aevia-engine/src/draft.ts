import type { ClassifiedMarker, RawPatientData, ReportDraft } from "./types.js";
import { classifyAll } from "./classify.js";
import { estimateBiologicalAge } from "./bio-age.js";
import { computeAeviaScore, type ScoreContext } from "./score.js";
import { assertNoPII, deidentify } from "./deidentify.js";
import { percentileFor, PERCENTILE_MARKERS } from "./percentiles.js";

/**
 * TRIN 7 — STRUKTURERET DRAFT klar til AI-formulering + lægegodkendelse.
 *
 * Kæder hele den deterministiske pipeline sammen:
 *   raw → deidentify → classifyAll → score + biologisk alder → draft.
 *
 * Resultatet indeholder ALDRIG PII (sikret af typen OG af assertNoPII som
 * runtime-sikkerhedsnet). Det er præcis dette objekt — og kun dette — der må
 * sendes videre til AI-formulering. status er låst til 'draft_pending_doctor':
 * draften kan ikke selv springe lægen over (se pipeline.ts).
 */
export function buildReportDraft(raw: RawPatientData, ctx: ScoreContext): ReportDraft {
  const deid = deidentify(raw);

  const classifiedMarkers: ClassifiedMarker[] = classifyAll(deid.markers);
  const aeviaScore = computeAeviaScore(classifiedMarkers, ctx);
  // Biologisk alder regner på de KANONISKE (enhedskonverterede) værdier fra
  // klassificeringen — ikke rå fremmed-enheder. Kun estimatet føres videre.
  const biologicalAge = estimateBiologicalAge(classifiedMarkers, raw.age, classifiedMarkers);

  const flaggedForDoctor = classifiedMarkers.filter((m) => m.status === "action");

  // Percentil vs. aldersgruppe for fysiologiske markører — på de KANONISKE værdier.
  const percentiles: Record<string, number> = {};
  for (const id of PERCENTILE_MARKERS) {
    const m = classifiedMarkers.find((c) => c.id === id);
    if (!m) continue;
    const p = percentileFor(id, m.value, raw.age, raw.sex);
    if (p != null) percentiles[id] = p;
  }

  const draft: ReportDraft = {
    pseudoId: deid.pseudoId,
    ageBand: deid.ageBand,
    sex: deid.sex,
    classifiedMarkers,
    aeviaScore,
    biologicalAge,
    flaggedForDoctor,
    percentiles,
    status: "draft_pending_doctor",
    biologicalAgeDisclaimer: true,
  };

  // Sidste sikkerhedsnet før draften kan nå AI-laget.
  assertNoPII(draft, "ReportDraft");
  return draft;
}
