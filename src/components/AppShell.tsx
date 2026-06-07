import { Link, useRouterState } from "@tanstack/react-router";
import { EducationalBanner } from "./EducationalBanner";
import { ReflectiveModal } from "./ReflectiveModal";
import { AdminPanel } from "./AdminPanel";
import { AuthScreen } from "./AuthScreen";
import {
  Beaker,
  BookOpen,
  FileText,
  FlaskConical,
  Home,
  ScrollText,
  LogOut,
  LogIn,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useHydrateLab } from "@/hooks/use-hydrate-lab";
import { useLab } from "@/lib/lab-store";

const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/experiments", label: "Experimentos", icon: FlaskConical },
  { to: "/ledger", label: "Ledger", icon: ScrollText },
  { to: "/report", label: "Relatório", icon: FileText },
  { to: "/sources", label: "Fontes", icon: BookOpen },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const adminUnlocked = useLab((s) => s.adminUnlocked);
  const currentUser = useLab((s) => s.currentUser);
  const ready = useLab((s) => s.ready);
  const unlockAdmin = useLab((s) => s.unlockAdmin);
  const logout = useLab((s) => s.logout);
  const [showAuth, setShowAuth] = useState(false);
  useHydrateLab();

  useEffect(() => {
    if (!ready) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        if (adminUnlocked) return;
        const role = currentUser?.role ?? "user";
        if (role === "user") {
          console.log(
            "%c🚫 Acesso negado. Permissão insuficiente.",
            "font-size:14px; font-weight:bold; color: #e63946",
          );
          return;
        }
        const pwd = prompt("Digite a senha de acesso:");
        if (pwd === "admin-super") {
          unlockAdmin();
          const label =
            role === "admin-super" ? "admin-super" : role === "admin" ? "admin" : "mediator";
          console.log(
            `%c🔓 Modo ${label} ativado.`,
            "font-size:16px; font-weight:bold; color: #e63946",
          );
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [adminUnlocked, unlockAdmin, currentUser, ready]);

  if (!ready)
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Carregando…
      </div>
    );

  return (
    <div className="min-h-dvh">
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <EducationalBanner />
      <header className="border-b border-border/60 bg-panel/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5" aria-label="BET-RAY Lab — Início">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
              <Beaker className="h-5 w-5 text-background" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <div>
              <div className="font-mono text-sm font-bold leading-tight tracking-tight">
                BET-<span className="gold-text">RAY</span> Lab
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                @assincronamente
              </div>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
            {navItems.map((it) => {
              const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
              const Icon = it.icon;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-glass hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {it.label}
                </Link>
              );
            })}
            <div className="ml-2 flex items-center gap-2 border-l border-border/60 pl-3">
              {currentUser ? (
                <>
                  <span className="text-[11px] text-muted-foreground">{currentUser.username}</span>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-md p-1 text-muted-foreground transition hover:text-danger"
                    title="Sair"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAuth(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-background transition hover:opacity-90"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Entrar
                </button>
              )}
            </div>
          </nav>
        </div>
        <nav
          className="flex items-center gap-1 overflow-x-auto px-3 pb-2 md:hidden"
          aria-label="Navegação móvel"
        >
          {navItems.map((it) => {
            const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-md px-2.5 py-1 text-xs ${
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground"
                }`}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8">
        {adminUnlocked && (
          <div className="mb-8">
            <AdminPanel />
          </div>
        )}
        {children}
      </main>
      <footer className="mt-16 border-t border-border/60 bg-panel/30 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
          BET-RAY Lab · Laboratório educacional · Sem dinheiro real · Sem apostas reais ·{" "}
          <Link to="/sources" className="text-primary hover:underline">
            Fontes e alertas
          </Link>
        </div>
      </footer>
      <ReflectiveModal />

      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAuth(false)}
              className="absolute right-3 top-3 z-10 rounded-md p-1 text-muted-foreground transition hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <AuthScreen onDone={() => setShowAuth(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
