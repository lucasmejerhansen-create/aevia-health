/**
 * REGRESSIONSTEST — FUND (p.t. FEJLENDE = dokumenterer aktivt defense-in-depth-hul).
 *
 * Fuldt fund-navn (afkortet i filnavn pga. POSIX-grænser — '/' er stiadskiller
 * og titlen overskrider 255-byte filnavnsgrænsen):
 *   "Robusthed og PII: crash-håndtering af fælde-input, enhedskonvertering,
 *    PII-lækage til draften, og degradering ved ukendte markører / ugyldig alder
 *    / tom liste. Baseret på qa/results.ndjson (800 patienter: 0 crashes,
 *    0 PII-lækager, 1 consistency-mismatch) + direkte reproduktion mod
 *    kompileret dist/. Overordnet er motoren robust mod crash og PII; de reelle
 *    problemer sidder i bio-age-laget. -20"
 *
 * Fund (sværhedsgrad: LAV — defense-in-depth-hul, ingen faktisk lækage observeret):
 *   assertNoPII er KUN nøgle-baseret. PII indlejret i en STRENGVÆRDI fanges ikke.
 *
 * Reproduceret mod den byggede motor (dist/src/index.js):
 *   - assertNoPII({ explanation: "patient 010101-1111 Hans Hansen" }) => INGEN exception
 *     (CPR-mønster + navn i fritekst-værdi slipper igennem)
 *   - assertNoPII({ note: "010101-1111" })                            => INGEN exception
 *   POSITIVT (bekræftet, skal blive ved at holde):
 *   - assertNoPII({ cpr: "..." })                       => kaster korrekt (PII-NØGLE)
 *   - assertNoPII({ markers:[{ name:"Hans" }] })        => kaster korrekt (nested PII-nøgle i array)
 *   - deidentify(...) whitelister korrekt: ekstra cpr/note på en markør droppes
 *     (output-nøgler: id,value,unit,sex,age) — ingen faktisk lækage i praksis.
 *
 * Hvorfor lav: den deterministiske motor lægger ikke fritekst-PII i felter
 * (explanation kommer fra reference-data), så der er p.t. ingen reel lækage.
 * Men som SIDSTE sikkerhedsnet før et AI-kald bør et CPR-mønster i en værdi også
 * kunne fanges — ellers er et fremtidigt fritekst-felt med patient-PII usynligt
 * for vagten.
 *
 * Forventet: assertNoPII() scanner — ud over nøgler — også strengVÆRDIER for et
 * dansk CPR-mønster (DDMMYY-SSSS eller DDMMYYSSSS) og kaster, så et CPR aldrig
 * kan forlade serveren mod AI-laget i en fritekst-værdi.
 *
 * Årsag i koden (src/deidentify.ts), assertNoPII() (l.46-60):
 *   walk() matcher KUN key.toLowerCase() mod PII_KEYS (l.53); strengværdier
 *   inspiceres aldrig. Foreslået fix: hvis typeof val === "string" og val matcher
 *   et CPR-regex (fx /\b\d{6}-?\d{4}\b/), så kast på samme måde som ved en PII-nøgle.
 *
 * Når hullet er lukket skal denne test bestå.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { assertNoPII } from "../../dist/src/index.js";

/** Hjælper: sand hvis assertNoPII kaster på det givne objekt. */
function throwsPII(obj) {
  try {
    assertNoPII(obj);
    return false;
  } catch {
    return true;
  }
}

// --- KONTROL: nøgle-baseret detektion virker (skal blive ved med at holde) ---

test("kontrol: PII-NØGLE (cpr) fanges fortsat", () => {
  assert.ok(throwsPII({ cpr: "010101-1111" }), "PII-nøgle 'cpr' bør fanges");
});

test("kontrol: nested PII-nøgle i array fanges fortsat", () => {
  assert.ok(
    throwsPII({ markers: [{ id: "ldl", name: "Hans Hansen" }] }),
    "nested PII-nøgle 'name' i array bør fanges"
  );
});

test("kontrol: rent (PII-frit) objekt kaster ikke", () => {
  assert.ok(
    !throwsPII({ pseudoId: "abc", ageBand: "40-44", sex: "female", markers: [{ id: "ldl", value: 3 }] }),
    "rent objekt bør ikke kaste"
  );
});

// --- FUNDET (p.t. FEJLENDE): værdi-indlejret CPR/navn fanges ikke ---

test("FUND: CPR + navn i en fritekst-VÆRDI skal fanges (DDMMYY-SSSS)", () => {
  // Minimalt input fra fundet — kaster p.t. IKKE; bør kaste.
  assert.ok(
    throwsPII({ explanation: "patient 010101-1111 Hans Hansen" }),
    "CPR-mønster i en strengværdi slap igennem assertNoPII (defense-in-depth-hul)"
  );
});

test("FUND: rent CPR-mønster i en værdi skal fanges (DDMMYYSSSS, uden bindestreg)", () => {
  assert.ok(
    throwsPII({ note: "0101011111" }),
    "CPR uden bindestreg i en strengværdi slap igennem assertNoPII"
  );
});

test("FUND: CPR i en nested array-værdi skal fanges", () => {
  assert.ok(
    throwsPII({ markers: [{ id: "ldl", comment: "se journal for 010101-1111" }] }),
    "CPR i en nested fritekst-værdi slap igennem assertNoPII"
  );
});
