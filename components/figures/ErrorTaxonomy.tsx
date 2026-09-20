import Figure from "./Figure";

/** The five error types, grouped by when the engine catches them. */
const PARSE = [
  ["SyntaxError", "Identifier has already been declared", "let x = 1; let x = 2;"],
  ["SyntaxError", "Missing initializer in const declaration", "const x;"],
];
const RUNTIME = [
  ["ReferenceError", "x is not defined", "console.log(neverDeclared)"],
  ["ReferenceError", "Cannot access 'x' before initialization", "console.log(a); let a = 1;"],
  ["TypeError", "Assignment to constant variable", "const x = 1; x = 2;"],
];

function Card({ e }: { e: string[] }) {
  const [kind, msg, ex] = e;
  return (
    <div className="rounded-lg border border-line bg-bg-code px-3 py-2">
      <div className="font-mono text-[0.72rem]"><span className={kind === "SyntaxError" ? "text-violet-300" : kind === "TypeError" ? "text-amber-300" : "text-red-300"}>{kind}</span><span className="text-ink-dim">: {msg}</span></div>
      <code className="mt-1 block text-[0.72rem] text-ink-dim/80">{ex}</code>
    </div>
  );
}

export default function ErrorTaxonomy() {
  return (
    <Figure caption="Five errors, two moments. The top two are found while reading the file, so nothing runs. The bottom three fire only when execution reaches the line." note="when each is caught">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_3fr]">
        <div>
          <div className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-violet-300">① parse phase · before any line runs</div>
          <div className="space-y-2">{PARSE.map((e) => <Card key={e[1]} e={e} />)}</div>
        </div>
        <div>
          <div className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-emerald-300">② execution phase · at the offending line</div>
          <div className="space-y-2">{RUNTIME.map((e) => <Card key={e[1]} e={e} />)}</div>
        </div>
      </div>
    </Figure>
  );
}
