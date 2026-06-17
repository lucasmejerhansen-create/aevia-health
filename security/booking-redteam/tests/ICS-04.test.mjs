// Regressionstest for ICS-04 — kalender-busy-tjek fail-open'er ved langsom/
// fejlende ICS-server → instant-booking oven i ekstern klinik-aftale.
//
// Kør:  node --test security/booking-redteam/tests/ICS-04.test.mjs
//
// Testen mocker minimalt. Den modellerer commit-stiens reservePart i TO varianter:
//   - reservePartVULN: nuværende live-adfærd (fetchBusy → [] ved drift, catch(_){} ).
//   - reservePartFIXED: forslaget i patches/05-ICS-04.md (fetchBusy → null ved drift;
//                       reservePart behandler null/exception som optaget → fail-closed).
// Begge bruger DEN SAMME slotIsBusy-semantik og det SAMME atomiske INCR/cap-tjek, så
// forskellen isoleres til kalender-fail-open vs. fail-closed.
//
// Forventet:
//   * "demonstrerer hullet"  → reservePartVULN  giver ok:true ved drift over optaget tid.
//   * "fix afviser"          → reservePartFIXED giver ok:false ved drift over optaget tid.
//   * "fix regresserer ikke" → reservePartFIXED giver stadig ok:true når kalenderen
//                              svarer normalt OG tiden er fri.

import { test } from "node:test";
import assert from "node:assert/strict";

// ── slotIsBusy: tro kopi af api/_calendar.js:194-202 (ren funktion) ──────────────
// (Kopieret bevidst, så testen ikke afhænger af at api/ er ESM-importérbar uden
//  Redis/DNS. Semantikken er identisk: tom/null busy = ikke optaget.)
function dkLocalToUtc(y, mo, d, h, mi) {
  // Forenklet til fast offset; irrelevant for overlap-logikken da begge sider
  // bruger samme konvertering. Vi bruger bare UTC her.
  return Date.UTC(y, mo, d, h, mi, 0);
}
function slotIsBusy(busy, dateStr, hhmm, slotMin) {
  if (!busy || !busy.length) return false; // null ELLER [] → false (jf. _calendar.js:195)
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  const s = dkLocalToUtc(y, mo - 1, d, h, mi);
  const e = s + slotMin * 60000;
  for (const iv of busy) if (s < iv.end && iv.start < e) return true;
  return false;
}

// ── Mock-Redis: kun de kommandoer reservePart bruger (INCR/EXPIRE/DECR/SISMEMBER) ─
function makeRedis() {
  const store = new Map();
  return {
    store,
    async cmd(args) {
      const [op, key] = args;
      switch (op) {
        case "INCR": { const n = (store.get(key) || 0) + 1; store.set(key, n); return n; }
        case "DECR": { const n = (store.get(key) || 0) - 1; store.set(key, n); return n; }
        case "EXPIRE": return 1;
        case "SISMEMBER": return 0; // ingen manuel blk: i denne test
        default: throw new Error("uventet redis-cmd: " + op);
      }
    },
  };
}

// ── Konfiguration: én ydelse med tilknyttet ekstern kalender ─────────────────────
const CONF = { slot: 30, cap: 1, calUrl: "https://cal.example.test/clinic.ics" };
const DATE = "2026-06-23"; // en tirsdag
const TIME = "09:00";

// En EKSTERN aftale i klinikkens kalender der overlapper Aevia-tiden 09:00-09:30.
const EXTERNAL_BUSY = [{
  start: dkLocalToUtc(2026, 5, 23, 9, 0),  // 2026-06-23 09:00
  end: dkLocalToUtc(2026, 5, 23, 9, 30),
}];

// fetchBusy-mocks ────────────────────────────────────────────────────────────────
// Nuværende live-adfærd: drift (timeout/5xx/redirect/exception) → [] (fail-open).
async function fetchBusy_driftVULN() { return []; }
// Forslaget: drift → null (ukendt status). SSRF/tom kalender ville stadig give [].
async function fetchBusy_driftFIXED() { return null; }
// Normal drift, tiden er fri.
async function fetchBusy_okFree() { return []; }

// ── reservePart: NUVÆRENDE (sårbar) variant — modellerer api/_booking-store.js:252-278
async function reservePartVULN({ redis, conf, busy, fetchBusy }) {
  const c = conf;
  // (slot-eksistens-tjek udeladt — irrelevant for ICS-04)
  if (slotIsBusy(busy, DATE, TIME, c.slot)) return { ok: false, reason: "cache-busy" };
  if (c.calUrl) {
    // ── HULLET: [] ved drift → slotIsBusy([]) = false → springes over;
    //    og catch(_){} swallow'er enhver exception.
    try { if (slotIsBusy(await fetchBusy(c.calUrl), DATE, TIME, c.slot)) return { ok: false, reason: "live-busy" }; } catch (_) {}
  }
  const cntKey = `cnt:x:${DATE}:${TIME}`;
  const n = await redis.cmd(["INCR", cntKey]);
  await redis.cmd(["EXPIRE", cntKey, 1]);
  if (n > c.cap) { await redis.cmd(["DECR", cntKey]); return { ok: false, reason: "cap" }; }
  if (await redis.cmd(["SISMEMBER", `blk:x:${DATE}`, TIME])) { await redis.cmd(["DECR", cntKey]); return { ok: false, reason: "blocked" }; }
  return { ok: true };
}

