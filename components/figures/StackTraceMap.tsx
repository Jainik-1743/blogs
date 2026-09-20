import Figure from "./Figure";

/**
 * A printed stack trace next to the stack it describes: the top line of the
 * trace is the top frame of the stack, and each line down is one frame lower.
 */
const LINES = [
  { text: "at countDown (index.js:3)", frame: "countDown(−11,414) EC", tag: "top · where it broke" },
  { text: "at countDown (index.js:3)", frame: "countDown(−11,413) EC", tag: "one below" },
  { text: "at countDown (index.js:3)", frame: "countDown(−11,412) EC", tag: "" },
  { text: "at countDown (index.js:3)", frame: "countDown(−11,411) EC", tag: "" },
  { text: "...", frame: "⋮ thousands more ⋮", tag: "printout cut off" },
  { text: "(not shown)", frame: "Global EC", tag: "bottom" },
];

export default function StackTraceMap() {
  return (
    <Figure
      caption="Read a trace top to bottom. The first line is the top of the stack — the deepest call, the instant it broke. Each line below is one card further down the tray."
      note="stack trace ↔ stack"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-x-3 max-sm:grid-cols-1 max-sm:gap-y-3">
        {/* Trace */}
        <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
          <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
            Console
          </div>
          <div className="px-3 py-2 font-mono text-[0.78rem]">
            <div className="mb-1 text-red-300">Uncaught RangeError: Maximum call stack size exceeded</div>
            {LINES.map((l, i) => (
              <div key={i} className={`h-8 leading-8 ${i === 0 ? "text-ink" : "text-ink-dim"} ${l.text.startsWith("(") ? "italic opacity-50" : ""}`}>
                {"    "}{l.text}
              </div>
            ))}
          </div>
        </div>
        {/* Arrows */}
        <div className="flex flex-col justify-end pb-2 font-mono text-[0.9rem] text-sky max-sm:hidden">
          {LINES.map((_, i) => (
            <div key={i} className="flex h-8 items-center">⟶</div>
          ))}
        </div>
        {/* Stack */}
        <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
          <div className="border-b border-line bg-bg-elev px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-dim">
            Call stack at the crash
          </div>
          <div className="px-3 py-2">
            <div className="mb-1 h-6" />
            {LINES.map((l, i) => {
              const gap = l.frame.startsWith("⋮");
              const isGlobal = l.frame.startsWith("Global");
              return (
                <div key={i} className="flex h-8 items-center gap-2">
                  <div
                    className={`flex-1 rounded-md border px-2 py-0.5 text-center font-mono text-[0.72rem] ${
                      gap
                        ? "border-dashed border-violet-400/40 text-violet-300"
                        : isGlobal
                          ? "border-line bg-bg-elev text-ink"
                          : i === 0
                            ? "border-red-400/60 bg-red-400/15 text-red-200"
                            : "border-violet-400/50 bg-violet-400/10 text-violet-200"
                    }`}
                  >
                    {l.frame}
                  </div>
                  {l.tag ? <span className="w-[6.5rem] shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.06em] text-ink-dim max-sm:hidden">{l.tag}</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Figure>
  );
}
