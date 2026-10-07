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

const lesson = getDsaLesson("lesson-52");

export const metadata: Metadata = {
  title: `Lesson 52 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "why", label: "What a shortest path means" },
  { id: "bfs", label: "BFS when every edge costs the same" },
  { id: "heap", label: "A heap in JavaScript" },
  { id: "dijkstra", label: "Dijkstra's algorithm" },
  { id: "trace", label: "Traced: Dijkstra on five vertices" },
  { id: "negative", label: "Why negative weights break it" },
  { id: "grid", label: "Shortest paths on a grid" },
  { id: "bellman", label: "Bellman–Ford and limited stops" },
  { id: "choose", label: "Which algorithm?" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const bfsGridCode = `// Fewest steps from the top-left to the bottom-right of a maze. 0 = open, 1 = wall.
function shortestPath(maze) {
  const rows = maze.length, cols = maze[0].length;
  if (maze[0][0] === 1 || maze[rows - 1][cols - 1] === 1) return -1;
  const dist = Array.from({ length: rows }, () => new Array(cols).fill(-1));   // -1 = not reached yet
  dist[0][0] = 0;
  const queue = [[0, 0]];
  let head = 0;
  while (head < queue.length) {
    const [r, c] = queue[head++];
    if (r === rows - 1 && c === cols - 1) return dist[r][c];   // BFS reaches the goal by its shortest route first
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && maze[nr][nc] === 0 && dist[nr][nc] === -1) {
        dist[nr][nc] = dist[r][c] + 1;           // marking on enqueue, as in lesson 50
        queue.push([nr, nc]);
      }
    }
  }
  return -1;
}

console.log(shortestPath([[0, 0, 0], [1, 1, 0], [0, 0, 0]])); // 4
console.log(shortestPath([[0, 1], [1, 0]]));                  // -1`;

const heapCode = `// JavaScript has no built-in priority queue, so we write a small binary min-heap.
// The comparator works like the one in Array.prototype.sort: negative means "a comes out first".
class Heap {
  constructor(compare) { this.data = []; this.compare = compare; }
  get size() { return this.data.length; }
  peek() { return this.data[0]; }
  push(x) {
    const a = this.data;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {                               // sift up: swap with the parent while smaller
      const p = (i - 1) >> 1;
      if (this.compare(a[i], a[p]) >= 0) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop() {
    const a = this.data;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      while (true) {                              // sift down: swap with the smaller child
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && this.compare(a[l], a[m]) < 0) m = l;
        if (r < a.length && this.compare(a[r], a[m]) < 0) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}

const pq = new Heap((a, b) => a[0] - b[0]);       // entries are [distance, vertex]; smallest distance first
pq.push([7, "E"]); pq.push([2, "B"]); pq.push([5, "C"]); pq.push([1, "A"]);
console.log(pq.pop(), pq.pop(), pq.size);        // [ 1, 'A' ] [ 2, 'B' ] 2
const maxHeap = new Heap((a, b) => b - a);        // flip the comparator for a max-heap
[3, 9, 4].forEach((x) => maxHeap.push(x));
console.log(maxHeap.pop());                       // 9`;

