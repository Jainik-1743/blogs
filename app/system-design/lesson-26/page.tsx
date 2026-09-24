import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Flow, QA, Stats } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import HashRing from "@/components/sd/widgets/HashRing";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-26")!;

export const metadata: Metadata = {
  title: `Lesson 26 — ${lesson.title}`,
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

const code1 = `server = hash(key) % 4`;

const code2 = `Ring positions:  A1 C1 B1 A2 B2 C2 A3 C3 B3 A4 ...
                 (each physical server appears many times, spread out)`;

const code3 = `Replication factor 3:
  key → first server clockwise (primary) + next 2 distinct servers (replicas)`;

const code4 = `import bisect, hashlib

def h(s):  # hash to a big integer
    return int(hashlib.md5(s.encode()).hexdigest(), 16)

class Ring:
    def __init__(self, nodes, vnodes=100):
        self.ring = sorted((h(f"{n}#{i}"), n) for n in nodes for i in range(vnodes))
        self.keys = [pos for pos, _ in self.ring]

    def owner(self, key):
        i = bisect.bisect(self.keys, h(key)) % len(self.ring)  # wrap around
        return self.ring[i][1]

ring = Ring(["cache-a", "cache-b", "cache-c"])
print(ring.owner("user:42"))   # e.g. cache-b`;

export default function SdLessonTwoSixPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            You have <strong>4 cache servers</strong> and spread keys between them with a simple rule:
          </p>
          <CodeBlock code={code1} />
          <p>
            It works nicely. Then traffic grows and you add a <strong>5th server</strong>. The rule becomes{" "}
            <code>hash(key) % 5</code>, and suddenly <strong>about 80% of keys map to a different server</strong>. Your
            cache hit ratio drops from 95% to nearly zero, every request hits the database, and the database falls over.
          </p>
          <p>
            The same thing happens when a server <strong>crashes</strong>: the number changes from 4 to 3, and most keys
            move again.
          </p>
          <p>
            <strong>Consistent hashing</strong> fixes this. When a server is added or removed,{" "}
            <strong>only a small fraction of keys move</strong>, roughly <code>1/N</code> of them.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Imagine a <strong>round table</strong> with numbered seats from 0 to 99, like a clock face.
          </p>
          <ul>
            <li>
              A few <strong>waiters</strong> stand at certain seats: waiter A at seat 10, B at seat 45, C at seat 80.
            </li>
            <li>
              Every <strong>guest</strong> (a key) is given a seat number by a hash function.
            </li>
            <li>
              Each guest is served by <strong>the first waiter found walking clockwise</strong> from their seat.
            </li>
          </ul>
          <p>
            If a new waiter D stands at seat 60, <strong>only the guests between seats 45 and 60</strong> switch to D.
            Everyone else keeps their waiter.
          </p>
          <p>
            If waiter B leaves, only B's guests move, to the next waiter clockwise.{" "}
            <strong>Nobody else is affected.</strong>
          </p>
          <p>
            That round table is the <strong>hash ring</strong>.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="why-modulo-hashing-breaks">Why modulo hashing breaks</h3>
          <p>
            With <code>hash(key) % N</code>, the server for each key depends on <strong>N</strong>. Change N and the
            answer changes for most keys:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>key hash</th>
                  <th>% 4</th>
                  <th>% 5</th>
                  <th>Moved?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>10</td>
                  <td>2</td>
                  <td>0</td>
                  <td>✅ moved</td>
                </tr>
                <tr>
                  <td>11</td>
                  <td>3</td>
                  <td>1</td>
                  <td>✅ moved</td>
                </tr>
                <tr>
                  <td>12</td>
                  <td>0</td>
                  <td>2</td>
                  <td>✅ moved</td>
                </tr>
                <tr>
                  <td>20</td>
                  <td>0</td>
                  <td>0</td>
                  <td>stayed</td>
                </tr>
                <tr>
                  <td>21</td>
                  <td>1</td>
                  <td>1</td>
                  <td>stayed</td>
                </tr>
                <tr>
                  <td>22</td>
                  <td>2</td>
                  <td>2</td>
                  <td>stayed</td>
                </tr>
                <tr>
                  <td>23</td>
                  <td>3</td>
                  <td>3</td>
                  <td>stayed</td>
                </tr>
                <tr>
                  <td>24</td>
                  <td>0</td>
                  <td>4</td>
                  <td>✅ moved</td>
                </tr>
                <tr>
                  <td>25</td>
                  <td>1</td>
                  <td>0</td>
                  <td>✅ moved</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            This small sample happens to be kind, but across all keys, going from 4 to 5 servers keeps only about{" "}
            <strong>1 in 5</strong> keys in place, so <strong>about 80% move</strong>. Going from 100 to 101 servers
            moves about <strong>99%</strong>. For caches, that means a mass of misses. For databases, it means moving
            nearly all the data.
          </p>
          <h3 id="the-hash-ring">The hash ring</h3>
          <ol>
            <li>
              Imagine the output of a hash function (say 0 to 2³² − 1) arranged in a <strong>circle</strong>.
            </li>
            <li>
              Hash each <strong>server</strong> (for example by its name or IP) to a point on the ring.
            </li>
            <li>
              Hash each <strong>key</strong> to a point on the ring.
            </li>
            <li>
              A key belongs to the <strong>first server clockwise</strong> from its position.
            </li>
          </ol>
          <p>
            Using a small ring from 0 to 99 to keep it simple, with servers at <strong>A = 10, B = 45, C = 80</strong>.
            Picture this line bent into a circle, so position 99 joins back to 0:
          </p>
          <HashRing caption="A real hash ring with 48 keys. Add or remove servers and count the keys that move — then switch to hash % N and try the same thing." />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Position</th>
                  <th>Walk clockwise to</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>k1</td>
                  <td>5</td>
                  <td>10</td>
                  <td>
                    <strong>A</strong>
                  </td>
                </tr>
                <tr>
                  <td>k2</td>
                  <td>30</td>
                  <td>45</td>
                  <td>
                    <strong>B</strong>
                  </td>
                </tr>
                <tr>
                  <td>k3</td>
                  <td>50</td>
                  <td>80</td>
                  <td>
                    <strong>C</strong>
                  </td>
                </tr>
                <tr>
                  <td>k4</td>
                  <td>70</td>
                  <td>80</td>
                  <td>
                    <strong>C</strong>
                  </td>
                </tr>
                <tr>
                  <td>k5</td>
                  <td>90</td>
                  <td>wraps past 0 → 10</td>
                  <td>
                    <strong>A</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 id="adding-a-server">Adding a server</h3>
          <p>
            Add <strong>D at position 60</strong>:
          </p>
          <Flow
            caption="Adding server D at position 60. Only the arc just before D changes owner."
            dir="row"
            nodes={[
              { title: <>B at 45</> },
              { title: <>D at 60</>, desc: <>takes keys 46–60 from C</>, tone: "good" },
              { title: <>C at 80</>, desc: <>keeps keys 61–80</> },
            ]}
          />
          <p>
            <strong>Only keys between 45 and 60</strong> (the arc just before D) move, from C to D. Everything owned by
            A and B is untouched, and so are C's other keys.
          </p>
          <h3 id="removing-a-server">Removing a server</h3>
          <p>
            If <strong>B (45) dies</strong>, its keys (the arc from 10 to 45, including k2) move to the{" "}
            <strong>next server clockwise</strong>, C. A's keys are unaffected.
          </p>
          <p>
            On average, adding or removing one server moves only about <strong>1/N of the keys</strong>. With 5 servers,
            that's about 20%, compared with about 80% for modulo.
          </p>
          <h3 id="the-problem-with-a-simple-ring-uneven-load">The problem with a simple ring: uneven load</h3>
          <p>
            With only a few servers placed at random points, the arcs can be <strong>very uneven</strong>:
          </p>
          <Stats
            caption="Why a plain ring with three servers isn't enough."
            stats={[
              { value: <>5%</>, label: <>A's arc</>, sub: <>nearly idle</> },
              { value: <>60%</>, label: <>B's arc</>, sub: <>overloaded</> },
              { value: <>35%</>, label: <>C's arc</>, sub: <>and if B dies, C takes all of B's load at once</> },
            ]}
          />
          <p>
            And when a server fails, <strong>all</strong> its load lands on <strong>one</strong> neighbour, which might
            then fail too (a cascade).
          </p>
          <h3 id="virtual-nodes-vnodes">Virtual nodes (vnodes)</h3>
          <p>
            The fix is to place <strong>each physical server at many points</strong> on the ring, often 100–200, using
            different hashes like <code>hash("A#1")</code>, <code>hash("A#2")</code> and so on.
          </p>
          <CodeBlock code={code2} />
          <ul>
            <li>
              ✅ <strong>Even distribution.</strong> With many points, each server's total share averages out close to
              1/N.
            </li>
            <li>
              ✅ <strong>Failures spread out.</strong> When A dies, its many small arcs are picked up by{" "}
              <strong>many different</strong> servers, not just one neighbour.
            </li>
            <li>
              ✅ <strong>Mixed hardware.</strong> A server twice as powerful gets twice as many virtual nodes, and
              therefore twice the data.
            </li>
            <li>❌ More metadata to track (the ring map is bigger), which is a small cost.</li>
          </ul>
          <h3 id="replication-on-the-ring">Replication on the ring</h3>
          <p>
            Distributed databases use the ring for <strong>replication</strong> too. Store each key on the{" "}
            <strong>owner and the next N−1 distinct physical servers clockwise</strong>:
          </p>
          <CodeBlock code={code3} />
          <p>
            This is how Dynamo-style databases (Cassandra, Riak, ScyllaDB) decide which nodes hold copies of each piece
            of data, which ties in with the quorums in post 24. Real systems also make sure replicas land on servers in{" "}
            <strong>different racks or availability zones</strong>.
          </p>
          <h3 id="looking-up-a-key-efficiently">Looking up a key efficiently</h3>
          <p>
            In code, the ring is usually a <strong>sorted list</strong> of node positions. To find a key's owner, you{" "}
            <strong>binary search</strong> for the first position greater than or equal to the key's hash, wrapping to
            the start if needed. That's O(log M), where M is the number of virtual nodes, so it's very fast.
          </p>
          <CodeBlock lang="python" code={code4} />
          <p>(MD5 is fine here because we only need an even spread, not security.)</p>
          <h3 id="alternatives-worth-knowing">Alternatives worth knowing</h3>
          <ul>
            <li>
              <strong>Rendezvous hashing (Highest Random Weight, HRW).</strong> For each key, compute a score for{" "}
              <strong>every</strong> server (<code>hash(key + server)</code>) and pick the highest. It's simple and
              gives even distribution with no ring or virtual nodes, but a lookup costs O(N). That's fine for tens or
              hundreds of servers.
            </li>
            <li>
              <strong>Jump consistent hash (from Google).</strong> A tiny, fast algorithm that maps keys to numbered
              buckets 0…N−1 with minimal movement and near-perfect balance. The catch: servers are numbered, so you can
              only add or remove at the <strong>end</strong> of the list.
            </li>
            <li>
              <strong>Maglev hashing (from Google).</strong> Uses a lookup table for very fast, even load-balancer
              routing (post 12).
            </li>
            <li>
              <strong>Consistent hashing with bounded loads.</strong> Adds a cap so no server gets more than, say, 125%
              of the average load; overflow goes to the next server. It protects against hot spots.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅ <strong>Minimal data movement</strong> when servers join or leave (about 1/N), which is essential for
              caches and elastic databases.
            </li>
            <li>
              ✅ With virtual nodes, <strong>even load</strong> and <strong>graceful failure</strong> handling.
            </li>
            <li>
              ❌ <strong>Doesn't solve hot keys.</strong> One very popular key still lands on one server. Use
              replication or caching for those (post 16).
            </li>
            <li>
              ❌ <strong>More complex than modulo.</strong> Every client or router needs the same view of the ring
              (membership must be kept in sync, for example with gossip or a coordination service).
            </li>
            <li>
              ❌ <strong>Range queries</strong> are scattered, just like any hash-based partitioning (post 25).
            </li>
          </ul>
          <p>
            <strong>When not to bother:</strong> a fixed number of servers that never changes, or a system where a full
            reshuffle is cheap (a small cache that's fine to rebuild).
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Akamai and the original paper.</strong> Consistent hashing was introduced in a 1997 paper by David
            Karger and colleagues at MIT, to spread web content across many caching servers. Several of the authors went
            on to help found <strong>Akamai</strong>, one of the first and largest CDNs, where these ideas were put into
            practice.
          </p>
          <p>
            <strong>Amazon Dynamo, Cassandra and ScyllaDB.</strong> Dynamo used a consistent hash ring with virtual
            nodes to spread and replicate data. Cassandra (originally from Facebook) and ScyllaDB adopted the same
            ring-and-tokens model. Adding a node to a cluster moves only a portion of the data to it.
          </p>
          <p>
            <strong>Memcached clients.</strong> A popular consistent-hashing scheme for Memcached, known as{" "}
            <strong>Ketama</strong>, was published by Last.fm. Many Memcached client libraries support it, so adding or
            removing cache servers doesn't wipe out most of the cache.
          </p>
          <p>
            <strong>Discord.</strong> Discord routes each server ("guild") to a particular process in its cluster using
            a consistent hash ring, and has open-sourced its hash-ring library for Elixir. When nodes are added or
            removed, only some guilds move.
          </p>
          <p>
            <strong>Vimeo and bounded loads.</strong> Vimeo engineers added "consistent hashing with bounded loads" to
            the HAProxy load balancer to improve cache efficiency for video delivery while preventing any single server
            from being overloaded. The idea came from a Google research paper.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Why is hash(key) % N a problem for caches?</>,
                a: (
                  <>
                    <p>
                      A key's server depends on N, so changing N — adding a node or losing one — remaps almost every
                      key: about 80% going from 4 to 5 servers, ~99% going from 100 to 101. The cache effectively
                      empties and all traffic hits the database.
                    </p>
                  </>
                ),
              },
              {
                q: <>How does consistent hashing work?</>,
                a: (
                  <>
                    <p>
                      Servers and keys are hashed onto the same ring; each key belongs to the first server clockwise.
                      Adding a server only takes over the arc just before it, and removing one hands its arc to the next
                      server, so only about 1/N of keys move.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are virtual nodes, and why use them?</>,
                a: (
                  <>
                    <p>
                      Each physical server is placed at many points on the ring. That averages out arc sizes for even
                      load, spreads a failed server's keys across many survivors instead of one neighbour, and lets
                      bigger machines take proportionally more by having more vnodes.
                    </p>
                  </>
                ),
              },
              {
                q: <>How is replication done on a ring?</>,
                a: (
                  <>
                    <p>
                      A key is stored on its owner plus the next N−1 distinct physical servers clockwise, ideally in
                      different racks or availability zones. Dynamo, Cassandra and Riak work this way and combine it
                      with read/write quorums.
                    </p>
                  </>
                ),
              },
              {
                q: <>Does consistent hashing solve hot keys?</>,
                a: (
                  <>
                    <p>
                      No. One very popular key still maps to one server. Handle hot keys with replication of that key,
                      local caching, key splitting, or consistent hashing with bounded loads.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's rendezvous hashing?</>,
                a: (
                  <>
                    <p>
                      For each key, score every server with hash(key, server) and pick the highest. It gives minimal
                      movement and even spread with no ring or vnodes, at O(N) per lookup — fine for tens or hundreds of
                      servers.
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
              <strong>Modulo hashing</strong> (<code>hash % N</code>) reshuffles most keys when N changes, which is
              disastrous for caches and data placement.
            </li>
            <li>
              <strong>Consistent hashing</strong> places servers and keys on a <strong>ring</strong>. Each key goes to
              the <strong>next server clockwise</strong>, so adding or removing a server moves only{" "}
              <strong>about 1/N of keys</strong>.
            </li>
            <li>
              <strong>Virtual nodes</strong> give <strong>even distribution</strong>, spread load after failures, and
              support servers of different sizes.
            </li>
            <li>
              The ring also decides <strong>replica placement</strong> in Dynamo-style databases.
            </li>
            <li>
              Know the alternatives: <strong>rendezvous hashing, jump hash, Maglev and bounded loads</strong>. Remember
              that consistent hashing <strong>doesn't fix hot keys</strong>.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>System Design Interview</em> by Alex Xu (chapter 5, "Design Consistent Hashing")
            </li>
            <li>The paper "Consistent Hashing and Random Trees" by Karger et al. (STOC 1997)</li>
            <li>
              The paper "A Fast, Minimal Memory, Consistent Hash Algorithm" (jump consistent hash) by Lamping and Veach
            </li>
            <li>Tom White's article "Consistent Hashing"</li>
            <li>Damian Gryski's article "Consistent Hashing: Algorithmic Tradeoffs"</li>
            <li>The Google Research article "Consistent Hashing with Bounded Loads"</li>
          </ul>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
