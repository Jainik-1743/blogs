import Problem from "@/components/dsa/Problem";

/** Lesson 49 practice questions: modelling problems as graphs. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Find center of star graph"
        level="Easy"
        examples={[
          { input: "edges = [[1, 2], [2, 3], [4, 2]]", output: "2", why: "Vertex 2 is connected to 1, 3 and 4." },
          { input: "edges = [[1, 2], [5, 1], [1, 3], [1, 4]]", output: "1", why: "Vertex 1 touches every edge." },
        ]}
        hints={[
          <>In a star, the centre has an edge to every other vertex. What is its degree?</>,
          <>Every edge contains the centre. So what must two different edges have in common?</>,
        ]}
        approaches={[
          {
            name: "Count degrees",
            idea: <p>Count how many edges touch each vertex. The centre touches all of them, so its degree is the number of edges.</p>,
            code: `function findCenter(edges) {
  const degree = new Map();
  for (const [a, b] of edges) {
    degree.set(a, (degree.get(a) ?? 0) + 1);
    degree.set(b, (degree.get(b) ?? 0) + 1);
  }
  for (const [v, d] of degree) if (d === edges.length) return v;
}

console.log(findCenter([[1, 2], [2, 3], [4, 2]]));         // 2
console.log(findCenter([[1, 2], [5, 1], [1, 3], [1, 4]])); // 1`,
            explain: <p>O(E) time and O(V) space. This is the general &quot;find the vertex with a given degree&quot; pattern.</p>,
          },
          {
            name: "Compare the first two edges",
            idea: <p>The centre is in every edge, so it is the one vertex shared by the first two edges.</p>,
            code: `function findCenter(edges) {
  const [a, b] = edges[0];
  const [c, d] = edges[1];
  return a === c || a === d ? a : b;
}

console.log(findCenter([[1, 2], [2, 3], [4, 2]]));         // 2
console.log(findCenter([[1, 2], [5, 1], [1, 3], [1, 4]])); // 1`,
            explain: <p>O(1). The two edges are different, so they share exactly one vertex, and that vertex must be the centre. If <code>a</code> is in the second edge it is the shared vertex; otherwise <code>b</code> must be.</p>,
          },
        ]}
        compare={<p>Take the first two edges for the shortest answer, but know the degree count, since it works whenever you need a vertex of a particular degree. (LeetCode 1791.)</p>}
      >
        <p>
          A star graph has one centre vertex connected to every other vertex, and nothing else. Given its edges (vertices are
          labelled 1 to n), return the centre.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Find the town judge"
        level="Easy"
        examples={[
          { input: "n = 2, trust = [[1, 2]]", output: "2", why: "Person 1 trusts 2; 2 trusts nobody." },
          { input: "n = 3, trust = [[1, 3], [2, 3]]", output: "3", why: "Everyone else trusts 3, and 3 trusts nobody." },
          { input: "n = 3, trust = [[1, 3], [2, 3], [3, 1]]", output: "-1", why: "3 trusts someone, so 3 cannot be the judge." },
        ]}
        hints={[
          <>Draw an arrow a to b for &quot;a trusts b&quot;. A directed graph! What are the judge&apos;s in-degree and out-degree?</>,
          <>The judge has in-degree n − 1 and out-degree 0. Can you track both numbers in one array?</>,
        ]}
        approaches={[
          {
            name: "Adjacency matrix, check every person",
            idea: <p>Store who trusts whom in an n × n matrix. For each candidate, check that they trust nobody and that everyone else trusts them.</p>,
            code: `function findJudge(n, trust) {
  const m = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(false));
  for (const [a, b] of trust) m[a][b] = true;
  for (let p = 1; p <= n; p++) {
    let ok = true;
    for (let q = 1; q <= n && ok; q++) {
      if (q === p) continue;
      if (m[p][q] || !m[q][p]) ok = false;   // p trusts someone, or someone does not trust p
    }
    if (ok) return p;
  }
  return -1;
}

console.log(findJudge(2, [[1, 2]]));                   // 2
console.log(findJudge(3, [[1, 3], [2, 3]]));           // 3
console.log(findJudge(3, [[1, 3], [2, 3], [3, 1]]));   // -1`,
            explain: <p>O(n² + E) time and O(n²) space. Correct, but the matrix is far more than the problem needs.</p>,
          },
          {
            name: "One score per person",
            idea: <p>Give each person a score: +1 for every person who trusts them, −1 for every person they trust. The judge is the only one who can reach n − 1.</p>,
            code: `function findJudge(n, trust) {
  const score = new Array(n + 1).fill(0);
  for (const [a, b] of trust) {
    score[a]--;     // a trusts someone: out-degree up, so a can never be the judge
    score[b]++;     // b is trusted: in-degree up
  }
  for (let p = 1; p <= n; p++) if (score[p] === n - 1) return p;
  return -1;
}

console.log(findJudge(2, [[1, 2]]));                   // 2
console.log(findJudge(3, [[1, 3], [2, 3]]));           // 3
console.log(findJudge(3, [[1, 3], [2, 3], [3, 1]]));   // -1
console.log(findJudge(1, []));                         // 1`,
            explain: <p>The score is in-degree minus out-degree. The most in-degree anyone can have is n − 1, and reaching n − 1 with a score requires out-degree 0 (the pairs are distinct, so there are no duplicate edges to inflate it). O(n + E) time, O(n) space. For n = 1 the lone person has score 0 = n − 1, so the answer is 1.</p>,
          },
        ]}
        compare={<p>The score array: one pass, one array. (LeetCode 997.)</p>}
      >
        <p>
          In a town of <code>n</code> people labelled 1 to n, there may be a secret judge. The judge trusts nobody, and everybody
          else trusts the judge. Each <code>[a, b]</code> in <code>trust</code> means a trusts b. Return the judge&apos;s label, or −1 if there is no judge.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Find if path exists in graph"
        level="Easy"
        examples={[
          { input: "n = 3, edges = [[0, 1], [1, 2], [2, 0]], source = 0, destination = 2", output: "true", why: "0 to 2 directly (the edge 2 - 0 is undirected), or via 1." },
          { input: "n = 6, edges = [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], source = 0, destination = 5", output: "false", why: "{0, 1, 2} and {3, 4, 5} are different components." },
        ]}
        hints={[
          <>Build the adjacency list first, with both directions for every edge.</>,
          <>Walk from the source, never revisiting a vertex. Did you reach the destination?</>,
          <>Edge cases: source equal to destination is always true.</>,
        ]}
        approaches={[
          {
            name: "Grow the reachable set until nothing changes",
            idea: <p>Start with the source reachable. Sweep over the edge list again and again: whenever an edge has one reachable end, mark the other end reachable. Stop when a sweep changes nothing.</p>,
            code: `function validPath(n, edges, source, destination) {
  const reach = new Array(n).fill(false);
  reach[source] = true;
  let changed = true;
  while (changed) {
    changed = false;
    for (const [a, b] of edges) {
      if (reach[a] && !reach[b]) { reach[b] = true; changed = true; }
      else if (reach[b] && !reach[a]) { reach[a] = true; changed = true; }
    }
  }
  return reach[destination];
}

console.log(validPath(3, [[0, 1], [1, 2], [2, 0]], 0, 2));                          // true
console.log(validPath(6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5));          // false`,
            explain: <p>No graph structure needed, but each sweep costs O(E) and there can be up to V sweeps, so O(V · E) in the worst case. Too slow for big inputs.</p>,
          },
          {
            name: "DFS over an adjacency list",
            idea: <p>Build the adjacency list, then walk from the source with a visited array, returning true as soon as the destination is reached.</p>,
            code: `function validPath(n, edges, source, destination) {
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a); }
  const seen = new Array(n).fill(false);
  const stack = [source];                 // an explicit stack avoids deep recursion
  seen[source] = true;
  while (stack.length) {
    const v = stack.pop();
    if (v === destination) return true;
    for (const next of graph[v]) {
      if (!seen[next]) { seen[next] = true; stack.push(next); }
    }
  }
  return false;
}

console.log(validPath(3, [[0, 1], [1, 2], [2, 0]], 0, 2));                          // true
console.log(validPath(6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5));          // false
console.log(validPath(1, [], 0, 0));                                                // true`,
            explain: <p>O(V + E) time and space. Each vertex is pushed at most once (it is marked seen when pushed). Lesson 50 explains the stack and queue versions; later, union-find (lesson 53) answers many such queries on one graph.</p>,
          },
        ]}
        compare={<p>The walk over an adjacency list. BFS or recursive DFS work equally well. (LeetCode 1971.)</p>}
      >
        <p>
          There is an undirected graph with <code>n</code> vertices labelled 0 to n − 1, given as an edge list. Return whether there
          is a path from <code>source</code> to <code>destination</code>.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Island perimeter"
        level="Easy"
        examples={[
          { input: "grid = [[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]]", output: "16", why: "7 land cells, 4 sides each, minus 2 for each of the 6 shared sides: 28 − 12 = 16." },
          { input: "grid = [[1]]", output: "4", why: "A single cell has four exposed sides." },
          { input: "grid = [[1, 0]]", output: "4", why: "The water cell next to it does not add or remove anything." },
        ]}
        hints={[
          <>Look at one land cell. Which of its four sides are part of the perimeter?</>,
          <>A side counts if its neighbour is water or off the grid. That is the grid-neighbour loop from this lesson.</>,
        ]}
        approaches={[
          {
            name: "Check four neighbours of every land cell",
            idea: <p>For each land cell, count the sides whose neighbour is out of bounds or water.</p>,
            code: `function islandPerimeter(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let perimeter = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1) continue;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] === 0) perimeter++;
      }
    }
  }
  return perimeter;
}

console.log(islandPerimeter([[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]])); // 16
console.log(islandPerimeter([[1]]));    // 4
console.log(islandPerimeter([[1, 0]])); // 4`,
            explain: <p>O(rows × cols). No traversal needed, since there is exactly one island; we just inspect each cell&apos;s neighbours.</p>,
          },
          {
            name: "Cells × 4 minus shared sides",
            idea: <p>Every land cell contributes 4 sides, and each pair of adjacent land cells hides 2 sides (one from each). Count land cells, and count adjacent pairs by looking only right and down so no pair is counted twice.</p>,
            code: `function islandPerimeter(grid) {
  let land = 0, pairs = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] !== 1) continue;
      land++;
      if (r + 1 < grid.length && grid[r + 1][c] === 1) pairs++;
      if (c + 1 < grid[0].length && grid[r][c + 1] === 1) pairs++;
    }
  }
  return 4 * land - 2 * pairs;
}

console.log(islandPerimeter([[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]])); // 16
console.log(islandPerimeter([[1]])); // 4`,
            explain: <p>Same O(rows × cols), half the neighbour checks. In the first example: 7 land cells and 6 adjacent pairs give 28 − 12 = 16.</p>,
          },
        ]}
        compare={<p>Either is fine; the second shows the &quot;count vertices and edges&quot; view of a grid graph. (LeetCode 463.)</p>}
      >
        <p>
          A grid has <code>1</code> for land and <code>0</code> for water, and contains exactly one island (land cells connected
          sideways) with no lakes inside it. Cells outside the grid count as water. Return the island&apos;s perimeter.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Maximal network rank"
        level="Medium"
        examples={[
          { input: "n = 4, roads = [[0,1],[0,3],[1,2],[1,3]]", output: "4", why: "Cities 1 and 3: city 1 has 3 roads, city 3 has 2, and they share one road, so 3 + 2 − 1 = 4." },
          { input: "n = 5, roads = [[0,1],[0,3],[1,2],[1,3],[2,3],[2,4]]", output: "5", why: "Cities 1 and 2 (or 2 and 3): 3 + 3 − 1 = 5." },
          { input: "n = 8, roads = [[0,1],[1,2],[2,3],[2,4],[5,6],[5,7]]", output: "5", why: "Cities 2 and 5: 3 + 2 roads and no road between them." },
        ]}
        hints={[
          <>The network rank of a pair is the number of roads touching either city. The degrees help.</>,
          <>degree(a) + degree(b) counts the road between a and b twice, if there is one. How do you fix that?</>,
          <>Store the roads in a Set (or matrix) so you can ask &quot;is there a road a - b?&quot; in O(1).</>,
        ]}
        approaches={[
          {
            name: "For every pair, scan all roads",
            idea: <p>For each pair of cities, loop over the road list and count roads that touch at least one of them.</p>,
            code: `function maximalNetworkRank(n, roads) {
  let best = 0;
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      let count = 0;
      for (const [x, y] of roads) if (x === a || x === b || y === a || y === b) count++;
      best = Math.max(best, count);
    }
  }
  return best;
}

console.log(maximalNetworkRank(4, [[0, 1], [0, 3], [1, 2], [1, 3]])); // 4`,
            explain: <p>O(n² · E). Clear, but slow, since it re-reads every road for every pair.</p>,
          },
          {
            name: "Degrees plus an adjacency matrix",
            idea: <p>Compute each city&apos;s degree and a matrix of direct roads. The rank of a pair is <code>deg[a] + deg[b]</code>, minus 1 if the two are directly connected.</p>,
            code: `function maximalNetworkRank(n, roads) {
  const deg = new Array(n).fill(0);
  const linked = Array.from({ length: n }, () => new Array(n).fill(false));
  for (const [a, b] of roads) {
    deg[a]++; deg[b]++;
    linked[a][b] = linked[b][a] = true;
  }
  let best = 0;
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      best = Math.max(best, deg[a] + deg[b] - (linked[a][b] ? 1 : 0));
    }
  }
  return best;
}

console.log(maximalNetworkRank(4, [[0, 1], [0, 3], [1, 2], [1, 3]]));                       // 4
console.log(maximalNetworkRank(5, [[0, 1], [0, 3], [1, 2], [1, 3], [2, 3], [2, 4]]));       // 5
console.log(maximalNetworkRank(8, [[0, 1], [1, 2], [2, 3], [2, 4], [5, 6], [5, 7]]));       // 5`,
            explain: <p>O(n² + E) time and O(n²) space. This is exactly the case where the matrix&apos;s O(1) edge test pays off. The matrix gives the O(1) answer to &quot;are they directly connected?&quot;.</p>,
          },
        ]}
        compare={<p>Degrees plus the matrix. (LeetCode 1615.)</p>}
      >
        <p>
          There are <code>n</code> cities and a list of two-way roads. The <em>network rank</em> of two different cities is the
          total number of roads connected to either of them (a road joining both counts once). Return the maximum network rank over all pairs.
        </p>
      </Problem>

      <Problem
        n={6}
        title="Restore the array from adjacent pairs"
        level="Medium"
        examples={[
          { input: "adjacentPairs = [[2, 1], [3, 4], [3, 2]]", output: "[1, 2, 3, 4]", why: "The original array is 1, 2, 3, 4. (The reverse is also accepted.)" },
          { input: "adjacentPairs = [[4, -2], [1, 4], [-3, 1]]", output: "[-2, 4, 1, -3]", why: "-2 and -3 appear once, so they are the ends." },
        ]}
        hints={[
          <>Each pair is an edge between two neighbouring values. The whole array is a path graph.</>,
          <>In a path, the two ends have degree 1 and everyone else has degree 2.</>,
          <>Start at an end and keep stepping to the neighbour you did not come from.</>,
        ]}
        approaches={[
          {
            name: "Try each start and search the pairs",
            idea: <p>Try every value as the start. From the last value placed, scan the pair list for an unused pair containing it, and append the other value. If the result has n values, the start was an end.</p>,
            code: `function restoreArray(pairs) {
  const n = pairs.length + 1;
  const values = [...new Set(pairs.flat())];
  for (const start of values) {
    const used = new Array(pairs.length).fill(false);
    const out = [start];
    let extended = true;
    while (extended) {
      extended = false;
      const last = out[out.length - 1];
      for (let i = 0; i < pairs.length; i++) {
        if (used[i]) continue;
        if (pairs[i][0] === last) { out.push(pairs[i][1]); used[i] = true; extended = true; break; }
        if (pairs[i][1] === last) { out.push(pairs[i][0]); used[i] = true; extended = true; break; }
      }
    }
    if (out.length === n) return out;
  }
}

console.log(restoreArray([[2, 1], [3, 4], [3, 2]]));     // [ 1, 2, 3, 4 ]
console.log(restoreArray([[4, -2], [1, 4], [-3, 1]]));   // [ -2, 4, 1, -3 ]`,
            explain: <p>Starting in the middle only extends one way and ends up short, so only an end gives all n values. Each attempt is O(n²), and there are up to n attempts: O(n³). Fine as a first idea, hopeless for large n.</p>,
          },
          {
            name: "Adjacency list, then walk from an end",
            idea: <p>Build a Map from each value to its neighbours. Pick a value with exactly one neighbour as the start. Then repeatedly move to the neighbour that is not the previous value.</p>,
            code: `function restoreArray(pairs) {
  const graph = new Map();
  for (const [a, b] of pairs) {
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    graph.get(a).push(b);
    graph.get(b).push(a);
  }
  let start;
  for (const [v, nbrs] of graph) if (nbrs.length === 1) { start = v; break; }
  const out = [start];
  let prev = null, cur = start;
  while (out.length < graph.size) {
    const next = graph.get(cur).find((x) => x !== prev);   // the neighbour we did not just come from
    out.push(next);
    prev = cur;
    cur = next;
  }
  return out;
}

console.log(restoreArray([[2, 1], [3, 4], [3, 2]]));     // [ 1, 2, 3, 4 ]
console.log(restoreArray([[4, -2], [1, 4], [-3, 1]]));   // [ -2, 4, 1, -3 ]`,
            explain: <p>O(n) time and space. The values are all distinct (the original array&apos;s elements are unique), so &quot;the neighbour that is not prev&quot; is unambiguous.</p>,
          },
        ]}
        compare={<p>The adjacency list. Recognising a path graph and starting at a degree-1 vertex is the key step. (LeetCode 1743.)</p>}
      >
        <p>
          An array of <code>n</code> distinct values was lost, but you are given every pair of values that were next to each other
          in it, in any order and in either orientation. Rebuild the array (either direction is accepted).
        </p>
      </Problem>

      <Problem
        n={7}
        title="Find champion"
        level="Easy"
        examples={[
          { input: "grid = [[0, 1], [0, 0]]", output: "0", why: "grid[0][1] = 1 means team 0 is stronger than team 1." },
          { input: "grid = [[0, 0, 1], [1, 0, 1], [0, 0, 0]]", output: "1", why: "Team 1 beats 0 and 2, and nobody beats team 1." },
        ]}
        hints={[
          <>Treat <code>grid[i][j] = 1</code> as a directed edge i to j (&quot;i is stronger than j&quot;). The champion is a vertex nobody points to.</>,
          <>For every pair exactly one of grid[a][b], grid[b][a] is 1, and the ranking has no cycles, so exactly one champion exists.</>,
          <>Can you eliminate a candidate with a single comparison?</>,
        ]}
        approaches={[
          {
            name: "Check each column for an incoming edge",
            idea: <p>A team is the champion when no team is stronger, meaning its column has no 1.</p>,
            code: `function findChampion(grid) {
  const n = grid.length;
  for (let team = 0; team < n; team++) {
    let beaten = false;
    for (let other = 0; other < n; other++) {
      if (grid[other][team] === 1) { beaten = true; break; }   // an edge other -> team
    }
    if (!beaten) return team;
  }
  return -1;
}

console.log(findChampion([[0, 1], [0, 0]]));                    // 0
console.log(findChampion([[0, 0, 1], [1, 0, 1], [0, 0, 0]]));   // 1`,
            explain: <p>O(n²): this is &quot;find the vertex with in-degree 0&quot; on an adjacency matrix.</p>,
          },
          {
            name: "Keep a candidate, eliminate with one comparison",
            idea: <p>Start with team 0. For each next team <code>i</code>: if i beats the candidate, the candidate is out and i takes over. Otherwise the candidate beats i (someone must), so i is out.</p>,
            code: `function findChampion(grid) {
  let champ = 0;
  for (let i = 1; i < grid.length; i++) {
    if (grid[i][champ] === 1) champ = i;   // i is stronger, so the old candidate cannot be champion
  }
  return champ;
}

console.log(findChampion([[0, 1], [0, 0]]));                    // 0
console.log(findChampion([[0, 0, 1], [1, 0, 1], [0, 0, 0]]));   // 1`,
            explain: <p>Only O(n) cells are read. Every comparison eliminates exactly one team, and the true champion is never eliminated because nobody beats it. This relies on the guarantee that every pair has a winner.</p>,
          },
        ]}
        compare={<p>The elimination scan is the cleverest; the column check is the safest to explain first. (LeetCode 2923.)</p>}
      >
        <p>
          There are <code>n</code> teams in a tournament. In an n × n matrix, <code>grid[i][j] = 1</code> means team i is stronger than
          team j, and for any two different teams exactly one of <code>grid[i][j]</code>, <code>grid[j][i]</code> is 1; there are no cycles of strength.
          Return the champion: the team no other team is stronger than.
        </p>
      </Problem>
    </>
  );
}
