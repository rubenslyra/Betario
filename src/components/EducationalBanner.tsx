export function EducationalBanner() {
  return (
    <div
      role="region"
      aria-label="Aviso educacional fixo"
      className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-1 px-4 py-2 sm:flex-row sm:items-center sm:gap-4">
        <span className="inline-flex items-center gap-2 rounded-md bg-warning/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-warning">
          <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
          Aplicação Educacional
        </span>
        <p className="text-xs leading-snug text-muted-foreground sm:text-[13px]">
          Este laboratório usa saldo fictício para explicar probabilidade, UX persuasiva e riscos
          digitais.
          <span className="hidden sm:inline">
            {" "}
            Não é bet, não aceita dinheiro real e não recomenda apostas.
          </span>
        </p>
      </div>
    </div>
  );
}
