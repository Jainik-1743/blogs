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

const lesson = getDsaLesson("lesson-43");

export const metadata: Metadata = {
  title: `Lesson 43 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "mindset", label: "The mindset: return a value up the tree" },
  { id: "height", label: "Height, the model problem" },
  { id: "balanced", label: "Balanced tree and the -1 trick" },
  { id: "diameter", label: "Diameter: record one thing, return another" },
  { id: "trace", label: "Traced: diameter of a small tree" },
  { id: "pathsum", label: "Path sum: passing a value down" },
  { id: "maxpath", label: "Maximum path sum (the hard one)" },
  { id: "symmetric", label: "Symmetric tree and subtree of another tree" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const heightCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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

function height(node) {
  if (node === null) return 0;              // base case: an empty tree has height 0
  const left = height(node.left);           // trust the recursion: height of the left subtree
  const right = height(node.right);         // ... and of the right subtree
  return 1 + Math.max(left, right);         // combine: this node adds one level
}

console.log(height(buildTree([3, 9, 20, null, null, 15, 7]))); // 3
console.log(height(buildTree([1, 2, null, 3])));               // 3
console.log(height(buildTree([])));                            // 0`;

const balancedSlowCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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

function height(node) {
  if (node === null) return 0;
  return 1 + Math.max(height(node.left), height(node.right));
}

// Top-down: at every node, compute both heights from scratch, then ask the children too.
function isBalancedSlow(node) {
  if (node === null) return true;
  if (Math.abs(height(node.left) - height(node.right)) > 1) return false;
  return isBalancedSlow(node.left) && isBalancedSlow(node.right);
}

console.log(isBalancedSlow(buildTree([3, 9, 20, null, null, 15, 7])));          // true
console.log(isBalancedSlow(buildTree([1, 2, 2, 3, 3, null, null, 4, 4])));      // false`;

const balancedFastCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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
  // Returns the height of the subtree, or -1 as soon as any subtree is unbalanced.
  function check(node) {
    if (node === null) return 0;
    const left = check(node.left);
    if (left === -1) return -1;             // a problem below: pass it straight up
    const right = check(node.right);
    if (right === -1) return -1;
    if (Math.abs(left - right) > 1) return -1;   // this node is the problem
    return 1 + Math.max(left, right);
  }
  return check(root) !== -1;
}

console.log(isBalanced(buildTree([3, 9, 20, null, null, 15, 7])));          // true
console.log(isBalanced(buildTree([1, 2, 2, 3, 3, null, null, 4, 4])));      // false
console.log(isBalanced(buildTree([])));                                      // true`;

const diameterCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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
  let best = 0;                              // the answer: the longest path seen at any node
  function height(node) {
    if (node === null) return 0;
    const left = height(node.left);
    const right = height(node.right);
    best = Math.max(best, left + right);     // RECORD: the longest path that bends at this node
    return 1 + Math.max(left, right);        // RETURN: only one side can continue upward
  }
  height(root);
  return best;
}

console.log(diameterOfBinaryTree(buildTree([1, 2, 3, 4, 5])));   // 3
console.log(diameterOfBinaryTree(buildTree([1, 2])));            // 1
console.log(diameterOfBinaryTree(buildTree([1])));               // 0`;

const traceSrc = `let best = 0;
function height(node) {
  if (node === null) {
    return 0;
  }
  const left = height(node.left);
  const right = height(node.right);
  best = Math.max(best, left + right);
  return 1 + Math.max(left, right);
}
height(root);
console.log(best);`;

type TNode = { val: number; left: TNode | null; right: TNode | null };
const mk = (val: number, left: TNode | null = null, right: TNode | null = null): TNode => ({ val, left, right });

