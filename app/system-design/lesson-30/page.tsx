import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Layers, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-30")!;

export const metadata: Metadata = {
  title: `Lesson 30 — ${lesson.title}`,
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

const code1 = `POST /getUserOrders        {"userId": 42}
POST /createNewOrder       {...}
POST /deleteOrderById      {"id": 7}
→ always 200 OK, with {"success": false, "error": "not found"} when things fail`;

const code2 = `GET    /users/42/orders
POST   /orders
DELETE /orders/7
→ 200, 201, 404, 409 … with clear error bodies`;

const code3 = `POST /orders/5521/cancel      (an action sub-resource: pragmatic and common)
POST /password-resets         (model the action as creating a resource)`;

const code4 = `200 OK             – success with a body
201 Created        – new resource; Location: /orders/5521
202 Accepted       – will be processed later (async)
204 No Content     – success, nothing to return
400 Bad Request    – malformed input
401 Unauthorized   – not logged in / bad token
403 Forbidden      – logged in, but not allowed
404 Not Found      – no such resource (or hidden for privacy)
409 Conflict       – clashes with current state
422 Unprocessable  – valid JSON, fails business validation
429 Too Many Req.  – rate limited; include Retry-After
500 / 503          – server-side problems`;

const code5 = `HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{
  "type": "https://api.shop.com/errors/insufficient-stock",
  "title": "Insufficient stock",
  "status": 422,
  "detail": "Only 2 units of product 991 are available.",
  "instance": "/orders",
  "errors": [{ "field": "items[0].quantity", "message": "max 2" }]
}`;

const code6 = `GET /products?category=shoes&brand=nike&min_price=1000&max_price=5000
GET /products?sort=-created_at            (minus = descending)
GET /products?q=running+shoes             (search)
GET /products?fields=id,name,price        (only these fields)
GET /orders?status=pending&created_after=2027-01-01`;

const code7 = `paths:
  /orders/{id}:
    get:
      summary: Get an order
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200": { description: The order }
        "404": { description: Not found }`;

export default function SdLessonThreeZeroPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>Here are two APIs for the same feature.</p>
          <p>
            <strong>API A:</strong>
          </p>
          <CodeBlock lang="http" code={code1} />
          <p>
            <strong>API B:</strong>
          </p>
          <CodeBlock lang="http" code={code2} />
          <p>
            Both "work". But API B is <strong>predictable</strong>: a developer who has used any good API can guess how
            it behaves. Caches, load balancers and monitoring tools understand it. Clients can retry safely.
          </p>
          <p>
            API A forces everyone to read the docs for every endpoint, and it hides failures from every tool in between.
          </p>
          <p>
            An API is a <strong>contract</strong> that other teams, mobile apps and partners depend on for years. Good
            design saves everyone time; bad design is very hard to fix later.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think of a <strong>well-organised library</strong>.
          </p>
          <ul>
            <li>
              Everything is a <strong>thing</strong> with an address: <code>/books/1984</code>, <code>/members/42</code>
              , <code>/members/42/loans</code>.
            </li>
            <li>
              You use a <strong>small set of standard actions</strong> on those things: <em>look at</em> (GET),{" "}
              <em>add</em> (POST), <em>replace</em> (PUT), <em>change part of</em> (PATCH), <em>remove</em> (DELETE).
            </li>
            <li>
              The librarian answers with <strong>standard responses</strong>: "Here it is" (200), "Added" (201), "We
              don't have that" (404), "You're not a member" (401).
            </li>
          </ul>
          <p>
            <strong>REST</strong> (Representational State Transfer) is a style of designing APIs around{" "}
            <strong>resources</strong> (nouns) and <strong>standard HTTP methods</strong> (verbs), using HTTP the way it
            was designed.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="rest-s-core-principles-in-plain-words">REST's core principles (in plain words)</h3>
          <p>Roy Fielding described REST in his 2000 PhD dissertation. The main ideas:</p>
          <ul>
            <li>
              <strong>Client–server:</strong> the frontend and backend are separate and evolve independently.
            </li>
            <li>
              <strong>Stateless:</strong> each request contains everything needed to handle it (like an auth token). The
              server doesn't remember previous requests. This is what makes horizontal scaling easy (post 7).
            </li>
            <li>
              <strong>Cacheable:</strong> responses say whether they can be cached (post 14).
            </li>
            <li>
              <strong>Uniform interface:</strong> resources with URLs, standard methods, and standard representations
              (usually JSON).
            </li>
            <li>
              <strong>Layered system:</strong> clients don't care whether there are proxies, gateways or CDNs in between
              (post 13).
            </li>
          </ul>
          <h3 id="1-model-resources-with-nouns">1. Model resources with nouns</h3>
          <Compare
            caption="Resources are nouns; the HTTP method is the verb."
            columns={[
              {
                title: <>✅ Good</>,
                items: [
                  { sign: "+", text: <>GET /products</> },
                  { sign: "+", text: <>GET /products/991</> },
                  { sign: "+", text: <>POST /products</> },
                  { sign: "+", text: <>PATCH /products/991</> },
                  { sign: "+", text: <>DELETE /products/991</> },
                ],
              },
              {
                title: <>❌ Avoid</>,
                items: [
                  { sign: "-", text: <>GET /getAllProducts</> },
                  { sign: "-", text: <>POST /getProduct</> },
                  { sign: "-", text: <>POST /updateProductPrice</> },
                  { sign: "-", text: <>GET /deleteProduct?id=991 — GET must never change data</> },
                ],
              },
            ]}
          />
          <p>Rules of thumb:</p>
          <ul>
            <li>
              Use <strong>plural nouns</strong> for collections: <code>/users</code>, <code>/orders</code>.
            </li>
            <li>
              Use <strong>IDs</strong> for single items: <code>/orders/5521</code>.
            </li>
            <li>
              <strong>Nest</strong> to show ownership, but only one or two levels: <code>/users/42/orders</code> ✅.{" "}
              <code>/users/42/orders/5521/items/3/reviews</code> ❌ is too deep. Prefer{" "}
              <code>/order-items/3/reviews</code>, or a filter.
            </li>
            <li>
              Use <strong>lowercase, hyphen-separated</strong> paths: <code>/shipping-addresses</code>.
            </li>
          </ul>
          <p>
            <strong>What about actions that aren't CRUD?</strong> "Cancel an order" or "send a password reset" don't map
            neatly onto methods. Two common approaches:
          </p>
          <CodeBlock lang="http" code={code3} />
          <h3 id="2-use-http-methods-correctly">2. Use HTTP methods correctly</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Use</th>
                  <th>Idempotent?</th>
                  <th>Typical success code</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>GET</td>
                  <td>Read a resource or list</td>
                  <td>✅ Yes</td>
                  <td>200</td>
                </tr>
                <tr>
                  <td>POST</td>
                  <td>Create, or trigger an action</td>
                  <td>❌ No</td>
                  <td>201 (created) / 200 / 202 (accepted for later)</td>
                </tr>
                <tr>
                  <td>PUT</td>
                  <td>Replace a resource completely</td>
                  <td>✅ Yes</td>
                  <td>200 / 204</td>
                </tr>
                <tr>
                  <td>PATCH</td>
                  <td>Change some fields</td>
                  <td>Usually treated as ❌</td>
                  <td>200 / 204</td>
                </tr>
                <tr>
                  <td>DELETE</td>
                  <td>Remove</td>
                  <td>✅ Yes</td>
                  <td>204 / 200</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Never change data with GET.</strong> Browsers, crawlers and caches assume GET is safe and may call
            it at any time.
          </p>
          <h3 id="3-return-meaningful-status-codes">3. Return meaningful status codes</h3>
          <p>(See post 3 for the full list.) The ones every API should use correctly:</p>
          <CodeBlock lang="http" code={code4} />
          <h3 id="4-consistent-error-responses">4. Consistent error responses</h3>
          <p>
            Every error should have the <strong>same shape</strong>, with a machine-readable code and a human-readable
            message. There's a standard for this, <strong>Problem Details</strong> (RFC 9457):
          </p>
          <CodeBlock lang="json" code={code5} />
          <ul>
            <li>
              <strong>Clients</strong> can branch on the <code>type</code> (or on a <code>code</code> field).
            </li>
            <li>
              <strong>Humans</strong> can read <code>detail</code>.
            </li>
            <li>
              <strong>Never</strong> leak stack traces or internal details in production errors.
            </li>
          </ul>
          <h3 id="5-filtering-sorting-searching-and-field-selection">
            5. Filtering, sorting, searching and field selection
          </h3>
          <p>
            Use <strong>query parameters</strong> on collections:
          </p>
          <CodeBlock lang="http" code={code6} />
          <p>
            Lists should <strong>always be paginated</strong>. Never return "all orders" (covered in post 34).
          </p>
          <h3 id="6-design-request-and-response-bodies-well">6. Design request and response bodies well</h3>
          <ul>
            <li>
              Use <strong>JSON</strong> with consistent naming, either <code>snake_case</code> or <code>camelCase</code>
              . Pick one and stick to it.
            </li>
            <li>
              Use <strong>ISO 8601</strong> dates with time zones: <code>"2027-01-11T09:30:00Z"</code>.
            </li>
            <li>
              Represent <strong>money</strong> as integers in the smallest unit (<code>129900</code> paise) or as
              decimal strings (<code>"1299.00"</code>), plus a currency. <strong>Never use floats for money.</strong>
            </li>
            <li>
              Use <strong>stable string IDs</strong> for resources.
            </li>
            <li>
              Use <strong>enums as strings</strong> (<code>"status": "shipped"</code>) rather than magic numbers.
            </li>
            <li>
              Don't expose <strong>database internals</strong> (like column names such as <code>usr_tbl_fk</code>) in
              the API. The API is a contract, not a mirror of your tables.
            </li>
          </ul>
          <h3 id="7-use-http-features-you-get-for-free">7. Use HTTP features you get for free</h3>
          <SequenceDiagram
            caption="Optimistic concurrency over HTTP with ETag and If-Match. The second editor can't silently overwrite the first."
            actors={["Editor A", "API", "Editor B"]}
            messages={[
              { from: 0, to: 1, label: <>GET /products/991</> },
              { from: 1, to: 0, label: <>200 · ETag: "v7"</>, reply: true },
              { from: 2, to: 1, label: <>GET /products/991</> },
              { from: 1, to: 2, label: <>200 · ETag: "v7"</>, reply: true },
              { from: 0, to: 1, label: <>PATCH · If-Match: "v7"</> },
              { from: 1, to: 0, label: <>200 · ETag: "v8"</>, reply: true },
              { from: 2, to: 1, label: <>PATCH · If-Match: "v7"</> },
              { from: 1, to: 2, label: <>412 Precondition Failed</>, note: <>re-read, merge, retry</>, reply: true },
            ]}
          />
          <ul>
            <li>
              <strong>Caching:</strong> <code>Cache-Control</code> and <code>ETag</code> on GET responses (posts 3 and
              14).
            </li>
            <li>
              <strong>Conditional updates:</strong> clients send <code>If-Match: "&lt;etag&gt;"</code> on PUT or PATCH.
              If someone else changed the resource first, return <strong>412 Precondition Failed</strong>. This is
              optimistic concurrency (post 21) over HTTP.
            </li>
            <li>
              <strong>Compression:</strong> gzip or Brotli.
            </li>
            <li>
              <strong>Content negotiation:</strong> <code>Accept</code> / <code>Content-Type</code>.
            </li>
          </ul>
          <h3 id="8-security-basics">8. Security basics</h3>
          <ul>
            <li>
              <strong>Always HTTPS.</strong>
            </li>
            <li>
              Put tokens in the{" "}
              <strong>
                <code>Authorization</code> header
              </strong>
              , never in URLs. URLs end up in logs and browser history.
            </li>
            <li>
              Check <strong>authorisation for every object</strong>. Just because a user is logged in doesn't mean they
              can read <code>/orders/5521</code>. (This is the top API vulnerability, often called IDOR or broken
              object-level authorisation. More in Part 9.)
            </li>
            <li>
              <strong>Validate all input</strong>, and limit request sizes.
            </li>
            <li>
              Apply <strong>rate limits</strong>, returning 429 with <code>Retry-After</code> (Part 7).
            </li>
            <li>
              Configure <strong>CORS</strong> carefully for browser clients (post 3).
            </li>
          </ul>
          <h3 id="9-document-and-design-the-contract-first">9. Document and design the contract first</h3>
          <p>
            <strong>OpenAPI</strong> (formerly called Swagger) is the standard way to describe REST APIs in a YAML or
            JSON file:
          </p>
          <CodeBlock lang="yaml" code={code7} />
          <p>From one OpenAPI file you can generate:</p>
          <ul>
            <li>interactive documentation,</li>
            <li>client SDKs,</li>
            <li>server stubs,</li>
            <li>mock servers,</li>
            <li>contract tests.</li>
          </ul>
          <p>
            Many teams write the spec <strong>before</strong> the code ("design-first"), so frontend and backend can
            work in parallel.
          </p>
          <h3 id="10-rest-maturity-how-restful-do-you-need-to-be">
            10. REST maturity: how "RESTful" do you need to be?
          </h3>
          <p>
            The <strong>Richardson Maturity Model</strong> describes levels:
          </p>
          <ul>
            <li>
              <strong>Level 0:</strong> one endpoint, everything is POST (like old SOAP or RPC over HTTP).
            </li>
            <li>
              <strong>Level 1:</strong> separate resources (URLs).
            </li>
            <li>
              <strong>Level 2:</strong> proper HTTP methods and status codes.{" "}
              <strong>← most good real-world APIs are here.</strong>
            </li>
            <li>
              <strong>Level 3:</strong> <strong>HATEOAS</strong>: responses include links to related actions (
              <code>"cancel": &#123;"href": "/orders/5521/cancel"&#125;</code>), so clients can discover what to do
              next.
            </li>
          </ul>
          <p>
            Level 3 is elegant, but rarely used fully in practice.{" "}
            <strong>Level 2, done consistently, is the practical goal.</strong>
          </p>
          <Layers
            caption="The Richardson Maturity Model. Consistent Level 2 is the practical goal."
            layers={[
              {
                name: <>Level 3 — HATEOAS</>,
                tech: <>responses carry links to next actions</>,
                desc: <>elegant, rarely used fully</>,
              },
              {
                name: <>Level 2 — HTTP verbs + status codes</>,
                tech: <>GET/POST/PATCH/DELETE, 201/404/409</>,
                desc: <>← most good APIs</>,
              },
              { name: <>Level 1 — resources</>, tech: <>separate URLs per thing</>, desc: <>/orders/5521</> },
              { name: <>Level 0 — one endpoint</>, tech: <>everything is POST</>, desc: <>RPC/SOAP over HTTP</> },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅ REST is <strong>simple, universal and cacheable</strong>, and it works with every language, browser,
              proxy and tool.
            </li>
            <li>
              ✅ It's easy to debug with <code>curl</code> and browser DevTools.
            </li>
            <li>
              ❌ <strong>Over-fetching and under-fetching:</strong> fixed responses may include too much data, or need
              several calls to build one screen (GraphQL, post 32, targets this).
            </li>
            <li>
              ❌ <strong>Chatty</strong> for complex screens: many round trips on mobile networks.
            </li>
            <li>
              ❌ <strong>Text-based JSON</strong> is bigger and slower to parse than binary formats, which matters for
              high-volume internal calls (gRPC, post 31).
            </li>
            <li>
              ❌ <strong>Not great for streaming</strong> or real-time updates (post 33).
            </li>
          </ul>
          <p>
            <strong>When not to use plain REST:</strong> high-performance internal service-to-service calls (consider
            gRPC), clients with very varied data needs (consider GraphQL), and real-time push (use WebSockets or SSE).
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Stripe</strong> is often called the gold standard of REST API design:
          </p>
          <ul>
            <li>
              clean resource URLs (<code>/v1/customers</code>, <code>/v1/payment_intents</code>),
            </li>
            <li>consistent error objects with clear types and codes,</li>
            <li>cursor-based pagination,</li>
            <li>idempotency keys for safe retries,</li>
            <li>and excellent documentation.</li>
          </ul>
          <p>Many companies copy its patterns.</p>
          <p>
            <strong>GitHub's REST API</strong> uses standard methods, status codes, <code>ETag</code>-based conditional
            requests (which don't count against rate limits when nothing has changed), pagination via <code>Link</code>{" "}
            headers, and clear rate-limit headers. It's a good reference for large public APIs.
          </p>
          <p>
            <strong>Microsoft, Google and Zalando</strong> have all published their internal API design guidelines.
            Microsoft's REST API Guidelines, Google's API Improvement Proposals (AIPs) and Zalando's RESTful API
            Guidelines are used by thousands of engineers to keep hundreds of APIs consistent.
          </p>
          <p>
            <strong>Public government and banking APIs.</strong> Many open-banking and public-data APIs are REST with
            OpenAPI specs, because REST's simplicity and wide tooling make it easy for many external developers to
            integrate.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What makes an API RESTful?</>,
                a: (
                  <>
                    <p>
                      Resources identified by URLs, manipulated through standard HTTP methods with correct semantics
                      (safe GETs, idempotent PUT and DELETE), stateless requests carrying their own auth, cacheable
                      responses, meaningful status codes and standard representations like JSON.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you model an action like “cancel order” in REST?</>,
                a: (
                  <>
                    <p>
                      Either as an action sub-resource (POST /orders/5521/cancel), which is pragmatic and common, or as
                      creating a resource (POST /order-cancellations). Never as GET, and not by overloading PATCH with
                      hidden side effects.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why not return 200 with an error in the body?</>,
                a: (
                  <>
                    <p>
                      Monitoring, caches, load balancers, retries and client libraries all branch on status codes. A 200
                      error looks like success to every tool in between, hides outages and can get cached. Return the
                      right 4xx or 5xx with a consistent Problem Details body.
                    </p>
                  </>
                ),
              },
              {
                q: <>How should an API represent money?</>,
                a: (
                  <>
                    <p>
                      As integers in the smallest currency unit (129900 paise) or as decimal strings, always with an
                      explicit currency code. Never as floats, which can't represent many decimal values exactly.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's the most common API security bug?</>,
                a: (
                  <>
                    <p>
                      Broken object-level authorisation (IDOR): checking that a user is logged in but not that they may
                      access this specific object, so changing /orders/5521 to /orders/5522 returns someone else's
                      order. Check ownership or permission on every object access.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is OpenAPI used for?</>,
                a: (
                  <>
                    <p>
                      A machine-readable contract for a REST API, from which you generate docs, client SDKs, server
                      stubs, mocks and contract tests. Writing it first lets frontend and backend work in parallel.
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
              Design around <strong>resources (nouns)</strong> and <strong>standard HTTP methods (verbs)</strong>. Keep
              nesting shallow, and use action sub-resources for non-CRUD operations.
            </li>
            <li>
              Return <strong>correct status codes</strong> and <strong>consistent error bodies</strong> (Problem
              Details). Never return 200 for failures.
            </li>
            <li>
              Support <strong>filtering, sorting, field selection and pagination</strong> with query parameters.
            </li>
            <li>
              Use HTTP's built-in features, <strong>caching, ETags/If-Match and compression</strong>, and follow
              security basics: <strong>HTTPS, auth headers, per-object authorisation, rate limits</strong>.
            </li>
            <li>
              Describe the API with <strong>OpenAPI</strong>, design the contract first, and aim for{" "}
              <strong>consistent Level 2 REST</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              Roy Fielding's dissertation "Architectural Styles and the Design of Network-based Software Architectures"
              (chapter 5, "Representational State Transfer")
            </li>
            <li>Microsoft REST API Guidelines (on GitHub)</li>
            <li>Google API Improvement Proposals (AIPs)</li>
            <li>Zalando RESTful API Guidelines</li>
            <li>The OpenAPI Specification and RFC 9457 (Problem Details for HTTP APIs)</li>
            <li>Martin Fowler's article "Richardson Maturity Model"</li>
            <li>The System Design Primer on GitHub (section "Representational state transfer (REST)")</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
