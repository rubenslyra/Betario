import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLab } from "@/lib/lab-store";
import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "Relatório crítico · BET-RAY Lab" }] }),
  component: ReportPage,
});

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="glass-panel p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function ReportPage() {
  const { balances, stats, attemptWithdraw } = useLab();
  const [alerts, setAlerts] = useState<string[] | null>(null);

  const tryWithdraw = () => setAlerts(attemptWithdraw());

  return (
    <AppShell>
      <h1 className="mb-1 text-3xl font-bold">Relatório crítico</h1>
      <p className="mb-8 max-w-3xl text-sm text-muted-foreground">
        Visão agregada do comportamento simulado. Nenhum valor real envolvido.
      </p>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">
        Métricas fictícias
      </h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Depositado" value={`R$ ${balances.deposited.toFixed(2)}`} />
        <Metric label="Bônus simulado" value={`R$ ${balances.bonus.toFixed(2)}`} />
        <Metric label="Saldo visual" value={`R$ ${balances.visual.toFixed(2)}`} />
        <Metric label="Saldo sacável" value={`R$ ${balances.withdrawable.toFixed(2)}`} />
        <Metric label="Bloqueado" value={`R$ ${balances.blocked.toFixed(2)}`} />
        <Metric label="Fracionado" value={`R$ ${balances.fractional.toFixed(2)}`} />
        <Metric label="Fricções" value={String(stats.frictionEvents)} />
        <Metric label="Rodadas" value={String(stats.rounds)} />
      </div>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">
        Métricas comportamentais
      </h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Perdas" value={String(stats.losses)} />
        <Metric label="Quase acertos" value={String(stats.nearMisses)} hint="Reforço emocional" />
        <Metric label="Acertos" value={String(stats.wins)} />
        <Metric label="Tentativas de saque" value={String(stats.withdrawAttempts)} />
      </div>

      <div className="glass-panel mb-8 p-5">
        <h2 className="mb-3 text-sm font-semibold">Interpretação</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Saldo visual alto pode aumentar percepção de disponibilidade.</li>
          <li>• Bônus fracionado pode criar saldo residual.</li>
          <li>• Saque parcial bloqueado reduz controle granular do usuário.</li>
          <li>• Quase acerto pode reforçar repetição.</li>
        </ul>
      </div>

      <div className="glass-panel p-5">
        <h2 className="mb-2 text-sm font-semibold">Tentar saque fictício</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Esta ação dispara as regras simuladas de fricção. Nada sai do sistema.
        </p>
        <button
          onClick={tryWithdraw}
          className="rounded-lg bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-background transition hover:opacity-90"
        >
          Solicitar saque (simulado)
        </button>

        {alerts && (
          <div className="mt-4 space-y-2">
            {alerts.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-foreground"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />
                {a}
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" /> Nenhuma fricção detectada.
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
