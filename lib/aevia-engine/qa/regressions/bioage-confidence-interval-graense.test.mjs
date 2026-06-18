/**
 * REGRESSIONSTEST — FUND (p.t. FEJLENDE = dokumenterer aktiv bug).
 *
 * Fuldt fund-navn (afkortet/saneret i filnavn pga. POSIX: '/' er stiadskiller og
 * hele titlen overskrider 255-byte filnavnsgrænsen — jf. søsterfilen "-5"):
 *   "Biologisk alder (bio-age.ts): plausibilitet af PhenoAge/heuristik-output,
 *    korrekt available:false-håndtering og meningsfuldt confidenceInterval.
 *    Datagrundlag: qa/results.ndjson (800 records) joinet med qa/cohort/*.json
 *    (kronologisk alder). 388 PhenoAge-records, 412 marker-heuristik. -7"
 *
 * Fund: confidenceInterval kan blive 0 eller negativt og er ikke et statistisk
 *       interval. Halvbredden er en KONSTANT (±3 for PhenoAge, ±6 for heuristik),
 *       uafhængig af estimatets størrelse, og der clampes ikke mod en fysiologisk
 *       nedre grænse. Ved lave estimater skubbes intervallets undergrænse derfor
 *       ned mod og under 0 — et formidlingsinterval kan komme til at "love" en
 *       negativ eller umulig alder, og afspejler ingen reel usikkerhed, heller
 *       ikke når estimatet selv ligger uden for det validerede (voksen) domæne.
 *
 * Reproduceret mod den BYGGEDE motor (dist/src/index.js):
 *   (a) healthy-young-006 (qa/cohort/healthy-young.json), age=22, sunde input.
 *       De 9 kanoniske PhenoAge-input fra denne patient (post-classify, id+value)
 *       giver gennem estimateBiologicalAge:
 *         estimatedAge=3, confidenceInterval=[0,6]  ← undergrænse rammer 0.
 *       (Identisk med results.ndjson for samme patient.)
 *   (b) En endnu sundere/yngre syntetisk 9-input-baseline ved age=22 giver
 *         estimatedAge=1, confidenceInterval=[-2,4]  ← STRENGT NEGATIV undergrænse.
 *   På tværs af de 800 records ligger CI-undergrænsen < 18 år i mange records og
 *   <= 0 i mindst én — alle med available:true.
 *
 * Forventet (et formidlingsinterval må ikke kunne indeholde 0 eller negative
 * aldre, og bør afspejle reel usikkerhed):
 *   - confidenceInterval[0] skal være > 0 og helst >= en fysiologisk nedre grænse.
 *   - intervallet skal stadig omslutte estimatet (lo <= est <= hi) og være endeligt.
 *   - når estimatet selv ligger uden for det validerede domæne (her: < 18 år), bør
 *     intervallet IKKE være lige så smalt som ved et midt-domæne-estimat — en fast
 *     ±3 signalerer falsk præcision. Mindst skal undergrænsen clampes; helst skal
 *     halvbredden udvides for ekstreme/out-of-domain estimater.
 *
 * Årsag i koden (src/bio-age.ts):
 *   - confidenceHalfWidth() (l.136-140) returnerer en KONSTANT halvbredde uden
 *     afhængighed af estimatet (6 for heuristik; 3 + 1.5*manglende for PhenoAge).
 *   - CI dannes (l.179 / l.194) som [round(est-half), round(est+half)] UDEN clamp
 *     mod en fysiologisk nedre grænse. Kommentaren (l.134) erkender selv at det
 *     "SKAL kalibreres af Judit".
 *   Den negative/nul-undergrænse føres uændret videre via draft.ts.
 *
 * Når buggen er rettet skal denne test bestå. (Den krævede fysiologiske
 * nedre grænse afventer Judits kalibrering; testen bruger 0 som absolut minimum
 * for at være konservativ — selv den nuværende motor overtræder det i (b).)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { estimateBiologicalAge } from "../../dist/src/index.js";

/** Absolut, konservativ nedre grænse. Et formidlet alders-interval må aldrig
 *  påstå en alder på 0 år eller derunder. (Den egentlige fysiologiske grænse —
 *  fx 18 år for et voksen-valideret domæne — afventer Judits kalibrering.) */
const ABSOLUTE_MIN_AGE = 0;

/**
 * De 9 kanoniske PhenoAge-input (id+value) fra healthy-young-006
 * (qa/cohort/healthy-young.json), som motoren ser dem efter klassificering.
 * Passeret alene til estimateBiologicalAge reproducerer de results.ndjson:
 * estimatedAge=3, confidenceInterval=[0,6].
 */
function healthyYoung006Inputs() {
  return [
    { id: "albumin", value: 44 },         // g/L
    { id: "kreatinin", value: 68 },       // µmol/L
    { id: "glukose", value: 4.4 },        // mmol/L
    { id: "hscrp", value: 0.7 },          // mg/L
    { id: "lymfocytter", value: 2.8 },    // 10^9/L
    { id: "leukocytter", value: 4.4 },    // 10^9/L
    { id: "mcv", value: 90 },             // fL
    { id: "rdw", value: 11.5 },           // %
    { id: "basiskfosfatase", value: 71 }, // U/L
  ];
}

