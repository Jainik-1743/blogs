import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import ScalingFlow from "@/components/figures/ScalingFlow";
import StatelessDiagram from "@/components/figures/StatelessDiagram";
import InterviewQA from "@/components/InterviewQA";
import LessonIntro from "@/components/LessonIntro";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson } from "@/lib/lessons";

const lesson = getLesson("lesson-12")!;

export const metadata: Metadata = {
  title: `Lesson 12 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Concept: many servers, one address" },
  { id: "why-this-matters", label: "Why one server is not enough" },
  { id: "stateless", label: "The prerequisite: stateless servers" },
  { id: "numbers", label: "What does “1000 concurrent users” actually mean" },
  { id: "alb", label: "How an ALB works: listener, rule, target group, health check" },
  { id: "auto-scaling", label: "How Auto Scaling works: template, group, policy" },
  { id: "build", label: "Build it, step by step" },
  { id: "health", label: "Health checks done properly" },
  { id: "policies", label: "Choosing a scaling policy" },
  { id: "deploys", label: "Deploying without downtime" },
  { id: "load-test", label: "Prove it: load test and kill a server" },
  { id: "gotchas", label: "The common pitfalls that cause real 502s" },
  { id: "cost", label: "What this costs" },
  { id: "troubleshooting", label: "Troubleshooting table" },
  { id: "interview", label: "Interview corner" },
  { id: "practice", label: "Practice task before Lesson 13" },
  { id: "conclusion", label: "Conclusion" },
];

const stateless: [string, string, string][] = [
  ["User sessions in server memory", "Server B does not know the user logged in on server A", "Signed cookie/JWT, or Redis (Lesson 16)"],
  ["Uploaded files on local disk", "Only one server has the file", "S3 (Lesson 11)"],
  ["Data in a local database or SQLite file", "Each server has different data", "RDS (Lesson 8)"],
  ["In-memory cache or counters", "Each server has its own copy; results differ", "Redis, or accept per-server caches for non-critical data"],
  ["Cron jobs / setInterval in the app", "With N servers the job runs N times", "One scheduler (EventBridge, a single worker) — never in the web tier"],
  ["Config or secrets in a file edited by hand", "New servers start without it", "SSM Parameter Store / Secrets Manager, read at boot"],
  ["Sticky assumptions like “the same server next time”", "The load balancer is free to pick any server", "Design every request to work anywhere"],
];

const lbTypes: [string, string, string][] = [
  ["ALB (Application)", "Layer 7: understands HTTP. Routes by host, path, header; TLS; WebSockets; redirects", "Web apps and APIs — our choice"],
  ["NLB (Network)", "Layer 4: raw TCP/UDP, millions of connections, fixed IPs, ultra-low latency", "Databases, gaming, non-HTTP protocols, static IP needs"],
  ["Gateway LB", "Layer 3: sends traffic through firewall/inspection appliances", "Security appliances (rare)"],
  ["Classic LB", "The legacy predecessor of ALB and NLB", "Do not use for new work"],
];

const trouble: [string, string, string][] = [
  ["Targets show “unhealthy” in the target group", "Health-check path returns non-200, wrong port, web-sg does not allow ALB, or the app is still booting", "Read the reason in the target's Health status details. curl the path from the instance itself. Check web-sg allows 80 from alb-sg"],
  ["502 Bad Gateway from the ALB", "Target closed the connection early (keep-alive timeout shorter than the ALB idle timeout) or crashed mid-request", "Set Node keepAliveTimeout above 60 s (see common pitfalls). Check app logs at that time"],
  ["503 Service Unavailable", "The target group has no healthy targets", "Fix health checks; check the ASG actually launched instances (Activity history)"],
  ["504 Gateway Timeout", "The app took longer than the ALB idle timeout (60 s default)", "Find the slow endpoint; move long work to a background job"],
  ["Instances are launched and terminated in a loop", "They fail the health check before the app is ready, so the ASG kills them", "Increase --health-check-grace-period beyond boot time; read /var/log/cloud-init-output.log"],
  ["Scaling never triggers", "Metric not moving, policy attached to the wrong metric, max-size already reached, or the group is in warmup", "Check the alarm state in CloudWatch and the group’s Max"],
  ["Users get logged out randomly", "Sessions stored in server memory; the ALB switches servers", "Move sessions to a cookie/JWT or Redis. Sticky sessions only as a stopgap"],
  ["Some users see old code, some new", "A rolling deploy is in progress, or one server missed the update", "Deploy through instance refresh so all servers converge; tag images by SHA"],
];

export default function LessonTwelvePage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          Two AWS services, one job: <strong>make your app survive success</strong>.
        </p>
        <ul>
          <li>
            An <strong>Application Load Balancer (ALB)</strong> gives users one stable address and
            spreads their requests across many identical servers, sending traffic only to servers
            that are healthy.
          </li>
          <li>
            <strong>Auto Scaling</strong> decides <em>how many</em> servers exist: it launches more
            when traffic rises, replaces any that fail, and removes extras when the rush is over.
          </li>
        </ul>
        <Callout kind="note" label="The analogy — a restaurant on a busy night">
          <p className="mb-0">
            The <strong>ALB is the host at the door</strong>: greets everyone, sends each party to a
            table that is free, and never seats anyone at a table that has a broken leg (health
            check). <strong>Auto Scaling is the manager</strong> who calls in more waiters when the
            queue grows and sends them home when it is quiet. The customers only ever see one
            restaurant.
          </p>
        </Callout>
        <ScalingFlow />

        <h2 id="why-this-matters">Why one server is not enough</h2>
        <ul>
          <li>
            <strong>Capacity ceiling.</strong> A t3.small has 2 CPU cores. Past a point, more
            requests just queue and slow down, and then time out.
          </li>
          <li>
            <strong>Single point of failure.</strong> One server means one crash, one bad deploy, one
            reboot for patching — and the whole site is down.
          </li>
          <li>
            <strong>Deploys cause downtime.</strong> With one server there is nowhere to send users
            while you restart it.
          </li>
          <li>
            <strong>You pay for the peak, all month.</strong> A server large enough for the busiest
            hour sits idle the other 23. Elastic capacity charges for what you use.
          </li>
        </ul>
        <p>
          This is the moment the AWS-vs-Vercel comparison from Lesson 0 pays off: Vercel scaled your
          app invisibly. You are now building the same behaviour on purpose, with every part
          visible and every part tunable.
        </p>

        <h2 id="stateless">The prerequisite: stateless servers</h2>
        <p>
          Load balancing has one iron requirement: <strong>any request may go to any server</strong>.
          If a server remembers something the others do not, users will hit intermittent, maddening
          bugs. Lessons 8 and 11 removed the two biggest sources (database and files). Audit the
          rest before you scale:
        </p>
        <StatelessDiagram />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>If your app does this…</th>
                <th>…scaling breaks like this</th>
                <th>Fix</th>
              </tr>
            </thead>
            <tbody>
              {stateless.map(([a, b, c]) => (
                <tr key={a}>
                  <td>{a}</td>
                  <td>{b}</td>
                  <td>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="Scaling a stateful app multiplies bugs, not capacity">
          <p className="mb-0">
            The most common failure of &ldquo;we added a second server&rdquo; is users being logged
            out on every other click. Do this audit <em>first</em>. It is far cheaper than debugging
            it in production.
          </p>
        </Callout>

        <h2 id="numbers">What does &ldquo;1000 concurrent users&rdquo; actually mean</h2>
        <p>
          The lesson title promises 1000+ concurrent users. Before buying anything, understand what
          that number does and does not tell you. <strong>Concurrent users are not requests per
          second.</strong> A person spends most of their time reading, not clicking.
        </p>
        <Callout kind="note" label="The back-of-envelope formula">
          <p className="mb-0">
            <strong>requests per second ≈ concurrent users ÷ seconds between actions.</strong> 1,000
            users who each do something every 10 seconds ≈ <strong>100 requests/second</strong>. If
            each does something every 3 seconds, ≈ 330 requests/second. A page load is several
            requests (HTML, API calls, assets) — but with a CDN, assets never reach your servers.
          </p>
        </Callout>
        <p>Then ask how many requests one server can handle:</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kind of request</th>
                <th>Rough throughput per vCPU</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Tiny JSON response, no database</td><td>500–2,000 req/s</td></tr>
              <tr><td>Server-rendered page, a couple of database queries</td><td>30–150 req/s</td></tr>
              <tr><td>Heavy: image processing, reports, big joins</td><td>1–10 req/s</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          These are wide ranges on purpose: <strong>you must measure your own app</strong> (see the
          load-test section). With a mid-range app doing ~60 req/s per vCPU, a t3.small (2 vCPU) is
          about 120 req/s, so 1,000 casual users need <strong>2–3 servers</strong> and you want
          headroom for spikes and for losing one. That is why the group has a minimum of{" "}
          <strong>2</strong> (one per Availability Zone) and a maximum of 6.
        </p>
        <Callout kind="warn" label="The database usually breaks first">
          <p className="mb-0">
            Six servers with a pool of 10 each is 60 database connections; RDS on a small instance
            allows about 100 (Lesson 8). When you scale the web tier, do the connection arithmetic
            for the database tier <em>at the maximum</em> server count, or consider RDS Proxy.
          </p>
        </Callout>

        <h2 id="alb">How an ALB works: listener, rule, target group, health check</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Part</th>
                <th>What it is</th>
                <th>Ours</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Load balancer</strong></td>
                <td>The public entry point. Lives in at least two public subnets in two AZs. Gets a DNS name, not a fixed IP.</td>
                <td><code>myapp-alb</code></td>
              </tr>
              <tr>
                <td><strong>Listener</strong></td>
                <td>&ldquo;Listen on this port and protocol.&rdquo; Holds the rules and the TLS certificate.</td>
                <td>443 HTTPS, 80 HTTP → redirect</td>
              </tr>
              <tr>
                <td><strong>Rule</strong></td>
                <td>&ldquo;If host/path/header matches, do this action&rdquo; (forward, redirect, fixed response).</td>
                <td>default: forward to <code>myapp-tg</code></td>
              </tr>
              <tr>
                <td><strong>Target group</strong></td>
                <td>The pool of servers that share the work, plus how to health-check them.</td>
                <td><code>myapp-tg</code>, port 80</td>
              </tr>
              <tr>
                <td><strong>Health check</strong></td>
                <td>The ALB requests a path every few seconds; only servers that answer 200 receive traffic.</td>
                <td><code>GET /api/health</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Rules make one ALB serve many apps.</strong> Host-based:{" "}
          <code>api.yourapp.com</code> → API target group, <code>yourapp.com</code> → web target
          group. Path-based: <code>/api/*</code> → one group, everything else → another. This is how
          a single $20 load balancer replaces several.
        </p>
        <h3>Which load balancer?</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Works at</th>
                <th>Use for</th>
              </tr>
            </thead>
            <tbody>
              {lbTypes.map(([t, w, u]) => (
                <tr key={t}>
                  <td className="whitespace-nowrap"><strong>{t}</strong></td>
                  <td>{w}</td>
                  <td>{u}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="TLS moves to the ALB">
          <p className="mb-0">
            The ALB terminates HTTPS using a <strong>free ACM certificate</strong> that AWS renews
            for you. So the servers behind it no longer need Certbot or port 443; they speak plain
            HTTP on port 80 inside the VPC. This is the payoff of Lesson 4&apos;s &ldquo;ACM&rdquo;
            mention.
          </p>
        </Callout>

        <h2 id="auto-scaling">How Auto Scaling works: template, group, policy</h2>
        <p>Three objects, in this order of dependence:</p>
        <ol>
          <li>
            <strong>Launch template</strong> — the recipe for one server: AMI, instance type, key,
            Security Group, IAM profile, and a <strong>user-data</strong> script that runs on first
            boot. Versioned, so you can change it and roll back.
          </li>
          <li>
            <strong>Auto Scaling Group (ASG)</strong> — &ldquo;keep between <em>min</em> and{" "}
            <em>max</em> servers from this template, spread across these subnets, registered in this
            target group.&rdquo; It replaces failed instances automatically.
          </li>
          <li>
            <strong>Scaling policy</strong> — the rule that moves the desired count between min and
            max, e.g. &ldquo;keep average CPU near 50%&rdquo;.
          </li>
        </ol>
        <Callout kind="note" label="Pets vs cattle">
          <p className="mb-0">
            The lesson-7 server was a <em>pet</em>: named, hand-tended, irreplaceable. ASG instances
            are <em>cattle</em>: identical, numbered, and replaced (never repaired) when sick. The
            user-data script is what makes replacement instant — a new server must become fully
            ready with <strong>zero human steps</strong>. That is the whole reason Lessons 9 and 11
            came first.
          </p>
        </Callout>

        <h2 id="build">Build it, step by step</h2>
        <p>
          You need the network from Lesson 6, an image in ECR (Lesson 9) and a domain (Lesson 3).
          Each step is one console screen; the table under each step lists the only fields that
          matter.
        </p>
        <ol className="steps">
          <li>
            <h3>Request the HTTPS certificate</h3>
            <p>
              ACM (in <code>ap-south-1</code>, the ALB&apos;s region) → Request a public
              certificate for <code>yourapp.com</code> <strong>and</strong>{" "}
              <code>*.yourapp.com</code>, validated by DNS. Click &ldquo;Create records in Route
              53&rdquo; and it is issued in a few minutes. The wildcard covers every tenant
              subdomain; the apex is listed separately because <code>*.yourapp.com</code> does not
              match <code>yourapp.com</code> itself.
            </p>
          </li>
          <li>
            <h3>Create the target group (the pool)</h3>
            <p>
              EC2 → Target groups → Create: type <em>Instances</em>, HTTP port 80, the{" "}
              <code>myapp</code> VPC. Health check path <code>/api/health</code>, interval 15 s,
              healthy after 2 passes, unhealthy after 3. Register no targets — Auto Scaling will do
              it. Afterwards, under Attributes, lower the <strong>deregistration delay</strong> from
              300 to 30 seconds so a server being removed only waits for in-flight requests.
            </p>
          </li>
          <li>
            <h3>Create the load balancer and its listeners</h3>
            <p>
              EC2 → Load balancers → Application Load Balancer: internet-facing, the two{" "}
              <strong>public</strong> subnets, security group <code>alb-sg</code>. Two listeners:
            </p>
            <ul>
              <li>
                <strong>HTTPS 443</strong> → forward to <code>myapp-tg</code>, with the ACM
                certificate. TLS ends here.
              </li>
              <li>
                <strong>HTTP 80</strong> → redirect to HTTPS 443 (301).
              </li>
            </ul>
            <p>
              <code>alb-sg</code> (Lesson 6) already accepts 80 and 443 from the world, and{" "}
              <code>web-sg</code> accepts 80 <em>only from alb-sg</em>. The public can no longer
              reach a server directly. Remove the temporary <code>0.0.0.0/0</code> port 80 and 443
              rules on <code>web-sg</code> that Lesson 10 added.
            </p>
          </li>
          <li>
            <h3>Store the deploy settings where new servers can read them</h3>
            <p>
              A server launched at 3 a.m. by Auto Scaling has no human to tell it which image to
              run. It reads that from <strong>SSM Parameter Store</strong> (free for standard
              parameters). Create two:
            </p>
            <ul>
              <li><code>/myapp/image-tag</code> — a plain String: the commit SHA to run, e.g. <code>a1b2c3d</code>.</li>
              <li>
                <code>/myapp/env</code> — a <strong>SecureString</strong> (encrypted): the whole
                production env file, <code>DATABASE_URL</code> and all, plus{" "}
                <code>KEEP_ALIVE_TIMEOUT=65000</code> (see the common pitfalls below).
              </li>
            </ul>
            <p>
              Then give <code>myapp-ec2-role</code> permission to read <code>/myapp/*</code>{" "}
              parameters and pull from the <code>myapp</code> ECR repository — the AWS-managed{" "}
              <code>AmazonEC2ContainerRegistryReadOnly</code> policy plus a small inline policy
              allowing <code>ssm:GetParameter</code> on that path.
            </p>
          </li>
          <li>
            <h3>Write the user-data script — the boot recipe</h3>
            <p>
              <strong>User data</strong> is a script that runs once, as root, the first time a
              server boots. It is how a brand-new machine turns itself into one of your app
              servers with nobody logged in:
            </p>
            <Script
              title="user-data.sh — the shape of it"
              code={`#!/bin/bash
set -euxo pipefail
# 1. install Docker and the AWS CLI
# 2. read which version to run and its config — never hard-code them
TAG=$(aws ssm get-parameter --name /myapp/image-tag --query Parameter.Value --output text)
aws ssm get-parameter --name /myapp/env --with-decryption \\
  --query Parameter.Value --output text > /etc/myapp.env
# 3. log in to ECR and start the container on port 80
docker run -d --name myapp --restart unless-stopped \\
  --env-file /etc/myapp.env -p 80:3000 $REGISTRY/myapp:$TAG`}
            />
            <p>
              The container is published on port 80 because that is what the target group targets
              and what <code>web-sg</code> allows from the ALB. If boot fails, the log is{" "}
              <code>/var/log/cloud-init-output.log</code>.
            </p>
          </li>
          <li>
            <h3>Create the launch template</h3>
            <p>
              EC2 → Launch templates → Create. Fill it exactly like Lesson 7&apos;s server — Ubuntu
              24.04, <code>t3.small</code>, <code>web-sg</code>, the <code>myapp-ec2-role</code>{" "}
              profile, 20 GB encrypted gp3, IMDSv2 required — and paste the script above into{" "}
              <strong>User data</strong>. Two differences from Lesson 7:
            </p>
            <ul>
              <li>
                <strong>Metadata hop limit: 2.</strong> A container sits one network hop further
                from the metadata service than the host, so with the default of 1 your app inside
                Docker cannot fetch the role&apos;s credentials and every AWS call fails with
                &ldquo;could not load credentials&rdquo;.
              </li>
              <li>
                <strong>No key pair</strong>, on purpose: production servers should not be
                SSH-able. You get a shell through SSM Session Manager in Lesson 18.
              </li>
            </ul>
          </li>
          <li>
            <h3>Create the Auto Scaling group</h3>
            <p>
              EC2 → Auto Scaling groups → Create, using the launch template. The settings that
              matter:
            </p>
            <ul>
              <li>
                <strong>Two subnets in two AZs, min 2, desired 2, max 6</strong>: losing a whole
                data centre leaves one server up.
              </li>
              <li>
                <strong>Attach to <code>myapp-tg</code></strong>, and turn on{" "}
                <strong>ELB health checks</strong>: the group replaces servers that the{" "}
                <em>load balancer</em> reports unhealthy, not merely ones whose EC2 status is fine
                but whose app is dead. The default (EC2 only) misses exactly the failures you care
                about.
              </li>
              <li>
                <strong>Health check grace period 180 s</strong>: don&apos;t judge a new server for
                3 minutes while it boots and pulls the image. Make it longer than your real boot
                time.
              </li>
            </ul>
          </li>
          <li>
            <h3>Add the scaling policy</h3>
            <p>
              On the same screen: <strong>Target tracking</strong>, metric{" "}
              <em>Average CPU utilisation</em>, target <strong>50</strong>. &ldquo;Keep the average
              CPU across the group near 50%.&rdquo; Above it the group adds servers; well below it,
              it removes them — with AWS creating and managing the CloudWatch alarms for you.
            </p>
          </li>
          <li>
            <h3>Watch it come alive</h3>
            <p>
              The group&apos;s <strong>Activity</strong> tab shows &ldquo;Launching a new EC2
              instance…&rdquo; (and, if something fails, why). The target group&apos;s{" "}
              <strong>Targets</strong> tab turns both servers <em>healthy</em> within 2–4 minutes.
              Then open the ALB&apos;s DNS name in a browser and you reach the app.
            </p>
          </li>
        </ol>

        <h2 id="health">Health checks done properly</h2>
        <p>The health endpoint decides who lives and who is replaced. Keep it honest and cheap:</p>
        <Script
          title="app/api/health/route.ts"
          code={`export const dynamic = "force-dynamic";   // never cache a health check

export function GET() {
  return Response.json({ ok: true, version: process.env.APP_VERSION ?? "dev" });
}`}
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Shallow check (above)</th>
                <th>Deep check (also queries the database)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Detects</strong></td>
                <td>App process hung or crashed</td>
                <td>App alive <em>and</em> database reachable</td>
              </tr>
              <tr>
                <td><strong>Risk</strong></td>
                <td>Server serves errors if DB is down, but stays &ldquo;healthy&rdquo;</td>
                <td className="text-red-300">A brief database blip marks every server unhealthy at once — the ASG then kills them all: you turn a small incident into a total outage</td>
              </tr>
              <tr>
                <td><strong>Use it for</strong></td>
                <td>The ALB target-group check</td>
                <td>A separate <code>/api/ready</code> for dashboards and alerts, not for killing servers</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The classic rule: <strong>a health check that can fail because of a dependency can cause
          a cascading outage.</strong> Health checks answer &ldquo;is <em>this</em> server
          broken?&rdquo;, and alarms answer &ldquo;is the system broken?&rdquo;.
        </p>

        <h2 id="policies">Choosing a scaling policy</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Policy</th>
                <th>How it decides</th>
                <th>Use when</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Target tracking — CPU</strong></td>
                <td>Keep average CPU at a target</td>
                <td>Default for CPU-bound apps. Simplest, our choice</td>
              </tr>
              <tr>
                <td><strong>Target tracking — ALBRequestCountPerTarget</strong></td>
                <td>Keep requests per server at a target (e.g. 500/min)</td>
                <td>Better when load is I/O-bound (waiting on the database) and CPU stays low</td>
              </tr>
              <tr>
                <td><strong>Step scaling</strong></td>
                <td>&ldquo;CPU &gt; 70% add 1; &gt; 90% add 3&rdquo;</td>
                <td>You want manual control of how aggressive to be</td>
              </tr>
              <tr>
                <td><strong>Scheduled</strong></td>
                <td>&ldquo;9 a.m. weekdays: min 4&rdquo;</td>
                <td>Known traffic (a daily peak, a sale, a marketing email)</td>
              </tr>
              <tr>
                <td><strong>Predictive</strong></td>
                <td>Learns your daily/weekly pattern and scales ahead</td>
                <td>Stable, repeating traffic, after two weeks of data</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3>Why scaling is never instant</h3>
        <p>
          A new server takes a few minutes: launch, boot, pull the image, pass two health checks. So
          scaling <em>reacts</em> a few minutes after load rises. Three ways to be ready for sudden
          spikes: a higher minimum, a scheduled action before a known event, and a lower CPU target
          (40% leaves more headroom than 70%). Scale <strong>out fast, in slowly</strong>: killing a
          server during a brief lull only to rebuy it five minutes later is the flapping you want to
          avoid, which target tracking already handles with longer scale-in windows.
        </p>
        <Callout kind="note" label="Speed up boot with a pre-baked AMI">
          <p className="mb-0">
            Installing Docker on every boot costs about a minute. Once things are stable, configure
            one server, run <code>aws ec2 create-image</code> to snapshot it as an AMI (&ldquo;golden
            image&rdquo;), and put that AMI in the launch template. New servers boot ready in seconds.
            Tools such as Packer automate it; Lesson 15&apos;s Terraform can wire it in.
          </p>
        </Callout>

        <h2 id="deploys">Deploying without downtime</h2>
        <p>
          With many servers a deploy stops being &ldquo;SSH in and restart&rdquo;. The clean
          pattern is <strong>replace, don&apos;t modify</strong>:
        </p>
        <ol>
          <li>CI pushes the new image to ECR, tagged with the commit SHA.</li>
          <li>Update <code>/myapp/image-tag</code> to that SHA.</li>
          <li>
            Start an <strong>instance refresh</strong> on the Auto Scaling group (min healthy
            100%, max healthy 110%). AWS replaces every server a few at a time, waiting for each
            new one to pass its health check.
          </li>
        </ol>
        <p>
          Rolling back is the same move: put the previous SHA back in the parameter and refresh
          again.
        </p>
        <p>
          Min healthy 100% with max healthy 110% means AWS
          starts a new server <em>before</em> retiring an old one, so capacity never dips. Because
          the ALB only routes to healthy targets, users never reach a server that is still booting;
          because deregistration waits 30 seconds, requests already in flight on a retiring server
          finish. Lesson 14 triggers the refresh from GitHub Actions.
        </p>
        <Callout kind="warn" label="Make your app exit cleanly on SIGTERM">
          <p className="mb-0">
            When a server is retired, Docker sends <code>SIGTERM</code> and waits, then{" "}
            <code>SIGKILL</code>. The app should stop accepting new connections and finish current
            ones. Next.js&apos;s own server handles this; a custom Node server needs a{" "}
            <code>process.on(&quot;SIGTERM&quot;, …)</code> handler that calls{" "}
            <code>server.close()</code>.
          </p>
        </Callout>

        <h2 id="load-test">Prove it: load test and kill a server</h2>
        <p>
          Never trust an architecture you have not tried to break. Two experiments turn diagrams into
          confidence.
        </p>
        <h3>Experiment 1 — does it scale?</h3>
        <CommandList
          title="On your laptop (a staging copy, or a quiet window — this is real traffic)"
          commands={[
            { cmd: "hey -z 3m -c 200 https://yourapp.com/", note: "200 concurrent connections for 3 minutes (install hey with brew; k6 is a fine alternative). Watch the Auto Scaling group's instance count grow in the console meanwhile" },
          ]}
        />
        <p>Look at three numbers from the <code>hey</code> summary, and one graph:</p>
        <ul>
          <li>
            <strong>Requests/sec</strong> — your measured throughput (feed it back into the capacity
            estimate above).
          </li>
          <li>
            <strong>Latency percentiles (p50, p95, p99)</strong> — averages hide pain; the slowest 1%
            of users are the ones who complain.
          </li>
          <li>
            <strong>Status code distribution</strong> — any 5xx means something broke under load.
          </li>
          <li>
            In CloudWatch, the ALB&apos;s <code>TargetResponseTime</code> and the database&apos;s
            <code> DatabaseConnections</code> — the database usually gives out first.
          </li>
        </ul>
        <h3>Experiment 2 — does it heal?</h3>
        <p>
          While the load test runs, terminate one of the group&apos;s instances in the console, as
          if a data centre lost a machine. Within seconds the ALB marks it unhealthy and users keep
          being served by the survivor; the group notices it is below desired capacity and launches
          a replacement by itself.
        </p>
        <p>
          If the site blips or errors for more than a moment, you have found a real weakness (usually
          a keep-alive timeout, a health check that is too slow, or a min-size of 1) to fix while it
          is cheap.
        </p>

        <h2 id="gotchas">The common pitfalls that cause real 502s</h2>
        <h3>Keep-alive timeout: the intermittent 502</h3>
        <p>
          The ALB reuses connections to your servers and closes them after 60 seconds of idleness.
          Node closes idle connections after just <strong>5 seconds</strong> by default. So
          occasionally the ALB sends a request down a connection that Node has just closed — an
          instant <code>502</code>, roughly one in thousands of requests, impossible to reproduce on
          your laptop. The rule: <strong>the server&apos;s keep-alive timeout must be longer than the
          load balancer&apos;s idle timeout.</strong>
        </p>
        <p>
          With the Next.js standalone server, that is the <code>KEEP_ALIVE_TIMEOUT=65000</code>{" "}
          line already in <code>/myapp/env</code>. A custom Node server sets{" "}
          <code>server.keepAliveTimeout = 65_000</code> (and <code>headersTimeout</code> slightly
          higher) — anything above the ALB&apos;s 60 seconds.
        </p>
        <h3>Sticky sessions</h3>
        <p>
          The ALB can pin a user to one server with a cookie (&ldquo;stickiness&rdquo;). It is tempting
          when sessions live in memory, but it defeats even load distribution, and the user loses
          their session when that server is replaced. Treat it as a temporary bridge while you move
          sessions to Redis (Lesson 16), not as a solution.
        </p>
        <h3>WebSockets</h3>
        <p>
          ALBs support WebSockets with no extra setup, but a long-lived connection ties a user to one
          server for its lifetime, and idle connections are closed at 60 seconds unless the app
          sends pings. Scale on connection count for such apps, not CPU.
        </p>
        <h3>Real client IP</h3>
        <p>
          Behind an ALB, the connection comes from the ALB. The user&apos;s address is in{" "}
          <code>X-Forwarded-For</code> — set your framework to trust that header from the VPC only
          (Lesson 10&apos;s real-IP note), or every rate limit and log shows the ALB&apos;s IP.
        </p>

        <h2 id="cost">What this costs</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Approx. per month (Mumbai)</th></tr>
            </thead>
            <tbody>
              <tr><td>Application Load Balancer, base</td><td>~$0.0225/hour ≈ $16.50</td></tr>
              <tr><td>ALB usage (LCUs: connections, bytes, rules)</td><td>~$0.008 per LCU-hour; a small app ≈ $2–8</td></tr>
              <tr><td>2 × t3.small, 24/7</td><td>~$32</td></tr>
              <tr><td>Public IPv4 per server + per ALB zone</td><td>~$3.60 each (4 ≈ $14)</td></tr>
              <tr><td>Auto Scaling, launch templates, target groups</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>Extra servers during a spike</td><td>Billed per second, only while they exist</td></tr>
              <tr><td>ACM certificate</td><td className="font-semibold text-emerald-300">Free</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          A realistic total for this tier is <strong>about $60–75 a month</strong> — meaningfully more
          than one server. The trade you are buying: no single point of failure, deploys without
          downtime, and headroom for growth. If you do not need that yet, one server with Nginx is a
          perfectly good place to be; do not adopt an ALB just because the course has a lesson on it.
        </p>
        <Callout kind="ok" label="Stopping the meter while learning">
          <p className="mb-0">
            Set the ASG to <code>--min-size 0 --desired-capacity 0</code> when you are not studying
            (<code>aws autoscaling update-auto-scaling-group …</code>) and it terminates every
            server. The ALB itself keeps billing, so delete it too when finished, or run this whole
            tier only for a weekend and rebuild it from Terraform in Lesson 15.
          </p>
        </Callout>

        <h2 id="troubleshooting">Troubleshooting table</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Symptom</th>
                <th>Likely cause</th>
                <th>Fix</th>
              </tr>
            </thead>
            <tbody>
              {trouble.map(([s, c, f]) => (
                <tr key={s}>
                  <td>{s}</td>
                  <td>{c}</td>
                  <td>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="interview">Interview corner</h2>
        <InterviewQA
          items={[
            {
              q: "What must be true of an application before you put it behind a load balancer?",
              a: (
                <p className="mb-0">
                  It must be stateless: sessions, uploads and data live outside the instance
                  (cookies/JWT or Redis, S3, RDS), config comes from a shared source, and scheduled
                  jobs do not run in every instance.
                </p>
              ),
            },
            {
              q: "ALB vs NLB?",
              a: (
                <p className="mb-0">
                  ALB works at layer 7: HTTP-aware routing by host/path/headers, TLS, redirects,
                  WebSockets. NLB works at layer 4: TCP/UDP, extreme throughput and low latency,
                  static IPs. Use ALB for web apps and APIs, NLB for non-HTTP protocols or fixed-IP
                  requirements.
                </p>
              ),
            },
            {
              q: "Explain how Auto Scaling replaces an unhealthy instance.",
              a: (
                <p className="mb-0">
                  With ELB health checks enabled, the group treats a target the load balancer marks
                  unhealthy as unhealthy itself, terminates it, and launches a replacement from the
                  launch template to restore the desired capacity, respecting the grace period for
                  new instances.
                </p>
              ),
            },
            {
              q: "Why can a database-dependent health check be dangerous?",
              a: (
                <p className="mb-0">
                  If the shared dependency blips, every server fails the check simultaneously and the
                  group terminates all of them — a total outage caused by a partial one. Health checks
                  should test the instance; dependency health belongs in alarms.
                </p>
              ),
            },
            {
              q: "You get random 502s, about 1 in 2,000 requests. Nothing in the app logs. Why?",
              a: (
                <p className="mb-0">
                  Classic keep-alive mismatch: the backend closes idle connections (Node default 5 s)
                  before the ALB&apos;s 60 s idle timeout, so the ALB occasionally reuses a closed
                  connection. Set the backend keep-alive timeout above the ALB idle timeout.
                </p>
              ),
            },
            {
              q: "How do you deploy a new version with zero downtime behind an ASG?",
              a: (
                <p className="mb-0">
                  Build an immutable image, update the launch template or the parameter it reads, and
                  run an instance refresh that starts new instances before retiring old ones, gated on
                  health checks and with connection draining. Rollback is the same operation with the
                  previous version.
                </p>
              ),
            },
            {
              q: "1,000 concurrent users — how many servers?",
              a: (
                <p className="mb-0">
                  Convert to requests per second (users ÷ seconds between actions), measure one
                  server&apos;s throughput with a load test, divide, and add headroom for spikes and
                  for losing an AZ. Then check the database connection budget at the maximum instance
                  count, because that is usually the real limit.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 13</h2>
        <ol>
          <li>
            Audit your app with the statelessness table. List anything that would break with two
            servers, and fix or note each.
          </li>
          <li>
            Build the tier: certificate, target group, ALB, parameters, launch template, ASG, policy.
            Wait until both targets are healthy and load your site via the ALB DNS name.
          </li>
          <li>
            Break the health check on purpose (change the path in the target group to{" "}
            <code>/nope</code>). Watch targets go unhealthy and the ALB return 503, then restore it.
          </li>
          <li>
            Run the load test and the terminate-a-server experiment. Record requests/sec, p95
            latency, and how long the replacement took.
          </li>
          <li>
            Publish a new image tag, update <code>/myapp/image-tag</code> and run an instance
            refresh. Confirm the site stayed up the whole time.
          </li>
          <li>
            Calculate the monthly cost of your setup at min-size 2 and at max-size 6 for one hour a
            day. Which line dominates?
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Add a second listener rule that forwards <code>/api/*</code> to a separate target group
            and a fixed <code>404</code> response for <code>/admin</code> from the internet. Rules
            are how one ALB becomes the front door for a whole platform.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          You now run the same architecture that large sites do, just smaller: one address, many
          disposable servers, automatic healing and automatic growth.
        </p>
        <ul>
          <li>
            <strong>ALB</strong> = listener + rules + target group + health checks; it terminates
            TLS with a free ACM certificate.
          </li>
          <li>
            <strong>Auto Scaling</strong> = launch template + group + policy; servers are cattle,
            created from a recipe with zero manual steps.
          </li>
          <li>
            <strong>Stateless first.</strong> Sessions, files, data and cron jobs must live outside
            the web tier.
          </li>
          <li>
            <strong>Health checks test the server</strong>, not its dependencies, or a blip becomes an
            outage.
          </li>
          <li>
            <strong>Do the arithmetic</strong> — requests per second, per-server capacity, and the
            database connection budget at max scale — and <strong>test by breaking things</strong>.
          </li>
        </ul>
        <p>
          The ALB gives you a long, ugly DNS name. Next we attach your real domain to it, and to
          CloudFront, with Route 53.
        </p>

        <hr />
        <p>
          End of Lesson 12. Next: <strong>Lesson 13 — Route 53: Production Domain</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
