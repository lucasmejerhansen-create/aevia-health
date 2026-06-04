# Aevia — aevia.dk

Statisk site (ren HTML/CSS/JS, ingen build-steg) + to Vercel serverless-funktioner. Deployes automatisk til Vercel ved push til `main`.

## Struktur

- `*.html` — danske sider (forside: `index.html`)
- `en/*.html` — engelske sider (spejler de danske)
- `assets/` — billeder, logoer, ikoner (webp/png/svg)
- `api/chat.js` — AI-chat-backend (OpenAI eller Anthropic, valgfri; uden nøgle falder chatten tilbage til indbygget vidensbase)
- `api/checkout.js` — Stripe checkout
- `chatbot-backend/` — alternativ Cloudflare Worker-udgave af chat-backenden (bruges ikke af Vercel)
- `manifest.json` / `vercel.json` / `.vercelignore` — PWA, headers/cache, deploy-ekskludering
- `sitemap.xml` / `robots.txt` — SEO (sitemap vedligeholdes manuelt: nye sider skal tilføjes)

## Setup

1. Klon repoet og åbn i en editor — siderne kan åbnes direkte i browseren (ingen install).
2. Miljøvariabler (kun nødvendige for chat/checkout): se `.env.example`, sættes i Vercel → Settings → Environment Variables.
3. Deploy: commit + push til `main` (fx via GitHub Desktop) → Vercel bygger automatisk.

## Konventioner

- Hver side er selvbærende (inline CSS i `<style>` i hver fil). Ændringer i fælles UI (header/footer/chat) skal derfor laves på tværs af alle sider — brug scripts frem for håndredigering.
- Interne dokumenter (`*.md`) deployes IKKE (ekskluderet i `.vercelignore`).
- Analytics: GA4 + Microsoft Clarity, ID'er sat i `AEVIA_GA4`/`AEVIA_CLARITY` i hver sides script; loader kun efter cookie-samtykke.
- Forms: Formspree (`xdajrdrz`) med honeypot (`_gotcha`) og GDPR-samtykke-checkbox.

## Tjekliste ved nye sider

1. Lav DA-version i roden + EN-version i `en/`.
2. Canonical, hreflang, OG-tags, JSON-LD (kopiér fra eksisterende side).
3. Tilføj begge URL'er til `sitemap.xml`.
4. Link til siden fra mindst én eksisterende side.
