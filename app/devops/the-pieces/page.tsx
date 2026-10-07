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
  { id: "cicd", label: "CI/CD — automated testing and deployment" },
  { id: "terraform", label: "Terraform — the cloud written down" },
  { id: "cloudwatch", label: "CloudWatch — knowing before users tell you" },
  { id: "pipeline", label: "How it all fits: from git push to a user's screen" },
  { id: "who-when", label: "Who does what, and which lesson builds it" },
];

/** Each piece in one line, with the lesson that builds it. */
const pieces: [string, string, string, number][] = [
  ["Nginx", "receptionist", "The public door on ports 80 and 443. Ends TLS, sends requests to the app on port 3000, serves static files", 10],
  ["PM2", "caretaker", "Keeps the Node process running. Restarts it after a crash or a reboot. Can reload with no downtime", 7],
  ["VPC", "the building", "Your private network in AWS. A public subnet faces the internet. A private subnet never does", 6],
  ["RDS", "record room", "PostgreSQL run by AWS. AWS does the backups, updates and failover. Lives in the private subnet only", 8],
  ["S3", "warehouse", "Storage for files such as uploads, images, backups and built assets", 11],
  ["CloudFront", "local depots", "A CDN. It keeps copies of S3 and app responses at hundreds of locations near users", 11],
  ["ALB", "traffic officer", "One public address. Spreads requests over the servers that are healthy", 12],
  ["Auto Scaling", "hiring manager", "Adds servers when it is busy and removes them when it is quiet", 12],
  ["Redis", "sticky notes", "A store that keeps data in memory. Used for sessions, caches and rate limits", 16],
  ["Docker", "shipping container", "Packs the app, its runtime and its libraries into one image that runs the same everywhere", 9],
  ["GitHub Actions", "the automation", "Runs tests, builds and deploys on every push", 14],
  ["Terraform", "the blueprint", "Describes all the pieces above in files. One command builds them", 15],
  ["CloudWatch", "the dashboard", "Numbers, logs and alarms for every piece", 17],
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
          Lessons 0 to 4 mention Nginx, PM2, load balancers, RDS, CDN and VPC before their own
          lessons arrive. This is the missing chapter. For each piece you will see what it{" "}
          <em>is</em>, which problem it solves, where it sits in the flow, and a little of the
          &ldquo;how&rdquo;. That makes every later lesson easier to follow.
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
            Each section has the same four parts. <strong>What it is</strong> uses one everyday
            comparison. <strong>The problem</strong> says why the piece exists.{" "}
            <strong>Where it sits</strong> shows a small flow. <strong>The minimal how</strong>{" "}
            explains the basic steps in plain words and names the lesson that does it for real.
            You do not need to run anything today. When a lesson mentions a piece and you have
            forgotten it, come back to that section.
          </p>
        </Callout>

        <h2 id="map">The map — one request through everything</h2>
        <p>
          Lesson 0 showed the target architecture as five boxes. Lessons 2, 3 and 4 explained the
          arrows at the top. They showed how a name becomes an IP address, how a port is reached
          and how the connection is encrypted. Here is the same picture with every box filled in.
          The boxes are in the order that one request meets them.
        </p>
        <FullStackMap />
        <p>
          Notice two things before we go piece by piece. First, the request crosses a border at the
          ALB (Application Load Balancer). Everything above it is public. Everything below it is
          inside your VPC (Virtual Private Cloud, your private network in AWS). Second, the app
          itself is only two boxes: Nginx and the Node process. Everything else exists to make
          those two boxes faster, safer, or more numerous.
        </p>

        {/* ───────────────────────── Nginx ───────────────────────── */}
        <h2 id="nginx">Nginx — the receptionist</h2>
        <h3>What it is</h3>
        <p>
          Nginx (say &ldquo;engine-x&rdquo;) is a web server. It is very good at one job: it
          accepts a huge number of connections cheaply and decides what to do with each one. In
          Lesson 2&apos;s office building it is the receptionist, the only person visitors talk to.
          In our setup it works as a <strong>reverse proxy</strong>. A reverse proxy is a server
          that stands in front of your app. It takes each public request on port 443 and passes
          it to your Next.js app on a private port. The visitor never talks to the app directly.
        </p>
        <h3>The problem it solves</h3>
        <p>
          Node.js is a program that runs JavaScript on a server, and a port is a numbered door on a
          server that a program listens on. Your Node app <em>can</em> listen on port 443 directly. But then it must also handle TLS
          certificates (TLS is the encryption that makes HTTPS safe). It must serve images and CSS,
          compress responses, block abusive clients and add security headers. It must also survive
          10,000 people opening a connection at once. Node is a good place to run your application
          code, but a weak front door. Nginx is an excellent front door, but it knows nothing about
          what your application does. So we split the jobs, and each tool does what it is best at.
        </p>
        <h3>Where it sits</h3>
        <NginxFlow />
        <h3>The minimal how</h3>
        <p>
          Write one <code>server</code> block for each site. It listens on port 443 with the
          certificate. It sends every request to <code>http://127.0.0.1:3000</code> with the{" "}
          <code>proxy_pass</code> setting. It also adds headers that say who the real visitor was.
          (The address 127.0.0.1 means &ldquo;this same computer&rdquo;.) A second small block on
          port 80 redirects visitors to HTTPS. That is about twenty lines in all. Lesson 10 builds
          it line by line.
        </p>
        <p>
          Day to day you only need four moves. Install it. <strong>Test the config</strong> with{" "}
          <code>nginx -t</code>. <strong>Reload</strong> it, which applies new settings without
          dropping connections. Read its access log and error log.
        </p>
        <Callout kind="note" label="Why the X-Forwarded-* headers matter">
          <p className="mb-0">
            Your app only ever sees a connection from 127.0.0.1, which is Nginx. Without those
            headers, the app would think every user is on the same computer and uses plain HTTP.{" "}
            <code>X-Forwarded-For</code> carries the real client IP address. The app needs it for
            rate limits and logs. <code>X-Forwarded-Proto</code> tells the app that the original
            request used HTTPS. Secure cookies and redirects need that. A missing header is also
            the cause of the <code>ERR_TOO_MANY_REDIRECTS</code> loop from Lesson 4.
          </p>
        </Callout>

        {/* ───────────────────────── PM2 ───────────────────────── */}
        <h2 id="pm2">PM2 — keeping the app alive</h2>
        <h3>What it is</h3>
        <p>
          PM2 is a <strong>process manager</strong> for Node. A process manager is a program that
          starts other programs, watches them and restarts them when they stop. PM2 runs your app
          in the background as a <strong>daemon</strong> (a program that runs without a terminal).
          It brings the app back after a crash, after a reboot, or after you close your terminal.
          Think of a caretaker whose only job is to keep the lights on.
        </p>
        <h3>The problem it solves</h3>
        <p>
          Lesson 1 ended with a classic trap. You run <code>npm start</code> in an SSH session (SSH is a secure way to log in to a server and type commands),
          close your laptop, and the site goes down. A process (a running program) started from a
          shell is tied to that shell. When the SSH session closes, the shell sends its programs a
          hang-up signal, and they stop. Even if the app survived, one unhandled error would end it
          and nothing would restart it. A live site needs something that outlives your session and
          reacts to failure on its own.
        </p>
        <Pm2Loop />
        <h3>The minimal how</h3>
        <p>
          Start the app under PM2 and give it a name. Tell PM2 to start itself when the server
          boots. Save the process list. After that, PM2 restarts the app after every crash and
          every reboot. Lesson 7 does it in three commands.
        </p>
        <p>
          For a real app, keep the settings in a small file called <code>ecosystem.config.js</code>.
          The settings are the name, the start command and how many copies to run. This way you do
          not have to remember command flags.
        </p>
        <Callout kind="note" label="PM2 vs Docker vs systemd">
          <p className="mb-0">
            All three can keep a process alive. systemd is the service manager built into Linux. PM2
            is the easiest choice for one Node app on one server, so Lesson 7 uses it. Once the app
            runs in a Docker container (Lesson 9), Docker does the restarting and you usually drop
            PM2. The idea is the same in every case:{" "}
            <em>something other than your shell owns the process</em>.
          </p>
        </Callout>

        {/* ───────────────────────── VPC ───────────────────────── */}
        <h2 id="vpc">VPC — public and private rooms</h2>
        <h3>What it is</h3>
        <p>
          A VPC (Virtual Private Cloud) is your own private network inside AWS. It is the building
          from Lesson 2, now with floors. Inside it you create <strong>subnets</strong>. A subnet
          is a smaller range of IP addresses inside the VPC. A subnet is either <em>public</em>{" "}
          (it has a route to the internet) or <em>private</em> (it does not). A server&apos;s subnet
          decides whether the internet can reach it at all. This happens before Security Groups
          (AWS firewall rules for each server) get a say.
        </p>
        <h3>The problem it solves</h3>
        <p>
          Lesson 2 protected the database with a Security Group rule (&ldquo;only from the
          app&apos;s SG&rdquo;). That is good, but someone can change a rule by mistake. A database
          in a private subnet has <em>no path</em> from the internet. There is no route, so no rule
          can open it by accident. This is called defence in depth: the network layout and the
          firewall both say no.
        </p>
        <h3>Where it sits</h3>
        <VpcLayout />
        <h3>The minimal how</h3>
        <p>
          Five objects make a VPC useful. Lesson 6 creates each one in the console. Lesson 15
          writes them as Terraform. Learn the names now:
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
                <td>The whole range of private IP addresses</td>
                <td><code>10.0.0.0/16</code> (65,536 addresses)</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap"><strong>Subnet</strong></td>
                <td>A slice of it, inside one availability zone (one separate data centre area in a region)</td>
                <td>public <code>10.0.1.0/24</code>, private <code>10.0.2.0/24</code></td>
              </tr>
              <tr>
                <td className="whitespace-nowrap"><strong>Internet Gateway</strong></td>
                <td>The VPC&apos;s door to the internet. It is a gateway you attach to the VPC</td>
                <td>one per VPC</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap"><strong>Route table</strong></td>
                <td>A list of rules that say where traffic for each destination goes</td>
                <td>public: <code>0.0.0.0/0 → igw</code> · private: no such row</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap"><strong>NAT Gateway</strong></td>
                <td>Lets private servers call <em>out</em> (for updates and APIs) without being reachable from the outside <em>in</em></td>
                <td>optional. It costs about $35 a month (more in some regions, plus data fees), so Lesson 6 explains when to skip it</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="The rule that makes a subnet “public”">
          <p className="mb-0">
            Only one thing. A subnet is public because its route table has a{" "}
            <code>0.0.0.0/0</code> row that points at the Internet Gateway. (<code>0.0.0.0/0</code>{" "}
            means &ldquo;every address on the internet&rdquo;.) Delete that row and every server in
            the subnet silently becomes private. In Lesson 6 you may ask &ldquo;why can&apos;t I SSH
            to my instance?&rdquo; Check the Security Group first, then check the route table.
          </p>
        </Callout>

        {/* ───────────────────────── RDS ───────────────────────── */}
        <h2 id="rds">RDS — the managed database</h2>
        <h3>What it is</h3>
        <p>
          RDS (Relational Database Service) is a database such as PostgreSQL or MySQL that AWS runs
          for you. You get a hostname, a port and a password. You never SSH into the machine,
          because you have no access to it. AWS looks after the operating system, the disk, the
          updates (patches), the backups and the failover. Failover means switching to a spare copy
          when the main one fails.
        </p>
        <h3>The problem it solves</h3>
        <p>
          You <em>could</em> install PostgreSQL on your EC2 server tonight. Then all of this is your
          job. You must make nightly backups and test that they restore. You must apply security
          patches. You must watch the disk so it does not fill up. The database and your app would
          compete for CPU and memory. And if that one server dies, all your customers&apos; data
          dies with it. RDS turns that list into a monthly bill. The smallest instance costs
          roughly $15 a month. RDS also makes the app servers <strong>stateless</strong>. Stateless
          means a server keeps no important data of its own, so it can be thrown away and replaced.
          That is what lets Auto Scaling delete servers and create new ones safely.
        </p>
        <h3>Where it sits</h3>
        <p>
          It sits in the private subnet. Its Security Group accepts port 5432 (the PostgreSQL port)
          only from the app server&apos;s Security Group. From the app it looks like any other
          Postgres database.
        </p>
        <p>
          The app connects with one line in <code>.env</code>:{" "}
          <code>DATABASE_URL=postgresql://user:password@host:5432/myapp</code>.
        </p>
        <h3>The minimal how</h3>
        <p>
          Create the smallest Postgres instance. Make it <strong>not publicly accessible</strong>,
          put it in the private subnets, and give it the database security group. Copy its endpoint
          (its hostname) into <code>DATABASE_URL</code>. Test the connection from the app server,
          not from your laptop, because the database is private. Lesson 8 explains every field.
        </p>
        <Callout kind="note" label="Three RDS words you will meet">
          <p className="mb-0">
            <strong>Multi-AZ</strong> means a standby copy of the database in a second Availability
            Zone, with automatic failover. It costs about double, and it is worth it for real
            production. <strong>Snapshot</strong> means a full backup. You can restore it into a new
            instance. <strong>Parameter group</strong> means the settings of the database. It
            replaces the <code>postgresql.conf</code> file that you would edit by hand.
          </p>
        </Callout>

        {/* ───────────────────────── S3 + CDN ───────────────────────── */}
        <h2 id="s3-cdn">S3 + CloudFront — files, and files near the user</h2>
        <h3>What they are</h3>
        <p>
          <strong>S3</strong> (Simple Storage Service) is a warehouse for files, which S3 calls
          &ldquo;objects&rdquo;. You can store any number of files in it (one file can be up to 5 TB), it is cheap (about $0.023 per GB per month
          in the main US region; other regions differ), and each file has its own HTTPS URL. It is
          very durable: &ldquo;eleven nines&rdquo; means 99.999999999%, so you almost never lose a
          file. A <strong>bucket</strong> is a top-level folder with a name that is unique across
          all of AWS. <strong>CloudFront</strong> is a <strong>CDN</strong> (Content Delivery
          Network): a network of servers around the world that keep copies of your files. AWS has
          hundreds of these locations, called edge locations or points of presence. CloudFront
          serves each user from a location near them.
        </p>
        <h3>The problem they solve</h3>
        <p>
          There are two problems. First, files on an EC2 disk vanish when Auto Scaling replaces the
          server. Two servers also cannot share one disk. So user uploads must live somewhere that
          all servers can reach. That place is S3. Second, distance makes things slow. A user in
          London who fetches a 2 MB image from a server in Mumbai waits more than 100 ms for every
          round trip. From a London edge location the wait is only a few milliseconds. That is what
          CloudFront fixes. It also handles traffic spikes: a million requests for a cached file
          never reach your server.
        </p>
        <h3>Where they sit</h3>
        <CdnFlow />
        <h3>The minimal how</h3>
        <p>
          Create a bucket with public access blocked. Then copy files in, list them and sync a
          folder. You can also give out <strong>pre-signed links</strong>. A pre-signed link is a
          URL with a built-in signature that lets someone use one private file for a short time,
          for example a few minutes. Lesson 11 puts CloudFront in front.
        </p>
        <p>
          From code you use the SDK (Software Development Kit, a library of ready-made functions).
          For S3 it is <code>@aws-sdk/client-s3</code>. It has the same actions:{" "}
          <code>PutObject</code> and <code>GetObject</code>. With pre-signed URLs, the browser can
          upload a file straight to S3, and the file never passes through your server. CloudFront
          sits in front with a &ldquo;distribution&rdquo;. A distribution is one CloudFront setup.
          Its <em>origin</em> (the place CloudFront fetches files from) is the bucket for assets,
          or your ALB for pages. An ACM certificate (Lesson 4) gives it HTTPS.
        </p>
        <Callout kind="warn" label="The one S3 rule">
          <p className="mb-0">
            Buckets are private by default. Keep them that way. Serve public assets through
            CloudFront with an <em>origin access control</em>. This is a setting that lets only
            CloudFront read the bucket. Serve private files through pre-signed URLs. Public buckets
            have caused many data leaks that made the news.
          </p>
        </Callout>

        {/* ───────────────────────── ALB + ASG ───────────────────────── */}
        <h2 id="alb">ALB + Auto Scaling — one server becomes many</h2>
        <h3>What they are</h3>
        <p>
          An <strong>Application Load Balancer</strong> (ALB) is one public address that spreads
          incoming requests across a group of servers. It checks each server with a{" "}
          <strong>health check</strong>, a small test request sent again and again. It stops
          sending traffic to any server that fails. An <strong>Auto Scaling group</strong> decides
          how many servers you should have right now. When load rises, it starts identical copies
          from a template. When load falls, it shuts some down.
        </p>
        <h3>The problem they solve</h3>
        <p>
          One EC2 server can fail in three ways. It can get too busy. It can die. It can need to go
          down for an update. One move fixes all three: run more than one server, and put something
          in front that knows which servers are healthy. That &ldquo;something&rdquo; is the ALB.
          Then comes the next question: how many servers? Auto Scaling answers it. You might run two
          at night and six at month-end, when every tenant logs in. (A tenant is one customer company that uses your SaaS app.) You pay only for the hours each
          server runs.
        </p>
        <h3>Where they sit</h3>
        <ScalingFlow />
        <h3>The minimal how</h3>
        <p>Three objects, always in this order:</p>
        <ol>
          <li>
            <strong>Target group</strong>: a list of servers that can receive traffic, with rules
            for them. For example: &ldquo;port 3000 on these instances. Run the health check{" "}
            <code>GET /api/health</code> every 30 seconds. Two failures in a row means
            unhealthy.&rdquo;
          </li>
          <li>
            <strong>Load balancer and listener</strong>: the load balancer is public and sits in the
            public subnets. A listener is a rule that waits for traffic on one port. One listener on
            port 443 has an ACM certificate and forwards to the target group. Another listener on
            port 80 redirects to 443.
          </li>
          <li>
            <strong>Launch template and Auto Scaling group</strong>: the launch template is the
            recipe for a new server. It names the AMI (Amazon Machine Image, a saved copy of a
            configured server disk), the instance size, the app&apos;s Security Group and a script
            that starts the app on boot. The Auto Scaling group then sets a minimum, a desired and a
            maximum number of servers. It also has a scaling rule such as &ldquo;keep average CPU
            at 60%&rdquo;.
          </li>
        </ol>
        <Script
          title="app/api/health/route.ts  — the endpoint the ALB will call"
          code={`export async function GET() {
  // keep it cheap: no database call, no login check. It only answers "is the app up?"
  return Response.json({ ok: true, ts: Date.now() });
}`}
        />
        <Callout kind="note" label="What this demands of your app">
          <p className="mb-0">
            Any request can land on any server. So the app must not keep anything on its own disk or
            in its own memory that a later request will need. Sessions go to Redis. Uploads go to
            S3. Other data goes to RDS. This is the &ldquo;stateless&rdquo; rule from the
            hosting-platforms reading. It is also why RDS, S3 and Redis come <em>before</em> Lesson
            12.
          </p>
        </Callout>

        {/* ───────────────────────── Redis ───────────────────────── */}
        <h2 id="redis">Redis — the fast memory beside the database</h2>
        <h3>What it is</h3>
        <p>
          Redis is a key-value store that keeps its data in RAM (the computer&apos;s fast working
          memory). A key-value store is like a big dictionary: you save a value under a name (the
          key) and read it back by that name. Reads and writes usually take well under a
          millisecond, which is much faster than a typical database query. The price is that Redis
          can only hold what fits in memory. It is also a poor choice for data with many linked
          tables. On AWS, a managed version is called ElastiCache.
        </p>
        <h3>The problem it solves</h3>
        <p>
          It solves three common problems. <strong>Sessions</strong>: a session is the record that
          says a user is logged in. With several app servers, a login on server 1 must be visible
          to server 2. Asking Postgres &ldquo;who is this?&rdquo; on every request is wasteful.{" "}
          <strong>Caching</strong>: a cache is a copy of an answer that is slow to compute. Examples
          are a tenant&apos;s settings, the dashboard totals or the product list. You compute them
          once and serve them from Redis for the next 60 seconds. <strong>Rate limiting and
          queues</strong>: rate limiting means capping how many requests one user can make. Redis
          counters can be safely increased by many servers at once. A queue is a list of jobs that a
          background worker takes one by one, such as the PDF generation from Lesson 0.
        </p>
        <h3>The minimal how</h3>
        <Script
          title="cache-aside, the pattern you will write ten times"
          code={`import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL);   // for example redis://myapp-cache.abc.ap-south-1.cache.amazonaws.com:6379

export async function getTenantSettings(tenantId: string) {
  const key = \`tenant:\${tenantId}:settings\`;

  const cached = await redis.get(key);                 // 1. try the fast path (the cache)
  if (cached) return JSON.parse(cached);

  const fresh = await db.tenantSettings.findUnique({ where: { tenantId } });  // 2. not found → ask the database
  await redis.set(key, JSON.stringify(fresh), "EX", 60);                      // 3. keep it for 60 seconds
  return fresh;
}`}
        />
        <p>
          You can open a command-line shell to Redis. There you can set, read, count and expire keys
          by hand. This helps you see what the app stored. Lesson 16 does it on your own computer
          first, then on ElastiCache.
        </p>

        {/* ───────────────────────── Docker ───────────────────────── */}
        <h2 id="docker">Docker — the same box everywhere</h2>
        <h3>What it is</h3>
        <p>
          Docker is a tool that packs your app <em>and</em> everything it needs into one{" "}
          <strong>image</strong>. That includes Node itself, system libraries, your{" "}
          <code>node_modules</code> and the built output. An image is a read-only package. A
          running copy of an image is a <strong>container</strong>. The image you build on your
          laptop is exactly what runs on EC2. So &ldquo;it works on my machine&rdquo; becomes
          &ldquo;it works everywhere, or it fails everywhere&rdquo;.
        </p>
        <h3>The problem it solves</h3>
        <p>
          Lesson 7&apos;s manual deploy installs Node on the server by hand. It clones the code, runs{" "}
          <code>npm install</code> on the server and builds on the server. This works once. A second
          server must be set up in exactly the same way. A Node upgrade must be repeated on every
          server. A library that behaves differently on Ubuntu than on macOS shows its problem only
          in production. Docker puts all of that into one image that you build once and ship as one
          unit.
        </p>
        <h3>The minimal how</h3>
        <p>
          A <strong>Dockerfile</strong> is a text file with the steps to build an image. Start from
          a Node image. Install the dependencies. Build the app. Then copy only the built output
          into a small final image that runs <code>node server.js</code>. Lesson 9 explains every
          line.
        </p>
        <p>
          The loop has four steps. <strong>Build</strong> an image and give it a version tag.{" "}
          <strong>Run</strong> it on your computer to test it. <strong>Push</strong> it to a
          registry, which is a store for images (on AWS it is ECR, Elastic Container Registry). On
          the server, <strong>pull</strong> that exact tag and run it.
        </p>
        <Callout kind="note" label="Image vs container, once and for all">
          <p className="mb-0">
            An image is the recipe with all the ingredients, frozen. It is a file. A container is one
            dish cooked from it. It is a running process. You build an image once and run as many
            containers from it as you like. On a 4-core server you might run one container with PM2
            inside, or four containers with no PM2.
          </p>
        </Callout>

        {/* ───────────────────────── CI/CD ───────────────────────── */}
        <h2 id="cicd">CI/CD — automated testing and deployment</h2>
        <h3>What it is</h3>
        <p>
          <strong>Continuous Integration</strong> (CI) means every push automatically runs the tests
          and the build on a clean machine. Broken code is caught before anyone merges it.{" "}
          <strong>Continuous Deployment</strong> (CD) means that when the main branch passes
          everything, the same automation sends the code to production. GitHub Actions provides this
          automation. A YAML file in your repo lists the steps (YAML is a simple text format for
          settings). GitHub supplies the machines that run them.
        </p>
        <h3>The problem it solves</h3>
        <p>
          Manual deploys are slow, risky and uneven. Someone connects by SSH at 6pm, forgets one
          step, and the fix takes an hour. A pipeline (an automatic series of steps) does the same
          steps every time, in minutes, and keeps a log. It also refuses to deploy anything that
          failed a test. So &ldquo;deploy&rdquo; stops being one person&apos;s job and becomes a
          merge button.
        </p>
        <h3>The minimal how</h3>
        <p>A deploy workflow is a list of steps that run on every push to <code>main</code>:</p>
        <ol>
          <li>check out the code, install, lint and test — stop if anything fails;</li>
          <li>log in to AWS (with OIDC, a way to get short-lived access without stored passwords or keys);</li>
          <li>build the Docker image and push it to ECR;</li>
          <li>tell the servers to switch to the new image, one at a time.</li>
        </ol>
        <p>
          That is exactly Lesson 7&apos;s manual sequence, written down. That is the whole trick.
          You cannot automate a deploy you have never done by hand. This is why Lesson 7 comes
          before Lesson 14.
        </p>

        {/* ───────────────────────── Terraform ───────────────────────── */}
        <h2 id="terraform">Terraform — the cloud written down</h2>
        <h3>What it is</h3>
        <p>
          Terraform is a tool that lets you describe every AWS object in text files. This includes
          the VPC, subnets, Security Groups, EC2, RDS, ALB and buckets. Then one command makes the
          real setup match the files. This idea is called Infrastructure as Code. If you change a
          file and run the command again, Terraform applies only the difference. The files live in
          git, so your infrastructure gets pull requests, reviews and history, just like code.
        </p>
        <h3>The problem it solves</h3>
        <p>
          After Lessons 6 to 13 you will have clicked through perhaps forty console screens. Nobody
          remembers forty screens. To rebuild the setup in a second region, for a staging copy
          (a practice copy of production), or after an accident, you would repeat all of them from
          memory. Terraform makes the setup <em>reproducible</em>, which means you can build it
          again exactly. It also lets you answer &ldquo;what exactly is running in production?&rdquo;
          by reading a folder.
        </p>
        <h3>The minimal how</h3>
        <p>
          Each piece of infrastructure becomes a block of code. For example, a security group is a{" "}
          <code>resource &quot;aws_security_group&quot;</code> block that lists its inbound rules. A
          server is a <code>resource &quot;aws_instance&quot;</code> block that refers to that group
          by name.
        </p>
        <p>
          The loop has these commands. <code>init</code> sets up the project (run it once).{" "}
          <code>plan</code> shows what would change. <code>apply</code> makes the changes. In a
          practice account you can also use <code>destroy</code> to delete everything. Read every
          plan before you apply it.
        </p>
        <Callout kind="warn" label="State">
          <p className="mb-0">
            Terraform keeps a <code>terraform.tfstate</code> file. It records what Terraform created
            and the real IDs. If you lose it, Terraform forgets that it owns anything. Lesson 15
            stores it in S3 with locking (locking stops two runs from changing it at the same
            time). Every team does this first. Many solo developers forget it.
          </p>
        </Callout>

        {/* ───────────────────────── CloudWatch ───────────────────────── */}
        <h2 id="cloudwatch">CloudWatch — knowing before users tell you</h2>
        <h3>What it is</h3>
        <p>
          CloudWatch is the AWS service that collects three things. <strong>Metrics</strong> are
          numbers over time, such as CPU use, request count, the rate of 5xx errors (server
          errors) and free disk space. <strong>Logs</strong> are lines of text that your app and
          Nginx write. <strong>Alarms</strong> are rules such as &ldquo;if this metric crosses this
          line for N minutes, tell someone&rdquo;. Most AWS services send metrics to CloudWatch
          automatically. For your own logs you install one small program, called an agent.
        </p>
        <h3>The problem it solves</h3>
        <p>
          On Vercel, the dashboard was free and already there. On EC2, if the disk fills up at 3am,
          the first sign may be a customer email at 9am. That happens unless something is watching.
          In Lesson 1, <code>tail -f</code> and <code>df -h</code> were how you looked yourself.
          CloudWatch looks for you, all the time, on every server at once.
        </p>
        <h3>The minimal how</h3>
        <p>
          Send every server&apos;s logs to CloudWatch Logs. Then you can read and search all of them
          in one place. Start with one alarm. For example: if the load balancer sees more than ten
          errors a minute for five minutes, send a message to the on-call channel (the chat channel
          of the person who is responsible right now).
        </p>
        <Callout kind="ok" label="The four alarms every small production setup needs">
          <p className="mb-0">
            ALB 5xx rate (the load balancer returns many server errors) · healthy host count below
            the minimum · RDS free storage below 10% · EC2 status check failed. With these four,
            almost every outage in this course&apos;s architecture alerts you before a customer
            notices. Lesson 17 sets them up in fifteen minutes.
          </p>
        </Callout>

        {/* ───────────────────────── Pipeline ───────────────────────── */}
        <h2 id="pipeline">How it all fits: from git push to a user&apos;s screen</h2>
        <p>
          The map at the top followed a <em>request</em>. This one follows a <em>change</em>, from
          your keyboard to production. Every box here is a piece from above, doing its job in
          order.
        </p>
        <DeployPipeline />
        <p>Put the two flows together and you can see the whole course in one sentence:</p>
        <Callout kind="note" label="The whole course in one line">
          <p className="mb-0">
            Code goes from your laptop to GitHub, to Actions, to a Docker image, to EC2. Terraform
            builds the EC2 servers inside a VPC. On each server, Nginx sits in front of a Node app
            run by PM2 or by Docker. The app talks to RDS, Redis and S3. Users arrive through Route
            53 (DNS), then CloudFront, then the ALB, then that Nginx. CloudWatch watches all of it.
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
          None of these pieces is hard on its own. AWS feels hard when you meet all thirteen at once
          with no map. Now you have the map. When a lesson explains one piece in full, you will add
          detail to a shape you already know. If you forget a piece, the glossary tooltip on its
          name brings you back here.
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
