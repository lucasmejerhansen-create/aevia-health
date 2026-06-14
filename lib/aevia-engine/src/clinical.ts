import type {
  ActionItem,
  ClassifiedMarker,
  HealthspanResult,
  MarkerCategory,
  MarkerPattern,
  RiskFlag,
  Sex,
} from "./types.js";
import { CATEGORY_ADVICE } from "./reference-data.js";

/**
 * DETERMINISTISK KLINISK LAG — mønstre, risici, handlingsplan og healthspan.
 *
 * AI rører ALDRIG dette. Alt er regler over de allerede klassificerede (kanoniske,
 * sex-justerede) markørværdier. Tærskler er etablerede kliniske kriterier hvor
 * muligt (ATP III for metabolisk syndrom m.m.).
 *
 * ⚠️  Tærskler og mønstre SKAL valideres af Judit før klinisk brug.
 */

// ---- Hjælpere over klassificerede markører --------------------------------
function find(cm: ClassifiedMarker[], id: string): ClassifiedMarker | undefined {
  return cm.find((c) => c.id === id);
}
function val(cm: ClassifiedMarker[], id: string): number | null {
  const m = find(cm, id);
  return m && Number.isFinite(m.value) ? m.value : null;
}
function isHigh(cm: ClassifiedMarker[], id: string): boolean {
  const m = find(cm, id);
  return !!m && Number.isFinite(m.value) && m.value > m.optimal[1];
}
function isLow(cm: ClassifiedMarker[], id: string): boolean {
  const m = find(cm, id);
  return !!m && Number.isFinite(m.value) && m.value < m.optimal[0];
}
function present(cm: ClassifiedMarker[], ids: string[]): string[] {
  return ids.filter((id) => find(cm, id));
}

// ---- Mønster-detektion ----------------------------------------------------
export function detectPatterns(cm: ClassifiedMarker[]): MarkerPattern[] {
  const out: MarkerPattern[] = [];
  const hi = (id: string) => isHigh(cm, id);
  const lo = (id: string) => isLow(cm, id);

  if ((hi("alat") || hi("ggt")) && (hi("triglycerid") || hi("fedtprocent") || hi("taljemaal"))) {
    out.push({ id: "fatty_liver", label: "Muligt fedtlever-mønster", severity: "watch",
      detail: "Forhøjede leverenzymer sammen med tegn på metabolisk belastning.",
      markers: present(cm, ["alat", "ggt", "triglycerid", "fedtprocent", "taljemaal"]) });
  }
  if (lo("b12") && (hi("homocystein") || hi("mcv"))) {
    out.push({ id: "b12_deficiency", label: "B12-mangel-mønster", severity: "watch",
      detail: "Lav B12 sammen med forhøjet homocystein og/eller MCV.",
      markers: present(cm, ["b12", "homocystein", "mcv"]) });
  }
  if (lo("ferritin") && (lo("transferrin") || lo("haemoglobin") || lo("mcv"))) {
    out.push({ id: "iron_deficiency", label: "Jernmangel-mønster", severity: "watch",
      detail: "Lave jerndepoter sammen med tegn på begyndende blodmangel.",
      markers: present(cm, ["ferritin", "transferrin", "haemoglobin", "mcv"]) });
  }
  if (hi("hscrp") && (hi("fibrinogen") || hi("sr"))) {
    out.push({ id: "inflammation", label: "Forhøjet systemisk inflammation", severity: "watch",
      detail: "Flere inflammationsmarkører er forhøjede samtidig.",
      markers: present(cm, ["hscrp", "fibrinogen", "sr"]) });
  }
  if (hi("tsh") && (lo("ft4") || lo("ft3"))) {
    out.push({ id: "hypothyroid", label: "Muligt lavt stofskifte", severity: "action",
      detail: "Forhøjet TSH sammen med lavt frit T4/T3 — bør vurderes af læge.",
      markers: present(cm, ["tsh", "ft4", "ft3"]) });
  }
  return out;
}

