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
          { input: 'grid = [["1","1","0","0"],["1","1","0","0"],["0","0","1","0"],["0","0","0","1"]]', output: "3", why: "A 2×2 block, a single cell at (2,2) and a single cell at (3,3). Diagonal cells do not connect." },
          { input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]', output: "1", why: "All land is connected through the middle column." },
        ]}
        hints={[
          <>An island is a connected component of land cells. How did we count components?</>,
          <>When you find an unseen land cell, add one to the answer and visit its entire island so you never count it again.</>,
          <>How can you mark a cell as visited without a separate Set?</>,
        ]}
        approaches={[
          {
            name: "DFS that sinks the island",
            idea: <p>Scan every cell. At a land cell, count one island, then recursively turn that cell and all connected land into water.</p>,
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
            explain: <p>O(rows × cols) time: every cell is visited a constant number of times. Space is the recursion depth, up to rows × cols for a snake-shaped island. It modifies the input; if that is not allowed, copy the grid first or use a visited array.</p>,
          },
          {
            name: "BFS with a visited array",
            idea: <p>Same scan, but explore each island with a queue and keep the input untouched by using a separate boolean grid. Mark cells when enqueuing.</p>,
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
            explain: <p>O(rows × cols) time and space; the queue is bounded by the island&apos;s perimeter, not its depth, so there is no stack overflow risk. The input stays unchanged.</p>,
          },
        ]}
        compare={<p>Recursive DFS is the shortest to write; use BFS (or an explicit stack) when the grid is large enough for deep recursion to be a worry or you must not modify the input. (LeetCode 200.)</p>}
      >
        <p>
          Given a grid of <code>&quot;1&quot;</code> (land) and <code>&quot;0&quot;</code> (water) characters, count the islands. An
          island is a group of land cells connected horizontally or vertically.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Flood fill"
        level="Easy"
        examples={[
          { input: "image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2", output: "[[2,2,2],[2,2,0],[2,0,1]]", why: "Starting at (1,1), all 1s connected to it become 2. The bottom-right 1 is not connected." },
          { input: "image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, color = 0", output: "[[0,0,0],[0,0,0]]", why: "The new colour equals the old one, so nothing changes." },
        ]}
        hints={[
          <>Start at the given pixel and spread to the four neighbours that share its original colour.</>,
          <>Remember the original colour before painting anything.</>,
          <>What goes wrong when the new colour is the same as the original?</>,
        ]}
        approaches={[
          {
            name: "Recursive DFS",
            idea: <p>Paint the cell, then recurse into each neighbour that still has the old colour.</p>,
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
            explain: <p>O(rows × cols) time. The new colour acts as the visited mark. If it equalled the old colour, painted cells would still look unpainted and the recursion would never end, hence the early return.</p>,
          },
          {
            name: "BFS with a queue",
            idea: <p>Paint the start, queue it, and for each dequeued cell paint-and-enqueue the neighbours that have the old colour.</p>,
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
        image[nr][nc] = color;       // painting at enqueue time = marking visited
        queue.push([nr, nc]);
      }
    }
  }
  return image;
}

