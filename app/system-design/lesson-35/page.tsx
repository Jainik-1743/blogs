import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { AsciiDiagram, Compare, Flow, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import KafkaGroups from "@/components/sd/widgets/KafkaGroups";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-35")!;

export const metadata: Metadata = {
  title: `Lesson 35 — ${lesson.title}`,
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

const diagram1 = `                          ┌──► Worker 1  (takes msg A)
Producer ──► [ Queue ] ───┼──► Worker 2  (takes msg B)
                          └──► Worker 3  (takes msg C)`;

const diagram2 = `                               ┌──► Email service
Publisher ──► [ Topic: orders ]┼──► Warehouse service
                               └──► Analytics service`;

const code1 = `Order 5521: created → paid → shipped    (must stay in order)
Order 7730: created → paid              (independent, can run in parallel)`;

export default function SdLessonThreeFivePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>When an order is placed, your system publishes a message. Three teams care about it:</p>
          <ul>
            <li>
              the <strong>email team</strong> wants to send a confirmation,
            </li>
            <li>
              the <strong>warehouse team</strong> wants to start packing,
            </li>
            <li>
              the <strong>analytics team</strong> wants to record the sale.
            </li>
          </ul>
          <p>
            You put the message on a queue, and all three services read from it. Surprise:{" "}
            <strong>each message is delivered to only one of them</strong>. The email goes out, but the warehouse never
            hears about the order. Or the warehouse packs it, but no email is sent.
          </p>
          <p>
            Or the opposite mistake. You run five copies of the email service to handle load, all subscribed to a
            broadcast topic, and <strong>every customer gets five confirmation emails</strong>.
          </p>
          <p>
            The difference between <strong>"one of you handles this"</strong> and{" "}
            <strong>"all of you get a copy"</strong> is the difference between a <strong>queue</strong> and{" "}
            <strong>publish/subscribe</strong>. Mixing them up causes lost work or duplicated work.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>Think about two ways of handing out work in an office.</p>
          <p>
            <strong>A queue is a single task tray.</strong> Tasks go into one tray, and whichever worker is free{" "}
            <strong>takes the next task</strong>. Each task is done <strong>once</strong>, by <strong>one</strong>{" "}
            worker. More workers means tasks get done faster.
          </p>
          <p>
            <strong>Pub/sub is a company announcement.</strong> The manager <strong>announces</strong> "Q3 results are
            out!" on the office speaker. <strong>Everyone</strong> who is subscribed hears it (sales, finance, HR), and
            each reacts in their own way. The manager doesn't know or care who's listening.
          </p>
          <Compare
            caption="The one distinction that matters."
            columns={[
              {
                title: <>Queue — point to point</>,
                items: [
                  { sign: "·", text: <>one message → ONE consumer</> },
                  { sign: "·", text: <>like a single task tray</> },
                ],
                verdict: <>Work that must be done once: resize, email, charge</>,
              },
              {
                title: <>Pub/sub — broadcast</>,
                items: [
                  { sign: "·", text: <>one message → EVERY subscriber</> },
                  { sign: "·", text: <>like an office announcement</> },
                ],
                verdict: <>Events many services react to: order placed, user signed up</>,
              },
            ]}
          />
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="point-to-point-queues">Point-to-point queues</h3>
          <AsciiDiagram text={diagram1} />
          <ul>
            <li>
              Each message is processed by <strong>exactly one</strong> of the consumers. This is the{" "}
              <strong>competing consumers</strong> pattern (post 18).
            </li>
            <li>
              Adding workers <strong>increases throughput</strong>.
            </li>
            <li>
              When a message is acknowledged, it's <strong>removed</strong> from the queue.
            </li>
          </ul>
          <p>
            <strong>Use it when</strong> a piece of work should be done <strong>once</strong>: resize this image, send
            this email, charge this invoice, generate this report.
          </p>
          <h3 id="publish-subscribe">Publish/subscribe</h3>
          <AsciiDiagram text={diagram2} />
          <ul>
            <li>
              The publisher sends a message to a <strong>topic</strong>.
            </li>
            <li>
              <strong>Every subscriber</strong> receives its <strong>own copy</strong>.
            </li>
            <li>
              Subscribers are <strong>independent</strong>. A slow analytics service doesn't slow down emails.
            </li>
            <li>
              The publisher is <strong>decoupled</strong>: new subscribers can be added without changing it.
            </li>
          </ul>
          <p>
            <strong>Use it when</strong> one <strong>event</strong> matters to{" "}
            <strong>several different services</strong>: "order placed", "user signed up", "payment failed".
          </p>
          <h3 id="the-real-world-answer-combine-both">The real-world answer: combine both</h3>
          <p>
            Usually you want <strong>both</strong> behaviours at once:
          </p>
          <ul>
            <li>
              <strong>every type</strong> of service gets a copy (pub/sub <strong>between</strong> services),{" "}
              <strong>and</strong>
            </li>
            <li>
              within each service, <strong>only one instance</strong> handles each copy (a queue <strong>within</strong>{" "}
              a service).
            </li>
          </ul>
          <p>
            <strong>Pattern 1: Topic fan-out to queues (AWS SNS + SQS style)</strong>
          </p>
          <Flow
            caption="Topic fan-out to queues (SNS → SQS). Every service gets a copy; inside each service, workers compete."
            nodes={[
              { title: <>Order service</>, desc: <>publishes “order placed” once</> },
              { title: <>SNS topic: orders</>, desc: <>copies to every subscribed queue</> },
              {
                title: <>Email workers × 5</>,
                desc: <>one email per order, however many workers</>,
                label: <>email-queue</>,
              },
              { title: <>Warehouse workers × 3</>, desc: <>one packing job per order</>, label: <>warehouse-queue</> },
              { title: <>Analytics workers × 2</>, desc: <>one record per order</>, label: <>analytics-queue</> },
            ]}
          />
          <p>
            Each service gets its <strong>own queue</strong> subscribed to the topic. Within a queue, workers compete.
            Result: <strong>one email, one packing job and one analytics record per order</strong>, no matter how many
            worker instances there are.
          </p>
          <p>
            <strong>Pattern 2: Kafka consumer groups</strong>
          </p>
          <p>
            Kafka (post 36) builds this in. Consumers join a <strong>consumer group</strong>:
          </p>
          <ul>
            <li>
              <strong>Different groups</strong> each get <strong>every</strong> message (pub/sub).
            </li>
            <li>
              <strong>Within a group</strong>, each message goes to <strong>one</strong> member (queue).
            </li>
          </ul>
          <KafkaGroups caption="Kafka does both at once. Consumer groups each get the whole stream; inside a group, each partition has one owner." />
          <p>
            <strong>Pattern 3: RabbitMQ exchanges</strong>
          </p>
          <p>
            In RabbitMQ, producers send messages to an <strong>exchange</strong>, which routes them to queues by rules:
          </p>
          <ul>
            <li>
              <strong>Direct exchange:</strong> route by an exact routing key (<code>order.created</code> → the order
              queue).
            </li>
            <li>
              <strong>Fanout exchange:</strong> copy to <strong>all</strong> bound queues (pure pub/sub).
            </li>
            <li>
              <strong>Topic exchange:</strong> route by patterns (<code>order.*.india</code> → the India team's queue).
            </li>
            <li>
              <strong>Headers exchange:</strong> route by message headers.
            </li>
          </ul>
          <h3 id="push-vs-pull">Push vs pull</h3>
          <ul>
            <li>
              <strong>Push:</strong> the broker <strong>sends</strong> messages to consumers as they arrive (RabbitMQ by
              default, SNS to HTTP endpoints, Google Pub/Sub push). It's low latency, but consumers need{" "}
              <strong>flow control</strong> (for example, a "prefetch" limit) so they aren't overwhelmed.
            </li>
            <li>
              <strong>Pull:</strong> consumers <strong>ask</strong> for messages when ready (SQS, Kafka, Google Pub/Sub
              pull). Consumers control their own pace, which gives natural back pressure.
            </li>
          </ul>
          <h3 id="ordering">Ordering</h3>
          <p>"Messages arrive in the order they were sent" is harder than it sounds once you have many consumers:</p>
          <ul>
            <li>
              With competing consumers, message 1 might go to a slow worker and message 2 to a fast one, so{" "}
              <strong>message 2 finishes first</strong>.
            </li>
            <li>
              <strong>Global ordering</strong> (everything in one strict order) limits you to{" "}
              <strong>one consumer at a time</strong>, which kills throughput.
            </li>
            <li>
              The practical solution is <strong>per-key ordering</strong>: all messages for the{" "}
              <strong>same key</strong> (like the same order ID or user ID) stay in order, while different keys are
              processed in parallel.
              <ul>
                <li>
                  Kafka does this with <strong>partitions</strong> (same key → same partition).
                </li>
                <li>
                  SQS FIFO queues do it with <strong>message group IDs</strong>.
                </li>
              </ul>
            </li>
          </ul>
          <CodeBlock code={code1} />
          <h3 id="retention-delete-or-keep">Retention: delete or keep?</h3>
          <ul>
            <li>
              <strong>Classic queues</strong> (RabbitMQ, SQS) <strong>delete</strong> messages once acknowledged. The
              queue is a <strong>to-do list</strong>.
            </li>
            <li>
              <strong>Log-based systems</strong> (Kafka, Pulsar, Kinesis, Redis Streams) <strong>keep</strong> messages
              for a set time (days, or forever), even after they're read. Consumers track their{" "}
              <strong>position</strong> (offset). The system is a <strong>history book</strong>, and a new consumer can{" "}
              <strong>replay</strong> the past.
            </li>
          </ul>
          <p>
            That replay ability is a big deal. You can add a new service and have it process last week's events, or fix
            a bug and re-run.
          </p>
          <h3 id="popular-systems">Popular systems</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>System</th>
                  <th>Model</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>RabbitMQ</strong>
                  </td>
                  <td>Queues + exchanges (routing)</td>
                  <td>Flexible routing, mature, push-based</td>
                </tr>
                <tr>
                  <td>
                    <strong>Amazon SQS</strong>
                  </td>
                  <td>Queue</td>
                  <td>Fully managed, simple; FIFO option</td>
                </tr>
                <tr>
                  <td>
                    <strong>Amazon SNS</strong>
                  </td>
                  <td>Pub/sub topics</td>
                  <td>Fan-out to SQS, Lambda, HTTP, email/SMS</td>
                </tr>
                <tr>
                  <td>
                    <strong>Google Cloud Pub/Sub</strong>
                  </td>
                  <td>Topics + subscriptions</td>
                  <td>Managed; each subscription behaves like a queue</td>
                </tr>
                <tr>
                  <td>
                    <strong>Apache Kafka</strong>
                  </td>
                  <td>Partitioned log + consumer groups</td>
                  <td>High throughput, retention, replay</td>
                </tr>
                <tr>
                  <td>
                    <strong>Apache Pulsar</strong>
                  </td>
                  <td>Log + queue semantics</td>
                  <td>Multi-tenant, tiered storage</td>
                </tr>
                <tr>
                  <td>
                    <strong>NATS</strong>
                  </td>
                  <td>Lightweight pub/sub (+ JetStream for persistence)</td>
                  <td>Very fast, simple</td>
                </tr>
                <tr>
                  <td>
                    <strong>Redis Pub/Sub / Streams</strong>
                  </td>
                  <td>Fire-and-forget pub/sub / log-like streams</td>
                  <td>
                    Pub/Sub has <strong>no storage</strong>: offline subscribers miss messages. Streams persist
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Queues:</strong> simple work distribution, and each task is handled once. But it's one "audience"
              per queue, and consumed messages are gone.
            </li>
            <li>
              <strong>Pub/sub:</strong> loose coupling, and it's easy to add new reactions to events. But it's harder to
              see "who does what", and every subscriber must handle duplicates and failures itself.
            </li>
            <li>
              <strong>Fan-out (topic → queues):</strong> the best of both, but more infrastructure (a topic plus a queue
              per service).
            </li>
            <li>
              <strong>Log-based (Kafka):</strong> replay, history and very high throughput, but more concepts
              (partitions, offsets, consumer groups) and more operational work.
            </li>
            <li>
              <strong>Strict ordering:</strong> simpler reasoning, but less parallelism. Prefer{" "}
              <strong>per-key ordering</strong>.
            </li>
          </ul>
          <p>
            <strong>When not to use pub/sub:</strong> when exactly one service should act, or when the "event" is really
            a <strong>command</strong> to a specific service ("charge this card"). Send commands to that service's queue
            or API directly.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>AWS SNS + SQS fan-out.</strong> This is one of the most common AWS patterns. An "order created" SNS
            topic fans out to separate SQS queues for email, fulfilment, fraud checks and analytics. Each team scales
            its own workers and handles its own failures without affecting the others.
          </p>
          <p>
            <strong>Kafka consumer groups at LinkedIn, Uber and Netflix.</strong> Companies using Kafka publish events
            like "profile viewed", "trip completed" or "play started" once, and many independent consumer groups (search
            indexing, analytics, recommendations, billing, fraud detection) each read the full stream at their own pace.
          </p>
          <p>
            <strong>Google Cloud Pub/Sub.</strong> Each <strong>subscription</strong> on a topic gets every message, and
            multiple workers pulling from the <strong>same</strong> subscription share the load. It's the
            queue-inside-pub/sub pattern, offered as a managed service.
          </p>
          <p>
            <strong>Redis Pub/Sub for live features.</strong> Chat and notification systems often use Redis Pub/Sub to
            pass messages between WebSocket gateways (post 33), because it's fast. They also store messages durably
            elsewhere, because Redis Pub/Sub doesn't keep messages for subscribers that are offline.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What's the difference between a queue and pub/sub?</>,
                a: (
                  <>
                    <p>
                      A queue delivers each message to exactly one of the competing consumers, distributing work.
                      Pub/sub delivers a copy of each message to every subscriber, broadcasting an event to independent
                      services.
                    </p>
                  </>
                ),
              },
              {
                q: <>Five instances of the email service all send the same email. What went wrong?</>,
                a: (
                  <>
                    <p>
                      They subscribed to a broadcast topic individually, so each instance got its own copy. They should
                      share one subscription — one SQS queue behind the topic, one Kafka consumer group, or one Pub/Sub
                      subscription — so each message goes to only one instance.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you guarantee ordering and still scale consumers?</>,
                a: (
                  <>
                    <p>
                      Use per-key ordering: route all messages with the same key (order ID, user ID) to the same
                      partition or message group, which is processed in order, while different keys run in parallel.
                      Global ordering allows only one consumer at a time.
                    </p>
                  </>
                ),
              },
              {
                q: <>Push or pull consumers?</>,
                a: (
                  <>
                    <p>
                      Push gives low latency but needs flow control (prefetch limits) to avoid overwhelming consumers.
                      Pull lets each consumer take work at its own pace, which gives natural back pressure and easy
                      batching.
                    </p>
                  </>
                ),
              },
              {
                q: <>When should you not use pub/sub?</>,
                a: (
                  <>
                    <p>
                      When exactly one service must act — that's a command (“charge this card”), not an event. Send
                      commands to the owning service's queue or API so responsibility is explicit.
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
              A <strong>queue</strong> delivers each message to <strong>one</strong> consumer (work distribution).{" "}
              <strong>Pub/sub</strong> delivers each message to <strong>every</strong> subscriber (event broadcast).
            </li>
            <li>
              Real systems usually <strong>combine them</strong>: pub/sub <strong>between</strong> services, with a
              queue <strong>within</strong> each service. Examples are SNS→SQS fan-out, Kafka consumer groups and
              RabbitMQ exchanges.
            </li>
            <li>
              <strong>Pull</strong> gives consumers control of their own pace. <strong>Push</strong> gives low latency
              but needs flow control.
            </li>
            <li>
              Prefer <strong>per-key ordering</strong> (partitions, message groups) over global ordering.
            </li>
            <li>
              <strong>Classic queues delete</strong> messages once handled. <strong>Logs keep</strong> them, which
              allows <strong>replay</strong> and new consumers.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>Azure Architecture Center patterns "Publisher-Subscriber" and "Competing Consumers"</li>
            <li>The RabbitMQ documentation "AMQP 0-9-1 Model Explained" (exchanges, queues and bindings)</li>
            <li>The AWS documentation on fanning out SNS messages to SQS queues</li>
            <li>The Google Cloud Pub/Sub overview documentation</li>
            <li>
              <em>System Design Interview Volume 2</em> by Alex Xu and Sahn Lam (chapter "Distributed Message Queue")
            </li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
