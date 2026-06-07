import type { ExperimentKey } from "@/lib/lab-store";
import { useLab, experimentLabels } from "@/lib/lab-store";
import { RotateCcw } from "lucide-react";

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center justify-between text-xs font-medium">
        <span>{label}</span>
        <span className="font-mono text-primary">{format(value)}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-primary"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ExperimentControls({ experiment }: { experiment: ExperimentKey }) {
  const exp = useLab((s) => s.experiments[experiment]);
  const setParams = useLab((s) => s.setParams);
  const resetExperiment = useLab((s) => s.resetExperiment);
  const activePresetId = exp.activePresetId;
  const activePreset = useLab((s) =>
    activePresetId ? s.presets.find((p) => p.id === activePresetId) : null,
  );
  const p = exp.params;

  return (
    <section aria-labelledby={`params-${experiment}`} className="glass-panel space-y-4 p-5">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h3 id={`params-${experiment}`} className="text-sm font-semibold">
            Parâmetros — {experimentLabels[experiment]}
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Preset ativo:{" "}
            <span className={activePreset ? "text-primary" : "text-muted-foreground"}>
              {activePreset ? activePreset.name : "personalizado"}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => resetExperiment(experiment)}
          aria-label="Reiniciar estatísticas deste experimento"
          className="inline-flex items-center gap-1 rounded-md border border-border bg-glass px-2 py-1 text-[11px] text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Reiniciar
        </button>
      </header>

      <Slider
        id={`round-${experiment}`}
        label="Limite de rodadas"
        value={p.roundLimit}
        min={0}
        max={50}
        step={1}
        format={(v) => (v === 0 ? "ilimitado" : `${v} rodadas`)}
        onChange={(v) => setParams(experiment, { roundLimit: v })}
        hint="A cada limite, abre-se a pausa reflexiva."
      />
      <Slider
        id={`win-${experiment}`}
        label="Probabilidade de acerto"
        value={p.winChance}
        min={0}
        max={0.5}
        step={0.01}
        format={(v) => `${(v * 100).toFixed(0)}%`}
        onChange={(v) => setParams(experiment, { winChance: v })}
        hint="Modelo educativo: chance de resultado 'acerto'."
      />
      <Slider
        id={`near-${experiment}`}
        label="Probabilidade de quase acerto"
        value={p.nearMissChance}
        min={0}
        max={0.6}
        step={0.01}
        format={(v) => `${(v * 100).toFixed(0)}%`}
        onChange={(v) => setParams(experiment, { nearMissChance: v })}
        hint="Quase acerto não muda a expectativa matemática."
      />
      <Slider
        id={`bonus-${experiment}`}
        label="Bônus fracionado (depósitos < R$50)"
        value={p.bonusFraction}
        min={0}
        max={5}
        step={0.01}
        format={(v) => `R$ ${v.toFixed(2)}`}
        onChange={(v) => setParams(experiment, { bonusFraction: v })}
        hint="Bônus simulado não-sacável."
      />
    </section>
  );
}
