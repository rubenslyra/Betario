import { useState } from "react";
import { useLab } from "@/lib/lab-store";
import { CharacterReaction } from "@/components/CharacterReaction";
import { ExperimentControls } from "@/components/ExperimentControls";
import { ExperimentCharts } from "@/components/ExperimentCharts";
import { PresetManager } from "@/components/PresetManager";
import { PixDepositModal } from "@/components/PixDepositModal";
import { motion, AnimatePresence } from "framer-motion";
import { GlassJar } from "@/components/illustrations/Scene";

const OPTIONS = [
  { label: "25%", value: 25 },
  { label: "Metade", value: 50 },
  { label: "Quase cheio", value: 85 },
  { label: "Transbordar", value: 110 },
];

const PEBBLE_COLORS = ["#5fbedc", "#7fb069", "#c9a84c", "#e63946", "#a78bfa"];

function FallingPebbles({ filling }: { filling: boolean }) {
  if (!filling) return null;
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => {
        const left = 15 + Math.random() * 70;
        const color = PEBBLE_COLORS[i % PEBBLE_COLORS.length];
        const shape = i % 3;
        return (
          <motion.span
            key={i}
            initial={{ y: -40, opacity: 0, rotate: 0 }}
            animate={{ y: 220, opacity: [0, 1, 1, 0.6], rotate: 360 }}
            transition={{ duration: 1.6, delay: i * 0.1, ease: "easeIn" }}
            className="absolute top-0 h-3 w-3"
            style={{
              left: `${left}%`,
              background: color,
              borderRadius: shape === 0 ? "50%" : shape === 1 ? "3px" : "30%",
              boxShadow: `0 2px 6px ${color}88`,
            }}
            aria-hidden="true"
          />
        );
      })}
    </>
  );
}

export function CapacityExperiment() {
  const [guess, setGuess] = useState<number | null>(null);
  const [actual, setActual] = useState<number | null>(null);
  const [filling, setFilling] = useState(false);
  const [cat, setCat] = useState<"loss" | "near-miss" | "win" | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const registerBet = useLab((s) => s.registerBet);
  const registerResult = useLab((s) => s.registerResult);
  const rollOutcome = useLab((s) => s.rollOutcome);
  const getPayout = useLab((s) => s.getPayout);
  const balanceVisual = useLab((s) => s.balances.visual);

  const fill = (g: number) => {
    if (balanceVisual < 1) {
      setShowDeposit(true);
      return;
    }
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
      registerResult("capacity", outcome, getPayout("capacity", outcome));
    }, 1700);
  };

  const messages = {
    loss: "Observe o resultado.",
    "near-miss": "Foi perto, mas quase acerto não é garantia.",
    win: "Boa leitura! Agora compare com o relatório.",
  };

  const fillTarget = filling ? 70 : (actual ?? 0);
  const diff = guess !== null && actual !== null ? Math.abs(guess - actual) : null;

  return (
    <div className="space-y-6">
      <section
        className="glass-panel relative overflow-hidden p-6"
        aria-labelledby="capacity-heading"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, oklch(0.78 0.17 145 / 0.16), transparent 50%), radial-gradient(circle at 80% 75%, oklch(0.72 0.16 235 / 0.14), transparent 50%)",
          }}
        />
        <h2 id="capacity-heading" className="mb-1 text-lg font-semibold">
          Quantos cabem?{" "}
          <span className="ml-2 rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
            Laboratório escolar
          </span>
        </h2>
        <p className="mb-6 text-xs text-muted-foreground">
          Aposta fictícia de R$1,00. Estime quanto cabe no pote.
        </p>

        <div
          className="relative mx-auto mb-6 flex h-80 items-end justify-center rounded-3xl border border-border bg-gradient-to-b from-background/40 to-success/10 p-6 shadow-inner"
          aria-label="Bancada do experimento"
          aria-live="polite"
        >
          {/* table */}
          <div
            className="absolute bottom-3 left-3 right-3 h-5 rounded-md bg-gradient-to-b from-[#b08560] to-[#6a4f31] opacity-80"
            aria-hidden
          />
          <div className="relative">
            <GlassJar level={fillTarget}>
              <FallingPebbles filling={filling} />
            </GlassJar>
          </div>
          {/* counter */}
          <div className="absolute right-3 top-3 rounded-md border border-border bg-glass px-2 py-1 font-mono text-[11px] text-muted-foreground">
            nível: {Math.round(fillTarget)}%
          </div>
        </div>

        {showDeposit && <PixDepositModal blocking onClose={() => setShowDeposit(false)} />}

        {balanceVisual < 1 && !filling && (
          <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 p-3 text-center text-sm">
            Saldo insuficiente para jogar (R$1,00 por rodada).
            <button
              type="button"
              onClick={() => setShowDeposit(true)}
              className="ml-2 font-semibold text-primary underline"
            >
              Depositar agora
            </button>
          </div>
        )}

        <fieldset className="mb-5">
          <legend className="sr-only">Escolha a capacidade estimada</legend>
          <div className="grid grid-cols-4 gap-2">
            {OPTIONS.map((o) => (
              <motion.button
                key={o.value}
                onClick={() => fill(o.value)}
                disabled={filling || balanceVisual < 1}
                whileTap={{ scale: 0.95 }}
                whileHover={!filling && balanceVisual >= 1 ? { y: -2 } : {}}
                aria-pressed={guess === o.value}
                className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  guess === o.value
                    ? "border-success bg-success/15 text-success"
                    : "border-border bg-glass text-muted-foreground hover:text-foreground"
                } disabled:opacity-50`}
              >
                {o.label}
              </motion.button>
            ))}
          </div>
        </fieldset>

        <AnimatePresence>
          {actual !== null && cat && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="status"
            >
              <div className="mb-3 rounded-xl bg-panel-soft/60 p-3 text-center font-mono text-sm">
                Previsão: <span className="text-primary">{guess}%</span> · Real:{" "}
                <span className="text-gold">{actual}%</span> · Erro: {diff}%
              </div>
              <CharacterReaction
                mood={cat === "win" ? "happy" : cat === "near-miss" ? "relieved" : "sad"}
                message={messages[cat]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <ExperimentControls experiment="capacity" />
      <PresetManager experiment="capacity" />
      <ExperimentCharts experiment="capacity" />
    </div>
  );
}
