/**
 * REGRESSIONSTEST — Dubleret markør: id→status-map kollapser til sidste post.
 *
 * Kohorte/kategori (oprindelig fund-titel, forkortet til et gyldigt filnavn):
 *   "A: KLASSIFICERING — bliver out-of-range værdier klassificeret optimal/ok;
 *    er optimal/reference/watch/action-grænserne konsistente med directionality
 *    (lavere/højere-er-bedre); fejlklassificeres åbne ender? Verificeret ved at
 *    køre den faktiske kompilerede motor (dist/, identisk med src/) mod alle
 *    33.956 markør-inputs i de 8 kohorter og sammenligne med results.ndjson,
 *    suppleret med målrettede edge-case-probes." — variant -4.
 *   (Det fulde navn kan ikke være ét filnavn: det indeholder '/' (sti-separator)
 *    og overskrider 255-byte-grænsen. Navnet bevares her i kommentaren.)
 *
 * Sværhedsgrad: middel
 *
 * ÅRSAG / FUND:
 *   classifyAll (lib/aevia-engine/src/classify.ts → dist/src/classify.js)
 *   dedupliderer IKKE markører. To input med samme id giver to ClassifiedMarker-
 *   poster. Enhver downstream-forbruger der bygger et id→status-map med last-wins
 *   (fx qa/run-cohort.mjs summarizeDraft() linje 101:
 *     Object.fromEntries(draft.classifiedMarkers.map((m) => [m.id, m.status])))
 *   kollapser dubletten til den SIDSTE post. Med en farlig 'action'-værdi før en
 *   harmløs 'optimal'-dublet forsvinder 'action' fra status-mappet — rent
 *   rækkefølge-styret (input-bestemt).
 *
 *   Reel case: qa/cohort/traps.json "trap-106" har ldl=[1.9 optimal, 6.8 action]
 *   — action ligger TILFÆLDIGT sidst, så mappet viser den. Var rækkefølgen byttet
 *   om, ville en FH-niveau LDL (6.8 mmol/L) være skjult.
 *
 * FORVENTET (det denne test asserterer, og som p.t. FEJLER):
 *   Dublerede markører bør dedupliceres deterministisk ('værste status vinder')
 *   FØR de samles i et id→status-map, så en farlig værdi aldrig kan skjules af en
 *   harmløs dublet uanset input-rækkefølge. Et id→status-map udledt af
 *   classifiedMarkers skal derfor give ldl='action' i BEGGE rækkefølger.
 *
 * Sikkerhedsnet (verificeret separat, ikke det her testes): draft.flaggedForDoctor
 *   beholder ldl=6.8:action uanset rækkefølge, så lægen ser den dér. Buggen er i
 *   id→status-mappet, ikke i action-flaget.
 *
 * Kører den FAKTISKE kompilerede motor (dist/, identisk med src/).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { classifyAll, buildReportDraft } from "../../dist/src/index.js";

/** Sværhedsordning: 'action' er den værste status og må aldrig kunne skjules. */
const SEVERITY = { optimal: 0, ok: 1, watch: 2, action: 3 };

/**
 * Byg et id→status-map på den deterministisk KORREKTE måde: værste status vinder.
 * Dette er den adfærd motoren (eller en delt hjælper) BØR garantere; testen
 * sammenligner med det naive last-wins, motoren reelt efterlader downstream.
 */
function worstStatusMap(markers) {
  const map = {};
  for (const m of markers) {
    if (map[m.id] == null || SEVERITY[m.status] > SEVERITY[map[m.id]]) {
      map[m.id] = m.status;
    }
  }
  return map;
}

/** Den naive last-wins-kollaps som qa/run-cohort.mjs (og andre) faktisk bruger. */
function lastWinsMap(markers) {
  return Object.fromEntries(markers.map((m) => [m.id, m.status]));
}

const ORDER_ACTION_LAST = [
  { id: "ldl", value: 1.9, unit: "mmol/L" }, // optimal
  { id: "ldl", value: 6.8, unit: "mmol/L" }, // action (FH-niveau)
];
const ORDER_OPTIMAL_LAST = [
  { id: "ldl", value: 6.8, unit: "mmol/L" }, // action (FH-niveau)
  { id: "ldl", value: 1.9, unit: "mmol/L" }, // optimal
];

test("classifyAll: en farlig dublet skjules ikke i et id→status-map uanset input-rækkefølge", () => {
  const a = classifyAll(ORDER_ACTION_LAST);
  const b = classifyAll(ORDER_OPTIMAL_LAST);

  // Motoren producerer to poster i begge rækkefølger (ingen dedup) — dokumenteret kontekst.
  assert.equal(a.length, 2, "classifyAll bør se begge dublet-input");
  assert.equal(b.length, 2, "classifyAll bør se begge dublet-input");

  // KERNEASSERTION (fejler p.t.): et id→status-map afledt af motorens output
  // skal være rækkefølge-uafhængigt og altid afsløre den værste status.
  const mapA = lastWinsMap(a);
  const mapB = lastWinsMap(b);

  assert.equal(
    mapA.ldl,
    "action",
    "ldl=6.8 (action) skal være synlig i id→status-mappet med action SIDST",
  );
  assert.equal(
    mapB.ldl,
    "action",
    "ldl=6.8 (action) MÅ IKKE skjules af en optimal dublet når optimal står SIDST — " +
      "motoren bør dedupliklere 'værste status vinder' før et id→status-map bygges",
  );
  assert.equal(
    mapA.ldl,
    mapB.ldl,
    "id→status-mappet skal være deterministisk uafhængigt af input-rækkefølge",
  );
});

test("buildReportDraft: id→status-map fra classifiedMarkers er rækkefølge-uafhængigt", () => {
  const mk = (markers) => ({
    name: "QA Testperson",
    cpr: "000000-0000",
    email: "qa@example.invalid",
    age: 50,
    sex: "male",
    markers: markers.map((m) => ({ ...m, sex: "male", age: 50 })),
  });
  const ctx = { baseline: true, adherence: 0 };

  const draftActionLast = buildReportDraft(mk(ORDER_ACTION_LAST), ctx);
  const draftOptimalLast = buildReportDraft(mk(ORDER_OPTIMAL_LAST), ctx);

  // Det map en kliniker-UI/summarizeDraft bygger (last-wins) skal afsløre action
  // i begge rækkefølger. Fejler p.t. for 'optimal sidst'.
  const mapActionLast = lastWinsMap(draftActionLast.classifiedMarkers);
  const mapOptimalLast = lastWinsMap(draftOptimalLast.classifiedMarkers);

  assert.equal(
    mapActionLast.ldl,
    "action",
    "draft id→status-map skal vise ldl=action når action står sidst",
  );
  assert.equal(
    mapOptimalLast.ldl,
    "action",
    "draft id→status-map MÅ IKKE skjule ldl=action når en optimal dublet står sidst",
  );

  // Konsistens-tjek: den korrekte 'værste vinder'-udledning skal matche begge.
  assert.deepEqual(
    worstStatusMap(draftActionLast.classifiedMarkers),
    worstStatusMap(draftOptimalLast.classifiedMarkers),
    "værste-status-mappet skal være rækkefølge-uafhængigt",
  );
});
