import Figure from "./Figure";

/** The four walls from "Why this matters", each drawn as a tiny picture of the problem. */

function Card({ n, title, children, foot }: { n: number; title: string; children: React.ReactNode; foot: string }) {
  return (
    <div className="flex flex-col rounded-lg border border-line bg-bg-code p-4">
      <div className="mb-3 flex items-baseline gap-2">
        <span className="font-mono text-[0.72rem] text-sky">0{n}</span>
        <span className="text-[0.95rem] font-semibold text-ink">{title}</span>
      </div>
      <div className="flex-1">{children}</div>
      <p className="m-0 mt-3 text-[0.8rem] leading-snug text-ink-dim">{foot}</p>
    </div>
  );
}

/** Bill bars: each step of traffic is 10× the last, and so is the bill. */
function CostBars() {
  const steps = [
    { label: "1k", h: 6 },
    { label: "10k", h: 16 },
    { label: "100k", h: 42 },
    { label: "1M", h: 100 },
  ];
  return (
    <div className="flex h-24 items-end gap-3" aria-hidden="true">
      {steps.map((s) => (
        <div key={s.label} className="flex flex-1 flex-col items-center gap-1">
          <div className="w-full rounded-t-[4px] bg-amber-500/80" style={{ height: `${s.h * 0.72}px` }} />
          <span className="font-mono text-[0.68rem] text-ink-dim">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/** A 3-minute job against a 60-second function limit. */
function Timeout() {
  return (
    <div aria-hidden="true">
      <div className="mb-1 flex justify-between font-mono text-[0.68rem] text-ink-dim">
        <span>0s</span>
        <span className="text-red-300">60s limit</span>
        <span>180s</span>
      </div>
      <div className="relative h-5 rounded-[4px] bg-bg-elev">
        <div className="absolute inset-y-0 left-0 w-1/3 rounded-l-[4px] bg-sky/70" />
        <div className="absolute inset-y-0 left-1/3 right-0 rounded-r-[4px] border border-dashed border-red-400/60" />
        <div className="absolute -top-1 -bottom-1 left-1/3 w-0.5 bg-red-400" />
      </div>
      <div className="mt-1.5 grid grid-cols-3 text-[0.72rem]">
        <span className="text-sky">PDF job runs…</span>
        <span className="col-span-2 text-right text-red-300">✕ killed — never finishes</span>
      </div>
    </div>
  );
}

/** Many short-lived function copies each open their own database connection. */
function Connections() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 12 }, (_, i) => (
          <span
            key={i}
            className={`grid h-5 w-5 place-items-center rounded-[3px] border font-mono text-[0.6rem] ${
              i < 9 ? "border-sky/50 bg-sky-soft text-sky" : "border-red-400/60 bg-red-400/10 text-red-300"
            }`}
          >
            ƒ
          </span>
        ))}
      </div>
      <span className="text-ink-dim">→</span>
      <div className="flex-1 rounded-lg border border-line bg-bg-elev px-2 py-2 text-center">
        <div className="text-[0.8rem] font-semibold text-ink">Database</div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-code">
          <div className="h-full w-full bg-gradient-to-r from-sky/70 via-amber-400/80 to-red-400" />
        </div>
        <div className="mt-1 font-mono text-[0.65rem] text-red-300">connections full</div>
      </div>
    </div>
  );
}

/** Things you want to add, and whether the platform lets you. */
function Control() {
  const items = ["Redis beside the app", "Private network", "Custom cache rules", "Always-on workers"];
  return (
    <ul className="m-0 grid list-none gap-1.5 p-0 text-[0.8rem]" aria-hidden="true">
      {items.map((t) => (
        <li key={t} className="m-0 grid grid-cols-[1fr_auto_auto] items-center gap-2">
          <span className="text-ink">{t}</span>
          <span className="rounded border border-red-400/40 px-1.5 font-mono text-[0.65rem] text-red-300">Vercel ✕</span>
          <span className="rounded border border-emerald-400/40 px-1.5 font-mono text-[0.65rem] text-emerald-300">AWS ✓</span>
        </li>
      ))}
    </ul>
  );
}

export default function VercelWalls() {
  return (
    <Figure caption="The four walls you hit on a PaaS as an app grows. Each one is a reason to learn the layer underneath." note="illustrative, not real prices">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card n={1} title="Cost grows with traffic" foot="Every request and every GB is billed. 10× the users ≈ 10× the bill.">
          <CostBars />
        </Card>
        <Card n={2} title="Long jobs get cut off" foot="A serverless function has a time limit. Anything longer — PDFs, imports, queues — is stopped halfway.">
          <Timeout />
        </Card>
        <Card n={3} title="Database connections run out" foot="Each short-lived copy of your function opens its own connection. Under load, the database refuses the extra ones.">
          <Connections />
        </Card>
        <Card n={4} title="You can't add your own pieces" foot="The platform decides what runs beside your code. On AWS you place every piece yourself.">
          <Control />
        </Card>
      </div>
    </Figure>
  );
}
