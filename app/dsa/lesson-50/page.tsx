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

const lesson = getDsaLesson("lesson-50");

export const metadata: Metadata = {
  title: `Lesson 50 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "why", label: "Why we need a traversal" },
  { id: "bfs", label: "Breadth-first search" },
  { id: "early", label: "Mark visited when you enqueue" },
  { id: "trace", label: "Traced: BFS on a small graph" },
  { id: "dfs", label: "Depth-first search" },
  { id: "choose", label: "BFS or DFS?" },
  { id: "components", label: "Connected components" },
  { id: "grid", label: "Grids: islands and flood fill" },
  { id: "multi", label: "Multi-source BFS: rotting oranges" },
  { id: "clone", label: "Cloning a graph" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const bfsCode = `// Visit vertices in order of distance from start: first start, then its neighbours, then their neighbours...
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  let head = 0;                             // take items out by moving an index: queue.shift() would be O(n)
  const order = [];
  while (head < queue.length) {
    const v = queue[head++];
    order.push(v);
    for (const next of graph.get(v)) {
      if (!visited.has(next)) {
        visited.add(next);                  // mark it NOW, when it joins the queue
        queue.push(next);
      }
    }
  }
  return order;
}

const graph = new Map([
  [0, [1, 2]], [1, [0, 3]], [2, [0, 3, 4]], [3, [1, 2, 5]], [4, [2, 5]], [5, [3, 4]],
]);
console.log(bfs(graph, 0)); // [ 0, 1, 2, 3, 4, 5 ]`;

const distCode = `// BFS also gives the fewest edges from start to every vertex we can reach (unweighted graphs only).
function distances(graph, start) {
  const dist = new Map([[start, 0]]);       // also works as the visited set
  const queue = [start];
  let head = 0;
  while (head < queue.length) {
    const v = queue[head++];
    for (const next of graph.get(v)) {
      if (!dist.has(next)) {
        dist.set(next, dist.get(v) + 1);
        queue.push(next);
      }
    }
  }
  return dist;
}

const graph = new Map([
  [0, [1, 2]], [1, [0, 3]], [2, [0, 3, 4]], [3, [1, 2, 5]], [4, [2, 5]], [5, [3, 4]],
]);
console.log(distances(graph, 0)); // Map(6) { 0 => 0, 1 => 1, 2 => 1, 3 => 2, 4 => 2, 5 => 3 }`;

const earlyCode = `const graph = new Map([[0, [1, 2]], [1, [0, 2, 3]], [2, [0, 1, 3]], [3, [1, 2]]]);

function markOnDequeue() {                  // the tempting version that wastes work
  const queue = [0], visited = new Set();
  let head = 0;
  while (head < queue.length) {
    const v = queue[head++];
    if (visited.has(v)) continue;           // a vertex can be in the queue several times
    visited.add(v);
    for (const next of graph.get(v)) if (!visited.has(next)) queue.push(next);
  }
  return queue;
}

function markOnEnqueue() {                  // the right habit
  const queue = [0], visited = new Set([0]);
  let head = 0;
  while (head < queue.length) {
    const v = queue[head++];
    for (const next of graph.get(v)) {
      if (!visited.has(next)) { visited.add(next); queue.push(next); }
    }
  }
  return queue;
}

console.log(markOnDequeue()); // [ 0, 1, 2, 2, 3, 3 ]   six entries for four vertices
console.log(markOnEnqueue()); // [ 0, 1, 2, 3 ]         exactly one per vertex`;

const dfsRecCode = `function dfs(graph, start) {
  const visited = new Set();
  const order = [];
  function visit(v) {
    visited.add(v);
    order.push(v);
    for (const next of graph.get(v)) {
      if (!visited.has(next)) visit(next);  // go as deep as possible before trying the next neighbour
    }
  }
  visit(start);
  return order;
}

const graph = new Map([
  [0, [1, 2]], [1, [0, 3]], [2, [0, 3, 4]], [3, [1, 2, 5]], [4, [2, 5]], [5, [3, 4]],
]);
console.log(dfs(graph, 0)); // [ 0, 1, 3, 2, 4, 5 ]`;

