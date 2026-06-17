// PAY-01 — regressionstest for Stripe-webhook beløbs-/pakke-validering.
//
//   node --test security/booking-redteam/tests/PAY-01.test.mjs
//
// Live-koden i api/ er IKKE rørt. Denne test modellerer den sikkerheds-relevante
// del af betalingsflowet (priskatalog + webhook → store → book-slot) i to
// varianter: VULNERABLE (nuværende adfærd) og FIXED (forslag i 01-PAY-01.md).
//
// Formålet er at FANGE REGRESSIONEN: testene mod FIXED skal forblive grønne.
// "vulnerable_*"-testene dokumenterer hullet og fejler bevidst, hvis nogen
// genindfører den prisagnostiske adfærd i fix-laget.

import { test } from "node:test";
import assert from "node:assert/strict";

// ── Autoritativt priskatalog (spejler api/checkout.js / forslagets _pricing.js)
// Beløb i øre, inkl. moms. Kun det der er nødvendigt for testen.
const PACKAGES = {
  core: { amount: 1099500 },
  executive: { amount: 1849500 },
  elite: { amount: 3699500 }, // Aevia Elite — 36.995 kr
};
const GIFTCARDS = {
  "1000": { amount: 100000 }, // 1.000 kr
};
const ADDONS = {
  mri: { amount: 1189500 },
};
const PKG_ALIAS = { core: "core", executive: "executive", plus: "executive", elite: "elite" };

function expectedAmount({ pakke, gavekort, tilvalg }) {
  if (pakke === "gavekort") {
    const g = GIFTCARDS[String(gavekort || "").toLowerCase()];
    return g ? g.amount : null;
  }
  const base = PACKAGES[String(pakke || "").toLowerCase()];
  if (!base) return null;
  const addons = String(tilvalg || "").split(",").map((k) => k.trim().toLowerCase())
    .filter((k) => ADDONS[k]).reduce((sum, k) => sum + ADDONS[k].amount, 0);
  return base.amount + addons;
}
function packageAmount(slug) {
  const p = PACKAGES[PKG_ALIAS[String(slug || "").toLowerCase()]];
  return p ? p.amount : null;
}

// ── Minimal in-memory store (spejler api/_booking-store.js) ──────────────────
function makeStore() {
  const bk = new Map();   // id -> booking
  const paid = new Map(); // email -> { amount, pkg }
  return {
    seedBooking(id, booking) { bk.set(id, { ...booking, paid: false }); },
    getBooking(id) { return bk.get(id) || null; },
    isPaid(email) { return paid.get(String(email).toLowerCase()) || null; },

    // VULNERABLE: ingen pris-/pakke-tjek (nuværende live-adfærd).
    markPaid_vuln(email, info) { paid.set(String(email).toLowerCase(), { ...(info || {}) }); },
    setBookingPaid_vuln(id) {
      const b = bk.get(id); if (!b) return { ok: false };
      b.paid = true; return { ok: true, booking: b };
    },

    // FIXED: gem betalt beløb; markér booking betalt KUN hvis beløbet dækker
    // bookingens pakkepris (forslag pkt. 2 i 01-PAY-01.md).
    markPaid_fixed(email, info) { paid.set(String(email).toLowerCase(), { ...(info || {}) }); },
    setBookingPaid_fixed(id, paidAmount) {
      const b = bk.get(id); if (!b) return { ok: false };
      if (b.paid) return { ok: true, booking: b };
      if (typeof paidAmount === "number") {
        const need = packageAmount(b.customer && b.customer.pkg);
        if (need != null && paidAmount < need) {
          return { ok: false, reason: "amount_below_package_price", need, paidAmount };
        }
      }
      b.paid = true; b.paidAmount = paidAmount;
      return { ok: true, booking: b };
    },
  };
}

