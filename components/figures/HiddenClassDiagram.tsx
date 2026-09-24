import Figure from "./Figure";

/** Same property order → one shared hidden class; different order → separate shapes. */

function Chain({ steps, tone }: { steps: string[]; tone: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 font-mono text-[0.7rem]">
      {steps.map((s, i) => (
        <span key={s} className="flex items-center gap-1.5">
          {i > 0 ? <span className="text-ink-dim">→</span> : null}
          <span className={`rounded border px-1.5 py-0.5 ${tone}`}>{s}</span>
        </span>
      ))}
    </div>
  );
}

export default function HiddenClassDiagram() {
  return (
    <Figure caption="Every property added in the same order walks the same chain of transitions and ends on the same hidden class. Change the order and the objects end up on different shapes." note="hidden classes">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-emerald-400/40 bg-emerald-400/5 p-3">
          <div className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-emerald-200">Same order — monomorphic ✓</div>
          <div className="mb-2 font-mono text-[0.72rem] text-ink-dim">room1 = {"{ number, guest }"} · room2 = {"{ number, guest }"}</div>
          <Chain steps={["Shape0 {}", "Shape1 {number@0}", "Shape2 {number@0, guest@1}"]} tone="border-emerald-400/50 bg-emerald-400/10 text-emerald-100" />
          <p className="mb-0 mt-2 text-[0.8rem] text-ink-dim">
            Both rooms point at <strong className="text-ink">Shape2</strong>. <code>room.guest</code> is “read slot 1” — one memory load, cached at the call site.
          </p>
        </div>
        <div className="rounded-lg border border-red-400/40 bg-red-400/5 p-3">
          <div className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-red-200">Different order — polymorphic ✗</div>
          <div className="mb-2 font-mono text-[0.72rem] text-ink-dim">roomA = {"{ number, guest }"} · roomB = {"{ guest, number }"}</div>
          <div className="space-y-1.5">
            <Chain steps={["Shape0 {}", "{number@0}", "ShapeA {number@0, guest@1}"]} tone="border-red-400/40 bg-red-400/10 text-red-100" />
            <Chain steps={["Shape0 {}", "{guest@0}", "ShapeB {guest@0, number@1}"]} tone="border-red-400/40 bg-red-400/10 text-red-100" />
          </div>
          <p className="mb-0 mt-2 text-[0.8rem] text-ink-dim">
            <code>guest</code> lives at a different slot in each shape, so every access must first check which shape it has. With many shapes the cache gives up (megamorphic).
          </p>
        </div>
      </div>
    </Figure>
  );
}
