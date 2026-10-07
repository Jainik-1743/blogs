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
            The difference is not coding skill. It is <strong>system design</strong>. System design is the work of
            deciding <em>what</em> to build and <em>how the pieces fit together</em> before writing lots of code. Good
            system design always starts in the same place, with <strong>requirements</strong>. A requirement is
            something the system must do, or a quality it must have.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>Think about building a house. Before anyone lays a brick, the architect asks:</p>
          <ul>
            <li>How many people will live here?</li>
            <li>Do you need a garage?</li>
            <li>Is this an earthquake zone?</li>
            <li>What is the budget?</li>
          </ul>
          <p>
            The answers change everything. A house for two people in a calm area is very different from a 20-floor
            apartment block in an earthquake zone.
          </p>
          <p>
            <strong>System design is architecture for software.</strong> Architecture means the main parts of a system
            and how they connect. You decide:
          </p>
          <ul>
            <li>
              <strong>Which building blocks</strong> to use: servers (computers that answer requests), databases
              (long-term storage for data), caches (fast stores of saved answers), queues (lists of jobs that wait for
              their turn) and CDNs (servers around the world that keep copies of files near users).
            </li>
            <li>
              <strong>How they connect.</strong>
            </li>
            <li>
              <strong>Which trade-offs</strong> to accept. A trade-off means you gain one thing and lose another:
              speed vs cost, simplicity vs scale, consistency vs availability.
            </li>
          </ul>
          <p>
            There is rarely one "correct" design. There are only designs that <strong>fit the requirements</strong> and
            designs that do not.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="two-levels-of-design">Two levels of design</h3>
          <Compare
            caption="The two levels of detail in a design. Interviews and this series focus mostly on the left side."
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
              balancer (a server that shares requests between many servers), which talks to app servers, which use a
              cache and a database." This is what most system-design articles and interviews focus on.
            </li>
            <li>
              <strong>Low-level design (LLD)</strong> is the detail inside one box: classes (code blueprints), database
              tables, API endpoints (the URLs that a service offers) and algorithms (step-by-step methods).
            </li>
          </ul>
          <p>
            This series is mostly about HLD, but we go into LLD when it matters, for example database schemas (the
            layout of tables) and API design.
          </p>
          <h3 id="the-qualities-every-system-is-judged-on">The qualities every system is judged on</h3>
          <p>
            When people say a system is "good", they usually mean some mix of these qualities. Each one is a question
            you can ask about a system:
          </p>
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
                  <td>Is data protected from people who should not see it?</td>
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
            You cannot get the best score in all of them at once. Improving one often hurts another. That is why design
            is about <strong>trade-offs</strong>. Two terms are easy to confuse: <strong>availability</strong> is
            whether the system is up and answering, and <strong>reliability</strong> is whether the answers are
            correct.
          </p>
          <h3 id="performance-vs-scalability">Performance vs scalability</h3>
          <p>People often mix these two up, so let us separate them:</p>
          <ul>
            <li>
              A <strong>performance problem</strong>: the system is slow <strong>even for one user</strong>. Example: a
              page that takes 5 seconds because of a missing database index.
            </li>
            <li>
              A <strong>scalability problem</strong>: the system is fast for one user but{" "}
              <strong>gets slower as users grow</strong>. Example: a page that loads in 100 ms with 10 users but 10
              seconds with 10,000, because every request competes for the same database.
            </li>
          </ul>
          <p>
            Fixing performance usually means better code or queries. Fixing scalability usually means changing the{" "}
            <strong>architecture</strong>. Scalability means how well a system keeps working as the load grows.
          </p>
          <h3 id="step-one-requirements">Step one: requirements</h3>
          <p>Requirements come in two types.</p>
          <p>
            <strong>1. Functional requirements: what the system does.</strong> These are the features, written from the
            user's point of view. For a URL shortener (a service that turns a long web address into a short one):
          </p>
          <ul>
            <li>A user can paste a long URL and get a short one.</li>
            <li>Visiting the short URL redirects to the long URL.</li>
            <li>A user can choose a custom alias (optional).</li>
            <li>Links can expire after a set time (optional).</li>
          </ul>
          <p>
            Just as important is what is <strong>out of scope</strong> (not part of the work). For example: "We are{" "}
            <em>not</em> building user accounts or analytics dashboards in version 1." Saying this out loud stops the
            design from growing forever.
          </p>
          <p>
            <strong>2. Non-functional requirements (NFRs): how well the system does it.</strong> These are the qualities
            from the table above, and they drive most architecture decisions. Difference in one line: functional says
            what the system does, non-functional says how well it does it. Examples:
          </p>
          <ul>
            <li>
              <strong>Scale:</strong> 100 million new links per month, 10 billion redirects per month.
            </li>
            <li>
              <strong>Latency:</strong> redirects should feel instant, under 50 ms for most users. (Latency is the
              time one request takes.)
            </li>
            <li>
              <strong>Availability:</strong> redirects must almost never fail. Creating links can accept a little
              downtime.
            </li>
            <li>
              <strong>Durability:</strong> saved data stays saved. A link, once created, must never be lost.
            </li>
            <li>
              <strong>Read/write ratio:</strong> about 100 redirects (reads) for every 1 link created (write), so it is
              very <strong>read-heavy</strong>.
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
            "The site must be fast and always up" sounds like a requirement, but it is not one. You cannot design for it
            or test it. Turn vague words into numbers:
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
                  <td>"99% of API requests finish in under 200 ms" (this kind of number is called a percentile, such as p99)</td>
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
            We learn what these numbers mean in the next few lessons: latency percentiles, availability "nines" and
            estimation.
          </p>
          <h3 id="constraints-and-assumptions">Constraints and assumptions</h3>
          <p>
            A <strong>constraint</strong> is something you cannot change. An <strong>assumption</strong> is something
            you guess is true. Write down both:
          </p>
          <ul>
            <li>Budget and team size (three engineers cannot run 40 microservices, which are many small separate services).</li>
            <li>Where users are (one country or worldwide?).</li>
            <li>Legal rules (data about EU users may need to stay in the EU).</li>
            <li>Deadlines.</li>
            <li>Assumptions like "the average post is 1 KB" or "20% of users are active daily".</li>
          </ul>
          <p>
            <strong>Assumptions are fine. Hidden assumptions are dangerous.</strong> Write them down so that others can
            question them.
          </p>
          <h3 id="thinking-in-trade-offs">Thinking in trade-offs</h3>
          <p>
            Almost every decision in this series is a trade-off. Here are the ones you will meet again and again:
          </p>
          <ul>
            <li>
              <strong>Consistency vs availability:</strong> show slightly old data, or show an error? (Consistency
              means everyone sees the same, latest data.)
            </li>
            <li>
              <strong>Latency vs throughput:</strong> answer each request quickly, or group work into batches to do more
              in total? (Throughput is how much work is done per second.)
            </li>
            <li>
              <strong>Read speed vs write speed:</strong> keep extra copies of data to make reads fast, but make writes
              slower?
            </li>
            <li>
              <strong>SQL vs NoSQL</strong> (tables vs other kinds of databases), <strong>monolith vs
              microservices</strong> (one big program vs many small ones), <strong>build vs buy</strong>.
            </li>
            <li>
              <strong>Cost vs everything else:</strong> more servers, more regions (separate geographic locations) and
              more copies all cost money.
            </li>
          </ul>
          <p>
            <strong>Reversible vs irreversible decisions.</strong> Some decisions are easy to undo, like changing a
            cache timeout. Others are very hard to undo, like choosing a database, a sharding key (the field used to
            split data across databases) or a public API format. Decide fast on the easy ones and think carefully about
            the hard ones.
          </p>
          <p>
            <strong>Write decisions down.</strong> Many teams use short{" "}
            <strong>Architecture Decision Records (ADRs)</strong>: one page saying what was decided, why, what
            other options were considered, and what trade-offs were accepted. Six months later, when someone asks "why
            did we pick PostgreSQL?", the answer is there.
          </p>
          <h3 id="simple-is-a-feature">Simple is a feature</h3>
          <p>
            Every new component (a cache, a queue, a new database) is one more thing that can break, one more thing to
            watch, and one more thing to learn. A design that meets the requirements with{" "}
            <strong>fewer parts</strong> usually beats a clever one. Many engineers call this "choosing boring
            technology". Well-known, well-understood tools let you spend your energy on the real product.
          </p>
          <Flow
            caption="The order to think in, for any design — from a blank page to a design you can explain and defend."
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
              { title: <>Estimate</>, desc: <>rough numbers for QPS (queries per second), storage and bandwidth</> },
              { title: <>High-level design</>, desc: <>the fewest boxes and arrows that meet the numbers</> },
              { title: <>Trade-offs</>, desc: <>what you gave up, and why — recorded in an ADR</>, tone: "warn" },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Spending time on design first</strong> prevents expensive rewrites, but too much design delays
              learning from real users. For small projects, a one-page design is often enough.
            </li>
            <li>
              <strong>Designing for huge scale too early</strong> wastes time and money, and adds complexity that you do
              not need yet. Design for your realistic next 12–24 months, with a way to grow later.
            </li>
            <li>
              <strong>Fixed requirements</strong> make decisions easier but can be wrong. Look at them again as you
              learn.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Twitter's "Fail Whale".</strong> In its early years, Twitter was known for an error page that
            showed a whale lifted by birds. It appeared whenever the site was overloaded. Twitter was a huge success as
            a product, but its first design had not planned for how fast it would grow or for traffic spikes during big
            events. Over several years the company redesigned major parts of its system. This is a classic example of
            non-functional requirements (scale and availability) catching up with a product.
          </p>
          <p>
            <strong>Live cricket streaming in India.</strong> Streaming platforms showing big cricket matches have to
            handle <strong>tens of millions of people watching at the same moment</strong>, with sudden jumps when a
            star player comes in to bat or a match gets close. Their requirement is not "handle average traffic". It is
            "handle the biggest spike of the year without failing". This one non-functional requirement shapes their
            whole architecture: heavy use of CDNs, adding servers <em>before</em> the match instead of waiting for
            automatic scaling, and turning off non-essential features when the load is very high.
          </p>
          <p>
            <strong>Amazon's "one-way vs two-way doors".</strong> Jeff Bezos described decisions as either{" "}
            <strong>two-way doors</strong> (easy to reverse, so decide quickly) or <strong>one-way doors</strong> (hard
            to reverse, so decide carefully). Many tech companies use this idea when they review designs.
          </p>
          <p>
            <strong>Design docs at big companies.</strong> Google, Uber and many others write a short design document
            before building any big system. It describes the goals, non-goals, proposed design, other options that were
            considered, and trade-offs. Colleagues review it before coding starts. The "non-goals" section, which says
            what they are <em>not</em> doing on purpose, is often the most useful part.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What is the first thing you do when asked to design a system?</>,
                a: (
                  <>
                    <p>
                      Ask questions before drawing anything. Agree on the core features (and what is out of scope).
                      Then get the non-functional requirements as numbers: users, requests per second, read/write
                      ratio, latency and availability targets, data size and regions. Also ask about constraints like
                      budget and team size.
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
                      If it is slow for a single user, it is a performance problem: usually code, queries or a missing
                      index. If it is fast with few users and gets worse as load grows, it is a scalability problem:
                      usually a shared bottleneck (one part that everything waits for) that needs a change in the
                      architecture.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why write down non-goals and assumptions?</>,
                a: (
                  <>
                    <p>
                      Non-goals stop the scope from growing, and they give reviewers a clear target. Written
                      assumptions (“1 KB per post”, “20% of users active daily”) can be questioned and checked. Hidden
                      ones quietly shape the design and show up later as outages.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is a one-way door decision? Give examples.</>,
                a: (
                  <>
                    <p>
                      A decision that is expensive or impossible to reverse, so it needs careful thought: the main
                      database, the shard key, the public API format, the data model. Two-way doors can be decided
                      quickly and changed later. Examples are cache TTLs (how long a cached item lives), instance sizes
                      (server sizes) and feature flags (switches that turn a feature on or off).
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
              Make requirements <strong>measurable</strong> ("p99 &lt; 200 ms", "99.95% monthly"), and state what is{" "}
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
