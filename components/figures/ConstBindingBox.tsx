import Figure from "./Figure";

/** const locks the arrow from the name to the object, not the object itself. */
export default function ConstBindingBox() {
  return (
    <Figure caption="const freezes the binding — the arrow from the name to the value. The object at the other end of the arrow is as mutable as ever, unless you Object.freeze it." note="binding vs value">
      <div className="mx-auto grid max-w-[34rem] grid-cols-[auto_1fr_auto] items-center gap-3">
        <div className="rounded-lg border border-violet-400/50 bg-violet-400/10 px-3 py-2 text-center">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-violet-300">const binding</div>
          <div className="font-mono text-[0.85rem] text-sky-strong">guest</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-[1.1rem] text-violet-300">🔒 ──────▶</div>
          <div className="font-mono text-[0.62rem] text-ink-dim">this arrow cannot be re-pointed</div>
          <div className="mt-1 font-mono text-[0.68rem] text-red-300">guest = {"{…}"} → TypeError</div>
        </div>
        <div className="rounded-lg border border-emerald-400/50 bg-emerald-400/10 px-3 py-2">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-emerald-300">the object · on the heap</div>
          <ul className="m-0 list-none p-0 font-mono text-[0.76rem]">
            <li className="flex justify-between gap-3"><span className="text-sky-strong">name</span><span className="text-emerald-200">&quot;Aditi&quot;</span></li>
            <li className="flex justify-between gap-3"><span className="text-sky-strong">room</span><span className="text-emerald-200">101 → 102 ✓</span></li>
          </ul>
          <div className="mt-1 font-mono text-[0.62rem] text-ink-dim">guest.room = 102 is fine</div>
        </div>
      </div>
    </Figure>
  );
}
