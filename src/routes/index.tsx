import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ArrowRight, Beaker, BookOpen, FlaskConical, Lock, LogIn, Gamepad2 } from "lucide-react";
import { useLab } from "@/lib/lab-store";
import { useState } from "react";
import { AuthScreen } from "@/components/AuthScreen";
import { Pera, Maca, CafeBean, Xicara } from "@/components/illustrations/FoodSymbols";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BET-RAY Lab — Laboratório educacional" },
      {
        name: "description",
        content:
          "Laboratório educacional sobre probabilidade, UX persuasiva e risco digital. Sem apostas reais.",
      },
    ],
  }),
  component: Home,
});

const games = [
  {
    slug: "symbols" as const,
    title: "Giro dos símbolos",
    desc: "Frutas, pão, ovo, xícara e grão de café — entenda probabilidade e quase acerto.",
    accent: "from-primary/20 to-primary/5 border-primary/20",
    ghost: "from-primary/40 to-primary/10",
    art: (
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
    ),
  },
  {
    slug: "coffee" as const,
    title: "Medida do café",
    desc: "Veja a jarra derramar e o café subir na xícara — previsão vs. realidade.",
    accent: "from-amber/20 to-amber/5 border-amber/20",
    ghost: "from-amber/40 to-amber/10",
    art: (
      <div className="scale-125">
        <Xicara />
      </div>
    ),
  },
  {
    slug: "capacity" as const,
    title: "Desafio do Pote",
    desc: "Bolinhas de gude calibradas mostram capacidade, erro e transbordamento.",
    accent: "from-success/20 to-success/5 border-success/20",
    ghost: "from-success/40 to-success/10",
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
  },
];

function GameCard({ game }: { game: (typeof games)[number] }) {
  const currentUser = useLab((s) => s.currentUser);
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return (
      <div className="glass-panel relative overflow-hidden border-2 border-primary/40 p-6">
        <AuthScreen onDone={() => setShowAuth(false)} />
      </div>
    );
  }

  const content = (
    <div
      className={`group glass-panel relative overflow-hidden border p-6 transition hover:-translate-y-1 hover:shadow-2xl ${game.accent}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${game.ghost} opacity-0 transition group-hover:opacity-100`}
      />
      <div className="mb-3 flex items-center justify-between">
        {game.art}
        {currentUser ? (
          <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <h3 className="mb-1 text-lg font-semibold">{game.title}</h3>
      <p className="text-sm text-muted-foreground">{game.desc}</p>
      {!currentUser && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          Faça login para jogar
        </div>
      )}
    </div>
  );

  if (!currentUser) {
    return (
      <button type="button" onClick={() => setShowAuth(true)} className="w-full text-left">
        {content}
      </button>
    );
  }

  return (
    <Link to={`/experiments/${game.slug}`} className="block">
      {content}
    </Link>
  );
}

function Home() {
  return (
    <AppShell>
      <section className="relative overflow-hidden rounded-3xl border border-border bg-panel/40 px-6 py-12 sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, oklch(0.72 0.16 235 / 0.4), transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.85 0.17 92 / 0.25), transparent 45%)",
          }}
        />
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-glass px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">
            <Beaker className="h-3 w-3 text-gold" />
            @assincronamente · v1
          </div>
          <h1 className="font-mono text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
            BET-<span className="gold-text">RAY</span>
            <br />
            <span className="text-3xl font-light text-muted-foreground sm:text-4xl">Lab</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Um laboratório educacional para enxergar a matemática, a UX e os riscos por trás das
            apostas digitais.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground/80">
            Explore três experimentos visuais com saldo fictício, bônus simulado e ledger
            educacional. O objetivo é entender como probabilidade, recompensa, interface e regras de
            saldo podem influenciar percepção e comportamento.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6 flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Experimentos</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {games.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Saldo fictício",
            text: "Separação visual entre depositado, bônus, sacável e bloqueado.",
          },
          {
            title: "Ledger educacional",
            text: "Cada evento registrado como livro-razão auditável e didático.",
          },
          {
            title: "Relatório crítico",
            text: "Métricas comportamentais, fricções e interpretação ética.",
          },
        ].map((c) => (
          <div key={c.title} className="glass-panel p-5">
            <h3 className="mb-1 text-sm font-semibold text-gold">{c.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{c.text}</p>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
