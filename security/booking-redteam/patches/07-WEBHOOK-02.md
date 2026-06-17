# WEBHOOK-02 — Cal.com-webhook mangler idempotens / replay-beskyttelse

**Alvor:** Middel
**Status:** Bekræftet (statisk + logisk verificeret mod den faktiske kode)
**Fil:** `api/cal-webhook.js`
**Sekundær fil (defense-in-depth):** `api/_emails.js`

> Dette er et **patch-FORSLAG**. Live-koden i `api/` er IKKE redigeret.
> Anvend diff'en nedenfor manuelt efter klinisk/teknisk review.

---

## 1. Sårbarhed

`api/cal-webhook.js` verificerer Cal.com-webhooken med en ren HMAC-SHA256 over
**kun** den rå body med `CAL_WEBHOOK_SECRET` (`api/cal-webhook.js:89`). Headeren
`x-cal-signature-256` (`:88`) indeholder hverken timestamp eller nonce, og det er
bekræftet mod Cal.coms officielle webhook-dokumentation, at HMAC'en udelukkende
beregnes over payloaden (ingen timestamp i det signerede materiale).

Konsekvens — to manglende forsvar på samme kodesti:

1. **Ingen friskheds-/toleransekontrol.** Efter `timingSafeEqual` (`:90-92`) går
   koden direkte videre. En engang-fanget `(body, signatur)` er gyldig i
   **ubegrænset tid**. Dette adskiller sig fra `api/stripe-webhook.js:140`, hvor
   `stripe.webhooks.constructEvent` håndhæver Stripes `t=<timestamp>` med en
   standard 5-minutters tolerance.

2. **Ingen idempotens.** For `BOOKING_CREATED` (`:111-119`) slås der aldrig en
   event-id / `uid` op, og filen importerer slet ikke `_booking-store.js`, hvor de
   eksisterende NX-låse (`cxl:`, `paid:`, `pend:`) ligger. `sendMail`
   (`api/_emails.js:153-170`) POST'er ubetinget til Resend uden `Idempotency-Key`.

Verificeret: ingen `middleware.js`, ingen WAF, og `_ratelimit.js` importeres ikke
her (og ville alligevel kun tælle MISLYKKEDE auth-forsøg — ikke korrekt-signerede
replays). Ingen af de tre normale forsvar (Stripe-timestamp / atomisk slot-claim /
allowlist) er i spil.

### Fil:linje

| Hvad | Sted |
|---|---|
| Læser kun `x-cal-signature-256` (intet timestamp) | `api/cal-webhook.js:88` |
| HMAC kun over rå body | `api/cal-webhook.js:89` |
| `timingSafeEqual` → derefter direkte til mail | `api/cal-webhook.js:90-93` |
| `BOOKING_CREATED` → mail uden idempotens/friskheds-tjek | `api/cal-webhook.js:110-119` |
| `sendMail` uden `Idempotency-Key` | `api/_emails.js:153-170` |

---

## 2. Repro

1. Angriber fanger ÉN legitim Cal.com-levering til
   `https://aevia.dk/api/cal-webhook`: den rå JSON-body for et
   `BOOKING_CREATED`-event + dens header `x-cal-signature-256` (fx via
   mellemliggende proxy, logning eller en kompromitteret integration). Kræver
   **ikke** kendskab til `CAL_WEBHOOK_SECRET`, kun indsigt i trafikken/loggen.
2. Angriber gensender exakt samme POST byte-for-byte:
   ```bash
   curl -X POST https://aevia.dk/api/cal-webhook \
     -H 'x-cal-signature-256: <fanget hex>' \
     --data-binary @captured-body.json
   ```
3. `:89-93`: `expected` genberegnes identisk, `sig.length === expected.length`,
   `timingSafeEqual` → `true` → valid (intet timestamp at afvise på).
4. `event.triggerEvent === "BOOKING_CREATED"` og `attendee[0].email` findes →
   `:111-119` sender bekræftelse + Stripe-betalingslink til kunden + bcc
   `kontakt@aevia.dk`.
5. Kør i loop → N identiske mails til den samme (fangede) kunde + N kopier til
   `kontakt@aevia.dk`.

> Bemærk: `to` er fastlåst til den oprindelige signerede body — angriberen kan kun
> re-spamme præcis den ene kunde hvis levering blev fanget, ikke vilkårlige ofre.

---

## 3. Impact

Bekræftet, men afgrænset. En fanget gyldig `(body+signatur)` kan replayes
ubegrænset (ingen timestamp/tolerance som hos Stripe). Det spammer den reelle
kunde med gentagne "tid bekræftet + betal nu"-mails med et fungerende
checkout-link (risiko for forvirring / dobbeltbetaling / tabt tillid) og fylder
`kontakt@aevia.dk`-indbakken. Sekundært: Resend-omkostning + risiko for
deliverability-flagging af afsenderdomænet.

