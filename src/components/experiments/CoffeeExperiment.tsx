import { useEffect, useRef, useState } from "react";
import { useLab, BET_AMOUNT } from "@/lib/lab-store";
import { CharacterReaction } from "@/components/CharacterReaction";
import { ExperimentControls } from "@/components/ExperimentControls";
import { ExperimentCharts } from "@/components/ExperimentCharts";
import { PresetManager } from "@/components/PresetManager";
import { PixDepositModal } from "@/components/PixDepositModal";
import { motion, AnimatePresence } from "framer-motion";
import { CoffeePourScene } from "@/components/illustrations/Scene";
import { publicUrl } from "@/lib/public-url";

const COFFEE_SOUND = publicUrl("audio/coffee-pouring-into-a-cup.mp3");

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
  const [showDeposit, setShowDeposit] = useState(false);
  const pourAudioRef = useRef<HTMLAudioElement | null>(null);
  const registerBet = useLab((s) => s.registerBet);
  const registerResult = useLab((s) => s.registerResult);
  const rollOutcome = useLab((s) => s.rollOutcome);
  const getPayout = useLab((s) => s.getPayout);
  const balanceVisual = useLab((s) => s.balances.visual);

  useEffect(
    () => () => {
      const audio = pourAudioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.onended = null;
        audio.onerror = null;
      }
    },
    [],
  );

  const finishPour = (g: number) => {
    const outcome = rollOutcome("coffee");
    let a: number;
    if (outcome === "win") a = g + Math.floor(Math.random() * 6 - 3);
    else if (outcome === "near-miss")
      a = g + (Math.random() < 0.5 ? -1 : 1) * (8 + Math.floor(Math.random() * 6));
    else a = Math.floor(Math.random() * 130);
    a = Math.max(0, a);
    setActual(a);
    setCat(outcome);
    setPouring(false);
    registerResult("coffee", outcome, getPayout("coffee", outcome));

    const audio = pourAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  const pour = (g: number) => {
    if (pouring) return;
    if (balanceVisual < BET_AMOUNT) {
      setShowDeposit(true);
      return;
    }

    setGuess(g);
    setPouring(true);
    setActual(null);
    setCat(null);
    registerBet(BET_AMOUNT, "coffee");

    const audio = pourAudioRef.current;
    if (!audio) {
      finishPour(g);
      return;
    }

    audio.onended = () => finishPour(g);
    audio.onerror = () => {
      audio.pause();
      audio.currentTime = 0;
      finishPour(g);
    };
    audio.currentTime = 0;
    audio.loop = false;
    const playPromise = audio.play();

    if (playPromise) {
      playPromise.catch(() => {
        audio.pause();
        audio.currentTime = 0;
        finishPour(g);
      });
    }
  };

  const messages = {
    loss: "Observe o resultado.",
    "near-miss": "Foi perto, mas quase acerto não é garantia.",
    win: "Boa leitura! Agora compare com o relatório.",
  };

  const fillTarget = pouring ? 80 : (actual ?? 0);
  const diff = guess !== null && actual !== null ? Math.abs(guess - actual) : null;

  return (
    <div className="space-y-6">
      <section
        className="glass-panel relative overflow-hidden p-6"
        aria-labelledby="coffee-heading"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, oklch(0.55 0.12 60 / 0.18), transparent 55%), radial-gradient(circle at 80% 70%, oklch(0.85 0.17 92 / 0.1), transparent 50%)",
          }}
        />
        <h2 id="coffee-heading" className="mb-1 text-lg font-semibold">
          Medida do café{" "}
          <span className="ml-2 rounded-full bg-amber/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber">
            Cafeteria educativa
          </span>
        </h2>
        <p className="mb-6 text-xs text-muted-foreground">
          Aposta fictícia de R$2,50. Preveja quanto a jarra vai derramar.
        </p>

        <audio ref={pourAudioRef} src={COFFEE_SOUND} preload="auto" aria-hidden="true" />

        {/* scene */}
        <div
          className="relative mx-auto mb-6 flex h-80 items-end justify-center rounded-3xl border border-border bg-gradient-to-b from-background/40 to-amber/10 p-6 shadow-inner"
          aria-label="Cena da cafeteria"
          aria-live="polite"
        >
          {/* table */}
          <div
            className="absolute bottom-3 left-3 right-3 h-6 rounded-md bg-gradient-to-b from-[#8b5a2b] to-[#5a3618] opacity-80 shadow-lg"
            aria-hidden
          />
          <CoffeePourScene level={fillTarget} pouring={pouring} />
          {/* lab notes */}
          <div className="absolute right-3 top-3 hidden rounded-md border border-border bg-glass px-2 py-1 font-mono text-[10px] text-muted-foreground sm:block">
            obs: marcações 25/50/75/100%
          </div>
        </div>

        {showDeposit && <PixDepositModal blocking onClose={() => setShowDeposit(false)} />}

        {balanceVisual < BET_AMOUNT && !pouring && (
          <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 p-3 text-center text-sm">
            Saldo insuficiente para jogar (R$2,50 por rodada).
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
          <legend className="sr-only">Escolha o volume previsto</legend>
          <div className="grid grid-cols-5 gap-2">
            {OPTIONS.map((o) => (
              <motion.button
                key={o.value}
                onClick={() => pour(o.value)}
                disabled={pouring || balanceVisual < BET_AMOUNT}
                whileTap={{ scale: 0.95 }}
                whileHover={!pouring && balanceVisual >= 1 ? { y: -2 } : {}}
                aria-pressed={guess === o.value}
                className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  guess === o.value
                    ? "border-amber bg-amber/15 text-amber"
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

      <ExperimentControls experiment="coffee" />
      <PresetManager experiment="coffee" />
      <ExperimentCharts experiment="coffee" />
    </div>
  );
}
