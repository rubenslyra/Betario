import { useLab } from "@/lib/lab-store";
import { AlertTriangle } from "lucide-react";

export function ReflectiveModal() {
  const show = useLab((s) => s.showReflectiveModal);
  const dismiss = useLab((s) => s.dismissReflective);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-fade-up">
      <div className="glass-panel max-w-md p-6">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h2 className="text-lg font-semibold">Pausa reflexiva</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Antes de continuar, observe o relatório parcial. O objetivo deste
          laboratório não é repetir jogadas, mas entender como a repetição muda
          a percepção.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <a
            href="/report"
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Ver relatório
          </a>
          <button
            onClick={dismiss}
            className="flex-1 rounded-lg border border-border bg-glass px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Continuar simulação educativa
          </button>
        </div>
      </div>
    </div>
  );
}
