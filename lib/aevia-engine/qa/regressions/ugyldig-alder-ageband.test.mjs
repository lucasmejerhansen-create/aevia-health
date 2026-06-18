/**
 * REGRESSIONSTEST — FUND (p.t. FEJLENDE = dokumenterer aktiv bug).
 *
 * Fuldt fund-navn (afkortet i filnavn pga. POSIX-grænser — '/' er stiadskiller
 * og titlen overskrider 255-byte filnavnsgrænsen):
 *   "Robusthed og PII: crash-håndtering af fælde-input, enhedskonvertering,
 *    PII-lækage til draften, og degradering ved ukendte markører / ugyldig alder
 *    / tom liste. Baseret på qa/results.ndjson (800 patienter: 0 crashes,
 *    0 PII-lækager, 1 consistency-mismatch) + direkte reproduktion mod
 *    kompileret dist/. Overordnet er motoren robust mod crash og PII; de reelle
 *    problemer sidder i bio-age-laget. -18"
 *
 * Fund: Ikke-numerisk/ugyldig alder giver et meningsløst aldersbånd, der lækker
 *       ind i draften (ingen crash, men nonsens-streng i output).
 *
 * Reproduceret mod den byggede motor (dist/src/index.js):
 *   - ageBandOf("fyrre")  => "NaN-NaN"   (trap-100: ikke-numerisk alder)
 *   - ageBandOf(undefined)=> "NaN-NaN"
 *   - ageBandOf(NaN)      => "NaN-NaN"
 *   - ageBandOf(-5)       => "-5--1"     (trap-098: negativ alder)
 *   - ageBandOf(null)     => "0-4"       (Math.floor(null/5)=0 — plausibelt MEN forkert)
 *   - deidentify({ age:"fyrre", sex:"female", markers:[] }).ageBand => "NaN-NaN"
 *     (lækker uændret ind i draftens ageBand-felt, jf. draft.ts l.21+42)
 *
 * biologicalAge degraderer korrekt til available:false ved ugyldig alder; det er
 * UDELUKKENDE ageBand-strengen, der er nonsens. Pipelinen crasher ikke.
 *
 * Forventet (jf. types.ts: ageBand er en menneskelæsbar kohorte-etikette, ikke et
 * vilkårligt tal-interval): ageBandOf() bør validere input (Number.isFinite + ikke
 * negativ) og returnere en eksplicit 'ukendt'-værdi i stedet for at serialisere
 * "NaN-NaN" / "-5--1" / et falsk "0-4". deidentify() skal videreføre den eksplicitte
 * 'ukendt'-etikette frem for nonsens.
 *
 * Årsag i koden (src/deidentify.ts):
 *   - ageBandOf() (l.18-21): `Math.floor(age / 5) * 5` med NaN giver NaN, med en
 *     negativ alder et negativt bånd; ingen input-validering.
 *   - deidentify() (l.23-37, l.27) kalder ageBandOf(raw.age) UBETINGET, så den
 *     meningsløse streng lækker ind i deid.ageBand → draft.ts (l.42) ageBand.
 *
 * Når buggen er rettet skal denne test bestå.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ageBandOf, deidentify } from "../../dist/src/index.js";

/**
 * En 'ukendt'-etikette er enhver streng, der ikke er et tal-interval. Vi binder os
 * ikke til en præcis ordlyd (fx "ukendt" / "unknown" / "—"), kun til invarianten:
 * et velformet aldersbånd er "<n>-<m>" hvor n,m er endelige ikke-negative heltal.
 */
function isWellFormedNumericBand(band) {
  const m = /^(\d+)-(\d+)$/.exec(band);
  if (!m) return false;
  const lo = Number(m[1]);
  const hi = Number(m[2]);
  return Number.isFinite(lo) && Number.isFinite(hi) && lo >= 0 && hi >= lo;
}

/** Kerne-invariant: et bånd er ENTEN et velformet numerisk interval ELLER en eksplicit ikke-numerisk etikette — aldrig "NaN-NaN" / "-5--1". */
function assertBandIsSane(band, label) {
  assert.equal(typeof band, "string", `${label}: ageBand skal være en streng, var ${typeof band}`);
  assert.ok(
    !band.includes("NaN"),
    `${label}: ageBand="${band}" indeholder NaN — meningsløst bånd lækket til output`
  );
  // Hvis det LIGNER et numerisk interval, skal det være velformet (ikke-negativt, lo<=hi).
  if (/-?\d/.test(band) && /^-?\d+--?\d+$/.test(band)) {
    assert.ok(
      isWellFormedNumericBand(band),
      `${label}: ageBand="${band}" er et ugyldigt numerisk interval (negativt/omvendt)`
    );
  }
}

test("kontrol: gyldig alder giver velformet 5-års bånd", () => {
  assert.equal(ageBandOf(52), "50-54");
  assert.equal(ageBandOf(0), "0-4");
  assert.equal(ageBandOf(40), "40-44");
});

test("trap-100: ikke-numerisk alder ('fyrre') må ikke give 'NaN-NaN'", () => {
  const band = ageBandOf("fyrre");
  assertBandIsSane(band, "trap-100 (fyrre)");
});

test("undefined alder må ikke give 'NaN-NaN'", () => {
  assertBandIsSane(ageBandOf(undefined), "undefined-alder");
});

test("NaN alder må ikke give 'NaN-NaN'", () => {
  assertBandIsSane(ageBandOf(NaN), "NaN-alder");
});

test("null alder må ikke give et falsk plausibelt '0-4'-bånd", () => {
  // Math.floor(null/5)*5 = 0 → "0-4": ser gyldigt ud, men er en silent-forkert etikette
  // for manglende alder. Forventet: en eksplicit ikke-numerisk 'ukendt'-etikette.
  const band = ageBandOf(null);
  assert.ok(
    !isWellFormedNumericBand(band),
    `null-alder: ageBand="${band}" foregiver en gyldig kohorte; bør være en eksplicit 'ukendt'-etikette`
  );
});

test("trap-098: negativ alder (-5) må ikke give '-5--1'", () => {
  const band = ageBandOf(-5);
  assert.ok(
    !band.includes("NaN") && isWellFormedNumericBand(band) === false ? true : isWellFormedNumericBand(band),
    `trap-098: ageBand="${band}"`
  );
  // Skarpere: et negativt bånd er aldrig gyldigt.
  assert.ok(
    !/^-/.test(band) && !band.includes("--"),
    `trap-098: ageBand="${band}" er et negativt/ugyldigt interval`
  );
  assertBandIsSane(band, "trap-098 (-5)");
});

test("PII-lækage: deidentify() må ikke lække et nonsens-aldersbånd til draften (trap-100)", () => {
  const raw = {
    name: "Test Person",
    cpr: "0101901234",
    email: "test@example.dk",
    age: "fyrre",
    sex: "female",
    markers: [],
  };
  const deid = deidentify(raw);
  assertBandIsSane(deid.ageBand, "deidentify trap-100");
});

test("deidentify() med negativ alder lækker ikke '-5--1' til draften (trap-098)", () => {
  const raw = {
    name: "Test Person",
    cpr: "0101901234",
    email: "test@example.dk",
    age: -5,
    sex: "female",
    markers: [],
  };
  const deid = deidentify(raw);
  assert.ok(
    !/^-/.test(deid.ageBand) && !deid.ageBand.includes("--"),
    `deidentify trap-098: ageBand="${deid.ageBand}" er et negativt/ugyldigt interval`
  );
  assertBandIsSane(deid.ageBand, "deidentify trap-098");
});
