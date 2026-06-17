// Aevia — klinik-portal (admin for partnerklinikker).
// Klinikken styrer SELV sine Aevia-tider: ugentligt skema (dage/tider/varighed/
// kapacitet), blokering af enkeltdage (ferie/sygdom), og markering af fremmøde.
// Alt slår igennem med det samme → kunder ser kun reelt ledige tider og får
// instant bekræftelse.
//
//   GET  /api/clinic-portal?token=<nøgle>&date=<YYYY-MM-DD>[&svc=<ydelse>]
//   POST /api/clinic-portal { token, action, ... }
//     action:
//       "block" | "unblock"                { svc, date, time }
//       "blockday" | "unblockday"          { svc, date }
//       "saveRules"  { svc, wd:[0-6], open:"HH:MM", close:"HH:MM", slot, cap, clinic?, email? }
//       "setactive"  { svc, active:bool }
//       "attendance" { bookingId, svc, date, time, status:"done"|"noshow"|"" }
//
// CLINIC_TOKENS i Vercel mapper nøgle → adgang:
//   Hele området:  {"nøgle1":"Herning-området"}
//   Kun én ydelse: {"nøgle2":"Herning-området:kondition"}

import {
  AREAS, SVC_LABELS, listDay, blockedTimes, blockTime, unblockTime,
  slotsForDateEff, saveRules, setServiceActive, configForEditor,
  getBooking, markAttendance, isConfigured,
} from "./_booking-store.js";
import { tooManyFails, bearerToken } from "./_ratelimit.js";
import { fetchBusy, normalizeIcsUrl } from "./_calendar.js";

// 403 + brute-force-bremse: tæl auth-fejl, returnér 429 ved for mange.
async function deny(req, res) {
  if (await tooManyFails(req, "clinic-portal")) return res.status(429).json({ error: "For mange forsøg. Prøv igen senere." });
  return res.status(403).json({ error: "Adgang nægtet" });
}

function accessForToken(token) {
  try {
    const map = JSON.parse(process.env.CLINIC_TOKENS || "{}");
    const v = token && map[String(token)];
    if (!v) return null;
    const [area, svc] = String(v).split(":");
    if (!AREAS[area]) return null;
    return { area, svc: svc || null }; // svc=null → alle standard-ydelser i området
  } catch { return null; }
}

