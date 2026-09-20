import Figure from "./Figure";

/** var, let and const on every axis that matters, in one grid. */
const ROWS: [string, string, string, string][] = [
  ["Hoisted?", "yes", "yes", "yes"],
  ["Value before its line", "undefined", "🔒 TDZ (throws)", "🔒 TDZ (throws)"],
  ["Scope", "function (or global)", "block { }", "block { }"],
  ["Must initialise on declaration?", "no", "no (defaults to undefined)", "yes — SyntaxError otherwise"],
  ["Reassign later?", "yes", "yes", "no — TypeError"],
  ["Redeclare in same scope?", "yes", "no — SyntaxError", "no — SyntaxError"],
  ["Top-level: property of window?", "yes", "no", "no"],
  ["Fresh binding per loop iteration?", "no — one shared slot", "yes", "yes (no i++ though)"],
  ["Memory record (global)", "Object Environment Record", "Declarative Environment Record", "Declarative Environment Record"],
];

const tone = (v: string) =>
  v.startsWith("yes") ? "text-emerald-200" : v.startsWith("no") ? "text-red-300" : v.includes("TDZ") ? "text-red-300" : v === "undefined" ? "text-ink-dim" : "text-ink";

export default function KeywordMatrix() {
  return (
    <Figure caption="Every axis on which the three keywords differ. The first row is the one people get wrong: all three are hoisted." note="side by side">
      <div className="overflow-x-auto">
        <table className="my-0 w-full min-w-[34rem] text-[0.8rem]">
          <thead>
            <tr>
              <th className="border-0 border-b border-line px-2 py-1.5 text-left font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink-dim"></th>
              <th className="border-0 border-b border-line px-2 py-1.5 text-left font-mono text-amber-200">var</th>
              <th className="border-0 border-b border-line px-2 py-1.5 text-left font-mono text-sky">let</th>
              <th className="border-0 border-b border-line px-2 py-1.5 text-left font-mono text-violet-200">const</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([k, a, b, c]) => (
              <tr key={k} className="border-b border-line/50 last:border-0">
                <td className="border-0 px-2 py-1.5 text-ink-dim">{k}</td>
                {[a, b, c].map((v, i) => <td key={i} className={`border-0 px-2 py-1.5 font-mono text-[0.76rem] ${tone(v)}`}>{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Figure>
  );
}