// ── Webhook-kerne (spejler stripe-webhook.js:150-160). `session` antages
// allerede signatur-verificeret af Stripe (det er præcis pointen: signaturen
// beviser ikke beløbet). ─────────────────────────────────────────────────────
function webhookVuln(store, session) {
  const to = session.customer_details?.email;
  store.markPaid_vuln(to, { pkg: session.metadata?.pakke || "", sid: session.id });
  if (session.metadata?.booking_id) store.setBookingPaid_vuln(session.metadata.booking_id);
  return { received: true };
}
function webhookFixed(store, session) {
  const to = session.customer_details?.email;
  const want = expectedAmount({
    pakke: session.metadata?.pakke,
    gavekort: session.metadata?.gavekort,
    tilvalg: session.metadata?.tilvalg,
  });
  const paidOk =
    session.payment_status === "paid" &&
    String(session.currency || "").toLowerCase() === "dkk" &&
    want != null &&
    Number(session.amount_total) >= want;
  if (!paidOk) return { received: true, ignored: "amount_mismatch" };

  store.markPaid_fixed(to, { pkg: session.metadata?.pakke || "", amount: Number(session.amount_total), sid: session.id });
  if (session.metadata?.booking_id) {
    store.setBookingPaid_fixed(session.metadata.booking_id, Number(session.amount_total));
  }
  return { received: true };
}

// ── book-slot pre-pay-sti (spejler book-slot.js:152-158) ─────────────────────
function bookSlotIsAlreadyPaid_vuln(store, email) {
  return !!store.isPaid(email); // vilkårlig truthy markør = "fuldt betalt"
}
function bookSlotIsAlreadyPaid_fixed(store, email, pkgSlug) {
  const rec = store.isPaid(email);
  const need = packageAmount(pkgSlug);
  return !!rec && (need == null || Number(rec.amount) >= need);
}

