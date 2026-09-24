"use client";

import { useState } from "react";
import { Shell } from "./ui";

const DOCS = [
  "Red running shoes for men",
  "Blue running jacket",
  "Men's red leather shoes",
  "Waterproof hiking shoes",
  "Red cotton t-shirt for women",
];

const STOP = new Set(["for", "the", "a", "and", "of"]);
const stem = (w: string) =>
  w
    .toLowerCase()
    .replace(/'s$/, "")
    .replace(/(ning|ing)$/, "")
    .replace(/s$/, "");
const terms = (s: string) =>
  s
    .split(/[^A-Za-z'-]+/)
    .filter(Boolean)
    .map(stem)
    .filter((w) => w && !STOP.has(w));

const INDEX = new Map<string, number[]>();
DOCS.forEach((d, i) => {
  for (const t of new Set(terms(d))) INDEX.set(t, [...(INDEX.get(t) ?? []), i]);
});

/** Type a search and watch it become term lookups, posting-list intersection and a ranked result. */
export default function InvertedIndex({ caption }: { caption: string }) {
  const [q, setQ] = useState("red shoes");
  const qt = [...new Set(terms(q))];
  const lists = qt.map((t) => INDEX.get(t) ?? []);
  const results = DOCS.map((_, i) => ({ i, score: lists.filter((l) => l.includes(i)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return (
    <Shell caption={caption}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products…"
        className="w-full rounded-lg border border-line bg-bg-code px-3 py-2 text-ink outline-none focus:border-sky"
        aria-label="Search query"
      />
      <div className="mt-2 font-mono text-[0.72rem] text-ink-dim">
        analysed terms:{" "}
        {qt.length
          ? qt.map((t) => (
              <span key={t} className="mr-1 rounded bg-sky-soft px-1.5 text-sky-strong">
                {t}
              </span>
            ))
          : "—"}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-sky">
            Inverted index (term → doc IDs)
          </div>
          <div className="max-h-60 overflow-y-auto rounded-lg border border-line bg-bg-code p-2 font-mono text-[0.72rem]">
            {[...INDEX.entries()].sort().map(([t, ds]) => (
              <div
                key={t}
                className={`flex justify-between rounded px-1.5 py-0.5 ${qt.includes(t) ? "bg-sky-soft text-sky-strong" : "text-ink-dim"}`}
              >
                <span>{t}</span>
                <span>[{ds.map((d) => d + 1).join(", ")}]</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-sky">
            Results, ranked by matching terms
          </div>
          <ol className="m-0 list-none space-y-1.5 p-0">
            {results.length === 0 ? (
              <li className="text-[0.85rem] text-ink-dim">No document contains these terms.</li>
            ) : null}
            {results.map(({ i, score }) => (
              <li
                key={i}
                className={`rounded-lg border px-3 py-1.5 text-[0.85rem] ${score === qt.length ? "border-emerald-400/50 bg-emerald-400/10" : "border-line bg-bg-code"}`}
              >
                <span className="mr-2 font-mono text-[0.7rem] text-ink-dim">doc {i + 1}</span>
                {DOCS[i]}
                <span className="float-right font-mono text-[0.7rem] text-sky">
                  {score}/{qt.length}
                </span>
              </li>
            ))}
          </ol>
          <p className="mb-0 mt-2 text-[0.75rem] text-ink-dim">
            Green = contains every term (AND). The index is read once per term, with no scan of all documents, however
            many there are.
          </p>
        </div>
      </div>
    </Shell>
  );
}
