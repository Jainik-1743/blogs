import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { AsciiDiagram, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-5")!;

export const metadata: Metadata = {
  title: `Lesson 5 — ${lesson.title}`,
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

const code1 = `CREATE TABLE users (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE posts (
  id          BIGSERIAL PRIMARY KEY,
  author_id   BIGINT NOT NULL REFERENCES users(id),
  title       TEXT NOT NULL,
  body        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE comments (
  id          BIGSERIAL PRIMARY KEY,
  post_id     BIGINT NOT NULL REFERENCES posts(id),
  user_id     BIGINT NOT NULL REFERENCES users(id),
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);`;

const code2 = `-- Read with filter, sort, limit
SELECT id, title, created_at
FROM posts
WHERE author_id = 42
ORDER BY created_at DESC
LIMIT 10;

-- Insert
INSERT INTO users (email, name) VALUES ('asha@example.com', 'Asha');

-- Update
UPDATE posts SET title = 'New title' WHERE id = 7;

-- Delete
DELETE FROM comments WHERE id = 99;

-- Upsert: insert, or update if it already exists (PostgreSQL)
INSERT INTO users (email, name) VALUES ('asha@example.com', 'Asha K')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;`;

const code3 = `SELECT p.title, u.name AS author
FROM posts p
JOIN users u ON u.id = p.author_id
WHERE p.created_at > now() - interval '7 days';`;

const code4 = `SELECT p.id, p.title, u.name AS author, COUNT(c.id) AS comment_count
FROM posts p
JOIN users u     ON u.id = p.author_id
LEFT JOIN comments c ON c.post_id = p.id
WHERE p.created_at > now() - interval '7 days'
GROUP BY p.id, p.title, u.name
HAVING COUNT(c.id) > 0
ORDER BY comment_count DESC
LIMIT 10;`;

const code5 = `CREATE INDEX idx_posts_author ON posts (author_id);`;

const code6 = `CREATE INDEX idx_posts_author_created ON posts (author_id, created_at DESC);`;

const code7 = `EXPLAIN ANALYZE
SELECT * FROM posts WHERE author_id = 42 ORDER BY created_at DESC LIMIT 10;`;

const diagram1 = `Limit  (actual time=812.4 ms)
  -> Sort
    -> Seq Scan on posts  (rows=5,000,000)  Filter: (author_id = 42)`;

const diagram2 = `Limit  (actual time=0.09 ms)
  -> Index Scan using idx_posts_author_created on posts`;

const code8 = `const posts = await Post.findAll({ limit: 20 });   // 1 query
for (const post of posts) {
  post.author = await User.findByPk(post.authorId); // 20 more queries!
}`;

const code9 = `const posts = await Post.findAll({ limit: 20, include: [User] }); // 1 query with a JOIN`;

const code10 = `BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE id = 1 AND balance >= 500;
UPDATE accounts SET balance = balance + 500 WHERE id = 2;
COMMIT;   -- or ROLLBACK if anything failed`;

export default function SdLessonFivePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            A small online store launches with a simple database. For months everything is fast. Then the product list
            takes 8 seconds to load. The team adds more app servers, and it gets <strong>worse</strong>: the database
            starts refusing connections.
          </p>
          <p>
            The fix turned out to be one line: <strong>an index</strong>. The second problem was{" "}
            <strong>too many connections</strong>, not too many users.
          </p>
          <p>
            Most scaling stories begin here. Before you talk about sharding, replicas or NoSQL, you need to know how to
            use <strong>one relational database well</strong>. Instagram, Shopify and GitHub all grew very large on
            relational databases like PostgreSQL and MySQL.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            A relational database is like a set of <strong>very strict spreadsheets</strong> that can point to each
            other.
          </p>
          <ul>
            <li>
              Each <strong>table</strong> is a sheet: <code>users</code>, <code>orders</code>, <code>products</code>.
            </li>
            <li>
              Each <strong>row</strong> is one record: one user, one order.
            </li>
            <li>
              Each <strong>column</strong> has a fixed type: <code>email</code> is text, <code>price</code> is a number.
            </li>
            <li>
              <strong>Keys</strong> link the tables: an order row says "I belong to user 42".
            </li>
          </ul>
          <p>
            <strong>SQL</strong> is the language you use to ask questions ("show me all orders over ₹1,000 from last
            week") and make changes.
          </p>
          <p>
            An <strong>index</strong> is like the <strong>index at the back of a textbook</strong>. Without it, finding
            "photosynthesis" means reading every page. With it, you jump straight to page 214. It makes reads fast, but
            every time you add a page, the index must be updated too.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="tables-and-keys">Tables and keys</h3>
          <p>Let's model a simple blog:</p>
          <CodeBlock lang="sql" code={code1} />
          <ul>
            <li>
              <strong>
                Primary key (<code>id</code>).
              </strong>{" "}
              Uniquely identifies each row.
            </li>
            <li>
              <strong>
                Foreign key (<code>REFERENCES</code>).
              </strong>{" "}
              "This <code>author_id</code> must be a real user". The database refuses bad data.
            </li>
            <li>
              <strong>
                <code>UNIQUE</code>.
              </strong>{" "}
              No two users can share an email, even if two sign-up requests arrive at the same moment. The database is
              your last line of defence against race conditions (remember post 4).
            </li>
            <li>
              <strong>
                <code>NOT NULL</code>.
              </strong>{" "}
              This field is required.
            </li>
          </ul>
          <p>
            <strong>Auto-increment IDs vs UUIDs:</strong>
          </p>
          <ul>
            <li>
              <strong>Auto-increment IDs</strong> (1, 2, 3…) are small and fast to index. But they reveal how many
              records you have, and they are hard to generate across many servers.
            </li>
            <li>
              <strong>UUIDs</strong> (random 128-bit IDs) can be generated anywhere without coordination. But they are
              bigger, and random values scatter writes across the index.
            </li>
            <li>
              Newer time-ordered formats like <strong>UUIDv7</strong>, or Twitter-style <strong>Snowflake IDs</strong>,
              give you a middle ground. We'll return to this in the URL-shortener case study.
            </li>
          </ul>
          <h3 id="the-queries-you-ll-use-constantly">The queries you'll use constantly</h3>
          <CodeBlock lang="sql" code={code2} />
          <p>
            <strong>
              Always use a <code>WHERE</code> in <code>UPDATE</code> and <code>DELETE</code>.
            </strong>{" "}
            Forgetting it changes every row. It's one of the most famous production mistakes.
          </p>
          <h3 id="joins-combining-tables">Joins: combining tables</h3>
          <CodeBlock lang="sql" code={code3} />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Join</th>
                  <th>Returns</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>INNER JOIN</code>
                  </td>
                  <td>Only rows that match on both sides</td>
                </tr>
                <tr>
                  <td>
                    <code>LEFT JOIN</code>
                  </td>
                  <td>
                    Every row from the left table, with NULLs where there's no match (for example, posts with zero
                    comments)
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>RIGHT JOIN</code>
                  </td>
                  <td>The mirror of LEFT</td>
                </tr>
                <tr>
                  <td>
                    <code>FULL JOIN</code>
                  </td>
                  <td>Everything from both sides</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 id="aggregates-and-group-by">Aggregates and GROUP BY</h3>
          <p>"The 10 most-commented posts this week, with author names":</p>
          <CodeBlock lang="sql" code={code4} />
          <ul>
            <li>
              <strong>
                <code>WHERE</code>
              </strong>{" "}
              filters <strong>rows before</strong> grouping.
            </li>
            <li>
              <strong>
                <code>HAVING</code>
              </strong>{" "}
              filters <strong>groups after</strong> grouping.
            </li>
          </ul>
          <h3 id="indexes-the-most-important-performance-tool">Indexes: the most important performance tool</h3>
          <p>
            Without an index, <code>WHERE author_id = 42</code> makes the database read <strong>every row</strong> in{" "}
            <code>posts</code>. This is called a <strong>sequential scan</strong> (or full table scan). With 100 rows,
            you won't notice. With 50 million rows, it takes seconds.
          </p>
          <CodeBlock lang="sql" code={code5} />
          <p>
            Now the database keeps a sorted structure (usually a <strong>B-tree</strong>, which we'll explore in Part 4)
            that jumps straight to author 42's posts.
          </p>
          <p>
            <strong>Composite indexes and the "left-prefix" rule.</strong> Our earlier query filters by{" "}
            <code>author_id</code> and sorts by <code>created_at</code>. One index can serve both:
          </p>
          <CodeBlock lang="sql" code={code6} />
          <p>
            Think of a phone book sorted by <strong>last name, then first name</strong>:
          </p>
          <ul>
            <li>It helps you find "Sharma" and "Sharma, Rahul".</li>
            <li>
              It does <strong>not</strong> help you find everyone named "Rahul".
            </li>
          </ul>
          <p>
            In the same way, an index on <code>(author_id, created_at)</code> helps queries on <code>author_id</code>,
            or on <code>author_id</code> + <code>created_at</code>. It does not help queries on <code>created_at</code>{" "}
            alone.
          </p>
          <p>
            <strong>The cost of indexes:</strong>
          </p>
          <ul>
            <li>
              Every <code>INSERT</code>, <code>UPDATE</code> and <code>DELETE</code> must also update every index. More
              indexes mean slower writes.
            </li>
            <li>Indexes take disk space and memory.</li>
            <li>
              So index the columns you actually <strong>filter, join and sort by</strong> in frequent queries, not every
              column.
            </li>
          </ul>
          <h3 id="explain-ask-the-database-how-it-runs-your-query">EXPLAIN: ask the database how it runs your query</h3>
          <CodeBlock lang="sql" code={code7} />
          <p>Before the index:</p>
          <AsciiDiagram caption="EXPLAIN — before the index" text={diagram1} />
          <p>After the index:</p>
          <AsciiDiagram caption="EXPLAIN — after the index" text={diagram2} />
          <Stats
            caption="One CREATE INDEX statement, measured on 5 million rows."
            stats={[
              { value: <>812 ms</>, label: <>before</>, sub: <>sequential scan of every row</> },
              { value: <>0.09 ms</>, label: <>after</>, sub: <>index scan straight to author 42</> },
              { value: <>~9,000×</>, label: <>faster</>, sub: <>and it stays fast as the table grows</> },
            ]}
          />
          <p>
            Here the query went from <strong>812 ms to 0.09 ms</strong>, thousands of times faster.{" "}
            <strong>Seq Scan</strong> on a big table in a frequent query is the first thing to look for.
          </p>
          <h3 id="the-n-1-query-problem">The N+1 query problem</h3>
          <p>
            ORMs (Prisma, Sequelize, Django ORM, Hibernate, ActiveRecord) make it easy to write code like this by
            accident:
          </p>
          <CodeBlock lang="js" code={code8} />
          <p>
            That's <strong>1 + N queries</strong> (21 here). Each one is a network round trip. With 100 posts and a 2 ms
            round trip, that's 200+ ms wasted.
          </p>
          <p>
            <strong>Fix:</strong> fetch everything in one or two queries, with a join or eager loading:
          </p>
          <CodeBlock lang="js" code={code9} />
          <SequenceDiagram
            caption="The N+1 pattern. Every arrow is a network round trip to the database."
            actors={["App", "Database"]}
            messages={[
              { from: 0, to: 1, label: <>SELECT * FROM posts LIMIT 20</> },
              { from: 1, to: 0, label: <>20 posts</>, reply: true },
              { from: 0, to: 1, label: <>SELECT * FROM users WHERE id = 7</> },
              { from: 1, to: 0, label: <>author of post 1</>, reply: true },
              { from: 0, to: 1, label: <>SELECT * FROM users WHERE id = 12</> },
              { from: 1, to: 0, label: <>author of post 2</>, reply: true },
              {
                from: 0,
                to: 0,
                label: <>… 18 more round trips. The fix: one JOIN, or WHERE id IN (…) with eager loading</>,
                divider: true,
              },
            ]}
          />
          <p>
            N+1 is one of the most common reasons "the database is slow" when really the{" "}
            <strong>app is asking too many times</strong>.
          </p>
          <h3 id="transactions-all-or-nothing-a-first-look">Transactions: all or nothing (a first look)</h3>
          <p>Transferring money needs two updates. Both must succeed, or neither:</p>
          <CodeBlock lang="sql" code={code10} />
          <p>
            If the server crashes between the two updates, the database undoes the first one. This is the{" "}
            <strong>"A" (Atomicity) in ACID</strong>. Part 4 covers the full ACID story and isolation levels.
          </p>
          <h3 id="connections-the-hidden-limit">Connections: the hidden limit</h3>
          <p>
            Every app server talks to the database over <strong>connections</strong>. Each connection uses real memory
            on the database server. In PostgreSQL, each connection is a separate process using several MB. Databases
            have a <strong>maximum</strong> number of connections, often a few hundred.
          </p>
          <p>Here's the classic trap:</p>
          <Stats
            caption="Scaling the app tier multiplies database connections — even though the queries per user never changed."
            stats={[
              { value: <>20</>, label: <>1 app server × pool of 20</>, sub: <>fine</> },
              { value: <>200</>, label: <>10 app servers × 20</>, sub: <>getting close to the limit</> },
              { value: <>1,000</>, label: <>50 app servers × 20</>, sub: <>“FATAL: too many connections”</> },
            ]}
          />
          <Flow
            caption="A connection pooler lets thousands of app connections share a few dozen real ones."
            nodes={[
              {
                title: <>Hundreds of app servers or serverless functions</>,
                desc: <>each thinks it has its own connection</>,
              },
              {
                title: <>PgBouncer / RDS Proxy</>,
                desc: <>hands a real connection out for one transaction at a time</>,
              },
              {
                title: <>PostgreSQL</>,
                desc: <>sees ~50 connections, spends its memory on queries instead of processes</>,
                tone: "good",
              },
            ]}
          />
          <p>
            Scaling out the app tier can <strong>take down the database</strong>, even though the number of queries per
            user didn't change. Serverless functions make this worse, because every function instance may open its own
            connection.
          </p>
          <p>
            <strong>Fixes:</strong>
          </p>
          <ul>
            <li>
              <strong>Connection pooling in the app</strong>, with sensibly small pools (HikariCP for Java, built-in
              pools in most ORMs).
            </li>
            <li>
              <strong>A pooler in front of the database</strong> (for example, <strong>PgBouncer</strong> for
              PostgreSQL). Thousands of app connections share a few dozen real database connections.
            </li>
            <li>
              <strong>Remember that a bigger pool isn't always faster.</strong> The database only has so many CPU cores.
              Beyond a point, more concurrent queries just wait on each other.
            </li>
          </ul>
          <h3 id="oltp-vs-olap">OLTP vs OLAP</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>OLTP (transactions)</th>
                  <th>OLAP (analytics)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Typical query</td>
                  <td>"Get order #5521", "add item to cart"</td>
                  <td>"Total revenue by city for last year"</td>
                </tr>
                <tr>
                  <td>Rows touched</td>
                  <td>A few</td>
                  <td>Millions</td>
                </tr>
                <tr>
                  <td>Speed needed</td>
                  <td>Milliseconds</td>
                  <td>Seconds to minutes is OK</td>
                </tr>
                <tr>
                  <td>Example databases</td>
                  <td>PostgreSQL, MySQL</td>
                  <td>BigQuery, Snowflake, ClickHouse, Redshift</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Running heavy analytics on your main (OLTP) database can slow down every user's checkout. That's why
            companies copy data into a separate <strong>analytics warehouse</strong>, or at least run reports on a{" "}
            <strong>read replica</strong>.
          </p>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Indexes:</strong> much faster reads, but slower writes and more storage. Add them for real query
              patterns, and check <code>EXPLAIN</code>.
            </li>
            <li>
              <strong>Constraints</strong> (foreign keys, <code>UNIQUE</code>): protect data quality and prevent
              race-condition duplicates, but add a small write cost and make some large-scale designs (like sharding)
              harder later.
            </li>
            <li>
              <strong>ORMs:</strong> faster development, but they can hide N+1 queries and slow SQL. Learn to look at
              the SQL they generate.
            </li>
            <li>
              <strong>Auto-increment vs UUID IDs:</strong> fast and compact vs globally unique without coordination.
            </li>
            <li>
              <strong>One database for everything:</strong> simple at first. Separating OLTP and analytics protects
              user-facing performance as you grow.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Instagram</strong> famously ran on PostgreSQL in its early years, serving millions of users with a
            very small team. It relied on careful indexing, and later on splitting data across many Postgres servers.
          </p>
          <p>
            <strong>GitHub and Shopify</strong> run huge MySQL fleets. Both have written about how much performance they
            got from query tuning, indexes and connection management before needing more complex solutions.
          </p>
          <p>
            <strong>Serverless apps and connection limits.</strong> Teams moving to AWS Lambda or similar platforms
            often hit "too many connections" errors on PostgreSQL, because every function instance opens its own
            connection. Poolers like PgBouncer, and managed options such as Amazon RDS Proxy, exist largely to solve
            this.
          </p>
          <p>
            <strong>
              The missing <code>WHERE</code> clause.
            </strong>{" "}
            Many teams have a story about an <code>UPDATE</code> or <code>DELETE</code> run without a <code>WHERE</code>{" "}
            in production. It's one reason why backups and point-in-time recovery (covered in Part 7) matter, and why
            many teams require reviewed migrations instead of manual queries.
          </p>
          <p>
            <strong>E-commerce reporting.</strong> A common growing pain: a "sales dashboard" query that scans the whole{" "}
            <code>orders</code> table every few minutes slows down checkout for everyone. Moving that report to a read
            replica or an analytics database fixes it without touching the checkout code.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>How would you find out why a query is slow?</>,
                a: (
                  <>
                    <p>
                      Run EXPLAIN ANALYZE on it. Look for sequential scans on big tables, sorts that spill to disk, and
                      row estimates that are far from the actual counts. Then add or fix an index that matches the
                      WHERE, JOIN and ORDER BY columns, and check the plan again.
                    </p>
                  </>
                ),
              },
              {
                q: <>Explain the left-prefix rule for composite indexes.</>,
                a: (
                  <>
                    <p>
                      An index on (a, b) is sorted by a, then b — like a phone book sorted by last name, then first
                      name. It serves queries on a, or on a and b, but not queries on b alone, because rows with the
                      same b are scattered all over the index.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is the N+1 query problem, and how do you fix it?</>,
                a: (
                  <>
                    <p>
                      Loading a list with one query, then running one more query per item to load related data: 1 + N
                      round trips. Fix it with a JOIN, or with eager loading that fetches all related rows in one WHERE
                      id IN (…) query.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why can adding app servers bring down the database?</>,
                a: (
                  <>
                    <p>
                      Every server keeps its own pool of connections, and each database connection costs real memory (a
                      whole process in PostgreSQL). Fifty servers with a pool of 20 each is 1,000 connections, above
                      most limits. Use small pools and a pooler like PgBouncer in front of the database.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's the difference between OLTP and OLAP, and why keep them apart?</>,
                a: (
                  <>
                    <p>
                      OLTP is many small, fast transactions touching a few rows (checkout, login). OLAP is big
                      analytical queries scanning millions of rows (revenue by city). Running OLAP on the OLTP database
                      steals CPU and I/O from users, so analytics go to a read replica or a warehouse.
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
              Relational databases store data in <strong>tables</strong> linked by <strong>keys</strong>. Constraints
              like <code>UNIQUE</code> and foreign keys keep data correct, even under concurrency.
            </li>
            <li>
              <strong>Indexes</strong> turn full scans into quick lookups. Design them for your real queries, remember
              the <strong>left-prefix rule</strong>, and check with{" "}
              <strong>
                <code>EXPLAIN ANALYZE</code>
              </strong>
              .
            </li>
            <li>
              Watch for <strong>N+1 queries</strong> from ORMs. Fetch related data with joins or eager loading.
            </li>
            <li>
              <strong>Transactions</strong> make multi-step changes all-or-nothing.
            </li>
            <li>
              <strong>Database connections are limited and expensive.</strong> Scaling app servers can overload the
              database, so use small pools and a pooler like PgBouncer.
            </li>
            <li>
              Keep <strong>heavy analytics (OLAP)</strong> away from your <strong>user-facing database (OLTP)</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Use The Index, Luke!</em> by Markus Winand (free online; the best practical guide to SQL indexing)
            </li>
            <li>The official PostgreSQL tutorial, and its documentation pages "Using EXPLAIN" and "Indexes"</li>
            <li>SQLBolt (free interactive SQL lessons)</li>
            <li>CMU 15-445 Database Systems (free lectures on YouTube)</li>
            <li>The HikariCP wiki article "About Pool Sizing"</li>
          </ul>
          <p>
            <em>This wraps up Part 1. Next up, Part 2: What is system design? Start with requirements.</em>
          </p>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
