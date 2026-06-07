import { motion } from "framer-motion";

const coffeeScene = {
  width: 288,
  height: 288,
  cupCenterX: 144,
  cupTopY: 84,
  cupBottomY: 260,
  cupWidth: 132,
  cupHeight: 176,
  potRestX: -20,
  potRestY: -26,
  potPourX: -5,
  potPourY: -23,
  potPivotX: 59,
  potPivotY: 84,
  potSpoutX: 132,
  potSpoutY: 66,
};

const cupMouthLeftX = coffeeScene.cupCenterX - coffeeScene.cupWidth / 2;
const cupMouthRightX = coffeeScene.cupCenterX + coffeeScene.cupWidth / 2;
const cupMouthCenterX = coffeeScene.cupCenterX;
const cupMouthY = coffeeScene.cupTopY;
const pourTargetX = cupMouthCenterX - 8;
const pourTargetY = cupMouthY + 12;
const coffeeFillBottomY = coffeeScene.cupBottomY - 6;
const coffeeFillMaxHeight = coffeeScene.cupHeight - 28;

/** Stable cafeteria scene; pot, stream and graduated cup share one coordinate system. */
export function CoffeePourScene({ level, pouring }: { level: number; pouring: boolean }) {
  const clamped = Math.min(110, Math.max(0, level));
  const fillHeight = (clamped / 110) * coffeeFillMaxHeight;
  const fillTopY = coffeeFillBottomY - fillHeight;

  return (
    <div className="relative h-72 w-72">
      <svg
        viewBox={`0 0 ${coffeeScene.width} ${coffeeScene.height}`}
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <defs>
          <linearGradient id="coffee-scene-glass" x1="0" x2="1">
            <stop offset="0" stopColor="oklch(0.95 0.02 220)" stopOpacity="0.28" />
            <stop offset="0.5" stopColor="oklch(0.95 0.02 220)" stopOpacity="0.08" />
            <stop offset="1" stopColor="oklch(0.95 0.02 220)" stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id="coffee-scene-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#7a4218" />
            <stop offset="1" stopColor="#3a1c08" />
          </linearGradient>
          <linearGradient id="coffee-scene-pot" x1="0" x2="1">
            <stop offset="0" stopColor="#4a2a14" />
            <stop offset="0.55" stopColor="#8a5428" />
            <stop offset="1" stopColor="#3a1c08" />
          </linearGradient>
          <clipPath id="coffee-scene-cup-clip">
            <path
              d={`M${cupMouthLeftX} ${cupMouthY + 8} h${coffeeScene.cupWidth} v128 q0 30 -30 36 h-72 q-30 -6 -30 -36z`}
            />
          </clipPath>
        </defs>

        {/* steam behind the pot and above the mouth */}
        {pouring &&
          [0, 1, 2].map((i) => (
            <motion.path
              key={i}
              d={`M${cupMouthCenterX - 18 + i * 18} ${cupMouthY - 2} q${-8 + i * 4} -18 2 -34`}
              fill="none"
              stroke="oklch(0.98 0.02 80)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: [0, 0.55, 0], pathLength: [0, 1, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.35 }}
            />
          ))}

        {/* coffee fill, clipped inside the cup and kept horizontally level */}
        <g clipPath="url(#coffee-scene-cup-clip)">
          <motion.rect
            x={cupMouthLeftX - 4}
            width={coffeeScene.cupWidth + 8}
            fill="url(#coffee-scene-fill)"
            initial={false}
            animate={{ y: fillTopY, height: fillHeight + 18 }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          />
          <motion.ellipse
            cx={coffeeScene.cupCenterX}
            rx={coffeeScene.cupWidth / 2 - 8}
            ry="5"
            fill="#ead4a8"
            opacity="0.86"
            initial={false}
            animate={{ cy: fillTopY }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          />
        </g>

        {/* glass and handle above the coffee, below marks */}
        <path
          d={`M${cupMouthRightX} ${cupMouthY + 42} q38 6 38 42 q0 35 -38 42`}
          fill="none"
          stroke="oklch(0.86 0.04 230)"
          strokeWidth="6"
          opacity="0.72"
        />
        <path
          d={`M${cupMouthLeftX} ${cupMouthY} h${coffeeScene.cupWidth} v144 q0 30 -30 36 h-72 q-30 -6 -30 -36z`}
          fill="url(#coffee-scene-glass)"
          stroke="oklch(0.91 0.03 220)"
          strokeWidth="3"
        />
        <ellipse
          cx={cupMouthCenterX}
          cy={cupMouthY}
          rx={coffeeScene.cupWidth / 2}
          ry="8"
          fill="none"
          stroke="oklch(0.94 0.03 220)"
          strokeWidth="3"
          opacity="0.86"
        />
        {[25, 50, 75, 100].map((p) => {
          const y = coffeeFillBottomY - (p / 110) * coffeeFillMaxHeight;
          return (
            <g key={p}>
              <line
                x1={cupMouthLeftX}
                x2={cupMouthLeftX + 12}
                y1={y}
                y2={y}
                stroke="oklch(0.92 0.03 220)"
                strokeWidth="1.5"
              />
              <text
                x={cupMouthLeftX + 16}
                y={y + 3}
                fontSize="10"
                fill="oklch(0.86 0.04 230)"
                fontFamily="monospace"
              >
                {p}%
              </text>
            </g>
          );
        })}
        <path
          d={`M${cupMouthLeftX + 15} ${cupMouthY + 18} q-5 75 4 156`}
          stroke="#fff"
          strokeWidth="6"
          opacity="0.2"
          fill="none"
        />

        {/* stream starts at the aligned spout and lands inside the mouth */}
        {pouring && (
          <motion.path
            d={`M${coffeeScene.potSpoutX} ${coffeeScene.potSpoutY} C${coffeeScene.potSpoutX - 4} 78 ${pourTargetX - 2} 82 ${pourTargetX} ${pourTargetY}`}
            fill="none"
            stroke="url(#coffee-scene-fill)"
            strokeWidth="5"
            strokeLinecap="round"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 1, pathLength: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, delay: 0.42, ease: "easeOut" }}
          />
        )}

        {/* pot above the stream so the stream appears to leave the spout */}
        <motion.g
          initial={false}
          animate={{
            x: pouring ? coffeeScene.potPourX : coffeeScene.potRestX,
            y: pouring ? coffeeScene.potPourY : coffeeScene.potRestY,
            rotate: pouring ? 24 : -10,
          }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{
            transformOrigin: `${coffeeScene.potPivotX}px ${coffeeScene.potPivotY}px`,
            transformBox: "view-box",
          }}
        >
          <path
            d="M40 48 h64 q12 0 12 12 v43 q0 15 -15 15 h-58 q-15 0 -15 -15 v-43 q0 -12 12 -12z"
            fill="url(#coffee-scene-pot)"
            stroke="#1d0b03"
            strokeWidth="2"
          />
          <path
            d="M105 56 q25 -4 30 9 q-7 5 -28 14"
            fill="url(#coffee-scene-pot)"
            stroke="#1d0b03"
            strokeWidth="2"
          />
          <path d="M40 59 q-22 5 -22 26 q0 19 22 22" fill="none" stroke="#1d0b03" strokeWidth="6" />
          <ellipse cx="72" cy="48" rx="38" ry="6" fill="#2a1408" stroke="#1d0b03" strokeWidth="2" />
          <circle cx="72" cy="42" r="4" fill="#f0c95a" />
          <ellipse cx="58" cy="73" rx="5" ry="14" fill="#fff" opacity="0.22" />
        </motion.g>
      </svg>
    </div>
  );
}

