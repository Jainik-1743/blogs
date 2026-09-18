import Figure from "./Figure";

/** Seconds a single request may run. The persistent-server bar has no end, so it fades out instead. */
const rows = [
  { label: "Vercel · free plan", seconds: 10 },
  { label: "Vercel · paid plan", seconds: 60 },
  { label: "Persistent server", seconds: Infinity },
];

const MAX = 60; // scale: 60s fills the track

export default function TimeLimitBars() {
  return (
    <Figure caption="How long one request may keep running before the platform stops it.">
      <div className="grid gap-2">
        {rows.map((r) => {
          const unlimited = !Number.isFinite(r.seconds);
          const width = unlimited ? 100 : (r.seconds / MAX) * 100;
          return (
            <div key={r.label} className="grid grid-cols-[9.5rem_1fr_5.5rem] items-center gap-3 max-sm:grid-cols-[6.5rem_1fr_5rem]">
              <span className="text-[0.85rem] text-ink-dim">{r.label}</span>
              <div className="h-4 rounded-r-[4px] bg-bg-code">
                <div
                  className="h-4 rounded-r-[4px]"
                  style={{
                    width: `${width}%`,
                    background: unlimited
                      ? "linear-gradient(90deg, #0284c7 55%, rgba(2,132,199,0) 100%)"
                      : "#0284c7",
                  }}
                />
              </div>
              <span className="whitespace-nowrap font-mono text-[0.8rem] text-ink">{unlimited ? "no limit →" : `${r.seconds}s`}</span>
            </div>
          );
        })}
      </div>
    </Figure>
  );
}
