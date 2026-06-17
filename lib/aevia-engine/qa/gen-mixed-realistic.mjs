/**
 * Generator for STRATUM "mixed-realistic" — bred realistisk blanding på tværs
 * af alder/køn med plausible, korrelerede markørmønstre. Nogle patienter har
 * 1-2 action-markører; en lille håndfuld er bevidste fælder (_trap).
 *
 * Deterministisk via seedet PRNG, så kohorten er reproducerbar.
 * Output: et JSON-array til cohort/mixed-realistic.json.
 */

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "cohort", "mixed-realistic.json");

// ---- Seedet PRNG (mulberry32) — reproducerbar kohorte ----------------------
let _seed = 0x9e3779b9 ^ 140;
function rnd() {
  _seed |= 0;
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function uni(lo, hi) { return lo + (hi - lo) * rnd(); }
/** Trunkeret normalfordeling via Box-Muller, clampet til [lo,hi]. */
function gauss(mean, sd, lo = -Infinity, hi = Infinity) {
  let u = 0, v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return Math.min(hi, Math.max(lo, mean + sd * z));
}
function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
function chance(p) { return rnd() < p; }
function round(x, dec = 0) { const f = 10 ** dec; return Math.round(x * f) / f; }

// ---- Markør-metadata (id → unit, decimals) fra reference-data.ts -----------
// Enheder og decimaler porteret 1:1 fra MARKERS-arrayet, så kohorten matcher
// motorens forventede id'er/enheder.
const META = {
  // Lipider & hjerte-kar
  totalkolesterol: { unit: "mmol/L", dec: 1 },
  ldl: { unit: "mmol/L", dec: 1 },
  hdl: { unit: "mmol/L", dec: 1 },
  triglycerid: { unit: "mmol/L", dec: 1 },
  apob: { unit: "g/L", dec: 2 },
  apoa1: { unit: "g/L", dec: 2 },
  apobratio: { unit: "ratio", dec: 2 },
  lpa: { unit: "nmol/L", dec: 0 },
  nonhdl: { unit: "mmol/L", dec: 1 },
  omega3: { unit: "%", dec: 1 },
  // Metabolisme & blodsukker
  hba1c: { unit: "mmol/mol", dec: 0 },
  glukose: { unit: "mmol/L", dec: 1 },
  insulin: { unit: "pmol/L", dec: 0 },
  homair: { unit: "indeks", dec: 1 },
  cpeptid: { unit: "pmol/L", dec: 0 },
  // Inflammation
  hscrp: { unit: "mg/L", dec: 1 },
  homocystein: { unit: "µmol/L", dec: 1 },
  fibrinogen: { unit: "g/L", dec: 1 },
  sr: { unit: "mm/t", dec: 0 },
  // Lever
  alat: { unit: "U/L", dec: 0 },
  asat: { unit: "U/L", dec: 0 },
  ggt: { unit: "U/L", dec: 0 },
  basiskfosfatase: { unit: "U/L", dec: 0 },
  bilirubin: { unit: "µmol/L", dec: 0 },
  albumin: { unit: "g/L", dec: 0 },
  // Nyrer & væskebalance
  kreatinin: { unit: "µmol/L", dec: 0 },
  egfr: { unit: "mL/min", dec: 0 },
  cystatinc: { unit: "mg/L", dec: 2 },
  urat: { unit: "mmol/L", dec: 2 },
  karbamid: { unit: "mmol/L", dec: 1 },
  natrium: { unit: "mmol/L", dec: 0 },
  kalium: { unit: "mmol/L", dec: 1 },
  // Vitaminer & mineraler
  vitd: { unit: "nmol/L", dec: 0 },
  b12: { unit: "pmol/L", dec: 0 },
  folat: { unit: "nmol/L", dec: 0 },
  magnesium: { unit: "mmol/L", dec: 2 },
  zink: { unit: "µmol/L", dec: 1 },
  jern: { unit: "µmol/L", dec: 0 },
  ferritin: { unit: "µg/L", dec: 0 },
  transferrin: { unit: "%", dec: 0 },
  calcium: { unit: "mmol/L", dec: 2 },
  selen: { unit: "µmol/L", dec: 1 },
  // Hormoner
  testosteron: { unit: "nmol/L", dec: 1 },
  frittestosteron: { unit: "pmol/L", dec: 0 },
  shbg: { unit: "nmol/L", dec: 0 },
  oestradiol: { unit: "pmol/L", dec: 0 },
  kortisol: { unit: "nmol/L", dec: 0 },
  dheas: { unit: "µmol/L", dec: 1 },
  igf1: { unit: "nmol/L", dec: 0 },
  prolaktin: { unit: "mIU/L", dec: 0 },
  // Thyroidea
  tsh: { unit: "mIU/L", dec: 1 },
  ft4: { unit: "pmol/L", dec: 0 },
  ft3: { unit: "pmol/L", dec: 1 },
  antitpo: { unit: "kIU/L", dec: 0 },
  // Blod & jernstatus
  haemoglobin: { unit: "mmol/L", dec: 1 },
  haematokrit: { unit: "%", dec: 0 },
  erytrocytter: { unit: "×10¹²/L", dec: 1 },
  mcv: { unit: "fL", dec: 0 },
  mch: { unit: "pg", dec: 0 },
  rdw: { unit: "%", dec: 1 },
  leukocytter: { unit: "×10⁹/L", dec: 1 },
  neutrofile: { unit: "×10⁹/L", dec: 1 },
  lymfocytter: { unit: "×10⁹/L", dec: 1 },
  monocytter: { unit: "×10⁹/L", dec: 2 },
  eosinofile: { unit: "×10⁹/L", dec: 2 },
  basofile: { unit: "×10⁹/L", dec: 2 },
  trombocytter: { unit: "×10⁹/L", dec: 0 },
  // Kondition & kropskomposition
  vo2max: { unit: "ml/kg/min", dec: 0 },
  hvilepuls: { unit: "slag/min", dec: 0 },
  blodtryksys: { unit: "mmHg", dec: 0 },
  blodtrykdia: { unit: "mmHg", dec: 0 },
  fedtprocent: { unit: "%", dec: 1 },
  taljemaal: { unit: "cm", dec: 0 },
  gribestyrke: { unit: "kg", dec: 0 },
};

/**
 * Hver patient bygges fra en "health archetype" + alders-/køns-modulation.
 * Vi genererer en sammenhængende fysiologisk profil ud fra nogle få latente
 * akser (metabolisk sundhed, kondition, inflammation, jernstatus), så
 * markørerne bliver korrelerede frem for uafhængig støj.
 */

// Latente akser: 0 = elendig, 1 = topform. Korreleres internt.
function makeProfile(age, sex) {
  // Grundkondition falder lidt med alderen, men har stor individuel spredning.
  const baseFit = Math.min(1, Math.max(0, gauss(0.55 - (age - 40) * 0.004, 0.22, 0, 1)));
  // Metabolisk sundhed korrelerer stærkt med kondition (+ støj).
  const metab = Math.min(1, Math.max(0, baseFit * 0.7 + gauss(0.3, 0.18, 0, 1) * 0.3));
  // Inflammation: lav (god) når metabolisk sund.
  const infl = Math.min(1, Math.max(0, (1 - metab) * 0.6 + gauss(0.3, 0.2, 0, 1) * 0.4));
  return { fit: baseFit, metab, infl };
}

// Lineær interpolation styret af en akse a∈[0,1]: a=0 → bad, a=1 → good.
function lerp(bad, good, a) { return bad + (good - bad) * a; }

function buildMarkers(age, sex, profile, opts = {}) {
  const { fit, metab, infl } = profile;
  const m = {};
  const female = sex === "female";

  // ---- Metabolisk akse driver lipider/blodsukker/kropskomposition --------
  // metab høj → lav LDL/triglycerid/HbA1c, høj HDL.
  const ldl = gauss(lerp(4.3, 1.8, metab), 0.5, 0.8, 6.5);
  const hdl = gauss(female ? lerp(1.1, 2.2, metab) : lerp(0.9, 1.9, metab), 0.2, 0.6, 3.0);
  const trig = gauss(lerp(2.6, 0.7, metab), 0.5, 0.4, 5.5);
  const total = ldl + hdl + 0.45 * trig; // Friedewald-agtig sammenhæng
  const nonhdl = Math.max(0.5, total - hdl);
  const apob = gauss(lerp(1.25, 0.55, metab), 0.12, 0.35, 1.8);
  const apoa1 = gauss(female ? lerp(1.2, 2.0, metab) : lerp(1.1, 1.85, metab), 0.18, 0.8, 2.4);
  const apobratio = apob / apoa1;
  m.totalkolesterol = total; m.ldl = ldl; m.hdl = hdl; m.triglycerid = trig;
  m.apob = apob; m.apoa1 = apoa1; m.apobratio = apobratio; m.nonhdl = nonhdl;
  m.lpa = chance(0.18) ? gauss(140, 60, 75, 350) : gauss(25, 18, 0, 75); // arvelig, bimodal
  m.omega3 = gauss(lerp(4.5, 9.5, fit), 1.4, 2.5, 13);

  // ---- Blodsukker --------------------------------------------------------
  m.hba1c = gauss(lerp(44, 30, metab), 3, 26, 62);
  m.glukose = gauss(lerp(6.4, 4.6, metab), 0.5, 3.9, 8.5);
  m.insulin = gauss(lerp(110, 28, metab), 22, 12, 220);
  m.homair = (m.glukose * m.insulin) / 135; // HOMA-IR ~ (glu*ins)/konstant (SI)
  m.cpeptid = gauss(lerp(900, 380, metab), 160, 200, 1500);

  // ---- Inflammation ------------------------------------------------------
  m.hscrp = Math.max(0.1, gauss(lerp(0.4, 4.0, infl), 1.2, 0.1, 14));
  m.homocystein = gauss(lerp(8, 13, infl), 2.5, 5, 28); // også B12/folat-afhængig
  m.fibrinogen = gauss(lerp(2.5, 4.0, infl), 0.6, 1.8, 6.5);
  m.sr = Math.max(1, gauss(lerp(6, 22, infl), 7, 1, 60));

  // ---- Lever (samvarierer med metabolisk + alkohol) ----------------------
  const liverLoad = Math.min(1, (1 - metab) * 0.6 + (chance(0.2) ? uni(0.3, 0.8) : 0)); // alkohol-spike
  m.alat = gauss(lerp(22, 55, liverLoad), 12, 8, 140);
  m.asat = gauss(lerp(22, 48, liverLoad), 10, 8, 120);
  m.ggt = gauss(lerp(24, 90, liverLoad), 22, 8, 260);
  m.basiskfosfatase = gauss(70, 18, 30, 150);
  m.bilirubin = gauss(11, 5, 4, 28);
  m.albumin = gauss(lerp(43, 46, fit), 2.2, 34, 50);

  // ---- Nyrer (egfr falder med alder; kreatinin højere hos mænd/muskel) ---
  const muscle = female ? 0.4 : 0.7;
  m.kreatinin = gauss(female ? lerp(62, 80, muscle) : lerp(78, 100, muscle), 12, 45, 130);
  m.egfr = gauss(Math.max(55, 118 - (age - 30) * 0.7 - infl * 8), 10, 45, 135);
  m.cystatinc = gauss(0.7 + (age - 30) * 0.006 + infl * 0.08, 0.12, 0.55, 1.6);
  m.urat = gauss(female ? lerp(0.22, 0.34, 1 - metab) : lerp(0.30, 0.45, 1 - metab), 0.06, 0.13, 0.62);
  m.karbamid = gauss(5.2, 1.4, 2.5, 11);
  m.natrium = gauss(140, 2, 132, 147);
  m.kalium = gauss(4.1, 0.3, 3.3, 5.2);

  // ---- Vitaminer (sæson/kost — uafhængigt for de fleste) -----------------
  m.vitd = gauss(lerp(45, 95, fit), 22, 18, 160); // dansk vinter trækker ned
  m.b12 = gauss(420, 130, 130, 850);
  m.folat = gauss(20, 7, 5, 45);
  // Lav B12/folat → hæver homocystein (korrelation pålægges efter)
  m.magnesium = gauss(0.86, 0.07, 0.62, 1.08);
  m.zink = gauss(14, 2.2, 8, 21);
  // Jernstatus: kvinder i fertil alder lavere depoter
  const lowIron = female && age < 50 && chance(0.45);
  m.ferritin = lowIron ? gauss(28, 16, 5, 70) : gauss(female ? 80 : 130, 45, 12, 320);
  m.jern = lowIron ? gauss(11, 4, 4, 20) : gauss(female ? 17 : 21, 5, 6, 34);
  m.transferrin = lowIron ? gauss(18, 6, 6, 32) : gauss(33, 8, 12, 55);
  m.calcium = gauss(2.35, 0.09, 2.05, 2.62);
  m.selen = gauss(1.1, 0.18, 0.6, 1.7);

  // ---- Hormoner ----------------------------------------------------------
  if (female) {
    m.testosteron = gauss(1.2, 0.4, 0.3, 2.6);
    m.frittestosteron = gauss(26, 9, 8, 55);
    m.shbg = gauss(70, 25, 25, 150);
    // Østradiol afhænger stærkt af alder (præ- vs. postmenopausal)
    m.oestradiol = age < 50 ? gauss(350, 180, 80, 900) : gauss(70, 40, 20, 200);
    m.dheas = gauss(Math.max(1.5, 6 - (age - 30) * 0.07), 2, 0.8, 12);
  } else {
    m.testosteron = gauss(Math.max(9, 22 - (age - 30) * 0.12), 5, 6, 38);
    m.frittestosteron = gauss(Math.max(180, 450 - (age - 30) * 3), 110, 100, 750);
    m.shbg = gauss(38, 14, 12, 90);
    m.oestradiol = gauss(95, 35, 40, 200);
    m.dheas = gauss(Math.max(2, 8 - (age - 30) * 0.08), 2.5, 1, 14);
  }
  m.kortisol = gauss(lerp(520, 360, fit), 110, 150, 750);
  m.igf1 = gauss(Math.max(12, 26 - (age - 30) * 0.12), 5, 9, 40);
  m.prolaktin = gauss(female ? 230 : 180, 80, 50, 480);

  // ---- Thyroidea ---------------------------------------------------------
  m.tsh = gauss(1.9, 0.9, 0.3, 6.0);
  m.ft4 = gauss(15.5, 2.2, 9, 23);
  m.ft3 = gauss(4.9, 0.6, 3.2, 6.8);
  m.antitpo = chance(0.12) ? gauss(120, 90, 35, 500) : gauss(12, 8, 0, 34);

  // ---- Blod & jernstatus (afhænger af jern/B12/inflammation) -------------
  const anemia = lowIron && chance(0.5);
  m.haemoglobin = anemia
    ? gauss(female ? 7.0 : 8.0, 0.6, 5.5, 9.0)
    : gauss(female ? 8.4 : 9.4, 0.5, 6.8, 11);
  m.haematokrit = m.haemoglobin * (female ? 5.3 : 5.2);
  m.erytrocytter = gauss(female ? 4.6 : 5.1, 0.4, 3.7, 6.1);
  m.mcv = lowIron ? gauss(82, 5, 70, 92) : gauss(89, 4, 80, 99);
  m.mch = lowIron ? gauss(27, 2.5, 22, 32) : gauss(30, 2, 25, 34);
  m.rdw = lowIron ? gauss(15, 1.5, 12.5, 19) : gauss(12.8, 0.8, 11, 15.5);
  m.leukocytter = gauss(lerp(5.5, 7.5, infl), 1.6, 3, 13);
  m.neutrofile = m.leukocytter * gauss(0.6, 0.06, 0.4, 0.75);
  m.lymfocytter = m.leukocytter * gauss(0.3, 0.05, 0.15, 0.45);
  m.monocytter = m.leukocytter * gauss(0.08, 0.02, 0.03, 0.14);
  m.eosinofile = chance(0.15) ? gauss(0.55, 0.25, 0.2, 1.2) : gauss(0.15, 0.08, 0.0, 0.4);
  m.basofile = gauss(0.04, 0.025, 0.0, 0.12);
  m.trombocytter = gauss(250, 55, 130, 420);

  // ---- Kondition & kropskomposition --------------------------------------
  m.vo2max = gauss(
    (female ? lerp(28, 50, fit) : lerp(32, 56, fit)) - Math.max(0, (age - 35) * 0.12),
    5, 18, 65
  );
  m.hvilepuls = gauss(lerp(74, 50, fit), 8, 40, 95);
  m.blodtryksys = gauss(lerp(118, 138, 1 - fit) + Math.max(0, (age - 40) * 0.3), 11, 95, 175);
  m.blodtrykdia = gauss(lerp(74, 86, 1 - fit), 8, 58, 105);
  m.fedtprocent = female
    ? gauss(lerp(24, 36, 1 - metab), 4, 14, 45)
    : gauss(lerp(15, 30, 1 - metab), 4, 8, 40);
  m.taljemaal = female
    ? gauss(lerp(72, 100, 1 - metab), 8, 60, 120)
    : gauss(lerp(84, 112, 1 - metab), 9, 70, 130);
  m.gribestyrke = female
    ? gauss(lerp(26, 42, fit) - Math.max(0, (age - 40) * 0.15), 5, 16, 52)
    : gauss(lerp(38, 58, fit) - Math.max(0, (age - 40) * 0.18), 6, 22, 70);

  // ---- Korrelations-koblinger pålagt efter generering --------------------
  // Lav B12/folat hæver homocystein (mekanistisk).
  if (m.b12 < 250 || m.folat < 10) m.homocystein += uni(2, 5);
  // Høj HbA1c → glukose også høj (konsistens).
  if (m.hba1c > 45 && m.glukose < 5.6) m.glukose += uni(0.4, 1.0);

  return m;
}

/** Vælg hvilke markører patienten faktisk har målt (realistisk: ikke altid 74). */
function selectPanel(all, completeness) {
  // completeness ∈ [0,1] — andel af de 74 der er målt. De fleste paneler er
  // ret komplette; nogle er reducerede (fx kun et lipid/metabolisk udpluk).
  const ids = Object.keys(all);
  if (completeness >= 0.999) return ids;
  // Behold altid kerne-markørerne (lipider, blodsukker, lever, blodstatus-top).
  const core = new Set([
    "totalkolesterol", "ldl", "hdl", "triglycerid", "hba1c", "glukose",
    "alat", "egfr", "haemoglobin", "hscrp", "vitd", "tsh",
  ]);
  return ids.filter((id) => core.has(id) || rnd() < completeness);
}

function emit(idStr, age, sex, markerVals, panel, trap) {
  const markers = [];
  for (const id of panel) {
    const meta = META[id];
    let value = markerVals[id];
    if (value == null || !Number.isFinite(value)) continue;
    value = round(value, meta.dec);
    markers.push({ id, value, unit: meta.unit, sex, age });
  }
  const p = { id: idStr, age, sex, markers };
  if (trap) p._trap = trap;
  return p;
}

// ---- Aldersfordeling (realistisk for et longevity-/helbredstjek-klientel) --
// Bias mod 35-65, men hele spændet 22-82 repræsenteret.
function sampleAge() {
  const a = gauss(48, 14, 22, 82);
  return Math.round(a);
}
function sampleSex() { return rnd() < 0.5 ? "male" : "female"; }

// ---- Trap-injektioner ------------------------------------------------------
// Anvendes på en lille delmængde; manipulerer ÉN ting og beskriver fælden.
const TRAP_KINDS = [
  {
    desc: "Forkert enhed: HbA1c angivet i % (DCCT) i stedet for mmol/mol (IFCC) — værdi 5.6 ser 'normal' ud men er forkert enhed.",
    apply: (vals, panel) => {
      if (!panel.includes("hba1c")) panel.push("hba1c");
      return { hba1c: { value: 5.6, unit: "%" } };
    },
  },
  {
    desc: "Forkert enhed: totalkolesterol i mg/dL (190) i stedet for mmol/L — talværdien er ~37x for høj.",
    apply: (vals, panel) => {
      if (!panel.includes("totalkolesterol")) panel.push("totalkolesterol");
      return { totalkolesterol: { value: 190, unit: "mg/dL" } };
    },
  },
  {
    desc: "Ukendt markør-id: 'crp' i stedet for 'hscrp' — motoren skal flagge ukendt markør, ikke crashe.",
    apply: (vals, panel) => ({ __extra: { id: "crp", value: 3.2, unit: "mg/L" } }),
  },
  {
    desc: "Ekstremt outlier: ferritin 4200 µg/L (rigtig enhed) — sandsynlig akutfase/hæmokromatose, skal lande klart i action.",
    apply: (vals, panel) => {
      if (!panel.includes("ferritin")) panel.push("ferritin");
      return { ferritin: { value: 4200, unit: "µg/L" } };
    },
  },
  {
    desc: "Negativ værdi: hs-CRP -1.0 mg/L — fysisk umulig, skal afvises/flagges som datakvalitetsfejl.",
    apply: (vals, panel) => {
      if (!panel.includes("hscrp")) panel.push("hscrp");
      return { hscrp: { value: -1.0, unit: "mg/L" } };
    },
  },
  {
    desc: "Nul-værdi på blodtryk: systolisk 0 mmHg — registreringsfejl, skal flagges ikke tolkes som optimalt lavt.",
    apply: (vals, panel) => {
      if (!panel.includes("blodtryksys")) panel.push("blodtryksys");
      return { blodtryksys: { value: 0, unit: "mmHg" } };
    },
  },
  {
    desc: "Kønsspecifik fælde: kvinde med testosteron 24 nmol/L (mandeleje) — skal eskalere mod det kvindelige optimum, ikke det mandlige.",
    requiresSex: "female",
    apply: (vals, panel) => {
      if (!panel.includes("testosteron")) panel.push("testosteron");
      return { testosteron: { value: 24, unit: "nmol/L" } };
    },
  },
  {
    desc: "Enhedsforveksling: testosteron 650 (frit-testosteron-leje i pmol/L) angivet under 'testosteron' i nmol/L — absurd høj total.",
    requiresSex: "male",
    apply: (vals, panel) => {
      if (!panel.includes("testosteron")) panel.push("testosteron");
      return { testosteron: { value: 650, unit: "nmol/L" } };
    },
  },
];

// ---- Hovedløkke ------------------------------------------------------------
const N = 140;
const TRAP_TARGET = 16; // ~11% bevidste fælder (mindst én af hver type + ekstra)
const patients = [];

// Pre-sampl demografi for ALLE patienter først, så vi kan tildele forcerede
// trap-typer deterministisk uden at forstyrre PRNG-rækkefølgen i hovedløkken.
const demo = [];
for (let i = 0; i < N; i++) demo.push({ age: sampleAge(), sex: sampleSex() });

// Forudbestem hvilke indekser der får en fælde (spredt udover kohorten).
const trapIdx = new Set();
while (trapIdx.size < TRAP_TARGET) trapIdx.add(1 + Math.floor(rnd() * (N - 1)));
const trapIdxList = [...trapIdx];

// Garantér QA-dækning: hver trap-type forekommer mindst én gang. Tildel
// forcerede typer til de første kønskompatible trap-indekser.
const forcedTrapFor = new Map();
{
  const used = new Set();
  for (const kind of TRAP_KINDS) {
    for (const idx of trapIdxList) {
      if (used.has(idx)) continue;
      if (!kind.requiresSex || kind.requiresSex === demo[idx].sex) {
        forcedTrapFor.set(idx, kind);
        used.add(idx);
        break;
      }
    }
  }
}

let seq = 0;
for (let i = 0; i < N; i++) {
  seq++;
  const idStr = `mixed-realistic-${String(seq).padStart(3, "0")}`;
  const { age, sex } = demo[i];
  const profile = makeProfile(age, sex);
  const vals = buildMarkers(age, sex, profile);

  // Panel-komplethed: 70% næsten komplette, resten reducerede.
  const completeness = chance(0.7) ? uni(0.92, 1.0) : uni(0.45, 0.85);
  const panel = selectPanel(vals, completeness);

  let trap = null;
  let extraMarker = null;
  const overrides = {};

  if (trapIdx.has(i)) {
    // Forcret type hvis tildelt; ellers en kønskompatibel tilfældig.
    let kind = forcedTrapFor.get(i);
    if (!kind) {
      const candidates = TRAP_KINDS.filter((t) => !t.requiresSex || t.requiresSex === sex);
      kind = pick(candidates);
    }
    const res = kind.apply(vals, panel);
    trap = kind.desc;
    for (const [k, v] of Object.entries(res)) {
      if (k === "__extra") extraMarker = v;
      else overrides[k] = v;
    }
  }

  const patient = emit(idStr, age, sex, vals, panel, trap);

  // Anvend override-markører (forkert enhed/værdi) — erstat eksisterende post.
  for (const [id, ov] of Object.entries(overrides)) {
    const existing = patient.markers.find((mm) => mm.id === id);
    if (existing) { existing.value = ov.value; existing.unit = ov.unit; }
    else patient.markers.push({ id, value: ov.value, unit: ov.unit, sex, age });
  }
  if (extraMarker) {
    patient.markers.push({ ...extraMarker, sex, age });
  }

  patients.push(patient);
}

// ---- Skriv -----------------------------------------------------------------
const json = JSON.stringify(patients, null, 2);
await writeFile(OUT, json + "\n", "utf8");

// Konsol-rapport (til generator-kørsel, ikke til kohort-filen).
const trapCount = patients.filter((p) => p._trap).length;
const males = patients.filter((p) => p.sex === "male").length;
const ages = patients.map((p) => p.age);
console.log(JSON.stringify({
  written: patients.length,
  file: OUT,
  males, females: patients.length - males,
  ageMin: Math.min(...ages), ageMax: Math.max(...ages),
  ageMean: round(ages.reduce((a, b) => a + b, 0) / ages.length, 1),
  traps: trapCount,
  avgMarkersPerPatient: round(patients.reduce((a, p) => a + p.markers.length, 0) / patients.length, 1),
}, null, 2));
