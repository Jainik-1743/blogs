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

const lesson = getDsaLesson("lesson-49");

export const metadata: Metadata = {
  title: `Lesson 49 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "what", label: "What is a graph?" },
  { id: "kinds", label: "Directed, undirected, weighted" },
  { id: "vocab", label: "Degree, path, cycle, component" },
  { id: "storing", label: "Two ways to store a graph" },
  { id: "build", label: "Building from an edge list" },
  { id: "trace", label: "Traced: edge list to adjacency list" },
  { id: "degree", label: "Counting degrees" },
  { id: "walk", label: "A first walk through a graph" },
  { id: "grid", label: "Grids are graphs too" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const buildCode = `// n vertices numbered 0 .. n-1, edges given as [a, b] pairs.
function buildGraph(n, edges, directed = false) {
  const graph = new Map();
  for (let v = 0; v < n; v++) graph.set(v, []);   // every vertex starts with no neighbours
  for (const [a, b] of edges) {
    graph.get(a).push(b);                          // a -> b
    if (!directed) graph.get(b).push(a);           // undirected: also b -> a
  }
  return graph;
}

const edges = [[0, 1], [0, 2], [1, 2], [3, 4]];
console.log(buildGraph(5, edges));       // Map(5) { 0 => [ 1, 2 ], 1 => [ 0, 2 ], 2 => [ 0, 1 ], 3 => [ 4 ], 4 => [ 3 ] }
console.log(buildGraph(5, edges, true)); // Map(5) { 0 => [ 1, 2 ], 1 => [ 2 ], 2 => [], 3 => [ 4 ], 4 => [] }`;

const arrayCode = `// The same thing with a plain array of arrays (good when vertices are 0 .. n-1).
function buildGraphArray(n, edges) {
  const graph = Array.from({ length: n }, () => []);   // NOT new Array(n).fill([]) - that uses one shared array
  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
  }
  return graph;
}

console.log(buildGraphArray(5, [[0, 1], [0, 2], [1, 2], [3, 4]])); // [ [ 1, 2 ], [ 0, 2 ], [ 0, 1 ], [ 4 ], [ 3 ] ]`;

const matrixCode = `// matrix[a][b] is 1 when there is an edge a - b.
function buildMatrix(n, edges) {
  const matrix = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const [a, b] of edges) {
    matrix[a][b] = 1;
    matrix[b][a] = 1;     // undirected: the matrix is symmetric
  }
  return matrix;
}

const m = buildMatrix(5, [[0, 1], [0, 2], [1, 2], [3, 4]]);
console.log(m[0]);       // [ 0, 1, 1, 0, 0 ]
console.log(m[1][2]);    // 1   (edge test in O(1))
console.log(m[0][3]);    // 0`;

const weightedCode = `// Weighted: store the weight next to each neighbour.
const weighted = new Map([
  ["A", [["B", 4], ["C", 1]]],
  ["B", [["D", 2]]],
  ["C", [["B", 2], ["D", 7]]],
  ["D", []],
]);
for (const [city, roads] of weighted) {
  console.log(city, "->", roads.map(([to, w]) => to + "(" + w + ")").join(" "));
}
// A -> B(4) C(1)
// B -> D(2)
// C -> B(2) D(7)
// D ->`;

const degreeCode = `function degrees(n, edges) {
  const deg = new Array(n).fill(0);
  for (const [a, b] of edges) { deg[a]++; deg[b]++; }   // undirected: each edge touches two vertices
  return deg;
}
console.log(degrees(5, [[0, 1], [0, 2], [1, 2], [3, 4]])); // [ 2, 2, 2, 1, 1 ]

function inOutDegrees(n, edges) {
  const inDeg = new Array(n).fill(0);
  const outDeg = new Array(n).fill(0);
  for (const [from, to] of edges) { outDeg[from]++; inDeg[to]++; }
  return { inDeg, outDeg };
}
console.log(inOutDegrees(3, [[0, 1], [0, 2], [1, 2]])); // { inDeg: [ 0, 1, 2 ], outDeg: [ 2, 1, 0 ] }`;

const walkCode = `// Is there a path from start to target? Walk outwards and remember where you have been.
function hasPath(graph, start, target) {
  const visited = new Set();
  function visit(v) {
    if (v === target) return true;
    visited.add(v);                              // without this, a cycle would make us loop forever
    for (const next of graph.get(v)) {
      if (!visited.has(next) && visit(next)) return true;
    }
    return false;
  }
  return visit(start);
}

const g = buildGraph(5, [[0, 1], [0, 2], [1, 2], [3, 4]]);
console.log(hasPath(g, 0, 2)); // true
console.log(hasPath(g, 0, 4)); // false  (4 is in another component)

function buildGraph(n, edges) {
  const graph = new Map();
  for (let v = 0; v < n; v++) graph.set(v, []);
  for (const [a, b] of edges) { graph.get(a).push(b); graph.get(b).push(a); }
  return graph;
}`;

const componentsCode = `// Count connected components: start a walk from every vertex we have not seen yet.
function countComponents(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a); }
  const seen = new Array(n).fill(false);
  function visit(v) {
    seen[v] = true;
    for (const next of graph[v]) if (!seen[next]) visit(next);
  }
  let count = 0;
  for (let v = 0; v < n; v++) {
    if (!seen[v]) { count++; visit(v); }   // a new start means a new component
  }
  return count;
}

console.log(countComponents(5, [[0, 1], [0, 2], [1, 2], [3, 4]])); // 2
console.log(countComponents(4, []));                                // 4`;

const gridCode = `// A grid cell (r, c) is a vertex. Its neighbours are the cells up, down, left and right.
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function neighbours(grid, r, c) {
  const out = [];
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) out.push([nr, nc]);   // bounds check
  }
  return out;
}

const grid = [
  [1, 1, 0],
  [0, 1, 0],
  [1, 0, 1],
];
console.log(neighbours(grid, 0, 0)); // [ [ 1, 0 ], [ 0, 1 ] ]   (a corner has 2 neighbours)
console.log(neighbours(grid, 1, 1)); // [ [ 0, 1 ], [ 2, 1 ], [ 1, 0 ], [ 1, 2 ] ]   (the middle has 4)`;

const traceSrc = `const graph = new Map();
for (let v = 0; v < n; v++) graph.set(v, []);
for (const [a, b] of edges) {
  graph.get(a).push(b);
  graph.get(b).push(a);
}`;

function buildTrace() {
  const t = tracer();
  const n = 5;
  const edges = [[0, 1], [0, 2], [1, 2], [3, 4]];
  const graph = new Map<number, number[]>();
  const snap = () => new Map([...graph].map(([k, v]) => [k, [...v]]));
  t.step(1, "start", "graph = an empty Map", "The Map will hold one entry for each vertex: the vertex, and the list of its neighbours.", { n, edges, graph: snap() });
  for (let v = 0; v < n; v++) graph.set(v, []);
  t.step(2, "update", "give every vertex an empty list", "Vertices 3 and 4 will get edges too. But even a vertex with no edges must exist, so we create all n of them first.", { n, graph: snap() }, "graph");
  for (const [a, b] of edges) {
    t.step(3, "check", `next edge: ${a} - ${b}`, "An undirected edge is a two-way street, so we must save it in both directions.", { a, b, graph: snap() }, "a");
    graph.get(a)!.push(b);
    t.step(4, "update", `${b} goes into the list of ${a}`, `From ${a} you can now walk to ${b}.`, { a, b, graph: snap() }, "graph");
    graph.get(b)!.push(a);
    t.step(5, "update", `${a} goes into the list of ${b}`, `And from ${b} you can walk back to ${a}.`, { a, b, graph: snap() }, "graph");
  }
  t.step(6, "done", "adjacency list is built", "Vertices 0, 1 and 2 form a triangle. Vertices 3 and 4 form a separate pair. To find the neighbours of any vertex, we now need just one Map lookup.", { graph: snap() });
  return t.steps;
}

const tradeRows: string[][] = [
  ["Memory", "O(V + E)", "O(V²)"],
  ["Is there an edge a - b?", "O(degree of a): scan the list", "O(1): read matrix[a][b]"],
  ["List the neighbours of a", "O(degree of a): just read the list", "O(V): scan a whole row"],
  ["Add an edge", "O(1): push", "O(1): set a cell"],
  ["Good for", "sparse graphs (few edges), which is the usual case", "dense graphs (many edges), or many questions like 'is there an edge?'"],
];

export default function DsaLessonFortyNinePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="what">What is a graph?</h2>
      <p>
        A <strong>graph</strong> is a set of things and the connections between them. The things are called{" "}
        <strong>vertices</strong> (one thing is a <em>vertex</em>; you will also hear the word <strong>nodes</strong>). Each
        connection is an <strong>edge</strong>. Here are some examples. Cities are vertices and the roads between them are edges.
        People are vertices and friendships are edges. Web pages are vertices and links are edges. Courses are vertices and
        prerequisites (courses you must finish first) are edges. All of these are graphs.
      </p>
      <p>
        You already know two special graphs. A linked list is a graph where each vertex has one edge going out. A tree is a graph
        with no loops. A general graph has no such limits: any vertex can connect to any other. That freedom is why graphs describe
        so many real problems. It is also why walking through them needs some care, because you can reach the same vertex twice.
      </p>
      <p>
        We usually write <strong>V</strong> for the number of vertices and <strong>E</strong> for the number of edges. We give
        running times using these letters, for example O(V + E).
      </p>

      <h2 id="kinds">Directed, undirected, weighted</h2>
      <ul>
        <li>
          <strong>Undirected</strong>: an edge is a two-way street. If A - B exists, you can go from A to B and from B to A.
          Friendship on most social networks works like this.
        </li>
        <li>
          <strong>Directed</strong>: an edge has a direction, drawn as an arrow from A to B. You can go from A to B, but not back
          (unless there is also an edge from B to A). Examples: &quot;follows&quot; on a social network, or &quot;course A must be
          finished before course B&quot;.
        </li>
        <li>
          <strong>Weighted</strong>: each edge has a number on it, called its <strong>weight</strong>. It can be a distance or a
          cost. Both directed and undirected graphs can be weighted.
        </li>
      </ul>

      <h2 id="vocab">Degree, path, cycle, component</h2>
      <ul>
        <li>
          The <strong>degree</strong> of a vertex is the number of edges that touch it. In a directed graph we split it in two:{" "}
          <strong>in-degree</strong> (edges coming in) and <strong>out-degree</strong> (edges going out).
        </li>
        <li>
          A <strong>path</strong> is a list of vertices where each pair next to each other is joined by an edge. If there is a path
          from A to B, we say B is <strong>reachable</strong> from A.
        </li>
        <li>
          A <strong>cycle</strong> is a path that ends where it started, without using the same edge twice. For example, A to B to
          C and back to A. A graph with no cycles is called <strong>acyclic</strong>.
        </li>
        <li>
          A <strong>connected component</strong> (in an undirected graph) is a group of vertices that can all reach each other, with
          no connection to the rest of the graph. A graph in one piece is called <strong>connected</strong>. A graph with several
          pieces has several components.
        </li>
      </ul>
      <Callout kind="note" label="A useful fact">
        A connected undirected graph with V vertices has at least V − 1 edges. With exactly V − 1 edges it has no cycle, and that
        shape is called a tree. One more edge makes exactly one cycle.
      </Callout>

      <h2 id="storing">Two ways to store a graph</h2>
      <p>
        An <strong>adjacency list</strong> stores, for every vertex, the list of its neighbours (<em>adjacent</em> means
        &quot;directly connected&quot;). In JavaScript this is a <code>Map</code> from each vertex to an array. If the vertices are
        numbered <code>0</code> to <code>n-1</code>, it can also be just an array of arrays. An <strong>adjacency matrix</strong> is
        a table with V rows and V columns. Cell <code>[a][b]</code> tells you whether the edge from a to b exists.
      </p>
      <DryRun
        title="adjacency list vs adjacency matrix"
        cols={["Operation", "Adjacency list", "Adjacency matrix"]}
        rows={tradeRows}
        note="Most interview graphs are sparse, which means E is much smaller than V². So the adjacency list is the default choice. Use the matrix when V is small, or when the input already comes as a matrix."
      />
      <CodeBlock lang="js" code={matrixCode} />
      <p>For a weighted graph, put the weight next to each neighbour:</p>
      <CodeBlock lang="js" code={weightedCode} />

      <h2 id="build">Building from an edge list</h2>
      <p>
        Interview problems almost always give the graph as an <strong>edge list</strong>. This is <code>n</code> plus pairs such as{" "}
        <code>[[0, 1], [0, 2], [1, 2], [3, 4]]</code>. Your first job is to turn it into an adjacency list. First, make an empty
        list for every vertex, so that vertices with no edges still exist. Then add each edge. For an undirected graph, add the edge
        in <em>both</em> directions. For a directed graph, add it in one direction only.
      </p>
      <CodeBlock lang="js" code={buildCode} />
      <p>When the vertices are exactly 0 to n-1, an array of arrays is shorter and faster:</p>
      <CodeBlock lang="js" code={arrayCode} />
      <Callout kind="warn" label="The shared-array trap">
        <code>new Array(n).fill([])</code> puts the <em>same</em> array in every slot. So if you push to one neighbour list, you
        change all of them. Always build with <code>Array.from(&#123; length: n &#125;, () =&gt; [])</code>.
      </Callout>

      <h2 id="trace">Traced: edge list to adjacency list</h2>
      <CodeTrace
        code={traceSrc}
        steps={buildTrace()}
        caption="Four edges make eight list entries, because every undirected edge is stored twice. Two components appear: {0, 1, 2} and {3, 4}."
      />
      <p>
        Building takes O(V + E) time and space. It needs one pass over the vertices and one pass over the edges. Each undirected
        edge is stored twice, so the lists hold 2E entries in total. The degrees of all vertices add up to 2E.
      </p>

      <h2 id="degree">Counting degrees</h2>
      <p>
        You do not need a graph structure to count degrees. One pass over the edge list is enough. Some problems, such as finding a
        &quot;celebrity&quot; (someone everyone knows) or the centre of a star graph, are solved just by counting degrees.
      </p>
      <CodeBlock lang="js" code={degreeCode} />

      <h2 id="walk">A first walk through a graph</h2>
      <p>
        Suppose you ask, &quot;can I get from A to B?&quot; You walk outwards from A. Visit a vertex, then visit each of its
        neighbours. A graph can have cycles, so you also keep a <code>visited</code> set (a list of places you have already been).
        Without it, you would walk around a triangle forever. This is a first look at <strong>depth-first search</strong> (DFS,
        which means going as deep as you can before turning back). Lesson 50 explains it fully, together with breadth-first search.
      </p>
      <CodeBlock lang="js" code={walkCode} />
      <p>
        If you start a new walk from each vertex you have not seen yet, you can count the connected components:
      </p>
      <CodeBlock lang="js" code={componentsCode} />
      <p>
        Both take O(V + E) time. Every vertex is visited once, and every edge is looked at at most twice. The recursion (a function
        that calls itself) can go as deep as V levels. That is fine for interview sizes. Lesson 50 shows another way that uses a stack
        you manage yourself.
      </p>

      <h2 id="grid">Grids are graphs too</h2>
      <p>
        A 2-D grid (a maze, a map of land and water, or a game board) is a graph that you never have to build. Each cell{" "}
        <code>(r, c)</code> is a vertex. Its neighbours are the cells above, below, left and right, if they exist. Keep the four
        direction steps in an array, and check the grid edges before you use a neighbour. If a problem says &quot;8-directional&quot;,
        add the four diagonal steps to the array.
      </p>
      <CodeBlock lang="js" code={gridCode} />
      <Callout kind="ok" label="Same walk, different neighbours">
        Everything in the next lesson works on a grid. Just replace &quot;look up the adjacency list&quot; with &quot;try the four
        directions&quot;. To remember a visited cell, you can use a Set of <code>r * cols + c</code> numbers, a grid of true/false
        values, or you can overwrite the cell.
      </Callout>

      <h2 id="practice">Practice questions</h2>
      <p>
        First ask: what are the vertices, and what are the edges? When you can answer that, the rest is usually counting degrees or a
        short walk.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Explain vertex, edge, directed, undirected and weighted in your own words.</>,
          <>Say when you would choose an adjacency matrix instead of an adjacency list.</>,
          <>Write the loop that turns an edge list into an adjacency list, and explain why an undirected edge is pushed twice.</>,
          <>Explain what the visited set prevents.</>,
          <>List the steps to find the neighbours of a grid cell, including the check for the grid edges.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        <strong>Lesson 50</strong> turns the walk you just saw into the two main graph algorithms. <strong>Breadth-first
        search</strong> uses a queue (first in, first out). <strong>Depth-first search</strong> uses a stack or recursion. You will
        use them on islands, flood fill, rotting oranges and cloning a graph.
      </p>
    </DsaLessonPage>
  );
}
