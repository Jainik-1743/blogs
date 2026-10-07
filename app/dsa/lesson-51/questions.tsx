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
          { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false", why: "Each course needs the other one first. That is a cycle (a loop)." },
          { input: "numCourses = 3, prerequisites = []", output: "true", why: "There are no prerequisites, so any order works." },
        ]}
        hints={[
          <>Draw an arrow prerequisite → course. Which kind of graph makes it impossible to finish all courses?</>,
          <>A cycle blocks you. So the real question is: does this graph of one-way arrows contain a cycle?</>,
          <>Use Kahn&apos;s algorithm: keep taking courses that have no unfinished prerequisites. If you can take all of them, there is no cycle.</>,
        ]}
        approaches={[
          {
            name: "Kahn's algorithm (in-degree)",
            idea: (
              <ol>
                <li>Build the graph with arrows prerequisite → course. Count each course&apos;s in-degree (how many prerequisites it still waits for).</li>
                <li>Put every course with in-degree 0 into a queue (a line: first in, first out).</li>
                <li>Take a course. Lower the in-degree of the courses it unlocks. Add any course that reaches 0 to the queue.</li>
                <li>Answer <code>true</code> if the number of courses you took equals <code>numCourses</code>.</li>
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
            explain: <p>Each course goes into the queue once and each prerequisite arrow is used once. So the time is O(V + E) and the space is O(V + E). Here V is the number of courses and E is the number of arrows. If there is a cycle, every course on it keeps an in-degree of at least 1, because it waits for the one before it in the loop. So none of them is ever taken, and the count is too small.</p>,
          },
          {
            name: "DFS with three states",
            idea: <p>Walk the graph with DFS (go as deep as you can, then back up). Keep track of which courses are on the path you are walking now. If you reach a course that is still on this path, you found a cycle. Mark a finished course so you never walk it twice.</p>,
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
            explain: <p>The time is the same, O(V + E). State 2 keeps it fast. Without it, a course reachable by many paths would be explored again each time, which can take a very long time. State 1 (instead of a plain visited flag) avoids false alarms on diamond shapes.</p>,
          },
        ]}
        compare={<p>Kahn&apos;s version has no recursion and gives you the order for free, so it works directly for the next problem. The DFS version is the classic way to test for a cycle. (LeetCode 207.)</p>}
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
          { input: "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]", output: "[0,1,2,3]", why: "0 unlocks 1 and 2. Both must be done before 3. [0,2,1,3] is also valid." },
          { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "[]", why: "There is a cycle, so no valid order exists." },
        ]}
        hints={[
          <>This is question 1, but now you must return the order itself.</>,
          <>The order in which Kahn&apos;s algorithm takes the courses is already a valid schedule.</>,
          <>If fewer than numCourses courses came out, return an empty array.</>,
        ]}
        approaches={[
          {
            name: "Kahn's algorithm",
            idea: <p>Run Kahn&apos;s algorithm. Write down every course as it leaves the queue.</p>,
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
            explain: <p>We never remove anything from the queue array. We only move <code>head</code>. So after the loop the array holds every course in the order it was processed. The time is O(V + E).</p>,
          },
          {
            name: "DFS post-order, reversed",
            idea: <p>Start a DFS from every course you have not seen yet, following arrows prerequisite → course. Add a course to a list when it finishes. The reversed list is the schedule. If you meet a course that is still on the current path, there is a cycle.</p>,
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
            explain: <p>A course finishes only after every course it unlocks has finished. So after reversing, each prerequisite comes before the courses it unlocks. The time is O(V + E). This order is different from Kahn&apos;s order, and both are accepted.</p>,
          },
        ]}
        compare={<p>Kahn&apos;s is shorter and uses a loop instead of recursion. Know the DFS one too, for problems that are already DFS problems. (LeetCode 210.)</p>}
      >
        <p>
          Same setup as the previous question. Return <em>an order</em> of the courses that follows every prerequisite. If several orders work,
          return any of them. If none works, return an empty array.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Find eventual safe states"
        level="Medium"
        examples={[
          { input: "graph = [[1,2],[2,3],[5],[0],[5],[],[]]", output: "[2,4,5,6]", why: "5 and 6 have no outgoing arrows (they are terminal). 2 and 4 lead only to 5. Nodes 0, 1, 3 can reach the cycle 0 → 1 → 3 → 0." },
          { input: "graph = [[1,2,3,4],[1,2],[3,4],[0,4],[]]", output: "[4]", why: "Node 1 points to itself. Every other node (except 4) can reach it or the loop 0 → 2 → 3 → 0." },
        ]}
        hints={[
          <>graph[i] lists the nodes that i points to. A node is safe if every path that starts from it ends at a terminal node (a node with no outgoing arrows).</>,
          <>A node is unsafe exactly when it can reach a cycle. So you are looking for the nodes that cannot reach one.</>,
          <>Flip the question. Start from the terminal nodes and spread backwards along the arrows. When can you say a node is safe?</>,
        ]}
        approaches={[
          {
            name: "DFS with colours",
            idea: <p>Run the three-state DFS. A node is safe when all the nodes it points to are safe. If the DFS meets a node that is still on the current path, or one already known to be unsafe, then the node you started from is unsafe.</p>,
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
            explain: <p>Every node is explored at most once because we remember its state. So the time is O(V + E). We leave state 1 on purpose when a node fails. A node on a cycle, or one that leads into a cycle, must never be called safe later.</p>,
          },
          {
            name: "Reverse graph + Kahn on out-degree",
            idea: (
              <ol>
                <li>Reverse every arrow. Also record each node&apos;s out-degree (the number of arrows going out of it in the original graph).</li>
                <li>Start the queue with the terminal nodes (out-degree 0).</li>
                <li>When a node is safe, every node that pointed to it has one less unsettled arrow. When a node reaches out-degree 0, it is safe too.</li>
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
            explain: <p>This is topological sort on the reversed graph. The nodes that can never be taken away are exactly the ones that reach a cycle. The time is O(V + E), it uses a loop instead of recursion, and the answer is easy to put in order by scanning the numbers.</p>,
          },
        ]}
        compare={<p>Both are O(V + E). The DFS is short. The reversed Kahn avoids recursion. (LeetCode 802. A related problem is 1462, Course Schedule IV, which asks whether one course can reach another.)</p>}
      >
        <p>
          A directed graph has <code>n</code> nodes. <code>graph[i]</code> lists the nodes that <code>i</code> has an arrow to. A node is{" "}
          <strong>terminal</strong> if it has no outgoing arrows. A node is <strong>safe</strong> if every path that starts from it leads to a terminal node.
          Return all safe nodes in ascending order.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Alien dictionary (premium)"
        level="Hard"
        examples={[
          { input: 'words = ["wrt","wrf","er","ett","rftt"]', output: '"wertf"', why: "Compare each word with the next one. wrt<wrf gives t before f. wrf<er gives w before e. er<ett gives r before t. ett<rftt gives e before r. So the order is w, e, r, t, f." },
          { input: 'words = ["z","x"]', output: '"zx"', why: "z comes before x." },
          { input: 'words = ["z","x","z"]', output: '""', why: "z must be before x and x must be before z. That cannot be true." },
          { input: 'words = ["abc","ab"]', output: '""', why: "A longer word cannot come before its own start (prefix)." },
        ]}
        hints={[
          <>Each pair of next-to-each-other words tells you at most one fact about the alphabet. Which letters show that fact?</>,
          <>Compare two next-to-each-other words letter by letter. At the first place where they differ, the letter in the first word comes before the letter in the second word.</>,
          <>Treat those facts as arrows between letters. Then do a topological sort of the letters. Watch out for the prefix trap (a longer word before its own start) and for cycles.</>,
        ]}
        approaches={[
          {
            name: "Build edges, then Kahn's algorithm",
            idea: (
              <ol>
                <li>Collect every letter that appears. Each letter is one vertex (one dot in the graph).</li>
                <li>For each pair of next-to-each-other words, find the first place where they differ. Add an arrow <code>earlier → later</code> (only once). If the second word is the first word&apos;s own start (a prefix) and is shorter, the input is invalid. Return an empty string.</li>
                <li>Run Kahn&apos;s algorithm. If not every letter comes out, there is a cycle. Return an empty string.</li>
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
            explain: <p>The time is O(L + C + E). L is the total number of characters in all words. C is the number of different letters. E is the number of different arrows. Building the arrows reads each pair of next-to-each-other words once. Kahn takes time in line with the letters and arrows. Only the first difference between two words counts. The letters after it say nothing about the order. Letters with no rules can go anywhere, so several answers can be valid.</p>,
          },
          {
            name: "Build edges, then DFS post-order",
            idea: <p>Build the same graph. Then run the three-state DFS and reverse the finishing order. If you meet a letter that is on the current path, there is a cycle.</p>,
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
            explain: <p>The graph and the time are the same. A Set for each letter&apos;s outgoing arrows removes repeats, for example when two pairs both say a is before b.</p>,
          },
        ]}
        compare={<p>Kahn&apos;s is the usual interview answer, because the cycle check is just a count. Two traps make most attempts fail: the prefix case and counting the same arrow twice. This is a premium (paid) problem on LeetCode (269, &quot;Alien Dictionary&quot;). The statement is copied here.</p>}
      >
        <p>
          A new language uses the lowercase English letters, but in an unknown order. You are given <code>words</code>, a list sorted
          in dictionary order of that alphabet. Return a string of the letters that appear, in a valid order for the alien alphabet. If
          the input contradicts itself, return an empty string. If several orders are valid, return any of them.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Minimum height trees"
        level="Medium"
        examples={[
          { input: "n = 4, edges = [[1,0],[1,2],[1,3]]", output: "[1]", why: "With 1 as the root, the tree has height 1. With any other root, the height is 2." },
          { input: "n = 6, edges = [[3,0],[3,1],[3,2],[3,4],[5,4]]", output: "[3,4]", why: "Both 3 and 4 give height 2, which is the smallest possible." },
          { input: "n = 1, edges = []", output: "[0]", why: "There is only one node." },
        ]}
        hints={[
          <>The graph is a tree. Pick a node as the root and measure the tallest branch. That is the height for that root. Which roots give the smallest height?</>,
          <>Trying every root works but costs O(n²). Where would a good root be: near the leaves or near the middle?</>,
          <>Remove all the leaves (nodes with only one neighbour). Then remove the new leaves, and so on, like Kahn&apos;s algorithm working inwards. What is left at the end?</>,
        ]}
        approaches={[
          {
            name: "Brute force: BFS from every node",
            idea: <p>Use each node as the root, one by one. Run BFS (visit level by level) and count the levels. That count is the height. Keep the roots whose height equals the smallest one.</p>,
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
            explain: <p>One BFS takes O(n) time and we run n of them, so the total is O(n²). It is correct, but too slow when n is up to 20,000.</p>,
          },
          {
            name: "Remove the leaves layer by layer (topological idea)",
            idea: (
              <ol>
                <li>A node&apos;s degree is its number of neighbours. A leaf has degree 1.</li>
                <li>Remove all current leaves at once (one &quot;layer&quot;). This lowers the degree of their neighbours. Neighbours that become leaves form the next layer.</li>
                <li>Stop when 2 or fewer nodes remain. These are the centre of the tree, and they are the answer.</li>
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
            explain: <p>Each node is removed once and each edge is looked at twice. So the time and space are O(n). The last one or two nodes are the middle of the longest path. That is why they give the smallest height. A tree has at most two such centres, so the loop can stop when 2 or fewer nodes remain.</p>,
          },
        ]}
        compare={<p>Use the layer-removing method. It works like Kahn&apos;s algorithm on a tree with no arrow directions. The brute force is useful to check small inputs. (LeetCode 310.)</p>}
      >
        <p>
          A tree is a connected graph with no cycles. You get <code>n</code> nodes labelled <code>0..n-1</code> and a list of{" "}
          <code>edges</code> (links with no direction). You may choose any node as the root. The <strong>height</strong> of a rooted tree is the number of edges on the longest
          path going down from the root. Return the labels of every root that gives the smallest height, in any order.
        </p>
      </Problem>

      <Problem
        n={6}
        title="Parallel courses (premium)"
        level="Medium"
        examples={[
          { input: "n = 3, relations = [[1,3],[2,3]]", output: "2", why: "Semester 1: courses 1 and 2 together. Semester 2: course 3." },
          { input: "n = 3, relations = [[1,2],[2,3],[3,1]]", output: "-1", why: "There is a cycle, so no course in it can ever start." },
          { input: "n = 4, relations = [[1,2],[2,3],[1,4]]", output: "3", why: "The chain 1 → 2 → 3 needs three semesters. Course 4 fits in at the same time." },
        ]}
        hints={[
          <>Each pair <code>[prev, next]</code> is an arrow prev → next. In one semester you may take every course whose prerequisites are all done.</>,
          <>Kahn&apos;s algorithm already frees courses in &quot;waves&quot;. What does one wave match?</>,
          <>The answer is the number of waves. This equals the length of the longest chain of prerequisites. If a cycle blocks some courses, return -1.</>,
        ]}
        approaches={[
          {
            name: "Kahn's algorithm, one semester per round",
            idea: <p>Process the queue one whole level at a time. Each level is one semester. Count the semesters and the courses taken. If you did not take all courses, there is a cycle.</p>,
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
            explain: <p>Each course is taken in the earliest semester in which all its prerequisites are finished. So the number of rounds equals the length of the longest prerequisite chain (counted in courses). The time is O(n + E).</p>,
          },
          {
            name: "DFS: longest chain with saved answers",
            idea: <p>The earliest semester for a course is 1 + the biggest earliest-semester among its prerequisites. Work this out with DFS and save each answer so you do not repeat work (a cache). Use three states to find a cycle.</p>,
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
            explain: <p>Memoisation (saving each answer so you never work it out twice) means each course is worked out only once. The time is O(n + E). This is the idea of the longest path in a DAG. It only works because the graph has no cycles.</p>,
          },
        ]}
        compare={<p>Kahn level by level is the cleaner choice, because the number of rounds is the answer. This is a premium (paid) problem on LeetCode (1136, &quot;Parallel Courses&quot;). The statement is copied here.</p>}
      >
        <p>
          You are given <code>n</code> courses labelled <code>1..n</code> and <code>relations</code>. A pair <code>[prev, next]</code> means course{" "}
          <code>prev</code> must be finished before <code>next</code> starts. In one semester you can take <em>any number</em> of courses, as long as you
          finished all their prerequisites in earlier semesters. Return the smallest number of semesters needed to take every course. Return{" "}
          <code>-1</code> if it is impossible.
        </p>
      </Problem>

      <Problem
        n={7}
        title="Find all possible recipes from given supplies"
        level="Medium"
        examples={[
          { input: 'recipes = ["bread"], ingredients = [["yeast","flour"]], supplies = ["yeast","flour","corn"]', output: '["bread"]', why: "Both ingredients are in the supplies." },
          { input: 'recipes = ["bread","sandwich"], ingredients = [["yeast","flour"],["bread","meat"]], supplies = ["yeast","flour","meat"]', output: '["bread","sandwich"]', why: "Make the bread first. Then the sandwich uses the bread and the meat." },
          { input: 'recipes = ["a","b"], ingredients = [["b"],["a"]], supplies = []', output: "[]", why: "a needs b and b needs a, so neither can start." },
        ]}
        hints={[
          <>You can make a recipe once all its ingredients are available. An ingredient is either a supply or another recipe.</>,
          <>Draw an arrow ingredient → recipe. What works like the in-degree (the number of things it waits for) of a recipe?</>,
          <>Start the queue with the supplies. Each time an item becomes available, tell every recipe that uses it.</>,
        ]}
        approaches={[
          {
            name: "Repeat until nothing changes",
            idea: <p>Keep a set of the items you have (the supplies). Go over all recipes again and again. Whenever all ingredients of a recipe are available, make it and add it to the set. Stop after a pass in which no new recipe was made.</p>,
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
            explain: <p>Each pass costs the total number of ingredients (I). In the worst case there are as many passes as recipes (R). So the time is O(R × I). This is fine for small inputs, but it keeps checking recipes that are far from ready.</p>,
          },
          {
            name: "Kahn's algorithm from the supplies",
            idea: (
              <ol>
                <li>For each ingredient, remember which recipes need it. For each recipe, count its ingredients. This count is its in-degree.</li>
                <li>Put all supplies in the queue.</li>
                <li>Take an item from the queue. For each recipe that needs it, lower that recipe&apos;s count by 1. At 0, you can make the recipe. Save it in the answer and add it to the queue, because other recipes may need it.</li>
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
            explain: <p>Each ingredient entry is used once, so the time is O(S + R + I). A recipe on a cycle, or one that needs something nobody supplies, never reaches count 0. It is simply never reported, so you need no separate cycle check.</p>,
          },
        ]}
        compare={<p>Use Kahn&apos;s algorithm. It runs in linear time instead of repeated passes, and the supplies act as the vertices with in-degree 0. (LeetCode 2115.)</p>}
      >
        <p>
          You have <code>recipes[i]</code>. Each one needs the ingredients listed in <code>ingredients[i]</code>. You also start with a list of{" "}
          <code>supplies</code> (you have as many of each as you need). An ingredient can be another recipe. All recipe names and supplies are different from each other. Return every recipe you can make, in any order.
        </p>
      </Problem>
    </>
  );
}
