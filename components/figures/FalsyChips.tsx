import Figure from "./Figure";

/** The six falsy values, and a few of the truthy ones people get wrong. */
export default function FalsyChips() {
  const chip = (v: string, falsy: boolean) => (
    <span key={v} className={`rounded-md border px-2 py-1 font-mono text-[0.78rem] ${falsy ? "border-red-400/50 bg-red-400/10 text-red-200" : "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"}`}>{v}</span>
  );
  return (
    <Figure caption="Six values behave like false inside a condition. Everything else — including the surprising ones on the right — is truthy." note="falsy vs truthy">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-red-300">falsy · if (…) never runs</div>
          <div className="flex flex-wrap gap-1.5">{["undefined", "null", "0", '""', "false", "NaN"].map((v) => chip(v, true))}</div>
        </div>
        <div>
          <div className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-emerald-300">truthy · even these</div>
          <div className="flex flex-wrap gap-1.5">{['"0"', "[]", "{}", '" "', "-1", '"false"'].map((v) => chip(v, false))}</div>
        </div>
      </div>
    </Figure>
  );
}
