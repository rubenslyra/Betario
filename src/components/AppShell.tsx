import { Link, useRouterState } from "@tanstack/react-router";
import { EducationalBanner } from "./EducationalBanner";
import { ReflectiveModal } from "./ReflectiveModal";
import { Beaker, BookOpen, FileText, FlaskConical, Home, ScrollText } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/experiments", label: "Experimentos", icon: FlaskConical },
  { to: "/ledger", label: "Ledger", icon: ScrollText },
  { to: "/report", label: "Relatório", icon: FileText },
  { to: "/sources", label: "Fontes", icon: BookOpen },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen">
      <EducationalBanner />
      <header className="border-b border-border/60 bg-panel/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
              <Beaker className="h-5 w-5 text-background" strokeWidth={2.5} />
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
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((it) => {
              const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
              const Icon = it.icon;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-glass hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {it.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto px-3 pb-2 md:hidden">
          {navItems.map((it) => {
            const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
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
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <footer className="mt-16 border-t border-border/60 bg-panel/30 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
          BET-RAY Lab · Laboratório educacional · Sem dinheiro real · Sem apostas reais ·{" "}
          <Link to="/sources" className="text-primary hover:underline">
            Fontes e alertas
          </Link>
        </div>
      </footer>
      <ReflectiveModal />
    </div>
  );
}
