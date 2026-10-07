import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Flow, Layers, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-47")!;

export const metadata: Metadata = {
  title: `Lesson 47 — ${lesson.title}`,
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

const code1 = `SLI = good events / valid events × 100%`;

const code2 = `"99.9% of checkout requests will succeed, measured over a rolling 28-day window."
"99% of search requests will complete in under 300 ms, over 28 days."`;

const code3 = `Service:        Checkout API
User journey:   Customer places an order
SLI:            % of POST /checkout requests returning non-5xx,
                measured at the load balancer
SLO:            99.95% over rolling 28 days
Latency SLI:    % of POST /checkout requests completing in < 800 ms
Latency SLO:    99% over rolling 28 days
Error budget:   0.05% of requests (~20 minutes of full outage per 28 days)
Alerting:       Page at 14.4× burn (1h/5m) and 6× (6h/30m); ticket at 1× (3d/6h)
Policy:         If budget exhausted: freeze non-critical deploys to checkout,
                prioritise reliability work until SLO is met for 7 days
Owner:          Payments & Checkout team
Review:         Quarterly`;

export default function SdLessonFourSevenPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            The product team wants to release new features every day. The operations team wants fewer changes, because{" "}
            <strong>most outages start with a change</strong>. Every week they argue:
          </p>
          <ul>
            <li>"The site is unreliable, stop releasing!"</li>
            <li>"It's fine! Users aren't complaining!"</li>
          </ul>
          <p>
            Nobody can win, because nobody has agreed on <strong>what "reliable enough" means</strong>. A service is reliable when it works correctly each time users need it.
          </p>
          <p>
            Meanwhile, the monitoring dashboard (a screen of graphs) has 400 graphs, and it is not clear which ones really matter to <strong>users</strong>.
          </p>
          <p>
            <strong>SLIs, SLOs and error budgets</strong> end this argument. They turn "reliable enough" into <strong>a number everyone agrees on</strong>. They also give a simple rule for when to move fast and when to slow down.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <Layers
            caption="Three terms that build on each other — plus the budget they create."
            layers={[
              {
                name: <>SLI — indicator</>,
                tech: <>what you measure</>,
                desc: <>good events ÷ valid events, e.g. % of checkouts that succeed</>,
              },
              {
                name: <>SLO — objective</>,
                tech: <>your internal target</>,
                desc: <>99.95% over a rolling 28 days — alert and act here</>,
              },
              {
                name: <>SLA — agreement</>,
                tech: <>your promise, with money attached</>,
                desc: <>99.9% — looser than the SLO</>,
              },
              {
                name: <>Error budget</>,
                tech: <>100% − SLO</>,
                desc: <>the failure you are allowed to "spend" while you release changes</>,
              },
            ]}
          />
          <p>
            Think about a <strong>train service</strong>.
          </p>
          <ul>
            <li>
              <strong>SLI (Service Level Indicator)</strong> is <strong>what you measure</strong>: "the percentage of
              trains arriving within 5 minutes of schedule".
            </li>
            <li>
              <strong>SLO (Service Level Objective)</strong> is <strong>your target</strong>: "95% of trains arrive
              within 5 minutes, measured each month".
            </li>
            <li>
              <strong>SLA (Service Level Agreement)</strong> is{" "}
              <strong>your promise to customers, with consequences</strong>: "if fewer than 90% arrive on time this
              month, season-ticket holders get a 10% refund".
            </li>
            <li>
              <strong>The error budget</strong> is <strong>the allowed failure</strong>. With a 95% target, 5% of trains <strong>may</strong> be late. Say you still have plenty of "late budget" left this month. Then you can do track work that might cause delays. If you have used it all, the track work waits until next month.
            </li>
          </ul>
          <p>Notice two things:</p>
          <ol>
            <li>
              <strong>The SLO is not 100%.</strong> No real system is perfect. Chasing perfection costs a huge amount of money and slows everything down.
            </li>
            <li>
              <strong>The SLA is looser than the SLO</strong>. This way you notice problems and fix them <strong>before</strong> you owe customers money.
            </li>
          </ol>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="sli-measure-what-users-experience">SLI: measure what users experience</h3>
          <p>
            An SLI is a number that measures one part of your service, as users experience it. It is usually a <strong>ratio of good events to valid events</strong>. A "valid" event is one that should count. For example, a request that fails only because the user sent bad input does not count. The valid events are the bottom number (the denominator) of the ratio.
          </p>
          <CodeBlock code={code1} />
          <p>
            <strong>Common SLI types:</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SLI</th>
                  <th>"Good event" means</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Availability</strong>
                  </td>
                  <td>Request succeeded (not a 5xx, which is an HTTP status code from 500 to 599 that means the server failed)</td>
                  <td>99.95% of checkout requests succeeded</td>
                </tr>
                <tr>
                  <td>
                    <strong>Latency</strong>
                  </td>
                  <td>Request was faster than a threshold</td>
                  <td>99% of search requests &lt; 300 ms</td>
                </tr>
                <tr>
                  <td>
                    <strong>Quality</strong>
                  </td>
                  <td>Response was complete (not degraded)</td>
                  <td>99.9% of product pages showed prices (not a fallback)</td>
                </tr>
                <tr>
                  <td>
                    <strong>Freshness</strong>
                  </td>
                  <td>Data was updated recently</td>
                  <td>99% of dashboard data &lt; 1 minute old</td>
                </tr>
                <tr>
                  <td>
                    <strong>Correctness</strong>
                  </td>
                  <td>Output was right</td>
                  <td>99.999% of payments recorded with the correct amount</td>
                </tr>
                <tr>
                  <td>
                    <strong>Durability</strong>
                  </td>
                  <td>Data was not lost</td>
                  <td>99.999999999% (eleven nines) of stored objects retained</td>
                </tr>
                <tr>
                  <td>
                    <strong>Throughput / pipeline</strong>
                  </td>
                  <td>Job completed in time</td>
                  <td>99% of nightly reports ready by 7 AM</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Tips for good SLIs:</strong>
          </p>
          <ul>
            <li>
              <strong>Measure as close to the user as possible.</strong> Logs from the load balancer (a server that spreads requests across many servers) or from the gateway are better than internal service metrics. Even closer to the user are <strong>real-user monitoring (RUM)</strong>, which measures what real browsers and apps experience, and <strong>synthetic probes</strong>, which are scripted fake users that call your service on a schedule.
            </li>
            <li>
              <strong>Use percentiles for latency, never averages</strong> (post 8). A percentile such as p99 means that 99% of requests were faster than that value. Latency means how long a request takes.
            </li>
            <li>
              <strong>Leave out invalid events</strong> (like <code>400 Bad Request</code>, which is caused by bad client input) from the ratio.
            </li>
            <li>
              <strong>Focus on user journeys:</strong> "log in", "search", "add to cart", "check out", "play video".
              Don't try to write SLIs for every internal component.
            </li>
          </ul>
          <h3 id="slo-the-target">SLO: the target</h3>
          <p>
            An SLO is a target value for an SLI over a period of time. So it combines <strong>an SLI, a target and a time window</strong>:
          </p>
          <CodeBlock code={code2} />
          <p>
            <strong>Choosing targets:</strong>
          </p>
          <ul>
            <li>
              <strong>Start from what users need and what the business can afford.</strong> Do not start from "what we get today" or "as many nines as possible". (A "nine" is one digit 9 in a number like 99.9%.)
            </li>
            <li>
              <strong>Different journeys get different targets:</strong> checkout maybe 99.95%, recommendations 99.5%.
            </li>
            <li>
              <strong>Remember your dependencies.</strong> A dependency is another service you rely on. You cannot be more available than the services you depend on (post 9).
            </li>
            <li>
              <strong>Start achievable, then tighten.</strong> An SLO you miss every month gets ignored. An SLO you always beat by a large margin may be too loose, or it may mean you spend too much on reliability.
            </li>
          </ul>
          <p>
            <strong>Rolling vs calendar windows:</strong>
          </p>
          <ul>
            <li>
              <strong>Rolling (the last 28 or 30 days):</strong> the window moves forward every moment, so it always shows recent reliability. This is good for operations.
            </li>
            <li>
              <strong>Calendar (per month or quarter):</strong> the window is fixed, like "March". It matches business reports and SLAs. The budget "resets" at the start of each period.
            </li>
          </ul>
          <h3 id="sla-the-contract">SLA: the contract</h3>
          <p>
            An <strong>SLA</strong> is a <strong>business agreement</strong> with customers, with{" "}
            <strong>consequences</strong> if it is missed. The usual consequence is service credits (free usage or money back) or refunds.
          </p>
          <ul>
            <li>It's written by business and legal teams, informed by engineering.</li>
            <li>
              It's <strong>looser than the internal SLO</strong>. For example, SLO 99.95% and SLA 99.9%.
            </li>
            <li>
              <strong>Not every service needs an SLA</strong>, but every important user-facing service benefits from an
              SLO.
            </li>
          </ul>
          <Flow
            caption="The SLO sits above the SLA, so you act long before you owe customers anything."
            dir="row"
            nodes={[
              { title: <>100%</>, desc: <>never the target</>, tone: "good" },
              { title: <>Internal SLO</>, desc: <>99.95% — page and fix here</> },
              { title: <>External SLA</>, desc: <>99.9% — credits owed here</>, tone: "warn" },
            ]}
          />
          <h3 id="error-budgets-turning-slos-into-decisions">Error budgets: turning SLOs into decisions</h3>
          <p>
            <strong>Error budget = 100% − SLO.</strong> It is the amount of failure you are <strong>allowed</strong>. Think of it as money you can spend on risky changes.
          </p>
          <p>
            <strong>Example:</strong> SLO = 99.9% of requests succeed over 30 days, with{" "}
            <strong>10 million requests</strong> expected.
          </p>
          <Stats
            caption="A 99.9% SLO over 30 days with 10 million requests."
            stats={[
              { value: <>0.1%</>, label: <>error budget</>, sub: <>100% − 99.9%</> },
              { value: <>10,000</>, label: <>failed requests allowed</>, sub: <>this month</> },
              { value: <>~43 min</>, label: <>full outage equivalent</>, sub: <>0.1% of 30 days</> },
            ]}
          />
          <p>
            <strong>How teams use the budget:</strong>
          </p>
          <ul>
            <li>
              <strong>Budget remaining → move fast.</strong> Release features, run experiments and do risky migrations (moving data or systems to a new setup). Some failures are <strong>expected and acceptable</strong>.
            </li>
            <li>
              <strong>Budget running low → be careful.</strong> Slow down rollouts (releasing a change to users) and add more testing.
            </li>
            <li>
              <strong>Budget exhausted → an error budget policy kicks in.</strong> For example: freeze non-critical launches (stop releasing them), focus engineers on reliability work, and require extra review for changes, until reliability recovers.
            </li>
          </ul>
          <p>
            The result: <strong>product and reliability teams now share one goal</strong>. Nobody argues about feelings. They look at the budget. Spending the budget on <strong>new ideas</strong> is a <em>good</em> thing. An unused budget may mean you are too careful.
          </p>
          <p>
            <strong>Write an error budget policy in advance</strong>, agreed by product and engineering leadership, so decisions in a crisis are not a fight between teams.
          </p>
          <h3 id="burn-rate-how-fast-you-re-spending-the-budget">Burn rate: how fast you're spending the budget</h3>
          <p>
            <strong>Burn rate</strong> tells you how quickly you are using up the error budget. It compares your speed with the steady speed that would use exactly 100% of the budget by the end of the window.
          </p>
          <Stats
            caption="Burn rate — how fast you're spending the budget compared with an even pace."
            stats={[
              { value: <>1×</>, label: <>steady</>, sub: <>whole budget used in exactly 30 days</> },
              {
                value: <>14.4×</>,
                label: <>1.44% errors vs 0.1% allowed</>,
                sub: <>budget gone in ~2 days — page now</>,
              },
              { value: <>2% / hour</>, label: <>at 14.4×</>, sub: <>of the monthly budget</> },
            ]}
          />
          <p>
            At a burn rate of <strong>1</strong>, you'd use the whole budget in exactly 30 days. At{" "}
            <strong>14.4</strong>, you'd use it in about <strong>2 days</strong>, and you burn{" "}
            <strong>2% of the monthly budget every hour</strong>.
          </p>
          <h3 id="alerting-on-slos-multi-window-multi-burn-rate">Alerting on SLOs: multi-window, multi-burn-rate</h3>
          <p>
            Do not alert on "CPU &gt; 80%" or "one error happened". Alert when you are <strong>burning budget fast enough to matter</strong>. Google's SRE Workbook recommends combinations like these for a 30-day window. A "window" here is how far back you look when you measure the burn rate:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Burn rate</th>
                  <th>Long window</th>
                  <th>Short window</th>
                  <th>Budget used if it continues</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Page</strong> (wake someone)
                  </td>
                  <td>14.4×</td>
                  <td>1 hour</td>
                  <td>5 minutes</td>
                  <td>2% in 1 hour</td>
                </tr>
                <tr>
                  <td>
                    <strong>Page</strong>
                  </td>
                  <td>6×</td>
                  <td>6 hours</td>
                  <td>30 minutes</td>
                  <td>5% in 6 hours</td>
                </tr>
                <tr>
                  <td>
                    <strong>Ticket</strong> (fix during work hours)
                  </td>
                  <td>1×</td>
                  <td>3 days</td>
                  <td>6 hours</td>
                  <td>10% in 3 days</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul>
            <li>
              The <strong>long window</strong> confirms it is a real problem that lasts, not a short blip.
            </li>
            <li>
              The <strong>short window</strong> makes sure the problem is <strong>still happening now</strong>. This way the alert stops soon after things recover.
            </li>
            <li>
              The result: <strong>fewer, more meaningful alerts</strong>, each tied directly to user impact (more in
              post 48).
            </li>
          </ul>
          <h3 id="a-simple-slo-document">A simple SLO document</h3>
          <CodeBlock code={code3} />
          <Flow
            caption="An error budget policy, agreed before it's needed."
            nodes={[
              {
                title: <>Plenty of budget left</>,
                desc: <>release features, run experiments, do the risky migration</>,
                tone: "good",
              },
              { title: <>Budget running low</>, desc: <>slow rollouts, more canary releases (first try a change on a few users) and review</>, tone: "warn" },
              {
                title: <>Budget exhausted</>,
                desc: <>freeze non-critical launches; reliability work first until the SLO holds for 7 days</>,
                tone: "bad",
              },
            ]}
          />
          <h3 id="common-mistakes">Common mistakes</h3>
          <ul>
            <li>
              <strong>Too many SLOs.</strong> Five meaningful ones beat fifty ignored ones.
            </li>
            <li>
              <strong>SLOs nobody acts on.</strong> If missing the SLO changes nothing, it's just a graph. Agree on the{" "}
              <strong>policy</strong>.
            </li>
            <li>
              <strong>Measuring the wrong thing</strong>, like server CPU instead of user success.
            </li>
            <li>
              <strong>Targets of 100%</strong>, which leave no budget, so every change becomes impossible or every
              failure becomes a crisis.
            </li>
            <li>
              <strong>Averages for latency.</strong> Use percentile-based SLIs.
            </li>
            <li>
              <strong>Ignoring dependencies</strong> when setting targets.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Stricter SLOs:</strong> happier users, but <strong>much higher cost</strong> (more redundancy,
              slower change processes) and a smaller budget for innovation.
            </li>
            <li>
              <strong>Looser SLOs:</strong> faster development and lower cost, but a risk of users noticing and leaving.
            </li>
            <li>
              <strong>Rolling windows:</strong> a responsive, operational view. <strong>Calendar windows:</strong>{" "}
              simpler business reports, but the budget jumps suddenly at each reset.
            </li>
            <li>
              <strong>SLO-based alerting:</strong> fewer, more relevant pages, but it takes effort to set up, and it's
              less useful for very low-traffic services (a few errors cause big percentage swings).
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Google SRE.</strong> Google introduced the SLO and error-budget approach in its{" "}
            <em>Site Reliability Engineering</em> book (2016) and <em>The Site Reliability Workbook</em> (2018). Its key
            idea, that <strong>100% is the wrong reliability target</strong>, changed how many companies think about
            reliability. Error budgets let product teams launch freely while budget remains. When the budget is spent, the SRE team can say "wait".
          </p>
          <p>
            <strong>Cloud provider SLAs.</strong> Major cloud providers publish SLAs (often 99.9%–99.99%, depending on the service and set-up). If they miss one, you get <strong>service credits</strong>. Inside the company, they aim for stricter SLOs, so SLA breaches are rare.
          </p>
          <p>
            <strong>Status pages.</strong> Many companies (GitHub, Slack, Atlassian and others) publish public status
            pages that show incidents and uptime per component. They make reliability visible and often reflect the SLIs
            the companies track internally.
          </p>
          <p>
            <strong>Error budget freezes.</strong> Many engineering organisations adopting SRE practices use{" "}
            <strong>deploy freezes</strong> when a service's error budget is exhausted. This is a clear example of a policy turning a number into an action. Some companies also use budgets to justify <em>more</em> risk:
            "we're well within budget, let's do the migration this week."
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Explain SLI, SLO and SLA with an example.</>,
                a: (
                  <>
                    <p>
                      SLI: the share of checkout requests that succeed, measured at the load balancer. SLO: 99.95% of
                      them succeed over a rolling 28 days — an internal target. SLA: a contractual promise of 99.9%
                      monthly, with service credits if missed. The SLA is looser so you react before owing money.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is an error budget, and how is it used?</>,
                a: (
                  <>
                    <p>
                      100% minus the SLO — the amount of failure you're allowed. While budget remains, teams ship and
                      take risks; when it's exhausted, an agreed policy kicks in (freeze non-critical launches,
                      prioritise reliability). It aligns product and reliability around one number.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why is 100% the wrong reliability target?</>,
                a: (
                  <>
                    <p>
                      It's unachievable, users can't tell the difference beyond a point (their own networks are less
                      reliable), and chasing it makes every change risky and very expensive, leaving no room to ship.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is burn rate, and why alert on it?</>,
                a: (
                  <>
                    <p>
                      The observed error rate divided by the rate the SLO allows. A burn rate of 14.4 over an hour
                      spends 2% of a 30-day budget in that hour. Alerting on burn rate pages people only when
                      user-facing reliability is really at risk, instead of on noisy resource thresholds.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why use two windows in SLO alerts?</>,
                a: (
                  <>
                    <p>
                      The long window (say one hour) confirms a sustained problem rather than a blip; the short window
                      (five minutes) confirms it's still happening, so the alert clears soon after recovery. Together
                      they give fast, low-noise pages.
                    </p>
                  </>
                ),
              },
              {
                q: <>What makes a good SLI?</>,
                a: (
                  <>
                    <p>
                      It reflects what users experience on a key journey, is measured as close to the user as possible
                      (edge logs, RUM, synthetic probes), uses percentile thresholds for latency, and excludes invalid
                      events such as client errors.
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
              <strong>SLI</strong> = what you measure (good events ÷ valid events), based on{" "}
              <strong>user journeys</strong>. <strong>SLO</strong> = your target over a time window.{" "}
              <strong>SLA</strong> = a contract with consequences, <strong>looser</strong> than the SLO.
            </li>
            <li>
              <strong>100% is the wrong target.</strong> Choose SLOs from <strong>user needs and business cost</strong>,
              and give different journeys different targets.
            </li>
            <li>
              <strong>Error budget = 100% − SLO.</strong> Spend it on innovation, and follow an{" "}
              <strong>agreed policy</strong> (like freezing launches) when it runs out.
            </li>
            <li>
              <strong>Burn rate</strong> shows how fast you're spending the budget. Use{" "}
              <strong>multi-window, multi-burn-rate alerts</strong> (for example 14.4× over 1h/5m) instead of noisy
              threshold alerts.
            </li>
            <li>
              Keep <strong>a few meaningful SLOs</strong>, measured close to the user, with clear owners and regular
              reviews.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Site Reliability Engineering</em> by Google (chapter "Service Level Objectives", and chapter
              "Embracing Risk" on error budgets)
            </li>
            <li>
              <em>The Site Reliability Workbook</em> by Google (chapters "Implementing SLOs" and "Alerting on SLOs")
            </li>
            <li>
              <em>Implementing Service Level Objectives</em> by Alex Hidalgo
            </li>
            <li>The Google Cloud documentation on SLO monitoring concepts</li>
            <li>The OpenSLO specification project on GitHub</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
