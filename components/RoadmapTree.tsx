import Link from "next/link";
import type { PathStage } from "@/lib/roadmap";

/**
 * The roadmap as a tree: one trunk, a node per step, and the step's series branching to both sides.
 * Pure HTML and CSS (.rt in globals.css), so it is fast, readable by screen readers and works on phones.
 */
export default function RoadmapTree({ stages }: { stages: PathStage[] }) {
  return (
    <div className="rt">
      <p className="rt-pill">Start here</p>
      <ol className="m-0 list-none p-0" aria-label="Roadmap steps">
        {stages.map((st) => (
          <li key={st.step} id={`step-${st.step}`} className="rt-stage scroll-mt-24" data-accent={st.series[0].accent}>
            <div className="rt-node">
              <div className="rt-node-step">Step {st.step}</div>
              <h2 className="rt-node-title">{st.title}</h2>
              <p className="rt-node-blurb">{st.blurb}</p>
              <div className="rt-node-meta">
                <span>{st.level}</span>
                <span>{st.series.length} series</span>
                <span>{st.lessonCount} lessons</span>
              </div>
              <Link href={`/roadmap/${st.slug}`} className="rt-node-link">See every lesson in {st.title} →</Link>
            </div>
            <ul className="rt-items" aria-label={`${st.title} series`}>
              {st.series.map((s) => (
                <li key={s.slug} className="rt-item" data-accent={s.accent}>
                  <Link href={s.href} className="rt-card">
                    <span className="rt-card-title">{s.label}<small>{s.lessons.length} lessons</small></span>
                    <span className="rt-card-text">{s.tagline}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="rt-pill rt-pill-end">Ready for interviews</p>
    </div>
  );
}
