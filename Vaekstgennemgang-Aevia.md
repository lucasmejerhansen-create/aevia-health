# Vækstgennemgang — Aevia Health

*Senior vækstteam: CRO · UX · SEO · digital strategi. Gennemgang af det nuværende site (13 sider) samt offensive vækstforslag.*
*Udarbejdet maj 2026. Bemærk: sitet er endnu pre-launch — flere kritiske punkter handler om at gøre det fra "smukt" til "sælgende".*

---

## Overordnet vurdering

**Score: 7,5 / 10**

Aevia har et stærkt fundament, der ligger over niveauet for typiske SMV-sites: konsistent premium-design (navy/platin/guld, Playfair + Inter), korrekt H1/H2-hierarki og unikke meta-titler på alle 13 sider, schema-markup (HealthAndBeautyBusiness, FAQ, Article), GDPR-side, mobil-først layout og en klar dual-audience-struktur (privat + virksomhed). Tekstmæssigt rammer det executive-tonen præcist.

Men sitet er bygget som en *brochure*, ikke som en *konverteringsmaskine*. De tre ting, der afgør omsætning, er enten placeholders eller helt fraværende: (1) booking/formular fører ingen steder hen, (2) der er ingen analytics installeret, så I er blinde, og (3) der er ingen reel social proof eller lead capture. Den sociale dokumentation er desuden illustrative tal ("−31% sygefravær"), som skal være ægte eller fjernes, før sitet går live — særligt i en sundhedskontekst. Løses de tre, springer sitet fra 7,5 til reelt salgsklart.

---

## DEL 1 — Optimeringsaudit

