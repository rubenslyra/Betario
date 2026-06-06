import { useState } from "react";
import { useLab } from "@/lib/lab-store";
import { CharacterReaction } from "@/components/CharacterReaction";

const SYMBOLS = ["🍐", "🍎", "🥚", "☕", "🍞", "🫘"];

type Phase = "idle" | "spinning" | "result";

export function SymbolsExperiment() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [reels, setReels] = useState<string[]>(["🍐", "🍎", "🥚"]);
  const [category, setCategory] = useState<"loss" | "near-miss" | "win" | null>(null);
  const registerBet = useLab((s) => s.registerBet);
  const registerResult = useLab((s) => s.registerResult);

  const spin = () => {
    registerBet(1);
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
      const final = [0, 1, 2].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
      setReels(final);
      const unique = new Set(final).size;
      let cat: "loss" | "near-miss" | "win";
      let payout = 0;
      if (unique === 1) {
        cat = "win";
        payout = 3;
      } else if (unique === 2) {
        cat = "near-miss";
      } else {
        cat = "loss";
      }
      setCategory(cat);
      setPhase("result");
      registerResult(cat === "win" ? "win" : cat === "near-miss" ? "loss" : "loss", payout);
    }, 1800);
  };

  const messages = {
    loss: "Resultados isolados podem parecer pessoais, mas fazem parte da distribuição.",
    "near-miss":
      "Dois símbolos iguais parecem proximidade, mas não mudam a expectativa matemática.",
    win: "Ganhos podem acontecer no curto prazo, mas não explicam o sistema no longo prazo.",
  };

  return (
    <div className="glass-panel p-6">
      <h2 className="mb-1 text-lg font-semibold">Giro dos símbolos</h2>
      <p className="mb-6 text-xs text-muted-foreground">
        Aposta fictícia de R$1,00 por giro. Resultado demonstrativo.
      </p>

      <div className="mx-auto mb-6 flex justify-center gap-3 rounded-2xl bg-background/60 p-6 ring-1 ring-border">
        {reels.map((s, i) => (
          <div
            key={i}
            className={`flex h-24 w-20 items-center justify-center rounded-xl border border-border bg-panel-soft text-5xl shadow-inner transition ${
              phase === "spinning" ? "animate-pulse" : ""
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      <button
        onClick={spin}
        disabled={phase === "spinning"}
        className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 font-semibold text-background shadow-lg shadow-primary/30 transition hover:opacity-90 disabled:opacity-50"
      >
        {phase === "spinning" ? "Girando…" : "Girar (simulação)"}
      </button>

      {phase === "result" && category && (
        <div className="mt-5">
          <CharacterReaction
            mood={category === "win" ? "happy" : category === "near-miss" ? "relieved" : "sad"}
            message={messages[category]}
          />
        </div>
      )}
    </div>
  );
}
