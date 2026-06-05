// Aevia — daglig booking-cron (se "crons" i vercel.json, kører hver morgen):
//   1) PÅMINDELSE til kunder med tid I MORGEN (inkl. fasteguide + flyt/aflys-link).
//   2) DAGSRAPPORT til klinikken (eller kontakt@) med DAGENS bookinger.
//   3) RYKKER til kontakt@ ved mail-flow-bookinger uden svar i 20+ timer.
//
// Sikkerhed: Vercel Cron sender "Authorization: Bearer <CRON_SECRET>".
// Miljøvariabler: CRON_SECRET, KV_REST_API_URL, KV_REST_API_TOKEN, RESEND_API_KEY, MAIL_FROM

import { AREAS, listDay, bookingSig, isConfigured, pendingList, pendingMarkReminded } from "./_booking-store.js";
import { sendMail } from "./_emails.js";

const SITE = process.env.SITE_URL || "https://aevia.dk";

function isoPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function fmt(date, lang) {
  try {
    return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "da-DK", {
      weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Copenhagen",
    }).format(new Date(date + "T00:00:00"));
  } catch { return date; }
}

function reminderMail({ b, lang }) {
  const da = lang !== "en";
  const manageUrl = `${SITE}/api/min-booking?id=${b.id}&sig=${bookingSig(b.id)}${da ? "" : "&lang=en"}`;
  const when = fmt(b.date, lang) + " kl. " + b.time;
  return {
    subject: da ? `Husk din tid hos Aevia i morgen kl. ${b.time}` : `Reminder: your Aevia appointment tomorrow at ${b.time}`,
    html: `<!DOCTYPE html><html lang="${da ? "da" : "en"}"><body style="margin:0;background:#0a1628;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:36px 24px">
    <div style="font-size:26px;font-weight:bold;color:#f5f5f0;font-family:Georgia,serif">Aevia<span style="color:#c9a437">.</span></div>
    <div style="background:#0f1f36;border:1px solid #28394f;border-radius:14px;padding:28px;margin-top:22px">
      <h1 style="color:#f5f5f0;font-size:20px;margin:0 0 12px;font-family:Georgia,serif">${da ? "Vi ses i morgen" : "See you tomorrow"}</h1>
      <p style="color:#c9a437;font-size:16px;font-weight:bold;margin:0 0 14px">${when} · ${b.area}</p>
      <p style="color:#aab4c2;font-size:15px;line-height:1.6;margin:0 0 10px"><strong style="color:#f5f5f0">${da ? "Din forberedelse:" : "Your preparation:"}</strong></p>
      <ul style="color:#aab4c2;font-size:15px;line-height:1.7;margin:0 0 16px;padding-left:20px">
        <li>${da ? "Fast 8-12 timer før blodprøven — vand er ok, kaffe og mad er ikke." : "Fast 8-12 hours before the blood draw — water is fine, coffee and food are not."}</li>
        <li>${da ? "Undgå hård træning i dag — det påvirker leverenzymer og inflammation." : "Avoid hard training today — it affects liver enzymes and inflammation."}</li>
        <li>${da ? "Ingen alkohol — det påvirker flere af dine markører." : "No alcohol — it affects several of your markers."}</li>
      </ul>
      <p style="color:#aab4c2;font-size:14px;line-height:1.6;margin:0">${da
        ? `Kan du alligevel ikke komme? <a href="${manageUrl}" style="color:#c9a437">Aflys eller flyt din tid her</a> — så kan en anden få den.`
        : `Can't make it after all? <a href="${manageUrl}" style="color:#c9a437">Cancel or reschedule here</a> — so someone else can have the slot.`}</p>
    </div>
    <p style="color:#94a0b2;font-size:12px;margin-top:18px;text-align:center">Aevia Health ApS · CVR 46 52 07 50 · <a href="${SITE}" style="color:#c9a437">aevia.dk</a></p>
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

    // 1) Kunde-påmindelser for i morgen
    try {
      const list = (await listDay(area, tomorrow)).filter((b) => b.status === "confirmed");
      for (const b of list) {
        try {
          const lang = (b.customer && b.customer.lang) || "da";
          const m = reminderMail({ b, lang });
          await sendMail({ to: b.customer.email, subject: m.subject, html: m.html });
          reminders++;
        } catch (e) { errors.push(`påmindelse ${b.id}: ${e.message}`); }
      }
    } catch (e) { errors.push(`listDay ${area}: ${e.message}`); }

    // 2) Dagsrapport til klinikken for i dag
    try {
      const todays = (await listDay(area, today)).filter((b) => b.status === "confirmed")
        .sort((a, b) => a.time.localeCompare(b.time));
      if (todays.length) {
        const to = AREAS[area].clinic || "kontakt@aevia.dk";
        const rows = todays.map((b) =>
          `<tr><td style="padding:6px 10px;border-bottom:1px solid #ddd"><b>${b.time}</b></td><td style="padding:6px 10px;border-bottom:1px solid #ddd">${b.customer.name}</td><td style="padding:6px 10px;border-bottom:1px solid #ddd">${b.customer.pkg || "—"}</td><td style="padding:6px 10px;border-bottom:1px solid #ddd">${b.customer.phone || b.customer.email}</td></tr>`).join("");
        await sendMail({
          to, bcc: to === "kontakt@aevia.dk" ? undefined : "kontakt@aevia.dk",
          subject: `Aevia i dag: ${todays.length} booking${todays.length > 1 ? "er" : ""} · ${area}`,
          html: `<div style="font-family:Arial,sans-serif"><h2 style="font-family:Georgia,serif">Dagens Aevia-bookinger · ${fmt(today, "da")}</h2><table style="border-collapse:collapse;font-size:14px"><tr><th style="text-align:left;padding:6px 10px">Tid</th><th style="text-align:left;padding:6px 10px">Navn</th><th style="text-align:left;padding:6px 10px">Pakke</th><th style="text-align:left;padding:6px 10px">Kontakt</th></tr>${rows}</table><p style="color:#667;font-size:13px">Alle kunder er instrueret i 8-12 timers faste. Spørgsmål: kontakt@aevia.dk · +45 28 30 39 33</p></div>`,
        });
        reports++;
      }
    } catch (e) { errors.push(`rapport ${area}: ${e.message}`); }
  }

  // 3) Rykker: ubekræftede bookinger fra mail-flowet (api/booking.js)
  let rushed = 0;
  try {
    const pending = await pendingList();
    const now = Date.now();
    for (const p of pending) {
      if (p.reminded) continue;
      const ageH = (now - (p.ts || 0)) / 3600000;
      if (ageH < 20) continue;
      try {
        await sendMail({
          to: "kontakt@aevia.dk",
          subject: `\u23f0 RYKKER: Ubekr\u00e6ftet booking \u2014 ${p.navn || p.email} (${Math.floor(ageH)} timer)`,
          html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#222">
            <p><strong>${p.navn || "?"}</strong> sendte en booking-foresp\u00f8rgsel for <strong>${Math.floor(ageH)} timer</strong> siden \u2014 og ingen har bekr\u00e6ftet en tid endnu.</p>
            <p>Pakke: ${p.pakke || "?"}<br>Omr\u00e5de: ${p.omraade || "?"}<br>E-mail: ${p.email || "?"}</p>
            <p>Find mailen "Ny booking venter p\u00e5 en tid" i indbakken og bekr\u00e6ft via knappen \u2014 eller ring til kunden. L\u00f8ftet er svar inden for 1 arbejdsdag.</p>
            <p style="color:#888;font-size:13px">Denne rykker sendes kun \u00e9n gang pr. booking.</p>
          </div>`,
        });
        await pendingMarkReminded(p.id);
        rushed++;
      } catch (e) { errors.push(`rykker ${p.id}: ${e.message}`); }
    }
  } catch (e) { errors.push(`pendingList: ${e.message}`); }

  return res.status(200).json({ ok: true, reminders, reports, rushed, errors: errors.length ? errors : undefined });
}
