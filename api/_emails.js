// Aevia — e-mail-skabeloner til velkomstserien (deles af api/lead.js og api/drip.js).
// Filer med _-præfiks i /api bliver IKKE til endpoints på Vercel.

import crypto from "crypto";

const SITE = process.env.SITE_URL || "https://aevia.dk";

function wrap({ lang, bodyHtml, unsubUrl }) {
  const da = lang !== "en";
  const q = da
    ? 'Sp&oslash;rgsm&aring;l? <a href="mailto:kontakt@aevia.dk" style="color:#c9a437;text-decoration:none">kontakt@aevia.dk</a> &nbsp;&middot;&nbsp; <a href="tel:+4528303933" style="color:#c9a437;text-decoration:none">+45 28 30 39 33</a>'
    : 'Questions? <a href="mailto:kontakt@aevia.dk" style="color:#c9a437;text-decoration:none">kontakt@aevia.dk</a> &nbsp;&middot;&nbsp; <a href="tel:+4528303933" style="color:#c9a437;text-decoration:none">+45 28 30 39 33</a>';
  return `<!DOCTYPE html><html lang="${da ? "da" : "en"}"><body style="margin:0;padding:0;background:#0a1628;font-family:Arial,Helvetica,sans-serif">
  <div style="background:#0a1628;padding:44px 16px">
  <div style="max-width:600px;margin:0 auto">
    <div style="text-align:center;padding-bottom:28px">
      <span style="font-size:32px;font-weight:bold;color:#f5f5f0;font-family:Georgia,'Times New Roman',serif;letter-spacing:-.5px">Aevia</span><span style="font-size:32px;font-weight:bold;color:#c9a437;font-family:Georgia,serif">.</span>
    </div>
    <div style="background:#0f1f36;border:1px solid #28394f;border-radius:18px;overflow:hidden">
      <div style="height:3px;background:#c9a437;font-size:0;line-height:0">&nbsp;</div>
      <div style="padding:36px 38px 30px">
        ${bodyHtml}
      </div>
      <div style="border-top:1px solid #1d2c42;padding:18px 38px;background:#0d1b31">
        <p style="margin:0;color:#94a0b2;font-size:13px">${q}</p>
      </div>
    </div>
    <p style="color:#5a6b80;font-size:12px;margin-top:22px;text-align:center;line-height:1.7">Aevia Health ApS &middot; CVR 46 52 07 50 &middot; <a href="${SITE}" style="color:#94a0b2;text-decoration:none">aevia.dk</a><br>
    <a href="${unsubUrl}" style="color:#5a6b80">${da ? "Afmeld disse mails" : "Unsubscribe from these emails"}</a></p>
  </div></div></body></html>`;
}

const h1 = (t) => `<h1 style="color:#f5f5f0;font-size:20px;margin:0 0 12px;font-family:Georgia,serif">${t}</h1>`;
const p = (t) => `<p style="color:#aab4c2;font-size:15px;line-height:1.6;margin:0 0 14px">${t}</p>`;
const btn = (href, t) =>
  `<p style="margin:20px 0 6px"><a href="${href}" style="display:inline-block;background:#c9a437;color:#0a1628;font-weight:bold;font-size:15px;text-decoration:none;border-radius:999px;padding:13px 26px">${t}</a></p>`;
const li = (t) => `<li style="margin-bottom:8px">${t}</li>`;
const ul = (items) => `<ul style="color:#aab4c2;font-size:15px;line-height:1.6;margin:0 0 14px;padding-left:20px">${items.join("")}</ul>`;

