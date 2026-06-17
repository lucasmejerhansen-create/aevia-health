// WEBHOOK-02 — regressionstest: Cal.com-webhook replay-/idempotens-beskyttelse.
//
// Kør:  node --test security/booking-redteam/tests/WEBHOOK-02.test.mjs
//
// Hvad den fanger:
//   Den nuværende handler (api/cal-webhook.js) sender en mail HVER gang en gyldigt
//   signeret BOOKING_CREATED-body POST'es — uden timestamp/nonce og uden idempotens.
//   En fanget (body, x-cal-signature-256) kan derfor replayes ubegrænset og spamme
//   kunden (+ bcc kontakt@aevia.dk) med "betal nu"-mails.
//
// Testen er BEVIDST fri for Redis/netværk/ægte secret. Den modellerer den faktiske
// kodesti i to varianter — VULNERABLE (= dagens kode) og FIXED (= patch-forslaget i
// ../patches/07-WEBHOOK-02.md) — med injicerbare afhængigheder:
//   * en mail-spion (tæller afsendelser i stedet for at POST'e til Resend)
//   * en in-memory NX-lås, der efterligner Upstash `SET key 1 NX EX ...`
//
// Kontrakten der pinnes:
//   - Signaturtjekket er en ren HMAC-SHA256 over body (ingen timestamp) → en fanget
//     (body, sig) re-verificerer identisk. Det DEMONSTRERER replay-præmissen.
//   - VULNERABLE: N replays  → N mails  (hullet — testen dokumenterer det).
//   - FIXED:      N replays  → 1 mail   (regressionen vi vil holde fast i).
//
// Når patchen er anvendt på live-koden, kan denne fil pege direkte på den rigtige
// handler (se kommentaren nederst) for at teste det ægte modul ende-til-ende.

import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

// ── Testdata: et realistisk BOOKING_CREATED-event som Cal.com leverer det ──────
const SECRET = "test-cal-webhook-secret";

function makeBody(overrides = {}) {
  // startTime sættes som standard til "i morgen" så friskheds-tjekket (FIXED)
  // ikke afviser eventet af legitime grunde i de fleste tests.
  const startTime = overrides.startTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return JSON.stringify({
    triggerEvent: "BOOKING_CREATED",
    payload: {
      uid: overrides.uid || "cal_uid_abc123",
      bookingId: 99001,
      title: "Aevia — Blodprøve",
      startTime,
      createdAt: startTime,
      attendees: [{ email: "kunde@example.com", name: "Test Kunde", language: { locale: "da" } }],
      ...(overrides.payload || {}),
    },
  });
}

