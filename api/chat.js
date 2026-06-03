// Aevia — AI-chatassistent (backend)
// Tager imod {messages:[{role,content},...]} fra chatbotten på sitet og svarer
// med en rigtig sprogmodel (LLM). Returnerer {reply:"..."}.
//
// Kører som serverless-funktion på Vercel. Tilføj ÉN af disse miljøvariabler:
//   OPENAI_API_KEY      (bruger OpenAI, fx gpt-4o-mini)
//   ANTHROPIC_API_KEY   (bruger Anthropic, fx claude-3-5-haiku)
// Valgfrit: AEVC_MODEL for at vælge en bestemt model.
// Uden nøgle svarer chatbotten videre fra den indbyggede vidensbase på sitet.

const SYSTEM = `Du er "Aevia-assistenten", den venlige chatassistent på aevia.dk.

OM AEVIA
- Aevia er en dansk longevity- og forebyggende helbredstjeneste for private og virksomheder. Nyetableret (2024).
- Vi samler avanceret diagnostik i ét koordineret forløb og oversætter det til en lægefagligt tolket plan. En AI samler resultaterne i en rapport, og en læge gennemgår og godkender den, før kunden får den.
- Vi driver IKKE egen klinik. Vi koordinerer gennem akkrediterede laboratorier, billeddiagnostiske centre og læger. Lov aldrig konkrete navngivne partnere, der ikke er bekræftet.
- Vi måler 70+ biomarkører, beregner biologisk alder, og tilbyder VO2max og hormonpanel (fra Plus) samt helkrops-MRI og genetisk profil (Elite).

PRISER (ekskl. moms)
- Pakker: Aevia Core 8.900 kr, Aevia Plus 14.900 kr, Aevia Elite 29.900 kr. Virksomhedsaftaler fra 120.000 kr.
- Årligt medlemskab efter første forløb: Longevity Basis 3.900 kr/år, Longevity Plus 6.900 kr/år.
- Henvisning: henviser man en, der gennemfører sit første forløb, får begge 1.500 kr. Gavekort kan bestilles.

PRAKTISK
- Booking sker på book.html. Kontakt: kontakt@aevia.dk, +45 28 30 39 33.
- Data behandles fortroligt efter GDPR art. 9. Ved virksomhedsaftaler ser arbejdsgiveren aldrig individuelle resultater, kun en anonymiseret samlet rapport.

SÅDAN SVARER DU
- Svar på samme sprog som brugeren (dansk eller engelsk).
- Vær kort, konkret og venlig (typisk 2-5 sætninger). Brug gerne et link som [book en tid](book.html) når det er relevant.
- Du må forklare longevity, biomarkører og sundhed generelt og oplysende.
- Du giver ALDRIG personlig lægefaglig diagnose eller behandling. Ved symptomer, bekymring eller personlige helbredsspørgsmål: anbefal at booke en samtale eller kontakte egen læge. Du er ikke en erstatning for en læge.
- Find ikke på fakta, priser eller resultater. Er du i tvivl, så sig det og henvis til kontakt@aevia.dk.
- Hvis et spørgsmål er helt uden for Aevia og sundhed, så svar kort og venligt og før samtalen tilbage til, hvordan Aevia kan hjælpe.`;

function clean(messages){
  if(!Array.isArray(messages)) return [];
  return messages
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));
}

export default async function handler(req, res){
  if(req.method !== "POST"){ res.status(405).json({ reply: "" }); return; }
  let body = req.body;
  if(typeof body === "string"){ try{ body = JSON.parse(body); }catch(e){ body = {}; } }
  const messages = clean(body && body.messages);
  if(!messages.length){ res.status(200).json({ reply: "" }); return; }

  const openai = process.env.OPENAI_API_KEY;
  const anthropic = process.env.ANTHROPIC_API_KEY;

  try{
    let reply = "";
    if(openai){
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + openai },
        body: JSON.stringify({
          model: process.env.AEVC_MODEL || "gpt-4o-mini",
          temperature: 0.4,
          max_tokens: 500,
          messages: [{ role: "system", content: SYSTEM }, ...messages]
        })
      });
      const d = await r.json();
      reply = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || "";
    } else if(anthropic){
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": anthropic, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: process.env.AEVC_MODEL || "claude-3-5-haiku-latest",
          max_tokens: 500,
          system: SYSTEM,
          messages: messages
        })
      });
      const d = await r.json();
      reply = (d.content && d.content[0] && d.content[0].text) || "";
    } else {
      // Ingen nøgle konfigureret — lad frontenden falde tilbage til vidensbasen.
      res.status(200).json({ reply: "" }); return;
    }
    res.status(200).json({ reply: (reply || "").trim() });
  }catch(e){
    res.status(200).json({ reply: "" });
  }
}