// ── reservePart: FORESLÅET (fail-closed) variant — jf. patches/05-ICS-04.md ───────
async function reservePartFIXED({ redis, conf, busy, fetchBusy }) {
  const c = conf;
  // null = ukendt kalenderstatus (drift) → behandl som optaget (fail-CLOSED).
  if (busy === null || slotIsBusy(busy, DATE, TIME, c.slot)) return { ok: false, reason: "cache-busy/unknown" };
  if (c.calUrl) {
    let live;
    try { live = await fetchBusy(c.calUrl); }
    catch (_) { live = null; } // exception → ukendt status → fail-closed
    if (live === null || slotIsBusy(live, DATE, TIME, c.slot)) return { ok: false, reason: "live-busy/unknown" };
  }
  const cntKey = `cnt:x:${DATE}:${TIME}`;
  const n = await redis.cmd(["INCR", cntKey]);
  await redis.cmd(["EXPIRE", cntKey, 1]);
  if (n > c.cap) { await redis.cmd(["DECR", cntKey]); return { ok: false, reason: "cap" }; }
  if (await redis.cmd(["SISMEMBER", `blk:x:${DATE}`, TIME])) { await redis.cmd(["DECR", cntKey]); return { ok: false, reason: "blocked" }; }
  return { ok: true };
}

// ── Tests ────────────────────────────────────────────────────────────────────────

test("ICS-04: NUVÆRENDE kode dobbeltbooker ved kalender-drift (demonstrerer hullet)", async () => {
  // Cache er tom (drift-vindue / udløbet) → cache-busy-tjek viser ledig.
  // Live fetchBusy fail-open'er til [] → busy-tjek springes over → INCR lykkes.
  const redis = makeRedis();
  const r = await reservePartVULN({ redis, conf: CONF, busy: [], fetchBusy: fetchBusy_driftVULN });
  assert.equal(r.ok, true,
    "Den sårbare variant bør (forkert) bekræfte oven i en ekstern aftale — det er hullet ICS-04 beskriver.");
  // Bekræft at en cnt: faktisk blev oprettet (kunden ER reserveret).
  assert.equal(redis.store.get(`cnt:x:${DATE}:${TIME}`), 1, "cnt blev sat → instant-bekræftelse ville følge.");
});

test("ICS-04: FIX afviser ved kalender-drift (null fra fetchBusy → fail-closed)", async () => {
  const redis = makeRedis();
  const r = await reservePartFIXED({ redis, conf: CONF, busy: [], fetchBusy: fetchBusy_driftFIXED });
  assert.equal(r.ok, false, "Fixet skal afvise når kalenderstatus er ukendt (drift).");
  assert.match(r.reason, /unknown|busy/i);
  // Ingen reservation oprettet → ingen instant-bekræftelse oven i ekstern aftale.
  assert.equal(redis.store.get(`cnt:x:${DATE}:${TIME}`), undefined, "Ingen cnt: → ingen dobbeltbooking.");
});

test("ICS-04: FIX afviser også når exception kastes i live-tjekket", async () => {
  const redis = makeRedis();
  const boom = async () => { throw new Error("ECONNRESET"); };
  const r = await reservePartFIXED({ redis, conf: CONF, busy: [], fetchBusy: boom });
  assert.equal(r.ok, false, "Exception i fetchBusy → fail-closed (ikke swallow'et som i catch(_){}).");
});

test("ICS-04: FIX afviser når den prækalkulerede busy er null (cachet drift)", async () => {
  // busyFor kan cache 'null' (drift) og videregive det som busies[svc].
  const redis = makeRedis();
  const r = await reservePartFIXED({ redis, conf: CONF, busy: null, fetchBusy: fetchBusy_okFree });
  assert.equal(r.ok, false, "Prækalkuleret null (drift) må ikke 'redde' booking — fail-closed.");
});

test("ICS-04: FIX regresserer ikke — normal kalender + fri tid → booking lykkes", async () => {
  const redis = makeRedis();
  const r = await reservePartFIXED({ redis, conf: CONF, busy: [], fetchBusy: fetchBusy_okFree });
  assert.equal(r.ok, true, "Med kalenderen oppe og tiden fri skal booking stadig lykkes.");
  assert.equal(redis.store.get(`cnt:x:${DATE}:${TIME}`), 1);
});

test("ICS-04: FIX afviser fortsat når kalenderen reelt er optaget (uændret korrekt adfærd)", async () => {
  const redis = makeRedis();
  const r = await reservePartFIXED({ redis, conf: CONF, busy: [], fetchBusy: async () => EXTERNAL_BUSY });
  assert.equal(r.ok, false, "En reelt optaget tid skal stadig afvises.");
});

test("ICS-04: kontrol — også den sårbare variant afviser når busy faktisk er kendt-optaget", async () => {
  // Sikrer at testen isolerer fail-open-stien og ikke bare 'altid afviser'.
  const redis = makeRedis();
  const r = await reservePartVULN({ redis, conf: CONF, busy: EXTERNAL_BUSY, fetchBusy: fetchBusy_driftVULN });
  assert.equal(r.ok, false, "Når busy er kendt-optaget fanger selv den sårbare variant det.");
});
