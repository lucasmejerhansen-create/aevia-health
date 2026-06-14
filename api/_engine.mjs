// AUTO-GENERERET fra lib/aevia-engine — rediger IKKE direkte. Kør `npm run build:api`.

// src/reference-data.ts
var RANGE_MODEL = {
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
  watchBeyondReference: 0.25
};
var FEMALE_OPTIMAL = {
  testosteron: [0.7, 2],
  frittestosteron: [15, 40],
  shbg: [40, 110],
  oestradiol: [100, 600],
  // varierer med cyklus — tolkes m. cyklusdag
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
  taljemaal: [65, 80]
};
var MARKERS = [
  // ---- 1. Lipider & hjerte-kar (10) ----------------------------------------
  { id: "totalkolesterol", name: "Totalkolesterol", unit: "mmol/L", category: "hjerte", optimalLow: 3.5, optimalHigh: 5, explainer: "Den samlede m\xE6ngde kolesterol i blodet. Et groft overbliksm\xE5l \u2014 de enkelte dele (LDL, HDL, ApoB) fort\xE6ller mere pr\xE6cist hvor du st\xE5r." },
  { id: "ldl", name: "LDL-kolesterol", unit: "mmol/L", category: "hjerte", optimalLow: 1, optimalHigh: 2.6, lowerIsBetter: true, explainer: "Det kolesterol der kan s\xE6tte sig i \xE5rev\xE6ggene. Jo lavere over et helt liv, jo lavere risiko for hjerte-kar-sygdom." },
  { id: "hdl", name: "HDL-kolesterol", unit: "mmol/L", category: "hjerte", optimalLow: 1.2, optimalHigh: 2.5, higherIsBetter: true, explainer: "Ofte kaldt 'det gode kolesterol' \u2014 det hj\xE6lper med at transportere kolesterol v\xE6k fra \xE5rerne. Motion og normalv\xE6gt l\xF8fter det." },
  { id: "triglycerid", name: "Triglycerider", unit: "mmol/L", category: "hjerte", optimalLow: 0.4, optimalHigh: 1, lowerIsBetter: true, explainer: "Fedt i blodet. H\xF8je v\xE6rdier h\xE6nger ofte sammen med sukker, alkohol og lavt aktivitetsniveau \u2014 og falder hurtigt n\xE5r vanerne \xE6ndres." },
  { id: "apob", name: "ApoB", unit: "g/L", category: "hjerte", optimalLow: 0.4, optimalHigh: 0.8, lowerIsBetter: true, explainer: "T\xE6ller antallet af de partikler der kan s\xE6tte sig i dine \xE5rev\xE6gge \u2014 en bedre risikomark\xF8r for hjerte-kar-sygdom end almindeligt kolesterol.", decimals: 2 },
  { id: "apoa1", name: "ApoA1", unit: "g/L", category: "hjerte", optimalLow: 1.4, optimalHigh: 2, higherIsBetter: true, explainer: "Proteinet i det 'gode' HDL-kolesterol. H\xF8jere niveauer afspejler bedre transport af kolesterol v\xE6k fra \xE5rerne.", decimals: 2 },
  { id: "apobratio", name: "ApoB/ApoA1-ratio", unit: "ratio", category: "hjerte", optimalLow: 0.3, optimalHigh: 0.6, lowerIsBetter: true, explainer: "Balancen mellem de partikler der belaster \xE5rerne, og dem der beskytter. Et af de st\xE6rkeste samlede m\xE5l for hjerte-kar-risiko.", decimals: 2 },
  { id: "lpa", name: "Lipoprotein(a)", unit: "nmol/L", category: "hjerte", optimalLow: 0, optimalHigh: 75, lowerIsBetter: true, explainer: "En arvelig risikofaktor for hjerte-kar-sygdom. Den \xE6ndrer sig stort set ikke med livsstil \u2014 men er den h\xF8j, skal de \xF8vrige risikofaktorer holdes ekstra lave.", decimals: 0 },
  { id: "nonhdl", name: "Non-HDL-kolesterol", unit: "mmol/L", category: "hjerte", optimalLow: 1.5, optimalHigh: 3, lowerIsBetter: true, explainer: "Alt det kolesterol der kan belaste \xE5rerne, samlet i \xE9t tal. Et godt supplement til ApoB." },
  { id: "omega3", name: "Omega-3-indeks", unit: "%", category: "hjerte", optimalLow: 8, optimalHigh: 12, higherIsBetter: true, explainer: "Hvor stor en andel af dine cellemembraner der best\xE5r af omega-3-fedtsyrer. Over 8% h\xE6nger sammen med lavere hjerte-kar-risiko." },
  // ---- 2. Metabolisme & blodsukker (5) -------------------------------------
  { id: "hba1c", name: "HbA1c (langtidsblodsukker)", unit: "mmol/mol", category: "blodsukker", optimalLow: 28, optimalHigh: 35, lowerIsBetter: true, explainer: "Dit gennemsnitlige blodsukker over de seneste ca. 3 m\xE5neder. Lavt og stabilt beskytter mod metabolisk aldring og type 2-diabetes.", decimals: 0 },
  { id: "glukose", name: "Fasteglukose", unit: "mmol/L", category: "blodsukker", optimalLow: 4.2, optimalHigh: 5.4, lowerIsBetter: true, explainer: "Dit blodsukker m\xE5lt p\xE5 tom mave. Et \xF8jebliksbillede der supplerer HbA1c \u2014 kryber det opad \xE5r for \xE5r, er det et tidligt advarselstegn." },
  { id: "insulin", name: "Fasteinsulin", unit: "pmol/L", category: "blodsukker", optimalLow: 20, optimalHigh: 60, lowerIsBetter: true, explainer: "Hvor h\xE5rdt din bugspytkirtel skal arbejde for at holde blodsukkeret nede. Stiger ofte mange \xE5r f\xF8r blodsukkeret selv g\xF8r \u2014 et tidligt signal.", decimals: 0 },
  { id: "homair", name: "HOMA-IR (insulinf\xF8lsomhed)", unit: "indeks", category: "blodsukker", optimalLow: 0.5, optimalHigh: 1.5, lowerIsBetter: true, explainer: "Et beregnet m\xE5l for hvor f\xF8lsomme dine celler er over for insulin. Lavere betyder at kroppen klarer sukker og stivelse uden at slide p\xE5 systemet." },
  { id: "cpeptid", name: "C-peptid", unit: "pmol/L", category: "blodsukker", optimalLow: 300, optimalHigh: 700, lowerIsBetter: true, explainer: "Viser hvor meget insulin din krop selv producerer. Bruges sammen med fasteinsulin til at vurdere belastningen p\xE5 dit stofskifte.", decimals: 0 },
  // ---- 3. Inflammation (4) -------------------------------------------------
  { id: "hscrp", name: "hs-CRP", unit: "mg/L", category: "inflammation", optimalLow: 0, optimalHigh: 1, lowerIsBetter: true, explainer: "Et m\xE5l for lavgradig inflammation i kroppen. Lave, stabile niveauer h\xE6nger sammen med lavere risiko for hjerte-kar-sygdom over tid." },
  { id: "homocystein", name: "Homocystein", unit: "\xB5mol/L", category: "inflammation", optimalLow: 5, optimalHigh: 9, lowerIsBetter: true, explainer: "Et stofskifteprodukt der belaster \xE5rev\xE6ggene n\xE5r det er h\xF8jt. H\xE6nger ofte sammen med lav B12 eller folat \u2014 og kan rettes med netop dem." },
  { id: "fibrinogen", name: "Fibrinogen", unit: "g/L", category: "inflammation", optimalLow: 1.8, optimalHigh: 3, lowerIsBetter: true, explainer: "Et protein der f\xE5r blodet til at st\xF8rkne. H\xF8je niveauer afspejler inflammation og \xF8ger tendensen til blodpropper." },
  { id: "sr", name: "S\xE6nkning (SR)", unit: "mm/t", category: "inflammation", optimalLow: 0, optimalHigh: 10, lowerIsBetter: true, explainer: "En klassisk, bred mark\xF8r for inflammation i kroppen. Bruges sammen med hs-CRP til at fange noget der ulmer.", decimals: 0 },
  // ---- 4. Lever (6) --------------------------------------------------------
  { id: "alat", name: "ALAT", unit: "U/L", category: "lever", optimalLow: 10, optimalHigh: 35, lowerIsBetter: true, explainer: "Det vigtigste leverenzym at f\xF8lge. Let forh\xF8jet ALAT er ofte f\xF8rste tegn p\xE5 fedtlever \u2014 og falder typisk hurtigt med v\xE6gttab og mindre alkohol.", decimals: 0 },
  { id: "asat", name: "ASAT", unit: "U/L", category: "lever", optimalLow: 10, optimalHigh: 35, lowerIsBetter: true, explainer: "Et leverenzym der ogs\xE5 findes i muskler. Tolkes sammen med ALAT \u2014 h\xE5rd tr\xE6ning dagen f\xF8r pr\xF8ven kan give midlertidigt h\xF8je tal.", decimals: 0 },
  { id: "ggt", name: "GGT", unit: "U/L", category: "lever", optimalLow: 10, optimalHigh: 40, lowerIsBetter: true, explainer: "Et leverenzym der er f\xF8lsomt over for alkohol og fedtophobning i leveren. Et godt '\xE6rligheds-barometer' for leverens belastning.", decimals: 0 },
  { id: "basiskfosfatase", name: "Basisk fosfatase", unit: "U/L", category: "lever", optimalLow: 35, optimalHigh: 105, explainer: "Et enzym fra lever og knogler. Bruges som kontrolmark\xF8r \u2014 afvigelser peger p\xE5 noget der skal unders\xF8ges n\xE6rmere.", decimals: 0 },
  { id: "bilirubin", name: "Bilirubin", unit: "\xB5mol/L", category: "lever", optimalLow: 5, optimalHigh: 20, explainer: "Et affaldsstof fra r\xF8de blodlegemer som leveren rydder op. Let forh\xF8jede v\xE6rdier er ofte harml\xF8se (Gilberts syndrom) \u2014 men skal kendes.", decimals: 0 },
  { id: "albumin", name: "Albumin", unit: "g/L", category: "lever", optimalLow: 40, optimalHigh: 48, explainer: "Blodets vigtigste transportprotein, lavet i leveren. Et solidt m\xE5l for generel ern\xE6ringstilstand og leverfunktion.", decimals: 0 },
  // ---- 5. Nyrer & væskebalance (7) -----------------------------------------
  { id: "kreatinin", name: "Kreatinin", unit: "\xB5mol/L", category: "nyrer", optimalLow: 60, optimalHigh: 100, explainer: "Et affaldsstof fra musklerne som nyrerne udskiller. Bruges til at beregne din nyrefunktion \u2014 meget muskelmasse giver naturligt h\xF8jere tal.", decimals: 0 },
  { id: "egfr", name: "eGFR (nyrefunktion)", unit: "mL/min", category: "nyrer", optimalLow: 90, optimalHigh: 130, higherIsBetter: true, explainer: "Et beregnet m\xE5l for hvor godt dine nyrer renser blodet. Over 90 er godt \u2014 og det falder naturligt en smule med alderen.", decimals: 0 },
  { id: "cystatinc", name: "Cystatin C", unit: "mg/L", category: "nyrer", optimalLow: 0.6, optimalHigh: 1, lowerIsBetter: true, explainer: "Et mere pr\xE6cist m\xE5l for nyrefunktion end kreatinin, fordi det ikke p\xE5virkes af muskelmasse. God til at fange tidlige \xE6ndringer.", decimals: 2 },
  { id: "urat", name: "Urat (urinsyre)", unit: "mmol/L", category: "nyrer", optimalLow: 0.2, optimalHigh: 0.4, lowerIsBetter: true, explainer: "H\xF8j urinsyre kan give podagra og h\xE6nger sammen med h\xF8jt blodtryk og metabolisk belastning. Falder med mindre fruktose og alkohol.", decimals: 2 },
  { id: "karbamid", name: "Karbamid", unit: "mmol/L", category: "nyrer", optimalLow: 3, optimalHigh: 8, explainer: "Et affaldsstof fra proteinoms\xE6tningen. Tolkes sammen med kreatinin \u2014 h\xF8j proteinindtagelse eller v\xE6skemangel kan give h\xF8jere tal." },
  { id: "natrium", name: "Natrium", unit: "mmol/L", category: "nyrer", optimalLow: 137, optimalHigh: 144, explainer: "Kroppens vigtigste salt for v\xE6skebalance og nervefunktion. Holdes normalt meget stramt af kroppen selv.", decimals: 0 },
  { id: "kalium", name: "Kalium", unit: "mmol/L", category: "nyrer", optimalLow: 3.7, optimalHigh: 4.6, explainer: "Vigtig for hjerterytme og muskelfunktion. Skal ligge i et sn\xE6vert interval \u2014 gr\xF8ntsager og frugt er de bedste kilder." },
  // ---- 6. Vitaminer & mineraler (10) ---------------------------------------
  { id: "vitd", name: "D-vitamin (25-OH-D)", unit: "nmol/L", category: "vitaminer", optimalLow: 75, optimalHigh: 120, explainer: "Vigtig for immunforsvar, knogler og muskelfunktion. M\xE5let er at lande i det optimale interval \u2014 ikke bare over manglegr\xE6nsen.", decimals: 0 },
  { id: "b12", name: "B12-vitamin", unit: "pmol/L", category: "vitaminer", optimalLow: 350, optimalHigh: 650, explainer: "Afg\xF8rende for nerver, energi og bloddannelse. V\xE6rdier i den lave 'normale' ende kan stadig give tr\xE6thed \u2014 derfor sigter vi h\xF8jere.", decimals: 0 },
  { id: "folat", name: "Folat", unit: "nmol/L", category: "vitaminer", optimalLow: 15, optimalHigh: 35, explainer: "B-vitamin der arbejder sammen med B12, bl.a. om at holde homocystein nede. Gr\xF8nne gr\xF8ntsager og b\xE6lgfrugter er de bedste kilder.", decimals: 0 },
  { id: "magnesium", name: "Magnesium", unit: "mmol/L", category: "vitaminer", optimalLow: 0.85, optimalHigh: 1, explainer: "Indg\xE5r i hundredvis af processer \u2014 s\xF8vn, muskler, blodsukker. Blodpr\xF8ven fanger kun st\xF8rre mangler, s\xE5 vi sigter mod den \xF8vre halvdel.", decimals: 2 },
  { id: "zink", name: "Zink", unit: "\xB5mol/L", category: "vitaminer", optimalLow: 12, optimalHigh: 18, explainer: "Vigtig for immunforsvar, hud og testosteronproduktion. Lave v\xE6rdier ses ofte ved ensidig kost eller h\xE5rd tr\xE6ning." },
  { id: "jern", name: "Jern", unit: "\xB5mol/L", category: "vitaminer", optimalLow: 12, optimalHigh: 28, explainer: "Selve jernet i blodet lige nu. Svinger fra dag til dag \u2014 derfor tolkes det altid sammen med ferritin og transferrinm\xE6tning.", decimals: 0 },
  { id: "ferritin", name: "Ferritin (jerndepot)", unit: "\xB5g/L", category: "vitaminer", optimalLow: 50, optimalHigh: 150, explainer: "Dine jerndepoter. Lave depoter giver tr\xE6thed l\xE6nge f\xF8r egentlig blodmangel \u2014 men ferritin stiger ogs\xE5 ved inflammation, s\xE5 den tolkes i sammenh\xE6ng.", decimals: 0 },
  { id: "transferrin", name: "Transferrinm\xE6tning", unit: "%", category: "vitaminer", optimalLow: 25, optimalHigh: 40, explainer: "Hvor stor en del af blodets jerntransport der er i brug. Hj\xE6lper med at skelne \xE6gte jernmangel fra andre \xE5rsager.", decimals: 0 },
  { id: "calcium", name: "Calcium", unit: "mmol/L", category: "vitaminer", optimalLow: 2.2, optimalHigh: 2.5, explainer: "Vigtig for knogler, nerver og muskler. Holdes stramt af kroppen \u2014 afvigelser skal altid unders\xF8ges n\xE6rmere.", decimals: 2 },
  { id: "selen", name: "Selen", unit: "\xB5mol/L", category: "vitaminer", optimalLow: 1, optimalHigh: 1.5, explainer: "Et sporstof der beskytter cellerne og underst\xF8tter stofskiftet. Danske jorde er selenfattige, s\xE5 lave v\xE6rdier er almindelige." },
  // ---- 7. Hormoner (8, kønsspecifikke) -------------------------------------
  { id: "testosteron", name: "Testosteron (total)", unit: "nmol/L", category: "hormoner", optimalLow: 15, optimalHigh: 30, explainer: "Vigtig for muskelmasse, energi, hum\xF8r og sexlyst. S\xF8vn, styrketr\xE6ning og normalv\xE6gt er de st\xE6rkeste naturlige h\xE5ndtag." },
  { id: "frittestosteron", name: "Frit testosteron", unit: "pmol/L", category: "hormoner", optimalLow: 250, optimalHigh: 600, explainer: "Den del af testosteronet der faktisk er aktivt i kroppen. Ofte mere sigende end totaltallet, is\xE6r hvis SHBG er h\xF8jt eller lavt.", decimals: 0 },
  { id: "shbg", name: "SHBG", unit: "nmol/L", category: "hormoner", optimalLow: 20, optimalHigh: 55, explainer: "Et protein der binder k\xF8nshormoner i blodet. Bruges til at beregne hvor meget aktivt hormon du reelt har til r\xE5dighed.", decimals: 0 },
  { id: "oestradiol", name: "\xD8stradiol", unit: "pmol/L", category: "hormoner", optimalLow: 60, optimalHigh: 150, explainer: "Vigtig for knogler, hjerne og kar \u2014 hos alle k\xF8n. Balancen i forhold til testosteron betyder mere end tallet alene.", decimals: 0 },
  { id: "kortisol", name: "Kortisol (morgen)", unit: "nmol/L", category: "hormoner", optimalLow: 250, optimalHigh: 550, explainer: "Dit vigtigste stresshormon, m\xE5lt om morgenen hvor det naturligt topper. Vedvarende h\xF8je niveauer slider p\xE5 s\xF8vn, blodsukker og immunforsvar.", decimals: 0 },
  { id: "dheas", name: "DHEA-S", unit: "\xB5mol/L", category: "hormoner", optimalLow: 4, optimalHigh: 10, explainer: "Et 'moder-hormon' som kroppen bygger andre hormoner af. Falder naturligt med alderen \u2014 gode niveauer h\xE6nger sammen med vitalitet." },
  { id: "igf1", name: "IGF-1", unit: "nmol/L", category: "hormoner", optimalLow: 18, optimalHigh: 30, explainer: "Kroppens v\xE6kstsignal \u2014 vigtigt for muskler og restitution. Hverken for lavt eller for h\xF8jt er m\xE5let; midten af intervallet er sweet spot.", decimals: 0 },
  { id: "prolaktin", name: "Prolaktin", unit: "mIU/L", category: "hormoner", optimalLow: 80, optimalHigh: 320, explainer: "Et hypofysehormon der bl.a. p\xE5virker k\xF8nshormonerne. Stress og d\xE5rlig s\xF8vn kan l\xF8fte det midlertidigt.", decimals: 0 },
  // ---- 8. Skjoldbruskkirtel / thyroidea (4) --------------------------------
  { id: "tsh", name: "TSH", unit: "mIU/L", category: "thyroidea", optimalLow: 0.5, optimalHigh: 2.5, lowerIsBetter: true, explainer: "Hjernens signal til skjoldbruskkirtlen. Et TSH i den \xF8vre 'normale' ende kan allerede give tr\xE6thed og tunghed \u2014 derfor sigter vi under 2,5." },
  { id: "ft4", name: "Frit T4", unit: "pmol/L", category: "thyroidea", optimalLow: 12, optimalHigh: 20, explainer: "Skjoldbruskkirtlens lagerhormon. Tolkes sammen med TSH og frit T3 for at se om dit stofskifte k\xF8rer som det skal.", decimals: 0 },
  { id: "ft3", name: "Frit T3", unit: "pmol/L", category: "thyroidea", optimalLow: 4, optimalHigh: 6, explainer: "Det aktive stofskiftehormon \u2014 det der faktisk s\xE6tter fart p\xE5 cellerne. Lavt frit T3 kan give kuldsk\xE6rhed, tr\xE6thed og lav puls." },
  { id: "antitpo", name: "Anti-TPO", unit: "kIU/L", category: "thyroidea", optimalLow: 0, optimalHigh: 35, lowerIsBetter: true, explainer: "Antistoffer mod skjoldbruskkirtlen. Forh\xF8jede v\xE6rdier kan varsle stofskiftesygdom \xE5r i forvejen \u2014 vigtigt at kende og f\xF8lge.", decimals: 0 },
  // ---- 9. Blod & jernstatus (13) -------------------------------------------
  { id: "haemoglobin", name: "H\xE6moglobin", unit: "mmol/L", category: "blodstatus", optimalLow: 8.5, optimalHigh: 10.5, explainer: "Blodets iltb\xE6rer. For lavt giver tr\xE6thed og forpustethed; for h\xF8jt kan skyldes v\xE6skemangel eller andet der skal tjekkes." },
  { id: "haematokrit", name: "H\xE6matokrit", unit: "%", category: "blodstatus", optimalLow: 40, optimalHigh: 50, explainer: "Hvor stor en del af blodet der best\xE5r af r\xF8de blodlegemer. Tolkes sammen med h\xE6moglobin.", decimals: 0 },
  { id: "erytrocytter", name: "Erytrocytter", unit: "\xD710\xB9\xB2/L", category: "blodstatus", optimalLow: 4.5, optimalHigh: 5.7, explainer: "Antallet af r\xF8de blodlegemer \u2014 dem der b\xE6rer ilten rundt i kroppen." },
  { id: "mcv", name: "MCV", unit: "fL", category: "blodstatus", optimalLow: 85, optimalHigh: 95, explainer: "St\xF8rrelsen p\xE5 dine r\xF8de blodlegemer. For sm\xE5 peger ofte p\xE5 jernmangel; for store p\xE5 B12-/folatmangel eller alkohol.", decimals: 0 },
  { id: "mch", name: "MCH", unit: "pg", category: "blodstatus", optimalLow: 27, optimalHigh: 33, explainer: "Hvor meget h\xE6moglobin hvert r\xF8dt blodlegeme b\xE6rer. Endnu en brik i jern- og vitaminstatus.", decimals: 0 },
  { id: "rdw", name: "RDW", unit: "%", category: "blodstatus", optimalLow: 11.5, optimalHigh: 14, lowerIsBetter: true, explainer: "Hvor ens dine r\xF8de blodlegemer er i st\xF8rrelse. Stor variation er et tidligt og undervurderet tegn p\xE5 at noget mangler." },
  { id: "leukocytter", name: "Leukocytter", unit: "\xD710\u2079/L", category: "blodstatus", optimalLow: 4, optimalHigh: 8, explainer: "Dine hvide blodlegemer \u2014 immunforsvarets samlede styrke. Roligt og lavt-normalt er det sunde leje." },
  { id: "neutrofile", name: "Neutrofile", unit: "\xD710\u2079/L", category: "blodstatus", optimalLow: 2, optimalHigh: 6, explainer: "Immunforsvarets 'f\xF8rstehj\xE6lpere' mod bakterier. Den st\xF8rste gruppe af hvide blodlegemer." },
  { id: "lymfocytter", name: "Lymfocytter", unit: "\xD710\u2079/L", category: "blodstatus", optimalLow: 1, optimalHigh: 3.5, explainer: "De hvide blodlegemer der husker infektioner og bek\xE6mper virus." },
  { id: "monocytter", name: "Monocytter", unit: "\xD710\u2079/L", category: "blodstatus", optimalLow: 0.2, optimalHigh: 0.8, explainer: "Immunceller der rydder op og reparerer. Let forh\xF8jede ved kronisk inflammation.", decimals: 2 },
  { id: "eosinofile", name: "Eosinofile", unit: "\xD710\u2079/L", category: "blodstatus", optimalLow: 0, optimalHigh: 0.4, lowerIsBetter: true, explainer: "Immunceller der reagerer ved allergi og parasitter. H\xF8je tal peger ofte p\xE5 allergi.", decimals: 2 },
  { id: "basofile", name: "Basofile", unit: "\xD710\u2079/L", category: "blodstatus", optimalLow: 0, optimalHigh: 0.1, lowerIsBetter: true, explainer: "Den mindste gruppe immunceller \u2014 indg\xE5r i allergiske reaktioner.", decimals: 2 },
  { id: "trombocytter", name: "Trombocytter", unit: "\xD710\u2079/L", category: "blodstatus", optimalLow: 150, optimalHigh: 350, explainer: "Blodpladerne der standser bl\xF8dning. Skal hverken v\xE6re for f\xE5 eller for mange.", decimals: 0 },
  // ---- 10. Kondition & kropskomposition (7) --------------------------------
  { id: "vo2max", name: "VO2-max", unit: "ml/kg/min", category: "fysiologi", optimalLow: 42, optimalHigh: 60, higherIsBetter: true, explainer: "Din konditionsm\xE6ssige kapacitet \u2014 og en af de st\xE6rkeste enkeltpr\xE6diktorer for l\xE6ngere levetid. H\xF8jere er bedre, og den kan tr\xE6nes hele livet.", decimals: 0 },
  { id: "hvilepuls", name: "Hvilepuls", unit: "slag/min", category: "fysiologi", optimalLow: 48, optimalHigh: 62, lowerIsBetter: true, explainer: "Et simpelt vindue ind til dit hjertes kondition. Falder st\xF8t n\xE5r konditionen forbedres \u2014 en af de mest motiverende kurver at f\xF8lge.", decimals: 0 },
  { id: "blodtryksys", name: "Blodtryk (systolisk)", unit: "mmHg", category: "fysiologi", optimalLow: 105, optimalHigh: 125, lowerIsBetter: true, explainer: "Trykket n\xE5r hjertet pumper. En af de allervigtigste mark\xF8rer at holde i optimalt leje \u2014 hvert point t\xE6ller over et helt liv.", decimals: 0 },
  { id: "blodtrykdia", name: "Blodtryk (diastolisk)", unit: "mmHg", category: "fysiologi", optimalLow: 65, optimalHigh: 80, lowerIsBetter: true, explainer: "Trykket mellem hjerteslagene. Tolkes altid sammen med det systoliske tryk.", decimals: 0 },
  { id: "fedtprocent", name: "Fedtprocent", unit: "%", category: "fysiologi", optimalLow: 12, optimalHigh: 20, lowerIsBetter: true, explainer: "Andelen af kropsfedt. Vigtigere end v\xE6gten alene \u2014 is\xE6r det indre bugfedt belaster stofskiftet." },
  { id: "taljemaal", name: "Taljem\xE5l", unit: "cm", category: "fysiologi", optimalLow: 80, optimalHigh: 94, lowerIsBetter: true, explainer: "Det enkleste m\xE5l for det farlige bugfedt. Centimeter her flytter mere for dit helbred end kilo p\xE5 v\xE6gten.", decimals: 0 },
  { id: "gribestyrke", name: "Gribestyrke", unit: "kg", category: "fysiologi", optimalLow: 42, optimalHigh: 60, higherIsBetter: true, explainer: "Et overraskende st\xE6rkt m\xE5l for din samlede muskelstyrke og robusthed \u2014 og dermed for hvordan du \xE6ldes.", decimals: 0 }
];
var MARKER_NAMES_EN = {
  totalkolesterol: "Total cholesterol",
  ldl: "LDL cholesterol",
  hdl: "HDL cholesterol",
  triglycerid: "Triglycerides",
  apob: "ApoB",
  apoa1: "ApoA1",
  apobratio: "ApoB/ApoA1 ratio",
  lpa: "Lipoprotein(a)",
  nonhdl: "Non-HDL cholesterol",
  omega3: "Omega-3 index",
  hba1c: "HbA1c (long-term blood sugar)",
  glukose: "Fasting glucose",
  insulin: "Fasting insulin",
  homair: "HOMA-IR (insulin sensitivity)",
  cpeptid: "C-peptide",
  hscrp: "hs-CRP",
  homocystein: "Homocysteine",
  fibrinogen: "Fibrinogen",
  sr: "ESR (sedimentation rate)",
  alat: "ALT",
  asat: "AST",
  ggt: "GGT",
  basiskfosfatase: "Alkaline phosphatase",
  bilirubin: "Bilirubin",
  albumin: "Albumin",
  kreatinin: "Creatinine",
  egfr: "eGFR (kidney function)",
  cystatinc: "Cystatin C",
  urat: "Urate (uric acid)",
  karbamid: "Urea",
  natrium: "Sodium",
  kalium: "Potassium",
  vitd: "Vitamin D (25-OH-D)",
  b12: "Vitamin B12",
  folat: "Folate",
  magnesium: "Magnesium",
  zink: "Zinc",
  jern: "Iron",
  ferritin: "Ferritin (iron stores)",
  transferrin: "Transferrin saturation",
  calcium: "Calcium",
  selen: "Selenium",
  testosteron: "Testosterone (total)",
  frittestosteron: "Free testosterone",
  shbg: "SHBG",
  oestradiol: "Estradiol",
  kortisol: "Cortisol (morning)",
  dheas: "DHEA-S",
  igf1: "IGF-1",
  prolaktin: "Prolactin",
  tsh: "TSH",
  ft4: "Free T4",
  ft3: "Free T3",
  antitpo: "Anti-TPO",
  haemoglobin: "Hemoglobin",
  haematokrit: "Hematocrit",
  erytrocytter: "Red blood cells",
  mcv: "MCV",
  mch: "MCH",
  rdw: "RDW",
  leukocytter: "White blood cells",
  neutrofile: "Neutrophils",
  lymfocytter: "Lymphocytes",
  monocytter: "Monocytes",
  eosinofile: "Eosinophils",
  basofile: "Basophils",
  trombocytter: "Platelets",
  vo2max: "VO2 max",
  hvilepuls: "Resting heart rate",
  blodtryksys: "Blood pressure (systolic)",
  blodtrykdia: "Blood pressure (diastolic)",
  fedtprocent: "Body fat percentage",
  taljemaal: "Waist circumference",
  gribestyrke: "Grip strength"
};
var CATEGORY_ADVICE = {
  hjerte: "De store h\xE5ndtag er kost (mindre m\xE6ttet fedt, mere fiber), motion og evt. medicin i samr\xE5d med l\xE6ge. Sm\xE5 vedvarende \xE6ndringer sl\xE5r store kortvarige.",
  blodsukker: "Protein f\xF8rst i m\xE5ltidet, en g\xE5tur efter maden og styrketr\xE6ning er de tre mest effektive hverdagsh\xE5ndtag for blodsukkeret.",
  inflammation: "S\xF8vn, v\xE6gt og tandsundhed er undervurderede h\xE5ndtag mod lavgradig inflammation \u2014 sammen med fed fisk og mindre alkohol.",
  lever: "Alkohol, v\xE6gt og visse medicintyper er de tre store for levertallene. De reagerer hurtigt \u2014 ofte m\xE5lbart efter 4-6 uger.",
  nyrer: "Drik nok v\xE6ske, hold blodtrykket i ro og v\xE6r varsom med NSAID-smertestillende (ibuprofen m.fl.) i l\xE6ngere perioder.",
  vitaminer: "Mangler rettes bedst med m\xE5lrettet tilskud i dokumenteret dosis \u2014 og re-test efter ~3 m\xE5neder, s\xE5 du ikke skyder over eller under.",
  hormoner: "S\xF8vn, styrketr\xE6ning, normalv\xE6gt og stressh\xE5ndtering er fundamentet \u2014 hormoner f\xF8lger livsstilen mere end de fleste tror.",
  thyroidea: "Stofskiftetal tolkes altid samlet (TSH + T3/T4) og over tid. Afvigelser b\xF8r f\xF8lges op hos l\xE6ge frem for at behandles p\xE5 egen h\xE5nd.",
  blodstatus: "Blodstatus afspejler ofte jern-, B12- eller folatstatus \u2014 tjek de tilh\xF8rende mark\xF8rer, og lad l\xE6gen vurdere afvigelser.",
  fysiologi: "Zone 2-kardio, styrketr\xE6ning 2\xD7 ugentligt og 7-8 timers s\xF8vn er de bedst dokumenterede investeringer du kan g\xF8re her."
};
var MARKER_INDEX = new Map(MARKERS.map((m) => [m.id, m]));
function markerById(id) {
  return MARKER_INDEX.get(id);
}
function markerForSex(def, sex) {
  if (sex !== "female") return def;
  const o = FEMALE_OPTIMAL[def.id];
  return o ? { ...def, optimalLow: o[0], optimalHigh: o[1] } : def;
}
function markerByIdForSex(id, sex) {
  const def = markerById(id);
  return def ? markerForSex(def, sex) : void 0;
}
function bandsFor(def, sex) {
  const m = markerForSex(def, sex);
  const NEG_INF = Number.NEGATIVE_INFINITY;
  const POS_INF = Number.POSITIVE_INFINITY;
  const optimal = [
    m.lowerIsBetter ? NEG_INF : m.optimalLow,
    m.higherIsBetter ? POS_INF : m.optimalHigh
  ];
  if (m.reference) {
    const [rLow, rHigh] = m.reference;
    const w = RANGE_MODEL.watchBeyondReference;
    return {
      optimal,
      reference: [rLow, rHigh],
      watch: [rLow * (1 - w), rHigh * (1 + w)],
      validated: true
    };
  }
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
    validated: false
  };
}

