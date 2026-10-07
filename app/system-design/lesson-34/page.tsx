import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { AsciiDiagram, Compare, Flow, QA, Timeline } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-34")!;

export const metadata: Metadata = {
  title: `Lesson 34 — ${lesson.title}`,
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

const code1 = `POST /payments
Idempotency-Key: 7f3c9a2e-4b1d-4e8a-9f0c-2d6b1e5a8c33
Content-Type: application/json

{"amount": 249900, "currency": "INR", "source": "card_123"}`;

const diagram1 = `Idempotency table
┌──────────────────────────────┬──────────┬───────────────┬──────────────┬─────────────┐
│ key                          │ status   │ request_hash  │ response     │ expires_at  │
├──────────────────────────────┼──────────┼───────────────┼──────────────┼─────────────┤
│ 7f3c9a2e-4b1d-...            │ done     │ a91f...       │ {201, {...}} │ +24 hours   │
└──────────────────────────────┴──────────┴───────────────┴──────────────┴─────────────┘`;

const code2 = `GET /orders?limit=20&offset=0      → orders 1–20
GET /orders?limit=20&offset=20     → orders 21–40`;

const code3 = `SELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 40;`;

const code4 = `GET /orders?limit=20
→ { "data": [...], "has_more": true, "next_cursor": "eyJjcmVhdGVkX2F0Ijoi..." }

GET /orders?limit=20&cursor=eyJjcmVhdGVkX2F0Ijoi...`;

const code5 = `SELECT * FROM orders
WHERE (created_at, id) < ('2027-01-20 10:15:00', 88231)   -- the last item seen
ORDER BY created_at DESC, id DESC
LIMIT 20;`;

const code6 = `{
  "data": [ { "id": "ord_88231", "total": 129900 } ],
  "has_more": true,
  "next_cursor": "eyJjIjoiMjAyNy0wMS0yMFQxMDoxNTowMFoiLCJpIjo4ODIzMX0="
}`;

export default function SdLessonThreeFourPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>Three details decide whether an API works well in the real world.</p>
          <ol>
            <li>
              <strong>A customer taps "Pay ₹2,499".</strong> The request reaches your server and the card is charged,
              but the phone loses signal before the response arrives. The app retries automatically, and{" "}
              <strong>the customer is charged twice</strong>.
            </li>
            <li>
              <strong>A seller has 3 million orders.</strong> The app calls <code>GET /orders</code>, and the server
              tries to load all of them into memory and crashes. Even with pages, page 50,000 takes 20 seconds, and some
              orders <strong>appear twice</strong> while others are <strong>skipped</strong>.
            </li>
            <li>
              <strong>You rename a field</strong> from <code>name</code> to <code>full_name</code>. Thousands of
              installed mobile apps, which users have not updated, <strong>crash on launch</strong>.
            </li>
          </ol>
          <p>
            <strong>Idempotency</strong>, <strong>pagination</strong> and <strong>versioning</strong> are the fixes.
            They are not exciting, but they separate a demo API from a production API (an API used by real users).
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <ul>
            <li>
              <strong>Idempotency</strong> means that doing the same request many times has the same effect as doing
              it once. It is like a <strong>lift button</strong>. Pressing it once or ten times still calls{" "}
              <strong>one</strong> lift. A good API makes "do it again" safe.
            </li>
            <li>
              <strong>Pagination</strong> means returning a long list in small parts (pages). It is like a{" "}
              <strong>book</strong>. You do not read all 900 pages at once. You read one page at a time, with a <strong>bookmark</strong> so you can continue exactly where you stopped,
              even if someone inserts new pages.
            </li>
            <li>
              <strong>Versioning</strong> means giving each form of your API a version label, so old clients keep working
              when you change it. It is like <strong>electrical sockets</strong>. A new appliance must still fit
              existing sockets, or come with an adapter. You do not rewire everyone's house overnight.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <hr />
          <h3 id="part-1-idempotency">Part 1: Idempotency</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Why retries are unavoidable</h4>
          <p>
            Networks fail in a tricky way: <strong>the client often cannot tell whether the request succeeded</strong>
            . A retry means sending the same request again.
          </p>
          <SequenceDiagram
            caption="Why retries are unavoidable. The client cannot tell “failed” from “succeeded, but the reply was lost”."
            actors={["Phone", "Payments API", "Card network"]}
            messages={[
              { from: 0, to: 1, label: <>POST /payments ₹2,499</> },
              { from: 1, to: 2, label: <>charge</> },
              { from: 2, to: 1, label: <>✅ approved</>, reply: true },
              { from: 1, to: 0, label: <>201 Created</>, note: <>✖ lost in a tunnel</>, reply: true },
              { from: 0, to: 1, label: <>POST /payments ₹2,499</>, note: <>automatic retry</> },
              { from: 1, to: 2, label: <>charge AGAIN</> },
              { from: 0, to: 0, label: <>Without an idempotency key, the customer is charged twice</>, divider: true },
            ]}
          />
          <p>
            Retries happen everywhere: mobile apps, SDKs, load balancers, queues (lesson 18) and users tapping twice. So{" "}
            <strong>every operation that changes something should be safe to repeat</strong>.
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Naturally idempotent vs not</h4>
          <ul>
            <li>
              <strong>GET, PUT, DELETE</strong> are idempotent by design (lesson 3). "Set the name to Asha" twice gives
              the same result. "Delete order 7" twice leaves it deleted.
            </li>
            <li>
              <strong>POST</strong> usually is not. "Create a payment" twice creates <strong>two</strong> payments.
            </li>
            <li>
              <strong>Relative updates</strong> are not either. "Add ₹100 to the balance" twice adds ₹200.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Idempotency keys</h4>
          <p>
            The standard fix, made popular by Stripe, is an idempotency key. The <strong>client creates a unique
            key</strong> (such as a UUID, a random unique ID) for each logical operation, and sends it in a header. A
            logical operation is one real action, like one payment, even if it is sent many times. <strong>Retries reuse the same key.</strong>
          </p>
          <CodeBlock lang="http" code={code1} />
          <p>The server's steps:</p>
          <Flow
            caption="Server-side handling of an idempotency key."
            nodes={[
              { title: <>Look up the key</>, desc: <>scoped to this client or account</> },
              {
                title: <>INSERT (key, status = processing)</>,
                desc: <>a unique constraint makes this race-free</>,
                label: <>not found</>,
              },
              { title: <>Do the work</>, desc: <>pass the key downstream to the card network too</> },
              { title: <>Save the response with the key</>, desc: <>status = done, expires in ~24 h</>, tone: "good" },
              {
                title: <>Return the saved response</>,
                desc: <>the charge is never repeated</>,
                label: <>found, done</>,
                tone: "good",
              },
              {
                title: <>409 Conflict</>,
                desc: <>an identical request is still in flight</>,
                label: <>found, processing</>,
                tone: "warn",
              },
            ]}
          />
          <AsciiDiagram text={diagram1} />
          <p>Important details:</p>
          <ul>
            <li>
              <strong>A unique constraint on the key</strong> makes the "check then insert" step race-free (lesson 21).
              A race happens when two requests run at the same time and clash. Two simultaneous retries cannot both win.
            </li>
            <li>
              <strong>Store a hash of the request body.</strong> A hash is a short fingerprint of data. If the same key arrives with a <em>different</em> body,
              it is a client bug, so reject it (for example with 422).
            </li>
            <li>
              <strong>Scope keys per client or account</strong>, so different customers' keys cannot clash.
            </li>
            <li>
              <strong>Expire keys</strong> after a reasonable window (for example, 24 hours).
            </li>
            <li>
              <strong>Save the result in the same transaction as the work</strong> where possible. A transaction is a group of database changes that all succeed or all fail together. If the work involves
              an external system (a card network), pass the idempotency key <strong>downstream</strong> too.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Other idempotency techniques</h4>
          <ul>
            <li>
              <strong>Natural unique keys:</strong> a unique constraint on <code>(order_id)</code> in the payments table
              means "one payment per order", however many retries arrive.
            </li>
            <li>
              <strong>Upserts:</strong> "update or insert" in one step, for example <code>INSERT ... ON CONFLICT DO NOTHING</code> / <code>DO UPDATE</code> (PostgreSQL).
            </li>
            <li>
              <strong>Conditional updates:</strong> <code>UPDATE ... WHERE version = 7</code> or <code>If-Match</code>{" "}
              ETags (lesson 30).
            </li>
            <li>
              <strong>Deduplicating consumers:</strong> queue workers write down the IDs of messages they already handled, and skip repeats (Part 6).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Webhooks need it too</h4>
          <p>
            A webhook is a call that your server makes to another system's URL when something happens. When your API
            sends <strong>webhooks</strong> ("payment succeeded"), you retry on failure, so receivers may get{" "}
            <strong>the same event twice</strong>. Good webhook design:
          </p>
          <ul>
            <li>
              include a unique <strong>event ID</strong> so receivers can deduplicate,
            </li>
            <li>
              <strong>sign</strong> each payload with an HMAC signature (a code made with a shared secret key) so receivers can check it is really from you,
            </li>
            <li>
              <strong>retry with backoff</strong> (wait longer after each failure) for hours or days, and
            </li>
            <li>expect receivers to reply quickly and do heavy work later, in the background (asynchronously).</li>
          </ul>
          <hr />
          <h3 id="part-2-pagination">Part 2: Pagination</h3>
          <p>
            Never return a list with no limit. Always paginate, with a <strong>default page size</strong> (for example 20)
            and a <strong>maximum</strong> (for example 100).
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Offset pagination</h4>
          <p>
            Offset pagination says "skip this many items, then give me the next few". <code>limit</code> is the page
            size, and <code>offset</code> is how many items to skip.
          </p>
          <CodeBlock lang="http" code={code2} />
          <CodeBlock lang="sql" code={code3} />
          <ul>
            <li>✅ Simple, and lets users jump to "page 7".</li>
            <li>
              ❌ <strong>Slow for deep pages.</strong> The database must read and throw away all the skipped rows.{" "}
              <code>OFFSET 1000000</code> reads a million rows to return 20.
            </li>
            <li>
              ❌ <strong>Unstable when data changes.</strong> If a new order is inserted while you page, everything
              shifts by one, and you see an item <strong>twice</strong>. If one is deleted, you <strong>skip</strong>{" "}
              one.
            </li>
          </ul>
          <Timeline
            caption="Why offset pagination shows duplicates on a changing list."
            events={[
              { time: <>Page 1 (offset 0)</>, text: <>shows orders A B C D</> },
              { time: <>Meanwhile</>, text: <>a new order Z is inserted at the top</>, tone: "warn" },
              {
                time: <>Page 2 (offset 4)</>,
                text: <>now starts at D again — D E F G, so D appears twice</>,
                tone: "bad",
              },
              {
                time: <>Cursor pagination</>,
                text: <>“20 items after D” — immune to inserts and deletes</>,
                tone: "good",
              },
            ]}
          />
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Cursor (keyset) pagination</h4>
          <p>
            Cursor pagination (also called keyset pagination) uses a cursor. A cursor is a marker that points to the
            last item you received. Instead of "skip N rows", you say{" "}
            <strong>"give me the next 20 after this item"</strong>:
          </p>
          <CodeBlock lang="http" code={code4} />
          <p>
            Inside, the cursor holds the <strong>last item's sort values</strong> (for example{" "}
            <code>created_at</code> + <code>id</code>). The server turns them into a query like this:
          </p>
          <CodeBlock lang="sql" code={code5} />
          <ul>
            <li>
              ✅ <strong>Fast at any depth</strong>, because it uses an index (a sorted lookup structure) to jump straight to the position (lesson
              22).
            </li>
            <li>
              ✅ <strong>Stable.</strong> Inserts and deletes do not cause duplicates or gaps.
            </li>
            <li>
              ❌ You cannot jump to an arbitrary "page 537". You can only go next and previous (fine for feeds and infinite
              scroll).
            </li>
            <li>
              Include a <strong>unique tie-breaker</strong> (like <code>id</code>) in the sort, so items with the same
              timestamp are not skipped. A tie-breaker is a second sort field that makes every position unique.
            </li>
            <li>
              Make cursors <strong>opaque</strong> (for example, base64-encoded JSON). Opaque means clients cannot read the inside. They should not parse or build
              cursors, so you can change the format later.
            </li>
          </ul>
          <p>
            <strong>Response shape example:</strong>
          </p>
          <CodeBlock lang="json" code={code6} />
          <p>
            Some APIs put next and previous links in an HTTP <code>Link</code> header instead.
          </p>
          <p>
            <strong>Which to use:</strong>
          </p>
          <ul>
            <li>
              <strong>Offset:</strong> small datasets and admin tables that need page numbers.
            </li>
            <li>
              <strong>Cursor:</strong> feeds, timelines, large or frequently changing lists, and public APIs.
            </li>
          </ul>
          <p>
            <strong>Avoid exact total counts on huge lists.</strong> <code>COUNT(*)</code> (count all rows) over millions of rows is
            slow. Show "has more", or an approximate count, instead.
          </p>
          <hr />
          <h3 id="part-3-api-versioning">Part 3: API versioning</h3>
          <p>
            A breaking change is a change that makes existing clients fail. Versioning lets you make such changes
            without hurting clients that still use the old form.
          </p>
          <Compare
            caption="What you can change freely, and what breaks clients."
            columns={[
              {
                title: <>Safe — additive</>,
                items: [
                  { sign: "+", text: <>New endpoint</> },
                  { sign: "+", text: <>New optional request field</> },
                  { sign: "+", text: <>New response field (clients are tolerant readers)</> },
                  { sign: "+", text: <>New enum value, if clients handle unknown values</> },
                ],
              },
              {
                title: <>Breaking</>,
                items: [
                  { sign: "-", text: <>Remove or rename a field or endpoint</> },
                  { sign: "-", text: <>Change a type or meaning (rupees → paise)</> },
                  { sign: "-", text: <>Make an optional field required</> },
                  { sign: "-", text: <>Change status codes or defaults clients rely on</> },
                ],
              },
            ]}
          />
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">What counts as a breaking change?</h4>
          <p>
            <strong>Safe (non-breaking) changes:</strong>
          </p>
          <ul>
            <li>adding a new endpoint,</li>
            <li>
              adding a new <strong>optional</strong> request field,
            </li>
            <li>
              adding a new response field (clients should ignore fields they do not know. This is the{" "}
              <strong>"tolerant reader"</strong> rule),
            </li>
            <li>
              adding a new enum value, <em>if</em> clients are written to handle unknown values.
            </li>
          </ul>
          <p>
            <strong>Breaking changes:</strong>
          </p>
          <ul>
            <li>removing or renaming a field or endpoint,</li>
            <li>
              changing a field's type or meaning (<code>price</code> in rupees → paise),
            </li>
            <li>making an optional field required,</li>
            <li>changing error codes or status codes clients rely on,</li>
            <li>changing default behaviour (sort order, page size).</li>
          </ul>
          <p>
            <strong>The best strategy is to avoid breaking changes.</strong> Add new fields next to old ones and keep
            the old ones working. Remove them only after a long deprecation period. Deprecation means announcing that
            something will be removed later.
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Ways to version</h4>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>Example</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>URI path</strong>
                  </td>
                  <td>
                    <code>/v1/orders</code>, <code>/v2/orders</code>
                  </td>
                  <td>Most common. It is easy to see, route and cache</td>
                </tr>
                <tr>
                  <td>
                    <strong>Header</strong>
                  </td>
                  <td>
                    <code>Api-Version: 2027-01-25</code>
                  </td>
                  <td>Clean URLs; used for date-based versions</td>
                </tr>
                <tr>
                  <td>
                    <strong>Media type</strong>
                  </td>
                  <td>
                    <code>Accept: application/vnd.shop.v2+json</code>
                  </td>
                  <td>Precise, but less convenient</td>
                </tr>
                <tr>
                  <td>
                    <strong>Query parameter</strong>
                  </td>
                  <td>
                    <code>/orders?version=2</code>
                  </td>
                  <td>Easy, but also easy to forget</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Date-based versions</strong> (popularised by Stripe) work like this:
          </p>
          <ul>
            <li>
              each account or client is <strong>pinned</strong> to the API version that existed when it started
              integrating,
            </li>
            <li>when a breaking change is released, it becomes a new dated version,</li>
            <li>
              clients <strong>upgrade when they choose</strong>,
            </li>
            <li>
              inside, the server uses small "version change" layers that translate between versions. Old versions keep
              working, and the code is not copied.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deprecation done well</h4>
          <ol>
            <li>
              <strong>Announce early</strong>, with a clear timeline (for example, 6–12 months).
            </li>
            <li>
              <strong>Mark it in responses.</strong> The <code>Sunset</code> HTTP header (RFC 8594) tells clients the date when an
              endpoint will stop working. A deprecation notice can point to the migration guide.
            </li>
            <li>
              <strong>Monitor usage.</strong> See which clients still call the old version, and contact them directly.
            </li>
            <li>
              <strong>Provide migration guides</strong> and, where possible, tools.
            </li>
            <li>
              <strong>Only then</strong> switch it off. You can first run short "brownouts" (planned, temporary
              shutdowns) so that clients who missed the news notice.
            </li>
          </ol>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Mobile apps make this harder</h4>
          <p>
            A web frontend updates as soon as you deploy it. But <strong>mobile apps stay installed for months or
            years</strong>, and many users never update. So:
          </p>
          <ul>
            <li>keep old API versions alive longer for mobile clients,</li>
            <li>
              have the app send its <strong>app version</strong> so the server can adapt,
            </li>
            <li>
              build a <strong>"minimum supported version" / force-update</strong> mechanism for breaking changes that cannot be avoided.
            </li>
          </ul>
          <Timeline
            caption="Deprecating an API version without surprising anyone."
            events={[
              { time: <>Month 0</>, text: <>announce, with a timeline and a migration guide</> },
              { time: <>Months 0–6</>, text: <>Sunset and deprecation headers on every response</> },
              { time: <>Months 3–9</>, text: <>monitor who still calls it; contact them directly</> },
              { time: <>Month 10</>, text: <>short planned “brownouts” so late clients notice</>, tone: "warn" },
              { time: <>Month 12</>, text: <>switch it off</>, tone: "muted" },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Idempotency keys:</strong> safe retries and no duplicate side effects, at the cost of extra
              storage, lookups and careful building (races, expiry, request hashing).
            </li>
            <li>
              <strong>Offset pagination:</strong> simple, with page numbers, but slow deep pages and unstable results.
            </li>
            <li>
              <strong>Cursor pagination:</strong> fast and stable, but no random page access, and the cursor design needs
              care.
            </li>
            <li>
              <strong>URI versioning:</strong> clear and easy to route, but it can tempt teams into big "v2 rewrites".
            </li>
            <li>
              <strong>Date-based header versioning:</strong> small steps and smooth upgrades, but the server-side
              version translation is more complex.
            </li>
            <li>
              <strong>Supporting old versions:</strong> happy clients, but ongoing maintenance and testing cost.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Stripe's idempotency keys.</strong> Stripe lets clients send an <code>Idempotency-Key</code> header
            on POST requests. Retries with the same key return the original result instead of creating a second charge.
            Stripe keeps keys for a limited time (at least 24 hours). Its engineering blog post on idempotency explains
            the design and is one of the best practical references on the topic.
          </p>
          <p>
            <strong>Stripe's date-based versioning.</strong> Stripe pins each account to an API version and releases
            breaking changes as new dated versions, with internal compatibility layers so older integrations keep
            working for years. GitHub's REST API has also moved to <strong>date-based version headers</strong> (for
            example, <code>X-GitHub-Api-Version: 2022-11-28</code>).
          </p>
          <p>
            <strong>Slack's move to cursor pagination.</strong> Slack wrote about evolving its API from offset-style
            pagination to <strong>cursor-based pagination</strong> for large, changing collections, for both performance
            and consistency.
          </p>
          <p>
            <strong>Payment gateways and UPI apps.</strong> UPI is India's instant payment system. Payment flows everywhere depend on idempotent APIs and
            unique transaction references. When a payment "times out", systems check the transaction status using its
            reference rather than blindly retrying, because a duplicate debit is one of the worst possible bugs.
          </p>
          <p>
            <strong>Infinite scroll feeds.</strong> Social apps and e-commerce "load more" lists use cursor pagination.
            This is why new posts at the top do not make you see the same post twice as you scroll.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>How do you make a payment API safe to retry?</>,
                a: (
                  <>
                    <p>
                      The client sends a unique Idempotency-Key for each payment and reuses it on retries. The server
                      saves the key under a unique constraint before doing the work, and stores the response with it.
                      On a repeat, it returns the stored response instead of charging again. Scope keys per account,
                      store a request hash to reject a different body with the same key, expire keys after a day or
                      so, and pass the key to downstream processors.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why is offset pagination a problem for large or changing lists?</>,
                a: (
                  <>
                    <p>
                      OFFSET N makes the database read and throw away N rows, so deep pages get slower and slower.
                      Inserts or deletes between requests shift everything, which causes duplicates and skipped items.
                      Cursor pagination finds the position by the last item's sort key, using an index, so it is fast
                      at any depth and stable.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why include a tie-breaker like id in a cursor?</>,
                a: (
                  <>
                    <p>
                      Sort values like created_at are not unique. Without a unique tie-breaker, items that share the
                      boundary timestamp can be skipped or repeated. Sort and seek by (created_at, id).
                    </p>
                  </>
                ),
              },
              {
                q: <>What is a breaking API change? Give examples.</>,
                a: (
                  <>
                    <p>
                      Anything that makes existing correct clients fail or misbehave: removing or renaming fields,
                      changing types or units, making optional inputs required, or changing status codes or defaults.
                      Adding optional fields and endpoints is safe if clients ignore what they do not recognise.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you version an API used by mobile apps?</>,
                a: (
                  <>
                    <p>
                      Avoid breaking changes as long as you can. When you must, publish a new version (URI or
                      date-based header) and keep the old one running for a long time, because installed apps update
                      slowly. Send the app version with requests, and keep a minimum-supported-version or force-update
                      option for emergencies.
                    </p>
                  </>
                ),
              },
              {
                q: <>How should webhooks be designed for reliability?</>,
                a: (
                  <>
                    <p>
                      Give each event a unique ID so receivers can remove duplicates. Sign payloads with HMAC so
                      receivers can check them. Retry with backoff for hours or days. Expect receivers to reply quickly
                      and do the work later in the background.
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
              <strong>Retries are inevitable</strong>, so make every state-changing operation{" "}
              <strong>idempotent</strong>.
            </li>
            <li>
              Use <strong>idempotency keys</strong> (with a unique constraint, a stored response, a request hash and an
              expiry), natural unique keys, upserts or conditional updates.
            </li>
            <li>
              <strong>Always paginate.</strong> Prefer <strong>cursor (keyset) pagination</strong> with a unique
              tie-breaker and opaque cursors for large or changing lists. Use offset only for small lists.
            </li>
            <li>
              <strong>Avoid breaking changes</strong>: add, do not rename or remove. Clients should be{" "}
              <strong>tolerant readers</strong>.
            </li>
            <li>
              When you must break things, <strong>version</strong> (URI or date-based headers),{" "}
              <strong>deprecate slowly</strong> with clear timelines and <code>Sunset</code> headers, and remember that{" "}
              <strong>mobile apps live for years</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              Stripe's blog post "Designing robust and predictable APIs with idempotency" and its API documentation on
              idempotent requests
            </li>
            <li>The AWS Builders' Library article "Making retries safe with idempotent APIs"</li>
            <li>Stripe's blog post "APIs as infrastructure: future-proofing Stripe with versioning"</li>
            <li>
              <em>Use The Index, Luke!</em> by Markus Winand (the chapter on paging without OFFSET)
            </li>
            <li>Google API Improvement Proposals on pagination (AIP-158) and versioning (AIP-185)</li>
            <li>Slack's engineering blog post "Evolving API Pagination at Slack"</li>
            <li>RFC 8594 (The Sunset HTTP Header Field)</li>
          </ul>
          <p>
            <em>
              This wraps up Part 5. Next up, Part 6: Async &amp; Event-Driven Systems, starting with "Queues vs
              Pub/Sub".
            </em>
          </p>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
