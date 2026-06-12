import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyAll, classifyMarker } from "../src/classify.js";
import type { MarkerInput } from "../src/types.js";

const base = (over: Partial<MarkerInput>): MarkerInput => ({
  id: "ldl",
  value: 1.8,
  unit: "mmol/L",
  sex: "male",
  age: 45,
  ...over,
});

test("værdi i optimal-zonen → optimal", () => {
  const r = classifyMarker(base({ id: "ldl", value: 1.8 }));
  assert.equal(r.status, "optimal");
  assert.equal(r.deviation, 0); // 1.8 = midtpunkt af 1.0–2.6
  assert.equal(r.category, "hjerte");
});

test("lowerIsBetter: under optimalLow er stadig optimalt (LDL 0.5)", () => {
  assert.equal(classifyMarker(base({ id: "ldl", value: 0.5 })).status, "optimal");
});

test("eskalerende LDL: ok → watch → action", () => {
  assert.equal(classifyMarker(base({ id: "ldl", value: 3.0 })).status, "ok");
  assert.equal(classifyMarker(base({ id: "ldl", value: 4.0 })).status, "watch");
  assert.equal(classifyMarker(base({ id: "ldl", value: 6.0 })).status, "action");
});

test("kønsspecifik zone: testosteron 1.5 er optimal for kvinde, action for mand", () => {
  assert.equal(classifyMarker(base({ id: "testosteron", unit: "nmol/L", value: 1.5, sex: "female" })).status, "optimal");
  assert.equal(classifyMarker(base({ id: "testosteron", unit: "nmol/L", value: 1.5, sex: "male" })).status, "action");
});

test("ukendt markør gætter aldrig — flagges som action + issue", () => {
  const r = classifyMarker(base({ id: "findes-ikke" }));
  assert.equal(r.status, "action");
  assert.ok(r.issues?.some((i) => i.code === "unknown_marker"));
});

test("forkert enhed flagges (men værdien afvises ikke)", () => {
  const r = classifyMarker(base({ id: "ldl", value: 1.8, unit: "mg/dL" }));
  assert.ok(r.issues?.some((i) => i.code === "unit_mismatch"));
});

test("udledt (uvalideret) interval flagges til Judit", () => {
  const r = classifyMarker(base({ id: "ldl", value: 1.8 }));
  assert.ok(r.issues?.some((i) => i.code === "unvalidated_range"));
});

test("classifyAll bevarer rækkefølge og antal", () => {
  const out = classifyAll([base({ id: "ldl" }), base({ id: "hdl", value: 1.5 })]);
  assert.equal(out.length, 2);
  assert.equal(out[0]!.id, "ldl");
  assert.equal(out[1]!.id, "hdl");
});