**Ingen** integritets-, betalings- eller dataskade (webhooken rører ikke
Redis/booking-state), ingen account-takeover, og angriberen kan ikke retarget'e
nye ofre. Forudsætningen (interception/log-adgang) gør det ikke til en triviel
internet-fjernudnyttelse. Derfor **middel** — ikke lavere fordi replay-vinduet
reelt er uendeligt og mailen har en betalings-CTA; ikke højere pga.
capture-forudsætningen og det begrænsede blast-radius.

---

## 4. Fix

Tre lag, anvendt **efter** signaturtjekket (efter `api/cal-webhook.js:100`):

1. **Idempotens** — udled en stabil event-nøgle fra payload (primært
   `payload.uid`, fald tilbage til `payload.bookingId`/`payload.id`), kombineret
   med `triggerEvent`. Brug en Redis NX-lås i samme mønster som de eksisterende
   `cxl:`/`paid:`/`pend:`-nøgler: `SET calwh:<key> 1 NX EX 604800`. Er låsen
   allerede taget (`!== "OK"`) → returnér 200 uden at maile. Lås på event-id/uid
   (ikke body-hash), så legitime gen-leveringer fra Cal.com ved transient 5xx
   også de-dupes korrekt.
2. **Friskhed** — afvis bookinger hvor `payload.startTime`/`createdAt` ligger for
   langt tilbage i tid (her: > 2 dage), så en gammel fanget body ikke kan
   genbruges på ubestemt tid (analogt til Stripes timestamp-tolerance).
3. **Defense-in-depth i `_emails.js`** — tilføj en `Idempotency-Key`-header til
   Resend-POST'en (Resend understøtter den), afledt af event-nøglen, så selv ved
   samtidige/race-replays kun sendes én mail.

### Diff — `api/cal-webhook.js`

```diff
--- a/api/cal-webhook.js
+++ b/api/cal-webhook.js
@@ -15,7 +15,8 @@
 // Miljøvariabler: CAL_WEBHOOK_SECRET, RESEND_API_KEY, MAIL_FROM, SITE_URL (valgfri)

 import crypto from "crypto";
 import { sendMail } from "./_emails.js";
+import { claimWebhookEvent } from "./_booking-store.js";

 export const config = { api: { bodyParser: false } };

 const SITE = process.env.SITE_URL || "https://aevia.dk";
@@ -39,6 +40,21 @@ function fmtTime(iso, lang) {
   }
 }

+// Stabil, replay-resistent event-nøgle. Foretræk Cal.coms uid/bookingId frem for
+// en body-hash, så legitime gen-leveringer (transient 5xx) også de-dupes.
+function eventKey(event, p) {
+  const id = p.uid || p.bookingId || p.id || event.payload?.uid || "";
+  return id ? `${event.triggerEvent}:${id}` : "";
+}
+
+// Friskhed: afvis events hvis ankerdato ligger > maxDays tilbage (analogt til
+// Stripes timestamp-tolerance) — en gammel fanget body kan så ikke genbruges.
+function isFresh(p, maxDays = 2) {
+  const t = Date.parse(p.startTime || p.createdAt || "");
+  if (Number.isNaN(t)) return true; // ingen dato at validere på → bloker ikke
+  return Date.now() - t <= maxDays * 24 * 60 * 60 * 1000;
+}
+
 // Find pakke-nøglen (core/executive/elite) i bookingens noter/metadata,
 // sat af book.html som "Pakke: <nøgle>" i notes-feltet.
 function findPkg(payload) {
@@ -107,6 +123,18 @@ export default async function handler(req, res) {
   const title = p.title || p.eventTitle || "Aevia-aftale";
   const when = fmtTime(p.startTime, lang);

+  // ── Replay-beskyttelse (WEBHOOK-02) ────────────────────────────────────────
+  // (1) Friskhed: en gammel fanget body kan ikke genbruges i det uendelige.
+  if (!isFresh(p)) return res.status(200).json({ received: true, stale: true });
+  // (2) Idempotens: én NX-lås pr. event-id (calwh:<triggerEvent>:<uid>). Allerede
+  //     set → vi har behandlet denne levering før → returnér uden at maile igen.
+  const evKey = eventKey(event, p);
+  if (evKey) {
+    const fresh = await claimWebhookEvent(evKey).catch(() => true); // fail-open
+    if (!fresh) return res.status(200).json({ received: true, duplicate: true });
+  }
+  // evKey videregives til sendMail som Idempotency-Key (defense-in-depth).
+
   try {
     if (event.triggerEvent === "BOOKING_CREATED" && to) {
       const pkg = findPkg(p);
       const payUrl = pkg ? `${SITE}/api/checkout?pkg=${pkg}${lang === "en" ? "&lang=en" : ""}` : null;
       await sendMail({
         to,
         bcc: "kontakt@aevia.dk",
         subject: lang === "en" ? "Your appointment with Aevia is confirmed" : "Din tid hos Aevia er bekræftet",
         html: mailHtml({ lang, name, title, when, payUrl }),
+        idempotencyKey: evKey || undefined,
       });
     } else if (event.triggerEvent === "BOOKING_CANCELLED") {
       await sendMail({
         to: "kontakt@aevia.dk",
         subject: `Aflyst klinik-booking: ${title}`,
         html: `<p style="font-family:Arial,sans-serif">Booking aflyst i klinik-kalenderen:<br><strong>${title}</strong><br>${when}<br>Kunde: ${attendee.name || "?"} (${to || "?"})</p>`,
+        idempotencyKey: evKey || undefined,
       });
     }
   } catch (e) {
```

