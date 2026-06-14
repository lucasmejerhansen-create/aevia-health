/**
 * Delte typer for Aevia-motoren.
 *
 * KERNEPRINCIPPER (må aldrig brydes):
 *  1. AI klassificerer ALDRIG — kun deterministiske regler i denne motor gør.
 *  2. AI ser ALDRIG PII — kun DeidentifiedData / ReportDraft forlader serveren mod AI-laget.
 *  3. Lægen er sidst — ingen rapport frigives uden eksplicit lægegodkendelse.
 *  4. Biologisk alder er et ESTIMAT — altid med usikkerhedsinterval og disclaimer-flag.
 */

/** Biologisk køn i motorens eksterne kontrakt (spec). */
export type Sex = "male" | "female";

/**
 * Motorens 10 markørkategorier. Identiske id'er som app'ens `MarkerCategory`
 * (src/markers.ts) — så app og backend deler ét vokabular.
 */
export type MarkerCategory =
  | "hjerte" // 1. Lipider & hjerte-kar
  | "blodsukker" // 2. Metabolisme & blodsukker
  | "inflammation" // 3. Inflammation
  | "lever" // 4. Lever
  | "nyrer" // 5. Nyrer & væskebalance
  | "vitaminer" // 6. Vitaminer & mineraler
  | "hormoner" // 7. Hormoner (kønsspecifikke)
  | "thyroidea" // 8. Skjoldbruskkirtel
  | "blodstatus" // 9. Blod & jernstatus
  | "fysiologi"; // 10. Kondition + kropskomposition (VO2max, hvilepuls, MR)

/** De fire deterministiske tilstande en markør kan klassificeres i. */
export type MarkerStatus = "optimal" | "ok" | "watch" | "action";

/** Rå input til klassificering — ét målepunkt for én markør. */
export interface MarkerInput {
  id: string;
  value: number;
  unit: string;
  sex: Sex;
  age: number;
}

/** Resultatet af deterministisk klassificering af én markør. */
export interface ClassifiedMarker {
  id: string;
  value: number;
  /** Enheden `value` er udtrykt i: kanonisk ved match/konvertering, ellers den rå
   *  input-enhed (så en ukonverteret værdi ikke fejlmærkes med kanonisk enhed). */
  unit?: string;
  /** Sat når værdien er enhedskonverteret — den oprindelige værdi + enhed fra rapporten. */
  converted?: { from: number; unit: string };
  status: MarkerStatus;
  category: MarkerCategory;
  /** % afvigelse fra midtpunktet af optimal-zonen (0 = præcist i midten). */
  deviation: number;
  /** Sex-justeret optimal-zone [low, high]. */
  optimal: [number, number];
  /** Sex-justeret referenceinterval [low, high]; null = åben/ingen grænse den vej. */
  reference: [number | null, number | null];
  /** Klartekst-forklaring fra reference-data (porteret fra app'ens markers.ts). */
  explanation: string;
  /** Sande fejl-/datakvalitetssituationer der skal ses af et menneske, ikke skjules. */
  issues?: ClassificationIssue[];
}

/** Datakvalitetsproblem fundet under klassificering (fx ukendt markør, forkert enhed). */
export interface ClassificationIssue {
  code: "unknown_marker" | "unit_mismatch" | "unit_converted" | "non_finite_value" | "unvalidated_range";
  message: string;
}

/** Aevia-score (0-100) med fuldt transparent nedbrydning. */
export interface AeviaScore {
  total: number; // 0-100
  components: {
    markers: number; // 50% vægt — markør-klassificering
    // null ved baseline: ingen protokol/tidligere test endnu.
    adherence: number | null; // 35% vægt — efterlevelse
    momentum: number | null; // 15% vægt — fremgang siden sidste test
  };
  /** Score pr. markørkategori (0-100). */
  breakdown: Record<string, number>;
  /**
   * true ved første test: efterlevelse + momentum forudsætter en protokol og en
   * tidligere test, så scoren er REN markør-score (100% vægt på markører).
   */
  baseline: boolean;
}

