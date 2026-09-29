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
  ["String", "SET user:1:name \"Asha\"", "Cached values, counters, flags, tokens"],
  ["Hash", "HSET session:abc user 42 role admin", "A small object with fields: a session, a profile"],
  ["List", "LPUSH jobs \"send-email\"", "Simple queues, recent-activity feeds"],
  ["Set", "SADD online:tenant7 42", "Unique items: who is online, tags"],
  ["Sorted set", "ZADD leaderboard 980 \"asha\"", "Rankings, delayed jobs, sliding-window rate limits"],
  ["Stream", "XADD events * type signup", "Durable event log with consumer groups"],
];

const trouble: [string, string, string][] = [
  ["Connection hangs, then times out", "cache-sg does not allow 6379 from web-sg, or the client is in the wrong subnet/VPC", "Lesson 6 checklist; test with nc -vz <endpoint> 6379 from the server"],
  ["ECONNRESET or “Connection closed” immediately", "The cluster requires TLS but the client connects in plain text (or the reverse)", "Use tls: {} in ioredis / rediss:// in the URL"],
  ["NOAUTH Authentication required / WRONGPASS", "Missing or wrong AUTH token/user", "Pass the token as password; check for stray whitespace or shell-escaped characters"],
  ["OOM command not allowed when used memory > 'maxmemory'", "Memory is full and the policy is noeviction", "Add memory, set TTLs on keys, or choose an eviction policy — and stop mixing cache with critical data"],
  ["Cache hit rate is low", "TTL too short, keys include something unique per request, or the working set exceeds memory", "Check key design; raise TTL; look at Evictions"],
  ["Users see stale data", "Missing invalidation on write, or TTL too long", "Delete/update the key when data changes; shorten TTL for volatile data"],
  ["Latency spikes", "Slow commands (KEYS, big lists), huge values, or a saturated single CPU thread", "Use SCAN, keep values small, look at EngineCPUUtilization, split hot keys"],
  ["Site goes down when Redis does", "The app treats Redis as required for every request", "Fail open for caches (fall back to the DB), and set short command timeouts"],
];

