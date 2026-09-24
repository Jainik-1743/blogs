import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { AsciiDiagram, Flow, QA, Timeline } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-18")!;

export const metadata: Metadata = {
  title: `Lesson 18 — ${lesson.title}`,
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

const diagram1 = `                           ┌─────────────────────┐
[API: place order] ──msg──►│ Queue: order-events │──► [Worker 1] send email
   (producer)              │ ■ ■ ■ ■ ■           │──► [Worker 2] send email
                           └─────────────────────┘──► [Worker 3] send email
                                                        (consumers)`;

const diagram2 = `Incoming:   ▁▁▁█████████▁▁▁▁▁▁   (flash-sale spike)
Queue:      ▁▁▁▂▄▆███▇▅▃▂▁▁▁▁   (grows, then drains)
Processing: ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃   (steady, at the rate downstream can bear)`;

export default function SdLessonOneEightPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>A user places an order. Your API then has to:</p>
          <ol>
            <li>save the order,</li>
            <li>charge the card,</li>
            <li>send a confirmation email,</li>
            <li>send an SMS,</li>
            <li>notify the warehouse,</li>
            <li>update loyalty points,</li>
            <li>update recommendations.</li>
          </ol>
          <p>
            If you do all of this <strong>inside the request</strong>, the user waits 4 seconds. If the email provider
            is slow, the user waits even longer. And if the SMS service is down, the whole order <strong>fails</strong>,
            even though the order and payment were fine.
          </p>
          <p>
            And during a flash sale, 20,000 orders arrive in one minute. Every downstream system gets hammered at once.
          </p>
          <p>
            <strong>Message queues</strong> solve this. They let you do the essential work now and everything else{" "}
            <strong>reliably, a moment later</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about the <strong>order ticket rail in a restaurant kitchen</strong>.
          </p>
          <ul>
            <li>
              The waiter takes your order, clips a ticket to the rail, and goes back to serving customers. They don't
              stand in the kitchen waiting for your food.
            </li>
            <li>
              The cooks take tickets from the rail <strong>one at a time</strong>, as fast as they can.
            </li>
            <li>On a busy night, tickets pile up on the rail, but nothing is lost. The cooks work through them.</li>
            <li>If one cook goes on break, the others keep taking tickets.</li>
          </ul>
          <p>
            A <strong>message queue</strong> is that ticket rail:
          </p>
          <ul>
            <li>
              <strong>Producers</strong> (the waiter) put <strong>messages</strong> (tickets) on the queue.
            </li>
            <li>
              <strong>Consumers</strong> or <strong>workers</strong> (the cooks) take messages off and process them.
            </li>
            <li>
              The queue <strong>holds messages safely</strong> until they're processed.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="the-basic-flow">The basic flow</h3>
          <AsciiDiagram text={diagram1} />
          <p>For the order example:</p>
          <SequenceDiagram
            caption="Placing an order with a queue. The user waits only for the part that must happen now."
            actors={["User", "API", "Queue", "Workers"]}
            messages={[
              { from: 0, to: 1, label: <>POST /orders</> },
              { from: 1, to: 1, label: <>save order + charge card</>, note: <>must succeed now</> },
              { from: 1, to: 2, label: <>publish order_placed &#123;orderId: 5521&#125;</> },
              { from: 1, to: 0, label: <>“Order placed!”</>, note: <>~200 ms</>, reply: true },
              { from: 0, to: 0, label: <>Seconds later, in the background</>, divider: true },
              { from: 2, to: 3, label: <>order_placed 5521</> },
              { from: 3, to: 3, label: <>email · SMS · warehouse · loyalty points</> },
              { from: 3, to: 2, label: <>ack → message deleted</>, reply: true },
            ]}
          />
          <p>The user gets a fast response, and the slow or unreliable tasks happen in the background.</p>
          <h3 id="why-queues-help">Why queues help</h3>
          <p>
            <strong>1. Faster responses.</strong> The user only waits for the essential work.
          </p>
          <p>
            <strong>2. Decoupling.</strong> The API doesn't need to know about the email service, the SMS service or the
            warehouse system. It just publishes "order placed". You can add a new consumer (say, a fraud-check service){" "}
            <strong>without changing the API</strong>.
          </p>
          <p>
            <strong>3. Resilience.</strong> If the email service is down for 10 minutes, messages wait in the queue.
            When it recovers, workers process the backlog, and nothing is lost. Without a queue, those 10 minutes of
            emails would simply fail.
          </p>
          <p>
            <strong>4. Smoothing traffic spikes (load levelling).</strong> During a flash sale, orders arrive at 20,000
            per minute, but the warehouse system can only handle 2,000 per minute. The queue{" "}
            <strong>absorbs the spike</strong>, and workers process at a steady, safe rate. The queue grows during the
            rush and drains afterwards.
          </p>
          <AsciiDiagram caption="Load levelling — the queue absorbs the spike" text={diagram2} />
          <p>
            <strong>5. Easy scaling.</strong> Queue getting long? Add more workers. Many workers taking from the same
            queue is called the <strong>competing consumers</strong> pattern. Each message goes to just one of them.
          </p>
          <h3 id="acknowledgements-not-losing-messages">Acknowledgements: not losing messages</h3>
          <p>
            What if a worker takes a message and then <strong>crashes</strong> halfway through sending the email? Queues
            handle this with <strong>acknowledgements (acks)</strong>:
          </p>
          <Timeline
            caption="Acknowledgements. A message is only deleted once a worker says it's done."
            events={[
              { time: <>Receive</>, text: <>worker takes the message; the queue hides it from other workers</> },
              { time: <>Finish + ACK</>, text: <>the queue deletes it ✅</>, tone: "good" },
              { time: <>Crash before ACK</>, text: <>nobody confirms it…</>, tone: "bad" },
              {
                time: <>Visibility timeout passes</>,
                text: <>the message reappears and another worker picks it up 🔁 — so it may run twice</>,
                tone: "warn",
              },
            ]}
          />
          <p>
            In Amazon SQS, this timeout is called the <strong>visibility timeout</strong>. In RabbitMQ, if a consumer
            disconnects without acking, the message is redelivered.
          </p>
          <p>
            There's an important consequence: <strong>a message might be processed more than once</strong>. For example,
            the worker sent the email, then crashed before acking. So{" "}
            <strong>consumers should be safe to run twice</strong> (idempotent). For example, record "email sent for
            order 5521" and skip it if it's already done. Part 6 goes deep on this.
          </p>
          <h3 id="when-things-keep-failing">When things keep failing</h3>
          <p>
            Some messages will fail over and over: bad data, a bug, a missing record. If they're retried forever, they
            waste resources and can block other work. The usual solution:
          </p>
          <ul>
            <li>
              <strong>Retry a few times</strong>, with increasing delays.
            </li>
            <li>
              Then move the message to a <strong>dead-letter queue (DLQ)</strong>, a separate queue for "problem"
              messages, which engineers can inspect and fix.
            </li>
          </ul>
          <p>(More in Part 6.)</p>
          <Flow
            caption="A message that keeps failing takes a detour instead of blocking everyone."
            nodes={[
              { title: <>Attempt 1</>, desc: <>fails — bad data, bug, missing record</> },
              { title: <>Retry after 1 s, 5 s, 30 s</>, desc: <>growing delays, a few times</> },
              {
                title: <>Dead-letter queue</>,
                desc: <>parked for engineers to inspect, fix and replay</>,
                tone: "bad",
              },
            ]}
          />
          <h3 id="back-pressure">Back pressure</h3>
          <p>
            If producers keep adding messages faster than consumers can <strong>ever</strong> process them, the queue
            grows without limit. Messages get old and useless (an OTP that arrives 20 minutes late), and memory or disk
            fills up. You need to:
          </p>
          <ul>
            <li>
              <strong>Monitor queue length and message age.</strong>
            </li>
            <li>
              <strong>Auto-scale workers</strong> based on queue length.
            </li>
            <li>
              If needed, <strong>push back on producers</strong> (slow them down, or reject non-essential work). This is
              called <strong>back pressure</strong>.
            </li>
          </ul>
          <h3 id="what-should-go-on-a-queue">What should go on a queue?</h3>
          <p>
            <strong>Good fits:</strong>
          </p>
          <ul>
            <li>Sending emails, SMS and push notifications.</li>
            <li>Image and video processing (resizing, transcoding).</li>
            <li>Generating reports, invoices and PDFs.</li>
            <li>Syncing data to search indexes, analytics and data warehouses.</li>
            <li>Calling slow or unreliable third-party APIs.</li>
            <li>
              Anything the user doesn't need to see <strong>immediately</strong>.
            </li>
          </ul>
          <p>
            <strong>Poor fits:</strong>
          </p>
          <ul>
            <li>
              Anything the user must see the result of <strong>right now</strong>: login checks, "is this username
              available?", getting a price.
            </li>
            <li>Simple, fast work where a queue only adds complexity.</li>
          </ul>
          <h3 id="popular-message-queues">Popular message queues</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>What it's like</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>RabbitMQ</strong>
                  </td>
                  <td>A classic, flexible message broker with rich routing options</td>
                </tr>
                <tr>
                  <td>
                    <strong>Amazon SQS</strong>
                  </td>
                  <td>A fully managed queue on AWS; very simple, scales automatically</td>
                </tr>
                <tr>
                  <td>
                    <strong>Google Cloud Pub/Sub, Azure Service Bus</strong>
                  </td>
                  <td>Managed messaging on other clouds</td>
                </tr>
                <tr>
                  <td>
                    <strong>Redis (lists, Streams)</strong>
                  </td>
                  <td>Lightweight queues, often used by job libraries like BullMQ and Sidekiq</td>
                </tr>
                <tr>
                  <td>
                    <strong>Apache Kafka</strong>
                  </td>
                  <td>
                    Not a classic queue but a <strong>distributed log</strong>: messages are kept for days and can be
                    re-read. Very high throughput (Part 6)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 id="how-the-user-sees-async-results">How the user sees async results</h3>
          <p>If work happens later, how does the user find out?</p>
          <ul>
            <li>
              <strong>Just tell them:</strong> "We'll email your invoice shortly."
            </li>
            <li>
              <strong>Polling:</strong> the app checks <code>GET /jobs/123</code> every few seconds ("Processing…
              Done!").
            </li>
            <li>
              <strong>Push:</strong> WebSockets or push notifications when the job finishes (Part 5).
            </li>
            <li>
              <strong>Webhooks:</strong> for other systems, "we'll call your URL when it's done".
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅ <strong>Faster responses</strong>, <strong>decoupled services</strong>, <strong>resilience</strong> to
              downstream failures, and <strong>smoother load</strong>.
            </li>
            <li>
              ❌ <strong>Eventual results.</strong> Work happens "soon", not "now". The UX has to handle this.
            </li>
            <li>
              ❌ <strong>Duplicates and ordering.</strong> Messages may be delivered more than once or out of order, so
              consumers must handle both.
            </li>
            <li>
              ❌ <strong>More moving parts:</strong> the queue itself must be monitored, scaled and kept highly
              available.
            </li>
            <li>
              ❌ <strong>Harder debugging.</strong> A single user action is now spread across several services and time.
              Good logging and tracing (Part 8) become essential.
            </li>
          </ul>
          <p>
            <strong>When not to use a queue:</strong> small apps where the "slow" work takes 50 ms and rarely fails, or
            anything where the user needs the result before continuing.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Amazon SQS</strong> is one of the oldest AWS services. It was publicly announced in 2004, before S3
            and EC2. That says a lot about how central queues were to how Amazon built its own systems: services talk
            through queues so a problem in one doesn't bring down the others.
          </p>
          <p>
            <strong>Food delivery and ride-hailing apps.</strong> When you place an order or book a ride, the core
            action is confirmed quickly. Notifications to the restaurant or driver, receipt emails, analytics events and
            promotions are typically handled through queues and event streams behind the scenes.
          </p>
          <p>
            <strong>Video platforms.</strong> When you upload a video to a platform like YouTube, you get an "upload
            complete" message, then "processing…". The upload goes into storage, and a job queue sends it to workers
            that transcode it into many resolutions. That's why HD versions sometimes appear a little later than SD.
          </p>
          <p>
            <strong>Banking OTPs and alerts.</strong> When a bank sends you a transaction alert SMS, it's usually
            produced by a queue-based system. It's a nice example of why monitoring <strong>message age</strong>{" "}
            matters: an OTP that arrives 10 minutes late is useless.
          </p>
          <p>
            <strong>Flash sales.</strong> E-commerce sites use queues to absorb bursts of orders, and sometimes even put
            users into a "virtual waiting room" queue before they can reach checkout, to protect their systems during
            huge sales.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Why put a message queue between services?</>,
                a: (
                  <>
                    <p>
                      To return fast (the user waits only for essential work), decouple producers from consumers (add
                      new consumers without touching the producer), survive downstream outages (messages wait instead of
                      failing), and smooth spikes (workers drain the queue at a safe, steady rate).
                    </p>
                  </>
                ),
              },
              {
                q: <>How does a queue avoid losing a message when a worker crashes?</>,
                a: (
                  <>
                    <p>
                      The worker must acknowledge a message after processing. Until then it's only hidden (SQS
                      visibility timeout) or held as unacked (RabbitMQ); if no ack arrives, it's redelivered to another
                      worker. The side-effect is at-least-once delivery.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why must consumers be idempotent?</>,
                a: (
                  <>
                    <p>
                      Because redelivery means a message can be processed twice — say the email was sent but the worker
                      crashed before acking. Record what was done (a processed-message ID, or a unique constraint on
                      order + email type) and skip duplicates.
                    </p>
                  </>
                ),
              },
              {
                q: <>What metrics would you watch on a queue?</>,
                a: (
                  <>
                    <p>
                      Queue depth, the age of the oldest message, consumer throughput, error and retry rates, and
                      dead-letter-queue size. Age matters most for time-sensitive work: an OTP that arrives 10 minutes
                      late is useless.
                    </p>
                  </>
                ),
              },
              {
                q: <>What would you not put on a queue?</>,
                a: (
                  <>
                    <p>
                      Anything the user needs before continuing — login checks, username availability, a price quote —
                      and trivial fast work where a queue only adds latency, duplicates and operational overhead.
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
              A <strong>message queue</strong> lets <strong>producers</strong> hand off work to{" "}
              <strong>consumers</strong> asynchronously, like a kitchen ticket rail.
            </li>
            <li>
              Queues give you <strong>fast responses, decoupling, resilience and load levelling</strong>, and you scale
              by <strong>adding workers</strong>.
            </li>
            <li>
              <strong>Acknowledgements</strong> prevent message loss, but mean a message can be processed{" "}
              <strong>more than once</strong>, so make consumers <strong>idempotent</strong>.
            </li>
            <li>
              Use <strong>retries and dead-letter queues</strong> for failing messages, and monitor{" "}
              <strong>queue length and message age</strong>.
            </li>
            <li>
              Queue work that the user doesn't need <strong>immediately</strong>. Keep "must know now" work synchronous.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              The System Design Primer on GitHub (section "Asynchronism": message queues, task queues and back pressure)
            </li>
            <li>The official RabbitMQ tutorials</li>
            <li>The Amazon SQS Developer Guide</li>
            <li>Azure Architecture Center patterns "Queue-Based Load Leveling" and "Competing Consumers"</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
