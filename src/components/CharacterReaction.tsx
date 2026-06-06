type Mood = "sad" | "relieved" | "happy";

const phrases: Record<Mood, string[]> = {
  sad: [
    "Observe o padrão.",
    "Compare com o relatório.",
    "Reflita antes de repetir.",
  ],
  relieved: [
    "Quase acerto não é garantia.",
    "Veja como a percepção pode enganar.",
    "Proximidade visual não muda a probabilidade.",
  ],
  happy: [
    "Ganhos no curto prazo não explicam o sistema.",
    "Observe o padrão.",
    "Compare com o relatório.",
  ],
};

export function CharacterReaction({ mood, message }: { mood: Mood; message?: string }) {
  const eyes =
    mood === "sad" ? "M8 14 Q10 12 12 14 M18 14 Q20 12 22 14" : "M8 12 L12 12 M18 12 L22 12";
  const mouth =
    mood === "happy"
      ? "M10 20 Q15 24 20 20"
      : mood === "sad"
        ? "M10 22 Q15 18 20 22"
        : "M10 21 L20 21";
  const color =
    mood === "happy" ? "var(--success)" : mood === "sad" ? "var(--danger)" : "var(--gold)";

  const phrase = message ?? phrases[mood][Math.floor(Math.random() * phrases[mood].length)];

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-panel-soft/60 p-3 animate-fade-up">
      <svg viewBox="0 0 30 30" className="h-12 w-12 shrink-0">
        <circle cx="15" cy="15" r="13" fill="var(--panel)" stroke={color} strokeWidth="1.5" />
        <path d={eyes} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d={mouth} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
      <p className="text-sm leading-snug text-foreground">{phrase}</p>
    </div>
  );
}
