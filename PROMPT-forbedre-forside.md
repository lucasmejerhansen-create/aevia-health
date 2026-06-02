# Prompt: Forbedr Aevia Health-hjemmesiden

Kopiér alt herunder og giv det til dit site-værktøj.

---

Du er senior konverterings- og UX-designer. Forbedr den eksisterende **Aevia Health**-hjemmeside (longevity- og helbredsdiagnostik for danske erhvervsledere og virksomheder). Behold den nuværende premium-stil (mørk navy #0a1628 + guld #c9a437, serif-overskrifter Playfair Display, sans Inter). Mobile-first. Alt indhold på dansk.

## Mål (forbedr disse, i prioriteret rækkefølge)

1. **Konvertering:** Tilføj en social proof-sektion på forsiden (kundecitater med titel/alder, anonymiseret eksempel-resultat, logoer på akkrediterede partner-laboratorier, en navngiven ansvarlig læge med titel). Brug KUN ægte indhold — opfind ALDRIG anmeldelser eller resultater. Hvis et ægte element mangler, så indsæt en tydelig `<!-- TODO: indsæt ægte X -->` i stedet for at finde på noget.
2. **Risk-reducers ved hver primær CTA:** tilføj mikrotekst som "Ingen binding · Fortroligt · Svar inden for 24 timer".
3. **Pris-anker tidligt:** vis "fra 8.900 kr." nær hero.
4. **SEO:** behold unikke title + meta-description + præcis ét `<h1>` pr. side. Tilføj `LocalBusiness`-schema (JSON-LD) med adresse Bredgade 11, 7400 Herning, telefon +45 28 30 39 33 og åbningstider. Link fra hver indsigter-artikel til den relevante pakke.
5. **Hastighed:** lever billeder som WebP/AVIF med `width`/`height` (undgå layout-hop), `loading="lazy"` på alt under folden (men IKKE på hero-billedet), `preload` på hero-billede og primær skrifttype. Hold scripts `async`/`defer`.
6. **Tilgængelighed:** bevar synligt tastatur-fokus og `prefers-reduced-motion`.

## Hårde regler — må ALDRIG ændres eller fjernes

- **Købsknapperne** på `pakker.html`, `index.html` og `privat.html` SKAL pege på `/api/checkout?pkg=core|executive|elite` (ikke `book.html`, ikke Stripe-links). Bevar `class="btn btn-primary buy-btn"`, `data-pkg` og `data-base`.
- **Tilvalg-blokkene** (`<div class="addons">` med checkboxes `data-addon`/`data-price`) på Core og Executive SKAL bevares uændret, og det tilhørende `<script>` der opdaterer pris + checkout-link.
- Mappen **`api/` og `api/checkout.js` må IKKE røres** (det er Stripe-betalingsfunktionen).
- **Domænet er `aevia.dk`** (enkelt-a). Brug det i ALLE canonical-links, og:url, og:image, schema og mailadresser (`kontakt@aevia.dk`). Skriv ALDRIG "aeviaa", "aivea" eller "aeviahealth.dk".
- **Adresse:** Bredgade 11, 7400 Herning. **Telefon:** +45 28 30 39 33 (`tel:+4528303933`). Brug samme overalt.
- **Ingen lange tankestreger (—)** i teksten — brug komma eller punktum. (En-dash i prisintervaller som 8.900–29.900 er ok.)
- Behold de tre faste pakker og priser: Core 8.900, Executive 14.900, Elite 29.900 DKK (ekskl. moms). Virksomhedsaftaler kun via kontakt.
- Ingen lorem ipsum, ingen placeholder-billeder. Produktionsklar HTML/CSS/JS.

## Output

Lever de færdige, opdaterede HTML-filer (statisk site, ingen build). Bevar eksisterende filnavne og struktur. Skriv til sidst en kort liste over hvad du ændrede, og hvilke `TODO`-felter jeg selv skal udfylde med ægte materiale.
