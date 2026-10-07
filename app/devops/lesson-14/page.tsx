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
  ["Workflow", "One YAML file (a text file that uses indentation) in .github/workflows/. It describes one complete automated process", "ci.yml, deploy.yml"],
  ["Event (on:)", "What starts the workflow", "push, pull_request, workflow_dispatch (a manual button), schedule (a timer)"],
  ["Job", "A group of steps that runs on one fresh machine. Jobs run at the same time, unless one job needs another", "test, build, deploy"],
  ["Runner", "The machine that runs a job. GitHub provides them. Each job gets a clean one, and it is deleted afterwards", "ubuntu-latest"],
  ["Step", "One command (run:) or one ready-made action (uses:)", "pnpm install"],
  ["Action", "A packaged step, written by someone else, that you can reuse", "actions/checkout@v4"],
  ["Secret / variable", "Stored values. Secrets are encrypted and hidden in logs. Variables are plain text", "secrets.SOME_TOKEN, vars.AWS_REGION"],
  ["Environment", "A named target (such as production) with its own secrets, protection rules and people who approve", "environment: production"],
  ["Artifact / cache", "An artifact is a file passed between jobs. A cache is a saved folder that makes later runs faster", "node_modules cache"],
];

const failures: [string, string, string][] = [
  ["Not authorized to perform sts:AssumeRoleWithWebIdentity", "The sub condition in the trust policy does not match the run (wrong repo, branch or environment), or permissions: id-token: write is missing", "Print the token claims (see below), then fix the condition. Also check the permissions block of the workflow"],
  ["denied: User … is not authorized to perform ecr:…", "The deploy role does not have an ECR permission", "Add the missing action to the role's policy. CloudTrail (the AWS activity log) shows the exact action that was denied"],
  ["pnpm install fails with frozen-lockfile error", "package.json and the lockfile do not match", "Run pnpm install on your machine and commit the updated lockfile"],
  ["Build passes locally, fails in CI", "A different Node version, a missing env variable, or a file name with different upper and lower case letters (macOS accepts it, Linux does not)", "Use the same node-version as on your machine. Set the build env variables. Check the upper and lower case of your imports"],
  ["Workflow does not start", "A YAML error, a wrong branch filter, or (for manual or scheduled runs) the file is not on the default branch", "The Actions tab shows a parse error. Check the file with actionlint, a tool that finds mistakes in workflow files"],
  ["Instance refresh ends as Failed (and rolls back, if automatic rollback is turned on)", "The new servers did not pass the ALB health checks", "Read the ASG activity history and the target health reasons. Run docker logs on a failed server. Often the cause is a bad env variable or a bad migration"],
  ["Deploy step hangs", "The job is waiting for an approval, or a command has no time limit", "Check the pending review of the environment. Add timeout-minutes to jobs"],
  ["Two deploys collide", "There is no concurrency control", "Use a concurrency group with cancel-in-progress: false, so that deploys run one after the other"],
];

