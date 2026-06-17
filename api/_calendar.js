// Aevia — ICS-kalender-sync. Klinikken tilknytter sin kalenders private ICS-URL;
// vi læser optaget-tider og blokerer dem i Aevia-ledigheden. _-præfiks → ikke et
// endpoint. Ingen eksterne afhængigheder.
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
export function parseICS(text) {
  // Fold sammenklappede linjer (fortsættelse starter med mellemrum/tab).
  const lines = String(text).replace(/\r\n/g, "\n").split("\n");
  const merged = [];
  for (const ln of lines) {
    if (/^[ \t]/.test(ln) && merged.length) merged[merged.length - 1] += ln.slice(1);
    else merged.push(ln);
  }
  const out = [];
  let inEv = false, start = null, end = null;
  for (const ln of merged) {
    const up = ln.toUpperCase();
    if (up.startsWith("BEGIN:VEVENT")) { inEv = true; start = end = null; continue; }
    if (up.startsWith("END:VEVENT")) {
      if (start) {
        let e = end ? end.ms : (start.dateOnly ? start.ms + 86400000 : start.ms);
        if (e <= start.ms) e = start.ms + (start.dateOnly ? 86400000 : 0);
        if (e > start.ms) out.push({ start: start.ms, end: e });
      }
      inEv = false; continue;
    }
    if (!inEv) continue;
    const ci = ln.indexOf(":"); if (ci < 0) continue;
    const head = ln.slice(0, ci).toUpperCase(), val = ln.slice(ci + 1).trim();
    const isDate = head.includes("VALUE=DATE");
    if (head.startsWith("DTSTART")) start = parseDt(val, isDate);
    else if (head.startsWith("DTEND")) end = parseDt(val, isDate);
  }
  return out;
}

// webcal:// → https:// ; kræv https (SSRF-hærdning).
export function normalizeIcsUrl(url) {
  const u = String(url || "").trim().replace(/^webcal:\/\//i, "https://");
  return /^https:\/\//i.test(u) ? u : "";
}

// Hent + parse en ICS-URL. Returnér [] ved fejl (fail-open).
export async function fetchBusy(url) {
  const u = normalizeIcsUrl(url);
  if (!u) return [];
  try {
    const r = await fetch(u, { headers: { "User-Agent": "Aevia-Booking/1.0" } });
    if (!r.ok) return [];
    return parseICS(await r.text());
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
