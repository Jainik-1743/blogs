import Figure from "./Figure";

/** Cache hit vs cache miss at a CloudFront edge. */
const paths = [
  {
    title: "First request from Mumbai (cache miss)",
    tone: "border-amber-400/50 bg-amber-400/10 text-amber-200",
    steps: ["User in Mumbai", "Mumbai edge: not cached", "S3 in ap-south-1 (origin)", "edge stores a copy", "user gets file — ~120 ms"],
  },
  {
    title: "Every request after that (cache hit)",
    tone: "border-emerald-400/50 bg-emerald-400/10 text-emerald-200",
    steps: ["User in Mumbai", "Mumbai edge: cached ✓", "user gets file — ~15 ms", "origin never touched", "repeat until TTL expires"],
  },
];

export default function CdnFlow() {
  return (
    <Figure caption="A CDN keeps a copy of each file at the edge nearest the user. Only the very first request for a file travels to your origin (S3 or your server).">
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        {paths.map((p) => (
          <div key={p.title} className={`rounded-lg border px-3 py-3 ${p.tone}`}>
            <div className="mb-2 text-center text-[0.85rem] font-semibold">{p.title}</div>
            <ol className="m-0 list-none space-y-1 p-0 text-center font-mono text-[0.75rem]">
              {p.steps.map((s, i) => (
                <li key={s}>
                  {i > 0 ? <div className="opacity-60">↓</div> : null}
                  <div className="rounded-md border border-current/30 bg-bg-code/60 px-2 py-1 text-ink">{s}</div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </Figure>
  );
}
