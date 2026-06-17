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
// Nøgler i Redis (ledighed = cnt < cap OG ikke i blk:):
//   cnt:<area>:<svc>:<YYYY-MM-DD>:<HH:MM>  = antal bookede (INCR/DECR, atomisk)
//   blk:<area>:<svc>:<YYYY-MM-DD>          = SET af manuelt blokerede tider
//   rules:<area>                           = JSON: klinik-redigerbart skema pr. ydelse
//   bk:<id>                                = JSON: booking m. parts[] (+ att-map)
//   day:<area>:<YYYY-MM-DD>                = SET af booking-id'er m. en part den dag
//   cxl:<id>                               = aflysnings-lås (NX, enkelt-skud)
//   wait:<area>                            = SET af venteliste-mails

import crypto from "crypto";
import { fetchBusy, slotIsBusy, normalizeIcsUrl } from "./_calendar.js";

// ── Ydelses-typer ────────────────────────────────────────────────────────────
// hormon bookes IKKE separat (samme besøg som blod); rapport er online.
export const SVC_LABELS = {
  blod:      { da: "Blodprøve (70+ markører)", en: "Blood draw (70+ markers)" },
  kondition: { da: "Konditionstest (VO2max)",  en: "Cardio fitness test (VO2max)" },
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
  // Herning: ingen live klinik-aftale endnu → ikke åben for kunde-booking.
  // (Sæt ready:true igen ved ende-til-ende-test eller når en aftale er på plads.)
  "Herning-området": { lat: 56.1389, lng: 8.9742, ready: false, lead: 2, horizon: 42, svcs: {
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
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  return (await res.json()).result;
}

// ── Slot-generering ──────────────────────────────────────────────────────────
function pad(n) { return n < 10 ? "0" + n : "" + n; }
function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
// Dags dato i DANSK kalender (ikke serverens UTC) — så lead/horizon tælles fra
// den danske dag også når Vercel kører i UTC og klokken er 00-02 dansk tid.
function dkToday() {
  const s = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Copenhagen", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function toMin(hhmm) { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; }
function fromMin(min) { return pad(Math.floor(min / 60)) + ":" + pad(min % 60); }

function svcConf(area, svc) {
  const a = AREAS[area];
  return (a && a.svcs && a.svcs[svc]) || null;
}

// ── Klinik-redigerbare tilgængeligheds-regler (Redis: rules:<area>) ───────────
// Når en klinik gemmer sit skema i portalen, lægges det her og OVERSKRIVER
// standardskemaet i AREAS for den ydelse. Findes ingen regel, bruges AREAS som
// fallback — så nuværende live-adfærd er uændret, indtil en klinik selv sætter
// sine tider. Format: rules:<area> = { <svc>: {wd,open,close,slot,cap,clinic,email,active} }
export async function loadRules(area) {
  if (!isConfigured()) return {};
  try { const raw = await redis(["GET", `rules:${area}`]); return (raw && JSON.parse(raw)) || {}; }
  catch { return {}; }
}

// Flet standard + klinik-regel til den EFFEKTIVE konfiguration for en ydelse.
function mergeConf(def, rule) {
  if (rule) {
    if (rule.active === false) return null;             // ydelse slået fra af klinikken
    return {
      wd:    Array.isArray(rule.wd) ? rule.wd : (def ? def.wd : []),
      open:  rule.open  || (def && def.open)  || "08:00",
      close: rule.close || (def && def.close) || "12:00",
      slot:  rule.slot  || (def && def.slot)  || 30,
      cap:   rule.cap   || (def && def.cap)   || 1,
      clinic: rule.clinic != null ? rule.clinic : ((def && def.clinic) || ""),
      email:  rule.email  != null ? rule.email  : ((def && def.email)  || ""),
      calUrl: rule.calUrl != null ? rule.calUrl : ((def && def.calUrl) || ""),
    };
  }
  return def; // kan være null
}

// Effektiv konfiguration for én ydelse = klinik-regel ELLER AREAS-standard.
// Returnerer null hvis ydelsen ikke findes eller er slået fra.
export async function effectiveConf(area, svc) {
  if (!AREAS[area]) return null;
  return mergeConf(svcConf(area, svc), (await loadRules(area))[svc]);
}

// Optaget-tider fra klinikkens tilknyttede ICS-kalender (cachet 5 min i Redis,
// så vi ikke henter feed'et ved hvert kald). Fail-open: [] ved manglende/fejl.
async function busyFor(area, svc, conf) {
  const c = conf || await effectiveConf(area, svc);
  if (!c || !c.calUrl) return [];
  if (!isConfigured()) return fetchBusy(c.calUrl);
  const key = `calcache:${area}:${svc}`;
  try { const cached = await redis(["GET", key]); if (cached) return JSON.parse(cached); } catch (_) {}
  const busy = await fetchBusy(c.calUrl);
  try { await redis(["SET", key, JSON.stringify(busy), "EX", 300]); } catch (_) {}
  return busy;
}

// Klinikkens kalender er tilknyttet? (til portal-status)
export async function calStatus(area, svc) {
  const c = await effectiveConf(area, svc);
  return { connected: !!(c && c.calUrl), url: (c && c.calUrl) || "" };
}

// Teoretiske tider ud fra en konkret konfiguration (uden hensyn til bookinger).
function slotsFromConf(conf, dateStr) {
  if (!conf || !Array.isArray(conf.wd)) return [];
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d) || !conf.wd.includes(d.getDay())) return [];
  const out = [];
  for (let t = toMin(conf.open); t + conf.slot <= toMin(conf.close); t += conf.slot) out.push(fromMin(t));
  return out;
}

// Rule-bevidste tider for en dato (klinik-regel ELLER standard). Async.
export async function slotsForDateEff(area, svc, dateStr) {
  return slotsFromConf(await effectiveConf(area, svc), dateStr);
}

// Bagudkompatibel SYNKRON variant ud fra STANDARD-skemaet (AREAS) — beholdt for
// evt. legacy-kald. De rule-bevidste stier bruger slotsForDateEff/effectiveConf.
export function slotsForDate(area, svc, dateStr) {
  return slotsFromConf(svcConf(area, svc), dateStr);
}

// Ledige tider for én ydelse i et område (lead → horizon dage frem).
export async function availability(area, svc) {
  const a = AREAS[area];
  const c = a && a.ready ? await effectiveConf(area, svc) : null;
  if (!a || !a.ready || !c) return { ready: false, days: [] };

  const today = dkToday();

  // Saml de datoer (m. teoretiske tider) der overhovedet kan have ledighed.
  const dateSlots = [];
  for (let i = a.lead; i <= a.horizon; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i);
    const ds = isoDate(d);
    const all = slotsFromConf(c, ds);
    if (all.length) dateSlots.push({ ds, all });
  }

  // Optaget-tider fra klinikkens tilknyttede ICS-kalender (tom hvis ingen).
  const busy = await busyFor(area, svc, c);

  // Uden Redis: vis teoretiske tider minus kalender-optaget (booking afvises pænt andetsteds).
  if (!isConfigured()) {
    return { ready: true, clinic: c.clinic || "", days: dateSlots
      .map(({ ds, all }) => ({ date: ds, times: all.filter((t) => !slotIsBusy(busy, ds, t, c.slot)) }))
      .filter((x) => x.times.length) };
  }

  // Ledig = cnt < cap OG ikke blokeret OG ikke optaget i kalenderen.
  const days = [];
  await Promise.all(dateSlots.map(async ({ ds, all }) => {
    let blocked, counts;
    try {
      blocked = new Set((await redis(["SMEMBERS", `blk:${area}:${svc}:${ds}`])) || []);
      counts = (await redis(["MGET", ...all.map((t) => `cnt:${area}:${svc}:${ds}:${t}`)])) || [];
    } catch (e) {
      // Fail-CLOSED: udelad dagen hvis vi ikke kan afgøre ledighed — vis aldrig
      // bookede/blokerede tider som ledige ved transient Redis-fejl.
      console.error(`availability: Redis-fejl ${area}/${svc}/${ds} — dagen udelades`, e && e.message);
      return;
    }
    const free = all.filter((t, i) => (parseInt(counts[i] || "0", 10) < c.cap) && !blocked.has(t) && !slotIsBusy(busy, ds, t, c.slot));
    if (free.length) days.push({ date: ds, times: free });
  }));
  days.sort((x, y) => x.date.localeCompare(y.date)); // Promise.all kan blande rækkefølgen
  return { ready: true, days, clinic: c.clinic || "" };
}

