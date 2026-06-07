import { create } from "zustand";
import {
  deletePresetRow,
  initDb,
  loadSnapshot,
  loadUsers,
  getUserByLogin,
  createUser,
  updateUserPassword,
  persistBalances,
  persistEvent,
  persistExperiment,
  persistFriction,
  persistPreset,
  persistUserRole,
  persistUserPromoter,
  clearAll,
  type Preset,
} from "./sqlite";

export type ExperimentKey = "symbols" | "coffee" | "capacity";
export type UserRole = "admin-super" | "admin" | "mediator" | "user";
export type UserProfile = "user" | "promoter" | "admin-super";
export type Outcome = "loss" | "near-miss" | "win";

export type User = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  promoter: boolean;
  createdAt: string;
};

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
  roundLimit: number;
  winChance: number;
  nearMissChance: number;
  bonusFraction: number;
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

type ExperimentState = {
  params: ExperimentParams;
  stats: ExperimentStats;
  activePresetId: string | null;
};

type LabState = {
  ready: boolean;
  balances: Balances;
  events: LedgerEvent[];
  stats: Stats;
  showReflectiveModal: boolean;
  experiments: Record<ExperimentKey, ExperimentState>;
  frictions: FrictionEntry[];
  presets: Preset[];

  profile: UserProfile;
  adminUnlocked: boolean;
  currentUser: User | null;
  users: User[];
  houseFunds: number;
  totalHouseRevenue: number;
  totalBetsCount: number;
  batchBetsCounter: number;
  batchRevenueCounter: number;
  pendingBatchWins: number;
  nextWinPayout: number;
  consecutiveLosses: Record<ExperimentKey, number>;

  hydrate: () => Promise<void>;
  deposit: (amount: number) => void;
  pixDeposit: (amount: number) => void;
  registerBet: (amount: number, experiment: ExperimentKey) => void;
  registerResult: (experiment: ExperimentKey, category: Outcome, payout: number) => void;
  rollOutcome: (experiment: ExperimentKey) => Outcome;
  attemptWithdraw: () => string[];
  setParams: (experiment: ExperimentKey, params: Partial<ExperimentParams>) => void;
  resetExperiment: (experiment: ExperimentKey) => void;
  dismissReflective: () => void;
  reset: () => void;

  savePreset: (experiment: ExperimentKey, name: string) => Preset;
  applyPreset: (id: string) => void;
  deletePreset: (id: string) => void;

  setProfile: (profile: UserProfile) => void;
  unlockAdmin: () => void;
  lockAdmin: () => void;
  triggerBatch: () => void;
  getPayout: (experiment: ExperimentKey, outcome: Outcome) => number;
  setCurrentUser: (id: string) => void;
  setUserRole: (id: string, role: UserRole) => void;
  setUserPromoter: (id: string, promoter: boolean) => void;
  syncUsers: () => void;
  login: (login: string, password: string) => boolean;
  register: (username: string, email: string, password: string) => string | null;
  logout: () => void;
  resetPassword: (login: string) => string | null;
};

const initialBalances: Balances = {
  deposited: 0,
  bonus: 0,
  visual: 0,
  withdrawable: 0,
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
): { events: LedgerEvent[]; created: LedgerEvent } {
  const created: LedgerEvent = {
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
  };
  return { events: [created, ...events].slice(0, 400), created };
}

export function calculateEducationalBonus(deposit: number, fraction: number): number {
  if (deposit < 50) return fraction;
  return 0;
}

const initialExperiments: Record<ExperimentKey, ExperimentState> = {
  symbols: { params: defaultParams.symbols, stats: { ...emptyStats }, activePresetId: null },
  coffee: { params: defaultParams.coffee, stats: { ...emptyStats }, activePresetId: null },
  capacity: { params: defaultParams.capacity, stats: { ...emptyStats }, activePresetId: null },
};

