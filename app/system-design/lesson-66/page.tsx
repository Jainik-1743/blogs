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
            Since then, we have followed data packets across the internet. We learned how databases keep data safe and
            how to split data across machines. We sent messages through queues and learned how to survive failures. We
            watched systems with logs and traces, protected them from attackers, and released them safely. Last, we
            designed complete systems like chat apps and news feeds.
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
                    Every system is machines talking over a network. Round trips (a request and its reply), protocols
                    (agreed rules for talking) and databases decide the speed.
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
                    Most systems are the <strong>same few building blocks</strong>, put together in different ways.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>4. Databases</strong>
                  </td>
                  <td>SQL vs NoSQL, ACID, indexes, replication, sharding, CAP, consistency</td>
                  <td>
                    <strong>Data is the hardest part.</strong> Choose the data model, the consistency level (how up to
                    date every copy must be) and the partitioning (how data is split) with care.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>5. APIs</strong>
                  </td>
                  <td>REST, gRPC, GraphQL, real-time, idempotency, pagination, versioning</td>
                  <td>
                    An API is a <strong>contract</strong>: a promise about how programs talk to your system. Make it
                    predictable, safe to retry and able to change over time.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>6. Async &amp; Events</strong>
                  </td>
                  <td>Queues, pub/sub, Kafka, delivery semantics, jobs, event-driven</td>
                  <td>
                    <strong>Do only what is needed now.</strong> Everything else can happen reliably a moment later, in
                    the background.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>7. Reliability</strong>
                  </td>
                  <td>SPOFs, timeouts, retries, circuit breakers, rate limits, load shedding, backups</td>
                  <td>
                    <strong>Everything fails.</strong> Decide in advance what your system will do when it does. (SPOF
                    means single point of failure: one part that stops everything if it breaks.)
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>8. Observability</strong>
                  </td>
                  <td>Logs, metrics, traces, SLOs, alerting, postmortems</td>
                  <td>
                    You cannot fix what you cannot see. <strong>Measure what users feel.</strong> (SLO means service
                    level objective, a reliability goal you promise to meet.)
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>9. Security</strong>
                  </td>
                  <td>AuthN/AuthZ, OAuth, encryption, secrets, OWASP</td>
                  <td>
                    Most breaches use <strong>basic mistakes</strong>. Get the basics right everywhere. (AuthN means
                    authentication: proving who you are. AuthZ means authorisation: what you are allowed to do.)
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>10. Architecture &amp; Deployment</strong>
                  </td>
                  <td>Monolith vs microservices, discovery, Docker, Kubernetes, cloud, CI/CD</td>
                  <td>
                    Architecture follows <strong>team size and maturity</strong>. Release{" "}
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
              <strong>Estimate before you design.</strong> Make a rough guess of the load. "40 writes per second" and
              "40,000 writes per second" need completely different systems.
            </li>
            <li>
              <strong>There's no perfect design, only trade-offs.</strong> Say what you gain and what you give up.
            </li>
            <li>
              <strong>Start simple.</strong> A well-tuned monolith (one application) and one database can go very far.
              Add complexity only when the numbers demand it.
            </li>
            <li>
              <strong>Design for your next 12–24 months</strong>, with a clear path to grow, not for Google's scale on
              day one.
            </li>
          </ol>
          <h3 id="data">Data</h3>
          <ol start={6}>
            <li>
              <strong>Pick the data model from the access patterns</strong> (how your code reads and writes the data),
              not from hype. PostgreSQL (a relational database) plus Redis (a fast in-memory store) is a strong default.
            </li>
            <li>
              <strong>Decide consistency for each feature.</strong> Money and uniqueness need strong consistency, which
              means every reader sees the latest data. Likes and feeds can be eventually consistent, which means copies
              may differ for a short time and then agree.
            </li>
            <li>
              <strong>
                Replication is for availability and reads. Sharding is for writes and size. Backups are for going back
                in time.
              </strong>{" "}
              Replication keeps extra copies of data on other machines. Sharding splits data across machines. A backup
              is a saved copy from an earlier moment. You will need all three, in time.
            </li>
            <li>
              <strong>Choose shard keys and IDs carefully.</strong> A shard key is the field that decides which machine
              holds a row. It is very hard to change later.
            </li>
            <li>
              <strong>Cache a lot, but plan for stale data, stampedes and cache failure.</strong> A cache is a fast copy
              of data. Stale means old. A stampede is when many requests miss the cache together and hit the database.
            </li>
          </ol>
          <h3 id="communication">Communication</h3>
          <ol start={11}>
            <li>
              <strong>Make every write safe to retry</strong>. Idempotency means doing an action twice has the same
              result as doing it once. Use idempotency keys (a unique ID sent with each request), unique constraints
              and dedup (removing duplicates).
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
              <strong>Every network call needs a timeout</strong> (a limit on how long you wait). Allow only a few
              retries, with <strong>backoff and jitter</strong>: wait longer after each try, plus a random extra time.
              Also have a plan for when the other side is down.
            </li>
            <li>
              <strong>Remove single points of failure</strong>, spread across zones, and{" "}
              <strong>test failover and restores</strong> regularly.
            </li>
            <li>
              <strong>Protect yourself from overload.</strong> Use rate limits (a cap on requests per client). Use load
              shedding (refuse some requests on purpose) and graceful degradation (turn off less important features) to
              keep the system alive.
            </li>
          </ol>
          <h3 id="operations-and-security">Operations and security</h3>
          <ol start={17}>
            <li>
              <strong>Measure what users experience</strong>: SLOs, p99 latency and error budgets. p99 latency is the
              time that 99 of 100 requests beat. An error budget is how much failure your SLO still allows. Alert on
              symptoms that users feel, not on noise.
            </li>
            <li>
              <strong>Most outages start with a change</strong>, so deploy in small steps, gradually and reversibly. A
              canary sends a new version to a few users first. A feature flag turns a feature on or off without a deploy.
            </li>
            <li>
              <strong>Security basics beat clever tricks</strong>. Authorise every object. Parameterise queries (send
              user input as data, never as SQL code). Patch dependencies. Keep secrets out of code. Encrypt everywhere.
            </li>
            <li>
              <strong>Learn blamelessly.</strong> Write postmortems (reports about an outage), share them, and fix the
              system instead of blaming a person.
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
              Average and peak QPS (queries per second; count reads and writes separately)
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
              Observability: SLIs (the measured numbers) and SLOs (the goals for them), dashboards, alerts
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
              Backups and disaster recovery (RPO is how much data you can afford to lose; RTO is how long you can be
              down)
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
            Here is the "big picture" in one small diagram. (The companion reference post,{" "}
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
              ❌ <strong>Treating replication as backup.</strong> Replication copies mistakes too. If you delete a table,
              the replicas delete it as well.
            </li>
            <li>
              ❌ <strong>Using averages instead of percentiles.</strong> An average hides slow requests. A percentile
              such as p99 shows them.
            </li>
            <li>
              ❌ <strong>Unsafe retries</strong> that double-charge customers.
            </li>
            <li>
              ❌ <strong>Logging secrets</strong>, or trusting the client.
            </li>
            <li>
              ❌ <strong>Big-bang releases and big-bang rewrites</strong> (changing everything at once).
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
              <strong>Practise the framework</strong> on new problems. Design YouTube, Google Drive, a ride-hailing app,
              a payment system, a web crawler or search autocomplete.
            </li>
            <li>
              <strong>Write about it.</strong> Explaining something is the fastest way to truly understand it.
            </li>
          </ol>
        </Section>

        <Section id="thank-you" title="Thank You">
          <p>
            Thank you for reading this series, whether you read every post or went straight to the topics you needed.
            System design is not about memorising architectures. It is about{" "}
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
                      System design means choosing and connecting a small set of well-known building blocks to meet
                      requirements you can measure. You also say clearly which trade-offs you accept, especially about
                      data, failure and change.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are the first three things you do for any design problem?</>,
                a: (
                  <>
                    <p>
                      First, clarify the requirements. Include what is out of scope, and give the non-functional targets
                      (speed, availability) as numbers. Second, estimate the size of the problem. Third, define the API,
                      the data model and how the data is accessed. Only then draw the boxes.
                    </p>
                  </>
                ),
              },
              {
                q: <>What separates a good design answer from a mediocre one?</>,
                a: (
                  <>
                    <p>
                      A good answer ties every component to a requirement or a number. It walks each use case through the
                      diagram and handles failures and hot spots clearly. It states trade-offs honestly, and says what it
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
                      Make small changes that you can undo and can watch. When things go wrong, learn without blame. Most
                      outages start with a change, and most improvements come from studying the outages that happened.
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
