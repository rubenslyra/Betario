import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FakeBalanceCard } from "@/components/FakeBalanceCard";
import { SymbolsExperiment } from "@/components/experiments/SymbolsExperiment";
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

export const Route = createFileRoute("/experiments/symbols")({
  head: () => ({ meta: [{ title: "Giro dos símbolos · Betario" }] }),
  component: () => (
    <Guard>
      <AppShell>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <SymbolsExperiment />
          <FakeBalanceCard />
        </div>
      </AppShell>
    </Guard>
  ),
});
