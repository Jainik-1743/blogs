import type { Metadata } from "next";
import Callout from "@/components/Callout";
import LessonPager from "@/components/LessonPager";
import { AsciiDiagram, Compare, QA, Timeline } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import LoadBalancer from "@/components/sd/widgets/LoadBalancer";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-12")!;

export const metadata: Metadata = {
  title: `Lesson 12 — ${lesson.title}`,
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

const diagram1 = `                   ┌──► [ Server 1 ] ✅
 Users ──► [ LB ] ─┼──► [ Server 2 ] ❌  (failed health check, no traffic)
                   └──► [ Server 3 ] ✅`;

export default function SdLessonOneTwoPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            You've made your app stateless (post 7) and started three servers. But users can only type{" "}
            <strong>one address</strong> into their browser. How does traffic get spread across three machines? And what
            happens when server 2 crashes at 2 AM? Without help, a third of your users would see errors until someone
            wakes up and fixes it.
          </p>
          <p>
            The <strong>load balancer</strong> solves both problems. It's the piece that makes horizontal scaling and
            high availability actually work.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Picture the <strong>token system at a busy bank</strong> or passport office. You don't choose a counter
            yourself. You take a token, and the display tells you which counter is free. If counter 4 closes for lunch,
            the system simply stops calling people to counter 4.
          </p>
          <p>A load balancer does the same for requests:</p>
          <ul>
            <li>
              It sits in front of your servers, with <strong>one public address</strong>.
            </li>
            <li>
              It sends each request to a <strong>healthy</strong> server.
            </li>
            <li>
              It spreads the work so <strong>no single server is overloaded</strong>.
            </li>
            <li>
              It <strong>stops sending traffic</strong> to servers that fail health checks.
            </li>
          </ul>
          <AsciiDiagram text={diagram1} />
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="what-a-load-balancer-does">What a load balancer does</h3>
          <ol>
            <li>
              <strong>Distributes traffic</strong> across servers using an algorithm.
            </li>
            <li>
              <strong>Health-checks</strong> servers and routes around failures.
            </li>
            <li>
              <strong>Hides your internal setup.</strong> Users see one address, not 50 servers.
            </li>
            <li>
              <strong>Enables zero-downtime deploys.</strong> Take servers out one at a time, update them, put them
              back.
            </li>
            <li>
              <strong>Often terminates TLS</strong> (HTTPS), so app servers don't have to (post 3).
            </li>
          </ol>
          <h3 id="layer-4-vs-layer-7">Layer 4 vs Layer 7</h3>
          <p>
            Remember the network layers from post 1: Layer 4 is transport (TCP/UDP) and Layer 7 is application (HTTP).
          </p>
          <p>
            <strong>L4 load balancer.</strong> It looks only at <strong>IP addresses and ports</strong>. It doesn't read
            the request; it forwards the connection's packets to a chosen server.
          </p>
          <ul>
            <li>✅ Very fast, and can handle huge numbers of connections.</li>
            <li>✅ Works with any protocol on TCP/UDP: databases, game servers, MQTT, gRPC.</li>
            <li>❌ Can't make decisions based on the URL, headers or cookies.</li>
          </ul>
          <p>
            <strong>L7 load balancer.</strong> It <strong>reads the HTTP request</strong>: path, host, headers, cookies.
          </p>
          <ul>
            <li>
              ✅ Smart routing: <code>/api/*</code> → API servers, <code>/images/*</code> → image servers,{" "}
              <code>admin.site.com</code> → admin servers.
            </li>
            <li>✅ Can retry failed requests, add headers, compress responses, and route by user or region.</li>
            <li>
              ✅ Balances <strong>per request</strong>, not per connection. This matters for HTTP/2 and gRPC, where one
              connection carries many requests.
            </li>
            <li>❌ More work per request, so slightly slower and more expensive than L4.</li>
            <li>❌ Must decrypt HTTPS to read requests, so it needs your TLS certificate.</li>
          </ul>
          <Compare
            caption="What each kind of load balancer can see — and therefore decide on."
            columns={[
              {
                title: <>L4 — transport</>,
                items: [
                  { sign: "·", text: <>Sees: “packet for 203.0.113.5:443”</> },
                  { sign: "+", text: <>Very fast; huge connection counts</> },
                  { sign: "+", text: <>Any TCP/UDP protocol: databases, games, MQTT</> },
                  { sign: "-", text: <>Can't route by URL, header or cookie</> },
                  { sign: "-", text: <>Balances connections, not requests</> },
                ],
                verdict: <>AWS NLB; the first layer at the edge</>,
              },
              {
                title: <>L7 — application</>,
                items: [
                  { sign: "·", text: <>Sees: “GET /api/orders, Host: shop.com, Cookie: …”</> },
                  { sign: "+", text: <>Route /api, /images and admin.site.com to different pools</> },
                  { sign: "+", text: <>Per-request balancing (matters for HTTP/2, gRPC)</> },
                  { sign: "+", text: <>Retries, header rewrites, compression</> },
                  { sign: "-", text: <>More work per request; must hold your TLS cert</> },
                ],
                verdict: <>AWS ALB, NGINX, Envoy</>,
              },
            ]}
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>L4</th>
                  <th>L7</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sees</td>
                  <td>IP, port</td>
                  <td>Full HTTP request</td>
                </tr>
                <tr>
                  <td>Routing by URL/header</td>
                  <td>❌</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Speed</td>
                  <td>Faster</td>
                  <td>Slightly slower</td>
                </tr>
                <tr>
                  <td>Protocols</td>
                  <td>Any TCP/UDP</td>
                  <td>HTTP, HTTP/2, gRPC, WebSocket</td>
                </tr>
                <tr>
                  <td>AWS example</td>
                  <td>Network Load Balancer (NLB)</td>
                  <td>Application Load Balancer (ALB)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Many large systems use <strong>both</strong>: an L4 layer at the edge to spread raw traffic across a fleet
            of L7 proxies, which then do smart routing.
          </p>
          <h3 id="balancing-algorithms">Balancing algorithms</h3>
          <p>
            <strong>Round robin.</strong> Send requests in turn: 1, 2, 3, 1, 2, 3…
          </p>
          <ul>
            <li>Simple and fair when all servers and requests are similar.</li>
            <li>Bad when some requests are heavy (a report) and others light (a ping).</li>
          </ul>
          <p>
            <strong>Weighted round robin.</strong> Bigger servers get a bigger share. A server with weight 3 gets three
            requests for every one sent to a server with weight 1. Useful when machines differ, or to send a small share
            to a new version (canary).
          </p>
          <p>
            <strong>Least connections.</strong> Send to the server with the <strong>fewest active connections</strong>.
            It adapts to uneven request times, which makes it good for long or variable requests. One gotcha: a newly
            added server has zero connections, so it can get flooded all at once while its caches are still cold. Many
            load balancers offer <strong>slow start</strong>, which ramps up traffic to new servers gradually.
          </p>
          <p>
            <strong>Least response time.</strong> Pick the server that has been answering fastest recently. Good for
            latency, but more complex.
          </p>
          <p>
            <strong>IP hash / consistent hashing.</strong> Hash the client's IP (or a user ID, or a URL) to pick a
            server, so the <strong>same key always goes to the same server</strong>.
          </p>
          <ul>
            <li>Useful when a server keeps a local cache per user or per item, which improves cache hit rates.</li>
            <li>Consistent hashing (Part 4) means adding or removing a server only moves a small share of keys.</li>
          </ul>
          <p>
            <strong>Power of two random choices.</strong> Pick <strong>two servers at random</strong>, then send the
            request to the less busy one. It sounds too simple, but it works remarkably well at large scale. It avoids
            everyone rushing to the same "least busy" server at once, a problem called herding, and it needs little
            coordination. It's used in several modern proxies.
          </p>
          <p>
            <strong>Quick guide:</strong>
          </p>
          <ul>
            <li>Similar requests, similar servers → round robin.</li>
            <li>Variable request times → least connections, or power of two choices.</li>
            <li>Need the same key on the same server → consistent hashing.</li>
            <li>Mixed server sizes → weighted.</li>
          </ul>
          <LoadBalancer caption="Send requests through four algorithms. About a third of them are slow and stay active for a while — watch where they pile up." />
          <h3 id="health-checks">Health checks</h3>
          <Callout kind="warn" label="The deep health check trap">
            <p>
              If every server's <code>/health</code> also checks the shared database, one short database blip makes{" "}
              <strong>every</strong> server fail at once, and the load balancer removes all of them. A tiny hiccup
              becomes a total outage. Check the server itself, handle dependency failures with timeouts and fallbacks,
              and configure the balancer to <strong>fail open</strong> when everything looks unhealthy.
            </p>
          </Callout>
          <p>The load balancer regularly asks each server, "Are you OK?"</p>
          <ul>
            <li>
              <strong>Active checks.</strong> The LB calls something like <code>GET /health</code> every few seconds.
              After, say, 3 failures in a row, the server is marked unhealthy. After a couple of successes, it's added
              back.
            </li>
            <li>
              <strong>Passive checks.</strong> The LB watches real traffic. If a server keeps returning errors or timing
              out, it's removed.
            </li>
          </ul>
          <p>
            <strong>Shallow vs deep health checks:</strong>
          </p>
          <ul>
            <li>
              A <strong>shallow</strong> check ("the process is running and can respond") is fast and safe.
            </li>
            <li>
              A <strong>deep</strong> check ("I can reach the database, the cache and the payment API") sounds better,
              but it's <strong>dangerous</strong>. If the shared database has a short hiccup, <strong>every</strong>{" "}
              server fails its check at once, and the load balancer removes <strong>all</strong> of them. A small blip
              becomes a total outage.
            </li>
          </ul>
          <p>
            A common approach: health checks confirm <strong>the server itself</strong> is OK. Dependency problems are
            handled separately, with timeouts and fallbacks (Part 7). Many load balancers also have a "fail open" safety
            rule: if every server looks unhealthy, keep sending traffic anyway.
          </p>
          <p>
            In Kubernetes you'll see the same ideas as <strong>liveness</strong> probes ("should I restart this?") and{" "}
            <strong>readiness</strong> probes ("should I send it traffic?").
          </p>
          <h3 id="connection-draining">Connection draining</h3>
          <Timeline
            caption="Removing a server for a deploy without cutting anyone off."
            events={[
              { time: <>t = 0 s</>, text: <>server marked “draining” — no new requests are sent to it</> },
              { time: <>0–30 s</>, text: <>in-flight requests finish normally</> },
              { time: <>t = 30 s</>, text: <>removed from the pool; safe to stop and update</>, tone: "good" },
              { time: <>after deploy</>, text: <>passes health checks → added back, with slow start</>, tone: "good" },
            ]}
          />
          <p>
            When you remove a server for a deploy, you don't want to cut off requests that are halfway through.{" "}
            <strong>Connection draining</strong> (also called deregistration delay) means: stop sending <em>new</em>{" "}
            requests, let <em>existing</em> ones finish for up to N seconds, then remove the server.
          </p>
          <h3 id="sticky-sessions">Sticky sessions</h3>
          <p>
            As in post 7, the LB can pin a user to one server using a cookie. This helps with legacy stateful apps, but
            it causes uneven load and lost sessions when that server dies. Prefer stateless apps.
          </p>
          <h3 id="isn-t-the-load-balancer-a-single-point-of-failure">
            Isn't the load balancer a single point of failure?
          </h3>
          <p>Yes, if there's only one. Common solutions:</p>
          <ul>
            <li>
              <strong>A pair of load balancers</strong> (active-passive) sharing a "floating" IP address that moves to
              the backup if the main one dies.
            </li>
            <li>
              <strong>Multiple load balancers behind DNS or anycast.</strong>
            </li>
            <li>
              <strong>Managed cloud load balancers</strong> (AWS ALB/NLB, Google Cloud Load Balancing), which are
              already spread across many machines and zones for you.
            </li>
          </ul>
          <h3 id="global-vs-local-load-balancing">Global vs local load balancing</h3>
          <ul>
            <li>
              <strong>Global:</strong> choose the <strong>region or data centre</strong> (using GeoDNS, anycast or a
              global load balancer), as in post 11.
            </li>
            <li>
              <strong>Local:</strong> inside a data centre, choose the <strong>server</strong>.
            </li>
          </ul>
          <p>A request usually goes through both.</p>
          <h3 id="popular-tools">Popular tools</h3>
          <ul>
            <li>
              <strong>NGINX</strong> and <strong>HAProxy:</strong> open-source, extremely widely used, and can do L4 and
              L7.
            </li>
            <li>
              <strong>Envoy:</strong> a modern L7 proxy with advanced balancing, retries and observability. It's the
              base of many service meshes.
            </li>
            <li>
              <strong>Cloud:</strong> AWS ALB (L7) and NLB (L4), Google Cloud Load Balancing, Azure Load Balancer and
              Application Gateway.
            </li>
            <li>
              <strong>Kubernetes:</strong> Services and Ingress controllers use these same ideas.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>L4</strong> is fast and simple but "blind". <strong>L7</strong> is smart but costs more per
              request, and needs TLS termination.
            </li>
            <li>
              <strong>Smarter algorithms</strong> (least response time) react better, but need more tracking and can
              oscillate. Simple ones are predictable.
            </li>
            <li>
              <strong>Aggressive health checks</strong> find failures fast, but can remove servers that were only
              briefly slow. <strong>Relaxed</strong> ones are stable but slower to react.
            </li>
            <li>
              <strong>Sticky sessions</strong> are convenient for stateful apps, but cause uneven load and weaker
              failover.
            </li>
            <li>
              <strong>Each LB layer</strong> adds a network hop and a little latency.
            </li>
          </ul>
          <p>
            <strong>When not to use a load balancer:</strong> a small app on a single server. A load balancer in front
            of one server adds cost without adding much, until you add a second server or need zero-downtime deploys.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Google's Maglev.</strong> Google built its own software load balancer, called Maglev, which runs on
            ordinary servers instead of special hardware. It handles traffic for services like Search and Gmail, and
            uses a special form of consistent hashing so connections stay on the same backend even as machines come and
            go. Google published a paper about it in 2016.
          </p>
          <p>
            <strong>GitHub's load balancer.</strong> GitHub built and open-sourced its own load balancer system (GLB),
            designed so that servers can be added or removed, or the load balancers themselves updated, without dropping
            users' connections.
          </p>
          <p>
            <strong>AWS ALB and NLB.</strong> On AWS, most web apps use an <strong>Application Load Balancer</strong>{" "}
            (L7) to route by path or host to different services. Workloads needing raw TCP/UDP or extreme performance
            use a <strong>Network Load Balancer</strong> (L4).
          </p>
          <p>
            <strong>The deep health check trap.</strong> AWS has written in its Builders' Library about how health
            checks that depend on shared resources can cause every server to fail at once. That's why its advice
            includes "fail open" behaviour and keeping health checks focused on the server itself.
          </p>
          <p>
            <strong>Kubernetes everywhere.</strong> If you deploy an app on Kubernetes with three replicas behind a
            Service, you're using load balancing plus health checks (readiness probes) every day, often without thinking
            about it.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What's the difference between an L4 and an L7 load balancer?</>,
                a: (
                  <>
                    <p>
                      L4 forwards connections using only IPs and ports, so it's fast, cheap and protocol-agnostic. L7
                      terminates the connection and reads HTTP, so it can route by path, host or header, retry, and
                      balance individual requests — at more cost per request, and it needs the TLS certificate.
                    </p>
                  </>
                ),
              },
              {
                q: <>When would round robin be a bad choice?</>,
                a: (
                  <>
                    <p>
                      When request costs vary widely. A server that happens to get several slow reports keeps receiving
                      its turn anyway and piles up. Least connections, least response time or power-of-two-choices adapt
                      to real load.
                    </p>
                  </>
                ),
              },
              {
                q: <>Explain “power of two random choices”.</>,
                a: (
                  <>
                    <p>
                      Pick two servers at random and send the request to the less loaded one. It gets close to the ideal
                      least-loaded choice with almost no coordination, and avoids herding — every balancer rushing to
                      the same “least busy” server at once.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why can deep health checks cause outages?</>,
                a: (
                  <>
                    <p>
                      If they test shared dependencies, a single dependency hiccup fails every server's check at the
                      same moment and the balancer removes the whole fleet. Keep checks shallow, handle dependencies
                      with timeouts and fallbacks, and fail open when all targets look unhealthy.
                    </p>
                  </>
                ),
              },
              {
                q: <>Isn't the load balancer a single point of failure?</>,
                a: (
                  <>
                    <p>
                      Only if there's one. Run an active-passive pair with a floating IP, several balancers behind DNS
                      or anycast, or a managed cloud balancer that is already spread across machines and availability
                      zones.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is connection draining?</>,
                a: (
                  <>
                    <p>
                      When a server is being removed, the balancer stops sending it new requests but lets in-flight ones
                      finish for a grace period before taking it out, so deploys and scale-in don't cut users off
                      mid-request.
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
              A <strong>load balancer</strong> spreads traffic across servers, removes unhealthy ones, and enables
              zero-downtime deploys.
            </li>
            <li>
              <strong>L4</strong> routes by IP and port (fast, any protocol). <strong>L7</strong> reads HTTP (smart
              routing by URL and headers). Big systems often use both.
            </li>
            <li>
              Choose the <strong>algorithm</strong> to fit the workload:
              <ul>
                <li>
                  <strong>round robin</strong> for simple cases,
                </li>
                <li>
                  <strong>least connections</strong> or <strong>power of two choices</strong> for uneven requests,
                </li>
                <li>
                  <strong>consistent hashing</strong> to keep the same key on the same server.
                </li>
              </ul>
            </li>
            <li>
              Keep <strong>health checks</strong> focused on the server itself. <strong>Deep checks</strong> on shared
              dependencies can take everything down at once.
            </li>
            <li>Make the load balancer itself redundant (pairs, DNS/anycast, or a managed cloud LB).</li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Site Reliability Engineering</em> by Google (chapters "Load Balancing at the Frontend" and "Load
              Balancing in the Datacenter")
            </li>
            <li>The Maglev paper, "Maglev: A Fast and Reliable Software Network Load Balancer" (NSDI 2016)</li>
            <li>The System Design Primer on GitHub (section "Load balancer")</li>
            <li>The AWS Builders' Library article "Implementing health checks"</li>
            <li>The official HAProxy and NGINX load-balancing documentation</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
