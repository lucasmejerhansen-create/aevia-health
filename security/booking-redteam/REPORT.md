# Red-team-rapport — Aevias booking-, betalings- og kalender-flade

**Dato:** 2026-06-17
**Omfang:** Den serverless API-flade i `api/` der håndterer booking, betaling, kalender-sync og de tilstødende cron-/admin-/klinik-endpoints.
**Status på live-kode:** Ingen live-kode er ændret. Alt under `security/booking-redteam/patches/` og `security/booking-redteam/tests/` er **forslag** til manuel gennemgang og anvendelse.

> ADVARSEL — penge og persondata på spil. Patches er FORSLAG, ikke anvendte ændringer. Booking- og betalingskoden flytter penge og behandler sundhedsnær PII. Hvert forslag skal gennemlæses, testes i et Stripe-/Upstash-testmiljø og anvendes manuelt af et menneske. Anvend ikke en patch blindt.

---

## 1. Resumé

### Hvad blev auditeret
Følgende 16 filer i `api/` blev gennemgået som ét sammenhængende booking-/betalings-/kalender-domæne:

`book-slot.js`, `slots.js`, `checkout.js`, `stripe-webhook.js`, `cal-webhook.js`, `_ratelimit.js`, `_booking-store.js`, `_calendar.js`, `_emails.js`, `booking-action.js`, `booking.js`, `admin-bookings.js`, `clinic-portal.js`, `approve-report.js`, `min-booking.js`, `booking-remind.js`.

Tilstødende endpoints, der deler kode eller angrebsoverflade (`drip.js`, `nps.js`, `lead.js`, `get-draft.js`, `list-drafts.js`, `save-draft.js`, `classify-report.js`, `formulate-report.js`), blev inddraget hvor de udvidede angrebsmatrixen.

### Metode
1. **Angrebsmatrix** — for hver fil/funktion blev der opstillet en trusselsmodel (hvem kan kalde det, med hvilken kontrol over input, hvilken tillid output nyder).
2. **Statisk exploit** — for hvert plausibelt scenarie blev der konstrueret et konkret angreb mod den faktiske kode (linjenummer-præcist).
3. **Uafhængigt modbevis af hvert fund** — hvert hypotetisk fund blev forsøgt modbevist: er der en eksisterende guard (HMAC, `ready:false`-gate, `slice`, `timingSafeEqual`, fail-closed-gren) der reelt afbøder det? Kun fund, der overlevede modbeviset, er medtaget som bekræftede.
4. **Patch-forslag + tests** — for hver bekræftet sårbarhed er der skrevet et patch-forslag (`patches/`) og en regressionstest (`tests/`).

### Hovedresultat
- **27 scenarier undersøgt → 14 bekræftede sårbarheder.**
- **Fordeling:** kritisk 0 · høj 2 · middel 6 · lav 6.
- **Det vigtigste enkeltfund:** Stripe-webhooken (`api/stripe-webhook.js`) verificerer **signatur men ikke beløb/valuta/pakke**. En angriber kan betale for et billigt produkt og få et dyrt forløb (op til Aevia Elite, 36.995 kr.) eller en vilkårlig booking markeret som fuldt betalt. Dette er et direkte betalings-integritets- og indtægtstab.
- **Næstvigtigst:** Rate-limit-nøglen stoler på den klient-kontrollerede `X-Forwarded-For`-header (`api/_ratelimit.js:33`), så brute-force-bremsen på alle tokens (admin, klinik, læge, reports) kan omgås fuldstændig.
- **Afgørende kontekst:** Alle booking-områder kører i dag med `ready:false` (`api/_booking-store.js:42-61`). Det gør flere middel/lav-fund (stored HTML-injektion i klinik-mails, PII-opbevaring) **latente** — reelle i koden, men ikke end-to-end-udløselige før et område åbnes. De to høj-fund (PAY-01, RATELIMIT-02) er **uafhængige af `ready`-gaten** og dermed live nu, så snart de respektive miljøvariabler (Stripe-webhook hhv. Upstash) er sat.

---

## 2. Findings (sorteret efter sværhedsgrad)