// ── Helpers til at bygge en ægte, signeret event (signatur antages OK) ───────
function giftSession({ bookingId } = {}) {
  return {
    id: "cs_gift_1000",
    payment_status: "paid",
    currency: "dkk",
    amount_total: GIFTCARDS["1000"].amount, // 1.000 kr reelt betalt
    customer_details: { email: "attacker@example.com" },
    metadata: { pakke: "gavekort", gavekort: "1000", ...(bookingId ? { booking_id: bookingId } : {}) },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT A — booking_id-kapring: 1.000-kr gavekort markerer Elite-booking betalt
// ─────────────────────────────────────────────────────────────────────────────

test("vulnerable_variantA: 1.000-kr gavekort markerer 36.995-kr Elite-booking som betalt", () => {
  const store = makeStore();
  store.seedBooking("bk_elite", { customer: { email: "attacker@example.com", pkg: "elite" } });

  webhookVuln(store, giftSession({ bookingId: "bk_elite" }));

  // Hullet: Elite-bookingen står som betalt selvom kun 1.000 kr blev betalt.
  assert.equal(store.getBooking("bk_elite").paid, true,
    "VULNERABLE-laget skal demonstrere hullet (paid=true). Hvis dette fejler, er live-koden allerede fixet — opdatér testen.");
});

test("fixed_variantA: 1.000-kr gavekort markerer IKKE Elite-booking som betalt", () => {
  const store = makeStore();
  store.seedBooking("bk_elite", { customer: { email: "attacker@example.com", pkg: "elite" } });

  // Bemærk: gavekort-sessionen ER en gyldig 1.000-kr betaling (expectedAmount
  // for et 1.000-kr gavekort = 1.000 kr), så webhookens session-niveau-tjek
  // passerer. Forsvaret mod kapring sker i setBookingPaid: det betalte beløb
  // (100000) skal dække BOOKINGENS pakkepris (Elite = 3699500), hvilket det ikke
  // gør → bookingen forbliver ubetalt.
  webhookFixed(store, giftSession({ bookingId: "bk_elite" }));

  assert.equal(store.getBooking("bk_elite").paid, false,
    "REGRESSION: en 1.000-kr gavekort-betaling må ALDRIG markere en 36.995-kr Elite-booking som betalt.");
});

test("fixed_variantA_positive: korrekt Elite-betaling markerer bookingen betalt", () => {
  const store = makeStore();
  store.seedBooking("bk_elite", { customer: { email: "kunde@example.com", pkg: "elite" } });

  const session = {
    id: "cs_elite_ok", payment_status: "paid", currency: "dkk",
    amount_total: PACKAGES.elite.amount, // fuld Elite-pris
    customer_details: { email: "kunde@example.com" },
    metadata: { pakke: "elite", booking_id: "bk_elite" },
  };
  webhookFixed(store, session);

  assert.equal(store.getBooking("bk_elite").paid, true,
    "REGRESSION: en korrekt fuld betaling SKAL stadig markere bookingen betalt.");
});

test("fixed_variantA_tax: amount_total over katalogpris (Stripe Tax) accepteres", () => {
  const store = makeStore();
  store.seedBooking("bk_core", { customer: { email: "kunde@example.com", pkg: "core" } });

  const session = {
    id: "cs_core_tax", payment_status: "paid", currency: "dkk",
    amount_total: Math.round(PACKAGES.core.amount * 1.25), // +25% moms oven i
    customer_details: { email: "kunde@example.com" },
    metadata: { pakke: "core", booking_id: "bk_core" },
  };
  webhookFixed(store, session);

  assert.equal(store.getBooking("bk_core").paid, true,
    "REGRESSION: >=-tjek skal acceptere et beløb der er højere pga. moms.");
});

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT B — e-mail pre-pay: 1.000-kr markør → book-slot ser dyr booking betalt
// ─────────────────────────────────────────────────────────────────────────────

test("vulnerable_variantB: 1.000-kr pre-pay-markør gør en Elite-booking 'betalt' i book-slot", () => {
  const store = makeStore();
  webhookVuln(store, giftSession()); // sætter prisagnostisk paid:<email>

  const paid = bookSlotIsAlreadyPaid_vuln(store, "attacker@example.com");
  assert.equal(paid, true,
    "VULNERABLE-laget skal demonstrere hullet (book-slot ser 'betalt'). Hvis dette fejler, er live-koden allerede fixet.");
});

test("fixed_variantB: 1.000-kr pre-pay-markør gør IKKE en Elite-booking 'betalt'", () => {
  const store = makeStore();
  webhookFixed(store, giftSession()); // gemmer amount=100000 på markøren

  const paid = bookSlotIsAlreadyPaid_fixed(store, "attacker@example.com", "elite");
  assert.equal(paid, false,
    "REGRESSION: en 1.000-kr pre-pay-markør må ikke dække en 36.995-kr Elite-booking.");
});

test("fixed_variantB_positive: en markør der dækker pakken gør bookingen 'betalt'", () => {
  const store = makeStore();
  const session = {
    id: "cs_core_prepay", payment_status: "paid", currency: "dkk",
    amount_total: PACKAGES.core.amount,
    customer_details: { email: "kunde@example.com" },
    metadata: { pakke: "core" }, // ingen booking_id endnu — pre-pay før booking
  };
  webhookFixed(store, session);

  const paid = bookSlotIsAlreadyPaid_fixed(store, "kunde@example.com", "core");
  assert.equal(paid, true,
    "REGRESSION: en korrekt før-betaling skal stadig spare kunden for at betale igen.");
});

// ─────────────────────────────────────────────────────────────────────────────
// Hærdning: forkert valuta / status afvises uanset beløb
// ─────────────────────────────────────────────────────────────────────────────

test("fixed_guard: forkert valuta afvises selv ved tilstrækkeligt beløb", () => {
  const store = makeStore();
  store.seedBooking("bk_core", { customer: { email: "x@example.com", pkg: "core" } });
  const r = webhookFixed(store, {
    id: "cs_eur", payment_status: "paid", currency: "eur",
    amount_total: PACKAGES.core.amount, // tal-mæssigt nok, men forkert valuta
    customer_details: { email: "x@example.com" },
    metadata: { pakke: "core", booking_id: "bk_core" },
  });
  assert.equal(r.ignored, "amount_mismatch");
  assert.equal(store.getBooking("bk_core").paid, false);
});

test("fixed_guard: payment_status != paid afvises", () => {
  const store = makeStore();
  store.seedBooking("bk_core", { customer: { email: "x@example.com", pkg: "core" } });
  const r = webhookFixed(store, {
    id: "cs_unpaid", payment_status: "unpaid", currency: "dkk",
    amount_total: PACKAGES.core.amount,
    customer_details: { email: "x@example.com" },
    metadata: { pakke: "core", booking_id: "bk_core" },
  });
  assert.equal(r.ignored, "amount_mismatch");
  assert.equal(store.getBooking("bk_core").paid, false);
});
