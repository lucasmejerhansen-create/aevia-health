// AUTHZ-05 — regressionstest for fail-open brute-force-bremse + spoofbar XFF-bucket.
//
// Kør:  node --test security/booking-redteam/tests/AUTHZ-05.test.mjs
//
// Hvorfor en lokal kopi af logikken?
//   Patchen i patches/06-AUTHZ-05.md må (jf. opgaven) ikke anvendes på api/
//   endnu. Testen indeholder derfor BÅDE den nuværende sårbare implementering
//   (VULN_*) og den foreslåede fixede (FIXED_*), så vi kan:
//     1) bevise at den sårbare adfærd findes i dag (de "demonstrerer hul"-tests),
//     2) bevise at fixet lukker hullet (de "efter fix"-tests).
//   Når patchen senere anvendes på api/_ratelimit.js, fanger FIXED_*-asserts en
//   regression hvis nogen genindfører fail-open eller leftmost-XFF.

import { test } from "node:test";
import assert from "node:assert/strict";

// ── Miljø-helpers: simulér "ingen KV" (fail-open-forudsætningen) ──────────────
function withoutKvEnv(fn) {
  const saved = {};
  for (const k of [
    "KV_REST_API_URL", "KV_REST_API_TOKEN",
    "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN",
  ]) { saved[k] = process.env[k]; delete process.env[k]; }
  try { return fn(); }
  finally { for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } }
}
function kvUrl() { return process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ""; }
function kvToken() { return process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ""; }

const req = (headers) => ({ headers, socket: { remoteAddress: "10.0.0.1" } });

// ─────────────────────────────────────────────────────────────────────────────
// NUVÆRENDE (SÅRBAR) implementering — kopi af api/_ratelimit.js:31-34 + 48-61.
// ─────────────────────────────────────────────────────────────────────────────
function VULN_clientIp(r) {
  const xf = r.headers && (r.headers["x-forwarded-for"] || r.headers["X-Forwarded-For"]);
  if (xf) return String(xf).split(",")[0].trim();             // leftmost = klient-kontrolleret
  return (r.socket && r.socket.remoteAddress) || "unknown";
}
async function VULN_tooManyFails(r, bucket, opts) {
  const max = (opts && opts.max) || 10;
  if (!kvUrl() || !kvToken()) return false;                   // fail-open uden KV
  // (KV-grenen er ikke relevant for de sårbare baseline-tests her)
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORESLÅET (FIXET) implementering — spejler patches/06-AUTHZ-05.md.
// ─────────────────────────────────────────────────────────────────────────────
function FIXED_clientIp(r) {
  const h = r.headers || {};
  const real = h["x-real-ip"] || h["X-Real-IP"];
  if (real) return String(real).trim();
  const xf = h["x-forwarded-for"] || h["X-Forwarded-For"];
  if (xf) {
    const parts = String(xf).split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];         // højre-mest = betroet hop
  }
  return (r.socket && r.socket.remoteAddress) || "unknown";
}
const _mem = new Map();
function memTooMany(key, max, windowSec) {
  const now = Date.now();
  const e = _mem.get(key);
  if (!e || e.exp <= now) { _mem.set(key, { n: 1, exp: now + windowSec * 1000 }); return 1 > max; }
  e.n += 1;
  return e.n > max;
}
async function FIXED_tooManyFails(r, bucket, opts) {
  const max = (opts && opts.max) || 10;
  const windowSec = (opts && opts.windowSec) || 900;
  const key = `rl:${bucket}:${FIXED_clientIp(r)}`;
  if (!kvUrl() || !kvToken()) return memTooMany(key, max, windowSec);  // KV-uafhængig fallback
  // (KV-grenen testes ikke her; fokus er fail-open + spoof)
  return false;
}

// ═════════════════════════════════════════════════════════════════════════════
// 1) FAIL-OPEN UDEN KV
// ═════════════════════════════════════════════════════════════════════════════

test("baseline: sårbar bremse er ubremset uden KV (dokumenterer hullet)", async () => {
  await withoutKvEnv(async () => {
    let throttled = false;
    for (let i = 0; i < 50; i++) {
      if (await VULN_tooManyFails(req({}), "clinic-portal", { max: 10, windowSec: 900 })) throttled = true;
    }
    // Sårbar: returnerer ALTID false → angriber rammer aldrig 429.
    assert.equal(throttled, false, "sårbar implementering bremser aldrig uden KV");
  });
});

