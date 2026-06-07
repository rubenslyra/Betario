export type Outcome = "loss" | "near-miss" | "win";
export type RollRole = "admin-super" | "admin" | "user";

export type RollParams = {
  winChance: number;
  nearMissChance: number;
};

export type RollDecision = {
  outcome: Outcome;
  consecutiveLosses?: number;
  pendingBatchWins?: number;
};

export function calculateEducationalBonus(deposit: number, fraction: number): number {
  if (deposit < 50) return fraction;
  return 0;
}

export function decideRollOutcome({
  params,
  role,
  isPromoter,
  consecutiveLosses,
  pendingBatchWins,
  random,
}: {
  params: RollParams;
  role: RollRole;
  isPromoter: boolean;
  consecutiveLosses: number;
  pendingBatchWins: number;
  random: number;
}): RollDecision {
  if (role === "admin-super" || role === "admin") {
    if (random < params.winChance) return { outcome: "win" };
    if (random < params.winChance + params.nearMissChance) return { outcome: "near-miss" };
    return { outcome: "loss" };
  }

  if (isPromoter) {
    if (consecutiveLosses >= 3) {
      return { outcome: "win", consecutiveLosses: 0 };
    }
    return { outcome: "loss", consecutiveLosses: consecutiveLosses + 1 };
  }

  if (pendingBatchWins > 0) {
    return { outcome: "win", pendingBatchWins: pendingBatchWins - 1 };
  }

  return { outcome: random < 0.005 ? "near-miss" : "loss" };
}
