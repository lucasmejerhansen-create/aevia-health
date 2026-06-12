import type { MarkerCategory, Sex } from "./types.js";

/**
 * KANONISK KLINISK REFERENCEDATA — motorens single source of truth.
 *
 * Optimal-zoner, enheder, kønsoverrides og klartekst er PORTERET 1:1 fra
 * app'ens src/markers.ts (Aevia App), så app og backend klassificerer ens.
 *
 * ⚠️  KLINISK VALIDERING UDESTÅR
 *  - Optimal-zonerne stammer fra app'en og er endnu IKKE lægefagligt signed off.
 *  - REFERENCEINTERVALLERNE findes ikke i app'en. De udledes her deterministisk
 *    (se RANGE_MODEL) indtil Judit Kolovics (overlæge) leverer validerede
 *    intervaller pr. markør via feltet `reference`. Alt udledt markeres
 *    `validated: false` ud i klassificeringen.
 *  - Directionality (lowerIsBetter / higherIsBetter) er sat konservativt;
 *    tvivlstilfælde behandles tosidet og flagges til Judit.
 */

export interface MarkerDef {
  id: string;
  name: string;
  unit: string;
  category: MarkerCategory;
  optimalLow: number;
  optimalHigh: number;
  /** Lavere er bedre (fx ApoB, hs-CRP) — kun den høje side eskalerer. */
  lowerIsBetter?: boolean;
  /** Højere er bedre (fx VO2max, HDL) — kun den lave side eskalerer. */
  higherIsBetter?: boolean;
  explainer: string;
  decimals?: number;
  /**
   * Lægefagligt valideret referenceinterval [low, high].
   * Når sat: bruges direkte og klassificeres som valideret.
   * Når udeladt: udledes fra optimal-zonen (RANGE_MODEL) og flagges uvalideret.
   */
  reference?: [number, number];
}

/**
 * Deterministisk udledning af reference- og watch-grænser ud fra optimal-zonen,
 * når et valideret `reference` ikke er angivet. Rene, dokumenterede faktorer —
 * ingen skjult magi. ERSTATTES af Judits intervaller markør for markør.
 */
export const RANGE_MODEL = {
  /**
   * MULTIPLIKATIV udvidelse i forhold til optimal-grænsens MAGNITUDE (ikke span).
   * Additiv span-udvidelse gav klinisk meningsløse bånd for brede markører
   * (fx testosteron 15-30 → negativt watch-gulv). Procent af grænseværdien
   * skalerer korrekt på tværs af alle 74 markører.
   *
   *   reference = optimal-grænse ± 25%
   *   watch     = optimal-grænse ± 60%   (uden for = action)
   */
  referenceWiden: 0.25,
  watchWiden: 0.6,
  /** Valideret reference udvides dette × grænseværdi for at danne watch-båndet. */
  watchBeyondReference: 0.25,
} as const;

/**
 * Kønsspecifikke optimal-zoner — porteret 1:1 fra FEMALE_RANGES i app'ens
 * markers.ts. Kun markører med reel klinisk kønsforskel er medtaget.
 */
const FEMALE_OPTIMAL: Record<string, [number, number]> = {
  testosteron: [0.7, 2.0],
  frittestosteron: [15, 40],
  shbg: [40, 110],
  oestradiol: [100, 600], // varierer med cyklus — tolkes m. cyklusdag
  dheas: [2.5, 8],
  haemoglobin: [7.3, 9.5],
  haematokrit: [36, 46],
  erytrocytter: [3.9, 5.2],
  ferritin: [40, 120],
  jern: [10, 26],
  kreatinin: [50, 90],
  urat: [0.15, 0.34],
  vo2max: [36, 52],
  gribestyrke: [26, 42],
  fedtprocent: [18, 28],
  taljemaal: [65, 80],
};

