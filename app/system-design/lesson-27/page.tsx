import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Compare, Flow, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import CapPartition from "@/components/sd/widgets/CapPartition";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-27")!;

export const metadata: Metadata = {
  title: `Lesson 27 — ${lesson.title}`,
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

export default function SdLessonTwoSevenPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>Sooner or later, every system-design talk reaches the CAP theorem. A theorem is a rule that has been proved.
            You will hear lines like these:</p>
          <ul>
            <li>"MongoDB is CP."</li>
            <li>"Cassandra is AP."</li>
            <li>"You can only pick two out of three!"</li>
          </ul>
          <p>
            People repeat these lines, but most cannot explain what they mean. Many of the lines are{" "}
            <strong>misleading or wrong</strong>.
          </p>
          <p>
            If you understand CAP well, you can answer a real design question:{" "}
            <strong>
              when the network between my servers breaks, what should my system do? Should it refuse requests, or risk
              giving out-of-date answers?
            </strong>{" "}
            PACELC (a longer version of CAP) adds a question that matters <strong>every single day</strong>, even when
            nothing is broken.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Imagine a bank with <strong>two branches</strong>, Mumbai and Delhi. They share account balances by phone. One
            day the <strong>phone line between them goes dead</strong>. You walk into the Delhi branch to withdraw
            ₹10,000.
          </p>
          <p>The Delhi branch has two choices:</p>
          <ol>
            <li>
              <strong>Refuse</strong> (or make you wait): "Sorry, we cannot confirm your latest balance with Mumbai right
              now." This keeps the data <strong>consistent</strong>. Nobody can overdraw by withdrawing in both cities.
              But the branch is <strong>not available</strong> to you.
            </li>
            <li>
              <strong>Allow it</strong>, based on Delhi's last known balance. The branch stays{" "}
              <strong>available</strong>. But the balance might be <strong>wrong</strong>, because maybe you just
              withdrew in Mumbai too. The two branches now <strong>disagree</strong>.
            </li>
          </ol>
          <p>
            There is no third option that gives you both, <strong>while the line is down</strong>. That is the CAP
            theorem. The three letters stand for Consistency, Availability and Partition tolerance.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="the-three-letters-precisely">The three letters, precisely</h3>
          <p>
            <strong>
              C: Consistency (in CAP, this means <em>linearizability</em>).
            </strong>{" "}
            Every read sees the <strong>most recent write</strong>, as if there were only <strong>one copy</strong> of
            the data. Once anyone sees a new value, nobody sees the old value afterwards. (Linearizability is the
            strict name for this behaviour.)
          </p>
          <blockquote>
            <p>
              ⚠️ This is <strong>not</strong> the "C" in ACID (Lesson 21). It is the same word with a different meaning.
            </p>
          </blockquote>
          <p>
            <strong>A: Availability.</strong> Every request to a <strong>working (non-failed) node</strong> gets a{" "}
            <strong>response</strong>. It is not an error and not an endless wait. But the data in the response might
            not be the latest. (A node is one machine in the system.)
          </p>
          <p>
            <strong>P: Partition tolerance.</strong> A network partition is a network failure that splits the nodes into
            groups, and the groups cannot talk to each other. Partition tolerance means the system keeps working even
            when the <strong>network drops or delays messages</strong> between nodes.
          </p>
          <h3 id="what-cap-actually-says">What CAP actually says</h3>
          <blockquote>
            <p>
              <strong>
                When a network partition happens, a distributed system (a system of many machines that work together)
                must choose between consistency and availability.
              </strong>
            </p>
          </blockquote>
          <CapPartition caption="Two replicas (copies) of one balance. Write, then cut the network and try writing and reading on both sides. Do it first as a CP system, then as an AP one." />
          <h3 id="why-pick-two-of-three-is-misleading">Why "pick two of three" is misleading</h3>
          <p>
            The popular triangle suggests that you can pick <strong>CA</strong>: consistent and available, but not
            partition-tolerant. In a real distributed system, <strong>you cannot opt out of partitions</strong>.
            Networks <strong>will</strong> drop packets, switches will fail, cables will be cut, and cloud zones will
            lose connection to each other. A partition <em>happens to you</em>. It is not a feature that you choose.
          </p>
          <p>So the real choice is:</p>
          <blockquote>
            <p>
              <strong>When a partition happens: C or A?</strong>
            </p>
          </blockquote>
          <p>
            And <strong>when there is no partition, you can have both</strong>. CAP says nothing about normal operation.
            PACELC fills this gap.
          </p>
          <p>
            (A database with a single node is not a CAP example at all. There is no network between copies that can be
            split. If that one node dies, the database is simply down.)
          </p>
          <h3 id="cp-vs-ap-behaviour">CP vs AP behaviour</h3>
          <p>
            <strong>CP (choose consistency during partitions).</strong> Nodes that cannot confirm that they have the latest
            data <strong>refuse requests or return errors</strong> until the partition heals. Systems built on{" "}
            <strong>consensus</strong> (algorithms like Raft and Paxos, where machines vote to agree on one answer) work
            like this. Only the side with a <strong>majority</strong> of the nodes can accept writes. The minority side
            stops.
          </p>
          <ul>
            <li>
              Good for: bank balances, inventory counts, leader election (choosing one boss machine), configuration, locks,
              and anything where a wrong answer is worse than no answer.
            </li>
            <li>
              Examples of this behaviour: etcd, ZooKeeper, Consul, Google Spanner, and most relational databases with
              synchronous failover (a standby copy that always has the latest data takes over).
            </li>
          </ul>
          <p>
            <strong>AP (choose availability during partitions).</strong> Every node keeps answering, even if its data may be
            stale, and keeps accepting writes. The copies are <strong>made equal again later</strong>. This is called
            eventual consistency (Lesson 28).
          </p>
          <ul>
            <li>
              Good for: shopping carts, social feeds, like counts, product catalogues, DNS, and anything where a slightly
              old answer is better than an error.
            </li>
            <li>Examples of this behaviour: Cassandra and DynamoDB in their default modes, Riak, CouchDB, DNS.</li>
          </ul>
          <h3 id="most-real-systems-are-tunable-not-simply-cp-or-ap">
            Most real systems are tunable, not simply "CP" or "AP"
          </h3>
          <ul>
            <li>
              <strong>Cassandra:</strong> with consistency level <code>ONE</code> (one replica must answer), it behaves AP-style. With{" "}
              <code>QUORUM</code> reads and writes (a majority of replicas must answer, so W + R &gt; N, see Lesson 24),
              it behaves much more like CP.
            </li>
            <li>
              <strong>DynamoDB:</strong> reads are eventually consistent by default (they may return slightly old data). You can ask for{" "}
              <strong>strongly consistent reads</strong> (and use transactions) when you need them.
            </li>
            <li>
              <strong>MongoDB:</strong> behaviour depends on its "read concern" and "write concern" settings. These settings say how many nodes
              must confirm a read or a write. It also depends on which node you read from.
            </li>
            <li>
              <strong>PostgreSQL with replicas:</strong> reading from the primary is consistent. Reading from an async
              replica (a copy that is updated later) may return stale data.
            </li>
          </ul>
          <p>
            That is why Martin Kleppmann argued, in a well-known article, that we should{" "}
            <strong>stop labelling databases as simply "CP" or "AP"</strong>. The real behaviour depends on the
            settings, on the operation, and on the kind of failure. It is more useful to ask:{" "}
            <strong>"For this operation, with these settings, what happens during a partition?"</strong>
          </p>
          <h3 id="pacelc-the-everyday-trade-off">PACELC: the everyday trade-off</h3>
          <p>
            Partitions are fairly rare. But there is a trade-off that you pay <strong>all the time</strong>. The computer
            scientist Daniel Abadi described it with the name PACELC:
          </p>
          <blockquote>
            <p>
              <strong>
                If there is a Partition (P), choose between Availability (A) and Consistency (C); Else (E), when running
                normally, choose between Latency (L) and Consistency (C). (Latency is the time one request takes.)
              </strong>
            </p>
          </blockquote>
          <Flow
            caption="PACELC in one decision tree."
            nodes={[
              { title: <>Is there a network partition right now?</>, desc: <>rare, but it will happen</> },
              {
                title: <>Availability or Consistency</>,
                desc: <>answer with possibly stale data, or refuse and wait</>,
                label: <>yes</>,
                tone: "warn",
              },
              {
                title: <>Latency or Consistency</>,
                desc: <>answer from the nearest copy now, or coordinate first (extra round trips)</>,
                label: <>no (almost always)</>,
                tone: "accent",
              },
            ]}
          />
          <p>
            <strong>Why is there a latency cost even without failures?</strong> To make sure that every read sees the
            latest write, nodes must <strong>coordinate</strong>. They wait for replicas to confirm, or they check with
            a leader or a majority. This needs extra network round trips (a message there and a reply back). Between
            regions, each round trip can take <strong>50–200 ms</strong> (Lesson 10).
          </p>
          <ul>
            <li>
              <strong>EL (prefer low latency):</strong> answer at once from the nearest copy. The answer might be slightly
              stale.
            </li>
            <li>
              <strong>EC (prefer consistency):</strong> wait for the coordination. Every read is up to date, but it is
              slower.
            </li>
          </ul>
          <h3 id="classifying-some-systems-with-pacelc">Classifying some systems with PACELC</h3>
          <p>
            Each label has two parts. The part before the slash is the choice during a Partition (PA or PC). The part
            after the slash is the choice Else, in normal operation (EL or EC). These labels are rough and depend on the
            settings:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>System (typical config)</th>
                  <th>During partition</th>
                  <th>Normal operation</th>
                  <th>Label</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cassandra / DynamoDB (default)</td>
                  <td>Availability</td>
                  <td>Latency</td>
                  <td>
                    <strong>PA/EL</strong>
                  </td>
                </tr>
                <tr>
                  <td>Google Spanner</td>
                  <td>Consistency</td>
                  <td>Consistency</td>
                  <td>
                    <strong>PC/EC</strong>
                  </td>
                </tr>
                <tr>
                  <td>Traditional single-primary SQL with sync replicas</td>
                  <td>Consistency</td>
                  <td>Consistency</td>
                  <td>
                    <strong>PC/EC</strong>
                  </td>
                </tr>
                <tr>
                  <td>MongoDB (common defaults)</td>
                  <td>Consistency (primary only)</td>
                  <td>Mostly latency/consistency depending on read settings</td>
                  <td>
                    Often described as <strong>PC/EC</strong>, varies
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Again: use these labels as a way to <strong>think</strong>, not as fixed truths.
          </p>
          <Compare
            caption="What each choice looks like to a user during a partition."
            columns={[
              {
                title: <>CP: keep consistency</>,
                items: [
                  { sign: "·", text: <>Minority side refuses writes or returns errors</> },
                  { sign: "+", text: <>Never a wrong or conflicting answer</> },
                  { sign: "-", text: <>Some users see “try again later”</> },
                ],
                verdict: <>Balances, inventory, bookings, locks, leader election (etcd, ZooKeeper, Spanner)</>,
              },
              {
                title: <>AP: keep availability</>,
                items: [
                  { sign: "·", text: <>Every node keeps answering and accepting writes</> },
                  { sign: "+", text: <>Always responds, stays fast</> },
                  { sign: "-", text: <>Stale reads; conflicts to reconcile later</> },
                ],
                verdict: <>Carts, feeds, like counts, catalogues, DNS (Cassandra and DynamoDB defaults)</>,
              },
            ]}
          />
          <h3 id="using-cap-and-pacelc-in-design">Using CAP and PACELC in design</h3>
          <p>
            Ask these questions <strong>for each feature</strong>, not for the whole system:
          </p>
          <ol>
            <li>
              <strong>What happens if two users see different values for a few seconds?</strong>
              <ul>
                <li>
                  Like counts, view counts, "last seen", recommendations: this is <strong>acceptable</strong>. Choose A and
                  L (availability and low latency).
                </li>
                <li>
                  Account balance, stock at checkout, seat booking, usernames: this is <strong>not acceptable</strong>.
                  Choose C (consistency), even if it is slower or sometimes unavailable.
                </li>
              </ul>
            </li>
            <li>
              <strong>What should the user see during a failure?</strong>
              <ul>
                <li>An error ("please try again")? A read-only mode? Old data with a warning?</li>
              </ul>
            </li>
            <li>
              <strong>How far apart are the copies?</strong> In the same zone (coordination is cheap) or on different
              continents (coordination is expensive)?
            </li>
          </ol>
          <p>
            <strong>Many systems mix both.</strong> An e-commerce site can serve <strong>product pages</strong> from
            AP-style caches and replicas (fast, but maybe slightly stale). It can run <strong>checkout and payment</strong>{" "}
            on a strongly consistent primary database.
          </p>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Choosing C (CP / EC):</strong> you get correct, predictable data. But you also get{" "}
              <strong>higher latency</strong> and <strong>errors or unavailability</strong> during partitions,
              especially across regions.
            </li>
            <li>
              <strong>Choosing A (AP / EL):</strong> the system always responds and is fast. But you get{" "}
              <strong>stale reads</strong> and <strong>conflicts to resolve</strong>. Developers also find it harder to
              reason about.
            </li>
            <li>
              <strong>Tunable systems:</strong> you can choose for each operation. But there are more ways to set things
              up wrongly. Teams must understand the settings that they choose.
            </li>
          </ul>
          <p>
            <strong>Common mistake:</strong> choosing a database because its marketing label says "AP" or "CP". Instead,
            test <strong>how it behaves</strong> under the failures you care about, with your own settings.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Google Spanner.</strong> Spanner is built to be strongly consistent (CP) across the globe. It uses
            tightly synchronised clocks (called TrueTime) and consensus. Google has written that its private network is
            so reliable that partitions are very rare. So Spanner is <strong>effectively "CA" in practice</strong>,
            while formally it stays CP. When a partition does happen, consistency wins.
          </p>
          <p>
            <strong>Amazon's shopping cart (Dynamo).</strong> Amazon chose <strong>availability</strong>. "Add to cart"
            should always work, even during failures, because refusing it means lost sales. Conflicting cart versions
            are merged later. This is a clear, deliberate AP choice for one specific feature.
          </p>
          <p>
            <strong>DNS.</strong> DNS (the system that turns names into addresses) is a huge AP system. When a record changes, some
            resolvers keep giving the old saved answer until its TTL (time to live) ends (Lesson 1). The internet chose
            availability and speed over instant consistency.
          </p>
          <p>
            <strong>Coordination services.</strong> Tools like etcd and ZooKeeper are used by Kubernetes and many databases to elect leaders and to
            store critical configuration. They are CP. If they cannot reach a majority, they stop accepting writes. They
            do this instead of risking two leaders. This is exactly the split-brain protection from Lesson 24.
          </p>
          <p>
            <strong>Banking and payments.</strong> Moving money needs consistency. If the systems cannot confirm a
            balance or a transfer, you get "transaction failed, please try again". This is better than the risk of
            double-spending (spending the same money twice). Notification features or "recent transactions" views may
            lag a little, though.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>State the CAP theorem precisely.</>,
                a: (
                  <>
                    <p>
                      In a distributed system, when a network partition happens, you must choose between consistency
                      (every read sees the latest write, which is linearizability) and availability (every non-failed
                      node responds). Without a partition you can have both. CAP says nothing about normal
                      operation.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why is “CA” not a meaningful choice for a distributed system?</>,
                a: (
                  <>
                    <p>
                      Partitions are not optional. Networks drop and delay messages whether you like it or not. A system
                      that assumes partitions never happen must still do something when one happens. That something is a
                      choice of C or A.
                    </p>
                  </>
                ),
              },
              {
                q: <>What does PACELC add?</>,
                a: (
                  <>
                    <p>
                      It adds the everyday trade-off. If there is a Partition, choose Availability or Consistency. Else,
                      choose Latency or Consistency. Strong consistency needs coordination (round trips to a quorum or
                      to a leader). This costs latency even when nothing is broken.
                    </p>
                  </>
                ),
              },
              {
                q: <>Is Cassandra AP?</>,
                a: (
                  <>
                    <p>
                      With consistency level ONE it behaves AP-style. With QUORUM reads and writes it behaves much more
                      like CP. A label depends on the settings and on the operation. So it is better to ask how a
                      given operation, with given settings, behaves during a partition.
                    </p>
                  </>
                ),
              },
              {
                q: <>How would you apply CAP to an e-commerce site?</>,
                a: (
                  <>
                    <p>
                      Decide for each feature. Product pages, reviews and recommendations can be AP and served from
                      caches and replicas. Reducing stock at checkout, payments and order creation must be consistent.
                      They go to a primary or to a consensus-based store. If something fails, they show “please retry”
                      instead of overselling.
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
              <strong>CAP:</strong> during a <strong>network partition</strong>, a distributed system must choose{" "}
              <strong>consistency</strong> (refuse or wait) or <strong>availability</strong> (answer, maybe stale).
            </li>
            <li>
              Partitions are <strong>not optional</strong>, so "CA" is not a real choice for distributed systems. Without
              partitions, you can have both C and A.
            </li>
            <li>
              CAP's <strong>C means linearizability</strong>, not ACID's C.
            </li>
            <li>
              <strong>PACELC</strong> adds the everyday trade-off: <strong>else, choose latency or consistency</strong>.
              Strong consistency costs coordination round trips.
            </li>
            <li>
              Real systems are <strong>tunable</strong>. Decide <strong>for each feature</strong> how much staleness is
              acceptable. Test the real behaviour instead of trusting labels.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>Eric Brewer's article "CAP Twelve Years Later: How the 'Rules' Have Changed" (IEEE Computer, 2012)</li>
            <li>
              The paper "Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web
              Services" by Gilbert and Lynch (2002)
            </li>
            <li>
              Daniel Abadi's paper "Consistency Tradeoffs in Modern Distributed Database System Design" (IEEE Computer,
              2012), which introduces PACELC
            </li>
            <li>Martin Kleppmann's article "Please stop calling databases CP or AP"</li>
            <li>Eric Brewer's paper "Spanner, TrueTime and the CAP Theorem" (Google, 2017)</li>
            <li>The System Design Primer on GitHub (section "CAP theorem")</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
