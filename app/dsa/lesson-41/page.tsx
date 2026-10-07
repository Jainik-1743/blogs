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

const lesson = getDsaLesson("lesson-41");

export const metadata: Metadata = {
  title: `Lesson 41 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "why", label: "Why trees?" },
  { id: "words", label: "Tree vocabulary" },
  { id: "node", label: "A node in JavaScript" },
  { id: "build", label: "Building a tree from an array" },
  { id: "recursive", label: "Three ways to walk a tree" },
  { id: "trace", label: "Traced: one walk, three orders" },
  { id: "iterative", label: "Walking with an explicit stack" },
  { id: "small", label: "Depth, same tree, invert" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const nodeCode = `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;      // the value stored in this node
    this.left = left;    // another TreeNode, or null if there is no left child
    this.right = right;  // another TreeNode, or null if there is no right child
  }
}

//      1
//     / \\
//    2   3
//   / \\
//  4   5
const root = new TreeNode(1, new TreeNode(2, new TreeNode(4), new TreeNode(5)), new TreeNode(3));
console.log(root.left.right.val); // 5
console.log(root.right.left);     // null  (3 is a leaf, it has no children)`;

const buildCode = `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// Level-order array -> tree. null marks a missing child (the format LeetCode uses).
function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];          // nodes that still need their children attached
  let head = 0;                  // read position in the queue (no slow shift)
  let i = 1;                     // next unread value in arr
  while (head < queue.length && i < arr.length) {
    const node = queue[head++];
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i]); queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); }
    i++;
  }
  return root;
}

const root = buildTree([3, 9, 20, null, null, 15, 7]);
console.log(root.val, root.left.val, root.right.val);       // 3 9 20
console.log(root.right.left.val, root.right.right.val);     // 15 7
console.log(root.left.left, root.left.right);               // null null`;

const recursiveCode = `class TreeNode {
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

function preorder(node, out = []) {
  if (node === null) return out;
  out.push(node.val);          // visit first ...
  preorder(node.left, out);
  preorder(node.right, out);
  return out;
}

function inorder(node, out = []) {
  if (node === null) return out;
  inorder(node.left, out);
  out.push(node.val);          // ... visit in the middle ...
  inorder(node.right, out);
  return out;
}

function postorder(node, out = []) {
  if (node === null) return out;
  postorder(node.left, out);
  postorder(node.right, out);
  out.push(node.val);          // ... or visit last
  return out;
}

const root = buildTree([1, 2, 3, 4, 5]);
console.log(preorder(root));  // [1, 2, 4, 5, 3]
console.log(inorder(root));   // [4, 2, 5, 1, 3]
console.log(postorder(root)); // [4, 5, 2, 3, 1]`;

const traceSrc = `function walk(node) {
  if (node === null) return;
  pre.push(node.val);
  walk(node.left);
  ino.push(node.val);
  walk(node.right);
  post.push(node.val);
}
walk(root);`;

type TNode = { val: number; left: TNode | null; right: TNode | null };

function walkTrace() {
  const t = tracer();
  const n = (val: number, left: TNode | null = null, right: TNode | null = null): TNode => ({ val, left, right });
  const root = n(1, n(2, n(4), n(5)), n(3));
  const pre: number[] = [];
  const ino: number[] = [];
  const post: number[] = [];
  const path: number[] = [];
  const vars = (node: TNode) => ({ node: node.val, path: [...path], pre: [...pre], ino: [...ino], post: [...post] });
  t.step(9, "start", "walk(root)", "We call walk on the root, node 1. Each call handles one node and hands its two subtrees to two more calls. The path shows the calls that are open right now.", { pre: [], ino: [], post: [] });
  function walk(node: TNode | null) {
    if (node === null) return; // a null child returns at once (line 2)
    path.push(node.val);
    pre.push(node.val);
    t.step(3, "update", `preorder: visit ${node.val}`, `Arriving at node ${node.val} for the first time: preorder writes it down now, before looking at either child.`, vars(node), "pre");
    walk(node.left);
    ino.push(node.val);
    t.step(5, "update", `inorder: visit ${node.val}`, `The whole left subtree of ${node.val} is finished (or it had none). Inorder writes the node now, between its left and right sides.`, vars(node), "ino");
    walk(node.right);
    post.push(node.val);
    t.step(7, "update", `postorder: visit ${node.val}`, `Both subtrees of ${node.val} are finished. Postorder writes the node last, then the call ends and we climb back to the parent.`, vars(node), "post");
    path.pop();
  }
  walk(root);
  t.step(9, "done", "three orders, one walk", "Every node was reached three times: on the way down (preorder), after the left side (inorder) and on the way up (postorder). Null children returned immediately and wrote nothing.", { pre: [...pre], ino: [...ino], post: [...post] });
  return t.steps;
}

