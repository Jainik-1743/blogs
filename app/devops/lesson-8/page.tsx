import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import StatelessDiagram from "@/components/figures/StatelessDiagram";
import InterviewQA from "@/components/InterviewQA";
import LessonIntro from "@/components/LessonIntro";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson } from "@/lib/lessons";

const lesson = getLesson("lesson-8")!;

export const metadata: Metadata = {
  title: `Lesson 8 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Concept: a database somebody else looks after" },
  { id: "why-this-matters", label: "Why not just install Postgres on the server" },
  { id: "responsibility", label: "Who does what — you vs AWS" },
  { id: "options", label: "The choices you make: class, storage, Multi-AZ" },
  { id: "backups", label: "Backups, snapshots and point-in-time restore" },
  { id: "build", label: "Build it: a private database" },
  { id: "connect", label: "Connect from the app server" },
  { id: "users", label: "Do not run your app as the admin" },
  { id: "app", label: "Connect the Next.js app" },
  { id: "pooling", label: "Connection limits — the outage that surprises everyone" },
  { id: "laptop", label: "Reaching the database from your laptop, safely" },
  { id: "operations", label: "Day-two operations" },
  { id: "troubleshooting", label: "Troubleshooting table" },
  { id: "cost", label: "What this costs" },
  { id: "interview", label: "Interview corner" },
  { id: "practice", label: "Practice task before Lesson 9" },
  { id: "conclusion", label: "Conclusion" },
];

const split: [string, string, string][] = [
  ["Hardware, power, network", "AWS", "—"],
  ["Operating system and security patches", "AWS (in your maintenance window)", "Choose the window"],
  ["PostgreSQL installation and minor upgrades", "AWS", "Approve major version upgrades"],
  ["Automated backups and restore machinery", "AWS", "Set retention; test restoring"],
  ["Failover to a standby (Multi-AZ)", "AWS", "Pay for it and turn it on"],
  ["Who can reach the database (Security Group, subnet)", "—", "You"],
  ["Users, passwords, permissions inside Postgres", "—", "You"],
  ["Schema, indexes, slow queries", "—", "You"],
  ["Sizing the instance and connection limits", "—", "You"],
];

const trouble: [string, string, string][] = [
  ["psql hangs, then “connection timed out”", "Network path blocked: db-sg missing the rule from web-sg, or you are connecting from your laptop to a private database", "Check db-sg inbound 5432 from web-sg. Connect from EC2, or use the SSH tunnel"],
  ["FATAL: no pg_hba.conf entry … no encryption", "Postgres 15+ on RDS requires TLS by default", "Add sslmode=require to the connection string"],
  ["FATAL: password authentication failed", "Wrong user/password, or special characters not URL-encoded in DATABASE_URL", "Test with psql first. URL-encode @ : / # ? in the password, or generate one without them"],
  ["FATAL: remaining connection slots are reserved", "Too many open connections (see the pooling section)", "Lower the app’s pool size, add pooling, or use a bigger instance"],
  ["could not translate host name", "Typo in the endpoint, or DNS hostnames disabled in the VPC", "Copy the endpoint from describe-db-instances; enable-dns-hostnames (Lesson 6)"],
  ["Creation stuck in “creating” for 15+ minutes", "Normal for the first instance (5–15 min)", "Wait — the status turns to “Available” on its own"],
  ["Storage full, database read-only", "Free storage hit zero", "Enable storage autoscaling; alarm on FreeStorageSpace (Lesson 17)"],
];

export default function LessonEightPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>RDS</strong> (Relational Database Service) is <strong>PostgreSQL, MySQL and
          friends, run for you by AWS</strong>. You get a hostname, a port, a username and a
          password. You do not get a login to the machine underneath, because you do not need one:
          AWS operates the server, the disk, the patches, the backups and the failover.
        </p>
        <p>
          From your application&apos;s point of view it is an ordinary PostgreSQL database — the
          same SQL, the same drivers, the same ORM. The only thing that changes is that the{" "}
          <code>DATABASE_URL</code> points at an AWS hostname instead of <code>localhost</code>.
        </p>
        <Callout kind="note" label="The analogy">
          <p className="mb-0">
            Installing Postgres on your EC2 server is like owning a house: total freedom, and you
            fix the roof, the plumbing and the locks. RDS is a serviced apartment: same living, but
            the building manager handles maintenance and someone else holds the spare keys. You pay
            more per month and worry about far less at 3 a.m.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why not just install Postgres on the server</h2>
        <p>
          You <em>can</em>. Plenty of small products do, and it is fine for a hobby project. But
          here is what you then own:
        </p>
        <ul>
          <li>
            <strong>Backups.</strong> Someone must write the script, schedule it, store the files
            somewhere else, and — the part everyone skips — test restoring one. An untested backup
            is a hope, not a backup.
          </li>
          <li>
            <strong>Data lives on the app server.</strong> If that machine dies, is terminated by
            mistake, or is replaced during a deploy, your customers&apos; data goes with it.
          </li>
          <li>
            <strong>You cannot scale out.</strong> Auto Scaling (Lesson 12) creates and destroys
            app servers freely. That only works if they hold no data. A database on the same
            server chains you to exactly one machine.
          </li>
          <li>
            <strong>Resource fights.</strong> Postgres and Node share CPU and RAM. A slow query
            makes your website slow and vice versa.
          </li>
          <li>
            <strong>Patching and upgrades</strong> are yours, on your schedule, with your downtime.
          </li>
        </ul>
        <StatelessDiagram />
        <p>
          The diagram above (from Lesson 0) shows the goal: app servers that remember nothing and
          can be replaced at any moment. That is only possible when the memory — the database —
          lives somewhere else. RDS is that somewhere else.
        </p>
        <Callout kind="ok" label="Rule of thumb">
          <p className="mb-0">
            Put the database on RDS the moment it holds data you cannot afford to lose. For a real
            product that is always.
          </p>
        </Callout>

        <h2 id="responsibility">Who does what — you vs AWS</h2>
        <p>
          This split is called the <strong>shared responsibility model</strong>, and it is the most
          common conceptual interview question on managed services. RDS moves the line up; it does
          not remove your half.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Job</th>
                <th>Who</th>
                <th>Your part</th>
              </tr>
            </thead>
            <tbody>
              {split.map(([job, who, you]) => (
                <tr key={job}>
                  <td>{job}</td>
                  <td className={who.startsWith("AWS") ? "font-semibold text-emerald-300" : ""}>{who}</td>
                  <td>{you}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Notice that <strong>a slow query, a missing index and a leaked password are still
          yours</strong>. Managed does not mean magic.
        </p>

        <h2 id="options">The choices you make: class, storage, Multi-AZ</h2>
        <h3>Instance class</h3>
        <p>
          Same naming idea as EC2, with a <code>db.</code> prefix: <code>db.t4g.micro</code> is
          burstable, ARM Graviton, 2 vCPU, 1 GB RAM. For learning and a low-traffic product,{" "}
          <code>db.t4g.micro</code> or <code>db.t4g.small</code> (2 GB) is enough. Move to{" "}
          <code>db.m</code> or <code>db.r</code> (memory-optimised) when the working set no longer
          fits in memory. Postgres is fast when its indexes and hot rows sit in RAM and slow when it
          reads the disk, so <strong>RAM is the number to watch</strong>.
        </p>
        <h3>Storage</h3>
        <ul>
          <li>
            <strong>gp3</strong> (SSD) is the default choice: 3,000 IOPS included, you pay per GB.
            Start at 20 GB.
          </li>
          <li>
            Turn on <strong>storage autoscaling</strong> (<code>--max-allocated-storage</code>) so a
            growing table never fills the disk and freezes the database. You can grow storage; you
            can never shrink it.
          </li>
          <li>
            Turn on <strong>encryption at rest</strong> when you create it. It cannot be added
            later without a snapshot-copy-restore dance.
          </li>
        </ul>
        <h3>Multi-AZ — high availability, not a backup</h3>
        <p>
          With Multi-AZ, AWS keeps a second, hidden copy of the database in another Availability
          Zone and copies every write to it synchronously. If the primary fails, RDS flips the same
          hostname to the standby in about one to two minutes. No code change.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Multi-AZ standby</th>
                <th>Read replica</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Purpose</strong></td>
                <td>Survive a failure (availability)</td>
                <td>Spread out read traffic (performance)</td>
              </tr>
              <tr>
                <td><strong>Can you query it?</strong></td>
                <td>No — it sits idle</td>
                <td>Yes, read-only, its own hostname</td>
              </tr>
              <tr>
                <td><strong>Replication</strong></td>
                <td>Synchronous</td>
                <td>Asynchronous (can lag)</td>
              </tr>
              <tr>
                <td><strong>Failover</strong></td>
                <td>Automatic</td>
                <td>Manual promotion</td>
              </tr>
              <tr>
                <td><strong>Cost</strong></td>
                <td>Roughly 2× the instance</td>
                <td>1× per replica</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="Multi-AZ is not a backup">
          <p className="mb-0">
            If a developer runs <code>DROP TABLE users;</code> or a bug corrupts rows, the standby
            faithfully copies that damage within milliseconds. Multi-AZ protects against{" "}
            <em>hardware</em> failure. Only backups protect against <em>human</em> failure.
          </p>
        </Callout>
        <p>
          For this course we run a single-AZ database to keep the bill small. For a real product
          with paying customers, switch Multi-AZ on before launch — it is one flag.
        </p>

        <h2 id="backups">Backups, snapshots and point-in-time restore</h2>
        <p>RDS gives you two kinds, and they behave differently:</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Automated backups</th>
                <th>Manual snapshots</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Created</strong></td>
                <td>Daily, automatically, plus continuous transaction logs</td>
                <td>By you, any time</td>
              </tr>
              <tr>
                <td><strong>Kept</strong></td>
                <td>1–35 days (you choose), then deleted</td>
                <td>Until <em>you</em> delete them</td>
              </tr>
              <tr>
                <td><strong>Restore to</strong></td>
                <td>Any second inside the window (point-in-time restore)</td>
                <td>The moment the snapshot was taken</td>
              </tr>
              <tr>
                <td><strong>If you delete the database</strong></td>
                <td className="font-semibold text-red-300">Deleted with it (unless you keep them)</td>
                <td className="font-semibold text-emerald-300">Survive</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="A restore never overwrites — it creates a new database">
          <p className="mb-0">
            &ldquo;Restore to 14:32&rdquo; produces a <strong>brand-new instance with a new
            hostname</strong>. You then point the app at it (or copy the missing data across). Know
            this <em>before</em> the emergency. Always take a manual snapshot before a risky
            migration, and before you ever delete an instance.
          </p>
        </Callout>
        <p>
          Two words every engineer should be able to define: <strong>RPO</strong> (Recovery Point
          Objective — how much data you can afford to lose; with point-in-time restore, about five
          minutes) and <strong>RTO</strong> (Recovery Time Objective — how long you can be down; a
          restore takes tens of minutes, Multi-AZ failover about two). Lesson 18 practises a real
          restore.
        </p>

        <h2 id="build">Build it: a private database</h2>
        <ol className="steps">
          <li>
            <h3>Create a subnet group — the list of subnets RDS may use</h3>
            <p>
              RDS → Subnet groups → Create: name it <code>myapp-private</code>, pick the{" "}
              <code>myapp</code> VPC and select <strong>only the two private subnets</strong> (RDS
              insists on two AZs even for one database). This is the sentence that keeps the
              database off the internet: RDS can only place it in subnets with no route to the
              Internet Gateway.
            </p>
          </li>
          <li>
            <h3>Create the instance</h3>
            <p>RDS → Create database → <strong>Standard create</strong>, PostgreSQL. The fields that matter:</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Set it to</th>
                    <th>Why</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Engine version</td><td>a current major (16+)</td><td>Supported for years; gets security patches</td></tr>
                  <tr><td>Template</td><td>Free tier / Dev-Test</td><td>Single-AZ is fine while learning</td></tr>
                  <tr><td>Master username</td><td><code>dbadmin</code></td><td>For you only — never for the app</td></tr>
                  <tr><td>Password</td><td>Auto-generate, or a long random one</td><td>Store it in your password manager straight away</td></tr>
                  <tr><td>Instance class</td><td><code>db.t4g.micro</code></td><td>Smallest; ~100 connections (see below)</td></tr>
                  <tr><td>Storage</td><td>20 GB gp3, autoscaling to 100</td><td>Grows on its own instead of filling up</td></tr>
                  <tr><td>Connectivity</td><td><code>myapp</code> VPC, subnet group <code>myapp-private</code></td><td>The private subnets from step 1</td></tr>
                  <tr><td>Public access</td><td><strong>No</strong></td><td>No public IP at all — it exists only inside the VPC</td></tr>
                  <tr><td>Security group</td><td><code>db-sg</code> (remove <code>default</code>)</td><td>Accepts 5432 only from <code>web-sg</code> (Lesson 6)</td></tr>
                  <tr><td>Backups</td><td>7 days retention</td><td>Point-in-time restore to any second in that window</td></tr>
                  <tr><td>Encryption</td><td>On</td><td>Free, and can&apos;t be added later</td></tr>
                  <tr><td>Deletion protection</td><td><strong>On</strong></td><td>Delete is refused until you switch it off. It has saved many careers</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              Creating takes 5–15 minutes. When it is ready, copy the <strong>endpoint</strong> —
              something like <code>myapp-db.abc123xyz.ap-south-1.rds.amazonaws.com</code>. Looked up
              from your laptop, it resolves to a private <code>10.0.x.x</code> address: proof that
              the internet can&apos;t reach it.
            </p>
          </li>
        </ol>

        <h2 id="connect">Connect from the app server</h2>
        <p>
          The database only accepts connections from <code>web-sg</code>, so the test has to come
          from your EC2 instance. SSH in, install the Postgres client (<code>postgresql-client</code>),
          and connect:
        </p>
        <CommandList
          title="On the EC2 server"
          commands={[
            { cmd: "psql \"host=<DB_HOST> port=5432 dbname=postgres user=dbadmin sslmode=require\"", note: "Prompts for the password. “postgres=>” means you are in. If it hangs, it is the network — see the troubleshooting table" },
          ]}
        />

        <h2 id="users">Do not run your app as the admin</h2>
        <p>
          <code>dbadmin</code> can drop every database on the server. If your web app connects as
          admin and has a SQL-injection bug or a leaked <code>.env</code>, the attacker owns
          everything. Use the admin account only to create a limited user for the app — least
          privilege, the same principle as Lesson 5.
        </p>
        <Script
          title="inside psql, connected as dbadmin"
          code={`CREATE USER appuser WITH PASSWORD 'A-LONG-RANDOM-PASSWORD';
CREATE DATABASE myapp OWNER appuser;      -- a user that can only touch its own database
REVOKE ALL ON DATABASE myapp FROM PUBLIC; -- nobody else may even connect to it`}
        />
        <p>
          Generate that second password as a long random string without symbols, and store it
          in your password manager. Now you have two
          identities: <code>dbadmin</code> for you, <code>appuser</code> for the app.
        </p>

        <h2 id="app">Connect the Next.js app</h2>
        <p>Add the URL to the server&apos;s <code>.env</code> (still <code>chmod 600</code>):</p>
        <Script
          title=".env on the server"
          code={`DATABASE_URL=postgresql://appuser:THE-APP-PASSWORD@myapp-db.abc123xyz.ap-south-1.rds.amazonaws.com:5432/myapp?sslmode=require`}
        />
        <p>
          A connection string is five parts: <code>user : password @ host : port / database</code>.
          If the password contains <code>@ : / # ?</code>, it must be URL-encoded — which is why we
          generated passwords without symbols.
        </p>
        <h3>Migrations — creating the tables</h3>
        <p>
          Whatever tool you use (Prisma, Drizzle, Knex), production has one rule:{" "}
          <strong>apply migrations with a non-interactive, deploy-only command</strong>, never the
          development one.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tool</th>
                <th>Development (laptop)</th>
                <th>Production (server / CI)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Prisma</td>
                <td><code>prisma migrate dev</code></td>
                <td><code>prisma migrate deploy</code></td>
              </tr>
              <tr>
                <td>Drizzle</td>
                <td><code>drizzle-kit generate</code></td>
                <td><code>drizzle-kit migrate</code></td>
              </tr>
              <tr>
                <td>Knex</td>
                <td><code>knex migrate:make</code></td>
                <td><code>knex migrate:latest</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="Never run prisma migrate dev or db push against production">
          <p className="mb-0">
            The dev commands can reset the database when they detect drift. Deploy commands only
            apply migration files that are already committed and reviewed. Take a manual snapshot
            before every production migration that drops or rewrites a column.
          </p>
        </Callout>
        <p>
          Add the migration step to your deploy loop from Lesson 7, <em>before</em> the
          reload, and make it backward-compatible: the old version of the app is still running
          while the migration executes, so never rename or drop a column in the same release that
          stops using it. Add the new column first, deploy code that uses both, drop the old one in
          a later release. This &ldquo;expand then contract&rdquo; pattern is what separates
          zero-downtime teams from the rest.
        </p>
        <h3>TLS to the database</h3>
        <p>
          On PostgreSQL 15 and later, RDS requires encrypted connections by default, so{" "}
          <code>sslmode=require</code> is mandatory. That encrypts the traffic but does not verify
          the server&apos;s identity — a convincing impostor would still be accepted.
        </p>
        <p>
          In practice: download the AWS RDS certificate bundle onto the server once, give it to
          your Postgres driver as the trusted CA, and turn on certificate checking. That also is
          the place to set the pool size — the number the next section is about.
        </p>

        <h2 id="pooling">Connection limits — the outage that surprises everyone</h2>
        <p>
          Every PostgreSQL connection is a separate operating-system process that uses memory (a few
          MB each). The database therefore has a hard cap called <code>max_connections</code>, and
          on RDS it is derived from the instance&apos;s RAM. A <code>db.t4g.micro</code> allows
          roughly <strong>100 connections</strong>.
        </p>
        <p>The failure mode looks like this:</p>
        <ol>
          <li>You run 4 app servers, each with a connection pool of 20 → 80 connections. Fine.</li>
          <li>Traffic grows and Auto Scaling launches 4 more servers → 160 connections wanted.</li>
          <li>
            The database refuses the extra ones:{" "}
            <code>FATAL: remaining connection slots are reserved</code>. The site returns errors —
            precisely when it is busiest.
          </li>
        </ol>
        <Callout kind="note" label="The arithmetic to do before you scale">
          <p className="mb-0">
            <strong>servers × pool size per server ≤ ~80% of max_connections.</strong> With a limit
            of 100 you can afford, say, 8 servers × 10. Check the actual limit with{" "}
            <code>SHOW max_connections;</code> and current usage with{" "}
            <code>SELECT count(*) FROM pg_stat_activity;</code>.
          </p>
        </Callout>
        <h3>The fixes, in order of effort</h3>
        <ul>
          <li>
            <strong>Set a sensible pool size</strong> in the app (<code>max: 5–10</code>), not the
            library default.
          </li>
          <li>
            <strong>Use a bigger instance</strong>: more RAM means a higher limit, and more
            headroom anyway.
          </li>
          <li>
            <strong>Put a pooler in front</strong>: <strong>RDS Proxy</strong> (managed, roughly
            $15/month for the smallest, holds a small number of real connections and shares them
            among thousands of app connections) or self-run <strong>PgBouncer</strong>. This becomes
            essential with serverless functions, where every invocation would otherwise open its own
            connection — the classic reason Vercel + Postgres setups hit limits.
          </li>
        </ul>

        <h2 id="laptop">Reaching the database from your laptop, safely</h2>
        <p>
          You will want to look at data with a GUI (TablePlus, DBeaver, pgAdmin) or run a script. The
          database is private, and the wrong fix is to make it public. The right fix is an{" "}
          <strong>SSH tunnel</strong> through the app server, which is allowed to reach it:
        </p>
        <CommandList
          title="On your laptop"
          commands={[
            { cmd: "ssh -N -L 5433:<DB_HOST>:5432 myapp", note: "Forward localhost:5433 → through the EC2 server → the database. Point your GUI at localhost:5433; Ctrl+C closes the tunnel" },
          ]}
        />
        <p>
          The traffic travels inside the encrypted SSH connection, exits on the server (inside the
          VPC), and reaches the database. Nothing was opened to the internet.
        </p>
        <Callout kind="warn" label="Never “just for a minute” make it public">
          <p className="mb-0">
            A database with a public IP and port 5432 open is found by internet scanners within
            minutes. Even with a strong password, you are exposing an attack surface that a private
            subnet removes entirely. If a colleague needs access, give them tunnel access (or SSM
            port forwarding, Lesson 18), not an open port.
          </p>
        </Callout>

        <h2 id="operations">Day-two operations</h2>
        <h3>Maintenance window</h3>
        <p>
          AWS applies OS and minor-version patches during a weekly window you choose. Pick your
          quietest hour (Sunday 03:00 IST, for example). Patching a single-AZ database causes a short
          outage of a few minutes; Multi-AZ reduces that to a failover. In the console: Modify →
          Maintenance.
        </p>
        <h3>Parameter groups</h3>
        <p>
          You cannot edit <code>postgresql.conf</code> on RDS. Instead you attach a{" "}
          <strong>parameter group</strong>: a named set of settings. The default group is read-only,
          so to change anything (log slow queries, for example) you create your own group, set{" "}
          <code>log_min_duration_statement = 500</code> (milliseconds), attach it, and reboot if the
          parameter is static.
        </p>
        <h3>What to watch</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Worry when</th>
                <th>Usually means</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>CPUUtilization</code></td><td>Sustained above 70–80%</td><td>Missing indexes or an undersized instance</td></tr>
              <tr><td><code>FreeableMemory</code></td><td>Falling towards zero</td><td>Working set larger than RAM</td></tr>
              <tr><td><code>DatabaseConnections</code></td><td>Approaching max_connections</td><td>Pool arithmetic wrong (previous section)</td></tr>
              <tr><td><code>FreeStorageSpace</code></td><td>Below ~20%</td><td>Growth or bloat; autoscaling should catch it</td></tr>
              <tr><td><code>ReadLatency / WriteLatency</code></td><td>Sudden spikes</td><td>Storage limits or a heavy query</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Lesson 17 turns these into alarms. Also enable <strong>Performance Insights</strong> (free
          for seven days of history): it shows which SQL statements consume the database time, which
          answers &ldquo;why is it slow?&rdquo; in one screen.
        </p>
        <h3>Take a snapshot, and prove it restores</h3>
        <p>
          Before any risky change, take a <strong>manual snapshot</strong> (RDS → your database →
          Actions → Take snapshot); it lives until you delete it. And once, as a drill, use{" "}
          <strong>Restore to point in time</strong> to create a copy from ten minutes ago. It
          always restores into a <em>new</em> instance with a new hostname, and that copy bills
          until you delete it.
        </p>

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
                  <td><code>{s}</code></td>
                  <td>{c}</td>
                  <td>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="cost">What this costs</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Approx. per month (Mumbai)</th></tr>
            </thead>
            <tbody>
              <tr><td>db.t4g.micro, single-AZ, running 24/7</td><td>~$13 (~₹1,100)</td></tr>
              <tr><td>db.t4g.small</td><td>~$26</td></tr>
              <tr><td>20 GB gp3 storage</td><td>~$3</td></tr>
              <tr><td>Automated backups up to the size of your database</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>Manual snapshots beyond that</td><td>~$0.095 per GB-month</td></tr>
              <tr><td>Multi-AZ</td><td>≈ double the instance and storage</td></tr>
              <tr><td>RDS Proxy</td><td>~$15+ (per vCPU of the database)</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="Pausing while you study">
          <p className="mb-0">
            You can <strong>stop</strong> an RDS instance (<code>aws rds stop-db-instance</code>)
            to stop paying for compute. AWS automatically starts it again after seven days, so put a
            reminder in your calendar. Storage still bills while stopped.
          </p>
        </Callout>

        <h2 id="interview">Interview corner</h2>
        <InterviewQA
          items={[
            {
              q: "Multi-AZ vs read replica?",
              a: (
                <p className="mb-0">
                  Multi-AZ is a synchronous, invisible standby for automatic failover — availability,
                  not scaling, and you cannot query it. A read replica is an asynchronous,
                  queryable copy for offloading reads (and can be cross-region), promoted manually.
                </p>
              ),
            },
            {
              q: "Why should the database be in a private subnet if it already has a Security Group?",
              a: (
                <p className="mb-0">
                  Defence in depth. A Security Group rule can be edited by mistake; a private
                  subnet with no Internet Gateway route makes public exposure structurally
                  impossible. Two independent controls must both fail.
                </p>
              ),
            },
            {
              q: "Someone deleted a table at 14:32. How do you recover?",
              a: (
                <p className="mb-0">
                  Point-in-time restore to just before 14:32 into a <em>new</em> instance (restores
                  never overwrite), verify, then either repoint the app or copy the missing data
                  back. Multi-AZ would not help — it replicated the deletion.
                </p>
              ),
            },
            {
              q: "Your app suddenly returns errors after Auto Scaling added servers. The DB CPU is low. What is it?",
              a: (
                <p className="mb-0">
                  Connection exhaustion: servers × pool size exceeded <code>max_connections</code>.
                  Reduce per-server pool size, use a larger instance, or add RDS Proxy / PgBouncer.
                </p>
              ),
            },
            {
              q: "How do you connect to a private database from your laptop without exposing it?",
              a: (
                <p className="mb-0">
                  An SSH tunnel (or SSM Session Manager port forwarding) through an instance inside
                  the VPC that Security Groups already allow. Never a public IP and an open port.
                </p>
              ),
            },
            {
              q: "How do you do a zero-downtime schema change?",
              a: (
                <p className="mb-0">
                  Expand then contract: add new columns or tables as nullable/backward compatible,
                  deploy code that works with both shapes, migrate the data, deploy code that uses
                  only the new shape, and only then drop the old column in a later release.
                </p>
              ),
            },
            {
              q: "What is RDS not doing for you?",
              a: (
                <p className="mb-0">
                  Query and schema design, indexes, application-level users and permissions,
                  choosing instance size, testing restores, and connection management. AWS runs the
                  server; you still run the database.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 9</h2>
        <ol>
          <li>
            Build the database as above. Confirm from your laptop that the hostname
            resolves to a <code>10.0.x.x</code> address and that <code>psql</code> hangs (it must:
            it is private). Then connect successfully from the EC2 server.
          </li>
          <li>
            Create <code>appuser</code> and the <code>myapp</code> database. Connect as{" "}
            <code>appuser</code> and try <code>CREATE DATABASE other;</code>. It should be denied.
            Why is that good?
          </li>
          <li>
            Add <code>DATABASE_URL</code> to the server&apos;s <code>.env</code>, run your ORM&apos;s
            deploy migration, and load a page that reads from the database.
          </li>
          <li>
            Open an SSH tunnel and connect with a GUI client from your laptop. Then close the
            tunnel and confirm the connection fails.
          </li>
          <li>
            Take a manual snapshot. In the console, restore it to a new instance called{" "}
            <code>myapp-db-drill</code>, note how long it takes and that it has a different
            hostname, then delete the drill instance.
          </li>
          <li>
            Run <code>SHOW max_connections;</code>. With your app&apos;s pool size, how many app
            servers can you run before you hit ~80% of it?
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            In the RDS console, enable Performance Insights, run a deliberately slow query
            (<code>select pg_sleep(2)</code> in a loop), and find it in the top-SQL view. This is the
            first tool you reach for in a real &ldquo;the database is slow&rdquo; incident.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          RDS is PostgreSQL with the boring, dangerous parts — patching, backups, failover, disk —
          handled by AWS, and with the important parts — access, schema, sizing — still yours.
        </p>
        <ul>
          <li>
            <strong>Private by construction</strong>: private subnets, a subnet group, no public
            IP, and a Security Group that trusts only the app&apos;s group.
          </li>
          <li>
            <strong>Two identities</strong>: an admin for you, a limited user for the app.
            Generated passwords, never typed into history.
          </li>
          <li>
            <strong>Multi-AZ is for uptime, backups are for mistakes.</strong> Know which problem
            each solves, and remember that restores create a new instance.
          </li>
          <li>
            <strong>Watch connections</strong>: servers × pool size must stay under the limit,
            or scaling out breaks the site.
          </li>
          <li>
            <strong>Reach it through a tunnel</strong>, never by opening it to the internet.
          </li>
        </ul>
        <p>
          The app now has a real database, but it is still a hand-built server. Next we package the
          app so it runs identically everywhere: Docker.
        </p>

        <hr />
        <p>
          End of Lesson 8. Next: <strong>Lesson 9 — Docker: Containerize Your Next.js and Node
          App</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
