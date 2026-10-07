import Problem from "@/components/dsa/Problem";

/** Lesson 52 practice questions: BFS, Dijkstra and Bellman–Ford. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Shortest path in binary matrix"
        level="Medium"
        examples={[
          { input: "grid = [[0,1],[1,0]]", output: "2", why: "Move diagonally from (0,0) to (1,1). There are two cells on the path." },
          { input: "grid = [[0,0,0],[1,1,0],[1,1,0]]", output: "4", why: "(0,0) → (0,1) → (1,2) → (2,2): four cells." },
          { input: "grid = [[1,0,0],[1,1,0],[1,1,0]]", output: "-1", why: "The start cell is blocked." },
        ]}
        hints={[
          <>Every step costs the same, and you want the fewest steps. Which way of visiting the grid gives that?</>,
          <>You may move in 8 directions. The answer counts cells, not moves. The start cell counts as 1.</>,
          <>Mark a cell as visited when it joins the queue. Then each cell enters the queue at most once.</>,
        ]}
        approaches={[
          {
            name: "Brute force: DFS over every path",
            idea: <p>Try every path from the top-left that does not repeat a cell. Mark a cell as visited, and remove the mark when you go back (this is called backtracking: try, undo, try another way). Remember the shortest path that reaches the goal.</p>,
            code: `function shortestPathBinaryMatrix(grid) {
  const n = grid.length;
  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1;
  const seen = Array.from({ length: n }, () => new Array(n).fill(false));
  let best = Infinity;
  function dfs(r, c, len) {
    if (r === n - 1 && c === n - 1) { best = Math.min(best, len); return; }
    seen[r][c] = true;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 0 && !seen[nr][nc]) dfs(nr, nc, len + 1);
      }
    }
    seen[r][c] = false;                        // un-mark so other paths may use this cell
  }
  dfs(0, 0, 1);
  return best === Infinity ? -1 : best;
}

console.log(shortestPathBinaryMatrix([[0, 1], [1, 0]]));                  // 2
console.log(shortestPathBinaryMatrix([[0, 0, 0], [1, 1, 0], [1, 1, 0]])); // 4
console.log(shortestPathBinaryMatrix([[1, 0, 0], [1, 1, 0], [1, 1, 0]])); // -1`,
            explain: <p>The number of paths in a grid grows extremely fast (exponentially), so this only works on tiny grids. The real limit is n = 100. It is useful to check that your BFS answer is right.</p>,
          },
          {
            name: "BFS",
            idea: <p>Start from the top-left with length 1. BFS spreads out in rings of equal distance. So the first time it reaches the bottom-right, that distance is the smallest.</p>,
            code: `function shortestPathBinaryMatrix(grid) {
  const n = grid.length;
  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1;
  const dist = Array.from({ length: n }, () => new Array(n).fill(0));
  dist[0][0] = 1;                              // 0 doubles as "not reached"
  const queue = [[0, 0]];
  let head = 0;
  while (head < queue.length) {
    const [r, c] = queue[head++];
    if (r === n - 1 && c === n - 1) return dist[r][c];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 0 && dist[nr][nc] === 0) {
          dist[nr][nc] = dist[r][c] + 1;
          queue.push([nr, nc]);
        }
      }
    }
  }
  return -1;
}

console.log(shortestPathBinaryMatrix([[0, 1], [1, 0]]));                  // 2
console.log(shortestPathBinaryMatrix([[0, 0, 0], [1, 1, 0], [1, 1, 0]])); // 4
console.log(shortestPathBinaryMatrix([[1, 0, 0], [1, 1, 0], [1, 1, 0]])); // -1`,
            explain: <p>Each cell enters the queue at most once and checks 8 neighbours. So the time and space are O(n²) for an n × n grid. The case dr = dc = 0 points back at the cell itself. It is already marked, so it is skipped with no harm.</p>,
          },
        ]}
        compare={<p>Use BFS whenever every move costs the same. (LeetCode 1091.)</p>}
      >
        <p>
          In an <code>n × n</code> grid of <code>0</code> (open) and <code>1</code> (blocked), find the length of the shortest path from the top-left to the
          bottom-right cell. You may move to any of the 8 neighbouring open cells (sides and corners). The length is the number of cells on the path. Return{" "}
          <code>-1</code> if there is no path.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Network delay time"
        level="Medium"
        examples={[
          { input: "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2", output: "2", why: "From node 2: node 1 gets it at time 1, node 3 at time 1, node 4 at time 2. The last node gets the signal at time 2." },
          { input: "times = [[1,2,1]], n = 2, k = 1", output: "1", why: "One link of delay 1." },
          { input: "times = [[1,2,1]], n = 2, k = 2", output: "-1", why: "Node 1 can never be reached from node 2, because links are one-way." },
        ]}
        hints={[
          <>Each entry [u, v, w] is a one-way link from u to v. The travel time is w. How long does the signal take to reach each node?</>,
          <>That is the shortest-path distance from k to every node. The weights are never negative and are not all equal.</>,
          <>The whole network has the signal when the farthest node gets it. What if some node is never reached?</>,
        ]}
        approaches={[
          {
            name: "Dijkstra with a heap",
            idea: <p>Work out the shortest distance from <code>k</code> to every node. The answer is the largest of those distances. If any node cannot be reached, the answer is -1.</p>,
            code: `class Heap {
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

function networkDelayTime(times, n, k) {
  const graph = Array.from({ length: n + 1 }, () => []);    // nodes are numbered from 1
  for (const [u, v, w] of times) graph[u].push([v, w]);
  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const pq = new Heap((a, b) => a[0] - b[0]);
  pq.push([0, k]);
  while (pq.size) {
    const [d, u] = pq.pop();
    if (d > dist[u]) continue;
    for (const [v, w] of graph[u]) {
      if (d + w < dist[v]) { dist[v] = d + w; pq.push([dist[v], v]); }
    }
  }
  let answer = 0;
  for (let node = 1; node <= n; node++) answer = Math.max(answer, dist[node]);
  return answer === Infinity ? -1 : answer;
}

console.log(networkDelayTime([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2)); // 2
console.log(networkDelayTime([[1, 2, 1]], 2, 1));                       // 1
console.log(networkDelayTime([[1, 2, 1]], 2, 2));                       // -1`,
            explain: <p>The time is O((V + E) log V). <code>dist</code> starts at Infinity. So if a node cannot be reached, the maximum stays Infinity, and we turn that into -1.</p>,
          },
          {
            name: "Bellman–Ford",
            idea: <p>Relax every link (try to make its end node cheaper) again and again, for up to n − 1 rounds. Stop early if a round changes nothing.</p>,
            code: `function networkDelayTime(times, n, k) {
  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  for (let round = 1; round < n; round++) {
    let changed = false;
    for (const [u, v, w] of times) {
      if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; changed = true; }
    }
    if (!changed) break;
  }
  let answer = 0;
  for (let node = 1; node <= n; node++) answer = Math.max(answer, dist[node]);
  return answer === Infinity ? -1 : answer;
}

console.log(networkDelayTime([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2)); // 2
console.log(networkDelayTime([[1, 2, 1]], 2, 1));                       // 1
console.log(networkDelayTime([[1, 2, 1]], 2, 2));                       // -1`,
            explain: <p>The worst-case time is O(V × E), but the code is short and needs no heap. In JavaScript, Infinity + w is still Infinity. So a node that was never reached cannot give a false improvement.</p>,
          },
        ]}
        compare={<p>Dijkstra is good when weights are never negative and the graph can be large. Bellman–Ford is fine for the small limits here (n ≤ 100) and needs no heap. (LeetCode 743.)</p>}
      >
        <p>
          A network has nodes <code>1..n</code>. Each entry <code>[u, v, w]</code> in <code>times</code> is a one-way link. A signal sent from{" "}
          <code>u</code> reaches <code>v</code> after <code>w</code> time units. A signal starts at node <code>k</code>. Return the time it takes for
          all nodes to get the signal. Return <code>-1</code> if some node never gets it.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Path with minimum effort"
        level="Medium"
        examples={[
          { input: "heights = [[1,2,2],[3,8,2],[5,3,5]]", output: "2", why: "Route 1 → 3 → 5 → 3 → 5 has a biggest step of 2. The route over the 8 has bigger steps." },
          { input: "heights = [[1,2,3],[3,8,4],[5,3,5]]", output: "1", why: "Route 1 → 2 → 3 → 4 → 5 has steps of size 1 only." },
          { input: "heights = [[1,2,1,1,1],[1,2,1,2,1],[1,2,1,2,1],[1,2,1,2,1],[1,1,1,2,1]]", output: "0", why: "A route that follows the 1s never changes height." },
        ]}
        hints={[
          <>The effort of a route is not the sum of its steps. It is the largest height difference between two next-door cells on the route.</>,
          <>Dijkstra works if the cost of a path never gets smaller as the path grows. Replace + with max.</>,
          <>Another way: guess an effort limit. Use BFS to check whether you can reach the goal using only steps within the limit. Then binary search (halve the range each time) to find the best limit.</>,
        ]}
        approaches={[
          {
            name: "Dijkstra with max",
            idea: <p>The &quot;distance&quot; of a cell is the smallest possible worst step on any route to it. Moving to a neighbour gives <code>max(effort so far, this step)</code>. Always take the cell with the smallest effort next.</p>,
            code: `class Heap {
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

function minimumEffortPath(heights) {
  const rows = heights.length, cols = heights[0].length;
  const effort = Array.from({ length: rows }, () => new Array(cols).fill(Infinity));
  effort[0][0] = 0;
  const pq = new Heap((a, b) => a[0] - b[0]);
  pq.push([0, 0, 0]);
  while (pq.size) {
    const [e, r, c] = pq.pop();
    if (e > effort[r][c]) continue;
    if (r === rows - 1 && c === cols - 1) return e;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const ne = Math.max(e, Math.abs(heights[nr][nc] - heights[r][c]));
      if (ne < effort[nr][nc]) { effort[nr][nc] = ne; pq.push([ne, nr, nc]); }
    }
  }
  return 0;
}

console.log(minimumEffortPath([[1, 2, 2], [3, 8, 2], [5, 3, 5]]));  // 2
console.log(minimumEffortPath([[1, 2, 3], [3, 8, 4], [5, 3, 5]]));  // 1
console.log(minimumEffortPath([[1, 2, 1, 1, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 1, 1, 2, 1]])); // 0`,
            explain: <p>The time is O(R × C × log(R × C)). Dijkstra stays correct because <code>max(e, step) ≥ e</code>. Making a route longer never lowers its effort. Weights that are never negative give the same property for sums.</p>,
          },
          {
            name: "Binary search the answer + BFS",
            idea: <p>If an effort limit <code>L</code> allows a route, any bigger limit allows it too. So the answers go from &quot;no&quot; to &quot;yes&quot; once and never switch back. Use binary search (halve the range each time) to find the smallest <code>L</code> for which BFS can walk from start to goal using only steps of at most <code>L</code>.</p>,
            code: `function minimumEffortPath(heights) {
  const rows = heights.length, cols = heights[0].length;
  function reachable(limit) {
    const seen = Array.from({ length: rows }, () => new Array(cols).fill(false));
    seen[0][0] = true;
    const queue = [[0, 0]];
    let head = 0;
    while (head < queue.length) {
      const [r, c] = queue[head++];
      if (r === rows - 1 && c === cols - 1) return true;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen[nr][nc]
            && Math.abs(heights[nr][nc] - heights[r][c]) <= limit) {
          seen[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
    return false;
  }
  let lo = 0, hi = 1000000;                    // heights are at most 10^6
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (reachable(mid)) hi = mid; else lo = mid + 1;
  }
  return lo;
}

console.log(minimumEffortPath([[1, 2, 2], [3, 8, 2], [5, 3, 5]]));  // 2
console.log(minimumEffortPath([[1, 2, 3], [3, 8, 4], [5, 3, 5]]));  // 1
console.log(minimumEffortPath([[1, 2, 1, 1, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 1, 1, 2, 1]])); // 0`,
            explain: <p>It needs about 20 BFS runs (log₂ of 10⁶), each O(R × C). So the time is O(R × C × log H). This is the same idea as binary searching on the answer in lesson 29: ask a yes/no question, then halve the range.</p>,
          },
        ]}
        compare={<p>Dijkstra with max is the more general pattern. The binary-search version needs no heap. It is easy once you spot a &quot;make the maximum as small as possible&quot; problem. (LeetCode 1631.)</p>}
      >
        <p>
          You are in the top-left cell of a grid of heights and want to reach the bottom-right cell, moving up, down, left or right. The{" "}
          <strong>effort</strong> of a route is the biggest height difference (ignoring plus or minus) between two cells next to each other on the route. Return the smallest effort
          over all routes.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Cheapest flights within K stops"
        level="Medium"
        examples={[
          { input: "n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1", output: "700", why: "0 → 1 → 3 costs 700 with one stop. The cheaper 0 → 1 → 2 → 3 (400) needs two stops." },
          { input: "n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1", output: "200", why: "One stop at city 1 (cost 200) is cheaper than the direct flight (500)." },
          { input: "n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 0", output: "500", why: "No stops are allowed, so only the direct flight works." },
        ]}
        hints={[
          <>Plain Dijkstra finds the cheapest route but ignores the stop limit. A cheap route with too many stops is not allowed.</>,
          <>At most k stops means at most k + 1 flights. Which algorithm already works with &quot;paths of at most i edges&quot;?</>,
          <>Run k + 1 rounds of Bellman–Ford. Read from the previous round&apos;s prices, so each round adds exactly one flight.</>,
        ]}
        approaches={[
          {
            name: "Bellman–Ford, k + 1 rounds",
            idea: <p>After round <code>i</code>, <code>prices[x]</code> is the cheapest price to reach <code>x</code> with at most <code>i</code> flights. Build each round from a copy of the previous round.</p>,
            code: `function findCheapestPrice(n, flights, src, dst, k) {
  let prices = new Array(n).fill(Infinity);
  prices[src] = 0;
  for (let round = 0; round <= k; round++) {
    const next = [...prices];
    for (const [from, to, price] of flights) {
      if (prices[from] !== Infinity && prices[from] + price < next[to]) next[to] = prices[from] + price;
    }
    prices = next;
  }
  return prices[dst] === Infinity ? -1 : prices[dst];
}

console.log(findCheapestPrice(4, [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], 0, 3, 1)); // 700
console.log(findCheapestPrice(3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1));                           // 200
console.log(findCheapestPrice(3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0));                           // 500`,
            explain: <p>The time is O(k × E) and the space is O(n). The copy is needed. If you updated the same array, one round could chain several flights and go over the stop limit.</p>,
          },
          {
            name: "Dijkstra over (city, stops)",
            idea: <p>Keep a heap of <code>[price, city, stops used]</code>. The first time we pop the destination, its price is the cheapest valid one. Drop entries that use more than <code>k</code> stops. Skip a city if we already popped it with the same or fewer stops. That earlier visit was cheaper and no worse on stops.</p>,
            code: `class Heap {
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

function findCheapestPrice(n, flights, src, dst, k) {
  const graph = Array.from({ length: n }, () => []);
  for (const [from, to, price] of flights) graph[from].push([to, price]);
  const fewestStops = new Array(n).fill(Infinity);     // fewest stops seen so far when popping each city
  const pq = new Heap((a, b) => a[0] - b[0]);
  pq.push([0, src, 0]);
  while (pq.size) {
    const [price, city, stops] = pq.pop();
    if (city === dst) return price;
    if (stops >= fewestStops[city] || stops > k) continue;
    fewestStops[city] = stops;
    for (const [next, cost] of graph[city]) pq.push([price + cost, next, stops + 1]);
  }
  return -1;
}

console.log(findCheapestPrice(4, [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], 0, 3, 1)); // 700
console.log(findCheapestPrice(3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1));                           // 200
console.log(findCheapestPrice(3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0));                           // 500`,
            explain: <p>Each time a city is expanded, it has fewer stops than the last time. So it is expanded at most k + 1 times, and the search stays fast enough. Here <code>stops</code> counts the flights taken so far. The destination is allowed at stops = k + 1, because the last flight lands on it. That is why the test <code>stops &gt; k</code> comes after the destination check.</p>,
          },
        ]}
        compare={<p>Bellman–Ford with the copy is the shortest and safest code. It matches the words &quot;at most k edges&quot; exactly. Also know the Dijkstra version, so you can explain why plain Dijkstra fails here. (LeetCode 787.)</p>}
      >
        <p>
          There are <code>n</code> cities and <code>flights[i] = [from, to, price]</code> (one-way). Return the cheapest price from <code>src</code> to{" "}
          <code>dst</code> using <strong>at most <code>k</code> stops</strong> (cities in between). Return <code>-1</code> if there is no such trip.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Word ladder"
        level="Hard"
        examples={[
          { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: "5", why: 'hit → hot → dot → dog → cog. There are five words in the sequence.' },
          { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: "0", why: '"cog" is not in the list, so you can never reach it.' },
        ]}
        hints={[
          <>Think of each word as a vertex (a dot). Join two words with an edge (a link) if they differ in exactly one letter. You want the path with the fewest vertices.</>,
          <>There are no weights, so use BFS. The only question is how to find a word&apos;s neighbours quickly.</>,
          <>You can change each letter to each of the 26 letters and look the new word up in a Set. Or you can group words by a &quot;pattern with one wildcard&quot; (a letter that can be anything), like h*t.</>,
        ]}
        approaches={[
          {
            name: "Brute force: compare every pair, then BFS",
            idea: <p>Build the graph by testing every pair of words to see if they &quot;differ in exactly one place&quot;. Then run BFS from the begin word.</p>,
            code: `function ladderLength(beginWord, endWord, wordList) {
  const words = [beginWord, ...wordList.filter((w) => w !== beginWord)];
  const target = words.indexOf(endWord);
  if (target === -1) return 0;
  const oneApart = (a, b) => {
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && ++diff > 1) return false;
    return diff === 1;
  };
  const graph = words.map(() => []);
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      if (oneApart(words[i], words[j])) { graph[i].push(j); graph[j].push(i); }
    }
  }
  const dist = new Array(words.length).fill(0);
  dist[0] = 1;
  const queue = [0];
  let head = 0;
  while (head < queue.length) {
    const v = queue[head++];
    if (v === target) return dist[v];
    for (const w of graph[v]) if (dist[w] === 0) { dist[w] = dist[v] + 1; queue.push(w); }
  }
  return 0;
}

console.log(ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"])); // 5
console.log(ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log"]));        // 0`,
            explain: <p>Building the graph costs O(N² × L) for N words of length L. This is fine for hundreds of words, but too slow for thousands.</p>,
          },
          {
            name: "BFS trying all 26 letters",
            idea: <p>Put the word list in a Set. For a word, go through every position and every letter a–z and make the new word. If the new word is in the Set, it is a neighbour. Remove it from the Set when you add it to the queue. This also works as the visited mark.</p>,
            code: `function ladderLength(beginWord, endWord, wordList) {
  const words = new Set(wordList);
  if (!words.has(endWord)) return 0;
  const queue = [[beginWord, 1]];
  let head = 0;
  while (head < queue.length) {
    const [word, steps] = queue[head++];
    if (word === endWord) return steps;
    for (let i = 0; i < word.length; i++) {
      for (let code = 97; code <= 122; code++) {     // 'a' .. 'z'
        const next = word.slice(0, i) + String.fromCharCode(code) + word.slice(i + 1);
        if (words.has(next)) {
          words.delete(next);                        // visited
          queue.push([next, steps + 1]);
        }
      }
    }
  }
  return 0;
}

console.log(ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"])); // 5
console.log(ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log"]));        // 0`,
            explain: <p>Each word goes into the queue at most once. For each word we try L × 26 new words, and each one costs O(L) to build and look up. So the time is O(N × L² × 26). This beats the pair-by-pair way when N is large and L is small.</p>,
          },
          {
            name: "BFS with wildcard buckets",
            idea: <p>First work out, for every word and every position, the pattern with that letter replaced by <code>*</code>. For example <code>hot</code> gives <code>*ot</code>, <code>h*t</code> and <code>ho*</code>. Words that share a pattern are neighbours. Run BFS through the patterns.</p>,
            code: `function ladderLength(beginWord, endWord, wordList) {
  const buckets = new Map();                         // pattern -> words that match it
  for (const word of wordList) {
    for (let i = 0; i < word.length; i++) {
      const pattern = word.slice(0, i) + "*" + word.slice(i + 1);
      if (!buckets.has(pattern)) buckets.set(pattern, []);
      buckets.get(pattern).push(word);
    }
  }
  if (!wordList.includes(endWord)) return 0;
  const seen = new Set([beginWord]);
  const queue = [[beginWord, 1]];
  let head = 0;
  while (head < queue.length) {
    const [word, steps] = queue[head++];
    if (word === endWord) return steps;
    for (let i = 0; i < word.length; i++) {
      const pattern = word.slice(0, i) + "*" + word.slice(i + 1);
      for (const next of buckets.get(pattern) || []) {
        if (!seen.has(next)) { seen.add(next); queue.push([next, steps + 1]); }
      }
    }
  }
  return 0;
}

console.log(ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"])); // 5
console.log(ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log"]));        // 0`,
            explain: <p>Building the patterns takes O(N × L²). There are L patterns per word, and each takes O(L) to build. BFS does the same amount of work. This way you do not try 26 letters at each position, which helps most when the alphabet is large.</p>,
          },
        ]}
        compare={<p>Any BFS version passes. The 26-letter one is the shortest to write in an interview. The wildcard buckets are the best to explain. Mention the pair-by-pair graph first, as the brute force. (LeetCode 127.)</p>}
      >
        <p>
          Change <code>beginWord</code> into <code>endWord</code> one letter at a time. Every word in between must be in{" "}
          <code>wordList</code> (the begin word does not need to be). Return the number of words in the shortest sequence, counting both ends.
          Return <code>0</code> if there is no such sequence.
        </p>
      </Problem>

      <Problem
        n={6}
        title="Swim in rising water"
        level="Hard"
        examples={[
          { input: "grid = [[0,2],[1,3]]", output: "3", why: "You must end in the corner cell with elevation 3, so you need at least time 3. At time 3 all cells are under water and you can swim through." },
          { input: "grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]", output: "16", why: "Go along the top and down the right side. You must cross cell 16, so the whole route needs time 16." },
        ]}
        hints={[
          <>At time t you may stand on any cell whose elevation is at most t. So a route is possible at time t if all its cells are at most t.</>,
          <>The time a route needs is the height of its highest cell. You want the route whose highest cell is as low as possible.</>,
          <>This is a &quot;make the maximum as small as possible&quot; problem, like Path With Minimum Effort. Use Dijkstra with max, or binary search on t plus BFS.</>,
        ]}
        approaches={[
          {
            name: "Dijkstra with max",
            idea: <p>The &quot;cost&quot; to reach a cell is the highest elevation seen on the best route to it. Always take the cell with the lowest cost next. Moving to a neighbour costs <code>max(cost so far, neighbour&apos;s elevation)</code>.</p>,
            code: `class Heap {
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

function swimInWater(grid) {
  const n = grid.length;
  const best = Array.from({ length: n }, () => new Array(n).fill(Infinity));
  best[0][0] = grid[0][0];
  const pq = new Heap((a, b) => a[0] - b[0]);
  pq.push([grid[0][0], 0, 0]);
  while (pq.size) {
    const [t, r, c] = pq.pop();
    if (t > best[r][c]) continue;
    if (r === n - 1 && c === n - 1) return t;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
      const nt = Math.max(t, grid[nr][nc]);
      if (nt < best[nr][nc]) { best[nr][nc] = nt; pq.push([nt, nr, nc]); }
    }
  }
  return -1;
}

console.log(swimInWater([[0, 2], [1, 3]]));  // 3
console.log(swimInWater([[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]])); // 16`,
            explain: <p>The time is O(n² log n) for an n × n grid. This is the &quot;minimax path&quot; version of Dijkstra. The cost of a route is its maximum, and making a route longer never lowers it.</p>,
          },
          {
            name: "Binary search on time + BFS",
            idea: <p>If you can swim across at time <code>t</code>, you can also do it at any later time. So the answers switch from &quot;no&quot; to &quot;yes&quot; only once. Use binary search (halve the range each time) to find the smallest <code>t</code> for which BFS over cells with elevation ≤ <code>t</code> connects the two corners.</p>,
            code: `function swimInWater(grid) {
  const n = grid.length;
  function canCross(t) {
    if (grid[0][0] > t) return false;
    const seen = Array.from({ length: n }, () => new Array(n).fill(false));
    seen[0][0] = true;
    const queue = [[0, 0]];
    let head = 0;
    while (head < queue.length) {
      const [r, c] = queue[head++];
      if (r === n - 1 && c === n - 1) return true;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && !seen[nr][nc] && grid[nr][nc] <= t) {
          seen[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
    return false;
  }
  let lo = 0, hi = n * n - 1;                  // elevations are a permutation of 0 .. n*n-1
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (canCross(mid)) hi = mid; else lo = mid + 1;
  }
  return lo;
}

console.log(swimInWater([[0, 2], [1, 3]]));  // 3
console.log(swimInWater([[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]])); // 16`,
            explain: <p>The time is also O(n² log n). There are about log₂(n²) BFS runs, and each takes O(n²). No heap is needed.</p>,
          },
        ]}
        compare={<p>Both are fine. Dijkstra with max is the pattern you can reuse. The binary search is the least code if you do not want a heap. (LeetCode 778. Union-Find in the next lesson is a third way.)</p>}
      >
        <p>
          An <code>n × n</code> grid holds a distinct elevation <code>0..n²-1</code> in each cell. At time <code>t</code> the water depth everywhere is{" "}
          <code>t</code>, and you can swim from a cell to a 4-directionally adjacent cell if both elevations are at most <code>t</code>. Starting at the
          top-left at time 0, return the least time at which you can reach the bottom-right cell.
        </p>
      </Problem>

      <Problem
        n={7}
        title="Path with maximum probability"
        level="Medium"
        examples={[
          { input: "n = 3, edges = [[0,1],[1,2],[0,2]], succProb = [0.5,0.5,0.2], start = 0, end = 2", output: "0.25", why: "Going through node 1: 0.5 × 0.5 = 0.25, which beats the direct edge's 0.2." },
          { input: "n = 3, edges = [[0,1],[1,2],[0,2]], succProb = [0.5,0.5,0.3], start = 0, end = 2", output: "0.3", why: "The direct edge (0.3) is now better than 0.25." },
          { input: "n = 3, edges = [[0,1]], succProb = [0.5], start = 0, end = 2", output: "0", why: "You cannot reach node 2." },
        ]}
        hints={[
          <>The probability of a route is its edges&apos; probabilities multiplied together. You want the route with the biggest result.</>,
          <>Each number is between 0 and 1, so making a route longer can only lower its probability. This is the same property that weights that are never negative give Dijkstra.</>,
          <>Use a max-heap (a heap that gives the biggest item first; flip the comparator) ordered by probability. Start with probability 1 at the start node.</>,
        ]}
        approaches={[
          {
            name: "Dijkstra with a max-heap",
            idea: <p>Keep the best probability found so far for each node. Always take the node with the highest probability next. Update a neighbour with <code>prob × edgeProb</code> if that is higher than the neighbour&apos;s current value.</p>,
            code: `class Heap {
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

function maxProbability(n, edges, succProb, start, end) {
  const graph = Array.from({ length: n }, () => []);
  edges.forEach(([a, b], i) => { graph[a].push([b, succProb[i]]); graph[b].push([a, succProb[i]]); });
  const best = new Array(n).fill(0);
  best[start] = 1;
  const pq = new Heap((x, y) => y[0] - x[0]);        // largest probability first
  pq.push([1, start]);
  while (pq.size) {
    const [p, v] = pq.pop();
    if (v === end) return p;
    if (p < best[v]) continue;                       // stale entry
    for (const [next, q] of graph[v]) {
      if (p * q > best[next]) { best[next] = p * q; pq.push([best[next], next]); }
    }
  }
  return 0;
}

console.log(maxProbability(3, [[0, 1], [1, 2], [0, 2]], [0.5, 0.5, 0.2], 0, 2)); // 0.25
console.log(maxProbability(3, [[0, 1], [1, 2], [0, 2]], [0.5, 0.5, 0.3], 0, 2)); // 0.3
console.log(maxProbability(3, [[0, 1]], [0.5], 0, 2));                           // 0`,
            explain: <p>The time is O((V + E) log V). The first time the end node is popped, its probability is final, just like a distance in ordinary Dijkstra.</p>,
          },
          {
            name: "Bellman–Ford on probabilities",
            idea: <p>Repeat for up to n − 1 rounds. For every edge, in both directions, improve the neighbour&apos;s probability if <code>best[a] × p</code> is higher. Stop when a round changes nothing.</p>,
            code: `function maxProbability(n, edges, succProb, start, end) {
  const best = new Array(n).fill(0);
  best[start] = 1;
  for (let round = 1; round < n; round++) {
    let changed = false;
    edges.forEach(([a, b], i) => {
      const p = succProb[i];
      if (best[a] * p > best[b]) { best[b] = best[a] * p; changed = true; }
      if (best[b] * p > best[a]) { best[a] = best[b] * p; changed = true; }
    });
    if (!changed) break;
  }
  return best[end];
}

console.log(maxProbability(3, [[0, 1], [1, 2], [0, 2]], [0.5, 0.5, 0.2], 0, 2)); // 0.25
console.log(maxProbability(3, [[0, 1], [1, 2], [0, 2]], [0.5, 0.5, 0.3], 0, 2)); // 0.3
console.log(maxProbability(3, [[0, 1]], [0.5], 0, 2));                           // 0`,
            explain: <p>The worst-case time is O(V × E), and no heap is needed. It works because multiplying by a number between 0 and 1 never improves a cycle, so n − 1 rounds are enough.</p>,
          },
        ]}
        compare={<p>Write Dijkstra when the graph is big. The Bellman–Ford version is the simplest. In maths, both are the same as making the sum of −log(p) as small as possible. (LeetCode 1514.)</p>}
      >
        <p>
          An undirected graph has <code>n</code> nodes. Edge <code>edges[i]</code> works with probability <code>succProb[i]</code>. Given{" "}
          <code>start</code> and <code>end</code>, return the highest probability of success of any path between them. Return <code>0</code> if there is no
          path. (A path works only if every edge on it works, so its probability is all the edge probabilities multiplied together.)
        </p>
      </Problem>
    </>
  );
}
