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

test("ukendt enhed flagges som mismatch (værdien konverteres ikke)", () => {
  const r = classifyMarker(base({ id: "ldl", value: 1.8, unit: "bananer/L" }));
  assert.ok(r.issues?.some((i) => i.code === "unit_mismatch"));
  assert.equal(r.value, 1.8); // uændret
});

test("kendt fremmed enhed konverteres til kanonisk: glukose mg/dL → mmol/L", () => {
  const r = classifyMarker(base({ id: "glukose", unit: "mg/dL", value: 90 }));
  assert.ok(Math.abs(r.value - 4.995) < 0.01); // 90 × 0.0555
  assert.equal(r.status, "optimal"); // 4.2–5.4
  assert.ok(r.issues?.some((i) => i.code === "unit_converted"));
  assert.deepEqual(r.converted, { from: 90, unit: "mg/dL" }); // original bevaret til rapport
});

test("HbA1c % → mmol/mol (affin konvertering)", () => {
  const r = classifyMarker(base({ id: "hba1c", unit: "%", value: 5.0 }));
  assert.ok(Math.abs(r.value - 31.1) < 0.6); // (5−2.15)×10.929 ≈ 31.1
  assert.equal(r.status, "optimal"); // 28–35
});

test("hæmoglobin g/dL → mmol/L (DK-enhed)", () => {
  const r = classifyMarker(base({ id: "haemoglobin", unit: "g/dL", value: 15 }));
  assert.ok(Math.abs(r.value - 9.31) < 0.05); // 15 × 0.6206
  assert.equal(r.status, "optimal"); // 8.5–10.5
});

test("elektrolyt i mg/L konverteres: kalium mg/L → mmol/L", () => {
  const r = classifyMarker(base({ id: "kalium", unit: "mg/L", value: 160 }));
  assert.ok(Math.abs(r.value - 4.09) < 0.05); // 160 × 0.02558
  assert.equal(r.status, "optimal");
  assert.equal(r.unit, "mmol/L");
});

test("celletælling Mill/µl = ×10¹²/L (factor 1, intet flag)", () => {
  const r = classifyMarker(base({ id: "erytrocytter", unit: "Mill/µl", value: 5.0 }));
  assert.equal(r.value, 5.0);
  assert.ok(!r.issues?.some((i) => i.code === "unit_mismatch"));
});

test("ukonverteret værdi beholder sin rå enhed (ikke fejlmærket kanonisk)", () => {
  const r = classifyMarker(base({ id: "zink", unit: "ukendt/x", value: 6.2 }));
  assert.equal(r.unit, "ukendt/x"); // IKKE 'µmol/L'
  assert.ok(r.issues?.some((i) => i.code === "unit_mismatch"));
});

test("samme enhed konverteres ikke og flagges ikke", () => {
  const r = classifyMarker(base({ id: "glukose", unit: "mmol/L", value: 5.0 }));
  assert.equal(r.value, 5.0);
  assert.ok(!r.issues?.some((i) => i.code === "unit_converted" || i.code === "unit_mismatch"));
});

test("udledt (uvalideret) interval flagges til Judit", () => {
  const r = classifyMarker(base({ id: "ldl", value: 1.8 }));
  assert.ok(r.issues?.some((i) => i.code === "unvalidated_range"));
});

test("klassificeret markør bærer sex-justeret optimal + referenceinterval", () => {
  const r = classifyMarker(base({ id: "ldl", value: 1.8 }));
  assert.deepEqual(r.optimal, [1.0, 2.6]);
  assert.equal(r.reference[0], null); // lowerIsBetter → åben nedad
  assert.ok(typeof r.reference[1] === "number"); // øvre referencegrænse er sat
  const f = classifyMarker(base({ id: "ferritin", value: 80, sex: "female" }));
  assert.deepEqual(f.optimal, [40, 120]); // female-override
});

test("classifyAll bevarer rækkefølge og antal", () => {
  const out = classifyAll([base({ id: "ldl" }), base({ id: "hdl", value: 1.5 })]);
  assert.equal(out.length, 2);
  assert.equal(out[0]!.id, "ldl");
  assert.equal(out[1]!.id, "hdl");
});
