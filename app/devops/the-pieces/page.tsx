import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
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
            <strong>the minimal how</strong> — in plain words, with the lesson that does it for
            real. You do not need to run anything today. Come back to any section the moment a
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
          One <code>server</code> block per site: listen on 443 with the certificate, and send every
          request on to <code>http://127.0.0.1:3000</code> with <code>proxy_pass</code>, adding
          headers that say who the real visitor was. A second tiny block on port 80 redirects to
          HTTPS. About twenty lines in all — Lesson 10 builds it line by line.
        </p>
        <p>
          Day to day there are only four moves: install it, <strong>test the config</strong>{" "}
          (<code>nginx -t</code>), <strong>reload</strong> without dropping connections, and read
          its access and error logs.
        </p>
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
        <p>
          Start the app under PM2 with a name, tell PM2 to start itself on boot, save the process
          list — then it restarts the app on every crash and every reboot. Lesson 7 does it in
          three commands.
        </p>
        <p>
          For a real app you keep the settings (name, start command, how many copies) in a small
          file, <code>ecosystem.config.js</code>, instead of remembering flags.
        </p>
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
          server&apos;s Security Group. From the app it looks like any Postgres.
        </p>
        <p>
          The app connects with one line in <code>.env</code>:{" "}
          <code>DATABASE_URL=postgresql://user:password@host:5432/myapp</code>.
        </p>
        <h3>The minimal how</h3>
        <p>
          Create the smallest Postgres instance, <strong>not publicly accessible</strong>, in the
          private subnets, with the database security group. Copy its endpoint into{" "}
          <code>DATABASE_URL</code> and test the connection from the app server — not from your
          laptop, because it is private. Lesson 8 walks through every field.
        </p>
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
        <p>
          Create a bucket with public access blocked, then copy files in, list them, sync a folder,
          and hand out <strong>pre-signed links</strong> that work for a few minutes. Lesson 11
          puts CloudFront in front.
        </p>
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
        <p>
          You can open a shell to Redis and set, read, count and expire keys by hand — useful for
          seeing what the app stored. Lesson 16 does it locally first, then on ElastiCache.
        </p>

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
        <p>
          A <strong>Dockerfile</strong> is a recipe: start from a Node image, install
          dependencies, build, then copy only the built output into a small final image that runs{" "}
          <code>node server.js</code>. Lesson 9 explains every line.
        </p>
        <p>
          The loop is: <strong>build</strong> an image with a version tag,{" "}
          <strong>run</strong> it locally, <strong>push</strong> it to a registry (ECR), and on the
          server <strong>pull</strong> and run that exact tag.
        </p>
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
        <p>A deploy workflow is a list of steps that run on every push to <code>main</code>:</p>
        <ol>
          <li>check out the code, install, lint and test — stop if anything fails;</li>
          <li>log in to AWS (with OIDC, no stored keys);</li>
          <li>build the Docker image and push it to ECR;</li>
          <li>tell the servers to switch to the new image, one at a time.</li>
        </ol>
        <p>
          That is exactly Lesson 7&apos;s manual sequence, written down.
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
        <p>
          Each piece of infrastructure becomes a block of code. A security group, for example,
          is a <code>resource &quot;aws_security_group&quot;</code> block listing its inbound
          rules; a server is a <code>resource &quot;aws_instance&quot;</code> block that refers to
          that group by name.
        </p>
        <p>
          The loop is <code>init</code> (once), <code>plan</code> (show what would change),{" "}
          <code>apply</code> (make it so), and — for a practice account —{" "}
          <code>destroy</code>. Read every plan before you apply it.
        </p>
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
        <p>
          Ship every server&apos;s logs to CloudWatch Logs, so you can read and search all of them
          from one place, and create one alarm to start: if the load balancer sees more than ten
          errors a minute for five minutes, notify the on-call channel.
        </p>
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
