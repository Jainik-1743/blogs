import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import InterviewQA from "@/components/InterviewQA";
import LessonIntro from "@/components/LessonIntro";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson } from "@/lib/lessons";

const lesson = getLesson("lesson-18")!;

export const metadata: Metadata = {
  title: `Lesson 18 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Concept: layers, not a single lock" },
  { id: "why-this-matters", label: "Why this matters" },
  { id: "responsibility", label: "Shared responsibility: what AWS secures, what you secure" },
  { id: "threats", label: "The five ways small teams actually get hurt" },
  { id: "identity", label: "Layer 1 — identity: keys, MFA, roles" },
  { id: "network", label: "Layer 2 — network: shrink the attack surface" },
  { id: "ssm", label: "Layer 3 — no SSH: Session Manager" },
  { id: "host", label: "Layer 4 — the server: patching and IMDSv2" },
  { id: "secrets", label: "Layer 5 — secrets management" },
  { id: "data", label: "Layer 6 — data: encryption and access" },
  { id: "app", label: "Layer 7 — the application and its dependencies" },
  { id: "detect", label: "Layer 8 — detection: CloudTrail, GuardDuty, Config" },
  { id: "backups", label: "Backups: the part that saves the company" },
  { id: "restore", label: "Test the restore — the drill" },
  { id: "incident", label: "When a key leaks: the first hour" },
  { id: "checklist", label: "The hardening checklist" },
  { id: "cost", label: "What this costs" },
  { id: "interview", label: "Interview corner" },
  { id: "practice", label: "Practice task before Lesson 19" },
  { id: "conclusion", label: "Conclusion" },
];

const threats: [string, string, string][] = [
  ["Leaked credentials", "Access keys in a public repo, a .env file inside a Docker image, or a stolen laptop that is still logged in to the CLI", "Use roles instead of keys (Lessons 5, 14), use MFA, scan for secrets, and rotate (replace) a key if you have any doubt"],
  ["Exposed services", "A database, Redis or SSH open to 0.0.0.0/0 (the whole internet), or an S3 bucket set to public", "Private subnets, Security Group references, S3 Block Public Access, and no port 22"],
  ["Unpatched software", "A server or an npm package with a known flaw that attackers already use", "Automatic OS updates, dependency scanning, and frequent image rebuilds"],
  ["Weak or shared access", "One admin login shared by five people, former staff who still have access, or no MFA", "A separate login for each person, least privilege, an access review every quarter, and removal of leavers on the same day"],
  ["No backups (or untested ones)", "Ransomware, a bad migration or a mistaken delete happens, and there is nothing to restore from", "Automatic backups, versioning, copies in another account, and a practised restore"],
];

const restoreSteps: [string, string][] = [
  ["Write the target", "RPO (recovery point objective) is how much data you can afford to lose, for example 15 minutes. RTO (recovery time objective) is how long you can afford to be down, for example 1 hour."],
  ["Restore to a NEW instance", "Never overwrite production. Restore a snapshot, or a chosen point in time, into a fresh database."],
  ["Prove the data is right", "Connect to it. Count the rows in your key tables. Open a recent record that you know."],
  ["Time it", "How long did the whole job take, from start to finish, including finding the instructions?"],
  ["Fix the runbook", "Write down every surprise. The next person (or you, when you are tired) will follow it."],
  ["Clean up", "Delete the drill instance so that it stops costing money."],
];

export default function LessonEighteenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          Security is not a product that you switch on. It is the habit of making every part of the
          system hard to misuse and cheap to recover. This lesson has two halves, and each half is a
          question:
        </p>
        <ul>
          <li>
            <strong>Hardening</strong> — &ldquo;how do I make it hard for the wrong person to do
            harm?&rdquo; Hardening means closing weak points so the system is harder to attack.
          </li>
          <li>
            <strong>Backups</strong> — &ldquo;when something bad happens anyway, how do I get back?&rdquo;
          </li>
        </ul>
        <Callout kind="note" label="The analogy — a castle">
          <p className="mb-0">
            A castle is not safe because of one thick wall. It has a moat, walls, a gatehouse, guards
            who check who comes in, locked inner rooms and a lookout. Sieges sometimes succeed, so it
            also has a hidden store of food and a practised escape route. This is called{" "}
            <strong>defence in depth</strong>. Assume that any single layer will fail one day. Make
            sure the next layer holds.
          </p>
        </Callout>
        <Callout kind="ok" label="A useful mindset: assume breach">
          <p className="mb-0">
            Do not ask &ldquo;could someone get in?&rdquo; Ask &ldquo;<em>when</em> one credential or
            one server is compromised, how far can the attacker go, and how fast would we notice?&rdquo;
            Everything below answers that question. Keep the blast radius small. The blast radius is
            how much damage one break-in can cause. Detect problems fast. Make recovery easy.
          </p>
        </Callout>

        <Callout kind="note" label="Words used in this lesson">
          <ul className="mb-0">
            <li><strong>IAM</strong> (Identity and Access Management) is the AWS service that decides who may do what in your account. An <strong>IAM role</strong> is a set of permissions that a machine or person can borrow for a short time, with no password or long-term key.</li>
            <li><strong>Least privilege</strong> is the rule that every user or machine gets only the permissions it needs, and nothing more.</li>
            <li><strong>A Security Group</strong> is a virtual firewall for an AWS resource. It lists which network traffic may come in. A <strong>subnet</strong> is a smaller part of your private network. A <strong>private subnet</strong> has no direct route from the internet.</li>
            <li><strong>ALB</strong> (Application Load Balancer) is the service that receives web traffic and spreads it over your servers. <strong>EC2</strong> is the AWS service that rents virtual servers.</li>
            <li><strong>TLS</strong> is the protocol that encrypts data as it travels over a network. It is the &ldquo;S&rdquo; in HTTPS. <strong>Encryption</strong> turns data into code that only a key can read.</li>
            <li><strong>A region</strong> is a part of the world where AWS has data centres, for example Mumbai (ap-south-1).</li>
            <li><strong>CI</strong> (continuous integration) is a system that builds and tests your code automatically on every change.</li>
          </ul>
        </Callout>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>
          You now hold your customers&apos; data, their logins and their payments. The results of a
          mistake are real. Laws such as DPDP in India and GDPR in Europe require you to report a data
          breach. You can lose your customers&apos; trust, and a small company often does not survive.
          Attackers do not pick you personally. Their programs scan the whole internet automatically.
          A server with a weak point is found in minutes, not months.
        </p>
        <p>
          There is good news. Most real incidents come from a short list of ordinary mistakes. If you
          fix that list, you are safer than most companies.
        </p>

        <h2 id="responsibility">Shared responsibility: what AWS secures, what you secure</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>AWS is responsible for (&ldquo;security <em>of</em> the cloud&rdquo;)</th>
                <th>You are responsible for (&ldquo;security <em>in</em> the cloud&rdquo;)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Physical</strong></td><td>Buildings, power, hardware, network cabling</td><td>—</td></tr>
              <tr><td><strong>Virtualisation</strong></td><td>Hypervisor, isolation between customers</td><td>—</td></tr>
              <tr><td><strong>EC2 servers</strong></td><td>Nothing inside the operating system</td><td>OS patches (security updates), SSH, the firewall, your app and the data</td></tr>
              <tr><td><strong>RDS / ElastiCache</strong></td><td>Patching of the OS and the database engine, and the hardware</td><td>Who can connect, users and passwords, the encryption choice, how long backups are kept, and your queries</td></tr>
              <tr><td><strong>S3</strong></td><td>Durability (not losing files) and the service itself</td><td>Bucket policies, public access, encryption, and what you put in the bucket</td></tr>
              <tr><td><strong>IAM</strong></td><td>The service works correctly</td><td>Every policy, key, user and role. All of it</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Most cloud breaches come from the customer&apos;s own settings and stolen credentials, not from
          failures inside AWS. The right-hand column is your job.
        </p>

        <h2 id="threats">The five ways small teams actually get hurt</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Threat</th>
                <th>What it looks like</th>
                <th>The defence</th>
              </tr>
            </thead>
            <tbody>
              {threats.map(([t, l, d]) => (
                <tr key={t}>
                  <td><strong>{t}</strong></td>
                  <td>{l}</td>
                  <td>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Notice how much you have already done. You use roles instead of keys (Lesson 5). Your
          databases are private (Lessons 6 and 8). Your buckets are private (Lesson 11). Your deploy
          role has narrow permissions (Lesson 14). This lesson closes the remaining gaps. It also adds
          detection and recovery.
        </p>

        <h2 id="identity">Layer 1 — identity: keys, MFA, roles</h2>
        <p>
          Identity means who or what is allowed to log in. It is the front door, and attackers use it
          most often. First check it with AWS&apos;s own tools. Then apply the rules:
        </p>
        <ul>
          <li>
            In IAM, open the <strong>Credential report</strong>. It is a CSV file (a simple table) with
            one row for every user. It shows password age, whether MFA is on, and the age and last use
            of each access key. MFA (multi-factor authentication) means a second proof of identity,
            such as a code from a phone app. Look for users with no MFA, keys older than 90 days, and
            keys that were never used.
          </li>
          <li>
            Check the user list itself. Does each person still work here? Does each identity still
            need to exist?
          </li>
          <li>
            IAM <strong>Access Analyzer</strong> (the external access check is free) finds buckets,
            roles and keys that are shared outside your account. It can also write least-privilege
            policies (policies that give only the access that is really used) from real usage.
          </li>
        </ul>
        <ul>
          <li>
            <strong>Root user:</strong> the root user is the all-powerful first account. Turn MFA on
            (Lesson 0), create no access keys, and never use it for daily work. Check this in the
            credential report. The <code>&lt;root_account&gt;</code> row must show{" "}
            <code>access_key_1_active = false</code>.
          </li>
          <li>
            <strong>MFA for every person</strong>, preferably with a hardware key or a passkey. A
            hardware key is a small USB device that proves you are you. A passkey is a login method
            that replaces the password. An AWS login with only a password is one stolen password away
            from total loss.
          </li>
          <li>
            <strong>People use IAM Identity Center (single sign-on, SSO). Machines use roles.</strong>{" "}
            SSO lets people sign in once with a central account. If any long-lived access key still
            exists, rotate it, give it the minimum permissions, and name an owner for it.
          </li>
          <li>
            <strong>Remove people on the day they leave.</strong> This is why groups matter (Lesson
            5). One action removes one person, and no access is left over.
          </li>
          <li>
            <strong>Review permissions using real data.</strong> IAM shows when each service was last
            used (&ldquo;last accessed&rdquo;). If a policy allows 40 services but only 3 are used,
            make the policy smaller.
          </li>
        </ul>
        <Callout kind="warn" label="Force MFA with a policy, not a request">
          <p className="mb-0">
            Asking people to turn on MFA is only a wish. A policy that{" "}
            <strong>denies everything except managing their own MFA</strong>, until they sign in with
            MFA, is a real control. AWS publishes a ready-made example called &ldquo;Allow users to
            manage their own MFA&rdquo;. It uses a deny rule with{" "}
            <code>BoolIfExists aws:MultiFactorAuthPresent = false</code>. Attach it to the{" "}
            <code>Developers</code> group.
          </p>
        </Callout>
        <h3>Stop secrets reaching Git at all</h3>
        <ul>
          <li>
            Turn on <strong>GitHub secret scanning and push protection</strong>. Push protection
            blocks a push that contains an AWS key. It is free for public repositories. For private
            repositories it is a paid GitHub feature (GitHub Secret Protection).
          </li>
          <li>
            Also add a pre-commit scanner such as <code>gitleaks</code> on your own computer. It
            checks your code for secrets before each commit.
          </li>
          <li>
            AWS also scans public GitHub. When it finds your key, it restricts the key and emails you.
            But attack bots are faster than email. <strong>If a key ever reaches a public repository,
            treat it as stolen, however fast you delete the commit.</strong> Rotate it.
          </li>
        </ul>

        <h2 id="network">Layer 2 — network: shrink the attack surface</h2>
        <p>
          The safest port is a closed port. (A port is a numbered door on a server that a service
          listens on.) Check what is open to the world. The list should be very short:
        </p>
        <p>
          In EC2, go to Security Groups. Look at every inbound rule whose source is{" "}
          <code>0.0.0.0/0</code>. In our design the <strong>only</strong> such rule should be{" "}
          <code>alb-sg</code> on ports 80 and 443. If <code>web-sg</code>, <code>db-sg</code> or{" "}
          <code>cache-sg</code> appears, or any group has port 22, 5432 or 6379 open to the world,
          fix it now.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Should be open to the internet</th>
                <th>Must never be</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>The ALB: ports 80 and 443 only</td>
                <td>SSH (22), RDP (3389, remote desktop for Windows), databases (5432, 3306), Redis (6379), the app port (3000), Elasticsearch (9200), and admin dashboards</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li>
            Keep databases and caches in <strong>private subnets</strong> with no public IP. Only{" "}
            <code>web-sg</code> may reach them (Lessons 6, 8, 16).
          </li>
          <li>
            App servers accept traffic <strong>only from the ALB</strong> (Lesson 12). If they have
            public IPs, those IPs are for outbound traffic, not inbound.
          </li>
          <li>
            Add <strong>AWS WAF</strong> (Web Application Firewall) on the ALB or CloudFront. It
            blocks common web attacks, such as SQL injection (an attack that sneaks database commands
            into a form field), bad bots and too many requests from one IP. It costs about $5 a month
            plus $1 per rule and $0.60 per million requests. Start with the AWS-managed core rule set.
          </li>
          <li>
            Turn on <strong>VPC Flow Logs</strong>. They record the network connections in your VPC,
            and storing them in S3 is cheap. Later you can answer &ldquo;who talked to this
            server?&rdquo;
          </li>
        </ul>

        <h2 id="ssm">Layer 3 — no SSH: Session Manager</h2>
        <p>
          In Lesson 7 you opened port 22 to your IP address. That is fine for learning. It is a poor
          choice for production. Keys are files, and files get copied. Your IP address changes. And
          every scanner on earth probes an open port 22. <strong>AWS Systems Manager Session
          Manager</strong> gives you a shell on a server with <em>no open port, no key pair and no
          bastion host</em>. (A bastion host is a server that you log in to first, in order to reach
          other servers.) The SSM agent on the server connects out to AWS, and you connect using your
          IAM identity.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>SSH on port 22</th>
                <th>Session Manager</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Inbound port</strong></td><td>Port 22 must be open</td><td className="font-semibold text-emerald-300">None</td></tr>
              <tr><td><strong>Credentials</strong></td><td>A .pem key file that you must store and share</td><td className="font-semibold text-emerald-300">Your IAM/SSO login, with MFA</td></tr>
              <tr><td><strong>Who can access</strong></td><td>Anyone holding the key</td><td>Anyone your IAM policy names</td></tr>
              <tr><td><strong>Audit trail</strong></td><td>Only what you log yourself</td><td className="font-semibold text-emerald-300">Every session logged (CloudTrail, optionally full keystrokes to S3/CloudWatch)</td></tr>
              <tr><td><strong>Revoking access</strong></td><td>Change the key on every server</td><td className="font-semibold text-emerald-300">Remove the IAM permission</td></tr>
            </tbody>
          </table>
        </div>
        <ol className="steps">
          <li>
            <h3>Give the instance role permission to talk to SSM</h3>
            <p>
              Attach the AWS-managed policy <code>AmazonSSMManagedInstanceCore</code> to{" "}
              <code>myapp-ec2-role</code>. The migrations in Lesson 14 already need it. The agent is
              preinstalled on Ubuntu 24.04 images. It needs only this permission and outbound HTTPS.
              After a few minutes the instance shows as <em>Online</em> in Systems Manager, under
              Fleet Manager.
            </p>
          </li>
          <li>
            <h3>Install the Session Manager plugin and connect</h3>
            <p>Install the Session Manager plugin for the AWS CLI on your laptop. Then run:</p>
            <CommandList
              title="On your laptop"
              commands={[
                { cmd: "aws ssm start-session --target i-0abc123def456", note: "Opens a shell on the server with no port 22 and no key pair. The Connect button, then Session Manager, in the console does the same in the browser" },
              ]}
            />
            <p>
              The same tool can also forward a port. This replaces Lesson 8&apos;s SSH tunnel to the
              database, and needs no SSH at all.
            </p>
          </li>
          <li>
            <h3>Close port 22 and drop the key pair</h3>
            <p>
              Once <code>start-session</code> works, delete the SSH rule from <code>web-sg</code>. The
              new launch templates already have no key pair (Lesson 12).
            </p>
          </li>
        </ol>

        <h2 id="host">Layer 4 — the server: patching and IMDSv2</h2>
        <p>
          In our design the server is disposable, and that helps security. Think of servers as cattle,
          not pets. You do not nurse each one. The best way to patch them is to{" "}
          <strong>replace, not repair</strong>. On a schedule, rebuild from the latest AMI (the saved
          server disk image) and the latest app image. Then servers never collect drift (small
          unplanned changes) or old security holes.
        </p>
        <ul>
          <li>
            <strong>Automatic OS security updates</strong> as a safety net for servers that live a
            long time.
          </li>
        </ul>
        <p>
          Install the <code>unattended-upgrades</code> package in the user-data script (the script that
          runs when the server first boots) and enable it. Then Ubuntu applies security updates by
          itself every day.
        </p>
        <ul>
          <li>
            <strong>Replace servers regularly.</strong> Run an instance refresh (Lesson 12) at least
            once a month, even when the code has not changed. Then servers get the latest AMI and OS
            patches. A scheduled GitHub Actions workflow can do this for you.
          </li>
          <li>
            <strong>IMDSv2 required</strong> (set since Lesson 7). IMDS is the instance metadata
            service. A server can ask it for its own details, including temporary credentials.
            Version 2 needs a session token, so a bug in your app cannot easily be turned into
            credential theft. Check this on every instance.
          </li>
        </ul>
        <p>
          In the EC2 instance list, add the <em>IMDSv2</em> column. Every instance should say{" "}
          <strong>Required</strong>. Any instance that says <em>Optional</em> still accepts the old,
          weaker version. Fix it in place: choose Actions, then Instance settings, then Modify
          instance metadata options.
        </p>
        <ul>
          <li>
            <strong>Encrypted disks by default.</strong> In the EC2 settings, turn on &ldquo;EBS
            encryption by default&rdquo; for the region (EBS is the disk service for EC2). Then no
            disk is ever created without encryption. The command is{" "}
            <code>aws ec2 enable-ebs-encryption-by-default</code>. It applies to one region at a
            time.
          </li>
          <li>
            <strong>An instance role with least privilege.</strong> Review <code>myapp-ec2-role</code>.
            It should read its own parameters, pull its own image and write its own logs. It should do
            nothing else.
          </li>
        </ul>

        <h2 id="secrets">Layer 5 — secrets management</h2>
        <p>
          A secret is anything that gives access. Examples are database passwords, API keys, signing
          keys and tokens. Here is a ladder of practices, from worst to best:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Where the secret lives</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Hard-coded in source, committed to Git</td><td className="font-semibold text-red-300">It leaks the day the repository is shared. Never do this</td></tr>
              <tr><td>Baked into a Docker image or a build argument</td><td className="font-semibold text-red-300">Anyone who can pull the image can read it</td></tr>
              <tr><td>A .env file copied to the server by hand</td><td className="text-amber-300">It works, but there is no audit trail and no rotation. It is easy to lose, and it differs from server to server</td></tr>
              <tr><td>SSM Parameter Store SecureString (an encrypted parameter), read at boot with the instance role</td><td className="font-semibold text-emerald-300">Good: encrypted, controlled by IAM, audited and free</td></tr>
              <tr><td>Secrets Manager with automatic rotation</td><td className="font-semibold text-emerald-300">Best for database passwords. It changes them on a schedule</td></tr>
            </tbody>
          </table>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>SSM Parameter Store</th>
                <th>Secrets Manager</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Price</strong></td><td className="font-semibold text-emerald-300">Free (standard parameters)</td><td>About $0.40 per secret per month, plus API calls</td></tr>
              <tr><td><strong>Automatic rotation</strong></td><td>No (you must build it yourself)</td><td className="font-semibold text-emerald-300">Yes, built in for RDS and other services</td></tr>
              <tr><td><strong>Best for</strong></td><td>App settings and most secrets</td><td>Database credentials and anything that must be rotated</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Our setup already uses Parameter Store (Lesson 12). The upgrade worth making is for the
          database password. Let RDS manage it in Secrets Manager with rotation. Then it never appears
          in the Terraform state, in chat messages or on anyone&apos;s clipboard.
        </p>
        <p>
          In RDS, choose Modify and tick <strong>Manage master credentials in AWS Secrets
          Manager</strong>. RDS creates the secret and rotates it. The app, or its boot script, reads
          the secret with permission from its role. The password never has to be copied anywhere.
        </p>
        <Callout kind="ok" label="Rotation is the real prize">
          <p className="mb-0">
            A secret that never changes is quietly copied to more places every year. Rotation means
            replacing a secret with a new one on a schedule. It limits how long a leaked secret stays
            useful. It also forces you to know where each secret is used. If rotating a credential
            feels risky, that risk is itself a problem you have found.
          </p>
        </Callout>

        <h2 id="data">Layer 6 — data: encryption and access</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>At rest</th>
                <th>In transit</th>
                <th>Also</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>RDS</strong></td><td>Storage encryption on (Lesson 8; you cannot add it later to an existing instance)</td><td>TLS enforced (the default in Postgres 15 and later)</td><td>Private subnet, deletion protection, and database users with least privilege</td></tr>
              <tr><td><strong>S3</strong></td><td>Default encryption (on by default now)</td><td>Deny requests that do not use TLS, in the bucket policy</td><td>Block Public Access and versioning</td></tr>
              <tr><td><strong>EBS disks</strong></td><td>Encrypted (the default-on setting above)</td><td>—</td><td>Encrypted snapshots</td></tr>
              <tr><td><strong>ElastiCache</strong></td><td>At-rest encryption on (Lesson 16)</td><td>TLS + AUTH</td><td>Private subnet</td></tr>
              <tr><td><strong>Between the browser and you</strong></td><td>—</td><td>HTTPS only, redirect HTTP, and HSTS (a header that tells browsers to always use HTTPS; Lesson 10)</td><td>Secure and HttpOnly cookies</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Encryption at rest means data is encrypted while stored on disk. It protects you from a
          stolen disk or snapshot. It does <em>not</em> protect you from a compromised application,
          because the app can read the decrypted data. That layer is access control, which decides
          who and what may read which rows, files and keys. Here are two points for a multi-tenant
          product (one app that serves many customers):
        </p>
        <ul>
          <li>
            <strong>Tenant isolation is a security control, not an extra feature.</strong> Every
            query filters by tenant. Consider PostgreSQL row-level security as a second layer. It is a
            database rule that limits which rows a user can see. It still protects you if a developer
            forgets a <code>WHERE</code> clause. S3 keys and cache keys also include the tenant
            (Lessons 11, 16).
          </li>
          <li>
            <strong>Force TLS on the bucket.</strong> Add a deny statement for requests where{" "}
            <code>aws:SecureTransport</code> is false.
          </li>
        </ul>

        <h2 id="app">Layer 7 — the application and its dependencies</h2>
        <p>
          Infrastructure controls cannot fix a vulnerable app. These habits give the most protection
          for the least effort:
        </p>
        <ul>
          <li>
            <strong>Keep dependencies up to date.</strong> A dependency is a package that your code
            uses. Turn on <strong>Dependabot</strong> (<code>.github/dependabot.yml</code>). It opens
            update requests for npm packages, GitHub Actions and Docker base images. Most breaches
            through code use flaws that were fixed months earlier.
          </li>
          <li>
            <strong>Scan in the pipeline.</strong> Add <code>pnpm audit --prod</code> and an image
            scan as CI steps. For the image scan use <code>trivy image</code> or ECR scan-on-push from
            Lesson 9. Make the build fail on serious findings.
          </li>
          <li>
            <strong>Follow the basics of the OWASP Top 10.</strong> OWASP publishes a list of the ten
            most common web security risks. Validate input. Use parameterised queries, where the
            values are sent separately from the SQL text, and never build SQL from strings. Escape
            output. Check authorisation on <em>every</em> request. Authorisation means checking that
            the user may access <em>this</em> record, not only that the user is logged in. Set secure
            cookies. Add security headers (Lesson 10).
          </li>
          <li>
            <strong>Do not trust the client.</strong> The browser can send anything. Checks on the
            server are the only real checks. A hidden button is not access control.
          </li>
          <li>
            <strong>Pin and review code from other people.</strong> Pin means to fix an exact
            version. This includes GitHub Actions (Lesson 14) and the <code>curl | bash</code>{" "}
            installers that you copy from the internet.
          </li>
        </ul>

        <h2 id="detect">Layer 8 — detection: CloudTrail, GuardDuty, Config</h2>
        <p>
          You cannot respond to what you cannot see. Here are three AWS services, in order of
          importance:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>What it does</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>CloudTrail</strong></td>
                <td>The audit log. It records every API call in your account: who, what, when and from which IP. You cannot investigate an incident without it</td>
                <td>The last 90 days of management events are free automatically. A trail that saves them to S3 for longer is almost free for one copy</td>
              </tr>
              <tr>
                <td><strong>GuardDuty</strong></td>
                <td>Watches CloudTrail, DNS and network logs and compares them with lists of known threats. Examples: &ldquo;this key is being used from an IP linked to crypto-mining&rdquo; and &ldquo;this server is talking to a known malware host&rdquo;</td>
                <td>30-day free trial, then pay for what you use: roughly $5 to $20 a month for a small account</td>
              </tr>
              <tr>
                <td><strong>AWS Config</strong></td>
                <td>Records the settings of your resources over time and flags rule violations. Examples: &ldquo;this bucket became public&rdquo; and &ldquo;this Security Group opened port 22 to the world&rdquo;</td>
                <td>You pay for each rule and each recorded change. It can add up, so start with a few rules</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ol>
          <li>
            <strong>CloudTrail:</strong> create a trail for all regions. Deliver it to a new S3
            bucket with tight access rules. Turn on <em>log file validation</em>, so you can tell if
            anyone changes the log files.
          </li>
          <li>
            <strong>GuardDuty:</strong> choose Get started, then Enable. Then send its findings to
            the same SNS topic as your alarms (Lesson 17).
          </li>
        </ol>
        <p>
          Send GuardDuty findings to the alerts topic with an EventBridge rule (EventBridge is the AWS
          service that reacts to events). Use <code>source: aws.guardduty</code> and a severity of 7
          or higher. Then a serious finding reaches a person in the same way as a 5xx alarm. Also
          set an <strong>alarm on root user login</strong>. Use a CloudTrail metric filter on{" "}
          <code>userIdentity.type = Root</code>. The root user should almost never sign in.
        </p>

        <h2 id="backups">Backups: the part that saves the company</h2>
        <p>
          Hardening lowers the chance of a disaster. Backups lower its <em>cost</em>. Think of
          ransomware (malware that locks your data and demands money), a bad migration, a deleted
          table, a hacked admin account or a region outage. The answer is the same for all of them: a
          recent, separate, tested copy.
        </p>
        <Callout kind="note" label="The 3-2-1 rule">
          <p className="mb-0">
            Keep <strong>3</strong> copies of your data, on <strong>2</strong> different kinds of
            storage, with <strong>1</strong> copy in another place. In AWS terms, you have the live
            data, a backup in the same region, and a copy in <em>another region or another
            account</em>. A hacked production login must not be able to delete that last copy.
          </p>
        </Callout>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>What</th>
                <th>How it is protected</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>RDS database</strong></td>
                <td>Automatic daily backups and point-in-time restore (set to 7 to 35 days, Lesson 8). A manual snapshot before risky changes. A <strong>copy of the snapshot in another region</strong></td>
                <td>This is the most valuable data you have. Automatic backups are deleted with the instance unless you choose to keep them. Manual snapshots are not deleted</td>
              </tr>
              <tr>
                <td><strong>S3 uploads</strong></td>
                <td>Versioning (lets you undo overwrites and deletes). A lifecycle rule that removes old versions. <strong>Cross-region replication</strong> (automatic copying) to a second bucket</td>
                <td>Consider Object Lock for data that nobody may change or delete</td>
              </tr>
              <tr>
                <td><strong>Servers</strong></td>
                <td>Nothing to back up. You rebuild them from the image, the launch template and Terraform</td>
                <td>This is the reward for the stateless design (Lessons 8, 11, 12)</td>
              </tr>
              <tr>
                <td><strong>Configuration and infrastructure</strong></td>
                <td>Terraform code in Git, and a state bucket with versioning (Lesson 15)</td>
                <td>Also keep a copy of your secrets offline, in a password manager</td>
              </tr>
              <tr>
                <td><strong>Redis</strong></td>
                <td>Usually none, because it is a cache. If sessions matter, use a replica with failover</td>
                <td>If losing it would be a disaster, the data is stored in the wrong place</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3>Put it on autopilot with AWS Backup</h3>
        <p>
          <strong>AWS Backup</strong> is one service where you manage backup schedules, retention
          times and copies for RDS, EBS, S3, DynamoDB and more. It stores backups in a{" "}
          <strong>vault</strong>. You can lock a vault so that even an administrator cannot delete the
          recovery points. This is a real defence against ransomware and against bad insiders. Here is
          a small but useful plan for this architecture:
        </p>
        <ul>
          <li>Daily backups of the RDS instance, kept for 35 days.</li>
          <li>Weekly backups kept for 12 months. Add a monthly backup kept for 7 years if the law or your rules require it.</li>
          <li>A copy of each backup in a vault in a second region (for example <code>ap-southeast-1</code>).</li>
          <li>Backup Vault Lock in compliance mode. Turn it on once you are sure about your retention times.</li>
        </ul>
        <ul>
          <li>Copy an important RDS snapshot to a second region (choose Actions, then Copy snapshot).</li>
          <li>Keep versioning on for every bucket that holds user data (Lesson 11).</li>
        </ul>
        <Callout kind="warn" label="Backups in the same account can be deleted by the same attacker">
          <p className="mb-0">
            If an attacker steals an admin login, they can delete the database <em>and</em> its
            backups at the same time. The strongest protection is a copy in a{" "}
            <strong>separate AWS account</strong> that production credentials cannot touch. You can
            set this up with AWS Organizations, using a &ldquo;backup&rdquo; account. A locked vault
            also helps. A small company should at least keep a copy in another region and protect the
            accounts that can delete it with MFA.
          </p>
        </Callout>

        <h2 id="restore">Test the restore — the drill</h2>
        <p>
          <strong>A backup that you have never restored is a hope, not a backup.</strong> Backups
          fail quietly, in boring ways. The wrong database was included. The encryption key was
          deleted. The restore takes nine hours instead of one. The instructions are in the head of
          someone who has left. The only way to find out is to practise on a calm day.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Step</th>
                <th>Do</th>
              </tr>
            </thead>
            <tbody>
              {restoreSteps.map(([s, d], i) => (
                <tr key={s}>
                  <td className="whitespace-nowrap"><strong>{i + 1}. {s}</strong></td>
                  <td>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ol>
          <li>
            Restore the production database to a <strong>new</strong> instance called{" "}
            <code>myapp-db-drill</code>, at the latest restorable time (Lesson 8). Production is not
            touched. Note how long it takes. That is your real recovery time.
          </li>
          <li>
            Connect to the drill copy from an app server. Check that the data is really there. Count
            the rows and look at the newest <code>created_at</code> value.
          </li>
          <li>Delete the drill instance so it stops billing.</li>
        </ol>
        <p>
          Do this every quarter and after any major change. The time it took is your real RTO. It is
          usually longer than the one in your head. For the object store (S3), also practise
          &ldquo;restore a deleted file&rdquo;. Delete a test object, then bring it back from the
          previous version in the console.
        </p>

        <h2 id="incident">When a key leaks: the first hour</h2>
        <p>
          Sooner or later this will happen to someone on your team. If the steps are written down, a
          stressful moment becomes a checklist. Follow these steps in order:
        </p>
        <ol className="steps">
          <li>
            <h3>Contain — deactivate, do not delete yet</h3>
            <CommandList
              title="Kill the credential"
              commands={[
                { cmd: "aws iam update-access-key --user-name <USER> --access-key-id <AKIA…> --status Inactive", note: "Deactivating stops the key at once and keeps the evidence. You can delete it later" },
              ]}
            />
            <p>
              Then attach an explicit <em>Deny everything</em> policy to that identity. An explicit
              deny always wins (Lesson 5). Also check that the attacker did not create a second key for
              themselves.
            </p>
          </li>
          <li>
            <h3>Find out what the key did</h3>
            <p>
              In CloudTrail, open Event history and filter by the access key ID (or the user name). Look
              for actions that you did not do. Examples are new users or keys, new instances (often
              used for crypto-mining), changed Security Groups, S3 downloads, snapshot copies to
              unknown accounts, and changes in <em>other regions</em>. Attackers like regions that you
              never look at.
            </p>
          </li>
          <li>
            <h3>Remove what they left behind</h3>
            <p>
              Terminate instances that you do not know. Delete users, roles and keys that you do not
              know. Review Security Groups and bucket policies. Check for new IAM roles that trust an
              outside account. If you are in doubt, treat the whole account as unsafe. Rotate everything
              that the leaked identity could reach, including the database password and the
              application secrets.
            </p>
          </li>
          <li>
            <h3>Tell people, then write it up</h3>
            <p>
              If customer data may have been accessed, the law may require you to report it by a
              deadline. Open a case with AWS Support. They can help, and they sometimes waive the charges
              from fraudulent use if you act quickly. Then hold a blameless post-mortem, a review that
              looks for causes and not for someone to blame. Ask how the key leaked, and which control
              would have stopped it.
            </p>
          </li>
        </ol>

        <h2 id="checklist">The hardening checklist</h2>
        <p>Copy this into your repository. Every line is something that you have already met in the series:</p>
        <Script
          title="SECURITY-CHECKLIST.md"
          code={`## Identity
[ ] Root user: MFA on, no access keys, not used (credential report clean)
[ ] MFA required (by policy) for every human; humans use SSO / IAM Identity Center
[ ] No long-lived access keys on servers or in CI (roles + OIDC)
[ ] Any remaining keys are less than 90 days old, each with a named owner
[ ] Leavers removed the same day; access reviewed every quarter
[ ] GitHub secret scanning and push protection on

## Network
[ ] Only the ALB accepts traffic from 0.0.0.0/0 (ports 80 and 443)
[ ] Port 22 closed; access through SSM Session Manager
[ ] DB and cache in private subnets, no public IP, reachable only from web-sg
[ ] WAF (managed core rule set) on the ALB / CloudFront

## Servers
[ ] IMDSv2 required on every instance
[ ] EBS encryption by default; unattended security upgrades on
[ ] Servers rebuilt from a fresh AMI and image at least every month
[ ] Instance role is least-privilege (reviewed with Access Analyzer)

## Secrets and data
[ ] No secrets in Git, images or build args; all in SSM / Secrets Manager
[ ] DB password managed and rotated by Secrets Manager
[ ] RDS, S3, EBS, Redis encrypted at rest; TLS everywhere in transit
[ ] S3 Block Public Access on at the account level
[ ] Every query, cache key and S3 key is tenant-scoped

## App
[ ] Dependabot, pnpm audit and image scan in CI (fail on high severity)
[ ] Authorisation checked on every request, not only the login

## Detection
[ ] CloudTrail multi-region trail with log validation
[ ] GuardDuty on, findings routed to the alerts topic
[ ] Alarm on root login and on unusual spend

## Backups
[ ] RDS backups kept 7 to 35 days, plus a manual snapshot before risky changes
[ ] Cross-region copy of RDS snapshots; S3 versioning and replication
[ ] Backups protected from deletion (locked vault / separate account)
[ ] Restore drill done this quarter; RTO measured and written down
[ ] Key-leak runbook written and its steps rehearsed`}
        />

        <h2 id="cost">What this costs</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Approximate price</th></tr>
            </thead>
            <tbody>
              <tr><td>IAM, MFA, Access Analyzer, Session Manager, Parameter Store</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>CloudTrail management events, one trail</td><td className="font-semibold text-emerald-300">Free (plus a few cents of S3)</td></tr>
              <tr><td>GuardDuty</td><td>30 days free, then about $5 to $20 a month for a small account</td></tr>
              <tr><td>Secrets Manager</td><td>About $0.40 per secret per month</td></tr>
              <tr><td>AWS WAF</td><td>About $5 per web ACL, plus $1 per rule, plus $0.60 per million requests</td></tr>
              <tr><td>RDS automated backups (up to DB size)</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>RDS snapshots / cross-region copies</td><td>About $0.095 per GB per month, plus the cost of transfer between regions</td></tr>
              <tr><td>S3 versioning + replication</td><td>Storage for each copy, plus the cost of replication transfer</td></tr>
              <tr><td>Dependabot, secret scanning (public repos)</td><td className="font-semibold text-emerald-300">Free</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The most valuable items are free: MFA, no keys, no port 22, private data stores, Access
          Analyzer and CloudTrail. Everything that costs money here costs less per month than an hour
          of an engineer&apos;s time. That is far cheaper than one incident.
        </p>

        <h2 id="interview">Interview corner</h2>
        <InterviewQA
          items={[
            {
              q: "What is the shared responsibility model?",
              a: (
                <p className="mb-0">
                  AWS secures the cloud itself. That means the buildings, the hardware, the hypervisor
                  and the software of managed services. The customer secures what they put in the cloud.
                  That means identities and permissions, network rules, OS and application patching on
                  EC2, decisions about data and encryption, and configuration. Managed services move the
                  line up, but they never remove the customer&apos;s side.
                </p>
              ),
            },
            {
              q: "How do you give engineers shell access to production servers securely?",
              a: (
                <p className="mb-0">
                  I use Session Manager instead of SSH. It needs no inbound ports and no shared key
                  pairs. IAM controls access, with MFA. Sessions are logged in CloudTrail and can also be
                  recorded. To remove someone&apos;s access, I remove their IAM permission.
                </p>
              ),
            },
            {
              q: "Where do you store application secrets on AWS?",
              a: (
                <p className="mb-0">
                  In SSM Parameter Store (SecureString) or in Secrets Manager. The app reads them at run
                  time through the IAM role of the instance or task. I never put them in code, images or
                  build arguments. I use Secrets Manager for credentials that need automatic rotation,
                  such as database passwords.
                </p>
              ),
            },
            {
              q: "An access key was pushed to a public repo. What do you do?",
              a: (
                <p className="mb-0">
                  I deactivate the key at once and add a deny policy. I read CloudTrail for everything the
                  key did, in all regions. I remove any resources or credentials that the attacker
                  created. I rotate everything that the key could reach. I report the incident if the law
                  requires it. Then I add controls such as secret scanning and a move to roles. Deleting
                  the commit does not undo the exposure.
                </p>
              ),
            },
            {
              q: "Explain RPO and RTO and how they drive your backup design.",
              a: (
                <p className="mb-0">
                  RPO is the most data loss I can accept. It decides how often I back up and whether I
                  need point-in-time restore. RTO is the longest downtime I can accept. It decides the
                  restore method: Multi-AZ failover, snapshot restore or a rebuild in another region. I
                  measure the real RTO by practising restores.
                </p>
              ),
            },
            {
              q: "How would you protect backups from ransomware or a compromised admin?",
              a: (
                <p className="mb-0">
                  I use backups that cannot be changed (immutable) in locked vaults, with AWS Backup
                  Vault Lock or S3 Object Lock. I keep copies in a separate account and region that
                  production credentials cannot delete. I require MFA for deletes. And I test restores
                  regularly.
                </p>
              ),
            },
            {
              q: "Security Groups are open only to the ALB, and the app still leaked data. What might have happened?",
              a: (
                <p className="mb-0">
                  Flaws in the application go straight through network controls. Examples are broken
                  authorisation, injection, a vulnerable dependency, or an instance role with too many
                  permissions. Broken authorisation is often called IDOR (insecure direct object
                  reference). It lets a user read another tenant&apos;s record by changing an ID in the
                  request. The fixes are an authorisation check on every request, tenant scoping,
                  dependency scanning and roles with least privilege.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 19</h2>
        <ol>
          <li>
            Run the credential report. Write down every finding, such as missing MFA, old keys and
            unused users. Fix each one.
          </li>
          <li>
            Check your Security Groups as described above. List everything that is open to the
            internet. Explain why each item is needed, or close it.
          </li>
          <li>
            Attach the SSM policy to the instance role and connect with{" "}
            <code>start-session</code>. Then remove the port 22 rule and delete the key pair from the
            launch template.
          </li>
          <li>
            Turn on CloudTrail, GuardDuty and IAM Access Analyzer. Read the first findings.
          </li>
          <li>
            Move the database password to RDS-managed Secrets Manager. Update the boot script so that
            it reads the password from there.
          </li>
          <li>
            Run the restore drill. Restore to a point in time into a new instance, check the data,
            record the time it took and delete the copy. Then delete a test S3 object and restore it
            from its earlier version.
          </li>
          <li>
            Write the key-leak runbook for your team in ten lines. Then ask a teammate to read it and
            say what is unclear.
          </li>
          <li>
            Copy the checklist into your repository. Tick every box that you can honestly tick. The
            boxes you cannot tick are next quarter&apos;s work.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Hold a game-day, which is a planned practice of an incident. Ask a teammate to
            &ldquo;leak&rdquo; a test key with few permissions into a private repository. See how long
            secret scanning, GuardDuty or CloudTrail takes to show it. The gap between what you
            expected and what happened is your plan for improvement.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          A secure system is not one that cannot be attacked. It is one where each layer limits the
          damage that gets past the layer before it. Problems are visible quickly, and recovery is a
          practised routine.
        </p>
        <ul>
          <li>
            <strong>Identity first.</strong> Use MFA for people and roles for machines. Have no
            long-lived keys. Give least privilege. Remove leavers on the same day.
          </li>
          <li>
            <strong>Shrink the attack surface.</strong> Only the ALB is public. Data stores are
            private. Close port 22 and use Session Manager.
          </li>
          <li>
            <strong>Treat servers as cattle.</strong> Rebuild them regularly. Use IMDSv2, encrypted
            disks and automatic security updates.
          </li>
          <li>
            <strong>Keep secrets in a secret store</strong> and rotate them. Use encryption at rest
            and in transit. Scope everything by tenant.
          </li>
          <li>
            <strong>Detect</strong> problems with CloudTrail, GuardDuty and alerts.{" "}
            <strong>Recover</strong> with layered, protected and tested backups and a written incident
            routine.
          </li>
        </ul>
        <p>
          The system is secure, observable and recoverable. One question remains. What does all of it
          cost, and how do you keep the bill under control? That is the final lesson.
        </p>

        <hr />
        <p>
          End of Lesson 18. Next:{" "}
          <strong>Lesson 19 — Cost Review and Final Production Architecture</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
