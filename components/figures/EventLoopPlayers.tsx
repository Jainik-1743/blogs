import Figure from "./Figure";

/** How the event loop connects the call stack to the two queues, and the golden rule between them. */
export default function EventLoopPlayers() {
  return (
    <Figure
      caption="Microtasks always win the race back onto the stack — every single one of them, before a single callback-queue item gets its turn."
      note="the four players"
    >
      <div className="mx-auto max-w-[34rem] space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-sky/50 bg-sky-soft px-3 py-2 text-center">
            <div className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-sky-strong">Call Stack</div>
            <div className="mt-1 font-mono text-[0.68rem] text-ink-dim">one thing at a time</div>
          </div>
          <div className="rounded-lg border border-violet-400/50 bg-violet-400/10 px-3 py-2 text-center">
            <div className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-violet-200">Web APIs</div>
            <div className="mt-1 font-mono text-[0.68rem] text-ink-dim">setTimeout, fetch...</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-emerald-400/50 bg-emerald-400/10 px-3 py-2 text-center font-mono text-[0.72rem] text-emerald-200">
            Microtask Queue — drains fully
          </div>
          <div className="rounded-lg border border-amber-400/50 bg-amber-400/10 px-3 py-2 text-center font-mono text-[0.72rem] text-amber-200">
            Callback Queue — one at a time
          </div>
        </div>

        <div className="rounded-lg border border-line bg-bg-elev px-3 py-2 text-center">
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink">Event Loop</div>
          <div className="mt-1 font-mono text-[0.68rem] text-ink-dim">
            is the stack empty? drain microtasks first, always
          </div>
        </div>
      </div>
    </Figure>
  );
}