/** Det fulde 74-markørs panel (10 kategorier). */
export const MARKERS: MarkerDef[] = [
  // ---- 1. Lipider & hjerte-kar (10) ----------------------------------------
  { id: "totalkolesterol", name: "Totalkolesterol", unit: "mmol/L", category: "hjerte", optimalLow: 3.5, optimalHigh: 5.0, explainer: "Den samlede mængde kolesterol i blodet. Et groft overbliksmål — de enkelte dele (LDL, HDL, ApoB) fortæller mere præcist hvor du står." },
  { id: "ldl", name: "LDL-kolesterol", unit: "mmol/L", category: "hjerte", optimalLow: 1.0, optimalHigh: 2.6, lowerIsBetter: true, explainer: "Det kolesterol der kan sætte sig i årevæggene. Jo lavere over et helt liv, jo lavere risiko for hjerte-kar-sygdom." },
  { id: "hdl", name: "HDL-kolesterol", unit: "mmol/L", category: "hjerte", optimalLow: 1.2, optimalHigh: 2.5, higherIsBetter: true, explainer: "Ofte kaldt 'det gode kolesterol' — det hjælper med at transportere kolesterol væk fra årerne. Motion og normalvægt løfter det." },
  { id: "triglycerid", name: "Triglycerider", unit: "mmol/L", category: "hjerte", optimalLow: 0.4, optimalHigh: 1.0, lowerIsBetter: true, explainer: "Fedt i blodet. Høje værdier hænger ofte sammen med sukker, alkohol og lavt aktivitetsniveau — og falder hurtigt når vanerne ændres." },
  { id: "apob", name: "ApoB", unit: "g/L", category: "hjerte", optimalLow: 0.4, optimalHigh: 0.8, lowerIsBetter: true, explainer: "Tæller antallet af de partikler der kan sætte sig i dine årevægge — en bedre risikomarkør for hjerte-kar-sygdom end almindeligt kolesterol.", decimals: 2 },
  { id: "apoa1", name: "ApoA1", unit: "g/L", category: "hjerte", optimalLow: 1.4, optimalHigh: 2.0, higherIsBetter: true, explainer: "Proteinet i det 'gode' HDL-kolesterol. Højere niveauer afspejler bedre transport af kolesterol væk fra årerne.", decimals: 2 },
  { id: "apobratio", name: "ApoB/ApoA1-ratio", unit: "ratio", category: "hjerte", optimalLow: 0.3, optimalHigh: 0.6, lowerIsBetter: true, explainer: "Balancen mellem de partikler der belaster årerne, og dem der beskytter. Et af de stærkeste samlede mål for hjerte-kar-risiko.", decimals: 2 },
  { id: "lpa", name: "Lipoprotein(a)", unit: "nmol/L", category: "hjerte", optimalLow: 0, optimalHigh: 75, lowerIsBetter: true, explainer: "En arvelig risikofaktor for hjerte-kar-sygdom. Den ændrer sig stort set ikke med livsstil — men er den høj, skal de øvrige risikofaktorer holdes ekstra lave.", decimals: 0 },
  { id: "nonhdl", name: "Non-HDL-kolesterol", unit: "mmol/L", category: "hjerte", optimalLow: 1.5, optimalHigh: 3.0, lowerIsBetter: true, explainer: "Alt det kolesterol der kan belaste årerne, samlet i ét tal. Et godt supplement til ApoB." },
  { id: "omega3", name: "Omega-3-indeks", unit: "%", category: "hjerte", optimalLow: 8, optimalHigh: 12, higherIsBetter: true, explainer: "Hvor stor en andel af dine cellemembraner der består af omega-3-fedtsyrer. Over 8% hænger sammen med lavere hjerte-kar-risiko." },

  // ---- 2. Metabolisme & blodsukker (5) -------------------------------------
  { id: "hba1c", name: "HbA1c (langtidsblodsukker)", unit: "mmol/mol", category: "blodsukker", optimalLow: 28, optimalHigh: 35, lowerIsBetter: true, explainer: "Dit gennemsnitlige blodsukker over de seneste ca. 3 måneder. Lavt og stabilt beskytter mod metabolisk aldring og type 2-diabetes.", decimals: 0 },
  { id: "glukose", name: "Fasteglukose", unit: "mmol/L", category: "blodsukker", optimalLow: 4.2, optimalHigh: 5.4, lowerIsBetter: true, explainer: "Dit blodsukker målt på tom mave. Et øjebliksbillede der supplerer HbA1c — kryber det opad år for år, er det et tidligt advarselstegn." },
  { id: "insulin", name: "Fasteinsulin", unit: "pmol/L", category: "blodsukker", optimalLow: 20, optimalHigh: 60, lowerIsBetter: true, explainer: "Hvor hårdt din bugspytkirtel skal arbejde for at holde blodsukkeret nede. Stiger ofte mange år før blodsukkeret selv gør — et tidligt signal.", decimals: 0 },
  { id: "homair", name: "HOMA-IR (insulinfølsomhed)", unit: "indeks", category: "blodsukker", optimalLow: 0.5, optimalHigh: 1.5, lowerIsBetter: true, explainer: "Et beregnet mål for hvor følsomme dine celler er over for insulin. Lavere betyder at kroppen klarer sukker og stivelse uden at slide på systemet." },
  { id: "cpeptid", name: "C-peptid", unit: "pmol/L", category: "blodsukker", optimalLow: 300, optimalHigh: 700, lowerIsBetter: true, explainer: "Viser hvor meget insulin din krop selv producerer. Bruges sammen med fasteinsulin til at vurdere belastningen på dit stofskifte.", decimals: 0 },

  // ---- 3. Inflammation (4) -------------------------------------------------
  { id: "hscrp", name: "hs-CRP", unit: "mg/L", category: "inflammation", optimalLow: 0, optimalHigh: 1.0, lowerIsBetter: true, explainer: "Et mål for lavgradig inflammation i kroppen. Lave, stabile niveauer hænger sammen med lavere risiko for hjerte-kar-sygdom over tid." },
  { id: "homocystein", name: "Homocystein", unit: "µmol/L", category: "inflammation", optimalLow: 5, optimalHigh: 9, lowerIsBetter: true, explainer: "Et stofskifteprodukt der belaster årevæggene når det er højt. Hænger ofte sammen med lav B12 eller folat — og kan rettes med netop dem." },
  { id: "fibrinogen", name: "Fibrinogen", unit: "g/L", category: "inflammation", optimalLow: 1.8, optimalHigh: 3.0, lowerIsBetter: true, explainer: "Et protein der får blodet til at størkne. Høje niveauer afspejler inflammation og øger tendensen til blodpropper." },
  { id: "sr", name: "Sænkning (SR)", unit: "mm/t", category: "inflammation", optimalLow: 0, optimalHigh: 10, lowerIsBetter: true, explainer: "En klassisk, bred markør for inflammation i kroppen. Bruges sammen med hs-CRP til at fange noget der ulmer.", decimals: 0 },

  // ---- 4. Lever (6) --------------------------------------------------------
  { id: "alat", name: "ALAT", unit: "U/L", category: "lever", optimalLow: 10, optimalHigh: 35, lowerIsBetter: true, explainer: "Det vigtigste leverenzym at følge. Let forhøjet ALAT er ofte første tegn på fedtlever — og falder typisk hurtigt med vægttab og mindre alkohol.", decimals: 0 },
  { id: "asat", name: "ASAT", unit: "U/L", category: "lever", optimalLow: 10, optimalHigh: 35, lowerIsBetter: true, explainer: "Et leverenzym der også findes i muskler. Tolkes sammen med ALAT — hård træning dagen før prøven kan give midlertidigt høje tal.", decimals: 0 },
  { id: "ggt", name: "GGT", unit: "U/L", category: "lever", optimalLow: 10, optimalHigh: 40, lowerIsBetter: true, explainer: "Et leverenzym der er følsomt over for alkohol og fedtophobning i leveren. Et godt 'ærligheds-barometer' for leverens belastning.", decimals: 0 },
  { id: "basiskfosfatase", name: "Basisk fosfatase", unit: "U/L", category: "lever", optimalLow: 35, optimalHigh: 105, explainer: "Et enzym fra lever og knogler. Bruges som kontrolmarkør — afvigelser peger på noget der skal undersøges nærmere.", decimals: 0 },
  { id: "bilirubin", name: "Bilirubin", unit: "µmol/L", category: "lever", optimalLow: 5, optimalHigh: 20, explainer: "Et affaldsstof fra røde blodlegemer som leveren rydder op. Let forhøjede værdier er ofte harmløse (Gilberts syndrom) — men skal kendes.", decimals: 0 },
  { id: "albumin", name: "Albumin", unit: "g/L", category: "lever", optimalLow: 40, optimalHigh: 48, explainer: "Blodets vigtigste transportprotein, lavet i leveren. Et solidt mål for generel ernæringstilstand og leverfunktion.", decimals: 0 },

  // ---- 5. Nyrer & væskebalance (7) -----------------------------------------
  { id: "kreatinin", name: "Kreatinin", unit: "µmol/L", category: "nyrer", optimalLow: 60, optimalHigh: 100, explainer: "Et affaldsstof fra musklerne som nyrerne udskiller. Bruges til at beregne din nyrefunktion — meget muskelmasse giver naturligt højere tal.", decimals: 0 },
  { id: "egfr", name: "eGFR (nyrefunktion)", unit: "mL/min", category: "nyrer", optimalLow: 90, optimalHigh: 130, higherIsBetter: true, explainer: "Et beregnet mål for hvor godt dine nyrer renser blodet. Over 90 er godt — og det falder naturligt en smule med alderen.", decimals: 0 },
  { id: "cystatinc", name: "Cystatin C", unit: "mg/L", category: "nyrer", optimalLow: 0.6, optimalHigh: 1.0, lowerIsBetter: true, explainer: "Et mere præcist mål for nyrefunktion end kreatinin, fordi det ikke påvirkes af muskelmasse. God til at fange tidlige ændringer.", decimals: 2 },
  { id: "urat", name: "Urat (urinsyre)", unit: "mmol/L", category: "nyrer", optimalLow: 0.2, optimalHigh: 0.4, lowerIsBetter: true, explainer: "Høj urinsyre kan give podagra og hænger sammen med højt blodtryk og metabolisk belastning. Falder med mindre fruktose og alkohol.", decimals: 2 },
  { id: "karbamid", name: "Karbamid", unit: "mmol/L", category: "nyrer", optimalLow: 3.0, optimalHigh: 8.0, explainer: "Et affaldsstof fra proteinomsætningen. Tolkes sammen med kreatinin — høj proteinindtagelse eller væskemangel kan give højere tal." },
  { id: "natrium", name: "Natrium", unit: "mmol/L", category: "nyrer", optimalLow: 137, optimalHigh: 144, explainer: "Kroppens vigtigste salt for væskebalance og nervefunktion. Holdes normalt meget stramt af kroppen selv.", decimals: 0 },
  { id: "kalium", name: "Kalium", unit: "mmol/L", category: "nyrer", optimalLow: 3.7, optimalHigh: 4.6, explainer: "Vigtig for hjerterytme og muskelfunktion. Skal ligge i et snævert interval — grøntsager og frugt er de bedste kilder." },

  // ---- 6. Vitaminer & mineraler (10) ---------------------------------------
  { id: "vitd", name: "D-vitamin (25-OH-D)", unit: "nmol/L", category: "vitaminer", optimalLow: 75, optimalHigh: 120, explainer: "Vigtig for immunforsvar, knogler og muskelfunktion. Målet er at lande i det optimale interval — ikke bare over manglegrænsen.", decimals: 0 },
  { id: "b12", name: "B12-vitamin", unit: "pmol/L", category: "vitaminer", optimalLow: 350, optimalHigh: 650, explainer: "Afgørende for nerver, energi og bloddannelse. Værdier i den lave 'normale' ende kan stadig give træthed — derfor sigter vi højere.", decimals: 0 },
  { id: "folat", name: "Folat", unit: "nmol/L", category: "vitaminer", optimalLow: 15, optimalHigh: 35, explainer: "B-vitamin der arbejder sammen med B12, bl.a. om at holde homocystein nede. Grønne grøntsager og bælgfrugter er de bedste kilder.", decimals: 0 },
  { id: "magnesium", name: "Magnesium", unit: "mmol/L", category: "vitaminer", optimalLow: 0.85, optimalHigh: 1.0, explainer: "Indgår i hundredvis af processer — søvn, muskler, blodsukker. Blodprøven fanger kun større mangler, så vi sigter mod den øvre halvdel.", decimals: 2 },
  { id: "zink", name: "Zink", unit: "µmol/L", category: "vitaminer", optimalLow: 12, optimalHigh: 18, explainer: "Vigtig for immunforsvar, hud og testosteronproduktion. Lave værdier ses ofte ved ensidig kost eller hård træning." },
  { id: "jern", name: "Jern", unit: "µmol/L", category: "vitaminer", optimalLow: 12, optimalHigh: 28, explainer: "Selve jernet i blodet lige nu. Svinger fra dag til dag — derfor tolkes det altid sammen med ferritin og transferrinmætning.", decimals: 0 },
  { id: "ferritin", name: "Ferritin (jerndepot)", unit: "µg/L", category: "vitaminer", optimalLow: 50, optimalHigh: 150, explainer: "Dine jerndepoter. Lave depoter giver træthed længe før egentlig blodmangel — men ferritin stiger også ved inflammation, så den tolkes i sammenhæng.", decimals: 0 },
  { id: "transferrin", name: "Transferrinmætning", unit: "%", category: "vitaminer", optimalLow: 25, optimalHigh: 40, explainer: "Hvor stor en del af blodets jerntransport der er i brug. Hjælper med at skelne ægte jernmangel fra andre årsager.", decimals: 0 },
  { id: "calcium", name: "Calcium", unit: "mmol/L", category: "vitaminer", optimalLow: 2.2, optimalHigh: 2.5, explainer: "Vigtig for knogler, nerver og muskler. Holdes stramt af kroppen — afvigelser skal altid undersøges nærmere.", decimals: 2 },
  { id: "selen", name: "Selen", unit: "µmol/L", category: "vitaminer", optimalLow: 1.0, optimalHigh: 1.5, explainer: "Et sporstof der beskytter cellerne og understøtter stofskiftet. Danske jorde er selenfattige, så lave værdier er almindelige." },

  // ---- 7. Hormoner (8, kønsspecifikke) -------------------------------------
  { id: "testosteron", name: "Testosteron (total)", unit: "nmol/L", category: "hormoner", optimalLow: 15, optimalHigh: 30, explainer: "Vigtig for muskelmasse, energi, humør og sexlyst. Søvn, styrketræning og normalvægt er de stærkeste naturlige håndtag." },
  { id: "frittestosteron", name: "Frit testosteron", unit: "pmol/L", category: "hormoner", optimalLow: 250, optimalHigh: 600, explainer: "Den del af testosteronet der faktisk er aktivt i kroppen. Ofte mere sigende end totaltallet, især hvis SHBG er højt eller lavt.", decimals: 0 },
  { id: "shbg", name: "SHBG", unit: "nmol/L", category: "hormoner", optimalLow: 20, optimalHigh: 55, explainer: "Et protein der binder kønshormoner i blodet. Bruges til at beregne hvor meget aktivt hormon du reelt har til rådighed.", decimals: 0 },
  { id: "oestradiol", name: "Østradiol", unit: "pmol/L", category: "hormoner", optimalLow: 60, optimalHigh: 150, explainer: "Vigtig for knogler, hjerne og kar — hos alle køn. Balancen i forhold til testosteron betyder mere end tallet alene.", decimals: 0 },
  { id: "kortisol", name: "Kortisol (morgen)", unit: "nmol/L", category: "hormoner", optimalLow: 250, optimalHigh: 550, explainer: "Dit vigtigste stresshormon, målt om morgenen hvor det naturligt topper. Vedvarende høje niveauer slider på søvn, blodsukker og immunforsvar.", decimals: 0 },
  { id: "dheas", name: "DHEA-S", unit: "µmol/L", category: "hormoner", optimalLow: 4, optimalHigh: 10, explainer: "Et 'moder-hormon' som kroppen bygger andre hormoner af. Falder naturligt med alderen — gode niveauer hænger sammen med vitalitet." },
  { id: "igf1", name: "IGF-1", unit: "nmol/L", category: "hormoner", optimalLow: 18, optimalHigh: 30, explainer: "Kroppens vækstsignal — vigtigt for muskler og restitution. Hverken for lavt eller for højt er målet; midten af intervallet er sweet spot.", decimals: 0 },
  { id: "prolaktin", name: "Prolaktin", unit: "mIU/L", category: "hormoner", optimalLow: 80, optimalHigh: 320, explainer: "Et hypofysehormon der bl.a. påvirker kønshormonerne. Stress og dårlig søvn kan løfte det midlertidigt.", decimals: 0 },

  // ---- 8. Skjoldbruskkirtel / thyroidea (4) --------------------------------
  { id: "tsh", name: "TSH", unit: "mIU/L", category: "thyroidea", optimalLow: 0.5, optimalHigh: 2.5, lowerIsBetter: true, explainer: "Hjernens signal til skjoldbruskkirtlen. Et TSH i den øvre 'normale' ende kan allerede give træthed og tunghed — derfor sigter vi under 2,5." },
  { id: "ft4", name: "Frit T4", unit: "pmol/L", category: "thyroidea", optimalLow: 12, optimalHigh: 20, explainer: "Skjoldbruskkirtlens lagerhormon. Tolkes sammen med TSH og frit T3 for at se om dit stofskifte kører som det skal.", decimals: 0 },
  { id: "ft3", name: "Frit T3", unit: "pmol/L", category: "thyroidea", optimalLow: 4.0, optimalHigh: 6.0, explainer: "Det aktive stofskiftehormon — det der faktisk sætter fart på cellerne. Lavt frit T3 kan give kuldskærhed, træthed og lav puls." },
  { id: "antitpo", name: "Anti-TPO", unit: "kIU/L", category: "thyroidea", optimalLow: 0, optimalHigh: 35, lowerIsBetter: true, explainer: "Antistoffer mod skjoldbruskkirtlen. Forhøjede værdier kan varsle stofskiftesygdom år i forvejen — vigtigt at kende og følge.", decimals: 0 },

  // ---- 9. Blod & jernstatus (13) -------------------------------------------
  { id: "haemoglobin", name: "Hæmoglobin", unit: "mmol/L", category: "blodstatus", optimalLow: 8.5, optimalHigh: 10.5, explainer: "Blodets iltbærer. For lavt giver træthed og forpustethed; for højt kan skyldes væskemangel eller andet der skal tjekkes." },
  { id: "haematokrit", name: "Hæmatokrit", unit: "%", category: "blodstatus", optimalLow: 40, optimalHigh: 50, explainer: "Hvor stor en del af blodet der består af røde blodlegemer. Tolkes sammen med hæmoglobin.", decimals: 0 },
  { id: "erytrocytter", name: "Erytrocytter", unit: "×10¹²/L", category: "blodstatus", optimalLow: 4.5, optimalHigh: 5.7, explainer: "Antallet af røde blodlegemer — dem der bærer ilten rundt i kroppen." },
  { id: "mcv", name: "MCV", unit: "fL", category: "blodstatus", optimalLow: 85, optimalHigh: 95, explainer: "Størrelsen på dine røde blodlegemer. For små peger ofte på jernmangel; for store på B12-/folatmangel eller alkohol.", decimals: 0 },
  { id: "mch", name: "MCH", unit: "pg", category: "blodstatus", optimalLow: 27, optimalHigh: 33, explainer: "Hvor meget hæmoglobin hvert rødt blodlegeme bærer. Endnu en brik i jern- og vitaminstatus.", decimals: 0 },
  { id: "rdw", name: "RDW", unit: "%", category: "blodstatus", optimalLow: 11.5, optimalHigh: 14, lowerIsBetter: true, explainer: "Hvor ens dine røde blodlegemer er i størrelse. Stor variation er et tidligt og undervurderet tegn på at noget mangler." },
  { id: "leukocytter", name: "Leukocytter", unit: "×10⁹/L", category: "blodstatus", optimalLow: 4, optimalHigh: 8, explainer: "Dine hvide blodlegemer — immunforsvarets samlede styrke. Roligt og lavt-normalt er det sunde leje." },
  { id: "neutrofile", name: "Neutrofile", unit: "×10⁹/L", category: "blodstatus", optimalLow: 2, optimalHigh: 6, explainer: "Immunforsvarets 'førstehjælpere' mod bakterier. Den største gruppe af hvide blodlegemer." },
  { id: "lymfocytter", name: "Lymfocytter", unit: "×10⁹/L", category: "blodstatus", optimalLow: 1, optimalHigh: 3.5, explainer: "De hvide blodlegemer der husker infektioner og bekæmper virus." },
  { id: "monocytter", name: "Monocytter", unit: "×10⁹/L", category: "blodstatus", optimalLow: 0.2, optimalHigh: 0.8, explainer: "Immunceller der rydder op og reparerer. Let forhøjede ved kronisk inflammation.", decimals: 2 },
  { id: "eosinofile", name: "Eosinofile", unit: "×10⁹/L", category: "blodstatus", optimalLow: 0, optimalHigh: 0.4, lowerIsBetter: true, explainer: "Immunceller der reagerer ved allergi og parasitter. Høje tal peger ofte på allergi.", decimals: 2 },
  { id: "basofile", name: "Basofile", unit: "×10⁹/L", category: "blodstatus", optimalLow: 0, optimalHigh: 0.1, lowerIsBetter: true, explainer: "Den mindste gruppe immunceller — indgår i allergiske reaktioner.", decimals: 2 },
  { id: "trombocytter", name: "Trombocytter", unit: "×10⁹/L", category: "blodstatus", optimalLow: 150, optimalHigh: 350, explainer: "Blodpladerne der standser blødning. Skal hverken være for få eller for mange.", decimals: 0 },

  // ---- 10. Kondition & kropskomposition (7) --------------------------------
  { id: "vo2max", name: "VO2-max", unit: "ml/kg/min", category: "fysiologi", optimalLow: 42, optimalHigh: 60, higherIsBetter: true, explainer: "Din konditionsmæssige kapacitet — og en af de stærkeste enkeltprædiktorer for længere levetid. Højere er bedre, og den kan trænes hele livet.", decimals: 0 },
  { id: "hvilepuls", name: "Hvilepuls", unit: "slag/min", category: "fysiologi", optimalLow: 48, optimalHigh: 62, lowerIsBetter: true, explainer: "Et simpelt vindue ind til dit hjertes kondition. Falder støt når konditionen forbedres — en af de mest motiverende kurver at følge.", decimals: 0 },
  { id: "blodtryksys", name: "Blodtryk (systolisk)", unit: "mmHg", category: "fysiologi", optimalLow: 105, optimalHigh: 125, lowerIsBetter: true, explainer: "Trykket når hjertet pumper. En af de allervigtigste markører at holde i optimalt leje — hvert point tæller over et helt liv.", decimals: 0 },
  { id: "blodtrykdia", name: "Blodtryk (diastolisk)", unit: "mmHg", category: "fysiologi", optimalLow: 65, optimalHigh: 80, lowerIsBetter: true, explainer: "Trykket mellem hjerteslagene. Tolkes altid sammen med det systoliske tryk.", decimals: 0 },
  { id: "fedtprocent", name: "Fedtprocent", unit: "%", category: "fysiologi", optimalLow: 12, optimalHigh: 20, lowerIsBetter: true, explainer: "Andelen af kropsfedt. Vigtigere end vægten alene — især det indre bugfedt belaster stofskiftet." },
  { id: "taljemaal", name: "Taljemål", unit: "cm", category: "fysiologi", optimalLow: 80, optimalHigh: 94, lowerIsBetter: true, explainer: "Det enkleste mål for det farlige bugfedt. Centimeter her flytter mere for dit helbred end kilo på vægten.", decimals: 0 },
  { id: "gribestyrke", name: "Gribestyrke", unit: "kg", category: "fysiologi", optimalLow: 42, optimalHigh: 60, higherIsBetter: true, explainer: "Et overraskende stærkt mål for din samlede muskelstyrke og robusthed — og dermed for hvordan du ældes.", decimals: 0 },
];

