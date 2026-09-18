import Figure from "./Figure";

/** Validated categorical pair on the dark surface (OKLCH band, CVD ΔE 23+). */
const VERCEL = "#d97706";
const AWS = "#0284c7";

// Plot geometry (viewBox units).
const L = 52, R = 528, T = 28, B = 232;

export default function CostCurveChart() {
  // Vercel: per-request pricing → starts near zero, climbs with traffic.
  const vercel = `M ${L} ${B - 8} C 250 ${B - 20}, 420 ${B - 60}, ${R} ${T + 10}`;
  // AWS: per-resource pricing → mostly fixed, one small step when a server is added.
  const aws = `M ${L} ${B - 88} H 330 L 346 ${B - 108} H ${R}`;

  return (
    <Figure caption="How the bill grows with traffic under the two pricing models." note="illustrative shape, not real prices">
      {/* Legend — always present for two series */}
      <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.75rem] text-ink-dim">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-0.5 w-5 rounded" style={{ background: VERCEL }} /> Vercel · pay per traffic
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-0.5 w-5 rounded" style={{ background: AWS }} /> AWS · pay per resource
        </span>
      </div>

      <svg viewBox="0 0 600 284" className="block h-auto w-full" role="img" aria-label="Line chart: Vercel cost rises steeply with traffic; AWS cost stays mostly flat.">
        {/* Gridlines — hairline, recessive */}
        {[T + 40, T + 100, B - 40].map((y) => (
          <line key={y} x1={L} x2={R} y1={y} y2={y} stroke="#1e293b" strokeWidth={1} />
        ))}
        {/* Axes */}
        <line x1={L} x2={R} y1={B} y2={B} stroke="#334155" strokeWidth={1} />
        <line x1={L} x2={L} y1={T} y2={B} stroke="#334155" strokeWidth={1} />

        {/* Region notes — the lesson's own words */}
        <text x={L + 8} y={B + 20} fill="#94a3b8" fontSize={11} fontFamily="var(--font-mono)">
          cheap in the beginning
        </text>
        <text x={R} y={B + 20} fill="#94a3b8" fontSize={11} fontFamily="var(--font-mono)" textAnchor="end">
          expensive at scale
        </text>

        {/* Series — 2px, round joins */}
        <path d={vercel} fill="none" stroke={VERCEL} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d={aws} fill="none" stroke={AWS} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* End markers with a 2px surface ring, and direct end-labels in text ink */}
        <circle cx={R} cy={T + 10} r={6} fill="#111a2e" />
        <circle cx={R} cy={T + 10} r={4} fill={VERCEL} />
        <text x={R + 8} y={T + 14} fill="#e2e8f0" fontSize={12} fontWeight={600}>Vercel</text>

        <circle cx={R} cy={B - 108} r={6} fill="#111a2e" />
        <circle cx={R} cy={B - 108} r={4} fill={AWS} />
        <text x={R + 8} y={B - 104} fill="#e2e8f0" fontSize={12} fontWeight={600}>AWS</text>

        {/* Axis titles */}
        <text x={(L + R) / 2} y={B + 24 + 14} fill="#94a3b8" fontSize={11} textAnchor="middle" fontFamily="var(--font-mono)">
          traffic (users, requests) →
        </text>
        <text
          transform={`translate(16 ${(T + B) / 2}) rotate(-90)`}
          fill="#94a3b8"
          fontSize={11}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
        >
          monthly cost →
        </text>
      </svg>
    </Figure>
  );
}