// Hvilke ydelser er bookbare i området (standard ELLER klinik-regel)? Async.
export async function areaServices(area) {
  const a = AREAS[area];
  if (!a) return {};
  const rules = await loadRules(area);
  const out = {};
  for (const svc of Object.keys(SVC_LABELS)) {
    const conf = mergeConf(a.svcs && a.svcs[svc], rules[svc]);
    out[svc] = (conf && Array.isArray(conf.wd) && conf.wd.length)
      ? { bookable: true, clinic: conf.clinic || "" }
      : { bookable: false };
  }
  return out;
}

// ── Lavniveau-reservation af én part (atomisk) ───────────────────────────────
// SANDHED: ledighed = cnt (antal bookede) < cap OG ikke i blk: (blokeret).
// Vi bruger IKKE et separat "full:"-sæt — det kunne ikke holdes konsistent, når
// klinikker selv ændrer kapacitet. cnt er den eneste tæller, blk det eneste flag.

// DECR der aldrig går under 0 (atomisk via Lua) — beskytter mod dobbelt-frigivelse.
async function decrFloor(key) {
  return redis(["EVAL",
    "local n=redis.call('DECR',KEYS[1]); if tonumber(n)<0 then redis.call('SET',KEYS[1],'0','KEEPTTL'); n=0 end; return n",
    1, key]);
}