const dijkstraCode = `// Dijkstra: always finalise the unfinished vertex that is closest to the source.
function dijkstra(n, edges, src) {                // edges: [from, to, weight], directed, weights >= 0
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b, w] of edges) graph[a].push([b, w]);

  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  const pq = new Heap((x, y) => x[0] - y[0]);
  pq.push([0, src]);
  while (pq.size) {
    const [d, v] = pq.pop();
    if (d > dist[v]) continue;                    // stale entry: a shorter route to v was found after this was pushed
    for (const [next, w] of graph[v]) {
      if (d + w < dist[next]) {
        dist[next] = d + w;
        pq.push([dist[next], next]);              // lazy deletion: the old entry stays in the heap, we just skip it later
      }
    }
  }
  return dist;
}

// (the same Heap class as in the previous section, compacted)
class Heap {
  constructor(compare) { this.data = []; this.compare = compare; }
  get size() { return this.data.length; }
  push(x) {
    const a = this.data; a.push(x);
    let i = a.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (this.compare(a[i], a[p]) >= 0) break; [a[i], a[p]] = [a[p], a[i]]; i = p; }
  }
  pop() {
    const a = this.data, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < a.length && this.compare(a[l], a[m]) < 0) m = l;
        if (r < a.length && this.compare(a[r], a[m]) < 0) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]]; i = m;
      }
    }
    return top;
  }
}

const edges = [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5], [3, 4, 3]];
console.log(dijkstra(5, edges, 0));               // [ 0, 3, 1, 4, 7 ]
console.log(dijkstra(3, [[0, 1, 5]], 0));         // [ 0, 5, Infinity ]   (vertex 2 is unreachable)`;

const negativeCode = `// The textbook rule "a vertex is final the first time it is popped" is only safe when weights >= 0.
function dijkstraNoRevisit(n, edges, src) {
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b, w] of edges) graph[a].push([b, w]);
  const dist = new Array(n).fill(Infinity), done = new Array(n).fill(false);
  dist[src] = 0;
  for (let round = 0; round < n; round++) {
    let v = -1;                                   // simple O(V^2) version: pick the closest unfinished vertex
    for (let u = 0; u < n; u++) if (!done[u] && (v === -1 || dist[u] < dist[v])) v = u;
    if (v === -1 || dist[v] === Infinity) break;
    done[v] = true;                               // "final": we never look at v again
    for (const [next, w] of graph[v]) if (!done[next] && dist[v] + w < dist[next]) dist[next] = dist[v] + w;
  }
  return dist;
}

function bellmanFord(n, edges, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  for (let round = 1; round < n; round++) {
    let changed = false;
    for (const [a, b, w] of edges) {
      if (dist[a] !== Infinity && dist[a] + w < dist[b]) { dist[b] = dist[a] + w; changed = true; }
    }
    if (!changed) break;
  }
  return dist;
}

const edges = [[0, 1, 2], [0, 2, 3], [2, 1, -2]];   // the route 0 -> 2 -> 1 costs 3 + (-2) = 1
console.log(dijkstraNoRevisit(3, edges, 0));        // [ 0, 2, 3 ]   WRONG: vertex 1 is really 1
console.log(bellmanFord(3, edges, 0));              // [ 0, 1, 3 ]   correct`;

const bellmanCode = `// Cheapest price from src to dst using at most k stops (that is, at most k + 1 flights).
function cheapestWithStops(n, flights, src, dst, k) {
  let prices = new Array(n).fill(Infinity);
  prices[src] = 0;
  for (let round = 0; round <= k; round++) {      // round i allows paths of at most i + 1 flights
    const next = [...prices];                     // read from the old array so one round adds exactly one flight
    for (const [from, to, price] of flights) {
      if (prices[from] !== Infinity && prices[from] + price < next[to]) next[to] = prices[from] + price;
    }
    prices = next;
  }
  return prices[dst] === Infinity ? -1 : prices[dst];
}

const flights = [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]];
console.log(cheapestWithStops(4, flights, 0, 3, 1)); // 700   (0 -> 1 -> 3)
console.log(cheapestWithStops(4, flights, 0, 3, 2)); // 400   (0 -> 1 -> 2 -> 3, one more stop is cheaper)
console.log(cheapestWithStops(4, flights, 0, 3, 0)); // -1    (no direct flight)`;

const traceSrc = `const dist = new Array(n).fill(Infinity);
dist[src] = 0;
const pq = new Heap((a, b) => a[0] - b[0]);
pq.push([0, src]);
while (pq.size) {
  const [d, v] = pq.pop();
  if (d > dist[v]) continue;
  for (const [next, w] of graph[v]) {
    if (d + w < dist[next]) {
      dist[next] = d + w;
      pq.push([dist[next], next]);
    }
  }
}
return dist;`;

