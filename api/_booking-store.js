// Aevia — integreret booking: datalager + tilgængelighed PR. YDELSE.
// Filer med _-præfiks i /api bliver IKKE til endpoints på Vercel.
//
// DATALAGER: Upstash Redis via REST (gratis tier, ingen SDK). Sæt i Vercel:
//   KV_REST_API_URL   (fx https://eu1-xxxx.upstash.io)
//   KV_REST_API_TOKEN
// Uden disse kører systemet i "ikke-konfigureret"-tilstand: frontenden falder
// pænt tilbage, så det live site aldrig knækker.
//
// MODEL: en pakke består af flere YDELSER (blod, kondition, mr, genetik), der
// foregår hos forskellige klinikker med hver deres kalender. En booking har
// derfor PARTS — én tid pr. ydelse — som reserveres alt-eller-intet.
//
// Nøgler i Redis:
//   cnt:<area>:<svc>:<YYYY-MM-DD>:<HH:MM>  = antal bookede (INCR, atomisk)
//   full:<area>:<svc>:<YYYY-MM-DD>         = SET af fyldte tider
//   blk:<area>:<svc>:<YYYY-MM-DD>          = SET af manuelt blokerede tider
//   bk:<id>                                = JSON: booking m. parts[]
//   day:<area>:<YYYY-MM-DD>                = SET af booking-id'er m. en part den dag
//   wait:<area>                            = SET af venteliste-mails

import crypto from "crypto";

// ── Ydelses-typer ────────────────────────────────────────────────────────────
// hormon bookes IKKE separat (samme besøg som blod); rapport er online.
export const SVC_LABELS = {
  blod:      { da: "Blodprøve (70+ markører)", en: "Blood draw (70+ markers)" },
  kondition: { da: "VO2max-test",              en: "VO2max test" },
  mr:        { da: "Helkrops-MRI",             en: "Whole-body MRI" },
  genetik:   { da: "Genetisk profil",          en: "Genetic profile" },
};

// ── Tilgængelighed pr. område og ydelse ──────────────────────────────────────
// Hver ydelse har sit eget skema (klinikkens faste Aevia-tider):
//   wd=ugedage (0=søn..6=lør), open/close, slot=minutter, cap=pr. tid,
//   clinic=offentligt visningsnavn, email=notifikationer (tom → kontakt@aevia.dk).
// Udelad en ydelse, hvis området ikke har en partner til den endnu →
// kunden ser "koordineres af Aevia efter booking".
// ready=false på området → hele området viser "åbner snart".
export const AREAS = {
  "København-området": { lat: 55.6761, lng: 12.5683, ready: false, lead: 2, horizon: 42, svcs: {
    blod: { wd: [2, 4], open: "08:00", close: "12:00", slot: 30, cap: 1, clinic: "", email: "" },
  } },
  "Aarhus-området": { lat: 56.1572, lng: 10.2107, ready: false, lead: 2, horizon: 42, svcs: {
    blod: { wd: [2, 4], open: "08:00", close: "12:00", slot: 30, cap: 1, clinic: "", email: "" },
  } },
  "Odense-området": { lat: 55.4038, lng: 10.4024, ready: false, lead: 2, horizon: 42, svcs: {
    blod: { wd: [3], open: "08:00", close: "11:00", slot: 30, cap: 1, clinic: "", email: "" },
  } },
  "Aalborg-området": { lat: 57.0488, lng: 9.9217, ready: false, lead: 2, horizon: 42, svcs: {
    blod: { wd: [3], open: "08:00", close: "11:00", slot: 30, cap: 1, clinic: "", email: "" },
  } },
  // TEST ÅBEN (sat 2026-06-05 til ende-til-ende-test — sæt ready:false igen,
  // hvis testen er slut og ingen klinik-aftale er på plads endnu):
  "Herning-området": { lat: 56.1389, lng: 8.9742, ready: true, lead: 2, horizon: 42, svcs: {
    blod:      { wd: [2, 4], open: "08:00", close: "12:00", slot: 30, cap: 1, clinic: "Partnerklinik Herning (bekræftes)", email: "" },
    kondition: { wd: [1, 3], open: "16:00", close: "19:00", slot: 60, cap: 1, clinic: "Partnertestcenter (bekræftes)", email: "" },
  } },
};

// Understøt begge navne-varianter fra Vercel/Upstash-integrationen.
function kvUrl() { return process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ""; }
function kvToken() { return process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ""; }
export function isConfigured() {
  return !!(kvUrl() && kvToken());
}

