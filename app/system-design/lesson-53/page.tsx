import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Compare, Flow, Layers, QA, Timeline } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-53")!;

export const metadata: Metadata = {
  title: `Lesson 53 — ${lesson.title}`,
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

export default function SdLessonFiveThreePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            A five-person startup reads that Netflix and Uber use microservices, so they split their brand-new app into
            14 services on day one. Six months later:
          </p>
          <ul>
            <li>adding one feature means changing 5 services, coordinating 5 deploys and debugging 5 sets of logs,</li>
            <li>a simple "show order with customer name" page needs 3 network calls,</li>
            <li>local development needs 14 containers running on a laptop,</li>
            <li>
              <strong>nobody</strong> remembers which service owns what.
            </li>
          </ul>
          <p>Meanwhile, across town, a 300-engineer company has one giant codebase:</p>
          <ul>
            <li>every deploy takes 2 hours and includes 90 people's changes,</li>
            <li>one bug in the reporting code crashes checkout,</li>
            <li>teams constantly block each other.</li>
          </ul>
          <p>
            Both companies chose the <strong>wrong architecture for their situation</strong>. The monolith vs
            microservices debate isn't about which is "modern". It's about{" "}
            <strong>team size, domain understanding and operational maturity</strong>.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            <strong>A monolith is like a big restaurant with one kitchen.</strong> Everyone cooks in the same room.
            Chefs can easily pass ingredients around and coordinate. It's simple to run while the team is small. But
            with 200 cooks in one kitchen, people bump into each other, one chef's fire alarm evacuates everyone, and
            changing the menu requires the whole kitchen to agree.
          </p>
          <p>
            <strong>Microservices are like a food court.</strong> Separate stalls (pizza, dosa, biryani, desserts) each
            run <strong>independently</strong>: their own staff, their own equipment, their own hours. The dosa stall
            can change its menu or close for repairs without affecting the others. But now a customer who wants a combo
            meal must visit <strong>several stalls</strong>, and someone has to manage shared seating, cleaning,
            payments and coordination.
          </p>
          <p>
            Neither is better. The right choice depends on{" "}
            <strong>how many cooks you have and how well you know your menu</strong>.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="the-monolith">The monolith</h3>
          <p>
            A <strong>monolith</strong> is one application, <strong>one codebase</strong> (usually),{" "}
            <strong>deployed as one unit</strong>, typically with <strong>one database</strong>.
          </p>
          <Layers
            caption="A monolith: one codebase, one deploy, one database. In-process calls, ACID transactions."
            layers={[
              {
                name: <>Monolith application</>,
                tech: <>Users · Orders · Payments · Catalog · Search · Notifications</>,
                desc: <>one deployable unit</>,
              },
              {
                name: <>One database</>,
                tech: <>every module's tables together</>,
                desc: <>joins and transactions are easy</>,
              },
            ]}
          />
          <p>
            <strong>Strengths:</strong>
          </p>
          <ul>
            <li>
              ✅ <strong>Simple to build, run and debug.</strong> One process, one log stream, one stack trace, and "go
              to definition" works across everything.
            </li>
            <li>
              ✅ <strong>Fast function calls</strong> instead of network calls, with no serialisation, network failures
              or timeouts between modules.
            </li>
            <li>
              ✅ <strong>Real ACID transactions</strong> across features (post 21).
            </li>
            <li>
              ✅ <strong>Easy refactoring</strong>, because moving code between modules is a normal code change.
            </li>
            <li>
              ✅ <strong>Simple deployment and testing:</strong> one pipeline, one artefact.
            </li>
            <li>
              ✅ <strong>Scales further than people think:</strong> run many copies behind a load balancer (post 7).
            </li>
          </ul>
          <p>
            <strong>Weaknesses (mostly as it grows):</strong>
          </p>
          <ul>
            <li>
              ❌ <strong>Team coupling:</strong> many teams in one codebase step on each other, and releases need
              coordination.
            </li>
            <li>
              ❌ <strong>Slow builds and deploys</strong> as the code grows.
            </li>
            <li>
              ❌ <strong>Blast radius:</strong> a memory leak in one feature can crash everything (post 40).
            </li>
            <li>
              ❌ <strong>You scale everything together</strong>, even if only search needs more CPU.
            </li>
            <li>
              ❌ <strong>One technology stack</strong> for everything.
            </li>
            <li>
              ❌ <strong>Boundaries erode:</strong> without discipline, modules reach into each other's internals and it
              becomes a "big ball of mud".
            </li>
          </ul>
          <h3 id="microservices">Microservices</h3>
          <p>
            <strong>Microservices</strong> split the system into{" "}
            <strong>small, independently deployable services</strong>, each owning{" "}
            <strong>one business capability</strong> and <strong>its own data</strong>, communicating over the network
            (REST, gRPC, events).
          </p>
          <Flow
            caption="Microservices: each service owns its code, its deploys and its data."
            nodes={[
              { title: <>Clients</>, desc: <>web, mobile, partners</> },
              { title: <>API gateway / BFF</>, desc: <>one front door</> },
              {
                title: <>User · Order · Payment · Search services</>,
                desc: <>independent teams, deploys and scaling</>,
                label: <>fans out to</>,
              },
              {
                title: <>Their own databases</>,
                desc: <>Users DB · Orders DB · Payments DB · search index — no shared tables</>,
              },
              {
                title: <>Notification service</>,
                desc: <>reacts to OrderPlaced without the order service knowing</>,
                label: <>events (Kafka)</>,
              },
            ]}
          />
          <p>
            <strong>Key principles:</strong>
          </p>
          <ul>
            <li>
              <strong>Organised around business capabilities</strong> (orders, payments, catalogue), not technical
              layers (a "database service" or a "UI service").
            </li>
            <li>
              <strong>Independently deployable:</strong> a team ships its service without coordinating with others.
            </li>
            <li>
              <strong>Database per service:</strong> no other service reads its tables directly. They must use its{" "}
              <strong>API or events</strong>.
            </li>
            <li>
              <strong>Owned by one team</strong> ("you build it, you run it").
            </li>
            <li>
              <strong>Designed for failure:</strong> timeouts, retries, circuit breakers and fallbacks (Part 7).
            </li>
          </ul>
          <p>
            <strong>Strengths:</strong>
          </p>
          <ul>
            <li>
              ✅ <strong>Team autonomy:</strong> teams deploy on their own schedule, many times a day.
            </li>
            <li>
              ✅ <strong>Independent scaling:</strong> scale search to 50 instances and user profiles to 3.
            </li>
            <li>
              ✅ <strong>Fault isolation:</strong> if recommendations crash, checkout can keep working (with good
              design, posts 42 and 44).
            </li>
            <li>
              ✅ <strong>Technology freedom:</strong> use the right language or database per service (with limits).
            </li>
            <li>
              ✅ <strong>Smaller codebases</strong> that are easier to understand individually.
            </li>
          </ul>
          <p>
            <strong>Costs (often underestimated):</strong>
          </p>
          <ul>
            <li>
              ❌ <strong>Network calls everywhere:</strong> latency, partial failures, timeouts and retries. The
              "fallacies of distributed computing" apply (the network is <em>not</em> reliable, latency is <em>not</em>{" "}
              zero).
            </li>
            <li>
              ❌ <strong>Distributed data:</strong> no cross-service transactions, so you need <strong>sagas</strong>,
              eventual consistency and data duplication (posts 23, 28 and 39).
            </li>
            <li>
              ❌ <strong>Operational overhead:</strong> dozens or hundreds of services to deploy, monitor, secure, patch
              and pay for. You need strong <strong>CI/CD, containers, orchestration, observability and on-call</strong>{" "}
              (posts 46–48 and 55–58).
            </li>
            <li>
              ❌ <strong>Harder debugging:</strong> one user request crosses 10 services, so you need{" "}
              <strong>distributed tracing</strong> (post 46).
            </li>
            <li>
              ❌ <strong>Harder testing:</strong> integration and contract testing across services.
            </li>
            <li>
              ❌ <strong>API versioning</strong> between services (post 34).
            </li>
            <li>
              ❌ <strong>The "distributed monolith" trap:</strong> services that are split but{" "}
              <strong>still tightly coupled</strong>. They must be deployed together, share a database, or call each
              other in long synchronous chains. You get <strong>all the costs and none of the benefits</strong>.
            </li>
          </ul>
          <h3 id="the-middle-path-the-modular-monolith">The middle path: the modular monolith</h3>
          <p>
            A <strong>modular monolith</strong> is <strong>one deployable application</strong> with{" "}
            <strong>strong internal boundaries</strong>:
          </p>
          <Compare
            caption="The modular monolith: microservice-style boundaries, monolith-style operations."
            columns={[
              {
                title: <>Inside one deployable</>,
                items: [
                  { sign: "+", text: <>Each module has a public API and private code</> },
                  { sign: "+", text: <>Each module owns its own tables</> },
                  { sign: "+", text: <>In-process calls and ACID transactions</> },
                  { sign: "+", text: <>One deploy, one set of logs</> },
                ],
              },
              {
                title: <>What it doesn't give you</>,
                items: [
                  { sign: "-", text: <>Independent deploys and scaling per module</> },
                  { sign: "-", text: <>Hard fault isolation</> },
                  { sign: "·", text: <>Boundaries enforced by tooling (e.g. Packwerk), not the network</> },
                ],
                verdict: <>Most growing products — and the best starting point for later extraction</>,
              },
            ]}
          />
          <ul>
            <li>
              Each module has a <strong>clear public interface</strong>. Others can't reach into its internals, and this
              is <strong>enforced</strong> by tooling, package rules or architecture tests.
            </li>
            <li>
              Each module <strong>owns its tables</strong>. Other modules don't query them directly.
            </li>
            <li>
              You get most of the <strong>simplicity</strong> of a monolith and much of the{" "}
              <strong>organisation</strong> of microservices.
            </li>
            <li>
              If a module later needs to become a service (for scaling or team reasons), the boundary is{" "}
              <strong>already clean</strong>, so extracting it is much easier.
            </li>
          </ul>
          <p>
            For many companies, <strong>a modular monolith is the best long-term architecture</strong>, not just a
            stepping stone.
          </p>
          <h3 id="how-to-find-service-or-module-boundaries">How to find service (or module) boundaries</h3>
          <ul>
            <li>
              <strong>Domain-Driven Design (DDD):</strong> split by <strong>bounded contexts</strong>, areas of the
              business with their own language and rules. "Product" means different things to the catalogue team
              (description, images), the inventory team (stock levels) and the pricing team (price rules).
            </li>
            <li>
              <strong>High cohesion, low coupling:</strong> things that change together belong together. If two services
              always change together, they should probably be one.
            </li>
            <li>
              <strong>Conway's Law:</strong> "organisations design systems that mirror their own communication
              structure." Your architecture will end up matching your <strong>team structure</strong>, so design both
              together. This deliberate approach is sometimes called the "inverse Conway manoeuvre".
            </li>
            <li>
              <strong>Data ownership:</strong> who is the <strong>single source of truth</strong> for each piece of
              data?
            </li>
          </ul>
          <h3 id="migrating-the-strangler-fig-pattern">Migrating: the strangler fig pattern</h3>
          <p>
            Don't rewrite a monolith from scratch ("the big-bang rewrite" fails very often). Instead,{" "}
            <strong>gradually</strong> replace pieces, like a strangler fig vine that slowly grows around a tree:
          </p>
          <Timeline
            caption="The strangler fig pattern — replace a monolith piece by piece, never in one big rewrite."
            events={[
              { time: <>Step 1</>, text: <>users → monolith</> },
              { time: <>Step 2</>, text: <>add a routing proxy; send /payments to a new Payments service</> },
              { time: <>Step 3</>, text: <>move orders too; the monolith shrinks with every slice</>, tone: "good" },
              {
                time: <>Eventually</>,
                text: <>the monolith is small, or gone — each step was reversible</>,
                tone: "good",
              },
            ]}
          />
          <ol>
            <li>
              Put a <strong>proxy or gateway</strong> in front of the monolith (post 13).
            </li>
            <li>
              Build <strong>one</strong> new service (say, payments) and route <strong>its</strong> requests to the new
              service.
            </li>
            <li>Move data carefully, using dual writes, CDC and verification (post 29).</li>
            <li>
              Repeat, <strong>one capability at a time</strong>, until the monolith is small, or gone.
            </li>
          </ol>
          <h3 id="signals-for-each-choice">Signals for each choice</h3>
          <p>
            <strong>Stay with (or start with) a monolith / modular monolith when:</strong>
          </p>
          <ul>
            <li>
              the team is <strong>small</strong> (one or a few teams),
            </li>
            <li>
              the <strong>domain is still changing fast</strong> and boundaries aren't clear yet,
            </li>
            <li>
              you <strong>don't yet have</strong> strong CI/CD, containers, monitoring and on-call practices,
            </li>
            <li>speed of product iteration matters more than independent scaling.</li>
          </ul>
          <p>
            <strong>Consider microservices when:</strong>
          </p>
          <ul>
            <li>
              <strong>many teams</strong> are blocked by each other in one codebase,
            </li>
            <li>
              <strong>deployments</strong> have become slow, risky and heavily coordinated,
            </li>
            <li>
              parts of the system have <strong>very different scaling, reliability or security needs</strong> (like
              payments vs a marketing blog),
            </li>
            <li>
              <strong>boundaries are well understood</strong>, and
            </li>
            <li>
              you have the <strong>platform maturity</strong> to run many services: automation, observability, service
              discovery and security.
            </li>
          </ul>
          <p>
            Martin Fowler's well-known advice: <strong>"Monolith first."</strong> Almost every successful microservices
            story he saw started with a monolith that grew too big, while systems built as microservices from scratch
            often ended up in trouble.
          </p>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Monolith</th>
                  <th>Modular monolith</th>
                  <th>Microservices</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Simplicity</td>
                  <td>✅ Highest</td>
                  <td>✅ High</td>
                  <td>❌ Low</td>
                </tr>
                <tr>
                  <td>Team independence</td>
                  <td>❌ Low at scale</td>
                  <td>🟡 Medium</td>
                  <td>✅ High</td>
                </tr>
                <tr>
                  <td>Deploy independence</td>
                  <td>❌</td>
                  <td>❌ (one deploy)</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Performance (calls)</td>
                  <td>✅ In-process</td>
                  <td>✅ In-process</td>
                  <td>❌ Network hops</td>
                </tr>
                <tr>
                  <td>Transactions</td>
                  <td>✅ ACID</td>
                  <td>✅ ACID</td>
                  <td>❌ Sagas / eventual</td>
                </tr>
                <tr>
                  <td>Independent scaling</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Fault isolation</td>
                  <td>❌</td>
                  <td>🟡</td>
                  <td>✅ (if designed well)</td>
                </tr>
                <tr>
                  <td>Operational cost</td>
                  <td>✅ Low</td>
                  <td>✅ Low</td>
                  <td>❌ High</td>
                </tr>
                <tr>
                  <td>Best for</td>
                  <td>Small teams, early products</td>
                  <td>Most growing products</td>
                  <td>Large orgs with mature platforms</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Amazon.</strong> In the early 2000s, Amazon's large monolithic application became a bottleneck. The
            company moved to <strong>services with clear APIs</strong>, owned by small teams (the famous "two-pizza
            teams", small enough to feed with two pizzas). That shift also laid the foundations for AWS.
          </p>
          <p>
            <strong>Netflix.</strong> After a major database corruption in 2008 stopped DVD shipments for days, Netflix
            began a years-long move from a monolith in its own data centre to{" "}
            <strong>hundreds of microservices on AWS</strong>. It also built many open-source tools (like Eureka,
            Hystrix and Zuul) to handle the complexity.
          </p>
          <p>
            <strong>Segment's "Goodbye Microservices" (2018).</strong> Segment had split its data-delivery system into{" "}
            <strong>more than a hundred microservices</strong>, one per destination. The result was huge operational
            overhead, duplicated code and slow development. It <strong>merged them back into a single service</strong>,
            and productivity and reliability improved. It's a famous example of microservices going too far.
          </p>
          <p>
            <strong>Shopify's modular monolith.</strong> Shopify runs one of the world's largest Ruby on Rails
            applications as a <strong>modular monolith</strong>, enforcing boundaries between components with tooling
            (it even built an open-source tool, Packwerk, to check boundaries), instead of splitting into many services.
          </p>
          <p>
            <strong>Amazon Prime Video (2023).</strong> A Prime Video team described moving its{" "}
            <strong>video-quality monitoring</strong> tool from a distributed, serverless and microservice design{" "}
            <strong>to a single application</strong>, cutting infrastructure costs by around <strong>90%</strong> for
            that tool. It sparked a big industry discussion, and the key lesson is that{" "}
            <strong>the right architecture depends on the workload</strong>.
          </p>
          <p>
            <strong>Uber's domain-oriented microservices.</strong> After growing to <strong>thousands</strong> of
            microservices, Uber described introducing <strong>Domain-Oriented Microservice Architecture (DOMA)</strong>,
            grouping services into domains with clear gateways, to reduce the complexity of too many tiny,
            interdependent services.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>When would you choose microservices over a monolith?</>,
                a: (
                  <>
                    <p>
                      When many teams block each other in one codebase, deploys have become slow and heavily
                      coordinated, parts of the system have very different scaling, reliability or security needs,
                      boundaries are well understood, and you have the platform maturity (CI/CD, observability,
                      discovery, on-call) to run many services.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are the hidden costs of microservices?</>,
                a: (
                  <>
                    <p>
                      Network calls instead of function calls (latency, partial failure, retries), no cross-service ACID
                      transactions (sagas, eventual consistency), distributed debugging and tracing, many deploy
                      pipelines, service discovery and security between services, and duplicated data and contracts to
                      version.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is a modular monolith?</>,
                a: (
                  <>
                    <p>
                      One deployable application split into modules with explicit public interfaces, private internals
                      and their own tables, with boundaries enforced by tooling. You get most of the organisational
                      benefits without distributed-systems costs, and modules can later be extracted as services.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you find good service boundaries?</>,
                a: (
                  <>
                    <p>
                      Follow business capabilities and domain-driven design bounded contexts rather than technical
                      layers; keep things that change together and need transactions together in one service; minimise
                      chatty cross-service calls; align boundaries with team ownership (Conway's law).
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you migrate from a monolith to services safely?</>,
                a: (
                  <>
                    <p>
                      With the strangler fig: put a routing layer in front, extract one capability at a time behind it,
                      migrate its data with CDC or dual writes, shift traffic gradually with the ability to roll back,
                      and repeat — never a big-bang rewrite.
                    </p>
                  </>
                ),
              },
              {
                q: <>What does a distributed monolith look like?</>,
                a: (
                  <>
                    <p>
                      Services that must be deployed together, share a database, or call each other synchronously in
                      long chains — all the costs of microservices with none of the independence.
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
              A <strong>monolith</strong> is simple, fast and transactional, but causes team and deploy coupling at
              large scale. <strong>Microservices</strong> give team autonomy, independent deploys and scaling, at a high{" "}
              <strong>distributed-systems and operational cost</strong>.
            </li>
            <li>
              The <strong>modular monolith</strong> (one deployable, strong internal boundaries, each module owning its
              data) is often the best choice, and it makes later extraction easy.
            </li>
            <li>
              Find boundaries with <strong>DDD bounded contexts</strong>,{" "}
              <strong>high cohesion and low coupling</strong>, <strong>data ownership</strong> and{" "}
              <strong>Conway's Law</strong>.
            </li>
            <li>
              Avoid the <strong>distributed monolith</strong> (split services that are still tightly coupled or share a
              database).
            </li>
            <li>
              <strong>Start with a monolith</strong>, and migrate <strong>gradually</strong> with the{" "}
              <strong>strangler fig pattern</strong> when team size, deploy pain or scaling needs clearly justify it,
              and your platform is ready.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              James Lewis and Martin Fowler's article "Microservices", plus Martin Fowler's "MonolithFirst" and
              "StranglerFigApplication"
            </li>
            <li>
              <em>Building Microservices</em> (2nd edition) and <em>Monolith to Microservices</em> by Sam Newman
            </li>
            <li>
              <em>Domain-Driven Design</em> by Eric Evans
            </li>
            <li>microservices.io by Chris Richardson (the microservice architecture pattern language)</li>
            <li>Segment's blog post "Goodbye Microservices: From 100s of problem children to 1 superstar"</li>
            <li>Shopify Engineering's posts on its modular monolith</li>
            <li>The System Design Primer on GitHub (section "Microservices")</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