export const useLab = create<LabState>((set, get) => ({
  ready: false,
  balances: initialBalances,
  events: [],
  stats: initialStats,
  showReflectiveModal: false,
  experiments: initialExperiments,
  frictions: [],
  presets: [],

  profile: "user",
  adminUnlocked: false,
  currentUser: null,
  users: [],
  houseFunds: 0,
  totalHouseRevenue: 0,
  totalBetsCount: 0,
  batchBetsCounter: 0,
  batchRevenueCounter: 0,
  pendingBatchWins: 0,
  nextWinPayout: 0,
  consecutiveLosses: { symbols: 0, coffee: 0, capacity: 0 },

  pixDeposit: (amount: number) => {
    const b = get().balances;
    const before = b.visual;
    const newDeposited = b.deposited + amount;
    const newWithdrawable = b.withdrawable + amount;
    const newVisual = newDeposited + b.bonus;

    const r = pushEvent(
      get().events,
      "DEPOSITO_FICTICIO",
      amount,
      before,
      newVisual,
      "pix_simulado",
      "saldo_visual",
      `Depósito via PIX simulado de R$${amount.toFixed(2)}.`,
    );
    persistEvent(r.created);
    const balances: Balances = {
      ...b,
      deposited: newDeposited,
      withdrawable: newWithdrawable,
      visual: newVisual,
    };
    persistBalances(balances);
    set({ balances, events: r.events });
  },

  hydrate: async () => {
    try {
      await initDb();
      const snap = await loadSnapshot();
      const experiments: Record<ExperimentKey, ExperimentState> = { ...initialExperiments };
      (Object.keys(experiments) as ExperimentKey[]).forEach((k) => {
        const loaded = snap.experiments[k];
        if (loaded) experiments[k] = loaded;
      });
      // Derive aggregate stats from per-experiment stats and events
      const aggregate: Stats = {
        rounds: 0,
        wins: 0,
        losses: 0,
        nearMisses: 0,
        withdrawAttempts: 0,
        frictionEvents: 0,
      };
      (Object.keys(experiments) as ExperimentKey[]).forEach((k) => {
        aggregate.rounds += experiments[k].stats.rounds;
        aggregate.wins += experiments[k].stats.wins;
        aggregate.losses += experiments[k].stats.losses;
        aggregate.nearMisses += experiments[k].stats.nearMisses;
      });
      aggregate.frictionEvents = snap.frictions.length;
      aggregate.withdrawAttempts = snap.events.filter((e) => e.type === "TENTATIVA_SAQUE").length;

      const userRows = loadUsers();
      const users: User[] = userRows.map((r) => ({
        id: r.id,
        username: r.username,
        email: r.email,
        role: r.role,
        promoter: r.promoter === 1,
        createdAt: r.created_at,
      }));

      set({
        ready: true,
        balances: snap.balances ?? initialBalances,
        events: snap.events,
        frictions: snap.frictions,
        experiments,
        presets: snap.presets,
        stats: aggregate,
        users,
      });
    } catch (e) {
      console.warn("[lab-store] hydrate failed, running in-memory", e);
      set({ ready: true });
    }
  },

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

    const r1 = pushEvent(
      get().events,
      "DEPOSITO_FICTICIO",
      amount,
      before,
      newVisual,
      "wallet_ficticia",
      "saldo_visual",
      `Depósito fictício de R$${amount.toFixed(2)}.`,
    );
    persistEvent(r1.created);
    let events = r1.events;
    if (bonus > 0) {
      const r2 = pushEvent(
        events,
        "BONUS_SIMULADO",
        bonus,
        newVisual - bonus,
        newVisual,
        "promo_simulada",
        "saldo_bonus",
        `Bônus fracionado simulado de R$${bonus.toFixed(2)} (não sacável).`,
      );
      persistEvent(r2.created);
      events = r2.events;
    }
    const balances: Balances = {
      deposited: newDeposited,
      bonus: newBonus,
      visual: newVisual,
      withdrawable: newWithdrawable,
      blocked: newBlocked,
      fractional: newFractional,
    };
    persistBalances(balances);
    set({ balances, events });
  },

  registerBet: (amount, experiment) => {
    const b = get().balances;
    if (b.visual < amount) return;
    const before = b.visual;
    const newVisual = b.visual - amount;
    const newWithdrawable = Math.max(0, b.withdrawable - amount);
    const exp = get().experiments[experiment];
    const r = pushEvent(
      get().events,
      "APOSTA_FICTICIA",
      amount,
      before,
      newVisual,
      "saldo_visual",
      "pool_simulada",
      `Aposta fictícia de R$${amount.toFixed(2)}.`,
      experiment,
    );
    const balances = { ...b, visual: newVisual, withdrawable: newWithdrawable };
    const newExp: ExperimentState = {
      ...exp,
      stats: { ...exp.stats, totalBet: exp.stats.totalBet + amount },
    };

    const s = get();
    const newHF = s.houseFunds + amount;
    const newRevenue = s.totalHouseRevenue + amount;
    const newCount = s.totalBetsCount + 1;

    let patch: Partial<LabState> = {
      houseFunds: newHF,
      totalHouseRevenue: newRevenue,
      totalBetsCount: newCount,
    };

    if (s.profile === "user") {
      const newBets = s.batchBetsCounter + 1;
      const newRev = s.batchRevenueCounter + amount;

      if (newBets >= 10001 || newRev >= 1999999) {
        const prizePool = Math.floor(newRevenue * 0.007);
        const numWinners = 1 + Math.floor(Math.random() * 3);
        const perWin = numWinners > 0 ? Math.max(1, Math.floor(prizePool / numWinners)) : 0;
        patch = {
          ...patch,
          batchBetsCounter: 0,
          batchRevenueCounter: 0,
          pendingBatchWins: numWinners,
          nextWinPayout: perWin,
        };
      } else {
        patch = { ...patch, batchBetsCounter: newBets, batchRevenueCounter: newRev };
      }
    }

    persistBalances(balances);
    persistEvent(r.created);
    persistExperiment(experiment, newExp.params, newExp.stats, newExp.activePresetId);
    set({
      ...patch,
      balances,
      events: r.events,
      experiments: { ...get().experiments, [experiment]: newExp },
    });
  },

  rollOutcome: (experiment) => {
    const state = get();
    const p = state.experiments[experiment].params;
    const user = state.currentUser;

    const role = user?.role ?? "user";
    const isPromoter = user?.promoter ?? false;

    if (role === "admin-super" || role === "admin") {
      const r = Math.random();
      if (r < p.winChance) return "win";
      if (r < p.winChance + p.nearMissChance) return "near-miss";
      return "loss";
    }

    if (isPromoter) {
      const losses = state.consecutiveLosses[experiment] ?? 0;
      if (losses >= 3) {
        set({ consecutiveLosses: { ...get().consecutiveLosses, [experiment]: 0 } });
        return "win";
      }
      set({ consecutiveLosses: { ...get().consecutiveLosses, [experiment]: losses + 1 } });
      return "loss";
    }

    if (state.pendingBatchWins > 0) {
      set({ pendingBatchWins: state.pendingBatchWins - 1 });
      return "win";
    }

    return Math.random() < 0.005 ? "near-miss" : "loss";
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
    const newExp: ExperimentState = { ...exp, stats: newExpStats };

    const reachedLimit =
      exp.params.roundLimit > 0 && newExpStats.rounds % exp.params.roundLimit === 0;

    const r = pushEvent(
      get().events,
      "RESULTADO_SIMULADO",
      payout,
      before,
      newVisual,
      "pool_simulada",
      "saldo_visual",
      `Resultado demonstrativo (${category}). Payout fictício R$${payout.toFixed(2)}.`,
      experiment,
    );
    const balances: Balances = {
      deposited: newDeposited,
      bonus: newBonus,
      visual: newVisual,
      withdrawable: newWithdrawable,
      blocked: newBlocked,
      fractional: newBonus % 1,
    };
    persistBalances(balances);
    persistEvent(r.created);
    persistExperiment(experiment, newExp.params, newExp.stats, newExp.activePresetId);
    set({
      balances,
      events: r.events,
      stats: newStats,
      experiments: { ...get().experiments, [experiment]: newExp },
      houseFunds: get().houseFunds - payout,
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
    const newEntries: FrictionEntry[] = alerts.map((m) => ({
      id: uid(),
      timestamp: ts,
      message: m,
    }));
    newEntries.forEach(persistFriction);
    const frictions = [...newEntries, ...get().frictions].slice(0, 200);

    const r = pushEvent(
      get().events,
      "TENTATIVA_SAQUE",
      b.withdrawable,
      b.visual,
      b.visual,
      "saldo_sacavel",
      "wallet_ficticia",
      `Tentativa de saque fictício. ${alerts.length} fricção(ões) detectada(s).`,
    );
    persistEvent(r.created);
    set({
      stats: {
        ...stats,
        withdrawAttempts: stats.withdrawAttempts + 1,
        frictionEvents: stats.frictionEvents + alerts.length,
      },
      events: r.events,
      frictions,
    });
    return alerts;
  },

  setParams: (experiment, partial) => {
    const exp = get().experiments[experiment];
    const newExp: ExperimentState = {
      ...exp,
      params: { ...exp.params, ...partial },
      activePresetId: null, // manual edit detaches preset
    };
    persistExperiment(experiment, newExp.params, newExp.stats, newExp.activePresetId);
    set({ experiments: { ...get().experiments, [experiment]: newExp } });
  },

  resetExperiment: (experiment) => {
    const exp = get().experiments[experiment];
    const newExp: ExperimentState = { ...exp, stats: { ...emptyStats } };
    persistExperiment(experiment, newExp.params, newExp.stats, newExp.activePresetId);
    set({ experiments: { ...get().experiments, [experiment]: newExp } });
  },

  dismissReflective: () => set({ showReflectiveModal: false }),

  reset: () => {
    clearAll();
    persistBalances(initialBalances);
    (Object.keys(initialExperiments) as ExperimentKey[]).forEach((k) => {
      persistExperiment(k, initialExperiments[k].params, initialExperiments[k].stats, null);
    });
    set({
      balances: initialBalances,
      events: [],
      stats: initialStats,
      frictions: [],
      experiments: initialExperiments,
    });
  },

  savePreset: (experiment, name) => {
    const exp = get().experiments[experiment];
    const preset: Preset = {
      id: uid(),
      experiment,
      name: name.trim() || `Preset ${get().presets.length + 1}`,
      params: { ...exp.params },
      createdAt: new Date().toISOString(),
    };
    persistPreset(preset);
    const newExp: ExperimentState = { ...exp, activePresetId: preset.id };
    persistExperiment(experiment, newExp.params, newExp.stats, newExp.activePresetId);
    set({
      presets: [preset, ...get().presets],
      experiments: { ...get().experiments, [experiment]: newExp },
    });
    return preset;
  },

  applyPreset: (id) => {
    const preset = get().presets.find((p) => p.id === id);
    if (!preset) return;
    const exp = get().experiments[preset.experiment];
    const newExp: ExperimentState = {
      ...exp,
      params: { ...preset.params },
      activePresetId: preset.id,
    };
    persistExperiment(preset.experiment, newExp.params, newExp.stats, newExp.activePresetId);
    set({ experiments: { ...get().experiments, [preset.experiment]: newExp } });
  },

  deletePreset: (id) => {
    deletePresetRow(id);
    const presets = get().presets.filter((p) => p.id !== id);
    const exps = { ...get().experiments };
    (Object.keys(exps) as ExperimentKey[]).forEach((k) => {
      if (exps[k].activePresetId === id) {
        const cleared: ExperimentState = { ...exps[k], activePresetId: null };
        exps[k] = cleared;
        persistExperiment(k, cleared.params, cleared.stats, null);
      }
    });
    set({ presets, experiments: exps });
  },

  setProfile: (profile) => {
    set({
      profile,
      consecutiveLosses: { symbols: 0, coffee: 0, capacity: 0 },
      pendingBatchWins: 0,
    });
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).__guaranteedWin = profile === "promoter";
    }
  },

  unlockAdmin: () => set({ adminUnlocked: true }),
  lockAdmin: () => {
    const def = get().users.find((u) => u.id === "user_001") ?? get().users[0] ?? null;
    const profile: UserProfile = def
      ? def.role === "admin-super"
        ? "admin-super"
        : def.promoter
          ? "promoter"
          : "user"
      : "user";
    set({
      adminUnlocked: false,
      currentUser: def,
      profile,
      consecutiveLosses: { symbols: 0, coffee: 0, capacity: 0 },
      pendingBatchWins: 0,
    });
  },

  setCurrentUser: (id) => {
    const user = get().users.find((u) => u.id === id);
    if (!user) return;
    const profile: UserProfile =
      user.role === "admin-super" ? "admin-super" : user.promoter ? "promoter" : "user";
    set({
      currentUser: user,
      profile,
      consecutiveLosses: { symbols: 0, coffee: 0, capacity: 0 },
      pendingBatchWins: 0,
    });
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).__guaranteedWin = user.promoter;
    }
  },

  setUserRole: (id, role) => {
    const user = get().users.find((u) => u.id === id);
    if (!user) return;
    const updated = { ...user, role };
    persistUserRole(id, role);
    const users = get().users.map((u) => (u.id === id ? updated : u));
    const patch: Partial<LabState> = { users };
    if (get().currentUser?.id === id) {
      const profile: UserProfile =
        role === "admin-super" ? "admin-super" : updated.promoter ? "promoter" : "user";
      patch.currentUser = updated;
      patch.profile = profile;
      patch.consecutiveLosses = { symbols: 0, coffee: 0, capacity: 0 };
      patch.pendingBatchWins = 0;
    }
    set(patch);
  },

  setUserPromoter: (id, promoter) => {
    const user = get().users.find((u) => u.id === id);
    if (!user) return;
    const updated = { ...user, promoter };
    persistUserPromoter(id, promoter);
    const users = get().users.map((u) => (u.id === id ? updated : u));
    const patch: Partial<LabState> = { users };
    if (get().currentUser?.id === id) {
      const profile: UserProfile =
        updated.role === "admin-super" ? "admin-super" : promoter ? "promoter" : "user";
      patch.currentUser = updated;
      patch.profile = profile;
      patch.consecutiveLosses = { symbols: 0, coffee: 0, capacity: 0 };
      patch.pendingBatchWins = 0;
    }
    set(patch);
  },

  syncUsers: () => {
    const rows = loadUsers();
    set({
      users: rows.map((r) => ({
        id: r.id,
        username: r.username,
        email: r.email,
        role: r.role,
        promoter: r.promoter === 1,
        createdAt: r.created_at,
      })),
    });
  },

  login: (login, password) => {
    const row = getUserByLogin(login);
    if (!row) return false;
    if (row.password !== password) return false;
    const user: User = {
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
      promoter: row.promoter === 1,
      createdAt: row.created_at,
    };
    const profile: UserProfile =
      user.role === "admin-super" ? "admin-super" : user.promoter ? "promoter" : "user";
    set({
      currentUser: user,
      profile,
      consecutiveLosses: { symbols: 0, coffee: 0, capacity: 0 },
      pendingBatchWins: 0,
    });
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).__guaranteedWin = user.promoter;
    }
    return true;
  },

  register: (username, email, password) => {
    const rows = loadUsers();
    if (rows.some((r) => r.username === username)) return "username";
    if (rows.some((r) => r.email === email)) return "email";
    const id = "user_" + String(rows.length + 1).padStart(3, "0");
    const ok = createUser(id, username, email, password, "user", 0);
    if (!ok) return "error";
    get().syncUsers();
    get().login(username, password);
    return null;
  },

  logout: () => {
    set({
      currentUser: null,
      profile: "user",
      consecutiveLosses: { symbols: 0, coffee: 0, capacity: 0 },
      pendingBatchWins: 0,
    });
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).__guaranteedWin = false;
    }
  },

  resetPassword: (login) => {
    const row = getUserByLogin(login);
    if (!row) return null;
    const newPwd = Math.random().toString(36).slice(2, 8);
    updateUserPassword(row.id, newPwd);
    get().syncUsers();
    return newPwd;
  },

  triggerBatch: () => {
    const s = get();
    const prizePool = Math.floor(s.totalHouseRevenue * 0.007);
    const numWinners = 1 + Math.floor(Math.random() * 3);
    const perWin = numWinners > 0 ? Math.max(1, Math.floor(prizePool / numWinners)) : 0;
    set({
      pendingBatchWins: numWinners,
      nextWinPayout: perWin,
      batchBetsCounter: 0,
      batchRevenueCounter: 0,
    });
  },

  getPayout: (experiment, outcome) => {
    if (outcome !== "win") return 0;
    const state = get();
    const user = state.currentUser;
    const role = user?.role ?? "user";
    const isPromoter = user?.promoter ?? false;
    if (role === "admin-super" || role === "admin" || isPromoter) return 5;
    const payout = state.nextWinPayout;
    if (payout > 0) return payout;
    return 5;
  },
}));

export const experimentLabels: Record<ExperimentKey, string> = {
  symbols: "Giro dos símbolos",
  coffee: "Medida do café",
  capacity: "Quantos cabem?",
};
