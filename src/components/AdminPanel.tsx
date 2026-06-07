import { useLab, experimentLabels, type ExperimentKey, type UserRole } from "@/lib/lab-store";
import {
  EyeOff,
  Eye,
  TrendingUp,
  Users,
  Siren,
  Zap,
  Lock,
  BarChart3,
  Trophy,
  Handshake,
  UserCheck,
  UserCog,
  MessagesSquare,
  Star,
  Shield,
  Ban,
} from "lucide-react";
import { useState } from "react";

const ROLE_STYLES: Record<UserRole, { label: string; color: string; icon: typeof Shield }> = {
  "admin-super": { label: "Admin-Super", color: "bg-danger/20 text-danger border-danger/30", icon: Shield },
  admin: { label: "Admin", color: "bg-orange/20 text-orange border-orange/30", icon: UserCog },
  mediator: { label: "Mediator", color: "bg-primary/20 text-primary border-primary/30", icon: MessagesSquare },
  user: { label: "Usuário", color: "bg-muted/20 text-muted-foreground border-border", icon: Eye },
};

function RoleBadge({ role }: { role: UserRole }) {
  const s = ROLE_STYLES[role];
  return (
    <span className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${s.color}`}>
      {s.label}
    </span>
  );
}

function ProgressBar({ current, max, label }: { current: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">
          {current.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-danger/20">
        <div
          className="h-full rounded-full bg-gradient-to-r from-danger to-gold transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children, className }: { title: string; icon: typeof Shield; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-panel-soft/60 p-3 ${className ?? ""}`}>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {title}
      </div>
      {children}
    </div>
  );
}

