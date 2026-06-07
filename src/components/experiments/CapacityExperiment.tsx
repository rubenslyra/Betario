import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { CharacterReaction } from "@/components/CharacterReaction";
import { ExperimentCharts } from "@/components/ExperimentCharts";
import { ExperimentControls } from "@/components/ExperimentControls";
import { PixDepositModal } from "@/components/PixDepositModal";
import { PresetManager } from "@/components/PresetManager";
import { useLab } from "@/lib/lab-store";
import { publicUrl } from "@/lib/public-url";
import type { Outcome } from "@/lib/lab-rules";

const POT_CAPACITY_BALLS = 20;
const MAX_VISIBLE_BALLS = 24;
const ATTEMPT_TOKEN_COST = 1;
const BALL_PERCENT = 5;
const BALL_SIZE_PX = 36;
const BALL_DROP_INTERVAL_MS = 480;

type JarCapacityGameState =
  | "intro"
  | "waitingPrediction"
  | "predictionSelected"
  | "droppingBalls"
  | "settlingBalls"
  | "revealingComparison"
  | "perfect"
  | "success"
  | "nearMiss"
  | "loss"
  | "overflow"
  | "readyToRestart";

type PredictionOption = {
  percent: number;
  balls: number;
  label: string;
  description: string;
};

type CapacityResult = {
  actualBalls: number;
  actualPercent: number;
  errorBalls: number;
  errorPercentPoints: number;
  overflow: boolean;
  state: Extract<JarCapacityGameState, "perfect" | "success" | "nearMiss" | "loss" | "overflow">;
  statsCategory: Outcome;
};

type CapacitySfxKey = "fill25" | "fill50" | "fill75" | "fill100" | "nearWin" | "win";

const CAPACITY_AUDIO_EVENTS: Record<number, { balls: number; key: CapacitySfxKey }> = {
  25: { balls: 5, key: "fill25" },
  50: { balls: 10, key: "fill50" },
  75: { balls: 15, key: "fill75" },
  100: { balls: 20, key: "fill100" },
};

const capacitySfxMap: Record<CapacitySfxKey, string> = {
  fill25: publicUrl("audio/bolinhas-enchendo-copo-25%.mp3"),
  fill50: publicUrl("audio/bolinhas-enchendo-copo-50%.mp3"),
  fill75: publicUrl("audio/bolinhas-enchendo-copo-75%-e-100%.mp3"),
  fill100: publicUrl("audio/bolinhas-enchendo-copo-75%-e-100%.mp3"),
  nearWin: publicUrl("audio/winner-game-sound.mp3"),
  win: publicUrl("audio/winner-game-sound.mp3"),
};

const predictionOptions: PredictionOption[] = [
  {
    percent: 25,
    balls: 5,
    label: "Pouco cheio",
    description: "Aproximadamente 5 bolinhas",
  },
  {
    percent: 50,
    balls: 10,
    label: "Metade",
    description: "Aproximadamente 10 bolinhas",
  },
  {
    percent: 85,
    balls: 17,
    label: "Quase cheio",
    description: "Aproximadamente 17 bolinhas",
  },
  {
    percent: 110,
    balls: 22,
    label: "Vai transbordar",
    description: "Mais do que o pote comporta",
  },
];

const ballColors = ["#5fbedc", "#7fb069", "#f0c95a", "#e95f78", "#a78bfa", "#fb923c"];

const settledBallPositions = Array.from({ length: POT_CAPACITY_BALLS }, (_, i) => {
  const row = Math.floor(i / 4);
  const col = i % 4;
  const rowOffsets = [0, 7, -2, 5, 0];
  return {
    left: 10 + col * 20 + rowOffsets[row],
    bottom: 6 + row * 38,
  };
});

const overflowBallPositions = Array.from(
  { length: MAX_VISIBLE_BALLS - POT_CAPACITY_BALLS },
  (_, i) => ({
    left: 24 + i * 14,
    bottom: 3 + (i % 2) * 7,
  }),
);

