import Problem from "@/components/dsa/Problem";

/** Lesson 50 practice questions: BFS and DFS on graphs and grids. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Number of islands"
        level="Medium"
        examples={[
          { input: 'grid = [["1","1","0","0"],["1","1","0","0"],["0","0","1","0"],["0","0","0","1"]]', output: "3", why: "There is a 2×2 block, a single cell at (2,2), and a single cell at (3,3). Cells that touch only at a corner (diagonal) are not connected." },
          { input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]', output: "1", why: "All the land is connected through the middle column." },
        ]}
        hints={[
          <>An island is a connected component (a group of connected cells) of land. How did we count components before?</>,
          <>When you find a land cell you have not seen, add one to the answer. Then visit its whole island, so you never count it again.</>,
          <>How can you mark a cell as visited without a separate Set?</>,
        ]}
        approaches={[
          {
            name: "DFS that sinks the island",
            idea: <p>Look at every cell. At a land cell, count one island. Then use recursion (a function that calls itself) to turn that cell and all the land connected to it into water.</p>,
            code: `function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  let count = 0;
  function sink(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0";
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") { count++; sink(r, c); }
    }
  }
  return count;
}

console.log(numIslands([["1", "1", "0", "0"], ["1", "1", "0", "0"], ["0", "0", "1", "0"], ["0", "0", "0", "1"]])); // 3
console.log(numIslands([["1", "1", "1"], ["0", "1", "0"], ["1", "1", "1"]]));                                      // 1`,
            explain: <p>It takes O(rows × cols) time, because every cell is visited a fixed number of times. The space is the recursion depth, which can be up to rows × cols for an island shaped like a snake. It changes the input. If that is not allowed, copy the grid first or use a visited array.</p>,
          },
          {
            name: "BFS with a visited array",
            idea: <p>Use the same scan, but explore each island with a queue. Keep the input unchanged by using a separate grid of true/false values. Mark cells when you enqueue them.</p>,
            code: `function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== "1" || visited[r][c]) continue;
      count++;
      visited[r][c] = true;
      const queue = [[r, c]];
      let head = 0;
      while (head < queue.length) {
        const [cr, cc] = queue[head++];
        for (const [dr, dc] of dirs) {
          const nr = cr + dr, nc = cc + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === "1" && !visited[nr][nc]) {
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        }
      }
    }
  }
  return count;
}

console.log(numIslands([["1", "1", "0", "0"], ["1", "1", "0", "0"], ["0", "0", "1", "0"], ["0", "0", "0", "1"]])); // 3
console.log(numIslands([["1", "1", "1"], ["0", "1", "0"], ["1", "1", "1"]]));                                      // 1`,
            explain: <p>It takes O(rows × cols) time and space. The queue only holds the cells at the edge of the search, and there is no deep recursion, so there is no risk of stack overflow. The input stays unchanged.</p>,
          },
        ]}
        compare={<p>Recursive DFS is the shortest to write. Use BFS (or your own stack) when the grid is so large that deep recursion could be a problem, or when you must not change the input. (LeetCode 200.)</p>}
      >
        <p>
          You get a grid of <code>&quot;1&quot;</code> (land) and <code>&quot;0&quot;</code> (water) characters. Count the islands. An island is a group of land cells connected left-right or up-down.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Flood fill"
        level="Easy"
        examples={[
          { input: "image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2", output: "[[2,2,2],[2,2,0],[2,0,1]]", why: "Start at (1,1). All the 1s connected to it become 2. The 1 at the bottom-right is not connected." },
          { input: "image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, color = 0", output: "[[0,0,0],[0,0,0]]", why: "The new colour is the same as the old one, so nothing changes." },
        ]}
        hints={[
          <>Start at the given pixel. Spread to the four neighbours that have the same original colour.</>,
          <>Remember the original colour before you paint anything.</>,
          <>What goes wrong when the new colour is the same as the original colour?</>,
        ]}
        approaches={[
          {
            name: "Recursive DFS",
            idea: <p>Paint the cell. Then use recursion on each neighbour that still has the old colour.</p>,
            code: `function floodFill(image, sr, sc, color) {
  const old = image[sr][sc];
  if (old === color) return image;
  function fill(r, c) {
    if (r < 0 || r >= image.length || c < 0 || c >= image[0].length || image[r][c] !== old) return;
    image[r][c] = color;
    fill(r + 1, c); fill(r - 1, c); fill(r, c + 1); fill(r, c - 1);
  }
  fill(sr, sc);
  return image;
}

console.log(floodFill([[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2)); // [ [ 2, 2, 2 ], [ 2, 2, 0 ], [ 2, 0, 1 ] ]
console.log(floodFill([[0, 0, 0], [0, 0, 0]], 0, 0, 0));            // [ [ 0, 0, 0 ], [ 0, 0, 0 ] ]`,
            explain: <p>It takes O(rows × cols) time. The new colour works as the visited mark. If it were the same as the old colour, painted cells would still look unpainted, and the recursion would never end. That is why we return early.</p>,
          },
          {
            name: "BFS with a queue",
            idea: <p>Paint the start and put it in the queue. For each cell you take out of the queue, paint the neighbours that have the old colour and put them in the queue.</p>,
            code: `function floodFill(image, sr, sc, color) {
  const old = image[sr][sc];
  if (old === color) return image;
  image[sr][sc] = color;
  const queue = [[sr, sc]];
  let head = 0;
  while (head < queue.length) {
    const [r, c] = queue[head++];
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < image.length && nc >= 0 && nc < image[0].length && image[nr][nc] === old) {
        image[nr][nc] = color;       // painting when we enqueue = marking as visited
        queue.push([nr, nc]);
      }
    }
  }
  return image;
}

console.log(floodFill([[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2)); // [ [ 2, 2, 2 ], [ 2, 2, 0 ], [ 2, 0, 1 ] ]`,
            explain: <p>It is also O(rows × cols). It uses a queue instead of the call stack, so a huge region cannot overflow it.</p>,
          },
        ]}
        compare={<p>Both are equally good. Pick the recursion because it is shorter. (LeetCode 733.)</p>}
      >
        <p>
          An image is a grid of numbers, and each number is a colour. Start at pixel <code>(sr, sc)</code>. Change that pixel to <code>color</code>. Also change every pixel connected to it (up, down, left, right) that has the same original colour. Return the image.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Rotting oranges"
        level="Medium"
        examples={[
          { input: "grid = [[2,1,1],[1,1,0],[0,1,1]]", output: "4", why: "The rot spreads one step each minute. The farthest orange (bottom-right) rots at minute 4." },
          { input: "grid = [[2,1,1],[0,1,1],[1,0,1]]", output: "-1", why: "The orange at the bottom-left has no path to a rotten orange." },
          { input: "grid = [[0,2]]", output: "0", why: "There are no fresh oranges, so no time is needed." },
        ]}
        hints={[
          <>Each minute, every rotten orange makes its fresh neighbours rot at the same moment. That is a BFS where each level is one minute.</>,
          <>There can be several rotten oranges at the start. Put all of them in the queue first.</>,
          <>Count the fresh oranges at the beginning. If any are left at the end, the answer is −1.</>,
        ]}
        approaches={[
          {
            name: "Simulate minute by minute",
            idea: <p>Repeat this: look at the whole grid and make every fresh orange next to a rotten one rot. Use a copy of the grid, so that one minute is exactly one step. Stop when nothing changes.</p>,
            code: `function orangesRotting(grid) {
  const rows = grid.length, cols = grid[0].length;
  let minutes = 0;
  while (true) {
    const next = grid.map((row) => [...row]);
    let changed = false;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] !== 1) continue;
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 2) { next[r][c] = 2; changed = true; break; }
        }
      }
    }
    if (!changed) break;
    grid = next;
    minutes++;
  }
  return grid.some((row) => row.includes(1)) ? -1 : minutes;
}

console.log(orangesRotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]])); // 4
console.log(orangesRotting([[2, 1, 1], [0, 1, 1], [1, 0, 1]])); // -1
console.log(orangesRotting([[0, 2]]));                          // 0`,
            explain: <p>Each minute looks at the whole grid again, and there can be up to rows × cols minutes. So the worst case is O((rows × cols)²).</p>,
          },
          {
            name: "Multi-source BFS",
            idea: <p>Put every rotten orange in the queue. Then process the queue one level at a time. Each level is one minute, and every orange is touched once.</p>,
            code: `function orangesRotting(grid) {
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
    const levelEnd = queue.length;
    while (head < levelEnd) {
      const [r, c] = queue[head++];
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2;
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
console.log(orangesRotting([[2, 1, 1], [0, 1, 1], [1, 0, 1]])); // -1
console.log(orangesRotting([[0, 2]]));                          // 0`,
            explain: <p>It takes O(rows × cols) time and space. We stop when <code>fresh</code> reaches 0, so we do not count an extra empty minute at the end.</p>,
          },
        ]}
        compare={<p>Use multi-source BFS. (LeetCode 994.)</p>}
      >
        <p>
          In a grid, <code>0</code> is an empty cell, <code>1</code> is a fresh orange, and <code>2</code> is a rotten orange. Every minute, a fresh orange next to a rotten one (up, down, left or right) becomes rotten. Return the number of minutes until no fresh orange is left. Return −1 if that can never happen.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Number of provinces"
        level="Medium"
        examples={[
          { input: "isConnected = [[1,1,0],[1,1,0],[0,0,1]]", output: "2", why: "Cities 0 and 1 are connected. City 2 is alone." },
          { input: "isConnected = [[1,0,0],[0,1,0],[0,0,1]]", output: "3", why: "No two cities are connected." },
        ]}
        hints={[
          <>This is an adjacency matrix (a table of edges): <code>isConnected[i][j] = 1</code> means there is an edge between i and j. A province is a connected component.</>,
          <>Loop over the cities. At a city you have not visited, count one province. Then traverse everything you can reach.</>,
        ]}
        approaches={[
          {
            name: "DFS over the matrix",
            idea: <p>For each city you have not visited, add one to the count. Then use DFS to go to every city j where <code>isConnected[city][j] === 1</code>.</p>,
            code: `function findCircleNum(isConnected) {
  const n = isConnected.length;
  const visited = new Array(n).fill(false);
  function visit(city) {
    visited[city] = true;
    for (let j = 0; j < n; j++) {
      if (isConnected[city][j] === 1 && !visited[j]) visit(j);
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
            explain: <p>It takes O(n²) time, because each city scans its whole matrix row once. The input is a matrix, so scanning a row is the way to find the neighbours. You do not need to build a list.</p>,
          },
          {
            name: "BFS over the matrix",
            idea: <p>Use the same counting loop, with a queue to explore each province.</p>,
            code: `function findCircleNum(isConnected) {
  const n = isConnected.length;
  const visited = new Array(n).fill(false);
  let provinces = 0;
  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    provinces++;
    visited[i] = true;
    const queue = [i];
    let head = 0;
    while (head < queue.length) {
      const city = queue[head++];
      for (let j = 0; j < n; j++) {
        if (isConnected[city][j] === 1 && !visited[j]) { visited[j] = true; queue.push(j); }
      }
    }
  }
  return provinces;
}

console.log(findCircleNum([[1, 1, 0], [1, 1, 0], [0, 0, 1]])); // 2
console.log(findCircleNum([[1, 0, 0], [0, 1, 0], [0, 0, 1]])); // 3
console.log(findCircleNum([[1, 0, 1], [0, 1, 0], [1, 0, 1]])); // 2`,
            explain: <p>It is also O(n²). Union-find (lesson 53) is a data structure that keeps items in groups and can quickly merge two groups. It solves the same problem, and it is the better tool when edges arrive one at a time.</p>,
          },
        ]}
        compare={<p>Either traversal works. The key is to see that &quot;groups of cities connected directly or indirectly&quot; means connected components. (LeetCode 547.)</p>}
      >
        <p>
          There are <code>n</code> cities. <code>isConnected[i][j] = 1</code> means that cities i and j are directly connected. The matrix is the same when you swap rows and columns (symmetric). A province is a group of cities connected directly or indirectly. Return the number of provinces.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Clone graph"
        level="Medium"
        examples={[
          { input: "adjList = [[2,4],[1,3],[2,4],[1,3]]", output: "[[2,4],[1,3],[2,4],[1,3]]", why: "Node 1 is joined to 2 and 4, and so on. It forms a square. The clone has the same shape, but it is made of new nodes." },
          { input: "adjList = [[]]", output: "[[]]", why: "One node with no neighbours." },
        ]}
        hints={[
          <>You need a new node for each old node. The new nodes must point at each other, never at the old ones.</>,
          <>A Map from old node to new node tells you whether a node has been copied yet. It is also your visited set.</>,
          <>Create the copy when you first find a node, before you explore its neighbours. Then cycles do not make the recursion run forever.</>,
        ]}
        approaches={[
          {
            name: "Recursive DFS with a Map",
            idea: <p>To clone a node: if it is already in the Map, return its copy. If not, create the copy and store it. Then clone each neighbour and attach it.</p>,
            code: `class Node {
  constructor(val) { this.val = val; this.neighbors = []; }
}

function cloneGraph(node) {
  const copies = new Map();
  function clone(orig) {
    if (!orig) return null;
    if (copies.has(orig)) return copies.get(orig);
    const copy = new Node(orig.val);
    copies.set(orig, copy);                 // save it BEFORE the recursive calls, so cycles can find it
    for (const nb of orig.neighbors) copy.neighbors.push(clone(nb));
    return copy;
  }
  return clone(node);
}

// helper functions for testing: nodes are numbered 1..n, adjList[i] holds the neighbour values of node i+1
function fromAdjList(adj) {
  const nodes = adj.map((_, i) => new Node(i + 1));
  adj.forEach((nbs, i) => { nodes[i].neighbors = nbs.map((v) => nodes[v - 1]); });
  return nodes[0];
}
function toAdjList(start) {
  const seen = new Map();
  const queue = [start];
  seen.set(start, true);
  for (let h = 0; h < queue.length; h++) {
    for (const nb of queue[h].neighbors) if (!seen.has(nb)) { seen.set(nb, true); queue.push(nb); }
  }
  return queue.sort((a, b) => a.val - b.val).map((x) => x.neighbors.map((n) => n.val));
}

const original = fromAdjList([[2, 4], [1, 3], [2, 4], [1, 3]]);
const copy = cloneGraph(original);
console.log(toAdjList(copy));        // [ [ 2, 4 ], [ 1, 3 ], [ 2, 4 ], [ 1, 3 ] ]
console.log(copy !== original);      // true
console.log(toAdjList(cloneGraph(fromAdjList([[]])))); // [ [] ]`,
            explain: <p>It takes O(V + E) time and space (the Map, plus recursion up to V levels deep). We save the copy before visiting its neighbours. That stops the recursion from running forever on cycles.</p>,
          },
          {
            name: "BFS with a Map",
            idea: <p>Copy the start and put it in the queue. For each original node you take out of the queue, make sure each neighbour has a copy. If a neighbour is new, create its copy and queue it. Then connect the copies.</p>,
            code: `class Node {
  constructor(val) { this.val = val; this.neighbors = []; }
}

function cloneGraph(node) {
  if (!node) return null;
  const copies = new Map([[node, new Node(node.val)]]);
  const queue = [node];
  let head = 0;
  while (head < queue.length) {
    const orig = queue[head++];
    for (const nb of orig.neighbors) {
      if (!copies.has(nb)) {
        copies.set(nb, new Node(nb.val));
        queue.push(nb);
      }
      copies.get(orig).neighbors.push(copies.get(nb));
    }
  }
  return copies.get(node);
}

function fromAdjList(adj) {
  const nodes = adj.map((_, i) => new Node(i + 1));
  adj.forEach((nbs, i) => { nodes[i].neighbors = nbs.map((v) => nodes[v - 1]); });
  return nodes[0];
}
function toAdjList(start) {
  const seen = new Set([start]);
  const queue = [start];
  for (let h = 0; h < queue.length; h++) {
    for (const nb of queue[h].neighbors) if (!seen.has(nb)) { seen.add(nb); queue.push(nb); }
  }
  return queue.sort((a, b) => a.val - b.val).map((x) => x.neighbors.map((n) => n.val));
}

const original = fromAdjList([[2, 4], [1, 3], [2, 4], [1, 3]]);
const copy = cloneGraph(original);
console.log(toAdjList(copy));    // [ [ 2, 4 ], [ 1, 3 ], [ 2, 4 ], [ 1, 3 ] ]
console.log(copy !== original);  // true`,
            explain: <p>It is also O(V + E), without deep recursion. Every original neighbour list is walked once. Each step adds one entry to the copy&apos;s list, in the same order.</p>,
          },
        ]}
        compare={<p>Both are fine. BFS avoids problems with deep recursion. Be ready to explain what the Map is for. (LeetCode 133.)</p>}
      >
        <p>
          You get one node of a connected undirected graph. Each node has a <code>val</code> and a list of <code>neighbors</code>. Return a deep copy of the whole graph (a full copy that shares nothing with the original).
        </p>
      </Problem>

      <Problem
        n={6}
        title="Max area of island"
        level="Medium"
        examples={[
          { input: "grid = [[0,1,1,0],[0,1,0,0],[1,0,0,1]]", output: "3", why: "The island of three cells in the top-left has area 3. The others have area 1." },
          { input: "grid = [[0,0,0]]", output: "0", why: "There is no land." },
        ]}
        hints={[
          <>This is Number of Islands, but each traversal also counts the cells it visits.</>,
          <>Let the DFS return the size of the island: 1, plus the sizes it finds through each neighbour.</>,
        ]}
        approaches={[
          {
            name: "DFS that returns the area",
            idea: <p>At each land cell you have not visited, run a DFS that returns 1 plus the area it can reach through its neighbours. Keep the largest result.</p>,
            code: `function maxAreaOfIsland(grid) {
  const rows = grid.length, cols = grid[0].length;
  function area(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== 1) return 0;
    grid[r][c] = 0;                          // visited
    return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1);
  }
  let best = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) best = Math.max(best, area(r, c));
  }
  return best;
}

console.log(maxAreaOfIsland([[0, 1, 1, 0], [0, 1, 0, 0], [1, 0, 0, 1]])); // 3
console.log(maxAreaOfIsland([[0, 0, 0]]));                                 // 0`,
            explain: <p>It takes O(rows × cols) time. Water cells return 0 right away, so it is fine to call <code>area</code> on every cell. Cells that were already sunk return 0 when we see them again.</p>,
          },
          {
            name: "BFS with a visited array",
            idea: <p>Explore each island with a queue. The area of the island is the number of cells that were ever in the queue.</p>,
            code: `function maxAreaOfIsland(grid) {
  const rows = grid.length, cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
  let best = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1 || visited[r][c]) continue;
      visited[r][c] = true;
      const queue = [[r, c]];
      let head = 0;
      while (head < queue.length) {
        const [cr, cc] = queue[head++];
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = cr + dr, nc = cc + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1 && !visited[nr][nc]) {
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        }
      }
      best = Math.max(best, queue.length);     // every cell of the island went through the queue
    }
  }
  return best;
}

console.log(maxAreaOfIsland([[0, 1, 1, 0], [0, 1, 0, 0], [1, 0, 0, 1]])); // 3
console.log(maxAreaOfIsland([[0, 0, 0]]));                                 // 0`,
            explain: <p>It takes O(rows × cols) time and space. It does not change the input, and it has no recursion limit.</p>,
          },
        ]}
        compare={<p>The recursive DFS is the shortest. (LeetCode 695.)</p>}
      >
        <p>
          In a grid of 0s (water) and 1s (land), return the area (number of cells) of the biggest island. Return 0 if there is no island.
        </p>
      </Problem>

      <Problem
        n={7}
        title="Pacific Atlantic water flow"
        level="Medium"
        examples={[
          {
            input: "heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]",
            output: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
            why: "Water flows to a neighbour with the same or lower height. The Pacific Ocean touches the top and left edges. The Atlantic Ocean touches the bottom and right edges. These cells can send water to both.",
          },
          { input: "heights = [[1]]", output: "[[0,0]]", why: "The single cell touches both oceans." },
        ]}
        hints={[
          <>Brute force: for every cell, search where the water can flow. Does it reach the top or left edge, and the bottom or right edge?</>,
          <>Turn the question around. Start at the ocean edge and climb uphill. From which cells can water reach the Pacific?</>,
          <>Do this once for each ocean. Keep the cells that are in both results.</>,
        ]}
        approaches={[
          {
            name: "Search from every cell",
            idea: <p>For each cell, run a DFS that only goes to the same or lower heights. Record whether it touched a Pacific edge and an Atlantic edge.</p>,
            code: `function pacificAtlantic(heights) {
  const rows = heights.length, cols = heights[0].length;
  const result = [];
  for (let r0 = 0; r0 < rows; r0++) {
    for (let c0 = 0; c0 < cols; c0++) {
      const seen = new Set();
      let pacific = false, atlantic = false;
      const stack = [[r0, c0]];
      seen.add(r0 * cols + c0);
      while (stack.length) {
        const [r, c] = stack.pop();
        if (r === 0 || c === 0) pacific = true;
        if (r === rows - 1 || c === cols - 1) atlantic = true;
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (heights[nr][nc] > heights[r][c] || seen.has(nr * cols + nc)) continue;   // water cannot flow uphill
          seen.add(nr * cols + nc);
          stack.push([nr, nc]);
        }
      }
      if (pacific && atlantic) result.push([r0, c0]);
    }
  }
  return result;
}

console.log(pacificAtlantic([[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]])); // [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]
console.log(pacificAtlantic([[1]])); // [[0,0]]`,
            explain: <p>It is correct, but each cell starts its own O(rows × cols) search. So the total is O((rows × cols)²).</p>,
          },
          {
            name: "Search uphill from each ocean",
            idea: <p>Start from all cells along the Pacific edges. Move to neighbours that have the same height or a higher one (the opposite of how water flows). Mark everything you reach. Do the same for the Atlantic edges. The answer is the cells marked by both.</p>,
            code: `function pacificAtlantic(heights) {
  const rows = heights.length, cols = heights[0].length;

  function reach(starts) {
    const seen = Array.from({ length: rows }, () => new Array(cols).fill(false));
    const queue = [];
    for (const [r, c] of starts) { seen[r][c] = true; queue.push([r, c]); }
    let head = 0;
    while (head < queue.length) {
      const [r, c] = queue[head++];
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) continue;
        if (heights[nr][nc] < heights[r][c]) continue;       // water could not flow from there down to here
        seen[nr][nc] = true;
        queue.push([nr, nc]);
      }
    }
    return seen;
  }

  const pacificStarts = [], atlanticStarts = [];
  for (let r = 0; r < rows; r++) { pacificStarts.push([r, 0]); atlanticStarts.push([r, cols - 1]); }
  for (let c = 0; c < cols; c++) { pacificStarts.push([0, c]); atlanticStarts.push([rows - 1, c]); }

  const pac = reach(pacificStarts), atl = reach(atlanticStarts);
  const result = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) if (pac[r][c] && atl[r][c]) result.push([r, c]);
  }
  return result;
}

console.log(pacificAtlantic([[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]])); // [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]
console.log(pacificAtlantic([[1]])); // [[0,0]]`,
            explain: <p>There are two multi-source searches, each O(rows × cols), plus one pass to combine them. We run the flow backwards from the ocean. This turns &quot;many cells each search for the sea&quot; into &quot;the sea searches once for all cells&quot;. Walking uphill is allowed when the next height is the same as or greater than the current one.</p>,
          },
        ]}
        compare={<p>Use the reverse search. The same &quot;start from the destination&quot; trick appears in many grid problems. (LeetCode 417.)</p>}
      >
        <p>
          A grid of heights is an island. The Pacific Ocean touches its top and left edges, and the Atlantic Ocean touches its bottom and right edges. Rain on a cell flows to a neighbour whose height is the same or lower. Return every cell from which water can reach both oceans.
        </p>
      </Problem>
    </>
  );
}
