import { useState } from "react";
import { useLab } from "@/lib/lab-store";
import { CharacterReaction } from "@/components/CharacterReaction";

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
  const registerBet = useLab((s) => s.registerBet);
  const registerResult = useLab((s) => s.registerResult);

  const pour = (g: number) => {
    setGuess(g);
    setPouring(true);
    setActual(null);
    registerBet(1);
    setTimeout(() => {
      const a = Math.floor(Math.random() * 130);
      setActual(a);
      setPouring(false);
      const diff = Math.abs(g - a);
      let cat: "loss" | "near-miss" | "win" = "loss";
      let payout = 0;
      if (diff <= 5) {
        cat = "win";
        payout = 3;
      } else if (diff <= 15) cat = "near-miss";
      registerResult(cat === "win" ? "win" : cat === "near-miss" ? "loss" : "loss", payout);
    }, 1800);
  };

  const diff = guess !== null && actual !== null ? Math.abs(guess - actual) : null;
  const cat = diff === null ? null : diff <= 5 ? "win" : diff <= 15 ? "near-miss" : "loss";
  const messages = {
    loss: "Previsões visuais parecem fáceis, mas pequenas variações mudam o resultado.",
    "near-miss": "A percepção de controle pode ser maior do que o controle real.",
    win: "Quando o sistema parece simples, o usuário tende a confiar mais.",
  };

  const fillHeight = pouring ? "80%" : actual !== null ? `${Math.min(actual, 110)}%` : "0%";

  return (
    <div className="glass-panel p-6">
      <h2 className="mb-1 text-lg font-semibold">Medida do café</h2>
      <p className="mb-6 text-xs text-muted-foreground">
        Aposta fictícia de R$1,00. Preveja o volume servido.
      </p>

      <div className="mx-auto mb-6 flex h-64 items-end justify-center rounded-2xl bg-background/60 p-6 ring-1 ring-border">
        <div className="relative h-full w-24 overflow-hidden rounded-b-3xl rounded-t-md border-2 border-foreground/20 bg-glass">
          <div
            className="absolute bottom-0 w-full bg-gradient-to-t from-amber-900 to-amber-700 transition-all duration-[1700ms]"
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

      <div className="mb-5 grid grid-cols-5 gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => pour(o.value)}
            disabled={pouring}
            className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
              guess === o.value
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-glass text-muted-foreground hover:text-foreground"
            } disabled:opacity-50`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {actual !== null && cat && (
        <>
          <div className="mb-3 rounded-lg bg-panel-soft/60 p-3 text-center font-mono text-sm">
            Previsão: <span className="text-primary">{guess}%</span> · Real:{" "}
            <span className="text-gold">{actual}%</span> · Erro: {diff}%
          </div>
          <CharacterReaction
            mood={cat === "win" ? "happy" : cat === "near-miss" ? "relieved" : "sad"}
            message={messages[cat]}
          />
        </>
      )}
    </div>
  );
}
