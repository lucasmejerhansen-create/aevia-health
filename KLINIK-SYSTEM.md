# Klinik-bekræftelsessystem

Et bookingsystem klinikkerne kan bruge **uden eget IT-system** — alt de behøver er
en e-mail. Ingen database, ingen logins: links er kryptografisk signerede (HMAC),
så de ikke kan forfalskes.

## Sådan virker flowet

1. **Kunden** udfylder sit forløb på `book.html` og sender formularen.
   → `api/booking.js` kører (Formspree får stadig en kopi som backup).
2. **Kunden** får straks en mail: "Vi koordinerer nu din tid — du betaler først, når tiden er bekræftet."
3. **Klinikken** (eller jer selv, indtil klinikker er koblet på) får en mail med
   kundens ønskede forløb og en guld-knap: **"Bekræft eller foreslå tid"**.
4. Knappen åbner `klinik-bekraeft.html` — en simpel side hvor klinikken vælger
   dato, tid, sted og evt. besked, og trykker **Bekræft**.
5. → `api/booking-action.js` sender automatisk den endelige bekræftelse til kunden
   **med betalingslink** (Stripe checkout for den rigtige pakke), kopi til kontakt@aevia.dk.
   Trykker klinikken "Vi kan ikke", får I besked og finder en anden løsning.

## Opsætning (Vercel → Environment Variables)

| Variabel | Værdi |
|---|---|
| `BOOKING_SECRET` | En lang tilfældig streng (fx 40+ tegn) — signerer links |
| `RESEND_API_KEY` | Samme som til webhook-mails (se EMAIL-SETUP.md) |
| `MAIL_FROM` | `Aevia <kontakt@aevia.dk>` |
| `CLINIC_CONTACTS` | Valgfri JSON: `{"Aarhus-området":"lab@klinik.dk","_default":"kontakt@aevia.dk"}` |

**Uden `CLINIC_CONTACTS`** går alle bekræftelses-mails til kontakt@aevia.dk — så
fungerer systemet som jeres interne koordineringsværktøj fra dag ét, og I videresender
bare mailen til klinikken. Når en klinik er fast partner, tilføjer I deres e-mail i
JSON'en, og de bekræfter selv direkte.

## Sikkerhed

- Links indeholder al booking-data signeret med HMAC-SHA256 — kan ikke ændres eller forfalskes.
- Links udløber efter 30 dage.
- `klinik-bekraeft.html` er `noindex` og virker kun med et gyldigt token.
- Ingen helbredsdata indgår — kun navn, kontakt og ønsket forløb.

## Filer

- `api/booking.js` — modtager forespørgsel, sender kunde-kvittering + klinik-mail
- `api/booking-action.js` — modtager klinikkens svar, sender bekræftelse + betalingslink
- `klinik-bekraeft.html` — klinikkens bekræftelsesside
- `book.html` / `en/book.html` — formularen poster nu også til `/api/booking`