async function reservePart(area, svc, date, time, conf, busy) {
  const c = conf || svcConf(area, svc);
  if (!c) return { ok: false, reason: "Ydelsen findes ikke i området." };
  if (!slotsFromConf(c, date).includes(time)) return { ok: false, reason: "Tiden findes ikke i kalenderen." };
  // Optaget i klinikkens tilknyttede kalender? (tjek før INCR — ingen rollback)
  if (slotIsBusy(busy, date, time, c.slot)) return { ok: false, reason: "Tiden er ikke længere ledig." };
  // Live re-tjek mod kalenderen for den endelige commit — lukker det op-til-5-min
  // cache-vindue, så instant-bekræftelse ikke booker oven i en ekstern aftale.
  if (c.calUrl) {
    try { if (slotIsBusy(await fetchBusy(c.calUrl), date, time, c.slot)) return { ok: false, reason: "Tiden er ikke længere ledig." }; } catch (_) {}
  }
  const cntKey = `cnt:${area}:${svc}:${date}:${time}`;
  const n = await redis(["INCR", cntKey]);
  // Sæt TTL straks efter INCR, så nøglen udløber uanset hvilken sti vi forlader
  // ad (success ELLER afvist) — ingen evigt-levende cnt-nøgler.
  await redis(["EXPIRE", cntKey, 60 * 60 * 24 * 90]);
  if (n > c.cap) {
    await redis(["DECR", cntKey]);
    return { ok: false, reason: "Tiden blev desværre lige booket. Vælg en anden." };
  }
  // Blokeret af klinikken (ferie/sygdom)? Rul reservationen tilbage.
  if (await redis(["SISMEMBER", `blk:${area}:${svc}:${date}`, time])) {
    await decrFloor(cntKey);
    return { ok: false, reason: "Tiden er ikke længere ledig." };
  }
  return { ok: true };
}

