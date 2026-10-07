import type { Metadata } from "next";
import Callout from "@/components/Callout";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import Nines from "@/components/sd/widgets/Nines";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-9")!;

export const metadata: Metadata = {
  title: `Lesson 9 — ${lesson.title}`,
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

const code1 = `Availability = uptime / (uptime + downtime)`;

const code2 = `Availability = successful requests / total requests`;

const code3 = `Availability = MTBF / (MTBF + MTTR)`;

const code4 = `Total = 1 − (chance both fail at the same time)
      = 1 − (1 − A) × (1 − B)`;

export default function SdLessonNinePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Your manager says: "Our payment service must have <strong>five nines</strong> of availability." Everyone
            nods. But what does that really mean?
          </p>
          <ul>
            <li>How many minutes of downtime is that per year?</li>
            <li>
              Is it even possible when you depend on a database, a cloud provider and a bank's API, and each one has its
              own downtime?
            </li>
            <li>How many extra servers will it cost?</li>
          </ul>
          <p>
            "The nines" are the common language for availability. Availability is how much of the time a system works
            when users need it. "Nines" are the number of 9 digits in the percentage, such as 99.9% (three nines).
            Understanding them helps you set realistic goals, and see how much each extra nine really costs.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think of your local <strong>ATM</strong>.
          </p>
          <ul>
            <li>
              If it works 99% of the time, it is broken for about 3.65 days a year. That is annoying, but you can walk
              to the next one.
            </li>
            <li>If it works 99.99% of the time, it is down less than an hour a year. You would probably never notice.</li>
          </ul>
          <p>
            <strong>Availability</strong> is the percentage of time (or the percentage of requests) in which the system
            works as expected. Downtime is the time when it does not.
          </p>
          <p>
            Each extra "9" means <strong>10× less downtime</strong>, and usually a lot more cost and effort. Going from
            99% to 99.9% might mean adding a second server. Going from 99.99% to 99.999% might mean running in several
            regions (separate geographic areas with their own data centres), with automated failover (switching to a
            backup by itself) and a team on call 24 hours a day (people who are ready to fix problems at any time).
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="availability-reliability-and-durability">Availability, reliability and durability</h3>
          <p>These three words are often mixed up. Here is what each one means:</p>
          <ul>
            <li>
              <strong>Availability:</strong> can I use it <em>right now</em>? (Is the site up?)
            </li>
            <li>
              <strong>Reliability:</strong> does it work <em>correctly</em>, over time? (Does it give the right
              answers, even when parts fail?)
            </li>
            <li>
              <strong>Durability:</strong> is my data <em>safe</em>? (Will my saved file still exist next year?) Data
              that stays saved and is not lost is called durable.
            </li>
          </ul>
          <p>
            A system can be available but not reliable: it is up, but it shows wrong prices. It can also be durable but
            not available: your photos are safe in storage, but the app is down so you cannot see them.
          </p>
          <h3 id="the-nines-table">The nines table</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Availability</th>
                  <th>Downtime per year</th>
                  <th>Downtime per month</th>
                  <th>Downtime per week</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>99% ("two nines")</td>
                  <td>~3.65 days</td>
                  <td>~7.3 hours</td>
                  <td>~1.7 hours</td>
                </tr>
                <tr>
                  <td>99.9% ("three nines")</td>
                  <td>~8.77 hours</td>
                  <td>~43.8 minutes</td>
                  <td>~10 minutes</td>
                </tr>
                <tr>
                  <td>99.95%</td>
                  <td>~4.38 hours</td>
                  <td>~21.9 minutes</td>
                  <td>~5 minutes</td>
                </tr>
                <tr>
                  <td>99.99% ("four nines")</td>
                  <td>~52.6 minutes</td>
                  <td>~4.4 minutes</td>
                  <td>~1 minute</td>
                </tr>
                <tr>
                  <td>99.999% ("five nines")</td>
                  <td>~5.26 minutes</td>
                  <td>~26 seconds</td>
                  <td>~6 seconds</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Look at five nines: <strong>26 seconds a month.</strong> This is often less time than a person needs to
            notice an alert, open a laptop and log in. At that level, <strong>recovery must be automatic</strong>.
          </p>
          <Nines caption="Pick a target and see how much downtime it allows. Then try components in series (one after another) or in parallel (side by side)." />
          <h3 id="two-ways-to-measure-it">Two ways to measure it</h3>
          <p>
            <strong>Time-based availability</strong> asks what fraction of time the system was up:
          </p>
          <CodeBlock code={code1} />
          <p>
            <strong>Request-based availability</strong> asks what fraction of requests succeeded:
          </p>
          <CodeBlock code={code2} />
          <p>Request-based is usually more useful for web services:</p>
          <ul>
            <li>
              If your site is "up" but 10% of checkout requests fail, the time-based number says 100%, but users would
              not agree.
            </li>
            <li>An outage at 3 AM, when few people use the site, hurts fewer users than an outage at 8 PM.</li>
          </ul>
          <h3 id="mtbf-and-mttr">MTBF and MTTR</h3>
          <p>Two numbers describe how often things break and how fast you fix them. "Mean" means average:</p>
          <ul>
            <li>
              <strong>MTBF (Mean Time Between Failures):</strong> the average time between one failure and the next.
            </li>
            <li>
              <strong>MTTR (Mean Time To Recovery):</strong> the average time it takes to recover after a failure.
            </li>
          </ul>
          <CodeBlock code={code3} />
          <p>
            <strong>Example:</strong> your service fails about once a month (MTBF ≈ 720 hours).
          </p>
          <ul>
            <li>
              If recovery takes 4 hours: 720 / 724 ≈ <strong>99.45%</strong>.
            </li>
            <li>
              If recovery takes 15 minutes: 720 / 720.25 ≈ <strong>99.97%</strong>.
            </li>
          </ul>
          <p>
            <strong>The failure rate did not change, but availability improved a lot.</strong> You can reduce recovery
            time with good monitoring (watching the system and raising alerts), quick rollbacks (going back to the
            previous working version) and automatic failover. This is often <strong>easier and cheaper</strong> than
            preventing every failure.
          </p>
          <h3 id="composite-availability-series">Composite availability: series</h3>
          <p>
            Your system is a chain of components. If a request needs <strong>all</strong> of them to work (this is
            called "in series"), their availabilities <strong>multiply</strong>:
          </p>
          <Flow
            caption="Components in series. A request needs every box to work, so availabilities multiply."
            dir="row"
            nodes={[
              { title: <>User</> },
              { title: <>Load balancer</>, desc: <>99.99%</> },
              { title: <>App server</>, desc: <>99.9%</> },
              { title: <>Database</>, desc: <>99.9%</> },
              { title: <>Total</>, desc: <>≈ 99.8% — lower than the weakest part</>, tone: "bad" },
            ]}
          />
          <p>
            <strong>The whole is less available than its weakest part.</strong> Every extra dependency (something your
            system needs in order to work) in the request path lowers the total availability. Three services each at
            99.9% in a chain give about <strong>99.7%</strong>. That is about 26 hours of downtime a year, instead of
            about 9.
          </p>
          <p>This is why:</p>
          <ul>
            <li>
              <strong>You cannot promise 99.99%</strong> if your system depends on a third-party API (a service run by
              another company) that offers only 99.9%, unless you have a fallback (a backup plan, such as a saved
              answer).
            </li>
            <li>Fewer hard dependencies in the critical path (the steps every request must pass) means better availability.</li>
          </ul>
          <h3 id="composite-availability-parallel-redundancy">Composite availability: parallel (redundancy)</h3>
          <p>
            <strong>Redundancy</strong> means keeping extra copies of a component. If you have{" "}
            <strong>two copies</strong> and only need <strong>one</strong> to work (this is called "in parallel"),
            availability goes <strong>up</strong>:
          </p>
          <CodeBlock code={code4} />
          <p>
            <strong>Example:</strong> two servers, each 99% available:
          </p>
          <Stats
            caption="Redundancy in numbers — assuming the two copies fail independently."
            stats={[
              { value: <>99%</>, label: <>one server</>, sub: <>~3.65 days down a year</> },
              { value: <>99.99%</>, label: <>two servers, either will do</>, sub: <>1 − 0.01 × 0.01</> },
              { value: <>~53 min</>, label: <>down a year</>, sub: <>from two “two-nines” machines</> },
            ]}
          />
          <p>
            Two "two nines" servers together give "four nines". This is the power of <strong>redundancy</strong>.
          </p>
          <p>
            <strong>The big catch:</strong> this maths assumes the two copies <strong>fail independently</strong> (one
            failing does not make the other more likely to fail). In real life, failures are often{" "}
            <strong>correlated</strong>, which means they happen together:
          </p>
          <ul>
            <li>both servers are in the same data centre (a building full of servers), which loses power,</li>
            <li>both run the same release of the code, and it has a bug,</li>
            <li>both depend on the same database or DNS provider,</li>
            <li>the same bad configuration change is pushed to both.</li>
          </ul>
          <p>
            This is why real systems spread copies across <strong>availability zones</strong> (separate data centres
            in one city area) and <strong>regions</strong> (separate geographic areas), and roll out changes slowly,
            a few servers at a time. More on this in Part 7.
          </p>
          <h3 id="planned-vs-unplanned-downtime">Planned vs unplanned downtime</h3>
          <ul>
            <li>
              <strong>Unplanned downtime:</strong> crashes, bugs, hardware failures, outages.
            </li>
            <li>
              <strong>Planned downtime:</strong> maintenance windows, which are set times for upgrades or migrations
              (moving data or systems).
            </li>
          </ul>
          <p>
            Some services exclude planned maintenance from their availability numbers, and many banks announce
            "scheduled maintenance" at night. Modern systems aim for <strong>zero planned downtime</strong>. They use
            rolling deploys (updating servers one at a time) and online migrations (changes made while the system
            keeps running), so maintenance does not affect users.
          </p>
          <h3 id="slas-promises-with-consequences">SLAs: promises with consequences</h3>
          <p>
            An <strong>SLA (Service Level Agreement)</strong> is a written promise to customers, usually with money
            attached. For example: "If monthly availability drops below 99.9%, you get a 10% credit." Internal targets
            (called <strong>SLOs</strong>, Service Level Objectives, covered in Part 8) are usually{" "}
            <strong>stricter</strong> than the SLA, so you notice problems before you break your promise. Difference in
            one line: an SLA is the promise to customers, an SLO is your own goal.
          </p>
          <h3 id="how-much-availability-do-you-need">How much availability do you need?</h3>
          <p>More nines are not always better. Each nine costs more:</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Target</th>
                  <th>What it usually takes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>99%</td>
                  <td>One server, basic monitoring, manual fixes</td>
                </tr>
                <tr>
                  <td>99.9%</td>
                  <td>Redundant servers, load balancer, database replica, alerts</td>
                </tr>
                <tr>
                  <td>99.99%</td>
                  <td>Multiple availability zones, automated failover, careful deploys, on-call team</td>
                </tr>
                <tr>
                  <td>99.999%</td>
                  <td>Multiple regions, active-active design (all regions serve users at the same time), a lot of automation, a lot of testing</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Also ask: <strong>what do users actually notice?</strong> If a user's own Wi-Fi or mobile network is only
            about 99% reliable, spending millions to go from 99.99% to 99.999% may not change their experience much.{" "}
            <strong>Pick the target based on what downtime costs the business</strong>, not on "more is better".
          </p>
          <Callout kind="warn" label="The catch: correlated failures">
            <p>
              The parallel maths only holds if failures are independent. Copies in the same data centre, running the
              same release, reading the same configuration or depending on the same DNS provider tend to fail{" "}
              <em>together</em>. Spread copies across availability zones and regions, and roll changes out slowly.
            </p>
          </Callout>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Higher availability costs more</strong>: more servers, more regions, more engineering time and
              more complex systems.
            </li>
            <li>
              <strong>More redundancy adds complexity</strong>, and complexity can <em>cause</em> outages. Examples are
              a failover system that switches by mistake, or "split-brain" (two copies both think they are the leader
              and make different changes).
            </li>
            <li>
              <strong>Chasing availability can slow down product work.</strong> Very strict change processes reduce risk
              but also reduce speed. Part 8 covers "error budgets" (the amount of failure you may allow), which help to
              balance this.
            </li>
            <li>
              <strong>Not every part needs the same target.</strong> Payments and login might need 99.99%, while an
              admin dashboard or recommendations can be 99.5%.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>The AWS S3 outage (February 2017).</strong> S3 is Amazon's file storage service. An engineer who was
            fixing a billing problem ran a command with a typo. It removed many more servers than intended in S3's
            busiest region (us-east-1). S3 in that region was unavailable for several hours. Thousands of websites and
            apps that depended on it broke, including AWS's own status dashboard. It is a strong lesson in{" "}
            <strong>series dependencies</strong> (so many services depended on one region) and in <strong>MTTR</strong>{" "}
            (restarting large systems safely takes time).
          </p>
          <p>
            <strong>The CrowdStrike incident (July 2024).</strong> A faulty update to CrowdStrike's security software
            made millions of Windows computers crash at the same time. Airlines, hospitals, banks and TV stations were
            hit worldwide. Companies had many machines, but they all ran the same software and got the same update, so
            the "redundant" machines all failed <strong>together</strong>. It is the clearest example of{" "}
            <strong>correlated failure</strong>.
          </p>
          <p>
            <strong>Cloud SLAs.</strong> Major cloud providers publish SLAs for their services, commonly in the
            99.9%–99.99% range, and give service credits (money back) if they miss them. For example, a single virtual
            machine usually gets a lower promise than a group of machines spread across several availability zones. The
            cloud providers themselves are telling you that{" "}
            <strong>redundancy across zones is how you earn more nines</strong>.
          </p>
          <p>
            <strong>UPI and banking apps in India.</strong> UPI is India's instant payment system. People use payments
            around the clock, and a failure at the moment of paying at a shop is very visible. Payment systems invest
            heavily in redundancy and fast recovery, and banks announce planned maintenance windows ahead of time so
            that users are not surprised.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>How much downtime per year does 99.99% allow?</>,
                a: (
                  <>
                    <p>
                      About 52.6 minutes a year, or roughly 4.4 minutes a month. Numbers that are easy to remember:
                      99.9% ≈ 8.8 hours a year, 99.99% ≈ 53 minutes, 99.999% ≈ 5 minutes.
                    </p>
                  </>
                ),
              },
              {
                q: <>Your service calls three dependencies, each 99.9% available. What is your best case?</>,
                a: (
                  <>
                    <p>
                      In series the availabilities multiply: 0.999³ ≈ 99.7%, about 26 hours of downtime a year. To do
                      better, remove dependencies from the critical path, add fallbacks or caches, or make those calls
                      asynchronous (the request does not wait for them).
                    </p>
                  </>
                ),
              },
              {
                q: <>How can you improve availability without making failures rarer?</>,
                a: (
                  <>
                    <p>
                      Cut MTTR. Availability = MTBF / (MTBF + MTTR). If you find problems quickly (good alerts), roll
                      back fast and fail over automatically, a service that fails once a month can move from 99.45% to
                      99.97% without preventing a single failure.
                    </p>
                  </>
                ),
              },
              {
                q: <>Availability vs durability?</>,
                a: (
                  <>
                    <p>
                      Availability is whether you can use the system right now. Durability is whether your data
                      survives over time. S3 can be unavailable for a short time while every object stays safe. A system
                      can also be up but have lost data.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why measure availability by requests rather than time?</>,
                a: (
                  <>
                    <p>
                      Because users experience requests. A site that is “up” while 10% of checkouts fail is not 100%
                      available, and an outage at peak hour hurts far more users than one at 3 AM. Successful requests
                      divided by total requests shows both.
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
              <strong>Availability</strong> is the percentage of time (or of requests) a system works. Each extra{" "}
              <strong>nine</strong> means 10× less downtime and much more cost.
            </li>
            <li>
              Know the rough numbers:{" "}
              <strong>99.9% ≈ 8.8 hours a year, 99.99% ≈ 53 minutes a year, 99.999% ≈ 5 minutes a year</strong>.
            </li>
            <li>
              <strong>Components in series multiply</strong>, so more dependencies mean lower availability.{" "}
              <strong>Redundant components in parallel</strong> raise availability, <em>if</em> they fail independently.
            </li>
            <li>
              <strong>Faster recovery (low MTTR)</strong> is often the cheapest way to improve availability.
            </li>
            <li>
              Choose targets based on <strong>business impact</strong>, and give different parts of the system different
              targets.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Site Reliability Engineering</em> by Google (chapter 3, "Embracing Risk", and the availability table
              in the appendix)
            </li>
            <li>The System Design Primer on GitHub (section "Availability in numbers")</li>
            <li>AWS Well-Architected Framework (the Reliability pillar)</li>
            <li>AWS's public summary of the February 2017 S3 service disruption</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
