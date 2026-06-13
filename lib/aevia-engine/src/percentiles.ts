import type { Sex } from "./types.js";

/**
 * Percentil-estimater vs. aldersgruppe for udvalgte fysiologiske markører.
 * Porteret fra app'ens src/percentiles.ts (Cooper Institute-normer for VO2-max,
 * europæiske normstudier for gribestyrke/talje).
 *
 * ⚠️  ESTIMATER til motivation — ikke kliniske referencer. Skal valideres af Judit.
 */

interface Thresholds {
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

type Bracket = "20" | "30" | "40" | "50" | "60";

function bracketOf(age: number): Bracket {
  if (age < 30) return "20";
  if (age < 40) return "30";
  if (age < 50) return "40";
  if (age < 60) return "50";
  return "60";
}

const TABLES: Record<string, Record<Sex, Record<Bracket, Thresholds>>> = {
  vo2max: {
    male: {
      "20": { p25: 38, p50: 43, p75: 48, p90: 53 },
      "30": { p25: 36, p50: 41, p75: 46, p90: 51 },
      "40": { p25: 33, p50: 38, p75: 43, p90: 48 },
      "50": { p25: 30, p50: 35, p75: 40, p90: 45 },
      "60": { p25: 26, p50: 31, p75: 36, p90: 41 },
    },
    female: {
      "20": { p25: 33, p50: 38, p75: 43, p90: 48 },
      "30": { p25: 31, p50: 36, p75: 41, p90: 46 },
      "40": { p25: 28, p50: 33, p75: 38, p90: 43 },
      "50": { p25: 25, p50: 30, p75: 35, p90: 40 },
      "60": { p25: 22, p50: 27, p75: 32, p90: 37 },
    },
  },
  gribestyrke: {
    male: {
      "20": { p25: 44, p50: 50, p75: 56, p90: 61 },
      "30": { p25: 43, p50: 49, p75: 55, p90: 60 },
      "40": { p25: 40, p50: 46, p75: 52, p90: 57 },
      "50": { p25: 37, p50: 43, p75: 49, p90: 54 },
      "60": { p25: 32, p50: 38, p75: 44, p90: 49 },
    },
    female: {
      "20": { p25: 27, p50: 31, p75: 35, p90: 39 },
      "30": { p25: 26, p50: 30, p75: 34, p90: 38 },
      "40": { p25: 24, p50: 28, p75: 32, p90: 36 },
      "50": { p25: 22, p50: 26, p75: 30, p90: 34 },
      "60": { p25: 19, p50: 23, p75: 27, p90: 31 },
    },
  },
  // Lavere er bedre: tærsklerne er faldende.
  hvilepuls: {
    male: {
      "20": { p25: 70, p50: 64, p75: 57, p90: 51 },
      "30": { p25: 70, p50: 64, p75: 57, p90: 51 },
      "40": { p25: 71, p50: 65, p75: 58, p90: 52 },
      "50": { p25: 71, p50: 65, p75: 58, p90: 52 },
      "60": { p25: 71, p50: 65, p75: 58, p90: 52 },
    },
    female: {
      "20": { p25: 73, p50: 67, p75: 60, p90: 54 },
      "30": { p25: 73, p50: 67, p75: 60, p90: 54 },
      "40": { p25: 74, p50: 68, p75: 61, p90: 55 },
      "50": { p25: 74, p50: 68, p75: 61, p90: 55 },
      "60": { p25: 74, p50: 68, p75: 61, p90: 55 },
    },
  },
  taljemaal: {
    male: {
      "20": { p25: 99, p50: 92, p75: 86, p90: 81 },
      "30": { p25: 102, p50: 95, p75: 88, p90: 83 },
      "40": { p25: 104, p50: 97, p75: 90, p90: 85 },
      "50": { p25: 106, p50: 99, p75: 92, p90: 87 },
      "60": { p25: 108, p50: 101, p75: 94, p90: 88 },
    },
    female: {
      "20": { p25: 88, p50: 81, p75: 75, p90: 70 },
      "30": { p25: 91, p50: 84, p75: 77, p90: 72 },
      "40": { p25: 94, p50: 87, p75: 80, p90: 74 },
      "50": { p25: 97, p50: 90, p75: 82, p90: 76 },
      "60": { p25: 99, p50: 92, p75: 84, p90: 78 },
    },
  },
};

/**
 * Estimeret percentil ("bedre end ~X%"). null hvis markøren ikke har tabel.
 * Piecewise lineær interpolation over (værdi, percentil)-punkter sorteret efter
 * værdi; lineær ekstrapolation uden for tabellen, klampet til 3–98. Håndterer
 * både højere-er-bedre (VO2max) og lavere-er-bedre (hvilepuls/talje) korrekt.
 */
export function percentileFor(markerId: string, value: number, age: number, sex: Sex): number | null {
  if (!Number.isFinite(value) || !Number.isFinite(age)) return null;
  const table = TABLES[markerId]?.[sex]?.[bracketOf(age)];
  if (!table) return null;

  const pts: [number, number][] = [
    [table.p25, 25],
    [table.p50, 50],
    [table.p75, 75],
    [table.p90, 90],
  ];
  pts.sort((a, b) => a[0] - b[0]);

  const clamp = (y: number) => Math.max(3, Math.min(98, Math.round(y)));
  const seg = (a: [number, number], b: [number, number], v: number) =>
    a[1] + ((b[1] - a[1]) / (b[0] - a[0])) * (v - a[0]);

  if (value <= pts[0]![0]) return clamp(seg(pts[0]!, pts[1]!, value)); // ekstrapolér nedad
  if (value >= pts[3]![0]) return clamp(seg(pts[2]!, pts[3]!, value)); // ekstrapolér opad
  for (let i = 0; i < 3; i++) {
    if (value >= pts[i]![0] && value <= pts[i + 1]![0]) return clamp(seg(pts[i]!, pts[i + 1]!, value));
  }
  return 50;
}

export const PERCENTILE_MARKERS = Object.keys(TABLES);
