import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { AsciiDiagram, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import Base62 from "@/components/sd/widgets/Base62";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-60")!;

export const metadata: Metadata = {
  title: `Lesson 60 — ${lesson.title}`,
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

const code1 = `https://www.example-shop.com/products/category/footwear/running/mens?id=9912&color=blue&utm_source=newsletter&utm_campaign=diwali_sale_2027`;

const code2 = `POST /api/v1/urls
Authorization: (API key, optional)
Idempotency-Key: (optional)
{ "longUrl": "https://…", "customAlias": "diwali-sale", "expiresAt": "2027-12-31T23:59:59Z" }

201 Created  { "code": "aZ3kQ9x", "shortUrl": "https://sho.rt/aZ3kQ9x", "expiresAt": "…" }
409 Conflict      (custom alias taken)
400 Bad Request   (invalid or disallowed URL)

GET /{code}
301 Moved Permanently / 302 Found    Location: https://…original…
404 Not Found / 410 Gone (expired)`;

const diagram1 = `url_mappings
┌────────────┬──────────────────────────────┬─────────────┬─────────────┬──────────┐
│ code (PK)  │ long_url                     │ created_at  │ expires_at  │ owner_id │
├────────────┼──────────────────────────────┼─────────────┼─────────────┼──────────┤
│ aZ3kQ9x    │ https://www.example-shop…    │ 2027-04-26  │ NULL        │ 881      │
└────────────┴──────────────────────────────┴─────────────┴─────────────┴──────────┘`;

const diagram2 = `                               ┌───────────────── CREATE PATH ─────────────────┐
Client ──POST /urls──► LB ──► API servers ──► ID/code generator ──► Database (primary)
                                  │                                   │ replicas
                                  └── validate URL (blocklist / safe-browsing check)

                               ┌───────────────── REDIRECT PATH ───────────────┐
Browser ──GET /aZ3kQ9x──► CDN/edge (optional) ──► LB ──► Redirect servers
                                                            │ 1. Redis cache hit? → 302
                                                            │ 2. miss → DB replica → cache → 302
                                                            └── 3. publish click event ──► Kafka ──► Analytics workers ──► Analytics store`;

const code3 = `base62(sha256("https://www.example-shop.com/…"))[:7] → "aZ3kQ9x"`;

export default function SdLessonSixZeroPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>Long URLs are ugly and hard to share:</p>
          <CodeBlock code={code1} />
          <p>
            A <strong>URL shortener</strong> (like Bitly or TinyURL, or X's <code>t.co</code>) turns that into something
            like <code>https://sho.rt/aZ3kQ9x</code>. When someone opens the short link, they're{" "}
            <strong>redirected</strong> to the original.
          </p>
          <p>
            It sounds almost too simple for a system design case study, which is exactly why it's a classic. It's small
            enough to design completely, but it touches{" "}
            <strong>
              ID generation, databases, caching, scaling reads, high availability, analytics and abuse prevention
            </strong>
            .
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about a <strong>coat check</strong> at a theatre:
          </p>
          <ul>
            <li>
              You hand over your coat (the long URL) and get a <strong>small numbered ticket</strong> (the short code).
            </li>
            <li>
              Later, anyone with that ticket gets back <strong>that exact coat</strong> (the redirect).
            </li>
            <li>
              Two people must <strong>never</strong> get the same ticket number.
            </li>
            <li>
              Getting coats back happens <strong>far more often</strong> than checking new ones in, and it must be{" "}
              <strong>fast</strong>.
            </li>
          </ul>
          <p>So the heart of the design is:</p>
          <ol>
            <li>
              <strong>Generate a short, unique code</strong> for each long URL.
            </li>
            <li>
              <strong>Store the mapping</strong> code → long URL, durably.
            </li>
            <li>
              <strong>Look it up extremely fast</strong> for redirects, at high volume.
            </li>
          </ol>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="step-1-requirements">Step 1: Requirements</h3>
          <p>
            <strong>Functional:</strong>
          </p>
          <ol>
            <li>
              Given a long URL, create a <strong>short URL</strong>.
            </li>
            <li>
              Visiting the short URL <strong>redirects</strong> to the long URL.
            </li>
            <li>
              Optional: <strong>custom aliases</strong> (<code>sho.rt/diwali-sale</code>).
            </li>
            <li>
              Optional: <strong>expiry</strong> (the link stops working after a date).
            </li>
            <li>
              Optional: basic <strong>click analytics</strong> (counts, referrers, countries).
            </li>
          </ol>
          <p>
            <strong>Out of scope:</strong> user accounts and dashboards, link editing, QR codes.
          </p>
          <p>
            <strong>Non-functional:</strong>
          </p>
          <ul>
            <li>
              <strong>Very high availability for redirects.</strong> A broken short link breaks every place it was
              shared.
            </li>
            <li>
              <strong>Low latency:</strong> redirects should feel instant (p99 &lt; ~50 ms server-side).
            </li>
            <li>
              <strong>Durability:</strong> once created, links must not be lost.
            </li>
            <li>
              <strong>Unpredictable codes:</strong> codes shouldn't be easy to guess or enumerate, to protect private
              links.
            </li>
            <li>
              <strong>Read-heavy:</strong> far more redirects than creations.
            </li>
          </ul>
          <h3 id="step-2-estimation">Step 2: Estimation</h3>
          <p>Assumptions:</p>
          <ul>
            <li>
              <strong>100 million new URLs per month.</strong>
            </li>
            <li>
              <strong>Read:write ratio 100:1</strong>, so <strong>10 billion redirects per month</strong>.
            </li>
            <li>
              Keep links for <strong>10 years</strong>.
            </li>
            <li>
              About <strong>500 bytes</strong> per record (long URL + metadata).
            </li>
          </ul>
          <p>
            <strong>Traffic</strong> (about 2.6 million seconds per month):
          </p>
          <Stats
            caption="Traffic, from 100 M new URLs and 10 B redirects a month."
            stats={[
              { value: <>~40 / s</>, label: <>writes</>, sub: <>peak ~100–200 / s</> },
              { value: <>~3,800 / s</>, label: <>redirects</>, sub: <>peak ~10,000–20,000 / s</> },
              { value: <>~100 : 1</>, label: <>reads to writes</>, sub: <>design the read path first</> },
            ]}
          />
          <p>
            <strong>Storage:</strong>
          </p>
          <Stats
            caption="Storage over ten years."
            stats={[
              { value: <>12 B</>, label: <>URLs</>, sub: <>100 M/month × 12 × 10</> },
              { value: <>~500 B</>, label: <>per row</>, sub: <>code, URL, timestamps, owner</> },
              {
                value: <>~6 TB</>,
                label: <>raw</>,
                sub: <>plus indexes and replicas — sharding-friendly, key-value shaped</>,
              },
            ]}
          />
          <p>
            <strong>Cache:</strong> if 20% of links get 80% of the traffic, caching the hottest links from recent
            traffic takes tens of GB, which fits easily in a Redis cluster.
          </p>
          <p>
            <strong>So this means:</strong>
          </p>
          <ul>
            <li>
              <strong>Writes are tiny.</strong> One database primary could handle them.
            </li>
            <li>
              <strong>Reads need caching</strong> (and maybe CDN or edge redirects) to keep latency low.
            </li>
            <li>
              <strong>Storage is moderate:</strong> a few TB fits a sharded relational database or a key-value store
              like DynamoDB or Cassandra.
            </li>
            <li>
              <strong>Code length:</strong> we need room for <strong>at least 12 billion codes</strong>, with plenty to
              spare.
            </li>
          </ul>
          <h3 id="how-long-should-the-code-be">How long should the code be?</h3>
          <p>
            Using <strong>Base62</strong> characters (<code>a–z</code>, <code>A–Z</code>, <code>0–9</code>):
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Length</th>
                  <th>Possible codes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>6</td>
                  <td>
                    62⁶ ≈ <strong>56.8 billion</strong>
                  </td>
                </tr>
                <tr>
                  <td>7</td>
                  <td>
                    62⁷ ≈ <strong>3.5 trillion</strong>
                  </td>
                </tr>
                <tr>
                  <td>8</td>
                  <td>
                    62⁸ ≈ <strong>218 trillion</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>7 characters</strong> gives about 3.5 trillion codes, roughly 290× our 10-year need. That's enough
            room to keep codes <strong>sparse and hard to guess</strong>.
          </p>
          <h3 id="step-3-api-and-data-model">Step 3: API and data model</h3>
          <p>
            <strong>API:</strong>
          </p>
          <CodeBlock lang="http" code={code2} />
          <p>
            <strong>301 or 302?</strong>
          </p>
          <ul>
            <li>
              <strong>301 (permanent):</strong> browsers and CDNs <strong>cache</strong> the redirect, so repeat visits
              may never reach your servers. That's less load, but <strong>you lose analytics</strong>, and you{" "}
              <strong>can't change or expire</strong> the link reliably for users who've cached it.
            </li>
            <li>
              <strong>302 / 307 (temporary):</strong> every visit comes back to you. You get accurate analytics and
              control, at the cost of more traffic.
            </li>
            <li>
              Many shorteners use <strong>302 with short cache headers</strong>, trading a bit of load for control and
              analytics.
            </li>
          </ul>
          <p>
            <strong>Data model:</strong>
          </p>
          <AsciiDiagram text={diagram1} />
          <p>
            <strong>The main access pattern</strong> is <strong>get by code</strong>, which is a perfect key-value
            lookup. Options:
          </p>
          <ul>
            <li>
              <strong>A relational DB</strong> (PostgreSQL/MySQL) with <code>code</code> as the primary key: simple and
              reliable, and shardable later by code (post 25).
            </li>
            <li>
              <strong>A key-value / wide-column store</strong> (DynamoDB, Cassandra): designed for exactly this lookup
              at huge scale, with easy horizontal scaling.
            </li>
          </ul>
          <p>Either works at this scale. Many teams start relational and move later if needed (post 29).</p>
          <h3 id="step-4-high-level-design">Step 4: High-level design</h3>
          <AsciiDiagram text={diagram2} />
          <SequenceDiagram
            caption="The redirect path — the hot one. Most requests never reach the database."
            actors={["Browser", "Redirect server", "Redis", "DB replica", "Kafka"]}
            messages={[
              { from: 0, to: 1, label: <>GET /aZ3kQ9x</> },
              { from: 1, to: 2, label: <>GET url:aZ3kQ9x</> },
              { from: 2, to: 1, label: <>hit → long URL</>, note: <>~95%+ of requests</>, reply: true },
              { from: 1, to: 0, label: <>302 Location: https://…</>, reply: true },
              { from: 1, to: 4, label: <>click event</>, note: <>fire-and-forget, off the critical path</> },
              {
                from: 0,
                to: 0,
                label: <>On a cache miss — read a DB replica, fill Redis, then redirect</>,
                divider: true,
              },
            ]}
          />
          <ul>
            <li>
              <strong>Separate the create and redirect paths.</strong> Redirects are ~100× more frequent and must be
              extremely fast, so they can scale independently.
            </li>
            <li>
              <strong>Redirect servers</strong> check the cache, fall back to the database, and{" "}
              <strong>publish a click event asynchronously</strong> (post 18). They never wait for analytics.
            </li>
            <li>
              <strong>Analytics</strong> is processed off the critical path, so an analytics outage never breaks
              redirects.
            </li>
          </ul>
          <h3 id="step-5-deep-dives">Step 5: Deep dives</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 1: Generating unique short codes</h4>
          <p>
            <strong>Option A: Hash the long URL.</strong> Compute a hash (like MD5 or SHA-256), Base62-encode it, and
            take the first 7 characters.
          </p>
          <CodeBlock code={code3} />
          <ul>
            <li>✅ The same URL gives the same code (natural deduplication, if you want it).</li>
            <li>
              ❌ <strong>Collisions:</strong> different URLs can share the first 7 characters. You must check the
              database and retry with a salt, which adds lookups and races.
            </li>
            <li>
              ❌ It's predictable if someone knows the URL, and you may not <em>want</em> dedup (different users may
              want separate links and analytics).
            </li>
          </ul>
          <p>
            <strong>Option B: A unique counter, Base62-encoded.</strong> Give every new URL a{" "}
            <strong>unique number</strong>, then encode it:
          </p>
          <Base62 caption="A counter-based short code, live. Type an ID and watch it become base62 — then see how long seven characters last." />
          <p>How do you get unique numbers across many servers?</p>
          <ul>
            <li>
              <strong>A single database sequence or auto-increment:</strong> simple, but a single point of contention
              (fine at ~40 writes per second).
            </li>
            <li>
              <strong>Ticket servers / ranges:</strong> each API server <strong>grabs a block</strong> of IDs (for
              example, 1,000 at a time) from a central counter (in a database or ZooKeeper), then hands them out
              locally. That's very fast, and a lost block just leaves a harmless gap.
            </li>
            <li>
              <strong>Snowflake-style IDs:</strong> 64-bit IDs built from{" "}
              <strong>timestamp + machine ID + sequence</strong>. Every server generates IDs independently, with no
              coordination (post 25).
            </li>
          </ul>
          <Stats
            caption="A Snowflake ID — 64 bits, unique without coordination, roughly time-ordered."
            stats={[
              { value: <>1 bit</>, label: <>unused</>, sub: <>sign bit</> },
              { value: <>41 bits</>, label: <>milliseconds since epoch</>, sub: <>~69 years of timestamps</> },
              { value: <>10 bits</>, label: <>machine ID</>, sub: <>up to 1,024 generators</> },
              { value: <>12 bits</>, label: <>sequence</>, sub: <>4,096 IDs per ms per machine</> },
            ]}
          />
          <ul>
            <li>✅ No collisions, no retries, and very fast.</li>
            <li>
              ❌ <strong>Sequential codes are guessable</strong> (<code>2BcP9aF</code>, <code>2BcP9aG</code>…). Anyone
              could <strong>enumerate</strong> links, exposing private ones.
            </li>
            <li>
              <strong>Fix:</strong> <strong>scramble</strong> the ID before encoding, with a reversible permutation or
              encryption of the number (like a keyed shuffle). That keeps codes unique but{" "}
              <strong>random-looking</strong>.
            </li>
          </ul>
          <p>
            <strong>Option C: Random codes.</strong> Generate 7 random Base62 characters, and{" "}
            <strong>insert with a uniqueness check</strong> (a unique constraint on <code>code</code>). If it collides
            (rare, since there's so much space), retry.
          </p>
          <ul>
            <li>✅ Unpredictable, and simple.</li>
            <li>
              ❌ The collision chance grows as the space fills (but with 3.5 trillion slots and 12 billion used, it
              stays low).
            </li>
          </ul>
          <p>
            <strong>Option D: A pre-generated key service.</strong> A background service <strong>pre-generates</strong>{" "}
            random unique codes and stores them in an "unused keys" table. API servers take batches of keys. It's fast
            at request time, with no collisions, but it's an extra service with its own availability needs.
          </p>
          <p>
            <strong>A good choice here:</strong> <strong>random codes with a unique constraint</strong> (simple and
            unguessable), or <strong>range-based / Snowflake IDs with scrambling</strong> (no collision checks). Custom
            aliases use the same table, and a <strong>unique constraint</strong> rejects duplicates with{" "}
            <strong>409 Conflict</strong>.
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 2: Making redirects fast</h4>
          <ul>
            <li>
              <strong>Cache-aside with Redis</strong> (post 16): <code>code → long_url</code>, with a TTL. Most
              redirects are served from memory in about 1 ms.
            </li>
            <li>
              <strong>Cache negative results</strong> ("code not found") briefly, to protect the database from random
              guessing (cache penetration).
            </li>
            <li>
              <strong>Pre-warm or protect hot links:</strong> a viral link can get millions of hits per minute. Use
              local in-process caches for the very hottest keys (post 16).
            </li>
            <li>
              <strong>Edge redirects:</strong> CDNs or edge functions can serve redirects for popular links close to
              users (post 14), with short cache times so expiry and analytics still work well enough.
            </li>
            <li>
              <strong>Read replicas</strong> for cache misses (post 24).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 3: Scaling storage</h4>
          <p>At a few TB, a single well-sized primary with replicas can work for a while. Beyond that:</p>
          <ul>
            <li>
              <strong>Shard by code</strong> (hash-based, post 25). Every redirect has the code, so every lookup goes to{" "}
              <strong>exactly one shard</strong>.
            </li>
            <li>
              Or use a <strong>key-value store</strong> (DynamoDB, Cassandra) that partitions automatically.
            </li>
            <li>
              <strong>Expired links:</strong> a background job deletes or archives them (or use the database's built-in
              TTL feature where it exists).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 4: Analytics without slowing redirects</h4>
          <Flow
            caption="Click analytics, entirely off the redirect path."
            nodes={[
              { title: <>Redirect server</>, desc: <>publishes a click event and moves on</> },
              { title: <>Kafka topic “clicks”</>, desc: <>durable buffer</> },
              { title: <>Stream processor</>, desc: <>per-link counters in Redis / DB</>, label: <>real time</> },
              {
                title: <>Data warehouse</>,
                desc: <>country, referrer, device, time</>,
                label: <>batch</>,
                tone: "good",
              },
            ]}
          />
          <ul>
            <li>
              Redirects <strong>never wait</strong> for analytics.
            </li>
            <li>
              Use <strong>at-least-once</strong> events with approximate counts (post 37). An occasional duplicate click
              count is acceptable here.
            </li>
            <li>
              Count unique visitors with approximate algorithms (like <strong>HyperLogLog</strong>) to save memory.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 5: Reliability and security</h4>
          <ul>
            <li>
              <strong>Availability:</strong> stateless redirect servers across <strong>multiple AZs</strong> (post 40),
              a replicated cache and database, and possibly <strong>multi-region</strong> read copies for global users.
            </li>
            <li>
              <strong>Graceful degradation:</strong> if analytics is down, keep redirecting (post 44). If the cache is
              down, fall back to replicas, with load shedding to protect the database.
            </li>
            <li>
              <strong>Abuse prevention:</strong>
              <ul>
                <li>
                  <strong>rate limit</strong> URL creation per API key and IP (post 43),
                </li>
                <li>
                  <strong>check long URLs</strong> against malware and phishing blocklists, and allow reporting and
                  disabling of bad links,
                </li>
                <li>
                  <strong>don't allow</strong> redirects to dangerous schemes (like <code>javascript:</code>),
                </li>
                <li>
                  watch out for <strong>open-redirect</strong> misuse in phishing campaigns.
                </li>
              </ul>
            </li>
            <li>
              <strong>Privacy:</strong> unguessable codes for private links, and optional password-protected or expiring
              links.
            </li>
          </ul>
          <h3 id="wrap-up">Wrap-up</h3>
          <ul>
            <li>
              <strong>Key decisions:</strong> 7-character Base62 codes (random, or scrambled Snowflake IDs); a key-value
              access pattern on a relational or KV store sharded by code; a separate redirect path with a Redis cache
              (and optional edge caching); 302 redirects with async analytics via Kafka.
            </li>
            <li>
              <strong>Trade-offs:</strong> 302 gives analytics and control at the cost of more traffic than 301. Random
              codes are unguessable but need uniqueness checks. Analytics is eventually consistent.
            </li>
            <li>
              <strong>Next steps:</strong> multi-region active-active redirects, per-user dashboards, link editing, and
              QR codes.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Decision</th>
                  <th>Option A</th>
                  <th>Option B</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Code generation</td>
                  <td>Hash (dedup, but collisions)</td>
                  <td>Counter/Snowflake (unique, but must scramble) or random (simple, retries rare)</td>
                </tr>
                <tr>
                  <td>Redirect type</td>
                  <td>301 (less load, lose analytics/control)</td>
                  <td>302/307 (analytics/control, more load)</td>
                </tr>
                <tr>
                  <td>Storage</td>
                  <td>Relational (simple, strong constraints)</td>
                  <td>Key-value (automatic scale-out)</td>
                </tr>
                <tr>
                  <td>Analytics</td>
                  <td>Synchronous (exact, slows redirects)</td>
                  <td>Async events (fast, approximate)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Bitly</strong> handles very large numbers of redirects for links shared across social media, email
            and marketing campaigns, and its business is largely <strong>click analytics</strong>, which is why it
            relies on redirects that return to its servers rather than permanent cached ones.
          </p>
          <p>
            <strong>X's t.co.</strong> Every link posted on X (formerly Twitter) is wrapped in a <code>t.co</code> short
            link. This lets the platform <strong>count clicks</strong> and{" "}
            <strong>check links for malicious content</strong> at click time. That shows how a shortener can double as a{" "}
            <strong>security control point</strong>.
          </p>
          <p>
            <strong>Twitter Snowflake.</strong> Twitter created <strong>Snowflake</strong> around 2010 to generate
            unique, roughly time-ordered 64-bit IDs across many machines without coordination. The same layout
            (timestamp + machine + sequence) is now used or copied widely, including by Discord for message IDs and by
            Instagram for its sharded IDs (post 25).
          </p>
          <p>
            <strong>Phishing and shorteners.</strong> Security teams have long warned that attackers use shortened links
            to <strong>hide malicious destinations</strong>. That's why major shorteners scan destinations, show
            interstitial warnings for suspicious links, and let users preview where a link goes.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>How would you generate short codes?</>,
                a: (
                  <>
                    <p>
                      Options: hash the URL and take 7 base62 characters (needs collision handling), encode a unique
                      counter in base62 (no collisions, but a central counter or pre-allocated ranges per server), or
                      use Snowflake-style IDs. A counter with range allocation plus base62 is simple and collision-free;
                      add randomness if codes shouldn't be guessable.
                    </p>
                  </>
                ),
              },
              {
                q: <>How long should the code be?</>,
                a: (
                  <>
                    <p>
                      Long enough for the key space to outlast the product: 62⁷ ≈ 3.5 trillion codes, which is centuries
                      at 1,000 new URLs a second. Six characters (~57 billion) may also be enough; shorter codes are
                      easier to share.
                    </p>
                  </>
                ),
              },
              {
                q: <>301 or 302 for the redirect?</>,
                a: (
                  <>
                    <p>
                      301 is permanent, so browsers and CDNs cache it — fastest and cheapest, but you lose visibility of
                      repeat clicks and can't easily change the target. 302 (or 307) is temporary, so every click
                      reaches you — better for analytics, expiry and editing, at more load.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you serve 20,000 redirects a second with p99 under 50 ms?</>,
                a: (
                  <>
                    <p>
                      Keep the redirect path tiny and read-optimised: a Redis cache in front of the key-value store,
                      read replicas or a sharded store for misses, possibly edge caching, and analytics pushed
                      asynchronously to Kafka instead of written inline.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you handle custom aliases and duplicates?</>,
                a: (
                  <>
                    <p>
                      A unique constraint on code makes alias claims race-free and returns 409 when taken. Whether the
                      same long URL gets the same code is a product decision; if yes, keep a lookup by URL hash.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you stop the service being used for phishing or spam?</>,
                a: (
                  <>
                    <p>
                      Validate and normalise URLs, check them against blocklists or safe-browsing services at creation
                      and asynchronously later, rate-limit creation per API key and IP, and support taking codes down
                      (410 Gone).
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
              A URL shortener is a <strong>very read-heavy key-value system</strong>: generate a unique code, store code
              → URL, and redirect <strong>fast and reliably</strong>.
            </li>
            <li>
              <strong>Estimate first:</strong> ~40 writes/s vs ~4,000 reads/s means writes are trivial and reads need{" "}
              <strong>caching</strong>. 12B URLs over 10 years fits in <strong>7 Base62 characters</strong> (3.5
              trillion possibilities).
            </li>
            <li>
              For <strong>code generation</strong>, prefer <strong>random codes with a unique constraint</strong>, or{" "}
              <strong>range/Snowflake IDs scrambled</strong> to be unguessable. Avoid sequential, enumerable codes.
            </li>
            <li>
              <strong>Separate redirect and create paths.</strong> Use{" "}
              <strong>Redis (and optionally edge) caching</strong>, <strong>shard by code</strong>, and send{" "}
              <strong>analytics asynchronously</strong> through a queue.
            </li>
            <li>
              Choose <strong>301 vs 302</strong> deliberately, keep redirects{" "}
              <strong>available even when analytics fails</strong>, and build in{" "}
              <strong>rate limits and malicious-URL checks</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>System Design Interview</em> by Alex Xu (chapter 8, "Design A URL Shortener", and chapter 7, "Design A
              Unique ID Generator in Distributed Systems")
            </li>
            <li>The System Design Primer on GitHub ("Design Pastebin.com (or Bit.ly)" solution)</li>
            <li>Twitter's Snowflake project (archived on GitHub)</li>
            <li>Flickr's engineering blog post "Ticket Servers: Distributed Unique Primary Keys on the Cheap"</li>
            <li>Instagram's engineering blog post "Sharding &amp; IDs at Instagram"</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
