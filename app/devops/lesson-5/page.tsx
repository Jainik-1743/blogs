import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import IamBlocks from "@/components/figures/IamBlocks";
import KeysVsRole from "@/components/figures/KeysVsRole";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson, READINGS, readingHref, SERIES } from "@/lib/lessons";

const lesson = getLesson("lesson-5")!;
const githubReading = READINGS.find((r) => r.slug === "github-access-control")!;

export const metadata: Metadata = {
  title: `Lesson 5 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "concept", label: "Concept: who is allowed to do what" },
  { id: "why-this-matters", label: "Why this matters — the AWS horror stories" },
  { id: "hotel", label: "The hotel — the whole idea in one story" },
  { id: "blocks", label: "The four building blocks" },
  { id: "root", label: "Owner vs staff — root user vs IAM user" },
  { id: "roles", label: "The big idea — IAM roles" },
  { id: "policies", label: "Policies — how permissions are written" },
  { id: "least", label: "Least privilege" },
  { id: "real-example", label: "Real example — setting up a team" },
  { id: "sso", label: "For real teams — IAM Identity Center" },
  { id: "billing", label: "The step you must not skip — billing alerts" },
  { id: "keys", label: "Access key hygiene" },
  { id: "practice", label: "Practice task before Lesson 6" },
  { id: "conclusion", label: "Conclusion" },
];

const hotel: [string, string, string][] = [
  ["The hotel owner with the master key", "Root user", "Can open everything, can even sell the hotel. Kept locked away, never used daily."],
  ["A staff member with an ID badge", "IAM User", "One person, one identity, one login."],
  ["A department — housekeeping, kitchen, front desk", "IAM Group", "Keys are given to the department, not to each person separately."],
  ["The written rule card on the wall", "IAM Policy", "“Housekeeping may enter guest rooms and laundry, not the cash counter.”"],
  ["A temporary key card for a visiting plumber", "IAM Role", "Works for 4 hours, only for one room, then expires by itself."],
  ["Every door locked unless your card is programmed for it", "Deny by default", "No permission written means no access at all."],
];

const yes = "font-semibold text-emerald-300";
const no = "font-semibold text-red-300";

export default function LessonFivePage() {
  return (
    <article>
      <header className="mb-8 border-b border-line pb-6">
        <nav className="mb-4 font-mono text-[0.8rem] text-ink-dim" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-sky">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/${SERIES.slug}`} className="hover:text-sky">{SERIES.title}</Link>
          <span className="mx-2">/</span>
          <span>Lesson {String(lesson.number).padStart(2, "0")}</span>
        </nav>
        <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">
          Lesson 5 · {lesson.readTime} read
        </p>
        <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[2rem]">
          {lesson.title}
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">{lesson.summary}</p>
      </header>

      <section className="mb-10 rounded-xl border border-line bg-bg-elev px-6 py-5" aria-labelledby="learn">
        <h2 id="learn" className="mb-2 text-[1.1rem] font-semibold text-sky">
          What you&apos;ll learn in this lesson
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
        <h2 id="concept">Concept</h2>
        <p>
          IAM stands for Identity and Access Management. It answers exactly one question:{" "}
          <strong>who is allowed to do what in your AWS account?</strong>
        </p>
        <p>
          Every single AWS action — launching a server, reading a file, deleting a database —
          passes through IAM first. If IAM does not explicitly allow it, it is denied.
        </p>
        <Callout kind="ok" label="IAM is completely free">
          <p className="mb-0">
            Unlimited users, groups, roles and policies. You only pay for the resources those
            identities create. Adding a team member costs nothing.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>
          This is the lesson that protects you from the AWS horror stories. These are real things
          that happen to beginners:
        </p>
        <ul>
          <li>
            Access keys committed to a public GitHub repository. Bots find them within minutes.
            Someone runs crypto mining on your account, and a bill of several lakh rupees arrives
            by the weekend.
          </li>
          <li>A developer with full admin access accidentally deletes the production database.</li>
          <li>
            One leaked key gives an attacker access to <em>everything</em>, because nobody set up
            any boundaries.
          </li>
        </ul>
        <p>
          Every one of those is an IAM failure, not an AWS failure. Get this lesson right and the
          rest of the course is safe to practise on.
        </p>

        <h2 id="hotel">The hotel — the whole idea in one story</h2>
        <p>Imagine you own a hotel. This single picture explains all of IAM.</p>
        <Callout kind="note" label="Your hotel">
          <p>
            The hotel has many areas: guest rooms, the kitchen, the laundry, the store room, the
            cash counter and the manager&apos;s office. The central question is:{" "}
            <strong>who can enter which area?</strong>
          </p>
          <p className="mb-0">
            <strong>The hotel = your AWS account. IAM = the entire system of doors, locks and key
            cards.</strong>
          </p>
        </Callout>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>In the hotel</th>
                <th>In AWS</th>
                <th>What it means</th>
              </tr>
            </thead>
            <tbody>
              {hotel.map(([h, aws, meaning]) => (
                <tr key={aws}>
                  <td>{h}</td>
                  <td className="whitespace-nowrap"><strong>{aws}</strong></td>
                  <td>{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Keep this hotel in your head for the rest of the lesson. Every technical term below is
          just one of these six things.
        </p>

        <h2 id="blocks">The four building blocks</h2>
        <IamBlocks />
        <h3>1. IAM User — the staff member</h3>
        <p>
          Rahul is your accountant. He gets his own ID badge and enters using it. In AWS, every
          developer gets their own separate login.
        </p>
        <p>
          <strong>Never share one login between two people.</strong> If something breaks, you need
          to know who did it. A shared login makes that impossible.
        </p>
        <h3>2. IAM Group — the department</h3>
        <p>
          A hotel with 20 staff cannot manage 20 separate sets of keys. So you create departments,
          and give the keys to the department.
        </p>
        <p>
          New person joins, put them in the department, and they automatically get the right
          access. Someone leaves, remove them from the department. You never touch 20 individual
          key cards.
        </p>
        <h3>3. IAM Policy — the rule card</h3>
        <p>
          This is the written document that actually lists what is allowed. In AWS it is a JSON
          file, covered in detail below.
        </p>
        <h3>4. IAM Role — the temporary key card</h3>
        <p>The most important one, explained fully in its own section below.</p>

        <h2 id="root">Owner vs staff — root user vs IAM user</h2>
        <p>
          When you sign up for AWS, you automatically get a <strong>root user</strong>. That is
          the hotel owner with the master key.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Root user</th>
                <th>IAM user</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Created</strong></td>
                <td>Automatically, when you sign up</td>
                <td>By you, manually</td>
              </tr>
              <tr>
                <td><strong>Power</strong></td>
                <td>Unlimited. Can close the account, change billing</td>
                <td>Only what you grant</td>
              </tr>
              <tr>
                <td><strong>Can be restricted?</strong></td>
                <td className={no}>No, never</td>
                <td className={yes}>Yes</td>
              </tr>
              <tr>
                <td><strong>Use for daily work?</strong></td>
                <td className={no}>Never</td>
                <td className={yes}>Always</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A sensible hotel owner does not carry the master key around for everyday work. They keep
          it in the safe and use their own normal badge instead.
        </p>
        <Callout kind="warn" label="Lock the root user away">
          <p className="mb-0">
            Strong password, MFA turned on (you did this in Lesson 0), and never attach access
            keys to it. Only a handful of tasks genuinely need root — closing the account, changing
            your support plan, a few billing settings. Everything else is IAM.
          </p>
        </Callout>

        <h2 id="roles">The big idea — IAM roles</h2>
        <p>
          This is the single most important concept in the lesson, and the one that separates a
          developer who knows AWS from one who just uses it.
        </p>
        <Callout kind="note" label="The plumber">
          <p>
            A plumber arrives to fix a pipe in room 302. Do you hand him a{" "}
            <strong>permanent master key</strong> to the hotel? Of course not.
          </p>
          <p className="mb-0">
            You give him a <strong>temporary key card</strong>: valid for four hours, opens only
            room 302, and expires by itself when the job is done. If he loses it in the street
            tomorrow, it is already useless.
          </p>
        </Callout>
        <p>
          Coming from Vercel, your instinct is to put credentials in a <code>.env</code> file. On
          AWS, that instinct is wrong and dangerous.
        </p>
        <KeysVsRole />
        <p>
          With a role attached, your code changes <strong>nothing</strong>. The AWS SDK
          automatically finds the temporary credentials:
        </p>
        <Script
          title="upload.ts — no keys anywhere in code or .env"
          code={`import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "ap-south-1" });

// The SDK automatically picks up credentials from the attached role
await s3.send(new PutObjectCommand({
  Bucket: "myapp-pdfs",
  Key: "quotation-1024.pdf",
  Body: pdfBuffer,
}));`}
        />
        <Callout kind="warn" label="Why keys on disk are a disaster">
          <p className="mb-0">
            If someone breaks into a server with keys on disk, they copy those keys and use them
            from anywhere in the world, forever, until you notice. With a role, the credentials
            expire in a few hours and only work from that instance.
          </p>
        </Callout>
        <Callout kind="ok" label="The rule to memorise">
          <p className="mb-0">
            Access keys are for humans and outside systems. Roles are for anything running inside
            AWS.
          </p>
        </Callout>

        <h2 id="policies">Policies — how permissions are written</h2>
        <p>A policy is a JSON document. Only three parts really matter.</p>
        <Script
          title="policy.json"
          code={`{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:PutObject",
      "s3:GetObject"
    ],
    "Resource": "arn:aws:s3:::myapp-pdfs/*"
  }]
}`}
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Part</th>
                <th>Meaning</th>
                <th>Hotel equivalent</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Effect</strong></td>
                <td><code>Allow</code> or <code>Deny</code></td>
                <td>Yes or no</td>
              </tr>
              <tr>
                <td><strong>Action</strong></td>
                <td>Which operations are covered</td>
                <td>Enter, clean, take items out</td>
              </tr>
              <tr>
                <td><strong>Resource</strong></td>
                <td>Which specific things, written as an ARN</td>
                <td>Which rooms exactly</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          ARN means Amazon Resource Name — AWS&apos;s unique ID format for every resource. The
          policy above says: <em>this identity may upload and download files, only in the
          myapp-pdfs bucket, and nothing else anywhere.</em>
        </p>
        <h3>Two default behaviours to remember</h3>
        <ul>
          <li>
            <strong>Everything is denied by default.</strong> No policy means no access. Same as a
            hotel where every door stays locked unless your card is programmed for it.
          </li>
          <li>
            <strong>An explicit Deny always wins</strong>, even if another policy says Allow. A
            &ldquo;staff not allowed&rdquo; sign beats the master key.
          </li>
        </ul>

        <h2 id="least">Least privilege</h2>
        <p>
          This is the main principle of IAM, and it has one simple rule:{" "}
          <strong>give the minimum access needed to do the job, and nothing more.</strong>
        </p>
        <p>
          You would not give the room service boy a master key just because it is convenient. The
          same discipline applies in AWS.
        </p>
        <Callout kind="warn" label="The most common beginner mistake">
          <p className="mb-0">
            Attaching <code>AdministratorAccess</code> to everyone, because then nothing ever gets
            blocked and work moves fast. Then one person&apos;s mistake takes down all of
            production, and one leaked key exposes the entire account.
          </p>
        </Callout>

        <h2 id="real-example">Real example — setting up a team</h2>
        <ol className="steps">
          <li>
            <h3>Create groups, one per job function</h3>
            <CommandList
              title="Groups"
              commands={[
                { cmd: "aws iam create-group --group-name Developers", note: "Read-mostly: can look, cannot change production" },
                { cmd: "aws iam create-group --group-name DevOps", note: "Can build infrastructure, but not manage IAM itself" },
              ]}
            />
          </li>
          <li>
            <h3>Attach policies to the group, never to individual users</h3>
            <CommandList
              title="Policies → groups"
              commands={[
                { cmd: "aws iam attach-group-policy --group-name Developers --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess", note: "AWS-managed policy: read everything, change nothing" },
                { cmd: "aws iam attach-group-policy --group-name DevOps --policy-arn arn:aws:iam::aws:policy/PowerUserAccess", note: "AWS-managed policy: everything except IAM and account settings" },
              ]}
            />
          </li>
          <li>
            <h3>Create a user and put them in a group</h3>
            <CommandList
              title="Users → groups"
              commands={[
                { cmd: "aws iam create-user --user-name rahul", note: "One person, one identity" },
                { cmd: "aws iam add-user-to-group --user-name rahul --group-name Developers", note: "Rahul inherits everything the Developers group allows" },
              ]}
            />
          </li>
          <li>
            <h3>Check who has what</h3>
            <CommandList
              title="Audit"
              commands={[
                { cmd: "aws iam list-users", note: "Every identity in the account" },
                { cmd: "aws iam get-account-summary", note: "Counts of users, groups, policies, MFA devices" },
                { cmd: "aws iam list-groups-for-user --user-name rahul", note: "Which departments is Rahul in?" },
              ]}
            />
          </li>
        </ol>
        <Callout kind="note" label="Why groups matter">
          <p className="mb-0">
            When a new developer joins, you add them to a group — one command. When someone
            leaves, you remove them. You never edit twenty individual users. This is the same
            &ldquo;manage the department, not the person&rdquo; logic as Linux file groups in
            Lesson 1.
          </p>
        </Callout>

        <h2 id="sso">For real teams — IAM Identity Center</h2>
        <p>
          For human beings, AWS now recommends <strong>IAM Identity Center</strong> (previously
          called AWS SSO) instead of creating IAM users.
        </p>
        <p>
          It gives each person a single login across multiple AWS accounts, with{" "}
          <strong>temporary credentials</strong> instead of permanent access keys — the same
          security benefit as roles, applied to people. It is also free.
        </p>
        <p>
          For solo learning, plain IAM users are fine. For a team of twenty, Identity Center is
          the right answer.
        </p>

        <h2 id="billing">The step you must not skip</h2>
        <p>
          Set up a billing alert today, before Lesson 7 when you start creating real resources.
          This is how you sleep peacefully while learning.
        </p>
        <Callout kind="ok" label="Easiest way, in the console">
          <p className="mb-0">
            Billing → Budgets → Create budget → set a monthly amount such as ₹800 → add your
            email. You get a warning email long before anything becomes painful.
          </p>
        </Callout>
        <p>Or through the CLI, after enabling billing alerts in Billing preferences:</p>
        <Script
          title="billing-alarm.sh"
          code={`aws cloudwatch put-metric-alarm \\
  --alarm-name billing-alert-10-usd \\
  --namespace AWS/Billing \\
  --metric-name EstimatedCharges \\
  --dimensions Name=Currency,Value=USD \\
  --statistic Maximum \\
  --period 21600 \\
  --threshold 10 \\
  --comparison-operator GreaterThanThreshold \\
  --evaluation-periods 1 \\
  --alarm-actions <your-sns-topic-arn>`}
        />
        <p>The first ten CloudWatch alarms are free.</p>

        <h2 id="keys">Access key hygiene</h2>
        <p>
          If you must use access keys — for the AWS CLI on your own laptop, for example — follow
          these rules:
        </p>
        <ul>
          <li>
            Never commit them. Add <code>.env</code> and <code>*.pem</code> to{" "}
            <code>.gitignore</code> on day one.
          </li>
          <li>Rotate them every 90 days.</li>
          <li>Delete unused keys immediately.</li>
          <li>Turn on MFA for any user that has keys.</li>
        </ul>
        <CommandList
          title="Key rotation"
          commands={[
            { cmd: "aws iam list-access-keys --user-name admin", note: "See all keys for a user and when they were created" },
            { cmd: "aws iam get-access-key-last-used --access-key-id AKIA...", note: "When was this key last used, and from which service?" },
            { cmd: "aws iam create-access-key --user-name admin", note: "Rotate, step 1: create the new key and put it in aws configure" },
            { cmd: "aws iam delete-access-key --user-name admin --access-key-id AKIA-OLD", note: "Rotate, step 2: delete the old one once everything works" },
          ]}
        />
        <h3>Cost</h3>
        <p>
          IAM users, groups, roles, policies and Identity Center are all{" "}
          <strong>completely free</strong>. Billing alarms are free for the first ten.
        </p>
        <Callout kind="note" label="One idea, many tools">
          <p className="mb-0">
            This same &ldquo;who can do what&rdquo; thinking applies to your GitHub repository
            too — branch protection and CODEOWNERS are IAM for your code. Read{" "}
            <Link href={readingHref(githubReading)}>{githubReading.title} →</Link>
          </p>
        </Callout>

        <hr />

        <h2 id="practice">Practice task before Lesson 6</h2>
        <p>
          Everything here is free. By the end, your account has the shape a real team&apos;s
          account has — even if you are the only member.
        </p>
        <Script
          title="practice.sh"
          code={`# 1. Where do you stand? (must be an IAM user, never root — Lesson 0)
aws sts get-caller-identity

# 2. Build the department structure
aws iam create-group --group-name Developers
aws iam attach-group-policy --group-name Developers \\
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess

# 3. Create a second, read-only identity and put it in the group
aws iam create-user --user-name reader
aws iam add-user-to-group --user-name reader --group-name Developers
aws iam create-access-key --user-name reader        # copy the two values

# 4. Become that user in a separate CLI profile and feel least privilege
aws configure --profile reader                       # paste the reader's keys, region ap-south-1
aws iam list-users --profile reader                  # works: ReadOnlyAccess allows it
aws iam create-group --group-name Hack --profile reader   # AccessDenied — exactly as designed

# 5. Write your first policy: one bucket, two actions, nothing else
cat > s3-pdfs.json <<'EOF'
{ "Version": "2012-10-17",
  "Statement": [{ "Effect": "Allow",
                  "Action": ["s3:PutObject", "s3:GetObject"],
                  "Resource": "arn:aws:s3:::myapp-pdfs/*" }] }
EOF
aws iam create-policy --policy-name myapp-pdfs-rw --policy-document file://s3-pdfs.json

# 6. Create the role EC2 will wear in Lesson 7 (the plumber's key card)
cat > trust-ec2.json <<'EOF'
{ "Version": "2012-10-17",
  "Statement": [{ "Effect": "Allow",
                  "Principal": { "Service": "ec2.amazonaws.com" },
                  "Action": "sts:AssumeRole" }] }
EOF
aws iam create-role --role-name myapp-ec2-role --assume-role-policy-document file://trust-ec2.json
aws iam attach-role-policy --role-name myapp-ec2-role \\
  --policy-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/myapp-pdfs-rw

# 7. Clean up the practice user's key (keep the group, policy and role — Lesson 7 uses them)
aws iam list-access-keys --user-name reader
aws iam delete-access-key --user-name reader --access-key-id <AKIA…>

# 8. The one that actually protects your wallet
#    Console → Billing → Budgets → Create → ₹800 / month → your email`}
        />
        <p>Then answer these in your own words:</p>
        <ol>
          <li>
            Step 4 produced an <code>AccessDenied</code>. Which of the two default behaviours
            caused it — and would adding a second policy with <code>Deny</code> on{" "}
            <code>iam:CreateGroup</code> change anything?
          </li>
          <li>
            Explain the difference between the policy in step 5 and the trust document in step 6.
            Which one says <em>what</em> is allowed, and which one says <em>who</em> may wear the
            role?
          </li>
          <li>
            Your EC2 server needs to upload PDFs to S3. List the three ways to give it access,
            and rank them from worst to best with one reason each.
          </li>
          <li>
            A developer leaves the company. What is the one command you run — and why is it one
            command instead of twenty?
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            In the console, open IAM → Users → your admin user → Security credentials, and check
            that MFA is on and that you have exactly one active access key. Then open IAM →
            Account settings and read the password policy. Tighten it: 14 characters minimum,
            expire in 90 days.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          IAM is the hotel&apos;s key-card system. The root user is the owner&apos;s master key
          kept in the safe; users are staff badges; groups are departments; policies are the rule
          cards; roles are temporary key cards for visitors and machines. Every door is locked
          until a card is programmed for it.
        </p>
        <ul>
          <li>
            <strong>Root</strong>: MFA on, no access keys, never used for daily work.
          </li>
          <li>
            <strong>Groups, not users</strong>: attach policies to departments, put people in
            departments. Joining and leaving become one command.
          </li>
          <li>
            <strong>Roles for machines</strong>: anything running inside AWS — EC2, Lambda, a
            GitHub Actions deploy — wears a role with temporary credentials. Long-lived keys
            in <code>.env</code> on a server are the single most expensive mistake in this
            course.
          </li>
          <li>
            <strong>Policies</strong>: Effect, Action, Resource. Denied by default; an explicit
            Deny always wins. Least privilege means writing the narrow policy, not reaching for{" "}
            <code>AdministratorAccess</code>.
          </li>
          <li>
            <strong>Billing alert</strong>: set before Lesson 7. It is the one alarm that guards
            your bank account instead of your uptime.
          </li>
        </ul>
        <p>
          Identity is in place. Next we build the network those identities will work inside: the
          VPC.
        </p>

        <hr />
        <p>
          End of Lesson 5. Next: <strong>Lesson 6 — VPC: Subnets, Route Tables, Security
          Groups</strong>.
        </p>
        <p>
          Also read:{" "}
          <Link href={readingHref(githubReading)}>{githubReading.title} →</Link>
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
