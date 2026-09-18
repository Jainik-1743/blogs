import Figure from "./Figure";

const requests = ["Request 1", "Request 2", "Request 3"];

/** Left: every request lands on a fresh instance, so `counter` never gets past 1. Right: one process, counter climbs. */
export default function StatelessDiagram() {
  return (
    <Figure caption="Three requests, same counter code. Stateless: each request starts from a fresh instance. Persistent: one process remembers.">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Stateless */}
        <div>
          <div className="mb-3 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim">
            Stateless · Vercel
          </div>
          <div className="flex flex-col gap-2">
            {requests.map((r, i) => (
              <div key={r} className="grid grid-cols-[6rem_1.5rem_1fr] items-center gap-1">
                <span className="text-[0.85rem] text-ink-dim">{r}</span>
                <span className="text-center text-ink-dim">→</span>
                <div className="flex items-center justify-between rounded-md border border-dashed border-line px-3 py-1.5 text-[0.85rem]">
                  <span className="text-ink-dim">instance {String.fromCharCode(65 + i)}</span>
                  <code className="rounded bg-sky-soft px-1.5 py-0.5 font-mono text-[0.78rem] text-sky-strong">
                    counter = 1
                  </code>
                </div>
              </div>
            ))}
          </div>
          <p className="mb-0 mt-3 text-[0.85rem] text-ink-dim">Each instance disappears after answering. Nothing carries over.</p>
        </div>

        {/* Persistent */}
        <div>
          <div className="mb-3 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim">
            Persistent · EC2 / Railway
          </div>
          <div className="grid grid-cols-[6rem_1.5rem_1fr] items-stretch gap-1">
            <div className="flex flex-col justify-between py-1.5 text-[0.85rem] text-ink-dim">
              {requests.map((r) => (
                <span key={r}>{r}</span>
              ))}
            </div>
            <div className="flex flex-col justify-between py-1.5 text-center text-ink-dim">
              {requests.map((r) => (
                <span key={r}>→</span>
              ))}
            </div>
            <div className="flex flex-col justify-between rounded-md border border-sky bg-sky-soft px-3 py-1.5 text-[0.85rem]">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center justify-between">
                  <span className="text-ink">{n === 1 ? "one process, 24/7" : ""}</span>
                  <code className="rounded bg-bg-code px-1.5 py-0.5 font-mono text-[0.78rem] text-sky-strong">
                    counter = {n}
                  </code>
                </div>
              ))}
            </div>
          </div>
          <p className="mb-0 mt-3 text-[0.85rem] text-ink-dim">Same process every time, so memory survives between requests.</p>
        </div>
      </div>
    </Figure>
  );
}
