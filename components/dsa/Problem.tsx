import type { ReactNode } from "react";
import CodeBlock from "@/components/sd/CodeBlock";

/** One worked example: the input, the expected output, and how that output is reached. */
export type Example = { input: string; output: string; why: ReactNode };

/** One way to solve the problem. */
export type Approach = {
  /** Short name, e.g. "Loop and count" or "Using a Set". */
  name: string;
  /** The idea in plain words, before any code — usually a few numbered steps. */
  idea: ReactNode;
  /** The JavaScript solution, with a few test calls at the end. */
  code: string;
  /** Why it works, often with a dry run. */
  explain: ReactNode;
};

const LEVEL = {
  Easy: "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
  Medium: "border-amber-400/50 bg-amber-400/10 text-amber-300",
  Hard: "border-red-400/50 bg-red-400/10 text-red-300",
} as const;

const label = "font-mono text-[0.68rem] uppercase tracking-[0.1em]";

/**
 * One practice question. The statement and the worked examples are always visible.
 * Hints open one at a time, so you can take only as much help as you need. The solutions
 * show every approach — the idea in words, the code, and why it works — followed by
 * advice on which one to use.
 */
export default function Problem({
  n,
  title,
  level,
  children,
  examples,
  hints = [],
  approaches,
  compare,
}: {
  n: number;
  title: string;
  level: keyof typeof LEVEL;
  /** The problem statement. */
  children: ReactNode;
  examples: Example[];
  /** Small steps towards the answer, from a gentle nudge to almost the full idea. */
  hints?: ReactNode[];
  approaches: Approach[];
  /** Which approach to choose, and why. Shown after the solutions. */
  compare?: ReactNode;
}) {
  return (
    <section className="my-8 rounded-xl border border-line bg-bg-elev px-5 py-5" aria-label={`Question ${n}: ${title}`}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.78rem] font-bold text-sky">Q{n}</span>
        <span className="text-[1.05rem] font-semibold text-ink">{title}</span>
        <span className={`ml-auto rounded-full border px-2 py-0.5 font-mono text-[0.66rem] uppercase tracking-[0.08em] ${LEVEL[level]}`}>
          {level}
        </span>
      </div>

      <div className="[&>p:last-child]:mb-0">{children}</div>

      {/* Examples — always visible */}
      <div className="mt-4 grid gap-2">
        {examples.map((e, i) => (
          <div key={i} className="rounded-lg border border-line bg-bg-code px-4 py-3">
            <div className={`${label} mb-1 text-ink-dim`}>Example {i + 1}</div>
            <div className="font-mono text-[0.84rem]">
              <span className="text-ink-dim">Input: </span>
              <span className="whitespace-pre-wrap text-ink">{e.input}</span>
            </div>
            {e.output.includes("\n") ? (
              <div className="font-mono text-[0.84rem]">
                <span className="text-ink-dim">Output:</span>
                <pre className="my-1 rounded-none border-0 bg-transparent py-0 pl-4 pr-0 text-[0.84rem] leading-snug text-sky-strong">{e.output}</pre>
              </div>
            ) : (
              <div className="font-mono text-[0.84rem]">
                <span className="text-ink-dim">Output: </span>
                <span className="text-sky-strong">{e.output}</span>
              </div>
            )}
            <div className="mt-1.5 border-t border-line/60 pt-1.5 text-[0.88rem] text-ink-dim">
              <span className="font-semibold text-ink">Explanation: </span>
              {e.why}
            </div>
          </div>
        ))}
      </div>

      {/* Hints — one at a time */}
      {hints.length > 0 ? (
        <div className="mt-4">
          <div className={`${label} mb-1.5 text-amber-300`}>Stuck? Open one hint at a time</div>
          <div className="grid gap-1.5">
            {hints.map((h, i) => (
              <details key={i} className="group rounded-lg border border-line px-4 py-2 open:border-amber-400/50">
                <summary className="cursor-pointer font-mono text-[0.75rem] uppercase tracking-[0.1em] text-amber-300">
                  Hint {i + 1}
                </summary>
                <div className="mt-2 text-[0.95rem] text-ink [&>p:last-child]:mb-0">{h}</div>
              </details>
            ))}
          </div>
        </div>
      ) : null}

      {/* Solutions — every approach */}
      <details className="group mt-4 rounded-lg border border-line px-4 py-2 open:border-sky/50">
        <summary className="cursor-pointer font-mono text-[0.75rem] uppercase tracking-[0.1em] text-sky">
          Show {approaches.length === 1 ? "the solution" : `all ${approaches.length} solutions`} with explanations
        </summary>
        <div className="mt-3 grid gap-5">
          {approaches.map((a, i) => (
            <div key={a.name} className="rounded-lg border border-line bg-bg px-4 py-3">
              <div className="mb-2 flex items-baseline gap-2">
                <span className={`${label} text-sky`}>Approach {i + 1}</span>
                <span className="font-semibold text-ink">{a.name}</span>
              </div>
              <div className="text-[0.95rem] [&>p:last-child]:mb-0 [&_ol]:mb-0">
                <div className={`${label} mb-1 text-ink-dim`}>The idea</div>
                {a.idea}
              </div>
              <CodeBlock lang="js" code={a.code} />
              <div className="text-[0.95rem] [&>p:last-child]:mb-0">
                <div className={`${label} mb-1 text-ink-dim`}>How it works</div>
                {a.explain}
              </div>
            </div>
          ))}
          {compare ? (
            <div className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-[0.95rem] [&>p:last-child]:mb-0">
              <div className={`${label} mb-1 text-emerald-300`}>Which approach should you use?</div>
              {compare}
            </div>
          ) : null}
        </div>
      </details>
    </section>
  );
}
