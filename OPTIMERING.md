# Aevia Health — optimeringsplan (CRO · SEO · design · hastighed)

Baseret på en faktisk gennemgang af alle 25 sider. Prioriteret efter effekt.

## Hvad der allerede er stærkt (rør ikke)

Sitet er teknisk velbygget: hver side har unik `<title>` og meta-description, præcis ét `<h1>`, billeder har alt-tekst og lazy-load, eksterne scripts er `async`, der er FAQ-schema, cookie-samtykke, AI-chat, tastatur-fokus og sticky mobil-CTA. Sitemap og robots peger korrekt på aevia.dk. Det er et solidt fundament, så optimering handler om finpudsning, ikke ombygning.

## Allerede rettet i denne omgang

- **Twitter/X-delingstags** tilføjet på alle 24 offentlige sider (`twitter:card`), så links deler pænt med billede på X. Resten arves fra de eksisterende Open Graph-tags.

---

## 1. Konvertering (CRO) — størst effekt

1. **Social proof mangler helt.** Der er ingen anmeldelser, cases eller resultater på forsiden, og det er typisk det enkeltstående, der løfter konvertering mest på en high-ticket sundhedsydelse. Tilføj — men **kun ægte** materiale:
   - 2–3 rigtige kundecitater (med tilladelse, gerne titel: "CEO, 48 år").
   - Et anonymiseret eksempel-resultat ("biologisk alder sænket fra 49 → 44 på 6 mdr").
   - Logoer på de akkrediterede laboratorier/partnere I bruger (I har dem i `Partnere-leverandoerer-DK.md`).
   - En navngiven, ansvarlig læge med titel og billede — afgørende for tillid i sundhed.
   > Jeg kan kode sektionen med det samme — jeg mangler bare de ægte tekster/navne/logoer fra dig.

2. **Risk-reducers ved CTA.** Tilføj en lille linje under "Book dit helbredstjek": *"Ingen binding · Fortroligt · Svar inden for 24 timer."* Fjerner tøven lige før klik. (Kan kodes nu.)

3. **Pris-anker tidligt.** Vis "fra 8.900 kr." nær hero, så prisforventning sættes med det samme og afviser ikke-kvalificerede leads.

4. **Én primær handling pr. side.** I dag konkurrerer "Book" og "Køb nu" nogle steder. Overvej at gøre "Book en samtale" sekundær (ghost-knap) og købet primært på pakkesiden — eller omvendt, afhængigt af om I helst vil sælge online eller via samtale.

## 2. SEO

1. ✅ Twitter cards tilføjet.
2. **LocalBusiness/Organization-schema** med den nye adresse (Bredgade 11, 7400 Herning), telefon og åbningstider, så Google viser jer korrekt i lokale resultater. Tjek at navn/adresse/telefon (NAP) er identisk overalt. (Kan kodes nu.)
3. **Udnyt jeres indsigter-artikler** til intern linking: link fra hver artikel til den relevante pakke (fx "biologisk alder" → Core). Styrker både SEO og konvertering.
4. **Google Search Console + sitemap-indsendelse**, når aevia.dk er live, så I kommer i indeks hurtigt.

## 3. Design & visuelt

1. **Ægte fotografi** er det største visuelle løft. Hvis billederne i dag er illustrative/stock, vil rigtige fotos af klinik, udstyr eller læge øge tilliden markant. (Kræver dine billeder.)
2. Layout, typografi og spacing er allerede konsistent og premium — ingen akut indsats nødvendig.
3. Overvej en kort video eller animeret graf af "biologisk alder"-rapporten på forsiden som blikfang.

## 4. Hastighed & teknik

1. **Billedformat:** Lever hero- og sektionsbilleder som **WebP/AVIF** med `width`/`height` angivet, så der ikke sker layout-hop (CLS) under indlæsning. Største tekniske gevinst.
2. **Preload** hero-billedet og den primære skrifttype, så "above the fold" tegnes hurtigere.
3. Scripts er allerede `async` — godt.
4. Kør en **Lighthouse-test** (i Chrome → Inspect → Lighthouse), når sitet er live på aevia.dk, og sigt efter 90+ på alle fire mål.

---

## Forslag til rækkefølge

1. Risk-reducer ved CTA + pris-anker (hurtigt, kan kodes nu).
2. LocalBusiness-schema med Herning-adressen (kan kodes nu).
3. Social proof-sektion (jeg koder, du leverer ægte citater/logoer/læge).
4. WebP-billeder + preload (kræver dine billedfiler).

Sig hvilke punkter jeg skal implementere i koden, så går jeg i gang. Punkt 1 og 2 kan jeg lave med det samme uden input fra dig.
