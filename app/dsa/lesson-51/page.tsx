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
  { id: "dag", label: "Prerequisites are arrows" },
  { id: "kahn", label: "Kahn's algorithm" },
  { id: "trace", label: "Traced: Kahn on six tasks" },
  { id: "dfs", label: "DFS-based ordering" },
  { id: "cycle", label: "Finding loops in directed graphs" },
  { id: "course", label: "Course schedule" },
  { id: "choose", label: "Kahn or DFS: which one?" },
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
  t.step(1, "start", "Prepare the queue", `indegree = ${JSON.stringify(indegree)}. This counts how many tasks each task still waits for. Task 0 waits for two tasks (5 and 4). Task 1 waits for two tasks (4 and 3). And so on.`, { indegree: [...indegree] });
  for (let v = 0; v < n; v++) if (indegree[v] === 0) queue.push(v);
  t.step(2, "update", "Add the ready tasks to the queue", "Tasks 4 and 5 wait for nobody, so they can start right now.", { indegree: [...indegree], queue: waiting() }, "queue");
  t.step(3, "update", "head = 0", "head is a number that marks the front of the queue.", { indegree: [...indegree], queue: waiting(), head }, "head");
  const order: number[] = [];
  t.step(4, "update", "order = []", "order will hold the final schedule.", { indegree: [...indegree], queue: waiting(), order: [...order] }, "order");
  while (head < queue.length) {
    const v = queue[head++];
    t.step(6, "update", `take ${v} from the front`, `${v} has no unfinished prerequisites, so we can do it now.`, { v, queue: waiting(), order: [...order] }, "v");
    order.push(v);
    t.step(7, "update", `order gets ${v}`, `${v} is now in the schedule. Next, tell the tasks that were waiting for it.`, { v, queue: waiting(), order: [...order] }, "order");
    for (const next of graph[v]) {
      indegree[next]--;
      t.step(9, "update", `indegree[${next}] drops to ${indegree[next]}`, `${next} now waits for one task less.`, { v, next, indegree: [...indegree], queue: waiting() }, "indegree");
      if (indegree[next] === 0) {
        queue.push(next);
        t.step(10, "update", `${next} is ready: add it to the queue`, `Its last prerequisite just finished.`, { v, next, indegree: [...indegree], queue: waiting() }, "queue");
      }
    }
  }
  t.print(order);
  t.step(13, "done", "order has all 6 tasks", "The queue is empty and order.length === n, so there is no cycle. Every arrow goes from an earlier task to a later task.", { indegree: [...indegree], order: [...order] }, "order");
  return t.steps;
}

const chooseRows: string[][] = [
  ["Core idea", "take away tasks that have no prerequisites left", "reverse the order in which DFS finishes tasks"],
  ["Data structure", "queue + in-degree array", "recursion (or a stack) + 3 states per task"],
  ["Cycle detection", "fewer than n tasks come out of the queue", "an arrow that points to a VISITING task"],
  ["Gives the order", "front to back, while it runs", "after reversing the finishing list"],
  ["Level by level (e.g. parallel courses)", "easy: process the queue one round at a time", "needs extra work"],
  ["Deep chains", "no recursion, so no stack overflow (the call stack running out of room)", "recursion can overflow on chains of about 10,000 or more"],
  ["Time and space", "O(V + E), O(V)", "O(V + E), O(V)"],
];

const stateRows: string[][] = [
  ["UNSEEN (0)", "not visited yet", "visit it when we reach it"],
  ["VISITING (1)", "on the path we are walking right now", "reaching it again means there is a cycle"],
  ["DONE (2)", "fully explored, nothing left to do here", "safe to skip: it cannot lead back to where we are"],
];

export default function DsaLessonFiftyOnePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="dag">Prerequisites are arrows</h2>
      <p>
        Some jobs must happen in a set order. You put on socks before shoes. You take Algebra before Calculus. We draw this as a{" "}
        <strong>directed graph</strong> (lesson 49). A directed graph is a set of dots (called vertices) joined by one-way arrows. Each arrow <code>b → a</code> means
        &quot;<code>b</code> must come before <code>a</code>&quot;. A <strong>topological order</strong> (also called <em>topological sort</em>) is a line-up
        of all the dots where every arrow points forward. For every <code>b → a</code>, <code>b</code> appears earlier than{" "}
        <code>a</code>.
      </p>
      <p>
        Such an order exists only when the graph has no cycle. A cycle is a loop of arrows that leads back to where it started. Say A needs B,
        B needs C and C needs A. Nobody can go first. A directed graph with no cycle is called a <strong>DAG</strong> (directed acyclic graph,
        which just means &quot;one-way arrows, no loops&quot;). Every DAG has at least one topological order, and often many. Any valid one is fine unless
        the problem says otherwise.
      </p>
      <p>
        One more word: the <strong>in-degree</strong> of a dot is the number of arrows pointing <em>into</em> it. Here it means the
        number of prerequisites the task still waits for. A task with in-degree 0 is free to start.
      </p>
      <Callout kind="warn" label="Check the direction">
        LeetCode writes <code>[a, b]</code> as &quot;to take <code>a</code> you must first take <code>b</code>&quot;. So the arrow is{" "}
        <code>b → a</code>. That is the opposite of the order the numbers appear in. Reading the pair backwards is the most common mistake in this topic.
      </Callout>
      <CodeBlock lang="js" code={buildCode} />

      <h2 id="kahn">Kahn&apos;s algorithm</h2>
      <p>
        <strong>Kahn&apos;s algorithm</strong> turns a simple idea into code: &quot;do what is ready, then see what that makes ready.&quot; A queue is a line
        where the first item in is the first item out. The steps:
      </p>
      <ol>
        <li>Count the in-degree of every dot.</li>
        <li>Put every dot with in-degree 0 into a queue.</li>
        <li>Take one dot from the queue and add it to the answer. Look at each dot it points to and subtract 1 from that dot&apos;s in-degree. If the number reaches 0, add that dot to the queue.</li>
        <li>Repeat until the queue is empty.</li>
      </ol>
      <p>
        If the answer has all n dots, you have a valid order. If it is shorter, the dots left over are stuck. Each one is on a cycle, or waits for a dot that is on a cycle, so none of them ever reached in-degree 0. Use the same trick as BFS (breadth-first search): keep a head number for the front of the queue instead of removing items.
        This keeps the time at O(V + E), where V is the number of dots and E is the number of arrows. Every dot goes into the queue once and every arrow is looked at once.
      </p>
      <CodeBlock lang="js" code={kahnCode} />

      <h2 id="trace">Traced: Kahn on six tasks</h2>
      <CodeTrace
        code={traceSrc}
        steps={kahnTrace()}
        caption="Watch the indegree array. A task joins the queue the moment its count hits 0. The final order is 4, 5, 2, 0, 3, 1."
      />

      <h2 id="dfs">DFS-based ordering</h2>
      <p>
        There is a second way. DFS (depth-first search) is a way to explore a graph: you follow one path as deep as you can, then go back and try another. Run DFS and write down each dot at the moment it is <em>finished</em>.
        A dot is finished when every dot it points to is already finished. So a dot always finishes after everything it unlocks.
        That means the finishing list is a valid order <em>backwards</em>. Reverse it and you have a topological order. The finishing order is called the{" "}
        <strong>post-order</strong> of the DFS.
      </p>
      <p>
        To also find cycles, we give every dot one of three states. This is called a &quot;three-colour&quot; DFS.
      </p>
      <DryRun title="the three states of a vertex" cols={["State", "Meaning", "If DFS meets it"]} rows={stateRows} />
      <CodeBlock lang="js" code={dfsOrderCode} />
      <p>
        This answer is different from Kahn&apos;s ([5, 4, 2, 3, 1, 0] vs [4, 5, 2, 0, 3, 1]). Both are correct. Check any arrow, for
        example 2 → 3 (2 comes first in both) or 4 → 0.
      </p>

      <h2 id="cycle">Finding loops in directed graphs</h2>
      <p>
        In an <em>undirected</em> graph (every edge works both ways), meeting a dot you already visited means a cycle. The one exception is the dot you just came from. That rule is
        <strong> wrong for directed graphs</strong>. Look at the diamond 0 → 1 → 3 and 0 → 2 → 3. Dot 3 is reached twice, once through 1 and once
        through 2. Still, there is no cycle, because both arrows go the same way. &quot;Seen before&quot; is a cycle only if the earlier visit is still{" "}
        <em>on the path we are walking now</em>. The VISITING state remembers exactly this. A plain visited set cannot.
      </p>
      <CodeBlock lang="js" code={wrongCycleCode} />
      <Callout kind="note" label="Two ways to find a cycle">
        Kahn&apos;s count (&quot;did all n dots come out?&quot;) and the three-colour DFS (&quot;did I meet a VISITING dot?&quot;) always give the same answer.
        Pick the one that fits the rest of the problem.
      </Callout>

      <h2 id="course">Course schedule</h2>
      <p>
        <strong>Course Schedule</strong> (LeetCode 207) only asks: can every course be finished? That is the same as asking whether the
        prerequisite graph is a DAG. Run Kahn, then compare the number of courses you took with the total. Its sibling{" "}
        <strong>Course Schedule II</strong> (210) wants the actual order. Kahn already gives you that.
      </p>
      <CodeBlock lang="js" code={courseCode} />

      <h2 id="choose">Kahn or DFS: which one?</h2>
      <DryRun
        title="the two topological sorts side by side"
        cols={["", "Kahn (BFS-style)", "DFS post-order"]}
        rows={chooseRows}
        note="Kahn is the safer first choice in interviews. It uses no recursion, and the cycle check is just a count. Use the DFS version when the problem is already a DFS problem (for example 'is this node safe?')."
      />

      <h2 id="practice">Practice questions</h2>
      <p>
        First ask: what are the &quot;tasks&quot;, and what does &quot;must come before&quot; mean here? Sometimes the arrows are given (courses). Sometimes you must
        find them yourself (alien dictionary, recipes). Sometimes the trick is to remove dots from the outside in (minimum height trees).
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Say what a topological order and a DAG are, and which graphs have no valid order.</>,
          <>Write Kahn&apos;s algorithm from memory, including the cycle check.</>,
          <>Explain the three DFS states and why reversing the finish order works.</>,
          <>Explain why a plain visited set gives a wrong cycle answer on a directed diamond.</>,
          <>Say which way the arrow points for the pair [a, b] in Course Schedule.</>,
          <>Name two problems where you must build the graph from other data first.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        So far every arrow counted the same, or had no length at all. In <strong>Lesson 52</strong> arrows get costs. You will use BFS when all costs are equal. Then you will use{" "}
        <strong>Dijkstra</strong> with a priority queue (a line where the smallest item always comes out first) to find the cheapest route. Last comes Bellman–Ford, for when the number of stops is limited.
      </p>
    </DsaLessonPage>
  );
}
