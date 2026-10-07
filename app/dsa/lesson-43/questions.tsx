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
          { input: "root = [3, 9, 20, null, null, 15, 7]", output: "true", why: "At every node, the heights of the left side and the right side differ by at most 1." },
          { input: "root = [1, 2, 2, 3, 3, null, null, 4, 4]", output: "false", why: "The left child of the root has height 3, but the right child has height 1. The difference is 2." },
          { input: "root = []", output: "true", why: "An empty tree is balanced." },
        ]}
        hints={[
          <>&quot;Balanced&quot; must hold at <em>every</em> node, not only at the root.</>,
          <>If you call a separate <code>height</code> function at each node, how many times do you visit the same node?</>,
          <>Let one function do both jobs. Return the height as usual. Return -1 as a warning signal when something below is unbalanced.</>,
        ]}
        approaches={[
          {
            name: "Brute force: recompute heights at every node",
            idea: (
              <ol>
                <li>Write <code>height(node)</code>.</li>
                <li>At each node, compare the heights of its left side and right side.</li>
                <li>Call the function on both children. They must be balanced too.</li>
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
            explain: <p>Correct, but every ancestor (the parent, the grandparent, and so on) walks the same nodes again with its own height call. It takes O(n log n) on a bushy tree and O(n²) on a tree shaped like a chain.</p>,
          },
          {
            name: "Bottom-up with a -1 warning value (sentinel)",
            idea: (
              <ol>
                <li>Return the height of this part of the tree, or -1 if anything below it is unbalanced.</li>
                <li>If either child returns -1, pass -1 up at once.</li>
                <li>If the two heights differ by more than 1, return -1. Otherwise return the height.</li>
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
            explain: <p>Each node is visited once, so the time is O(n) and the space for the recursion is O(h). The first problem it finds travels straight up to the root.</p>,
          },
        ]}
        compare={<p>Use the -1 version. Interviewers expect it. Mention the slow version first as your starting point. Then explain how you removed the repeated work. (LeetCode 110.)</p>}
      >
        <p>A binary tree is <strong>height-balanced</strong> if, at every node, the heights of its left side and right side differ by at most 1. Return whether the given tree is height-balanced.</p>
      </Problem>

      <Problem
        n={2}
        title="Diameter of binary tree"
        level="Easy"
        examples={[
          { input: "root = [1, 2, 3, 4, 5]", output: "3", why: "The path 4 → 2 → 1 → 3 has three edges." },
          { input: "root = [1, 2]", output: "1", why: "There is one edge between the two nodes." },
          { input: "root = [1]", output: "0", why: "A single node has no edges." },
        ]}
        hints={[
          <>Look at the highest node of the longest path. The path goes down its left side and also down its right side.</>,
          <>Its length in edges is the height of the left side plus the height of the right side (heights counted in nodes).</>,
          <>The function you call recursively returns a height. But the answer is the largest <code>left + right</code> seen at any node.</>,
        ]}
        approaches={[
          {
            name: "Brute force: find the height of both sides at every node",
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
            explain: <p>Correct, but each height call walks a whole part of the tree again. The worst case is O(n²).</p>,
          },
          {
            name: "One pass: record left + right, return the height",
            idea: (
              <ol>
                <li>Call the function on both children to get their heights.</li>
                <li>Update the outer variable <code>best</code> with <code>left + right</code>.</li>
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
        compare={<p>Use the one-pass version. The brute force is a good starting point to say out loud, but it repeats work. (LeetCode 543.)</p>}
      >
        <p>Return the length of the longest path between any two nodes in the tree, measured in <strong>edges</strong>. The path may pass through the root, or it may not.</p>
      </Problem>

      <Problem
        n={3}
        title="Path sum"
        level="Easy"
        examples={[
          { input: "root = [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], targetSum = 22", output: "true", why: "5 → 4 → 11 → 2 adds up to 22 and ends at a leaf." },
          { input: "root = [1, 2, 3], targetSum = 5", output: "false", why: "The sums from the root to the leaves are 3 and 4." },
          { input: "root = [], targetSum = 0", output: "false", why: "An empty tree has no path from the root to a leaf." },
        ]}
        hints={[
          <>Pass what is left of the target down. Subtract the value of the node before you go to the children.</>,
          <>The path must end at a leaf. How can you tell that a node is a leaf?</>,
        ]}
        approaches={[
          {
            name: "Brute force: collect the sum of every root-to-leaf path",
            idea: <p>Walk the tree and add the values along the way. At each leaf, add the total to a list. At the end, check whether the target is in the list.</p>,
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
            explain: <p>O(n) time, but O(n) extra space for the list. It also keeps going after the answer is already known.</p>,
          },
          {
            name: "Recursion: subtract on the way down",
            idea: (
              <ol>
                <li>Empty tree: return false.</li>
                <li>Leaf: return whether its value equals what is left of the target.</li>
                <li>Otherwise: return true if either child can finish the rest of the sum.</li>
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
            explain: <p>O(n) time, O(h) space. The <code>||</code> stops as soon as one path works.</p>,
          },
          {
            name: "DFS with your own stack (no recursion)",
            idea: <p>Replace the recursion with a stack of <code>[node, sum so far]</code> pairs. Pop one pair and add its value. At a leaf, check the target. Otherwise push the children.</p>,
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
            explain: <p>The time is the same, O(n). It helps when a very deep tree could overflow the call stack (run out of room for open calls).</p>,
          },
        ]}
        compare={<p>The recursion is the shortest and clearest. Mention the stack version if the interviewer asks about very deep trees. (LeetCode 112.)</p>}
      >
        <p>Given a tree and an integer <code>targetSum</code>, return <code>true</code> if there is a <strong>root-to-leaf</strong> path whose node values add up to <code>targetSum</code>. Values may be negative.</p>
      </Problem>

      <Problem
        n={4}
        title="Binary tree maximum path sum"
        level="Hard"
        examples={[
          { input: "root = [1, 2, 3]", output: "6", why: "The path 2 → 1 → 3." },
          { input: "root = [-10, 9, 20, null, null, 15, 7]", output: "42", why: "The path 15 → 20 → 7. It does not touch the root." },
          { input: "root = [-3]", output: "-3", why: "A path needs at least one node, so the answer can be negative." },
        ]}
        hints={[
          <>Look at the highest node of the path. The path goes down its left side and down its right side.</>,
          <>Define <code>gain(node)</code> as the best sum of a path that <em>starts</em> at the node and goes down one side only. A parent can use only this.</>,
          <>If the gain of a child is negative, ignore it (use 0).</>,
          <>Start the global best at -Infinity (smaller than any number), not at 0.</>,
        ]}
        approaches={[
          {
            name: "Brute force: try every node as the top",
            idea: <p>For every node, work out the best downward gain of its left side and right side separately, with a helper function. Combine them as <code>node.val + left + right</code>. Take the largest result over all nodes.</p>,
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
            explain: <p>Correct, but <code>down</code> walks the same nodes again for every ancestor. It takes O(n²) on a skewed tree (a tree that leans to one side, like a chain).</p>,
          },
          {
            name: "One pass: record the path that turns, return the one-sided gain",
            idea: (
              <ol>
                <li><code>gain(node)</code> returns the best path sum that starts at the node and goes down one side only.</li>
                <li>Replace a left or right gain below 0 with 0.</li>
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
        compare={<p>Use the one-pass version. It has the same shape as diameter, but with sums, and a negative gain is replaced by 0. (LeetCode 124.)</p>}
      >
        <p>A <strong>path</strong> is a chain of connected nodes where each node appears at most once. It does not have to pass through the root or end at a leaf. Return the largest sum of node values over all paths that have at least one node. Values may be negative.</p>
      </Problem>

      <Problem
        n={5}
        title="Symmetric tree"
        level="Easy"
        examples={[
          { input: "root = [1, 2, 2, 3, 4, 4, 3]", output: "true", why: "The left half is the mirror image of the right half." },
          { input: "root = [1, 2, 2, null, 3, null, 3]", output: "false", why: "Both 3s are on the right side of their parents. So they are not mirror images." },
        ]}
        hints={[
          <>Compare two trees at once: the left side of the root and the right side of the root.</>,
          <>For mirrors, compare the left child of one with the <em>right</em> child of the other.</>,
        ]}
        approaches={[
          {
            name: "Level by level: each row reads the same both ways",
            idea: <p>Write each level as a list of values, with <code>null</code> for gaps. For a mirror image, every level must read the same forwards and backwards.</p>,
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
            explain: <p>O(n) time and O(width) space (the width is the number of nodes in the widest row). It works because we write the gaps as <code>null</code>.</p>,
          },
          {
            name: "Recursive mirror check",
            idea: (
              <ol>
                <li>Two nulls are mirrors. One null and one node are not mirrors.</li>
                <li>Otherwise the values must match. Also <code>a.left</code> must mirror <code>b.right</code>, and <code>a.right</code> must mirror <code>b.left</code>.</li>
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
            name: "With a queue of pairs (no recursion)",
            idea: <p>Put the two children of the root in a queue as a pair. Take a pair, compare it, and add the crossed child pairs. Repeat.</p>,
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
            explain: <p>It pairs nodes in the same way as the recursion, but without a call stack.</p>,
          },
        ]}
        compare={<p>Use the recursive mirror check. It is the shortest and shows the crossing idea best. (LeetCode 101.)</p>}
      >
        <p>Return whether a binary tree is a mirror image of itself (the same on both sides of its centre).</p>
      </Problem>

      <Problem
        n={6}
        title="Subtree of another tree"
        level="Easy"
        examples={[
          { input: "root = [3, 4, 5, 1, 2], subRoot = [4, 1, 2]", output: "true", why: "The part of the tree that starts at node 4 is identical to subRoot." },
          { input: "root = [3, 4, 5, 1, 2, null, null, null, null, 0], subRoot = [4, 1, 2]", output: "false", why: "The part that starts at node 4 has an extra child (0) below the 2. So it is not identical." },
        ]}
        hints={[
          <>Write a helper function that tells you whether two trees are exactly the same.</>,
          <>Use the helper at every node of the big tree.</>,
          <>A subtree includes <em>all</em> nodes below its top node (its descendants). Both trees must end at the same place.</>,
        ]}
        approaches={[
          {
            name: "Compare at every node",
            idea: (
              <ol>
                <li><code>isSameTree(a, b)</code> is true when both are null, or when the values are the same and the left sides are the same and the right sides are the same.</li>
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
            explain: <p>O(m · n) time in the worst case (n nodes in root, m in subRoot), O(h) space. This is fine for the limits of the problem.</p>,
          },
          {
            name: "Turn both trees into text and look for a substring",
            idea: <p>Turn each tree into a string with a preorder walk. Write a marker for every <code>null</code>. Then check whether the string of the small tree appears inside the string of the big tree. The markers make the shape clear. Each value is wrapped in brackets, so <code>[2]</code> can never match inside <code>[12]</code>.</p>,
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
            explain: <p>Building the strings is O(m + n). JavaScript&apos;s <code>includes</code> is not promised to be linear, so say &quot;about O(m + n) with a good substring search&quot;. Without the brackets, tree <code>[12]</code> would wrongly contain <code>[2]</code>. Without the <code>#</code> markers, two trees with different shapes could give the same string.</p>,
          },
        ]}
        compare={<p>Start with the node-by-node comparison. It is easy to write correctly. Turning the trees into strings is a nice follow-up if the interviewer asks for a faster way. (LeetCode 572.)</p>}
      >
        <p>Return <code>true</code> if <code>subRoot</code> has exactly the same shape and node values as some subtree of <code>root</code>. A subtree is a node of <code>root</code> together with <em>all</em> the nodes below it.</p>
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
          <>A path must go downward (from parent to child), but it can start and end at any node.</>,
          <>Brute force: treat every node as a possible start. Count the downward paths from it that add up to the target.</>,
          <>Remember the prefix-sum trick from arrays (a running total). Say the running sum from the root to here is S. Then a path that ends here with sum T exists for each earlier ancestor whose running sum was S − T.</>,
          <>Keep a map of the running sums on the current path from the root to this node. Undo your entry when you leave the node.</>,
        ]}
        approaches={[
          {
            name: "Brute force: start a count at every node",
            idea: <p>For each node, run a DFS (depth-first search) downward and count how many paths from it reach the target. Then add up the counts for all nodes.</p>,
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
            explain: <p>You cannot stop early at a match, because values can be negative, so a longer path might also reach the target. It takes O(n²) on a chain and O(n log n) on a bushy tree.</p>,
          },
          {
            name: "Prefix sums on the root-to-node path",
            idea: (
              <ol>
                <li>Keep <code>running</code>, the sum from the root to the current node. Also keep a Map (a table of key and value pairs) from each running sum to how many times it appears on the <em>current path</em>. Start with <code>{"{0: 1}"}</code> for the empty prefix (the path with no nodes).</li>
                <li>At a node, the number of paths that end here is <code>map[running − target]</code>.</li>
                <li>Add the running sum of this node to the map. Call the function on both children. Then <strong>remove it again</strong> (this is called backtracking: undoing a step when you go back), so other branches do not see it.</li>
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
            explain: <p>This is the &quot;subarray sum equals k&quot; trick, used on every path from the root to a node. O(n) time and O(h) space. Backtracking is a must: a running sum from one branch must not be counted by a node in a sibling branch (a branch next to it).</p>,
          },
        ]}
        compare={<p>Use the prefix-sum map for O(n). Offer the brute force first. It is a sensible answer for small trees. Then show how the prefix-sum idea from earlier lessons removes the repeated work. (LeetCode 437.)</p>}
      >
        <p>Count the downward paths (going from parent to child, starting and ending at any node) whose node values add up to <code>targetSum</code>. Values may be negative.</p>
      </Problem>
    </>
  );
}
