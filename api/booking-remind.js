// Aevia — daglig booking-cron (se "crons" i vercel.json, kører hver morgen):
//   1) PÅMINDELSE til kunder med en eller flere tider I MORGEN
//      (fasteguide hvis blodprøve + flyt/aflys-link).
//   2) DAGSRAPPORT pr. ydelses-klinik med DAGENS tider.
//
// Sikkerhed: Vercel Cron sender "Authorization: Bearer <CRON_SECRET>".
// Miljøvariabler: CRON_SECRET, KV_REST_API_URL, KV_REST_API_TOKEN, RESEND_API_KEY, MAIL_FROM

import { AREAS, SVC_LABELS, listDay, bookingSig, isConfigured, effectiveConf } from "./_booking-store.js";
import { sendMail } from "./_emails.js";

const SITE = process.env.SITE_URL || "https://aevia.dk";

function isoPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function fmtDay(date, lang) {
  try {
    return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "da-DK", {
      weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Copenhagen",
    }).format(new Date(date + "T00:00:00"));
  } catch { return date; }
}
function svcLabel(svc, lang) {
  const l = SVC_LABELS[svc];
  return l ? (lang === "en" ? l.en : l.da) : svc;
}

function reminderMail({ b, partsTomorrow, lang }) {
  const da = lang !== "en";
  const manageUrl = `${SITE}/api/min-booking?id=${b.id}&sig=${bookingSig(b.id)}${da ? "" : "&lang=en"}`;
  const hasBlood = partsTomorrow.some((p) => p.svc === "blod");
  const rows = partsTomorrow.map((p) =>
    `<tr><td style="color:#0a1628;font-size:14px;padding:6px 0">${svcLabel(p.svc, lang)}</td><td style="color:#8a6d10;font-size:14px;font-weight:bold;text-align:right">${p.time}</td></tr>`).join("");
  const prep = hasBlood
    ? `<p style="color:#46505f;font-size:15px;line-height:1.6;margin:0 0 10px"><strong style="color:#0a1628">${da ? "Din forberedelse til blodprøven:" : "Your preparation for the blood draw:"}</strong></p>
      <ul style="color:#46505f;font-size:15px;line-height:1.7;margin:0 0 16px;padding-left:20px">
        <li>${da ? "Fast 8-12 timer før — vand er ok, kaffe og mad er ikke." : "Fast 8-12 hours before — water is fine, coffee and food are not."}</li>
        <li>${da ? "Undgå hård træning i dag." : "Avoid hard training today."}</li>
        <li>${da ? "Ingen alkohol." : "No alcohol."}</li>
      </ul>`
    : "";
  return {
    subject: da ? `Husk dine tider hos Aevia i morgen` : `Reminder: your Aevia appointments tomorrow`,
    html: `<!DOCTYPE html><html lang="${da ? "da" : "en"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:36px 24px">
    <div style="font-size:26px;font-weight:bold;color:#0a1628;font-family:Georgia,serif">Aevia<span style="color:#8a6d10">.</span></div>
    <div style="background:#ffffff;border:1px solid #e3e8ee;border-radius:14px;padding:28px;margin-top:22px">
      <h1 style="color:#0a1628;font-size:20px;margin:0 0 6px;font-family:Georgia,serif">${da ? "Vi ses i morgen" : "See you tomorrow"}</h1>
      <p style="color:#697585;font-size:13px;margin:0 0 12px">${fmtDay(partsTomorrow[0].date, lang)} · ${b.area}</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 14px">${rows}</table>
      ${prep}
      <p style="color:#46505f;font-size:14px;line-height:1.6;margin:0">${da
        ? `Kan du alligevel ikke komme? <a href="${manageUrl}" style="color:#8a6d10">Aflys eller flyt her</a> — så kan en anden få tiden.`
        : `Can't make it after all? <a href="${manageUrl}" style="color:#8a6d10">Cancel or reschedule here</a> — so someone else can have the slot.`}</p>
    </div>
    <p style="color:#697585;font-size:12px;margin-top:18px;text-align:center">Aevia · CVR 46 52 07 50 · <a href="${SITE}" style="color:#8a6d10">aevia.dk</a></p>
  </div></body></html>`,
  };
}

export default async function handler(req, res) {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!isConfigured() || !process.env.RESEND_API_KEY) {
    return res.status(200).json({ ok: true, skipped: "ikke konfigureret" });
  }

  const tomorrow = isoPlus(1);
  const today = isoPlus(0);
  let reminders = 0, reports = 0;
  const errors = [];

  for (const area of Object.keys(AREAS)) {
    if (!AREAS[area].ready) continue;

    // 1) Kunde-påmindelser: bookinger med mindst én part i morgen
    try {
      const list = (await listDay(area, tomorrow)).filter((b) => b.status === "confirmed");
      for (const b of list) {
        const partsTomorrow = (b.parts || []).filter((p) => p.date === tomorrow);
        if (!partsTomorrow.length) continue;
        try {
          const lang = (b.customer && b.customer.lang) || "da";
          const m = reminderMail({ b, partsTomorrow, lang });
          await sendMail({ to: b.customer.email, subject: m.subject, html: m.html });
          reminders++;
        } catch (e) { errors.push(`påmindelse ${b.id}: ${e.message}`); }
      }
    } catch (e) { errors.push(`listDay ${area}: ${e.message}`); }

    // 2) Dagsrapport pr. ydelse — hver klinik får kun sine egne tider
    try {
      const todays = (await listDay(area, today)).filter((b) => b.status === "confirmed");
      const bySvc = {};
      for (const b of todays) {
        for (const p of (b.parts || []).filter((p) => p.date === today)) {
          (bySvc[p.svc] = bySvc[p.svc] || []).push({ time: p.time, c: b.customer });
        }
      }
      for (const svc of Object.keys(bySvc)) {
        const rows = bySvc[svc].sort((a, b) => a.time.localeCompare(b.time)).map((x) =>
          `<tr><td style="padding:6px 10px;border-bottom:1px solid #ddd"><b>${x.time}</b></td><td style="padding:6px 10px;border-bottom:1px solid #ddd">${x.c.name}</td><td style="padding:6px 10px;border-bottom:1px solid #ddd">${x.c.phone || x.c.email}</td></tr>`).join("");
        const conf = (await effectiveConf(area, svc)) || {};
        const to = conf.email || "kontakt@aevia.dk";
        await sendMail({
          to, bcc: to === "kontakt@aevia.dk" ? undefined : "kontakt@aevia.dk",
          subject: `Aevia i dag: ${bySvc[svc].length} × ${svcLabel(svc, "da")} · ${area}`,
          html: `<div style="font-family:Arial,sans-serif"><h2 style="font-family:Georgia,serif">Dagens Aevia-tider · ${svcLabel(svc, "da")} · ${fmtDay(today, "da")}</h2><table style="border-collapse:collapse;font-size:14px"><tr><th style="text-align:left;padding:6px 10px">Tid</th><th style="text-align:left;padding:6px 10px">Navn</th><th style="text-align:left;padding:6px 10px">Kontakt</th></tr>${rows}</table><p style="color:#667;font-size:13px">Spørgsmål: kontakt@aevia.dk · +45 28 30 39 33</p></div>`,
        });
        reports++;
      }
    } catch (e) { errors.push(`rapport ${area}: ${e.message}`); }
  }

  return res.status(200).json({ ok: true, reminders, reports, errors: errors.length ? errors : undefined });
}
