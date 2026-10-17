import Link from "next/link";
import type { Block, Cell } from "@/lib/roadmap";

function CellLink({ c, side, lesson }: { c: Cell; side: "left" | "right"; lesson: boolean }) {
  return (
    <Link href={c.href} data-accent={c.accent} title={c.label} className={`rm-card rm-card-${side}${lesson ? " rm-lesson" : ""}`}>
      <span className="rm-card-label">{c.label}</span>
      {c.sub ? <span className="rm-card-count">{c.sub}</span> : null}
    </Link>
  );
}

/**
 * The roadmap as a connected tree: a line down the middle, centre boxes on it (not links, they only
 * name the step), and clickable boxes on both sides that open the series or the lesson. The lines are
 * drawn with CSS (see .rm in globals.css), and the layout folds into one column on phones.
 */
export default function RoadmapMap({ blocks, lesson = false }: { blocks: Block[]; lesson?: boolean }) {
  return (
    <div className="rm" role="list" aria-label="Developer roadmap">
      <p className="rm-pill rm-pill-top" aria-hidden="true">Start here</p>
      {blocks.map((b, i) =>
        b.kind === "phase" ? (
          <h2 key={i} data-accent={b.accent} className="rm-phase">
            <span>Step {b.step}</span> {b.title}
          </h2>
        ) : (
          <section key={i} role="listitem" aria-label={b.title} data-accent={b.accent} className="rm-stage">
            <div className="rm-side rm-side-left">
              {b.left.map((c) => (
                <CellLink key={c.href} c={c} side="left" lesson={lesson} />
              ))}
            </div>
            <div className="rm-node">
              {b.eyebrow ? <span className="rm-step">{b.eyebrow}</span> : null}
              <span className="rm-node-title">{b.title}</span>
              <span className="rm-node-sub">{b.sub}</span>
            </div>
            <div className="rm-side rm-side-right">
              {b.right.map((c) => (
                <CellLink key={c.href} c={c} side="right" lesson={lesson} />
              ))}
            </div>
          </section>
        ),
      )}
      <p className="rm-pill rm-pill-bottom" aria-hidden="true">Ready for interviews</p>
    </div>
  );
}
