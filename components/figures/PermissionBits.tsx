import Figure from "./Figure";

/** `-rw-r--r--` taken apart: one type character, then three groups of three bits. */
const groups = [
  { who: "owner", bits: "rw-", value: "4 + 2 = 6", meaning: "read + write" },
  { who: "group", bits: "r--", value: "4", meaning: "read only" },
  { who: "others", bits: "r--", value: "4", meaning: "read only" },
];

export default function PermissionBits() {
  return (
    <Figure caption="Reading -rw-r--r-- (mode 644): a type character, then three groups of read / write / execute — owner, group, others. Add 4 + 2 + 1 to get each digit.">
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 max-sm:grid-cols-2">
        <div className="rounded-lg border border-dashed border-line px-3 py-2 text-center max-sm:col-span-2">
          <div className="font-mono text-[1.4rem] text-ink-dim">-</div>
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink-dim">type</div>
          <div className="text-[0.78rem] text-ink-dim">- file · d folder</div>
        </div>
        {groups.map((g) => (
          <div key={g.who} className="rounded-lg border border-line bg-bg-code px-3 py-2 text-center">
            <div className="font-mono text-[1.4rem] tracking-[0.15em] text-sky-strong">{g.bits}</div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-sky">{g.who}</div>
            <div className="text-[0.78rem] text-ink">{g.meaning}</div>
            <div className="mt-1 font-mono text-[0.78rem] text-ink-dim">{g.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center font-mono text-[0.78rem] text-ink-dim">
        <span><span className="text-sky-strong">r</span> = 4 · read</span>
        <span><span className="text-sky-strong">w</span> = 2 · write</span>
        <span><span className="text-sky-strong">x</span> = 1 · execute</span>
      </div>
    </Figure>
  );
}
