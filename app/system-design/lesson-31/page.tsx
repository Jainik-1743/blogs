import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Compare, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-31")!;

export const metadata: Metadata = {
  title: `Lesson 31 — ${lesson.title}`,
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

const code1 = `response = inventory.CheckStock(product_id="991", quantity=2)`;

const code2 = `syntax = "proto3";

package inventory.v1;

service InventoryService {
  rpc CheckStock (CheckStockRequest) returns (CheckStockResponse);
  rpc WatchStock (WatchStockRequest) returns (stream StockUpdate);   // server streaming
}

message CheckStockRequest {
  string product_id = 1;
  int32  quantity   = 2;
}

message CheckStockResponse {
  bool   available       = 1;
  int32  units_in_stock  = 2;
  string warehouse_id    = 3;
}`;

const code3 = `message CheckStockResponse {
  reserved 3;
  reserved "warehouse_id";
  bool  available      = 1;
  int32 units_in_stock = 2;
}`;

export default function SdLessonThreeOnePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            Your company has grown from one app into 40 internal services. A single "open product page" request now
            triggers <strong>dozens of service-to-service calls</strong>: pricing, stock, reviews, recommendations,
            delivery estimates. Each call:
          </p>
          <ul>
            <li>sends JSON, a text format that's verbose and slow to parse,</li>
            <li>has a contract that lives only in a wiki page nobody updates,</li>
            <li>and breaks silently when one team renames a field.</li>
          </ul>
          <p>
            At millions of requests per second, the CPU spent just <strong>encoding and decoding JSON</strong> becomes a
            real cost. And the "contract drift" bugs keep coming.
          </p>
          <p>
            <strong>gRPC</strong> with <strong>Protocol Buffers</strong> was designed for exactly this:{" "}
            <strong>fast, strongly-typed communication between services</strong>, with contracts written as code.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>Think about the difference between two ways of sending instructions to a colleague.</p>
          <p>
            <strong>Writing a letter in plain language (REST + JSON).</strong> It's flexible and anyone can read it, but
            it's long, the reader has to interpret it, and misunderstandings happen ("did you mean the <em>delivery</em>{" "}
            date or the <em>order</em> date?").
          </p>
          <p>
            <strong>Filling in an agreed, numbered form (gRPC + Protobuf).</strong> Both sides have{" "}
            <strong>the same printed form</strong>. Field 1 is always the customer ID, field 2 is always the quantity.
            It's compact, fast to process, and there's no ambiguity. If someone wants to add a new field, it's added to
            the shared form, and everyone knows about it.
          </p>
          <p>
            <strong>gRPC</strong> also makes calling another service{" "}
            <strong>feel like calling a normal function</strong> in your code:
          </p>
          <CodeBlock lang="python" code={code1} />
          <p>
            That's what RPC means: <strong>Remote Procedure Call</strong>.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="protocol-buffers-the-contract-and-the-format">Protocol Buffers: the contract and the format</h3>
          <p>
            You define your data and service in a{" "}
            <strong>
              <code>.proto</code> file
            </strong>
            :
          </p>
          <CodeBlock lang="protobuf" code={code2} />
          <p>
            The numbers (<code>= 1</code>, <code>= 2</code>, <code>= 3</code>) are <strong>field numbers</strong>. They
            are what's actually sent over the wire, not the field names. That's one reason Protobuf is compact.
          </p>
          <p>
            Then a code generator (<code>protoc</code> or tools like Buf) creates{" "}
            <strong>client and server code</strong> in your languages (Go, Java, Python, TypeScript, C#, Rust and more):
          </p>
          <Flow
            caption="One contract, generated into every language. Mismatches fail at compile time, not in production."
            dir="row"
            nodes={[
              { title: <>inventory.proto</>, desc: <>the contract</> },
              { title: <>protoc / Buf</>, desc: <>code generator</> },
              { title: <>Go server · Java client · Python client</>, tone: "good" },
            ]}
          />
          <p>
            Every team uses the <strong>same contract</strong>, and the compiler catches mismatches{" "}
            <strong>before</strong> anything runs.
          </p>
          <h3 id="why-protobuf-is-smaller-and-faster-than-json">Why Protobuf is smaller and faster than JSON</h3>
          <p>The same data in two formats:</p>
          <Stats
            caption="The same CheckStockRequest, two encodings."
            stats={[
              { value: <>33 B</>, label: <>as JSON</>, sub: <>&#123;"product_id":"991","quantity":2&#125;</> },
              { value: <>7 B</>, label: <>as Protobuf</>, sub: <>0a 03 39 39 31 10 02</> },
              {
                value: <>~5×</>,
                label: <>smaller</>,
                sub: <>and far cheaper to parse — field numbers, not names, go on the wire</>,
              },
            ]}
          />
          <ul>
            <li>
              <strong>No field names</strong> are repeated in every message, only small field numbers.
            </li>
            <li>
              <strong>Numbers are packed efficiently</strong> (small numbers take fewer bytes).
            </li>
            <li>
              <strong>Parsing binary</strong> is much faster than parsing text.
            </li>
          </ul>
          <p>
            The trade-off: you <strong>can't read it by eye</strong>. You need tools like <code>grpcurl</code> or
            Postman to inspect it.
          </p>
          <h3 id="evolving-schemas-safely">Evolving schemas safely</h3>
          <p>
            APIs change. Protobuf is designed for <strong>backward and forward compatibility</strong> if you follow a
            few rules:
          </p>
          <ul>
            <li>
              ✅ <strong>Adding new fields is safe.</strong> Old clients just ignore fields they don't know, and new
              clients see default values when old servers don't send them.
            </li>
            <li>
              ✅ <strong>Removing a field is OK</strong>, but mark its number and name as <code>reserved</code> so
              nobody reuses them:
              <CodeBlock lang="protobuf" code={code3} />
            </li>
            <li>
              ❌ <strong>Never change a field's number.</strong>
            </li>
            <li>
              ❌ <strong>Never reuse an old field number</strong> for something new. Old data or old clients will
              misread it.
            </li>
            <li>
              ❌ <strong>Don't change a field's type</strong> (like <code>int32</code> to <code>string</code>).
            </li>
            <li>
              Put a <strong>version in the package name</strong> (<code>inventory.v1</code>) and create <code>v2</code>{" "}
              for breaking changes.
            </li>
          </ul>
          <h3 id="grpc-runs-on-http-2">gRPC runs on HTTP/2</h3>
          <p>
            gRPC uses <strong>HTTP/2</strong> (post 3) under the hood, which gives it:
          </p>
          <ul>
            <li>
              <strong>Multiplexing:</strong> many calls at once over <strong>one connection</strong>.
            </li>
            <li>
              <strong>Binary framing</strong> and <strong>header compression</strong>.
            </li>
            <li>
              <strong>Streaming</strong> in both directions.
            </li>
          </ul>
          <h3 id="four-kinds-of-calls">Four kinds of calls</h3>
          <Compare
            caption="The four kinds of gRPC call."
            columns={[
              {
                title: <>Unary</>,
                items: [{ sign: "·", text: <>one request → one response</> }],
                verdict: <>CheckStock, GetUser — like a function call</>,
              },
              {
                title: <>Server streaming</>,
                items: [{ sign: "·", text: <>one request → many responses</> }],
                verdict: <>live prices, large results in chunks</>,
              },
              {
                title: <>Client streaming</>,
                items: [{ sign: "·", text: <>many requests → one response</> }],
                verdict: <>sensor uploads, file chunks</>,
              },
              {
                title: <>Bidirectional</>,
                items: [{ sign: "·", text: <>both sides stream independently</> }],
                verdict: <>chat, collaboration, voice processing</>,
              },
            ]}
          />
          <h3 id="deadlines-and-cancellation">Deadlines and cancellation</h3>
          <Flow
            caption="A deadline travels with the request and shrinks at every hop."
            dir="row"
            nodes={[
              { title: <>Service A</>, desc: <>300 ms left</> },
              { title: <>Service B</>, desc: <>spends 100 ms → 200 ms left</> },
              { title: <>Service C</>, desc: <>spends 150 ms → 50 ms left</> },
              { title: <>Deadline hits</>, desc: <>everyone stops — no wasted work</>, tone: "bad" },
            ]}
          />
          <p>
            In gRPC, every call can carry a <strong>deadline</strong>: "I need an answer within 300 ms". The deadline{" "}
            <strong>travels with the request</strong> to downstream services. If service A calls B with 300 ms left, and
            B spends 100 ms, B's call to C carries the remaining ~200 ms. When the deadline passes, everyone{" "}
            <strong>stops working</strong> on that request.
          </p>
          <p>
            This prevents wasted work and helps stop <strong>cascading failures</strong> (Part 7). Always set deadlines.
            A missing deadline means a call could wait forever.
          </p>
          <p>
            gRPC also has its own <strong>status codes</strong>: <code>OK</code>, <code>NOT_FOUND</code>,{" "}
            <code>INVALID_ARGUMENT</code>, <code>DEADLINE_EXCEEDED</code>, <code>UNAVAILABLE</code>,{" "}
            <code>PERMISSION_DENIED</code>, <code>RESOURCE_EXHAUSTED</code> (rate limited) and more. They're similar in
            spirit to HTTP status codes.
          </p>
          <h3 id="interceptors-middleware">Interceptors (middleware)</h3>
          <p>
            <strong>Interceptors</strong> wrap every call, which is the natural place for:
          </p>
          <ul>
            <li>authentication (checking tokens),</li>
            <li>logging and metrics,</li>
            <li>distributed tracing (Part 8),</li>
            <li>retries with backoff (Part 7).</li>
          </ul>
          <h3 id="the-load-balancing-gotcha">The load-balancing gotcha</h3>
          <p>
            gRPC keeps <strong>long-lived HTTP/2 connections</strong> and sends many requests over each one. That
            creates a problem with <strong>L4 load balancers</strong> (post 12):
          </p>
          <Compare
            caption="The long-lived-connection gotcha."
            columns={[
              {
                title: <>L4 balancer — per connection</>,
                items: [
                  { sign: "·", text: <>Client A ═══► Server 1 (all of A's calls)</> },
                  { sign: "·", text: <>Client B ═══► Server 1 (all of B's calls)</> },
                  { sign: "-", text: <>Servers 2 and 3 sit idle</> },
                ],
              },
              {
                title: <>L7 or client-side — per request</>,
                items: [
                  { sign: "·", text: <>Each call on the shared HTTP/2 connection is balanced</> },
                  { sign: "+", text: <>Load spreads evenly</> },
                ],
                verdict: <>Envoy, NGINX, a service mesh, or gRPC's client-side balancing</>,
              },
            ]}
          />
          <p>
            Once a connection is assigned, every request on it goes to the same server, so load becomes very uneven.
          </p>
          <p>Fixes:</p>
          <ul>
            <li>
              <strong>An L7 load balancer / proxy</strong> that understands HTTP/2 and balances{" "}
              <strong>per request</strong> (Envoy, NGINX, a service mesh, or a cloud L7 LB with gRPC support).
            </li>
            <li>
              <strong>Client-side load balancing:</strong> the gRPC client knows all server addresses (from DNS or
              service discovery) and spreads requests itself.
            </li>
          </ul>
          <h3 id="grpc-in-the-browser">gRPC in the browser</h3>
          <p>Browsers don't give JavaScript the low-level HTTP/2 control that gRPC needs. Options:</p>
          <ul>
            <li>
              <strong>gRPC-Web</strong>, with a proxy (such as Envoy) translating to gRPC.
            </li>
            <li>
              <strong>Connect</strong>, a newer protocol that is gRPC-compatible and also works over plain HTTP/JSON.
            </li>
            <li>
              Most commonly: <strong>REST or GraphQL for browsers and mobile, gRPC between backend services.</strong>
            </li>
          </ul>
          <h3 id="rest-vs-grpc">REST vs gRPC</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>REST + JSON</th>
                  <th>gRPC + Protobuf</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Format</td>
                  <td>Text (JSON), human-readable</td>
                  <td>Binary, compact</td>
                </tr>
                <tr>
                  <td>Contract</td>
                  <td>Optional (OpenAPI)</td>
                  <td>
                    <strong>Required</strong> (<code>.proto</code>), code generated
                  </td>
                </tr>
                <tr>
                  <td>Transport</td>
                  <td>HTTP/1.1 or HTTP/2</td>
                  <td>HTTP/2</td>
                </tr>
                <tr>
                  <td>Streaming</td>
                  <td>Limited (SSE / WebSockets separately)</td>
                  <td>Built in (4 modes)</td>
                </tr>
                <tr>
                  <td>Browser support</td>
                  <td>✅ Native</td>
                  <td>🟡 Needs gRPC-Web/Connect</td>
                </tr>
                <tr>
                  <td>Debugging</td>
                  <td>✅ curl, browser</td>
                  <td>🟡 Needs tools (grpcurl, Postman)</td>
                </tr>
                <tr>
                  <td>Caching via HTTP/CDN</td>
                  <td>✅ Easy</td>
                  <td>❌ Not really</td>
                </tr>
                <tr>
                  <td>Best for</td>
                  <td>Public APIs, web/mobile clients</td>
                  <td>Internal service-to-service, high performance, streaming</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 id="alternatives">Alternatives</h3>
          <ul>
            <li>
              <strong>Apache Thrift:</strong> created at Facebook; similar idea, with its own format and RPC framework.
            </li>
            <li>
              <strong>Apache Avro:</strong> popular in data pipelines and Kafka, with schemas stored alongside data.
            </li>
            <li>
              <strong>JSON-RPC:</strong> simple RPC over JSON.
            </li>
            <li>
              <strong>MessagePack / CBOR:</strong> compact binary encodings of JSON-like data, without schemas.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅ <strong>Fast and compact</strong>, with <strong>strong contracts</strong> and generated code,{" "}
              <strong>built-in streaming</strong>, and <strong>deadlines and cancellation</strong>.
            </li>
            <li>
              ✅ <strong>Polyglot:</strong> the same contract works across many languages.
            </li>
            <li>
              ❌ <strong>Not human-readable</strong>, so debugging needs tools.
            </li>
            <li>
              ❌ <strong>Limited browser support</strong> and no easy HTTP/CDN caching.
            </li>
            <li>
              ❌ <strong>Load balancing needs L7 or client-side balancing.</strong>
            </li>
            <li>
              ❌ <strong>Schema discipline required:</strong> careless changes to field numbers break clients.
            </li>
            <li>
              ❌ <strong>Learning curve</strong> and build tooling (code generation, managing <code>.proto</code> files
              across teams).
            </li>
          </ul>
          <p>
            <strong>When not to use gRPC:</strong> public APIs for third-party developers (REST is easier for them),
            simple apps with a few endpoints, or when your team and infrastructure don't support HTTP/2 end to end.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Google</strong> created gRPC based on its internal RPC system (called Stubby), which it had used for
            years for enormous numbers of calls between services. It open-sourced gRPC in 2015, and it's now a Cloud
            Native Computing Foundation project.
          </p>
          <p>
            <strong>Kubernetes and etcd.</strong> etcd, the database that stores Kubernetes' cluster state, exposes a
            gRPC API. Kubernetes uses gRPC in key places, such as the interface between the kubelet and container
            runtimes (the CRI). Envoy's configuration APIs (xDS) are gRPC as well.
          </p>
          <p>
            <strong>Dropbox's migration to gRPC.</strong> Dropbox wrote about moving its many internal services to a
            gRPC-based framework (called Courier), gaining a single, well-defined RPC layer with deadlines, tracing and
            security built in.
          </p>
          <p>
            <strong>Microservice platforms.</strong> Many companies with large microservice estates (in ride-hailing,
            fintech, streaming and e-commerce) use gRPC internally, while exposing REST or GraphQL APIs to their mobile
            apps and partners. That's the "gRPC inside, REST/GraphQL outside" pattern.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Why would you use gRPC instead of REST between services?</>,
                a: (
                  <>
                    <p>
                      Compact binary Protobuf messages that are cheaper to send and parse, a required typed contract
                      with generated clients in every language, HTTP/2 multiplexing, built-in streaming, and deadlines
                      that propagate through call chains. REST is easier for public, browser-facing APIs.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you evolve a Protobuf schema without breaking clients?</>,
                a: (
                  <>
                    <p>
                      Add new fields with new numbers (old readers ignore them); never change or reuse a field number or
                      change a field's type; mark removed numbers and names as reserved; put a version in the package
                      and create v2 for breaking changes.
                    </p>
                  </>
                ),
              },
              {
                q: <>What problem do gRPC and L4 load balancers have together?</>,
                a: (
                  <>
                    <p>
                      gRPC multiplexes many calls over one long-lived HTTP/2 connection, and L4 balancers balance
                      connections, so each client's traffic sticks to one server and load becomes very uneven. Use an L7
                      proxy that balances per request, or client-side load balancing.
                    </p>
                  </>
                ),
              },
              {
                q: <>Why are deadlines important in gRPC?</>,
                a: (
                  <>
                    <p>
                      Without one, a call can wait forever and tie up resources upstream. A deadline sets a total time
                      budget that is passed downstream, so every service knows how long is left and all of them cancel
                      work once the caller has given up.
                    </p>
                  </>
                ),
              },
              {
                q: <>Can browsers call gRPC services directly?</>,
                a: (
                  <>
                    <p>
                      Not native gRPC, because browsers don't expose the HTTP/2 control it needs. Use gRPC-Web through a
                      proxy like Envoy, the Connect protocol, or — most often — REST or GraphQL at the edge and gRPC
                      internally.
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
              <strong>gRPC</strong> makes remote calls feel like local function calls. <strong>Protocol Buffers</strong>{" "}
              define the <strong>contract</strong> and a <strong>compact binary format</strong>.
            </li>
            <li>
              Code is <strong>generated</strong> from <code>.proto</code> files, so every team shares one typed
              contract.
            </li>
            <li>
              Evolve schemas safely: <strong>add fields freely</strong>, never change or reuse field numbers, and use{" "}
              <code>reserved</code>.
            </li>
            <li>
              gRPC runs on <strong>HTTP/2</strong> and supports <strong>unary and streaming</strong> calls.{" "}
              <strong>Always set deadlines</strong>, which propagate through the chain.
            </li>
            <li>
              Use <strong>L7 or client-side load balancing</strong>. Use gRPC mainly{" "}
              <strong>between backend services</strong>, and REST or GraphQL for browsers and public APIs.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>The official gRPC documentation ("Introduction" and "Core concepts")</li>
            <li>The official Protocol Buffers documentation, including its best practices for schema changes</li>
            <li>The gRPC blog article "gRPC Load Balancing"</li>
            <li>
              <em>Designing Data-Intensive Applications</em> by Martin Kleppmann (chapter 4, "Encoding and Evolution")
            </li>
            <li>
              The System Design Primer on GitHub (sections "Remote procedure call (RPC)" and "RPC and REST calls
              comparison")
            </li>
            <li>Dropbox's engineering blog post on migrating to gRPC ("Courier")</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