// src/percentiles.ts
function bracketOf(age) {
  if (age < 30) return "20";
  if (age < 40) return "30";
  if (age < 50) return "40";
  if (age < 60) return "50";
  return "60";
}
var TABLES = {
  vo2max: {
    male: {
      "20": { p25: 38, p50: 43, p75: 48, p90: 53 },
      "30": { p25: 36, p50: 41, p75: 46, p90: 51 },
      "40": { p25: 33, p50: 38, p75: 43, p90: 48 },
      "50": { p25: 30, p50: 35, p75: 40, p90: 45 },
      "60": { p25: 26, p50: 31, p75: 36, p90: 41 }
    },
    female: {
      "20": { p25: 33, p50: 38, p75: 43, p90: 48 },
      "30": { p25: 31, p50: 36, p75: 41, p90: 46 },
      "40": { p25: 28, p50: 33, p75: 38, p90: 43 },
      "50": { p25: 25, p50: 30, p75: 35, p90: 40 },
      "60": { p25: 22, p50: 27, p75: 32, p90: 37 }
    }
  },
  gribestyrke: {
    male: {
      "20": { p25: 44, p50: 50, p75: 56, p90: 61 },
      "30": { p25: 43, p50: 49, p75: 55, p90: 60 },
      "40": { p25: 40, p50: 46, p75: 52, p90: 57 },
      "50": { p25: 37, p50: 43, p75: 49, p90: 54 },
      "60": { p25: 32, p50: 38, p75: 44, p90: 49 }
    },
    female: {
      "20": { p25: 27, p50: 31, p75: 35, p90: 39 },
      "30": { p25: 26, p50: 30, p75: 34, p90: 38 },
      "40": { p25: 24, p50: 28, p75: 32, p90: 36 },
      "50": { p25: 22, p50: 26, p75: 30, p90: 34 },
      "60": { p25: 19, p50: 23, p75: 27, p90: 31 }
    }
  },
  // Lavere er bedre: tærsklerne er faldende.
  hvilepuls: {
    male: {
      "20": { p25: 70, p50: 64, p75: 57, p90: 51 },
      "30": { p25: 70, p50: 64, p75: 57, p90: 51 },
      "40": { p25: 71, p50: 65, p75: 58, p90: 52 },
      "50": { p25: 71, p50: 65, p75: 58, p90: 52 },
      "60": { p25: 71, p50: 65, p75: 58, p90: 52 }
    },
    female: {
      "20": { p25: 73, p50: 67, p75: 60, p90: 54 },
      "30": { p25: 73, p50: 67, p75: 60, p90: 54 },
      "40": { p25: 74, p50: 68, p75: 61, p90: 55 },
      "50": { p25: 74, p50: 68, p75: 61, p90: 55 },
      "60": { p25: 74, p50: 68, p75: 61, p90: 55 }
    }
  },
  taljemaal: {
    male: {
      "20": { p25: 99, p50: 92, p75: 86, p90: 81 },
      "30": { p25: 102, p50: 95, p75: 88, p90: 83 },
      "40": { p25: 104, p50: 97, p75: 90, p90: 85 },
      "50": { p25: 106, p50: 99, p75: 92, p90: 87 },
      "60": { p25: 108, p50: 101, p75: 94, p90: 88 }
    },
    female: {
      "20": { p25: 88, p50: 81, p75: 75, p90: 70 },
      "30": { p25: 91, p50: 84, p75: 77, p90: 72 },
      "40": { p25: 94, p50: 87, p75: 80, p90: 74 },
      "50": { p25: 97, p50: 90, p75: 82, p90: 76 },
      "60": { p25: 99, p50: 92, p75: 84, p90: 78 }
    }
  }
};
function percentileFor(markerId, value, age, sex) {
  if (!Number.isFinite(value) || !Number.isFinite(age)) return null;
  const table = TABLES[markerId]?.[sex]?.[bracketOf(age)];
  if (!table) return null;
  const pts = [
    [table.p25, 25],
    [table.p50, 50],
    [table.p75, 75],
    [table.p90, 90]
  ];
  pts.sort((a, b) => a[0] - b[0]);
  const clamp = (y) => Math.max(3, Math.min(98, Math.round(y)));
  const seg = (a, b, v) => a[1] + (b[1] - a[1]) / (b[0] - a[0]) * (v - a[0]);
  if (value <= pts[0][0]) return clamp(seg(pts[0], pts[1], value));
  if (value >= pts[3][0]) return clamp(seg(pts[2], pts[3], value));
  for (let i = 0; i < 3; i++) {
    if (value >= pts[i][0] && value <= pts[i + 1][0]) return clamp(seg(pts[i], pts[i + 1], value));
  }
  return 50;
}
var PERCENTILE_MARKERS = Object.keys(TABLES);

