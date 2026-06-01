# Aevia Health — audit, optimering & nye idéer

*Senior web-team-gennemgang (UX/UI · frontend · CRO · teknisk SEO · WCAG), maj 2026. Verificeret ved at læse koden på tværs af alle 25 sider.*

## 1. Overordnet vurdering — 8,5 / 10

Sitet er i meget stærk stand: konsistent premium-design, korrekt H1/H2 og unikke metas på alle sider, schema-markup, mobil-først, GDPR-side, samtykke-gated AI-chat, ingen døde links og ingen ubalancerede tags. Efter denne gennemgang er tilgængeligheden løftet (synligt tastatur-fokus + reduceret bevægelse). De resterende punkter er ikke fejl i koden, men **go-live-konfiguration** (domæne, betalings-/booking-/analytics-nøgler) og **rigtigt indhold** (egne fotos, navngivne cases) — det er det, der adskiller 8,5 fra 10.

## 2. Fejl-tabel

| # | Problem | Område | Impact | Indsats | Status |
|---|---------|--------|--------|---------|--------|
| 1 | Manglende synligt tastatur-fokus (WCAG 2.4.7) | A11y | 🟡 | Lille | ✅ Rettet — `:focus-visible` guld-outline på alle sider |
| 2 | Ingen `prefers-reduced-motion` (bevægelsesfølsomme brugere) | A11y | 🟢 | Lille | ✅ Rettet — globalt på alle sider |
| 3 | `success.html` manglede meta-description | SEO | 🟢 | Lille | ✅ Rettet (siden er `noindex`, så lav betydning) |
| 4 | "Køb nu" pegede på `/api/checkout` uden backend → død knap | CRO | 🔴 | Lille | ✅ Rettet tidligere — fører nu til booking indtil Stripe er klar |
| 5 | Fiktive tal/cases (“−31%” m.fl.) | Trust/Jura | 🔴 | Medium | ✅ Rettet tidligere — erstattet med ærlige formuleringer |
| 6 | 19 billeder hot-linkes fra Unsplash | Teknisk/perf | 🟡 | Medium | 🔶 Forslag — selvhost som lokale WebP før launch |
| 7 | Integrationer er placeholders (GA4, Clarity, Formspree, Calendly, Stripe) | Teknisk | 🟡 | Lille | 🔶 Forslag — indsæt nøgler ved launch (markeret i koden) |
| 8 | Intet rigtigt domæne/SSL endnu (aevia.dk) | Teknisk | 🔴 | Lille | 🔶 Forslag — registrér + deploy (Netlify/Cloudflare) |
| 9 | Social proof er generisk (ingen navne/logoer/anmeldelser) | CRO/Trust | 🟡 | Medium | 🔶 Forslag — tilføj rigtige cases/logoer med samtykke |
| 10 | Stock-portræt som “grundlægger” | Trust | 🟢 | Lille | 🔶 Forslag — udskift med rigtigt foto |
| 11 | Ingen “skip to content”-link | A11y | 🟢 | Lille | 🔶 Forslag — kan tilføjes for fuld WCAG |

## 3. Ændringer udført i denne gennemgang

- **Alle 25 sider:** tilføjet `:focus-visible`-fokusring (guld) for tastaturbrugere + `@media (prefers-reduced-motion: reduce)` der dæmper animationer/transitions.
- **success.html:** tilføjet meta-description.
- Bekræftet at tidligere rettelser holder: ingen døde links, balancerede tags, alle billeder har alt/width/height, unikke titler, "Køb nu" → booking (ingen død rute), kognitiv test fjernet konsekvent, AI-chat samtykke-gated.

## 4. Nye idéer

| # | Idé | Forventet effekt | Sværhedsgrad |
|---|-----|------------------|--------------|
| 1 | **ROI-beregner** på virksomheder-siden (e-mail-gated resultat) | Stærkt B2B-lead-gen | Medium |
| 2 | **Exit-intent popup** med longevity-tjeklisten | +5–15% lead capture | Lille |
| 3 | **Mini booking-widget på forsiden** (Calendly-inline i en sektion) | Færre klik til konvertering | Lille |
| 4 | **Skip-to-content + ARIA på chat/menu** | Fuld WCAG, bredere publikum | Lille |
| 5 | **Product/Offer-schema på pakker** + Service-schema på ydelser | Rich results i Google | Lille |
| 6 | **Kategori-filtre + “relaterede artikler”** i Indsigter | Længere besøg, mere SEO | Medium |
| 7 | **Engelsk version (/en/)** | Internationale ledere i DK | Stor |
| 8 | **Rigtige video-testimonials** (evt. silhuet) | Højest-konverterende proof | Stor |
| 9 | **“Som set i / partnere”-logostribe** | Øjeblikkelig troværdighed | Lille |
| 10 | **Review-schema** når rigtige anmeldelser findes | Stjerner i søgeresultat | Lille |

## 5. Top 3 quick wins (kan gøres i dag)

1. **Registrér domænet + deploy** (Netlify Drop / Cloudflare Pages) — så bliver alle canonical-/OG-URL'er og SSL korrekte, og du får et delbart link.
2. **Indsæt de 6 nøgler** (GA4, Clarity, Formspree, Calendly, + evt. Stripe-links, chatbot-endpoint) via søg/erstat — så virker måling, formular, booking og fuld AI-chat.
3. **Selvhost de 19 billeder** som lokale WebP i `/img` — fjerner ekstern afhængighed og forbedrer LCP.

## 6. Prioriteret roadmap

**Uge 1 — Go-live-fundament:** registrér domæne, deploy, SSL, Search Console; indsæt analytics-/formular-/booking-nøgler; selvhost billeder.
**Uge 2 — Troværdighed:** rigtige cases + samtykke, partner-/“som set i”-logoer, udskift grundlægger-foto; tilføj Product/Service-schema.
**Uge 3 — Konvertering:** ROI-beregner (B2B), exit-intent med lead magnet, mini-booking på forsiden.
**Uge 4 — Vækst & a11y:** skip-link + ARIA, kategori-filtre/relaterede artikler, 2 nye SEO-artikler, evt. start på /en/-version. Mål og iterér på konverteringsrate.

## 7. Verifikation (udført)

- **Links:** alle interne href (.html/.pdf) peger på eksisterende filer — 0 døde.
- **Tags:** div/section/tr balancerede på alle 25 sider.
- **Billeder:** 100% har `alt`, `width`, `height` (ingen CLS-risiko fra billeder).
- **SEO:** 1×H1, unik `<title>` og `description`, canonical på alle indekserbare sider (success.html bevidst `noindex`).
- **A11y:** `:focus-visible` + `prefers-reduced-motion` bekræftet på 25/25 sider; kontrast hævet (`--muted-2` #94a0b2); touch-targets ~46px.
- **Funktion:** ingen `/api/checkout`- eller `buy.stripe.com/your-`-rester i knapper; AI-chat samtykke-gated (lokal uden samtykke, ekstern AI kun ved “Accepter alle”).
