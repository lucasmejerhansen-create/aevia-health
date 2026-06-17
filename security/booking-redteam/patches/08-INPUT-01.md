# 08 · INPUT-01 — HTML-injection i klinik-notifikationsmail (uescaped `customer.name`)

**Sværhedsgrad:** Lav (latent — gated bag `ready:true`)
**Kategori:** Stored/forwarded HTML-injection (CWE-79, output-encoding mangler)
**Status:** Bekræftet ved kodelæsning. IKKE end-to-end-reproducerbar i nuværende tilstand (alle områder `ready:false`).

---

## Sårbarhed

Klinik-notifikationsmailen i `book-slot.js` bygger HTML med rå template-interpolation af
brugerstyret `customer.name` (og `customer.phone`), uden den `esc()`-funktion som resten
af kodebasen bruger konsekvent på brugerinput. `customer.name` er kun længdebegrænset
(`String(name).slice(0,120)`), ikke tegnfiltreret — så `< > & " '` og hele HTML-tags/links
passerer uændret ind i mailens `html`-felt og renderes hos den interne modtager.

### Fil:linje (sinks og kæde)

| Fil | Linje | Rolle |
|-----|-------|-------|
| `api/book-slot.js` | **193** | Primær sink: `Navn: ${customer.name}<br>Kontakt: ${customer.phone || customer.email}` rå i klinik-mailens `html` |
| `api/book-slot.js` | **186–195** | Mail-loop pr. ydelse → `to` = klinik-email ELLER `kontakt@aevia.dk`, BCC `kontakt@aevia.dk` |
| `api/book-slot.js` | **83–84** | Sekundær sink: `h1` i kunde-mailen interpolerer `name` (første token) rå |
| `api/book-slot.js` | **174** | Kunde-mailen kaldes med `name: customer.name.split(" ")[0]` → kun første token når sink 83–84 |
| `api/book-slot.js` | **141** | `name: String(name).slice(0,120)` — KUN længdegrænse, ingen tegnfiltrering |
| `api/book-slot.js` | **137** | `if (!name)` — eneste indholdsvalidering af navn |
| `api/_emails.js` | **153–169** | `sendMail` sender `html`-strengen rå videre til Resend (ingen escaping) |
| `api/_booking-store.js` | **289** | Ready-gate: `if (!a || !a.ready) return {ok:false,...}` |
| `api/_booking-store.js` | **42–60** | Alle `AREAS`-entries har `ready:false` → 409 før mail-koden nås |
| `api/_booking-store.js` | **323** | `reserveMulti` gemmer `customer` råt; sanitizer aldrig `name` |

**Inkonsistens (rod-årsag):** `book-slot.js` importerer/definerer ingen `esc()` overhovedet,
mens `_emails.js:47`, `booking.js:36` og `booking-action.js:66` alle bruger en `esc()`-helper
på brugerinput. Sinken bryder kodebasens egen konvention.

**IKKE udnytteligt (afgrænsning):**
- `area` er whitelistet — `book-slot.js:129` (`!AREAS[area]`) mod faste områdenøgler.
- `r.id` er server-genereret (`crypto.randomBytes`, `_booking-store.js:322`).
- `customer.email` er regex-valideret (`EMAIL_RE`, `book-slot.js:136`) og lowercased.

---

## Repro

**Som koden er NU: ikke reproducerbar end-to-end.** `reserveMulti` (`_booking-store.js:289`)
kræver `a.ready`, og samtlige `AREAS`-entries er `ready:false` (linje 42–60). `book-slot`
returnerer derfor 409 på linje 150 og når aldrig mail-koden (linje 182+).

**Når en klinik gøres live** (`ready:true` — som `AREAS`-kommentarerne linje 41/55–56
eksplicit lægger op til):

```http
POST /api/book-slot
Content-Type: application/json

{
  "area": "København-området",
  "parts": [{ "svc": "blod", "date": "<gyldig fremtidig tirsdag/torsdag>", "time": "08:00" }],
  "email": "angriber@example.com",
  "name": "<a href=\"https://phish.example/login\">Bekræft din Aevia-konto her</a>"
}
```

`reserveMulti` lykkes → klinik-notifikationen (`book-slot.js:186–195`) sendes til
`conf.email` eller `kontakt@aevia.dk` med BCC til `kontakt@aevia.dk`, og navnet renderes
som **klikbart link/markup** i den interne modtagers mailklient.

Sekundær BCC-sti: kunde-bekræftelsen (`book-slot.js:172` `bcc:kontakt@aevia.dk`; `html`
linje 174 bruger `customer.name.split(" ")[0]` indsat råt i `h1` linje 83–84) — men **kun
første token** af navnet rammer denne sink.

---

## Impact

Stored/forwarded HTML-injection i **interne** notifikationsmails (klinik-modtager +
`kontakt@aevia.dk` via BCC). Ingen script-eksekvering (mailklienter sandboxer HTML kraftigt),
men en angriber kan indsætte **klikbare phishing-links og vildledende markup** i mails, der
ankommer fra det betroede Aevia-domæne — social engineering mod klinik-personale og Aevias
egen indbakke.

