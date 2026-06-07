import { useState } from "react";
import { useLab } from "@/lib/lab-store";
import { Check, Copy, QrCode, ArrowRight, Wallet, X } from "lucide-react";

type Step = "pix" | "confirm" | "done";

const PIX_KEY = "betraylab@assincronamente.com.br";

export function PixDepositModal({
  onClose,
  blocking,
}: {
  onClose: () => void;
  blocking?: boolean;
}) {
  const [step, setStep] = useState<Step>("pix");
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const pixDeposit = useLab((s) => s.pixDeposit);

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text manually
    }
  };

  const handleConfirm = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    pixDeposit(val);
    setStep("done");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-panel p-6 shadow-2xl">
        {!blocking && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {step === "pix" && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="mb-2 inline-flex rounded-full bg-primary/15 p-2.5">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Depósito via PIX</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Escaneie o código ou copie a chave para simular um depósito.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-background">
                <div className="text-center">
                  <QrCode className="mx-auto h-12 w-12 text-primary/40" />
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    QR code simulado
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-glass p-3">
              <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                Chave PIX (copia e cola)
              </div>
              <div className="flex items-center justify-between gap-2">
                <code className="truncate font-mono text-xs">{PIX_KEY}</code>
                <button
                  type="button"
                  onClick={copyKey}
                  className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs transition hover:bg-glass"
                >
                  {copied ? (
                    <span className="flex items-center gap-1 text-success">
                      <Check className="h-3 w-3" /> Copiado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Copy className="h-3 w-3" /> Copiar
                    </span>
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep("confirm")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Já paguei
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="mb-2 inline-flex rounded-full bg-primary/15 p-2.5">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Confirmar depósito</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Informe o valor que você depositou.
              </p>
            </div>

            <div>
              <label
                htmlFor="pix-amount"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Valor (R$)
              </label>
              <input
                id="pix-amount"
                type="number"
                min="1"
                step="1"
                placeholder="10,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-lg text-center focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!amount || parseFloat(amount) <= 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-success py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-40"
            >
              Confirmar depósito
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-5 text-center">
            <div className="inline-flex rounded-full bg-success/15 p-3">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-lg font-semibold">Depósito confirmado!</h2>
            <p className="text-sm text-muted-foreground">
              R$ {parseFloat(amount).toFixed(2)} adicionados ao seu saldo.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Começar a jogar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
