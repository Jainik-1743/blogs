import Figure from "./Figure";

/** One ALB fanning out to N identical servers, with Auto Scaling adjusting N. */
const servers = [
  { name: "EC2 #1", state: "healthy", ok: true },
  { name: "EC2 #2", state: "healthy", ok: true },
  { name: "EC2 #3", state: "failed check — no traffic", ok: false },
  { name: "EC2 #4", state: "launching (CPU > 70%)", ok: true, new: true },
];

export default function ScalingFlow() {
  return (
    <Figure caption="ALB + Auto Scaling. The load balancer only sends traffic to servers that pass its health check; Auto Scaling changes how many servers exist based on load. Users see one address the whole time.">
      <div className="mx-auto max-w-[30rem]">
        <div className="rounded-lg border border-line bg-bg-code px-4 py-2 text-center text-[0.9rem]">
          1,000 users → <span className="font-mono text-sky-strong">yourapp.com</span>
        </div>
        <div className="py-1 text-center text-ink-dim" aria-hidden="true">↓</div>
        <div className="rounded-lg border border-amber-400/50 bg-amber-400/10 px-4 py-2.5 text-center">
          <div className="font-semibold text-amber-200">ALB</div>
          <div className="text-[0.8rem] text-amber-200/80">one public address · health check GET /health every 30 s</div>
        </div>
        <div className="py-1 text-center text-ink-dim" aria-hidden="true">↓ ↓ ↓ ↓</div>
        <div className="grid grid-cols-4 gap-2 max-sm:grid-cols-2">
          {servers.map((s) => (
            <div
              key={s.name}
              className={`rounded-lg border px-2 py-2 text-center ${
                s.ok
                  ? s.new
                    ? "border-dashed border-sky/60 bg-sky-soft"
                    : "border-emerald-400/50 bg-emerald-400/10"
                  : "border-red-400/50 bg-red-400/10"
              }`}
            >
              <div className="font-mono text-[0.85rem] font-semibold text-ink">{s.name}</div>
              <div className={`text-[0.72rem] ${s.ok ? (s.new ? "text-sky-strong" : "text-emerald-300") : "text-red-300"}`}>
                {s.state}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-line px-3 py-2 text-center font-mono text-[0.72rem] text-ink-dim">
          Auto Scaling group · min 2 · desired 3 → 4 · max 10 · rule: add 1 when avg CPU &gt; 70% for 5 min
        </div>
      </div>
    </Figure>
  );
}
