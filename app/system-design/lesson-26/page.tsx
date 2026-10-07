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
print(ring.owner("user:42"))   # cache-a`;

export default function SdLessonTwoSixPage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>
            You have <strong>4 cache servers</strong>. A cache is a fast store that keeps copies of data. You spread the keys
            between the servers with a simple rule. A <em>hash</em> is a number that a function makes from a key. The{" "}
            <code>%</code> sign means "remainder after division":
          </p>
          <CodeBlock code={code1} />
          <p>
            It works nicely. Then traffic grows and you add a <strong>5th server</strong>. The rule becomes{" "}
            <code>hash(key) % 5</code>. Suddenly <strong>about 80% of the keys map to a different server</strong>. Your
            cache hit ratio (the share of requests that find their data in the cache) drops from 95% to almost zero.
            Every request goes to the database, and the database cannot cope and fails.
          </p>
          <p>
            The same thing happens when a server <strong>crashes</strong>. The number changes from 4 to 3, and most keys
            move again.
          </p>
          <p>
            <strong>Consistent hashing</strong> fixes this. It is a way to choose a server for each key so that, when a
            server is added or removed, <strong>only a small part of the keys move</strong>. This is roughly{" "}
            <code>1/N</code> of them, where N is the number of servers.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Imagine a <strong>round table</strong> with seats numbered from 0 to 99, like the numbers on a clock face.
          </p>
          <ul>
            <li>
              A few <strong>waiters</strong> (the servers) stand at certain seats: waiter A at seat 10, B at seat 45, C at
              seat 80.
            </li>
            <li>
              Every <strong>guest</strong> (a key) gets a seat number from a hash function.
            </li>
            <li>
              Each guest is served by <strong>the first waiter you meet when you walk clockwise</strong> from the guest's
              seat.
            </li>
          </ul>
          <p>
            Now a new waiter D comes and stands at seat 60. <strong>Only the guests between seats 45 and 60</strong> switch
            to D. Everyone else keeps their waiter.
          </p>
          <p>
            If waiter B leaves, only B's guests move. They go to the next waiter clockwise.{" "}
            <strong>Nobody else is affected.</strong>
          </p>
          <p>
            This round table is the <strong>hash ring</strong>.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="why-modulo-hashing-breaks">Why modulo hashing breaks</h3>
          <p>
            With <code>hash(key) % N</code>, the server for each key depends on <strong>N</strong> (the number of servers).
            If N changes, the answer changes for most keys. Here is an example, using small numbers as the hashes:
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
            In this small sample, 5 of 9 keys moved. Across all keys, going from 4 to 5 servers keeps only about{" "}
            <strong>1 in 5</strong> keys in place, so <strong>about 80% move</strong>. Going from 100 to 101 servers
            moves about <strong>99%</strong>. For a cache, this means a flood of misses (the data is not found in the
            cache). For a database, it means moving nearly all the data.
          </p>
          <h3 id="the-hash-ring">The hash ring</h3>
          <ol>
            <li>
              Imagine all possible outputs of a hash function (say 0 to 2³² − 1) arranged in a <strong>circle</strong>. After
              the biggest number, you wrap around to 0.
            </li>
            <li>
              Hash each <strong>server</strong> (for example, its name or IP address) to get a point on the ring.
            </li>
            <li>
              Hash each <strong>key</strong> to get a point on the ring.
            </li>
            <li>
              A key belongs to the <strong>first server clockwise</strong> from its position.
            </li>
          </ol>
          <p>
            To keep it simple, use a small ring from 0 to 99, with servers at{" "}
            <strong>A = 10, B = 45, C = 80</strong>. Picture this line bent into a circle, so that position 99 joins back
            to 0:
          </p>
          <HashRing caption="A real hash ring with 48 keys. Add or remove servers and count the keys that move. Then switch to hash % N and try the same thing." />
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
                  <td>goes past 99, wraps to 0, then reaches 10</td>
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
            <strong>Only the keys between 45 and 60</strong> (the arc just before D) move, from C to D. Everything that A
            and B own is untouched. So are C's other keys.
          </p>
          <h3 id="removing-a-server">Removing a server</h3>
          <p>
            Now suppose <strong>B (45) dies</strong>. Its keys (the arc from 10 to 45, including k2) move to the{" "}
            <strong>next server clockwise</strong>, which is C. A's keys are not affected.
          </p>
          <p>
            On average, adding or removing one server moves only about <strong>1/N of the keys</strong>. With 5 servers,
            that is about 20%. With modulo hashing it is about 80%.
          </p>
          <h3 id="the-problem-with-a-simple-ring-uneven-load">The problem with a simple ring: uneven load</h3>
          <p>
            A server's arc is the part of the ring that it owns. If you have only a few servers at random points, the arcs
            can be <strong>very uneven</strong>:
          </p>
          <Stats
            caption="Why a plain ring with three servers is not enough."
            stats={[
              { value: <>5%</>, label: <>A's arc</>, sub: <>nearly idle</> },
              { value: <>60%</>, label: <>B's arc</>, sub: <>overloaded</> },
              { value: <>35%</>, label: <>C's arc</>, sub: <>and if B dies, C takes all of B's load at once</> },
            ]}
          />
          <p>
            Also, when a server fails, <strong>all</strong> of its load goes to <strong>one</strong> neighbour. That
            neighbour might then fail too. This chain of failures is called a cascade.
          </p>
          <h3 id="virtual-nodes-vnodes">Virtual nodes (vnodes)</h3>
          <p>
            The fix is to place <strong>each physical server at many points</strong> on the ring, often 100–200. Each point
            is a virtual node (vnode). You make the points with different hashes, like <code>hash("A#1")</code>,{" "}
            <code>hash("A#2")</code> and so on.
          </p>
          <CodeBlock code={code2} />
          <ul>
            <li>
              ✅ <strong>Even distribution.</strong> With many points, each server's total share becomes close to
              1/N.
            </li>
            <li>
              ✅ <strong>Failures spread out.</strong> When A dies, its many small arcs go to{" "}
              <strong>many different</strong> servers, not just to one neighbour.
            </li>
            <li>
              ✅ <strong>Mixed hardware.</strong> A server that is twice as powerful gets twice as many virtual nodes, so it
              holds twice the data.
            </li>
            <li>❌ More metadata (extra information) to track, because the ring map is bigger. This is a small cost.</li>
          </ul>
          <h3 id="replication-on-the-ring">Replication on the ring</h3>
          <p>
            Distributed databases also use the ring for <strong>replication</strong> (keeping copies). Store each key on the{" "}
            <strong>owner and on the next N−1 distinct physical servers clockwise</strong>. Here N is the number of
            copies you want:
          </p>
          <CodeBlock code={code3} />
          <p>
            This is how Dynamo-style databases (Cassandra, Riak, ScyllaDB) decide which nodes hold the copies of each piece
            of data. It connects with the quorums in Lesson 24. Real systems also make sure that the replicas are on
            servers in <strong>different racks or availability zones</strong> (separate data centre areas, so one
            failure does not hit all copies).
          </p>
          <h3 id="looking-up-a-key-efficiently">Looking up a key efficiently</h3>
          <p>
            In code, the ring is usually a <strong>sorted list</strong> of node positions. To find the owner of a key, you{" "}
            <strong>binary search</strong> for the first position after the key's hash. Binary search checks the middle
            of the list and keeps only the half that can hold the answer. If there is no position after the hash, you
            wrap around to the start of the list. This takes O(log M) steps, where M is the number of virtual nodes. So
            it is very fast.
          </p>
          <CodeBlock lang="python" code={code4} />
          <p>(MD5 is fine here, because we only need an even spread of numbers, not security.)</p>
          <h3 id="alternatives-worth-knowing">Alternatives worth knowing</h3>
          <ul>
            <li>
              <strong>Rendezvous hashing (Highest Random Weight, HRW).</strong> For each key, compute a score for{" "}
              <strong>every</strong> server (<code>hash(key + server)</code>) and pick the server with the highest score.
              It is simple and gives an even spread, with no ring or virtual nodes. But one lookup takes O(N) steps. This
              is fine for tens or hundreds of servers.
            </li>
            <li>
              <strong>Jump consistent hash (from Google).</strong> A tiny and fast algorithm. It maps keys to numbered
              buckets 0…N−1, with little movement and an almost perfect balance. The catch: the servers are numbered, so
              you can only add or remove servers at the <strong>end</strong> of the list.
            </li>
            <li>
              <strong>Maglev hashing (from Google).</strong> It uses a lookup table to route traffic in a load balancer
              (Lesson 12) very fast and evenly.
            </li>
            <li>
              <strong>Consistent hashing with bounded loads.</strong> This adds a limit, so that no server gets more than,
              say, 125% of the average load. The extra load goes to the next server. It protects against hot spots.
            </li>
          </ul>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅ <strong>Very little data moves</strong> when servers join or leave (about 1/N). This is essential for
              caches and for elastic databases (databases that grow and shrink as needed).
            </li>
            <li>
              ✅ With virtual nodes, you get <strong>even load</strong> and <strong>smooth handling of failures</strong>.
            </li>
            <li>
              ❌ <strong>It does not solve hot keys.</strong> One very popular key still lands on one server. Use
              replication or caching for those keys (Lesson 16).
            </li>
            <li>
              ❌ <strong>More complex than modulo.</strong> Every client or router needs the same view of the ring. The list
              of members must be kept in sync, for example with gossip (nodes tell each other the news) or with a
              coordination service.
            </li>
            <li>
              ❌ <strong>Range queries</strong> are scattered across servers, like in any hash-based partitioning (Lesson 25).
            </li>
          </ul>
          <p>
            <strong>When not to bother:</strong> you have a fixed number of servers that never changes. Or a full
            reshuffle is cheap, for example a small cache that is easy to rebuild.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Akamai and the original paper.</strong> Consistent hashing was introduced in a 1997 paper by David
            Karger and colleagues at MIT. It was made to spread web content across many caching servers. Several of the
            authors helped to found <strong>Akamai</strong>, one of the first and largest CDNs (networks of servers that
            deliver web content). Akamai used these ideas in practice.
          </p>
          <p>
            <strong>Amazon Dynamo, Cassandra and ScyllaDB.</strong> Dynamo used a consistent hash ring with virtual
            nodes to spread and copy data. Cassandra (originally built at Facebook) and ScyllaDB use the same
            ring-and-tokens model. When you add a node to a cluster, only a part of the data moves to it.
          </p>
          <p>
            <strong>Memcached clients.</strong> A popular consistent-hashing method for Memcached, called{" "}
            <strong>Ketama</strong>, was published by Last.fm. Many Memcached client libraries support it. So adding or
            removing cache servers does not wipe out most of the cache.
          </p>
          <p>
            <strong>Discord.</strong> Discord uses a consistent hash ring to send each server ("guild") to one particular process in
            its cluster. It has open-sourced its hash-ring library for Elixir (a programming language). When nodes are
            added or removed, only some guilds move.
          </p>
          <p>
            <strong>Vimeo and bounded loads.</strong> Vimeo engineers added "consistent hashing with bounded loads" to
            the HAProxy load balancer. It makes caches work better for video delivery, and it stops any single server
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
                      The server for a key depends on N. So if N changes (you add a node or lose one), almost every key
                      gets a new server: about 80% when going from 4 to 5 servers, and about 99% when going from 100 to
                      101. The cache is effectively empty, and all traffic hits the database.
                    </p>
                  </>
                ),
              },
              {
                q: <>How does consistent hashing work?</>,
                a: (
                  <>
                    <p>
                      Servers and keys are hashed onto the same ring. Each key belongs to the first server clockwise.
                      A new server only takes over the arc just before it. A removed server hands its arc to the next
                      server. So only about 1/N of the keys move.
                    </p>
                  </>
                ),
              },
              {
                q: <>What are virtual nodes, and why use them?</>,
                a: (
                  <>
                    <p>
                      Each physical server is placed at many points on the ring. This evens out the arc sizes, so the
                      load is even. It also spreads the keys of a failed server across many servers instead of one
                      neighbour. And bigger machines can take more load by having more vnodes.
                    </p>
                  </>
                ),
              },
              {
                q: <>How is replication done on a ring?</>,
                a: (
                  <>
                    <p>
                      A key is stored on its owner plus the next N−1 distinct physical servers clockwise. Ideally these
                      servers are in different racks or availability zones. Dynamo, Cassandra and Riak work this way,
                      and they combine it with read/write quorums.
                    </p>
                  </>
                ),
              },
              {
                q: <>Does consistent hashing solve hot keys?</>,
                a: (
                  <>
                    <p>
                      No. One very popular key still maps to one server. Handle hot keys by replicating that key, by
                      caching it locally, by splitting the key, or by using consistent hashing with bounded loads.
                    </p>
                  </>
                ),
              },
              {
                q: <>What's rendezvous hashing?</>,
                a: (
                  <>
                    <p>
                      For each key, score every server with hash(key, server) and pick the highest score. It moves few
                      keys and spreads them evenly, with no ring or vnodes. Each lookup costs O(N), which is fine for
                      tens or hundreds of servers.
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
              <strong>Modulo hashing</strong> (<code>hash % N</code>) reshuffles most keys when N changes. This is very bad
              for caches and for data placement.
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
              that consistent hashing <strong>does not fix hot keys</strong>.
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
