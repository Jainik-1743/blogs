import type { ReactNode } from "react";

/**
 * "Make it stick": things to do with the page closed. Recalling from memory, spaced over a
 * few days, is what moves an idea into long-term memory — re-reading does almost nothing.
 */
export default function Recall({ items }: { items: ReactNode[] }) {
  return (
    <section className="my-8 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-5 py-4" aria-label="Make it stick">
      <div className="mb-2 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-emerald-300">
        Make it stick — close this page, then
      </div>
      <ol className="mb-3 mt-0 list-decimal pl-5 marker:text-emerald-300">
        {items.map((it, i) => (
          <li key={i} className="my-1 text-ink">
            {it}
          </li>
        ))}
      </ol>
      <p className="m-0 text-[0.88rem] text-ink-dim">
        Revisit schedule: solve two of the questions again <strong>tomorrow</strong>, again in{" "}
        <strong>3 days</strong>, and once more in <strong>a week</strong> — without looking at the
        answers. Each time it will feel easier. That is the memory forming.
      </p>
    </section>
  );
}
