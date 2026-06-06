type Mood = "neutral" | "sad" | "relieved" | "happy";

const defaults: Record<Mood, string> = {
  neutral: "Pronto para o próximo experimento. Observe a lógica.",
  sad: "Observe o resultado.",
  relieved: "Foi perto, mas quase acerto não é garantia.",
  happy: "Boa leitura! Agora compare com o relatório.",
};

// Backwards-compatible alias: components still pass "sad" | "relieved" | "happy"
export function CharacterReaction({
  mood,
  message,
}: {
  mood: "sad" | "relieved" | "happy" | "neutral";
  message?: string;
}) {
  const m: Mood = mood;
  const ring =
    m === "happy"
      ? "var(--success)"
      : m === "sad"
        ? "var(--danger)"
        : m === "relieved"
          ? "var(--gold)"
          : "var(--primary)";
  const bulbFill =
    m === "happy" ? "var(--success)" : m === "relieved" ? "var(--gold)" : "var(--primary)";

  const phrase = message ?? defaults[m];

  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-border bg-panel-soft/70 p-3 shadow-inner animate-fade-up"
      role="img"
      aria-label={`Mascote do laboratório: ${phrase}`}
    >
      <div className="relative h-14 w-14 shrink-0">
        <svg viewBox="0 0 64 64" className="h-full w-full">
          {/* glow */}
          <circle cx="32" cy="28" r="22" fill={bulbFill} opacity="0.18" />
          {/* bulb */}
          <path
            d="M20 28a12 12 0 1 1 24 0c0 5-3 7-4 10v4H24v-4c-1-3-4-5-4-10z"
            fill="var(--panel)"
            stroke={ring}
            strokeWidth="2"
          />
          {/* filament/heart */}
          <circle cx="32" cy="26" r="3" fill={bulbFill} opacity="0.9" />
          {/* base */}
          <rect x="24" y="44" width="16" height="3" rx="1" fill={ring} />
          <rect x="26" y="48" width="12" height="3" rx="1" fill={ring} opacity="0.7" />
          <rect x="28" y="52" width="8" height="3" rx="1.5" fill={ring} opacity="0.5" />
          {/* eyes */}
          {m === "sad" ? (
            <>
              <path d="M26 28 q2 -2 4 0" stroke="var(--background)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M34 28 q2 -2 4 0" stroke="var(--background)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </>
          ) : m === "happy" ? (
            <>
              <path d="M26 27 q2 2 4 0" stroke="var(--background)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M34 27 q2 2 4 0" stroke="var(--background)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="28" cy="27" r="1.4" fill="var(--background)" />
              <circle cx="36" cy="27" r="1.4" fill="var(--background)" />
            </>
          )}
          {/* mouth */}
          {m === "happy" ? (
            <path d="M28 32 q4 4 8 0" stroke="var(--background)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          ) : m === "sad" ? (
            <path d="M28 34 q4 -3 8 0" stroke="var(--background)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M28 33 h8" stroke="var(--background)" strokeWidth="1.6" strokeLinecap="round" />
          )}
        </svg>
      </div>
      <p className="text-sm leading-snug text-foreground">{phrase}</p>
    </div>
  );
}
