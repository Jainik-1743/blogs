import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import DeployPipeline from "@/components/figures/DeployPipeline";
import FullStackMap from "@/components/figures/FullStackMap";
import VpcLayout from "@/components/figures/VpcLayout";
import InterviewQA from "@/components/InterviewQA";
import LessonIntro from "@/components/LessonIntro";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson, lessonHref, READINGS, readingHref } from "@/lib/lessons";

const lesson = getLesson("lesson-19")!;
const hostingReading = READINGS.find((r) => r.slug === "hosting-platforms");

export const metadata: Metadata = {
  title: `Lesson 19 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Concept: the bill is a design document" },
  { id: "how-aws-bills", label: "The five ways AWS charges you" },
  { id: "estimate", label: "What the final architecture costs" },
  { id: "levers", label: "The cost levers, ranked by payoff" },
  { id: "transfer", label: "Data transfer: the most overlooked cost" },
  { id: "commitments", label: "Savings Plans and Reserved Instances" },
  { id: "visibility", label: "Seeing the bill: tags, Cost Explorer, budgets, anomalies" },
  { id: "unit", label: "Unit economics: what does one customer cost?" },
  { id: "sweep", label: "The orphan sweep: finding what you forgot" },
  { id: "final-architecture", label: "The final architecture, box by box" },
  { id: "readiness", label: "Go-live readiness checklist" },
  { id: "honest", label: "Honest verdict: AWS or a platform?" },
  { id: "next", label: "Where to go next" },
  { id: "recap", label: "The whole course in twenty sentences" },
  { id: "interview", label: "Interview corner" },
  { id: "practice", label: "Capstone task" },
  { id: "teardown", label: "Tear it all down safely" },
  { id: "conclusion", label: "Conclusion" },
];

const billing: [string, string, string, string][] = [
  ["Compute time", "Per second while an instance runs", "EC2, RDS, ElastiCache, ALB hours, NAT hours", "Stopped ≠ free for RDS and cache; idle ≠ free for anything"],
  ["Storage", "Per GB per month, whether used or not", "EBS, RDS, S3, snapshots, ECR, log groups", "It bills until you delete it, even if nothing reads it"],
  ["Requests / usage units", "Per operation or per capacity unit", "S3 requests, ALB LCUs, CloudFront requests, Lambda", "Cheap per unit, huge at scale"],
  ["Data transfer", "Per GB leaving AWS or crossing zones/regions", "Internet egress, cross-AZ, NAT processing", "Inbound is free; the rest adds up quietly"],
  ["Addresses and endpoints", "Per hour just for existing", "Public IPv4, Elastic IPs, NAT gateways, interface endpoints", "Tiny individually, unnoticed in bulk"],
];

type Row = [string, string, string, string];
const tiers: Row[] = [
  ["Compute (EC2)", "1 × t3.micro  ≈ $8", "2 × t3.small  ≈ $32", "3 × t3.medium  ≈ $96"],
  ["Disks (EBS)", "≈ $2", "≈ $4", "≈ $6"],
  ["Load balancer", "none", "ALB ≈ $20", "ALB ≈ $30"],
  ["Public IPv4 addresses", "1 ≈ $4", "≈ 4 ≈ $14", "≈ 5 ≈ $18"],
  ["Database (RDS)", "t4g.micro, single-AZ ≈ $16", "t4g.micro, single-AZ ≈ $16", "t4g.small Multi-AZ ≈ $58"],
  ["Cache (ElastiCache)", "none", "t4g.micro ≈ $12", "2 × t4g.small ≈ $45"],
  ["NAT Gateway", "none", "none", "≈ $40 + data"],
  ["S3 + CloudFront", "≈ $1", "≈ $3", "≈ $15"],
  ["Route 53", "≈ $1", "≈ $1.50", "≈ $3"],
  ["Logs, alarms, dashboard", "≈ $2", "≈ $8", "≈ $25"],
  ["Security (GuardDuty, WAF, secrets)", "≈ $0–5", "≈ $15", "≈ $40"],
  ["Backups and snapshots", "≈ $1", "≈ $3", "≈ $15"],
];

const levers: [string, string, string, string][] = [
  ["1", "Delete what you are not using", "Unattached disks, old snapshots, idle load balancers, forgotten dev environments, unused Elastic IPs", "Often 10–30% of a neglected bill; zero risk"],
  ["2", "Right-size", "Look at CPU/memory over two weeks. A server at 8% CPU can drop a size. Compute Optimizer (free) recommends it", "20–50% of compute"],
  ["3", "Move to Graviton (ARM)", "t4g / m7g / db.t4g / cache.t4g instead of x86. Multi-arch Docker builds make it a one-line change", "~20% cheaper for the same performance"],
  ["4", "Commit to the steady baseline", "Compute Savings Plan or 1-year Reserved Instances for the servers and database that never go away", "30–60% off on-demand"],
  ["5", "Turn off non-production", "Dev/staging ASG to 0 and RDS stopped outside working hours; or destroy and re-apply with Terraform", "60–70% of those environments"],
  ["6", "Kill the NAT Gateway", "Use public subnets for app servers, free S3/DynamoDB gateway endpoints, only needed interface endpoints", "$40+/month per NAT"],
  ["7", "Set log retention and log levels", "30-day retention, info level, no health-check logging; export old logs to S3", "Frequently the largest surprise on the bill"],
  ["8", "Tier and expire in S3", "Lifecycle rules, Intelligent-Tiering, abort incomplete uploads, expire old versions", "Up to 40–70% of storage cost"],
  ["9", "Serve static content from the edge", "CloudFront in front of assets and cacheable pages: origin bandwidth and load drop", "Cuts egress and server count"],
  ["10", "Use Spot for interruptible work", "Background workers and batch jobs (never the primary database)", "Up to ~70% off those instances"],
];

const architecture: [string, string, string, string, string][] = [
  ["Route 53", "13", "Turns yourapp.com into the ALB / CDN address; health checks; private names", "Nobody can find the site (multi-provider is the fix at scale)", "~$1–3"],
  ["CloudFront + S3", "11", "Caches static files at the edge; stores uploads and assets privately", "Images and assets slow or missing; app still works", "~$3–15"],
  ["ALB + ACM", "12, 4", "Terminates HTTPS, spreads traffic, health-checks targets", "Site unreachable; AWS runs it across 2 AZs", "~$20–30"],
  ["Auto Scaling group + EC2", "7, 9, 12", "Stateless app servers running the Docker image, replaced not repaired", "One server dies → the ALB routes around it; ASG replaces it", "~$32–96"],
  ["VPC, subnets, SGs", "6", "The private building: public floor for the ALB and servers, private floor for data", "Misconfiguration exposes data (the biggest risk)", "Free"],
  ["RDS PostgreSQL", "8", "The system of record: relational data with backups and point-in-time restore", "App errors; restore or fail over. The one thing you cannot lose", "~$16–58"],
  ["ElastiCache (Valkey)", "16", "Cache, sessions, rate limits", "Slower, users may need to log in again; app should fail open", "~$12–45"],
  ["IAM roles + OIDC", "5, 14", "Every machine and pipeline has short-lived, scoped credentials", "Access denied errors; or, if too broad, a bigger breach", "Free"],
  ["ECR + GitHub Actions", "9, 14", "Builds, tests, ships immutable images; rollbacks by tag", "Cannot deploy; running site unaffected", "~$1 + free tier"],
  ["Terraform + S3 state", "15", "The whole estate as reviewed code", "Cannot change infra; running site unaffected", "Pennies"],
  ["CloudWatch + SNS", "17", "Metrics, logs, dashboards and alerts that reach a human", "You are blind, and nobody is told", "~$8"],
  ["CloudTrail, GuardDuty, backups", "18", "Detection, audit and recovery", "Breaches go unseen; disasters are unrecoverable", "~$15–20"],
];

const recap: [string, string][] = [
  ["0", "AWS gives you raw building blocks; Vercel gave you a finished house — the price of control is responsibility."],
  ["1", "Every server is Linux: learn the shell, permissions, users and processes, or nothing else is debuggable."],
  ["2", "A request is IP → port → firewall → app; “timed out” means blocked, “refused” means nothing is listening."],
  ["3", "DNS is a cached phone book; TTL is your rollback speed."],
  ["4", "HTTPS is a certificate chain of trust; let Let’s Encrypt and ACM do the renewing."],
  ["5", "IAM is deny-by-default; machines wear roles, humans use MFA, nobody holds long-lived keys."],
  ["6", "A subnet is public only because of one route-table row; data lives where no route reaches."],
  ["7", "A server is a rented Linux box; the manual deploy is the blueprint for every automation."],
  ["8", "Managed Postgres moves patching and backups to AWS, never your schema, queries or restores."],
  ["9", "A container is the whole box shipped once: build small, tag by SHA, keep secrets out."],
  ["10", "Nginx is the receptionist: TLS, compression, limits — and your app stays private."],
  ["11", "Files live in S3 and reach users through a CDN; version file names, do not invalidate."],
  ["12", "Scale by making servers stateless, cloning them behind an ALB, and testing by breaking them."],
  ["13", "Route 53 aliases make the bare domain point at AWS; weighted DNS is the safest migration."],
  ["14", "A pipeline is your manual deploy written down, with tests as a gate and OIDC as the key."],
  ["15", "Terraform is the blueprint: read every plan, guard the state, protect stateful resources."],
  ["16", "Redis is a shared whiteboard, never the only copy — cache with TTLs, fail open."],
  ["17", "Alert on symptoms with runbooks; logs are structured, tenant-tagged and never hold secrets."],
  ["18", "Assume breach: layers, least privilege, detection, and a backup you have actually restored."],
  ["19", "Cost is a design constraint you review monthly, per customer, like uptime."],
];

const readiness: [string, string][] = [
  ["Reliability", "≥ 2 servers in 2 AZs; health checks tested by killing a server; RDS backups on and a restore drilled; rollback rehearsed"],
  ["Security", "Lesson 18 checklist complete; nothing but the ALB public; no keys anywhere; MFA everywhere; secrets in SSM/Secrets Manager"],
  ["Performance", "Load tested at 2× expected peak; p95 known; DB connection budget computed at max scale; static assets on the CDN"],
  ["Observability", "Golden-signal alarms tested; logs structured; dashboard exists; someone is on the alert address; runbooks linked"],
  ["Operations", "Everything in Terraform; deploys via the pipeline with an approval; a documented way to reach a server (SSM)"],
  ["Cost", "Budget alerts set; tags active; log retention set; no NAT unless justified; monthly review scheduled"],
  ["People", "At least two people can deploy, roll back and restore; one runbook for “the site is down”; escalation path written"],
];

export default function LessonNineteenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          You have built a complete production system. This last lesson does the two things every
          engineer does at the end of a build: <strong>count the cost</strong> and{" "}
          <strong>review the whole design</strong>. They are one activity — in the cloud the bill{" "}
          <em>is</em> a description of the architecture, line by line. Every hour of a server, every
          gigabyte of a log, every idle IP appears there.
        </p>
        <Callout kind="note" label="The analogy — a utility bill for a building you designed">
          <p className="mb-0">
            An electricity bill tells you which appliances you left on. The AWS bill does the same for
            infrastructure: a forgotten load balancer, a chatty log group, a NAT gateway humming all
            month. Reading it monthly, with the diagram beside it, is how you keep the building
            efficient after it is built.
          </p>
        </Callout>
        <p>
          We will not treat cost as an afterthought to be optimised in a hurry, but as a property of the
          design, like latency: measured, budgeted and reviewed.
        </p>

        <h2 id="how-aws-bills">The five ways AWS charges you</h2>
        <p>
          Almost every line on the invoice is one of five patterns. Recognise the pattern and you can
          predict the cost of a service you have never used:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pattern</th>
                <th>How it is measured</th>
                <th>Examples</th>
                <th>The trap</th>
              </tr>
            </thead>
            <tbody>
              {billing.map(([p, m, e, t]) => (
                <tr key={p}>
                  <td className="whitespace-nowrap"><strong>{p}</strong></td>
                  <td>{m}</td>
                  <td>{e}</td>
                  <td>{t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The through-line: <strong>AWS bills for existing, not for using.</strong> A server with zero
          visitors costs the same as a busy one. That is the whole difference from the per-request
          pricing of Lesson 0 — and the reason forgotten resources are the single biggest source of
          waste.
        </p>

        <h2 id="estimate">What the final architecture costs</h2>
        <p>
          Here is the honest total for three sizes of the same design, in Mumbai, on-demand,
          running 24/7. They are estimates to plan with, not quotes: prices change, traffic varies, and
          the official <strong>AWS Pricing Calculator</strong> will refine any line.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Line</th>
                <th>Starter<br /><span className="font-normal text-ink-dim">one server</span></th>
                <th>Production<br /><span className="font-normal text-ink-dim">this course</span></th>
                <th>Resilient<br /><span className="font-normal text-ink-dim">scaled + HA</span></th>
              </tr>
            </thead>
            <tbody>
              {tiers.map(([line, a, b, c]) => (
                <tr key={line}>
                  <td><strong>{line}</strong></td>
                  <td>{a}</td>
                  <td>{b}</td>
                  <td>{c}</td>
                </tr>
              ))}
              <tr>
                <td><strong>Approx. total / month</strong></td>
                <td className="font-semibold text-emerald-300">≈ $35 (₹3,000)</td>
                <td className="font-semibold text-amber-300">≈ $130 (₹11,000)</td>
                <td className="font-semibold text-red-300">≈ $390 (₹33,000)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li>
            <strong>Reconciling with Lesson 0.</strong> It said &ldquo;$15 to $25&rdquo; for one small
            server plus one small database. That was compute and database only. The Starter column adds
            the disk, IP address, logging and backups that a real deployment also needs. It is still
            small, because the build now happens in CI (Lesson 14), so a t3.micro is enough to
            <em> run</em> the app.
          </li>
          <li>
            <strong>The big step is the load balancer tier.</strong> Going from Starter to Production
            roughly triples the bill — not because servers are expensive but because each new component
            (ALB, second server, cache, security services) has a fixed monthly charge. That is exactly
            when to ask, honestly, whether you need it yet (Lesson 12&apos;s warning).
          </li>
          <li>
            <strong>Usage-driven costs stay small at this scale</strong>: requests, CDN traffic and log
            volume matter far more once you have thousands of daily users.
          </li>
          <li>
            <strong>Compare with the alternative.</strong> A platform (Vercel Pro, Railway, Render) often
            costs $20–100 a month for a project of this size once you add a database, and includes the
            operations. The comparison is not the AWS line items against the platform line items — it is
            the AWS line items <em>plus your time</em> (see the honest verdict below).
          </li>
        </ul>

        <h2 id="levers">The cost levers, ranked by payoff</h2>
        <p>
          Work down this list in order. The top items are risk-free; the bottom ones need care. Most
          bills drop 30–50% with the first five.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Lever</th>
                <th>How</th>
                <th>Typical saving</th>
              </tr>
            </thead>
            <tbody>
              {levers.map(([n, l, h, s]) => (
                <tr key={n}>
                  <td>{n}</td>
                  <td><strong>{l}</strong></td>
                  <td>{h}</td>
                  <td>{s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="Do not save money by removing safety">
          <p className="mb-0">
            The wrong cuts are the ones that trade a small monthly saving for a large, rare loss: turning
            off backups, dropping to a single server for production, disabling encryption or logging,
            skipping the restore drill. Cut waste, not resilience. When in doubt, ask: &ldquo;what would
            this cost us on the day it fails?&rdquo;
          </p>
        </Callout>
        <h3>Right-sizing with evidence</h3>
        <p>
          Opt in to <strong>Compute Optimizer</strong> (free). After about 14 days of metrics it
          lists each instance as <em>over-provisioned</em>, <em>optimized</em> or{" "}
          <em>under-provisioned</em>, with a suggested size. You can check by hand too: two weeks of
          daily average and maximum CPU for the Auto Scaling group, in CloudWatch. Average 8% and
          maximum 30% means a smaller size is safe.
        </p>
        <p>
          Watch <strong>memory</strong> as well as CPU (from the agent of Lesson 17); CPU alone can
          mislead, and memory-bound apps often need the same RAM at a cheaper vCPU ratio.
        </p>

        <h2 id="transfer">Data transfer: the most overlooked cost</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Path</th>
                <th>Approx. price</th>
                <th>Design consequence</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Internet → AWS (inbound)</td><td className="font-semibold text-emerald-300">Free</td><td>Uploads cost nothing to receive</td></tr>
              <tr><td>AWS → internet, from EC2/ALB</td><td>First 100 GB/month free, then ~$0.109/GB</td><td>Serve big files from S3 + CloudFront instead</td></tr>
              <tr><td>S3 → CloudFront</td><td className="font-semibold text-emerald-300">Free</td><td>The CDN is often cheaper than serving the bytes yourself</td></tr>
              <tr><td>CloudFront → internet</td><td>First 1 TB/month free, then ~$0.11/GB (India)</td><td>Cache aggressively</td></tr>
              <tr><td>Between Availability Zones</td><td>~$0.01/GB each direction</td><td>Chatty cross-AZ traffic (app ↔ DB in another AZ) is a hidden tax</td></tr>
              <tr><td>Through a NAT Gateway</td><td>~$0.056/GB on top of the hourly charge</td><td>Send S3 traffic through a free gateway endpoint</td></tr>
              <tr><td>Same AZ, private IPs</td><td className="font-semibold text-emerald-300">Free</td><td>Talk over private addresses, not public ones</td></tr>
              <tr><td>Between regions</td><td>~$0.02+/GB</td><td>Cross-region replication and copies are not free</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          You cannot avoid these, but you can see them. In Cost Explorer, filter by usage type containing{" "}
          <code>DataTransfer</code> to find the culprit.
        </p>

        <h2 id="commitments">Savings Plans and Reserved Instances</h2>
        <p>
          On-demand pricing is the highest price, in return for zero commitment. If a resource will run
          for a year regardless, you can promise that and get a discount:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Compute Savings Plan</th>
                <th>Reserved Instance (RI)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>You commit to</strong></td><td>A dollar amount per hour of compute for 1 or 3 years</td><td>A specific instance type/engine/region for 1 or 3 years</td></tr>
              <tr><td><strong>Flexibility</strong></td><td className="font-semibold text-emerald-300">Applies across instance families, sizes, regions, even Fargate and Lambda</td><td>Tied to what you reserved (Convertible RIs bend a little)</td></tr>
              <tr><td><strong>Covers</strong></td><td>EC2, Fargate, Lambda</td><td>EC2, plus <strong>RDS and ElastiCache</strong> (which Savings Plans do not cover)</td></tr>
              <tr><td><strong>Discount</strong></td><td>Up to ~50–66% vs on-demand</td><td>Roughly 30–60%</td></tr>
              <tr><td><strong>Payment</strong></td><td>No upfront / partial / all upfront (more upfront = bigger discount)</td><td>Same options</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="A safe way to commit">
          <p className="mb-0">
            Wait until the workload has run steadily for two to three months. Commit only to the{" "}
            <strong>baseline you are certain to keep</strong> (say the two servers that never go away),
            leave the spikes on-demand, choose 1 year and no upfront to start, and keep a note of the
            expiry date. Committing to capacity you later shrink is the mistake, because the commitment
            is a bill you owe either way.
          </p>
        </Callout>

        <h2 id="visibility">Seeing the bill: tags, Cost Explorer, budgets, anomalies</h2>
        <p>
          You cannot manage a cost you cannot attribute. Four tools, in order of value:
        </p>
        <ol className="steps">
          <li>
            <h3>Tag everything — Terraform did most of it already</h3>
            <p>
              The <code>default_tags</code> block from Lesson 15 stamps every resource with{" "}
              <code>Project</code>, <code>Environment</code> and <code>ManagedBy</code>. One more step
              makes them useful: <strong>activate them as cost allocation tags</strong> in Billing →
              Cost allocation tags (they appear in reports about a day later, and only for costs after
              activation). Now the bill splits by project and environment.
            </p>
          </li>
          <li>
            <h3>Cost Explorer — read it weekly at first</h3>
            <p>
              In the console, group by <em>Service</em> first, then drill into the biggest by{" "}
              <em>Usage type</em>. Look at daily granularity for the month to spot the day a cost
              jumped, then match it to a deploy or a change.
            </p>
          </li>
          <li>
            <h3>Budgets — the smoke detector</h3>
            <p>
              Lesson 5 set one account-wide budget. Refine it: a monthly budget for the project with
              alerts at <strong>50%, 80% and 100% of actual</strong> and at <strong>100% of forecast</strong>{" "}
              (which fires <em>early</em>, when AWS predicts you will overspend, not after).
            </p>
            <p>
              Billing → <strong>Budgets</strong> → Create: monthly cost budget for{" "}
              <code>myapp</code>, with email alerts to the team address at 80% of actual and 100% of
              forecast.
            </p>
          </li>
          <li>
            <h3>Cost Anomaly Detection — the tripwire</h3>
            <p>
              Free. It learns your normal spend per service and alerts when something departs from it
              (a runaway log group, a crypto-miner in an unused region). Create a monitor for all
              services in Billing → Cost Anomaly Detection, and point the alert at the same SNS topic as
              your operational alarms. It would have caught most of the costly mistakes described in Lesson 5 within a day.
            </p>
          </li>
        </ol>

        <h2 id="unit">Unit economics: what does one customer cost?</h2>
        <p>
          For a multi-tenant SaaS, the total bill is the wrong number. The useful one is{" "}
          <strong>cost per tenant</strong>, because that is what you compare with what they pay you.
        </p>
        <Script
          title="a back-of-envelope model"
          code={`Monthly infrastructure (Production column)        ≈ $130
Active tenants                                    40
Fixed cost per tenant                             130 / 40 = $3.25

Add per-tenant variable costs:
  S3 storage (avg 2 GB × $0.025)                  $0.05
  Data out via CloudFront (avg 5 GB × $0.11)      $0.55      (after free tier)
  Email, SMS, third-party APIs                    $0.40
  Support and your time are NOT here yet.

≈ $4.25 per tenant per month.   Price of a plan: $29   →   ~85% gross margin on infrastructure`}
        />
        <p>
          The point is not the exact figures — it is that you can answer &ldquo;what happens when we
          have 400 tenants?&rdquo; (the fixed part barely moves; storage and transfer grow) and{" "}
          <strong>&ldquo;which customers are unprofitable?&rdquo;</strong> (the one storing 500 GB of
          video on a $29 plan). Use tenant-prefixed S3 keys and tenant IDs in logs (Lessons 11, 17) to
          measure real per-tenant storage and traffic, and set plan limits that protect your margin.
        </p>

        <h2 id="sweep">The orphan sweep: finding what you forgot</h2>
        <p>
          Everything you create keeps billing until deleted. A quarterly sweep pays for itself.
          Check these:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Look for</th>
                <th>Where</th>
                <th>Why it bills</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Unattached EBS volumes</td><td>EC2 → Volumes, state <em>available</em></td><td>Disks left behind by terminated servers. Snapshot if unsure, then delete</td></tr>
              <tr><td>Unattached Elastic IPs</td><td>EC2 → Elastic IPs, no instance</td><td>Still billed as public IPv4</td></tr>
              <tr><td>Old EBS and manual RDS snapshots</td><td>EC2 → Snapshots; RDS → Snapshots → Manual</td><td>Kept forever until deleted, including the drill copies</td></tr>
              <tr><td>A forgotten NAT Gateway</td><td>VPC → NAT gateways</td><td>~$40 a month each</td></tr>
              <tr><td>Idle load balancers</td><td>EC2 → Load balancers, no requests</td><td>Hourly charge whether used or not</td></tr>
              <tr><td>Log groups that never expire</td><td>CloudWatch → Log groups, retention <em>Never expire</em></td><td>Storage grows every month</td></tr>
              <tr><td>Instances in other regions</td><td>EC2 → <strong>EC2 Global View</strong></td><td>The one you forgot in Virginia. Also the first check after a suspected compromise</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="final-architecture">The final architecture, box by box</h2>
        <p>
          Everything the series built, in one place. First the path a user&apos;s request takes, then
          the network it runs in, then the path a code change takes to get there.
        </p>
        <FullStackMap />
        <VpcLayout />
        <DeployPipeline />
        <p>
          And the same system as a table: what each piece does, what breaks when it fails (the
          question that reveals whether you understand it), and what it costs:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Piece</th>
                <th>Lesson</th>
                <th>Job</th>
                <th>If it fails…</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {architecture.map(([p, l, j, f, c]) => (
                <tr key={p}>
                  <td className="whitespace-nowrap"><strong>{p}</strong></td>
                  <td>{l}</td>
                  <td>{j}</td>
                  <td>{f}</td>
                  <td className="whitespace-nowrap">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3>Single points of failure left in this design</h3>
        <p>
          A candid review lists what is <em>not</em> resilient, so you can decide what to spend on next:
        </p>
        <ul>
          <li>
            <strong>The database is single-AZ.</strong> An AZ outage means minutes of failover-by-restore.
            Fix: Multi-AZ (doubles the RDS line).
          </li>
          <li>
            <strong>One region.</strong> A whole-region outage takes you down. Fix: cross-region backups
            (already advised) for recovery; active-active is a large, expensive step most products never
            need.
          </li>
          <li>
            <strong>One AWS account.</strong> Production, staging and backups share a blast radius. Fix: AWS
            Organizations with separate accounts, the standard next step.
          </li>
          <li>
            <strong>One Redis node</strong> (sessions lost on failure). Fix: a replica with automatic
            failover.
          </li>
          <li>
            <strong>One person who understands it.</strong> Fix: the runbooks, the Terraform repository and
            the drills you wrote — plus a second person who has actually run them.
          </li>
        </ul>

        <h2 id="readiness">Go-live readiness checklist</h2>
        <p>
          Before a real launch, walk this table with someone else. Each row folds a whole lesson into one
          question:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Area</th>
                <th>Ready means</th>
              </tr>
            </thead>
            <tbody>
              {readiness.map(([a, r]) => (
                <tr key={a}>
                  <td className="whitespace-nowrap"><strong>{a}</strong></td>
                  <td>{r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="honest">Honest verdict: AWS or a platform?</h2>
        <p>
          After nineteen lessons, you are qualified to say something a beginner cannot:{" "}
          <strong>most projects should not run on raw AWS.</strong> You now know precisely what a
          platform such as Vercel, Railway or Render does for you (Lessons 6–18 compressed into a git
          push) and what it costs you in control. Weigh it with the real numbers:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Platform (Vercel / Railway / Render)</th>
                <th>Your own AWS setup</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Monthly bill, small scale</strong></td><td>Often lower or equal</td><td>~$35–130 in this design</td></tr>
              <tr><td><strong>Bill as traffic grows</strong></td><td>Grows with usage; can spike</td><td>Mostly fixed steps; cheaper per user at scale</td></tr>
              <tr><td><strong>Your time to operate</strong></td><td className="font-semibold text-emerald-300">Near zero</td><td className="font-semibold text-red-300">Real: patches, incidents, on-call, cost reviews. Budget several hours a month, and more when things break</td></tr>
              <tr><td><strong>Long jobs, workers, websockets, big uploads</strong></td><td>Limited or awkward</td><td className="font-semibold text-emerald-300">No limits</td></tr>
              <tr><td><strong>Database and network control</strong></td><td>Limited</td><td className="font-semibold text-emerald-300">Complete</td></tr>
              <tr><td><strong>Compliance, data residency, private networking</strong></td><td>Depends on the plan</td><td className="font-semibold text-emerald-300">Full control</td></tr>
              <tr><td><strong>Blast radius of your own mistakes</strong></td><td>Small</td><td>Large: you can delete production</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="A useful rule">
          <p className="mb-0">
            Engineer time is your most expensive resource. If operating AWS costs you ten hours a month,
            that is far more than the whole infrastructure bill. Move to your own AWS when a{" "}
            <strong>concrete need</strong> — workload limits, cost at scale, compliance, control — outweighs
            that time, and not before. Many teams settle on a hybrid: the front end on a platform,
            the heavy backend and data on AWS.{" "}
            {hostingReading ? (
              <>
                See <Link href={readingHref(hostingReading)}>{hostingReading.title}</Link> for the full
                decision guide.
              </>
            ) : null}
          </p>
        </Callout>
        <p>
          Knowing all of this is still valuable when you stay on a platform: you can debug what it hides,
          read its bill, evaluate its limits, and leave when you must. That was the goal from{" "}
          <Link href={lessonHref(getLesson("lesson-0")!)}>Lesson 0</Link>.
        </p>

        <h2 id="next">Where to go next</h2>
        <p>
          You have the foundations. Sensible next steps, by direction and by where you are in your career:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Direction</th>
                <th>What to learn</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Fewer servers to run</strong></td><td>ECS on Fargate, App Runner, Lambda</td><td>Run your containers without managing EC2 — the natural next step after Lesson 9</td></tr>
              <tr><td><strong>Bigger orchestration</strong></td><td>Kubernetes (EKS)</td><td>When you have many services and teams; expect a real operational cost</td></tr>
              <tr><td><strong>Better infra code</strong></td><td>Terraform modules and testing, AWS CDK, Pulumi</td><td>Reuse and safety at scale</td></tr>
              <tr><td><strong>Multi-account</strong></td><td>AWS Organizations, Control Tower, SCPs, IAM Identity Center for all</td><td>Isolation between environments and blast-radius control</td></tr>
              <tr><td><strong>Deeper data</strong></td><td>Aurora, read replicas, DynamoDB, OpenSearch, data pipelines</td><td>When Postgres on one instance is outgrown</td></tr>
              <tr><td><strong>Better operations</strong></td><td>OpenTelemetry, SLOs, incident response, chaos testing</td><td>Reliability as a discipline</td></tr>
              <tr><td><strong>FinOps</strong></td><td>Cost allocation, showback, commitments strategy</td><td>Cost as an engineering practice</td></tr>
              <tr><td><strong>Credentials</strong></td><td>AWS Solutions Architect Associate, then Professional or DevOps Engineer</td><td>A structured path through the rest of the platform</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>If you are early in your career:</strong> repeat the series once from an empty account
          with Terraform only, and destroy it at the end. Doing it twice is what turns understanding into
          skill. <strong>If you have several years behind you:</strong> concentrate on the judgement this
          series tried to teach — what not to build, where the failure modes are, how to measure, how to
          say &ldquo;not yet&rdquo; to a component — because that, not the console clicks, is what
          seniority looks like.
        </p>

        <h2 id="recap">The whole course in twenty sentences</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Lesson</th>
                <th>The sentence to remember</th>
              </tr>
            </thead>
            <tbody>
              {recap.map(([n, s]) => (
                <tr key={n}>
                  <td className="whitespace-nowrap">
                    <Link href={lessonHref(getLesson(`lesson-${n}`)!)}>Lesson {n}</Link>
                  </td>
                  <td>{s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="interview">Interview corner</h2>
        <p>
          The last set is the kind of open, whole-system question that senior interviews revolve around.
          Answer aloud, in a structured way, before opening.
        </p>
        <InterviewQA
          items={[
            {
              q: "Design the AWS architecture for a multi-tenant SaaS expecting 1,000 concurrent users. Walk me through it.",
              a: (
                <>
                  <p>
                    <strong>Edge:</strong> Route 53 (wildcard alias for tenant subdomains) → CloudFront for
                    assets and cacheable content, TLS via ACM.
                  </p>
                  <p>
                    <strong>Compute:</strong> ALB across two AZs → Auto Scaling group of stateless
                    containerised app servers (min 2, target-tracking on CPU or requests), rolled with instance
                    refresh from a CI/CD pipeline using OIDC.
                  </p>
                  <p>
                    <strong>Data:</strong> RDS PostgreSQL in private subnets (Multi-AZ when revenue justifies
                    it), tenant isolation in queries/RLS; S3 with tenant-prefixed keys and presigned uploads;
                    ElastiCache for sessions, cache and rate limits.
                  </p>
                  <p>
                    <strong>Operate:</strong> Terraform, CloudWatch alarms on golden signals, structured tenant-tagged
                    logs, backups with a tested restore, GuardDuty/CloudTrail, least-privilege IAM. Size it by
                    converting users to requests per second and load testing; check DB connections at max
                    scale.
                  </p>
                  <p className="mb-0">
                    <strong>Trade-offs to name:</strong> ALB tier cost vs a single server early, single-region
                    risk, and operating burden vs a platform.
                  </p>
                </>
              ),
            },
            {
              q: "Your AWS bill doubled this month. How do you investigate?",
              a: (
                <p className="mb-0">
                  Cost Explorer grouped by service, then usage type, at daily granularity to find the day it
                  changed; compare with deploys and changes. Common culprits: NAT or data-transfer charges,
                  log ingestion, a new instance or load balancer, a forgotten environment, an unexpected
                  region (check all regions). Use cost allocation tags to attribute it, Cost Anomaly Detection
                  to confirm, fix the cause, and add a budget or anomaly alert so it is caught sooner next time.
                </p>
              ),
            },
            {
              q: "How would you cut this system's cost by 30% without hurting reliability?",
              a: (
                <p className="mb-0">
                  Remove waste first (orphans, non-prod off-hours, log retention), right-size using two
                  weeks of metrics, move to Graviton, buy a Savings Plan and RDS/ElastiCache reservations for the
                  steady baseline, add S3 lifecycle rules, eliminate the NAT Gateway with endpoints, and improve
                  CDN caching. Do not touch backups, multi-AZ or monitoring.
                </p>
              ),
            },
            {
              q: "What is your strategy if the whole region fails?",
              a: (
                <p className="mb-0">
                  Decide the RTO/RPO first. Baseline: infrastructure in Terraform so it can be recreated in
                  another region, cross-region copies of RDS snapshots and S3 replication, DNS control in
                  Route 53, and a rehearsed runbook. Warm-standby or active-active shrink recovery time but
                  cost far more and add data-consistency complexity; choose by business need.
                </p>
              ),
            },
            {
              q: "A new engineer joins. What do they need to safely ship on day one?",
              a: (
                <p className="mb-0">
                  SSO access with MFA and least-privilege groups (no keys), the repository with the pipeline
                  and Terraform, branch protection with required checks, a staging environment that mirrors
                  production, the runbooks and dashboard, and a buddy for their first deploy and rollback drill.
                </p>
              ),
            },
            {
              q: "When would you recommend NOT using AWS directly for a project?",
              a: (
                <p className="mb-0">
                  When the team is small, traffic is modest, requirements fit a platform (frontend plus quick
                  API, standard database), and operating infrastructure would consume more engineer time than
                  it saves in cost or unlocks in capability. Revisit when concrete limits — long jobs,
                  compliance, cost at scale, network control — appear.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Capstone task</h2>
        <p>
          The final exercise is the whole course in one go. Do it in your own AWS account, with a budget
          alert set, and keep notes — they become your portfolio piece.
        </p>
        <ol>
          <li>
            <strong>Draw the architecture from memory</strong> on paper, labelling each box with its
            lesson number and Security Group rules. Compare with the figures above; fix the gaps.
          </li>
          <li>
            <strong>Rebuild it from Terraform</strong> in a fresh region (or a new account). Time it. Note
            everything that needed a manual step and bring it into code.
          </li>
          <li>
            <strong>Deploy an app through the pipeline</strong>, then break it with a bad release and
            recover with the rollback workflow. Record the time to recover.
          </li>
          <li>
            <strong>Run a game day</strong>: kill a server under load, stop Redis, fill a disk, revoke a
            key. For each, write what alarm fired (or failed to) and how long detection took.
          </li>
          <li>
            <strong>Do the restore drill</strong> and write down your measured RTO and RPO.
          </li>
          <li>
            <strong>Price it</strong> with the AWS Pricing Calculator, compare with your actual first-week
            bill in Cost Explorer, and explain any difference over 10%.
          </li>
          <li>
            <strong>Write the README</strong> a new teammate would need: architecture diagram, how to
            deploy, roll back, get a shell, restore, and who to call. Ask someone to follow it cold.
          </li>
          <li>
            <strong>Tear it down</strong> (next section) and confirm the bill returns to zero.
          </li>
        </ol>

        <h2 id="teardown">Tear it all down safely</h2>
        <p>
          When you are finished practising, remove everything so nothing bills while you are not looking.
          In order:
        </p>
        <ol className="steps">
          <li>
            <h3>Export anything you want to keep</h3>
            <p>
              Your notes, the Terraform code (in Git), a snapshot you still want. Once deleted, it is gone.
            </p>
          </li>
          <li>
            <h3>Destroy what Terraform created</h3>
            <CommandList
              title="Infrastructure"
              commands={[
                { cmd: "cd infra && terraform plan -destroy -var-file=prod.tfvars", note: "Read the list of what will be deleted — this is the plan you most want to read" },
                { cmd: "terraform destroy -var-file=prod.tfvars", note: "Remove prevent_destroy and deletion_protection on the database first if this really is a practice account (Lesson 15)" },
              ]}
            />
          </li>
          <li>
            <h3>Delete what you made by hand</h3>
            <ul>
              <li>S3 buckets: empty them <em>including old versions</em>, then delete. Also the CloudTrail and state buckets last.</li>
              <li>ECR repositories and their images; CloudWatch log groups.</li>
              <li>RDS manual snapshots, EBS snapshots and cross-region copies.</li>
              <li>The Route 53 hosted zone (it bills $0.50 a month while it exists) and any domain you no longer want, which auto-renews unless turned off.</li>
              <li>IAM roles, policies, users, the OIDC provider and access keys created for the exercise.</li>
              <li>GuardDuty detector, AWS Config recorder, CloudFront distributions (disable first, then delete).</li>
            </ul>
          </li>
          <li>
            <h3>Run the orphan sweep in every region, and check the bill tomorrow</h3>
            <p>
              Use the sweep commands above, then look at Cost Explorer the next day and again in a week. Keep
              the billing alert from Lesson 5 forever: it is free, and it is the smoke detector for the day
              you forget something.
            </p>
          </li>
        </ol>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          You started this series knowing how to <code>git push</code>. You can now design, build, secure,
          observe, price and rebuild a production system, and — more importantly — explain <em>why</em>{" "}
          every piece is there and what happens when it breaks.
        </p>
        <ul>
          <li>
            <strong>AWS bills for existing, not for using</strong>: compute, storage, requests, transfer and
            addresses. Read the bill like a diagram.
          </li>
          <li>
            <strong>Cost levers in order</strong>: delete waste, right-size, Graviton, commit to the
            baseline, turn off non-prod, remove NAT, control logs, tier storage, use the CDN.
          </li>
          <li>
            <strong>Make it visible</strong>: tags, Cost Explorer, budgets with forecast alerts, anomaly
            detection, and cost per tenant.
          </li>
          <li>
            <strong>Know your design&apos;s weak points</strong> — single-AZ database, single region, single
            account, single person — and spend deliberately on the ones that matter.
          </li>
          <li>
            <strong>Choose the platform on evidence</strong>, including the value of your own time.
          </li>
        </ul>
        <p>
          Servers, networks, databases and pipelines are just tools. The lasting skill is the mindset
          behind them: understand the layer beneath, automate what you have done by hand, assume things
          fail, and measure before you decide. Go build something, and destroy it, and build it again.
        </p>

        <hr />
        <p>
          End of Lesson 19 — and the end of <strong>DevOps, From Zero</strong>. Return to the{" "}
          <Link href="/devops">series index</Link> or the <Link href="/devops/glossary">glossary</Link>{" "}
          any time.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
