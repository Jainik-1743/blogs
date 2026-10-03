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
  ["Leaked credentials", "Access keys in a public repo, a .env in a Docker image, a laptop stolen with the CLI logged in", "Roles instead of keys (Lessons 5, 14), MFA, secret scanning, rotate on any doubt"],
  ["Exposed services", "A database, Redis or SSH open to 0.0.0.0/0; an S3 bucket set public", "Private subnets, Security Group references, Block Public Access, no port 22"],
  ["Unpatched software", "A server or npm dependency with a known, publicly exploited flaw", "Automatic OS updates, dependency scanning, rebuild images often"],
  ["Weak or shared access", "One admin login used by five people; ex-staff still have access; no MFA", "Individual identities, least privilege, review access quarterly, remove leavers same day"],
  ["No backups (or untested ones)", "Ransomware, a bad migration, or a mistaken delete, and nothing to restore", "Automated backups, versioning, off-account copies, a rehearsed restore"],
];

const restoreSteps: [string, string][] = [
  ["Write the target", "RPO: how much data you can lose (e.g. 15 min). RTO: how long you can be down (e.g. 1 hour)."],
  ["Restore to a NEW instance", "Never overwrite production. Restore a snapshot or point in time to a fresh database."],
  ["Prove the data is right", "Connect, count rows in your key tables, open a recent record you know."],
  ["Time it", "How long did the whole thing take, end to end, including finding the instructions?"],
  ["Fix the runbook", "Write down every surprise. The next person (or you, tired) will follow it."],
  ["Clean up", "Delete the drill instance so it does not bill."],
];

