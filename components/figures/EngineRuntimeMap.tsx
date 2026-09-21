import Figure from "./Figure";

/** The JS engine is only one part of the larger JS runtime environment. */
export default function EngineRuntimeMap() {
  return (
    <Figure
      caption="The engine only knows how to run JS syntax. Everything async — timers, network requests, the queues — lives outside it, in the runtime environment."
      note="engine vs. runtime"
    >
      <div className="mx-auto max-w-[34rem] rounded-lg border border-dashed border-line p-3">
        <div className="mb-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim">
          JS Runtime Environment
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1fr]">
          <div className="rounded-lg border border-sky/50 bg-sky-soft p-3">
            <div className="mb-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-sky-strong">
              JS Engine (V8)
            </div>
            <div className="space-y-1 font-mono text-[0.75rem] text-ink-dim">
              <div>Parser → AST</div>
              <div>Ignition + TurboFan</div>
              <div>Call Stack</div>
              <div>Memory Heap + Orinoco GC</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="rounded-lg border border-violet-400/50 bg-violet-400/10 px-3 py-2 text-center font-mono text-[0.72rem] text-violet-200">
              Web APIs — setTimeout, fetch, DOM
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-amber-400/50 bg-amber-400/10 px-2 py-2 text-center font-mono text-[0.68rem] text-amber-200">
                Callback Queue
              </div>
              <div className="rounded-lg border border-amber-400/50 bg-amber-400/10 px-2 py-2 text-center font-mono text-[0.68rem] text-amber-200">
                Microtask Queue
              </div>
            </div>
            <div className="rounded-lg border border-emerald-400/50 bg-emerald-400/10 px-3 py-2 text-center font-mono text-[0.68rem] text-emerald-200">
              Event Loop — full detail in Lesson 14
            </div>
          </div>
        </div>
      </div>
    </Figure>
  );
}
