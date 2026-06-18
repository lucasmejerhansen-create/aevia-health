/**
 * REGRESSIONSTEST — PhenoAge giver klinisk umulige biologiske aldre (under 18 år)
 * for raske unge voksne fra fuldt gyldige, normale input.
 *
 * FUND (sværhedsgrad: høj):
 *   healthy-young-006 (kronologisk alder 22, alle 9 PhenoAge-input normale:
 *   albumin 44, kreatinin 68, glukose 4.4, hs-CRP 0.7 mg/L, lymf% ~64, mcv 90,
 *   rdw 11.5, alp 71, wbc 4.4) → estimatedAge = 3 år, confidenceInterval = [0, 6],
 *   available = true, method = "phenoage". En biologisk alder på 3 år er klinisk
 *   umulig og må ikke præsenteres for patient eller læge.
 *
 *   Flere reproducerede: healthy-young-026 (est 5, chrono 21),
 *   healthy-young-023 (est 6, chrono 25), healthy-young-017 (est 8, chrono 23).
 *
 * OMFANG (verificeret: qa/results.ndjson joinet med qa/cohort/*.json):
 *   51 PhenoAge-records med estimatedAge < 18; 105 records < 25. Mønsteret
 *   rammer bredt blandt unge, sunde voksne.
 *
 * ÅRSAG (src/bio-age.ts):
 *   - Linje 160: 18–110-værnet (`ageValid`) gælder KUN det KRONOLOGISKE input,
 *     ikke output-estimatet.
 *   - phenoAgeYears() (linje 91-114) returneres uafgrænset.
 *   - estimateBiologicalAge() (linje 173-185) runder kun `raw` og returnerer det
 *     uden nogen nedre/øvre plausibilitetsgrænse (clamp) eller markering af
 *     "uden for valideret domæne". PhenoAge (Levine 2018) er kun valideret på
 *     voksne (NHANES); lineær ekstrapolation for meget sunde unge giver
 *     encifrede aldre.
 *
 * FORVENTET (det denne test asserterer — derfor fejler den p.t.):
 *   Når motoren præsenterer et estimat (available:true) skal det være klinisk
 *   plausibelt for en voksen (>= 18) og i rimelig nærhed af kronologisk alder.
 *   Alternativt skal det markeres available:false (uden for valideret domæne).
 *   confidenceInterval må ikke strække sig ned i umulige aldre.
 *
 * Fil under test: src/bio-age.ts (kompileret: dist/src/bio-age.js via index.js).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  deidentify,
  classifyAll,
  estimateBiologicalAge,
} from "../../dist/src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COHORT_DIR = join(__dirname, "..", "cohort");

/** Klinisk plausibel nedre grænse for biologisk voksen-alder. */
const MIN_PLAUSIBLE_ADULT_AGE = 18;

/** Byg RawPatientData ud af en kohort-patient (som qa/run-cohort.mjs). */
function toRawPatient(p) {
  return {
    name: "QA Testperson",
    cpr: "000000-0000",
    email: "qa@example.invalid",
    age: p.age,
    sex: p.sex,
    markers: (p.markers ?? []).map((m) => ({
      id: m.id,
      value: m.value,
      unit: m.unit,
      sex: m.sex ?? p.sex,
      age: m.age ?? p.age,
    })),
  };
}

/** Kør den rigtige motor-kæde og returnér biologisk-alder-objektet. */
function bioAgeFor(p) {
  const raw = toRawPatient(p);
  const deid = deidentify(raw);
  const cm = classifyAll(deid.markers);
  return estimateBiologicalAge(cm, raw.age, cm);
}

/** Indlæs en specifik patient fra en kohort-fil. */
function loadPatient(file, id) {
  const arr = JSON.parse(readFileSync(join(COHORT_DIR, file), "utf8"));
  const p = arr.find((x) => x.id === id);
  assert.ok(p, `Forventede at finde ${id} i ${file}`);
  return p;
}

test("PhenoAge: rask 22-årig (healthy-young-006) får ikke en klinisk umulig biologisk alder", () => {
  const p = loadPatient("healthy-young.json", "healthy-young-006");
  const bio = bioAgeFor(p);

  if (bio.available) {
    assert.ok(
      bio.estimatedAge >= MIN_PLAUSIBLE_ADULT_AGE,
      `estimatedAge=${bio.estimatedAge} er klinisk umulig for en rask 22-årig ` +
        `(skal være >= ${MIN_PLAUSIBLE_ADULT_AGE} eller markeres available:false). ` +
        `Årsag: src/bio-age.ts afgrænser ikke PhenoAge-output. bio=${JSON.stringify(bio)}`
    );

    const [lo] = bio.confidenceInterval;
    assert.ok(
      lo >= MIN_PLAUSIBLE_ADULT_AGE,
      `confidenceInterval=${JSON.stringify(bio.confidenceInterval)} rækker ned i ` +
        `klinisk umulige aldre for en voksen.`
    );
  } else {
    assert.equal(bio.available, false);
  }
});

test("PhenoAge: de fire eksplicit rapporterede records skal alle være plausible", () => {
  const cases = [
    { id: "healthy-young-006", chrono: 22 },
    { id: "healthy-young-026", chrono: 21 },
    { id: "healthy-young-023", chrono: 25 },
    { id: "healthy-young-017", chrono: 23 },
  ];

  const bad = [];
  for (const c of cases) {
    const p = loadPatient("healthy-young.json", c.id);
    const bio = bioAgeFor(p);
    if (bio.available && bio.estimatedAge < MIN_PLAUSIBLE_ADULT_AGE) {
      bad.push({ id: c.id, chrono: c.chrono, est: bio.estimatedAge, ci: bio.confidenceInterval });
    }
  }

  assert.equal(
    bad.length,
    0,
    `Klinisk umulige biologiske aldre for raske unge voksne: ${JSON.stringify(bad)}. ` +
      `Forventet: plausibel nærhed af kronologisk alder (>= ${MIN_PLAUSIBLE_ADULT_AGE}) eller available:false.`
  );
});

test("PhenoAge: ingen voksen record må give en biologisk alder under 18 år (bredt mønster)", () => {
  const offenders = [];
  for (const file of readdirSync(COHORT_DIR).filter((f) => f.endsWith(".json"))) {
    const arr = JSON.parse(readFileSync(join(COHORT_DIR, file), "utf8"));
    if (!Array.isArray(arr)) continue;
    for (const p of arr) {
      if (p.age == null || p.age < MIN_PLAUSIBLE_ADULT_AGE) continue; // voksne
      const bio = bioAgeFor(p);
      if (!bio.available || bio.method !== "phenoage") continue;
      if (bio.estimatedAge < MIN_PLAUSIBLE_ADULT_AGE) {
        offenders.push({ id: p.id, chrono: p.age, est: bio.estimatedAge, ci: bio.confidenceInterval });
      }
    }
  }

  assert.equal(
    offenders.length,
    0,
    `${offenders.length} voksne PhenoAge-records fik biologisk alder < ${MIN_PLAUSIBLE_ADULT_AGE} år. ` +
      `Eksempler: ${JSON.stringify(offenders.slice(0, 6))}. ` +
      `Årsag: src/bio-age.ts håndhæver ikke modellens voksen-domæne på OUTPUT (kun på kronologisk input, linje 160).`
  );
});
