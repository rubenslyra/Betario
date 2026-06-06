import { create } from "zustand";

export type ExperimentKey = "symbols" | "coffee" | "capacity";

export type LedgerEventType =
  | "DEPOSITO_FICTICIO"
  | "BONUS_SIMULADO"
  | "APOSTA_FICTICIA"
  | "RESULTADO_SIMULADO"
  | "TENTATIVA_SAQUE"
  | "SAQUE_SIMULADO"
  | "FRICCAO_DE_SAQUE"
  | "ALERTA_EDUCACIONAL";

export type LedgerEvent = {
  id: string;
  userId: string;
  type: LedgerEventType;
  amount: number;
  beforeBalance: number;
  afterBalance: number;
  source: string;
  target: string;
  timestamp: string;
  note: string;
  experiment?: ExperimentKey;
};

export type Balances = {
  deposited: number;
  bonus: number;
  visual: number;
  withdrawable: number;
  blocked: number;
  fractional: number;
};

export type ExperimentParams = {
  roundLimit: number; // 0 = unlimited
  winChance: number; // 0-1
  nearMissChance: number; // 0-1
  bonusFraction: number; // R$ given as bonus on deposits < 50
};

export type ExperimentStats = {
  rounds: number;
  wins: number;
  nearMisses: number;
  losses: number;
  totalBet: number;
  totalPayout: number;
};

export type FrictionEntry = {
  id: string;
  timestamp: string;
  message: string;
};

const defaultParams: Record<ExperimentKey, ExperimentParams> = {
  symbols: { roundLimit: 20, winChance: 0.04, nearMissChance: 0.28, bonusFraction: 0.76 },
  coffee: { roundLimit: 15, winChance: 0.1, nearMissChance: 0.25, bonusFraction: 0.76 },
  capacity: { roundLimit: 15, winChance: 0.1, nearMissChance: 0.25, bonusFraction: 0.76 },
};

const emptyStats: ExperimentStats = {
  rounds: 0,
  wins: 0,
  nearMisses: 0,
  losses: 0,
  totalBet: 0,
  totalPayout: 0,
};

type Stats = {
  rounds: number;
  losses: number;
  nearMisses: number;
  wins: number;
  withdrawAttempts: number;
  frictionEvents: number;
};

type LabState = {
  balances: Balances;
  events: LedgerEvent[];
  stats: Stats;
  showReflectiveModal: boolean;
  experiments: Record<ExperimentKey, { params: ExperimentParams; stats: ExperimentStats }>;
  frictions: FrictionEntry[];

  deposit: (amount: number) => void;
  registerBet: (amount: number, experiment: ExperimentKey) => void;
  registerResult: (
    experiment: ExperimentKey,
    category: "loss" | "near-miss" | "win",
    payout: number,
  ) => void;
  rollOutcome: (experiment: ExperimentKey) => "loss" | "near-miss" | "win";
  attemptWithdraw: () => string[];
  setParams: (experiment: ExperimentKey, params: Partial<ExperimentParams>) => void;
  resetExperiment: (experiment: ExperimentKey) => void;
  dismissReflective: () => void;
  reset: () => void;
};

const initialBalances: Balances = {
  deposited: 50,
  bonus: 0,
  visual: 50,
  withdrawable: 50,
  blocked: 0,
  fractional: 0,
};

