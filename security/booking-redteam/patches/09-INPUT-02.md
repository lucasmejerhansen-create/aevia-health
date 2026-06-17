# 09 · INPUT-02 — Stored HTML-injection i daglig klinik-dagsrapport (cron) via usaneret `customer.name` / `customer.phone`

**Sværhedsgrad:** Middel (ægte, uafbødet stored-injektion; latent indtil et område sættes `ready:true`)
**Kategori:** Stored/persistent HTML-injection (CWE-79, output-encoding mangler ved render af persisteret bruger-data)
**Status:** Bekræftet ved kodelæsning. Stored-stien (KV → cron → mail) er reel; ikke end-to-end-reproducerbar i nuværende tilstand, fordi alle områder er `ready:false`.

> **Forhold til INPUT-01 (08):** INPUT-01 dækker booking-tidens klinik-notifikation
> (`book-slot.js:193-194`) og kunde-mailens `h1`. **INPUT-02's distinkte, primære sink er
> den daglige cron** `booking-remind.js:106`, der læser den persisterede `customer` tilbage
> fra KV (`bk:<id>`) og interpolerer `x.c.name` / `x.c.phone` / `x.c.email` råt ind i
> dagsrapport-HTML'en. Det er en ægte **stored** injektion (persisteret payload renderes
> senere af en betroet baggrundsjob), hvor INPUT-01's hovedfokus er reflected-i-samme-request.
> Begge fixes deler samme `esc()`-mønster; dette dokument leverer fixet til `booking-remind.js`
> og refererer til 08-INPUT-01.md for `book-slot.js`-sinken.

---

## Sårbarhed

Den daglige booking-cron bygger en **klinik-dagsrapport** pr. ydelse. For hver dagens
booking samles `{ time, c: b.customer }` (booking-remind.js:101), og rapportens tabelrækker
bygges med rå template-interpolation af den persisterede, brugerstyrede `customer`:

```js
// booking-remind.js:106 (NUVÆRENDE — sårbar)
`<tr>...<td ...>${x.c.name}</td><td ...>${x.c.phone || x.c.email}</td></tr>`
```

`customer.name` og `customer.phone` valideres **kun** med længde-trunkering ved entry
(`book-slot.js:141` `String(name).slice(0,120)`; `:143` `String(phone).slice(0,40)`) — ingen
HTML-escaping og intet tegn-regex (kun `email` tjekkes mod `EMAIL_RE`). Den rå `customer`
JSON-serialiseres ind i `bk:<id>` (`reserveMulti`, `_booking-store.js:323-324`). Cron'en læser
bookingen tilbage (`listDay`) og interpolerer felterne **uden escaping**; `sendMail`
(`_emails.js:153-170`) videresender `html` uændret til Resend.

`esc()` findes allerede i `_emails.js:47` men er **ikke** importeret/brugt i
booking-skabelonerne — sinken bryder kodebasens egen konvention.

### Fil:linje (kæde — fra payload til render)

| Fil | Linje | Rolle |
|-----|-------|-------|
| `api/book-slot.js` | **141** | `name: String(name).slice(0,120)` — KUN længdegrænse, ingen tegnfiltrering |
| `api/book-slot.js` | **143** | `phone: String(phone).slice(0,40)` — KUN længdegrænse |
| `api/_booking-store.js` | **323-324** | `reserveMulti` JSON-serialiserer `customer` råt ind i `bk:<id>` (persistens) |
| `api/booking-remind.js` | **101** | Cron samler `{ time, c: b.customer }` pr. ydelse |
| `api/booking-remind.js` | **106** | **PRIMÆR SINK:** `${x.c.name}` + `${x.c.phone \|\| x.c.email}` rå i dagsrapport-`html` |
| `api/booking-remind.js` | **109-113** | `sendMail({ to: conf.email \|\| "kontakt@aevia.dk", bcc, ... html })` |
| `api/_emails.js` | **153-170** | `sendMail` sender `html`-strengen rå videre til Resend |
| `api/_emails.js` | **47** | `esc()` findes — men bruges IKKE i booking-skabelonerne |
| `api/booking-remind.js` | **78** | Ready-gate i cron: `if (!AREAS[area].ready) continue;` |
| `api/_booking-store.js` | **43-57** | Alle `AREAS` har `ready:false` (kommentar :55-56: flippes ved go-live) |
| `api/_booking-store.js` | **289** | `reserveMulti`-ready-gate: afviser før persistens hvis ikke `ready` |

