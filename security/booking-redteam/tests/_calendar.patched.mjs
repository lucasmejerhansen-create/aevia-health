// Aevia — ICS-kalender-sync. Klinikken tilknytter sin kalenders private ICS-URL;
// vi læser optaget-tider og blokerer dem i Aevia-ledigheden. _-præfiks → ikke et
// endpoint.

import dns from "node:dns/promises";
import net from "node:net";
//
// Tidszone: Aevia-tider er dansk lokaltid. ICS-tider normaliseres til UTC-ms:
//   ...Z            = UTC direkte
//   floating/TZID   = tolkes som dansk lokaltid (korrekt for Europe/Copenhagen)
//   VALUE=DATE      = heldags → blokerer hele den danske dag

// Sidste søndag i en måned, kl. 01:00 UTC (EU-sommertids-skift).
function lastSundayUTC(year, month) {
  const d = new Date(Date.UTC(year, month + 1, 0, 1, 0, 0)); // sidste dag i måneden
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());              // tilbage til søndag
  return d.getTime();
}
// Er dansk tid i sommertid (CEST, +2) på dette UTC-tidspunkt? Ellers CET (+1).
function dkOffsetMin(utcMs) {
  const y = new Date(utcMs).getUTCFullYear();
  return (utcMs >= lastSundayUTC(y, 2) && utcMs < lastSundayUTC(y, 9)) ? 120 : 60;
}
// Dansk vægur-tid → UTC-ms.
export function dkLocalToUtc(y, mo, d, h, mi) {
  const naive = Date.UTC(y, mo, d, h, mi, 0);
  return naive - dkOffsetMin(naive) * 60000;
}

// Parse et ICS-tidsstempel (efter ':') + evt. params → UTC-ms-interval-grænse.
function parseDt(val, isDateOnly) {
  if (isDateOnly || /^\d{8}$/.test(val)) {
    const y = +val.slice(0, 4), mo = +val.slice(4, 6) - 1, d = +val.slice(6, 8);
    return { ms: dkLocalToUtc(y, mo, d, 0, 0), dateOnly: true };
  }
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(val);
  if (!m) return null;
  const [, Y, Mo, D, H, Mi, S, Z] = m;
  if (Z) return { ms: Date.UTC(+Y, +Mo - 1, +D, +H, +Mi, +S) };
  return { ms: dkLocalToUtc(+Y, +Mo - 1, +D, +H, +Mi) }; // floating/TZID → dansk lokaltid
}

