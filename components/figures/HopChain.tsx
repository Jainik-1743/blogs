export type Tone = "plain" | "warn" | "sky" | "ok" | "purple";

export type Hop = {
  title: string;
  desc: string;
  tone: Tone;
  /** Label shown on the connector *after* this hop. */
  edge?: string;
};

const tones: Record<Tone, string> = {
  plain: "border-line bg-bg-code text-ink",
  warn: "border-amber-400/50 bg-amber-400/10 text-amber-200",
  sky: "border-sky/50 bg-sky-soft text-sky-strong",
  ok: "border-emerald-400/50 bg-emerald-400/10 text-emerald-200",
  purple: "border-violet-400/50 bg-violet-400/10 text-violet-200",
};

/** A vertical chain of colour-coded hops with optional labels on the connectors — for request/lookup flows. */
export default function HopChain({ hops, label }: { hops: Hop[]; label: string }) {
  return (
    <ol className="m-0 mx-auto max-w-[26rem] list-none p-0" aria-label={label}>
      {hops.map((h, i) => (
        <li key={h.title} className="m-0">
          {i > 0 ? (
            <div className="flex items-center gap-2 py-1 pl-6">
              <span className="text-ink-dim" aria-hidden="true">
                ↓
              </span>
              {hops[i - 1].edge ? (
                <span className="font-mono text-[0.7rem] text-ink-dim">{hops[i - 1].edge}</span>
              ) : null}
            </div>
          ) : null}
          <div className={`rounded-lg border px-4 py-2.5 text-center ${tones[h.tone]}`}>
            <div className="text-[0.95rem] font-semibold">{h.title}</div>
            {h.desc ? <div className="text-[0.82rem] opacity-80">{h.desc}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
