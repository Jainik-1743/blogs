import Figure from "./Figure";

/** Each function's Variable Environment points up to Global; neither points sideways. */
export default function OuterReference() {
  const box = (title: string, rows: [string, string][], tone: string) => (
    <div className={`rounded-lg border px-3 py-2 ${tone}`}>
      <div className="mb-1 text-[0.85rem] font-semibold text-ink">{title}</div>
      <ul className="m-0 list-none space-y-0.5 p-0 font-mono text-[0.76rem]">
        {rows.map(([k, v]) => (
          <li key={k} className="flex justify-between gap-2"><span className="text-sky-strong">{k}</span><span className={v === "Global" ? "text-sky" : v === "null" ? "text-red-300" : "text-emerald-200"}>{v}</span></li>
        ))}
      </ul>
    </div>
  );
  return (
    <Figure caption="Both functions point up to Global. Neither one points sideways at the other." note="outer references">
      <div className="mx-auto max-w-[36rem]">
        <div className="grid grid-cols-2 gap-4">
          {box("frontDesk()", [["roomNumber", "10"], ["outer →", "Global"]], "border-emerald-400/50 bg-emerald-400/10")}
          {box("housekeeping()", [["roomNumber", "100"], ["outer →", "Global"]], "border-violet-400/50 bg-violet-400/10")}
        </div>
        <div className="grid grid-cols-2 py-1 text-center font-mono text-[1rem] text-sky">
          <span>↘</span>
          <span>↙</span>
        </div>
        <div className="mb-2 text-center font-mono text-[0.62rem] uppercase tracking-[0.08em] text-ink-dim">no line ever connects these two boxes directly</div>
        <div className="mx-auto max-w-[22rem]">
          {box("Global", [["roomNumber", "1"], ["frontDesk", "fn"], ["housekeeping", "fn"], ["outer →", "null"]], "border-line bg-bg-elev")}
        </div>
      </div>
    </Figure>
  );
}
