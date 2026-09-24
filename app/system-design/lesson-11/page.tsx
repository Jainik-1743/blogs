import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { AsciiDiagram, Compare, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-11")!;

export const metadata: Metadata = {
  title: `Lesson 11 — ${lesson.title}`,
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

const diagram1 = `                        ┌───────────────┐
  User's browser/app ──►│      DNS      │  "Where is api.shop.com?"
          │             └───────────────┘
          │
          ├──── static files (JS, CSS, images) ────►  ┌──────────┐
          │                                           │   CDN    │──► Object storage
          │                                           └──────────┘   (images, videos)
          ▼
   ┌───────────────┐
   │ Load balancer │  spreads traffic, removes dead servers
   └───────┬───────┘
           ▼
   ┌───────────────┐
   │  API gateway  │  auth, rate limits, routing
   └───────┬───────┘
           ▼
   ┌──────────────────────────────┐
   │  App servers (stateless)     │  business logic
   │  [app 1] [app 2] [app 3]     │
   └───┬───────────┬──────────┬───┘
       │           │          │
       ▼           ▼          ▼
   ┌───────┐  ┌──────────┐  ┌────────────┐     ┌────────────┐
   │ Cache │  │ Database │  │   Queue    │ ──► │  Workers   │  emails, resizing,
   │(Redis)│  │ + replicas│ │(Kafka/SQS) │     │            │  notifications
   └───────┘  └──────────┘  └────────────┘     └────────────┘
                                                     │
                                                     ▼
                                              ┌─────────────┐
                                              │ Search index│
                                              └─────────────┘`;

export default function SdLessonOneOnePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            When you open a system-design diagram for the first time, it can look like a wall of boxes: DNS, CDN, load
            balancer, API gateway, app servers, cache, database, queue, object storage. What do they all do? Why are
            they in that order? Do you need all of them?
          </p>
          <p>
            In Part 1 we followed a request across the <em>network</em>. In this post we follow it through a{" "}
            <em>system</em>, the set of building blocks a real company runs. Think of it as a map. Every other post in
            this series zooms into one box on it.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think of ordering food at a <strong>big restaurant chain</strong>.
          </p>
          <ol>
            <li>
              You look up the restaurant's number. (<strong>DNS</strong>)
            </li>
            <li>
              For simple things like a cold drink or packaged snacks, the <strong>counter near the door</strong> serves
              you straight away. (<strong>CDN</strong>)
            </li>
            <li>
              For a real meal, a <strong>host</strong> decides which waiter serves you, so no waiter gets overloaded. (
              <strong>Load balancer</strong>)
            </li>
            <li>
              A <strong>manager at the door</strong> checks your booking and makes sure you're allowed in. (
              <strong>API gateway</strong>)
            </li>
            <li>
              The <strong>waiter</strong> takes your order and coordinates everything. (<strong>App server</strong>)
            </li>
            <li>
              For popular dishes, the kitchen keeps some <strong>ready on the counter</strong>. (<strong>Cache</strong>)
            </li>
            <li>
              Anything else comes from the <strong>main kitchen and storeroom</strong>. (<strong>Database</strong>)
            </li>
            <li>
              Big items like a wedding cake are kept in a <strong>separate warehouse</strong>. (
              <strong>Object storage</strong>)
            </li>
            <li>
              Things that don't need to happen <em>right now</em>, like washing dishes or sending you a feedback SMS, go
              on a <strong>to-do board</strong> for later. (<strong>Message queue</strong>)
            </li>
          </ol>
          <p>
            Each role exists to solve a specific problem: speed, load, safety or reliability. Small restaurants skip
            most of them. Big chains need all of them.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <p>Here's the full map of a typical large web application:</p>
          <AsciiDiagram text={diagram1} />
          <SequenceDiagram
            caption="“Show me my order history” — one request through the building blocks. The cache decides whether the database is touched at all."
            actors={["Phone", "DNS", "Load balancer", "Gateway", "App", "Redis", "Database"]}
            messages={[
              { from: 0, to: 1, label: <>api.shop.com?</>, note: <>often answered from cache</> },
              { from: 1, to: 0, label: <>nearest region's IP</>, reply: true },
              { from: 0, to: 2, label: <>GET /orders</>, note: <>TLS, reused connection</> },
              { from: 2, to: 3, label: <>pick a healthy server</> },
              { from: 3, to: 4, label: <>token OK, under rate limit → order service</> },
              { from: 4, to: 5, label: <>orders:user:42?</> },
              { from: 5, to: 4, label: <>miss</>, reply: true },
              { from: 4, to: 6, label: <>SELECT … WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20</> },
              { from: 6, to: 4, label: <>20 rows</>, note: <>uses an index, maybe a read replica</>, reply: true },
              { from: 4, to: 5, label: <>SET orders:user:42 (TTL 60 s)</> },
              { from: 4, to: 0, label: <>200 OK + JSON</>, note: <>thumbnails are CDN URLs</>, reply: true },
            ]}
          />
          <p>
            Now let's follow one request: <strong>"Show me my order history"</strong> on a shopping app.
          </p>
          <p>
            <strong>Step 1: DNS.</strong> The app looks up <code>api.shop.com</code>. DNS in system design is more than
            a phone book, as we'll see below. It can send you to the <strong>nearest</strong> data centre.
          </p>
          <p>
            <strong>Step 2: CDN for static files.</strong> The page's JavaScript, CSS, logos and product images come
            from a CDN server near you. It might be in your own city, so these load in a few milliseconds and never
            touch the company's main servers.
          </p>
          <p>
            <strong>Step 3: Load balancer.</strong> The API request (<code>GET /orders</code>) reaches a load balancer,
            which picks a healthy app server. If one server has crashed, the load balancer simply stops sending traffic
            to it.
          </p>
          <p>
            <strong>Step 4: API gateway.</strong> It checks your login token, makes sure you're not sending too many
            requests, and routes <code>/orders</code> to the order service.
          </p>
          <p>
            <strong>Step 5: App server.</strong> The code runs: "get orders for user 42, newest first, 20 per page".
          </p>
          <p>
            <strong>Step 6: Cache check.</strong> "Do we already have user 42's recent orders in Redis?" If yes (a{" "}
            <strong>cache hit</strong>), we reply in about 1 ms. If not (a <strong>cache miss</strong>), we go to the
            database.
          </p>
          <p>
            <strong>Step 7: Database.</strong> The query runs, ideally using an index (post 5). Reads might go to a{" "}
            <strong>read replica</strong> so the main database isn't overloaded. The result is stored in the cache for
            next time.
          </p>
          <p>
            <strong>Step 8: Response.</strong> JSON goes back through the gateway and load balancer to your phone.
            Product thumbnails in the response are CDN URLs pointing at object storage.
          </p>
          <p>
            <strong>Step 9: Async work (for writes).</strong> If you had <em>placed</em> an order instead, the app would
            save it, reply quickly with "Order placed!", and put a message on a <strong>queue</strong>. Workers then
            send the confirmation email, update the search index, notify the warehouse and so on, without making you
            wait.
          </p>
          <h3 id="where-the-time-goes-a-latency-budget">Where the time goes: a latency budget</h3>
          <p>Suppose the target is "order history loads in under 300 ms". A rough budget:</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Hop</th>
                  <th>Typical time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>DNS (usually cached)</td>
                  <td>0–50 ms</td>
                </tr>
                <tr>
                  <td>TCP + TLS (usually reused)</td>
                  <td>0–100 ms</td>
                </tr>
                <tr>
                  <td>Network to the nearest region</td>
                  <td>20–80 ms</td>
                </tr>
                <tr>
                  <td>Load balancer + gateway</td>
                  <td>1–5 ms</td>
                </tr>
                <tr>
                  <td>App code</td>
                  <td>5–20 ms</td>
                </tr>
                <tr>
                  <td>Cache hit / database query</td>
                  <td>1 ms / 5–50 ms</td>
                </tr>
                <tr>
                  <td>Response back</td>
                  <td>20–80 ms</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            The biggest items are usually <strong>network distance</strong> and <strong>database queries</strong>, not
            your code. That's why CDNs, regions close to users, connection reuse and caching matter so much.
          </p>
          <Stats
            caption="Where the ~300 ms budget goes. Your code is rarely the biggest line."
            stats={[
              { value: <>0–50 ms</>, label: <>DNS</>, sub: <>usually cached</> },
              { value: <>0–100 ms</>, label: <>TCP + TLS</>, sub: <>usually reused</> },
              { value: <>20–80 ms</>, label: <>to the nearest region</>, sub: <>each way</> },
              { value: <>5–20 ms</>, label: <>app code</> },
              { value: <>1 / 5–50 ms</>, label: <>cache hit / DB query</> },
            ]}
          />
          <h3 id="synchronous-vs-asynchronous-paths">Synchronous vs asynchronous paths</h3>
          <Compare
            caption="The question to ask of every feature: what must the user wait for?"
            columns={[
              {
                title: <>Synchronous — the user waits</>,
                items: [
                  { sign: "·", text: <>Check the password</> },
                  { sign: "·", text: <>Save the order</> },
                  { sign: "·", text: <>Charge the card</> },
                ],
                verdict: <>Anything the user must know succeeded before they move on</>,
              },
              {
                title: <>Asynchronous — workers do it later</>,
                items: [
                  { sign: "·", text: <>Confirmation email and invoice</> },
                  { sign: "·", text: <>Resize uploaded images</> },
                  { sign: "·", text: <>Update search, recommendations, analytics</> },
                  { sign: "+", text: <>Faster responses; survives a flaky email provider</> },
                ],
                verdict: <>Anything that can arrive “a moment later”</>,
              },
            ]}
          />
          <p>
            A key design question for every feature is{" "}
            <strong>what the user must wait for, and what can happen later</strong>:
          </p>
          <ul>
            <li>
              <strong>Must be synchronous (user waits):</strong>
              <ul>
                <li>checking a password,</li>
                <li>saving the order,</li>
                <li>charging the card (the user needs to know it worked).</li>
              </ul>
            </li>
            <li>
              <strong>Can be asynchronous (done later by workers):</strong>
              <ul>
                <li>confirmation emails,</li>
                <li>generating invoices,</li>
                <li>updating recommendations,</li>
                <li>resizing uploaded images,</li>
                <li>analytics.</li>
              </ul>
            </li>
          </ul>
          <p>
            Moving work to the async path makes responses faster <strong>and</strong> keeps the main flow working even
            if, say, the email provider is down.
          </p>
          <h3 id="dns-as-a-system-design-tool">DNS as a system-design tool</h3>
          <p>
            In post 1, DNS turned names into IP addresses. In system design, DNS is also a{" "}
            <strong>traffic director</strong>:
          </p>
          <ul>
            <li>
              <strong>Geo-based routing (GeoDNS):</strong> users in India get the IP of the Mumbai servers; users in
              Germany get Frankfurt.
            </li>
            <li>
              <strong>Latency-based routing:</strong> send each user to whichever region answers them fastest.
            </li>
            <li>
              <strong>Weighted routing:</strong> send 95% of traffic to the old version and 5% to a new version, for
              safe testing (a canary release).
            </li>
            <li>
              <strong>Failover routing:</strong> if health checks show the main region is down, answer with the backup
              region's IP.
            </li>
          </ul>
          <p>
            <strong>The limitation: caching.</strong> DNS answers are cached by browsers, operating systems and internet
            providers, sometimes for longer than the TTL you set. So DNS failover isn't instant. Some users keep going
            to the dead region for minutes. That's why DNS is often combined with other techniques.
          </p>
          <p>
            <strong>Anycast</strong> is another approach. The <strong>same IP address</strong> is announced from many
            locations worldwide, and internet routing (BGP, from post 1) naturally delivers each user to the nearest
            one. Cloudflare and Google's public DNS (<code>8.8.8.8</code>) work this way. There's no DNS trickery; the
            network itself finds the closest site.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>GeoDNS</th>
                  <th>Anycast</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>How</td>
                  <td>DNS returns different IPs per location</td>
                  <td>One IP, announced from many places</td>
                </tr>
                <tr>
                  <td>Failover speed</td>
                  <td>Limited by DNS caching</td>
                  <td>Fast (routing updates)</td>
                </tr>
                <tr>
                  <td>Complexity</td>
                  <td>Easy with managed DNS</td>
                  <td>Needs your own network and BGP</td>
                </tr>
                <tr>
                  <td>Used by</td>
                  <td>Most companies via Route 53, Cloudflare DNS, etc.</td>
                  <td>CDNs, DNS providers, large platforms</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>DNS is also a single point of failure.</strong> If your DNS provider goes down, nobody can find you.
            Large companies often use <strong>two DNS providers</strong>.
          </p>
          <Compare
            caption="Two ways to send users to the nearest site."
            columns={[
              {
                title: <>GeoDNS</>,
                items: [
                  { sign: "·", text: <>DNS answers with a different IP per location</> },
                  { sign: "+", text: <>Easy with managed DNS (Route 53, Cloudflare)</> },
                  { sign: "-", text: <>Failover limited by DNS caching — minutes</> },
                ],
                verdict: <>Most companies</>,
              },
              {
                title: <>Anycast</>,
                items: [
                  { sign: "·", text: <>One IP, announced via BGP from many places</> },
                  { sign: "+", text: <>The network itself picks the closest site</> },
                  { sign: "+", text: <>Fast failover through routing updates</> },
                  { sign: "-", text: <>Needs your own network and BGP</> },
                ],
                verdict: <>CDNs, DNS providers, large platforms</>,
              },
            ]}
          />
          <h3 id="do-you-need-all-of-these-boxes">Do you need all of these boxes?</h3>
          <p>
            No. A good rule is to <strong>add components when a real problem appears</strong>:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Typical setup</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Side project</td>
                  <td>One server + one database</td>
                </tr>
                <tr>
                  <td>Growing startup</td>
                  <td>+ CDN, + load balancer with 2–3 app servers, + managed database with backups</td>
                </tr>
                <tr>
                  <td>Busy product</td>
                  <td>+ Redis cache, + read replicas, + queue and workers, + object storage</td>
                </tr>
                <tr>
                  <td>Large scale</td>
                  <td>+ API gateway, + search cluster, + multiple regions, + sharded databases</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Every box adds cost, latency and things that can break. <strong>Simple is a feature</strong> (post 6).
          </p>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>More layers</strong> bring better scale, security and resilience, but also more hops, more latency
              and more operational work.
            </li>
            <li>
              <strong>Caching and CDNs</strong> make things fast, but add the risk of showing stale data.
            </li>
            <li>
              <strong>Async processing</strong> makes responses fast and resilient, but results appear "a bit later",
              which the user experience must handle ("Your invoice will be emailed shortly").
            </li>
            <li>
              <strong>GeoDNS and multiple regions</strong> mean lower latency and survive regional outages, but data
              must be kept in sync across regions. That's much harder (Part 4).
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Netflix</strong> splits the work cleanly. The app talks to Netflix's backend (running in AWS) for
            browsing, search and recommendations. But the actual video comes from <strong>Open Connect</strong>,
            Netflix's own CDN, whose servers sit inside internet providers' networks close to viewers. That's the
            "static content goes to the CDN" idea at enormous scale.
          </p>
          <p>
            <strong>E-commerce order placement.</strong> When you place an order on a big shopping site, you get "Order
            confirmed" within a second or two. The confirmation email, the warehouse notification, loyalty points and
            recommendation updates usually happen moments later through queues and workers. That's the
            synchronous/asynchronous split described above.
          </p>
          <p>
            <strong>Cloudflare</strong> uses anycast so that the same IP addresses are served from data centres in
            hundreds of cities. A user in Chennai and a user in Chicago connecting to the same IP reach different,
            nearby machines.
          </p>
          <p>
            <strong>AWS Route 53</strong> is a managed DNS service that offers weighted, latency-based, geolocation and
            failover routing. Many companies use it to shift traffic between regions or to roll out new versions
            gradually.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Walk me through the components a request passes in a typical large web app.</>,
                a: (
                  <>
                    <p>
                      DNS resolves the name (often to the nearest region). Static assets come from a CDN. API calls hit
                      a load balancer, then an API gateway for auth, rate limits and routing, then stateless app
                      servers. Those read from a cache first and fall back to the database (often a read replica). Slow
                      side-effects go onto a queue for workers.
                    </p>
                  </>
                ),
              },
              {
                q: <>What would you make asynchronous in an order-placement flow?</>,
                a: (
                  <>
                    <p>
                      Keep saving the order and charging the card synchronous, because the user must know they worked.
                      Push the confirmation email, invoice generation, warehouse notification, loyalty points, search
                      and recommendation updates onto a queue, so the response is fast and survives a failing email
                      provider.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why isn't DNS failover instant?</>,
                a: (
                  <>
                    <p>
                      DNS answers are cached by browsers, operating systems and resolvers — sometimes for longer than
                      the TTL you set — so some clients keep using the dead IP for minutes. It's combined with low TTLs,
                      health-checked load balancers and anycast for faster recovery.
                    </p>
                  </>
                ),
              },
              {
                q: <>How would you start the architecture for a brand-new product?</>,
                a: (
                  <>
                    <p>
                      With the fewest boxes that meet the requirements: one or two app servers, a managed database with
                      backups, and a CDN for static files. Add a cache, replicas, queues, search and extra regions only
                      when a measured problem calls for them. Every box adds latency, cost and failure modes.
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
              A large system is a chain of <strong>building blocks</strong>: DNS → CDN → load balancer → API gateway →
              app servers → cache / database / object storage, with queues and workers on the side.
            </li>
            <li>
              Most latency comes from <strong>network distance</strong> and <strong>database work</strong>. CDNs, nearby
              regions and caches attack those.
            </li>
            <li>
              Decide what the user <strong>must wait for</strong> (synchronous) and what can happen{" "}
              <strong>later</strong> (asynchronous, via queues).
            </li>
            <li>
              <strong>DNS</strong> also directs traffic: by geography, latency, weight or health.{" "}
              <strong>Anycast</strong> routes users to the nearest site at the network level.
            </li>
            <li>
              <strong>Add components only when needed.</strong> Each one adds cost, latency and failure points.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              The System Design Primer on GitHub (section "System design topics: start here" and its overview diagram)
            </li>
            <li>
              <em>System Design Interview: An Insider's Guide</em> by Alex Xu (chapter 1)
            </li>
            <li>The "what-happens-when" project on GitHub</li>
            <li>AWS Route 53 documentation on routing policies</li>
            <li>Cloudflare Learning Center articles on DNS and anycast</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