### Diff — `api/_booking-store.js` (ny eksport)

Tilføjes i blokken med de øvrige NX-lås-helpere (samme mønster som `cancel()`'s
`cxl:`-lås på linje 340):

```diff
--- a/api/_booking-store.js
+++ b/api/_booking-store.js
@@ -496,6 +496,18 @@ export async function waitlistPop(area) {
   return emails;
 }

+// ── Webhook-idempotens (replay-beskyttelse) ──────────────────────────────────
+// Enkelt-skud NX-lås pr. webhook-event (samme mønster som cxl:-låsen i cancel()).
+// Returnerer true første gang et event ses (→ fortsæt og send mail), false ved
+// efterfølgende replays/gen-leveringer (→ spring mailen over). Fail-open: hvis
+// Redis ikke er konfigureret, behandles eventet som nyt, så live-flowet aldrig
+// brydes — replay-beskyttelsen er aktiv så snart KV er sat op.
+export async function claimWebhookEvent(key, ttlSeconds = 60 * 60 * 24 * 7) {
+  if (!isConfigured() || !key) return true;
+  const lock = await redis(["SET", `calwh:${key}`, "1", "NX", "EX", ttlSeconds]);
+  return lock === "OK";
+}
+
 // ── Betalingsstatus (sættes af stripe-webhook) ───────────────────────────────
```

### Diff — `api/_emails.js` (Idempotency-Key til Resend)

```diff
--- a/api/_emails.js
+++ b/api/_emails.js
@@ -150,11 +150,16 @@ export const DRIP = { 0: day0, 2: day2, 5: day5 };

-export async function sendMail({ to, subject, html, bcc, attachments }) {
+export async function sendMail({ to, subject, html, bcc, attachments, idempotencyKey }) {
+  const headers = {
+    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
+    "Content-Type": "application/json",
+  };
+  // Resend de-duplickerer POST's med samme Idempotency-Key — sidste forsvar mod
+  // samtidige/race-replays selv hvis NX-låsen ovenfor skulle blive omgået.
+  if (idempotencyKey) headers["Idempotency-Key"] = String(idempotencyKey).slice(0, 256);
   const res = await fetch("https://api.resend.com/emails", {
     method: "POST",
-    headers: {
-      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
-      "Content-Type": "application/json",
-    },
+    headers,
     body: JSON.stringify({
       from: process.env.MAIL_FROM || "Aevia <kontakt@aevia.dk>",
       to: [to],
```

---

## 5. Regressions-risiko (delt kode)

- **`_emails.js#sendMail` røres af delt kode.** Importeres af `cal-webhook.js`,
  `lead.js`, `drip.js`, m.fl. Ændringen er additiv og bagudkompatibel:
  `idempotencyKey` er valgfri, og når den udelades sættes headeren ikke (uændret
  adfærd for alle eksisterende kald). Ingen signatur-bryd. Risiko: lav.
- **`_booking-store.js`** får kun en NY eksport (`claimWebhookEvent`) — ingen
  eksisterende funktion ændres. `calwh:`-nøgleprefikset kolliderer ikke med
  eksisterende prefikser (`cnt:`/`blk:`/`bk:`/`day:`/`cxl:`/`paid:`/`pend:`/
  `rules:`/`wait:`/`calcache:`). Risiko: lav.
- **Fail-open** er bevidst valgt: er KV (Upstash) ikke konfigureret, behandles
  events som nye, så det live-flow aldrig brydes. Bemærk konsekvensen:
  replay-beskyttelsen kræver, at KV er konfigureret for at være aktiv. Friskheds-
  tjekket (lag 1) virker uden KV og giver et endeligt (om end bredere) loft over
  replay-vinduet.
- **Falsk de-dup:** hvis to *forskellige* legitime bookinger nogensinde delte
  samme `uid` (bør ikke ske hos Cal.com), ville den anden blive droppet. Derfor
  inkluderes `triggerEvent` i nøglen, så `BOOKING_CREATED` og `BOOKING_CANCELLED`
  for samme `uid` aldrig kolliderer.
- **TTL = 7 dage** på `calwh:`: tilstrækkeligt til at dække Cal.coms retry-vindue;
  matcher fix-idéens `EX 604800`.
