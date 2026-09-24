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
            Your posts table stores the author's name in every row, to avoid a join. It's fast! Then an author changes
            their name from "Asha K" to "Asha Kulkarni". Now 3,000 old posts show the old name, and 12 new ones show the
            new name.
          </p>
          <p>
            Or the opposite. Your perfectly organised database needs <strong>seven joins</strong> to show one product
            page, and at 10,000 views per second it's too slow.
          </p>
          <p>
            <strong>Normalisation</strong> (no duplicated data) and <strong>denormalisation</strong> (deliberately
            duplicated data) are two ends of a trade-off between <strong>correctness and simplicity of writes</strong>{" "}
            and <strong>speed of reads</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about your <strong>phone contacts</strong>.
          </p>
          <p>
            <strong>Normalised:</strong> your friend's phone number is stored <strong>once</strong>, in their contact.
            Every WhatsApp group, calendar invite and note just <strong>refers</strong> to that contact. When they
            change their number, you update it in one place and everything is correct.
          </p>
          <p>
            <strong>Denormalised:</strong> you've written your friend's number in 20 different notes and on sticky notes
            around the house, so you can find it quickly without opening contacts. That's fast to read, but when the
            number changes you must find and update all 20 copies. Miss one and you'll call the wrong number.
          </p>
          <p>
            <strong>Normalise to keep data correct. Denormalise, carefully, to make important reads fast.</strong>
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="normalisation-one-fact-one-place">Normalisation: one fact, one place</h3>
          <p>Here's an unnormalised orders table:</p>
          <AsciiDiagram text={diagram1} />
          <p>
            This causes three kinds of <strong>anomalies</strong>:
          </p>
          <ul>
            <li>
              <strong>Update anomaly:</strong> Asha moves to Mumbai. You must update every one of her orders. Miss one
              and the data disagrees with itself.
            </li>
            <li>
              <strong>Insert anomaly:</strong> you can't store a new customer until they place an order.
            </li>
            <li>
              <strong>Delete anomaly:</strong> delete Ravi's only order and you lose the fact that Ravi exists.
            </li>
          </ul>
          <p>
            <strong>Normalised version:</strong>
          </p>
          <AsciiDiagram text={diagram2} />
          <p>
            Each fact now lives in <strong>one place</strong>. Asha's city changes in one row.
          </p>
          <h3 id="the-normal-forms-in-plain-english">The normal forms, in plain English</h3>
          <ul>
            <li>
              <strong>1NF (First Normal Form):</strong> each cell holds <strong>one value</strong>, not lists like
              "Shoes, Socks" in one column, and each row is unique.
            </li>
            <li>
              <strong>2NF:</strong> every non-key column depends on the <strong>whole</strong> primary key, not just
              part of it. This matters for tables with composite keys.
            </li>
            <li>
              <strong>3NF:</strong> non-key columns depend <strong>only on the key</strong>, not on other non-key
              columns. (<code>cust_city</code> depends on the customer, not the order, so move it to{" "}
              <code>customers</code>.)
            </li>
            <li>
              <strong>BCNF:</strong> a slightly stricter version of 3NF.
            </li>
          </ul>
          <p>
            A popular summary of 3NF: every column should depend on{" "}
            <strong>"the key, the whole key, and nothing but the key"</strong>. For most apps,{" "}
            <strong>3NF is the practical goal</strong>.
          </p>
          <h3 id="an-important-exception-historical-facts">An important exception: historical facts</h3>
          <p>
            Look at <code>price</code> again. If the price of shoes changes tomorrow,{" "}
            <strong>yesterday's order should still show what the customer actually paid</strong>. So an order line
            should store <code>price_at_purchase</code>. That's not bad duplication; it's a{" "}
            <strong>different fact</strong> (the price at that moment). Good modelling asks:{" "}
            <em>is this the same fact, or a snapshot of it at a point in time?</em> Addresses on invoices and names on
            tickets are similar.
          </p>
          <h3 id="denormalisation-duplicate-on-purpose">Denormalisation: duplicate on purpose</h3>
          <p>
            Normalised data needs <strong>joins</strong> to put things back together. On one database that's usually
            fine. But at high scale, in NoSQL databases, or across shards, joins become expensive or impossible. So we{" "}
            <strong>denormalise</strong>, storing data in the shape it's read.
          </p>
          <p>Common techniques:</p>
          <p>
            <strong>1. Copy a few fields to avoid a join.</strong>
          </p>
          <CodeBlock lang="sql" code={code1} />
          <p>
            The feed shows author names without joining <code>users</code>.
          </p>
          <p>
            <strong>2. Precomputed counters.</strong>
          </p>
          <CodeBlock lang="sql" code={code2} />
          <p>
            Instead of <code>COUNT(*)</code> over millions of comment rows on every page view, update a counter when a
            comment is added.
          </p>
          <p>
            <strong>3. Embedded documents (NoSQL style).</strong>
          </p>
          <CodeBlock lang="json" code={code3} />
          <p>
            <strong>4. Materialised views.</strong> The database stores the <strong>result</strong> of a query and
            refreshes it:
          </p>
          <CodeBlock lang="sql" code={code4} />
          <p>
            <strong>5. Read models / CQRS.</strong> CQRS (Command Query Responsibility Segregation) keeps a normalised
            "write model" and one or more denormalised "read models" built from it, often by events. For example, a
            search index or a per-user feed table (Part 6).
          </p>
          <h3 id="keeping-copies-in-sync">Keeping copies in sync</h3>
          <p>Every copy is a promise you must keep. Options:</p>
          <ul>
            <li>
              <strong>Update copies in the same transaction</strong> (when they're in the same database). This is the
              most correct.
            </li>
            <li>
              <strong>Application logic</strong> ("when a user renames, also update their posts"). This is easy to
              forget in some code path.
            </li>
            <li>
              <strong>Database triggers</strong>, which run automatically but are hidden and can surprise people.
            </li>
            <li>
              <strong>Events / Change Data Capture</strong>: publish "user renamed" and let a worker update copies. This
              is reliable at scale, but copies are <strong>briefly stale</strong> (eventual consistency).
            </li>
            <li>
              <strong>Accept staleness</strong> for low-value copies ("author name on old posts may lag a few minutes").
            </li>
          </ul>
          <p>
            And ask: <strong>how often does this field change?</strong> Copying a user's <em>name</em> (changes rarely)
            is low risk. Copying their <em>follower count</em> (changes constantly) needs a clear update strategy.
          </p>
          <Flow
            caption="A denormalised copy is a promise. Pick how you keep it — from most correct to most relaxed."
            nodes={[
              {
                title: <>Same transaction</>,
                desc: <>update the original and every copy together (same database only)</>,
                tone: "good",
              },
              {
                title: <>Application code</>,
                desc: <>“on rename, also update posts” — easy to forget in one code path</>,
              },
              { title: <>Database trigger</>, desc: <>automatic, but hidden and surprising</> },
              {
                title: <>Events / CDC</>,
                desc: <>a worker updates copies from the change log — reliable at scale, briefly stale</>,
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
                    <strong>Denormalised</strong> star schemas (a central "facts" table plus "dimension" tables)
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
                  { sign: "+", text: <>One source of truth — no update anomalies</> },
                  { sign: "+", text: <>Flexible queries, smaller storage</> },
                  { sign: "-", text: <>More joins for complex reads</> },
                ],
                verdict: <>Orders, payments, accounts — core business data</>,
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
            <li>❌ More joins, which are slower for complex reads at very high scale.</li>
          </ul>
          <p>
            <strong>Denormalisation</strong>
          </p>
          <ul>
            <li>✅ Fast, simple reads that match what the screen needs.</li>
            <li>
              ❌ Slower and more complex writes, risk of inconsistent copies, more storage, and more code to maintain.
            </li>
          </ul>
          <p>
            <strong>Common mistake:</strong> denormalising <strong>before</strong> measuring. Joins on well-indexed
            tables are fast. Start normalised, add caching (posts 15–16), and denormalise only the proven hot paths.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Social feeds.</strong> Platforms like Twitter/X and Instagram store denormalised feeds (lists of
            post IDs per user, often in Redis) so opening the app is a fast single read, instead of joining "everyone I
            follow" with "all their posts" each time. We'll design this in the news-feed case study (post 64).
          </p>
          <p>
            <strong>Like and view counts.</strong> Large platforms show counts like "1.2M views" from precomputed,
            denormalised counters that are updated asynchronously. That's why counts sometimes lag or jump. It's a
            deliberate trade of exactness for speed.
          </p>
          <p>
            <strong>E-commerce invoices.</strong> Online stores copy the product name, price and address into each order
            at checkout, so invoices stay correct even if the product is renamed, repriced or the customer moves. It's
            "denormalisation" that is really <strong>preserving history</strong>.
          </p>
          <p>
            <strong>Data warehouses.</strong> Analytics tools like BigQuery, Snowflake and Redshift commonly use{" "}
            <strong>star schemas</strong>: a central "sales" fact table surrounded by dimension tables like date,
            product and region. They're designed for fast aggregation, not for transactional updates.
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
                      Update, insert and delete anomalies. Storing each fact once means a change touches one row, you
                      can store an entity without an unrelated record, and deleting one record doesn't erase a different
                      fact.
                    </p>
                  </>
                ),
              },
              {
                q: <>When would you denormalise?</>,
                a: (
                  <>
                    <p>
                      When measurements show a read path is too slow or impossible without joins — hot feeds or product
                      pages, counts recomputed on every view, data spread across shards, or NoSQL stores modelled per
                      query — and only with a clear strategy for keeping the copies in sync.
                    </p>
                  </>
                ),
              },
              {
                q: <>Is storing price in the order row a violation of normalisation?</>,
                a: (
                  <>
                    <p>
                      No. The price at purchase is a different fact from the product's current price: it's history.
                      Invoices, shipping addresses and names on tickets must keep the value as it was when the event
                      happened.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you keep a denormalised counter accurate?</>,
                a: (
                  <>
                    <p>
                      Increment it atomically in the same transaction as the insert (UPDATE posts SET comment_count =
                      comment_count + 1), or update it asynchronously from events and periodically reconcile against the
                      true count. At very high rates, batch or shard the counter.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's a materialised view?</>,
                a: (
                  <>
                    <p>
                      A stored query result the database refreshes on demand or on a schedule. It gives fast reads of
                      expensive aggregations at the cost of staleness between refreshes and the refresh work itself.
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
              delete anomalies. Aim for about <strong>3NF</strong> for core data.
            </li>
            <li>
              <strong>Denormalisation</strong> duplicates data on purpose (copied fields, counters, embedded documents,
              materialised views, read models) to make <strong>reads fast</strong>.
            </li>
            <li>
              Every copy needs a <strong>sync strategy</strong>: same transaction, application code, triggers, or
              events/CDC. Decide how stale each copy can be.
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
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann (chapter 2, and chapter 11 on derived
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
