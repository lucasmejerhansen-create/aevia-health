# Aevia chatbot — opsætning (5 minutter)

Chatbotten på sitet ("Spørg Aevia") er nu koblet til en AI-backend (`/api/chat`), så den kan svare frit på spørgsmål om Aevia og longevity/sundhed — ikke kun faste svar.

Den mangler kun **én ting** for at virke: en API-nøgle til en sprogmodel. Uden nøgle falder chatbotten automatisk tilbage til den indbyggede vidensbase (det gør ikke noget i mellemtiden).

## Sådan tænder du den

1. Vælg en udbyder og hent en API-nøgle:
   - **OpenAI** → platform.openai.com → API keys (billigt valg: model `gpt-4o-mini`), eller
   - **Anthropic** → console.anthropic.com → API keys (fx `claude-3-5-haiku`).
2. Gå til **Vercel → dit Aevia-projekt → Settings → Environment Variables**.
3. Tilføj én variabel:
   - Navn: `OPENAI_API_KEY` (eller `ANTHROPIC_API_KEY`)
   - Værdi: din nøgle
   - (Valgfrit: `AEVC_MODEL` hvis du vil vælge en bestemt model.)
4. Klik **Save**, og **redeploy** projektet (Deployments → ... → Redeploy).

Det er det. Chatbotten bruger nu modellen.

## Godt at vide

- **Privatliv:** chatbotten kalder først AI'en, når brugeren har accepteret cookies. Ellers svarer den fra vidensbasen.
- **Sikkerhed:** API-nøglen ligger kun på serveren (Vercel), aldrig i koden på sitet.
- **Rammer:** assistenten er instrueret til at svare om Aevia, priser, proces og sundhed generelt — men aldrig at give personlig lægefaglig diagnose. Ved helbredsspørgsmål henviser den til at booke en samtale eller kontakte egen læge.
- **Pris:** forbrug afregnes hos din AI-udbyder. `gpt-4o-mini` / `claude-3-5-haiku` er billige (typisk brøkdele af en krone pr. samtale).
- **Tilpasning:** du kan ændre assistentens viden og tone i `api/chat.js` (afsnittet `SYSTEM`).
