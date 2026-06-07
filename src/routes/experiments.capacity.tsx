import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FakeBalanceCard } from "@/components/FakeBalanceCard";
import { CapacityExperiment } from "@/components/experiments/CapacityExperiment";
import { useLab } from "@/lib/lab-store";
import { useEffect } from "react";

function Guard({ children }: { children: React.ReactNode }) {
  const user = useLab((s) => s.currentUser);
  const router = useRouter();
  useEffect(() => {
    if (!user) router.navigate({ to: "/" });
  }, [user, router]);
  if (!user) return null;
  return <>{children}</>;
}

export const Route = createFileRoute("/experiments/capacity")({
  head: () => ({ meta: [{ title: "Quantos cabem? · BET-RAY Lab" }] }),
  component: () => (
    <Guard>
      <AppShell>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <CapacityExperiment />
          <FakeBalanceCard />
        </div>
      </AppShell>
    </Guard>
  ),
});