export function AdminPanel() {
  const role = (useLab((s) => s.currentUser?.role) ?? "user") as UserRole;
  const profile = useLab((s) => s.profile);
  const adminUnlocked = useLab((s) => s.adminUnlocked);
  const currentUser = useLab((s) => s.currentUser);
  const users = useLab((s) => s.users);
  const setProfile = useLab((s) => s.setProfile);
  const lockAdmin = useLab((s) => s.lockAdmin);
  const triggerBatch = useLab((s) => s.triggerBatch);
  const setCurrentUser = useLab((s) => s.setCurrentUser);
  const setUserRole = useLab((s) => s.setUserRole);
  const setUserPromoter = useLab((s) => s.setUserPromoter);
  const houseFunds = useLab((s) => s.houseFunds);
  const totalHouseRevenue = useLab((s) => s.totalHouseRevenue);
  const totalBetsCount = useLab((s) => s.totalBetsCount);
  const batchBetsCounter = useLab((s) => s.batchBetsCounter);
  const batchRevenueCounter = useLab((s) => s.batchRevenueCounter);
  const pendingBatchWins = useLab((s) => s.pendingBatchWins);
  const nextWinPayout = useLab((s) => s.nextWinPayout);
  const experiments = useLab((s) => s.experiments);
  const consecutiveLosses = useLab((s) => s.consecutiveLosses);

  const isSuper = role === "admin-super";
  const isAdmin = role === "admin";
  const isMediator = role === "mediator";
  const canManage = isSuper || isAdmin;
  const canTrigger = isSuper;
  const canOverride = isSuper || isAdmin;
  const canChangeRole = isSuper;
  const [tab, setTab] = useState<"overview" | "users" | "profiles">("overview");

  if (!adminUnlocked) return null;

  const expKeys = Object.keys(experiments) as ExperimentKey[];
  const tabs = [
    { key: "overview" as const, label: "Visão geral", icon: BarChart3, show: true },
    { key: "users" as const, label: "Usuários", icon: Users, show: isSuper || isAdmin || isMediator },
    { key: "profiles" as const, label: "Sessão", icon: UserCheck, show: canOverride },
  ].filter((t) => t.show);

  return (
    <div className="glass-panel relative overflow-hidden border-2 border-danger/40 p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, oklch(0.6 0.2 30 / 0.15), transparent 60%), radial-gradient(circle at 80% 70%, oklch(0.5 0.15 0 / 0.1), transparent 50%)",
        }}
      />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-danger/20">
            <Siren className="h-4 w-4 text-danger" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-danger">Painel da Banca</h3>
            <p className="text-[10px] text-muted-foreground">
              {currentUser?.username ?? "sem sessão"} · <RoleBadge role={role} />
              {currentUser?.promoter && (
                <span className="ml-1 rounded-md border border-gold/30 bg-gold/10 px-1 py-0.5 text-[9px] font-bold text-gold">PROMOTER</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isMediator && (
            <span className="rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
              MODO SUPORTE
            </span>
          )}
          <button
            type="button"
            onClick={lockAdmin}
            className="rounded-md border border-danger/30 bg-danger/10 px-2 py-1 text-[10px] font-semibold text-danger transition hover:bg-danger/20"
          >
            <Lock className="mr-1 inline h-3 w-3" />
            Sair
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
              tab === t.key ? "bg-danger/20 text-danger" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="mr-1 inline h-3 w-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ── */}
      {tab === "overview" && (
        <div className="space-y-4">
          <Section title="Fundo da banca" icon={TrendingUp}>
            <div className="mt-1 font-mono text-3xl font-black tracking-tight text-danger">
              R$ {houseFunds.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              Receita total: R$ {totalHouseRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ·{" "}
              {totalBetsCount.toLocaleString()} apostas
            </div>
          </Section>

          {(isSuper || isAdmin) && (
            <Section title="Próximo lote" icon={Zap}>
              <ProgressBar current={batchBetsCounter} max={10001} label="Apostas" />
              <ProgressBar current={batchRevenueCounter} max={1999999} label="Receita (R$)" />
              {pendingBatchWins > 0 && (
                <div className="mt-2 flex items-center gap-2 rounded-md bg-success/15 p-2">
                  <Trophy className="h-4 w-4 text-success" />
                  <span className="text-xs font-semibold text-success">
                    {pendingBatchWins} vitória(s) pendente(s) · R$ {nextWinPayout} cada
                  </span>
                </div>
              )}
              {canTrigger && (
                <button
                  type="button"
                  onClick={triggerBatch}
                  className="mt-2 w-full rounded-md bg-gold/20 px-3 py-1.5 text-[11px] font-semibold text-gold transition hover:bg-gold/30"
                >
                  Gatilho manual de lote
                </button>
              )}
              {!canTrigger && (
                <div className="mt-2 flex items-center gap-1.5 rounded-md bg-muted/20 p-2 text-[10px] text-muted-foreground">
                  <Ban className="h-3 w-3" />
                  Gatilho manual restrito a admin-super
                </div>
              )}
            </Section>
          )}

          {(isSuper || isAdmin) && (
            <Section title="Parâmetros reais por experimento" icon={BarChart3}>
              {expKeys.map((k) => {
                const p = experiments[k].params;
                const loss = 1 - p.winChance - p.nearMissChance;
                return (
                  <div key={k} className="flex items-center justify-between border-b border-border/40 py-1 last:border-0">
                    <span className="text-[11px] text-muted-foreground">{experimentLabels[k]}</span>
                    <span className="font-mono text-[11px]">
                      <span className="text-success">+{p.winChance * 100}%</span>{" "}
                      <span className="text-gold">~{p.nearMissChance * 100}%</span>{" "}
                      <span className="text-danger">-{loss * 100}%</span>
                    </span>
                  </div>
                );
              })}
            </Section>
          )}

          {(isSuper || isAdmin) && (
            <Section title="Consecutive losses (promoter)" icon={Handshake}>
              <div className="flex gap-3">
                {expKeys.map((k) => (
                  <div key={k} className="flex items-center gap-1.5 rounded-md bg-glass px-2 py-1">
                    <span className="text-[10px] text-muted-foreground">{experimentLabels[k].slice(0, 4)}</span>
                    <span className="font-mono text-sm font-bold">{consecutiveLosses[k]}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {isMediator && (
            <Section title="Usuários cadastrados" icon={Users}>
              <p className="text-xs text-muted-foreground">
                {users.length} usuário(s) no sistema. Acesse a aba <strong>Usuários</strong> para visualizar.
              </p>
            </Section>
          )}
        </div>
      )}

      {/* ── Tab: Users ── */}
      {tab === "users" && (
        <div className="space-y-2">
          {users.map((u) => {
            const isCurrent = currentUser?.id === u.id;
            const isSelfSuper = u.role === "admin-super";
            const userRole = u.role as UserRole;
            const RoleIcon = ROLE_STYLES[userRole]?.icon ?? Eye;
            const cannotEdit = (isMediator) || (!canChangeRole && isSelfSuper);

            return (
              <div
                key={u.id}
                className={`flex items-center justify-between gap-2 rounded-lg border p-2.5 transition ${
                  isCurrent
                    ? "border-danger/50 bg-danger/10"
                    : "border-border/60 bg-panel-soft/40 hover:bg-panel-soft/80"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    u.role === "admin-super"
                      ? "bg-danger/20 text-danger"
                      : u.role === "admin"
                        ? "bg-orange/20 text-orange"
                        : u.role === "mediator"
                          ? "bg-primary/20 text-primary"
                          : "bg-muted/20 text-muted-foreground"
                  }`}>
                    <RoleIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">{u.username}</span>
                      {isCurrent && (
                        <span className="rounded bg-danger/20 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-danger">
                          Ativo
                        </span>
                      )}
                      {u.promoter && (
                        <Star className="h-3 w-3 text-gold" fill="currentColor" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RoleBadge role={userRole} />
                      <span className="font-mono text-[9px] text-muted-foreground">{u.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!isCurrent && canManage && (
                    <button
                      type="button"
                      onClick={() => setCurrentUser(u.id)}
                      className="rounded-md border border-border bg-glass px-2 py-1 text-[10px] font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                      title="Usar este perfil"
                    >
                      <EyeOff className="h-3 w-3" />
                    </button>
                  )}
                  {!cannotEdit && canManage && (
                    <select
                      value={u.role}
                      onChange={(e) => setUserRole(u.id, e.target.value as UserRole)}
                      className="rounded-md border border-border bg-glass px-1.5 py-1 text-[10px] font-mono text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {(["user", "mediator", "admin", "admin-super"] as UserRole[]).map((r) => {
                        const disabled = !canChangeRole && r === "admin-super";
                        return (
                          <option key={r} value={r} disabled={disabled}>{ROLE_STYLES[r].label}{disabled ? " (bloqueado)" : ""}</option>
                        );
                      })}
                    </select>
                  )}
                  {cannotEdit && isMediator && (
                    <span className="rounded-md bg-muted/20 px-2 py-1 text-[10px] text-muted-foreground">
                      <Eye className="mr-0.5 inline h-3 w-3" />
                      só visualização
                    </span>
                  )}
                  {cannotEdit && !isMediator && isSelfSuper && (
                    <span className="rounded-md bg-danger/10 px-2 py-1 text-[10px] text-danger">
                      <Shield className="mr-0.5 inline h-3 w-3" />
                      admin-super
                    </span>
                  )}
                  {canManage && !cannotEdit && (
                    <button
                      type="button"
                      onClick={() => setUserPromoter(u.id, !u.promoter)}
                      className={`rounded-md border px-2 py-1 text-[10px] font-semibold transition ${
                        u.promoter
                          ? "border-gold/40 bg-gold/15 text-gold"
                          : "border-border bg-glass text-muted-foreground hover:text-gold"
                      }`}
                      title={u.promoter ? "Remover promoter" : "Tornar promoter"}
                    >
                      <Star className="h-3 w-3" fill={u.promoter ? "currentColor" : "none"} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab: Profiles (session override) ── */}
      {tab === "profiles" && canOverride && (
        <div className="space-y-4">
          <Section title="Override de sessão" icon={UserCheck}>
            <p className="text-[11px] text-muted-foreground">
              Usuário: <strong className="text-foreground">{currentUser?.username ?? "—"}</strong> ·{" "}
              Papel real: <RoleBadge role={role} />
              {currentUser?.promoter && (
                <span className="ml-1 rounded-md border border-gold/30 bg-gold/10 px-1 py-0.5 text-[9px] font-bold text-gold">PROMOTER</span>
              )}
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["user", "promoter", "admin-super"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProfile(p)}
                  className={`rounded-md border px-2 py-2 text-center text-[11px] font-semibold transition ${
                    profile === p
                      ? p === "admin-super"
                        ? "border-danger bg-danger/20 text-danger"
                        : p === "promoter"
                          ? "border-gold bg-gold/20 text-gold"
                          : "border-primary bg-primary/20 text-primary"
                      : "border-border bg-glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p === "admin-super" ? (
                    <EyeOff className="mx-auto mb-0.5 h-3.5 w-3.5" />
                  ) : p === "promoter" ? (
                    <Star className="mx-auto mb-0.5 h-3.5 w-3.5" />
                  ) : (
                    <Eye className="mx-auto mb-0.5 h-3.5 w-3.5" />
                  )}
                  {p === "admin-super" ? "Admin" : p === "promoter" ? "Promoter" : "Usuário"}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              Override ativo: <strong className="text-foreground">{profile}</strong> ·{" "}
              {profile === "admin-super"
                ? "Probabilidade real"
                : profile === "promoter"
                  ? "Vitória garantida a cada 4 apostas"
                  : "Sistema de lote"}
              <br />
              <span className="italic">Não persiste entre sessões.</span>
            </p>
          </Section>
        </div>
      )}
    </div>
  );
}
