// Aevia — gem draft i læge-køen (PII-fri). POST { token, draft } → { reportId }
import crypto from "crypto";
import { assertNoPII } from "./_engine.mjs";
import { saveDraft } from "./_store.js";

function authed(token) {
  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected || !token) return false;
  const a = Buffer.from(String(token)); const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  let body = req.body; if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { token, draft } = body || {};
  if (!authed(token)) return res.status(403).json({ error: "Adgang nægtet" });
  if (!draft || !Array.isArray(draft.classifiedMarkers)) return res.status(400).json({ error: "Mangler draft" });
  try { assertNoPII(draft, "save-draft"); } catch (e) { return res.status(400).json({ error: e.message }); }
  try {
    const reportId = crypto.randomUUID();
    await saveDraft(reportId, draft, new Date().toISOString());
    return res.status(200).json({ reportId });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}
