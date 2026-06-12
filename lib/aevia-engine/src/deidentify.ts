import { randomUUID } from "node:crypto";
import type { DeidentifiedData, RawPatientData } from "./types.js";

/**
 * TRIN 5 — DEIDENTIFICERING.
 *
 * KERNEPRINCIP 2: AI ser ALDRIG PII. deidentify() er den eneste vej fra rå
 * patientdata til det, der må forlade serveren mod AI-laget.
 *
 *  - pseudoId er en TILFÆLDIG UUID. Den udledes ALDRIG af CPR/navn/mail, så der
 *    er ingen matematisk kobling tilbage til personen. Koblingen pseudoId↔patient
 *    lever kun i en adskilt, adgangsstyret tabel (ikke i dette objekt).
 *  - Præcis alder erstattes af et 5-års aldersbånd.
 *  - name, cpr, email kopieres aldrig med.
 */

/** 5-års aldersbånd, fx 52 → "50-54". */
export function ageBandOf(age: number): string {
  const lower = Math.floor(age / 5) * 5;
  return `${lower}-${lower + 4}`;
}

export function deidentify(raw: RawPatientData): DeidentifiedData {
  // Eksplicit hvidliste af felter — vi kopierer kun det, der bevisligt er fri for PII.
  return {
    pseudoId: randomUUID(),
    ageBand: ageBandOf(raw.age),
    sex: raw.sex,
    markers: raw.markers.map((m) => ({
      id: m.id,
      value: m.value,
      unit: m.unit,
      sex: m.sex,
      age: m.age,
    })),
  };
}

/** Felter der ALDRIG må optræde i data på vej mod AI. */
const PII_KEYS = ["name", "cpr", "email", "navn", "phone", "telefon", "address", "adresse"];

/**
 * Defensiv kontrol: kast hvis et objekt indeholder kendte PII-nøgler. Kald denne
 * lige før ethvert AI-kald som sidste sikkerhedsnet (ud over typesystemet).
 */
export function assertNoPII(obj: unknown, context = "AI-payload"): void {
  const seen = new Set<object>();
  const walk = (node: unknown): void => {
    if (node == null || typeof node !== "object") return;
    if (seen.has(node)) return;
    seen.add(node);
    for (const [key, val] of Object.entries(node)) {
      if (PII_KEYS.includes(key.toLowerCase())) {
        throw new Error(`PII-lækage blokeret: feltet '${key}' fundet i ${context}.`);
      }
      walk(val);
    }
  };
  walk(obj);
}