| Sværhedsgrad | Titel | Kode | Kategori | Impact |
|---|---|---|---|---|
| **høj** | Stripe-webhook validerer ikke beløb/valuta/pakke — billig betaling markerer dyr booking/kunde som fuldt betalt | PAY-01 | Betalings-integritet (CWE-345) | Direkte indtægtstab: en angriber kan få et forløb til op til 36.995 kr. (Aevia Elite) — eller enhver booking — markeret betalt ved at betale et minimalt beløb. `setBookingPaid`/`markPaid` gemmer hverken beløb eller pakke og tjekker dem aldrig. |
| **høj** | X-Forwarded-For-spoofing omgår brute-force-bremsen (rate-limit-nøgle bruger første, klient-kontrollerede XFF-værdi) | RATELIMIT-02 | Improper rate-limit key (CWE-290 / CWE-307) | Ubegrænset brute-force af `ADMIN_TOKEN`, `CLINIC_TOKENS`, `DOCTOR_TOKENS` og reports-token uden nogensinde at ramme 429 — én ny spoofet IP pr. forsøg nulstiller tælleren. Rammer admin-, klinik-, læge- og rapport-endpoints. |
| middel | Algoritmisk DoS i parseICS: ubegrænset antal VEVENT'er × 4000-iters RRULE-ekspansion blokerer event-loop'en ~1,5 s pr. parse | ICS-01 | Algoritmisk DoS (CWE-400) | Hvert ondsindet feed blokerer den single-threadede serverless-funktion ~1,5 s pr. parse uden brugbart resultat. Gentagne kald (testcal er uden success-rate-limit) lægger funktionen ned. |
| middel | Kalender-busy-tjek fail-open'er ved langsom/fejlende ICS-server → instant-booking oven i ekstern klinik-aftale | ICS-04 | Fail-open integritetsfejl (CWE-636) | Når klinikkens legitime kalender-udbyder er langsom eller fejler, forsvinder det eksterne busy-interval, og en kunde kan instant-bookes oven i en allerede optaget tid (dobbeltbooking hos klinikken). |
| middel | Cal.com-webhook mangler idempotens/replay-beskyttelse: signeret BOOKING_CREATED kan genafspilles og spamme kunden | WEBHOOK-02 | Manglende replay-beskyttelse (CWE-294) | En fanget gyldig (body+signatur) BOOKING_CREATED kan replayes ubegrænset (ingen timestamp/tolerance som hos Stripe), hver gang med ny bekræftelses-/betalingsmail til kunden. Afgrænset (kræver fangst af én gyldig request). |
| middel | Stored HTML-injektion i daglig klinik-dagsrapport (og klinik-notifikation ved booking) via usaneret customer.name/phone | INPUT-02 | Stored/persistent HTML-injection (CWE-79) | Persistent HTML-injektion gengivet i betroede interne mails (klinik-dagsrapport + klinik-notifikation). `esc()` findes i `_emails.js:47` men bruges ikke i booking-skabelonerne. Latent indtil et område er `ready:true`. |
| middel | Gennemførte bookinger opbevarer fuld PII i klartekst i 180 dage uden sletning ved gennemførelse (GDPR opbevaringsminimering) | PII-01 | GDPR opbevaringsminimering / privacy-by-design | Sundhedsnær PII (navn, e-mail, telefon + valgt screening-pakke, der knytter en identificerbar person til et helbredstjek) ligger i klartekst i 180 dage; kun aflysning pseudonymiserer. Ingen purge-cron i `vercel.json`. |
| middel | Cron-endpoints (/api/booking-remind + /api/drip) er uautentificerede når CRON_SECRET er tom/uset (fail-open guard) | CRON-01 | Manglende autentificering ved fail-open (CWE-306) | Uautentificeret udløsning af outbound e-mail. DRIP: spam/uautoriseret masse-mail fra Aevias verificerede domæne til alle kontakter; booking-remind: påmindelser kan trigges udefra. Kun afbødet hvis `CRON_SECRET` faktisk er sat. |
| lav | Manglende idempotens på Stripe-webhook: replay/retry af checkout.session.completed udløser gentagne bekræftelsesmails | PAY-02 | Manglende idempotens (CWE-799) | Dublerede transaktionsmails til kunden og bcc-støj til kontakt@aevia.dk; mild kundeforvirring og potentielt øget Resend-forbrug. |
| lav | DNS-rebinding/TOCTOU i fetchBusy: SSRF-værn pinner ikke IP mellem dns.lookup og fetch | ICS-02 | SSRF via DNS-rebinding/TOCTOU (CWE-918/CWE-367) | Autentificeret (rogue partnerklinik) blind/semi-blind SSRF mod interne ressourcer (cloud-metadata 169.254.169.254, interne net) — kræver autentificering + race-vinding mellem `dns.lookup` (l.179) og `fetch` (l.185). |
| lav | Fail-open brute-force-bremse (ingen throttle uden KV/ved KV-fejl) + spoofbar X-Forwarded-For IP-bucket | AUTHZ-05 | Defense-in-depth-svækkelse (CWE-307 / CWE-636) | Online brute-force/credential-stuffing mod klinik- og admin-tokens er ubremset, når KV mangler (`_ratelimit.js:51`) eller Upstash fejler (`:57-60`). Defense-in-depth-fund, der overlapper RATELIMIT-02's spoofbare bucket. |
| lav | HTML-injection i klinik-notifikationsmail via uescaped customer.name i book-slot.js | INPUT-01 | Stored/forwarded HTML-injection (CWE-79) | Stored/forwarded HTML-injection i interne notifikationsmails (klinik-modtager + kontakt@aevia.dk via BCC). Ingen script-eksekvering i mail-klienter, men link-/indholdsforfalskning. Gated bag `ready:true`. |
| lav | NPS-feedbacklinks bærer kundens e-mail som usigneret base64url — PII-eksponering + uautentificeret forfalskning af NPS-data | NPS-01 | Usigneret identifikator / PII-eksponering (CWE-639/CWE-200) | Kundens egen e-mail bæres reversibelt i et link sendt til samme kunde (fortrolighedssvækkelse hvis linket lækkes/logges); enhver kan POST'e vilkårlig e-mail + score og forfalske NPS-data til kontakt@aevia.dk. |
| lav | ICS line-injection via uescaped CR (\r) i klinik-styret 'sted' (LOCATION) i .ics-vedhæftning | ICS-04b | ICS/iCalendar line-injection (CWE-93) | En kompromitteret/ondsindet klinik (eller enhver med et gyldigt klinik-link) kan injicere en bar CR i `sted` og dermed indsætte ekstra ICS-linjer i den .ics-fil, kunden modtager. `escIcs` (`booking-action.js:56`) håndterer `\n` men ikke `\r`. Reel men begrænset. |

