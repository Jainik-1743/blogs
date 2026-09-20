import Figure from "./Figure";

/** var climbs out of the if-block to the function level; let stays inside the braces. */
export default function BlockScopeBox() {
  return (
    <Figure caption="var only respects function boundaries, so a is visible after the block. let respects the braces, so b is gone the moment they close." note="block vs function scope">
      <div className="mx-auto max-w-[34rem] rounded-lg border border-sky/50 p-3">
        <div className="mb-2 flex items-center justify-between font-mono text-[0.72rem] uppercase tracking-[0.08em] text-sky-strong">
          <span>function / global scope</span>
          <span className="rounded bg-emerald-400/15 px-2 py-0.5 normal-case tracking-normal text-emerald-200">a = &quot;visible everywhere&quot;</span>
        </div>
        <div className="rounded-lg border border-amber-400/50 bg-amber-400/5 p-3">
          <div className="mb-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-amber-200">if (true) {"{ }"} block</div>
          <div className="grid grid-cols-1 gap-2 font-mono text-[0.78rem] sm:grid-cols-2">
            <div className="rounded bg-bg-code px-2 py-1.5">
              <span className="text-ink-dim">var </span><span className="text-sky-strong">a</span>
              <div className="mt-1 text-[0.68rem] text-emerald-300">↑ hoisted out to the function</div>
            </div>
            <div className="rounded bg-bg-code px-2 py-1.5">
              <span className="text-ink-dim">let </span><span className="text-sky-strong">b</span> <span className="text-emerald-200">= &quot;only inside&quot;</span>
              <div className="mt-1 text-[0.68rem] text-amber-300">stays here · gone at {"}"}</div>
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 font-mono text-[0.78rem] sm:grid-cols-2">
          <div className="rounded bg-bg-code px-2 py-1.5"><span className="text-ink-dim">console.log(a) → </span><span className="text-emerald-200">&quot;visible everywhere&quot;</span></div>
          <div className="rounded bg-bg-code px-2 py-1.5"><span className="text-ink-dim">console.log(b) → </span><span className="text-red-300">ReferenceError: b is not defined</span></div>
        </div>
      </div>
    </Figure>
  );
}
