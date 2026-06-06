import { create } from "zustand";

export type SymbolKey = "pera" | "maca" | "ovo" | "xicara" | "pao" | "cafe";

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
};

export type Balances = {
  deposited: number;
  bonus: number;
  visual: number;
  withdrawable: number;
  blocked: number;
  fractional: number;
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
  deposit: (amount: number) => void;
  registerBet: (amount: number) => void;
  registerResult: (category: "loss" | "near-miss" | "partial" | "win", payout: number) => void;
  attemptWithdraw: () => string[];
  pushAlert: (note: string) => void;
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
    },
    ...events,
  ].slice(0, 200);
}

export function calculateEducationalBonus(deposit: number): number {
  if (deposit < 50) return 0.76;
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

  deposit: (amount) => {
    const b = get().balances;
    const bonus = calculateEducationalBonus(amount);
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

  registerBet: (amount) => {
    const b = get().balances;
    if (b.visual < amount) return;
    const before = b.visual;
    const newVisual = b.visual - amount;
    const newWithdrawable = Math.max(0, b.withdrawable - amount);
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
        `Aposta fictícia de R$${amount.toFixed(2)} registrada (sem valor real).`,
      ),
    });
  },

  registerResult: (category, payout) => {
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
      wins: stats.wins + (category === "win" || category === "partial" ? 1 : 0),
    };
    const showReflective = newStats.rounds % 5 === 0;
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
      ),
      stats: newStats,
      showReflectiveModal: showReflective,
    });
  },

  attemptWithdraw: () => {
    const b = get().balances;
    const alerts: string[] = [];
    if (b.bonus > 0) {
      alerts.push("Fricção detectada: o saldo visual inclui bônus não sacável.");
    }
    if (b.withdrawable % 1 !== 0 || b.fractional > 0) {
      alerts.push(
        "Fricção detectada: o saldo possui centavos, mas a regra simulada permite apenas saque inteiro.",
      );
    }
    alerts.push("Fricção detectada: o usuário não pode escolher saque parcial.");

    const stats = get().stats;
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
    });
    return alerts;
  },

  pushAlert: (note) => {
    const b = get().balances;
    set({
      events: pushEvent(
        get().events,
        "ALERTA_EDUCACIONAL",
        0,
        b.visual,
        b.visual,
        "sistema_educacional",
        "usuario_ficticio",
        note,
      ),
    });
  },

  dismissReflective: () => set({ showReflectiveModal: false }),

  reset: () => set({ balances: initialBalances, events: [], stats: initialStats }),
}));