const MARKER_INDEX = new Map(MARKERS.map((m) => [m.id, m]));

export function markerById(id: string): MarkerDef | undefined {
  return MARKER_INDEX.get(id);
}

/** Markør-definition med kønsjusterede optimal-zoner (female overrides). */
export function markerForSex(def: MarkerDef, sex: Sex): MarkerDef {
  if (sex !== "female") return def;
  const o = FEMALE_OPTIMAL[def.id];
  return o ? { ...def, optimalLow: o[0], optimalHigh: o[1] } : def;
}

export function markerByIdForSex(id: string, sex: Sex): MarkerDef | undefined {
  const def = markerById(id);
  return def ? markerForSex(def, sex) : undefined;
}

/** De fire-tier-grænser en markør klassificeres imod. */
export interface MarkerBands {
  optimal: [number, number];
  /** Referenceinterval (bredere end optimal). */
  reference: [number, number];
  /** Watch-bånd (bredere end reference). Uden for = action. */
  watch: [number, number];
  /** true hvis referenceintervallet er lægefagligt valideret (feltet `reference`). */
  validated: boolean;
}

/**
 * Beregner de fire-tier-grænser for en markør og et køn.
 *
 * - Er `reference` valideret af Judit, bruges det direkte (validated: true).
 * - Ellers udledes reference- og watch-bånd fra optimal-zonen via RANGE_MODEL
 *   (validated: false). Directionality respekteres: lowerIsBetter eskalerer kun
 *   opad, higherIsBetter kun nedad.
 */