**Sikre felter (kræver ingen escaping):** `b.area` / `area` (booking-remind.js:52,111-112) er
allowlistede `AREAS`-nøgler; `svcLabel(svc)` slår op i `SVC_LABELS`; `fmtDay`/`fmtDate` er
`Intl`-formaterede datoer; `b.id` er server-genereret (`crypto.randomBytes`).

---

## Repro

**Som koden er NU: ikke reproducerbar end-to-end.** `reserveMulti` (`_booking-store.js:289`)
kræver `a.ready`, og cron'en springer `!AREAS[area].ready` over (booking-remind.js:78). Alle
`AREAS` er `ready:false`, så payloaden persisteres aldrig, og cron'en når aldrig sinken.

**Når en klinik gøres live** (`ready:true` — som `AREAS`-kommentaren :55-56 eksplicit lægger
op til):

1. **Persistér payload (uden cron):** angriber POSTer en gyldig booking med ondsindet navn:

```http
POST /api/book-slot
Content-Type: application/json

{
  "area": "<gyldigt ready-område>",
  "parts": [{ "svc": "blod", "date": "<gyldig fremtidig dato>", "time": "08:00" }],
  "email": "angriber@example.com",
  "name": "<a href=\"https://phish.example/login\">Ring kunde tilbage</a><img src=x>"
}
```
   Validering passerer (kun længde trunkeres; honeypot `gotcha` tom; **ingen rate-limit** på
   book-slot). `reserveMulti` (`_booking-store.js:322-325`) gemmer `customer` råt i `bk:<id>`
   og tilføjer id til `day:<area>:<dato>`.

2. **Næste morgen** kører `booking-remind`-cron'en (Vercel Cron, `Authorization: Bearer
   CRON_SECRET`). 401-tjekket (booking-remind.js:65) blokerer kun fremmede kald — **ikke**
   selve cron'en; angriberen behøver ingen handling. Cron'en `listDay` → samler dagens
   bookinger → bygger dagsrapporten og interpolerer navnet råt (`:106`) → `sendMail` til
   `conf.email` og/eller `kontakt@aevia.dk`.

3. **Intern modtager** åbner mailen og får angriberens markup gengivet: klikbart phishing-link
   og billed-tag. (`onerror` o.l. neutraliseres typisk af mailklienter, men `<a>`/`<img>`/
   link-spoofing fungerer.)

**Sekundær (uden cron):** `book-slot.js:193-194` mailer klinik-notifikation med rå navn/kontakt
allerede ved booking — se 08-INPUT-01.md for den sti og dens fix.

---

## Impact

Persistent HTML-injection gengivet i **betroede interne** mails (klinik-dagsrapport via cron +
klinik-notifikation ved booking) til klinik-email og/eller `kontakt@aevia.dk`. Muliggør
phishing-links og spoofet indhold i en mail, modtageren stoler på.

Begrænsende faktorer: kun interne modtagere (ingen ekstern offer-flade; ingen account-takeover/
SSRF/RCE), og mailklienter strippes typisk for `script`/`onerror`. Derfor **middel**, ikke høj.
Men det er en ægte, uafbødet **stored**-injektion (payloaden persisteres og renderes senere af
et betroet job), og book-slot-stien udløses uden cron — derfor ikke nedjusteret til lav. Gælder
først reelt ved go-live (`ready:true`); p.t. latent.

---

## Fix (unified diff — klar til at anvende på `api/booking-remind.js`)

Genbrug det `esc()`-mønster, der allerede findes i `_emails.js:47` (her i den fulde variant med
`"` og `'`, som 08-INPUT-01 også bruger), og wrap **alle** brugerstyrede felter i
dagsrapport-sinken. `b.area`/`svcLabel`/`fmtDay` er sikre, men `${b.area}` escapes for
defense-in-depth og konsistens (lokal allowlist kan ændres senere).

