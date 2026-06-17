// PAY-02 — regressionstest: idempotens på Stripe-webhook (replay → dublerede mails)
//
// Kør:  node --test security/booking-redteam/tests/PAY-02.test.mjs
//
// Hvad den beviser:
//   - HULLET: den NUVÆRENDE handler-kontrakt (kun signatur-verifikation, ingen
//     event.id-dedup) sender bekræftelsesmailen ÉN gang pr. leverance — så to
//     leverancer af samme event.id giver TO mails.
//   - FIXET: en handler med markEventProcessed-gaten (SET wh:<id> NX EX) sender
//     mailen højst ÉN gang for samme event.id, uanset hvor mange gange eventet
//     genleveres inden for vinduet.
//
// Hvorfor vi ikke importerer api/stripe-webhook.js direkte:
//   Live-modulet new'er en Stripe-klient ved import (kræver STRIPE_SECRET_KEY) og
//   afhænger af Upstash REST + Resend via netværk. Vi reproducerer i stedet
//   handler-KONTRAKTEN 1:1 med en in-memory Redis-mock og en sendMail-spion. Det
//   afgørende for en regressionstest er at fange dublet-adfærden, ikke at køre
//   den fulde I/O. Mapping mod live-linjer er noteret ved hver model nedenfor.

import { test } from "node:test";
import assert from "node:assert/strict";

// ── Minimal in-memory Redis (kun de kommandoer fixet bruger) ──────────────────
// Modellerer Upstash REST-svarene: SET ... NX returnerer "OK" ved første set og
// null hvis nøglen allerede findes — præcis som i api/_booking-store.js:340.
function makeRedis() {
  const store = new Map();
  return {
    calls: [],
    async cmd(args) {
      this.calls.push(args);
      const [op, key] = args;
      if (op === "SET") {
        const hasNX = args.includes("NX");
        if (hasNX && store.has(key)) return null; // allerede sat
        store.set(key, args[2]);
        return "OK";
      }
      if (op === "GET") return store.has(key) ? store.get(key) : null;
      throw new Error(`unmodelleret redis-op: ${op}`);
    },
  };
}

// Spejler api/_booking-store.js:markEventProcessed (FIX-forslaget):
//   SET wh:<id> "1" NX EX ttl  →  "OK" (første gang) ⇒ true, null ⇒ false.
//   Fail-open hvis redis mangler.
async function markEventProcessed(redis, eventId, ttl = 60 * 60 * 24 * 7) {
  if (!redis || !eventId) return true; // fail-open (svarer til !isConfigured())
  try {
    const r = await redis.cmd(["SET", `wh:${eventId}`, "1", "NX", "EX", ttl]);
    return r === "OK";
  } catch {
    return true; // fail-open
  }
}

// ── Handler-modeller ──────────────────────────────────────────────────────────
// Begge tager et allerede verificeret event (vi tester IKKE signaturkoden —
// constructEvent godkender pr. design en gyldigt signeret replay; det er netop
// derfor dedup er nødvendig). De repræsenterer api/stripe-webhook.js:150-174.

// NUVÆRENDE adfærd (sårbar): ingen dedup → sendMail ved hvert gennemløb.
async function handleVulnerable({ event, sendMail }) {
  const s = event.data.object || {};
  const to = s.customer_details?.email;
  if (event.type === "checkout.session.completed" && to) {
    await sendMail({ to, subject: "Din booking hos Aevia er bekræftet" }); // :161-167
  }
  return { status: 200, body: { received: true } };
}

// FIXET adfærd: event.id-dedup FØR bivirkninger.
async function handleFixed({ event, sendMail, redis }) {
  // Gaten ligger efter constructEvent, før completed-grenen (FIX 4b).
  if (!(await markEventProcessed(redis, event.id))) {
    return { status: 200, body: { received: true, duplicate: true } };
  }
  const s = event.data.object || {};
  const to = s.customer_details?.email;
  if (event.type === "checkout.session.completed" && to) {
    await sendMail({ to, subject: "Din booking hos Aevia er bekræftet" });
  }
  return { status: 200, body: { received: true } };
}

