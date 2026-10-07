import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { AsciiDiagram, Compare, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-25")!;

export const metadata: Metadata = {
  title: `Lesson 25 — ${lesson.title}`,
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

const code1 = `Before:  [ One DB: users + orders + products + messages ]
Federation:
         [ Users DB ]  [ Orders DB ]  [ Products DB ]  [ Messages DB ]`;

const code2 = `Shard 1: user_id 1 – 1,000,000
Shard 2: user_id 1,000,001 – 2,000,000
Shard 3: user_id 2,000,001 – 3,000,000`;

const code3 = `shard = hash(user_id) % number_of_shards

hash(42)   % 4 = 2 → Shard 2
hash(43)   % 4 = 0 → Shard 0
hash(9001) % 4 = 1 → Shard 1`;

const code4 = `tenant_id → shard
acme      → shard 3
globex    → shard 1
initech   → shard 3
bigcorp   → shard 7   (a huge customer, alone on its own shard)`;

const diagram1 = `Option A: App-level routing
   App code:  shard = lookup(user_id) → connect to that shard

Option B: A routing proxy
   App ──► [ Proxy / router ] ──► Shard 1, 2, 3...   (app thinks it's one database)

Option C: Built into the database
   Distributed databases route automatically`;

export default function SdLessonTwoFivePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>You have done everything right:</p>
          <ul>
            <li>indexes are tuned,</li>
            <li>you upgraded to the biggest database server you can buy,</li>
            <li>five read replicas handle the reads,</li>
            <li>Redis caches the hot data.</li>
          </ul>
          <p>
            But the <strong>primary</strong> (the one main database server that takes all writes) is still at 90% CPU.
            The reason is that <strong>every write</strong> (new orders, messages, likes) goes to that one machine. The
            data is also 8 TB and grows by 1 TB a month. Backups take all night and schema changes take days.
          </p>
          <p>
            Replication copies the <strong>same</strong> data to every machine. It helps reads, but{" "}
            <strong>it does not help writes or data size</strong>. To go further, you must{" "}
            <strong>split the data itself</strong> across machines. This is <strong>sharding</strong>, also called{" "}
            <strong>horizontal partitioning</strong>. Each part is called a shard. Sharding is powerful, and it is one of
            the hardest changes to undo.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think of a <strong>national exam board</strong> with results for 50 million students.
          </p>
          <ul>
            <li>One office cannot store and answer queries for all of them.</li>
            <li>
              So they split the work. Students with roll numbers 1–10 million go to Office A. Students with 10–20 million go
              to Office B. And so on.
            </li>
            <li>
              Each office holds <strong>only its part</strong> and handles only its students' queries.
            </li>
            <li>
              A <strong>directory at the front</strong> tells you which office has which roll numbers.
            </li>
          </ul>
          <p>
            Each office is a <strong>shard</strong>. The roll number is the <strong>shard key</strong>. A shard key is the
            field that decides which shard holds a row. Now look at these cases:
          </p>
          <ul>
            <li>"Get result for roll number 12,345,678" → go straight to Office B. ✅ Fast.</li>
            <li>
              "Top 100 students in the country" → you must ask <strong>every</strong> office and combine the answers. ❌
              Slow.
            </li>
            <li>
              If one office gets far more queries than the others (for example, all the toppers' families call it), it is
              a <strong>hot spot</strong>.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="first-make-sure-you-actually-need-sharding">First, make sure you actually need sharding</h3>
          <p>Sharding adds a lot of complexity. Try these steps first, roughly in this order:</p>
          <ol>
            <li>
              <strong>Fix queries and indexes</strong> (Lessons 5 and 22).
            </li>
            <li>
              <strong>Cache</strong> the most-read data (Lessons 15–16).
            </li>
            <li>
              <strong>Scale up</strong> the database machine: give it more CPU, memory and disk (Lesson 7).
            </li>
            <li>
              <strong>Add read replicas</strong>, which are read-only copies (Lesson 24).
            </li>
            <li>
              <strong>Archive old data</strong>: move it to cheaper storage.
            </li>
            <li>
              <strong>Split by function (vertical partitioning / federation):</strong> move separate features into
              separate databases. For example, users in one database, orders in another, and analytics in another. This
              is a simpler first step.
            </li>
          </ol>
          <CodeBlock code={code1} />
          <p>
            Sometimes a <strong>single table</strong> (like orders or messages) is still too big, or gets too many writes,
            for one machine. Then it is time to <strong>shard that table</strong>.
          </p>
          <Flow
            caption="The steps to try before sharding. Most teams never need the last step."
            nodes={[
              { title: <>Fix queries and indexes</>, desc: <>lessons 5 and 22</> },
              { title: <>Cache hot reads</>, desc: <>lessons 15–16</> },
              { title: <>Scale up the database machine</>, desc: <>lesson 7</> },
              { title: <>Add read replicas</>, desc: <>lesson 24</> },
              { title: <>Archive old data</>, desc: <>into cheaper storage</> },
              { title: <>Split by function (federation)</>, desc: <>users DB, orders DB, messages DB</> },
              {
                title: <>Shard the one table that's still too big</>,
                desc: <>the last resort; hard to undo</>,
                tone: "warn",
              },
            ]}
          />
          <h3 id="sharding-strategies">Sharding strategies</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">1. Range-based sharding</h4>
          <p>
            Split the data by <strong>ranges</strong> of the shard key.
          </p>
          <CodeBlock code={code2} />
          <ul>
            <li>
              ✅ Simple. <strong>Range queries</strong> (queries for all values between two limits) are efficient. For
              example, "orders from 1–7 December" if you shard by date.
            </li>
            <li>
              ❌ <strong>Hot spots.</strong> If you shard by time,{" "}
              <strong>all new writes go to the latest shard</strong>, while the old shards sit idle. If one range is more
              popular than the others, that shard is overloaded.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">2. Hash-based sharding</h4>
          <p>
            Apply a <strong>hash function</strong> to the key. A hash function turns any value into a number that looks
            random. Then use that number to choose a shard. The <code>%</code> sign means "remainder after division".
          </p>
          <CodeBlock code={code3} />
          <ul>
            <li>
              ✅ <strong>Even distribution</strong>: similar keys land on different shards, so the load spreads well.
            </li>
            <li>
              ❌ <strong>Range queries are scattered</strong>: the rows you need sit on all shards.
            </li>
            <li>
              ❌ With plain <code>% N</code>, <strong>changing the number of shards moves almost all the data</strong>{" "}
              (Lesson 26 fixes this with consistent hashing).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">3. Directory-based (lookup) sharding</h4>
          <p>
            Keep a <strong>lookup table</strong> (a directory) that says which shard holds each key or group of keys.
            In the example, a tenant is one customer company.
          </p>
          <CodeBlock code={code4} />
          <ul>
            <li>
              ✅ <strong>Very flexible</strong>: you can move one tenant to another shard by updating the directory. You
              can also give huge customers their own shards.
            </li>
            <li>
              ❌ The directory is an extra lookup and a <strong>critical dependency</strong> (if it fails, everything
              fails). So it must be fast (cached) and highly available.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">4. Geo-based sharding</h4>
          <p>
            Split by <strong>region</strong>. Indian users' data goes to the Mumbai shard. EU users' data goes to the
            Frankfurt shard.
          </p>
          <ul>
            <li>
              ✅ Low latency for local users. It also helps with <strong>data residency laws</strong> (laws that say data
              about citizens must stay in their country or region).
            </li>
            <li>❌ Shards have uneven sizes. Users who travel or move need special handling.</li>
          </ul>
          <h3 id="choosing-a-shard-key-the-most-important-decision">
            Choosing a shard key: the most important decision
          </h3>
          <p>A good shard key:</p>
          <ol>
            <li>
              <strong>Spreads data and traffic evenly.</strong> It needs many different values (this is called high
              cardinality). It should not have a few values that are extremely popular.
            </li>
            <li>
              <strong>Matches your most common queries</strong>, so most requests go to <strong>one shard</strong>.
            </li>
            <li>
              <strong>Keeps related data together</strong>, so data that you read or change together lives on the same
              shard.
            </li>
            <li>
              <strong>Rarely or never changes.</strong> If a row's shard key changes, the row must move to another shard.
            </li>
          </ol>
          <p>
            <strong>Examples:</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>App</th>
                  <th>Good shard key</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Multi-tenant SaaS (like Slack, Notion, Shopify)</td>
                  <td>
                    <code>tenant_id</code> / <code>workspace_id</code>
                  </td>
                  <td>Almost every query stays inside one customer. All of that customer's data is kept together</td>
                </tr>
                <tr>
                  <td>Social app</td>
                  <td>
                    <code>user_id</code>
                  </td>
                  <td>"My profile, my posts, my settings" are all on one shard</td>
                </tr>
                <tr>
                  <td>Chat app</td>
                  <td>
                    <code>channel_id</code> / <code>conversation_id</code>
                  </td>
                  <td>All messages in a conversation are together and ordered</td>
                </tr>
                <tr>
                  <td>E-commerce orders</td>
                  <td>
                    <code>customer_id</code>
                  </td>
                  <td>"My orders" is on one shard. But "all orders for seller X" becomes a cross-shard query (a query that needs several shards)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Bad shard keys:</strong>
          </p>
          <ul>
            <li>
              <code>country</code> (only a few values, and some are huge),
            </li>
            <li>
              <code>created_at</code> alone (all new writes hit the newest shard),
            </li>
            <li>
              <code>status</code> (only a few possible values).
            </li>
          </ul>
          <h3 id="the-hard-problems-sharding-creates">The hard problems sharding creates</h3>
          <Compare
            caption="Four ways to decide which shard owns a row."
            columns={[
              {
                title: <>Range</>,
                items: [
                  { sign: "+", text: <>Simple; range queries stay on one shard</> },
                  { sign: "-", text: <>Time-based keys send every new write to the newest shard</> },
                ],
                verdict: <>Naturally bounded ranges, archives</>,
              },
              {
                title: <>Hash</>,
                items: [
                  { sign: "+", text: <>Even spread of data and load</> },
                  { sign: "-", text: <>Range queries scatter to every shard</> },
                  { sign: "-", text: <>hash % N moves most data when N changes</> },
                ],
                verdict: <>Most general-purpose sharding</>,
              },
              {
                title: <>Directory</>,
                items: [
                  { sign: "+", text: <>Move any tenant by editing a lookup table</> },
                  { sign: "+", text: <>Give a whale customer its own shard</> },
                  { sign: "-", text: <>An extra lookup that must be fast and highly available</> },
                ],
                verdict: <>Multi-tenant SaaS</>,
              },
              {
                title: <>Geo</>,
                items: [
                  { sign: "+", text: <>Low latency for local users; data-residency laws</> },
                  { sign: "-", text: <>Uneven sizes; travelling users</> },
                ],
                verdict: <>Regulated or region-bound data</>,
              },
            ]}
          />
          <p>
            <strong>1. Hot spots and celebrity keys.</strong> Even with hashing, <strong>one key</strong> can be
            huge. Examples are a celebrity with 100 million followers, or a very large business customer. These are the
            fixes:
          </p>
          <ul>
            <li>give that key its own shard (directory-based sharding),</li>
            <li>
              split the hot key into smaller keys (for example, <code>celebrity_id + bucket_number</code>),
            </li>
            <li>put a strong cache in front of it.</li>
          </ul>
          <p>
            <strong>2. Cross-shard queries.</strong> Some questions do not include the shard key ("top-selling products
            this week", "search all users by email"). These must ask <strong>every shard</strong> and merge the
            results. This is called scatter-gather. It is slow, and it gets slower as the number of shards grows. These
            are the fixes:
          </p>
          <ul>
            <li>
              keep <strong>separate indexes or tables</strong> that use a different key (for example, an{" "}
              <code>email → user_id</code> lookup table),
            </li>
            <li>
              send the data to a <strong>search engine</strong> or an <strong>analytics warehouse</strong> (a database
              built for big reports) to answer cross-shard questions.
            </li>
          </ul>
          <p>
            <strong>3. Cross-shard transactions and joins.</strong> A transaction that touches two shards is no longer a
            simple local transaction (Lesson 21). These are your options:
          </p>
          <ul>
            <li>design so that most transactions stay within one shard (a good shard key does this),</li>
            <li>use sagas or two-phase commit for the rare cross-shard cases (Lesson 21),</li>
            <li>use a distributed SQL database that handles it for you, at some cost.</li>
          </ul>
          <p>
            <strong>4. Unique IDs across shards.</strong> Auto-increment IDs (a counter that adds 1 for each new row) do
            not work. Shard 1 and shard 2 would both create order <code>#1001</code>. These are your options:
          </p>
          <ul>
            <li>
              <strong>UUIDs</strong> (long random IDs; see the B-tree issues in Lesson 22),
            </li>
            <li>
              <strong>UUIDv7</strong> or <strong>Snowflake-style IDs</strong> (made from a timestamp, a machine or shard
              ID, and a sequence number; they are unique and roughly in time order),
            </li>
            <li>
              <strong>put the shard ID inside the ID itself</strong>, so you can find the shard by looking at the ID.
            </li>
          </ul>
          <p>
            <strong>5. Rebalancing (resharding).</strong> Data grows unevenly, and one day you need more shards. Moving
            data while the app is running is delicate. These are common approaches:
          </p>
          <ul>
            <li>
              <strong>Many logical shards on few machines.</strong> From day one, create many logical shards (say 1,024)
              and place them on a few physical servers (say 8). When you need more capacity,{" "}
              <strong>move whole logical shards</strong> to new servers. You never need to re-split the data.
            </li>
            <li>
              <strong>Consistent hashing</strong> (Lesson 26), so that adding a node moves only a small share of the keys.
            </li>
            <li>
              <strong>Automatic splitting</strong> in some databases. DynamoDB, MongoDB and CockroachDB split ranges
              by themselves as the data grows.
            </li>
            <li>
              <strong>Online migration:</strong> copy the data to the new shard and keep it in sync (with dual writes, or
              with CDC, which streams database changes). Then switch reads and writes, check the result, and clean up.
            </li>
          </ul>
          <p>
            <strong>6. Operations multiply.</strong> Ten shards mean ten times the backups, the monitoring, the schema
            changes and the failovers. Automation becomes a must.
          </p>
          <h3 id="how-requests-find-the-right-shard">How requests find the right shard</h3>
          <AsciiDiagram text={diagram1} />
          <p>
            <strong>Tools:</strong>
          </p>
          <ul>
            <li>
              <strong>Vitess</strong> (sharding for MySQL, originally built at YouTube),
            </li>
            <li>
              <strong>Citus</strong> (for PostgreSQL),
            </li>
            <li>
              <strong>ProxySQL</strong> (a proxy for MySQL that can route queries to different servers),
            </li>
            <li>MongoDB's built-in sharding,</li>
            <li>
              and fully distributed databases like DynamoDB, Cassandra, CockroachDB, YugabyteDB, TiDB and Spanner.
            </li>
          </ul>
          <Stats
            caption="The “many logical shards on few machines” trick, as used by Instagram, Pinterest and Notion."
            stats={[
              { value: <>480</>, label: <>logical shards</>, sub: <>fixed forever, keyed by workspace ID (Notion)</> },
              { value: <>32</>, label: <>physical databases</>, sub: <>15 logical shards each</> },
              { value: <>0</>, label: <>rows re-split</>, sub: <>to add capacity, just move whole logical shards</> },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅ <strong>Scales writes and storage</strong> almost without limit. Each database is{" "}
              <strong>smaller and faster</strong>. It also limits the <strong>blast radius</strong> (how much breaks when
              something fails): one failed shard affects only part of your users.
            </li>
            <li>
              ❌ <strong>Complexity everywhere:</strong> routing, cross-shard queries, transactions, IDs, rebalancing
              and operations.
            </li>
            <li>
              ❌ <strong>The shard key is very hard to change later.</strong> A wrong choice can cause trouble for years.
            </li>
            <li>
              ❌ <strong>Some queries become expensive or need separate systems</strong> (search, analytics).
            </li>
          </ul>
          <p>
            <strong>When NOT to shard:</strong> when caching, replicas, better indexes, archiving or a bigger machine
            would solve the problem. Many companies run for years on a single, well-tuned primary database. Shard when
            you have <strong>clear evidence</strong> that you have outgrown it. Then plan it with care.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Instagram's sharded PostgreSQL and IDs.</strong> Instagram split its data into thousands of{" "}
            <strong>logical shards</strong>. These were placed on fewer physical PostgreSQL servers. Its IDs contain a{" "}
            <strong>timestamp, the logical shard ID and a sequence number</strong>. So the IDs are unique, they sort by
            time, and they tell you which shard holds the data.
          </p>
          <p>
            <strong>Pinterest's MySQL sharding.</strong> Pinterest sharded MySQL. Its IDs include the{" "}
            <strong>shard ID</strong>, so you can find any object by looking at its ID. It also placed many logical
            shards on each physical server. So it could move shards between machines as it grew.
          </p>
          <p>
            <strong>Notion's sharding (2021).</strong> Notion's single PostgreSQL database was struggling as usage
            grew very fast. The team sharded it into <strong>480 logical shards</strong> spread across{" "}
            <strong>32 physical databases</strong>. The shard key is the <strong>workspace ID</strong>, so everything in
            one workspace stays together. They migrated while the app was live. They used double-writes (writing to old
            and new databases), backfilling (copying old data) and careful checks.
          </p>
          <p>
            <strong>Figma's database scaling.</strong> Figma first split tables into separate databases by function
            (vertical partitioning). Later it built horizontal sharding for its largest tables, including its own
            routing layer, and it kept PostgreSQL. Their write-ups are a good real example of the "try simpler steps
            first" order above.
          </p>
          <p>
            <strong>Vitess at YouTube and Slack.</strong> Vitess was created at YouTube to scale MySQL. Later, other companies adopted it. One is Slack,
            which moved its main databases to Vitess to handle growth. Slack shards largely by workspace.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>When should you shard, and what would you try first?</>,
                a: (
                  <>
                    <p>
                      Only when a single primary can no longer handle the write volume or the data size. First, fix
                      queries and indexes. Then cache, scale up, add read replicas for reads, archive cold data (data
                      that is rarely used), and split unrelated features into separate databases. Shard only the
                      specific table that is still too big.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you choose a shard key?</>,
                a: (
                  <>
                    <p>
                      It should have high cardinality (many different values) and spread the load evenly. It should
                      match the most common access pattern, so most requests hit one shard. It should keep data that
                      is read or written together on the same shard. And it should almost never change. For SaaS this
                      is usually tenant_id. For chat it is conversation_id.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you handle queries that don't include the shard key?</>,
                a: (
                  <>
                    <p>
                      You can use scatter-gather to every shard, but only when such queries are rare. You can keep a
                      second lookup table with the other key (email → user_id). Or you can send the data to a search
                      engine or a warehouse that is built for queries across all data.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you generate unique IDs across shards?</>,
                a: (
                  <>
                    <p>
                      Not with a separate auto-increment counter on each shard. Use UUIDs (UUIDv7 if you want time
                      order). Or use Snowflake-style 64-bit IDs that combine a timestamp, a shard or machine ID and a
                      sequence number. These IDs also let you find the right shard by reading the ID.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you add capacity to a sharded database without downtime?</>,
                a: (
                  <>
                    <p>
                      Start with many logical shards on a few machines. Later, move whole logical shards to new
                      servers. If you must really re-split the data, copy it, keep it in sync with CDC or dual
                      writes, switch reads and then writes, check the result, and clean up.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you deal with a celebrity or whale-customer hot key?</>,
                a: (
                  <>
                    <p>
                      Put it alone on its own shard (directory-based). Split it into smaller keys with a bucket suffix.
                      Put a cache or read replicas in front of it. Consistent hashing alone does not help, because one
                      key always maps to one place.
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
              <strong>Sharding</strong> splits one dataset across machines, to scale <strong>writes and storage</strong>.
              Replication alone only scales reads.
            </li>
            <li>
              Try <strong>indexes, caching, bigger machines, replicas, archiving and functional splits first</strong>.
            </li>
            <li>
              The strategies are <strong>range</strong>, <strong>hash</strong>, <strong>directory</strong> and{" "}
              <strong>geo</strong>. Each trades even distribution, range queries and flexibility differently.
            </li>
            <li>
              The <strong>shard key</strong> is the key decision: it should spread load evenly, match common queries,
              keep related data together, and rarely change.
            </li>
            <li>
              Plan for <strong>hot keys, cross-shard queries, global IDs and rebalancing</strong>. Use{" "}
              <strong>many logical shards</strong> so machines can be added later.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann (chapter 6, "Partitioning")
            </li>
            <li>The System Design Primer on GitHub (sections "Sharding" and "Federation")</li>
            <li>Azure Architecture Center pattern "Sharding"</li>
            <li>The Vitess documentation</li>
            <li>
              Engineering blog posts: "Sharding &amp; IDs at Instagram", Pinterest's "Sharding Pinterest: How we scaled
              our MySQL fleet", Notion's "Herding elephants: lessons learned from sharding Postgres at Notion", and
              Figma's posts on scaling its Postgres databases
            </li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
