"use client";

import type { ReactNode } from "react";
import Figure from "@/components/figures/Figure";

/** Shared controls for the interactive System Design figures. */

export const btn =
  "rounded-md border border-line bg-bg-elev px-3 py-1 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim transition hover:border-sky hover:text-sky disabled:cursor-not-allowed disabled:opacity-40";

export const btnOn = "border-sky bg-sky-soft text-sky";

/** Every widget sits in a Figure and opts out of glossary marking, because it re-renders. */
export function Shell({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <Figure caption={caption} note="interactive">
      <div data-no-glossary>{children}</div>
    </Figure>
  );
}

export function Tabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2" role="tablist">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          className={`${btn} ${value === o.id ? btnOn : ""}`}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (v) => String(v),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="block">
      <span className="flex justify-between gap-2 text-[0.82rem] text-ink-dim">
        <span>{label}</span>
        <span className="font-mono text-sky-strong">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--color-sky)]"
      />
    </label>
  );
}

export function Readout({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "good" | "bad" | "warn";
}) {
  const color =
    tone === "good"
      ? "text-emerald-300"
      : tone === "bad"
        ? "text-red-300"
        : tone === "warn"
          ? "text-amber-200"
          : "text-sky";
  return (
    <div className="rounded-lg border border-line bg-bg-code px-3 py-2">
      <div className="font-mono text-[0.66rem] uppercase tracking-[0.08em] text-ink-dim">{label}</div>
      <div className={`font-mono text-[1.1rem] font-bold leading-tight ${color}`}>{value}</div>
      {sub ? <div className="text-[0.75rem] text-ink-dim">{sub}</div> : null}
    </div>
  );
}

/** Deterministic pseudo-random numbers, so server and client render the same first frame. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** A small, stable string hash (FNV-1a) used by the hashing widgets. */
export function hash(str: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export const fmt = (n: number, digits = 1) =>
  n >= 1e12
    ? `${(n / 1e12).toFixed(digits)} T`
    : n >= 1e9
      ? `${(n / 1e9).toFixed(digits)} B`
      : n >= 1e6
        ? `${(n / 1e6).toFixed(digits)} M`
        : n >= 1e3
          ? `${(n / 1e3).toFixed(digits)} K`
          : n.toFixed(n < 10 ? digits : 0);

export const bytes = (n: number) =>
  n >= 1e15
    ? `${(n / 1e15).toFixed(1)} PB`
    : n >= 1e12
      ? `${(n / 1e12).toFixed(1)} TB`
      : n >= 1e9
        ? `${(n / 1e9).toFixed(1)} GB`
        : n >= 1e6
          ? `${(n / 1e6).toFixed(1)} MB`
          : n >= 1e3
            ? `${(n / 1e3).toFixed(1)} KB`
            : `${n.toFixed(0)} B`;
