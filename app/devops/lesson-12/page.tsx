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
  ["User sessions in server memory", "Server B does not know that the user logged in on server A", "Signed cookie or JWT (a JSON Web Token: a small signed piece of text that holds the login proof, kept in the browser), or Redis (Lesson 16)"],
  ["Uploaded files on local disk", "Only one server has the file", "S3 (Lesson 11)"],
  ["Data in a local database or SQLite file", "Each server has different data", "RDS (Lesson 8)"],
  ["In-memory cache or counters", "Each server has its own copy, so answers differ", "Redis (a fast data store that many servers can share), or accept a separate cache on each server for data that is not critical"],
  ["Cron jobs / setInterval in the app (a cron job is a task that runs on a timer, for example every night)", "With N servers, the job runs N times", "Use one scheduler (EventBridge is an AWS service that starts tasks on a schedule), or a single worker. Never run it in the web servers"],
  ["Settings or secrets in a file that you edit by hand", "New servers start without that file", "SSM Parameter Store or Secrets Manager (AWS services that keep settings and secrets safe), read when the server boots"],
  ["Sticky assumptions like “the same server next time”", "The load balancer may pick any server", "Make every request work on any server"],
];

const lbTypes: [string, string, string][] = [
  ["ALB (Application)", "Layer 7 (the application layer): understands HTTP. Routes by host name, path or header. Also handles TLS, WebSockets and redirects", "Web apps and APIs — our choice"],
  ["NLB (Network)", "Layer 4 (the transport layer): passes raw TCP/UDP traffic (TCP and UDP are the two basic ways to send data over a network). Handles millions of connections, gives fixed IPs, and adds very little delay", "Databases, games, protocols that are not HTTP, or when you need a fixed IP"],
  ["Gateway LB", "Layer 3 (the network layer): sends traffic through firewall or inspection appliances", "Security appliances (rare)"],
  ["Classic LB", "The old load balancer that came before ALB and NLB", "Do not use for new work"],
];

