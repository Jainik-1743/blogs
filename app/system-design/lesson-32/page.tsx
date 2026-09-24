import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-32")!;

export const metadata: Metadata = {
  title: `Lesson 32 — ${lesson.title}`,
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

const code1 = `type User {
  id: ID!
  name: String!
  avatarUrl: String
  loyaltyPoints: Int!
  orders(last: Int): [Order!]!
}

type Order {
  id: ID!
  total: Int!
  createdAt: String!
  items: [OrderItem!]!
}

type OrderItem {
  quantity: Int!
  product: Product!
}

type Product {
  id: ID!
  name: String!
  thumbnailUrl: String
}

type Query {
  user(id: ID!): User
}

type Mutation {
  updateProfile(name: String, avatarUrl: String): User!
}`;

const code2 = `query ProfileScreen {
  user(id: "42") {
    name
    avatarUrl
    loyaltyPoints
    orders(last: 3) {
      total
      items {
        product { name thumbnailUrl }
      }
    }
  }
}`;

const code3 = `{
  "data": {
    "user": {
      "name": "Asha",
      "avatarUrl": "…/42.jpg",
      "loyaltyPoints": 1250,
      "orders": [
        { "total": 129900, "items": [ { "product": { "name": "Running shoes", "thumbnailUrl": "…" } } ] }
      ]
    }
  }
}`;

const code4 = `mutation { updateProfile(name: "Asha K") { id name } }`;

const code5 = `subscription { orderStatusChanged(orderId: "5521") { status } }`;

const code6 = `const resolvers = {
  Query: {
    user: (_, { id }) => db.users.findById(id),
  },
  User: {
    orders: (user, { last }) => db.orders.findRecent(user.id, last),
    loyaltyPoints: (user) => loyaltyService.getPoints(user.id),  // could be another service!
  },
  OrderItem: {
    product: (item) => db.products.findById(item.productId),
  },
};`;

const code7 = `const productLoader = new DataLoader(ids => db.products.findByIds(ids)); // 1 query for all

OrderItem: {
  product: (item) => productLoader.load(item.productId),
}`;

const code8 = `{ user(id: "1") { friends { friends { friends { friends { name } } } } } }`;

export default function SdLessonThreeTwoPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Your mobile app's profile screen shows a user's name and photo, their last 3 orders with product thumbnails,
            and their loyalty points. With your REST API, that takes:
          </p>
          <SequenceDiagram
            caption="The profile screen over REST. Six round trips on a slow mobile network, most fields discarded."
            actors={["Mobile app", "REST API"]}
            messages={[
              { from: 0, to: 1, label: <>GET /users/42</>, note: <>40 fields, 2 needed</> },
              { from: 0, to: 1, label: <>GET /users/42/orders?limit=3</> },
              { from: 0, to: 1, label: <>GET /products/991</> },
              { from: 0, to: 1, label: <>GET /products/405</> },
              { from: 0, to: 1, label: <>GET /products/17</> },
              { from: 0, to: 1, label: <>GET /users/42/loyalty</> },
              {
                from: 0,
                to: 0,
                label: <>With GraphQL: one POST /graphql returning exactly the fields the screen draws</>,
                divider: true,
              },
            ]}
          />
          <p>
            That's <strong>six round trips</strong> on a slow mobile network, and most of the data downloaded is{" "}
            <strong>thrown away</strong>. Meanwhile, the web team wants a <em>different</em> set of fields for the same
            screen. The backend team is tired of adding new endpoints for every screen.
          </p>
          <p>
            <strong>GraphQL</strong> was created to solve this:{" "}
            <strong>let the client ask for exactly the data it needs, in one request.</strong>
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>Think about ordering food.</p>
          <p>
            <strong>REST is like set meals.</strong> "Meal #3" always comes with rice, dal, sabzi, roti and a sweet. If
            you only want dal and roti, you still get the whole plate. If you want dal from Meal #3 and paneer from Meal
            #5, you place <strong>two orders</strong>.
          </p>
          <p>
            <strong>GraphQL is like a buffet counter where you write your exact order.</strong> "Dal, 2 rotis, and the
            paneer from the other counter, please." You get <strong>exactly that, on one plate, in one trip</strong>.
          </p>
          <p>The kitchen (the server) needs to be smarter to handle any combination. That's the trade-off.</p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="the-schema-a-typed-menu">The schema: a typed menu</h3>
          <p>
            A GraphQL server publishes a <strong>schema</strong> describing every type and how they connect:
          </p>
          <CodeBlock lang="graphql" code={code1} />
          <p>
            (<code>!</code> means "never null".)
          </p>
          <h3 id="queries-ask-for-exactly-what-you-need">Queries: ask for exactly what you need</h3>
          <p>
            One request to a <strong>single endpoint</strong> (usually <code>POST /graphql</code>):
          </p>
          <CodeBlock lang="graphql" code={code2} />
          <p>
            The response has <strong>exactly that shape</strong>:
          </p>
          <CodeBlock lang="json" code={code3} />
          <p>
            That's six REST calls turned into <strong>one request</strong>, with <strong>no wasted fields</strong>.
          </p>
          <h3 id="mutations-and-subscriptions">Mutations and subscriptions</h3>
          <ul>
            <li>
              <strong>Mutations</strong> change data (like POST, PUT and DELETE in REST):
              <CodeBlock lang="graphql" code={code4} />
            </li>
            <li>
              <strong>Subscriptions</strong> get real-time updates, usually over WebSockets:
              <CodeBlock lang="graphql" code={code5} />
            </li>
          </ul>
          <h3 id="resolvers-how-the-server-fills-in-the-data">Resolvers: how the server fills in the data</h3>
          <p>
            On the server, each field has a <strong>resolver</strong>, a function that knows how to fetch that piece of
            data:
          </p>
          <CodeBlock lang="js" code={code6} />
          <p>
            The GraphQL engine walks the query and calls the resolvers it needs. Resolvers can fetch from databases,
            REST APIs, gRPC services or caches. GraphQL is a <strong>layer in front of</strong> your data sources, not a
            database.
          </p>
          <h3 id="the-n-1-problem-again">The N+1 problem (again!)</h3>
          <Stats
            caption="Three orders with four items each, resolving OrderItem.product."
            stats={[
              { value: <>12</>, label: <>queries without DataLoader</>, sub: <>one per item</> },
              { value: <>1</>, label: <>query with DataLoader</>, sub: <>WHERE id IN (…12 ids)</> },
              { value: <>per request</>, label: <>batching + caching scope</>, sub: <>no stale data across users</> },
            ]}
          />
          <p>
            Look at <code>OrderItem.product</code> above. If the query returns 3 orders with 4 items each, that resolver
            runs <strong>12 times</strong>, which is 12 separate database queries. It's the same N+1 problem as in post
            5, and it's easy to create by accident in GraphQL.
          </p>
          <p>
            <strong>The fix: DataLoader (batching and caching per request).</strong> Collect all the product IDs
            requested during one tick, then fetch them in <strong>one query</strong>:
          </p>
          <CodeBlock lang="js" code={code7} />
          <p>
            That's 12 queries turned into <strong>1</strong>. Every serious GraphQL server uses this pattern.
          </p>
          <h3 id="the-caching-challenge">The caching challenge</h3>
          <p>
            REST GETs are easy to cache: each URL is a resource, and CDNs understand <code>Cache-Control</code> (post
            14). GraphQL usually sends <strong>POST requests to one URL</strong> with different queries in the body, so
            HTTP and CDN caching doesn't work out of the box.
          </p>
          <p>Solutions:</p>
          <ul>
            <li>
              <strong>Persisted queries:</strong> clients send a <strong>hash or ID</strong> of a pre-registered query
              (and can use GET), which makes responses cacheable and also blocks arbitrary queries.
            </li>
            <li>
              <strong>Client-side normalised caches</strong> (Apollo Client, Relay) store objects by ID, so the same{" "}
              <code>User:42</code> is reused across screens.
            </li>
            <li>
              <strong>Server-side caching</strong> in resolvers or DataLoaders, plus Redis (posts 15–16).
            </li>
          </ul>
          <h3 id="security-and-performance-risks">Security and performance risks</h3>
          <p>
            Because clients can write <strong>any</strong> query, a malicious or careless client can send something
            enormous:
          </p>
          <CodeBlock lang="graphql" code={code8} />
          <p>Protections:</p>
          <ul>
            <li>
              <strong>Query depth limits:</strong> for example, a maximum depth of 7.
            </li>
            <li>
              <strong>Query cost/complexity analysis:</strong> give each field a cost and reject queries over a budget.
            </li>
            <li>
              <strong>Pagination required on lists</strong> (post 34).
            </li>
            <li>
              <strong>Timeouts and rate limits</strong> based on query cost, not just request count.
            </li>
            <li>
              <strong>Persisted queries only</strong> for your own apps (no arbitrary queries in production).
            </li>
            <li>
              <strong>Authorisation in resolvers.</strong> Check permissions per field and object, not just at the
              endpoint.
            </li>
            <li>
              Consider <strong>disabling introspection</strong> (schema discovery) in production for private APIs.
            </li>
          </ul>
          <h3 id="errors-are-different">Errors are different</h3>
          <p>
            GraphQL often returns <strong>HTTP 200 even when parts of the query fail</strong>, with an{" "}
            <code>errors</code> array next to partial <code>data</code>. That's useful (you get the parts that worked),
            but monitoring tools that only look at HTTP status codes will miss failures. Track GraphQL errors
            explicitly.
          </p>
          <h3 id="federation-one-graph-many-teams">Federation: one graph, many teams</h3>
          <p>
            In large companies, many teams own different parts of the data. <strong>GraphQL Federation</strong> (for
            example, Apollo Federation) lets each team run its <strong>own subgraph</strong> (users, orders, products),
            and a <strong>gateway</strong> combines them into <strong>one unified schema</strong> for clients:
          </p>
          <Flow
            caption="Federation. Each team owns a subgraph; clients see one schema."
            nodes={[
              { title: <>Mobile and web clients</>, desc: <>one endpoint, one schema</> },
              { title: <>GraphQL router / gateway</>, desc: <>plans the query across subgraphs</> },
              { title: <>Users subgraph (Team A)</>, label: <>users</> },
              { title: <>Orders subgraph (Team B)</>, label: <>orders</> },
              { title: <>Products subgraph (Team C)</>, label: <>products</> },
            ]}
          />
          <h3 id="when-to-use-which">When to use which</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Situation</th>
                  <th>Best fit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Public API for many third-party developers</td>
                  <td>
                    <strong>REST</strong> (simple, cacheable, familiar)
                  </td>
                </tr>
                <tr>
                  <td>Many client types (web, iOS, Android, TV) needing different data from many sources</td>
                  <td>
                    <strong>GraphQL</strong>
                  </td>
                </tr>
                <tr>
                  <td>Mobile apps on slow networks with complex screens</td>
                  <td>
                    <strong>GraphQL</strong> (fewer round trips, smaller payloads)
                  </td>
                </tr>
                <tr>
                  <td>Internal high-performance service-to-service calls</td>
                  <td>
                    <strong>gRPC</strong> (post 31)
                  </td>
                </tr>
                <tr>
                  <td>Simple CRUD app with one frontend</td>
                  <td>
                    <strong>REST</strong>
                  </td>
                </tr>
                <tr>
                  <td>Heavy file uploads/downloads, simple caching via CDN</td>
                  <td>
                    <strong>REST</strong>
                  </td>
                </tr>
                <tr>
                  <td>Real-time updates</td>
                  <td>WebSockets/SSE (post 33), or GraphQL subscriptions</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Many companies use <strong>all three</strong>: REST for public APIs, GraphQL for their own apps, and gRPC
            between services.
          </p>
          <Compare
            caption="Three API styles, three sweet spots. Many companies run all three."
            columns={[
              {
                title: <>REST</>,
                items: [
                  { sign: "+", text: <>Simple, cacheable by CDNs, universal tooling</> },
                  { sign: "-", text: <>Over- and under-fetching, many round trips</> },
                ],
                verdict: <>Public APIs, simple CRUD, file transfer</>,
              },
              {
                title: <>GraphQL</>,
                items: [
                  { sign: "+", text: <>Exactly the fields needed, in one request</> },
                  { sign: "+", text: <>Typed schema; one front door over many services</> },
                  { sign: "-", text: <>Harder caching, N+1 risk, expensive queries</> },
                ],
                verdict: <>Many client types with complex screens</>,
              },
              {
                title: <>gRPC</>,
                items: [
                  { sign: "+", text: <>Fast binary, typed contracts, streaming</> },
                  { sign: "-", text: <>Poor browser support, not human-readable</> },
                ],
                verdict: <>Internal service-to-service calls</>,
              },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <p>
            <strong>GraphQL</strong>
          </p>
          <ul>
            <li>
              ✅ <strong>Exactly the data needed, in one request</strong>, with a <strong>strong typed schema</strong>{" "}
              and great tools (auto-complete, docs, code generation).
            </li>
            <li>
              ✅ <strong>Frontend teams move faster</strong> without waiting for new endpoints. It also works as a{" "}
              <strong>single front door</strong> over many services.
            </li>
            <li>
              ❌ <strong>Server complexity:</strong> resolvers, DataLoaders, cost limits, federation.
            </li>
            <li>
              ❌ <strong>Caching is harder</strong> than REST.
            </li>
            <li>
              ❌ <strong>Risk of expensive queries</strong> without limits.
            </li>
            <li>
              ❌ <strong>Monitoring is harder</strong>: one endpoint, and 200 responses with errors inside.
            </li>
          </ul>
          <p>
            <strong>REST</strong>
          </p>
          <ul>
            <li>✅ Simple, cacheable, universal, and easy to monitor and debug.</li>
            <li>❌ Over- and under-fetching, many round trips, and endpoint sprawl for varied clients.</li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Facebook</strong> created GraphQL in 2012 to power its mobile News Feed, because its REST-style APIs
            were making the native apps slow and hard to evolve. It was open-sourced in 2015 and moved to the
            independent GraphQL Foundation in 2018.
          </p>
          <p>
            <strong>GitHub</strong> launched a public GraphQL API (v4) alongside its REST API, explaining that
            integrators often needed many REST calls to get what one GraphQL query could fetch. Both APIs are still
            offered, which is a nice example of using both styles.
          </p>
          <p>
            <strong>Shopify</strong> offers GraphQL APIs for building storefronts and apps, and applies{" "}
            <strong>cost-based rate limiting</strong>: each query has a calculated cost, and apps get a budget. That's
            exactly the protection described above.
          </p>
          <p>
            <strong>Netflix</strong> has written about moving to a <strong>federated GraphQL</strong> architecture, so
            that many backend teams contribute to one graph used by Netflix's apps, instead of maintaining one giant API
            layer.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What problems does GraphQL solve compared with REST?</>,
                a: (
                  <>
                    <p>
                      Over-fetching (fixed responses with fields you don't need), under-fetching (several round trips to
                      build one screen), and endpoint sprawl as each client wants a different shape. Clients declare
                      exactly the fields they need against a typed schema and get them in one request.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is the N+1 problem in GraphQL, and how do you fix it?</>,
                a: (
                  <>
                    <p>
                      Field resolvers run once per parent object, so resolving product for 12 order items fires 12
                      queries. DataLoader collects the keys requested within one tick and fetches them in a single
                      batched query, with a per-request cache.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why is caching harder with GraphQL?</>,
                a: (
                  <>
                    <p>
                      Requests are usually POSTs to one URL with the query in the body, so URL-based HTTP and CDN
                      caching doesn't apply. Use persisted queries (sent by ID, even via GET), normalised client caches
                      keyed by object ID, and caching inside resolvers.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you protect a GraphQL API from abusive queries?</>,
                a: (
                  <>
                    <p>
                      Limit query depth, compute a cost for each query and reject or rate-limit by cost, require
                      pagination on lists, set timeouts, allow only persisted queries for first-party apps, and enforce
                      authorisation per field and object in resolvers.
                    </p>
                  </>
                ),
              },
              {
                q: <>When would you choose REST over GraphQL?</>,
                a: (
                  <>
                    <p>
                      For public APIs used by many third parties, simple CRUD with one client, heavy file transfer, or
                      when CDN caching and straightforward monitoring matter more than flexible data fetching.
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
              <strong>GraphQL</strong> lets clients request{" "}
              <strong>exactly the fields they need, in one request</strong>, based on a <strong>typed schema</strong>.
              It's a layer in front of your data sources.
            </li>
            <li>
              <strong>Resolvers</strong> fetch each field. Use <strong>DataLoader</strong> to batch and avoid{" "}
              <strong>N+1</strong> queries.
            </li>
            <li>
              <strong>Caching is harder</strong> than REST, so use <strong>persisted queries</strong> and client-side
              normalised caches.
            </li>
            <li>
              <strong>Protect the server</strong> with depth and cost limits, pagination, per-field authorisation and
              cost-based rate limiting.
            </li>
            <li>
              Use <strong>REST</strong> for simple and public APIs, <strong>GraphQL</strong> for varied, complex
              clients, and <strong>gRPC</strong> for internal performance. Mixing them is normal.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The official GraphQL website: "Learn" and "Best Practices"</li>
            <li>The GraphQL specification</li>
            <li>The DataLoader project on GitHub</li>
            <li>GitHub's engineering blog post introducing its GraphQL API</li>
            <li>Netflix Tech Blog posts on GraphQL federation</li>
            <li>Shopify's documentation on GraphQL rate limiting and query cost</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
