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
            like <code>https://sho.rt/aZ3kQ9x</code>. A URL is a web address. When someone opens the short link, the server sends a
            reply that says "go to this other address". The browser then goes there. This is called a{" "}
            <strong>redirect</strong>.
          </p>
          <p>
            It sounds too simple for a system design case study. That is exactly why it is a classic. It is small
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
              People collect coats <strong>far more often</strong> than they check new ones in, and collecting must be{" "}
              <strong>fast</strong>.
            </li>
          </ul>
          <p>So the main parts of the design are:</p>
          <ol>
            <li>
              <strong>Generate a short, unique code</strong> for each long URL.
            </li>
            <li>
              <strong>Store the mapping</strong> from code to long URL, durably (so it is never lost).
            </li>
            <li>
              <strong>Look it up very fast</strong> for each redirect, even when there are very many.
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
              <strong>Very high availability for redirects</strong> (the service is almost always up). A broken short link breaks every place where it was
              shared.
            </li>
            <li>
              <strong>Low latency:</strong> redirects should feel instant. p99 under about 50 ms on the server means 99 out of 100 requests are faster than 50 ms.
            </li>
            <li>
              <strong>Durability:</strong> once a link is created, it must not be lost.
            </li>
            <li>
              <strong>Unpredictable codes:</strong> codes should not be easy to guess or to list one by one (enumerate). This protects private
              links.
            </li>
            <li>
              <strong>Read-heavy:</strong> there are far more redirects (reads) than new links (writes).
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
            <strong>Traffic</strong> (there are about 2.6 million seconds in a month):
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
                sub: <>plus indexes and replicas; easy to shard (split across machines) and fits a key-value store</>,
              },
            ]}
          />
          <p>
            <strong>Cache:</strong> a cache is fast memory that keeps copies of popular data. If 20% of links get 80% of the traffic, the hottest links from recent
            traffic need only tens of GB. This fits easily in a Redis cluster (Redis is an in-memory data store).
          </p>
          <p>
            <strong>So this means:</strong>
          </p>
          <ul>
            <li>
              <strong>Writes are small.</strong> One primary database (the main one that accepts writes) can handle them.
            </li>
            <li>
              <strong>Reads need caching</strong> (and maybe a CDN or edge redirects) to keep latency low.
            </li>
            <li>
              <strong>Storage is moderate:</strong> a few TB fits in a sharded relational database or in a key-value store
              like DynamoDB or Cassandra. (A key-value store finds a value by its key, like a dictionary.)
            </li>
            <li>
              <strong>Code length:</strong> we need room for <strong>at least 12 billion codes</strong>, with a lot of space
              left over.
            </li>
          </ul>
          <h3 id="how-long-should-the-code-be">How long should the code be?</h3>
          <p>
            <strong>Base62</strong> means writing numbers with 62 different characters (<code>a–z</code>, <code>A–Z</code>, <code>0–9</code>). With them, each position can hold 62 values:
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
            <strong>7 characters</strong> gives about 3.5 trillion codes, roughly 290 times our 10-year need. That is enough
            room to keep codes <strong>spread out and hard to guess</strong>.
          </p>
          <h3 id="step-3-api-and-data-model">Step 3: API and data model</h3>
          <p>
            <strong>API:</strong>
          </p>
          <CodeBlock lang="http" code={code2} />
          <p>
            <strong>301 or 302?</strong> These are HTTP status codes, the numbers a server sends to say what happened. 301 means "moved permanently" and 302 means "found, but only for now". 409 means "conflict", 410 means "gone" and 404 means "not found".
          </p>
          <ul>
            <li>
              <strong>301 (permanent):</strong> browsers and CDNs <strong>cache</strong> (remember) the redirect, so repeat visits
              may never reach your servers. This means less load, but <strong>you lose analytics</strong>, and you{" "}
              <strong>cannot change or expire</strong> the link reliably for users who have cached it.
            </li>
            <li>
              <strong>302 / 307 (temporary):</strong> every visit comes back to you. You get correct analytics and
              control, but you get more traffic.
            </li>
            <li>
              Many shorteners use <strong>302 with short cache headers</strong> (instructions that tell caches how long to keep the answer). They accept a bit more load to keep control and
              analytics.
            </li>
          </ul>
          <p>
            <strong>Data model:</strong>
          </p>
          <AsciiDiagram text={diagram1} />
          <p>
            <strong>The main access pattern</strong> (how the data is read) is <strong>get by code</strong>. This is a perfect key-value
            lookup. Your options are:
          </p>
          <ul>
            <li>
              <strong>A relational DB</strong> (PostgreSQL/MySQL) with <code>code</code> as the primary key (the field that identifies each row). It is simple and
              reliable, and you can shard it later by code (post 25).
            </li>
            <li>
              <strong>A key-value / wide-column store</strong> (DynamoDB and Cassandra are databases that store each value under a key): made for exactly this kind of lookup
              at huge scale. They are easy to scale horizontally (by adding more machines).
            </li>
          </ul>
          <p>Either works at this scale. Many teams start with a relational database and move later if they need to (post 29).</p>
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
              <strong>Separate the create path and the redirect path.</strong> Redirects are about 100 times more frequent and must be
              very fast, so they should be able to scale on their own.
            </li>
            <li>
              <strong>Redirect servers</strong> check the cache first and use the database if the cache has no answer. Then they{" "}
              <strong>publish a click event asynchronously</strong>, which means they send it and do not wait for it (post 18). The event goes to <strong>Kafka</strong>, a system that stores a stream of messages so that other programs can read them later. They never wait for analytics.
            </li>
            <li>
              <strong>Analytics</strong> (counting and studying the clicks) is processed away from the main redirect path, so if analytics stops working, redirects still work.
            </li>
          </ul>
          <h3 id="step-5-deep-dives">Step 5: Deep dives</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 1: Generating unique short codes</h4>
          <p>
            <strong>Option A: Hash the long URL.</strong> A hash function turns any input into a fixed-size fingerprint (like MD5 or SHA-256). Compute the hash, write it in Base62, and
            keep the first 7 characters.
          </p>
          <CodeBlock code={code3} />
          <ul>
            <li>✅ The same URL gives the same code (this removes duplicates by itself, if you want that).</li>
            <li>
              ❌ <strong>Collisions:</strong> two different URLs can get the same first 7 characters. You must check the
              database and try again with a salt (extra random text added to the input). This adds lookups and race conditions (two requests clash at the same time).
            </li>
            <li>
              ❌ It is predictable if someone knows the URL. Also, you may not <em>want</em> deduplication, because different users may
              want separate links and separate analytics.
            </li>
          </ul>
          <p>
            <strong>Option B: A unique counter, Base62-encoded.</strong> Base62 encoding turns a big number into a short text. For example, the number 125 needs only two Base62 characters. Give every new URL a{" "}
            <strong>unique number</strong>, then encode it:
          </p>
          <Base62 caption="A counter-based short code, live. Type an ID and watch it become base62, then see how long seven characters last." />
          <p>How do you get unique numbers across many servers?</p>
          <ul>
            <li>
              <strong>A single database sequence or auto-increment:</strong> a counter that the database raises by one each time. It is simple, but
              every writer must wait for this one counter (a single point of contention). This is fine at about 40 writes per second.
            </li>
            <li>
              <strong>Ticket servers / ranges:</strong> each API server <strong>takes a block</strong> of IDs (for
              example, 1,000 at a time) from a central counter (in a database or ZooKeeper, a service that helps servers agree), then gives them out
              by itself. This is very fast, and if a block is lost, it only leaves a harmless gap.
            </li>
            <li>
              <strong>Snowflake-style IDs:</strong> 64-bit IDs built from{" "}
              <strong>timestamp + machine ID + sequence number</strong>. Every server makes IDs on its own, with no
              need to talk to the others (post 25).
            </li>
          </ul>
          <Stats
            caption="A Snowflake ID — 64 bits, unique without coordination, roughly time-ordered."
            stats={[
              { value: <>1 bit</>, label: <>unused</>, sub: <>sign bit</> },
              { value: <>41 bits</>, label: <>milliseconds since a chosen start date (epoch)</>, sub: <>~69 years of timestamps</> },
              { value: <>10 bits</>, label: <>machine ID</>, sub: <>up to 1,024 generators</> },
              { value: <>12 bits</>, label: <>sequence</>, sub: <>4,096 IDs per ms per machine</> },
            ]}
          />
          <ul>
            <li>✅ No collisions, no retries, and it is very fast.</li>
            <li>
              ❌ <strong>Sequential codes are guessable</strong> (<code>2BcP9aF</code>, <code>2BcP9aG</code>…). Anyone
              could <strong>enumerate</strong> (list one by one) the links and see private ones.
            </li>
            <li>
              <strong>Fix:</strong> <strong>scramble</strong> the ID before encoding it. Use a permutation (a reversible shuffle) or
              encryption of the number, with a secret key. The codes stay unique but{" "}
              <strong>look random</strong>.
            </li>
          </ul>
          <p>
            <strong>Option C: Random codes.</strong> Generate 7 random Base62 characters, and{" "}
            <strong>insert with a uniqueness check</strong>. A unique constraint on <code>code</code> is a database rule that rejects a second row with the same code. If a collision happens
            (rare, because there is so much space), try again with a new code.
          </p>
          <ul>
            <li>✅ Unpredictable and simple.</li>
            <li>
              ❌ The chance of a collision grows as the space fills up. But with 3.5 trillion slots and 12 billion used, it
              stays low.
            </li>
          </ul>
          <p>
            <strong>Option D: A pre-generated key service.</strong> A background service <strong>pre-generates</strong>{" "}
            random unique codes and stores them in an "unused keys" table. API servers take batches of keys. It is fast
            when a request arrives and has no collisions. But it is an extra service, and it must stay available too.
          </p>
          <p>
            <strong>A good choice here:</strong> <strong>random codes with a unique constraint</strong> (simple and
            hard to guess), or <strong>range-based / Snowflake IDs with scrambling</strong> (no collision checks). Custom
            aliases use the same table, and a <strong>unique constraint</strong> rejects duplicates with{" "}
            <strong>409 Conflict</strong>.
          </p>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 2: Making redirects fast</h4>
          <ul>
            <li>
              <strong>Cache-aside with Redis</strong> (post 16): the app checks the cache first, and on a miss it reads the database and saves the answer in the cache. The cache stores <code>code → long_url</code>, with a TTL (time to live, the time after which an entry is removed). Most
              redirects are served from memory in about 1 ms.
            </li>
            <li>
              <strong>Cache negative results</strong> ("code not found") for a short time. This protects the database from people who guess random codes
              (this attack is called cache penetration).
            </li>
            <li>
              <strong>Pre-warm or protect hot links:</strong> a viral link can get millions of hits per minute. To pre-warm means to load the cache before the traffic arrives. Use
              local caches inside each server's own process for the very hottest keys (post 16).
            </li>
            <li>
              <strong>Edge redirects:</strong> CDNs or edge functions (small programs that run near the user) can serve redirects for popular links close to
              users (post 14). Use short cache times so that expiry and analytics still work well enough.
            </li>
            <li>
              <strong>Read replicas</strong> (extra copies of the database for reading) handle cache misses (post 24).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 3: Scaling storage</h4>
          <p>At a few TB, one well-sized primary database with replicas can work for a while. After that:</p>
          <ul>
            <li>
              <strong>Shard by code</strong> (use a hash of the code to pick the shard, post 25). A shard is one part of the data on its own machine. Every redirect has the code, so every lookup goes to{" "}
              <strong>exactly one shard</strong>.
            </li>
            <li>
              Or use a <strong>key-value store</strong> (DynamoDB, Cassandra) that splits the data into partitions by itself.
            </li>
            <li>
              <strong>Expired links:</strong> a background job deletes them or moves them to cheap storage (archives them). Or use the database's built-in
              TTL feature if it has one.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 4: Analytics without slowing redirects</h4>
          <Flow
            caption="Click analytics, entirely off the redirect path."
            nodes={[
              { title: <>Redirect server</>, desc: <>publishes a click event and moves on</> },
              { title: <>Kafka topic “clicks”</>, desc: <>a buffer that keeps events safely until they are processed</> },
              { title: <>Stream processor</>, desc: <>per-link counters in Redis / DB</>, label: <>real time</> },
              {
                title: <>Data warehouse</>,
                desc: <>a large database built for reports: country, referrer, device, time</>,
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
              Use <strong>at-least-once</strong> delivery (every event arrives, but some may arrive twice) with approximate counts (post 37). An occasional double-counted click
              is acceptable here.
            </li>
            <li>
              Count unique visitors with approximate algorithms (like <strong>HyperLogLog</strong>). They give a close answer and use very little memory.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 5: Reliability and security</h4>
          <ul>
            <li>
              <strong>Availability:</strong> stateless redirect servers (they keep no data between requests) across <strong>several AZs</strong>, which are separate data centres (post 40),
              a cache and database with copies, and possibly <strong>multi-region</strong> read copies for users around the world.
            </li>
            <li>
              <strong>Graceful degradation:</strong> the system keeps its most important job when a part fails. If analytics is down, keep redirecting (post 44). If the cache is
              down, use the replicas, and drop some requests on purpose (load shedding) to protect the database.
            </li>
            <li>
              <strong>Abuse prevention:</strong>
              <ul>
                <li>
                  <strong>rate limit</strong> URL creation per API key and IP (post 43),
                </li>
                <li>
                  <strong>check long URLs</strong> against lists of known malware and phishing sites (blocklists), and let people report bad links
                  so you can turn them off,
                </li>
                <li>
                  <strong>do not allow</strong> redirects to dangerous schemes (the start of a URL, like <code>javascript:</code>),
                </li>
                <li>
                  watch for <strong>open-redirect</strong> misuse. An open redirect is a link on a trusted site that sends users anywhere, and phishers use it to look trustworthy.
                </li>
              </ul>
            </li>
            <li>
              <strong>Privacy:</strong> use codes that are hard to guess for private links, and offer links with a password or an expiry date.
            </li>
          </ul>
          <h3 id="wrap-up">Wrap-up</h3>
          <ul>
            <li>
              <strong>Key decisions:</strong> 7-character Base62 codes (random, or scrambled Snowflake IDs). A key-value
              access pattern on a relational or key-value store sharded by code. A separate redirect path with a Redis cache
              (and optional edge caching). 302 redirects with analytics sent asynchronously through Kafka (a system that moves streams of events between programs).
            </li>
            <li>
              <strong>Trade-offs:</strong> 302 gives analytics and control, but it means more traffic than 301. Random
              codes are hard to guess but need uniqueness checks. Analytics is eventually consistent (the numbers catch up a little later).
            </li>
            <li>
              <strong>Next steps:</strong> multi-region active-active redirects (several regions all serve traffic at the same time), per-user dashboards, link editing, and
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
            <strong>Bitly</strong> handles very large numbers of redirects for links shared on social media, in email
            and in marketing campaigns. Its business is largely <strong>click analytics</strong>. This is why it
            uses redirects that come back to its servers, and not permanent redirects that browsers cache.
          </p>
          <p>
            <strong>X's t.co.</strong> Every link posted on X (formerly Twitter) is wrapped in a <code>t.co</code> short
            link. This lets the platform <strong>count clicks</strong> and{" "}
            <strong>check links for harmful content</strong> at the moment of the click. It shows how a shortener can also act as a{" "}
            <strong>security checkpoint</strong>.
          </p>
          <p>
            <strong>Twitter Snowflake.</strong> Twitter created <strong>Snowflake</strong> around 2010 to make
            unique, roughly time-ordered 64-bit IDs on many machines without the machines talking to each other. A similar layout
            (timestamp + machine + sequence) is now widely used or copied. Discord uses it for message IDs, and
            Instagram uses a variation of it for its sharded IDs (post 25).
          </p>
          <p>
            <strong>Phishing and shorteners.</strong> Security teams have long warned that attackers use short links
            to <strong>hide harmful destinations</strong>. This is why major shorteners scan the destinations, show
            a warning page (an interstitial) for suspicious links, and let users preview where a link goes.
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
                      There are three main options. One: hash the URL and take 7 base62 characters (you must handle collisions).
                      Two: write a unique counter in base62 (no collisions, but you need a central counter or a block of
                      numbers for each server). Three: use Snowflake-style IDs. A counter with blocks of numbers plus base62
                      is simple and has no collisions. Add scrambling or randomness if codes must not be guessable.
                    </p>
                  </>
                ),
              },
              {
                q: <>How long should the code be?</>,
                a: (
                  <>
                    <p>
                      Long enough that the number of possible codes outlasts the product. 62⁷ ≈ 3.5 trillion codes, which lasts
                      more than 100 years at 1,000 new URLs a second. Six characters (about 57 billion) may also be enough, and
                      shorter codes are easier to share.
                    </p>
                  </>
                ),
              },
              {
                q: <>301 or 302 for the redirect?</>,
                a: (
                  <>
                    <p>
                      301 is permanent, so browsers and CDNs cache it. It is the fastest and cheapest, but you cannot see
                      repeat clicks and cannot easily change the target. 302 (or 307) is temporary, so every click
                      reaches you. It is better for analytics, expiry and editing, but it means more load.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you serve 20,000 redirects a second with p99 under 50 ms?</>,
                a: (
                  <>
                    <p>
                      Keep the redirect path small and made for reading. Put a Redis cache in front of the key-value store.
                      Use read replicas or a sharded store for cache misses. Possibly add edge caching. Send analytics
                      asynchronously to Kafka instead of writing it during the request.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you handle custom aliases and duplicates?</>,
                a: (
                  <>
                    <p>
                      A unique constraint on the code column means two people cannot claim the same alias at the same time.
                      The database rejects the second one, and you return 409 when the alias is taken. Whether the
                      same long URL always gets the same code is a product decision. If yes, keep a lookup by URL hash.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you stop the service being used for phishing or spam?</>,
                a: (
                  <>
                    <p>
                      Validate and clean up URLs. Check them against blocklists or safe-browsing services when they are created, and again
                      later in the background. Limit how many links one API key or IP can create. Make it possible to take
                      codes down (return 410 Gone).
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
              <strong>Estimate first:</strong> about 40 writes/s and about 4,000 reads/s mean that writes are easy and reads need{" "}
              <strong>caching</strong>. 12B URLs over 10 years fits in <strong>7 Base62 characters</strong> (3.5
              trillion possibilities).
            </li>
            <li>
              For <strong>code generation</strong>, prefer <strong>random codes with a unique constraint</strong>, or{" "}
              <strong>range/Snowflake IDs that are scrambled</strong> so they are hard to guess. Avoid sequential codes that can be listed one by one.
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
