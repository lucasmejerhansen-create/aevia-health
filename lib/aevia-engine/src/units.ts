/**
 * ENHEDSKONVERTERING — udenlandske rapporter bruger ofte andre enheder end de
 * danske SI-enheder (mg/dL, g/dL, ng/mL, % for HbA1c osv.). Her konverteres en
 * målt værdi til markørens kanoniske enhed FØR klassificering, så et tal i en
 * fremmed enhed ikke fejlklassificeres.
 *
 * Konvertering: kanonisk = value × factor + offset (offset = 0 medmindre andet).
 *
 * ⚠️  Faktorerne er standard-omregninger (molarmasser m.m.) og SKAL valideres af
 *     Judit sammen med referenceintervallerne. Ukendte enheder konverteres ALDRIG
 *     på gæt — de flagges i stedet (unit_mismatch).
 */

/** Normalisér en enhedsstreng: små bogstaver, µ/μ → u, fjern mellemrum. */
export function normalizeUnit(u: string | undefined | null): string {
  if (!u) return "";
  return String(u).toLowerCase().replace(/[μµ]/g, "u").replace(/\s+/g, "").replace(/\.$/, "");
}

type Conv = readonly [factor: number, offset?: number];

/** markør-id → { normaliseret fremmed-enhed: [factor, offset?] }. */
export const UNIT_CONVERSIONS: Record<string, Record<string, Conv>> = {
  // Lipider (kanonisk mmol/L) — mg/dL
  totalkolesterol: { "mg/dl": [0.02586] },
  ldl: { "mg/dl": [0.02586] },
  hdl: { "mg/dl": [0.02586] },
  nonhdl: { "mg/dl": [0.02586] },
  triglycerid: { "mg/dl": [0.01129] },
  // Metabolisme
  glukose: { "mg/dl": [0.0555] },
  insulin: { "uiu/ml": [6.945], "miu/l": [6.945] }, // pmol/L
  hba1c: { "%": [10.929, -23.5] }, // mmol/mol = (%-2.15)×10.929
  // Inflammation
  hscrp: { "mg/dl": [10] }, // kanonisk mg/L
  // Elektrolytter (kanonisk mmol/L) — mg/dL og mg/L
  natrium: { "mg/dl": [0.435], "mg/l": [0.0435] },
  kalium: { "mg/dl": [0.2558], "mg/l": [0.02558] },
  calcium: { "mg/dl": [0.2495], "mg/l": [0.02495] },
  magnesium: { "mg/dl": [0.4114], "mg/l": [0.04114] },
  // Lever / nyrer
  albumin: { "g/dl": [10] }, // g/L
  kreatinin: { "mg/dl": [88.42] }, // µmol/L
  urat: { "umol/l": [0.001], "mg/dl": [0.05948], "mg/l": [0.005948] }, // mmol/L
  karbamid: { "mg/dl": [0.1665] }, // mmol/L (urinstof)
  bilirubin: { "mg/dl": [17.1] }, // µmol/L
  // Vitaminer / mineraler (kanonisk µmol/L medmindre andet)
  jern: { "ug/dl": [0.1791], "ug/l": [0.01791] },
  ferritin: { "ng/ml": [1] }, // µg/L (talmæssigt ens)
  vitd: { "ng/ml": [2.496] }, // nmol/L
  b12: { "pg/ml": [0.7378], "ng/l": [0.7378] }, // pmol/L
  folat: { "ng/ml": [2.265] }, // nmol/L
  zink: { "ug/dl": [0.153], "ug/l": [0.0153], "mg/l": [15.3] },
  selen: { "ug/dl": [0.1266], "ug/l": [0.01266] },
  // Blodstatus
  haemoglobin: { "g/dl": [0.6206], "g/l": [0.06206] }, // mmol/L (DK-særegen enhed!)
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
  testosteron: { "ng/dl": [0.0347], "ng/ml": [34.7] }, // nmol/L
  oestradiol: { "pg/ml": [3.671] }, // pmol/L
  kortisol: { "ug/dl": [27.59] }, // nmol/L
};

export type UnitResult =
  | { status: "match"; value: number }
  | { status: "no-unit"; value: number }
  | { status: "converted"; value: number; from: string; factor: number; offset: number }
  | { status: "unmatched"; value: number; from: string };

/**
 * Konvertér value fra `unit` til markørens kanoniske enhed.
 *  - match:     enhederne er ens → uændret.
 *  - no-unit:   ingen enhed angivet → antag kanonisk (uændret, intet flag).
 *  - converted: kendt fremmed enhed → omregnet.
 *  - unmatched: ukendt enhed → uændret, men SKAL flagges af kalderen.
 */
export function convertToCanonical(
  markerId: string,
  value: number,
  unit: string | undefined | null,
  canonicalUnit: string
): UnitResult {
  const u = normalizeUnit(unit);
  const c = normalizeUnit(canonicalUnit);
  if (!u) return { status: "no-unit", value };
  if (u === c) return { status: "match", value };
  const conv = UNIT_CONVERSIONS[markerId]?.[u];
  if (conv) {
    const [factor, offset = 0] = conv;
    return { status: "converted", value: value * factor + offset, from: unit as string, factor, offset };
  }
  return { status: "unmatched", value, from: unit as string };
}
