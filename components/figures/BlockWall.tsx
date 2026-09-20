import Figure from "./Figure";

/** var escapes the block wall to the outer scope; let/const are contained by it. */
export default function BlockWall() {
  return (
    <Figure caption="var ignores the block wall entirely. let/const are contained by it." note="block wall">
      <div className="mx-auto max-w-[34rem] rounded-lg border border-sky/50 p-3">
        <div className="mb-2 flex items-center justify-between font-mono text-[0.72rem] uppercase tracking-[0.08em] text-sky-strong">
          <span>Outer scope (function or global)</span>
          <span className="rounded bg-emerald-400/15 px-2 py-0.5 normal-case tracking-normal text-emerald-200">a → 10</span>
        </div>
        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
          <div className="rounded-lg border border-dashed border-amber-400/60 bg-amber-400/5 p-3">
            <div className="mb-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-amber-200">block {"{ }"}</div>
            <div className="space-y-1.5 font-mono text-[0.78rem]">
              <div className="flex items-center justify-between rounded bg-bg-code px-2 py-1">
                <span><span className="text-ink-dim">var </span><span className="text-sky-strong">a</span> = 10</span>
                <span className="text-[0.68rem] text-emerald-300">↗ escapes through the wall</span>
              </div>
              <div className="flex items-center justify-between rounded bg-bg-code px-2 py-1">
                <span><span className="text-ink-dim">let </span><span className="text-sky-strong">b</span> = 20</span>
                <span className="text-[0.68rem] text-violet-300">stays inside · gone at {"}"}</span>
              </div>
            </div>
          </div>
          <div className="w-[7.5rem] text-center font-mono text-[0.7rem] text-ink-dim">
            <div className="text-emerald-300">a escapes → 10</div>
            <div className="my-2 text-violet-300">b stays trapped,<br />gone once block ends</div>
          </div>
        </div>
      </div>
    </Figure>
  );
}