// src/units.ts
function normalizeUnit(u) {
  if (!u) return "";
  return String(u).toLowerCase().replace(/[μµ]/g, "u").replace(/\s+/g, "").replace(/\.$/, "");
}
var UNIT_CONVERSIONS = {
  // Lipider (kanonisk mmol/L) — mg/dL
  totalkolesterol: { "mg/dl": [0.02586] },
  ldl: { "mg/dl": [0.02586] },
  hdl: { "mg/dl": [0.02586] },
  nonhdl: { "mg/dl": [0.02586] },
  triglycerid: { "mg/dl": [0.01129] },
  // Metabolisme
  glukose: { "mg/dl": [0.0555] },
  insulin: { "uiu/ml": [6.945], "miu/l": [6.945] },
  // pmol/L
  hba1c: { "%": [10.929, -23.5] },
  // mmol/mol = (%-2.15)×10.929
  // Inflammation
  hscrp: { "mg/dl": [10] },
  // kanonisk mg/L
  // Elektrolytter (kanonisk mmol/L) — mg/dL og mg/L
  natrium: { "mg/dl": [0.435], "mg/l": [0.0435] },
  kalium: { "mg/dl": [0.2558], "mg/l": [0.02558] },
  calcium: { "mg/dl": [0.2495], "mg/l": [0.02495] },
  magnesium: { "mg/dl": [0.4114], "mg/l": [0.04114] },
  // Lever / nyrer
  albumin: { "g/dl": [10] },
  // g/L
  kreatinin: { "mg/dl": [88.42] },
  // µmol/L
  urat: { "umol/l": [1e-3], "mg/dl": [0.05948], "mg/l": [5948e-6] },
  // mmol/L
  karbamid: { "mg/dl": [0.1665] },
  // mmol/L (urinstof)
  bilirubin: { "mg/dl": [17.1] },
  // µmol/L
  // Vitaminer / mineraler (kanonisk µmol/L medmindre andet)
  jern: { "ug/dl": [0.1791], "ug/l": [0.01791] },
  ferritin: { "ng/ml": [1] },
  // µg/L (talmæssigt ens)
  vitd: { "ng/ml": [2.496] },
  // nmol/L
  b12: { "pg/ml": [0.7378], "ng/l": [0.7378] },
  // pmol/L
  folat: { "ng/ml": [2.265] },
  // nmol/L
  zink: { "ug/dl": [0.153], "ug/l": [0.0153], "mg/l": [15.3] },
  selen: { "ug/dl": [0.1266], "ug/l": [0.01266] },
  // Blodstatus
  haemoglobin: { "g/dl": [0.6206], "g/l": [0.06206] },
  // mmol/L (DK-særegen enhed!)
  // Celletællinger: fremmede notationer der talmæssigt = kanonisk (factor 1) —
  // suppimerer falsk enheds-flag. ×10⁹/L: 1000/µl, /nl. ×10¹²/L: Mill/µl, /pl.
  leukocytter: { "1000/ul": [1], "/nl": [1] },
  neutrofile: { "1000/ul": [1], "/nl": [1] },
  lymfocytter: { "1000/ul": [1], "/nl": [1] },
  monocytter: { "1000/ul": [1], "/nl": [1] },
  eosinofile: { "1000/ul": [1], "/nl": [1] },
  basofile: { "1000/ul": [1], "/nl": [1] },
  trombocytter: { "1000/ul": [1], "/nl": [1] },
  erytrocytter: { "mill/ul": [1], "mio/ul": [1], "/pl": [1] },
  // Hormoner
  testosteron: { "ng/dl": [0.0347], "ng/ml": [34.7] },
  // nmol/L
  oestradiol: { "pg/ml": [3.671] },
  // pmol/L
  kortisol: { "ug/dl": [27.59] }
  // nmol/L
};
function convertToCanonical(markerId, value, unit, canonicalUnit) {
  const u = normalizeUnit(unit);
  const c = normalizeUnit(canonicalUnit);
  if (!u) return { status: "no-unit", value };
  if (u === c) return { status: "match", value };
  const conv = UNIT_CONVERSIONS[markerId]?.[u];
  if (conv) {
    const [factor, offset = 0] = conv;
    return { status: "converted", value: value * factor + offset, from: unit, factor, offset };
  }
  return { status: "unmatched", value, from: unit };
}

