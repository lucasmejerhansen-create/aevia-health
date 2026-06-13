import type { BiologicalAge, ClassifiedMarker, Sex } from "./types.js";

/**
 * TRIN 3 — BIOLOGISK ALDER (transparent estimat, aldrig en diagnose).
 *
 * VALGT MODEL: PhenoAge (Levine et al., 2018, "An epigenetic biomarker of aging
 * for lifespan and healthspan", Aging).
 *
 * BEGRUNDELSE (datakrav · transparens · beregnerbarhed uden ML):
 *  - Datakrav: PhenoAge bruger 9 markører + kronologisk alder. ALLE 9 findes
 *    allerede i Aevias 74-markørs panel (albumin, kreatinin, glukose, hs-CRP,
 *    lymfocyt-%, MCV, RDW, basisk fosfatase, leukocytter). Vi behøver ingen ny
 *    dataindsamling.
 *  - Transparens: en publiceret, peer-reviewed lineær kombination + Gompertz-
 *    mortalitetsmodel. Hver koefficient kan vises og forklares for kunde og læge.
 *  - Beregnerbarhed: ren aritmetik. Ingen trænet ML-model, ingen vægtfiler,
 *    deterministisk og enhedstestbar.
 *
 * Fravalg: GrimAge kræver DNA-methylering (har vi ikke). En "simpel vægtet
 * model" ville være uvalideret og svær at forsvare klinisk.
 *
 * ⚠️  Koefficienter og enhedsantagelser SKAL valideres af Judit før klinisk brug.
 *     Særligt: hs-CRP konverteres mg/L → mg/dL (÷10), og lymfocyt-% udledes af
 *     lymfocytter/leukocytter. Begge antagelser skal bekræftes.
 */

/** PhenoAge-koefficienter (Levine 2018). Enheder noteret pr. led. */
const PHENOAGE = {
  intercept: -19.9067,
  albumin: -0.0336, // g/L
  creatinine: 0.0095, // µmol/L
  glucose: 0.1953, // mmol/L
  lnCrp: 0.0954, // ln(CRP i mg/dL)
  lymphocytePct: -0.012, // %
  mcv: 0.0268, // fL
  rdw: 0.3306, // %
  alp: 0.00188, // U/L
  wbc: 0.0554, // ×10⁹/L (1000 celler/µL)
  age: 0.0804, // år
  gamma: 0.0076927, // Gompertz
  tmonths: 120,
} as const;

const REQUIRED_INPUTS = 9;

interface PhenoInputs {
  albumin: number;
  creatinine: number;
  glucose: number;
  crpMgDl: number;
  lymphocytePct: number;
  mcv: number;
  rdw: number;
  alp: number;
  wbc: number;
}

/** Trækker PhenoAge-input ud af markørerne. Returnerer null hvis et input mangler. */
function extractPhenoInputs(values: Map<string, number>): PhenoInputs | null {
  const albumin = values.get("albumin");
  const creatinine = values.get("kreatinin");
  const glucose = values.get("glukose");
  const crpMgL = values.get("hscrp");
  const lymf = values.get("lymfocytter");
  const wbc = values.get("leukocytter");
  const mcv = values.get("mcv");
  const rdw = values.get("rdw");
  const alp = values.get("basiskfosfatase");

  if (
    albumin == null || creatinine == null || glucose == null || crpMgL == null ||
    lymf == null || wbc == null || mcv == null || rdw == null || alp == null || wbc === 0
  ) {
    return null;
  }

  return {
    albumin,
    creatinine,
    glucose,
    crpMgDl: crpMgL / 10, // hs-CRP mg/L → mg/dL (antagelse — valideres af Judit)
    lymphocytePct: (lymf / wbc) * 100, // absolutte tællinger → % (antagelse)
    mcv,
    rdw,
    alp,
    wbc,
  };
}

/** Den rene PhenoAge-formel. Returnerer alder i år. */
function phenoAgeYears(i: PhenoInputs, chronologicalAge: number): number {
  const c = PHENOAGE;
  const lnCrp = Math.log(Math.max(i.crpMgDl, 0.01)); // gulv mod ln(0)

  const xb =
    c.intercept +
    c.albumin * i.albumin +
    c.creatinine * i.creatinine +
    c.glucose * i.glucose +
    c.lnCrp * lnCrp +
    c.lymphocytePct * i.lymphocytePct +
    c.mcv * i.mcv +
    c.rdw * i.rdw +
    c.alp * i.alp +
    c.wbc * i.wbc +
    c.age * chronologicalAge;

  const mortalityScore =
    1 - Math.exp((-Math.exp(xb) * (Math.exp(c.gamma * c.tmonths) - 1)) / c.gamma);

  // Invertér mortalitetsscore til alder (Levine 2018, ligning til PhenoAge).
  const phenoAge = 141.50225 + Math.log(-0.00553 * Math.log(1 - mortalityScore)) / 0.090165;
  return phenoAge;
}

