import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { AsciiDiagram, Flow, QA, Timeline } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-54")!;

export const metadata: Metadata = {
  title: `Lesson 54 — ${lesson.title}`,
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

const code1 = `PAYMENT_SERVICE_URL=http://10.0.4.17:8080`;

const diagram1 = `Service registry
┌──────────────────┬────────────────────┬──────────┐
│ service          │ instance address   │ health   │
├──────────────────┼────────────────────┼──────────┤
│ payment-service  │ 10.0.4.17:8080     │ ✅       │
│ payment-service  │ 10.0.7.23:8080     │ ✅       │
│ payment-service  │ 10.0.2.91:8080     │ ❌ failing│
│ order-service    │ 10.0.5.44:8080     │ ✅       │
└──────────────────┴────────────────────┴──────────┘`;

const code2 = `payment-service.payments.svc.cluster.local  →  10.96.12.40 (Kubernetes Service IP)`;

export default function SdLessonFiveFourPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            The order service needs to call the payment service. In the old days, you'd put its address in a config
            file:
          </p>
          <CodeBlock code={code1} />
          <p>But in a modern system:</p>
          <ul>
            <li>
              the payment service runs as <strong>12 containers</strong>, and auto-scaling adds and removes them all day
              (post 7),
            </li>
            <li>
              containers get <strong>new IP addresses</strong> every time they restart or are rescheduled,
            </li>
            <li>
              a deploy replaces <strong>every instance</strong> with new ones,
            </li>
            <li>
              some instances are <strong>unhealthy</strong> and shouldn't get traffic.
            </li>
          </ul>
          <p>
            A hard-coded IP is out of date within minutes. <strong>Service discovery</strong> is how services find the{" "}
            <strong>current, healthy</strong> addresses of the services they need.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about finding a <strong>doctor in a large hospital</strong>.
          </p>
          <ul>
            <li>
              You don't memorise which room Dr. Mehta is in today. Doctors move between rooms, shifts change, and some
              are on leave.
            </li>
            <li>
              Instead, you ask the <strong>reception desk</strong>, which keeps an up-to-date <strong>directory</strong>
              : "Cardiology? Dr. Mehta is in room 214 today; Dr. Rao is in room 216."
            </li>
            <li>
              When a doctor starts their shift, they <strong>check in</strong> with reception. When they leave, they{" "}
              <strong>check out</strong>. If a doctor doesn't respond to the pager, reception stops sending patients to
              them.
            </li>
          </ul>
          <p>Service discovery works the same way:</p>
          <ul>
            <li>
              A <strong>service registry</strong> is the directory of which instances of each service exist, where they
              are, and whether they're healthy.
            </li>
            <li>
              Services <strong>register</strong> when they start and <strong>deregister</strong> when they stop.
            </li>
            <li>
              <strong>Health checks</strong> remove instances that stop responding.
            </li>
            <li>
              Callers <strong>look up</strong> the service by <strong>name</strong> ("payment-service") instead of by
              IP.
            </li>
          </ul>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="the-service-registry">The service registry</h3>
          <AsciiDiagram text={diagram1} />
          <p>
            The registry must be <strong>highly available</strong>. If it's down, nobody can find anybody. So registries
            usually run as a replicated cluster, often using <strong>consensus</strong> (Raft) for consistency (post
            24).
          </p>
          <p>
            <strong>Popular registries:</strong>
          </p>
          <ul>
            <li>
              <strong>Consul</strong> (HashiCorp): service registry, health checks, DNS interface and key-value store.
            </li>
            <li>
              <strong>etcd</strong>: a consistent key-value store (the brain of Kubernetes).
            </li>
            <li>
              <strong>Apache ZooKeeper</strong>: older, used by many big-data systems.
            </li>
            <li>
              <strong>Netflix Eureka</strong>: built for AWS, favours availability over consistency.
            </li>
            <li>
              <strong>Kubernetes' built-in discovery</strong> (Services + DNS), the most common today.
            </li>
            <li>
              <strong>Cloud services</strong>: AWS Cloud Map, and similar.
            </li>
          </ul>
          <h3 id="how-instances-get-registered">How instances get registered</h3>
          <p>
            <strong>Self-registration.</strong> Each instance registers itself on startup, sends{" "}
            <strong>heartbeats</strong>, and deregisters on shutdown.
          </p>
          <ul>
            <li>✅ Simple.</li>
            <li>
              ❌ Every service needs registry code, and a crashed instance can't deregister itself. Heartbeat{" "}
              <strong>timeouts</strong> (TTLs) handle that.
            </li>
          </ul>
          <p>
            <strong>Third-party registration.</strong> The <strong>platform</strong> registers instances automatically.
            For example, Kubernetes knows exactly which pods are running and ready, and updates the service's endpoint
            list itself.
          </p>
          <ul>
            <li>✅ No code in the services, and always accurate.</li>
            <li>This is how most modern platforms work.</li>
          </ul>
          <h3 id="health-checks">Health checks</h3>
          <p>
            Only <strong>healthy</strong> instances should receive traffic:
          </p>
          <ul>
            <li>
              the registry or platform <strong>polls</strong> a health endpoint (<code>/health</code>,{" "}
              <code>/ready</code>),
            </li>
            <li>
              or instances send <strong>heartbeats</strong> within a TTL,
            </li>
            <li>
              instances that fail are <strong>removed</strong> from the list until they recover.
            </li>
          </ul>
          <p>
            As in post 12: keep health checks focused on <strong>the instance itself</strong>. A deep check that fails
            whenever a shared dependency hiccups can remove <strong>every</strong> instance at once.
          </p>
          <h3 id="client-side-discovery">Client-side discovery</h3>
          <p>
            The <strong>caller</strong> asks the registry for the list of instances, and{" "}
            <strong>chooses one itself</strong> (load balancing in the client):
          </p>
          <SequenceDiagram
            caption="Client-side discovery. The caller asks the registry, then balances across instances itself."
            actors={["Order service", "Registry", "Payment 10.0.4.17", "Payment 10.0.7.23"]}
            messages={[
              { from: 0, to: 1, label: <>where is payment-service?</> },
              { from: 1, to: 0, label: <>[10.0.4.17, 10.0.7.23] (healthy only)</>, reply: true },
              { from: 0, to: 3, label: <>POST /charge</>, note: <>picked by round robin / least-loaded</> },
              { from: 3, to: 0, label: <>200 OK</>, reply: true },
            ]}
          />
          <ul>
            <li>
              ✅ <strong>No extra hop</strong>, and the client can use smart balancing (like least-requests, or zone
              awareness).
            </li>
            <li>
              ✅ Works well with <strong>gRPC</strong>, which needs per-request balancing on long-lived connections
              (post 31).
            </li>
            <li>
              ❌ <strong>Every client</strong> needs discovery and balancing logic, in every language you use.
            </li>
            <li>
              Example: Netflix's <strong>Eureka + Ribbon</strong> setup, and gRPC's built-in name resolvers and
              balancers.
            </li>
          </ul>
          <h3 id="server-side-discovery">Server-side discovery</h3>
          <p>
            The caller sends requests to a <strong>load balancer or router</strong> at a stable address, and{" "}
            <strong>the router</strong> looks up the registry and forwards:
          </p>
          <Flow
            caption="Server-side discovery. The caller uses one stable address; the router does the lookup."
            dir="row"
            nodes={[
              { title: <>Order service</> },
              { title: <>Load balancer / router</>, desc: <>stable address</> },
              { title: <>Registry</>, desc: <>looked up by the router</> },
              { title: <>Payment instance</>, tone: "good" },
            ]}
          />
          <ul>
            <li>
              ✅ <strong>Clients stay simple.</strong> They just call one address.
            </li>
            <li>✅ Centralised control of balancing and routing.</li>
            <li>
              ❌ <strong>An extra network hop</strong>, and the router must itself be highly available.
            </li>
            <li>
              Examples: <strong>AWS load balancers</strong> with target groups, and <strong>Kubernetes Services</strong>{" "}
              (kube-proxy routes a virtual IP to pods).
            </li>
          </ul>
          <h3 id="dns-based-discovery">DNS-based discovery</h3>
          <p>
            The simplest interface: look up the service <strong>by name through DNS</strong>, and get back IP addresses.
          </p>
          <CodeBlock code={code2} />
          <p>
            <strong>In Kubernetes:</strong>
          </p>
          <ul>
            <li>
              a <strong>Service</strong> gives a set of pods a <strong>stable name and virtual IP</strong>,
            </li>
            <li>
              cluster DNS (CoreDNS) resolves <code>payment-service</code> (within the same namespace) or{" "}
              <code>payment-service.payments.svc.cluster.local</code>,
            </li>
            <li>
              traffic to the Service IP is spread across <strong>ready</strong> pods,
            </li>
            <li>
              "headless" Services return <strong>individual pod IPs</strong>, for client-side balancing or stateful
              apps.
            </li>
          </ul>
          <p>
            <strong>DNS pitfalls</strong> (post 1):
          </p>
          <ul>
            <li>
              <strong>Caching:</strong> clients and language runtimes may cache DNS answers longer than you expect, and
              keep calling old, removed instances. Keep TTLs low and check your runtime's DNS caching behaviour.
            </li>
            <li>
              <strong>DNS gives addresses, not health or load.</strong> It relies on the platform keeping records up to
              date.
            </li>
            <li>
              <strong>SRV records</strong> can include ports, but not every client supports them.
            </li>
          </ul>
          <h3 id="service-mesh-discovery">Service mesh discovery</h3>
          <p>
            In a <strong>service mesh</strong> (Istio, Linkerd, Consul Connect), a <strong>sidecar proxy</strong> (often{" "}
            <strong>Envoy</strong>) runs next to each service. The mesh's <strong>control plane</strong> watches the
            registry (usually Kubernetes) and pushes up-to-date endpoint lists to every sidecar (Envoy calls these APIs{" "}
            <strong>xDS</strong>).
          </p>
          <Flow
            caption="Service-mesh discovery. Sidecars do discovery, balancing, retries and mTLS; the app just calls a name."
            nodes={[
              {
                title: <>Order service</>,
                desc: (
                  <>
                    calls{" "}
                    <a href="http://payment-service" target="_blank" rel="noopener noreferrer">
                      http://payment-service
                    </a>
                  </>
                ),
              },
              { title: <>Envoy sidecar</>, desc: <>knows every healthy endpoint, balances, retries, encrypts</> },
              { title: <>Envoy sidecar</>, desc: <>verifies the caller's identity</>, label: <>mTLS</> },
              { title: <>Payment service</>, tone: "good" },
              {
                title: <>Control plane (Istio)</>,
                desc: <>pushes endpoints, routes and certificates to every sidecar via xDS</>,
              },
            ]}
          />
          <p>
            Your application code just calls <code>http://payment-service</code>. The sidecar handles discovery, load
            balancing, retries, timeouts, circuit breaking, mTLS (post 51) and metrics (post 46).
          </p>
          <h3 id="making-deploys-and-shutdowns-safe">Making deploys and shutdowns safe</h3>
          <Timeline
            caption="Removing an instance without a single failed request."
            events={[
              { time: <>t = 0</>, text: <>mark not-ready — the readiness probe fails</> },
              { time: <>0–5 s</>, text: <>preStop sleep while discovery and load balancers stop routing to it</> },
              { time: <>5–30 s</>, text: <>drain in-flight requests; finish open connections</> },
              {
                time: <>t = 30 s</>,
                text: <>the process exits cleanly (terminationGracePeriodSeconds)</>,
                tone: "good",
              },
            ]}
          />
          <p>When an instance is being removed (a deploy, scale-down or node drain):</p>
          <ol>
            <li>
              <strong>Mark it not-ready</strong>, so it's removed from discovery and load balancers{" "}
              <strong>first</strong>,
            </li>
            <li>
              <strong>wait</strong> for discovery to update everywhere (a few seconds),
            </li>
            <li>
              <strong>drain</strong> in-flight requests, and let existing connections finish,
            </li>
            <li>
              <strong>then</strong> stop the process.
            </li>
          </ol>
          <p>
            In Kubernetes, this means <strong>readiness probes</strong>, a <code>preStop</code> hook with a short sleep,
            and a sensible <code>terminationGracePeriodSeconds</code>. Without this, callers keep sending requests to a
            pod that's already shutting down, and users see errors on <strong>every deploy</strong>.
          </p>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Client-side discovery:</strong> no extra hop and smart balancing, but logic in every client and
              every language.
            </li>
            <li>
              <strong>Server-side discovery:</strong> simple clients, but an extra hop and another component to keep
              available.
            </li>
            <li>
              <strong>DNS-based:</strong> universal and simple, but caching delays, and no health or load information.
            </li>
            <li>
              <strong>Service mesh:</strong> powerful, consistent and language-independent, but significant complexity,
              resource overhead (a sidecar per pod) and a learning curve.
            </li>
            <li>
              <strong>Strongly consistent registries</strong> (etcd, Consul, ZooKeeper) are accurate, but may refuse
              updates during partitions. <strong>Availability-first registries</strong> (Eureka) keep serving possibly
              stale lists (CAP, post 27).
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Kubernetes Services and DNS.</strong> For most teams today, service discovery is simply{" "}
            <strong>Kubernetes</strong>: every Service gets a DNS name, and traffic is routed to ready pods. Most
            developers use it daily without thinking of it as "service discovery".
          </p>
          <p>
            <strong>Netflix Eureka.</strong> Netflix built Eureka as its service registry on AWS, designed to{" "}
            <strong>stay available</strong> during network problems even if its data is slightly stale. Netflix judged
            that calling a possibly-outdated instance (and retrying) was better than having no directory at all. It's a
            deliberate AP choice (post 27).
          </p>
          <p>
            <strong>Airbnb's SmartStack.</strong> Airbnb built and open-sourced <strong>SmartStack</strong> (around
            2013), which used ZooKeeper plus a local HAProxy on each machine: an early version of the sidecar idea that
            service meshes later made standard.
          </p>
          <p>
            <strong>HashiCorp Consul</strong> is widely used for service discovery across mixed environments (VMs,
            containers and multiple data centres), with health checks and a DNS interface so even legacy apps can
            discover services by name.
          </p>
          <p>
            <strong>Envoy's xDS APIs</strong> have become a de facto standard for pushing discovery and routing
            configuration to proxies. They're used by Istio and many other control planes.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Why do microservices need service discovery?</>,
                a: (
                  <>
                    <p>
                      Instances come and go constantly with auto-scaling, deploys and rescheduling, each with a new IP,
                      and some are unhealthy. Callers need an up-to-date list of healthy instances addressed by service
                      name, not hard-coded IPs.
                    </p>
                  </>
                ),
              },
              {
                q: <>Client-side vs server-side discovery?</>,
                a: (
                  <>
                    <p>
                      Client-side: the caller queries the registry and load-balances itself — no extra hop and smarter
                      balancing, but logic in every client library. Server-side: the caller hits a stable load balancer
                      or router that does the lookup — simple clients, at the cost of an extra hop and a component to
                      keep available.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are the limitations of DNS-based discovery?</>,
                a: (
                  <>
                    <p>
                      Clients and resolvers cache answers, so changes and failed instances take time to disappear; DNS
                      carries no health or load information; and many clients resolve once and reuse the connection.
                      Kubernetes avoids some of this with stable virtual Service IPs.
                    </p>
                  </>
                ),
              },
              {
                q: <>How does a service mesh handle discovery?</>,
                a: (
                  <>
                    <p>
                      A control plane watches the platform's endpoints and pushes them, plus routing rules and
                      certificates, to a sidecar proxy next to every service. The app calls a name; the sidecar handles
                      discovery, balancing, retries, timeouts and mTLS consistently in every language.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you avoid errors during deploys with discovery?</>,
                a: (
                  <>
                    <p>
                      Fail readiness first, wait for discovery and balancers to stop routing to the instance (a preStop
                      delay), drain in-flight requests, then exit — with a termination grace period long enough for all
                      of that.
                    </p>
                  </>
                ),
              },
              {
                q: <>Should a service registry be CP or AP?</>,
                a: (
                  <>
                    <p>
                      It depends on what's worse. Netflix's Eureka is AP — a possibly stale list beats no list, and
                      clients retry. Consul, etcd and ZooKeeper are CP — accurate, but they may refuse updates during a
                      partition.
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
              In dynamic environments, IPs change constantly. <strong>Service discovery</strong> lets services find{" "}
              <strong>current, healthy</strong> instances <strong>by name</strong>.
            </li>
            <li>
              A <strong>service registry</strong> (Kubernetes, Consul, etcd, Eureka) tracks instances. Registration is{" "}
              <strong>self</strong> (with heartbeats and TTLs) or <strong>third-party</strong> (the platform does it).
            </li>
            <li>
              <strong>Client-side discovery</strong> means the client picks an instance.{" "}
              <strong>Server-side discovery</strong> means a router or LB picks. <strong>DNS</strong> is the simplest
              interface, and <strong>service meshes</strong> push endpoints to sidecars.
            </li>
            <li>
              <strong>Health checks</strong> keep bad instances out. Keep them shallow, and beware DNS caching.
            </li>
            <li>
              <strong>Deregister before shutdown:</strong> readiness → wait → drain → stop, so deploys don't cause
              errors.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              microservices.io patterns "Client-side discovery", "Server-side discovery", "Service registry" and "Self
              registration"
            </li>
            <li>The Kubernetes documentation "Service" and "DNS for Services and Pods"</li>
            <li>The HashiCorp Consul documentation on service discovery</li>
            <li>The etcd documentation</li>
            <li>The Envoy documentation on service discovery and the xDS protocol</li>
            <li>The System Design Primer on GitHub (section "Service discovery")</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
