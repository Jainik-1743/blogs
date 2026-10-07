import Problem from "@/components/dsa/Problem";

/** Lesson 43 practice questions: DFS on trees. Trees are written as level-order arrays, null for a missing child. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Balanced binary tree"
        level="Easy"
        examples={[
          { input: "root = [3, 9, 20, null, null, 15, 7]", output: "true", why: "At every node the two subtree heights differ by at most 1." },
          { input: "root = [1, 2, 2, 3, 3, null, null, 4, 4]", output: "false", why: "The left child of the root has height 3, but the right child has height 1: a difference of 2." },
          { input: "root = []", output: "true", why: "An empty tree is balanced." },
        ]}
        hints={[
          <>&quot;Balanced&quot; must hold at <em>every</em> node, not only at the root.</>,
          <>If you call a separate <code>height</code> function at each node, how many times is the same node visited?</>,
          <>Let one function do both jobs: return the height normally, and return -1 as a signal that something below was unbalanced.</>,
        ]}
        approaches={[
          {
            name: "Brute force: recompute heights at every node",
            idea: (
              <ol>
                <li>Write <code>height(node)</code>.</li>
                <li>At each node, compare the heights of its two subtrees.</li>
                <li>Recurse into both children and require them to be balanced too.</li>
              </ol>
            ),
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function isBalanced(root) {
  function height(node) {
    if (node === null) return 0;
    return 1 + Math.max(height(node.left), height(node.right));
  }
  if (root === null) return true;
  if (Math.abs(height(root.left) - height(root.right)) > 1) return false;
  return isBalanced(root.left) && isBalanced(root.right);
}

console.log(isBalanced(buildTree([3, 9, 20, null, null, 15, 7])));          // true
console.log(isBalanced(buildTree([1, 2, 2, 3, 3, null, null, 4, 4])));      // false`,
            explain: <p>Correct, but each node&apos;s subtree is walked again by every ancestor&apos;s height call. O(n log n) on a bushy tree and O(n²) on a chain-like one.</p>,
          },
          {
            name: "Bottom-up with a -1 sentinel",
            idea: (
              <ol>
                <li>Return the height of the subtree, or -1 if any subtree below is unbalanced.</li>
                <li>If either child returns -1, pass -1 up immediately.</li>
                <li>If the two heights differ by more than 1, return -1; otherwise return the height.</li>
                <li>The tree is balanced when the root does not return -1.</li>
              </ol>
            ),
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function isBalanced(root) {
  function check(node) {
    if (node === null) return 0;
    const left = check(node.left);
    if (left === -1) return -1;
    const right = check(node.right);
    if (right === -1) return -1;
    if (Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
  }
  return check(root) !== -1;
}

console.log(isBalanced(buildTree([3, 9, 20, null, null, 15, 7])));          // true
console.log(isBalanced(buildTree([1, 2, 2, 3, 3, null, null, 4, 4])));      // false
console.log(isBalanced(buildTree([])));                                      // true`,
            explain: <p>Each node is visited once, so O(n) time and O(h) space for the recursion. It also stops early: the first problem found travels straight to the root.</p>,
          },
        ]}
        compare={<p>The -1 sentinel version, which is the answer interviewers expect. Mention the slow version first as your starting point, then explain how you removed the repeated work. (LeetCode 110.)</p>}
      >
        <p>A binary tree is <strong>height-balanced</strong> if, for every node, the heights of its left and right subtrees differ by at most 1. Return whether the given tree is height-balanced.</p>
      </Problem>

      <Problem
        n={2}
        title="Diameter of binary tree"
        level="Easy"
        examples={[
          { input: "root = [1, 2, 3, 4, 5]", output: "3", why: "The path 4 → 2 → 1 → 3 has three edges." },
          { input: "root = [1, 2]", output: "1", why: "One edge between the two nodes." },
          { input: "root = [1]", output: "0", why: "A single node has no edges." },
        ]}
        hints={[
          <>Look at the highest node of the longest path. The path goes down its left side and down its right side.</>,
          <>Its length in edges is the height of the left subtree plus the height of the right subtree (heights counted in nodes).</>,
          <>The function you recurse with returns a height, but the answer is the maximum <code>left + right</code> seen at any node.</>,
        ]}
        approaches={[
          {
            name: "Brute force: height of both sides at every node",
            idea: <p>For every node, compute the heights of its two subtrees with a separate <code>height</code> function, take the sum, and keep the maximum over all nodes.</p>,
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function diameterOfBinaryTree(root) {
  function height(node) {
    if (node === null) return 0;
    return 1 + Math.max(height(node.left), height(node.right));
  }
  if (root === null) return 0;
  const through = height(root.left) + height(root.right);
  return Math.max(through, diameterOfBinaryTree(root.left), diameterOfBinaryTree(root.right));
}

console.log(diameterOfBinaryTree(buildTree([1, 2, 3, 4, 5]))); // 3
console.log(diameterOfBinaryTree(buildTree([1, 2])));          // 1`,
            explain: <p>Correct, but each height call walks a whole subtree again: O(n²) in the worst case.</p>,
          },
          {
            name: "One pass: record left + right, return the height",
            idea: (
              <ol>
                <li>Recurse to get the heights of both subtrees.</li>
                <li>Update the outer <code>best</code> with <code>left + right</code>.</li>
                <li>Return <code>1 + max(left, right)</code> to the parent.</li>
              </ol>
            ),
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function diameterOfBinaryTree(root) {
  let best = 0;
  function height(node) {
    if (node === null) return 0;
    const left = height(node.left);
    const right = height(node.right);
    best = Math.max(best, left + right);
    return 1 + Math.max(left, right);
  }
  height(root);
  return best;
}

console.log(diameterOfBinaryTree(buildTree([1, 2, 3, 4, 5])));   // 3
console.log(diameterOfBinaryTree(buildTree([1, 2])));            // 1
console.log(diameterOfBinaryTree(buildTree([1])));               // 0`,
            explain: <p>O(n) time, O(h) space. The returned value (height) and the recorded value (the bent path) are different, which is exactly why a plain recursion that returns the answer does not work.</p>,
          },
        ]}
        compare={<p>The one-pass version. The brute force is a good starting point to say out loud, but it repeats work. (LeetCode 543.)</p>}
      >
        <p>Return the length of the longest path between any two nodes in the tree, measured in <strong>edges</strong>. The path may or may not pass through the root.</p>
      </Problem>

      <Problem
        n={3}
        title="Path sum"
        level="Easy"
        examples={[
          { input: "root = [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], targetSum = 22", output: "true", why: "5 → 4 → 11 → 2 sums to 22 and ends at a leaf." },
          { input: "root = [1, 2, 3], targetSum = 5", output: "false", why: "The root-to-leaf sums are 3 and 4." },
          { input: "root = [], targetSum = 0", output: "false", why: "An empty tree has no root-to-leaf path." },
        ]}
        hints={[
          <>Pass the remaining target down: subtract the node&apos;s value before going to the children.</>,
          <>The path must end at a leaf. What identifies a leaf?</>,
        ]}
        approaches={[
          {
            name: "Brute force: collect every root-to-leaf sum",
            idea: <p>Walk the tree, adding values along the way. At each leaf, push the total into a list. Finally check whether the target is in the list.</p>,
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function hasPathSum(root, targetSum) {
  const sums = [];
  function walk(node, running) {
    if (node === null) return;
    running += node.val;
    if (node.left === null && node.right === null) sums.push(running);
    walk(node.left, running);
    walk(node.right, running);
  }
  walk(root, 0);
  return sums.includes(targetSum);
}

console.log(hasPathSum(buildTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]), 22)); // true
console.log(hasPathSum(buildTree([1, 2, 3]), 5));                                               // false`,
            explain: <p>O(n) time but O(n) extra space for the list, and it keeps going after the answer is known.</p>,
          },
          {
            name: "Recursion: subtract on the way down",
            idea: (
              <ol>
                <li>Empty tree: false.</li>
                <li>Leaf: return whether its value equals what remains of the target.</li>
                <li>Otherwise: true if either child can finish the remaining sum.</li>
              </ol>
            ),
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function hasPathSum(root, targetSum) {
  if (root === null) return false;
  if (root.left === null && root.right === null) return root.val === targetSum;
  const rest = targetSum - root.val;
  return hasPathSum(root.left, rest) || hasPathSum(root.right, rest);
}

console.log(hasPathSum(buildTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]), 22)); // true
console.log(hasPathSum(buildTree([1, 2, 3]), 5));                                               // false
console.log(hasPathSum(buildTree([]), 0));                                                      // false`,
            explain: <p>O(n) time, O(h) space, and the <code>||</code> stops as soon as one path works.</p>,
          },
          {
            name: "Iterative DFS with an explicit stack",
            idea: <p>Replace the recursion with a stack of <code>[node, sum so far]</code> pairs. Pop one, add its value, and either check the target at a leaf or push the children.</p>,
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function hasPathSum(root, targetSum) {
  if (root === null) return false;
  const stack = [[root, 0]];
  while (stack.length) {
    const [node, sum] = stack.pop();
    const total = sum + node.val;
    if (node.left === null && node.right === null && total === targetSum) return true;
    if (node.right) stack.push([node.right, total]);
    if (node.left) stack.push([node.left, total]);
  }
  return false;
}

console.log(hasPathSum(buildTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]), 22)); // true
console.log(hasPathSum(buildTree([1, 2, 3]), 5));                                               // false`,
            explain: <p>Same O(n) time. Useful when a very deep tree might overflow the call stack.</p>,
          },
        ]}
        compare={<p>The recursion is shortest and clearest. Mention the iterative version if the interviewer asks about very deep trees. (LeetCode 112.)</p>}
      >
        <p>Given a tree and an integer <code>targetSum</code>, return <code>true</code> if there is a <strong>root-to-leaf</strong> path whose node values add up to <code>targetSum</code>. Values may be negative.</p>
      </Problem>

      <Problem
        n={4}
        title="Binary tree maximum path sum"
        level="Hard"
        examples={[
          { input: "root = [1, 2, 3]", output: "6", why: "The path 2 → 1 → 3." },
          { input: "root = [-10, 9, 20, null, null, 15, 7]", output: "42", why: "The path 15 → 20 → 7, which does not touch the root." },
          { input: "root = [-3]", output: "-3", why: "A path needs at least one node, so the answer can be negative." },
        ]}
        hints={[
          <>Take the path&apos;s highest node as the anchor. The path goes down its left and down its right.</>,
          <>Define <code>gain(node)</code> as the best sum of a path that <em>starts</em> at node and goes down one side only. That is what a parent can use.</>,
          <>If a child&apos;s gain is negative, ignore it (use 0).</>,
          <>Start the global best at -Infinity, not at 0.</>,
        ]}
        approaches={[
          {
            name: "Brute force: try every node as the top",
            idea: <p>For every node, separately compute the best downward gain of its left and right subtrees (with a helper that recurses fully), combine them as <code>node.val + left + right</code>, and take the maximum over all nodes.</p>,
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function maxPathSum(root) {
  // Best downward path starting at node (always includes node).
  function down(node) {
    if (node === null) return 0;
    return node.val + Math.max(0, down(node.left), down(node.right));
  }
  let best = -Infinity;
  function visit(node) {
    if (node === null) return;
    const through = node.val + Math.max(0, down(node.left)) + Math.max(0, down(node.right));
    best = Math.max(best, through);
    visit(node.left);
    visit(node.right);
  }
  visit(root);
  return best;
}

console.log(maxPathSum(buildTree([1, 2, 3])));                       // 6
console.log(maxPathSum(buildTree([-10, 9, 20, null, null, 15, 7])));  // 42`,
            explain: <p>Correct, but <code>down</code> re-walks subtrees for every ancestor: O(n²) on a skewed tree.</p>,
          },
          {
            name: "One pass: record the bent path, return the one-sided gain",
            idea: (
              <ol>
                <li><code>gain(node)</code> returns the best path sum that starts at the node and goes down one side.</li>
                <li>Left and right gains below 0 are replaced by 0.</li>
                <li>Update the global best with <code>node.val + left + right</code>.</li>
                <li>Return <code>node.val + max(left, right)</code>.</li>
              </ol>
            ),
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function maxPathSum(root) {
  let best = -Infinity;
  function gain(node) {
    if (node === null) return 0;
    const left = Math.max(0, gain(node.left));
    const right = Math.max(0, gain(node.right));
    best = Math.max(best, node.val + left + right);
    return node.val + Math.max(left, right);
  }
  gain(root);
  return best;
}

console.log(maxPathSum(buildTree([1, 2, 3])));                       // 6
console.log(maxPathSum(buildTree([-10, 9, 20, null, null, 15, 7])));  // 42
console.log(maxPathSum(buildTree([-3])));                            // -3
console.log(maxPathSum(buildTree([2, -1])));                         // 2`,
            explain: <p>O(n) time, O(h) space. On <code>[2, -1]</code> the child&apos;s gain is clamped to 0, so the best path is just the root, 2. A path that forks (using both children and then continuing to a parent) is never counted, because only the one-sided gain is returned.</p>,
          },
        ]}
        compare={<p>The one-pass version; this is the same shape as diameter, with sums and a clamp at 0. (LeetCode 124.)</p>}
      >
        <p>A <strong>path</strong> is a sequence of connected nodes where each node appears at most once; it need not pass through the root or end at a leaf. Return the maximum sum of node values over all non-empty paths. Values may be negative.</p>
      </Problem>

      <Problem
        n={5}
        title="Symmetric tree"
        level="Easy"
        examples={[
          { input: "root = [1, 2, 2, 3, 4, 4, 3]", output: "true", why: "The left half is the mirror image of the right half." },
          { input: "root = [1, 2, 2, null, 3, null, 3]", output: "false", why: "Both 3s are on the right side of their parents, so they are not mirror images." },
        ]}
        hints={[
          <>Compare two trees at once: the left subtree of the root and the right subtree.</>,
          <>For mirrors, the left child of one is compared with the <em>right</em> child of the other.</>,
        ]}
        approaches={[
          {
            name: "Level by level: each row reads the same both ways",
            idea: <p>Write each level as a list of values with <code>null</code> for gaps. For a mirror image, every level must read the same forwards and backwards.</p>,
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function isSymmetric(root) {
  let level = [root];
  while (level.some((n) => n !== null)) {
    const vals = level.map((n) => (n === null ? null : n.val));
    for (let i = 0, j = vals.length - 1; i < j; i++, j--) {
      if (vals[i] !== vals[j]) return false;
    }
    const next = [];
    for (const n of level) if (n !== null) next.push(n.left, n.right);
    level = next;
  }
  return true;
}

console.log(isSymmetric(buildTree([1, 2, 2, 3, 4, 4, 3])));        // true
console.log(isSymmetric(buildTree([1, 2, 2, null, 3, null, 3])));  // false`,
            explain: <p>O(n) time and O(width) space. It works because the gaps are recorded as <code>null</code>.</p>,
          },
          {
            name: "Recursive mirror check",
            idea: (
              <ol>
                <li>Two nulls are mirrors; one null and one node are not.</li>
                <li>Otherwise the values must match, and <code>a.left</code> must mirror <code>b.right</code>, and <code>a.right</code> must mirror <code>b.left</code>.</li>
              </ol>
            ),
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function isSymmetric(root) {
  function mirror(a, b) {
    if (a === null && b === null) return true;
    if (a === null || b === null) return false;
    return a.val === b.val && mirror(a.left, b.right) && mirror(a.right, b.left);
  }
  return root === null || mirror(root.left, root.right);
}

console.log(isSymmetric(buildTree([1, 2, 2, 3, 4, 4, 3])));        // true
console.log(isSymmetric(buildTree([1, 2, 2, null, 3, null, 3])));  // false`,
            explain: <p>O(n) time, O(h) space.</p>,
          },
          {
            name: "Iterative with a queue of pairs",
            idea: <p>Put the two children of the root in a queue as a pair. Repeatedly take a pair, compare it, and add the crossed child pairs.</p>,
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function isSymmetric(root) {
  if (root === null) return true;
  const queue = [[root.left, root.right]];
  while (queue.length) {
    const [a, b] = queue.shift();
    if (a === null && b === null) continue;
    if (a === null || b === null || a.val !== b.val) return false;
    queue.push([a.left, b.right], [a.right, b.left]);
  }
  return true;
}

console.log(isSymmetric(buildTree([1, 2, 2, 3, 4, 4, 3])));        // true
console.log(isSymmetric(buildTree([1, 2, 2, null, 3, null, 3])));  // false`,
            explain: <p>Same pairing as the recursion, with no call stack.</p>,
          },
        ]}
        compare={<p>The recursive mirror check; it is the shortest and shows the crossing idea best. (LeetCode 101.)</p>}
      >
        <p>Return whether a binary tree is a mirror image of itself (symmetric around its centre).</p>
      </Problem>

      <Problem
        n={6}
        title="Subtree of another tree"
        level="Easy"
        examples={[
          { input: "root = [3, 4, 5, 1, 2], subRoot = [4, 1, 2]", output: "true", why: "The subtree rooted at 4 is identical to subRoot." },
          { input: "root = [3, 4, 5, 1, 2, null, null, null, null, 0], subRoot = [4, 1, 2]", output: "false", why: "The subtree at 4 has an extra child (0) below the 2, so it is not identical." },
        ]}
        hints={[
          <>Write a helper that says whether two trees are exactly identical.</>,
          <>Try the helper at every node of the big tree.</>,
          <>A subtree includes <em>all</em> descendants: both trees must end at the same place.</>,
        ]}
        approaches={[
          {
            name: "Compare at every node",
            idea: (
              <ol>
                <li><code>isSameTree(a, b)</code>: both null, or same value with same left and same right.</li>
                <li>For every node of <code>root</code>, check <code>isSameTree(node, subRoot)</code>.</li>
              </ol>
            ),
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function isSubtree(root, subRoot) {
  function same(a, b) {
    if (a === null && b === null) return true;
    if (a === null || b === null) return false;
    return a.val === b.val && same(a.left, b.left) && same(a.right, b.right);
  }
  if (root === null) return subRoot === null;
  return same(root, subRoot) || isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}

console.log(isSubtree(buildTree([3, 4, 5, 1, 2]), buildTree([4, 1, 2])));                              // true
console.log(isSubtree(buildTree([3, 4, 5, 1, 2, null, null, null, null, 0]), buildTree([4, 1, 2])));   // false`,
            explain: <p>O(m · n) time in the worst case (n nodes in root, m in subRoot), O(h) space. Perfectly fine for the constraints.</p>,
          },
          {
            name: "Serialize both trees and look for a substring",
            idea: <p>Turn each tree into a string with a preorder walk, writing a marker for every <code>null</code>, then check whether the sub-tree&apos;s string occurs inside the big one. The markers make the structure unambiguous, and each value is wrapped in brackets so <code>[2]</code> can never match inside <code>[12]</code>.</p>,
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function isSubtree(root, subRoot) {
  function serialize(node) {
    if (node === null) return "[#]";
    return "[" + node.val + "]" + serialize(node.left) + serialize(node.right);
  }
  return serialize(root).includes(serialize(subRoot));
}

console.log(isSubtree(buildTree([3, 4, 5, 1, 2]), buildTree([4, 1, 2])));                              // true
console.log(isSubtree(buildTree([3, 4, 5, 1, 2, null, null, null, null, 0]), buildTree([4, 1, 2])));   // false
console.log(isSubtree(buildTree([12]), buildTree([2])));                                                 // false`,
            explain: <p>Building the strings is O(m + n); JavaScript&apos;s <code>includes</code> is not guaranteed to be linear, so say &quot;about O(m + n) with a good substring search&quot;. Without the brackets, tree <code>[12]</code> would wrongly contain <code>[2]</code>, and without the <code>#</code> markers two differently shaped trees could produce the same string.</p>,
          },
        ]}
        compare={<p>Start with the node-by-node comparison, which is easy to write correctly. The serialization is a nice follow-up if asked for a faster approach. (LeetCode 572.)</p>}
      >
        <p>Return <code>true</code> if <code>subRoot</code> has exactly the same structure and node values as some subtree of <code>root</code> (a node of <code>root</code> together with <em>all</em> its descendants).</p>
      </Problem>

      <Problem
        n={7}
        title="Path sum III"
        level="Medium"
        examples={[
          { input: "root = [10, 5, -3, 3, 2, null, 11, 3, -2, null, 1], targetSum = 8", output: "3", why: "The paths 5 → 3, 5 → 2 → 1 and -3 → 11 all sum to 8." },
          { input: "root = [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], targetSum = 22", output: "3", why: "5 → 4 → 11 → 2, 5 → 8 → 4 → 5 and 4 → 11 → 7 all sum to 22." },
        ]}
        hints={[
          <>A path must go downward (parent to child) but may start and end at any node.</>,
          <>Brute force: treat every node as a possible start and count the downward paths from it that sum to the target.</>,
          <>Remember the prefix-sum trick from arrays: if the running sum from the root to here is S, then a path ending here with sum T exists for each earlier ancestor whose running sum was S − T.</>,
          <>Keep a map of running sums on the current root-to-node path, and undo your entry when you leave the node.</>,
        ]}
        approaches={[
          {
            name: "Brute force: start a count at every node",
            idea: <p>For each node, run a DFS downward counting how many paths from it reach the target, then add the answers for all nodes.</p>,
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function pathSum(root, targetSum) {
  function from(node, remaining) {          // paths that start exactly at node
    if (node === null) return 0;
    const here = node.val === remaining ? 1 : 0;
    return here + from(node.left, remaining - node.val) + from(node.right, remaining - node.val);
  }
  if (root === null) return 0;
  return from(root, targetSum) + pathSum(root.left, targetSum) + pathSum(root.right, targetSum);
}

console.log(pathSum(buildTree([10, 5, -3, 3, 2, null, 11, 3, -2, null, 1]), 8));            // 3
console.log(pathSum(buildTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1]), 22));    // 3`,
            explain: <p>You cannot stop early at a match, because negative values mean a longer path might also hit the target. O(n²) on a chain and O(n log n) on a bushy tree.</p>,
          },
          {
            name: "Prefix sums on the root-to-node path",
            idea: (
              <ol>
                <li>Keep <code>running</code>, the sum from the root to the current node, and a Map from each running sum to how many times it occurs on the <em>current path</em> (starting with <code>{"{0: 1}"}</code> for the empty prefix).</li>
                <li>At a node, the number of paths ending here is <code>map[running − target]</code>.</li>
                <li>Add this node&apos;s running sum to the map, recurse into both children, then <strong>remove it again</strong> (backtrack) so other branches do not see it.</li>
              </ol>
            ),
            code: `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(arr) {                           // level-order array, null marks a missing child
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function pathSum(root, targetSum) {
  const seen = new Map([[0, 1]]);            // running sum -> count on the current path
  function dfs(node, running) {
    if (node === null) return 0;
    running += node.val;
    let count = seen.get(running - targetSum) ?? 0;
    seen.set(running, (seen.get(running) ?? 0) + 1);
    count += dfs(node.left, running) + dfs(node.right, running);
    seen.set(running, seen.get(running) - 1);   // backtrack when leaving this node
    return count;
  }
  return dfs(root, 0);
}

console.log(pathSum(buildTree([10, 5, -3, 3, 2, null, 11, 3, -2, null, 1]), 8));            // 3
console.log(pathSum(buildTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1]), 22));    // 3
console.log(pathSum(buildTree([1, -2, -3]), -1));                                            // 1`,
            explain: <p>This is the &quot;subarray sum equals k&quot; trick applied to every root-to-node path. O(n) time and O(h) space. Backtracking is essential: a running sum from one branch must not be counted by a node in a sibling branch.</p>,
          },
        ]}
        compare={<p>The prefix-sum map for O(n). Offer the brute force first (it is a sensible answer for small trees), then show how the array prefix-sum idea from earlier lessons removes the repeated work. (LeetCode 437.)</p>}
      >
        <p>Count the downward paths (going from parent to child, starting and ending at any node) whose node values add up to <code>targetSum</code>. Values may be negative.</p>
      </Problem>
    </>
  );
}
