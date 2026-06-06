import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Scale, Heart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/sources")({
  head: () => ({ meta: [{ title: "Fontes e alertas · BET-RAY Lab" }] }),
  component: SourcesPage,
});

const sections = [
  {
    icon: Scale,
    title: "Brasil",
    color: "text-primary",
    items: [
      "Lei nº 13.756/2018 — regulamento original das apostas.",
      "Lei nº 14.790/2023 — quota fixa, autorização e fiscalização.",
      "Secretaria de Prêmios e Apostas (SPA/MF).",
      "Portaria SPA/MF nº 1.231/2024.",
      "Diretrizes brasileiras de jogo responsável.",
    ],
  },
  {
    icon: Heart,
    title: "Saúde pública",
    color: "text-success",
    items: [
      "Organização Mundial da Saúde — transtorno do jogo.",
      "Lancet Public Health Commission on Gambling.",
      "Danos financeiros, emocionais, familiares e sociais documentados.",
    ],
  },
  {
    icon: Sparkles,
    title: "Design persuasivo",
    color: "text-gold",
    items: [
      "Casos envolvendo responsabilidade por design digital.",
      "Falha de aviso em produtos de repetição e recompensa.",
      "Mecanismos de retenção em plataformas com sistemas de pontuação.",
    ],
  },
];

function SourcesPage() {
  return (
    <AppShell>
      <h1 className="mb-1 text-3xl font-bold">Fontes e alertas</h1>
      <p className="mb-8 max-w-3xl text-sm text-muted-foreground">
        Este projeto usa referências legais e científicas para fins
        educacionais. Ele não compara diretamente todas as plataformas digitais
        a bets, mas discute riscos comuns de design persuasivo, repetição e
        falta de alerta.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="glass-panel p-5">
              <div className="mb-3 flex items-center gap-2">
                <Icon className={`h-4 w-4 ${s.color}`} />
                <h2 className="text-sm font-semibold">{s.title}</h2>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {s.items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <span className={s.color}>·</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="glass-panel mt-8 p-5 text-xs leading-relaxed text-muted-foreground">
        BET-RAY Lab é uma aplicação educacional do projeto{" "}
        <span className="font-semibold text-foreground">@assincronamente</span>.
        Não é bet, não aceita dinheiro real, não simula ganhos reais e não
        recomenda apostas.
      </div>
    </AppShell>
  );
}
