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
          <p>
            You are starting a new project and someone asks, "SQL or NoSQL?" SQL databases store data in tables and
            are queried with the SQL language. "NoSQL" is a loose name for all other kinds of databases (key-value,
            document, wide-column and graph). Here is what people say:
          </p>
          <ul>
            <li>One teammate says "NoSQL scales better, let's use MongoDB."</li>
            <li>Another says "Just use Postgres for everything."</li>
            <li>A blog post says Cassandra is what Netflix uses, so it must be good.</li>
          </ul>
          <p>
            This choice matters, because{" "}
            <strong>changing your database later is one of the hardest migrations in software</strong>. A migration
            means moving all data and code to something new. But "SQL vs NoSQL" is really the wrong question. The right
            question is:{" "}
            <strong>what shape is my data, and how will I read and write it?</strong>
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>Think about different ways to keep papers and information at home:</p>
          <ul>
            <li>
              <strong>A filing cabinet with labelled forms (relational/SQL).</strong> Every form has the same fields. A
              customer form points to an order form by its number. It is very organised. It is easy to cross-check
              ("show me every order for this customer").
            </li>
            <li>
              <strong>A folder per topic, containing whatever notes you need (document).</strong> Everything about one
              trip (tickets, hotel, plans) is in one folder. It is flexible. One folder can look different from another.
            </li>
            <li>
              <strong>Numbered lockers (key-value).</strong> Locker 4521 holds <em>something</em>. You cannot search by
              what is inside. You just open the locker by its number. It is extremely fast.
            </li>
            <li>
              <strong>A huge spreadsheet, split into parts that sit in many rooms (wide-column).</strong> Built
              for a massive amount of data that is written very quickly.
            </li>
            <li>
              <strong>A wall of photos connected by strings (graph).</strong> Perfect for "who knows whom" and "friends of friends".
            </li>
          </ul>
          <p>
            Each is great for some jobs and awkward for others. NoSQL is not "better SQL". It is{" "}
            <strong>a different set of trade-offs</strong> (you gain something and you give up something).
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="relational-databases-sql">Relational databases (SQL)</h3>
          <p>
            A relational database keeps data in <strong>tables</strong> (rows and columns). The table has a fixed{" "}
            <strong>schema</strong>. A schema is the plan of the data: the column names and the type of each column.
            Tables are linked by <strong>keys</strong>. A key is a column value that identifies a row or points to a
            row in another table (see Lesson 5). Here, <code>orders.user_id</code> points to <code>users.id</code>.
          </p>
          <AsciiDiagram text={diagram1} />
          <p>
            <strong>Strengths:</strong>
          </p>
          <ul>
            <li>
              <strong>Joins:</strong> a join combines rows from two tables in one query. You can ask questions you did
              not plan for.
            </li>
            <li>
              <strong>Transactions (ACID):</strong> a transaction is a group of changes that either all succeed or all
              fail. ACID is the set of safety promises for transactions (see Lesson 21).
            </li>
            <li>
              <strong>Constraints:</strong> rules that the database enforces for you. Examples: emails must be unique, and a
              foreign key (a column that points to a row in another table) must point to a row that exists.
            </li>
            <li>
              <strong>SQL:</strong> a powerful, standard language for asking questions of the data. Most developers know it.
            </li>
            <li>
              <strong>Mature tools:</strong> backups, monitoring, ORMs (libraries that let you use tables as objects in
              your code) and decades of experience.
            </li>
          </ul>
          <p>
            <strong>Weaknesses:</strong>
          </p>
          <ul>
            <li>Schema changes on huge tables need care.</li>
            <li>Scaling writes beyond one machine is hard. You must split the data across machines (sharding, Lesson 25).</li>
            <li>Joins across many machines are slow and costly.</li>
          </ul>
          <p>
            <strong>Examples:</strong> PostgreSQL, MySQL, SQL Server, Oracle, SQLite.
          </p>
          <h3 id="key-value-stores">Key-value stores</h3>
          <p>
            This is the simplest model. A <strong>key</strong> maps to a <strong>value</strong>, like a word in a
            dictionary. The database does not look inside the value.
          </p>
          <CodeBlock lang="http" code={code1} />
          <ul>
            <li>✅ Extremely fast and easy to scale (you just spread the keys across machines).</li>
            <li>
              ❌ You can only look things up by key. "Find all carts that contain product 991" is not possible without
              extra work.
            </li>
          </ul>
          <p>
            <strong>Examples:</strong> Redis, Amazon DynamoDB (key-value plus some document features), Memcached, etcd.{" "}
            <strong>Good for:</strong> sessions (login state), caches, shopping carts, feature flags (on/off switches
            for features), counters.
          </p>
          <h3 id="document-databases">Document databases</h3>
          <p>
            Each record is a <strong>document</strong>. A document is usually JSON-like and can contain nested data
            (objects inside objects). A collection is a group of documents, like a table. Documents in the same
            collection do not need the same fields.
          </p>
          <CodeBlock lang="json" code={code2} />
          <ul>
            <li>
              ✅ <strong>Data that is read together is stored together.</strong> One read fetches the whole order, with
              no joins.
            </li>
            <li>✅ A flexible schema is easy to change over time, and it fits JSON APIs well.</li>
            <li>❌ Weaker at joins and at relationships between documents.</li>
            <li>❌ Copied data (like the user's name inside every order) must be kept in sync. If the name changes, you must update every copy.</li>
            <li>
              ❌ "Schemaless" really means the <strong>schema lives in your code</strong>. Inconsistent data can slowly get into the database.
            </li>
          </ul>
          <p>
            <strong>Examples:</strong> MongoDB, Couchbase, Firestore, Amazon DocumentDB.{" "}
            <strong>Good for:</strong> product catalogues (different products have different attributes), content
            management (CMS), user profiles, event data.
          </p>
          <h3 id="wide-column-databases">Wide-column databases</h3>
          <p>
            These look like tables, but they are built to be <strong>spread across many machines</strong> and to handle{" "}
            <strong>a huge number of writes</strong>. Two keys organise the data. The <strong>partition key</strong>{" "}
            decides which machine holds a row. The <strong>clustering key</strong> decides the order of rows inside that
            partition. All rows with the same partition key stay together.
          </p>
          <AsciiDiagram text={diagram2} />
          <ul>
            <li>✅ Massive scale and very fast writes. In Cassandra's design there is no single master (no one main node that all writes must go through).</li>
            <li>✅ Great for data in time order for each key: messages per channel, readings per sensor, events per user.</li>
            <li>
              ❌ <strong>You must design tables around your queries.</strong> Queries that do not use the partition key
              are slow or not allowed.
            </li>
            <li>❌ No joins, and limited transactions.</li>
          </ul>
          <p>
            <strong>Examples:</strong> Apache Cassandra, ScyllaDB, HBase, Google Bigtable.{" "}
            <strong>Good for:</strong> chat messages, IoT (internet-connected device) sensor data, activity feeds, logs
            at huge scale.
          </p>
          <h3 id="graph-databases">Graph databases</h3>
          <p>
            A graph database stores data as <strong>nodes</strong> (things, such as people) and <strong>edges</strong>{" "}
            (the links between them, such as "follows"). Following links is fast, even many steps deep.
          </p>
          <AsciiDiagram caption="A tiny social graph" text={diagram3} />
          <p>
            Take this question: "people Asha might know: friends of her friends whom she does not follow yet". It is
            simple in a graph database. In SQL it needs many self-joins (joining a table to itself again and again),
            which is painful.
          </p>
          <p>
            <strong>Examples:</strong> Neo4j, Amazon Neptune.{" "}
            <strong>Good for:</strong> social networks, recommendation engines, fraud detection (finding groups of
            linked accounts), knowledge graphs.
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
              {
                title: <>Graph</>,
                items: [
                  { sign: "+", text: <>Deep relationship queries are easy and fast</> },
                  { sign: "-", text: <>Niche tool; smaller ecosystem</> },
                ],
                verdict: <>Social, fraud, recommendations (Neo4j)</>,
              },
            ]}
          />
          <h3 id="other-specialised-databases">Other specialised databases</h3>
          <ul>
            <li>
              <strong>Time-series</strong> (TimescaleDB, InfluxDB, Prometheus): built for values that change over time,
              such as metrics and sensor data. They compress data well and answer time-based queries fast.
            </li>
            <li>
              <strong>Search engines</strong> (Elasticsearch, OpenSearch): full-text search (Lesson 19).
            </li>
            <li>
              <strong>Analytics / columnar</strong> (ClickHouse, BigQuery, Snowflake): they store data by column. This
              makes huge aggregations (sums, averages, counts) over billions of rows fast.
            </li>
            <li>
              <strong>Vector databases</strong>: find items that are similar in meaning by comparing embeddings (lists of
              numbers made by a machine-learning model). See Lesson 19.
            </li>
          </ul>
          <h3 id="schema-on-write-vs-schema-on-read">Schema-on-write vs schema-on-read</h3>
          <ul>
            <li>
              <strong>Schema-on-write (SQL):</strong> the database checks the data <strong>when you write it</strong>.
              Wrong types or missing fields are rejected.
            </li>
            <li>
              <strong>Schema-on-read (most NoSQL):</strong> anything can be written. Your code checks and understands
              the data <strong>when it reads it</strong>. It must handle old and unusual formats.
            </li>
          </ul>
          <p>
            Neither one means "no schema". The real question is <strong>who enforces the schema</strong>: the database or
            your application.
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
            relationships. Keep the data normalised (each fact stored once; see Lesson 23). Then write whatever
            queries you need. It is flexible for <strong>questions nobody has asked yet</strong>.
          </p>
          <p>
            <strong>Access-pattern-first (typical NoSQL).</strong> First, list the exact queries ("get order by ID", "get
            a user's last 20 orders", "get messages in a channel, newest first"). An access pattern is one such way of
            reading data. Then design the storage so <strong>each query is a single, fast lookup</strong>. It is very
            fast at scale. But <strong>new kinds of queries may need new tables</strong> or extra copies of data.
          </p>
          <p>
            With DynamoDB, some teams go as far as "single-table design". They keep many kinds of items (users, orders and
            so on) in one table. They choose the keys with care, so related items are stored next to each other.
          </p>
          <h3 id="myths-to-drop">Myths to drop</h3>
          <ul>
            <li>
              <strong>"NoSQL scales, SQL doesn't."</strong> Relational databases handle very large workloads on one
              powerful machine plus read replicas (extra copies that serve reads). They can also be sharded (Lesson 25).
              Many huge companies run on MySQL or PostgreSQL.
            </li>
            <li>
              <strong>"NoSQL is schemaless, so it is faster to build with."</strong> It is faster at the start. Later,
              inconsistent data can slow you down.
            </li>
            <li>
              <strong>"SQL can't do JSON."</strong> PostgreSQL's <code>JSONB</code> type stores JSON in a binary form that can be indexed. It works
              very well for JSON documents. So you can mix relational and document styles in one database.
            </li>
            <li>
              <strong>"You must choose one."</strong> Many systems use <strong>several databases</strong>, each for the job it does best. This is called{" "}
              <strong>polyglot persistence</strong> (polyglot means "many languages").
            </li>
          </ul>
          <h3 id="newsql-distributed-sql">NewSQL / distributed SQL</h3>
          <p>
            A newer group of databases wants <strong>SQL + transactions + horizontal scale</strong> (adding more machines).
            They split the data across machines for you. Still, they look like one SQL database to your code.
          </p>
          <p>
            <strong>Examples:</strong> Google Spanner, CockroachDB, YugabyteDB, TiDB.
          </p>
          <p>
            The trade-offs: they are harder to run. Some writes are slower (latency is higher), because machines must agree
            with each other first. They can also cost more.
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
              <strong>Relational</strong> gives you correct data, flexible queries and mature tools. But scaling writes
              across machines takes real work.
            </li>
            <li>
              <strong>Document</strong> gives you speed when you "read the whole thing" and a flexible schema. But
              relationships and consistent data become your job.
            </li>
            <li>
              <strong>Wide-column</strong> gives you massive write scale. But you must know your queries in advance and
              accept limited transactions.
            </li>
            <li>
              <strong>Key-value</strong> is the simplest and fastest. But it only works by key.
            </li>
            <li>
              <strong>Graph</strong> makes deep relationship queries easy. But it is a niche tool with a smaller ecosystem.
            </li>
            <li>
              <strong>Many databases</strong> means the best tool for each job. But you have more systems to learn, run,
              back up and keep in sync.
            </li>
          </ul>
          <p>
            <strong>A sensible default</strong> for most new products: <strong>start with a relational database</strong>{" "}
            (PostgreSQL or MySQL). Add Redis for caching. Add a specialised database only when a clear need appears,
            such as huge write volumes, graph queries or full-text search.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Discord's messages.</strong> Discord started by storing messages in MongoDB. As it grew to billions
            of messages, it moved to <strong>Cassandra</strong> (Discord described this in a 2017 blog post). Its
            data (messages per channel, ordered by time) fits the wide-column model very well. Years later, it had{" "}
            <strong>trillions</strong> of messages. It moved again to <strong>ScyllaDB</strong>, a
            Cassandra-compatible database, for better performance and easier operation (described in 2023). The data
            model stayed the same. Only the engine changed.
          </p>
          <p>
            <strong>Amazon's shopping cart and Dynamo.</strong> Amazon's 2007 Dynamo paper described a key-value store
            built so that the shopping cart would <strong>always accept writes</strong>, even during failures. A cart
            that refuses "add to cart" loses money. Those ideas inspired Cassandra and Riak. They also shaped Amazon
            DynamoDB, which is a separate, later service.
          </p>
          <p>
            <strong>Instagram, Shopify and GitHub on relational databases.</strong> All three reached massive scale on
            PostgreSQL or MySQL, adding caching, replicas and sharding along the way. They show that "SQL does not scale"
            is not true.
          </p>
          <p>
            <strong>LinkedIn and graphs.</strong> Features like "people you may know" and "2nd-degree connections" are
            natural graph problems. LinkedIn built its own graph systems to answer such questions quickly.
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
                      Choose it when the data and the access patterns fit a NoSQL model better. Examples: a very high
                      write volume with a known access pattern (wide-column); simple lookups by key at huge scale
                      (key-value); self-contained records with different fields (document); or following relationships
                      many steps deep (graph). You should also not need joins or multi-record transactions across
                      that data.
                    </p>
                  </>
                ),
              },
              {
                q: <>What does “schemaless” really mean?</>,
                a: (
                  <>
                    <p>
                      The database does not enforce a schema when you write. The schema still exists, but it lives in the
                      application code. That code must handle every shape of data that was ever written. It is
                      schema-on-read instead of schema-on-write.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you model data for Cassandra or DynamoDB?</>,
                a: (
                  <>
                    <p>
                      Start from the queries, not from the entities. Choose a partition key that spreads the load evenly
                      and keeps together what one query needs. Add a clustering key (called a sort key in DynamoDB) to
                      set the order inside the partition. Build one table or index for each access pattern. Accept
                      that some data will be duplicated.
                    </p>
                  </>
                ),
              },
              {
                q: <>Is it true that SQL doesn't scale?</>,
                a: (
                  <>
                    <p>
                      No. One powerful relational server with read replicas handles very large workloads. Relational
                      databases can also be sharded. Instagram, Shopify and GitHub run on PostgreSQL or MySQL. The
                      harder part is scaling writes across many machines automatically.
                    </p>
                  </>
                ),
              },
              {
                q: <>Can PostgreSQL replace a document database?</>,
                a: (
                  <>
                    <p>
                      Often, yes. JSONB columns with GIN indexes (an index type that is good for searching inside JSON)
                      can store and query flexible documents. You keep SQL, joins, constraints and transactions for
                      the rest of your data. A dedicated document database makes more sense at very large scale, or
                      when built-in sharding is the main need.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is distributed SQL, and what does it cost?</>,
                a: (
                  <>
                    <p>
                      These are databases like Spanner, CockroachDB, YugabyteDB and TiDB. They shard and replicate data
                      automatically and still give you SQL and ACID transactions. They use consensus (a way for
                      machines to agree on one answer). The cost is higher write latency, because a commit needs a
                      quorum (a majority of the machines to agree), and this is slower across regions. They are also
                      harder to operate.
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
              The real question is not "SQL or NoSQL?". It is <strong>what shape your data is</strong> and{" "}
              <strong>how you will read and write it</strong>.
            </li>
            <li>
              <strong>Relational</strong> is best for structured data, joins, transactions and flexible queries. It is a
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
              gives you SQL with horizontal scale, but at a cost.
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
