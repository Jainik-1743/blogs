import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, QA, Stats, Timeline } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import KafkaGroups from "@/components/sd/widgets/KafkaGroups";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-36")!;

export const metadata: Metadata = {
  title: `Lesson 36 — ${lesson.title}`,
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

const code1 = `key = order_id "5521"  → hash → Partition 1:  created → paid → shipped   ✅ in order
key = order_id "7730"  → hash → Partition 0:  created → cancelled         ✅ in order`;

const code2 = `Partition 0:  Leader on Broker 1,  followers on Broker 2 and 3
Partition 1:  Leader on Broker 2,  followers on Broker 3 and 1
Partition 2:  Leader on Broker 3,  followers on Broker 1 and 2`;

const code3 = `Topic "orders" (4 partitions)

Group "billing" (2 consumers):
   consumer A ← P0, P1
   consumer B ← P2, P3

Group "analytics" (4 consumers):
   c1 ← P0   c2 ← P1   c3 ← P2   c4 ← P3

Group "search" (5 consumers):
   4 get one partition each… the 5th is IDLE (no partition left)`;

export default function SdLessonThreeSixPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            A growing company has 30 services (small programs that each do one job), and they all need to share data:
          </p>
          <ul>
            <li>
              the order service must tell billing, shipping, analytics, search and fraud detection about every order,
            </li>
            <li>the app sends millions of clicks and views per minute to analytics,</li>
            <li>
              the data team wants to <strong>replay</strong> last week's events after fixing a bug in their pipeline.
            </li>
          </ul>
          <p>
            With point-to-point connections, every system talks to every other system. It becomes a tangled web of
            integrations that nobody fully understands. Classic queues delete messages once they are read, so there is
            nothing to replay. And at millions of events per second, many traditional brokers (servers that store and
            deliver messages) struggle.
          </p>
          <p>
            <strong>Apache Kafka</strong> solved this at LinkedIn. It became the backbone of event streaming at
            thousands of companies. An event is a record that something happened, such as "order placed". Event
            streaming means sending a continuous flow of events between systems. Kafka's secret is a simple idea:{" "}
            <strong>the log</strong>. A log is a list of records where you only add new ones at the end.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about a <strong>bank passbook</strong> or a <strong>ship's logbook</strong>.
          </p>
          <ul>
            <li>
              Entries are <strong>written in order</strong>, one after another.
            </li>
            <li>
              You <strong>never erase or change</strong> an old entry. You only <strong>add</strong> new ones at the
              end.
            </li>
            <li>
              Anyone can <strong>read</strong> the book from any page. The accountant reads today's entries, while an
              auditor goes back and reads from January.
            </li>
            <li>
              Each reader keeps their <strong>own bookmark</strong>. One reader's position does not affect another's.
            </li>
          </ul>
          <p>
            Kafka is a <strong>huge, distributed, append-only logbook</strong> for events. "Distributed" means it runs on
            many servers. "Append-only" means you can only add to the end:
          </p>
          <ul>
            <li>
              <strong>Producers</strong> (programs that send events) append events to the end.
            </li>
            <li>
              <strong>Consumers</strong> (programs that read events) read from wherever their <strong>bookmark (offset)</strong> is.
            </li>
            <li>
              Events stay for days or even forever, so <strong>anyone can re-read history</strong>.
            </li>
          </ul>
          <p>
            Instead of every service connecting to every other one, <strong>all services connect to Kafka</strong>:
          </p>
          <Compare
            caption="From point-to-point spaghetti to one hub."
            columns={[
              {
                title: <>Before — spaghetti</>,
                items: [
                  { sign: "·", text: <>every service integrates with every other</> },
                  { sign: "-", text: <>n × (n − 1) connections to build and keep working</> },
                  { sign: "-", text: <>nothing can be replayed</> },
                ],
              },
              {
                title: <>After — Kafka as the hub</>,
                items: [
                  { sign: "·", text: <>producers write once; consumers read at their own pace</> },
                  { sign: "+", text: <>add a consumer without touching producers</> },
                  { sign: "+", text: <>replay history whenever needed</> },
                ],
              },
            ]}
          />
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="topics-partitions-and-offsets">Topics, partitions and offsets</h3>
          <p>
            A <strong>topic</strong> is a named stream of events, like a folder for one kind of event. Examples: <code>orders</code>, <code>payments</code> or{" "}
            <code>page-views</code>.
          </p>
          <p>
            Each topic is split into <strong>partitions</strong>. A partition is one{" "}
            <strong>ordered, append-only log</strong>. Each event in it gets a number that keeps growing, called its{" "}
            <strong>offset</strong> (its position in the log).
          </p>
          <KafkaGroups caption="A topic with partitions and a consumer group. Change the counts and see how partitions are assigned — and when consumers go idle." />
          <p>Why partitions?</p>
          <ul>
            <li>
              <strong>Scale.</strong> Partitions are spread across many servers, so a topic can hold far more data
              than one machine can.
            </li>
            <li>
              <strong>Parallelism.</strong> Different consumers can read different partitions at the same time. Parallelism means doing many things at once.
            </li>
            <li>
              <strong>Ordering.</strong> Kafka guarantees order <strong>within a partition</strong>, not across the
              whole topic.
            </li>
          </ul>
          <h3 id="keys-decide-the-partition">Keys decide the partition</h3>
          <p>
            Every event can have a <strong>key</strong>, such as an order ID. A hash is a calculation that turns a key into a number. Kafka hashes the key to choose a partition, so{" "}
            <strong>all events with the same key go to the same partition</strong>, and stay <strong>in order</strong>:
          </p>
          <CodeBlock code={code1} />
          <p>Choosing the key is like choosing a shard key (lesson 25):</p>
          <ul>
            <li>
              <strong>User ID</strong> → all of one user's events in order.
            </li>
            <li>
              <strong>Order ID</strong> → each order's lifecycle in order.
            </li>
            <li>
              <strong>No key</strong> → events are spread evenly, with no ordering guarantee.
            </li>
            <li>
              <strong>A hot key</strong> (one very busy key, such as one huge customer) → one overloaded partition.
            </li>
          </ul>
          <h3 id="brokers-and-replication">Brokers and replication</h3>
          <Stats
            caption="The producer's acks setting decides how much a “success” is worth."
            stats={[
              { value: <>acks=0</>, label: <>don't wait</>, sub: <>fastest; messages can be lost</> },
              {
                value: <>acks=1</>,
                label: <>leader only</>,
                sub: <>lost if the leader dies before followers copy it</>,
              },
              {
                value: <>acks=all</>,
                label: <>all in-sync replicas</>,
                sub: <>with min.insync.replicas=2 — the setting for important data</>,
              },
            ]}
          />
          <p>
            Kafka runs as a <strong>cluster</strong> (a group of servers that work together). Each server is called a{" "}
            <strong>broker</strong>. Each partition is <strong>replicated</strong> (copied) to several brokers, commonly 3:
          </p>
          <CodeBlock code={code2} />
          <ul>
            <li>
              The <strong>leader</strong> handles reads and writes for that partition. <strong>Followers</strong> copy
              it (single-leader replication, lesson 24).
            </li>
            <li>
              The <strong>ISR (In-Sync Replicas)</strong> are the followers that are caught up with the leader.
            </li>
            <li>If a leader's broker dies, an in-sync follower becomes the new leader.</li>
          </ul>
          <p>
            <strong>Durability settings</strong> decide how safe writes are:
          </p>
          <ul>
            <li>
              <code>acks=0</code>: the producer does not wait at all. (<code>acks</code> is the setting for how many brokers must confirm a write.) Fastest, and messages can be lost.
            </li>
            <li>
              <code>acks=1</code>: wait for the leader only. The message is lost if the leader dies before followers
              copy it.
            </li>
            <li>
              <code>acks=all</code>: wait for <strong>all in-sync replicas</strong>. Combined with{" "}
              <code>min.insync.replicas=2</code> (with a replication factor of 3, meaning 3 copies), a write is confirmed only when at
              least two brokers have it. <strong>This is the setting for important data.</strong>
            </li>
          </ul>
          <h3 id="metadata-from-zookeeper-to-kraft">Metadata: from ZooKeeper to KRaft</h3>
          <p>
            Kafka needs to track which brokers are alive, who leads each partition, and topic configurations. For years
            this used <strong>Apache ZooKeeper</strong>, a separate system that stores shared settings and status. Kafka
            then built its own system based on Raft (a way for servers to agree), called <strong>KRaft</strong>.{" "}
            <strong>Kafka 4.0 removed ZooKeeper completely</strong>. The result is fewer parts to run and faster
            recovery.
          </p>
          <h3 id="producers">Producers</h3>
          <p>Producers send events to topics. Features that matter:</p>
          <ul>
            <li>
              <strong>Batching:</strong> collect many small messages and send them together (settings like{" "}
              <code>linger.ms</code> and <code>batch.size</code>), for much higher throughput.
            </li>
            <li>
              <strong>Compression:</strong> compress batches (for example with lz4 or zstd) to save network and disk.
            </li>
            <li>
              <strong>Idempotent producer:</strong> idempotent means repeating it has the same effect as doing it once.
              Kafka removes duplicates caused by producer retries, so a network retry does not write the same event
              twice. It is on by default in modern Kafka (since version 3.0).
            </li>
            <li>
              <strong>Transactions:</strong> write to several partitions <strong>atomically</strong> (all succeed or none do; lesson 37).
            </li>
          </ul>
          <h3 id="consumers-and-consumer-groups">Consumers and consumer groups</h3>
          <p>
            Consumers read events and track their <strong>offset</strong>, meaning "I have processed everything up to
            here".
          </p>
          <p>
            Consumers work in <strong>consumer groups</strong> (lesson 35). A consumer group is a team of consumers that share the work of one topic:
          </p>
          <ul>
            <li>
              <strong>Each partition is read by exactly one consumer</strong> in the group at a time.
            </li>
            <li>
              <strong>Different groups</strong> read the same topic <strong>independently</strong>, each with its own
              offsets.
            </li>
          </ul>
          <CodeBlock code={code3} />
          <p>
            <strong>Important rule:</strong> the number of partitions is the <strong>maximum parallelism</strong> for a
            consumer group. <strong>More consumers than partitions leaves some idle.</strong> Choose partition counts
            with future growth in mind. You can add partitions later, but that changes which partition each key maps to.
          </p>
          <p>
            <strong>Rebalancing.</strong> When a consumer joins, leaves or crashes, Kafka <strong>shares the partitions
            out again</strong> among the group. During a rebalance, reading can pause for a short time. Modern Kafka
            offers a smoother "cooperative" rebalancing.
          </p>
          <p>
            <strong>Committing offsets.</strong> Consumers periodically <strong>commit</strong> (save) their offset back to
            Kafka (stored in an internal topic). <em>When</em> you commit decides your delivery guarantee:
          </p>
          <ul>
            <li>
              commit <strong>before</strong> processing → possible <strong>loss</strong> if you crash,
            </li>
            <li>
              commit <strong>after</strong> processing → possible <strong>duplicates</strong> if you crash.
            </li>
          </ul>
          <p>(Lesson 37 covers this in depth.)</p>
          <p>
            <strong>Consumer lag</strong> is how far behind the newest event a consumer is.{" "}
            <strong>It is the most important Kafka metric to watch.</strong> Rising lag means consumers cannot keep up:
            scale them, fix slow processing, or check for errors.
          </p>
          <h3 id="retention-and-log-compaction">Retention and log compaction</h3>
          <p>
            Retention means how long data is kept. Kafka <strong>keeps events after they are read</strong>. You choose how long:
          </p>
          <ul>
            <li>
              <strong>Time-based retention:</strong> keep 7 days (a common default), 30 days, or forever.
            </li>
            <li>
              <strong>Size-based retention:</strong> keep up to X GB per partition.
            </li>
            <li>
              <strong>Log compaction:</strong> keep <strong>only the latest event for each key</strong>, and discard
              older ones for that key.
            </li>
          </ul>
          <Timeline
            caption="Log compaction keeps only the latest value per key — a replayable table of current state."
            events={[
              { time: <>Offset 10</>, text: <>user42 → &#123;city: Pune&#125;</> },
              { time: <>Offset 11</>, text: <>user7 → &#123;…&#125;</> },
              { time: <>Offset 12</>, text: <>user42 → &#123;city: Mumbai&#125;</> },
              { time: <>Offset 13</>, text: <>user42 → &#123;city: Delhi&#125;</> },
              {
                time: <>After compaction</>,
                text: <>user7 → &#123;…&#125; and user42 → &#123;city: Delhi&#125;</>,
                tone: "good",
              },
            ]}
          />
          <p>
            Compaction turns a topic into a <strong>replayable table</strong> of current state. It is great for things
            like "current profile of every user" or "current price of every product". A new service can read the whole
            compacted topic to build its own copy of that data.
          </p>
          <h3 id="why-kafka-is-so-fast">Why Kafka is so fast</h3>
          <ul>
            <li>
              <strong>Sequential disk I/O.</strong> Sequential means in order, one after another. Appending to a log and reading it in order are both very
              fast on disks (lesson 10).
            </li>
            <li>
              <strong>The operating system's page cache.</strong> This is memory that the operating system uses to keep
              recent file data. Recent data is usually served from memory without extra work from Kafka.
            </li>
            <li>
              <strong>Zero-copy transfer.</strong> Data goes from the disk cache straight to the network connection without being copied
              through the application.
            </li>
            <li>
              <strong>Batching and compression</strong> everywhere.
            </li>
            <li>
              <strong>Partitioning</strong> spreads load across many brokers and disks.
            </li>
          </ul>
          <h3 id="the-kafka-ecosystem">The Kafka ecosystem</h3>
          <ul>
            <li>
              <strong>Kafka Connect:</strong> a tool with ready-made connectors to move data <strong>into</strong> Kafka (from
              databases via CDC (change data capture, which reads the database's change log) tools like Debezium, from files and APIs) and <strong>out</strong> to other systems
              (Elasticsearch, S3, data warehouses).
            </li>
            <li>
              <strong>Schema Registry:</strong> stores Avro, Protobuf or JSON schemas for events and enforces compatible
              changes, much like the Protobuf rules in lesson 31. A schema is a description of the fields in an event.
            </li>
            <li>
              <strong>Kafka Streams / ksqlDB:</strong> process streams inside your app (filter, join, aggregate) while keeping
              state (remembered data) locally.
            </li>
            <li>
              <strong>Apache Flink:</strong> a powerful, separate stream-processing engine commonly paired with Kafka.
            </li>
            <li>
              <strong>Managed Kafka:</strong> Confluent Cloud, Amazon MSK, Aiven, and Kafka-compatible alternatives like
              Redpanda.
            </li>
          </ul>
          <h3 id="when-kafka-is-a-good-fit">When Kafka is a good fit</h3>
          <ul>
            <li>
              <strong>Event streaming between many services</strong> (lesson 39).
            </li>
            <li>
              <strong>High-volume data pipelines:</strong> clickstreams, logs, metrics, IoT.
            </li>
            <li>
              <strong>Change Data Capture:</strong> streaming every database change to search, caches and warehouses.
            </li>
            <li>
              <strong>Event sourcing and audit logs:</strong> keeping the full history of changes. (Event sourcing means storing every change as an event instead of only the latest state.)
            </li>
            <li>
              <strong>Stream processing:</strong> real-time analytics, fraud detection, alerting.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅ <strong>Very high throughput</strong>, <strong>durable retention</strong>, <strong>replay</strong>,{" "}
              <strong>per-key ordering</strong> and <strong>many independent consumers</strong>.
            </li>
            <li>
              ✅ <strong>Decouples</strong> producers from consumers across the whole company.
            </li>
            <li>
              ❌ <strong>Operational complexity:</strong> partitions, replication, rebalancing, disk and monitoring
              (managed services help a lot).
            </li>
            <li>
              ❌ <strong>Not a job queue.</strong> No per-message acknowledgement, no built-in delayed messages or
              per-message retries. A single failing ("poison") message can block its partition. You must build retry
              topics and DLQs (dead-letter queues, where failed messages are parked; lesson 38).
            </li>
            <li>
              ❌ <strong>Partition count is a long-term decision.</strong> It limits parallelism, and changing it
              reshuffles keys.
            </li>
            <li>
              ❌ <strong>Latency:</strong> it is usually low (milliseconds), but batching gives up a little latency to gain
              throughput.
            </li>
          </ul>
          <p>
            <strong>When not to use Kafka:</strong> a small app with a few background jobs (use SQS, RabbitMQ, or a
            Redis-based job queue), request/response communication (use HTTP or gRPC), or when your team cannot run
            it and there is no managed option.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>LinkedIn.</strong> Kafka was created at LinkedIn around 2010 by Jay Kreps, Neha Narkhede and Jun
            Rao, to move activity data and system metrics between systems. It was released as open source and became an Apache
            project. LinkedIn has publicly described handling <strong>trillions of messages per day</strong> with Kafka.
            Jay Kreps' essay "The Log" explains the thinking behind it and is one of the most influential pieces of
            writing on data systems.
          </p>
          <p>
            <strong>Uber</strong> uses Kafka as a central pipeline for trip events, driver locations, logs and more, and
            has written about building reliable retry and dead-letter handling on top of it (lesson 38).
          </p>
          <p>
            <strong>Netflix</strong> uses Kafka in its data pipeline to move huge volumes of events (like playback and
            app activity) to real-time processing and analytics systems.
          </p>
          <p>
            <strong>The New York Times</strong> described storing{" "}
            <strong>every piece of content it has ever published</strong> in a Kafka topic, and
            using it as the source of truth (the main, trusted copy) to feed its search and content services. It is a
            good example of Kafka as a replayable <strong>history</strong>, not just a message bus.
          </p>
          <p>
            <strong>Change Data Capture.</strong> Many companies use <strong>Debezium + Kafka Connect</strong> to stream
            every change in their PostgreSQL or MySQL databases into Kafka. Search indexes, caches and data warehouses
            then stay in sync automatically, without the dual-write problems (writing to two systems and one write failing) described in lesson 19.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>How is Kafka different from a traditional message queue?</>,
                a: (
                  <>
                    <p>
                      Kafka is a durable, partitioned log. Messages are not deleted when read. They are kept by time, size or compaction, and each
                      consumer group tracks its own offset. This allows replay, many independent consumers and very high
                      throughput. But there is no built-in per-message acknowledgement, delay or retry.
                    </p>
                  </>
                ),
              },
              {
                q: <>How does Kafka guarantee ordering?</>,
                a: (
                  <>
                    <p>
                      Only within a partition. Producers send events with a key, and all events with the same key hash
                      to the same partition, so each key's events are read in order. There is no ordering across
                      partitions.
                    </p>
                  </>
                ),
              },
              {
                q: <>What limits consumer parallelism in Kafka?</>,
                a: (
                  <>
                    <p>
                      The partition count. Within a group each partition is consumed by at most one member, so consumers
                      beyond the number of partitions sit idle. Adding partitions later changes the key-to-partition
                      mapping.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is consumer lag, and why watch it?</>,
                a: (
                  <>
                    <p>
                      The difference between the latest offset in a partition and the consumer group's committed offset
                      — how far behind processing is. Rising lag means consumers cannot keep up. Add consumers, speed up
                      processing, or look for a stuck poison message (a bad message that always fails).
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you make Kafka writes durable?</>,
                a: (
                  <>
                    <p>
                      Replication factor 3, producers with acks=all, min.insync.replicas=2, and the idempotent producer
                      enabled. A write is acknowledged only when at least two in-sync replicas have it, and a leader
                      failover cannot lose it.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is log compaction used for?</>,
                a: (
                  <>
                    <p>
                      It keeps only the latest record for each key, so a topic becomes a replayable snapshot of current
                      state, for example every user's current profile. New services bootstrap by reading the compacted topic
                      from the start.
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
              Kafka is a <strong>distributed, append-only log</strong>. Events are <strong>kept</strong>, and consumers
              track their own <strong>offsets</strong>, which enables <strong>replay</strong>.
            </li>
            <li>
              <strong>Topics</strong> are split into <strong>partitions</strong>.{" "}
              <strong>The key decides the partition</strong>, and order is guaranteed{" "}
              <strong>within a partition</strong>.
            </li>
            <li>
              Partitions are <strong>replicated</strong>. Use{" "}
              <strong>
                <code>acks=all</code> + <code>min.insync.replicas</code>
              </strong>{" "}
              for important data.
            </li>
            <li>
              <strong>Consumer groups</strong> share partitions (one consumer per partition per group).{" "}
              <strong>Partitions limit parallelism</strong>, and <strong>consumer lag</strong> is the key metric.
            </li>
            <li>
              <strong>Retention</strong> and <strong>log compaction</strong> make Kafka both a message bus and a
              replayable history. It is powerful, but <strong>not</strong> a simple job queue.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              The official Apache Kafka documentation (the "Introduction", "Design" and "Implementation" sections)
            </li>
            <li>
              Jay Kreps' essay "The Log: What every software engineer should know about real-time data's unifying
              abstraction"
            </li>
            <li>The paper "Kafka: a Distributed Messaging System for Log Processing" (NetDB 2011)</li>
            <li>
              <em>Kafka: The Definitive Guide</em> (2nd edition) by Gwen Shapira, Todd Palino, Rajini Sivaram and Krit
              Petty
            </li>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann (chapter 11, "Stream Processing")
            </li>
            <li>LinkedIn's engineering blog posts on running Kafka at scale</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
