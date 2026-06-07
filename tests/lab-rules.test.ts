import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { calculateEducationalBonus, decideRollOutcome } from "../src/lib/lab-rules.js";

const params = { winChance: 0.1, nearMissChance: 0.25 };

describe("calculateEducationalBonus", () => {
  it("applies the educational fractional bonus only below 50", () => {
    assert.equal(calculateEducationalBonus(10, 0.76), 0.76);
    assert.equal(calculateEducationalBonus(49.99, 0.76), 0.76);
    assert.equal(calculateEducationalBonus(50, 0.76), 0);
  });
});

describe("decideRollOutcome", () => {
  it("uses configured probabilities for admins", () => {
    assert.equal(
      decideRollOutcome({
        params,
        role: "admin",
        isPromoter: false,
        consecutiveLosses: 0,
        pendingBatchWins: 0,
        random: 0.05,
      }).outcome,
      "win",
    );
    assert.equal(
      decideRollOutcome({
        params,
        role: "admin-super",
        isPromoter: false,
        consecutiveLosses: 0,
        pendingBatchWins: 0,
        random: 0.2,
      }).outcome,
      "near-miss",
    );
    assert.equal(
      decideRollOutcome({
        params,
        role: "admin",
        isPromoter: false,
        consecutiveLosses: 0,
        pendingBatchWins: 0,
        random: 0.9,
      }).outcome,
      "loss",
    );
  });

  it("guarantees a promoter win after three consecutive losses", () => {
    assert.deepEqual(
      decideRollOutcome({
        params,
        role: "user",
        isPromoter: true,
        consecutiveLosses: 2,
        pendingBatchWins: 0,
        random: 0,
      }),
      { outcome: "loss", consecutiveLosses: 3 },
    );
    assert.deepEqual(
      decideRollOutcome({
        params,
        role: "user",
        isPromoter: true,
        consecutiveLosses: 3,
        pendingBatchWins: 0,
        random: 0.99,
      }),
      { outcome: "win", consecutiveLosses: 0 },
    );
  });

  it("uses pending batch wins before common-user near misses", () => {
    assert.deepEqual(
      decideRollOutcome({
        params,
        role: "user",
        isPromoter: false,
        consecutiveLosses: 0,
        pendingBatchWins: 2,
        random: 0.99,
      }),
      { outcome: "win", pendingBatchWins: 1 },
    );
  });

  it("keeps common users at loss or rare near-miss outside batch wins", () => {
    assert.equal(
      decideRollOutcome({
        params,
        role: "user",
        isPromoter: false,
        consecutiveLosses: 0,
        pendingBatchWins: 0,
        random: 0.004,
      }).outcome,
      "near-miss",
    );
    assert.equal(
      decideRollOutcome({
        params,
        role: "user",
        isPromoter: false,
        consecutiveLosses: 0,
        pendingBatchWins: 0,
        random: 0.006,
      }).outcome,
      "loss",
    );
  });
});
