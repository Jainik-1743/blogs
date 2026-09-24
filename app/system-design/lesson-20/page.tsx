import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { AsciiDiagram, Compare, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-20")!;

export const metadata: Metadata = {
  title: `Lesson 20 — ${lesson.title}`,
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

const diagram1 = `users                         orders
┌────┬───────┐                ┌────┬─────────┬────────┐
│ id │ name  │                │ id │ user_id │ total  │
├────┼───────┤                ├────┼─────────┼────────┤
│ 42 │ Asha  │◄───────────────│ 7  │ 42      │ 1,299  │
└────┴───────┘                └────┴─────────┴────────┘`;

const code1 = `"session:abc123"  →  {"userId": 42, "expires": "..."}
"cart:42"         →  [991, 405, 17]
"rate:ip:1.2.3.4" →  87`;

const code2 = `{
  "_id": "order_7",
  "user": { "id": 42, "name": "Asha" },
  "items": [
    { "productId": 991, "name": "Running shoes", "qty": 1, "price": 1299 }
  ],
  "status": "shipped",
  "shippingAddress": { "city": "Pune", "pin": "411001" }
}`;

const diagram2 = `Partition key: channel_id     Clustering key: message_time (newest first)
┌─────────────┬─────────────────────┬──────────┬──────────────┐
│ channel_id  │ message_time        │ user     │ text         │
├─────────────┼─────────────────────┼──────────┼──────────────┤
│ general     │ 2026-12-07 10:02:11 │ asha     │ "hi all"     │
│ general     │ 2026-12-07 10:01:55 │ ravi     │ "morning!"   │
└─────────────┴─────────────────────┴──────────┴──────────────┘`;

const diagram3 = `(Asha) ──FOLLOWS──► (Ravi) ──FOLLOWS──► (Meera)
   │                                       ▲
   └──────────LIKES──► (Post 17) ◄─WROTE───┘`;

export default function SdLessonTwoZeroPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>You're starting a new project and someone asks, "SQL or NoSQL?"</p>
          <ul>
            <li>One teammate says "NoSQL scales better, let's use MongoDB."</li>
            <li>Another says "Just use Postgres for everything."</li>
            <li>A blog post says Cassandra is what Netflix uses, so it must be good.</li>
          </ul>
          <p>
            This decision matters, because{" "}
            <strong>changing your database later is one of the hardest migrations in software</strong>. But "SQL vs
            NoSQL" is really the wrong question. The right question is:{" "}
            <strong>what shape is my data, and how will I read and write it?</strong>
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>Think about different ways to organise information at home:</p>
          <ul>
            <li>
              <strong>A filing cabinet with labelled forms (relational/SQL).</strong> Every form has the same fields. A
              customer form refers to an order form by its number. It's very organised, and easy to cross-reference
              ("show me every order for this customer").
            </li>
            <li>
              <strong>A folder per topic, containing whatever notes you need (document).</strong> Everything about one
              trip (tickets, hotel, plans) is in one folder. It's flexible; one folder can look different from another.
            </li>
            <li>
              <strong>Numbered lockers (key-value).</strong> Locker 4521 holds <em>something</em>. You can't search by
              what's inside; you just open the locker by its number. It's extremely fast.
            </li>
            <li>
              <strong>A huge spreadsheet with millions of columns, split across many rooms (wide-column).</strong> Built
              for massive amounts of data written very quickly.
            </li>
            <li>
              <strong>A wall of photos connected by strings (graph).</strong> Perfect for "who knows whom" and "friends
              of friends".
            </li>
          </ul>
          <p>
            Each is great for some jobs and awkward for others. NoSQL isn't "better SQL". It's{" "}
            <strong>a different set of trade-offs</strong>.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="relational-databases-sql">Relational databases (SQL)</h3>
          <p>
            Data lives in <strong>tables</strong> with a fixed <strong>schema</strong> (columns and types), linked by{" "}
            <strong>keys</strong> (post 5).
          </p>
          <AsciiDiagram text={diagram1} />
          <p>
            <strong>Strengths:</strong>
          </p>
          <ul>
            <li>
              <strong>Joins:</strong> combine data flexibly, including for questions you didn't plan for.
            </li>
            <li>
              <strong>Transactions (ACID):</strong> multi-row changes succeed or fail together (post 21).
            </li>
            <li>
              <strong>Constraints:</strong> the database enforces rules (unique emails, valid foreign keys).
            </li>
            <li>
              <strong>SQL:</strong> a powerful, standard query language that everyone knows.
            </li>
            <li>
              <strong>Mature tools:</strong> backups, monitoring, ORMs, decades of experience.
            </li>
          </ul>
          <p>
            <strong>Weaknesses:</strong>
          </p>
          <ul>
            <li>Schema changes on huge tables need care.</li>
            <li>Scaling writes beyond one machine is hard (sharding, post 25).</li>
            <li>Joins across many machines are expensive.</li>
          </ul>
          <p>
            <strong>Examples:</strong> PostgreSQL, MySQL, SQL Server, Oracle, SQLite.
          </p>
          <h3 id="key-value-stores">Key-value stores</h3>
          <p>
            The simplest model: a <strong>key</strong> maps to a <strong>value</strong>. The database doesn't look
            inside the value.
          </p>
          <CodeBlock lang="http" code={code1} />
          <ul>
            <li>✅ Extremely fast and easy to scale (just split keys across machines).</li>
            <li>
              ❌ You can only look things up by key. "Find all carts containing product 991" isn't possible without
              extra work.
            </li>
          </ul>
          <p>
            <strong>Examples:</strong> Redis, Amazon DynamoDB (key-value plus some document features), Memcached, etcd.
            <strong>Good for:</strong> sessions, caches, shopping carts, feature flags, counters.
          </p>
          <h3 id="document-databases">Document databases</h3>
          <p>
            Each record is a <strong>document</strong>, usually JSON-like, that can contain nested data. Documents in
            the same collection don't need identical fields.
          </p>
          <CodeBlock lang="json" code={code2} />
          <ul>
            <li>
              ✅ <strong>Data that's read together is stored together.</strong> One read fetches the whole order, with
              no joins.
            </li>
            <li>✅ A flexible schema is easy to evolve, and fits naturally with JSON APIs.</li>
            <li>❌ Weaker at joins and relationships across documents.</li>
            <li>❌ Duplicated data (like the user's name inside every order) must be kept in sync.</li>
            <li>
              ❌ "Schemaless" really means the <strong>schema lives in your code</strong>, and messy data can creep in.
            </li>
          </ul>
          <p>
            <strong>Examples:</strong> MongoDB, Couchbase, Firestore, Amazon DocumentDB.
            <strong>Good for:</strong> product catalogues (different products have different attributes), content
            management, user profiles, event data.
          </p>
          <h3 id="wide-column-databases">Wide-column databases</h3>
          <p>
            These look like tables, but are designed to be <strong>spread across many machines</strong> and to handle{" "}
            <strong>huge write volumes</strong>. Data is organised by a <strong>partition key</strong> (which machine)
            and a <strong>clustering key</strong> (the order within that partition).
          </p>
          <AsciiDiagram text={diagram2} />
          <ul>
            <li>✅ Massive scale and very fast writes, with no single master (in Cassandra's design).</li>
            <li>✅ Great for time-ordered data per key: messages per channel, readings per sensor, events per user.</li>
            <li>
              ❌ <strong>You must design tables around your queries.</strong> Queries that don't use the partition key
              are slow or impossible.
            </li>
            <li>❌ No joins, and limited transactions.</li>
          </ul>
          <p>
            <strong>Examples:</strong> Apache Cassandra, ScyllaDB, HBase, Google Bigtable.
            <strong>Good for:</strong> chat messages, IoT sensor data, activity feeds, logs at huge scale.
          </p>
          <h3 id="graph-databases">Graph databases</h3>
          <p>
            Data is stored as <strong>nodes</strong> (things) and <strong>edges</strong> (relationships). Following
            relationships is fast, even many steps deep.
          </p>
          <AsciiDiagram caption="A tiny social graph" text={diagram3} />
          <p>
            A query like "people Asha might know: friends of her friends whom she doesn't follow yet" is simple in a
            graph database, and painful with many self-joins in SQL.
          </p>
          <p>
            <strong>Examples:</strong> Neo4j, Amazon Neptune.
            <strong>Good for:</strong> social networks, recommendation engines, fraud detection (finding rings of linked
            accounts), knowledge graphs.
          </p>
          <Compare
            caption="The five data models side by side."
            columns={[
              {
                title: <>Relational</>,
                items: [
                  { sign: "+", text: <>Joins, ACID, constraints, flexible queries</> },
                  { sign: "-", text: <>Scaling writes across machines takes work</> },
                ],
                verdict: <>Most business apps (PostgreSQL, MySQL)</>,
              },
              {
                title: <>Key-value</>,
                items: [
                  { sign: "+", text: <>Fastest lookups; trivial to scale out</> },
                  { sign: "-", text: <>Only by key</> },
                ],
                verdict: <>Sessions, caches, carts (Redis, DynamoDB)</>,
              },
              {
                title: <>Document</>,
                items: [
                  { sign: "+", text: <>Read the whole record in one go; flexible schema</> },
                  { sign: "-", text: <>Weak across documents; duplicated data to sync</> },
                ],
                verdict: <>Catalogues, CMS, profiles (MongoDB)</>,
              },
              {
                title: <>Wide-column</>,
                items: [
                  { sign: "+", text: <>Massive write scale; time-ordered per key</> },
                  { sign: "-", text: <>Tables designed per query; no joins</> },
                ],
                verdict: <>Messages, IoT, events (Cassandra, ScyllaDB)</>,
              },
            ]}
          />
          <h3 id="other-specialised-databases">Other specialised databases</h3>
          <ul>
            <li>
              <strong>Time-series</strong> (TimescaleDB, InfluxDB, Prometheus): metrics and sensor data, compression,
              time-based queries.
            </li>
            <li>
              <strong>Search engines</strong> (Elasticsearch, OpenSearch): full-text search (post 19).
            </li>
            <li>
              <strong>Analytics / columnar</strong> (ClickHouse, BigQuery, Snowflake): huge aggregations over billions
              of rows.
            </li>
            <li>
              <strong>Vector databases</strong>: similarity search over embeddings (post 19).
            </li>
          </ul>
          <h3 id="schema-on-write-vs-schema-on-read">Schema-on-write vs schema-on-read</h3>
          <ul>
            <li>
              <strong>Schema-on-write (SQL):</strong> the database checks data <strong>when you write it</strong>. Wrong
              types or missing fields are rejected.
            </li>
            <li>
              <strong>Schema-on-read (most NoSQL):</strong> anything can be written. Your code interprets the data{" "}
              <strong>when it reads it</strong>, and must handle old and odd formats.
            </li>
          </ul>
          <p>
            Neither is "no schema". It's a question of <strong>who enforces it</strong>, the database or your
            application.
          </p>
          <h3 id="two-ways-to-design-your-data">Two ways to design your data</h3>
          <Compare
            caption="Two ways to start a data model."
            columns={[
              {
                title: <>Entity-first (typical SQL)</>,
                items: [
                  { sign: "·", text: <>Model users, orders, products and relationships, normalised</> },
                  { sign: "·", text: <>Then write whatever queries you need</> },
                  { sign: "+", text: <>Flexible for questions nobody has asked yet</> },
                ],
              },
              {
                title: <>Access-pattern-first (typical NoSQL)</>,
                items: [
                  { sign: "·", text: <>List the exact queries first</> },
                  { sign: "·", text: <>Shape storage so each is one fast lookup</> },
                  { sign: "+", text: <>Very fast at scale</> },
                  { sign: "-", text: <>New kinds of query may need new tables or copies</> },
                ],
              },
            ]}
          />
          <p>
            <strong>Entity-first (typical SQL).</strong> Model the real-world things (users, orders, products) and their
            relationships, normalised (post 23). Then write whatever queries you need. It's flexible for{" "}
            <strong>unknown future questions</strong>.
          </p>
          <p>
            <strong>Access-pattern-first (typical NoSQL).</strong> List the exact queries first ("get order by ID", "get
            a user's last 20 orders", "get messages in a channel, newest first"). Then design the storage so{" "}
            <strong>each query is a single, fast lookup</strong>. It's very fast at scale, but{" "}
            <strong>new kinds of queries may need new tables</strong> or copies of data.
          </p>
          <p>
            With DynamoDB, some teams go as far as "single-table design": many entity types in one table, with carefully
            chosen keys so related items are stored next to each other.
          </p>
          <h3 id="myths-to-drop">Myths to drop</h3>
          <ul>
            <li>
              <strong>"NoSQL scales, SQL doesn't."</strong> Relational databases handle very large workloads on one
              powerful machine plus read replicas, and can be sharded (post 25). Many huge companies run on MySQL or
              PostgreSQL.
            </li>
            <li>
              <strong>"NoSQL is schemaless, so it's faster to build with."</strong> It's faster at the start. Later,
              messy, inconsistent data can slow you down.
            </li>
            <li>
              <strong>"SQL can't do JSON."</strong> PostgreSQL's <code>JSONB</code> type stores and indexes JSON
              documents very well, so you can mix relational and document styles in one database.
            </li>
            <li>
              <strong>"You must choose one."</strong> Many systems use <strong>several databases</strong>, each for what
              it does best. This is called <strong>polyglot persistence</strong>.
            </li>
          </ul>
          <h3 id="newsql-distributed-sql">NewSQL / distributed SQL</h3>
          <p>
            A newer group of databases aims for <strong>SQL + transactions + horizontal scale</strong>: they split data
            across machines automatically but still look like one SQL database.
          </p>
          <p>
            <strong>Examples:</strong> Google Spanner, CockroachDB, YugabyteDB, TiDB.
          </p>
          <p>
            The trade-offs: more complex operations, higher latency for some writes (machines must coordinate), and
            sometimes higher cost.
          </p>
          <h3 id="a-quick-comparison">A quick comparison</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Relational</th>
                  <th>Key-value</th>
                  <th>Document</th>
                  <th>Wide-column</th>
                  <th>Graph</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Data shape</td>
                  <td>Tables, fixed columns</td>
                  <td>Key → blob</td>
                  <td>Nested JSON docs</td>
                  <td>Rows by partition key</td>
                  <td>Nodes + edges</td>
                </tr>
                <tr>
                  <td>Flexible queries</td>
                  <td>✅ Excellent</td>
                  <td>❌ Key only</td>
                  <td>🟡 Good within a doc</td>
                  <td>❌ Must match the design</td>
                  <td>✅ For relationships</td>
                </tr>
                <tr>
                  <td>Joins</td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>🟡 Limited</td>
                  <td>❌</td>
                  <td>✅ (traversals)</td>
                </tr>
                <tr>
                  <td>Transactions</td>
                  <td>✅ Strong</td>
                  <td>🟡 Limited</td>
                  <td>🟡 Improving</td>
                  <td>🟡 Limited</td>
                  <td>🟡 Varies</td>
                </tr>
                <tr>
                  <td>Horizontal write scale</td>
                  <td>🟡 Harder</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅ Excellent</td>
                  <td>🟡 Harder</td>
                </tr>
                <tr>
                  <td>Typical use</td>
                  <td>Most business apps</td>
                  <td>Cache, sessions</td>
                  <td>Catalogues, CMS</td>
                  <td>Messages, IoT, events</td>
                  <td>Social, fraud, recs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Relational</strong> gives you correctness, flexibility and maturity, but scaling writes across
              machines takes real work.
            </li>
            <li>
              <strong>Document</strong> gives you speed for "read the whole thing" access and a flexible schema, but
              relationships and consistency are your problem.
            </li>
            <li>
              <strong>Wide-column</strong> gives you massive write scale, but you must know your queries upfront and
              accept limited transactions.
            </li>
            <li>
              <strong>Key-value</strong> is the simplest and fastest, but only works by key.
            </li>
            <li>
              <strong>Graph</strong> makes deep relationship queries easy, but is a niche tool with a smaller ecosystem.
            </li>
            <li>
              <strong>Many databases</strong> means the best tool for each job, but more systems to learn, run, back up
              and keep in sync.
            </li>
          </ul>
          <p>
            <strong>A sensible default</strong> for most new products: <strong>start with a relational database</strong>{" "}
            (PostgreSQL or MySQL). Add Redis for caching, and add a specialised database only when a clear need appears,
            such as huge write volumes, graph queries or full-text search.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Discord's messages.</strong> Discord started by storing messages in MongoDB. As it grew to billions
            of messages, it moved to <strong>Cassandra</strong> (around 2017), because its data (messages per channel,
            ordered by time) fits the wide-column model perfectly. Years later, with <strong>trillions</strong> of
            messages, it moved again to <strong>ScyllaDB</strong>, a Cassandra-compatible database, for better
            performance and easier operations. The data model stayed the same; the engine changed.
          </p>
          <p>
            <strong>Amazon's shopping cart and Dynamo.</strong> Amazon's 2007 Dynamo paper described a key-value store
            built so the shopping cart would <strong>always accept writes</strong>, even during failures, because a cart
            that refuses "add to cart" loses money. Those ideas inspired Cassandra, Riak and, later, Amazon DynamoDB.
          </p>
          <p>
            <strong>Instagram, Shopify and GitHub on relational databases.</strong> All three reached massive scale on
            PostgreSQL or MySQL, adding caching, replicas and sharding along the way. They show that "SQL doesn't scale"
            isn't true.
          </p>
          <p>
            <strong>LinkedIn and graphs.</strong> Features like "people you may know" and "2nd-degree connections" are
            natural graph problems. LinkedIn built its own graph systems to answer these kinds of questions quickly.
          </p>
          <p>
            <strong>Polyglot persistence at a typical e-commerce company:</strong>
          </p>
          <ul>
            <li>PostgreSQL for orders and payments,</li>
            <li>Redis for carts and sessions,</li>
            <li>Elasticsearch for product search,</li>
            <li>a columnar warehouse for analytics,</li>
            <li>object storage for images.</li>
          </ul>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>When would you choose a NoSQL database over a relational one?</>,
                a: (
                  <>
                    <p>
                      When the data and access patterns fit a NoSQL model better: very high write volume on a known
                      access pattern (wide-column), simple lookups by key at huge scale (key-value), self-contained
                      records with varied fields (document), or deep relationship traversal (graph) — and you don't need
                      joins or multi-record transactions across that data.
                    </p>
                  </>
                ),
              },
              {
                q: <>What does “schemaless” really mean?</>,
                a: (
                  <>
                    <p>
                      The database doesn't enforce a schema when you write. The schema still exists — in application
                      code, which must handle every shape of data ever written. It's schema-on-read instead of
                      schema-on-write.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you model data for Cassandra or DynamoDB?</>,
                a: (
                  <>
                    <p>
                      Start from the queries, not the entities. Choose a partition key that spreads load and keeps what
                      one query needs together, and a clustering or sort key for ordering within it. Build one table or
                      index per access pattern and accept duplicated data.
                    </p>
                  </>
                ),
              },
              {
                q: <>Is it true that SQL doesn't scale?</>,
                a: (
                  <>
                    <p>
                      No. One powerful relational server with read replicas handles very large workloads, and relational
                      databases can be sharded — Instagram, Shopify and GitHub run on PostgreSQL or MySQL. What's harder
                      is scaling writes across machines automatically.
                    </p>
                  </>
                ),
              },
              {
                q: <>Can PostgreSQL replace a document database?</>,
                a: (
                  <>
                    <p>
                      Often. JSONB columns with GIN indexes store and query flexible documents, while keeping SQL,
                      joins, constraints and transactions for the rest. A dedicated document store makes more sense at
                      very large scale or when built-in sharding is the main need.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is distributed SQL, and what does it cost?</>,
                a: (
                  <>
                    <p>
                      Databases like Spanner, CockroachDB, YugabyteDB and TiDB that shard and replicate automatically
                      while keeping SQL and ACID transactions, using consensus. The cost is higher write latency
                      (commits need a quorum, worse across regions) and more operational complexity.
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
              The real question isn't "SQL or NoSQL?". It's <strong>what shape your data is</strong> and{" "}
              <strong>how you'll read and write it</strong>.
            </li>
            <li>
              <strong>Relational</strong> is best for structured data, joins, transactions and flexible queries. It's a
              strong default.
            </li>
            <li>
              The NoSQL families each have their strengths:
              <ul>
                <li>
                  <strong>key-value</strong> for simple fast lookups,
                </li>
                <li>
                  <strong>document</strong> for self-contained records,
                </li>
                <li>
                  <strong>wide-column</strong> for huge write-heavy, time-ordered data,
                </li>
                <li>
                  <strong>graph</strong> for relationships.
                </li>
              </ul>
            </li>
            <li>
              NoSQL usually means <strong>designing around your access patterns</strong> and{" "}
              <strong>enforcing the schema in code</strong>.
            </li>
            <li>
              Mixing databases (<strong>polyglot persistence</strong>) is normal. <strong>Distributed SQL</strong>{" "}
              offers SQL with horizontal scale, at a cost.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann (chapter 2, "Data Models and Query
              Languages")
            </li>
            <li>The Amazon Dynamo paper (SOSP 2007) and the Google Bigtable paper (OSDI 2006)</li>
            <li>The Cassandra paper, "Cassandra: A Decentralized Structured Storage System" (LADIS 2009)</li>
            <li>Discord's engineering blog posts on storing billions, and later trillions, of messages</li>
            <li>The System Design Primer on GitHub (sections "NoSQL" and "SQL or NoSQL")</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
