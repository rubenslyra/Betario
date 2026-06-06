import { useState } from "react";
import { useLab } from "@/lib/lab-store";
import { CharacterReaction } from "@/components/CharacterReaction";
import { ExperimentControls } from "@/components/ExperimentControls";
import { ExperimentCharts } from "@/components/ExperimentCharts";

const SYMBOLS = ["🍐", "🍎", "🥚", "☕", "🍞", "🫘"];
type Phase = "idle" | "spinning" | "result";

export function SymbolsExperiment() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [reels, setReels] = useState<string[]>(["🍐", "🍎", "🥚"]);
  const [category, setCategory] = useState<"loss" | "near-miss" | "win" | null>(null);
  const registerBet = useLab((s) => s.registerBet);
  const registerResult = useLab((s) => s.registerResult);
  const rollOutcome = useLab((s) => s.rollOutcome);

  const spin = () => {
    registerBet(1, "symbols");
    setPhase("spinning");
    setCategory(null);

    const tickers = [0, 1, 2].map((i) =>
      setInterval(() => {
        setReels((prev) => {
          const next = [...prev];
          next[i] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          return next;
        });
      }, 80),
    );

    setTimeout(() => {
      tickers.forEach(clearInterval);
      const cat = rollOutcome("symbols");
      let final: string[];
      if (cat === "win") {
        const s = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        final = [s, s, s];
      } else if (cat === "near-miss") {
        const s = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const other = SYMBOLS.filter((x) => x !== s)[Math.floor(Math.random() * (SYMBOLS.length - 1))];
        final = [s, s, other];
      } else {
        final = [0, 1, 2].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
        if (new Set(final).size < 3) final[2] = SYMBOLS[(SYMBOLS.indexOf(final[2]) + 1) % SYMBOLS.length];
      }
      setReels(final);
      const payout = cat === "win" ? 5 : 0;
      setCategory(cat);
      setPhase("result");
      registerResult("symbols", cat, payout);
    }, 1500);
  };

  const messages = {
    loss: "Resultados isolados podem parecer pessoais, mas fazem parte da distribuição.",
    "near-miss":
      "Dois símbolos iguais parecem proximidade, mas não mudam a expectativa matemática.",
    win: "Ganhos podem acontecer no curto prazo, mas não explicam o sistema no longo prazo.",
  };

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6" aria-labelledby="symbols-heading">
        <h2 id="symbols-heading" className="mb-1 text-lg font-semibold">
          Giro dos símbolos
        </h2>
        <p className="mb-6 text-xs text-muted-foreground">
          Aposta fictícia de R$1,00 por giro. Resultado demonstrativo.
        </p>

        <div
          className="mx-auto mb-6 flex justify-center gap-3 rounded-2xl bg-background/60 p-6 ring-1 ring-border"
          role="group"
          aria-label="Rolos de símbolos"
          aria-live="polite"
        >
          {reels.map((s, i) => (
            <div
              key={i}
              className={`flex h-24 w-20 items-center justify-center rounded-xl border border-border bg-panel-soft text-5xl shadow-inner transition ${
                phase === "spinning" ? "animate-pulse" : ""
              }`}
              aria-label={`Rolo ${i + 1}: ${s}`}
            >
              {s}
            </div>
          ))}
        </div>

        <button
          onClick={spin}
          disabled={phase === "spinning"}
          aria-busy={phase === "spinning"}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 font-semibold text-background shadow-lg shadow-primary/30 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
        >
          {phase === "spinning" ? "Girando…" : "Girar (simulação)"}
        </button>

        {phase === "result" && category && (
          <div className="mt-5" role="status">
            <CharacterReaction
              mood={category === "win" ? "happy" : category === "near-miss" ? "relieved" : "sad"}
              message={messages[category]}
            />
          </div>
        )}
      </section>

      <ExperimentControls experiment="symbols" />
      <ExperimentCharts experiment="symbols" />
    </div>
  );
}
