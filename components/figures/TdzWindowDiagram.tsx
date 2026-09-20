import Figure from "./Figure";

/** Where the TDZ starts and ends inside one block, line by line. */
const LINES: [string, "tdz" | "init" | "ok" | "none"][] = [
  ["function checkIn() {", "none"],
  ["  // TDZ for roomNumber starts here — the top of the scope", "tdz"],
  ["  console.log(typeof roomNumber); // ReferenceError", "tdz"],
  ["  helper();                        // ReferenceError if helper reads it", "tdz"],
  ["  let roomNumber;                  // ← declaration evaluated: TDZ ends", "init"],
  ["  console.log(roomNumber);         // undefined — unlocked, just empty", "ok"],
  ["  roomNumber = 101;", "ok"],
  ["}", "none"],
];

export default function TdzWindowDiagram() {
  return (
    <Figure caption="The TDZ is a stretch of lines, not a point: from the first line of the enclosing scope to the declaration itself. Note that let roomNumber; with no initialiser still ends it — the binding becomes undefined, not locked." note="tdz window">
      <div className="overflow-hidden rounded-lg border border-line bg-bg-code">
        <pre className="my-0 overflow-x-auto rounded-none border-0 bg-transparent px-0 py-2 text-[0.76rem]">
          {LINES.map(([src, kind], n) => (
            <div key={n} className={`grid grid-cols-[1.6rem_5.5rem_1fr] px-3 py-0.5 ${kind === "tdz" ? "bg-red-400/10" : kind === "init" ? "bg-amber-400/15" : kind === "ok" ? "bg-emerald-400/10" : ""}`}>
              <span className="select-none text-ink-dim/60">{n + 1}</span>
              <span className={`font-mono text-[0.62rem] uppercase tracking-[0.08em] ${kind === "tdz" ? "text-red-300" : kind === "init" ? "text-amber-300" : kind === "ok" ? "text-emerald-300" : "text-transparent"}`}>
                {kind === "tdz" ? "🔒 dead zone" : kind === "init" ? "unlock" : kind === "ok" ? "usable" : "·"}
              </span>
              <code className={kind === "none" ? "text-ink-dim" : "text-ink"}>{src}</code>
            </div>
          ))}
        </pre>
      </div>
    </Figure>
  );
}
