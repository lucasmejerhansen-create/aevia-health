# Aevia Health — fuld site-gennemgang

**Dato:** 1. juni 2026
**Omfang:** Alle 27 HTML-sider i `/Aevia Health/` + 27 sider i `/en/`, assets, sitemap, robots, config.
**Metode:** Systematisk scanning af links, assets, alt-tekster, SEO-tags, sprog, brand, priser, placeholders + stikprøvelæsning.

---

## Hovedkonklusion

Den **danske** side er i god, næsten go-live-klar stand: ingen brudte links, ingen manglende billeder, korrekt SEO-struktur, konsistent brand og priser.

Det store problem ligger i den **engelske** version: **23 af 27 sider i `/en/` er ikke oversat** — de har `lang="en"` i koden, men indeholder dansk titel, meta-beskrivelse og brødtekst. Det er den ene fejl, der skal løses før engelsk kan gå live.

---

## Fejltabel

| Side / område | Fejl | Alvorlighed | Status |
|---|---|---|---|
| `/en/` (23 sider) | `lang="en"` men dansk indhold (titel, meta, H1, brødtekst). Skader SEO (Google ser dansk på en engelsk URL), skærmlæsere udtaler forkert, og en engelsk besøgende møder dansk. | **Kritisk** | ✅ **LØST** — alle 27 engelske sider fuldt oversat til premium engelsk: synligt indhold, titles, meta, OG, hreflang, JSON-LD (headline/description/breadcrumb), `inLanguage`, FAQPage, formularer, chatbot og JS-strenge. Slutverificeret: 0 danske rester, 0 brudte links, korrekt `lang="en"` på alle 27. Kun dev-kommentarer i JS/CSS + egennavne (Nævnenes Hus, Datatilsynet, Herning) bevaret bevidst. |
| `/en/faq.html`, `/en/ydelser.html` m.fl. | Dansk `meta description` på engelske URL'er | Kritisk (del af ovenstående) | ✅ **LØST** — oversat sammen med siderne, inkl. FAQPage-JSON-LD. |
| Alle sider | `AEVIA_GA4='G-XXXXXXXXXX'` og `AEVIA_CLARITY='xxxxxxxxxx'` er placeholders | Middel | Kræver dine egne måle-ID'er — kan ikke udfyldes for dig |
| Købsflow DA vs. EN | **Inkonsistens:** Danske pakke-knapper ("Book nu, X kr.") → `book.html` (lead-/booking-formular). Engelske → `/api/checkout` (Stripe direkte). Samme produkt, to forskellige flows. Den danske er internt konsistent og matcher `get_leads`, men engelsk springer formularen over og går direkte til betaling. | Middel | ✅ **LØST** — ensrettet til book.html-flowet overalt (engelske `/api/checkout`-knapper peger nu på book.html-lead-flowet som de danske). Ingen `/api/checkout`-links tilbage. |
| `/en/404.html`, `/en/success.html` | Mangler canonical + OG-tags (samme som de danske util-sider) | Lav | Bevidst valg for util-sider; OK |

### Hvad blev tjekket og er rent ✅

- **Brudte links:** Ingen. Alle interne `.html`-links resolver korrekt (både rod og `/en/`).
- **Billeder/assets:** Ingen manglende filer. Alle `img`/`script`/`css`/`pdf`-stier findes.
- **Alt-tekster:** Alle `<img>` har `alt`.
- **H1:** Præcis én `<h1>` pr. side — korrekt.
- **Titles:** Unikke og beskrivende på alle danske sider, ingen dubletter.
- **Meta/OG/canonical:** Til stede på alle indholdssider.
- **Brand:** "Aevia" staves konsekvent — ingen "aivea"/"aevea"-fejl.
- **Priser:** 8.900 / 14.900 / 29.900 kr. konsistente overalt.
- **Telefon/mail:** `+45 28 30 39 33` og `kontakt@aevia.dk` ens på alle sider.
- **Domæne:** `aevia.dk` konsistent i canonical, OG, sitemap, robots, hreflang (matcher go-live-dokumentet).
- **Lang/viewport:** `lang="da"` på rod, `lang="en"` i `/en/`, viewport-meta overalt.
- **Struktureret data:** JSON-LD til stede (2 blokke pr. nøgleside).
- **`$2` i koden:** False positive — det er en regex-backreference i chatbottens `fmt()`-funktion, ikke et brudt link.

---

## Nye tiltag (prioriteret: effekt vs. indsats)

1. **Oversæt /en/ ordentligt (eller tag det offline indtil da).** *(Høj effekt / høj indsats)* — Største enkeltstående løft. Indtil da: sæt `noindex` på de 23 uoversatte sider, så Google ikke indekserer dansk indhold på engelske URL'er.
2. **Udfyld GA4 + Clarity måle-ID'er.** *(Høj / lav)* — Uden tracking er du blind på hvor leads falder fra. 10 minutters arbejde når du har ID'erne.
3. **Tilføj synlige trust-beviser over folden.** *(Høj / lav)* — Logoer for akkrediterede laboratorier, "X gennemførte forløb", evt. læge-navn/titel. Premium-køb på 8.900–29.900 kr. kræver tidlig tillid.
4. **Exit-intent / scroll-CTA på artiklerne.** *(Høj / mellem)* — De 12 indsigtsartikler trækker SEO-trafik; fang den med en blød CTA ("Få din longevity-tjekliste" → mail-capture) i stedet for kun en hård booking-knap.
5. **Synligt booking-flow med næste ledige tid.** *(Mellem / mellem)* — "Næste ledige: tirsdag d. 9. juni" reducerer friktion mere end en generisk kalender.
6. **FAQ-schema (FAQPage JSON-LD) på faq.html.** *(Mellem / lav)* — Kan give rich results i Google og mere plads på søgesiden.
7. **Prissammenligning som "anchor".** *(Mellem / lav)* — Vis værdien af de enkelte tilvalg (MRI, genetik) løst vs. samlet i en pakke, så Elite fremstår som det rationelle valg.
8. **Lead-magnet bag mail (longevity-tjekliste).** *(Mellem / lav)* — PDF'en findes allerede; gør den til mail-capture i stedet for direkte download, så du bygger en liste.
9. **Hastighed/billeder:** Konvertér `og-image.png` og store PNG-logoer til WebP. *(Lav / lav)*
10. **Cookie/samtykke-banner** før GA4/Clarity går live (GDPR). *(Mellem / lav)* — Påkrævet når tracking aktiveres.
