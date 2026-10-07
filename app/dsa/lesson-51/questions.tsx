import Problem from "@/components/dsa/Problem";

/** Lesson 51 practice questions: topological sort and cycle detection. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Course schedule"
        level="Medium"
        examples={[
          { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true", why: "Take course 0, then course 1." },
          { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false", why: "Each course requires the other first, a cycle." },
          { input: "numCourses = 3, prerequisites = []", output: "true", why: "No prerequisites, any order works." },
        ]}
        hints={[
          <>Draw an arrow prerequisite → course. Which kind of graph makes it impossible to finish everything?</>,
          <>A cycle blocks you. So the question is: does this directed graph contain a cycle?</>,
          <>Kahn&apos;s algorithm: repeatedly take courses with no unfinished prerequisites. If you can take all of them, there is no cycle.</>,
        ]}
        approaches={[
          {
            name: "Kahn's algorithm (in-degree)",
            idea: (
              <ol>
                <li>Build the graph with arrows prerequisite → course and count each course&apos;s in-degree.</li>
                <li>Queue every course with in-degree 0.</li>
                <li>Take a course, lower the in-degree of what it unlocks, and enqueue anything that hits 0.</li>
                <li>Answer <code>true</code> if the number of courses taken equals <code>numCourses</code>.</li>
              </ol>
            ),
            code: `function canFinish(numCourses, prerequisites) {
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
  return head === numCourses;
}

console.log(canFinish(2, [[1, 0]]));         // true
console.log(canFinish(2, [[1, 0], [0, 1]])); // false
console.log(canFinish(3, []));               // true`,
            explain: <p>Each course is enqueued once and each prerequisite edge is processed once: O(V + E) time, O(V + E) space. If a cycle exists, every course on it keeps an in-degree of at least 1 (it waits for the previous one on the loop), so none is ever taken and the count falls short.</p>,
          },
          {
            name: "DFS with three states",
            idea: <p>Walk the graph with DFS, tracking which vertices are on the current path. Reaching a vertex that is still on the path means a cycle. A finished vertex is marked so it is never walked twice.</p>,
            code: `function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  for (const [course, prereq] of prerequisites) graph[prereq].push(course);

  const state = new Array(numCourses).fill(0);     // 0 unseen, 1 on the current path, 2 finished
  function hasCycle(v) {
    if (state[v] === 1) return true;
    if (state[v] === 2) return false;
    state[v] = 1;
    for (const next of graph[v]) if (hasCycle(next)) return true;
    state[v] = 2;
    return false;
  }
  for (let c = 0; c < numCourses; c++) if (hasCycle(c)) return false;
  return true;
}

console.log(canFinish(2, [[1, 0]]));         // true
console.log(canFinish(2, [[1, 0], [0, 1]])); // false
console.log(canFinish(3, []));               // true`,
            explain: <p>Same O(V + E) time. State 2 is what keeps it linear: without it, a vertex reachable along many paths would be re-explored each time, which can be exponential. State 1 (not a plain visited flag) is what avoids false alarms on diamond shapes.</p>,
          },
        ]}
        compare={<p>Kahn&apos;s version has no recursion and gives the order for free, so it carries over directly to the next problem. The DFS version is the classic cycle test. (LeetCode 207.)</p>}
      >
        <p>
          There are <code>numCourses</code> courses labelled <code>0</code> to <code>numCourses - 1</code>. Each pair{" "}
          <code>[a, b]</code> in <code>prerequisites</code> means you must take course <code>b</code> before course <code>a</code>. Return{" "}
          <code>true</code> if you can finish all courses.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Course schedule II"
        level="Medium"
        examples={[
          { input: "numCourses = 2, prerequisites = [[1,0]]", output: "[0,1]", why: "0 first, then 1." },
          { input: "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]", output: "[0,1,2,3]", why: "0 unlocks 1 and 2, which both must be done before 3. [0,2,1,3] is also valid." },
          { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "[]", why: "A cycle: no valid order." },
        ]}
        hints={[
          <>This is question 1, except you must return the order itself.</>,
          <>The order in which Kahn&apos;s algorithm takes courses is already a valid schedule.</>,
          <>If fewer than numCourses came out, return an empty array.</>,
        ]}
        approaches={[
          {
            name: "Kahn's algorithm",
            idea: <p>Run Kahn&apos;s algorithm and record every course as it leaves the queue.</p>,
            code: `function findOrder(numCourses, prerequisites) {
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
  return queue.length === numCourses ? queue : [];   // the queue ends up holding the order
}

console.log(findOrder(2, [[1, 0]]));                             // [ 0, 1 ]
console.log(findOrder(4, [[1, 0], [2, 0], [3, 1], [3, 2]]));     // [ 0, 1, 2, 3 ]
console.log(findOrder(2, [[1, 0], [0, 1]]));                     // []`,
            explain: <p>Nothing is ever removed from the queue array (we only move <code>head</code>), so after the loop it holds every course in the order it was processed. O(V + E).</p>,
          },
          {
            name: "DFS post-order, reversed",
            idea: <p>DFS from every unseen course along arrows prerequisite → course. Append a course to a list when it finishes; the reversed list is the schedule. A course met while still on the path means a cycle.</p>,
            code: `function findOrder(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  for (const [course, prereq] of prerequisites) graph[prereq].push(course);

  const state = new Array(numCourses).fill(0);     // 0 unseen, 1 on the current path, 2 finished
  const finished = [];
  let cycle = false;
  function visit(v) {
    state[v] = 1;
    for (const next of graph[v]) {
      if (state[next] === 1) cycle = true;
      else if (state[next] === 0) visit(next);
    }
    state[v] = 2;
    finished.push(v);
  }
  for (let c = 0; c < numCourses; c++) if (state[c] === 0) visit(c);
  return cycle ? [] : finished.reverse();
}

console.log(findOrder(2, [[1, 0]]));                             // [ 0, 1 ]
console.log(findOrder(4, [[1, 0], [2, 0], [3, 1], [3, 2]]));     // [ 0, 2, 1, 3 ]
console.log(findOrder(2, [[1, 0], [0, 1]]));                     // []`,
            explain: <p>A course finishes only after every course it unlocks has finished, so reversing puts each prerequisite before what it unlocks. O(V + E). This order differs from Kahn&apos;s, and both are accepted.</p>,
          },
        ]}
        compare={<p>Kahn&apos;s is shorter and iterative; DFS is the one to know for when the problem is already phrased as a DFS. (LeetCode 210.)</p>}
      >
        <p>
          Same setting as the previous question. Return <em>an ordering</em> of the courses that satisfies every prerequisite. If several orders work,
          return any; if none does, return an empty array.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Find eventual safe states"
        level="Medium"
        examples={[
          { input: "graph = [[1,2],[2,3],[5],[0],[5],[],[]]", output: "[2,4,5,6]", why: "5 and 6 have no outgoing edges (terminal). 2 and 4 lead only to 5. Nodes 0, 1, 3 can reach the cycle 0 → 1 → 3 → 0." },
          { input: "graph = [[1,2,3,4],[1,2],[3,4],[0,4],[]]", output: "[4]", why: "Node 1 points to itself, and everything else can reach it or the loop 0 → 2 → 3 → 0." },
        ]}
        hints={[
          <>graph[i] lists the nodes that i points to. A node is safe if every path starting from it ends at a terminal node (one with no outgoing edges).</>,
          <>A node is unsafe exactly when it can reach a cycle. So you are looking for the nodes that cannot.</>,
          <>Flip the question: start from terminals and spread backwards along reversed arrows. When can a node be declared safe?</>,
        ]}
        approaches={[
          {
            name: "DFS with colours",
            idea: <p>Run the three-state DFS. A node is safe when all its neighbours are safe. If the DFS meets a node that is still on the current path, or one already known to be unsafe, then the starting node is unsafe.</p>,
            code: `function eventualSafeNodes(graph) {
  const n = graph.length;
  const state = new Array(n).fill(0);     // 0 unseen, 1 on the path or unsafe, 2 safe
  function isSafe(v) {
    if (state[v] !== 0) return state[v] === 2;
    state[v] = 1;                         // stays 1 if we return false: that marks "unsafe"
    for (const next of graph[v]) if (!isSafe(next)) return false;
    state[v] = 2;
    return true;
  }
  const result = [];
  for (let v = 0; v < n; v++) if (isSafe(v)) result.push(v);
  return result;
}

console.log(eventualSafeNodes([[1, 2], [2, 3], [5], [0], [5], [], []]));         // [ 2, 4, 5, 6 ]
console.log(eventualSafeNodes([[1, 2, 3, 4], [1, 2], [3, 4], [0, 4], []]));      // [ 4 ]`,
            explain: <p>Every node is explored at most once thanks to the cached state, so O(V + E). Leaving state 1 on failure is deliberate: a node on a cycle, or leading into one, must never be reported safe later.</p>,
          },
          {
            name: "Reverse graph + Kahn on out-degree",
            idea: (
              <ol>
                <li>Reverse every arrow, and record each node&apos;s out-degree (its number of outgoing arrows in the original).</li>
                <li>Start the queue with terminals (out-degree 0).</li>
                <li>When a node is safe, each node that pointed to it loses one unresolved outgoing arrow. At out-degree 0, that node is safe too.</li>
              </ol>
            ),
            code: `function eventualSafeNodes(graph) {
  const n = graph.length;
  const reverse = Array.from({ length: n }, () => []);
  const outdeg = new Array(n).fill(0);
  for (let v = 0; v < n; v++) {
    outdeg[v] = graph[v].length;
    for (const next of graph[v]) reverse[next].push(v);
  }
  const queue = [];
  for (let v = 0; v < n; v++) if (outdeg[v] === 0) queue.push(v);
  const safe = new Array(n).fill(false);
  let head = 0;
  while (head < queue.length) {
    const v = queue[head++];
    safe[v] = true;
    for (const prev of reverse[v]) {
      if (--outdeg[prev] === 0) queue.push(prev);
    }
  }
  const result = [];
  for (let v = 0; v < n; v++) if (safe[v]) result.push(v);   // already in ascending order
  return result;
}

console.log(eventualSafeNodes([[1, 2], [2, 3], [5], [0], [5], [], []]));         // [ 2, 4, 5, 6 ]
console.log(eventualSafeNodes([[1, 2, 3, 4], [1, 2], [3, 4], [0, 4], []]));      // [ 4 ]`,
            explain: <p>This is topological sort on the reversed graph: nodes that can never be peeled off are exactly the ones that reach a cycle. O(V + E), iterative, and the answer is naturally easy to sort by scanning indices.</p>,
          },
        ]}
        compare={<p>Both are O(V + E). The DFS is compact; the reversed Kahn avoids recursion. (LeetCode 802, an alternative to 1462 Course Schedule IV, which needs reachability between pairs.)</p>}
      >
        <p>
          A directed graph has <code>n</code> nodes, where <code>graph[i]</code> lists the nodes that <code>i</code> has an edge to. A node is{" "}
          <strong>terminal</strong> if it has no outgoing edges, and <strong>safe</strong> if every path starting from it leads to a terminal node.
          Return all safe nodes in ascending order.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Alien dictionary (premium)"
        level="Hard"
        examples={[
          { input: 'words = ["wrt","wrf","er","ett","rftt"]', output: '"wertf"', why: "Comparing neighbours: wrt<wrf gives t before f; wrf<er gives w before e; er<ett gives r before t; ett<rftt gives e before r. So w, e, r, t, f." },
          { input: 'words = ["z","x"]', output: '"zx"', why: "z comes before x." },
          { input: 'words = ["z","x","z"]', output: '""', why: "z before x and x before z: a contradiction." },
          { input: 'words = ["abc","ab"]', output: '""', why: "A longer word cannot come before its own prefix." },
        ]}
        hints={[
          <>Each pair of neighbouring words tells you at most one fact about the alphabet. Which letters give it away?</>,
          <>Compare two neighbouring words letter by letter. At the first position where they differ, the letter in the first word comes before the letter in the second.</>,
          <>Those facts are arrows between letters. Topologically sort the letters. Watch for the prefix trap and for cycles.</>,
        ]}
        approaches={[
          {
            name: "Build edges, then Kahn's algorithm",
            idea: (
              <ol>
                <li>Collect every letter that appears; each is a vertex.</li>
                <li>For each neighbouring pair of words, find the first differing position and add an edge <code>earlier → later</code> (once only). If the second word is a proper prefix of the first, the input is invalid: return an empty string.</li>
                <li>Run Kahn&apos;s algorithm. If not every letter comes out, there is a cycle: return an empty string.</li>
              </ol>
            ),
            code: `function alienOrder(words) {
  const edges = new Map();                         // letter -> set of letters that must come after it
  const indegree = new Map();
  for (const word of words) {
    for (const ch of word) {
      if (!edges.has(ch)) { edges.set(ch, new Set()); indegree.set(ch, 0); }
    }
  }
  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i], b = words[i + 1];
    if (a.length > b.length && a.startsWith(b)) return "";   // "abc" before "ab" is impossible
    for (let j = 0; j < Math.min(a.length, b.length); j++) {
      if (a[j] !== b[j]) {
        if (!edges.get(a[j]).has(b[j])) {
          edges.get(a[j]).add(b[j]);
          indegree.set(b[j], indegree.get(b[j]) + 1);
        }
        break;                                     // later letters tell us nothing
      }
    }
  }
  const queue = [];
  for (const [ch, deg] of indegree) if (deg === 0) queue.push(ch);
  let head = 0;
  while (head < queue.length) {
    const ch = queue[head++];
    for (const next of edges.get(ch)) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }
  return queue.length === edges.size ? queue.join("") : "";
}

console.log(alienOrder(["wrt", "wrf", "er", "ett", "rftt"])); // wertf
console.log(alienOrder(["z", "x"]));                          // zx
console.log(alienOrder(["z", "x", "z"]));                     // (empty string)
console.log(alienOrder(["abc", "ab"]));                       // (empty string)`,
            explain: <p>Time O(L + C + E) where L is the total number of characters across all words, C the number of distinct letters and E the number of distinct edges: building the edges reads each neighbouring pair of words once, and Kahn is linear in letters and edges. Only the first difference between neighbours counts; letters after it say nothing about order. Letters with no constraints can appear anywhere, so several answers may be valid.</p>,
          },
          {
            name: "Build edges, then DFS post-order",
            idea: <p>Build the same graph, then run the three-state DFS, reversing the finishing order. Meeting a letter that is on the current path means a cycle.</p>,
            code: `function alienOrder(words) {
  const edges = new Map();
  for (const word of words) for (const ch of word) if (!edges.has(ch)) edges.set(ch, new Set());
  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i], b = words[i + 1];
    if (a.length > b.length && a.startsWith(b)) return "";
    for (let j = 0; j < Math.min(a.length, b.length); j++) {
      if (a[j] !== b[j]) { edges.get(a[j]).add(b[j]); break; }
    }
  }
  const state = new Map();                         // missing = unseen, 1 = on the path, 2 = finished
  const finished = [];
  function visit(ch) {                             // returns false when a cycle is found
    state.set(ch, 1);
    for (const next of edges.get(ch)) {
      if (state.get(next) === 1) return false;
      if (!state.has(next) && !visit(next)) return false;
    }
    state.set(ch, 2);
    finished.push(ch);
    return true;
  }
  for (const ch of edges.keys()) if (!state.has(ch) && !visit(ch)) return "";
  return finished.reverse().join("");
}

console.log(alienOrder(["wrt", "wrf", "er", "ett", "rftt"])); // wertf
console.log(alienOrder(["z", "x"]));                          // zx
console.log(alienOrder(["z", "x", "z"]));                     // (empty string)
console.log(alienOrder(["abc", "ab"]));                       // (empty string)`,
            explain: <p>Same graph and the same complexity. Using a Set for each letter&apos;s outgoing edges dedupes repeated facts such as two pairs both saying a before b.</p>,
          },
        ]}
        compare={<p>Kahn&apos;s is the usual interview answer, since cycle detection falls out of a simple count. The two traps that fail most attempts are the prefix case and counting duplicate edges. This is a premium problem on LeetCode (269, &quot;Alien Dictionary&quot;); the statement is reproduced here.</p>}
      >
        <p>
          A new language uses the lowercase English letters, but in an unknown order. You are given <code>words</code>, a list sorted
          lexicographically according to that alphabet. Return a string of the letters that appear, in a valid order for the alien alphabet. If
          the input is inconsistent, return an empty string. If several orders are valid, return any.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Minimum height trees"
        level="Medium"
        examples={[
          { input: "n = 4, edges = [[1,0],[1,2],[1,3]]", output: "[1]", why: "Rooted at 1 the tree has height 1; rooted anywhere else the height is 2." },
          { input: "n = 6, edges = [[3,0],[3,1],[3,2],[3,4],[5,4]]", output: "[3,4]", why: "Both 3 and 4 give height 2, the smallest possible." },
          { input: "n = 1, edges = []", output: "[0]", why: "A single node." },
        ]}
        hints={[
          <>The graph is a tree. Rooting at a node and measuring the tallest branch gives that root&apos;s height. Which roots give the smallest height?</>,
          <>Trying every root works but costs O(n²). Where in a tree would a good root sit: near the leaves or near the middle?</>,
          <>Peel off all the leaves, then the new leaves, and so on, like Kahn&apos;s algorithm working inwards. What is left at the end?</>,
        ]}
        approaches={[
          {
            name: "Brute force: BFS from every node",
            idea: <p>For each node as root, run BFS and count the levels (the height). Keep the roots whose height equals the minimum.</p>,
            code: `function findMinHeightTrees(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a); }

  function height(root) {
    const seen = new Array(n).fill(false);
    seen[root] = true;
    let level = [root], h = -1;
    while (level.length) {
      h++;
      const next = [];
      for (const v of level) for (const w of graph[v]) if (!seen[w]) { seen[w] = true; next.push(w); }
      level = next;
    }
    return h;
  }

  let best = Infinity, result = [];
  for (let r = 0; r < n; r++) {
    const h = height(r);
    if (h < best) { best = h; result = [r]; }
    else if (h === best) result.push(r);
  }
  return result;
}

console.log(findMinHeightTrees(4, [[1, 0], [1, 2], [1, 3]]));                         // [ 1 ]
console.log(findMinHeightTrees(6, [[3, 0], [3, 1], [3, 2], [3, 4], [5, 4]]));         // [ 3, 4 ]
console.log(findMinHeightTrees(1, []));                                               // [ 0 ]`,
            explain: <p>One BFS is O(n) and there are n of them: O(n²) time. Correct, but too slow for n up to 20,000.</p>,
          },
          {
            name: "Peel the leaves (topological idea)",
            idea: (
              <ol>
                <li>A node&apos;s degree is the number of neighbours. Leaves have degree 1.</li>
                <li>Remove all current leaves at once (one &quot;layer&quot;), lowering their neighbours&apos; degrees. Neighbours that become leaves form the next layer.</li>
                <li>Stop when at most 2 nodes remain. Those are the centre(s) of the tree, and the answer.</li>
              </ol>
            ),
            code: `function findMinHeightTrees(n, edges) {
  if (n <= 2) return Array.from({ length: n }, (_, i) => i);
  const graph = Array.from({ length: n }, () => []);
  const degree = new Array(n).fill(0);
  for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a); degree[a]++; degree[b]++; }

  let leaves = [];
  for (let v = 0; v < n; v++) if (degree[v] === 1) leaves.push(v);
  let remaining = n;
  while (remaining > 2) {
    remaining -= leaves.length;               // delete this whole layer
    const nextLeaves = [];
    for (const leaf of leaves) {
      for (const nb of graph[leaf]) {
        if (--degree[nb] === 1) nextLeaves.push(nb);   // nb has become a leaf
      }
    }
    leaves = nextLeaves;
  }
  return leaves;
}

console.log(findMinHeightTrees(4, [[1, 0], [1, 2], [1, 3]]));                         // [ 1 ]
console.log(findMinHeightTrees(6, [[3, 0], [3, 1], [3, 2], [3, 4], [5, 4]]));         // [ 3, 4 ]
console.log(findMinHeightTrees(1, []));                                               // [ 0 ]`,
            explain: <p>Each node is removed once and each edge is looked at twice: O(n) time and space. The final one or two nodes are the middle of the longest path, which is why they minimise the height. A tree has at most two such centres, so the loop can stop as soon as 2 or fewer nodes remain.</p>,
          },
        ]}
        compare={<p>The peeling method, a Kahn-style process on an undirected tree. The brute force is a useful check on small inputs. (LeetCode 310.)</p>}
      >
        <p>
          A tree is a connected graph with no cycles. Given <code>n</code> nodes labelled <code>0..n-1</code> and the list of undirected{" "}
          <code>edges</code>, you may choose any node as the root. The <strong>height</strong> of a rooted tree is the number of edges on the longest
          path from the root downwards. Return the labels of every root that gives the minimum height, in any order.
        </p>
      </Problem>

      <Problem
        n={6}
        title="Parallel courses (premium)"
        level="Medium"
        examples={[
          { input: "n = 3, relations = [[1,3],[2,3]]", output: "2", why: "Semester 1: courses 1 and 2 (together). Semester 2: course 3." },
          { input: "n = 3, relations = [[1,2],[2,3],[3,1]]", output: "-1", why: "A cycle means no course in it can ever start." },
          { input: "n = 4, relations = [[1,2],[2,3],[1,4]]", output: "3", why: "The chain 1 → 2 → 3 needs three semesters; course 4 fits alongside." },
        ]}
        hints={[
          <>Each pair <code>[prev, next]</code> is an arrow prev → next. In one semester you may take every course whose prerequisites are all done.</>,
          <>Kahn&apos;s algorithm already releases courses in &quot;waves&quot;. What does one wave correspond to?</>,
          <>The answer is the number of waves, or the length of the longest chain of prerequisites. If a cycle blocks some courses, return -1.</>,
        ]}
        approaches={[
          {
            name: "Kahn's algorithm, one semester per round",
            idea: <p>Process the queue a whole level at a time. Each level is one semester. Count semesters and courses taken; if not all courses were taken, there is a cycle.</p>,
            code: `function minimumSemesters(n, relations) {
  const graph = Array.from({ length: n + 1 }, () => []);   // courses are numbered from 1
  const indegree = new Array(n + 1).fill(0);
  for (const [prev, next] of relations) { graph[prev].push(next); indegree[next]++; }

  let current = [];
  for (let c = 1; c <= n; c++) if (indegree[c] === 0) current.push(c);
  let semesters = 0, taken = 0;
  while (current.length) {
    semesters++;
    const nextRound = [];
    for (const c of current) {
      taken++;
      for (const next of graph[c]) if (--indegree[next] === 0) nextRound.push(next);
    }
    current = nextRound;
  }
  return taken === n ? semesters : -1;
}

console.log(minimumSemesters(3, [[1, 3], [2, 3]]));                 // 2
console.log(minimumSemesters(3, [[1, 2], [2, 3], [3, 1]]));         // -1
console.log(minimumSemesters(4, [[1, 2], [2, 3], [1, 4]]));         // 3`,
            explain: <p>Every course is taken in the earliest semester in which all its prerequisites are finished, so the number of rounds equals the length (in courses) of the longest prerequisite chain. O(n + E).</p>,
          },
          {
            name: "DFS: longest chain with memo",
            idea: <p>The earliest semester for a course is 1 + the largest earliest-semester among its prerequisites. Compute it with DFS plus a cache, and use three states to detect a cycle.</p>,
            code: `function minimumSemesters(n, relations) {
  const prereqs = Array.from({ length: n + 1 }, () => []);   // prereqs[c] = courses needed before c
  for (const [prev, next] of relations) prereqs[next].push(prev);

  const state = new Array(n + 1).fill(0);       // 0 unseen, 1 on the path, 2 done
  const semester = new Array(n + 1).fill(0);    // earliest semester for each course, once done
  function earliest(c) {                        // returns -1 if a cycle is found
    if (state[c] === 2) return semester[c];
    if (state[c] === 1) return -1;
    state[c] = 1;
    let best = 0;
    for (const p of prereqs[c]) {
      const s = earliest(p);
      if (s === -1) return -1;
      best = Math.max(best, s);
    }
    state[c] = 2;
    semester[c] = best + 1;
    return semester[c];
  }
  let answer = 0;
  for (let c = 1; c <= n; c++) {
    const s = earliest(c);
    if (s === -1) return -1;
    answer = Math.max(answer, s);
  }
  return answer;
}

console.log(minimumSemesters(3, [[1, 3], [2, 3]]));                 // 2
console.log(minimumSemesters(3, [[1, 2], [2, 3], [3, 1]]));         // -1
console.log(minimumSemesters(4, [[1, 2], [2, 3], [1, 4]]));         // 3`,
            explain: <p>Memoisation makes each course computed once: O(n + E). It is the longest-path-in-a-DAG idea, which only works because the graph has no cycles.</p>,
          },
        ]}
        compare={<p>Kahn by levels is the cleaner choice because the rounds are the answer. This is a premium problem on LeetCode (1136, &quot;Parallel Courses&quot;); the statement is reproduced here.</p>}
      >
        <p>
          You are given <code>n</code> courses labelled <code>1..n</code> and <code>relations</code>, where <code>[prev, next]</code> means course{" "}
          <code>prev</code> must be finished before <code>next</code> starts. In one semester you can take <em>any number</em> of courses, as long as you
          finished all their prerequisites in earlier semesters. Return the minimum number of semesters needed to take every course, or{" "}
          <code>-1</code> if it is impossible.
        </p>
      </Problem>

      <Problem
        n={7}
        title="Find all possible recipes from given supplies"
        level="Medium"
        examples={[
          { input: 'recipes = ["bread"], ingredients = [["yeast","flour"]], supplies = ["yeast","flour","corn"]', output: '["bread"]', why: "Both ingredients are supplies." },
          { input: 'recipes = ["bread","sandwich"], ingredients = [["yeast","flour"],["bread","meat"]], supplies = ["yeast","flour","meat"]', output: '["bread","sandwich"]', why: "Bread first, then the sandwich uses bread and meat." },
          { input: 'recipes = ["a","b"], ingredients = [["b"],["a"]], supplies = []', output: "[]", why: "a needs b and b needs a: neither can start." },
        ]}
        hints={[
          <>A recipe can be made once every ingredient is available. Ingredients are either supplies or other recipes.</>,
          <>Draw an arrow ingredient → recipe. What plays the role of in-degree for a recipe?</>,
          <>Start the queue with the supplies. Each time an item becomes available, tell every recipe that uses it.</>,
        ]}
        approaches={[
          {
            name: "Repeat until nothing changes",
            idea: <p>Keep a set of available items (the supplies). Sweep over all recipes repeatedly: whenever all of a recipe&apos;s ingredients are available, make it and add it to the set. Stop after a sweep with no new recipe.</p>,
            code: `function findAllRecipes(recipes, ingredients, supplies) {
  const have = new Set(supplies);
  const made = new Array(recipes.length).fill(false);
  const result = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < recipes.length; i++) {
      if (made[i]) continue;
      if (ingredients[i].every((x) => have.has(x))) {
        made[i] = true;
        have.add(recipes[i]);
        result.push(recipes[i]);
        changed = true;
      }
    }
  }
  return result;
}

console.log(findAllRecipes(["bread"], [["yeast", "flour"]], ["yeast", "flour", "corn"]));                         // [ 'bread' ]
console.log(findAllRecipes(["bread", "sandwich"], [["yeast", "flour"], ["bread", "meat"]], ["yeast", "flour", "meat"])); // [ 'bread', 'sandwich' ]
console.log(findAllRecipes(["a", "b"], [["b"], ["a"]], []));                                                     // []`,
            explain: <p>Each sweep costs the total number of ingredients (I), and in the worst case there are as many sweeps as recipes (R): O(R × I). Fine for small inputs, but it keeps rescanning recipes that are nowhere near ready.</p>,
          },
          {
            name: "Kahn's algorithm from the supplies",
            idea: (
              <ol>
                <li>For each ingredient, remember which recipes need it. For each recipe, count its ingredients (its in-degree).</li>
                <li>Queue all supplies.</li>
                <li>Pop an item; for each recipe that needs it, decrement that recipe&apos;s count. At 0, the recipe is makeable: record it and enqueue it, since other recipes may need it.</li>
              </ol>
            ),
            code: `function findAllRecipes(recipes, ingredients, supplies) {
  const neededBy = new Map();                    // item -> recipes that use it
  const missing = new Map();                     // recipe -> ingredients still unavailable
  for (let i = 0; i < recipes.length; i++) {
    missing.set(recipes[i], ingredients[i].length);
    for (const item of ingredients[i]) {
      if (!neededBy.has(item)) neededBy.set(item, []);
      neededBy.get(item).push(recipes[i]);
    }
  }
  const queue = [...supplies];
  let head = 0;
  const result = [];
  while (head < queue.length) {
    const item = queue[head++];
    for (const recipe of neededBy.get(item) || []) {
      missing.set(recipe, missing.get(recipe) - 1);
      if (missing.get(recipe) === 0) { result.push(recipe); queue.push(recipe); }
    }
  }
  return result;
}

console.log(findAllRecipes(["bread"], [["yeast", "flour"]], ["yeast", "flour", "corn"]));                         // [ 'bread' ]
console.log(findAllRecipes(["bread", "sandwich"], [["yeast", "flour"], ["bread", "meat"]], ["yeast", "flour", "meat"])); // [ 'bread', 'sandwich' ]
console.log(findAllRecipes(["a", "b"], [["b"], ["a"]], []));                                                     // []`,
            explain: <p>Each ingredient entry is processed once: O(S + R + I). Recipes on a cycle (or that need something no one supplies) never reach count 0 and are simply never reported, so no separate cycle check is needed.</p>,
          },
        ]}
        compare={<p>Kahn&apos;s algorithm: linear instead of repeated sweeps, and the supplies play the role of the zero-in-degree vertices. (LeetCode 2115.)</p>}
      >
        <p>
          You have <code>recipes[i]</code>, each needing the ingredients listed in <code>ingredients[i]</code>, and an initial list of{" "}
          <code>supplies</code> (unlimited amounts). An ingredient can itself be another recipe. Recipe names and supplies are all distinct. Return every recipe you can make, in any order.
        </p>
      </Problem>
    </>
  );
}