---

## 3. Detaljer pr. fund

### PAY-01 [HØJ] — Stripe-webhook validerer ikke beløb/valuta/pakke
**Kode-stier:**
- `api/stripe-webhook.js:150-160` — `markPaid`/`setBookingPaid` kaldes uden noget beløbstjek; `amount_total` bruges kun i mailen (l.166).
- `api/checkout.js:133` — `?bid` -> `metadata.booking_id` (kun `.slice(0,40)`), ingen prisbinding mellem session og booking.
- `api/book-slot.js:153-158, 174, 200` — `isPaid` -> `payUrl=null`, `paid:true`.
- `api/_booking-store.js:501-523` — `markPaid`/`isPaid`/`setBookingPaid` gemmer eller tjekker hverken pris eller pakke.

**Modbevis forsøgt:** Findes der en kontrol af, at det betalte beløb matcher bookingens/pakkens forventede pris? Nej. `setBookingPaid(id)` sætter blot `b.paid=true`. `markPaid(email,...)` gemmer kun `{at, pkg, sid}` — `pkg` kommer fra session-metadata (angriber-påvirkelig via checkout-URL), ikke fra det faktisk betalte line item. Sårbarheden står.

**Angreb:** Start en gavekort-/billig-checkout, men sæt `?bid=<offerets booking-id>` (eller brug egen e-mail på en dyr booking). Når `checkout.session.completed` fyres for et lille beløb, markeres den dyre booking/kunde som fuldt betalt.

**Patch:** `patches/01-PAY-01.md` · **Test:** `tests/PAY-01.test.mjs`

---

### RATELIMIT-02 [HØJ] — X-Forwarded-For-spoofing omgår brute-force-bremsen
**Kode-stier:**
- `api/_ratelimit.js:31-35` — `clientIp`, særligt l.33: `String(xf).split(",")[0].trim()` (tager venstre, klient-kontrollerede segment).
- `api/_ratelimit.js:52` — `key = rl:${bucket}:${clientIp(req)}`.
- Fail-open: `:51` (uden KV) og `:57-60` (Upstash-fejl).
- Kaldsteder: `admin-bookings.js:16`, `clinic-portal.js:30`, `get-draft.js:18`, `classify-report.js:32`, `approve-report.js:37`, `list-drafts.js:17`, `formulate-report.js:43`, `save-draft.js:19`.