function dijkstraTrace() {
  const t = tracer();
  const n = 5, src = 0;
  const graph: [number, number][][] = [[[1, 4], [2, 1]], [[3, 1]], [[1, 2], [3, 5]], [[4, 3]], []];
  const dist = new Array<number>(n).fill(Infinity);
  // The heap is shown sorted by (distance, vertex); it pops in exactly that order.
  let pq: [number, number][] = [];
  const shown = () => pq.map(([d, v]) => `${d}@${v}`);
  const sortPq = () => pq.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  t.step(1, "start", "dist = all Infinity", "No distance is known yet.", { dist: [...dist] }, "dist");
  dist[src] = 0;
  t.step(2, "update", "dist[0] = 0", "The source is 0 away from itself.", { dist: [...dist] }, "dist");
  t.step(3, "update", "create the heap", "Entries are [distance, vertex]; the smallest distance comes out first.", { dist: [...dist], heap: shown() }, "heap");
  pq.push([0, src]);
  t.step(4, "update", "push [0, 0]", "Start from the source.", { dist: [...dist], heap: shown() }, "heap");
  while (pq.length) {
    sortPq();
    const [d, v] = pq.shift()!;
    t.step(6, "update", `pop [${d}, ${v}]`, `The closest unfinished entry: vertex ${v} at distance ${d}.`, { d, v, dist: [...dist], heap: shown() }, "v");
    if (d > dist[v]) {
      t.step(7, "check", `stale: ${d} > dist[${v}] = ${dist[v]}`, `A shorter route to ${v} was found after this entry was pushed, so skip it.`, { d, v, dist: [...dist], heap: shown() }, "d");
      continue;
    }
    for (const [next, w] of graph[v]) {
      if (d + w < dist[next]) {
        const old = dist[next];
        dist[next] = d + w;
        pq.push([dist[next], next]);
        t.step(11, "update", `dist[${next}] = ${d + w}`, `${d} + ${w} = ${d + w} beats ${old === Infinity ? "Infinity" : old}. Push the new entry.`, { d, v, next, dist: [...dist], heap: shown() }, "dist");
      } else {
        t.step(9, "check", `${d + w} does not beat dist[${next}] = ${dist[next]}`, `Going through ${v} to ${next} costs ${d + w}, no better than what we have.`, { d, v, next, dist: [...dist], heap: shown() }, "next");
      }
    }
  }
  t.print(dist);
  t.step(14, "done", "heap is empty", "Every vertex is final: the cheapest costs from vertex 0 are [0, 3, 1, 4, 7].", { dist: [...dist], heap: shown() }, "dist");
  return t.steps;
}

const chooseRows: string[][] = [
  ["Every edge costs 1 (or all equal)", "BFS", "O(V + E)"],
  ["Costs differ, none negative", "Dijkstra", "O((V + E) log V)"],
  ["Some costs negative, or a cap on the number of edges used", "Bellman–Ford", "O(V × E), or O(k × E) for k rounds"],
  ["Cost is the largest (or smallest) edge on the path, not the sum", "Dijkstra with max/min instead of +", "O((V + E) log V)"],
  ["Costs are only 0 or 1", "0-1 BFS (a deque) or Dijkstra", "O(V + E)"],
];

const gridRows: string[][] = [
  ["Moves cost 1 each", "BFS from the start", "queue + a distance grid"],
  ["Entering a cell costs its value", "Dijkstra on cells", "heap of [cost, row, col]"],
  ["Cost is the biggest height jump (or biggest height) so far", "Dijkstra with max()", "heap of [worst so far, row, col]"],
  ["8 directions allowed", "same BFS, 8 offsets", "diagonal steps still cost 1"],
];

export default function DsaLessonFiftyTwoPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="why">What a shortest path means</h2>
      <p>
        Lesson 50 found the fewest <em>edges</em> between two vertices. Real maps are not that simple: roads have lengths, flights have prices,
        network links have delays. When edges carry a number, called a <strong>weight</strong> (or cost), the <strong>shortest path</strong> is the
        route whose weights add up to the smallest total, even if it uses more edges than another route.
      </p>
      <p>
        Which algorithm to use depends on the weights. Equal weights: BFS. Different but never negative: <strong>Dijkstra</strong>. Negative
        weights, or a limit on how many edges you may use: <strong>Bellman–Ford</strong>. The rest of the lesson takes them in that order.
      </p>

      <h2 id="bfs">BFS when every edge costs the same</h2>
      <p>
        BFS visits vertices in order of how many edges they are from the start, so the first time it reaches the target, it has found a path
        with the fewest edges. If every edge costs the same, that is the cheapest path. A <strong>grid</strong> is the most common case: each
        cell is a vertex, each step to a neighbouring open cell is an edge of cost 1.
      </p>
      <CodeBlock lang="js" code={bfsGridCode} />
      <p>
        Two details worth repeating from lesson 50: mark cells when you <em>enqueue</em> them, and move a <code>head</code> index instead of
        calling <code>queue.shift()</code>. Allowing diagonal moves just means eight offsets instead of four.
      </p>

      <h2 id="heap">A heap in JavaScript</h2>
      <p>
        With different weights the next vertex to process is no longer &quot;the oldest in line&quot; but &quot;the one with the smallest total
        so far&quot;. A <strong>priority queue</strong> hands out the smallest item each time, and it is usually built on a{" "}
        <strong>binary heap</strong>: an array that is kept so that each item is smaller than its two children (item <code>i</code> has children at{" "}
        <code>2i + 1</code> and <code>2i + 2</code>). Adding or removing the smallest costs O(log n), where scanning for the minimum would cost O(n).
      </p>
      <p>
        JavaScript has no built-in heap, so interviews expect you to write one (or say you would use a library). Here is a compact one with a
        comparator, which you can paste into any solution:
      </p>
      <CodeBlock lang="js" code={heapCode} />

      <h2 id="dijkstra">Dijkstra&apos;s algorithm</h2>
      <p>
        <strong>Dijkstra&apos;s algorithm</strong> keeps a best-known distance <code>dist[v]</code> for every vertex (starting at infinity) and
        repeats one step: take the vertex with the smallest tentative distance and <strong>relax</strong> its outgoing edges, which means
        &quot;if going through me to my neighbour is cheaper than what the neighbour has now, update it&quot;.
      </p>
      <p>
        Why is the vertex we take final? Every other unfinished vertex is at least as far away, and weights are never negative, so any detour
        through them can only add cost. Nothing can improve the vertex we just took.
      </p>
      <p>
        With a heap, we push <code>[distance, vertex]</code> whenever a distance improves. A vertex can then be in the heap more than once. We do
        not search for and delete the old entry (a plain heap cannot do that cheaply); instead, when an entry is popped and its distance is
        larger than <code>dist[v]</code>, it is <strong>stale</strong> and we skip it. This trick is called <strong>lazy deletion</strong>.
      </p>
      <CodeBlock lang="js" code={dijkstraCode} />
      <p>
        There are at most E pushes, each costing O(log E) = O(log V), so the total is O((V + E) log V), usually written O(E log V). To recover the
        actual route, also store <code>parent[next] = v</code> whenever you improve <code>dist[next]</code>, and walk the parents backwards from the target.
      </p>

      <h2 id="trace">Traced: Dijkstra on five vertices</h2>
      <CodeTrace
        code={traceSrc}
        steps={dijkstraTrace()}
        caption="Watch vertex 1: it is first reached at cost 4, then improved to 3 through vertex 2. The old entry 4@1 stays in the heap and is skipped as stale when it is popped. (The heap is shown sorted, entries written distance@vertex.)"
      />

      <h2 id="negative">Why negative weights break it</h2>
      <p>
        The argument above leaned on &quot;a detour can only add cost&quot;. A negative edge makes a detour able to <em>subtract</em> cost, so a vertex
        finalised early can later be improved. In the example, vertex 1 looks best at 2 and is finalised, but the longer route
        0 → 2 → 1 costs 3 + (−2) = 1.
      </p>
      <CodeBlock lang="js" code={negativeCode} />
      <Callout kind="warn" label="Even with lazy deletion, don't rely on it">
        The heap version with the stale check happens to re-relax such a vertex and can return the right answer on some negative inputs, but it
        can then take exponential time, and with a negative <em>cycle</em> (a loop whose total is below zero) the true shortest distance is minus
        infinity and it never stops. If the weights can be negative, use Bellman–Ford.
      </Callout>

      <h2 id="grid">Shortest paths on a grid</h2>
      <p>
        On a grid the vertices are cells and edges go to the four (or eight) neighbours. What the edge costs decides the tool:
      </p>
      <DryRun title="grid problems and their tools" cols={["The cost of a move", "Use", "What goes in the queue / heap"]} rows={gridRows} />
      <p>
        Dijkstra is not limited to sums. It works for any path cost that can only stay the same or grow as the path gets longer, with the
        &quot;extend the path&quot; step replaced by <code>max</code>. For &quot;minimise the largest height jump on the way&quot; you push{" "}
        <code>[max(worst so far, jump), r, c]</code>. Questions 3 and 6 do exactly that.
      </p>

      <h2 id="bellman">Bellman–Ford and limited stops</h2>
      <p>
        <strong>Bellman–Ford</strong> is simpler and slower: relax <em>every</em> edge, and repeat. After round <code>i</code>, every distance is
        correct for paths with at most <code>i</code> edges. A shortest path with no repeated vertex has at most V − 1 edges, so V − 1 rounds
        suffice, and it copes with negative weights. If one more round still improves something, there is a negative cycle. That round-by-round
        meaning is also what makes it ideal for <strong>limited stops</strong>: stop after k + 1 rounds and you have the cheapest price using at
        most k + 1 flights.
      </p>
      <CodeBlock lang="js" code={bellmanCode} />
      <p>
        Note the copy: each round reads from <code>prices</code> and writes to <code>next</code>. Updating one array in place would let a single
        round chain several flights together and break the stop limit.
      </p>

      <h2 id="choose">Which algorithm?</h2>
      <DryRun
        title="choosing a shortest-path tool"
        cols={["Situation", "Algorithm", "Time"]}
        rows={chooseRows}
        note="When in doubt, read the weights: all equal means BFS, never negative means Dijkstra, otherwise Bellman–Ford."
      />

      <h2 id="practice">Practice questions</h2>
      <p>
        For each problem decide the vertices, what an edge costs, and how a path&apos;s cost is combined (sum or max), then pick BFS, Dijkstra or
        Bellman–Ford.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Say which algorithm handles equal weights, non-negative weights and negative weights.</>,
          <>Write a binary min-heap with a comparator from memory.</>,
          <>Write Dijkstra with lazy deletion and explain the stale check.</>,
          <>Explain with an example why a negative edge breaks Dijkstra.</>,
          <>Explain why Bellman–Ford with k + 1 rounds respects a stop limit, and why it copies the array.</>,
          <>Turn &quot;minimise the largest step&quot; into Dijkstra by replacing the sum with max.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Next, <strong>Lesson 53</strong> asks a different graph question: not how far, but <em>are these two things connected, and what happens when we
        join them?</em> The <strong>Union-Find</strong> structure answers that in nearly constant time per operation.
      </p>
    </DsaLessonPage>
  );
}
