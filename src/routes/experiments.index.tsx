import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FakeBalanceCard } from "@/components/FakeBalanceCard";
import { ArrowRight } from "lucide-react";
import { Pera, Maca, Xicara, CafeBean } from "@/components/illustrations/FoodSymbols";
import { useLab } from "@/lib/lab-store";
import { useEffect } from "react";
import type { ReactNode } from "react";

function Guard({ children }: { children: React.ReactNode }) {
  const user = useLab((s) => s.currentUser);
  const router = useRouter();
  useEffect(() => {
    if (!user) router.navigate({ to: "/" });
  }, [user, router]);
  if (!user) return null;
  return <>{children}</>;
}

export const Route = createFileRoute("/experiments/")({
  head: () => ({
    meta: [
      { title: "Experimentos · Betario" },
      {
        name: "description",
        content: "Três experimentos visuais para estudar probabilidade e percepção.",
      },
    ],
  }),
  component: () => (
    <Guard>
      <ExperimentsIndex />
    </Guard>
  ),
});

function SymbolsArt() {
  return (
    <div className="flex items-end gap-1">
      <div className="scale-90">
        <Pera />
      </div>
      <div className="-mt-2 scale-110">
        <Maca />
      </div>
      <div className="scale-90">
        <CafeBean />
      </div>
    </div>
  );
}

function CoffeeArt() {
  return (
    <div className="flex items-end gap-1">
      <div className="scale-90">
        <CafeBean />
      </div>
      <div className="-ml-1 scale-110">
        <Xicara />
      </div>
      <div className="scale-90">
        <Maca />
      </div>
    </div>
  );
}

function Card({
  to,
  accent,
  art,
  title,
  desc,
}: {
  to: string;
  accent: string;
  art: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group glass-panel relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-2xl"
    >
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-br ${accent} opacity-30 transition group-hover:opacity-100`}
      />
      <div className="mb-3 flex items-center justify-between">
        {art}
        <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
      </div>
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}

const cards: {
  to: string;
  accent: string;
  art: ReactNode;
  title: string;
  desc: string;
}[] = [
  {
    to: "/experiments/symbols",
    accent: "from-primary/20 to-primary/5",
    art: <SymbolsArt />,
    title: "Giro dos símbolos",
    desc: "Frutas, pão, ovo, xícara e grão de café — entenda probabilidade e quase acerto.",
  },
  {
    to: "/experiments/coffee",
    accent: "from-amber/20 to-amber/5",
    art: <CoffeeArt />,
    title: "Medida do café",
    desc: "Veja a jarra derramar e o café subir na xícara — previsão vs. realidade.",
  },
  {
    to: "/experiments/capacity",
    accent: "from-success/20 to-success/5",
    art: (
      <svg viewBox="0 0 64 64" className="h-14 w-14" aria-label="Pote">
        <rect x="14" y="8" width="36" height="6" rx="2" fill="#8aa8c8" opacity="0.6" />
        <path
          d="M16 16 h32 v36 q0 4 -4 4 h-24 q-4 0 -4 -4z"
          fill="oklch(0.95 0.02 200 / 0.3)"
          stroke="#aac3d8"
          strokeWidth="1.5"
        />
        <rect x="20" y="36" width="24" height="18" rx="2" fill="oklch(0.78 0.17 145 / 0.5)" />
        <circle cx="24" cy="40" r="2" fill="#5fbedc" />
        <circle cx="32" cy="44" r="2" fill="#c9a84c" />
        <circle cx="40" cy="42" r="2" fill="#e63946" />
      </svg>
    ),
    title: "Desafio do Pote",
    desc: "Bolinhas de gude calibradas mostram capacidade, erro e transbordamento.",
  },
];

function ExperimentsIndex() {
  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Selecione um experimento</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Cada experimento usa saldo fictício, ilustrações educativas e registra todos os eventos
            no ledger.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((c) => (
              <Card key={c.to} {...c} />
            ))}
          </div>
        </div>
        <FakeBalanceCard />
      </div>
    </AppShell>
  );
}