// ---- Etablerede risiko-flag -----------------------------------------------
export function assessRisks(cm: ClassifiedMarker[], sex: Sex): RiskFlag[] {
  const out: RiskFlag[] = [];

  // Metabolisk syndrom (ATP III: ≥3 af 5 kriterier)
  const crit: string[] = [];
  const waist = val(cm, "taljemaal");
  const wThr = sex === "female" ? 88 : 102;
  if (waist != null && waist >= wThr) crit.push(`taljemål ≥${wThr} cm`);
  const tg = val(cm, "triglycerid");
  if (tg != null && tg >= 1.7) crit.push("triglycerid ≥1,7 mmol/L");
  const hdl = val(cm, "hdl");
  const hThr = sex === "female" ? 1.3 : 1.0;
  if (hdl != null && hdl < hThr) crit.push(`HDL <${hThr} mmol/L`);
  const sys = val(cm, "blodtryksys");
  const dia = val(cm, "blodtrykdia");
  if ((sys != null && sys >= 130) || (dia != null && dia >= 85)) crit.push("blodtryk ≥130/85 mmHg");
  const glu = val(cm, "glukose");
  if (glu != null && glu >= 5.6) crit.push("fasteglukose ≥5,6 mmol/L");
  if (crit.length >= 3) {
    out.push({ id: "metabolic_syndrome", label: "Metabolisk syndrom", severity: "action",
      detail: `${crit.length} af 5 kriterier opfyldt (≥3 = metabolisk syndrom, ATP III).`, criteria: crit });
  } else if (crit.length === 2) {
    out.push({ id: "metabolic_risk", label: "Begyndende metabolisk risiko", severity: "watch",
      detail: "2 af 5 kriterier for metabolisk syndrom opfyldt.", criteria: crit });
  }

  // Insulinresistens (HOMA-IR / fasteinsulin)
  const homa = val(cm, "homair");
  const ins = val(cm, "insulin");
  if ((homa != null && homa >= 2.5) || (ins != null && ins > 80)) {
    out.push({ id: "insulin_resistance", label: "Insulinresistens", severity: "action",
      detail: "HOMA-IR/fasteinsulin tyder på nedsat insulinfølsomhed.",
      criteria: [homa != null ? `HOMA-IR ${homa}` : "", ins != null ? `fasteinsulin ${ins} pmol/L` : ""].filter(Boolean) });
  } else if ((homa != null && homa >= 2.0) || (ins != null && ins > 60)) {
    out.push({ id: "insulin_watch", label: "Tidlig insulinresistens", severity: "watch",
      detail: "Let forhøjet HOMA-IR/fasteinsulin — et tidligt signal før blodsukkeret reagerer.",
      criteria: [homa != null ? `HOMA-IR ${homa}` : "", ins != null ? `fasteinsulin ${ins} pmol/L` : ""].filter(Boolean) });
  }

  // Hjerte-kar-lipidbyrde (IKKE en fuld SCORE2 — rygestatus mangler)
  const lipidCrit: string[] = [];
  if (isHigh(cm, "apob")) lipidCrit.push("ApoB forhøjet");
  if (isHigh(cm, "ldl")) lipidCrit.push("LDL forhøjet");
  const lpa = val(cm, "lpa");
  if (lpa != null && lpa > 75) lipidCrit.push("Lp(a) >75 nmol/L (arvelig)");
  if (lipidCrit.length > 0) {
    const severe = isHigh(cm, "apob") || (lpa != null && lpa > 125);
    out.push({ id: "cvd_lipid_burden", label: "Forhøjet hjerte-kar-lipidbyrde", severity: severe ? "action" : "watch",
      detail: "Aterogene lipider er forhøjede. Bemærk: ikke en fuld risikoscore (rygestatus/blodtrykshistorik mangler).", criteria: lipidCrit });
  }

  return out;
}

// ---- Handlingsplan --------------------------------------------------------
const CATEGORY_FOCUS: Record<MarkerCategory, { title: string; evidence: ActionItem["evidence"] }> = {
  hjerte: { title: "Sænk hjerte-kar-risiko", evidence: "stærk" },
  blodsukker: { title: "Stabilisér blodsukker & insulin", evidence: "stærk" },
  inflammation: { title: "Dæmp lavgradig inflammation", evidence: "moderat" },
  lever: { title: "Aflast leveren", evidence: "moderat" },
  nyrer: { title: "Støt nyrer & væskebalance", evidence: "moderat" },
  vitaminer: { title: "Ret vitamin-/mineralmangel", evidence: "moderat" },
  hormoner: { title: "Balancér hormoner via livsstil", evidence: "moderat" },
  thyroidea: { title: "Følg op på stofskiftet", evidence: "moderat" },
  blodstatus: { title: "Afklar blod-/jernstatus", evidence: "moderat" },
  fysiologi: { title: "Løft kondition & kropskomposition", evidence: "stærk" },
};

export function buildActionPlan(cm: ClassifiedMarker[]): ActionItem[] {
  const flagged = cm.filter((m) => m.status === "action" || m.status === "watch");
  const byCat = new Map<MarkerCategory, ClassifiedMarker[]>();
  for (const m of flagged) {
    const arr = byCat.get(m.category) ?? [];
    arr.push(m);
    byCat.set(m.category, arr);
  }
  // Sortér: kategorier med action-markører først.
  const cats = [...byCat.entries()].sort((a, b) => {
    const aAct = a[1].some((m) => m.status === "action") ? 0 : 1;
    const bAct = b[1].some((m) => m.status === "action") ? 0 : 1;
    return aAct - bAct;
  });
  const out: ActionItem[] = cats.map(([cat, ms]) => {
    const focus = CATEGORY_FOCUS[cat];
    return { category: cat, title: focus.title, why: CATEGORY_ADVICE[cat], markerIds: ms.map((m) => m.id), evidence: focus.evidence };
  });
  // Altid: re-test-anbefaling.
  out.push({
    category: "fysiologi",
    title: "Re-test om 3-12 måneder",
    why: "Mangler og livsstilsmarkører re-testes efter ~3 måneder; de fleste øvrige efter 12 måneder, så du kan se effekten.",
    markerIds: [],
    evidence: "stærk",
  });
  return out;
}

// ---- Healthspan-fase ------------------------------------------------------
export function healthspanPhase(scoreTotal: number, actionCount: number): HealthspanResult {
  if (scoreTotal >= 85 && actionCount === 0)
    return { phase: "optimering", label: "Optimering", rationale: "Stærkt udgangspunkt — fokus på at fastholde og finjustere." };
  if (scoreTotal >= 70 && actionCount <= 1)
    return { phase: "vedligehold", label: "Vedligehold", rationale: "Solidt niveau med få indsatsområder." };
  if (scoreTotal >= 55)
    return { phase: "opbygning", label: "Opbygning", rationale: "Flere markører kan løftes — god mulighed for målbar fremgang." };
  return { phase: "fokus", label: "Tid til fokus", rationale: "Flere områder kræver opmærksomhed; start med de lægeflagede." };
}

// ---- Datagrundlag (valideret vs. udledt) ----------------------------------
export function validationSummary(cm: ClassifiedMarker[]): { validated: number; derived: number; total: number } {
  let derived = 0;
  for (const m of cm) {
    if ((m.issues ?? []).some((i) => i.code === "unvalidated_range")) derived++;
  }
  return { validated: cm.length - derived, derived, total: cm.length };
}
