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
            release. The steps are manual: copy files, run a script, restart servers, hope. At 11 PM, the new version
            goes live on <strong>every server at once</strong>. Checkout breaks. Nobody is sure which of the 140 changes
            caused it, and rolling back takes two hours because the database was changed too.
          </p>
          <p>
            Everyone is afraid of deploying, so they deploy <strong>less often</strong>. So each release is{" "}
            <strong>bigger and riskier</strong>. It's a vicious circle.
          </p>
          <p>
            Remember from post 48: <strong>most incidents start with a change</strong>. The answer isn't to change less.
            It's to change in <strong>small, automated, safe, reversible steps</strong>. That's what{" "}
            <strong>CI/CD</strong> and modern <strong>deployment strategies</strong> are for.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about how a <strong>big restaurant chain launches a new dish</strong>.
          </p>
          <ul>
            <li>
              <strong>Continuous Integration</strong> is when every chef's recipe tweaks are{" "}
              <strong>tasted and checked</strong> by the head chef <strong>every day</strong>, not saved up for a month.
            </li>
            <li>
              <strong>Canary release</strong> is offering the new dish at <strong>one restaurant</strong> first. If
              customers love it, try it at 10 restaurants, then everywhere. If they don't, pull it quickly, and only a
              few customers were affected.
            </li>
            <li>
              <strong>Blue-green deployment</strong> is setting up a <strong>complete second kitchen</strong> with the
              new menu, and when it's ready, <strong>switching the customer entrance</strong> to it. If anything goes
              wrong, switch the entrance back to the old kitchen immediately.
            </li>
            <li>
              <strong>Feature flags</strong> are having the dish <strong>on the menu, but hidden</strong> until the
              manager flips a switch, or showing it only to staff first.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="part-1-continuous-integration-ci">Part 1: Continuous Integration (CI)</h3>
          <p>
            <strong>CI</strong> means developers <strong>merge small changes into the main branch frequently</strong>{" "}
            (at least daily), and <strong>every change is automatically built and tested</strong>.
          </p>
          <Flow
            caption="A CI pipeline — every push, every time."
            nodes={[
              { title: <>Developer pushes</>, desc: <>a branch or pull request</> },
              { title: <>Build</>, desc: <>compile, bundle</> },
              { title: <>Lint &amp; static analysis</> },
              { title: <>Unit tests</> },
              { title: <>Integration / contract tests</> },
              { title: <>Security scans</>, desc: <>dependencies, secrets, SAST, image scan</> },
              { title: <>Image built</>, desc: <>tagged with the commit SHA, pushed to the registry</> },
              { title: <>Merge allowed</>, desc: <>or ❌ fix it before merging</>, tone: "good" },
            ]}
          />
          <p>
            <strong>Good CI practices:</strong>
          </p>
          <ul>
            <li>
              <strong>Trunk-based development:</strong> short-lived branches (hours to a couple of days), merged to main
              often. Long-lived branches create painful "merge hell".
            </li>
            <li>
              <strong>Fast pipelines:</strong> aim for minutes, not hours. Slow CI makes people batch changes.
            </li>
            <li>
              <strong>Keep main always releasable.</strong> A broken build is fixed <strong>immediately</strong> (or the
              change is reverted).
            </li>
            <li>
              <strong>Build once, promote the same artefact.</strong> The <strong>exact same image</strong> (identified
              by commit SHA or digest, post 55) moves through test → staging → production. Never rebuild for each
              environment.
            </li>
            <li>
              <strong>Automated tests at several levels</strong>: many fast unit tests, fewer integration tests, and a
              small number of end-to-end tests (the "test pyramid").
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
              <strong>ready to deploy</strong> to production at any time, but a <strong>human</strong> clicks the
              button.
            </li>
            <li>
              <strong>Continuous Deployment:</strong> every change that passes the pipeline{" "}
              <strong>deploys to production automatically</strong>, with no manual step.
            </li>
          </ul>
          <p>
            Both depend on strong automated testing, monitoring and <strong>safe rollout strategies</strong>, which come
            next.
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
              { title: <>Production canary</>, desc: <>waves, bake time</> },
              { title: <>Full rollout</>, desc: <>or automatic rollback</>, tone: "good" },
            ]}
          />
          <h3 id="part-3-deployment-strategies">Part 3: Deployment strategies</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">1. Recreate (stop everything, start new)</h4>
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
              ❌ <strong>Downtime.</strong> It's only acceptable for dev environments or systems with maintenance
              windows.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">2. Rolling update (replace instances gradually)</h4>
          <CodeBlock code={code1} />
          <ul>
            <li>
              ✅ <strong>No downtime</strong>, and no extra full environment needed. It's the default in Kubernetes
              (post 56).
            </li>
            <li>
              ❌ <strong>Old and new versions run at the same time</strong>, so they must be <strong>compatible</strong>{" "}
              (APIs, database schema, message formats).
            </li>
            <li>
              ❌ Rollback means rolling <strong>backwards</strong> through the same process, which isn't instant.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">3. Blue-green deployment</h4>
          <p>
            Run <strong>two identical production environments</strong>. <strong>Blue</strong> is live,{" "}
            <strong>green</strong> gets the new version. Test green, then <strong>switch all traffic</strong> at the
            router or load balancer.
          </p>
          <Rollout caption="Roll out a buggy v2 three ways and count the users it hurts before you roll back." />
          <ul>
            <li>
              ✅ <strong>Instant switch and instant rollback</strong> (just flip the router back).
            </li>
            <li>
              ✅ Test the new version <strong>in a production-like environment</strong> before it gets real traffic.
            </li>
            <li>
              ❌ <strong>Double the resources</strong> during the deploy.
            </li>
            <li>
              ❌ <strong>All users</strong> move at once, so a bug hits everyone (until you switch back).
            </li>
            <li>
              ❌ <strong>Shared databases</strong> still need backward-compatible schema changes (see Part 5).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">4. Canary release</h4>
          <p>
            Send a <strong>small percentage</strong> of real traffic to the new version,{" "}
            <strong>watch the metrics</strong>, and increase gradually:
          </p>
          <CodeBlock code={code2} />
          <ul>
            <li>
              ✅ <strong>Limits blast radius.</strong> A bug affects only a small share of users, for a short time.
            </li>
            <li>
              ✅ <strong>Real production traffic</strong> tests the release, which catches problems staging never shows.
            </li>
            <li>
              ✅ Works well with <strong>automated analysis</strong>: compare the canary's error rate and latency with
              the baseline, and <strong>auto-roll back</strong> if it's worse.
            </li>
            <li>
              ❌ Needs good <strong>traffic routing</strong> (a load balancer, service mesh or gateway) and good{" "}
              <strong>metrics</strong> (posts 46–47).
            </li>
            <li>
              ❌ Old and new versions run together, so <strong>compatibility</strong> is required.
            </li>
          </ul>
          <p>
            <strong>Canary tips:</strong>
          </p>
          <ul>
            <li>
              Choose <strong>what to watch</strong>: error rates, p99 latency, crash rates, and{" "}
              <strong>business metrics</strong> (checkout success, sign-ups).
            </li>
            <li>
              <strong>Bake time:</strong> wait long enough at each step to catch slow problems (like memory leaks).
            </li>
            <li>
              For big platforms, <strong>roll out in waves</strong>: one server → one AZ → one region → all regions. A
              bad change then never hits everything at once.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">5. Shadow (dark) traffic</h4>
          <p>
            Send a <strong>copy</strong> of real production requests to the new version,{" "}
            <strong>without using its responses</strong>. Compare its results and performance with the current version.
          </p>
          <ul>
            <li>
              ✅ Tests with real traffic and <strong>zero user impact</strong>.
            </li>
            <li>
              ❌ Doubles the load, and you must <strong>prevent side effects</strong> (the shadow must not send emails,
              charge cards or write to real data).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">6. A/B testing</h4>
          <p>
            A/B testing is technically similar to canaries (splitting traffic), but the goal is{" "}
            <strong>product experimentation</strong>: "does version B increase conversions?". It's usually driven by{" "}
            <strong>feature flags</strong>, and measured on business outcomes over days or weeks.
          </p>
          <h3 id="part-4-feature-flags-separating-deploy-from-release">
            Part 4: Feature flags, separating deploy from release
          </h3>
          <p>
            <strong>Deploying</strong> code and <strong>releasing</strong> a feature don't have to happen together. With{" "}
            <strong>feature flags</strong> (feature toggles), new code ships <strong>turned off</strong>, then is turned
            on <strong>gradually</strong>:
          </p>
          <CodeBlock lang="js" code={code3} />
          <p>
            <strong>Uses:</strong>
          </p>
          <ul>
            <li>
              <strong>gradual rollout:</strong> internal staff → 1% of users → 10% → everyone,
            </li>
            <li>
              <strong>targeting:</strong> by country, plan, device or beta testers,
            </li>
            <li>
              <strong>kill switches:</strong> turn off a broken or expensive feature instantly, without a deploy (post
              44),
            </li>
            <li>
              <strong>trunk-based development:</strong> merge unfinished work safely behind a flag.
            </li>
          </ul>
          <p>
            <strong>Flag hygiene:</strong>
          </p>
          <ul>
            <li>
              <strong>Remove old flags</strong> after full rollout. Hundreds of stale flags become{" "}
              <strong>flag debt</strong>: confusing code and untested combinations.
            </li>
            <li>
              <strong>Give each flag an owner and an expiry date.</strong>
            </li>
            <li>
              <strong>Remember that flags themselves are changes.</strong> Turning one on for everyone is effectively a
              release, so monitor it like one.
            </li>
          </ul>
          <p>
            Tools include LaunchDarkly, Unleash, Flagsmith, OpenFeature (a vendor-neutral standard), and in-house
            systems.
          </p>
          <h3 id="part-5-database-changes-without-downtime">Part 5: Database changes without downtime</h3>
          <p>
            Code can be rolled back in seconds. <strong>Database schema changes often can't.</strong> During rolling,
            canary and blue-green deploys, <strong>old and new code run at the same time</strong> against the same
            database. So schema changes must be <strong>backward compatible</strong>, using the{" "}
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
              { time: <>1 · Expand</>, text: <>add full_name (nullable); old code ignores it</> },
              { time: <>2 · Dual write</>, text: <>deploy code that writes name and full_name, still reads name</> },
              { time: <>3 · Backfill</>, text: <>copy existing values in batches</> },
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
            Every step is <strong>safe to roll back</strong> to the previous one.
          </p>
          <p>
            <strong>Other rules:</strong>
          </p>
          <ul>
            <li>
              <strong>Never</strong> drop or rename columns in the same deploy as the code change.
            </li>
            <li>
              Make <strong>large migrations online</strong> (in batches, with tools designed for big tables) to avoid
              long table locks.
            </li>
            <li>
              <strong>Take a backup</strong> (or confirm point-in-time recovery, post 45) before risky migrations.
            </li>
          </ul>
          <h3 id="part-6-automated-rollback-and-safety-nets">Part 6: Automated rollback and safety nets</h3>
          <ul>
            <li>
              <strong>Health-based auto-rollback:</strong> if error rate or latency passes a threshold during rollout,{" "}
              <strong>roll back automatically</strong>, with no human needed at 3 AM.
            </li>
            <li>
              <strong>Deployment windows and freezes:</strong> avoid risky changes during peak events (a big sale), or
              when the <strong>error budget</strong> is exhausted (post 47).
            </li>
            <li>
              <strong>Deploy markers on dashboards:</strong> show exactly when each version went out, so incidents can
              be matched to changes quickly (post 48).
            </li>
            <li>
              <strong>One-click rollback:</strong> always know how to return to the previous version, and{" "}
              <strong>practise</strong> it.
            </li>
            <li>
              <strong>GitOps:</strong> the desired state lives in Git, and tools like <strong>Argo CD</strong> or{" "}
              <strong>Flux</strong> sync the cluster to it. Deploying means merging a pull request, and{" "}
              <strong>rolling back means reverting a commit</strong>.
            </li>
          </ul>
          <h3 id="part-7-measuring-delivery-performance-the-dora-metrics">
            Part 7: Measuring delivery performance, the DORA metrics
          </h3>
          <p>
            The DORA research programme (DevOps Research and Assessment), described in the book <em>Accelerate</em>,
            found that high-performing teams are <strong>both faster and more stable</strong>. It measures four key
            metrics:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Question</th>
                  <th>Elite teams (roughly)</th>
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
                  <td>Commit → running in production?</td>
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
                  <td>How fast do you recover from failures?</td>
                  <td>Less than an hour</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            The key insight: <strong>speed and stability aren't opposites.</strong> Small, frequent, automated,
            observable changes are <strong>safer</strong> than big, rare, manual ones. (The DORA reports have since
            added further measures, such as reliability, but these four remain the core.)
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
              <strong>More automation</strong> gives faster and safer releases, but requires upfront investment in
              tests, pipelines and monitoring.
            </li>
            <li>
              <strong>Continuous deployment</strong> gives the fastest feedback, but needs mature testing and automatic
              rollback.
            </li>
            <li>
              <strong>Feature flags</strong> are flexible and allow instant kill switches, but bring flag debt and more
              code paths to test.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Amazon's deployment frequency.</strong> Amazon engineers have described deploying to production{" "}
            <strong>extremely frequently</strong> across its many services (a talk from 2011 famously mentioned a deploy
            every few seconds on average). This is possible because each team owns small services and uses automated,
            staged pipelines. The AWS Builders' Library article on "automating safe, hands-off deployments" describes
            the <strong>wave-based rollouts</strong> (one box, one AZ, one region at a time) and automatic rollbacks
            used at Amazon.
          </p>
          <p>
            <strong>Chrome's release channels.</strong> Google Chrome ships through{" "}
            <strong>Canary, Dev, Beta and Stable</strong> channels. Each new version is used first by a small group of
            willing testers, then larger groups, before reaching everyone. It's canary releasing for software on
            billions of devices.
          </p>
          <p>
            <strong>Netflix's automated canary analysis.</strong> Netflix, together with Google, open-sourced{" "}
            <strong>Kayenta</strong>, a tool that statistically compares a canary's metrics against a baseline and
            decides automatically whether a release is safe to continue. It's used with Netflix's Spinnaker deployment
            platform.
          </p>
          <p>
            <strong>Etsy and Facebook.</strong> Etsy became known for deploying <strong>dozens of times a day</strong>{" "}
            with a simple one-button tool (Deployinator) and strong monitoring. Facebook used{" "}
            <strong>feature flags</strong> (its Gatekeeper system) to release features to employees first, then small
            percentages of users, separating deployment from release.
          </p>
          <p>
            <strong>The CrowdStrike incident (July 2024).</strong> A faulty content update for CrowdStrike's security
            software was pushed to a huge number of Windows computers <strong>at the same time</strong>, crashing
            millions of machines worldwide (post 9). In its follow-up, the company committed to{" "}
            <strong>staged, canary-style rollouts</strong> for such updates. It's a painful reminder that{" "}
            <strong>every</strong> kind of change, including configuration and content, needs progressive delivery.
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
                      Continuous delivery keeps every change releasable: it has passed the pipeline and can be deployed
                      with one click, but a human decides when. Continuous deployment ships every change that passes the
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
                      Rolling replaces instances a few at a time — no extra capacity, but versions coexist and rollback
                      means redeploying. Blue-green runs a full second environment and switches the router — instant
                      rollback, double capacity during the switch. Canary sends a small percentage of traffic to the new
                      version and increases it while metrics stay healthy — smallest blast radius, but it needs good
                      metrics and traffic splitting.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are feature flags for?</>,
                a: (
                  <>
                    <p>
                      Separating deploy from release: ship code dark, enable it for internal users, a percentage or a
                      region, and switch it off instantly without a deploy. Flags also act as kill switches. Old flags
                      must be cleaned up so they don't become debt.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you change a database schema with zero downtime?</>,
                a: (
                  <>
                    <p>
                      Expand and contract: add new structures in a backward-compatible way, deploy code that writes
                      both, backfill, switch reads, stop writing the old form, and only then drop it. Every intermediate
                      state must work with both the old and new code, because both run during a rollout.
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
                      Elite teams deploy often with short lead times and still keep failure rates low and recovery fast
                      — speed and stability go together.
                    </p>
                  </>
                ),
              },
              {
                q: <>What should trigger an automatic rollback?</>,
                a: (
                  <>
                    <p>
                      Health signals compared with the old version during the canary or bake period: error rate, latency
                      percentiles, crash rates and key business metrics like checkout success. Rolling back should be
                      one fast, well-tested action.
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
