# Go-live — hvad skal være sandt før live (delta efter audit, juni 2026)

Status: bookingsystem + GDPR/audit-fixes er bygget og committet. Dette er de
**resterende blokkere** før produktion med rigtige (patient)data. Punkter markeret
🔴 blokerer; 🟡 bør være på plads; 🟢 valgfrit/senere.

## 1. Deploy
- 🔴 **Push `main`** (står ~14 commits foran). Vercel deployer automatisk.

## 2. Miljøvariabler i Vercel (Settings → Environment Variables)
- 🔴 `KV_REST_API_URL` + `KV_REST_API_TOKEN` — Upstash Redis (uden dem kører booking i "ikke-konfigureret"-fallback).
- 🔴 `ADMIN_TOKEN` — admin/booking-admin.
- 🔴 `CLINIC_TOKENS` — JSON `{"<nøgle>":"<Område>"}` (eller `"Område:ydelse"`) pr. klinik.
- 🟡 `DOCTOR_TOKENS` — JSON `{"<token>":"<doctorId>"}` pr. læge. **Sættes for at aktivere per-læge-godkendelse** (ellers fallback: ADMIN_TOKEN + manuelt læge-id, som kan forfalskes).
- 🔴 `BOOKING_SECRET` — HMAC til kunde-/klinik-links.
- 🔴 `RESEND_API_KEY` + `MAIL_FROM` — mails (uden den sendes ingen mails).
- 🔴 `STRIPE_*` (secret + webhook) — betaling/checkout.
- 🟡 `ANTHROPIC_API_KEY` (+ evt. `AEVIA_AI_MODEL`) — AI-chat + rapport-udkast.
- 🟡 `SITE_URL` = https://aevia.dk.
- 🟢 `CAL_WEBHOOK_SECRET` — kun hvis en klinik bruger Cal.com-flowet.

## 3. Jura / DPO (se GDPR-DPO-notat.md)
- 🔴 **DPIA** (art. 35) før rigtige patientdata (kode-kommentar kræver det allerede).
- 🔴 **Databehandleraftaler (DPA)** med alle databehandlere + afklar partnerklinik-rolle (databehandler vs. fælles ansvarlig).
- 🔴 **Tredjelandsoverførsel** (USA: Anthropic/Google/Microsoft/Stripe/Vercel) — bekræft SCC/DPF-grundlag pr. leverandør.
- 🟡 De øvrige 11 punkter i `GDPR-DPO-notat.md` (Art.9-hjemmel, profilering, IVDR, fortrydelsesret, markedsføringshjemmel, DPO-pligt, sælger-identitet).

## 4. Indhold (kan ikke laves teknisk)
- 🔴 **Navngivet grundlægger + foto + ansvarlig autoriseret læge** (TODO i `om-os.html`) — kerne i "godkendt af læge"-løftet.
- 🟡 **Testimonials / social proof** (når der er rigtige kundeforløb).
- 🔴 **Klinisk validering af motoren (lib/aevia-engine)** ved Judit, før "godkendt af læge" markedsføres bredt.

## 5. Booking
- 🟡 Beslut hvornår et **rigtigt klinik-område sættes `ready:true`** (Herning er nu `false`). Udfyld da rigtige klinik-navne + notifikations-mail i `api/_booking-store.js` og opdater kort-kortene til "Bekræftet partnerklinik".

## 6. Røgtest efter deploy
- 🟡 Klinik-portal: log ind (CLINIC_TOKENS-nøgle), gem skema, bekræft kunde kan booke en tid → instant bekræftelse + mail.
- 🟡 Læge-flow: log ind på laege-dashboard med en DOCTOR_TOKENS-token, godkend en draft → bekræft `doctorId` er den server-udledte.
- 🟡 Aflys en booking → tid frigives, klinik + venteliste notificeres.

## 7. Valgfrit / senere (ikke blokerende)
- 🟢 Udtræk delt `assets/site.css` for hovedsiderne via et build-step (ikke en risikabel masse-udtrækning).
- 🟢 Finjuster "Book nu, [pris]"-knaptekst hvis I vil understrege "betaling først efter bekræftet tid".
