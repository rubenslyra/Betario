import { useId, useState, type ReactNode } from "react";
import { Table2, ChevronDown, ChevronUp } from "lucide-react";

export type ChartTableColumn = {
  key: string;
  label: string;
  numeric?: boolean;
  format?: (v: unknown) => string;
};

export type ChartTableRow = Record<string, string | number>;

/**
 * Renders an accessible, keyboard-friendly companion data table for any chart.
 * Includes an aria-summary describing the dataset for screen readers, even when
 * collapsed, and a toggleable visual view.
 */
export function AccessibleChartTable({
  title,
  caption,
  summary,
  columns,
  rows,
  defaultOpen = false,
  children,
}: {
  title: string;
  caption: string;
  summary: string;
  columns: ChartTableColumn[];
  rows: ChartTableRow[];
  defaultOpen?: boolean;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const tableId = `${id}-table`;

  const fmt = (col: ChartTableColumn, v: unknown) => {
    if (col.format) return col.format(v);
    if (typeof v === "number") return col.numeric ? v.toFixed(2) : String(v);
    return String(v ?? "—");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="sr-only" aria-live="polite">
          {summary}
        </span>
        {children ? <div className="flex-1">{children}</div> : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">{caption}</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={tableId}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-glass px-2 py-1 text-[11px] text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Table2 className="h-3 w-3" aria-hidden="true" />
          {open ? "Ocultar tabela" : "Mostrar tabela"}
          {open ? (
            <ChevronUp className="h-3 w-3" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
          )}
        </button>
      </div>

      {open && (
        <div
          id={tableId}
          className="overflow-x-auto rounded-md border border-border bg-panel-soft/50"
        >
          <table className="w-full text-xs" aria-label={title}>
            <caption className="sr-only">
              {title}. {summary}
            </caption>
            <thead className="bg-glass text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className={`px-3 py-2 ${c.numeric ? "text-right" : "text-left"}`}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-4 text-center text-muted-foreground"
                  >
                    Sem dados ainda.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={i} className="border-t border-border/40">
                    {columns.map((c, j) => (
                      <td
                        key={c.key}
                        className={`px-3 py-1.5 ${c.numeric ? "text-right font-mono" : "text-left"}`}
                        {...(j === 0 ? { scope: "row" as const } : {})}
                      >
                        {fmt(c, row[c.key])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