Blast-radius er begrænset: kun navne-feltet, kun interne modtagere, ingen kunde-til-kunde-
eksponering, og latent bag `ready:true`. **Lav sværhedsgrad bekræftet.**

---

## Fix (unified diff — klar til at anvende på `api/book-slot.js`)

Tilføj samme `esc()`-helper som resten af kodebasen (med apostrof for sikkerheds skyld) og
wrap alt brugerinput i HTML-sinks: klinik-mailen (linje 193) og `h1`-navnet (linje 83–84).
`area` og `r.id` er sikre, men escapes for konsistens og defense-in-depth.

```diff
--- a/api/book-slot.js
+++ b/api/book-slot.js
@@ -13,6 +13,11 @@ import { sendMail } from "./_emails.js";
 const SITE = process.env.SITE_URL || "https://aevia.dk";
 const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
 const PKG_MAP = { core: "core", executive: "executive", plus: "executive", elite: "elite" };

+// HTML-escape af brugerinput i mail-sinks — samme mønster som _emails.js:47 /
+// booking-action.js:66 (inkl. apostrof). Bruges på ALT brugerstyret felt i html.
+const esc = (s) =>
+  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
+    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
+
 function svcLabel(svc, lang) {
   const l = SVC_LABELS[svc];
   return l ? (lang === "en" ? l.en : l.da) : svc;
@@ -80,8 +85,8 @@ function partsTable(confs, parts, lang) {
 function customerMail({ lang, name, area, parts, payUrl, manageUrl, paid, confs }) {
   const da = lang !== "en";
   const h1 = paid
-    ? (da ? `Tusind tak${name ? ", " + name : ""} — alt er på plads` : `Thank you${name ? ", " + name : ""} — everything is in place`)
-    : (da ? `Tak for din booking${name ? ", " + name : ""}` : `Thank you for your booking${name ? ", " + name : ""}`);
+    ? (da ? `Tusind tak${name ? ", " + esc(name) : ""} — alt er på plads` : `Thank you${name ? ", " + esc(name) : ""} — everything is in place`)
+    : (da ? `Tak for din booking${name ? ", " + esc(name) : ""}` : `Thank you for your booking${name ? ", " + esc(name) : ""}`);
   const intro = paid
@@ -190,8 +195,8 @@ export default async function handler(req, res) {
           html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0a1628">
             <h2 style="font-family:Georgia,serif">Ny Aevia-booking</h2>
-            <p><b>${svcLabel(p.svc, "da")}</b><br>${fmtDate(p.date, p.time, "da")}<br>Område: ${area}</p>
-            <p>Navn: ${customer.name}<br>Kontakt: ${customer.phone || customer.email}</p>
-            <p style="color:#667">Booking-id: ${r.id}</p></div>`,
+            <p><b>${svcLabel(p.svc, "da")}</b><br>${fmtDate(p.date, p.time, "da")}<br>Område: ${esc(area)}</p>
+            <p>Navn: ${esc(customer.name)}<br>Kontakt: ${esc(customer.phone || customer.email)}</p>
+            <p style="color:#667">Booking-id: ${esc(r.id)}</p></div>`,
         });
```

### Defense-in-depth (anbefalet, separat lag)

Overvej desuden tegn-sanitering/escaping af `name` allerede ved input-validering
(`book-slot.js:137/141`), så hverken denne eller fremtidige sinks kan rammes — fx:

```diff
@@
   const customer = {
-    name: String(name).slice(0, 120),
+    name: String(name).replace(/[<>]/g, "").slice(0, 120),
     email: String(email).trim().toLowerCase(),
```

Bemærk: hvis `name` strippes/escapes ved input, bevares output-`esc()` stadig som det
primære forsvar (output-encoding er det korrekte sted at neutralisere HTML). Strip ved
input er kun et ekstra lag og må ikke erstatte `esc()`.

---

## Regressions-risiko

- **Berører IKKE delt kode.** Fixet ligger udelukkende i `api/book-slot.js`. `_booking-store.js`
  og `_emails.js` ændres ikke, så ingen risiko for at påvirke `booking.js`, `booking-action.js`,
  `lead.js`, `drip.js` eller andre forbrugere af `reserveMulti` / `sendMail`.
- **Kosmetisk ændring i mails:** legitime navne med `&` (fx "Anders & Co") vises nu korrekt
  som `&amp;` i HTML-kilden men renderes som `&` for modtageren — dette er korrekt adfærd, ikke
  en regression.
- **`esc()` er lokal** (`const` i modul-scope) og kolliderer ikke med navne andre steder.
- Hvis defense-in-depth-strip på linje 141 anvendes: `name` der KUN består af `<`/`>` ville blive
  tomt efter strip, men `if (!name)` på linje 137 kører FØR `customer` bygges (på den rå `name`),
  så valideringen er uændret; tom-efter-strip giver blot et tomt navnefelt i mailen, ikke en fejl.