function diameterTrace() {
  const t = tracer();
  // Tree [1, 2, 3, 4, 5]: 1 has children 2 and 3; 2 has children 4 and 5.
  const root = mk(1, mk(2, mk(4), mk(5)), mk(3));
  let best = 0;
  t.step(1, "start", "best = 0", "best remembers the longest path (counted in edges) that bends at some node. The tree is 1 with children 2 and 3, and 2 has children 4 and 5.", { best });
  function height(node: TNode | null): number {
    if (node === null) {
      t.step(4, "run", "empty subtree returns 0", "A missing child has height 0. This is the base case that stops the recursion.", { node: null, best });
      return 0;
    }
    const left = height(node.left);
    const right = height(node.right);
    const before = best;
    best = Math.max(best, left + right);
    t.step(8, "update", `node ${node.val}: left ${left} + right ${right} = ${left + right}`, best > before ? `A path that bends at node ${node.val} has ${left + right} edges. That beats the old best, so best becomes ${best}.` : `A path that bends at node ${node.val} has ${left + right} edges, which does not beat best (${best}).`, { node: node.val, left, right, best }, "best");
    const h = 1 + Math.max(left, right);
    t.step(9, "run", `node ${node.val} returns ${h}`, `Only one side can continue up to the parent, so we return 1 + max(${left}, ${right}) = ${h}.`, { node: node.val, left, right, best, returned: h }, "returned");
    return h;
  }
  height(root);
  t.step(11, "run", "height(root) is finished", "Every node has been visited exactly once. Now best holds the answer.", { best });
  t.print(best);
  t.step(12, "print", `prints ${best}`, "The longest path is 4 → 2 → 1 → 3 (or 5 → 2 → 1 → 3): three edges. It bends at the root, where left height 2 plus right height 1 gives 3.", { best });
  return t.steps;
}

const pathSumCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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

function hasPathSum(node, target) {
  if (node === null) return false;                       // no tree, no path
  if (node.left === null && node.right === null) {       // a leaf: the path must end here
    return node.val === target;
  }
  const rest = target - node.val;                        // pass the remaining sum DOWN
  return hasPathSum(node.left, rest) || hasPathSum(node.right, rest);
}

const tree = buildTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]);
console.log(hasPathSum(tree, 22)); // true  (5 + 4 + 11 + 2)
console.log(hasPathSum(tree, 26)); // true  (5 + 8 + 13)
console.log(hasPathSum(tree, 5));  // false (5 is not a leaf)`;

const maxPathCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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
  let best = -Infinity;                      // values can be negative, so do not start at 0
  // Returns the best sum of a path that starts at "node" and goes DOWN one side only.
  function gain(node) {
    if (node === null) return 0;
    const left = Math.max(0, gain(node.left));     // a negative branch is better dropped
    const right = Math.max(0, gain(node.right));
    best = Math.max(best, node.val + left + right);   // RECORD: a path that bends at this node
    return node.val + Math.max(left, right);          // RETURN: continue upward through one side
  }
  gain(root);
  return best;
}

console.log(maxPathSum(buildTree([1, 2, 3])));                       // 6
console.log(maxPathSum(buildTree([-10, 9, 20, null, null, 15, 7])));  // 42
console.log(maxPathSum(buildTree([-3])));                            // -3`;

const symmetricCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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
  // Are the trees a and b mirror images of each other?
  function mirror(a, b) {
    if (a === null && b === null) return true;
    if (a === null || b === null) return false;
    return a.val === b.val && mirror(a.left, b.right) && mirror(a.right, b.left);
  }
  return root === null || mirror(root.left, root.right);
}

console.log(isSymmetric(buildTree([1, 2, 2, 3, 4, 4, 3])));        // true
console.log(isSymmetric(buildTree([1, 2, 2, null, 3, null, 3])));  // false`;

const subtreeCode = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
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

function isSameTree(a, b) {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.val === b.val && isSameTree(a.left, b.left) && isSameTree(a.right, b.right);
}

function isSubtree(root, subRoot) {
  if (root === null) return subRoot === null;
  return isSameTree(root, subRoot) || isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}

