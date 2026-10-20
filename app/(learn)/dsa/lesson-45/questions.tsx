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
          { input: "root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 1", output: "3", why: "5 is on the left side of 3 and 1 is on the right side, so the paths split at the root." },
          { input: "root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 4", output: "5", why: "4 is below 5, and a node counts as its own ancestor." },
        ]}
        hints={[
          <>Think about the path from the root to <code>p</code> and the path from the root to <code>q</code>. At which node do the two paths stop being the same?</>,
          <>Or let each recursive call report what it finds in its part of the tree: nothing, one target, or the answer.</>,
          <>If both the left call and the right call return something, the current node is the meeting point.</>,
        ]}
        approaches={[
          {
            name: "Compare the two root paths",
            idea: (
              <ol>
                <li>Find the path from the root to <code>p</code> and the path from the root to <code>q</code> (each is a list of nodes).</li>
                <li>Walk both lists together. The last node where they are still the same is the LCA.</li>
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
            explain: <p>Two searches and one comparison: O(n) time, O(h) space for the paths. It is correct and easy to explain, but it needs two passes and extra lists.</p>,
          },
          {
            name: "One recursive pass",
            idea: (
              <ol>
                <li>If the node is null, <code>p</code> or <code>q</code>, return it.</li>
                <li>Ask the left side and the right side.</li>
                <li>If both answered, return this node. Otherwise return the one that answered (or null).</li>
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
            explain: <p>It is safe to return at <code>p</code> or <code>q</code> without looking below. If the other target is under it, this node is the LCA. If not, a higher node will find the other target on its other side. O(n) time, O(h) space.</p>,
          },
        ]}
        compare={<p>Use the one-pass recursion. You can mention the path comparison first, as an easy starting point that is simple to check. (LeetCode 236.)</p>}
      >
        <p>You get a binary tree and two nodes <code>p</code> and <code>q</code> that are both in it. Return their lowest common ancestor: the lowest node that has both of them below it (a node counts as being below itself).</p>
      </Problem>

      <Problem
        n={2}
        title="Lowest common ancestor of a BST"
        level="Medium"
        examples={[
          { input: "root = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p = 2, q = 8", output: "6", why: "2 is smaller than 6 and 8 is bigger, so they split at the root." },
          { input: "root = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p = 2, q = 4", output: "2", why: "4 is on the right side of 2, and a node counts as its own ancestor." },
        ]}
        hints={[
          <>At any node, compare both values with the value of the node. When are both on the same side?</>,
          <>While both are on the same side, you can step that way and never look at the other side.</>,
        ]}
        approaches={[
          {
            name: "Ignore the order of the values",
            idea: <p>Use the general binary-tree recursion from question 1. It works on any tree, including a BST, but it can visit every node.</p>,
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
            explain: <p>O(n) time, O(h) space. Correct, but it does not use the key fact that the values in the tree are ordered.</p>,
          },
          {
            name: "Walk down using the order (a loop)",
            idea: <p>Start at the root. If both values are smaller, go left. If both are bigger, go right. Otherwise stop. This node is the LCA.</p>,
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
            name: "Walk down using the order (recursion)",
            idea: <p>The same choice written as a recursion. Some people find it easier to read.</p>,
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
            explain: <p>The same O(h) time, but O(h) stack space for the calls. The loop is better when the tree is deep.</p>,
          },
        ]}
        compare={<p>Use the loop. It is fast and needs no extra memory. (LeetCode 235.)</p>}
      >
        <p>The same question, but now the tree is a binary search tree and all values are different. Return the LCA of <code>p</code> and <code>q</code>.</p>
      </Problem>

      <Problem
        n={3}
        title="Construct a tree from preorder and inorder traversals"
        level="Medium"
        examples={[
          { input: "preorder = [3, 9, 20, 15, 7], inorder = [9, 3, 15, 20, 7]", output: "[3, 9, 20, null, null, 15, 7]", why: "3 is first in preorder, so it is the root. In inorder, 9 is to the left of 3, and 15, 20, 7 are to the right of it." },
          { input: "preorder = [1, 2], inorder = [2, 1]", output: "[1, 2]", why: "The root is 1. In the inorder list, 2 is to the left of 1, so it is the left child." },
        ]}
        hints={[
          <>In a preorder list, which value is always the root of the whole tree?</>,
          <>Find that root in the inorder list. How many values are to its left? What does that tell you about the left side of the tree?</>,
          <>Searching the inorder list each time is slow. Can you look up the position in O(1)?</>,
        ]}
        approaches={[
          {
            name: "Slice and search",
            idea: (
              <ol>
                <li>The root is <code>preorder[0]</code>; find it in inorder with <code>indexOf</code>.</li>
                <li>Cut both arrays into a left part and a right part, and call the function on each part.</li>
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
            explain: <p>Each call copies arrays and scans for the root. A tree shaped like a chain costs O(n²) time and space. It is the clearest way to see the idea.</p>,
          },
          {
            name: "Index map and a moving position",
            idea: (
              <ol>
                <li>Build a Map (a lookup table) from each value to its inorder position, once.</li>
                <li>Keep one position in the preorder list. Each call takes the next preorder value as its root. It then splits the inorder range at the position from the Map.</li>
                <li>Build the left side first, then the right side.</li>
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
            explain: <p>O(n) time and O(n) space (the Map plus the recursion). The order of the two recursive calls matters. The left call must go first, because the preorder position reaches the values of the left side before the values of the right side.</p>,
          },
        ]}
        compare={<p>Use the Map with a moving position. Show the slice version first only to explain the idea. (LeetCode 105.)</p>}
      >
        <p>You get the preorder and inorder lists of a binary tree whose values are all different. Rebuild the tree and return its root. The examples show the tree in level order (row by row).</p>
      </Problem>

      <Problem
        n={4}
        title="Construct a tree from inorder and postorder traversals"
        level="Medium"
        examples={[
          { input: "inorder = [9, 3, 15, 20, 7], postorder = [9, 15, 7, 20, 3]", output: "[3, 9, 20, null, null, 15, 7]", why: "The last postorder value, 3, is the root. In inorder, 9 is to the left of it and the rest are to the right." },
          { input: "inorder = [-1], postorder = [-1]", output: "[-1]", why: "There is a single node." },
        ]}
        hints={[
          <>This is the previous problem turned around. In a postorder list, where is the root?</>,
          <>Postorder is left, right, root. If you read it from the end, which side do you meet first?</>,
        ]}
        approaches={[
          {
            name: "Slice and search",
            idea: <p>The root is the last postorder value. Find it in the inorder list. The left part has <code>mid</code> nodes, and this also tells you where to cut the postorder list.</p>,
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
            explain: <p>O(n²), because of the copying and searching.</p>,
          },
          {
            name: "Index map, reading postorder from the end",
            idea: <p>Move a position backwards, starting at the last postorder value. Postorder ends with the right side, so build the <strong>right side first</strong>, then the left side.</p>,
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
            explain: <p>O(n) time and space. If you build the left side first here, the left side takes the values of the right side. This is a classic bug.</p>,
          },
        ]}
        compare={<p>Use the Map version, and build the right side first. (LeetCode 106.)</p>}
      >
        <p>You get the inorder and postorder lists of a binary tree whose values are all different. Rebuild the tree.</p>
      </Problem>

      <Problem
        n={5}
        title="Serialize and deserialize a binary tree"
        level="Hard"
        examples={[
          { input: "root = [1, 2, 3, null, null, 4, 5]", output: "\"1,2,#,#,3,4,#,#,5,#,#\"", why: "This is preorder, with # standing for a missing child. Reading it back gives the same tree." },
          { input: "root = []", output: "\"#\"", why: "The empty tree is just one missing child." },
        ]}
        hints={[
          <>Inorder alone can fit more than one tree. What extra information would fix that?</>,
          <>Write a marker for every null child. Then a plain preorder is enough.</>,
          <>To read it back, use the same recursion and take the tokens (the pieces of text) one by one, in order.</>,
        ]}
        approaches={[
          {
            name: "Preorder with null markers",
            idea: (
              <ol>
                <li>Save as text: visit root, left, right. Write the value, or <code>#</code> for null.</li>
                <li>Read back: read a token. If it is <code>#</code>, the result is null. Otherwise make a node, and build its left side and then its right side from the next tokens.</li>
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
            explain: <p>O(n) time and space. The comma matters, because it keeps <code>-7</code> and <code>12</code> as whole numbers. <code>Number(token)</code> handles negative numbers.</p>,
          },
          {
            name: "Level order with null markers",
            idea: <p>To save, use a queue and push both children, even null ones. To read back, use a queue of nodes that wait for their children. Each node takes the next two tokens.</p>,
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
            explain: <p>O(n) time and space. It matches the format LeetCode shows, but it has more steps to keep track of than the recursive version.</p>,
          },
        ]}
        compare={<p>Use preorder with markers. It is the shortest and the easiest to get right. (LeetCode 297.)</p>}
      >
        <p>Write <code>serialize(root)</code>, which turns a binary tree into a string of text, and <code>deserialize(data)</code>, which builds the same tree back from that string. Any format works, as long as you get exactly the same tree back.</p>
      </Problem>

      <Problem
        n={6}
        title="Count good nodes in a binary tree"
        level="Medium"
        examples={[
          { input: "root = [3, 1, 4, 3, null, 1, 5]", output: "4", why: "The good nodes are the root 3, the 4, the left-left 3 and the 5. Each 1 has a bigger node above it." },
          { input: "root = [3, 3, null, 4, 2]", output: "3", why: "The root 3, the 3 and the 4 are good. The 2 has a 3 above it, which is bigger." },
        ]}
        hints={[
          <>A node is good if no node on its path from the root is bigger. Which single number describes the path so far?</>,
          <>Pass the largest value seen so far down as an argument.</>,
        ]}
        approaches={[
          {
            name: "Check the whole path for every node",
            idea: <p>Keep the real path in a list. At each node, check that every value on the path is at most the value of this node.</p>,
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
            explain: <p>O(n·h). Each node scans its path, which is O(n²) on a tree shaped like a chain.</p>,
          },
          {
            name: "DFS carrying the maximum",
            idea: <p>Pass <code>maxSoFar</code> down. A node is good when its value is at least <code>maxSoFar</code>. Its children get the larger of the two numbers.</p>,
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
            explain: <p>O(n) time and O(h) space. We start with <code>-Infinity</code> (smaller than any number), so the root is always good, even if its value is negative.</p>,
          },
        ]}
        compare={<p>Carry the maximum down. One number replaces the whole path. (LeetCode 1448.)</p>}
      >
        <p>A node X is <em>good</em> if no node on the path from the root to X has a value greater than X. Return how many good nodes there are.</p>
      </Problem>

      <Problem
        n={7}
        title="Count complete tree nodes"
        level="Easy"
        examples={[
          { input: "root = [1, 2, 3, 4, 5, 6]", output: "6", why: "All levels are full except the last one, which is filled from the left." },
          { input: "root = []", output: "0", why: "There are no nodes." },
        ]}
        hints={[
          <>Counting every node works. But the tree is <em>complete</em>: all levels are full except maybe the last one, which fills from the left. Can that help?</>,
          <>Compare the depth along the leftmost edge with the depth along the rightmost edge. If they are equal, the whole tree is perfect (every level full), and you can work out its size with a formula.</>,
          <>If they are different, count the root plus the two sides, with recursion. One of the two sides will be perfect.</>,
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
            explain: <p>O(n). Correct for any tree, but it does not use the fact that the tree is complete.</p>,
          },
          {
            name: "Perfect parts counted by a formula",
            idea: (
              <ol>
                <li>Measure the height by going only left from the root, and again by going only right.</li>
                <li>If both heights are equal, the tree is perfect and has <code>2^height − 1</code> nodes.</li>
                <li>Otherwise return 1 + the count of the left side + the count of the right side.</li>
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
            explain: <p>At each level, at least one of the two recursive calls meets a perfect part and returns after a height check of O(log n). There are about log n levels, and each costs O(log n). So the time is <strong>O(log² n)</strong> and the space is O(log n). If the left and right heights match, the last level is full. In a complete tree, that means every level is full.</p>,
          },
        ]}
        compare={<p>Use the height trick if you notice the word &quot;complete&quot;. The plain count is the safe fallback. (LeetCode 222.)</p>}
      >
        <p>You get the root of a <em>complete</em> binary tree. Return the number of nodes, and try to be faster than O(n).</p>
      </Problem>
    </>
  );
}
