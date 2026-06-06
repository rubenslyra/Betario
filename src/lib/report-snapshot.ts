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
    activePresetName: string | null;
  }>;
  presets: Array<{
    id: string;
    experiment: ExperimentKey;
    experimentLabel: string;
    name: string;
    params: ExperimentParams;
    createdAt: string;
  }>;
  frictions: FrictionEntry[];
  events: LedgerEvent[];
};