// Hvilke ydelser må denne nøgle styre? Et område-token kan konfigurere alle
// standard-ydelser (også tilføje en ny); et ydelse-token kun sin egen.
function allowedSvcs(access) {
  const all = Object.keys(SVC_LABELS);
  return access.svc ? all.filter((s) => s === access.svc) : all;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  // ── GET: dagens overblik + skema for valgt ydelse ──────────────────────────
  if (req.method === "GET") {
    const { date, svc } = req.query || {};
    const token = bearerToken(req) || (req.query && req.query.token); // header foretrukket; query som fallback
    const access = accessForToken(token);
    if (!access) return deny(req, res);
    if (!isConfigured()) return res.status(200).json({ configured: false, area: access.area });

    const svcs = allowedSvcs(access);
    const chosen = svc && svcs.includes(String(svc)) ? String(svc) : svcs[0];
    if (!chosen) return res.status(200).json({ configured: true, area: access.area, svcs: [], slots: [], bookings: [] });
    const d = DATE_RE.test(String(date || "")) ? String(date) : new Date().toISOString().slice(0, 10);

    try {
      const rule = await configForEditor(access.area, chosen);
      const all = await slotsForDateEff(access.area, chosen, d);
      const blocked = new Set(await blockedTimes(access.area, chosen, d));
      const dayBookings = (await listDay(access.area, d)).filter((b) => b.status === "confirmed");
      const partRows = [];
      const bookedTimes = new Set();
      for (const b of dayBookings) {
        for (const p of (b.parts || []).filter((p) => p.date === d && p.svc === chosen)) {
          bookedTimes.add(p.time);
          // Dataminimering: klinikken får kun navn + ÉN kontaktkanal — ikke
          // e-mail+telefon+pakke. Ydelsen kender de allerede (portalen er pr. ydelse).
          partRows.push({
            id: b.id, svc: chosen, time: p.time,
            customer: { name: (b.customer && b.customer.name) || "", contact: (b.customer && (b.customer.phone || b.customer.email)) || "" },
            attendance: (b.att && b.att[`${chosen}:${d}:${p.time}`]) || "",
          });
        }
      }
      const slots = all.map((t) => ({
        time: t, status: bookedTimes.has(t) ? "booked" : blocked.has(t) ? "blocked" : "free",
      }));
      partRows.sort((a, b) => a.time.localeCompare(b.time));
      return res.status(200).json({
        configured: true, area: access.area, svc: chosen, date: d,
        svcs: svcs.map((s) => ({ key: s, label: (SVC_LABELS[s] && SVC_LABELS[s].da) || s })),
        rule, slots, bookings: partRows,
      });
    } catch (e) {
      console.error("clinic GET-fejl:", e.message);
      return res.status(500).json({ error: "Kunne ikke hente data" });
    }
  }

  // ── POST: ændringer ────────────────────────────────────────────────────────
  if (req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
    const { action } = body || {};
    const token = bearerToken(req) || (body && body.token);
    const access = accessForToken(token);
    if (!access) return deny(req, res);
    if (!isConfigured()) return res.status(503).json({ error: "Ikke konfigureret" });

    const svcs = allowedSvcs(access);
    const chosen = body.svc && svcs.includes(String(body.svc)) ? String(body.svc) : null;

    try {
      // Skema gem / til-fra
      if (action === "saveRules") {
        if (!chosen) return res.status(400).json({ error: "Ugyldig ydelse" });
        const r = await saveRules(access.area, chosen, body);
        return r.ok ? res.status(200).json({ ok: true, rule: r.rule }) : res.status(400).json({ error: r.reason || "Kunne ikke gemme" });
      }
      if (action === "setactive") {
        if (!chosen) return res.status(400).json({ error: "Ugyldig ydelse" });
        const r = await setServiceActive(access.area, chosen, !!body.active);
        return r.ok ? res.status(200).json({ ok: true, active: r.active }) : res.status(400).json({ error: "Kunne ikke ændre status" });
      }
      // Test af tilknyttet kalender: hent ICS og rapportér antal hændelser.
      if (action === "testcal") {
        const url = normalizeIcsUrl(body.calUrl || "");
        if (!url) return res.status(400).json({ error: "Indsæt en gyldig https-ICS-URL (Google/Outlook/Apple)" });
        const busy = await fetchBusy(url);
        return res.status(200).json({ ok: true, events: busy.length });
      }

      // Fremmøde — kun for en booking der reelt hører til denne klinik
      if (action === "attendance") {
        if (!chosen) return res.status(400).json({ error: "Ugyldig ydelse" });
        const id = String(body.bookingId || "");
        const time = String(body.time || "");
        const date = String(body.date || "");
        if (!id || !DATE_RE.test(date) || !/^\d{2}:\d{2}$/.test(time)) return res.status(400).json({ error: "Ugyldige felter" });
        const b = await getBooking(id);
        const owns = b && (b.parts || []).some((p) => p.svc === chosen && p.date === date && p.time === time) && b.area === access.area;
        if (!owns) return res.status(403).json({ error: "Bookingen hører ikke til denne klinik" });
        const status = ["done", "noshow"].includes(body.status) ? body.status : "";
        const r = await markAttendance(id, `${chosen}:${date}:${time}`, status);
        return r.ok ? res.status(200).json({ ok: true }) : res.status(400).json({ error: "Kunne ikke gemme" });
      }

      // Blokering af tider (undtagelser) — kræver gyldig dato
      const d = String(body.date || "");
      if (!DATE_RE.test(d)) return res.status(400).json({ error: "Ugyldig dato" });
      if (!chosen) return res.status(400).json({ error: "Ugyldig ydelse" });
      const time = body.time ? String(body.time) : "";
      if ((action === "block" || action === "unblock") && !/^\d{2}:\d{2}$/.test(time))
        return res.status(400).json({ error: "Ugyldig tid" });

      if (action === "block" && time) { await blockTime(access.area, chosen, d, time); return res.status(200).json({ ok: true }); }
      if (action === "unblock" && time) { await unblockTime(access.area, chosen, d, time); return res.status(200).json({ ok: true }); }
      if (action === "blockday") {
        for (const t of await slotsForDateEff(access.area, chosen, d)) await blockTime(access.area, chosen, d, t);
        return res.status(200).json({ ok: true });
      }
      if (action === "unblockday") {
        for (const t of await slotsForDateEff(access.area, chosen, d)) await unblockTime(access.area, chosen, d, t);
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ error: "Ukendt handling" });
    } catch (e) {
      console.error("clinic POST-fejl:", e.message);
      return res.status(500).json({ error: "Handlingen fejlede" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