// src/classify.ts
function inRange(value, low, high) {
  return value >= low && value <= high;
}
function deviationFromOptimalMid(value, low, high) {
  const mid = (low + high) / 2;
  const half = (high - low) / 2 || Math.abs(mid) || 1;
  return Math.round((value - mid) / half * 100);
}
function classifyMarker(input) {
  const issues = [];
  const base = markerById(input.id);
  if (!base) {
    return {
      id: input.id,
      value: input.value,
      status: "action",
      category: "fysiologi",
      deviation: 0,
      optimal: [0, 0],
      reference: [null, null],
      explanation: "Ukendt mark\xF8r \u2014 ikke i Aevias validerede panel. Skal afklares manuelt.",
      issues: [{ code: "unknown_marker", message: `Mark\xF8r-id '${input.id}' findes ikke i panelet.` }]
    };
  }
  const def = markerForSex(base, input.sex);
  if (!Number.isFinite(input.value)) {
    issues.push({ code: "non_finite_value", message: "V\xE6rdien er ikke et endeligt tal." });
  }
  const conv = convertToCanonical(def.id, input.value, input.unit, def.unit);
  let value = conv.value;
  if (conv.status === "converted") {
    issues.push({
      code: "unit_converted",
      message: `Konverteret fra '${conv.from}' \u2192 '${def.unit}' (\xD7${conv.factor}${conv.offset ? ` ${conv.offset > 0 ? "+" : ""}${conv.offset}` : ""}).`
    });
  } else if (conv.status === "unmatched") {
    issues.push({
      code: "unit_mismatch",
      message: `Ukendt enhed '${conv.from}' (forventet '${def.unit}') \u2014 v\xE6rdien er IKKE konverteret.`
    });
  }
  const bands = bandsFor(def, input.sex);
  if (!bands.validated) {
    issues.push({
      code: "unvalidated_range",
      message: "Referenceinterval er udledt, ikke l\xE6gefagligt valideret (afventer Judit)."
    });
  }
  let status;
  if (!Number.isFinite(value)) {
    status = "action";
  } else if (inRange(value, bands.optimal[0], bands.optimal[1])) {
    status = "optimal";
  } else if (inRange(value, bands.reference[0], bands.reference[1])) {
    status = "ok";
  } else if (inRange(value, bands.watch[0], bands.watch[1])) {
    status = "watch";
  } else {
    status = "action";
  }
  const fin = (x) => Number.isFinite(x) ? x : null;
  const result = {
    id: def.id,
    value,
    // kanonisk værdi (evt. konverteret fra fremmed enhed)
    // Ved ukendt enhed beholdes den rå enhed, så værdien ikke fejlmærkes kanonisk.
    unit: conv.status === "unmatched" ? input.unit || def.unit : def.unit,
    status,
    category: def.category,
    deviation: deviationFromOptimalMid(value, def.optimalLow, def.optimalHigh),
    optimal: [def.optimalLow, def.optimalHigh],
    // sex-justeret (markerForSex)
    reference: [fin(bands.reference[0]), fin(bands.reference[1])],
    explanation: def.explainer
  };
  if (conv.status === "converted") result.converted = { from: input.value, unit: conv.from };
  if (issues.length > 0) result.issues = issues;
  return result;
}
function classifyAll(inputs) {
  return inputs.map(classifyMarker);
}

