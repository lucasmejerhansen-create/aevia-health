import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { classifyMarker, bandsFor, markerById, markerForSex, MARKERS } from "../dist/src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COHORT = join(__dirname, "cohort");

// ---- 1) Re-classify every cohort input with the REAL engine, compare to results.ndjson ----
const results = {};
for (const line of (await readFile(join(__dirname, "results.ndjson"), "utf8")).split("\n")) {
  if (!line.trim()) continue;
  const r = JSON.parse(line);
  results[r.patientId] = { ms: r.draftSummary?.markerStatus || {}, sex: r.draftSummary?.sex };
}

const files = (await readdir(COHORT)).filter(f => f.endsWith(".json")).sort();
let total = 0;
const driftMismatch = [];        // engine-vs-stored drift (should be 0)
const outRangeGood = [];         // value outside optimal band but status optimal/ok — clinically suspicious
const inputsByMarker = {};

for (const f of files) {
  const arr = JSON.parse(await readFile(join(COHORT, f), "utf8"));
  for (const pt of arr) {
    const res = results[pt.id];
    for (const mk of (pt.markers || [])) {
      const input = { id: mk.id, value: mk.value, unit: mk.unit, sex: mk.sex ?? pt.sex, age: mk.age ?? pt.age };
      const cm = classifyMarker(input);
      const def = markerById(mk.id);
      total++;
      (inputsByMarker[mk.id] ??= []).push({ pid: pt.id, value: mk.value, unit: mk.unit, sex: input.sex, status: cm.status });
      // drift vs stored
      if (res && res.ms[mk.id] !== undefined && res.ms[mk.id] !== cm.status) {
        driftMismatch.push({ pid: pt.id, id: mk.id, stored: res.ms[mk.id], recomputed: cm.status, value: mk.value });
      }
      // out-of-reference-range but classified optimal/ok
      if (def && (cm.status === "optimal" || cm.status === "ok")) {
        const b = bandsFor(def, input.sex);
        const inRef = mk.value >= b.reference[0] && mk.value <= b.reference[1];
        const inOpt = mk.value >= b.optimal[0] && mk.value <= b.optimal[1];
        if (cm.status === "optimal" && !inOpt) outRangeGood.push({ kind: "OPTIMAL-but-not-in-optimal-band", pid: pt.id, id: mk.id, value: mk.value, unit: mk.unit, sex: input.sex, opt: b.optimal });
        if (cm.status === "ok" && !inRef) outRangeGood.push({ kind: "OK-but-not-in-reference-band", pid: pt.id, id: mk.id, value: mk.value, unit: mk.unit, sex: input.sex, ref: b.reference });
      }
    }
  }
}
console.log("=== 1. Engine recompute vs stored results ===");
console.log("Total marker checks:", total, "| Drift mismatches:", driftMismatch.length);
driftMismatch.slice(0, 20).forEach(d => console.log("  DRIFT", JSON.stringify(d)));
console.log("Out-of-band-but-good (engine self-inconsistent):", outRangeGood.length);
outRangeGood.slice(0, 20).forEach(d => console.log("  ", JSON.stringify(d)));

// ---- 2) Directionality probe: synthetic extreme LOW values for lowerIsBetter markers,
//          and extreme HIGH for higherIsBetter — verify the "open" good end never escalates wrongly,
//          and the dangerous end IS caught. Focus on markers with a clinically dangerous low end. ----
console.log("\n=== 2. Directionality / open-end probe (synthetic) ===");
const probes = [
  // [id, sex, value, what-we-expect-clinically]
  ["tsh", "male", 0.001, "TSH near zero = possible hyperthyroidism; lowerIsBetter opens low end -> likely 'optimal' (FALSE-NEGATIVE risk)"],
  ["tsh", "male", 0.0, "TSH exactly 0"],
  ["ldl", "male", 0.1, "LDL very low (plausibly OK clinically)"],
  ["hdl", "male", 50, "HDL absurdly high; higherIsBetter opens high end -> 'optimal'"],
  ["apoa1", "male", 99, "ApoA1 absurd high -> 'optimal' via open end"],
  ["omega3", "male", 99, "Omega3 99% impossible -> 'optimal' via open end"],
  ["triglycerid", "male", 0.0, "TG zero -> optimal via open low end"],
  ["hscrp", "male", -5, "negative hs-CRP (impossible) -> open low end -> 'optimal'?"],
  ["egfr", "male", 9999, "eGFR impossibly high -> higherIsBetter open -> 'optimal'"],
  ["hvilepuls", "male", 20, "resting HR 20 (bradycardia, dangerous) lowerIsBetter -> 'optimal'?"],
  ["blodtryksys", "male", 70, "systolic 70 (hypotension/shock) lowerIsBetter -> 'optimal'?"],
  ["blodtrykdia", "male", 30, "diastolic 30 (dangerous) lowerIsBetter -> 'optimal'?"],
  ["fedtprocent", "male", 2, "body fat 2% (dangerously low) lowerIsBetter -> 'optimal'?"],
  ["natrium", "male", 100, "Na 100 (severe hyponatremia) two-sided"],
  ["natrium", "male", 170, "Na 170 (severe hypernatremia) two-sided"],
  ["kalium", "male", 1.5, "K 1.5 (lethal hypokalemia) two-sided"],
  ["kalium", "male", 8.0, "K 8.0 (lethal hyperkalemia) two-sided"],
  ["calcium", "male", 1.0, "Ca 1.0 (severe hypocalcemia) two-sided"],
];
for (const [id, sex, value, note] of probes) {
  const def = markerById(id);
  if (!def) { console.log("  (no marker)", id); continue; }
  const cm = classifyMarker({ id, value, unit: def.unit, sex, age: 50 });
  const b = bandsFor(def, sex);
  const dir = def.lowerIsBetter ? "lowerIsBetter" : def.higherIsBetter ? "higherIsBetter" : "two-sided";
  console.log(`  ${id}=${value} [${dir}] -> ${cm.status.toUpperCase()}  | opt=${JSON.stringify(b.optimal)} ref=${JSON.stringify(b.reference)} watch=${JSON.stringify(b.watch)}`);
  console.log(`      note: ${note}`);
}

// ---- 3) Markers where optimalLow > 0 but lowerIsBetter (low end has clinical floor) ----
console.log("\n=== 3. lowerIsBetter markers with optimalLow>0 (open low end may mask dangerous lows) ===");
for (const def of MARKERS) {
  if (def.lowerIsBetter && def.optimalLow > 0) {
    console.log(`  ${def.id}: optimalLow=${def.optimalLow} optimalHigh=${def.optimalHigh}  (any value <= ${def.optimalHigh} incl. 0/negative -> optimal)`);
  }
}
console.log("\n=== higherIsBetter markers (open high end) ===");
for (const def of MARKERS) {
  if (def.higherIsBetter) {
    console.log(`  ${def.id}: optimalLow=${def.optimalLow} optimalHigh=${def.optimalHigh}  (any value >= ${def.optimalLow} incl. absurd highs -> optimal)`);
  }
}
