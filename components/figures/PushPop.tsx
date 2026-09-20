import Figure from "./Figure";

/** The stack at three moments of the hotel example, read left to right: push, push, then pop, pop. */
const MOMENTS: { label: string; frames: string[]; arrow?: string }[] = [
  { label: "program starts", frames: ["Global EC"], arrow: "push bookRoom ↗" },
  { label: "bookRoom called", frames: ["Global EC", "bookRoom EC"], arrow: "push checkAvailability ↗" },
  { label: "checkAvailability called", frames: ["Global EC", "bookRoom EC", "checkAvailability EC"], arrow: "pop ↘" },
  { label: "checkAvailability done", frames: ["Global EC", "bookRoom EC"], arrow: "pop ↘" },
  { label: "bookRoom done", frames: ["Global EC"] },
];

const tone = (name: string) =>
  name.startsWith("Global")
    ? "border-line bg-bg-elev text-ink"
    : name.startsWith("bookRoom")
      ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
      : "border-violet-400/50 bg-violet-400/10 text-violet-200";

export default function PushPop() {
  return (
    <Figure
      caption="Global goes on first and comes off last. Whatever is pushed most recently is always popped first — that's LIFO."
      note="push / pop"
    >
      <div className="flex gap-3 overflow-x-auto pb-2">
        {MOMENTS.map((m, i) => (
          <div key={m.label} className="flex min-w-[9.5rem] flex-1 flex-col">
            <div className="flex h-[9.5rem] flex-col-reverse gap-1 rounded-lg border border-dashed border-line p-1.5">
              {m.frames.map((f, fi) => {
                const top = fi === m.frames.length - 1;
                return (
                  <div
                    key={f}
                    className={`rounded-md border px-2 py-1 text-center text-[0.72rem] font-semibold ${tone(f)} ${top ? "" : "opacity-60"}`}
                  >
                    {f}
                    {top ? <div className="font-mono text-[0.6rem] font-normal uppercase tracking-[0.08em] opacity-80">running</div> : null}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-center font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink-dim">
              {i + 1}. {m.label}
            </div>
            {m.arrow ? (
              <div className={`mt-1 text-center font-mono text-[0.68rem] ${m.arrow.startsWith("push") ? "text-violet-300" : "text-amber-300"}`}>
                {m.arrow}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Figure>
  );
}