/** En endnu sundere/yngre syntetisk 9-input-baseline — driver PhenoAge så lavt at
 *  selv undergrænsen før afrunding bliver negativ. */
function extremeYoungInputs() {
  return [
    { id: "albumin", value: 50 },
    { id: "kreatinin", value: 55 },
    { id: "glukose", value: 4.3 },
    { id: "hscrp", value: 0.2 },
    { id: "lymfocytter", value: 2.5 },
    { id: "leukocytter", value: 5.0 },
    { id: "mcv", value: 88 },
    { id: "rdw", value: 12 },
    { id: "basiskfosfatase", value: 50 },
  ];
}

/** Kontrol: et midt-domæne, voksent estimat. Bruges til at sammenligne intervalbredder. */
function midDomainInputs() {
  return [
    { id: "albumin", value: 42 },
    { id: "kreatinin", value: 85 },
    { id: "glukose", value: 5.4 },
    { id: "hscrp", value: 1.5 },
    { id: "lymfocytter", value: 2.0 },
    { id: "leukocytter", value: 6.5 },
    { id: "mcv", value: 91 },
    { id: "rdw", value: 13.5 },
    { id: "basiskfosfatase", value: 80 },
  ];
}

/** Grundlæggende sundhedstjek på et CI: endeligt, omslutter estimatet, og
 *  undergrænsen påstår ikke en umulig alder. */
function assertSaneInterval(r, label) {
  const [lo, hi] = r.confidenceInterval;
  assert.ok(
    Number.isFinite(lo) && Number.isFinite(hi),
    `${label}: confidenceInterval [${lo}, ${hi}] skal være endeligt`
  );
  assert.ok(
    lo <= r.estimatedAge && r.estimatedAge <= hi,
    `${label}: confidenceInterval [${lo}, ${hi}] skal omslutte estimatet (${r.estimatedAge})`
  );
  assert.ok(
    lo > ABSOLUTE_MIN_AGE,
    `${label}: confidenceInterval-undergrænse (${lo}) må ikke påstå en alder <= ${ABSOLUTE_MIN_AGE} år`
  );
}

test("(a) healthy-young-006: CI-undergrænse må ikke ramme 0 (minimalt fund)", () => {
  const r = estimateBiologicalAge(healthyYoung006Inputs(), 22, []);
  // Repro-sanity: bekræft at vi rammer den samme tilstand som results.ndjson.
  assert.equal(r.method, "phenoage", "(a): forventede PhenoAge for fuldt 9-input panel");
  assert.equal(r.available, true, "(a): estimatet er markeret tilgængeligt");
  // KERNEN: undergrænsen er p.t. 0 → dette assert fejler indtil clamp/kalibrering.
  assertSaneInterval(r, "healthy-young-006");
});

test("(b) ekstremt ungt panel: CI-undergrænse må ikke blive negativ", () => {
  const r = estimateBiologicalAge(extremeYoungInputs(), 22, []);
  assert.equal(r.available, true, "(b): estimatet er markeret tilgængeligt");
  // P.t. confidenceInterval = [-2, 4] → undergrænse < 0. Forbudt.
  assertSaneInterval(r, "ekstremt-ungt-panel");
});

test("invariant: available:true ⇒ CI-undergrænse > 0 og interval omslutter estimatet", () => {
  const cases = [
    { markers: healthyYoung006Inputs(), age: 22, label: "healthy-young-006" },
    { markers: extremeYoungInputs(), age: 22, label: "ekstremt-ungt-panel" },
    { markers: midDomainInputs(), age: 48, label: "midt-domæne-kontrol" },
  ];
  for (const { markers, age, label } of cases) {
    const r = estimateBiologicalAge(markers, age, []);
    if (r.available) assertSaneInterval(r, label);
  }
});

test("CI skal afspejle reel usikkerhed: out-of-domain-estimat (<18) må ikke have samme smalle interval som et midt-domæne-estimat", () => {
  // Et estimat dybt under det validerede voksen-domæne er mere usikkert, ikke
  // lige så sikkert som et midt-domæne-estimat. En fast ±3 signalerer falsk præcision.
  const young = estimateBiologicalAge(extremeYoungInputs(), 22, []);
  const mid = estimateBiologicalAge(midDomainInputs(), 48, []);

  const halfWidth = (r) => (r.confidenceInterval[1] - r.confidenceInterval[0]) / 2;
  const youngHalf = halfWidth(young);
  const midHalf = halfWidth(mid);

  // Repro-sanity: dokumentér at begge p.t. har samme konstante halvbredde (±3).
  // Når estimatet (young) ligger uden for det validerede domæne, BØR intervallet
  // være bredere end et midt-domæne-estimats. Dette assert fejler indtil
  // halvbredden gøres afhængig af estimatet / out-of-domain-status.
  assert.ok(
    youngHalf > midHalf,
    `out-of-domain-estimat (${young.estimatedAge} år, halvbredde ${youngHalf}) skal have et BREDERE interval ` +
      `end et midt-domæne-estimat (${mid.estimatedAge} år, halvbredde ${midHalf}) — en konstant halvbredde ` +
      `signalerer falsk præcision`
  );
});
