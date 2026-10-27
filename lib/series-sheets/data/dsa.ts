import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "dsa" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "Complexity tables, the patterns with the signal that tells you when to use each, short JavaScript templates and the traps. Read the signal in the problem, name the pattern, then write the template.",
  sections: [
    {
      title: "Big-O and size limits",
      lesson: 12,
      blocks: [
        {
          kind: "table",
          head: ["Big-O", "Typical"],
          rows: [
            ["O(1)", "`arr[i]`, Map `get`"],
            ["O(log n)", "Halve each step"],
            ["O(n)", "One loop"],
            ["O(n log n)", "Good sorting"],
            ["O(n²)", "Loop in a loop"],
            ["O(2ⁿ)", "Every subset"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["includes, indexOf, find", "O(n) hidden loop"],
            ["shift, unshift, splice", "O(n): items move"],
            ["slice, spread, concat", "O(n): copies"],
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["n ≤ 20", "2ⁿ is fine (n ≤ 10: n!)"],
            ["n ≤ 5,000", "n² is fine (n ≤ 500: n³)"],
            ["n ≤ 10⁶", "n log n or n"],
            ["n ≥ 10⁹", "log n or O(1)"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "About 10⁸ simple steps per second. Sequential loops add, nested loops multiply. Quote the worst case.",
        },
      ],
    },
    {
      title: "Maths and recursion",
      lesson: 13,
      blocks: [
        {
          kind: "points",
          items: [
            "Digit loop (`n % 10`, `Math.floor(n / 10)`) is O(log n). Divisors come in pairs, so loop while `i * i <= n`: O(√n). 0 and 1 are not prime.",
            "**Sieve**: all primes up to n in O(n log log n). Euclid gcd and fast power: O(log n).",
            "Recursion needs a **base case**, a smaller call and progress. Space is O(depth).",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Plain `fib(30)` makes about 2.7 million calls. A memo makes 59.",
        },
      ],
    },
    {
      title: "Sorting",
      lesson: 17,
      blocks: [
        {
          kind: "table",
          head: ["Sort", "Best / worst", "Space", "Stable"],
          rows: [
            ["Selection", "n² / n²", "O(1)", "No"],
            ["Bubble (early exit)", "n / n²", "O(1)", "Yes"],
            ["Insertion", "n / n²", "O(1)", "Yes"],
            ["Merge", "n log n / n log n", "O(n)", "Yes"],
            ["Quick (random pivot)", "n log n / n² rare", "O(log n)", "No"],
          ],
        },
        {
          kind: "points",
          items: [
            "Merge: `a[i] <= b[j]` keeps it stable. Merging two sorted arrays is O(n + m).",
            "**Quickselect** finds the k-th item in O(n) average.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`sort()` with no comparator sorts as text (\"100\" before \"9\"). Use `(a, b) => a - b`, never a boolean.",
        },
      ],
    },
    {
      title: "Prefix sums, Kadane, in place",
      lesson: 20,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["Range sum l..r", "`pre[r + 1] - pre[l]`, `pre` starts with 0"],
            ["Subarray sums to k", "Count earlier prefix sums equal `sum - k`"],
            ["Kadane", "`cur = max(x, cur + x)`; answer is the best `cur`"],
            ["In place (dedupe, zeros)", "Read and write pointers, O(1) space"],
            ["Rotate right by k", "Reverse all, then each part; `k % n`"],
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "const seen = new Map([[0, 1]]);\nlet sum = 0, count = 0;\nfor (const x of nums) {\n  sum += x;\n  count += seen.get(sum - k) ?? 0;\n  seen.set(sum, (seen.get(sum) ?? 0) + 1);\n}",
          note: "Works with negatives.",
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Start Kadane at `nums[0]`, not 0, or all-negative input returns 0.",
        },
      ],
    },
    {
      title: "Two pointers",
      lesson: 21,
      blocks: [
        {
          kind: "table",
          head: ["Form", "Use for"],
          rows: [
            ["Opposite ends (sorted)", "Pair sum, 3Sum, container, palindrome"],
            ["Same direction", "Remove duplicates, subsequence check"],
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "let l = 0, r = nums.length - 1;\nwhile (l < r) {\n  const s = nums[l] + nums[r];\n  if (s === target) return [l, r];\n  if (s < target) l++; else r--;\n}",
        },
        {
          kind: "points",
          items: [
            "3Sum: sort, fix one value, two pointers on the rest. O(n²).",
            "Container: move the **shorter** line inwards.",
          ],
        },
      ],
    },
    {
      title: "Sliding window and strings",
      lesson: 23,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code: "let l = 0;\nfor (let r = 0; r < n; r++) {\n  add(nums[r]);\n  while (invalid())\n    remove(nums[l++]);\n  best = Math.max(best, r - l + 1);\n}",
          note: "O(n): l and r never move back, at most 2n steps.",
        },
        {
          kind: "table",
          head: ["Window", "Longest", "Shortest"],
          rows: [
            ["Shrink while", "invalid", "valid"],
            ["Record", "after loop", "inside loop"],
            ["best starts at", "0", "Infinity"],
          ],
        },
        {
          kind: "points",
          items: [
            "Fixed size k: drop `nums[i - k]` when `i >= k`, use the window when `i >= k - 1`.",
            "Exactly k = atMost(k) − atMost(k − 1). Count windows by adding `r - l + 1`.",
            "Strings are immutable: `join` once. Longest palindrome: expand around 2n − 1 centres, O(n²).",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Windows need non-negative values. With negatives use prefix sums and a Map.",
        },
      ],
    },
    {
      title: "Hashing patterns",
      lesson: 26,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code: "const seen = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const j = seen.get(target - nums[i]);\n  if (j !== undefined) return [j, i];\n  seen.set(nums[i], i); // then store\n}",
          note: "Pairs O(n²), sort + pointers O(n log n), Map O(n) time and space.",
        },
        {
          kind: "points",
          items: [
            "Count: `freq.set(x, (freq.get(x) ?? 0) + 1)`. Fixed range: counting array.",
            "Anagram key: sorted letters or `counts.join(\",\")`, never `join(\"\")`. A Map compares arrays by identity.",
            "Top k frequent: count, then buckets by count. Majority: Boyer–Moore vote.",
          ],
        },
      ],
    },
    {
      title: "Binary search",
      lesson: 28,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code: "let lo = 0, hi = nums.length; // [lo, hi)\nwhile (lo < hi) {\n  const mid = (lo + hi) >> 1;\n  if (nums[mid] < target) lo = mid + 1;\n  else hi = mid;\n}\nreturn lo; // first nums[i] >= target",
        },
        {
          kind: "points",
          items: [
            "Pick one style. Closed `[lo, hi]`: `lo <= hi`, `mid ± 1`. Half-open: `lo < hi`, `hi = mid`.",
            "First / last of x: `lowerBound(x)`, `upperBound(x) - 1`.",
            "Rotated array: one half is sorted. Compare `nums[lo]` with `nums[mid]`.",
          ],
        },
        {
          kind: "steps",
          items: [
            "**On the answer**: set the range `lo..hi` of answers.",
            "Write `works(x)`, one O(n) pass (Koko: sum of `Math.ceil(pile / k)` ≤ h).",
            "Check false…false, true…true. Find the first true: O(n log range).",
          ],
        },
      ],
    },
    {
      title: "Recursion and backtracking",
      lesson: 33,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code: "// n = nums.length\nfunction walk(start, path) {\n  out.push([...path]);  // copy\n  for (let i = start; i < n; i++) {\n    path.push(nums[i]); // choose\n    walk(i + 1, path);  // explore\n    path.pop();         // un-choose\n  }\n}",
        },
        {
          kind: "pairs",
          rows: [
            ["Duplicates", "Sort, skip `i > start && nums[i] === nums[i-1]`"],
            ["Permutations", "Loop from 0 with a `used` array"],
            ["Combination sum", "Recurse with `i` to reuse; prune"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Pushing `path` without copying fills `out` with empty arrays. Forgetting to undo is the most common bug.",
        },
      ],
    },
    {
      title: "Linked lists",
      lesson: 36,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code: "let prev = null, cur = head;\nwhile (cur) {\n  const next = cur.next; // save first\n  cur.next = prev;\n  prev = cur;\n  cur = next;\n}\nreturn prev;",
          note: "O(n) time, O(1) space.",
        },
        {
          kind: "points",
          items: [
            "Insert at head or after a held node is O(1); access index i is O(i). A **dummy head** removes the delete-head special case.",
            "Slow 1 step, fast 2: middle and cycle (Floyd). Cycle start: reset one pointer to head, step both by 1.",
            "n-th from end: send `fast` n ahead, then move both.",
          ],
        },
      ],
    },
    {
      title: "Stacks and queues",
      lesson: 40,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code: "const ans = Array(n).fill(-1);\nconst st = [];\nfor (let i = 0; i < n; i++) {\n  while (st.length &&\n         nums[st.at(-1)] < nums[i])\n    ans[st.pop()] = nums[i];\n  st.push(i);\n}",
          note: "Next greater element. Each index is pushed and popped once: O(n).",
        },
        {
          kind: "points",
          items: [
            "Stack = array with `push` and `pop`. Brackets: closer must match the top; fail on mismatch, empty, leftovers.",
            "Queue: use a **head index**, not `shift()` (O(n)), or BFS turns O(n²).",
            "Min stack: store the minimum beside each item.",
            "Circular array: loop `2n` with `i % n`.",
          ],
        },
      ],
    },
    {
      title: "Trees and BSTs",
      lesson: 43,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code: "function height(node) {\n  if (node === null) return 0; // base case\n  return 1 + Math.max(\n    height(node.left), height(node.right));\n}",
          note: "DFS recipe: base case, trust both calls, combine.",
        },
        {
          kind: "pairs",
          rows: [
            ["BFS level order", "Queue; take `size` first, one level a round"],
            ["BST", "Inorder is sorted. Search, insert, delete O(h)"],
            ["LCA, any tree", "Return null, the target, or the LCA"],
            ["LCA, BST", "Step toward both values until they split"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Validate a BST with min/max bounds: the rule covers the whole subtree. A skewed BST has h = n.",
        },
      ],
    },
    {
      title: "Heaps, greedy and intervals",
      lesson: 46,
      blocks: [
        {
          kind: "points",
          items: [
            "Min-heap: children of `i` are `2i+1`, `2i+2`. Push, pop O(log n), peek O(1). Top k: heap of size k, O(n log k).",
            "**Greedy** needs a proof (exchange argument). Coins 1, 3, 4, amount 6: greedy 4+1+1, best 3+3. Use DP.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "intervals.sort((a, b) => a[0] - b[0]);\nconst out = [intervals[0]];\nfor (const [s, e] of intervals.slice(1)) {\n  const last = out[out.length - 1];\n  if (s <= last[1])\n    last[1] = Math.max(last[1], e);\n  else out.push([s, e]);\n}",
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Touching ranges merge (`<=`); back-to-back meetings do not clash (`<`). Fewest to remove: sort by end.",
        },
      ],
    },
    {
      title: "Graphs and grids",
      lesson: 50,
      blocks: [
        {
          kind: "table",
          head: ["Need", "Tool", "Time"],
          rows: [
            ["Fewest edges, equal costs", "BFS", "O(V + E)"],
            ["Weights, none negative", "Dijkstra + heap", "O((V + E) log V)"],
            ["Negative or at most k edges", "Bellman–Ford", "O(V × E)"],
            ["Prerequisites, find a cycle", "Kahn topological sort", "O(V + E)"],
            ["Are a and b connected?", "Union-find", "about O(1) each"],
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "const q = [start];\nconst seen = new Set([start]);\nfor (let h = 0; h < q.length; h++) {\n  for (const nb of adj[q[h]]) {\n    if (seen.has(nb)) continue;\n    seen.add(nb); // mark on enqueue\n    q.push(nb);\n  }\n}",
        },
        {
          kind: "points",
          items: [
            "Adjacency list O(V + E) is the default; matrix is O(V²). Undirected edges go both ways.",
            "Grid: `DIRS` plus a bounds check. Build rows with `Array.from`, not `fill(row)`. Rotate 90°: transpose, reverse rows.",
          ],
        },
      ],
    },
    {
      title: "Dynamic programming",
      lesson: 55,
      blocks: [
        {
          kind: "steps",
          items: [
            "Say it: \"`dp[i]` means …\". No sentence, no solution.",
            "Base cases. Transition: what was the last decision?",
            "Order: inputs ready first. Memo is top-down, table bottom-up.",
          ],
        },
        {
          kind: "table",
          head: ["Problem", "Transition"],
          rows: [
            ["House robber", "max(skip, rob + best two back)"],
            ["Grid paths", "up + left"],
            ["LCS", "match: diagonal + 1; else max(up, left)"],
            ["0/1 knapsack, one row", "loop capacity high to low"],
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "const dp = Array(amount + 1)\n  .fill(Infinity);\ndp[0] = 0;\nfor (let a = 1; a <= amount; a++)\n  for (const c of coins)\n    if (c <= a && dp[a - c] + 1 < dp[a])\n      dp[a] = dp[a - c] + 1;",
          note: "Answer is -1 when dp[amount] is still Infinity.",
        },
      ],
    },
    {
      title: "Spot the pattern, then interview",
      lesson: 60,
      blocks: [
        {
          kind: "table",
          head: ["The wording says", "Technique"],
          rows: [
            ["Sorted, pair, palindrome", "Two pointers"],
            ["Longest or shortest subarray", "Variable window"],
            ["Range sum, subarray sums to k", "Prefix sums + Map"],
            ["Seen before? count? group?", "Map or Set"],
            ["Minimum x that works", "Binary search on the answer"],
            ["All subsets, arrangements", "Backtracking"],
            ["Prefix lookups", "Trie, O(L)"],
            ["Single number, power of two", "XOR, `n & (n - 1)`"],
            ["Count ways, min cost", "DP"],
          ],
        },
        {
          kind: "steps",
          items: [
            "Clarify. Examples and edge cases aloud.",
            "Brute force first, then find the wasted work.",
            "Code, then dry run a normal and an edge case.",
            "Say time and space unprompted.",
          ],
        },
      ],
    },
  ],
};
