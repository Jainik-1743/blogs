import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Layers, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-66")!;

export const metadata: Metadata = {
  title: `Lesson 66 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "we-made-it", label: "We Made It" },
  { id: "the-whole-journey-in-one-page", label: "The Whole Journey in One Page" },
  { id: "the-20-principles-that-matter-most", label: "The 20 Principles That Matter Most" },
  { id: "a-checklist-for-designing-any-system", label: "A Checklist for Designing Any System" },
  { id: "how-the-pieces-fit-together", label: "How the Pieces Fit Together" },
  { id: "common-mistakes-to-avoid", label: "Common Mistakes to Avoid" },
  { id: "what-to-do-next", label: "What to Do Next" },
  { id: "thank-you", label: "Thank You" },
  { id: "interview-questions", label: "Interview Questions" },
  { id: "key-takeaways", label: "Key Takeaways" },
  { id: "further-reading", label: "Further Reading" },
];

export default function SdLessonSixSixPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="we-made-it" title="We Made It">
          <p>
            Sixty-five posts ago, we started with a simple question:{" "}
            <strong>what happens when you type a URL and press Enter?</strong>
          </p>
          <p>
            Since then, we've followed packets across the internet, learned how databases keep data safe, split data
            across machines, sent messages through queues, survived failures, watched systems with logs and traces,
            protected them from attackers, shipped them safely, and designed complete systems like chat apps and news
            feeds.
          </p>
          <p>This final post brings it all together:</p>
          <ul>
            <li>what each series taught us, in one line each,</li>
            <li>
              <strong>the 20 principles</strong> that matter most,
            </li>
            <li>
              a <strong>checklist</strong> you can use for any design,
            </li>
            <li>
              and <strong>what to do next</strong>.
            </li>
          </ul>
        </Section>

        <Section id="the-whole-journey-in-one-page" title="The Whole Journey in One Page">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Part</th>
                  <th>What it was about</th>
                  <th>The one idea to remember</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>1. Foundations</strong>
                  </td>
                  <td>Networking, HTTP, TLS, threads, SQL</td>
                  <td>
                    Every system is machines talking over a network. Round trips, protocols and databases decide speed.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>2. Core Concepts</strong>
                  </td>
                  <td>Requirements, scaling, latency, availability, estimation</td>
                  <td>
                    Start from <strong>measurable requirements</strong>, and estimate the <strong>size</strong> of the
                    problem before choosing tools.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>3. Building Blocks</strong>
                  </td>
                  <td>DNS, load balancers, proxies, CDNs, caches, object storage, queues, search</td>
                  <td>
                    Most systems are the <strong>same few building blocks</strong>, combined differently.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>4. Databases</strong>
                  </td>
                  <td>SQL vs NoSQL, ACID, indexes, replication, sharding, CAP, consistency</td>
                  <td>
                    <strong>Data is the hardest part.</strong> Choose the model, consistency and partitioning carefully.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>5. APIs</strong>
                  </td>
                  <td>REST, gRPC, GraphQL, real-time, idempotency, pagination, versioning</td>
                  <td>
                    APIs are <strong>contracts</strong>. Make them predictable, safe to retry and able to evolve.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>6. Async &amp; Events</strong>
                  </td>
                  <td>Queues, pub/sub, Kafka, delivery semantics, jobs, event-driven</td>
                  <td>
                    <strong>Do only what's needed now.</strong> Everything else can happen reliably a moment later.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>7. Reliability</strong>
                  </td>
                  <td>SPOFs, timeouts, retries, circuit breakers, rate limits, load shedding, backups</td>
                  <td>
                    <strong>Everything fails.</strong> Decide in advance what your system does when it does.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>8. Observability</strong>
                  </td>
                  <td>Logs, metrics, traces, SLOs, alerting, postmortems</td>
                  <td>
                    You can't fix what you can't see. <strong>Measure what users feel.</strong>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>9. Security</strong>
                  </td>
                  <td>AuthN/AuthZ, OAuth, encryption, secrets, OWASP</td>
                  <td>
                    Most breaches exploit <strong>basic mistakes</strong>. Get the basics right everywhere.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>10. Architecture &amp; Deployment</strong>
                  </td>
                  <td>Monolith vs microservices, discovery, Docker, Kubernetes, cloud, CI/CD</td>
                  <td>
                    Architecture follows <strong>team size and maturity</strong>. Ship{" "}
                    <strong>small, safe, reversible</strong> changes.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>11. Case Studies</strong>
                  </td>
                  <td>Framework, URL shortener, rate limiter, notifications, chat, feed, engineering blogs</td>
                  <td>
                    Real design means <strong>trade-offs</strong> explained clearly, not a single "right" answer.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="the-20-principles-that-matter-most" title="The 20 Principles That Matter Most">
          <p>If you forget everything else, remember these.</p>
          <h3 id="thinking">Thinking</h3>
          <ol>
            <li>
              <strong>Requirements first.</strong> Write down what the system does, what it doesn't do, and{" "}
              <strong>how well</strong> it must do it (in numbers).
            </li>
            <li>
              <strong>Estimate before you design.</strong> "40 writes per second" and "40,000 writes per second" are
              completely different systems.
            </li>
            <li>
              <strong>There's no perfect design, only trade-offs.</strong> Say what you gain and what you give up.
            </li>
            <li>
              <strong>Start simple.</strong> A well-tuned monolith and one database can go very far. Add complexity only
              when numbers demand it.
            </li>
            <li>
              <strong>Design for your next 12–24 months</strong>, with a clear path to grow, not for Google's scale on
              day one.
            </li>
          </ol>
          <h3 id="data">Data</h3>
          <ol start={6}>
            <li>
              <strong>Pick the data model from the access patterns</strong>, not from hype. PostgreSQL + Redis is a
              strong default.
            </li>
            <li>
              <strong>Decide consistency per feature.</strong> Money and uniqueness need strong consistency; likes and
              feeds can be eventually consistent.
            </li>
            <li>
              <strong>
                Replication is for availability and reads. Sharding is for writes and size. Backups are for going back
                in time.
              </strong>{" "}
              You need all three, eventually.
            </li>
            <li>
              <strong>Choose shard keys and IDs carefully.</strong> They're very hard to change later.
            </li>
            <li>
              <strong>Cache aggressively, but plan for stale data, stampedes and cache failure.</strong>
            </li>
          </ol>
          <h3 id="communication">Communication</h3>
          <ol start={11}>
            <li>
              <strong>Make every write safe to retry</strong>, using idempotency keys, unique constraints and dedup.
            </li>
            <li>
              <strong>Use queues for work the user doesn't need to wait for</strong>, and expect messages to arrive{" "}
              <strong>more than once</strong>.
            </li>
            <li>
              <strong>Treat APIs and events as contracts.</strong> Add fields freely; never break existing clients
              without a plan.
            </li>
          </ol>
          <h3 id="reliability">Reliability</h3>
          <ol start={14}>
            <li>
              <strong>Every network call needs a timeout</strong>, limited retries with{" "}
              <strong>backoff and jitter</strong>, and a plan for when the other side is down.
            </li>
            <li>
              <strong>Remove single points of failure</strong>, spread across zones, and{" "}
              <strong>test failover and restores</strong> regularly.
            </li>
            <li>
              <strong>Protect yourself from overload</strong> with rate limits for clients, and load shedding and
              graceful degradation for the system.
            </li>
          </ol>
          <h3 id="operations-and-security">Operations and security</h3>
          <ol start={17}>
            <li>
              <strong>Measure what users experience</strong>: SLOs, p99 latency and error budgets. Alert on symptoms,
              not noise.
            </li>
            <li>
              <strong>Most outages start with a change</strong>, so deploy small, gradually (canaries, feature flags)
              and reversibly.
            </li>
            <li>
              <strong>Security basics beat clever tricks</strong>: authorise every object, parameterise queries, patch
              dependencies, keep secrets out of code, and encrypt everywhere.
            </li>
            <li>
              <strong>Learn blamelessly.</strong> Write postmortems, share them, and fix the system rather than blaming
              the person.
            </li>
          </ol>
        </Section>

        <Section id="a-checklist-for-designing-any-system" title="A Checklist for Designing Any System">
          <p>Use this for interviews, design documents or real projects.</p>
          <p>
            <strong>1. Requirements</strong>
          </p>
          <ul>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Core use cases (3–5), and what's out of scope
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Users, scale, growth, read/write ratio
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Latency targets (p99), availability target, durability needs
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Consistency needs per feature
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Security, privacy, compliance and budget constraints
            </li>
          </ul>
          <p>
            <strong>2. Estimation</strong>
          </p>
          <ul>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Average and peak QPS (reads and writes separately)
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Storage over time (and media vs metadata)
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Bandwidth, cache size and server count
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              "So this means…" conclusions
            </li>
          </ul>
          <p>
            <strong>3. API and data</strong>
          </p>
          <ul>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Main endpoints / events, including idempotency, pagination and auth
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Core entities and access patterns
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Storage choice for each type of data
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              IDs, keys and (future) shard keys
            </li>
          </ul>
          <p>
            <strong>4. High-level design</strong>
          </p>
          <ul>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Clients → DNS/CDN → load balancer / gateway → services → cache / DB / storage
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Sync vs async paths (queues, workers)
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Each use case walked through the diagram
            </li>
          </ul>
          <p>
            <strong>5. Deep dives</strong>
          </p>
          <ul>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Bottlenecks at 10× and 100×: caching, replicas, sharding, queues
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Failure handling: timeouts, retries, circuit breakers, fallbacks, load shedding
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Correctness: transactions, idempotency, ordering, duplicates
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Hot keys, celebrities and spikes
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Security: authN/authZ, secrets, encryption, abuse and rate limits
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Observability: SLIs/SLOs, dashboards, alerts
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Deployment: CI/CD, canaries, rollback, database migrations
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Backups and disaster recovery (RPO/RTO)
            </li>
          </ul>
          <p>
            <strong>6. Wrap-up</strong>
          </p>
          <ul>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Key decisions and trade-offs
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Risks and what you'd monitor
            </li>
            <li>
              <span aria-hidden="true" className="mr-1.5 font-mono text-sky">
                ☐
              </span>
              Next steps and how it evolves
            </li>
          </ul>
        </Section>

        <Section id="how-the-pieces-fit-together" title="How the Pieces Fit Together">
          <p>
            Here's the "big picture" in one small diagram. (The companion reference post,{" "}
            <em>"The Complete System Design Architecture"</em>, goes through every layer in detail.)
          </p>
          <Layers
            caption="The big picture. Every case study in this series was a variation of this stack."
            layers={[
              {
                name: <>Users → DNS → CDN / WAF</>,
                tech: <>the edge</>,
                desc: <>nearest location, cached content, attacks filtered</>,
              },
              {
                name: <>Load balancer → API gateway</>,
                tech: <>the front door</>,
                desc: <>TLS, auth, rate limits, routing</>,
              },
              { name: <>Services</>, tech: <>stateless, horizontally scaled</>, desc: <>business logic</> },
              {
                name: <>Cache · databases · object storage · search</>,
                tech: <>the data tier</>,
                desc: <>Redis; primary + replicas + shards + backups; files; indexes</>,
              },
              {
                name: <>Queues / Kafka → workers</>,
                tech: <>the async side</>,
                desc: <>everything that can happen a moment later</>,
              },
              {
                name: <>Observed, secured, deployed via CI/CD</>,
                tech: <>around all of it</>,
                desc: <>logs, metrics, traces, SLOs; least privilege; canaries</>,
              },
            ]}
          />
          <p>
            Every case study in Part 11 was a <strong>variation</strong> of this picture, with a different emphasis:
          </p>
          <ul>
            <li>
              <strong>URL shortener:</strong> reads and caching.
            </li>
            <li>
              <strong>Rate limiter:</strong> fast shared counters.
            </li>
            <li>
              <strong>Notifications:</strong> queues and third-party providers.
            </li>
            <li>
              <strong>Chat:</strong> persistent connections and ordered storage.
            </li>
            <li>
              <strong>News feed:</strong> fan-out and ranking.
            </li>
          </ul>
        </Section>

        <Section id="common-mistakes-to-avoid" title="Common Mistakes to Avoid">
          <ul>
            <li>
              ❌ <strong>Buzzword architecture:</strong> Kafka, Kubernetes and microservices without a reason.
            </li>
            <li>
              ❌ <strong>Designing without numbers.</strong>
            </li>
            <li>
              ❌ <strong>Ignoring failure:</strong> assuming every dependency is always up and fast.
            </li>
            <li>
              ❌ <strong>Treating replication as backup.</strong>
            </li>
            <li>
              ❌ <strong>Using averages instead of percentiles.</strong>
            </li>
            <li>
              ❌ <strong>Unsafe retries</strong> that double-charge customers.
            </li>
            <li>
              ❌ <strong>Logging secrets</strong>, or trusting the client.
            </li>
            <li>
              ❌ <strong>Big-bang releases and big-bang rewrites.</strong>
            </li>
            <li>
              ❌ <strong>Blaming people</strong> instead of fixing systems.
            </li>
          </ul>
        </Section>

        <Section id="what-to-do-next" title="What to Do Next">
          <ol>
            <li>
              <strong>Build something small, end to end.</strong> A URL shortener or a chat app with WebSockets, Redis
              and PostgreSQL, running in Docker. Then <strong>load-test it</strong> and watch where it breaks.
            </li>
            <li>
              <strong>Break it on purpose.</strong> Kill the cache, slow down the database, cut the network, and see
              whether your timeouts, retries and fallbacks work.
            </li>
            <li>
              <strong>Add observability.</strong> Metrics, traces and one SLO. Write a small postmortem for the failures
              you caused.
            </li>
            <li>
              <strong>Read one engineering blog post or postmortem every week</strong>, and summarise it in five lines
              (post 65).
            </li>
            <li>
              <strong>Read one classic in depth:</strong> <em>Designing Data-Intensive Applications</em> is the best
              next step for most readers.
            </li>
            <li>
              <strong>Practise the framework</strong> on new problems: design YouTube, Google Drive, a ride-hailing app,
              a payment system, a web crawler, a search autocomplete.
            </li>
            <li>
              <strong>Write about it.</strong> Explaining something is the fastest way to truly understand it.
            </li>
          </ol>
        </Section>

        <Section id="thank-you" title="Thank You">
          <p>
            Thank you for reading this series, whether you followed every post or jumped straight to the topics you
            needed. System design isn't about memorising architectures. It's about{" "}
            <strong>
              asking the right questions, understanding the trade-offs, and learning from how real systems succeed and
              fail
            </strong>
            .
          </p>
          <p>Keep building, keep measuring, and keep learning. 🚀</p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>If you had to summarise system design in one sentence, what would it be?</>,
                a: (
                  <>
                    <p>
                      Choosing and connecting a small set of well-understood building blocks to meet measurable
                      requirements, and being explicit about the trade-offs you accept — especially around data, failure
                      and change.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are the first three things you do for any design problem?</>,
                a: (
                  <>
                    <p>
                      Clarify requirements, including what's out of scope and the non-functional targets as numbers;
                      estimate the size of the problem; then define the API and data model and their access patterns.
                      Only then draw the boxes.
                    </p>
                  </>
                ),
              },
              {
                q: <>What separates a good design answer from a mediocre one?</>,
                a: (
                  <>
                    <p>
                      The good one ties every component to a requirement or a number, walks each use case through the
                      diagram, handles failures and hot spots explicitly, states trade-offs honestly, and knows what it
                      would monitor and do next.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's the most important habit to carry into real projects?</>,
                a: (
                  <>
                    <p>
                      Small, reversible, observable changes, backed by blameless learning when things go wrong. Most
                      outages start with a change, and most improvements come from studying the ones that got through.
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
              The series covered{" "}
              <strong>
                foundations → concepts → building blocks → data → APIs → async → reliability → observability → security
                → architecture → case studies
              </strong>
              .
            </li>
            <li>
              The most important habits:{" "}
              <strong>
                requirements first, estimate, start simple, choose trade-offs consciously, design for failure, make
                retries safe, measure what users feel, deploy safely, and secure the basics
              </strong>
              .
            </li>
            <li>
              Use the <strong>design checklist</strong> for any new system, and keep learning by{" "}
              <strong>building, breaking, observing and reading</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann
            </li>
            <li>
              <em>System Design Interview</em> Volumes 1 and 2 by Alex Xu (and Sahn Lam)
            </li>
            <li>
              <em>Site Reliability Engineering</em> and <em>The Site Reliability Workbook</em> by Google
            </li>
            <li>
              <em>Release It!</em> by Michael Nygard
            </li>
            <li>The System Design Primer and the awesome-scalability collection on GitHub</li>
            <li>
              The companion reference posts: <em>"System Design Glossary: Every Short Form Explained"</em> and{" "}
              <em>"The Complete System Design Architecture"</em>
            </li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
