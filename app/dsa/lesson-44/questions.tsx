import Problem from "@/components/dsa/Problem";

/** Lesson 44 practice questions: binary search trees. Trees are written as level-order arrays, null for a missing child. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Search in a binary search tree"
        level="Easy"
        examples={[
          { input: "root = [4, 2, 7, 1, 3], val = 2", output: "[2, 1, 3]", why: "The node with value 2 is returned together with its whole subtree." },
          { input: "root = [4, 2, 7, 1, 3], val = 5", output: "[]", why: "5 is not in the tree, so the answer is null (an empty tree)." },
        ]}
        hints={[
          <>You do not have to look at every node. Compare the target with the current value.</>,
          <>If the target is smaller, everything on the right is too big. If it is larger, everything on the left is too small.</>,
        ]}
        approaches={[
          {
            name: "Brute force: visit every node",
            idea: <p>Ignore the BST property and search the whole tree with an ordinary DFS until the value is found.</p>,
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
// Tree -> level-order array with null gaps (trailing nulls trimmed)
function serialize(root) {
  const out = [], queue = [root];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    if (node === null) { out.push(null); continue; }
    out.push(node.val);
    queue.push(node.left, node.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function searchBST(root, val) {
  if (root === null) return null;
  if (root.val === val) return root;
  return searchBST(root.left, val) ?? searchBST(root.right, val);
}

console.log(serialize(searchBST(buildTree([4, 2, 7, 1, 3]), 2))); // [2, 1, 3]
console.log(serialize(searchBST(buildTree([4, 2, 7, 1, 3]), 5))); // []`,
            explain: <p>Works on any binary tree but costs O(n) even when the tree is a BST.</p>,
          },
          {
            name: "Recursive: go to the one side that can hold the value",
            idea: <p>Equal: return the node. Smaller: search the left child. Larger: search the right child. <code>null</code> means not found.</p>,
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
// Tree -> level-order array with null gaps (trailing nulls trimmed)
function serialize(root) {
  const out = [], queue = [root];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    if (node === null) { out.push(null); continue; }
    out.push(node.val);
    queue.push(node.left, node.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function searchBST(root, val) {
  if (root === null || root.val === val) return root;
  return val < root.val ? searchBST(root.left, val) : searchBST(root.right, val);
}

console.log(serialize(searchBST(buildTree([4, 2, 7, 1, 3]), 2))); // [2, 1, 3]
console.log(serialize(searchBST(buildTree([4, 2, 7, 1, 3]), 5))); // []`,
            explain: <p>O(h) time and O(h) stack space. Each step discards a whole subtree.</p>,
          },
          {
            name: "Iterative: a loop instead of recursion",
            idea: <p>Walk down with a pointer, moving left or right, until you hit the value or fall off the tree.</p>,
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
// Tree -> level-order array with null gaps (trailing nulls trimmed)
function serialize(root) {
  const out = [], queue = [root];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    if (node === null) { out.push(null); continue; }
    out.push(node.val);
    queue.push(node.left, node.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function searchBST(root, val) {
  let cur = root;
  while (cur !== null && cur.val !== val) {
    cur = val < cur.val ? cur.left : cur.right;
  }
  return cur;
}

console.log(serialize(searchBST(buildTree([4, 2, 7, 1, 3]), 2))); // [2, 1, 3]
console.log(serialize(searchBST(buildTree([4, 2, 7, 1, 3]), 5))); // []`,
            explain: <p>O(h) time and O(1) extra space.</p>,
          },
        ]}
        compare={<p>The iterative loop: shortest to write correctly and no stack. The brute force is a trap only because it ignores what the question gave you. (LeetCode 700.)</p>}
      >
        <p>Given the root of a BST and an integer <code>val</code>, find the node whose value equals <code>val</code> and return the subtree rooted at it, or <code>null</code> if there is none.</p>
      </Problem>

      <Problem
        n={2}
        title="Insert into a binary search tree"
        level="Medium"
        examples={[
          { input: "root = [4, 2, 7, 1, 3], val = 5", output: "[4, 2, 7, 1, 3, 5]", why: "5 > 4 so go right; 5 < 7 so go left; that spot is empty, so 5 becomes the left child of 7." },
          { input: "root = [], val = 5", output: "[5]", why: "Inserting into an empty tree creates the root." },
        ]}
        hints={[
          <>Insertion is a search for the empty place where the value would have been.</>,
          <>You can always attach the new value as a leaf. No existing node has to move.</>,
        ]}
        approaches={[
          {
            name: "Recursive",
            idea: <p>If the node is <code>null</code>, return a new node. Otherwise recurse into the correct side and re-attach the returned subtree.</p>,
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
// Tree -> level-order array with null gaps (trailing nulls trimmed)
function serialize(root) {
  const out = [], queue = [root];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    if (node === null) { out.push(null); continue; }
    out.push(node.val);
    queue.push(node.left, node.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function insertIntoBST(root, val) {
  if (root === null) return new TreeNode(val);
  if (val < root.val) root.left = insertIntoBST(root.left, val);
  else root.right = insertIntoBST(root.right, val);
  return root;
}

console.log(serialize(insertIntoBST(buildTree([4, 2, 7, 1, 3]), 5)));  // [4, 2, 7, 1, 3, 5]
console.log(serialize(insertIntoBST(buildTree([]), 5)));                // [5]
console.log(serialize(insertIntoBST(buildTree([40, 20, 60, 10, 30, 50, 70]), 25))); // [40, 20, 60, 10, 30, 50, 70, null, null, 25]`,
            explain: <p>O(h) time and space. Re-assigning <code>root.left = ...</code> on the way back is harmless when nothing changed and does the work when a new leaf appears.</p>,
          },
          {
            name: "Iterative",
            idea: <p>Walk down to the last node on the path, and attach the new node to its empty side.</p>,
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
// Tree -> level-order array with null gaps (trailing nulls trimmed)
function serialize(root) {
  const out = [], queue = [root];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    if (node === null) { out.push(null); continue; }
    out.push(node.val);
    queue.push(node.left, node.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function insertIntoBST(root, val) {
  const fresh = new TreeNode(val);
  if (root === null) return fresh;
  let cur = root;
  while (true) {
    if (val < cur.val) {
      if (cur.left === null) { cur.left = fresh; break; }
      cur = cur.left;
    } else {
      if (cur.right === null) { cur.right = fresh; break; }
      cur = cur.right;
    }
  }
  return root;
}

console.log(serialize(insertIntoBST(buildTree([4, 2, 7, 1, 3]), 5)));  // [4, 2, 7, 1, 3, 5]
console.log(serialize(insertIntoBST(buildTree([]), 5)));                // [5]`,
            explain: <p>O(h) time, O(1) extra space. Handle the empty tree separately because there is no node to attach to.</p>,
          },
        ]}
        compare={<p>Either is fine; the recursive one is shorter. Remember that several results are valid (the judge accepts any valid BST), but adding a leaf is the simplest. (LeetCode 701.)</p>}
      >
        <p>Insert a value (not already in the tree) into a BST and return the root. Any resulting valid BST is accepted.</p>
      </Problem>

      <Problem
        n={3}
        title="Delete node in a BST"
        level="Medium"
        examples={[
          { input: "root = [5, 3, 6, 2, 4, null, 7], key = 3", output: "[5, 4, 6, 2, null, null, 7]", why: "3 has two children; its successor 4 takes its place." },
          { input: "root = [5, 3, 6, 2, 4, null, 7], key = 0", output: "[5, 3, 6, 2, 4, null, 7]", why: "0 is not in the tree, so nothing changes." },
          { input: "root = [], key = 0", output: "[]", why: "Nothing to delete." },
        ]}
        hints={[
          <>First search for the key. Then think about how many children the node has.</>,
          <>Zero or one child: replace the node with its child (or null).</>,
          <>Two children: the smallest value of the right subtree is the next larger value. It can take this node&apos;s place.</>,
        ]}
        approaches={[
          {
            name: "Brute force: rebuild the whole tree",
            idea: <p>Read all the values in inorder (sorted) order, drop the key, and build a balanced BST from what is left.</p>,
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

function deleteNode(root, key) {
  const values = [];
  (function inorder(n) { if (n) { inorder(n.left); if (n.val !== key) values.push(n.val); inorder(n.right); } })(root);
  function build(lo, hi) {
    if (lo > hi) return null;
    const mid = Math.floor((lo + hi) / 2);
    return new TreeNode(values[mid], build(lo, mid - 1), build(mid + 1, hi));
  }
  return build(0, values.length - 1);
}

const result = deleteNode(buildTree([5, 3, 6, 2, 4, null, 7]), 3);
const out = [];
(function inorder(n) { if (n) { inorder(n.left); out.push(n.val); inorder(n.right); } })(result);
console.log(out); // [2, 4, 5, 6, 7]`,
            explain: <p>O(n) time and space, and it reshuffles the whole tree even when one leaf was removed. The result is a valid BST, but it is far more work than needed.</p>,
          },
          {
            name: "Recursive with the inorder successor",
            idea: (
              <ol>
                <li>Smaller key: delete in the left subtree. Larger key: delete in the right subtree.</li>
                <li>Found with no left child: return the right child. No right child: return the left child.</li>
                <li>Two children: copy the smallest value of the right subtree into this node, then delete that value from the right subtree.</li>
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
// Tree -> level-order array with null gaps (trailing nulls trimmed)
function serialize(root) {
  const out = [], queue = [root];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    if (node === null) { out.push(null); continue; }
    out.push(node.val);
    queue.push(node.left, node.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function deleteNode(root, key) {
  if (root === null) return null;
  if (key < root.val) root.left = deleteNode(root.left, key);
  else if (key > root.val) root.right = deleteNode(root.right, key);
  else {
    if (root.left === null) return root.right;
    if (root.right === null) return root.left;
    let succ = root.right;
    while (succ.left !== null) succ = succ.left;
    root.val = succ.val;
    root.right = deleteNode(root.right, succ.val);
  }
  return root;
}

console.log(serialize(deleteNode(buildTree([5, 3, 6, 2, 4, null, 7]), 3))); // [5, 4, 6, 2, null, null, 7]
console.log(serialize(deleteNode(buildTree([5, 3, 6, 2, 4, null, 7]), 0))); // [5, 3, 6, 2, 4, null, 7]
console.log(serialize(deleteNode(buildTree([]), 0)));                        // []`,
            explain: <p>O(h) time. The successor never has a left child, so the recursive delete of the successor is a simple case.</p>,
          },
          {
            name: "Re-link instead of copying values",
            idea: <p>For a node with two children, hang its left subtree under the successor (the leftmost node of the right subtree) and return the right subtree in its place. No values are copied, so this suits cases where nodes are heavy objects.</p>,
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
// Tree -> level-order array with null gaps (trailing nulls trimmed)
function serialize(root) {
  const out = [], queue = [root];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    if (node === null) { out.push(null); continue; }
    out.push(node.val);
    queue.push(node.left, node.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function deleteNode(root, key) {
  if (root === null) return null;
  if (key < root.val) { root.left = deleteNode(root.left, key); return root; }
  if (key > root.val) { root.right = deleteNode(root.right, key); return root; }
  if (root.left === null) return root.right;
  if (root.right === null) return root.left;
  let succ = root.right;
  while (succ.left !== null) succ = succ.left;
  succ.left = root.left;          // everything on the left is smaller than the successor
  return root.right;              // the right subtree takes this node's place
}

console.log(serialize(deleteNode(buildTree([5, 3, 6, 2, 4, null, 7]), 3))); // [5, 4, 6, 2, null, null, 7]
console.log(serialize(deleteNode(buildTree([5, 3, 6, 2, 4, null, 7]), 5))); // [6, 3, 7, 2, 4]`,
            explain: <p>Also O(h) time. It can make the tree a bit taller than the copy approach, but it is still a valid BST.</p>,
          },
        ]}
        compare={<p>The recursive successor version is the standard answer. Know the three cases cold; the re-linking variation is a good follow-up. (LeetCode 450.)</p>}
      >
        <p>Delete the node with value <code>key</code> from a BST (if present) and return the root of the resulting BST.</p>
      </Problem>

      <Problem
        n={4}
        title="Validate binary search tree"
        level="Medium"
        examples={[
          { input: "root = [2, 1, 3]", output: "true", why: "1 < 2 < 3." },
          { input: "root = [5, 1, 4, null, null, 3, 6]", output: "false", why: "3 is in the right subtree of 5 but is smaller than 5, even though it is fine next to its own parent 4." },
        ]}
        hints={[
          <>Checking each node against its children is not enough. Which ancestors constrain a deep node?</>,
          <>Carry a lower and an upper limit down the tree and update one of them at each step.</>,
          <>Alternatively, recall what the inorder traversal of a BST looks like.</>,
        ]}
        approaches={[
          {
            name: "Brute force: compare with the whole subtrees",
            idea: <p>For every node, find the maximum of its left subtree and the minimum of its right subtree and compare. Repeat for all nodes.</p>,
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

function isValidBST(root) {
  function max(n) { return n === null ? -Infinity : Math.max(n.val, max(n.left), max(n.right)); }
  function min(n) { return n === null ? Infinity : Math.min(n.val, min(n.left), min(n.right)); }
  if (root === null) return true;
  if (max(root.left) >= root.val || min(root.right) <= root.val) return false;
  return isValidBST(root.left) && isValidBST(root.right);
}

console.log(isValidBST(buildTree([2, 1, 3])));                       // true
console.log(isValidBST(buildTree([5, 1, 4, null, null, 3, 6])));     // false`,
            explain: <p>Correct, but each node scans its whole subtree: O(n²) on a chain-like tree.</p>,
          },
          {
            name: "Pass down lower and upper bounds",
            idea: (
              <ol>
                <li>Start with limits (−∞, +∞).</li>
                <li>A node must be strictly inside its limits.</li>
                <li>Left child: new upper limit = this value. Right child: new lower limit = this value.</li>
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

function isValidBST(root) {
  function check(node, lo, hi) {
    if (node === null) return true;
    if (node.val <= lo || node.val >= hi) return false;
    return check(node.left, lo, node.val) && check(node.right, node.val, hi);
  }
  return check(root, -Infinity, Infinity);
}

console.log(isValidBST(buildTree([2, 1, 3])));                       // true
console.log(isValidBST(buildTree([5, 1, 4, null, null, 3, 6])));     // false
console.log(isValidBST(buildTree([2147483647])));                    // true`,
            explain: <p>O(n) time, O(h) space. Using <code>Infinity</code> instead of numeric extremes keeps a node holding the smallest or largest integer from failing wrongly.</p>,
          },
          {
            name: "Inorder must be strictly increasing",
            idea: <p>Do an inorder traversal (iteratively, so we can stop early) and remember the previous value. If any value is not larger than the previous one, the tree is not a BST.</p>,
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

function isValidBST(root) {
  const stack = [];
  let cur = root;
  let prev = -Infinity;
  while (cur !== null || stack.length > 0) {
    while (cur !== null) { stack.push(cur); cur = cur.left; }
    cur = stack.pop();
    if (cur.val <= prev) return false;
    prev = cur.val;
    cur = cur.right;
  }
  return true;
}

console.log(isValidBST(buildTree([2, 1, 3])));                       // true
console.log(isValidBST(buildTree([5, 1, 4, null, null, 3, 6])));     // false`,
            explain: <p>O(n) time, O(h) space, and it stops at the first violation. It works because a tree is a BST exactly when its inorder sequence is strictly increasing.</p>,
          },
        ]}
        compare={<p>Bounds or inorder, both O(n). The bounds version generalises to other &quot;every ancestor constrains me&quot; problems. Never submit the parent-only check. (LeetCode 98.)</p>}
      >
        <p>Return whether a binary tree is a valid BST: for every node, all values in the left subtree are smaller, all in the right subtree are larger, and both subtrees are valid BSTs.</p>
      </Problem>

      <Problem
        n={5}
        title="Kth smallest element in a BST"
        level="Medium"
        examples={[
          { input: "root = [3, 1, 4, null, 2], k = 1", output: "1", why: "Inorder order is 1, 2, 3, 4; the first is 1." },
          { input: "root = [5, 3, 6, 2, 4, null, null, 1], k = 3", output: "3", why: "Inorder order is 1, 2, 3, 4, 5, 6; the third is 3." },
        ]}
        hints={[
          <>Which traversal lists a BST in sorted order?</>,
          <>Do you need to finish the traversal once you have counted k nodes?</>,
        ]}
        approaches={[
          {
            name: "Collect the full inorder list",
            idea: <p>Walk the whole tree in inorder, store every value, and take element k − 1.</p>,
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

function kthSmallest(root, k) {
  const values = [];
  (function inorder(n) {
    if (n === null) return;
    inorder(n.left);
    values.push(n.val);
    inorder(n.right);
  })(root);
  return values[k - 1];
}

console.log(kthSmallest(buildTree([3, 1, 4, null, 2]), 1));                  // 1
console.log(kthSmallest(buildTree([5, 3, 6, 2, 4, null, null, 1]), 3));      // 3`,
            explain: <p>O(n) time and space, even when k is tiny.</p>,
          },
          {
            name: "Recursive inorder with a counter",
            idea: <p>Count nodes as they are visited and remember the value when the count reaches k. Skip the right side once the answer is found.</p>,
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

function kthSmallest(root, k) {
  let count = 0;
  let answer = null;
  function inorder(n) {
    if (n === null || answer !== null) return;
    inorder(n.left);
    count++;
    if (count === k) { answer = n.val; return; }
    inorder(n.right);
  }
  inorder(root);
  return answer;
}

console.log(kthSmallest(buildTree([3, 1, 4, null, 2]), 1));                  // 1
console.log(kthSmallest(buildTree([5, 3, 6, 2, 4, null, null, 1]), 3));      // 3`,
            explain: <p>O(h + k) time and O(h) space: once the answer is set, every remaining call returns immediately. A value of 0 is handled correctly because we test <code>answer !== null</code>, not truthiness.</p>,
          },
          {
            name: "Iterative inorder with early exit",
            idea: <p>Push the left spine onto a stack, pop to get the next smallest, decrease k, return when k reaches 0, then move into the right child.</p>,
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

function kthSmallest(root, k) {
  const stack = [];
  let cur = root;
  while (cur !== null || stack.length > 0) {
    while (cur !== null) { stack.push(cur); cur = cur.left; }
    cur = stack.pop();
    if (--k === 0) return cur.val;
    cur = cur.right;
  }
  return undefined;
}

console.log(kthSmallest(buildTree([3, 1, 4, null, 2]), 1));                  // 1
console.log(kthSmallest(buildTree([5, 3, 6, 2, 4, null, null, 1]), 3));      // 3
console.log(kthSmallest(buildTree([5, 3, 6, 2, 4, null, null, 1]), 6));      // 6`,
            explain: <p>O(h + k) time, O(h) space. If the tree changes often and you must answer many queries, store the size of each subtree in each node; then you can steer left or right by counts in O(h) per query.</p>,
          },
        ]}
        compare={<p>The iterative version: it uses the BST property, stops early and has no recursion limit. (LeetCode 230.)</p>}
      >
        <p>Return the k-th smallest value (1-indexed) in a BST. It is guaranteed that 1 ≤ k ≤ the number of nodes.</p>
      </Problem>

      <Problem
        n={6}
        title="Convert sorted array to binary search tree"
        level="Easy"
        examples={[
          { input: "nums = [-10, -3, 0, 5, 9]", output: "[0, -3, 9, -10, null, 5]", why: "0 is the middle; -10, -3 go left and 5, 9 go right. [0, -10, 5, null, -3, null, 9] is also accepted." },
          { input: "nums = [1, 3]", output: "[3, 1]", why: "Either value can be the root; [1, null, 3] is also accepted." },
        ]}
        hints={[
          <>Which element should be the root so that both sides get a similar number of nodes?</>,
          <>After choosing the root, the left part and right part of the array are the same problem again.</>,
        ]}
        approaches={[
          {
            name: "Brute force: insert one by one",
            idea: <p>Insert the numbers in array order with the normal BST insert.</p>,
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

function insert(root, val) {
  if (root === null) return new TreeNode(val);
  if (val < root.val) root.left = insert(root.left, val);
  else root.right = insert(root.right, val);
  return root;
}
function height(n) { return n === null ? 0 : 1 + Math.max(height(n.left), height(n.right)); }

function sortedArrayToBST(nums) {
  let root = null;
  for (const x of nums) root = insert(root, x);
  return root;
}

console.log(height(sortedArrayToBST([-10, -3, 0, 5, 9]))); // 5   (a chain, not balanced)`,
            explain: <p>It is a valid BST but not height-balanced: sorted input makes a chain, and the whole build costs O(n²).</p>,
          },
          {
            name: "Middle element as root, slicing the array",
            idea: <p>Take the middle element as the root, then build the left child from the left slice and the right child from the right slice.</p>,
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
// Tree -> level-order array with null gaps (trailing nulls trimmed)
function serialize(root) {
  const out = [], queue = [root];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    if (node === null) { out.push(null); continue; }
    out.push(node.val);
    queue.push(node.left, node.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function sortedArrayToBST(nums) {
  if (nums.length === 0) return null;
  const mid = Math.ceil((nums.length - 1) / 2);
  return new TreeNode(
    nums[mid],
    sortedArrayToBST(nums.slice(0, mid)),
    sortedArrayToBST(nums.slice(mid + 1)),
  );
}

console.log(serialize(sortedArrayToBST([-10, -3, 0, 5, 9]))); // [0, -3, 9, -10, null, 5]
console.log(serialize(sortedArrayToBST([1, 3])));              // [3, 1]`,
            explain: <p>Balanced, but each <code>slice</code> copies elements, giving O(n log n) time in total.</p>,
          },
          {
            name: "Middle element as root, with index bounds",
            idea: <p>Pass <code>lo</code> and <code>hi</code> indices instead of copying: the root is <code>nums[mid]</code>, the left child is built from <code>lo..mid-1</code>, the right from <code>mid+1..hi</code>.</p>,
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
// Tree -> level-order array with null gaps (trailing nulls trimmed)
function serialize(root) {
  const out = [], queue = [root];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    if (node === null) { out.push(null); continue; }
    out.push(node.val);
    queue.push(node.left, node.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function sortedArrayToBST(nums) {
  function build(lo, hi) {
    if (lo > hi) return null;
    const mid = Math.ceil((lo + hi) / 2);
    return new TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi));
  }
  return build(0, nums.length - 1);
}

console.log(serialize(sortedArrayToBST([-10, -3, 0, 5, 9]))); // [0, -3, 9, -10, null, 5]
console.log(serialize(sortedArrayToBST([1, 3])));              // [3, 1]
console.log(serialize(sortedArrayToBST([])));                  // []`,
            explain: <p>O(n) time (each element becomes exactly one node) and O(log n) recursion depth. The tree is height-balanced because the two halves differ in size by at most one.</p>,
          },
        ]}
        compare={<p>The index version. Show that inserting in sorted order degenerates, then fix it with &quot;middle first&quot;. (LeetCode 108.)</p>}
      >
        <p>Given a sorted array (ascending), convert it to a <strong>height-balanced</strong> BST: the depths of the two subtrees of every node differ by at most 1. Any valid answer is accepted.</p>
      </Problem>

      <Problem
        n={7}
        title="Two sum IV: input is a BST"
        level="Easy"
        examples={[
          { input: "root = [5, 3, 6, 2, 4, null, 7], k = 9", output: "true", why: "2 + 7 = 9." },
          { input: "root = [5, 3, 6, 2, 4, null, 7], k = 28", output: "false", why: "No two values add up to 28." },
        ]}
        hints={[
          <>You solved &quot;two sum&quot; with a hash set before. A tree can be walked while filling one.</>,
          <>A BST&apos;s inorder traversal is sorted. Which technique works on a sorted array?</>,
          <>Could two pointers walk the BST directly, one from the smallest value upward and one from the largest downward?</>,
        ]}
        approaches={[
          {
            name: "Hash set while traversing",
            idea: <p>Visit every node; if <code>k − node.val</code> was seen earlier, return true, otherwise remember the value.</p>,
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

function findTarget(root, k) {
  const seen = new Set();
  function dfs(node) {
    if (node === null) return false;
    if (seen.has(k - node.val)) return true;
    seen.add(node.val);
    return dfs(node.left) || dfs(node.right);
  }
  return dfs(root);
}

console.log(findTarget(buildTree([5, 3, 6, 2, 4, null, 7]), 9));    // true
console.log(findTarget(buildTree([5, 3, 6, 2, 4, null, 7]), 28));   // false`,
            explain: <p>O(n) time and O(n) space. Works for any binary tree, but does not use the BST property.</p>,
          },
          {
            name: "Inorder array plus two pointers",
            idea: <p>Flatten the BST into a sorted array with inorder, then run the classic two-pointer search from both ends.</p>,
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

function findTarget(root, k) {
  const values = [];
  (function inorder(n) {
    if (n === null) return;
    inorder(n.left);
    values.push(n.val);
    inorder(n.right);
  })(root);
  let i = 0, j = values.length - 1;
  while (i < j) {
    const sum = values[i] + values[j];
    if (sum === k) return true;
    if (sum < k) i++;
    else j--;
  }
  return false;
}

console.log(findTarget(buildTree([5, 3, 6, 2, 4, null, 7]), 9));    // true
console.log(findTarget(buildTree([5, 3, 6, 2, 4, null, 7]), 28));   // false`,
            explain: <p>O(n) time and O(n) space, with a very simple second step.</p>,
          },
          {
            name: "Two iterators with stacks (O(h) space)",
            idea: <p>Keep two stacks: one that yields values in ascending order (the left spine, like the iterative inorder) and one in descending order (the right spine). Move the smaller pointer up when the sum is too small and the larger pointer down when it is too big.</p>,
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

function findTarget(root, k) {
  if (root === null) return false;
  const asc = [], desc = [];
  const pushLeft = (n) => { while (n !== null) { asc.push(n); n = n.left; } };
  const pushRight = (n) => { while (n !== null) { desc.push(n); n = n.right; } };
  const nextSmall = () => { const n = asc.pop(); pushLeft(n.right); return n.val; };
  const nextLarge = () => { const n = desc.pop(); pushRight(n.left); return n.val; };
  pushLeft(root);
  pushRight(root);
  let lo = nextSmall(), hi = nextLarge();
  while (lo < hi) {
    const sum = lo + hi;
    if (sum === k) return true;
    if (sum < k) lo = nextSmall();
    else hi = nextLarge();
  }
  return false;
}

console.log(findTarget(buildTree([5, 3, 6, 2, 4, null, 7]), 9));    // true
console.log(findTarget(buildTree([5, 3, 6, 2, 4, null, 7]), 28));   // false`,
            explain: <p>O(n) time and only O(h) space, because we never hold more than one root-to-node path per iterator. It is the most impressive answer but the easiest to get wrong; the set version is a perfectly good interview answer.</p>,
          },
        ]}
        compare={<p>Start with the hash set (works anywhere) and mention that the BST allows two-pointers on the inorder array, or O(h) space with two stack iterators. (LeetCode 653.)</p>}
      >
        <p>Given a BST and an integer <code>k</code>, return <code>true</code> if two different nodes have values that sum to <code>k</code>.</p>
      </Problem>
    </>
  );
}
