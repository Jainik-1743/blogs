import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { AsciiDiagram, Compare, Flow, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-23")!;

export const metadata: Metadata = {
  title: `Lesson 23 — ${lesson.title}`,
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

const diagram1 = `orders
┌────┬───────────┬───────────────┬───────────┬──────────────┬───────┐
│ id │ customer  │ cust_email    │ cust_city │ product      │ price │
├────┼───────────┼───────────────┼───────────┼──────────────┼───────┤
│ 1  │ Asha      │ asha@ex.com   │ Pune      │ Shoes        │ 1299  │
│ 2  │ Asha      │ asha@ex.com   │ Pune      │ Socks        │ 199   │
│ 3  │ Ravi      │ ravi@ex.com   │ Delhi     │ Shoes        │ 1299  │
└────┴───────────┴───────────────┴───────────┴──────────────┴───────┘`;

const diagram2 = `customers                  products                orders
┌────┬──────┬─────────┐    ┌────┬───────┬───────┐   ┌────┬─────────┬────────────┐
│ id │ name │ city    │    │ id │ name  │ price │   │ id │ cust_id │ product_id │
├────┼──────┼─────────┤    ├────┼───────┼───────┤   ├────┼─────────┼────────────┤
│ 1  │ Asha │ Pune    │    │ 10 │ Shoes │ 1299  │   │ 1  │ 1       │ 10         │
│ 2  │ Ravi │ Delhi   │    │ 11 │ Socks │ 199   │   │ 2  │ 1       │ 11         │
└────┴──────┴─────────┘    └────┴───────┴───────┘   │ 3  │ 2       │ 10         │
                                                    └────┴─────────┴────────────┘`;

const code1 = `-- copy a rarely-changing field to skip a join on the feed
ALTER TABLE posts ADD COLUMN author_name TEXT;`;

const code2 = `-- precomputed counters instead of COUNT(*) on every page view
ALTER TABLE posts ADD COLUMN comment_count INT NOT NULL DEFAULT 0,
                  ADD COLUMN like_count    INT NOT NULL DEFAULT 0;`;

const code3 = `{ "orderId": 7, "customer": {"id": 1, "name": "Asha"}, "items": [...] }`;

const code4 = `CREATE MATERIALIZED VIEW daily_sales AS
SELECT date(created_at) AS day, SUM(total) AS revenue
FROM orders GROUP BY 1;

REFRESH MATERIALIZED VIEW daily_sales;  -- e.g., every few minutes`;

export default function SdLessonTwoThreePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Your posts table stores the author's name in every row, so you do not need a join. A join is a query step
            that combines rows from two tables. Reads are fast. Then an author changes their name from "Asha K" to
            "Asha Kulkarni". Now 3,000 old posts show the old name, and 12 new ones show the new name.
          </p>
          <p>
            Now think about the opposite problem. Your perfectly organised database needs <strong>seven joins</strong> to
            show one product page. At 10,000 views per second, this is too slow.
          </p>
          <p>
            <strong>Normalisation</strong> means organising data so that each fact is stored only once (no duplicates).{" "}
            <strong>Denormalisation</strong> means copying data on purpose. They are two ends of one trade-off. One end
            gives <strong>correct data and simple writes</strong>. The other end gives <strong>fast reads</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about your <strong>phone contacts</strong>.
          </p>
          <p>
            <strong>Normalised:</strong> your friend's phone number is stored <strong>once</strong>, in their contact.
            Every WhatsApp group, calendar invite and note just <strong>points to</strong> that contact. When your friend
            changes their number, you update it in one place and everything is correct.
          </p>
          <p>
            <strong>Denormalised:</strong> you wrote your friend's number in 20 different notes and on sticky notes
            around the house. You can find it quickly without opening your contacts. Reading is fast. But when the
            number changes, you must find and update all 20 copies. If you miss one, you will call the wrong number.
          </p>
          <p>
            <strong>Normalise to keep data correct. Denormalise, with care, to make important reads fast.</strong>
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="normalisation-one-fact-one-place">Normalisation: one fact, one place</h3>
          <p>Here is an unnormalised orders table. Customer details are repeated in every order row:</p>
          <AsciiDiagram text={diagram1} />
          <p>
            This causes three kinds of <strong>anomalies</strong> (wrong or lost data caused by the table design):
          </p>
          <ul>
            <li>
              <strong>Update anomaly:</strong> Asha moves to Mumbai. You must update every one of her orders. Miss one
              and the data disagrees with itself.
            </li>
            <li>
              <strong>Insert anomaly:</strong> you cannot store a new customer until they place an order.
            </li>
            <li>
              <strong>Delete anomaly:</strong> if you delete Ravi's only order, you also lose the fact that Ravi exists.
            </li>
          </ul>
          <p>
            <strong>Normalised version:</strong>
          </p>
          <AsciiDiagram text={diagram2} />
          <p>
            Each fact now lives in <strong>one place</strong>. If Asha's city changes, you change one row. Here{" "}
            <code>cust_id</code> and <code>product_id</code> are foreign keys (columns that point to a row in another
            table).
          </p>
          <h3 id="the-normal-forms-in-plain-english">The normal forms, in plain English</h3>
          <p>
            A normal form is a set of rules for a table design. Each higher form adds a rule. A primary key is the
            column (or columns) that identifies each row.
          </p>
          <ul>
            <li>
              <strong>1NF (First Normal Form):</strong> each cell holds <strong>one value</strong>. A list like
              "Shoes, Socks" in one cell is not allowed. Each row must also be unique.
            </li>
            <li>
              <strong>2NF:</strong> every non-key column depends on the <strong>whole</strong> primary key, not just
              part of it. This matters for tables with composite keys (a primary key made of two or more columns).
            </li>
            <li>
              <strong>3NF:</strong> non-key columns depend <strong>only on the key</strong>, not on other non-key
              columns. For example, <code>cust_city</code> depends on the customer, not on the order. So move it to{" "}
              <code>customers</code>.
            </li>
            <li>
              <strong>BCNF (Boyce-Codd Normal Form):</strong> a slightly stricter version of 3NF.
            </li>
          </ul>
          <p>
            A popular way to remember 3NF: every column should depend on{" "}
            <strong>"the key, the whole key, and nothing but the key"</strong>. For most apps,{" "}
            <strong>3NF is a good, practical goal</strong>.
          </p>
          <h3 id="an-important-exception-historical-facts">An important exception: historical facts</h3>
          <p>
            Look at <code>price</code> again. Suppose the price of shoes changes tomorrow.{" "}
            <strong>Yesterday's order must still show what the customer actually paid</strong>. So an order line
            should store <code>price_at_purchase</code>. This is not bad duplication. It is a{" "}
            <strong>different fact</strong>: the price at that moment. Good modelling asks:{" "}
            <em>is this the same fact, or a snapshot of it at one point in time?</em> Addresses on invoices and names on
            tickets work the same way.
          </p>
          <h3 id="denormalisation-duplicate-on-purpose">Denormalisation: duplicate on purpose</h3>
          <p>
            Normalised data needs <strong>joins</strong> to put the pieces back together. On one database this is usually
            fine. But at high scale, in NoSQL databases, or across shards (parts of a database split over machines),
            joins become slow or impossible. So we <strong>denormalise</strong>. This means we store data in the shape
            in which it is read.
          </p>
          <p>These are common techniques:</p>
          <p>
            <strong>1. Copy a few fields to avoid a join.</strong>
          </p>
          <CodeBlock lang="sql" code={code1} />
          <p>
            The feed can now show author names without joining the <code>users</code> table.
          </p>
          <p>
            <strong>2. Precomputed counters.</strong>
          </p>
          <CodeBlock lang="sql" code={code2} />
          <p>
            Do not run <code>COUNT(*)</code> over millions of comment rows on every page view. Instead, change the counter
            when a comment is added.
          </p>
          <p>
            <strong>3. Embedded documents (NoSQL style).</strong> Put the related data inside the main record.
          </p>
          <CodeBlock lang="json" code={code3} />
          <p>
            <strong>4. Materialised views.</strong> A materialised view is a saved copy of the <strong>result</strong> of a
            query. The database stores it like a table and you refresh it when you want:
          </p>
          <CodeBlock lang="sql" code={code4} />
          <p>
            <strong>5. Read models / CQRS.</strong> CQRS (Command Query Responsibility Segregation) means you use separate
            models for writing and for reading. You keep a normalised "write model". You also keep one or more
            denormalised "read models" built from it, often through events. Examples are a search index or a feed table
            for each user (Part 6).
          </p>
          <h3 id="keeping-copies-in-sync">Keeping copies in sync</h3>
          <p>Every copy is a promise that you must keep. These are your options:</p>
          <ul>
            <li>
              <strong>Update the copies in the same transaction</strong> (when they are in the same database). A
              transaction makes all changes succeed together or fail together (Lesson 21). This is the most correct
              option.
            </li>
            <li>
              <strong>Application logic</strong> ("when a user renames, also update their posts"). It is easy to forget
              this in one of the code paths.
            </li>
            <li>
              <strong>Database triggers.</strong> A trigger is code that the database runs by itself when a row changes. It
              works automatically, but it is hidden and can surprise people.
            </li>
            <li>
              <strong>Events / Change Data Capture (CDC)</strong>: send a "user renamed" event (or read the database change
              log) and let a worker update the copies. This is reliable at scale. But the copies are{" "}
              <strong>briefly stale</strong> (out of date for a short time). This is called eventual consistency.
            </li>
            <li>
              <strong>Accept staleness</strong> for copies that matter little ("author name on old posts may be a few
              minutes late").
            </li>
          </ul>
          <p>
            Also ask: <strong>how often does this field change?</strong> Copying a user's <em>name</em> (it changes
            rarely) is low risk. Copying their <em>follower count</em> (it changes all the time) needs a clear update
            plan.
          </p>
          <Flow
            caption="A denormalised copy is a promise. Pick how you keep it, from most correct to most relaxed."
            nodes={[
              {
                title: <>Same transaction</>,
                desc: <>update the original and every copy together (same database only)</>,
                tone: "good",
              },
              {
                title: <>Application code</>,
                desc: <>“on rename, also update posts”; easy to forget in one code path</>,
              },
              { title: <>Database trigger</>, desc: <>automatic, but hidden and surprising</> },
              {
                title: <>Events / CDC</>,
                desc: <>a worker updates copies from the change log; reliable at scale, briefly stale</>,
              },
              {
                title: <>Accept staleness</>,
                desc: <>fine for low-value copies like an author name on old posts</>,
                tone: "muted",
              },
            ]}
          />
          <h3 id="where-each-approach-fits">Where each approach fits</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Situation</th>
                  <th>Lean towards</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Core business data (orders, payments, accounts)</td>
                  <td>
                    <strong>Normalised</strong>: correctness first
                  </td>
                </tr>
                <tr>
                  <td>Read-heavy pages at high traffic (feeds, product pages)</td>
                  <td>
                    <strong>Denormalised</strong> read models or caches
                  </td>
                </tr>
                <tr>
                  <td>NoSQL / wide-column databases</td>
                  <td>
                    <strong>Denormalised</strong>, modelled per query
                  </td>
                </tr>
                <tr>
                  <td>Analytics warehouses</td>
                  <td>
                    <strong>Denormalised</strong> star schemas (a central "facts" table with the numbers, plus "dimension" tables
                    with the details around it)
                  </td>
                </tr>
                <tr>
                  <td>Early-stage product</td>
                  <td>
                    <strong>Normalised</strong> first; denormalise specific hot paths when measurements say so
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Compare
            caption="The trade in one picture."
            columns={[
              {
                title: <>Normalised</>,
                items: [
                  { sign: "+", text: <>One source of truth, so no update anomalies</> },
                  { sign: "+", text: <>Flexible queries, smaller storage</> },
                  { sign: "-", text: <>More joins for complex reads</> },
                ],
                verdict: <>Orders, payments, accounts: core business data</>,
              },
              {
                title: <>Denormalised</>,
                items: [
                  { sign: "+", text: <>Reads shaped exactly like the screen</> },
                  { sign: "+", text: <>No joins; works across shards and in NoSQL</> },
                  { sign: "-", text: <>Slower, more complex writes</> },
                  { sign: "-", text: <>Copies can drift out of sync</> },
                ],
                verdict: <>Feeds, product pages, counters, analytics</>,
              },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <p>
            <strong>Normalisation</strong>
          </p>
          <ul>
            <li>✅ One source of truth, no update anomalies, flexible queries, smaller storage.</li>
            <li>❌ More joins. They can be slow for complex reads at very high scale.</li>
          </ul>
          <p>
            <strong>Denormalisation</strong>
          </p>
          <ul>
            <li>✅ Fast, simple reads that match what the screen needs.</li>
            <li>
              ❌ Slower and more complex writes, a risk that copies disagree, more storage, and more code to maintain.
            </li>
          </ul>
          <p>
            <strong>Common mistake:</strong> denormalising <strong>before</strong> you measure. Joins on well-indexed
            tables are fast. Start normalised. Add caching (Lessons 15–16). Denormalise only the paths that you have
            proven to be slow.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Social feeds.</strong> Platforms like Twitter/X and Instagram store denormalised feeds. A feed is a list of post IDs for each
            user, often kept in Redis. So opening the app is one fast read. The app does not have to join "everyone I
            follow" with "all their posts" each time. We design this in the news-feed case study (Lesson 64).
          </p>
          <p>
            <strong>Like and view counts.</strong> Large platforms show counts like "1.2M views" from precomputed,
            denormalised counters. These counters are updated asynchronously (later, in the background). That is why
            counts sometimes lag or jump. It is a deliberate trade: less exact, but faster.
          </p>
          <p>
            <strong>E-commerce invoices.</strong> Online stores copy the product name, price and address into each order
            at checkout. So invoices stay correct even if the product is renamed or repriced, or the customer moves.
            This looks like denormalisation, but it really is <strong>keeping history</strong>.
          </p>
          <p>
            <strong>Data warehouses.</strong> Analytics tools like BigQuery, Snowflake and Redshift commonly use{" "}
            <strong>star schemas</strong>: a central "sales" fact table surrounded by dimension tables like date,
            product and region. They are built for fast aggregation (sums, counts, averages), not for transactional
            updates.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What problems does normalisation solve?</>,
                a: (
                  <>
                    <p>
                      It solves update, insert and delete anomalies. Each fact is stored once. So a change touches only
                      one row. You can store an entity without an unrelated record. And deleting one record does not
                      erase a different fact.
                    </p>
                  </>
                ),
              },
              {
                q: <>When would you denormalise?</>,
                a: (
                  <>
                    <p>
                      I would do it when measurements show that a read path is too slow, or impossible, without joins.
                      Examples: busy feeds or product pages, counts recomputed on every view, data spread across
                      shards, or NoSQL stores modelled per query. I would also need a clear plan to keep the copies in
                      sync.
                    </p>
                  </>
                ),
              },
              {
                q: <>Is storing price in the order row a violation of normalisation?</>,
                a: (
                  <>
                    <p>
                      No. The price at purchase is a different fact from the product's current price. It is history.
                      Invoices, shipping addresses and names on tickets must keep the value that was true when the
                      event happened.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you keep a denormalised counter accurate?</>,
                a: (
                  <>
                    <p>
                      Increase it atomically (in one step) in the same transaction as the insert: UPDATE posts SET
                      comment_count = comment_count + 1. Or update it later from events, and from time to time compare
                      it with the true count and fix it. At very high rates, batch the updates or split the counter into
                      several parts (shard it).
                    </p>
                  </>
                ),
              },
              {
                q: <>What's a materialised view?</>,
                a: (
                  <>
                    <p>
                      It is a saved query result that the database refreshes on request or on a schedule. It gives fast
                      reads of expensive aggregations. The cost is that the data is stale between refreshes, and the
                      refresh itself takes work.
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
              <strong>Normalisation</strong> stores <strong>each fact once</strong>. It prevents update, insert and
              delete anomalies. Aim for <strong>3NF</strong> for core data.
            </li>
            <li>
              <strong>Denormalisation</strong> duplicates data on purpose (copied fields, counters, embedded documents,
              materialised views, read models) to make <strong>reads fast</strong>.
            </li>
            <li>
              Every copy needs a <strong>sync plan</strong>: same transaction, application code, triggers, or
              events/CDC. Decide how stale each copy may be.
            </li>
            <li>
              Snapshots of history (<strong>price at purchase</strong>, address on an invoice) are{" "}
              <strong>correct modelling</strong>, not bad duplication.
            </li>
            <li>
              <strong>Start normalised</strong>, measure, then denormalise <strong>specific hot paths</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The System Design Primer on GitHub (section "Denormalization")</li>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann (chapter 2, and Part III on derived
              data)
            </li>
            <li>The PostgreSQL documentation on materialised views</li>
            <li>Martin Fowler's article "CQRS"</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
