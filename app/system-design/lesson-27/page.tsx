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
          <p>Every system-design discussion eventually hits the CAP theorem:</p>
          <ul>
            <li>"MongoDB is CP."</li>
            <li>"Cassandra is AP."</li>
            <li>"You can only pick two out of three!"</li>
          </ul>
          <p>
            People repeat these lines, but most can't explain what they mean, and many of them are{" "}
            <strong>misleading or wrong</strong>.
          </p>
          <p>
            Understanding CAP properly helps you answer a real design question:{" "}
            <strong>
              when the network between my servers breaks, what should my system do: refuse requests, or risk giving
              out-of-date answers?
            </strong>{" "}
            And PACELC adds the question that matters <strong>every single day</strong>, even when nothing is broken.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Imagine a bank with <strong>two branches</strong>, Mumbai and Delhi, that share account balances by phone.
            One day the <strong>phone line between them goes dead</strong>. You walk into the Delhi branch to withdraw
            ₹10,000.
          </p>
          <p>The Delhi branch has two choices:</p>
          <ol>
            <li>
              <strong>Refuse</strong> (or make you wait): "Sorry, we can't confirm your latest balance with Mumbai right
              now." This keeps the data <strong>consistent</strong>. Nobody can overdraw by withdrawing in both cities,
              but the branch is <strong>not available</strong> to you.
            </li>
            <li>
              <strong>Allow it</strong> based on Delhi's last known balance. The branch stays <strong>available</strong>
              , but your balance might be <strong>wrong</strong>: maybe you just withdrew in Mumbai too. The two
              branches now <strong>disagree</strong>.
            </li>
          </ol>
          <p>
            There's no third option that gives you both, <strong>while the line is down</strong>. That's the CAP
            theorem.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="the-three-letters-precisely">The three letters, precisely</h3>
          <p>
            <strong>
              C: Consistency (in CAP, this means <em>linearizability</em>).
            </strong>{" "}
            Every read sees the <strong>most recent write</strong>, as if there were only <strong>one copy</strong> of
            the data. Once anyone sees a new value, nobody sees the old one afterwards.
          </p>
          <blockquote>
            <p>
              ⚠️ This is <strong>not</strong> the "C" in ACID (post 21). Same word, different meaning.
            </p>
          </blockquote>
          <p>
            <strong>A: Availability.</strong> Every request to a <strong>working (non-failed) node</strong> gets a{" "}
            <strong>response</strong> (not an error or endless waiting), though it might not be the latest data.
          </p>
          <p>
            <strong>P: Partition tolerance.</strong> The system keeps operating even when the{" "}
            <strong>network drops or delays messages</strong> between nodes, splitting them into groups that can't talk
            to each other.
          </p>
          <h3 id="what-cap-actually-says">What CAP actually says</h3>
          <blockquote>
            <p>
              <strong>
                When a network partition happens, a distributed system must choose between consistency and availability.
              </strong>
            </p>
          </blockquote>
          <CapPartition caption="Two replicas of one balance. Write, then cut the network and try writing and reading on both sides — first as a CP system, then as an AP one." />
          <h3 id="why-pick-two-of-three-is-misleading">Why "pick two of three" is misleading</h3>
          <p>
            The popular triangle suggests you can pick <strong>CA</strong>: consistent and available, but not
            partition-tolerant. In a real distributed system, <strong>you can't opt out of partitions</strong>. Networks{" "}
            <strong>will</strong> drop packets, switches will fail, cables will be cut, and cloud zones will lose
            connectivity. Partitions are something that <em>happens to you</em>, not a feature you choose.
          </p>
          <p>So the real choice is:</p>
          <blockquote>
            <p>
              <strong>When a partition happens: C or A?</strong>
            </p>
          </blockquote>
          <p>
            And <strong>when there's no partition, you can have both</strong>. CAP says nothing about normal operation.
            That's the gap PACELC fills.
          </p>
          <p>
            (A single-node database isn't really a CAP example at all. There's no network between copies to partition.
            If that one node dies, it's simply down.)
          </p>
          <h3 id="cp-vs-ap-behaviour">CP vs AP behaviour</h3>
          <p>
            <strong>CP (choose consistency during partitions).</strong> Nodes that can't confirm they have the latest
            data <strong>refuse requests or return errors</strong> until the partition heals. Systems built on{" "}
            <strong>consensus</strong> (Raft, Paxos) work like this: only the side with a <strong>majority</strong> of
            nodes can accept writes. The minority side stops.
          </p>
          <ul>
            <li>
              Good for: bank balances, inventory counts, leader election, configuration, locks, anything where a wrong
              answer is worse than no answer.
            </li>
            <li>
              Examples of this behaviour: etcd, ZooKeeper, Consul, Google Spanner, and most relational databases with
              synchronous failover.
            </li>
          </ul>
          <p>
            <strong>AP (choose availability during partitions).</strong> Every node keeps answering, even with possibly
            stale data, and accepts writes. Copies are <strong>reconciled later</strong> (eventual consistency, post
            28).
          </p>
          <ul>
            <li>
              Good for: shopping carts, social feeds, like counts, product catalogues, DNS, anything where a slightly
              old answer is better than an error.
            </li>
            <li>Examples of this behaviour: Cassandra and DynamoDB in their default modes, Riak, CouchDB, DNS.</li>
          </ul>
          <h3 id="most-real-systems-are-tunable-not-simply-cp-or-ap">
            Most real systems are tunable, not simply "CP" or "AP"
          </h3>
          <ul>
            <li>
              <strong>Cassandra:</strong> with consistency level <code>ONE</code>, it behaves AP-style. With{" "}
              <code>QUORUM</code> reads and writes (W + R &gt; N, post 24), it behaves much more like CP.
            </li>
            <li>
              <strong>DynamoDB:</strong> reads are eventually consistent by default. You can ask for{" "}
              <strong>strongly consistent reads</strong> (and use transactions) when needed.
            </li>
            <li>
              <strong>MongoDB:</strong> behaviour depends on its "read concern" and "write concern" settings, and on
              which node you read from.
            </li>
            <li>
              <strong>PostgreSQL with replicas:</strong> reading from the primary is consistent. Reading from an async
              replica may be stale.
            </li>
          </ul>
          <p>
            That's why Martin Kleppmann argued in a well-known article that we should{" "}
            <strong>stop labelling databases as simply "CP" or "AP"</strong>. The real behaviour depends on
            configuration, on the operation, and on the kind of failure. It's more useful to ask:{" "}
            <strong>"For this operation, with these settings, what happens during a partition?"</strong>
          </p>
          <h3 id="pacelc-the-everyday-trade-off">PACELC: the everyday trade-off</h3>
          <p>
            Partitions are relatively rare. But there's a trade-off you pay <strong>all the time</strong>. Computer
            scientist Daniel Abadi described it as PACELC:
          </p>
          <blockquote>
            <p>
              <strong>
                If there is a Partition (P), choose between Availability (A) and Consistency (C); Else (E), when running
                normally, choose between Latency (L) and Consistency (C).
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
            <strong>Why is there a latency cost even without failures?</strong> To guarantee every read sees the latest
            write, nodes must <strong>coordinate</strong>: wait for replicas to confirm, or check with a leader or a
            majority. That's extra network round trips. Across regions, each round trip can be{" "}
            <strong>50–200 ms</strong> (post 10).
          </p>
          <ul>
            <li>
              <strong>EL (prefer low latency):</strong> answer from the nearest copy immediately. It might be slightly
              stale.
            </li>
            <li>
              <strong>EC (prefer consistency):</strong> wait for coordination. Every read is up to date, but slower.
            </li>
          </ul>
          <h3 id="classifying-some-systems-with-pacelc">Classifying some systems with PACELC</h3>
          <p>These classifications are rough and depend on configuration:</p>
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
            Again: use these as a way of <strong>thinking</strong>, not as fixed truths.
          </p>
          <Compare
            caption="What each choice looks like to a user during a partition."
            columns={[
              {
                title: <>CP — keep consistency</>,
                items: [
                  { sign: "·", text: <>Minority side refuses writes or returns errors</> },
                  { sign: "+", text: <>Never a wrong or conflicting answer</> },
                  { sign: "-", text: <>Some users see “try again later”</> },
                ],
                verdict: <>Balances, inventory, bookings, locks, leader election (etcd, ZooKeeper, Spanner)</>,
              },
              {
                title: <>AP — keep availability</>,
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
            Ask these questions <strong>per feature</strong>, not for the whole system:
          </p>
          <ol>
            <li>
              <strong>What happens if two users see different values for a few seconds?</strong>
              <ul>
                <li>
                  Like counts, view counts, "last seen", recommendations: <strong>acceptable</strong>. Choose A and L.
                </li>
                <li>
                  Account balance, stock at checkout, seat booking, usernames: <strong>not acceptable</strong>. Choose
                  C, even if slower or occasionally unavailable.
                </li>
              </ul>
            </li>
            <li>
              <strong>What should the user see during a failure?</strong>
              <ul>
                <li>An error ("please try again")? A read-only mode? Stale data with a warning?</li>
              </ul>
            </li>
            <li>
              <strong>How far apart are the copies?</strong> Same zone (cheap coordination) or different continents
              (expensive coordination)?
            </li>
          </ol>
          <p>
            <strong>Many systems mix both.</strong> An e-commerce site can serve <strong>product pages</strong> from
            AP-style caches and replicas (fast, maybe slightly stale), but run <strong>checkout and payment</strong>{" "}
            against a strongly consistent primary database.
          </p>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Choosing C (CP / EC):</strong> correct, predictable data, but <strong>higher latency</strong> and{" "}
              <strong>errors or unavailability</strong> during partitions, especially across regions.
            </li>
            <li>
              <strong>Choosing A (AP / EL):</strong> always responds and is fast, but you get{" "}
              <strong>stale reads</strong>, <strong>conflicts to resolve</strong> and harder reasoning for developers.
            </li>
            <li>
              <strong>Tunable systems:</strong> flexibility per operation, but more ways to misconfigure. Teams must
              understand the settings they choose.
            </li>
          </ul>
          <p>
            <strong>Common mistake:</strong> choosing a database because it's "AP" or "CP" as a marketing label.
            Instead, test <strong>how it behaves</strong> under the failures you care about, using your actual settings.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Google Spanner.</strong> Spanner is designed to be strongly consistent (CP) across the globe, using
            tightly synchronised clocks (TrueTime) and consensus. Google has written that, because its private network
            is so reliable, partitions are rare enough that Spanner is <strong>effectively "CA" in practice</strong>,
            while formally remaining CP. When a partition does happen, consistency wins.
          </p>
          <p>
            <strong>Amazon's shopping cart (Dynamo).</strong> Amazon chose <strong>availability</strong>: "add to cart"
            should always work, even during failures, because refusing it means lost sales. Conflicting cart versions
            are merged later. It's a clear, deliberate AP choice for one specific feature.
          </p>
          <p>
            <strong>DNS.</strong> DNS is a massive AP system. When records change, some resolvers keep serving old
            cached answers until their TTL expires (post 1). The internet chose availability and speed over instant
            consistency.
          </p>
          <p>
            <strong>Coordination services.</strong> Tools like etcd and ZooKeeper, which Kubernetes and many databases
            rely on to elect leaders and store critical configuration, are CP: if they can't reach a majority, they stop
            accepting writes rather than risk two leaders. This is exactly the split-brain protection from post 24.
          </p>
          <p>
            <strong>Banking and payments.</strong> Money movements choose consistency. If the systems can't confirm a
            balance or a transfer, you get "transaction failed, please try again" rather than a risk of double-spending.
            Notification features or "recent transactions" views, however, may lag a little.
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
                      In a distributed system, when a network partition occurs, you must choose between consistency
                      (every read sees the latest write — linearizability) and availability (every non-failed node
                      responds). Without a partition you can have both; CAP says nothing about normal operation.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why is “CA” not a meaningful choice for a distributed system?</>,
                a: (
                  <>
                    <p>
                      Partitions aren't optional — networks drop and delay messages whether you like it or not. A system
                      that assumes they never happen must still do something when they do, and that something is
                      choosing C or A.
                    </p>
                  </>
                ),
              },
              {
                q: <>What does PACELC add?</>,
                a: (
                  <>
                    <p>
                      The everyday trade-off. If there's a Partition, choose Availability or Consistency; Else, choose
                      Latency or Consistency. Strong consistency needs coordination (quorum or leader round trips),
                      which costs latency even when nothing is broken.
                    </p>
                  </>
                ),
              },
              {
                q: <>Is Cassandra AP?</>,
                a: (
                  <>
                    <p>
                      With consistency level ONE it behaves AP-style; with QUORUM reads and writes it behaves much more
                      like CP. Labels depend on configuration and operation, so it's better to ask how a given
                      operation, with given settings, behaves during a partition.
                    </p>
                  </>
                ),
              },
              {
                q: <>How would you apply CAP to an e-commerce site?</>,
                a: (
                  <>
                    <p>
                      Per feature. Product pages, reviews and recommendations can be AP and served from caches and
                      replicas. Stock decrement at checkout, payments and order creation must be consistent, going to a
                      primary or a consensus-based store, and fail with “please retry” rather than oversell.
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
              Partitions <strong>aren't optional</strong>, so "CA" isn't a real choice for distributed systems. Without
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
              Real systems are <strong>tunable</strong>. Decide <strong>per feature</strong> how much staleness is
              acceptable, and test actual behaviour instead of trusting labels.
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
