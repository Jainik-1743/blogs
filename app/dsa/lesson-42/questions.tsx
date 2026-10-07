import Problem from "@/components/dsa/Problem";

/** Lesson 42 practice questions: level order (BFS) on trees. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Binary tree level order traversal"
        level="Medium"
        examples={[
          { input: "root = [3, 9, 20, null, null, 15, 7]", output: "[[3], [9, 20], [15, 7]]", why: "Row 0 is the root. Row 1 is its two children. Row 2 is the children of 20." },
          { input: "root = [1]", output: "[[1]]", why: "One node, one row." },
          { input: "root = []", output: "[]", why: "There are no rows at all (not even one empty row)." },
        ]}
        hints={[
          <>A queue gives you the nodes in the right order. How do you know where one row ends and the next row begins?</>,
          <>At the start of each round the queue holds exactly one row. Count how many nodes it has.</>,
          <>Another way: a depth-first walk that carries the depth can put each value straight into <code>levels[depth]</code>.</>,
        ]}
        approaches={[
          {
            name: "Depth-first, passing the depth",
            idea: <p>Walk the tree with recursion (a function that calls itself) and pass the current depth along. If <code>levels</code> has no array for this depth yet, add one. Push the value of the node into <code>levels[depth]</code>. Go left before right, so each row stays in left-to-right order.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function levelOrder(root) {
  const levels = [];
  function walk(node, depth) {
    if (node === null) return;
    if (levels.length === depth) levels.push([]);
    levels[depth].push(node.val);
    walk(node.left, depth + 1);
    walk(node.right, depth + 1);
  }
  walk(root, 0);
  return levels;
}

console.log(levelOrder(buildTree([3, 9, 20, null, null, 15, 7]))); // [[3], [9, 20], [15, 7]]
console.log(levelOrder(buildTree([1])));                          // [[1]]
console.log(levelOrder(buildTree([])));                           // []`,
            explain: <p>O(n) time, and O(h) space for the call stack (the pile of open calls) plus the output. It works because nodes at the same depth are met from left to right. It is not really BFS, but it gives the same rows.</p>,
          },
          {
            name: "BFS with a saved size",
            idea: (
              <ol>
                <li>Put the root in a queue. Keep a <code>head</code> number that marks the front.</li>
                <li>While the queue is not empty, let <code>size = queue.length - head</code>.</li>
                <li>Take <code>size</code> nodes from the front. Put their values into one row, and add their children to the queue.</li>
                <li>Add the row to the answer.</li>
              </ol>
            ),
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function levelOrder(root) {
  if (root === null) return [];
  const levels = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const size = queue.length - head;
    const level = [];
    for (let k = 0; k < size; k++) {
      const node = queue[head++];
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    levels.push(level);
  }
  return levels;
}

console.log(levelOrder(buildTree([3, 9, 20, null, null, 15, 7]))); // [[3], [9, 20], [15, 7]]
console.log(levelOrder(buildTree([1])));                          // [[1]]
console.log(levelOrder(buildTree([])));                           // []`,
            explain: <p>O(n) time. O(w) space for the queue, where w is the number of nodes in the widest row. This is the pattern for the rest of the lesson.</p>,
          },
          {
            name: "Two arrays: current row and next row",
            idea: <p>Instead of one queue, keep the current row as an array. Build the next row by collecting the children of every node in it, then swap the two. You do not need a size or a head number.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function levelOrder(root) {
  if (root === null) return [];
  const levels = [];
  let current = [root];
  while (current.length > 0) {
    levels.push(current.map((node) => node.val));
    const next = [];
    for (const node of current) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    current = next;
  }
  return levels;
}

console.log(levelOrder(buildTree([3, 9, 20, null, null, 15, 7]))); // [[3], [9, 20], [15, 7]]
console.log(levelOrder(buildTree([1])));                          // [[1]]
console.log(levelOrder(buildTree([])));                           // []`,
            explain: <p>O(n) time, O(w) space. It is easy to read, and a good fit when you need the whole row as an array anyway.</p>,
          },
        ]}
        compare={<p>Learn the saved-size BFS by heart. Every other BFS question is a small change to it. (LeetCode 102.)</p>}
      >
        <p>Return the level order traversal of a binary tree: a list of rows from the top row down, with each row read left to right.</p>
      </Problem>

      <Problem
        n={2}
        title="Binary tree right side view"
        level="Medium"
        examples={[
          { input: "root = [1, 2, 3, null, 5, null, 4]", output: "[1, 3, 4]", why: "Row 2 holds 5 and 4. Node 4 is the rightmost, so it hides 5." },
          { input: "root = [1, 2, 3, 4, null, null, null, 5]", output: "[1, 3, 4, 5]", why: "Row 2 has only 4 and row 3 has only 5, so both can be seen." },
          { input: "root = [1, null, 3]", output: "[1, 3]", why: "There is a single path to the right." },
          { input: "root = []", output: "[]", why: "There is nothing to see." },
        ]}
        hints={[
          <>Which node of each row is visible from the right?</>,
          <>It does not have to be a right child. In the second example, 4 is a <em>left</em> child, but it is the only node in its row.</>,
        ]}
        approaches={[
          {
            name: "Full level order, then take the last of each row",
            idea: <p>Build every row as in the last question. Keep the last value of each row.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function rightSideView(root) {
  if (root === null) return [];
  const levels = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const size = queue.length - head;
    const level = [];
    for (let k = 0; k < size; k++) {
      const node = queue[head++];
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    levels.push(level);
  }
  return levels.map((level) => level[level.length - 1]);
}

console.log(rightSideView(buildTree([1, 2, 3, null, 5, null, 4])));            // [1, 3, 4]
console.log(rightSideView(buildTree([1, 2, 3, 4, null, null, null, 5])));      // [1, 3, 4, 5]
console.log(rightSideView(buildTree([])));                                     // []`,
            explain: <p>O(n) time. It stores every value, even though we need only one per row.</p>,
          },
          {
            name: "BFS keeping only the last node of each row",
            idea: <p>With the saved size, the node at position <code>k === size - 1</code> is the last of its row. Record only that one.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function rightSideView(root) {
  if (root === null) return [];
  const view = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const size = queue.length - head;
    for (let k = 0; k < size; k++) {
      const node = queue[head++];
      if (k === size - 1) view.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  return view;
}

console.log(rightSideView(buildTree([1, 2, 3, null, 5, null, 4])));            // [1, 3, 4]
console.log(rightSideView(buildTree([1, 2, 3, 4, null, null, null, 5])));      // [1, 3, 4, 5]
console.log(rightSideView(buildTree([1, null, 3])));                           // [1, 3]
console.log(rightSideView(buildTree([])));                                     // []`,
            explain: <p>O(n) time, O(w) space.</p>,
          },
          {
            name: "Depth-first, right child first",
            idea: <p>Visit the right child before the left child. Then the first node you reach at each new depth is the rightmost one in its row. You know it is a new depth when <code>depth === view.length</code>.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function rightSideView(root) {
  const view = [];
  function walk(node, depth) {
    if (node === null) return;
    if (depth === view.length) view.push(node.val);   // first time we reach this depth
    walk(node.right, depth + 1);
    walk(node.left, depth + 1);
  }
  walk(root, 0);
  return view;
}

console.log(rightSideView(buildTree([1, 2, 3, null, 5, null, 4])));            // [1, 3, 4]
console.log(rightSideView(buildTree([1, 2, 3, 4, null, null, null, 5])));      // [1, 3, 4, 5]
console.log(rightSideView(buildTree([])));                                     // []`,
            explain: <p>O(n) time, O(h) space, which is better than BFS for a wide tree. Remember this trick: the length of the answer tells you the deepest depth seen so far.</p>,
          },
        ]}
        compare={<p>Use either of the last two. BFS shows that you understand rows. Depth-first uses less memory for bushy trees. (LeetCode 199.)</p>}
      >
        <p>Imagine you stand on the right side of a binary tree. Return the values of the nodes you can see, from top to bottom.</p>
      </Problem>

      <Problem
        n={3}
        title="Binary tree zigzag level order traversal"
        level="Medium"
        examples={[
          { input: "root = [3, 9, 20, null, null, 15, 7]", output: "[[3], [20, 9], [15, 7]]", why: "Row 1 is read from right to left. Row 2 goes back to left to right." },
          { input: "root = [1]", output: "[[1]]", why: "One row." },
          { input: "root = []", output: "[]", why: "No rows." },
        ]}
        hints={[
          <>The order in which you <em>visit</em> the nodes stays the same. Only the way you store each row changes.</>,
          <>Keep a true/false value (a boolean) that flips after every row.</>,
        ]}
        approaches={[
          {
            name: "Level order, then reverse every other row",
            idea: <p>Build the rows normally. Reverse the rows at odd indices at the end.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function zigzagLevelOrder(root) {
  if (root === null) return [];
  const levels = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const size = queue.length - head;
    const level = [];
    for (let k = 0; k < size; k++) {
      const node = queue[head++];
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    levels.push(level);
  }
  for (let i = 1; i < levels.length; i += 2) levels[i].reverse();
  return levels;
}

console.log(zigzagLevelOrder(buildTree([3, 9, 20, null, null, 15, 7])));      // [[3], [20, 9], [15, 7]]
console.log(zigzagLevelOrder(buildTree([1, 2, 3, 4, null, null, 5])));         // [[1], [3, 2], [4, 5]]
console.log(zigzagLevelOrder(buildTree([])));                                  // []`,
            explain: <p>O(n) time. Each reversal takes time in proportion to the row, so the total is still O(n). This is the easiest one to get right.</p>,
          },
          {
            name: "Write into the mirror position",
            idea: <p>You know the row size in advance, so create <code>new Array(size)</code>. On right-to-left rows, put the k-th visited node at index <code>size - 1 - k</code>.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function zigzagLevelOrder(root) {
  if (root === null) return [];
  const levels = [];
  const queue = [root];
  let head = 0;
  let leftToRight = true;
  while (head < queue.length) {
    const size = queue.length - head;
    const level = new Array(size);
    for (let k = 0; k < size; k++) {
      const node = queue[head++];
      level[leftToRight ? k : size - 1 - k] = node.val;
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    levels.push(level);
    leftToRight = !leftToRight;
  }
  return levels;
}

console.log(zigzagLevelOrder(buildTree([3, 9, 20, null, null, 15, 7])));      // [[3], [20, 9], [15, 7]]
console.log(zigzagLevelOrder(buildTree([1, 2, 3, 4, null, null, 5])));         // [[1], [3, 2], [4, 5]]
console.log(zigzagLevelOrder(buildTree([])));                                  // []`,
            explain: <p>O(n) time, and no extra pass to reverse. Saving the size is what makes this possible.</p>,
          },
          {
            name: "Depth-first, building rows from either end",
            idea: <p>Walk depth-first, left before right, and pass the depth along. On even depths <code>push</code> the value onto the row; on odd depths <code>unshift</code> it to the front.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function zigzagLevelOrder(root) {
  const levels = [];
  function walk(node, depth) {
    if (node === null) return;
    if (levels.length === depth) levels.push([]);
    if (depth % 2 === 0) levels[depth].push(node.val);
    else levels[depth].unshift(node.val);
    walk(node.left, depth + 1);
    walk(node.right, depth + 1);
  }
  walk(root, 0);
  return levels;
}

console.log(zigzagLevelOrder(buildTree([3, 9, 20, null, null, 15, 7])));      // [[3], [20, 9], [15, 7]]
console.log(zigzagLevelOrder(buildTree([1, 2, 3, 4, null, null, 5])));         // [[1], [3, 2], [4, 5]]
console.log(zigzagLevelOrder(buildTree([])));                                  // []`,
            explain: <p>Correct, but <code>unshift</code> moves the whole row each time, so a very wide row costs O(row²). It is fine for interviews. For speed, prefer the earlier two.</p>,
          },
        ]}
        compare={<p>Reverse at the end if you want it clear. Use the mirror write to avoid the extra pass. (LeetCode 103.)</p>}
      >
        <p>Return the zigzag level order traversal: the first row left to right, the next row right to left, and so on, switching each time.</p>
      </Problem>

      <Problem
        n={4}
        title="Minimum depth of binary tree"
        level="Easy"
        examples={[
          { input: "root = [3, 9, 20, null, null, 15, 7]", output: "2", why: "The leaf 9 is the closest leaf. The path is 3, 9, which has two nodes." },
          { input: "root = [2, null, 3, null, 4, null, 5, null, 6]", output: "5", why: "This is a chain. The only leaf is 6, at depth 5. The root is not a leaf, even though it has no left child." },
          { input: "root = []", output: "0", why: "An empty tree has depth 0." },
        ]}
        hints={[
          <>Be careful about what a leaf is: a node with <em>no</em> children at all.</>,
          <>Which walk reaches the nodes near the top first, so that you can stop early?</>,
        ]}
        approaches={[
          {
            name: "Collect every leaf depth, take the smallest (brute force)",
            idea: <p>Walk the whole tree depth-first. Each time you reach a leaf, record its depth. Return the smallest one.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function minDepth(root) {
  if (root === null) return 0;
  let best = Infinity;
  function walk(node, depth) {
    if (node.left === null && node.right === null) best = Math.min(best, depth);
    if (node.left) walk(node.left, depth + 1);
    if (node.right) walk(node.right, depth + 1);
  }
  walk(root, 1);
  return best;
}

console.log(minDepth(buildTree([3, 9, 20, null, null, 15, 7])));           // 2
console.log(minDepth(buildTree([2, null, 3, null, 4, null, 5, null, 6]))); // 5
console.log(minDepth(buildTree([])));                                      // 0`,
            explain: <p>O(n) time, O(h) space. It always visits every node, even when a leaf is right below the root.</p>,
          },
          {
            name: "Recursion that handles nodes with one child",
            idea: (
              <ol>
                <li>If the node is null, the answer is 0.</li>
                <li>If the left side is missing, the answer is 1 plus the right side. If the right side is missing, the answer is 1 plus the left side.</li>
                <li>Otherwise the answer is 1 plus the smaller of the two sides.</li>
              </ol>
            ),
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function minDepth(root) {
  if (root === null) return 0;
  if (root.left === null) return 1 + minDepth(root.right);
  if (root.right === null) return 1 + minDepth(root.left);
  return 1 + Math.min(minDepth(root.left), minDepth(root.right));
}

console.log(minDepth(buildTree([3, 9, 20, null, null, 15, 7])));           // 2
console.log(minDepth(buildTree([2, null, 3, null, 4, null, 5, null, 6]))); // 5
console.log(minDepth(buildTree([])));                                      // 0`,
            explain: <p>O(n) time, O(h) space. The two special cases are the whole point: a missing child is not the end of a path.</p>,
          },
          {
            name: "BFS that stops at the first leaf",
            idea: <p>Go row by row. The first leaf you meet is on the row nearest the top. So return the current depth at once.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function minDepth(root) {
  if (root === null) return 0;
  const queue = [root];
  let head = 0;
  let depth = 1;
  while (head < queue.length) {
    const size = queue.length - head;
    for (let k = 0; k < size; k++) {
      const node = queue[head++];
      if (node.left === null && node.right === null) return depth;
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    depth++;
  }
  return depth;
}

console.log(minDepth(buildTree([3, 9, 20, null, null, 15, 7])));           // 2
console.log(minDepth(buildTree([2, null, 3, null, 4, null, 5, null, 6]))); // 5
console.log(minDepth(buildTree([])));                                      // 0`,
            explain: <p>O(n) in the worst case, but it can finish after looking at only the rows down to the first leaf. It uses O(w) space.</p>,
          },
        ]}
        compare={<p>BFS is the natural fit and can stop early. The recursion is shorter if you remember the one-child case. (LeetCode 111.)</p>}
      >
        <p>Return the minimum depth of a binary tree: the number of nodes on the shortest path from the root down to a leaf.</p>
      </Problem>

      <Problem
        n={5}
        title="Average of levels in binary tree"
        level="Easy"
        examples={[
          { input: "root = [3, 9, 20, 15, 7]", output: "[3, 14.5, 11]", why: "Row 1: (9 + 20) / 2 = 14.5. Row 2: (15 + 7) / 2 = 11." },
          { input: "root = [3, 9, 20, null, null, 15, 7]", output: "[3, 14.5, 11]", why: "The rows have the same values, but the tree has a different shape." },
        ]}
        hints={[
          <>For each row, you need the sum and the number of nodes.</>,
          <>In BFS, the saved size is the number of nodes in the row.</>,
        ]}
        approaches={[
          {
            name: "BFS with a running sum",
            idea: <p>For each row, add up the values while you process <code>size</code> nodes. Then push <code>sum / size</code> to the answer.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function averageOfLevels(root) {
  if (root === null) return [];
  const averages = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const size = queue.length - head;
    let sum = 0;
    for (let k = 0; k < size; k++) {
      const node = queue[head++];
      sum += node.val;
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    averages.push(sum / size);
  }
  return averages;
}

console.log(averageOfLevels(buildTree([3, 9, 20, 15, 7])));                 // [3, 14.5, 11]
console.log(averageOfLevels(buildTree([3, 9, 20, null, null, 15, 7])));     // [3, 14.5, 11]`,
            explain: <p>O(n) time, O(w) space. We do not keep the values, only their sum.</p>,
          },
          {
            name: "DFS adding up sums and counts for each depth",
            idea: <p>Keep two arrays, with the depth as the index: one for the sum and one for the count. Walk depth-first and add each node to the entries of its depth. Divide at the end.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function averageOfLevels(root) {
  const sums = [], counts = [];
  function walk(node, depth) {
    if (node === null) return;
    if (depth === sums.length) { sums.push(0); counts.push(0); }
    sums[depth] += node.val;
    counts[depth]++;
    walk(node.left, depth + 1);
    walk(node.right, depth + 1);
  }
  walk(root, 0);
  return sums.map((s, i) => s / counts[i]);
}

console.log(averageOfLevels(buildTree([3, 9, 20, 15, 7])));                 // [3, 14.5, 11]
console.log(averageOfLevels(buildTree([3, 9, 20, null, null, 15, 7])));     // [3, 14.5, 11]`,
            explain: <p>O(n) time. O(h) for the call stack, plus two arrays whose length equals the height.</p>,
          },
        ]}
        compare={<p>Use BFS, because the question is exactly about rows. (LeetCode 637.)</p>}
      >
        <p>Return the average value of the nodes on each level of a binary tree, as an array from the top level down.</p>
      </Problem>

      <Problem
        n={6}
        title="Find largest value in each tree row"
        level="Medium"
        examples={[
          { input: "root = [1, 3, 2, 5, 3, null, 9]", output: "[1, 3, 9]", why: "Row 0: 1. Row 1: max(3, 2) = 3. Row 2: max(5, 3, 9) = 9." },
          { input: "root = [1, 2, 3]", output: "[1, 3]", why: "Row 1 is 2 and 3, so the largest is 3." },
          { input: "root = []", output: "[]", why: "No rows." },
        ]}
        hints={[
          <>Use the same loop as the averages question, but keep the largest value instead of the sum.</>,
          <>Start the largest value at <code>-Infinity</code> (smaller than any number), because values can be negative.</>,
        ]}
        approaches={[
          {
            name: "BFS with a running maximum",
            idea: <p>For each row, start at <code>-Infinity</code>, update it with every value, and push the result.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function largestValues(root) {
  if (root === null) return [];
  const result = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const size = queue.length - head;
    let max = -Infinity;
    for (let k = 0; k < size; k++) {
      const node = queue[head++];
      max = Math.max(max, node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(max);
  }
  return result;
}

console.log(largestValues(buildTree([1, 3, 2, 5, 3, null, 9])));   // [1, 3, 9]
console.log(largestValues(buildTree([1, 2, 3])));                 // [1, 3]
console.log(largestValues(buildTree([-1, -5, -2])));              // [-1, -2]
console.log(largestValues(buildTree([])));                        // []`,
            explain: <p>O(n) time, O(w) space.</p>,
          },
          {
            name: "DFS keeping the best value for each depth",
            idea: <p>Walk depth-first and pass the depth. If this is a new depth, start its entry with the value of the node. Otherwise keep the larger value.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function largestValues(root) {
  const result = [];
  function walk(node, depth) {
    if (node === null) return;
    if (depth === result.length) result.push(node.val);
    else result[depth] = Math.max(result[depth], node.val);
    walk(node.left, depth + 1);
    walk(node.right, depth + 1);
  }
  walk(root, 0);
  return result;
}

console.log(largestValues(buildTree([1, 3, 2, 5, 3, null, 9])));   // [1, 3, 9]
console.log(largestValues(buildTree([1, 2, 3])));                 // [1, 3]
console.log(largestValues(buildTree([-1, -5, -2])));              // [-1, -2]
console.log(largestValues(buildTree([])));                        // []`,
            explain: <p>O(n) time, O(h) for the call stack. We start each depth with the first value we meet, so we do not need <code>-Infinity</code>.</p>,
          },
        ]}
        compare={<p>BFS is the most natural to read. Depth-first uses less memory on wide trees. (LeetCode 515.)</p>}
      >
        <p>Return an array of the largest value in each row of a binary tree, from the top row down.</p>
      </Problem>

      <Problem
        n={7}
        title="Populating next right pointers in each node"
        level="Medium"
        examples={[
          { input: "root = [1, 2, 3, 4, 5, 6, 7]", output: "next pointers join each row: 1 → null; 2 → 3 → null; 4 → 5 → 6 → 7 → null", why: "In each row, every next pointer leads to the neighbour on the right. The last node points to null." },
          { input: "root = []", output: "(nothing to connect)", why: "An empty tree." },
        ]}
        hints={[
          <>The tree is <em>perfect</em>: every node that is not a leaf has two children, and all leaves are on the same row.</>,
          <>With a saved size, the <code>next</code> of a node is simply the node at the front of the queue, unless it is the last node in its row.</>,
          <>To avoid the queue: a row that is already linked by <code>next</code> pointers lets you walk across it and link the row below.</>,
        ]}
        approaches={[
          {
            name: "BFS with a saved size",
            idea: <p>For each row, process <code>size</code> nodes. For every node except the last one in the row, set <code>next</code> to the node now at the front of the queue (the next node in the same row). The last node keeps <code>null</code>.</p>,
            code: `class Node {
  constructor(val, left = null, right = null, next = null) {
    this.val = val;
    this.left = left;
    this.right = right;
    this.next = next;      // will point at the node to the right on the same level
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new Node(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new Node(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new Node(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

// Read the tree back row by row by following the next pointers (for printing).
function rows(root) {
  const out = [];
  for (let start = root; start !== null; start = start.left) {
    const row = [];
    for (let node = start; node !== null; node = node.next) row.push(node.val);
    out.push(row);
  }
  return out;
}

function connect(root) {
  if (root === null) return null;
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const size = queue.length - head;
    for (let k = 0; k < size; k++) {
      const node = queue[head++];
      if (k < size - 1) node.next = queue[head];   // the next node in this row
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  return root;
}

console.log(rows(connect(buildTree([1, 2, 3, 4, 5, 6, 7])))); // [[1], [2, 3], [4, 5, 6, 7]]
console.log(rows(connect(buildTree([1]))));                  // [[1]]
console.log(rows(connect(buildTree([]))));                   // []`,
            explain: <p>O(n) time and O(w) space for the queue. It works for any binary tree, not only a perfect one.</p>,
          },
          {
            name: "Walk the finished row to link the row below (O(1) space)",
            idea: (
              <ol>
                <li>Start at the leftmost node of a row. That row is already linked through <code>next</code>.</li>
                <li>For each node in that row, connect <code>node.left.next = node.right</code>. If the node has a neighbour, also connect <code>node.right.next = node.next.left</code> (this crosses the gap between two parents).</li>
                <li>Drop down to the next row by moving to the leftmost node&apos;s left child.</li>
              </ol>
            ),
            code: `class Node {
  constructor(val, left = null, right = null, next = null) {
    this.val = val;
    this.left = left;
    this.right = right;
    this.next = next;      // will point at the node to the right on the same level
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new Node(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new Node(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new Node(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

// Read the tree back row by row by following the next pointers (for printing).
function rows(root) {
  const out = [];
  for (let start = root; start !== null; start = start.left) {
    const row = [];
    for (let node = start; node !== null; node = node.next) row.push(node.val);
    out.push(row);
  }
  return out;
}

function connect(root) {
  let leftmost = root;
  while (leftmost !== null && leftmost.left !== null) {
    for (let node = leftmost; node !== null; node = node.next) {
      node.left.next = node.right;
      if (node.next !== null) node.right.next = node.next.left;
    }
    leftmost = leftmost.left;
  }
  return root;
}

console.log(rows(connect(buildTree([1, 2, 3, 4, 5, 6, 7])))); // [[1], [2, 3], [4, 5, 6, 7]]
console.log(rows(connect(buildTree([1]))));                  // [[1]]
console.log(rows(connect(buildTree([]))));                   // []`,
            explain: <p>O(n) time and O(1) extra space. The <code>next</code> links we are making work like the queue. It needs every node to have both children (a perfect tree), so that <code>node.left</code> and <code>node.next.left</code> always exist.</p>,
          },
          {
            name: "Recursion",
            idea: <p>At each node that has children, connect its two children to each other. Then connect the right child to the left child of the neighbour of the node. After that, call the function on both children. The parent has already linked the neighbour of a node before we get there.</p>,
            code: `class Node {
  constructor(val, left = null, right = null, next = null) {
    this.val = val;
    this.left = left;
    this.right = right;
    this.next = next;      // will point at the node to the right on the same level
  }
}

function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new Node(arr[0]);
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new Node(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new Node(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

// Read the tree back row by row by following the next pointers (for printing).
function rows(root) {
  const out = [];
  for (let start = root; start !== null; start = start.left) {
    const row = [];
    for (let node = start; node !== null; node = node.next) row.push(node.val);
    out.push(row);
  }
  return out;
}

function connect(root) {
  if (root === null || root.left === null) return root;
  root.left.next = root.right;
  root.right.next = root.next !== null ? root.next.left : null;
  connect(root.left);
  connect(root.right);
  return root;
}

console.log(rows(connect(buildTree([1, 2, 3, 4, 5, 6, 7])))); // [[1], [2, 3], [4, 5, 6, 7]]
console.log(rows(connect(buildTree([1]))));                  // [[1]]
console.log(rows(connect(buildTree([]))));                   // []`,
            explain: <p>O(n) time, O(h) space for the call stack. We set the links of the children <em>before</em> the recursive calls. This makes sure <code>root.next</code> is already correct when we need it.</p>,
          },
        ]}
        compare={<p>Start with BFS (it also solves the version for any tree, LeetCode 117). The O(1)-space row walk is the follow-up the interviewer hopes you know. (LeetCode 116.)</p>}
      >
        <p>
          You get a <em>perfect</em> binary tree. Each node has an extra link called <code>next</code>. Set every <code>next</code> to point to the node on its right in the same row, or to <code>null</code> if there is none. All <code>next</code> links start as <code>null</code>.
        </p>
      </Problem>
    </>
  );
}
