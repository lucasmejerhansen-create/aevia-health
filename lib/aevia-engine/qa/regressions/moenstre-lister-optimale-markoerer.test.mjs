// Regression C-10 — KLINISKE MØNSTRE & RISICI: mønstre modsiger markør-statusserne
//
// Rubrik (område C): "Kliniske mønstre & risici: modsiger risiko-flag/mønstre
//   markør-statusserne, udløses de fejlagtigt, eller mangler de?"
//
// FUND (høj): 'Forhøjet systemisk inflammation' og 'fedtlever' lister markører som
//   forhøjede i 'markers'-feltet, selvom deres status er 'optimal'/'ok' (vildledende
//   evidens-liste). Detaljen siger "Flere inflammationsmarkører er forhøjede samtidig"
//   / "Forhøjede leverenzymer", men de listede markører er reelt inden for optimal.
//
// ÅRSAG:
//   - src/clinical.ts present() (l.38-40) returnerer ALLE markører der findes i
//     panelet, uafhængigt af om de er isHigh. Bruges i 'markers' for alle mønstre
//     (l.51, 56, 61, 66, 71).
//   - Kombineret med isHigh-tærsklen ved optimalHigh (hscrp optimal=1,0;
//     fibrinogen optimal=3,0; sr optimal=10) udløses mønsteret af akkurat-over-
//     optimal-værdier der stadig er inden for reference (status 'ok').
//   - For inflammation mangler desuden en klinisk tærskel: hs-CRP=1,2 mg/L er
//     lav-/moderat risiko (AHA: <1 lav, 1-3 moderat), ikke "forhøjet systemisk
//     inflammation". Et inflammationsmønster bør kræve klinisk forhøjelse
//     (fx hs-CRP ≥3 mg/L).
//
// REELLE KOHORT-CASES (qa/results.ndjson joinet mod qa/cohort/*.json):
//   - metabolic-015 (male, 50): hscrp=1,2 (ok), fibrinogen=2,4 (OPTIMAL),
//       sr=12 (ok) -> 'inflammation' fyrer og lister fibrinogen (optimal).
//   - healthy-older-027 (female, 78): hscrp=1,2 (ok), fibrinogen=3,5 (ok),
//       sr=10 (OPTIMAL) -> 'inflammation' fyrer og lister sr (optimal).
//   - healthy-older-005 (male, 69): alat=26 (optimal), ggt=41 (ok), trig=0,5
//       (optimal), fedtprocent=20,1 (ok), taljemaal=76 (optimal) -> 'fatty_liver'
//       fyrer og lister 3 optimale markører; reelt normal lever + kropskomposition.
//
// Denne test ASSERTER det KORREKTE (forventede) udfald og FEJLER derfor p.t.:
//   1) present()/markers må kun liste markører der faktisk er forhøjede (isHigh).
//   2) Inflammationsmønsteret må ikke udløses af hs-CRP=1,2 mg/L (klinisk lav/moderat).
//   3) Fedtlever-mønsteret må ikke fyre når kun akkurat-over-optimal (status 'ok')
//      driver det og resten er optimale (reelt normal profil).

import { test } from "node:test";
import assert from "node:assert/strict";

import { classifyAll, detectPatterns } from "../../dist/src/index.js";

// Hjælper: er en markør reelt over sit optimale bånd? (samme semantik som isHigh)
function isHigh(cm, id) {
  const m = cm.find((x) => x.id === id);
  return !!m && Number.isFinite(m.value) && m.value > m.optimal[1];
}

