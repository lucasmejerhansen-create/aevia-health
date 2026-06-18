// REGRESSIONSTEST — KLINISKE MØNSTRE & RISICI (område C): insulin_resistance-flaget
//   misbehaver. Konsolideret fra tre auditor-fund om samme rod (src/clinical.ts
//   assessRisks + src/classify.ts):
//     (1) Implausible/inkonsistente input driver et action-flag uden datakvalitets-flag.
//     (2) OR-logikken (HOMA-IR>=2,5 ELLER insulin>80) løfter til 'action' alene af
//         insulin-grenen, og criteria viser en OPTIMAL HOMA-IR som "evidens".
//     (3) Alvorsgraderne er indbyrdes inkonsistente: insulin_resistance('action')
//         outranger et samtidigt metabolic_risk('watch') når HOMA-IR er sub-watch.
//
// Rubrik (område C): "modsiger risiko-flag/mønstre markør-statusserne, udløses de
//   fejlagtigt, eller mangler de?"
//
// FUND (middel): Der findes INGEN plausibilitets-/øvre-grænse-validering. Fysiologisk
//   umulige (men endelige) værdier slipper igennem og fodrer kliniske action-flag i
//   stedet for at blive markeret som et datakvalitetsproblem. Når både insulin og
//   homair (+ glukose) er givet, krydstjekker motoren dem ikke, så internt modstridende
//   input udløser et fejlagtigt risiko-flag.
//
// ÅRSAG:
//   - src/classify.ts: kun !Number.isFinite (l.83-84) sætter 'action'/non_finite_value.
//     Endelige men absurde tal (fx insulin=1.000.000 pmol/L) får ALENE
//     'unvalidated_range' (samme issue-kode som alle markører) — ingen
//     'implausible_value'/sanity-flag. classifyMarker har ingen øvre plausibilitetsgrænse.
//   - src/clinical.ts assessRisks (l.103-114): krydstjekker ikke insulin mod
//     homair/glukose (HOMA-IR ≈ insulin×glukose/22,5), så uforenelige inputs stoles blindt.
//
// REELLE KOHORTE-CASES (reproduceret mod dist/src/index.js, joinet mod
//   qa/results.ndjson + qa/cohort/*.json):
//   - trap-096 (qa/cohort/traps.json): insulin=1.000.000 pmol/L, ferritin=1e9 µg/L.
//     Observeret: insulin status='action' MEN issues=['unvalidated_range'] (intet
//     plausibilitets-flag), og det indgår i insulin_resistance(action) som criterion
//     'fasteinsulin 1000000 pmol/L'. Bekræftet at INGEN af de 800 results har en
//     'implausible_value'/sanity/inkonsistens-issue-kode (kun non_finite_value,
//     unit_converted, unit_mismatch, unknown_marker, unvalidated_range).
//   - mixed-realistic-134 (qa/cohort/mixed-realistic.json): insulin=22 µIU/mL
//     (→ konverteres til 152,79 pmol/L ≈ HOMA-IR ~5,8) MEN homair-feltet siger 1,9.
//     Observeret: insulin_resistance(action) udløses med criterion 'HOMA-IR 1.9'
//     (en watch-bånds-værdi) — uden at uoverensstemmelsen mellem de to inputs flages.
//
// Denne test ASSERTER det KORREKTE (forventede) udfald og FEJLER derfor p.t.,
//   indtil motoren (a) markerer fysiologisk umulige værdier som datakvalitetsproblem
//   i stedet for at lade dem drive et klinisk action-flag, og (b) krydstjekker
//   insulin mod homair/glukose og flager indbyrdes inkonsistente input.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  classifyMarker,
  classifyAll,
  assessRisks,
} from "../../dist/src/index.js";

// Issue-koder der i dag (fejlagtigt) IKKE adskiller plausibilitet fra "udledt referenceinterval".
const PLAUSIBILITY_CODES = ["implausible_value", "implausible_range", "sanity_check", "range_exceeded", "upper_bound_exceeded"];
const INCONSISTENCY_CODES = ["inconsistent_value", "internal_inconsistency", "cross_check_failed", "value_mismatch"];

test("C-13: absurd insulin (trap-096) skal flages som datakvalitetsproblem, ikke kun 'unvalidated_range'", () => {
  // Reel trap-096-værdi.
  const r = classifyMarker({ id: "insulin", value: 1000000, unit: "pmol/L", sex: "female", age: 51 });
  const codes = (r.issues ?? []).map((i) => i.code);

  // Forventet: en eksplicit plausibilitets-/sanity-issue, ikke kun den generiske 'unvalidated_range'.
  assert.ok(
    codes.some((c) => PLAUSIBILITY_CODES.includes(c)),
    `insulin=1.000.000 pmol/L forventes flagget som implausibel datakvalitet; fik issues=[${codes.join(", ")}]`,
  );
});

