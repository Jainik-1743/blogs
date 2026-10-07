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
    best = Math.max(best, left + right);     // RECORD: the longest path that turns at this node
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
  t.step(1, "start", "best = 0", "best remembers the longest path found so far. We count the path in edges (links between nodes). The tree is: 1 has children 2 and 3, and 2 has children 4 and 5.", { best });
  function height(node: TNode | null): number {
    if (node === null) {
      t.step(4, "run", "empty subtree returns 0", "A missing child has height 0. This is the base case, the simple answer that stops the recursion.", { node: null, best });
      return 0;
    }
    const left = height(node.left);
    const right = height(node.right);
    const before = best;
    best = Math.max(best, left + right);
    t.step(8, "update", `node ${node.val}: left ${left} + right ${right} = ${left + right}`, best > before ? `A path that turns at node ${node.val} has ${left + right} edges. That is longer than the old best, so best becomes ${best}.` : `A path that turns at node ${node.val} has ${left + right} edges. That is not longer than best (${best}), so best stays.`, { node: node.val, left, right, best }, "best");
    const h = 1 + Math.max(left, right);
    t.step(9, "run", `node ${node.val} returns ${h}`, `Only one side can go on up to the parent. So we return 1 + max(${left}, ${right}) = ${h}.`, { node: node.val, left, right, best, returned: h }, "returned");
    return h;
  }
  height(root);
  t.step(11, "run", "height(root) is finished", "We visited every node exactly once. Now best holds the answer.", { best });
  t.print(best);
  t.step(12, "print", `prints ${best}`, "The longest path is 4 → 2 → 1 → 3 (or 5 → 2 → 1 → 3). It has three edges. It turns at the root, where the left height 2 plus the right height 1 gives 3.", { best });
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
    const left = Math.max(0, gain(node.left));     // a negative branch is better left out
    const right = Math.max(0, gain(node.right));
    best = Math.max(best, node.val + left + right);   // RECORD: a path that turns at this node
    return node.val + Math.max(left, right);          // RETURN: go on upward through one side only
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
        Lesson 41 introduced binary trees and walking them with recursion. Lesson 42 visited them row by row with a queue. This
        lesson uses <strong>depth-first search (DFS)</strong> to <em>answer questions about a whole tree</em>. DFS means going
        all the way down one branch, then backing up to try the next branch.
      </p>
      <p>
        Two terms to keep in mind. A <strong>binary tree</strong> is a set of nodes where each node has at most two children, a
        left child and a right child. The top node is the <strong>root</strong>. <strong>Recursion</strong> means a function that
        solves a problem by calling itself on a smaller piece of the same problem. On a tree, the smaller pieces are the left and
        right subtrees (a <strong>subtree</strong> is a node together with everything below it).
      </p>
      <p>
        The trick is a way of thinking. A tree is a node with two smaller trees hanging off it. So to answer a question about a
        tree, <strong>pretend the recursive call already gave the answer for the left side and the right side</strong>. Then join
        those two answers with the current node to make your own answer. <strong>Return</strong> that answer to the parent.
        Every tree function has the same three parts:
      </p>
      <ol>
        <li><strong>Base case.</strong> What is the answer for an empty tree (<code>null</code>)? This simple answer stops the recursion.</li>
        <li><strong>Recurse.</strong> Call the function on the left child and the right child. Trust the answers. Do not try to follow them in your head.</li>
        <li><strong>Combine.</strong> Use the two answers and <code>node.val</code> to make the answer for this node.</li>
      </ol>
      <p>
        The answer travels from the leaves <em>up</em> to the root, so this style is called <strong>bottom-up</strong>. The
        opposite is to pass information <em>down</em> as extra arguments. We do that for path sum. Many problems need both. Start
        by asking: &quot;what one value should a node give to its parent?&quot; (The difference in one line: bottom-up sends answers
        up from the children, and top-down sends information down to the children.)
      </p>
      <p>
        All samples below build their tree with a small helper called <code>buildTree</code>. It reads a level-order array (the
        tree row by row, from the top row down, and each row from left to right), where <code>null</code> marks a missing child.
        LeetCode uses the same format. Each sample is complete
        on its own, so you can paste it into a file and run it.
      </p>

      <h2 id="height">Height, the model problem</h2>
      <p>
        The <strong>height</strong> of a tree is the number of nodes on the longest path from the root down to a leaf (a{" "}
        <strong>leaf</strong> is a node with no children). An empty tree has height 0. A tree with one node has height 1. Some
        books count <strong>edges</strong> (the links between nodes) instead, so a single node has height 0 there. LeetCode&apos;s
        &quot;maximum depth&quot; counts nodes, and so do we.
      </p>
      <CodeBlock lang="js" code={heightCode} />
      <p>
        Read it with the three parts in mind. The base case is 0. We trust <code>height(node.left)</code> and{" "}
        <code>height(node.right)</code>. We combine them as &quot;the taller side, plus this node&quot;. Time is{" "}
        <strong>O(n)</strong> (the work grows in step with the number of nodes n), because each node is visited once. Extra space
        is <strong>O(h)</strong> for the recursion stack (the pile of calls that have started but not finished), where h is the
        height. For a bushy tree h is about log n. For a tree that is one long chain, h
        can be as big as n.
      </p>
      <Callout kind="note" label="Depth versus height">
        <strong>Depth</strong> is how far a node is below the root (the root has depth 0 or 1, depending on the book).{" "}
        <strong>Height</strong> is how far the deepest leaf is below a node. Information that flows <em>up</em> is a height.
        Information that flows <em>down</em> is a depth.
      </Callout>

      <h2 id="balanced">Balanced tree and the -1 trick</h2>
      <p>
        A tree is <strong>height-balanced</strong> if, at <em>every</em> node, the heights of the left side and the right side
        differ by at most 1. The simple way is to check each node by working out both heights from scratch:
      </p>
      <CodeBlock lang="js" code={balancedSlowCode} />
      <p>
        This works, but <code>height</code> is worked out again and again for the same nodes. On a tree shaped like a chain, each
        node starts a walk down everything below it. That takes <strong>O(n²)</strong> time. (On a perfectly bushy tree it is
        only O(n log n).)
      </p>
      <p>
        The fix is to do both jobs in <em>one</em> walk. The function returns the height as usual. But if it finds an unbalanced
        node, it returns the special value <code>-1</code> instead. A special value that works as a warning signal is called a{" "}
        <strong>sentinel</strong> (like a guard that raises an alarm). A height is never negative, so -1 cannot be mistaken
        for a real height. Every parent just passes the -1 straight up.
      </p>
      <CodeBlock lang="js" code={balancedFastCode} />
      <p>
        Now each node is visited once: <strong>O(n)</strong> time, <strong>O(h)</strong> space. Remember this pattern:{" "}
        <em>when a part of the tree can fail, let the returned value carry the failure upward.</em>
      </p>

      <h2 id="diameter">Diameter: record one thing, return another</h2>
      <p>
        The <strong>diameter</strong> of a tree is the length (counted in edges, the links between nodes) of the longest path
        between <em>any</em> two nodes. The path does not have to pass through the root. Look at the highest node on the path.
        This is where the path &quot;turns&quot;. From there it goes down the left side as far as it can, and down the right
        side as far as it can. So the length of the path through that node is <code>leftHeight + rightHeight</code>.
      </p>
      <p>
        Here is the idea that confuses many people. It also appears in the hardest problem of this lesson. The function{" "}
        <strong>returns</strong> one thing but <strong>records</strong> another thing:
      </p>
      <ul>
        <li>
          It <strong>records</strong> the best path that turns at this node (using <em>both</em> sides). It saves this in a
          variable that lives outside the recursion, often called a <strong>global best</strong>. Here it is a variable of the
          outer function, and the inner function can update it.
        </li>
        <li>
          It <strong>returns</strong> only the height (using <em>one</em> side). A parent can continue only one branch upward,
          because a path cannot split into two.
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
        note="When a question says 'any path' that can turn at its top node, expect this split: one thing recorded, another thing returned."
      />

      <h2 id="trace">Traced: diameter of a small tree</h2>
      <p>
        Step through the diameter on the tree <code>[1, 2, 3, 4, 5]</code>. Watch the order. The code goes all the way down to
        the leftmost leaf first. Values start to flow back up only after the recursion reaches empty children.
      </p>
      <CodeTrace
        code={traceSrc}
        steps={diameterTrace()}
        caption="The best path turns at the root: two levels down the left side (via 2) plus one level down the right side gives 3 edges. Each node returns only its height, never the path that turns."
      />

      <h2 id="pathsum">Path sum: passing a value down</h2>
      <p>
        <em>Does some path from the root to a leaf add up to the target?</em> Here the information travels{" "}
        <strong>down</strong>. At each node, subtract <code>node.val</code> from the target and give what is left to the
        children. At a leaf, what is left must equal the value of the leaf.
      </p>
      <CodeBlock lang="js" code={pathSumCode} />
      <Callout kind="warn" label="The leaf check matters">
        The path must end at a <strong>leaf</strong>. Suppose you only test <code>node.val === target</code> at every node. Then a
        target of 5 would be &quot;found&quot; at the root of the example. That is wrong, because the root has children. Also,
        values can be negative. So you cannot stop early just because what is left drops below zero.
      </Callout>

      <h2 id="maxpath">Maximum path sum (the hard one)</h2>
      <p>
        Now we use everything together. A <strong>path</strong> is any chain of connected nodes that never visits a node twice.
        It can start and end anywhere. It does not need to touch the root or a leaf. Find the largest sum of node values on such a
        path. Values can be negative.
      </p>
      <p>
        It is the diameter pattern, but with sums instead of lengths:
      </p>
      <ul>
        <li>
          <code>gain(node)</code> is the best sum of a path that starts at <code>node</code> and goes down one side only. We{" "}
          <strong>return</strong> this.
        </li>
        <li>
          The best path that turns at <code>node</code> is <code>node.val + leftGain + rightGain</code>. We{" "}
          <strong>record</strong> this.
        </li>
        <li>
          A negative gain only makes the sum smaller, so we replace it with 0. That means &quot;do not go that way&quot;.{" "}
          <code>Math.max(0, ...)</code> does this.
        </li>
      </ul>
      <CodeBlock lang="js" code={maxPathCode} />
      <DryRun
        title="tree [-10, 9, 20, null, null, 15, 7]"
        cols={["Node", "Left gain", "Right gain", "Path that turns here (recorded)", "Returned"]}
        rows={[
          ["9", "0", "0", "9", "9"],
          ["15", "0", "0", "15", "15"],
          ["7", "0", "0", "7", "7"],
          ["20", "15", "7", "20 + 15 + 7 = 42", "20 + 15 = 35"],
          ["-10", "9", "35", "-10 + 9 + 35 = 34", "-10 + 35 = 25"],
        ]}
        note="The best recorded value is 42: the path 15 → 20 → 7. The function never returns this answer. That is why we need the outer variable."
      />
      <p>
        <strong>O(n)</strong> time, <strong>O(h)</strong> space. There are two classic mistakes. The first is to start{" "}
        <code>best</code> at 0. A tree with only negative values must answer with its largest value, the one closest to zero,
        like -3 above. The second is to return the path that turns instead of the one-sided gain. Then the parent would add a
        path that splits in two.
      </p>

      <h2 id="symmetric">Symmetric tree and subtree of another tree</h2>
      <p>
        Both of these compare <em>two</em> trees at once. So the recursive function takes two nodes and walks them together.
      </p>
      <p>
        A tree is <strong>symmetric</strong> if its left half is the mirror image of its right half. Two trees <code>a</code> and{" "}
        <code>b</code> are mirrors when three things are true. Their root values match. The left side of <code>a</code> mirrors
        the <em>right</em> side of <code>b</code>. The right side of <code>a</code> mirrors the <em>left</em> side of{" "}
        <code>b</code>. The crossing over is the whole idea.
      </p>
      <CodeBlock lang="js" code={symmetricCode} />
      <p>
        For <em>subtree of another tree</em>, we first write <code>isSameTree(a, b)</code>. It is the same walk but without
        crossing: left with left, and right with right. Then we try it at every node of the big tree:
      </p>
      <CodeBlock lang="js" code={subtreeCode} />
      <p>
        Each call of <code>isSameTree</code> costs up to the size of the smaller tree. We try it at up to n nodes. So the total is{" "}
        <strong>O(m · n)</strong> for trees with n and m nodes. That is fine for interview limits. A faster way is to turn each
        tree into a string (a line of text) and check whether one string is a <strong>substring</strong> of the other (a piece of
        text found inside the longer text). Question 6 shows how, and the separator trap you must avoid.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>
        For each question, say aloud: &quot;What does my function return to the parent? Does it also need to record something
        else?&quot;
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Name the three parts of a bottom-up tree function: base case, recurse, combine.</>,
          <>Explain how returning -1 lets one walk check the balance, and why that is better than working out heights again and again.</>,
          <>For diameter and maximum path sum, explain what is recorded and what is returned, and why they are different.</>,
          <>Say why path sum must test for a leaf, and why a negative gain is replaced by 0.</>,
          <>Say which children are paired in the mirror check, and why.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        So far a tree could hold any values in any order. <strong>Lesson 44</strong> adds one rule: &quot;smaller values go to the
        left, larger values go to the right&quot;. This gives us the <strong>binary search tree</strong>. You can search it, add
        to it and delete from it in about log n steps.
      </p>
    </DsaLessonPage>
  );
}
