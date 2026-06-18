// Regression A-0 — KLASSIFICERING: åbne ender på retningsbestemte markører
//
// Rubrik: "A: KLASSIFICERING — bliver out-of-range værdier klassificeret optimal/ok;
//   er optimal/reference/watch/action-grænserne konsistente med directionality
//   (lavere/højere-er-bedre); fejlklassificeres åbne ender?"
//
// FUND (kritisk): Supprimeret TSH (hyperthyreose) klassificeres som 'optimal'.
// TSH er en lowerIsBetter-markør, og bandsFor() åbner hele den lave ende:
//   src/reference-data.ts (bandsFor) linje 274-277 + 299-302 sætter
//   optimal[0] = -Infinity og refLow/watchLow = -Infinity for lowerIsBetter,
//   så enhver TSH <= 2.5 (inkl. 0.001) bliver 'optimal' i
//   src/classify.ts linje 85 (inRange(value, optimal[0], optimal[1])).
// Samtidig mangler et 'hyperthyroid'-mønster i src/clinical.ts detectPatterns()
//   (kun 'hypothyroid' findes, linje 68-72), så kombinationen
//   lav TSH + høj FT4/FT3 fanges ikke som mønster.
//
// Reelle kohort-cases (qa/results.ndjson): thyroid-hormonal-019/020/021/023/025/
//   028/030/032/088/090 + trap-094 har tsh='optimal' MENS ft4/ft3='action'
//   (klassisk thyrotoksikose, TSH supprimeret 0.001-0.076 + FT4 32-58 + FT3 11.7-16.5).
//
// Denne test ASSERTER det KORREKTE (forventede) udfald og FEJLER derfor p.t.,
// indtil motoren retter directionality på TSH (bidirektionelt bånd) og tilføjer
// et 'hyperthyroid'-mønster. En markant abnorm værdi må aldrig vises som 'optimal'.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  classifyMarker,
  classifyAll,
  detectPatterns,
} from "../../dist/src/index.js";

test("A-0: stærkt supprimeret TSH må IKKE klassificeres 'optimal'", () => {
  const r = classifyMarker({ id: "tsh", value: 0.001, unit: "mIU/L", sex: "female" });
  // Forventet: mindst 'watch' (helst 'action') — aldrig 'optimal'/'ok'.
  assert.notEqual(r.status, "optimal", "TSH=0.001 må ikke være 'optimal'");
  assert.ok(
    r.status === "watch" || r.status === "action",
    `TSH=0.001 forventes 'watch'/'action', fik '${r.status}'`,
  );
});

test("A-0: klassisk thyrotoksikose (lav TSH + høj FT4/FT3) udløser 'hyperthyroid'-mønster", () => {
  // Reel case-profil: thyroid-hormonal-019/021/025 (TSH supprimeret + FT4/FT3 forhøjet).
  const cm = classifyAll([
    { id: "tsh", value: 0.001, unit: "mIU/L", sex: "female" },
    { id: "ft4", value: 58, unit: "pmol/L", sex: "female" },
    { id: "ft3", value: 15.8, unit: "pmol/L", sex: "female" },
  ]);

  // Selve TSH (vigtigste screeningsmarkør) må ikke stå 'optimal' på rapporten.
  const tsh = cm.find((m) => m.id === "tsh");
  assert.notEqual(tsh.status, "optimal", "TSH må ikke være 'optimal' ved supprimeret værdi");

  // Kombinationen skal fanges som et hyperthyreose-mønster.
  const patterns = detectPatterns(cm);
  assert.ok(
    patterns.some((p) => p.id === "hyperthyroid"),
    `forventede et 'hyperthyroid'-mønster, fik [${patterns.map((p) => p.id).join(", ")}]`,
  );
});
