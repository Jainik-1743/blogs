"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LESSON_PATH = /^\/[^/]+\/lesson-\d+\/?$/;
const WORDS_PER_MINUTE = 220;

/**
 * A thin bar at the very top of a lesson that fills as you scroll, plus a small "x min left" pill.
 * Progress is measured over the lesson's <article>, so the header, footer and related links don't count.
 */
export default function ReadingProgress() {
  const pathname = usePathname();
  const active = LESSON_PATH.test(pathname);
  const [progress, setProgress] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (!active) return;
    const article = document.querySelector("article");
    if (!article) return;

    const words = (article.textContent ?? "").trim().split(/\s+/).length;
    setMinutes(Math.max(1, Math.round(words / WORDS_PER_MINUTE)));

    let frame = 0;
    function update() {
      frame = 0;
      const rect = article!.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const done = scrollable <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / scrollable));
      setProgress(done);
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [active, pathname]);

  if (!active || !minutes) return null;

  const left = Math.ceil(minutes * (1 - progress));
  const finished = progress >= 0.98;
  const label = finished ? "Finished" : left <= 1 ? "Under 1 min left" : `${left} min left`;
  const pct = Math.round(progress * 100);

  return (
    <>
      <div
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[3px] bg-transparent"
      >
        <div className="h-full origin-left bg-sky" style={{ transform: `scaleX(${progress})` }} />
      </div>
      {progress > 0.01 ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed bottom-4 left-4 z-30 rounded-full border border-line bg-bg-elev/90 px-3 py-1 font-mono text-[0.72rem] text-ink-dim shadow-lg backdrop-blur"
        >
          {label} · {pct}%
        </div>
      ) : null}
    </>
  );
}
