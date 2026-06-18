/**
 * REGRESSIONSTEST — KRITISK FUND (p.t. FEJLENDE = dokumenterer aktiv bug).
 *
 * Fuldt fund-navn (afkortet i filnavn pga. POSIX-grænser — '/' er stibsadskiller
 * og hele titlen overskrider 255-byte filnavnsgrænsen):
 *   "Biologisk alder (bio-age.ts): plausibilitet af PhenoAge/heuristik-output,
 *    korrekt available:false-håndtering og meningsfuldt confidenceInterval.
 *    Datagrundlag: qa/results.ndjson (800 records) joinet med qa/cohort/*.json
 *    (kronologisk alder). 388 PhenoAge-records, 412 marker-heuristik. -5"
 *
 * Fund: PhenoAge returnerer ikke-finit alder (Infinity/NaN) men sætter available:true.
 *       Efter JSON-serialisering ses det som
 *       {"estimatedAge":null,"available":true,"confidenceInterval":[null,null],
 *        "method":"phenoage","inputsUsed":9}.
 *
 * Reproduceret mod den byggede motor (dist/src/index.js) med tre minimale cases:
 *   (a) metabolic-091: glukose=126 (mg/dL-værdi fejlmærket som mmol/L), age=52
 *       → xb mætter Math.exp(xb), mortalityScore→1, Math.log(1-1)=-Infinity
 *       → phenoAge = Infinity.
 *   (b) trap-088: kreatinin=NaN, age=50 → NaN propagerer → phenoAge=NaN.
 *   (c) trap-089: hscrp=Infinity, age=63 → Infinity propagerer → phenoAge=Infinity.
 *
 * Forventet (jf. types.ts BiologicalAge: estimatedAge er 'number', og når estimatet
 * ikke kan beregnes SKAL available=false og estimatedAge IKKE vises som tal):
 * et ikke-finit eller saturerende PhenoAge-input skal udelukke PhenoAge — enten
 * fald til marker-heuristik med et finit estimat, eller available:false. Aldrig
 * available:true med en ikke-finit estimatedAge.
 *
 * Årsag i koden (src/bio-age.ts):
 *   - extractPhenoInputs() (l.59-88) validerer kun '== null' / 'wbc === 0', aldrig
 *     Number.isFinite — så NaN/Infinity passerer.
 *   - phenoAgeYears() (l.91-114) har intet output-værn: mortalityScore mættes til 1
 *     → Math.log(1-1) → ±Infinity.
 *   - estimateBiologicalAge() (l.173-186) tjekker ikke Number.isFinite(raw) før
 *     available:true sættes.
 * Den ikke-finitte værdi føres uændret videre via draft.ts (estimateBiologicalAge).
 *
 * Når buggen er rettet skal denne test bestå.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { estimateBiologicalAge } from "../../dist/src/index.js";

/** 9 PhenoAge-input i kanoniske enheder — sund baseline (matcher cohort-normalområder). */
function baseline() {
  return [
    { id: "albumin", value: 45 },         // g/L
    { id: "kreatinin", value: 80 },       // µmol/L
    { id: "glukose", value: 5.2 },        // mmol/L
    { id: "hscrp", value: 1.0 },          // mg/L
    { id: "lymfocytter", value: 2.0 },    // 10^9/L
    { id: "leukocytter", value: 6.0 },    // 10^9/L
    { id: "mcv", value: 90 },             // fL
    { id: "rdw", value: 13 },             // %
    { id: "basiskfosfatase", value: 70 }, // U/L
  ];
}

function withVal(id, value) {
  return baseline().map((m) => (m.id === id ? { id, value } : m));
}

/** Et plausibelt biologisk alders-estimat: finit, voksent, ikke vildt langt fra kronologisk. */
function assertPlausible(r, label) {
  assert.equal(
    Number.isFinite(r.estimatedAge),
    true,
    `${label}: estimatedAge skal være et endeligt tal, var ${r.estimatedAge}`
  );
  // Et formidlet bio-alders-estimat skal ligge i et menneskeligt interval, ikke ±Infinity.
  assert.ok(
    r.estimatedAge > 0 && r.estimatedAge < 130,
    `${label}: estimatedAge=${r.estimatedAge} er ikke fysiologisk plausibelt`
  );
  const [lo, hi] = r.confidenceInterval;
  assert.ok(
    Number.isFinite(lo) && Number.isFinite(hi) && lo <= r.estimatedAge && r.estimatedAge <= hi,
    `${label}: confidenceInterval [${lo}, ${hi}] skal være endeligt og omslutte estimatet`
  );
}

/** Kerne-invariant: et ikke-finit estimat må ALDRIG markeres available:true. */
function assertNeverFiniteLie(r, label) {
  if (!Number.isFinite(r.estimatedAge)) {
    assert.equal(
      r.available,
      false,
      `${label}: ikke-finit estimatedAge (${r.estimatedAge}) MEN available=true — forbudt`
    );
  }
}

test("kontrol: rent normalt panel giver finit, plausibel PhenoAge", () => {
  const r = estimateBiologicalAge(baseline(), 52, []);
  assert.equal(r.method, "phenoage");
  assertPlausible(r, "kontrol");
});

test("(a) metabolic-091: glukose=126 (fejlmærket mmol/L) må ikke give available:true med ikke-finit alder", () => {
  const r = estimateBiologicalAge(withVal("glukose", 126), 52, []);
  // Mætning af mortalityScore → ±Infinity. Enten finit estimat (fald til heuristik) eller available:false.
  assertNeverFiniteLie(r, "metabolic-091");
  if (r.available) assertPlausible(r, "metabolic-091");
});

test("(b) trap-088: kreatinin=NaN må ikke give available:true med NaN-alder", () => {
  const r = estimateBiologicalAge(withVal("kreatinin", NaN), 50, []);
  assertNeverFiniteLie(r, "trap-088");
  if (r.available) assertPlausible(r, "trap-088");
});

test("(c) trap-089: hscrp=Infinity må ikke give available:true med Infinity-alder", () => {
  const r = estimateBiologicalAge(withVal("hscrp", Infinity), 63, []);
  assertNeverFiniteLie(r, "trap-089");
  if (r.available) assertPlausible(r, "trap-089");
});

test("invariant: available:true ⇒ estimatedAge og confidenceInterval er endelige", () => {
  const cases = [
    { markers: withVal("glukose", 126), age: 52, label: "metabolic-091" },
    { markers: withVal("kreatinin", NaN), age: 50, label: "trap-088" },
    { markers: withVal("hscrp", Infinity), age: 63, label: "trap-089" },
    { markers: withVal("glukose", 45), age: 40, label: "fysiologisk-umulig-glukose" }, // ~>40 mmol/L mætter exp(xb)
  ];
  for (const { markers, age, label } of cases) {
    const r = estimateBiologicalAge(markers, age, []);
    if (r.available) {
      assert.equal(
        Number.isFinite(r.estimatedAge),
        true,
        `${label}: available=true men estimatedAge=${r.estimatedAge} er ikke endelig`
      );
      const [lo, hi] = r.confidenceInterval;
      assert.equal(
        Number.isFinite(lo) && Number.isFinite(hi),
        true,
        `${label}: available=true men confidenceInterval=[${lo}, ${hi}] er ikke endeligt`
      );
    }
  }
});
