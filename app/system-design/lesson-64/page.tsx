import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-64")!;

export const metadata: Metadata = {
  title: `Lesson 64 — ${lesson.title}`,
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

const code1 = `POST /v1/posts                  { text, mediaIds[] }     → 201 { postId }
POST /v1/users/{id}/follow                                → 204
GET  /v1/feed?cursor=…&limit=20                           → 200
     { "items": [ { post, author, likeCount, commentCount, likedByMe } … ],
       "nextCursor": "…" }`;

const code2 = `users:        user_id, name, avatar_url, follower_count, is_celebrity (derived flag)
posts:        post_id (Snowflake: time-ordered), author_id, text, media_refs, created_at
              → stored in a sharded DB / wide-column store, sharded by post_id or author_id
follows:      (follower_id, followee_id, created_at)
              → two access patterns: "who do I follow?" and "who follows X?"
              → often stored twice (by follower and by followee) = denormalised (post 23)
feed_cache:   user_id → sorted list of (post_id, score/timestamp)   [Redis sorted set / list]
counters:     post_id → like_count, comment_count                    [Redis + async DB]
likes:        (post_id, user_id) → exists                            [for "likedByMe"]`;

const code3 = `Asha posts (200 followers) → 200 × ZADD feed:{follower} <timestamp> <post_id>`;

const code4 = `Me → follow 300 accounts → fetch latest posts per account (from per-author timelines) → merge → top 20`;

export default function SdLessonSixFourPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Open Instagram, X (Twitter), LinkedIn or Facebook, and within a second you see a{" "}
            <strong>personalised feed</strong>. A feed is a list of posts from the people you follow. The newest (or most
            relevant) posts come first. Each post has photos, like counts and comments. The list keeps loading as you
            scroll.
          </p>
          <p>Behind that simple screen is one of the hardest problems in system design:</p>
          <ul>
            <li>
              <strong>Hundreds of millions of users</strong>, each following hundreds of accounts.
            </li>
            <li>
              Some accounts have <strong>tens of millions of followers</strong>.
            </li>
            <li>
              Every feed is <strong>different</strong>, and must load in <strong>well under a second</strong>.
            </li>
            <li>
              New posts should appear <strong>quickly</strong> (seconds, not hours).
            </li>
          </ul>
          <p>
            The simple approach is: find everyone I follow, get all their recent posts, sort them, and show the top 20.
            This works for 1,000 users. At 100 million users, it fails. This case study is about the main trade-off
            (a choice where you gain one thing and lose another) in feed design:{" "}
            <strong>do the work when someone posts, or when someone reads?</strong>
            Doing work when someone posts is called <strong>fan-out on write</strong>. Fan-out means copying one post
            out to many followers. Doing the work when someone reads is called <strong>fan-out on read</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Imagine a <strong>newspaper delivery service</strong> in a big city.
          </p>
          <p>
            <strong>Option 1: deliver to every doorstep (fan-out on write, also called push).</strong> Push means the
            system sends the work out ahead of time. When a newspaper is printed, delivery staff put a copy in{" "}
            <strong>every subscriber's letterbox</strong>. Reading is instant: you open the letterbox. But if a
            newspaper has <strong>50 million subscribers</strong>, printing one edition means{" "}
            <strong>50 million deliveries</strong>.
          </p>
          <p>
            <strong>Option 2: everyone collects from the newsstand (fan-out on read, also called pull).</strong> Pull
            means the reader fetches the data when they need it. Newspapers stay at the <strong>newsstand</strong>. Each
            reader goes and <strong>collects</strong> the papers they subscribe to, and puts them together. Printing is
            cheap. But every reader does more work, and a reader who subscribes to 500 papers has a long, slow trip.
          </p>
          <p>
            <strong>Option 3: the hybrid.</strong> A hybrid mixes both options. Deliver <strong>local newspapers</strong>{" "}
            (normal accounts) to doorsteps. For the <strong>huge national papers</strong> (celebrities), readers pick
            them up from the newsstand and <strong>combine</strong> them with what is in their letterbox.
          </p>
          <p>
            Real feeds use the <strong>hybrid</strong>.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="step-1-requirements">Step 1: Requirements</h3>
          <p>
            <strong>Functional:</strong>
          </p>
          <ol>
            <li>
              Users can <strong>publish posts</strong> (text, images, video).
            </li>
            <li>
              Users can <strong>follow</strong> other users.
            </li>
            <li>
              Users see a <strong>home feed</strong> of posts from accounts they follow, <strong>paginated</strong> with
              infinite scroll.
            </li>
            <li>
              The feed order is <strong>reverse-chronological</strong>, or <strong>ranked</strong> by relevance.
            </li>
            <li>
              Show <strong>like and comment counts</strong> and whether <em>I</em> liked each post.
            </li>
          </ol>
          <p>
            <strong>Out of scope:</strong> writing comments, search, ads, stories, direct messages (post 63), and the
            details of recommendation models.
          </p>
          <p>
            <strong>Non-functional:</strong>
          </p>
          <ul>
            <li>
              <strong>Fast reads:</strong> the feed loads in <strong>&lt; 500 ms</strong> (p99), because this is the
              app's main screen. p99 means 99 out of 100 requests are at least this fast. Only the slowest 1 in 100 may
              take longer.
            </li>
            <li>
              <strong>Freshness:</strong> new posts appear in followers' feeds within{" "}
              <strong>seconds to a minute</strong>.
            </li>
            <li>
              <strong>Highly available:</strong> a slightly stale feed is <strong>much better</strong> than an error
              (post 27, choose availability).
            </li>
            <li>
              <strong>Read-heavy:</strong> far more feed views than posts.
            </li>
            <li>
              <strong>Scalable</strong> to hundreds of millions of users, including <strong>celebrity accounts</strong>.
            </li>
            <li>
              <strong>Eventual consistency is acceptable</strong> for feeds and counts (post 28). Eventual consistency
              means different copies of the data may differ for a short time, but they all become equal soon.
            </li>
          </ul>
          <h3 id="step-2-estimation">Step 2: Estimation</h3>
          <p>Assumptions:</p>
          <ul>
            <li>
              <strong>100M daily active users (DAU)</strong>. DAU is the number of different people who use the app on
              one day. Each opens the feed <strong>10 times per day</strong>.
            </li>
            <li>
              <strong>10% of DAU post once per day</strong>, which is <strong>10M posts per day</strong>.
            </li>
            <li>
              <strong>Average followers per poster: 200.</strong> A small number of accounts have{" "}
              <strong>10M–100M</strong> followers.
            </li>
            <li>
              Each feed page shows <strong>20 posts</strong>.
            </li>
          </ul>
          <Stats
            caption="The feed, estimated."
            stats={[
              { value: <>~35 K / s</>, label: <>feed reads at peak</>, sub: <>1 B a day</> },
              { value: <>~350 / s</>, label: <>new posts at peak</>, sub: <>10 M a day</> },
              { value: <>~70 K / s</>, label: <>fan-out inserts at peak</>, sub: <>10 M posts × 200 followers</> },
              {
                value: <>50 M</>,
                label: <>inserts from ONE celebrity post</>,
                sub: <>the problem that forces a hybrid</>,
              },
              { value: <>~1 TB</>, label: <>feed cache</>, sub: <>500 post IDs × 8 B × 100 M users, with overhead</> },
            ]}
          />
          <p>
            <strong>So this means:</strong>
          </p>
          <ul>
            <li>
              <strong>Reads dominate</strong> (about 100× the posts), so <strong>precomputing feeds</strong> is
              attractive.
            </li>
            <li>
              <strong>Fan-out on write</strong> is manageable <strong>for normal users</strong> (tens of thousands of
              cache writes per second), but <strong>celebrities break it</strong> (50M writes for one post).
            </li>
            <li>
              <strong>The feed cache</strong> (lists of IDs) is around a terabyte. That needs a{" "}
              <strong>sharded Redis cluster</strong>. Redis is a fast database that keeps data in memory. Sharded means
              the data is split across many machines. This is affordable if we only keep feeds for{" "}
              <strong>active</strong> users.
            </li>
            <li>
              <strong>Media</strong> (photos and video) must go through <strong>object storage + CDN</strong> (posts 14
              and 17). Object storage keeps big files cheaply. A CDN (content delivery network) keeps copies of files
              close to users.
            </li>
          </ul>
          <h3 id="step-3-api-and-data-model">Step 3: API and data model</h3>
          <p>
            <strong>API:</strong>
          </p>
          <CodeBlock lang="http" code={code1} />
          <p>
            Use <strong>cursor-based pagination</strong> (post 34). Pagination means sending a long list in small pages.
            A cursor is a marker that says "continue after this item". New posts arriving at the top must not cause
            duplicates or gaps while you scroll.
          </p>
          <p>
            <strong>Data model:</strong>
          </p>
          <CodeBlock code={code2} />
          <p>
            The <strong>social graph</strong> is the web of who follows whom. It can live in a sharded relational or
            wide-column database, or in a dedicated graph store (post 20). Facebook built TAO for exactly this.
          </p>
          <h3 id="step-4-high-level-design">Step 4: High-level design</h3>
          <Compare
            caption="The two paths of a feed system."
            columns={[
              {
                title: <>Write path — publish</>,
                items: [
                  { sign: "·", text: <>Client → post service → posts DB (source of truth)</> },
                  { sign: "·", text: <>PostCreated event → Kafka</> },
                  { sign: "·", text: <>Fan-out workers look up followers, skip celebrities</> },
                  { sign: "·", text: <>Push the post ID into each follower's feed cache (Redis)</> },
                ],
              },
              {
                title: <>Read path — open the feed</>,
                items: [
                  { sign: "·", text: <>Read my precomputed post IDs from the feed cache</> },
                  { sign: "·", text: <>Pull recent posts from celebrities I follow</> },
                  { sign: "·", text: <>Merge and rank → top 20</> },
                  { sign: "·", text: <>Hydrate in batches: posts, authors, counters, likedByMe</> },
                  { sign: "·", text: <>Return the page + cursor; media from the CDN</> },
                ],
              },
            ]}
          />
          <ul>
            <li>
              <strong>The write path</strong> is fast for the author. The post is saved, an event is published to Kafka
              (a system that stores a stream of events in order), and the "posted!" response returns immediately.
              Fan-out happens <strong>asynchronously</strong>, which means in the background, after the reply (posts 18
              and 39).
            </li>
            <li>
              <strong>The read path</strong> is mostly <strong>cache reads</strong>: a list of IDs, then{" "}
              <strong>hydration</strong> (turning IDs into full objects, such as the post text and author name) from
              caches, in <strong>batches</strong> (many items in one request).
            </li>
          </ul>
          <h3 id="step-5-deep-dives">Step 5: Deep dives</h3>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 1: Fan-out on write (push)</h4>
          <p>
            When a user posts, <strong>write the post ID into every follower's feed cache</strong>:
          </p>
          <CodeBlock code={code3} />
          <ul>
            <li>
              ✅ <strong>Very fast reads.</strong> A feed is just "read my list", and reads are ~100× more frequent than
              writes.
            </li>
            <li>✅ Simple read path, and a predictable read latency.</li>
            <li>
              ❌ <strong>Celebrity problem:</strong> 50M followers means 50M writes. These take minutes and flood the
              system. A "hot key" is one piece of data that gets far more traffic than the rest. Write amplification
              means one action causes many writes.
            </li>
            <li>
              ❌ <strong>Wasted work:</strong> many followers are <strong>inactive</strong> and will never read those
              feed entries.
            </li>
            <li>
              ❌ <strong>Slower "publish to all followers"</strong> for big accounts.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 2: Fan-out on read (pull)</h4>
          <p>
            When a user opens the feed, <strong>fetch recent posts from everyone they follow</strong>, then merge:
          </p>
          <CodeBlock code={code4} />
          <ul>
            <li>
              ✅ <strong>Cheap writes</strong>, with no fan-out at all. It's always fresh, and no work is wasted on
              inactive users.
            </li>
            <li>
              ❌ <strong>Slow, expensive reads:</strong> fetching from hundreds of authors for each feed view, at 35,000
              views per second, is a huge amount of work. The total time is set by the slowest fetch. This is called
              tail latency (post 8): when you wait for many calls, the slowest one decides the speed.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">
            Deep dive 3: The hybrid, which is what real systems do
          </h4>
          <Compare
            caption="Fan-out on write, fan-out on read, and the hybrid everyone ends up with."
            columns={[
              {
                title: <>Push — fan-out on write</>,
                items: [
                  { sign: "+", text: <>Reads are one fast cache lookup</> },
                  { sign: "-", text: <>A 50 M-follower post means 50 M writes</> },
                  { sign: "-", text: <>Wasted work for inactive followers</> },
                ],
                verdict: <>Normal authors</>,
              },
              {
                title: <>Pull — fan-out on read</>,
                items: [
                  { sign: "+", text: <>Writes are cheap — one row</> },
                  { sign: "-", text: <>Every feed open merges hundreds of timelines</> },
                ],
                verdict: <>Celebrities</>,
              },
              {
                title: <>Hybrid</>,
                items: [
                  { sign: "+", text: <>Push for normal authors, pull for celebrities</> },
                  { sign: "+", text: <>Merge both at read time</> },
                ],
                verdict: <>What Twitter/X and Instagram-style feeds do</>,
              },
            ]}
          />
          <ul>
            <li>
              Most authors are normal, so <strong>most feed content is precomputed</strong> (fast reads).
            </li>
            <li>
              Each user follows only a <strong>handful of celebrities</strong>, so pulling their recent posts (which are
              heavily <strong>cached</strong>, because <em>everyone</em> reads them) is cheap.
            </li>
            <li>
              <strong>Inactive users:</strong> skip fan-out to users who haven't opened the app for, say, 30 days, and{" "}
              <strong>rebuild</strong> their feed on demand (pull) when they return.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 4: The feed cache</h4>
          <ul>
            <li>
              <strong>Redis sorted sets</strong> keyed by user: <code>feed:&#123;user_id&#125;</code>. A sorted set is a
              Redis data type that holds unique items, each with a number called a score. Redis keeps the items ordered
              by score. Here the score is the timestamp (or a rank score), and the item (the "member") is the post_id.
            </li>
            <li>
              <strong>Keep only the latest N</strong> (for example, 500–1,000) entries per user. Trim the list on each
              insert with <code>ZREMRANGEBYRANK</code>, a Redis command that removes items by their position in the
              order. Older content is fetched from storage if someone scrolls very far.
            </li>
            <li>
              <strong>Store IDs, not full posts.</strong> It's small, and edits or deletions are reflected when
              hydrating.
            </li>
            <li>
              <strong>Shard by user_id</strong> across a Redis cluster (post 25). Each user's feed lives on one shard. Add
              replicas (extra copies) so the feed stays available if a machine fails (post 24).
            </li>
            <li>
              <strong>Cache miss or rebuild:</strong> if a user's feed cache is empty (new user, eviction or returning
              inactive user), <strong>build it by pulling</strong>, then store it.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 5: Hydration: turning IDs into a page</h4>
          <p>
            For 20 post IDs, we need post content, author names and avatars, like and comment counts, and "did I like
            this?":
          </p>
          <ul>
            <li>
              <strong>Batch fetch</strong> everything (multi-get from caches), <strong>never one by one</strong>. The
              N+1 problem happens when you make 1 call for the list and then N more calls, one for each item. It is slow
              (posts 5 and 32).
            </li>
            <li>
              <strong>Layered caches:</strong> a post cache (hot posts are read by millions), a user or profile cache,
              and counters in Redis.
            </li>
            <li>
              <strong>"Liked by me":</strong> check a set of (post_id, user_id) likes, cached or in a fast key-value
              store.
            </li>
            <li>
              <strong>Parallel calls</strong> (all at the same time) with <strong>timeouts</strong> (a limit on how long
              to wait). If counters are slow, show the post <strong>without</strong> counts instead of failing (post 44).
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 6: Ranking</h4>
          <p>
            Many feeds are <strong>ranked</strong>. Ranking means sorting posts by how useful they are to you, not only
            by time:
          </p>
          <Flow
            caption="Ranking a feed in five steps."
            nodes={[
              {
                title: <>Candidate generation</>,
                desc: <>~500 recent posts from the feed cache + celebrity pulls (+ recommendations)</>,
              },
              {
                title: <>Feature lookup</>,
                desc: <>author affinity, post age, engagement so far, media type, my history</>,
              },
              { title: <>Scoring</>, desc: <>an ML model predicts the chance I'll like, comment or share</> },
              {
                title: <>Re-ranking rules</>,
                desc: <>diversity, freshness, remove already-seen posts, integrity filters</>,
              },
              { title: <>Return top 20 + cursor</>, tone: "good" },
            ]}
          />
          <ul>
            <li>
              Ranking runs at <strong>read time</strong> on a limited set of candidates, which keeps it fast.
            </li>
            <li>
              <strong>Pagination with ranked feeds</strong> needs care. Store the <strong>ranked session</strong> (or a
              snapshot of the candidates) so page 2 matches page 1. Use an opaque cursor, which is a token that the
              client cannot read or change.
            </li>
            <li>
              Keep a <strong>chronological option</strong> where users want it.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 7: Counters, likes and consistency</h4>
          <ul>
            <li>
              <strong>Like counts</strong> are updated <strong>asynchronously</strong>. Redis collects the increments in
              batches and saves them to the database every so often. This is called write-behind (post 16). Counts may
              lag a little, which is acceptable (post 28).
            </li>
            <li>
              <strong>Very hot posts</strong> (viral content) are <strong>hot keys</strong>. Use{" "}
              <strong>sharded counters</strong> (split one counter into several keys, and add them up when you read) and
              local caching (post 16).
            </li>
            <li>
              <strong>Read-your-writes for my own actions:</strong> after I like a post, I must see my own change
              right away. So <strong>my</strong> view shows it as liked immediately, even if the global count updates a
              few seconds later (post 24). Two things help here. Optimistic UI means the app shows the result before
              the server confirms it. The app also reads my own like state from the source of truth.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 8: Edits, deletes, privacy and unfollows</h4>
          <ul>
            <li>
              <strong>Deleted posts:</strong> because feeds store <strong>IDs</strong>, hydration simply{" "}
              <strong>skips</strong> posts marked deleted. There's no need to remove the ID from millions of feed caches
              immediately (a cleanup job can do that later).
            </li>
            <li>
              <strong>Privacy changes and blocks:</strong> check <strong>visibility at read time</strong> during
              hydration (a post author blocked me, or an account turned private). <strong>Never</strong> rely only on
              what was fanned out earlier.
            </li>
            <li>
              <strong>Unfollow:</strong> stop future fan-out, and filter that author's posts at read time (optionally
              clean the cache asynchronously).
            </li>
            <li>
              <strong>New follow:</strong> optionally <strong>backfill</strong> a few recent posts from the new account
              into the follower's feed. Backfill means adding old items that were missed.
            </li>
          </ul>
          <h4 className="mb-1 mt-5 font-semibold text-slate-50">Deep dive 9: Reliability and performance</h4>
          <ul>
            <li>
              <strong>Availability over consistency:</strong> if fan-out is delayed, feeds are slightly stale, which is
              fine. If the ranking service fails, <strong>fall back to chronological</strong>. If counters fail, show
              posts without counts (post 44).
            </li>
            <li>
              <strong>Queue-based fan-out</strong> absorbs bursts (for example, everyone posting during a big match). A
              queue holds work until a worker is free. Monitor <strong>fan-out lag</strong> (how far the workers are
              behind, called consumer lag in Kafka, post 36) as a key freshness measure.
            </li>
            <li>
              <strong>Multi-region:</strong> users read from their nearest region's caches. Posts and events replicate
              across regions asynchronously (post 24).
            </li>
            <li>
              <strong>Prefetching:</strong> the app can fetch the next page in the background and cache the first page
              locally for instant app opens.
            </li>
            <li>
              <strong>SLOs</strong> (service level objectives, which are goals you promise to meet): feed p99 latency,
              fan-out delay ("99% of posts in followers' feeds within 60 s"), and error rate (post 47).
            </li>
          </ul>
          <h3 id="wrap-up">Wrap-up</h3>
          <ul>
            <li>
              <strong>Key decisions:</strong>
              <ul>
                <li>
                  <strong>Hybrid fan-out:</strong> push for normal users, pull for celebrities, and skip inactive users.
                </li>
                <li>
                  <strong>Feed caches of post IDs</strong> in a sharded Redis cluster.
                </li>
                <li>
                  <strong>Async fan-out</strong> through Kafka.
                </li>
                <li>
                  <strong>Batched hydration</strong> from layered caches.
                </li>
                <li>
                  <strong>Read-time ranking</strong> over a candidate set.
                </li>
                <li>
                  <strong>Visibility checks at read time.</strong>
                </li>
                <li>
                  <strong>Cursor pagination.</strong>
                </li>
                <li>
                  <strong>Eventually consistent counters.</strong>
                </li>
              </ul>
            </li>
            <li>
              <strong>Trade-offs:</strong> faster reads (push) vs cheaper writes (pull); freshness vs cost; ranking
              relevance vs predictability; eventual consistency for counts and feeds.
            </li>
            <li>
              <strong>Next steps:</strong> recommendation-driven content from accounts you don't follow, ads insertion,
              video-heavy feeds, and real-time "new posts" banners via SSE or WebSockets (post 33). Both are ways for the server to push updates
              to the browser.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Fan-out on write (push)</th>
                  <th>Fan-out on read (pull)</th>
                  <th>Hybrid</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Read latency</td>
                  <td>✅ Very fast</td>
                  <td>❌ Slow (many fetches)</td>
                  <td>✅ Fast</td>
                </tr>
                <tr>
                  <td>Write cost</td>
                  <td>❌ High (× followers)</td>
                  <td>✅ Minimal</td>
                  <td>🟡 Moderate</td>
                </tr>
                <tr>
                  <td>Celebrity accounts</td>
                  <td>❌ Breaks (millions of writes)</td>
                  <td>✅ Fine</td>
                  <td>✅ Handled by pull</td>
                </tr>
                <tr>
                  <td>Inactive users</td>
                  <td>❌ Wasted work</td>
                  <td>✅ No waste</td>
                  <td>✅ Skip + rebuild on return</td>
                </tr>
                <tr>
                  <td>Freshness</td>
                  <td>🟡 Delay = fan-out lag</td>
                  <td>✅ Always fresh</td>
                  <td>🟡 Mostly fresh</td>
                </tr>
                <tr>
                  <td>Complexity</td>
                  <td>🟡 Medium</td>
                  <td>🟡 Medium</td>
                  <td>❌ Highest</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Twitter's timelines.</strong> In a well-known 2012 talk at QCon San Francisco, "Timelines at Scale",
            Twitter engineer Raffi Krikorian explained that Twitter <strong>precomputed home timelines</strong> in
            Redis. Each tweet was fanned out to followers' timelines (lists of tweet IDs), because reads far outnumbered
            writes. For accounts with <strong>very large follower counts</strong>, fanning out to everyone was too
            slow, so their tweets were <strong>merged in at read time</strong>. This is the hybrid model described
            above.
          </p>
          <p>
            <strong>Facebook's TAO and News Feed.</strong> Facebook built <strong>TAO</strong>, a distributed, cached
            data store for the <strong>social graph</strong> (users, friendships, likes and posts), to serve the
            enormous number of graph reads behind News Feed and other features (paper at USENIX ATC 2013). News Feed
            ranking has evolved from simple formulas into large machine-learning systems that score thousands of
            candidate stories per user.
          </p>
          <p>
            <strong>Instagram's move to a ranked feed.</strong> In 2016, Instagram switched from a purely chronological
            feed to a <strong>ranked</strong> one, explaining that people were missing a large share of posts from
            accounts they followed. Years later, it again offered <strong>chronological "Following" views</strong>{" "}
            alongside the ranked feed, a sign that ranking is both a technical <strong>and</strong> a product decision.
          </p>
          <p>
            <strong>LinkedIn and Pinterest.</strong> LinkedIn and Pinterest have both written about their feed
            architectures: candidate generation from followed sources, ranking models, and precomputed or partially
            materialised feeds, with extensive caching to meet latency targets at scale.
          </p>
          <p>
            <strong>Big live events.</strong> During global events (a World Cup final, an election night, a cricket
            final), social platforms see <strong>huge spikes</strong> in posting and reading at the same moment.
            Queue-based fan-out, aggressive caching and graceful degradation (like temporarily simplifying ranking) keep
            feeds working when it matters most.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Fan-out on write or fan-out on read?</>,
                a: (
                  <>
                    <p>
                      Fan-out on write (push) builds each follower's feed ahead of time. Reads are then one cheap cache
                      lookup. But a celebrity post creates millions of writes, and work is wasted on inactive users.
                      Fan-out on read (pull) keeps writes cheap. But every time someone opens the feed, the system must
                      merge many timelines. Most systems use a hybrid: push for normal authors, pull for celebrities,
                      and merge both at read time.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you store the precomputed feed?</>,
                a: (
                  <>
                    <p>
                      As a capped list or sorted set of post IDs for each user in Redis. It holds just IDs and scores, so
                      it is small. At read time, I hydrate the full post, author and counter objects in batches from
                      their own caches. Inactive users' feeds can expire and be rebuilt when they come back.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you paginate a constantly changing feed?</>,
                a: (
                  <>
                    <p>
                      With cursor (keyset) pagination. The cursor is based on the last item's score or timestamp, plus
                      its ID. I do not use offsets (page numbers), because new posts at the top would shift the list.
                      With a cursor, the user never sees duplicates or skipped posts while scrolling.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do like and comment counts stay fast?</>,
                a: (
                  <>
                    <p>
                      Keep counters in Redis and increase them atomically (as one step that cannot be split). Save them
                      to the database in the background. Show them as eventually consistent, which means they may be
                      slightly old, or approximate for huge numbers. Read likedByMe from a per-user set, which is a quick
                      "is this item in the set?" check.
                    </p>
                  </>
                ),
              },
              {
                q: <>What happens when a user follows someone new?</>,
                a: (
                  <>
                    <p>
                      Optionally backfill a few of that account's recent posts into the follower's feed cache
                      asynchronously; later posts arrive through normal fan-out. On unfollow, filter that author's posts
                      at read time and clean the cache lazily.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you rank a feed?</>,
                a: (
                  <>
                    <p>
                      First, collect candidates (recent posts from followed accounts, celebrity posts, recommendations).
                      Next, look up features (facts about each post and the user). Then score each post with a machine
                      learning model that predicts whether the user will like, comment or share. Last, re-rank with
                      rules for variety, freshness and safety, and return one page.
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
              The central feed trade-off: <strong>fan-out on write</strong> (fast reads, costly writes) vs{" "}
              <strong>fan-out on read</strong> (cheap writes, slow reads). Real systems use a <strong>hybrid</strong>:{" "}
              <strong>push for normal users, pull for celebrities, skip inactive users</strong>.
            </li>
            <li>
              <strong>Estimate first:</strong> reads are ~100× writes, fan-out is ~billions of cache inserts per day,
              and a ~1 TB <strong>feed cache of post IDs</strong> fits a sharded Redis cluster.
            </li>
            <li>
              <strong>Store IDs, not posts</strong>, in feed caches. <strong>Hydrate in batches</strong> from layered
              caches (posts, users, counters, likes), and degrade gracefully if parts are slow.
            </li>
            <li>
              <strong>Rank at read time</strong> over a candidate set, use <strong>cursor pagination</strong>{" "}
              (consistent across pages), and check <strong>visibility and deletes at read time</strong>.
            </li>
            <li>
              Accept <strong>eventual consistency</strong> for feeds and counts (with read-your-writes for the user's
              own actions), <strong>fan out asynchronously</strong> via Kafka, and{" "}
              <strong>monitor fan-out lag and feed latency</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>System Design Interview</em> by Alex Xu (chapter 11, "Design A News Feed System")
            </li>
            <li>The System Design Primer on GitHub ("Design the Twitter timeline and search" solution)</li>
            <li>Raffi Krikorian's talk "Timelines at Scale" (QCon San Francisco, 2012)</li>
            <li>The TAO paper, "TAO: Facebook's Distributed Data Store for the Social Graph" (USENIX ATC 2013)</li>
            <li>Instagram Engineering blog posts on feed ranking</li>
            <li>Pinterest and LinkedIn engineering blog posts on their home feed architectures</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
