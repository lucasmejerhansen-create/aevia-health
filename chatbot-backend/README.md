# Aevia AI-chatbot — backend (valgfri opgradering)

Den indbyggede chatbot på sitet svarer allerede på ~37 emner (vidensbaseret, kører i browseren).
Vil du have, at den kan svare på **alle mulige spørgsmål**, kobler du denne lille AI-backend på.
Den kalder en rigtig sprogmodel (Anthropic Claude) med Aevias fakta som grundlag — og din API-nøgle
ligger sikkert på serveren, aldrig i browseren.

## Sådan deployer du (Cloudflare Workers — gratis)

1. Opret konto på cloudflare.com og installer Wrangler:
   `npm install -g wrangler` og `wrangler login`
2. Opret projektet:
   `wrangler init aevia-chat` (vælg "Hello World" Worker) og erstat `src/index.js` med `worker.js` herfra.
3. Læg din Anthropic API-nøgle ind som secret (vises aldrig i koden):
   `wrangler secret put ANTHROPIC_API_KEY`
4. Deploy:
   `wrangler deploy`
   Du får en URL, fx `https://aevia-chat.dit-subdomæne.workers.dev`.

## Kobl den på sitet

I alle .html-filer står linjen:
```
var AEVC_ENDPOINT="";
```
Sæt den til din Worker-URL (søg/erstat på tværs af alle filer):
```
var AEVC_ENDPOINT="https://aevia-chat.dit-subdomæne.workers.dev";
```
Færdig. Chatbot'en sender nu spørgsmål til AI'en og falder automatisk tilbage til
vidensbasen, hvis backenden ikke svarer.

## Vigtigt
- **CORS:** I `worker.js` er `Access-Control-Allow-Origin` sat til `*`. Skift til `https://aevia.dk` i produktion.
- **GDPR:** Når backenden er aktiv, sendes brugerens beskeder til din Worker og videre til Anthropic.
  Tilføj det til privatlivspolitikken, og overvej at gate chatten bag cookie-samtykke. Bed aldrig brugere
  om at skrive personfølsomme helbredsoplysninger i chatten.
- **Model:** `claude-haiku-4-5-20251001` er hurtig og billig. Skift evt. til en større model for dybere svar.
- **Misbrug/omkostning:** Overvej rate-limiting (Cloudflare) og et månedligt forbrugsloft på din Anthropic-konto.

## Alternativer
Samme `worker.js`-logik kan let portes til Vercel/Netlify Functions, AWS Lambda eller en Node/Express-server —
det er bare en POST-endpoint, der modtager `{ "message": "..." }` og returnerer `{ "reply": "..." }`.
