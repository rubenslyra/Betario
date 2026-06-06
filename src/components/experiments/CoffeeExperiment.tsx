import { useState } from "react";
import { useLab } from "@/lib/lab-store";
import { CharacterReaction } from "@/components/CharacterReaction";
import { ExperimentControls } from "@/components/ExperimentControls";
import { ExperimentCharts } from "@/components/ExperimentCharts";

const OPTIONS = [
  { label: "25%", value: 25 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "100%", value: 100 },
  { label: "Transbordar", value: 120 },
];

export function CoffeeExperiment() {
  const [guess, setGuess] = useState<number | null>(null);
  const [actual, setActual] = useState<number | null>(null);
  const [pouring, setPouring] = useState(false);
  const [cat, setCat] = useState<"loss" | "near-miss" | "win" | null>(null);
  const registerBet = useLab((s) => s.registerBet);
  const registerResult = useLab((s) => s.registerResult);
  const rollOutcome = useLab((s) => s.rollOutcome);

  const pour = (g: number) => {
    setGuess(g);
    setPouring(true);
    setActual(null);
    setCat(null);
    registerBet(1, "coffee");
    setTimeout(() => {
      const outcome = rollOutcome("coffee");
      let a: number;
      if (outcome === "win") a = g + Math.floor(Math.random() * 6 - 3);
      else if (outcome === "near-miss") a = g + (Math.random() < 0.5 ? -1 : 1) * (8 + Math.floor(Math.random() * 6));
      else a = Math.floor(Math.random() * 130);
      a = Math.max(0, a);
      setActual(a);
      setCat(outcome);
      setPouring(false);
      registerResult("coffee", outcome, outcome === "win" ? 5 : 0);
    }, 1500);
  };

  const messages = {
    loss: "Previsões visuais parecem fáceis, mas pequenas variações mudam o resultado.",
    "near-miss": "A percepção de controle pode ser maior do que o controle real.",
    win: "Quando o sistema parece simples, o usuário tende a confiar mais.",
  };

  const fillHeight = pouring ? "80%" : actual !== null ? `${Math.min(actual, 110)}%` : "0%";
  const diff = guess !== null && actual !== null ? Math.abs(guess - actual) : null;

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6" aria-labelledby="coffee-heading">
        <h2 id="coffee-heading" className="mb-1 text-lg font-semibold">
          Medida do café
        </h2>
        <p className="mb-6 text-xs text-muted-foreground">
          Aposta fictícia de R$1,00. Preveja o volume servido.
        </p>

        <div
          className="mx-auto mb-6 flex h-64 items-end justify-center rounded-2xl bg-background/60 p-6 ring-1 ring-border"
          aria-label="Recipiente do experimento"
          aria-live="polite"
        >
          <div className="relative h-full w-24 overflow-hidden rounded-b-3xl rounded-t-md border-2 border-foreground/20 bg-glass">
            <div
              className="absolute bottom-0 w-full transition-all duration-[1400ms]"
              style={{ height: fillHeight, backgroundColor: "oklch(0.45 0.1 60)" }}
            />
            {[25, 50, 75, 100].map((m) => (
              <div
                key={m}
                className="absolute left-0 right-0 border-t border-foreground/20 text-[9px] text-muted-foreground"
                style={{ bottom: `${m}%` }}
              >
                <span className="ml-1">{m}%</span>
              </div>
            ))}
          </div>
        </div>

        <fieldset className="mb-5">
          <legend className="sr-only">Escolha o volume previsto</legend>
          <div className="grid grid-cols-5 gap-2">
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => pour(o.value)}
                disabled={pouring}
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

      <ExperimentControls experiment="coffee" />
      <ExperimentCharts experiment="coffee" />
    </div>
  );
}