const initialStats: Stats = {
  rounds: 0,
  losses: 0,
  nearMisses: 0,
  wins: 0,
  withdrawAttempts: 0,
  frictionEvents: 0,
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function pushEvent(
  events: LedgerEvent[],
  type: LedgerEventType,
  amount: number,
  before: number,
  after: number,
  source: string,
  target: string,
  note: string,
  experiment?: ExperimentKey,
): LedgerEvent[] {
  return [
    {
      id: uid(),
      userId: "user_fict_001",
      type,
      amount,
      beforeBalance: before,
      afterBalance: after,
      source,
      target,
      timestamp: new Date().toISOString(),
      note,
      experiment,
    },
    ...events,
  ].slice(0, 400);
}

export function calculateEducationalBonus(deposit: number, fraction: number): number {
  if (deposit < 50) return fraction;
  return 0;
}

export const useLab = create<LabState>((set, get) => ({
  balances: initialBalances,
  events: [
    {
      id: uid(),
      userId: "user_fict_001",
      type: "DEPOSITO_FICTICIO",
      amount: 50,
      beforeBalance: 0,
      afterBalance: 50,
      source: "wallet_ficticia",
      target: "saldo_visual",
      timestamp: new Date().toISOString(),
      note: "Saldo inicial fictício para fins didáticos.",
    },
  ],
  stats: initialStats,
  showReflectiveModal: false,
  experiments: {
    symbols: { params: defaultParams.symbols, stats: { ...emptyStats } },
    coffee: { params: defaultParams.coffee, stats: { ...emptyStats } },
    capacity: { params: defaultParams.capacity, stats: { ...emptyStats } },
  },
  frictions: [],

  deposit: (amount) => {
    const b = get().balances;
    const fraction = get().experiments.symbols.params.bonusFraction;
    const bonus = calculateEducationalBonus(amount, fraction);
    const before = b.visual;
    const newDeposited = b.deposited + amount;
    const newBonus = b.bonus + bonus;
    const newWithdrawable = b.withdrawable + amount;
    const newBlocked = b.blocked + bonus;
    const newVisual = newDeposited + newBonus;
    const newFractional = newBonus % 1;

    let events = pushEvent(
      get().events,
      "DEPOSITO_FICTICIO",
      amount,
      before,
      newVisual,
      "wallet_ficticia",
      "saldo_visual",
      `Depósito fictício de R$${amount.toFixed(2)}.`,
    );
    if (bonus > 0) {
      events = pushEvent(
        events,
        "BONUS_SIMULADO",
        bonus,
        newVisual - bonus,
        newVisual,
        "promo_simulada",
        "saldo_bonus",
        `Bônus fracionado simulado de R$${bonus.toFixed(2)} (não sacável).`,
      );
    }
    set({
      balances: {
        deposited: newDeposited,
        bonus: newBonus,
        visual: newVisual,
        withdrawable: newWithdrawable,
        blocked: newBlocked,
        fractional: newFractional,
      },
      events,
    });
  },

  registerBet: (amount, experiment) => {
    const b = get().balances;
    if (b.visual < amount) return;
    const before = b.visual;
    const newVisual = b.visual - amount;
    const newWithdrawable = Math.max(0, b.withdrawable - amount);
    const exp = get().experiments[experiment];
    set({
      balances: { ...b, visual: newVisual, withdrawable: newWithdrawable },
      events: pushEvent(
        get().events,
        "APOSTA_FICTICIA",
        amount,
        before,
        newVisual,
        "saldo_visual",
        "pool_simulada",
        `Aposta fictícia de R$${amount.toFixed(2)}.`,
        experiment,
      ),
      experiments: {
        ...get().experiments,
        [experiment]: {
          ...exp,
          stats: { ...exp.stats, totalBet: exp.stats.totalBet + amount },
        },
      },
    });
  },

  rollOutcome: (experiment) => {
    const p = get().experiments[experiment].params;
    const r = Math.random();
    if (r < p.winChance) return "win";
    if (r < p.winChance + p.nearMissChance) return "near-miss";
    return "loss";
  },

  registerResult: (experiment, category, payout) => {
    const b = get().balances;
    const before = b.visual;
    const newVisual = b.visual + payout;
    const newDeposited = b.deposited + (payout > 0 ? payout * 0.6 : 0);
    const newBonus = b.bonus + (payout > 0 ? payout * 0.4 : 0);
    const newWithdrawable = b.withdrawable + (payout > 0 ? payout * 0.6 : 0);
    const newBlocked = b.blocked + (payout > 0 ? payout * 0.4 : 0);

    const stats = get().stats;
    const newStats: Stats = {
      ...stats,
      rounds: stats.rounds + 1,
      losses: stats.losses + (category === "loss" ? 1 : 0),
      nearMisses: stats.nearMisses + (category === "near-miss" ? 1 : 0),
      wins: stats.wins + (category === "win" ? 1 : 0),
    };

    const exp = get().experiments[experiment];
    const newExpStats: ExperimentStats = {
      rounds: exp.stats.rounds + 1,
      wins: exp.stats.wins + (category === "win" ? 1 : 0),
      nearMisses: exp.stats.nearMisses + (category === "near-miss" ? 1 : 0),
      losses: exp.stats.losses + (category === "loss" ? 1 : 0),
      totalBet: exp.stats.totalBet,
      totalPayout: exp.stats.totalPayout + payout,
    };

    const reachedLimit =
      exp.params.roundLimit > 0 && newExpStats.rounds % exp.params.roundLimit === 0;

    set({
      balances: {
        deposited: newDeposited,
        bonus: newBonus,
        visual: newVisual,
        withdrawable: newWithdrawable,
        blocked: newBlocked,
        fractional: newBonus % 1,
      },
      events: pushEvent(
        get().events,
        "RESULTADO_SIMULADO",
        payout,
        before,
        newVisual,
        "pool_simulada",
        "saldo_visual",
        `Resultado demonstrativo (${category}). Payout fictício R$${payout.toFixed(2)}.`,
        experiment,
      ),
      stats: newStats,
      experiments: {
        ...get().experiments,
        [experiment]: { params: exp.params, stats: newExpStats },
      },
      showReflectiveModal: reachedLimit || newStats.rounds % 10 === 0,
    });
  },

  attemptWithdraw: () => {
    const b = get().balances;
    const alerts: string[] = [];
    if (b.bonus > 0) alerts.push("Fricção detectada: o saldo visual inclui bônus não sacável.");
    if (b.withdrawable % 1 !== 0 || b.fractional > 0)
      alerts.push(
        "Fricção detectada: o saldo possui centavos, mas a regra simulada permite apenas saque inteiro.",
      );
    alerts.push("Fricção detectada: o usuário não pode escolher saque parcial.");

    const stats = get().stats;
    const ts = new Date().toISOString();
    const newFrictions: FrictionEntry[] = [
      ...alerts.map((m) => ({ id: uid(), timestamp: ts, message: m })),
      ...get().frictions,
    ].slice(0, 200);

    set({
      stats: {
        ...stats,
        withdrawAttempts: stats.withdrawAttempts + 1,
        frictionEvents: stats.frictionEvents + alerts.length,
      },
      events: pushEvent(
        get().events,
        "TENTATIVA_SAQUE",
        b.withdrawable,
        b.visual,
        b.visual,
        "saldo_sacavel",
        "wallet_ficticia",
        `Tentativa de saque fictício. ${alerts.length} fricção(ões) detectada(s).`,
      ),
      frictions: newFrictions,
    });
    return alerts;
  },

  setParams: (experiment, partial) => {
    const exp = get().experiments[experiment];
    set({
      experiments: {
        ...get().experiments,
        [experiment]: { ...exp, params: { ...exp.params, ...partial } },
      },
    });
  },

  resetExperiment: (experiment) => {
    const exp = get().experiments[experiment];
    set({
      experiments: {
        ...get().experiments,
        [experiment]: { params: exp.params, stats: { ...emptyStats } },
      },
    });
  },

  dismissReflective: () => set({ showReflectiveModal: false }),

  reset: () =>
    set({
      balances: initialBalances,
      events: [],
      stats: initialStats,
      frictions: [],
      experiments: {
        symbols: { params: defaultParams.symbols, stats: { ...emptyStats } },
        coffee: { params: defaultParams.coffee, stats: { ...emptyStats } },
        capacity: { params: defaultParams.capacity, stats: { ...emptyStats } },
      },
    }),
}));

export const experimentLabels: Record<ExperimentKey, string> = {
  symbols: "Giro dos símbolos",
  coffee: "Medida do café",
  capacity: "Quantos cabem?",
};