export default function LessonFourteenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>CI/CD</strong> means continuous integration and continuous delivery (or deployment).
          In short, a robot does everything between <code>git push</code> and &ldquo;it is
          live&rdquo;. It runs the checks, builds the image, ships it, tests it, and stops if
          anything is wrong. Vercel did this for you, out of sight. Now you build the same thing
          yourself on <strong>GitHub Actions</strong>. This is the automation service built into
          GitHub. It runs jobs when something happens in your repository, such as a push. You own
          every step.
        </p>
        <p>
          Three more words you will meet often. A <strong>pipeline</strong> is a series of automatic
          steps that your code passes through on its way to production. A{" "}
          <strong>Docker image</strong> is a packed file that holds your app and everything it needs
          to run, so it works the same on every server. A <strong>smoke test</strong> is a quick
          check, after a release, that the main pages still work.
        </p>
        <Callout kind="note" label="The analogy — a factory line with inspectors">
          <p className="mb-0">
            A car does not reach the showroom just because someone feels sure it is fine. It moves along
            a line. The parts are inspected, the car is built and tested, and only then is it
            shipped. If an inspector rejects the car, the line stops, and no customer ever sees the
            problem. A pipeline is this line for code, and the tests are the inspectors.
          </p>
        </Callout>
        <DeployPipeline />

        <h2 id="why-this-matters">Why manual deploys fail</h2>
        <p>
          SSH (Secure Shell) is a way to log in to a server from far away and type commands on it.
          Remember the <code>~/deploy.sh</code> script from Lesson 7 and the problems we listed. Each of
          them has caused real outages:
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
              <tr><td>Someone SSHs in and runs commands</td><td>Steps get skipped at 11 p.m., and nobody knows what was done</td><td>Running the same script every time</td></tr>
              <tr><td>Tests are &ldquo;run when we remember&rdquo;</td><td>A broken build reaches customers</td><td>Failing the pipeline before deploy</td></tr>
              <tr><td>Build happens on the production server</td><td>It is slow, it competes with live traffic, and it differs from staging</td><td>Building once in a clean runner</td></tr>
              <tr><td>Only two people know how to deploy</td><td>Releases wait, and the team is afraid of deploy day</td><td>Anyone merges, and it ships</td></tr>
              <tr><td>No record of who deployed what</td><td>&ldquo;What changed at 14:00?&rdquo; has no answer</td><td>Keeping a history: commit, run, image tag, deployment</td></tr>
              <tr><td>Rollback is improvised</td><td>Rushed decisions under pressure</td><td>A rehearsed one-click rollback</td></tr>
              <tr><td>SSH keys and AWS keys shared around</td><td>Leaks, and former employees who still have access</td><td>Having no humans and no long-lived keys in the process</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Teams that release most often tend to break the least. Small, frequent, automatic releases
          are easier to test, easier to understand, and very easy to undo. They are the opposite of
          the &ldquo;large, risky Friday release&rdquo;.
        </p>

        <h2 id="vocabulary">CI, continuous delivery and continuous deployment</h2>
        <p>The letters stand for three different levels of automation. Interviewers like to ask about the
          difference:</p>
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
                <td>On every push/PR (pull request): install, lint, type-check, test, build</td>
                <td>Whether to merge</td>
              </tr>
              <tr>
                <td><strong>Continuous Delivery</strong></td>
                <td>CI, plus it builds a ready-to-release package (an artefact) every time</td>
                <td>When to release (with a manual approval button)</td>
              </tr>
              <tr>
                <td><strong>Continuous Deployment</strong></td>
                <td>CI, plus it deploys to production by itself after the checks pass</td>
                <td>Nothing. A merge is a release</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A <strong>pull request</strong> (PR) is a request to merge your branch into another branch,
          so that others can review the change first. <strong>Lint</strong> is a check that finds
          style problems and likely mistakes in code. <strong>Type-check</strong> is a check that
          finds wrong kinds of values (for example, text where a number is expected) in TypeScript
          code.
        </p>
        <p>
          We build <strong>continuous delivery with an approval gate</strong>. Everything is automatic
          up to the door of production. There, a GitHub &ldquo;environment&rdquo; asks a person to
          approve. If you remove the gate later, you have continuous deployment.
        </p>

        <h2 id="anatomy">GitHub Actions anatomy</h2>
        <p>
          A workflow is a YAML file in your repository, in the folder <code>.github/workflows/</code>.
          Git history, code review and rollback work for your pipeline in the same way as for your
          code.
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
        <p>Here is the smallest useful workflow. It shows the shape before we look at the real ones:</p>
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
          <code>{"${{ … }}"}</code> is an expression. It reads values from the run, such as{" "}
          <code>github.sha</code> (the commit ID), <code>secrets.X</code> or{" "}
          <code>needs.job.outputs.Y</code>, before the step runs. YAML cares about spaces. Use two
          spaces for each indent and never use tabs. Wrong spaces are the number-one reason for
          &ldquo;my workflow does nothing&rdquo;.
        </p>

        <h2 id="design">Designing the pipeline</h2>
        <p>We use two workflows with two triggers, and they share one set of checks:</p>
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
                <td className="font-semibold text-emerald-300">No. It is safe even for forks (a fork is someone else&apos;s copy of your repo)</td>
              </tr>
              <tr>
                <td><strong>Merge to main</strong></td>
                <td>CI → build &amp; push image → (approval) → migrate → roll out → smoke test</td>
                <td>Yes, through a role that works for a short time</td>
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
          Pull requests never get AWS access. This split is the main security rule: code that nobody
          has reviewed must not be able to touch production. Combine it with branch protection (rules
          that stop changes from reaching <code>main</code> without a review and passing checks).
          See{" "}
          <Link href={readingHref(githubReading)}>{githubReading.title}</Link>.
        </p>

        <h2 id="ci">Step 1 — the CI workflow</h2>
        <p>
          We write it as a <em>reusable workflow</em> (<code>workflow_call</code>). This is a workflow
          that other workflows can call. So the pull-request check and the deploy pipeline run{" "}
          <strong>exactly the same checks</strong>. What we test and what we ship cannot drift
          apart.
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
  contents: read                 # least privilege: the built-in token gets only what it needs

