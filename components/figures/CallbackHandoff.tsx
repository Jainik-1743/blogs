import Figure from "./Figure";

/** repeatTask holds a reference to the passed-in callback and invokes it three times, on its own schedule. */
export default function CallbackHandoff() {
  return (
    <Figure
      caption="repeatTask doesn't know what the callback does — it just holds the reference and calls it, three times, whenever its loop reaches that line."
      note="higher-order function"
    >
      <div className="mx-auto grid max-w-[34rem] grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="rounded-lg border border-emerald-400/50 bg-emerald-400/10 p-3">
          <div className="mb-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-emerald-200">
            repeatTask(3, callback)
          </div>
          <div className="space-y-1 font-mono text-[0.75rem] text-ink-dim">
            <div>holds a reference to callback</div>
            <div>for (i = 1; i &lt;= 3; i++)</div>
            <div>callback(i)</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 font-mono text-[0.68rem] text-sky">
          <span>call 1 →</span>
          <span>call 2 →</span>
          <span>call 3 →</span>
        </div>

        <div className="rounded-lg border border-violet-400/50 bg-violet-400/10 p-3">
          <div className="mb-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-violet-200">
            callback (passed in)
          </div>
          <div className="font-mono text-[0.75rem] text-ink-dim">
            console.log(`pass ${"${round}"} complete`)
          </div>
        </div>
      </div>
    </Figure>
  );
}
