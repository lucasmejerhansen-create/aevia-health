// Regression C-11 — KLINISKE MØNSTRE & RISICI: 'hypothyroid' fyrer (severity 'action')
//   på et euthyroidt panel inden for referenceinterval.
//
// Rubrik (område C): "Kliniske mønstre & risici: modsiger risiko-flag/mønstre
//   markør-statusserne, udløses de fejlagtigt, eller mangler de?"
//
// FUND (høj): 'hypothyroid'-mønsteret udløses med severity 'action' ("bør vurderes
//   af læge") på paneler hvor TSH, frit T4 og frit T3 ALLE er inden for lab-reference
//   (status 'ok'/'optimal') og klinisk euthyroide. severity 'action' er særligt
//   problematisk: det driver patienten til lægekontakt på normale stofskifteprøver.
//
// ÅRSAG (src/clinical.ts detectPatterns, l.68-72):
//   - hi("tsh") = isHigh = value > optimal[1]. For TSH er optimalHigh=2,5
//     (reference-data.ts l.151), så TSH > 2,5 tæller som "forhøjet" — men det er
//     optimal-zonens kant, ikke laboratoriets øvre grænse (~4,0-4,5 mIU/L).
//   - lo("ft4")/lo("ft3") = isLow = value < optimal[0]. ft4 optimalLow=12 (l.152),
//     ft3 optimalLow=4,0 (l.153) — også optimal-kanter, ikke under reference.
//   - severity er hårdkodet 'action'.
//   Etablerede kriterier for (subklinisk) hypothyreose kræver TSH OVER lab-øvre-
//   grænse sammen med ft4 UNDER reference — ikke blot under optimal.
//
// REELLE KOHORT-CASES (qa/results.ndjson joinet mod qa/cohort/*.json) —
//   verificeret ved at køre den kompilerede motor (dist/, identisk med src/):
//   - boundary-018 (female, 55): tsh=3,1 (ok, reference≈[,3.125]),
//       ft4=11 (ok, reference [9,25]), ft3=3,9 (ok, reference [3,7.5])
//       -> 'hypothyroid' fyrer med severity 'action'. Alle 3 inden for reference;
//       klinisk euthyroid (ikke engang subklinisk: TSH 3,1 < ~4,0-4,5).
//   - healthy-older-004 (female, 79): tsh=2,9 (ok), ft4=16 (OPTIMAL), ft3=3,7 (ok)
//       -> 'hypothyroid' fyrer med severity 'action' selvom ft4 er decideret optimal.
//
// Denne test ASSERTER det KORREKTE (forventede) udfald og FEJLER derfor p.t.:
//   1) Et euthyroidt panel inden for reference må IKKE udløse 'hypothyroid'.
//   2) Hvis mønsteret overhovedet skal kunne fyre på sådanne grænseværdier, må det
//      i hvert fald ikke gøre det med severity 'action' (= søg-læge).
//   Fix kræver kliniske tærskler (TSH over lab-øvre-grænse + ft4 under reference)
//   og evt. nedjusteret severity — afventer Judits validering.

import { test } from "node:test";
import assert from "node:assert/strict";

import { classifyAll, detectPatterns } from "../../dist/src/index.js";

// boundary-018: alle thyroid-markører inden for reference (status 'ok') ----------
test("C-11: euthyroidt panel inden for reference (boundary-018) må ikke udløse 'hypothyroid'", () => {
  const cm = classifyAll(
    [
      { id: "tsh", value: 3.1, unit: "mIU/L", sex: "female", age: 55 },
      { id: "antitpo", value: 45, unit: "kIU/L", sex: "female", age: 55 },
      { id: "ft4", value: 11, unit: "pmol/L", sex: "female", age: 55 },
      { id: "ft3", value: 3.9, unit: "pmol/L", sex: "female", age: 55 },
    ],
    "female",
    55,
  );

  // Forudsætning: ingen thyroid-markør er klassificeret som klinisk afvigende.
  for (const id of ["tsh", "ft4", "ft3"]) {
    const m = cm.find((x) => x.id === id);
    assert.ok(
      m.status === "ok" || m.status === "optimal",
      `forudsætning: ${id}=${m.value} forventes 'ok'/'optimal' (inden for reference), fik '${m.status}'`,
    );
  }

  const hypo = detectPatterns(cm).find((p) => p.id === "hypothyroid");
  assert.equal(
    hypo,
    undefined,
    `'hypothyroid' udløst på euthyroidt panel inden for reference (tsh=3,1/ft4=11/ft3=3,9). ` +
      `Forventede ingen mønster; etableret kriterium er TSH over lab-øvre-grænse + ft4 under reference.`,
  );
});

// healthy-older-004: ft4 er decideret OPTIMAL — endnu tydeligere falsk-positiv ---
test("C-11: 'hypothyroid' må ikke fyre når ft4 er optimal (healthy-older-004)", () => {
  const cm = classifyAll(
    [
      { id: "tsh", value: 2.9, unit: "mIU/L", sex: "female", age: 79 },
      { id: "antitpo", value: 11, unit: "kIU/L", sex: "female", age: 79 },
      { id: "ft4", value: 16, unit: "pmol/L", sex: "female", age: 79 },
      { id: "ft3", value: 3.7, unit: "pmol/L", sex: "female", age: 79 },
    ],
    "female",
    79,
  );

  const ft4 = cm.find((m) => m.id === "ft4");
  assert.equal(ft4.status, "optimal", "forudsætning: ft4=16 er optimal");

  const hypo = detectPatterns(cm).find((p) => p.id === "hypothyroid");
  assert.equal(
    hypo,
    undefined,
    `'hypothyroid' udløst selvom ft4=16 er optimal (tsh=2,9/ft3=3,7 inden for reference).`,
  );
});

// severity-kontrakt: hvis mønsteret fyrer på grænseværdier må det ikke være 'action'
test("C-11: 'hypothyroid' på et euthyroidt panel må aldrig have severity 'action' (søg-læge)", () => {
  const cm = classifyAll(
    [
      { id: "tsh", value: 3.1, unit: "mIU/L", sex: "female", age: 55 },
      { id: "ft4", value: 11, unit: "pmol/L", sex: "female", age: 55 },
      { id: "ft3", value: 3.9, unit: "pmol/L", sex: "female", age: 55 },
    ],
    "female",
    55,
  );

  const hypo = detectPatterns(cm).find((p) => p.id === "hypothyroid");
  if (hypo) {
    assert.notEqual(
      hypo.severity,
      "action",
      `'hypothyroid' har severity 'action' på et panel inden for reference — driver lægekontakt på normale prøver.`,
    );
  }
});
