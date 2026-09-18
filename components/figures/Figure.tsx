import type { ReactNode } from "react";

/** Wrapper for every diagram/chart: a bordered surface, a caption, and an optional footnote. */
export default function Figure({
  caption,
  note,
  children,
}: {
  caption: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <figure className="my-7 rounded-xl border border-line bg-bg-elev px-5 pb-4 pt-5">
      {children}
      <figcaption className="mt-3 text-[0.88rem] text-ink-dim">
        {caption}
        {note ? <span className="ml-1 font-mono text-[0.72rem] uppercase tracking-[0.08em]"> · {note}</span> : null}
      </figcaption>
    </figure>
  );
}