// dag 0 — tjeklisten (+ estimat-resultat hvis leadet kom fra estimatoren)
function day0({ lang, unsubUrl, estimat, detaljer }) {
  const da = lang !== "en";
  // Resultat-boks: viser estimatet og alle målte faktorer fra quizzen.
  let resultBox = "";
  if (estimat) {
    const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    const lines = (detaljer || "")
      .split(" | ")
      .filter(Boolean)
      .map((l) => li(esc(l)));
    resultBox =
      `<div style="background:#142840;border:1px solid #c9a437;border-radius:10px;padding:16px 18px;margin:0 0 18px">` +
      `<p style="color:#c9a437;font-size:13px;letter-spacing:.12em;text-transform:uppercase;font-weight:bold;margin:0 0 6px">${da ? "Dit estimat" : "Your estimate"}</p>` +
      `<p style="color:#f5f5f0;font-size:16px;font-weight:bold;margin:0 0 10px">${esc(estimat)}</p>` +
      (lines.length ? ul(lines) : "") +
      `<p style="color:#94a0b2;font-size:12px;line-height:1.5;margin:0">${
        da
          ? "Et livsstils-estimat — ikke en måling. Din reelle biologiske alder beregnes ud fra 70+ biomarkører i dit blod."
          : "A lifestyle estimate — not a measurement. Your real biological age is calculated from 70+ biomarkers in your blood."
      }</p></div>`;
  }
  return {
    subject: estimat
      ? (da ? "Dit resultat + din longevity-tjekliste fra Aevia" : "Your result + your longevity checklist from Aevia")
      : (da ? "Din longevity-tjekliste fra Aevia" : "Your longevity checklist from Aevia"),
    html: wrap({
      lang,
      unsubUrl,
      bodyHtml: da
        ? h1(estimat ? "Dit resultat og din tjekliste" : "Her er din tjekliste") +
          resultBox +
          p("Tak for din interesse i Aevia. Her er den lovede <strong style='color:#f5f5f0'>longevity-tjekliste: 10 evidensbaserede vaner</strong>, der flytter din biologiske alder — skrevet til en travl hverdag.") +
          btn(`${SITE}/longevity-tjekliste.pdf`, "Hent tjeklisten (PDF)") +
          p("Et godt sted at starte: vælg <em>én</em> vane fra listen og hold den i 14 dage, før du tilføjer den næste. Små, målbare ændringer slår store forsætter.")
        : h1(estimat ? "Your result and your checklist" : "Here is your checklist") +
          resultBox +
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

export async function sendMail({ to, subject, html, bcc, attachments }) {
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
      attachments: attachments && attachments.length ? attachments : undefined,
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

// ── Kunde-drip (efter køb): Trustpilot-invitation + 1-kliks feedback ─────────
const npsBtns = (email, da) => {
  const e = Buffer.from(String(email).toLowerCase()).toString("base64url");
  let out = '<table role="presentation" style="border-collapse:separate;border-spacing:5px;margin:0 auto"><tr>';
  for (let s = 0; s <= 10; s++) {
    out += `<td><a href="${SITE}/api/nps?s=${s}&e=${e}" style="display:inline-block;width:34px;height:34px;line-height:34px;text-align:center;background:${s >= 9 ? "#c9a437" : "#142840"};border:1px solid ${s >= 9 ? "#c9a437" : "#28394f"};border-radius:8px;color:${s >= 9 ? "#0a1628" : "#aab4c2"};font-weight:bold;font-size:14px;text-decoration:none">${s}</a></td>`;
  }
  out += "</tr></table>";
  out += `<table role="presentation" style="border-collapse:collapse;width:100%;max-width:430px;margin:6px auto 0"><tr><td style="color:#5a6b80;font-size:11px;text-align:left">${da ? "Slet ikke sandsynligt" : "Not at all likely"}</td><td style="color:#5a6b80;font-size:11px;text-align:right">${da ? "Meget sandsynligt" : "Extremely likely"}</td></tr></table>`;
  return out;
};

export const KUNDEDRIP = {
  17: ({ lang, unsubUrl }) => {
    const da = lang !== "en";
    return {
      subject: da ? "Vil du hjælpe andre med at finde os?" : "Would you help others find us?",
      html: wrap({ lang, unsubUrl, bodyHtml: `
        <p style="margin:0 0 12px;font-size:11px;letter-spacing:3px;color:#c9a437;font-weight:bold;text-transform:uppercase">${da ? "En lille tjeneste" : "A small favour"}</p>
        <h1 style="color:#f5f5f0;font-size:24px;margin:0 0 14px;font-family:Georgia,serif;font-weight:normal">${da ? "Din mening betyder mere, end du tror" : "Your opinion matters more than you think"}</h1>
        <p style="color:#aab4c2;font-size:15px;line-height:1.7;margin:0 0 18px">${da
          ? "Vi er en ny dansk virksomhed, og hver eneste anmeldelse hjælper andre med at turde tage hånd om deres helbred. Hvis du fik noget ud af dit forløb, ville det betyde alt, hvis du delte din oplevelse — det tager 2 minutter."
          : "We are a young Danish company, and every single review helps others take charge of their health. If your programme gave you value, sharing your experience would mean the world — it takes 2 minutes."}</p>
        <div style="text-align:center;margin:0 0 8px"><a href="https://dk.trustpilot.com/evaluate/aevia.dk" style="display:inline-block;background:#c9a437;color:#0a1628;font-weight:bold;text-decoration:none;border-radius:999px;padding:15px 34px;font-size:15px">${da ? "Skriv en anmeldelse på Trustpilot" : "Write a review on Trustpilot"}</a></div>
        <p style="color:#94a0b2;font-size:13px;line-height:1.6;margin:14px 0 0;text-align:center">${da ? "Var noget ikke som forventet? Svar på denne mail i stedet — så retter vi det." : "Something not as expected? Reply to this email instead — we will fix it."}</p>` }),
    };
  },
  21: ({ lang, unsubUrl, email }) => {
    const da = lang !== "en";
    return {
      subject: da ? "Ét spørgsmål — ét klik" : "One question — one click",
      html: wrap({ lang, unsubUrl, bodyHtml: `
        <p style="margin:0 0 12px;font-size:11px;letter-spacing:3px;color:#c9a437;font-weight:bold;text-transform:uppercase">${da ? "Hurtig feedback" : "Quick feedback"}</p>
        <h1 style="color:#f5f5f0;font-size:24px;margin:0 0 14px;font-family:Georgia,serif;font-weight:normal">${da ? "Hvor sandsynligt er det, at du vil anbefale Aevia?" : "How likely are you to recommend Aevia?"}</h1>
        <p style="color:#aab4c2;font-size:15px;line-height:1.7;margin:0 0 22px">${da ? "Klik på et tal — det er det hele. Dit svar går direkte til grundlæggeren." : "Click a number — that is all. Your answer goes straight to the founder."}</p>
        ${npsBtns(email, da)}` }),
    };
  },
};
