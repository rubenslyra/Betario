import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ExperimentKey } from "@/lib/lab-store";
import { useLab, experimentLabels } from "@/lib/lab-store";
import { useMemo } from "react";

const palette = {
  win: "oklch(0.78 0.17 145)",
  near: "oklch(0.85 0.17 92)",
  loss: "oklch(0.7 0.2 25)",
  primary: "oklch(0.72 0.16 235)",
};

export function ExperimentCharts({ experiment }: { experiment: ExperimentKey }) {
  const exp = useLab((s) => s.experiments[experiment]);
  const events = useLab((s) => s.events.filter((e) => e.experiment === experiment));

  const expectedVsObserved = useMemo(() => {
    const rounds = Math.max(1, exp.stats.rounds);
    const p = exp.params;
    return [
      {
        label: "Acertos",
        expected: p.winChance * 100,
        observed: (exp.stats.wins / rounds) * 100,
      },
      {
        label: "Quase",
        expected: p.nearMissChance * 100,
        observed: (exp.stats.nearMisses / rounds) * 100,
      },
      {
        label: "Perdas",
        expected: (1 - p.winChance - p.nearMissChance) * 100,
        observed: (exp.stats.losses / rounds) * 100,
      },
    ];
  }, [exp]);

  const cumulative = useMemo(() => {
    // chronological
    const results = events
      .filter((e) => e.type === "RESULTADO_SIMULADO")
      .slice()
      .reverse();
    let bet = 0;
    let payout = 0;
    let near = 0;
    return results.map((e, i) => {
      const cat = e.note.match(/\((loss|near-miss|win)\)/)?.[1];
      bet += 1; // each result preceded by a 1-real bet
      payout += e.amount;
      if (cat === "near-miss") near += 1;
      return {
        round: i + 1,
        nearCumulative: near,
        netResult: Number((payout - bet).toFixed(2)),
      };
    });
  }, [events]);

  const empty = exp.stats.rounds === 0;

  return (
    <section
      aria-labelledby={`charts-${experiment}`}
      className="glass-panel space-y-6 p-5"
    >
      <header>
        <h3 id={`charts-${experiment}`} className="text-sm font-semibold">
          Visualização — {experimentLabels[experiment]}
        </h3>
        <p className="text-[11px] text-muted-foreground">
          {exp.stats.rounds} rodada(s) registrada(s).
        </p>
      </header>

      {empty ? (
        <p className="rounded-md bg-glass p-4 text-center text-xs text-muted-foreground">
          Jogue algumas rodadas para gerar dados.
        </p>
      ) : (
        <>
          <div>
            <h4 className="mb-2 text-xs font-medium text-muted-foreground">
              Frequência esperada vs observada (%)
            </h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={expectedVsObserved}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.08)" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="oklch(0.75 0.02 245)"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="oklch(0.75 0.02 245)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.22 0.04 250)",
                    border: "1px solid oklch(1 0 0 / 0.12)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="expected" name="Esperado" fill={palette.primary} radius={4} />
                <Bar dataKey="observed" name="Observado" radius={4}>
                  {expectedVsObserved.map((d, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? palette.win : i === 1 ? palette.near : palette.loss}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-medium text-muted-foreground">
              Acúmulo de quase acertos e resultado líquido (R$)
            </h4>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={cumulative}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.08)" vertical={false} />
                <XAxis
                  dataKey="round"
                  stroke="oklch(0.75 0.02 245)"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="oklch(0.75 0.02 245)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.22 0.04 250)",
                    border: "1px solid oklch(1 0 0 / 0.12)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="nearCumulative"
                  name="Quase acertos"
                  stroke={palette.near}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="netResult"
                  name="Resultado líquido fictício"
                  stroke={palette.primary}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <dl className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-md bg-glass p-2">
              <dt className="text-[10px] uppercase text-muted-foreground">Apostado</dt>
              <dd className="font-mono text-foreground">R$ {exp.stats.totalBet.toFixed(2)}</dd>
            </div>
            <div className="rounded-md bg-glass p-2">
              <dt className="text-[10px] uppercase text-muted-foreground">Recebido</dt>
              <dd className="font-mono text-foreground">R$ {exp.stats.totalPayout.toFixed(2)}</dd>
            </div>
            <div className="rounded-md bg-glass p-2">
              <dt className="text-[10px] uppercase text-muted-foreground">Líquido</dt>
              <dd
                className={`font-mono ${
                  exp.stats.totalPayout - exp.stats.totalBet >= 0 ? "text-success" : "text-danger"
                }`}
              >
                R$ {(exp.stats.totalPayout - exp.stats.totalBet).toFixed(2)}
              </dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}