// ICS-tekst → liste af optaget-intervaller [{start, end}] i UTC-ms.
const WD = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
// Hårde lofter mod algoritmisk DoS (ICS-01): begræns både antallet af VEVENT'er
// i ét feed OG det samlede ekspansions-arbejde på tværs af alle VEVENT'er.
const MAX_VEVENTS = 5000;          // afbryd parsing efter så mange VEVENT'er
const MAX_TOTAL_ITERS = 200000;    // globalt budget for dag-iterationer i ét feed
const MAX_INTERVAL = 1000;         // cap på RRULE INTERVAL (degenererede feeds)
function parseRRule(s) {
  const o = {};
  for (const part of String(s).split(";")) { const i = part.indexOf("="); if (i > 0) o[part.slice(0, i).toUpperCase()] = part.slice(i + 1); }
  return o;
}
// Ekspandér gentaget hændelse (DAILY/WEEKLY m. INTERVAL/COUNT/UNTIL/BYDAY) inden
// for [winStart, winEnd]. Ikke-understøttede frekvenser → kun førsteforekomst.
// budget: { left } — delt iterations-budget på tværs af alle VEVENT'er i feedet.
function expandRRule(startMs, durMs, rruleStr, exset, winStart, winEnd, budget) {
  const out = [];
  const r = parseRRule(rruleStr);
  const freq = (r.FREQ || "").toUpperCase();
  const interval = Math.min(MAX_INTERVAL, Math.max(1, parseInt(r.INTERVAL || "1", 10) || 1));
  const count = r.COUNT ? (parseInt(r.COUNT, 10) || Infinity) : Infinity;
  let until = Infinity;
  if (r.UNTIL) { const m = /^(\d{4})(\d{2})(\d{2})/.exec(r.UNTIL); if (m) until = Date.UTC(+m[1], +m[2] - 1, +m[3], 23, 59, 59); }
  const byday = r.BYDAY ? r.BYDAY.split(",").map((d) => WD[d.replace(/^[+-]?\d+/, "").toUpperCase()]).filter((n) => n != null) : null;
  if (freq !== "DAILY" && freq !== "WEEKLY") {
    if (startMs >= winStart - durMs && startMs <= winEnd && !exset.has(startMs)) out.push({ start: startMs, end: startMs + durMs });
    return out;
  }
  const DAY = 86400000;
  const startDay = Math.floor(startMs / DAY) * DAY;
  const tod = startMs - startDay;
  const startWeekday = new Date(startMs).getUTCDay();
  const weekAnchor = startDay - startWeekday * DAY;
  // ICS-01: spring direkte frem til den første dag, der kan ramme vinduet, i
  // stedet for at iterere dag-for-dag fra DTSTART (som kan ligge år i fortiden).
  const winFloor = winStart - durMs;
  let firstDay = startDay;
  if (winFloor > startMs) {
    const daysAhead = Math.floor((winFloor - startDay) / DAY);
    firstDay = startDay + daysAhead * DAY; // bevarer fase mod startDay (DAILY/WEEKLY-modulo holder)
  }
  let emitted = 0, cap = 4000;
  for (let day = firstDay; day <= winEnd && emitted < count && cap > 0; day += DAY, cap--) {
    if (budget.left <= 0) break;        // globalt feed-budget opbrugt
    budget.left--;
    const occ = day + tod;
    if (occ < startMs) continue;
    if (occ > until) break;
    let match;
    if (freq === "DAILY") match = (Math.round((day - startDay) / DAY) % interval) === 0;
    else {
      const onDay = byday ? byday.includes(new Date(occ).getUTCDay()) : (new Date(occ).getUTCDay() === startWeekday);
      match = onDay && (Math.floor((day - weekAnchor) / (7 * DAY)) % interval) === 0;
    }
    if (match) { emitted++; if (occ >= winStart - durMs && !exset.has(occ)) out.push({ start: occ, end: occ + durMs }); }
  }
  return out;
}

export function parseICS(text) {
  // Fold sammenklappede linjer (fortsættelse starter med mellemrum/tab).
  const lines = String(text).replace(/\r\n/g, "\n").split("\n");
  const merged = [];
  for (const ln of lines) {
    if (/^[ \t]/.test(ln) && merged.length) merged[merged.length - 1] += ln.slice(1);
    else merged.push(ln);
  }
  const out = [];
  const now = Date.now();
  const winStart = now - 2 * 86400000;
  const winEnd = now + 60 * 86400000; // dækker lead..horizon (42d) + buffer
  const budget = { left: MAX_TOTAL_ITERS }; // ICS-01: delt iterations-budget for hele feedet
  let veventCount = 0;
  let inEv = false, start = null, end = null, rrule = null, rdates = [], exdates = [];
  for (const ln of merged) {
    const up = ln.toUpperCase();
    if (up.startsWith("BEGIN:VEVENT")) {
      if (++veventCount > MAX_VEVENTS) break; // ICS-01: loft på antal VEVENT'er
      inEv = true; start = end = rrule = null; rdates = []; exdates = []; continue;
    }
    if (up.startsWith("END:VEVENT")) {
      if (start) {
        let e = end ? end.ms : (start.dateOnly ? start.ms + 86400000 : start.ms);
        if (e <= start.ms) e = start.ms + (start.dateOnly ? 86400000 : 0);
        const dur = Math.max(e - start.ms, start.dateOnly ? 86400000 : 0);
        const exset = new Set(exdates);
        if (rrule) {
          for (const iv of expandRRule(start.ms, dur, rrule, exset, winStart, winEnd, budget)) out.push(iv);
        } else if (dur > 0 && !exset.has(start.ms)) {
          out.push({ start: start.ms, end: start.ms + dur });
        }
        for (const rd of rdates) if (dur > 0) out.push({ start: rd, end: rd + dur }); // RDATE-ekstradatoer
      }
      inEv = false; continue;
    }
    if (!inEv) continue;
    const ci = ln.indexOf(":"); if (ci < 0) continue;
    const head = ln.slice(0, ci).toUpperCase(), val = ln.slice(ci + 1).trim();
    const isDate = head.includes("VALUE=DATE");
    if (head.startsWith("DTSTART")) start = parseDt(val, isDate);
    else if (head.startsWith("DTEND")) end = parseDt(val, isDate);
    else if (head.startsWith("RRULE")) rrule = val;
    else if (head.startsWith("EXDATE")) { for (const v of val.split(",")) { const dp = parseDt(v.trim(), isDate); if (dp) exdates.push(dp.ms); } }
    else if (head.startsWith("RDATE")) { for (const v of val.split(",")) { const dp = parseDt(v.trim(), isDate); if (dp) rdates.push(dp.ms); } }
  }
  return out;
}

