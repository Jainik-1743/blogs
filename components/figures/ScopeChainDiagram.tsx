import Figure from "./Figure";

/** Case 2 as a static picture: three nested Lexical Environments, the lookup walking up two hops. */
export default function ScopeChainDiagram() {
  const box = (title: string, sub: string, cls: string, found?: boolean) => (
    <div className={`rounded-lg border px-4 py-2 text-center ${cls}`}>
      <div className="text-[0.85rem] font-semibold text-ink">{title}</div>
      <div className={`font-mono text-[0.72rem] ${found ? "text-emerald-200" : "text-ink-dim"}`}>{sub}</div>
    </div>
  );
  return (
    <Figure caption="The lookup climbs one level per step — it never skips straight to the top." note="scope chain">
      <div className="mx-auto max-w-[22rem]">
        {box("checkAvailability()", "(no discountRate here)", "border-violet-400/50 bg-violet-400/10")}
        <div className="py-1 text-center font-mono text-[0.7rem] text-sky">↓ outer reference · hop 1</div>
        {box("frontDesk()", "(no discountRate here either)", "border-emerald-400/50 bg-emerald-400/10")}
        <div className="py-1 text-center font-mono text-[0.7rem] text-sky">↓ outer reference · hop 2</div>
        {box("Global", "discountRate: 10 — found here", "border-line bg-bg-elev", true)}
        <div className="py-1 text-center font-mono text-[0.7rem] text-ink-dim/50">↓ null</div>
        <div className="mt-1 text-center text-[0.75rem] text-ink-dim">two hops up, one level at a time, until the value is found</div>
      </div>
    </Figure>
  );
}
