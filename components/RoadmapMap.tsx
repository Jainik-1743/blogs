import Link from "next/link";
import { ROADMAP, type RoadmapCard } from "@/lib/roadmap";

function Card({ c, side }: { c: RoadmapCard; side: "left" | "right" }) {
  return (
    <Link href={c.href} data-accent={c.accent} className={`rm-card rm-card-${side}`}>
      <span className="rm-card-label">{c.label}</span>
      <span className="rm-card-count">{c.lessons} lessons</span>
    </Link>
  );
}

/**
 * The roadmap as a connected tree: a line of steps down the middle, with the series that belong to
 * each step on both sides. Every box is a real link to that series' lessons. The lines are drawn
 * with CSS (see .rm in globals.css), and the layout folds into one column on phones.
 */
export default function RoadmapMap() {
  return (
    <div className="rm" role="list" aria-label="Developer roadmap">
      <p className="rm-pill rm-pill-top" aria-hidden="true">Start here</p>
      {ROADMAP.map((s) => (
        <section key={s.step} role="listitem" aria-label={`Step ${s.step}: ${s.title}`} data-accent={s.accent} className="rm-stage">
          <div className="rm-side rm-side-left">
            {s.left.map((c) => (
              <Card key={c.slug} c={c} side="left" />
            ))}
          </div>
          <Link href={s.spine.href} className="rm-node">
            <span className="rm-step">Step {s.step}</span>
            <span className="rm-node-title">{s.title}</span>
            <span className="rm-node-sub">{s.spine.label}, {s.spine.lessons} lessons</span>
          </Link>
          <div className="rm-side rm-side-right">
            {s.right.map((c) => (
              <Card key={c.slug} c={c} side="right" />
            ))}
          </div>
        </section>
      ))}
      <p className="rm-pill rm-pill-bottom" aria-hidden="true">Ready for interviews</p>
    </div>
  );
}
