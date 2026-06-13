/**
 * @aevia/engine — Aevias deterministiske klassificerings- og scoremotor.
 *
 * Ren, sideeffektfri TypeScript. Importeres af både website-backend (Next.js på
 * Vercel) og — via API — af Expo-app'en. AI klassificerer aldrig; lægen er sidst.
 */

export * from "./types.js";
export { MARKERS, markerById, markerForSex, markerByIdForSex, bandsFor, RANGE_MODEL, CATEGORY_ADVICE, MARKER_NAMES_EN } from "./reference-data.js";
export { percentileFor, PERCENTILE_MARKERS } from "./percentiles.js";
export type { MarkerDef, MarkerBands } from "./reference-data.js";
export { classifyMarker, classifyAll } from "./classify.js";
export { normalizeUnit, convertToCanonical, UNIT_CONVERSIONS } from "./units.js";
export { estimateBiologicalAge } from "./bio-age.js";
export { computeAeviaScore, scoreLabel } from "./score.js";
export type { ScoreContext } from "./score.js";
export { deidentify, ageBandOf, assertNoPII } from "./deidentify.js";
export {
  ReportPipeline,
  nextState,
  IllegalTransitionError,
  DoctorActionRequiredError,
} from "./pipeline.js";
export type { PipelineEvent, TransitionOptions, TransitionRecord } from "./pipeline.js";
export { buildReportDraft } from "./draft.js";
