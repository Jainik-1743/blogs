import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Compare, Flow, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-13")!;

export const metadata: Metadata = {
  title: `Lesson 13 — ${lesson.title}`,
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

export default function SdLessonOneThreePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            You'll hear three terms used almost interchangeably: <strong>reverse proxy</strong>,{" "}
            <strong>load balancer</strong> and <strong>API gateway</strong>. NGINX is called all three. So is Envoy.
            Architecture diagrams show one, two or all three boxes.
          </p>
          <p>
            This confusion matters. If you don't know what each one is <em>for</em>, you might put authentication in
            five different places, or none. You might add a gateway you don't need, or miss the one feature (like rate
            limiting) that would have prevented an outage.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about a <strong>large office building</strong>.
          </p>
          <ul>
            <li>
              A <strong>forward proxy</strong> is like an assistant who makes calls <strong>on your behalf</strong>. The
              outside world sees the assistant's number, not yours. (It works <em>for the client</em>.)
            </li>
            <li>
              A <strong>reverse proxy</strong> is the building's <strong>reception desk</strong>. Visitors never walk
              straight into offices. They talk to reception, which forwards them to the right place, checks that
              visitors aren't carrying anything dangerous, and hides the internal layout. (It works{" "}
              <em>for the servers</em>.)
            </li>
            <li>
              A <strong>load balancer</strong> is a receptionist whose main job is to{" "}
              <strong>spread visitors evenly</strong> across several identical offices.
            </li>
            <li>
              An <strong>API gateway</strong> is a <strong>security-and-concierge desk</strong> for a building full of{" "}
              <em>different</em> companies. It checks your ID badge, makes sure you haven't visited too many times
              today, sends you to the right company's floor, and logs every visit.
            </li>
          </ul>
          <p>
            They overlap a lot, and one piece of software can play several roles. But the <strong>job</strong> is
            different.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="forward-proxy-vs-reverse-proxy">Forward proxy vs reverse proxy</h3>
          <Compare
            caption="Same idea — a middleman — pointed in opposite directions."
            columns={[
              {
                title: <>Forward proxy — acts for clients</>,
                items: [
                  { sign: "·", text: <>Employee laptops → corporate proxy → internet</> },
                  { sign: "·", text: <>Sites see the proxy, not the laptops</> },
                ],
                verdict: <>Web filters, school networks, privacy tools</>,
              },
              {
                title: <>Reverse proxy — acts for servers</>,
                items: [
                  { sign: "·", text: <>Internet users → reverse proxy → internal servers</> },
                  { sign: "·", text: <>Users see the proxy, not the servers</> },
                ],
                verdict: <>Almost every production website</>,
              },
            ]}
          />
          <ul>
            <li>
              <strong>Forward proxies:</strong> corporate web filters, school networks, VPN-like privacy tools.
            </li>
            <li>
              <strong>Reverse proxies:</strong> almost every production website.
            </li>
          </ul>
          <h3 id="what-a-reverse-proxy-does">What a reverse proxy does</h3>
          <p>
            A reverse proxy sits in front of one or more servers and handles common chores so your app doesn't have to:
          </p>
          <ul>
            <li>
              <strong>TLS termination.</strong> Handles HTTPS certificates and encryption (post 3).
            </li>
            <li>
              <strong>Compression.</strong> Gzip or Brotli responses to save bandwidth.
            </li>
            <li>
              <strong>Serving static files.</strong> Sends <code>/static/app.js</code> straight from disk, very fast,
              without touching your app.
            </li>
            <li>
              <strong>Caching.</strong> Keeps copies of responses so repeated requests are answered instantly.
            </li>
            <li>
              <strong>Request buffering.</strong> Absorbs slow clients (someone on a weak mobile connection), so your
              app servers aren't tied up waiting.
            </li>
            <li>
              <strong>Security.</strong> Hides server IPs and versions, blocks bad requests, limits request sizes, and
              can add a web application firewall (WAF).
            </li>
            <li>
              <strong>Routing.</strong> <code>/blog</code> → the blog server, <code>/app</code> → the app server.
            </li>
            <li>
              <strong>Load balancing</strong> across several backends.
            </li>
          </ul>
          <p>A typical setup for a Node.js or Python app:</p>
          <Flow
            caption="Even with one app server, a reverse proxy takes the chores off your code."
            nodes={[
              {
                title: <>Internet</>,
                desc: (
                  <>
                    <a href="https://yoursite.com" target="_blank" rel="noopener noreferrer">
                      https://yoursite.com
                    </a>
                  </>
                ),
              },
              {
                title: <>NGINX on :443</>,
                desc: <>TLS · gzip/Brotli · serves /static from disk · buffers slow clients</>,
              },
              {
                title: <>Node.js on localhost:3000</>,
                desc: <>spends its time on business logic</>,
                label: <>/api/* only</>,
                tone: "good",
              },
            ]}
          />
          <p>
            Even with just <strong>one</strong> app server, a reverse proxy is useful.
          </p>
          <h3 id="load-balancer-vs-reverse-proxy">Load balancer vs reverse proxy</h3>
          <ul>
            <li>
              <strong>A load balancer's main job</strong> is spreading traffic across{" "}
              <strong>many copies of the same service</strong> and removing unhealthy ones.
            </li>
            <li>
              <strong>A reverse proxy's main job</strong> is standing in front of servers and{" "}
              <strong>handling HTTP chores</strong>. It may or may not balance load.
            </li>
          </ul>
          <p>
            Most modern L7 load balancers <strong>are</strong> reverse proxies (NGINX, HAProxy, Envoy, AWS ALB). The
            difference is in emphasis, not in the software.
          </p>
          <h3 id="what-an-api-gateway-does">What an API gateway does</h3>
          <p>
            An <strong>API gateway</strong> is a reverse proxy specialised for <strong>APIs</strong>, especially when
            there are <strong>many backend services</strong> (microservices). On top of reverse-proxy features, it
            usually adds:
          </p>
          <ul>
            <li>
              <strong>Authentication and authorisation.</strong> Validates API keys, JWTs or OAuth tokens once, at the
              front door.
            </li>
            <li>
              <strong>Rate limiting and quotas.</strong> "Free plan: 100 requests per minute".
            </li>
            <li>
              <strong>Routing to many services.</strong> <code>/users</code> → user service, <code>/orders</code> →
              order service, <code>/payments</code> → payment service.
            </li>
            <li>
              <strong>Request and response transformation.</strong> Rename fields, convert protocols (REST to gRPC),
              combine responses.
            </li>
            <li>
              <strong>API versioning.</strong> <code>/v1/*</code> → the old service, <code>/v2/*</code> → the new one.
            </li>
            <li>
              <strong>Analytics, logging and monitoring</strong> per API, per customer, per endpoint.
            </li>
            <li>
              <strong>A developer portal and API keys</strong> for external developers (in commercial gateways).
            </li>
          </ul>
          <Flow
            caption="An API gateway does the cross-cutting work once, at the front door, for every service behind it."
            nodes={[
              { title: <>Mobile app · Web app · Partners</>, desc: <>three kinds of clients, one entry point</> },
              { title: <>API gateway</>, desc: <>authenticate token → check rate limit / quota → route → log</> },
              { title: <>User service</>, label: <>/users</> },
              { title: <>Order service</>, label: <>/orders</> },
              { title: <>Payment service</>, label: <>/payments</> },
            ]}
          />
          <p>
            Without a gateway, <strong>every</strong> service would have to validate tokens, apply rate limits and log
            requests itself: duplicated code, done inconsistently.
          </p>
          <h3 id="backend-for-frontend-bff">Backend for Frontend (BFF)</h3>
          <p>Different clients need different data:</p>
          <ul>
            <li>
              a mobile app on a slow network wants <strong>small, combined responses</strong>,
            </li>
            <li>
              a web dashboard wants <strong>lots of detail</strong>,
            </li>
            <li>a smart TV app wants something else again.</li>
          </ul>
          <p>
            The <strong>BFF pattern</strong> gives each client type its <strong>own small gateway/API layer</strong>:
          </p>
          <Flow
            caption="Backend for Frontend — each client type gets its own thin API layer."
            dir="row"
            nodes={[
              { title: <>Mobile app</> },
              { title: <>Mobile BFF</>, desc: <>small, combined responses</> },
              { title: <>Services</>, desc: <>user · order · product</> },
              { title: <>Web BFF</>, desc: <>rich, detailed responses</> },
              { title: <>Web app</> },
            ]}
          />
          <p>
            Each BFF combines several backend calls into exactly what its client needs. The frontend team often owns its
            BFF, so they can move fast without changing every backend service.
          </p>
          <h3 id="service-mesh-the-internal-version">Service mesh: the internal version</h3>
          <p>
            Gateways handle traffic <strong>coming into</strong> your system (called north-south traffic). Inside a
            large microservices system, services also call each other constantly (east-west traffic).
          </p>
          <p>
            A <strong>service mesh</strong> (like Istio or Linkerd) puts a small proxy, a <strong>sidecar</strong>, next
            to every service. These sidecars handle retries, timeouts, encryption (mTLS) and metrics for
            service-to-service calls. It's the same idea as a reverse proxy, spread across the whole system. We'll
            revisit this in Part 10.
          </p>
          <h3 id="popular-tools">Popular tools</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>Common role</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>NGINX</strong>
                  </td>
                  <td>Reverse proxy, load balancer, static files; also used as a gateway</td>
                </tr>
                <tr>
                  <td>
                    <strong>HAProxy</strong>
                  </td>
                  <td>High-performance load balancer / reverse proxy</td>
                </tr>
                <tr>
                  <td>
                    <strong>Envoy</strong>
                  </td>
                  <td>Modern L7 proxy; base of many gateways and service meshes</td>
                </tr>
                <tr>
                  <td>
                    <strong>Traefik, Caddy</strong>
                  </td>
                  <td>Reverse proxies with automatic HTTPS and easy container setup</td>
                </tr>
                <tr>
                  <td>
                    <strong>Kong, Tyk, Apache APISIX</strong>
                  </td>
                  <td>API gateways, often built on NGINX or Envoy</td>
                </tr>
                <tr>
                  <td>
                    <strong>AWS API Gateway, Azure API Management, Google Apigee</strong>
                  </td>
                  <td>Managed API gateways</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 id="where-should-logic-live">Where should logic live?</h3>
          <p>
            Put <strong>cross-cutting, generic</strong> concerns in the gateway:
          </p>
          <ul>
            <li>authentication (is this token valid?),</li>
            <li>rate limiting,</li>
            <li>routing,</li>
            <li>logging,</li>
            <li>CORS headers.</li>
          </ul>
          <p>
            Keep <strong>business logic</strong> in the services:
          </p>
          <ul>
            <li>"can this user cancel this order?",</li>
            <li>pricing rules,</li>
            <li>validation specific to a feature.</li>
          </ul>
          <p>
            A gateway full of business rules becomes a <strong>bottleneck that every team must change</strong>, the
            opposite of what microservices are meant to achieve.
          </p>
          <Compare
            caption="Where should each piece of logic live?"
            columns={[
              {
                title: <>In the gateway — generic</>,
                items: [
                  { sign: "+", text: <>Is this token valid?</> },
                  { sign: "+", text: <>Rate limits and quotas</> },
                  { sign: "+", text: <>Routing, versioning (/v1, /v2)</> },
                  { sign: "+", text: <>Logging, CORS headers</> },
                ],
              },
              {
                title: <>In the services — business</>,
                items: [
                  { sign: "+", text: <>Can this user cancel this order?</> },
                  { sign: "+", text: <>Pricing and discount rules</> },
                  { sign: "+", text: <>Feature-specific validation</> },
                  { sign: "-", text: <>Business rules in the gateway make it a bottleneck every team must change</> },
                ],
              },
            ]}
          />
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>An extra hop.</strong> Every proxy or gateway adds a little latency (usually a millisecond or
              two).
            </li>
            <li>
              <strong>A single point of failure</strong> if it isn't run as several redundant instances.
            </li>
            <li>
              <strong>Centralised power.</strong> A misconfiguration in the gateway can break <em>every</em> API at
              once.
            </li>
            <li>
              <strong>The risk of a "smart gateway".</strong> Too much logic makes it slow to change and hard to test.
            </li>
            <li>
              <strong>Cost and complexity.</strong> For a single small app, NGINX in front is plenty. A full API gateway
              product can be overkill.
            </li>
          </ul>
          <p>
            <strong>When not to use an API gateway:</strong> a monolith with one client, or an internal tool with a few
            users. A simple reverse proxy covers TLS, compression and routing. Add a gateway when you have{" "}
            <strong>multiple services, multiple clients, or external developers</strong> who need keys and quotas.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Netflix Zuul.</strong> Netflix built Zuul as the front door for all requests from devices to its
            backend. It handled routing, authentication, monitoring and resilience features, and was open-sourced. It's
            one of the best-known examples of an API gateway in a large microservices system.
          </p>
          <p>
            <strong>Lyft and Envoy.</strong> Envoy was created at Lyft to handle both edge traffic and
            service-to-service traffic as the company moved to microservices. It was later donated to the Cloud Native
            Computing Foundation and now powers many gateways and service meshes, including Istio.
          </p>
          <p>
            <strong>SoundCloud and BFF.</strong> SoundCloud is often credited with popularising the Backend-for-Frontend
            idea while moving away from a single large app, giving each client (web, iOS, Android) an API layer tailored
            to it.
          </p>
          <p>
            <strong>Stripe, GitHub and other public APIs.</strong> Public APIs that issue API keys, enforce rate limits
            per plan and show usage analytics are doing the work of an API gateway, whether it's a commercial product or
            something built in-house.
          </p>
          <p>
            <strong>Your own deployments.</strong> If you've put NGINX in front of a Node.js app, used Traefik with
            Docker, or deployed to a platform that "just gives you HTTPS", you've already used a reverse proxy.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What's the difference between a reverse proxy and an API gateway?</>,
                a: (
                  <>
                    <p>
                      A reverse proxy sits in front of servers and handles HTTP chores: TLS, compression, caching,
                      static files, routing. An API gateway is a reverse proxy specialised for APIs across many
                      services, adding authentication, rate limits and quotas, versioning, transformations and
                      per-client analytics.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why put authentication in the gateway?</>,
                a: (
                  <>
                    <p>
                      So tokens are validated once, consistently, before any service is reached, instead of every team
                      reimplementing it slightly differently. Services still perform authorisation for their own
                      business rules, like “can this user cancel this order?”.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is the BFF pattern, and when would you use it?</>,
                a: (
                  <>
                    <p>
                      Backend for Frontend gives each client type — mobile, web, TV — its own thin API layer that
                      aggregates backend calls into exactly the shape that client needs. Use it when clients' needs
                      diverge and one generic API forces over-fetching or many round trips.
                    </p>
                  </>
                ),
              },
              {
                q: <>North-south vs east-west traffic?</>,
                a: (
                  <>
                    <p>
                      North-south is traffic entering or leaving your system from clients, handled by gateways and edge
                      proxies. East-west is service-to-service traffic inside it, often handled by a service mesh with
                      sidecar proxies doing retries, timeouts, mTLS and metrics.
                    </p>
                  </>
                ),
              },
              {
                q: <>When don't you need an API gateway?</>,
                a: (
                  <>
                    <p>
                      A monolith with one client or a small internal tool. A plain reverse proxy like NGINX covers TLS,
                      compression and routing. Add a gateway when you have many services, many clients, or external
                      developers who need keys and quotas.
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
              A <strong>forward proxy</strong> acts for <strong>clients</strong>. A <strong>reverse proxy</strong> acts
              for <strong>servers</strong>: TLS, compression, caching, static files, routing, security.
            </li>
            <li>
              A <strong>load balancer</strong> focuses on spreading traffic across copies of a service. Most L7 load
              balancers are also reverse proxies.
            </li>
            <li>
              An <strong>API gateway</strong> is a reverse proxy for APIs, adding{" "}
              <strong>auth, rate limits, routing to many services, transformations and analytics</strong>.
            </li>
            <li>
              The <strong>BFF</strong> pattern gives each client type its own tailored API layer. A{" "}
              <strong>service mesh</strong> applies proxy ideas to internal traffic.
            </li>
            <li>
              Put <strong>generic concerns</strong> in the gateway and <strong>business logic</strong> in the services.
              Keep gateways redundant and simple.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The System Design Primer on GitHub (section "Reverse proxy (web server)")</li>
            <li>microservices.io by Chris Richardson (the "API Gateway" and "Backends for Frontends" patterns)</li>
            <li>
              Azure Architecture Center (the "Gateway Routing", "Gateway Offloading" and "Backends for Frontends"
              patterns)
            </li>
            <li>Sam Newman's article "Backends For Frontends"</li>
            <li>The official NGINX reverse proxy guide and Envoy documentation</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
