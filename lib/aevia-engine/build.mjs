// Genererer to artefakter fra motoren (single source of truth):
//   1. ../../api/_engine.mjs        — bundlet, dependency-fri motor til Vercel-funktionen
//   2. ../../assets/markers-manifest.js — formularmetadata (window.AEVIA_MARKERS) til admin-panelet
//
// Kør: node build.mjs  (efter `tsc` har bygget dist/)
import { build } from "esbuild";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");

// 1) Bundl motoren til én ESM-fil uden eksterne afhængigheder.
await build({
  entryPoints: [resolve(here, "src/index.ts")],
  outfile: resolve(repoRoot, "api/_engine.mjs"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node18",
  banner: { js: "// AUTO-GENERERET fra lib/aevia-engine — rediger IKKE direkte. Kør `npm run build:api`." },
});

// 2) Byg formularmanifest fra den kompilerede motor.
const { MARKERS } = await import(resolve(here, "dist/src/reference-data.js"));

const CATEGORY_LABELS = {
  hjerte: "Lipider & hjerte-kar",
  blodsukker: "Metabolisme & blodsukker",
  inflammation: "Inflammation",
  lever: "Lever",
  nyrer: "Nyrer & væskebalance",
  vitaminer: "Vitaminer & mineraler",
  hormoner: "Hormoner",
  thyroidea: "Skjoldbruskkirtel",
  blodstatus: "Blod & jernstatus",
  fysiologi: "Kondition & kropskomposition",
};

const manifest = {
  categories: Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label })),
  markers: MARKERS.map((m) => ({
    id: m.id,
    name: m.name,
    unit: m.unit,
    category: m.category,
    optimalLow: m.optimalLow,
    optimalHigh: m.optimalHigh,
    decimals: m.decimals ?? 1,
  })),
};

writeFileSync(
  resolve(repoRoot, "assets/markers-manifest.js"),
  "// AUTO-GENERERET fra lib/aevia-engine — rediger IKKE direkte.\n" +
    "window.AEVIA_MARKERS = " + JSON.stringify(manifest, null, 2) + ";\n"
);

console.log(`OK — bundlede motor + manifest med ${manifest.markers.length} markører.`);
