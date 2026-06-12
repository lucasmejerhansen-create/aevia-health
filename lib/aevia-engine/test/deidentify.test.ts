import { test } from "node:test";
import assert from "node:assert/strict";
import { ageBandOf, assertNoPII, deidentify } from "../src/deidentify.js";
import type { RawPatientData } from "../src/types.js";

const raw: RawPatientData = {
  name: "Lucas Hansen",
  cpr: "010180-1234",
  email: "lucas@example.com",
  age: 52,
  sex: "male",
  markers: [{ id: "ldl", value: 1.8, unit: "mmol/L", sex: "male", age: 52 }],
};

test("aldersbånd: 5-års spand", () => {
  assert.equal(ageBandOf(52), "50-54");
  assert.equal(ageBandOf(50), "50-54");
  assert.equal(ageBandOf(49), "45-49");
});

test("deidentify fjerner navn, CPR og mail", () => {
  const d = deidentify(raw);
  const keys = Object.keys(d);
  assert.ok(!keys.includes("name") && !keys.includes("cpr") && !keys.includes("email"));
  assert.equal(d.ageBand, "50-54");
  assert.equal(d.sex, "male");
  assert.equal(d.markers.length, 1);
  // Hele objektet må ikke indeholde PII-værdier nogen steder.
  const json = JSON.stringify(d);
  assert.ok(!json.includes("Lucas") && !json.includes("010180") && !json.includes("@example"));
});

test("pseudoId er tilfældig — ingen kobling til CPR, unik pr. kald", () => {
  const a = deidentify(raw);
  const b = deidentify(raw);
  assert.notEqual(a.pseudoId, b.pseudoId);
  assert.ok(!a.pseudoId.includes("010180"));
  assert.match(a.pseudoId, /^[0-9a-f-]{36}$/);
});

test("assertNoPII kaster på PII-nøgler og passerer rene objekter", () => {
  assert.throws(() => assertNoPII({ cpr: "x" }), /PII-lækage/);
  assert.throws(() => assertNoPII({ nested: { email: "x" } }), /PII-lækage/);
  assert.doesNotThrow(() => assertNoPII(deidentify(raw)));
});
