import type { ClassifiedMarker, RawPatientData, ReportDraft } from "./types.js";
import { classifyAll } from "./classify.js";
import { estimateBiologicalAge } from "./bio-age.js";
import { computeAeviaScore, type ScoreContext } from "./score.js";
import { assertNoPII, deidentify } from "./deidentify.js";

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
  // Biologisk alder må bruge kronologisk alder i selve beregningen (PhenoAge),
  // men kun ESTIMATET (+ interval) føres videre — aldrig den præcise alder.
  const biologicalAge = estimateBiologicalAge(raw.markers, raw.age, classifiedMarkers);

  const flaggedForDoctor = classifiedMarkers.filter((m) => m.status === "action");

  const draft: ReportDraft = {
    pseudoId: deid.pseudoId,
    ageBand: deid.ageBand,
    sex: deid.sex,
    classifiedMarkers,
    aeviaScore,
    biologicalAge,
    flaggedForDoctor,
    status: "draft_pending_doctor",
    biologicalAgeDisclaimer: true,
  };

  // Sidste sikkerhedsnet før draften kan nå AI-laget.
  assertNoPII(draft, "ReportDraft");
  return draft;
}
