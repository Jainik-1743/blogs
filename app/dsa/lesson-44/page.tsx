import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CodeTrace from "@/components/dsa/CodeTrace";
import DryRun from "@/components/dsa/DryRun";
import DsaLessonPage from "@/components/dsa/DsaLesson";
import Questions from "./questions";
import Recall from "@/components/dsa/Recall";
import CodeBlock from "@/components/sd/CodeBlock";
import { getDsaLesson } from "@/lib/dsa";
import { tracer } from "@/lib/dsa-trace";

const lesson = getDsaLesson("lesson-44");

export const metadata: Metadata = {
  title: `Lesson 44 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "property", label: "The BST property" },
  { id: "search", label: "Search" },
  { id: "insert", label: "Insert" },
  { id: "delete", label: "Delete: three cases" },
  { id: "validate", label: "Validate a BST" },
  { id: "kth", label: "K-th smallest with inorder" },
  { id: "trace", label: "Traced: the 3rd smallest value" },
  { id: "build", label: "Build a balanced BST from a sorted array" },
  { id: "degenerate", label: "Why an unbalanced BST is O(n)" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const searchCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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

function searchRecursive(node, target) {
  if (node === null) return null;                 // fell off the tree: not present
  if (target === node.val) return node;
  return target < node.val
    ? searchRecursive(node.left, target)          // smaller values can only be on the left
    : searchRecursive(node.right, target);        // larger values can only be on the right
}

function searchIterative(node, target) {
  while (node !== null && node.val !== target) {
    node = target < node.val ? node.left : node.right;
  }
  return node;
}

const tree = buildTree([8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13]);
console.log(searchRecursive(tree, 6).val);   // 6
console.log(searchIterative(tree, 13).val);  // 13
console.log(searchIterative(tree, 5));       // null`;

const insertCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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

function insertRecursive(node, val) {
  if (node === null) return new TreeNode(val);      // found the empty spot: the new node is a leaf
  if (val < node.val) node.left = insertRecursive(node.left, val);
  else node.right = insertRecursive(node.right, val);
  return node;
}

function insertIterative(root, val) {
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

console.log(serialize(insertRecursive(buildTree([4, 2, 7, 1, 3]), 5))); // [4, 2, 7, 1, 3, 5]
console.log(serialize(insertIterative(buildTree([4, 2, 7, 1, 3]), 6)));  // [4, 2, 7, 1, 3, 6]
console.log(serialize(insertRecursive(null, 9)));                         // [9]`;

const deleteCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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
  if (root === null) return null;                    // key is not in the tree
  if (key < root.val) {
    root.left = deleteNode(root.left, key);
  } else if (key > root.val) {
    root.right = deleteNode(root.right, key);
  } else {
    // Found it. Case 1 (leaf) and case 2 (one child) both reduce to: return the child that exists.
    if (root.left === null) return root.right;
    if (root.right === null) return root.left;
    // Case 3: two children. Copy the inorder successor (smallest value on the right) here, then delete it from the right.
    let successor = root.right;
    while (successor.left !== null) successor = successor.left;
    root.val = successor.val;
    root.right = deleteNode(root.right, successor.val);
  }
  return root;
}

console.log(serialize(deleteNode(buildTree([5, 3, 6, 2, 4, null, 7]), 2))); // [5, 3, 6, null, 4, null, 7]   (leaf)
console.log(serialize(deleteNode(buildTree([5, 3, 6, 2, 4, null, 7]), 6))); // [5, 3, 7, 2, 4]              (one child)
console.log(serialize(deleteNode(buildTree([5, 3, 6, 2, 4, null, 7]), 3))); // [5, 4, 6, 2, null, null, 7]  (two children)
console.log(serialize(deleteNode(buildTree([5, 3, 6, 2, 4, null, 7]), 9))); // [5, 3, 6, 2, 4, null, 7]     (not found)`;

const wrongValidateCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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

// WRONG: only compares each node with its direct children.
function isValidWrong(node) {
  if (node === null) return true;
  if (node.left !== null && node.left.val >= node.val) return false;
  if (node.right !== null && node.right.val <= node.val) return false;
  return isValidWrong(node.left) && isValidWrong(node.right);
}

//        5
//       / \\
//      1   6
//         / \\
//        3   7        3 is smaller than 5 but sits in 5's RIGHT subtree
const bad = buildTree([5, 1, 6, null, null, 3, 7]);
console.log(isValidWrong(bad)); // true   <- wrong answer, this is not a BST`;

const validateCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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
  // Every node must lie strictly between lo and hi, the limits set by ALL its ancestors.
  function check(node, lo, hi) {
    if (node === null) return true;
    if (node.val <= lo || node.val >= hi) return false;
    return check(node.left, lo, node.val)        // going left: this node becomes the new upper limit
        && check(node.right, node.val, hi);      // going right: this node becomes the new lower limit
  }
  return check(root, -Infinity, Infinity);
}

