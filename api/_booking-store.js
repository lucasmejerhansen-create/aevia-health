// Aevia — integreret booking: datalager + tilgængelighed.
// Filer med _-præfiks i /api bliver IKKE til endpoints på Vercel.
//
// DATALAGER: Upstash Redis via REST (gratis tier, ingen SDK). Sæt i Vercel:
//   KV_REST_API_URL   (fx https://eu1-xxxx.upstash.io)
//   KV_REST_API_TOKEN
// Uden disse kører systemet i "ikke-konfigureret"-tilstand: frontenden falder
// pænt tilbage til kontakt/telefon, så det live site aldrig knækker.
//
// MODEL (nøgler i Redis):
//   cnt:<area>:<YYYY-MM-DD>:<HH:MM>   = antal bookede (INCR, atomisk)
//   full:<area>:<YYYY-MM-DD>          = SET af fyldte tider (til hurtig availability)
//   bk:<id>                           = JSON med booking-detaljer
//   day:<area>:<YYYY-MM-DD>           = SET af booking-id'er den dag (til admin)

import crypto from "crypto";

// ── Tilgængelighed pr. område ────────────────────────────────────────────────
// wd = ugedage (0=søn..6=lør). slot = minutter pr. tid. cap = personer pr. tid.
// ready=false → området vises som "åbner snart" (ingen booking endnu).
// Tilpas i takt med at partnerklinikker kommer på — det er den eneste fil,
// I normalt skal røre.
// clinics = offentlige visningsnavne pr. ydelse (vises for kunden i booking-flowet).
// Tomt navn → "Partnerklinik i området (bekræftes i din mail)".
export const AREAS = {
  "København-området": { lat: 55.6761, lng: 12.5683, ready: false, wd: [2, 4], open: "08:00", close: "12:00", slot: 30, cap: 1, lead: 2, horizon: 42, clinic: "",
    clinics: { blod: "", kondition: "", mr: "", genetik: "" } },
  "Aarhus-området":     { lat: 56.1572, lng: 10.2107, ready: false, wd: [2, 4], open: "08:00", close: "12:00", slot: 30, cap: 1, lead: 2, horizon: 42, clinic: "",
    clinics: { blod: "", kondition: "", mr: "", genetik: "" } },
  "Odense-området":     { lat: 55.4038, lng: 10.4024, ready: false, wd: [3],    open: "08:00", close: "11:00", slot: 30, cap: 1, lead: 2, horizon: 42, clinic: "",
    clinics: { blod: "", kondition: "", mr: "", genetik: "" } },
  "Aalborg-området":    { lat: 57.0488, lng:  9.9217, ready: false, wd: [3],    open: "08:00", close: "11:00", slot: 30, cap: 1, lead: 2, horizon: 42, clinic: "",
    clinics: { blod: "", kondition: "", mr: "", genetik: "" } },
  "Herning-området":    { lat: 56.1389, lng:  8.9742, ready: false, wd: [2, 4], open: "08:00", close: "12:00", slot: 30, cap: 1, lead: 2, horizon: 42, clinic: "",
    clinics: { blod: "", kondition: "", mr: "", genetik: "" } },
};
// lead = min. antal dage frem før første bookbare dag. horizon = hvor mange dage frem vises.

export function isConfigured() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// ── Redis-kommando via Upstash REST ──────────────────────────────────────────
async function redis(cmd) {
  const res = await fetch(process.env.KV_REST_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cmd),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.result;
}

// ── Slot-generering ──────────────────────────────────────────────────────────
function pad(n) { return n < 10 ? "0" + n : "" + n; }
function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function toMin(hhmm) { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; }
function fromMin(min) { return pad(Math.floor(min / 60)) + ":" + pad(min % 60); }

// Alle teoretiske tider på en given dato for et område (uden hensyn til bookinger).
function slotsForDate(area, dateStr) {
  const a = AREAS[area];
  if (!a) return [];
  const d = new Date(dateStr + "T00:00:00");
  if (!a.wd.includes(d.getDay())) return [];
  const out = [];
  for (let t = toMin(a.open); t + a.slot <= toMin(a.close); t += a.slot) out.push(fromMin(t));
  return out;
}

// Returnér ledige tider for et område fra (i dag + lead) og horizon dage frem.
// Trækker fyldte tider fra (full-set i Redis). Uden Redis: returnér genererede
// tider, så frontenden stadig kan vise noget i en demo.
export async function availability(area) {
  const a = AREAS[area];
  if (!a || !a.ready) return { ready: false, days: [] };
  const clinics = a.clinics || {};

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = [];
  const fullByDate = {};

  if (isConfigured()) {
    // Hent fyldte tider for hver relevant dato (få kald — kun bookbare dage).
    const dates = [];
    for (let i = a.lead; i <= a.horizon; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      if (a.wd.includes(d.getDay())) dates.push(iso(d));
    }
    await Promise.all(dates.map(async (ds) => {
      try { fullByDate[ds] = new Set((await redis(["SMEMBERS", `full:${area}:${ds}`])) || []); }
      catch { fullByDate[ds] = new Set(); }
    }));
  }

  for (let i = a.lead; i <= a.horizon; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i);
    const ds = iso(d);
    const all = slotsForDate(area, ds);
    if (!all.length) continue;
    const full = fullByDate[ds] || new Set();
    const free = all.filter((t) => !full.has(t));
    if (free.length) days.push({ date: ds, times: free });
  }
  return { ready: true, days, clinics };
}

