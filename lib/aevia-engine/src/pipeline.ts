import type { ReportStatus } from "./types.js";

/**
 * TRIN 6 — PIPELINE STATE MACHINE.
 *
 * KERNEPRINCIP 3: Lægen er sidst — ALTID.
 *   raw_data → classified → draft_pending_doctor → approved_for_release
 *                                       └→ rejected → (re-draft)
 *
 * Overgangen draft_pending_doctor → approved_for_release kan KUN ske via en
 * eksplicit lægehandling (doctor_approve med et læge-id). Der findes ingen anden
 * vej til approved_for_release i hele maskinen.
 */

export type PipelineEvent =
  | "classify" // raw_data → classified
  | "prepare_draft" // classified → draft_pending_doctor
  | "doctor_approve" // draft_pending_doctor → approved_for_release (KRÆVER læge)
  | "doctor_reject" // draft_pending_doctor → rejected (KRÆVER læge)
  | "redraft"; // rejected → draft_pending_doctor

/** Hændelser der KRÆVER en eksplicit lægehandling (doctorId). */
const DOCTOR_EVENTS: ReadonlySet<PipelineEvent> = new Set(["doctor_approve", "doctor_reject"]);

/** Lovlige overgange: (state, event) → next state. Alt andet er ulovligt. */
const TRANSITIONS: Record<ReportStatus, Partial<Record<PipelineEvent, ReportStatus>>> = {
  raw_data: { classify: "classified" },
  classified: { prepare_draft: "draft_pending_doctor" },
  draft_pending_doctor: {
    doctor_approve: "approved_for_release",
    doctor_reject: "rejected",
  },
  rejected: { redraft: "draft_pending_doctor" },
  approved_for_release: {}, // terminal — ingen vej videre
};

export interface TransitionOptions {
  /** Læge-id. PÅKRÆVET for doctor_approve / doctor_reject. */
  doctorId?: string;
  /** Lægens kommentar (fx afvisningsbegrundelse). */
  note?: string;
  /** Tidsstempel injiceres udefra (motoren er ren — kalder Date.now()). */
  at?: string;
}

export interface TransitionRecord {
  from: ReportStatus;
  to: ReportStatus;
  event: PipelineEvent;
  doctorId?: string;
  note?: string;
  at?: string;
}

export class IllegalTransitionError extends Error {
  constructor(public readonly from: ReportStatus, public readonly event: PipelineEvent) {
    super(`Ulovlig overgang: '${event}' er ikke tilladt fra tilstanden '${from}'.`);
    this.name = "IllegalTransitionError";
  }
}

export class DoctorActionRequiredError extends Error {
  constructor(public readonly event: PipelineEvent) {
    super(`Hændelsen '${event}' kræver en eksplicit lægehandling (doctorId).`);
    this.name = "DoctorActionRequiredError";
  }
}

/** Ren overgangsfunktion: beregner næste tilstand uden sideeffekter. */
export function nextState(
  current: ReportStatus,
  event: PipelineEvent,
  opts: TransitionOptions = {}
): ReportStatus {
  const to = TRANSITIONS[current][event];
  if (!to) throw new IllegalTransitionError(current, event);
  if (DOCTOR_EVENTS.has(event) && !opts.doctorId) {
    throw new DoctorActionRequiredError(event);
  }
  return to;
}

/**
 * Stateful pipeline med revisionsspor. Hver overgang logges — uundværligt for
 * GDPR-ansvarlighed og for at kunne dokumentere lægens godkendelse.
 */
export class ReportPipeline {
  private _status: ReportStatus;
  private readonly _history: TransitionRecord[] = [];

  constructor(initial: ReportStatus = "raw_data") {
    this._status = initial;
  }

  get status(): ReportStatus {
    return this._status;
  }

  get history(): readonly TransitionRecord[] {
    return this._history;
  }

  get isReleased(): boolean {
    return this._status === "approved_for_release";
  }

  dispatch(event: PipelineEvent, opts: TransitionOptions = {}): ReportStatus {
    const from = this._status;
    const to = nextState(from, event, opts);
    this._status = to;
    const record: TransitionRecord = { from, to, event };
    if (opts.doctorId !== undefined) record.doctorId = opts.doctorId;
    if (opts.note !== undefined) record.note = opts.note;
    if (opts.at !== undefined) record.at = opts.at;
    this._history.push(record);
    return to;
  }
}
