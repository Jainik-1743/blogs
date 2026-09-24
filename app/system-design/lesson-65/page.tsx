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
            The best way to learn how systems <strong>really</strong> evolve is to read the stories engineers publish
            themselves: <strong>engineering blogs, conference talks, research papers and public postmortems</strong>.
            Throughout this series, I've pointed to many of them (Discord, Stripe, Netflix, Cloudflare, Instagram,
            Notion, GitHub, Google, Amazon). In this final post, I'll share <strong>how to read them</strong>, the{" "}
            <strong>lessons that keep repeating</strong>, and <strong>a reading list</strong> to keep learning after
            this series.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Reading engineering blogs is like{" "}
            <strong>
              reading the travel diaries of people who've already climbed the mountain you're about to climb
            </strong>
            . They tell you:
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
          <p>Don't just skim for "they used Kafka". For each post, write down five things:</p>
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
              <strong>Which building block from this series is this really about?</strong> (caching? sharding?
              idempotency? load shedding?)
            </li>
            <li>
              <strong>What's the "boring" lesson under the exciting headline?</strong>
            </li>
          </ul>
          <p>
            <strong>A healthy dose of scepticism helps:</strong>
          </p>
          <ul>
            <li>
              Blog posts are written <strong>after</strong> success, and often leave out the messy parts.
            </li>
            <li>
              Solutions are tuned to <strong>that company's scale</strong>. What Netflix needs may be overkill for you.
            </li>
            <li>
              Posts age. Check the <strong>date</strong>, and whether the company later changed its approach (many
              did!).
            </li>
          </ul>
          <h3 id="the-lessons-that-keep-repeating">The lessons that keep repeating</h3>
          <p>After reading many engineering blogs and postmortems, the same themes appear again and again.</p>
          <p>
            <strong>1. Start simple, and scale when the numbers say so.</strong> Instagram, Stack Overflow, Shopify,
            Notion and many others grew very large on <strong>relational databases</strong>, caching and replicas before
            doing anything exotic. Notion and Figma only sharded Postgres when their single database was clearly
            reaching its limits (post 25). Stack Overflow is famous for serving a massive audience with a small number
            of powerful servers (post 7).
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
            Dropbox moved storage off S3 to its own system. Every one of these posts spends more time on{" "}
            <strong>how they migrated safely</strong> (dual writes, backfills, shadow reads, verification, gradual
            cut-over) than on the new technology (post 29).
          </p>
          <blockquote>
            <p>
              Lesson: <strong>design for change</strong>, and learn the migration playbook, because you will need it.
            </p>
          </blockquote>
          <p>
            <strong>3. Architecture swings back and forth.</strong> Amazon and Netflix moved from monoliths to services.
            Segment moved <strong>back</strong> from 100+ microservices to one service. Amazon Prime Video moved one
            monitoring tool from distributed serverless components to a single application and cut costs by about 90%.
            Uber grouped thousands of microservices into domains (post 53).
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
            huge systems possible. Facebook's 2010 outage, caused by a feedback loop between caches and the database,
            shows how caches can <strong>cause</strong> outages too.
          </p>
          <blockquote>
            <p>
              Lesson: <strong>cache aggressively, but design for stampedes, invalidation and cache failure.</strong>
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
              Lesson: <strong>small, gradual, observable, reversible changes</strong> (canaries, feature flags, staged
              rollouts) prevent more outages than any other single practice.
            </p>
          </blockquote>
          <p>
            <strong>6. Failure handling is where the design really lives.</strong> Netflix built Chaos Monkey and
            Hystrix, AWS writes about static stability, shuffle sharding and load shedding, and Google's SRE books focus
            on overload and cascading failures (posts 40–44).
          </p>
          <blockquote>
            <p>
              Lesson: <strong>assume every dependency will be slow or down</strong>, and decide in advance what your
              system does then: timeouts, retries with jitter, circuit breakers, bulkheads, fallbacks and load shedding.
            </p>
          </blockquote>
          <p>
            <strong>7. Idempotency and "exactly-once" are business problems, not just technical ones.</strong> Stripe's
            writing on idempotency keys, Confluent's on Kafka's exactly-once semantics, and many payment-system
            postmortems show that <strong>duplicate or lost messages cost real money</strong> (posts 34 and 37).
          </p>
          <blockquote>
            <p>
              Lesson: <strong>make retries safe everywhere</strong>, and never trust a label that says "exactly-once"
              without asking "what happens if this runs twice?".
            </p>
          </blockquote>
          <p>
            <strong>8. Observability pays for itself.</strong> Google's Dapper paper, the birth of Prometheus at
            SoundCloud, Honeycomb's writing on high-cardinality events, and SRE practices around SLOs and error budgets
            all point the same way (posts 46–48).
          </p>
          <blockquote>
            <p>
              Lesson: you can't fix what you can't see. <strong>Instrument early</strong>, alert on{" "}
              <strong>user symptoms</strong>, and use <strong>SLOs</strong> to balance speed and reliability.
            </p>
          </blockquote>
          <p>
            <strong>9. Security failures are usually basic.</strong> Equifax (unpatched software), Capital One (SSRF),
            Uber and Toyota (leaked secrets), MOVEit (SQL injection) and Log4Shell and xz (dependencies and the supply
            chain) were rarely exotic (posts 49–52).
          </p>
          <blockquote>
            <p>
              Lesson:{" "}
              <strong>
                patch, scan, least privilege, no secrets in code, and check authorisation on every object.
              </strong>{" "}
              The basics stop most attacks.
            </p>
          </blockquote>
          <p>
            <strong>10. People and culture matter as much as technology.</strong> Amazon's two-pizza teams, Etsy's
            blameless postmortems, Google's design docs and SRE error budgets, and Conway's Law (post 53) all show that{" "}
            <strong>how teams are organised and how they learn</strong> shapes the systems they build.
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
          <p>Here are some engineering blogs and resources worth following. Search for them by name.</p>
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
              <strong>Dynamo</strong> (Amazon, 2007): highly available key-value storage, consistent hashing and
              quorums.
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
              <strong>Raft</strong> (2014): understandable consensus.
            </li>
            <li>
              <strong>Zanzibar</strong> (2019): global authorisation.
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
              <strong>Map each post</strong> to the concepts in this series: "This is really about hot keys and
              sharding."
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
              <strong>Following trends vs fundamentals:</strong> tools change every few years, but{" "}
              <strong>fundamentals</strong> (caching, replication, partitioning, consistency, idempotency, failure
              handling) stay relevant for decades.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>Every idea in this series came from somewhere real:</p>
          <ul>
            <li>
              <strong>Consistent hashing</strong> started as an MIT paper and helped create Akamai (post 26).
            </li>
            <li>
              <strong>Kafka</strong> began as LinkedIn's answer to its data integration mess (post 36).
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
                      Pick one and walk through problem, constraints, options, decision and result — for example
                      Discord's move from Cassandra to ScyllaDB: rising p99 latency and operational pain at trillions of
                      messages, the migration with dual reads and validation, and the lesson that migrations dominate
                      the work.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why be sceptical when reading big-company engineering posts?</>,
                a: (
                  <>
                    <p>
                      They're written after success, often leave out the messy parts, are tuned to that company's scale,
                      team and budget, and may be outdated — many companies later reversed the approach they wrote
                      about.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is the most common trigger of major outages?</>,
                a: (
                  <>
                    <p>
                      A change — a deploy, a configuration update, a command or an automated action — which is why
                      canaries, feature flags, staged rollouts and fast rollbacks prevent more outages than any other
                      single practice.
                    </p>
                  </>
                ),
              },
              {
                q: <>What does Segment's “Goodbye Microservices” teach?</>,
                a: (
                  <>
                    <p>
                      That splitting too finely creates operational overhead, duplicated code and slow development;
                      merging back into one service improved productivity and reliability. Architecture should follow
                      team size and workload, not fashion.
                    </p>
                  </>
                ),
              },
              {
                q: <>How would you keep learning system design after a course or interview?</>,
                a: (
                  <>
                    <p>
                      Follow a few engineering blogs, read public postmortems regularly, read the classic papers behind
                      the tools you use (Dynamo, Bigtable, Kafka, Spanner), and — best of all — build and operate
                      something small, then write down what broke.
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
            <strong>That's the end of this 65-post series on system design.</strong> We started with what happens when
            you type a URL and press Enter, and finished designing chat systems and news feeds used by millions. Thank
            you for reading along. Now go build something, measure it, break it safely, and write about what you learn.
          </p>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
