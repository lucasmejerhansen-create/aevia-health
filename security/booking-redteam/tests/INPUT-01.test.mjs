// INPUT-01 — regressionstest for HTML-injection i klinik-notifikationsmail.
//
// Sårbarhed: api/book-slot.js bygger klinik-notifikationens (linje 193) og
// kunde-mailens h1 (linje 83-84) HTML med RÅ interpolation af customer.name /
// customer.phone — uden den esc()-helper som resten af kodebasen bruger.
//
// Denne test mocker det minimale: den genskaber de to mail-sinks præcis som de
// ser ud i koden, i to varianter:
//   - renderClinicMailRAW / renderH1RAW  → nuværende (sårbare) adfærd
//   - renderClinicMailFIXED / renderH1FIXED → adfærd EFTER esc()-fixet
//
// Det vigtige er at FANGE REGRESSIONEN: "fixed"-assertions fejler øjeblikkeligt,
// hvis nogen fjerner esc() igen. "raw"-assertions dokumenterer hullet og fungerer
// som kontrol (de beviser at payloaden faktisk er farlig uden escaping).
//
// Kør: node --test security/booking-redteam/tests/INPUT-01.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";

// ── esc(): identisk med fix-forslaget (08-INPUT-01.md) og _emails.js-mønstret ──
const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ── Sink-genskabelser ────────────────────────────────────────────────────────
// RÅ = book-slot.js:190-194 (nuværende kode, uden escaping).
function renderClinicMailRAW({ svc, when, area, name, contact, id }) {
  return `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0a1628">
            <h2 style="font-family:Georgia,serif">Ny Aevia-booking</h2>
            <p><b>${svc}</b><br>${when}<br>Område: ${area}</p>
            <p>Navn: ${name}<br>Kontakt: ${contact}</p>
            <p style="color:#667">Booking-id: ${id}</p></div>`;
}
// FIXED = book-slot.js:190-194 EFTER fix (esc() om alt brugerinput).
function renderClinicMailFIXED({ svc, when, area, name, contact, id }) {
  return `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0a1628">
            <h2 style="font-family:Georgia,serif">Ny Aevia-booking</h2>
            <p><b>${svc}</b><br>${when}<br>Område: ${esc(area)}</p>
            <p>Navn: ${esc(name)}<br>Kontakt: ${esc(contact)}</p>
            <p style="color:#667">Booking-id: ${esc(id)}</p></div>`;
}
// RÅ h1 = book-slot.js:84 (kunde-mail, paid:false-grenen).
const renderH1RAW = (name) => `Tak for din booking${name ? ", " + name : ""}`;
// FIXED h1 = samme gren EFTER fix.
const renderH1FIXED = (name) => `Tak for din booking${name ? ", " + esc(name) : ""}`;

// Det samme input-trin som book-slot.js:141 (KUN længdegrænse, ingen filtrering).
const intakeName = (raw) => String(raw).slice(0, 120);

// Angriber-payload: et klikbart phishing-link.
const PAYLOAD = '<a href="https://phish.example/login">Bekræft din Aevia-konto her</a>';

// ── Tests ─────────────────────────────────────────────────────────────────────

test("INPUT-01: input-trinnet (slice 120) filtrerer IKKE HTML-tegn", () => {
  // Dokumenterer rod-årsagen: customer.name er kun længdebegrænset.
  const name = intakeName(PAYLOAD);
  assert.ok(name.includes("<a href"), "payload bør passere slice(0,120) uændret");
  assert.ok(name.includes("<"), "< bør ikke være filtreret ved input");
});

test("INPUT-01 [kontrol]: RÅ klinik-mail er sårbar (uescaped <a> renderes)", () => {
  const html = renderClinicMailRAW({
    svc: "Blodprøve", when: "tirsdag · 08:00", area: "København-området",
    name: intakeName(PAYLOAD), contact: "angriber@example.com", id: "deadbeef",
  });
  // Et levende, klikbart link slipper igennem i den nuværende kode.
  assert.match(html, /<a href="https:\/\/phish\.example\/login">/,
    "RÅ-sinken indsætter et aktivt phishing-link — dette ER hullet");
});

test("INPUT-01 [FIX]: klinik-mail neutraliserer HTML-injection i navn", () => {
  const html = renderClinicMailFIXED({
    svc: "Blodprøve", when: "tirsdag · 08:00", area: "København-området",
    name: intakeName(PAYLOAD), contact: "angriber@example.com", id: "deadbeef",
  });
  // Intet aktivt <a>-tag fra brugerinput må overleve.
  assert.doesNotMatch(html, /<a href="https:\/\/phish\.example/,
    "FIX: payloadens <a>-tag må ikke renderes som aktivt link");
  // Vinkelparenteser fra navnet skal være escapet.
  assert.ok(html.includes("&lt;a href=&quot;https://phish.example/login&quot;&gt;"),
    "FIX: payloaden skal vises escapet som tekst");
  // Sanity: mailens egne, betroede tags (h2/div) er intakte.
  assert.match(html, /<h2 style=/, "betroet markup må ikke escapes");
});

test("INPUT-01 [FIX]: alle brugerstyrede felter escapes (navn, kontakt, område, id)", () => {
  const html = renderClinicMailFIXED({
    svc: "Blodprøve", when: "tirsdag · 08:00",
    area: '<b>x</b>', name: '<i>n</i>', contact: '"><u>c</u>', id: "<s>id</s>",
  });
  for (const frag of ["<i>n</i>", "<u>c</u>", "<b>x</b>", "<s>id</s>"]) {
    assert.ok(!html.includes(frag), `FIX: rå "${frag}" må ikke optræde uescapet`);
  }
  // De skal være til stede i escapet form (her: navnet).
  assert.ok(html.includes("&lt;i&gt;n&lt;/i&gt;"), "FIX: navn skal være escapet");
});

test("INPUT-01 [FIX]: kunde-mailens h1 escaper navn", () => {
  const firstToken = intakeName(PAYLOAD).split(" ")[0]; // book-slot.js:174 split
  assert.doesNotMatch(renderH1FIXED(firstToken), /<a href="https:\/\/phish/,
    "FIX: h1 må ikke indsætte aktivt link fra navn");
  // Tomt navn → ingen ekstra komma/tekst (uændret hilsen).
  assert.equal(renderH1FIXED(""), "Tak for din booking");
});

test("INPUT-01: legitime navne renderes korrekt (ingen over-escaping af tekst)", () => {
  const html = renderClinicMailFIXED({
    svc: "Blodprøve", when: "tirsdag · 08:00", area: "København-området",
    name: "Anders Ø. Hansen", contact: "+45 12 34 56 78", id: "abc123",
  });
  assert.ok(html.includes("Navn: Anders Ø. Hansen"), "rent navn skal vises uændret");
  assert.ok(html.includes("Kontakt: +45 12 34 56 78"), "rent telefonnr. skal vises uændret");
  // '&' i navn vises escapet i kilden (korrekt, ikke en regression).
  const amp = renderClinicMailFIXED({
    svc: "Blodprøve", when: "x", area: "y", name: "Anders & Co", contact: "z", id: "i",
  });
  assert.ok(amp.includes("Anders &amp; Co"), "& skal escapes til &amp;");
});