async function releasePart(area, svc, date, time) {
  try { await decrFloor(`cnt:${area}:${svc}:${date}:${time}`); }
  catch (e) { console.error("releasePart-fejl:", e.message); }
}

// ── Multi-reservation: alt eller intet ───────────────────────────────────────
// parts = [{svc, date, time}, ...] — fejler én, rulles de øvrige tilbage.
export async function reserveMulti({ area, parts, customer }) {
  const a = AREAS[area];
  if (!a || !a.ready) return { ok: false, reason: "Området er ikke åbent for booking endnu." };
  if (!Array.isArray(parts) || !parts.length || parts.length > 4) return { ok: false, reason: "Ugyldigt tidsvalg." };
  if (!isConfigured()) return { ok: false, reason: "Booking er ikke konfigureret endnu." };

  const minDate = dkToday(); minDate.setDate(minDate.getDate() + a.lead);
  const seen = new Set();
  for (const p of parts) {
    const d = new Date(p.date + "T00:00:00");
    // isoDate(d) !== p.date afviser ikke-eksisterende datoer (fx 2026-02-30 som
    // JS-Date ellers ruller til 2026-03-02).
    if (isNaN(d) || isoDate(d) !== p.date || d < minDate) return { ok: false, reason: "Vælg en senere dato." };
    if (seen.has(p.svc)) return { ok: false, reason: "Samme ydelse er valgt to gange." };
    seen.add(p.svc);
  }

  // Forudindlæs effektive konfigurationer, så hele reservationen er konsistent
  // (klinik-regel ELLER standard) — også selvom en regel ændres undervejs.
  const confs = {}; const busies = {};
  for (const p of parts) {
    if (!confs[p.svc]) { confs[p.svc] = await effectiveConf(area, p.svc); busies[p.svc] = await busyFor(area, p.svc, confs[p.svc]); }
  }

  const reserved = [];
  for (const p of parts) {
    const r = await reservePart(area, p.svc, p.date, p.time, confs[p.svc], busies[p.svc]);
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
  // released=false: denne kald frigjorde IKKE tiderne (allerede aflyst / tabte
  // låsen) → kalderen skal ikke maile venteliste/klinik igen.
  if (b.status === "cancelled") return { ok: true, released: false, booking: b };
  // Enkelt-skud: kun ÉN samtidig aflysning frigiver tiderne (NX-lås) — så to
  // klik/retries ikke dobbelt-dekrementerer cnt og frigiver fremmede pladser.
  const lock = await redis(["SET", `cxl:${id}`, "1", "NX", "EX", 86400]);
  if (lock !== "OK") return { ok: true, released: false, booking: b };
  for (const p of b.parts || []) await releasePart(b.area, p.svc, p.date, p.time);
  // Slet også betalingsmarkøren knyttet til kundens e-mail (GDPR-minimering).
  const email = b.customer && b.customer.email;
  if (email) { try { await redis(["DEL", `paid:${String(email).trim().toLowerCase()}`]); } catch (_) {} }
  b.status = "cancelled";
  // Pseudonymisér: fjern kundens persondata fra den lagrede (aflyste) post.
  // Kalderen får den fulde booking retur til evt. kvitterings-/aflysningsmail.
  const stored = { ...b, customer: { cancelled: true } };
  await redis(["SET", `bk:${id}`, JSON.stringify(stored), "EX", 60 * 60 * 24 * 30]);
  return { ok: true, released: true, booking: b };
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
// Kun blk:-flaget — ledighed afgøres af cnt < cap OG ikke-blokeret (se reservePart
// og availability). Ingen kapacitets-logik nødvendig her længere.
export async function blockTime(area, svc, date, time) {
  if (!isConfigured()) return { ok: false };
  await redis(["SADD", `blk:${area}:${svc}:${date}`, time]);
  return { ok: true };
}
export async function unblockTime(area, svc, date, time) {
  if (!isConfigured()) return { ok: false };
  await redis(["SREM", `blk:${area}:${svc}:${date}`, time]);
  return { ok: true };
}
export async function blockedTimes(area, svc, date) {
  if (!isConfigured()) return [];
  return (await redis(["SMEMBERS", `blk:${area}:${svc}:${date}`])) || [];
}

// ── Klinik gemmer/ændrer sit ugentlige skema (rules:<area>) ──────────────────
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function sanitizeRule(input, def) {
  // wd: brug input hvis givet, ellers fald tilbage til standard-skemaets dage
  // (så fx setactive uden et nyt skema ikke kommer til at nulstille til 0 dage).
  const wd = Array.isArray(input.wd)
    ? [...new Set(input.wd.map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6))].sort((a, b) => a - b)
    : ((def && Array.isArray(def.wd)) ? def.wd.slice() : []);
  const hhmm = (v, fb) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(String(v)) ? String(v) : fb);
  const open = hhmm(input.open, (def && def.open) || "08:00");
  const close = hhmm(input.close, (def && def.close) || "12:00");
  if (toMin(close) <= toMin(open)) return { error: "Sluttid skal være efter starttid." };
  let slot = Math.round(Number(input.slot)); if (!(slot >= 10 && slot <= 240)) slot = (def && def.slot) || 30;
  let cap = Math.round(Number(input.cap)); if (!(cap >= 1 && cap <= 20)) cap = (def && def.cap) || 1;
  const clinic = input.clinic != null ? String(input.clinic).slice(0, 80) : ((def && def.clinic) || "");
  const email = (input.email != null && EMAIL_OK.test(String(input.email).trim()))
    ? String(input.email).trim().toLowerCase()
    : ((def && def.email) || "");
  // calUrl: privat ICS-feed (Google/Outlook/Apple) — optaget-tider blokerer
  // automatisk Aevia-ledigheden. Kun https accepteres; tom = ingen kalender.
  const calUrl = normalizeIcsUrl(input.calUrl);
  // active: respektér eksplicit valg (default true) — så ét gem kan sætte til/fra
  // atomisk uden en separat setactive-runde (ingen kort "åben"-vinduesrace).
  return { wd, open, close, slot, cap, clinic, email, calUrl, active: input.active !== false };
}

