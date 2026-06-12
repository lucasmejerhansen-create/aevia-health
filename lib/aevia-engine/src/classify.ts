import type { ClassificationIssue, ClassifiedMarker, MarkerInput, MarkerStatus } from "./types.js";
import { bandsFor, markerById, markerForSex } from "./reference-data.js";

/**
 * TRIN 2 — DETERMINISTISK KLASSIFICERING.
 *
 * AI rører ALDRIG dette lag. Status afgøres udelukkende af referenceintervaller
 * og optimal-zoner i reference-data.ts. Output fodrer AI-formuleringen — men
 * AI må aldrig ændre `status`.
 *
 * Fire tilstande:
 *   optimal → inden for optimal-zonen (retningsbestemt: lav/høj side kan være "fri")
 *   ok      → inden for referenceintervallet, men uden for optimal-zonen
 *   watch   → let afvigende — uden for reference, inden for watch-bånd
 *   action  → klinisk signifikant afvigelse — kræver lægehandling
 */

function inRange(value: number, low: number, high: number): boolean {
  return value >= low && value <= high;
}

/**
 * % afvigelse fra midtpunktet af optimal-zonen. Positiv = over midten.
 * Bruges som formidlingstal, ikke til klassificering.
 */
function deviationFromOptimalMid(value: number, low: number, high: number): number {
  const mid = (low + high) / 2;
  const half = (high - low) / 2 || Math.abs(mid) || 1;
  return Math.round(((value - mid) / half) * 100);
}

export function classifyMarker(input: MarkerInput): ClassifiedMarker {
  const issues: ClassificationIssue[] = [];
  const base = markerById(input.id);

  if (!base) {
    // Ukendt markør: vi gætter ALDRIG. Løftes som datakvalitetsproblem.
    return {
      id: input.id,
      value: input.value,
      status: "action",
      category: "fysiologi",
      deviation: 0,
      explanation: "Ukendt markør — ikke i Aevias validerede panel. Skal afklares manuelt.",
      issues: [{ code: "unknown_marker", message: `Markør-id '${input.id}' findes ikke i panelet.` }],
    };
  }

  const def = markerForSex(base, input.sex);

  if (!Number.isFinite(input.value)) {
    issues.push({ code: "non_finite_value", message: "Værdien er ikke et endeligt tal." });
  }
  // Enheds-sikkerhed: en forkert enhed kan vende en hel klassificering. Vi afviser
  // ikke værdien, men flagger den, så lægen ser uoverensstemmelsen.
  if (input.unit && input.unit !== def.unit) {
    issues.push({
      code: "unit_mismatch",
      message: `Forventet enhed '${def.unit}', modtog '${input.unit}'.`,
    });
  }

  const bands = bandsFor(def, input.sex);
  if (!bands.validated) {
    issues.push({
      code: "unvalidated_range",
      message: "Referenceinterval er udledt, ikke lægefagligt valideret (afventer Judit).",
    });
  }

  let status: MarkerStatus;
  if (!Number.isFinite(input.value)) {
    status = "action"; // ubrugelig værdi → menneske skal se på det
  } else if (inRange(input.value, bands.optimal[0], bands.optimal[1])) {
    status = "optimal";
  } else if (inRange(input.value, bands.reference[0], bands.reference[1])) {
    status = "ok";
  } else if (inRange(input.value, bands.watch[0], bands.watch[1])) {
    status = "watch";
  } else {
    status = "action";
  }

  const result: ClassifiedMarker = {
    id: def.id,
    value: input.value,
    status,
    category: def.category,
    deviation: deviationFromOptimalMid(input.value, def.optimalLow, def.optimalHigh),
    explanation: def.explainer,
  };
  if (issues.length > 0) result.issues = issues;
  return result;
}

export function classifyAll(inputs: MarkerInput[]): ClassifiedMarker[] {
  return inputs.map(classifyMarker);
}
