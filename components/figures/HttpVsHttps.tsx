import Figure from "./Figure";

/** The same login request, seen by someone on the same WiFi — once in the clear, once encrypted. */
const columns = [
  {
    title: "Over HTTP",
    tone: "border-red-400/50 bg-red-400/10",
    label: "text-red-300",
    lines: ["user@example.com", "Acme@2026"],
    note: "every character readable",
  },
  {
    title: "Over HTTPS",
    tone: "border-emerald-400/50 bg-emerald-400/10",
    label: "text-emerald-300",
    lines: ["8f a3 d9 e2 b1 7c 4f", "6a 2d 91 …"],
    note: "nothing useful",
  },
];

const box = "rounded-lg border border-line bg-bg-code px-3 py-2 text-center text-[0.85rem] text-ink-dim";

export default function HttpVsHttps() {
  return (
    <Figure caption="The data does not change. Only whether anyone in between can understand it.">
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        {columns.map((c) => (
          <div key={c.title} className="flex flex-col gap-2">
            <div className="text-center text-[0.95rem] font-semibold text-ink">{c.title}</div>
            <div className={box}>Browser sends login</div>
            <div className="text-center text-ink-dim" aria-hidden="true">↓</div>
            <div className={`rounded-lg border px-3 py-3 text-center ${c.tone}`}>
              <div className={`font-mono text-[0.68rem] uppercase tracking-[0.08em] ${c.label}`}>
                Anyone on the WiFi reads:
              </div>
              {c.lines.map((l) => (
                <div key={l} className="mt-1 font-mono text-[0.9rem] font-semibold text-ink">
                  {l}
                </div>
              ))}
              <div className={`mt-1 text-[0.78rem] ${c.label}`}>{c.note}</div>
            </div>
            <div className="text-center text-ink-dim" aria-hidden="true">↓</div>
            <div className={box}>Your server</div>
          </div>
        ))}
      </div>
    </Figure>
  );
}