```diff
--- a/api/booking-remind.js
+++ b/api/booking-remind.js
@@ -10,6 +10,12 @@ import { sendMail } from "./_emails.js";

 const SITE = process.env.SITE_URL || "https://aevia.dk";

+// HTML-escape af brugerinput i mail-sinks — samme mønster som _emails.js:47
+// (inkl. " og '). Bruges på ALT brugerstyret felt (customer.name/phone/email),
+// der interpoleres i dagsrapportens html. Område/svc/dato er allowlistede/formaterede.
+const esc = (s) =>
+  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
+    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
+
 function isoPlus(days) {
   const d = new Date();
   d.setDate(d.getDate() + days);
@@ -103,7 +109,7 @@ export default async function handler(req, res) {
       for (const svc of Object.keys(bySvc)) {
         const rows = bySvc[svc].sort((a, b) => a.time.localeCompare(b.time)).map((x) =>
-          `<tr><td style="padding:6px 10px;border-bottom:1px solid #ddd"><b>${x.time}</b></td><td style="padding:6px 10px;border-bottom:1px solid #ddd">${x.c.name}</td><td style="padding:6px 10px;border-bottom:1px solid #ddd">${x.c.phone || x.c.email}</td></tr>`).join("");
+          `<tr><td style="padding:6px 10px;border-bottom:1px solid #ddd"><b>${x.time}</b></td><td style="padding:6px 10px;border-bottom:1px solid #ddd">${esc(x.c.name)}</td><td style="padding:6px 10px;border-bottom:1px solid #ddd">${esc(x.c.phone || x.c.email)}</td></tr>`).join("");
         const conf = (await effectiveConf(area, svc)) || {};
         const to = conf.email || "kontakt@aevia.dk";
         await sendMail({
```

`reminderMail` (booking-remind.js:31-62, sendt til **kunden selv**) interpolerer ikke
`customer.name`/`phone` — kun `svcLabel`, `fmtDay`, `b.area` og server-`manageUrl`/`bookingSig`
— så den behøver ingen ændring. Hvis der senere tilføjes navn dér, skal det også `esc()`'es.

### Best practice (defense-in-depth, separat lag — i `book-slot.js`)

Saner desuden `name`/`phone` allerede ved entry (`book-slot.js:141/143`), så ingen nuværende
eller fremtidig sink (cron, klinik-notifikation, fremtidige rapporter) kan rammes, uanset om en
skabelon glemmer `esc()`:

```diff
@@
   const customer = {
-    name: String(name).slice(0, 120),
+    name: String(name).replace(/[<>]/g, "").slice(0, 120),
     email: String(email).trim().toLowerCase(),
-    phone: phone ? String(phone).slice(0, 40) : "",
+    phone: phone ? String(phone).replace(/[<>]/g, "").slice(0, 40) : "",
```

Bemærk: input-strip ERSTATTER IKKE output-`esc()` — output-encoding er det korrekte primære
forsvar. Strip er kun et ekstra lag. (`if (!name)` på book-slot.js:137 kører på rå `name` FØR
`customer` bygges, så valideringen er uændret.) Allerede-persisterede bookinger fra før et
strip-fix har stadig rå payload i KV → output-`esc()` i cron'en er derfor det afgørende fix.

---

## Regressions-risiko

- **Primær-fix (`booking-remind.js`) berører IKKE delt kode.** `esc()` er en lokal `const` i
  modul-scope; den eneste adfærdsændring er, at brugerstyrede felter i dagsrapport-HTML'en nu
  output-encodes. Ingen andre forbrugere påvirkes.
- **Kosmetisk i mails:** legitime navne med `&` (fx "Anders & Co") vises i HTML-kilden som
  `&amp;` men renderes som `&` for modtageren — korrekt adfærd, ikke en regression. Telefonnumre
  (`+45 ...`) indeholder ingen escape-tegn og påvirkes ikke.
- **`_emails.js` / `_booking-store.js` ændres IKKE i primær-fixet** → ingen risiko for
  `booking.js`, `booking-action.js`, `lead.js`, `drip.js`, `book-slot.js` eller andre forbrugere
  af `sendMail` / `reserveMulti`.
- **Hvis defense-in-depth-strip i `book-slot.js:141/143` anvendes** (delt entry-sti for flere
  sinks): et navn der KUN består af `<`/`>` bliver tomt efter strip, men `if (!name)` (linje 137)
  kører på rå `name` før build, så valideringen er uændret; tom-efter-strip giver blot et tomt
  felt i mailen. Påvirker kun NYE bookinger; eksisterende `bk:<id>` beholder rå data, hvorfor
  output-`esc()` forbliver det bærende forsvar. Dette strip overlapper med INPUT-01's
  defense-in-depth-forslag — anvend kun ét sted (entry) for at undgå dobbelt-redigering.
