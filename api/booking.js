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

function shell(eyebrow, inner) {
  return `<!DOCTYPE html><html lang="da"><body style="margin:0;padding:0;background:#0a1628;font-family:Arial,Helvetica,sans-serif">
  <div style="background:#0a1628;padding:44px 16px">
  <div style="max-width:600px;margin:0 auto">
    <div style="text-align:center;padding-bottom:28px">
      <span style="font-size:32px;font-weight:bold;color:#f5f5f0;font-family:Georgia,'Times New Roman',serif;letter-spacing:-.5px">Aevia</span><span style="font-size:32px;font-weight:bold;color:#c9a437;font-family:Georgia,serif">.</span>
    </div>
    <div style="background:#0f1f36;border:1px solid #28394f;border-radius:18px;overflow:hidden">
      <div style="height:3px;background:#c9a437;font-size:0;line-height:0">&nbsp;</div>
      <div style="padding:36px 38px 30px">
        ${eyebrow ? `<p style="margin:0 0 12px;font-size:11px;letter-spacing:3px;color:#c9a437;font-weight:bold;text-transform:uppercase;font-family:Arial,sans-serif">${eyebrow}</p>` : ""}
        ${inner}
      </div>
      <div style="border-top:1px solid #1d2c42;padding:18px 38px;background:#0d1b31">
        <p style="margin:0;color:#94a0b2;font-size:13px">Sp&oslash;rgsm&aring;l? <a href="mailto:kontakt@aevia.dk" style="color:#c9a437;text-decoration:none">kontakt@aevia.dk</a> &nbsp;&middot;&nbsp; <a href="tel:+4528303933" style="color:#c9a437;text-decoration:none">+45 28 30 39 33</a></p>
      </div>
    </div>
    <p style="color:#5a6b80;font-size:12px;margin-top:22px;text-align:center;line-height:1.7">Aevia Health ApS &middot; CVR 46 52 07 50<br><a href="${SITE}" style="color:#94a0b2;text-decoration:none">aevia.dk</a></p>
  </div></div></body></html>`;
}

const step = (n, title, body) => `<table role="presentation" style="border-collapse:collapse;margin:0 0 16px"><tr>
  <td style="vertical-align:top;padding-right:16px"><div style="width:32px;height:32px;border-radius:50%;background:#142840;border:1px solid #c9a437;color:#c9a437;font-weight:bold;font-size:14px;text-align:center;line-height:32px;font-family:Georgia,serif">${n}</div></td>
  <td style="vertical-align:top"><p style="margin:4px 0 3px;color:#f5f5f0;font-size:15px;font-weight:bold">${title}</p><p style="margin:0;color:#aab4c2;font-size:14px;line-height:1.6">${body}</p></td></tr></table>`;

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
    .map(([k, v], i, arr) => `<tr><td style="color:#94a0b2;font-size:13px;padding:11px 14px 11px 18px;vertical-align:top;white-space:nowrap;${i < arr.length - 1 ? "border-bottom:1px solid #1d2c42;" : ""}">${k}</td><td style="color:#f5f5f0;font-size:14px;padding:11px 18px 11px 0;${i < arr.length - 1 ? "border-bottom:1px solid #1d2c42;" : ""}">${esc(v)}</td></tr>`)
    .join("");

  try {
    await sendMail({
      to: clinicTo,
      bcc: clinicTo === "kontakt@aevia.dk" ? undefined : "kontakt@aevia.dk",
      subject: `Ny Aevia-booking til bekræftelse${navn ? " — " + navn : ""}`,
      html: shell("Til bekr\u00e6ftelse", `<h1 style="color:#f5f5f0;font-size:23px;margin:0 0 18px;font-family:Georgia,serif;font-weight:normal">Ny booking venter p\u00e5 en tid</h1>
        <table role="presentation" style="border-collapse:collapse;width:100%;margin:0 0 24px;background:#0c1830;border:1px solid #1d2c42;border-radius:12px">${rows}</table>
        <div style="text-align:center;margin:0 0 6px"><a href="${link}" style="display:inline-block;background:#c9a437;color:#0a1628;font-weight:bold;text-decoration:none;border-radius:999px;padding:15px 34px;font-size:15px">Bekr\u00e6ft eller foresl\u00e5 tid</a></div>
        <p style="color:#94a0b2;font-size:13px;line-height:1.6;margin:14px 0 0;text-align:center">Linket \u00e5bner en side, hvor du v\u00e6lger den konkrete tid.<br>Kunden f\u00e5r automatisk besked og betalingslink.</p>`),
    });

    // kvittering til kunden
    await sendMail({
      to: email,
      subject: "Vi har modtaget dit forløb — vi koordinerer nu din tid",
      html: shell("Din booking", `<h1 style="color:#f5f5f0;font-size:24px;margin:0 0 14px;font-family:Georgia,serif;font-weight:normal">Tak${navn ? ", " + esc(navn.split(" ")[0]) : ""} \u2014 vi er i gang</h1>
        <p style="color:#aab4c2;font-size:15px;line-height:1.7;margin:0 0 24px">Vi har modtaget dit \u00f8nskede forl\u00f8b. Her er, hvad der sker nu:</p>
        ${pakke || omraade ? `<div style="background:#0c1830;border:1px solid #1d2c42;border-left:3px solid #c9a437;border-radius:10px;padding:14px 18px;margin:0 0 26px">${pakke ? `<p style="margin:0;color:#f5f5f0;font-size:15px;font-weight:bold">${esc(pakke)}</p>` : ""}${omraade ? `<p style="margin:${pakke ? "4px" : "0"} 0 0;color:#94a0b2;font-size:13px">${esc(omraade)}</p>` : ""}</div>` : ""}
        ${step(1, "Vi koordinerer din tid", "Vi finder en konkret tid hos laboratoriet i dit omr\u00e5de \u2014 du h\u00f8rer fra os inden for <strong style='color:#f5f5f0'>1 arbejdsdag</strong>.")}
        ${step(2, "Du bekr\u00e6fter og betaler", "N\u00e5r tiden er bekr\u00e6ftet, f\u00e5r du en mail med et sikkert betalingslink. Du betaler f\u00f8rst, n\u00e5r tiden er p\u00e5 plads.")}
        ${step(3, "Du f\u00e5r din forberedelsesguide", "Et par dage f\u00f8r din tid sender vi en pr\u00e6cis guide \u2014 fx 8-12 timers faste f\u00f8r blodpr\u00f8ven (vand er ok).")}`),
    });
  } catch (e) {
    console.error("booking mail-fejl:", e.message);
    return res.status(500).json({ error: "mail failed" });
  }

  return res.status(200).json({ ok: true });
}
