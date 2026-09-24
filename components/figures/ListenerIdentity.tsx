import Figure from "./Figure";

/** removeEventListener matches by reference: the same function object, not the same-looking code. */

function Fn({ label, tone }: { label: string; tone: string }) {
  return <div className={`rounded-md border px-2 py-1 text-center font-mono text-[0.7rem] ${tone}`}>{label}</div>;
}

export default function ListenerIdentity() {
  return (
    <Figure caption="The button keeps a list of function references. removeEventListener only removes an entry if it's handed the very same reference — a new arrow function is a new object, however similar it looks." note="references in memory">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-emerald-400/40 bg-emerald-400/5 p-3">
          <div className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-emerald-200">Named function — removed ✓</div>
          <div className="space-y-1 font-mono text-[0.72rem] text-ink-dim">
            <div>add(&quot;click&quot;, handleCheckout) ─┐</div>
            <div>remove(&quot;click&quot;, handleCheckout) ┘ same reference</div>
          </div>
          <div className="mt-2 grid grid-cols-[auto_1fr] items-center gap-2">
            <Fn label="fn#1 handleCheckout" tone="border-emerald-400/50 bg-emerald-400/10 text-emerald-100" />
            <span className="font-mono text-[0.7rem] text-ink-dim">button listeners: (empty) ✓</span>
          </div>
        </div>
        <div className="rounded-lg border border-red-400/40 bg-red-400/5 p-3">
          <div className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-red-200">Two arrow functions — not removed ✗</div>
          <div className="space-y-1 font-mono text-[0.72rem] text-ink-dim">
            <div>add(&quot;click&quot;, () =&gt; …) → creates fn#1</div>
            <div>remove(&quot;click&quot;, () =&gt; …) → creates fn#2</div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Fn label="fn#1 (registered)" tone="border-red-400/50 bg-red-400/10 text-red-100" />
            <Fn label="fn#2 (never registered)" tone="border-line bg-bg-code text-ink-dim" />
          </div>
          <div className="mt-2 font-mono text-[0.7rem] text-ink-dim">button listeners: [fn#1] — still firing, and still holding its closure in memory</div>
        </div>
      </div>
    </Figure>
  );
}
