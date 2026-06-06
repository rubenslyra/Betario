import { useEffect } from "react";
import { useLab } from "@/lib/lab-store";

/**
 * Hydrates the Zustand store from the SQLite (sql.js) database on first mount.
 * Returns the `ready` flag so consumers can gate UI on hydration.
 */
export function useHydrateLab() {
  const ready = useLab((s) => s.ready);
  const hydrate = useLab((s) => s.hydrate);
  useEffect(() => {
    if (!ready) void hydrate();
  }, [ready, hydrate]);
  return ready;
}
