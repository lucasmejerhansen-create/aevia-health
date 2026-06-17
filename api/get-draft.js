// Aevia — hent én draft fra køen. POST { token, reportId } → { record }
import crypto from "crypto";
import { tooManyFails } from "./_ratelimit.js";
import { getDraft } from "./_store.js";

function authed(token) {
  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected || !token) return false;
  const a = Buffer.from(String(token)); const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  let body = req.body; if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { token, reportId } = body || {};
  if (!authed(token)) { if (await tooManyFails(req, "reports")) return res.status(429).json({ error: "For mange forsøg. Prøv igen senere." }); return res.status(403).json({ error: "Adgang nægtet" }); }
  try {
    const record = await getDraft(reportId);
    if (!record) return res.status(404).json({ error: "Ukendt reportId" });
    return res.status(200).json({ record });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}
