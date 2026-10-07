import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import Script from "@/components/Script";
import { getLesson, lessonHref, READINGS, SERIES } from "@/lib/lessons";

const reading = READINGS.find((r) => r.slug === "github-access-control")!;
const lessonFive = getLesson("lesson-5")!;

export const metadata: Metadata = {
  title: reading.title,
  description: reading.summary,
};

const outline = [
  { id: "question", label: "The question" },
  { id: "correction", label: "The important correction — change level, not file level" },
  { id: "three-ways", label: "Three ways to do it: CODEOWNERS, rulesets, branch protection" },
  { id: "why-iam", label: "Why this explains AWS IAM" },
  { id: "devops", label: "Is this part of DevOps?" },
  { id: "checklist", label: "A practical setup checklist" },
];

const mapping: [React.ReactNode, React.ReactNode][] = [
  [<>&ldquo;Developers can read <code>package.json</code> but not change it&rdquo;</>, <>Policy: <code>Allow s3:GetObject</code>, <code>Deny s3:PutObject</code> (S3 is the AWS file storage service; these two actions mean read a file and write a file)</>],
  ["The CODEOWNERS file listing who owns what", <><strong>IAM Policy</strong> — the document listing what is allowed</>],
  [<>A GitHub team such as <code>@security-team</code></>, <strong>IAM Group</strong>],
  ["A repository, a folder, a file", <><strong>Resource</strong> — a thing you protect, such as an S3 bucket (a container for files) or an EC2 instance (a virtual server)</>],
  [<>&ldquo;Nobody touches <code>.github/</code> without my approval&rdquo;</>, "“Nobody deletes the production database”"],
  ["A GitHub Actions workflow using a token to deploy", <><strong>IAM Role</strong> — a machine, not a person, given temporary access</>],
  ["Nothing is allowed until a rule permits it", "Deny by default — no policy means no access"],
];

const layers: [string, string][] = [
  ["GitHub", "Who can merge to main, who owns which files"],
  ["AWS / IAM", "Who can create, read or delete which resources"],
  ["Database", "Which users can read versus write which tables"],
  ["CI/CD pipeline (the automatic steps that test and deploy your code)", "Which secrets a build job is allowed to see"],
];

