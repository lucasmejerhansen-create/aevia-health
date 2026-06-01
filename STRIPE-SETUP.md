# Stripe-opsætning for Aevia Health

Denne guide tager dig fra nul til virkende online-betaling. Det er kun ~20 minutter, og
du skal ikke kunne kode. Det meste af arbejdet er klikket på plads — du skal bare oprette
en Stripe-konto, kopiere én nøgle ind og slå det rigtige til.

## Sådan virker det (kort)

Når en kunde trykker **"Køb nu"** på `pakker.html` (eller forsiden / privat-siden), sendes
de til en lille funktion på jeres site, `/api/checkout`, som opretter en sikker
betalingsside hos Stripe og sender kunden derhen. Efter betaling lander de på
`success.html`. Stripe håndterer kort, kvittering, sikkerhed og (hvis I slår det til)
MobilePay og moms.

De tre pakker er sat op som **engangsbetalinger** (ikke abonnement):

| Pakke | Beløb (ekskl. moms) | Link på knappen |
|-------|---------------------|-----------------|
| Aevia Core | 8.900 DKK | `/api/checkout?pkg=core` |
| Aevia Executive | 14.900 DKK | `/api/checkout?pkg=executive` |
| Aevia Elite | 29.900 DKK | `/api/checkout?pkg=elite` |

Virksomhedsaftaler går fortsat via kontakt — de er bevidst ikke lagt online.

---

## Trin 1 — Opret en Stripe-konto

1. Gå til [stripe.com](https://stripe.com) og opret en konto med Aevias e-mail.
2. Vælg **Danmark** som land og **DKK** som valuta.
3. Udfyld virksomhedsoplysninger (CVR, adresse, bankkonto). Det kan gøres senere, men
   udbetalinger kræver det.

Du kan teste alt, *før* kontoen er fuldt godkendt, ved at bruge **testtilstand** (se trin 5).

## Trin 0 — Få sitet online på Vercel (gør dette først)

Sitet skal hostes et sted, der kan køre serverless-funktioner. **Vercel er gratis og bygget
til netop dette** (statisk site + `/api/checkout`). Et almindeligt statisk webhotel kan ikke
køre funktionen — så vælg Vercel.

1. Opret en konto på [vercel.com](https://vercel.com) (log ind med Google eller GitHub).
2. Læg projektmappen `Aevia Health` op — vælg én af de to måder:
   - **Nemmest (uden Git):** Installer Node fra [nodejs.org](https://nodejs.org). Åbn Terminal,
     skriv `cd ` (med mellemrum), træk mappen `Aevia Health` ind i vinduet og tryk Enter.
     Kør så `npx vercel` og svar Enter til alle spørgsmål. Den uploader og giver dig en live-URL.
   - **Via GitHub:** Læg mappen i et GitHub-repo → i Vercel: **Add New → Project** → vælg
     repoet → **Deploy**.
3. Du får nu en `…vercel.app`-adresse. Det er dit live site. Tjek at siderne loader.
4. Fortsæt med Trin 1–6 herunder.
5. **Eget domæne:** Når alt virker, gå til **Settings → Domains** i Vercel og tilføj
   aevia.dk. Vercel viser de DNS-records, du skal sætte hos din domæneudbyder.
   Opdatér derefter `SITE_URL` (trin 3) til `https://aevia.dk`.

## Trin 2 — Hent din hemmelige nøgle

1. I Stripe-dashboardet: **Developers → API keys**.
2. Kopiér **Secret key**. Den starter med `sk_test_...` (test) eller `sk_live_...` (live).
3. Hold den hemmelig. Læg den **aldrig** i en HTML-fil eller på GitHub — kun i Vercel (næste trin).

## Trin 3 — Læg nøglen ind i Vercel

Sitet hostes på Vercel, og det er dér funktionen kører.

1. Gå til dit projekt på [vercel.com](https://vercel.com) → **Settings → Environment Variables**.
2. Tilføj disse tre (se også filen `.env.example`):

   | Navn | Værdi | Forklaring |
   |------|-------|------------|
   | `STRIPE_SECRET_KEY` | `sk_test_...` | Din hemmelige nøgle fra trin 2 |
   | `SITE_URL` | `https://aevia.dk` | Sitets adresse (ingen skråstreg til sidst) |
   | `STRIPE_ENABLE_TAX` | `false` | Lad stå på `false` indtil moms er sat op (trin 6) |

3. Gem og **redeploy** projektet, så nøglerne træder i kraft.

> Vercel installerer automatisk `stripe`-pakken fra `package.json` og kører `/api/checkout.js`
> som en serverless-funktion. Du skal ikke installere noget selv.

## Trin 4 — Aktivér MobilePay og Apple/Google Pay (anbefalet i DK)

1. I Stripe: **Settings → Payment methods**.
2. Slå **MobilePay**, **Apple Pay** og **Google Pay** til, plus **kort** (Visa/Mastercard).
3. De dukker automatisk op på betalingssiden — du skal ikke ændre kode.

MobilePay øger konverteringen markant på danske sites, så det er værd at have med.

## Trin 5 — Test før I går live

1. Sørg for at `STRIPE_SECRET_KEY` er din **test**-nøgle (`sk_test_...`).
2. Åbn `pakker.html` på det deployede site og tryk **"Køb nu"**.
3. Brug Stripes testkort: **4242 4242 4242 4242**, en vilkårlig fremtidig udløbsdato,
   vilkårlig CVC og postnummer.
4. Du bør lande på `success.html`, og betalingen ses i Stripe under **Payments** (testtilstand).

Når det virker: skift `STRIPE_SECRET_KEY` til **live**-nøglen (`sk_live_...`) i Vercel og redeploy.

## Trin 6 — Moms (når I er klar)

Priserne på sitet er **ekskl. moms**. For at lægge 25% dansk moms oven i ved betaling:

1. I Stripe: **Settings → Tax** → aktivér **Stripe Tax**, og angiv Aevias adresse som
   afsenderland (Danmark).
2. Sæt `STRIPE_ENABLE_TAX=true` i Vercel og redeploy.

Funktionen tilføjer så automatisk moms på betalingssiden. Indtil det er gjort, betaler
kunden kun det viste beløb (uden moms) — fint i testfasen, men husk at slå det til inden live.

---

## Hvis noget driller

- **"Kunne ikke starte betalingen"** → Tjek at `STRIPE_SECRET_KEY` er sat korrekt i Vercel,
  og at projektet er redeployet bagefter.
- **Knappen gør ingenting / 404** → Filen `api/checkout.js` skal ligge i mappen `api/` i
  projektets rod, og sitet skal være deployet på Vercel (funktioner virker ikke ved at åbne
  filen lokalt i browseren).
- **Forkert beløb** → Beløbene står i `api/checkout.js` i øre (8.900 kr = `890000`). Ret dér
  hvis priserne ændres, og opdatér teksten på knapperne i HTML-filerne.

## Filer i denne opsætning

- `api/checkout.js` — opretter betalingssiden (rør kun ved beløbene hvis priserne ændres)
- `success.html` — kvitteringsside efter betaling
- `package.json` — fortæller Vercel at `stripe` skal installeres
- `.env.example` — skabelon for de tre miljøvariabler
- `pakker.html`, `index.html`, `privat.html` — købsknapper peger nu på `/api/checkout`
