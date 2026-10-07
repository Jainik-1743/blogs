import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Flow, Layers, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-29")!;

export const metadata: Metadata = {
  title: `Lesson 29 — ${lesson.title}`,
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

export default function SdLessonTwoNinePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            There are hundreds of databases, and each website says its database is fast, scalable and easy. Teams often
            choose because of hype, because a big company uses it, or because one engineer likes it. Two years later,
            they are stuck:
          </p>
          <ul>
            <li>the database cannot answer a query (a question about the data) that the business now needs,</li>
            <li>it is expensive to run,</li>
            <li>or nobody knows how to fix it at 3 AM.</li>
          </ul>
          <p>
            In the last nine lessons we learned the building blocks: data models, transactions, storage engines,
            normalisation, replication, sharding, consistent hashing, CAP and consistency models. This lesson turns
            them into a <strong>practical decision process</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            A database is a program that stores data and lets you read and change it safely. Choosing one is like
            choosing a <strong>vehicle</strong>.
          </p>
          <ul>
            <li>
              A <strong>family car</strong> (PostgreSQL/MySQL) does almost everything well: commuting, shopping, trips.
              Most people should start here.
            </li>
            <li>
              A <strong>delivery truck</strong> (Cassandra/ScyllaDB) carries enormous loads on fixed routes, but it's
              awkward for a quick trip to the shops. (It is great for lots of simple writes, but weak for ad-hoc queries.)
            </li>
            <li>
              A <strong>motorbike</strong> (Redis) is extremely fast for short trips. But it cannot carry much, and it is
              not where you keep valuables. (Redis keeps data in memory, which is fast but small and costly.)
            </li>
            <li>
              A <strong>bus</strong> (a data warehouse like BigQuery, a database built for big reports) moves huge
              numbers of passengers (rows) together. But you would not take it to buy milk (look up one row).
            </li>
          </ul>
          <p>
            There is no "best vehicle". Pick the one that fits <strong>your trips</strong>. Many households
            have more than one.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="step-1-ask-the-right-questions">Step 1: Ask the right questions</h3>
          <p>
            <strong>About the data:</strong>
          </p>
          <ol>
            <li>
              <strong>What shape is it?</strong> Structured records with relationships (tables)? Nested documents?
              Time-ordered events? A graph of connections? Large files?
            </li>
            <li>
              <strong>How big is it now, and in 2–3 years?</strong> Gigabytes, terabytes or petabytes? (Estimate as in
              lesson 10.)
            </li>
            <li>
              <strong>How important is correctness?</strong> Money and inventory need <strong>ACID transactions</strong>{" "}
              and <strong>strong consistency</strong>. Likes and views do not. A transaction is a group of changes that
              succeed or fail together. ACID is the set of four promises a transaction makes: Atomicity (all or
              nothing), Consistency (rules stay true), Isolation (parallel transactions do not disturb each other)
              and Durability (saved data survives a crash). Strong consistency means every read sees the latest write.
            </li>
          </ol>
          <p>
            <strong>About the access patterns</strong> (how your app reads and writes data):
          </p>
          <ol start={4}>
            <li>
              <strong>What are the main queries?</strong> Look-ups by key, by ranges, rich filters and joins, full-text
              search, or aggregations (sums and counts) over millions of rows?
            </li>
            <li>
              <strong>What is the read/write ratio?</strong> Read-heavy (catalogues, profiles) or write-heavy (events,
              logs, messages, IoT sensor data)?
            </li>
            <li>
              <strong>What latency and throughput do you need?</strong> Latency is the time one request takes.
              Throughput is how many operations happen per second. Do you need milliseconds per request? Thousands or
              millions of operations per second?
            </li>
            <li>
              <strong>Will new, unplanned queries appear?</strong> If so, prefer flexible (relational) models over
              designs built around fixed access patterns.
            </li>
          </ol>
          <p>
            <strong>About operations and people:</strong>
          </p>
          <ol start={8}>
            <li>
              <strong>Where are users?</strong> One region or worldwide? Are there data residency rules (laws that say
              where data must be stored)?
            </li>
            <li>
              <strong>Managed or self-hosted?</strong> A managed service (RDS, Cloud SQL, Atlas, DynamoDB) is run for you
              by a cloud company. It costs more per GB but saves a lot of work.
            </li>
            <li>
              <strong>What does your team know?</strong> A database your team understands well usually beats a "better"
              one nobody can run.
            </li>
            <li>
              <strong>Cost:</strong> licences, hardware, storage, backups, data transfer, and{" "}
              <strong>people's time</strong>.
            </li>
            <li>
              <strong>Ecosystem:</strong> drivers for your language, ORMs (tools that map database rows to objects in
              code), backup tools, monitoring, hosting options, community and hiring.
            </li>
          </ol>
          <h3 id="step-2-start-from-a-sensible-default">Step 2: Start from a sensible default</h3>
          <p>For most new applications:</p>
          <blockquote>
            <p>
              <strong>Start with a relational database (PostgreSQL or MySQL), plus Redis for caching.</strong>
            </p>
          </blockquote>
          <p>Why:</p>
          <ul>
            <li>
              It handles structured data, relationships, <strong>transactions</strong> and{" "}
              <strong>flexible queries</strong>. A relational database stores data in tables with rows and columns, and
              you query it with SQL.
            </li>
            <li>It is mature, well understood, and has excellent managed options.</li>
            <li>
              PostgreSQL alone covers a surprising amount. <strong>JSONB</strong> is a column type that stores JSON
              documents in a fast binary form. <strong>Full-text search</strong> finds words inside text.{" "}
              <strong>PostGIS</strong> is an extension for maps and locations (geospatial data).{" "}
              <strong>Extensions</strong> are add-on packages, and some add time-series and vector search.
            </li>
            <li>
              One well-tuned server with replicas (extra copies that serve reads) scales{" "}
              <strong>much further</strong> than most products ever need.
            </li>
          </ul>
          <p>
            Redis is an in-memory data store. It keeps data in RAM, so it is very fast, and it is mostly used as a
            cache (a quick copy of data you can get slowly elsewhere). Add specialised databases{" "}
            <strong>when a clear need appears</strong>, not before.
          </p>
          <h3 id="step-3-recognise-the-signals-for-something-else">Step 3: Recognise the signals for something else</h3>
          <p>
            Each row below names a signal (a sign in your needs) and the kind of database that fits it. Terms: a
            key-value store looks up a value by its key, like a dictionary. A time series is a list of values with
            timestamps. A graph database stores things and the links between them. A vector database finds items that
            are similar in meaning, using embeddings (lists of numbers that describe a text or image). Object storage
            keeps whole files, like Amazon S3.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Signal</th>
                  <th>Consider</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Massive write volume of time-ordered data per key (messages, events, IoT), simple access patterns,
                    multi-region writes
                  </td>
                  <td>
                    <strong>Cassandra / ScyllaDB / DynamoDB</strong>
                  </td>
                </tr>
                <tr>
                  <td>Simple key-based access at huge scale with sudden spikes, and you want no servers to manage</td>
                  <td>
                    <strong>DynamoDB</strong> (or similar managed key-value)
                  </td>
                </tr>
                <tr>
                  <td>Very fast temporary data: cache, sessions, rate limits, leaderboards, queues</td>
                  <td>
                    <strong>Redis</strong> (or Valkey, Memcached)
                  </td>
                </tr>
                <tr>
                  <td>Varied, nested records where each item has different attributes, and the team prefers documents</td>
                  <td>
                    <strong>MongoDB</strong> (or PostgreSQL JSONB)
                  </td>
                </tr>
                <tr>
                  <td>Full-text search, typo tolerance, facets, relevance</td>
                  <td>
                    <strong>Elasticsearch / OpenSearch</strong> (lesson 19)
                  </td>
                </tr>
                <tr>
                  <td>Aggregations over billions of rows: dashboards, business reports (BI)</td>
                  <td>
                    <strong>ClickHouse, BigQuery, Snowflake, Redshift</strong>
                  </td>
                </tr>
                <tr>
                  <td>Metrics and sensor readings with time-based queries and retention</td>
                  <td>
                    <strong>TimescaleDB, InfluxDB, Prometheus</strong>
                  </td>
                </tr>
                <tr>
                  <td>Deep relationship queries (friends-of-friends, fraud rings)</td>
                  <td>
                    <strong>Neo4j, Amazon Neptune</strong>
                  </td>
                </tr>
                <tr>
                  <td>Similarity search on embeddings (AI features)</td>
                  <td>
                    <strong>pgvector</strong> first, then a dedicated <strong>vector database</strong> if needed
                  </td>
                </tr>
                <tr>
                  <td>Tables and transactions, plus spreading over many servers (horizontal scale) and many regions</td>
                  <td>
                    <strong>Distributed SQL: Spanner, CockroachDB, YugabyteDB, TiDB</strong>
                  </td>
                </tr>
                <tr>
                  <td>Files, images, video, backups</td>
                  <td>
                    <strong>Object storage</strong> (lesson 17), not a database
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Layers
            caption="The “vehicles” in one stack, and when to reach for each."
            layers={[
              {
                name: <>PostgreSQL / MySQL</>,
                tech: <>the family car</>,
                desc: <>start here — relations, ACID, flexible queries, JSONB, PostGIS</>,
              },
              {
                name: <>Redis</>,
                tech: <>the motorbike</>,
                desc: <>caches, sessions, rate limits, leaderboards, live locations</>,
              },
              {
                name: <>Cassandra / DynamoDB</>,
                tech: <>the delivery truck</>,
                desc: <>huge write volume, simple key access, multi-region</>,
              },
              {
                name: <>Elasticsearch / OpenSearch</>,
                tech: <>the search desk</>,
                desc: <>full-text, typos, facets, relevance</>,
              },
              { name: <>BigQuery / ClickHouse</>, tech: <>the bus</>, desc: <>aggregations over billions of rows</> },
              { name: <>Object storage</>, tech: <>the warehouse</>, desc: <>files, images, video, backups</> },
            ]}
          />
          <h3 id="step-4-check-the-hard-requirements">Step 4: Check the hard requirements</h3>
          <p>Before you commit, check these points:</p>
          <ul>
            <li>
              <strong>Transactions:</strong> does it support what you need (multi-row? multi-table? across partitions?)
              at the isolation level you need (lesson 21)? Isolation level means how much parallel transactions can see of each other.
            </li>
            <li>
              <strong>Consistency:</strong> can you get strong reads where you need them (lessons 27–28)?
            </li>
            <li>
              <strong>Scaling path:</strong> how will it grow? Options are replicas, sharding (splitting data across servers) and automatic partitioning (lessons 24–25).
            </li>
            <li>
              <strong>Failure behaviour:</strong> what happens when a node (one server) or a zone (one data centre) fails? How is failover done? Failover means switching to a backup server.
            </li>
            <li>
              <strong>Backups and recovery:</strong> can you do point-in-time recovery (restore the data to an exact moment)? How long does a restore take?
            </li>
            <li>
              <strong>Security and compliance:</strong> encryption, access control, audit logs, data residency.
            </li>
          </ul>
          <h3 id="step-5-prototype-with-your-real-workload">Step 5: Prototype with your real workload</h3>
          <p>A benchmark is a test that measures speed. Vendor benchmarks use the vendor's own chosen workload, so do your own test instead:</p>
          <ul>
            <li>
              load <strong>realistic data volumes</strong> (or a scaled sample),
            </li>
            <li>
              run <strong>your actual queries</strong> at <strong>expected peak rates</strong>,
            </li>
            <li>
              measure <strong>p99 latency</strong> (lesson 8), not just averages. p99 is the time that 99 out of 100 requests beat, so it shows the slow cases,
            </li>
            <li>
              test <strong>failure scenarios</strong>: kill a node, fill a disk, cause replication lag,
            </li>
            <li>
              and estimate the <strong>monthly cost</strong> at your expected size.
            </li>
          </ul>
          <h3 id="worked-example-a-ride-hailing-app">Worked example: a ride-hailing app</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data / feature</th>
                  <th>Needs</th>
                  <th>Choice</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Users, drivers, trips, payments</td>
                  <td>Relationships, ACID, reporting</td>
                  <td>
                    <strong>PostgreSQL</strong> (with replicas; shard by city later if needed)
                  </td>
                </tr>
                <tr>
                  <td>Live driver locations (updated every few seconds)</td>
                  <td>Huge write rate, short-lived data, "nearby" queries</td>
                  <td>
                    <strong>Redis</strong> with geospatial commands (or an in-memory geo index)
                  </td>
                </tr>
                <tr>
                  <td>Trip history for analytics and pricing models</td>
                  <td>Aggregations over billions of rows</td>
                  <td>
                    <strong>Columnar warehouse</strong> (stores data by column, good for sums over many rows; BigQuery / ClickHouse) fed by CDC or events
                  </td>
                </tr>
                <tr>
                  <td>Receipts, invoices, and search in support tools</td>
                  <td>Full-text search</td>
                  <td>
                    <strong>Elasticsearch / OpenSearch</strong>
                  </td>
                </tr>
                <tr>
                  <td>Driver documents and profile photos</td>
                  <td>Large files</td>
                  <td>
                    <strong>Object storage + CDN</strong>
                  </td>
                </tr>
                <tr>
                  <td>Rate limiting, OTP attempts, sessions</td>
                  <td>Fast counters with a TTL (time to live: the data deletes itself after a set time)</td>
                  <td>
                    <strong>Redis</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Each database has <strong>one clear job</strong>. PostgreSQL stays the <strong>source of truth</strong>,
            which means it is the place whose data is treated as the real, final version for core business data.
            CDC (change data capture) means reading the database's change log and sending each change to other
            systems.
          </p>
          <h3 id="step-6-keep-the-number-of-databases-small">Step 6: Keep the number of databases small</h3>
          <p>Every extra database adds:</p>
          <ul>
            <li>another system to learn, monitor, back up, secure, upgrade and pay for,</li>
            <li>another place for data to get out of sync (you will need events or CDC between them),</li>
            <li>another on-call skill set.</li>
          </ul>
          <p>
            A good rule: <strong>one primary source of truth</strong>, plus a few purpose-built stores that are{" "}
            <strong>derived</strong> from it and could be rebuilt.
          </p>
          <h3 id="step-7-if-you-must-migrate-do-it-safely">Step 7: If you must migrate, do it safely</h3>
          <p>
            A migration moves data and traffic from one database to another. When a database no longer fits, it
            usually follows this pattern. Dual write means writing to both databases. Backfill means copying the old
            data to the new one. Shadow reads mean reading from both and comparing, while users still get the old
            answer.
          </p>
          <Flow
            caption="A safe database migration. Every step can be paused or rolled back."
            nodes={[
              { title: <>Dual write or CDC</>, desc: <>new writes reach both old and new databases</> },
              { title: <>Backfill</>, desc: <>copy historical data across</> },
              { title: <>Verify</>, desc: <>counts, checksums, sampled reads</> },
              { title: <>Shadow reads</>, desc: <>read both, compare, still serve the old one</> },
              { title: <>Switch reads</>, desc: <>gradually move reads to the new database</> },
              { title: <>Switch writes</>, desc: <>the new database becomes the source of truth</>, tone: "warn" },
              {
                title: <>Decommission</>,
                desc: <>keep the old one read-only for a while, then retire it</>,
                tone: "muted",
              },
            ]}
          />
          <p>
            Big migrations often take <strong>months</strong>. This is why a good first choice matters. It is also why{" "}
            <strong>boring, flexible</strong> defaults are valuable.
          </p>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>One general-purpose database:</strong> simple, consistent and cheap to operate, but it may be
              not the best fit for some very specialised workloads at huge scale.
            </li>
            <li>
              <strong>Many specialised databases:</strong> the best fit for each job, but more operations, cost, sync
              complexity and skills needed.
            </li>
            <li>
              <strong>Managed services:</strong> less operational work and built-in high availability and backups, but
              higher cost at scale, some lock-in (hard to leave the vendor) and less control.
            </li>
            <li>
              <strong>The newest, trendiest database:</strong> exciting features, but a smaller community, fewer
              experts, and more unknown ways to fail.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Discord's two migrations.</strong> Discord moved message storage from MongoDB to Cassandra when its
            data outgrew one database, and years later from Cassandra to ScyllaDB when running it became hard and latency
            spikes grew with trillions of messages. Each time, the decision came from{" "}
            <strong>clear, measured problems</strong>, and each migration was carefully planned with dual reads and data
            validation.
          </p>
          <p>
            <strong>Uber's Postgres-to-MySQL move.</strong> In 2016, Uber published a detailed post explaining why it
            moved some core systems from PostgreSQL to MySQL, citing specific issues with write amplification (one small change causing many extra writes) and
            replication at its scale. The PostgreSQL community published careful replies. Reading both is a great
            lesson: <strong>database choices depend on specific workloads and versions</strong>, and "better" is always
            "better for <em>this</em>".
          </p>
          <p>
            <strong>"Just use Postgres."</strong> A growing number of teams deliberately run most of their stack on
            PostgreSQL (relational data, JSON documents, queues, full-text search, even vectors) and only add other
            systems when they must. Notion, for example, scaled by <strong>sharding PostgreSQL</strong> rather than
            switching databases.
          </p>
          <p>
            <strong>Stack Overflow</strong> has famously run on a relational database (SQL Server) with heavy caching,
            scaling mostly vertically (using bigger servers instead of more servers), and serves a huge audience. It proves that a "boring" choice done well can go a
            very long way.
          </p>
          <p>
            <strong>Polyglot at big companies.</strong> "Polyglot" means using many languages, here many database types. Netflix uses Cassandra for high-volume data,
            relational databases for others, Elasticsearch for search and many analytics systems. Each is
            chosen for a job, and backed by strong platform teams to operate them. Smaller teams usually cannot afford
            that many systems.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>How do you choose a database for a new system?</>,
                a: (
                  <>
                    <p>
                      Start from the data's shape, the main queries and access patterns, the read/write ratio,
                      correctness and consistency needs, size and growth, latency targets, regions, team skills and
                      cost. Default to PostgreSQL or MySQL plus Redis, and add a specialised store only for a clear,
                      measured signal.
                    </p>
                  </>
                ),
              },
              {
                q: <>When would you pick Cassandra or DynamoDB over PostgreSQL?</>,
                a: (
                  <>
                    <p>
                      When you have very high write volumes of simple data found by key (messages, events, IoT readings).
                      You also need to know the access patterns up front, or need writes in many regions. And you must be
                      willing to design one table per query and accept limited transactions and limited ad-hoc queries.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why not use one specialised database for every job?</>,
                a: (
                  <>
                    <p>
                      Each extra database is another system to operate, secure, back up and keep in sync, and another
                      skill for on-call. Keep one source of truth and a few derived stores that could be rebuilt from
                      it.
                    </p>
                  </>
                ),
              },
              {
                q: <>How would you benchmark a candidate database?</>,
                a: (
                  <>
                    <p>
                      Use realistic data volumes and your real queries at the peak rates you expect. Measure p99, not
                      only the average. Then switch off nodes, fill disks and create replication lag, and estimate the
                      monthly cost at the target size. Vendor benchmarks measure the vendor's workload, not yours.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you migrate a live system to a new database?</>,
                a: (
                  <>
                    <p>
                      Write to both databases (dual write or CDC). Copy the old data (backfill). Check it with counts and
                      checksums (a checksum is a short fingerprint of data). Read from both and compare (shadow reads).
                      Move reads over slowly, then writes. Keep the old database read-only as a fallback, and retire it
                      last.
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
              Choose a database from{" "}
              <strong>data shape, access patterns, correctness needs, scale, latency, team skills and cost</strong>, not
              from hype.
            </li>
            <li>
              <strong>Default to PostgreSQL/MySQL plus Redis</strong>. They cover most needs, including JSON, search and
              geospatial via extensions.
            </li>
            <li>
              Add <strong>specialised databases</strong> for clear signals: huge write-heavy streams, search, analytics,
              graphs, vectors, global transactional scale.
            </li>
            <li>
              <strong>Prototype with real workloads</strong>, measure p99, test failures and estimate cost.
            </li>
            <li>
              Keep <strong>one source of truth</strong> and few databases. <strong>Migrate carefully</strong> with dual
              writes, backfill, verification and gradual switching.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann (chapters 1–3 and 12, "The Future of
              Data Systems")
            </li>
            <li>AWS's decision guide "Choosing an AWS database service"</li>
            <li>The DB-Engines website (for database categories and popularity trends)</li>
            <li>Discord's blog posts on storing billions and trillions of messages</li>
            <li>
              Uber's 2016 engineering post on moving from Postgres to MySQL, and the PostgreSQL community's responses
            </li>
          </ul>
          <p>
            <em>
              This wraps up Part 4. Next up, Part 5: APIs &amp; Communication, starting with "REST API Design Best
              Practices".
            </em>
          </p>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
