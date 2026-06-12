import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DoctorActionRequiredError,
  IllegalTransitionError,
  ReportPipeline,
  nextState,
} from "../src/pipeline.js";

test("lovlig vej: raw_data → classified → draft_pending_doctor", () => {
  const p = new ReportPipeline();
  assert.equal(p.dispatch("classify"), "classified");
  assert.equal(p.dispatch("prepare_draft"), "draft_pending_doctor");
});

test("KERNEPRINCIP: godkendelse uden læge-id afvises", () => {
  assert.throws(
    () => nextState("draft_pending_doctor", "doctor_approve"),
    DoctorActionRequiredError
  );
});

test("godkendelse kræver eksplicit lægehandling og logges", () => {
  const p = new ReportPipeline("draft_pending_doctor");
  assert.equal(p.dispatch("doctor_approve", { doctorId: "dr-judit", at: "2026-06-12T10:00:00Z" }), "approved_for_release");
  assert.ok(p.isReleased);
  const last = p.history.at(-1)!;
  assert.equal(last.doctorId, "dr-judit");
  assert.equal(last.event, "doctor_approve");
});

test("ingen genvej til approved_for_release fra raw_data", () => {
  assert.throws(() => nextState("raw_data", "doctor_approve", { doctorId: "x" }), IllegalTransitionError);
});

test("approved_for_release er terminal", () => {
  const p = new ReportPipeline("approved_for_release");
  assert.throws(() => p.dispatch("doctor_reject", { doctorId: "x" }), IllegalTransitionError);
});

test("afvisning → re-draft loop", () => {
  const p = new ReportPipeline("draft_pending_doctor");
  assert.equal(p.dispatch("doctor_reject", { doctorId: "dr-judit", note: "Tjek thyroidea igen" }), "rejected");
  assert.equal(p.dispatch("redraft"), "draft_pending_doctor");
});