const dfsStackCode = `// The same walk without recursion: the call stack becomes an array that you manage.
function dfsIterative(graph, start) {
  const visited = new Set();
  const stack = [start];
  const order = [];
  while (stack.length) {
    const v = stack.pop();
    if (visited.has(v)) continue;           // with a stack we mark when we pop (a vertex may be pushed more than once)
    visited.add(v);
    order.push(v);
    const nbrs = graph.get(v);
    for (let i = nbrs.length - 1; i >= 0; i--) stack.push(nbrs[i]);   // pushed in reverse, so the first neighbour is popped first
  }
  return order;
}

const graph = new Map([
  [0, [1, 2]], [1, [0, 3]], [2, [0, 3, 4]], [3, [1, 2, 5]], [4, [2, 5]], [5, [3, 4]],
]);
console.log(dfsIterative(graph, 0)); // [ 0, 1, 3, 2, 4, 5 ]`;

const componentsCode = `function countComponents(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a); }
  const visited = new Array(n).fill(false);
  let count = 0;
  for (let start = 0; start < n; start++) {
    if (visited[start]) continue;
    count++;                                // a vertex that nobody has reached yet starts a new component
    visited[start] = true;
    const queue = [start];
    let head = 0;
    while (head < queue.length) {
      const v = queue[head++];
      for (const next of graph[v]) {
        if (!visited[next]) { visited[next] = true; queue.push(next); }
      }
    }
  }
  return count;
}

console.log(countComponents(6, [[0, 1], [1, 2], [3, 4]])); // 3   ({0,1,2}, {3,4}, {5})`;

const islandsCode = `// Count islands of '1' in a grid of '1' (land) and '0' (water).
function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let islands = 0;

  function sink(r, c) {                     // DFS: turn every connected land cell into water
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0";                       // also works as the visited mark
    for (const [dr, dc] of dirs) sink(r + dr, c + dc);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") { islands++; sink(r, c); }
    }
  }
  return islands;
}

console.log(numIslands([
  ["1", "1", "0", "0"],
  ["1", "0", "0", "1"],
  ["0", "0", "1", "1"],
])); // 2`;

const floodCode = `// Flood fill: repaint the group of same-coloured cells that touches (sr, sc).
function floodFill(image, sr, sc, color) {
  const old = image[sr][sc];
  if (old === color) return image;          // without this check, the fill would never stop
  function fill(r, c) {
    if (r < 0 || r >= image.length || c < 0 || c >= image[0].length || image[r][c] !== old) return;
    image[r][c] = color;                    // the new colour also marks the cell as visited
    fill(r + 1, c); fill(r - 1, c); fill(r, c + 1); fill(r, c - 1);
  }
  fill(sr, sc);
  return image;
}

console.log(floodFill([[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2)); // [ [ 2, 2, 2 ], [ 2, 2, 0 ], [ 2, 0, 1 ] ]`;

const orangesCode = `// Multi-source BFS: every rotten orange is in the queue at the start; each "round" is one minute.
function orangesRotting(grid) {
  const rows = grid.length, cols = grid[0].length;
  const queue = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }
  let head = 0, minutes = 0;
  while (head < queue.length && fresh > 0) {
    const levelEnd = queue.length;          // everything in the queue now belongs to this minute
    while (head < levelEnd) {
      const [r, c] = queue[head++];
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2;                 // mark when we enqueue
          fresh--;
          queue.push([nr, nc]);
        }
      }
    }
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}

console.log(orangesRotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]])); // 4
console.log(orangesRotting([[2, 1, 1], [0, 1, 1], [1, 0, 1]])); // -1   (the orange at the bottom-left cannot be reached)`;