console.log(isSubtree(buildTree([3, 4, 5, 1, 2]), buildTree([4, 1, 2])));                                // true
console.log(isSubtree(buildTree([3, 4, 5, 1, 2, null, null, null, null, 0]), buildTree([4, 1, 2])));     // false`;

export default function DsaLessonFortyThreePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="mindset">The mindset: return a value up the tree</h2>
      <p>
        Lesson 41 introduced binary trees and their recursive traversals, and lesson 42 visited them layer by layer with a queue.
        This lesson uses <strong>depth-first search (DFS)</strong>, which means going all the way down one branch before backing
        up and trying the next, to <em>answer questions about a whole tree</em>.
      </p>
      <p>
        The trick is a way of thinking. A tree is a node with two smaller trees hanging off it. So to answer a question about a
        tree, <strong>pretend the recursion already answered it for the left and right subtrees</strong>, then combine those two
        answers with the current node into your own answer, and <strong>return</strong> it to the parent. Every tree
        function has the same three parts:
      </p>
      <ol>
        <li><strong>Base case.</strong> What is the answer for an empty tree (<code>null</code>)? This stops the recursion.</li>
        <li><strong>Recurse.</strong> Ask the left child and the right child. Trust the answers; do not trace them in your head.</li>
        <li><strong>Combine.</strong> Use the two answers and <code>node.val</code> to build this node&apos;s answer.</li>
      </ol>
      <p>
        Because the answer travels from the leaves <em>up</em> to the root, this style is sometimes called <strong>bottom-up</strong>.
        Its opposite is passing information <em>down</em> as extra arguments (we will do that for path sum). Many problems need
        both, but start by asking: &quot;what single value should a node hand to its parent?&quot;
      </p>
      <p>
        All samples below build their tree with a small helper, <code>buildTree</code>, that reads a level-order array where{" "}
        <code>null</code> marks a missing child (the same format LeetCode uses). Each sample is self-contained, so you can paste it
        into a file and run it.
      </p>

      <h2 id="height">Height, the model problem</h2>
      <p>
        The <strong>height</strong> of a tree is the number of nodes on the longest path from the root down to a leaf (a{" "}
        <strong>leaf</strong> is a node with no children). An empty tree has height 0. (Some books count edges instead, which
        makes a single node height 0. LeetCode&apos;s &quot;maximum depth&quot; counts nodes, and so do we.)
      </p>
      <CodeBlock lang="js" code={heightCode} />
      <p>
        Read it with the mindset: the base case is 0; we trust <code>height(node.left)</code> and <code>height(node.right)</code>;
        we combine them as &quot;the taller side, plus this node&quot;. Time is <strong>O(n)</strong> because each node is visited once,
        and space is <strong>O(h)</strong> for the recursion stack, where h is the height: about log n for a bushy tree but up to n
        for a tree that is one long chain.
      </p>
      <Callout kind="note" label="Depth versus height">
        <strong>Depth</strong> counts down from the root (the root has depth 0 or 1), while <strong>height</strong> counts down from a
        node to its deepest leaf. Information that flows <em>up</em> is a height; information that flows <em>down</em> is a depth.
      </Callout>

      <h2 id="balanced">Balanced tree and the -1 trick</h2>
      <p>
        A tree is <strong>height-balanced</strong> if, at <em>every</em> node, the heights of the left and right subtrees differ
        by at most 1. The direct translation checks each node by computing both heights from scratch:
      </p>
      <CodeBlock lang="js" code={balancedSlowCode} />
      <p>
        This works, but <code>height</code> is recomputed again and again for the same nodes. On a chain-like tree each node
        triggers a walk down its whole subtree, which is <strong>O(n²)</strong>. (On a perfectly bushy tree it is only O(n log n).)
      </p>
      <p>
        The fix is to do both jobs in <em>one</em> traversal. The function returns the height as usual, but if it ever finds an
        unbalanced node it returns the special value <code>-1</code> instead. A value used as a signal like this is called a{" "}
        <strong>sentinel</strong>. Heights are never negative, so -1 can never be confused with a real height, and every parent
        simply passes the -1 straight up.
      </p>
      <CodeBlock lang="js" code={balancedFastCode} />
      <p>
        Now each node is visited once: <strong>O(n)</strong> time, <strong>O(h)</strong> space. The pattern is worth remembering:
        <em> when a subtree can fail, let the returned value carry the failure upward.</em>
      </p>

      <h2 id="diameter">Diameter: record one thing, return another</h2>
      <p>
        The <strong>diameter</strong> of a tree is the length (in edges) of the longest path between <em>any</em> two nodes. The
        path does not have to pass through the root. Think of the highest node on the path, where it &quot;bends&quot;: the path goes down
        the left side as far as possible and down the right side as far as possible, so its length through that node is{" "}
        <code>leftHeight + rightHeight</code>.
      </p>
      <p>
        Here is the idea that confuses people, and it appears in the hardest problem of this lesson too. The function must{" "}
        <strong>return</strong> something different from what it <strong>records</strong>:
      </p>
      <ul>
        <li>
          It <strong>records</strong> the best bent path through this node (using <em>both</em> sides) in a variable that lives
          outside the recursion, often called a <strong>global best</strong> (here a local variable of the outer function that the inner
          function can update).
        </li>
        <li>
          It <strong>returns</strong> only the height (using <em>one</em> side), because a parent can extend only one branch
          upward. A path cannot fork.
        </li>
      </ul>
      <CodeBlock lang="js" code={diameterCode} />
      <DryRun
        title="the pattern shared by the four problems so far"
        cols={["Problem", "Returns to the parent", "Records in the outer variable"]}
        rows={[
          ["height", "1 + max(left, right)", "nothing"],
          ["balanced tree", "the height, or -1 on failure", "nothing (the -1 carries the failure)"],
          ["diameter", "1 + max(left, right)", "left + right at every node"],
          ["maximum path sum", "node + the better one-sided gain", "node + both gains at every node"],
        ]}
        note="Whenever a question says 'any path' that can bend at its top node, expect a record-versus-return split."
      />

      <h2 id="trace">Traced: diameter of a small tree</h2>
      <p>
        Step through the diameter on the tree <code>[1, 2, 3, 4, 5]</code>. Watch the order: the code goes all the way down to
        the leftmost leaf first, and values only start flowing back up once the recursion reaches empty subtrees.
      </p>
      <CodeTrace
        code={traceSrc}
        steps={diameterTrace()}
        caption="The best path bends at the root: two levels down the left (via 2) plus one level down the right gives 3 edges. Each node returns only its height, never the bent path."
      />

      <h2 id="pathsum">Path sum: passing a value down</h2>
      <p>
        <em>Does some root-to-leaf path add up to the target?</em> Here information travels <strong>down</strong>. At each node,
        subtract <code>node.val</code> from the target and hand the remainder to the children. At a leaf, the remainder must
        equal the leaf&apos;s own value.
      </p>
      <CodeBlock lang="js" code={pathSumCode} />
      <Callout kind="warn" label="The leaf check matters">
        The path must end at a <strong>leaf</strong>. If you only test <code>node.val === target</code> at every node, then a
        target of 5 would be &quot;found&quot; at the root of the example, which is wrong because the root has children. Also note that values can be negative,
        so you can never stop early just because the remainder drops below zero.
      </Callout>

      <h2 id="maxpath">Maximum path sum (the hard one)</h2>
      <p>
        Now combine everything. A <strong>path</strong> is any chain of connected nodes that never visits a node twice; it may start
        and end anywhere and does not need to touch the root or a leaf. Find the largest sum of node values on such a path. Values
        can be negative.
      </p>
      <p>
        It is the diameter pattern with sums instead of lengths:
      </p>
      <ul>
        <li>
          <code>gain(node)</code> = the best sum of a path that starts at <code>node</code> and goes down one side. This is what we{" "}
          <strong>return</strong>.
        </li>
        <li>
          The best path that bends at <code>node</code> is <code>node.val + leftGain + rightGain</code>. This is what we{" "}
          <strong>record</strong>.
        </li>
        <li>
          A negative gain only hurts, so we replace it by 0, meaning &quot;do not go that way&quot;. That is what{" "}
          <code>Math.max(0, ...)</code> does.
        </li>
      </ul>
      <CodeBlock lang="js" code={maxPathCode} />
      <DryRun
        title="tree [-10, 9, 20, null, null, 15, 7]"
        cols={["Node", "Left gain", "Right gain", "Bent path (recorded)", "Returned"]}
        rows={[
          ["9", "0", "0", "9", "9"],
          ["15", "0", "0", "15", "15"],
          ["7", "0", "0", "7", "7"],
          ["20", "15", "7", "20 + 15 + 7 = 42", "20 + 15 = 35"],
          ["-10", "9", "35", "-10 + 9 + 35 = 34", "-10 + 35 = 25"],
        ]}
        note="The best recorded value is 42: the path 15 → 20 → 7. The answer is not returned by the function at all, which is why the outer variable is needed."
      />
      <p>
        <strong>O(n)</strong> time, <strong>O(h)</strong> space. Two classic mistakes: starting <code>best</code> at 0 (an
        all-negative tree must answer with its largest, least-negative value, like -3 above), and returning the bent path
        instead of the one-sided gain (the parent would then be adding a path that forks).
      </p>

      <h2 id="symmetric">Symmetric tree and subtree of another tree</h2>
      <p>
        Both of these compare <em>two</em> trees at once, so the recursive function takes two nodes and walks them together.
      </p>
      <p>
        A tree is <strong>symmetric</strong> if its left half is the mirror image of its right half. Two trees <code>a</code> and{" "}
        <code>b</code> are mirrors when their root values match, <code>a</code>&apos;s left mirrors <code>b</code>&apos;s{" "}
        <em>right</em>, and <code>a</code>&apos;s right mirrors <code>b</code>&apos;s <em>left</em>. The crossing over is the whole
        idea.
      </p>
      <CodeBlock lang="js" code={symmetricCode} />
      <p>
        For <em>subtree of another tree</em> we first write <code>isSameTree(a, b)</code> (the same walk, but without crossing:
        left with left, right with right), then try it at every node of the big tree:
      </p>
      <CodeBlock lang="js" code={subtreeCode} />
      <p>
        <code>isSameTree</code> costs O(min(size of both)) per call, and it is tried at up to n nodes, so the total is{" "}
        <strong>O(m · n)</strong> for trees with n and m nodes. That is fine for interview limits. A faster alternative turns
        each tree into a string and checks substring containment; question 6 shows how, and the delimiter trap you must avoid.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>
        For each one, say aloud: &quot;what does my function return to the parent, and does it also need to record something
        else?&quot;
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>State the three parts of a bottom-up tree function: base case, recurse, combine.</>,
          <>Explain how returning -1 lets one traversal check balance, and why that beats recomputing heights.</>,
          <>Explain for diameter and maximum path sum what is recorded and what is returned, and why they differ.</>,
          <>Say why path sum must test for a leaf, and why a negative gain is replaced by 0.</>,
          <>Say which children are paired in the mirror check, and why.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        So far a tree could hold any values in any arrangement. <strong>Lesson 44</strong> adds one rule, &quot;smaller values to the
        left, larger to the right&quot;, which gives us the <strong>binary search tree</strong>: a tree you can search, insert
        into and delete from in about log n steps.
      </p>
    </DsaLessonPage>
  );
}
