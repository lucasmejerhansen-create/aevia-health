// Aevia — klinikkens svar på en booking (bekræft tid / kan ikke).
// Kaldes fra /klinik-bekraeft.html. Verificerer det signerede token fra api/booking.js
// og sender den endelige bekræftelse + betalingslink til kunden. Ingen database.

import crypto from "node:crypto";
import { pendingRemove } from "./_booking-store.js";

const SITE = process.env.SITE_URL || "https://aevia.dk";

// pakke-label → checkout-nøgle (api/checkout.js)
const PKG_KEY = [
  [/core/i, "core"],
  [/plus|executive/i, "executive"],
  [/elite/i, "elite"],
];

function b64urlToBuf(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}
function verify(token, secret) {
  const i = (token || "").lastIndexOf(".");
  if (i < 1) return null;
  const p = token.slice(0, i), sig = token.slice(i + 1);
  const expect = crypto.createHmac("sha256", secret).update(p).digest();
  const got = b64urlToBuf(sig);
  if (expect.length !== got.length || !crypto.timingSafeEqual(expect, got)) return null;
  try { return JSON.parse(b64urlToBuf(p).toString("utf8")); } catch { return null; }
}

async function sendMail({ to, subject, html, bcc, attachments }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM || "Aevia <kontakt@aevia.dk>", to: [to], bcc: bcc ? [bcc] : undefined, subject, html, attachments }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
}