export async function saveRules(area, svc, input) {
  if (!isConfigured()) return { ok: false, reason: "Ikke konfigureret." };
  if (!AREAS[area] || !SVC_LABELS[svc]) return { ok: false, reason: "Ugyldigt område/ydelse." };
  const rule = sanitizeRule(input || {}, svcConf(area, svc));
  if (rule.error) return { ok: false, reason: rule.error };
  const rules = await loadRules(area);
  rules[svc] = rule;
  await redis(["SET", `rules:${area}`, JSON.stringify(rules)]);
  return { ok: true, rule };
}

// Slå en ydelse til/fra for området (uden at slette skemaet).
export async function setServiceActive(area, svc, active) {
  if (!isConfigured()) return { ok: false };
  if (!AREAS[area] || !SVC_LABELS[svc]) return { ok: false };
  const rules = await loadRules(area);
  const base = rules[svc] || sanitizeRule({}, svcConf(area, svc));
  rules[svc] = { ...base, active: !!active };
  await redis(["SET", `rules:${area}`, JSON.stringify(rules)]);
  return { ok: true, active: !!active };
}

// Konfiguration til portalens skema-editor: nuværende værdier + til/fra-status,
// uanset om ydelsen er aktiv (så klinikken kan se og redigere et slået-fra skema).
export async function configForEditor(area, svc) {
  const def = svcConf(area, svc);
  const stored = (await loadRules(area))[svc];
  const base = stored || def || {};
  return {
    wd: Array.isArray(base.wd) ? base.wd : [],
    open: base.open || "08:00",
    close: base.close || "12:00",
    slot: base.slot || 30,
    cap: base.cap || 1,
    clinic: base.clinic || "",
    email: base.email || "",
    calUrl: base.calUrl || "",
    active: stored ? stored.active !== false : !!def,
    hasDefault: !!def,
  };
}