const trouble: [string, string, string][] = [
  ["Targets show “unhealthy” in the target group", "The health-check path does not return 200, the port is wrong, web-sg does not allow the ALB, or the app is still starting", "Read the reason in the target's Health status details. Run curl on the path from the instance itself. Check that web-sg allows port 80 from alb-sg. If every target is unhealthy, the ALB still sends traffic to all of them (this is called fail-open)"],
  ["502 Bad Gateway from the ALB", "The server closed the connection early (its keep-alive timeout is shorter than the ALB idle timeout), or it crashed during a request", "Set the Node keepAliveTimeout above 60 s (see the common pitfalls). Check the app logs for that time"],
  ["503 Service Unavailable", "The target group has no registered targets, for example because the Auto Scaling group has 0 servers", "Check that the ASG launched instances (see Activity history) and that it is attached to the target group"],
  ["504 Gateway Timeout", "The app took longer than the ALB idle timeout (60 s by default)", "Find the slow endpoint. Move long work to a background job"],
  ["Instances are launched and terminated in a loop", "They fail the health check before the app is ready, so the ASG removes them", "Raise --health-check-grace-period above the boot time. Read /var/log/cloud-init-output.log"],
  ["Scaling never triggers", "The metric is not moving, the policy uses the wrong metric, max-size is already reached, or the group is still in warm-up", "Check the alarm state in CloudWatch and the group’s Max"],
  ["Users get logged out randomly", "Sessions are stored in server memory, and the ALB sends the user to another server", "Move sessions to a cookie/JWT or to Redis. Use sticky sessions only as a short-term fix"],
  ["Some users see old code, some new", "A rolling deploy is still running, or one server missed the update", "Deploy with an instance refresh so all servers end up on the same version. Tag images with the commit SHA"],
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
            An <strong>Application Load Balancer (ALB)</strong> is an AWS service that gives users one
            stable address. It shares their requests across many identical servers. It sends
            traffic only to servers that are healthy.
          </li>
          <li>
            <strong>Auto Scaling</strong> is an AWS service that decides <em>how many</em> servers
            exist. It starts more servers when traffic rises. It replaces servers that fail. It
            removes extra servers when the busy time is over.
          </li>
        </ul>
        <Callout kind="note" label="The analogy — a restaurant on a busy night">
          <p className="mb-0">
            The <strong>ALB is the host at the door</strong>. The host greets everyone and sends each
            group to a free table. The host never seats anyone at a table with a broken leg (that is
            the health check). <strong>Auto Scaling is the manager</strong>. The manager calls in
            more waiters when the queue grows and sends them home when it is quiet. The customers
            only ever see one restaurant.
          </p>
        </Callout>
        <ScalingFlow />

        <h2 id="why-this-matters">Why one server is not enough</h2>
        <ul>
          <li>
            <strong>A limit on capacity.</strong> A t3.small has 2 vCPUs (virtual CPU cores). After a
            certain point, extra requests only wait in line, slow down, and then time out.
          </li>
          <li>
            <strong>A single point of failure.</strong> This means one part that stops everything when
            it breaks. With one server, one crash, one bad deploy or one reboot for updates takes the
            whole site down.
          </li>
          <li>
            <strong>Deploys cause downtime.</strong> With one server, users have nowhere to go while
            you restart it.
          </li>
          <li>
            <strong>You pay for the peak all month.</strong> A server big enough for the busiest hour
            sits idle for the other 23 hours. Elastic capacity (capacity that grows and shrinks)
            charges you only for what you use.
          </li>
        </ul>
        <p>
          Now the comparison between AWS and Vercel from Lesson 0 becomes real. Vercel scaled your app
          for you, out of sight. You are now building the same behaviour yourself. You can see
          every part and change every part.
        </p>

        <h2 id="stateless">The prerequisite: stateless servers</h2>
        <p>
          Load balancing has one strict rule: <strong>any request may go to any server</strong>. A{" "}
          <strong>stateless</strong> server keeps no data of its own between requests. If a server
          remembers something that the other servers do not, users get random bugs that are hard to
          find. Lessons 8 and 11 removed the two biggest causes (the database and the files). Check
          the rest before you scale:
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
            The most common failure after &ldquo;we added a second server&rdquo; is that users are
            logged out on every other click. Do this check <em>first</em>. It is much cheaper than
            debugging in production.
          </p>
        </Callout>

        <h2 id="numbers">What does &ldquo;1000 concurrent users&rdquo; actually mean</h2>
        <p>
          The lesson title promises 1000+ concurrent users. Before you buy anything, learn what that
          number means. &ldquo;Concurrent users&rdquo; are people who use the site at the same time.
          A <strong>request</strong> is one call from a browser to your server.{" "}
          <strong>Concurrent users are not requests per second.</strong> A person spends most of the
          time reading, not clicking.
        </p>
        <Callout kind="note" label="The back-of-envelope formula">
          <p className="mb-0">
            <strong>requests per second ≈ concurrent users ÷ seconds between actions.</strong> If 1,000
            users each do something every 10 seconds, that is about{" "}
            <strong>100 requests per second</strong>. If each does something every 3 seconds, it is
            about 330 requests per second. One page load is several requests (HTML, API calls,
            files). But with a CDN, the files never reach your servers.
          </p>
        </Callout>
        <p>Next, ask how many requests one server can handle:</p>
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
          These ranges are wide on purpose. <strong>You must measure your own app</strong> (see the
          load-test section). Say your app does about 60 requests per second per vCPU. Then a
          t3.small (2 vCPUs) handles about 120 requests per second. 1,000 casual users send about
          100 requests per second. That is close to the limit of one server. You also need extra room
          for spikes and for the loss of one server, so you need <strong>2–3 servers</strong>. That
          is why the group has a minimum of <strong>2</strong> (one in each Availability Zone, or AZ:
          a separate group of data centres inside a region) and a maximum of 6.
        </p>
        <p>
          One more warning about t3 servers. They are <em>burstable</em>. They can use more than
          their normal CPU share only while they have CPU credits. Under steady heavy load the
          credits run out. Then the server slows down, or (in the default &ldquo;unlimited&rdquo;
          mode) AWS charges extra. For steady heavy load, test a non-burstable type such as m7i.
        </p>
        <Callout kind="warn" label="The database usually breaks first">
          <p className="mb-0">
            A connection pool is a set of ready database connections that a server reuses. Six
            servers with a pool of 10 each use 60 database connections. A small RDS instance allows
            about 100 (Lesson 8). When you scale the web servers, work out the connection count{" "}
            <em>at the maximum</em> number of servers. You can also use RDS Proxy, an AWS service
            that shares database connections for you.
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
                <td>The public entry point. It lives in at least two public subnets (parts of your network that the internet can reach) in two AZs. It gets a DNS name, not a fixed IP.</td>
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
                <td>The group of servers that share the work, plus the rules for checking their health.</td>
                <td><code>myapp-tg</code>, port 80</td>
              </tr>
              <tr>
                <td><strong>Health check</strong></td>
                <td>The ALB asks for a path every few seconds. Only servers that answer 200 (&ldquo;OK&rdquo;) receive traffic.</td>
                <td><code>GET /api/health</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Rules let one ALB serve many apps.</strong> A host-based rule looks at the domain
          name: <code>api.yourapp.com</code> goes to the API target group, and{" "}
          <code>yourapp.com</code> goes to the web target group. A path-based rule looks at the URL
          path: <code>/api/*</code> goes to one group and everything else goes to another. This way,
          one load balancer (about $20 a month) does the work of several.
        </p>
                <h3>Which load balancer?</h3>
        <p>
          AWS has four types. The &ldquo;layer&rdquo; is a level in the network model. A layer 7
          balancer can read web requests. A layer 4 balancer only sees connections (TCP or UDP).
        </p>
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
            The ALB ends the HTTPS connection (TLS is the protocol that encrypts HTTPS traffic). It uses a{" "}
            <strong>free ACM certificate</strong> that AWS renews for you. So the servers behind it
            no longer need Certbot or port 443. They speak plain HTTP on port 80 inside the VPC.
            This is the reward for learning about ACM in Lesson 4.
          </p>
        </Callout>

        <h2 id="auto-scaling">How Auto Scaling works: template, group, policy</h2>
        <p>There are three parts. Each one builds on the one before:</p>
        <ol>
          <li>
            <strong>Launch template</strong> is a saved recipe for one server. It holds the AMI (a saved
            copy of a server disk with the operating system), the instance type (the size), the key,
            the Security Group, the IAM profile (the permissions the server gets), and a <strong>user-data</strong> script that runs
            on the first boot. It has versions, so you can change it and go back to an older
            one.
          </li>
          <li>
            <strong>Auto Scaling Group (ASG)</strong> is a group that follows this rule: &ldquo;keep
            between <em>min</em> and <em>max</em> servers from this template, spread across these
            subnets, and registered in this target group.&rdquo; It replaces failed servers
            automatically.
          </li>
          <li>
            <strong>Scaling policy</strong> is the rule that moves the wanted number of servers between
            min and max. For example: &ldquo;keep the average CPU near 50%&rdquo;.
          </li>
        </ol>
        <Callout kind="note" label="Pets vs cattle">
          <p className="mb-0">
            The server in Lesson 7 was a <em>pet</em>. It had a name, you cared for it by hand, and you
            could not replace it. ASG servers are <em>cattle</em>. They are all the same, they have
            numbers, and when one is sick you replace it instead of repairing it. The user-data
            script makes the replacement fast. A new server must get fully ready with{" "}
            <strong>zero human steps</strong>. This is the reason Lessons 9 and 11 came first.
          </p>
        </Callout>

        <h2 id="build">Build it, step by step</h2>
        <p>
          You need the network from Lesson 6, an image in ECR (the AWS store for Docker images, Lesson 9)
          and a domain (Lesson 3). Each step is one console screen. We only mention the fields
          that matter.
        </p>
        <ol className="steps">
          <li>
            <h3>Request the HTTPS certificate</h3>
            <p>
              Open ACM (AWS Certificate Manager) in <code>ap-south-1</code>, the ALB&apos;s region. Request
              a public certificate for <code>yourapp.com</code> <strong>and</strong>{" "}
              <code>*.yourapp.com</code>. Choose DNS validation. This means you prove that you own the
              domain by adding a DNS record. Click &ldquo;Create records in Route 53&rdquo;, and the
              certificate is ready in a few minutes. The wildcard covers every tenant subdomain. The
              bare domain is listed on its own, because <code>*.yourapp.com</code> does not match{" "}
              <code>yourapp.com</code> itself.
            </p>
          </li>
          <li>
            <h3>Create the target group (the pool)</h3>
            <p>
              Go to EC2 → Target groups → Create. Choose type <em>Instances</em>, HTTP port 80, and the{" "}
              <code>myapp</code> VPC. Set the health check path to <code>/api/health</code>, the
              interval to 15 s, healthy after 2 passes, and unhealthy after 3 failures. Do not
              register any targets. Auto Scaling will do that. Then, under Attributes, lower the{" "}
              <strong>deregistration delay</strong> from 300 to 30 seconds. This is how long the ALB
              waits for requests that are still running on a server before it removes the server.
            </p>
          </li>
          <li>
            <h3>Create the load balancer and its listeners</h3>
            <p>
              Go to EC2 → Load balancers → Application Load Balancer. Choose internet-facing, the two{" "}
              <strong>public</strong> subnets, and the security group <code>alb-sg</code>. Add two
              listeners:
            </p>
            <ul>
              <li>
                <strong>HTTPS 443</strong>: forward to <code>myapp-tg</code>, with the ACM
                certificate. The encryption ends here.
              </li>
              <li>
                <strong>HTTP 80</strong>: redirect to HTTPS 443 (a 301 &ldquo;moved permanently&rdquo; answer).
              </li>
            </ul>
            <p>
              <code>alb-sg</code> (Lesson 6) already accepts ports 80 and 443 from everyone. <code>web-sg</code>{" "}
              accepts port 80 <em>only from alb-sg</em>. So the public can no longer reach a server
              directly. Remove the temporary <code>0.0.0.0/0</code> rules for ports 80 and 443 on{" "}
              <code>web-sg</code> that Lesson 10 added.
            </p>
          </li>
          <li>
            <h3>Store the deploy settings where new servers can read them</h3>
            <p>
              A server that Auto Scaling starts at 3 a.m. has no human to tell it which image to run. It
              reads this from <strong>SSM Parameter Store</strong>. This is an AWS service that stores
              settings and secrets as named values. It is free for standard parameters. Create two:
            </p>
            <ul>
              <li><code>/myapp/image-tag</code> is a plain String. It holds the commit SHA (the short ID of a Git commit) to run, for example <code>a1b2c3d</code>.</li>
              <li>
                <code>/myapp/env</code> is a <strong>SecureString</strong> (it is stored encrypted). It
                holds the whole production env file, including <code>DATABASE_URL</code>, plus{" "}
                <code>KEEP_ALIVE_TIMEOUT=65000</code> (see the common pitfalls below).
              </li>
            </ul>
            <p>
              Then give <code>myapp-ec2-role</code> permission to read the <code>/myapp/*</code>{" "}
              parameters and to pull from the <code>myapp</code> ECR repository. Use the AWS-managed{" "}
              <code>AmazonEC2ContainerRegistryReadOnly</code> policy, plus a small inline policy that
              allows <code>ssm:GetParameter</code> on that path. Because the parameter is encrypted,
              the role also needs permission to decrypt it with its KMS key (KMS is the AWS Key Management Service, which holds encryption keys; the default AWS-managed
              key needs no extra rule).
            </p>
          </li>
          <li>
            <h3>Write the user-data script — the boot recipe</h3>
            <p>
              <strong>User data</strong> is a script that runs once, as the root user, the first time a
              server boots. With it, a brand-new machine turns itself into one of your app servers
              while nobody is logged in:
            </p>
            <Script
              title="user-data.sh — the shape of it"
              code={`#!/bin/bash
set -euxo pipefail
# 1. install Docker and the AWS CLI
# 2. read which version to run, and its settings (never hard-code them)
TAG=$(aws ssm get-parameter --name /myapp/image-tag --query Parameter.Value --output text)
aws ssm get-parameter --name /myapp/env --with-decryption \\
  --query Parameter.Value --output text > /etc/myapp.env
# 3. log in to ECR and start the container on port 80
docker run -d --name myapp --restart unless-stopped \\
  --env-file /etc/myapp.env -p 80:3000 $REGISTRY/myapp:$TAG`}
            />
            <p>
              The container is published on port 80, because the target group sends traffic to port 80
              and <code>web-sg</code> allows port 80 from the ALB. If the boot fails, read the log
              at <code>/var/log/cloud-init-output.log</code>.
            </p>
          </li>
          <li>
            <h3>Create the launch template</h3>
            <p>
              Go to EC2 → Launch templates → Create. Fill it in like the server in Lesson 7 (IMDSv2 is the safer version of the metadata service explained below; gp3 is a type of SSD disk): Ubuntu
              24.04, <code>t3.small</code>, <code>web-sg</code>, the <code>myapp-ec2-role</code>{" "}
              profile, a 20 GB encrypted gp3 disk, and IMDSv2 required. Paste the script above into{" "}
              <strong>User data</strong>. There are two differences from Lesson 7:
            </p>
            <ul>
              <li>
                <strong>Metadata hop limit: 2.</strong> The instance metadata service (IMDS) is a local
                address where a server gets its role credentials. A container is one network hop
                further away from it than the host. With the default limit of 1, your app inside
                Docker cannot get the role&apos;s credentials, and every AWS call fails with
                &ldquo;could not load credentials&rdquo;.
              </li>
              <li>
                <strong>No key pair</strong>, on purpose. Production servers should not accept SSH
                logins (SSH is the tool for logging in to a server from far away). In Lesson 18 you will get a shell through SSM Session Manager instead.
              </li>
            </ul>
          </li>
          <li>
            <h3>Create the Auto Scaling group</h3>
            <p>
              Go to EC2 → Auto Scaling groups → Create, and use the launch template. These settings
              matter most:
            </p>
            <ul>
              <li>
                <strong>Two subnets in two AZs, min 2, desired 2, max 6.</strong> If one whole data centre
                is lost, one server is still running.
              </li>
              <li>
                <strong>Attach it to <code>myapp-tg</code></strong>, and turn on{" "}
                <strong>ELB health checks</strong>. Then the group replaces servers that the{" "}
                <em>load balancer</em> reports as unhealthy. Without this, the group only checks the
                EC2 machine. It would miss a server whose machine is fine but whose app is dead.
              </li>
              <li>
                <strong>Health check grace period 180 s.</strong> Do not judge a new server for 3 minutes
                while it boots and pulls the image. Make this longer than your real boot time.
              </li>
            </ul>
          </li>
          <li>
            <h3>Add the scaling policy</h3>
            <p>
              On the same screen, choose <strong>Target tracking</strong>, the metric{" "}
              <em>Average CPU utilisation</em>, and the target <strong>50</strong>. This means:
              &ldquo;keep the average CPU across the group near 50%.&rdquo; When the CPU is above
              50%, the group adds servers. When it is well below, the group removes servers. AWS
              creates and manages the CloudWatch alarms for you (CloudWatch is the AWS monitoring
              service).
            </p>
          </li>
          <li>
            <h3>Watch it come alive</h3>
            <p>
              The group&apos;s <strong>Activity</strong> tab shows &ldquo;Launching a new EC2
              instance…&rdquo;. If something fails, it also shows why. After 2–4 minutes, the
              target group&apos;s <strong>Targets</strong> tab shows both servers as{" "}
              <em>healthy</em>. Then open the ALB&apos;s DNS name in a browser to reach the app.
            </p>
          </li>
        </ol>

        <h2 id="health">Health checks done properly</h2>
        <p>The health endpoint decides which servers stay and which are replaced. Keep it honest and cheap:</p>
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
                <td>The app process is stuck or has crashed</td>
                <td>App alive <em>and</em> database reachable</td>
              </tr>
              <tr>
                <td><strong>Risk</strong></td>
                <td>If the database is down, the server returns errors but still counts as &ldquo;healthy&rdquo;</td>
                <td className="text-red-300">A short database problem marks every server unhealthy at once. The ASG then replaces them all. A small incident becomes a total outage</td>
              </tr>
              <tr>
                <td><strong>Use it for</strong></td>
                <td>The ALB target-group check</td>
                <td>A separate <code>/api/ready</code> for dashboards and alerts, not for removing servers</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Remember this rule: <strong>a health check that can fail because of another service (a
          dependency) can cause a chain of failures.</strong> A health check answers &ldquo;is{" "}
          <em>this</em> server broken?&rdquo;. An alarm answers &ldquo;is the whole system
          broken?&rdquo;.
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
                <td>The default for apps that are limited by CPU. It is the simplest, and it is our choice</td>
              </tr>
              <tr>
                <td><strong>Target tracking — ALBRequestCountPerTarget</strong></td>
                <td>Keep requests per server at a target (e.g. 500/min)</td>
                <td>Better when the app mostly waits (for example on the database) and the CPU stays low</td>
              </tr>
              <tr>
                <td><strong>Step scaling</strong></td>
                <td>&ldquo;CPU &gt; 70% add 1; &gt; 90% add 3&rdquo;</td>
                <td>You want to decide yourself how strongly to react</td>
              </tr>
              <tr>
                <td><strong>Scheduled</strong></td>
                <td>&ldquo;9 a.m. weekdays: min 4&rdquo;</td>
                <td>You know when traffic comes (a daily peak, a sale, a marketing email)</td>
              </tr>
              <tr>
                <td><strong>Predictive</strong></td>
                <td>Learns your daily and weekly pattern from past data, and adds servers before the load comes</td>
                <td>Steady, repeating traffic. It needs at least 24 hours of history, and it uses up to 14 days</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3>Why scaling is never instant</h3>
        <p>
          A new server needs a few minutes. It must launch, boot, pull the image, and pass two health
          checks. So scaling <em>reacts</em> a few minutes after the load rises. There are three ways
          to be ready for sudden spikes: a higher minimum, a scheduled action before an event that
          you know about, and a lower CPU target (40% leaves more room than 70%).
        </p>
        <p>
          A good rule is to scale <strong>out fast and in slowly</strong>. Imagine you remove a
          server during a short quiet moment, and five minutes later you need it again. You waste
          time and money. This up-and-down switching is called flapping. Target tracking already
          avoids it by waiting longer before it scales in.
        </p>
        <Callout kind="note" label="Speed up boot with a pre-baked AMI">
          <p className="mb-0">
            Installing Docker on every boot costs about a minute. When things are stable, set up one
            server and run <code>aws ec2 create-image</code>. This saves the server as a new AMI (a
            &ldquo;golden image&rdquo;). Put that AMI in the launch template. New servers then start
            ready in seconds. Packer is a tool that builds such images automatically. Terraform
            (Lesson 15) is a tool that creates cloud resources from code, and it can connect it all.
          </p>
        </Callout>

        <h2 id="deploys">Deploying without downtime</h2>
        <p>
          With many servers, a deploy is no longer &ldquo;log in with SSH and restart&rdquo;. The clean
          pattern is <strong>replace the servers, do not change them</strong>:
        </p>
        <ol>
          <li>CI (a robot that builds and tests your code on every change) pushes the new image to ECR, tagged with the commit SHA.</li>
          <li>Update <code>/myapp/image-tag</code> to that SHA.</li>
          <li>
            Start an <strong>instance refresh</strong> on the Auto Scaling group (min healthy 100%,
            max healthy 110%). An instance refresh is an ASG feature that replaces every server with
            a new one, a few at a time. AWS waits for each new server to pass its health check.
          </li>
        </ol>
        <p>
          A rollback is the same move. Put the previous SHA back in the parameter and refresh again.
        </p>
        <p>
          Min healthy 100% with max healthy 110% means AWS starts a new server <em>before</em> it
          retires an old one, so capacity never drops. With a very small group, a larger maximum
          such as 150% or 200% makes sure there is room for an extra server. The ALB only sends
          traffic to healthy targets, so users never reach a server that is still starting. The
          deregistration delay of 30 seconds lets requests that are still running on a retiring
          server finish. Lesson 14 starts the refresh from GitHub Actions.
        </p>
        <Callout kind="warn" label="Make your app exit cleanly on SIGTERM">
          <p className="mb-0">
            When a server is retired, Docker first sends <code>SIGTERM</code> (a polite &ldquo;please
            stop&rdquo; signal). It waits a short time (10 seconds by default). Then it sends{" "}
            <code>SIGKILL</code> (a forced stop). The app should stop taking new connections and
            finish the current ones. The Next.js server handles this by itself. A custom Node server
            needs a <code>process.on(&quot;SIGTERM&quot;, …)</code> handler that calls{" "}
            <code>server.close()</code>.
          </p>
        </Callout>

        <h2 id="load-test">Prove it: load test and kill a server</h2>
        <p>
          Do not trust a design until you have tried to break it. Two experiments turn diagrams into
          real confidence.
        </p>
        <h3>Experiment 1 — does it scale?</h3>
        <CommandList
          title="On your laptop (a staging copy, or a quiet window — this is real traffic)"
          commands={[
            { cmd: "hey -z 3m -c 200 https://yourapp.com/", note: "hey is a small tool that sends many requests and reports the speed. This command uses 200 connections at the same time for 3 minutes (install hey with brew; k6 is a good alternative). Meanwhile, watch the instance count of the Auto Scaling group grow in the console" },
          ]}
        />
        <p>Look at three numbers in the <code>hey</code> summary, and at one graph:</p>
        <ul>
          <li>
            <strong>Requests per second.</strong> This is your measured speed. Use it to improve the
            capacity estimate above.
          </li>
          <li>
            <strong>Latency percentiles (p50, p95, p99).</strong> p95 means that 95% of requests were
            faster than this number. Averages hide problems. The slowest 1% of users are the ones
            who complain.
          </li>
          <li>
            <strong>Status code counts.</strong> Any 5xx (server error) means something broke under
            load.
          </li>
          <li>
            In CloudWatch, look at the ALB&apos;s <code>TargetResponseTime</code> and the
            database&apos;s <code>DatabaseConnections</code>. The database usually fails first.
          </li>
        </ul>
        <h3>Experiment 2 — does it heal?</h3>
        <p>
          While the load test runs, terminate one of the group&apos;s instances in the console, as if
          a data centre lost a machine. The ALB needs a few failed health checks, so it takes about
          a minute to mark the server unhealthy. A few requests may fail during that time. After
          that, the other server keeps serving the users. The group sees that it has fewer servers
          than wanted, and it starts a replacement by itself.
        </p>
        <p>
          If the site shows errors for much longer than that, you have found a real weakness. It is
          usually a keep-alive timeout, a health check that is too slow, or a min-size of 1. It is
          cheap to fix it now.
        </p>

        <h2 id="gotchas">The common pitfalls that cause real 502s</h2>
        <h3>Keep-alive timeout: the intermittent 502</h3>
        <p>
          A keep-alive connection is a connection that stays open so that many requests can reuse it.
          The ALB reuses connections to your servers. It closes a connection after 60 seconds
          without traffic. Node closes idle connections after only <strong>5 seconds</strong> by
          default. So sometimes the ALB sends a request on a connection that Node has just closed.
          The result is an instant <code>502</code>. It happens for about one request in thousands,
          and you cannot reproduce it on your laptop. The rule is:{" "}
          <strong>the server&apos;s keep-alive timeout must be longer than the load balancer&apos;s
          idle timeout.</strong>
        </p>
        <p>
          With the Next.js standalone server, you set this with the <code>KEEP_ALIVE_TIMEOUT=65000</code>{" "}
          line that is already in <code>/myapp/env</code> (the value is in milliseconds). A custom
          Node server sets <code>server.keepAliveTimeout = 65_000</code> and a slightly higher{" "}
          <code>headersTimeout</code>. Any value above the ALB&apos;s 60 seconds works.
        </p>
        <h3>Sticky sessions</h3>
        <p>
          The ALB can keep one user on the same server with a cookie. This is called
          &ldquo;stickiness&rdquo;. It is tempting when sessions live in server memory. But it spoils
          the even sharing of load, and the user loses the session when that server is replaced. Use
          it only as a short-term bridge while you move sessions to Redis (Lesson 16). It is not a
          real solution.
        </p>
        <h3>WebSockets</h3>
        <p>
          A WebSocket is a long-lived two-way connection (used for chat and live updates). ALBs
          support WebSockets with no extra setup. But such a connection ties a user to one server
          for as long as it lasts. Idle connections are closed after 60 seconds unless the app sends
          small &ldquo;ping&rdquo; messages. For such apps, scale on the number of connections, not
          on CPU.
        </p>
        <h3>Real client IP</h3>
        <p>
          Behind an ALB, every connection comes from the ALB. The user&apos;s address is in the{" "}
          <code>X-Forwarded-For</code> header. Set your framework to trust that header only from
          inside the VPC (see the real-IP note in Lesson 10). If you do not, every rate limit and
          log shows the ALB&apos;s IP.
        </p>

        <h2 id="cost">What this costs</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Approx. per month (prices differ a little by region)</th></tr>
            </thead>
            <tbody>
              <tr><td>Application Load Balancer, base</td><td>~$0.0225/hour ≈ $16.50</td></tr>
              <tr><td>ALB usage (LCUs: connections, bytes, rules)</td><td>~$0.008 per LCU-hour (an LCU is the unit AWS uses to measure ALB use); a small app ≈ $2–8</td></tr>
              <tr><td>2 × t3.small, 24/7</td><td>~$32</td></tr>
              <tr><td>Public IPv4 per server + per ALB zone</td><td>~$3.60 each (4 ≈ $14)</td></tr>
              <tr><td>Auto Scaling, launch templates, target groups</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>Extra servers during a spike</td><td>Billed per second, only while they exist</td></tr>
              <tr><td>ACM certificate</td><td className="font-semibold text-emerald-300">Free</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          A realistic total for this tier is <strong>about $60–75 a month</strong>. That is much more
          than one server. What you buy is: no single point of failure, deploys without downtime,
          and room to grow. If you do not need this yet, one server with Nginx is a good choice. Do
          not add an ALB only because the course has a lesson about it.
        </p>
        <Callout kind="ok" label="Stopping the meter while learning">
          <p className="mb-0">
            When you are not studying, set the ASG to <code>--min-size 0 --desired-capacity 0</code>{" "}
            (with <code>aws autoscaling update-auto-scaling-group …</code>). It then removes every
            server. The ALB keeps charging you, so delete it too when you finish. Or run this whole
            tier for one weekend only and build it again with Terraform in Lesson 15.
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
                  It must be stateless. Sessions, uploads and data must live outside the server (cookies or
                  JWT or Redis, S3, RDS). Settings must come from a shared place. Scheduled jobs must
                  not run on every server.
                </p>
              ),
            },
            {
              q: "ALB vs NLB?",
              a: (
                <p className="mb-0">
                  An ALB works at layer 7. It understands HTTP, so it can route by host, path or header, and
                  it handles TLS, redirects and WebSockets. An NLB works at layer 4. It handles TCP
                  and UDP with very high speed and low delay, and it gives fixed IPs. I use an ALB for
                  web apps and APIs. I use an NLB for protocols that are not HTTP, or when I need
                  fixed IPs.
                </p>
              ),
            },
            {
              q: "Explain how Auto Scaling replaces an unhealthy instance.",
              a: (
                <p className="mb-0">
                  With ELB health checks turned on, the group treats a server that the load balancer
                  marks unhealthy as unhealthy too. It terminates that server and starts a
                  replacement from the launch template, so the wanted number of servers is restored.
                  It waits for the grace period before it judges new servers.
                </p>
              ),
            },
            {
              q: "Why can a database-dependent health check be dangerous?",
              a: (
                <p className="mb-0">
                  If the shared dependency has a short problem, every server fails the check at the same
                  time, and the group replaces all of them. A small problem becomes a total outage. A
                  health check should test the server itself. The health of dependencies belongs in
                  alarms.
                </p>
              ),
            },
            {
              q: "You get random 502s, about 1 in 2,000 requests. Nothing in the app logs. Why?",
              a: (
                <p className="mb-0">
                  This is the classic keep-alive mismatch. The backend closes idle connections early (Node
                  waits 5 s by default), before the ALB&apos;s 60 s idle timeout. So the ALB sometimes
                  reuses a connection that is already closed. I set the backend keep-alive timeout
                  above the ALB idle timeout.
                </p>
              ),
            },
            {
              q: "How do you deploy a new version with zero downtime behind an ASG?",
              a: (
                <p className="mb-0">
                  I build an image that never changes after it is built. I update the launch template, or
                  the parameter it reads. Then I run an instance refresh. It starts new servers
                  before it retires old ones, waits for health checks, and lets running requests
                  finish (connection draining). A rollback is the same steps with the previous
                  version.
                </p>
              ),
            },
            {
              q: "1,000 concurrent users — how many servers?",
              a: (
                <p className="mb-0">
                  First I turn users into requests per second (users divided by seconds between actions).
                  Then I measure one server&apos;s speed with a load test and divide. I add extra room
                  for spikes and for the loss of one AZ. Finally I check the number of database
                  connections at the maximum number of servers, because that is often the real
                  limit.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 13</h2>
        <ol>
          <li>
            Check your app with the statelessness table. Write down anything that would break with two
            servers, and fix it or make a note of it.
          </li>
          <li>
            Build the tier: certificate, target group, ALB, parameters, launch template, ASG, policy.
            Wait until both targets are healthy and load your site via the ALB DNS name.
          </li>
          <li>
            Break the health check on purpose (change the path in the target group to{" "}
            <code>/nope</code>). Watch the targets turn unhealthy. Notice that the ALB still sends
            traffic to them. When all targets are unhealthy, the ALB tries all of them (this is called
            fail-open). Restore the path quickly. With ELB health checks on, the ASG will soon start
            to replace the &ldquo;unhealthy&rdquo; servers.
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
            Work out the monthly cost of your setup at min-size 2, and at max-size 6 for one hour a
            day. Which line is the biggest?
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
          You now run the same kind of setup that large sites use, only smaller: one address, many
          servers that are easy to replace, automatic repair, and automatic growth.
        </p>
        <ul>
          <li>
            <strong>ALB</strong> = listener + rules + target group + health checks. It ends HTTPS with
            a free ACM certificate.
          </li>
          <li>
            <strong>Auto Scaling</strong> = launch template + group + policy. Servers are cattle, made
            from a recipe with zero manual steps.
          </li>
          <li>
            <strong>Stateless first.</strong> Sessions, files, data and cron jobs must live outside the
            web servers.
          </li>
          <li>
            <strong>Health checks test the server</strong>, not its dependencies. Otherwise a short
            problem becomes an outage.
          </li>
          <li>
            <strong>Do the maths</strong> (requests per second, capacity per server, and the number of
            database connections at maximum size), and <strong>test by breaking things</strong>.
          </li>
        </ul>
        <p>
          The ALB gives you a long, ugly DNS name. Next, we connect your real domain to it, and to
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