const iterPreCode = `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function preorderIterative(root) {
  if (root === null) return [];
  const out = [];
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    out.push(node.val);
    if (node.right) stack.push(node.right);   // pushed first, so it comes out second
    if (node.left) stack.push(node.left);     // pushed last, so it comes out next
  }
  return out;
}

const root = new TreeNode(1, new TreeNode(2, new TreeNode(4), new TreeNode(5)), new TreeNode(3));
console.log(preorderIterative(root)); // [1, 2, 4, 5, 3]`;

const iterInCode = `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function inorderIterative(root) {
  const out = [];
  const stack = [];
  let cur = root;
  while (cur !== null || stack.length > 0) {
    while (cur !== null) {        // dive as far left as possible, remembering the way back
      stack.push(cur);
      cur = cur.left;
    }
    cur = stack.pop();            // the leftmost unvisited node
    out.push(cur.val);
    cur = cur.right;              // then do the same for its right subtree
  }
  return out;
}

const root = new TreeNode(1, new TreeNode(2, new TreeNode(4), new TreeNode(5)), new TreeNode(3));
console.log(inorderIterative(root)); // [4, 2, 5, 1, 3]`;

const iterPostCode = `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// Postorder (left, right, node) is the reverse of "node, right, left".
function postorderIterative(root) {
  if (root === null) return [];
  const out = [];
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    out.push(node.val);                       // node, then right, then left ...
    if (node.left) stack.push(node.left);
    if (node.right) stack.push(node.right);
  }
  return out.reverse();                       // ... reversed is left, right, node
}

const root = new TreeNode(1, new TreeNode(2, new TreeNode(4), new TreeNode(5)), new TreeNode(3));
console.log(postorderIterative(root)); // [4, 5, 2, 3, 1]`;

const smallCode = `class TreeNode {
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

// Number of nodes on the longest path from the root down to a leaf.
function maxDepth(node) {
  if (node === null) return 0;
  return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
}

// Two trees are the same if their shapes match and every pair of values matches.
function isSameTree(a, b) {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.val === b.val && isSameTree(a.left, b.left) && isSameTree(a.right, b.right);
}

// Swap the two children of every node.
function invertTree(node) {
  if (node === null) return null;
  const left = invertTree(node.left);
  const right = invertTree(node.right);
  node.left = right;
  node.right = left;
  return node;
}

function preorder(node, out = []) {
  if (node === null) return out;
  out.push(node.val);
  preorder(node.left, out);
  preorder(node.right, out);
  return out;
}

console.log(maxDepth(buildTree([3, 9, 20, null, null, 15, 7])));                       // 3
console.log(isSameTree(buildTree([1, 2, 3]), buildTree([1, 2, 3])));                  // true
console.log(isSameTree(buildTree([1, 2]), buildTree([1, null, 2])));                  // false
console.log(preorder(invertTree(buildTree([4, 2, 7, 1, 3, 6, 9]))));                  // [4, 7, 9, 6, 2, 3, 1]`;

const vocabRows: string[][] = [
  ["root", "1", "the single node at the top; the only node with no parent"],
  ["parent / child", "2 is the parent of 4 and 5", "a parent sits directly above its children; each node has at most one parent"],
  ["leaf", "4, 5 and 3", "a node with no children"],
  ["edge", "1-2, 1-3, 2-4, 2-5", "a link between a parent and a child"],
  ["subtree", "2, 4, 5", "any node together with everything below it; the subtree of 2 is a tree of its own"],
  ["depth of a node", "depth(4) = 2", "how many edges from the root down to that node (the root has depth 0)"],
  ["height of a tree", "2", "the number of edges on the longest path from the root to a leaf"],
];

