/**
 * REGRESSIONSTEST — FUND (p.t. FEJLENDE = dokumenterer aktiv bug). Sværhedsgrad: lav.
 *
 * Fuldt fund-navn (afkortet/slugified i filnavn pga. POSIX-grænser — '/' er
 * stiseparator og '.' samt hele titlen overskrider 255-byte filnavnsgrænsen):
 *   "Robusthed og PII: crash-håndtering af fælde-input, enhedskonvertering,
 *    PII-lækage til draften, og degradering ved ukendte markører / ugyldig
 *    alder / tom liste. Baseret på qa/results.ndjson (800 patienter: 0 crashes,
 *    0 PII-lækager, 1 consistency-mismatch) + direkte reproduktion mod
 *    kompileret dist/. -19"
 *
 * FUND:
 *   Tom markør-liste giver aeviaScore.total:0 + biologisk alder = kronologisk
 *   (available:true) — vildledende 'no data'-præsentation.
 *
 * Minimalt input: {age:49, sex:'male', markers:[]} (markers kan også udelades).
 * Patienter i kohorten: trap-101, trap-102.
 *
 * Reproduceret mod den byggede motor (dist/src/index.js):
 *   computeAeviaScore([], {adherence:1, baseline:true})
 *     → {total:0, components:{markers:0,...}, breakdown:{}, baseline:true}
 *     → scoreLabel(0) === "Tid til fokus"
 *   estimateBiologicalAge([], 49, [])
 *     → {estimatedAge:49 (=kronologisk), available:true,
 *        method:"marker-heuristic", inputsUsed:0, inputsRequired:9}
 *   Ingen crash, ingen division-by-zero.
 *
 * FORVENTET (denne tests asserts):
 *   En patient UDEN data må ikke fremstå som 'sundhedsscore 0 / Tid til fokus'
 *   med en selvsikker biologisk alder lig den kronologiske (available:true).
 *   - Score for tom markør-liste burde være null/N-A (markers-komponenten kan
 *     ikke beregnes uden markører), ikke et selvsikkert 0 der mapper til den
 *     værste etiket.
 *   - Bio-age burde have available:false ved inputsUsed:0 — præcis samme kontrakt
 *     som ved ugyldig alder (types.ts: "false hvis estimatet ikke kan beregnes …
 *     Så skal estimatedAge IKKE vises som et tal").
 *
 * ÅRSAG I KODEN:
 *   - src/score.ts markerScore() (l.46-50): returnerer 0 ved length===0, og
 *     computeAeviaScore() viderefører det som total:0 (baseline) hhv. vægter det
 *     ind i totalen (non-baseline) uden at signalere "ingen data".
 *   - src/bio-age.ts estimateBiologicalAge() (l.188-200): falder til
 *     heuristicAge() som returnerer chronologicalAge + 0 (ingen markører ⇒ delta=0)
 *     og sætter available:true selv ved inputsUsed:0.
 *   Værdierne føres uændret videre i draft.ts (aeviaScore + biologicalAge).
 *
 * Når buggen er rettet skal denne test bestå.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeAeviaScore, scoreLabel, estimateBiologicalAge } from "../../dist/src/index.js";

const AGE = 49; // kronologisk alder, jf. minimalt input {age:49, sex:'male', markers:[]}

test("FUND: tom markør-liste må ikke give et selvsikkert bio-alders-estimat lig den kronologiske (available:true)", () => {
  // markers:[] (klassificerede markører) OG ingen PhenoAge-input.
  const bio = estimateBiologicalAge([], AGE, []);

  // Observeret (buggy): available:true med estimatedAge = kronologisk alder.
  // Forventet: ingen data ⇒ estimatet kan ikke beregnes ⇒ available:false,
  // samme kontrakt som ved ugyldig alder (types.ts BiologicalAge.available).
  assert.equal(
    bio.available,
    false,
    `Bio-age med inputsUsed=${bio.inputsUsed} (tom liste) skal være available:false, ` +
      `men var available:true med estimatedAge=${bio.estimatedAge} (= kronologisk alder ${AGE}).`
  );
});

test("FUND: tom markør-liste — available:true må aldrig stamme fra nul input", () => {
  const bio = estimateBiologicalAge([], AGE, []);
  // Kerne-invariant: et tilgængeligt estimat skal hvile på mindst ét input.
  if (bio.available) {
    assert.ok(
      bio.inputsUsed > 0,
      `available:true MEN inputsUsed=${bio.inputsUsed} — et estimat uden input er vildledende.`
    );
  }
});

test("FUND: markers udeladt (classified=undefined) opfører sig som tom liste — ingen selvsikker bio-alder", () => {
  // {age:49, sex:'male'} uden markers-feltet.
  const bio = estimateBiologicalAge([], AGE);
  assert.equal(
    bio.available,
    false,
    `Uden markører skal bio-age være available:false, var available:true med estimatedAge=${bio.estimatedAge}.`
  );
});

test("FUND: tom markør-liste må ikke præsenteres som 'sundhedsscore 0 / Tid til fokus' (baseline)", () => {
  // baseline:true (første test) — som observeret: total:0, breakdown:{}, baseline:true.
  const score = computeAeviaScore([], { adherence: 1, baseline: true });

  // Den buggy adfærd: total === 0 ⇒ scoreLabel === "Tid til fokus".
  // Forventet: markør-komponenten kan ikke beregnes uden markører ⇒ markers er
  // null/N-A (ikke et selvsikkert 0), og totalen mapper ikke til den værste etiket.
  assert.notEqual(
    score.components.markers,
    0,
    "markers-komponenten er et selvsikkert 0 fra en tom liste — burde være null/N-A (ingen data)."
  );
  assert.notEqual(
    scoreLabel(score.total),
    "Tid til fokus",
    `En patient uden data fik etiketten 'Tid til fokus' (total=${score.total}). ` +
      "Ingen data må ikke fremstå som den dårligste sundhedstilstand."
  );
});

test("FUND: tom markør-liste (non-baseline) — markør-komponenten må ikke være et selvsikkert 0", () => {
  const score = computeAeviaScore([], { adherence: 1 });
  assert.notEqual(
    score.components.markers,
    0,
    `markers=${score.components.markers} fra en tom liste — burde være null/N-A, ` +
      "ikke et 0 der vægtes ind i totalen som var det målte, dårlige markører."
  );
});
