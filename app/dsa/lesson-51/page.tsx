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

const lesson = getDsaLesson("lesson-51");

export const metadata: Metadata = {
  title: `Lesson 51 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "dag", label: "Prerequisites are directed edges" },
  { id: "kahn", label: "Kahn's algorithm" },
  { id: "trace", label: "Traced: Kahn on six tasks" },
  { id: "dfs", label: "DFS-based ordering" },
  { id: "cycle", label: "Cycle detection in directed graphs" },
  { id: "course", label: "Course schedule" },
  { id: "choose", label: "Kahn or DFS?" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const buildCode = `// "To take course a you must first take course b" is the pair [a, b].
// We draw it as an arrow b -> a: b must come BEFORE a.
function buildGraph(n, prerequisites) {
  const graph = Array.from({ length: n }, () => []);   // graph[b] = courses that b unlocks
  const indegree = new Array(n).fill(0);               // indegree[a] = how many prerequisites a still waits for
  for (const [a, b] of prerequisites) {
    graph[b].push(a);
    indegree[a]++;
  }
  return { graph, indegree };
}

const { graph, indegree } = buildGraph(4, [[1, 0], [2, 0], [3, 1], [3, 2]]);
console.log(graph);    // [ [ 1, 2 ], [ 3 ], [ 3 ], [] ]
console.log(indegree); // [ 0, 1, 1, 2 ]`;

const kahnCode = `// Kahn's algorithm: repeatedly take a task with nothing left to wait for.
function topoSort(n, edges) {                 // each edge [from, to] means from comes before to
  const graph = Array.from({ length: n }, () => []);
  const indegree = new Array(n).fill(0);
  for (const [from, to] of edges) {
    graph[from].push(to);
    indegree[to]++;
  }

  const queue = [];
  for (let v = 0; v < n; v++) if (indegree[v] === 0) queue.push(v);   // ready right now
  let head = 0;                               // dequeue by advancing an index (queue.shift() is O(n))
  const order = [];
  while (head < queue.length) {
    const v = queue[head++];
    order.push(v);
    for (const next of graph[v]) {
      indegree[next]--;                       // one of next's prerequisites is now done
      if (indegree[next] === 0) queue.push(next);
    }
  }
  return order.length === n ? order : [];     // fewer than n means a cycle blocked the rest
}

const edges = [[5, 2], [5, 0], [4, 0], [4, 1], [2, 3], [3, 1]];
console.log(topoSort(6, edges));                 // [ 4, 5, 2, 0, 3, 1 ]
console.log(topoSort(3, [[0, 1], [1, 2], [2, 0]])); // []   (a cycle: nothing can start)`;

const dfsOrderCode = `// DFS ordering: a task is finished only after everything it unlocks is finished.
// Reverse the finishing order and every prerequisite lands before the tasks that need it.
function topoSortDfs(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [from, to] of edges) graph[from].push(to);

  const UNSEEN = 0, VISITING = 1, DONE = 2;   // the three colours
  const state = new Array(n).fill(UNSEEN);
  const finished = [];
  let hasCycle = false;

  function visit(v) {
    state[v] = VISITING;                      // v is on the path we are walking right now
    for (const next of graph[v]) {
      if (state[next] === VISITING) hasCycle = true;       // we came back to the current path: a cycle
      else if (state[next] === UNSEEN) visit(next);
    }
    state[v] = DONE;                          // everything v unlocks is already finished
    finished.push(v);
  }

  for (let v = 0; v < n; v++) if (state[v] === UNSEEN) visit(v);
  return hasCycle ? [] : finished.reverse();
}

const edges = [[5, 2], [5, 0], [4, 0], [4, 1], [2, 3], [3, 1]];
console.log(topoSortDfs(6, edges));                 // [ 5, 4, 2, 3, 1, 0 ]
console.log(topoSortDfs(3, [[0, 1], [1, 2], [2, 0]])); // []`;

const wrongCycleCode = `// A visited set alone is NOT a cycle detector for directed graphs.
const diamond = [[1, 2], [3], [3], []];       // 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3: no cycle at all

function wrongHasCycle(graph) {
  const visited = new Set();
  function visit(v) {
    visited.add(v);
    for (const next of graph[v]) {
      if (visited.has(next)) return true;     // "seen before" is not the same as "on my current path"
      if (visit(next)) return true;
    }
    return false;
  }
  return visit(0);
}

function hasCycle(graph) {
  const state = new Array(graph.length).fill(0);   // 0 unseen, 1 on the current path, 2 finished
  function visit(v) {
    state[v] = 1;
    for (const next of graph[v]) {
      if (state[next] === 1) return true;          // only an arrow back into the current path is a cycle
      if (state[next] === 0 && visit(next)) return true;
    }
    state[v] = 2;
    return false;
  }
  for (let v = 0; v < graph.length; v++) if (state[v] === 0 && visit(v)) return true;
  return false;
}

console.log(wrongHasCycle(diamond));        // true    (WRONG: 3 was reached by 1 earlier, then again by 2)
console.log(hasCycle(diamond));             // false   (correct)
console.log(hasCycle([[1], [2], [0]]));     // true    (0 -> 1 -> 2 -> 0)`;

const courseCode = `// LeetCode 207: can all courses be finished? Yes exactly when the graph has no cycle.
function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);
  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course);
    indegree[course]++;
  }
  const queue = [];
  for (let c = 0; c < numCourses; c++) if (indegree[c] === 0) queue.push(c);
  let head = 0;
  while (head < queue.length) {
    const c = queue[head++];
    for (const next of graph[c]) {
      if (--indegree[next] === 0) queue.push(next);
    }
  }
  return head === numCourses;                 // head counts how many courses we managed to take
}

console.log(canFinish(2, [[1, 0]]));          // true    (take 0, then 1)
console.log(canFinish(2, [[1, 0], [0, 1]]));  // false   (each needs the other first)
console.log(canFinish(4, [[1, 0], [2, 1], [3, 2], [1, 3]])); // false   (1 -> 2 -> 3 -> 1 is a loop)`;

const traceSrc = `const queue = [];
for (let v = 0; v < n; v++) if (indegree[v] === 0) queue.push(v);
let head = 0;
const order = [];
while (head < queue.length) {
  const v = queue[head++];
  order.push(v);
  for (const next of graph[v]) {
    indegree[next]--;
    if (indegree[next] === 0) queue.push(next);
  }
}
return order.length === n ? order : [];`;

function kahnTrace() {
  const t = tracer();
  const n = 6;
  const edges = [[5, 2], [5, 0], [4, 0], [4, 1], [2, 3], [3, 1]];
  const graph: number[][] = Array.from({ length: n }, () => []);
  const indegree = new Array<number>(n).fill(0);
  for (const [from, to] of edges) { graph[from].push(to); indegree[to]++; }
  const queue: number[] = [];
  const waiting = () => queue.slice(head);
  let head = 0;
  t.step(1, "start", "Prepare the queue", `indegree = ${JSON.stringify(indegree)}: task 0 waits for two others (5 and 4), task 1 for two (4 and 3), and so on.`, { indegree: [...indegree] });
  for (let v = 0; v < n; v++) if (indegree[v] === 0) queue.push(v);
  t.step(2, "update", "Seed with the ready tasks", "Tasks 4 and 5 wait for nobody, so they can start immediately.", { indegree: [...indegree], queue: waiting() }, "queue");
  t.step(3, "update", "head = 0", "head is the front of the queue.", { indegree: [...indegree], queue: waiting(), head }, "head");
  const order: number[] = [];
  t.step(4, "update", "order = []", "order will hold the finished schedule.", { indegree: [...indegree], queue: waiting(), order: [...order] }, "order");
  while (head < queue.length) {
    const v = queue[head++];
    t.step(6, "update", `take ${v} from the front`, `${v} has no unfinished prerequisites, so do it now.`, { v, queue: waiting(), order: [...order] }, "v");
    order.push(v);
    t.step(7, "update", `order gets ${v}`, `${v} is scheduled. Now tell the tasks that were waiting for it.`, { v, queue: waiting(), order: [...order] }, "order");
    for (const next of graph[v]) {
      indegree[next]--;
      t.step(9, "update", `indegree[${next}] drops to ${indegree[next]}`, `${next} has one fewer prerequisite waiting.`, { v, next, indegree: [...indegree], queue: waiting() }, "indegree");
      if (indegree[next] === 0) {
        queue.push(next);
        t.step(10, "update", `${next} is ready: enqueue it`, `Its last prerequisite just finished.`, { v, next, indegree: [...indegree], queue: waiting() }, "queue");
      }
    }
  }
  t.print(order);
  t.step(13, "done", "order has all 6 tasks", "Queue empty and order.length === n, so there is no cycle. Every arrow goes from an earlier task to a later one.", { indegree: [...indegree], order: [...order] }, "order");
  return t.steps;
}

const chooseRows: string[][] = [
  ["Core idea", "peel off tasks with no remaining prerequisites", "reverse the order in which DFS finishes tasks"],
  ["Data structure", "queue + in-degree array", "recursion (or a stack) + 3 states"],
  ["Cycle detection", "fewer than n tasks come out", "an arrow into a VISITING task"],
  ["Gives the order", "front to back, as it goes", "after reversing the finishing list"],
  ["Level by level (e.g. parallel courses)", "natural: process the queue in rounds", "needs extra bookkeeping"],
  ["Deep chains", "no recursion, so no stack overflow", "recursion can overflow on ~10,000+ chains"],
  ["Time and space", "O(V + E), O(V)", "O(V + E), O(V)"],
];

const stateRows: string[][] = [
  ["UNSEEN (0)", "not visited yet", "visit it if we reach it"],
  ["VISITING (1)", "on the path we are walking right now", "reaching it again means a cycle"],
  ["DONE (2)", "fully explored, nothing left to do", "safe to skip: it cannot lead back to us"],
];

export default function DsaLessonFiftyOnePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="dag">Prerequisites are directed edges</h2>
      <p>
        Some jobs must happen in a certain order: you put on socks before shoes, and you take Algebra before Calculus. We model that
        with a <strong>directed graph</strong> (lesson 49), where each edge is an arrow <code>b → a</code> meaning
        &quot;<code>b</code> must come before <code>a</code>&quot;. A <strong>topological order</strong> (or <em>topological sort</em>) lines up all
        the vertices so that every arrow points forward: for every <code>b → a</code>, <code>b</code> appears earlier than{" "}
        <code>a</code>.
      </p>
      <p>
        Such an order exists exactly when the graph has no cycle. If A needs B, B needs C and C needs A, nobody can go first. A directed graph
        with no cycle is called a <strong>DAG</strong> (directed acyclic graph). Every DAG has at least one topological order, often many; any
        valid one is acceptable unless a problem says otherwise.
      </p>
      <p>
        One more word: the <strong>in-degree</strong> of a vertex is the number of arrows pointing <em>into</em> it, which here means the
        number of prerequisites it is still waiting for. A task with in-degree 0 is free to start.
      </p>
      <Callout kind="warn" label="Mind the direction">
        LeetCode writes <code>[a, b]</code> as &quot;to take <code>a</code> you must first take <code>b</code>&quot;, so the arrow is{" "}
        <code>b → a</code>, the opposite of the order the numbers appear in. Reading the pair backwards is the most common bug in this topic.
      </Callout>
      <CodeBlock lang="js" code={buildCode} />

      <h2 id="kahn">Kahn&apos;s algorithm</h2>
      <p>
        <strong>Kahn&apos;s algorithm</strong> turns the idea &quot;do what is ready, then see what that makes ready&quot; into code:
      </p>
      <ol>
        <li>Count every vertex&apos;s in-degree.</li>
        <li>Put all vertices with in-degree 0 into a queue.</li>
        <li>Take one from the queue and append it to the answer. For each vertex it points to, subtract 1 from that vertex&apos;s in-degree; if it reaches 0, enqueue it.</li>
        <li>Repeat until the queue is empty.</li>
      </ol>
      <p>
        If the answer contains all n vertices you have a valid order. If it is shorter, the leftover vertices all wait on each other in
        a cycle, so none ever reached in-degree 0. The same queue-with-a-head-index trick as BFS keeps it at O(V + E) time: every vertex is enqueued once and every edge is looked at once.
      </p>
      <CodeBlock lang="js" code={kahnCode} />

      <h2 id="trace">Traced: Kahn on six tasks</h2>
      <CodeTrace
        code={traceSrc}
        steps={kahnTrace()}
        caption="Watch the indegree array: a task enters the queue the instant its count hits 0. The finished order is 4, 5, 2, 0, 3, 1."
      />

      <h2 id="dfs">DFS-based ordering</h2>
      <p>
        There is a second way. Run DFS, and record each vertex at the moment it is <em>finished</em> (all the vertices it points to are
        already finished). A vertex always finishes after everything it unlocks, so the finishing list is a valid order{" "}
        <em>backwards</em>. Reverse it and you have a topological order. Finishing is called the <strong>post-order</strong> of the DFS.
      </p>
      <p>
        To also detect cycles we give every vertex one of three states (a &quot;three-colour&quot; DFS):
      </p>
      <DryRun title="the three states of a vertex" cols={["State", "Meaning", "If DFS meets it"]} rows={stateRows} />
      <CodeBlock lang="js" code={dfsOrderCode} />
      <p>
        The answer differs from Kahn&apos;s ([5, 4, 2, 3, 1, 0] vs [4, 5, 2, 0, 3, 1]), and both are correct: check any arrow, for
        instance 2 → 3 (2 comes first in both) or 4 → 0.
      </p>

      <h2 id="cycle">Cycle detection in directed graphs</h2>
      <p>
        For an <em>undirected</em> graph, meeting an already-visited vertex (other than the one you came from) means a cycle. That rule is
        <strong> wrong for directed graphs</strong>. Take the diamond 0 → 1 → 3 and 0 → 2 → 3. Vertex 3 is reached twice, once via 1 and once
        via 2, yet there is no cycle: both arrows head the same way. &quot;Seen before&quot; only becomes a cycle if the earlier visit is still{" "}
        <em>on the path we are walking</em>, which is exactly what the VISITING state remembers and a plain visited set cannot.
      </p>
      <CodeBlock lang="js" code={wrongCycleCode} />
      <Callout kind="note" label="Two valid detectors">
        Kahn&apos;s count (&quot;did all n vertices come out?&quot;) and the three-colour DFS (&quot;did I meet a VISITING vertex?&quot;) always agree.
        Choose whichever fits the rest of the problem.
      </Callout>

      <h2 id="course">Course schedule</h2>
      <p>
        <strong>Course Schedule</strong> (LeetCode 207) asks only whether every course can be finished, which is the same as asking whether the
        prerequisite graph is a DAG. Run Kahn and compare how many courses you managed to take with the total. Its sibling{" "}
        <strong>Course Schedule II</strong> (210) wants the actual order, which Kahn already produces.
      </p>
      <CodeBlock lang="js" code={courseCode} />

      <h2 id="choose">Kahn or DFS?</h2>
      <DryRun
        title="the two topological sorts side by side"
        cols={["", "Kahn (BFS-style)", "DFS post-order"]}
        rows={chooseRows}
        note="Kahn is the safer default in interviews: no recursion, and the cycle check is just a count. Use the DFS form when the problem is already a DFS (for example 'is this node safe?')."
      />

      <h2 id="practice">Practice questions</h2>
      <p>
        Ask first: what are the &quot;tasks&quot;, and what does &quot;must come before&quot; mean here? Sometimes the edges are given (courses), sometimes you must
        discover them (alien dictionary, recipes), and sometimes the trick is to peel from the outside in (minimum height trees).
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Define topological order and DAG, and say which graphs have no valid order.</>,
          <>Write Kahn&apos;s algorithm from memory, including the cycle check.</>,
          <>Explain the three DFS states and why reversing the finish order works.</>,
          <>Explain why a plain visited set misreports a cycle on a directed diamond.</>,
          <>Say which way the arrow points for the pair [a, b] in Course Schedule.</>,
          <>Name two problems where the graph must be built from other data first.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        So far every edge counted the same, or had no length at all. <strong>Lesson 52</strong> gives edges costs: BFS for equal costs, then{" "}
        <strong>Dijkstra</strong> with a priority queue to find the cheapest route, and Bellman–Ford when the number of stops is limited.
      </p>
    </DsaLessonPage>
  );
}
