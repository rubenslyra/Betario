import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FakeBalanceCard } from "@/components/FakeBalanceCard";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/experiments/")({
  head: () => ({
    meta: [
      { title: "Experimentos · BET-RAY Lab" },
      {
        name: "description",
        content: "Três experimentos visuais para estudar probabilidade e percepção.",
      },
    ],
  }),
  component: ExperimentsIndex,
});

const cards = [
  {
    to: "/experiments/symbols",
    title: "Giro dos símbolos",
    desc: "Entenda quase acerto, probabilidade visual e reforço emocional.",
    accent: "from-primary/30 to-primary/5",
  },
  {
    to: "/experiments/coffee",
    title: "Medida do café",
    desc: "Veja como previsão, volume e percepção podem enganar.",
    accent: "from-amber/30 to-amber/5",
  },
  {
    to: "/experiments/capacity",
    title: "Quantos cabem?",
    desc: "Explore estimativa visual, volume e margem de erro.",
    accent: "from-success/25 to-success/5",
  },
] as const;

function ExperimentsIndex() {
  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Selecione um experimento</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Cada experimento usa saldo fictício e registra todos os eventos no
            ledger educacional.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="group glass-panel relative overflow-hidden p-6 transition hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${c.accent} opacity-0 transition group-hover:opacity-100`}
                />
                <h3 className="mb-2 text-lg font-semibold">{c.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{c.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  Abrir experimento
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
        <FakeBalanceCard />
      </div>
    </AppShell>
  );
}