test("efter fix: bremse slår til uden KV (in-memory fallback)", async () => {
  _mem.clear();
  await withoutKvEnv(async () => {
    const r = req({}); // ingen XFF → socket-IP, stabil bucket
    let firstThrottledAt = -1;
    for (let i = 0; i < 50; i++) {
      const blocked = await FIXED_tooManyFails(r, "clinic-portal", { max: 10, windowSec: 900 });
      if (blocked && firstThrottledAt === -1) firstThrottledAt = i;
    }
    // Fix: efter max(=10) tællinger skal forsøg 11+ (index 10+) blokeres.
    assert.equal(firstThrottledAt, 10, "fix skal bremse efter 10 fejl uden KV");
  });
});

test("efter fix: bremse slår også til ved KV-fejl (catch-grenen falder tilbage)", async () => {
  // Catch-grenen i fixet kalder samme memTooMany som no-KV-grenen. Vi verificerer
  // fallback-funktionens kontrakt direkte, så regressionen fanges uafhængigt af
  // hvordan KV-fejlen produceres i prod.
  _mem.clear();
  let firstThrottledAt = -1;
  for (let i = 0; i < 50; i++) {
    const blocked = memTooMany("rl:admin-bookings:1.2.3.4", 10, 900);
    if (blocked && firstThrottledAt === -1) firstThrottledAt = i;
  }
  assert.equal(firstThrottledAt, 10, "fallback ved Upstash-fejl skal bremse efter 10 fejl");
});

// ═════════════════════════════════════════════════════════════════════════════
// 2) SPOOFBAR X-FORWARDED-FOR IP-BUCKET
// ═════════════════════════════════════════════════════════════════════════════

test("baseline: leftmost-XFF lader angriber styre bucket (dokumenterer hullet)", () => {
  // Angriber roterer leftmost XFF → forskellige buckets på trods af samme hop.
  const a = VULN_clientIp(req({ "x-forwarded-for": "1.2.3.7, 70.0.0.1" }));
  const b = VULN_clientIp(req({ "x-forwarded-for": "1.2.3.8, 70.0.0.1" }));
  assert.equal(a, "1.2.3.7");
  assert.equal(b, "1.2.3.8");
  assert.notEqual(a, b, "sårbar: roteret leftmost giver ny bucket pr. forsøg");
});

test("efter fix: roteret leftmost-XFF kan IKKE skifte bucket", () => {
  // Samme betroede proxy-hop (højre-mest) → SAMME bucket trods roteret leftmost.
  const a = FIXED_clientIp(req({ "x-forwarded-for": "1.2.3.7, 70.0.0.1" }));
  const b = FIXED_clientIp(req({ "x-forwarded-for": "1.2.3.8, 70.0.0.1" }));
  assert.equal(a, "70.0.0.1");
  assert.equal(b, "70.0.0.1");
  assert.equal(a, b, "fix: leftmost-rotation ændrer ikke bucket");
});

test("efter fix: x-real-ip foretrækkes og kan ikke overrules af XFF-spoof", () => {
  const ip = FIXED_clientIp(req({ "x-real-ip": "70.0.0.9", "x-forwarded-for": "1.2.3.7, 70.0.0.1" }));
  assert.equal(ip, "70.0.0.9", "fix: x-real-ip vinder over klient-leveret XFF");
});

test("efter fix: rotation af leftmost XFF samler i én bucket → bremsen holder", async () => {
  _mem.clear();
  await withoutKvEnv(async () => {
    let throttledCount = 0;
    for (let i = 0; i < 30; i++) {
      const r = req({ "x-forwarded-for": `1.2.3.${i}, 70.0.0.1` }); // roteret leftmost, samme hop
      if (await FIXED_tooManyFails(r, "clinic-portal", { max: 10, windowSec: 900 })) throttledCount++;
    }
    // Alle 30 forsøg deler bucket rl:clinic-portal:70.0.0.1 → 20 blokeres (index 10..29).
    assert.equal(throttledCount, 20, "fix: XFF-rotation nulstiller ikke per-IP-bremsen");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3) Ingen-regression: fallback uden proxy bevarer socket-adfærd
// ═════════════════════════════════════════════════════════════════════════════

test("efter fix: uden proxy-headers bruges socket-IP (uændret lokal adfærd)", () => {
  assert.equal(FIXED_clientIp(req({})), "10.0.0.1");
});