const cloneCode = `class Node {
  constructor(val, neighbors = []) { this.val = val; this.neighbors = neighbors; }
}

function cloneGraph(node) {
  if (!node) return null;
  const copies = new Map();                 // original node -> its copy; also works as the visited set
  copies.set(node, new Node(node.val));
  const queue = [node];
  let head = 0;
  while (head < queue.length) {
    const orig = queue[head++];
    for (const nb of orig.neighbors) {
      if (!copies.has(nb)) {
        copies.set(nb, new Node(nb.val));
        queue.push(nb);
      }
      copies.get(orig).neighbors.push(copies.get(nb));   // connect copy to copy
    }
  }
  return copies.get(node);
}

// square 1 - 2 - 3 - 4 - 1
const n1 = new Node(1), n2 = new Node(2), n3 = new Node(3), n4 = new Node(4);
n1.neighbors = [n2, n4]; n2.neighbors = [n1, n3]; n3.neighbors = [n2, n4]; n4.neighbors = [n3, n1];
const copy = cloneGraph(n1);
console.log(copy.val, copy.neighbors.map((x) => x.val)); // 1 [ 2, 4 ]
console.log(copy !== n1, copy.neighbors[0] !== n2);        // true true   (new objects, not the originals)`;

const traceSrc = `const visited = new Set([start]);
const queue = [start];
let head = 0;
while (head < queue.length) {
  const v = queue[head++];
  for (const next of graph.get(v)) {
    if (!visited.has(next)) {
      visited.add(next);
      queue.push(next);
    }
  }
}`;

function bfsTrace() {
  const t = tracer();
  const graph = new Map<number, number[]>([
    [0, [1, 2]], [1, [0, 3]], [2, [0, 3, 4]], [3, [1, 2, 5]], [4, [2, 5]], [5, [3, 4]],
  ]);
  const start = 0;
  const visited = new Set<number>([start]);
  const queue: number[] = [start];
  let head = 0;
  const waiting = () => queue.slice(head);
  t.step(1, "start", "visited = {0}", "Mark the start as seen right away.", { start, visited: [...visited] }, "visited");
  t.step(2, "update", "queue = [0]", "The queue holds vertices that we have found but not explored yet.", { visited: [...visited], queue: waiting() }, "queue");
  t.step(3, "update", "head = 0", "head points at the front of the queue. Moving it forward is how we take an item out of the queue in O(1) time.", { visited: [...visited], queue: waiting(), head }, "head");
  while (head < queue.length) {
    const v = queue[head++];
    t.step(5, "update", `take ${v} from the front`, `Explore ${v}. Look at each of its neighbours ${JSON.stringify(graph.get(v))}.`, { v, visited: [...visited], queue: waiting() }, "v");
    for (const next of graph.get(v)!) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
        t.step(9, "update", `${next} is new: mark it and enqueue it`, `If we mark it now, no other vertex can add ${next} to the queue a second time.`, { v, next, visited: [...visited], queue: waiting() }, "queue");
      } else {
        t.step(7, "check", `${next} is already visited, skip`, `${next} was found earlier, maybe by a vertex that is closer to the start.`, { v, next, visited: [...visited], queue: waiting() }, "next");
      }
    }
  }
  t.step(12, "done", "queue is empty", "The vertices left the queue in the order 0, 1, 2, 3, 4, 5. First the start, then everything 1 edge away, then 2 edges away, then 3 edges away.", { visited: [...visited], queue: waiting() });
  return t.steps;
}

const choiceRows: string[][] = [
  ["Data structure", "queue (first in, first out)", "stack (last in, first out) or recursion"],
  ["Visit order", "closest vertices first, level by level", "goes deep, then goes back when stuck"],
  ["Fewest edges to a target (unweighted)", "yes: the first time you reach it", "no"],
  ["Count components, flood a region, detect a path", "works", "works (often the shortest to write)"],
  ["Extra memory", "up to the width of one level", "up to the length of the longest path"],
  ["Time", "O(V + E)", "O(V + E)"],
];

const rottenRows: string[][] = [
  ["0", "2 1 1 / 1 1 0 / 0 1 1", "the start: one rotten orange (top-left)"],
  ["1", "2 2 1 / 2 1 0 / 0 1 1", "the top-left orange makes its fresh neighbours (0,1) and (1,0) rot"],
  ["2", "2 2 2 / 2 2 0 / 0 1 1", "the two new rotten oranges make (0,2) and (1,1) rot"],
  ["3", "2 2 2 / 2 2 0 / 0 2 1", "(1,1) makes (2,1) rot"],
  ["4", "2 2 2 / 2 2 0 / 0 2 2", "(2,1) makes (2,2) rot. No fresh oranges are left, so the answer is 4"],
];

