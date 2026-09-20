import Figure from "./Figure";

/** checkIn's Variable Environment the instant its first line runs: the parameter is already filled, the var is not. */
export default function ParamsMemory() {
  return (
    <Figure caption="checkIn's Variable Environment at its very first line. The parameter was filled during the memory phase, because the call site already knew the value; the var still waits for its own line." note="first line of the body">
      <div className="mx-auto max-w-[30rem] overflow-hidden rounded-lg border border-sky/50">
        <div className="border-b border-sky/40 bg-sky-soft px-4 py-2 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-sky-strong">
          checkIn(&quot;Aditi&quot;) EC · paused on line 2
        </div>
        <ul className="m-0 list-none space-y-1 p-3 font-mono text-[0.82rem]">
          <li className="flex items-center justify-between rounded bg-bg-code px-2 py-1.5">
            <span><span className="text-sky-strong">guestName</span><span className="ml-2 text-[0.62rem] uppercase tracking-[0.08em] text-ink-dim">parameter</span></span>
            <span className="text-emerald-200">&quot;Aditi&quot; ✓ already assigned</span>
          </li>
          <li className="flex items-center justify-between rounded bg-bg-code px-2 py-1.5">
            <span><span className="text-sky-strong">stayNights</span><span className="ml-2 text-[0.62rem] uppercase tracking-[0.08em] text-ink-dim">var in body</span></span>
            <span className="text-ink-dim">undefined · until line 3</span>
          </li>
        </ul>
      </div>
    </Figure>
  );
}
