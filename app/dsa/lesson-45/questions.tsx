import Problem from "@/components/dsa/Problem";

/** Lesson 45 practice questions: lowest common ancestor and building trees. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Lowest common ancestor of a binary tree"
        level="Medium"
        examples={[
          { input: "root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 1", output: "3", why: "5 is in the left subtree of 3 and 1 in the right, so the paths split at the root." },
          { input: "root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 4", output: "5", why: "4 is below 5, and a node may be its own ancestor." },
        ]}
        hints={[
          <>Think about the path from the root to <code>p</code> and the path from the root to <code>q</code>. Where do they stop being the same?</>,
          <>Or let a recursive call report what it finds in its subtree: nothing, one target, or the answer.</>,
          <>If both the left and the right call return something, the current node is the meeting point.</>,
        ]}
        approaches={[
          {
            name: "Compare the two root paths",
            idea: (
              <ol>
                <li>Find the path from the root to <code>p</code> and the path from the root to <code>q</code> (each is a list of nodes).</li>
                <li>Walk both lists together; the last node at which they are still identical is the LCA.</li>
              </ol>
            ),
            code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function buildTree(arr) {                // level-order array, null marks a gap
  if (!arr.length || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}
function find(root, val) {               // demo helper: the node holding val
  if (root === null) return null;
  if (root.val === val) return root;
  return find(root.left, val) || find(root.right, val);
}

function pathTo(root, target, path = []) {
  if (root === null) return null;
  path.push(root);
  if (root === target) return path;
  const found = pathTo(root.left, target, path) || pathTo(root.right, target, path);
  if (found) return found;
  path.pop();                              // dead end: undo and let the caller try elsewhere
  return null;
}

function lowestCommonAncestor(root, p, q) {
  const a = pathTo(root, p), b = pathTo(root, q);
  let lca = null;
  for (let i = 0; i < a.length && i < b.length && a[i] === b[i]; i++) lca = a[i];
  return lca;
}

const root = buildTree([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
console.log(lowestCommonAncestor(root, find(root, 5), find(root, 1)).val); // 3
console.log(lowestCommonAncestor(root, find(root, 5), find(root, 4)).val); // 5`,
            explain: <p>Two searches and a comparison: O(n) time, O(h) space for the paths. It is correct and easy to explain, but needs two passes and extra lists.</p>,
          },
          {
            name: "One recursive pass",
            idea: (
              <ol>
                <li>If the node is null, <code>p</code> or <code>q</code>, return it.</li>
                <li>Ask both subtrees.</li>
                <li>If both answered, return this node; otherwise return whichever answered (or null).</li>
              </ol>
            ),
            code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function buildTree(arr) {                // level-order array, null marks a gap
  if (!arr.length || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}
function find(root, val) {               // demo helper: the node holding val
  if (root === null) return null;
  if (root.val === val) return root;
  return find(root.left, val) || find(root.right, val);
}

function lowestCommonAncestor(root, p, q) {
  if (root === null || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root;
  return left || right;
}

const root = buildTree([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
console.log(lowestCommonAncestor(root, find(root, 5), find(root, 1)).val); // 3
console.log(lowestCommonAncestor(root, find(root, 5), find(root, 4)).val); // 5
console.log(lowestCommonAncestor(root, find(root, 7), find(root, 8)).val); // 3`,
            explain: <p>Returning at <code>p</code> or <code>q</code> without looking below is safe: if the other target is under it, this node is the LCA; if not, an ancestor will see the other target on its other side. O(n) time, O(h) space.</p>,
          },
        ]}
        compare={<p>The one-pass recursion; mention the path comparison first if you want an easy-to-verify starting point. (LeetCode 236.)</p>}
      >
        <p>Given a binary tree and two nodes <code>p</code> and <code>q</code> that are both in it, return their lowest common ancestor: the deepest node that has both as descendants (a node counts as a descendant of itself).</p>
      </Problem>

      <Problem
        n={2}
        title="Lowest common ancestor of a BST"
        level="Medium"
        examples={[
          { input: "root = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p = 2, q = 8", output: "6", why: "2 is smaller than 6 and 8 is bigger, so they split at the root." },
          { input: "root = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p = 2, q = 4", output: "2", why: "4 is in the right subtree of 2, and a node may be its own ancestor." },
        ]}
        hints={[
          <>At any node, compare both values with the node&apos;s value. When are they on the same side?</>,
          <>While both are on the same side, you can step that way and never look at the other side.</>,
        ]}
        approaches={[
          {
            name: "Ignore the ordering",
            idea: <p>Use the general binary-tree recursion from question 1. It works on any tree, including a BST, but visits up to every node.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function buildTree(arr) {                // level-order array, null marks a gap
  if (!arr.length || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function lowestCommonAncestor(root, p, q) {
  if (root === null || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root;
  return left || right;
}

const root = buildTree([6, 2, 8, 0, 4, 7, 9, null, null, 3, 5]);
const node = (v) => { let c = root; while (c.val !== v) c = v < c.val ? c.left : c.right; return c; };
console.log(lowestCommonAncestor(root, node(2), node(8)).val); // 6
console.log(lowestCommonAncestor(root, node(3), node(5)).val); // 4`,
            explain: <p>O(n) time, O(h) space. Correct, but it throws away the key fact that the tree is ordered.</p>,
          },
          {
            name: "Walk down using the order (iterative)",
            idea: <p>Start at the root. Both values smaller: go left. Both bigger: go right. Otherwise stop: this node is the LCA.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function buildTree(arr) {                // level-order array, null marks a gap
  if (!arr.length || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function lowestCommonAncestor(root, p, q) {
  let cur = root;
  while (cur !== null) {
    if (p.val < cur.val && q.val < cur.val) cur = cur.left;
    else if (p.val > cur.val && q.val > cur.val) cur = cur.right;
    else return cur;
  }
  return null;
}

const root = buildTree([6, 2, 8, 0, 4, 7, 9, null, null, 3, 5]);
const node = (v) => { let c = root; while (c.val !== v) c = v < c.val ? c.left : c.right; return c; };
console.log(lowestCommonAncestor(root, node(2), node(8)).val); // 6
console.log(lowestCommonAncestor(root, node(2), node(4)).val); // 2
console.log(lowestCommonAncestor(root, node(3), node(5)).val); // 4`,
            explain: <p>O(h) time and O(1) space. The stop case covers three situations at once: the values split, <code>p</code> equals the node, or <code>q</code> equals the node.</p>,
          },
          {
            name: "Walk down using the order (recursive)",
            idea: <p>The same decision written as a recursion, which some people find easier to read.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function buildTree(arr) {                // level-order array, null marks a gap
  if (!arr.length || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function lowestCommonAncestor(root, p, q) {
  if (p.val < root.val && q.val < root.val) return lowestCommonAncestor(root.left, p, q);
  if (p.val > root.val && q.val > root.val) return lowestCommonAncestor(root.right, p, q);
  return root;
}

const root = buildTree([6, 2, 8, 0, 4, 7, 9, null, null, 3, 5]);
const node = (v) => { let c = root; while (c.val !== v) c = v < c.val ? c.left : c.right; return c; };
console.log(lowestCommonAncestor(root, node(0), node(5)).val); // 2
console.log(lowestCommonAncestor(root, node(7), node(9)).val); // 8`,
            explain: <p>The same O(h) time, but O(h) stack space for the calls. The loop is preferable when the tree is deep.</p>,
          },
        ]}
        compare={<p>The iterative walk: shortest time and no extra memory. (LeetCode 235.)</p>}
      >
        <p>The same question, but the tree is a binary search tree with distinct values. Return the LCA of <code>p</code> and <code>q</code>.</p>
      </Problem>

      <Problem
        n={3}
        title="Construct a tree from preorder and inorder traversals"
        level="Medium"
        examples={[
          { input: "preorder = [3, 9, 20, 15, 7], inorder = [9, 3, 15, 20, 7]", output: "[3, 9, 20, null, null, 15, 7]", why: "3 is first in preorder, so it is the root. In inorder, 9 is left of 3 and 15, 20, 7 are right of it." },
          { input: "preorder = [1, 2], inorder = [2, 1]", output: "[1, 2]", why: "Root 1; the value 2 is left of 1 in the inorder list, so it is the left child." },
        ]}
        hints={[
          <>Which value is always the root of the whole tree in a preorder list?</>,
          <>Find that root in the inorder list. How many values are to its left, and what does that tell you about the left subtree?</>,
          <>Searching the inorder list each time is slow. Can you look the position up in O(1)?</>,
        ]}
        approaches={[
          {
            name: "Slice and search",
            idea: (
              <ol>
                <li>The root is <code>preorder[0]</code>; find it in inorder with <code>indexOf</code>.</li>
                <li>Slice both arrays into left and right parts and recurse.</li>
              </ol>
            ),
            code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function toLevelArray(root) {            // level-order values, null gaps, trailing nulls trimmed
  const out = [], queue = [root];
  for (let i = 0; i < queue.length; i++) {
    const n = queue[i];
    if (n === null) { out.push(null); continue; }
    out.push(n.val);
    queue.push(n.left, n.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function buildTree(preorder, inorder) {
  if (preorder.length === 0) return null;
  const root = new TreeNode(preorder[0]);
  const mid = inorder.indexOf(preorder[0]);          // number of nodes in the left subtree
  root.left = buildTree(preorder.slice(1, 1 + mid), inorder.slice(0, mid));
  root.right = buildTree(preorder.slice(1 + mid), inorder.slice(mid + 1));
  return root;
}

console.log(toLevelArray(buildTree([3, 9, 20, 15, 7], [9, 3, 15, 20, 7]))); // [3, 9, 20, null, null, 15, 7]
console.log(toLevelArray(buildTree([1, 2], [2, 1])));                      // [1, 2]`,
            explain: <p>Each call copies arrays and scans for the root, so a chain-shaped tree costs O(n²) time and space. It is the clearest way to see the idea.</p>,
          },
          {
            name: "Index map and a moving pointer",
            idea: (
              <ol>
                <li>Build a Map from value to inorder index once.</li>
                <li>Keep one pointer into preorder. Each call takes the next preorder value as its root and splits the inorder range at its Map position.</li>
                <li>Build the left subtree first, then the right.</li>
              </ol>
            ),
            code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function toLevelArray(root) {            // level-order values, null gaps, trailing nulls trimmed
  const out = [], queue = [root];
  for (let i = 0; i < queue.length; i++) {
    const n = queue[i];
    if (n === null) { out.push(null); continue; }
    out.push(n.val);
    queue.push(n.left, n.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function buildTree(preorder, inorder) {
  const indexOf = new Map();
  inorder.forEach((v, i) => indexOf.set(v, i));
  let next = 0;
  function build(lo, hi) {
    if (lo > hi) return null;
    const val = preorder[next++];
    const mid = indexOf.get(val);
    const node = new TreeNode(val);
    node.left = build(lo, mid - 1);
    node.right = build(mid + 1, hi);
    return node;
  }
  return build(0, inorder.length - 1);
}

console.log(toLevelArray(buildTree([3, 9, 20, 15, 7], [9, 3, 15, 20, 7]))); // [3, 9, 20, null, null, 15, 7]
console.log(toLevelArray(buildTree([1, 2], [2, 1])));                      // [1, 2]
console.log(toLevelArray(buildTree([-1], [-1])));                          // [-1]`,
            explain: <p>O(n) time and O(n) space (the Map plus the recursion). The order of the two recursive calls matters: left must go first, because the preorder pointer reaches the left subtree&apos;s values before the right&apos;s.</p>,
          },
        ]}
        compare={<p>The Map with a pointer. Show the slice version first only to explain the idea. (LeetCode 105.)</p>}
      >
        <p>Given the preorder and inorder traversals of a binary tree with distinct values, rebuild the tree. Return the root; the examples show it in level order.</p>
      </Problem>

      <Problem
        n={4}
        title="Construct a tree from inorder and postorder traversals"
        level="Medium"
        examples={[
          { input: "inorder = [9, 3, 15, 20, 7], postorder = [9, 15, 7, 20, 3]", output: "[3, 9, 20, null, null, 15, 7]", why: "The last postorder value, 3, is the root; 9 is left of it in inorder, the rest are right of it." },
          { input: "inorder = [-1], postorder = [-1]", output: "[-1]", why: "A single node." },
        ]}
        hints={[
          <>It is the previous problem mirrored. Where is the root in a postorder list?</>,
          <>Postorder is left, right, root. If you read it from the end, which subtree do you meet first?</>,
        ]}
        approaches={[
          {
            name: "Slice and search",
            idea: <p>The root is the last postorder value. Find it in inorder; the left part has <code>mid</code> nodes, which tells you how to cut the postorder list as well.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function toLevelArray(root) {            // level-order values, null gaps, trailing nulls trimmed
  const out = [], queue = [root];
  for (let i = 0; i < queue.length; i++) {
    const n = queue[i];
    if (n === null) { out.push(null); continue; }
    out.push(n.val);
    queue.push(n.left, n.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function buildTree(inorder, postorder) {
  if (postorder.length === 0) return null;
  const val = postorder[postorder.length - 1];
  const mid = inorder.indexOf(val);
  const root = new TreeNode(val);
  root.left = buildTree(inorder.slice(0, mid), postorder.slice(0, mid));
  root.right = buildTree(inorder.slice(mid + 1), postorder.slice(mid, postorder.length - 1));
  return root;
}

console.log(toLevelArray(buildTree([9, 3, 15, 20, 7], [9, 15, 7, 20, 3]))); // [3, 9, 20, null, null, 15, 7]
console.log(toLevelArray(buildTree([-1], [-1])));                          // [-1]`,
            explain: <p>O(n²) because of the copying and searching.</p>,
          },
          {
            name: "Index map, reading postorder from the end",
            idea: <p>Walk a pointer from the last postorder value backwards. Because postorder ends with the right subtree, build <strong>right first</strong>, then left.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function toLevelArray(root) {            // level-order values, null gaps, trailing nulls trimmed
  const out = [], queue = [root];
  for (let i = 0; i < queue.length; i++) {
    const n = queue[i];
    if (n === null) { out.push(null); continue; }
    out.push(n.val);
    queue.push(n.left, n.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function buildTree(inorder, postorder) {
  const indexOf = new Map();
  inorder.forEach((v, i) => indexOf.set(v, i));
  let next = postorder.length - 1;
  function build(lo, hi) {
    if (lo > hi) return null;
    const val = postorder[next--];
    const mid = indexOf.get(val);
    const node = new TreeNode(val);
    node.right = build(mid + 1, hi);       // right first: it sits just before the root in postorder
    node.left = build(lo, mid - 1);
    return node;
  }
  return build(0, inorder.length - 1);
}

console.log(toLevelArray(buildTree([9, 3, 15, 20, 7], [9, 15, 7, 20, 3]))); // [3, 9, 20, null, null, 15, 7]
console.log(toLevelArray(buildTree([2, 1], [2, 1])));                      // [1, 2]`,
            explain: <p>O(n) time and space. Building left first here would hand the left subtree the right subtree&apos;s values, a classic bug.</p>,
          },
        ]}
        compare={<p>The Map version with the right subtree built first. (LeetCode 106.)</p>}
      >
        <p>Given the inorder and postorder traversals of a binary tree with distinct values, rebuild the tree.</p>
      </Problem>

      <Problem
        n={5}
        title="Serialize and deserialize a binary tree"
        level="Hard"
        examples={[
          { input: "root = [1, 2, 3, null, null, 4, 5]", output: "\"1,2,#,#,3,4,#,#,5,#,#\"", why: "Preorder with # standing for a missing child; reading it back gives the same tree." },
          { input: "root = []", output: "\"#\"", why: "The empty tree is a single missing child." },
        ]}
        hints={[
          <>Inorder alone is ambiguous. What extra information would fix that?</>,
          <>Write a marker for every null child. Then a plain preorder is enough.</>,
          <>To read it back, use the same recursion and consume tokens in order.</>,
        ]}
        approaches={[
          {
            name: "Preorder with null markers",
            idea: (
              <ol>
                <li>Serialise: visit root, left, right; write the value, or <code>#</code> for null.</li>
                <li>Deserialise: read a token; <code>#</code> gives null, otherwise make a node and build its left then right from the following tokens.</li>
              </ol>
            ),
            code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function buildTree(arr) {                // level-order array, null marks a gap
  if (!arr.length || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function serialize(root) {
  const out = [];
  (function go(node) {
    if (node === null) { out.push("#"); return; }
    out.push(node.val);
    go(node.left);
    go(node.right);
  })(root);
  return out.join(",");
}

function deserialize(data) {
  const tokens = data.split(",");
  let i = 0;
  function go() {
    const token = tokens[i++];
    if (token === "#") return null;
    const node = new TreeNode(Number(token));
    node.left = go();
    node.right = go();
    return node;
  }
  return go();
}

const data = serialize(buildTree([1, 2, 3, null, null, 4, 5]));
console.log(data);                                  // 1,2,#,#,3,4,#,#,5,#,#
console.log(serialize(deserialize(data)) === data); // true
console.log(serialize(buildTree([-7, null, 12])));  // -7,#,12,#,#`,
            explain: <p>O(n) time and space. The comma matters (it keeps <code>-7</code> and <code>12</code> as whole numbers), and <code>Number(token)</code> handles negatives.</p>,
          },
          {
            name: "Level order with null markers",
            idea: <p>Serialise with a queue, pushing both children (even null ones). Deserialise with a queue of nodes waiting for their children: each takes the next two tokens.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function buildTree(arr) {                // level-order array, null marks a gap
  if (!arr.length || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function serialize(root) {
  if (root === null) return "";
  const out = [], queue = [root];
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    if (node === null) { out.push("#"); continue; }
    out.push(node.val);
    queue.push(node.left, node.right);
  }
  return out.join(",");
}

function deserialize(data) {
  if (data === "") return null;
  const tokens = data.split(",");
  const root = new TreeNode(Number(tokens[0]));
  const queue = [root];
  let t = 1;
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    if (tokens[t] !== undefined && tokens[t] !== "#") { node.left = new TreeNode(Number(tokens[t])); queue.push(node.left); }
    t++;
    if (tokens[t] !== undefined && tokens[t] !== "#") { node.right = new TreeNode(Number(tokens[t])); queue.push(node.right); }
    t++;
  }
  return root;
}

const data = serialize(buildTree([1, 2, 3, null, null, 4, 5]));
console.log(data);                                  // 1,2,3,#,#,4,5,#,#,#,#
console.log(serialize(deserialize(data)) === data); // true
console.log(serialize(deserialize("")));            // (empty string)`,
            explain: <p>O(n) time and space. It matches LeetCode&apos;s own display format, but has more bookkeeping than the recursive version.</p>,
          },
        ]}
        compare={<p>Preorder with markers: shortest and easiest to get right. (LeetCode 297.)</p>}
      >
        <p>Design <code>serialize(root)</code>, which turns a binary tree into a string, and <code>deserialize(data)</code>, which rebuilds the same tree from that string. Any format works as long as the round trip is exact.</p>
      </Problem>

      <Problem
        n={6}
        title="Count good nodes in a binary tree"
        level="Medium"
        examples={[
          { input: "root = [3, 1, 4, 3, null, 1, 5]", output: "4", why: "Good nodes: the root 3, the 4, the left-left 3 and the 5. The 1s each have a bigger ancestor." },
          { input: "root = [3, 3, null, 4, 2]", output: "3", why: "3 (root), 3 and 4 are good; 2 has ancestor 3 above it." },
        ]}
        hints={[
          <>A node is good if no node on its root-to-node path is bigger. What single number summarises the path so far?</>,
          <>Pass the largest value seen on the way down as an argument.</>,
        ]}
        approaches={[
          {
            name: "Check the whole path for every node",
            idea: <p>Keep the actual path in a list. At each node, check that every value on the path is at most this node&apos;s value.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function buildTree(arr) {                // level-order array, null marks a gap
  if (!arr.length || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function goodNodes(root) {
  let count = 0;
  const path = [];
  function dfs(node) {
    if (node === null) return;
    if (path.every((v) => v <= node.val)) count++;
    path.push(node.val);
    dfs(node.left);
    dfs(node.right);
    path.pop();
  }
  dfs(root);
  return count;
}

console.log(goodNodes(buildTree([3, 1, 4, 3, null, 1, 5]))); // 4
console.log(goodNodes(buildTree([3, 3, null, 4, 2])));       // 3`,
            explain: <p>O(n·h): each node scans its path, which is O(n²) on a chain-shaped tree.</p>,
          },
          {
            name: "DFS carrying the maximum",
            idea: <p>Pass <code>maxSoFar</code> down. A node is good when its value is at least <code>maxSoFar</code>; its children receive the larger of the two.</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function buildTree(arr) {                // level-order array, null marks a gap
  if (!arr.length || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function goodNodes(root) {
  function dfs(node, maxSoFar) {
    if (node === null) return 0;
    const good = node.val >= maxSoFar ? 1 : 0;
    const bigger = Math.max(maxSoFar, node.val);
    return good + dfs(node.left, bigger) + dfs(node.right, bigger);
  }
  return dfs(root, -Infinity);
}

console.log(goodNodes(buildTree([3, 1, 4, 3, null, 1, 5]))); // 4
console.log(goodNodes(buildTree([3, 3, null, 4, 2])));       // 3
console.log(goodNodes(buildTree([1])));                      // 1`,
            explain: <p>O(n) time and O(h) space. Starting with <code>-Infinity</code> makes the root always good, whatever its (possibly negative) value.</p>,
          },
        ]}
        compare={<p>Carry the maximum down: a path summary replaces the path. (LeetCode 1448.)</p>}
      >
        <p>A node X is <em>good</em> if on the path from the root to X there is no node with a value greater than X. Return the number of good nodes.</p>
      </Problem>

      <Problem
        n={7}
        title="Count complete tree nodes"
        level="Easy"
        examples={[
          { input: "root = [1, 2, 3, 4, 5, 6]", output: "6", why: "All levels are full except the last, which is filled from the left." },
          { input: "root = []", output: "0", why: "No nodes." },
        ]}
        hints={[
          <>Counting every node works, but the tree is <em>complete</em>: all levels full except possibly the last, which fills from the left. Can that help?</>,
          <>Compare the depth along the leftmost edge with the depth along the rightmost edge. If they are equal, the whole tree is perfect and its size is a formula.</>,
          <>If they differ, count the root plus the two subtrees recursively. One of the two subtrees will be perfect.</>,
        ]}
        approaches={[
          {
            name: "Visit every node",
            idea: <p>Count with plain recursion: 1 + count(left) + count(right).</p>,
            code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function buildTree(arr) {                // level-order array, null marks a gap
  if (!arr.length || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function countNodes(root) {
  if (root === null) return 0;
  return 1 + countNodes(root.left) + countNodes(root.right);
}

console.log(countNodes(buildTree([1, 2, 3, 4, 5, 6]))); // 6
console.log(countNodes(null));                          // 0`,
            explain: <p>O(n). Correct for any tree, but it ignores the completeness guarantee.</p>,
          },
          {
            name: "Perfect subtrees by formula",
            idea: (
              <ol>
                <li>Measure the height going only left from the root, and going only right.</li>
                <li>If both heights are equal, the tree is perfect and has <code>2^height − 1</code> nodes.</li>
                <li>Otherwise return 1 + the count of the left subtree + the count of the right subtree.</li>
              </ol>
            ),
            code: `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function buildTree(arr) {                // level-order array, null marks a gap
  if (!arr.length || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

function countNodes(root) {
  if (root === null) return 0;
  let leftHeight = 0, rightHeight = 0;
  for (let n = root; n !== null; n = n.left) leftHeight++;
  for (let n = root; n !== null; n = n.right) rightHeight++;
  if (leftHeight === rightHeight) return 2 ** leftHeight - 1;    // a perfect tree: no need to look inside
  return 1 + countNodes(root.left) + countNodes(root.right);
}

console.log(countNodes(buildTree([1, 2, 3, 4, 5, 6])));       // 6
console.log(countNodes(buildTree([1, 2, 3, 4, 5, 6, 7])));    // 7
console.log(countNodes(buildTree([1, 2, 3, 4, 5, 6, 7, 8]))); // 8`,
            explain: <p>At each level at least one of the two recursive calls hits a perfect subtree and returns after an O(log n) height check, so there are about log n levels each costing O(log n): <strong>O(log² n)</strong> time, O(log n) space. If the left and right heights match, the last level is full, which in a complete tree forces every level to be full.</p>,
          },
        ]}
        compare={<p>The height trick, if you notice the word &quot;complete&quot;; the plain count is the safe fallback. (LeetCode 222.)</p>}
      >
        <p>Given the root of a <em>complete</em> binary tree, return the number of nodes, faster than O(n) if you can.</p>
      </Problem>
    </>
  );
}
