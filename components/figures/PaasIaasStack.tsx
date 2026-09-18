import Figure from "./Figure";

/** The layers between "your code" and a live URL. Same layers on both sides — the difference is who touches them. */
const layers = ["HTTPS + CDN", "Scaling", "Server / runtime", "Network", "Database"];

function Column({ title, tag, hidden }: { title: string; tag: string; hidden: boolean }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-semibold text-slate-50">{title}</span>
        <span
          className={`font-mono text-[0.7rem] uppercase tracking-[0.08em] ${hidden ? "text-ink-dim" : "text-sky"}`}
        >
          {tag}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="rounded-md border border-sky bg-sky-soft px-3 py-1.5 text-center text-[0.9rem] font-semibold text-slate-50">
          Your code
        </div>
        {layers.map((l) => (
          <div
            key={l}
            className={`rounded-md border px-3 py-1.5 text-center text-[0.88rem] ${
              hidden
                ? "border-dashed border-line text-ink-dim/70"
                : "border-line bg-bg-code text-ink"
            }`}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PaasIaasStack() {
  return (
    <Figure caption="Same layers under every app. On a PaaS they are hidden behind git push; on IaaS every one of them is yours to wire up.">
      <div className="grid gap-5 sm:grid-cols-2">
        <Column title="Vercel · PaaS" tag="hidden, managed for you" hidden />
        <Column title="AWS · IaaS" tag="visible, you connect them" hidden={false} />
      </div>
    </Figure>
  );
}
