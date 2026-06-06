import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FakeBalanceCard } from "@/components/FakeBalanceCard";
import { CoffeeExperiment } from "@/components/experiments/CoffeeExperiment";

export const Route = createFileRoute("/experiments/coffee")({
  head: () => ({ meta: [{ title: "Medida do café · BET-RAY Lab" }] }),
  component: () => (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <CoffeeExperiment />
        <FakeBalanceCard />
      </div>
    </AppShell>
  ),
});
