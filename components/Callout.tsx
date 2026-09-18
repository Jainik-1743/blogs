import type { ReactNode } from "react";

type Kind = "note" | "warn" | "ok";

/** Colour per kind. The site is dark-only, so these are translucent tints on the dark background. */
const styles: Record<Kind, { box: string; label: string }> = {
  note: { box: "border-sky/40 bg-sky-soft", label: "text-sky" },
  warn: { box: "border-amber-400/40 bg-amber-400/10", label: "text-amber-300" },
  ok: { box: "border-emerald-400/40 bg-emerald-400/10", label: "text-emerald-300" },
};

/** A highlighted aside inside lesson prose: key insight, warning, or a "good news" box. */
export default function Callout({
  kind = "note",
  label,
  children,
}: {
  kind?: Kind;
  label?: string;
  children: ReactNode;
}) {
  const s = styles[kind];
  return (
    <div className={`callout my-6 rounded-xl border px-5 py-4 ${s.box}`}>
      {label ? (
        <div className={`mb-1 font-mono text-[0.75rem] uppercase tracking-[0.1em] ${s.label}`}>
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}
