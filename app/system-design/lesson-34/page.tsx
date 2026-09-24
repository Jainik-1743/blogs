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
          <p>Three small details decide whether an API survives the real world.</p>
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
              installed mobile apps, which users haven't updated, <strong>crash on launch</strong>.
            </li>
          </ol>
          <p>
            <strong>Idempotency</strong>, <strong>pagination</strong> and <strong>versioning</strong> are the fixes.
            They don't look exciting, but they're the difference between a demo API and a production API.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <ul>
            <li>
              <strong>Idempotency</strong> is like a <strong>lift button</strong>. Pressing it once or ten times still
              calls <strong>one</strong> lift. A good API makes "do it again" safe.
            </li>
            <li>
              <strong>Pagination</strong> is like a <strong>book</strong>. You don't read all 900 pages at once. You
              read a page at a time, with a <strong>bookmark</strong> so you can continue exactly where you stopped,
              even if someone inserts new pages.
            </li>
            <li>
              <strong>Versioning</strong> is like <strong>electrical sockets</strong>. A new appliance design must still
              fit existing sockets, or come with an adapter. You don't rewire everyone's house overnight.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <hr />
          <h3 id="part-1-idempotency">Part 1: Idempotency</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Why retries are unavoidable</h4>
          <p>
            Networks fail in an annoying way: <strong>the client often can't tell whether the request succeeded</strong>
            .
          </p>
          <SequenceDiagram
            caption="Why retries are unavoidable. The client can't tell “failed” from “succeeded, but the reply was lost”."
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
            Retries happen everywhere: mobile apps, SDKs, load balancers, queues (post 18) and users tapping twice. So{" "}
            <strong>every operation that changes something should be safe to repeat</strong>.
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Naturally idempotent vs not</h4>
          <ul>
            <li>
              <strong>GET, PUT, DELETE</strong> are idempotent by design (post 3). "Set the name to Asha" twice gives
              the same result. "Delete order 7" twice leaves it deleted.
            </li>
            <li>
              <strong>POST</strong> usually isn't. "Create a payment" twice creates <strong>two</strong> payments.
            </li>
            <li>
              <strong>Relative updates</strong> aren't either. "Add ₹100 to the balance" twice adds ₹200.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Idempotency keys</h4>
          <p>
            The standard fix, made popular by Stripe: the <strong>client generates a unique key</strong> (such as a
            UUID) for each logical operation, and sends it in a header. <strong>Retries reuse the same key.</strong>
          </p>
          <CodeBlock lang="http" code={code1} />
          <p>The server's logic:</p>
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
              <strong>A unique constraint on the key</strong> makes the "check then insert" step race-free (post 21).
              Two simultaneous retries can't both win.
            </li>
            <li>
              <strong>Store a hash of the request body.</strong> If the same key arrives with a <em>different</em> body,
              it's a client bug, so reject it (for example with 422).
            </li>
            <li>
              <strong>Scope keys per client or account</strong>, so different customers' keys can't collide.
            </li>
            <li>
              <strong>Expire keys</strong> after a reasonable window (for example, 24 hours).
            </li>
            <li>
              <strong>Save the result in the same transaction as the work</strong> where possible. If the work involves
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
              <strong>Upserts:</strong> <code>INSERT ... ON CONFLICT DO NOTHING</code> / <code>DO UPDATE</code>.
            </li>
            <li>
              <strong>Conditional updates:</strong> <code>UPDATE ... WHERE version = 7</code> or <code>If-Match</code>{" "}
              ETags (post 30).
            </li>
            <li>
              <strong>Deduplicating consumers:</strong> queue workers record processed message IDs (Part 6).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Webhooks need it too</h4>
          <p>
            When your API sends <strong>webhooks</strong> ("payment succeeded") to other systems, you'll retry on
            failure, so receivers may get <strong>the same event twice</strong>. Good webhook design:
          </p>
          <ul>
            <li>
              include a unique <strong>event ID</strong> so receivers can deduplicate,
            </li>
            <li>
              <strong>sign</strong> each payload with an HMAC signature so receivers can verify it's really from you,
            </li>
            <li>
              <strong>retry with backoff</strong> for hours or days, and
            </li>
            <li>expect receivers to respond quickly, doing heavy processing asynchronously.</li>
          </ul>
          <hr />
          <h3 id="part-2-pagination">Part 2: Pagination</h3>
          <p>
            Never return unbounded lists. Always paginate, with a <strong>default page size</strong> (for example 20)
            and a <strong>maximum</strong> (for example 100).
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Offset pagination</h4>
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
              shifts by one: you'll see an item <strong>twice</strong>. If one is deleted, you'll <strong>skip</strong>{" "}
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
            Instead of "skip N rows", say <strong>"give me the next 20 after this item"</strong>:
          </p>
          <CodeBlock lang="http" code={code4} />
          <p>
            Behind the scenes, the cursor encodes the <strong>last item's sort values</strong> (for example{" "}
            <code>created_at</code> + <code>id</code>):
          </p>
          <CodeBlock lang="sql" code={code5} />
          <ul>
            <li>
              ✅ <strong>Fast at any depth</strong>, because it uses an index to jump straight to the position (post
              22).
            </li>
            <li>
              ✅ <strong>Stable.</strong> Inserts and deletes don't cause duplicates or gaps.
            </li>
            <li>
              ❌ You can't jump to an arbitrary "page 537". Navigation is next and previous (fine for feeds and infinite
              scroll).
            </li>
            <li>
              Include a <strong>unique tie-breaker</strong> (like <code>id</code>) in the sort, so items with the same
              timestamp aren't skipped.
            </li>
            <li>
              Make cursors <strong>opaque</strong> (for example, base64-encoded JSON). Clients shouldn't parse or build
              them, so you can change the format later.
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
            <strong>Avoid exact total counts on huge lists.</strong> <code>COUNT(*)</code> over millions of rows is
            slow. Show "has more", or an approximate count, instead.
          </p>
          <hr />
          <h3 id="part-3-api-versioning">Part 3: API versioning</h3>
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
              adding a new response field (clients should ignore fields they don't know, the{" "}
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
            <strong>The best strategy is to avoid breaking changes.</strong> Add new fields next to old ones, keep old
            ones working, and only remove them after a long deprecation period.
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
                  <td>Most common; very visible and easy to route and cache</td>
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
                  <td>Easy, but easy to forget</td>
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
            <li>when a breaking change ships, it's a new dated version,</li>
            <li>
              clients <strong>upgrade when they choose</strong>,
            </li>
            <li>
              internally, the server translates between versions with small "version change" layers, so old versions
              keep working without copying all the code.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deprecation done well</h4>
          <ol>
            <li>
              <strong>Announce early</strong>, with a clear timeline (for example, 6–12 months).
            </li>
            <li>
              <strong>Mark it in responses.</strong> The <code>Sunset</code> HTTP header (RFC 8594) gives the date an
              endpoint will stop working, and a deprecation notice points to the migration guide.
            </li>
            <li>
              <strong>Monitor usage.</strong> See which clients still call the old version, and contact them directly.
            </li>
            <li>
              <strong>Provide migration guides</strong> and, where possible, tools.
            </li>
            <li>
              <strong>Only then</strong> switch it off, perhaps with short "brownouts" (planned temporary shutdowns)
              first, so stragglers notice.
            </li>
          </ol>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Mobile apps make this harder</h4>
          <p>
            Web frontends update instantly, but <strong>mobile apps stay installed for months or years</strong>. Many
            users never update. So:
          </p>
          <ul>
            <li>keep old API versions alive longer for mobile clients,</li>
            <li>
              have the app send its <strong>app version</strong> so the server can adapt,
            </li>
            <li>
              build a <strong>"minimum supported version" / force-update</strong> mechanism for truly unavoidable
              breaking changes.
            </li>
          </ul>
          <Timeline
            caption="Deprecating an API version without surprising anyone."
            events={[
              { time: <>Month 0</>, text: <>announce, with a timeline and a migration guide</> },
              { time: <>Months 0–6</>, text: <>Sunset and deprecation headers on every response</> },
              { time: <>Months 3–9</>, text: <>monitor who still calls it; contact them directly</> },
              { time: <>Month 10</>, text: <>short planned “brownouts” so stragglers notice</>, tone: "warn" },
              { time: <>Month 12</>, text: <>switch it off</>, tone: "muted" },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Idempotency keys:</strong> safe retries and no duplicate side effects, at the cost of extra
              storage, lookups and implementation care (races, expiry, request hashing).
            </li>
            <li>
              <strong>Offset pagination:</strong> simple, with page numbers, but slow deep pages and unstable results.
            </li>
            <li>
              <strong>Cursor pagination:</strong> fast and stable, but no random page access, and cursor design needs
              thought.
            </li>
            <li>
              <strong>URI versioning:</strong> clear and easy to route, but encourages big "v2 rewrites".
            </li>
            <li>
              <strong>Date-based header versioning:</strong> fine-grained and smooth upgrades, but more complex
              server-side version translation.
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
            Stripe keeps keys for a limited time (around 24 hours). Its engineering blog post on idempotency explains
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
            <strong>Payment gateways and UPI apps.</strong> Payment flows everywhere depend on idempotent APIs and
            unique transaction references. When a payment "times out", systems check the transaction status using its
            reference rather than blindly retrying, because a duplicate debit is one of the worst possible bugs.
          </p>
          <p>
            <strong>Infinite scroll feeds.</strong> Social apps and e-commerce "load more" lists use cursor pagination.
            It's why new posts appearing at the top don't make you see the same post twice as you scroll.
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
                      The client sends a unique Idempotency-Key per logical payment and reuses it on retries. The server
                      records the key under a unique constraint before doing the work, stores the response with it, and
                      on a repeat returns the stored response instead of charging again. Scope keys per account, store a
                      request hash to reject mismatched bodies, expire them after a day or so, and pass the key to
                      downstream processors.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why is offset pagination a problem for large or changing lists?</>,
                a: (
                  <>
                    <p>
                      OFFSET N makes the database read and discard N rows, so deep pages get slower and slower, and
                      inserts or deletes between requests shift everything, causing duplicates and skipped items. Cursor
                      pagination seeks by the last item's sort key through an index, so it's fast at any depth and
                      stable.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why include a tie-breaker like id in a cursor?</>,
                a: (
                  <>
                    <p>
                      Sort values like created_at aren't unique. Without a unique tie-breaker, items sharing the
                      boundary timestamp can be skipped or repeated. Sort and seek by (created_at, id).
                    </p>
                  </>
                ),
              },
              {
                q: <>What's a breaking API change? Give examples.</>,
                a: (
                  <>
                    <p>
                      Anything that makes existing correct clients fail or misbehave: removing or renaming fields,
                      changing types or units, making optional inputs required, or changing status codes or defaults.
                      Adding optional fields and endpoints is safe if clients ignore what they don't recognise.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you version an API used by mobile apps?</>,
                a: (
                  <>
                    <p>
                      Avoid breaking changes as long as possible; when you must, publish a new version (URI or
                      date-based header) and keep the old one alive for a long time, because installed apps update
                      slowly. Send the app version with requests, and keep a minimum-supported-version / force-update
                      mechanism for emergencies.
                    </p>
                  </>
                ),
              },
              {
                q: <>How should webhooks be designed for reliability?</>,
                a: (
                  <>
                    <p>
                      Give each event a unique ID so receivers can deduplicate, sign payloads with HMAC so receivers can
                      verify them, retry with backoff for hours or days, and expect receivers to acknowledge quickly and
                      process asynchronously.
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
              <strong>Avoid breaking changes</strong>: add, don't rename or remove. Clients should be{" "}
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
