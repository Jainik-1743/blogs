import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-65")!;

export const metadata: Metadata = {
  title: `Lesson 65 — ${lesson.title}`,
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

export default function SdLessonSixFivePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Interview-style designs are clean: boxes, arrows and a neat final answer. Real systems are{" "}
            <strong>messy</strong>:
          </p>
          <ul>
            <li>
              they were built by teams under deadlines, with the knowledge they had <strong>at the time</strong>,
            </li>
            <li>they grew in ways nobody predicted,</li>
            <li>they broke in surprising ways,</li>
            <li>and they were migrated, rewritten, un-rewritten and patched for years.</li>
          </ul>
          <p>
            The best way to learn how systems <strong>really</strong> change over time is to read the stories engineers
            publish themselves. These are <strong>engineering blogs, conference talks, research papers and public
            postmortems</strong>. A postmortem is a written report about an outage. It says what happened, why it
            happened, and how to stop it happening again. Throughout this series, I have pointed to many of these
            stories (Discord, Stripe, Netflix, Cloudflare, Instagram, Notion, GitHub, Google, Amazon). In this post, I
            will share <strong>how to read them</strong>, the <strong>lessons that keep repeating</strong>, and{" "}
            <strong>a reading list</strong> to keep learning after the case studies.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Reading engineering blogs is like{" "}
            <strong>
              reading the travel diaries of people who have already climbed the mountain you are about to climb
            </strong>
            . The diaries tell you:
          </p>
          <ul>
            <li>which paths looked easy but led to cliffs,</li>
            <li>where the weather turned bad,</li>
            <li>which equipment actually mattered,</li>
            <li>
              and, most importantly, <strong>why</strong> they made each choice, given <strong>their</strong>{" "}
              conditions.
            </li>
          </ul>
          <p>
            You won't climb exactly the same route (your team, traffic and budget are different), but you'll{" "}
            <strong>recognise the dangers earlier</strong> and make <strong>better decisions</strong>.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="how-to-read-an-engineering-post-and-actually-learn-from-it">
            How to read an engineering post (and actually learn from it)
          </h3>
          <p>
            Do not just look for "they used Kafka". For each post, write down five things. Kafka is a system that stores
            a stream of events in order, so many programs can read them.
          </p>
          <Flow
            caption="Five notes to take on every engineering post — and the question to ask afterwards."
            nodes={[
              { title: <>Problem</>, desc: <>what was broken or about to break — with numbers</> },
              { title: <>Constraints</>, desc: <>scale, team size, budget, deadlines, existing tech, regulations</> },
              { title: <>Options</>, desc: <>the alternatives considered, and why they were rejected</> },
              { title: <>Decision</>, desc: <>what they chose, and the trade-offs they accepted</> },
              { title: <>Result</>, desc: <>what improved, what went wrong, what they'd do differently</> },
              {
                title: <>Then ask</>,
                desc: <>would this apply at my scale, with my team? which building block is it really about?</>,
                tone: "good",
              },
            ]}
          />
          <p>Then ask yourself:</p>
          <ul>
            <li>
              <strong>Would this apply to my system?</strong> At my scale, with my team?
            </li>
            <li>
              <strong>Which building block from this series is this really about?</strong> For example: caching (keeping
              a quick copy of data), sharding (splitting data across machines), idempotency (an action is safe to
              repeat), or load shedding (refusing some requests so the system survives).
            </li>
            <li>
              <strong>What is the "boring" lesson behind the exciting headline?</strong>
            </li>
          </ul>
          <p>
            <strong>Be a little sceptical (do not believe everything):</strong>
          </p>
          <ul>
            <li>
              Blog posts are written <strong>after</strong> success, and often leave out the messy parts.
            </li>
            <li>
              Solutions are tuned to <strong>that company's scale</strong>. What Netflix needs may be overkill for you.
            </li>
            <li>
              Posts get old. Check the <strong>date</strong>, and check whether the company later changed its approach.
              Many did.
            </li>
          </ul>
          <h3 id="the-lessons-that-keep-repeating">The lessons that keep repeating</h3>
          <p>After reading many engineering blogs and postmortems, the same themes appear again and again.</p>
          <p>
            <strong>1. Start simple, and scale when the numbers say so.</strong> Instagram, Stack Overflow, Shopify,
            Notion and many others grew very large on <strong>relational databases</strong> (databases with tables and
            SQL), caching and replicas (extra copies of the database) before they tried anything unusual. Notion and
            Figma only sharded Postgres (split it across many machines) when their single database was clearly reaching
            its limits (post 25). Stack Overflow is famous for serving a very large audience with a small number of
            powerful servers (post 7).
          </p>
          <blockquote>
            <p>
              Lesson: <strong>the simplest thing that meets the requirements usually wins</strong>, as long as you{" "}
              <strong>measure</strong> and plan the next step.
            </p>
          </blockquote>
          <p>
            <strong>2. Migrations are the real work.</strong> Discord went from MongoDB to Cassandra to ScyllaDB.
            Facebook Messenger moved from HBase to MySQL/MyRocks. Uber moved some systems from Postgres to MySQL.
            Dropbox moved file storage off Amazon S3 to its own system. Every one of these posts spends more time on{" "}
            <strong>how they migrated safely</strong> than on the new technology (post 29). The safe steps include:
            dual writes (write to the old and new system at the same time), backfills (copy the old data over), shadow
            reads (read from the new system quietly and compare the answers), verification, and a gradual cut-over
            (move users over a little at a time).
          </p>
          <blockquote>
            <p>
              Lesson: <strong>design for change</strong>, and learn the migration playbook, because you will need it.
            </p>
          </blockquote>
          <p>
            <strong>3. Architecture swings back and forth.</strong> A monolith is one big application. Microservices
            are many small applications that talk to each other. Amazon and Netflix moved from monoliths to services.
            Segment moved <strong>back</strong> from 100+ microservices to one service. Amazon Prime Video moved one
            monitoring tool from many distributed serverless components to a single application. It cut the cost of that
            tool by about 90%. Uber grouped thousands of microservices into domains (post 53).
          </p>
          <blockquote>
            <p>
              Lesson: <strong>there's no permanently "right" architecture</strong>, only the right one for your current
              team, scale and workload.
            </p>
          </blockquote>
          <p>
            <strong>4. Caching is everywhere, and so are its bugs.</strong> Facebook's memcache paper, Twitter's Redis
            timelines, Instagram's Redis tuning and Etsy's cache smearing (posts 15–16, 64) all show that caching makes
            huge systems possible. Cache smearing means spreading out when cached items expire, so they do not all
            expire at once. Facebook's 2010 outage shows that caches can <strong>cause</strong> outages too. A bad
            setting made many clients ask the database for data at the same time. Each failed attempt made the overload
            worse, which is a feedback loop.
          </p>
          <blockquote>
            <p>
              Lesson: <strong>cache a lot, but design for stampedes, invalidation and cache failure.</strong> A stampede
              is when many requests all miss the cache together and hit the database. Invalidation means removing or
              updating cached data when the real data changes.
            </p>
          </blockquote>
          <p>
            <strong>5. Most outages start with a change.</strong> Across public postmortems (Cloudflare's regex
            incident, Knight Capital's deployment, CrowdStrike's content update, the AWS S3 typo, GitHub's failover in
            2018, GitLab's database deletion), the trigger is usually a{" "}
            <strong>deploy, configuration change, command or automated action</strong> (posts 45, 48 and 58).
          </p>
          <blockquote>
            <p>
              Lesson: <strong>small, gradual, observable, reversible changes</strong> prevent more outages than any
              other single practice. A canary release sends a new version to a few users first. A feature flag is a
              switch that turns a feature on or off without a new deploy. A staged rollout grows the number of users
              step by step.
            </p>
          </blockquote>
          <p>
            <strong>6. Failure handling is where the design really lives.</strong> Netflix built Chaos Monkey (a tool
            that randomly turns off servers to test the system) and Hystrix (a library that stops calls to a failing
            service). AWS writes about static stability (keep working even if a control service fails), shuffle sharding
            (give each customer a random group of servers, so one bad customer hurts fewer others) and load shedding.
            Google's SRE books focus on overload and cascading failures, where one failure causes the next (posts
            40–44).
          </p>
          <blockquote>
            <p>
              Lesson: <strong>assume every dependency will be slow or down</strong>, and decide in advance what your
              system does then. Use timeouts (stop waiting after a set time), retries with jitter (wait a random extra
              time before trying again), circuit breakers (stop calling a service that keeps failing), bulkheads (keep
              resources separate so one failure cannot use them all), fallbacks (a simpler backup answer) and load
              shedding.
            </p>
          </blockquote>
          <p>
            <strong>7. Idempotency and "exactly-once" are business problems, not just technical ones.</strong> An action
            is idempotent if doing it twice has the same result as doing it once. Exactly-once means every message is
            processed one time, no more and no less. Stripe's writing on idempotency keys, Confluent's writing on
            Kafka's exactly-once semantics, and many payment-system postmortems show that{" "}
            <strong>duplicate or lost messages cost real money</strong> (posts 34 and 37).
          </p>
          <blockquote>
            <p>
              Lesson: <strong>make retries safe everywhere</strong>, and never trust a label that says "exactly-once"
              without asking "what happens if this runs twice?".
            </p>
          </blockquote>
          <p>
            <strong>8. Observability pays for itself.</strong> Observability means being able to see what is happening
            inside your system from its logs, metrics and traces. Google's Dapper paper (about tracing one request across
            many services), the birth of Prometheus (a metrics tool) at SoundCloud, Honeycomb's writing on
            high-cardinality events (data with very many different values), and SRE practices around SLOs and error
            budgets all point the same way (posts 46–48). An SLO is a reliability goal, such as "99.9% of requests
            succeed". An error budget is how much failure the SLO still allows.
          </p>
          <blockquote>
            <p>
              Lesson: you can't fix what you can't see. <strong>Instrument early</strong>, alert on{" "}
              <strong>user symptoms</strong>, and use <strong>SLOs</strong> to balance speed and reliability.
            </p>
          </blockquote>
          <p>
            <strong>9. Security failures are usually basic.</strong> Equifax (software that was not patched), Capital One
            (SSRF, where an attacker tricks a server into calling internal addresses), Uber and Toyota (leaked secrets),
            MOVEit (SQL injection, where input is run as database commands) and Log4Shell and xz (attacks through
            dependencies, also called the supply chain) were rarely clever tricks (posts 49–52).
          </p>
          <blockquote>
            <p>
              Lesson:{" "}
              <strong>
                patch, scan, least privilege, no secrets in code, and check authorisation on every object.
              </strong>{" "}
              Least privilege means giving each user or service only the access it needs. The basics stop most
              attacks.
            </p>
          </blockquote>
          <p>
            <strong>10. People and culture matter as much as technology.</strong> Amazon's two-pizza teams (teams small
            enough to feed with two pizzas), Etsy's blameless postmortems (reports that look for system causes, not
            people to blame), Google's design docs and SRE error budgets, and Conway's Law (post 53) all show that{" "}
            <strong>how teams are organised and how they learn</strong> shapes the systems they build. Conway's Law
            says a system tends to copy the communication structure of the team that builds it.
          </p>
          <blockquote>
            <p>
              Lesson: <strong>blameless learning, clear ownership and written decisions</strong> are part of system
              design.
            </p>
          </blockquote>
          <Stats
            caption="The ten lessons, compressed."
            stats={[
              { value: <>1 · Start simple</>, label: <>scale when the numbers say so</> },
              { value: <>2 · Migrations</>, label: <>are the real work</> },
              { value: <>3 · Architecture</>, label: <>swings back and forth</> },
              { value: <>4 · Caching</>, label: <>everywhere, bugs included</> },
              { value: <>5 · Changes</>, label: <>cause most outages</> },
              { value: <>6 · Failure handling</>, label: <>is where the design lives</> },
              { value: <>7 · Idempotency</>, label: <>is a business problem</> },
              { value: <>8 · Observability</>, label: <>pays for itself</> },
              { value: <>9 · Security failures</>, label: <>are usually basic</> },
              { value: <>10 · People &amp; culture</>, label: <>shape the system</> },
            ]}
          />
          <h3 id="a-reading-list-to-continue">A reading list to continue</h3>
          <p>Here are some engineering blogs and resources worth following. Search the web for them by name.</p>
          <p>
            <strong>Engineering blogs:</strong>
          </p>
          <ul>
            <li>
              <strong>Netflix Tech Blog:</strong> resilience, chaos engineering, data pipelines, streaming at scale.
            </li>
            <li>
              <strong>AWS Builders' Library:</strong> how Amazon builds and operates services (timeouts, load shedding,
              deployments, caching).
            </li>
            <li>
              <strong>Cloudflare Blog:</strong> networking, edge computing, DDoS defence, and detailed public
              postmortems.
            </li>
            <li>
              <strong>Discord Blog (engineering posts):</strong> real-time systems, Elixir, Rust, message storage at
              scale.
            </li>
            <li>
              <strong>Stripe Engineering Blog:</strong> API design, idempotency, rate limiting, reliability.
            </li>
            <li>
              <strong>Uber Engineering Blog:</strong> microservices at scale, Kafka, data platforms, geospatial systems.
            </li>
            <li>
              <strong>Meta Engineering Blog:</strong> huge-scale infrastructure, caching, storage and AI systems.
            </li>
            <li>
              <strong>
                Slack Engineering, GitHub Engineering, Shopify Engineering, Figma Engineering, Notion's engineering
                posts:
              </strong>{" "}
              product-scale systems and migrations.
            </li>
            <li>
              <strong>LinkedIn Engineering, Pinterest Engineering, Airbnb Engineering, Dropbox Tech:</strong> feeds,
              search, data and infrastructure.
            </li>
          </ul>
          <p>
            <strong>Curated collections (on GitHub):</strong>
          </p>
          <ul>
            <li>
              <strong>awesome-scalability</strong>, an organised index of engineering posts by topic (scalability,
              availability, stability, performance),
            </li>
            <li>
              <strong>The System Design Primer</strong>, including its lists of real-world architectures and company
              engineering blogs,
            </li>
            <li>
              <strong>engineering-blogs</strong>, a long list of company engineering blogs to follow,
            </li>
            <li>
              <strong>post-mortems</strong>, a collection of public incident reports,
            </li>
            <li>
              <strong>papers-we-love</strong>, research papers grouped by topic.
            </li>
          </ul>
          <p>
            <strong>Classic research papers</strong> (the ideas behind many systems in this series):
          </p>
          <ul>
            <li>
              <strong>The Google File System</strong> (2003) and <strong>MapReduce</strong> (2004): large-scale storage
              and processing.
            </li>
            <li>
              <strong>Bigtable</strong> (2006) and <strong>Spanner</strong> (2012): wide-column storage and globally
              consistent databases.
            </li>
            <li>
              <strong>Dynamo</strong> (Amazon, 2007): highly available key-value storage. It uses consistent hashing
              (a way to spread keys over servers so few keys move when servers change) and quorums (a vote among
              replicas).
            </li>
            <li>
              <strong>Kafka</strong> (LinkedIn, 2011) and Jay Kreps' essay <strong>"The Log"</strong>: log-based
              messaging.
            </li>
            <li>
              <strong>Scaling Memcache at Facebook</strong> (2013) and <strong>TAO</strong> (2013): caching and the
              social graph.
            </li>
            <li>
              <strong>Dapper</strong> (Google, 2010): distributed tracing.
            </li>
            <li>
              <strong>The Tail at Scale</strong> (2013): why the slowest requests matter.
            </li>
            <li>
              <strong>Borg</strong> (2015): cluster management, and the roots of Kubernetes.
            </li>
            <li>
              <strong>Raft</strong> (2014): an understandable consensus algorithm. Consensus is how several machines
              agree on one value even if some fail.
            </li>
            <li>
              <strong>Zanzibar</strong> (2019): Google's global system for authorisation (deciding who may do what).
            </li>
          </ul>
          <p>
            <strong>Books to go deeper:</strong>
          </p>
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
            <li>
              <em>Building Microservices</em> by Sam Newman
            </li>
            <li>
              <em>Database Internals</em> by Alex Petrov
            </li>
          </ul>
          <p>
            <strong>Courses:</strong>
          </p>
          <ul>
            <li>
              <strong>MIT 6.5840 Distributed Systems</strong> (lecture notes and papers)
            </li>
            <li>
              <strong>CMU 15-445 Database Systems</strong> (free lectures online)
            </li>
          </ul>
          <h3 id="build-a-learning-habit">Build a learning habit</h3>
          <ul>
            <li>
              <strong>Read one engineering post or postmortem each week</strong>, and write a{" "}
              <strong>5-line summary</strong> using the template above.
            </li>
            <li>
              <strong>Map each post</strong> to the concepts in this series. For example: "This is really about hot keys
              (one key with far more traffic than the rest) and sharding."
            </li>
            <li>
              <strong>Redesign it yourself:</strong> "If I had Discord's problem with <em>my</em> team, what would I
              do?"
            </li>
            <li>
              <strong>Follow up:</strong> check whether the company later changed its approach. The follow-up posts are
              often the most educational.
            </li>
            <li>
              <strong>Share what you learn.</strong> Writing about it (as I've done with this series) is one of the best
              ways to understand it deeply.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Learning from big companies:</strong> battle-tested ideas and real numbers, but solutions tuned to
              a scale you may never need. Always <strong>translate to your context</strong>.
            </li>
            <li>
              <strong>Reading widely vs deeply:</strong> many posts give broad awareness, while re-reading a few
              classics (DDIA, the Dynamo paper, the SRE book) gives deep understanding. Do both.
            </li>
            <li>
              <strong>Following trends vs basic ideas:</strong> tools change every few years, but the{" "}
              <strong>fundamentals</strong> (caching, replication, partitioning, consistency, idempotency, failure
              handling) stay relevant for decades.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>Every idea in this series came from somewhere real:</p>
          <ul>
            <li>
              <strong>Consistent hashing</strong> started as an MIT research paper and helped start Akamai, a CDN
              company (post 26).
            </li>
            <li>
              <strong>Kafka</strong> began at LinkedIn as a way to move data between its many systems in an orderly
              way (post 36).
            </li>
            <li>
              <strong>Circuit breakers and bulkheads</strong> became mainstream through Michael Nygard's book and
              Netflix's Hystrix (post 42).
            </li>
            <li>
              <strong>Error budgets</strong> came from Google SRE (post 47).
            </li>
            <li>
              <strong>Blameless postmortems</strong> spread from Etsy and Google (post 48).
            </li>
            <li>
              <strong>Kubernetes</strong> grew from Google's Borg (post 56).
            </li>
            <li>
              <strong>Hybrid fan-out</strong> was explained publicly by Twitter's engineers (post 64).
            </li>
          </ul>
          <p>Engineers sharing their experiences openly is one of the best things about our industry.</p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Tell me about an engineering blog post or postmortem you learned from.</>,
                a: (
                  <>
                    <p>
                      Pick one and walk through problem, constraints, options, decision and result. For example,
                      Discord moved from Cassandra to ScyllaDB. The problem was slow p99 latency (the slowest 1% of
                      requests) and hard day-to-day operation with trillions of messages. They migrated carefully and
                      checked the results. The lesson is that the migration is most of the work.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why be sceptical when reading big-company engineering posts?</>,
                a: (
                  <>
                    <p>
                      They are written after success and often leave out the messy parts. They fit that company's
                      scale, team and budget, which may be different from mine. They may also be out of date. Many
                      companies later reversed the approach they wrote about.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is the most common trigger of major outages?</>,
                a: (
                  <>
                    <p>
                      A change: a deploy, a configuration update, a command or an automated action. That is why canaries,
                      feature flags, staged rollouts and fast rollbacks (going back to the old version) prevent more
                      outages than any other single practice.
                    </p>
                  </>
                ),
              },
              {
                q: <>What does Segment's “Goodbye Microservices” teach?</>,
                a: (
                  <>
                    <p>
                      Splitting a system into too many small services creates extra operational work, repeated code and
                      slow development. Segment merged back into one service, and work became faster and more reliable.
                      Architecture should follow team size and workload, not fashion.
                    </p>
                  </>
                ),
              },
              {
                q: <>How would you keep learning system design after a course or interview?</>,
                a: (
                  <>
                    <p>
                      Follow a few engineering blogs. Read public postmortems regularly. Read the classic papers behind
                      the tools you use (Dynamo, Bigtable, Kafka, Spanner). Best of all, build and run something small,
                      then write down what broke.
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
              Real systems are shaped by <strong>constraints, history and trade-offs</strong>. Engineering blogs, talks,
              papers and postmortems show how.
            </li>
            <li>
              Read each post with a template: <strong>problem → constraints → options → decision → result</strong>, then{" "}
              <strong>translate</strong> it to your own context.
            </li>
            <li>
              The recurring lessons are:
              <ul>
                <li>
                  <strong>start simple</strong>,
                </li>
                <li>
                  <strong>migrations are the real work</strong>,
                </li>
                <li>
                  <strong>architectures swing back and forth</strong>,
                </li>
                <li>
                  <strong>cache carefully</strong>,
                </li>
                <li>
                  <strong>most outages start with a change</strong>,
                </li>
                <li>
                  <strong>design for failure</strong>,
                </li>
                <li>
                  <strong>make retries safe</strong>,
                </li>
                <li>
                  <strong>invest in observability</strong>,
                </li>
                <li>
                  <strong>security failures are usually basic</strong>,
                </li>
                <li>
                  <strong>culture matters</strong>.
                </li>
              </ul>
            </li>
            <li>
              Keep learning with{" "}
              <strong>engineering blogs, curated GitHub lists, classic papers, books and courses</strong>.
            </li>
            <li>
              Build a <strong>weekly habit</strong>: read, summarise, map the post to fundamentals, redesign, and share.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The "awesome-scalability" collection on GitHub</li>
            <li>
              The System Design Primer on GitHub (sections "Real world architectures", "Company architectures" and
              "Company engineering blogs")
            </li>
            <li>The "engineering-blogs" and "post-mortems" collections on GitHub</li>
            <li>The "papers-we-love" repository on GitHub</li>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann
            </li>
          </ul>
          <hr />
          <p>
            <strong>That is the end of the main lessons in this system design series.</strong> The next pages are a
            conclusion and quick reference sheets. We started with what happens when you type a URL and press Enter. We
            finished by designing chat systems and news feeds used by millions of people. Thank you for reading along.
            Now go build something, measure it, break it safely, and write about what you learn.
          </p>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
