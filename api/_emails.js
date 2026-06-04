// Aevia — e-mail-skabeloner til velkomstserien (deles af api/lead.js og api/drip.js).
// Filer med _-præfiks i /api bliver IKKE til endpoints på Vercel.

import crypto from "crypto";

const SITE = process.env.SITE_URL || "https://aevia.dk";

function wrap({ lang, bodyHtml, unsubUrl }) {
  const da = lang !== "en";
  return `<!DOCTYPE html><html lang="${da ? "da" : "en"}"><body style="margin:0;background:#0a1628;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:36px 24px">
    <div style="font-size:26px;font-weight:bold;color:#f5f5f0;font-family:Georgia,serif">Aevia<span style="color:#c9a437">.</span></div>
    <div style="background:#0f1f36;border:1px solid #28394f;border-radius:14px;padding:28px;margin-top:22px">
      ${bodyHtml}
      <p style="color:#aab4c2;font-size:14px;line-height:1.6;margin:16px 0 0">${
        da
          ? 'Spørgsmål? Svar på denne mail eller skriv til <a href="mailto:kontakt@aevia.dk" style="color:#c9a437">kontakt@aevia.dk</a>.'
          : 'Questions? Reply to this email or write to <a href="mailto:kontakt@aevia.dk" style="color:#c9a437">kontakt@aevia.dk</a>.'
      }</p>
    </div>
    <p style="color:#94a0b2;font-size:12px;margin-top:18px;text-align:center">Aevia Health ApS · CVR 46 52 07 50 · <a href="${SITE}" style="color:#c9a437">aevia.dk</a><br>
    <a href="${unsubUrl}" style="color:#94a0b2">${da ? "Afmeld disse mails" : "Unsubscribe from these emails"}</a></p>
  </div>
</body></html>`;
}

const h1 = (t) => `<h1 style="color:#f5f5f0;font-size:20px;margin:0 0 12px;font-family:Georgia,serif">${t}</h1>`;
const p = (t) => `<p style="color:#aab4c2;font-size:15px;line-height:1.6;margin:0 0 14px">${t}</p>`;
const btn = (href, t) =>
  `<p style="margin:20px 0 6px"><a href="${href}" style="display:inline-block;background:#c9a437;color:#0a1628;font-weight:bold;font-size:15px;text-decoration:none;border-radius:999px;padding:13px 26px">${t}</a></p>`;
const li = (t) => `<li style="margin-bottom:8px">${t}</li>`;
const ul = (items) => `<ul style="color:#aab4c2;font-size:15px;line-height:1.6;margin:0 0 14px;padding-left:20px">${items.join("")}</ul>`;

// dag 0 — tjeklisten
function day0({ lang, unsubUrl }) {
  const da = lang !== "en";
  return {
    subject: da ? "Din longevity-tjekliste fra Aevia" : "Your longevity checklist from Aevia",
    html: wrap({
      lang,
      unsubUrl,
      bodyHtml: da
        ? h1("Her er din tjekliste") +
          p("Tak for din interesse i Aevia. Her er den lovede <strong style='color:#f5f5f0'>longevity-tjekliste: 10 evidensbaserede vaner</strong>, der flytter din biologiske alder — skrevet til en travl hverdag.") +
          btn(`${SITE}/longevity-tjekliste.pdf`, "Hent tjeklisten (PDF)") +
          p("Et godt sted at starte: vælg <em>én</em> vane fra listen og hold den i 14 dage, før du tilføjer den næste. Små, målbare ændringer slår store forsætter.")
        : h1("Here is your checklist") +
          p("Thanks for your interest in Aevia. Here is the promised <strong style='color:#f5f5f0'>longevity checklist: 10 evidence-based habits</strong> that move your biological age — written for a busy life.") +
          btn(`${SITE}/longevity-tjekliste.pdf`, "Download the checklist (PDF)") +
          p("A good place to start: pick <em>one</em> habit from the list and keep it for 14 days before adding the next. Small, measurable changes beat big resolutions."),
    }),
  };
}

