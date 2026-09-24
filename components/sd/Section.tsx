import type { ReactNode } from "react";

/**
 * One top-level section of a System Design post. Every post repeats the same headings
 * (The Problem, The Core Idea, How It Works …); each kind gets an eyebrow label and its own
 * look from the `.sd-*` rules in globals.css, so pages only pass the kind.
 */

export type SectionKind = "problem" | "idea" | "how" | "tradeoffs" | "real" | "interview" | "takeaways" | "reading";

const EYEBROW: Record<SectionKind, string> = {
  problem: "Why it matters",
  idea: "Mental model",
  how: "Under the hood",
  tradeoffs: "Nothing is free",
  real: "Case studies",
  interview: "Test yourself",
  takeaways: "Remember this",
  reading: "Go deeper",
};

export default function Section({
  id,
  title,
  kind,
  children,
}: {
  id: string;
  title: ReactNode;
  kind?: SectionKind;
  children: ReactNode;
}) {
  return (
    <section className={kind ? `sd-${kind}` : undefined} aria-labelledby={id}>
      {kind ? (
        <p className="sd-eyebrow" aria-hidden="true">
          {EYEBROW[kind]}
        </p>
      ) : null}
      <h2 id={id}>{title}</h2>
      <div className="sd-body">{children}</div>
    </section>
  );
}
