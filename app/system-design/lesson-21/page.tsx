import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Flow, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-21")!;

export const metadata: Metadata = {
  title: `Lesson 21 — ${lesson.title}`,
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

const code1 = `BEGIN;
  UPDATE accounts SET balance = balance - 5000 WHERE id = 'you';
  UPDATE accounts SET balance = balance + 5000 WHERE id = 'friend';
COMMIT;`;

const code2 = `T1: UPDATE price = 500 (not committed yet)
T2: SELECT price → 500      ← reads T1's unfinished change
T1: ROLLBACK                ← the 500 never really existed`;

const code3 = `T1: SELECT balance → 10,000
T2: UPDATE balance = 2,000; COMMIT
T1: SELECT balance → 2,000   ← same query, different answer`;

const code4 = `T1: SELECT COUNT(*) FROM bookings WHERE show = 7 → 99
T2: INSERT booking for show 7; COMMIT
T1: SELECT COUNT(*) ... → 100   ← a "phantom" row appeared`;

const code5 = `Row "balance" versions:
  v1: 10,000  (created by T5, visible to snapshots before T9)
  v2:  2,000  (created by T9, visible to snapshots after T9)`;

const code6 = `UPDATE products
SET stock = 9, version = 8
WHERE id = 991 AND version = 7;
-- 0 rows updated? Someone else changed it first → re-read and retry`;

const code7 = `-- ❌ Race-prone
SELECT stock FROM products WHERE id = 991;       -- app sees 10
UPDATE products SET stock = 9 WHERE id = 991;

-- ✅ Atomic
UPDATE products SET stock = stock - 1
WHERE id = 991 AND stock > 0;
-- check "rows affected": 1 = success, 0 = sold out`;

const code8 = `BEGIN;
SELECT * FROM seats WHERE show_id = 7 AND seat = 'A12' FOR UPDATE;  -- locks the row
-- if status = 'free':
UPDATE seats SET status = 'booked', user_id = 42 WHERE show_id = 7 AND seat = 'A12';
COMMIT;`;

const code9 = `CREATE UNIQUE INDEX one_booking_per_seat ON bookings (show_id, seat);`;

export default function SdLessonTwoOnePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            A concert has <strong>one seat left</strong>. Two people click "Book" at the same moment. Both requests
            check "is the seat free?", and both see <strong>yes</strong>. Both book it. Now two people have tickets for
            the same seat.
          </p>
          <p>
            Or this one: you transfer ₹5,000 to a friend. The money leaves your account, then the server crashes{" "}
            <strong>before</strong> it reaches theirs. Where did the money go?
          </p>
          <p>
            These aren't rare edge cases. With thousands of users and servers that sometimes crash, they{" "}
            <strong>will</strong> happen. <strong>Transactions</strong> are how databases protect you from them, but
            only if you understand what they actually guarantee.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about <strong>buying something at a shop</strong>. You hand over the money and the shopkeeper hands
            over the item. Either <strong>both</strong> happen or <strong>neither</strong> does. You'd never accept "you
            paid, but the item got stuck halfway".
          </p>
          <p>
            A <strong>transaction</strong> groups several database operations into one <strong>all-or-nothing</strong>{" "}
            unit:
          </p>
          <CodeBlock lang="sql" code={code1} />
          <p>
            If anything fails before <code>COMMIT</code>, the database <strong>rolls back</strong>: it undoes
            everything, as if nothing happened.
          </p>
          <p>
            <strong>Isolation</strong> answers a second question: when <strong>many</strong> transactions run at the
            same time, how much can they see of each other's unfinished work? That's where most of the tricky bugs live.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="acid-letter-by-letter">ACID, letter by letter</h3>
          <p>
            <strong>A: Atomicity (all or nothing).</strong> Every change in the transaction is applied, or none is. If
            the server crashes after the first <code>UPDATE</code>, the database undoes it on restart.
          </p>
          <p>
            <strong>C: Consistency (rules stay true).</strong> The data moves from one valid state to another.
            Constraints (like <code>balance &gt;= 0</code>, unique emails, valid foreign keys) are never broken. Note:
            "consistency" here is mostly about <strong>your application's rules</strong>, enforced with constraints and
            correct transactions. It's <strong>not</strong> the same "consistency" as in CAP (post 27).
          </p>
          <p>
            <strong>I: Isolation (concurrent transactions don't mess each other up).</strong> Ideally each transaction
            behaves <strong>as if it ran alone</strong>. In practice, databases offer different <strong>levels</strong>{" "}
            of isolation (below), trading safety for speed.
          </p>
          <p>
            <strong>D: Durability (committed means saved).</strong> Once the database says "committed", the data
            survives crashes and power cuts.
          </p>
          <h3 id="how-durability-works-the-write-ahead-log">How durability works: the write-ahead log</h3>
          <p>
            Databases don't rewrite data files directly on every change. That would be slow, and a crash in the middle
            could corrupt them. Instead:
          </p>
          <Flow
            caption="The write-ahead log. Commit means “it's in the log on disk”, not “the data files are updated”."
            nodes={[
              { title: <>Append the change to the WAL</>, desc: <>sequential, fast</> },
              { title: <>Force the log to disk (fsync)</>, desc: <>now it survives a power cut</> },
              { title: <>Reply “COMMIT OK”</>, desc: <>the app can move on</>, tone: "good" },
              { title: <>Apply to data files later</>, desc: <>in the background, in batches</> },
              {
                title: <>On crash &amp; restart</>,
                desc: <>replay the log: redo committed work, undo uncommitted work</>,
                tone: "warn",
              },
            ]}
          />
          <p>
            Appending to a log is fast, because it's sequential writing (post 10). The same log is also used for{" "}
            <strong>replication</strong> (post 24) and <strong>point-in-time recovery</strong> (Part 7).
          </p>
          <h3 id="the-problems-isolation-prevents">The problems isolation prevents</h3>
          <p>Here are the classic "anomalies", things that can go wrong when transactions run at the same time.</p>
          <p>
            <strong>1. Dirty read: reading uncommitted data.</strong>
          </p>
          <CodeBlock code={code2} />
          <p>
            <strong>2. Non-repeatable read: the same row changes mid-transaction.</strong>
          </p>
          <CodeBlock code={code3} />
          <p>
            <strong>3. Phantom read: new rows appear.</strong>
          </p>
          <CodeBlock code={code4} />
          <p>
            <strong>4. Lost update: two read-modify-writes overwrite each other.</strong>
          </p>
          <SequenceDiagram
            caption="A lost update. Two read-modify-write cycles overwrite each other."
            actors={["T1", "Database", "T2"]}
            messages={[
              { from: 0, to: 1, label: <>read stock</> },
              { from: 1, to: 0, label: <>10</>, reply: true },
              { from: 2, to: 1, label: <>read stock</> },
              { from: 1, to: 2, label: <>10</>, reply: true },
              { from: 0, to: 1, label: <>write stock = 9</> },
              { from: 2, to: 1, label: <>write stock = 9</> },
              {
                from: 0,
                to: 0,
                label: (
                  <>
                    Two items sold, stock shows 9 instead of 8 — fix: UPDATE … SET stock = stock − 1 WHERE stock &gt; 0
                  </>
                ),
                divider: true,
              },
            ]}
          />
          <p>
            <strong>5. Write skew: two transactions each check a rule, then both break it together.</strong> This is the
            classic example from Martin Kleppmann's book. A hospital requires{" "}
            <strong>at least one doctor on call</strong>. Two doctors are on call and both feel sick:
          </p>
          <SequenceDiagram
            caption="Write skew. Each doctor changes a different row, based on a check the other one makes false."
            actors={["Dr A (T1)", "Database", "Dr B (T2)"]}
            messages={[
              { from: 0, to: 1, label: <>how many on call?</> },
              { from: 1, to: 0, label: <>2</>, reply: true },
              { from: 2, to: 1, label: <>how many on call?</> },
              { from: 1, to: 2, label: <>2</>, reply: true },
              { from: 0, to: 1, label: <>set A off call; COMMIT</> },
              { from: 2, to: 1, label: <>set B off call; COMMIT</> },
              {
                from: 0,
                to: 0,
                label: (
                  <>Zero doctors on call 😱 — only Serializable (or locking both rows with FOR UPDATE) prevents this</>
                ),
                divider: true,
              },
            ]}
          />
          <p>
            Each transaction was fine <strong>on its own</strong>. Together they broke the rule, because each{" "}
            <strong>changed a different row</strong> based on a check that the other made false. The concert seat and
            double-booking bugs are often write skew.
          </p>
          <h3 id="isolation-levels">Isolation levels</h3>
          <p>The SQL standard defines four levels. Higher means safer, but can mean slower or more retries.</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Dirty read</th>
                  <th>Non-repeatable read</th>
                  <th>Phantom</th>
                  <th>Lost update / write skew</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Read Uncommitted</strong>
                  </td>
                  <td>Possible</td>
                  <td>Possible</td>
                  <td>Possible</td>
                  <td>Possible</td>
                </tr>
                <tr>
                  <td>
                    <strong>Read Committed</strong>
                  </td>
                  <td>✅ Prevented</td>
                  <td>Possible</td>
                  <td>Possible</td>
                  <td>Possible</td>
                </tr>
                <tr>
                  <td>
                    <strong>Repeatable Read / Snapshot</strong>
                  </td>
                  <td>✅</td>
                  <td>✅ Prevented</td>
                  <td>Depends on DB</td>
                  <td>Write skew possible*</td>
                </tr>
                <tr>
                  <td>
                    <strong>Serializable</strong>
                  </td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅ Prevented</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            *Exact behaviour differs between databases. For example, PostgreSQL's Repeatable Read prevents lost updates
            on the same row but still allows write skew.
          </p>
          <p>
            <strong>Default levels in popular databases:</strong>
          </p>
          <ul>
            <li>
              <strong>PostgreSQL:</strong> Read Committed.
            </li>
            <li>
              <strong>MySQL (InnoDB):</strong> Repeatable Read.
            </li>
            <li>
              <strong>SQL Server and Oracle:</strong> Read Committed.
            </li>
          </ul>
          <p>
            So <strong>by default, most databases do not prevent all anomalies.</strong> Many developers assume "I'm in
            a transaction, so I'm safe". That's not always true.
          </p>
          <h3 id="how-databases-implement-isolation">How databases implement isolation</h3>
          <p>
            <strong>Locking (pessimistic).</strong> Transactions take <strong>locks</strong> on the rows they read or
            write. Others wait.
          </p>
          <ul>
            <li>
              The classic full version, <strong>two-phase locking (2PL)</strong>, gives serializable isolation.
            </li>
            <li>
              It's safe, but can cause waiting and <strong>deadlocks</strong> (post 4). The database detects deadlocks
              and aborts one transaction.
            </li>
          </ul>
          <p>
            <strong>MVCC: Multi-Version Concurrency Control.</strong> Used by PostgreSQL, MySQL InnoDB, Oracle and
            others. The database keeps <strong>multiple versions</strong> of each row. Each transaction sees a{" "}
            <strong>snapshot</strong>, a consistent picture of the data as of a certain moment.
          </p>
          <CodeBlock code={code5} />
          <ul>
            <li>
              <strong>Readers don't block writers, and writers don't block readers.</strong> That's great for
              performance.
            </li>
            <li>
              Old versions must be cleaned up later (in PostgreSQL this is <strong>VACUUM</strong>).
            </li>
          </ul>
          <p>
            <strong>Serializable Snapshot Isolation (SSI).</strong> PostgreSQL's Serializable level uses snapshots plus
            tracking of who read what. If two transactions would create an anomaly like write skew, one of them{" "}
            <strong>fails at commit</strong> with a "could not serialize" error.{" "}
            <strong>Your app must retry it.</strong>
          </p>
          <p>
            <strong>Optimistic concurrency (in the app).</strong> Add a <code>version</code> column and only update if
            it hasn't changed:
          </p>
          <CodeBlock lang="sql" code={code6} />
          <p>
            This is common in web apps and APIs (the HTTP <code>ETag</code> / <code>If-Match</code> headers work the
            same way).
          </p>
          <h3 id="practical-tools-to-fix-real-bugs">Practical tools to fix real bugs</h3>
          <p>
            <strong>1. Let the database do the maths (atomic updates).</strong> Instead of read-then-write in your app:
          </p>
          <CodeBlock lang="sql" code={code7} />
          <p>
            <strong>
              2. Lock the rows you're about to change (<code>SELECT ... FOR UPDATE</code>).
            </strong>
          </p>
          <CodeBlock lang="sql" code={code8} />
          <p>
            A second booking request waits for the lock, then sees <code>status = 'booked'</code>.
          </p>
          <p>
            <strong>3. Unique constraints as a safety net.</strong>
          </p>
          <CodeBlock lang="sql" code={code9} />
          <p>Even if your code has a bug, the database refuses a second booking for the same seat.</p>
          <p>
            <strong>4. Use Serializable for tricky invariants,</strong> like the doctors rule, and{" "}
            <strong>retry on serialization errors</strong>.
          </p>
          <p>
            <strong>5. Keep transactions short.</strong> Never hold a transaction open while calling an external API or
            waiting for a user. Long transactions hold locks, block others and bloat MVCC versions.
          </p>
          <Compare
            caption="Two ways to stop concurrent transactions clashing."
            columns={[
              {
                title: <>Pessimistic — lock first</>,
                items: [
                  { sign: "·", text: <>SELECT … FOR UPDATE, two-phase locking</> },
                  { sign: "+", text: <>Certain: the second transaction simply waits</> },
                  { sign: "-", text: <>Waiting, and deadlocks under contention</> },
                ],
                verdict: <>High-conflict hot rows: the last seat, a flash-sale item</>,
              },
              {
                title: <>Optimistic — check at the end</>,
                items: [
                  { sign: "·", text: <>version column, ETag/If-Match, Serializable (SSI)</> },
                  { sign: "+", text: <>No waiting; readers never block</> },
                  { sign: "-", text: <>Conflicts surface as failures you must retry</> },
                ],
                verdict: <>Conflicts are rare: profile edits, most web forms</>,
              },
            ]}
          />
          <h3 id="transactions-across-services">Transactions across services</h3>
          <p>
            ACID works <strong>inside one database</strong>. If an order service and a payment service each have their
            own database, you can't wrap both in a single <code>BEGIN ... COMMIT</code>.
          </p>
          <ul>
            <li>
              <strong>Two-phase commit (2PC)</strong> can coordinate them, but it's slow and fragile: if the coordinator
              dies, everyone waits.
            </li>
            <li>
              Most microservice systems use <strong>sagas</strong> instead: a sequence of local transactions with{" "}
              <strong>compensating actions</strong> ("payment failed, so cancel the order"). Part 6 covers sagas.
            </li>
          </ul>
          <p>
            This is one reason people say "<strong>don't split your database until you have to</strong>".
          </p>
          <h3 id="acid-vs-base">ACID vs BASE</h3>
          <p>
            Some NoSQL systems describe themselves as <strong>BASE</strong>: <strong>B</strong>asically{" "}
            <strong>A</strong>vailable, <strong>S</strong>oft state, <strong>E</strong>ventually consistent. That means
            they prefer staying available and fast over strict transactional guarantees. Many modern NoSQL databases now
            offer ACID transactions in limited forms (for example, within one partition, or with extra cost). Always
            check exactly what's guaranteed.
          </p>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Higher isolation</strong> means fewer bugs, but more locking, more aborted transactions to retry,
              and sometimes lower throughput.
            </li>
            <li>
              <strong>Lower isolation</strong> gives better performance, but you must reason carefully about races,
              often with explicit locks or atomic updates.
            </li>
            <li>
              <strong>Pessimistic locking</strong> is simple and certain, but can cause waiting and deadlocks under
              contention.
            </li>
            <li>
              <strong>Optimistic concurrency</strong> has no waiting, but needs retries. It's great when conflicts are
              rare, and poor when they're frequent (a flash sale on one item).
            </li>
            <li>
              <strong>Distributed transactions</strong> give correctness across systems, at the cost of complexity and
              latency. Sagas are usually preferred.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Ticket booking and flash sales.</strong> Movie, concert and train booking systems face exactly the
            "last seat" race when thousands of people try to book popular seats at once. They combine row locks or
            atomic updates, unique constraints, and often short-lived "seat holds" with timeouts, so one seat is sold
            once.
          </p>
          <p>
            <strong>Banking and payments.</strong> Every card payment, UPI transfer or bank transfer relies on atomic,
            durable transactions, plus <strong>ledgers</strong> where every movement of money is recorded as entries
            that always balance. Payment companies are famously careful about isolation, idempotency (post 34) and
            reconciliation.
          </p>
          <p>
            <strong>Jepsen testing.</strong> Kyle Kingsbury's Jepsen project tests databases under network failures and
            has found cases where databases, including well-known ones, didn't provide the isolation or consistency they
            claimed in their documentation. It's a reminder to <strong>understand and test</strong> the guarantees you
            depend on.
          </p>
          <p>
            <strong>Hermitage.</strong> Martin Kleppmann's open-source "Hermitage" project tests which anomalies each
            database's isolation levels actually prevent. It showed that the same level name (like "Repeatable Read")
            can mean quite different things in different databases.
          </p>
          <p>
            <strong>Inventory bugs in e-commerce.</strong> "Overselling" (selling more items than exist) is a common,
            costly bug, and it's usually a lost update or write skew. The fix is almost always an atomic conditional
            update or a constraint, not more application code.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Explain each letter of ACID.</>,
                a: (
                  <>
                    <p>
                      Atomicity: all of a transaction's changes happen or none do. Consistency: the database moves
                      between valid states, keeping constraints and invariants true. Isolation: concurrent transactions
                      don't see each other's in-progress work (to a chosen level). Durability: once committed, data
                      survives crashes — via the write-ahead log.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is write skew, and which isolation level prevents it?</>,
                a: (
                  <>
                    <p>
                      Two transactions read the same condition, each updates a different row based on it, and together
                      they break the rule (the on-call doctors). Snapshot / Repeatable Read allows it; Serializable
                      prevents it, or you lock the rows you depend on with SELECT … FOR UPDATE.
                    </p>
                  </>
                ),
              },
              {
                q: <>How would you stop overselling the last item in stock?</>,
                a: (
                  <>
                    <p>
                      Make the check and the write one atomic statement: UPDATE products SET stock = stock − 1 WHERE id
                      = ? AND stock &gt; 0, then check the affected row count. For more complex flows, lock the row with
                      SELECT … FOR UPDATE, and keep a constraint (CHECK stock &gt;= 0) as a safety net.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is MVCC, and why is it popular?</>,
                a: (
                  <>
                    <p>
                      Multi-Version Concurrency Control keeps several versions of each row, so each transaction reads a
                      consistent snapshot. Readers never block writers and writers never block readers, giving high
                      concurrency; the cost is cleaning up old versions (VACUUM in PostgreSQL).
                    </p>
                  </>
                ),
              },
              {
                q: <>What's PostgreSQL's default isolation level, and what does it allow?</>,
                a: (
                  <>
                    <p>
                      Read Committed. It prevents dirty reads, but allows non-repeatable reads, phantoms, lost updates
                      in read-modify-write code, and write skew. Being inside a transaction does not by itself make you
                      safe from races.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you keep data consistent across two microservices with separate databases?</>,
                a: (
                  <>
                    <p>
                      Not with one ACID transaction. Two-phase commit is possible but slow and fragile. Usually you use
                      a saga: a sequence of local transactions, each publishing an event, with compensating actions
                      (refund, cancel) if a later step fails — plus idempotent handlers and an outbox.
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
              A <strong>transaction</strong> makes several changes <strong>all-or-nothing</strong>.{" "}
              <strong>ACID</strong> stands for Atomicity, Consistency, Isolation and Durability.
            </li>
            <li>
              <strong>Durability</strong> comes from the <strong>write-ahead log</strong>. <strong>Isolation</strong>{" "}
              comes from <strong>locking</strong> and/or <strong>MVCC snapshots</strong>.
            </li>
            <li>
              Know the anomalies:{" "}
              <strong>dirty reads, non-repeatable reads, phantoms, lost updates and write skew</strong>. Most databases'{" "}
              <strong>default</strong> level doesn't prevent all of them.
            </li>
            <li>
              Fix races with <strong>atomic updates</strong> (<code>SET x = x - 1 WHERE x &gt; 0</code>),{" "}
              <strong>
                <code>SELECT ... FOR UPDATE</code>
              </strong>
              , <strong>unique constraints</strong>, <strong>optimistic versions</strong>, or{" "}
              <strong>Serializable + retries</strong>.
            </li>
            <li>
              Keep transactions <strong>short</strong>. Across services, use <strong>sagas</strong> rather than
              distributed transactions.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann (chapter 7, "Transactions"), the
              clearest explanation of these anomalies
            </li>
            <li>The PostgreSQL documentation chapters "Transaction Isolation" and "Concurrency Control" (MVCC)</li>
            <li>The paper "A Critique of ANSI SQL Isolation Levels" (Berenson et al., 1995)</li>
            <li>The Hermitage project on GitHub by Martin Kleppmann</li>
            <li>CMU 15-445 Database Systems lectures on concurrency control and recovery</li>
            <li>The Jepsen website's articles on consistency models</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
