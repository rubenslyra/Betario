import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FakeBalanceCard } from "@/components/FakeBalanceCard";
import { ArrowRight } from "lucide-react";
import { Pera, Maca, Xicara, CafeBean } from "@/components/illustrations/FoodSymbols";
import type { ReactNode } from "react";

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

function SymbolsArt() {
  return (
    <div className="flex items-end gap-1">
      <div className="scale-90"><Pera /></div>
      <div className="-mt-2 scale-110"><Maca /></div>
      <div className="scale-90"><CafeBean /></div>
    </div>
  );
}

function CoffeeArt() {
  return (
    <div className="scale-125"><Xicara /></div>
  );
}

function JarArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" aria-label="Pote">
      <rect x="14" y="8" width="36" height="6" rx="2" fill="#8aa8c8" opacity="0.6" />
      <path d="M16 16 h32 v36 q0 4 -4 4 h-24 q-4 0 -4 -4z" fill="oklch(0.95 0.02 200 / 0.3)" stroke="#aac3d8" strokeWidth="1.5" />
      <rect x="20" y="36" width="24" height="18" rx="2" fill="oklch(0.78 0.17 145 / 0.5)" />
      <circle cx="24" cy="40" r="2" fill="#5fbedc" />
      <circle cx="32" cy="44" r="2" fill="#c9a84c" />
      <circle cx="40" cy="42" r="2" fill="#e63946" />
    </svg>
  );
}

const cards: Array<{
  to: "/experiments/symbols" | "/experiments/coffee" | "/experiments/capacity";
  title: string;
  desc: string;
  accent: string;
  art: ReactNode;
}> = [
  {
    to: "/experiments/symbols",
    title: "Giro dos símbolos",
    desc: "Frutas, pão, ovo, xícara e grão de café — entenda probabilidade e quase acerto.",
    accent: "from-primary/30 to-primary/5",
    art: <SymbolsArt />,
  },
  {
    to: "/experiments/coffee",
    title: "Medida do café",
    desc: "Veja a jarra derramar e o café subir na xícara — previsão vs. realidade.",
    accent: "from-amber/30 to-amber/5",
    art: <CoffeeArt />,
  },
  {
    to: "/experiments/capacity",
    title: "Quantos cabem?",
    desc: "Objetos coloridos caem no pote de vidro — estime o volume final.",
    accent: "from-success/25 to-success/5",
    art: <JarArt />,
  },
];

function ExperimentsIndex() {
  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Selecione um experimento</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Cada experimento usa saldo fictício, ilustrações educativas e registra todos os eventos no
            ledger.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="group glass-panel relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${c.accent} opacity-30 transition group-hover:opacity-100`}
                />
                <div className="mb-3 flex items-center justify-between">
                  {c.art}
                  <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                </div>
                <h3 className="mb-1 text-lg font-semibold">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
        <FakeBalanceCard />
      </div>
    </AppShell>
  );
}