export default function GithubAccessControlPage() {
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
          Background reading for Lesson 5 · {reading.readTime} read
        </p>
        <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[2rem]">
          GitHub Access Control
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">
          Can you make <code>package.json</code> read-only for some developers? Yes. Learning how
          GitHub does it is the fastest way to understand AWS IAM (Identity and Access Management,
          the AWS system that controls who may do what), because both use the same idea.
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
        <h2 id="question">The question</h2>
        <p>When a team grows, people often ask a sensible question:</p>
        <Callout kind="note">
          <p className="mb-0">
            &ldquo;Some files should not be edited by everyone. Examples are{" "}
            <code>package.json</code>, the ESLint config (the settings of the code-style checker),{" "}
            <code>tsconfig.json</code> and, most of all, the <code>.github</code> folder that
            controls deployment. Can I make those files read-only for most developers?&rdquo;
          </p>
        </Callout>
        <p>The answer is yes. But the way it works is not what most people expect.</p>

        <h2 id="correction">The important correction</h2>
        <p>
          GitHub does <strong>not</strong> have read-only permissions for single files, like the
          Linux <code>chmod</code> command (a command that changes who may read or write a file). You cannot mark <code>package.json</code> as read-only
          directly.
        </p>
        <p>
          Instead, GitHub controls the <strong>change</strong>. Anyone can edit the file on their
          own computer. But they cannot get that change <strong>merged</strong> (added to the main
          code) unless the right person approves it. The change travels in a pull request, which is
          a request to merge a set of changes.
        </p>
        <Callout kind="note" label="The hotel again">
          <p className="mb-0">
            You do not weld the store room door shut. You make a rule that nothing leaves the store
            room unless the manager signs the register. The door still opens, but nothing moves
            without approval.
          </p>
        </Callout>
        <p>
          This difference matters, because AWS works the same way. In AWS you do not lock a file
          either. You control <strong>who is allowed to perform an action</strong>.
        </p>

        <h2 id="three-ways">Three ways to do it</h2>

        <h3>1. CODEOWNERS — the standard answer</h3>
        <p>
          CODEOWNERS is a file that says which people or teams must review changes to which files.
          Create it at <code>.github/CODEOWNERS</code> in your repository. When two lines match a
          file, the last matching line wins.
        </p>
        <Script
          title=".github/CODEOWNERS"
          code={`# Default owner for anything not matched by a later line
*                       @your-handle

# Important config files: only you can approve changes
/package.json           @your-handle
/package-lock.json      @your-handle
/eslint.config.ts       @your-handle
/tsconfig.json          @your-handle
/next.config.js         @your-handle

# The whole .github folder (the CI/CD workflows live here)
/.github/               @your-handle

# A whole folder, owned by a team instead of one person
/src/lib/auth/          @your-org/security-team`}
        />
        <p>
          Then turn on branch protection. A branch is a separate line of work in Git, and{" "}
          <code>main</code> is the main one. Branch protection is a set of rules for a branch such as{" "}
          <code>main</code>. In the repository settings, add a rule for <code>main</code> (a
          &ldquo;branch protection rule&rdquo; under Branches, or a branch ruleset under Rules).
          Then switch on these two options:
        </p>
        <p>
          <strong>Require a pull request before merging → Require review from Code Owners</strong>
        </p>
        <Callout kind="ok" label="Result">
          <p className="mb-0">
            Now suppose a developer changes <code>package.json</code>. Their pull request is{" "}
            <strong>blocked until you approve it</strong>. They can still read the file and propose
            changes. They just cannot merge without you.
          </p>
        </Callout>

        <h3>2. Rulesets with push rules — the hard block</h3>
        <p>
          A ruleset is a newer and more flexible kind of rule set for a repository. It can include{" "}
          <strong>push rules</strong>. A push rule can restrict file paths. Then any commit that
          changes those paths is rejected outright. Push rules apply to private and internal
          repositories, and they need a paid GitHub plan such as Team.
        </p>
        <p>
          Here is the difference. CODEOWNERS blocks a change at <strong>merge</strong> time. A push
          rule can block it at <strong>push</strong> time, before the change even reaches a pull
          request.
        </p>
        <p>Use this when the answer must be &ldquo;nobody, not even by accident&rdquo;.</p>

        <h3>3. Branch protection basics</h3>
        <p>Turn these on whatever else you do:</p>
        <ul>
          <li>
            <strong>Require a pull request before merging</strong> — no direct pushes to{" "}
            <code>main</code>
          </li>
          <li>
            <strong>Require status checks to pass</strong> — automatic checks such as tests and lint
            must pass (show green)
          </li>
          <li>
            <strong>Require review from Code Owners</strong> — makes the CODEOWNERS file actually
            enforce something
          </li>
          <li>
            <strong>Do not allow bypassing the above settings</strong> — otherwise admins can skip
            all of these rules without anyone noticing
          </li>
        </ul>
        <Callout kind="warn" label="A CODEOWNERS file on its own does nothing">
          <p className="mb-0">
            It becomes a real rule only when branch protection has &ldquo;Require review from Code
            Owners&rdquo; switched on. Many teams write the file, think they are protected, and are
            not.
          </p>
        </Callout>

        <h2 id="why-iam">Why this explains AWS IAM</h2>
        <p>
          Compare what you want in GitHub with what IAM does in AWS. It is the same list, written
          twice.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>In GitHub</th>
                <th>In AWS IAM</th>
              </tr>
            </thead>
            <tbody>
              {mapping.map(([gh, aws], i) => (
                <tr key={i}>
                  <td>{gh}</td>
                  <td>{aws}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="The point">
          <p className="mb-0">
            If you have set up branch protection, you have already thought like IAM. You used
            different words. AWS says policies, groups and roles for the same ideas. A policy is a
            document that lists what is allowed. A group is a set of users. A role is a set of
            permissions that a person or a machine can take on for a while.
          </p>
        </Callout>
        <p>
          The idea behind the first question was <em>some files should be read-only for some
          people</em>. That <strong>is</strong> the principle of least privilege: give each person
          or machine only the access it needs. This is the main idea of Lesson 5. Here you reached
          it from your own experience, not from a textbook.
        </p>

        <h2 id="devops">Is this part of DevOps?</h2>
        <p>
          Yes, it is. It is called <strong>access governance</strong>: controlling who can do what.
          It applies to every tool in your stack:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Layer</th>
                <th>The question it answers</th>
              </tr>
            </thead>
            <tbody>
              {layers.map(([layer, q]) => (
                <tr key={layer}>
                  <td className="whitespace-nowrap"><strong>{layer}</strong></td>
                  <td>{q}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The same principle applies in all four places. Give each person and each machine only what
          it needs, and nothing more.
        </p>

        <h2 id="checklist">A practical setup checklist</h2>
        <ol className="steps">
          <li>
            <h3>Protect the main branch</h3>
            <p>Require pull requests. Allow no direct pushes. This one change prevents most accidents.</p>
          </li>
          <li>
            <h3>Add a CODEOWNERS file</h3>
            <p>
              Start with only the risky files. These are the dependency lists (such as{" "}
              <code>package.json</code>), config files and the <code>.github</code> folder.
            </p>
          </li>
          <li>
            <h3>Turn on &ldquo;Require review from Code Owners&rdquo;</h3>
            <p>Without this step, the CODEOWNERS file is only a suggestion.</p>
          </li>
          <li>
            <h3>Require status checks</h3>
            <p>Tests and lint must pass before a merge. This is where the CI/CD pipeline from Lesson 14 connects.</p>
          </li>
          <li>
            <h3>Review who has admin rights</h3>
            <p>
              Admins can often bypass protections. Keep that list short. The reason is the same as
              for keeping the AWS root user (the all-powerful first account) locked away.
            </p>
          </li>
        </ol>

        <hr />
        <p className="text-ink-dim">
          Background reading for <Link href={lessonHref(lessonFive)}>Lesson 5 — {lessonFive.title}</Link>.
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
          href={lessonHref(lessonFive)}
          className="block rounded-xl border border-line px-5 py-4 text-ink hover:border-sky hover:bg-sky-soft hover:no-underline sm:text-right"
        >
          <div className="font-mono text-[0.75rem] uppercase tracking-[0.1em] text-sky">Read the lesson →</div>
          <div className="font-semibold">Lesson 5: {lessonFive.title}</div>
        </Link>
      </nav>
    </article>
  );
}
