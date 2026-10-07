import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Compare, Layers, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-28")!;

export const metadata: Metadata = {
  title: `Lesson 28 — ${lesson.title}`,
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

export default function SdLessonTwoEightPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Data is often stored in more than one place. Each stored copy is called a <strong>replica</strong>. When
            someone says "it's eventually consistent", it sounds safe. Here is what it can mean in practice:
          </p>
          <ul>
            <li>
              You post a comment, refresh, and it's <strong>gone</strong>. Refresh again and it's back.
            </li>
            <li>
              A friend replies to your message, but their reply shows up <strong>before</strong> your message.
            </li>
            <li>Your like count says 102 on your phone and 99 on your laptop.</li>
            <li>You change your password, and the old one still works for a minute.</li>
          </ul>
          <p>
            Some of these are fine. Others are serious bugs. What decides it is the <strong>consistency model</strong>.
            A consistency model is a set of rules that says <strong>what a reader is allowed to see</strong> when data
            has many copies. The last lesson (CAP) talked about "consistent or available". Here you will see that
            consistency is not just on or off. It is a <strong>spectrum</strong> (a range), and there are useful
            stops between the two ends.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about news spreading about a <strong>cricket match result</strong>.
          </p>
          <ul>
            <li>
              <strong>Strong consistency</strong> is like the <strong>stadium scoreboard</strong>. Everyone looking at
              it sees the same score at the same moment. When it changes, nobody can see the old score afterwards.
            </li>
            <li>
              <strong>Eventual consistency</strong> is like the news spreading through <strong>WhatsApp groups</strong>.
              Some people find out in seconds, others in minutes. For a while, different people "know" different scores.
              But if no new runs are scored, <strong>eventually</strong> everyone ends up with the same, correct score.
            </li>
            <li>
              <strong>The in-between models</strong> are guarantees like "you'll never see an <em>older</em> score after
              you've seen a newer one" or "you'll always see the score <em>you</em> posted".
            </li>
          </ul>
          <p>
            Stronger guarantees are easier to think about, but they cost more. They need the servers to talk to each
            other (coordination), they add delay (latency), and they can stop working during failures. Weaker
            guarantees are faster and stay available, but developers and users must handle the odd results.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="the-spectrum">The spectrum</h3>
          <Layers
            caption="The consistency spectrum, strongest first. Each step down is cheaper, faster and more available — and allows more surprises."
            layers={[
              {
                name: <>Linearizable</>,
                tech: <>acts like one copy, in real time</>,
                desc: <>money, uniqueness, locks</>,
              },
              {
                name: <>Sequential</>,
                tech: <>one agreed order for everyone</>,
                desc: <>mostly theory and CPU memory models</>,
              },
              { name: <>Causal</>, tech: <>causes are seen before effects</>, desc: <>comment threads, chat</> },
              {
                name: <>Session guarantees</>,
                tech: <>read-your-writes, monotonic reads</>,
                desc: <>what users notice most</>,
              },
              { name: <>Eventual</>, tech: <>copies agree… eventually</>, desc: <>counters, search, DNS, CDN</> },
            ]}
          />
          <h3 id="1-linearizability-strong-consistency">1. Linearizability (strong consistency)</h3>
          <p>
            Linearizability is a rule that says the system must behave <strong>as if there were only one copy of the
            data</strong>. Every operation seems to happen <strong>instantly</strong>, at one moment between its start
            and its finish. Think of one shared notebook that everyone reads and writes in turn.
          </p>
          <ul>
            <li>
              Once a write completes, <strong>every</strong> later read, by anyone, anywhere, sees it (or something
              newer).
            </li>
            <li>Once any reader sees a new value, no reader can see the old one again.</li>
          </ul>
          <p>
            <strong>Needed for:</strong>
          </p>
          <ul>
            <li>
              <strong>uniqueness</strong> (usernames, one booking per seat),
            </li>
            <li>
              <strong>locks and leader election</strong> (picking one server as the leader, and never two),
            </li>
            <li>
              <strong>account balances and money movement</strong>,
            </li>
            <li>
              <strong>"compare-and-set" operations</strong> (change a value only if it still has the value you
              expect, for example "set to 11 only if it is still 10").
            </li>
          </ul>
          <p>
            <strong>How it is done:</strong> read from the single leader, or use a consensus protocol. A consensus
            protocol (such as Raft or Paxos) is a set of steps that lets several servers agree on one value, even if
            some servers fail. Some systems also use carefully designed quorums. A quorum is a majority of the copies
            that must answer before an operation counts. <strong>Cost:</strong> extra messages between servers, and
            part of the system can become unavailable during a network partition (a break in the network, see CAP).
          </p>
          <h3 id="2-sequential-consistency">2. Sequential consistency</h3>
          <p>
            Sequential consistency is a rule that says all nodes (servers) see the operations in{" "}
            <strong>the same order</strong>, and each client's own operations stay in the order the client made them.
            But the shared order <strong>does not have to match real time</strong>. It is a little weaker than
            linearizable. You will mostly meet it in theory and in CPU memory models (the rules for how processor cores
            see each other's writes).
          </p>
          <h3 id="3-causal-consistency">3. Causal consistency</h3>
          <p>
            Causal consistency is a rule that says: if one event <strong>caused</strong> or depends on another, everyone
            sees them <strong>in that order</strong>. Events that are not related can show up in different orders for
            different people. Example: a reply must never appear before the question it answers.
          </p>
          <SequenceDiagram
            caption="Causal consistency. A reply is never visible without the message it answers; unrelated posts can arrive in any order."
            actors={["Asha", "Replica 1", "Replica 2", "Meera's phone"]}
            messages={[
              { from: 0, to: 1, label: <>“Anyone free for lunch?”</> },
              { from: 1, to: 2, label: <>replicate event 1</> },
              { from: 2, to: 3, label: <>event 1</> },
              { from: 3, to: 2, label: <>Ravi replies “Yes! 1 pm?”</>, note: <>depends on event 1</> },
              {
                from: 0,
                to: 0,
                label: <>Causal rule — anyone who sees the reply must already have seen the question</>,
                divider: true,
              },
            ]}
          />
          <p>
            Causal consistency is a good middle choice. It stops the most confusing problems (answers before
            questions, comments on posts you cannot see). It still allows high availability and speed.
          </p>
          <h3 id="4-session-guarantees-per-client-rules">4. Session guarantees (per-client rules)</h3>
          <p>
            Session guarantees are small promises made to one client (one user session). They are easy for users to
            notice. They were described in early research on distributed systems, and many databases and apps use them.
            Do not mix them up: causal consistency orders events for everyone, while a session guarantee only protects
            one user's own view.
          </p>
          <ul>
            <li>
              <strong>Read-your-writes:</strong> after <strong>you</strong> write something, <strong>you</strong> always
              see it. (Your comment doesn't vanish after refresh.)
            </li>
            <li>
              <strong>Monotonic reads:</strong> once you've seen a value, you never see an <strong>older</strong> one
              later. (Your like count never goes 102 → 99 → 102.)
            </li>
            <li>
              <strong>Monotonic writes:</strong> your writes are applied in the order you made them. (Changing your name
              to "A" and then "B" never ends up as "A".)
            </li>
            <li>
              <strong>Writes-follow-reads:</strong> if you read something and then write based on it, your write is
              ordered after what you read. (Your reply is never placed before the post you replied to.)
            </li>
          </ul>
          <p>
            Lesson 24 showed how to build the first two. Read a user's own data from the leader, and keep each user on
            the same replica.
          </p>
          <h3 id="5-eventual-consistency">5. Eventual consistency</h3>
          <p>
            Eventual consistency is a rule with one promise:{" "}
            <strong>if no new writes happen, all copies will end up with the same value.</strong> Ending up the same is
            called "converging". The rule does not say <strong>when</strong> this happens. It also does not say what
            you see before then.
          </p>
          <p>
            In practice, "eventually" is usually <strong>milliseconds to seconds</strong>. During failures or heavy
            load it can take much longer.
          </p>
          <p>
            <strong>Fine for:</strong>
          </p>
          <ul>
            <li>like and view counts,</li>
            <li>follower counts,</li>
            <li>"last active" status,</li>
            <li>search indexes,</li>
            <li>recommendation lists,</li>
            <li>CDN-cached pages,</li>
            <li>DNS.</li>
          </ul>
          <h3 id="how-copies-converge-handling-conflicts">How copies converge: handling conflicts</h3>
          <p>
            In multi-leader and leaderless systems (lesson 24), two copies can accept{" "}
            <strong>different writes to the same data at the same time</strong>. This is a conflict. Something must
            decide the final value. There are four common ways.
          </p>
          <p>
            <strong>Last-write-wins (LWW).</strong> This is a rule that gives each write a timestamp and keeps only the
            write with the latest one.
          </p>
          <ul>
            <li>✅ Simple, and used widely (Cassandra uses timestamps this way).</li>
            <li>
              ❌ <strong>Silently discards</strong> the other write.
            </li>
            <li>
              ❌ Relies on <strong>clocks</strong>, and clocks on different machines drift apart (see below).
            </li>
          </ul>
          <p>
            <strong>Version vectors (vector clocks).</strong> A version vector is a small list of counters, one per
            node. Each write carries the list, so it records which versions it has already seen. With this list the
            system can tell if one write <strong>came after</strong> another, or if the two writes were truly{" "}
            <strong>concurrent</strong> (made at the same time without seeing each other). Only concurrent writes are
            real conflicts. They can then be merged, or shown to the app. Amazon's Dynamo used vector clocks to find
            conflicting cart versions.
          </p>
          <p>
            <strong>CRDTs (Conflict-free Replicated Data Types).</strong> A CRDT is a data type built so that{" "}
            <strong>any two copies can always be merged automatically</strong>. The result is the same whatever order
            the merges happen in. Examples:
          </p>
          <ul>
            <li>
              <strong>G-Counter / PN-Counter:</strong> a G-Counter only counts up. Each replica counts its own
              increments, and the total is the sum. Two replicas that both add likes never lose any. A PN-Counter uses
              two G-Counters (one for adds, one for removes) so it can also count down.
            </li>
            <li>
              <strong>OR-Set (observed-remove set):</strong> a set where you can add and remove items (like cart
              items). A remove only deletes the adds that the remover had seen, so a new add made at the same time is
              kept.
            </li>
            <li>
              <strong>Sequence CRDTs:</strong> for collaborative text editing.
            </li>
          </ul>
          <p>
            CRDTs power features like collaborative editing and offline-first apps, and are available in some databases
            (for example, Riak, and Redis Enterprise's active-active mode).
          </p>
          <p>
            <strong>Application-level merge.</strong> Keep both versions and let the app, or the user, decide. For
            example: "This document was edited on two devices. Which version do you want to keep?"
          </p>
          <h3 id="time-and-ordering-why-clocks-are-tricky">Time and ordering: why clocks are tricky</h3>
          <p>
            Distributed systems often need to know <strong>what happened first</strong>. But:
          </p>
          <ul>
            <li>
              <strong>Physical clocks drift.</strong> A physical clock is the normal wall clock on a machine. Servers
              keep their clocks close using NTP (Network Time Protocol, which copies the time from a trusted server).
              They can still be off by milliseconds, and sometimes much more. A write with a "later" timestamp might
              really have happened <strong>earlier</strong>.
            </li>
            <li>
              <strong>Leap seconds and clock jumps</strong> have caused real outages. A leap second is one extra second
              that is added to the world clock now and then.
            </li>
          </ul>
          <p>Solutions:</p>
          <ul>
            <li>
              <strong>Lamport clocks:</strong> a Lamport clock is a simple counter. It goes up with every event, and
              it also jumps ahead when a message with a bigger number arrives. This gives an order that respects cause
              and effect, and it does not use wall-clock time. (Leslie Lamport's classic 1978 paper.)
            </li>
            <li>
              <strong>Hybrid Logical Clocks (HLC):</strong> an HLC joins physical time with a logical counter, so
              timestamps stay close to real time and still keep cause before effect. Databases like CockroachDB use
              them.
            </li>
            <li>
              <strong>TrueTime (Google Spanner):</strong> TrueTime is Google's clock service. Special time servers with
              GPS receivers and atomic clocks give each machine the current time{" "}
              <strong>plus an uncertainty range</strong> (a few milliseconds). Spanner deliberately{" "}
              <strong>waits out that uncertainty</strong> before it finishes a commit. This way, timestamps always
              match real-time order. That is how it offers strong consistency across the globe.
            </li>
          </ul>
          <h3 id="the-cost-of-strong-consistency">The cost of strong consistency</h3>
          <Stats
            caption="What strong consistency costs in latency."
            stats={[
              { value: <>~1–5 ms</>, label: <>eventual</>, sub: <>read the nearest copy</> },
              { value: <>~5–10 ms</>, label: <>strong, one region</>, sub: <>leader or quorum nearby</> },
              {
                value: <>~50–200+ ms</>,
                label: <>strong, across regions</>,
                sub: <>a global quorum crosses oceans on every write</>,
              },
            ]}
          />
          <p>
            Strong consistency across continents means waiting for messages to cross oceans. So global systems often
            keep <strong>most</strong> data eventually consistent. They make <strong>only the critical
            operations</strong> strongly consistent. (These times are typical rough numbers, not fixed rules.)
          </p>
          <Compare
            caption="Ways to merge two copies that accepted different writes at the same time."
            columns={[
              {
                title: <>Last-write-wins</>,
                items: [
                  { sign: "+", text: <>Trivial to implement</> },
                  { sign: "-", text: <>Silently drops the “losing” write</> },
                  { sign: "-", text: <>Trusts drifting clocks</> },
                ],
                verdict: <>Values where losing an update is acceptable</>,
              },
              {
                title: <>Version vectors</>,
                items: [
                  { sign: "+", text: <>Detect whether writes were truly concurrent</> },
                  { sign: "·", text: <>Conflicts go to the app to merge</> },
                ],
                verdict: <>Carts, documents (Dynamo)</>,
              },
              {
                title: <>CRDTs</>,
                items: [
                  { sign: "+", text: <>Always merge automatically, in any order</> },
                  { sign: "+", text: <>Counters, sets, collaborative text</> },
                  { sign: "-", text: <>Only for data types designed for it</> },
                ],
                verdict: <>Likes, offline-first apps, co-editing</>,
              },
            ]}
          />
          <h3 id="matching-models-to-features">Matching models to features</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Model it needs</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bank balance at withdrawal</td>
                  <td>
                    <strong>Linearizable</strong>
                  </td>
                  <td>Must never overspend</td>
                </tr>
                <tr>
                  <td>Username / seat booking</td>
                  <td>
                    <strong>Linearizable</strong> (or a unique constraint on one primary)
                  </td>
                  <td>Only one winner</td>
                </tr>
                <tr>
                  <td>My own profile after editing</td>
                  <td>
                    <strong>Read-your-writes</strong>
                  </td>
                  <td>Users think a save "failed" otherwise</td>
                </tr>
                <tr>
                  <td>Comment threads, chat</td>
                  <td>
                    <strong>Causal</strong>
                  </td>
                  <td>Replies must follow what they reply to</td>
                </tr>
                <tr>
                  <td>Feed scrolling</td>
                  <td>
                    <strong>Monotonic reads</strong>
                  </td>
                  <td>Items shouldn't flicker in and out</td>
                </tr>
                <tr>
                  <td>Shopping cart</td>
                  <td>
                    <strong>Eventual + good merging</strong> (CRDT-like)
                  </td>
                  <td>Always accept adds, merge later</td>
                </tr>
                <tr>
                  <td>Like / view counts</td>
                  <td>
                    <strong>Eventual</strong>
                  </td>
                  <td>Small delays are fine</td>
                </tr>
                <tr>
                  <td>Search results</td>
                  <td>
                    <strong>Eventual</strong>
                  </td>
                  <td>The index updates a second later</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Stronger models:</strong> simpler reasoning and fewer surprise bugs, but more latency, more
              coordination, and less availability during failures.
            </li>
            <li>
              <strong>Weaker models:</strong> fast, scalable and highly available, but you must handle stale reads,
              conflicts and odd orderings in your app and UI.
            </li>
            <li>
              <strong>Session guarantees and causal consistency</strong> are often the best value: they fix what users
              actually notice, without paying for global strong consistency.
            </li>
            <li>
              <strong>Conflict handling based on clocks (LWW)</strong> is easy, but it can lose data silently. Use it
              only where losing an update is acceptable.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Collaborative editing.</strong> Google Docs has long used a technique called{" "}
            <em>operational transformation</em>, which changes each edit so that edits made at the same time still fit
            together. Figma has described its multiplayer system as <strong>inspired by CRDTs</strong>, with a central
            server that orders the changes. Both let many people edit at once and still end up with the same document.
          </p>
          <p>
            <strong>Amazon's cart and "resurrected" items.</strong> In the Dynamo paper, Amazon explains that merging
            conflicting versions of a cart kept every "add", but that this could occasionally make{" "}
            <strong>deleted items reappear</strong>. Amazon accepted that trade, because losing an "add to cart" was
            worse.
          </p>
          <p>
            <strong>Social media counts.</strong> Like, view and follower counts on major platforms are eventually
            consistent. That's why a number can differ slightly between devices or jump after a refresh. For these
            features, speed and availability matter more than exactness.
          </p>
          <p>
            <strong>Cloudflare's leap-second bug.</strong> On 1 January 2017, a leap second made part of Cloudflare's
            DNS software calculate a <strong>negative time difference</strong>. The code did not expect this, so it
            failed and some customers saw errors. It is a real example of why relying on wall-clock time in
            distributed systems is risky.
          </p>
          <p>
            <strong>Google Spanner's TrueTime.</strong> Spanner is one of the few systems offering{" "}
            <strong>external consistency</strong> (a strong form of linearizability) globally. It's possible because of
            dedicated time infrastructure and a willingness to wait a few milliseconds on each commit.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What's the difference between linearizability and eventual consistency?</>,
                a: (
                  <>
                    <p>
                      Linearizability makes a replicated system behave like a single copy: once a write completes, every
                      later read anywhere sees it. Eventual consistency only promises that copies converge if writes
                      stop, with no bound on when and no guarantee about what you see meanwhile.
                    </p>
                  </>
                ),
              },
              {
                q: (
                  <>
                    A user posts a comment, refreshes, and it's gone. Which guarantee is missing, and how do you provide
                    it?
                  </>
                ),
                a: (
                  <>
                    <p>
                      Read-your-writes. Serve the user's own reads from the leader (or a replica that has caught up to
                      their last write position) for a while after they write, or keep the new comment in client state
                      until the server confirms it.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why is causal consistency often called a sweet spot?</>,
                a: (
                  <>
                    <p>
                      It stops the most confusing problems, such as replies before questions and comments on posts you
                      cannot see. It does this without asking every server to agree on every operation, so it stays
                      fast and available even during network partitions.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why is last-write-wins dangerous?</>,
                a: (
                  <>
                    <p>
                      It relies on timestamps from clocks that drift, so a write that really happened later can lose,
                      and the losing write is dropped with no error. Use it only where losing a concurrent update is
                      acceptable.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is a CRDT? Give an example.</>,
                a: (
                  <>
                    <p>
                      A CRDT is a replicated data type with a merge that gives the same result in any order and even if
                      it runs twice. (In technical words: the merge is commutative, associative and idempotent.) So each
                      replica can accept writes on its own and they still converge. A G-Counter keeps one count per
                      replica and adds them up, so concurrent likes are never lost.
                    </p>
                  </>
                ),
              },
              {
                q: <>How does Spanner achieve global strong consistency?</>,
                a: (
                  <>
                    <p>
                      TrueTime gives each server the current time with a known uncertainty range (it uses GPS and atomic
                      clocks). Spanner gives each commit a timestamp and waits out that uncertainty before the commit
                      becomes visible. So timestamp order matches real-time order. The data is also copied with Paxos.
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
              <strong>Consistency is a spectrum:</strong> linearizable → sequential → causal → session guarantees →
              eventual.
            </li>
            <li>
              <strong>Linearizability</strong> acts like one copy. It's needed for money, uniqueness and locks, but
              costs coordination and latency.
            </li>
            <li>
              <strong>Causal consistency</strong> and <strong>session guarantees</strong> (read-your-writes, monotonic
              reads) fix the anomalies users notice most, at a lower cost.
            </li>
            <li>
              <strong>Eventual consistency</strong> only promises convergence. Handle conflicts with{" "}
              <strong>LWW, version vectors, CRDTs or app-level merges</strong>.
            </li>
            <li>
              <strong>Clocks are unreliable</strong>, so use logical clocks, HLCs or TrueTime-style approaches.{" "}
              <strong>Match the model to each feature</strong>, rather than picking one for everything.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann (chapter 9, "Consistency and
              Consensus")
            </li>
            <li>The Jepsen website's interactive map of consistency models</li>
            <li>Werner Vogels' article "Eventually Consistent, Revisited"</li>
            <li>Doug Terry's paper "Replicated Data Consistency Explained Through Baseball"</li>
            <li>Leslie Lamport's paper "Time, Clocks, and the Ordering of Events in a Distributed System" (1978)</li>
            <li>The Google Spanner paper (OSDI 2012)</li>
            <li>The crdt.tech website for learning about CRDTs</li>
            <li>The System Design Primer on GitHub (section "Consistency patterns")</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
