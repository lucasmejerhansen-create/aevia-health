import { test } from "node:test";
import assert from "node:assert/strict";
import { percentileFor, PERCENTILE_MARKERS } from "../src/percentiles.js";

test("VO2max: høj værdi → høj percentil", () => {
  const p = percentileFor("vo2max", 48, 45, "male"); // 40-bracket p75=43,p90=48
  assert.ok(p !== null && p >= 85);
});

test("hvilepuls (lavere er bedre): lav puls → høj percentil", () => {
  const lav = percentileFor("hvilepuls", 52, 45, "male");
  const hoej = percentileFor("hvilepuls", 71, 45, "male");
  assert.ok(lav! > hoej!);
});

test("ukendt markør → null", () => {
  assert.equal(percentileFor("ldl", 2, 45, "male"), null);
  assert.ok(PERCENTILE_MARKERS.includes("vo2max"));
});