| # | Problem | Område | Impact | Indsats | Prioritet |
|---|---------|--------|--------|---------|-----------|
| 1 | Booking-formular sender ingen data (kun JS-bekræftelse), Calendly er en statisk placeholder → **leads forsvinder** | CRO | 🔴 Høj | Lille | 🔴 Fix nu |
| 2 | Ingen analytics installeret — GA4 + Clarity nævnes i cookie-banner, men der er ingen tracking-kode | Teknisk/CRO | 🔴 Høj | Lille | 🔴 Fix nu |
| 3 | `og-image.png` refereres i schema, men filen findes ikke → brudt preview ved deling på LinkedIn/mail | SEO/CRO | 🔴 Høj | Lille | 🔴 Fix nu |
| 4 | Social proof er illustrative/anonyme tal og cases ("Valgt af ledere…", "−31%") — ingen navne, logoer eller rigtige udtalelser | CRO/Trust | 🔴 Høj | Medium | 🔴 Fix nu |
| 5 | Fiktive tal/cases kan være juridisk problematiske i sundhedskontekst — skal verificeres eller fjernes før launch | Trust/Jura | 🔴 Høj | Medium | 🔴 Fix nu |
| 6 | 19 billeder hot-linkes fra Unsplash → afhængighed, ingen kontrol, LCP-risiko, licens ved skala | Teknisk/SEO | 🟡 Medium | Medium | 🟡 Næste uge |
| 7 | Cookie-samtykke bruger `sessionStorage` (nulstilles hver session) og gater ikke nogen scripts → reelt kosmetisk | GDPR/Teknisk | 🟡 Medium | Medium | 🟡 Næste uge |
| 8 | Kontaktdata (telefon, CVR, adresse) er placeholders → skal være reelle før launch | Trust | 🟡 Medium | Lille | 🟡 Næste uge |
| 9 | Nav-links har ~40px touch-højde (`padding:10px 14px`) — under anbefalede 44px på mobil | UX | 🟢 Lav | Lille | 🟢 Backlog |
| 10 | 7 menupunkter + CTA kan blive trange på mellemstore skærme (tablet/laptop) | UX | 🟢 Lav | Lille | 🟢 Backlog |
| 11 | Tekstkontrast `--muted-2` (#7c8898) på navy er borderline ift. WCAG AA i små størrelser | UX/A11y | 🟢 Lav | Lille | 🟢 Backlog |
| 12 | Intet rigtigt domæne/SSL endnu (aevia.dk ikke registreret) → kan hverken indekseres eller sikres | Teknisk | 🔴 Høj | Lille | 🔴 Fix nu |
| 13 | Ingen `robots`-disallow på artikler ok, men mangler `lastmod` i sitemap + Google Search Console ikke opsat | SEO | 🟢 Lav | Lille | 🟢 Backlog |

**Det der allerede virker godt (skal IKKE røres):** designkonsistens, H1/H2-hierarki, unikke metas, schema-markup, alt-tekster på alle billeder (WebP + srcset + lazy + dimensions), interne links (ingen døde), tre-lags ydelsesforklaringer, GDPR-/privatlivsside, mobil-responsivitet.

---

## DEL 2 — Nye idéer (hvad mangler helt)

| # | Idé | Forventet effekt | Sværhedsgrad |
|---|-----|------------------|--------------|
| 1 | **Lead magnet** — gratis PDF: "12 biomarkører enhver leder bør kende" mod e-mail | +20–40% flere leads fra samme trafik | Medium |
| 2 | **ROI-beregner for virksomheder** (interaktiv: antal ledere × sygefraværsdage → kr. sparet) | Stærkt B2B-lead-gen + delbart | Medium |
| 3 | **Sammenligningsside** — "Aevia vs. almindeligt sundhedstjek vs. gør-det-selv" | Fjerner købsfriktion, fanger "er det værd at betale for"-søgning | Lille |
| 4 | **Rigtige cases med navngivne/sektor-tal** + samtykke | Markant højere konvertering på high-ticket | Medium |
| 5 | **"Som set i / partnere"-logostribe** (Valida Health m.fl. med tilladelse) | Øjeblikkelig troværdighed | Lille |
| 6 | **Video-testimonial** (evt. silhuet af diskretionshensyn) | Højeste-konverterende social proof-format | Høj |
| 7 | **Dedikeret FAQ-side** målrettet Google Featured Snippets | Organisk trafik på "hvad koster et helbredstjek" o.l. | Lille |
| 8 | **Flere SEO-artikler** (hs-CRP, Zone 2, testosteron & performance, longevity for kvinder) | Long-tail organisk trafik | Medium |
| 9 | **Nyhedsbrev "Aevia Brief"** — kvartalsvist longevity-research-resumé (ikke "tilmeld dig") | Fastholdelse + leads modnes | Medium |
| 10 | **Automatiseret e-mail-sekvens** efter formular (3–4 mails: bekræft → indhold → case → tilbud) | Højere booking-rate fra eksisterende leads | Medium |
| 11 | **Exit-intent / scroll-popup** med lead magnet eller 15-min-samtale | +5–15% lead capture på afvisende trafik | Lille |
| 12 | **Live chat / WhatsApp** til diskret, hurtig kontakt | Lavere friktion for travle beslutningstagere | Lille |
| 13 | **Rigtig booking-widget på forsiden** (Calendly-embed i hero/CTA) | Færre klik til konvertering | Lille |
| 14 | **Members-/resourcecenter** for årsaftale-kunder | Genkøb + fastholdelse på B2B | Høj |
| 15 | **Karriereside** | Signalerer vækst, stabilitet og tiltrækker partnere | Lille |
| 16 | **"Forær et Executive Check"** (gavekort/perk til ledergrupper) | Ny indtægtskanal + B2B-mersalg | Medium |

*Bemærk: Pris-, proces- og kontaktsider findes allerede (pakker.html, proces.html, book.html) — de er derfor ikke listet som manglende, men kan styrkes (se quick wins).*

---

## Top 3 quick wins — kan implementeres i dag

**1. Gør booking reel (det vigtigste af alt).**
Forbind formularen på book.html til en service som Formspree, Tally eller en simpel mail-endpoint, så hver forespørgsel rent faktisk lander i en indbakke. Indsæt et ægte Calendly-embed i stedet for placeholder-boksen. Uden dette konverterer alt andet til ingenting.

**2. Installér analytics + gør cookie-samtykke ægte.**
Læg GA4- og Microsoft Clarity-snippet ind, og lad cookie-banneret faktisk gate dem (script kører først ved "Accepter alle"). Skift `sessionStorage` til `localStorage`, så valget huskes. Så kan I måle drop-off i stedet for at gætte.

**3. Lav et og-image.png (1200×630) + ret kontaktdata.**
Et delbart preview-billede (logo + tagline på navy) så links ser professionelle ud på LinkedIn/mail. Udskift samtidig placeholder-telefon, CVR og adresse med rigtige data — eller fjern dem til de findes.

---

## Top 3 nye idéer med størst potentiale

### 1. Lead magnet + e-mail-capture → modningssekvens
**Hvorfor:** De fleste besøgende er ikke klar til at booke et tjek til 8.900–29.900 kr. ved første besøg. En gratis guide fanger dem, mens interessen er der.
**Implementering:**
- Skriv en 1-sides PDF: *"12 biomarkører enhver leder bør kende — og hvad de fortæller om din fremtid."* (Genbrug indhold fra jeres artikler.)
- Tilføj en slank e-mail-formular i footer + en dedikeret sektion på forsiden og indsigter-siden.
- Forbind til Mailchimp/Brevo. Opsæt 4-mails-sekvens: levér guide → biologisk alder forklaret → anonym case → tilbud om 15-min-samtale.
**Effekt:** Forventet +20–40% leads fra samme trafik.

### 2. ROI-beregner for virksomheder
**Hvorfor:** HR/CFO køber på tal. En interaktiv beregner gør den abstrakte værdi konkret — og er et stærkt lead-gen-værktøj.
**Implementering:**
- Simpel widget på virksomheder.html: input = antal ledere + gns. løn + sygefraværsdage. Output = estimeret kr. tabt i fravær vs. pris på en årsaftale.
- Lås det fulde resultat bag e-mail ("få rapporten tilsendt") → B2B-lead.
- Bygges som ren HTML/JS i jeres eksisterende design — ingen ny stack.
**Effekt:** Kvalificerede B2B-leads + delbart aktiv til LinkedIn.

### 3. Sammenligningsside + rigtige cases
**Hvorfor:** Den ubesvarede indvending er "kan jeg ikke bare få det hos egen læge / billigere?". En ærlig sammenligning fjerner friktionen; rigtige cases beviser værdien.
**Implementering:**
- Ny side `sammenlign.html`: tabel Aevia vs. almindeligt sundhedstjek vs. gør-det-selv (markører, koordinering, tolkning, opfølgning, ventetid).
- Tilføj 2–3 rigtige cases (navngivne med samtykke, eller verificerede sektor-tal) der erstatter de illustrative.
- Link fra forside, pakker og virksomheder.
**Effekt:** Højere konvertering sent i beslutningsfasen.

---

## Prioriteret 30-dages roadmap

**Uge 1 — Gør sitet funktionelt og målbart (fjern lækager)**
- Forbind booking-formular til mail/Formspree + indsæt rigtigt Calendly-embed
- Installér GA4 + Microsoft Clarity og gør cookie-samtykke ægte (localStorage + script-gating)
- Lav og-image.png; indsæt rigtige kontaktdata (tlf., CVR, adresse)
- Registrér aevia.dk + SSL; opsæt Google Search Console og indsend sitemap

**Uge 2 — Byg troværdighed (fjern tvivl)**
- Erstat illustrative tal/cases med verificerede eller sektor-baserede
- Tilføj "partnere/som set i"-logostribe (med tilladelse)
- Indsaml 2–3 rigtige udtalelser; opret sammenligningsside (`sammenlign.html`)
- Selvhost de 19 billeder lokalt som WebP (fjern Unsplash-afhængighed)

**Uge 3 — Aktivér lead capture (fang flere)**
- Skriv og design lead magnet-PDF ("12 biomarkører…")
- Byg e-mail-formular (footer + forside + indsigter) → Mailchimp/Brevo
- Opsæt 4-mails modningssekvens
- Tilføj exit-intent/scroll-popup med guide-tilbud

**Uge 4 — Skalér trafik og B2B (voks)**
- Byg ROI-beregner på virksomheder.html (e-mail-gated resultat)
- Publicér 2 nye SEO-artikler (hs-CRP, Zone 2-træning) + dedikeret FAQ-side til Featured Snippets
- Tilføj live chat/WhatsApp-knap
- Opsæt månedlig måling: konverteringsrate, lead-kilder, top-landingssider — og iterer

---

*Næste skridt: Uge 1 er ren "stop lækagerne"-arbejde og bør prioriteres før al markedsføring — der er ingen grund til at sende trafik til et site, hvor leads forsvinder og intet måles.*