test("C-13: fysiologisk umulig insulin må IKKE drive et klinisk insulin_resistance(action)-flag", () => {
  // Reel trap-096-profil (insulin absurd, glukose/homair normale).
  const cm = classifyAll([
    { id: "insulin", value: 1000000, unit: "pmol/L", sex: "female", age: 51 },
    { id: "glukose", value: 5, unit: "mmol/L", sex: "female", age: 51 },
    { id: "homair", value: 0.84, unit: "indeks", sex: "female", age: 51 },
  ]);
  const risks = assessRisks(cm, "female");

  // En implausibel insulin må ikke fabrikere et action-flag (HOMA-IR=0,84 er optimal).
  const ir = risks.find((f) => f.id === "insulin_resistance");
  assert.equal(
    ir,
    undefined,
    `et absurd insulin (1e6 pmol/L) må ikke udløse insulin_resistance(action); fik criteria=[${ir ? ir.criteria.join(", ") : ""}]`,
  );
});

test("C-13: indbyrdes inkonsistent insulin vs. homair (mixed-realistic-134) skal flages", () => {
  // Reel mixed-realistic-134-profil: insulin 22 µIU/mL → 152,79 pmol/L ≈ HOMA-IR ~5,8,
  // men homair-feltet siger 1,9 (watch-bånd). De to input er uforenelige.
  const cm = classifyAll([
    { id: "insulin", value: 22, unit: "µIU/mL", sex: "male", age: 55 },
    { id: "glukose", value: 5.9, unit: "mmol/L", sex: "male", age: 55 },
    { id: "homair", value: 1.9, unit: "indeks", sex: "male", age: 55 },
  ]);

  // Sanity-tjek på reproduktionen: insulin er konverteret til kanonisk pmol/L.
  const ins = cm.find((m) => m.id === "insulin");
  assert.ok(Math.abs(ins.value - 152.79) < 0.5, `insulin forventes ~152,79 pmol/L efter konvertering, fik ${ins.value}`);

  // Forventet: motoren opdager at HOMA-IR ≈ insulin(µIU/mL)×glukose/22,5 (~5,8)
  // er uforenelig med det angivne homair=1,9, og flager uoverensstemmelsen.
  const insIssues = (ins.issues ?? []).map((i) => i.code);
  const homa = cm.find((m) => m.id === "homair");
  const homaIssues = (homa.issues ?? []).map((i) => i.code);
  assert.ok(
    insIssues.some((c) => INCONSISTENCY_CODES.includes(c)) || homaIssues.some((c) => INCONSISTENCY_CODES.includes(c)),
    `inkonsistente insulin/homair-input forventes flagget; fik insulin=[${insIssues.join(", ")}] homair=[${homaIssues.join(", ")}]`,
  );
});

test("C-13: et watch-bånds-HOMA-IR (1,9) må ikke fremstå som et action-criterion uden krydstjek", () => {
  // mixed-realistic-134: homair=1,9 er en watch-bånds-værdi (assessRisks-tærskel for
  // action er HOMA-IR ≥ 2,5). At den ender som criterion i et action-flag skyldes at
  // det konverterede insulin (152,79 pmol/L > 80) løfter flaget til action — men
  // datagrundlaget (insulin vs. homair) er internt modstridende og burde flages først.
  const cm = classifyAll([
    { id: "insulin", value: 22, unit: "µIU/mL", sex: "male", age: 55 },
    { id: "glukose", value: 5.9, unit: "mmol/L", sex: "male", age: 55 },
    { id: "homair", value: 1.9, unit: "indeks", sex: "male", age: 55 },
  ]);
  const risks = assessRisks(cm, "male");
  const ir = risks.find((f) => f.id === "insulin_resistance");

  // Hvis et insulin_resistance(action) overhovedet rejses, må det ikke citere en
  // ren watch-bånds-HOMA-IR (1,9) som action-criterion uden at have krydstjekket inputs.
  if (ir && ir.severity === "action") {
    assert.ok(
      !ir.criteria.some((c) => /HOMA-IR\s*1[.,]9\b/.test(c)),
      `action-flag må ikke citere watch-bånds-HOMA-IR 1,9 som criterion uden krydstjek; fik criteria=[${ir.criteria.join(", ")}]`,
    );
  }
});

