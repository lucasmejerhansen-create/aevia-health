// REGRESSIONSTEST — KLINISKE MØNSTRE & RISICI (område C): mønster-detektion bruger
//   optimal-zonens kant (isHigh/isLow) i stedet for markørens kliniske status, så
//   raske patienter (alle markører inden for laboratorie-reference) får falsk-positive
//   mønstre som "B12-mangel".
//
// FUND (høj): src/clinical.ts — hjælperne isHigh (value > optimal[1]) og isLow
//   (value < optimal[0]) bruges i hele detectPatterns. De sammenligner mod
//   optimal-zonens KANT, ikke mod ClassifiedMarker.status (watch/action) eller
//   etablerede kliniske tærskler. Aevias optimal-zoner i src/reference-data.ts er
//   bevidst strammere end laboratoriets referenceinterval (fx b12 optimalLow=350 vs
//   reference-low ~262; homocystein optimalHigh=9 vs reference-high ~11.25), så
//   markører med status 'ok'/'optimal' tæller fejlagtigt som høj/lav i mønster-logikken.
//
// REPRODUKTION (verificeret mod dist/src/index.js) — healthy-older-002:
//   b12=326 pmol/L          -> status 'ok'      (reference [262.5, 812.5])
//   homocystein=10,7 µmol/L -> status 'ok'      (reference [null, 11.25])
//   mcv=89 fL               -> status 'optimal' (reference [63.75, 118.75])
//   Alle tre inden for reference, men 'b12_deficiency' (watch) udløses, fordi
//   isLow(b12): 326 < optimal[0]=350 og isHigh(homocystein): 10.7 > optimal[1]=9.
//
// OMFANG (qa/results.ndjson joinet mod qa/cohort/*.json): 53 distinkte patienter får
//   mindst ét mønster hvor INGEN listet markør når watch/action (58 af 90 i den
//   rask-designede 'healthy-older'-kohorte). Samme rodfejl rammer b12_deficiency,
//   fatty_liver, inflammation, hypothyroid og iron_deficiency.
//
// FORVENTET: Mønstre bør udløses på klinisk meningsfulde afvigelser (markørens egen
//   watch/action-status eller etablerede tærskler) — ikke værdier akkurat uden for
//   Aevias stramme optimal-zone men inden for laboratoriets reference.
//
// Denne test ASSERTER det KORREKTE udfald og FEJLER derfor p.t.

import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyAll, detectPatterns } from "../../dist/src/index.js";

test("rask patient (alle markører i reference) må IKKE få B12-mangel-mønster (healthy-older-002)", () => {
  const cm = classifyAll([
    { id: "b12", value: 326, unit: "pmol/L", sex: "male" },
    { id: "homocystein", value: 10.7, unit: "µmol/L", sex: "male" },
    { id: "mcv", value: 89, unit: "fL", sex: "male" },
  ]);

  for (const m of cm) {
    assert.ok(
      m.status === "ok" || m.status === "optimal",
      `${m.id}=${m.value} forventes 'ok'/'optimal', fik '${m.status}'`,
    );
  }

  const patterns = detectPatterns(cm);
  assert.ok(
    !patterns.some((p) => p.id === "b12_deficiency"),
    `'B12-mangel-mønster' må ikke udløses når b12/homocystein/mcv alle er inden for reference; fik [${patterns
      .map((p) => p.id)
      .join(", ")}]`,
  );
  assert.deepEqual(
    patterns,
    [],
    `forventede ingen mønstre for en rask patient; fik [${patterns.map((p) => p.id).join(", ")}]`,
  );
});

test("ethvert udløst mønster skal have mindst én markør i watch/action", () => {
  const cm = classifyAll([
    { id: "b12", value: 326, unit: "pmol/L", sex: "male" },
    { id: "homocystein", value: 10.7, unit: "µmol/L", sex: "male" },
    { id: "mcv", value: 89, unit: "fL", sex: "male" },
  ]);
  const patterns = detectPatterns(cm);

  for (const p of patterns) {
    const flagged = (p.markers ?? []).some((id) => {
      const m = cm.find((c) => c.id === id);
      return m && (m.status === "watch" || m.status === "action");
    });
    assert.ok(
      flagged,
      `mønster '${p.id}' udløst uden at en eneste listet markør (${(p.markers ?? []).join(", ")}) når watch/action`,
    );
  }
});
