# Aevia Health — Go-live: domæne, hosting & mail

Denne guide tager Aevia Health fra "ligger på min computer" til "live på nettet med
professionel mail". Tre dele, i rækkefølge:

1. **Domæne** — køb `aevia.dk`
2. **Hosting** — sæt sitet live på Vercel og peg domænet derhen
3. **Mail** — opret `kontakt@aevia.dk` med Google Workspace

> **Brandbeslutning (vigtigt):** Brandet staves **Aevia** (a-e-v-i-a) — ikke "aivea".
> Hele sitet, alle links og mailadresser bruger `aevia.dk`. Hold dig til den ene
> stavemåde overalt, ellers forvirrer du kunder og søgemaskiner.

---

## Del 1 — Køb domænet `aevia.dk`

`.dk`-domæner kræver en dansk registrant (CVR eller CPR) og administreres via en
DK Hostmaster-godkendt forhandler.

**Anbefalede udbydere:** [Simply.com](https://www.simply.com) eller [one.com](https://www.one.com)
(begge danske, nem flade, support på dansk).

1. Søg `aevia.dk` hos udbyderen og bekræft at den er ledig. *(Jeg kunne ikke verificere
   ledighed automatisk — registrarens søgning er det endelige svar.)*
2. Køb den (typisk ~30–60 kr/år for selve .dk-afgiften + udbyderens gebyr).
3. Overvej at købe `aevia.dk` og `aeviahealth.com` samtidig og sætte dem til at redirecte
   til hoveddomænet — så ingen kaprer de nære varianter.

Du skal **ikke** købe webhotel/hosting-pakken hos dem — hosting klares gratis af Vercel
(Del 2). Du skal kun bruge dem til at eje domænet og styre DNS.

---

## Del 2 — Hosting på Vercel

Sitet har en betalingsfunktion (`/api/checkout`), så det skal hostes et sted der kan køre
serverless-funktioner. **Vercel er gratis og bygget til netop dette.**

### 2a. Læg sitet op
1. Opret konto på [vercel.com](https://vercel.com) (log ind med Google).
2. Upload mappen `Aevia Health`:
   - **Uden Git (nemmest):** Installer Node fra [nodejs.org](https://nodejs.org). Åbn Terminal,
     skriv `cd ` (med mellemrum), træk mappen `Aevia Health` ind, tryk Enter. Kør `npx vercel`
     og svar Enter til alle spørgsmål.
   - **Via GitHub:** Læg mappen i et repo → Vercel: **Add New → Project** → vælg repo → **Deploy**.
3. Du får en `…vercel.app`-adresse — tjek at siderne loader.

### 2b. Peg dit domæne på Vercel
1. I Vercel: dit projekt → **Settings → Domains** → tilføj `aevia.dk`.
2. Vercel viser de DNS-records, du skal oprette **hos din domæneudbyder** (Simply/one.com).
   Det er typisk disse værdier (bekræft altid det Vercel viser for dit projekt):

   | Type | Navn/Host | Værdi | Bemærkning |
   |------|-----------|-------|------------|
   | `A` | `@` | `76.76.21.21` | Apex-domænet (aevia.dk). Brug den IP Vercel viser. |
   | `CNAME` | `www` | `cname.vercel-dns.com` | Så www. også virker |

3. Gem hos udbyderen. DNS slår igennem på typisk 30–60 min (op til nogle timer).
4. Vercel udsteder automatisk gratis SSL (https), når domænet er verificeret.

### 2c. Sæt Stripe-nøglen ind
Følg `STRIPE-SETUP.md` (Trin 2–6): læg `STRIPE_SECRET_KEY` og `SITE_URL=https://aevia.dk`
ind under **Settings → Environment Variables** i Vercel, og redeploy.

---

## Del 3 — Professionel mail med Google Workspace

Giver dig `kontakt@aevia.dk` (og flere) i en Gmail-flade, med kalender og Drive.
Pris: ~55 kr/bruger/md (Business Starter).

### 3a. Opret kontoen
1. Gå til [workspace.google.com](https://workspace.google.com) → **Kom godt i gang**.
2. Angiv `aevia.dk` som dit domæne (du ejer det allerede fra Del 1).
3. Opret din første bruger, fx `kontakt@aevia.dk`.

### 3b. Verificér domænet + aktivér mail (DNS hos din udbyder)
Google beder dig oprette nogle DNS-records hos din domæneudbyder. Opret disse:

**MX (modtag mail) — den nye, simple opsætning:**

| Type | Navn/Host | Prioritet | Værdi |
|------|-----------|-----------|-------|
| `MX` | `@` | `1` | `smtp.google.com` |

**TXT (verifikation + afsenderbeskyttelse) — vigtigt for at kvitteringer ikke ryger i spam:**

| Type | Navn/Host | Værdi |
|------|-----------|-------|
| `TXT` | `@` | Googles verifikationsstreng (`google-site-verification=…`, vises i opsætningen) |
| `TXT` | `@` | `v=spf1 include:_spf.google.com ~all` (SPF) |
| `TXT` | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:kontakt@aevia.dk` (DMARC) |

**DKIM:** Aktiveres i Google Admin (**Apps → Google Workspace → Gmail → Authenticate email**).
Google genererer en `TXT`-record (host `google._domainkey`) som du indsætter hos udbyderen.

> Sæt **alle tre** (SPF, DKIM, DMARC) op. Det er det, der får jeres mails til at lande i
> indbakken i stedet for spam — kritisk når I sender ordrekvitteringer.

### 3c. Tjek at det virker
- Send en testmail til og fra `kontakt@aevia.dk`.
- Mailrecords slår typisk igennem på 30–60 min (op til 72 timer i værste fald).

---

## Rækkefølge og tjekliste

- [ ] Køb `aevia.dk` (Del 1)
- [ ] Deploy site til Vercel og bekræft `…vercel.app` virker (Del 2a)
- [ ] Tilføj domæne i Vercel + opret A/CNAME hos udbyder (Del 2b)
- [ ] Læg Stripe-nøgle + `SITE_URL` ind, test betaling (Del 2c + STRIPE-SETUP.md)
- [ ] Opret Google Workspace + MX/SPF/DKIM/DMARC (Del 3)
- [ ] Send testmail og testkøb → I er live

## Hvad det koster (ca., årligt)

| Post | Pris |
|------|------|
| Domæne `aevia.dk` | ~50–150 kr/år |
| Hosting (Vercel Hobby) | 0 kr |
| Mail (Google Workspace, 1 bruger) | ~660 kr/år |
| Stripe | 0 kr fast — ~1,4 % + 1,80 kr pr. korttransaktion |

> **Bemærk:** Alle DNS-records (Vercel + Google) sættes op samme sted — hos din
> domæneudbyder. Det er ét kontrolpanel, du skal lære at finde: "DNS" eller "DNS-indstillinger".