// ── Redis-kommando via Upstash REST ──────────────────────────────────────────
async function redis(cmd) {
  const res = await fetch(kvUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${kvToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cmd),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}: ${await res.text()}`);
  return (await res.json()).result;
}

// ── Slot-generering ──────────────────────────────────────────────────────────
function pad(n) { return n < 10 ? "0" + n : "" + n; }
function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function toMin(hhmm) { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; }
function fromMin(min) { return pad(Math.floor(min / 60)) + ":" + pad(min % 60); }

function svcConf(area, svc) {
  const a = AREAS[area];
  return (a && a.svcs && a.svcs[svc]) || null;
}

// Alle teoretiske tider for en ydelse på en dato (uden hensyn til bookinger).
export function slotsForDate(area, svc, dateStr) {
  const c = svcConf(area, svc);
  if (!c) return [];
  const d = new Date(dateStr + "T00:00:00");
  if (!c.wd.includes(d.getDay())) return [];
  const out = [];
  for (let t = toMin(c.open); t + c.slot <= toMin(c.close); t += c.slot) out.push(fromMin(t));
  return out;
}

// Ledige tider for én ydelse i et område (lead → horizon dage frem).
export async function availability(area, svc) {
  const a = AREAS[area];
  const c = svcConf(area, svc);
  if (!a || !a.ready || !c) return { ready: false, days: [] };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = [];
  const fullByDate = {};

  if (isConfigured()) {
    const dates = [];
    for (let i = a.lead; i <= a.horizon; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      if (c.wd.includes(d.getDay())) dates.push(isoDate(d));
    }
    await Promise.all(dates.map(async (ds) => {
      try { fullByDate[ds] = new Set((await redis(["SMEMBERS", `full:${area}:${svc}:${ds}`])) || []); }
      catch { fullByDate[ds] = new Set(); }
    }));
  }

  for (let i = a.lead; i <= a.horizon; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i);
    const ds = isoDate(d);
    const all = slotsForDate(area, svc, ds);
    if (!all.length) continue;
    const full = fullByDate[ds] || new Set();
    const free = all.filter((t) => !full.has(t));
    if (free.length) days.push({ date: ds, times: free });
  }
  return { ready: true, days, clinic: c.clinic || "" };
}

// Hvilke ydelser er bookbare i området (har eget skema)?
export function areaServices(area) {
  const a = AREAS[area];
  if (!a) return {};
  const out = {};
  for (const svc of Object.keys(SVC_LABELS)) {
    out[svc] = a.svcs && a.svcs[svc] ? { bookable: true, clinic: a.svcs[svc].clinic || "" } : { bookable: false };
  }
  return out;
}

// ── Lavniveau-reservation af én part (atomisk) ───────────────────────────────
async function reservePart(area, svc, date, time) {
  const c = svcConf(area, svc);
  if (!c) return { ok: false, reason: "Ydelsen findes ikke i området." };
  if (!slotsForDate(area, svc, date).includes(time)) return { ok: false, reason: "Tiden findes ikke i kalenderen." };
  const cntKey = `cnt:${area}:${svc}:${date}:${time}`;
  const n = await redis(["INCR", cntKey]);
  if (n > c.cap) {
    await redis(["DECR", cntKey]);
    return { ok: false, reason: "Tiden blev desværre lige booket. Vælg en anden." };
  }
  if (n === c.cap) await redis(["SADD", `full:${area}:${svc}:${date}`, time]);
  await redis(["EXPIRE", cntKey, 60 * 60 * 24 * 90]);
  return { ok: true };
}

async function releasePart(area, svc, date, time) {
  try {
    await redis(["DECR", `cnt:${area}:${svc}:${date}:${time}`]);
    // Frigiv kun hvis tiden ikke også er manuelt blokeret.
    const blocked = await redis(["SISMEMBER", `blk:${area}:${svc}:${date}`, time]);
    if (!blocked) await redis(["SREM", `full:${area}:${svc}:${date}`, time]);
  } catch (e) { console.error("releasePart-fejl:", e.message); }
}

// ── Multi-reservation: alt eller intet ───────────────────────────────────────
// parts = [{svc, date, time}, ...] — fejler én, rulles de øvrige tilbage.
export async function reserveMulti({ area, parts, customer }) {
  const a = AREAS[area];
  if (!a || !a.ready) return { ok: false, reason: "Området er ikke åbent for booking endnu." };
  if (!Array.isArray(parts) || !parts.length || parts.length > 4) return { ok: false, reason: "Ugyldigt tidsvalg." };
  if (!isConfigured()) return { ok: false, reason: "Booking er ikke konfigureret endnu." };

  const minDate = new Date(); minDate.setHours(0, 0, 0, 0); minDate.setDate(minDate.getDate() + a.lead);
  const seen = new Set();
  for (const p of parts) {
    const d = new Date(p.date + "T00:00:00");
    if (isNaN(d) || d < minDate) return { ok: false, reason: "Vælg en senere dato." };
    if (seen.has(p.svc)) return { ok: false, reason: "Samme ydelse er valgt to gange." };
    seen.add(p.svc);
  }

  const reserved = [];
  for (const p of parts) {
    const r = await reservePart(area, p.svc, p.date, p.time);
    if (!r.ok) {
      for (const q of reserved) await releasePart(area, q.svc, q.date, q.time);
      const lbl = (SVC_LABELS[p.svc] && SVC_LABELS[p.svc].da) || p.svc;
      return { ok: false, reason: `${lbl}: ${r.reason}`, failedSvc: p.svc };
    }
    reserved.push(p);
  }

  const id = crypto.randomBytes(9).toString("hex");
  const booking = { id, area, parts, customer, created: new Date().toISOString(), status: "confirmed" };
  await redis(["SET", `bk:${id}`, JSON.stringify(booking), "EX", 60 * 60 * 24 * 180]);
  for (const p of parts) await redis(["SADD", `day:${area}:${p.date}`, id]);
  return { ok: true, id, booking };
}

// ── Aflys hele bookingen (alle parts frigives) ───────────────────────────────
export async function cancel(id) {
  if (!isConfigured()) return { ok: false, reason: "Ikke konfigureret." };
  const raw = await redis(["GET", `bk:${id}`]);
  if (!raw) return { ok: false, reason: "Booking findes ikke." };
  const b = JSON.parse(raw);
  if (b.status === "cancelled") return { ok: true, booking: b };
  for (const p of b.parts || []) await releasePart(b.area, p.svc, p.date, p.time);
  b.status = "cancelled";
  await redis(["SET", `bk:${id}`, JSON.stringify(b), "EX", 60 * 60 * 24 * 30]);
  return { ok: true, booking: b };
}

export async function getBooking(id) {
  if (!isConfigured()) return null;
  const raw = await redis(["GET", `bk:${id}`]);
  return raw ? JSON.parse(raw) : null;
}

// Bookinger med mindst én part på datoen.
export async function listDay(area, date) {
  if (!isConfigured()) return [];
  const ids = (await redis(["SMEMBERS", `day:${area}:${date}`])) || [];
  if (!ids.length) return [];
  const rows = await Promise.all(ids.map((id) => redis(["GET", `bk:${id}`])));
  return rows.filter(Boolean).map((r) => JSON.parse(r));
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

// ── Blokering pr. ydelse (klinik-portal/admin) ───────────────────────────────
export async function blockTime(area, svc, date, time) {
  if (!isConfigured()) return { ok: false };
  await redis(["SADD", `full:${area}:${svc}:${date}`, time]);
  await redis(["SADD", `blk:${area}:${svc}:${date}`, time]);
  return { ok: true };
}
export async function unblockTime(area, svc, date, time) {
  if (!isConfigured()) return { ok: false };
  await redis(["SREM", `blk:${area}:${svc}:${date}`, time]);
  const c = svcConf(area, svc);
  const n = parseInt((await redis(["GET", `cnt:${area}:${svc}:${date}:${time}`])) || "0", 10);
  if (!c || n < c.cap) await redis(["SREM", `full:${area}:${svc}:${date}`, time]);
  return { ok: true };
}
export async function blockedTimes(area, svc, date) {
  if (!isConfigured()) return [];
  return (await redis(["SMEMBERS", `blk:${area}:${svc}:${date}`])) || [];
}

// ── Venteliste pr. område ────────────────────────────────────────────────────
export async function waitlistAdd(area, email) {
  if (!isConfigured()) return { ok: false };
  await redis(["SADD", `wait:${area}`, String(email).trim().toLowerCase()]);
  return { ok: true };
}
export async function waitlistPop(area) {
  if (!isConfigured()) return [];
  const emails = (await redis(["SMEMBERS", `wait:${area}`])) || [];
  if (emails.length) await redis(["DEL", `wait:${area}`]);
  return emails;
}
