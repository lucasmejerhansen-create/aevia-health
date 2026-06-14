// Aevia — draft-lager.
//
// ⚠️  DEV-IMPLEMENTERING: fil-baseret, holder KUN PII-frie ReportDrafts + status.
//    Den adskilte, KRYPTEREDE PII↔pseudoId-tabel hører til et separat,
//    adgangsstyret lager (Supabase) og bygges først efter DPIA. Dette lager
//    indeholder ALDRIG PII (drafts er pseudonymiserede).
//
// PRODUKTION: erstat read/write med Supabase (samme interface). På Vercel er
// filsystemet flygtigt, så fil-lageret virker kun i den lokale dev-server.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";

const FILE = process.env.AEVIA_STORE_FILE || join(process.cwd(), ".data", "drafts.json");

async function readAll() {
  try { return JSON.parse(await readFile(FILE, "utf8")); } catch { return {}; }
}
async function writeAll(obj) {
  await mkdir(dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(obj, null, 2));
}

export async function saveDraft(reportId, draft, at) {
  const all = await readAll();
  all[reportId] = { reportId, draft, status: draft.status, savedAt: at, history: [] };
  await writeAll(all);
  return all[reportId];
}
export async function listDrafts() {
  const all = await readAll();
  return Object.values(all)
    .map((r) => ({
      reportId: r.reportId, pseudoId: r.draft.pseudoId, ageBand: r.draft.ageBand, sex: r.draft.sex,
      score: r.draft.aeviaScore.total, action: r.draft.flaggedForDoctor.length, status: r.status, savedAt: r.savedAt,
    }))
    .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
}
export async function getDraft(reportId) {
  const all = await readAll();
  return all[reportId] || null;
}
export async function setStatus(reportId, status, doctorId, note, at) {
  const all = await readAll();
  if (!all[reportId]) return null;
  all[reportId].status = status;
  all[reportId].draft.status = status;
  (all[reportId].history = all[reportId].history || []).push({ status, doctorId, note, at });
  await writeAll(all);
  return all[reportId];
}
