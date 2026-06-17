# 10 · RATELIMIT-02 — X-Forwarded-For-spoofing omgår brute-force-bremsen

**Sværhedsgrad:** Høj
**Kategori:** Improper rate-limit key (CWE-290 spoofing / CWE-307 improper restriction of excessive auth attempts)
**Status:** Bekræftet ved kodelæsning. Reproducerbar end-to-end når KV/Upstash er konfigureret.

---

## Sårbarhed

Rate-limit-bremsen nøgler pr. IP, men IP'en udledes fra den **klient-kontrollerede**
`X-Forwarded-For`-header ved blindt at tage den FØRSTE komma-separerede værdi. På Vercel
appender edge-proxyen klientens ægte IP til SLUT i kæden (`X-Forwarded-For: <angriber>, <ægte-ip>`)
og stripper IKKE en medsendt værdi — derfor er `split(",")[0]` 100 % angriber-styret.
En angriber kan rotere headeren pr. request, så hver gætning får sin egen INCR-tæller og
grænsen (`max = 10`) aldrig nås. Bremsen bliver reelt en no-op for brute-force.

### Fil:linje (kæde)

| Fil | Linje | Rolle |
|-----|-------|-------|
| `api/_ratelimit.js` | **31–35** | `clientIp()` — udleder IP fra header |
| `api/_ratelimit.js` | **33** | **Primær defekt:** `return String(xf).split(",")[0].trim()` → FØRSTE XFF-værdi (angriber-styret på Vercel) |
| `api/_ratelimit.js` | **52** | `key = rl:${bucket}:${clientIp(req)}` → angriber-styret nøgle ⇒ frisk tæller pr. forfalsket IP |
| `api/_ratelimit.js` | **49** | `max = 10` — grænsen der aldrig rammes |
| `api/_ratelimit.js` | **54–56** | `INCR` + `n > max` — `n` forbliver 1 ved roterende IP |
| `api/_ratelimit.js` | **51** | Sekundær: fail-open uden KV (`return false`) |
| `api/_ratelimit.js` | **57–60** | Sekundær: fail-open ved enhver Upstash-fejl |

**Betroet kilde på Vercel som koden ignorerer:** `x-real-ip` (alternativt
`x-vercel-forwarded-for`), eller — hvis man bevarer XFF — den SIDSTE entry, da Vercel
appender den ægte IP til sidst.

**Ramte kaldssteder (alle deler `clientIp()` via `tooManyFails`):**
`admin-bookings.js:16` (`admin-bookings`-bucket), `clinic-portal.js:30` (`clinic-portal`),
`get-draft.js:18`, `classify-report.js:32`, `approve-report.js:37`, `list-drafts.js:17`,
`formulate-report.js:43`, `save-draft.js:19` (alle `reports`-bucket).

**Afgrænsning:** `authed()` bruger `crypto.timingSafeEqual` (lukker timing-orakel) men
begrænser IKKE gætte-raten — bremsen er den eneste rate-kontrol (ingen `middleware.js`,
ingen WAF i repoet; bekræftet: `ls middleware.js` → findes ikke).

---

## Repro

