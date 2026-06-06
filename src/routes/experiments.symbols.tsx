import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FakeBalanceCard } from "@/components/FakeBalanceCard";
import { SymbolsExperiment } from "@/components/experiments/SymbolsExperiment";

export const Route = createFileRoute("/experiments/symbols")({
  head: () => ({ meta: [{ title: "Giro dos símbolos · BET-RAY Lab" }] }),
  component: () => (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SymbolsExperiment />
        <FakeBalanceCard />
      </div>
    </AppShell>
  ),
});
