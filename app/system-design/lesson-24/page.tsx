import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { AsciiDiagram, Compare, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import ReplicationLag from "@/components/sd/widgets/ReplicationLag";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-24")!;

export const metadata: Metadata = {
  title: `Lesson 24 — ${lesson.title}`,
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

const diagram1 = `Refresh 1 ──► replica A (up to date)  → sees new comment
Refresh 2 ──► replica B (lagging)     → comment disappears!`;

const diagram2 = `[Leader: India] ◄────────► [Leader: Europe] ◄────────► [Leader: US]
    ▲ writes                    ▲ writes                  ▲ writes
 local users                 local users               local users`;

export default function SdLessonTwoFourPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Your whole app depends on <strong>one database server</strong>. Three things will eventually go wrong:
          </p>
          <ol>
            <li>
              <strong>It dies.</strong> A disk fails or the machine crashes, and the whole app is down until it's
              restored.
            </li>
            <li>
              <strong>It's overloaded with reads.</strong> The product pages, feeds and searches are 95% reads, and one
              machine can't keep up.
            </li>
            <li>
              <strong>Users are far away.</strong> Users in Europe wait 150 ms per query to reach your database in
              India.
            </li>
          </ol>
          <p>
            The answer to all three is <strong>replication</strong>: keeping{" "}
            <strong>copies of the same data on several machines</strong>. But copies bring new problems:
          </p>
          <ul>
            <li>Which copy accepts writes?</li>
            <li>What happens when copies disagree?</li>
            <li>
              Why does a user update their profile, refresh, and see the <strong>old</strong> data?
            </li>
          </ul>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about a <strong>school notice board system</strong>.
          </p>
          <ul>
            <li>
              The <strong>principal's office</strong> has the main notice board. Only the office <strong>writes</strong>{" "}
              new notices. (This is the <strong>leader</strong>.)
            </li>
            <li>
              Every classroom has a copy of the board. A student runner carries each new notice from the office to every
              classroom. Students read the notices in their own classroom. (These are the <strong>followers</strong>, or{" "}
              <strong>replicas</strong>.)
            </li>
          </ul>
          <p>
            It works well. Reading is spread across many classrooms, and if one classroom's board falls down, the others
            still have the notices. But:
          </p>
          <ul>
            <li>
              The runner takes time, so for a few minutes a classroom may show <strong>yesterday's</strong> notice. (
              <strong>Replication lag</strong>.)
            </li>
            <li>
              If the principal's office burns down, one classroom must become the new office. (<strong>Failover</strong>
              .)
            </li>
            <li>
              What if two rooms both think they're the office and post different notices? (<strong>Split brain</strong>
              .)
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="why-replicate">Why replicate?</h3>
          <ul>
            <li>
              <strong>High availability:</strong> if one machine dies, another has the data.
            </li>
            <li>
              <strong>Read scaling:</strong> spread reads across replicas.
            </li>
            <li>
              <strong>Lower latency:</strong> put replicas close to users in other regions.
            </li>
            <li>
              <strong>Backups and analytics:</strong> run heavy reports or backups on a replica without slowing the main
              database.
            </li>
          </ul>
          <h3 id="single-leader-replication-primary-replica">Single-leader replication (primary–replica)</h3>
          <p>This is the most common setup: PostgreSQL, MySQL, SQL Server, MongoDB replica sets and many more.</p>
          <Flow
            caption="Single-leader replication. One writer, many readers, one ordered log."
            nodes={[
              { title: <>App writes</>, desc: <>every INSERT/UPDATE/DELETE</> },
              {
                title: <>Leader / primary</>,
                desc: <>records each change in its log (WAL or binlog)</>,
                tone: "accent",
              },
              {
                title: <>Replicas 1, 2, 3</>,
                desc: <>replay the same changes in the same order</>,
                label: <>streams the log</>,
              },
              { title: <>App reads</>, desc: <>spread across replicas — and the leader</>, tone: "good" },
            ]}
          />
          <ol>
            <li>
              <strong>All writes go to the leader.</strong>
            </li>
            <li>
              The leader records every change in its <strong>log</strong> (the WAL in PostgreSQL, the binlog in MySQL).
            </li>
            <li>
              Replicas receive the log and <strong>replay</strong> the same changes, in the same order.
            </li>
            <li>
              <strong>Reads</strong> can go to the leader or to any replica.
            </li>
          </ol>
          <h3 id="synchronous-vs-asynchronous-replication">Synchronous vs asynchronous replication</h3>
          <p>
            <strong>Asynchronous (the most common default).</strong> The leader commits and replies "OK"{" "}
            <strong>without waiting</strong> for replicas.
          </p>
          <ul>
            <li>✅ Fast writes, and slow or broken replicas don't block the leader.</li>
            <li>
              ❌ If the leader dies, <strong>the most recent writes may not have reached any replica</strong>, so
              they're lost after failover.
            </li>
          </ul>
          <p>
            <strong>Synchronous.</strong> The leader waits until at least one replica confirms it has the change before
            replying "OK".
          </p>
          <ul>
            <li>✅ No data loss if the leader dies (a replica has everything).</li>
            <li>
              ❌ Slower writes. If that replica is slow or down, <strong>writes stall</strong>.
            </li>
          </ul>
          <p>
            <strong>Semi-synchronous (a common compromise).</strong> Wait for <strong>one</strong> replica to confirm,
            and replicate to the rest asynchronously. If the synchronous replica fails, another one takes over that
            role.
          </p>
          <Compare
            caption="When does the leader say “OK”?"
            columns={[
              {
                title: <>Asynchronous</>,
                items: [
                  { sign: "·", text: <>Commit → “OK” → replicas catch up later</> },
                  { sign: "+", text: <>Fast writes; slow replicas never block</> },
                  { sign: "-", text: <>Latest writes lost if the leader dies</> },
                  { sign: "-", text: <>Replicas can serve stale reads</> },
                ],
                verdict: <>The common default</>,
              },
              {
                title: <>Synchronous</>,
                items: [
                  { sign: "·", text: <>Commit → wait for replica ACK → “OK”</> },
                  { sign: "+", text: <>No data loss on leader failure</> },
                  { sign: "-", text: <>Every write pays the replica round trip</> },
                  { sign: "-", text: <>A slow replica stalls writes</> },
                ],
                verdict: <>Semi-sync: one sync replica, the rest async</>,
              },
            ]}
          />
          <h3 id="replication-lag-and-the-problems-it-causes">Replication lag and the problems it causes</h3>
          <p>
            With async replication, replicas are usually behind by milliseconds, but under heavy load it can be seconds
            or even minutes. This causes real user-facing bugs:
          </p>
          <p>
            <strong>1. Read-your-own-writes failure.</strong>
          </p>
          <ReplicationLag caption="Save a new name, then immediately read it back from a follower. Switch to synchronous replication and watch what you pay instead." />
          <p>The user thinks the update failed.</p>
          <p>Fixes:</p>
          <ul>
            <li>
              Read <strong>the user's own data</strong> (their profile, settings, recent posts) from the{" "}
              <strong>leader</strong>, at least for a short time after they write.
            </li>
            <li>
              Track the time or log position of the user's last write, and only read from replicas that have caught up
              to it.
            </li>
            <li>Update the UI locally (optimistic UI) so the user sees their change immediately.</li>
          </ul>
          <p>
            <strong>2. Monotonic reads (going back in time).</strong>
          </p>
          <AsciiDiagram text={diagram1} />
          <p>
            The fix is to send each user to the <strong>same replica</strong> (for example, choose it by hashing the
            user ID).
          </p>
          <p>
            <strong>3. Consistent prefix (effects before causes).</strong> In partitioned systems, you might see an
            answer before the question it replies to, because they came from different, differently lagging copies. The
            fix is to keep causally related writes together, which is covered more in post 28.
          </p>
          <p>
            <strong>Monitor replication lag</strong> and alert on it. If a replica falls too far behind, take it out of
            the read pool.
          </p>
          <h3 id="failover-when-the-leader-dies">Failover: when the leader dies</h3>
          <Flow
            caption="Failover, step by step. Each step has its own way to go wrong."
            nodes={[
              { title: <>Detect</>, desc: <>heartbeats time out — or was it just a network blip?</> },
              { title: <>Choose</>, desc: <>pick the most up-to-date replica</> },
              { title: <>Promote</>, desc: <>it becomes the new leader</> },
              { title: <>Redirect</>, desc: <>apps and other replicas send writes to it</> },
              {
                title: <>Fence</>,
                desc: <>make sure the old leader can never accept writes again (STONITH)</>,
                tone: "warn",
              },
            ]}
          />
          <p>It sounds simple, but it's one of the trickiest operations in databases:</p>
          <ul>
            <li>
              <strong>Lost writes (with async replication).</strong> Writes that only the old leader had are gone, or
              they cause conflicts when it returns.
            </li>
            <li>
              <strong>False alarms.</strong> A short network glitch can look like a dead leader. Failing over too
              eagerly causes unnecessary disruption.
            </li>
            <li>
              <strong>Split brain.</strong> The old leader wasn't really dead, just cut off, and now{" "}
              <strong>two leaders</strong> accept writes. Data diverges.
            </li>
          </ul>
          <p>
            <strong>Fencing</strong> prevents split brain: make sure the old leader is truly stopped, cut off from
            storage, or rejected by the system. A dramatic name for one fencing technique is "STONITH":{" "}
            <em>Shoot The Other Node In The Head</em>.
          </p>
          <p>
            <strong>Consensus algorithms.</strong> Deciding "who is the leader?" safely across machines, even when
            messages are delayed or lost, is exactly what consensus algorithms like <strong>Raft</strong> and{" "}
            <strong>Paxos</strong> solve. The machines vote, and a leader needs a <strong>majority</strong>. So a
            cluster of 3 survives 1 failure, and a cluster of 5 survives 2. Tools like <strong>etcd</strong>,{" "}
            <strong>ZooKeeper</strong> and <strong>Consul</strong> provide this, and many databases (CockroachDB, TiDB,
            MongoDB and others) build it in. For PostgreSQL, tools like Patroni handle automatic failover using etcd or
            similar.
          </p>
          <h3 id="multi-leader-replication">Multi-leader replication</h3>
          <p>
            Here, <strong>several nodes accept writes</strong>, often one leader per region, and they replicate to each
            other.
          </p>
          <AsciiDiagram text={diagram2} />
          <ul>
            <li>
              ✅ Fast writes for users in every region, and each region keeps working if the links between regions fail.
            </li>
            <li>
              ❌ <strong>Write conflicts.</strong> Two regions change the same record at the same time. Which wins?
            </li>
          </ul>
          <p>
            <strong>Conflict resolution strategies:</strong>
          </p>
          <ul>
            <li>
              <strong>Last-write-wins (LWW):</strong> keep the change with the latest timestamp. It's simple, but{" "}
              <strong>silently loses</strong> the other write, and clocks on different machines aren't perfectly in
              sync.
            </li>
            <li>
              <strong>Merge the values:</strong> for example, combine two sets of cart items.
            </li>
            <li>
              <strong>CRDTs (Conflict-free Replicated Data Types):</strong> special data structures (counters, sets,
              text) designed to merge automatically and correctly (post 28).
            </li>
            <li>
              <strong>Ask the user or the app:</strong> keep both versions and let the application decide.
            </li>
          </ul>
          <p>
            The best strategy is to <strong>avoid conflicts</strong>: route all writes for a given record (for example,
            a given user) to the same "home" region.
          </p>
          <p>
            Collaborative apps like Google Docs, and offline-capable mobile apps, are really multi-leader systems: every
            device accepts edits and syncs later.
          </p>
          <h3 id="leaderless-replication-dynamo-style">Leaderless replication (Dynamo-style)</h3>
          <p>
            There's no leader at all. The client (or a coordinator node) sends each write to{" "}
            <strong>several replicas at once</strong> and reads from several at once. This is used by Cassandra,
            ScyllaDB, Riak, and the original Amazon Dynamo.
          </p>
          <p>
            <strong>Quorums.</strong> With <strong>N</strong> copies of each piece of data:
          </p>
          <ul>
            <li>
              a write succeeds when <strong>W</strong> replicas confirm,
            </li>
            <li>
              a read asks <strong>R</strong> replicas and takes the newest value.
            </li>
          </ul>
          <p>
            If <strong>W + R &gt; N</strong>, every read overlaps with at least one replica that has the latest write.
          </p>
          <Stats
            caption="Quorums with N = 3 copies. If W + R > N, every read overlaps the latest write."
            stats={[
              { value: <>W=2, R=2</>, label: <>2 + 2 &gt; 3</>, sub: <>reads always see the latest write</> },
              { value: <>W=1, R=1</>, label: <>1 + 1 ≤ 3</>, sub: <>fastest, but reads may be stale</> },
              { value: <>W=3, R=1</>, label: <>fast reads</>, sub: <>but writes fail if any replica is down</> },
            ]}
          />
          <p>
            You can <strong>tune</strong> this per query. In Cassandra, for example, consistency levels like{" "}
            <code>ONE</code>, <code>QUORUM</code> and <code>ALL</code> let you trade speed against freshness.
          </p>
          <p>
            <strong>Keeping replicas in sync without a leader:</strong>
          </p>
          <ul>
            <li>
              <strong>Read repair:</strong> during a read, if one replica returns an old value, update it.
            </li>
            <li>
              <strong>Anti-entropy:</strong> background processes compare replicas (often using{" "}
              <strong>Merkle trees</strong>, hash trees that quickly find which ranges differ) and fix differences.
            </li>
            <li>
              <strong>Hinted handoff:</strong> if a replica is down, another node temporarily holds its writes and hands
              them over when it returns.
            </li>
            <li>
              <strong>Sloppy quorums:</strong> during failures, accept writes on "stand-in" nodes to stay available.
              This improves availability but weakens the W + R &gt; N guarantee.
            </li>
          </ul>
          <h3 id="how-changes-are-shipped">How changes are shipped</h3>
          <ul>
            <li>
              <strong>Statement-based:</strong> send the SQL statements. Risky, because functions like{" "}
              <code>NOW()</code> or <code>RAND()</code> can produce different results on each replica.
            </li>
            <li>
              <strong>Physical / WAL shipping:</strong> send the low-level disk changes. Exact, but tied to the same
              database version.
            </li>
            <li>
              <strong>Logical (row-based) replication:</strong> send "row X changed from A to B". It's flexible and
              works across versions. It's also the basis of <strong>Change Data Capture (CDC)</strong> (post 23, Part
              6).
            </li>
          </ul>
          <h3 id="comparison">Comparison</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Single-leader</th>
                  <th>Multi-leader</th>
                  <th>Leaderless</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Who accepts writes</td>
                  <td>One leader</td>
                  <td>Several leaders</td>
                  <td>Any replica (quorum)</td>
                </tr>
                <tr>
                  <td>Write conflicts</td>
                  <td>None (one writer)</td>
                  <td>Yes, must resolve</td>
                  <td>Yes, must resolve (versions, LWW)</td>
                </tr>
                <tr>
                  <td>Write availability during failures</td>
                  <td>Depends on failover</td>
                  <td>High</td>
                  <td>High</td>
                </tr>
                <tr>
                  <td>Complexity</td>
                  <td>Lowest</td>
                  <td>High</td>
                  <td>Medium–high</td>
                </tr>
                <tr>
                  <td>Examples</td>
                  <td>PostgreSQL, MySQL, MongoDB</td>
                  <td>Multi-region setups, offline/collab apps</td>
                  <td>Cassandra, ScyllaDB, DynamoDB-style</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Replicas scale reads, not writes.</strong> All writes still go to one leader in single-leader
              setups. To scale writes, you shard (post 25).
            </li>
            <li>
              <strong>Async replication</strong> gives fast writes, a possible loss of the latest writes on failover,
              and <strong>stale reads</strong>.
            </li>
            <li>
              <strong>Sync replication</strong> gives no loss, but slower writes that depend on replica health.
            </li>
            <li>
              <strong>Automatic failover</strong> means less downtime, but the risk of false failovers and split brain.
              Test it regularly.
            </li>
            <li>
              <strong>Multi-leader and leaderless</strong> give high availability and local writes, but conflicts and
              more complex reasoning.
            </li>
            <li>
              <strong>Replication is not a backup.</strong> A mistaken <code>DELETE</code> replicates to every copy
              within milliseconds. You still need backups (Part 7).
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>GitHub's October 2018 incident.</strong> A brief network problem (about 43 seconds) cut connectivity
            between GitHub's East Coast data centre and the rest of its network. Its automated failover system promoted
            database primaries on the <strong>West Coast</strong>. When connectivity returned, some writes existed only
            in the East and others only in the West, and the databases couldn't simply be merged. GitHub ran in a
            degraded state for about 24 hours while engineers carefully reconciled the data. It's one of the best public
            examples of how hard failover and split brain are.
          </p>
          <p>
            <strong>Read replicas in everyday apps.</strong> Managed services like Amazon RDS, Google Cloud SQL and
            Azure Database make adding read replicas a few clicks. Many teams then hit the "I updated my profile but see
            old data" bug, and fix it by reading the user's own data from the primary.
          </p>
          <p>
            <strong>Cassandra at Netflix and Apple.</strong> Leaderless, multi-data-centre Cassandra clusters are used
            for huge volumes of data like viewing history and service data. Tunable consistency lets teams choose, per
            query, between speed and freshness.
          </p>
          <p>
            <strong>Amazon's shopping cart.</strong> The Dynamo paper describes how the cart stays writable during
            failures using leaderless replication, and how conflicting versions are merged. The paper also admits a side
            effect: deleted items could occasionally <strong>reappear</strong> after a merge. It was accepted as a
            reasonable trade for never refusing "add to cart".
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What does replication give you, and what doesn't it?</>,
                a: (
                  <>
                    <p>
                      Availability (another copy survives a crash), read scaling, lower latency for distant users, and a
                      safe place for backups and reports. It does not scale writes in a single-leader setup, and it is
                      not a backup — a bad DELETE replicates everywhere within milliseconds.
                    </p>
                  </>
                ),
              },
              {
                q: <>A user updates their profile and sees the old version on refresh. Why, and how do you fix it?</>,
                a: (
                  <>
                    <p>
                      Asynchronous replication lag: the write went to the leader, the read hit a replica that hadn't
                      caught up. Serve a user's own data from the leader for a while after they write, route to replicas
                      that have reached the user's last write position, or show the change optimistically in the UI.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is split brain, and how do you prevent it?</>,
                a: (
                  <>
                    <p>
                      Two nodes both believe they are the leader and accept conflicting writes, usually after a network
                      partition triggers failover while the old leader is still alive. Prevent it with consensus-based
                      leader election that needs a majority (Raft, etcd) and fencing that stops the old leader from
                      writing.
                    </p>
                  </>
                ),
              },
              {
                q: <>Explain W + R &gt; N.</>,
                a: (
                  <>
                    <p>
                      With N replicas, a write waits for W acknowledgements and a read queries R replicas. If W + R &gt;
                      N, every read set overlaps every write set, so at least one replica in each read has the latest
                      value. Tuning W and R trades write latency, read latency and availability.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do multi-leader systems resolve conflicts?</>,
                a: (
                  <>
                    <p>
                      Last-write-wins by timestamp (simple, but silently drops writes and trusts clocks), merging
                      values, CRDTs that merge automatically, or keeping both versions for the app or user to resolve.
                      Best of all is avoiding conflicts by routing each record's writes to one home region.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why should a cluster have an odd number of voting nodes?</>,
                a: (
                  <>
                    <p>
                      A leader needs a majority. Three nodes survive one failure and five survive two; a fourth or sixth
                      node adds cost without adding tolerance, and even counts make ties possible.
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
              <strong>Replication</strong> keeps copies of data on multiple machines, for{" "}
              <strong>availability, read scaling, lower latency and safe reporting</strong>.
            </li>
            <li>
              <strong>Single-leader</strong> is the default: writes go to the leader, and replicas replay its log.{" "}
              <strong>Async</strong> is fast but risks lost writes and stale reads. <strong>Sync</strong> is safe but
              slower.
            </li>
            <li>
              <strong>Replication lag</strong> causes real bugs. Handle <strong>read-your-writes</strong> (read your own
              data from the leader) and <strong>monotonic reads</strong> (stick users to one replica).
            </li>
            <li>
              <strong>Failover</strong> is hard: watch for <strong>lost writes</strong> and <strong>split brain</strong>
              . Use <strong>fencing</strong> and <strong>consensus</strong> (Raft, etcd) to pick leaders safely.
            </li>
            <li>
              <strong>Multi-leader</strong> and <strong>leaderless (quorum)</strong> designs improve write availability
              but need <strong>conflict resolution</strong>. Remember that <strong>replication is not a backup</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann (chapter 5, "Replication")
            </li>
            <li>The PostgreSQL documentation chapter "High Availability, Load Balancing, and Replication"</li>
            <li>
              The Raft paper "In Search of an Understandable Consensus Algorithm" by Ongaro and Ousterhout, and the
              interactive Raft visualisation on its official website
            </li>
            <li>The Amazon Dynamo paper (SOSP 2007), for quorums, hinted handoff and read repair</li>
            <li>GitHub's post-incident analysis of the October 21, 2018 outage</li>
            <li>The System Design Primer on GitHub (section "Replication")</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
