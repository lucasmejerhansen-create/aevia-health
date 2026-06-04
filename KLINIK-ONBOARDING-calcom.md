# Til partnerklinikker: Sæt jeres ledige tider op på 5 minutter

Kære partner

For at Aevias kunder kan booke prøvetagning hos jer med øjeblikkelig bekræftelse,
bruger vi Cal.com — et gratis kalenderværktøj. I skal hverken installere noget
eller ændre jeres egne systemer. Opsætningen tager ca. 5 minutter, og bagefter
passer den sig selv.

## Sådan gør I (én gang)

**1. Opret en gratis konto (1 min)**
Gå til cal.com → "Sign up" → brug klinikkens fælles e-mail.

**2. Fortæl hvornår I kan tage Aevia-kunder (2 min)**
Under **Availability** sætter I jeres tider — fx "tirsdag og torsdag 08:00-12:00".
Det er KUN de tider, Aevia-kunder kan booke; jeres øvrige kalender er urørt.

**3. Forbind evt. jeres kalender (valgfrit, 1 min)**
Under **Apps** kan I forbinde Google Kalender eller Outlook. Så skjules tider
automatisk, når I er optaget — og dobbeltbookinger bliver umulige. (Kan springes
over; så styrer Availability alene.)

**4. Send os jeres link (1 min)**
Under **Event Types** ligger jeres booking-link, fx `cal.com/jeresklinik/aevia`.
Send det til kontakt@aevia.dk — så kobler vi det på aevia.dk samme dag.

**5. Tilføj Aevias webhook (1 min)**
Så vi automatisk kan sende kunden bekræftelse og betalingslink, når en tid bookes:
Gå til **Settings → Developer → Webhooks → New Webhook** og indtast:
- Subscriber URL: `https://aevia.dk/api/cal-webhook`
- Event triggers: **Booking Created** og **Booking Cancelled**
- Secret: *(vi sender jer den sammen med denne guide)*
Klik Save — færdig. I skal ikke gøre mere ved den.

## Hvad sker der, når en kunde booker?

- I får straks en mail + kalenderinvitation med kundens navn og det aftalte.
- Kunden er forudbetalt og har fået forberedelsesguide af os (faste osv.).
- Aflysning/flytning sker med ét klik i invitationen — kunden får automatisk besked.
- I skal aldrig håndtere betaling — det ligger hos Aevia.

## Spørgsmål?

Skriv til kontakt@aevia.dk eller ring +45 28 30 39 33 — vi sætter det gerne op
sammen med jer over en kort videosamtale.

Mvh.
Aevia · aevia.dk

---

### Internt (Aevia): aktivering af en klinik

1. Modtag klinikkens Cal.com-link, fx `jeresklinik/aevia`.
2. Send dem webhook-secret'en (værdien af `CAL_WEBHOOK_SECRET` i Vercel) til trin 5,
   og tjek at webhooken er oprettet på deres konto (bed evt. om et screenshot).
3. Åbn `book.html` → find `CLINIC_EVENTS` (nederst) → indsæt slug på området:
   `'Aarhus-området':'jeresklinik/aevia'`.
4. Commit + push. Kunder i det område ser nu klinikkens live-kalender indlejret
   direkte i booking-rejsen — tiden bekræftes med det samme, og `api/cal-webhook.js`
   sender automatisk bekræftelse + Stripe-betalingslink til kunden (kopi til
   kontakt@aevia.dk). Områder uden slug kører videre på mail-bekræftelsesflowet
   (KLINIK-SYSTEM.md).
5. Book en testtid i klinikkens kalender og tjek, at mail + betalingslink kommer.

Bemærk: hoster I selv eventet på Aevias egen Cal.com-konto (fx round-robin pr.
område), skal webhooken kun oprettes dér én gang — så kan trin 5 i kundeguiden
springes over.
