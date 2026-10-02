import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import DeployPipeline from "@/components/figures/DeployPipeline";
import InterviewQA from "@/components/InterviewQA";
import LessonIntro from "@/components/LessonIntro";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson, READINGS, readingHref } from "@/lib/lessons";

const lesson = getLesson("lesson-14")!;
const githubReading = READINGS.find((r) => r.slug === "github-access-control")!;

export const metadata: Metadata = {
  title: `Lesson 14 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Concept: the assembly line for your code" },
  { id: "why-this-matters", label: "Why manual deploys fail" },
  { id: "vocabulary", label: "CI, continuous delivery and continuous deployment" },
  { id: "anatomy", label: "GitHub Actions anatomy" },
  { id: "design", label: "Designing the pipeline" },
  { id: "ci", label: "Step 1 — the CI workflow" },
  { id: "oidc", label: "Step 2 — let GitHub into AWS with no keys (OIDC)" },
  { id: "build", label: "Step 3 — build and push the image" },
  { id: "migrate", label: "Step 4 — database migrations from CI" },
  { id: "deploy", label: "Step 5 — roll out and verify" },
  { id: "rollback", label: "Rollbacks" },
  { id: "safety", label: "Making the pipeline safe" },
  { id: "speed", label: "Making it fast" },
  { id: "debugging", label: "When the pipeline fails" },
  { id: "cost", label: "What this costs" },
  { id: "interview", label: "Interview corner" },
  { id: "practice", label: "Practice task before Lesson 15" },
  { id: "conclusion", label: "Conclusion" },
];

const anatomy: [string, string, string][] = [
  ["Workflow", "One YAML file in .github/workflows/. A complete automated process", "ci.yml, deploy.yml"],
  ["Event (on:)", "What starts it", "push, pull_request, workflow_dispatch (manual button), schedule"],
  ["Job", "A group of steps that runs on one fresh machine. Jobs run in parallel unless one needs another", "test, build, deploy"],
  ["Runner", "The machine a job runs on. GitHub provides them; each job gets a clean one and it is destroyed after", "ubuntu-latest"],
  ["Step", "One command (run:) or one reusable action (uses:)", "pnpm install"],
  ["Action", "A packaged, reusable step written by someone else", "actions/checkout@v4"],
  ["Secret / variable", "Stored values: secrets are encrypted and masked in logs; variables are plain", "secrets.SOME_TOKEN, vars.AWS_REGION"],
  ["Environment", "A named target (production) with its own secrets, protection rules and approvers", "environment: production"],
  ["Artifact / cache", "Files handed between jobs / saved between runs to speed things up", "node_modules cache"],
];

const failures: [string, string, string][] = [
  ["Not authorized to perform sts:AssumeRoleWithWebIdentity", "The trust policy’s sub condition does not match the run (wrong repo, branch or environment) or permissions: id-token: write is missing", "Print the token claims (below), then fix the condition; check the workflow permissions block"],
  ["denied: User … is not authorized to perform ecr:…", "The deploy role lacks an ECR permission", "Add the missing action to the role's policy; CloudTrail shows the exact denied action"],
  ["pnpm install fails with frozen-lockfile error", "package.json and the lockfile disagree", "Run pnpm install locally and commit the updated lockfile"],
  ["Build passes locally, fails in CI", "Different Node version, missing env var, or a case-sensitive filename (macOS forgives; Linux does not)", "Match node-version to local; set build env vars; check import casing"],
  ["Workflow does not start", "YAML error, wrong branch filter, or the file is not on the default branch", "Actions tab shows a parse error; validate with actionlint"],
  ["Instance refresh ends Failed and rolls back", "New servers did not pass ALB health checks", "Read the ASG activity history and target health reasons; docker logs on a failed instance; often a bad env var or migration"],
  ["Deploy step hangs", "Waiting for an approval, or a command with no timeout", "Check the environment’s pending review; add timeout-minutes to jobs"],
  ["Two deploys collide", "No concurrency control", "Use a concurrency group with cancel-in-progress: false"],
];

export default function LessonFourteenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>CI/CD</strong> is the practice of letting a robot do everything that happens between{" "}
          <code>git push</code> and &ldquo;it is live&rdquo;: run the checks, build the image, ship it,
          verify it, and stop if anything is wrong. It is what Vercel did for you invisibly. Now you
          build the same thing, on <strong>GitHub Actions</strong>, with every step yours.
        </p>
        <Callout kind="note" label="The analogy — a factory line with inspectors">
          <p className="mb-0">
            A car does not go from the workshop to the showroom because someone feels confident. It
            moves along a line: parts are inspected, the car is assembled, tested, and only then
            shipped. If an inspector rejects it, the line stops, and no customer ever sees the
            defect. A pipeline is that line for code, and the tests are the inspectors.
          </p>
        </Callout>
        <DeployPipeline />

        <h2 id="why-this-matters">Why manual deploys fail</h2>
        <p>
          Recall the <code>~/deploy.sh</code> from Lesson 7, and the problems we listed. Every one is a
          real cause of real outages:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Manual deploy</th>
                <th>What eventually happens</th>
                <th>The pipeline fixes it by</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Someone SSHs in and runs commands</td><td>Steps get skipped at 11 p.m.; nobody knows what was done</td><td>Running the same script every time</td></tr>
              <tr><td>Tests are &ldquo;run when we remember&rdquo;</td><td>A broken build reaches customers</td><td>Failing the pipeline before deploy</td></tr>
              <tr><td>Build happens on the production server</td><td>Slow, competes with live traffic, differs from staging</td><td>Building once in a clean runner</td></tr>
              <tr><td>Only two people know how to deploy</td><td>Releases wait; the team fears deploy day</td><td>Anyone merges → it ships</td></tr>
              <tr><td>No record of who deployed what</td><td>&ldquo;What changed at 14:00?&rdquo; has no answer</td><td>A history: commit → run → image tag → deployment</td></tr>
              <tr><td>Rollback is improvised</td><td>Panic under pressure</td><td>A rehearsed one-click rollback</td></tr>
              <tr><td>SSH keys and AWS keys shared around</td><td>Leaks, ex-employees with access</td><td>No humans and no long-lived keys in the path</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The teams that ship most often break least. Small, frequent, automated releases are easier
          to test, easier to reason about, and trivially easy to revert — the opposite of the
          &ldquo;big scary Friday release&rdquo;.
        </p>

        <h2 id="vocabulary">CI, continuous delivery and continuous deployment</h2>
        <p>The letters cover three different levels of automation. Interviewers love the distinction:</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Term</th>
                <th>Automates</th>
                <th>A human decides…</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Continuous Integration (CI)</strong></td>
                <td>On every push/PR: install, lint, type-check, test, build</td>
                <td>Whether to merge</td>
              </tr>
              <tr>
                <td><strong>Continuous Delivery</strong></td>
                <td>CI + produces a release-ready, deployable artefact every time</td>
                <td>When to release (a manual approval button)</td>
              </tr>
              <tr>
                <td><strong>Continuous Deployment</strong></td>
                <td>CI + deploys to production automatically after checks pass</td>
                <td>Nothing — merge is release</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          We build <strong>continuous delivery with an approval gate</strong>: everything is
          automatic up to the door of production, and a GitHub &ldquo;environment&rdquo; asks a human
          to approve going through. Remove the gate later and you have continuous deployment.
        </p>

        <h2 id="anatomy">GitHub Actions anatomy</h2>
        <p>
          A workflow is a YAML file in your repository under <code>.github/workflows/</code>. Git
          history, code review and rollback apply to your pipeline exactly as they do to your code.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Word</th>
                <th>Meaning</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              {anatomy.map(([w, m, e]) => (
                <tr key={w}>
                  <td className="whitespace-nowrap"><strong>{w}</strong></td>
                  <td>{m}</td>
                  <td><code>{e}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>The smallest useful workflow, so the shape is clear before the real ones:</p>
        <Script
          title=".github/workflows/hello.yml"
          code={`name: Hello
on: push                         # the event

jobs:
  say-hello:                     # a job
    runs-on: ubuntu-latest       # its fresh machine
    steps:
      - uses: actions/checkout@v4          # step 1: an action that downloads your repo
      - run: echo "Commit \${{ github.sha }} by \${{ github.actor }}"   # step 2: a shell command`}
        />
        <p>
          <code>{"${{ … }}"}</code> is the expression syntax: it reads values from the run (
          <code>github.sha</code>, <code>secrets.X</code>, <code>needs.job.outputs.Y</code>) before
          the step executes. YAML is whitespace-sensitive — two-space indents, no tabs — and the
          number-one cause of &ldquo;my workflow does nothing&rdquo;.
        </p>

        <h2 id="design">Designing the pipeline</h2>
        <p>Two workflows, two triggers, one shared set of checks:</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Trigger</th>
                <th>What runs</th>
                <th>Touches AWS?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Pull request</strong></td>
                <td>CI: lint, types, tests, build</td>
                <td className="font-semibold text-emerald-300">No — safe even for forks</td>
              </tr>
              <tr>
                <td><strong>Merge to main</strong></td>
                <td>CI → build &amp; push image → (approval) → migrate → roll out → smoke test</td>
                <td>Yes, through a short-lived role</td>
              </tr>
              <tr>
                <td><strong>Manual button</strong></td>
                <td>Rollback to a previous image tag</td>
                <td>Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Pull requests never get AWS access. That separation is the core security rule: code that
          has not been reviewed must not be able to touch production. Combine it with branch
          protection so nothing reaches <code>main</code> without review and green checks — see{" "}
          <Link href={readingHref(githubReading)}>{githubReading.title}</Link>.
        </p>

        <h2 id="ci">Step 1 — the CI workflow</h2>
        <p>
          Written as a <em>reusable workflow</em> (<code>workflow_call</code>), so the pull-request
          check and the deploy pipeline run <strong>the exact same checks</strong> — no drift between
          &ldquo;what we test&rdquo; and &ldquo;what we ship&rdquo;.
        </p>
        <Script
          title=".github/workflows/ci.yml"
          code={`name: CI

on:
  pull_request:
  workflow_call:                 # lets deploy.yml reuse this file

concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true       # a new push cancels the now-pointless older run

permissions:
  contents: read                 # least privilege for the built-in token

jobs:
  checks:
    runs-on: ubuntu-latest
    timeout-minutes: 15          # a hung job must not burn minutes for 6 hours
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4          # version comes from "packageManager" in package.json

      - uses: actions/setup-node@v4
        with:
          node-version: 22                  # keep identical to your Dockerfile and laptop
          cache: pnpm                       # caches the pnpm store between runs

      - run: pnpm install --frozen-lockfile # fails if the lockfile is out of date: good
      - run: pnpm lint
      - run: pnpm exec tsc --noEmit
      - run: pnpm test --if-present
      - run: pnpm build
        env:
          NEXT_PUBLIC_API_URL: https://yourapp.com`}
        />
        <p>
          Commit it on a branch, open a pull request, and watch the checks appear at the bottom of the
          PR. Then in the repository&apos;s <strong>Settings → Branches</strong>, require the{" "}
          <code>checks</code> job to pass before merging. A check nobody is forced to respect is only
          a suggestion.
        </p>

        <h2 id="oidc">Step 2 — let GitHub into AWS with no keys (OIDC)</h2>
        <p>
          The pipeline must call AWS to push images and roll out servers. The tempting way is to
          create an IAM user, generate an access key, and paste it into GitHub Secrets. Lesson 5 said
          why that is the wrong reflex: a long-lived key that lives forever, can be exfiltrated by
          any compromised dependency in the pipeline, and works from anywhere.
        </p>
        <Callout kind="ok" label="The modern answer: OpenID Connect">
          <p className="mb-0">
            GitHub can hand each job a <strong>short-lived signed identity token</strong> that says
            &ldquo;I am the workflow run for repo X on branch Y&rdquo;. AWS is told to trust GitHub as
            an identity provider and to allow that token to assume a specific IAM role. The job then
            receives temporary credentials that expire in about an hour. <strong>There is no secret to
            store, rotate or leak.</strong> This is Lesson 5&apos;s role idea, extended to GitHub.
          </p>
        </Callout>
        <ol className="steps">
          <li>
            <h3>Tell AWS to trust GitHub (once per account)</h3>
            <p>
              IAM → Identity providers → Add provider → <strong>OpenID Connect</strong>. Provider
              URL <code>https://token.actions.githubusercontent.com</code>, audience{" "}
              <code>sts.amazonaws.com</code>. Free, and done once.
            </p>
          </li>
          <li>
            <h3>Create the role, with a trust policy that pins it to your repository</h3>
            <p>
              This is the security-critical part. The <code>sub</code> (subject) condition decides
              exactly <em>which</em> workflow runs may become this role. Without it, any repository on
              GitHub could assume it.
            </p>
            <Script
              title="github-trust.json"
              code={`{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": [
          "repo:YOUR-ORG/myapp:ref:refs/heads/main",
          "repo:YOUR-ORG/myapp:environment:production"
        ]
      }
    }
  }]
}`}
            />
            <Callout kind="warn" label="Why there are two subjects">
              <p className="mb-0">
                The token&apos;s <code>sub</code> depends on how the job runs. A job with no{" "}
                <code>environment:</code> has <code>…:ref:refs/heads/main</code>. A job that declares{" "}
                <code>environment: production</code> has <code>…:environment:production</code>{" "}
                <em>instead</em>. Our build job is the first kind and the deploy job the second, so the
                role must trust both. Forgetting one is the most common OIDC error
                (&ldquo;Not authorized to perform sts:AssumeRoleWithWebIdentity&rdquo;).
              </p>
            </Callout>
            <p>
              In the console: IAM → Roles → Create role → <strong>Web identity</strong>, pick the
              GitHub provider, and fill in your organisation, repository and branch — the console
              writes most of this trust policy for you. Name the role <code>github-deploy</code>,
              then edit the trust policy to add the <code>environment:production</code> line.
            </p>
          </li>
          <li>
            <h3>Give it only the permissions the pipeline needs</h3>
            <p>Attach an inline policy that allows exactly the deploy and nothing else:</p>
            <ul>
              <li>log in to ECR and push images to the <code>myapp</code> repository;</li>
              <li>upload to <code>_next/static/*</code> in the assets bucket (Lesson 11);</li>
              <li>update the one parameter <code>/myapp/image-tag</code>;</li>
              <li>start and watch an instance refresh on the Auto Scaling group;</li>
              <li>send an SSM command to the app servers (for migrations, Step 4).</li>
            </ul>
            <p>
              Note what is <em>absent</em>: no IAM permissions, no <code>ec2:*</code>, no ability to
              read the database or delete anything. If this role were ever abused, the blast radius is
              &ldquo;deploy a new image&rdquo;. (<code>SendCommand</code> on <code>*</code> is a
              simplification; in a strict setup restrict it to instances tagged{" "}
              <code>app=myapp</code> with a condition.)
            </p>
          </li>
        </ol>

        <h2 id="build">Step 3 — build and push the image</h2>
        <p>
          The deploy workflow. It calls the CI workflow first, then builds, pushes and rolls out.
          Read the top-level settings — each protects you from a specific failure:
        </p>
        <Script
          title=".github/workflows/deploy.yml"
          code={`name: Deploy

on:
  push:
    branches: [main]

concurrency:
  group: deploy-production       # only ONE deploy at a time
  cancel-in-progress: false      # never kill a deploy that is halfway through

permissions:
  id-token: write                # allow the job to request an OIDC token
  contents: read

jobs:
  ci:
    uses: ./.github/workflows/ci.yml       # exactly the same checks as a pull request

  build:
    needs: ci                              # nothing is built unless the checks passed
    runs-on: ubuntu-latest
    outputs:
      tag: \${{ steps.meta.outputs.tag }}
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-deploy
          aws-region: ap-south-1
      - id: ecr
        uses: aws-actions/amazon-ecr-login@v2
      - id: meta
        run: echo "tag=$(git rev-parse --short=12 HEAD)" >> "$GITHUB_OUTPUT"
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: \${{ steps.ecr.outputs.registry }}/myapp:\${{ steps.meta.outputs.tag }}
          cache-from: type=gha             # reuse layers from previous runs
          cache-to: type=gha,mode=max
      # then: copy .next/static out of the image and sync it to S3 (Lesson 11)

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production                # pauses for approval; also changes the OIDC subject
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-deploy
          aws-region: ap-south-1
      # 1. run database migrations inside the VPC (Step 4)
      # 2. set /myapp/image-tag to the new tag and start an instance refresh (Lesson 12)
      # 3. wait for the refresh, then curl https://yourapp.com/api/health — fail the run if it is down`}
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Line</th>
                <th>Why it matters</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>needs: ci</code></td><td>The pipeline stops at the first red check. Tests are a gate, not a report.</td></tr>
              <tr><td><code>permissions: id-token: write</code></td><td>Without it GitHub will not issue the OIDC token and the role assumption fails.</td></tr>
              <tr><td><code>concurrency … cancel-in-progress: false</code></td><td>Two merges in quick succession queue instead of racing each other into production.</td></tr>
              <tr><td>tag = short commit SHA</td><td>Every image is traceable to the exact code, and rollback means &ldquo;deploy that tag&rdquo;.</td></tr>
              <tr><td><code>cache-from: type=gha</code></td><td>Docker layers are cached in GitHub; a small change rebuilds in seconds (Lesson 9&apos;s layer order pays off here).</td></tr>
              <tr><td>Assets synced <em>before</em> the rollout</td><td>New HTML never references a hashed file that is not yet on the CDN (Lesson 11).</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="note" label="Where NEXT_PUBLIC_ values come from">
          <p className="mb-0">
            They are baked in at build time (Lesson 7), so CI must supply them as{" "}
            <code>build-args</code> — from GitHub <em>Variables</em> (they are public by definition).
            Never pass a real secret as a build arg: build args are visible in image history. Runtime
            secrets stay in SSM, read by the servers when they boot.
          </p>
        </Callout>

        <h2 id="migrate">Step 4 — database migrations from CI</h2>
        <p>
          Here is a trap that catches every team once. The runner is on GitHub&apos;s network. The
          database is in a <strong>private subnet</strong> (Lesson 8) and, by design, unreachable from
          it. So <code>prisma migrate deploy</code> from the runner cannot connect. There are three
          ways out:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Approach</th>
                <th>How</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Open the DB to the internet</td>
                <td>Allow GitHub&apos;s IP ranges</td>
                <td className="font-semibold text-red-300">Never. It undoes Lesson 8</td>
              </tr>
              <tr>
                <td>Run migrations <em>inside the VPC</em> via SSM</td>
                <td>Tell one server to run the new image&apos;s migrate command with its own env</td>
                <td className="font-semibold text-emerald-300">Our choice: no new infrastructure</td>
              </tr>
              <tr>
                <td>Self-hosted runner in the VPC, or an ECS one-off task</td>
                <td>The job runs on a machine that can reach RDS</td>
                <td>Good at larger scale</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          AWS <strong>Systems Manager Run Command</strong> executes a shell command on an instance
          without SSH or an open port — the instance&apos;s agent polls AWS for work. The servers need
          the managed policy <code>AmazonSSMManagedInstanceCore</code> on their role (add it to{" "}
          <code>myapp-ec2-role</code>).
        </p>
        <p>
          The migration step finds one running app server, then uses <code>send-command</code> to
          make it log in to ECR and run the <em>new</em> image once with the server&apos;s own env
          file and the command <code>prisma migrate deploy</code>. The step waits for the result
          and fails the deploy if the migration fails — before any server switches to the new
          code.
        </p>
        <p>
          The migration runs <strong>before</strong> the new servers start, against the same database
          the old servers are using. That is why Lesson 8&apos;s &ldquo;expand then contract&rdquo;
          rule matters: the old code must survive the new schema for the few minutes of the rollout.
          Also note the image must contain the migration tool and its files; if you build a minimal
          standalone image, either include the <code>prisma</code> CLI and schema in it or use a
          second Dockerfile target for migrations.
        </p>

        <h2 id="rollback">Rollbacks</h2>
        <p>
          Because every release is an immutable image with a tag, a rollback is not a rebuild — it is
          &ldquo;point the servers at the previous tag&rdquo;. Give the team a button that does it.
        </p>
        <p>
          A small <code>rollback.yml</code> workflow, started by hand from the Actions tab
          (<code>workflow_dispatch</code>) with one input — the tag to go back to — does just the
          last two moves of the deploy: write that tag to <code>/myapp/image-tag</code> and start
          an instance refresh. It uses the same role and the same <code>production</code>{" "}
          environment, so it needs the same approval.
        </p>
        <Callout kind="warn" label="Code rolls back; data does not">
          <p className="mb-0">
            Reverting the image is easy. A migration that has already dropped a column is not. That
            is the whole reason for additive, backward-compatible migrations, and for taking an RDS
            snapshot before any destructive one (add{" "}
            <code>aws rds create-db-snapshot</code> as a pipeline step before the migrate step for
            risky releases).
          </p>
        </Callout>

        <h2 id="safety">Making the pipeline safe</h2>
        <p>
          A pipeline that can deploy to production is also the most attractive target for an attacker.
          Treat it as production infrastructure:
        </p>
        <ul>
          <li>
            <strong>Approval gate.</strong> Settings → Environments → <em>production</em> → Required
            reviewers. The deploy job waits, and the reviewer sees exactly what will ship. Also
            restrict the environment to the <code>main</code> branch.
          </li>
          <li>
            <strong>Least-privilege token.</strong> Set <code>permissions:</code> explicitly in every
            workflow (as above). The default <code>GITHUB_TOKEN</code> can be broader than you need.
          </li>
          <li>
            <strong>Never expose secrets to untrusted code.</strong> Pull requests from forks do not
            receive secrets — leave it that way. Avoid <code>pull_request_target</code> with a
            checkout of the PR&apos;s code; it is the classic route to stolen secrets.
          </li>
          <li>
            <strong>Pin third-party actions.</strong> <code>uses: some/action@v4</code> follows a tag the
            author can move. For anything that touches your AWS role, pin to a full commit SHA and let
            Dependabot propose updates. A compromised popular action has stolen credentials from
            thousands of repositories before.
          </li>
          <li>
            <strong>Never print secrets.</strong> GitHub masks secrets it knows about, but a value
            transformed (base64, split, JSON-escaped) slips through. Do not <code>echo</code> them.
          </li>
          <li>
            <strong>Scope the OIDC trust to the branch/environment</strong>, as we did. A role that
            trusts &ldquo;any workflow in this repo&rdquo; lets any branch or PR deploy.
          </li>
          <li>
            <strong>Protect the workflow files.</strong> Add{" "}
            <code>.github/CODEOWNERS</code> requiring review for <code>.github/workflows/**</code>:
            editing the pipeline is equivalent to editing production access.
          </li>
        </ul>
        <p>
          To debug an OIDC failure, add a temporary step that prints the token&apos;s claims and
          compare its <code>sub</code> with your trust policy&apos;s condition. Remove the step
          afterwards.
        </p>

        <h2 id="speed">Making it fast</h2>
        <p>
          A pipeline nobody waits for is a pipeline people trust. Target under ten minutes end to end,
          and under five for the PR check.
        </p>
        <ul>
          <li>
            <strong>Cache dependencies</strong> (<code>setup-node</code> with <code>cache: pnpm</code>)
            and <strong>Docker layers</strong> (<code>type=gha</code>). Usually the biggest win.
          </li>
          <li>
            <strong>Run independent work in parallel</strong>: split lint, types and tests into
            separate jobs; they start together on separate runners.
          </li>
          <li>
            <strong>Cancel outdated runs</strong> for pull requests (<code>cancel-in-progress: true</code>{" "}
            on CI, but <em>false</em> for deploys).
          </li>
          <li>
            <strong>Skip irrelevant work</strong> with path filters when a change only touches docs.
          </li>
          <li>
            <strong>Set <code>timeout-minutes</code></strong> so a stuck job cannot burn your free
            minutes.
          </li>
        </ul>

        <h2 id="debugging">When the pipeline fails</h2>
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
              {failures.map(([s, c, f]) => (
                <tr key={s}>
                  <td><code>{s}</code></td>
                  <td>{c}</td>
                  <td>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          A general method: open the failing run, expand the red step, read the <em>first</em> error
          (later ones are usually fallout), reproduce locally with the same commands, and fix the
          cause. For AWS permission errors, CloudTrail (Lesson 18) records the exact denied action.
        </p>

        <h2 id="cost">What this costs</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Approx. price</th></tr>
            </thead>
            <tbody>
              <tr><td>GitHub Actions, public repos</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>GitHub Actions, private repos</td><td>2,000 Linux minutes/month on the Free plan (3,000 on Pro), then ~$0.008/min</td></tr>
              <tr><td>OIDC role, SSM, instance refresh</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>ECR storage</td><td>~$0.10 per GB-month (add a lifecycle rule to keep the last ~20 images)</td></tr>
              <tr><td>Data pulled from ECR into EC2, same region</td><td className="font-semibold text-emerald-300">Free</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          A ten-minute pipeline run ten times a day is about 3,000 minutes a month, so a private
          project can pass the free allowance. That is where caching and cancelling stale runs stop
          being &ldquo;nice&rdquo; and start saving money.
        </p>

        <h2 id="interview">Interview corner</h2>
        <InterviewQA
          items={[
            {
              q: "Continuous integration vs continuous delivery vs continuous deployment?",
              a: (
                <p className="mb-0">
                  CI merges and validates changes frequently with automated build and tests.
                  Continuous delivery keeps every passing build releasable, with a manual approval to
                  ship. Continuous deployment removes the approval: every passing change goes to
                  production automatically.
                </p>
              ),
            },
            {
              q: "How does your pipeline authenticate to AWS?",
              a: (
                <p className="mb-0">
                  OIDC federation: GitHub issues a short-lived signed token per run; an IAM role trusts
                  the GitHub OIDC provider with conditions on audience and subject (repo, branch or
                  environment); the job exchanges it for temporary credentials. No stored access keys.
                </p>
              ),
            },
            {
              q: "Your CI runner cannot reach the private database to migrate. Options?",
              a: (
                <p className="mb-0">
                  Never open the DB publicly. Run migrations inside the VPC — through SSM Run Command
                  on an instance, an ECS one-off task, or a self-hosted runner — using the new image,
                  before rolling out the servers, with backward-compatible migrations.
                </p>
              ),
            },
            {
              q: "How do you roll back a bad release?",
              a: (
                <p className="mb-0">
                  Redeploy the previous immutable image tag (update the parameter and run an instance
                  refresh, or re-run the pipeline for the old commit). Data changes need forward-fix or
                  a restore, which is why migrations are additive and risky ones are preceded by a
                  snapshot.
                </p>
              ),
            },
            {
              q: "What are the security risks of a CI/CD pipeline and how do you reduce them?",
              a: (
                <p className="mb-0">
                  Stolen long-lived credentials (use OIDC), untrusted PR code reaching secrets (no
                  secrets for forks, avoid pull_request_target), compromised third-party actions (pin to
                  SHAs), over-broad roles (least privilege), and unreviewed workflow edits (CODEOWNERS,
                  branch protection, environment approvals).
                </p>
              ),
            },
            {
              q: "Why tag images with the commit SHA instead of latest?",
              a: (
                <p className="mb-0">
                  Traceability and determinism: the tag identifies exactly the code that is running,
                  servers can never diverge, and rollback is deploying an earlier tag. <code>latest</code>{" "}
                  is mutable and ambiguous.
                </p>
              ),
            },
            {
              q: "Why is concurrency control important for deployments?",
              a: (
                <p className="mb-0">
                  Two overlapping deploys can interleave migrations and rollouts and leave the system in
                  a mixed state. A concurrency group serialises them; not cancelling an in-progress
                  deploy avoids abandoning it half-done.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 15</h2>
        <ol>
          <li>
            Add <code>ci.yml</code>. Open a pull request with a deliberate lint error and watch the
            check fail; fix it and watch it pass. Turn on required checks for <code>main</code>.
          </li>
          <li>
            Create the OIDC provider, the <code>github-deploy</code> role with the trust and least-privilege
            policies, and a <code>production</code> environment with a required reviewer (yourself).
          </li>
          <li>
            Add <code>deploy.yml</code>. Merge a small visible change (a text on the home page) and watch:
            checks → build → approval → migrate → rollout → smoke test → the change is live with no
            SSH.
          </li>
          <li>
            Break it on purpose: change the trust policy&apos;s repo name and read the error, then fix
            it. Print the OIDC claims with the debug step to see what <code>sub</code> looks like.
          </li>
          <li>
            Introduce a bug that fails the health check in a new release. Watch the instance refresh
            fail (or the smoke test) and the old servers keep serving. Then run the rollback
            workflow.
          </li>
          <li>
            Add an ECR lifecycle policy that keeps only the 20 most recent images, and add{" "}
            <code>.github/CODEOWNERS</code> covering the workflows folder.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Add a <code>pull_request</code> job that builds the Docker image (without pushing) so a broken
            Dockerfile is caught in review, and a Dependabot config (
            <code>.github/dependabot.yml</code>) that opens weekly PRs for npm packages and GitHub
            Actions.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          Every release is now the same sequence of machine steps, with a record, an approval gate and
          a rollback — and nobody holds SSH keys or AWS keys to make it happen.
        </p>
        <ul>
          <li>
            <strong>CI</strong> checks every PR with the same commands the deploy uses (reusable
            workflow); branch protection makes the checks mandatory.
          </li>
          <li>
            <strong>OIDC, not access keys</strong>: short-lived credentials, a role scoped to your
            repo, branch and environment, with only the permissions the pipeline needs.
          </li>
          <li>
            <strong>Build once, tag by SHA, ship the artefact.</strong> Assets to S3 first, migrations
            from inside the VPC, then a health-gated rolling refresh and a smoke test.
          </li>
          <li>
            <strong>Safety is part of the design</strong>: approvals, concurrency, pinned actions,
            explicit permissions, reviewed workflow changes.
          </li>
          <li>
            <strong>Rollback is a rehearsed button</strong>, and migrations stay backward-compatible so
            it works.
          </li>
        </ul>
        <p>
          The application is automated. The <em>infrastructure</em> is still hand-built commands in
          your shell history. Next we describe all of it in code with Terraform.
        </p>

        <hr />
        <p>
          End of Lesson 14. Next: <strong>Lesson 15 — Terraform: Infrastructure as Code</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