// src/bio-age.ts
var PHENOAGE = {
  intercept: -19.9067,
  albumin: -0.0336,
  // g/L
  creatinine: 95e-4,
  // µmol/L
  glucose: 0.1953,
  // mmol/L
  lnCrp: 0.0954,
  // ln(CRP i mg/dL)
  lymphocytePct: -0.012,
  // %
  mcv: 0.0268,
  // fL
  rdw: 0.3306,
  // %
  alp: 188e-5,
  // U/L
  wbc: 0.0554,
  // ×10⁹/L (1000 celler/µL)
  age: 0.0804,
  // år
  gamma: 76927e-7,
  // Gompertz
  tmonths: 120
};
var REQUIRED_INPUTS = 9;
function extractPhenoInputs(values) {
  const albumin = values.get("albumin");
  const creatinine = values.get("kreatinin");
  const glucose = values.get("glukose");
  const crpMgL = values.get("hscrp");
  const lymf = values.get("lymfocytter");
  const wbc = values.get("leukocytter");
  const mcv = values.get("mcv");
  const rdw = values.get("rdw");
  const alp = values.get("basiskfosfatase");
  if (albumin == null || creatinine == null || glucose == null || crpMgL == null || lymf == null || wbc == null || mcv == null || rdw == null || alp == null || wbc === 0) {
    return null;
  }
  return {
    albumin,
    creatinine,
    glucose,
    crpMgDl: crpMgL / 10,
    // hs-CRP mg/L → mg/dL (antagelse — valideres af Judit)
    lymphocytePct: lymf / wbc * 100,
    // absolutte tællinger → % (antagelse)
    mcv,
    rdw,
    alp,
    wbc
  };
}
function phenoAgeYears(i, chronologicalAge) {
  const c = PHENOAGE;
  const lnCrp = Math.log(Math.max(i.crpMgDl, 0.01));
  const xb = c.intercept + c.albumin * i.albumin + c.creatinine * i.creatinine + c.glucose * i.glucose + c.lnCrp * lnCrp + c.lymphocytePct * i.lymphocytePct + c.mcv * i.mcv + c.rdw * i.rdw + c.alp * i.alp + c.wbc * i.wbc + c.age * chronologicalAge;
  const mortalityScore = 1 - Math.exp(-Math.exp(xb) * (Math.exp(c.gamma * c.tmonths) - 1) / c.gamma);
  const phenoAge = 141.50225 + Math.log(-553e-5 * Math.log(1 - mortalityScore)) / 0.090165;
  return phenoAge;
}
function heuristicAge(classified, chronologicalAge) {
  let delta = 0;
  for (const m of classified) {
    if (m.status === "optimal") delta -= 0.1;
    else if (m.status === "action" || m.status === "watch") delta += 0.15;
  }
  delta = Math.max(-8, Math.min(8, delta));
  return chronologicalAge + delta;
}
function confidenceHalfWidth(method, inputsUsed) {
  if (method === "marker-heuristic") return 6;
  const missing = REQUIRED_INPUTS - inputsUsed;
  return 3 + missing * 1.5;
}
function estimateBiologicalAge(markers, chronologicalAge, classified) {
  const values = new Map(markers.map((m) => [m.id, m.value]));
  const pheno = extractPhenoInputs(values);
  const phenoIds = ["albumin", "kreatinin", "glukose", "hscrp", "lymfocytter", "leukocytter", "mcv", "rdw", "basiskfosfatase"];
  const ageValid = Number.isFinite(chronologicalAge) && chronologicalAge >= 18 && chronologicalAge <= 110;
  if (!ageValid) {
    return {
      estimatedAge: 0,
      confidenceInterval: [0, 0],
      available: false,
      method: pheno ? "phenoage" : "marker-heuristic",
      inputsUsed: pheno ? REQUIRED_INPUTS : phenoIds.filter((id) => values.has(id)).length,
      inputsRequired: REQUIRED_INPUTS,
      biologicalAgeDisclaimer: true
    };
  }
  if (pheno) {
    const raw = phenoAgeYears(pheno, chronologicalAge);
    const estimatedAge2 = Math.round(raw);
    const half2 = confidenceHalfWidth("phenoage", REQUIRED_INPUTS);
    return {
      estimatedAge: estimatedAge2,
      confidenceInterval: [Math.round(estimatedAge2 - half2), Math.round(estimatedAge2 + half2)],
      available: true,
      method: "phenoage",
      inputsUsed: REQUIRED_INPUTS,
      inputsRequired: REQUIRED_INPUTS,
      biologicalAgeDisclaimer: true
    };
  }
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
    biologicalAgeDisclaimer: true
  };
}

