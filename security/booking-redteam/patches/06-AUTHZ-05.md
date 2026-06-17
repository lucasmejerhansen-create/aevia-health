# AUTHZ-05 [lav] — Fail-open brute-force-bremse + spoofbar X-Forwarded-For IP-bucket

> Status: **PATCH-FORSLAG** (ikke anvendt). Rør ikke `api/` direkte; dette dokument
> beskriver den foreslåede ændring som unified diff klar til at anvende.

## Sårbarhed

Den eneste brute-force-bremse på auth-fejl er `tooManyFails()` i `api/_ratelimit.js`.
Den er bevidst **fail-open** på to måder, og dens IP-bucket bygger på en
**klient-kontrolleret** header. Selve auth (token-validering) er KV-uafhængig, så
`deny()` kan rammes i et ubremset loop mens KV mangler eller fejler.

Tre konkrete svagheder:

1. **Fail-open uden KV** — `api/_ratelimit.js:51`
   ```js
   if (!kvUrl() || !kvToken()) return false; // fail-open uden KV
   ```
   Mangler KV/Upstash-env → `tooManyFails` returnerer altid `false` → ingen 429,
   uanset antal mislykkede forsøg.

2. **Fail-open ved Upstash-fejl** — `api/_ratelimit.js:57-60`
   ```js
   } catch (e) {
     console.error("rate-limit-fejl:", e.message);
     return false; // fail-open: bremsen må aldrig spærre legitim drift
   }
   ```
   Enhver Upstash-fejl (nedetid, timeout, 5xx) → `false` → ubremset.

3. **Spoofbar IP-bucket** — `api/_ratelimit.js:31-34` (brugt i nøglen `:52`)
   ```js
   function clientIp(req) {
     const xf = req.headers && (req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"]);
     if (xf) return String(xf).split(",")[0].trim();   // ← leftmost = klient-kontrolleret
     return (req.socket && req.socket.remoteAddress) || "unknown";
   }
   ```
   Tager **leftmost** segment af `x-forwarded-for`. Bag en proxy (Vercel) er det
   leftmost segment angriber-leveret. Roteres `X-Forwarded-For: 1.2.3.<n>` får
   hver værdi sin egen bucket (`rl:<bucket>:<ip>`), så max-10-grænsen nulstilles
   pr. spoofet IP — selv **med** KV oppe.

### Berørte kaldssteder (kun læse-kontekst, ændres ikke)
- `api/clinic-portal.js:29-32` (`deny`), `:60` (GET header-only), `:109` (POST header||body)
- `api/admin-bookings.js:15-18` (`deny`), `:33`, `:50`

### IKKE en sårbarhed (bekræftet — ingen ændring)
Body-token-kanalen (`bearerToken(req) || body.token`, `clinic-portal.js:109` /
`admin-bookings.js:50`) er bevidst hærdning: token læses fra header (foretrukket)
eller JSON POST-body, **aldrig** fra URL/query (GET er header-only). Det er
materielt sikrere end URL/query og bevares uændret.

## Fil:linje
- `api/_ratelimit.js:31-34` — `clientIp()` (leftmost XFF)
- `api/_ratelimit.js:48-61` — `tooManyFails()` (fail-open uden KV + i catch)

## Repro
Forudsætning for kerne-delen: KV/Upstash-env mangler **eller** Upstash svarer fejl.

1. Send gentagne `POST /api/clinic-portal` med
   `{"token":"gæt-N","action":"setactive","svc":"blod","active":true}`
   (eller `GET` med `Authorization: Bearer gæt-N`).
2. `accessForToken` → `null` → `deny()` kaldes.
3. `tooManyFails` → `false` (fail-open, `:51` hhv. `:57-60`) → svar er **altid 403,
   aldrig 429**; ingen throttle uanset antal forsøg.
4. Samme mod `admin-bookings` mod `ADMIN_TOKEN`.

Bonus (gælder **selv med KV**): gentag med roterende header
`X-Forwarded-For: 1.2.3.<n>` → hver værdi får egen bucket → 10-grænsen nulstilles
pr. spoofet IP.

Bemærk: giver kun adgang ved lav token-entropi; mod stærke
`CLINIC_TOKENS`/`ADMIN_TOKEN` er online-gæt urealistisk (admin bruger desuden
`timingSafeEqual`).

## Impact
Defense-in-depth-svækkelse: online brute-force / credential-stuffing mod klinik-
og admin-tokens er ubremset når KV mangler/fejler, og delvist omgåeligt selv når
KV kører (XFF-rotation nulstiller per-IP-bucket). Ingen lockout/delay/captcha som
fallback. Reelt brud forudsætter lav token-entropi → derfor **lav** severity.

## Fix

To dele:

**A. Spoof-sikker klient-IP.** På Vercel er det proxy-tilføjede (betroede) segment
det **højre-mest** i `x-forwarded-for`, og `x-real-ip` sættes af platformen. Læs
fra `x-real-ip` først, ellers det højre-mest XFF-segment, ellers socket. Det
fjerner trivielt bucket-spoof via leftmost-rotation.