export function bandsFor(def: MarkerDef, sex: Sex): MarkerBands {
  const m = markerForSex(def, sex);
  const NEG_INF = Number.NEGATIVE_INFINITY;
  const POS_INF = Number.POSITIVE_INFINITY;

  // Optimal-zonen er retningsbestemt: for lowerIsBetter er alt UNDER zonen også
  // optimalt (fx LDL 0.5), for higherIsBetter er alt OVER zonen optimalt.
  // ⚠️ Forenkling: visse markører (fx TSH, calcium) har en farlig "for lav"-ende
  //    selvom lavere normalt er bedre — kræver Judits bidirektionelle grænser.
  const optimal: [number, number] = [
    m.lowerIsBetter ? NEG_INF : m.optimalLow,
    m.higherIsBetter ? POS_INF : m.optimalHigh,
  ];

  // Valideret reference: respektér Judits eksplicitte grænser bogstaveligt.
  // Watch-båndet lægges symmetrisk uden om (action = uden for watch).
  if (m.reference) {
    const [rLow, rHigh] = m.reference;
    const w = RANGE_MODEL.watchBeyondReference;
    return {
      optimal,
      reference: [rLow, rHigh],
      watch: [rLow * (1 - w), rHigh * (1 + w)],
      validated: true,
    };
  }

  // Udledte grænser (multiplikativt). Den "gode" side åbnes helt op for
  // retningsbestemte markører:
  //   lowerIsBetter  → lav side ufarlig (åben nedad); kun høj side eskalerer.
  //   higherIsBetter → høj side ufarlig (åben opad); kun lav side eskalerer.
  const ref = RANGE_MODEL.referenceWiden;
  const watch = RANGE_MODEL.watchWiden;

  const refLow = m.lowerIsBetter ? NEG_INF : m.optimalLow * (1 - ref);
  const refHigh = m.higherIsBetter ? POS_INF : m.optimalHigh * (1 + ref);
  const watchLow = m.lowerIsBetter ? NEG_INF : m.optimalLow * (1 - watch);
  const watchHigh = m.higherIsBetter ? POS_INF : m.optimalHigh * (1 + watch);

  return {
    optimal,
    reference: [refLow, refHigh],
    watch: [watchLow, watchHigh],
    validated: false,
  };
}
