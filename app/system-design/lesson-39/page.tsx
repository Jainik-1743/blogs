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
          <p>
            Your order service has become too big and too busy. When an order is placed, its code calls these services
            directly, one after another:
          </p>
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
            to agree on every change to one file. This tight link between services is called{" "}
            <strong>coupling</strong>: when one part changes or fails, the other parts are hurt too.
          </p>
          <p>
            <strong>Event-driven architecture (EDA)</strong> is a way to build software where services talk by sending
            events. An <strong>event</strong> is a short message that says something has happened. EDA turns the design
            around. The order service no longer <strong>tells</strong> everyone what to do. It only{" "}
            <strong>announces what happened</strong>: "An order was placed". Any service that cares{" "}
            <strong>reacts</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about a <strong>wedding announcement</strong>.
          </p>
          <p>
            <strong>The command style:</strong> the family personally phones the caterer ("prepare food for 300"), the
            decorator ("set up flowers"), the photographer ("be there at 6") and 200 relatives. If the photographer
            does not pick up, the family is stuck on the phone. Adding a new vendor means one more call to make.
          </p>
          <p>
            <strong>The event style:</strong> the family <strong>posts one announcement</strong>: "The wedding is on 14
            Feb at 6 PM, at this venue." The caterer, decorator, photographer and guests each{" "}
            <strong>see it and do their own part</strong>. A new vendor who hears about it can join{" "}
            <strong>without the family doing anything</strong>.
          </p>
          <ul>
            <li>
              A <strong>command</strong> is a message that says "<strong>do this</strong>" to one specific receiver. It
              expects the work to be done.
            </li>
            <li>
              An <strong>event</strong> is a message that says "<strong>this happened</strong>" to anyone who is
              interested. The sender does not care who reacts.
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
                  <td>No, it is a fact about the past</td>
                </tr>
                <tr>
                  <td>Coupling</td>
                  <td>Sender knows the receiver</td>
                  <td>Sender does not know who listens</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Both travel as <strong>messages</strong> over queues or streams (posts 35–36). A <strong>publisher</strong> is
            the service that sends an event. A <strong>subscriber</strong> is a service that asks to receive it.
          </p>
          <p>
            <strong>Name events as past-tense business facts:</strong> <code>OrderPlaced</code>,{" "}
            <code>PaymentCaptured</code>, <code>ShipmentDispatched</code>, <code>UserEmailChanged</code>. Avoid
            names that describe technical details, like <code>OrderTableRowUpdated</code>.
          </p>
          <h3 id="the-basic-event-driven-flow">The basic event-driven flow</h3>
          <Flow
            caption="The event-driven version. The order service announces one fact; each consumer reacts at its own pace."
            nodes={[
              { title: <>Order service</>, desc: <>saves the order + writes OrderPlaced to its outbox</> },
              { title: <>Event bus / Kafka</>, desc: <>durable (it keeps events safely), replayable</> },
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
              <strong>New features</strong> just subscribe. Adding a fraud check means{" "}
              <strong>no change to the order service</strong>.
            </li>
            <li>
              A slow or broken <strong>loyalty</strong> service <strong>no longer affects checkout</strong>. Its events
              wait in the stream until it recovers.
            </li>
          </ul>
          <h3 id="four-patterns-that-are-all-called-event-driven">Four patterns that are all called "event-driven"</h3>
          <p>
            Martin Fowler pointed out that "event-driven" can mean four different things. Here they are one by one.
          </p>
          <p>
            <strong>1. Event notification.</strong> The event is small. It only says that something happened. Consumers{" "}
            <strong>call back</strong> to ask for the details if they need them.
          </p>
          <CodeBlock lang="json" code={code1} />
          <ul>
            <li>✅ Small events, loose coupling.</li>
            <li>
              ❌ Consumers call the order service's API. This adds load, and the consumers now depend on the order
              service while they run.
            </li>
          </ul>
          <p>
            <strong>2. Event-carried state transfer.</strong> The event carries <strong>all the data</strong> that
            consumers need.
          </p>
          <CodeBlock lang="json" code={code2} />
          <ul>
            <li>
              ✅ Consumers do not need to call back. They can even keep their <strong>own local copy</strong> of the
              data.
            </li>
            <li>
              ❌ Bigger events and duplicated data (post 23). Schema evolution (changing the event format over time
              without breaking readers) becomes important.
            </li>
          </ul>
          <p>
            <strong>3. Event sourcing.</strong> Normally you store only the <strong>current state</strong> (for example,
            the balance). With event sourcing you store <strong>every event</strong> that ever happened. You work out
            the current state by replaying (re-reading) them in order. A bank statement works like this.
          </p>
          <Timeline
            caption="Event sourcing — the balance is worked out by replaying every event."
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
              ✅ A full <strong>audit history</strong> (a record of who did what and when), and "time travel" (what was
              the state last Tuesday?). You can also build new views by replaying events.
            </li>
            <li>
              ❌ More complex, and changing the format of old events is tricky. Long histories need{" "}
              <strong>snapshots</strong> (a saved copy of the state at one moment, so you do not replay everything).
              To ask "what is the current state?" you need <strong>projections</strong> (tables built by replaying the
              events).
            </li>
            <li>
              <strong>Good for:</strong> ledgers, banking, and areas with many audit rules.{" "}
              <strong>Too much for</strong> most CRUD apps (apps that only create, read, update and delete records).
            </li>
          </ul>
          <p>
            <strong>4. CQRS (Command Query Responsibility Segregation).</strong> This is a design that uses{" "}
            <strong>separate models</strong> for <strong>writing</strong> (commands) and <strong>reading</strong>{" "}
            (queries). Writes go to a model built for correctness. Events then update one or more{" "}
            <strong>read models</strong> built for fast queries: a search index, a denormalised feed (data copied into
            one ready-to-read shape), or a reporting table (post 23).
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
          <p>Event sourcing and CQRS are often used together. You can also use either one alone.</p>
          <h3 id="choreography-vs-orchestration">Choreography vs orchestration</h3>
          <p>When a business process spans several services (like checkout), who is in charge of the steps?</p>
          <p>
            <strong>Choreography</strong> means services react to each other's events, like dancers who each know
            their own moves. Nobody is in charge.
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
              ❌ <strong>You cannot see the whole flow.</strong> It is spread across many services, so it is hard to
              answer "where is order 5521 stuck?". Circular dependencies (A waits for B, and B waits for A) can appear
              by accident.
            </li>
          </ul>
          <p>
            <strong>Orchestration</strong> means a central coordinator (the orchestrator) tells each service what to do
            with commands, and tracks the progress. It is like a conductor of an orchestra.
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
              ✅ The flow is <strong>clear</strong> and in one place. It is easy to monitor, change and debug.
            </li>
            <li>❌ The orchestrator is an extra part to run, and the services stay somewhat tied to it.</li>
          </ul>
          <p>
            <strong>Rule of thumb:</strong> use choreography for <strong>simple reactions that are only loosely
            related</strong> (send an email, update analytics). Use orchestration for{" "}
            <strong>important business processes with many steps</strong> (checkout, loan approval, onboarding).
            Workflow engines like Temporal or AWS Step Functions are often used as orchestrators (post 38).
          </p>
          <h3 id="sagas-transactions-across-services">Sagas: transactions across services</h3>
          <p>
            A monolith is one big application with one database. There, checkout can be one database transaction (a
            group of steps that all succeed or all fail, post 21). With many services, each with its own database, you
            cannot do that. A <strong>saga</strong> is a sequence of <strong>local transactions</strong> (one per
            service). Each step has a <strong>compensating action</strong>, which is a step that undoes it if a later
            step fails.
          </p>
          <p>
            <strong>Example: the checkout saga when payment fails.</strong>
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
              Compensations are <strong>business actions</strong>, not automatic rollbacks (a rollback is a database undo).
              Examples: "refund", "release", "cancel", "send apology email".
            </li>
            <li>
              Every step and compensation must be <strong>idempotent</strong> (safe to run twice, post 37), because they
              may be retried.
            </li>
            <li>
              Users may see <strong>in-between states</strong> ("Order pending…"), so design the screens for that.
            </li>
            <li>
              Sagas can be <strong>choreographed</strong> (via events) or <strong>orchestrated</strong> (via a
              coordinator). Orchestration is usually easier to reason about for sagas.
            </li>
          </ul>
          <h3 id="change-data-capture-cdc-as-an-event-source">Change Data Capture (CDC) as an event source</h3>
          <p>
            Sometimes you cannot, or do not want to, change old applications so that they publish events.{" "}
            <strong>Change Data Capture (CDC)</strong> is a technique that reads the database's change log (post 21) and
            turns every insert, update and delete into an event. <strong>CDC tools</strong> like{" "}
            <strong>Debezium</strong> send these events to Kafka. CDC is also a reliable way to build the outbox pattern
            (post 37).
          </p>
          <h3 id="event-schemas-and-evolution">Event schemas and evolution</h3>
          <p>
            Events are a <strong>contract</strong> between teams, just like APIs (post 34). A contract is a promise about
            the shape of the data:
          </p>
          <ul>
            <li>
              use a <strong>schema</strong> (a written description of the fields in an event, for example in Avro,
              Protobuf or JSON Schema) and a <strong>schema registry</strong> (a service that stores schemas and
              rejects changes that would break readers),
            </li>
            <li>
              make changes <strong>backward compatible</strong>, so old readers still work. Add optional fields. Never
              remove a field that consumers use, and never give it a new meaning,
            </li>
            <li>
              include standard metadata: <strong>event ID</strong> (for dedup), <strong>type</strong>,{" "}
              <strong>version</strong>, <strong>timestamp</strong>, <strong>source</strong>, and a{" "}
              <strong>correlation ID</strong> (one ID shared by all events from the same user action, used for tracing).
              The <strong>CloudEvents</strong> standard defines a common format for this.
            </li>
          </ul>
          <CodeBlock lang="json" code={code3} />
          <h3 id="the-challenges">The challenges</h3>
          <ul>
            <li>
              <strong>Eventual consistency.</strong> This means data in different places is not updated at the same
              moment, but it becomes the same after a short time. After you place an order, the loyalty points appear a
              second later. The UI must show "processing" states.
            </li>
            <li>
              <strong>Debugging and visibility.</strong> One user action starts a chain of events across services. To
              follow it you need <strong>correlation IDs</strong> and <strong>distributed tracing</strong> (tools that
              show one request as it moves through many services, Part 8).
            </li>
            <li>
              <strong>Ordering.</strong> Use <strong>per-key ordering</strong> (events with the same key, such as the
              order ID, go to the same partition) and{" "}
              <strong>version numbers</strong> in events (posts 35–37).
            </li>
            <li>
              <strong>Duplicates.</strong> At-least-once delivery means a message may arrive twice. So{" "}
              <strong>idempotent consumers</strong> are a must.
            </li>
            <li>
              <strong>Replay side effects.</strong> Replaying events to rebuild a read model is useful. But make sure
              a replay <strong>does not resend emails or charge cards again</strong>.
            </li>
            <li>
              <strong>"Event soup".</strong> This means too many badly named events that overlap and have no owner. Keep
              an <strong>event catalogue</strong> (a list of all events) with a clear owner for each.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅ <strong>Loose coupling:</strong> add features without touching the publisher.
            </li>
            <li>
              ✅ <strong>Resilience</strong> (the ability to keep working when parts fail)<strong>:</strong> slow or broken
              consumers do not break the core flow.
            </li>
            <li>
              ✅ <strong>Scalability:</strong> each consumer can grow on its own.
            </li>
            <li>
              ✅ <strong>History and replay</strong>, especially with Kafka and event sourcing.
            </li>
            <li>
              ❌ <strong>Eventual consistency</strong>, and harder reasoning about "what state is the system in right
              now?".
            </li>
            <li>
              ❌ <strong>Harder debugging.</strong> You need tracing, good logs and tools.
            </li>
            <li>
              ❌ <strong>More infrastructure:</strong> brokers, schema registry, outbox relays, DLQs.
            </li>
            <li>
              ❌ <strong>Event sourcing and CQRS add big complexity.</strong> Use them only where the benefits (audit,
              history, many kinds of read models) are clear.
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
            <li>or when a simple synchronous API call (the caller waits for the answer) is clearer and good enough.</li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>E-commerce order pipelines.</strong> Large retailers commonly publish events like "order placed",
            "payment captured" and "shipment dispatched". Warehouses, delivery partners, notifications, customer support
            tools and analytics each subscribe independently. This is why your order confirmation, tracking updates and
            loyalty points arrive at slightly different times.
          </p>
          <p>
            <strong>Uber and ride events.</strong> Trip lifecycle events (requested, accepted, started, completed) flow
            through Kafka to many systems: pricing, payments, driver earnings, fraud detection, maps and analytics.
            Each system handles them on its own, at a very large scale.
          </p>
          <p>
            <strong>Banking and ledgers.</strong> Financial systems naturally fit <strong>event sourcing</strong>: an
            account's balance is the result of every deposit and withdrawal, and the full history must be kept for
            audits. Many modern banking and payment platforms use ledgers that are immutable (never changed) and
            append-only (you only add new records at the end).
          </p>
          <p>
            <strong>Git as an event-sourcing analogy.</strong> Git keeps every commit, not just
            the latest files. You can go back to any point in history, create branches, and get the current state from
            the log of commits. This is the core idea of event sourcing, in a tool most developers use every day.
            (The match is not exact: Git commits are saved snapshots, not small events.)
          </p>
          <p>
            <strong>Workflow orchestration.</strong> Companies running complex flows (loan applications, insurance
            claims, e-commerce fulfilment) often use <strong>orchestrated sagas</strong> with tools like Temporal or AWS
            Step Functions, so every step, retry and compensation is visible and can be checked later.
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
                      A command is an instruction to one specific receiver (“ChargeCard”), and it can be refused. An
                      event is a fact in the past tense (“OrderPlaced”) that goes to anyone who is interested. The
                      publisher does not know or care who reacts.
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
                      You store every change as an event that is never edited. You work out the current state by replaying
                      the events. It pays off for ledgers and other areas that need full history and time travel. For
                      ordinary CRUD it adds extra work (projections, snapshots, event versions) for little gain.
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
