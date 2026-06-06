import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ArrowRight, Beaker, BookOpen, FlaskConical } from "lucide-react";

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

function Home() {
  return (
    <AppShell>
      <section className="relative overflow-hidden rounded-3xl border border-border bg-panel/40 px-6 py-16 sm:px-12 sm:py-24">
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
            <span className="text-3xl font-light text-muted-foreground sm:text-4xl">
              Lab
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Um laboratório educacional para enxergar a matemática, a UX e os
            riscos por trás das apostas digitais.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground/80">
            Explore três experimentos visuais com saldo fictício, bônus
            simulado e ledger educacional. O objetivo é entender como
            probabilidade, recompensa, interface e regras de saldo podem
            influenciar percepção e comportamento.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/experiments"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-background shadow-lg shadow-primary/30 transition hover:opacity-90"
            >
              <FlaskConical className="h-4 w-4" />
              Entrar no laboratório
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/sources"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-glass px-6 py-3 font-medium text-foreground transition hover:bg-panel-soft"
            >
              <BookOpen className="h-4 w-4" />
              Ver fontes e alertas
            </Link>
          </div>
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