**Modbevis forsøgt:** Vercel sætter selv `x-forwarded-for` — overskriver platformen ikke en klient-leveret header? Nej: Vercel appender klientens forbindelses-IP, men en klient-leveret `X-Forwarded-For` placeres som venstre segment, og koden tager netop `split(",")[0]`. Spoofing-vinduet står åbent.

**Angreb:** Send hvert brute-force-forsøg med en ny `X-Forwarded-For: <tilfældig IP>`. Hver værdi får sin egen bucket, så tælleren rammer aldrig `max`.

**Patch:** `patches/10-RATELIMIT-02.md`

---

### ICS-01 [MIDDEL] — Algoritmisk DoS i parseICS
**Kode-stier:** `api/_calendar.js:70-83` (`expandRRule`: `cap=4000`-loop + `new Date(occ).getUTCDay()` pr. iteration), `:86-128` (`parseICS`: intet loft på antal VEVENT'er), `:188` (kun ~1 MB tekst-cap). Reachable: `api/clinic-portal.js:130-134` (`testcal` -> uncachet `fetchBusy`, ingen success-rate-limit) sammenholdt med `api/_ratelimit.js:48-55` (tæller KUN auth-fejl, ikke vellykkede kald).
**Modbevis forsøgt:** Stopper 1 MB-cap'en angrebet? Nej — 1 MB rummer titusinder af minimale VEVENT'er, hver med en RRULE der ekspanderes op til 4000 iterationer.
**Patch:** `patches/03-ICS-01.md` · **Test:** `tests/ICS-01.test.mjs`

---

### ICS-04 [MIDDEL] — Kalender-busy-tjek fail-open'er
**Kode-stier:** `api/_booking-store.js:257, 260-262, 264-271`; `api/_calendar.js:171-191, 195`.
**Modbevis forsøgt:** Er live re-tjekket (`_booking-store.js:260-262`) tilstrækkeligt? Nej — det er pakket i `try{...}catch(_){}` og `fetchBusy` returnerer `[]` ved timeout/fejl, så et langsomt/fejlende feed bliver til "ingen optaget tid" -> booking går igennem oven i en ekstern aftale.
**Patch:** `patches/05-ICS-04.md` · **Test:** `tests/ICS-04.test.mjs`

---

### WEBHOOK-02 [MIDDEL] — Cal.com-webhook mangler idempotens/replay-beskyttelse
**Kode-stier:** `api/cal-webhook.js:80-133` (signaturtjek uden timestamp/nonce: l.88-93; ingen idempotens/replay-tjek før mail: l.110-126; mail-afsendelse: l.111-119); `api/_emails.js:153-170` (`sendMail` uden Idempotency-Key).
**Modbevis forsøgt:** Beskytter HMAC-signaturen mod replay? Nej — signaturen er stationær for en given body; uden timestamp/tolerance (modsat Stripe) kan samme `(body, signatur)` afspilles ubegrænset.
**Patch:** `patches/07-WEBHOOK-02.md` · **Test:** `tests/WEBHOOK-02.test.mjs`

---

### INPUT-02 [MIDDEL] — Stored HTML-injektion i daglig klinik-dagsrapport
**Kode-stier:** `api/booking-remind.js:106` (rå `${x.c.name}` + `${x.c.phone || x.c.email}`); `api/book-slot.js:141,143` (kun `slice`, ingen escaping på name/phone), `:193-194` (samme rå interpolation i klinik-notifikation); `api/_booking-store.js:323-324` (rå `customer` persisteret i `bk:<id>`); `api/_emails.js:153-170` (`sendMail` videresender html uændret). NB: `esc()` findes i `api/_emails.js:47` men bruges ikke i booking-skabelonerne.
**Modbevis forsøgt:** Filtrerer `slice(0,120)` farlige tegn fra? Nej — `slice` afkorter kun længde; `<`, `>`, `"` passerer. Latent indtil `ready:true`, men datastien (KV -> cron -> mail) er reel.
**Patch:** `patches/09-INPUT-02.md` · **Test:** `tests/INPUT-01.test.mjs` (dækker fælles esc-sti)

---

### PII-01 [MIDDEL] — Gennemførte bookinger opbevarer fuld PII i 180 dage
**Kode-stier:** `api/_booking-store.js:322-325` (lagring + day-indeks uden TTL-purge), `:330-352` (cancel = eneste pseudonymiserings-sti), `:473-483` (`markAttendance` KEEPTTL); `api/book-slot.js:140-146` (PII-felter); `vercel.json:2-5` (kun drip + booking-remind crons, ingen purge).
**Modbevis forsøgt:** Slettes PII efter gennemført besøg? Nej — kun aflysning (`cancel`) pseudonymiserer. En gennemført booking beholder navn/e-mail/telefon/pakke i 180 dage. GDPR-opbevaringsminimering ikke opfyldt.
**Anbefaling:** purge-cron der pseudonymiserer bookinger efter besøg/leverance. (Ingen separat regressionstest — proces-/data-livscyklus.)

---

### CRON-01 [MIDDEL] — Uautentificerede cron-endpoints når CRON_SECRET er tom
**Kode-stier:** `api/booking-remind.js:65`; `api/drip.js:20`; `vercel.json:2-5`; `.env.example:30`; `api/_booking-store.js:42-61` (`ready:false`-gate begrænser booking-remind-output).
**Modbevis forsøgt:** Er guarden altid aktiv? Nej — guarden er `if (process.env.CRON_SECRET && ...)`. Hvis `CRON_SECRET` er tom/uset (som i `.env.example`), springes auth-tjekket helt over, og enhver kan POST'e endpointet. Drip-stien kan udløse masse-mail til alle Resend-kontakter.
**Anbefaling:** Gør `CRON_SECRET` obligatorisk (fail-closed): mangler den, returnér 503 i stedet for at køre uautentificeret.

---

### PAY-02 [LAV] — Manglende idempotens på Stripe-webhook (replay -> dublerede mails)
**Kode-stier:** `api/stripe-webhook.js:138-143` (signaturtjek), `:150-174` (completed-gren), `:161-167` (sendMail), `:98-105` (sendMail-impl), `:172` (`upsertCustomerContact`); `api/_booking-store.js:501-506` (`markPaid`), `:514-523` (`setBookingPaid`).
**Modbevis forsøgt:** Findes der en `event.id`-deduplikering? Nej. Stripe-retries / replay af samme `checkout.session.completed` sender bekræftelsesmail igen.
**Patch:** `patches/02-PAY-02.md` · **Test:** `tests/PAY-02.test.mjs`

---

### ICS-02 [LAV] — DNS-rebinding/TOCTOU i fetchBusy
**Kode-stier:** `api/_calendar.js:178-185` (`dns.lookup` l.179 vs `fetch` l.185); leak-kanal `api/clinic-portal.js:130-134`; re-fetch `api/_booking-store.js:146, 261`.
**Modbevis forsøgt:** Lukker `dns.lookup`-tjekket SSRF? Delvist — det validerer DNS én gang, men `fetch` slår op igen (TOCTOU). Et angriber-DNS, der skifter mellem offentlig og privat IP, kan vinde racet. Kræver autentificering + race-vinding -> lav.
**Patch:** `patches/04-ICS-02.md` · **Test:** `tests/ICS-02.test.mjs` (+ `tests/_calendar.patched.mjs`)

---

### AUTHZ-05 [LAV] — Fail-open brute-force-bremse + spoofbar IP-bucket
**Kode-stier:** `api/_ratelimit.js:51` (fail-open uden KV), `:57-60` (fail-open ved Upstash-fejl), `:31-34` (klient-kontrolleret leftmost XFF); `api/clinic-portal.js:29-32, 60, 109`; `api/admin-bookings.js:15-18, 33, 50`.
**Modbevis forsøgt:** Er fail-open et bevidst, acceptabelt valg? Det er bevidst (kommentaren siger "bremsen må aldrig spærre legitim drift"), men det betyder også, at uden KV findes der ingen bremse. Defense-in-depth-svækkelse; overlapper RATELIMIT-02.
**Patch:** `patches/06-AUTHZ-05.md` · **Test:** `tests/AUTHZ-05.test.mjs`

---

### INPUT-01 [LAV] — HTML-injection i klinik-notifikationsmail (book-slot.js)
**Kode-stier:** `api/book-slot.js:193` (sink), `:141` (kun slice), `:186-195` (mail-loop); `api/_emails.js:153-169` (`sendMail` -> html rå); `api/_booking-store.js:289` (ready-gate), `:42-60` (alle AREAS `ready:false`).
**Modbevis forsøgt:** Kan det udløses i dag? Nej — `reserveMulti` afviser `!a.ready`, og alle områder er `ready:false`. Derfor lav/latent. Bliver reel, så snart et område åbnes.
**Patch:** `patches/08-INPUT-01.md` · **Test:** `tests/INPUT-01.test.mjs`

---

### NPS-01 [LAV] — Usigneret e-mail i NPS-feedbacklinks
**Kode-stier:** `api/_emails.js:185-194` (`npsBtns`; l.186 base64url-encode, l.189 URL-bygning uden signatur); `api/nps.js:24-51` (handler; l.27 base64url-decode uden verifikation, l.31 kun s-validering, l.44-45 mail med angriber-kontrolleret e-mail). Kontrast: `api/_emails.js:172-182` (`unsubSig`/`unsubUrlFor`) + `api/lead.js:46-51` (HMAC-verifikation med `crypto.timingSafeEqual`) — det rigtige mønster findes allerede i kodebasen.
**Modbevis forsøgt:** Er e-mailen signeret som unsub-linket? Nej — `nps.js` afkoder blot base64url uden HMAC. Reversibel PII i linket + enhver kan forfalske NPS-data.
**Anbefaling:** signér e-mail-parameteren med samme HMAC-mønster som `unsubSig`.

---

### ICS-04b [LAV] — ICS line-injection via uescaped CR i 'sted' (LOCATION)
**Kode-stier:** `api/booking-action.js:56` (`escIcs` mangler `\r`), `:60` (LOCATION-sink), `:117` (`sted` fra body, kun `slice(0,200)`), `:125-126` (.ics bygges + vedhæftes), `:132` (`to: data.email`); `api/booking.js:82` (token binder ikke sted/klinik-identitet).
**Modbevis forsøgt:** Fjerner `escIcs` linjeskift? Kun `\n` (`.replace(/\n/g, "\\n")`) — en bar `\r` passerer uændret og kan i nogle ICS-parsere starte en ny linje, så ekstra felter/events injiceres i kunde-vedhæftningen.
**Anbefaling:** udvid `escIcs` til også at neutralisere `\r` (og foldede linjer).

---

## 4. Prioriteret rækkefølge at rette i

1. **PAY-01 (høj)** — betalings-integritet. Bind checkout-beløb/pakke til booking, og verificér i webhooken før `setBookingPaid`/`markPaid`. Mest direkte indtægtstab.
2. **RATELIMIT-02 (høj)** — udled IP fra et betroet, platforms-sat segment (ikke leftmost XFF). Lukker brute-force mod alle tokens.
3. **CRON-01 (middel)** — gør `CRON_SECRET` obligatorisk (fail-closed) for `drip` + `booking-remind`. Hurtig, høj risikoreduktion (uautoriseret masse-mail).
4. **ICS-01 (middel)** — loft på antal VEVENT'er + samlet ekspansions-budget; rate-limit også vellykkede `testcal`-kald.
5. **ICS-04 (middel)** — fail-closed (eller eksplicit "kunne ikke verificere ledighed") når kalender-feedet timer ud, frem for at tillade instant-booking.
6. **WEBHOOK-02 (middel)** — idempotens/replay-vindue (timestamp + dedup) på Cal.com-webhooken.
7. **PII-01 (middel)** — purge-/pseudonymiserings-cron for gennemførte bookinger (GDPR).
8. **INPUT-02 + INPUT-01 (middel/lav)** — anvend `esc()` på `customer.name`/`phone` i klinik-mail-skabelonerne inden et område sættes `ready:true`.
9. **PAY-02 (lav)** — `event.id`-dedup mod dublerede bekræftelsesmails.
10. **AUTHZ-05 (lav)** — løses i praksis sammen med RATELIMIT-02.
11. **ICS-02 (lav)** — pin IP mellem `dns.lookup` og `fetch` (eller resolv-og-connect-til-samme-IP).
12. **NPS-01 (lav)** — HMAC-signér e-mail-parameteren (genbrug `unsubSig`-mønstret).
13. **ICS-04b (lav)** — udvid `escIcs` til `\r`.

---

## 5. Leverancer
- **Patch-forslag:** `security/booking-redteam/patches/01-PAY-01.md` … `10-RATELIMIT-02.md` (unified diffs, ikke anvendt).
- **Regressionstests:** `security/booking-redteam/tests/*.test.mjs` (+ `_calendar.patched.mjs`).
- **Denne rapport:** `security/booking-redteam/REPORT.md`.

**Gentaget:** Ingen live-kode i `api/` er ændret. Hver patch skal reviewes, testes i isoleret miljø og anvendes manuelt — betalings- og bookingkoden flytter penge og behandler sundhedsnær PII.
