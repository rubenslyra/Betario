import { useEffect, useRef, useState } from "react";
import { useLab, BET_AMOUNT } from "@/lib/lab-store";
import { CharacterReaction } from "@/components/CharacterReaction";
import { ExperimentControls } from "@/components/ExperimentControls";
import { ExperimentCharts } from "@/components/ExperimentCharts";
import { PresetManager } from "@/components/PresetManager";
import { PixDepositModal } from "@/components/PixDepositModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  SYMBOL_KEYS,
  SYMBOL_LABEL,
  SYMBOL_RENDER,
  type SymbolKey,
} from "@/components/illustrations/FoodSymbols";
import { publicUrl } from "@/lib/public-url";

const ROULETTE_SOUND = publicUrl("audio/roleta-267662.mp3");
const ROULETTE_STOP_SOUND = publicUrl("audio/roleta-parando.mp3");
const WINNER_SOUND = publicUrl("audio/winner-game-sound.mp3");

type Phase = "idle" | "spinning" | "result";

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ x: "50%", y: "50%", opacity: 1, scale: 0.6 }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 160}%`,
            y: `${50 + (Math.random() - 0.5) * 160}%`,
            opacity: 0,
            scale: 1,
            rotate: Math.random() * 720,
          }}
          transition={{ duration: 1 + Math.random() * 0.6, ease: "easeOut" }}
          className="absolute h-2 w-2 rounded-sm"
          style={{
            background: ["#7fb069", "#c9a84c", "#5fbedc", "#e63946"][i % 4],
          }}
        />
      ))}
    </div>
  );
}

function Reel({
  symbol,
  spinning,
  highlight,
  shake,
}: {
  symbol: SymbolKey;
  spinning: boolean;
  highlight?: "win" | "near" | null;
  shake?: boolean;
}) {
  const Render = SYMBOL_RENDER[symbol];
  return (
    <motion.div
      animate={
        shake ? { x: [0, -6, 6, -4, 4, 0] } : highlight === "win" ? { scale: [1, 1.12, 1] } : {}
      }
      transition={{ duration: 0.65 }}
      className={`relative flex h-28 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 bg-gradient-to-b from-panel-soft to-panel shadow-inner backdrop-blur ${
        highlight === "win"
          ? "border-success/70 shadow-success/30"
          : highlight === "near"
            ? "border-gold/70"
            : "border-border"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white/15 to-transparent" />
      <motion.div
        key={spinning ? `s-${Math.random()}` : symbol}
        initial={spinning ? { y: -40, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Render />
      </motion.div>
    </motion.div>
  );
}

export function SymbolsExperiment() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [reels, setReels] = useState<SymbolKey[]>(["pera", "maca", "ovo"]);
  const [category, setCategory] = useState<"loss" | "near-miss" | "win" | null>(null);
  const [pulse, setPulse] = useState(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const rouletteAudioRef = useRef<HTMLAudioElement | null>(null);
  const rouletteStopAudioRef = useRef<HTMLAudioElement | null>(null);
  const winnerAudioRef = useRef<HTMLAudioElement | null>(null);
  const shuffleTimerRef = useRef<number | null>(null);
  const registerBet = useLab((s) => s.registerBet);
  const registerResult = useLab((s) => s.registerResult);
  const rollOutcome = useLab((s) => s.rollOutcome);
  const getPayout = useLab((s) => s.getPayout);
  const balanceVisual = useLab((s) => s.balances.visual);

  useEffect(
    () => () => {
      if (shuffleTimerRef.current) {
        window.clearInterval(shuffleTimerRef.current);
        shuffleTimerRef.current = null;
      }
      const audio = rouletteAudioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.onended = null;
        audio.onerror = null;
      }
      const stopAudio = rouletteStopAudioRef.current;
      if (stopAudio) {
        stopAudio.pause();
        stopAudio.currentTime = 0;
        stopAudio.onended = null;
        stopAudio.onerror = null;
      }
      const winnerAudio = winnerAudioRef.current;
      if (winnerAudio) {
        winnerAudio.pause();
        winnerAudio.currentTime = 0;
        winnerAudio.onended = null;
        winnerAudio.onerror = null;
      }
    },
    [],
  );

  const getOutcome = (): "loss" | "near-miss" | "win" => {
    return rollOutcome("symbols");
  };

  const buildFinalReels = (cat: "loss" | "near-miss" | "win") => {
    if (cat === "win") {
      const s = SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)];
      return [s, s, s] as SymbolKey[];
    }

    if (cat === "near-miss") {
      const s = SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)];
      const other = SYMBOL_KEYS.filter((x) => x !== s)[
        Math.floor(Math.random() * (SYMBOL_KEYS.length - 1))
      ];
      return [s, s, other] as SymbolKey[];
    }

    const final = [0, 1, 2].map(
      () => SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)],
    ) as SymbolKey[];
    if (new Set(final).size < 3) {
      final[2] = SYMBOL_KEYS[(SYMBOL_KEYS.indexOf(final[2]) + 1) % SYMBOL_KEYS.length];
    }
    return final;
  };

  const stopRoulette = (cat: "loss" | "near-miss" | "win") => {
    if (shuffleTimerRef.current) {
      window.clearInterval(shuffleTimerRef.current);
      shuffleTimerRef.current = null;
    }

    const final = buildFinalReels(cat);
    setReels(final);
    setCategory(cat);
    setPhase("result");
    setPulse((p) => p + 1);
    registerResult("symbols", cat, getPayout("symbols", cat));

    const audio = rouletteAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    const stopAudio = rouletteStopAudioRef.current;
    const winnerAudio = winnerAudioRef.current;

    if (stopAudio) {
      stopAudio.pause();
      stopAudio.currentTime = 0;
      stopAudio.onended = null;
      stopAudio.onerror = null;
      stopAudio.play().catch((error) => {
        console.warn("[SymbolsExperiment] roulette stop sound failed", error);
      });

      if (cat === "win" && winnerAudio) {
        winnerAudio.pause();
        winnerAudio.currentTime = 0;
        winnerAudio.onended = null;
        winnerAudio.onerror = null;
        stopAudio.onended = () => {
          winnerAudio.play().catch((error) => {
            console.warn("[SymbolsExperiment] winner sound failed", error);
          });
        };
      }
    } else if (cat === "win" && winnerAudio) {
      winnerAudio.pause();
      winnerAudio.currentTime = 0;
      winnerAudio.play().catch((error) => {
        console.warn("[SymbolsExperiment] winner sound failed", error);
      });
    }
  };

  const spin = () => {
    if (phase === "spinning") return;
    if (balanceVisual < BET_AMOUNT) {
      setShowDeposit(true);
      return;
    }

    registerBet(BET_AMOUNT, "symbols");
    setPhase("spinning");
    setCategory(null);

    if (shuffleTimerRef.current) {
      window.clearInterval(shuffleTimerRef.current);
      shuffleTimerRef.current = null;
    }

    const audio = rouletteAudioRef.current;
    const beginShuffle = () => {
      shuffleTimerRef.current = window.setInterval(() => {
        setReels((prev) => {
          const next = [...prev];
          const index = Math.floor(Math.random() * next.length);
          next[index] = SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)];
          return next;
        });
      }, 80);
    };

    if (!audio) {
      stopRoulette(getOutcome());
      return;
    }

    audio.onended = () => {
      stopRoulette(getOutcome());
    };
    audio.onerror = () => {
      if (shuffleTimerRef.current) {
        window.clearInterval(shuffleTimerRef.current);
        shuffleTimerRef.current = null;
      }
      setPhase("idle");
    };

    audio.currentTime = 0;
    audio.loop = false;
    const playPromise = audio.play();

    if (!playPromise) {
      beginShuffle();
      return;
    }

    playPromise.then(beginShuffle).catch((error) => {
      console.warn("[SymbolsExperiment] roulette sound failed", error);
      if (shuffleTimerRef.current) {
        window.clearInterval(shuffleTimerRef.current);
        shuffleTimerRef.current = null;
      }
      setPhase("idle");
    });
  };

  const messages = {
    loss: "Observe o resultado.",
    "near-miss": "Foi perto, mas quase acerto não é garantia.",
    win: "Boa leitura! Agora compare com o relatório.",
  };

  const spinning = phase === "spinning";

  return (
    <div className="space-y-6">
      <section
        className="glass-panel relative overflow-hidden p-6"
        aria-labelledby="symbols-heading"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 20%, oklch(0.72 0.16 235 / 0.18), transparent 45%), radial-gradient(circle at 80% 80%, oklch(0.85 0.17 92 / 0.14), transparent 45%)",
          }}
        />
        <div className="mb-1 flex items-center gap-2">
          <h2 id="symbols-heading" className="text-lg font-semibold">
            Giro dos símbolos
          </h2>
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            Laboratório de probabilidade
          </span>
        </div>
        <p className="mb-6 text-xs text-muted-foreground">
          Aposta fictícia de R$2,50 por giro. Resultado demonstrativo — sem dinheiro real.
        </p>

        <audio ref={rouletteAudioRef} src={ROULETTE_SOUND} preload="auto" aria-hidden="true" />
        <audio
          ref={rouletteStopAudioRef}
          src={ROULETTE_STOP_SOUND}
          preload="auto"
          aria-hidden="true"
        />
        <audio ref={winnerAudioRef} src={WINNER_SOUND} preload="auto" aria-hidden="true" />

        <motion.div
          className="relative mx-auto mb-6 flex justify-center gap-3 rounded-2xl border border-border bg-background/50 p-6 shadow-inner"
          role="group"
          aria-label="Rolos de símbolos"
          aria-live="polite"
          animate={spinning ? { rotate: [0, -2.5, 2.5, 0] } : { rotate: 0 }}
          transition={
            spinning ? { duration: 0.55, repeat: Infinity, ease: "linear" } : { duration: 0.25 }
          }
        >
          {reels.map((s, i) => (
            <Reel
              key={i}
              symbol={s}
              spinning={spinning}
              highlight={
                phase === "result" && category === "win"
                  ? "win"
                  : phase === "result" && category === "near-miss" && i === 2
                    ? "near"
                    : null
              }
              shake={phase === "result" && category === "near-miss" && i === 2}
            />
          ))}
          <AnimatePresence>
            {phase === "result" && category === "win" && <Confetti key={pulse} />}
          </AnimatePresence>
        </motion.div>

        <div className="mb-4 grid grid-cols-6 gap-2" aria-hidden="true">
          {SYMBOL_KEYS.map((k) => {
            const R = SYMBOL_RENDER[k];
            return (
              <div
                key={k}
                title={SYMBOL_LABEL[k]}
                className="flex flex-col items-center gap-1 rounded-lg border border-border bg-glass p-1.5"
              >
                <div className="scale-75">
                  <R />
                </div>
                <span className="text-[9px] text-muted-foreground">{SYMBOL_LABEL[k]}</span>
              </div>
            );
          })}
        </div>

        {balanceVisual < BET_AMOUNT && !spinning && (
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

        {showDeposit && <PixDepositModal blocking onClose={() => setShowDeposit(false)} />}

        <motion.button
          onClick={spin}
          disabled={spinning || balanceVisual < BET_AMOUNT}
          aria-busy={spinning}
          whileTap={{ scale: 0.97 }}
          whileHover={!spinning && balanceVisual >= 1 ? { scale: 1.01 } : {}}
          className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3.5 text-base font-semibold text-background shadow-lg shadow-primary/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
        >
          {spinning ? "Girando…" : "Girar (simulação)"}
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
