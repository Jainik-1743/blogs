import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Flow, QA, Timeline } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import Rollout from "@/components/sd/widgets/Rollout";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-58")!;

export const metadata: Metadata = {
  title: `Lesson 58 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "the-problem", label: "The Problem" },
  { id: "the-core-idea", label: "The Core Idea" },
  { id: "how-it-works", label: "How It Works" },
  { id: "trade-offs", label: "Trade-offs" },
  { id: "in-the-real-world", label: "In the Real World" },
  { id: "interview-questions", label: "Interview Questions" },
  { id: "key-takeaways", label: "Key Takeaways" },
  { id: "further-reading", label: "Further Reading" },
];

const code1 = `v1 v1 v1 v1  →  v2 v1 v1 v1  →  v2 v2 v1 v1  →  v2 v2 v2 v1  →  v2 v2 v2 v2`;

const code2 = `Step 1:   95% → v1     5% → v2 (canary)    watch errors, latency, business metrics
Step 2:   75% → v1    25% → v2             still healthy?
Step 3:   50% → v1    50% → v2
Step 4:            100% → v2               ✅ done
   At ANY step, if metrics worsen → send 100% back to v1 automatically`;

const code3 = `if (flags.isEnabled("new-checkout", { userId, country })) {
  return newCheckout(req);
}
return oldCheckout(req);`;

export default function SdLessonFiveEightPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Friday evening, release night. The team has collected <strong>three weeks</strong> of changes into one big
            release. The steps are manual: copy files, run a script, restart servers, and hope it works. At 11 PM, the new version
            goes live on <strong>every server at once</strong>. Checkout breaks. Nobody is sure which of the 140 changes
            caused it, and rolling back takes two hours because the database was changed too.
          </p>
          <p>
            Everyone is afraid of deploying (putting new code on the servers), so they deploy <strong>less often</strong>. This makes each release{" "}
            <strong>bigger and riskier</strong>. It is a bad circle that keeps getting worse.
          </p>
          <p>
            Remember from post 48: <strong>most incidents start with a change</strong>. The answer is not to change less.
            The answer is to change in <strong>small, automatic, safe steps that you can undo</strong>. This is what{" "}
            <strong>CI/CD</strong> and modern <strong>deployment strategies</strong> are for. CI/CD means Continuous
            Integration and Continuous Delivery (or Deployment). A deployment strategy is a plan for how new code reaches users.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about how a <strong>big restaurant chain launches a new dish</strong>.
          </p>
          <ul>
            <li>
              <strong>Continuous Integration</strong> is when the head chef <strong>tastes and checks</strong> every chef's small recipe
              changes <strong>every day</strong>, and does not wait a month for them to pile up.
            </li>
            <li>
              <strong>Canary release</strong> is offering the new dish at <strong>one restaurant</strong> first. If
              customers love it, try it at 10 restaurants, then everywhere. If they do not, take it away quickly, and only a
              few customers were affected. (The name comes from canary birds in coal mines, which warned miners of danger early.)
            </li>
            <li>
              <strong>Blue-green deployment</strong> is setting up a <strong>complete second kitchen</strong> with the
              new menu, and when it is ready, <strong>switching the customer entrance</strong> to it. If anything goes
              wrong, you switch the entrance back to the old kitchen at once.
            </li>
            <li>
              <strong>Feature flags</strong> are like having the dish <strong>on the menu, but hidden</strong> until the
              manager flips a switch. Or the dish is shown only to staff first.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="part-1-continuous-integration-ci">Part 1: Continuous Integration (CI)</h3>
          <p>
            <strong>CI (Continuous Integration)</strong> means developers <strong>merge small changes into the main branch often</strong>{" "}
            (at least daily), and <strong>every change is built and tested automatically</strong>. The main branch is the shared
            line of code that everyone's work joins. A <strong>pipeline</strong> is the list of automatic steps that run for each change.
          </p>
          <p>
            <strong>Lint</strong> is a tool that reads your code and warns about style problems and likely mistakes. <strong>Static analysis</strong> is a tool that
            checks code for bugs without running it. A <strong>unit test</strong> is a small automatic check of one function. A{" "}
            <strong>container registry</strong> is a server that stores built container images.
          </p>
          <Flow
            caption="A CI pipeline — every push, every time."
            nodes={[
              { title: <>Developer pushes</>, desc: <>a branch or pull request</> },
              { title: <>Build</>, desc: <>compile, bundle</> },
              { title: <>Lint &amp; static analysis</> },
              { title: <>Unit tests</> },
              { title: <>Integration / contract tests</> },
              { title: <>Security scans</>, desc: <>dependencies, secrets, SAST (scans your code for bugs without running it), image scan</> },
              { title: <>Image built</>, desc: <>tagged with the commit SHA, pushed to the registry</> },
              { title: <>Merge allowed</>, desc: <>or ❌ fix it before merging</>, tone: "good" },
            ]}
          />
          <p>
            <strong>Good CI practices:</strong>
          </p>
          <ul>
            <li>
              <strong>Trunk-based development:</strong> keep branches short (hours to a couple of days) and merge them to main
              often. Branches that live a long time cause big merge conflicts (two people changed the same code in different ways).
            </li>
            <li>
              <strong>Fast pipelines:</strong> aim for minutes, not hours. Slow CI makes people save up changes and merge them in big groups.
            </li>
            <li>
              <strong>Keep main always ready to release.</strong> If the build breaks, fix it <strong>at once</strong> (or undo
              the change that broke it).
            </li>
            <li>
              <strong>Build once, promote the same artefact.</strong> An artefact is the file you build, such as a container image.
              The <strong>exact same image</strong> (named by its commit SHA, the unique ID of a commit, or by its digest, post 55) moves through
              test → staging → production. Do not rebuild it for each environment. "Promote" means move it to the next environment.
            </li>
            <li>
              <strong>Automatic tests at several levels</strong>: many fast unit tests (test one small piece), fewer integration
              tests (test pieces working together), and a few end-to-end tests (test the whole app like a user). This shape is called the "test pyramid".
            </li>
            <li>
              <strong>Security checks built in</strong> (post 52).
            </li>
          </ul>
          <h3 id="part-2-continuous-delivery-vs-continuous-deployment">
            Part 2: Continuous Delivery vs Continuous Deployment
          </h3>
          <ul>
            <li>
              <strong>Continuous Delivery:</strong> every change that passes the pipeline is{" "}
              <strong>ready to deploy</strong> to production at any time, but a <strong>person</strong> clicks the
              button.
            </li>
            <li>
              <strong>Continuous Deployment:</strong> every change that passes the pipeline{" "}
              <strong>goes to production automatically</strong>, with no manual step.
            </li>
          </ul>
          <p>
            Both need strong automatic tests, monitoring and <strong>safe rollout strategies</strong>. We look at those next.
          </p>
          <p>
            <strong>A typical pipeline:</strong>
          </p>
          <Flow
            caption="From commit to 100% of users, with brakes at every stage."
            dir="row"
            nodes={[
              { title: <>Commit</> },
              { title: <>CI</>, desc: <>build, test, scan</> },
              { title: <>Staging</>, desc: <>automated checks</> },
              { title: <>Production canary</>, desc: <>waves, bake time (waiting and watching)</> },
              { title: <>Full rollout</>, desc: <>or automatic rollback</>, tone: "good" },
            ]}
          />
          <h3 id="part-3-deployment-strategies">Part 3: Deployment strategies</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">1. Recreate (stop everything, start new)</h4>
          <p>
            <strong>Recreate</strong> is a strategy that stops all the old instances and then starts the new ones. A <strong>rollback</strong> means going back to the previous version. The <strong>blast radius</strong> is how many
            users a bad change can hurt.
          </p>
          <Timeline
            caption="Recreate (big bang) — simple, with downtime."
            events={[
              { time: <>Before</>, text: <>v1 v1 v1</> },
              { time: <>Stop all</>, text: <>downtime starts</>, tone: "bad" },
              { time: <>Start new</>, text: <>v2 v2 v2</> },
              { time: <>Problem?</>, text: <>roll back = the same outage again</>, tone: "warn" },
            ]}
          />
          <ul>
            <li>✅ Simple, and old and new versions never run together.</li>
            <li>
              ❌ <strong>Downtime.</strong> This is only acceptable for dev environments or systems with planned maintenance
              windows (times when users expect the service to be off).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">2. Rolling update (replace instances gradually)</h4>
          <CodeBlock code={code1} />
          <ul>
            <li>
              ✅ <strong>No downtime</strong>, and no extra full environment is needed. It is the default in Kubernetes
              (post 56).
            </li>
            <li>
              ❌ <strong>Old and new versions run at the same time</strong>, so they must be <strong>compatible</strong>{" "}
              (APIs, database schema, which is the layout of the tables, and message formats).
            </li>
            <li>
              ❌ To roll back, you go <strong>backwards</strong> through the same process, which is not instant.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">3. Blue-green deployment</h4>
          <p>
            <strong>Blue-green deployment</strong> is a strategy that keeps two identical copies of production and moves users from one to the other in one step.
            Run <strong>two identical production environments</strong>. <strong>Blue</strong> is live,{" "}
            <strong>green</strong> gets the new version. You test green, then <strong>switch all traffic</strong> at the
            router or load balancer (the part that sends users to servers).
          </p>
          <Rollout caption="Roll out a buggy v2 three ways and count the users it hurts before you roll back." />
          <ul>
            <li>
              ✅ <strong>Instant switch and instant rollback</strong> (you just switch the router back).
            </li>
            <li>
              ✅ You can test the new version <strong>in an environment like production</strong> before it gets real traffic.
            </li>
            <li>
              ❌ <strong>Double the resources</strong> during the deploy.
            </li>
            <li>
              ❌ <strong>All users</strong> move at once, so a bug hits everyone until you switch back.
            </li>
            <li>
              ❌ <strong>Shared databases</strong> still need schema changes that work with both versions (see Part 5).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">4. Canary release</h4>
          <p>
            A <strong>canary release</strong> is a strategy that sends the new version to a small group of real users first. A <strong>rolling update</strong> replaces old instances with new ones a few at a time.
            Send a <strong>small percentage</strong> of real traffic to the new version,{" "}
            <strong>watch the metrics</strong>, and increase gradually:
          </p>
          <CodeBlock code={code2} />
          <ul>
            <li>
              ✅ <strong>Limits the blast radius.</strong> A bug affects only a small share of users, for a short time.
            </li>
            <li>
              ✅ <strong>Real production traffic</strong> tests the release. This finds problems that staging (a copy of production used for testing) never shows.
            </li>
            <li>
              ✅ Works well with <strong>automated analysis</strong>: compare the canary's error rate and latency with
              the baseline (the old version), and <strong>roll back automatically</strong> if the canary is worse.
            </li>
            <li>
              ❌ You need good <strong>traffic routing</strong> (a load balancer is a server that spreads requests across servers; a service mesh is a layer that manages traffic between services; a gateway is the single entry point for requests) and good{" "}
              <strong>metrics</strong> (numbers that show how the system is doing, posts 46–47).
            </li>
            <li>
              ❌ Old and new versions run together, so they must be <strong>compatible</strong>.
            </li>
          </ul>
          <p>
            <strong>Canary tips:</strong>
          </p>
          <ul>
            <li>
              Choose <strong>what to watch</strong>: error rates, p99 latency (the time that 99 out of 100 requests beat), crash rates, and{" "}
              <strong>business metrics</strong> (checkout success, sign-ups).
            </li>
            <li>
              <strong>Bake time:</strong> wait long enough at each step to catch slow problems, like memory leaks (a program that slowly uses more and more memory).
            </li>
            <li>
              For big platforms, <strong>roll out in waves</strong>: one server → one AZ (availability zone) → one region → all regions. A
              bad change then never hits everything at once.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">5. Shadow (dark) traffic</h4>
          <p>
            Send a <strong>copy</strong> of real production requests to the new version,{" "}
            <strong>but do not send its answers to users</strong>. Compare its results and speed with the current version.
          </p>
          <ul>
            <li>
              ✅ Tests with real traffic and <strong>no effect on users</strong>.
            </li>
            <li>
              ❌ Doubles the load, and you must <strong>prevent side effects</strong>. The shadow copy must not send emails,
              charge cards or write to real data.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">6. A/B testing</h4>
          <p>
            A/B testing works like a canary, because it also splits traffic. But the goal is different. The goal is{" "}
            <strong>product experiments</strong>: "does version B get more people to buy (conversions)?". It is usually controlled by{" "}
            <strong>feature flags</strong>, and you measure business results over days or weeks.
          </p>
          <h3 id="part-4-feature-flags-separating-deploy-from-release">
            Part 4: Feature flags, separating deploy from release
          </h3>
          <p>
            <strong>Deploying</strong> code (putting it on servers) and <strong>releasing</strong> a feature (letting users see it) do not have to happen together. A{" "}
            <strong>feature flag</strong> (or feature toggle) is a switch in your code that turns a feature on or off without a new deploy. The new code goes out{" "}
            <strong>turned off</strong>, and you turn it on <strong>step by step</strong>:
          </p>
          <CodeBlock lang="js" code={code3} />
          <p>
            <strong>Uses:</strong>
          </p>
          <ul>
            <li>
              <strong>gradual rollout:</strong> your own staff → 1% of users → 10% → everyone,
            </li>
            <li>
              <strong>targeting:</strong> by country, plan, device or beta testers,
            </li>
            <li>
              <strong>kill switches:</strong> a kill switch is a flag that turns off a broken or costly feature at once, without a deploy (post
              44),
            </li>
            <li>
              <strong>trunk-based development:</strong> merge unfinished work safely, because it is hidden behind a flag.
            </li>
          </ul>
          <p>
            <strong>Flag hygiene:</strong>
          </p>
          <ul>
            <li>
              <strong>Remove old flags</strong> after the full rollout. Hundreds of old flags become{" "}
              <strong>flag debt</strong>: confusing code and combinations that nobody tested.
            </li>
            <li>
              <strong>Give each flag an owner and an expiry date.</strong>
            </li>
            <li>
              <strong>Remember that flags themselves are changes.</strong> Turning one on for everyone is the same as a
              release, so watch it like one.
            </li>
          </ul>
          <p>
            Tools include LaunchDarkly, Unleash, Flagsmith, OpenFeature (an open standard that works with any vendor), and systems that companies build themselves.
          </p>
          <h3 id="part-5-database-changes-without-downtime">Part 5: Database changes without downtime</h3>
          <p>
            You can roll back code in seconds. <strong>Database schema changes often cannot be rolled back.</strong> (A schema is the
            structure of the database: its tables and columns.) During rolling,
            canary and blue-green deploys, <strong>old and new code run at the same time</strong> against the same
            database. So schema changes must be <strong>backward compatible</strong>, which means the old code still works with them. Use the{" "}
            <strong>expand and contract</strong> pattern (also called parallel change):
          </p>
          <p>
            <strong>
              Example: renaming a column <code>name</code> to <code>full_name</code>
            </strong>
          </p>
          <Timeline
            caption="Renaming a column without downtime — expand, migrate, contract."
            events={[
              { time: <>1 · Expand</>, text: <>add full_name (nullable, so it may be empty); old code ignores it</> },
              { time: <>2 · Dual write</>, text: <>deploy code that writes name and full_name, still reads name</> },
              { time: <>3 · Backfill</>, text: <>backfill: copy the existing values in small batches</> },
              { time: <>4 · Switch reads</>, text: <>deploy code that reads full_name, still writes both</> },
              { time: <>5 · Contract</>, text: <>stop writing name</> },
              {
                time: <>6 · Drop</>,
                text: <>remove the old column — every step was backward compatible</>,
                tone: "good",
              },
            ]}
          />
          <p>
            Every step is <strong>safe to roll back</strong> to the step before it.
          </p>
          <p>
            <strong>Other rules:</strong>
          </p>
          <ul>
            <li>
              <strong>Never</strong> drop or rename columns in the same deploy as the code change. (To drop a column is to delete it.)
            </li>
            <li>
              Run <strong>large migrations online</strong>: in small batches, with tools made for big tables. This avoids
              long table locks (times when nobody else can use the table).
            </li>
            <li>
              <strong>Take a backup</strong> (or check that point-in-time recovery works, post 45) before risky migrations.
            </li>
          </ul>
          <h3 id="part-6-automated-rollback-and-safety-nets">Part 6: Automated rollback and safety nets</h3>
          <ul>
            <li>
              <strong>Health-based auto-rollback:</strong> if the error rate or latency goes past a set limit during rollout,{" "}
              <strong>roll back automatically</strong>. Nobody needs to wake up at 3 AM.
            </li>
            <li>
              <strong>Deployment windows and freezes:</strong> do not make risky changes during busy times (a big sale), or
              when the <strong>error budget</strong> is used up (the amount of failure your reliability goal allows, post 47).
            </li>
            <li>
              <strong>Deploy markers on dashboards:</strong> show exactly when each version went out. Then you can link an incident to a change quickly (post 48).
            </li>
            <li>
              <strong>One-click rollback:</strong> always know how to go back to the previous version, and{" "}
              <strong>practise</strong> it.
            </li>
            <li>
              <strong>GitOps:</strong> a way of running systems where the desired state is stored in Git, and tools like <strong>Argo CD</strong> or{" "}
              <strong>Flux</strong> make the cluster match it. Deploying means merging a pull request, and{" "}
              <strong>rolling back means reverting a commit</strong> (undoing it).
            </li>
          </ul>
          <h3 id="part-7-measuring-delivery-performance-the-dora-metrics">
            Part 7: Measuring delivery performance, the DORA metrics
          </h3>
          <p>
            The DORA research programme (DevOps Research and Assessment), described in the book <em>Accelerate</em>,
            found that high-performing teams are <strong>both faster and more stable</strong>. It uses four key
            metrics (numbers you can measure):
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Question</th>
                  <th>Elite teams (roughly, in older DORA reports)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Deployment frequency</strong>
                  </td>
                  <td>How often do you deploy to production?</td>
                  <td>On demand, many times per day</td>
                </tr>
                <tr>
                  <td>
                    <strong>Lead time for changes</strong>
                  </td>
                  <td>How long from commit to running in production?</td>
                  <td>Less than a day</td>
                </tr>
                <tr>
                  <td>
                    <strong>Change failure rate</strong>
                  </td>
                  <td>% of deploys causing failures</td>
                  <td>Low</td>
                </tr>
                <tr>
                  <td>
                    <strong>Time to restore service</strong>
                  </td>
                  <td>How fast do you recover from a failure? (Newer reports call this "failed deployment recovery time".)</td>
                  <td>Less than an hour</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            The key idea: <strong>speed and stability are not opposites.</strong> Small, frequent, automatic changes that you can observe
            are <strong>safer</strong> than big, rare, manual ones. (Later DORA reports added more measures, such as reliability, and
            stopped using fixed "elite" levels. But these four remain the core.)
          </p>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Strategy</th>
                  <th>Downtime</th>
                  <th>Rollback speed</th>
                  <th>Extra resources</th>
                  <th>Blast radius</th>
                  <th>Complexity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Recreate</td>
                  <td>❌ Yes</td>
                  <td>Slow</td>
                  <td>None</td>
                  <td>Everyone</td>
                  <td>Lowest</td>
                </tr>
                <tr>
                  <td>Rolling</td>
                  <td>✅ None</td>
                  <td>Medium</td>
                  <td>Little</td>
                  <td>Grows gradually</td>
                  <td>Low</td>
                </tr>
                <tr>
                  <td>Blue-green</td>
                  <td>✅ None</td>
                  <td>✅ Instant</td>
                  <td>❌ 2× during deploy</td>
                  <td>Everyone at switch</td>
                  <td>Medium</td>
                </tr>
                <tr>
                  <td>Canary</td>
                  <td>✅ None</td>
                  <td>✅ Fast</td>
                  <td>Little</td>
                  <td>✅ Small</td>
                  <td>Higher (routing + metrics)</td>
                </tr>
                <tr>
                  <td>Shadow</td>
                  <td>✅ None</td>
                  <td>N/A (no user impact)</td>
                  <td>❌ Extra load</td>
                  <td>✅ None</td>
                  <td>High</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul>
            <li>
              <strong>More automation</strong> gives faster and safer releases, but you must first spend time and money on
              tests, pipelines and monitoring.
            </li>
            <li>
              <strong>Continuous deployment</strong> gives the fastest feedback, but you need very good tests and automatic
              rollback.
            </li>
            <li>
              <strong>Feature flags</strong> are flexible and give you instant kill switches, but they bring flag debt and more
              code paths to test.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Amazon's deployment frequency.</strong> Amazon engineers have said that they deploy to production{" "}
            <strong>very often</strong> across many services. A talk from 2011 famously said there was a deploy
            every few seconds on average. This works because each team owns small services and uses automatic,
            staged pipelines. The AWS Builders' Library article on "automating safe, hands-off deployments" describes
            the <strong>wave-based rollouts</strong> (one box, one AZ, one region at a time) and the automatic rollbacks
            used at Amazon.
          </p>
          <p>
            <strong>Chrome's release channels.</strong> Google Chrome ships through{" "}
            <strong>Canary, Dev, Beta and Stable</strong> channels. Each new version is used first by a small group of
            willing testers, then by larger groups, and only then by everyone. It is canary releasing for software on
            billions of devices.
          </p>
          <p>
            <strong>Netflix's automated canary analysis.</strong> Netflix, together with Google, open-sourced{" "}
            <strong>Kayenta</strong>, a tool that uses statistics to compare a canary's metrics with a baseline. It decides
            automatically whether it is safe to continue the release. It works with Netflix's Spinnaker deployment
            platform.
          </p>
          <p>
            <strong>Etsy and Facebook.</strong> Etsy became known for deploying <strong>dozens of times a day</strong>{" "}
            with a simple one-button tool (Deployinator) and strong monitoring. Facebook used{" "}
            <strong>feature flags</strong> (its Gatekeeper system) to release features to employees first, then to small
            percentages of users. This separated deployment from release.
          </p>
          <p>
            <strong>The CrowdStrike incident (July 2024).</strong> A faulty content update for CrowdStrike's security
            software was sent to a huge number of Windows computers <strong>at the same time</strong>. It crashed
            millions of machines worldwide (post 9). Afterwards, the company promised to use{" "}
            <strong>staged, canary-style rollouts</strong> for such updates. It is a painful reminder that{" "}
            <strong>every</strong> kind of change, including configuration and content, needs progressive delivery (slow, step-by-step release).
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Continuous delivery vs continuous deployment?</>,
                a: (
                  <>
                    <p>
                      Continuous delivery keeps every change ready to release. It has passed the pipeline and can be deployed
                      with one click, but a person decides when. Continuous deployment sends every change that passes the
                      pipeline to production automatically.
                    </p>
                  </>
                ),
              },
              {
                q: <>Compare rolling, blue-green and canary deployments.</>,
                a: (
                  <>
                    <p>
                      Rolling replaces a few instances at a time. It needs no extra capacity, but two versions run together
                      and a rollback means deploying again. Blue-green runs a full second environment and switches the
                      router. Rollback is instant, but you need double the capacity during the switch. Canary sends a small
                      percentage of traffic to the new version and raises it while the metrics stay healthy. It has the
                      smallest blast radius, but it needs good metrics and a way to split traffic.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are feature flags for?</>,
                a: (
                  <>
                    <p>
                      They separate deploy from release. You ship the code turned off ("dark"), then turn it on for staff, for a
                      percentage of users or for one region. You can switch it off at once without a deploy. Flags also work
                      as kill switches. Old flags must be removed so they do not become debt.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you change a database schema with zero downtime?</>,
                a: (
                  <>
                    <p>
                      Use expand and contract. Add the new column in a way the old code can ignore. Deploy code that writes
                      to both. Backfill the old rows. Switch reads to the new column. Stop writing the old one, and only
                      then drop it. Every step in between must work with both the old and the new code, because both run
                      during a rollout.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are the DORA metrics?</>,
                a: (
                  <>
                    <p>
                      Deployment frequency, lead time for changes, change failure rate and time to restore service.
                      Elite teams deploy often with short lead times, and still keep failure rates low and recovery fast.
                      Speed and stability go together.
                    </p>
                  </>
                ),
              },
              {
                q: <>What should trigger an automatic rollback?</>,
                a: (
                  <>
                    <p>
                      Health signals that are compared with the old version during the canary or bake period. These are the error rate, latency
                      percentiles, crash rates and key business metrics like checkout success. Rolling back should be
                      one fast action that you have tested.
                    </p>
                  </>
                ),
              },
            ]}
          />
        </Section>

        <Section id="key-takeaways" title="Key Takeaways" kind="takeaways">
          <ul>
            <li>
              <strong>CI:</strong> merge small changes often, and <strong>automatically build, test and scan</strong>{" "}
              every change. Keep main releasable, and <strong>build once, promote the same artefact</strong>.
            </li>
            <li>
              <strong>Continuous Delivery</strong> means always ready to deploy. <strong>Continuous Deployment</strong>{" "}
              means automatically deployed. Both need safe rollouts.
            </li>
            <li>
              The strategies:
              <ul>
                <li>
                  <strong>Rolling:</strong> gradual, no downtime.
                </li>
                <li>
                  <strong>Blue-green:</strong> instant switch and rollback, at the cost of double resources.
                </li>
                <li>
                  <strong>Canary:</strong> small percentage first, then increase, with{" "}
                  <strong>automatic rollback</strong>. It has the smallest blast radius.
                </li>
                <li>
                  <strong>Shadow:</strong> test with copied traffic, with no user impact.
                </li>
              </ul>
            </li>
            <li>
              <strong>Feature flags separate deploy from release</strong> (gradual rollout, targeting, kill switches),
              but need cleanup. Use <strong>expand-and-contract</strong> for zero-downtime database changes.
            </li>
            <li>
              Measure with the <strong>DORA metrics</strong>. Small, frequent, automated, observable changes are{" "}
              <strong>both faster and safer</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              Martin Fowler's articles "Continuous Integration", "BlueGreenDeployment", "CanaryRelease" and
              "ParallelChange", and Pete Hodgson's "Feature Toggles (aka Feature Flags)"
            </li>
            <li>The AWS Builders' Library article "Automating safe, hands-off deployments"</li>
            <li>
              <em>The Site Reliability Workbook</em> by Google (chapter "Canarying Releases")
            </li>
            <li>
              <em>Continuous Delivery</em> by Jez Humble and David Farley, and <em>Accelerate</em> by Nicole Forsgren,
              Jez Humble and Gene Kim
            </li>
            <li>The DORA research website</li>
            <li>
              The Argo Rollouts documentation, and the Netflix Tech Blog post on automated canary analysis with Kayenta
            </li>
          </ul>
          <p>
            <em>
              This wraps up Part 10. Next up, Part 11: Design It Yourself: Case Studies, starting with "A 5-Step
              Framework for Any System Design Problem".
            </em>
          </p>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