const ACTUAL_BALL_OPTIONS = [5, 10, 15, 20];

function generateActualBalls() {
  return ACTUAL_BALL_OPTIONS[Math.floor(Math.random() * ACTUAL_BALL_OPTIONS.length)];
}

function classifyCapacityResult(predictedBalls: number, actualBalls: number): CapacityResult {
  const errorBalls = Math.abs(predictedBalls - actualBalls);
  const overflow = actualBalls > POT_CAPACITY_BALLS;
  const actualPercent = actualBalls * BALL_PERCENT;
  const errorPercentPoints = errorBalls * BALL_PERCENT;
  const baseState =
    errorBalls === 0
      ? "perfect"
      : errorBalls <= 1
        ? "success"
        : errorBalls <= 3
          ? "nearMiss"
          : "loss";
  const state = overflow ? "overflow" : baseState;
  const statsCategory: Outcome = errorBalls <= 1 ? "win" : errorBalls <= 3 ? "near-miss" : "loss";

  return {
    actualBalls,
    actualPercent,
    errorBalls,
    errorPercentPoints,
    overflow,
    state,
    statsCategory,
  };
}

function percentToTop(percent: number) {
  return `${100 - Math.min(120, Math.max(0, percent)) / 1.2}%`;
}

function CapacityChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
      {children}
    </span>
  );
}

function MarbleBall({
  index,
  falling,
  overflow,
  position,
}: {
  index: number;
  falling?: boolean;
  overflow?: boolean;
  position: { left: number; bottom: number };
}) {
  const color = ballColors[index % ballColors.length];
  const delay = falling ? 0.04 : 0;

  return (
    <motion.span
      className="absolute rounded-full border border-white/55 shadow-[inset_-6px_-7px_9px_rgba(30,20,10,0.24),inset_5px_5px_8px_rgba(255,255,255,0.6),0_6px_12px_rgba(0,0,0,0.22)]"
      initial={falling ? { top: -46, left: "48%", scale: 0.86, opacity: 0, rotate: -30 } : false}
      animate={{
        left: `${position.left}%`,
        bottom: position.bottom,
        top: "auto",
        scale: 1,
        opacity: 1,
        rotate: overflow ? [0, 18, -8, 0] : [0, -10, 8, 0],
      }}
      transition={{
        delay,
        duration: overflow ? 0.72 : 0.58,
        ease: [0.24, 0.8, 0.3, 1],
      }}
      style={{
        width: BALL_SIZE_PX,
        height: BALL_SIZE_PX,
        background: `radial-gradient(circle at 32% 28%, #fff 0 9%, ${color} 10% 55%, color-mix(in srgb, ${color}, #111 28%) 100%)`,
      }}
      aria-hidden="true"
    />
  );
}

function MilestoneLine({
  percent,
  highlightMilestone,
}: {
  percent: number;
  highlightMilestone: number | null;
}) {
  const isHighlighted = highlightMilestone === percent;

  return (
    <motion.div
      className="absolute left-0 right-0 z-10"
      style={{ top: percentToTop(percent) }}
      animate={
        isHighlighted
          ? {
              borderTopWidth: 2,
              borderTopStyle: "solid",
              borderColor: "oklch(0.85 0.17 92)",
              opacity: [0.4, 1, 0.4],
            }
          : {
              borderTopWidth: 1,
              borderTopStyle: "solid",
              borderColor: "oklch(1 1 0 / 0.12)",
              opacity: 0.4,
            }
      }
      transition={{ duration: 0.6, repeat: isHighlighted ? 3 : 0 }}
    />
  );
}