jobs:
  checks:
    runs-on: ubuntu-latest
    timeout-minutes: 15          # a stuck job must not use up minutes for 6 hours
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4          # version comes from "packageManager" in package.json

      - uses: actions/setup-node@v4
        with:
          node-version: 22                  # keep identical to your Dockerfile and laptop
          cache: pnpm                       # caches the pnpm store between runs

      - run: pnpm install --frozen-lockfile # fails if the lockfile is out of date (good: the lockfile pins exact versions)
      - run: pnpm lint
      - run: pnpm exec tsc --noEmit
      - run: pnpm test --if-present
      - run: pnpm build
        env:
          NEXT_PUBLIC_API_URL: https://yourapp.com`}
        />
        <p>
          Commit it on a branch, open a pull request, and watch the checks appear at the bottom of the
          PR. Then go to the repository&apos;s <strong>Settings → Branches</strong> (or Rules →
          Rulesets, in newer versions of GitHub) and require the <code>checks</code> job to pass
          before merging. A check that nobody must obey is only a suggestion.
        </p>

        <h2 id="oidc">Step 2 — let GitHub into AWS with no keys (OIDC)</h2>
        <p>
          The pipeline must call AWS to push images and roll out servers. The tempting way is to create
          an IAM user, make an access key, and paste it into GitHub Secrets. Lesson 5 explained why
          this is a bad habit. (IAM, Identity and Access Management, is the AWS service that
          controls who may do what. An IAM role is an identity with a set of permissions that a
          person or program can take on for a short time. ECR, Elastic Container Registry, is the
          AWS store for Docker images.) The key lives forever. Any compromised package in the pipeline can
          steal it. And it works from anywhere.
        </p>
        <Callout kind="ok" label="The modern answer: OpenID Connect">
          <p className="mb-0">
            <strong>OpenID Connect (OIDC)</strong> is a standard way for one service to prove an
            identity to another. GitHub can give each job a{" "}
            <strong>short-lived signed identity token</strong>. The token says &ldquo;I am the
            workflow run for repo X on branch Y&rdquo;. You tell AWS to trust GitHub as an identity
            provider, and to let that token <em>assume</em> (take on) one specific IAM role. The job
            then gets temporary credentials that expire after about an hour.{" "}
            <strong>There is no secret to store, change or leak.</strong> This is Lesson 5&apos;s
            role idea, extended to GitHub.
          </p>
        </Callout>
        <ol className="steps">
          <li>
            <h3>Tell AWS to trust GitHub (once per account)</h3>
            <p>
              Go to IAM → Identity providers → Add provider → <strong>OpenID Connect</strong>. Use the
              provider URL <code>https://token.actions.githubusercontent.com</code> and the audience{" "}
              <code>sts.amazonaws.com</code>. This is free, and you do it only once.
            </p>
          </li>
          <li>
            <h3>Create the role, with a trust policy that ties it to your repository</h3>
            <p>
              This is the most important part for security. A <strong>trust policy</strong> says who may
              take on the role. Its <code>sub</code> (subject) condition decides exactly{" "}
              <em>which</em> workflow runs may become this role. Without it, any repository on GitHub
              could use your role.
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
                The <code>sub</code> in the token depends on how the job runs. A job with no{" "}
                <code>environment:</code> has <code>…:ref:refs/heads/main</code>. A job that declares{" "}
                <code>environment: production</code> has <code>…:environment:production</code>{" "}
                <em>instead</em>. Our build job is the first kind and the deploy job is the second
                kind, so the role must trust both. Forgetting one is the most common OIDC error
                (&ldquo;Not authorized to perform sts:AssumeRoleWithWebIdentity&rdquo;).
              </p>
            </Callout>
            <p>
              In the console, go to IAM → Roles → Create role → <strong>Web identity</strong>. Pick the
              GitHub provider and fill in your organisation, repository and branch. The console
              writes most of the trust policy for you. Name the role <code>github-deploy</code>, then
              edit the trust policy to add the <code>environment:production</code> line.
            </p>
          </li>
          <li>
            <h3>Give it only the permissions the pipeline needs</h3>
            <p>Attach an inline policy (a policy stored inside the role) that allows exactly the deploy and nothing else:</p>
            <ul>
              <li>log in to ECR and push images to the <code>myapp</code> repository;</li>
              <li>upload to <code>_next/static/*</code> in the assets bucket (Lesson 11);</li>
              <li>update the one parameter <code>/myapp/image-tag</code>;</li>
              <li>start and watch an instance refresh on the Auto Scaling group (an Auto Scaling group is an AWS feature that keeps a set of servers running. An instance refresh replaces those servers with new ones, a few at a time);</li>
              <li>send an SSM command to the app servers (for migrations, Step 4).</li>
            </ul>
            <p>
              Notice what is <em>missing</em>: no IAM permissions, no <code>ec2:*</code>, and no way to
              read the database or delete anything. If someone ever abused this role, the damage
              (the &ldquo;blast radius&rdquo;) would be limited to &ldquo;deploy a new image&rdquo;.
              Allowing <code>SendCommand</code> on <code>*</code> is a simplification. In a strict
              setup, limit it with a condition to servers that have the tag{" "}
              <code>app=myapp</code>.
            </p>
          </li>
        </ol>

        <h2 id="build">Step 3 — build and push the image</h2>
        <p>
          This is the deploy workflow. It calls the CI workflow first. Then it builds the image,
          pushes it, and rolls it out. Read the settings at the top. Each one protects you from a
          specific failure. (<code>concurrency</code> means how many runs may go at the same time.
          A <em>runner</em> is the machine that runs a job.)
        </p>
        <Script
          title=".github/workflows/deploy.yml"
          code={`name: Deploy

on:
  push:
    branches: [main]

concurrency:
  group: deploy-production       # only ONE deploy runs at a time
  cancel-in-progress: false      # never stop a deploy that is half done

permissions:
  id-token: write                # allow the job to request an OIDC token
  contents: read

jobs:
  ci:
    uses: ./.github/workflows/ci.yml       # the same checks as a pull request

  build:
    needs: ci                              # nothing is built unless the checks pass
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
      - uses: docker/setup-buildx-action@v3     # needed for the type=gha cache to work
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: \${{ steps.ecr.outputs.registry }}/myapp:\${{ steps.meta.outputs.tag }}
          cache-from: type=gha             # reuse Docker layers from earlier runs
          cache-to: type=gha,mode=max
      # then: copy .next/static out of the image and sync it to S3 (Lesson 11)

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production                # waits for approval; it also changes the OIDC subject
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
              <tr><td><code>needs: ci</code></td><td>The pipeline stops at the first failed check. Tests are a gate, not only a report.</td></tr>
              <tr><td><code>permissions: id-token: write</code></td><td>Without it, GitHub does not issue the OIDC token, and taking on the role fails.</td></tr>
              <tr><td><code>concurrency … cancel-in-progress: false</code></td><td>Two merges in quick succession wait in line instead of racing each other into production. (GitHub keeps only the newest waiting run.)</td></tr>
              <tr><td>tag = short commit SHA</td><td>A commit SHA is the unique ID of one Git commit, and a tag is a label on an image. Every image can be traced to its exact code, and a rollback means &ldquo;deploy that tag&rdquo;.</td></tr>
              <tr><td><code>cache-from: type=gha</code></td><td>Docker layers are saved in GitHub&apos;s cache, so a small change rebuilds in seconds (the layer order from Lesson 9 pays off here). It needs the buildx step above.</td></tr>
              <tr><td>Assets synced <em>before</em> the rollout</td><td>New HTML never points to a hashed file that is not yet on the CDN (Lesson 11).</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="note" label="Where NEXT_PUBLIC_ values come from">
          <p className="mb-0">
            These values are built into the app at build time (Lesson 7). So CI must give them to the
            build as <code>build-args</code>. Take them from GitHub <em>Variables</em>, because
            these values are public anyway. Never pass a real secret as a build arg, because build
            args can be seen in the image history. Secrets that are needed at run time stay in SSM,
            and the servers read them when they boot.
          </p>
        </Callout>

        <h2 id="migrate">Step 4 — database migrations from CI</h2>
        <p>
          Almost every team meets this problem. A <strong>migration</strong> is a script that changes
          the structure of the database. The runner is on GitHub&apos;s network. The database (RDS, the AWS managed database service) is
          in a <strong>private subnet</strong> (Lesson 8). A private subnet is a part of your
          network with no direct route from the internet. So, by design, the runner cannot reach it.
          Prisma is a database tool for Node apps, and <code>prisma migrate deploy</code> is its
          command that applies waiting migrations. It cannot connect from the runner. There are three ways
          to solve this:
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
                <td className="font-semibold text-red-300">Never. It cancels what Lesson 8 did</td>
              </tr>
              <tr>
                <td>Run migrations <em>inside the VPC</em> via SSM</td>
                <td>Tell one server to run the migrate command of the new image, with its own env variables</td>
                <td className="font-semibold text-emerald-300">Our choice: it needs nothing new</td>
              </tr>
              <tr>
                <td>A self-hosted runner in the VPC, or a one-time ECS task</td>
                <td>The job runs on a machine that can reach RDS</td>
                <td>Good for bigger projects</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          AWS <strong>Systems Manager Run Command</strong> runs a shell command on a server without SSH
          and without an open port. A small agent program on the server contacts AWS and asks for
          work. The servers need the managed policy <code>AmazonSSMManagedInstanceCore</code> on
          their role (add it to <code>myapp-ec2-role</code>).
        </p>
        <p>
          The migration step finds one running app server. Then it uses <code>send-command</code> to
          make that server log in to ECR and run the <em>new</em> image once, with the server&apos;s
          own env file and the command <code>prisma migrate deploy</code>. The step waits for the
          result. If the migration fails, the deploy fails, before any server switches to the new
          code.
        </p>
        <p>
          The migration runs <strong>before</strong> the new servers start, on the same database that
          the old servers still use. This is why the &ldquo;expand then contract&rdquo; rule from
          Lesson 8 matters. First you add new things. Later you remove the old things. The old code
          must keep working with the new schema (the database structure) for the few minutes of the
          rollout. Also, the image must contain the migration tool and its files. If you build a
          small standalone image, either include the <code>prisma</code> CLI and the schema in it,
          or use a second Dockerfile target for migrations.
        </p>

        <h2 id="rollback">Rollbacks</h2>
        <p>
          Every release is an image that never changes, and it has a tag. So a rollback is not a rebuild.
          It means &ldquo;point the servers at the previous tag&rdquo;. Give the team a button that
          does this.
        </p>
        <p>
          Make a small workflow called <code>rollback.yml</code>. You start it by hand from the Actions
          tab (<code>workflow_dispatch</code>) and give it one input: the tag to go back to. It does
          only the last two moves of the deploy. It writes that tag to <code>/myapp/image-tag</code>{" "}
          and starts an instance refresh. It uses the same role and the same <code>production</code>{" "}
          environment, so it needs the same approval.
        </p>
        <Callout kind="warn" label="Code rolls back; data does not">
          <p className="mb-0">
            Going back to an old image is easy. Going back after a migration has dropped a column is not.
            This is why migrations should only add things and stay backward compatible. It is also
            why you should take an RDS snapshot (a saved copy of the database) before any migration
            that removes data. For risky releases, add{" "}
            <code>aws rds create-db-snapshot</code> as a pipeline step before the migrate step.
          </p>
        </Callout>

        <h2 id="safety">Making the pipeline safe</h2>
        <p>
          A pipeline that can deploy to production is also a very attractive target for an attacker.
          Treat it like part of production:
        </p>
        <ul>
          <li>
            <strong>Approval gate.</strong> Go to Settings → Environments → <em>production</em> →
            Required reviewers. The deploy job waits, and the reviewer sees exactly what will ship.
            Also limit the environment to the <code>main</code> branch.
          </li>
          <li>
            <strong>Least-privilege token.</strong> Least privilege means giving only the permissions
            that are needed. Set <code>permissions:</code> in every workflow (as above). The default{" "}
            <code>GITHUB_TOKEN</code> can have more power than you need.
          </li>
          <li>
            <strong>Never show secrets to untrusted code.</strong> Pull requests from forks do not get
            secrets. Keep it that way. Avoid <code>pull_request_target</code> (an event that runs
            with secrets) together with a checkout of the PR&apos;s code. This is a classic way to
            lose secrets.
          </li>
          <li>
            <strong>Pin third-party actions.</strong> A line such as{" "}
            <code>uses: some/action@v4</code> follows a tag that the author can move. For anything that
            touches your AWS role, pin the action to a full commit SHA (the exact ID of one version).
            Let Dependabot (a GitHub tool that opens pull requests to update dependencies) suggest
            updates. A popular action that was hacked has exposed secrets in many repositories
            before.
          </li>
          <li>
            <strong>Never print secrets.</strong> GitHub hides the secrets it knows in logs. But a value
            that you change (base64, split into parts, JSON-escaped) can get through. Do not{" "}
            <code>echo</code> secrets.
          </li>
          <li>
            <strong>Limit the OIDC trust to the branch and environment</strong>, as we did. A role that
            trusts &ldquo;any workflow in this repo&rdquo; lets any branch or PR deploy.
          </li>
          <li>
            <strong>Protect the workflow files.</strong> Add a{" "}
            <code>.github/CODEOWNERS</code> file. It lists who must review changes to certain files.
            Require a review for <code>.github/workflows/**</code>. Editing the pipeline is the same
            as editing access to production.
          </li>
        </ul>
        <p>
          To debug an OIDC failure, add a temporary step that prints the claims (the facts) in the
          token. Compare its <code>sub</code> with the condition in your trust policy. Remove the
          step afterwards.
        </p>

        <h2 id="speed">Making it fast</h2>
        <p>
          People trust a pipeline that is fast. Aim for under ten minutes from start to finish, and
          under five minutes for the PR check.
        </p>
        <ul>
          <li>
            <strong>Cache dependencies</strong> (<code>setup-node</code> with <code>cache: pnpm</code>)
            and <strong>Docker layers</strong> (<code>type=gha</code>). This is usually the biggest
            gain.
          </li>
          <li>
            <strong>Run independent work in parallel.</strong> Split lint, types and tests into separate
            jobs. They start together on separate runners.
          </li>
          <li>
            <strong>Cancel old runs</strong> for pull requests (<code>cancel-in-progress: true</code>{" "}
            on CI, but <em>false</em> for deploys).
          </li>
          <li>
            <strong>Skip work that is not needed.</strong> Use path filters when a change only touches
            docs.
          </li>
          <li>
            <strong>Set <code>timeout-minutes</code></strong>, so a stuck job cannot use up your free
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
          Here is a general method. Open the failed run and open the red step. Read the{" "}
          <em>first</em> error, because later errors are usually only a result of it. Repeat the
          problem on your machine with the same commands, and fix the cause. For AWS permission
          errors, CloudTrail (Lesson 18) records the exact action that was denied.
        </p>

        <h2 id="cost">What this costs</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Approx. price</th></tr>
            </thead>
            <tbody>
              <tr><td>GitHub Actions, public repos</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>GitHub Actions, private repos</td><td>2,000 Linux minutes per month on the Free plan (3,000 on Pro). After that, about $0.006–$0.008 per minute (check the current price)</td></tr>
              <tr><td>OIDC role, SSM, instance refresh</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>ECR storage</td><td>~$0.10 per GB-month (add a lifecycle rule to keep only the last ~20 images)</td></tr>
              <tr><td>Data pulled from ECR into EC2, same region</td><td className="font-semibold text-emerald-300">Free</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          A ten-minute pipeline that runs ten times a day uses about 3,000 minutes a month. So a private
          project can go over the free amount. At that point, caching and cancelling old runs are no
          longer just nice. They save money.
        </p>

        <h2 id="interview">Interview corner</h2>
        <InterviewQA
          items={[
            {
              q: "Continuous integration vs continuous delivery vs continuous deployment?",
              a: (
                <p className="mb-0">
                  CI means changes are merged often and checked by an automatic build and tests.
                  Continuous delivery means every build that passes is ready to release, and a
                  person approves the release. Continuous deployment removes the approval. Every
                  change that passes goes to production automatically.
                </p>
              ),
            },
            {
              q: "How does your pipeline authenticate to AWS?",
              a: (
                <p className="mb-0">
                  With OIDC. GitHub gives each run a short-lived signed token. An IAM role trusts the
                  GitHub OIDC provider, with conditions on the audience and the subject (repo,
                  branch or environment). The job swaps the token for temporary credentials. No access
                  keys are stored anywhere.
                </p>
              ),
            },
            {
              q: "Your CI runner cannot reach the private database to migrate. Options?",
              a: (
                <p className="mb-0">
                  I never open the database to the internet. I run the migrations inside the VPC. I can use
                  SSM Run Command on a server, a one-time ECS task, or a self-hosted runner. I use the
                  new image and run the migration before I roll out the servers. The migrations must
                  stay backward compatible.
                </p>
              ),
            },
            {
              q: "How do you roll back a bad release?",
              a: (
                <p className="mb-0">
                  I deploy the previous image tag again. I update the parameter and run an instance refresh,
                  or I run the pipeline again for the old commit. Data changes cannot simply be
                  undone. They need a new fix going forward, or a restore. This is why migrations
                  should only add things, and why a risky one is preceded by a snapshot.
                </p>
              ),
            },
            {
              q: "What are the security risks of a CI/CD pipeline and how do you reduce them?",
              a: (
                <p className="mb-0">
                  The risks are: stolen long-lived credentials (the answer is OIDC), untrusted PR code that
                  reaches secrets (give no secrets to forks, avoid pull_request_target), hacked
                  third-party actions (pin them to SHAs), roles with too much power (least privilege),
                  and workflow edits that nobody reviewed (CODEOWNERS, branch protection, environment
                  approvals).
                </p>
              ),
            },
            {
              q: "Why tag images with the commit SHA instead of latest?",
              a: (
                <p className="mb-0">
                  There are two reasons: you can trace it, and it is predictable. The tag shows exactly
                  which code is running. Servers can never end up on different versions. A rollback
                  means deploying an earlier tag. The <code>latest</code> tag can change at any time
                  and does not say which version it is.
                </p>
              ),
            },
            {
              q: "Why is concurrency control important for deployments?",
              a: (
                <p className="mb-0">
                  Two deploys that overlap can mix their migrations and rollouts and leave the system in a
                  mixed state. A concurrency group makes them run one after the other. Not cancelling
                  a deploy that is running avoids leaving it half done.
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
            Add a bug that fails the health check in a new release. Watch the instance refresh fail (or
            the smoke test fail) while the old servers keep serving. Then run the rollback
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
          Every release is now the same list of automatic steps. It has a record, an approval gate and
          a rollback. And nobody needs SSH keys or AWS keys to make it happen.
        </p>
        <ul>
          <li>
            <strong>CI</strong> checks every PR with the same commands that the deploy uses (a reusable
            workflow). Branch protection makes the checks mandatory.
          </li>
          <li>
            <strong>OIDC, not access keys.</strong> The credentials are short-lived. The role is limited
            to your repo, branch and environment, and has only the permissions that the pipeline
            needs.
          </li>
          <li>
            <strong>Build once, tag with the SHA, ship the artefact.</strong> Send assets to S3 first, run
            migrations from inside the VPC, then do a rolling refresh that waits for health checks,
            and finish with a smoke test (a quick check that the main pages work).
          </li>
          <li>
            <strong>Safety is part of the design.</strong> Use approvals, concurrency control, pinned
            actions, explicit permissions, and reviews of workflow changes.
          </li>
          <li>
            <strong>A rollback is a button that you have practised.</strong> Migrations stay backward
            compatible, so the rollback works.
          </li>
        </ul>
        <p>
          The application is now automated. The <em>infrastructure</em> is still a set of commands that
          you typed by hand. Next, we describe all of it as code with Terraform.
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
