// Aevia — læge-køen (oversigt). POST { token } → { drafts:[...] }
import crypto from "crypto";
import { tooManyFails, bearerToken, doctorFor } from "./_ratelimit.js";
import { listDrafts } from "./_store.js";

function authed(token) {
  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected || !token) return false;
  const a = Buffer.from(String(token)); const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  let body = req.body; if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const token = bearerToken(req) || (body && body.token); // header foretrukket; POST-body ok; aldrig URL
  if (!authed(token) && !doctorFor(token)) { if (await tooManyFails(req, "reports")) return res.status(429).json({ error: "For mange forsøg. Prøv igen senere." }); return res.status(403).json({ error: "Adgang nægtet" }); }
  try { return res.status(200).json({ drafts: await listDrafts() }); }
  catch (err) { return res.status(500).json({ error: err.message }); }
}
