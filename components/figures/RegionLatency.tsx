import Figure from "./Figure";

/**
 * Round-trip time from a user in India to four AWS regions, and what that becomes once a
 * page needs several round trips (DNS, TCP, TLS, HTML, API call).
 */
const regions = [
  { code: "ap-south-1", city: "Mumbai", ms: 30 },
  { code: "ap-southeast-1", city: "Singapore", ms: 75 },
  { code: "eu-west-2", city: "London", ms: 140 },
  { code: "us-east-1", city: "N. Virginia", ms: 230 },
];
const TRIPS = 5;
const MAX = 230;

export default function RegionLatency() {
  return (
    <Figure caption="The same server, placed in four regions, seen from India. One round trip looks small — but a page load needs several, so distance multiplies." note="typical values; your ISP will vary">
      <div className="mb-2 grid grid-cols-[minmax(0,8.5rem)_1fr_4rem_4.5rem] gap-3 font-mono text-[0.66rem] uppercase tracking-[0.08em] text-ink-dim max-sm:grid-cols-[minmax(0,6.5rem)_1fr_3.5rem_4rem]">
        <span>Region</span>
        <span />
        <span className="text-right">1 trip</span>
        <span className="text-right">{TRIPS} trips</span>
      </div>
      <div className="grid gap-2">
        {regions.map((r, i) => (
          <div
            key={r.code}
            className="grid grid-cols-[minmax(0,8.5rem)_1fr_4rem_4.5rem] items-center gap-3 max-sm:grid-cols-[minmax(0,6.5rem)_1fr_3.5rem_4rem]"
          >
            <div className="min-w-0">
              <div className={`truncate text-[0.85rem] ${i === 0 ? "font-semibold text-sky" : "text-ink"}`}>{r.city}</div>
              <div className="truncate font-mono text-[0.66rem] text-ink-dim">{r.code}</div>
            </div>
            <div className="h-3.5 rounded-r-[4px] bg-bg-code">
              <div
                className={`h-3.5 rounded-r-[4px] ${i === 0 ? "bg-sky" : "bg-slate-500"}`}
                style={{ width: `${(r.ms / MAX) * 100}%` }}
              />
            </div>
            <span className="text-right font-mono text-[0.78rem] text-ink">~{r.ms} ms</span>
            <span className={`text-right font-mono text-[0.78rem] ${r.ms * TRIPS >= 1000 ? "text-red-300" : "text-ink"}`}>
              {r.ms * TRIPS >= 1000 ? `${(r.ms * TRIPS / 1000).toFixed(1)} s` : `${r.ms * TRIPS} ms`}
            </span>
          </div>
        ))}
      </div>
      <p className="m-0 mt-3 text-[0.78rem] text-ink-dim">
        {TRIPS} trips ≈ DNS lookup, TCP connect, TLS handshake, the HTML, and one API call. A CDN (Lesson 11) removes most of them for static files.
      </p>
    </Figure>
  );
}