// --- (2) OR-logik: optimalt blodsukkerbillede + optimal HOMA-IR som "evidens" ---
//   trap-096: HOMA-IR=0,84 (optimal), glukose=5,0 (optimal), hba1c=33 (optimal),
//   insulin=1.000.000 pmol/L (absurd). assessRisks: (homair>=2,5) OR (insulin>80)
//   → action, criteria viser ALTID både HOMA-IR og fasteinsulin (clinical.ts assessRisks).
test("C-12: action-'insulinresistens' må ikke udløses når HOMA-IR + glukose + HbA1c alle er optimale (trap-096)", () => {
  const cm = classifyAll([
    { id: "homair", value: 0.84, unit: "indeks", sex: "female", age: 51 },
    { id: "glukose", value: 5.0, unit: "mmol/L", sex: "female", age: 51 },
    { id: "hba1c", value: 33, unit: "mmol/mol", sex: "female", age: 51 },
    { id: "insulin", value: 1000000, unit: "pmol/L", sex: "female", age: 51 },
  ]);
  const homa = cm.find((m) => m.id === "homair");
  const glu = cm.find((m) => m.id === "glukose");
  const hba1c = cm.find((m) => m.id === "hba1c");
  assert.equal(homa.status, "optimal", "forudsætning: HOMA-IR skal være 'optimal'");
  assert.equal(glu.status, "optimal", "forudsætning: glukose skal være 'optimal'");
  assert.equal(hba1c.status, "optimal", "forudsætning: HbA1c skal være 'optimal'");

  const risk = assessRisks(cm, "female").find((r) => r.id === "insulin_resistance");
  assert.equal(
    risk,
    undefined,
    `action-'insulin_resistance' modsiger et fuldstændigt optimalt blodsukkerbillede` +
      (risk ? ` (criteria: [${risk.criteria.join(", ")}])` : ""),
  );
});

test("C-12: hvis flaget udløses, må criteria ikke vise en OPTIMAL HOMA-IR som evidens (metabolic-093)", () => {
  const cm = classifyAll([
    { id: "homair", value: 1.1, unit: "indeks", sex: "male", age: 47 },
    { id: "glukose", value: 6.8, unit: "mmol/L", sex: "male", age: 47 },
    { id: "hba1c", value: 46, unit: "mmol/mol", sex: "male", age: 47 },
    { id: "insulin", value: 140, unit: "pmol/L", sex: "male", age: 47 },
  ]);
  const homa = cm.find((m) => m.id === "homair");
  assert.equal(homa.status, "optimal", "forudsætning: HOMA-IR=1,1 skal være 'optimal'");

  const risk = assessRisks(cm, "male").find((r) => r.id === "insulin_resistance");
  if (risk) {
    assert.equal(
      risk.criteria.some((c) => /HOMA-IR/i.test(c)),
      false,
      `insulin_resistance fremviser en OPTIMAL HOMA-IR (${homa.value}) som evidens: [${risk.criteria.join(", ")}]`,
    );
  }
});

// --- (3) Indbyrdes inkonsistent alvors-rangering vs. metabolic_risk ---
//   mixed-realistic-134: insulin_resistance('action') outranger metabolic_risk('watch')
//   selvom HOMA-IR=1,9 ligger under selv watch-tærsklen (2,0).
const SEVERITY_RANK = { watch: 1, action: 2 };
test("C-14: insulinresistens må ikke rangere HØJERE end et samtidigt 'begyndende' metabolic_risk når HOMA-IR er sub-watch", () => {
  const cm = classifyAll([
    { id: "taljemaal", value: 102, unit: "cm", sex: "male", age: 55 },
    { id: "glukose", value: 5.9, unit: "mmol/L", sex: "male", age: 55 },
    { id: "homair", value: 1.9, unit: "indeks", sex: "male", age: 55 },
    { id: "insulin", value: 22, unit: "µIU/mL", sex: "male", age: 55 },
  ]);
  const risks = assessRisks(cm, "male");
  const mr = risks.find((r) => r.id === "metabolic_risk");
  const ir = risks.find((r) => r.id === "insulin_resistance");

  assert.ok(mr, `forventede metabolic_risk-flag; fik [${risks.map((r) => r.id).join(", ")}]`);
  assert.ok(ir, `forventede insulin_resistance-flag; fik [${risks.map((r) => r.id).join(", ")}]`);
  assert.equal(mr.severity, "watch", `forventede metabolic_risk='watch', fik '${mr.severity}'`);
  assert.ok(
    cm.find((m) => m.id === "homair").value < 2.0,
    "forudsætning: HOMA-IR skal være sub-watch (< 2,0)",
  );

  assert.ok(
    SEVERITY_RANK[ir.severity] <= SEVERITY_RANK[mr.severity],
    `insulinresistens ('${ir.severity}') må ikke rangere højere end et samtidigt 'begyndende' ` +
      `metabolic_risk ('${mr.severity}'), når HOMA-IR ligger under watch-tærsklen — alvorsgraderne ` +
      `er indbyrdes inkonsistente (insulin-grenen >80 pmol/L affyrer 'action' på et sub-watch insulinbillede).`,
  );
});
