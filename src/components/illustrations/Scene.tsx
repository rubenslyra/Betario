import { motion } from "framer-motion";

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
