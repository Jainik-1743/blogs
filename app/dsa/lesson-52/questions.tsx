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
          { input: "grid = [[0,1],[1,0]]", output: "2", why: "Move diagonally from (0,0) to (1,1): two cells on the path." },
          { input: "grid = [[0,0,0],[1,1,0],[1,1,0]]", output: "4", why: "(0,0) → (0,1) → (1,2) → (2,2): four cells." },
          { input: "grid = [[1,0,0],[1,1,0],[1,1,0]]", output: "-1", why: "The start cell is blocked." },
        ]}
        hints={[
          <>Every step costs the same, and you want the fewest steps. Which traversal gives that?</>,
          <>You may move in 8 directions, and the answer counts cells, not moves (the start cell counts as 1).</>,
          <>Mark a cell as visited when it joins the queue, so each cell enters at most once.</>,
        ]}
        approaches={[
          {
            name: "Brute force: DFS over every path",
            idea: <p>Try every simple path from the top-left, keeping a visited mark that is removed again on the way back (backtracking), and remember the shortest one that reaches the goal.</p>,
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
            explain: <p>The number of simple paths in a grid grows exponentially, so this only works on tiny grids (the real limit is n = 100). It is useful as a correctness check for the BFS.</p>,
          },
          {
            name: "BFS",
            idea: <p>Start from the top-left with length 1. BFS expands in rings of equal distance, so the first time it reaches the bottom-right, that distance is the minimum.</p>,
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
            explain: <p>Each cell enters the queue at most once and tries 8 neighbours: O(n²) time and space for an n × n grid. The case dr = dc = 0 points back at the cell itself, which is already marked, so it is harmlessly skipped.</p>,
          },
        ]}
        compare={<p>BFS, as soon as every move costs the same. (LeetCode 1091.)</p>}
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
          { input: "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2", output: "2", why: "From node 2: node 1 at time 1, node 3 at time 1, node 4 at time 2. The last node to hear gets it at time 2." },
          { input: "times = [[1,2,1]], n = 2, k = 1", output: "1", why: "One link of delay 1." },
          { input: "times = [[1,2,1]], n = 2, k = 2", output: "-1", why: "Node 1 can never be reached from node 2 (links are one-way)." },
        ]}
        hints={[
          <>Each entry [u, v, w] is a one-way link from u to v with travel time w. How long does the signal take to reach each node?</>,
          <>That is the shortest-path distance from k to every node. The weights are non-negative and unequal.</>,
          <>The whole network has the signal once the farthest node does. What if some node is never reached?</>,
        ]}
        approaches={[
          {
            name: "Dijkstra with a heap",
            idea: <p>Compute the shortest distance from <code>k</code> to every node. The answer is the largest of those distances, or -1 if any node is unreachable.</p>,
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
            explain: <p>O((V + E) log V). Because <code>dist</code> starts at Infinity, any unreachable node leaves the maximum at Infinity, which we turn into -1.</p>,
          },
          {
            name: "Bellman–Ford",
            idea: <p>Relax every link repeatedly, up to n − 1 rounds, stopping early when a round changes nothing.</p>,
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
            explain: <p>O(V × E) in the worst case, but about the same code size as the heap-free version. Infinity + w is still Infinity in JavaScript, so unreached sources never produce a false improvement.</p>,
          },
        ]}
        compare={<p>Dijkstra: weights are non-negative and the graph can be large. Bellman–Ford is fine for the small constraints here (n ≤ 100) and does not need a heap. (LeetCode 743.)</p>}
      >
        <p>
          A network has nodes <code>1..n</code>. Each entry <code>[u, v, w]</code> in <code>times</code> is a one-way link: a signal sent from{" "}
          <code>u</code> reaches <code>v</code> after <code>w</code> time units. A signal starts at node <code>k</code>. Return the time it takes for
          all nodes to receive it, or <code>-1</code> if some node never does.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Path with minimum effort"
        level="Medium"
        examples={[
          { input: "heights = [[1,2,2],[3,8,2],[5,3,5]]", output: "2", why: "Route 1 → 3 → 5 → 3 → 5 has biggest step 2. The route over the 8 has bigger steps." },
          { input: "heights = [[1,2,3],[3,8,4],[5,3,5]]", output: "1", why: "Route 1 → 2 → 3 → 4 → 5 has steps of 1 only." },
          { input: "heights = [[1,2,1,1,1],[1,2,1,2,1],[1,2,1,2,1],[1,2,1,2,1],[1,1,1,2,1]]", output: "0", why: "A route that follows the 1s never changes height." },
        ]}
        hints={[
          <>The effort of a route is not the sum of steps but the largest height difference between two adjacent cells on it.</>,
          <>Dijkstra works if the cost of a path never decreases as it grows. Replace + with max.</>,
          <>Alternatively: guess an effort limit, check with BFS whether the goal is reachable using only steps within the limit, and binary search the limit.</>,
        ]}
        approaches={[
          {
            name: "Dijkstra with max",
            idea: <p>The &quot;distance&quot; of a cell is the smallest possible worst step on any route to it. Reaching a neighbour gives <code>max(effort so far, this step)</code>. Always expand the cell with the smallest effort.</p>,
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
            explain: <p>O(R × C × log(R × C)). Dijkstra stays correct because <code>max(e, step) ≥ e</code>: extending a route never lowers its effort, which is the same property that non-negative weights give for sums.</p>,
          },
          {
            name: "Binary search the answer + BFS",
            idea: <p>If an effort limit <code>L</code> allows a route, any bigger limit does too, so feasibility is monotone. Binary search the smallest <code>L</code> for which BFS can walk from start to goal using only steps of at most <code>L</code>.</p>,
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
            explain: <p>About 20 BFS runs (log₂ of 10⁶), each O(R × C): O(R × C × log H). Same idea as binary searching on the answer in lesson 29 (ask a yes/no question, then halve).</p>,
          },
        ]}
        compare={<p>Dijkstra with max is the more general pattern. The binary-search version needs no heap and is easy if you already recognise &quot;minimise the maximum&quot;. (LeetCode 1631.)</p>}
      >
        <p>
          You are in the top-left cell of a grid of heights and want to reach the bottom-right cell, moving up, down, left or right. The{" "}
          <strong>effort</strong> of a route is the maximum absolute height difference between two consecutive cells on it. Return the minimum effort
          over all routes.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Cheapest flights within K stops"
        level="Medium"
        examples={[
          { input: "n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1", output: "700", why: "0 → 1 → 3 costs 700 with one stop. The cheaper 0 → 1 → 2 → 3 (400) needs two stops." },
          { input: "n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1", output: "200", why: "One stop at city 1 beats the direct 500." },
          { input: "n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 0", output: "500", why: "No stops allowed: only the direct flight." },
        ]}
        hints={[
          <>Plain Dijkstra finds the cheapest route but ignores the stop limit. A cheap route with too many stops is invalid.</>,
          <>At most k stops means at most k + 1 flights. Which algorithm has &quot;paths of at most i edges&quot; built in?</>,
          <>Run k + 1 rounds of Bellman–Ford, reading from the previous round&apos;s prices so each round adds exactly one flight.</>,
        ]}
        approaches={[
          {
            name: "Bellman–Ford, k + 1 rounds",
            idea: <p>After round <code>i</code>, <code>prices[x]</code> is the cheapest price to reach <code>x</code> with at most <code>i</code> flights. Compute each round from a copy of the previous one.</p>,
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
            explain: <p>O(k × E) time, O(n) space. Copying the array is essential: relaxing in place could chain several flights within a single round and exceed the stop limit.</p>,
          },
          {
            name: "Dijkstra over (city, stops)",
            idea: <p>Keep the heap of <code>[price, city, stops used]</code>. The first time we pop the destination, its price is the cheapest valid one. Drop entries that use more than <code>k</code> stops. Skip a city if we already popped it with the same or fewer stops, since that earlier visit was cheaper and no worse on stops.</p>,
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
            explain: <p>Each time a city is expanded it has a strictly smaller stop count than the previous expansion, so it is expanded at most k + 1 times and the search stays polynomial. Here <code>stops</code> counts the flights taken so far; the destination is allowed at stops = k + 1 because the last flight lands on it, so the test <code>stops &gt; k</code> sits after the destination check.</p>,
          },
        ]}
        compare={<p>Bellman–Ford with the copy is the shortest, safest code and fits the &quot;at most k edges&quot; wording exactly. Know the Dijkstra variant to explain why plain Dijkstra fails here. (LeetCode 787.)</p>}
      >
        <p>
          There are <code>n</code> cities and <code>flights[i] = [from, to, price]</code> (one-way). Return the cheapest price from <code>src</code> to{" "}
          <code>dst</code> using <strong>at most <code>k</code> stops</strong> (cities in between), or <code>-1</code> if no such trip exists.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Word ladder"
        level="Hard"
        examples={[
          { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: "5", why: 'hit → hot → dot → dog → cog: five words in the sequence.' },
          { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: "0", why: '"cog" is not in the list, so it can never be reached.' },
        ]}
        hints={[
          <>Think of words as vertices, with an edge between two words that differ in exactly one letter. You want the fewest vertices on a path.</>,
          <>No weights: BFS. The only question is how to find a word&apos;s neighbours quickly.</>,
          <>Either try changing each letter to each of 26 letters and look it up in a Set, or group words by &quot;pattern with one wildcard&quot;, like h*t.</>,
        ]}
        approaches={[
          {
            name: "Brute force: compare every pair, then BFS",
            idea: <p>Build the graph by testing every pair of words for &quot;differ in exactly one position&quot;, then BFS from the begin word.</p>,
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
            explain: <p>Building the graph costs O(N² × L) for N words of length L: fine for hundreds of words, too slow for thousands.</p>,
          },
          {
            name: "BFS trying all 26 letters",
            idea: <p>Put the list in a Set. From a word, for every position and every letter a–z, form the new word; if it is in the Set, it is a neighbour. Remove it from the Set when you enqueue it, which doubles as the visited mark.</p>,
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
            explain: <p>Each word is enqueued at most once; for each we try L × 26 candidates, each costing O(L) to build and hash: O(N × L² × 26). Better than pairwise when N is large and L is small.</p>,
          },
          {
            name: "BFS with wildcard buckets",
            idea: <p>Precompute, for every word and every position, the pattern with that letter replaced by <code>*</code> (for example <code>hot</code> gives <code>*ot</code>, <code>h*t</code>, <code>ho*</code>). Words sharing a pattern are neighbours. BFS through patterns.</p>,
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
            explain: <p>Building patterns is O(N × L²) (L patterns per word, each O(L) to build), and BFS does the same amount of work. It avoids trying 26 letters per position, which helps most when the alphabet is large.</p>,
          },
        ]}
        compare={<p>Any BFS version passes; the 26-letter one is the shortest to write in an interview, and the wildcard buckets are the best to explain. The pairwise graph is the brute force to mention first. (LeetCode 127.)</p>}
      >
        <p>
          Transform <code>beginWord</code> into <code>endWord</code> one letter at a time, where every intermediate word must be in{" "}
          <code>wordList</code> (the begin word need not be). Return the number of words in the shortest transformation sequence, counting both ends,
          or <code>0</code> if none exists.
        </p>
      </Problem>

      <Problem
        n={6}
        title="Swim in rising water"
        level="Hard"
        examples={[
          { input: "grid = [[0,2],[1,3]]", output: "3", why: "You must be in the corner cell with elevation 3 at the end, so at least time 3. At time 3 all cells are under water and you can swim through." },
          { input: "grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]", output: "16", why: "Go along the top and down the right side, then you must cross cell 16; the whole route needs time 16." },
        ]}
        hints={[
          <>At time t you may stand on any cell whose elevation is at most t. So a route is possible at time t if all its cells are at most t.</>,
          <>The needed time for a route is the highest cell on it. You want the route whose highest cell is as low as possible.</>,
          <>That is a minimise-the-maximum problem, like Path With Minimum Effort. Dijkstra with max, or binary search on t plus BFS.</>,
        ]}
        approaches={[
          {
            name: "Dijkstra with max",
            idea: <p>The &quot;cost&quot; to reach a cell is the highest elevation seen on the best route to it. Always expand the cell with the lowest such cost; moving to a neighbour costs <code>max(cost so far, neighbour&apos;s elevation)</code>.</p>,
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
            explain: <p>O(n² log n) for an n × n grid. It is the &quot;minimax path&quot; version of Dijkstra: the cost of a route is its maximum, and extending a route never lowers it.</p>,
          },
          {
            name: "Binary search on time + BFS",
            idea: <p>Feasibility is monotone: if you can swim across at time <code>t</code>, you can at any later time. Binary search the smallest <code>t</code> for which BFS over cells with elevation ≤ <code>t</code> connects the corners.</p>,
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
            explain: <p>O(n² log n) as well: about log₂(n²) BFS runs of O(n²) each. No heap needed.</p>,
          },
        ]}
        compare={<p>Both are fine. Dijkstra with max is the reusable pattern; the binary search is the least code if you do not want a heap. (LeetCode 778; Union-Find in the next lesson is a third way.)</p>}
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
          { input: "n = 3, edges = [[0,1],[1,2],[0,2]], succProb = [0.5,0.5,0.2], start = 0, end = 2", output: "0.25", why: "Via 1: 0.5 × 0.5 = 0.25, which beats the direct edge's 0.2." },
          { input: "n = 3, edges = [[0,1],[1,2],[0,2]], succProb = [0.5,0.5,0.3], start = 0, end = 2", output: "0.3", why: "The direct edge (0.3) is now better than 0.25." },
          { input: "n = 3, edges = [[0,1]], succProb = [0.5], start = 0, end = 2", output: "0", why: "Node 2 cannot be reached." },
        ]}
        hints={[
          <>The probability of a route is the product of its edges&apos; probabilities. You want the route with the largest product.</>,
          <>Each factor is between 0 and 1, so extending a route can only lower its probability. That is the same property non-negative weights give Dijkstra.</>,
          <>Use a max-heap (flip the comparator) keyed by probability, starting from 1 at the start node.</>,
        ]}
        approaches={[
          {
            name: "Dijkstra with a max-heap",
            idea: <p>Keep the best known probability for each node. Always expand the node with the highest probability; relax a neighbour with <code>prob × edgeProb</code> if that is higher than the neighbour&apos;s current value.</p>,
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
            explain: <p>O((V + E) log V). The first time the end node is popped its probability is final, exactly like a distance in ordinary Dijkstra.</p>,
          },
          {
            name: "Bellman–Ford on probabilities",
            idea: <p>Repeat up to n − 1 rounds: for every edge in both directions, improve the neighbour&apos;s probability if <code>best[a] × p</code> is higher. Stop when a round changes nothing.</p>,
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
            explain: <p>O(V × E) worst case, no heap. Works because multiplying by a number between 0 and 1 never improves a cycle, so n − 1 rounds are enough.</p>,
          },
        ]}
        compare={<p>Dijkstra is the one to write when the graph is big; the Bellman–Ford version is the simplest. Mathematically both are the same as minimising the sum of −log(p). (LeetCode 1514.)</p>}
      >
        <p>
          An undirected graph has <code>n</code> nodes; edge <code>edges[i]</code> succeeds with probability <code>succProb[i]</code>. Given{" "}
          <code>start</code> and <code>end</code>, return the maximum probability of success of any path between them, or <code>0</code> if there is no
          path. (A path succeeds only if every edge on it does, so its probability is the product.)
        </p>
      </Problem>
    </>
  );
}