export default function LessonSixteenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>Redis</strong> is a database that lives in <strong>memory (RAM)</strong> instead of
          on disk, storing simple values under names (<em>keys</em>). Reading or writing one takes well
          under a millisecond, roughly a hundred times faster than a typical PostgreSQL query, and one
          modest server handles tens of thousands of operations per second.
        </p>
        <Callout kind="note" label="The analogy — the whiteboard next to the filing cabinet">
          <p className="mb-0">
            Postgres is the filing cabinet: everything is stored safely and permanently, but fetching
            a folder takes a walk. Redis is the whiteboard on the wall: whatever you need constantly
            is written there where everyone can read it in a glance. It is small, and if the power
            goes out you may lose it — so you never keep the only copy of anything important on the
            whiteboard.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why your app needs one</h2>
        <p>
          After Lessons 8 and 12 you have many servers and one database. Three problems show up as
          you grow:
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
                <td>Every page runs the same queries; the DB has a connection cap (Lesson 8)</td>
                <td>Cache the results in memory; the DB is asked once, not 10,000 times</td>
              </tr>
              <tr>
                <td><strong>Sessions vanish between servers</strong></td>
                <td>A login on server A is unknown to server B (Lesson 12)</td>
                <td>One shared session store that every server reads</td>
              </tr>
              <tr>
                <td><strong>Limits that must be global</strong></td>
                <td>&ldquo;5 login attempts per minute&rdquo; is meaningless if each server counts separately</td>
                <td>A shared counter with an expiry</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Redis is often called the &ldquo;shared memory of a fleet of stateless servers&rdquo;. It is
          the last piece that lets the web tier stay truly disposable.
        </p>

        <h2 id="what">What Redis actually is</h2>
        <p>
          A key-value store with <strong>rich value types</strong>, not just strings. Each type comes
          with atomic operations, and every key can carry an expiry (<strong>TTL</strong>) after which
          it is deleted automatically — the feature that makes caches and sessions easy.
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
            <strong>Atomic.</strong> Redis executes commands one at a time on a single main thread, so{" "}
            <code>INCR counter</code> from a hundred servers at once never loses an update. This is what
            makes shared counters and locks possible.
          </li>
          <li>
            <strong>In memory, so size matters.</strong> Your data must fit in RAM. A 1 GB node holds
            roughly a million small cached objects, not your whole database.
          </li>
          <li>
            <strong>Not your system of record.</strong> It can persist to disk, but you should design
            as if any key can vanish at any time. Losing the cache should make the site slower, never
            wrong.
          </li>
        </ul>
        <Callout kind="note" label="Redis or Valkey?">
          <p className="mb-0">
            In 2024 Redis changed its licence and the community forked it as <strong>Valkey</strong>,
            a drop-in replacement under the Linux Foundation. AWS ElastiCache offers both, with Valkey
            priced lower. Same commands, same client libraries (<code>ioredis</code>,{" "}
            <code>redis-cli</code>), so everything in this lesson works for either. We will use Valkey
            on AWS and say &ldquo;Redis&rdquo; for the protocol.
          </p>
        </Callout>

        <h2 id="local">Learn it locally in five minutes</h2>
        <p>
          Never learn a new tool on production. Run one in Docker (Lesson 9) and poke it:
        </p>
        <CommandList
          title="On your laptop"
          commands={[
            { cmd: "docker run -d --name redis -p 6379:6379 redis:7", note: "A real Redis in one command (or valkey/valkey:8)" },
            { cmd: "docker exec -it redis redis-cli", note: "Opens the interactive client. You should see 127.0.0.1:6379>" },
          ]}
        />
        <Script
          title="inside redis-cli — type these"
          code={`SET greeting "hello"            # OK
GET greeting                    # "hello"

SET otp:9876 "482913" EX 60     # value that deletes itself after 60 seconds
TTL otp:9876                    # 58   (seconds left; -2 means it is already gone)

INCR page:views                 # 1
INCR page:views                 # 2   (atomic: safe from many servers at once)

HSET session:abc user 42 role admin
HGETALL session:abc             # user / 42 / role / admin
EXPIRE session:abc 1800         # half an hour

SADD online:tenant7 42 43 42    # 2   (sets keep unique members only)
SMEMBERS online:tenant7

SCAN 0 MATCH "session:*" COUNT 100   # the SAFE way to look through keys
# KEYS *                              # NEVER in production: blocks the server while it scans everything`}
        />

        <h2 id="cache-aside">Pattern 1 — caching (cache-aside)</h2>
        <p>
          The most common use. Your code checks Redis first; on a <em>hit</em> it returns instantly; on
          a <em>miss</em> it asks the database, stores the answer with a TTL, and returns it.
        </p>
        <Script
          title="lib/cache.ts"
          code={`import Redis from "ioredis";

// One shared client. In Next.js, keep it on globalThis so hot reload does not open a new connection every edit.
const g = globalThis as unknown as { redis?: Redis };
export const redis =
  g.redis ??
  new Redis(process.env.REDIS_URL!, {   // rediss://:TOKEN@host:6379 in production (TLS)
    maxRetriesPerRequest: 2,
    connectTimeout: 2000,
    commandTimeout: 500,                // a slow cache is worse than no cache: give up fast
  });
if (process.env.NODE_ENV !== "production") g.redis = redis;

/** Return the cached value, or compute it, cache it, and return it. */
export async function cached<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
  try {
    const hit = await redis.get(key);
    if (hit !== null) return JSON.parse(hit) as T;
  } catch {
    // Redis is down or slow: FAIL OPEN. The site gets slower, not broken.
  }

  const value = await load();                       // the expensive database query

  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {}
  return value;
}`}
        />
        <Script
          title="using it"
          code={`// A dashboard that runs four heavy queries, requested thousands of times a minute
export async function getDashboard(tenantId: string) {
  return cached(\`app:v1:tenant:\${tenantId}:dashboard\`, 60, () => buildDashboardFromDatabase(tenantId));
}

// When the underlying data changes, remove the stale copy immediately
export async function updateSettings(tenantId: string, data: Settings) {
  await db.settings.update(tenantId, data);
  await redis.del(\`app:v1:tenant:\${tenantId}:dashboard\`);   // invalidate on write
}`}
        />
        <h3>The four decisions that make or break a cache</h3>
        <ul>
          <li>
            <strong>Key design.</strong> Use a structured name: <code>app:v1:tenant:&lt;id&gt;:thing</code>.
            The <em>tenant ID must be in the key</em> for multi-tenant apps, or one customer will be
            served another customer&apos;s data — a serious data leak, not a bug. The{" "}
            <code>v1</code> lets you invalidate everything by bumping the version after a schema
            change.
          </li>
          <li>
            <strong>TTL.</strong> The safety net. Even if you forget to invalidate somewhere, stale
            data lives at most this long. Volatile data: 10–60 seconds. Slowly changing data: minutes to
            hours. Always set one.
          </li>
          <li>
            <strong>Invalidation.</strong> The old joke: there are only two hard things in computer
            science — cache invalidation and naming things. Delete or update the key in the same code
            path that changes the data, and let the TTL clean up the cases you missed.
          </li>
          <li>
            <strong>What to cache.</strong> Expensive, read-often, change-rarely, and the same for many
            users: dashboards, product lists, configuration, rendered fragments. <em>Not</em>{" "}
            per-request or highly personal data.
          </li>
        </ul>
        <Callout kind="warn" label="Cache stampede — the busy-key problem">
          <p className="mb-0">
            A popular key expires; in the next millisecond 500 requests all miss and all run the same
            expensive query, and the database falls over — exactly when it was being protected. Two
            cheap defences: add <em>jitter</em> to TTLs (<code>ttl + random(0..10%)</code>) so keys
            do not all expire together, and let only one request rebuild the value (a short lock with{" "}
            <code>SET key NX EX 10</code>) while others wait or serve the slightly stale copy.
          </p>
        </Callout>

        <h2 id="sessions">Pattern 2 — sessions</h2>
        <p>
          A login has to be remembered across requests. Two designs, with real trade-offs:
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
              <tr><td><strong>Log out / revoke instantly</strong></td><td className="font-semibold text-red-300">Hard (valid until it expires, unless you keep a deny-list — in Redis)</td><td className="font-semibold text-emerald-300">Delete the key: gone</td></tr>
              <tr><td><strong>&ldquo;Log out everywhere&rdquo;, ban a user</strong></td><td>Hard</td><td>Easy</td></tr>
              <tr><td><strong>Size limit</strong></td><td>~4 KB cookie</td><td>Practically none</td></tr>
              <tr><td><strong>Cost per request</strong></td><td>None (just verify signature)</td><td>One Redis read (~1 ms)</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          For a SaaS with admin panels and paid customers, being able to revoke a session immediately
          is usually worth one millisecond. A minimal implementation:
        </p>
        <Script
          title="lib/session.ts"
          code={`import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redis } from "./cache";

const TTL = 60 * 60 * 24 * 7; // 7 days, sliding

export async function createSession(userId: string, tenantId: string) {
  const id = randomBytes(32).toString("hex");            // unguessable: 256 bits
  await redis.multi()
    .hset(\`sess:\${id}\`, { userId, tenantId })
    .expire(\`sess:\${id}\`, TTL)
    .sadd(\`user-sessions:\${userId}\`, id)                // so we can "log out everywhere"
    .exec();

  (await cookies()).set("sid", id, {
    httpOnly: true,        // JavaScript cannot read it (blunts XSS)
    secure: true,          // HTTPS only
    sameSite: "lax",       // blunts CSRF
    maxAge: TTL,
    path: "/",
  });
}

export async function getSession() {
  const id = (await cookies()).get("sid")?.value;
  if (!id) return null;
  const data = await redis.hgetall(\`sess:\${id}\`);
  if (!data.userId) return null;
  await redis.expire(\`sess:\${id}\`, TTL);              // sliding expiry: active users stay logged in
  return data as { userId: string; tenantId: string };
}

export async function destroySession() {
  const id = (await cookies()).get("sid")?.value;
  if (id) await redis.del(\`sess:\${id}\`);
}`}
        />
        <Callout kind="warn" label="Sessions are the exception to “fail open”">
          <p className="mb-0">
            If Redis is down and you cannot read sessions, you must treat everyone as logged out, not
            as logged in. Cache failures fail open; authentication failures fail{" "}
            <strong>closed</strong>. That is also why the session store needs a replica and automatic
            failover in production (below).
          </p>
        </Callout>

        <h2 id="rate-limit">Pattern 3 — rate limiting</h2>
        <p>
          In Lesson 10, Nginx limited each <em>server</em>. With five servers, a client gets five
          times the allowance. A counter in Redis is shared by all of them, and you can key it by
          user or API key, not just IP:
        </p>
        <Script
          title="lib/rate-limit.ts — fixed window"
          code={`import { redis } from "./cache";

/** Allow \`limit\` calls per \`windowSeconds\` for this identity. Returns whether this call is allowed. */
export async function allow(identity: string, limit: number, windowSeconds: number) {
  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = \`rl:\${identity}:\${window}\`;

  // MULTI makes INCR and EXPIRE one unit: no key can be left without a TTL if the process dies between them
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
          The <em>fixed window</em> is simple but lets a client burst at a window boundary (5 at
          11:59:59 and 5 at 12:00:00). Where that matters, use a sliding window (a sorted set of
          timestamps) or the token-bucket libraries such as <code>rate-limiter-flexible</code>. And decide
          what happens when Redis is down: for a login limiter many teams <strong>fail closed</strong>{" "}
          (block), for a generous API limiter <strong>fail open</strong> (allow).
        </p>

        <h2 id="more-patterns">Patterns 4–6 — locks, queues, pub/sub</h2>
        <h3>4. A lock so only one server does a job</h3>
        <Script
          title="run a job on exactly one server"
          code={`// SET key value NX PX 30000  → "set only if not exists, expire in 30 s". Atomic. Returns OK for exactly one caller.
const got = await redis.set("lock:nightly-report", serverId, "PX", 30_000, "NX");
if (got === "OK") {
  try { await runNightlyReport(); }
  finally { await redis.del("lock:nightly-report"); }   // (release only if you still own it — use a Lua check in real code)
}`}
        />
        <p>
          This is the fix from Lesson 12&apos;s &ldquo;cron in every server runs N times&rdquo;. For
          anything where a duplicate run causes real harm (payments), do not rely on a lock alone; make
          the operation idempotent too. Locks in a distributed system are a large topic — treat this as a
          convenience, not a guarantee.
        </p>
        <h3>5. Background job queues</h3>
        <p>
          Sending email, generating PDFs, resizing images: things a user should not wait for. The web
          request pushes a job into Redis and returns; a separate <strong>worker</strong> process pulls
          and runs it, with retries and delays. In Node the standard tool is <strong>BullMQ</strong>,
          built on Redis lists and sorted sets. Workers are just another container from your image
          (Lesson 9) running a different command, scaled separately from the web tier.
        </p>
        <Callout kind="warn" label="Queues need durability">
          <p className="mb-0">
            A queue that silently drops jobs on eviction is a bug. Give queues their own Redis instance
            with <code>maxmemory-policy noeviction</code> (next section), and consider Amazon SQS
            instead: it is a fully managed, durable queue that costs cents and cannot run out of
            memory.
          </p>
        </Callout>
        <h3>6. Pub/sub across servers</h3>
        <p>
          With WebSockets behind a load balancer, user A may be connected to server 1 and user B to
          server 2. When A sends a chat message, server 1 <code>PUBLISH</code>es it on a Redis channel;
          every server <code>SUBSCRIBE</code>s and forwards it to its own connected users. Socket.IO&apos;s
          Redis adapter is exactly this.
        </p>

        <h2 id="eviction">Memory, eviction and durability</h2>
        <p>
          RAM is finite. When Redis reaches its <code>maxmemory</code>, the <strong>eviction
          policy</strong> decides what happens:
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
              <tr><td><code>allkeys-lru</code></td><td>Delete the least-recently-used key, any key</td><td>A pure cache</td></tr>
              <tr><td><code>volatile-lru</code></td><td>Evict only keys that have a TTL (ElastiCache&apos;s default)</td><td>Mixed use, provided every cache key has a TTL</td></tr>
              <tr><td><code>noeviction</code></td><td>Refuse writes with an error when full</td><td>Queues and anything you cannot lose</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="The mistake: one Redis for everything">
          <p className="mb-0">
            Put cache, sessions <em>and</em> job queues in one instance with <code>allkeys-lru</code>{" "}
            and a memory spike will silently evict user sessions (everyone logged out) and queued
            jobs. Either use separate instances (they are cheap) or keep one and give every cache key a
            TTL under <code>volatile-lru</code>, so only expiring keys are candidates for eviction.
            Sessions always have TTLs too, so protect them with headroom and monitoring.
          </p>
        </Callout>
        <p>
          <strong>Durability.</strong> ElastiCache Multi-AZ with a replica survives a node failure with
          seconds of failover, but a replica is asynchronous: the last writes can be lost. That is
          acceptable for caches, sessions (re-login) and rate limits. It is not acceptable for data
          that only exists in Redis — which is why we said not to have any.
        </p>

        <h2 id="elasticache">Run it on AWS: ElastiCache</h2>
        <p>
          <strong>ElastiCache</strong> is Redis/Valkey run by AWS, the same &ldquo;managed&rdquo; deal
          as RDS: patching, replacement of failed nodes, monitoring, optional replicas. Like the
          database, it lives in the <strong>private subnets</strong>, and only the app&apos;s Security
          Group may reach it.
        </p>
        <ol className="steps">
          <li>
            <h3>The firewall and the subnet group</h3>
            <Script
              title="1 · network"
              code={`source ~/myapp-network.env

CACHE_SG=$(aws ec2 create-security-group --group-name cache-sg --description "Redis" \\
  --vpc-id $VPC_ID --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $CACHE_SG --protocol tcp --port 6379 --source-group $WEB_SG

aws elasticache create-cache-subnet-group \\
  --cache-subnet-group-name myapp-private \\
  --cache-subnet-group-description "Private subnets for the cache" \\
  --subnet-ids $PRV_A $PRV_B`}
            />
          </li>
          <li>
            <h3>Create the cluster — with TLS and a password</h3>
            <Script
              title="2 · replication group"
              code={`REDIS_TOKEN=$(openssl rand -base64 32 | tr -d '/+=@:' | cut -c1-32)   # 16–128 chars, no @ / " or spaces
echo "REDIS_TOKEN=$REDIS_TOKEN" >> ~/myapp-secrets.env

aws elasticache create-replication-group \\
  --replication-group-id myapp-cache \\
  --replication-group-description "myapp cache and sessions" \\
  --engine valkey \\
  --cache-node-type cache.t4g.micro \\
  --num-cache-clusters 1 \\
  --cache-subnet-group-name myapp-private \\
  --security-group-ids $CACHE_SG \\
  --transit-encryption-enabled \\
  --at-rest-encryption-enabled \\
  --auth-token "$REDIS_TOKEN"

aws elasticache wait replication-group-available --replication-group-id myapp-cache

REDIS_HOST=$(aws elasticache describe-replication-groups --replication-group-id myapp-cache \\
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Address' --output text)
echo $REDIS_HOST`}
            />
            <ul>
              <li>
                <code>--num-cache-clusters 1</code> is a single node: fine for practice and a small
                cache. For production sessions use <strong>2</strong> (a primary and a replica in
                another AZ) with <code>--automatic-failover-enabled --multi-az-enabled</code>.
              </li>
              <li>
                <code>--transit-encryption-enabled</code>: traffic is TLS, so the URL scheme is{" "}
                <code>rediss://</code> (two s). It is off by default and cannot be enabled later
                without recreating the cluster, so decide now.
              </li>
              <li>
                <code>--auth-token</code>: a password, on top of the Security Group. (For teams,
                ElastiCache also supports users and ACLs with per-command permissions.)
              </li>
              <li>
                <code>cache.t4g.micro</code>: about 0.5 GB usable. More than enough to start. There is
                also <strong>ElastiCache Serverless</strong>, which scales for you and bills per usage;
                its minimum charge makes it costlier than a micro node for small workloads.
              </li>
            </ul>
          </li>
          <li>
            <h3>Prove it from the server (not your laptop — it is private)</h3>
            <CommandList
              title="On the EC2 server"
              commands={[
                { cmd: "sudo apt install -y redis-tools", note: "Installs redis-cli and friends" },
                { cmd: "nc -vz <REDIS_HOST> 6379", note: "Network check first: “succeeded” means the Security Groups are right" },
                { cmd: "redis-cli -h <REDIS_HOST> --tls -a \"$REDIS_TOKEN\" ping", note: "PONG. If it hangs: security group. If it resets: missing --tls. If NOAUTH/WRONGPASS: the token" },
                { cmd: "redis-cli -h <REDIS_HOST> --tls -a \"$REDIS_TOKEN\" info memory | head", note: "Memory used and the configured maximum" },
              ]}
            />
          </li>
        </ol>

        <h2 id="connect">Connect the app safely</h2>
        <p>
          Add the URL to the SSM parameter your servers read (Lesson 12), and roll out:
        </p>
        <Script
          title="/myapp/env parameter — add one line"
          code={`REDIS_URL=rediss://:THE-TOKEN@myapp-cache.abc123.aps1.cache.amazonaws.com:6379`}
        />
        <ul>
          <li>
            <strong>One client per process</strong>, reused (as in <code>lib/cache.ts</code>). Opening a
            connection per request wastes time and exhausts the server&apos;s connection limit.
          </li>
          <li>
            <strong>Short timeouts.</strong> A hung cache must not hang your site: 200–500 ms command
            timeout, fast connect timeout, few retries.
          </li>
          <li>
            <strong>Decide fail-open vs fail-closed per use</strong>: cache → open, sessions/auth →
            closed, rate limit → your call, but choose deliberately.
          </li>
          <li>
            <strong>Never expose it.</strong> No public IP, no <code>0.0.0.0/0</code>. Redis has no
            defence against the open internet; exposed instances are compromised within minutes. Reach
            it from your laptop through an SSH tunnel, like the database.
          </li>
          <li>
            <strong>Do not run <code>FLUSHALL</code> or <code>KEYS *</code> on production.</strong> The
            first deletes everyone&apos;s sessions; the second blocks the server. Restrict them with an
            ACL user for the app.
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
              <tr><td><code>CacheHitRate</code></td><td>Above ~80–90% for a cache</td><td>It falls: TTLs too short, key design flaw or memory pressure</td></tr>
              <tr><td><code>DatabaseMemoryUsagePercentage</code></td><td>Below ~75%</td><td>Approaching 100%: evictions or write errors ahead</td></tr>
              <tr><td><code>Evictions</code></td><td>Near zero</td><td>Rising: the cache is too small (or is being used as a database)</td></tr>
              <tr><td><code>EngineCPUUtilization</code></td><td>Below ~70%</td><td>High: slow commands, hot key. Redis uses one core for commands</td></tr>
              <tr><td><code>CurrConnections</code></td><td>Steady</td><td>Growing without bound: a connection leak (client per request)</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The <strong>hit rate</strong> is the number that tells you whether the cache is earning its
          keep. A cache with a 20% hit rate is a slow, expensive way to do nothing.
        </p>

        <h2 id="when-not">When not to use Redis</h2>
        <p>
          Every extra component is something to secure, monitor, pay for and debug at 3 a.m. Do not add
          it because the diagram looks incomplete:
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
              <tr><td>Speeding up a slow page</td><td>Find the slow query: add an index, fix an N+1. A 2-second query is a database bug, not a caching opportunity</td></tr>
              <tr><td>Sessions on a single server</td><td>Signed cookie sessions need no infrastructure</td></tr>
              <tr><td>A job queue with a few jobs a day</td><td>A Postgres table with <code>FOR UPDATE SKIP LOCKED</code>, or SQS</td></tr>
              <tr><td>Storing important data quickly</td><td>Postgres. If the data matters, it does not belong only in RAM</td></tr>
              <tr><td>Large files or blobs</td><td>S3 and CloudFront (Lesson 11)</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="ok" label="Measure, then cache">
          <p className="mb-0">
            The mature order of operations: measure (slow-query log, Performance Insights from Lesson
            8), fix the query, then cache what is still slow and popular. Caching a bad query hides the
            problem until the cache is cold.
          </p>
        </Callout>

        <h2 id="cost">What this costs</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Approx. per month (Mumbai)</th></tr>
            </thead>
            <tbody>
              <tr><td>cache.t4g.micro (Valkey), single node</td><td>~$10–12 (~₹900)</td></tr>
              <tr><td>cache.t4g.small (about 1.4 GB)</td><td>~$20–24</td></tr>
              <tr><td>Adding a replica for failover</td><td>+ the node price again</td></tr>
              <tr><td>Backups (snapshots) within the free allowance</td><td className="font-semibold text-emerald-300">Free up to the cluster size</td></tr>
              <tr><td>Data transfer within the same AZ</td><td className="font-semibold text-emerald-300">Free (cross-AZ has a small charge)</td></tr>
              <tr><td>Running Redis in Docker on the app server instead</td><td>$0 extra, but no failover and it dies with the instance</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          A single micro node is roughly a fifth of the cost of the load-balancer tier and buys a large
          reduction in database load. Confirm current prices; Valkey is priced below Redis OSS.
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
                  The app checks the cache; on a miss it loads from the source of truth, writes the
                  result to the cache with a TTL, and returns it. Risks: stale data (needs invalidation
                  and TTLs), stampedes when a hot key expires (jitter, single-flight locks), and
                  cache-poisoning or leaks through bad key design (missing tenant/user in the key).
                </p>
              ),
            },
            {
              q: "Why is Redis fast, and what are its limits?",
              a: (
                <p className="mb-0">
                  Data is in RAM, structures are simple and optimised, and a single-threaded event loop
                  avoids locking overhead. Limits: data must fit in memory, one main thread per shard
                  bounds CPU-heavy or slow commands, and persistence is best-effort, so it is not a
                  primary store.
                </p>
              ),
            },
            {
              q: "Where should session state live in a horizontally scaled app?",
              a: (
                <p className="mb-0">
                  Not in server memory. Either in the client as a signed/encrypted token (stateless, hard
                  to revoke) or server-side in a shared store like Redis with a TTL and a random session
                  ID in an httpOnly, secure cookie (instantly revocable). Sticky sessions are only a
                  stopgap.
                </p>
              ),
            },
            {
              q: "How do you implement a distributed rate limiter?",
              a: (
                <p className="mb-0">
                  A shared atomic counter per identity and time window in Redis (INCR with EXPIRE inside
                  MULTI or a Lua script), or a sliding window using a sorted set. Return 429 when the
                  limit is exceeded; choose fail-open or fail-closed for Redis outages depending on the
                  endpoint&apos;s risk.
                </p>
              ),
            },
            {
              q: "What happens when Redis runs out of memory?",
              a: (
                <p className="mb-0">
                  It follows <code>maxmemory-policy</code>: evict keys (allkeys-lru, volatile-lru) or
                  reject writes with an OOM error (noeviction). Choose per workload — caches evict,
                  queues do not — and do not mix them; monitor memory, evictions and hit rate.
                </p>
              ),
            },
            {
              q: "Why is KEYS * dangerous in production?",
              a: (
                <p className="mb-0">
                  It scans the whole keyspace in one blocking O(N) command on the single main thread,
                  freezing all clients. Use SCAN, which iterates incrementally with a cursor.
                </p>
              ),
            },
            {
              q: "Cache or database index — which do you reach for first?",
              a: (
                <p className="mb-0">
                  Diagnose first. If a query is slow because of a missing index or N+1, fix that; a cache
                  in front only masks it and adds invalidation complexity. Cache after the query is as
                  efficient as it can be and still expensive or very frequent.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 17</h2>
        <ol>
          <li>
            Run Redis in Docker and work through the <code>redis-cli</code> session above. Watch{" "}
            <code>TTL</code> count down and a key vanish.
          </li>
          <li>
            Implement <code>cached()</code> around one real expensive query. Log hits and misses and
            measure the response time cold and warm.
          </li>
          <li>
            Add the invalidation call to the code path that updates that data, and prove users see the
            change immediately.
          </li>
          <li>
            Move sessions to Redis. Log in, then delete the key in <code>redis-cli</code> and confirm the
            user is logged out on the next request.
          </li>
          <li>
            Add the rate limiter to your login route and try six wrong passwords in a minute; observe
            the 429.
          </li>
          <li>
            Create the ElastiCache cluster, reach it from EC2 with <code>redis-cli --tls</code>, then
            switch the app&apos;s <code>REDIS_URL</code> and roll out.
          </li>
          <li>
            Stop Redis (or block the port) and load the site. It must still work for cached pages, just
            slower. If it crashes, fix the fail-open handling.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Add a <code>Cache-Status</code>-style debug header (<code>x-cache: hit|miss</code>) on cached
            routes, watch <code>CacheHitRate</code> in CloudWatch while you click around, and get it above
            80%. Then implement the single-flight lock so a hot key expiring cannot stampede.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          Redis is the shared, ultra-fast whiteboard for a fleet of disposable servers: cached
          answers, sessions, counters, locks and short queues — never the only copy of anything you
          would miss.
        </p>
        <ul>
          <li>
            <strong>Cache-aside</strong> with structured, tenant-scoped keys, a TTL on everything,
            invalidation on write, and fail-open behaviour.
          </li>
          <li>
            <strong>Sessions</strong> in Redis give instant revocation; they must fail{" "}
            <em>closed</em> and be replicated in production.
          </li>
          <li>
            <strong>Shared counters</strong> make rate limits real across all servers.
          </li>
          <li>
            <strong>Match eviction to the job</strong>: caches evict, queues do not; do not mix them.
          </li>
          <li>
            <strong>Private, TLS, AUTH</strong>, and only added when measurement says you need it.
          </li>
        </ul>
        <p>
          The system is now feature-complete. But how do you know it is healthy right now, and how
          will you find out at 3 a.m. that it is not? That is monitoring.
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