// src/score.ts
var STATUS_POINTS = {
  optimal: 1,
  ok: 0.5,
  watch: 0.25,
  action: 0
};
var STATUS_RANK = {
  action: 0,
  watch: 1,
  ok: 2,
  optimal: 3
};
function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}
function markerScore(classified) {
  if (classified.length === 0) return 0;
  const sum = classified.reduce((acc, m) => acc + STATUS_POINTS[m.status], 0);
  return sum / classified.length * 100;
}
function momentumScore(classified, previous) {
  if (!previous) return 50;
  const comparable = classified.filter((m) => previous[m.id] != null);
  if (comparable.length === 0) return 50;
  const improved = comparable.filter((m) => {
    const before = previous[m.id];
    const movedUp = STATUS_RANK[m.status] > STATUS_RANK[before];
    const heldOptimal = m.status === "optimal" && before === "optimal";
    return movedUp || heldOptimal;
  }).length;
  return improved / comparable.length * 100;
}
function categoryBreakdown(classified) {
  const groups = /* @__PURE__ */ new Map();
  for (const m of classified) {
    const arr = groups.get(m.category) ?? [];
    arr.push(m);
    groups.set(m.category, arr);
  }
  const out = {};
  for (const [cat, arr] of groups) out[cat] = Math.round(markerScore(arr));
  return out;
}
function computeAeviaScore(classified, ctx) {
  const markers = markerScore(classified);
  if (ctx.baseline) {
    return {
      total: Math.round(markers),
      components: { markers: Math.round(markers), adherence: null, momentum: null },
      breakdown: categoryBreakdown(classified),
      baseline: true
    };
  }
  const adherence = clamp01(ctx.adherence) * 100;
  const momentum = momentumScore(classified, ctx.previous);
  const total = Math.round(markers * 0.5 + adherence * 0.35 + momentum * 0.15);
  return {
    total,
    components: {
      markers: Math.round(markers),
      adherence: Math.round(adherence),
      momentum: Math.round(momentum)
    },
    breakdown: categoryBreakdown(classified),
    baseline: false
  };
}
function scoreLabel(score) {
  if (score >= 85) return "Fremragende";
  if (score >= 70) return "St\xE6rk";
  if (score >= 55) return "P\xE5 vej";
  return "Tid til fokus";
}

