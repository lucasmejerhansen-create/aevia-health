// Aevia — simpel brute-force-bremse på auth-fejl + token-læsning fra header.
// _-præfiks → bliver IKKE et endpoint på Vercel.
//
// Filosofi: tæl KUN mislykkede auth-forsøg pr. IP. Legitime (auth'ede) kald
// rammer aldrig bremsen. Fail-open hvis Upstash ikke er sat op, så intet
// knækker uden KV.

function kvUrl() { return process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ""; }
function kvToken() { return process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ""; }

// Hent token fra Authorization: Bearer <token> (så det ikke ligger i URL'en).
export function bearerToken(req) {
  const h = (req.headers && (req.headers.authorization || req.headers.Authorization)) || "";
  const m = /^Bearer\s+(.+)$/i.exec(String(h));
  return m ? m[1].trim() : "";
}

// Læge-rolle: DOCTOR_TOKENS er en JSON-map { "<token>": "<doctorId>" }. En gyldig
// læge-token oversættes server-side til doctorId — så godkenderen ikke kan
// forfalskes via en klient-leveret doctorId.
export function doctorFor(token) {
  if (!token) return null;
  try { const v = JSON.parse(process.env.DOCTOR_TOKENS || "{}")[String(token)]; return v ? String(v) : null; }
  catch { return null; }
}
export function doctorTokensConfigured() {
  try { return Object.keys(JSON.parse(process.env.DOCTOR_TOKENS || "{}")).length > 0; }
  catch { return false; }
}

function clientIp(req) {
  const xf = req.headers && (req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"]);
  if (xf) return String(xf).split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

async function cmd(c) {
  const r = await fetch(kvUrl(), {
    method: "POST",
    headers: { Authorization: `Bearer ${kvToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(c),
  });
  if (!r.ok) throw new Error(`Upstash ${r.status}`);
  return (await r.json()).result;
}

// Tæl én auth-fejl for (bucket, IP). Returnér true hvis grænsen er overskredet.
export async function tooManyFails(req, bucket, opts) {
  const max = (opts && opts.max) || 10;
  const windowSec = (opts && opts.windowSec) || 900; // 15 min
  if (!kvUrl() || !kvToken()) return false; // fail-open uden KV
  const key = `rl:${bucket}:${clientIp(req)}`;
  try {
    const n = await cmd(["INCR", key]);
    if (Number(n) === 1) await cmd(["EXPIRE", key, windowSec]);
    return Number(n) > max;
  } catch (e) {
    console.error("rate-limit-fejl:", e.message);
    return false; // fail-open: bremsen må aldrig spærre legitim drift
  }
}
