import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { AsciiDiagram, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-46")!;

export const metadata: Metadata = {
  title: `Lesson 46 — ${lesson.title}`,
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

const code1 = `2027-03-08 10:42:13 ERROR Payment failed for user 42 order 5521 after 3012ms: card declined`;

const code2 = `{
  "timestamp": "2027-03-08T10:42:13.482Z",
  "level": "error",
  "service": "payment-service",
  "message": "payment failed",
  "user_id": 42,
  "order_id": "5521",
  "duration_ms": 3012,
  "error_code": "card_declined",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "version": "2027.03.08-1"
}`;

const diagram1 = `Trace 4bf92f35…  POST /checkout  (total 3,240 ms)
│
├─ api-gateway                      [■■                                    ]   12 ms
├─ cart-service: get cart           [ ■■■                                  ]   38 ms
│   └─ redis GET cart:42            [ ■                                    ]    2 ms
├─ pricing-service: calculate       [    ■■■■                              ]   61 ms
│   └─ postgres SELECT prices       [     ■■■                              ]   44 ms
├─ inventory-service: reserve       [        ■■■                           ]   40 ms
└─ payment-service: charge          [           ■■■■■■■■■■■■■■■■■■■■■■■■■■■] 3,012 ms  ← here!
    └─ HTTP POST payment-provider   [            ■■■■■■■■■■■■■■■■■■■■■■■■■■] 2,998 ms`;

const code3 = `traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             version-trace_id-parent_span_id-flags`;

export default function SdLessonFourSixPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            A customer writes in: "Checkout took 20 seconds and then failed." You look at your system. Checkout touches:
          </p>
          <ul>
            <li>the API gateway,</li>
            <li>the cart, pricing, inventory and payment services,</li>
            <li>a Kafka event,</li>
            <li>two databases and a Redis cache,</li>
            <li>a third-party payment provider.</li>
          </ul>
          <p>Which one was slow? Was it only this customer, or everyone? Did it start after this morning's deploy?</p>
          <p>
            With one server, you could SSH in and read the log file. With 40 services running on 300 containers that
            come and go, <strong>you can't</strong>. You need the system to <strong>tell you what it's doing</strong>.
            That's <strong>observability</strong>, and it's built on three kinds of data:{" "}
            <strong>logs, metrics and traces</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Think about how a <strong>hospital</strong> understands a patient.
          </p>
          <ul>
            <li>
              <strong>Metrics are the vital-signs monitor:</strong> heart rate, blood pressure, temperature, all numbers
              over time. You can see at a glance that something is wrong ("heart rate jumped to 140"), and set alarms.
            </li>
            <li>
              <strong>Logs are the doctor's and nurses' notes:</strong> detailed, timestamped entries. "10:42 patient
              reported chest pain; administered medication X." They tell you <strong>what happened</strong> in detail.
            </li>
            <li>
              <strong>Traces are like following one patient's whole journey</strong> through the hospital: reception →
              triage → X-ray → blood test → specialist → pharmacy, with how long each step took. They show{" "}
              <strong>where the time went</strong> for one specific case.
            </li>
          </ul>
          <p>
            You need all three. The monitor tells you <strong>something is wrong</strong>, the journey shows you{" "}
            <strong>where</strong>, and the notes tell you <strong>why</strong>.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="1-logs-detailed-records-of-events">1. Logs: detailed records of events</h3>
          <p>
            A <strong>log</strong> is a timestamped record of something that happened: a request, an error, a decision.
          </p>
          <p>
            <strong>Unstructured logs</strong> are hard for machines to use:
          </p>
          <CodeBlock code={code1} />
          <p>
            <strong>Structured logs</strong> (usually JSON) are much better:
          </p>
          <CodeBlock lang="json" code={code2} />
          <p>
            Now you can <strong>search and filter</strong> by any field ("all <code>error_code=card_declined</code> in
            the last hour, grouped by <code>version</code>").
          </p>
          <p>
            <strong>Logging best practices:</strong>
          </p>
          <ul>
            <li>
              <strong>Use log levels:</strong> <code>DEBUG</code> (development detail), <code>INFO</code> (normal
              events), <code>WARN</code> (unusual but handled), <code>ERROR</code> (something failed),{" "}
              <code>FATAL</code> (the service is crashing). In production, usually log at INFO and above.
            </li>
            <li>
              <strong>Include context:</strong> request ID, trace ID, user or tenant ID, service name, version, and
              duration.
            </li>
            <li>
              <strong>Use correlation IDs.</strong> Generate a <strong>request ID</strong> at the edge and pass it
              through every service (in headers), so you can find <strong>all</strong> log lines for one request across
              the whole system.
            </li>
            <li>
              <strong>Centralise logs.</strong> Ship logs from every container to one searchable place: the ELK/Elastic
              stack, OpenSearch, Grafana Loki, Splunk, Datadog or cloud logging services. Local log files on containers
              disappear when the container does.
            </li>
            <li>
              <strong>Never log secrets or sensitive data:</strong> passwords, tokens, full card numbers, OTPs. Be
              careful with personal data (Part 9). Mask or remove it.
            </li>
            <li>
              <strong>Watch the cost.</strong> Logging everything at high traffic can cost more than the servers
              themselves. <strong>Sample</strong> noisy success logs, keep errors, and set <strong>retention</strong>{" "}
              periods (for example, 7–30 days of searchable logs, and older ones archived in cheap object storage).
            </li>
          </ul>
          <h3 id="2-metrics-numbers-over-time">2. Metrics: numbers over time</h3>
          <p>
            A <strong>metric</strong> is a <strong>numeric measurement</strong> recorded over time, often with{" "}
            <strong>labels</strong> (also called dimensions or tags):
          </p>
          <Stats
            caption="The four metric types."
            stats={[
              { value: <>Counter</>, label: <>only goes up</>, sub: <>total requests — look at its rate</> },
              { value: <>Gauge</>, label: <>up and down</>, sub: <>memory, queue depth, connections</> },
              { value: <>Histogram</>, label: <>values in buckets</>, sub: <>latency → p95 / p99 (use this)</> },
              { value: <>Summary</>, label: <>client-side percentiles</>, sub: <>can't be combined across servers</> },
            ]}
          />
          <p>
            <strong>Metric types:</strong>
          </p>
          <ul>
            <li>
              <strong>Counter:</strong> only goes up (total requests, total errors). You usually look at its{" "}
              <strong>rate</strong> ("errors per second").
            </li>
            <li>
              <strong>Gauge:</strong> goes up and down (memory used, queue length, active connections, temperature).
            </li>
            <li>
              <strong>Histogram:</strong> counts values in <strong>buckets</strong> (for example, request durations
              under 50 ms, 100 ms, 250 ms…). This lets you compute <strong>percentiles</strong> like p95 and p99 (post
              8). <strong>Use histograms for latency</strong>, not averages.
            </li>
            <li>
              <strong>Summary:</strong> computes percentiles on the client side. Simpler, but summaries{" "}
              <strong>can't be combined</strong> across servers, so histograms are usually preferred.
            </li>
          </ul>
          <p>
            <strong>Why metrics are powerful:</strong>
          </p>
          <ul>
            <li>
              <strong>Cheap to store</strong>: a number every 10–60 seconds, no matter how much traffic there is.
            </li>
            <li>
              <strong>Fast to query</strong> over long periods ("show error rate for the last 30 days").
            </li>
            <li>
              <strong>Perfect for dashboards and alerts</strong>.
            </li>
          </ul>
          <p>
            <strong>The cardinality trap.</strong> Every <strong>unique combination of labels</strong> creates a
            separate time series:
          </p>
          <Stats
            caption="The cardinality trap. Every unique label combination is its own time series."
            stats={[
              { value: <>2,500 series</>, label: <>route × status × region</>, sub: <>50 × 10 × 5 — fine</> },
              { value: <>2.5 billion</>, label: <>× user_id (1 M)</>, sub: <>your metrics system falls over</> },
              { value: <>→ logs &amp; traces</>, label: <>where IDs belong</>, sub: <>never in metric labels</> },
            ]}
          />
          <p>
            <strong>Never use unbounded values</strong> (user IDs, order IDs, email addresses, full URLs with IDs) as
            metric labels. Put those in <strong>logs and traces</strong> instead.
          </p>
          <p>
            <strong>Pull vs push:</strong>
          </p>
          <ul>
            <li>
              <strong>Pull:</strong> the metrics system <strong>scrapes</strong> each service's <code>/metrics</code>{" "}
              endpoint every few seconds. <strong>Prometheus</strong> works this way.
            </li>
            <li>
              <strong>Push:</strong> services <strong>send</strong> metrics to a collector (StatsD, OpenTelemetry OTLP,
              many SaaS agents).
            </li>
          </ul>
          <h3 id="what-should-you-measure-three-proven-frameworks">What should you measure? Three proven frameworks</h3>
          <p>
            <strong>The Four Golden Signals</strong> (from Google's SRE book), for any user-facing service:
          </p>
          <ol>
            <li>
              <strong>Latency:</strong> how long requests take (and track failed requests' latency separately).
            </li>
            <li>
              <strong>Traffic:</strong> how much demand (requests per second).
            </li>
            <li>
              <strong>Errors:</strong> the rate of failed requests.
            </li>
            <li>
              <strong>Saturation:</strong> how "full" the service is (CPU, memory, queue depth, connection pool usage).
            </li>
          </ol>
          <p>
            <strong>The RED method</strong> (for request-driven services): <strong>R</strong>ate, <strong>E</strong>
            rrors, <strong>D</strong>uration.
          </p>
          <p>
            <strong>The USE method</strong> (Brendan Gregg, for resources like CPU, disks and network):{" "}
            <strong>U</strong>tilisation (how busy), <strong>S</strong>aturation (how much work is waiting),{" "}
            <strong>E</strong>rrors.
          </p>
          <p>
            A good default: <strong>RED for every service, USE for every resource, and business metrics</strong> like
            orders per minute, sign-ups and payment success rate. Business metrics often catch problems that technical
            metrics miss.
          </p>
          <h3 id="3-traces-following-one-request-across-services">3. Traces: following one request across services</h3>
          <p>
            A <strong>distributed trace</strong> records the <strong>full path</strong> of one request through all the
            services it touches, with timing for each step.
          </p>
          <ul>
            <li>
              A <strong>trace</strong> is the whole journey, identified by a <strong>trace ID</strong>.
            </li>
            <li>
              A <strong>span</strong> is one step in that journey (one service call, one database query), with a start
              time, a duration, attributes and a parent span.
            </li>
          </ul>
          <AsciiDiagram text={diagram1} />
          <p>
            One glance shows that <strong>the payment provider is the slow part</strong>, not your code.
          </p>
          <p>
            <strong>How it works: context propagation.</strong> When service A calls service B, it passes the trace ID
            and its own span ID in a header. The <strong>W3C Trace Context</strong> standard defines this header:
          </p>
          <CodeBlock code={code3} />
          <p>
            Service B continues the same trace, creating child spans. Context must also be passed through{" "}
            <strong>queues and events</strong> (put it in message headers), or traces break at async boundaries (Part
            6).
          </p>
          <p>
            <strong>Sampling.</strong> Recording every span for every request is expensive at high traffic. Options:
          </p>
          <ul>
            <li>
              <strong>Head sampling:</strong> decide at the start (for example, keep 1% of traces). Simple, but you
              might miss rare errors.
            </li>
            <li>
              <strong>Tail sampling:</strong> collect spans briefly, then decide <strong>after</strong> the request
              finishes, keeping <strong>all slow or failed traces</strong> plus a small share of normal ones. It's more
              useful, but needs more infrastructure.
            </li>
          </ul>
          <p>
            <strong>Tools:</strong> Jaeger, Zipkin, Grafana Tempo, and commercial tools like Datadog, Honeycomb, New
            Relic and Dynatrace.
          </p>
          <h3 id="opentelemetry-one-standard-for-all-three">OpenTelemetry: one standard for all three</h3>
          <p>
            <strong>OpenTelemetry (OTel)</strong> is an open, vendor-neutral standard (a Cloud Native Computing
            Foundation project) for producing and collecting <strong>traces, metrics and logs</strong>:
          </p>
          <ul>
            <li>
              <strong>SDKs and auto-instrumentation</strong> for most languages. Many frameworks, HTTP clients and
              database drivers are instrumented automatically.
            </li>
            <li>
              <strong>The OTel Collector</strong> receives, processes (samples, filters, removes sensitive fields) and{" "}
              <strong>exports</strong> data to whichever backends you choose.
            </li>
            <li>
              <strong>Standard names</strong> ("semantic conventions") for common attributes like{" "}
              <code>http.route</code> and <code>db.system</code>.
            </li>
          </ul>
          <Flow
            caption="Instrument once with OpenTelemetry, send anywhere."
            nodes={[
              { title: <>Services with the OTel SDK</>, desc: <>auto-instrumented HTTP, gRPC and database calls</> },
              {
                title: <>OTel Collector</>,
                desc: <>samples, filters, strips sensitive fields, batches</>,
                label: <>OTLP</>,
              },
              { title: <>Prometheus / Grafana</>, label: <>metrics</> },
              { title: <>Tempo / Jaeger</>, label: <>traces</> },
              { title: <>Loki / Elasticsearch</>, label: <>logs</> },
            ]}
          />
          <p>Instrument once with OpenTelemetry, and you can switch vendors without rewriting code.</p>
          <h3 id="connecting-the-three-pillars">Connecting the three pillars</h3>
          <SequenceDiagram
            caption="From alert to root cause by following IDs between the three pillars."
            actors={["On-call", "Metrics", "Traces", "Logs"]}
            messages={[
              { from: 1, to: 0, label: <>🔔 checkout p99 &gt; 2 s</> },
              { from: 0, to: 1, label: <>open latency histogram</> },
              { from: 1, to: 0, label: <>exemplar trace_id 4bf92f…</>, reply: true },
              { from: 0, to: 2, label: <>open trace 4bf92f…</> },
              { from: 2, to: 0, label: <>payment span = 3,012 ms of 3,240</>, reply: true },
              { from: 0, to: 3, label: <>filter trace_id = 4bf92f…</> },
              { from: 3, to: 0, label: <>“provider timeout, retrying”</>, reply: true },
            ]}
          />
          <p>
            The real power comes from <strong>linking</strong> them:
          </p>
          <ol>
            <li>
              An <strong>alert</strong> fires: "checkout p99 latency &gt; 2 s" (<strong>metric</strong>).
            </li>
            <li>
              You open the latency graph and click on an <strong>exemplar</strong>, a sample trace attached to a
              histogram bucket, to jump to a <strong>slow trace</strong>.
            </li>
            <li>
              The trace shows the <strong>payment span</strong> is slow. You click it to see its <strong>logs</strong>{" "}
              (they share the <code>trace_id</code>), which say "provider timeout, retrying".
            </li>
          </ol>
          <p>
            That path from <strong>metric → trace → logs</strong> takes minutes instead of hours, <strong>if</strong>{" "}
            you include trace IDs in logs and use consistent service names and labels everywhere.
          </p>
          <h3 id="monitoring-vs-observability">Monitoring vs observability</h3>
          <ul>
            <li>
              <strong>Monitoring</strong> answers <strong>known questions</strong>: "Is the error rate above 1%?", "Is
              the disk full?" You decide in advance what to watch.
            </li>
            <li>
              <strong>Observability</strong> is the ability to answer <strong>new questions you didn't plan for</strong>
              : "Why are checkouts slow only for Android users on app version 5.2 in Pune paying with a specific bank?"
            </li>
          </ul>
          <p>
            Good observability needs rich, <strong>high-cardinality</strong> context (user, device, version, region and
            so on) on <strong>events and traces</strong>, which you can slice any way during an investigation. Tools
            like Honeycomb popularised this "wide events" approach.
          </p>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>Logs:</strong> rich detail and flexible search, but <strong>expensive</strong> at volume, noisy,
              and a risk of leaking sensitive data.
            </li>
            <li>
              <strong>Metrics:</strong> cheap, fast, great for alerts and long-term trends, but{" "}
              <strong>low detail</strong> and cardinality limits. They can tell you <em>that</em> something is wrong,
              rarely <em>why</em>.
            </li>
            <li>
              <strong>Traces:</strong> the best tool for "where is the time going?" across services, but they need
              instrumentation everywhere and context propagation (including through queues), and sampling may miss
              cases.
            </li>
            <li>
              <strong>More telemetry:</strong> better visibility, but higher costs (storage, processing, vendor bills)
              and some performance overhead. <strong>Budget for it</strong>, and trim what you never use.
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Google's Dapper.</strong> Google described <strong>Dapper</strong>, its internal distributed tracing
            system, in a 2010 paper. It showed that tracing could run across Google's huge systems with very low
            overhead by using sampling. Dapper inspired <strong>Zipkin</strong> (built at Twitter) and{" "}
            <strong>Jaeger</strong> (built at Uber), which were both later open-sourced.
          </p>
          <p>
            <strong>Prometheus.</strong> Prometheus was built at <strong>SoundCloud</strong> in 2012, inspired by
            Google's internal monitoring, and became the second project (after Kubernetes) to graduate in the Cloud
            Native Computing Foundation. Together with <strong>Grafana</strong> for dashboards, it's one of the most
            common open-source monitoring setups today.
          </p>
          <p>
            <strong>OpenTelemetry's origins.</strong> OpenTelemetry was formed in 2019 by{" "}
            <strong>merging two earlier projects</strong>, OpenTracing and OpenCensus, to end the confusion of competing
            standards. It's now supported by nearly every observability vendor.
          </p>
          <p>
            <strong>Charity Majors and Honeycomb.</strong> Charity Majors and colleagues at Honeycomb helped popularise
            the modern meaning of "observability": being able to ask new questions of production using rich,
            high-cardinality event data. Their book <em>Observability Engineering</em> is a standard reference.
          </p>
          <p>
            <strong>Cost surprises.</strong> Many companies have written about their logging and monitoring bills
            growing faster than their infrastructure. Sampling, retention policies, dropping unused metrics and the OTel
            Collector's filtering have become essential cost controls.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>What are the three pillars of observability, and what does each answer?</>,
                a: (
                  <>
                    <p>
                      Metrics — numbers over time — answer “is something wrong, and how much?” and drive dashboards and
                      alerts. Traces — one request's path across services — answer “where is the time going?”. Logs —
                      detailed event records — answer “what exactly happened, and why?”.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why use histograms rather than averages for latency?</>,
                a: (
                  <>
                    <p>
                      Averages hide the tail. Histograms record counts per latency bucket, so you can compute p95 and
                      p99 and — unlike client-side summaries — merge them across servers.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is metric cardinality, and why does it matter?</>,
                a: (
                  <>
                    <p>
                      The number of unique label combinations; each one is a separate time series. Unbounded labels like
                      user_id or order_id create millions of series and overwhelm the metrics backend. Put such IDs in
                      logs and traces instead.
                    </p>
                  </>
                ),
              },
              {
                q: <>How does distributed tracing work across services and queues?</>,
                a: (
                  <>
                    <p>
                      Each hop propagates the trace context — trace ID and parent span ID, usually in the W3C
                      traceparent header — and creates child spans with timings. For async flows, the context must
                      travel in message headers, or the trace breaks at the queue.
                    </p>
                  </>
                ),
              },
              {
                q: <>Head sampling vs tail sampling?</>,
                a: (
                  <>
                    <p>
                      Head sampling decides at the start of a request (keep 1%) — cheap, but it can miss rare errors.
                      Tail sampling buffers spans and decides after the request finishes, keeping all slow or failed
                      traces plus a small share of normal ones — more useful, but it needs collector infrastructure.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's the difference between monitoring and observability?</>,
                a: (
                  <>
                    <p>
                      Monitoring checks known conditions you decided to watch in advance. Observability is being able to
                      answer new, unplanned questions about production by slicing rich, high-cardinality context on
                      events and traces.
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
              <strong>Logs</strong> say <strong>what happened</strong> in detail, <strong>metrics</strong> show{" "}
              <strong>trends and alerts</strong> as numbers over time, and <strong>traces</strong> show{" "}
              <strong>where time goes</strong> for one request across services.
            </li>
            <li>
              Use <strong>structured JSON logs</strong> with <strong>correlation/trace IDs</strong>, centralise them,
              and <strong>never log secrets</strong>.
            </li>
            <li>
              Use <strong>counters, gauges and histograms</strong> (histograms for latency and percentiles). Follow{" "}
              <strong>Golden Signals / RED / USE</strong>, and avoid <strong>high-cardinality labels</strong>.
            </li>
            <li>
              Tracing needs <strong>context propagation</strong> (W3C <code>traceparent</code>, including through
              queues) and smart <strong>sampling</strong> (keep slow and failed traces).
            </li>
            <li>
              Instrument with <strong>OpenTelemetry</strong>, and <strong>link the three pillars</strong> (metric →
              trace → logs) to go from "something's wrong" to "here's why" in minutes.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Site Reliability Engineering</em> by Google (chapter "Monitoring Distributed Systems", which
              introduces the Four Golden Signals)
            </li>
            <li>The OpenTelemetry documentation ("Concepts")</li>
            <li>
              The Prometheus documentation (overview, metric types, naming best practices, and "Histograms and
              summaries")
            </li>
            <li>The Dapper paper, "Dapper, a Large-Scale Distributed Systems Tracing Infrastructure" (Google, 2010)</li>
            <li>Brendan Gregg's article "The USE Method"</li>
            <li>The W3C Trace Context specification</li>
            <li>
              <em>Observability Engineering</em> by Charity Majors, Liz Fong-Jones and George Miranda
            </li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
