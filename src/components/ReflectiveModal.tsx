import { useEffect, useRef } from "react";
import { useLab } from "@/lib/lab-store";
import { AlertTriangle } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ReflectiveModal() {
  const show = useLab((s) => s.showReflectiveModal);
  const dismiss = useLab((s) => s.dismissReflective);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!show) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lastFocus.current?.focus?.();
    };
  }, [show, dismiss]);

  if (!show) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reflective-title"
      aria-describedby="reflective-desc"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm animate-fade-up"
    >
      <div className="glass-panel max-w-md p-6">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
          <h2 id="reflective-title" className="text-lg font-semibold">
            Pausa reflexiva
          </h2>
        </div>
        <p id="reflective-desc" className="text-sm leading-relaxed text-muted-foreground">
          Antes de continuar, observe o relatório parcial. O objetivo deste laboratório não é
          repetir jogadas, mas entender como a repetição muda a percepção.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/report"
            onClick={dismiss}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Ver relatório
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={dismiss}
            className="flex-1 rounded-lg border border-border bg-glass px-4 py-2 text-sm font-medium text-foreground transition hover:bg-panel-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Continuar simulação educativa
          </button>
        </div>
      </div>
    </div>
  );
}