// ── SSRF-værn ────────────────────────────────────────────────────────────────
function ipv4Private(ip) {
  const o = ip.split(".").map(Number);
  if (o.length !== 4 || o.some((n) => isNaN(n) || n < 0 || n > 255)) return true; // ugyldig → afvis
  const [a, b] = o;
  return a === 10 || a === 127 || a === 0 ||
    (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}
function ipPrivate(ip) {
  const v = net.isIP(ip);
  if (v === 4) return ipv4Private(ip);
  if (v === 6) {
    const lo = ip.toLowerCase();
    if (lo === "::1" || lo === "::") return true;
    if (/^(fe80|fc|fd)/.test(lo)) return true;
    const m = lo.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (m) return ipv4Private(m[1]);
    return false;
  }
  return true;
}
function hostAllowed(host) {
  const h = String(host).toLowerCase();
  if (!h || h.indexOf(".") < 0) return false;                       // single-label (fx "localhost")
  if (h === "localhost" || h.endsWith(".internal") || h.endsWith(".local")) return false;
  if (net.isIP(h)) return !ipPrivate(h);                            // IP-literal: kun offentlige
  return true;                                                      // hostnavn: DNS-tjek i fetchBusy
}

// webcal:// → https:// ; kræv https, standard-port, og ikke-intern host (SSRF).
export function normalizeIcsUrl(url) {
  const raw = String(url || "").trim().replace(/^webcal:\/\//i, "https://");
  if (!/^https:\/\//i.test(raw)) return "";
  let u; try { u = new URL(raw); } catch { return ""; }
  if (u.protocol !== "https:") return "";
  if (u.port && u.port !== "443") return "";
  if (!hostAllowed(u.hostname)) return "";
  return u.toString();
}

// Hent + parse en ICS-URL. Returnér [] ved fejl/afvisning (fail-open mod drift,
// fail-closed mod SSRF: privat-resolvende host, redirect og timeout → []).
export async function fetchBusy(url) {
  const u = normalizeIcsUrl(url);
  if (!u) return [];
  try {
    const host = new URL(u).hostname;
    if (!net.isIP(host)) { // DNS-rebinding-værn: afvis hvis host resolver privat
      try { const addrs = await dns.lookup(host, { all: true }); if (!addrs.length || addrs.some((a) => ipPrivate(a.address))) return []; }
      catch { return []; }
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const r = await fetch(u, { headers: { "User-Agent": "Aevia-Booking/1.0" }, redirect: "manual", signal: ctrl.signal });
      if (r.status >= 300 && r.status < 400) return []; // følg ikke redirects (SSRF)
      if (!r.ok) return [];
      return parseICS((await r.text()).slice(0, 1000000)); // cap ~1 MB
    } finally { clearTimeout(timer); }
  } catch (e) { console.error("ICS-hentefejl:", e.message); return []; }
}

// Overlapper en Aevia-tid (dansk lokal dato+tid, varighed slotMin) et optaget-interval?
export function slotIsBusy(busy, dateStr, hhmm, slotMin) {
  if (!busy || !busy.length) return false;
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  const s = dkLocalToUtc(y, mo - 1, d, h, mi);
  const e = s + slotMin * 60000;
  for (const iv of busy) if (s < iv.end && iv.start < e) return true;
  return false;
}
