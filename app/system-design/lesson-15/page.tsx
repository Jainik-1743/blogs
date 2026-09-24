import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Layers, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-15")!;

export const metadata: Metadata = {
  title: `Lesson 15 — ${lesson.title}`,
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

const code1 = `product:991
user:42:profile
user:42:orders:page:1
feed:home:region:IN`;

const code2 = `async function getProduct(id) {
  const key = \`product:\${id}\`;

  // 1. Try the cache
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);          // hit

  // 2. Miss: load from the database
  const product = await db.products.findById(id);

  // 3. Save to cache with a TTL (e.g., 10 minutes)
  await redis.set(key, JSON.stringify(product), "EX", 600);
  return product;
}`;

export default function SdLessonOneFivePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Your product page takes 400 ms to load. For each view, the app runs six database queries: product details,
            price, stock, reviews, seller info and recommendations. At 10 views per second, the database copes. At
            10,000 views per second during a sale, it falls over. And most of those queries return{" "}
            <strong>exactly the same answer</strong> they returned one second ago.
          </p>
          <p>
            Why ask the database the same question 10,000 times a second? That's the question <strong>caching</strong>{" "}
            answers. It's the single most powerful performance tool in system design.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about <strong>your kitchen</strong>.
          </p>
          <ul>
            <li>
              The things you use every day (salt, oil, tea) sit <strong>on the counter</strong>, right next to the
              stove.
            </li>
            <li>
              Less common items are in the <strong>cupboard</strong>.
            </li>
            <li>
              Bulk supplies are in the <strong>storeroom</strong>.
            </li>
            <li>
              If you run out, you go to the <strong>shop</strong>.
            </li>
          </ul>
          <p>
            You don't walk to the shop every time you need salt. You keep a small amount <strong>close by</strong>,
            because you use it often.
          </p>
          <p>
            A <strong>cache</strong> is that counter. It's a small, fast storage layer that keeps copies of{" "}
            <strong>frequently used data</strong> close to where it's needed, so you don't have to go back to the slow
            source (the database, another service, or a distant server) every time.
          </p>
          <p>Two words you'll use constantly:</p>
          <ul>
            <li>
              <strong>Cache hit:</strong> the data was in the cache. Fast! 🎉
            </li>
            <li>
              <strong>Cache miss:</strong> it wasn't, so we go to the source, then (usually) save the result in the
              cache.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="why-caches-work-so-well">Why caches work so well</h3>
          <p>
            Caching works because of how people actually use apps. <strong>Access is very uneven</strong>:
          </p>
          <ul>
            <li>
              A small number of products, posts or videos get most of the views. Today's trending video gets millions of
              views; a video from 2014 gets a few.
            </li>
            <li>The same user reloads the same pages.</li>
            <li>Popular data is requested again and again within seconds.</li>
          </ul>
          <p>
            This is often called the <strong>80/20 rule</strong>: roughly 20% of the data gets 80% of the requests. Keep
            that 20% in a fast cache and you handle most traffic cheaply.
          </p>
          <h3 id="hit-ratio-the-number-that-matters">Hit ratio: the number that matters</h3>
          <Stats
            caption="Hit ratio is the number that matters. Hit = 1 ms, database = 50 ms."
            stats={[
              { value: <>~11 ms</>, label: <>average at 80% hits</>, sub: <>20% of requests reach the DB</> },
              { value: <>~3.5 ms</>, label: <>average at 95% hits</>, sub: <>5% reach the DB</> },
              { value: <>~1.5 ms</>, label: <>average at 99% hits</>, sub: <>1% — five times less DB load than 95%</> },
            ]}
          />
          <p>
            Say a cache hit takes <strong>1 ms</strong> and a database query takes <strong>50 ms</strong>:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Hit ratio</th>
                  <th>Average latency</th>
                  <th>Requests reaching the DB</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0%</td>
                  <td>50 ms</td>
                  <td>100%</td>
                </tr>
                <tr>
                  <td>80%</td>
                  <td>0.8×1 + 0.2×50 ≈ 11 ms</td>
                  <td>20%</td>
                </tr>
                <tr>
                  <td>95%</td>
                  <td>0.95×1 + 0.05×50 ≈ 3.5 ms</td>
                  <td>5%</td>
                </tr>
                <tr>
                  <td>99%</td>
                  <td>≈ 1.5 ms</td>
                  <td>1%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Going from 95% to 99% cuts database load by <strong>five times</strong>. Small hit-ratio improvements have
            big effects.
          </p>
          <h3 id="where-can-you-cache">Where can you cache?</h3>
          <p>
            Caches exist at <strong>every layer</strong> of a system, from the user's device to the database:
          </p>
          <Layers
            caption="You can cache at every layer between the user and the data. Higher up is faster but harder to control."
            layers={[
              {
                name: <>Browser / app</>,
                tech: <>HTTP cache, memory</>,
                desc: <>no network at all; hard to clear from the server</>,
              },
              { name: <>CDN edge</>, tech: <>static files, public pages</>, desc: <>near the user (lesson 14)</> },
              { name: <>Reverse proxy</>, tech: <>NGINX, Varnish</>, desc: <>whole HTTP responses</> },
              {
                name: <>In-process</>,
                tech: <>an LRU map in app memory</>,
                desc: <>nanoseconds, but one copy per server</>,
              },
              { name: <>Distributed</>, tech: <>Redis, Memcached</>, desc: <>shared by all servers; ~0.5 ms hop</> },
              {
                name: <>Database</>,
                tech: <>buffer pool</>,
                desc: <>free, but can't save you from expensive queries at volume</>,
              },
            ]}
          />
          <p>
            <strong>1. Client cache.</strong> The browser keeps files according to HTTP headers (post 14). Mobile apps
            keep data in memory or on disk.
          </p>
          <ul>
            <li>✅ The fastest possible: no network at all.</li>
            <li>❌ You can't easily clear it from the server side.</li>
          </ul>
          <p>
            <strong>2. CDN cache.</strong> Covered in post 14. Best for static files and public content.
          </p>
          <p>
            <strong>3. Reverse-proxy cache.</strong> NGINX or Varnish in front of your app can cache whole HTTP
            responses. It's good for public pages that are expensive to build.
          </p>
          <p>
            <strong>4. In-process (local) cache.</strong> A map or LRU cache{" "}
            <strong>inside your application's memory</strong>.
          </p>
          <ul>
            <li>✅ Extremely fast (nanoseconds to microseconds), with no network hop.</li>
            <li>
              ❌ Each server has its <strong>own copy</strong>. With 20 servers you have 20 caches, which can disagree
              and each warm up separately.
            </li>
            <li>❌ Lost on every restart or deploy, and uses the app's memory.</li>
            <li>Good for: configuration, feature flags, small lookup tables, and very hot keys.</li>
          </ul>
          <p>
            <strong>5. Distributed cache (Redis, Memcached).</strong> A separate cache server, or cluster,{" "}
            <strong>shared by all app servers</strong>.
          </p>
          <ul>
            <li>✅ One shared copy, so all servers see the same cached data.</li>
            <li>✅ Survives app restarts, and can hold much more data.</li>
            <li>❌ A network hop, typically well under a millisecond inside a data centre.</li>
            <li>❌ Another system to run, monitor and scale.</li>
            <li>This is what people usually mean by "add a cache".</li>
          </ul>
          <p>
            <strong>6. Database cache.</strong> Databases keep recently used data pages in memory (the{" "}
            <strong>buffer pool</strong> in PostgreSQL and MySQL). That's why a query is often faster the second time.
            You get this for free, but it can't save you from running expensive queries at huge volume.
          </p>
          <h3 id="what-should-you-cache">What should you cache?</h3>
          <p>
            <strong>Good candidates:</strong>
          </p>
          <ul>
            <li>
              <strong>Read-heavy data</strong> that changes rarely: product details, user profiles, article pages,
              settings.
            </li>
            <li>
              <strong>Expensive results:</strong> complex queries, aggregated counts ("1.2M views"), recommendation
              lists, rendered HTML.
            </li>
            <li>
              <strong>Results from slow or rate-limited external APIs:</strong> currency exchange rates, weather, maps.
            </li>
            <li>
              <strong>Session data</strong> (post 7), for fast lookups on every request.
            </li>
          </ul>
          <p>
            <strong>Poor candidates:</strong>
          </p>
          <ul>
            <li>Data that changes on almost every read.</li>
            <li>
              Data that <strong>must</strong> be perfectly up to date: an account balance at the moment of payment, or
              remaining stock during checkout. Read those from the source, or cache very carefully.
            </li>
            <li>Huge objects that are rarely re-read.</li>
          </ul>
          <h3 id="cache-the-object-not-just-the-query">Cache the object, not just the query</h3>
          <p>There are two common styles:</p>
          <ul>
            <li>
              <strong>Query-level caching.</strong> The key is the SQL query (or a hash of it), and the value is the
              result. It's easy to add, but hard to invalidate. When a product changes, which cached queries contain it?
            </li>
            <li>
              <strong>Object-level caching.</strong> The key is the thing itself, like <code>product:991</code> or{" "}
              <code>user:42:profile</code>. The value is the assembled object. When product 991 changes, you know
              exactly which key to update or delete.
            </li>
          </ul>
          <p>Object-level caching is usually cleaner and easier to keep correct.</p>
          <h3 id="cache-keys-and-ttls">Cache keys and TTLs</h3>
          <p>
            <strong>Keys</strong> should be clear and structured:
          </p>
          <CodeBlock code={code1} />
          <p>
            <strong>TTL (time to live)</strong> is how long an entry stays before it expires:
          </p>
          <ul>
            <li>short (seconds) for fast-changing data like prices or scores,</li>
            <li>long (hours or days) for data that rarely changes,</li>
            <li>a TTL on everything as a safety net, so mistakes eventually fix themselves.</li>
          </ul>
          <h3 id="redis-vs-memcached">Redis vs Memcached</h3>
          <p>Both are in-memory key-value stores used as distributed caches.</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Redis</th>
                  <th>Memcached</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Data types</td>
                  <td>Strings, lists, sets, sorted sets, hashes, streams…</td>
                  <td>Simple strings/blobs</td>
                </tr>
                <tr>
                  <td>Persistence</td>
                  <td>Optional (snapshots, append-only log)</td>
                  <td>None (pure cache)</td>
                </tr>
                <tr>
                  <td>Replication / clustering</td>
                  <td>Built in</td>
                  <td>Handled by clients</td>
                </tr>
                <tr>
                  <td>Extra features</td>
                  <td>Pub/sub, Lua scripts, atomic counters, geo, streams</td>
                  <td>Very simple and fast</td>
                </tr>
                <tr>
                  <td>Threading</td>
                  <td>Mainly single-threaded command execution</td>
                  <td>Multi-threaded</td>
                </tr>
                <tr>
                  <td>Typical use</td>
                  <td>Cache + sessions + leaderboards + rate limiting + queues</td>
                  <td>Large, simple caching layers</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Most new projects choose <strong>Redis</strong> (or a compatible alternative like Valkey) because it does
            much more than caching: rate limiters, leaderboards with sorted sets, and simple queues. Memcached is still
            great for huge, simple cache fleets.
          </p>
          <h3 id="a-simple-cache-in-code-cache-aside">A simple cache in code (cache-aside)</h3>
          <p>This is the most common pattern. We'll cover all the strategies in Part 2.</p>
          <CodeBlock lang="js" code={code2} />
          <SequenceDiagram
            caption="Cache-aside, the most common pattern. The app owns the logic; the cache is just fast storage."
            actors={["App", "Redis", "Database"]}
            messages={[
              { from: 0, to: 1, label: <>GET product:991</> },
              { from: 1, to: 0, label: <>(nil) — miss</>, reply: true },
              { from: 0, to: 2, label: <>SELECT * FROM products WHERE id = 991</> },
              { from: 2, to: 0, label: <>row</>, note: <>~50 ms</>, reply: true },
              { from: 0, to: 1, label: <>SET product:991 … EX 600</> },
              { from: 0, to: 0, label: <>The next 10,000 requests in those 10 minutes…</>, divider: true },
              { from: 0, to: 1, label: <>GET product:991</> },
              { from: 1, to: 0, label: <>hit</>, note: <>~1 ms, database untouched</>, reply: true },
            ]}
          />
          <h3 id="measure-it">Measure it</h3>
          <p>Always monitor:</p>
          <ul>
            <li>
              <strong>hit ratio</strong> (overall and for important key groups),
            </li>
            <li>
              <strong>latency</strong> (cache vs database),
            </li>
            <li>
              <strong>memory usage and evictions</strong> (is the cache too small?),
            </li>
            <li>
              <strong>database load</strong> before and after.
            </li>
          </ul>
          <p>A cache with a 20% hit ratio adds complexity without much benefit. Find out why before adding more.</p>
          <Compare
            caption="Local or shared? Most large systems use both — local for the very hottest keys."
            columns={[
              {
                title: <>In-process cache</>,
                items: [
                  { sign: "+", text: <>Nanoseconds; no network hop</> },
                  { sign: "+", text: <>Survives a cache-cluster outage</> },
                  { sign: "-", text: <>One copy per server; copies can disagree</> },
                  { sign: "-", text: <>Lost on every deploy or restart</> },
                ],
                verdict: <>Config, feature flags, tiny lookup tables, very hot keys</>,
              },
              {
                title: <>Distributed cache (Redis)</>,
                items: [
                  { sign: "+", text: <>One shared copy for every server</> },
                  { sign: "+", text: <>Survives app restarts; holds far more</> },
                  { sign: "-", text: <>Network hop, another system to run</> },
                ],
                verdict: <>Product and profile objects, sessions, rendered fragments</>,
              },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅ <strong>Much faster reads</strong>, much less load on databases and APIs, and lower costs.
            </li>
            <li>
              ✅ <strong>Absorbs traffic spikes</strong> that would otherwise take down the database.
            </li>
            <li>
              ❌ <strong>Stale data.</strong> The cache can be out of date. You must decide how stale is acceptable.
            </li>
            <li>
              ❌ <strong>More complexity:</strong> another system to run, plus invalidation logic.
            </li>
            <li>
              ❌ <strong>New failure modes.</strong> If the cache goes down, can your database handle the full load?
              Often it can't (Part 2).
            </li>
            <li>
              ❌ <strong>Memory costs money</strong>, and RAM is more expensive than disk.
            </li>
          </ul>
          <p>
            <strong>When not to cache:</strong> before you've fixed obvious problems like missing indexes or N+1 queries
            (post 5). A cache on top of a slow query hides the problem, until the cache misses.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Facebook's memcache.</strong> Facebook built one of the largest caching systems in the world using
            Memcached, with many thousands of servers sitting between its web servers and MySQL databases. Its 2013
            paper "Scaling Memcache at Facebook" describes how caching let the site serve billions of reads per second
            while protecting the databases.
          </p>
          <p>
            <strong>Twitter and Redis.</strong> Twitter has long used Redis-style in-memory storage to hold users' home
            timelines as lists of tweet IDs, so loading your timeline is a fast memory read instead of a heavy database
            query.
          </p>
          <p>
            <strong>Stack Overflow</strong> uses several cache layers (in-memory caches on each web server plus a shared
            Redis) to serve a huge audience from a small number of servers. Caching is a big part of why its hardware
            footprint stays small.
          </p>
          <p>
            <strong>E-commerce sales.</strong> During big sales, the product pages for popular deals are read millions
            of times. Caching product details (while reading stock and prices from the source at checkout) is what keeps
            the database alive.
          </p>
          <p>
            <strong>Instagram</strong> wrote about storing hundreds of millions of simple key-value mappings in Redis,
            and about tuning how the data is stored to save memory. It shows that at scale, even cache{" "}
            <strong>memory efficiency</strong> becomes an engineering problem.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Why does caching work so well for most web apps?</>,
                a: (
                  <>
                    <p>
                      Access is highly skewed: a small fraction of items gets most requests (roughly 80/20), and the
                      same items are requested again within seconds. Keeping that hot set in memory serves most traffic
                      at memory speed, and the database only sees the long tail.
                    </p>
                  </>
                ),
              },
              {
                q: <>Local in-process cache vs Redis — how do you choose?</>,
                a: (
                  <>
                    <p>
                      In-process is fastest and needs no network, but every server has its own copy that can disagree
                      and is lost on deploys. Redis is shared, larger and survives restarts, at the cost of a network
                      hop and another system. Use local for tiny, very hot or static data; Redis for shared objects.
                    </p>
                  </>
                ),
              },
              {
                q: <>Object-level vs query-level caching?</>,
                a: (
                  <>
                    <p>
                      Query-level uses the SQL (or its hash) as the key, so it's easy to add but hard to invalidate —
                      which cached queries include product 991? Object-level keys like product:991 map to one thing, so
                      updates know exactly what to refresh or delete.
                    </p>
                  </>
                ),
              },
              {
                q: <>What would you never cache, or cache very carefully?</>,
                a: (
                  <>
                    <p>
                      Data that must be exact at the moment of use: a balance during payment, remaining stock at
                      checkout, permissions right after they change. Read those from the source of truth, or use very
                      short TTLs plus active invalidation.
                    </p>
                  </>
                ),
              },
              {
                q: <>Your cache has a 20% hit ratio. What do you check?</>,
                a: (
                  <>
                    <p>
                      Whether the keys are too specific (random query parameters, timestamps or user IDs in keys),
                      whether TTLs are too short, whether the cache is too small and evicting (check the eviction
                      metric), and whether the data really is re-read. A low-hit cache adds latency and complexity for
                      little gain.
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
              A <strong>cache</strong> keeps copies of frequently used data <strong>close and fast</strong>. Caches work
              because access is <strong>very uneven</strong> (the 80/20 rule).
            </li>
            <li>
              The <strong>hit ratio</strong> matters most. Going from 95% to 99% cuts backend load five times.
            </li>
            <li>
              You can cache at every layer:{" "}
              <strong>client, CDN, reverse proxy, in-process, distributed (Redis), and the database</strong>.
            </li>
            <li>
              Prefer <strong>object-level keys</strong> (<code>product:991</code>), and set a <strong>TTL</strong> on
              everything.
            </li>
            <li>
              Caching trades <strong>freshness and simplicity</strong> for <strong>speed</strong>. Fix slow queries
              first, and always measure.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The System Design Primer on GitHub (section "Cache")</li>
            <li>The paper "Scaling Memcache at Facebook" (NSDI 2013)</li>
            <li>The AWS Builders' Library article "Caching challenges and strategies"</li>
            <li>The official Redis documentation</li>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann (chapter 3, "Storage and Retrieval")
            </li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
