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
            In post 5 we saw a query go from <strong>812 ms to 0.09 ms</strong> after adding an index. It looked like
            magic. But questions remain:
          </p>
          <ul>
            <li>Why does an index make reads fast?</li>
            <li>Why do indexes make writes slower?</li>
            <li>
              Why do some databases (like Cassandra) handle millions of writes per second, while others (like
              PostgreSQL) shine at complex reads?
            </li>
          </ul>
          <p>
            The answer is in the <strong>storage engine</strong>, the data structure the database uses to organise data
            on disk. The two big families are <strong>B-trees</strong> and <strong>LSM-trees</strong>. Understanding
            them helps you pick the right database and design the right indexes.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Imagine two ways of running a <strong>big library</strong>.
          </p>
          <p>
            <strong>Library 1: the carefully sorted shelves (B-tree).</strong>
          </p>
          <ul>
            <li>Every book has an exact place on a sorted shelf.</li>
            <li>Signs at the entrance say "A–F: floor 1", then "A–C: aisle 3", then "shelf 2".</li>
            <li>Finding a book takes a few quick steps.</li>
            <li>
              But when a new book arrives, a librarian must walk to its exact spot and squeeze it in. If the shelf is
              full, the books have to be split onto a new shelf.
            </li>
          </ul>
          <p>
            <strong>Library 2: the inbox and the nightly sort (LSM-tree).</strong>
          </p>
          <ul>
            <li>
              New books are dropped into a <strong>sorted tray at the front desk</strong>. That's very fast.
            </li>
            <li>
              When the tray fills up, it's boxed and stored as a <strong>sorted box</strong>, and never changed again.
            </li>
            <li>
              At night, staff <strong>merge</strong> several boxes into bigger sorted boxes and throw away outdated
              copies.
            </li>
            <li>
              Finding a book might mean checking the tray and then a few boxes, but there are tricks to skip boxes that
              definitely don't have it.
            </li>
          </ul>
          <p>
            <strong>B-trees optimise for reading and updating in place. LSM-trees optimise for writing fast.</strong>
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="why-we-need-indexes-at-all">Why we need indexes at all</h3>
          <p>
            Without an index, finding <code>WHERE email = 'asha@example.com'</code> means reading{" "}
            <strong>every row</strong>: a full scan, O(n). With a sorted structure, you can{" "}
            <strong>binary search</strong>: O(log n).
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
          <p>That's why indexes change everything as tables grow.</p>
          <h3 id="b-trees-and-b-trees">B-trees (and B+trees)</h3>
          <p>
            A <strong>B-tree</strong> is a <strong>wide, shallow, sorted tree</strong> stored in fixed-size{" "}
            <strong>pages</strong> on disk (often 8 KB in PostgreSQL and 16 KB in MySQL InnoDB).
          </p>
          <CodeBlock code={code1} />
          <ul>
            <li>
              Each page holds <strong>hundreds of keys</strong>, so the tree has high <strong>fan-out</strong>.
            </li>
            <li>
              Because of that, even a billion rows need only about <strong>3–4 levels</strong>, which means{" "}
              <strong>3–4 page reads</strong> to find anything. The top levels are usually in memory, so often it's just
              1–2 disk reads.
            </li>
            <li>
              In a <strong>B+tree</strong> (what most databases really use), the leaves are{" "}
              <strong>linked in order</strong>, so <strong>range queries</strong> (
              <code>WHERE created_at BETWEEN ...</code>) are fast: find the start, then walk along the leaves.
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
            Every write may touch several pages, in random places on disk. Updates are written to the{" "}
            <strong>WAL</strong> first for crash safety (post 21).
          </p>
          <p>
            <strong>B-trees are good for:</strong>
          </p>
          <ul>
            <li>fast point lookups and range scans,</li>
            <li>predictable read performance,</li>
            <li>the default in PostgreSQL, MySQL InnoDB, SQL Server, Oracle and SQLite.</li>
          </ul>
          <h3 id="lsm-trees-log-structured-merge-trees">LSM-trees (Log-Structured Merge-trees)</h3>
          <p>
            An <strong>LSM-tree</strong> never updates data in place. Instead:
          </p>
          <Flow
            caption="The LSM-tree write path. Nothing on disk is ever modified — only appended, then merged."
            nodes={[
              { title: <>Commit log</>, desc: <>append for crash safety — sequential</> },
              { title: <>Memtable</>, desc: <>sorted, in memory — the write is done here</> },
              {
                title: <>SSTables on disk</>,
                desc: <>immutable sorted files, newest → oldest, each with a Bloom filter</>,
                label: <>when full, flush</>,
              },
              {
                title: <>Compaction</>,
                desc: <>background merge; keep the newest version of each key, drop tombstones</>,
                tone: "good",
              },
            ]}
          />
          <p>
            <strong>Why writes are fast:</strong> writes are just an <strong>append</strong> to a log plus a memory
            insert. Disk writes happen in big <strong>sequential</strong> chunks, which is ideal for both SSDs and
            spinning disks.
          </p>
          <p>
            <strong>Reads are more work:</strong>
          </p>
          <ol>
            <li>Check the memtable.</li>
            <li>Check the newest SSTable, then older ones, until the key is found.</li>
          </ol>
          <p>To keep this fast:</p>
          <ul>
            <li>
              <strong>Bloom filters.</strong> Each SSTable has a small <strong>Bloom filter</strong>, a compact
              structure that can say "this key is <strong>definitely not</strong> in this file" (or "probably is"). Most
              files are skipped without touching disk.
            </li>
            <li>
              <strong>Sparse indexes</strong> inside each SSTable let the engine jump near the right spot.
            </li>
            <li>
              <strong>Compaction</strong> keeps the number of files small.
            </li>
          </ul>
          <p>
            <strong>Deletes</strong> are written as <strong>tombstones</strong> ("key X was deleted"). The data only
            truly disappears when compaction runs.
          </p>
          <p>
            <strong>Compaction strategies:</strong>
          </p>
          <ul>
            <li>
              <strong>Size-tiered:</strong> merge files of similar size. Good for write-heavy loads, but uses more
              temporary disk space.
            </li>
            <li>
              <strong>Levelled:</strong> organise files into levels with no overlapping keys within a level. Better
              reads and less space, but more rewriting.
            </li>
          </ul>
          <p>
            <strong>LSM-trees are used by:</strong> RocksDB and LevelDB (embedded engines), Cassandra, ScyllaDB, HBase,
            Google Bigtable, and the storage layers of many modern databases (CockroachDB and TiDB use LSM-based
            engines).
          </p>
          <h3 id="hash-indexes">Hash indexes</h3>
          <p>
            The simplest index is a <strong>hash map</strong> from key to position on disk. It's very fast for exact
            lookups (<code>WHERE id = 42</code>), but <strong>useless for ranges</strong> (<code>WHERE id &gt; 42</code>
            ) and sorting. Some key-value stores use this design (for example, the Bitcask model). PostgreSQL also
            offers hash indexes, but B-trees are almost always preferred.
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
          <p>Engineers compare storage engines using three costs:</p>
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
                  <td>Can be high (data rewritten during compaction), but it's sequential</td>
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
            Roughly: <strong>B-trees are read-optimised. LSM-trees are write-optimised.</strong> Real performance
            depends heavily on the workload and tuning, so benchmark with <em>your</em> data.
          </p>
          <h3 id="types-of-indexes-you-ll-use">Types of indexes you'll use</h3>
          <p>
            <strong>Clustered vs secondary (non-clustered).</strong>
          </p>
          <ul>
            <li>
              A <strong>clustered index</strong> stores the <strong>table rows themselves</strong> in index order. In
              MySQL InnoDB, the primary key is the clustered index. Lookups by primary key are very fast.
            </li>
            <li>
              A <strong>secondary index</strong> stores the indexed column(s) plus a <strong>pointer</strong> to the
              row: in InnoDB, the primary key; in PostgreSQL, a row location. Using it means one lookup in the index
              plus one fetch of the row.
            </li>
          </ul>
          <p>
            <strong>Composite (multi-column).</strong> <code>(country, city, created_at)</code>, with the left-prefix
            rule from post 5.
          </p>
          <p>
            <strong>Covering index.</strong> It contains <strong>all the columns a query needs</strong>, so the database
            never has to fetch the table row:
          </p>
          <CodeBlock lang="sql" code={code2} />
          <p>
            <strong>Unique index.</strong> It enforces uniqueness (and is the safety net from post 21).
          </p>
          <p>
            <strong>Partial index.</strong> It only indexes some rows, which saves space:
          </p>
          <CodeBlock lang="sql" code={code3} />
          <p>
            <strong>Specialised indexes</strong> (PostgreSQL examples):
          </p>
          <ul>
            <li>
              <strong>GIN</strong> for arrays, JSONB and full-text search,
            </li>
            <li>
              <strong>GiST / SP-GiST</strong> for geometric and geospatial data,
            </li>
            <li>
              <strong>BRIN</strong> for huge, naturally ordered tables like time-series logs,
            </li>
            <li>
              <strong>geospatial indexes</strong> (PostGIS, geohashes) for "restaurants near me".
            </li>
          </ul>
          <h3 id="choosing-indexes-in-practice">Choosing indexes in practice</h3>
          <ol>
            <li>
              <strong>Start from real queries.</strong> Look at slow-query logs and the most frequent queries.
            </li>
            <li>
              <strong>
                Index columns used in <code>WHERE</code>, <code>JOIN</code> and <code>ORDER BY</code>
              </strong>
              , and put the most selective (equality) columns first in composite indexes.
            </li>
            <li>
              <strong>
                Check with <code>EXPLAIN ANALYZE</code>
              </strong>{" "}
              (post 5).
            </li>
            <li>
              <strong>Don't over-index.</strong> Each index slows every insert and update and uses memory. A write-heavy
              table with 15 indexes will struggle.
            </li>
            <li>
              <strong>Remove unused indexes.</strong> Most databases can tell you which indexes are never used.
            </li>
            <li>
              <strong>Watch for low-selectivity columns.</strong> An index on <code>is_active</code> (true/false) rarely
              helps on its own.
            </li>
            <li>
              <strong>Remember that indexes live in memory best.</strong> If your hot indexes don't fit in RAM,
              performance drops sharply.
            </li>
          </ol>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <p>
            <strong>B-tree engines</strong>
          </p>
          <ul>
            <li>✅ Fast, predictable reads and range scans; mature; strong transactional support.</li>
            <li>❌ Random writes, and page splits under heavy insert load, especially with random keys like UUIDv4.</li>
          </ul>
          <p>
            <strong>LSM engines</strong>
          </p>
          <ul>
            <li>✅ Very high write throughput, sequential I/O and good compression.</li>
            <li>
              ❌ Reads may check multiple files. Compaction uses background CPU and disk, and can cause latency spikes
              if it falls behind. Tuning is more complex.
            </li>
          </ul>
          <p>
            <strong>Indexes in general</strong>
          </p>
          <ul>
            <li>✅ Huge read speedups.</li>
            <li>❌ Slower writes, more storage and memory, and more for the query planner to choose between.</li>
          </ul>
          <p>
            <strong>Rule of thumb:</strong> read-heavy, relational, transactional apps usually suit B-tree databases.
            Massive write-heavy streams (events, logs, messages, metrics) suit LSM-based databases.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Facebook's MyRocks.</strong> Facebook built <strong>MyRocks</strong>, which replaces MySQL's InnoDB
            (B-tree) storage engine with <strong>RocksDB</strong> (LSM). For its main user database, this significantly
            cut storage space and write amplification, while keeping the MySQL interface engineers already used.
          </p>
          <p>
            <strong>Cassandra and ScyllaDB at Discord, Netflix and Apple.</strong> These LSM-based databases are chosen
            for huge write volumes such as messages, viewing history and events, where fast appends matter more than
            complex queries.
          </p>
          <p>
            <strong>RocksDB everywhere.</strong> RocksDB, created at Facebook from Google's LevelDB, is embedded inside
            many other systems: databases like CockroachDB (in its earlier versions) and TiKV, stream processors like
            Kafka Streams and Apache Flink (for local state), and more. When you use these systems, you're often using
            an LSM-tree underneath.
          </p>
          <p>
            <strong>UUID primary keys and B-trees.</strong> Many teams have seen insert performance drop after switching
            to random UUIDv4 primary keys in B-tree databases, because random keys scatter inserts across the whole
            index and cause many page splits. Time-ordered IDs (UUIDv7, Snowflake-style IDs) keep new keys close
            together and fix this.
          </p>
          <p>
            <strong>Geospatial search.</strong> Apps like food delivery or ride-hailing need "find drivers or
            restaurants near this location" queries. They use specialised spatial indexes (like PostGIS GiST indexes,
            geohashes or grid systems like Uber's H3) because a normal B-tree on latitude and longitude doesn't answer
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
                      Each page holds hundreds of keys, so fan-out is huge: roughly 500 × 500 × 500 ≈ 125 million leaves
                      at depth three. The top levels stay in memory, so a lookup is often one or two disk reads.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why are LSM-trees faster for writes?</>,
                a: (
                  <>
                    <p>
                      A write is an append to a sequential log plus an insert into an in-memory table; data reaches disk
                      in large sequential flushes, never as random in-place updates. The cost moves to reads (checking
                      several files) and background compaction.
                    </p>
                  </>
                ),
              },
              {
                q: <>What does a Bloom filter do in an LSM engine?</>,
                a: (
                  <>
                    <p>
                      It's a small probabilistic structure per SSTable that answers “this key is definitely not here” or
                      “it might be here”. Reads skip most files without touching disk, keeping read amplification low.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is a covering index?</>,
                a: (
                  <>
                    <p>
                      An index containing every column a query needs, so the database answers from the index alone (an
                      index-only scan) without fetching table rows — for example (user_id, created_at) INCLUDE (total,
                      status).
                    </p>
                  </>
                ),
              },
              {
                q: <>Why can random UUID primary keys hurt a B-tree database?</>,
                a: (
                  <>
                    <p>
                      Random keys land all over the index, so inserts touch random pages, cause frequent page splits and
                      keep far more of the index hot in memory. Time-ordered IDs (UUIDv7, Snowflake) keep inserts near
                      the right edge of the tree.
                    </p>
                  </>
                ),
              },
              {
                q: <>When would you not add an index?</>,
                a: (
                  <>
                    <p>
                      On write-heavy tables where the query is rare, on low-selectivity columns (booleans) by
                      themselves, or when an existing composite index already covers it through its left prefix. Every
                      index costs write time, disk and memory.
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
              Indexes turn <strong>O(n) scans</strong> into <strong>O(log n) lookups</strong>, which makes an enormous
              difference as tables grow.
            </li>
            <li>
              <strong>B-trees</strong> keep data in <strong>sorted pages, updated in place</strong>: excellent for reads
              and ranges, and the default in most relational databases.
            </li>
            <li>
              <strong>LSM-trees</strong> <strong>append to memory and immutable files</strong>, then{" "}
              <strong>compact</strong> in the background: excellent for writes. <strong>Bloom filters</strong> keep
              reads reasonable.
            </li>
            <li>
              Engines trade <strong>write, read and space amplification</strong> against each other. Benchmark with your
              own workload.
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