// src/deidentify.ts
import { randomUUID } from "node:crypto";
function ageBandOf(age) {
  const lower = Math.floor(age / 5) * 5;
  return `${lower}-${lower + 4}`;
}
function deidentify(raw) {
  return {
    pseudoId: randomUUID(),
    ageBand: ageBandOf(raw.age),
    sex: raw.sex,
    markers: raw.markers.map((m) => ({
      id: m.id,
      value: m.value,
      unit: m.unit,
      sex: m.sex,
      age: m.age
    }))
  };
}
var PII_KEYS = ["name", "cpr", "email", "navn", "phone", "telefon", "address", "adresse"];
function assertNoPII(obj, context = "AI-payload") {
  const seen = /* @__PURE__ */ new Set();
  const walk = (node) => {
    if (node == null || typeof node !== "object") return;
    if (seen.has(node)) return;
    seen.add(node);
    for (const [key, val2] of Object.entries(node)) {
      if (PII_KEYS.includes(key.toLowerCase())) {
        throw new Error(`PII-l\xE6kage blokeret: feltet '${key}' fundet i ${context}.`);
      }
      walk(val2);
    }
  };
  walk(obj);
}

// src/pipeline.ts
var DOCTOR_EVENTS = /* @__PURE__ */ new Set(["doctor_approve", "doctor_reject"]);
var TRANSITIONS = {
  raw_data: { classify: "classified" },
  classified: { prepare_draft: "draft_pending_doctor" },
  draft_pending_doctor: {
    doctor_approve: "approved_for_release",
    doctor_reject: "rejected"
  },
  rejected: { redraft: "draft_pending_doctor" },
  approved_for_release: {}
  // terminal — ingen vej videre
};
var IllegalTransitionError = class extends Error {
  constructor(from, event) {
    super(`Ulovlig overgang: '${event}' er ikke tilladt fra tilstanden '${from}'.`);
    this.from = from;
    this.event = event;
    this.name = "IllegalTransitionError";
  }
  from;
  event;
};
var DoctorActionRequiredError = class extends Error {
  constructor(event) {
    super(`H\xE6ndelsen '${event}' kr\xE6ver en eksplicit l\xE6gehandling (doctorId).`);
    this.event = event;
    this.name = "DoctorActionRequiredError";
  }
  event;
};
function nextState(current, event, opts = {}) {
  const to = TRANSITIONS[current][event];
  if (!to) throw new IllegalTransitionError(current, event);
  if (DOCTOR_EVENTS.has(event) && !opts.doctorId) {
    throw new DoctorActionRequiredError(event);
  }
  return to;
}
var ReportPipeline = class {
  _status;
  _history = [];
  constructor(initial = "raw_data") {
    this._status = initial;
  }
  get status() {
    return this._status;
  }
  get history() {
    return this._history;
  }
  get isReleased() {
    return this._status === "approved_for_release";
  }
  dispatch(event, opts = {}) {
    const from = this._status;
    const to = nextState(from, event, opts);
    this._status = to;
    const record = { from, to, event };
    if (opts.doctorId !== void 0) record.doctorId = opts.doctorId;
    if (opts.note !== void 0) record.note = opts.note;
    if (opts.at !== void 0) record.at = opts.at;
    this._history.push(record);
    return to;
  }
};

