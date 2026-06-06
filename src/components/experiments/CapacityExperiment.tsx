import { useState } from "react";
import { useLab } from "@/lib/lab-store";
import { CharacterReaction } from "@/components/CharacterReaction";
import { ExperimentControls } from "@/components/ExperimentControls";
import { ExperimentCharts } from "@/components/ExperimentCharts";

const OPTIONS = [
  { label: "25%", value: 25 },
  { label: "Metade", value: 50 },
  { label: "Quase cheio", value: 85 },
  { label: "Transbordar", value: 110 },
];

export function CapacityExperiment() {
  const [guess, setGuess] = useState<number | null>(null);
  const [actual, setActual] = useState<number | null>(null);
  const [filling, setFilling] = useState(false);
  const [cat, setCat] = useState<"loss" | "near-miss" | "win" | null>(null);
  const registerBet = useLab((s) => s.registerBet);
  const registerResult = useLab((s) => s.registerResult);
  const rollOutcome = useLab((s) => s.rollOutcome);

  const fill = (g: number) => {
    setGuess(g);
    setFilling(true);
    setActual(null);
    setCat(null);
    registerBet(1, "capacity");
    setTimeout(() => {
      const outcome = rollOutcome("capacity");
      let a: number;
      if (outcome === "win") a = g + Math.floor(Math.random() * 8 - 4);
      else if (outcome === "near-miss")
        a = g + (Math.random() < 0.5 ? -1 : 1) * (10 + Math.floor(Math.random() * 8));
      else a = Math.floor(Math.random() * 120);
      a = Math.max(0, a);
      setActual(a);
      setCat(outcome);
      setFilling(false);
      registerResult("capacity", outcome, outcome === "win" ? 5 : 0);
    }, 1500);
  };

  const messages = {
    loss: "A percepção visual pode superestimar ou subestimar quantidades.",
    "near-miss": "Erro de estimativa é comum quando volume e aleatoriedade se misturam.",
    win: "Interfaces podem transformar incerteza em sensação de escolha.",
  };

  const fillHeight = filling ? "70%" : actual !== null ? `${Math.min(actual, 105)}%` : "0%";
  const diff = guess !== null && actual !== null ? Math.abs(guess - actual) : null;

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6" aria-labelledby="capacity-heading">
        <h2 id="capacity-heading" className="mb-1 text-lg font-semibold">
          Quantos cabem?
        </h2>
        <p className="mb-6 text-xs text-muted-foreground">
          Aposta fictícia de R$1,00. Estime quanto cabe no pote.
        </p>

        <div
          className="mx-auto mb-6 flex h-64 items-end justify-center rounded-2xl bg-background/60 p-6 ring-1 ring-border"
          aria-label="Pote do experimento"
          aria-live="polite"
        >
          <div className="relative h-full w-32 overflow-hidden rounded-2xl border-2 border-foreground/20 bg-glass">
            <div
              className="absolute bottom-0 w-full transition-all duration-[1400ms]"
              style={{
                height: fillHeight,
                backgroundImage:
                  "radial-gradient(circle at 20% 30%, oklch(0.78 0.16 75) 3px, transparent 4px), radial-gradient(circle at 70% 60%, oklch(0.85 0.17 92) 3px, transparent 4px), radial-gradient(circle at 50% 80%, oklch(0.72 0.16 235) 3px, transparent 4px)",
                backgroundSize: "16px 16px",
                backgroundColor: "oklch(0.35 0.05 250)",
              }}
            />
          </div>
        </div>

        <fieldset className="mb-5">
          <legend className="sr-only">Escolha a capacidade estimada</legend>
          <div className="grid grid-cols-4 gap-2">
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => fill(o.value)}
                disabled={filling}
                aria-pressed={guess === o.value}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  guess === o.value
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-glass text-muted-foreground hover:text-foreground"
                } disabled:opacity-50`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>

        {actual !== null && cat && (
          <div role="status">
            <div className="mb-3 rounded-lg bg-panel-soft/60 p-3 text-center font-mono text-sm">
              Previsão: <span className="text-primary">{guess}%</span> · Real:{" "}
              <span className="text-gold">{actual}%</span> · Erro: {diff}%
            </div>
            <CharacterReaction
              mood={cat === "win" ? "happy" : cat === "near-miss" ? "relieved" : "sad"}
              message={messages[cat]}
            />
          </div>
        )}
      </section>

      <ExperimentControls experiment="capacity" />
      <ExperimentCharts experiment="capacity" />
    </div>
  );
}