/** Glass mug with marked levels; fill rises with `level` (0-110). */
export function GlassMug({ level, pouring }: { level: number; pouring: boolean }) {
  const clamped = Math.min(110, Math.max(0, level));
  return (
    <motion.div
      className="relative h-72 w-48"
      animate={pouring ? { rotate: 10, x: 10 } : { rotate: 0, x: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* steam */}
      {pouring && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: -40 - i * 8, opacity: [0, 0.55, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.45 }}
              className="absolute left-1/2 top-2 h-10 w-1.5 -translate-x-1/2 rounded-full bg-foreground/40 blur-sm"
            />
          ))}
        </>
      )}
      <svg viewBox="0 0 200 280" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="glass" x1="0" x2="1">
            <stop offset="0" stopColor="oklch(0.95 0.02 220)" stopOpacity="0.25" />
            <stop offset="0.5" stopColor="oklch(0.95 0.02 220)" stopOpacity="0.08" />
            <stop offset="1" stopColor="oklch(0.95 0.02 220)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="coffee" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#6b3a16" />
            <stop offset="1" stopColor="#3a1c08" />
          </linearGradient>
          <clipPath id="mug-clip">
            <path d="M30 60 h140 v170 q0 25 -30 30 h-80 q-30 -5 -30 -30z" />
          </clipPath>
        </defs>
        {/* handle */}
        <path
          d="M170 100 q40 5 40 40 q0 35 -40 40"
          fill="none"
          stroke="oklch(0.85 0.04 230)"
          strokeWidth="6"
          opacity="0.7"
        />
        {/* mug body */}
        <path
          d="M30 60 h140 v170 q0 25 -30 30 h-80 q-30 -5 -30 -30z"
          fill="url(#glass)"
          stroke="oklch(0.9 0.03 220)"
          strokeWidth="3"
        />
        {/* coffee fill */}
        <g clipPath="url(#mug-clip)">
          <motion.rect
            x="0"
            width="200"
            fill="url(#coffee)"
            initial={false}
            animate={{ y: 260 - (clamped / 110) * 200, height: (clamped / 110) * 220 + 20 }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          />
          {/* foam */}
          <motion.ellipse
            cx="100"
            rx="68"
            ry="6"
            fill="#e8d2a8"
            opacity="0.85"
            initial={false}
            animate={{ cy: 260 - (clamped / 110) * 200 }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          />
        </g>
        {/* level marks */}
        {[
          { p: 25, y: 210 },
          { p: 50, y: 170 },
          { p: 75, y: 130 },
          { p: 100, y: 90 },
        ].map((m) => (
          <g key={m.p}>
            <line
              x1="30"
              x2="40"
              y1={m.y}
              y2={m.y}
              stroke="oklch(0.92 0.03 220)"
              strokeWidth="1.5"
            />
            <text
              x="44"
              y={m.y + 3}
              fontSize="10"
              fill="oklch(0.85 0.04 230)"
              fontFamily="monospace"
            >
              {m.p}%
            </text>
          </g>
        ))}
        {/* shine */}
        <path d="M44 80 q-4 80 4 160" stroke="#fff" strokeWidth="6" opacity="0.18" fill="none" />
      </svg>
    </motion.div>
  );
}