/**
 * Fallback når PhenoAge-input mangler: app'ens markør-heuristik (score.ts
 * `bioAgeDelta`) lagt oven på kronologisk alder. Hver optimal markør trækker
 * 0,1 år fra; hver markant afvigelse lægger 0,15 år til; afgrænset ±8 år.
 */
function heuristicAge(classified: ClassifiedMarker[], chronologicalAge: number): number {
  let delta = 0;
  for (const m of classified) {
    if (m.status === "optimal") delta -= 0.1;
    else if (m.status === "action" || m.status === "watch") delta += 0.15;
  }
  delta = Math.max(-8, Math.min(8, delta));
  return chronologicalAge + delta;
}

/**
 * Usikkerhedsinterval. Bevidst transparent: et formidlingsinterval, ikke et
 * statistisk prædiktionsinterval. Base ±3 år ved fuld PhenoAge; udvides 1,5 år
 * pr. manglende input; heuristik-fallback får ±6 år. SKAL kalibreres af Judit.
 */
function confidenceHalfWidth(method: BiologicalAge["method"], inputsUsed: number): number {
  if (method === "marker-heuristic") return 6;
  const missing = REQUIRED_INPUTS - inputsUsed;
  return 3 + missing * 1.5;
}

/**
 * Beregn biologisk alder. Foretrækker PhenoAge; falder tilbage til markør-
 * heuristik hvis et PhenoAge-input mangler. Disclaimer-flaget sættes ALTID.
 */
export function estimateBiologicalAge(
  // Kanoniske værdier (id + value) — typisk de allerede klassificerede markører,
  // så PhenoAge regner på enhedskonverterede værdier, ikke rå fremmed-enheder.
  markers: ReadonlyArray<{ id: string; value: number }>,
  chronologicalAge: number,
  classified?: ClassifiedMarker[]
): BiologicalAge {
  const values = new Map(markers.map((m) => [m.id, m.value]));
  const pheno = extractPhenoInputs(values);
  const phenoIds = ["albumin", "kreatinin", "glukose", "hscrp", "lymfocytter", "leukocytter", "mcv", "rdw", "basiskfosfatase"];

  // Begge modeller forankres i kronologisk alder. Mangler/ugyldig alder → intet
  // estimat (ellers ville heuristikken give ~0 år). PhenoAge er kun valideret
  // for voksne, så vi kræver 18–110 år.
  const ageValid = Number.isFinite(chronologicalAge) && chronologicalAge >= 18 && chronologicalAge <= 110;
  if (!ageValid) {
    return {
      estimatedAge: 0,
      confidenceInterval: [0, 0],
      available: false,
      method: pheno ? "phenoage" : "marker-heuristic",
      inputsUsed: pheno ? REQUIRED_INPUTS : phenoIds.filter((id) => values.has(id)).length,
      inputsRequired: REQUIRED_INPUTS,
      biologicalAgeDisclaimer: true,
    };
  }

  if (pheno) {
    const raw = phenoAgeYears(pheno, chronologicalAge);
    const estimatedAge = Math.round(raw);
    const half = confidenceHalfWidth("phenoage", REQUIRED_INPUTS);
    return {
      estimatedAge,
      confidenceInterval: [Math.round(estimatedAge - half), Math.round(estimatedAge + half)],
      available: true,
      method: "phenoage",
      inputsUsed: REQUIRED_INPUTS,
      inputsRequired: REQUIRED_INPUTS,
      biologicalAgeDisclaimer: true,
    };
  }

  // Fallback. Tæl hvor mange PhenoAge-input vi rent faktisk havde (til transparens).
  const inputsUsed = phenoIds.filter((id) => values.has(id)).length;
  const estimatedAge = Math.round(heuristicAge(classified ?? [], chronologicalAge));
  const half = confidenceHalfWidth("marker-heuristic", inputsUsed);
  return {
    estimatedAge,
    confidenceInterval: [Math.round(estimatedAge - half), Math.round(estimatedAge + half)],
    available: true,
    method: "marker-heuristic",
    inputsUsed,
    inputsRequired: REQUIRED_INPUTS,
    biologicalAgeDisclaimer: true,
  };
}

export type { Sex };
