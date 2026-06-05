// Aevia — 1-kliks NPS-svar fra feedback-mailen (se KUNDEDRIP i _emails.js).
// GET /api/nps?s=0..10&e=<base64url-email> → mailer svaret til kontakt@aevia.dk
// og viser en lille takkeside i Aevias design. Ingen database.

const SITE = process.env.SITE_URL || "https://aevia.dk";

function page({ title, body }) {
  return `<!DOCTYPE html><html lang="da"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow"><title>${title} | Aevia</title></head>
<body style="margin:0;background:#0a1628;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px">
<div style="max-width:480px;text-align:center">
  <div style="font-size:34px;font-weight:bold;color:#f5f5f0;font-family:Georgia,serif">Aevia<span style="color:#c9a437">.</span></div>
  <div style="background:#0f1f36;border:1px solid #28394f;border-radius:18px;overflow:hidden;margin-top:24px">
    <div style="height:3px;background:#c9a437"></div>
    <div style="padding:34px 32px">
      <h1 style="color:#f5f5f0;font-size:24px;margin:0 0 12px;font-family:Georgia,serif;font-weight:normal">${title}</h1>
      <p style="color:#aab4c2;font-size:15px;line-height:1.7;margin:0">${body}</p>
    </div>
  </div>
  <p style="margin-top:20px"><a href="${SITE}" style="color:#94a0b2;font-size:13px;text-decoration:none">Tilbage til aevia.dk →</a></p>
</div></body></html>`;
}

export default async function handler(req, res) {
  const s = parseInt(String(req.query.s ?? ""), 10);
  let email = "";
  try { email = Buffer.from(String(req.query.e || ""), "base64url").toString("utf8"); } catch {}

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (isNaN(s) || s < 0 || s > 10) {
    return res.status(400).send(page({ title: "Noget gik galt", body: "Linket ser ikke rigtigt ud. Prøv igen fra mailen, eller skriv til kontakt@aevia.dk." }));
  }

  // Send svaret videre (fejler stille — kunden skal altid se takkesiden).
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.MAIL_FROM || "Aevia <kontakt@aevia.dk>",
          to: ["kontakt@aevia.dk"],
          subject: `NPS-svar: ${s}/10${email ? " — " + email : ""}`,
          html: `<p style="font-family:Arial,sans-serif;font-size:15px">Score: <strong>${s}/10</strong><br>Fra: ${email || "ukendt"}<br>Tid: ${new Date().toISOString()}</p>`,
        }),
      });
    } catch (e) {
      console.error("NPS-mailfejl:", e.message);
    }
  }

  const happy = s >= 9;
  return res.status(200).send(page({
    title: "Tak for dit svar!",
    body: happy
      ? `Du gav os ${s}/10 — det varmer. Hvis du har 2 minutter mere, må du meget gerne dele din oplevelse på <a href="https://dk.trustpilot.com/evaluate/aevia.dk" style="color:#c9a437">Trustpilot</a> — det hjælper andre med at finde os.`
      : `Du gav os ${s}/10. Tak for ærligheden — den bruger vi til at blive bedre. Er der noget konkret, vi kunne have gjort anderledes? Skriv til <a href="mailto:kontakt@aevia.dk" style="color:#c9a437">kontakt@aevia.dk</a> — grundlæggeren læser hvert svar.`,
  }));
}
