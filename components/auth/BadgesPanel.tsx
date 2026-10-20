"use client";

import { useState } from "react";
import Badge from "@/components/Badge";
import ShareDialog, { type ShareTarget } from "@/components/ShareDialog";
import { metricUnit, type TrackStatus } from "@/lib/badges";

/** One card per badge track: the badge earned so far, progress toward the next, and the whole ladder. */
export default function BadgesPanel({ tracks }: { tracks: TrackStatus[] }) {
  const [sharing, setSharing] = useState<ShareTarget | null>(null);
  return (
    <>
      <ShareDialog target={sharing} onClose={() => setSharing(null)} />
      {tracks.map((t) => {
        const unit = t.next ? metricUnit(t.next.metric) : t.current ? metricUnit(t.current.metric) : "";
        const first = t.ladder[0];
        return (
          <section key={t.track} aria-label={t.title} className="rounded-3xl border border-line bg-bg-elev p-5 sm:p-9">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:flex-wrap sm:gap-8 sm:text-left">
              <div className="grid w-36 shrink-0 place-items-center">
                {t.current ? <Badge badge={t.current} size={132} /> : <Badge badge={first} size={132} locked />}
              </div>
              <div className="w-full min-w-0 sm:w-auto sm:flex-1 sm:basis-72">
                <p className="m-0 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-sky">{t.title}</p>
                <h2 className="m-0 mt-1 text-[1.6rem] font-bold leading-tight tracking-tight text-ink">{t.current ? t.current.name : "Earn your first badge"}</h2>
                <p className="mt-1 mb-0 text-ink-dim">
                  {t.current ? t.current.blurb : `Reach ${first.threshold} ${metricUnit(first.metric)} to unlock ${first.name}.`}{" "}
                  You are at <strong className="text-ink">{t.value}</strong> {unit}.
                </p>
                {t.next ? (
                  <div className="mx-auto mt-4 max-w-md sm:mx-0">
                    <div className="mb-1.5 flex justify-between gap-3 text-left text-[0.82rem] text-ink-dim">
                      <span>Next: <strong className="text-ink">{t.next.name}</strong></span>
                      <span>{t.remaining} more</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={t.percent} aria-label={`Progress to ${t.next.name}`}>
                      <div className="h-full rounded-full bg-sky transition-[width] duration-500" style={{ width: `${t.percent}%` }} />
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 mb-0 font-semibold text-sky">You have reached the top of this ladder. Keep learning!</p>
                )}
                {t.current && (
                  <button type="button" onClick={() => setSharing({ kind: "badge", badge: t.current!, value: t.current!.threshold, unit: metricUnit(t.current!.metric) })} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-sky px-4 py-2.5 text-[0.88rem] font-semibold text-sky transition hover:bg-sky-soft sm:w-auto sm:py-2">
                    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" /></svg>
                    Share this badge
                  </button>
                )}
              </div>
            </div>

            <ul className="m-0 mt-8 grid list-none grid-cols-2 gap-3 border-t border-line p-0 pt-6 sm:grid-cols-3 lg:grid-cols-5">
              {t.ladder.map((b, i) => (
                <li key={b.id} className={`m-0 flex flex-col items-center rounded-xl px-2 py-3 text-center ${i === t.earned - 1 ? "bg-sky-soft" : ""}`}>
                  <Badge badge={b} size={72} locked={i >= t.earned} />
                  <span className={`mt-2 text-[0.88rem] font-semibold ${i < t.earned ? "text-ink" : "text-ink-dim"}`}>{b.name}</span>
                  <span className="text-[0.75rem] text-ink-dim">{b.threshold} {metricUnit(b.metric)}</span>
                  {i < t.earned && (
                    <button type="button" onClick={() => setSharing({ kind: "badge", badge: b, value: b.threshold, unit: metricUnit(b.metric) })} className="mt-1 px-2 py-1.5 text-[0.75rem] font-semibold text-sky hover:underline" aria-label={`Share the ${b.name} badge`}>Share</button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p className="m-0 text-[0.8rem] text-ink-dim">A day counts when you finish at least one lesson. Days do not have to be in a row, so a missed day never takes a badge away.</p>
    </>
  );
}
