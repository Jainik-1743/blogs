import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CodeTrace from "@/components/dsa/CodeTrace";
import DryRun from "@/components/dsa/DryRun";
import DsaLessonPage from "@/components/dsa/DsaLesson";
import Questions from "./questions";
import Recall from "@/components/dsa/Recall";
import CodeBlock from "@/components/sd/CodeBlock";
import { getDsaLesson } from "@/lib/dsa";
import { tracer } from "@/lib/dsa-trace";

const lesson = getDsaLesson("lesson-53");

export const metadata: Metadata = {
  title: `Lesson 53 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "why", label: "The question: are these two connected?" },
  { id: "parent", label: "A parent array and find" },
  { id: "chains", label: "Why plain union can go wrong" },
  { id: "compress", label: "Path compression" },
  { id: "size", label: "Union by size" },
  { id: "speed", label: "How fast is it, really?" },
  { id: "trace", label: "Traced: a union-find run" },
  { id: "components", label: "Counting components and redundant edges" },
  { id: "kruskal", label: "Kruskal's minimum spanning tree" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const naiveCode = `// The simplest possible version: parent[i] is the "boss" of i. A root is its own boss.
const parent = [0, 1, 2, 3, 4, 5];          // at the start every element is alone in its group

function find(x) {
  while (parent[x] !== x) x = parent[x];    // climb the bosses until we reach a root
  return x;
}

function union(a, b) {
  const rootA = find(a), rootB = find(b);
  if (rootA !== rootB) parent[rootA] = rootB;   // hang one root under the other
}

union(0, 1);
union(2, 3);
union(1, 3);
console.log(parent);                        // [ 1, 3, 3, 3, 4, 5 ]
console.log(find(0) === find(2));           // true   (0 -> 1 -> 3 and 2 -> 3: same root)
console.log(find(0) === find(4));           // false`;

const chainCode = `// Danger: uniting in an unlucky order builds one long chain.
const n = 8;
const parent = Array.from({ length: n }, (_, i) => i);

function find(x) {
  let steps = 0;
  while (parent[x] !== x) { x = parent[x]; steps++; }
  return steps;                              // for this demo we return how far we climbed
}

for (let i = 0; i < n - 1; i++) {
  // union(i, i + 1) written as "put the root of the big group under the new element"
  let root = i;
  while (parent[root] !== root) root = parent[root];
  parent[root] = i + 1;
}
console.log(parent);                        // [ 1, 2, 3, 4, 5, 6, 7, 7 ]
console.log(find(0));                       // 7   (one hop per element: find costs O(n))`;

const compressCode = `// Path compression: after finding the root, point every element we passed straight at it.
const parent = [1, 2, 3, 4, 5, 6, 7, 7];    // the chain from the previous example

function find(x) {
  if (parent[x] !== x) parent[x] = find(parent[x]);   // recurse to the root, then re-point x at it
  return parent[x];
}

console.log(find(0));                       // 7
console.log(parent);                        // [ 7, 7, 7, 7, 7, 7, 7, 7 ]
console.log(find(0));                       // 7   (this time it is a single hop)`;

const sizeCode = `class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);        // size[root] = number of elements in that root's group
    this.count = n;                          // number of separate groups
  }
  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);   // path compression
    return this.parent[x];
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;             // already together: nothing to merge
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];   // ra is now the bigger group
    this.parent[rb] = ra;                    // small group hangs under the big one
    this.size[ra] += this.size[rb];
    this.count--;
    return true;
  }
  connected(a, b) { return this.find(a) === this.find(b); }
}

const uf = new UnionFind(6);
console.log(uf.union(0, 1), uf.union(2, 3), uf.union(1, 3)); // true true true
console.log(uf.connected(0, 2), uf.connected(0, 4));          // true false
console.log(uf.union(0, 3), uf.count);                        // false 3`;

const componentsCode = `class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
    this.count = n;
  }
  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    this.count--;
    return true;
  }
}

// How many groups are left after adding these edges?
function countComponents(n, edges) {
  const uf = new UnionFind(n);
  for (const [a, b] of edges) uf.union(a, b);
  return uf.count;
}

// Which edges were redundant (they joined two vertices that were already connected)?
function redundantEdges(n, edges) {
  const uf = new UnionFind(n);
  return edges.filter(([a, b]) => !uf.union(a, b));
}

console.log(countComponents(6, [[0, 1], [1, 2], [3, 4]]));             // 3
console.log(redundantEdges(4, [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]])); // [ [ 3, 0 ], [ 0, 2 ] ]`;

const kruskalCode = `// Kruskal's algorithm: take the cheapest edges first, skip any edge that would close a cycle.
function kruskal(n, edges) {                 // edges are [a, b, weight]
  const parent = Array.from({ length: n }, (_, i) => i);
  const size = new Array(n).fill(1);
  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  const sorted = [...edges].sort((p, q) => p[2] - q[2]);   // cheapest first
  let total = 0;
  const chosen = [];
  for (const [a, b, w] of sorted) {
    let ra = find(a), rb = find(b);
    if (ra === rb) continue;                 // this edge would make a cycle: skip it
    if (size[ra] < size[rb]) [ra, rb] = [rb, ra];
    parent[rb] = ra;
    size[ra] += size[rb];
    total += w;
    chosen.push([a, b, w]);
    if (chosen.length === n - 1) break;      // a tree on n vertices has exactly n - 1 edges
  }
  return chosen.length === n - 1 ? { total, chosen } : null;   // null: the graph is not connected
}

const edges = [[0, 1, 4], [0, 2, 3], [1, 2, 1], [1, 3, 2], [2, 3, 4], [3, 4, 2]];
console.log(kruskal(5, edges)); // { total: 8, chosen: [ [ 1, 2, 1 ], [ 1, 3, 2 ], [ 3, 4, 2 ], [ 0, 2, 3 ] ] }
console.log(kruskal(4, [[0, 1, 5], [2, 3, 1]])); // null`;

const traceSrc = `const parent = [0, 1, 2, 3, 4, 5];
const size = [1, 1, 1, 1, 1, 1];
function find(x) {
  if (parent[x] !== x) parent[x] = find(parent[x]);
  return parent[x];
}
function union(a, b) {
  let ra = find(a), rb = find(b);
  if (ra === rb) return false;
  if (size[ra] < size[rb]) [ra, rb] = [rb, ra];
  parent[rb] = ra;
  size[ra] += size[rb];
  return true;
}
union(0, 1);
union(2, 3);
union(1, 3);
find(3);
union(4, 5);
union(5, 0);
union(3, 1);`;

function unionFindTrace() {
  const t = tracer();
  const parent = [0, 1, 2, 3, 4, 5];
  const size = [1, 1, 1, 1, 1, 1];
  const snap = () => ({ parent: [...parent], size: [...size] });
  t.step(1, "start", "parent[i] = i", "Every element is its own root. There are six groups of one.", snap(), "parent");
  t.step(2, "update", "size[i] = 1", "size[r] only matters when r is a root. It tells us which group is bigger.", snap(), "size");

  // find with a compression step recorded only when a pointer really changes
  function find(x: number): number {
    if (parent[x] !== x) {
      const root = find(parent[x]);
      if (parent[x] !== root) {
        parent[x] = root;
        t.step(4, "update", `compress: parent[${x}] = ${root}`, `Path compression: ${x} now points straight at the root ${root}, so the next find(${x}) takes one step.`, { x, root, ...snap() }, "parent");
      }
    }
    return parent[x];
  }

  function union(a: number, b: number, line: number) {
    t.step(line, "run", `union(${a}, ${b})`, `Merge the group of ${a} with the group of ${b}.`, snap());
    let ra = find(a), rb = find(b);
    t.step(8, "check", `roots: find(${a}) = ${ra}, find(${b}) = ${rb}`, `Compare the roots, not the elements themselves.`, { a, b, ra, rb, ...snap() });
    if (ra === rb) {
      t.step(9, "check", `same root ${ra}: return false`, `${a} and ${b} are already connected. Merging again would change nothing. This is exactly how we spot a redundant edge.`, { a, b, ra, rb, ...snap() });
      return false;
    }
    if (size[ra] < size[rb]) {
      [ra, rb] = [rb, ra];
      t.step(10, "update", `swap: ${ra} has the bigger group`, `size[${rb}] < size[${ra}], so we swap them to make ra the bigger root.`, { ra, rb, ...snap() }, "ra");
    } else {
      t.step(10, "check", `no swap needed (size[${ra}] = ${size[ra]}, size[${rb}] = ${size[rb]})`, `ra is already at least as big as rb. If they are equal, we keep the order.`, { ra, rb, ...snap() });
    }
    parent[rb] = ra;
    t.step(11, "update", `parent[${rb}] = ${ra}`, `The root of the smaller group hangs under the root of the bigger group.`, { ra, rb, ...snap() }, "parent");
    size[ra] += size[rb];
    t.step(12, "update", `size[${ra}] = ${size[ra]}`, `Root ${ra} now has ${size[ra]} elements in its group.`, { ra, rb, ...snap() }, "size");
    return true;
  }

  union(0, 1, 15);
  union(2, 3, 16);
  union(1, 3, 17);
  t.step(18, "run", "find(3)", "3 is two steps from its root: 3 → 2 → 0. Watch the climb make the path flat.", snap());
  const r = find(3);
  t.step(18, "done", `find(3) = ${r}`, `Now parent[3] is 0 directly. The next find(3) takes one step.`, { root: r, ...snap() });
  union(4, 5, 19);
  union(5, 0, 20);
  union(3, 1, 21);
  t.step(21, "done", "one group, root 0", "Everything is connected, and the tree is short. The deepest element is two steps from the root.", snap());
  return t.steps;
}

const traceRows: string[][] = [
  ["union(0, 1)", "0 and 1 are groups of one", "same size, so 1 hangs under 0", "parent = [0, 0, 2, 3, 4, 5]"],
  ["union(2, 3)", "same as before", "3 hangs under 2", "parent = [0, 0, 2, 2, 4, 5]"],
  ["union(1, 3)", "roots 0 and 2, both of size 2", "same size, so 2 hangs under 0", "parent = [0, 0, 0, 2, 4, 5]"],
  ["find(3)", "3 → 2 → 0", "compress: 3 now points to 0", "parent = [0, 0, 0, 0, 4, 5]"],
  ["union(4, 5)", "groups of one", "5 hangs under 4", "parent = [0, 0, 0, 0, 4, 4]"],
  ["union(5, 0)", "roots 4 (size 2) and 0 (size 4)", "swap, so 4 hangs under 0", "parent = [0, 0, 0, 0, 0, 4]"],
  ["union(3, 1)", "roots 0 and 0", "same root: return false", "unchanged"],
];

const speedRows: string[][] = [
  ["Neither trick", "up to O(n)", "one long chain can happen"],
  ["Union by size only", "O(log n)", "each time an element goes one level deeper, its group at least doubles in size"],
  ["Path compression only", "O(log n) amortised", "a slow find now and then is paid for by the flattening it causes"],
  ["Both together", "O(α(n)) amortised", "α(n) is the inverse Ackermann function. It is below 5 for any n that could fit in the universe"],
];

export default function DsaLessonFiftyThreePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="why">The question: are these two connected?</h2>
      <p>
        Lesson 50 counted connected components (separate groups of linked things) by walking through the graph. That works when you get the whole graph at once. But
        what if the edges (links) arrive <em>one at a time</em>, and after each one someone asks: &ldquo;are A and B in the same group now?&rdquo;
        Running BFS again after every edge would cost O(V + E) per question. <strong>Union-Find</strong> is a data structure that keeps elements in separate groups, and can quickly tell whether two elements are in the same group and merge two groups.
        It is also called a <strong>disjoint-set union</strong> (DSU). It answers the same questions much faster. It has two operations:
      </p>
      <ul>
        <li><strong>find(x)</strong>: which group is x in? (It returns one element that stands for the whole group.)</li>
        <li><strong>union(a, b)</strong>: merge the group of a with the group of b.</li>
      </ul>
      <p>
        &ldquo;Disjoint&rdquo; means no element is in two groups at the same time. Two elements are connected exactly when{" "}
        <code>find</code> gives the same answer for both. The structure only ever <em>merges</em> groups. It cannot
        split them, and that is why it is so cheap.
      </p>

      <h2 id="parent">A parent array and find</h2>
      <p>
        For each element, store a <strong>parent</strong>: <code>parent[i]</code>. Keep following parents upward. You will reach an
        element whose parent is itself. That element is the <strong>root</strong>, and it stands for the whole group. Think of each
        group as a small tree where every arrow points up to the root. It is like a company where every worker points to a boss, and the top boss points to themselves.
      </p>
      <CodeBlock lang="js" code={naiveCode} />
      <p>
        <code>find</code> climbs up to the root. <code>union</code> finds both roots and hangs one under the other. If the two roots are
        the same, the elements are already together and nothing happens. Always compare the <em>roots</em>. Two elements in the
        same group often have different parents.
      </p>

      <h2 id="chains">Why plain union can go wrong</h2>
      <p>
        The height of the tree decides how long <code>find</code> takes. If you merge in an unlucky order, the groups can pile up into one
        long chain. Then <code>find</code> has to walk through all n elements:
      </p>
      <CodeBlock lang="js" code={chainCode} />
      <p>
        Two small ideas fix this. You can use them one at a time or together.
      </p>

      <h2 id="compress">Path compression</h2>
      <p>
        When <code>find</code> walks up a long path, it learns the root of every element on that path. So{" "}
        <strong>point each of those elements straight at the root</strong>. The first find may be slow, but it flattens the tree, so the
        next finds are fast. In code this is one extra line:
      </p>
      <CodeBlock lang="js" code={compressCode} />
      <Callout kind="note" label="Recursion depth">
        The recursive <code>find</code> uses the call stack (the computer&apos;s list of unfinished function calls), one entry per step up. With union by size (next section) the tree height stays
        around log n, so this is safe. If you use compression without union by size on a huge input, write <code>find</code> as a loop. First find the root.
        Then walk the path a second time to point each element at the root.
      </Callout>

      <h2 id="size">Union by size</h2>
      <p>
        The second idea stops the chain before it starts. When you merge, always hang the <strong>smaller</strong> group under the
        root of the bigger group. An element only gets deeper when its group is merged into a group at least as big. So
        its group at least doubles in size each time. A group can double only log₂ n times, so no element is deeper than about log₂ n.
        (A similar idea is <strong>union by rank</strong>. It compares tree heights instead of sizes and gives the same guarantee. Size
        is easier to keep correct once compression starts making trees shorter.) Here is the version to memorise. It also has a counter for the
        number of groups:
      </p>
      <CodeBlock lang="js" code={sizeCode} />

      <h2 id="speed">How fast is it, really?</h2>
      <DryRun
        title="cost of one find or union"
        cols={["Heuristics used", "Cost", "Why"]}
        rows={speedRows}
        note="With both tricks, m operations on n elements cost O(m × α(n)) in total."
      />
      <p>
        People often say &ldquo;union-find is O(1)&rdquo;. This is a fair shortcut, but it is not exactly true. The exact cost is{" "}
        <strong>O(α(n)) amortised</strong> per operation. α is the <strong>inverse Ackermann function</strong>, a function that
        grows so slowly that α(n) is at most 4 for any n you could ever store. So in practice it acts like a constant, but
        in maths it is not one. &ldquo;Amortised&rdquo; means averaged over a whole series of operations. One{" "}
        <code>find</code> can still be slow, but slow calls flatten the tree so well that the average stays tiny.
        In interviews, say &ldquo;nearly constant, formally inverse Ackermann&rdquo; and you are correct.
      </p>

      <h2 id="trace">Traced: a union-find run</h2>
      <CodeTrace
        code={traceSrc}
        steps={unionFindTrace()}
        caption="Six elements are merged into one group. Watch find(3) make a path shorter, and watch the last union return false because the elements were already connected."
      />
      <DryRun
        title="the same run as a table"
        cols={["Call", "What we see", "What happens", "Result"]}
        rows={traceRows}
      />

      <h2 id="components">Counting components and redundant edges</h2>
      <p>
        Start with <code>count = n</code> groups. Every union that <em>works</em> merges two groups, so it lowers the count by one.
        After all the edges, <code>count</code> is the number of connected components. A union that <em>fails</em> (same root) means this
        edge joined two vertices that were already connected. It closes a <strong>cycle</strong> (a loop). We call it a{" "}
        <strong>redundant edge</strong>, because removing it would not disconnect anything. This one return value gives you cycle
        detection in an undirected graph (edges with no direction) for free.
      </p>
      <CodeBlock lang="js" code={componentsCode} />
      <Callout kind="note" label="Undirected graphs only">
        Union-find forgets which way an edge pointed. Use it for connectivity in undirected graphs. To find cycles in a{" "}
        <em>directed</em> graph (edges with a direction), use the topological sort from lesson 51.
      </Callout>

      <h2 id="kruskal">Kruskal&apos;s minimum spanning tree</h2>
      <p>
        A <strong>spanning tree</strong> of a connected, weighted, undirected graph is a set of n − 1 edges that links every
        vertex with no cycle. The <strong>minimum spanning tree</strong> (MST) is the one with the smallest total weight. Think of
        laying cable to connect every city for the lowest cost.
      </p>
      <p>
        <strong>Kruskal&apos;s algorithm</strong> is greedy (lesson 47). Greedy means you always take the best-looking choice right now. Sort all edges by weight. Go through them from the cheapest.
        Keep an edge if it joins two different groups. Skip it if it would close a cycle. Union-find is
        exactly the cycle test. Sorting costs O(E log E). The union-find work adds a nearly constant cost per edge. So the total is
        O(E log E).
      </p>
      <CodeBlock lang="js" code={kruskalCode} />
      <p>
        If you reach the end of the edge list with fewer than n − 1 edges chosen, the graph was not connected. So no spanning tree exists.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>
        Look for these clue words: &ldquo;connected&rdquo;, &ldquo;groups&rdquo;, &ldquo;merge&rdquo;, &ldquo;same component&rdquo;,
        &ldquo;does this edge create a cycle&rdquo;, or &ldquo;connect everything at the lowest cost&rdquo;.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the parent array, <code>find</code> and <code>union</code> from memory.</>,
          <>Explain how a chain forms and which two tricks stop it.</>,
          <>Say what path compression does, and why union by size keeps the depth around log n.</>,
          <>State the real cost: amortised O(α(n)), nearly constant, but not literally O(1).</>,
          <>Say how to count components and how to spot a redundant edge.</>,
          <>Describe Kruskal&apos;s algorithm and why it needs union-find.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        That finishes Part 13 (graphs). <strong>Lesson 54</strong> starts Part 14, <strong>dynamic programming</strong>. We begin with
        the plain recursion from Part 8. You will see that it solves the same small problems again and again. We fix that by saving answers
        (memoization: remembering the result of each call), and then by filling a table in order (tabulation: building answers from the smallest problem up).
      </p>
    </DsaLessonPage>
  );
}
