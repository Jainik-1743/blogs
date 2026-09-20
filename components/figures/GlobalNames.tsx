import Figure from "./Figure";

/** One global object, four environment-specific names. */
const NAMES: [string, string, string][] = [
  ["window", "browser", "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"],
  ["global", "Node.js", "border-violet-400/50 bg-violet-400/10 text-violet-200"],
  ["self", "Web Worker", "border-amber-400/50 bg-amber-400/10 text-amber-200"],
  ["globalThis", "everywhere", "border-sky/60 bg-sky-soft text-sky"],
];

export default function GlobalNames() {
  return (
    <Figure caption="Same object underneath, different local names — except globalThis, which always works." note="one object, many names">
      <div className="mx-auto max-w-[30rem]">
        <div className="grid grid-cols-2 gap-3">
          {NAMES.slice(0, 2).map(([n, env, cls]) => (
            <div key={n} className={`rounded-lg border px-3 py-2 text-center ${cls}`}><div className="font-mono text-[0.85rem] font-semibold">{n}</div><div className="text-[0.7rem] opacity-80">{env}</div></div>
          ))}
        </div>
        <div className="grid grid-cols-2 py-1 text-center font-mono text-sky"><span>↘</span><span>↙</span></div>
        <div className="mx-auto w-[12rem] rounded-full border border-sky/60 bg-sky-soft py-4 text-center">
          <div className="text-[0.85rem] font-semibold text-sky-strong">the global object</div>
          <div className="font-mono text-[0.65rem] text-ink-dim">one per program</div>
        </div>
        <div className="grid grid-cols-2 py-1 text-center font-mono text-sky"><span>↗</span><span>↖</span></div>
        <div className="grid grid-cols-2 gap-3">
          {NAMES.slice(2).map(([n, env, cls]) => (
            <div key={n} className={`rounded-lg border px-3 py-2 text-center ${cls}`}><div className="font-mono text-[0.85rem] font-semibold">{n}</div><div className="text-[0.7rem] opacity-80">{env}</div></div>
          ))}
        </div>
      </div>
    </Figure>
  );
}