// ── Atomisk reservation ──────────────────────────────────────────────────────
// Returnerer {ok:true,id} eller {ok:false,reason}. Forhindrer dobbeltbooking
// via INCR: hvis tælleren overstiger kapaciteten, rulles den tilbage.
export async function reserve({ area, date, time, customer }) {
  const a = AREAS[area];
  if (!a || !a.ready) return { ok: false, reason: "Området er ikke åbent for booking endnu." };
  if (!slotsForDate(area, date).includes(time)) return { ok: false, reason: "Tiden findes ikke i kalenderen." };

  // Ikke i fortiden / inden for lead-tid.
  const slotDate = new Date(date + "T00:00:00");
  const minDate = new Date(); minDate.setHours(0, 0, 0, 0); minDate.setDate(minDate.getDate() + a.lead);
  if (slotDate < minDate) return { ok: false, reason: "Vælg en senere dato." };

  if (!isConfigured()) return { ok: false, reason: "Booking er ikke konfigureret endnu." };

  const cntKey = `cnt:${area}:${date}:${time}`;
  const n = await redis(["INCR", cntKey]);
  if (n > a.cap) {
    await redis(["DECR", cntKey]); // rul tilbage — en anden nåede det først
    return { ok: false, reason: "Tiden blev desværre lige booket. Vælg en anden." };
  }
  if (n === a.cap) await redis(["SADD", `full:${area}:${date}`, time]); // marker fyldt
  // Udløb på tællere så gamle datoer ryddes (90 dage).
  await redis(["EXPIRE", cntKey, 60 * 60 * 24 * 90]);

  const id = crypto.randomBytes(9).toString("hex");
  const booking = { id, area, date, time, clinic: a.clinic || "", customer, created: new Date().toISOString(), status: "confirmed" };
  await redis(["SET", `bk:${id}`, JSON.stringify(booking), "EX", 60 * 60 * 24 * 120]);
  await redis(["SADD", `day:${area}:${date}`, id]);
  return { ok: true, id, booking };
}

// ── Aflys (admin) ────────────────────────────────────────────────────────────
export async function cancel(id) {
  if (!isConfigured()) return { ok: false, reason: "Ikke konfigureret." };
  const raw = await redis(["GET", `bk:${id}`]);
  if (!raw) return { ok: false, reason: "Booking findes ikke." };
  const b = JSON.parse(raw);
  await redis(["DECR", `cnt:${b.area}:${b.date}:${b.time}`]);
  await redis(["SREM", `full:${b.area}:${b.date}`, b.time]);
  b.status = "cancelled";
  await redis(["SET", `bk:${id}`, JSON.stringify(b), "EX", 60 * 60 * 24 * 30]);
  return { ok: true, booking: b };
}

export async function listDay(area, date) {
  if (!isConfigured()) return [];
  const ids = (await redis(["SMEMBERS", `day:${area}:${date}`])) || [];
  if (!ids.length) return [];
  const rows = await Promise.all(ids.map((id) => redis(["GET", `bk:${id}`])));
  return rows.filter(Boolean).map((r) => JSON.parse(r));
}

export async function getBooking(id) {
  if (!isConfigured()) return null;
  const raw = await redis(["GET", `bk:${id}`]);
  return raw ? JSON.parse(raw) : null;
}

// ── Signerede kundelinks (flyt/aflys) — HMAC med BOOKING_SECRET ──────────────
export function bookingSig(id) {
  return crypto
    .createHmac("sha256", process.env.BOOKING_SECRET || "")
    .update("bk:" + id)
    .digest("hex")
    .slice(0, 32);
}
export function verifyBookingSig(id, sig) {
  const expected = bookingSig(id);
  try {
    return expected.length === String(sig).length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(sig)));
  } catch { return false; }
}

// ── Blokering (klinik-portal/admin): markér tider som utilgængelige ─────────
export async function blockTime(area, date, time) {
  if (!isConfigured()) return { ok: false };
  await redis(["SADD", `full:${area}:${date}`, time]);
  await redis(["SADD", `blk:${area}:${date}`, time]);
  return { ok: true };
}
export async function unblockTime(area, date, time) {
  if (!isConfigured()) return { ok: false };
  await redis(["SREM", `blk:${area}:${date}`, time]);
  // Frigiv kun i full-settet hvis tiden ikke samtidig er fuldt booket.
  const a = AREAS[area];
  const n = parseInt((await redis(["GET", `cnt:${area}:${date}:${time}`])) || "0", 10);
  if (!a || n < a.cap) await redis(["SREM", `full:${area}:${date}`, time]);
  return { ok: true };
}
export async function blockedTimes(area, date) {
  if (!isConfigured()) return [];
  return (await redis(["SMEMBERS", `blk:${area}:${date}`])) || [];
}
export { slotsForDate };

// ── Venteliste pr. område ────────────────────────────────────────────────────
export async function waitlistAdd(area, email) {
  if (!isConfigured()) return { ok: false };
  await redis(["SADD", `wait:${area}`, String(email).trim().toLowerCase()]);
  return { ok: true };
}
export async function waitlistPop(area) {
  // Hent OG ryd ventelisten (kaldes når en tid frigives).
  if (!isConfigured()) return [];
  const emails = (await redis(["SMEMBERS", `wait:${area}`])) || [];
  if (emails.length) await redis(["DEL", `wait:${area}`]);
  return emails;
}
