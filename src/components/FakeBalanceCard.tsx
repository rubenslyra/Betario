import { useLab } from "@/lib/lab-store";
import { Wallet, Gift, Eye, BanknoteArrowDown, Lock, Sigma, Plus } from "lucide-react";
import { useState } from "react";
import { PixDepositModal } from "./PixDepositModal";

function Row({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Wallet;
  label: string;
  value: number;
  hint?: string;
  accent?: "primary" | "gold" | "muted" | "danger";
}) {
  const color =
    accent === "gold"
      ? "text-gold"
      : accent === "primary"
        ? "text-primary"
        : accent === "danger"
          ? "text-danger"
          : "text-foreground";
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-2 last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <div>
          <div className="text-xs font-medium">{label}</div>
          {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
        </div>
      </div>
      <div className={`font-mono text-sm font-semibold ${color}`}>R$ {value.toFixed(2)}</div>
    </div>
  );
}

export function FakeBalanceCard() {
  const b = useLab((s) => s.balances);
  const currentUser = useLab((s) => s.currentUser);
  const [showDeposit, setShowDeposit] = useState(false);
  return (
    <div className="glass-panel p-4">
      {showDeposit && <PixDepositModal onClose={() => setShowDeposit(false)} />}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Saldos fictícios</h3>
        <span className="rounded bg-warning/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-warning">
          simulado
        </span>
      </div>
      <Row icon={Wallet} label="Depositado" value={b.deposited} accent="primary" />
      <Row icon={Gift} label="Bônus" value={b.bonus} accent="gold" hint="Não sacável" />
      <Row icon={Eye} label="Saldo visual" value={b.visual} hint="O que o usuário vê" />
      <Row
        icon={BanknoteArrowDown}
        label="Sacável"
        value={b.withdrawable}
        accent="primary"
        hint="O que realmente sai"
      />
      <Row icon={Lock} label="Bloqueado" value={b.blocked} accent="danger" />
      <Row icon={Sigma} label="Fracionado" value={b.fractional} hint="Centavos residuais" />
      <p className="mt-3 rounded-md bg-glass p-2 text-[11px] leading-snug text-muted-foreground">
        Saldo visual não é saldo sacável. Bônus simulado pode aumentar a percepção de
        disponibilidade sem mudar o valor real retirável.
      </p>
      {currentUser && (
        <button
          type="button"
          onClick={() => setShowDeposit(true)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-background transition hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Depositar via PIX
        </button>
      )}
    </div>
  );
}