/** Biologisk alder som transparent estimat — aldrig en diagnose. */
export interface BiologicalAge {
  estimatedAge: number;
  confidenceInterval: [number, number];
  /**
   * false hvis estimatet ikke kan beregnes (fx manglende/ugyldig kronologisk
   * alder). Så skal estimatedAge IKKE vises som et tal.
   */
  available: boolean;
  /** Hvilken model der blev brugt. */
  method: "phenoage" | "marker-heuristic";
  /** Hvor mange af modellens påkrævede input der var til stede. */
  inputsUsed: number;
  inputsRequired: number;
  /** ALDRIG udelades — markerer at tallet er et estimat, ikke en konklusion. */
  biologicalAgeDisclaimer: true;
}

/** Tilstande i rapport-pipelinen. Læge står altid mellem draft og frigivelse. */
export type ReportStatus =
  | "raw_data"
  | "classified"
  | "draft_pending_doctor"
  | "approved_for_release"
  | "rejected";

/** Rå patientdata — indeholder PII. Forlader ALDRIG serveren mod AI-laget. */
export interface RawPatientData {
  name: string;
  cpr: string;
  email: string;
  age: number;
  sex: Sex;
  markers: MarkerInput[];
}

/** Pseudonymiseret data — det eneste der må sendes til AI-formulering. */
export interface DeidentifiedData {
  pseudoId: string; // UUID — ingen kobling til PII
  ageBand: string; // fx "50-54" — ikke præcis alder
  sex: Sex;
  markers: MarkerInput[];
  // name, cpr, email er ALDRIG til stede
}

/** Sværhedsgrad for kliniske fund (mønstre, risici). */
export type ClinicalSeverity = "info" | "watch" | "action";

/** Et klinisk mønster på tværs af flere markører (deterministisk regel). */
export interface MarkerPattern {
  id: string;
  label: string;
  detail: string;
  severity: ClinicalSeverity;
  /** Markør-id'er der udløste mønsteret. */
  markers: string[];
}

/** En etableret risiko-vurdering (deterministisk kriterie). */
export interface RiskFlag {
  id: string;
  label: string;
  severity: ClinicalSeverity;
  detail: string;
  /** Hvilke markører/kriterier der indgik. */
  criteria: string[];
}

/** Et handlingsplan-punkt udledt deterministisk af flagede markører. */
export interface ActionItem {
  category: MarkerCategory;
  title: string;
  why: string;
  markerIds: string[];
  evidence: "stærk" | "moderat" | "tidlig";
}

/** Healthspan-fase (illustrativ placering). */
export interface HealthspanResult {
  phase: "optimering" | "vedligehold" | "opbygning" | "fokus";
  label: string;
  rationale: string;
}

/** Struktureret draft klar til AI-formulering og lægegodkendelse. PII er ALDRIG til stede. */
export interface ReportDraft {
  pseudoId: string;
  ageBand: string;
  sex: Sex;
  classifiedMarkers: ClassifiedMarker[];
  aeviaScore: AeviaScore;
  biologicalAge: BiologicalAge;
  /** Alle markører i tilstand "action" — løftes eksplicit til lægen. */
  flaggedForDoctor: ClassifiedMarker[];
  /** Percentil vs. aldersgruppe for udvalgte fysiologiske markører (0-100). */
  percentiles: Record<string, number>;
  /** Deterministiske kliniske mønstre på tværs af markører. */
  patterns: MarkerPattern[];
  /** Etablerede risiko-flag (metabolisk syndrom, insulinresistens m.m.). */
  risks: RiskFlag[];
  /** Deterministisk handlingsplan udledt af flagede markører. */
  actionPlan: ActionItem[];
  /** Healthspan-fase (illustrativ). */
  healthspan: HealthspanResult;
  /** Datagrundlag: hvor mange intervaller er lægefagligt valideret vs. udledt. */
  validation: { validated: number; derived: number; total: number };
  status: "draft_pending_doctor";
  biologicalAgeDisclaimer: true;
  // PII er ALDRIG til stede i dette objekt
}