**Forudsætning:** KV/Upstash konfigureret (ellers fail-open'er bremsen alligevel, linje 51).
**Mål:** `ADMIN_TOKEN` på `/api/admin-bookings` (samme mønster for `clinic-portal` og reports-endpoints).

```http
# Forsøg 1
GET /api/admin-bookings
Authorization: Bearer <gæt-1>
X-Forwarded-For: 10.0.0.1
```
`authed()` fejler → `deny()` → `tooManyFails()` bygger nøgle `rl:admin-bookings:10.0.0.1`,
INCR=1, `1 > 10` falsk → **403** (ikke 429).

```http
# Forsøg 2 — nyt gæt OG ny header
GET /api/admin-bookings
Authorization: Bearer <gæt-2>
X-Forwarded-For: 10.0.0.2
```
Ny nøgle `rl:admin-bookings:10.0.0.2`, INCR=1 → **403**.

Roter `X-Forwarded-For` (10.0.0.3, 10.0.0.4, …) for hvert nyt gæt. Hver request får frisk
tæller; `n > max` (linje 56) udløses aldrig → **429 rammes aldrig**.

På Vercel ser funktionen i praksis `X-Forwarded-For: 10.0.0.2, <ægte-angriber-ip>` —
`split(",")[0]` vælger den forfalskede `10.0.0.2`, ikke den ægte IP til sidst.

---

## Impact

Ubegrænset brute-force af `ADMIN_TOKEN`, `CLINIC_TOKENS`, `DOCTOR_TOKENS` og reports-token
uden nogensinde at ramme 429 — én enkelt header (`X-Forwarded-For`) nulstiller bremsen pr.
request. Kompromittering af admin-token giver fuld booking-administration; klinik-token giver
kontrol over en kliniks tider/fremmøde; reports/doctor-token giver adgang til kliniske
rapport-drafts. Da bremsen er den eneste rate-kontrol, gør bypasset gæt-raten reelt uendelig.

---

## Fix (unified diff — klar til at anvende på `api/_ratelimit.js`)

Hold op med at stole på den første XFF-værdi. Brug Vercels betroede kilder i rækkefølge:
`x-real-ip` → `x-vercel-forwarded-for` → SIDSTE entry i `x-forwarded-for` (Vercel appender
den ægte IP til sidst) → `req.socket.remoteAddress`. Hvis ingen kendt KV/IP-kilde findes,
falder vi tilbage på en fælles `unknown`-bucket, så roterende headere deler tæller.

```diff
--- a/api/_ratelimit.js
+++ b/api/_ratelimit.js
@@ -28,11 +28,24 @@ export function doctorTokensConfigured() {
   catch { return false; }
 }

-function clientIp(req) {
-  const xf = req.headers && (req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"]);
-  if (xf) return String(xf).split(",")[0].trim();
-  return (req.socket && req.socket.remoteAddress) || "unknown";
-}
+// Udled klient-IP fra en BETROET kilde. På Vercel er x-forwarded-for delvist
+// klient-kontrolleret: edge-proxyen APPENDER den ægte IP til SLUT og stripper
+// IKKE en medsendt værdi. split(",")[0] ville derfor være angriber-styret og
+// give hver forfalsket IP sin egen rate-limit-tæller (RATELIMIT-02).
+// Foretruk derfor proxyens egne, ikke-spoofbare headere; brug ellers den SIDSTE
+// xff-entry (den ægte, appenderede IP), aldrig den første.
+function clientIp(req) {
+  const h = (req && req.headers) || {};
+  const real = h["x-real-ip"] || h["X-Real-IP"];
+  if (real) return String(real).split(",").pop().trim();
+  const vercel = h["x-vercel-forwarded-for"] || h["X-Vercel-Forwarded-For"];
+  if (vercel) return String(vercel).split(",").pop().trim();
+  const xf = h["x-forwarded-for"] || h["X-Forwarded-For"];
+  if (xf) {
+    const last = String(xf).split(",").pop().trim();
+    if (last) return last; // SIDSTE entry = Vercel-appenderet ægte IP
+  }
+  return (req.socket && req.socket.remoteAddress) || "unknown";
+}
```

### Anbefalet, separat lag (defense-in-depth — ikke i diff'en ovenfor)

1. **Sekundær, IP-uafhængig global bremse pr. bucket.** Selv med korrekt IP-kilde kan en
   angriber med mange ægte IP'er (botnet) gætte. Tilføj en samlet tæller pr. bucket, fx
   `rl:${bucket}:__global` med en højere, men endelig, grænse — så token-gætning er
   begrænset uanset IP.

2. **Genovervej fail-open for auth-følsomme buckets (linje 51, 57–60).** I dag bliver
   bremsen stille til en no-op både uden KV og ved enhver Upstash-fejl. Som minimum: alarmér/
   log tydeligt (`console.error`) når KV mangler, så driften opdager at bremsen er slået fra.

---

## Regressions-risiko

- **Berører kun `api/_ratelimit.js`** — én privat funktion (`clientIp`, kaldt udelukkende fra
  `tooManyFails`, linje 52). Ingen ændring i `tooManyFails`-signatur, returtype eller
  kaldssteder. Ingen delt store-kode (`_booking-store.js`, `_emails.js`) berøres.
- **Adfærdsændring (tilsigtet):** rate-limit-nøglen ændres fra første→sidste/betroede IP.
  Eksisterende KV-nøgler fra før fixet (`rl:<bucket>:<forfalsket-ip>`) bliver forældreløse og
  udløber selv via deres `EXPIRE` (900 s) — ingen migration nødvendig.
- **Lokal udvikling / ikke-Vercel-miljøer:** uden `x-real-ip`/`x-vercel-forwarded-for` og uden
  XFF falder koden tilbage på `req.socket.remoteAddress` (uændret fra før) → ingen brud i dev.
- **Legitime proxy-kæder:** hvis et fremtidigt setup tilføjer en EKSTRA betroet proxy efter
  Vercel, vil "sidste entry" pege på den proxy. På ren Vercel (nuværende `vercel.json`, ingen
  `middleware.js`) er sidste entry den ægte klient-IP — korrekt. Skift kun antagelsen hvis
  infrastruktur-laget ændres.
