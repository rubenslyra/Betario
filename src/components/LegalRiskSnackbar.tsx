import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Scale, X } from "lucide-react";

const messages: Record<string, string> = {
  "/": "Aviso educacional: no Brasil, apostas de quota fixa são disciplinadas por legislação específica e fiscalizadas no âmbito da Secretaria de Prêmios e Apostas. Esta aplicação não realiza apostas reais.",
  "/experiments":
    "Jogo responsável: normas brasileiras tratam de prevenção, identificação e tratamento de comportamentos problemáticos. Este laboratório é apenas educativo.",
  "/ledger":
    "Risco de produto digital: decisões de interface, repetição, recompensa e falta de alerta podem gerar responsabilidade jurídica e danos sociais.",
  "/report":
    "UX persuasiva deve ser estudada com responsabilidade: este sistema demonstra padrões de retenção sem incentivá-los.",
  "/sources":
    "As referências apresentadas servem como base educacional para discussão crítica sobre design persuasivo e regulação.",
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
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 animate-fade-up">
      <div className="glass-panel flex items-start gap-3 p-3 pr-2">
        <Scale className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <p className="flex-1 text-[12px] leading-snug text-foreground/90">{message}</p>
        <button
          onClick={() => setVisible(false)}
          className="rounded p-1 text-muted-foreground hover:bg-glass hover:text-foreground"
          aria-label="Fechar aviso"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
