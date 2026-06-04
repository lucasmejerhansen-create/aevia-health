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
2. Åbn `book.html` → find `CLINIC_EVENTS` (nederst) → indsæt slug på området:
   `'Aarhus-området':'jeresklinik/aevia'`.
3. Commit + push. Kunder i det område ser nu "Se ledige tider & book med det samme"
   med klinikkens live-kalender. Områder uden slug kører videre på
   mail-bekræftelsesflowet (KLINIK-SYSTEM.md).
