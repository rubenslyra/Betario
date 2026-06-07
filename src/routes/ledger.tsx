import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLab } from "@/lib/lab-store";

export const Route = createFileRoute("/ledger")({
  head: () => ({ meta: [{ title: "Ledger educacional · Betario" }] }),
  component: LedgerPage,
});

const typeColor: Record<string, string> = {
  DEPOSITO_FICTICIO: "text-primary",
  BONUS_SIMULADO: "text-gold",
  APOSTA_FICTICIA: "text-muted-foreground",
  RESULTADO_SIMULADO: "text-foreground",
  TENTATIVA_SAQUE: "text-warning",
  SAQUE_SIMULADO: "text-success",
  FRICCAO_DE_SAQUE: "text-danger",
  ALERTA_EDUCACIONAL: "text-amber",
};

function LedgerPage() {
  const events = useLab((s) => s.events);
  return (
    <AppShell>
      <h1 className="mb-1 text-3xl font-bold">Ledger educacional</h1>
      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        Livro-razão educacional. Registra eventos fictícios para mostrar como saldo visual, bônus,
        saldo sacável e fricções podem ser separados dentro de uma plataforma. Inspirado em
        blockchain, sem usar blockchain real.
      </p>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] font-mono text-xs">
            <thead className="bg-panel-soft text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Usuário</th>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-right">Valor</th>
                <th className="px-3 py-2 text-right">Antes</th>
                <th className="px-3 py-2 text-right">Depois</th>
                <th className="px-3 py-2 text-left">Origem → Destino</th>
                <th className="px-3 py-2 text-left">Horário</th>
                <th className="px-3 py-2 text-left">Nota</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t border-border/40 hover:bg-glass">
                  <td className="px-3 py-2 text-muted-foreground">{e.id}</td>
                  <td className="px-3 py-2">{e.userId}</td>
                  <td className={`px-3 py-2 font-semibold ${typeColor[e.type] ?? ""}`}>{e.type}</td>
                  <td className="px-3 py-2 text-right">R$ {e.amount.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">
                    {e.beforeBalance.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">{e.afterBalance.toFixed(2)}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {e.source} → {e.target}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(e.timestamp).toLocaleTimeString("pt-BR")}
                  </td>
                  <td className="max-w-[280px] px-3 py-2 text-muted-foreground">{e.note}</td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">
                    Nenhum evento registrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