// dag 2 — sådan læser du dine tal
function day2({ lang, unsubUrl }) {
  const da = lang !== "en";
  const en = lang === "en" ? "en/" : "";
  return {
    subject: da ? "Sådan læser du dine tal (4 markører, der betyder mest)" : "How to read your numbers (4 markers that matter most)",
    html: wrap({
      lang,
      unsubUrl,
      bodyHtml: da
        ? h1("Fire tal, der siger mere end din vægt") +
          p("De fleste kender deres vægt — men de tal, der faktisk forudsiger dine raske år, gemmer sig i blodet. Fire af de vigtigste:") +
          ul([
            li("<strong style='color:#f5f5f0'>ApoB</strong> — antallet af skadelige kolesterolpartikler. Et mere præcist mål for hjerte-kar-risiko end LDL alene."),
            li("<strong style='color:#f5f5f0'>hs-CRP</strong> — skjult, kronisk inflammation, der fremskynder aldring."),
            li("<strong style='color:#f5f5f0'>HbA1c</strong> — dit gennemsnitlige blodsukker over 2-3 måneder."),
            li("<strong style='color:#f5f5f0'>Faste-insulin</strong> — fanger insulinresistens år før blodsukkeret stiger."),
          ]) +
          p("Vil du se, hvordan tallene præsenteres i en rigtig rapport — med referenceintervaller, biologisk alder og en konkret plan?") +
          btn(`${SITE}/${en}eksempel-rapport.html`, da ? "Se en eksempel-rapport" : "See a sample report")
        : h1("Four numbers that say more than your weight") +
          p("Most people know their weight — but the numbers that actually predict your healthy years are hidden in your blood. Four of the most important:") +
          ul([
            li("<strong style='color:#f5f5f0'>ApoB</strong> — the number of harmful cholesterol particles. A more precise measure of cardiovascular risk than LDL alone."),
            li("<strong style='color:#f5f5f0'>hs-CRP</strong> — hidden, chronic inflammation that accelerates ageing."),
            li("<strong style='color:#f5f5f0'>HbA1c</strong> — your average blood sugar over 2-3 months."),
            li("<strong style='color:#f5f5f0'>Fasting insulin</strong> — catches insulin resistance years before blood sugar rises."),
          ]) +
          p("Want to see how the numbers are presented in a real report — with reference ranges, biological age and a concrete plan?") +
          btn(`${SITE}/${en}eksempel-rapport.html`, "See a sample report"),
    }),
  };
}

// dag 5 — founding member-tilbud
function day5({ lang, unsubUrl }) {
  const da = lang !== "en";
  const en = lang === "en" ? "en/" : "";
  return {
    subject: da
      ? "Founding member: gratis 3 måneders opfølgning (værdi 3.595 kr.)"
      : "Founding member: free 3-month follow-up (value DKK 3,595)",
    html: wrap({
      lang,
      unsubUrl,
      bodyHtml: da
        ? h1("Vær blandt de første 50") +
          p("Aevia er nyt i Danmark, og vi giver vores første 50 kunder noget særligt:") +
          ul([
            li("<strong style='color:#f5f5f0'>Gratis 3-måneders opfølgning</strong> med re-test af dine kernemarkører (værdi 3.595 kr.) med i dit første forløb."),
            li("<strong style='color:#f5f5f0'>Fast pris på dit medlemskab</strong> fremover — uanset fremtidige prisstigninger."),
          ]) +
          p("Alle forløb inkluderer biologisk alder, fuldt blodpanel (70+ markører) og en personlig rapport gennemgået 1:1.") +
          btn(`${SITE}/${en}book.html`, "Book dit helbredstjek")
        : h1("Be among the first 50") +
          p("Aevia is new in Denmark, and we are giving our first 50 customers something special:") +
          ul([
            li("<strong style='color:#f5f5f0'>Free 3-month follow-up</strong> with a re-test of your core markers (value DKK 3,595) included in your first programme."),
            li("<strong style='color:#f5f5f0'>A fixed membership price</strong> going forward — regardless of future price increases."),
          ]) +
          p("Every programme includes biological age, a full blood panel (70+ markers) and a personal report reviewed 1:1.") +
          btn(`${SITE}/${en}book.html`, "Book your health check"),
    }),
  };
}

export const DRIP = { 0: day0, 2: day2, 5: day5 };

export async function sendMail({ to, subject, html, bcc }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "Aevia <kontakt@aevia.dk>",
      to: [to],
      bcc: bcc ? [bcc] : undefined,
      subject,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

export function unsubSig(email) {
  return crypto
    .createHmac("sha256", process.env.BOOKING_SECRET || "")
    .update(email.toLowerCase())
    .digest("hex")
    .slice(0, 32);
}

export function unsubUrlFor(email) {
  return `${SITE}/api/lead?unsub=1&e=${encodeURIComponent(email)}&sig=${unsubSig(email)}`;
}
