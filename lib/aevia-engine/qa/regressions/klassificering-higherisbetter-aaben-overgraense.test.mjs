// REGRESSIONSTEST — KLASSIFICERING (område A): higherIsBetter-markører har en åben
//   +Infinity høj ende, så fysiologisk umulige (men finite) værdier klassificeres
//   'optimal' og maskerer indtastnings-/enheds-/decimalfejl.
//
// FUND (middel): src/reference-data.ts → bandsFor() sætter for higherIsBetter:
//     optimal[1] = +Infinity, refHigh = +Infinity, watchHigh = +Infinity.
//   Optimal-båndet bliver [optimalLow, +Inf]. src/classify.ts har ingen øvre
//   plausibilitets-grænse ud over Number.isFinite — så ENHVER finit værdi >= optimalLow
//   bliver 'optimal'. Ingen øvre værdi flages nogensinde.
//
// REPRODUKTION (verificeret mod dist/src/index.js + bekræftet mod qa/results.ndjson):
//   egfr=210 mL/min  -> 'optimal'  (reel case mixed-realistic-048; kohortens eget
//                       _trap kalder den "Umulig værdi: eGFR 210 overstiger fysiologisk
//                       maksimum (~140) … data-/decimalfejl". eGFR har def. optimalHigh=130.
//                       IKKE flagget til lægen; eneste issue = unvalidated_range.)
//   egfr=9999, hdl=50 mmol/L, omega3=99 %, vo2max=100000 -> alle 'optimal' (umuligt).
//
// FORVENTET: Implausibelt høje værdier på higherIsBetter-markører (næsten altid
//   indtastnings-/enheds-/decimalfejl) bør IKKE klassificeres 'optimal' og bør rejse
//   et datakvalitets-issue (mistænkt indtastningsfejl) ud over 'unvalidated_range'.
//   Kræver et øvre plausibilitets-loft i bandsFor()/classify.ts (afventer Judit).
//
// Denne test ASSERTER det KORREKTE udfald og FEJLER derfor p.t.

import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyMarker } from "../../dist/src/index.js";

const implausiblyHigh = [
  { id: "egfr", value: 210, unit: "mL/min", note: "reel case mixed-realistic-048 — data-/decimalfejl (loft ~120-140)" },
  { id: "egfr", value: 9999, unit: "mL/min", note: "fysiologisk umuligt" },
  { id: "hdl", value: 50, unit: "mmol/L", note: "fysiologisk umuligt (HDL ~0.7-3)" },
  { id: "omega3", value: 99, unit: "%", note: "umuligt (indeks > 100 % meningsløst)" },
  { id: "vo2max", value: 100000, unit: "ml/kg/min", note: "absurd (1e5)" },
];

for (const probe of implausiblyHigh) {
  test(`${probe.id}=${probe.value} ${probe.unit} (${probe.note}) må IKKE klassificeres 'optimal'`, () => {
    const r = classifyMarker({ id: probe.id, value: probe.value, unit: probe.unit });

    assert.notEqual(
      r.status,
      "optimal",
      `${probe.id}=${probe.value} ${probe.unit} (${probe.note}) blev klassificeret '${r.status}'. ` +
        `En fysiologisk umulig (for høj) værdi på en higherIsBetter-markør må aldrig være ` +
        `'optimal' — skyldes åben +Inf høj ende i bandsFor() + manglende øvre plausibilitets-loft i classify.ts.`,
    );

    const flags = (r.issues ?? []).filter((i) => i.code !== "unvalidated_range");
    assert.ok(
      flags.length > 0,
      `${probe.id}=${probe.value} ${probe.unit} forventes at rejse et plausibilitets-/datakvalitets-issue ` +
        `(ud over 'unvalidated_range'); ingen blev rejst. issues=${JSON.stringify(r.issues ?? [])}.`,
    );
  });
}
