import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import CdnFlow from "@/components/figures/CdnFlow";
import DeployPipeline from "@/components/figures/DeployPipeline";
import FullStackMap from "@/components/figures/FullStackMap";
import NginxFlow from "@/components/figures/NginxFlow";
import Pm2Loop from "@/components/figures/Pm2Loop";
import ScalingFlow from "@/components/figures/ScalingFlow";
import VpcLayout from "@/components/figures/VpcLayout";
import Script from "@/components/Script";
import { getLesson, lessonHref, READINGS, SERIES } from "@/lib/lessons";

const reading = READINGS.find((r) => r.slug === "the-pieces")!;

export const metadata: Metadata = {
  title: reading.title,
  description: reading.summary,
};

const outline = [
  { id: "map", label: "The map — one request through everything" },
  { id: "nginx", label: "Nginx — the receptionist (reverse proxy)" },
  { id: "pm2", label: "PM2 — keeping the app alive" },
  { id: "vpc", label: "VPC — public and private rooms" },
  { id: "rds", label: "RDS — the managed database" },
  { id: "s3-cdn", label: "S3 + CloudFront — files, and files near the user" },
  { id: "alb", label: "ALB + Auto Scaling — one server becomes many" },
  { id: "redis", label: "Redis — the fast memory beside the database" },
  { id: "docker", label: "Docker — the same box everywhere" },
  { id: "cicd", label: "CI/CD — the robot that deploys" },
  { id: "terraform", label: "Terraform — the cloud written down" },
  { id: "cloudwatch", label: "CloudWatch — knowing before users tell you" },
  { id: "pipeline", label: "How it all fits: from git push to a user's screen" },
  { id: "who-when", label: "Who does what, and which lesson builds it" },
];

/** Each piece in one line, with the lesson that builds it. */
const pieces: [string, string, string, number][] = [
  ["Nginx", "receptionist", "Public door on 80/443; ends TLS; forwards to the app on 3000; serves static files", 10],
  ["PM2", "caretaker", "Keeps the Node process alive; restarts on crash and reboot; zero-downtime reload", 7],
  ["VPC", "the building", "Your private network; public subnet faces the internet, private subnet never does", 6],
  ["RDS", "record room", "Managed PostgreSQL: backups, patches, failover done by AWS; private subnet only", 8],
  ["S3", "warehouse", "Object storage for uploads, images, backups, built assets", 11],
  ["CloudFront", "local depots", "CDN: caches S3/app responses at 400+ edges near users", 11],
  ["ALB", "traffic officer", "One public address; spreads requests over healthy servers", 12],
  ["Auto Scaling", "hiring manager", "Adds servers when busy, removes them when idle", 12],
  ["Redis", "sticky notes", "In-memory store for sessions, cache, rate limits", 16],
  ["Docker", "shipping container", "App + runtime + deps in one image that runs identically anywhere", 9],
  ["GitHub Actions", "the robot", "Runs tests, builds and deploys on every push", 14],
  ["Terraform", "the blueprint", "All of the above described in files, applied with one command", 15],
  ["CloudWatch", "the dashboard", "Metrics, logs and alarms for every piece", 17],
];

