import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { experimentLabels, useLab, type ExperimentKey } from "@/lib/lab-store";
import { useHydrateLab } from "@/hooks/use-hydrate-lab";
import { useMemo, useState, useRef } from "react";
import { AlertTriangle, CheckCircle2, Download, Database, Upload } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { exportReportPdf } from "@/lib/export-pdf";
import { downloadDb, importDb } from "@/lib/sqlite";
import { AccessibleChartTable } from "@/components/AccessibleChartTable";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "Relatório crítico · BET-RAY Lab" }] }),
  component: ReportPage,
});


function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="glass-panel p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

const ledgerColors = {
  DEPOSITO_FICTICIO: "oklch(0.72 0.16 235)",
  BONUS_SIMULADO: "oklch(0.85 0.17 92)",
  APOSTA_FICTICIA: "oklch(0.55 0.04 250)",
  RESULTADO_SIMULADO: "oklch(0.78 0.17 145)",
  TENTATIVA_SAQUE: "oklch(0.85 0.17 60)",
  SAQUE_SIMULADO: "oklch(0.78 0.17 145)",
  FRICCAO_DE_SAQUE: "oklch(0.7 0.2 25)",
  ALERTA_EDUCACIONAL: "oklch(0.78 0.16 75)",
} as const;

function ReportPage() {
  useHydrateLab();
  const balances = useLab((s) => s.balances);
  const stats = useLab((s) => s.stats);
  const events = useLab((s) => s.events);
  const experiments = useLab((s) => s.experiments);
  const presets = useLab((s) => s.presets);
  const frictions = useLab((s) => s.frictions);
  const attemptWithdraw = useLab((s) => s.attemptWithdraw);
  const [alerts, setAlerts] = useState<string[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const tryWithdraw = () => setAlerts(attemptWithdraw());

  const ledgerTotals = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const e of events) acc[e.type] = (acc[e.type] ?? 0) + 1;
    return Object.entries(acc).map(([type, count]) => ({ type, count }));
  }, [events]);

  const nearMissByExperiment = useMemo(
    () =>
      (Object.keys(experiments) as ExperimentKey[]).map((k) => ({
        label: experimentLabels[k],
        quase: experiments[k].stats.nearMisses,
        acertos: experiments[k].stats.wins,
        perdas: experiments[k].stats.losses,
      })),
    [experiments],
  );

  const handleExport = () => {
    exportReportPdf({
      balances,
      experiments: (Object.keys(experiments) as ExperimentKey[]).map((k) => {
        const activeId = experiments[k].activePresetId;
        const active = activeId ? presets.find((p) => p.id === activeId) : null;
        return {
          key: k,
          label: experimentLabels[k],
          params: experiments[k].params,
          stats: experiments[k].stats,
          activePresetName: active?.name ?? null,
        };
      }),
      presets: presets.map((p) => ({
        id: p.id,
        experiment: p.experiment,
        experimentLabel: experimentLabels[p.experiment],
        name: p.name,
        params: p.params,
        createdAt: p.createdAt,
      })),
      frictions,
      events,
    });
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    await importDb(file);
    // Re-hydrate by forcing reload (simpler than re-running store hydrate)
    window.location.reload();
  };

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Relatório crítico</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Visão agregada do comportamento simulado. Persistência local em
            SQLite (sql.js) — nada sai do seu navegador.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => downloadDb()}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-glass px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Baixar banco SQLite portável"
          >
            <Database className="h-3.5 w-3.5" aria-hidden="true" />
            Exportar .sqlite
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-glass px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Importar banco SQLite"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            Importar .sqlite
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".sqlite,application/x-sqlite3,application/octet-stream"
            className="hidden"
            onChange={(e) => handleImport(e.target.files?.[0] ?? null)}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-semibold text-background shadow-lg shadow-primary/30 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Exportar relatório educacional como PDF"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Exportar PDF
          </button>
        </div>
      </div>


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
        <Metric label="Rodadas totais" value={String(stats.rounds)} />
      </div>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">
        Parâmetros e desempenho por experimento
      </h2>
      <div className="mb-8 grid gap-3 md:grid-cols-3">
        {(Object.keys(experiments) as ExperimentKey[]).map((k) => {
          const e = experiments[k];
          const net = e.stats.totalPayout - e.stats.totalBet;
          return (
            <article key={k} className="glass-panel p-4">
              <h3 className="text-sm font-semibold">{experimentLabels[k]}</h3>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <dt className="text-muted-foreground">Rodadas</dt>
                <dd className="text-right font-mono">{e.stats.rounds}</dd>
                <dt className="text-muted-foreground">Acertos / quase / perdas</dt>
                <dd className="text-right font-mono">
                  {e.stats.wins}/{e.stats.nearMisses}/{e.stats.losses}
                </dd>
                <dt className="text-muted-foreground">P(acerto) · P(quase)</dt>
                <dd className="text-right font-mono">
                  {(e.params.winChance * 100).toFixed(0)}% ·{" "}
                  {(e.params.nearMissChance * 100).toFixed(0)}%
                </dd>
                <dt className="text-muted-foreground">Limite</dt>
                <dd className="text-right font-mono">
                  {e.params.roundLimit === 0 ? "—" : e.params.roundLimit}
                </dd>
                <dt className="text-muted-foreground">Bônus</dt>
                <dd className="text-right font-mono">R$ {e.params.bonusFraction.toFixed(2)}</dd>
                <dt className="text-muted-foreground">Líquido fictício</dt>
                <dd
                  className={`text-right font-mono ${
                    net >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  R$ {net.toFixed(2)}
                </dd>
              </dl>
            </article>
          );
        })}
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <section className="glass-panel p-5" aria-labelledby="chart-outcomes">
          <h3 id="chart-outcomes" className="mb-3 text-sm font-semibold">
            Distribuição de resultados por experimento
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={nearMissByExperiment}>
              <CartesianGrid stroke="oklch(1 0 0 / 0.08)" vertical={false} />
              <XAxis dataKey="label" stroke="oklch(0.78 0.02 245)" fontSize={11} />
              <YAxis stroke="oklch(0.78 0.02 245)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.22 0.04 250)",
                  border: "1px solid oklch(1 0 0 / 0.12)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="acertos" stackId="a" fill="oklch(0.78 0.17 145)" name="Acertos" />
              <Bar dataKey="quase" stackId="a" fill="oklch(0.85 0.17 92)" name="Quase" />
              <Bar dataKey="perdas" stackId="a" fill="oklch(0.7 0.2 25)" name="Perdas" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3">
            <AccessibleChartTable
              title="Distribuição de resultados por experimento"
              caption="Tabela equivalente ao gráfico acima."
              summary={`Resultados por experimento: ${nearMissByExperiment
                .map(
                  (d) =>
                    `${d.label} — acertos ${d.acertos}, quase ${d.quase}, perdas ${d.perdas}.`,
                )
                .join(" ")}`}
              columns={[
                { key: "label", label: "Experimento" },
                { key: "acertos", label: "Acertos", numeric: true, format: (v) => String(v) },
                { key: "quase", label: "Quase", numeric: true, format: (v) => String(v) },
                { key: "perdas", label: "Perdas", numeric: true, format: (v) => String(v) },
              ]}
              rows={nearMissByExperiment}
            />
          </div>
        </section>


        <section className="glass-panel p-5" aria-labelledby="chart-ledger">
          <h3 id="chart-ledger" className="mb-3 text-sm font-semibold">
            Eventos do ledger por tipo
          </h3>
          {ledgerTotals.length === 0 ? (
            <p className="rounded-md bg-glass p-4 text-center text-xs text-muted-foreground">
              Sem eventos ainda.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.22 0.04 250)",
                    border: "1px solid oklch(1 0 0 / 0.12)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Pie
                  data={ledgerTotals}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={45}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {ledgerTotals.map((d, i) => (
                    <Cell
                      key={i}
                      fill={
                        (ledgerColors as Record<string, string>)[d.type] ??
                        "oklch(0.55 0.04 250)"
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-3">
            <AccessibleChartTable
              title="Eventos do ledger por tipo"
              caption="Tabela equivalente ao gráfico de pizza."
              summary={`Total de tipos: ${ledgerTotals.length}. ${ledgerTotals
                .map((d) => `${d.type}: ${d.count}`)
                .join(", ")}.`}
              columns={[
                { key: "type", label: "Tipo" },
                { key: "count", label: "Eventos", numeric: true, format: (v) => String(v) },
              ]}
              rows={ledgerTotals}
            />
          </div>
        </section>

      </div>

      <section className="glass-panel mb-8 p-5" aria-labelledby="interp">
        <h2 id="interp" className="mb-3 text-sm font-semibold">
          Interpretação
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>· Saldo visual alto pode aumentar percepção de disponibilidade.</li>
          <li>· Bônus fracionado pode criar saldo residual.</li>
          <li>· Saque parcial bloqueado reduz controle granular do usuário.</li>
          <li>· Quase acerto pode reforçar repetição.</li>
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass-panel p-5" aria-labelledby="withdraw-h">
          <h2 id="withdraw-h" className="mb-2 text-sm font-semibold">
            Tentar saque fictício
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Esta ação dispara as regras simuladas de fricção. Nada sai do sistema.
          </p>
          <button
            type="button"
            onClick={tryWithdraw}
            className="rounded-lg bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Solicitar saque (simulado)
          </button>

          {alerts && (
            <div className="mt-4 space-y-2" role="status">
              {alerts.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Nenhuma fricção detectada.
                </div>
              ) : (
                alerts.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-foreground"
                  >
                    <AlertTriangle
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger"
                      aria-hidden="true"
                    />
                    {a}
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        <section className="glass-panel p-5" aria-labelledby="friction-log">
          <h2 id="friction-log" className="mb-2 text-sm font-semibold">
            Histórico de fricções ({frictions.length})
          </h2>
          {frictions.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nenhuma fricção registrada. Tente solicitar um saque para gerar exemplos.
            </p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-auto pr-1 text-xs">
              {frictions.map((f) => (
                <li
                  key={f.id}
                  className="rounded-md border border-border bg-panel-soft/60 p-2"
                >
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {new Date(f.timestamp).toLocaleString("pt-BR")}
                  </div>
                  <div className="mt-1 text-foreground">{f.message}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
