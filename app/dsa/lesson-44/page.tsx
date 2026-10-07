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
  t.step(3, "start", "cur = root (5), k = 3", "We want the 3rd smallest value of the tree 5 → (3 → (2 → 1), 4), 6. Inorder gives values from smallest to largest, so we need the third value that we pop.", { k, cur: cur.val, stack: vals() });
  while (cur !== null || stack.length > 0) {
    while (cur !== null) {
      stack.push(cur);
      const pushed: number = cur.val;
      cur = cur.left;
      t.step(7, "update", `push ${pushed}, move left`, cur ? `Keep ${pushed} on the stack for later, and go to its left child, ${cur.val}.` : `Keep ${pushed} on the stack for later. It has no left child, so cur becomes null and we stop going down.`, { k, cur: cur ? cur.val : null, stack: vals() }, "stack");
    }
    cur = stack.pop()!;
    t.step(9, "update", `pop ${cur.val}`, `There is nothing smaller on the left, so ${cur.val} is the next value in sorted order.`, { k, cur: cur.val, stack: vals() }, "cur");
    k--;
    t.step(10, "update", `k = ${k}`, k === 0 ? `k reaches 0, so ${cur.val} is the 3rd smallest.` : `We have counted ${3 - k} value${3 - k === 1 ? "" : "s"} so far. ${k} more to go.`, { k, cur: cur.val, stack: vals() }, "k");
    if (k === 0) {
      t.step(11, "run", `k is 0: return ${cur.val}`, "We stop right away. We never visit the rest of the tree (4, 5 and 6).", { k, cur: cur.val, stack: vals() });
      t.print(cur.val);
      t.step(15, "print", `prints ${cur.val}`, "The 3rd smallest value is 3.", { k, stack: vals() });
      break;
    }
    cur = cur.right;
    t.step(12, "update", `cur = right child: ${cur ? cur.val : "null"}`, cur ? `Now we handle the right side of the value we just counted, starting at ${cur.val}.` : "It has no right child, so the next value comes from popping the stack.", { k, cur: cur ? cur.val : null, stack: vals() }, "cur");
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
        Every value in the <strong>left</strong> side of a node (its left subtree, meaning the left child and everything below it)
        is <strong>smaller</strong> than the value of the node. Every value in the <strong>right</strong> side is{" "}
        <strong>larger</strong>. (We assume all values are different, as LeetCode does for these problems.)
      </Callout>
      <p>
        Notice the word <em>every</em>. The rule covers the whole left side and right side, not only the direct children. This
        detail causes the most common bug in this lesson. Two things make BSTs useful:
      </p>
      <ul>
        <li>
          <strong>Binary search on a tree.</strong> At each node you can ignore one whole side. Binary search on a sorted array
          ignores half of the array in the same way. A search takes as many steps as the tree is tall.
        </li>
        <li>
          <strong>Inorder gives sorted order.</strong> Visit the left side, then the node, then the right side. This is the{" "}
          <em>inorder</em> walk from lesson 41. It lists the values from smallest to largest. Several questions below use just
          this fact.
        </li>
      </ul>
      <p>
        Most operations cost <strong>O(h)</strong>, where <em>h</em> is the <strong>height</strong> of the tree. For a bushy tree
        h is about log n. The last section shows when it is not. All samples use the same <code>buildTree</code> helper as the
        last lesson (a level-order array, with <code>null</code> for a missing child). Each sample is complete on its own.
      </p>

      <h2 id="search">Search</h2>
      <p>
        Compare the target with the current node. If they are equal, you found it. If the target is smaller, go left. If it is
        larger, go right. If you fall off the tree (<code>null</code>), the value is not there. Here are two versions: one with
        recursion and one with a loop. The loop uses O(1) extra space. The recursion uses O(h) for the call stack (the pile of
        open calls).
      </p>
      <CodeBlock lang="js" code={searchCode} />

      <h2 id="insert">Insert</h2>
      <p>
        To insert, you search, and you stop at the empty spot where the value should be. The new node always becomes a{" "}
        <strong>leaf</strong> (a node with no children). Existing nodes never move. The helper <code>serialize</code> in this
        sample turns a tree back into a level-order array, so we can print it.
      </p>
      <CodeBlock lang="js" code={insertCode} />
      <p>
        Several tree shapes can be valid after an insertion. A different method could move nodes around. The simple &quot;add
        as a leaf&quot; method is what interviewers usually expect.
      </p>

      <h2 id="delete">Delete: three cases</h2>
      <p>First find the node (search). Then it is in one of three situations:</p>
      <DryRun
        title="deleting a node"
        cols={["Case", "What to do", "Why it keeps the BST property"]}
        rows={[
          ["It is a leaf", "Remove it (return null to the parent)", "Nothing depended on it."],
          ["It has one child", "Replace it with that child", "The child, with everything below it, is already on the correct side of the parent."],
          ["It has two children", "Copy the inorder successor (the next value in sorted order, which is the smallest value on the right side) into this node. Then delete that successor from the right side", "The successor is larger than everything on the left, and not larger than anything on the right."],
        ]}
        note="The successor has no left child (otherwise it would not be the smallest). So deleting it is always case 1 or 2. You can also use the largest value on the left side, the inorder predecessor (the value just before it in sorted order). It works just as well."
      />
      <CodeBlock lang="js" code={deleteCode} />
      <p>
        The function returns the root of each part of the tree (it may be a new node), so the parent can attach it again with{" "}
        <code>root.left = deleteNode(root.left, key)</code>. Time is <strong>O(h)</strong>: one search down, plus one more walk
        down to find the successor.
      </p>

      <h2 id="validate">Validate a BST</h2>
      <p>
        <em>Is this tree a valid BST?</em> The easy idea is to check each node against its two children. It looks right, but it
        is wrong:
      </p>
      <CodeBlock lang="js" code={wrongValidateCode} />
      <p>
        Here every parent-child pair is fine (1 &lt; 5, 6 &gt; 5, 3 &lt; 6, 7 &gt; 6). But 3 is on the right side of 5, which
        breaks the rule for <em>every</em> node. The fix is to carry <strong>limits</strong> down the tree. When you go left, the
        current value becomes the new upper limit. When you go right, it becomes the new lower limit. Each node must be strictly
        between the limits set by all of its ancestors (the parent, the grandparent, and so on up to the root).
      </p>
      <CodeBlock lang="js" code={validateCode} />
      <p>
        <strong>O(n)</strong> time, <strong>O(h)</strong> space. Another way to test: do an inorder walk and check that each
        value is strictly larger than the one before it. Use <code>-Infinity</code> and <code>Infinity</code> as the starting
        limits. Do not use the smallest and largest whole numbers, because a node may really hold one of those numbers.
      </p>

      <h2 id="kth">K-th smallest with inorder</h2>
      <p>
        Inorder visits values from smallest to largest. So the k-th smallest value is the k-th node we visit. The version
        without recursion keeps its own <strong>stack</strong> of the nodes on the way back up. This lets us{" "}
        <strong>stop early</strong> as soon as we have counted k nodes. We visit only about h + k nodes, not all n.
      </p>
      <CodeBlock lang="js" code={kthCode} />

      <h2 id="trace">Traced: the 3rd smallest value</h2>
      <CodeTrace
        code={traceSrc}
        steps={kthTrace()}
        caption="The stack always holds the ancestors that are still waiting for their turn. Each pop gives the next value in sorted order: 1, 2, then 3."
      />

      <h2 id="build">Build a balanced BST from a sorted array</h2>
      <p>
        If you insert values in sorted order, you get a lopsided tree (see the next section). So build the tree directly
        instead. Make the <strong>middle</strong> element the root. Then do the same for the left half and the right half. Each
        split keeps the two sides within one element of each other. So the tree is height-balanced.
      </p>
      <CodeBlock lang="js" code={buildCode} />
      <p>
        <strong>O(n)</strong> time (one node per element) and <strong>O(log n)</strong> recursion depth. When the range has an
        even number of items, you can choose the lower middle or the upper middle. You get different trees, and both are valid.
      </p>

      <h2 id="degenerate">Why an unbalanced BST is O(n)</h2>
      <p>
        O(h) is only as good as h. Say the values arrive in sorted order. Each new value is the largest so far, so it goes far
        to the right. The result is a chain where every node has just one child. That is really a linked list shaped like a
        tree. Search, insert and delete all become <strong>O(n)</strong>. This is called a <strong>degenerate</strong> (or
        skewed) tree.
      </p>
      <CodeBlock lang="js" code={degenerateCode} />
      <Callout kind="note" label="Balanced trees exist, but you rarely write them">
        <strong>Self-balancing</strong> trees (AVL trees and red-black trees) turn nodes around (this is called rotating) after
        each insert and delete. This keeps h about log n, so every operation takes O(log n). Many language libraries use them
        inside ordered maps and sets. In interviews it is enough to know that they exist. You can say: &quot;O(h). That is
        O(log n) if the tree is balanced, and O(n) in the worst case.&quot;
      </Callout>
      <p>
        In a balanced tree, each level holds about twice as many nodes as the level above. So a perfectly balanced tree with
        1,000,000 nodes is only about 20 levels tall. A search needs about 20 comparisons. The degenerate version could need a
        million.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>
        Before you code any BST question, ask two things. &quot;Can I ignore one side because of the BST property?&quot; And
        &quot;Would inorder help?&quot;
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Say the BST property, and explain why &quot;every&quot; (not just the children) matters.</>,
          <>Describe the three cases of deletion, and what replaces a node that has two children.</>,
          <>Explain why checking only the parent of a node fails to validate a BST, and how limits fix it.</>,
          <>Explain how inorder gives the k-th smallest value, and how the stack lets you stop early.</>,
          <>Explain why inserting in sorted order makes a BST degenerate, and how choosing the middle prevents that.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        <strong>Lesson 45</strong> finishes the tree part with two classic groups of problems. The first is the{" "}
        <strong>lowest common ancestor</strong>: the lowest node that has two given nodes below it. In a BST it is quick to find,
        using today&apos;s property. The second is <strong>rebuilding a tree from its walks</strong>. There, the inorder list
        splits the other lists into a left part and a right part.
      </p>
    </DsaLessonPage>
  );
}
