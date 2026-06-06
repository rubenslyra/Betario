import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Scale, X } from "lucide-react";

const messages: Record<string, string> = {
  "/": "Este é um laboratório educacional. Não há dinheiro real, saque real ou aposta real.",
  "/experiments":
    "Resultado simulado: observe a lógica, não a recompensa. Saldo visual pode diferir do realmente sacável.",
  "/experiments/symbols":
    "Quase acerto pode influenciar a percepção, mas não muda a matemática do sistema.",
  "/experiments/coffee":
    "Resultado simulado: observe a lógica, não a recompensa. Percepção de controle não muda a probabilidade.",
  "/experiments/capacity":
    "Resultado simulado: a percepção visual pode enganar a estimativa de volume.",
  "/ledger":
    "O ledger registra eventos como livro-razão. Saldo visual pode ser diferente de saldo realmente sacável.",
  "/report":
    "O objetivo é interpretar padrões, fricções e riscos de design — não recompensas.",
  "/sources":
    "As referências apresentadas servem como base educacional para discussão crítica.",
};

export function LegalRiskSnackbar() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const matched =
      Object.keys(messages)
        .filter((k) => (k === "/" ? pathname === "/" : pathname.startsWith(k)))
        .sort((a, b) => b.length - a.length)[0] ?? "/";
    setMessage(messages[matched]);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 9000);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!visible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 animate-fade-up"
    >
      <div className="glass-panel flex items-start gap-3 p-3 pr-2">
        <Scale className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
        <p className="flex-1 text-[12px] leading-snug text-foreground/90">{message}</p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="rounded p-1 text-muted-foreground hover:bg-glass hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Fechar aviso legal"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
