# Aevias eget booking-system (alternativ til Cal.com)

Et fuldt integreret bookingsystem bygget ind i sitet — ingen Cal.com, ingen ekstern
konto. Kunden vælger område → dato → tid → indtaster oplysninger → tiden er
reserveret med det samme, bekræftelse + betalingslink sendes på mail, og klinik/
kontakt@aevia.dk får besked. Alt sker på aevia.dk.

## Sådan virker det

- **Frontend:** widget øverst på `book.html` / `en/book.html` (id `aev-booking`).
  Den **viser sig kun**, hvis datalageret er konfigureret OG mindst ét område er
  sat `ready=true`. Ellers er den skjult, og det eksisterende flow (Cal.com /
  mail) kører videre. Det live site kan altså ikke knække af at koden ligger der.
- **API:**
  - `GET /api/slots` — områdeliste + ledige tider pr. område.
  - `POST /api/book-slot` — reserverer atomisk (ingen dobbeltbooking) + mails.
  - `GET/POST /api/admin-bookings` — token-beskyttet oversigt + aflys.
- **Datalager:** Upstash Redis via REST (serverless-venligt, gratis tier).
- **Tilgængelighed:** styres ét sted — `AREAS`-objektet i `api/_booking-store.js`.

## Opsætning (engangs, ~10 min)

1. **Opret Redis-database**
   - Nemmest: Vercel → projekt → **Storage** → **Create** → **Upstash Redis** →
     vælg region **eu-west** (Frankfurt). Vercel sætter automatisk
     `KV_REST_API_URL` og `KV_REST_API_TOKEN` som miljøvariabler.
   - Alternativt: opret gratis på upstash.com, og kopiér "REST API" URL + token
     manuelt ind i Vercel → Environment Variables.
2. **Sæt admin-token:** Vercel → Environment Variables → `ADMIN_TOKEN` =
   en lang tilfældig streng (`openssl rand -hex 32`). Gem den i din password manager.
3. **Åbn et område for booking:** i `api/_booking-store.js`, find `AREAS` og sæt
   `ready: true` på det område, en klinik er klar i. Justér samtidig:
   - `wd`: ugedage (0=søn … 6=lør) klinikken tager Aevia-kunder
   - `open` / `close`: tidsrum (fx "08:00" / "12:00")
   - `slot`: minutter pr. tid (fx 30)
   - `cap`: hvor mange kan bookes pr. tid (typisk 1)
   - `lead`: min. dage frem før første bookbare dag
   - `clinic`: klinikkens e-mail (får notifikation; tom = alt til kontakt@aevia.dk)
4. **Commit + push.** Widgeten går live for det/de åbne områder.

## Daglig drift

- **Se/aflys bookinger:** åbn `https://aevia.dk/admin-bookinger.html`, indtast
  `ADMIN_TOKEN`, vælg område + dato. Aflysning frigiver tiden igen med det samme.
- **Skift en kliniks tider:** ret `AREAS` og push. (Senere kan dette flyttes til
  et rigtigt admin-panel, hvis klinikkerne selv skal styre det.)

## Forhold til Cal.com-løsningen

De to systemer udelukker ikke hinanden. Områder uden `ready:true` her bruger fortsat
Cal.com-/mailflowet (se KLINIK-SYSTEM.md). I kan rulle det egne system ud område for
område og beholde Cal.com som fallback, indtil I er trygge.

## Fuldt funktionssæt (bygget juni 2026)

| Funktion | Hvordan |
|---|---|
| Kalenderfil (.ics) i bekræftelsesmail | Automatisk vedhæftet — tiden lander i kundens kalender med 12-timers faste-alarm |
| Flyt/aflys-selvbetjening | Signeret link i alle mails → `api/min-booking.js`; aflysning frigiver tiden med det samme |
| Påmindelse dagen før | Cron `api/booking-remind.js` (kl. 5 UTC) — fasteguide + flyt/aflys-link |
| Dagsrapport til klinik | Samme cron: morgenmail med dagens bookinger (tid, navn, pakke, kontakt) |
| Venteliste | Ingen ledige tider → skriv-mig-op-form; ved enhver aflysning mailes hele listen (først til mølle) og tømmes |
| Knaphedsvisning | "Kun X ledige tider de næste 7 dage" vises automatisk ved < 6 tider |
| Klinik-portal | `klinik-portal.html` + `CLINIC_TOKENS` — klinikken ser dagens bookinger og blokerer/frigiver tider selv |
| Betaling koblet til booking | Stripe-checkout får `booking_id` i metadata (`?bid=`) |
| GA4-events | `booking_area_resolved`, `booking_pkg_selected`, `booking_slot_selected`, `booking_completed`, `waitlist_signup` |

### Klinik-portal — opsætning pr. klinik
1. Generér en nøgle: `openssl rand -hex 24`
2. Vercel → `CLINIC_TOKENS` = JSON: `{"<nøglen>":"Herning-området"}` (tilføj flere par for flere klinikker)
3. Send klinikken linket `https://aevia.dk/klinik-portal.html` + deres nøgle (sikker kanal)
4. De kan nu: se dagens bookinger, blokere enkelt-tider og hele dage (ferie/sygdom)

## Ikke bygget endnu (kræver eksterne valg)

- **SMS-påmindelser** — kræver dansk SMS-gateway-konto (fx GatewayAPI/Inmobile, ~0,30 kr./SMS). Krogen er klar: tilføj SMS-kald i `booking-remind.js`.
- **Google/Outlook kalender-sync pr. klinik** — kræver OAuth-opsætning pr. klinik; byg når 2-3 klinikker er live. Indtil da dækker klinik-portalens blokering behovet.
- **No-show-gebyr (Stripe Setup Intent)** — forretningsbeslutning + opdatering af handelsbetingelser først.

## Begrænsninger (bevidste, for at holde det simpelt)

- Tilgængelighed er regelbaseret (faste ugedage/tider), ikke synkroniseret med
  klinikkens egen Google/Outlook-kalender. Dobbeltbooking på Aevia-siden er umulig,
  men hvis klinikken selv booker noget i samme tid uden for Aevia, skal de blokere
  den tid hos jer (eller I sænker `cap`). En rigtig kalender-sync er næste niveau.
- Ingen automatiske påmindelser endnu (kan tilføjes via en Vercel-cron, der læser
  næste dags bookinger og mailer dem — samme mønster som `api/drip.js`).

## Filer

- `api/_booking-store.js` — config + datalager + slot-logik (rør `AREAS` her)
- `api/slots.js` — ledige tider (GET)
- `api/book-slot.js` — reservation + mails m. .ics + flyt/aflys-link (POST)
- `api/min-booking.js` — kundens selvbetjening (signeret link)
- `api/waitlist.js` — venteliste-tilmelding
- `api/booking-remind.js` — cron: påmindelser + klinik-dagsrapport
- `api/clinic-portal.js` + `klinik-portal.html` — klinikkens egen side
- `api/admin-bookings.js` + `admin-bookinger.html` — jeres admin
- `book.html` / `en/book.html` — widget `#aev-booking`