// src/clinical.ts
function find(cm, id) {
  return cm.find((c) => c.id === id);
}
function val(cm, id) {
  const m = find(cm, id);
  return m && Number.isFinite(m.value) ? m.value : null;
}
function isHigh(cm, id) {
  const m = find(cm, id);
  return !!m && Number.isFinite(m.value) && m.value > m.optimal[1];
}
function isLow(cm, id) {
  const m = find(cm, id);
  return !!m && Number.isFinite(m.value) && m.value < m.optimal[0];
}
function present(cm, ids) {
  return ids.filter((id) => find(cm, id));
}
function detectPatterns(cm) {
  const out = [];
  const hi = (id) => isHigh(cm, id);
  const lo = (id) => isLow(cm, id);
  if ((hi("alat") || hi("ggt")) && (hi("triglycerid") || hi("fedtprocent") || hi("taljemaal"))) {
    out.push({
      id: "fatty_liver",
      label: "Muligt fedtlever-m\xF8nster",
      severity: "watch",
      detail: "Forh\xF8jede leverenzymer sammen med tegn p\xE5 metabolisk belastning.",
      markers: present(cm, ["alat", "ggt", "triglycerid", "fedtprocent", "taljemaal"])
    });
  }
  if (lo("b12") && (hi("homocystein") || hi("mcv"))) {
    out.push({
      id: "b12_deficiency",
      label: "B12-mangel-m\xF8nster",
      severity: "watch",
      detail: "Lav B12 sammen med forh\xF8jet homocystein og/eller MCV.",
      markers: present(cm, ["b12", "homocystein", "mcv"])
    });
  }
  if (lo("ferritin") && (lo("transferrin") || lo("haemoglobin") || lo("mcv"))) {
    out.push({
      id: "iron_deficiency",
      label: "Jernmangel-m\xF8nster",
      severity: "watch",
      detail: "Lave jerndepoter sammen med tegn p\xE5 begyndende blodmangel.",
      markers: present(cm, ["ferritin", "transferrin", "haemoglobin", "mcv"])
    });
  }
  if (hi("hscrp") && (hi("fibrinogen") || hi("sr"))) {
    out.push({
      id: "inflammation",
      label: "Forh\xF8jet systemisk inflammation",
      severity: "watch",
      detail: "Flere inflammationsmark\xF8rer er forh\xF8jede samtidig.",
      markers: present(cm, ["hscrp", "fibrinogen", "sr"])
    });
  }
  if (hi("tsh") && (lo("ft4") || lo("ft3"))) {
    out.push({
      id: "hypothyroid",
      label: "Muligt lavt stofskifte",
      severity: "action",
      detail: "Forh\xF8jet TSH sammen med lavt frit T4/T3 \u2014 b\xF8r vurderes af l\xE6ge.",
      markers: present(cm, ["tsh", "ft4", "ft3"])
    });
  }
  return out;
}
function assessRisks(cm, sex) {
  const out = [];
  const crit = [];
  const waist = val(cm, "taljemaal");
  const wThr = sex === "female" ? 88 : 102;
  if (waist != null && waist >= wThr) crit.push(`taljem\xE5l \u2265${wThr} cm`);
  const tg = val(cm, "triglycerid");
  if (tg != null && tg >= 1.7) crit.push("triglycerid \u22651,7 mmol/L");
  const hdl = val(cm, "hdl");
  const hThr = sex === "female" ? 1.3 : 1;
  if (hdl != null && hdl < hThr) crit.push(`HDL <${hThr} mmol/L`);
  const sys = val(cm, "blodtryksys");
  const dia = val(cm, "blodtrykdia");
  if (sys != null && sys >= 130 || dia != null && dia >= 85) crit.push("blodtryk \u2265130/85 mmHg");
  const glu = val(cm, "glukose");
  if (glu != null && glu >= 5.6) crit.push("fasteglukose \u22655,6 mmol/L");
  if (crit.length >= 3) {
    out.push({
      id: "metabolic_syndrome",
      label: "Metabolisk syndrom",
      severity: "action",
      detail: `${crit.length} af 5 kriterier opfyldt (\u22653 = metabolisk syndrom, ATP III).`,
      criteria: crit
    });
  } else if (crit.length === 2) {
    out.push({
      id: "metabolic_risk",
      label: "Begyndende metabolisk risiko",
      severity: "watch",
      detail: "2 af 5 kriterier for metabolisk syndrom opfyldt.",
      criteria: crit
    });
  }
  const homa = val(cm, "homair");
  const ins = val(cm, "insulin");
  if (homa != null && homa >= 2.5 || ins != null && ins > 80) {
    out.push({
      id: "insulin_resistance",
      label: "Insulinresistens",
      severity: "action",
      detail: "HOMA-IR/fasteinsulin tyder p\xE5 nedsat insulinf\xF8lsomhed.",
      criteria: [homa != null ? `HOMA-IR ${homa}` : "", ins != null ? `fasteinsulin ${ins} pmol/L` : ""].filter(Boolean)
    });
  } else if (homa != null && homa >= 2 || ins != null && ins > 60) {
    out.push({
      id: "insulin_watch",
      label: "Tidlig insulinresistens",
      severity: "watch",
      detail: "Let forh\xF8jet HOMA-IR/fasteinsulin \u2014 et tidligt signal f\xF8r blodsukkeret reagerer.",
      criteria: [homa != null ? `HOMA-IR ${homa}` : "", ins != null ? `fasteinsulin ${ins} pmol/L` : ""].filter(Boolean)
    });
  }
  const lipidCrit = [];
  if (isHigh(cm, "apob")) lipidCrit.push("ApoB forh\xF8jet");
  if (isHigh(cm, "ldl")) lipidCrit.push("LDL forh\xF8jet");
  const lpa = val(cm, "lpa");
  if (lpa != null && lpa > 75) lipidCrit.push("Lp(a) >75 nmol/L (arvelig)");
  if (lipidCrit.length > 0) {
    const severe = isHigh(cm, "apob") || lpa != null && lpa > 125;
    out.push({
      id: "cvd_lipid_burden",
      label: "Forh\xF8jet hjerte-kar-lipidbyrde",
      severity: severe ? "action" : "watch",
      detail: "Aterogene lipider er forh\xF8jede. Bem\xE6rk: ikke en fuld risikoscore (rygestatus/blodtrykshistorik mangler).",
      criteria: lipidCrit
    });
  }
  return out;
}
var CATEGORY_FOCUS = {
  hjerte: { title: "S\xE6nk hjerte-kar-risiko", evidence: "st\xE6rk" },
  blodsukker: { title: "Stabilis\xE9r blodsukker & insulin", evidence: "st\xE6rk" },
  inflammation: { title: "D\xE6mp lavgradig inflammation", evidence: "moderat" },
  lever: { title: "Aflast leveren", evidence: "moderat" },
  nyrer: { title: "St\xF8t nyrer & v\xE6skebalance", evidence: "moderat" },
  vitaminer: { title: "Ret vitamin-/mineralmangel", evidence: "moderat" },
  hormoner: { title: "Balanc\xE9r hormoner via livsstil", evidence: "moderat" },
  thyroidea: { title: "F\xF8lg op p\xE5 stofskiftet", evidence: "moderat" },
  blodstatus: { title: "Afklar blod-/jernstatus", evidence: "moderat" },
  fysiologi: { title: "L\xF8ft kondition & kropskomposition", evidence: "st\xE6rk" }
};
function buildActionPlan(cm) {
  const flagged = cm.filter((m) => m.status === "action" || m.status === "watch");
  const byCat = /* @__PURE__ */ new Map();
  for (const m of flagged) {
    const arr = byCat.get(m.category) ?? [];
    arr.push(m);
    byCat.set(m.category, arr);
  }
  const cats = [...byCat.entries()].sort((a, b) => {
    const aAct = a[1].some((m) => m.status === "action") ? 0 : 1;
    const bAct = b[1].some((m) => m.status === "action") ? 0 : 1;
    return aAct - bAct;
  });
  const out = cats.map(([cat, ms]) => {
    const focus = CATEGORY_FOCUS[cat];
    return { category: cat, title: focus.title, why: CATEGORY_ADVICE[cat], markerIds: ms.map((m) => m.id), evidence: focus.evidence };
  });
  out.push({
    category: "fysiologi",
    title: "Re-test om 3-12 m\xE5neder",
    why: "Mangler og livsstilsmark\xF8rer re-testes efter ~3 m\xE5neder; de fleste \xF8vrige efter 12 m\xE5neder, s\xE5 du kan se effekten.",
    markerIds: [],
    evidence: "st\xE6rk"
  });
  return out;
}
function healthspanPhase(scoreTotal, actionCount) {
  if (scoreTotal >= 85 && actionCount === 0)
    return { phase: "optimering", label: "Optimering", rationale: "St\xE6rkt udgangspunkt \u2014 fokus p\xE5 at fastholde og finjustere." };
  if (scoreTotal >= 70 && actionCount <= 1)
    return { phase: "vedligehold", label: "Vedligehold", rationale: "Solidt niveau med f\xE5 indsatsomr\xE5der." };
  if (scoreTotal >= 55)
    return { phase: "opbygning", label: "Opbygning", rationale: "Flere mark\xF8rer kan l\xF8ftes \u2014 god mulighed for m\xE5lbar fremgang." };
  return { phase: "fokus", label: "Tid til fokus", rationale: "Flere omr\xE5der kr\xE6ver opm\xE6rksomhed; start med de l\xE6geflagede." };
}
function validationSummary(cm) {
  let derived = 0;
  for (const m of cm) {
    if ((m.issues ?? []).some((i) => i.code === "unvalidated_range")) derived++;
  }
  return { validated: cm.length - derived, derived, total: cm.length };
}

// src/draft.ts
function buildReportDraft(raw, ctx) {
  const deid = deidentify(raw);
  const classifiedMarkers = classifyAll(deid.markers);
  const aeviaScore = computeAeviaScore(classifiedMarkers, ctx);
  const biologicalAge = estimateBiologicalAge(classifiedMarkers, raw.age, classifiedMarkers);
  const flaggedForDoctor = classifiedMarkers.filter((m) => m.status === "action");
  const percentiles = {};
  for (const id of PERCENTILE_MARKERS) {
    const m = classifiedMarkers.find((c) => c.id === id);
    if (!m) continue;
    const p = percentileFor(id, m.value, raw.age, raw.sex);
    if (p != null) percentiles[id] = p;
  }
  const draft = {
    pseudoId: deid.pseudoId,
    ageBand: deid.ageBand,
    sex: deid.sex,
    classifiedMarkers,
    aeviaScore,
    biologicalAge,
    flaggedForDoctor,
    percentiles,
    patterns: detectPatterns(classifiedMarkers),
    risks: assessRisks(classifiedMarkers, raw.sex),
    actionPlan: buildActionPlan(classifiedMarkers),
    healthspan: healthspanPhase(aeviaScore.total, flaggedForDoctor.length),
    validation: validationSummary(classifiedMarkers),
    status: "draft_pending_doctor",
    biologicalAgeDisclaimer: true
  };
  assertNoPII(draft, "ReportDraft");
  return draft;
}
export {
  CATEGORY_ADVICE,
  DoctorActionRequiredError,
  IllegalTransitionError,
  MARKERS,
  MARKER_NAMES_EN,
  PERCENTILE_MARKERS,
  RANGE_MODEL,
  ReportPipeline,
  UNIT_CONVERSIONS,
  ageBandOf,
  assertNoPII,
  assessRisks,
  bandsFor,
  buildActionPlan,
  buildReportDraft,
  classifyAll,
  classifyMarker,
  computeAeviaScore,
  convertToCanonical,
  deidentify,
  detectPatterns,
  estimateBiologicalAge,
  healthspanPhase,
  markerById,
  markerByIdForSex,
  markerForSex,
  nextState,
  normalizeUnit,
  percentileFor,
  scoreLabel,
  validationSummary
};
