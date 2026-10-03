import type { ReactNode } from "react";
import Figure from "@/components/figures/Figure";

/**
 * An array drawn as a row of boxes with the index under each one. `marks` puts a label
 * (like "i" or "max") above a box; `highlight` tints boxes. Strings work too — pass the
 * characters as `values`.
 */
export default function ArrayBoxes({
  values,
  name,
  highlight = [],
  marks = {},
  caption,
  note,
}: {
  values: (string | number)[];
  name?: string;
  highlight?: number[];
  marks?: Record<number, string>;
  caption: string;
  note?: string;
  children?: ReactNode;
}) {
  return (
    <Figure caption={caption} note={note}>
      <div className="overflow-x-auto" data-no-glossary>
        <div className="flex items-end gap-2">
          {name ? <div className="mr-2 self-center font-mono text-[0.85rem] text-sky">{name} =</div> : null}
          {values.map((v, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-5 font-mono text-[0.68rem] text-amber-300">{marks[i] ?? ""}</div>
              <div
                className={`flex h-11 min-w-11 items-center justify-center rounded-md border px-2 font-mono text-[0.95rem] ${
                  highlight.includes(i) ? "border-sky bg-sky-soft text-sky-strong" : "border-line bg-bg-code text-ink"
                }`}
              >
                {typeof v === "string" ? `"${v}"` : v}
              </div>
              <div className="mt-1 font-mono text-[0.7rem] text-ink-dim">{i}</div>
            </div>
          ))}
        </div>
        <div className="mt-1 font-mono text-[0.68rem] text-ink-dim">↑ index (position), always starting at 0</div>
      </div>
    </Figure>
  );
}
