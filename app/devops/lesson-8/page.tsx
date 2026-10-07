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
          <strong>RDS</strong> (Relational Database Service) is an AWS service that{" "}
          <strong>runs databases such as PostgreSQL and MySQL for you</strong>. A relational
          database stores data in tables with rows and columns, and you ask it questions with SQL.
          With RDS you get a hostname, a port, a username and a password. You do not get a login to
          the machine underneath, because you do not need one. AWS looks after the server, the
          disk, the patches, the backups and the failover (switching to a spare copy when the main
          one fails).
        </p>
        <p>
          For your application, it is an ordinary PostgreSQL database. It uses the same SQL, the
          same drivers and the same ORM (a library that lets code use a database through objects).
          The only change is that <code>DATABASE_URL</code> points to an AWS hostname instead of{" "}
          <code>localhost</code>.
        </p>
        <Callout kind="note" label="The analogy">
          <p className="mb-0">
            Installing Postgres on your EC2 server is like owning a house. You have total freedom,
            and you fix the roof, the plumbing and the locks. RDS is like a serviced apartment. You
            live the same way, but the building manager does the maintenance. You pay more each
            month, and you worry much less at 3 a.m.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why not just install Postgres on the server</h2>
        <p>
          You <em>can</em>. Many small products do this, and it is fine for a hobby project. But
          then you own all of this:
        </p>
        <ul>
          <li>
            <strong>Backups.</strong> Someone must write the script, schedule it and store the
            files somewhere else. Then comes the step that everyone skips: test a restore. A backup
            that you never tested is only a hope.
          </li>
          <li>
            <strong>Data lives on the app server.</strong> If that machine dies, is terminated by
            mistake or is replaced during a deploy, your customers&apos; data is lost with it.
          </li>
          <li>
            <strong>You cannot scale out.</strong> Auto Scaling (Lesson 12) creates and removes app
            servers freely. This only works if the servers hold no data. A database on the same
            server ties you to one machine.
          </li>
          <li>
            <strong>Resource fights.</strong> Postgres and Node share CPU and RAM. A slow query
            makes your website slow, and a busy website makes the database slow.
          </li>
          <li>
            <strong>Patching and upgrades</strong> are your job, on your schedule, with your
            downtime.
          </li>
        </ul>
        <StatelessDiagram />
        <p>
          The diagram above (from Lesson 0) shows the goal: app servers that remember nothing and
          can be replaced at any time. This only works when the memory, which is the database,
          lives somewhere else. RDS is that place.
        </p>
        <Callout kind="ok" label="Rule of thumb">
          <p className="mb-0">
            Use RDS as soon as the database holds data that you cannot afford to lose. For a real
            product, that is always.
          </p>
        </Callout>

        <h2 id="responsibility">Who does what — you vs AWS</h2>
        <p>
          This split is called the <strong>shared responsibility model</strong>. It means that AWS
          looks after some parts and you look after the rest. It is a very common interview
          question about managed services. (A managed service is one where AWS runs the machines
          for you.) RDS moves the line up, but your half does not disappear.
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
          Notice that <strong>a slow query, a missing index and a leaked password are still your
          job</strong>. An index is a lookup structure that makes searches fast. &ldquo;Managed&rdquo;
          does not mean that AWS fixes everything.
        </p>

        <h2 id="options">The choices you make: class, storage, Multi-AZ</h2>
        <h3>Instance class</h3>
        <p>
          The instance class is the size of the database server. The names work like EC2 names,
          with a <code>db.</code> prefix. <code>db.t4g.micro</code> is burstable, uses an ARM
          Graviton CPU, and has 2 vCPU and 1 GB RAM. For learning and a low-traffic product,{" "}
          <code>db.t4g.micro</code> or <code>db.t4g.small</code> (2 GB) is enough. Move to{" "}
          <code>db.m</code> or <code>db.r</code> (r means memory-optimised) when your working set
          no longer fits in memory. The working set is the data you use most often. Postgres is
          fast when its indexes and busy rows are in RAM. It is slow when it must read from disk.
          So <strong>RAM is the number to watch</strong>.
        </p>
        <h3>Storage</h3>
        <ul>
          <li>
            <strong>gp3</strong> (a type of SSD disk) is the default choice. It includes 3,000
            IOPS (disk reads and writes per second), and you pay per GB. Start at 20 GB.
          </li>
          <li>
            Turn on <strong>storage autoscaling</strong> (<code>--max-allocated-storage</code>), so
            a growing table never fills the disk and freezes the database. You can make storage
            bigger, but you can never make it smaller.
          </li>
          <li>
            Turn on <strong>encryption at rest</strong> (data is scrambled on the disk) when you
            create the database. You cannot turn it on later. You would have to copy a snapshot
            with encryption and restore from it.
          </li>
        </ul>
        <h3>Multi-AZ — high availability, not a backup</h3>
        <p>
          <strong>Multi-AZ</strong> means AWS keeps a second, hidden copy (the standby) of the
          database in another Availability Zone. Every write is copied to it at the same time
          (synchronously). If the main database fails, RDS moves the same hostname to the standby
          in about one to two minutes. You change no code. (This table describes the classic
          Multi-AZ instance setup. A newer &ldquo;Multi-AZ DB cluster&rdquo; option has standbys
          that you can read from.)
        </p>
        <p>
          A <strong>read replica</strong> is a different thing. It is an extra copy that you can
          read from, to share the load. In one line: Multi-AZ is for staying online, a read replica
          is for speed.
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
                <td>Share out read traffic (performance)</td>
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
            Suppose a developer runs <code>DROP TABLE users;</code> or a bug damages rows. The
            standby copies that damage within milliseconds. Multi-AZ protects against{" "}
            <em>hardware</em> failure. Only backups protect against <em>human</em> mistakes.
          </p>
        </Callout>
        <p>
          In this course we run a single-AZ database to keep the bill small. For a real product
          with paying customers, turn Multi-AZ on before launch. It is one setting.
        </p>

        <h2 id="backups">Backups, snapshots and point-in-time restore</h2>
        <p>
          A <strong>backup</strong> is a saved copy of your data that you can restore after a
          failure or a mistake. A <strong>snapshot</strong> is a copy of the whole database disk at
          one moment. RDS gives you two kinds, and they behave differently:
        </p>
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
            &ldquo;Restore to 14:32&rdquo; creates a <strong>brand-new instance with a new
            hostname</strong>. You then point the app at it, or copy the missing data across. Learn
            this <em>before</em> an emergency. Always take a manual snapshot before a risky
            migration and before you delete an instance.
          </p>
        </Callout>
        <p>
          Two terms every engineer should be able to explain. <strong>RPO</strong> (Recovery Point
          Objective) is how much data you can afford to lose. With point-in-time restore it is
          about five minutes. <strong>RTO</strong> (Recovery Time Objective) is how long you can
          be down. A restore takes tens of minutes, and a Multi-AZ failover takes about two. In one
          line: RPO is about lost data, RTO is about lost time. Lesson 18 practises a real restore.
        </p>

        <h2 id="build">Build it: a private database</h2>
        <ol className="steps">
          <li>
            <h3>Create a subnet group — the list of subnets RDS may use</h3>
            <p>
              A subnet group is a list of subnets where RDS is allowed to place your database. Go to
              RDS → Subnet groups → Create. Name it <code>myapp-private</code>, pick the{" "}
              <code>myapp</code> VPC and select <strong>only the two private subnets</strong>. (RDS
              needs two AZs, even for one database.) This step keeps the database off the internet.
              RDS can only place it in subnets that have no route to the Internet Gateway.
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
                  <tr><td>Engine version</td><td>a current major version (16 or newer)</td><td>It is supported for years and gets security patches</td></tr>
                  <tr><td>Template</td><td>Free tier / Dev-Test</td><td>Single-AZ is fine while learning</td></tr>
                  <tr><td>Master username</td><td><code>dbadmin</code></td><td>For you only — never for the app</td></tr>
                  <tr><td>Password</td><td>Auto-generate, or a long random one</td><td>Store it in your password manager straight away</td></tr>
                  <tr><td>Instance class</td><td><code>db.t4g.micro</code></td><td>Smallest size; about 100 connections at most (see below)</td></tr>
                  <tr><td>Storage</td><td>20 GB gp3, autoscaling to 100</td><td>Grows on its own instead of filling up</td></tr>
                  <tr><td>Connectivity</td><td><code>myapp</code> VPC, subnet group <code>myapp-private</code></td><td>The private subnets from step 1</td></tr>
                  <tr><td>Public access</td><td><strong>No</strong></td><td>No public IP at all — it exists only inside the VPC</td></tr>
                  <tr><td>Security group</td><td><code>db-sg</code> (remove <code>default</code>)</td><td>Accepts 5432 only from <code>web-sg</code> (Lesson 6)</td></tr>
                  <tr><td>Backups</td><td>7 days retention</td><td>Point-in-time restore to any second in that window</td></tr>
                  <tr><td>Encryption</td><td>On</td><td>Free, and can&apos;t be added later</td></tr>
                  <tr><td>Deletion protection</td><td><strong>On</strong></td><td>AWS refuses to delete the database until you switch this off. It prevents expensive accidents</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              Creating the database takes 5–15 minutes. When it is ready, copy the{" "}
              <strong>endpoint</strong> (the hostname of the database), which looks like{" "}
              <code>myapp-db.abc123xyz.ap-south-1.rds.amazonaws.com</code>. If you look it up from
              your laptop, it gives a private <code>10.0.x.x</code> address. This shows that the
              internet cannot reach it.
            </p>
          </li>
        </ol>

        <h2 id="connect">Connect from the app server</h2>
        <p>
          The database only accepts connections from <code>web-sg</code>, so you must test from your
          EC2 instance. Log in with SSH, install the Postgres command-line client (the package{" "}
          <code>postgresql-client</code>, which gives you the <code>psql</code> command), and
          connect:
        </p>
        <CommandList
          title="On the EC2 server"
          commands={[
            { cmd: "psql \"host=<DB_HOST> port=5432 dbname=postgres user=dbadmin sslmode=require\"", note: "It asks for the password. The prompt “postgres=>” means you are in. If it hangs, the problem is the network. See the troubleshooting table" },
          ]}
        />

        <h2 id="users">Do not run your app as the admin</h2>
        <p>
          <code>dbadmin</code> can drop every database on the server. Suppose your web app connects
          as admin, and it has a SQL-injection bug (a flaw that lets an attacker run their own SQL)
          or a leaked <code>.env</code>. Then the attacker owns everything. Use the admin account
          only to create a limited user for the app. This is least privilege, the same idea as in
          Lesson 5.
        </p>
        <Script
          title="inside psql, connected as dbadmin"
          code={`CREATE USER appuser WITH PASSWORD 'A-LONG-RANDOM-PASSWORD';
GRANT appuser TO dbadmin;                 -- RDS needs this before dbadmin can create a database owned by appuser
CREATE DATABASE myapp OWNER appuser;      -- appuser owns this database and can only use it
REVOKE ALL ON DATABASE myapp FROM PUBLIC; -- nobody else may even connect to it`}
        />
        <p>
          On RDS, the admin user is not a full superuser. So it must be a member of{" "}
          <code>appuser</code> (the <code>GRANT</code> line) before it can create a database owned
          by <code>appuser</code>. Without that line you get &ldquo;must be member of role&rdquo;.
          Make the second password a long random string without symbols, and store it in your
          password manager. Now you have two identities: <code>dbadmin</code> for you and{" "}
          <code>appuser</code> for the app.
        </p>

        <h2 id="app">Connect the Next.js app</h2>
        <p>Add the URL to the server&apos;s <code>.env</code> (still <code>chmod 600</code>):</p>
        <Script
          title=".env on the server"
          code={`DATABASE_URL=postgresql://appuser:THE-APP-PASSWORD@myapp-db.abc123xyz.ap-south-1.rds.amazonaws.com:5432/myapp?sslmode=require`}
        />
        <p>
          A connection string is one line that tells your app how to reach the database. It has
          five parts: <code>user : password @ host : port / database</code>. If the password
          contains <code>@ : / # ?</code>, you must URL-encode it (write each of these symbols as
          a <code>%</code> code). This is why we made passwords without symbols.
        </p>
        <h3>Migrations — creating the tables</h3>
        <p>
          A <strong>migration</strong> is a small file of changes to the database structure, such
          as &ldquo;add a table&rdquo; or &ldquo;add a column&rdquo;. A migration tool applies these
          files in order. Whatever tool you use (Prisma, Drizzle, Knex), production has one rule:{" "}
          <strong>apply migrations with a deploy-only command that asks no questions</strong>.
          Never use the development command there.
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
            The dev commands can reset the database when they find that it no longer matches your
            migration files (this is called drift). Deploy commands only apply migration files that
            are already committed and reviewed. Take a manual snapshot before every production
            migration that drops or rewrites a column.
          </p>
        </Callout>
        <p>
          Add the migration step to your deploy loop from Lesson 7, <em>before</em> the reload.
          Make it backward-compatible. The old version of the app is still running while the
          migration runs. So never rename or drop a column in the same release that stops using it.
          First add the new column. Then deploy code that works with both columns. Drop the old
          column in a later release. This &ldquo;expand then contract&rdquo; pattern lets teams
          change the database with no downtime.
        </p>
        <h3>TLS to the database</h3>
        <p>
          TLS is the encryption that protects data while it travels over a network. On PostgreSQL
          15 and later, RDS requires TLS by default, so <code>sslmode=require</code> is needed.
          This setting encrypts the traffic, but it does not check who the server is. A convincing
          fake server would still be accepted.
        </p>
        <p>
          For full safety, download the AWS RDS certificate bundle onto the server once. Give it to
          your Postgres driver as the trusted CA (certificate authority, the body that vouches for
          the server&apos;s identity), and turn on certificate checking. The driver settings are
          also where you set the pool size. The next section is about that number.
        </p>

        <h2 id="pooling">Connection limits — the outage that surprises everyone</h2>
        <p>
          A connection is one open line between your app and the database. A connection pool is a
          small set of connections that the app keeps open and reuses. Every PostgreSQL connection
          is a separate operating-system process that uses memory (a few MB each). So the database
          has a hard limit called <code>max_connections</code>. On RDS this limit is worked out
          from the instance&apos;s RAM. A <code>db.t4g.micro</code> allows roughly{" "}
          <strong>100 connections</strong> (a little less in practice).
        </p>
        <p>The failure looks like this:</p>
        <ol>
          <li>You run 4 app servers, each with a connection pool of 20 → 80 connections. Fine.</li>
          <li>Traffic grows and Auto Scaling starts 4 more servers → 160 connections wanted.</li>
          <li>
            The database refuses the extra ones:{" "}
            <code>FATAL: remaining connection slots are reserved</code>. The site shows errors
            exactly when it is busiest.
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
            <strong>Use a bigger instance</strong>: more RAM gives a higher limit and more spare
            room.
          </li>
          <li>
            <strong>Put a pooler in front.</strong> A pooler is a middle service that holds a small
            number of real database connections and shares them among thousands of app
            connections. Choose <strong>RDS Proxy</strong> (managed by AWS, about $0.015 per vCPU
            per hour of your database, with a minimum of 2 vCPUs, so roughly $22 a month at least)
            or run <strong>PgBouncer</strong> (a free open-source pooler) yourself. A pooler is
            very important with serverless functions, because each call would otherwise open its
            own connection. This is the usual reason that Vercel + Postgres setups hit limits.
          </li>
        </ul>

        <h2 id="laptop">Reaching the database from your laptop, safely</h2>
        <p>
          You will want to look at data with a GUI tool (TablePlus, DBeaver, pgAdmin) or run a
          script. The database is private. The wrong fix is to make it public. The right fix is an{" "}
          <strong>SSH tunnel</strong>. This is an encrypted path that goes through the app server,
          which is allowed to reach the database:
        </p>
        <CommandList
          title="On your laptop"
          commands={[
            { cmd: "ssh -N -L 5433:<DB_HOST>:5432 myapp", note: "Forward localhost:5433 through the EC2 server to the database. Point your GUI at localhost:5433. Press Ctrl+C to close the tunnel" },
          ]}
        />
        <p>
          The traffic travels inside the encrypted SSH connection. It comes out on the server
          (inside the VPC) and reaches the database. Nothing is opened to the internet.
        </p>
        <Callout kind="warn" label="Never “just for a minute” make it public">
          <p className="mb-0">
            Internet scanners find a database with a public IP and open port 5432 within minutes.
            Even with a strong password, you give attackers something to attack. A private subnet
            removes that risk completely. If a colleague needs access, give them tunnel access (or
            SSM port forwarding, Lesson 18), not an open port.
          </p>
        </Callout>

        <h2 id="operations">Day-two operations</h2>
        <h3>Maintenance window</h3>
        <p>
          AWS applies operating-system patches and minor-version updates during a weekly window
          that you choose. Pick your quietest hour (for example Sunday 03:00 IST). Patching a
          single-AZ database causes a short outage of a few minutes. With Multi-AZ, the outage
          shrinks to one failover. In the console: Modify → Maintenance.
        </p>
        <h3>Parameter groups</h3>
        <p>
          You cannot edit <code>postgresql.conf</code> (the Postgres settings file) on RDS. Instead
          you attach a <strong>parameter group</strong>, which is a named set of settings. The
          default group is read-only. To change anything, such as logging slow queries, make your
          own group. Set <code>log_min_duration_statement = 500</code> (milliseconds), attach the
          group, and reboot if the setting is static (a static setting needs a reboot to apply).
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
          Lesson 17 turns these into alarms. Also turn on <strong>Performance Insights</strong>{" "}
          (free for seven days of history). It shows which SQL statements use most of the database
          time, so it answers &ldquo;why is it slow?&rdquo; on one screen. AWS is moving this
          view into CloudWatch <strong>Database Insights</strong>, so the console may show that
          name. The idea is the same.
        </p>
        <h3>Take a snapshot, and prove it restores</h3>
        <p>
          Before any risky change, take a <strong>manual snapshot</strong> (RDS → your database →
          Actions → Take snapshot). It stays until you delete it. Once, as a practice drill, use{" "}
          <strong>Restore to point in time</strong> to make a copy from ten minutes ago. It always
          restores into a <em>new</em> instance with a new hostname. That copy costs money until
          you delete it.
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
              <tr><td>RDS Proxy</td><td>~$0.015 per vCPU-hour of the database, minimum 2 vCPUs (about $22+)</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="Pausing while you study">
          <p className="mb-0">
            You can <strong>stop</strong> an RDS instance (<code>aws rds stop-db-instance</code>)
            to stop paying for compute. AWS starts it again by itself after seven days, so put a
            reminder in your calendar. Storage still costs money while it is stopped.
          </p>
        </Callout>

        <h2 id="interview">Interview corner</h2>
        <InterviewQA
          items={[
            {
              q: "Multi-AZ vs read replica?",
              a: (
                <p className="mb-0">
                  Multi-AZ is a hidden standby that is copied at the same time as the main database
                  (synchronous). It gives automatic failover. It is for availability, not for speed,
                  and you cannot query it. A read replica is a copy that is updated a little later
                  (asynchronous). You can query it to take read load off the main database. It can
                  even be in another region, and you promote it to main by hand.
                </p>
              ),
            },
            {
              q: "Why should the database be in a private subnet if it already has a Security Group?",
              a: (
                <p className="mb-0">
                  Defence in depth, which means several layers of protection. Someone can change a
                  Security Group rule by mistake. A private subnet with no Internet Gateway route
                  makes public exposure impossible by design. Two separate controls must both fail
                  before the database is exposed.
                </p>
              ),
            },
            {
              q: "Someone deleted a table at 14:32. How do you recover?",
              a: (
                <p className="mb-0">
                  Use point-in-time restore to a moment just before 14:32. It creates a <em>new</em>{" "}
                  instance, because restores never overwrite. Check the data, then point the app at
                  the new instance or copy the missing data back. Multi-AZ would not help, because
                  it copied the deletion too.
                </p>
              ),
            },
            {
              q: "Your app suddenly returns errors after Auto Scaling added servers. The DB CPU is low. What is it?",
              a: (
                <p className="mb-0">
                  The database ran out of connections: servers × pool size went over{" "}
                  <code>max_connections</code>. Lower the pool size per server, use a larger
                  instance, or add RDS Proxy or PgBouncer.
                </p>
              ),
            },
            {
              q: "How do you connect to a private database from your laptop without exposing it?",
              a: (
                <p className="mb-0">
                  Use an SSH tunnel (or SSM Session Manager port forwarding) through an instance
                  inside the VPC that the Security Groups already allow. Never use a public IP and
                  an open port.
                </p>
              ),
            },
            {
              q: "How do you do a zero-downtime schema change?",
              a: (
                <p className="mb-0">
                  Use expand then contract. First add the new columns or tables in a way that the old
                  code still works (for example, allow empty values). Deploy code that works with
                  both old and new structure. Move the data. Deploy code that uses only the new
                  structure. Drop the old column in a later release.
                </p>
              ),
            },
            {
              q: "What is RDS not doing for you?",
              a: (
                <p className="mb-0">
                  Query and schema design, indexes, users and permissions inside the database,
                  choosing the instance size, testing restores, and managing connections. AWS runs
                  the server, but you still run the database.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 9</h2>
        <ol>
          <li>
            Build the database as above. From your laptop, check that the hostname gives a{" "}
            <code>10.0.x.x</code> address and that <code>psql</code> hangs (it must, because the
            database is private). Then connect from the EC2 server. This must work.
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
            In the RDS console, turn on Performance Insights. Run a slow query on purpose
            (<code>select pg_sleep(2)</code> in a loop) and find it in the top-SQL view. This is the
            first tool to open in a real &ldquo;the database is slow&rdquo; problem.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          RDS is PostgreSQL where AWS handles the boring and risky parts: patching, backups,
          failover and disks. The important parts are still yours: access, schema and sizing.
        </p>
        <ul>
          <li>
            <strong>Private by construction</strong>: private subnets, a subnet group, no public
            IP, and a Security Group that trusts only the app&apos;s group.
          </li>
          <li>
            <strong>Two identities</strong>: an admin for you and a limited user for the app. Use
            generated passwords and never type them into shell history.
          </li>
          <li>
            <strong>Multi-AZ is for uptime, backups are for mistakes.</strong> Know which problem
            each solves, and remember that restores create a new instance.
          </li>
          <li>
            <strong>Watch connections</strong>: servers × pool size must stay under the limit.
            Otherwise, adding servers breaks the site.
          </li>
          <li>
            <strong>Reach it through a tunnel</strong>, never by opening it to the internet.
          </li>
        </ul>
        <p>
          The app now has a real database, but the server is still built by hand. Next we package
          the app so that it runs the same everywhere: Docker.
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
