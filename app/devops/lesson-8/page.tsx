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
  { id: "build", label: "Build it: a private database in six steps" },
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
  ["Creation stuck in “creating” for 15+ minutes", "Normal for the first instance (5–15 min)", "aws rds wait db-instance-available"],
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

        <h2 id="build">Build it: a private database in six steps</h2>
        <p>
          Run these from your laptop, in the same terminal where you loaded{" "}
          <code>~/myapp-network.env</code> in Lesson 6.
        </p>
        <ol className="steps">
          <li>
            <h3>Create a subnet group — the list of subnets RDS may use</h3>
            <Script
              title="1 · subnet group"
              code={`source ~/myapp-network.env

# Both PRIVATE subnets, in two different AZs. RDS insists on two even for one database.
aws rds create-db-subnet-group \\
  --db-subnet-group-name myapp-private \\
  --db-subnet-group-description "Private subnets for myapp databases" \\
  --subnet-ids $PRV_A $PRV_B`}
            />
            <p>
              This is the sentence that keeps the database off the internet: RDS can only place it in
              subnets with no route to the Internet Gateway.
            </p>
          </li>
          <li>
            <h3>Generate a strong admin password without ever typing it</h3>
            <Script
              title="2 · password"
              code={`# 24 random characters; tr removes symbols that break URLs and shell quoting
DB_ADMIN_PASS=$(openssl rand -base64 24 | tr -d '/+=')

# Save it to a file only you can read. Put it in a password manager afterwards.
umask 077
echo "DB_ADMIN_PASS=$DB_ADMIN_PASS" >> ~/myapp-secrets.env`}
            />
          </li>
          <li>
            <h3>Create the instance</h3>
            <Script
              title="3 · create-db-instance"
              code={`aws rds create-db-instance \\
  --db-instance-identifier myapp-db \\
  --engine postgres \\
  --engine-version 16 \\
  --db-instance-class db.t4g.micro \\
  --allocated-storage 20 \\
  --max-allocated-storage 100 \\
  --storage-type gp3 \\
  --storage-encrypted \\
  --master-username dbadmin \\
  --master-user-password "$DB_ADMIN_PASS" \\
  --db-subnet-group-name myapp-private \\
  --vpc-security-group-ids $DB_SG \\
  --no-publicly-accessible \\
  --backup-retention-period 7 \\
  --deletion-protection \\
  --copy-tags-to-snapshot

# Takes 5–15 minutes. Go make tea.
aws rds wait db-instance-available --db-instance-identifier myapp-db`}
            />
            <p>The flags that matter:</p>
            <ul>
              <li>
                <code>--no-publicly-accessible</code>: no public IP at all. The database exists only
                inside the VPC.
              </li>
              <li>
                <code>--vpc-security-group-ids $DB_SG</code>: the group from Lesson 6 that accepts
                port 5432 only from <code>web-sg</code>.
              </li>
              <li>
                <code>--deletion-protection</code>: the delete command is refused until you switch
                it off. It has saved many careers.
              </li>
              <li>
                <code>--engine-version 16</code>: use a currently supported major version. List
                them with{" "}
                <code>aws rds describe-db-engine-versions --engine postgres --query
                &apos;DBEngineVersions[].EngineVersion&apos;</code>.
              </li>
            </ul>
          </li>
          <li>
            <h3>Fetch the endpoint</h3>
            <CommandList
              title="4 · where is it?"
              commands={[
                { cmd: "DB_HOST=$(aws rds describe-db-instances --db-instance-identifier myapp-db --query 'DBInstances[0].Endpoint.Address' --output text) && echo $DB_HOST", note: "Looks like myapp-db.abc123xyz.ap-south-1.rds.amazonaws.com. Note it has no public IP behind it" },
                { cmd: "nslookup $DB_HOST", note: "From your laptop this resolves to a 10.0.x.x private address — proof it is not reachable from the internet" },
              ]}
            />
          </li>
        </ol>
        <p>
          That is the database. Steps five and six happen on the app server, in the next sections:
          create an application user, and point the app at it.
        </p>

        <h2 id="connect">Connect from the app server</h2>
        <p>
          The database only accepts connections from <code>web-sg</code>, so the test has to come
          from your EC2 instance. SSH in and install the Postgres client tools:
        </p>
        <CommandList
          title="On the EC2 server"
          commands={[
            { cmd: "sudo apt install -y postgresql-client", note: "Gives you psql — the standard Postgres command-line client" },
            { cmd: "psql \"host=<DB_HOST> port=5432 dbname=postgres user=dbadmin sslmode=require\"", note: "Prompts for the password. If it connects you will see “postgres=>”. If it hangs, it is the network (troubleshooting table)" },
            { cmd: "select version(), now();", note: "Run inside psql: proves the round trip. \\q quits" },
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
          code={`-- A user that can only touch its own database
CREATE USER appuser WITH PASSWORD 'GENERATE-ANOTHER-LONG-RANDOM-ONE';
CREATE DATABASE myapp OWNER appuser;

-- Nobody else may even connect to it
REVOKE ALL ON DATABASE myapp FROM PUBLIC;

-- Verify
\\l          -- list databases; myapp is owned by appuser
\\q`}
        />
        <p>
          Generate that second password the same way (<code>openssl rand -base64 24 | tr -d
          &apos;/+=&apos;</code>) and store it in your password manager. Now you have two
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
          Add the migration step to <code>~/deploy.sh</code> from Lesson 7, <em>before</em> the
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
          the server&apos;s identity. For full verification, download the AWS trust bundle and pass
          it to your driver:
        </p>
        <Script
          title="db.ts — node-postgres with certificate verification"
          code={`import fs from "node:fs";
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL_NO_SSLMODE, // same URL, without ?sslmode=...
  max: 5,                                                // see the next section — this number matters
  idleTimeoutMillis: 30_000,
  ssl: {
    ca: fs.readFileSync("/etc/ssl/rds/global-bundle.pem").toString(),
    rejectUnauthorized: true,
  },
});

// One-time on the server:
//   sudo mkdir -p /etc/ssl/rds
//   sudo curl -o /etc/ssl/rds/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem`}
        />

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
        <Script
          title="on your laptop"
          code={`# Forward local port 5433 → (through the EC2 server) → the database's port 5432
ssh -N -L 5433:myapp-db.abc123xyz.ap-south-1.rds.amazonaws.com:5432 myapp

# In another terminal, or your GUI: connect to  localhost:5433  as usual
psql "host=localhost port=5433 dbname=myapp user=appuser sslmode=require"`}
        />
        <p>
          The traffic travels inside the encrypted SSH connection, exits on the server (inside the
          VPC), and reaches the database. Nothing was opened to the internet. Close the tunnel with
          Ctrl+C when finished.
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
        <CommandList
          title="Backups you control"
          commands={[
            { cmd: "aws rds create-db-snapshot --db-instance-identifier myapp-db --db-snapshot-identifier myapp-db-before-migration-1", note: "Manual snapshot; survives until you delete it. Do this before risky changes" },
            { cmd: "aws rds describe-db-snapshots --db-instance-identifier myapp-db --query 'DBSnapshots[].[DBSnapshotIdentifier,Status,SnapshotCreateTime]' --output table", note: "List them" },
            { cmd: "aws rds restore-db-instance-to-point-in-time --source-db-instance-identifier myapp-db --target-db-instance-identifier myapp-db-restored --restore-time 2026-01-15T09:30:00Z --db-subnet-group-name myapp-private --vpc-security-group-ids $DB_SG --no-publicly-accessible", note: "Point-in-time restore into a NEW instance. Time is UTC. Delete the copy after the drill or it keeps billing" },
          ]}
        />

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
            Build the database with the six steps. Confirm from your laptop that the hostname
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
