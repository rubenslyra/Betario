import type {
  Balances,
  ExperimentKey,
  ExperimentParams,
  ExperimentStats,
  FrictionEntry,
  LedgerEvent,
} from "./lab-store";

export type LabStateSnapshot = {
  balances: Balances;
  experiments: Array<{
    key: ExperimentKey;
    label: string;
    params: ExperimentParams;
    stats: ExperimentStats;
  }>;
  frictions: FrictionEntry[];
  events: LedgerEvent[];
};
