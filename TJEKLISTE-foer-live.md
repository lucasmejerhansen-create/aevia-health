# Aevia Health — tjekliste før I er 100% live

Status: betaling (Stripe), booking (Cal.com), formularer (Formspree), domæne (aevia.dk),
billeder, logo og forsideforbedringer er på plads i koden. Herunder det, der mangler.

## 1. Skal gøres nu (ellers ses ændringerne ikke)

- [ ] **Læg alle filer op i GitHub** (hele `Aevia Health`-mappen inkl. `api/` og `assets/`).
      Uden dette er intet af det nye live. Vercel genudgiver automatisk.
- [ ] **Tilføj `aevia.dk` i Vercel** → Settings → Domains, og bekræft at DNS hos Simply er slået igennem (https virker).
- [ ] Sæt `SITE_URL=https://aevia.dk` i Vercel → Environment Variables, og redeploy.

## 2. Før I tager rigtige penge

- [ ] **Stripe live-nøgle:** skift `STRIPE_SECRET_KEY` fra `sk_test_…` til `sk_live_…` i Vercel, redeploy.
- [ ] **Moms:** aktivér Stripe Tax og sæt `STRIPE_ENABLE_TAX=true`, så 25% lægges på.
- [ ] **MobilePay + Apple/Google Pay:** slå dem til i Stripe → Settings → Payment methods.
- [ ] **Handelsbetingelser mangler helt** (juridisk krav ved online salg i DK): pris, levering,
      betaling, fortrydelsesret/afbestilling, klageadgang. Jeg kan skrive et udkast — få det
      gennemlæst af en jurist før brug. *(Sundhedsydelser har særlige regler om fortrydelsesret.)*
- [ ] **Test live:** ét rigtigt testkøb + én formular-indsendelse (bekræft Formspree-mailen) + én booking.

## 3. Troværdighed & måling

- [ ] **Mail:** opret `kontakt@aevia.dk` i Google Workspace + MX/SPF/DKIM/DMARC (se GO-LIVE-guiden).
- [ ] **Analytics:** indsæt rigtigt GA4-id (`G-…`) og evt. Microsoft Clarity-id, ellers fjern sporingen.
      (Cookie-samtykket er korrekt sat op — analytics loader først ved "Accepter alle".)
- [ ] **Privatlivspolitik:** tjek at den nævner de databehandlere I reelt bruger
      (Stripe, Formspree, Cal.com, Google) og GDPR art. 9 for helbredsdata.
- [ ] **CVR 45 12 88 02:** bekræft at det er jeres rigtige CVR (står i footer overalt).

## 4. Vækst (når basis er live)

- [ ] **Social proof:** ægte kundecitater, navngiven ansvarlig læge med billede, partner-logoer.
- [ ] Udskift de 3 udefra-billeder under "ydelser" med jeres egne, så alt er Aevias eget materiale.
- [ ] **Favicon → logo:** brug det nye Aevia-ikon i browserfanen.
- [ ] **AI-chat:** kobl en rigtig AI-backend på (valgfrit — virker fint på vidensbase nu).
- [ ] Indsend sitemap i Google Search Console, når domænet er live.

## Hvad jeg kan lave for dig uden mere input
- Udkast til **handelsbetingelser** (med juridisk forbehold).
- Indsætte **GA4/Clarity-id** når du har dem.
- Bygge **social proof-sektionen** når du har ægte citater/logoer/lægenavn.
- Skifte **favicon** til logoet.