// ── Fremmøde: klinikken markerer gennemført / udeblevet pr. part ──────────────
// Gemmes på bookingen som att[`<svc>:<date>:<time>`] = "done" | "noshow".
export async function markAttendance(id, key, status) {
  if (!isConfigured() || !id) return { ok: false };
  const raw = await redis(["GET", `bk:${id}`]);
  if (!raw) return { ok: false, reason: "Booking findes ikke." };
  const b = JSON.parse(raw);
  b.att = b.att || {};
  if (status === "done" || status === "noshow") b.att[key] = status;
  else delete b.att[key];
  await redis(["SET", `bk:${id}`, JSON.stringify(b), "KEEPTTL"]);
  return { ok: true, booking: b };
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

// ── Betalingsstatus (sættes af stripe-webhook) ───────────────────────────────
// paid:<email> = kunden har betalt et forløb. Bruges af book-slot, så
// bekræftelsesmailen ikke beder en allerede-betalende kunde om at betale igen.
export async function markPaid(email, info) {
  if (!isConfigured() || !email) return { ok: false };
  await redis(["SET", `paid:${String(email).trim().toLowerCase()}`,
    JSON.stringify({ at: new Date().toISOString(), ...(info || {}) }), "EX", 60 * 60 * 24 * 180]);
  return { ok: true };
}
export async function isPaid(email) {
  if (!isConfigured() || !email) return null;
  const raw = await redis(["GET", `paid:${String(email).trim().toLowerCase()}`]);
  return raw ? JSON.parse(raw) : null;
}
// Markér en konkret booking som betalt (vises i admin; sættes når Stripe-
// betalingen har booking_id i metadata, eller når kunden var betalt på forhånd).
export async function setBookingPaid(id) {
  if (!isConfigured() || !id) return { ok: false };
  const raw = await redis(["GET", `bk:${id}`]);
  if (!raw) return { ok: false };
  const b = JSON.parse(raw);
  if (b.paid) return { ok: true, booking: b };
  b.paid = true;
  await redis(["SET", `bk:${id}`, JSON.stringify(b), "KEEPTTL"]);
  return { ok: true, booking: b };
}

// ── Ubekræftede bookinger (mail-flowet, niveau 1): til rykker-cron ───────────
// Registreres af api/booking.js, fjernes af api/booking-action.js, og
// api/booking-remind.js rykker kontakt@ hvis en booking er ubesvaret i 20+ timer.
export async function pendingAdd(id, payload) {
  if (!isConfigured()) return { ok: false };
  await redis(["SET", `pend:${id}`, JSON.stringify({ ...payload, reminded: false }), "EX", 60 * 60 * 24 * 7]);
  await redis(["SADD", "pend:idx", String(id)]);
  return { ok: true };
}
export async function pendingRemove(id) {
  if (!isConfigured()) return { ok: false };
  await redis(["DEL", `pend:${id}`]);
  await redis(["SREM", "pend:idx", String(id)]);
  return { ok: true };
}
export async function pendingList() {
  if (!isConfigured()) return [];
  const ids = (await redis(["SMEMBERS", "pend:idx"])) || [];
  if (!ids.length) return [];
  const rows = await Promise.all(ids.map((id) => redis(["GET", `pend:${id}`])));
  const out = [];
  ids.forEach((id, i) => {
    if (rows[i]) out.push({ id, ...JSON.parse(rows[i]) });
    else redis(["SREM", "pend:idx", id]).catch(() => {});
  });
  return out;
}
export async function pendingMarkReminded(id) {
  if (!isConfigured()) return;
  const raw = await redis(["GET", `pend:${id}`]);
  if (!raw) return;
  const b = JSON.parse(raw);
  b.reminded = true;
  await redis(["SET", `pend:${id}`, JSON.stringify(b), "EX", 60 * 60 * 24 * 7]);
}
