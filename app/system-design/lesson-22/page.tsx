import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Flow, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-22")!;

export const metadata: Metadata = {
  title: `Lesson 22 — ${lesson.title}`,
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

const code1 = `                     [  50  |  100  ]                  ← root page
                    /        |        \\
         [10 | 25 | 40]   [60 | 75 | 90]   [120 | 150]   ← internal pages
          /  |  |  \\        ...
     [1..9][10..24][25..39][40..49]  ...                 ← leaf pages (point to rows)`;

const code2 = `CREATE INDEX idx_orders_user_cover ON orders (user_id, created_at) INCLUDE (total, status);
-- SELECT created_at, total, status FROM orders WHERE user_id = 42 → index-only scan`;

const code3 = `CREATE INDEX idx_pending_orders ON orders (created_at) WHERE status = 'pending';`;

export default function SdLessonTwoTwoPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            In Lesson 5 we saw a query go from <strong>812 ms to 0.09 ms</strong> after we added an index. An index is an
            extra structure that the database keeps so that it can find rows fast. The improvement was big. But some
            questions remain:
          </p>
          <ul>
            <li>Why does an index make reads fast?</li>
            <li>Why do indexes make writes slower?</li>
            <li>
              Why can some databases (like Cassandra) handle millions of writes per second, while others (like
              PostgreSQL) are very good at complex reads?
            </li>
          </ul>
          <p>
            The answer is in the <strong>storage engine</strong>. The storage engine is the part of the database that
            decides how data is laid out and stored on disk. The two big families are <strong>B-trees</strong> and{" "}
            <strong>LSM-trees</strong>. A tree here means data arranged in levels, like a family tree. If you understand
            them, you can pick the right database and design the right indexes.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Imagine two ways to run a <strong>big library</strong>.
          </p>
          <p>
            <strong>Library 1: the carefully sorted shelves (B-tree).</strong>
          </p>
          <ul>
            <li>Every book has an exact place on a sorted shelf.</li>
            <li>Signs at the entrance say "A–F: floor 1", then "A–C: aisle 3", then "shelf 2".</li>
            <li>Finding a book takes only a few quick steps.</li>
            <li>
              But when a new book arrives, a librarian must walk to its exact spot and squeeze it in. If the shelf is
              full, some books must move to a new shelf.
            </li>
          </ul>
          <p>
            <strong>Library 2: the inbox and the nightly sort (LSM-tree).</strong>
          </p>
          <ul>
            <li>
              New books are dropped into a <strong>sorted tray at the front desk</strong>. This is very fast.
            </li>
            <li>
              When the tray is full, it is put in a box and stored as a <strong>sorted box</strong>. A box is never
              changed again.
            </li>
            <li>
              At night, staff <strong>merge</strong> several boxes into bigger sorted boxes. They also throw away
              outdated copies.
            </li>
            <li>
              To find a book, you may need to check the tray and then a few boxes. But there are tricks to skip boxes
              that surely do not have the book.
            </li>
          </ul>
          <p>
            <strong>B-trees are best for reading and for updating data in place. LSM-trees are best for writing fast.</strong>
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="why-we-need-indexes-at-all">Why we need indexes at all</h3>
          <p>
            Without an index, finding <code>WHERE email = 'asha@example.com'</code> means reading{" "}
            <strong>every row</strong>. This is a full scan, and the work grows with the number of rows n: O(n). With a
            sorted structure you can use <strong>binary search</strong>. Binary search checks the middle, then keeps only
            the half that can hold the answer, and repeats. The work grows very slowly: O(log n).
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rows</th>
                  <th>Full scan (worst case)</th>
                  <th>Sorted lookup (~log₂ n)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1,000</td>
                  <td>1,000 checks</td>
                  <td>~10</td>
                </tr>
                <tr>
                  <td>1,000,000</td>
                  <td>1,000,000</td>
                  <td>~20</td>
                </tr>
                <tr>
                  <td>1,000,000,000</td>
                  <td>1,000,000,000</td>
                  <td>~30</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>That is why indexes make such a big difference as tables grow.</p>
          <h3 id="b-trees-and-b-trees">B-trees (and B+trees)</h3>
          <p>
            A <strong>B-tree</strong> is a sorted tree that is <strong>wide and shallow</strong>. It is stored in
            fixed-size blocks called <strong>pages</strong> on disk (8 KB in PostgreSQL and 16 KB in MySQL InnoDB by
            default). Each page is one node of the tree.
          </p>
          <CodeBlock code={code1} />
          <ul>
            <li>
              Each page holds <strong>hundreds of keys</strong>, so every node has many children. This is called high{" "}
              <strong>fan-out</strong>.
            </li>
            <li>
              Because of that, even a billion rows need only about <strong>3–4 levels</strong>. That means{" "}
              <strong>3–4 page reads</strong> to find anything. The top levels are usually kept in memory, so often it
              is just 1–2 disk reads.
            </li>
            <li>
              In a <strong>B+tree</strong> (the version most databases really use), the bottom pages (leaves) are{" "}
              <strong>linked in order</strong>. So <strong>range queries</strong> (
              <code>WHERE created_at BETWEEN ...</code>) are fast. You find the start, then walk along the leaves.
            </li>
          </ul>
          <p>
            <strong>Writes in a B-tree:</strong>
          </p>
          <ol>
            <li>Find the right leaf page.</li>
            <li>
              Insert or update the key <strong>in place</strong>.
            </li>
            <li>
              If the page is full, <strong>split</strong> it into two and update the parent.
            </li>
          </ol>
          <p>
            Every write may touch several pages, in random places on disk. For crash safety, the change is written to the{" "}
            <strong>WAL</strong> (write-ahead log, a file of changes) first. See Lesson 21.
          </p>
          <p>
            <strong>B-trees are good for:</strong>
          </p>
          <ul>
            <li>fast point lookups (find one key) and range scans (find all keys between two values),</li>
            <li>predictable read speed,</li>
            <li>the default in PostgreSQL, MySQL InnoDB, SQL Server, Oracle and SQLite.</li>
          </ul>
          <h3 id="lsm-trees-log-structured-merge-trees">LSM-trees (Log-Structured Merge-trees)</h3>
          <p>
            An <strong>LSM-tree</strong> (Log-Structured Merge-tree) never updates data in place. It only adds new data
            and merges it later. These are the steps:
          </p>
          <Flow
            caption="The LSM-tree write path. Nothing on disk is ever changed. Data is only added, and merged later."
            nodes={[
              { title: <>Commit log</>, desc: <>added to the end of a file for crash safety (sequential)</> },
              { title: <>Memtable</>, desc: <>a sorted table in memory; the write is done here</> },
              {
                title: <>SSTables on disk</>,
                desc: <>immutable (never changed) sorted files, newest → oldest, each with a Bloom filter</>,
                label: <>when full, flush</>,
              },
              {
                title: <>Compaction</>,
                desc: <>a merge in the background; keep the newest version of each key, drop tombstones (delete markers)</>,
                tone: "good",
              },
            ]}
          />
          <p>
            <strong>Why writes are fast:</strong> a write is just an <strong>append</strong> to a log plus an insert in
            memory. Data goes to disk in big <strong>sequential</strong> chunks (one after another). This is good for
            both SSDs and spinning disks.
          </p>
          <p>
            <strong>Reads are more work:</strong>
          </p>
          <ol>
            <li>Check the memtable.</li>
            <li>
              Check the newest SSTable, then older ones, until you find the key. An SSTable (sorted string table) is
              one sorted file on disk.
            </li>
          </ol>
          <p>To keep this fast:</p>
          <ul>
            <li>
              <strong>Bloom filters.</strong> A <strong>Bloom filter</strong> is a small, compact structure that tells you
              "this key is <strong>definitely not</strong> in this file" or "it might be". It never gives a wrong "not
              here" answer. Each SSTable has one. So most files are skipped without reading them from disk.
            </li>
            <li>
              <strong>Sparse indexes</strong> inside each SSTable (an index with only some of the keys) let the engine jump
              close to the right spot.
            </li>
            <li>
              <strong>Compaction</strong> (merging files in the background) keeps the number of files small.
            </li>
          </ul>
          <p>
            <strong>Deletes</strong> are written as <strong>tombstones</strong>. A tombstone is a marker that says "key X
            was deleted". The data only really disappears when compaction runs.
          </p>
          <p>
            <strong>Compaction strategies:</strong>
          </p>
          <ul>
            <li>
              <strong>Size-tiered:</strong> merge files of similar size. Good for write-heavy loads. But it uses more
              temporary disk space.
            </li>
            <li>
              <strong>Levelled:</strong> organise files into levels. Inside one level, the files do not share any keys.
              Reads are better and less space is used. But data is rewritten more often.
            </li>
          </ul>
          <p>
            <strong>LSM-trees are used by:</strong> RocksDB and LevelDB (embedded engines), Cassandra, ScyllaDB, HBase,
            Google Bigtable, and the storage layers of many modern databases (CockroachDB and TiDB use LSM-based
            engines).
          </p>
          <h3 id="hash-indexes">Hash indexes</h3>
          <p>
            The simplest index is a <strong>hash map</strong>. It maps each key to a position on disk. It is very fast for
            exact lookups (<code>WHERE id = 42</code>). But it is <strong>useless for ranges</strong> (
            <code>WHERE id &gt; 42</code>) and for sorting. Some key-value stores use this design (for example, the
            Bitcask model). PostgreSQL also offers hash indexes, but B-trees are almost always the better choice.
          </p>
          <Compare
            caption="The two storage-engine families."
            columns={[
              {
                title: <>B-tree</>,
                items: [
                  { sign: "+", text: <>Point lookups and range scans in 3–4 page reads</> },
                  { sign: "+", text: <>Predictable reads; mature transactions</> },
                  { sign: "-", text: <>Random in-place writes; page splits</> },
                  { sign: "-", text: <>Suffers under random keys (UUIDv4)</> },
                ],
                verdict: <>PostgreSQL, MySQL InnoDB, SQL Server, Oracle, SQLite</>,
              },
              {
                title: <>LSM-tree</>,
                items: [
                  { sign: "+", text: <>Very high write throughput; sequential I/O</> },
                  { sign: "+", text: <>Compresses well</> },
                  { sign: "-", text: <>Reads may check several files (Bloom filters help)</> },
                  { sign: "-", text: <>Compaction costs CPU/disk; can cause latency spikes</> },
                ],
                verdict: <>Cassandra, ScyllaDB, RocksDB, HBase, Bigtable</>,
              },
            ]}
          />
          <h3 id="the-three-amplifications">The three "amplifications"</h3>
          <p>
            Engineers compare storage engines using three costs. "Amplification" means doing more work than the
            minimum:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Meaning</th>
                  <th>B-tree</th>
                  <th>LSM-tree</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Write amplification</strong>
                  </td>
                  <td>Bytes actually written to disk per byte you write</td>
                  <td>Medium (pages rewritten, plus WAL)</td>
                  <td>Can be high (data is rewritten during compaction), but the writes are sequential</td>
                </tr>
                <tr>
                  <td>
                    <strong>Read amplification</strong>
                  </td>
                  <td>Places you must check per read</td>
                  <td>Low (walk one tree)</td>
                  <td>Higher (memtable + several files), reduced by Bloom filters</td>
                </tr>
                <tr>
                  <td>
                    <strong>Space amplification</strong>
                  </td>
                  <td>Extra disk used beyond the real data</td>
                  <td>Some (half-empty pages after splits)</td>
                  <td>Old versions until compaction; lower with levelled compaction</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Roughly: <strong>B-trees are best for reads. LSM-trees are best for writes.</strong> Real performance
            depends a lot on the workload and the settings, so test with <em>your</em> own data.
          </p>
          <h3 id="types-of-indexes-you-ll-use">Types of indexes you will use</h3>
          <p>
            <strong>Clustered vs secondary (non-clustered).</strong>
          </p>
          <ul>
            <li>
              A <strong>clustered index</strong> stores the <strong>table rows themselves</strong> in index order. In
              MySQL InnoDB, the primary key is the clustered index. Lookups by primary key are very fast. A table can
              have only one clustered index.
            </li>
            <li>
              A <strong>secondary index</strong> is any other index. It stores the indexed column(s) plus a{" "}
              <strong>pointer</strong> to the row. In InnoDB the pointer is the primary key. In PostgreSQL it is the row
              location. Using it takes one lookup in the index plus one fetch of the row.
            </li>
          </ul>
          <p>
            <strong>Composite (multi-column).</strong> One index over several columns, for example{" "}
            <code>(country, city, created_at)</code>. It follows the left-prefix rule from Lesson 5: it can help a
            query on <code>country</code>, or on <code>country</code> and <code>city</code>, but not on{" "}
            <code>city</code> alone.
          </p>
          <p>
            <strong>Covering index.</strong> It contains <strong>all the columns a query needs</strong>. So the database
            never has to fetch the table row. The <code>INCLUDE</code> columns are stored in the index but are not
            part of the sort key:
          </p>
          <CodeBlock lang="sql" code={code2} />
          <p>
            <strong>Unique index.</strong> It does not allow two rows with the same value. It is the safety net from
            Lesson 21.
          </p>
          <p>
            <strong>Partial index.</strong> It only indexes the rows that match a condition. This saves space:
          </p>
          <CodeBlock lang="sql" code={code3} />
          <p>
            <strong>Specialised indexes</strong> (PostgreSQL examples):
          </p>
          <ul>
            <li>
              <strong>GIN</strong> (an inverted index, like the one in Lesson 19) for arrays, JSONB and full-text search,
            </li>
            <li>
              <strong>GiST / SP-GiST</strong> (flexible tree indexes) for shapes and map data,
            </li>
            <li>
              <strong>BRIN</strong> (a very small index that stores the min and max value of each block of rows) for huge
              tables whose rows are already in order, like time-series logs,
            </li>
            <li>
              <strong>geospatial indexes</strong> (PostGIS, geohashes) for "restaurants near me". PostGIS is a PostgreSQL
              extension for map data. A geohash is a short text code for a map area.
            </li>
          </ul>
          <h3 id="choosing-indexes-in-practice">Choosing indexes in practice</h3>
          <ol>
            <li>
              <strong>Start from real queries.</strong> Look at the slow-query log (a list of slow queries) and at the
              most frequent queries.
            </li>
            <li>
              <strong>
                Index columns used in <code>WHERE</code>, <code>JOIN</code> and <code>ORDER BY</code>
              </strong>
              . In a composite index, put the columns that you compare with equality first, and a range column last.
            </li>
            <li>
              <strong>
                Check with <code>EXPLAIN ANALYZE</code>
              </strong>{" "}
              (Lesson 5). It shows the plan the database really used and how long each step took.
            </li>
            <li>
              <strong>Do not add too many indexes.</strong> Each index slows every insert and update and uses memory. A
              write-heavy table with 15 indexes will struggle.
            </li>
            <li>
              <strong>Remove unused indexes.</strong> Most databases can tell you which indexes are never used.
            </li>
            <li>
              <strong>Watch for low-selectivity columns.</strong> Selectivity means how well a value narrows down the rows.
              An index on <code>is_active</code> (true/false) has low selectivity. It rarely helps on its own.
            </li>
            <li>
              <strong>Remember that indexes work best in memory.</strong> If your most-used indexes do not fit in RAM,
              performance drops sharply.
            </li>
          </ol>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <p>
            <strong>B-tree engines</strong>
          </p>
          <ul>
            <li>✅ Fast, predictable reads and range scans. Mature. Strong transaction support.</li>
            <li>❌ Random writes, and page splits under heavy insert load, especially with random keys like UUIDv4.</li>
          </ul>
          <p>
            <strong>LSM engines</strong>
          </p>
          <ul>
            <li>✅ Very high write throughput (many writes per second), sequential I/O (disk access in order) and good compression.</li>
            <li>
              ❌ Reads may check many files. Compaction uses background CPU and disk. It can cause latency spikes (sudden
              slow responses) if it falls behind. Tuning is harder.
            </li>
          </ul>
          <p>
            <strong>Indexes in general</strong>
          </p>
          <ul>
            <li>✅ Huge read speedups.</li>
            <li>❌ Slower writes, more storage and memory, and more choices for the query planner (the part of the database that picks how to run a query).</li>
          </ul>
          <p>
            <strong>Rule of thumb:</strong> apps with many reads, relational data and transactions usually suit B-tree
            databases. Massive streams of writes (events, logs, messages, metrics) suit LSM-based databases.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Facebook's MyRocks.</strong> Facebook built <strong>MyRocks</strong>. It replaces MySQL's InnoDB
            (B-tree) storage engine with <strong>RocksDB</strong> (LSM). For its main user database, this cut storage
            space and write amplification by a large amount. Engineers could keep using the same MySQL interface.
          </p>
          <p>
            <strong>Cassandra and ScyllaDB at Discord, Netflix and Apple.</strong> These LSM-based databases are chosen
            for huge write volumes such as messages, viewing history and events. In these cases fast appends matter more
            than complex queries.
          </p>
          <p>
            <strong>RocksDB everywhere.</strong> RocksDB was created at Facebook as a fork of Google's LevelDB. Many other systems embed it
            (run it inside themselves): databases like CockroachDB (in its earlier versions) and TiKV, and stream
            processors like Kafka Streams and Apache Flink (to keep local state). When you use these systems, you often
            use an LSM-tree underneath.
          </p>
          <p>
            <strong>UUID primary keys and B-trees.</strong> Many teams have seen insert speed drop after they switched
            to random UUIDv4 primary keys in B-tree databases. Random keys scatter the inserts across the whole
            index and cause many page splits. Time-ordered IDs (UUIDv7, Snowflake-style IDs) keep new keys close
            together, which fixes this.
          </p>
          <p>
            <strong>Geospatial search.</strong> Apps like food delivery or ride-hailing need "find drivers or
            restaurants near this location" queries. They use specialised spatial indexes (like PostGIS GiST indexes,
            geohashes or grid systems like Uber's H3) because a normal B-tree on latitude and longitude cannot answer
            "nearby" efficiently.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Why does a B-tree need only 3–4 reads for a billion rows?</>,
                a: (
                  <>
                    <p>
                      Each page holds hundreds of keys, so the fan-out (children per node) is huge. Roughly 500 × 500 ×
                      500 ≈ 125 million leaf pages at depth three. The top levels stay in memory, so a lookup is
                      often only one or two disk reads.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why are LSM-trees faster for writes?</>,
                a: (
                  <>
                    <p>
                      A write is an append to a sequential log plus an insert into an in-memory table. Data reaches disk
                      in large sequential flushes, never as random in-place updates. The cost moves to reads (which
                      may check several files) and to background compaction.
                    </p>
                  </>
                ),
              },
              {
                q: <>What does a Bloom filter do in an LSM engine?</>,
                a: (
                  <>
                    <p>
                      It is a small structure, one per SSTable, that answers “this key is definitely not here” or
                      “it might be here”. It is probabilistic: it can say “might be” by mistake, but never “not here”
                      by mistake. Reads skip most files without touching the disk. This keeps read amplification low.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is a covering index?</>,
                a: (
                  <>
                    <p>
                      It is an index that contains every column a query needs. The database answers from the index alone
                      (an index-only scan) and does not fetch table rows. Example: (user_id, created_at) INCLUDE
                      (total, status).
                    </p>
                  </>
                ),
              },
              {
                q: <>Why can random UUID primary keys hurt a B-tree database?</>,
                a: (
                  <>
                    <p>
                      Random keys land all over the index. So inserts touch random pages, cause frequent page splits and
                      need much more of the index to stay in memory. Time-ordered IDs (UUIDv7, Snowflake) keep inserts
                      near the right edge of the tree.
                    </p>
                  </>
                ),
              },
              {
                q: <>When would you not add an index?</>,
                a: (
                  <>
                    <p>
                      Do not add one on a write-heavy table when the query is rare. Do not add one on a
                      low-selectivity column (like a boolean) by itself. Do not add one when an existing composite
                      index already covers the query through its left prefix. Every index costs write time, disk space
                      and memory.
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
              Indexes turn <strong>O(n) scans</strong> into <strong>O(log n) lookups</strong>. This makes a huge
              difference as tables grow.
            </li>
            <li>
              <strong>B-trees</strong> keep data in <strong>sorted pages, updated in place</strong>: excellent for reads
              and ranges, and the default in most relational databases.
            </li>
            <li>
              <strong>LSM-trees</strong> <strong>append to memory and immutable files</strong>, then{" "}
              <strong>compact</strong> in the background. This is excellent for writes. <strong>Bloom filters</strong> keep
              reads fast enough.
            </li>
            <li>
              Engines trade <strong>write, read and space amplification</strong> against each other. Test with your own
              workload.
            </li>
            <li>
              Design indexes from <strong>real queries</strong> (composite, covering, partial, specialised). Avoid
              over-indexing, and prefer <strong>time-ordered keys</strong> in B-trees.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann (chapter 3, "Storage and Retrieval")
            </li>
            <li>
              <em>Database Internals</em> by Alex Petrov (Part I, on storage engines)
            </li>
            <li>The paper "The Log-Structured Merge-Tree (LSM-Tree)" by O'Neil et al. (1996)</li>
            <li>The RocksDB wiki on GitHub (compaction, Bloom filters, tuning)</li>
            <li>
              <em>Use The Index, Luke!</em> by Markus Winand
            </li>
            <li>CMU 15-445 Database Systems lectures on B+tree indexes</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
