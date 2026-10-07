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
            ask "is the seat free?", and both get the answer <strong>yes</strong>. Both book it. Now two people have
            tickets for the same seat. This kind of bug is called a <strong>race condition</strong>: the result depends
            on which request is faster.
          </p>
          <p>
            Here is another problem. You transfer ₹5,000 to a friend. The money leaves your account. Then the server
            crashes <strong>before</strong> the money reaches your friend's account. Where did the money go?
          </p>
          <p>
            These are not rare cases. With thousands of users, and servers that sometimes crash, they{" "}
            <strong>will</strong> happen. A <strong>transaction</strong> is the tool a database gives you to protect
            against them. But it only helps if you understand what it really promises.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about <strong>buying something at a shop</strong>. You hand over the money and the shopkeeper hands
            over the item. Either <strong>both</strong> happen or <strong>neither</strong> happens. You would never accept
            "you paid, but the item got stuck halfway".
          </p>
          <p>
            A <strong>transaction</strong> is a group of database operations that the database treats as one{" "}
            <strong>all-or-nothing</strong> unit. <code>BEGIN</code> starts it. <code>COMMIT</code> saves all of it:
          </p>
          <CodeBlock lang="sql" code={code1} />
          <p>
            If anything fails before <code>COMMIT</code>, the database <strong>rolls back</strong>. A rollback undoes
            every change in the transaction, as if nothing had happened.
          </p>
          <p>
            <strong>Isolation</strong> answers a second question. When <strong>many</strong> transactions run at the
            same time, how much can each one see of the unfinished work of the others? Most of the tricky bugs live
            here.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="acid-letter-by-letter">ACID, letter by letter</h3>
          <p>
            <strong>A: Atomicity (all or nothing).</strong> ACID is a set of four promises that a transaction makes.
            The first is atomicity. Every change in the transaction is applied, or none is. If the server crashes after
            the first <code>UPDATE</code>, the database undoes it when it restarts.
          </p>
          <p>
            <strong>C: Consistency (rules stay true).</strong> The data moves from one valid state to another valid
            state. Constraints (rules the database enforces, like <code>balance &gt;= 0</code>, unique emails, valid
            foreign keys) are never broken. Note: "consistency" here is mostly about{" "}
            <strong>your application's rules</strong>. You enforce them with constraints and correct transactions. It is{" "}
            <strong>not</strong> the same "consistency" as in the CAP theorem (Lesson 27).
          </p>
          <p>
            <strong>I: Isolation (transactions that run at the same time do not disturb each other).</strong> Ideally each
            transaction behaves <strong>as if it ran alone</strong>. In practice, databases offer different{" "}
            <strong>levels</strong> of isolation (below). A lower level is faster but less safe.
          </p>
          <p>
            <strong>D: Durability (committed means saved).</strong> Once the database says "committed", the data
            stays saved. It survives crashes and power cuts.
          </p>
          <h3 id="how-durability-works-the-write-ahead-log">How durability works: the write-ahead log</h3>
          <p>
            A database does not rewrite its data files directly on every change. That would be slow. A crash in the middle
            could also damage the files. Instead, it uses a <strong>write-ahead log (WAL)</strong>. The WAL is a file
            where the database first writes down every change, one after another. Here is the order:
          </p>
          <Flow
            caption="The write-ahead log. Commit means “the change is safe in the log on disk”, not “the data files are updated”."
            nodes={[
              { title: <>Append the change to the WAL</>, desc: <>sequential, fast</> },
              { title: <>Force the log to disk (fsync)</>, desc: <>fsync tells the operating system to really write to disk. Now it survives a power cut</> },
              { title: <>Reply “COMMIT OK”</>, desc: <>the app can move on</>, tone: "good" },
              { title: <>Apply to data files later</>, desc: <>in the background, in batches</> },
              {
                title: <>On crash &amp; restart</>,
                desc: <>replay the log to restore committed work; uncommitted work is dropped</>,
                tone: "warn",
              },
            ]}
          />
          <p>
            Appending to a log is fast, because it is sequential writing (one record after another, see Lesson 10). The same
            log is also used for <strong>replication</strong> (copying data to other servers, Lesson 24) and for{" "}
            <strong>point-in-time recovery</strong> (restoring the database to an exact moment, Part 7).
          </p>
          <h3 id="the-problems-isolation-prevents">The problems isolation prevents</h3>
          <p>
            An "anomaly" is a wrong result that can happen when transactions run at the same time. Here are the five
            classic ones. In the examples, T1 and T2 are two transactions.
          </p>
          <p>
            <strong>1. Dirty read: reading data that is not committed yet.</strong>
          </p>
          <CodeBlock code={code2} />
          <p>
            <strong>2. Non-repeatable read: you read the same row twice and get two different values.</strong>
          </p>
          <CodeBlock code={code3} />
          <p>
            <strong>3. Phantom read: you run the same query twice and new rows appear.</strong>
          </p>
          <CodeBlock code={code4} />
          <p>
            <strong>4. Lost update: two transactions read a value, change it and write it back. One write wipes out the other.</strong>
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
            <strong>5. Write skew: two transactions each check a rule, then together they break it.</strong> This is a
            classic example from Martin Kleppmann's book. A hospital needs{" "}
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
            Each transaction was fine <strong>on its own</strong>. Together they broke the rule. Each one{" "}
            <strong>changed a different row</strong>, based on a check that the other one made false. The concert seat
            and double-booking bugs are often write skew.
          </p>
          <h3 id="isolation-levels">Isolation levels</h3>
          <p>
            An <strong>isolation level</strong> is a setting that says which anomalies the database must prevent. The SQL
            standard defines four levels. A higher level is safer, but it can be slower or need more retries.
          </p>
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
            *Exact behaviour differs between databases. For example, PostgreSQL's Repeatable Read prevents phantoms and
            prevents lost updates on the same row (the second writer gets an error). But it still allows write skew.
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
            So <strong>by default, most databases do not prevent all anomalies.</strong> Many developers think "I am in
            a transaction, so I am safe". That is not always true.
          </p>
          <h3 id="how-databases-implement-isolation">How databases implement isolation</h3>
          <p>
            <strong>Locking (pessimistic).</strong> "Pessimistic" means you expect a clash, so you prevent it first. A
            transaction takes a <strong>lock</strong> on each row it reads or writes. A lock is a "do not touch" sign.
            Other transactions must wait until it is removed.
          </p>
          <ul>
            <li>
              The classic full version is <strong>two-phase locking (2PL)</strong>. A transaction takes locks while it
              works and releases them only at the end. This gives serializable isolation (the same result as if the
              transactions ran one at a time).
            </li>
            <li>
              It is safe, but it can cause waiting and <strong>deadlocks</strong> (Lesson 4). A deadlock is when two
              transactions each wait for a lock that the other one holds, so neither can go on. The database detects
              deadlocks and cancels one transaction.
            </li>
          </ul>
          <p>
            <strong>MVCC: Multi-Version Concurrency Control.</strong> Used by PostgreSQL, MySQL InnoDB, Oracle and
            others. The database keeps <strong>several versions</strong> of each row. Each transaction sees a{" "}
            <strong>snapshot</strong>. A snapshot is a consistent picture of the data as it was at one moment.
          </p>
          <CodeBlock code={code5} />
          <ul>
            <li>
              <strong>Readers do not block writers, and writers do not block readers.</strong> This is great for
              performance.
            </li>
            <li>
              Old versions must be cleaned up later. In PostgreSQL the cleanup job is called <strong>VACUUM</strong>.
            </li>
          </ul>
          <p>
            <strong>Serializable Snapshot Isolation (SSI).</strong> PostgreSQL's Serializable level uses snapshots and
            also tracks which transaction read what. If two transactions would cause an anomaly like write skew, the
            database stops one of them. It <strong>fails</strong> (often at commit) with a "could not serialize"
            error. <strong>Your app must retry it.</strong>
          </p>
          <p>
            <strong>Optimistic concurrency (in the app).</strong> "Optimistic" means you expect no clash, so you do not
            lock. You only check at the end. Add a <code>version</code> column and update the row only if the version
            has not changed:
          </p>
          <CodeBlock lang="sql" code={code6} />
          <p>
            This is common in web apps and APIs. The HTTP <code>ETag</code> and <code>If-Match</code> headers work the
            same way.
          </p>
          <h3 id="practical-tools-to-fix-real-bugs">Practical tools to fix real bugs</h3>
          <p>
            <strong>1. Let the database do the maths (atomic updates).</strong> An atomic operation is one step that cannot
            be split or interrupted. Do not read a value and then write it back from your app. Use one statement:
          </p>
          <CodeBlock lang="sql" code={code7} />
          <p>
            <strong>
              2. Lock the rows you are about to change (<code>SELECT ... FOR UPDATE</code>).
            </strong>
          </p>
          <CodeBlock lang="sql" code={code8} />
          <p>
            A second booking request waits for the lock. Then it sees <code>status = 'booked'</code>.
          </p>
          <p>
            <strong>3. Unique constraints as a safety net.</strong> A unique index tells the database to refuse duplicates.
          </p>
          <CodeBlock lang="sql" code={code9} />
          <p>Even if your code has a bug, the database refuses a second booking for the same seat.</p>
          <p>
            <strong>4. Use Serializable for tricky invariants,</strong> like the doctors rule. An invariant is a rule that
            must always be true. Also <strong>retry on serialization errors</strong>.
          </p>
          <p>
            <strong>5. Keep transactions short.</strong> Never keep a transaction open while you call an external API or
            wait for a user. A long transaction holds locks, blocks others and keeps old MVCC versions from being
            cleaned up.
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
            ACID works <strong>inside one database</strong>. Suppose an order service and a payment service each have their
            own database. You cannot wrap both in a single <code>BEGIN ... COMMIT</code>.
          </p>
          <ul>
            <li>
              <strong>Two-phase commit (2PC)</strong> can coordinate them. A coordinator first asks every database "can you
              commit?". If all say yes, it tells them to commit. But 2PC is slow and fragile. If the coordinator dies,
              everyone waits.
            </li>
            <li>
              Most microservice systems use <strong>sagas</strong> instead. A saga is a sequence of local transactions
              (one per service). If a step fails, <strong>compensating actions</strong> undo the earlier steps
              ("payment failed, so cancel the order"). Part 6 covers sagas.
            </li>
          </ul>
          <p>
            This is one reason people say "<strong>do not split your database until you have to</strong>".
          </p>
          <h3 id="acid-vs-base">ACID vs BASE</h3>
          <p>
            Some NoSQL systems describe themselves as <strong>BASE</strong>: <strong>B</strong>asically{" "}
            <strong>A</strong>vailable, <strong>S</strong>oft state, <strong>E</strong>ventually consistent. That means
            they prefer to stay available and fast, instead of giving strict transaction guarantees. "Soft state" means
            the data may change over time even without new input. "Eventually consistent" means all copies become equal
            after a short time. Many modern NoSQL databases now offer ACID transactions in limited forms (for example,
            within one partition, or at extra cost). Always check exactly what is guaranteed.
          </p>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Higher isolation</strong> means fewer bugs. But you get more locking, more cancelled transactions to
              retry, and sometimes lower throughput (fewer transactions per second).
            </li>
            <li>
              <strong>Lower isolation</strong> gives better performance. But you must think carefully about race
              conditions, often with explicit locks or atomic updates.
            </li>
            <li>
              <strong>Pessimistic locking</strong> is simple and certain. But it can cause waiting and deadlocks when many
              transactions compete for the same rows (contention).
            </li>
            <li>
              <strong>Optimistic concurrency</strong> has no waiting, but it needs retries. It is great when clashes are
              rare. It is poor when they are frequent (a flash sale on one item).
            </li>
            <li>
              <strong>Distributed transactions</strong> give correct results across systems, but they add complexity and
              delay. Sagas are usually preferred.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Ticket booking and flash sales.</strong> Movie, concert and train booking systems face exactly the
            "last seat" race when thousands of people try to book popular seats at once. They combine row locks or
            atomic updates, unique constraints, and often short "seat holds" with a timeout. This way, each seat is
            sold only once.
          </p>
          <p>
            <strong>Banking and payments.</strong> Every card payment, UPI transfer or bank transfer relies on atomic,
            durable transactions. Payment systems also keep <strong>ledgers</strong>, where every movement of money is
            written as entries that always balance. Payment companies are very careful about isolation, idempotency
            (doing an action twice has the same effect as doing it once, Lesson 34) and reconciliation (checking that
            two sets of records agree).
          </p>
          <p>
            <strong>Jepsen testing.</strong> Kyle Kingsbury's Jepsen project tests databases under network failures and
            has found cases where databases, including well-known ones, did not give the isolation or consistency that their
            documentation claimed. It reminds us to <strong>understand and test</strong> the guarantees that we
            depend on.
          </p>
          <p>
            <strong>Hermitage.</strong> Martin Kleppmann's open-source "Hermitage" project tests which anomalies each
            database's isolation levels actually prevent. It showed that the same level name (like "Repeatable Read")
            can mean quite different things in different databases.
          </p>
          <p>
            <strong>Inventory bugs in e-commerce.</strong> "Overselling" (selling more items than exist) is a common
            and costly bug. It is usually a lost update or write skew. The fix is almost always an atomic conditional
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
                      Atomicity: all of a transaction's changes happen, or none do. Consistency: the database moves
                      from one valid state to another, and constraints and invariants stay true. Isolation:
                      transactions that run at the same time do not see each other's unfinished work (up to the
                      isolation level you chose). Durability: once a transaction is committed, its data survives
                      crashes. The write-ahead log gives this.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is write skew, and which isolation level prevents it?</>,
                a: (
                  <>
                    <p>
                      Two transactions read the same condition. Each one updates a different row because of it. Together
                      they break a rule (the on-call doctors). Snapshot / Repeatable Read allows this. Serializable
                      prevents it. Or you can lock the rows you depend on with SELECT … FOR UPDATE.
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
                      = ? AND stock &gt; 0. Then check the affected row count. For more complex flows, lock the row
                      with SELECT … FOR UPDATE. Also keep a constraint (CHECK stock &gt;= 0) as a safety net.
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
                      consistent snapshot. Readers never block writers and writers never block readers. This gives
                      high concurrency. The cost is that old versions must be cleaned up (VACUUM in PostgreSQL).
                    </p>
                  </>
                ),
              },
              {
                q: <>What's PostgreSQL's default isolation level, and what does it allow?</>,
                a: (
                  <>
                    <p>
                      Read Committed. It prevents dirty reads. But it allows non-repeatable reads, phantoms, lost updates
                      in read-modify-write code, and write skew. Being inside a transaction does not by itself keep
                      you safe from race conditions.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you keep data consistent across two microservices with separate databases?</>,
                a: (
                  <>
                    <p>
                      Not with one ACID transaction. Two-phase commit is possible, but it is slow and fragile. Usually
                      you use a saga. A saga is a sequence of local transactions. Each one publishes an event. If a
                      later step fails, compensating actions (refund, cancel) undo the earlier steps. You also use
                      idempotent handlers (safe to run twice) and an outbox (a table in the same database that holds
                      the events to publish, so the data change and the event are saved together).
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
              <strong>dirty reads, non-repeatable reads, phantoms, lost updates and write skew</strong>. The{" "}
              <strong>default</strong> level of most databases does not prevent all of them.
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
