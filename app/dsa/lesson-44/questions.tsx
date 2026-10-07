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
          { input: "root = [4, 2, 7, 1, 3], val = 2", output: "[2, 1, 3]", why: "We return the node with value 2 together with everything below it." },
          { input: "root = [4, 2, 7, 1, 3], val = 5", output: "[]", why: "5 is not in the tree, so the answer is null (an empty tree)." },
        ]}
        hints={[
          <>You do not have to look at every node. Compare the target with the current value.</>,
          <>If the target is smaller, everything on the right is too big. If it is larger, everything on the left is too small. So you can ignore that side.</>,
        ]}
        approaches={[
          {
            name: "Brute force: visit every node",
            idea: <p>Ignore the BST property. Search the whole tree with an ordinary DFS (depth-first search) until you find the value.</p>,
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
            explain: <p>It works on any binary tree, but it costs O(n) even when the tree is a BST.</p>,
          },
          {
            name: "Recursive: go to the one side that can hold the value",
            idea: <p>If equal, return the node. If the target is smaller, search the left child. If it is larger, search the right child. <code>null</code> means not found.</p>,
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
            explain: <p>O(h) time and O(h) stack space. Each step ignores a whole side of the tree.</p>,
          },
          {
            name: "A loop instead of recursion",
            idea: <p>Walk down with a pointer (a variable that points to the current node). Move left or right until you find the value or fall off the tree.</p>,
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
        compare={<p>Use the loop. It is short to write correctly and needs no stack. The brute force is a trap only because it ignores the BST property that the question gave you. (LeetCode 700.)</p>}
      >
        <p>You get the root of a BST and an integer <code>val</code>, find the node whose value equals <code>val</code>. Return that node with everything below it, or <code>null</code> if there is none.</p>
      </Problem>

      <Problem
        n={2}
        title="Insert into a binary search tree"
        level="Medium"
        examples={[
          { input: "root = [4, 2, 7, 1, 3], val = 5", output: "[4, 2, 7, 1, 3, 5]", why: "5 > 4, so go right. 5 < 7, so go left. That spot is empty, so 5 becomes the left child of 7." },
          { input: "root = [], val = 5", output: "[5]", why: "Inserting into an empty tree makes the new node the root." },
        ]}
        hints={[
          <>To insert, search for the empty place where the value should be.</>,
          <>You can always attach the new value as a leaf (a node with no children). No existing node has to move.</>,
        ]}
        approaches={[
          {
            name: "Recursive",
            idea: <p>If the node is <code>null</code>, return a new node. Otherwise call the function on the correct side, and attach the result back to the node.</p>,
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
            explain: <p>O(h) time and space. Setting <code>root.left = ...</code> again on the way back does no harm when nothing changed. It does the real work when a new leaf appears.</p>,
          },
          {
            name: "A loop",
            idea: <p>Walk down to the last node on the path. Attach the new node to its empty side.</p>,
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
            explain: <p>O(h) time, O(1) extra space. Handle the empty tree on its own, because there is no node to attach to.</p>,
          },
        ]}
        compare={<p>Either one is fine. The recursive one is shorter. Several results are valid (the judge accepts any valid BST), but adding a leaf is the simplest. (LeetCode 701.)</p>}
      >
        <p>Insert a value (one that is not already in the tree) into a BST and return the root. Any valid BST as a result is accepted.</p>
      </Problem>

      <Problem
        n={3}
        title="Delete node in a BST"
        level="Medium"
        examples={[
          { input: "root = [5, 3, 6, 2, 4, null, 7], key = 3", output: "[5, 4, 6, 2, null, null, 7]", why: "3 has two children. Its successor (the next larger value) 4 takes its place." },
          { input: "root = [5, 3, 6, 2, 4, null, 7], key = 0", output: "[5, 3, 6, 2, 4, null, 7]", why: "0 is not in the tree, so nothing changes." },
          { input: "root = [], key = 0", output: "[]", why: "There is nothing to delete." },
        ]}
        hints={[
          <>First search for the key. Then think about how many children the node has.</>,
          <>If it has zero or one child, replace the node with that child (or with null).</>,
          <>If it has two children, the smallest value on its right side is the next larger value. That value can take the place of this node.</>,
        ]}
        approaches={[
          {
            name: "Brute force: rebuild the whole tree",
            idea: <p>Read all the values in inorder (sorted) order. Leave out the key. Build a balanced BST from the rest.</p>,
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
            explain: <p>O(n) time and space. It rebuilds the whole tree even if you only remove one leaf. The result is a valid BST, but it is much more work than needed.</p>,
          },
          {
            name: "Recursion with the inorder successor (the next larger value)",
            idea: (
              <ol>
                <li>If the key is smaller, delete in the left side. If it is larger, delete in the right side.</li>
                <li>If you find it and it has no left child, return the right child. If it has no right child, return the left child.</li>
                <li>If it has two children, copy the smallest value of the right side into this node. Then delete that value from the right side.</li>
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
            explain: <p>O(h) time. The successor never has a left child, so deleting it is an easy case.</p>,
          },
          {
            name: "Re-link nodes instead of copying values",
            idea: <p>For a node with two children, hang its left side under the successor (the leftmost node of the right side). Then return the right side in its place. No values are copied, so this is good when nodes are big objects.</p>,
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
  return root.right;              // the right side takes the place of this node
}

console.log(serialize(deleteNode(buildTree([5, 3, 6, 2, 4, null, 7]), 3))); // [5, 4, 6, 2, null, null, 7]
console.log(serialize(deleteNode(buildTree([5, 3, 6, 2, 4, null, 7]), 5))); // [6, 3, 7, 2, 4]`,
            explain: <p>Also O(h) time. It can make the tree a bit taller than the copy method, but it is still a valid BST.</p>,
          },
        ]}
        compare={<p>The recursive successor version is the standard answer. Know the three cases well. The re-linking version is a good follow-up. (LeetCode 450.)</p>}
      >
        <p>Delete the node with value <code>key</code> from a BST (if present) and return the root of the resulting BST.</p>
      </Problem>

      <Problem
        n={4}
        title="Validate binary search tree"
        level="Medium"
        examples={[
          { input: "root = [2, 1, 3]", output: "true", why: "1 < 2 < 3." },
          { input: "root = [5, 1, 4, null, null, 3, 6]", output: "false", why: "3 is on the right side of 5 but is smaller than 5. It looks fine next to its own parent 4, but it breaks the rule for 5." },
        ]}
        hints={[
          <>Checking each node against its children is not enough. Which ancestors (the parent, grandparent, and so on) limit a deep node?</>,
          <>Carry a lower limit and an upper limit down the tree. Update one of them at each step.</>,
          <>Or think about what the inorder walk of a BST looks like.</>,
        ]}
        approaches={[
          {
            name: "Brute force: compare with the whole left and right sides",
            idea: <p>For every node, find the largest value on its left side and the smallest value on its right side, and compare them with the node. Do this for all nodes.</p>,
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
            explain: <p>Correct, but each node scans everything below it. It takes O(n²) on a tree shaped like a chain.</p>,
          },
          {
            name: "Pass down a lower and an upper limit",
            idea: (
              <ol>
                <li>Start with the limits (−∞, +∞), which means no limit.</li>
                <li>A node must be strictly between its limits.</li>
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
            explain: <p>O(n) time, O(h) space. We use <code>Infinity</code>, not the smallest or largest whole number. Then a node that really holds the smallest or largest integer does not fail by mistake.</p>,
          },
          {
            name: "Inorder must be strictly increasing",
            idea: <p>Do an inorder walk (with your own stack, so we can stop early) and remember the previous value. If any value is not larger than the previous one, the tree is not a BST.</p>,
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
            explain: <p>O(n) time, O(h) space. It stops at the first value that breaks the rule. It works because a tree is a BST exactly when its inorder list is strictly increasing.</p>,
          },
        ]}
        compare={<p>Use limits or inorder. Both are O(n). The limits version also works for other problems where every ancestor limits a node. Never give the answer that checks only the parent. (LeetCode 98.)</p>}
      >
        <p>Return whether a binary tree is a valid BST: for every node, all values on the left side are smaller, all values on the right side are larger, and both sides are valid BSTs too.</p>
      </Problem>

      <Problem
        n={5}
        title="Kth smallest element in a BST"
        level="Medium"
        examples={[
          { input: "root = [3, 1, 4, null, 2], k = 1", output: "1", why: "In inorder the values come as 1, 2, 3, 4. The first one is 1." },
          { input: "root = [5, 3, 6, 2, 4, null, null, 1], k = 3", output: "3", why: "In inorder the values come as 1, 2, 3, 4, 5, 6. The third one is 3." },
        ]}
        hints={[
          <>Which walk lists a BST in sorted order?</>,
          <>Do you need to finish the walk once you have counted k nodes?</>,
        ]}
        approaches={[
          {
            name: "Collect the full inorder list",
            idea: <p>Walk the whole tree in inorder and store every value. Then take the item at index k − 1.</p>,
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
            idea: <p>Count the nodes as you visit them. Remember the value when the count reaches k. Skip the right side once you have the answer.</p>,
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
            explain: <p>O(h + k) time and O(h) space. Once the answer is set, every remaining call returns at once. A value of 0 works correctly, because we test <code>answer !== null</code>, not whether the value is &quot;truthy&quot; (JavaScript treats 0 as false in an <code>if</code>).</p>,
          },
          {
            name: "Inorder with your own stack and an early exit",
            idea: <p>Push the whole chain of left children onto a stack. Pop to get the next smallest value and decrease k. Return when k reaches 0. Otherwise move to the right child.</p>,
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
            explain: <p>O(h + k) time, O(h) space. Suppose the tree changes often and you must answer many queries. Then store in each node the size of the part below it. You can then choose left or right by using these counts, in O(h) per query.</p>,
          },
        ]}
        compare={<p>Use the version with your own stack. It uses the BST property, stops early and has no limit on recursion depth. (LeetCode 230.)</p>}
      >
        <p>Return the k-th smallest value in a BST (counting from 1). It is guaranteed that 1 ≤ k ≤ the number of nodes.</p>
      </Problem>

      <Problem
        n={6}
        title="Convert sorted array to binary search tree"
        level="Easy"
        examples={[
          { input: "nums = [-10, -3, 0, 5, 9]", output: "[0, -3, 9, -10, null, 5]", why: "0 is the middle. -10 and -3 go left, and 5 and 9 go right. [0, -10, 5, null, -3, null, 9] is also accepted." },
          { input: "nums = [1, 3]", output: "[3, 1]", why: "Either value can be the root. [1, null, 3] is also accepted." },
        ]}
        hints={[
          <>Which element should be the root, so that both sides get about the same number of nodes?</>,
          <>After you choose the root, the left part and the right part of the array are the same problem again.</>,
        ]}
        approaches={[
          {
            name: "Brute force: insert one by one",
            idea: <p>Insert the numbers in the order of the array, using the normal BST insert.</p>,
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
            explain: <p>It is a valid BST but it is not height-balanced. Sorted input makes a chain, and the whole build costs O(n²).</p>,
          },
          {
            name: "Middle element as root, slicing the array",
            idea: <p>Take the middle element as the root. Build the left child from the left slice (the left part of the array) and the right child from the right slice.</p>,
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
            explain: <p>The tree is balanced, but each <code>slice</code> copies elements. The total time is O(n log n).</p>,
          },
          {
            name: "Middle element as root, with index bounds",
            idea: <p>Do not copy. Pass the positions <code>lo</code> and <code>hi</code> instead. The root is <code>nums[mid]</code>. Build the left child from <code>lo..mid-1</code> and the right child from <code>mid+1..hi</code>.</p>,
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
        compare={<p>Use the version with positions. Show that inserting in sorted order gives a chain, then fix it with &quot;middle first&quot;. (LeetCode 108.)</p>}
      >
        <p>You get an array sorted from small to large. Convert it to a <strong>height-balanced</strong> BST: at every node, the heights of the left side and right side differ by at most 1. Any valid answer is accepted.</p>
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
          <>You solved &quot;two sum&quot; with a hash set before. You can walk a tree and fill a set at the same time.</>,
          <>The inorder walk of a BST gives a sorted list. Which technique works on a sorted array?</>,
          <>Could two pointers walk the BST directly? One would start at the smallest value and go up. The other would start at the largest value and go down.</>,
        ]}
        approaches={[
          {
            name: "Hash set while walking the tree",
            idea: <p>Visit every node. If you saw <code>k − node.val</code> earlier, return true. Otherwise remember the value.</p>,
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
            explain: <p>O(n) time and O(n) space. It works for any binary tree, but it does not use the BST property.</p>,
          },
          {
            name: "Inorder array plus two pointers",
            idea: <p>Turn the BST into a sorted array with inorder. Then run the classic two-pointer search from both ends.</p>,
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
            explain: <p>O(n) time and O(n) space. The second step is very simple.</p>,
          },
          {
            name: "Two iterators with stacks (O(h) space)",
            idea: <p>Keep two stacks. One gives values from small to large (it holds the chain of left children, like the inorder with a stack). The other gives values from large to small (it holds the chain of right children). If the sum is too small, move the small pointer up. If the sum is too big, move the large pointer down.</p>,
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
            explain: <p>O(n) time and only O(h) space, because each stack holds at most one path from the root to a node. It is the most impressive answer, but the easiest to get wrong. The set version is a perfectly good interview answer.</p>,
          },
        ]}
        compare={<p>Start with the hash set. It works on any tree. Then mention that a BST allows two pointers on the inorder array, or O(h) space with two stacks. (LeetCode 653.)</p>}
      >
        <p>You get a BST and an integer <code>k</code>. Return <code>true</code> if two different nodes have values that add up to <code>k</code>.</p>
      </Problem>
    </>
  );
}