// --- metabolic-015: inflammation lister fibrinogen (optimal) ----------------
test("C-10: inflammation må ikke liste fibrinogen i 'markers' når fibrinogen er optimal (metabolic-015)", () => {
  const cm = classifyAll(
    [
      { id: "hscrp", value: 1.2, unit: "mg/L", sex: "male", age: 50 },
      { id: "fibrinogen", value: 2.4, unit: "g/L", sex: "male", age: 50 },
      { id: "sr", value: 12, unit: "mm/t", sex: "male", age: 50 },
    ],
    "male",
    50,
  );

  const fib = cm.find((m) => m.id === "fibrinogen");
  assert.equal(fib.status, "optimal", "forudsætning: fibrinogen=2,4 er optimal");

  const infl = detectPatterns(cm).find((p) => p.id === "inflammation");
  if (infl) {
    // markers-feltet må kun indeholde reelt forhøjede markører.
    const wronglyListed = infl.markers.filter((id) => !isHigh(cm, id));
    assert.deepEqual(
      wronglyListed,
      [],
      `'markers' lister ikke-forhøjede markører (modsiger detaljen 'forhøjede samtidig'): ${JSON.stringify(infl.markers)}`,
    );
  }
});

// --- healthy-older-027: inflammation lister sr (optimal) --------------------
test("C-10: inflammation må ikke liste sr i 'markers' når sr er optimal (healthy-older-027)", () => {
  const cm = classifyAll(
    [
      { id: "hscrp", value: 1.2, unit: "mg/L", sex: "female", age: 78 },
      { id: "fibrinogen", value: 3.5, unit: "g/L", sex: "female", age: 78 },
      { id: "sr", value: 10, unit: "mm/t", sex: "female", age: 78 },
    ],
    "female",
    78,
  );

  const sr = cm.find((m) => m.id === "sr");
  assert.equal(sr.status, "optimal", "forudsætning: sr=10 er optimal (= øvre optimal-grænse)");

  const infl = detectPatterns(cm).find((p) => p.id === "inflammation");
  if (infl) {
    const wronglyListed = infl.markers.filter((id) => !isHigh(cm, id));
    assert.deepEqual(
      wronglyListed,
      [],
      `'markers' lister ikke-forhøjede markører: ${JSON.stringify(infl.markers)}`,
    );
  }
});

// --- Inflammation: klinisk tærskel — hs-CRP=1,2 er ikke "forhøjet systemisk" -
test("C-10: hs-CRP=1,2 mg/L (lav/moderat AHA-risiko) må ikke udløse 'Forhøjet systemisk inflammation'", () => {
  // metabolic-015-profil: ingen markør er klinisk forhøjet (hs-CRP < 3 mg/L).
  const cm = classifyAll(
    [
      { id: "hscrp", value: 1.2, unit: "mg/L", sex: "male", age: 50 },
      { id: "fibrinogen", value: 2.4, unit: "g/L", sex: "male", age: 50 },
      { id: "sr", value: 12, unit: "mm/t", sex: "male", age: 50 },
    ],
    "male",
    50,
  );

  const patterns = detectPatterns(cm);
  assert.ok(
    !patterns.some((p) => p.id === "inflammation"),
    `'inflammation' udløst ved hs-CRP=1,2 mg/L; forventede klinisk tærskel (fx hs-CRP ≥3). Fik: [${patterns.map((p) => p.id).join(", ")}]`,
  );
});

// --- healthy-older-005: fedtlever på en reelt normal profil ----------------
test("C-10: 'Muligt fedtlever-mønster' må ikke udløses på normal lever/kropskomposition (healthy-older-005)", () => {
  const cm = classifyAll(
    [
      { id: "alat", value: 26, unit: "U/L", sex: "male", age: 69 },
      { id: "ggt", value: 41, unit: "U/L", sex: "male", age: 69 },
      { id: "triglycerid", value: 0.5, unit: "mmol/L", sex: "male", age: 69 },
      { id: "fedtprocent", value: 20.1, unit: "%", sex: "male", age: 69 },
      { id: "taljemaal", value: 76, unit: "cm", sex: "male", age: 69 },
    ],
    "male",
    69,
  );

  const fl = detectPatterns(cm).find((p) => p.id === "fatty_liver");

  // Hvis mønsteret overhovedet fyrer, må 'markers' kun liste reelt forhøjede.
  if (fl) {
    const wronglyListed = fl.markers.filter((id) => !isHigh(cm, id));
    assert.deepEqual(
      wronglyListed,
      [],
      `fedtlever 'markers' lister optimale markører (modsiger 'Forhøjede leverenzymer'): ${JSON.stringify(fl.markers)}`,
    );
  }
});