console.log(isValidBST(buildTree([5, 1, 6, null, null, 3, 7])));  // false
console.log(isValidBST(buildTree([2, 1, 3])));                    // true
console.log(isValidBST(buildTree([2, 2, 2])));                    // false  (no duplicates allowed)`;

const kthCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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
    while (cur !== null) {          // go as far left as possible, remembering the path
      stack.push(cur);
      cur = cur.left;
    }
    cur = stack.pop();              // the smallest value not yet counted
    k--;
    if (k === 0) return cur.val;    // stop early: no need to visit the rest of the tree
    cur = cur.right;
  }
  return undefined;                 // k is larger than the number of nodes
}

const tree = buildTree([5, 3, 6, 2, 4, null, null, 1]);
console.log(kthSmallest(tree, 1)); // 1
console.log(kthSmallest(tree, 3)); // 3
console.log(kthSmallest(tree, 6)); // 6`;

const traceSrc = `function kthSmallest(root, k) {
  const stack = [];
  let cur = root;
  while (cur !== null || stack.length > 0) {
    while (cur !== null) {
      stack.push(cur);
      cur = cur.left;
    }
    cur = stack.pop();
    k--;
    if (k === 0) return cur.val;
    cur = cur.right;
  }
}
console.log(kthSmallest(root, 3));`;

type TNode = { val: number; left: TNode | null; right: TNode | null };
const mk = (val: number, left: TNode | null = null, right: TNode | null = null): TNode => ({ val, left, right });

function kthTrace() {
  const t = tracer();
  // BST [5, 3, 6, 2, 4, null, null, 1]: inorder order is 1, 2, 3, 4, 5, 6.
  const root = mk(5, mk(3, mk(2, mk(1)), mk(4)), mk(6));
  let k = 3;
  const stack: TNode[] = [];
  const vals = () => stack.map((n) => n.val);
  let cur: TNode | null = root;
  t.step(3, "start", "cur = root (5), k = 3", "We want the 3rd smallest value of the tree 5 → (3 → (2 → 1), 4), 6. Inorder order is smallest first, so we need the third value that gets popped.", { k, cur: cur.val, stack: vals() });
  while (cur !== null || stack.length > 0) {
    while (cur !== null) {
      stack.push(cur);
      const pushed: number = cur.val;
      cur = cur.left;
      t.step(7, "update", `push ${pushed}, move left`, cur ? `Remember ${pushed} for later and go to its left child, ${cur.val}.` : `Remember ${pushed} for later. It has no left child, so cur becomes null and the descent stops.`, { k, cur: cur ? cur.val : null, stack: vals() }, "stack");
    }
    cur = stack.pop()!;
    t.step(9, "update", `pop ${cur.val}`, `Nothing smaller is left to the left, so ${cur.val} is the next value in sorted order.`, { k, cur: cur.val, stack: vals() }, "cur");
    k--;
    t.step(10, "update", `k = ${k}`, k === 0 ? `One more count and k reaches 0: ${cur.val} is the 3rd smallest.` : `${3 - k} value${3 - k === 1 ? "" : "s"} counted so far; ${k} still to go.`, { k, cur: cur.val, stack: vals() }, "k");
    if (k === 0) {
      t.step(11, "run", `k is 0: return ${cur.val}`, "We stop immediately. The rest of the tree (4, 5 and 6) is never visited.", { k, cur: cur.val, stack: vals() });
      t.print(cur.val);
      t.step(15, "print", `prints ${cur.val}`, "The 3rd smallest value is 3.", { k, stack: vals() });
      break;
    }
    cur = cur.right;
    t.step(12, "update", `cur = right child: ${cur ? cur.val : "null"}`, cur ? `Now handle the right subtree of the value we just counted, starting at ${cur.val}.` : "It has no right child, so the next pop comes from the stack.", { k, cur: cur ? cur.val : null, stack: vals() }, "cur");
  }
  return t.steps;
}

const buildCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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
  function build(lo, hi) {                           // build from nums[lo..hi], both inclusive
    if (lo > hi) return null;
    const mid = Math.ceil((lo + hi) / 2);            // the middle value becomes the root
    return new TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi));
  }
  return build(0, nums.length - 1);
}