export default function LessonEighteenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          Security is not a product you switch on; it is the habit of making every part of the system
          hard to misuse and cheap to recover. The two halves of this lesson are two questions:
        </p>
        <ul>
          <li>
            <strong>Hardening</strong> — &ldquo;how do I make it hard for the wrong person to do
            harm?&rdquo;
          </li>
          <li>
            <strong>Backups</strong> — &ldquo;when something bad happens anyway, how do I get back?&rdquo;
          </li>
        </ul>
        <Callout kind="note" label="The analogy — a castle">
          <p className="mb-0">
            A castle is not safe because of one thick wall. It has a moat, walls, a gatehouse, guards who
            check who enters, locked inner rooms, a lookout, and — because sieges sometimes succeed — a
            hidden store of food and a rehearsed escape route. This is called{" "}
            <strong>defence in depth</strong>: assume any single layer will eventually fail, and make sure
            the next one holds.
          </p>
        </Callout>
        <Callout kind="ok" label="A useful mindset: assume breach">
          <p className="mb-0">
            Do not ask &ldquo;could someone get in?&rdquo; — ask &ldquo;<em>when</em> one credential or one
            server is compromised, how far can it go, and how quickly would we notice?&rdquo; Everything
            below is an answer to that question: small blast radius, fast detection, easy recovery.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>
          You now hold your customers&apos; data, their logins and their payments. The consequences of
          getting this wrong are not abstract: breach notification laws (DPDP in India, GDPR in Europe),
          lost customer trust, and often the end of a small company. And attackers do not target you
          personally — they scan the whole internet automatically. A server with a weak point is found in
          minutes, not months.
        </p>
        <p>
          The encouraging part: the large majority of real incidents come from a short list of ordinary
          mistakes. Fix that list and you are safer than most companies.
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
              <tr><td><strong>EC2 servers</strong></td><td>Nothing inside the OS</td><td>OS patches, SSH, firewall, your app, the data</td></tr>
              <tr><td><strong>RDS / ElastiCache</strong></td><td>OS and database engine patching, hardware</td><td>Who can connect, users and passwords, encryption choice, backups retention, your queries</td></tr>
              <tr><td><strong>S3</strong></td><td>Durability and the service itself</td><td>Bucket policies, public access, encryption, what you put in it</td></tr>
              <tr><td><strong>IAM</strong></td><td>The service works correctly</td><td>Every policy, key, user and role: all of it</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          AWS reports that the overwhelming majority of cloud breaches are customer misconfiguration, not
          AWS failures. The right-hand column is your job.
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
          Notice how much of it you have already done: roles instead of keys (Lesson 5), private
          databases (6, 8), private buckets (11), a scoped deploy role (14). This lesson closes the
          remaining gaps and adds detection and recovery.
        </p>

        <h2 id="identity">Layer 1 — identity: keys, MFA, roles</h2>
        <p>
          Identity is the front door, and the most common one attackers use. Audit it with AWS&apos;s
          own tool, then apply the rules:
        </p>
        <ul>
          <li>
            IAM → <strong>Credential report</strong>: a CSV of every user — password age, MFA on/off,
            access-key age and last use. Look for no MFA, keys older than 90 days, keys never used.
          </li>
          <li>
            The user list itself: does each person still work here? Does each identity need to
            exist?
          </li>
          <li>
            IAM <strong>Access Analyzer</strong> (free): finds buckets, roles and keys shared outside
            your account, and can generate least-privilege policies from real usage.
          </li>
        </ul>
        <ul>
          <li>
            <strong>Root user:</strong> MFA on (Lesson 0), no access keys, never used. Verify with the
            credential report — the <code>&lt;root_account&gt;</code> row must show{" "}
            <code>access_key_1_active = false</code>.
          </li>
          <li>
            <strong>MFA for every human</strong>, preferably a hardware key or passkey. A password-only
            AWS login is a single guess away from total loss.
          </li>
          <li>
            <strong>Humans use IAM Identity Center (SSO); machines use roles.</strong> Any long-lived
            access key that remains should be rotated, scoped to the minimum, and have an owner.
          </li>
          <li>
            <strong>Remove people the day they leave</strong> — this is why groups matter (Lesson 5): one
            command, one person, zero leftover access.
          </li>
          <li>
            <strong>Review permissions with real data.</strong> IAM shows &ldquo;last accessed&rdquo; per
            service; a policy granting 40 services where 3 are used is a policy to shrink.
          </li>
        </ul>
        <Callout kind="warn" label="Force MFA with a policy, not a request">
          <p className="mb-0">
            Asking people to enable MFA is a wish. A policy that <strong>denies everything except
            managing their own MFA</strong> until they have signed in with it is a control (AWS
            publishes a ready-made example, &ldquo;Allow users to manage their own MFA&rdquo;, with a{" "}
            <code>BoolIfExists aws:MultiFactorAuthPresent = false</code> deny). Attach it to the{" "}
            <code>Developers</code> group.
          </p>
        </Callout>
        <h3>Stop secrets reaching Git at all</h3>
        <ul>
          <li>
            Turn on <strong>GitHub secret scanning and push protection</strong> (free for public repos,
            included with Advanced Security for private): it blocks a push that contains an AWS key.
          </li>
          <li>
            Add a pre-commit scanner such as <code>gitleaks</code> locally.
          </li>
          <li>
            AWS also scans public GitHub, and when it finds your key it quarantines it and emails you —
            but bots are faster than email. <strong>If a key ever reaches a public repo, it is
            compromised, no matter how quickly you deleted the commit.</strong> Rotate it.
          </li>
        </ul>

        <h2 id="network">Layer 2 — network: shrink the attack surface</h2>
        <p>
          The safest port is the one that is closed. Audit what is open to the world — it should be a very
          short list:
        </p>
        <p>
          In EC2 → Security Groups, look at every inbound rule with source <code>0.0.0.0/0</code>.
          For our design the <strong>only</strong> one should be <code>alb-sg</code> on 80/443. If{" "}
          <code>web-sg</code>, <code>db-sg</code> or <code>cache-sg</code> appears, or any group
          has 22, 5432 or 6379 open to the world: fix it now.
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
                <td>ALB: 80 and 443 only</td>
                <td>SSH (22), RDP (3389), databases (5432, 3306), Redis (6379), the app port (3000), Elasticsearch (9200), admin dashboards</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li>
            Databases and caches in <strong>private subnets</strong> with no public IP, reachable only
            from <code>web-sg</code> (Lessons 6, 8, 16).
          </li>
          <li>
            App servers accept traffic <strong>only from the ALB</strong> (Lesson 12); their public IPs
            exist for outbound access, not inbound.
          </li>
          <li>
            Add <strong>AWS WAF</strong> on the ALB or CloudFront for the common web attacks (SQL
            injection patterns, bad bots, rate limits by IP): about $5/month plus $1 per rule and $0.60
            per million requests. Start with the AWS-managed core rule set.
          </li>
          <li>
            Turn on <strong>VPC Flow Logs</strong> (to S3, cheap) so you can later answer &ldquo;who
            talked to this server?&rdquo;.
          </li>
        </ul>

        <h2 id="ssm">Layer 3 — no SSH: Session Manager</h2>
        <p>
          In Lesson 7 you opened port 22 to your IP. That is acceptable for learning and unwise for
          production: keys are files that get copied, your IP changes, and an open port 22 is what every
          scanner on earth probes. <strong>AWS Systems Manager Session Manager</strong> gives you a shell
          on an instance with <em>no open port, no key pair, no bastion host</em>: the server&apos;s SSM
          agent calls out to AWS, and you connect through your IAM identity.
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
              <tr><td><strong>Inbound port</strong></td><td>22 must be open</td><td className="font-semibold text-emerald-300">None</td></tr>
              <tr><td><strong>Credentials</strong></td><td>A .pem file to store and share</td><td className="font-semibold text-emerald-300">Your IAM/SSO login, with MFA</td></tr>
              <tr><td><strong>Who can access</strong></td><td>Anyone holding the key</td><td>Anyone your IAM policy names</td></tr>
              <tr><td><strong>Audit trail</strong></td><td>Only what you log yourself</td><td className="font-semibold text-emerald-300">Every session logged (CloudTrail, optionally full keystrokes to S3/CloudWatch)</td></tr>
              <tr><td><strong>Revoking access</strong></td><td>Rotate keys on every server</td><td className="font-semibold text-emerald-300">Remove the IAM permission</td></tr>
            </tbody>
          </table>
        </div>
        <ol className="steps">
          <li>
            <h3>Give the instance role permission to talk to SSM</h3>
            <p>
              Attach the AWS-managed policy <code>AmazonSSMManagedInstanceCore</code> to{" "}
              <code>myapp-ec2-role</code> (Lesson 14&apos;s migrations already need it). The agent
              is preinstalled on Ubuntu 24.04 images; it only needs this permission and outbound
              HTTPS. After a few minutes the instance shows as <em>Online</em> in Systems Manager →
              Fleet Manager.
            </p>
          </li>
          <li>
            <h3>Install the Session Manager plugin and connect</h3>
            <p>Install the Session Manager plugin for the AWS CLI on your laptop, then:</p>
            <CommandList
              title="On your laptop"
              commands={[
                { cmd: "aws ssm start-session --target i-0abc123def456", note: "A shell on the server — no port 22, no key pair. The console's Connect → Session Manager button does the same in the browser" },
              ]}
            />
            <p>
              The same command can also forward a port, which replaces Lesson 8&apos;s SSH tunnel to
              the database — with no SSH at all.
            </p>
          </li>
          <li>
            <h3>Close port 22 and drop the key pair</h3>
            <p>
              Once <code>start-session</code> works, delete the SSH rule from <code>web-sg</code>.
              New launch templates already omit the key pair (Lesson 12).
            </p>
          </li>
        </ol>

        <h2 id="host">Layer 4 — the server: patching and IMDSv2</h2>
        <p>
          The server is disposable in our design — which is a security feature. The best patching strategy
          for cattle is to <strong>replace, not repair</strong>: rebuild from the latest AMI and image on a
          schedule, and instances never accumulate drift or old vulnerabilities.
        </p>
        <ul>
          <li>
            <strong>Automatic OS security updates</strong> as a safety net for long-lived servers.
          </li>
        </ul>
        <p>
          Install the <code>unattended-upgrades</code> package in the user-data script and enable
          it, and Ubuntu applies security updates every day on its own.
        </p>
        <ul>
          <li>
            <strong>Roll fresh servers regularly.</strong> Run an instance refresh (Lesson 12) at least
            monthly even with no code change, so servers pick up the latest AMI and OS patches. A
            scheduled GitHub Actions workflow can do it.
          </li>
          <li>
            <strong>IMDSv2 required</strong> (set since Lesson 7): stops an app bug from being turned into
            credential theft. Verify on every instance.
          </li>
        </ul>
        <p>
          In the EC2 instance list, add the <em>IMDSv2</em> column: every instance should say{" "}
          <strong>Required</strong>. Anything that says <em>Optional</em> accepts the old, weaker
          protocol — fix it in place with Actions → Instance settings → Modify instance metadata
          options.
        </p>
        <ul>
          <li>
            <strong>Encrypted disks by default:</strong> in EC2 settings, turn on &ldquo;EBS encryption by
            default&rdquo; for the region so nothing is ever created unencrypted:{" "}
            <code>aws ec2 enable-ebs-encryption-by-default</code>.
          </li>
          <li>
            <strong>Least-privilege instance role.</strong> Review <code>myapp-ec2-role</code>: it should
            read its own parameters, pull its own image, write its own logs — and nothing else.
          </li>
        </ul>

        <h2 id="secrets">Layer 5 — secrets management</h2>
        <p>
          A secret is anything that grants access: database passwords, API keys, signing keys, tokens.
          There is a ladder of practice, from worst to best:
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
              <tr><td>Hard-coded in source, committed to Git</td><td className="font-semibold text-red-300">Leaked the day the repo is shared. Never</td></tr>
              <tr><td>Baked into a Docker image or a build argument</td><td className="font-semibold text-red-300">Readable by anyone who can pull the image</td></tr>
              <tr><td>A .env file copied to the server by hand</td><td className="text-amber-300">Works, but no audit, no rotation, easy to lose, differs per server</td></tr>
              <tr><td>SSM Parameter Store SecureString, read at boot with the instance role</td><td className="font-semibold text-emerald-300">Good: encrypted, IAM-controlled, audited, free</td></tr>
              <tr><td>Secrets Manager with automatic rotation</td><td className="font-semibold text-emerald-300">Best for database passwords: rotates them on a schedule</td></tr>
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
              <tr><td><strong>Price</strong></td><td className="font-semibold text-emerald-300">Free (standard parameters)</td><td>~$0.40 per secret per month + API calls</td></tr>
              <tr><td><strong>Automatic rotation</strong></td><td>No (build it yourself)</td><td className="font-semibold text-emerald-300">Yes, built in for RDS and others</td></tr>
              <tr><td><strong>Best for</strong></td><td>App config and most secrets</td><td>Database credentials, anything that must rotate</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Our setup already uses Parameter Store (Lesson 12). The upgrade that is worth doing is the
          database password: let RDS manage it in Secrets Manager with rotation, so it never appears in
          Terraform state, chat messages or anyone&apos;s clipboard.
        </p>
        <p>
          In RDS → Modify, tick <strong>Manage master credentials in AWS Secrets Manager</strong>.
          RDS creates the secret, rotates it, and the app (or its boot script) reads it with
          permission from its role — the password itself never has to be copied anywhere.
        </p>
        <Callout kind="ok" label="Rotation is the real prize">
          <p className="mb-0">
            A secret that never changes is a secret that has been quietly copied to more places every year.
            Rotation limits the useful life of any leak, and the practice of rotating keeps you honest
            about where secrets are used. If rotating a credential feels risky, that risk is itself
            the finding.
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
              <tr><td><strong>RDS</strong></td><td>Storage encryption on (Lesson 8; cannot be added later)</td><td>TLS enforced (Postgres 15+ default)</td><td>Private subnet, deletion protection, least-privilege DB users</td></tr>
              <tr><td><strong>S3</strong></td><td>Default encryption (on by default now)</td><td>Deny non-TLS in the bucket policy</td><td>Block Public Access, versioning</td></tr>
              <tr><td><strong>EBS disks</strong></td><td>Encrypted (default-on setting above)</td><td>—</td><td>Encrypted snapshots</td></tr>
              <tr><td><strong>ElastiCache</strong></td><td>At-rest encryption on (Lesson 16)</td><td>TLS + AUTH</td><td>Private subnet</td></tr>
              <tr><td><strong>The browser ↔ you</strong></td><td>—</td><td>HTTPS only, redirect HTTP, HSTS (Lesson 10)</td><td>Secure, HttpOnly cookies</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Encryption at rest protects against a stolen disk or snapshot; it does <em>not</em> protect
          against a compromised application, because the app can read the decrypted data. That layer is
          access control: who and what may read which rows, files and keys. Two specifics for a
          multi-tenant product:
        </p>
        <ul>
          <li>
            <strong>Tenant isolation is a security control, not a feature.</strong> Every query filters by
            tenant; consider PostgreSQL row-level security as a second layer that holds even if a
            developer forgets a <code>WHERE</code>. S3 keys and cache keys carry the tenant (Lessons 11, 16).
          </li>
          <li>
            <strong>Force TLS on the bucket</strong> with a deny statement for requests where{" "}
            <code>aws:SecureTransport</code> is false.
          </li>
        </ul>

        <h2 id="app">Layer 7 — the application and its dependencies</h2>
        <p>
          Infrastructure controls cannot fix a vulnerable app. Three habits give the most protection for
          the least effort:
        </p>
        <ul>
          <li>
            <strong>Update dependencies continuously.</strong> Turn on <strong>Dependabot</strong>{" "}
            (<code>.github/dependabot.yml</code>) for npm packages, GitHub Actions and Docker base images.
            Most breaches through code use flaws that were patched months earlier.
          </li>
          <li>
            <strong>Scan in the pipeline.</strong> Add <code>pnpm audit --prod</code> and an image scan
            (<code>trivy image</code>, or ECR scan-on-push from Lesson 9) as CI steps that fail the build on
            high-severity findings.
          </li>
          <li>
            <strong>Follow the OWASP Top 10 basics:</strong> validate and parameterise every query (no
            string-built SQL), escape output, check authorisation on <em>every</em> request (not just that
            the user is logged in — that they may access <em>this</em> record), set secure cookies, and add
            security headers (Lesson 10).
          </li>
          <li>
            <strong>Do not trust the client.</strong> The browser can send anything. Server-side checks are
            the only real checks; hidden buttons are not access control.
          </li>
          <li>
            <strong>Pin and review third-party code</strong> — including GitHub Actions (Lesson 14) and the
            <code> curl | bash</code> installers you copy from the internet.
          </li>
        </ul>

        <h2 id="detect">Layer 8 — detection: CloudTrail, GuardDuty, Config</h2>
        <p>
          You cannot respond to what you cannot see. Three AWS services, in order of importance:
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
                <td>The audit log: every API call in your account (who, what, when, from which IP). You cannot investigate an incident without it</td>
                <td>The last 90 days of management events are free automatically; a trail to S3 for long retention is ~free for one copy</td>
              </tr>
              <tr>
                <td><strong>GuardDuty</strong></td>
                <td>Watches CloudTrail, DNS and network logs with threat intelligence: &ldquo;this key is being used from a crypto-mining IP&rdquo;, &ldquo;this instance is talking to a known malware host&rdquo;</td>
                <td>30-day free trial, then usage-based: roughly $5–20/month for a small account</td>
              </tr>
              <tr>
                <td><strong>AWS Config</strong></td>
                <td>Records resource settings over time and flags violations: &ldquo;this bucket became public&rdquo;, &ldquo;this SG opened port 22 to the world&rdquo;</td>
                <td>Per rule and per recorded change; can add up, so start with a handful of rules</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ol>
          <li>
            <strong>CloudTrail</strong> → Create trail: all regions, delivered to a new, locked-down
            S3 bucket, with <em>log file validation</em> on so tampering is detectable.
          </li>
          <li>
            <strong>GuardDuty</strong> → Get started → Enable. Then send its findings to the same
            SNS topic as your alarms (Lesson 17).
          </li>
        </ol>
        <p>
          Send GuardDuty findings to the alerts topic through an EventBridge rule (<code>source:
          aws.guardduty</code>, severity ≥ 7) so a high-severity finding reaches a human the same way a
          5xx alarm does. Also set an <strong>alarm on root user login</strong> (a CloudTrail metric
          filter on <code>userIdentity.type = Root</code>): the root user should essentially never sign
          in.
        </p>

        <h2 id="backups">Backups: the part that saves the company</h2>
        <p>
          Hardening reduces the chance of a disaster. Backups reduce its <em>cost</em>. Ransomware,
          a bad migration, a deleted table, a compromised admin, a region outage: for all of them the
          answer is the same — a recent, separate, tested copy.
        </p>
        <Callout kind="note" label="The 3-2-1 rule">
          <p className="mb-0">
            <strong>3</strong> copies of your data, on <strong>2</strong> different kinds of storage,
            with <strong>1</strong> off-site. In AWS terms: the live data, a same-region backup, and a
            copy in <em>another region or another account</em> that a compromised production login cannot
            delete.
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
                <td>Automated daily backups + point-in-time restore (set to 7–35 days, Lesson 8); manual snapshot before risky changes; <strong>cross-region snapshot copy</strong></td>
                <td>The most valuable data you have. Automated backups vanish if you delete the instance; snapshots do not</td>
              </tr>
              <tr>
                <td><strong>S3 uploads</strong></td>
                <td>Versioning (undo overwrites/deletes); lifecycle to expire old versions; <strong>cross-region replication</strong> to a second bucket</td>
                <td>Consider Object Lock for data that must be tamper-proof</td>
              </tr>
              <tr>
                <td><strong>Servers</strong></td>
                <td>Nothing to back up: they are rebuilt from the image, launch template and Terraform</td>
                <td>This is the reward for stateless design (Lessons 8, 11, 12)</td>
              </tr>
              <tr>
                <td><strong>Configuration and infrastructure</strong></td>
                <td>Terraform code in Git; state bucket with versioning (Lesson 15)</td>
                <td>Also back up secrets somewhere offline in a password manager</td>
              </tr>
              <tr>
                <td><strong>Redis</strong></td>
                <td>Usually none: it is a cache. If sessions matter, a replica with failover</td>
                <td>If losing it would be a disaster, the data is in the wrong place</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3>Put it on autopilot with AWS Backup</h3>
        <p>
          <strong>AWS Backup</strong> is one console for backup schedules, retention and copies across
          RDS, EBS, S3, DynamoDB and more, with a <strong>vault</strong> that can be locked so even an
          administrator cannot delete recovery points (a real defence against ransomware and malicious
          insiders). A minimum viable plan for this architecture:
        </p>
        <ul>
          <li>Daily backups of the RDS instance, kept 35 days.</li>
          <li>Weekly backups kept 12 months, and a monthly one kept 7 years if compliance requires it.</li>
          <li>A copy of each to a vault in a second region (e.g. <code>ap-southeast-1</code>).</li>
          <li>Backup vault lock (compliance mode) once you are sure of your retention.</li>
        </ul>
        <ul>
          <li>Copy an important RDS snapshot to a second region (Actions → Copy snapshot).</li>
          <li>Keep versioning on for every bucket that holds user data (Lesson 11).</li>
        </ul>
        <Callout kind="warn" label="Backups in the same account can be deleted by the same attacker">
          <p className="mb-0">
            If an attacker steals an admin login, they delete the database <em>and</em> its backups in the
            same breath. The strongest protection is a copy in a <strong>separate AWS account</strong> that
            production credentials cannot touch (AWS Organizations, a &ldquo;backup&rdquo; account), or a
            locked vault. For a small company, at minimum keep a cross-region copy and MFA-protect the
            accounts that can delete it.
          </p>
        </Callout>

        <h2 id="restore">Test the restore — the drill</h2>
        <p>
          <strong>A backup you have never restored is a hope, not a backup.</strong> Backups fail silently
          in dull ways: the wrong database was included, the encryption key was deleted, the restore
          takes nine hours instead of one, the instructions are in the head of someone who left. The only
          way to find out is to practise, on a calm day.
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
            Restore the production database to a <strong>new</strong> instance{" "}
            <code>myapp-db-drill</code> at the latest restorable time (Lesson 8). Production is
            untouched. Note the time it takes — that is your real recovery time.
          </li>
          <li>
            Connect to the drill copy from an app server and check the data is really there: row
            counts, and the newest <code>created_at</code>.
          </li>
          <li>Delete the drill instance so it stops billing.</li>
        </ol>
        <p>
          Do this quarterly and after any major change. Note the time it took: that number is your real
          RTO, and it is usually larger than the one in your head. For the object store, practise
          &ldquo;restore a deleted file&rdquo;: delete a test object, then bring it back from the
          previous version in the console.
        </p>

        <h2 id="incident">When a key leaks: the first hour</h2>
        <p>
          It will happen to someone on your team eventually. Having the steps written down turns a stressful
          situation into a checklist. In order:
        </p>
        <ol className="steps">
          <li>
            <h3>Contain — deactivate, do not delete yet</h3>
            <CommandList
              title="Kill the credential"
              commands={[
                { cmd: "aws iam update-access-key --user-name <USER> --access-key-id <AKIA…> --status Inactive", note: "Deactivating stops it instantly and keeps the evidence. Deleting can come later" },
              ]}
            />
            <p>
              Then attach an explicit <em>Deny everything</em> policy to that identity (explicit deny
              always wins — Lesson 5), and check the attacker did not create a second key for
              themselves.
            </p>
          </li>
          <li>
            <h3>Find out what the key did</h3>
            <p>
              CloudTrail → Event history → filter by the access key ID (or user name). Look for actions you
              did not perform: new users or keys, new instances (crypto-mining), changed Security
              Groups, S3 downloads, snapshot copies to unknown accounts, and changes in{" "}
              <em>other regions</em> — attackers love regions you never look at.
            </p>
          </li>
          <li>
            <h3>Remove what they left behind</h3>
            <p>
              Terminate unknown instances, delete unknown users, roles and keys, review Security Groups
              and bucket policies, and check for new IAM roles that trust an outside account. When in
              doubt, treat the whole account as suspect and rotate everything reachable from the leaked
              identity, including the database password and application secrets.
            </p>
          </li>
          <li>
            <h3>Tell people, then write it up</h3>
            <p>
              If customer data may have been accessed you may have legal notification duties, on a
              deadline. Open a case with AWS Support (they help, and often waive charges from
              fraudulent usage if you act quickly). Then run a blameless post-mortem: how did it leak, and
              which control would have stopped it?
            </p>
          </li>
        </ol>

        <h2 id="checklist">The hardening checklist</h2>
        <p>Copy this into your repository. Every line is something you have already met in the series:</p>
        <Script
          title="SECURITY-CHECKLIST.md"
          code={`## Identity
[ ] Root user: MFA on, no access keys, not used (credential report clean)
[ ] MFA required (by policy) for every human; humans use SSO / IAM Identity Center
[ ] No long-lived access keys on servers or in CI (roles + OIDC)
[ ] Any remaining keys < 90 days old, each with a named owner
[ ] Leavers removed the same day; access reviewed quarterly
[ ] GitHub secret scanning + push protection on

## Network
[ ] Only the ALB accepts traffic from 0.0.0.0/0 (80/443)
[ ] Port 22 closed; access via SSM Session Manager
[ ] DB and cache in private subnets, no public IP, reachable only from web-sg
[ ] WAF (managed core rule set) on the ALB / CloudFront

## Servers
[ ] IMDSv2 required on every instance
[ ] EBS encryption by default; unattended security upgrades on
[ ] Servers rebuilt from a fresh AMI/image at least monthly
[ ] Instance role is least-privilege (reviewed with Access Analyzer)

## Secrets & data
[ ] No secrets in Git, images or build args; all in SSM / Secrets Manager
[ ] DB password managed and rotated by Secrets Manager
[ ] RDS, S3, EBS, Redis encrypted at rest; TLS everywhere in transit
[ ] S3 Block Public Access on at the account level
[ ] Every query, cache key and S3 key is tenant-scoped

## App
[ ] Dependabot + pnpm audit + image scan in CI (fail on high severity)
[ ] Authorisation checked on every request, not only authentication

## Detection
[ ] CloudTrail multi-region trail with log validation
[ ] GuardDuty on, findings routed to the alerts topic
[ ] Alarm on root login and on unusual spend

## Backups
[ ] RDS backups 7–35 days + manual snapshot before risky changes
[ ] Cross-region copy of RDS snapshots; S3 versioning + replication
[ ] Backups protected from deletion (locked vault / separate account)
[ ] Restore drill run this quarter; RTO measured and written down
[ ] Key-leak runbook written and its steps rehearsed`}
        />

        <h2 id="cost">What this costs</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Approx. price</th></tr>
            </thead>
            <tbody>
              <tr><td>IAM, MFA, Access Analyzer, Session Manager, Parameter Store</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>CloudTrail management events, one trail</td><td className="font-semibold text-emerald-300">Free (plus a few cents of S3)</td></tr>
              <tr><td>GuardDuty</td><td>30 days free, then ~$5–20/month small account</td></tr>
              <tr><td>Secrets Manager</td><td>~$0.40 per secret per month</td></tr>
              <tr><td>AWS WAF</td><td>~$5 web ACL + $1 per rule + $0.60 per million requests</td></tr>
              <tr><td>RDS automated backups (up to DB size)</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>RDS snapshots / cross-region copies</td><td>~$0.095 per GB-month + transfer between regions</td></tr>
              <tr><td>S3 versioning + replication</td><td>Storage for each copy + replication transfer</td></tr>
              <tr><td>Dependabot, secret scanning (public repos)</td><td className="font-semibold text-emerald-300">Free</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The high-value items are free: MFA, no keys, no port 22, private data stores, Access Analyzer,
          CloudTrail. Everything paid here costs less than an hour of an engineer&apos;s time per month —
          far cheaper than one incident.
        </p>

        <h2 id="interview">Interview corner</h2>
        <InterviewQA
          items={[
            {
              q: "What is the shared responsibility model?",
              a: (
                <p className="mb-0">
                  AWS secures the cloud itself: facilities, hardware, hypervisor and the managed service
                  software. The customer secures what they put in it: identities and permissions, network
                  rules, OS and application patching on EC2, data classification and encryption choices,
                  and configuration. Managed services move the boundary up but never remove the
                  customer&apos;s side.
                </p>
              ),
            },
            {
              q: "How do you give engineers shell access to production servers securely?",
              a: (
                <p className="mb-0">
                  Session Manager instead of SSH: no inbound ports or shared key pairs, access controlled
                  through IAM with MFA, sessions logged to CloudTrail and optionally recorded. Remove
                  access by removing the IAM permission.
                </p>
              ),
            },
            {
              q: "Where do you store application secrets on AWS?",
              a: (
                <p className="mb-0">
                  In SSM Parameter Store (SecureString) or Secrets Manager, read at runtime through the
                  instance or task IAM role — never in code, images or build args. Secrets Manager for
                  credentials that need automatic rotation, like database passwords.
                </p>
              ),
            },
            {
              q: "An access key was pushed to a public repo. What do you do?",
              a: (
                <p className="mb-0">
                  Deactivate (and deny) the key immediately, review CloudTrail for everything it did in all
                  regions, remove any resources or credentials created by the attacker, rotate anything
                  reachable, notify as required, and follow up with controls such as secret scanning and
                  moving to roles. Deleting the commit does not undo the exposure.
                </p>
              ),
            },
            {
              q: "Explain RPO and RTO and how they drive your backup design.",
              a: (
                <p className="mb-0">
                  RPO is the maximum tolerable data loss (drives backup frequency and point-in-time
                  restore); RTO is the maximum tolerable downtime (drives restore method — Multi-AZ
                  failover vs snapshot restore vs cross-region rebuild). Measure the real RTO by drilling
                  restores.
                </p>
              ),
            },
            {
              q: "How would you protect backups from ransomware or a compromised admin?",
              a: (
                <p className="mb-0">
                  Immutable, locked backup vaults (AWS Backup Vault Lock / S3 Object Lock), copies in a
                  separate account and region that production credentials cannot delete, MFA-protected
                  delete, and periodic restore tests.
                </p>
              ),
            },
            {
              q: "Security Groups are open only to the ALB, and the app still leaked data. What might have happened?",
              a: (
                <p className="mb-0">
                  Application-layer flaws pass right through network controls: broken authorisation
                  (IDOR — reading another tenant&apos;s record by changing an ID), injection, a vulnerable
                  dependency, or over-broad IAM on the instance role. Fix with per-request authorisation
                  checks, tenant scoping, dependency scanning and least-privilege roles.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 19</h2>
        <ol>
          <li>
            Run the credential report. Write down every finding: missing MFA, old keys, unused users.
            Fix each one.
          </li>
          <li>
            Run the Security Group audit query. List everything open to the internet and justify each
            line, or close it.
          </li>
          <li>
            Attach the SSM policy to the instance role, connect with <code>start-session</code>, then
            remove the port-22 rule and delete the key pair from the launch template.
          </li>
          <li>
            Enable CloudTrail, GuardDuty and IAM Access Analyzer. Read the first findings.
          </li>
          <li>
            Move the database password to RDS-managed Secrets Manager and update the boot script to read
            it.
          </li>
          <li>
            Run the restore drill: point-in-time restore to a new instance, verify the data, record the
            time it took, delete the copy. Then delete a test S3 object and restore it from its version.
          </li>
          <li>
            Write the key-leak runbook for your team in ten lines, then have a teammate read it and say
            what is unclear.
          </li>
          <li>
            Copy the checklist into your repository and tick every box you can honestly tick. The
            unticked ones are next quarter&apos;s work.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Do a game-day: ask a teammate to &ldquo;leak&rdquo; a low-privilege test key into a private
            repo and see how long secret scanning, GuardDuty or CloudTrail takes to show it. The gap
            between what you expected and what happened is your roadmap.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          A secure system is not one that cannot be attacked but one where each layer limits the damage
          of the one before, problems are visible quickly, and recovery is a rehearsed routine.
        </p>
        <ul>
          <li>
            <strong>Identity first</strong>: MFA for humans, roles for machines, no long-lived keys,
            least privilege, leavers removed the same day.
          </li>
          <li>
            <strong>Shrink the surface</strong>: only the ALB is public; data stores are private; no port
            22 — use Session Manager.
          </li>
          <li>
            <strong>Treat servers as cattle</strong>: rebuild regularly, IMDSv2, encrypted disks,
            automatic security updates.
          </li>
          <li>
            <strong>Secrets in a secret store</strong>, rotated; encryption at rest and in transit;
            tenant scoping everywhere.
          </li>
          <li>
            <strong>Detect</strong> with CloudTrail, GuardDuty and alerts; <strong>recover</strong> with
            layered, protected, tested backups and a written incident routine.
          </li>
        </ul>
        <p>
          The system is secure, observable and recoverable. One question remains: what does all of it
          cost, and how do you keep the bill honest? That is the final lesson.
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