**B. KV-uafhængig fallback-bremse.** Når KV mangler/fejler, fald tilbage på en
in-memory per-instans tæller (samme `bucket:ip`-nøgle, samme vindue) i stedet for
blind `false`. Det betyder fail-open ikke længere er ubremset: en enkelt
warm-instans bremser et vedvarende loop. (Bevidst valg: vi spærrer ikke hele
driften — kun de mislykkede auth-forsøg tælles, præcis som i dag.)

Begge dele er isoleret til `api/_ratelimit.js`; signaturen for `tooManyFails` og
`bearerToken` er uændret, så kaldssteder i `clinic-portal.js` / `admin-bookings.js`
behøver ingen ændring.

### Unified diff (klar til `git apply` fra repo-roden)

```diff
--- a/api/_ratelimit.js
+++ b/api/_ratelimit.js
@@ -28,11 +28,30 @@ export function doctorTokensConfigured() {
   catch { return false; }
 }
 
-function clientIp(req) {
-  const xf = req.headers && (req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"]);
-  if (xf) return String(xf).split(",")[0].trim();
-  return (req.socket && req.socket.remoteAddress) || "unknown";
-}
+// Spoof-sikker klient-IP. Bag Vercels proxy er KLIENT-leveret XFF leftmost; det
+// BETROEDE (proxy-tilføjede) segment er højre-mest. Foretræk x-real-ip (sat af
+// platformen), ellers højre-mest XFF-segment, ellers socket. Det forhindrer at
+// en angriber nulstiller sin per-IP-bucket ved at rotere leftmost XFF.
+function clientIp(req) {
+  const h = req.headers || {};
+  const real = h["x-real-ip"] || h["X-Real-IP"];
+  if (real) return String(real).trim();
+  const xf = h["x-forwarded-for"] || h["X-Forwarded-For"];
+  if (xf) {
+    const parts = String(xf).split(",").map((s) => s.trim()).filter(Boolean);
+    if (parts.length) return parts[parts.length - 1]; // højre-mest = betroet hop
+  }
+  return (req.socket && req.socket.remoteAddress) || "unknown";
+}
+
+// KV-uafhængig fallback: per-instans tæller, så fail-open ikke er UBREMSET når
+// KV mangler/fejler. Warm-instanser bremser et vedvarende auth-fejl-loop.
+const _mem = new Map(); // key -> { n, exp }
+function memTooMany(key, max, windowSec) {
+  const now = Date.now();
+  const e = _mem.get(key);
+  if (!e || e.exp <= now) { _mem.set(key, { n: 1, exp: now + windowSec * 1000 }); return 1 > max; }
+  e.n += 1;
+  return e.n > max;
+}
 
 async function cmd(c) {
   const r = await fetch(kvUrl(), {
@@ -47,13 +66,14 @@ async function cmd(c) {
 // Tæl én auth-fejl for (bucket, IP). Returnér true hvis grænsen er overskredet.
 export async function tooManyFails(req, bucket, opts) {
   const max = (opts && opts.max) || 10;
   const windowSec = (opts && opts.windowSec) || 900; // 15 min
-  if (!kvUrl() || !kvToken()) return false; // fail-open uden KV
   const key = `rl:${bucket}:${clientIp(req)}`;
+  // Uden KV: fald tilbage på in-memory per-instans bremse (ikke ubremset).
+  if (!kvUrl() || !kvToken()) return memTooMany(key, max, windowSec);
   try {
     const n = await cmd(["INCR", key]);
     if (Number(n) === 1) await cmd(["EXPIRE", key, windowSec]);
     return Number(n) > max;
   } catch (e) {
     console.error("rate-limit-fejl:", e.message);
-    return false; // fail-open: bremsen må aldrig spærre legitim drift
+    // Upstash nede → fald tilbage på in-memory bremse i stedet for blind false.
+    return memTooMany(key, max, windowSec);
   }
 }
```

### Regressions-risiko
- **Delt kode:** `_ratelimit.js` deles af `clinic-portal.js`, `admin-bookings.js`
  (og iflg. hypotesen `list-drafts.js` / `get-draft.js`). Signaturerne er uændret,
  så ingen kaldssted-ændring kræves. Tjek dog at andre kaldere ikke afhænger af
  den nuværende garanterede `false` uden KV (de gør det ikke — de tæller kun
  auth-fejl, så legitime auth'ede kald rammer aldrig bremsen).
- **`clientIp` semantik ændres:** lokal udvikling/tests uden proxy sender typisk
  ingen `x-real-ip`/`x-forwarded-for`, så socket-fallbacken bevarer adfærd.
  Hvis et internt værktøj bevidst satte leftmost XFF for at simulere en IP, skal
  det nu sætte `x-real-ip` i stedet.
- **In-memory tæller er per-instans og ikke-persistent:** serverless cold-starts
  nulstiller den. Det er bevidst — den er kun en *fallback* der gør fail-open
  mindre absolut; den primære bremse forbliver KV. Hukommelse er bundet (én
  Map-nøgle pr. `bucket:ip` med udløb), så ingen ubegrænset vækst i praksis ved
  rimelig trafik.
- **Ingen ændring i body-token-kanalen** (bevidst hærdning, bevares).
