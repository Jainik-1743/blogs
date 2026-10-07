import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
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
  { id: "why-this-matters", label: "Why this matters — costly AWS mistakes" },
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
          <strong>IAM</strong> (Identity and Access Management) is the AWS service that controls
          logins and permissions. It answers one question:{" "}
          <strong>who is allowed to do what in your AWS account?</strong>
        </p>
        <p>
          Every AWS action goes through IAM first. Launching a server, reading a file and deleting
          a database are all checked. If IAM does not clearly allow an action, it is denied.
        </p>
        <p>
          Two words come up all the time. <strong>Authentication</strong> means proving who you
          are (a login). <strong>Authorization</strong> means checking what you may do after you
          are logged in. In one line: authentication asks &ldquo;who are you?&rdquo;, authorization
          asks &ldquo;what may you do?&rdquo;. IAM does both.
        </p>
        <Callout kind="ok" label="IAM is completely free">
          <p className="mb-0">
            You can create as many users, groups, roles and policies as you want. You only pay
            for the resources those people create. Adding a team member costs nothing.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why this matters</h2>
        <p>
          This lesson protects you from the most costly AWS mistakes. These are real problems that
          happen to new users:
        </p>
        <ul>
          <li>
            Access keys (a secret ID and password pair that lets a program use your account) are
            uploaded to a public GitHub repository. Bots find them within minutes. Someone uses
            your account to mine crypto coins, and a bill of several lakh rupees arrives by the
            weekend.
          </li>
          <li>A developer with full admin access deletes the production database by accident.</li>
          <li>
            One leaked key gives an attacker access to <em>everything</em>, because nobody set
            limits.
          </li>
        </ul>
        <p>
          Each of these is a mistake in how IAM was set up. It is not a fault in AWS. Get this
          lesson right and the rest of the course is safe to practise.
        </p>

        <h2 id="hotel">The hotel — the whole idea in one story</h2>
        <p>Imagine you own a hotel. This single picture explains all of IAM.</p>
        <Callout kind="note" label="Your hotel">
          <p>
            The hotel has many areas: guest rooms, the kitchen, the laundry, the store room, the
            cash counter and the manager&apos;s office. The main question is:{" "}
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
          Keep this hotel in mind for the rest of the lesson. Every term below is one of these six
          things.
        </p>

        <h2 id="blocks">The four building blocks</h2>
        <IamBlocks />
        <h3>1. IAM User — the staff member</h3>
        <p>
          An <strong>IAM user</strong> is one person (or one program) with its own name and login
          inside your AWS account. Think of Rahul, your accountant. He gets his own ID badge and
          enters with it. In AWS, every developer gets a separate login.
        </p>
        <p>
          <strong>Never share one login between two people.</strong> If something breaks, you need
          to know who did it. A shared login makes that impossible.
        </p>
        <h3>2. IAM Group — the department</h3>
        <p>
          An <strong>IAM group</strong> is a named list of users. You attach permissions to the
          group, and every user in it gets them. A hotel with 20 staff cannot manage 20 separate
          sets of keys. So you make departments and give the keys to the department.
        </p>
        <p>
          When a new person joins, put them in the department. They get the right access at once.
          When someone leaves, remove them from the department. You never touch 20 individual key
          cards.
        </p>
        <h3>3. IAM Policy — the rule card</h3>
        <p>
          An <strong>IAM policy</strong> is a document that lists what is allowed or denied. In
          AWS it is a JSON file (a text file in a fixed format). It is covered in detail below.
        </p>
        <h3>4. IAM Role — the temporary key card</h3>
        <p>
          An <strong>IAM role</strong> is an identity with permissions that anyone (or any server)
          can wear for a short time. It has no password of its own. It is the most important
          block, so it has its own section below.
        </p>

        <h2 id="root">Owner vs staff — root user vs IAM user</h2>
        <p>
          When you sign up for AWS, you automatically get a <strong>root user</strong>. This is
          the login made from your sign-up email address. It has full power over the account, like
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
                <td className={no}>Not by IAM policies</td>
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
          it in the safe and use a normal badge instead.
        </p>
        <Callout kind="warn" label="Lock the root user away">
          <p className="mb-0">
            Use a strong password. Turn on MFA (multi-factor authentication: a second proof of
            identity, such as a code from your phone app. You did this in Lesson 0). Never create
            access keys for root. Only a few tasks really need root, such as closing the account,
            changing your support plan and some billing settings. Use IAM users for everything
            else.
          </p>
        </Callout>

        <h2 id="roles">The big idea — IAM roles</h2>
        <p>
          An <strong>IAM role</strong> is a set of permissions that a person, a server or a service
          can wear for a short time. The role hands out temporary credentials that expire by
          themselves. This is the most important idea in the lesson. It is what separates a
          developer who understands AWS from one who only clicks through it.
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
          If you come from Vercel, you may want to put credentials in a <code>.env</code> file. On
          AWS this habit is wrong and dangerous.
        </p>
        <KeysVsRole />
        <p>
          With a role attached to the server, your code does not change. The AWS SDK (the library
          your code uses to call AWS) finds the temporary credentials by itself:
        </p>
        <Script
          title="upload.ts — no keys anywhere in code or .env"
          code={`import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "ap-south-1" });

// The SDK finds the credentials from the attached role by itself
await s3.send(new PutObjectCommand({
  Bucket: "myapp-pdfs",
  Key: "quotation-1024.pdf",
  Body: pdfBuffer,
}));`}
        />
        <Callout kind="warn" label="Why keys on disk are a disaster">
          <p className="mb-0">
            Suppose someone breaks into a server that has keys on disk. They copy the keys and
            use them from anywhere in the world until you notice. With a role, the credentials
            expire after a few hours. A thief gets only a short window.
          </p>
        </Callout>
        <Callout kind="ok" label="The rule to memorise">
          <p className="mb-0">
            Access keys are for people and for systems outside AWS. Roles are for anything running
            inside AWS.
          </p>
        </Callout>

        <h2 id="policies">Policies — how permissions are written</h2>
        <p>
          A policy is a JSON document. JSON is a plain-text format made of names and values in
          curly brackets. Only three parts of a policy really matter.
        </p>
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
          An ARN (Amazon Resource Name) is the unique ID that AWS gives to every resource, like a
          full postal address. In the policy above, <code>myapp-pdfs</code> is an S3 bucket (a
          storage folder in AWS) and the <code>/*</code> at the end means every file inside it. The
          policy says: <em>this identity may upload and download files, only in the myapp-pdfs
          bucket, and nothing else anywhere.</em>
        </p>
        <h3>Two default behaviours to remember</h3>
        <ul>
          <li>
            <strong>Everything is denied by default.</strong> No policy means no access. This is
            like a hotel where every door stays locked unless your card is set up for it.
          </li>
          <li>
            <strong>An explicit Deny always wins</strong>, even if another policy says Allow. A
            &ldquo;staff not allowed&rdquo; sign beats the master key.
          </li>
        </ul>

        <h2 id="least">Least privilege</h2>
        <p>
          <strong>Least privilege</strong> is the main rule of IAM:{" "}
          <strong>give the minimum access needed to do the job, and nothing more.</strong>
        </p>
        <p>
          You would not give the room service boy a master key just because it is easy. Use the
          same care in AWS.
        </p>
        <Callout kind="warn" label="The most common beginner mistake">
          <p className="mb-0">
            Attaching <code>AdministratorAccess</code> (the policy that allows everything) to
            everyone, because then nothing is ever blocked. Then one person&apos;s mistake can take
            down all of production, and one leaked key exposes the whole account.
          </p>
        </Callout>

        <h2 id="real-example">Real example — setting up a team</h2>
        <ol className="steps">
          <li>
            <h3>Create groups, one per job function</h3>
            <p>
              In the console: IAM → User groups → Create. Make <strong>Developers</strong>{" "}
              (mostly read-only: can look, cannot change production) and <strong>DevOps</strong>{" "}
              (can build infrastructure, but cannot manage IAM itself).
            </p>
          </li>
          <li>
            <h3>Attach policies to the group, never to individual users</h3>
            <p>
              An AWS-managed policy is a ready-made policy that AWS writes and updates for you.
              Give Developers <code>ReadOnlyAccess</code> (read everything, change nothing). Give
              DevOps <code>PowerUserAccess</code> (do everything except manage IAM and account
              settings). You never write these by hand.
            </p>
          </li>
          <li>
            <h3>Create a user and put them in a group</h3>
            <p>
              One person, one identity. Create <code>rahul</code> and add him to Developers. He
              now gets everything that group allows, and nothing else.
            </p>
          </li>
          <li>
            <h3>Check who has what</h3>
            <p>
              IAM&apos;s user list shows every identity and the groups each one is in. The{" "}
              <strong>Access advisor</strong> tab shows which services a user really used
              recently. Use it to spot permissions that nobody needs.
            </p>
          </li>
        </ol>
        <Callout kind="note" label="Why groups matter">
          <p className="mb-0">
            When a new developer joins, you add them to a group. When someone leaves, you remove
            them. You never edit twenty individual users. This is the same &ldquo;manage the
            department, not the person&rdquo; idea as Linux file groups in Lesson 1.
          </p>
        </Callout>

        <h2 id="sso">For real teams — IAM Identity Center</h2>
        <p>
          For people, AWS recommends <strong>IAM Identity Center</strong> (older name: AWS SSO,
          where SSO means single sign-on) instead of creating IAM users. It is a service where
          each person logs in once and can reach several AWS accounts.
        </p>
        <p>
          It gives each person <strong>temporary credentials</strong> instead of permanent access
          keys. This is the same safety benefit as roles, but for people. It is also free.
        </p>
        <p>
          For solo learning, plain IAM users are fine. For a team of twenty, use Identity Center.
        </p>

        <h2 id="billing">The step you must not skip</h2>
        <p>
          Set up a billing alert today, before Lesson 7, when you start creating real resources. A
          billing alert is an email that AWS sends when your spending reaches a limit you chose.
          It lets you learn without worry.
        </p>
        <Callout kind="ok" label="Easiest way, in the console">
          <p className="mb-0">
            Billing → Budgets → Create budget → set a monthly amount such as ₹800 → add your
            email. You get a warning email long before the bill hurts.
          </p>
        </Callout>

        <h2 id="keys">Access key hygiene</h2>
        <p>
          An <strong>access key</strong> is a pair of values (an ID and a secret) that lets a
          program or the AWS CLI act as an IAM user. If you must use access keys, for example for
          the AWS CLI on your own laptop, follow these rules:
        </p>
        <ul>
          <li>
            Never commit them to Git. Add <code>.env</code> and <code>*.pem</code> to{" "}
            <code>.gitignore</code> on day one.
          </li>
          <li>Rotate them every 90 days. (To rotate means to replace an old key with a new one.)</li>
          <li>Delete unused keys at once.</li>
          <li>Turn on MFA for any user that has keys.</li>
        </ul>
        <p>
          Rotating a key takes two steps. First create a new key and switch your CLI to it. Then
          delete the old key after you check that everything still works. IAM shows when each key
          was last used, so you know which keys are safe to delete.
        </p>
        <h3>Cost</h3>
        <p>
          IAM users, groups, roles, policies and Identity Center are all{" "}
          <strong>completely free</strong>. CloudWatch billing alarms are free for the first ten.
        </p>
        <Callout kind="note" label="One idea, many tools">
          <p className="mb-0">
            The same &ldquo;who can do what&rdquo; idea applies to your GitHub repository.
            Branch protection and CODEOWNERS are like IAM for your code. Read{" "}
            <Link href={readingHref(githubReading)}>{githubReading.title} →</Link>
          </p>
        </Callout>

        <hr />

        <h2 id="practice">Practice task before Lesson 6</h2>
        <p>
          Everything here is free. At the end, your account is set up like a real team&apos;s
          account, even if you are the only member.
        </p>
        <ol>
          <li>
            Confirm you are an IAM user, never root (Lesson 0):{" "}
            <code>aws sts get-caller-identity</code>.
          </li>
          <li>
            In the console, create a <strong>Developers</strong> group with{" "}
            <code>ReadOnlyAccess</code>, and a user <code>reader</code> in it with one access key.
          </li>
          <li>
            Create a <strong>policy</strong> <code>myapp-pdfs-rw</code> using the{" "}
            <code>policy.json</code> above: one bucket, two actions, nothing else.
          </li>
          <li>
            See least privilege in action. Add the reader&apos;s key as a second CLI profile (a named
            set of login details), then try:
            <Script
              title="as the reader"
              code={`aws configure --profile reader                            # paste reader's keys
aws iam list-users --profile reader                       # works: ReadOnlyAccess allows it
aws iam create-group --group-name Hack --profile reader   # AccessDenied — as designed`}
            />
          </li>
          <li>
            Create the <strong>role</strong> EC2 will wear in Lesson 7: IAM → Roles → Create role
            → trusted entity <em>AWS service: EC2</em> → attach <code>myapp-pdfs-rw</code> → name
            it <code>myapp-ec2-role</code>. The trust document is a small JSON file that says who
            may wear the role. Picking &ldquo;EC2&rdquo; writes it for you.
          </li>
          <li>Delete the reader&apos;s access key. Keep the group, policy and role — Lesson 7 uses them.</li>
          <li>Billing → Budgets → Create → ₹800 / month → your email. This one protects your wallet.</li>
        </ol>
        <p>Then answer these in your own words:</p>
        <ol>
          <li>
            Step 4 gave an <code>AccessDenied</code> error. Which of the two default behaviours
            caused it? Would a second policy with <code>Deny</code> on{" "}
            <code>iam:CreateGroup</code> change anything?
          </li>
          <li>
            Explain the difference between the policy in step 3 and the role&apos;s trust document
            in step 5. Which one says <em>what</em> is allowed, and which one says <em>who</em> may
            wear the role?
          </li>
          <li>
            Your EC2 server needs to upload PDFs to S3. List three ways to give it access. Rank
            them from worst to best, with one reason each.
          </li>
          <li>
            A developer leaves the company. What single step do you take (hint: it is about
            groups)? Why is it one step and not twenty?
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            In the console, open IAM → Users → your admin user → Security credentials, and check
            that MFA is on and that you have exactly one active access key. Then open IAM →
            Account settings and read the password policy. Make it stricter: at least 14
            characters, and passwords expire after 90 days.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          IAM is the hotel&apos;s key-card system. The root user is the owner&apos;s master key
          kept in the safe. Users are staff badges. Groups are departments. Policies are the rule
          cards. Roles are temporary key cards for visitors and machines. Every door is locked
          until a card is set up for it.
        </p>
        <ul>
          <li>
            <strong>Root</strong>: MFA on, no access keys, never used for daily work.
          </li>
          <li>
            <strong>Groups, not users</strong>: attach policies to groups and put people in the
            groups. Joining and leaving become one small step.
          </li>
          <li>
            <strong>Roles for machines</strong>: anything running inside AWS (EC2, Lambda, a
            GitHub Actions deploy) wears a role with temporary credentials. Long-lived keys in a{" "}
            <code>.env</code> file on a server are the most expensive mistake in this course.
          </li>
          <li>
            <strong>Policies</strong>: Effect, Action, Resource. Everything is denied by default,
            and an explicit Deny always wins. Least privilege means writing a narrow policy
            instead of using <code>AdministratorAccess</code>.
          </li>
          <li>
            <strong>Billing alert</strong>: set it before Lesson 7. It is the one alarm that
            protects your bank account instead of your uptime.
          </li>
        </ul>
        <p>
          Identity is ready. Next we build the network where these identities will work: the VPC.
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
