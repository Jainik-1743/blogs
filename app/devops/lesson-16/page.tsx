import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import InterviewQA from "@/components/InterviewQA";
import LessonIntro from "@/components/LessonIntro";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson } from "@/lib/lessons";

const lesson = getLesson("lesson-16")!;

export const metadata: Metadata = {
  title: `Lesson 16 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Concept: a very fast whiteboard" },
  { id: "why-this-matters", label: "Why your app needs one" },
  { id: "what", label: "What Redis actually is" },
  { id: "local", label: "Learn it locally in five minutes" },
  { id: "cache-aside", label: "Pattern 1 — caching (cache-aside)" },
  { id: "sessions", label: "Pattern 2 — sessions" },
  { id: "rate-limit", label: "Pattern 3 — rate limiting" },
  { id: "more-patterns", label: "Patterns 4–6 — locks, queues, pub/sub" },
  { id: "eviction", label: "Memory, eviction and durability" },
  { id: "elasticache", label: "Run it on AWS: ElastiCache" },
  { id: "connect", label: "Connect the app safely" },
  { id: "monitor", label: "What to monitor" },
  { id: "when-not", label: "When not to use Redis" },
  { id: "cost", label: "What this costs" },
  { id: "troubleshooting", label: "Troubleshooting table" },
  { id: "interview", label: "Interview corner" },
  { id: "practice", label: "Practice task before Lesson 17" },
  { id: "conclusion", label: "Conclusion" },
];

const types: [string, string, string][] = [
  ["String", "SET user:1:name \"Asha\"", "Cached values, counters, on/off flags, tokens"],
  ["Hash", "HSET session:abc user 42 role admin", "A small object with named fields, such as a session or a profile"],
  ["List", "LPUSH jobs \"send-email\"", "Simple queues and feeds of recent activity"],
  ["Set", "SADD online:tenant7 42", "A group of unique items, such as who is online, or tags"],
  ["Sorted set", "ZADD leaderboard 980 \"asha\"", "Rankings, delayed jobs and sliding-window rate limits"],
  ["Stream", "XADD events * type signup", "A durable log of events that groups of workers can read"],
];

const trouble: [string, string, string][] = [
  ["Connection hangs, then times out", "cache-sg does not allow port 6379 from web-sg, or the client is in the wrong subnet or VPC", "Use the Lesson 6 checklist. Test with nc -vz <endpoint> 6379 from the server"],
  ["ECONNRESET or “Connection closed” immediately", "The cluster requires TLS but the client connects without TLS (or the other way round)", "Use tls: {} in ioredis, or rediss:// in the URL"],
  ["NOAUTH Authentication required / WRONGPASS", "The AUTH token or user is missing or wrong", "Pass the token as the password. Check for extra spaces or characters changed by the shell"],
  ["OOM command not allowed when used memory > 'maxmemory'", "Memory is full and the eviction policy is noeviction", "Add memory, set TTLs on keys, or choose an eviction policy. Also stop mixing cache data with critical data"],
  ["Cache hit rate is low", "The TTL is too short, the keys contain something unique for each request, or the data you use often does not fit in memory", "Check the key design. Raise the TTL. Look at the Evictions metric"],
  ["Users see stale data", "The key is not removed when data changes, or the TTL is too long", "Delete or update the key when the data changes. Use a shorter TTL for data that changes often"],
  ["Latency spikes", "Slow commands (KEYS, big lists), huge values, or the single main thread is fully busy", "Use SCAN, keep values small, watch EngineCPUUtilization, and split keys that get too much traffic"],
  ["Site goes down when Redis does", "The app treats Redis as required for every request", "Fail open for caches (fall back to the database) and set short command timeouts"],
];

export default function LessonSixteenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>Redis</strong> is a database that keeps its data in <strong>memory (RAM)</strong>
          instead of on disk. It stores simple values under names, which are called <em>keys</em>.
          A read or a write usually takes well under a millisecond. That is much faster than a
          typical PostgreSQL query. One modest server can do tens of thousands of operations per
          second.
        </p>
        <Callout kind="note" label="The analogy — the whiteboard next to the filing cabinet">
          <p className="mb-0">
            Postgres is the filing cabinet. Everything is stored safely and for a long time, but
            fetching a folder means a walk across the room. Redis is the whiteboard on the wall. You
            write there what you need all the time, and everyone can read it at a glance. The
            whiteboard is small. If the power goes out, you may lose what is on it. So never keep the
            only copy of something important on the whiteboard.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why your app needs one</h2>
        <p>
          After Lessons 8 and 12 you have many servers and one database. As you grow, three problems
          appear:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Problem</th>
                <th>Why it appears now</th>
                <th>Redis answer</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>The database is the bottleneck</strong></td>
                <td>Every page runs the same queries, and the database has a limit on connections (Lesson 8)</td>
                <td>Keep the results in memory. The database is asked once, not 10,000 times</td>
              </tr>
              <tr>
                <td><strong>Sessions vanish between servers</strong></td>
                <td>A login on server A is unknown to server B (Lesson 12)</td>
                <td>One shared session store that every server reads</td>
              </tr>
              <tr>
                <td><strong>Limits that must be global</strong></td>
                <td>&ldquo;5 login attempts per minute&rdquo; means nothing if each server counts on its own</td>
                <td>A shared counter that expires</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          People often call Redis the &ldquo;shared memory of a group of stateless servers&rdquo;.
          (Stateless means a server keeps no important data of its own.) It is the last piece that
          lets the web servers stay disposable, so you can delete and replace any of them.
        </p>

        <h2 id="what">What Redis actually is</h2>
        <p>
          Redis is a key-value store. This means you save a value under a name (the key) and read it
          back by that name. Redis has <strong>several value types</strong>, not only strings. Each
          type has atomic operations. Atomic means the operation happens fully or not at all, and
          nothing can interrupt it. Every key can also have an expiry time, called a{" "}
          <strong>TTL</strong> (time to live). When the time ends, Redis deletes the key
          automatically. This feature makes caches and sessions easy.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Example command</th>
                <th>Used for</th>
              </tr>
            </thead>
            <tbody>
              {types.map(([t, ex, use]) => (
                <tr key={t}>
                  <td className="whitespace-nowrap"><strong>{t}</strong></td>
                  <td><code>{ex}</code></td>
                  <td>{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul>
          <li>
            <strong>Atomic.</strong> Redis runs commands one at a time on a single main thread (one
            line of work). So <code>INCR counter</code> (add 1 to a number) from a hundred servers at
            the same moment never loses an update. This is what makes shared counters and locks
            possible.
          </li>
          <li>
            <strong>In memory, so size matters.</strong> Your data must fit in RAM. A 1 GB node holds
            roughly a million small cached objects. It cannot hold your whole database.
          </li>
          <li>
            <strong>Not your system of record.</strong> A system of record is the one place that holds
            the true copy of your data. That place is Postgres. Redis can save data to disk, but you
            should plan as if any key can disappear at any time. If you lose the cache, the site
            should become slower, never wrong.
          </li>
        </ul>
        <Callout kind="note" label="Redis or Valkey?">
          <p className="mb-0">
            In 2024 Redis changed its licence. The community then made a copy of the code, called{" "}
            <strong>Valkey</strong>, under the Linux Foundation. Valkey is a drop-in replacement,
            which means you can swap one for the other without changing your code. AWS ElastiCache
            offers both, and Valkey costs less. The commands and the client libraries (such as{" "}
            <code>ioredis</code>) are the same. So everything in this lesson works for both. We use
            Valkey on AWS and say &ldquo;Redis&rdquo; for the commands and the protocol.
          </p>
        </Callout>

        <h2 id="local">Learn it locally in five minutes</h2>
        <p>
          Never learn a new tool on your live system. Run Redis in Docker (Lesson 9) on your own
          computer and try it out:
        </p>
        <CommandList
          title="On your laptop"
          commands={[
            { cmd: "docker run -d --name redis -p 6379:6379 redis:7", note: "A real Redis server in one command (or use the image valkey/valkey:8)" },
            { cmd: "docker exec -it redis redis-cli", note: "Opens the interactive client. You should see the prompt 127.0.0.1:6379>" },
          ]}
        />
        <Script
          title="inside redis-cli — type these"
          code={`SET greeting "hello"            # OK
GET greeting                    # "hello"
SET otp:9876 "482913" EX 60     # a value that deletes itself after 60 seconds
INCR page:views                 # 1, then 2, and so on. Atomic: safe when many servers do it at once
# KEYS *                        # NEVER on a live system: it blocks the server while it scans every key`}
        />
        <p>
          Redis also has hashes (one key that holds several fields, perfect for a session) and sets
          (a group of unique members, like &ldquo;who is online&rdquo;). It also has a safe way to
          look through the keys a few at a time, called <code>SCAN</code>. You will meet these in the
          patterns below. A &ldquo;pattern&rdquo; is a common way to solve a problem.
        </p>

        <h2 id="cache-aside">Pattern 1 — caching (cache-aside)</h2>
        <p>
          This is the most common use. Your code checks Redis first. If the answer is there (a{" "}
          <em>hit</em>), it returns it at once. If not (a <em>miss</em>), it asks the database,
          stores the answer in Redis with a TTL, and returns it. The &ldquo;aside&rdquo; in the name
          means the cache sits beside the database, and your code manages both.
        </p>
        <Script
          title="lib/cache.ts"
          code={`import Redis from "ioredis";

// One shared client. In Next.js, keep it on globalThis so hot reload (the dev server reloading code
// when you save) does not open a new connection on every edit.
const g = globalThis as unknown as { redis?: Redis };
export const redis =
  g.redis ??
  new Redis(process.env.REDIS_URL!, {   // rediss://:TOKEN@host:6379 in production (TLS = an encrypted connection)
    maxRetriesPerRequest: 2,
    connectTimeout: 2000,
    commandTimeout: 500,                // a slow cache is worse than no cache, so give up fast
  });
if (process.env.NODE_ENV !== "production") g.redis = redis;

/** Return the cached value, or compute it, cache it, and return it. */
export async function cached<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
  try {
    const hit = await redis.get(key);
    if (hit !== null) return JSON.parse(hit) as T;
  } catch {
    // Redis is down or slow: FAIL OPEN. This means the site gets slower, but it does not break.
  }

  const value = await load();                       // the slow database query

  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {}
  return value;
}`}
        />
        <Script
          title="using it"
          code={`// A dashboard that runs four heavy queries and is requested thousands of times a minute
export async function getDashboard(tenantId: string) {
  return cached(\`app:v1:tenant:\${tenantId}:dashboard\`, 60, () => buildDashboardFromDatabase(tenantId));
}

// When the data changes, remove the old copy at once
export async function updateSettings(tenantId: string, data: Settings) {
  await db.settings.update(tenantId, data);
  await redis.del(\`app:v1:tenant:\${tenantId}:dashboard\`);   // invalidate (remove the old copy) on write
}`}
        />
        <h3>The four decisions that make or break a cache</h3>
        <ul>
          <li>
            <strong>Key design.</strong> Use a clear, structured name such as{" "}
            <code>app:v1:tenant:&lt;id&gt;:thing</code>. In a multi-tenant app (one app that serves
            many customers), the <em>tenant ID must be in the key</em>. Otherwise one customer can
            receive another customer&apos;s data. That is a serious data leak, not just a bug. The{" "}
            <code>v1</code> lets you throw away all old entries at once. Change it to <code>v2</code>{" "}
            after the data format changes.
          </li>
          <li>
            <strong>TTL.</strong> The TTL is the safety net. Even if you forget to remove a key
            somewhere, old data lives only this long. For data that changes often, use 10 to 60
            seconds. For data that changes slowly, use minutes to hours. Always set one.
          </li>
          <li>
            <strong>Invalidation.</strong> Invalidation means removing or updating a cached copy when
            the real data changes. It is known to be hard. Programmers joke that there are only two
            hard things in computer science: cache invalidation and naming things. Delete or update
            the key in the same code that changes the data. Let the TTL clean up the cases you
            missed.
          </li>
          <li>
            <strong>What to cache.</strong> Cache data that is slow to produce, read often, changes
            rarely and is the same for many users. Examples are dashboards, product lists, settings
            and pieces of rendered pages. Do <em>not</em> cache data that is different for every
            request or very personal.
          </li>
        </ul>
        <Callout kind="warn" label="Cache stampede — the busy-key problem">
          <p className="mb-0">
            A popular key expires. In the next millisecond, 500 requests all miss the cache. All of
            them run the same slow query, and the database fails, exactly when the cache was
            supposed to protect it. This is a stampede. Two cheap defences help. First, add{" "}
            <em>jitter</em>, a small random extra time, to the TTLs (for example{" "}
            <code>ttl + random(0..10%)</code>), so keys do not all expire together. Second, let only
            one request rebuild the value. Use a short lock with <code>SET key NX EX 10</code>. The
            other requests wait, or they use the slightly old copy.
          </p>
        </Callout>

        <h2 id="sessions">Pattern 2 — sessions</h2>
        <p>
          A session is how the app remembers that a user is logged in across requests. There are two
          designs, and each has trade-offs:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Signed cookie / JWT</th>
                <th>Server-side session in Redis</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Where the data lives</strong></td><td>In the cookie itself</td><td>In Redis; the cookie holds only a random session ID</td></tr>
              <tr><td><strong>Extra infrastructure</strong></td><td className="font-semibold text-emerald-300">None</td><td>Redis</td></tr>
              <tr><td><strong>Log out / revoke instantly</strong></td><td className="font-semibold text-red-300">Hard. It stays valid until it expires, unless you keep a block list (which you would store in Redis)</td><td className="font-semibold text-emerald-300">Delete the key: gone</td></tr>
              <tr><td><strong>&ldquo;Log out everywhere&rdquo;, ban a user</strong></td><td>Hard</td><td>Easy</td></tr>
              <tr><td><strong>Size limit</strong></td><td>About 4 KB (the cookie limit)</td><td>Practically none</td></tr>
              <tr><td><strong>Cost per request</strong></td><td>None (the server only checks the signature)</td><td>One Redis read (about 1 ms)</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          A signed cookie or JWT (JSON Web Token) is a cookie that holds the login data itself, with a
          signature so nobody can change it. For a SaaS with admin panels and paying customers, you
          want to cancel a session at once. That is usually worth one extra millisecond.
        </p>
        <p>The whole Redis-session design is three small functions:</p>
        <ul>
          <li>
            <strong>Create</strong>: make 32 random bytes as the session ID, so nobody can guess it.
            Store <code>userId</code> and <code>tenantId</code> under <code>sess:&lt;id&gt;</code>{" "}
            with a 7-day expiry. Set a cookie that holds only that ID. Give the cookie three flags.{" "}
            <code>httpOnly</code> means JavaScript in the page cannot read it. <code>secure</code>{" "}
            means it is sent only over HTTPS. <code>sameSite: lax</code> reduces CSRF risk. CSRF
            (cross-site request forgery) is an attack where another website makes your browser send
            a request that you did not intend.
          </li>
          <li>
            <strong>Read</strong>: look up the key named in the cookie. If it exists, move its expiry
            forward by another 7 days. This keeps active users logged in.
          </li>
          <li>
            <strong>Destroy</strong>: delete the key. The user is logged out on every server at
            once. Also keep a set of each user&apos;s session IDs. Then &ldquo;log out
            everywhere&rdquo; is just one loop over that set.
          </li>
        </ul>
        <Callout kind="warn" label="Sessions are the exception to “fail open”">
          <p className="mb-0">
            If Redis is down and you cannot read sessions, treat everyone as logged out, never as
            logged in. A cache failure should &ldquo;fail open&rdquo;, which means the app keeps
            working without the cache. A login failure should fail <strong>closed</strong>, which
            means the app denies access. This is also why, in production, the session store needs a
            replica (a live copy) and automatic failover (switching to the copy when the main one
            fails). See below.
          </p>
        </Callout>

        <h2 id="rate-limit">Pattern 3 — rate limiting</h2>
        <p>
          Rate limiting means capping how many requests one client can make in a period of time. In
          Lesson 10, Nginx limited each <em>server</em>. With five servers, a client gets five times
          the allowance. A counter in Redis is shared by all servers. You can also base it on the
          user or the API key, not only the IP address:
        </p>
        <Script
          title="lib/rate-limit.ts — fixed window"
          code={`import { redis } from "./cache";

/** Allow \`limit\` calls per \`windowSeconds\` for this identity. Returns true if this call is allowed. */
export async function allow(identity: string, limit: number, windowSeconds: number) {
  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = \`rl:\${identity}:\${window}\`;

  // MULTI runs INCR and EXPIRE together as one unit, so a key is never left without a TTL if the process dies in between
  const [[, count]] = (await redis.multi().incr(key).expire(key, windowSeconds * 2).exec()) as [
    [null, number],
    [null, number],
  ];
  return count <= limit;
}

// in a route handler:
//   if (!(await allow(\`login:\${ip}\`, 5, 60))) return new Response("Too many attempts", { status: 429 });`}
        />
        <p>
          The <em>fixed window</em> is simple, but a client can send a burst at the edge between two
          windows (5 requests at 11:59:59 and 5 more at 12:00:00). If that matters, use a sliding
          window, which is a sorted set of timestamps. Or use a token-bucket library such as{" "}
          <code>rate-limiter-flexible</code>. Also decide what happens when Redis is down. For a
          login limiter, many teams <strong>fail closed</strong> (block the request). For a generous
          API limiter, they <strong>fail open</strong> (allow the request).
        </p>

        <h2 id="more-patterns">Patterns 4–6 — locks, queues, pub/sub</h2>
        <h3>4. A lock so only one server does a job</h3>
        <p>
          A lock is a marker that says &ldquo;I am doing this job, so nobody else should&rdquo;.
        </p>
        <Script
          title="run a job on exactly one server"
          code={`// SET key value NX PX 30000  means "set only if the key does not exist, and expire in 30 s". Atomic. Exactly one caller gets OK.
const got = await redis.set("lock:nightly-report", serverId, "PX", 30_000, "NX");
if (got === "OK") {
  try { await runNightlyReport(); }
  finally { await redis.del("lock:nightly-report"); }   // (release it only if you still own it. In real code use a small Lua script, a short program that Redis runs as one atomic step, to check this)
}`}
        />
        <p>
          This fixes the problem from Lesson 12, where a cron job (a task that runs on a schedule) on
          every server runs N times. If a second run would cause real harm, as with payments, do not
          rely on a lock alone. Also make the operation idempotent. Idempotent means that running it
          twice has the same result as running it once. Locks across many servers are a big topic.
          Treat this lock as a convenience, not a guarantee.
        </p>
        <h3>5. Background job queues</h3>
        <p>
          Some jobs should not make a user wait. Examples are sending email, making PDFs and
          resizing images. The web request puts a job into a queue in Redis and returns at once. A
          queue is a line of jobs that are handled in order. A separate <strong>worker</strong>{" "}
          process takes jobs from the queue and runs them. It can retry a failed job or delay a job.
          In Node the standard tool is <strong>BullMQ</strong>, which is built on Redis lists and
          sorted sets. A worker is just another container from your image (Lesson 9) that runs a
          different command. You can scale workers separately from the web servers.
        </p>
        <Callout kind="warn" label="Queues need durability">
          <p className="mb-0">
            A queue that silently loses jobs when Redis evicts keys is a bug. Give queues their own
            Redis instance with <code>maxmemory-policy noeviction</code> (next section). Also
            consider Amazon SQS instead. SQS is a fully managed queue service that stores jobs safely
            and costs only cents. It cannot run out of memory.
          </p>
        </Callout>
        <h3>6. Pub/sub across servers</h3>
        <p>
          Pub/sub means publish and subscribe. One part sends messages to a named channel, and every
          part that has subscribed to the channel receives them. Here is an example. A WebSocket is
          a connection that stays open so the server and browser can send messages at any time.
          With WebSockets behind a load balancer, user A may be connected to server 1 and user B to
          server 2. When A sends a chat message, server 1 <code>PUBLISH</code>es it on a Redis
          channel. Every server has used <code>SUBSCRIBE</code>, so each one receives the message and
          sends it to its own connected users. The Redis adapter of Socket.IO (a real-time messaging
          library) does exactly this.
        </p>

        <h2 id="eviction">Memory, eviction and durability</h2>
        <p>
          RAM is limited. When Redis reaches its <code>maxmemory</code> setting, the{" "}
          <strong>eviction policy</strong> decides what happens. Eviction means removing keys to make
          room:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Policy</th>
                <th>Behaviour</th>
                <th>Right for</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>allkeys-lru</code></td><td>Delete the least recently used key (LRU), whichever key it is</td><td>A pure cache</td></tr>
              <tr><td><code>volatile-lru</code></td><td>Delete only keys that have a TTL (the ElastiCache default)</td><td>Mixed use, if every cache key has a TTL</td></tr>
              <tr><td><code>noeviction</code></td><td>Refuse new writes with an error when memory is full</td><td>Queues and anything you cannot afford to lose</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="The mistake: one Redis for everything">
          <p className="mb-0">
            Suppose you put the cache, sessions <em>and</em> job queues in one instance with{" "}
            <code>allkeys-lru</code>. A jump in memory use will quietly delete user sessions
            (everyone is logged out) and queued jobs. You have two choices. Use separate instances,
            which are cheap. Or keep one instance, give every cache key a TTL and use{" "}
            <code>volatile-lru</code>, so only keys that expire can be evicted. Sessions have TTLs
            too, so protect them with spare memory and monitoring.
          </p>
        </Callout>
        <p>
          <strong>Durability.</strong> Durability means data survives a failure. ElastiCache Multi-AZ
          with a replica survives the failure of a node. The switch to the replica (the failover)
          usually takes under a minute. But a replica is asynchronous. This means it copies data a
          moment after the main node, so the last writes can be lost. That is acceptable for caches,
          sessions (users just log in again) and rate limits. It is not acceptable for data that
          exists only in Redis. That is why we said you should not have any such data.
        </p>

        <h2 id="elasticache">Run it on AWS: ElastiCache</h2>
        <p>
          <strong>ElastiCache</strong> is Redis or Valkey run by AWS. It is a &ldquo;managed&rdquo;
          service, like RDS. AWS does the patching, replaces failed nodes, monitors it and can add
          replicas. Like the database, it lives in the <strong>private subnets</strong>. Only the
          app&apos;s Security Group can reach it.
        </p>
        <ol className="steps">
          <li>
            <h3>The firewall and the subnet group</h3>
            <p>
              A <strong>Security Group</strong> is a virtual firewall for an AWS resource. It lists which
              network traffic may come in. Create a security group named <code>cache-sg</code> that
              accepts port 6379 <strong>only from <code>web-sg</code></strong>. Then go to ElastiCache, then Subnet
              groups, and create one named <code>myapp-private</code> with the two private subnets.
              This is the same idea as the RDS subnet group in Lesson 8.
            </p>
          </li>
          <li>
            <h3>Create the cluster — with TLS and a password</h3>
            <p>
              Go to ElastiCache and choose Create. Pick <strong>Valkey</strong> (the open-source copy
              of Redis that AWS recommends; same commands). Choose a node-based cluster with cluster
              mode off. Use the <code>myapp-private</code> subnet group and <code>cache-sg</code>.
              These settings matter most:
            </p>
            <ul>
              <li>
                <strong>Replicas: 0</strong> (a single node) is fine for practice and for a small
                cache. For sessions in production, use <strong>1 replica</strong> in another
                Availability Zone (a separate data centre in the same AWS Region), with Multi-AZ (the
                replica lives in a different zone) and automatic failover turned on.
              </li>
              <li>
                <strong>Encryption in transit: on</strong>. This means the traffic between your app
                and Redis is encrypted with TLS, so the URL starts with <code>rediss://</code> (two
                s). Turn it on when you create the cluster. On recent engine versions you can turn it
                on later, but it takes extra steps and a change on every client, so it is easier to
                choose it now.
              </li>
              <li>
                <strong>Access control: AUTH token</strong>. This is a long random password. It must have
                16 to 128 printable characters. Besides letters and digits it may use only{" "}
                <code>! &amp; # $ ^ &lt; &gt; -</code>, so avoid <code>@</code>, <code>/</code>,{" "}
                <code>%</code> and quotes. It adds protection on top of the Security Group. Turn
                encryption at rest on too. (For teams, ElastiCache also supports users and ACLs. An
                ACL is an access control list with permissions for each command.)
              </li>
              <li>
                Node type <code>cache.t4g.micro</code>: about 0.5 GB of memory. That is more than
                enough to start. There is also <strong>ElastiCache Serverless</strong>. It scales by
                itself and bills for what you use. For Valkey its minimum is about $6 a month, so it
                can be cheap for tiny or uneven workloads. A steady, busy cache is often cheaper on a
                fixed node. Compare the prices for your case.
              </li>
            </ul>
          </li>
          <li>
            <h3>Prove it from the server (not your laptop, because it is private)</h3>
            <CommandList
              title="On the EC2 server"
              commands={[
                { cmd: "redis-cli -h <REDIS_HOST> --tls -a \"$REDIS_TOKEN\" ping", note: "You should see PONG (install redis-tools first). If it hangs, check the security group. If the connection resets, you forgot --tls. If you see NOAUTH or WRONGPASS, check the token" },
              ]}
            />
          </li>
        </ol>

        <h2 id="connect">Connect the app safely</h2>
        <p>
          Add the URL to the SSM parameter that your servers read (Lesson 12). Then roll out the new
          setting:
        </p>
        <Script
          title="/myapp/env parameter — add one line"
          code={`REDIS_URL=rediss://:THE-TOKEN@myapp-cache.abc123.aps1.cache.amazonaws.com:6379`}
        />
        <ul>
          <li>
            <strong>One client for each process</strong>, reused (as in <code>lib/cache.ts</code>).
            Opening a new connection for every request wastes time and uses up the server&apos;s
            connection limit.
          </li>
          <li>
            <strong>Short timeouts.</strong> A stuck cache must not make your whole site stuck. Use a
            command timeout of 200 to 500 ms, a short connect timeout and few retries.
          </li>
          <li>
            <strong>Decide fail open or fail closed for each use.</strong> Cache: fail open.
            Sessions and login: fail closed. Rate limit: your choice, but choose on purpose.
          </li>
          <li>
            <strong>Never expose it.</strong> Give it no public IP and no <code>0.0.0.0/0</code> rule.
            Redis is not built to face the open internet, and exposed instances are often attacked
            within minutes. To reach it from your laptop, use an SSH tunnel, as you did for the
            database. An SSH tunnel sends your traffic through an SSH connection to the server.
          </li>
          <li>
            <strong>Do not run <code>FLUSHALL</code> or <code>KEYS *</code> on your live system.</strong>{" "}
            The first deletes every key, including everyone&apos;s sessions. The second blocks the
            server. Use an ACL user for the app that is not allowed to run them.
          </li>
        </ul>

        <h2 id="monitor">What to monitor</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>CloudWatch metric</th>
                <th>Healthy</th>
                <th>Worry when</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>CacheHitRate</code></td><td>Above about 80 to 90% for a cache</td><td>It falls. Causes: TTLs too short, a key design mistake or too little memory</td></tr>
              <tr><td><code>DatabaseMemoryUsagePercentage</code></td><td>Below about 75%</td><td>It nears 100%. Evictions or write errors are coming</td></tr>
              <tr><td><code>Evictions</code></td><td>Near zero</td><td>It rises. The cache is too small, or it is being used as a database</td></tr>
              <tr><td><code>EngineCPUUtilization</code></td><td>Below about 70%</td><td>It is high. Look for slow commands or a key with too much traffic. Redis uses one core for commands</td></tr>
              <tr><td><code>CurrConnections</code></td><td>Steady</td><td>It keeps growing. This is a connection leak (a new client for each request)</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The <strong>hit rate</strong> is the share of requests answered from the cache. It tells you
          whether the cache is worth its cost. A cache with a 20% hit rate costs money and does almost
          nothing.
        </p>

        <h2 id="when-not">When not to use Redis</h2>
        <p>
          Every extra part is something you must secure, monitor, pay for and fix at 3 a.m. Do not add
          Redis only because the diagram looks incomplete:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>You think you need Redis for…</th>
                <th>Try first</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Speeding up a slow page</td><td>Find the slow query. Add an index (a lookup structure that makes searches fast) or fix an N+1 (one query that runs again for every row). A 2-second query is a database problem, not a reason to cache</td></tr>
              <tr><td>Sessions on a single server</td><td>Signed cookie sessions need no extra service</td></tr>
              <tr><td>A job queue with a few jobs a day</td><td>A Postgres table that workers read with <code>FOR UPDATE SKIP LOCKED</code> (it skips rows that another worker has locked), or SQS</td></tr>
              <tr><td>Storing important data quickly</td><td>Postgres. Data that matters should not live only in RAM</td></tr>
              <tr><td>Large files or blobs</td><td>S3 and CloudFront (Lesson 11)</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="Measure, then cache">
          <p className="mb-0">
            The right order is this. First measure, using the slow-query log or Performance Insights
            from Lesson 8. Then fix the query. Then cache what is still slow and popular. If you cache
            a bad query, you hide the problem until the cache is empty (cold).
          </p>
        </Callout>

        <h2 id="cost">What this costs</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Approximate cost per month (Mumbai)</th></tr>
            </thead>
            <tbody>
              <tr><td>cache.t4g.micro (Valkey), single node</td><td>about $10 to $12 (about ₹900)</td></tr>
              <tr><td>cache.t4g.small (about 1.4 GB)</td><td>about $20 to $24</td></tr>
              <tr><td>Adding a replica for failover</td><td>plus the node price again</td></tr>
              <tr><td>Backups (snapshots) within the free allowance</td><td className="font-semibold text-emerald-300">Free up to the cluster size</td></tr>
              <tr><td>Data transfer within the same AZ</td><td className="font-semibold text-emerald-300">Free (traffic between Availability Zones has a small charge)</td></tr>
              <tr><td>Running Redis in Docker on the app server instead</td><td>$0 extra, but there is no failover, and it is lost if the instance dies</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          A single micro node costs roughly a fifth of the load-balancer layer, and it can greatly
          reduce the load on your database. Check the current prices. Valkey costs less than Redis
          OSS.
        </p>

        <h2 id="troubleshooting">Troubleshooting table</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Symptom</th>
                <th>Likely cause</th>
                <th>Fix</th>
              </tr>
            </thead>
            <tbody>
              {trouble.map(([s, c, f]) => (
                <tr key={s}>
                  <td><code>{s}</code></td>
                  <td>{c}</td>
                  <td>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="interview">Interview corner</h2>
        <InterviewQA
          items={[
            {
              q: "Explain the cache-aside pattern and its main risks.",
              a: (
                <p className="mb-0">
                  The app checks the cache first. On a miss, it loads the data from the source of truth
                  (the main database), writes the result to the cache with a TTL, and returns it. There
                  are three main risks. One is stale data, which I handle with invalidation and TTLs.
                  Another is a stampede when a popular key expires, which I handle with jitter and a
                  lock so only one request rebuilds it. The third is wrong or leaked data because of bad
                  key design, for example a key without the tenant or user in it.
                </p>
              ),
            },
            {
              q: "Why is Redis fast, and what are its limits?",
              a: (
                <p className="mb-0">
                  The data is in RAM, the data structures are simple and well tuned, and the main thread
                  runs one command at a time, so there is no cost for locking. The limits are these. The
                  data must fit in memory. One main thread for each shard (one part of the data) limits
                  how much heavy or slow work it can do. And saving to disk is best effort, so it should
                  not be the main store.
                </p>
              ),
            },
            {
              q: "Where should session state live in a horizontally scaled app?",
              a: (
                <p className="mb-0">
                  Not in the memory of one server. There are two good choices. One is to put it in the
                  client as a signed or encrypted token. That needs no server state, but it is hard to
                  cancel. The other is to keep it on the server side in a shared store such as Redis,
                  with a TTL and a random session ID in an httpOnly, secure cookie. That can be cancelled
                  at once. Sticky sessions (always sending a user to the same server) are only a
                  temporary fix.
                </p>
              ),
            },
            {
              q: "How do you implement a distributed rate limiter?",
              a: (
                <p className="mb-0">
                  I use a shared atomic counter in Redis for each user and each time window. I run INCR
                  and EXPIRE together inside MULTI or a Lua script. Or I use a sliding window made with a
                  sorted set. When the limit is passed, I return HTTP 429 (Too Many Requests). For a Redis
                  outage, I choose fail open or fail closed, depending on how risky the endpoint is.
                </p>
              ),
            },
            {
              q: "What happens when Redis runs out of memory?",
              a: (
                <p className="mb-0">
                  It follows the <code>maxmemory-policy</code> setting. It either evicts keys
                  (allkeys-lru or volatile-lru) or rejects writes with an OOM (out of memory) error
                  (noeviction). I choose the policy for each workload. Caches may evict, and queues must
                  not. I do not mix them. I also monitor memory, evictions and the hit rate.
                </p>
              ),
            },
            {
              q: "Why is KEYS * dangerous in production?",
              a: (
                <p className="mb-0">
                  It scans every key in one blocking command. Its cost grows with the number of keys
                  (O(N)), and it runs on the single main thread, so all clients freeze. SCAN is better.
                  It goes through the keys a few at a time, using a cursor (a bookmark for where it
                  stopped).
                </p>
              ),
            },
            {
              q: "Cache or database index — which do you reach for first?",
              a: (
                <p className="mb-0">
                  I diagnose first. If a query is slow because of a missing index or an N+1 problem, I fix
                  that. A cache would only hide the problem and add the work of invalidation. I add a
                  cache after the query is as fast as it can be and is still expensive or very frequent.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 17</h2>
        <ol>
          <li>
            Run Redis in Docker and work through the <code>redis-cli</code> session above. Watch the{" "}
            <code>TTL</code> count down until a key disappears.
          </li>
          <li>
            Use <code>cached()</code> around one real slow query. Log the hits and misses. Measure the
            response time with an empty cache (cold) and a full cache (warm).
          </li>
          <li>
            Add the invalidation call to the code that updates that data. Check that users see the
            change at once.
          </li>
          <li>
            Move sessions to Redis. Log in. Then delete the key in <code>redis-cli</code>. Check that
            the user is logged out on the next request.
          </li>
          <li>
            Add the rate limiter to your login route. Try six wrong passwords in a minute. Look for
            the 429 response.
          </li>
          <li>
            Create the ElastiCache cluster. Reach it from EC2 with <code>redis-cli --tls</code>. Then
            change the app&apos;s <code>REDIS_URL</code> and roll out.
          </li>
          <li>
            Stop Redis (or block the port) and load the site. It must still work, only more slowly. If
            it crashes, fix the fail-open handling.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Add a debug header such as <code>x-cache: hit</code> or <code>x-cache: miss</code> on
            cached routes. Watch <code>CacheHitRate</code> in CloudWatch while you click around, and
            get it above 80%. Then add the lock so that one expiring popular key cannot cause a
            stampede.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          Redis is the shared, very fast whiteboard for a group of disposable servers. It holds cached
          answers, sessions, counters, locks and short queues. It should never hold the only copy of
          anything you would miss.
        </p>
        <ul>
          <li>
            <strong>Cache-aside</strong> with structured keys that include the tenant, a TTL on
            everything, invalidation when data is written, and fail-open behaviour.
          </li>
          <li>
            <strong>Sessions</strong> in Redis can be cancelled at once. They must fail{" "}
            <em>closed</em>, and in production they need a replica.
          </li>
          <li>
            <strong>Shared counters</strong> make rate limits work across all servers.
          </li>
          <li>
            <strong>Match the eviction policy to the job.</strong> Caches evict, queues do not. Do
            not mix them.
          </li>
          <li>
            <strong>Keep it private, with TLS and AUTH.</strong> Add it only when measurements show
            that you need it.
          </li>
        </ul>
        <p>
          The system now has all its features. But how do you know it is healthy right now? How will
          you find out at 3 a.m. that it is not? That is monitoring.
        </p>

        <hr />
        <p>
          End of Lesson 16. Next: <strong>Lesson 17 — Monitoring and Logging with
          CloudWatch</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
