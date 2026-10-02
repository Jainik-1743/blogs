import Figure from "./Figure";

/**
 * The target setup as nested boxes: global services on top, then the Mumbai region, the
 * VPC inside it, and public / private subnets inside that. Each box names the lesson that
 * builds it, so the picture doubles as the course map.
 */

type Tone = "sky" | "ok" | "warn" | "purple" | "plain";
const tones: Record<Tone, string> = {
  plain: "border-line bg-bg-code text-ink",
  sky: "border-sky/50 bg-sky-soft text-ink",
  ok: "border-emerald-400/50 bg-emerald-400/10 text-ink",
  warn: "border-amber-400/50 bg-amber-400/10 text-ink",
  purple: "border-violet-400/50 bg-violet-400/10 text-ink",
};

function Node({
  title,
  desc,
  lesson,
  tone,
  dashed,
}: {
  title: string;
  desc: string;
  lesson?: string;
  tone: Tone;
  dashed?: boolean;
}) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${tones[tone]} ${dashed ? "border-dashed opacity-75" : ""}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[0.88rem] font-semibold">{title}</span>
        {lesson && <span className="shrink-0 font-mono text-[0.64rem] text-sky">{lesson}</span>}
      </div>
      <div className="text-[0.76rem] leading-snug text-ink-dim">{desc}</div>
    </div>
  );
}

function Zone({ label, sub, className, children }: { label: string; sub?: string; className: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border border-dashed p-3 ${className}`}>
      <div className="mb-2 flex flex-wrap items-baseline gap-x-2 font-mono text-[0.68rem] uppercase tracking-[0.08em]">
        <span className="text-ink">{label}</span>
        {sub && <span className="normal-case tracking-normal text-ink-dim">{sub}</span>}
      </div>
      {children}
    </div>
  );
}

const Down = ({ label }: { label?: string }) => (
  <div className="flex items-center justify-center gap-2 py-1 text-ink-dim" aria-hidden="true">
    <span>↓</span>
    {label && <span className="font-mono text-[0.66rem]">{label}</span>}
  </div>
);

export default function ArchitectureMap() {
  return (
    <Figure caption="The finished setup, as boxes inside boxes. Global services sit outside any region; everything that holds your app or data lives inside your own private network in Mumbai." note="the course map">
      <div role="img" aria-label="Architecture: user to Route 53 to CloudFront (with S3), into the Mumbai region and VPC: load balancer in a public subnet, auto-scaled EC2 servers and RDS in private subnets. IAM controls access to all of it.">
        {/* Global edge */}
        <Zone label="Global" sub="not tied to one region" className="border-line">
          <div className="grid gap-2 sm:grid-cols-3">
            <Node title="User's browser" desc="opens yourapp.com" tone="plain" />
            <Node title="Route 53" desc="DNS: name → address" lesson="L3 · L13" tone="sky" />
            <Node title="CloudFront" desc="CDN: copies near users" lesson="L11" tone="ok" />
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <div className="max-sm:hidden" />
            <div className="max-sm:hidden" />
            <Node title="S3" desc="images, uploads, static files" lesson="L11" tone="ok" />
          </div>
        </Zone>

        <Down label="dynamic requests (pages, API)" />

        {/* Region → VPC → subnets */}
        <Zone label="Region · ap-south-1" sub="Mumbai — close to users in India" className="border-sky/40">
          <Zone label="VPC" sub="your private network" className="border-violet-400/40" >
            <Zone label="Public subnet" sub="reachable from the internet" className="border-amber-400/40">
              <Node title="ALB · load balancer" desc="the only door in; splits traffic across servers" lesson="L12" tone="warn" />
            </Zone>

            <Down label="only the ALB may talk to the servers" />

            <Zone label="Private subnet · app" sub="no direct internet access" className="border-line">
              <div className="mb-2 font-mono text-[0.66rem] text-ink-dim">Auto Scaling group — more servers start when traffic rises</div>
              <div className="grid grid-cols-3 gap-2 max-sm:grid-cols-1">
                <Node title="EC2" desc="Nginx → Next.js / Node" lesson="L7 · L10" tone="purple" />
                <Node title="EC2" desc="same app, second copy" tone="purple" />
                <Node title="EC2" desc="added under load" tone="purple" dashed />
              </div>
            </Zone>

            <Down label="port 5432, from the app servers only" />

            <Zone label="Private subnet · data" sub="never reachable from the internet" className="border-line">
              <div className="grid gap-2 sm:grid-cols-2">
                <Node title="RDS PostgreSQL" desc="primary — AWS backs it up and patches it" lesson="L8" tone="ok" />
                <Node title="Standby copy" desc="takes over if the primary fails" tone="ok" dashed />
              </div>
            </Zone>
          </Zone>
        </Zone>

        {/* IAM spans everything */}
        <div className="mt-3 rounded-lg border border-sky/50 bg-sky-soft px-3 py-2 text-[0.8rem] text-ink">
          <span className="font-semibold">IAM</span> <span className="font-mono text-[0.64rem] text-sky">L5</span>{" "}
          <span className="text-ink-dim">— sits over all of it and decides which person or server may touch which box.</span>
        </div>
      </div>
    </Figure>
  );
}
