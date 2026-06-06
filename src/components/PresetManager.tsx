import { useState } from "react";
import { useLab, experimentLabels, type ExperimentKey } from "@/lib/lab-store";
import { Bookmark, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PresetManager({ experiment }: { experiment: ExperimentKey }) {
  const presets = useLab((s) => s.presets.filter((p) => p.experiment === experiment));
  const active = useLab((s) => s.experiments[experiment].activePresetId);
  const savePreset = useLab((s) => s.savePreset);
  const applyPreset = useLab((s) => s.applyPreset);
  const deletePreset = useLab((s) => s.deletePreset);

  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    savePreset(experiment, name);
    setName("");
    setOpen(false);
  };

  return (
    <section
      className="glass-panel space-y-3 p-5"
      aria-labelledby={`presets-${experiment}`}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-gold" aria-hidden="true" />
          <h3 id={`presets-${experiment}`} className="text-sm font-semibold">
            Presets — {experimentLabels[experiment]}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`presets-form-${experiment}`}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-glass px-2 py-1 text-[11px] text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          Novo
        </button>
      </header>

      <AnimatePresence initial={false}>
        {open && (
          <motion.form
            id={`presets-form-${experiment}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="flex gap-2 overflow-hidden"
          >
            <label htmlFor={`preset-name-${experiment}`} className="sr-only">
              Nome do preset
            </label>
            <input
              id={`preset-name-${experiment}`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: cenário conservador"
              className="flex-1 rounded-md border border-border bg-panel-soft px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoFocus
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-background hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Salvar
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {presets.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">
          Nenhum preset salvo. Ajuste os parâmetros e clique em <strong>Novo</strong> para guardar uma configuração.
        </p>
      ) : (
        <ul className="space-y-1.5" aria-label={`Presets para ${experimentLabels[experiment]}`}>
          {presets.map((p) => {
            const isActive = p.id === active;
            return (
              <li key={p.id}>
                <div
                  className={`flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-xs transition ${
                    isActive
                      ? "border-primary/60 bg-primary/10"
                      : "border-border bg-panel-soft/60 hover:border-border/80"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    aria-pressed={isActive}
                    className="flex-1 truncate text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    title={`P(win) ${(p.params.winChance * 100).toFixed(0)}% · P(quase) ${(p.params.nearMissChance * 100).toFixed(0)}% · Limite ${p.params.roundLimit || "∞"}`}
                  >
                    <span className={isActive ? "text-primary font-semibold" : "text-foreground"}>
                      {p.name}
                    </span>
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                      {(p.params.winChance * 100).toFixed(0)}/
                      {(p.params.nearMissChance * 100).toFixed(0)}%
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePreset(p.id)}
                    aria-label={`Excluir preset ${p.name}`}
                    className="rounded p-1 text-muted-foreground transition hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
