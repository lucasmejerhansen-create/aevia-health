import { test } from "node:test";
import assert from "node:assert/strict";
import { computeAeviaScore, scoreLabel } from "../src/score.js";
import type { ClassifiedMarker, MarkerStatus } from "../src/types.js";

const cm = (id: string, status: MarkerStatus, category: ClassifiedMarker["category"] = "hjerte"): ClassifiedMarker => ({
  id,
  value: 0,
  status,
  category,
  deviation: 0,
  explanation: "",
});

test("alt optimalt + fuld efterlevelse + ingen historik → 93", () => {
  const r = computeAeviaScore([cm("a", "optimal"), cm("b", "optimal")], { adherence: 1 });
  assert.equal(r.components.markers, 100);
  assert.equal(r.components.adherence, 100);
  assert.equal(r.components.momentum, 50); // neutral uden forrige test
  assert.equal(r.total, 93); // 100*.5 + 100*.35 + 50*.15 = 92.5 → 93
});

test("alt i action + ingen efterlevelse → lav score", () => {
  const r = computeAeviaScore([cm("a", "action"), cm("b", "action")], { adherence: 0 });
  assert.equal(r.components.markers, 0);
  assert.equal(r.total, 8); // 0 + 0 + 50*.15 = 7.5 → 8
});

test("momentum: forbedring siden sidste test løfter momentum til 100", () => {
  const r = computeAeviaScore([cm("a", "optimal")], { adherence: 0, previous: { a: "action" } });
  assert.equal(r.components.momentum, 100);
});

test("breakdown giver score pr. kategori", () => {
  const r = computeAeviaScore(
    [cm("a", "optimal", "hjerte"), cm("b", "action", "lever")],
    { adherence: 0.5 }
  );
  assert.equal(r.breakdown.hjerte, 100);
  assert.equal(r.breakdown.lever, 0);
});

test("baseline (første test): ren markør-score, efterlevelse + momentum udeladt", () => {
  const r = computeAeviaScore([cm("a", "optimal"), cm("b", "ok")], { adherence: 0.4, baseline: true });
  assert.equal(r.baseline, true);
  assert.equal(r.components.markers, 75); // (1 + 0.5)/2 * 100
  assert.equal(r.total, 75); // ren markør-score — efterlevelse (0.4) ignoreres
  assert.equal(r.components.adherence, null);
  assert.equal(r.components.momentum, null);
});

test("scoreLabel afspejler niveau", () => {
  assert.equal(scoreLabel(90), "Fremragende");
  assert.equal(scoreLabel(60), "På vej");
  assert.equal(scoreLabel(30), "Tid til fokus");
});
