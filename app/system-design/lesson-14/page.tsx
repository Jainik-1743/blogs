import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-14")!;

export const metadata: Metadata = {
  title: `Lesson 14 — ${lesson.title}`,
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

const code1 = `Cache-Control: public, max-age=31536000, immutable`;

const code2 = `Cache-Control: public, max-age=60, stale-while-revalidate=300`;

const code3 = `Cache-Control: private, no-store`;

export default function SdLessonOneFourPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Your servers are in Mumbai. A user in Mumbai loads your homepage in 300 ms. A user in São Paulo takes 3
            seconds. Each image, script and stylesheet crosses the planet, and round trips there take over 300 ms.
          </p>
          <p>
            Then your product goes viral. Traffic jumps 50×, mostly people downloading the same homepage images, and
            your servers melt.
          </p>
          <p>
            A <strong>CDN (Content Delivery Network)</strong> solves both problems. It brings content{" "}
            <strong>close to users</strong>, and it takes <strong>most of the load</strong> off your servers.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about how a <strong>popular biscuit brand</strong> reaches shops. The factory doesn't ship one packet
            at a time from its single factory to every corner shop in the country. Instead, it sends big batches to{" "}
            <strong>regional warehouses</strong>, and each shop gets stock from the nearest warehouse. It's faster for
            customers and far less work for the factory.
          </p>
          <p>
            A CDN is a <strong>worldwide network of warehouses for your content</strong>:
          </p>
          <ul>
            <li>
              <strong>Origin</strong> = your servers (the factory).
            </li>
            <li>
              <strong>Edge servers / PoPs (Points of Presence)</strong> = the CDN's servers in hundreds of cities (the
              warehouses).
            </li>
            <li>
              <strong>Users</strong> get content from the nearest edge. The edge only goes back to your origin when it
              doesn't have a fresh copy.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="a-request-through-a-cdn">A request through a CDN</h3>
          <SequenceDiagram
            caption="A pull CDN. The first request in a region pays the trip to the origin; everyone after it is served locally."
            actors={["User A (São Paulo)", "User B (São Paulo)", "Edge (São Paulo)", "Origin (Mumbai)"]}
            messages={[
              { from: 0, to: 2, label: <>GET /logo.png</> },
              { from: 2, to: 3, label: <>miss → fetch</>, note: <>~300 ms across the planet</> },
              { from: 3, to: 2, label: <>logo.png + Cache-Control</>, reply: true },
              { from: 2, to: 2, label: <>store a copy</> },
              { from: 2, to: 0, label: <>logo.png</>, reply: true },
              { from: 0, to: 0, label: <>Cache is now warm for the whole region</>, divider: true },
              { from: 1, to: 2, label: <>GET /logo.png</> },
              { from: 2, to: 1, label: <>hit!</>, note: <>~10–20 ms, origin never touched</>, reply: true },
            ]}
          />
          <ol>
            <li>
              The user's request is directed to the <strong>nearest edge</strong>, using <strong>anycast</strong> or{" "}
              <strong>DNS</strong> (post 11).
            </li>
            <li>
              The edge checks its cache.
              <ul>
                <li>
                  <strong>Cache hit:</strong> return the file immediately.
                </li>
                <li>
                  <strong>Cache miss:</strong> fetch it from the origin, return it to the user, and{" "}
                  <strong>keep a copy</strong> for next time.
                </li>
              </ul>
            </li>
            <li>Later users near that edge get the fast cached copy.</li>
          </ol>
          <p>
            The key metric is the <strong>cache hit ratio</strong>. If it's 95%, only 5% of requests ever reach your
            servers.
          </p>
          <h3 id="pull-cdn-vs-push-cdn">Pull CDN vs push CDN</h3>
          <Compare
            caption="Two ways content reaches the edge."
            columns={[
              {
                title: <>Pull CDN</>,
                items: [
                  { sign: "+", text: <>No upload step — point it at your origin</> },
                  { sign: "+", text: <>Stores only what's actually requested</> },
                  { sign: "-", text: <>First user per region gets a slow miss</> },
                ],
                verdict: <>Websites, millions of rarely-viewed images</>,
              },
              {
                title: <>Push CDN</>,
                items: [
                  { sign: "+", text: <>No first-request miss</> },
                  { sign: "+", text: <>Full control over what is stored where</> },
                  { sign: "-", text: <>You manage uploads and storage</> },
                ],
                verdict: <>Game patches, app installers, video libraries</>,
              },
            ]}
          />
          <ul>
            <li>
              <strong>Pull CDN (most common).</strong> You point the CDN at your origin. Edges fetch content{" "}
              <strong>on demand</strong> at the first request, then cache it.
              <ul>
                <li>✅ Easy: no upload step.</li>
                <li>❌ The first user in each region gets a slower miss.</li>
              </ul>
            </li>
            <li>
              <strong>Push CDN.</strong> You <strong>upload</strong> content to the CDN ahead of time.
              <ul>
                <li>✅ No first-request miss, and you have full control over what's stored.</li>
                <li>
                  ❌ You must manage uploads and storage. It's good for large, planned content like software downloads
                  or a video library.
                </li>
              </ul>
            </li>
          </ul>
          <p>
            For a site with millions of rarely-viewed images, <strong>pull</strong> is usually better, because you only
            store what's actually requested. For a big game update everyone downloads at launch, <strong>push</strong>{" "}
            (pre-warming) makes sense.
          </p>
          <h3 id="what-to-put-on-a-cdn">What to put on a CDN</h3>
          <ul>
            <li>
              <strong>Static assets:</strong> JavaScript, CSS, fonts, icons.
            </li>
            <li>
              <strong>Images and video:</strong> product photos, thumbnails, video segments.
            </li>
            <li>
              <strong>Downloads:</strong> apps, installers, PDFs.
            </li>
            <li>
              <strong>Whole static pages:</strong> blogs, documentation, marketing sites.
            </li>
            <li>
              <strong>Some API responses:</strong> public, rarely-changing data like a product catalogue or exchange
              rates, cached for a short time.
            </li>
          </ul>
          <p>
            <strong>Don't cache:</strong> personal pages (your cart, your account), anything with private data, or
            responses that must always be up to the second, unless you're very careful with cache rules.
          </p>
          <h3 id="how-the-cdn-knows-what-to-cache-http-headers">How the CDN knows what to cache: HTTP headers</h3>
          <p>CDNs follow standard HTTP caching headers from your origin:</p>
          <CodeBlock lang="http" code={code1} />
          <p>
            means "anyone may cache this for a year; it will never change". It's perfect for versioned files like{" "}
            <code>app.3f2a9c.js</code>.
          </p>
          <CodeBlock lang="http" code={code2} />
          <p>
            means "cache for 60 seconds. After that, you may serve the old copy for up to 5 more minutes while fetching
            a fresh one in the background". This is great for pages that change occasionally.
          </p>
          <CodeBlock lang="http" code={code3} />
          <p>means "never cache this in a shared cache". Use it for account pages and anything personal.</p>
          <p>Other headers you'll use:</p>
          <ul>
            <li>
              <strong>
                <code>s-maxage</code>:
              </strong>{" "}
              like <code>max-age</code>, but only for shared caches like CDNs.
            </li>
            <li>
              <strong>
                <code>ETag</code> / <code>Last-Modified</code>:
              </strong>{" "}
              let the CDN ask the origin "has this changed?" and get a small <code>304 Not Modified</code> back.
            </li>
            <li>
              <strong>
                <code>Vary</code>:
              </strong>{" "}
              "cache different copies depending on this header", for example <code>Vary: Accept-Encoding</code> for gzip
              vs Brotli versions. Be careful: <code>Vary: Cookie</code> can destroy your hit ratio.
            </li>
          </ul>
          <p>
            The <strong>cache key</strong> is what the CDN uses to decide whether two requests are "the same". By
            default it's the URL. If your URLs include random tracking parameters (<code>?utm_source=...</code>), you
            may want the CDN to ignore them, or every link becomes a separate cache entry.
          </p>
          <h3 id="invalidation-updating-cached-content">Invalidation: updating cached content</h3>
          <Stats
            caption="Four ways to change something that is cached on hundreds of servers."
            stats={[
              {
                value: <>app.3f2a9c.js</>,
                label: <>hashed file names</>,
                sub: <>new content = new URL; cache forever</>,
              },
              { value: <>PURGE</>, label: <>delete everywhere</>, sub: <>seconds, but an extra step</> },
              { value: <>max-age=60</>, label: <>short TTLs</>, sub: <>still absorbs huge spikes</> },
              { value: <>tag:product-991</>, label: <>surrogate keys</>, sub: <>purge a whole group in one call</> },
            ]}
          />
          <p>
            "There are only two hard things in computer science: cache invalidation and naming things." This saying is
            famous for a reason. Once a file is cached on hundreds of edges, how do you update it?
          </p>
          <ol>
            <li>
              <strong>Versioned file names (best for static assets).</strong> Build tools like Vite, webpack and Next.js
              add a content hash: <code>app.3f2a9c.js</code>. A new deploy produces <code>app.8b1d4e.js</code>, a new
              URL, so there's nothing to invalidate. Cache the files forever, and keep the HTML itself on a short cache
              time.
            </li>
            <li>
              <strong>Purge.</strong> Tell the CDN "delete <code>/images/banner.jpg</code> everywhere". Most CDNs purge
              within seconds, but it's an extra step, and frequent purges can hit limits.
            </li>
            <li>
              <strong>Short TTLs.</strong> For content that changes regularly, just cache it for 30–60 seconds. Even a
              short cache absorbs huge traffic spikes.
            </li>
            <li>
              <strong>Tags / surrogate keys.</strong> Some CDNs let you tag responses ("product-991") and purge
              everything with that tag in one call.
            </li>
          </ol>
          <h3 id="origin-shielding">Origin shielding</h3>
          <p>
            With 300 edges, a cache miss could mean 300 separate requests to your origin for the same file.{" "}
            <strong>Origin shield</strong> (tiered caching) adds a middle layer. Edges ask a{" "}
            <strong>regional shield</strong> cache first, and only the shield talks to your origin. This protects your
            servers from "miss storms".
          </p>
          <Flow
            caption="Origin shield. Hundreds of edges ask a few regional shields; only the shields ask you."
            dir="row"
            nodes={[
              { title: <>Edges</>, desc: <>hundreds of cities</> },
              { title: <>Shield</>, desc: <>a few regions</> },
              { title: <>Origin</>, desc: <>you — sees a trickle</>, tone: "good" },
            ]}
          />
          <h3 id="video-delivery">Video delivery</h3>
          <p>
            Streaming services cut videos into <strong>small segments</strong> (a few seconds each) at several quality
            levels, using formats like <strong>HLS</strong> or <strong>DASH</strong>. Each segment is just a small
            static file, which is perfect for CDNs. The player picks the quality level that matches your connection,
            switching up or down as your network changes. That's why a video goes blurry for a moment and then sharpens.
          </p>
          <h3 id="cdns-do-more-than-caching">CDNs do more than caching</h3>
          <p>Modern CDNs also provide:</p>
          <ul>
            <li>
              <strong>DDoS protection:</strong> absorbing huge attack traffic across their global network.
            </li>
            <li>
              <strong>Web Application Firewall (WAF):</strong> blocking common attacks.
            </li>
            <li>
              <strong>TLS at the edge:</strong> faster HTTPS setup, because the handshake happens nearby.
            </li>
            <li>
              <strong>Image optimisation:</strong> automatically resizing images and converting them to modern formats
              (WebP/AVIF).
            </li>
            <li>
              <strong>Edge compute:</strong> running small pieces of code at the edge for redirects, A/B tests, auth
              checks or personalisation (for example, Cloudflare Workers or Lambda@Edge).
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Stale content.</strong> Cached content may be out of date until it expires or is purged. Choose
              TTLs per content type.
            </li>
            <li>
              <strong>Cost.</strong> CDNs charge for bandwidth and requests, but this is usually{" "}
              <strong>cheaper</strong> than serving the same traffic from your own servers.
            </li>
            <li>
              <strong>Debugging is harder.</strong> "Why is this user seeing the old version?" might be a CDN, browser
              or proxy cache.
            </li>
            <li>
              <strong>A new dependency.</strong> If the CDN has an outage, your site can go down with it, even though
              your servers are fine. Some large companies use <strong>two CDNs</strong>.
            </li>
            <li>
              <strong>Personalised content</strong> is hard to cache. Split pages into a cacheable shell plus a small
              personalised API call.
            </li>
          </ul>
          <p>
            <strong>When not to bother:</strong> internal tools used from one office, or apps where almost everything is
            personal and real-time. Even then, a CDN for static files is usually a cheap win.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Netflix Open Connect.</strong> Netflix built its own CDN and places{" "}
            <strong>Open Connect appliances</strong>, servers filled with popular shows, directly inside internet
            providers' networks around the world. Popular content is pushed to these boxes during quiet hours, so when
            you press play in the evening, the video often comes from a server in your own internet provider's network.
          </p>
          <p>
            <strong>The Fastly outage (June 2021).</strong> A single customer's valid configuration change triggered a
            hidden bug in Fastly's software. For about an hour, many major websites (news sites, e-commerce sites and
            government websites) showed errors worldwide. The origins were fine; the layer in front of them failed. It's
            a clear lesson that a CDN is part of your critical path.
          </p>
          <p>
            <strong>Cloudflare, Akamai and Amazon CloudFront</strong> serve a large share of all web traffic. Cloudflare
            in particular offers free plans that let even small blogs get global caching, HTTPS and DDoS protection.
          </p>
          <p>
            <strong>Modern frontend hosting.</strong> Platforms like Vercel and Netlify put your built site on a global
            CDN automatically. Hashed file names from the build step, plus short caching for HTML, is exactly the
            invalidation strategy described above.
          </p>
          <p>
            <strong>Live cricket and big events.</strong> Streaming platforms push video segments to CDN edges across
            the country (and use many CDN partners) so that millions of people can watch the same moment without every
            request hitting a central server.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>How does a CDN reduce latency and origin load?</>,
                a: (
                  <>
                    <p>
                      It serves content from edge servers close to users, so each request travels a few kilometres
                      instead of across continents, and the TLS handshake happens nearby. The origin only sees cache
                      misses: with a 95% hit ratio, it handles 5% of the traffic.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you deploy new JavaScript without users getting stale files?</>,
                a: (
                  <>
                    <p>
                      Fingerprint asset file names with a content hash (app.3f2a9c.js) and cache them forever with
                      immutable. Each deploy produces new URLs, so nothing needs invalidating. Keep the HTML that
                      references them on a short TTL.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's the difference between max-age and s-maxage?</>,
                a: (
                  <>
                    <p>
                      max-age applies to every cache, including browsers. s-maxage applies only to shared caches like
                      CDNs and proxies, so you can let the CDN cache for an hour while browsers revalidate every minute.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why can Vary: Cookie destroy your hit ratio?</>,
                a: (
                  <>
                    <p>
                      The CDN stores a separate copy per distinct value of the Vary header. Almost every user has
                      different cookies, so almost every request becomes its own cache entry and misses. Vary on small,
                      bounded headers like Accept-Encoding instead.
                    </p>
                  </>
                ),
              },
              {
                q: <>Can you cache personalised pages on a CDN?</>,
                a: (
                  <>
                    <p>
                      Not the personal parts. Split the page into a public, cacheable shell and a small personalised API
                      call made from the client, or personalise at the edge with edge compute. Mark private responses
                      Cache-Control: private, no-store.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is an origin shield?</>,
                a: (
                  <>
                    <p>
                      A middle tier of regional caches between edges and the origin. On a miss, edges ask the shield,
                      and only the shield asks the origin, collapsing hundreds of parallel misses for the same file into
                      one.
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
              A <strong>CDN</strong> caches content on <strong>edge servers near users</strong>. It lowers latency and
              offloads most traffic from your origin.
            </li>
            <li>
              <strong>Pull CDNs</strong> fetch on the first request; <strong>push CDNs</strong> are loaded in advance.
            </li>
            <li>
              <strong>HTTP headers</strong> (<code>Cache-Control</code>, <code>ETag</code>, <code>Vary</code>) control
              caching. Watch the <strong>cache key</strong> and the <strong>hit ratio</strong>.
            </li>
            <li>
              Use <strong>hashed file names</strong> for static assets (cache them forever) and{" "}
              <strong>short TTLs or purges</strong> for content that changes.
            </li>
            <li>
              CDNs also provide <strong>DDoS protection, WAF, TLS at the edge and edge compute</strong>, but they're a
              critical dependency too.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>MDN Web Docs guide "HTTP caching"</li>
            <li>RFC 9111 (HTTP Caching)</li>
            <li>The System Design Primer on GitHub (section "Content delivery network")</li>
            <li>Cloudflare Learning Center article "What is a CDN?"</li>
            <li>Netflix's Open Connect overview and the Netflix Tech Blog</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
