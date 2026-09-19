import Figure from "./Figure";

/** The one VPC layout this course builds: a public subnet that faces the internet, a private one that never does. */
export default function VpcLayout() {
  return (
    <Figure caption="One VPC, two kinds of subnet. Public subnets have a route to the Internet Gateway; private subnets do not, so the database can only be reached from inside." note="10.0.0.0/16">
      <div className="rounded-lg border border-line bg-bg-code px-3 py-2 text-center text-[0.85rem] text-ink-dim">
        Internet → Internet Gateway
      </div>
      <div className="py-1 text-center text-ink-dim" aria-hidden="true">↓</div>
      <div className="rounded-xl border border-dashed border-sky/50 p-3">
        <div className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-sky">VPC · 10.0.0.0/16 · ap-south-1</div>
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <div className="rounded-lg border border-emerald-400/50 bg-emerald-400/10 p-3">
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-emerald-300">Public subnet · 10.0.1.0/24</div>
            <div className="mt-1 text-[0.8rem] text-emerald-200/80">route table: 0.0.0.0/0 → Internet Gateway</div>
            <div className="mt-2 space-y-1.5">
              <div className="rounded-md border border-line bg-bg-code px-2 py-1.5 text-[0.82rem]">ALB — public IP</div>
              <div className="rounded-md border border-line bg-bg-code px-2 py-1.5 text-[0.82rem]">EC2 · Nginx + app — SG: 22 from you, 80/443 from ALB</div>
            </div>
          </div>
          <div className="rounded-lg border border-violet-400/50 bg-violet-400/10 p-3">
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-violet-300">Private subnet · 10.0.2.0/24</div>
            <div className="mt-1 text-[0.8rem] text-violet-200/80">route table: no internet route (NAT only for updates)</div>
            <div className="mt-2 space-y-1.5">
              <div className="rounded-md border border-line bg-bg-code px-2 py-1.5 text-[0.82rem]">RDS PostgreSQL :5432 — SG: only from the app's SG</div>
              <div className="rounded-md border border-line bg-bg-code px-2 py-1.5 text-[0.82rem]">Redis :6379 — SG: only from the app's SG</div>
            </div>
          </div>
        </div>
      </div>
    </Figure>
  );
}
