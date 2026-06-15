// Aevia — kundens selvbetjening: se, aflys eller flyt sin booking.
//   GET  /api/min-booking?id=<id>&sig=<hmac>[&lang=en]   → side med detaljer
//   POST samme URL (form)                                → aflyser bookingen
//
// Linket sendes i bekræftelsesmailen og er signeret med BOOKING_SECRET, så det
// ikke kan gættes. "Flyt" = aflys + book ny tid (tiden frigives med det samme).
// Ved aflysning notificeres klinik/kontakt@ og ventelisten for området mailes.

import { getBooking, cancel, verifyBookingSig, waitlistPop, AREAS, SVC_LABELS } from "./_booking-store.js";
import { sendMail } from "./_emails.js";

const SITE = process.env.SITE_URL || "https://aevia.dk";

function fmt(date, time, lang) {
  try {
    return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "da-DK", {
      weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Copenhagen",
    }).format(new Date(date + "T00:00:00")) + " · " + time;
  } catch { return date + " · " + time; }
}

function page({ lang, title, body }) {
  const da = lang !== "en";
  return `<!DOCTYPE html><html lang="${da ? "da" : "en"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} | Aevia</title>
<style>body{margin:0;background:#eef2f7;color:#0a1628;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;line-height:1.6}
.card{max-width:480px;width:100%;background:#ffffff;border:1px solid #e3e8ee;border-radius:16px;padding:32px;text-align:center}
h1{font-family:Georgia,serif;font-size:1.4rem;margin:0 0 10px}
p{color:#46505f;font-size:.95rem;margin:0 0 14px}
.when{color:#8a6d10;font-weight:600;font-size:1.05rem;margin-bottom:18px}
.btn{display:inline-block;background:#eef2f7;color:#ffffff;font-weight:600;font-size:.93rem;text-decoration:none;border-radius:999px;padding:12px 24px;border:none;cursor:pointer;font-family:inherit;margin:4px}
.ghost{background:transparent;color:#8a6d10;border:1px solid #e3e8ee}
.logo{font-family:Georgia,serif;font-size:1.4rem;margin-bottom:18px}.logo span{color:#8a6d10}
.note{font-size:.8rem;color:#697585;margin-top:16px}</style></head>
<body><div class="card"><div class="logo">Aevia<span>.</span></div>${body}</div></body></html>`;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const q = req.query || {};
  const lang = String(q.lang || "").toLowerCase() === "en" ? "en" : "da";
  const da = lang !== "en";
  const id = String(q.id || "");
  const sig = String(q.sig || "");

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (!id || !verifyBookingSig(id, sig)) {
    return res.status(403).send(page({ lang, title: da ? "Ugyldigt link" : "Invalid link", body:
      `<h1>${da ? "Linket er ugyldigt" : "This link is invalid"}</h1><p>${da ? "Skriv til kontakt@aevia.dk, så hjælper vi dig." : "Write to kontakt@aevia.dk and we will help you."}</p>` }));
  }

  const b = await getBooking(id);
  if (!b) {
    return res.status(404).send(page({ lang, title: da ? "Ikke fundet" : "Not found", body:
      `<h1>${da ? "Bookingen blev ikke fundet" : "Booking not found"}</h1><p>${da ? "Den kan være udløbet eller allerede aflyst. Skriv til kontakt@aevia.dk." : "It may have expired or been cancelled. Write to kontakt@aevia.dk."}</p>` }));
  }

  const parts = b.parts || (b.date ? [{ svc: "blod", date: b.date, time: b.time }] : []);
  const whenHtml = parts.map((p) => {
    const l = SVC_LABELS[p.svc];
    return `<div style="margin-bottom:6px"><span style="color:#46505f;font-size:.85rem">${l ? (da ? l.da : l.en) : p.svc}</span><br>${fmt(p.date, p.time, lang)}</div>`;
  }).join("");
  const when = parts.map((p) => fmt(p.date, p.time, lang)).join(" · ");
  const bookUrl = `${SITE}/${da ? "" : "en/"}book.html`;

  // ── POST: aflys ──
  if (req.method === "POST") {
    if (b.status === "cancelled") {
      return res.status(200).send(page({ lang, title: da ? "Allerede aflyst" : "Already cancelled", body:
        `<h1>${da ? "Bookingen er allerede aflyst" : "Already cancelled"}</h1><a class="btn" href="${bookUrl}">${da ? "Book en ny tid" : "Book a new time"}</a>` }));
    }
    const r = await cancel(id);
    if (!r.ok) {
      return res.status(400).send(page({ lang, title: "Fejl", body:
        `<h1>${da ? "Kunne ikke aflyse" : "Could not cancel"}</h1><p>${r.reason || ""}</p><p>${da ? "Skriv til kontakt@aevia.dk." : "Write to kontakt@aevia.dk."}</p>` }));
    }

    // Notifikationer (må ikke vælte svaret)
    try {
      if (process.env.RESEND_API_KEY) {
        const to = (AREAS[b.area] && AREAS[b.area].clinic) || "kontakt@aevia.dk";
        await sendMail({ to, bcc: to === "kontakt@aevia.dk" ? undefined : "kontakt@aevia.dk",
          subject: `Aflyst af kunden: ${b.area} · ${when}`,
          html: `<p style="font-family:Arial,sans-serif">Kunden har aflyst:<br><b>${when}</b> · ${b.area}<br>${b.customer ? b.customer.name + " · " + b.customer.email : ""}<br>Booking-id: ${id}</p>` });

        // Venteliste: tiden er frigivet — giv besked (først til mølle).
        const waiters = await waitlistPop(b.area);
        for (const em of waiters) {
          try {
            await sendMail({ to: em,
              subject: da ? `En tid er blevet ledig i ${b.area}` : `A time has opened up in ${b.area}`,
              html: `<div style="font-family:Arial,sans-serif;background:#eef2f7;padding:30px"><div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e3e8ee;border-radius:14px;padding:26px"><p style="color:#0a1628;font-size:16px;font-weight:bold;margin:0 0 8px">${da ? "God nyhed — en tid er blevet ledig" : "Good news — a time has opened up"}</p><p style="color:#46505f;font-size:14px;margin:0 0 16px">${da ? `Der er netop blevet en tid ledig i ${b.area} (${when}). Først til mølle:` : `A slot just opened in ${b.area} (${when}). First come, first served:`}</p><a href="${bookUrl}" style="display:inline-block;background:#eef2f7;color:#ffffff;font-weight:bold;text-decoration:none;border-radius:999px;padding:12px 24px;font-size:14px">${da ? "Book tiden nu" : "Book the time now"}</a></div></div>` });
          } catch (e) { console.error("Venteliste-mailfejl:", e.message); }
        }
      }
    } catch (e) { console.error("Aflysningsnotifikation-fejl:", e.message); }

    return res.status(200).send(page({ lang, title: da ? "Aflyst" : "Cancelled", body:
      `<h1>${da ? "Din booking er aflyst" : "Your booking is cancelled"}</h1><p>${da ? "Alle tider er frigivet. Vil du vælge nye?" : "All slots have been released. Want to pick new ones?"}</p><a class="btn" href="${bookUrl}">${da ? "Book en ny tid" : "Book a new time"}</a>` }));
  }

  // ── GET: vis booking + handlinger ──
  if (b.status === "cancelled") {
    return res.status(200).send(page({ lang, title: da ? "Aflyst" : "Cancelled", body:
      `<h1>${da ? "Denne booking er aflyst" : "This booking is cancelled"}</h1><a class="btn" href="${bookUrl}">${da ? "Book en ny tid" : "Book a new time"}</a>` }));
  }
  return res.status(200).send(page({ lang, title: da ? "Din booking" : "Your booking", body:
    `<h1>${da ? "Din booking" : "Your booking"}</h1>
     <div class="when">${whenHtml}<span style="color:#46505f;font-weight:400;font-size:.9rem">${b.area}</span></div>
     <p>${da ? "Vil du flytte tiden, så aflys den her og book en ny — tiden frigives med det samme." : "To reschedule, cancel here and book a new time — the slot is released immediately."}</p>
     <form method="POST" action="${SITE}/api/min-booking?id=${id}&sig=${sig}&lang=${lang}" onsubmit="return confirm('${da ? "Er du sikker på, at du vil aflyse?" : "Are you sure you want to cancel?"}')">
       <button type="submit" class="btn ghost">${da ? "Aflys min tid" : "Cancel my appointment"}</button>
       <a class="btn" href="${bookUrl}">${da ? "Book en anden tid" : "Book another time"}</a>
     </form>
     <p class="note">${da ? "Spørgsmål? Skriv til kontakt@aevia.dk eller ring +45 28 30 39 33." : "Questions? Write to kontakt@aevia.dk or call +45 28 30 39 33."}</p>` }));
}
