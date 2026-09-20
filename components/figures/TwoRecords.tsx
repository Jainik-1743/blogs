import Figure from "./Figure";

/** The Global Execution Context's memory as its two real records, side by side. */
export default function TwoRecords() {
  return (
    <Figure caption="Same Global Execution Context, two genuinely different storage areas — not a metaphor." note="two records">
      <div className="mx-auto max-w-[40rem] overflow-hidden rounded-lg border border-sky/50">
        <div className="border-b border-sky/40 bg-sky-soft px-4 py-2 text-center font-mono text-[0.78rem] uppercase tracking-[0.1em] text-sky-strong">
          Global Execution Context — memory
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="border-b border-line p-4 sm:border-b-0 sm:border-r">
            <div className="mb-1 font-semibold text-emerald-200">Object Environment Record</div>
            <div className="mb-3 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim">tied to the real window object</div>
            <ul className="m-0 list-none space-y-1 p-0 font-mono text-[0.8rem]">
              <li className="flex justify-between rounded bg-bg-code px-2 py-1"><span className="text-sky-strong">guestName</span><span className="text-emerald-200">&quot;Aditi&quot;</span></li>
              <li className="flex justify-between rounded bg-bg-code px-2 py-1"><span className="text-sky-strong">checkIn</span><span className="text-amber-200">{"{ …code }"}</span></li>
            </ul>
            <ul className="mb-0 mt-3 list-none space-y-1 p-0 text-[0.8rem] text-ink-dim">
              <li>holds: <code>var</code>, function declarations</li>
              <li><code>window.guestName</code> works</li>
              <li>→ visible to every script on the page</li>
            </ul>
          </div>
          <div className="p-4">
            <div className="mb-1 font-semibold text-violet-200">Declarative Environment Record</div>
            <div className="mb-3 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim">private, not tied to any object</div>
            <ul className="m-0 list-none space-y-1 p-0 font-mono text-[0.8rem]">
              <li className="flex justify-between rounded bg-bg-code px-2 py-1"><span className="text-sky-strong">roomNumber</span><span className="text-emerald-200">101</span></li>
              <li className="flex justify-between rounded bg-bg-code px-2 py-1"><span className="text-sky-strong">hotelName</span><span className="text-emerald-200">&quot;Grand Palace&quot;</span></li>
            </ul>
            <ul className="mb-0 mt-3 list-none space-y-1 p-0 text-[0.8rem] text-ink-dim">
              <li>holds: <code>let</code>, <code>const</code>, <code>class</code></li>
              <li><code>window.roomNumber</code> → <code>undefined</code></li>
              <li>→ invisible to other scripts</li>
            </ul>
          </div>
        </div>
      </div>
    </Figure>
  );
}
