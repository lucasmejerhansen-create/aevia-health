// ICS-01 — Regressionstest: Algoritmisk DoS i parseICS (RRULE-ekspansion).
//
// Demonstrerer hullet i live-koden og verificerer, at det foreslåede fix lukker
// det UDEN at ændre output for legitime feeds.
//
// Køres med:  node --test security/booking-redteam/tests/ICS-01.test.mjs
//
// Designvalg:
//  - Vi importerer BÅDE den LIVE (sårbare) parseICS og den PATCHEDE kopi, så
//    samme test både fanger regressionen og dokumenterer fixet.
//  - Live-koden ændres IKKE; den patchede kopi ligger ved siden af denne test
//    (_calendar.patched.mjs) og svarer 1:1 til diff'en i ../patches/03-ICS-01.md.
//  - Tidsbudgetterne er rundhåndede, så testen ikke flapper på langsomme CI-bokse;
//    den vigtige assertion er det RELATIVE forhold (patched << live) samt at
//    output er identisk for normale feeds.

import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LIVE = path.resolve(HERE, "../../../api/_calendar.js");
const PATCHED = path.resolve(HERE, "./_calendar.patched.mjs");

const live = await import(fileURLToPath(new URL(`file://${LIVE}`)));
const patched = await import(fileURLToPath(new URL(`file://${PATCHED}`)));

// ── Hjælpere ─────────────────────────────────────────────────────────────────

// Byg et ondsindet ~targetBytes ICS-feed: mange degenererede WEEKLY-VEVENT'er med
// DTSTART ~11 år i fortiden + højt INTERVAL → 0 brugbare forekomster, men hver
// VEVENT brænder den fulde dag-løkke i den usårbare kode.
function evilFeed(targetBytes = 1_000_000) {
  const block =
    "BEGIN:VEVENT\nDTSTART:20150101T090000Z\nRRULE:FREQ=WEEKLY;INTERVAL=99\nEND:VEVENT\n";
  let body = "BEGIN:VCALENDAR\n";
  let n = 0;
  while (body.length < targetBytes) { body += block; n++; }
  body += "END:VCALENDAR\n";
  // fetchBusy capper input til ~1 MB; vi efterligner det her.
  return { ics: body.slice(0, 1_000_000), vevents: n };
}

function msToRun(fn) {
  const t0 = process.hrtime.bigint();
  const result = fn();
  const t1 = process.hrtime.bigint();
  return { ms: Number(t1 - t0) / 1e6, result };
}

// Et almindeligt, lille feed med en ugentlig blokering, der faktisk rammer
// bookingvinduet (lead..horizon). Bruges til at bevise at fixet IKKE ændrer
// korrekt output.
function realisticFeed() {
  const now = new Date();
  // En DTSTART for nylig (i sidste uge) på en fast ugedag, ugentlig, ingen UNTIL.
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - 7);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const dtstart = `${yyyy}${mm}${dd}T090000Z`;
  const dtend = `${yyyy}${mm}${dd}T093000Z`;
  return [
    "BEGIN:VCALENDAR",
    "BEGIN:VEVENT",
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    "RRULE:FREQ=WEEKLY",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\n");
}

// ── Tests ────────────────────────────────────────────────────────────────────

test("ICS-01: ondsindet 1MB-feed producerer 0 intervaller i BÅDE live og patched", () => {
  const { ics } = evilFeed();
  const liveOut = live.parseICS(ics);
  const patchedOut = patched.parseICS(ics);
  // Begge SKAL give 0 — feedet rammer aldrig vinduet. Det er netop pointen:
  // det er rent spildt arbejde (ingen nyttig output).
  assert.equal(liveOut.length, 0, "live bør producere 0 intervaller for evil-feed");
  assert.equal(patchedOut.length, 0, "patched bør producere 0 intervaller for evil-feed");
});

test("ICS-01: patched parseICS er dramatisk hurtigere end live på evil-feed (DoS lukket)", () => {
  const { ics, vevents } = evilFeed();

  const liveRun = msToRun(() => live.parseICS(ics));
  const patchedRun = msToRun(() => patched.parseICS(ics));

  // Diagnostik (synlig med --test-reporter=spec eller ved fejl).
  console.log(
    `ICS-01 ~${vevents} VEVENTs: live=${liveRun.ms.toFixed(0)}ms ` +
    `patched=${patchedRun.ms.toFixed(0)}ms`,
  );

  // Hård regressions-tærskel for det patchede output: skal være langt under den
  // målte ~1,5 s blokering. 250 ms er rundhåndet for langsom CI, men stadig en
  // klasse under live-adfærden.
  assert.ok(
    patchedRun.ms < 250,
    `patched parse tog ${patchedRun.ms.toFixed(0)}ms — forventede < 250ms (DoS ikke lukket)`,
  );

  // Patched skal være MINDST 5× hurtigere end live på dette feed. (I praksis
  // måles ~1,5 s vs. få ms = >100×; 5× er en stabil nedre grænse mod flap.)
  assert.ok(
    patchedRun.ms * 5 < liveRun.ms,
    `forventede patched mindst 5× hurtigere: live=${liveRun.ms.toFixed(0)}ms ` +
    `patched=${patchedRun.ms.toFixed(0)}ms`,
  );
});

test("ICS-01: fixet bevarer output for et legitimt ugentligt feed (ingen regression)", () => {
  const ics = realisticFeed();
  const liveOut = live.parseICS(ics);
  const patchedOut = patched.parseICS(ics);

  // Et ugentligt møde uden UNTIL skal give flere blokeringer i 64-dages vinduet.
  assert.ok(liveOut.length > 0, "live bør producere intervaller for et reelt feed");

  // Vigtigst: patched giver PRÆCIS samme intervaller som live for et normalt feed.
  assert.deepEqual(
    patchedOut,
    liveOut,
    "patched bør give identisk output som live for et legitimt feed",
  );
});

test("ICS-01: VEVENT-loft afkorter et feed med > MAX_VEVENTS uden at hænge", () => {
  // Mange SMÅ engangs-VEVENT'er (ingen RRULE) der ER inde i vinduet: live tager
  // dem alle; patched stopper ved loftet (MAX_VEVENTS=5000). Vi tjekker, at
  // patched ikke fejler og holder sig inden for loftet.
  const now = new Date();
  const base = new Date(now); base.setUTCDate(base.getUTCDate() + 5);
  const yyyy = base.getUTCFullYear();
  const mm = String(base.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(base.getUTCDate()).padStart(2, "0");
  let body = "BEGIN:VCALENDAR\n";
  const N = 8000; // > MAX_VEVENTS
  for (let i = 0; i < N; i++) {
    const hh = String(i % 24).padStart(2, "0");
    body += `BEGIN:VEVENT\nDTSTART:${yyyy}${mm}${dd}T${hh}0000Z\nDTEND:${yyyy}${mm}${dd}T${hh}3000Z\nEND:VEVENT\n`;
  }
  body += "END:VCALENDAR\n";

  const patchedOut = patched.parseICS(body);
  // Patched må aldrig overstige VEVENT-loftet (5000). Live ville tage alle 8000.
  assert.ok(
    patchedOut.length <= 5000,
    `patched bør respektere VEVENT-loftet (≤5000), fik ${patchedOut.length}`,
  );
  assert.ok(patchedOut.length > 0, "patched bør stadig producere de første intervaller");
});
