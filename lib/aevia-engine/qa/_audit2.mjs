import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { classifyMarker, markerById } from "../dist/src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COHORT = join(__dirname, "cohort");

// Clinically dangerous LOW thresholds for markers whose engine opens the low end (lowerIsBetter)
// or treats two-sided but might miss. Only flag REAL cohort inputs.
const DANGER_LOW = {
  tsh: 0.1,          // < 0.1 mIU/L suggests hyperthyroidism
  hvilepuls: 40,     // resting HR < 40 = significant bradycardia
  blodtryksys: 90,   // systolic < 90 = hypotension
  blodtrykdia: 50,   // diastolic < 50
  fedtprocent: 5,    // body fat < 5% (male essential-fat floor ~3-5%)
  glukose: 3.0,      // glucose < 3.0 mmol/L = hypoglycemia
  hba1c: 20,         // implausibly low
  natrium: 130,      // hyponatremia
  kalium: 3.0,       // hypokalemia
  calcium: 2.0,      // hypocalcemia
  haemoglobin: 6.0,  // anemia (mmol/L, male)
};
const DANGER_HIGH_OPEN = { // higherIsBetter markers — implausibly high (data-entry error masked as optimal)
  egfr: 200,
  vo2max: 80,
  hdl: 4.0,
};

const files = (await readdir(COHORT)).filter(f => f.endsWith(".json")).sort();
const hits = [];
for (const f of files) {
  const arr = JSON.parse(await readFile(join(COHORT, f), "utf8"));
  for (const pt of arr) {
    for (const mk of (pt.markers || [])) {
      const def = markerById(mk.id);
      if (!def) continue;
      const sex = mk.sex ?? pt.sex;
      const cm = classifyMarker({ id: mk.id, value: mk.value, unit: mk.unit, sex, age: mk.age ?? pt.age });
      // Only meaningful when input unit is canonical (no conversion that would change magnitude)
      const canonical = (mk.unit === def.unit);
      if (DANGER_LOW[mk.id] !== undefined && mk.value < DANGER_LOW[mk.id] && canonical) {
        hits.push({ type: "DANGER-LOW", src: f, pid: pt.id, id: mk.id, value: mk.value, unit: mk.unit, sex, status: cm.status, threshold: DANGER_LOW[mk.id] });
      }
      if (DANGER_HIGH_OPEN[mk.id] !== undefined && mk.value > DANGER_HIGH_OPEN[mk.id] && canonical) {
        hits.push({ type: "IMPLAUSIBLE-HIGH", src: f, pid: pt.id, id: mk.id, value: mk.value, unit: mk.unit, sex, status: cm.status, threshold: DANGER_HIGH_OPEN[mk.id] });
      }
    }
  }
}
console.log("=== Real cohort inputs at dangerous LOW / implausible HIGH ends ===");
console.log("Total hits:", hits.length);
// group by id+status
const byKey = {};
for (const h of hits) { const k = `${h.type}|${h.id}|status=${h.status}`; (byKey[k] ??= []).push(h); }
for (const k of Object.keys(byKey).sort()) {
  const g = byKey[k];
  console.log(`\n  ${k}  (n=${g.length})`);
  g.slice(0, 8).forEach(h => console.log(`     ${h.pid} [${h.src}] ${h.id}=${h.value}${h.unit} sex=${h.sex} -> ${h.status}`));
}
