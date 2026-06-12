import { test } from "node:test";
import assert from "node:assert/strict";
import { buildReportDraft } from "../src/draft.js";
import type { RawPatientData } from "../src/types.js";

const raw: RawPatientData = {
  name: "Lucas Hansen",
  cpr: "010180-1234",
  email: "lucas@example.com",
  age: 52,
  sex: "male",
  markers: [
    { id: "ldl", value: 6.0, unit: "mmol/L", sex: "male", age: 52 }, // action
    { id: "hdl", value: 1.5, unit: "mmol/L", sex: "male", age: 52 }, // optimal
    { id: "hba1c", value: 32, unit: "mmol/mol", sex: "male", age: 52 }, // optimal
  ],
};

test("draft har låst status og disclaimer", () => {
  const d = buildReportDraft(raw, { adherence: 0.8 });
  assert.equal(d.status, "draft_pending_doctor");
  assert.equal(d.biologicalAgeDisclaimer, true);
  assert.equal(d.classifiedMarkers.length, 3);
});

test("draft indeholder ALDRIG PII", () => {
  const d = buildReportDraft(raw, { adherence: 0.8 });
  const json = JSON.stringify(d);
  assert.ok(!json.includes("Lucas"));
  assert.ok(!json.includes("010180"));
  assert.ok(!json.includes("@example"));
  assert.equal((d as unknown as Record<string, unknown>).age, undefined);
  assert.equal(d.ageBand, "50-54");
});

test("alle action-markører løftes til lægen", () => {
  const d = buildReportDraft(raw, { adherence: 0.8 });
  assert.equal(d.flaggedForDoctor.length, 1);
  assert.equal(d.flaggedForDoctor[0]!.id, "ldl");
  assert.equal(d.flaggedForDoctor[0]!.status, "action");
});

test("score og biologisk alder er med i draften", () => {
  const d = buildReportDraft(raw, { adherence: 0.8 });
  assert.ok(d.aeviaScore.total >= 0 && d.aeviaScore.total <= 100);
  assert.equal(d.biologicalAge.biologicalAgeDisclaimer, true);
  assert.equal(d.biologicalAge.confidenceInterval.length, 2);
});
