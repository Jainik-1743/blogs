import Figure from "./Figure";

/** After makeRoomKey returns: the stack has moved on, the closure link keeps the environment alive. */
export default function ClosureLink() {
  return (
    <Figure caption="The stack has moved on — but the returned function's closure link keeps roomNumber's home alive in memory." note="closure link">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.4fr]">
        <div>
          <div className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink-dim">Call stack</div>
          <div className="flex flex-col-reverse gap-1.5">
            <div className="rounded-md border border-line bg-bg-elev px-3 py-2 text-center text-[0.8rem] text-ink">Global EC</div>
            <div className="rounded-md border border-dashed border-red-400/60 px-3 py-2 text-center font-mono text-[0.74rem] text-red-300 line-through opacity-80">makeRoomKey() — popped</div>
          </div>
        </div>
        <div>
          <div className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink-dim">Memory (kept alive)</div>
          <div className="rounded-lg border border-violet-400/60 bg-violet-400/10 px-3 py-2 text-center">
            <div className="text-[0.8rem] font-semibold text-violet-200">makeRoomKey&apos;s Lexical Environment</div>
            <div className="font-mono text-[0.76rem] text-emerald-200">roomNumber = 305</div>
            <div className="font-mono text-[0.62rem] text-violet-300">kept alive — still referenced</div>
          </div>
          <div className="py-1 text-center font-mono text-[0.72rem] text-emerald-300">↑ closure link</div>
          <div className="rounded-lg border border-emerald-400/50 bg-emerald-400/10 px-3 py-2 text-center text-[0.8rem] font-semibold text-emerald-200">showRoom (a.k.a. showMyRoom)</div>
        </div>
      </div>
    </Figure>
  );
}
