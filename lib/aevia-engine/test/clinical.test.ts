import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyAll } from "../src/classify.js";
import { detectPatterns, assessRisks, buildActionPlan, healthspanPhase, validationSummary } from "../src/clinical.js";
import type { MarkerInput } from "../src/types.js";

const mk = (id: string, value: number): MarkerInput => ({ id, value, unit: "", sex: "male", age: 50 });
const cls = (inputs: MarkerInput[]) => classifyAll(inputs);

test("metabolisk syndrom: ≥3 kriterier → action-flag", () => {
  const cm = cls([mk("taljemaal", 105), mk("triglycerid", 2.0), mk("hdl", 0.9), mk("blodtryksys", 135), mk("glukose", 5.8)]);
  const risks = assessRisks(cm, "male");
  const ms = risks.find((r) => r.id === "metabolic_syndrome");
  assert.ok(ms && ms.severity === "action");
});

test("insulinresistens: HOMA-IR ≥2.5 → action", () => {
  const risks = assessRisks(cls([mk("homair", 3.0)]), "male");
  assert.ok(risks.some((r) => r.id === "insulin_resistance"));
});

test("mønster: forhøjet ALAT + triglycerid → fedtlever", () => {
  const p = detectPatterns(cls([mk("alat", 50), mk("triglycerid", 1.6)]));
  assert.ok(p.some((x) => x.id === "fatty_liver"));
});

test("mønster: lav B12 + høj homocystein → B12-mangel", () => {
  const p = detectPatterns(cls([mk("b12", 300), mk("homocystein", 12)]));
  assert.ok(p.some((x) => x.id === "b12_deficiency"));
});

test("ingen falske mønstre ved sunde værdier", () => {
  const cm = cls([mk("alat", 25), mk("triglycerid", 0.8), mk("b12", 500), mk("homocystein", 7)]);
  assert.equal(detectPatterns(cm).length, 0);
});

test("handlingsplan: flaget markør → kategori-punkt + altid re-test", () => {
  const plan = buildActionPlan(cls([mk("ldl", 5.0)])); // action
  assert.ok(plan.some((a) => a.category === "hjerte"));
  assert.ok(plan.some((a) => a.title.indexOf("Re-test") === 0));
});

test("healthspan: høj score/0 action → optimering; lav → fokus", () => {
  assert.equal(healthspanPhase(90, 0).phase, "optimering");
  assert.equal(healthspanPhase(40, 3).phase, "fokus");
});

test("datagrundlag: udledte intervaller tælles", () => {
  const v = validationSummary(cls([mk("ldl", 2.0), mk("hdl", 1.5)]));
  assert.equal(v.total, 2);
  assert.equal(v.derived, 2); // alt er udledt indtil Judit validerer
});
