import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { AsciiDiagram, Flow, QA, Timeline } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-37")!;

export const metadata: Metadata = {
  title: `Lesson 37 — ${lesson.title}`,
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

const code1 = `BEGIN;
  INSERT INTO processed_messages (message_id) VALUES ('msg-8f2a…');  -- UNIQUE constraint
  -- if this fails with "duplicate key" → already processed → ROLLBACK and just ACK
  UPDATE accounts SET balance = balance - 2499 WHERE user_id = 42;
COMMIT;
-- then ACK the message`;

const diagram1 = `[input topic] ──► app reads, transforms ──► [output topic]
                     └── commit offsets + outputs in ONE Kafka transaction`;

export default function SdLessonThreeSevenPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            A worker reads a message, "charge customer 42 ₹2,499", from a queue. It calls the payment provider, and the
            charge succeeds. Then, <strong>before the worker tells the queue "done"</strong>, the server crashes.
          </p>
          <p>
            The queue never got its acknowledgement, so it <strong>redelivers</strong> the message to another worker.{" "}
            <strong>The customer is charged twice.</strong>
          </p>
          <p>
            Now flip it around. The worker tells the queue "done" <strong>first</strong>, then crashes before charging.
            The message is gone, so <strong>the customer is never charged</strong>, and you ship the product for free.
          </p>
          <p>
            Every messaging system forces you to pick where you'd rather fail: <strong>lose messages</strong> or{" "}
            <strong>duplicate them</strong>. Understanding <strong>delivery semantics</strong> tells you which one you
            have, and how to make the result correct anyway.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>Imagine sending an important letter.</p>
          <ul>
            <li>
              <strong>At-most-once</strong> is like dropping a postcard in a post box. It goes <strong>once</strong>. If
              it's lost, it's lost. You never send a second copy.
            </li>
            <li>
              <strong>At-least-once</strong> is like sending a registered letter and{" "}
              <strong>resending until you get a signed receipt</strong>. It will definitely arrive, but if the receipt
              gets lost, your friend might get <strong>two</strong> copies.
            </li>
            <li>
              <strong>Exactly-once</strong> is what you <em>want</em>: the letter arrives{" "}
              <strong>once and only once</strong>. Over an unreliable postal service, you can't truly guarantee that.
              What you <em>can</em> do is send it at-least-once and have your friend{" "}
              <strong>throw away any duplicates</strong> (because each letter has a unique reference number). The{" "}
              <strong>effect</strong> is "exactly once".
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="where-messages-can-be-lost-or-duplicated">Where messages can be lost or duplicated</h3>
          <p>Every hop has a "did it arrive?" problem:</p>
          <Flow
            caption="Every hop has its own “did it arrive?” problem."
            dir="row"
            nodes={[
              { title: <>Producer</> },
              { title: <>Broker</>, label: <>(1) send may time out</> },
              { title: <>Consumer</>, label: <>(2) consumer may crash</> },
              {
                title: <>Side effect</>,
                desc: <>DB write, payment, email</>,
                label: <>(3) ack may be lost</>,
                tone: "warn",
              },
            ]}
          />
          <ol>
            <li>
              <strong>Producer → broker:</strong> the send times out. Did the broker save it? If the producer retries,
              there may be a duplicate.
            </li>
            <li>
              <strong>Broker → consumer:</strong> the consumer receives the message but crashes. Should it be
              redelivered?
            </li>
            <li>
              <strong>Consumer → side effect:</strong> the effect happened, but the acknowledgement didn't.
            </li>
          </ol>
          <p>
            The key is the order of <strong>"process"</strong> and <strong>"acknowledge / commit offset"</strong>.
          </p>
          <h3 id="at-most-once">At-most-once</h3>
          <p>
            <strong>Acknowledge first, then process.</strong>
          </p>
          <Timeline
            caption="At-most-once — acknowledge first, then process."
            events={[
              { time: <>Receive</>, text: <>the message arrives</> },
              { time: <>ACK / commit offset</>, text: <>the broker now thinks it's done</> },
              { time: <>Crash here</>, text: <>the message is LOST — never processed</>, tone: "bad" },
              { time: <>Process</>, text: <>only if we got this far</> },
            ]}
          />
          <ul>
            <li>✅ Never processed twice. Simple and fast.</li>
            <li>
              ❌ <strong>Messages can be lost.</strong>
            </li>
            <li>
              <strong>Use for:</strong> data where occasional loss is acceptable and duplicates are harmful or
              pointless, like some metrics samples, "user is typing" indicators, or live location pings (a newer one is
              coming anyway).
            </li>
          </ul>
          <h3 id="at-least-once">At-least-once</h3>
          <p>
            <strong>Process first, then acknowledge.</strong>
          </p>
          <Timeline
            caption="At-least-once — process first, then acknowledge. The practical default."
            events={[
              { time: <>Receive</>, text: <>the message arrives</> },
              { time: <>Process</>, text: <>charge, write, send</> },
              { time: <>Crash here</>, text: <>no ACK → redelivered → processed AGAIN</>, tone: "bad" },
              { time: <>ACK / commit offset</>, text: <>only after the work is done</>, tone: "good" },
            ]}
          />
          <ul>
            <li>
              ✅ <strong>Nothing is lost.</strong> Every message is processed at least once.
            </li>
            <li>
              ❌ <strong>Duplicates are possible.</strong>
            </li>
            <li>
              <strong>This is the practical default</strong> in SQS, RabbitMQ (with manual acks), Kafka (committing
              after processing), Google Pub/Sub, and most systems.
            </li>
          </ul>
          <p>
            Also: <strong>producers retry</strong>, so duplicates can enter at step 1 too, unless the broker
            de-duplicates them (like Kafka's idempotent producer).
          </p>
          <h3 id="exactly-once-why-true-end-to-end-is-impossible-in-general">
            Exactly-once: why true end-to-end is impossible in general
          </h3>
          <p>
            This is the classic <strong>Two Generals problem</strong>. Two parties communicating over an unreliable
            channel can <strong>never be completely sure</strong> the other side received the last message, because
            confirmations can also be lost. So a system can't guarantee, in general, that an{" "}
            <strong>external side effect</strong> (charging a card, sending an email) happens exactly once just by
            clever messaging.
          </p>
          <p>
            What <em>is</em> achievable:
          </p>
          <blockquote>
            <p>
              <strong>
                Exactly-once <em>effect</em> = at-least-once delivery + idempotent (or de-duplicated) processing.
              </strong>
            </p>
          </blockquote>
          <p>
            People often call this "<strong>effectively once</strong>".
          </p>
          <h3 id="making-consumers-idempotent">Making consumers idempotent</h3>
          <p>
            <strong>1. De-duplicate using message IDs.</strong> Every message carries a unique ID. The consumer records
            processed IDs, <strong>in the same database transaction</strong> as the work:
          </p>
          <CodeBlock lang="sql" code={code1} />
          <p>
            Because the dedup record and the work commit <strong>together</strong>, a crash either keeps both or
            neither. A redelivered message hits the unique constraint and is skipped safely.
          </p>
          <p>
            <strong>2. Make the operation naturally idempotent.</strong>
          </p>
          <ul>
            <li>
              Use <strong>"set"</strong> instead of <strong>"add"</strong>: <code>status = 'shipped'</code> instead of{" "}
              <code>count = count + 1</code>.
            </li>
            <li>
              Use <strong>upserts</strong>: <code>INSERT ... ON CONFLICT (order_id) DO NOTHING</code>.
            </li>
            <li>
              Use <strong>conditional updates</strong>:{" "}
              <code>UPDATE orders SET status='paid' WHERE id=5521 AND status='pending'</code>.
            </li>
          </ul>
          <p>
            <strong>3. Pass idempotency keys to external systems.</strong> When charging a card or calling another API,
            send a key derived from the message ID (post 34). If the message is processed twice, the payment provider
            sees the same key and <strong>doesn't charge twice</strong>.
          </p>
          <p>
            <strong>4. Put dedup windows in the broker.</strong> Some brokers de-duplicate for you within a time window.
            For example, <strong>SQS FIFO</strong> queues drop duplicate messages with the same deduplication ID within
            5 minutes. That helps with producer retries, but it doesn't replace idempotent consumers.
          </p>
          <h3 id="kafka-s-exactly-once-semantics-eos">Kafka's exactly-once semantics (EOS)</h3>
          <p>
            Kafka offers exactly-once processing for pipelines that{" "}
            <strong>read from Kafka, process, and write back to Kafka</strong>:
          </p>
          <ul>
            <li>
              <p>
                The <strong>idempotent producer</strong> means retries don't create duplicates in a partition (each
                producer has an ID, and each message a sequence number).
              </p>
            </li>
            <li>
              <p>
                <strong>Transactions</strong> let a consumer-producer <strong>atomically</strong>:
              </p>
              <ol>
                <li>
                  write output messages to one or more topics, <strong>and</strong>
                </li>
                <li>commit its input offsets,</li>
              </ol>
              <p>as one unit. Either both happen or neither does.</p>
            </li>
            <li>
              <p>
                Consumers reading with <code>isolation.level=read_committed</code> only see messages from{" "}
                <strong>committed</strong> transactions.
              </p>
            </li>
          </ul>
          <AsciiDiagram text={diagram1} />
          <p>
            Kafka Streams and Flink use this to provide exactly-once results <strong>within</strong> their pipelines.{" "}
            <strong>But</strong> as soon as you write to an <strong>external</strong> system (a database, an email
            service, a payment API), you're back to needing idempotency on that side.
          </p>
          <h3 id="the-dual-write-problem-and-the-transactional-outbox">
            The dual-write problem and the transactional outbox
          </h3>
          <p>
            A very common bug: your service must <strong>update its database AND publish an event</strong>.
          </p>
          <SequenceDiagram
            caption="The dual-write problem. The database and the event stream can end up disagreeing."
            actors={["Order service", "Database", "Kafka"]}
            messages={[
              { from: 0, to: 1, label: <>UPDATE orders SET status = 'paid'</> },
              { from: 1, to: 0, label: <>✅ committed</>, reply: true },
              { from: 0, to: 2, label: <>publish order_paid</>, note: <>💥 crash, or Kafka unreachable</> },
              {
                from: 0,
                to: 0,
                label: <>Order is paid in the database, but billing, shipping and email never hear about it</>,
                divider: true,
              },
            ]}
          />
          <p>
            Or the reverse order: the event is sent, but the database update fails. Now the database and the event
            stream <strong>disagree</strong>. You can't wrap a database and Kafka in one normal transaction.
          </p>
          <p>
            <strong>The fix is the transactional outbox pattern:</strong>
          </p>
          <Flow
            caption="The transactional outbox. State change and “an event must be sent” commit together."
            nodes={[
              { title: <>BEGIN</>, desc: <>one local transaction in the service's own database</> },
              { title: <>UPDATE orders SET status = 'paid'</>, desc: <>the state change</> },
              { title: <>INSERT INTO outbox (id, topic, payload)</>, desc: <>the event, as a row</> },
              { title: <>COMMIT</>, desc: <>both saved atomically — or neither</>, tone: "good" },
              { title: <>Relay / CDC (Debezium)</>, desc: <>reads new outbox rows and publishes them to Kafka</> },
              { title: <>Consumers</>, desc: <>may see an event twice — deduplicate by event ID</>, tone: "warn" },
            ]}
          />
          <ul>
            <li>
              The state change and "an event must be sent" are saved <strong>atomically</strong>.
            </li>
            <li>
              The relay publishes <strong>at-least-once</strong> (it might publish twice after a crash), so{" "}
              <strong>consumers must still be idempotent</strong>, using the event ID.
            </li>
          </ul>
          <p>This pattern is one of the most important tools in event-driven systems (post 39).</p>
          <h3 id="ordering-and-retries">Ordering and retries</h3>
          <p>
            Retries can also <strong>reorder</strong> messages. If message 1 fails and is retried after message 2
            succeeds, consumers see 2 before 1. Protect against this with:
          </p>
          <ul>
            <li>
              <strong>per-key ordering</strong> (same key → same partition or message group, post 35),
            </li>
            <li>
              <strong>version numbers or timestamps</strong> in events, so consumers ignore <strong>older</strong>{" "}
              updates ("I already have version 7, ignore version 6").
            </li>
          </ul>
          <h3 id="summary">Summary</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Semantics</th>
                  <th>How</th>
                  <th>Risk</th>
                  <th>Typical use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>At-most-once</strong>
                  </td>
                  <td>Ack before processing</td>
                  <td>Loss</td>
                  <td>Metrics samples, presence, telemetry</td>
                </tr>
                <tr>
                  <td>
                    <strong>At-least-once</strong>
                  </td>
                  <td>Ack after processing</td>
                  <td>Duplicates</td>
                  <td>
                    <strong>Default</strong> for most work
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Effectively-once</strong>
                  </td>
                  <td>At-least-once + idempotent/dedup processing</td>
                  <td>Needs careful design</td>
                  <td>Payments, orders, inventory, billing</td>
                </tr>
                <tr>
                  <td>
                    <strong>Kafka EOS</strong>
                  </td>
                  <td>Idempotent producer + transactions + read_committed</td>
                  <td>Only within Kafka pipelines</td>
                  <td>Stream processing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>At-most-once:</strong> simple and fast, but loses data.
            </li>
            <li>
              <strong>At-least-once:</strong> no loss, but you <strong>must</strong> handle duplicates.
            </li>
            <li>
              <strong>Exactly-once machinery</strong> (dedup tables, transactions, outbox): correct results, but more
              storage, more latency, more code and more things to monitor.
            </li>
            <li>
              <strong>Kafka transactions:</strong> strong guarantees inside Kafka, but extra overhead, and they don't
              cover external side effects.
            </li>
          </ul>
          <p>
            <strong>Common mistake:</strong> trusting a vendor's "exactly-once" label and skipping idempotency. Always
            ask: <em>"what happens if this message is processed twice?"</em>
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Payment systems.</strong> Payment providers and fintech companies combine at-least-once messaging
            with <strong>idempotency keys</strong> and <strong>unique transaction references</strong>, so a retried
            message can never cause a second debit. This is the same pattern as in post 34, applied to queues.
          </p>
          <p>
            <strong>Kafka's exactly-once work.</strong> Confluent, the company founded by Kafka's creators, published a
            well-known explanation of how idempotent producers and transactions give Kafka exactly-once semantics for
            stream processing. They're careful to explain the boundary: exactly-once <strong>within Kafka</strong>,
            idempotency needed <strong>outside</strong> it.
          </p>
          <p>
            <strong>Transactional outbox in microservices.</strong> Many companies use the outbox pattern with CDC tools
            like <strong>Debezium</strong>. It's one of the most recommended patterns on microservices.io, because it
            solves the dual-write problem without distributed transactions.
          </p>
          <p>
            <strong>SQS and duplicate emails.</strong> Teams using standard SQS queues quickly learn that messages can
            occasionally be delivered more than once. Duplicate welcome emails are a classic symptom, and the fix is to
            record "email sent for user X" before or together with sending, and to skip it if it's already done.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Explain at-most-once, at-least-once and exactly-once delivery.</>,
                a: (
                  <>
                    <p>
                      At-most-once acknowledges before processing, so a crash loses the message. At-least-once processes
                      before acknowledging, so a crash causes redelivery and duplicates. Exactly-once end to end isn't
                      achievable in general over unreliable networks; you get an exactly-once effect by combining
                      at-least-once delivery with idempotent or deduplicated processing.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you make a message consumer idempotent?</>,
                a: (
                  <>
                    <p>
                      Record the message ID in a processed-messages table with a unique constraint in the same
                      transaction as the work, so a redelivery fails the insert and is skipped. Or make operations
                      naturally idempotent (set instead of increment, upserts, conditional updates) and pass idempotency
                      keys to external APIs.
                    </p>
                  </>
                ),
              },
              {
                q: <>What does Kafka's exactly-once semantics actually cover?</>,
                a: (
                  <>
                    <p>
                      Read-process-write pipelines that stay inside Kafka: the idempotent producer removes retry
                      duplicates, and transactions commit output messages and input offsets atomically, with consumers
                      reading read_committed. Side effects in external systems still need their own idempotency.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is the dual-write problem, and how does the outbox pattern solve it?</>,
                a: (
                  <>
                    <p>
                      Updating a database and publishing an event are two separate systems, so a crash between them
                      leaves them inconsistent. The outbox writes the event as a row in the same local transaction as
                      the state change; a relay or CDC then publishes outbox rows at-least-once.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you handle out-of-order redeliveries?</>,
                a: (
                  <>
                    <p>
                      Keep per-key ordering through partitions or message groups, and put a version or sequence number
                      in events so consumers ignore anything older than what they've already applied.
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
              Messages can be <strong>lost</strong> or <strong>duplicated</strong> at every hop. The order of{" "}
              <strong>process vs acknowledge</strong> decides which.
            </li>
            <li>
              <strong>At-most-once</strong> (ack first) risks loss. <strong>At-least-once</strong> (process first) risks
              duplicates, and it's the practical default.
            </li>
            <li>
              True end-to-end <strong>exactly-once is impossible in general</strong>. Aim for{" "}
              <strong>effectively-once</strong>: at-least-once plus <strong>idempotent or de-duplicated</strong>{" "}
              consumers.
            </li>
            <li>
              Use <strong>dedup tables in the same transaction</strong>, natural idempotency (upserts, conditional
              updates) and <strong>idempotency keys</strong> for external calls.
            </li>
            <li>
              Solve the <strong>dual-write problem</strong> with the <strong>transactional outbox</strong>. Kafka's EOS
              works <strong>within</strong> Kafka pipelines only.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>Confluent's blog post "Exactly-Once Semantics Are Possible: Here's How Kafka Does It"</li>
            <li>The Apache Kafka documentation section on message delivery semantics</li>
            <li>microservices.io patterns "Transactional outbox" and "Idempotent consumer"</li>
            <li>The RabbitMQ documentation on consumer acknowledgements and publisher confirms</li>
            <li>Tyler Treat's article "You Cannot Have Exactly-Once Delivery"</li>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann (chapter 11)
            </li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