// Cal.com-signaturen: HMAC-SHA256 hex over RÅ body med CAL_WEBHOOK_SECRET.
// (Identisk med api/cal-webhook.js:89 — ingen timestamp indgår.)
function signCal(rawBody, secret = SECRET) {
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

// Spejler verifikationen i api/cal-webhook.js:88-93.
function verifyCalSignature(rawBody, sigHeader, secret = SECRET) {
  const expected = signCal(rawBody, secret);
  const sig = String(sigHeader || "");
  return (
    sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  );
}

// ── In-memory NX-lås: efterligner Upstash `SET key 1 NX EX` (claimWebhookEvent) ─
function makeNxStore() {
  const keys = new Set();
  return {
    // true = nøglen var fri (vi "satte" den nu) → behandl som nyt event.
    // false = nøglen fandtes allerede → replay/gen-levering → spring mail over.
    claim(key) {
      if (!key) return true;
      if (keys.has(key)) return false;
      keys.add(key);
      return true;
    },
  };
}

// ── Mail-spion ────────────────────────────────────────────────────────────────
function makeMailer() {
  const sent = [];
  return {
    send(msg) { sent.push(msg); },
    get count() { return sent.length; },
    sent,
  };
}

// ── Handler-model, VULNERABLE = nuværende api/cal-webhook.js (uden patch) ───────
// Returnerer { status } og har bivirkningen "send mail" via mailer.
async function handleVulnerable({ rawBody, sigHeader }, { mailer }) {
  if (!verifyCalSignature(rawBody, sigHeader)) return { status: 403 };
  let event;
  try { event = JSON.parse(rawBody); } catch { return { status: 400 }; }
  const p = event.payload || {};
  const to = p.attendees?.[0]?.email;
  if (event.triggerEvent === "BOOKING_CREATED" && to) {
    // INGEN friskheds- eller idempotens-kontrol → mail sendes hver gang.
    mailer.send({ to, bcc: "kontakt@aevia.dk", subject: "Din tid hos Aevia er bekræftet" });
  }
  return { status: 200 };
}

// ── Handler-model, FIXED = med patch-forslaget i 07-WEBHOOK-02.md ──────────────
function eventKey(event, p) {
  const id = p.uid || p.bookingId || p.id || "";
  return id ? `${event.triggerEvent}:${id}` : "";
}
function isFresh(p, maxDays = 2) {
  const t = Date.parse(p.startTime || p.createdAt || "");
  if (Number.isNaN(t)) return true;
  return Date.now() - t <= maxDays * 24 * 60 * 60 * 1000;
}
async function handleFixed({ rawBody, sigHeader }, { mailer, nx }) {
  if (!verifyCalSignature(rawBody, sigHeader)) return { status: 403 };
  let event;
  try { event = JSON.parse(rawBody); } catch { return { status: 400 }; }
  const p = event.payload || {};
  const to = p.attendees?.[0]?.email;

  // (1) Friskhed: en gammel fanget body kan ikke genbruges i det uendelige.
  if (!isFresh(p)) return { status: 200, stale: true };
  // (2) Idempotens: NX-lås pr. event-id → kun første levering maler.
  const evKey = eventKey(event, p);
  if (evKey && !nx.claim(`calwh:${evKey}`)) return { status: 200, duplicate: true };

  if (event.triggerEvent === "BOOKING_CREATED" && to) {
    mailer.send({ to, bcc: "kontakt@aevia.dk", subject: "Din tid hos Aevia er bekræftet", idempotencyKey: evKey });
  }
  return { status: 200 };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

test("præmis: HMAC er kun over body — en fanget (body, sig) re-verificerer identisk", () => {
  const body = makeBody();
  const sig = signCal(body); // det angriberen "fanger"
  // Genafspilning byte-for-byte: samme body + samme header validerer igen, uendeligt.
  assert.equal(verifyCalSignature(body, sig), true);
  assert.equal(verifyCalSignature(body, sig), true);
  // Forkert secret/forfalsket signatur afvises (kontroltjek).
  assert.equal(verifyCalSignature(body, signCal(body, "wrong-secret")), false);
});

test("VULNERABLE (dagens kode): 5 replays af samme signerede body → 5 mails (hullet)", async () => {
  const body = makeBody();
  const sig = signCal(body);
  const mailer = makeMailer();
  const N = 5;
  for (let i = 0; i < N; i++) {
    const r = await handleVulnerable({ rawBody: body, sigHeader: sig }, { mailer });
    assert.equal(r.status, 200);
  }
  // Dette er sårbarheden, ikke ønsket adfærd: testen dokumenterer den.
  assert.equal(mailer.count, N, "uden fix sendes der én mail pr. replay");
});

test("FIXED (patch): 5 replays af samme signerede body → præcis 1 mail", async () => {
  const body = makeBody();
  const sig = signCal(body);
  const mailer = makeMailer();
  const nx = makeNxStore();
  const N = 5;
  for (let i = 0; i < N; i++) {
    const r = await handleFixed({ rawBody: body, sigHeader: sig }, { mailer, nx });
    assert.equal(r.status, 200);
  }
  assert.equal(mailer.count, 1, "med fix de-dupes replays til én mail");
  // Idempotency-Key videregives til mail-laget (defense-in-depth mod race-replays).
  assert.ok(mailer.sent[0].idempotencyKey, "Idempotency-Key skal være sat på mailen");
  assert.equal(mailer.sent[0].idempotencyKey, "BOOKING_CREATED:cal_uid_abc123");
});

test("FIXED: forskellige legitime bookinger (forskellige uid) maler stadig hver", async () => {
  const mailer = makeMailer();
  const nx = makeNxStore();
  for (const uid of ["uid_1", "uid_2", "uid_3"]) {
    const body = makeBody({ uid });
    await handleFixed({ rawBody: body, sigHeader: signCal(body) }, { mailer, nx });
  }
  assert.equal(mailer.count, 3, "idempotensen må ikke sluge legitime, distinkte events");
});

test("FIXED: gammel fanget body afvises af friskheds-tjekket (intet mail)", async () => {
  // startTime 10 dage tilbage → uden for tolerancen (analogt til Stripes timestamp).
  const old = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
  const body = makeBody({ startTime: old, payload: { createdAt: old } });
  const mailer = makeMailer();
  const nx = makeNxStore();
  const r = await handleFixed({ rawBody: body, sigHeader: signCal(body) }, { mailer, nx });
  assert.equal(r.status, 200);
  assert.equal(r.stale, true);
  assert.equal(mailer.count, 0, "en gammel (ud-af-vindue) fanget body må ikke maile");
});

test("begge varianter afviser forfalsket signatur med 403 (ingen mail)", async () => {
  const body = makeBody();
  const badSig = signCal(body, "wrong-secret");
  const mailerV = makeMailer();
  const mailerF = makeMailer();
  const nx = makeNxStore();
  const rv = await handleVulnerable({ rawBody: body, sigHeader: badSig }, { mailer: mailerV });
  const rf = await handleFixed({ rawBody: body, sigHeader: badSig }, { mailer: mailerF, nx });
  assert.equal(rv.status, 403);
  assert.equal(rf.status, 403);
  assert.equal(mailerV.count, 0);
  assert.equal(mailerF.count, 0);
});

// ── Note til vedligehold ────────────────────────────────────────────────────────
// Når patch-forslaget i ../patches/07-WEBHOOK-02.md er anvendt på live-koden, kan
// `handleFixed`-modellen erstattes af et ægte ende-til-ende-kald mod den rigtige
// handler ved at:
//   1) sætte process.env.CAL_WEBHOOK_SECRET = SECRET (+ RESEND_API_KEY="test"),
//   2) importere default-handleren fra ../../../api/cal-webhook.js,
//   3) mocke global fetch (Resend + Upstash) og bygge req/res-stubs (req som async
//      iterator over body-bufferen; res med .status().json()).
// Modellen ovenfor pinner kontrakten (N replays → 1 mail) uden den opsætning, så
// regressionen fanges også i CI uden eksterne afhængigheder.
