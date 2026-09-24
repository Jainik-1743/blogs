import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Compare, Flow, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-6")!;

export const metadata: Metadata = {
  title: `Lesson 6 — ${lesson.title}`,
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

export default function SdLessonSixPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>Imagine two teams are asked to "build a video streaming app".</p>
          <ul>
            <li>
              <strong>Team A</strong> starts coding right away. Three months later they have a beautiful app. On launch
              day, 200,000 people join at once and it collapses.
            </li>
            <li>
              <strong>Team B</strong> spends the first week asking questions: How many users? Live or recorded video?
              Which countries? What happens if a server dies? Their app looks simpler, but it survives launch day.
            </li>
          </ul>
          <p>
            The difference isn't coding skill. It's <strong>system design</strong>: deciding <em>what</em> to build and{" "}
            <em>how the pieces fit together</em> before writing lots of code. And good system design always starts in
            the same place, with <strong>requirements</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>Think about building a house. Before anyone lays a brick, the architect asks:</p>
          <ul>
            <li>How many people will live here?</li>
            <li>Do you need a garage?</li>
            <li>Is this an earthquake zone?</li>
            <li>What's the budget?</li>
          </ul>
          <p>
            The answers change everything. A house for two people in a calm area is very different from a 20-floor
            apartment block in an earthquake zone.
          </p>
          <p>
            <strong>System design is architecture for software.</strong> You decide:
          </p>
          <ul>
            <li>
              <strong>Which building blocks</strong> to use: servers, databases, caches, queues, CDNs.
            </li>
            <li>
              <strong>How they connect.</strong>
            </li>
            <li>
              <strong>Which trade-offs</strong> to accept: speed vs cost, simplicity vs scale, consistency vs
              availability.
            </li>
          </ul>
          <p>
            There's rarely one "correct" design. There are only designs that <strong>fit the requirements</strong> and
            designs that don't.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="two-levels-of-design">Two levels of design</h3>
          <Compare
            caption="The two zoom levels of a design. Interviews and this series live mostly on the left."
            columns={[
              {
                title: <>High-level design (HLD)</>,
                items: [
                  {
                    sign: "·",
                    text: <>Boxes and arrows: clients, load balancer, app servers, cache, database, queue</>,
                  },
                  { sign: "·", text: <>Which building blocks, and how they connect</> },
                  { sign: "·", text: <>Where data lives and how it flows</> },
                ],
                verdict: <>Architecture reviews, system design interviews</>,
              },
              {
                title: <>Low-level design (LLD)</>,
                items: [
                  { sign: "·", text: <>The inside of one box</> },
                  { sign: "·", text: <>Classes, database tables, API endpoints</> },
                  { sign: "·", text: <>Algorithms and data structures</> },
                ],
                verdict: <>Code reviews, implementation planning</>,
              },
            ]}
          />
          <ul>
            <li>
              <strong>High-level design (HLD)</strong> is the big picture: boxes and arrows. "Clients talk to a load
              balancer, which talks to app servers, which use a cache and a database." This is what most system-design
              blog posts and interviews focus on.
            </li>
            <li>
              <strong>Low-level design (LLD)</strong> is the details inside one box: classes, database tables, API
              endpoints, algorithms.
            </li>
          </ul>
          <p>
            This series is mostly about HLD, but we'll go into LLD when it matters, for example database schemas and API
            design.
          </p>
          <h3 id="the-qualities-every-system-is-judged-on">The qualities every system is judged on</h3>
          <p>When people talk about a system being "good", they usually mean some mix of these:</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Quality</th>
                  <th>Plain-English question</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Scalability</strong>
                  </td>
                  <td>Can it handle 10× or 100× more users?</td>
                </tr>
                <tr>
                  <td>
                    <strong>Availability</strong>
                  </td>
                  <td>Is it up when people need it?</td>
                </tr>
                <tr>
                  <td>
                    <strong>Reliability</strong>
                  </td>
                  <td>Does it give correct results, even when parts fail?</td>
                </tr>
                <tr>
                  <td>
                    <strong>Performance</strong>
                  </td>
                  <td>Is it fast for each user?</td>
                </tr>
                <tr>
                  <td>
                    <strong>Consistency</strong>
                  </td>
                  <td>Does everyone see the same, up-to-date data?</td>
                </tr>
                <tr>
                  <td>
                    <strong>Maintainability</strong>
                  </td>
                  <td>Can the team understand, change and fix it easily?</td>
                </tr>
                <tr>
                  <td>
                    <strong>Security</strong>
                  </td>
                  <td>Is data protected from people who shouldn't see it?</td>
                </tr>
                <tr>
                  <td>
                    <strong>Cost</strong>
                  </td>
                  <td>Can the business afford to run it?</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            You can't max out all of them at once. Improving one often hurts another. That's why design is about{" "}
            <strong>trade-offs</strong>.
          </p>
          <h3 id="performance-vs-scalability">Performance vs scalability</h3>
          <p>People mix these two up, so let's separate them:</p>
          <ul>
            <li>
              A <strong>performance problem</strong>: the system is slow <strong>even for one user</strong>. Example: a
              page that takes 5 seconds because of a missing database index.
            </li>
            <li>
              A <strong>scalability problem</strong>: the system is fast for one user but{" "}
              <strong>gets slower as users grow</strong>. Example: a page that loads in 100 ms with 10 users but 10
              seconds with 10,000, because every request fights for the same database.
            </li>
          </ul>
          <p>
            Fixing performance usually means better code or queries. Fixing scalability usually means changing the{" "}
            <strong>architecture</strong>.
          </p>
          <h3 id="step-one-requirements">Step one: requirements</h3>
          <p>Requirements come in two types.</p>
          <p>
            <strong>1. Functional requirements: what the system does.</strong> These are the features, written from the
            user's point of view. For a URL shortener:
          </p>
          <ul>
            <li>A user can paste a long URL and get a short one.</li>
            <li>Visiting the short URL redirects to the long URL.</li>
            <li>A user can choose a custom alias (optional).</li>
            <li>Links can expire after a set time (optional).</li>
          </ul>
          <p>
            Equally important is what's <strong>out of scope</strong>. "We are <em>not</em> building user accounts or
            analytics dashboards in version 1." Saying this out loud stops the design from growing forever.
          </p>
          <p>
            <strong>2. Non-functional requirements (NFRs): how well the system does it.</strong> These are the qualities
            from the table above, and they drive most architecture decisions:
          </p>
          <ul>
            <li>
              <strong>Scale:</strong> 100 million new links per month, 10 billion redirects per month.
            </li>
            <li>
              <strong>Latency:</strong> redirects should feel instant, under 50 ms for most users.
            </li>
            <li>
              <strong>Availability:</strong> redirects must almost never fail. Creating links can tolerate a little
              downtime.
            </li>
            <li>
              <strong>Durability:</strong> a link, once created, must never be lost.
            </li>
            <li>
              <strong>Read/write ratio:</strong> about 100 redirects for every 1 link created, so it's very{" "}
              <strong>read-heavy</strong>.
            </li>
          </ul>
          <Compare
            caption="A URL shortener's requirements, split the way every design should split them."
            columns={[
              {
                title: <>Functional — what it does</>,
                items: [
                  { sign: "·", text: <>Paste a long URL → get a short one</> },
                  { sign: "·", text: <>Visiting the short URL redirects to the long one</> },
                  { sign: "·", text: <>Optional: custom alias, expiry date</> },
                  { sign: "-", text: <>Out of scope in v1: accounts, analytics dashboards</> },
                ],
              },
              {
                title: <>Non-functional — how well</>,
                items: [
                  { sign: "·", text: <>Scale: 100 M new links and 10 B redirects a month</> },
                  { sign: "·", text: <>Latency: redirects under 50 ms for most users</> },
                  { sign: "·", text: <>Availability: redirects almost never fail</> },
                  { sign: "·", text: <>Durability: a created link is never lost</> },
                  { sign: "·", text: <>Shape: ~100 reads per write — very read-heavy</> },
                ],
              },
            ]}
          />
          <h3 id="make-requirements-measurable">Make requirements measurable</h3>
          <p>
            "The site must be fast and always up" sounds like a requirement but isn't one. You can't design for it or
            test it. Turn vague words into numbers:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Vague</th>
                  <th>Measurable</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>"Fast"</td>
                  <td>"99% of API requests finish in under 200 ms"</td>
                </tr>
                <tr>
                  <td>"Always up"</td>
                  <td>"99.95% of requests succeed each month"</td>
                </tr>
                <tr>
                  <td>"Handles lots of users"</td>
                  <td>"5,000 requests per second at peak, growing 50% per year"</td>
                </tr>
                <tr>
                  <td>"Never lose data"</td>
                  <td>"Zero data loss if one server or one data centre fails"</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            We'll learn what these numbers mean in the next few posts: latency percentiles, availability "nines" and
            estimation.
          </p>
          <h3 id="constraints-and-assumptions">Constraints and assumptions</h3>
          <p>Also write down the things you can't change, and the things you're guessing:</p>
          <ul>
            <li>Budget and team size (three engineers can't run 40 microservices).</li>
            <li>Where users are (one country or worldwide?).</li>
            <li>Legal rules (data about EU users may need to stay in the EU).</li>
            <li>Deadlines.</li>
            <li>Assumptions like "the average post is 1 KB" or "20% of users are active daily".</li>
          </ul>
          <p>
            <strong>Assumptions are fine; hidden assumptions are dangerous.</strong> Write them down so others can
            challenge them.
          </p>
          <h3 id="thinking-in-trade-offs">Thinking in trade-offs</h3>
          <p>
            Almost every decision in this blog series is a trade-off. Here are the ones you'll meet again and again:
          </p>
          <ul>
            <li>
              <strong>Consistency vs availability:</strong> show slightly old data, or show an error?
            </li>
            <li>
              <strong>Latency vs throughput:</strong> respond to each request quickly, or batch work for efficiency?
            </li>
            <li>
              <strong>Read speed vs write speed:</strong> copy data to make reads fast, and make writes slower?
            </li>
            <li>
              <strong>SQL vs NoSQL</strong>, <strong>monolith vs microservices</strong>, <strong>build vs buy</strong>.
            </li>
            <li>
              <strong>Cost vs everything:</strong> more servers, more regions and more copies all cost money.
            </li>
          </ul>
          <p>
            <strong>Reversible vs irreversible decisions.</strong> Some decisions are easy to undo, like changing a
            cache timeout. Others are very hard, like choosing a database, a sharding key, or a public API format. Move
            fast on the easy ones and think carefully about the hard ones.
          </p>
          <p>
            <strong>Write decisions down.</strong> Many teams use short{" "}
            <strong>Architecture Decision Records (ADRs)</strong>: one page saying what was decided, why, what
            alternatives were considered, and what trade-offs were accepted. Six months later, when someone asks "why
            did we pick PostgreSQL?", the answer is there.
          </p>
          <h3 id="simple-is-a-feature">Simple is a feature</h3>
          <p>
            Every new component (a cache, a queue, a new database) is one more thing that can break, one more thing to
            monitor, and one more thing to learn. A design that meets the requirements with{" "}
            <strong>fewer moving parts</strong> usually beats a clever one. Many engineers call this "choosing boring
            technology". Well-known, well-understood tools let you spend your energy on the actual product.
          </p>
          <Flow
            caption="The order to think in, for any design — from a blank page to a system you can defend."
            nodes={[
              {
                title: <>Functional requirements</>,
                desc: <>the features, from the user's side — and what is out of scope</>,
              },
              {
                title: <>Non-functional requirements</>,
                desc: <>scale, latency, availability, durability, cost — as numbers</>,
              },
              {
                title: <>Constraints and assumptions</>,
                desc: <>budget, team size, regions, laws, deadlines — written down</>,
              },
              { title: <>Estimate</>, desc: <>back-of-the-envelope QPS, storage and bandwidth</> },
              { title: <>High-level design</>, desc: <>the fewest boxes and arrows that meet the numbers</> },
              { title: <>Trade-offs</>, desc: <>what you gave up, and why — recorded in an ADR</>, tone: "warn" },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Spending time on design upfront</strong> prevents expensive rewrites, but too much design delays
              learning from real users. For small projects, a one-page design is often enough.
            </li>
            <li>
              <strong>Designing for huge scale too early</strong> wastes time and money, and adds complexity you don't
              need yet. Design for your realistic next 12–24 months, with a path to grow.
            </li>
            <li>
              <strong>Strict requirements</strong> make decisions easier but can be wrong. Revisit them as you learn.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Twitter's "Fail Whale".</strong> In its early years, Twitter was famous for its error page showing a
            whale being lifted by birds, which appeared whenever the site was overloaded. Twitter was a huge success as
            a product, but its original design hadn't planned for how fast it would grow or for traffic spikes during
            big events. Over several years the company redesigned major parts of its system. It's a classic example of
            non-functional requirements (scale and availability) catching up with a product.
          </p>
          <p>
            <strong>Live cricket streaming in India.</strong> Streaming platforms showing big cricket matches have to
            handle <strong>tens of millions of people watching at the same moment</strong>, with sudden jumps when a
            star player comes in to bat or a match gets close. Their requirements aren't "handle average traffic".
            They're "handle the biggest spike of the year without failing". That single non-functional requirement
            shapes their whole architecture: heavy use of CDNs, scaling up <em>before</em> the match rather than waiting
            for automatic scaling, and turning off non-essential features under load.
          </p>
          <p>
            <strong>Amazon's "one-way vs two-way doors".</strong> Jeff Bezos described decisions as either{" "}
            <strong>two-way doors</strong> (easy to reverse, so decide quickly) or <strong>one-way doors</strong> (hard
            to reverse, so decide carefully). Many tech companies use this idea in design reviews.
          </p>
          <p>
            <strong>Design docs at big companies.</strong> Google, Uber and many others write a short design document
            before building any significant system. It describes the goals, non-goals, proposed design, alternatives
            considered and trade-offs. Colleagues review it before coding starts. The "non-goals" section, which says
            what they're deliberately <em>not</em> doing, is often the most useful part.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What's the first thing you do when asked to design a system?</>,
                a: (
                  <>
                    <p>
                      Ask questions before drawing anything. Pin down the core features (and what's out of scope), then
                      the non-functional requirements as numbers — users, requests per second, read/write ratio, latency
                      and availability targets, data size, regions — plus constraints like budget and team size.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is the difference between functional and non-functional requirements?</>,
                a: (
                  <>
                    <p>
                      Functional requirements describe what the system does: the features and user actions.
                      Non-functional requirements describe how well it does them: scale, latency, availability,
                      durability, security and cost. The non-functional ones drive most architecture decisions.
                    </p>
                  </>
                ),
              },
              {
                q: <>Performance problem or scalability problem — how do you tell?</>,
                a: (
                  <>
                    <p>
                      If it is slow for a single user, it's a performance problem: usually code, queries or a missing
                      index. If it's fast with few users and degrades as load grows, it's a scalability problem: usually
                      a shared bottleneck that needs an architectural change.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why write down non-goals and assumptions?</>,
                a: (
                  <>
                    <p>
                      Non-goals stop scope from growing and make the design reviewable against a clear target. Written
                      assumptions (“1 KB per post”, “20% of users active daily”) can be challenged and checked; hidden
                      ones silently shape the design and surface later as outages.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is a one-way door decision? Give examples.</>,
                a: (
                  <>
                    <p>
                      A decision that is expensive or impossible to reverse, so it deserves careful thought: the primary
                      database, the shard key, the public API format, the data model. Two-way doors — cache TTLs,
                      instance sizes, feature flags — should be decided quickly and adjusted later.
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
              <strong>System design</strong> means choosing components and how they connect to meet requirements, with
              clear <strong>trade-offs</strong>.
            </li>
            <li>
              <strong>Functional requirements</strong> say what the system does.{" "}
              <strong>Non-functional requirements</strong> (scale, latency, availability, durability, cost) drive the
              architecture.
            </li>
            <li>
              Make requirements <strong>measurable</strong> ("p99 &lt; 200 ms", "99.95% monthly"), and state what's{" "}
              <strong>out of scope</strong>.
            </li>
            <li>
              A <strong>performance</strong> problem is slow for one user. A <strong>scalability</strong> problem gets
              worse as users grow.
            </li>
            <li>
              Prefer <strong>simple designs</strong>, move fast on reversible decisions, and <strong>write down</strong>{" "}
              the hard ones.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann (chapter 1, "Reliable, Scalable, and
              Maintainable Applications")
            </li>
            <li>
              <em>System Design Interview: An Insider's Guide</em> by Alex Xu (chapter 1, "Scale From Zero To Millions
              Of Users")
            </li>
            <li>The System Design Primer on GitHub (section "Performance vs scalability")</li>
            <li>Michael Nygard's article "Documenting Architecture Decisions"</li>
            <li>Dan McKinley's essay "Choose Boring Technology"</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