/** Coffee pot tilting + pouring stream when `pouring` is true */
export function CoffeePot({ pouring }: { pouring: boolean }) {
  return (
    <motion.div
      className="absolute -top-8 left-1/2 -translate-x-[72%] origin-bottom-right"
      animate={{ rotate: pouring ? 35 : -15, x: pouring ? "42%" : "0%" }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <svg viewBox="0 0 140 140" className="h-32 w-32">
        <defs>
          <linearGradient id="pot" x1="0" x2="1">
            <stop offset="0" stopColor="#4a2a14" />
            <stop offset="0.5" stopColor="#7a4a22" />
            <stop offset="1" stopColor="#3a1c08" />
          </linearGradient>
        </defs>
        {/* body */}
        <path
          d="M40 50 h70 q10 0 10 12 v45 q0 15 -15 15 h-60 q-15 0 -15 -15 v-45 q0 -12 10 -12z"
          fill="url(#pot)"
          stroke="#1d0b03"
          strokeWidth="2"
        />
        {/* spout */}
        <path
          d="M110 55 q25 -5 28 8 q-4 4 -28 14"
          fill="url(#pot)"
          stroke="#1d0b03"
          strokeWidth="2"
        />
        {/* handle */}
        <path d="M40 60 q-22 5 -22 25 q0 18 22 22" fill="none" stroke="#1d0b03" strokeWidth="6" />
        {/* lid */}
        <ellipse cx="75" cy="50" rx="40" ry="6" fill="#2a1408" stroke="#1d0b03" strokeWidth="2" />
        <circle cx="75" cy="44" r="4" fill="#c9a84c" />
        {/* shine */}
        <ellipse cx="60" cy="75" rx="5" ry="14" fill="#fff" opacity="0.2" />
      </svg>
      {/* coffee stream */}
      {pouring && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 110 }}
          exit={{ opacity: 0 }}
          className="absolute left-4 top-20 w-1.5 rounded-full"
          style={{
            background: "linear-gradient(180deg, #6b3a16, #3a1c08)",
            transform: "rotate(-35deg)",
            transformOrigin: "top",
          }}
        />
      )}
    </motion.div>
  );
}

