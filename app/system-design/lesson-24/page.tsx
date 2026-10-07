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
            Your whole app depends on <strong>one database server</strong>. Sooner or later, three things will go wrong:
          </p>
          <ol>
            <li>
              <strong>It dies.</strong> A disk fails or the machine crashes. The whole app is down until the database is
              restored.
            </li>
            <li>
              <strong>It is overloaded with reads.</strong> Product pages, feeds and searches are 95% reads. One machine
              cannot keep up.
            </li>
            <li>
              <strong>Users are far away.</strong> Users in Europe wait 150 ms for each query to reach your database in
              India.
            </li>
          </ol>
          <p>
            The answer to all three is <strong>replication</strong>. Replication means keeping{" "}
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
            Think about the <strong>notice boards in a school</strong>.
          </p>
          <ul>
            <li>
              The <strong>principal's office</strong> has the main notice board. Only the office <strong>writes</strong>{" "}
              new notices. (This is the <strong>leader</strong>.)
            </li>
            <li>
              Every classroom has a copy of the board. A student runner carries each new notice from the office to every
              classroom. Students read the notices in their own classroom. (These classrooms are the{" "}
              <strong>followers</strong>, also called <strong>replicas</strong>.)
            </li>
          </ul>
          <p>
            This works well. Reading is spread across many classrooms. If one classroom's board falls down, the others
            still have the notices. But there are problems:
          </p>
          <ul>
            <li>
              The runner takes time, so for a few minutes a classroom may show <strong>yesterday's</strong> notice. This
              delay is called <strong>replication lag</strong>.
            </li>
            <li>
              If the principal's office burns down, one classroom must become the new office. This switch is called{" "}
              <strong>failover</strong>.
            </li>
            <li>
              What if two rooms both think that they are the office, and they post different notices? This is called{" "}
              <strong>split brain</strong>.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="why-replicate">Why replicate?</h3>
          <ul>
            <li>
              <strong>High availability:</strong> the app stays up. If one machine dies, another one has the data.
            </li>
            <li>
              <strong>Read scaling:</strong> spread the reads across the replicas, so each machine does less work.
            </li>
            <li>
              <strong>Lower latency:</strong> put replicas close to users in other regions.
            </li>
            <li>
              <strong>Backups and analytics:</strong> run heavy reports or backups on a replica. The main database stays
              fast.
            </li>
          </ul>
          <h3 id="single-leader-replication-primary-replica">Single-leader replication (primary–replica)</h3>
          <p>
            In single-leader replication, one machine (the <strong>leader</strong>, also called the primary) accepts
            all writes. The other machines (the <strong>followers</strong>, also called replicas) copy its changes. This
            is the most common setup: PostgreSQL, MySQL, SQL Server, MongoDB replica sets and many more.
          </p>
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
              { title: <>App reads</>, desc: <>spread across replicas and the leader</>, tone: "good" },
            ]}
          />
          <ol>
            <li>
              <strong>All writes go to the leader.</strong>
            </li>
            <li>
              The leader records every change in its <strong>log</strong>. A log is a file where changes are written in
              order (the WAL in PostgreSQL, the binlog in MySQL).
            </li>
            <li>
              Replicas receive the log and <strong>replay</strong> the same changes, in the same order. Replaying means
              doing the same changes again on their own copy.
            </li>
            <li>
              <strong>Reads</strong> can go to the leader or to any replica.
            </li>
          </ol>
          <h3 id="synchronous-vs-asynchronous-replication">Synchronous vs asynchronous replication</h3>
          <p>
            <strong>Asynchronous (the most common default).</strong> To commit means to save a change for good. In
            asynchronous replication, the leader commits and replies "OK" <strong>without waiting</strong> for the
            replicas.
          </p>
          <ul>
            <li>✅ Fast writes. Slow or broken replicas do not block the leader.</li>
            <li>
              ❌ If the leader dies, <strong>the most recent writes may not have reached any replica</strong>. They
              are lost after failover.
            </li>
          </ul>
          <p>
            <strong>Synchronous.</strong> The leader waits until at least one replica confirms that it has the change.
            Only then does it reply "OK".
          </p>
          <ul>
            <li>✅ No data loss if the leader dies (a replica has everything).</li>
            <li>
              ❌ Slower writes. If that replica is slow or down, <strong>writes stop and wait</strong>.
            </li>
          </ul>
          <p>
            <strong>Semi-synchronous (a common compromise).</strong> The leader waits for <strong>one</strong> replica to
            confirm. It copies to the other replicas asynchronously. If the synchronous replica fails, another one takes
            over that role.
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
            With async replication, replicas are usually behind the leader by only milliseconds. Under heavy load they can
            be behind by seconds or even minutes. This delay is the <strong>replication lag</strong>. It causes bugs
            that users can see:
          </p>
          <p>
            <strong>1. Read-your-own-writes failure.</strong>
          </p>
          <ReplicationLag caption="Save a new name, then immediately read it back from a follower. Switch to synchronous replication and watch what you pay instead." />
          <p>
            The user saves a change, but the next read goes to a replica that has not received it yet. The user thinks
            the update failed.
          </p>
          <p>Fixes:</p>
          <ul>
            <li>
              Read <strong>the user's own data</strong> (their profile, settings, recent posts) from the{" "}
              <strong>leader</strong>, at least for a short time after they write.
            </li>
            <li>
              Remember the time (or log position) of the user's last write. Read only from replicas that have caught up
              to that point.
            </li>
            <li>Update the screen at once in the browser (optimistic UI), so the user sees their change immediately.</li>
          </ul>
          <p>
            <strong>2. Monotonic reads (going back in time).</strong> Monotonic means "never going backwards". Here, a user sees newer data and then older data.
          </p>
          <AsciiDiagram text={diagram1} />
          <p>
            The fix is to send each user to the <strong>same replica</strong> every time. For example, choose the replica
            by hashing the user ID (turning it into a number).
          </p>
          <p>
            <strong>3. Consistent prefix (effects before causes).</strong> In systems where data is split into
            partitions, you might see an answer before the question it replies to. The two came from different copies
            with different lag. The fix is to keep writes that depend on each other together. Lesson 28 covers this
            more.
          </p>
          <p>
            <strong>Monitor replication lag</strong> and set an alert for it. If a replica falls too far behind, remove it
            from the group of replicas that serve reads.
          </p>
          <h3 id="failover-when-the-leader-dies">Failover: when the leader dies</h3>
          <Flow
            caption="Failover, step by step. Each step has its own way to go wrong."
            nodes={[
              { title: <>Detect</>, desc: <>heartbeats (regular "I am alive" signals) time out. Or was it just a short network problem?</> },
              { title: <>Choose</>, desc: <>pick the most up-to-date replica</> },
              { title: <>Promote</>, desc: <>it becomes the new leader</> },
              { title: <>Redirect</>, desc: <>apps and other replicas send writes to it</> },
              {
                title: <>Fence</>,
                desc: <>make sure the old leader can never accept writes again (for example, STONITH)</>,
                tone: "warn",
              },
            ]}
          />
          <p>It sounds simple, but it is one of the hardest jobs in databases:</p>
          <ul>
            <li>
              <strong>Lost writes (with async replication).</strong> Writes that only the old leader had are lost. Or
              they cause conflicts when the old leader comes back.
            </li>
            <li>
              <strong>False alarms.</strong> A short network problem can look like a dead leader. If you fail over too
              quickly, you cause trouble for no reason.
            </li>
            <li>
              <strong>Split brain.</strong> The old leader was not really dead. It was only cut off. Now{" "}
              <strong>two leaders</strong> accept writes, and the data drifts apart.
            </li>
          </ul>
          <p>
            <strong>Fencing</strong> prevents split brain. You make sure the old leader is really stopped, cut off from
            storage, or refused by the rest of the system. One fencing method has a dramatic name: "STONITH", which
            means <em>Shoot The Other Node In The Head</em> (switch the old machine off by force).
          </p>
          <p>
            <strong>Consensus algorithms.</strong> Machines must decide "who is the leader?" in a safe way, even when
            messages are delayed or lost. Consensus algorithms like <strong>Raft</strong> and <strong>Paxos</strong>{" "}
            solve exactly this. The machines vote, and a leader needs a <strong>majority</strong> of the votes. So a
            cluster of 3 survives 1 failure, and a cluster of 5 survives 2. Tools like <strong>etcd</strong>,{" "}
            <strong>ZooKeeper</strong> and <strong>Consul</strong> give you this. Many databases (CockroachDB, TiDB,
            MongoDB and others) have it built in. For PostgreSQL, tools like Patroni handle automatic failover, using
            etcd or something similar.
          </p>
          <h3 id="multi-leader-replication">Multi-leader replication</h3>
          <p>
            Here, <strong>several nodes accept writes</strong>. Often there is one leader per region. They copy their
            changes to each other. (A node is one machine in the cluster.)
          </p>
          <AsciiDiagram text={diagram2} />
          <ul>
            <li>
              ✅ Fast writes for users in every region. Each region keeps working if the links between regions fail.
            </li>
            <li>
              ❌ <strong>Write conflicts.</strong> Two regions change the same record at the same time. Which change wins?
            </li>
          </ul>
          <p>
            <strong>Conflict resolution strategies:</strong>
          </p>
          <ul>
            <li>
              <strong>Last-write-wins (LWW):</strong> keep the change with the latest timestamp. It is simple. But it{" "}
              <strong>silently loses</strong> the other write. Also, the clocks of different machines are never
              perfectly in sync.
            </li>
            <li>
              <strong>Merge the values:</strong> for example, join two sets of cart items into one.
            </li>
            <li>
              <strong>CRDTs (Conflict-free Replicated Data Types):</strong> special data structures (counters, sets,
              text) that are built so that copies always merge automatically and correctly (Lesson 28).
            </li>
            <li>
              <strong>Ask the user or the app:</strong> keep both versions and let the application (or the user) decide.
            </li>
          </ul>
          <p>
            The best strategy is to <strong>avoid conflicts</strong>. Send all writes for one record (for example, one
            user) to the same "home" region.
          </p>
          <p>
            Collaborative apps like Google Docs, and mobile apps that work offline, are really multi-leader systems. Every
            device accepts edits and syncs them later.
          </p>
          <h3 id="leaderless-replication-dynamo-style">Leaderless replication (Dynamo-style)</h3>
          <p>
            There is no leader at all. The client (or a coordinator node) sends each write to{" "}
            <strong>several replicas at once</strong>. It also reads from several replicas at once. Cassandra, ScyllaDB,
            Riak and the original Amazon Dynamo (the system in the 2007 paper) work this way.
          </p>
          <p>
            <strong>Quorums.</strong> A quorum is the minimum number of replicas that must agree. Say there are{" "}
            <strong>N</strong> copies of each piece of data:
          </p>
          <ul>
            <li>
              a write succeeds when <strong>W</strong> replicas confirm,
            </li>
            <li>
              a read asks <strong>R</strong> replicas and takes the newest value that it gets.
            </li>
          </ul>
          <p>
            If <strong>W + R &gt; N</strong>, every read meets at least one replica that has the latest write. The reason:
            the replicas that took the write and the replicas that answer the read must share at least one machine.
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
            You can <strong>tune</strong> W and R for each query. In Cassandra, for example, consistency levels like{" "}
            <code>ONE</code>, <code>QUORUM</code> and <code>ALL</code> let you trade speed against freshness of data.
          </p>
          <p>
            <strong>How to keep replicas in sync without a leader:</strong>
          </p>
          <ul>
            <li>
              <strong>Read repair:</strong> during a read, if one replica returns an old value, the reader updates that
              replica with the newer value.
            </li>
            <li>
              <strong>Anti-entropy:</strong> background jobs compare the replicas and fix the differences. They often use{" "}
              <strong>Merkle trees</strong>. A Merkle tree is a tree of hashes (short fingerprints of data) that quickly
              shows which ranges of data differ.
            </li>
            <li>
              <strong>Hinted handoff:</strong> if a replica is down, another node keeps its writes for a while. It hands
              them over when the replica comes back.
            </li>
            <li>
              <strong>Sloppy quorums:</strong> during failures, accept writes on "stand-in" nodes to stay available.
              This improves availability. But it weakens the W + R &gt; N guarantee.
            </li>
          </ul>
          <h3 id="how-changes-are-shipped">How changes are shipped</h3>
          <ul>
            <li>
              <strong>Statement-based:</strong> send the SQL statements themselves. This is risky. Functions like{" "}
              <code>NOW()</code> or <code>RAND()</code> can give a different result on each replica.
            </li>
            <li>
              <strong>Physical / WAL shipping:</strong> send the low-level changes to the disk files. This is exact. But
              it only works between the same database versions.
            </li>
            <li>
              <strong>Logical (row-based) replication:</strong> send "row X changed from A to B". It is flexible and
              works across versions. It is also the basis of <strong>Change Data Capture (CDC)</strong>, which streams
              database changes to other systems (Lessons 19 and 23, Part 6).
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
                  <td>Cassandra, ScyllaDB, Riak, the original Amazon Dynamo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Replicas scale reads, not writes.</strong> In single-leader setups, all writes still go to one
              leader. To scale writes, you shard, which means you split the data across machines (Lesson 25).
            </li>
            <li>
              <strong>Async replication</strong> gives fast writes. The costs are a possible loss of the latest writes on
              failover, and <strong>stale reads</strong> (reads that return old data).
            </li>
            <li>
              <strong>Sync replication</strong> loses no data. But writes are slower, and they depend on the health of the
              replica.
            </li>
            <li>
              <strong>Automatic failover</strong> means less downtime. But there is a risk of false failovers and split
              brain. Test it regularly.
            </li>
            <li>
              <strong>Multi-leader and leaderless</strong> give high availability and local writes. But you get conflicts,
              and the system is harder to understand.
            </li>
            <li>
              <strong>Replication is not a backup.</strong> A <code>DELETE</code> by mistake is copied to every replica
              within milliseconds. You still need backups (Part 7).
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>GitHub's October 2018 incident.</strong> A short network problem (about 43 seconds) cut the link
            between GitHub's East Coast data centre and the rest of its network. Its automated failover system promoted
            database primaries on the <strong>West Coast</strong>. When the link came back, some writes existed only
            in the East and others only in the West. The databases could not simply be merged. GitHub ran in a
            degraded state for about 24 hours while engineers carefully fixed the data. It is one of the best public
            examples of how hard failover and split brain are.
          </p>
          <p>
            <strong>Read replicas in everyday apps.</strong> Managed services like Amazon RDS, Google Cloud SQL and
            Azure Database let you add read replicas with a few clicks. Many teams then meet the "I updated my profile
            but I see old data" bug. They fix it by reading the user's own data from the primary.
          </p>
          <p>
            <strong>Cassandra at Netflix and Apple.</strong> Leaderless Cassandra clusters that span several data centres hold huge
            amounts of data, such as viewing history and service data. Tunable consistency lets teams choose, for each
            query, between speed and freshness.
          </p>
          <p>
            <strong>Amazon's shopping cart.</strong> The Dynamo paper describes how the cart stays writable during
            failures by using leaderless replication, and how conflicting versions are merged. The paper also admits a
            side effect: deleted items could sometimes <strong>reappear</strong> after a merge. Amazon accepted this as a
            fair price for never refusing "add to cart".
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
                      It gives you availability (another copy survives a crash), read scaling, lower latency for distant
                      users, and a safe place to run backups and reports. It does not scale writes in a single-leader
                      setup. It is also not a backup, because a bad DELETE is copied everywhere within milliseconds.
                    </p>
                  </>
                ),
              },
              {
                q: <>A user updates their profile and sees the old version on refresh. Why, and how do you fix it?</>,
                a: (
                  <>
                    <p>
                      The cause is asynchronous replication lag. The write went to the leader, but the read hit a replica
                      that had not caught up. To fix it, serve a user's own data from the leader for a while after they
                      write. Or send reads only to replicas that have reached the user's last write position. Or show
                      the change in the UI at once (optimistic UI).
                    </p>
                  </>
                ),
              },
              {
                q: <>What is split brain, and how do you prevent it?</>,
                a: (
                  <>
                    <p>
                      Two nodes both believe that they are the leader, and they accept conflicting writes. This usually
                      happens after a network partition (a break in the network) triggers a failover while the old
                      leader is still alive. To prevent it, use leader election based on consensus that needs a
                      majority (Raft, etcd). Also use fencing, which stops the old leader from writing.
                    </p>
                  </>
                ),
              },
              {
                q: <>Explain W + R &gt; N.</>,
                a: (
                  <>
                    <p>
                      With N replicas, a write waits for W acknowledgements and a read asks R replicas. If W + R &gt;
                      N, every group of read replicas overlaps every group of write replicas. So at least one replica in
                      each read has the latest value. Changing W and R trades write latency, read latency and
                      availability against each other.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do multi-leader systems resolve conflicts?</>,
                a: (
                  <>
                    <p>
                      You can use last-write-wins by timestamp. It is simple, but it silently drops writes and it
                      trusts clocks. You can merge the values. You can use CRDTs, which merge automatically. Or you can
                      keep both versions for the app or the user to resolve. The best way is to avoid conflicts by
                      sending each record's writes to one home region.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why should a cluster have an odd number of voting nodes?</>,
                a: (
                  <>
                    <p>
                      A leader needs a majority. Three nodes survive one failure and five survive two. A fourth node
                      adds cost but still survives only one failure (a majority of 4 is 3). Even counts also make ties
                      possible.
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
              <strong>Replication</strong> keeps copies of data on many machines, for{" "}
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
