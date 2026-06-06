import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FakeBalanceCard } from "@/components/FakeBalanceCard";
import { CapacityExperiment } from "@/components/experiments/CapacityExperiment";

export const Route = createFileRoute("/experiments/capacity")({
  head: () => ({ meta: [{ title: "Quantos cabem? · BET-RAY Lab" }] }),
  component: () => (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <CapacityExperiment />
        <FakeBalanceCard />
      </div>
    </AppShell>
  ),
});