console.log(floodFill([[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2)); // [ [ 2, 2, 2 ], [ 2, 2, 0 ], [ 2, 0, 1 ] ]`,
            explain: <p>The same O(rows × cols), with the queue instead of the call stack, so a huge region cannot overflow it.</p>,
          },
        ]}
        compare={<p>Both are equally good; pick the recursion for brevity. (LeetCode 733.)</p>}
      >
        <p>
          An image is a grid of integer colours. Starting at pixel <code>(sr, sc)</code>, recolour that pixel and every pixel connected to it
          (four directions) that shares its original colour, to <code>color</code>. Return the image.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Rotting oranges"
        level="Medium"
        examples={[
          { input: "grid = [[2,1,1],[1,1,0],[0,1,1]]", output: "4", why: "The rot spreads one step per minute; the farthest orange (bottom-right) is reached at minute 4." },
          { input: "grid = [[2,1,1],[0,1,1],[1,0,1]]", output: "-1", why: "The orange at the bottom-left has no path to a rotten one." },
          { input: "grid = [[0,2]]", output: "0", why: "There are no fresh oranges, so no time is needed." },
        ]}
        hints={[
          <>Each minute, every rotten orange infects its fresh neighbours at the same moment. That is a BFS where each level is a minute.</>,
          <>There can be several rotten oranges at the start. Put them all in the queue first.</>,
          <>Count the fresh oranges at the beginning; if any are left at the end, answer −1.</>,
        ]}
        approaches={[
          {
            name: "Simulate minute by minute",
            idea: <p>Repeat: scan the whole grid, rot every fresh orange next to a rotten one (using a copy so one minute is one step). Stop when nothing changes.</p>,
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
            explain: <p>Each minute rescans the entire grid, and there can be up to rows × cols minutes: O((rows × cols)²) in the worst case.</p>,
          },
          {
            name: "Multi-source BFS",
            idea: <p>Queue every rotten orange, then process the queue one level at a time; each level is one minute and every orange is touched once.</p>,
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
            explain: <p>O(rows × cols) time and space. Stopping when <code>fresh</code> hits 0 prevents counting an extra empty minute at the end.</p>,
          },
        ]}
        compare={<p>Multi-source BFS. (LeetCode 994.)</p>}
      >
        <p>
          In a grid, <code>0</code> is empty, <code>1</code> is a fresh orange and <code>2</code> is a rotten orange. Every minute, a
          fresh orange next to a rotten one (four directions) becomes rotten. Return the minutes until no fresh orange remains, or
          −1 if that is impossible.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Number of provinces"
        level="Medium"
        examples={[
          { input: "isConnected = [[1,1,0],[1,1,0],[0,0,1]]", output: "2", why: "Cities 0 and 1 are connected; city 2 stands alone." },
          { input: "isConnected = [[1,0,0],[0,1,0],[0,0,1]]", output: "3", why: "No two cities are connected." },
        ]}
        hints={[
          <>This is an adjacency matrix: <code>isConnected[i][j] = 1</code> means an edge between i and j. A province is a connected component.</>,
          <>Loop over the cities. At an unvisited one, count a province and traverse everything reachable.</>,
        ]}
        approaches={[
          {
            name: "DFS over the matrix",
            idea: <p>For each unvisited city, add one to the count and DFS to every city j with <code>isConnected[city][j] === 1</code>.</p>,
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
            explain: <p>O(n²): each city scans its whole matrix row once. Because the input is a matrix, scanning rows is the neighbour lookup; no list needs to be built.</p>,
          },
          {
            name: "BFS over the matrix",
            idea: <p>The same counting loop, with a queue to explore each province.</p>,
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
            explain: <p>Also O(n²). Union-find (lesson 53) solves the same problem and is the better tool when edges arrive one at a time.</p>,
          },
        ]}
        compare={<p>Either traversal. The key is spotting that &quot;groups of directly or indirectly connected cities&quot; means connected components. (LeetCode 547.)</p>}
      >
        <p>
          There are <code>n</code> cities. <code>isConnected[i][j] = 1</code> means cities i and j are directly connected (and the matrix is
          symmetric). A province is a group of cities connected directly or indirectly. Return the number of provinces.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Clone graph"
        level="Medium"
        examples={[
          { input: "adjList = [[2,4],[1,3],[2,4],[1,3]]", output: "[[2,4],[1,3],[2,4],[1,3]]", why: "Node 1 is joined to 2 and 4, and so on: a square. The clone has the same shape but is made of new nodes." },
          { input: "adjList = [[]]", output: "[[]]", why: "A single node with no neighbours." },
        ]}
        hints={[
          <>You need a new node for each old node, and the new nodes must point at each other, never at the old ones.</>,
          <>A Map from old node to new node tells you whether a node has been copied yet. It is also your visited set.</>,
          <>Create the copy when you first discover a node (before exploring its neighbours) so cycles do not recurse forever.</>,
        ]}
        approaches={[
          {
            name: "Recursive DFS with a Map",
            idea: <p>Clone a node: if it is already in the Map, return its copy. Otherwise create the copy, store it, then clone each neighbour and attach.</p>,
            code: `class Node {
  constructor(val) { this.val = val; this.neighbors = []; }
}

function cloneGraph(node) {
  const copies = new Map();
  function clone(orig) {
    if (!orig) return null;
    if (copies.has(orig)) return copies.get(orig);
    const copy = new Node(orig.val);
    copies.set(orig, copy);                 // register BEFORE recursing, so cycles find it
    for (const nb of orig.neighbors) copy.neighbors.push(clone(nb));
    return copy;
  }
  return clone(node);
}

// helpers to test: node 1..n numbered, adjList[i] holds neighbour values of node i+1
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
            explain: <p>O(V + E) time and space (the Map, plus recursion depth up to V). Registering the copy before visiting its neighbours is what stops infinite recursion on cycles.</p>,
          },
          {
            name: "BFS with a Map",
            idea: <p>Copy the start, queue it. For each dequeued original node, make sure each neighbour has a copy (creating and queueing it if new), then connect the copies.</p>,
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
            explain: <p>The same O(V + E) without deep recursion. Every original neighbour list is walked once, and each adds one entry to the copy&apos;s list, preserving order.</p>,
          },
        ]}
        compare={<p>Both are fine; BFS avoids recursion depth issues. Be ready to explain what the Map is for. (LeetCode 133.)</p>}
      >
        <p>
          Given a reference to a node in a connected undirected graph (each node has a <code>val</code> and a list of <code>neighbors</code>),
          return a deep copy of the whole graph.
        </p>
      </Problem>

      <Problem
        n={6}
        title="Max area of island"
        level="Medium"
        examples={[
          { input: "grid = [[0,1,1,0],[0,1,0,0],[1,0,0,1]]", output: "3", why: "The island of three cells in the top-left has area 3; the others have area 1." },
          { input: "grid = [[0,0,0]]", output: "0", why: "There is no land." },
        ]}
        hints={[
          <>This is Number of Islands where each traversal also counts the cells it visits.</>,
          <>Let the DFS return the size of the island: 1 plus the sizes it finds through each neighbour.</>,
        ]}
        approaches={[
          {
            name: "DFS that returns the area",
            idea: <p>At each unvisited land cell, run a DFS that returns 1 + the area reachable from its neighbours, and keep the maximum.</p>,
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
            explain: <p>O(rows × cols). Water cells return 0 immediately, so calling <code>area</code> on every cell is fine, and sunk cells return 0 on later visits.</p>,
          },
          {
            name: "BFS with a visited array",
            idea: <p>Explore each island with a queue; the island&apos;s area is the number of cells the queue ever held.</p>,
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
      best = Math.max(best, queue.length);     // every cell of the island passed through the queue
    }
  }
  return best;
}

console.log(maxAreaOfIsland([[0, 1, 1, 0], [0, 1, 0, 0], [1, 0, 0, 1]])); // 3
console.log(maxAreaOfIsland([[0, 0, 0]]));                                 // 0`,
            explain: <p>O(rows × cols) time and space, no input mutation and no recursion limit.</p>,
          },
        ]}
        compare={<p>The recursive DFS is the shortest. (LeetCode 695.)</p>}
      >
        <p>
          In a grid of 0s (water) and 1s (land), return the area (number of cells) of the largest island, or 0 if there is none.
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
            why: "Water flows to a neighbour of equal or lower height. The Pacific touches the top and left edges; the Atlantic touches the bottom and right edges. These cells can reach both.",
          },
          { input: "heights = [[1]]", output: "[[0,0]]", why: "The single cell touches both oceans." },
        ]}
        hints={[
          <>Brute force: for every cell, search where water can flow. Does it reach the top/left edge and the bottom/right edge?</>,
          <>Reverse the question: start at the ocean edge and climb uphill. Which cells can water reach the Pacific from?</>,
          <>Do that once for each ocean and keep the cells in both sets.</>,
        ]}
        approaches={[
          {
            name: "Search from every cell",
            idea: <p>For each cell, run a DFS that follows non-increasing heights and records whether it touched a Pacific edge and an Atlantic edge.</p>,
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
          if (heights[nr][nc] > heights[r][c] || seen.has(nr * cols + nc)) continue;   // cannot flow uphill
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
            explain: <p>Correct, but each cell triggers its own O(rows × cols) search, giving O((rows × cols)²).</p>,
          },
          {
            name: "Search uphill from each ocean",
            idea: <p>Start from all cells along the Pacific edges and move to neighbours that are the same height or higher (the reverse of water flow); mark everything reached. Repeat for the Atlantic edges. The answer is the cells marked by both.</p>,
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
            explain: <p>Two multi-source searches, each O(rows × cols), plus one pass to combine them. Running the flow backwards from the ocean turns &quot;many cells each search for the sea&quot; into &quot;the sea searches once for all cells&quot;. Walking uphill is allowed when the next height is greater than or equal to the current one.</p>,
          },
        ]}
        compare={<p>The reverse search. The same &quot;start from the destination&quot; trick appears in many grid problems. (LeetCode 417.)</p>}
      >
        <p>
          A grid of heights is an island. The Pacific Ocean touches its top and left edges, the Atlantic its bottom and right edges.
          Rain on a cell flows to a neighbour whose height is the same or lower. Return every cell from which water can reach both oceans.
        </p>
      </Problem>
    </>
  );
}