console.log(serialize(sortedArrayToBST([-10, -3, 0, 5, 9]))); // [0, -3, 9, -10, null, 5]
console.log(serialize(sortedArrayToBST([1, 3])));              // [3, 1]
console.log(serialize(sortedArrayToBST([1, 2, 3, 4, 5, 6, 7]))); // [4, 2, 6, 1, 3, 5, 7]`;

const degenerateCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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
function height(node) {
  return node === null ? 0 : 1 + Math.max(height(node.left), height(node.right));
}
function build(values) {
  let root = null;
  for (const v of values) root = insert(root, v);
  return root;
}

const chain = build([1, 2, 3, 4, 5, 6, 7]);   // inserted in sorted order
const bushy = build([4, 2, 6, 1, 3, 5, 7]);   // the same values, inserted middle-first
console.log(height(chain)); // 7   every node has only a right child: it is a linked list
console.log(height(bushy)); // 3   a search needs at most 3 comparisons`;

export default function DsaLessonFortyFourPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="property">The BST property</h2>
      <p>
        A <strong>binary search tree</strong> (BST) is a binary tree that obeys one rule at <em>every</em> node:
      </p>
      <Callout kind="note" label="The BST property">
        Every value in the node&apos;s <strong>left</strong> subtree is <strong>smaller</strong> than the node&apos;s value, and every value in its{" "}
        <strong>right</strong> subtree is <strong>larger</strong>. (We assume values are distinct, as LeetCode does for these
        problems.)
      </Callout>
      <p>
        Notice the word <em>every</em>: the rule covers the whole subtree, not only the direct children. That detail causes the
        most common bug in this lesson. Two consequences make BSTs useful:
      </p>
      <ul>
        <li>
          <strong>Binary search on a tree.</strong> At each node you can discard one entire side, just as binary search discards half of
          a sorted array. A search takes as many steps as the tree is tall.
        </li>
        <li>
          <strong>Inorder gives sorted order.</strong> Visiting left subtree, then node, then right subtree (the <em>inorder</em>{" "}
          traversal from lesson 41) lists the values from smallest to largest. Several questions below are just this fact.
        </li>
      </ul>
      <p>
        Most operations cost <strong>O(h)</strong>, where <em>h</em> is the tree&apos;s <strong>height</strong>. For a bushy tree
        that is about log n; the last section shows when it is not. All samples use the same{" "}
        <code>buildTree</code> helper as the last lesson (a level-order array, <code>null</code> for a missing child) and are
        self-contained.
      </p>

      <h2 id="search">Search</h2>
      <p>
        Compare the target with the current node. Equal: found. Smaller: go left. Larger: go right. Falling off the tree (
        <code>null</code>) means the value is not there. Here are the recursive and the iterative (loop) versions; the loop uses O(1)
        extra space instead of O(h) for the call stack.
      </p>
      <CodeBlock lang="js" code={searchCode} />

      <h2 id="insert">Insert</h2>
      <p>
        Insertion is search that ends in the empty spot where the value would have been. The new node always becomes a{" "}
        <strong>leaf</strong>; existing nodes never move. The helper <code>serialize</code> in this sample turns a tree back into a
        level-order array so we can print it.
      </p>
      <CodeBlock lang="js" code={insertCode} />
      <p>
        Many shapes are valid after an insertion, depending on where you attach the new node (a different algorithm could
        rearrange the tree). The simple &quot;add as a leaf&quot; method is what interviewers usually expect.
      </p>

      <h2 id="delete">Delete: three cases</h2>
      <p>Find the node first (search), then it is in one of three situations:</p>
      <DryRun
        title="deleting a node"
        cols={["Case", "What to do", "Why it keeps the BST property"]}
        rows={[
          ["It is a leaf", "Remove it (return null to the parent)", "Nothing depended on it."],
          ["It has one child", "Replace it with that child", "The child subtree is already on the correct side of the parent."],
          ["It has two children", "Copy the inorder successor (the smallest value in the right subtree) into this node, then delete that successor from the right subtree", "The successor is larger than everything on the left and no larger than anything on the right."],
        ]}
        note="The successor has no left child (otherwise it would not be the smallest), so deleting it is always case 1 or 2. The largest value on the left, the inorder predecessor, works just as well."
      />
      <CodeBlock lang="js" code={deleteCode} />
      <p>
        The function returns the (possibly new) root of each subtree, so the parent can reattach it with{" "}
        <code>root.left = deleteNode(root.left, key)</code>. Time <strong>O(h)</strong>: one search down, plus one more walk down for
        the successor.
      </p>

      <h2 id="validate">Validate a BST</h2>
      <p>
        <em>Is this tree a valid BST?</em> The tempting solution checks each node against its two children. It looks right and
        it is wrong:
      </p>
      <CodeBlock lang="js" code={wrongValidateCode} />
      <p>
        Here every parent-child pair is fine (1 &lt; 5, 6 &gt; 5, 3 &lt; 6, 7 &gt; 6) but 3 is in the right subtree of 5, which breaks the rule
        for <em>every</em> node. The fix is to carry <strong>limits</strong> down the tree. Going left, the current value becomes the
        new upper limit; going right, it becomes the new lower limit. Each node must lie strictly between the limits that all its
        ancestors have imposed.
      </p>
      <CodeBlock lang="js" code={validateCode} />
      <p>
        <strong>O(n)</strong> time, <strong>O(h)</strong> space. An equivalent test: do an inorder traversal and check that each
        value is strictly larger than the previous one. Use <code>-Infinity</code> and <code>Infinity</code> as the starting limits rather
        than the integer extremes, because a node may legitimately hold the smallest or largest integer allowed.
      </p>

      <h2 id="kth">K-th smallest with inorder</h2>
      <p>
        Since inorder visits values from smallest to largest, the k-th smallest is the k-th node visited. The iterative
        version keeps its own <strong>stack</strong> of the nodes on the path back up, which lets us <strong>stop early</strong> as
        soon as we have counted k nodes, so we only visit about h + k nodes instead of all n.
      </p>
      <CodeBlock lang="js" code={kthCode} />

      <h2 id="trace">Traced: the 3rd smallest value</h2>
      <CodeTrace
        code={traceSrc}
        steps={kthTrace()}
        caption="The stack always holds the ancestors that are still waiting for their turn. Each pop yields the next value in sorted order: 1, 2, then 3."
      />

      <h2 id="build">Build a balanced BST from a sorted array</h2>
      <p>
        Inserting values in sorted order produces a lopsided tree (next section), so build the tree directly instead. Make the
        <strong> middle</strong> element the root, then do the same for the left half and the right half. Every split keeps the two
        sides within one element of each other, so the tree comes out height-balanced.
      </p>
      <CodeBlock lang="js" code={buildCode} />
      <p>
        <strong>O(n)</strong> time (one node per element) and <strong>O(log n)</strong> recursion depth. Choosing the lower or the upper middle
        for even-sized ranges gives different, equally valid trees.
      </p>

      <h2 id="degenerate">Why an unbalanced BST is O(n)</h2>
      <p>
        The O(h) promise is only as good as h. If values arrive in sorted order, each new value is the largest so far and goes to the
        far right, producing a chain where every node has just one child. That is a linked list wearing a tree costume:
        search, insert and delete all become <strong>O(n)</strong>. This is called a <strong>degenerate</strong> (or skewed) tree.
      </p>
      <CodeBlock lang="js" code={degenerateCode} />
      <Callout kind="note" label="Balanced trees exist, but you rarely write them">
        <strong>Self-balancing</strong> trees (AVL trees, red-black trees) rotate nodes after inserts and deletes to keep h about log n,
        which guarantees O(log n) operations. Many language libraries use them inside ordered maps and sets. In interviews it is
        enough to know that they exist, and to say &quot;O(h), which is O(log n) if the tree is balanced and O(n) in the worst case&quot;.
      </Callout>
      <p>
        With balanced shapes the work doubles per level: a perfectly balanced tree with 1,000,000 nodes is only about 20 levels
        tall, so a search needs about 20 comparisons; the degenerate version could need a million.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>
        Before coding any BST question, ask: &quot;can I discard a side because of the BST property?&quot; and &quot;would inorder
        help?&quot;
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>State the BST property and say why &quot;every&quot; (not just the children) matters.</>,
          <>Describe the three cases of deletion and what replaces a node with two children.</>,
          <>Explain why checking only a node&apos;s parent fails to validate a BST, and how limits fix it.</>,
          <>Explain how inorder gives the k-th smallest, and how the stack lets you stop early.</>,
          <>Explain why a sorted insertion order makes a BST degenerate, and how choosing the middle prevents that.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        <strong>Lesson 45</strong> finishes the tree part with two classic families: the <strong>lowest common ancestor</strong>{" "}
        (the lowest node that has two given nodes beneath it, easy to find quickly in a BST using today&apos;s property), and{" "}
        <strong>rebuilding a tree from its traversals</strong>, where the inorder sequence splits the others into left and right.
      </p>
    </DsaLessonPage>
  );
}