/** Glass jar with level marks; objects clip inside */
export function GlassJar({ level, children }: { level: number; children?: React.ReactNode }) {
  const clamped = Math.min(115, Math.max(0, level));
  return (
    <div className="relative h-72 w-56">
      <svg viewBox="0 0 224 288" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="jar-glass" x1="0" x2="1">
            <stop offset="0" stopColor="oklch(0.95 0.02 200)" stopOpacity="0.3" />
            <stop offset="0.5" stopColor="oklch(0.95 0.02 200)" stopOpacity="0.08" />
            <stop offset="1" stopColor="oklch(0.95 0.02 200)" stopOpacity="0.25" />
          </linearGradient>
          <clipPath id="jar-clip">
            <path d="M30 60 q0 -10 10 -10 h144 q10 0 10 10 v200 q0 15 -15 15 h-134 q-15 0 -15 -15z" />
          </clipPath>
        </defs>
        {/* rim */}
        <rect
          x="24"
          y="36"
          width="176"
          height="14"
          rx="4"
          fill="oklch(0.85 0.04 220)"
          opacity="0.55"
        />
        {/* body */}
        <path
          d="M30 60 q0 -10 10 -10 h144 q10 0 10 10 v200 q0 15 -15 15 h-134 q-15 0 -15 -15z"
          fill="url(#jar-glass)"
          stroke="oklch(0.9 0.03 220)"
          strokeWidth="3"
        />
        {/* contents level bg */}
        <g clipPath="url(#jar-clip)">
          <motion.rect
            x="0"
            width="224"
            fill="oklch(0.4 0.08 240)"
            opacity="0.25"
            initial={false}
            animate={{ y: 275 - (clamped / 115) * 215, height: (clamped / 115) * 225 + 20 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          />
        </g>
        {/* level ruler */}
        {[25, 50, 75, 100].map((p) => {
          const y = 275 - (p / 115) * 215;
          return (
            <g key={p}>
              <line
                x1="200"
                x2="210"
                y1={y}
                y2={y}
                stroke="oklch(0.85 0.04 220)"
                strokeWidth="1.5"
              />
              <text
                x="212"
                y={y + 3}
                fontSize="9"
                fill="oklch(0.85 0.04 220)"
                fontFamily="monospace"
              >
                {p}%
              </text>
            </g>
          );
        })}
        {/* shine */}
        <path d="M46 70 q-4 100 4 200" stroke="#fff" strokeWidth="6" opacity="0.18" fill="none" />
      </svg>
      <div className="absolute inset-0" style={{ clipPath: "inset(15% 12% 5% 12% round 6%)" }}>
        {children}
      </div>
    </div>
  );
}
