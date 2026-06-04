// Aevia — booking-forespørgsel → klinik-koordinering (stateless, ingen database).
//
// Flow:
//   1) Kunden sender sit ønskede forløb fra book.html (POST hertil).
//   2) Kunden får straks en "vi koordinerer nu"-mail.
//   3) Klinikken (pr. område, se CLINIC_CONTACTS) får en mail med et signeret
//      link til /klinik-bekraeft.html, hvor de bekræfter en konkret tid.
//   4) /api/booking-action.js sender derefter den endelige bekræftelse + betalingslink.
//
// Miljøvariabler (Vercel): RESEND_API_KEY, MAIL_FROM, BOOKING_SECRET,
//   CLINIC_CONTACTS (valgfri JSON, fx {"Aarhus-området":"lab@klinik.dk","_default":"kontakt@aevia.dk"})

import crypto from "node:crypto";

const SITE = process.env.SITE_URL || "https://aevia.dk";

function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function sign(payloadObj, secret) {
  const p = b64url(JSON.stringify(payloadObj));
  const sig = b64url(crypto.createHmac("sha256", secret).update(p).digest());
  return p + "." + sig;
}

async function sendMail({ to, subject, html, bcc }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM || "Aevia <kontakt@aevia.dk>", to: [to], bcc: bcc ? [bcc] : undefined, subject, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

const esc = (s) => String(s || "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));

function shell(inner) {
  return `<!DOCTYPE html><html lang="da"><body style="margin:0;background:#0a1628;font-family:Arial,Helvetica,sans-serif"><div style="max-width:560px;margin:0 auto;padding:36px 24px"><div style="font-size:26px;font-weight:bold;color:#f5f5f0;font-family:Georgia,serif">Aevia<span style="color:#c9a437">.</span></div><div style="background:#0f1f36;border:1px solid #28394f;border-radius:14px;padding:28px;margin-top:22px">${inner}</div><p style="color:#94a0b2;font-size:12px;margin-top:18px;text-align:center">Aevia Health ApS · CVR 45 12 88 02 · <a href="${SITE}" style="color:#c9a437">aevia.dk</a></p></div></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.RESEND_API_KEY || !process.env.BOOKING_SECRET)
    return res.status(200).json({ ok: false, reason: "not configured" });

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};

  const navn = (b.navn || b.name || "").toString().slice(0, 120);
  const email = (b.email || "").toString().slice(0, 200);
  const telefon = (b.telefon || b.tlf || b.phone || "").toString().slice(0, 40);
  const pakke = (b.valgt_pakke || b.pakke || "").toString().slice(0, 120);
  const forloeb = (b.valgte_ydelser || b.forloeb || "").toString().slice(0, 2000);
  const omraade = (b.omraade || b.area || "").toString().slice(0, 120);
  const besked = (b.besked || b.message || "").toString().slice(0, 2000);

  if (!email || !email.includes("@")) return res.status(400).json({ error: "email mangler" });

  const payload = { v: 1, ts: Date.now(), navn, email, telefon, pakke, forloeb, omraade, besked };
  const token = sign(payload, process.env.BOOKING_SECRET);
  const link = `${SITE}/klinik-bekraeft.html?t=${token}`;

  // klinik-/koordinator-mail
  let contacts = {};
  try { contacts = JSON.parse(process.env.CLINIC_CONTACTS || "{}"); } catch {}
  const clinicTo = contacts[omraade] || contacts._default || "kontakt@aevia.dk";

  const rows = [["Navn", navn], ["E-mail", email], ["Telefon", telefon], ["Pakke", pakke], ["Område", omraade], ["Forløb", forloeb], ["Besked", besked]]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="color:#94a0b2;font-size:14px;padding:5px 12px 5px 0;vertical-align:top;white-space:nowrap">${k}</td><td style="color:#f5f5f0;font-size:14px">${esc(v)}</td></tr>`)
    .join("");

  try {
    await sendMail({
      to: clinicTo,
      bcc: clinicTo === "kontakt@aevia.dk" ? undefined : "kontakt@aevia.dk",
      subject: `Ny Aevia-booking til bekræftelse${navn ? " — " + navn : ""}`,
      html: shell(`<h1 style="color:#f5f5f0;font-size:19px;margin:0 0 12px;font-family:Georgia,serif">Ny booking til bekræftelse</h1>
        <table style="border-collapse:collapse;margin:0 0 18px">${rows}</table>
        <a href="${link}" style="display:inline-block;background:#c9a437;color:#0a1628;font-weight:bold;text-decoration:none;border-radius:999px;padding:13px 26px;font-size:15px">Bekræft eller foreslå tid</a>
        <p style="color:#94a0b2;font-size:13px;margin:14px 0 0">Linket åbner en side, hvor du vælger den konkrete tid. Kunden får automatisk besked og betalingslink.</p>`),
    });

    // kvittering til kunden
    await sendMail({
      to: email,
      subject: "Vi har modtaget dit forløb — vi koordinerer nu din tid",
      html: shell(`<h1 style="color:#f5f5f0;font-size:19px;margin:0 0 12px;font-family:Georgia,serif">Tak${navn ? ", " + esc(navn.split(" ")[0]) : ""} — vi er i gang</h1>
        <p style="color:#aab4c2;font-size:15px;line-height:1.6;margin:0 0 12px">Vi har modtaget dit ønskede forløb og koordinerer nu en konkret tid med laboratoriet i dit område.</p>
        <p style="color:#aab4c2;font-size:15px;line-height:1.6;margin:0 0 12px">Du hører fra os inden for <strong style="color:#f5f5f0">1 arbejdsdag</strong> med din bekræftede tid — og du betaler først, når tiden er bekræftet.</p>
        <p style="color:#94a0b2;font-size:13px;margin:0">Spørgsmål? Svar på denne mail eller ring +45 28 30 39 33.</p>`),
    });
  } catch (e) {
    console.error("booking mail-fejl:", e.message);
    return res.status(500).json({ error: "mail failed" });
  }

  return res.status(200).json({ ok: true });
}