const dryIterRows: string[][] = [
  ["start", "[1]", "[]"],
  ["pop 1, visit, push 3 then 2", "[3, 2]", "[1]"],
  ["pop 2, visit, push 5 then 4", "[3, 5, 4]", "[1, 2]"],
  ["pop 4, visit (leaf)", "[3, 5]", "[1, 2, 4]"],
  ["pop 5, visit (leaf)", "[3]", "[1, 2, 4, 5]"],
  ["pop 3, visit (leaf)", "[]", "[1, 2, 4, 5, 3]"],
];

export default function DsaLessonFortyOnePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="why">Why trees?</h2>
      <p>
        So far every structure was a line: an array, a string, a linked list, a stack. A line is the wrong shape for things that
        <em> branch</em>: a folder with sub-folders, a family tree, the nested tags of a web page, the choices in a game. A{" "}
        <strong>tree</strong> is a structure of nodes where each node can lead to several others below it, and there are no
        loops. In this lesson we meet the most common kind, the <strong>binary tree</strong>: every node has <em>at most two</em>{" "}
        children, called the <strong>left</strong> child and the <strong>right</strong> child.
      </p>
      <p>
        The big new idea: a tree is <em>recursive</em>. Look at any node and everything below it, and you see a smaller tree. So a
        question about a whole tree can usually be answered by answering the same question for the left and right
        parts, then combining. Almost every tree problem in this part of the series is that one trick in different clothes.
      </p>

      <h2 id="words">Tree vocabulary</h2>
      <p>We will use this example tree for the whole lesson. Read the table with the picture in mind.</p>
      <pre>
{`      1
     / \\
    2   3
   / \\
  4   5`}
      </pre>
      <DryRun
        title="the words, on the tree above"
        cols={["Word", "In this tree", "Meaning"]}
        rows={vocabRows}
        note="Careful: some books count height and depth in nodes instead of edges. LeetCode's 'maximum depth' counts nodes (so this tree has maximum depth 3). Always check which one a problem means."
      />

      <h2 id="node">A node in JavaScript</h2>
      <p>
        A node is a tiny object with a value and two links. A link is either another node or <code>null</code>, which means
        &quot;nothing here&quot;. A whole tree is just the <strong>root node</strong>: from it you can reach everything else by
        following links, exactly like a linked list is just its head.
      </p>
      <CodeBlock lang="js" code={nodeCode} />
      <Callout kind="note" label="null is a tree too">
        An empty tree is represented by <code>null</code>. Almost every recursive tree function starts with{" "}
        <code>if (node === null) return ...</code>. That line is the <strong>base case</strong>: the smallest problem, which needs
        no further recursion.
      </Callout>

      <h2 id="build">Building a tree from an array</h2>
      <p>
        Wiring up nodes by hand gets tedious, and LeetCode shows trees as arrays like <code>[3, 9, 20, null, null, 15, 7]</code>.
        This is the <strong>level-order</strong> form: read the tree row by row from the top, left to right, writing{" "}
        <code>null</code> for a missing child. Here <code>3</code> is the root, its children are <code>9</code> and <code>20</code>;
        <code>9</code> has no children (two nulls), and <code>20</code> has children <code>15</code> and <code>7</code>.
      </p>
      <p>
        To build the tree, keep a queue (a first-in, first-out line, see lesson 39) of nodes that still need children. Take the next
        waiting node and give it the next two array values as its left and right child. We use a <code>head</code> index instead
        of <code>shift()</code> because shifting from the front of a JavaScript array is slow. We will reuse this helper in
        most of the samples to come.
      </p>
      <CodeBlock lang="js" code={buildCode} />

      <h2 id="recursive">Three ways to walk a tree</h2>
      <p>
        To <strong>traverse</strong> a tree means to visit every node exactly once. In a line there is one sensible order. A tree
        offers a choice, and the three classic <strong>depth-first</strong> orders differ only in <em>when</em> you write the
        current node down relative to its two subtrees:
      </p>
      <ul>
        <li><strong>Preorder</strong>: node, then left subtree, then right subtree. (&quot;pre&quot; = before the children.)</li>
        <li><strong>Inorder</strong>: left subtree, then node, then right subtree. (&quot;in&quot; = between the children.)</li>
        <li><strong>Postorder</strong>: left subtree, then right subtree, then node. (&quot;post&quot; = after the children.)</li>
      </ul>
      <p>
        <strong>Depth-first</strong> means we go all the way down one branch before coming back to try another. Each order is the same
        three lines in a different arrangement:
      </p>
      <CodeBlock lang="js" code={recursiveCode} />
      <p>
        Recursion handles the bookkeeping for free: the language keeps a <strong>call stack</strong> that remembers where to
        come back to. Time is <strong>O(n)</strong>, since each node is visited once. Space is{" "}
        <strong>O(h)</strong> for the call stack, where <em>h</em> is the tree&apos;s height: about log n for a well-balanced tree,
        but up to n for a tree that is one long chain.
      </p>

      <h2 id="trace">Traced: one walk, three orders</h2>
      <p>
        A single walk can produce all three orders at once, because every node is passed three times: on the way down, after
        coming back from the left, and after coming back from the right. Watch the three result lists grow in different
        rhythms.
      </p>
      <CodeTrace
        code={traceSrc}
        steps={walkTrace()}
        caption="The same journey around the tree, recorded at three moments. Preorder gives 1 2 4 5 3, inorder gives 4 2 5 1 3, postorder gives 4 5 2 3 1."
      />

      <h2 id="iterative">Walking with an explicit stack</h2>
      <p>
        Recursion can fail on a very deep tree (a chain of 100,000 nodes overflows the call stack), and interviewers love to ask
        &quot;now do it without recursion&quot;. The answer is to do what the language was doing for you: keep your own{" "}
        <strong>stack</strong>.
      </p>
      <p>
        <strong>Preorder</strong> is the easiest: pop a node, visit it, push its children. Because a stack gives back the last
        item first, push the <em>right</em> child before the left so the left comes out first.
      </p>
      <CodeBlock lang="js" code={iterPreCode} />
      <DryRun
        title="iterative preorder"
        cols={["Step", "Stack (top on the right)", "Output so far"]}
        rows={dryIterRows}
      />
      <p>
        <strong>Inorder</strong> needs one more idea: before you can visit a node you must finish its entire left side. So dive
        left as far as you can, pushing each node you pass; the stack remembers the way back. Pop the leftmost node, visit it,
        then repeat for its right subtree.
      </p>
      <CodeBlock lang="js" code={iterInCode} />
      <p>
        <strong>Postorder</strong> is the awkward one, because a node is visited only after both children. A neat trick: postorder
        (left, right, node) is exactly the <em>reverse</em> of (node, right, left), and that is just preorder with the children
        pushed in the opposite order. So run that, then reverse the result.
      </p>
      <CodeBlock lang="js" code={iterPostCode} />
      <p>
        All three are O(n) time and O(h) extra space for the stack, the same as the recursive versions, but now the depth limit
        is memory, not the call stack.
      </p>

      <h2 id="small">Depth, same tree, invert</h2>
      <p>
        Here is the recursive mindset on three classic questions. Each follows one recipe: handle <code>null</code>, ask the
        question of the left and right subtrees, combine the answers.
      </p>
      <ul>
        <li>
          <strong>Maximum depth</strong>: an empty tree has depth 0; otherwise it is 1 (for this node) plus the larger of the two
          subtree depths.
        </li>
        <li>
          <strong>Same tree</strong>: two empty trees match; one empty and one not does not; otherwise the values must match and
          so must both pairs of subtrees.
        </li>
        <li>
          <strong>Invert</strong>: swap the left and right child of every node. Invert the children first, then swap them.
        </li>
      </ul>
      <CodeBlock lang="js" code={smallCode} />
      <Callout kind="warn" label="Check null before you touch .val">
        The most common tree bug is reading <code>node.left.val</code> when <code>node.left</code> is <code>null</code>. That
        throws &quot;Cannot read properties of null&quot;. Put the <code>null</code> check at the top of the function so the rest of
        the body can assume a real node.
      </Callout>

      <h2 id="practice">Practice questions</h2>
      <p>For each one, decide first: which moment do I need (before, between or after the children), and what does the base case return?</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Define root, leaf, subtree, depth and height, and say what a binary tree is.</>,
          <>Say where the line that records the node sits in preorder, inorder and postorder.</>,
          <>Explain why the space of a recursive traversal is O(h) and when h is as bad as n.</>,
          <>Write iterative preorder and inorder with a stack, without looking.</>,
          <>Explain why the recursive solution always starts with the null check.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Depth-first goes deep before it goes wide. <strong>Lesson 42</strong> does the opposite: <strong>level order</strong>, also called
        breadth-first search, visits the tree row by row with a queue, which gives us right side views, zigzag orders and the
        shortest path to a leaf.
      </p>
    </DsaLessonPage>
  );
}