// Kalenderfil (.ics) for den bekræftede tid — 1 times varighed, lokal dansk tid.
function icsFor({ dato, tid, sted }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dato)) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(tid))) return null;
  const [y, mo, da] = dato.split("-").map(Number);
  const [hh, mi] = tid.split(":").map(Number);
  if (!y || !mo || !da || isNaN(hh)) return null;
  const p = (n) => (n < 10 ? "0" + n : "" + n);
  // Beregn slut via Date (1 times varighed), så sene tider ruller datoen korrekt
  // i stedet for ugyldigt 'T243000'.
  const startDt = new Date(y, mo - 1, da, hh, mi || 0, 0);
  const endDt = new Date(startDt.getTime() + 60 * 60 * 1000);
  const fmt = (d) => `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
  const start = fmt(startDt);
  const end = fmt(endDt);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const escIcs = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/[,;]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Aevia//Booking//DA", "METHOD:PUBLISH",
    "BEGIN:VEVENT", `UID:${stamp}-${Math.random().toString(36).slice(2, 10)}@aevia.dk`, `DTSTAMP:${stamp}`,
    `DTSTART:${start}`, `DTEND:${end}`, "SUMMARY:Aevia helbredstjek — prøvetagning",
    sted ? `LOCATION:${escIcs(sted)}` : null,
    "DESCRIPTION:Husk: fast 8-12 timer før blodprøven (vand er ok). Spørgsmål: kontakt@aevia.dk / +45 28 30 39 33",
    "BEGIN:VALARM", "TRIGGER:-PT12H", "ACTION:DISPLAY", "DESCRIPTION:Aevia i morgen — husk at faste (vand er ok)", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
}

const esc = (s) => String(s || "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));

function shell(inner, eyebrow) {
  return `<!DOCTYPE html><html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif">
  <div style="background:#eef2f7;padding:44px 16px">
  <div style="max-width:600px;margin:0 auto">
    <div style="text-align:center;padding-bottom:28px">
      <span style="font-size:32px;font-weight:bold;color:#0a1628;font-family:Georgia,'Times New Roman',serif;letter-spacing:-.5px">Aevia</span><span style="font-size:32px;font-weight:bold;color:#8a6d10;font-family:Georgia,serif">.</span>
    </div>
    <div style="background:#ffffff;border:1px solid #e3e8ee;border-radius:18px;overflow:hidden">
      <div style="height:3px;background:#c9a437;font-size:0;line-height:0">&nbsp;</div>
      <div style="padding:36px 38px 30px">
        ${eyebrow ? `<p style="margin:0 0 12px;font-size:11px;letter-spacing:3px;color:#8a6d10;font-weight:bold;text-transform:uppercase;font-family:Arial,sans-serif">${eyebrow}</p>` : ""}
        ${inner}
      </div>
      <div style="border-top:1px solid #eef1f4;padding:18px 38px;background:#f6f8fb">
        <p style="margin:0;color:#697585;font-size:13px">Sp&oslash;rgsm&aring;l? <a href="mailto:kontakt@aevia.dk" style="color:#8a6d10;text-decoration:none">kontakt@aevia.dk</a> &nbsp;&middot;&nbsp; <a href="tel:+4528303933" style="color:#8a6d10;text-decoration:none">+45 28 30 39 33</a></p>
      </div>
    </div>
    <p style="color:#5a6b80;font-size:12px;margin-top:22px;text-align:center;line-height:1.7">Aevia &middot; CVR 46 52 07 50<br><a href="${SITE}" style="color:#697585;text-decoration:none">aevia.dk</a></p>
  </div></div></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.RESEND_API_KEY || !process.env.BOOKING_SECRET)
    return res.status(500).json({ error: "not configured" });

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};

  const data = verify(b.t, process.env.BOOKING_SECRET);
  if (!data) return res.status(400).json({ error: "ugyldigt eller udløbet link" });
  // links er gyldige i 30 dage
  if (Date.now() - (data.ts || 0) > 30 * 24 * 3600 * 1000) return res.status(400).json({ error: "linket er udløbet" });

  const action = b.action === "confirm" ? "confirm" : "decline";
  const dato = (b.dato || "").toString().slice(0, 40);
  const tid = (b.tid || "").toString().slice(0, 20);
  const sted = (b.sted || "").toString().slice(0, 200);
  const besked = (b.besked || "").toString().slice(0, 2000);

  const fornavn = (data.navn || "").split(" ")[0];

  try {
    if (action === "confirm") {
      if (!dato || !tid) return res.status(400).json({ error: "dato og tid mangler" });
      const ics = icsFor({ dato, tid, sted });
      const attachments = ics ? [{ filename: "aevia-tid.ics", content: Buffer.from(ics).toString("base64") }] : undefined;
      let payLink = "";
      for (const [re, key] of PKG_KEY) {
        if (re.test(data.pakke || "")) { payLink = `${SITE}/api/checkout?pkg=${key}`; break; }
      }
      await sendMail({
        to: data.email,
        bcc: "kontakt@aevia.dk",
        attachments,
        subject: `Din tid er bekræftet: ${dato} kl. ${tid}`,
        html: shell(`<h1 style="color:#0a1628;font-size:24px;margin:0 0 16px;font-family:Georgia,serif;font-weight:normal">Din tid er bekræftet${fornavn ? ", " + esc(fornavn) : ""}</h1>
          <table style="border-collapse:collapse;margin:0 0 16px">
            <tr><td style="color:#697585;font-size:14px;padding:5px 12px 5px 0">Dato</td><td style="color:#0a1628;font-size:14px;font-weight:bold">${esc(dato)}</td></tr>
            <tr><td style="color:#697585;font-size:14px;padding:5px 12px 5px 0">Tidspunkt</td><td style="color:#0a1628;font-size:14px;font-weight:bold">kl. ${esc(tid)}</td></tr>
            ${sted ? `<tr><td style="color:#697585;font-size:14px;padding:5px 12px 5px 0">Sted</td><td style="color:#0a1628;font-size:14px">${esc(sted)}</td></tr>` : ""}
            ${data.pakke ? `<tr><td style="color:#697585;font-size:14px;padding:5px 12px 5px 0">Forløb</td><td style="color:#0a1628;font-size:14px">${esc(data.pakke)}</td></tr>` : ""}
          </table>
          ${besked ? `<p style="color:#46505f;font-size:14px;line-height:1.6;margin:0 0 16px"><strong style="color:#0a1628">Besked:</strong> ${esc(besked)}</p>` : ""}
          ${payLink ? `<a href="${payLink}" style="display:inline-block;background:#eef2f7;color:#ffffff;font-weight:bold;text-decoration:none;border-radius:999px;padding:13px 26px;font-size:15px">Gennemfør betaling</a><p style="color:#697585;font-size:13px;margin:14px 0 0">Din tid er reserveret. Gennemfør betalingen for at fastholde den.</p>` : `<p style="color:#46505f;font-size:14px;margin:0">Vi sender dit betalingslink i en separat mail.</p>`}
          <p style="color:#697585;font-size:13px;margin:16px 0 0">Kalenderinvitation er vedhæftet — føj tiden til din kalender med ét klik. Husk: fast 8-12 timer før blodprøven (vand er ok). Du får den fulde forberedelsesguide et par dage før din tid.</p>`, "Bekræftet tid"),
      });
    } else {
      await sendMail({
        to: "kontakt@aevia.dk",
        subject: `Klinik kan IKKE tage booking — ${data.navn || data.email}`,
        html: shell(`<h1 style="color:#0a1628;font-size:19px;margin:0 0 12px;font-family:Georgia,serif">Klinikken kan ikke tage bookingen</h1>
          <p style="color:#46505f;font-size:14px;line-height:1.6;margin:0 0 10px">Kunde: ${esc(data.navn)} · ${esc(data.email)} · ${esc(data.telefon)}</p>
          <p style="color:#46505f;font-size:14px;line-height:1.6;margin:0 0 10px">Forløb: ${esc(data.pakke)} ${esc(data.omraade ? "· " + data.omraade : "")}</p>
          ${besked ? `<p style="color:#46505f;font-size:14px;line-height:1.6;margin:0"><strong style="color:#0a1628">Klinikkens besked:</strong> ${esc(besked)}</p>` : ""}
          <p style="color:#697585;font-size:13px;margin:14px 0 0">Find en anden klinik/tid og kontakt kunden manuelt.</p>`),
      });
    }
  } catch (e) {
    console.error("booking-action mail-fejl:", e.message);
    return res.status(500).json({ error: "mail failed" });
  }

  // Fjern fra ubekræftet-listen (rykker-cron). Fejler stille uden Redis.
  try { await pendingRemove(String(data.ts)); } catch {}

  return res.status(200).json({ ok: true });
}
