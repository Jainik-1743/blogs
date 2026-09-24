import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Flow, QA, Timeline } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-39")!;

export const metadata: Metadata = {
  title: `Lesson 39 — ${lesson.title}`,
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

const code1 = `{ "type": "OrderPlaced", "orderId": "5521" }`;

const code2 = `{ "type": "OrderPlaced", "orderId": "5521", "userId": 42,
  "items": [{"productId": 991, "qty": 1, "price": 129900}], "total": 129900, "city": "Pune" }`;

const code3 = `{
  "id": "evt-8f2a1c",
  "type": "com.shop.order.placed",
  "specversion": "1.0",
  "source": "order-service",
  "time": "2027-02-11T10:15:00Z",
  "datacontenttype": "application/json",
  "data": { "orderId": "5521", "userId": 42, "total": 129900 }
}`;

export default function SdLessonThreeNinePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>Your order service has become a monster. When an order is placed, its code directly calls:</p>
          <Flow
            caption="The command-driven monster. Checkout is as slow and as fragile as the slowest of seven calls."
            nodes={[
              { title: <>orderService.placeOrder()</>, desc: <>waits for every call, in order</> },
              { title: <>paymentService.charge()</> },
              { title: <>inventoryService.reserve()</> },
              { title: <>shippingService.createShipment()</> },
              { title: <>emailService.sendConfirmation()</> },
              { title: <>loyaltyService.addPoints()</>, desc: <>slow → checkout is slow</>, tone: "warn" },
              { title: <>analyticsService.track()</>, desc: <>down → checkout fails</>, tone: "bad" },
            ]}
          />
          <p>
            Every new feature means changing the order service. If the loyalty service is slow,{" "}
            <strong>checkout is slow</strong>. If analytics is down, <strong>checkout fails</strong>. Seven teams have
            to coordinate every change to one file.
          </p>
          <p>
            <strong>Event-driven architecture (EDA)</strong> flips this around. Instead of the order service{" "}
            <strong>telling</strong> everyone what to do, it simply <strong>announces what happened</strong>: "An order
            was placed". Whoever cares <strong>reacts</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about a <strong>wedding announcement</strong>.
          </p>
          <p>
            <strong>The command style:</strong> the family personally phones the caterer ("prepare food for 300"), the
            decorator ("set up flowers"), the photographer ("be there at 6") and 200 relatives. If the photographer
            doesn't pick up, they're stuck on the phone. Adding a new vendor means another call to make.
          </p>
          <p>
            <strong>The event style:</strong> the family <strong>posts one announcement</strong>: "The wedding is on 14
            Feb at 6 PM, at this venue." The caterer, decorator, photographer and guests each{" "}
            <strong>see it and do their own part</strong>. A new vendor who hears about it can join in{" "}
            <strong>without the family doing anything</strong>.
          </p>
          <ul>
            <li>
              A <strong>command</strong> says "<strong>do this</strong>" to a specific receiver, and expects it to be
              done.
            </li>
            <li>
              An <strong>event</strong> says "<strong>this happened</strong>" to anyone interested, and doesn't care who
              reacts.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="events-commands-and-messages">Events, commands and messages</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Command</th>
                  <th>Event</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Meaning</td>
                  <td>"Please do X"</td>
                  <td>"X happened"</td>
                </tr>
                <tr>
                  <td>Tense</td>
                  <td>
                    Imperative: <code>ChargeCard</code>, <code>SendEmail</code>
                  </td>
                  <td>
                    Past: <code>OrderPlaced</code>, <code>PaymentFailed</code>
                  </td>
                </tr>
                <tr>
                  <td>Receivers</td>
                  <td>One specific service</td>
                  <td>Zero, one or many</td>
                </tr>
                <tr>
                  <td>Can be refused?</td>
                  <td>Yes ("card declined")</td>
                  <td>No, it's a fact about the past</td>
                </tr>
                <tr>
                  <td>Coupling</td>
                  <td>Sender knows the receiver</td>
                  <td>Sender doesn't know who listens</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Both travel as <strong>messages</strong> over queues or streams (posts 35–36).
          </p>
          <p>
            <strong>Name events as past-tense business facts:</strong> <code>OrderPlaced</code>,{" "}
            <code>PaymentCaptured</code>, <code>ShipmentDispatched</code>, <code>UserEmailChanged</code>. Avoid
            technical names like <code>OrderTableRowUpdated</code>.
          </p>
          <h3 id="the-basic-event-driven-flow">The basic event-driven flow</h3>
          <Flow
            caption="The event-driven version. The order service announces one fact; each consumer reacts at its own pace."
            nodes={[
              { title: <>Order service</>, desc: <>saves the order + writes OrderPlaced to its outbox</> },
              { title: <>Event bus / Kafka</>, desc: <>durable, replayable</> },
              { title: <>Inventory</>, desc: <>reserves stock</>, label: <>subscribers, independent of each other</> },
              { title: <>Email</>, desc: <>sends the confirmation</> },
              { title: <>Loyalty</>, desc: <>adds points — if it's down, events simply wait</> },
              { title: <>Analytics</>, desc: <>records the sale</> },
              {
                title: <>Fraud check (new)</>,
                desc: <>just subscribes — no change to the order service</>,
                tone: "good",
              },
            ]}
          />
          <ul>
            <li>
              The order service is now <strong>simple</strong>: save the order, publish the event (using the{" "}
              <strong>outbox pattern</strong>, post 37).
            </li>
            <li>
              <strong>New features</strong> simply subscribe. Adding a fraud check means{" "}
              <strong>no change to the order service</strong>.
            </li>
            <li>
              A slow or broken <strong>loyalty</strong> service <strong>no longer affects checkout</strong>. Its events
              wait in the stream until it recovers.
            </li>
          </ul>
          <h3 id="four-patterns-that-are-all-called-event-driven">Four patterns that are all called "event-driven"</h3>
          <p>Martin Fowler pointed out that "event-driven" means several different things.</p>
          <p>
            <strong>1. Event notification.</strong> A small event says something happened, and consumers{" "}
            <strong>call back</strong> for details if they need them.
          </p>
          <CodeBlock lang="json" code={code1} />
          <ul>
            <li>✅ Small events, loose coupling.</li>
            <li>❌ Consumers call the order service's API, which adds load and a runtime dependency.</li>
          </ul>
          <p>
            <strong>2. Event-carried state transfer.</strong> The event includes <strong>all the data</strong> consumers
            need.
          </p>
          <CodeBlock lang="json" code={code2} />
          <ul>
            <li>
              ✅ Consumers don't need to call back; they can even keep their <strong>own local copy</strong> of the
              data.
            </li>
            <li>❌ Bigger events, duplicated data (post 23), and schema evolution becomes important.</li>
          </ul>
          <p>
            <strong>3. Event sourcing.</strong> Instead of storing only the <strong>current state</strong>, store{" "}
            <strong>every event</strong> that ever happened, and compute the state by replaying them.
          </p>
          <Timeline
            caption="Event sourcing — the balance is derived by replaying every event."
            events={[
              { time: <>AccountOpened</>, text: <>balance 0</> },
              { time: <>MoneyDeposited</>, text: <>+10,000</> },
              { time: <>MoneyWithdrawn</>, text: <>−2,500</> },
              { time: <>MoneyDeposited</>, text: <>+1,000</> },
              { time: <>Replay</>, text: <>current balance = 8,500 — and the state on any past day</>, tone: "good" },
            ]}
          />
          <ul>
            <li>
              ✅ A full <strong>audit history</strong>, "time travel" (what was the state last Tuesday?), and new views
              can be built by replaying events.
            </li>
            <li>
              ❌ More complex, and schema changes to old events are tricky. It needs <strong>snapshots</strong> for long
              histories. Querying "current state" requires projections.
            </li>
            <li>
              <strong>Good for:</strong> ledgers, banking, auditing-heavy domains. <strong>Overkill for</strong> most
              CRUD apps.
            </li>
          </ul>
          <p>
            <strong>4. CQRS (Command Query Responsibility Segregation).</strong> Use <strong>separate models</strong>{" "}
            for <strong>writing</strong> (commands) and <strong>reading</strong> (queries). Writes go to a model
            optimised for correctness, and events update one or more <strong>read models</strong> optimised for fast
            queries: a search index, a denormalised feed, a reporting table (post 23).
          </p>
          <Flow
            caption="CQRS — one model for writes, any number of read models built from its events."
            dir="row"
            nodes={[
              { title: <>Commands</> },
              { title: <>Write model</>, desc: <>normalised, correct</> },
              { title: <>Read models</>, desc: <>search · cache · feed tables</>, label: <>events</>, tone: "good" },
              { title: <>Queries</> },
            ]}
          />
          <p>Event sourcing and CQRS are often used together, but you can use either one alone.</p>
          <h3 id="choreography-vs-orchestration">Choreography vs orchestration</h3>
          <p>When a business process spans several services (like checkout), who coordinates it?</p>
          <p>
            <strong>Choreography: services react to each other's events.</strong> Nobody is in charge.
          </p>
          <SequenceDiagram
            caption="Choreography — services react to each other's events. Nobody is in charge."
            actors={["Order", "Payment", "Inventory", "Shipping"]}
            messages={[
              { from: 0, to: 1, label: <>OrderPlaced</> },
              { from: 1, to: 2, label: <>PaymentCaptured</> },
              { from: 2, to: 3, label: <>StockReserved</> },
              { from: 3, to: 0, label: <>ShipmentBooked</>, reply: true },
              {
                from: 0,
                to: 0,
                label: <>Decoupled, but “where is order 5521 stuck?” means reading four services' logs</>,
                divider: true,
              },
            ]}
          />
          <ul>
            <li>✅ Very decoupled, with no central bottleneck.</li>
            <li>
              ❌ <strong>The overall flow is invisible.</strong> It's spread across many services, and it's hard to
              answer "where is order 5521 stuck?". Circular dependencies can sneak in.
            </li>
          </ul>
          <p>
            <strong>
              Orchestration: a central coordinator tells each service what to do (commands) and tracks progress.
            </strong>
          </p>
          <SequenceDiagram
            caption="Orchestration — one coordinator sends commands and tracks progress."
            actors={["Orchestrator", "Payment", "Inventory", "Shipping"]}
            messages={[
              { from: 0, to: 1, label: <>Charge</> },
              { from: 1, to: 0, label: <>Charged</>, reply: true },
              { from: 0, to: 2, label: <>Reserve</> },
              { from: 2, to: 0, label: <>Reserved</>, reply: true },
              { from: 0, to: 3, label: <>Book courier</> },
              { from: 3, to: 0, label: <>Booked</>, reply: true },
              { from: 0, to: 0, label: <>mark order confirmed</> },
            ]}
          />
          <ul>
            <li>
              ✅ The flow is <strong>explicit</strong> in one place, and easy to monitor, change and debug.
            </li>
            <li>❌ The orchestrator is an extra component, and some coupling to it remains.</li>
          </ul>
          <p>
            <strong>Rule of thumb:</strong> choreography for <strong>simple, loosely related reactions</strong> (send an
            email, update analytics). Orchestration for <strong>important multi-step business processes</strong>{" "}
            (checkout, loan approval, onboarding). Workflow engines like Temporal or AWS Step Functions are often used
            as orchestrators (post 38).
          </p>
          <h3 id="sagas-transactions-across-services">Sagas: transactions across services</h3>
          <p>
            In a monolith, checkout could be one database transaction (post 21). Across services, each with its own
            database, you can't do that. A <strong>saga</strong> is a sequence of <strong>local transactions</strong>,
            where each step has a <strong>compensating action</strong> that undoes it if a later step fails.
          </p>
          <p>
            <strong>Checkout saga, when payment fails:</strong>
          </p>
          <Timeline
            caption="A checkout saga when payment fails. Compensations run in reverse order."
            events={[
              { time: <>Step 1</>, text: <>create order (PENDING) — compensation: cancel order</> },
              { time: <>Step 2</>, text: <>reserve stock — compensation: release stock</> },
              { time: <>Step 3</>, text: <>charge payment FAILS</>, tone: "bad" },
              { time: <>Compensate 2</>, text: <>release stock ✅</>, tone: "warn" },
              { time: <>Compensate 1</>, text: <>cancel order ✅ and tell the user “payment failed”</>, tone: "warn" },
            ]}
          />
          <p>Important points:</p>
          <ul>
            <li>
              Compensations are <strong>business actions</strong>, not magic rollbacks: "refund", "release", "cancel",
              "send apology email".
            </li>
            <li>
              Every step and compensation must be <strong>idempotent</strong> (post 37), because they may be retried.
            </li>
            <li>
              Users may see <strong>intermediate states</strong> ("Order pending…"), so design the UX for that.
            </li>
            <li>
              Sagas can be <strong>choreographed</strong> (via events) or <strong>orchestrated</strong> (via a
              coordinator). Orchestration is usually easier to reason about for sagas.
            </li>
          </ul>
          <h3 id="change-data-capture-cdc-as-an-event-source">Change Data Capture (CDC) as an event source</h3>
          <p>
            Sometimes you can't, or don't want to, change old applications to publish events. <strong>CDC tools</strong>{" "}
            (like <strong>Debezium</strong>) read the database's change log (post 21) and turn every insert, update and
            delete into an event stream in Kafka. This is also a reliable way to implement the outbox pattern (post 37).
          </p>
          <h3 id="event-schemas-and-evolution">Event schemas and evolution</h3>
          <p>
            Events are a <strong>contract</strong> between teams, just like APIs (post 34):
          </p>
          <ul>
            <li>
              use a <strong>schema</strong> (Avro, Protobuf or JSON Schema) and a <strong>schema registry</strong> that
              rejects incompatible changes,
            </li>
            <li>
              make changes <strong>backward compatible</strong>: add optional fields, and never remove or repurpose
              fields consumers rely on,
            </li>
            <li>
              include standard metadata: <strong>event ID</strong> (for dedup), <strong>type</strong>,{" "}
              <strong>version</strong>, <strong>timestamp</strong>, <strong>source</strong>, and a{" "}
              <strong>correlation ID</strong> for tracing. The <strong>CloudEvents</strong> standard defines a common
              format for this.
            </li>
          </ul>
          <CodeBlock lang="json" code={code3} />
          <h3 id="the-challenges">The challenges</h3>
          <ul>
            <li>
              <strong>Eventual consistency.</strong> After placing an order, the loyalty points appear a second later.
              The UI must handle "processing" states.
            </li>
            <li>
              <strong>Debugging and visibility.</strong> A single user action triggers a chain of events across
              services. You need <strong>correlation IDs</strong> and <strong>distributed tracing</strong> (Part 8) to
              follow it.
            </li>
            <li>
              <strong>Ordering.</strong> Use <strong>per-key ordering</strong> (partition by order ID) and{" "}
              <strong>version numbers</strong> in events (posts 35–37).
            </li>
            <li>
              <strong>Duplicates.</strong> At-least-once delivery means <strong>idempotent consumers</strong> are
              mandatory.
            </li>
            <li>
              <strong>Replay side effects.</strong> Replaying events to rebuild a read model is great, but make sure
              replays <strong>don't resend emails or re-charge cards</strong>.
            </li>
            <li>
              <strong>"Event soup".</strong> Too many poorly named, overlapping events with no ownership. Keep an{" "}
              <strong>event catalogue</strong> with clear owners.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅ <strong>Loose coupling:</strong> add features without touching the publisher.
            </li>
            <li>
              ✅ <strong>Resilience:</strong> slow or broken consumers don't break the core flow.
            </li>
            <li>
              ✅ <strong>Scalability:</strong> each consumer scales independently.
            </li>
            <li>
              ✅ <strong>History and replay</strong>, especially with Kafka and event sourcing.
            </li>
            <li>
              ❌ <strong>Eventual consistency</strong>, and harder reasoning about "what state is the system in right
              now?".
            </li>
            <li>
              ❌ <strong>Harder debugging</strong>; it needs tracing, good logging and tooling.
            </li>
            <li>
              ❌ <strong>More infrastructure:</strong> brokers, schema registry, outbox relays, DLQs.
            </li>
            <li>
              ❌ <strong>Event sourcing and CQRS add big complexity.</strong> Use them only where the benefits (audit,
              history, varied read models) are clear.
            </li>
          </ul>
          <p>
            <strong>When not to go event-driven:</strong>
          </p>
          <ul>
            <li>small systems with one team,</li>
            <li>
              flows where the user needs an <strong>immediate, consistent answer</strong>,
            </li>
            <li>or when a simple synchronous API call is clearer and good enough.</li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>E-commerce order pipelines.</strong> Large retailers commonly publish events like "order placed",
            "payment captured" and "shipment dispatched". Warehouses, delivery partners, notifications, customer support
            tools and analytics each subscribe independently. It's why your order confirmation, tracking updates and
            loyalty points arrive at slightly different moments.
          </p>
          <p>
            <strong>Uber and ride events.</strong> Trip lifecycle events (requested, accepted, started, completed) flow
            through Kafka to many systems: pricing, payments, driver earnings, fraud detection, maps and analytics.
            They're processed independently and at huge scale.
          </p>
          <p>
            <strong>Banking and ledgers.</strong> Financial systems naturally fit <strong>event sourcing</strong>: an
            account's balance is the result of every deposit and withdrawal, and the full history must be kept for
            audits. Many modern banking and payment platforms are built on immutable, append-only ledgers.
          </p>
          <p>
            <strong>Git as an event-sourcing analogy.</strong> Git stores every commit (every change) rather than just
            the latest files. You can go back to any point in history, create branches, and rebuild the current state
            from the log. That's the core idea of event sourcing, in a tool most developers use daily.
          </p>
          <p>
            <strong>Workflow orchestration.</strong> Companies running complex flows (loan applications, insurance
            claims, e-commerce fulfilment) often use <strong>orchestrated sagas</strong> with tools like Temporal or AWS
            Step Functions, so every step, retry and compensation is visible and auditable.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What's the difference between an event and a command?</>,
                a: (
                  <>
                    <p>
                      A command is an instruction to one specific receiver (“ChargeCard”) that can be refused. An event
                      is a past-tense fact (“OrderPlaced”) broadcast to anyone interested; the publisher doesn't know or
                      care who reacts.
                    </p>
                  </>
                ),
              },
              {
                q: <>Choreography or orchestration for a checkout flow?</>,
                a: (
                  <>
                    <p>
                      Usually orchestration: checkout is a critical multi-step process where you need to see and control
                      where each order is, handle timeouts and run compensations. Choreography suits simple, loosely
                      related reactions like emails and analytics.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is a saga?</>,
                a: (
                  <>
                    <p>
                      A way to keep data consistent across services without a distributed transaction: a sequence of
                      local transactions, each with a compensating action (refund, release, cancel) that undoes it if a
                      later step fails. Every step and compensation must be idempotent.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is event sourcing, and when is it worth it?</>,
                a: (
                  <>
                    <p>
                      Storing every change as an immutable event and deriving current state by replaying them. It pays
                      off for ledgers and audit-heavy domains that need full history and time travel. For ordinary CRUD
                      it adds complexity — projections, snapshots, event versioning — for little gain.
                    </p>
                  </>
                ),
              },
              {
                q: <>Event notification vs event-carried state transfer?</>,
                a: (
                  <>
                    <p>
                      Notification sends a thin event and consumers call back for details, creating runtime coupling and
                      extra load. Event-carried state transfer includes the data consumers need, so they can act or keep
                      a local copy without calling back, at the cost of bigger events and duplicated data.
                    </p>
                  </>
                ),
              },
              {
                q: <>What makes event-driven systems hard to operate?</>,
                a: (
                  <>
                    <p>
                      Eventual consistency in the UI, following one user action across many services (you need
                      correlation IDs and tracing), per-key ordering, duplicate deliveries that demand idempotency,
                      replays that must not resend side effects, and event schemas that need versioning and ownership.
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
              <strong>Commands</strong> say "do this" to one receiver. <strong>Events</strong> say "this happened" to
              anyone interested. Name events as <strong>past-tense business facts</strong>.
            </li>
            <li>
              The four event-driven patterns are <strong>event notification</strong>,{" "}
              <strong>event-carried state transfer</strong>, <strong>event sourcing</strong> and <strong>CQRS</strong>.
              Use the heavier ones only where they pay off.
            </li>
            <li>
              <strong>Choreography</strong> (react to events) is decoupled but hard to see.{" "}
              <strong>Orchestration</strong> (a central coordinator) is explicit and easier for important processes.
            </li>
            <li>
              <strong>Sagas</strong> replace cross-service transactions with local steps plus{" "}
              <strong>compensating actions</strong>, all <strong>idempotent</strong>.
            </li>
            <li>
              Treat events as <strong>contracts</strong> (schemas, versioning, IDs, CloudEvents), publish reliably (
              <strong>outbox / CDC</strong>), and invest in <strong>tracing and idempotency</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>Martin Fowler's articles "What do you mean by 'Event-Driven'?", "Event Sourcing" and "CQRS"</li>
            <li>microservices.io pattern "Saga"</li>
            <li>Azure Architecture Center "Event-driven architecture style"</li>
            <li>The original paper "Sagas" by Hector Garcia-Molina and Kenneth Salem (1987)</li>
            <li>The Debezium documentation and the CloudEvents specification</li>
            <li>
              <em>Building Event-Driven Microservices</em> by Adam Bellemare
            </li>
          </ul>
          <p>
            <em>
              This wraps up Part 6. Next up, Part 7: Reliability &amp; Resilience, starting with "Single Points of
              Failure, Redundancy &amp; Failover".
            </em>
          </p>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
