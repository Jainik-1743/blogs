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
          <p>You've done everything right:</p>
          <ul>
            <li>indexes are tuned,</li>
            <li>you've upgraded to the biggest database server you can buy,</li>
            <li>five read replicas handle the reads,</li>
            <li>Redis caches the hot data.</li>
          </ul>
          <p>
            But the <strong>primary</strong> is still at 90% CPU, because <strong>every write</strong> (new orders,
            messages, likes) goes to that one machine. The data is also 8 TB and growing 1 TB a month, so backups take
            all night and schema changes take days.
          </p>
          <p>
            Replication copies the <strong>same</strong> data everywhere. It helps reads, but{" "}
            <strong>not writes or data size</strong>. To go further, you have to <strong>split the data itself</strong>{" "}
            across machines. That's <strong>sharding</strong>, also called <strong>horizontal partitioning</strong>.
            It's powerful, and one of the hardest changes to undo.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think of a <strong>national exam board</strong> with results for 50 million students.
          </p>
          <ul>
            <li>One office can't store and answer queries for all of them.</li>
            <li>
              So they split the work: students with roll numbers 1–10 million go to Office A, 10–20 million to Office B,
              and so on.
            </li>
            <li>
              Each office holds <strong>only its part</strong> and handles only its students' queries.
            </li>
            <li>
              A <strong>directory at the front</strong> tells you which office has which roll numbers.
            </li>
          </ul>
          <p>
            Each office is a <strong>shard</strong>, and the roll number is the <strong>shard key</strong>. Now:
          </p>
          <ul>
            <li>"Get result for roll number 12,345,678" → go straight to Office B. ✅ Fast.</li>
            <li>
              "Top 100 students in the country" → you must ask <strong>every</strong> office and combine the answers. ❌
              Slow.
            </li>
            <li>
              If one office gets far more queries than the others (all the toppers' families calling), it's a{" "}
              <strong>hot spot</strong>.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="first-make-sure-you-actually-need-sharding">First, make sure you actually need sharding</h3>
          <p>Sharding adds a lot of complexity. Try these first (roughly in order):</p>
          <ol>
            <li>
              <strong>Fix queries and indexes</strong> (posts 5 and 22).
            </li>
            <li>
              <strong>Cache</strong> hot reads (posts 15–16).
            </li>
            <li>
              <strong>Scale up</strong> the database machine (post 7).
            </li>
            <li>
              <strong>Add read replicas</strong> (post 24).
            </li>
            <li>
              <strong>Archive old data</strong> into cheaper storage.
            </li>
            <li>
              <strong>Split by function (vertical partitioning / federation):</strong> move separate features into
              separate databases, such as users in one database, orders in another, analytics in another. It's a simpler
              first step.
            </li>
          </ol>
          <CodeBlock code={code1} />
          <p>
            When a <strong>single table</strong> (like orders or messages) is still too big or too write-heavy for one
            machine, it's time to <strong>shard that table</strong>.
          </p>
          <Flow
            caption="The ladder to climb before sharding. Most teams never need the top rung."
            nodes={[
              { title: <>Fix queries and indexes</>, desc: <>lessons 5 and 22</> },
              { title: <>Cache hot reads</>, desc: <>lessons 15–16</> },
              { title: <>Scale up the database machine</>, desc: <>lesson 7</> },
              { title: <>Add read replicas</>, desc: <>lesson 24</> },
              { title: <>Archive old data</>, desc: <>into cheaper storage</> },
              { title: <>Split by function (federation)</>, desc: <>users DB, orders DB, messages DB</> },
              {
                title: <>Shard the one table that's still too big</>,
                desc: <>the last resort — hard to undo</>,
                tone: "warn",
              },
            ]}
          />
          <h3 id="sharding-strategies">Sharding strategies</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">1. Range-based sharding</h4>
          <p>
            Split by <strong>ranges</strong> of the shard key.
          </p>
          <CodeBlock code={code2} />
          <ul>
            <li>
              ✅ Simple, and <strong>range queries</strong> are efficient ("orders from 1–7 December" if sharded by
              date).
            </li>
            <li>
              ❌ <strong>Hot spots.</strong> If you shard by time,{" "}
              <strong>all new writes go to the latest shard</strong> while old shards sit idle. If one range is more
              popular, that shard is overloaded.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">2. Hash-based sharding</h4>
          <p>
            Apply a <strong>hash function</strong> to the key, then use the result to choose a shard.
          </p>
          <CodeBlock code={code3} />
          <ul>
            <li>
              ✅ <strong>Even distribution</strong>: similar keys land on different shards, so load spreads well.
            </li>
            <li>
              ❌ <strong>Range queries are scattered</strong> across all shards.
            </li>
            <li>
              ❌ With plain <code>% N</code>, <strong>changing the number of shards moves almost all the data</strong>{" "}
              (post 26 fixes this with consistent hashing).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">3. Directory-based (lookup) sharding</h4>
          <p>
            Keep a <strong>lookup table</strong> that says which shard holds each key or group of keys.
          </p>
          <CodeBlock code={code4} />
          <ul>
            <li>
              ✅ <strong>Very flexible</strong>: move one tenant to another shard just by updating the directory, and
              give huge customers their own shards.
            </li>
            <li>
              ❌ The directory is an extra lookup and a <strong>critical dependency</strong>, so it must be fast
              (cached) and highly available.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">4. Geo-based sharding</h4>
          <p>
            Split by <strong>region</strong>: Indian users' data in the Mumbai shard, EU users' data in the Frankfurt
            shard.
          </p>
          <ul>
            <li>
              ✅ Low latency for local users, and helps with <strong>data residency laws</strong>.
            </li>
            <li>❌ Uneven sizes, and users who travel or move need special handling.</li>
          </ul>
          <h3 id="choosing-a-shard-key-the-most-important-decision">
            Choosing a shard key: the most important decision
          </h3>
          <p>A good shard key:</p>
          <ol>
            <li>
              <strong>Spreads data and traffic evenly.</strong> It needs many distinct values (high cardinality),
              without a few extremely popular ones.
            </li>
            <li>
              <strong>Matches your most common queries</strong>, so most requests hit <strong>one shard</strong>.
            </li>
            <li>
              <strong>Keeps related data together</strong>, so things you read or change together live on the same
              shard.
            </li>
            <li>
              <strong>Rarely or never changes.</strong> Changing a row's shard key means moving it.
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
                  <td>Almost every query is within one customer; keeps the customer's data together</td>
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
                  <td>"My orders" is one shard; but "all orders for seller X" becomes a cross-shard query</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Bad shard keys:</strong>
          </p>
          <ul>
            <li>
              <code>country</code> (a few huge values),
            </li>
            <li>
              <code>created_at</code> alone (all writes hit the newest shard),
            </li>
            <li>
              <code>status</code> (only a handful of values).
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
            enormous: a celebrity with 100 million followers, or a huge enterprise customer. Fixes:
          </p>
          <ul>
            <li>give that key its own shard (directory-based),</li>
            <li>
              split the hot key further (for example, <code>celebrity_id + bucket_number</code>),
            </li>
            <li>cache aggressively in front of it.</li>
          </ul>
          <p>
            <strong>2. Cross-shard queries.</strong> Questions that don't include the shard key ("top-selling products
            this week", "search all users by email") must ask <strong>every shard</strong> and merge the results. This
            is called scatter-gather. It's slow, and gets slower as shards grow. Fixes:
          </p>
          <ul>
            <li>
              maintain <strong>separate indexes or tables</strong> keyed differently (for example, an{" "}
              <code>email → user_id</code> lookup table),
            </li>
            <li>
              send data to a <strong>search engine</strong> or <strong>analytics warehouse</strong> for cross-shard
              questions.
            </li>
          </ul>
          <p>
            <strong>3. Cross-shard transactions and joins.</strong> A transaction touching two shards is no longer a
            simple local transaction (post 21). Options:
          </p>
          <ul>
            <li>design so most transactions stay within one shard (that's what a good shard key does),</li>
            <li>use sagas or two-phase commit for the rare cross-shard cases,</li>
            <li>use a distributed SQL database that handles it for you, at some cost.</li>
          </ul>
          <p>
            <strong>4. Unique IDs across shards.</strong> Auto-increment IDs don't work: shard 1 and shard 2 would both
            create order <code>#1001</code>. Options:
          </p>
          <ul>
            <li>
              <strong>UUIDs</strong> (random; see the B-tree issues in post 22),
            </li>
            <li>
              <strong>UUIDv7</strong> or <strong>Snowflake-style IDs</strong> (timestamp + machine or shard ID +
              sequence, which are unique and roughly time-ordered),
            </li>
            <li>
              <strong>embed the shard ID in the ID itself</strong>, so you can route by looking at the ID.
            </li>
          </ul>
          <p>
            <strong>5. Rebalancing (resharding).</strong> Data grows unevenly, and eventually you need more shards.
            Moving data while the app is live is delicate. Common approaches:
          </p>
          <ul>
            <li>
              <strong>Many logical shards on few machines.</strong> Create, say, 1,024 logical shards from day one, but
              place them on 8 physical servers. When you need more capacity, <strong>move whole logical shards</strong>{" "}
              to new servers, with no need to re-split data.
            </li>
            <li>
              <strong>Consistent hashing</strong> (post 26), so adding a node moves only a small share of keys.
            </li>
            <li>
              <strong>Automatic splitting</strong> in some databases (DynamoDB, MongoDB, CockroachDB split ranges
              automatically as they grow).
            </li>
            <li>
              <strong>Online migration:</strong> copy data to the new shard, keep it in sync (dual writes or CDC),
              switch reads and writes, verify, then clean up.
            </li>
          </ul>
          <p>
            <strong>6. Operations multiply.</strong> Ten shards mean ten times the backups, monitoring, schema
            migrations and failovers. Automation becomes essential.
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
              <strong>ProxySQL</strong>,
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
              ✅ <strong>Scales writes and storage</strong> almost without limit, gives <strong>smaller, faster</strong>{" "}
              individual databases, and limits the <strong>blast radius</strong> (one shard failing affects only part of
              your users).
            </li>
            <li>
              ❌ <strong>Complexity everywhere:</strong> routing, cross-shard queries, transactions, IDs, rebalancing
              and operations.
            </li>
            <li>
              ❌ <strong>The shard key is very hard to change later.</strong> A wrong choice can haunt you for years.
            </li>
            <li>
              ❌ <strong>Some queries become expensive or need separate systems</strong> (search, analytics).
            </li>
          </ul>
          <p>
            <strong>When NOT to shard:</strong> when caching, replicas, better indexes, archiving or a bigger machine
            would solve the problem. Many companies run for years on a single well-tuned primary database. Shard when
            you have <strong>clear evidence</strong> that you've outgrown it, and plan it carefully.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Instagram's sharded PostgreSQL and IDs.</strong> Instagram split its data across thousands of{" "}
            <strong>logical shards</strong> mapped onto fewer physical PostgreSQL servers. It generated IDs that contain
            a <strong>timestamp, the logical shard ID and a sequence number</strong>, so IDs are unique, sortable by
            time, and tell you which shard holds the data.
          </p>
          <p>
            <strong>Pinterest's MySQL sharding.</strong> Pinterest sharded MySQL with IDs that include the{" "}
            <strong>shard ID</strong>, so any object can be found by looking at its ID. It also placed many logical
            shards on each physical server, so it could move shards between machines as it grew.
          </p>
          <p>
            <strong>Notion's sharding (2021).</strong> Notion's single PostgreSQL database was struggling as usage
            exploded. The team sharded it into <strong>480 logical shards</strong> spread across{" "}
            <strong>32 physical databases</strong>, sharded by <strong>workspace ID</strong>, so everything in one
            workspace stays together. They migrated live using double-writes, backfilling and careful verification.
          </p>
          <p>
            <strong>Figma's database scaling.</strong> Figma first split tables into separate databases by function
            (vertical partitioning), and later built horizontal sharding for its largest tables, including its own
            routing layer, while keeping PostgreSQL. Their write-ups are a great real example of the "try simpler steps
            first" order above.
          </p>
          <p>
            <strong>Vitess at YouTube and Slack.</strong> Vitess was created at YouTube to scale MySQL, and was later
            adopted by companies including Slack, which migrated its main databases to Vitess to handle growth, sharding
            largely by workspace.
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
                      Only when a single primary can no longer handle write volume or data size. First fix queries and
                      indexes, cache, scale up, add read replicas for reads, archive cold data, and split unrelated
                      features into separate databases. Shard the specific table that is still too big.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you choose a shard key?</>,
                a: (
                  <>
                    <p>
                      It should have high cardinality and spread load evenly, match the most common access pattern so
                      most requests hit one shard, keep data that's read or written together on the same shard, and
                      almost never change. For SaaS that's usually tenant_id; for chat, conversation_id.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you handle queries that don't include the shard key?</>,
                a: (
                  <>
                    <p>
                      Scatter-gather to every shard (acceptable only when rare), maintain a secondary lookup table keyed
                      the other way (email → user_id), or send data to a search engine or warehouse built for
                      cross-cutting queries.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you generate unique IDs across shards?</>,
                a: (
                  <>
                    <p>
                      Not with per-shard auto-increment. Use UUIDs (UUIDv7 for time order), or Snowflake-style 64-bit
                      IDs combining timestamp, shard or machine ID and a sequence — which also lets you route a request
                      by reading the ID.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you add capacity to a sharded database without downtime?</>,
                a: (
                  <>
                    <p>
                      Start with many logical shards mapped to few machines and move whole logical shards to new
                      servers. For a real re-split: copy the data, keep it in sync with CDC or dual writes, switch reads
                      then writes, verify, and clean up.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you deal with a celebrity or whale-customer hot key?</>,
                a: (
                  <>
                    <p>
                      Isolate it on its own shard (directory-based), split it further with a bucket suffix, and put
                      caching or read replicas in front of it. Consistent hashing alone doesn't help, because one key
                      always maps to one place.
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
              <strong>Sharding</strong> splits one dataset across machines to scale <strong>writes and storage</strong>.
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