export default function DsaLessonFiftyPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="why">Why we need a traversal</h2>
      <p>
        In lesson 49 we learned how to store graphs. Now we need to <em>explore</em> them. A <strong>traversal</strong> visits every
        vertex that you can reach from a starting vertex, each one exactly once. Two orders cover almost every interview question:{" "}
        <strong>breadth-first search</strong> (BFS) and <strong>depth-first search</strong> (DFS). Both take O(V + E) time on an
        adjacency list. Each vertex is handled once, and each edge is looked at once (twice if the graph is undirected).
      </p>
      <p>
        Both need the same safety net: a <strong>visited</strong> set (a list of vertices you have already seen). A graph can have
        cycles. Without the set, you would go around the same loop forever.
      </p>

      <h2 id="bfs">Breadth-first search</h2>
      <p>
        BFS explores in ripples, like the rings on water when you drop a stone. First the start. Then everything one edge away. Then
        everything two edges away, and so on. The tool is a <strong>queue</strong> (first in, first out, like a line at a shop). New
        vertices join the back of the line, and we always explore the one at the front. In JavaScript, <code>queue.shift()</code> is
        slow (O(n)) because it moves every item. So we keep a <code>head</code> number that points to the front, and we just add 1
        to it.
      </p>
      <CodeBlock lang="js" code={bfsCode} />
      <p>
        Vertices leave the queue in order of their distance from the start. So BFS finds the <strong>fewest edges</strong> to every
        vertex you can reach, in an unweighted graph (or a grid where every move costs the same):
      </p>
      <CodeBlock lang="js" code={distCode} />

      <h2 id="early">Mark visited when you enqueue</h2>
      <p>
        You can mark a vertex as visited at two moments: when it joins the queue, or when it leaves the queue. Mark it{" "}
        <strong>when you enqueue it</strong> (put it in the queue). If you wait, each of its neighbours can add it again before its
        own turn comes. Then the queue holds the same vertex many times. In a dense graph (one with many edges), this can use up to E
        queue entries instead of V. On a grid problem it can be slow enough to time out. Marking early also keeps distances correct,
        because the first vertex to find it is the closest one.
      </p>
      <CodeBlock lang="js" code={earlyCode} />

      <h2 id="trace">Traced: BFS on a small graph</h2>
      <CodeTrace
        code={traceSrc}
        steps={bfsTrace()}
        caption="Watch the queue. Vertex 3 is found by 1, and 2 would add it again, but it is already marked. So it enters the queue only once."
      />

      <h2 id="dfs">Depth-first search</h2>
      <p>
        DFS goes as deep as it can before it goes back. Pick a neighbour, then one of its neighbours, and so on. Stop when a vertex
        has no neighbours you have not visited. Then go back to the previous vertex and try its next neighbour. The easiest way to
        write it is recursion (a function that calls itself). The <strong>call stack</strong> is the language&apos;s own list of
        waiting function calls. It remembers where to come back to. A <strong>stack</strong> is a list where you add and remove
        items at the same end, so the last item added is the first one removed (like a pile of plates). The difference in one line:
        a queue serves the oldest item first, and a stack serves the newest item first.
      </p>
      <CodeBlock lang="js" code={dfsRecCode} />
      <p>
        The recursion can go as deep as V levels. In JavaScript, a path of about ten thousand vertices or more may overflow the call
        stack (run out of room and crash). For huge inputs, write DFS with your own array as the stack:
      </p>
      <CodeBlock lang="js" code={dfsStackCode} />
      <Callout kind="note" label="Mark on pop for a stack">
        In the stack version, several neighbours may push the same vertex before it is popped. So we do the visited check when we
        pop. This keeps the true depth-first order. That is fine for DFS. For BFS, mark when you enqueue, as shown above.
      </Callout>

      <h2 id="choose">BFS or DFS?</h2>
      <DryRun
        title="choosing a traversal"
        cols={["", "BFS", "DFS"]}
        rows={choiceRows}
        note="If the question says shortest, fewest steps or fewest moves in an unweighted setting, use BFS. For everything else (can I reach it? how many pieces? how big is the region?), either one works."
      />

      <h2 id="components">Connected components</h2>
      <p>
        One traversal visits exactly one connected component. To count them all, try every vertex as a start. Each time you find a
        vertex that is not visited yet, you have found a new component. Count it, and then traverse to mark the whole piece.
      </p>
      <CodeBlock lang="js" code={componentsCode} />
      <p>
        The outer loop adds only O(V). Every vertex and edge is still handled once in total, so the time stays O(V + E).
      </p>

      <h2 id="grid">Grids: islands and flood fill</h2>
      <p>
        On a grid, the vertices are cells, and the neighbours are the four directions. Check the grid edges first (lesson 49). The
        classic task is to count <strong>islands</strong>. An island is a component of land cells. Walk over the grid. When you find
        a land cell you have not seen, add one to the count. Then traverse and erase the whole island, so it is not counted again.
        Changing the cell to water is the visited mark, so you do not need an extra set. Copy the grid first if the caller needs it
        unchanged.
      </p>
      <CodeBlock lang="js" code={islandsCode} />
      <p>
        <strong>Flood fill</strong> (the paint-bucket tool in a drawing app) is the same walk. It repaints cells instead of counting.
        There is one trap. If the new colour is the same as the old colour, painting changes nothing. Then you cannot tell a visited
        cell from an unvisited one, and the recursion never ends.
      </p>
      <CodeBlock lang="js" code={floodCode} />
      <Callout kind="warn" label="Order of the grid edge check">
        Always compare <code>r</code> and <code>c</code> with the grid size <em>before</em> you read <code>grid[r][c]</code>. Reading{" "}
        <code>grid[-1][0]</code> throws an error, because <code>grid[-1]</code> is <code>undefined</code>.
      </Callout>

      <h2 id="multi">Multi-source BFS: rotting oranges</h2>
      <p>
        Sometimes the search starts from <em>many places at once</em>. Every minute, each rotten orange makes its fresh neighbours
        rot. Put <strong>all</strong> the rotten oranges into the queue at the start, and run BFS as usual. It works as if one
        start vertex were connected to all the sources. Each level of the search is one minute. Process the queue one level at a time
        (note where the level ends before you begin), and count the levels.
      </p>
      <CodeBlock lang="js" code={orangesCode} />
      <DryRun
        title="grid [[2,1,1],[1,1,0],[0,1,1]], rows separated by /"
        cols={["Minute", "Grid after it", "What happened"]}
        rows={rottenRows}
        note="The loop stops as soon as no fresh orange is left, so the answer is 4 and not 5. If fresh oranges are still left when the queue is empty, they can never be reached. Then return -1."
      />

      <h2 id="clone">Cloning a graph</h2>
      <p>
        To make a deep copy of a graph (a full copy that shares nothing with the original), you create a new node for each original
        node. Then you connect the copies to each other, not to the originals. A <code>Map</code> from each original node to its copy
        does two jobs. It is the visited set. It also lets you find the copy of any neighbour, so you can connect to it. The
        traversal can be BFS or DFS.
      </p>
      <CodeBlock lang="js" code={cloneCode} />

      <h2 id="practice">Practice questions</h2>
      <p>
        First decide three things. What is a vertex? What are its neighbours? Do I need the shortest distance (BFS), or do I just
        need to cover a region (either one)?
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write BFS from memory with a queue, a head number and a visited set.</>,
          <>Explain why you mark a vertex as visited when it is enqueued.</>,
          <>Write DFS two ways: with recursion, and with your own stack.</>,
          <>Say when BFS is the right tool, and when either one works.</>,
          <>Explain how multi-source BFS counts the minutes in rotting oranges.</>,
          <>Explain what the Map does when you clone a graph.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        So far, we treated edges as two-way, or we ignored their direction. <strong>Lesson 51</strong> uses directed edges to put
        things in order. <strong>Topological sort</strong> lists tasks so that every prerequisite comes first. It can also detect
        cycles.
      </p>
    </DsaLessonPage>
  );
}