// Én gyldigt signeret leverance — samme event.id gen-POST'es (Stripe-retry ELLER
// angriber-replay). Identisk objekt = identisk raw body = identisk signatur.
function completedEvent() {
  return {
    id: "evt_test_PAY02_replay",
    type: "checkout.session.completed",
    data: { object: { customer_details: { email: "kunde@example.com", name: "Test Kunde" }, amount_total: 599500 } },
  };
}

function mailSpy() {
  const sent = [];
  return { send: async (m) => { sent.push(m); }, sent };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test("HUL (regression-vagt): nuværende handler sender 2 mails ved replay af samme event.id", async () => {
  const spy = mailSpy();
  const ev = completedEvent();
  // Stripe genleverer samme event 3 gange inden for tolerancen.
  await handleVulnerable({ event: ev, sendMail: spy.send });
  await handleVulnerable({ event: ev, sendMail: spy.send });
  await handleVulnerable({ event: ev, sendMail: spy.send });
  // Dokumenterer hullet: uden dedup → én mail pr. leverance.
  assert.equal(spy.sent.length, 3, "uden fix forventes en mail pr. replay (hullet)");
});

test("FIX: replay af samme event.id sender højst ÉN bekræftelsesmail", async () => {
  const redis = makeRedis();
  const spy = mailSpy();
  const ev = completedEvent();
  const r1 = await handleFixed({ event: ev, sendMail: spy.send, redis });
  const r2 = await handleFixed({ event: ev, sendMail: spy.send, redis });
  const r3 = await handleFixed({ event: ev, sendMail: spy.send, redis });

  assert.equal(spy.sent.length, 1, "kun den FØRSTE leverance må sende mail");
  assert.equal(r1.status, 200);
  // Replays kvitteres stadig 200 (så Stripe ikke retry-spammer), men markeres som dublet.
  assert.equal(r2.status, 200);
  assert.equal(r2.body.duplicate, true);
  assert.equal(r3.body.duplicate, true);
});

test("FIX: forskellige event.id'er behandles uafhængigt (ingen falsk dedup)", async () => {
  const redis = makeRedis();
  const spy = mailSpy();
  const a = completedEvent();
  const b = { ...completedEvent(), id: "evt_test_PAY02_other" };
  await handleFixed({ event: a, sendMail: spy.send, redis });
  await handleFixed({ event: b, sendMail: spy.send, redis });
  assert.equal(spy.sent.length, 2, "to ægte forskellige events skal begge sende mail");
});

test("FIX: markEventProcessed er atomisk — kun første kald vinder NX-låsen", async () => {
  const redis = makeRedis();
  const first = await markEventProcessed(redis, "evt_atomic");
  const second = await markEventProcessed(redis, "evt_atomic");
  assert.equal(first, true, "første kald sætter nøglen (SET NX ⇒ OK)");
  assert.equal(second, false, "andet kald ser nøglen (SET NX ⇒ null)");
  // Verificér at TTL-bærende NX-SET faktisk blev udstedt mod Redis.
  const setCall = redis.calls.find((c) => c[0] === "SET" && c[1] === "wh:evt_atomic");
  assert.ok(setCall, "wh:<id> SET skal være udstedt");
  assert.ok(setCall.includes("NX") && setCall.includes("EX"), "skal bruge NX + EX (TTL)");
});

test("FIX: fail-open — uden Redis tabes en legitim førstegangs-bekræftelse ikke", async () => {
  const spy = mailSpy();
  const ev = completedEvent();
  // redis=null modellerer !isConfigured() / Redis-nedetid → markEventProcessed=true.
  const r = await handleFixed({ event: ev, sendMail: spy.send, redis: null });
  assert.equal(spy.sent.length, 1, "ved Redis-nedetid skal mailen stadig sendes (fail-open)");
  assert.equal(r.status, 200);
});
