import type { ClassificationIssue, ClassifiedMarker, MarkerInput, MarkerStatus } from "./types.js";
import { bandsFor, markerById, markerForSex } from "./reference-data.js";
import { convertToCanonical } from "./units.js";

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
      optimal: [0, 0],
      reference: [null, null],
      explanation: "Ukendt markør — ikke i Aevias validerede panel. Skal afklares manuelt.",
      issues: [{ code: "unknown_marker", message: `Markør-id '${input.id}' findes ikke i panelet.` }],
    };
  }

  const def = markerForSex(base, input.sex);

  if (!Number.isFinite(input.value)) {
    issues.push({ code: "non_finite_value", message: "Værdien er ikke et endeligt tal." });
  }

  // Enheds-sikkerhed: en forkert enhed kan vende en hel klassificering. Kendte
  // fremmede enheder konverteres til kanonisk; ukendte flagges (aldrig gættet).
  const conv = convertToCanonical(def.id, input.value, input.unit, def.unit);
  let value = conv.value;
  if (conv.status === "converted") {
    issues.push({
      code: "unit_converted",
      message: `Konverteret fra '${conv.from}' → '${def.unit}' (×${conv.factor}${conv.offset ? ` ${conv.offset > 0 ? "+" : ""}${conv.offset}` : ""}).`,
    });
  } else if (conv.status === "unmatched") {
    issues.push({
      code: "unit_mismatch",
      message: `Ukendt enhed '${conv.from}' (forventet '${def.unit}') — værdien er IKKE konverteret.`,
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
  if (!Number.isFinite(value)) {
    status = "action"; // ubrugelig værdi → menneske skal se på det
  } else if (inRange(value, bands.optimal[0], bands.optimal[1])) {
    status = "optimal";
  } else if (inRange(value, bands.reference[0], bands.reference[1])) {
    status = "ok";
  } else if (inRange(value, bands.watch[0], bands.watch[1])) {
    status = "watch";
  } else {
    status = "action";
  }

  const fin = (x: number): number | null => (Number.isFinite(x) ? x : null);
  const result: ClassifiedMarker = {
    id: def.id,
    value, // kanonisk værdi (evt. konverteret fra fremmed enhed)
    // Ved ukendt enhed beholdes den rå enhed, så værdien ikke fejlmærkes kanonisk.
    unit: conv.status === "unmatched" ? (input.unit || def.unit) : def.unit,
    status,
    category: def.category,
    deviation: deviationFromOptimalMid(value, def.optimalLow, def.optimalHigh),
    optimal: [def.optimalLow, def.optimalHigh], // sex-justeret (markerForSex)
    reference: [fin(bands.reference[0]), fin(bands.reference[1])],
    explanation: def.explainer,
  };
  if (conv.status === "converted") result.converted = { from: input.value, unit: conv.from };
  if (issues.length > 0) result.issues = issues;
  return result;
}

export function classifyAll(inputs: MarkerInput[]): ClassifiedMarker[] {
  return inputs.map(classifyMarker);
}
