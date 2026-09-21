import Figure from "./Figure";

/** The naive version on a timeline: the loop is over in ~1 ms; the callbacks start a full second later. */
export default function TimerTimeline() {
  const ticks = [0, 1, 2, 3, 4, 5];
  return (
    <Figure caption="Everything the loop does happens in the first millisecond. Every callback runs at least a full second after the loop — and i — are already finished." note="timeline">
      <div className="px-2">
        <div className="relative h-24">
          <div className="absolute left-0 right-0 top-12 h-0.5 bg-line" />
          {ticks.map((t) => (
            <div key={t} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${(t / 5) * 100}%` }}>
              {t === 0 ? (
                <>
                  <div className="mb-1 rounded border border-amber-400/60 bg-amber-400/10 px-1.5 py-0.5 text-center font-mono text-[0.62rem] text-amber-200">loop runs & ends<br />i = 6 · 5 timers set</div>
                  <div className="h-3 w-0.5 bg-amber-400" />
                </>
              ) : (
                <>
                  <div className="mb-1 rounded border border-sky/60 bg-sky-soft px-1.5 py-0.5 font-mono text-[0.62rem] text-sky">cb {t} fires<br />reads i → 6</div>
                  <div className="h-3 w-0.5 bg-sky" />
                </>
              )}
            </div>
          ))}
          {ticks.map((t) => (
            <div key={`l${t}`} className="absolute top-16 -translate-x-1/2 font-mono text-[0.65rem] text-ink-dim" style={{ left: `${(t / 5) * 100}%` }}>{t}s</div>
          ))}
        </div>
      </div>
    </Figure>
  );
}