function CapacityJarScene({
  selected,
  visibleBalls,
  result,
  gameState,
  highlightMilestone,
}: {
  selected: PredictionOption | null;
  visibleBalls: number;
  result: CapacityResult | null;
  gameState: JarCapacityGameState;
  highlightMilestone: number | null;
}) {
  const internalBalls = Math.min(visibleBalls, POT_CAPACITY_BALLS);
  const overflowBallsCount = Math.max(0, visibleBalls - POT_CAPACITY_BALLS);
  const showPrediction = selected && gameState !== "waitingPrediction" && gameState !== "intro";
  const realPercent = result ? result.actualPercent : null;
  const safeLimitActive = result?.overflow || gameState === "overflow";
  const is100Highlighted = highlightMilestone === 100;

  return (
    <div
      className="relative mx-auto h-[360px] w-full max-w-[430px]"
      aria-label="Pote medidor com bolinhas de gude"
    >
      {/* Mesa/base abaixo do pote */}
      <div
        className="absolute inset-x-6 bottom-4 h-9 rounded-[999px] bg-gradient-to-b from-[#d7b38b] to-[#8a613a] shadow-lg"
        aria-hidden="true"
      />

      {/* Bandeja de transbordamento */}
      <div
        className={`absolute bottom-5 left-1/2 h-11 w-64 -translate-x-1/2 rounded-[50%] border shadow-inner transition-colors ${
          overflowBallsCount > 0
            ? "border-warning/50 bg-warning/15"
            : "border-success/25 bg-success/10"
        }`}
        aria-label="Bandeja para bolinhas que transbordam"
      />

      {/* Container principal do pote */}
      <div className="absolute bottom-12 left-1/2 h-[292px] w-[238px] -translate-x-1/2">
        {/* Boca do pote (elipse superior) */}
        <div className="absolute left-5 top-0 h-9 w-[198px] rounded-[50%] border border-sky-100/80 bg-sky-100/15 shadow-[inset_0_6px_10px_rgba(255,255,255,0.25)]" />

        {/* Corpo do pote (área interna) */}
        <div className="absolute left-6 top-4 h-[252px] w-[190px] overflow-hidden rounded-b-[42px] rounded-t-[18px] border border-sky-100/55 bg-sky-100/10 shadow-[inset_14px_0_24px_rgba(255,255,255,0.13),inset_-12px_0_22px_rgba(42,120,160,0.14)]">
          {/* Zona de transbordamento (acima de 100%) */}
          <div className="absolute inset-x-0 top-0 h-1/6 bg-warning/10" aria-hidden="true" />

          {/* Reflexo interno do vidro */}
          <div className="absolute left-3 right-3 top-4 bottom-3 rounded-b-[32px] rounded-t-[14px] border border-white/15" />

          {/* Bolinhas dentro do pote */}
          <div className="absolute inset-x-4 bottom-4 top-4 overflow-hidden rounded-b-[30px] rounded-t-md">
            {Array.from({ length: internalBalls }, (_, i) => (
              <MarbleBall key={i} index={i} falling position={settledBallPositions[i]} />
            ))}
          </div>

          {/* Linha de previsão (tracejada) */}
          {showPrediction && (
            <motion.div
              className="absolute left-0 right-0 z-20 border-t-2 border-dashed border-primary"
              style={{ top: percentToTop(selected.percent) }}
              initial={{ opacity: 0, scaleX: 0.85 }}
              animate={{ opacity: 1, scaleX: 1 }}
            >
              <span className="absolute left-3 top-1 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow">
                Sua previsão: {selected.balls} bolinhas / {selected.percent}%
              </span>
            </motion.div>
          )}

          {/* Linha do resultado real (contínua) */}
          {realPercent !== null && (
            <motion.div
              className="absolute left-0 right-0 z-20 border-t-2 border-gold"
              style={{ top: percentToTop(realPercent) }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="absolute right-3 -top-6 rounded-md bg-gold px-2 py-0.5 text-[10px] font-bold text-[#2b1a03] shadow">
                Real: {result?.actualBalls} / {realPercent}%
              </span>
            </motion.div>
          )}

          {/* Linha de limite seguro em 100% */}
          <motion.div
            className="absolute left-0 right-0 z-30 border-t-2 border-warning"
            style={{ top: percentToTop(100) }}
            animate={
              safeLimitActive || is100Highlighted ? { opacity: [0.55, 1, 0.55] } : { opacity: 0.76 }
            }
            transition={{
              duration: 0.7,
              repeat: safeLimitActive || is100Highlighted ? Infinity : 0,
            }}
          >
            <span className="absolute left-3 -top-6 rounded-md bg-warning px-2 py-0.5 text-[10px] font-bold text-warning-foreground shadow">
              limite seguro
            </span>
          </motion.div>

          {/* Linhas de marco de capacidade (25%, 50%, 75%) */}
          <MilestoneLine percent={25} highlightMilestone={highlightMilestone} />
          <MilestoneLine percent={50} highlightMilestone={highlightMilestone} />
          <MilestoneLine percent={75} highlightMilestone={highlightMilestone} />
        </div>

        {/* Régua lateral esquerda */}
        <div className="absolute left-0 top-4 h-[252px] w-12">
          {[120, 100, 75, 50, 25].map((p) => {
            const isHighlighted = highlightMilestone === p;
            return (
              <div
                key={p}
                className={`absolute right-0 flex items-center gap-1 transition-all ${
                  isHighlighted ? "opacity-100 drop-shadow-[0_0_6px_oklch(0.85_0.17_92)]" : ""
                }`}
                style={{ top: percentToTop(p) }}
              >
                <span
                  className={`h-px ${
                    p === 100
                      ? "w-8 bg-warning"
                      : isHighlighted
                        ? "w-8 bg-gold"
                        : "w-5 bg-sky-100/70"
                  }`}
                />
                <span
                  className={`font-mono text-[10px] transition-colors ${
                    isHighlighted ? "text-gold font-bold" : "text-muted-foreground"
                  }`}
                >
                  {p}%
                </span>
              </div>
            );
          })}
          {/* Rótulo da zona de transbordamento */}
          <span className="absolute left-1 top-1 font-mono text-[8px] uppercase tracking-wider text-warning/60">
            Transbordo
          </span>
        </div>

        {/* Contorno frontal do pote (vidro) */}
        <div className="pointer-events-none absolute left-6 top-4 h-[252px] w-[190px] rounded-b-[42px] rounded-t-[18px] border-2 border-sky-100/70 shadow-[0_12px_24px_rgba(15,23,42,0.16)]" />

        {/* Reflexo frontal do vidro */}
        <div className="pointer-events-none absolute left-14 top-[68px] h-[210px] w-4 rounded-full bg-white/25 blur-[1px]" />
      </div>

      {/* Bolinhas excedentes (transbordamento) na bandeja */}
      <div className="absolute bottom-12 left-1/2 h-[292px] w-[238px] -translate-x-1/2 overflow-visible">
        {Array.from({ length: overflowBallsCount }, (_, i) => (
          <MarbleBall
            key={`overflow-${i}`}
            index={POT_CAPACITY_BALLS + i}
            falling
            overflow
            position={overflowBallPositions[i]}
          />
        ))}
      </div>
    </div>
  );
}

const feedbackText: Record<
  CapacityResult["state"],
  { title: string; message: string; mood: "happy" | "relieved" | "sad" }
> = {
  perfect: {
    title: "Acerto perfeito",
    message: "Acerto perfeito! Sua estimativa bateu exatamente com o resultado.",
    mood: "happy",
  },
  success: {
    title: "Boa estimativa",
    message: "Boa estimativa! Você ficou a apenas 1 bolinha do resultado real.",
    mood: "happy",
  },
  nearMiss: {
    title: "Quase acerto",
    message: "Foi perto! Sua previsão ficou próxima, mas ainda passou da margem ideal.",
    mood: "relieved",
  },
  loss: {
    title: "Ficou distante",
    message: "Dessa vez ficou distante. Observe melhor a capacidade do pote e tente novamente.",
    mood: "sad",
  },
  overflow: {
    title: "Transbordou!",
    message: "Transbordou! Caíram mais bolinhas do que o pote comporta com segurança.",
    mood: "relieved",
  },
};

export function CapacityExperiment() {
  const [selected, setSelected] = useState<PredictionOption | null>(null);
  const [visibleBalls, setVisibleBalls] = useState(0);
  const [result, setResult] = useState<CapacityResult | null>(null);
  const [gameState, setGameState] = useState<JarCapacityGameState>("waitingPrediction");
  const [showDeposit, setShowDeposit] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [highlightMilestone, setHighlightMilestone] = useState<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const triggeredAudioMilestones = useRef<Set<number>>(new Set());
  const registerBet = useLab((s) => s.registerBet);
  const registerResult = useLab((s) => s.registerResult);
  const balanceVisual = useLab((s) => s.balances.visual);

  const busy = [
    "predictionSelected",
    "droppingBalls",
    "settlingBalls",
    "revealingComparison",
  ].includes(gameState);
  const canPlay = !busy && balanceVisual >= ATTEMPT_TOKEN_COST;
  const feedback = result ? feedbackText[result.state] : null;
  const safeBalls = result ? Math.min(result.actualBalls, POT_CAPACITY_BALLS) : 0;
  const excessBalls = result ? Math.max(0, result.actualBalls - POT_CAPACITY_BALLS) : 0;

  const playSfx = useCallback(
    (key: CapacitySfxKey, options?: { volume?: number; playbackRate?: number }) => {
      if (!sfxEnabled) return;
      const src = capacitySfxMap[key];
      if (!src) return;
      const audio = new Audio(src);
      audio.volume = options?.volume ?? 0.85;
      audio.playbackRate = options?.playbackRate ?? 1;
      audio.play().catch(() => {});
    },
    [sfxEnabled],
  );

  const explanation = useMemo(
    () =>
      "Cada bolinha ocupa uma parte do pote. O pote comporta até 20 bolinhas com segurança. Escolha quantas você acha que vão preencher o pote.",
    [],
  );

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(window.clearTimeout);
    };
  }, []);

  const clearRoundTimers = () => {
    timeoutsRef.current.forEach(window.clearTimeout);
    timeoutsRef.current = [];
  };

  const resetRound = () => {
    clearRoundTimers();
    setSelected(null);
    setVisibleBalls(0);
    setResult(null);
    setGameState("waitingPrediction");
    setHighlightMilestone(null);
    triggeredAudioMilestones.current.clear();
  };

  // Dispara áudio e destaque visual quando a quantidade de bolinhas atinge um marco
  useEffect(() => {
    if (gameState !== "droppingBalls") return;

    for (const [pct, ev] of Object.entries(CAPACITY_AUDIO_EVENTS)) {
      const milestone = Number(pct);
      if (visibleBalls === ev.balls && !triggeredAudioMilestones.current.has(milestone)) {
        triggeredAudioMilestones.current.add(milestone);

        const playbackRate = milestone === 100 ? 1.05 : 1;
        const volume = milestone === 100 ? 1 : 0.85;
        playSfx(ev.key, { volume, playbackRate });

        setHighlightMilestone(milestone);
        setTimeout(() => setHighlightMilestone((prev) => (prev === milestone ? null : prev)), 1200);
      }
    }
  }, [visibleBalls, gameState, playSfx]);

  // Dispara sons de resultado (vitória/quase acerto) na revelação
  useEffect(() => {
    if (result && gameState === "revealingComparison") {
      if (result.state === "perfect" || result.state === "success") {
        playSfx("win", { volume: 0.7 });
      } else if (result.state === "nearMiss") {
        playSfx("nearWin", { volume: 0.5 });
      }
    }
  }, [result, gameState, playSfx]);

  const selectPrediction = (option: PredictionOption) => {
    if (busy) return;
    if (balanceVisual < ATTEMPT_TOKEN_COST) {
      setShowDeposit(true);
      return;
    }

    clearRoundTimers();
    triggeredAudioMilestones.current.clear();
    const actualBalls = generateActualBalls();
    const nextResult = classifyCapacityResult(option.balls, actualBalls);

    setSelected(option);
    setVisibleBalls(0);
    setResult(null);
    setGameState("predictionSelected");
    registerBet(ATTEMPT_TOKEN_COST, "capacity");

    timeoutsRef.current.push(
      window.setTimeout(() => {
        setGameState("droppingBalls");
      }, 220),
    );

    for (let i = 1; i <= actualBalls; i += 1) {
      timeoutsRef.current.push(
        window.setTimeout(
          () => {
            setVisibleBalls(i);
          },
          360 + i * BALL_DROP_INTERVAL_MS,
        ),
      );
    }

    timeoutsRef.current.push(
      window.setTimeout(
        () => {
          setGameState("settlingBalls");
        },
        520 + actualBalls * BALL_DROP_INTERVAL_MS,
      ),
    );

    timeoutsRef.current.push(
      window.setTimeout(
        () => {
          setResult(nextResult);
          setGameState("revealingComparison");
          registerResult("capacity", nextResult.statsCategory, 0);
        },
        980 + actualBalls * BALL_DROP_INTERVAL_MS,
      ),
    );

    timeoutsRef.current.push(
      window.setTimeout(
        () => {
          setGameState(nextResult.state);
        },
        1300 + actualBalls * BALL_DROP_INTERVAL_MS,
      ),
    );
  };

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
              "radial-gradient(circle at 24% 18%, oklch(0.78 0.17 145 / 0.18), transparent 48%), radial-gradient(circle at 82% 70%, oklch(0.72 0.16 235 / 0.16), transparent 48%)",
          }}
        />

        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 id="capacity-heading" className="mb-1 text-xl font-semibold">
              Desafio do Pote
            </h2>
            <p className="text-sm text-muted-foreground">
              Observe o pote, escolha sua estimativa e descubra se você chegou perto da capacidade
              real.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <CapacityChip>20 bolinhas = 100%</CapacityChip>
            <CapacityChip>Cada bolinha = 5%</CapacityChip>
            <CapacityChip>Acima de 20: transborda</CapacityChip>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Ficha de tentativa: {ATTEMPT_TOKEN_COST}
            </span>
            {/* Controle de som */}
            <button
              type="button"
              onClick={() => setSfxEnabled((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-glass text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={sfxEnabled ? "Desativar som" : "Ativar som"}
              title={sfxEnabled ? "Som: ligado" : "Som: desligado"}
            >
              {sfxEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Texto explicativo com frase de defesa */}
        <p className="mb-2 rounded-2xl border border-border bg-glass px-4 py-3 text-sm text-muted-foreground">
          {explanation}
        </p>
        <blockquote className="mb-5 border-l-2 border-primary/40 pl-4 text-xs italic text-muted-foreground/80">
          Este jogo trabalha estimativa, capacidade e erro percentual usando um objeto físico
          simulado. O pote comporta 20 bolinhas; cada bolinha representa 5% da capacidade. O aluno
          faz uma previsão, observa o enchimento e depois compara sua estimativa com o resultado
          real. Os sons marcam os pontos de 25%, 50%, 75% e 100%, reforçando a progressão da
          capacidade de forma visual e auditiva.
        </blockquote>

        <div
          className="relative mx-auto mb-6 rounded-3xl border border-border bg-gradient-to-b from-background/40 via-success/5 to-success/10 p-4 shadow-inner"
          aria-live="polite"
        >
          <CapacityJarScene
            selected={selected}
            visibleBalls={visibleBalls}
            result={result}
            gameState={gameState}
            highlightMilestone={highlightMilestone}
          />
          <div className="absolute left-4 top-4 rounded-md border border-border bg-glass px-2 py-1 font-mono text-[11px] text-muted-foreground">
            bolinhas no pote: {Math.min(visibleBalls, POT_CAPACITY_BALLS)} / {POT_CAPACITY_BALLS}
          </div>
          {visibleBalls > POT_CAPACITY_BALLS && (
            <div className="absolute right-4 top-4 rounded-md border border-warning/40 bg-warning/15 px-2 py-1 text-xs font-bold text-warning">
              transbordou: +{visibleBalls - POT_CAPACITY_BALLS}
            </div>
          )}
        </div>

        {showDeposit && <PixDepositModal blocking onClose={() => setShowDeposit(false)} />}

        {balanceVisual < ATTEMPT_TOKEN_COST && !busy && (
          <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 p-3 text-center text-sm">
            Fichas insuficientes para a rodada.
            <button
              type="button"
              onClick={() => setShowDeposit(true)}
              className="ml-2 font-semibold text-primary underline"
            >
              Adicionar fichas
            </button>
          </div>
        )}

        <fieldset className="mb-5">
          <legend className="sr-only">Escolha a estimativa de bolinhas</legend>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {predictionOptions.map((option) => (
              <motion.button
                key={option.percent}
                type="button"
                onClick={() => selectPrediction(option)}
                disabled={!canPlay}
                whileTap={{ scale: 0.97 }}
                whileHover={canPlay ? { y: -2 } : {}}
                aria-pressed={selected?.percent === option.percent}
                className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selected?.percent === option.percent
                    ? "border-success bg-success/15 text-foreground shadow-md"
                    : "border-border bg-glass text-muted-foreground hover:text-foreground"
                } disabled:cursor-not-allowed disabled:opacity-55`}
              >
                <span className="block text-2xl font-black text-success">{option.percent}%</span>
                <span className="mt-1 block text-sm font-bold text-foreground">
                  {option.balls} bolinhas
                </span>
                <span className="mt-1 block text-xs">{option.label}</span>
                <span className="mt-3 block text-[11px] leading-snug opacity-80">
                  {option.description}
                </span>
              </motion.button>
            ))}
          </div>
        </fieldset>

        <AnimatePresence>
          {result && selected && feedback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="status"
              className="space-y-3"
            >
              <div className="grid gap-3 rounded-2xl border border-border bg-panel-soft/70 p-4 text-sm md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Sua previsão
                  </p>
                  <p className="font-mono text-base text-primary">
                    {selected.balls} bolinhas / {selected.percent}%
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Resultado real
                  </p>
                  <p className="font-mono text-base text-gold">
                    {result.actualBalls} bolinhas / {result.actualPercent}%
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Erro</p>
                  <p className="font-mono text-base">
                    {result.errorBalls} bolinhas / {result.errorPercentPoints} pontos percentuais
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Resultado
                  </p>
                  <p className="font-semibold text-success">{feedback.title}</p>
                </div>
                {result.overflow && (
                  <div className="md:col-span-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-warning">
                    <p className="mb-1 font-bold">Transbordou!</p>
                    <p className="text-sm">
                      O pote comporta {POT_CAPACITY_BALLS} bolinhas com segurança, mas caíram{" "}
                      {result.actualBalls}.
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <span>Capacidade segura: {POT_CAPACITY_BALLS} bolinhas</span>
                      <span>Resultado real: {result.actualBalls} bolinhas</span>
                      <span>Excesso: {excessBalls} bolinhas</span>
                      <span>Percentual: {result.actualPercent}%</span>
                    </div>
                  </div>
                )}
                {!result.overflow && (
                  <div className="md:col-span-2 rounded-xl border border-success/25 bg-success/10 p-3 text-muted-foreground">
                    O pote recebeu {safeBalls} bolinhas dentro do limite seguro.
                  </div>
                )}
              </div>

              <CharacterReaction mood={feedback.mood} message={feedback.message} />

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={resetRound}
                  className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Jogar novamente
                </button>
              </div>
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
