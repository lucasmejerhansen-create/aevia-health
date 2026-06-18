// Regression 17 — ROBUSTHED & PII: ugyldigt køn accepteres lydløst (male-fallback)
//
// Rubrik: "Robusthed og PII: crash-håndtering af fælde-input, enhedskonvertering,
//   PII-lækage til draften, og degradering ved ukendte markører / ugyldig alder /
//   tom liste."
//
// FUND (middel): Et ugyldigt køn (sex uden for 'male'|'female' — fx 'other', '',
//   undefined) accepteres lydløst og falder tilbage til MALE-båndet UDEN noget flag.
//   For kønsspecifikke markører (testosteron, ferritin, hæmoglobin) kan dette
//   fejlklassificere uden spor på rapporten.
//
// REPRODUKTION (mod kompileret dist/):
//   classifyAll([{id:'testosteron', value:15, unit:'nmol/L', sex:'other', age:40}])
//     -> status:'optimal', optimal:[15,30]  (= MALE-zonen)
//        ingen ClassificationIssue om ukendt køn.
//   Til sammenligning giver sex:'female' for samme 15 nmol/L:
//     -> status:'action', optimal:[0.7,2]   (helt anden klinisk vurdering)
//   Hæmoglobin viser direkte status-skift: sex:'other' -> 'ok' (male-fallback),
//   sex:'female' -> 'watch'. Misklassificering uden spor.
//
// ÅRSAG:
//   - src/reference-data.ts markerForSex() (linje 235-239):
//       'if (sex !== "female") return def'  -> ALT der ikke er 'female' = male.
//   - src/classify.ts: ingen validering af input.sex; kalder blot
//       markerForSex(base, input.sex) + bandsFor(def, input.sex).
//   - src/types.ts (linje 67): ClassificationIssue-code-unionen mangler 'unknown_sex'.
//   Typesystemet (Sex) er eneste værn — brydes ved runtime-data fra eksterne rapporter.
//
// FORVENTET: Et ukendt/ugyldigt køn bør rejse en datakvalitets-issue (a la
//   'unknown_marker'/'unknown_sex'), ikke lydløst antage male.
//
// Denne test ASSERTER det KORREKTE (forventede) udfald og FEJLER derfor p.t.,
// indtil motoren validerer input.sex og flagger ukendt køn med en
// ClassificationIssue (kode 'unknown_sex').

import { test } from "node:test";
import assert from "node:assert/strict";

import { classifyMarker, classifyAll } from "../../dist/src/index.js";

test("17: ugyldigt køn på testosteron flagges som datakvalitets-issue (ikke lydløs male-fallback)", () => {
  const r = classifyMarker({ id: "testosteron", value: 15, unit: "nmol/L", sex: "other", age: 40 });

  // Forventet: et eksplicit flag om ukendt/ugyldigt køn — ikke en tavs antagelse.
  const codes = (r.issues ?? []).map((i) => i.code);
  assert.ok(
    codes.includes("unknown_sex"),
    `forventede en 'unknown_sex'-issue ved sex='other', fik [${codes.join(", ") || "ingen"}]`,
  );
});

test("17: ugyldigt køn må IKKE klassificeres ved hjælp af male-båndet uden flag", () => {
  const other = classifyMarker({ id: "testosteron", value: 15, unit: "nmol/L", sex: "other", age: 40 });
  const male = classifyMarker({ id: "testosteron", value: 15, unit: "nmol/L", sex: "male", age: 40 });

  // Det er den lydløse identitet med male-zonen UDEN flag der er buggen.
  const flagged = (other.issues ?? []).some((i) => i.code === "unknown_sex");
  const silentMaleFallback =
    JSON.stringify(other.optimal) === JSON.stringify(male.optimal) &&
    other.status === male.status &&
    !flagged;

  assert.equal(
    silentMaleFallback,
    false,
    `ugyldigt køn faldt lydløst tilbage til male-bånd: optimal=${JSON.stringify(other.optimal)} status='${other.status}' uden 'unknown_sex'-flag`,
  );
});

test("17: tomt/manglende køn på kønsspecifik markør flagges (ferritin, hæmoglobin)", () => {
  // Begge er kønsspecifikke; tomt streng-køn må ikke tolkes som male i stilhed.
  for (const id of ["ferritin", "haemoglobin"]) {
    const r = classifyAll([{ id, value: 13, unit: "mmol/L", sex: "", age: 40 }])[0];
    const codes = (r.issues ?? []).map((i) => i.code);
    assert.ok(
      codes.includes("unknown_sex"),
      `${id}: forventede 'unknown_sex' ved tomt køn, fik [${codes.join(", ") || "ingen"}]`,
    );
  }
});
