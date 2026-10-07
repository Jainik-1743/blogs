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
  ["2", "Right-size", "Look at CPU and memory over two weeks. A server at 8% CPU can move down one size. Compute Optimizer (free) gives advice", "20–50% of compute"],
  ["3", "Move to Graviton (ARM)", "Use t4g / m7g / db.t4g / cache.t4g instead of x86 types. Multi-arch Docker builds (one image that runs on both ARM and x86) make it a small change", "About 20% cheaper for similar performance"],
  ["4", "Commit to the steady baseline", "Compute Savings Plan (servers) or 1-year Reserved Instances / Database Savings Plan (database) for what never goes away", "30–60% off on-demand"],
  ["5", "Turn off non-production", "Set the dev/staging Auto Scaling group to 0 and stop RDS outside work hours; or destroy and re-create with Terraform", "60–70% of those environments"],
  ["6", "Kill the NAT Gateway", "Put app servers in public subnets, use the free S3/DynamoDB gateway endpoints, and add only the interface endpoints you need", "$40+/month per NAT"],
  ["7", "Set log retention and log levels", "30-day retention, info level, no health-check logging; export old logs to S3", "Frequently the largest surprise on the bill"],
  ["8", "Tier and expire in S3", "Lifecycle rules (automatic move or delete after N days), Intelligent-Tiering, abort incomplete uploads, expire old versions", "Up to 40–70% of storage cost"],
  ["9", "Serve static content from the edge", "CloudFront in front of assets and cacheable pages: origin bandwidth and load drop", "Cuts egress and server count"],
  ["10", "Use Spot for interruptible work", "Background workers and batch jobs that can safely stop and restart (never the main database)", "Up to about 90% off (often 60–70% in practice)"],
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
  ["Reliability", "At least 2 servers in 2 AZs; health checks tested by killing a server; RDS backups on and a restore practised; rollback rehearsed"],
  ["Security", "Lesson 18 checklist complete; nothing but the ALB public; no keys anywhere; MFA everywhere; secrets in SSM/Secrets Manager"],
  ["Performance", "Load tested at 2× expected peak; p95 known; DB connection budget computed at max scale; static assets on the CDN"],
  ["Observability", "Alarms on the four golden signals (latency, traffic, errors, saturation) tested; logs structured; dashboard exists; someone is on the alert address; runbooks linked"],
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
          You have built a complete production system. This last lesson does two things that every
          engineer does at the end of a build: <strong>count the cost</strong> and{" "}
          <strong>review the whole design</strong>. They are one job. In the cloud, the bill{" "}
          <em>is</em> a description of your design, line by line. Every hour a server runs, every
          gigabyte of logs and every idle IP address appears on it.
        </p>
        <Callout kind="note" label="Words used in this lesson">
          <ul className="mb-0">
            <li><strong>On-demand pricing</strong> is the normal price you pay per hour or per second, with no promise to keep using the service.</li>
            <li><strong>EC2</strong> is the AWS service that rents you virtual servers. Each server is called an <strong>instance</strong>. <strong>EBS</strong> is the network disk attached to an instance.</li>
            <li><strong>RDS</strong> is the AWS service that runs a database (here PostgreSQL) for you. <strong>ElastiCache</strong> is the AWS service that runs a fast in-memory cache (here Valkey, a Redis-compatible store).</li>
            <li><strong>S3</strong> is the AWS service that stores files (called objects) in buckets. <strong>CloudFront</strong> is a CDN: a network of servers around the world that keeps copies of your files close to users.</li>
            <li><strong>ALB (Application Load Balancer)</strong> is a service that receives web traffic and spreads it over several servers. An <strong>Availability Zone (AZ)</strong> is one separate data centre inside an AWS Region.</li>
            <li><strong>NAT Gateway</strong> is a managed box that lets servers in a private subnet reach the internet, but does not let the internet reach them.</li>
            <li><strong>Egress</strong> means data leaving AWS. <strong>Data transfer</strong> means data moving between places, and AWS charges for most of it.</li>
            <li><strong>Right-sizing</strong> means choosing the smallest server size that still does the job well.</li>
            <li><strong>Graviton</strong> is a family of ARM-based processors that AWS designs. They give the same work for a lower price than the usual x86 (Intel or AMD) processors.</li>
            <li><strong>Spot Instances</strong> are spare EC2 servers sold at a big discount. AWS can take them back with a short warning.</li>
            <li><strong>Terraform</strong> is a tool that creates cloud resources from code files. <strong>CI</strong> (continuous integration) is a system that builds and tests your code automatically on every change.</li>
          </ul>
        </Callout>
        <Callout kind="note" label="The analogy — a utility bill for a building you designed">
          <p className="mb-0">
            An electricity bill tells you which appliances you left on. The AWS bill does the same for
            infrastructure: a forgotten load balancer, a chatty log group, a NAT gateway humming all
            month. Reading it monthly, with the diagram beside it, is how you keep the building
            efficient after it is built.
          </p>
        </Callout>
        <p>
          Do not treat cost as something to fix in a hurry at the end. Treat it as a property of the
          design, like latency. Measure it, set a budget for it and review it.
        </p>

        <h2 id="how-aws-bills">The five ways AWS charges you</h2>
        <p>
          Almost every line on the invoice follows one of five patterns. If you know the pattern, you
          can guess the cost of a service you have never used:
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
          The main idea: <strong>AWS bills for existing, not for using.</strong> A server with zero
          visitors costs the same as a busy one. This is the big difference from the per-request
          pricing of Lesson 0. It is also why forgotten resources are the biggest source of waste.
        </p>

        <h2 id="estimate">What the final architecture costs</h2>
        <p>
          Here is an honest total for three sizes of the same design. The prices are for the Mumbai
          Region, on-demand, running 24 hours a day. They are estimates for planning, not quotes.
          Prices change and traffic varies. The <strong>AWS Pricing Calculator</strong> (a free AWS
          web tool where you enter your resources and get a monthly price) gives a more exact number
          for any line.
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
            <strong>Compare with Lesson 0.</strong> It said &ldquo;$15 to $25&rdquo; for one small
            server plus one small database. That counted only the server and the database. The Starter
            column also adds the disk, the IP address, logging and backups that a real deployment
            needs. It is still small. The build now happens in CI (Lesson 14), so a t3.micro server is
            enough to <em>run</em> the app.
          </li>
          <li>
            <strong>The big step is the load balancer tier.</strong> Going from Starter to Production
            roughly triples the bill. Servers are not the reason. Each new part (load balancer, second
            server, cache, security services) has a fixed monthly charge. This is the moment to ask
            honestly whether you need it yet (the warning from Lesson 12).
          </li>
          <li>
            <strong>Costs that depend on usage stay small at this scale.</strong> Requests, CDN traffic
            and log volume matter much more once you have thousands of daily users.
          </li>
          <li>
            <strong>Compare with the alternative.</strong> A platform (Vercel Pro, Railway, Render)
            often costs $20–100 a month for a project of this size once you add a database. That price
            also includes the operations work. So do not compare AWS line items with platform line
            items only. Compare the AWS line items <em>plus your time</em> (see the honest verdict
            below).
          </li>
        </ul>

        <h2 id="levers">The cost levers, ranked by payoff</h2>
        <p>
          A <strong>cost lever</strong> is one change that lowers the bill. Work down this list in
          order. The top items have no risk. The bottom ones need care. Most bills drop 30–50% after
          the first five.
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
            The wrong cuts save a little money every month but risk a large loss on a bad day. Examples
            are turning off backups, running production on a single server, switching off encryption or
            logging, and skipping the restore drill. Cut waste, not resilience. When in doubt, ask:
            &ldquo;what would this cost us on the day it fails?&rdquo;
          </p>
        </Callout>
        <h3>Right-sizing with evidence</h3>
        <p>
          <strong>Right-sizing</strong> means moving each server to the smallest size that still copes.
          <strong> Compute Optimizer</strong> is a free AWS service that does this analysis for you. You
          opt in, and it needs at least 30 hours of CloudWatch metrics from the last 14 days. Then it
          marks each instance as <em>over-provisioned</em> (too big), <em>optimized</em> (about
          right) or <em>under-provisioned</em> (too small), and suggests a size. You can also check by
          hand: look at two weeks of daily average and maximum CPU for the Auto Scaling group in
          CloudWatch. An average of 8% and a maximum of 30% means a smaller size is safe.
        </p>
        <p>
          Watch <strong>memory</strong> as well as CPU (you get memory numbers from the agent in
          Lesson 17). CPU alone can mislead you. An app that needs a lot of memory but little CPU
          should move to a type with a better memory-to-CPU ratio, not to a smaller one.
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
              <tr><td>AWS → internet, from EC2/ALB</td><td>First 100 GB/month free, then about $0.109/GB</td><td>Serve big files from S3 + CloudFront instead</td></tr>
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
          You cannot avoid all of these costs, but you can see them. In Cost Explorer (the AWS tool
          that charts your spending), filter by a usage type that contains <code>DataTransfer</code>
          to find the cause.
        </p>

        <h2 id="commitments">Savings Plans and Reserved Instances</h2>
        <p>
          On-demand pricing is the highest price. You pay it because you promise nothing. If you know a
          resource will run for a year anyway, you can promise that and get a discount. A{" "}
          <strong>Savings Plan</strong> is a promise to spend a fixed amount per hour for 1 or 3
          years. A <strong>Reserved Instance (RI)</strong> is a promise to run one specific instance
          type for 1 or 3 years. In both cases AWS gives you a lower price in return:
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
              <tr><td><strong>Covers</strong></td><td>EC2, Fargate, Lambda</td><td>EC2, plus <strong>RDS and ElastiCache</strong>. (Compute Savings Plans do not cover databases. A separate <em>Database Savings Plan</em>, 1 year only, now exists with smaller discounts, up to about 20% for provisioned RDS and ElastiCache Valkey.)</td></tr>
              <tr><td><strong>Discount</strong></td><td>Up to 66% vs on-demand</td><td>Up to about 70%; commonly 30–60%</td></tr>
              <tr><td><strong>Payment</strong></td><td>No upfront / partial / all upfront (more upfront = bigger discount)</td><td>Same options</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="A safe way to commit">
          <p className="mb-0">
            Wait until the workload has run steadily for two to three months. Commit only to the{" "}
            <strong>baseline you are sure to keep</strong> (for example, the two servers that never go
            away). Leave the spikes on-demand. Start with 1 year and no upfront payment, and write down
            the expiry date. The common mistake is to commit to capacity that you shrink later. You still
            owe that money.
          </p>
        </Callout>

        <h2 id="visibility">Seeing the bill: tags, Cost Explorer, budgets, anomalies</h2>
        <p>
          You cannot manage a cost if you cannot tell what caused it. Four tools help, in order of
          value:
        </p>
        <ol className="steps">
          <li>
            <h3>Tag everything — Terraform did most of it already</h3>
            <p>
              A <strong>tag</strong> is a label (a key and a value) that you attach to a resource. The{" "}
              <code>default_tags</code> block from Lesson 15 already puts <code>Project</code>,{" "}
              <code>Environment</code> and <code>ManagedBy</code> on every resource. One more step makes
              them useful: <strong>activate them as cost allocation tags</strong> in Billing → Cost
              allocation tags. They show up in reports about a day later, and only for costs after you
              activate them. Then the bill splits by project and environment.
            </p>
          </li>
          <li>
            <h3>Cost Explorer — read it weekly at first</h3>
            <p>
              <strong>Cost Explorer</strong> is the AWS tool that charts your spending over time. Group
              by <em>Service</em> first. Then open the biggest one and group by <em>Usage type</em>.
              Switch to daily view to find the day the cost jumped. Then match that day to a deploy or
              a change.
            </p>
          </li>
          <li>
            <h3>Budgets — the smoke detector</h3>
            <p>
              A <strong>budget</strong> is a limit you set for your spending. AWS sends an alert when you
              get near it. Lesson 5 set one budget for the whole account. Now make one for the project,
              with alerts at <strong>50%, 80% and 100% of actual</strong> spending and at{" "}
              <strong>100% of forecast</strong>. The forecast alert fires <em>early</em>, when AWS
              predicts that you will go over the limit, not after you have.
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
              <strong>Cost Anomaly Detection</strong> is a free AWS feature that learns your normal
              spending for each service and alerts you when it sees something unusual. Examples are a
              runaway log group, or a crypto-miner running in a Region you never use. Create a monitor
              for all services in Billing → Cost Anomaly Detection. Send the alert to the same SNS topic
              (a messaging channel that can email you) as your operational alarms. It would have caught
              most of the costly mistakes described in Lesson 5 within a day.
            </p>
          </li>
        </ol>

        <h2 id="unit">Unit economics: what does one customer cost?</h2>
        <p>
          A <strong>multi-tenant SaaS</strong> is one software service (SaaS means software sold as a
          service) that many customers, called <strong>tenants</strong>, share. For this kind of
          product, the total bill is not the most useful number. The useful number is{" "}
          <strong>cost per tenant</strong>, because you compare it with what each tenant pays you.
          This is called <strong>unit economics</strong>: the cost and income of one unit, here one
          customer.
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
          The exact numbers do not matter. What matters is that you can now answer two questions. The
          first is &ldquo;what happens when we have 400 tenants?&rdquo; The fixed part barely moves,
          while storage and transfer grow. The second is{" "}
          <strong>&ldquo;which customers lose us money?&rdquo;</strong> One example is a customer who
          stores 500 GB of video on a $29 plan. Use tenant names in S3 key prefixes and tenant IDs in
          logs (Lessons 11 and 17) to measure real storage and traffic for each tenant. Then set plan
          limits that protect your margin. (Gross margin is the share of the price left after the
          direct costs.)
        </p>

        <h2 id="sweep">The orphan sweep: finding what you forgot</h2>
        <p>
          An <strong>orphan</strong> is a resource that nothing uses any more but that still bills you.
          Everything you create keeps billing until you delete it. A sweep every three months pays for
          itself. Check these:
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
          Here is everything the series built, in one place. First you see the path a user&apos;s
          request takes. Then you see the network it runs in. Then you see the path a code change
          takes to get there.
        </p>
        <FullStackMap />
        <VpcLayout />
        <DeployPipeline />
        <p>
          Here is the same system as a table. It shows what each piece does, what breaks when it fails
          (the question that shows whether you really understand it) and what it costs:
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
          A <strong>single point of failure</strong> is one part that, if it breaks, stops the whole
          system. An honest review lists them, so you can decide what to spend money on next:
        </p>
        <ul>
          <li>
            <strong>The database is single-AZ.</strong> It runs in one Availability Zone only. If that
            zone fails, you must restore from a backup, and that takes time. Fix: Multi-AZ, which keeps
            a standby copy in a second zone (it doubles the RDS line).
          </li>
          <li>
            <strong>One Region.</strong> If a whole Region fails, you are down. Fix: keep backup copies in
            another Region (advised earlier) so you can recover. Active-active (running live in two
            Regions at the same time) is a large, costly step that most products never need.
          </li>
          <li>
            <strong>One AWS account.</strong> Production, staging and backups share one blast radius (the
            amount of damage one mistake or breach can cause). Fix: AWS Organizations, a service that
            manages many separate accounts together. This is the usual next step.
          </li>
          <li>
            <strong>One cache node</strong> (sessions are lost if it fails). Fix: add a replica, a second
            copy that takes over automatically.
          </li>
          <li>
            <strong>One person who understands it.</strong> Fix: use the runbooks (step-by-step guides for
            incidents), the Terraform repository and the drills you wrote. Also train a second person
            who has really run them.
          </li>
        </ul>

        <h2 id="readiness">Go-live readiness checklist</h2>
        <p>
          Before a real launch, go through this table with another person. Each row turns a whole
          lesson into one question:
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
          After nineteen lessons, you can say something a beginner cannot:{" "}
          <strong>most projects should not run on raw AWS.</strong> A <strong>platform</strong> (a
          service such as Vercel, Railway or Render that runs your app for you) does the work of
          Lessons 6–18 when you run <code>git push</code>. Now you know exactly what it does for you and
          what control you give up. Compare them with real numbers:
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
            An engineer&apos;s time is your most expensive resource. If running AWS takes ten hours a
            month, that time costs more than the whole infrastructure bill. Move to your own AWS only
            when a <strong>real need</strong> is bigger than that time cost. Real needs are workload
            limits, cost at scale, compliance rules or control. Many teams choose a mix: the front end on
            a platform, and the heavy backend and data on AWS.{" "}
            {hostingReading ? (
              <>
                See <Link href={readingHref(hostingReading)}>{hostingReading.title}</Link> for the full
                decision guide.
              </>
            ) : null}
          </p>
        </Callout>
        <p>
          This knowledge is still useful if you stay on a platform. You can find problems that it
          hides, read its bill, judge its limits and leave when you must. That was the goal from{" "}
          <Link href={lessonHref(getLesson("lesson-0")!)}>Lesson 0</Link>.
        </p>

        <h2 id="next">Where to go next</h2>
        <p>
          You now have the foundations. Here are sensible next steps, by direction:
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
              <tr><td><strong>Fewer servers to run</strong></td><td>ECS on Fargate, App Runner, Lambda</td><td>Run your containers without managing servers yourself. This is the natural next step after Lesson 9</td></tr>
              <tr><td><strong>Bigger orchestration</strong></td><td>Kubernetes (EKS)</td><td>Kubernetes is a system that runs and manages many containers across many servers. Use it when you have many services and teams. Expect real operating work</td></tr>
              <tr><td><strong>Better infra code</strong></td><td>Terraform modules and testing, AWS CDK, Pulumi</td><td>Reuse code and stay safe at scale (AWS CDK and Pulumi let you write infrastructure in a normal programming language)</td></tr>
              <tr><td><strong>Multi-account</strong></td><td>AWS Organizations, Control Tower, SCPs, IAM Identity Center for all</td><td>Keep environments apart and limit the damage of one mistake (SCPs are rules that cap what every account may do)</td></tr>
              <tr><td><strong>Deeper data</strong></td><td>Aurora, read replicas, DynamoDB, OpenSearch, data pipelines</td><td>For when one Postgres instance is no longer enough</td></tr>
              <tr><td><strong>Better operations</strong></td><td>OpenTelemetry, SLOs, incident response, chaos testing</td><td>Treat reliability as a skill of its own (SLO = a target for how reliable the service must be; chaos testing = breaking things on purpose to learn)</td></tr>
              <tr><td><strong>FinOps</strong></td><td>Cost allocation, showback (showing each team its own costs), commitment strategy</td><td>Treat cost as an engineering practice (FinOps = managing cloud money well)</td></tr>
              <tr><td><strong>Credentials</strong></td><td>AWS Solutions Architect Associate, then Professional or DevOps Engineer</td><td>A structured path through the rest of the platform</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>If you are early in your career:</strong> do the series again from an empty account,
          using only Terraform, and destroy everything at the end. Doing it twice turns understanding
          into skill. <strong>If you have several years of experience:</strong> focus on the judgement
          this series tried to teach. That means what not to build, where things can fail, how to
          measure, and how to say &ldquo;not yet&rdquo; to a new component. This judgement, not the
          console clicks, is what seniority looks like.
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
          These last questions are open questions about a whole system. Senior interviews are often
          built around them. Answer aloud, in a clear order, before you open the answer.
        </p>
        <InterviewQA
          items={[
            {
              q: "Design the AWS architecture for a multi-tenant SaaS expecting 1,000 concurrent users. Walk me through it.",
              a: (
                <>
                  <p>
                    <strong>Edge:</strong> Route 53 (a wildcard alias sends every tenant subdomain, like acme.yourapp.com, to the same place) → CloudFront for
                    assets and cacheable content, TLS via ACM.
                  </p>
                  <p>
                    <strong>Compute:</strong> ALB across two AZs → Auto Scaling group of stateless
                    containerised app servers (at least 2 servers; target tracking adds or removes servers to keep CPU or requests per server near a target), rolled with instance
                    refresh from a CI/CD pipeline using OIDC.
                  </p>
                  <p>
                    <strong>Data:</strong> RDS PostgreSQL in private subnets (Multi-AZ when revenue justifies
                    it), tenant isolation in queries or with RLS (row-level security, a PostgreSQL feature that hides other tenants&apos; rows); S3 with tenant-prefixed keys and presigned uploads;
                    ElastiCache for sessions, cache and rate limits.
                  </p>
                  <p>
                    <strong>Operate:</strong> Terraform, CloudWatch alarms on golden signals, structured tenant-tagged
                    logs, backups with a tested restore, GuardDuty/CloudTrail, least-privilege IAM. Work out the size by
                    turning users into requests per second, then load test it; check DB connections at max
                    scale.
                  </p>
                  <p className="mb-0">
                    <strong>Trade-offs to name:</strong> the extra cost of the load balancer tier compared with a
                    single server at the start, the risk of one Region, and the work of running it yourself
                    compared with a platform.
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
                  region (check all Regions). Use cost allocation tags to attribute it, Cost Anomaly Detection
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
                  Decide the RTO and RPO first. (RTO is how long you can be down. RPO is how much recent data you can lose.) Baseline: infrastructure in Terraform so it can be recreated in
                  another region, cross-region copies of RDS snapshots and S3 replication, DNS control in
                  Route 53, and a rehearsed runbook. Warm standby (a small copy always running in a second Region) or active-active makes recovery faster.
                  It costs much more and makes keeping data consistent harder. Choose by business need.
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
            <strong>Run a game day</strong> (a planned practice session where you break things on
            purpose): kill a server under load, stop Redis, fill a disk, revoke a key. For each one,
            write down which alarm fired (or failed to) and how long it took to notice.
          </li>
          <li>
            <strong>Do the restore drill</strong> and write down the RTO and RPO you measured.
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
          When you finish practising, remove everything so that nothing bills while you are not
          looking. Follow this order:
        </p>
        <ol className="steps">
          <li>
            <h3>Export anything you want to keep</h3>
            <p>
              Keep your notes, the Terraform code (in Git) and any snapshot you still want. After you delete something, it is gone.
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
              <li>S3 buckets: empty them <em>including old versions</em>, then delete them. Delete the CloudTrail and Terraform state buckets last.</li>
              <li>ECR repositories and their images; CloudWatch log groups.</li>
              <li>RDS manual snapshots, EBS snapshots and cross-region copies.</li>
              <li>The Route 53 hosted zone (it bills $0.50 a month while it exists) and any domain you no longer want (a domain renews by itself unless you turn that off).</li>
              <li>IAM roles, policies, users, the OIDC provider and access keys created for the exercise.</li>
              <li>GuardDuty detector, AWS Config recorder, CloudFront distributions (disable first, then delete).</li>
            </ul>
          </li>
          <li>
            <h3>Run the orphan sweep in every region, and check the bill tomorrow</h3>
            <p>
              Use the orphan sweep table above. Then look at Cost Explorer the next day and again after a
              week. Keep the billing alert from Lesson 5 for good. It is free, and it warns you on the day
              you forget something.
            </p>
          </li>
        </ol>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          You started this series knowing how to <code>git push</code>. Now you can design, build,
          secure, watch, price and rebuild a production system. More importantly, you can explain{" "}
          <em>why</em> every piece is there and what happens when it breaks.
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
          Servers, networks, databases and pipelines are only tools. The lasting skill is the way of
          thinking behind them. Understand the layer below you. Automate what you have done by hand.
          Expect things to fail. Measure before you decide. Go and build something, destroy it, and
          build it again.
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
