import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import { Compare, Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-40")!;

export const metadata: Metadata = {
  title: `Lesson 40 — ${lesson.title}`,
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

export default function SdLessonFourZeroPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>Your architecture diagram looks solid:</p>
          <ul>
            <li>a load balancer (a server that shares requests between many servers),</li>
            <li>five app servers,</li>
            <li>a Redis cache (a fast store for data that is read often),</li>
            <li>a PostgreSQL primary (the main database) with a replica (a live copy of it).</li>
          </ul>
          <p>
            Then one night, the whole site goes down. The cause is none of those boxes. It is the{" "}
            <strong>one NAT gateway</strong> that all outgoing traffic goes through. (A NAT gateway lets private
            servers reach the internet.) Or the <strong>one DNS provider</strong> (DNS turns a site name into an
            address). Or an <strong>expired certificate</strong> (the file that proves your site's identity for
            HTTPS). Or the <strong>one engineer</strong> who knew how to restart the payment connection, and who is on
            holiday.
          </p>
          <p>
            In post 9 we learned how availability "adds up". In this part we learn how to{" "}
            <strong>build systems that keep working when parts break</strong>. Step one is to find every{" "}
            <strong>single point of failure (SPOF)</strong>. Then you add <strong>redundancy</strong> and{" "}
            <strong>failover</strong> that really work. Redundancy means having a spare copy. Failover means switching
            to the spare when the main part fails.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            A <strong>single point of failure</strong> (SPOF) is any part that, when it fails,{" "}
            <strong>takes the whole system (or one critical feature) down</strong>. It is like one weak link in a
            chain.
          </p>
          <p>
            Think about a <strong>hospital</strong>. It plans for failure:
          </p>
          <ul>
            <li>
              It has <strong>backup generators</strong> in case the power grid fails.
            </li>
            <li>
              <strong>Several doctors</strong> are on call (ready to come in), not just one.
            </li>
            <li>
              There are <strong>two roads</strong> in, in case one is blocked.
            </li>
            <li>
              <strong>Oxygen supply</strong> comes from a main tank <em>and</em> backup cylinders.
            </li>
            <li>
              And they <strong>test</strong> the generators regularly. A backup that does not start when needed is worse
              than useless, because it gave you false trust.
            </li>
          </ul>
          <p>
            Reliable systems follow the same rules:{" "}
            <strong>find the SPOFs, add a spare, make switching to the spare automatic, and test it regularly.</strong>
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="step-1-find-the-spofs">Step 1: Find the SPOFs</h3>
          <p>
            Follow the <strong>path of a request</strong> (post 11) and ask about every box and arrow:{" "}
            <strong>"What happens if this dies right now?"</strong>
          </p>
          <Flow
            caption="Follow the request path and ask about every box: what happens if this dies right now?"
            nodes={[
              { title: <>User</> },
              { title: <>DNS</>, desc: <>one provider? → nobody can find you</> },
              { title: <>CDN · Load balancer</>, desc: <>one instance? one zone? (A CDN keeps copies of your files near users.)</> },
              { title: <>App servers</>, desc: <>stateless (no user data kept on the server) and N+1 (one spare)?</> },
              { title: <>Cache</>, desc: <>can the database survive without it?</> },
              { title: <>Database</>, desc: <>automatic failover — and tested?</>, tone: "warn" },
              {
                title: <>Payment · email · object storage</>,
                desc: <>third parties need fallbacks or buffers</>,
                tone: "warn",
              },
            ]}
          />
          <p>Obvious SPOFs:</p>
          <ul>
            <li>a single database primary (without automatic failover),</li>
            <li>a single load balancer,</li>
            <li>a single app server,</li>
            <li>
              everything running in <strong>one availability zone</strong> (one separate data centre inside a cloud
              region) or <strong>one region</strong> (a cloud area made of several zones, such as US-East-1).
            </li>
          </ul>
          <p>
            <strong>Hidden SPOFs, which cause many real outages:</strong>
          </p>
          <ul>
            <li>
              <strong>DNS provider</strong>: one provider down means nobody can find you (post 1).
            </li>
            <li>
              <strong>Certificates</strong>: one expired certificate breaks HTTPS for everyone (post 3).
            </li>
            <li>
              <strong>NAT gateway, VPN or firewall</strong>: one box that all traffic must pass through. (A VPN is a private
              network link. A firewall blocks unwanted traffic.)
            </li>
            <li>
              <strong>Configuration or feature-flag service</strong>: a feature flag is a setting that turns a feature on
              or off. If every service needs this service to start, it can block recovery.
            </li>
            <li>
              <strong>Authentication service</strong> (the service that checks who a user is): if it is down, nobody can
              log in, even though everything else works.
            </li>
            <li>
              <strong>A shared database or cache used by "independent" services.</strong>
            </li>
            <li>
              <strong>Third-party APIs</strong>: payments, SMS, maps.
            </li>
            <li>
              <strong>The deploy pipeline</strong>: you cannot release the fix if CI/CD is down. (CI/CD is the automatic
              system that tests and releases code.)
            </li>
            <li>
              <strong>People and knowledge</strong>: "only Ravi knows how this works."
            </li>
            <li>
              <strong>The monitoring system</strong>: if it runs on the same machines, it goes down <em>together with</em>{" "}
              the thing it should warn you about.
            </li>
          </ul>
          <h3 id="step-2-understand-blast-radius">Step 2: Understand blast radius</h3>
          <p>
            Not every failure is equal. <strong>Blast radius</strong> is how much of the system (and how many users) one
            failure harms. Think of how far the damage of an explosion reaches.
          </p>
          <p>Ways to make it smaller:</p>
          <ul>
            <li>
              <strong>Isolate features.</strong> Keep them apart. If recommendations fail, checkout should keep working
              (post 44).
            </li>
            <li>
              <strong>Cells.</strong> Split the system into several <strong>independent copies</strong> (cells). Each
              cell serves a part of your customers. A bad deploy or an overload in cell 3 harms only cell 3's
              customers.
            </li>
            <li>
              <strong>Shuffle sharding.</strong> A shard is one part of a split system. Here, you give each customer a
              random <strong>combination</strong> of servers. Say one customer sends "poison" traffic (requests that
              crash servers) and kills its servers. Very few other customers share <strong>exactly</strong> the same
              combination, so they are barely affected.
            </li>
          </ul>
          <Compare
            caption="Why shuffle sharding shrinks the blast radius of a bad customer."
            columns={[
              {
                title: <>Normal sharding (4 shards)</>,
                items: [
                  { sign: "·", text: <>A and B share shard 1</> },
                  { sign: "-", text: <>A's poison traffic kills shard 1 → B is down too</> },
                ],
              },
              {
                title: <>Shuffle sharding (2 of 8 servers each)</>,
                items: [
                  { sign: "·", text: <>A → 1, 5 B → 2, 7 C → 1, 7</> },
                  { sign: "+", text: <>A kills 1 and 5 → B unaffected, C loses only one server</> },
                  { sign: "+", text: <>Few customers share exactly the same pair</> },
                ],
              },
            ]}
          />
          <h3 id="step-3-add-redundancy">Step 3: Add redundancy</h3>
          <p>
            <strong>Redundancy</strong> means having <strong>more than one</strong> of anything critical, like a spare
            tyre in a car.
          </p>
          <p>
            <strong>Redundancy at every layer:</strong>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Layer</th>
                  <th>Redundancy</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>DNS</td>
                  <td>Two DNS providers, or a highly redundant managed DNS</td>
                </tr>
                <tr>
                  <td>Edge</td>
                  <td>CDN (itself globally redundant), or even two CDNs</td>
                </tr>
                <tr>
                  <td>Load balancer</td>
                  <td>A pair that shares a floating IP (an address that moves to the healthy one), or a managed load balancer
                    across zones</td>
                </tr>
                <tr>
                  <td>App servers</td>
                  <td>N+1 or more stateless servers across zones (post 7)</td>
                </tr>
                <tr>
                  <td>Cache</td>
                  <td>Replicas or a cluster; the app still works if the cache is lost (post 16)</td>
                </tr>
                <tr>
                  <td>Database</td>
                  <td>Primary + replicas in different zones with automatic failover (post 24)</td>
                </tr>
                <tr>
                  <td>Storage</td>
                  <td>Object storage replicated across zones (post 17)</td>
                </tr>
                <tr>
                  <td>Data centre</td>
                  <td>
                    Multiple <strong>availability zones</strong>
                  </td>
                </tr>
                <tr>
                  <td>Region</td>
                  <td>Multi-region for the most critical systems</td>
                </tr>
                <tr>
                  <td>Dependencies</td>
                  <td>Backup providers (a second SMS/email provider), and queues that hold work during an outage</td>
                </tr>
                <tr>
                  <td>People</td>
                  <td>Written runbooks (step-by-step guides), on-call rotations (a schedule of who is ready), shared knowledge</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Capacity planning: N+1 and N+2.</strong> Capacity planning means working out how many servers you
            need.
          </p>
          <ul>
            <li>
              <strong>N</strong> = the number of servers needed to handle peak load.
            </li>
            <li>
              <strong>N+1</strong> = one extra server, so you can lose one (or take one down to deploy) without
              overload.
            </li>
            <li>
              <strong>N+2</strong> = two extra servers, so you survive a failure <strong>during</strong> maintenance.
            </li>
          </ul>
          <p>
            <strong>Zone maths.</strong> Say you run in <strong>3 availability zones</strong> and must survive losing{" "}
            <strong>one</strong>. The remaining 2 zones must handle 100% of the traffic. So each zone needs capacity for{" "}
            <strong>50% of peak</strong> (peak is the busiest moment). In total that is <strong>150% of peak</strong>.
            With only <strong>2 zones</strong>, each needs <strong>100%</strong>, so you pay double (200%). This is why
            three zones is a common best choice.
          </p>
          <h3 id="step-4-failover-switching-to-the-spare">Step 4: Failover, switching to the spare</h3>
          <p>
            <strong>Failover</strong> means moving traffic from a failed part to its healthy copy. Redundancy is only
            useful if traffic really <strong>moves</strong> to the healthy copy. There are two main designs.
          </p>
          <p>
            <strong>Active-passive</strong> means one copy serves traffic and the other waits as a standby. A standby can
            be hot, warm or cold:
          </p>
          <Compare
            caption="Two ways to run a spare."
            columns={[
              {
                title: <>Active-passive</>,
                items: [
                  { sign: "·", text: <>Active takes all traffic; passive waits</> },
                  { sign: "·", text: <>Hot (seconds) · warm (minutes) · cold (hours)</> },
                  { sign: "+", text: <>Simple data story: one writer</> },
                  { sign: "-", text: <>Idle hardware; failover must be detected and executed</> },
                ],
              },
              {
                title: <>Active-active</>,
                items: [
                  { sign: "·", text: <>Both serve traffic all the time</> },
                  { sign: "+", text: <>No idle hardware; near-instant failover</> },
                  { sign: "-", text: <>Each node needs headroom for the other's load</> },
                  { sign: "-", text: <>Two writers means conflicts to resolve</> },
                ],
              },
            ]}
          />
          <ul>
            <li>
              <strong>Hot standby:</strong> running and up to date, so it takes over in seconds.
            </li>
            <li>
              <strong>Warm standby:</strong> running, but smaller or a little behind. It takes minutes, and may need to
              be scaled up.
            </li>
            <li>
              <strong>Cold standby:</strong> not running. It must be started and restored from backups, which takes hours.
            </li>
          </ul>
          <p>
            <strong>Active-active</strong> means all copies serve traffic at the same time. The numbers below show how
            much capacity each choice needs:
          </p>
          <Stats
            caption="Zone maths — capacity needed to survive losing one availability zone."
            stats={[
              { value: <>2 zones</>, label: <>100% each</>, sub: <>200% of peak in total</> },
              { value: <>3 zones</>, label: <>50% each</>, sub: <>150% of peak — the common sweet spot</> },
              { value: <>N+1</>, label: <>one spare</>, sub: <>survive a failure or a deploy</> },
              { value: <>N+2</>, label: <>two spares</>, sub: <>survive a failure during maintenance</> },
            ]}
          />
          <ul>
            <li>✅ No idle hardware, and failover is almost instant because both are already serving.</li>
            <li>
              ❌ For data, if both copies accept writes, <strong>conflicts</strong> can happen (multi-leader, post 24).
              Each node must have <strong>spare capacity</strong> (headroom) to take the other's load.
            </li>
          </ul>
          <h3 id="failure-detection-the-hard-part">Failure detection: the hard part</h3>
          <p>
            How do you know that something has <strong>failed</strong>?
          </p>
          <ul>
            <li>
              <strong>Health checks</strong> (a regular test that asks "are you working?") and <strong>heartbeats</strong>{" "}
              (a regular "I am alive" signal) (post 12).
            </li>
            <li>
              <strong>Timeouts</strong>: for example, "no heartbeat for 10 seconds means dead".
            </li>
          </ul>
          <p>The trade-off:</p>
          <ul>
            <li>
              <strong>Detect too slowly:</strong> users see errors for a longer time.
            </li>
            <li>
              <strong>Detect too eagerly:</strong> a short network problem or a long garbage-collection pause (a pause
              while the program cleans up memory) causes a <strong>failover that was not needed</strong>, and the
              failover itself disturbs users. The system can also <strong>flap</strong>, which means it switches back
              and forth again and again.
            </li>
          </ul>
          <p>
            <strong>Split brain</strong> (post 24) happens when the "dead" node was really alive but cut off from the
            network. Now <strong>two</strong> nodes both think they are in charge. This can corrupt data. Prevent it
            with:
          </p>
          <ul>
            <li>
              <strong>quorum</strong>: only the side that has a <strong>majority</strong> of nodes may act. (etcd,
              ZooKeeper and Raft are tools and protocols that use quorum),
            </li>
            <li>
              <strong>fencing</strong>: make sure the old primary can no longer write. You can remove its access, power
              it off, or use fencing tokens (numbers that grow with each new leader, so storage rejects the old
              leader's writes).
            </li>
          </ul>
          <h3 id="automatic-vs-manual-failover">Automatic vs manual failover</h3>
          <ul>
            <li>
              <strong>Automatic:</strong> fast (seconds), works at 3 AM, and needed for high availability goals.{" "}
              <strong>But</strong> a bad detector can start a failover that is not needed. Automation that triggers
              more automation can make an incident worse.
            </li>
            <li>
              <strong>Manual:</strong> a person checks the situation first, which is safer for complex cases.{" "}
              <strong>But</strong> it is slow, and it needs someone who is awake and knows what to do.
            </li>
          </ul>
          <p>
            Many teams <strong>automate common failovers that they understand well</strong> (promoting a database replica
            to primary inside one region). They keep <strong>human approval</strong> for big, risky ones (moving
            everything to another region).
          </p>
          <h3 id="static-stability">Static stability</h3>
          <p>
            A statically stable system <strong>keeps working during a failure without having to make any change</strong>.
            For example:
          </p>
          <ul>
            <li>
              <strong>pre-provision</strong> (prepare in advance) enough capacity in each zone. Then losing a zone does
              not require starting new servers. (The control plane, the system that starts servers, may be hurt by the
              failure too.)
            </li>
            <li>
              <strong>keep a local copy of the configuration</strong>, so services keep running if the configuration
              service is down,
            </li>
            <li>
              make sure <strong>recovery does not depend on the thing that failed</strong>.
            </li>
          </ul>
          <h3 id="step-5-test-it-regularly">Step 5: Test it, regularly</h3>
          <p>
            Failover that you never tested <strong>usually fails</strong> when you need it. Common ways to test:
          </p>
          <ul>
            <li>
              <strong>Game days:</strong> planned practice days. The team breaks something on purpose (for example, fails
              over the database) and practises the response.
            </li>
            <li>
              <strong>Chaos engineering:</strong> you add failures on purpose (kill servers, add delay, cut network
              links) in a controlled way, ideally in production, to prove that the system copes.
            </li>
            <li>
              <strong>Disaster recovery drills:</strong> really restore from backups, and really fail over to another
              region (post 45).
            </li>
            <li>
              <strong>Runbooks:</strong> written, step-by-step instructions for each kind of failure. Update them after
              every drill and incident.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              <strong>More redundancy:</strong> higher availability, but <strong>more cost</strong> (spare capacity,
              extra zones or regions) and <strong>more complexity</strong>.
            </li>
            <li>
              <strong>Complexity is itself a risk.</strong> Failover systems can have bugs. Many big outages were{" "}
              <strong>caused or made worse</strong> by automation that was meant to protect the system.
            </li>
            <li>
              <strong>Active-active:</strong> no idle capacity and instant failover, but it is harder to keep data
              consistent, and every node needs headroom.
            </li>
            <li>
              <strong>Fast failure detection:</strong> quick recovery, but more false alarms (false positives) and
              flapping.
            </li>
            <li>
              <strong>Multi-region:</strong> survives the failure of a whole region, but it is expensive, and it makes
              copying data and keeping it consistent much harder (posts 24, 27–28).
            </li>
          </ul>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Netflix and Chaos Monkey.</strong> Netflix built <strong>Chaos Monkey</strong>, a tool that randomly
            shuts down production servers during working hours. This forces every team to build services that survive
            the loss of any server. Netflix later used the same idea for larger failures, including simulating the loss
            of an entire AWS region. Its "Simian Army" of tools helped make <strong>chaos engineering</strong> popular
            across the industry.
          </p>
          <p>
            <strong>Big cloud region outages.</strong> Big cloud providers have had serious regional incidents.
            For example, AWS's US-East-1 region has had several outages that many people felt. One was in October 2025,
            when a DNS problem around DynamoDB spread to many other services. Companies that ran everything in a single
            region went down. Companies with <strong>multi-region failover</strong> or{" "}
            <strong>static stability</strong> stayed up or recovered faster. These events are the main reason large
            companies spend money on multi-region designs.
          </p>
          <p>
            <strong>Certificate expiry outages.</strong> As in post 3, Microsoft Teams (2020) and O2's UK mobile network
            (2018, caused by Ericsson software) had outages because of expired certificates. A certificate is a classic
            hidden SPOF. The fix is automatic renewal plus monitoring of expiry dates.
          </p>
          <p>
            <strong>Dyn DNS attack (2016).</strong> A massive attack hit the DNS provider Dyn. Many sites
            that relied <strong>only</strong> on Dyn could not be reached. Afterwards, many companies added a{" "}
            <strong>second DNS provider</strong> (post 1).
          </p>
          <p>
            <strong>AWS cells and shuffle sharding.</strong> AWS has written about using{" "}
            <strong>cell-based architecture</strong> and <strong>shuffle sharding</strong> in its own services. Then a
            failure, or a customer who misbehaves, harms only a small part of the users and not everyone.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>How do you find single points of failure?</>,
                a: (
                  <>
                    <p>
                      Follow the full request path and every dependency, and ask “what if this dies now?” Include the
                      hidden ones: DNS, certificates, NAT gateways, config and auth services, shared databases,
                      third-party APIs, the deploy pipeline, monitoring on the same machines, and people who are the only
                      ones with some knowledge.
                    </p>
                  </>
                ),
              },
              {
                q: <>Active-passive vs active-active?</>,
                a: (
                  <>
                    <p>
                      Active-passive keeps a standby (hot, warm or cold) that takes over on failure. It is simpler for
                      data, but the standby sits idle and the failover must work. Active-active serves traffic on all
                      nodes, so failover is almost instant and no hardware sits idle. But each node needs headroom, and
                      data with many writers needs conflict handling.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is split brain, and how do you prevent it?</>,
                a: (
                  <>
                    <p>
                      Two nodes both act as primary after the network splits (a partition). Prevent it with quorum (only
                      the side with a majority may act, for example with Raft or etcd) and fencing (remove the old
                      primary's access, power it off, or reject its old fencing tokens).
                    </p>
                  </>
                ),
              },
              {
                q: <>What is static stability?</>,
                a: (
                  <>
                    <p>
                      A system that keeps working through a failure without having to change anything. It has capacity
                      prepared in every zone, a local copy of its configuration, and a recovery that does not depend on
                      the control plane, which might be failing too.
                    </p>
                  </>
                ),
              },
              {
                q: <>How much capacity do you need to survive losing one of three zones?</>,
                a: (
                  <>
                    <p>
                      The two remaining zones must carry 100% of peak, so each zone needs 50% of peak. That is 150% of
                      peak in total, compared with 200% for only two zones.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you know your failover works?</>,
                a: (
                  <>
                    <p>
                      You test it: scheduled game days, chaos experiments in production, real restores and region
                      failovers, and runbooks updated after every drill. Redundancy that was never tested usually fails when it is
                      needed.
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
              A <strong>single point of failure</strong> is anything whose loss takes down the system.{" "}
              <strong>Walk the request path</strong> and hunt for hidden ones: DNS, certificates, NAT, config, auth,
              shared databases, third parties, people.
            </li>
            <li>
              <strong>Shrink the blast radius</strong> with isolation, <strong>cells</strong> and{" "}
              <strong>shuffle sharding</strong>.
            </li>
            <li>
              Add <strong>redundancy at every layer</strong>, and plan capacity (<strong>N+1</strong>, and zone math: 3
              zones → 150% total capacity).
            </li>
            <li>
              <strong>Failover</strong> can be active-passive (hot, warm, cold) or active-active. Detection is the hard
              part, so guard against <strong>false positives</strong> and <strong>split brain</strong> with quorum and
              fencing.
            </li>
            <li>
              Aim for <strong>static stability</strong>, and <strong>test failover regularly</strong> (game days, chaos
              engineering, drills). Untested redundancy is only hope.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              The AWS Builders' Library articles "Static stability using Availability Zones" and "Workload isolation
              using shuffle-sharding"
            </li>
            <li>
              AWS Well-Architected Framework (the Reliability pillar) and AWS's guidance on cell-based architecture
            </li>
            <li>
              <em>Site Reliability Engineering</em> by Google (chapters on "Addressing Cascading Failures" and "Managing
              Critical State")
            </li>
            <li>"Principles of Chaos Engineering" (the manifesto from the chaos engineering community)</li>
            <li>Netflix Tech Blog posts on the Simian Army and Chaos Monkey</li>
            <li>The System Design Primer on GitHub (section "Availability patterns")</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
