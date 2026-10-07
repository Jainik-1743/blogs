import Problem from "@/components/dsa/Problem";

/** Lesson 53 practice questions: union-find, components, cycles and spanning trees. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Number of provinces"
        level="Medium"
        examples={[
          { input: "isConnected = [[1,1,0],[1,1,0],[0,0,1]]", output: "2", why: "Cities 0 and 1 are connected; city 2 is alone." },
          { input: "isConnected = [[1,0,0],[0,1,0],[0,0,1]]", output: "3", why: "No two different cities are connected, so each is its own province." },
        ]}
        hints={[
          <>A province is a connected component. <code>isConnected[i][j] = 1</code> is an edge between cities i and j.</>,
          <>Start with n groups. Every time two cities that were in different groups get joined, the number of groups drops by one.</>,
          <>Only the cells above the diagonal matter, since the matrix is symmetric.</>,
        ]}
        approaches={[
          {
            name: "DFS from each unvisited city",
            idea: <p>Walk the matrix as an adjacency matrix: from a city, visit every city it is directly connected to, recursively. Each fresh start is a new province.</p>,
            code: `function findCircleNum(isConnected) {
  const n = isConnected.length;
  const visited = new Array(n).fill(false);
  function visit(i) {
    visited[i] = true;
    for (let j = 0; j < n; j++) {
      if (isConnected[i][j] === 1 && !visited[j]) visit(j);
    }
  }
  let provinces = 0;
  for (let i = 0; i < n; i++) {
    if (!visited[i]) { provinces++; visit(i); }
  }
  return provinces;
}

console.log(findCircleNum([[1, 1, 0], [1, 1, 0], [0, 0, 1]])); // 2
console.log(findCircleNum([[1, 0, 0], [0, 1, 0], [0, 0, 1]])); // 3`,
            explain: <p>Each city is visited once, and visiting scans its whole row, so O(n²) time (the input itself has n² cells). Space is O(n) for the visited array and the recursion.</p>,
          },
          {
            name: "Union-find with a counter",
            idea: <p>Start with <code>count = n</code>. For every pair <code>i &lt; j</code> with a 1, union them; each successful merge subtracts one from <code>count</code>.</p>,
            code: `function findCircleNum(isConnected) {
  const n = isConnected.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const size = new Array(n).fill(1);
  let count = n;
  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (isConnected[i][j] !== 1) continue;
      let a = find(i), b = find(j);
      if (a === b) continue;
      if (size[a] < size[b]) [a, b] = [b, a];
      parent[b] = a;
      size[a] += size[b];
      count--;
    }
  }
  return count;
}

console.log(findCircleNum([[1, 1, 0], [1, 1, 0], [0, 0, 1]])); // 2
console.log(findCircleNum([[1, 0, 0], [0, 1, 0], [0, 0, 1]])); // 3`,
            explain: <p>Still O(n² × α(n)), because we must read every cell of the matrix. The union-find only wins when edges arrive one at a time or as a short list; here it is equal to DFS but shows the pattern you will reuse below.</p>,
          },
        ]}
        compare={<p>Both are fine and take O(n²). Choose DFS for simplicity, or union-find if you want practice with the template. (LeetCode 547.)</p>}
      >
        <p>
          There are <code>n</code> cities. <code>isConnected[i][j] = 1</code> means city i and city j are directly connected (and the
          relation is symmetric; <code>isConnected[i][i] = 1</code>). Connections are transitive through other cities. A{" "}
          <strong>province</strong> is a group of cities connected directly or indirectly, with none connected to a city outside the
          group. Return the number of provinces.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Redundant connection"
        level="Medium"
        examples={[
          { input: "edges = [[1,2],[1,3],[2,3]]", output: "[2,3]", why: "The edges form a triangle. Removing [2,3] leaves a tree; so would [1,2] or [1,3], but [2,3] comes last." },
          { input: "edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]", output: "[1,4]", why: "1-2-3-4 is already connected when [1,4] arrives, so it closes the cycle." },
        ]}
        hints={[
          <>A tree on n vertices has n − 1 edges; this graph has n, so exactly one edge creates a cycle.</>,
          <>Add the edges in order. Which edge is the first one whose endpoints are already connected?</>,
          <>That is precisely a union that returns &ldquo;same root&rdquo;.</>,
        ]}
        approaches={[
          {
            name: "DFS check before each edge",
            idea: <p>Keep an adjacency list of the edges added so far. Before adding edge <code>[a, b]</code>, search whether b is already reachable from a. If so, this edge is the answer.</p>,
            code: `function findRedundantConnection(edges) {
  const graph = new Map();
  function connected(a, b, seen) {
    if (a === b) return true;
    seen.add(a);
    for (const next of graph.get(a) ?? []) {
      if (!seen.has(next) && connected(next, b, seen)) return true;
    }
    return false;
  }
  for (const [a, b] of edges) {
    if (connected(a, b, new Set())) return [a, b];
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    graph.get(a).push(b);
    graph.get(b).push(a);
  }
  return [];
}

console.log(findRedundantConnection([[1, 2], [1, 3], [2, 3]]));                  // [ 2, 3 ]
console.log(findRedundantConnection([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]));  // [ 1, 4 ]`,
            explain: <p>Each search is O(V + E), done once per edge: O(n²) overall. It is fine for the small limits here, but wasteful, since it forgets what it learned between edges.</p>,
          },
          {
            name: "Union-find",
            idea: <p>Process the edges in order. If <code>union(a, b)</code> fails because the roots match, return that edge.</p>,
            code: `function findRedundantConnection(edges) {
  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);   // vertices are 1..n
  const size = new Array(edges.length + 1).fill(1);
  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  for (const [a, b] of edges) {
    let ra = find(a), rb = find(b);
    if (ra === rb) return [a, b];            // already connected: this edge closes the cycle
    if (size[ra] < size[rb]) [ra, rb] = [rb, ra];
    parent[rb] = ra;
    size[ra] += size[rb];
  }
  return [];
}

console.log(findRedundantConnection([[1, 2], [1, 3], [2, 3]]));                  // [ 2, 3 ]
console.log(findRedundantConnection([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]));  // [ 1, 4 ]`,
            explain: <p>One pass, O(n × α(n)) time and O(n) space. Returning the first failing edge in input order matches the requirement to return the answer that occurs last in the input: the cycle is closed exactly when its last edge arrives.</p>,
          },
        ]}
        compare={<p>Union-find: a one-line change from the template turns it into cycle detection. (LeetCode 684.)</p>}
      >
        <p>
          A graph started as a tree with <code>n</code> vertices labelled <code>1..n</code>; then one extra edge was added, giving{" "}
          <code>edges</code> (<code>n</code> edges in total). Return an edge that can be removed so the result is a tree again. If there
          are several answers, return the one that occurs last in the input.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Accounts merge"
        level="Medium"
        examples={[
          {
            input: 'accounts = [["John","a@x","b@x"],["John","b@x","c@x"],["Mary","m@x"]]',
            output: '[["John","a@x","b@x","c@x"],["Mary","m@x"]]',
            why: "The first two accounts share b@x, so they belong to the same person and merge. Emails are sorted within each merged account.",
          },
          {
            input: 'accounts = [["Sam","s@x"],["Sam","t@x"]]',
            output: '[["Sam","s@x"],["Sam","t@x"]]',
            why: "Same name but no shared email: two different people.",
          },
        ]}
        hints={[
          <>Two accounts belong to the same person only if they share at least one email. Names alone prove nothing.</>,
          <>Treat each email as a vertex. All emails in one account are connected to each other.</>,
          <>Union the emails of an account with its first email, then group emails by root.</>,
        ]}
        approaches={[
          {
            name: "Graph of emails, DFS",
            idea: <p>Build an adjacency list that links every email in an account to the account&apos;s first email (both directions). Each connected component of emails is one person; sort it and put the name in front.</p>,
            code: `function accountsMerge(accounts) {
  const graph = new Map();                   // email -> neighbouring emails
  const owner = new Map();                   // email -> name
  for (const [name, ...emails] of accounts) {
    for (const e of emails) {
      owner.set(e, name);
      if (!graph.has(e)) graph.set(e, []);
      if (e !== emails[0]) {
        graph.get(e).push(emails[0]);
        graph.get(emails[0]).push(e);
      }
    }
  }
  const seen = new Set();
  const result = [];
  for (const start of graph.keys()) {
    if (seen.has(start)) continue;
    const group = [];
    const stack = [start];
    seen.add(start);
    while (stack.length) {
      const e = stack.pop();
      group.push(e);
      for (const next of graph.get(e)) {
        if (!seen.has(next)) { seen.add(next); stack.push(next); }
      }
    }
    group.sort();
    result.push([owner.get(start), ...group]);
  }
  return result;
}

console.log(accountsMerge([["John", "a@x", "b@x"], ["John", "b@x", "c@x"], ["Mary", "m@x"]])); // [ [ 'John', 'a@x', 'b@x', 'c@x' ], [ 'Mary', 'm@x' ] ]
console.log(accountsMerge([["Sam", "s@x"], ["Sam", "t@x"]]));                                    // [ [ 'Sam', 's@x' ], [ 'Sam', 't@x' ] ]`,
            explain: <p>With N the total number of emails, building the graph and the traversal are O(N); sorting each group gives O(N log N) overall. Components are returned in first-seen order here; LeetCode accepts any order of accounts.</p>,
          },
          {
            name: "Union-find on account indices",
            idea: <p>Remember which account first used each email. When an email appears again, union the two accounts. Finally collect every email under the root of its account.</p>,
            code: `function accountsMerge(accounts) {
  const parent = Array.from({ length: accounts.length }, (_, i) => i);
  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  const firstSeen = new Map();               // email -> index of the first account that had it
  accounts.forEach(([, ...emails], i) => {
    for (const e of emails) {
      if (firstSeen.has(e)) parent[find(i)] = find(firstSeen.get(e));   // same email: same person
      else firstSeen.set(e, i);
    }
  });
  const groups = new Map();                  // root account -> set of emails
  for (const [e, i] of firstSeen) {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(e);
  }
  const result = [];
  for (const [root, emails] of groups) result.push([accounts[root][0], ...emails.sort()]);
  return result;
}

console.log(accountsMerge([["John", "a@x", "b@x"], ["John", "b@x", "c@x"], ["Mary", "m@x"]])); // [ [ 'John', 'a@x', 'b@x', 'c@x' ], [ 'Mary', 'm@x' ] ]
console.log(accountsMerge([["Sam", "s@x"], ["Sam", "t@x"]]));                                    // [ [ 'Sam', 's@x' ], [ 'Sam', 't@x' ] ]`,
            explain: <p>The groups are accounts, not emails, so the union-find array is small. The merge step here skips union by size for brevity; with compression alone it is still fast. Overall O(N log N), dominated by sorting.</p>,
          },
        ]}
        compare={<p>Union-find on the accounts is the usual interview answer, but the DFS version is just as correct and easier to reason about. (LeetCode 721.)</p>}
      >
        <p>
          <code>accounts[i]</code> is a list whose first element is a person&apos;s name and the rest are their emails. Two accounts
          belong to the same person if they share any email (people may have several accounts, and different people may have the same
          name). Merge the accounts: return, for each person, their name followed by their emails <strong>sorted</strong>. The accounts
          can be returned in any order.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Min cost to connect all points"
        level="Medium"
        examples={[
          { input: "points = [[0,0],[2,2],[3,10],[5,2],[7,0]]", output: "20", why: "A cheapest set of 4 segments (cost = Manhattan distance |x1−x2| + |y1−y2|) links the five points for a total of 20." },
          { input: "points = [[3,12],[-2,5],[-4,1]]", output: "18", why: "(−4,1)–(−2,5) costs 6 and (−2,5)–(3,12) costs 12." },
        ]}
        hints={[
          <>Connecting every point at minimum total cost is exactly a minimum spanning tree.</>,
          <>Make an edge between every pair of points with weight equal to the Manhattan distance, then run Kruskal.</>,
          <>There is also a version that never builds the edge list: grow the tree one point at a time, always adding the closest outside point.</>,
        ]}
        approaches={[
          {
            name: "Kruskal with union-find",
            idea: <p>Generate all n(n−1)/2 edges, sort by cost, and add each edge that joins two different groups. Stop at n − 1 edges.</p>,
            code: `function minCostConnectPoints(points) {
  const n = points.length;
  const edges = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);
      edges.push([d, i, j]);
    }
  }
  edges.sort((p, q) => p[0] - q[0]);
  const parent = Array.from({ length: n }, (_, i) => i);
  const size = new Array(n).fill(1);
  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  let total = 0, used = 0;
  for (const [d, i, j] of edges) {
    let a = find(i), b = find(j);
    if (a === b) continue;
    if (size[a] < size[b]) [a, b] = [b, a];
    parent[b] = a;
    size[a] += size[b];
    total += d;
    if (++used === n - 1) break;
  }
  return total;
}

console.log(minCostConnectPoints([[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]])); // 20
console.log(minCostConnectPoints([[3, 12], [-2, 5], [-4, 1]]));              // 18
console.log(minCostConnectPoints([[0, 0]]));                                  // 0`,
            explain: <p>E = n(n−1)/2 edges, so sorting is O(n² log n) time and O(n²) space for the edge list.</p>,
          },
          {
            name: "Prim's algorithm without a heap",
            idea: <p>Keep, for each point not yet in the tree, its cheapest distance to the tree so far. Repeatedly pick the cheapest outside point, add its cost, and update the others&apos; distances.</p>,
            code: `function minCostConnectPoints(points) {
  const n = points.length;
  const dist = new Array(n).fill(Infinity);  // cheapest known link from the tree to each point
  const inTree = new Array(n).fill(false);
  dist[0] = 0;
  let total = 0;
  for (let step = 0; step < n; step++) {
    let best = -1;
    for (let i = 0; i < n; i++) {
      if (!inTree[i] && (best === -1 || dist[i] < dist[best])) best = i;
    }
    inTree[best] = true;
    total += dist[best];
    for (let i = 0; i < n; i++) {
      if (inTree[i]) continue;
      const d = Math.abs(points[best][0] - points[i][0]) + Math.abs(points[best][1] - points[i][1]);
      if (d < dist[i]) dist[i] = d;
    }
  }
  return total;
}

console.log(minCostConnectPoints([[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]])); // 20
console.log(minCostConnectPoints([[3, 12], [-2, 5], [-4, 1]]));              // 18
console.log(minCostConnectPoints([[0, 0]]));                                  // 0`,
            explain: <p><strong>Prim&apos;s algorithm</strong> is the other classic MST method: grow one tree outwards instead of merging many small ones. With a plain array scan it is O(n²) time and only O(n) space, which beats Kruskal on this complete graph.</p>,
          },
        ]}
        compare={<p>Kruskal is what this lesson taught and is perfectly acceptable. Prim with an array is leaner when the graph is dense (every pair has an edge). (LeetCode 1584.)</p>}
      >
        <p>
          You are given <code>points</code>, where <code>points[i] = [xi, yi]</code>. The cost of connecting two points is their
          Manhattan distance <code>|xi − xj| + |yi − yj|</code>. Return the minimum total cost to make all points connected, so that there is
          exactly one simple path between any two points.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Number of connected components in an undirected graph"
        level="Medium"
        examples={[
          { input: "n = 5, edges = [[0,1],[1,2],[3,4]]", output: "2", why: "{0,1,2} and {3,4}." },
          { input: "n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]", output: "1", why: "One long path connects all five vertices." },
        ]}
        hints={[
          <>Lesson 50&apos;s traversal counted components; union-find can count them too.</>,
          <>Begin with n components. What happens to the count for each edge that merges two different groups?</>,
        ]}
        approaches={[
          {
            name: "BFS from every unvisited vertex",
            idea: <p>Build the adjacency list, then start a traversal at each vertex that has not been seen yet; each start is one component.</p>,
            code: `function countComponents(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a); }
  const visited = new Array(n).fill(false);
  let count = 0;
  for (let s = 0; s < n; s++) {
    if (visited[s]) continue;
    count++;
    visited[s] = true;
    const queue = [s];
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

console.log(countComponents(5, [[0, 1], [1, 2], [3, 4]]));          // 2
console.log(countComponents(5, [[0, 1], [1, 2], [2, 3], [3, 4]]));  // 1`,
            explain: <p>O(V + E) time and space.</p>,
          },
          {
            name: "Union-find with a counter",
            idea: <p>Start the counter at n, and subtract one for every edge whose union succeeds.</p>,
            code: `function countComponents(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const size = new Array(n).fill(1);
  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  let count = n;
  for (const [x, y] of edges) {
    let a = find(x), b = find(y);
    if (a === b) continue;
    if (size[a] < size[b]) [a, b] = [b, a];
    parent[b] = a;
    size[a] += size[b];
    count--;
  }
  return count;
}

console.log(countComponents(5, [[0, 1], [1, 2], [3, 4]]));          // 2
console.log(countComponents(5, [[0, 1], [1, 2], [2, 3], [3, 4]]));  // 1
console.log(countComponents(3, []));                                  // 3`,
            explain: <p>O(n + E × α(n)) time, O(n) space, and no adjacency list to build.</p>,
          },
        ]}
        compare={<p>Union-find avoids building the graph and reads the edge list once; BFS/DFS is equally correct. This is a premium problem on LeetCode (323, &quot;Number of Connected Components in an Undirected Graph&quot;), so the statement is reproduced here.</p>}
      >
        <p>
          You have a graph of <code>n</code> vertices labelled <code>0</code> to <code>n − 1</code> and a list <code>edges</code> where{" "}
          <code>edges[i] = [a, b]</code> is an undirected edge. Return the number of connected components.
        </p>
      </Problem>

      <Problem
        n={6}
        title="Satisfiability of equality equations"
        level="Medium"
        examples={[
          { input: 'equations = ["a==b","b!=a"]', output: "false", why: "a equals b, yet b must differ from a." },
          { input: 'equations = ["a==b","b==c","a==c"]', output: "true", why: "All three variables can hold the same value." },
          { input: 'equations = ["a==b","b!=c","c==a"]', output: "false", why: "a==b and c==a force b==c, which contradicts b!=c." },
        ]}
        hints={[
          <>Each equation is exactly four characters: a letter, <code>==</code> or <code>!=</code>, a letter.</>,
          <>&ldquo;Equal&rdquo; is transitive, so all letters linked by <code>==</code> must share one value. That is a group.</>,
          <>Process every <code>==</code> first. Then no <code>!=</code> may join two letters from the same group.</>,
        ]}
        approaches={[
          {
            name: "Graph search over the equalities",
            idea: <p>Build a graph with an edge for every <code>==</code>. For each <code>!=</code>, search whether its two letters are connected in that graph; if so, the equations are contradictory.</p>,
            code: `function equationsPossible(equations) {
  const graph = Array.from({ length: 26 }, () => []);
  const code = (ch) => ch.charCodeAt(0) - 97;
  for (const eq of equations) {
    if (eq[1] === "=") {
      graph[code(eq[0])].push(code(eq[3]));
      graph[code(eq[3])].push(code(eq[0]));
    }
  }
  function connected(a, b) {
    const seen = new Array(26).fill(false);
    const stack = [a];
    seen[a] = true;
    while (stack.length) {
      const v = stack.pop();
      if (v === b) return true;
      for (const next of graph[v]) {
        if (!seen[next]) { seen[next] = true; stack.push(next); }
      }
    }
    return false;
  }
  for (const eq of equations) {
    if (eq[1] === "!" && connected(code(eq[0]), code(eq[3]))) return false;
  }
  return true;
}

console.log(equationsPossible(["a==b", "b!=a"]));          // false
console.log(equationsPossible(["a==b", "b==c", "a==c"]));  // true
console.log(equationsPossible(["a==b", "b!=c", "c==a"]));  // false`,
            explain: <p>Each <code>!=</code> costs a search over at most 26 vertices and the equality edges, so O(E × (26 + E)) in the worst case. It works, but each check starts from scratch.</p>,
          },
          {
            name: "Union-find over 26 letters",
            idea: <p>First pass: union the two letters of every <code>==</code>. Second pass: for every <code>!=</code>, if both letters have the same root, return false. Otherwise return true.</p>,
            code: `function equationsPossible(equations) {
  const parent = Array.from({ length: 26 }, (_, i) => i);
  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  const code = (ch) => ch.charCodeAt(0) - 97;
  for (const eq of equations) {
    if (eq[1] === "=") parent[find(code(eq[0]))] = find(code(eq[3]));
  }
  for (const eq of equations) {
    if (eq[1] === "!" && find(code(eq[0])) === find(code(eq[3]))) return false;
  }
  return true;
}

console.log(equationsPossible(["a==b", "b!=a"]));          // false
console.log(equationsPossible(["a==b", "b==c", "a==c"]));  // true
console.log(equationsPossible(["a==b", "b!=c", "c==a"]));  // false
console.log(equationsPossible(["a!=a"]));                  // false`,
            explain: <p>O(E × α(26)), essentially O(E). The order matters: all equalities must be applied before any inequality is checked, otherwise a later <code>==</code> could invalidate an earlier check. A pair like <code>a!=a</code> fails immediately because a letter always shares a root with itself.</p>,
          },
        ]}
        compare={<p>Union-find: two simple loops over a 26-element array. (LeetCode 990.)</p>}
      >
        <p>
          You are given an array of strings <code>equations</code>, each of the form <code>&quot;xi==yi&quot;</code> or{" "}
          <code>&quot;xi!=yi&quot;</code>, where <code>xi</code> and <code>yi</code> are lowercase letters standing for integer variables.
          Return <code>true</code> if the variables can be assigned integer values that satisfy every equation, otherwise{" "}
          <code>false</code>.
        </p>
      </Problem>

      <Problem
        n={7}
        title="Number of operations to make network connected"
        level="Medium"
        examples={[
          { input: "n = 4, connections = [[0,1],[0,2],[1,2]]", output: "1", why: "The cable 1-2 is spare (0-1 and 0-2 already link those three). Move it to connect computer 3." },
          { input: "n = 6, connections = [[0,1],[0,2],[0,3],[1,2],[1,3]]", output: "2", why: "Two spare cables, and the network has three components ({0,1,2,3}, {4}, {5}), so two moves join them." },
          { input: "n = 6, connections = [[0,1],[0,2],[0,3],[1,2]]", output: "-1", why: "Only 4 cables, but 5 are needed to connect 6 computers." },
        ]}
        hints={[
          <>To connect n computers you need at least n − 1 cables, whatever the layout. If there are fewer, the answer is −1.</>,
          <>Otherwise you can always do it. Every component beyond the first needs one moved cable to join it.</>,
          <>So the answer is the number of components minus one. Count them with union-find or a traversal.</>,
        ]}
        approaches={[
          {
            name: "Count components with DFS",
            idea: <p>If <code>connections.length &lt; n − 1</code> return −1. Otherwise count components by traversal and return <code>components − 1</code>.</p>,
            code: `function makeConnected(n, connections) {
  if (connections.length < n - 1) return -1;
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of connections) { graph[a].push(b); graph[b].push(a); }
  const visited = new Array(n).fill(false);
  function visit(v) {
    visited[v] = true;
    for (const next of graph[v]) if (!visited[next]) visit(next);
  }
  let components = 0;
  for (let v = 0; v < n; v++) {
    if (!visited[v]) { components++; visit(v); }
  }
  return components - 1;
}

console.log(makeConnected(4, [[0, 1], [0, 2], [1, 2]]));                          // 1
console.log(makeConnected(6, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3]]));          // 2
console.log(makeConnected(6, [[0, 1], [0, 2], [0, 3], [1, 2]]));                  // -1`,
            explain: <p>O(n + E) time and space. The only subtle step is the early check: with at least n − 1 cables there are always enough spare cables, because each component with c computers needs only c − 1 of its own cables to stay connected.</p>,
          },
          {
            name: "Union-find with a counter",
            idea: <p>Same check, then union every cable. The number of successful unions leaves <code>count</code> components; the answer is <code>count − 1</code>.</p>,
            code: `function makeConnected(n, connections) {
  if (connections.length < n - 1) return -1;
  const parent = Array.from({ length: n }, (_, i) => i);
  const size = new Array(n).fill(1);
  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  let components = n;
  for (const [x, y] of connections) {
    let a = find(x), b = find(y);
    if (a === b) continue;                   // a spare cable: it joins nothing new
    if (size[a] < size[b]) [a, b] = [b, a];
    parent[b] = a;
    size[a] += size[b];
    components--;
  }
  return components - 1;
}

console.log(makeConnected(4, [[0, 1], [0, 2], [1, 2]]));                          // 1
console.log(makeConnected(6, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3]]));          // 2
console.log(makeConnected(6, [[0, 1], [0, 2], [0, 3], [1, 2]]));                  // -1`,
            explain: <p>The failed unions are exactly the spare cables, which ties together the two ideas from this lesson: redundant edges are the supply, and components minus one is the demand. O(n + E × α(n)).</p>,
          },
        ]}
        compare={<p>Either; union-find is shorter here and shows the spare-cable idea directly. (LeetCode 1319.)</p>}
      >
        <p>
          There are <code>n</code> computers numbered <code>0</code> to <code>n − 1</code> and a list of ethernet cables{" "}
          <code>connections</code>, where <code>connections[i] = [a, b]</code> links computers a and b. You can unplug any cable and
          plug it between two computers that are not directly connected. Return the minimum number of such moves needed to connect
          all computers, or −1 if it is impossible.
        </p>
      </Problem>
    </>
  );
}
