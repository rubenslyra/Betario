import { useState } from "react";
import { useLab } from "@/lib/lab-store";
import { CharacterReaction } from "@/components/CharacterReaction";
import { ExperimentControls } from "@/components/ExperimentControls";
import { ExperimentCharts } from "@/components/ExperimentCharts";
import { PresetManager } from "@/components/PresetManager";
import { motion, AnimatePresence } from "framer-motion";

const SYMBOLS = ["🍐", "🍎", "🥚", "☕", "🍞", "🫘"];
type Phase = "idle" | "spinning" | "result";

function Confetti() {
  const pieces = Array.from({ length: 24 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((_, i) => (
        <motion.span
          key={i}
          initial={{ x: "50%", y: "50%", opacity: 1, scale: 0.6 }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 120}%`,
            y: `${50 + (Math.random() - 0.5) * 120}%`,
            opacity: 0,
            scale: 1,
            rotate: Math.random() * 720,
          }}
          transition={{ duration: 1 + Math.random() * 0.6, ease: "easeOut" }}
          className="absolute h-2 w-2 rounded-sm"
          style={{
            background: ["oklch(0.78 0.17 145)", "oklch(0.85 0.17 92)", "oklch(0.72 0.16 235)"][i % 3],
          }}
        />
      ))}
    </div>
  );
}

export function SymbolsExperiment() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [reels, setReels] = useState<string[]>(["🍐", "🍎", "🥚"]);
  const [category, setCategory] = useState<"loss" | "near-miss" | "win" | null>(null);
  const [pulse, setPulse] = useState(0);
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
      }, 70),
    );

    [600, 950, 1300].forEach((t, i) => setTimeout(() => clearInterval(tickers[i]), t));

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
      setPulse((p) => p + 1);
      registerResult("symbols", cat, payout);
    }, 1400);
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
          className="relative mx-auto mb-6 flex justify-center gap-3 rounded-2xl bg-background/60 p-6 ring-1 ring-border"
          role="group"
          aria-label="Rolos de símbolos"
          aria-live="polite"
        >
          {reels.map((s, i) => (
            <motion.div
              key={`${i}-${pulse}`}
              animate={
                phase === "result" && category === "near-miss" && i === 2
                  ? { x: [0, -6, 6, -4, 4, 0] }
                  : phase === "result" && category === "win"
                  ? { scale: [1, 1.12, 1] }
                  : {}
              }
              transition={{ duration: 0.5 }}
              className={`flex h-24 w-20 items-center justify-center rounded-xl border bg-panel-soft text-5xl shadow-inner transition-colors ${
                phase === "result" && category === "win"
                  ? "border-success/70 shadow-success/30"
                  : phase === "result" && category === "near-miss" && i === 2
                  ? "border-warning/60"
                  : "border-border"
              }`}
              aria-label={`Rolo ${i + 1}: ${s}`}
            >
              <motion.span
                key={s + phase + i}
                initial={phase === "spinning" ? { y: -30, opacity: 0 } : false}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.18 }}
              >
                {s}
              </motion.span>
            </motion.div>
          ))}
          <AnimatePresence>
            {phase === "result" && category === "win" && <Confetti key={pulse} />}
          </AnimatePresence>
        </div>

        <motion.button
          onClick={spin}
          disabled={phase === "spinning"}
          aria-busy={phase === "spinning"}
          whileTap={{ scale: 0.97 }}
          whileHover={phase !== "spinning" ? { scale: 1.01 } : {}}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 font-semibold text-background shadow-lg shadow-primary/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
        >
          {phase === "spinning" ? "Girando…" : "Girar (simulação)"}
        </motion.button>

        <AnimatePresence>
          {phase === "result" && category && (
            <motion.div
              key={pulse}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5"
              role="status"
            >
              <CharacterReaction
                mood={category === "win" ? "happy" : category === "near-miss" ? "relieved" : "sad"}
                message={messages[category]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <ExperimentControls experiment="symbols" />
      <PresetManager experiment="symbols" />
      <ExperimentCharts experiment="symbols" />
    </div>
  );
}
