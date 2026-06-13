import { test } from "node:test";
import assert from "node:assert/strict";
import { estimateBiologicalAge } from "../src/bio-age.js";
import type { ClassifiedMarker, MarkerInput } from "../src/types.js";

const mk = (id: string, value: number): MarkerInput => ({ id, value, unit: "", sex: "male", age: 45 });

/** Et komplet PhenoAge-sæt (sund 45-årig). */
const fullPanel: MarkerInput[] = [
  mk("albumin", 45),
  mk("kreatinin", 80),
  mk("glukose", 5.0),
  mk("hscrp", 1.0),
  mk("lymfocytter", 2.0),
  mk("leukocytter", 6.0),
  mk("mcv", 90),
  mk("rdw", 13),
  mk("basiskfosfatase", 70),
];

test("fuldt panel → PhenoAge med endeligt estimat og disclaimer", () => {
  const r = estimateBiologicalAge(fullPanel, 45);
  assert.equal(r.method, "phenoage");
  assert.equal(r.inputsUsed, 9);
  assert.ok(Number.isFinite(r.estimatedAge));
  assert.equal(r.biologicalAgeDisclaimer, true);
});

test("usikkerhedsinterval er ordnet og omslutter estimatet", () => {
  const r = estimateBiologicalAge(fullPanel, 45);
  const [lo, hi] = r.confidenceInterval;
  assert.ok(lo < r.estimatedAge && r.estimatedAge < hi);
  assert.equal(hi - lo, 6); // ±3 ved fuldt PhenoAge
});

test("manglende input → falder tilbage til markør-heuristik (stadig disclaimer)", () => {
  const partial = fullPanel.filter((m) => m.id !== "albumin");
  const r = estimateBiologicalAge(partial, 45);
  assert.equal(r.method, "marker-heuristic");
  assert.equal(r.biologicalAgeDisclaimer, true);
  assert.ok(r.inputsUsed < 9);
});

test("heuristik: mange optimale markører → biologisk yngre end kronologisk", () => {
  const classified: ClassifiedMarker[] = Array.from({ length: 20 }, (_, i) => ({
    id: `m${i}`,
    value: 1,
    status: "optimal" as const,
    category: "hjerte" as const,
    deviation: 0,
    optimal: [0, 1] as [number, number],
    reference: [null, null] as [number | null, number | null],
    explanation: "",
  }));
  const r = estimateBiologicalAge([], 50, classified);
  assert.equal(r.method, "marker-heuristic");
  assert.ok(r.estimatedAge < 50);
});

test("manglende/ugyldig alder → intet estimat (available=false), aldrig ~0 år", () => {
  for (const badAge of [0, 10, NaN, 200]) {
    const r = estimateBiologicalAge(fullPanel, badAge);
    assert.equal(r.available, false);
    assert.equal(r.biologicalAgeDisclaimer, true);
  }
});

test("gyldig alder → available=true", () => {
  assert.equal(estimateBiologicalAge(fullPanel, 45).available, true);
});

test("disclaimer-flaget kan aldrig være false", () => {
  for (const input of [fullPanel, [], fullPanel.slice(0, 3)]) {
    assert.equal(estimateBiologicalAge(input, 40).biologicalAgeDisclaimer, true);
  }
});
