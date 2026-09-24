import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Compare, Flow, QA, Timeline } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import LruCache from "@/components/sd/widgets/LruCache";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-16")!;

export const metadata: Metadata = {
  title: `Lesson 16 — ${lesson.title}`,
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

export default function SdLessonOneSixPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            You added Redis in front of your database (Part 1). Pages are fast and everyone is happy. Then the bug
            reports start:
          </p>
          <ul>
            <li>"I changed my profile picture, but it still shows the old one."</li>
            <li>"The price on the product page is different from the price at checkout."</li>
          </ul>
          <p>
            Then one night, a popular cache key expires,{" "}
            <strong>50,000 requests hit the database in the same second</strong>, and the site goes down.
          </p>
          <p>
            Adding a cache is easy. <strong>Keeping it correct and safe</strong> is the hard part. This post covers the
            three big questions:
          </p>
          <ol>
            <li>How do reads and writes flow between the cache and the database?</li>
            <li>What gets removed when the cache is full?</li>
            <li>How do you keep cached data fresh, without melting the database?</li>
          </ol>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Go back to the <strong>kitchen counter</strong> from Part 1.
          </p>
          <ul>
            <li>
              <strong>Strategy:</strong> when you use the last of the salt, do you refill the counter jar right away, or
              only the next time you need it?
            </li>
            <li>
              <strong>Eviction:</strong> the counter has limited space. When it's full, which jar goes back to the
              cupboard? The one you haven't used in weeks.
            </li>
            <li>
              <strong>Invalidation:</strong> if the milk on the counter has gone off, you need to know, and replace it
              before someone makes tea with it.
            </li>
            <li>
              <strong>Stampede:</strong> if everyone in the house wants tea the moment the milk runs out, and they all
              rush to the shop at once, that's chaos. Better that one person goes while the others wait a minute.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="part-a-caching-strategies">Part A: Caching strategies</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">1. Cache-aside (lazy loading), the most common</h4>
          <p>
            The <strong>application</strong> manages the cache directly:
          </p>
          <SequenceDiagram
            caption="Cache-aside with delete-on-write — the safe default."
            actors={["App", "Cache", "Database"]}
            messages={[
              { from: 0, to: 1, label: <>GET user:42</> },
              { from: 1, to: 0, label: <>miss</>, reply: true },
              { from: 0, to: 2, label: <>SELECT user 42</> },
              { from: 2, to: 0, label: <>row</>, reply: true },
              { from: 0, to: 1, label: <>SET user:42 (TTL)</> },
              { from: 0, to: 0, label: <>Later, the user edits their profile</>, divider: true },
              { from: 0, to: 2, label: <>UPDATE user 42</> },
              { from: 0, to: 1, label: <>DEL user:42</>, note: <>the next read reloads fresh data</> },
            ]}
          />
          <ul>
            <li>✅ Simple. Only data that's actually requested gets cached.</li>
            <li>✅ If the cache dies, the app still works, just more slowly, by reading the DB.</li>
            <li>❌ The first read after a miss or delete is slow.</li>
            <li>❌ Data can be stale until the key expires or is deleted.</li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">2. Read-through</h4>
          <p>
            Like cache-aside, but the <strong>cache library or service</strong> loads from the database on a miss, not
            your app code. The app only ever talks to the cache. This is common with caching libraries and some managed
            caches. It gives cleaner app code, but you're more tied to the cache tool.
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">3. Write-through</h4>
          <p>
            Every write goes to the <strong>cache and the database together</strong>, before the write is confirmed:
          </p>
          <Flow
            caption="Write-through: confirmed only after both copies are written."
            dir="row"
            nodes={[
              { title: <>App</> },
              { title: <>Cache</>, desc: <>updated first</> },
              { title: <>Database</>, desc: <>then confirmed</>, tone: "good" },
            ]}
          />
          <ul>
            <li>✅ The cache is always up to date for data you wrote, so reads right after a write are fresh.</li>
            <li>❌ Writes are slower, because they touch two systems.</li>
            <li>❌ You may fill the cache with data nobody reads.</li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">4. Write-behind (write-back)</h4>
          <p>
            Writes go to the <strong>cache first</strong> and are confirmed immediately. The cache writes them to the
            database <strong>later</strong>, often in batches.
          </p>
          <Flow
            caption="Write-behind: confirmed by the cache now, written to the database later — possibly in batches."
            dir="row"
            nodes={[
              { title: <>App</> },
              { title: <>Cache</>, desc: <>✅ confirmed at once</>, tone: "good" },
              {
                title: <>Database</>,
                desc: <>lost if the cache dies first</>,
                label: <>later, batched</>,
                tone: "warn",
              },
            ]}
          />
          <ul>
            <li>✅ Very fast writes, and batching reduces database load.</li>
            <li>
              ❌ <strong>Risk of data loss.</strong> If the cache crashes before flushing, those writes are gone.
            </li>
            <li>❌ More complex, and the database is temporarily behind.</li>
            <li>
              Good for: view counters, likes, analytics, anything where losing a few updates is acceptable.{" "}
              <strong>Never</strong> for payments or orders.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">5. Write-around</h4>
          <p>
            Writes go <strong>straight to the database</strong>, skipping the cache. The cache is only filled when the
            data is read. This is useful for data that's written often but rarely read soon after, like logs or bulk
            imports.
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">6. Refresh-ahead</h4>
          <p>
            The cache <strong>refreshes popular keys before they expire</strong>. If a key is read often and its TTL is
            nearly up, reload it in the background. Popular items never have a slow miss. The downside is extra work if
            you guess wrong about what's popular.
          </p>
          <p>
            <strong>Summary:</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Strategy</th>
                  <th>Read speed</th>
                  <th>Write speed</th>
                  <th>Freshness</th>
                  <th>Data-loss risk</th>
                  <th>Typical use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cache-aside</td>
                  <td>Fast after first miss</td>
                  <td>Normal</td>
                  <td>Good (with delete on write)</td>
                  <td>None</td>
                  <td>Default choice</td>
                </tr>
                <tr>
                  <td>Read-through</td>
                  <td>Same</td>
                  <td>Normal</td>
                  <td>Good</td>
                  <td>None</td>
                  <td>Library-managed caching</td>
                </tr>
                <tr>
                  <td>Write-through</td>
                  <td>Fast</td>
                  <td>Slower</td>
                  <td>Very good</td>
                  <td>None</td>
                  <td>Read-after-write is common</td>
                </tr>
                <tr>
                  <td>Write-behind</td>
                  <td>Fast</td>
                  <td>Very fast</td>
                  <td>Cache fresh, DB delayed</td>
                  <td>
                    <strong>Yes</strong>
                  </td>
                  <td>Counters, analytics</td>
                </tr>
                <tr>
                  <td>Write-around</td>
                  <td>Miss after write</td>
                  <td>Normal</td>
                  <td>Good</td>
                  <td>None</td>
                  <td>Write-heavy, read-rarely data</td>
                </tr>
                <tr>
                  <td>Refresh-ahead</td>
                  <td>Very fast for hot keys</td>
                  <td>Normal</td>
                  <td>Good</td>
                  <td>None</td>
                  <td>Predictable hot keys</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 id="delete-or-update-the-cache-on-write">Delete or update the cache on write?</h3>
          <p>
            With cache-aside, after updating the database, should you <strong>update</strong> the cached value or{" "}
            <strong>delete</strong> it? <strong>Deleting is usually safer.</strong> Here's why updating can go wrong:
          </p>
          <SequenceDiagram
            caption="Why “update the cache on write” can go wrong. A slower request overwrites the newer value."
            actors={["Request A", "Database", "Cache", "Request B"]}
            messages={[
              { from: 0, to: 1, label: <>UPDATE price = 100</> },
              { from: 3, to: 1, label: <>UPDATE price = 120</> },
              { from: 3, to: 2, label: <>SET price = 120</> },
              { from: 0, to: 2, label: <>SET price = 100</>, note: <>A was slower</> },
              {
                from: 0,
                to: 0,
                label: (
                  <>Database says 120, cache says 100 — until the TTL expires. Deleting the key instead avoids this.</>
                ),
                divider: true,
              },
            ]}
          />
          <p>
            If both requests <strong>delete</strong> the key instead, the next read reloads the correct value (120) from
            the database.
          </p>
          <p>
            There's still a smaller race, where a slow read puts old data back just after a delete. That's why teams
            add:
          </p>
          <ul>
            <li>
              <strong>TTLs on everything</strong>, so any mistake eventually fixes itself,
            </li>
            <li>
              sometimes a <strong>"delete again after a short delay"</strong> trick,
            </li>
            <li>or version numbers on cached values.</li>
          </ul>
          <h3 id="part-b-eviction-when-the-cache-is-full">Part B: Eviction, when the cache is full</h3>
          <LruCache caption="A 4-slot cache. Request keys by hand and compare which one each policy throws away." />
          <p>
            Memory is limited. When the cache is full and a new item arrives, something must be removed. The rule for
            choosing is the <strong>eviction policy</strong>:
          </p>
          <ul>
            <li>
              <strong>LRU (Least Recently Used).</strong> Remove the item that hasn't been accessed for the longest
              time. It's the most common default, and matches "recently used things will be used again".
            </li>
            <li>
              <strong>LFU (Least Frequently Used).</strong> Remove the item accessed the fewest times. It's better when
              some items are always popular, and resists one-off scans pushing popular items out.
            </li>
            <li>
              <strong>FIFO (First In, First Out).</strong> Remove the oldest-added item. Simple, but ignores popularity.
            </li>
            <li>
              <strong>Random.</strong> Remove a random item. Surprisingly decent and very cheap.
            </li>
            <li>
              <strong>TTL-based.</strong> Items expire when their time is up, whether or not memory is full.
            </li>
          </ul>
          <p>
            In Redis, you choose the policy with the <code>maxmemory-policy</code> setting:
          </p>
          <ul>
            <li>
              <code>allkeys-lru</code> / <code>allkeys-lfu</code> evict any key.
            </li>
            <li>
              <code>volatile-lru</code> / <code>volatile-ttl</code> only evict keys that have a TTL.
            </li>
            <li>
              <code>noeviction</code> returns errors when memory is full. That's right for Redis used as a primary
              store, and wrong for a cache.
            </li>
          </ul>
          <p>
            Redis uses <strong>approximate</strong> LRU/LFU: it samples a few keys and evicts the best candidate among
            them, which is much cheaper than tracking exact order.
          </p>
          <p>
            <strong>Watch the eviction rate.</strong> If popular items are constantly being evicted, the cache is too
            small, and your hit ratio suffers.
          </p>
          <h3 id="part-c-invalidation-keeping-data-fresh">Part C: Invalidation, keeping data fresh</h3>
          <p>There's no perfect answer. You choose based on how stale each piece of data is allowed to be.</p>
          <p>
            <strong>1. TTL only.</strong> Let entries expire. Simple, and good when "a bit stale" is fine, like a view
            count or a trending list.
          </p>
          <p>
            <strong>2. Delete on write.</strong> The app deletes the cache key whenever it updates the data. Accurate,
            but every code path that writes must remember to do it. Forgetting one path is a common bug.
          </p>
          <p>
            <strong>3. Event-driven invalidation.</strong> When data changes in the database, an <strong>event</strong>{" "}
            is published, for example through a queue or <strong>Change Data Capture (CDC)</strong> that reads the
            database's change log. A separate process listens and deletes the matching cache keys. This is reliable even
            when many services write to the same data (Part 6).
          </p>
          <p>
            <strong>4. Versioned keys.</strong> Include a version in the key: <code>product:991:v7</code>. When the
            product changes, bump the version to <code>v8</code>. Old entries are never read again and simply expire.
            This avoids delete races completely.
          </p>
          <p>
            <strong>Ask for each type of data: how stale can it be?</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Acceptable staleness</th>
                  <th>Approach</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>View counts, likes</td>
                  <td>Minutes</td>
                  <td>TTL, write-behind</td>
                </tr>
                <tr>
                  <td>Product description</td>
                  <td>Minutes</td>
                  <td>TTL + delete on write</td>
                </tr>
                <tr>
                  <td>Price shown on page</td>
                  <td>Seconds to minutes</td>
                  <td>Short TTL + delete on write</td>
                </tr>
                <tr>
                  <td>Price at checkout</td>
                  <td>None</td>
                  <td>
                    <strong>Read from the source</strong>
                  </td>
                </tr>
                <tr>
                  <td>Account balance for payment</td>
                  <td>None</td>
                  <td>
                    <strong>Read from the source</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 id="part-d-when-caches-cause-outages">Part D: When caches cause outages</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">1. Cache stampede (thundering herd)</h4>
          <p>
            A very popular key expires. Thousands of requests miss <strong>at the same moment</strong>, and all of them
            query the database for the same data:
          </p>
          <Timeline
            caption="A cache stampede, second by second."
            events={[
              { time: <>10:00:00.000</>, text: <>the popular key “homepage:deals” expires</> },
              {
                time: <>10:00:00.001</>,
                text: <>5,000 requests miss at once → 5,000 identical database queries</>,
                tone: "bad",
              },
              {
                time: <>10:00:00.200</>,
                text: <>database CPU at 100%; queries slow to seconds; more requests pile up</>,
                tone: "bad",
              },
              {
                time: <>The fix</>,
                text: <>one request takes a lock (SET key NX) and rebuilds; the rest get the stale value or wait</>,
                tone: "good",
              },
            ]}
          />
          <p>Fixes:</p>
          <ul>
            <li>
              <strong>Locking / request coalescing.</strong> The first request to miss takes a short lock (for example,
              a Redis <code>SET key NX</code>) and rebuilds the value. Others wait briefly, or get the old value.
            </li>
            <li>
              <strong>Serve stale while refreshing.</strong> Keep the old value a bit longer, return it, and refresh in
              the background (like <code>stale-while-revalidate</code> in post 14).
            </li>
            <li>
              <strong>Probabilistic early refresh.</strong> Each request has a small, growing chance of refreshing the
              key <em>before</em> it expires, so it's refreshed by one request instead of stampeded by all.
            </li>
            <li>
              <strong>Refresh-ahead</strong> for known hot keys.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">2. Cache avalanche</h4>
          <p>
            <strong>Many keys expire at the same time</strong>, for example because they were all loaded with a 1-hour
            TTL right after a deploy. The database suddenly gets a flood of misses.
          </p>
          <p>
            The fix is to <strong>add jitter to TTLs</strong>: instead of exactly 3600 seconds, use 3600 plus a random
            0–300 seconds, so expirations are spread out.
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">3. Cache penetration</h4>
          <p>
            Requests for data that <strong>doesn't exist</strong> (like <code>product:99999999</code>) always miss the
            cache and always hit the database. Attackers can abuse this. Fixes:
          </p>
          <ul>
            <li>
              <strong>Cache "not found" results</strong> too, with a short TTL.
            </li>
            <li>
              Use a <strong>Bloom filter</strong>, a compact structure that can quickly answer "this ID definitely
              doesn't exist", in front of the database.
            </li>
            <li>Validate input (reject IDs that are obviously invalid).</li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">4. Hot keys</h4>
          <p>
            One key gets a huge share of traffic, such as a celebrity's profile or a viral post. Even Redis can struggle
            if one node is handling one key.
          </p>
          <p>Fixes:</p>
          <ul>
            <li>
              keep a <strong>small local in-process cache</strong> of that key on each app server for a few seconds,
            </li>
            <li>
              or <strong>replicate</strong> the key across several cache nodes (<code>post:123#1</code>,{" "}
              <code>post:123#2</code>…) and read from a random copy.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">5. The cache goes down</h4>
          <p>
            If the cache fails, <strong>all</strong> traffic hits the database, which was sized assuming a 95% hit
            ratio. It may collapse instantly. Plan for this:
          </p>
          <ul>
            <li>
              run the cache with <strong>replicas</strong> (Redis replication, Redis Cluster),
            </li>
            <li>
              <strong>limit database concurrency</strong>, so it degrades rather than dies,
            </li>
            <li>
              consider <strong>warming</strong> a new cache before sending traffic to it,
            </li>
            <li>
              use <strong>circuit breakers and load shedding</strong> (Part 7).
            </li>
          </ul>
          <Compare
            caption="The five cache failure modes and their standard defences."
            columns={[
              {
                title: <>Stampede</>,
                items: [
                  { sign: "·", text: <>One hot key expires; thousands miss together</> },
                  { sign: "+", text: <>Lock / coalesce, stale-while-revalidate, early refresh</> },
                ],
              },
              {
                title: <>Avalanche</>,
                items: [
                  { sign: "·", text: <>Many keys expire at the same moment</> },
                  { sign: "+", text: <>Add random jitter to every TTL</> },
                ],
              },
              {
                title: <>Penetration</>,
                items: [
                  { sign: "·", text: <>Requests for keys that don't exist always miss</> },
                  { sign: "+", text: <>Cache “not found”, Bloom filter, validate input</> },
                ],
              },
              {
                title: <>Hot key · cache down</>,
                items: [
                  { sign: "·", text: <>One key or the whole cache overwhelms the DB</> },
                  { sign: "+", text: <>Local copies, key replicas, cache replicas, limit DB concurrency</> },
                ],
              },
            ]}
          />
          <h3 id="part-e-sizing-and-monitoring">Part E: Sizing and monitoring</h3>
          <p>Track:</p>
          <ul>
            <li>
              <strong>hit ratio</strong> (overall and per key type),
            </li>
            <li>
              <strong>evictions per second</strong>,
            </li>
            <li>
              <strong>memory usage</strong> (and fragmentation, in Redis),
            </li>
            <li>
              <strong>p99 latency</strong> of cache calls,
            </li>
            <li>
              <strong>database load</strong>, which should drop when you add caching and spike when the cache has
              problems.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Freshness vs speed.</strong> Longer TTLs give more hits but staler data.
            </li>
            <li>
              <strong>Write-through vs cache-aside.</strong> Fresher data after writes, but slower writes and wasted
              cache space.
            </li>
            <li>
              <strong>Write-behind</strong> gives very fast writes but can lose data. Use it only where that's
              acceptable.
            </li>
            <li>
              <strong>LRU vs LFU.</strong> LRU is simple and adapts quickly. LFU protects long-term popular items but
              reacts more slowly to new trends.
            </li>
            <li>
              <strong>Every protection</strong> (locks, jitter, Bloom filters) adds code and complexity. Use the ones
              that fit your traffic.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Facebook's leases.</strong> In its memcache paper, Facebook describes <strong>leases</strong>, a
            mechanism where the cache gives one client permission to refill a missing key and tells others to wait
            briefly. It solves both stale sets (the update race above) and thundering herds, at enormous scale.
          </p>
          <p>
            <strong>Facebook's 2010 outage.</strong> In September 2010, Facebook went down for around two and a half
            hours. A configuration value in the main data store was changed to a value that the system treated as
            invalid. An automated system on every client tried to "fix" its copy by querying the database cluster, and
            hundreds of thousands of queries per second overloaded it. Errors made clients retry and delete cache keys,
            making things worse. The team had to cut traffic to let the databases recover. It's a real-world example of
            a <strong>feedback loop between caches and databases</strong>.
          </p>
          <p>
            <strong>Stale prices and inventory.</strong> Many online stores show cached prices and stock on product
            pages for speed, but <strong>re-check</strong> both from the source at checkout. It's a practical example of
            choosing different freshness rules for different moments.
          </p>
          <p>
            <strong>Hot keys during big events.</strong> Social platforms regularly deal with single posts, like a
            celebrity announcement or a major news event, receiving huge traffic in seconds. Local caches and key
            replication are common defences.
          </p>
          <p>
            <strong>The famous quote.</strong> Phil Karlton's line, "There are only two hard things in Computer Science:
            cache invalidation and naming things", is repeated so often because nearly every engineering team eventually
            has a stale-cache bug story.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Compare cache-aside, write-through and write-behind.</>,
                a: (
                  <>
                    <p>
                      Cache-aside: the app reads the cache, loads from the DB on a miss, and deletes the key on write —
                      simple and safe. Write-through: writes update cache and DB together — fresh reads after writes,
                      slower writes. Write-behind: writes go to the cache and reach the DB later — fastest writes, but
                      data can be lost, so only for counters and analytics.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why delete the cache entry on write instead of updating it?</>,
                a: (
                  <>
                    <p>
                      Two concurrent writers can update the DB in one order and the cache in the other, leaving the
                      cache permanently wrong until TTL. Deleting makes the next reader reload the true value. Add a TTL
                      to everything as a safety net for the remaining small races.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is a cache stampede, and how do you prevent it?</>,
                a: (
                  <>
                    <p>
                      A hot key expires and many requests miss at once, all hitting the database for the same value.
                      Prevent it by letting one request rebuild under a lock while others wait or get the stale value,
                      by serving stale-while-revalidate, or by refreshing hot keys early and probabilistically.
                    </p>
                  </>
                ),
              },
              {
                q: <>LRU vs LFU?</>,
                a: (
                  <>
                    <p>
                      LRU evicts what hasn't been used for the longest time: simple, adapts quickly to new trends, but a
                      one-off scan can flush popular items. LFU evicts what's used least often: protects long-term
                      favourites, but reacts slowly when popularity shifts. Redis supports approximate versions of both.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you handle requests for IDs that don't exist?</>,
                a: (
                  <>
                    <p>
                      That's cache penetration: every request misses and hits the database. Cache the negative result
                      with a short TTL, put a Bloom filter in front to reject IDs that definitely don't exist, and
                      validate input early.
                    </p>
                  </>
                ),
              },
              {
                q: <>What happens if your cache cluster goes down?</>,
                a: (
                  <>
                    <p>
                      All traffic hits a database sized for a 95% hit ratio, and it may collapse instantly. Mitigate
                      with cache replicas, limits on DB concurrency and load shedding so it degrades instead of dying,
                      circuit breakers, and warming a new cache before sending it traffic.
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
              <strong>Cache-aside</strong> (read from cache, load on miss, <strong>delete on write</strong>) is the safe
              default. Write-through, write-behind and refresh-ahead fit special cases.
            </li>
            <li>
              Prefer <strong>deleting</strong> keys over updating them on writes, and put a{" "}
              <strong>TTL on everything</strong>.
            </li>
            <li>
              <strong>Eviction policies</strong> (LRU, LFU, TTL) decide what leaves a full cache. Watch evictions and
              hit ratio.
            </li>
            <li>
              Choose <strong>invalidation</strong> per data type, based on <strong>how stale it can be</strong>.
              Critical values (checkout price, balance) should come from the source.
            </li>
            <li>
              Defend against <strong>stampedes</strong> (locks, stale-while-revalidate), <strong>avalanches</strong>{" "}
              (TTL jitter), <strong>penetration</strong> (cache misses, Bloom filters), <strong>hot keys</strong> and{" "}
              <strong>cache failure</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              The paper "Scaling Memcache at Facebook" (NSDI 2013), especially the sections on leases and regional
              invalidation
            </li>
            <li>The AWS Builders' Library article "Caching challenges and strategies"</li>
            <li>The System Design Primer on GitHub (section "When to update the cache")</li>
            <li>Redis documentation on key eviction policies</li>
            <li>The paper "Optimal Probabilistic Cache Stampede Prevention" (VLDB 2015)</li>
            <li>Azure Architecture Center pattern "Cache-Aside"</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
