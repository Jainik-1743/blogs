import Link from "next/link";
import type { PathStage } from "@/lib/roadmap";

/**
 * The lesson-level tree. Each step is a node on the trunk, each series a smaller node under it,
 * and the series' lessons branch off to both sides in reading order. Styles are .rt in globals.css.
 */
export default function RoadmapLessonTree({ stages, showEnd = true }: { stages: PathStage[]; showEnd?: boolean }) {
  return (
    <div className="rt">
      <p className="rt-pill">Start here</p>
      <ol className="m-0 list-none p-0" aria-label="Roadmap steps">
        {stages.map((st) => (
          <li key={st.step} id={st.slug} className="rt-stage scroll-mt-24" data-accent={st.series[0].accent}>
            <div className="rt-node">
              <div className="rt-node-step">Step {st.step}</div>
              <h2 className="rt-node-title">{st.title}</h2>
              <p className="rt-node-blurb">{st.blurb}</p>
              <div className="rt-node-meta">
                <span>{st.level}</span>
                <span>{st.series.length} series</span>
                <span>{st.lessonCount} lessons</span>
              </div>
            </div>
            <div className="mt-10">
              {st.series.map((s) => (
                <section key={s.slug} className="rt-series" data-accent={s.accent} aria-label={s.label}>
                  <Link href={s.href} className="rt-node rt-node-sm">
                    <span className="rt-node-title block">{s.label}</span>
                    <span className="rt-node-meta"><span>{s.lessons.length} lessons</span><span>Open series →</span></span>
                  </Link>
                  <ol className="rt-items rt-items-lessons">
                    {s.lessons.map((l) => (
                      <li key={l.href} className="rt-item">
                        <Link href={l.href} className="rt-lesson"><b>{l.number}</b><span>{l.title}</span></Link>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          </li>
        ))}
      </ol>
      {showEnd && <p className="rt-pill rt-pill-end">Ready for interviews</p>}
    </div>
  );
}