export default function ThePiecesPage() {
  return (
    <article>
      <header className="mb-8 border-b border-line pb-6">
        <nav className="mb-4 font-mono text-[0.8rem] text-ink-dim" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-sky">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/${SERIES.slug}`} className="hover:text-sky">{SERIES.title}</Link>
          <span className="mx-2">/</span>
          <span>Background reading</span>
        </nav>
        <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">
          Background reading · {reading.readTime} read
        </p>
        <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[2rem]">
          {reading.title}
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">
          Lessons 0–4 keep mentioning Nginx, PM2, load balancers, RDS, CDN, VPC and friends before
          their own lesson arrives. This is the missing chapter: what each one <em>is</em>, the
          problem it exists to solve, where it sits in the flow, and enough of the &ldquo;how&rdquo;
          that nothing later feels like magic.
        </p>
      </header>

      <section className="mb-10 rounded-xl border border-line bg-bg-elev px-6 py-5" aria-labelledby="learn">
        <h2 id="learn" className="mb-2 text-[1.1rem] font-semibold text-sky">
          What this reading covers
        </h2>
        <ol className="m-0 list-decimal pl-5 marker:text-sky">
          {outline.map((item) => (
            <li key={item.id} className="my-1">
              <a href={`#${item.id}`} className="text-ink hover:text-sky">
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <div className="lesson">
        <Callout kind="note" label="How to read this">
          <p className="mb-0">
            Each section has the same four parts: <strong>what it is</strong> (one analogy),{" "}
            <strong>the problem</strong> it solves, <strong>where it sits</strong> (a flow), and{" "}
            <strong>the minimal how</strong> — real config or commands, short enough to recognise
            later. You do not need to run anything today. Come back to any section the moment a
            lesson mentions the piece and you have forgotten it.
          </p>
        </Callout>

        <h2 id="map">The map — one request through everything</h2>
        <p>
          Lesson 0 showed the target architecture as five boxes. Lessons 2, 3 and 4 explained the
          arrows at the top — how a name becomes an IP, how a port is reached, how the connection
          is encrypted. Here is the same picture with every box filled in, in the order a single
          request meets them.
        </p>
        <FullStackMap />
        <p>
          Two things to notice before we go piece by piece. First, the request crosses a boundary
          at the ALB: everything above it is public, everything below it is inside your VPC.
          Second, the app itself is only two boxes — Nginx and the Node process. Everything else
          exists to make those two boxes fast, safe, or many.
        </p>

        {/* ───────────────────────── Nginx ───────────────────────── */}
        <h2 id="nginx">Nginx — the receptionist</h2>
        <h3>What it is</h3>
        <p>
          Nginx (say &ldquo;engine-x&rdquo;) is a web server that is very good at one thing:
          accepting a huge number of connections cheaply and deciding what to do with each. In
          Lesson 2&apos;s office building it is the receptionist — the only person visitors ever
          talk to. In our setup it runs as a <strong>reverse proxy</strong>: it takes the public
          request on port 443 and forwards it to your Next.js app on a private port.
        </p>
        <h3>The problem it solves</h3>
        <p>
          Your Node app <em>can</em> listen on port 443 directly. But then it must also handle
          TLS certificates, serve images and CSS, compress responses, block abusive clients, add
          security headers, and survive 10,000 people opening a connection at once. Node is a fine
          application runtime and a mediocre front door. Nginx is a superb front door and has no
          idea what your application does. Splitting the jobs lets each do what it is good at.
        </p>
        <h3>Where it sits</h3>
        <NginxFlow />
        <h3>The minimal how</h3>
        <p>
          A complete, production-shaped config is about twenty lines. Everything you will see in
          Lesson 10 is a refinement of this:
        </p>
        <Script
          title="/etc/nginx/sites-available/yourapp.com"
          code={`server {
    listen 443 ssl;
    server_name yourapp.com www.yourapp.com;

    ssl_certificate     /etc/letsencrypt/live/yourapp.com/fullchain.pem;   # from Lesson 4
    ssl_certificate_key /etc/letsencrypt/live/yourapp.com/privkey.pem;

    gzip on;                                   # compress text responses
    client_max_body_size 20m;                  # allow 20 MB uploads

    # Static files: Nginx serves these itself, never waking the app
    location /_next/static/ {
        alias /home/ubuntu/myapp/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Everything else: hand to the app on the private port
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {                                       # plain HTTP → redirect
    listen 80;
    server_name yourapp.com www.yourapp.com;
    return 301 https://$host$request_uri;
}`}
        />
        <CommandList
          title="The four Nginx commands you actually use"
          commands={[
            { cmd: "sudo apt install nginx -y", note: "Install. It starts immediately and serves a welcome page on port 80." },
            { cmd: "sudo ln -s /etc/nginx/sites-available/yourapp.com /etc/nginx/sites-enabled/", note: "Enable a site config (sites-available holds files, sites-enabled holds links to the active ones)" },
            { cmd: "sudo nginx -t", note: "Test the config for syntax errors — ALWAYS before reloading" },
            { cmd: "sudo systemctl reload nginx", note: "Apply the config with zero dropped connections" },
            { cmd: "sudo tail -f /var/log/nginx/error.log", note: "When something is wrong, this is where it says so (Lesson 1: /var/log)" },
          ]}
        />
        <Callout kind="note" label="Why the X-Forwarded-* headers matter">
          <p className="mb-0">
            Your app only ever sees a connection from 127.0.0.1 — Nginx. Without those headers it
            would think every user is localhost using plain HTTP. <code>X-Forwarded-For</code>{" "}
            carries the real client IP (for rate limits and logs), <code>X-Forwarded-Proto</code>{" "}
            tells the app the original request was HTTPS (so secure cookies and redirects work).
            This is also the root of the <code>ERR_TOO_MANY_REDIRECTS</code> loop from Lesson 4.
          </p>
        </Callout>

        {/* ───────────────────────── PM2 ───────────────────────── */}
        <h2 id="pm2">PM2 — keeping the app alive</h2>
        <h3>What it is</h3>
        <p>
          PM2 is a <strong>process manager</strong> for Node. It starts your app as a background
          daemon, watches it, and brings it back whenever it stops — because of a crash, a
          reboot, or you closing your terminal. Think of a caretaker whose only job is to make
          sure the lights stay on.
        </p>
        <h3>The problem it solves</h3>
        <p>
          Lesson 1 ended on the classic trap: <code>npm start</code> in an SSH session, close the
          laptop, site is down. A Linux process belongs to the shell that started it; when the
          shell dies, so does the process. And even if it survived, one unhandled exception ends
          it and nothing restarts it. Production needs something that outlives your session and
          reacts to failure automatically.
        </p>
        <Pm2Loop />
        <h3>The minimal how</h3>
        <CommandList
          title="PM2 in six commands"
          commands={[
            { cmd: "sudo npm install -g pm2", note: "Install globally, once per server" },
            { cmd: "pm2 start npm --name myapp -- start", note: <>Run <code>npm start</code> as a managed process called <code>myapp</code></> },
            { cmd: "pm2 startup && pm2 save", note: "Register PM2 with systemd so it — and your app — come back after a reboot. Run the command it prints." },
            { cmd: "pm2 logs myapp", note: "Live stdout/stderr of your app (what you used to see in the terminal)" },
            { cmd: "pm2 reload myapp", note: "After a deploy: restart with zero downtime (old process serves until the new one is ready)" },
            { cmd: "pm2 status", note: "Is it online? How many restarts? How much memory?" },
          ]}
        />
        <p>
          For a real app you keep this in a file instead of remembering flags —{" "}
          <code>ecosystem.config.js</code> — and run <code>pm2 start ecosystem.config.js</code>:
        </p>
        <Script
          title="ecosystem.config.js"
          code={`module.exports = {
  apps: [{
    name: "myapp",
    script: "npm",
    args: "start",
    cwd: "/home/ubuntu/myapp",
    instances: "max",          // one process per CPU core
    exec_mode: "cluster",      // share port 3000 between them
    env: { NODE_ENV: "production", PORT: 3000 },
    max_memory_restart: "500M" // restart if a leak grows past this
  }]
};`}
        />
        <Callout kind="note" label="PM2 vs Docker vs systemd">
          <p className="mb-0">
            All three can keep a process alive. PM2 is the easiest for a single Node app on one
            server, which is why Lesson 7 uses it. Once the app is in a Docker container (Lesson
            9), the container runtime does the restarting and PM2 is usually dropped. Either way
            the idea is identical: <em>something other than your shell owns the process</em>.
          </p>
        </Callout>

        {/* ───────────────────────── VPC ───────────────────────── */}
        <h2 id="vpc">VPC — public and private rooms</h2>
        <h3>What it is</h3>
        <p>
          A VPC is your own private network inside AWS — the building from Lesson 2, now with
          floors. Inside it you carve out <strong>subnets</strong>: address ranges that are
          either <em>public</em> (have a route to the internet) or <em>private</em> (do not). A
          server&apos;s subnet decides whether the internet can ever reach it at all, before
          Security Groups even get a say.
        </p>
        <h3>The problem it solves</h3>
        <p>
          Lesson 2 protected the database with a Security Group rule (&ldquo;only from the
          app&apos;s SG&rdquo;). That is good. But a rule can be edited by mistake. A database in a
          private subnet has <em>no path</em> from the internet — there is no route, so no rule
          can accidentally open it. Defence in depth: the network layout and the firewall both say
          no.
        </p>
        <h3>Where it sits</h3>
        <VpcLayout />
        <h3>The minimal how</h3>
        <p>
          Four objects make a VPC useful. Lesson 6 creates each one in the console and Lesson 15
          writes them as Terraform; recognise the names now:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Object</th>
                <th>What it does</th>
                <th>Ours</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="whitespace-nowrap"><strong>VPC</strong></td>
                <td>The whole address space</td>
                <td><code>10.0.0.0/16</code> (65,536 addresses)</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap"><strong>Subnet</strong></td>
                <td>A slice of it, in one availability zone</td>
                <td>public <code>10.0.1.0/24</code>, private <code>10.0.2.0/24</code></td>
              </tr>
              <tr>
                <td className="whitespace-nowrap"><strong>Internet Gateway</strong></td>
                <td>The VPC&apos;s door to the internet</td>
                <td>one per VPC</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap"><strong>Route table</strong></td>
                <td>Where traffic for each destination goes</td>
                <td>public: <code>0.0.0.0/0 → igw</code> · private: no such row</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap"><strong>NAT Gateway</strong></td>
                <td>Lets private servers call <em>out</em> (updates, APIs) without being reachable <em>in</em></td>
                <td>optional; costs ~$35/month, so Lesson 6 discusses when to skip it</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="The rule that makes a subnet “public”">
          <p className="mb-0">
            Nothing else. A subnet is public purely because its route table has a{" "}
            <code>0.0.0.0/0</code> row pointing at the Internet Gateway. Delete that row and every
            server in it silently goes private. When Lesson 6 asks &ldquo;why can&apos;t I SSH to
            my instance?&rdquo;, check the route table right after the Security Group.
          </p>
        </Callout>

        {/* ───────────────────────── RDS ───────────────────────── */}
        <h2 id="rds">RDS — the managed database</h2>
        <h3>What it is</h3>
        <p>
          RDS is PostgreSQL (or MySQL) run by AWS. You get a hostname, a port and a password. You
          never SSH into the machine, because there is no machine to SSH into from your point of
          view — AWS owns the OS, the disk, the patches, the backups and the failover.
        </p>
        <h3>The problem it solves</h3>
        <p>
          You <em>could</em> install PostgreSQL on your EC2 box tonight. Then you own: nightly
          backups and testing that they restore, security patches, disk filling up, the database
          process competing with your app for CPU and memory, and what happens when that single
          server dies with all your customers&apos; data on it. RDS turns that list into a
          monthly bill of roughly $15 for the smallest instance — and, crucially, makes the app
          servers <strong>stateless</strong>, which is what lets Auto Scaling throw them away and
          create new ones.
        </p>
        <h3>Where it sits</h3>
        <p>
          In the private subnet, with a Security Group that only accepts port 5432 from the app
          server&apos;s Security Group. From the app it looks like any Postgres:
        </p>
        <Script
          title=".env  (chmod 600 — Lesson 1)"
          code={`DATABASE_URL=postgresql://appuser:S3cret@myapp-db.abc123xyz.ap-south-1.rds.amazonaws.com:5432/myapp`}
        />
        <h3>The minimal how</h3>
        <CommandList
          title="What Lesson 8 does, compressed"
          commands={[
            { cmd: "aws rds create-db-instance --db-instance-identifier myapp-db --engine postgres --db-instance-class db.t4g.micro --allocated-storage 20 --master-username appuser --master-user-password 'S3cret' --no-publicly-accessible --vpc-security-group-ids sg-db123 --db-subnet-group-name private", note: "Create the smallest Postgres, private, in the private subnet group" },
            { cmd: "aws rds describe-db-instances --query 'DBInstances[0].Endpoint.Address'", note: "Get the hostname to put in DATABASE_URL" },
            { cmd: "psql \"$DATABASE_URL\" -c 'select now();'", note: "From the EC2 box (not your laptop — it's private): prove the connection works" },
          ]}
        />
        <Callout kind="note" label="Three RDS words you will meet">
          <p className="mb-0">
            <strong>Multi-AZ</strong> = a hot standby copy in a second data centre, automatic
            failover (double the cost, worth it in real production). <strong>Snapshot</strong> =
            a full backup you can restore to a new instance in minutes. <strong>Parameter
            group</strong> = the <code>postgresql.conf</code> you no longer edit by hand.
          </p>
        </Callout>

        {/* ───────────────────────── S3 + CDN ───────────────────────── */}
        <h2 id="s3-cdn">S3 + CloudFront — files, and files near the user</h2>
        <h3>What they are</h3>
        <p>
          <strong>S3</strong> is a warehouse for files (&ldquo;objects&rdquo;): unlimited, cheap
          (~$0.023/GB/month), eleven nines of durability, reachable over HTTPS with a URL per file.
          A bucket is a top-level folder with a globally unique name. <strong>CloudFront</strong>{" "}
          is a CDN: AWS has 400+ edge locations worldwide, and CloudFront keeps copies of your
          files at whichever edges users are actually near.
        </p>
        <h3>The problem they solve</h3>
        <p>
          Two problems. First, files on an EC2 disk vanish when Auto Scaling replaces the server,
          and cannot be shared between two servers — so user uploads must live somewhere all
          servers can see. That is S3. Second, a user in London fetching a 2 MB image from Mumbai
          waits ~250 ms of pure distance on every request; from a London edge it is ~15 ms. That is
          CloudFront. It also absorbs traffic spikes: a million hits on a cached file never touch
          your server.
        </p>
        <h3>Where they sit</h3>
        <CdnFlow />
        <h3>The minimal how</h3>
        <CommandList
          title="S3 in four commands"
          commands={[
            { cmd: "aws s3 mb s3://myapp-uploads-prod", note: "Make a bucket (name must be globally unique)" },
            { cmd: "aws s3 cp ./invoice.pdf s3://myapp-uploads-prod/tenants/acme/invoice.pdf", note: "Upload one file" },
            { cmd: "aws s3 sync .next/static s3://myapp-assets-prod/_next/static --cache-control 'public,max-age=31536000,immutable'", note: "Upload your built assets with a one-year cache header — the CDN keeps them forever" },
            { cmd: "aws s3 presign s3://myapp-uploads-prod/tenants/acme/invoice.pdf --expires-in 300", note: "A link that works for 5 minutes, so private files stay private but a user can download theirs" },
          ]}
        />
        <p>
          From code you use the SDK (<code>@aws-sdk/client-s3</code>) with the same verbs:{" "}
          <code>PutObject</code>, <code>GetObject</code>, and pre-signed URLs so the browser
          uploads straight to S3 without the file passing through your server at all. CloudFront
          then sits in front with a &ldquo;distribution&rdquo; whose <em>origin</em> is the bucket
          (for assets) or your ALB (for pages), and an ACM certificate (Lesson 4) for HTTPS.
        </p>
        <Callout kind="warn" label="The one S3 rule">
          <p className="mb-0">
            Buckets are private by default. Keep them that way. Serve public assets through
            CloudFront with an <em>origin access control</em>, and private files through
            pre-signed URLs. &ldquo;Public bucket&rdquo; is how companies end up in the news.
          </p>
        </Callout>

        {/* ───────────────────────── ALB + ASG ───────────────────────── */}
        <h2 id="alb">ALB + Auto Scaling — one server becomes many</h2>
        <h3>What they are</h3>
        <p>
          An <strong>Application Load Balancer</strong> is one public address that spreads
          incoming requests across a group of servers, and stops sending to any server that fails
          its health check. An <strong>Auto Scaling group</strong> decides how many servers that
          group should have right now — launching identical copies from a template when load
          rises, terminating them when it falls.
        </p>
        <h3>The problem they solve</h3>
        <p>
          A single EC2 has three failure modes: it gets too busy, it dies, and it must go down to
          be updated. All three are fixed by the same move — have more than one, and put something
          in front that knows which ones are healthy. That &ldquo;something&rdquo; is the ALB. Auto
          Scaling then answers the follow-up question: how many? Two at night, six at month-end
          when every tenant logs in, and you pay only for the hours each one ran.
        </p>
        <h3>Where they sit</h3>
        <ScalingFlow />
        <h3>The minimal how</h3>
        <p>Three objects, always in this order:</p>
        <ol>
          <li>
            <strong>Target group</strong> — &ldquo;port 3000 on these instances, health check{" "}
            <code>GET /api/health</code> every 30 s, 2 failures = unhealthy&rdquo;.
          </li>
          <li>
            <strong>Load balancer + listener</strong> — public, in the public subnets, listener
            on 443 with an ACM certificate, forwarding to the target group. Listener on 80
            redirecting to 443.
          </li>
          <li>
            <strong>Launch template + Auto Scaling group</strong> — the AMI (a snapshot of a
            configured server), instance size, the app&apos;s Security Group, a script that starts
            the app on boot; then min/desired/max and a scaling rule such as &ldquo;keep average CPU
            at 60%&rdquo;.
          </li>
        </ol>
        <Script
          title="app/api/health/route.ts  — the endpoint the ALB will call"
          code={`export async function GET() {
  // keep it cheap: no DB call, no auth — "is the process up and serving?"
  return Response.json({ ok: true, ts: Date.now() });
}`}
        />
        <Callout kind="note" label="What this demands of your app">
          <p className="mb-0">
            Any request can land on any server, so the app must keep nothing on local disk or in
            local memory that a later request needs: sessions go to Redis, uploads go to S3, state
            goes to RDS. This is the &ldquo;stateless&rdquo; requirement from the hosting-platforms
            reading — and it is why RDS, S3 and Redis are all introduced <em>before</em> Lesson 12.
          </p>
        </Callout>

        {/* ───────────────────────── Redis ───────────────────────── */}
        <h2 id="redis">Redis — the fast memory beside the database</h2>
        <h3>What it is</h3>
        <p>
          Redis is a key-value store that lives entirely in RAM. Reads and writes take well under
          a millisecond — roughly a hundred times faster than a Postgres query — at the price of
          holding only as much as fits in memory and being the wrong tool for anything relational.
          On AWS it is offered managed as ElastiCache.
        </p>
        <h3>The problem it solves</h3>
        <p>
          Three recurring ones. <strong>Sessions</strong>: once there are several app servers, a
          login on server #1 must be visible to server #2, and hitting Postgres for every request
          just to check &ldquo;who is this?&rdquo; is wasteful. <strong>Caching</strong>: the
          tenant&apos;s settings, the dashboard totals, the product list — computed once, served
          from Redis for the next 60 seconds. <strong>Rate limiting and queues</strong>: counters
          that many servers increment safely, and job lists a background worker pulls from (the
          PDF generation from Lesson 0).
        </p>
        <h3>The minimal how</h3>
        <Script
          title="cache-aside, the pattern you will write ten times"
          code={`import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL);   // redis://myapp-cache.abc.ap-south-1.cache.amazonaws.com:6379

export async function getTenantSettings(tenantId: string) {
  const key = \`tenant:\${tenantId}:settings\`;

  const cached = await redis.get(key);                 // 1. try the fast path
  if (cached) return JSON.parse(cached);

  const fresh = await db.tenantSettings.findUnique({ where: { tenantId } });  // 2. miss → real query
  await redis.set(key, JSON.stringify(fresh), "EX", 60);                      // 3. remember for 60 s
  return fresh;
}`}
        />
        <CommandList
          title="Talking to Redis by hand"
          commands={[
            { cmd: "redis-cli -h myapp-cache.abc.ap-south-1.cache.amazonaws.com", note: "Open a shell to it (from the EC2 box — it's in the private subnet)" },
            { cmd: "SET greeting hello EX 30", note: "Store a value that expires in 30 seconds" },
            { cmd: "GET greeting", note: "Read it back — (nil) after 30 s" },
            { cmd: "INCR ratelimit:203.0.113.5", note: "Atomic counter — safe even when four servers call it at once" },
            { cmd: "KEYS 'tenant:*'", note: "Peek at what is cached (never in production on a big instance — use SCAN)" },
          ]}
        />

        {/* ───────────────────────── Docker ───────────────────────── */}
        <h2 id="docker">Docker — the same box everywhere</h2>
        <h3>What it is</h3>
        <p>
          Docker packages your app <em>and</em> everything it needs to run — Node itself, system
          libraries, your <code>node_modules</code>, the built output — into one{" "}
          <strong>image</strong>. A running copy of an image is a <strong>container</strong>. The
          image built on your laptop is byte-for-byte what runs on EC2, so &ldquo;works on my
          machine&rdquo; becomes &ldquo;works everywhere or nowhere&rdquo;.
        </p>
        <h3>The problem it solves</h3>
        <p>
          Lesson 7&apos;s manual deploy installs Node on the server by hand, clones, runs{" "}
          <code>npm install</code> there, builds there. It works — once. The second server must be
          set up identically; a Node upgrade must be repeated everywhere; a dependency that behaves
          differently on Ubuntu than on macOS surfaces only in production. Docker moves all of that
          into a file that is built once and shipped as a unit.
        </p>
        <h3>The minimal how</h3>
        <Script
          title="Dockerfile  — a production Next.js image"
          code={`# 1. Build stage: has everything needed to compile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. Runtime stage: only what is needed to run (small, fewer holes)
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]`}
        />
        <CommandList
          title="The Docker loop"
          commands={[
            { cmd: "docker build -t myapp:1.4.0 .", note: "Turn the Dockerfile into an image, tagged with a version" },
            { cmd: "docker run -p 3000:3000 --env-file .env myapp:1.4.0", note: "Run it locally — exactly as it will run on the server" },
            { cmd: "docker push 123456789012.dkr.ecr.ap-south-1.amazonaws.com/myapp:1.4.0", note: "Upload the image to a registry (ECR) so servers can pull it" },
            { cmd: "docker run -d --restart unless-stopped -p 127.0.0.1:3000:3000 --env-file .env myapp:1.4.0", note: "On EC2: run detached, auto-restart (this replaces PM2), bound to localhost for Nginx" },
            { cmd: "docker compose up -d", note: "Locally: app + Postgres + Redis together from one compose.yml, so dev matches prod" },
          ]}
        />
        <Callout kind="note" label="Image vs container, once and for all">
          <p className="mb-0">
            Image = the recipe and all ingredients, frozen (a file). Container = one dish cooked
            from it, running (a process). You build an image once and run as many containers from
            it as you like; on a 4-core server that might be one container with PM2 inside, or
            four containers with none.
          </p>
        </Callout>

        {/* ───────────────────────── CI/CD ───────────────────────── */}
        <h2 id="cicd">CI/CD — the robot that deploys</h2>
        <h3>What it is</h3>
        <p>
          <strong>Continuous Integration</strong>: every push runs the tests and the build on a
          clean machine, so broken code is caught before anyone merges it.{" "}
          <strong>Continuous Deployment</strong>: when the main branch is green, the same robot
          ships it to production. GitHub Actions is the robot: a YAML file in your repo describes
          the steps, GitHub supplies the machines.
        </p>
        <h3>The problem it solves</h3>
        <p>
          Manual deploys are slow, scary and inconsistent — someone SSHes in at 6pm, forgets one
          step, and the fix takes an hour. A pipeline does the identical steps every time, in
          minutes, with a log, and refuses to deploy anything that failed a test. It is also what
          turns &ldquo;deploy&rdquo; from a person&apos;s job into a merge button.
        </p>
        <h3>The minimal how</h3>
        <Script
          title=".github/workflows/deploy.yml"
          code={`name: deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build

  deploy:
    needs: test                       # only if every step above passed
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-deploy   # IAM role, no long-lived keys (Lesson 5)
          aws-region: ap-south-1
      - run: |
          docker build -t $ECR/myapp:$GITHUB_SHA .
          docker push $ECR/myapp:$GITHUB_SHA
      - run: aws ssm send-command --targets Key=tag:app,Values=myapp \\
               --document-name AWS-RunShellScript \\
               --parameters commands="/home/ubuntu/deploy.sh $GITHUB_SHA"`}
        />
        <p>
          Read it top to bottom and it is exactly Lesson 7&apos;s manual sequence, written down.
          That is the whole trick: you cannot automate a deploy you have never done by hand, which
          is why Lesson 7 comes before Lesson 14.
        </p>

        {/* ───────────────────────── Terraform ───────────────────────── */}
        <h2 id="terraform">Terraform — the cloud written down</h2>
        <h3>What it is</h3>
        <p>
          Terraform lets you describe every AWS object — VPC, subnets, Security Groups, EC2, RDS,
          ALB, buckets — in text files, then run one command that makes reality match the files.
          Change a file, run it again, and only the difference is applied. The files live in git,
          so infrastructure gets pull requests, reviews and history like code does.
        </p>
        <h3>The problem it solves</h3>
        <p>
          After Lessons 6–13 you will have clicked through perhaps forty console screens. Nobody
          remembers forty screens. Rebuilding the setup in a second region, for a staging
          environment, or after an accident, means doing them all again from memory. Terraform
          makes the setup <em>reproducible</em> — and makes &ldquo;what exactly is running in
          production?&rdquo; a question you answer by reading a folder.
        </p>
        <h3>The minimal how</h3>
        <Script
          title="main.tf  — the Security Group from Lesson 2, as code"
          code={`resource "aws_security_group" "app" {
  name   = "myapp-app-sg"
  vpc_id = aws_vpc.main.id

  ingress { from_port = 443, to_port = 443, protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 80,  to_port = 80,  protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 22,  to_port = 22,  protocol = "tcp", cidr_blocks = ["103.45.12.8/32"] }

  egress  { from_port = 0, to_port = 0, protocol = "-1", cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_instance" "app" {
  ami                    = "ami-0abcdef1234567890"
  instance_type          = "t4g.small"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.app.id]
  tags                   = { app = "myapp" }
}`}
        />
        <CommandList
          title="The Terraform loop"
          commands={[
            { cmd: "terraform init", note: "Download the AWS provider, once per folder" },
            { cmd: "terraform plan", note: "Show what would change — read this like a diff, every time" },
            { cmd: "terraform apply", note: "Make it so (asks for a yes). Creates / changes / deletes only what the plan showed." },
            { cmd: "terraform destroy", note: "Tear everything in this folder down — how you stop paying for a staging environment at night" },
          ]}
        />
        <Callout kind="warn" label="State">
          <p className="mb-0">
            Terraform keeps a <code>terraform.tfstate</code> file recording what it created and
            the real IDs. Lose it and Terraform forgets it owns anything. Lesson 15 stores it in S3
            with locking, which is the first thing every team does and the first thing every solo
            developer forgets.
          </p>
        </Callout>

        {/* ───────────────────────── CloudWatch ───────────────────────── */}
        <h2 id="cloudwatch">CloudWatch — knowing before users tell you</h2>
        <h3>What it is</h3>
        <p>
          CloudWatch is where AWS collects three things: <strong>metrics</strong> (numbers over
          time — CPU, request count, 5xx rate, free disk), <strong>logs</strong> (text lines your
          app and Nginx write), and <strong>alarms</strong> (&ldquo;if this metric crosses that
          line for N minutes, tell someone&rdquo;). Every AWS service publishes metrics into it
          automatically; your own logs need one agent.
        </p>
        <h3>The problem it solves</h3>
        <p>
          On Vercel, the dashboard was free and already there. On EC2, if the disk fills up at 3am
          the only signal is a customer email at 9am — unless something was watching. Lesson
          1&apos;s <code>tail -f</code> and <code>df -h</code> are how you look; CloudWatch is how
          the system looks for you, all the time, on every server at once.
        </p>
        <h3>The minimal how</h3>
        <CommandList
          title="Logs and one alarm"
          commands={[
            { cmd: "sudo apt install amazon-cloudwatch-agent -y", note: "The agent ships /var/log/nginx/*.log and PM2 logs to CloudWatch Logs" },
            { cmd: "aws logs tail /myapp/app --follow", note: <>The cloud version of <code>tail -f</code> — across every server, from your laptop</> },
            { cmd: "aws logs filter-log-events --log-group-name /myapp/app --filter-pattern 'ERROR'", note: "grep, across all servers, for the last 24 h" },
            { cmd: "aws cloudwatch put-metric-alarm --alarm-name myapp-5xx --metric-name HTTPCode_Target_5XX_Count --namespace AWS/ApplicationELB --statistic Sum --period 60 --evaluation-periods 5 --threshold 10 --comparison-operator GreaterThanThreshold --alarm-actions arn:aws:sns:ap-south-1:123456789012:oncall", note: "If the ALB sees more than 10 errors a minute for 5 minutes, message the on-call SNS topic (email / Slack / phone)" },
          ]}
        />
        <Callout kind="ok" label="The four alarms every small production setup needs">
          <p className="mb-0">
            ALB 5xx rate · healthy host count below minimum · RDS free storage below 10% · EC2
            status check failed. With those four, almost every outage in this course&apos;s
            architecture pages you before a customer notices. Lesson 17 sets them up in fifteen
            minutes.
          </p>
        </Callout>

        {/* ───────────────────────── Pipeline ───────────────────────── */}
        <h2 id="pipeline">How it all fits: from git push to a user&apos;s screen</h2>
        <p>
          The map at the top followed a <em>request</em>. This one follows a <em>change</em> —
          from your keyboard to production. Every box here is a piece from above, doing its job in
          sequence.
        </p>
        <DeployPipeline />
        <p>Put the two flows together and the whole course is visible in one sentence:</p>
        <Callout kind="note" label="The whole course in one line">
          <p className="mb-0">
            Code goes laptop → GitHub → Actions → Docker image → EC2 (Terraform-built, in a VPC),
            where Nginx fronts a PM2/containerised Node app that talks to RDS, Redis and S3; users
            arrive via Route 53 → CloudFront → ALB → that Nginx; and CloudWatch watches all of it.
          </p>
        </Callout>

        {/* ───────────────────────── Who does what ───────────────────────── */}
        <h2 id="who-when">Who does what, and which lesson builds it</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Piece</th>
                <th>Role</th>
                <th>In one line</th>
                <th>Lesson</th>
              </tr>
            </thead>
            <tbody>
              {pieces.map(([name, role, line, n]) => {
                const l = getLesson(`lesson-${n}`)!;
                return (
                  <tr key={name}>
                    <td className="whitespace-nowrap"><strong>{name}</strong></td>
                    <td className="whitespace-nowrap text-ink-dim">{role}</td>
                    <td>{line}</td>
                    <td className="whitespace-nowrap">
                      {l.published ? (
                        <Link href={lessonHref(l)}>Lesson {n} →</Link>
                      ) : (
                        <span className="text-ink-dim">Lesson {n}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p>
          None of these is hard on its own. What makes AWS feel hard is meeting all thirteen at
          once with no map. You now have the map. When a lesson introduces one of them properly,
          you will be filling in detail on a shape you already recognise — and when you forget,
          the glossary tooltip on any of these names brings you straight back here.
        </p>

        <hr />
        <p className="text-ink-dim">
          Background reading for the AWS DevOps course. Best read after{" "}
          <Link href={lessonHref(getLesson("lesson-4")!)}>Lesson 4</Link> and before{" "}
          Lesson 5.
        </p>
      </div>

      <nav className="mt-14 grid grid-cols-1 gap-4 border-t border-line pt-8 sm:grid-cols-2" aria-label="Navigation">
        <Link
          href={`/${SERIES.slug}`}
          className="block rounded-xl border border-line px-5 py-4 text-ink hover:border-sky hover:bg-sky-soft hover:no-underline"
        >
          <div className="font-mono text-[0.75rem] uppercase tracking-[0.1em] text-sky">← Series index</div>
          <div className="font-semibold">{SERIES.title}</div>
        </Link>
        <Link
          href={lessonHref(getLesson("lesson-4")!)}
          className="block rounded-xl border border-line px-5 py-4 text-ink hover:border-sky hover:bg-sky-soft hover:no-underline sm:text-right"
        >
          <div className="font-mono text-[0.75rem] uppercase tracking-[0.1em] text-sky">Back to →</div>
          <div className="font-semibold">Lesson 4: {getLesson("lesson-4")!.title}</div>
        </Link>
      </nav>
    </article>
  );
}
