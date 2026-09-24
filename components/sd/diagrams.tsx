import type { ReactNode } from "react";
import Figure from "@/components/figures/Figure";

/**
 * Static diagrams for the System Design series. Each one is written in the Markdown as a
 * fenced block (```flow, ```compare, ```layers …) and parsed in Markdown.tsx; these
 * components only draw. They all use the accent token, so they follow SD_ACCENT.
 */

export type FlowNode = { title: ReactNode; desc?: ReactNode; label?: ReactNode; tone?: Tone };
export type Tone = "accent" | "good" | "bad" | "warn" | "muted";

const TONE: Record<Tone, string> = {
  accent: "border-l-sky",
  good: "border-l-emerald-400",
  bad: "border-l-red-400",
  warn: "border-l-amber-400",
  muted: "border-l-line",
};

const TONE_CHIP: Record<Tone, string> = {
  accent: "border-sky/50 bg-sky-soft text-sky-strong",
  good: "border-emerald-400/50 bg-emerald-400/10 text-emerald-200",
  bad: "border-red-400/50 bg-red-400/10 text-red-200",
  warn: "border-amber-400/50 bg-amber-400/10 text-amber-200",
  muted: "border-line bg-bg-code text-ink-dim",
};

/** A vertical (or wrapped horizontal) chain of steps joined by arrows. */
export function Flow({ nodes, dir = "col", caption }: { nodes: FlowNode[]; dir?: "col" | "row"; caption: string }) {
  if (dir === "row") {
    return (
      <Figure caption={caption} note="flow">
        <ol className="m-0 flex list-none flex-wrap items-stretch gap-y-3 p-0">
          {nodes.map((n, i) => (
            <li key={i} className="flex items-center">
              {i > 0 ? (
                <span className="flex flex-col items-center px-2 text-sky" aria-hidden="true">
                  {n.label ? (
                    <span className="font-mono text-[0.62rem] uppercase tracking-[0.06em] text-ink-dim">{n.label}</span>
                  ) : null}
                  <span className="text-[1.1rem] leading-none">→</span>
                </span>
              ) : null}
              <div className={`rounded-lg border px-3 py-2 text-center ${TONE_CHIP[n.tone ?? "accent"]}`}>
                <div className="text-[0.9rem] font-semibold text-ink">{n.title}</div>
                {n.desc ? <div className="text-[0.75rem] text-ink-dim">{n.desc}</div> : null}
              </div>
            </li>
          ))}
        </ol>
      </Figure>
    );
  }
  return (
    <Figure caption={caption} note="flow">
      <ol className="m-0 list-none p-0">
        {nodes.map((n, i) => (
          <li key={i} className="m-0">
            {i > 0 ? (
              <div className="ml-5 flex items-center gap-3" aria-hidden="true">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-0.5 bg-sky/50" />
                  <div className="text-[0.7rem] leading-none text-sky">▼</div>
                </div>
                {n.label ? <span className="font-mono text-[0.7rem] text-ink-dim">{n.label}</span> : null}
              </div>
            ) : null}
            <div
              className={`flex items-start gap-3 rounded-lg border border-line border-l-[3px] bg-bg-code px-4 py-2.5 ${TONE[n.tone ?? "accent"]}`}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-soft font-mono text-[0.7rem] font-bold text-sky">
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-slate-50">{n.title}</div>
                {n.desc ? <div className="text-[0.9rem] text-ink-dim">{n.desc}</div> : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Figure>
  );
}

export type CompareColumn = {
  title: ReactNode;
  items: { sign: "+" | "-" | "·"; text: ReactNode }[];
  verdict?: ReactNode;
};

/** Two to four options side by side, with pros (+), cons (−) and a one-line verdict each. */
export function Compare({ columns, caption }: { columns: CompareColumn[]; caption: string }) {
  const cols = columns.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <Figure caption={caption} note="compare">
      <div className={`grid grid-cols-1 gap-3 ${columns.length === 4 ? "sm:grid-cols-2" : cols}`}>
        {columns.map((c, i) => (
          <div key={i} className="flex flex-col rounded-lg border border-line bg-bg-code">
            <div className="rounded-t-lg border-b border-line bg-sky-soft px-4 py-2 font-semibold text-sky-strong">
              {c.title}
            </div>
            <ul className="m-0 flex-1 list-none space-y-1.5 px-4 py-3 text-[0.9rem]">
              {c.items.map((it, j) => (
                <li key={j} className="m-0 flex gap-2">
                  <span
                    className={`mt-[0.1rem] flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[0.75rem] font-bold ${
                      it.sign === "+"
                        ? "bg-emerald-400/15 text-emerald-300"
                        : it.sign === "-"
                          ? "bg-red-400/15 text-red-300"
                          : "bg-sky-soft text-sky"
                    }`}
                    aria-label={it.sign === "+" ? "pro" : it.sign === "-" ? "con" : undefined}
                  >
                    {it.sign === "+" ? "+" : it.sign === "-" ? "−" : "•"}
                  </span>
                  <span className="min-w-0">{it.text}</span>
                </li>
              ))}
            </ul>
            {c.verdict ? (
              <div className="border-t border-line px-4 py-2 text-[0.85rem] text-ink-dim">
                <span className="mr-1 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-sky">Use when</span>
                {c.verdict}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Figure>
  );
}

export type Layer = { name: ReactNode; tech?: ReactNode; desc?: ReactNode };

/** A stack of layers, top to bottom — network layers, request tiers, the test pyramid. */
export function Layers({ layers, caption }: { layers: Layer[]; caption: string }) {
  const n = layers.length;
  return (
    <Figure caption={caption} note="layers">
      <div className="flex flex-col gap-1.5">
        {layers.map((l, i) => (
          <div
            key={i}
            className="grid grid-cols-[minmax(7rem,11rem)_1fr] items-center gap-x-4 rounded-lg border border-sky/30 px-4 py-2.5 max-sm:grid-cols-1"
            style={{
              background: `color-mix(in oklab, var(--color-sky) ${Math.round(22 - (i * 16) / Math.max(n - 1, 1))}%, var(--color-bg-code))`,
            }}
          >
            <div className="font-semibold text-slate-50">{l.name}</div>
            <div className="text-[0.9rem]">
              {l.tech ? <span className="font-mono text-sky-strong">{l.tech}</span> : null}
              {l.tech && l.desc ? <span className="text-ink-dim"> — </span> : null}
              {l.desc ? <span className="text-ink-dim">{l.desc}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </Figure>
  );
}

export type Stat = { value: ReactNode; label: ReactNode; sub?: ReactNode };

/** Big-number tiles for the figures worth remembering. */
export function Stats({ stats, caption }: { stats: Stat[]; caption: string }) {
  return (
    <Figure caption={caption} note="numbers">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div key={i} className="rounded-lg border border-line bg-bg-code px-4 py-3">
            <div className="font-mono text-[1.35rem] font-bold leading-tight text-sky">{s.value}</div>
            <div className="text-[0.88rem] font-semibold text-ink">{s.label}</div>
            {s.sub ? <div className="text-[0.8rem] text-ink-dim">{s.sub}</div> : null}
          </div>
        ))}
      </div>
    </Figure>
  );
}

export type TimelineEvent = { time: ReactNode; text: ReactNode; tone?: Tone };

/** Events in order — incident timelines, cache stampedes, deploy rollouts. */
export function Timeline({ events, caption }: { events: TimelineEvent[]; caption: string }) {
  return (
    <Figure caption={caption} note="timeline">
      <ol className="relative m-0 list-none border-l-2 border-sky/30 p-0 pl-5">
        {events.map((e, i) => {
          const dot =
            e.tone === "bad"
              ? "bg-red-400"
              : e.tone === "good"
                ? "bg-emerald-400"
                : e.tone === "warn"
                  ? "bg-amber-400"
                  : "bg-sky";
          return (
            <li key={i} className="relative mb-3 last:mb-0">
              <span
                className={`absolute -left-[1.62rem] top-1.5 h-3 w-3 rounded-full ring-4 ring-bg-elev ${dot}`}
                aria-hidden="true"
              />
              <div className="font-mono text-[0.75rem] text-sky">{e.time}</div>
              <div className="text-[0.93rem]">{e.text}</div>
            </li>
          );
        })}
      </ol>
    </Figure>
  );
}

/** Interview-style questions that open to show a model answer. */
export function QA({ items }: { items: { q: ReactNode; a: ReactNode }[] }) {
  return (
    <div className="my-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-bg-elev">
      {items.map((it, i) => (
        <details key={i} className="group">
          <summary className="flex cursor-pointer list-none items-start gap-3 px-5 py-3.5 font-semibold text-ink hover:bg-sky-soft [&::-webkit-details-marker]:hidden">
            <span className="mt-0.5 shrink-0 rounded-md bg-sky-soft px-1.5 font-mono text-[0.72rem] text-sky">
              Q{i + 1}
            </span>
            <span className="flex-1">{it.q}</span>
            <span className="shrink-0 font-mono text-sky transition group-open:rotate-45" aria-hidden="true">
              +
            </span>
          </summary>
          <div className="qa-answer px-5 pb-4 pl-[3.6rem] text-[0.95rem] text-ink-dim">{it.a}</div>
        </details>
      ))}
    </div>
  );
}

/** A plain-text diagram with its box-drawing lines and arrows picked out in the accent colour. */
export function AsciiDiagram({ text, caption }: { text: string; caption?: string }) {
  const parts = text.split(/([─│┌┐└┘├┤┬┴┼▼▲►◄▶◀═║╔╗╚╝╠╣╦╩╬━┃→←↓↑↔⇄⇒⇐✓✗]+|-{2,}>|<-{2,}|={2,}>|\|\s)/g);
  return (
    <figure className="my-7 overflow-hidden rounded-xl border border-line bg-bg-code">
      <div className="flex items-center gap-2 border-b border-line bg-bg-elev px-4 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-sky">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="1" y="1" width="4" height="4" rx="1" />
          <rect x="7" y="7" width="4" height="4" rx="1" />
          <path d="M3 5v3.5h4" />
        </svg>
        {caption ?? "Diagram"}
      </div>
      <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-5 py-4 text-[0.82rem] leading-[1.55]">
        <code className="text-ink">
          {parts.map((p, i) =>
            i % 2 === 1 ? (
              <span key={i} className="text-sky">
                {p}
              </span>
            ) : (
              <span key={i}>{p}</span>
            ),
          )}
        </code>
      </pre>
    </figure>
  );
}
