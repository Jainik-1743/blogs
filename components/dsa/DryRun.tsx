import type { ReactNode } from "react";

/**
 * A dry-run table: one row per step, one column per variable. Writing this by hand is how
 * loops become obvious, so every lesson shows at least one. `highlight` marks a row (for
 * example the step where the loop stops).
 */
export default function DryRun({
  title,
  cols,
  rows,
  highlight,
  note,
}: {
  title: string;
  cols: string[];
  rows: ReactNode[][];
  /** Zero-based index of a row to emphasise. */
  highlight?: number;
  note?: ReactNode;
}) {
  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-line bg-bg-elev">
      <figcaption className="border-b border-line px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-dim">
        Dry run · {title}
      </figcaption>
      <div className="overflow-x-auto">
        <table className="my-0 w-full border-collapse font-mono text-[0.84rem]">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c} className="border-b border-line px-3 py-2 text-left font-semibold text-sky">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i === highlight ? "bg-sky-soft" : i % 2 ? "bg-bg-code/40" : ""}>
                {r.map((cell, j) => (
                  <td key={j} className="border-b border-line/60 px-3 py-1.5 text-ink">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note ? <p className="m-0 border-t border-line px-4 py-2 text-[0.85rem] text-ink-dim">{note}</p> : null}
    </figure>
  );
}
