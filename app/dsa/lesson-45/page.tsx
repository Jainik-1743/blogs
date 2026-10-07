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

const lesson = getDsaLesson("lesson-45");

export const metadata: Metadata = {
  title: `Lesson 45 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "ancestor", label: "Ancestors and the lowest common ancestor" },
  { id: "lca", label: "LCA in a binary tree" },
  { id: "trace", label: "Traced: finding the LCA of 6 and 4" },
  { id: "bst", label: "LCA in a BST: let the order decide" },
  { id: "build", label: "Rebuilding a tree from its traversals" },
  { id: "serialise", label: "Save a tree as text and build it back" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const lcaCode = `class TreeNode {
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
function find(root, val) {               // helper for the demo: the node holding val
  if (root === null) return null;
  if (root.val === val) return root;
  return find(root.left, val) || find(root.right, val);
}

function lowestCommonAncestor(root, p, q) {
  if (root === null) return null;        // fell off the tree: nothing here
  if (root === p || root === q) return root;   // found one of the two targets
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root;        // one target on each side: this is the meeting point
  return left || right;                  // both on one side (or neither): pass that answer up
}

const root = buildTree([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
console.log(lowestCommonAncestor(root, find(root, 5), find(root, 1)).val); // 3
console.log(lowestCommonAncestor(root, find(root, 6), find(root, 4)).val); // 5
console.log(lowestCommonAncestor(root, find(root, 5), find(root, 4)).val); // 5  (a node may be its own ancestor)`;

const traceSrc = `function lca(node, p, q) {
  if (node === null) return null;
  if (node === p || node === q) return node;
  const left = lca(node.left, p, q);
  const right = lca(node.right, p, q);
  if (left && right) return node;
  return left || right;
}`;

type TNode = { val: number; left: TNode | null; right: TNode | null };

function buildT(arr: (number | null)[]): TNode | null {
  if (!arr.length || arr[0] === null) return null;
  const root: TNode = { val: arr[0], left: null, right: null };
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift()!;
    if (i < arr.length && arr[i] !== null) { node.left = { val: arr[i]!, left: null, right: null }; queue.push(node.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { node.right = { val: arr[i]!, left: null, right: null }; queue.push(node.right); }
    i++;
  }
  return root;
}

function findT(root: TNode | null, val: number): TNode | null {
  if (!root) return null;
  if (root.val === val) return root;
  return findT(root.left, val) || findT(root.right, val);
}

function lcaTrace() {
  const t = tracer();
  const root = buildT([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4])!;
  const p = findT(root, 6)!;
  const q = findT(root, 4)!;
  const stack: number[] = [];
  const v = (n: TNode | null) => (n ? n.val : null);
  t.step(1, "start", "find the LCA of p = 6 and q = 4", "The tree is [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]. To keep the trace short, we do not show the calls on missing (null) children. They just return null.", { p: 6, q: 4, calls: [] });

  function lca(node: TNode): TNode | null {
    stack.push(node.val);
    if (node === p || node === q) {
      t.step(3, "update", `node ${node.val} is a target: return it`, `${node.val} is p or q, so this call returns it at once. It does not look below. If the other target is below, ${node.val} is already the answer. If not, a higher node will find it.`, { node: node.val, calls: [...stack] }, "node");
      stack.pop();
      return node;
    }
    t.step(3, "check", `visit node ${node.val}`, `${node.val} is neither 6 nor 4, so we ask both the left side and the right side.`, { node: node.val, calls: [...stack] }, "calls");
    const left = node.left ? lca(node.left) : null;
    t.step(5, "run", `node ${node.val}: left answered ${v(left)}`, left ? `The left side reported ${left.val}. Now we ask the right side.` : "The left side has neither target. Now we ask the right side.", { node: node.val, left: v(left), calls: [...stack] }, "left");
    const right = node.right ? lca(node.right) : null;
    let result: TNode | null;
    if (left && right) {
      result = node;
      t.step(6, "update", `node ${node.val}: both sides answered, return ${node.val}`, `The left side gave ${left.val} and the right side gave ${right.val}. One target is on each side, so ${node.val} is the place where the two paths split.`, { node: node.val, left: v(left), right: v(right), calls: [...stack] }, "right");
    } else {
      result = left || right;
      t.step(7, "update", `node ${node.val}: pass up ${v(result)}`, result ? `Only one side found something (${result.val}), so we pass it up as it is.` : "Neither side found a target, so we pass up null.", { node: node.val, left: v(left), right: v(right), calls: [...stack] }, "right");
    }
    stack.pop();
    return result;
  }

  const ans = lca(root);
  t.print(`LCA = ${ans!.val}`);
  t.step(7, "done", `answer: ${ans!.val}`, "Node 5 was the first place that heard about 6 and 4 from different sides. Every node above it just passed that answer up.", { answer: ans!.val, calls: [] });
  return t.steps;
}

const bstCode = `class TreeNode {
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

function lcaBST(root, p, q) {
  let cur = root;
  while (cur !== null) {
    if (p.val < cur.val && q.val < cur.val) cur = cur.left;        // both smaller: the LCA is on the left
    else if (p.val > cur.val && q.val > cur.val) cur = cur.right;  // both bigger: the LCA is on the right
    else return cur;                                               // they split here (or one equals cur)
  }
  return null;
}

const root = buildTree([6, 2, 8, 0, 4, 7, 9, null, null, 3, 5]);
const node = (v) => { let c = root; while (c.val !== v) c = v < c.val ? c.left : c.right; return c; };
console.log(lcaBST(root, node(2), node(8)).val); // 6
console.log(lcaBST(root, node(2), node(4)).val); // 2
console.log(lcaBST(root, node(3), node(5)).val); // 4`;

const preInCode = `class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function toLevelArray(root) {            // level-order values with null gaps, trailing nulls trimmed
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
  const indexOf = new Map();                       // value -> its position in the inorder list
  inorder.forEach((v, i) => indexOf.set(v, i));
  let next = 0;                                    // which preorder value is the next root

  function build(lo, hi) {                         // build the subtree for inorder[lo..hi]
    if (lo > hi) return null;                      // empty range: no node
    const val = preorder[next++];                  // preorder always starts with the root
    const mid = indexOf.get(val);                  // everything left of mid is the left subtree
    const node = new TreeNode(val);
    node.left = build(lo, mid - 1);                // left first, because preorder is root, left, right
    node.right = build(mid + 1, hi);
    return node;
  }
  return build(0, inorder.length - 1);
}

console.log(toLevelArray(buildTree([3, 9, 20, 15, 7], [9, 3, 15, 20, 7]))); // [3, 9, 20, null, null, 15, 7]
console.log(toLevelArray(buildTree([1, 2, 3], [3, 2, 1])));                // [1, 2, null, 3]`;

const serPreCode = `class TreeNode {
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
    if (node === null) { out.push("#"); return; }   // a marker for a missing child
    out.push(node.val);
    go(node.left);
    go(node.right);
  })(root);
  return out.join(",");
}

function deserialize(text) {
  const tokens = text.split(",");
  let i = 0;
  function go() {
    const token = tokens[i++];
    if (token === "#") return null;
    const node = new TreeNode(Number(token));
    node.left = go();                               // the tokens come back in the same order they left
    node.right = go();
    return node;
  }
  return go();
}

const root = buildTree([1, 2, 3, null, null, 4, 5]);
const text = serialize(root);
console.log(text);                                  // 1,2,#,#,3,4,#,#,5,#,#
console.log(serialize(deserialize(text)) === text); // true
console.log(serialize(null));                       // #`;

const serLevelCode = `class TreeNode {
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

function serializeLevel(root) {
  if (root === null) return "";
  const out = [], queue = [root];
  for (let i = 0; i < queue.length; i++) {          // walking an index instead of shift() keeps this O(n)
    const node = queue[i];
    if (node === null) { out.push("#"); continue; }
    out.push(node.val);
    queue.push(node.left, node.right);              // null children are queued too, so they get a marker
  }
  return out.join(",");
}

function deserializeLevel(text) {
  if (text === "") return null;
  const tokens = text.split(",");
  const root = new TreeNode(Number(tokens[0]));
  const queue = [root];
  let t = 1;                                        // next token to read
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    if (tokens[t] !== undefined && tokens[t] !== "#") { node.left = new TreeNode(Number(tokens[t])); queue.push(node.left); }
    t++;
    if (tokens[t] !== undefined && tokens[t] !== "#") { node.right = new TreeNode(Number(tokens[t])); queue.push(node.right); }
    t++;
  }
  return root;
}

const text = serializeLevel(buildTree([1, 2, 3, null, null, 4, 5]));
console.log(text);                                           // 1,2,3,#,#,4,5,#,#,#,#
console.log(serializeLevel(deserializeLevel(text)) === text); // true`;

export default function DsaLessonFortyFivePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="ancestor">Ancestors and the lowest common ancestor</h2>
      <p>
        An <strong>ancestor</strong> of a node is any node on the path from the root down to it. LeetCode also counts the node
        itself. The <strong>lowest common ancestor</strong>, short name <strong>LCA</strong>, of two nodes <code>p</code> and{" "}
        <code>q</code> is the lowest node that has both of them somewhere below it (in its subtree, meaning itself and
        everything under it). Think of a family tree. The LCA of two cousins is the grandparent they share, not the
        great-grandparent above.
      </p>
      <p>
        This lesson has two parts. First, we find the LCA in two ways: once for any binary tree, and once for a BST, where the
        order of the values makes it very easy. Second, we go the other way and <em>build</em> a tree from a list. The list
        can be two tree walks, or a saved string.
      </p>

      <h2 id="lca">LCA in a binary tree</h2>
      <p>
        If the values have no order, you cannot know where <code>p</code> and <code>q</code> are. So search the whole tree with
        a recursive function (a function that calls itself) that answers one question: &quot;what do you find in this part of
        the tree?&quot; Each call returns:
      </p>
      <ul>
        <li><code>null</code> if neither target is in this part of the tree,</li>
        <li>the target node, if it found exactly one (or if the node itself is a target),</li>
        <li>the LCA, if it found both.</li>
      </ul>
      <p>
        At a node, ask the left side and the right side. If <strong>both</strong> answers are not null, one target is on each
        side. So this node is where their paths split, and it is the LCA. If only one side answered, pass that answer up as it
        is. If the node itself is <code>p</code> or <code>q</code>, return it at once. The other target is either below it (then
        this node is the LCA) or somewhere else (then a higher node that finds both will notice).
      </p>
      <CodeBlock lang="js" code={lcaCode} />
      <p>
        Each node is visited once, so the time is <strong>O(n)</strong>. The recursion goes as deep as the tree is tall, so the
        space is <strong>O(h)</strong>. That is O(log n) for a balanced tree and O(n) for one long chain. The code assumes that
        both nodes are really in the tree, as the problem promises. Notice that we compare <em>nodes</em> (<code>root === p</code>),
        not values. This is safe only when we hold the real node objects.
      </p>

      <h2 id="trace">Traced: finding the LCA of 6 and 4</h2>
      <p>
        Watch the <code>calls</code> list. It is the recursion stack: the chain of nodes that are waiting for their children to
        answer.
      </p>
      <CodeTrace
        code={traceSrc}
        steps={lcaTrace()}
        caption="6 is on the left side of node 5 and 4 is on its right side. So node 5 is the first place to hear two different answers. Node 3 then hears from its left side, and its right side has nothing, so it just passes 5 up."
      />

      <h2 id="bst">LCA in a BST: let the order decide</h2>
      <p>
        In a binary search tree (lesson 44), everything on the left side of a node is smaller than the node, and everything on
        the right side is bigger. So at any node you can tell where both targets are, without searching:
      </p>
      <ul>
        <li>Both values are smaller than the node: the LCA is on the left side, so step left.</li>
        <li>Both values are bigger: step right.</li>
        <li>Otherwise the values split (one is smaller and one is bigger), or one of them equals the node. This node is the LCA.</li>
      </ul>
      <p>
        This is a plain loop. It needs no recursion and no stack. It is one walk from the root down a single path.
      </p>
      <CodeBlock lang="js" code={bstCode} />
      <p>
        Time is <strong>O(h)</strong> and space is <strong>O(1)</strong>. This is better than the general solution in both time
        and space. It is also why interviewers ask for both versions. They want to see: &quot;Did you notice that the tree is a
        BST, and did you use that?&quot;
      </p>
      <Callout kind="note" label="Use the information you are given">
        If a problem says &quot;binary search tree&quot;, the order of the values is a gift. Whenever a tree problem mentions a
        BST, ask what the order lets you skip.
      </Callout>

      <h2 id="build">Rebuilding a tree from its traversals</h2>
      <p>
        Lesson 41 gave you the three depth-first orders. Can lists of values bring a tree back? <strong>One list alone is not
        enough</strong>. Preorder <code>[1, 2]</code> fits a tree where 2 is the left child of 1, and also a tree where 2 is the
        right child. But <strong>preorder plus inorder</strong> (when all values are different) gives exactly one tree:
      </p>
      <ul>
        <li>Preorder is root, left, right. So its <em>first</em> value is the root.</li>
        <li>Find that value in the inorder list. Inorder is left, root, right. So everything to its left is the left side, and
          everything to its right is the right side. This also tells you how many nodes the left side has.</li>
        <li>Do the same for the two parts. Preorder visits the left side before the right side. So the next unused preorder value
          is the root of the left side. After the left side is finished, the next one is the root of the right side.</li>
      </ul>
      <p>
        The slow way copies parts of the arrays with <code>slice</code> and searches with <code>indexOf</code> on every call. In
        the worst case that costs O(n²). The fast way builds a <code>Map</code> (a lookup table) once, from each value to its
        position in the inorder list. It keeps one moving position in the preorder list. It describes each part of the tree by a
        range <code>[lo, hi]</code> in the inorder list, instead of copying.
      </p>
      <CodeBlock lang="js" code={preInCode} />
      <DryRun
        title="preorder [3, 9, 20, 15, 7], inorder [9, 3, 15, 20, 7]"
        cols={["Call (inorder range)", "Next preorder value", "Position in inorder", "Result"]}
        rows={[
          ["build(0, 4)", "3", "1", "root 3; the left side uses [0..0], the right side uses [2..4]"],
          ["build(0, 0)", "9", "0", "leaf 9 (both children get empty ranges)"],
          ["build(2, 4)", "20", "3", "node 20; the left side uses [2..2], the right side uses [4..4]"],
          ["build(2, 2)", "15", "2", "leaf 15"],
          ["build(4, 4)", "7", "4", "leaf 7"],
        ]}
        note="The preorder position moves through 3, 9, 20, 15, 7 in exactly the order of the calls. That is why one counter is enough."
      />
      <p>
        Inorder plus postorder works the same way, with two changes. The root is the <em>last</em> postorder value. And
        postorder is left, right, root, so you read it from the end and build the <strong>right</strong> side first. Preorder
        plus postorder, without inorder, cannot always decide. A node with only one child could have it on either side.
      </p>
      <Callout kind="warn" label="Distinct values only">
        The Map trick needs every value to appear only once. With repeated values, the question &quot;where is this value in the
        inorder list?&quot; has more than one answer. Then the rebuilt tree is not unique. Interview questions promise that all
        values are different.
      </Callout>

      <h2 id="serialise">Save a tree as text and build it back</h2>
      <p>
        To <strong>serialise</strong> a tree means to turn it into a string of text that you can save or send. To{" "}
        <strong>deserialise</strong> means to build the tree back from that text. We saw above that one list is not enough. But
        if you also write down <em>where the children are missing</em>, one walk is enough. Write a marker (here{" "}
        <code>#</code>) for every missing child. You can read a preorder with markers back with the same recursion that wrote it.
        Read one piece of text (a token). If it is <code>#</code>, return null. Otherwise make a node. Let the next tokens fill
        its left side, and then its right side.
      </p>
      <CodeBlock lang="js" code={serPreCode} />
      <p>
        The text for the tree above is <code>1,2,#,#,3,4,#,#,5,#,#</code>. A tree with n nodes has n + 1 missing children. So
        the string has 2n + 1 tokens, and both directions take <strong>O(n)</strong>.
      </p>
      <p>
        The other popular format is <strong>level order</strong> (row by row), the same one LeetCode prints. It uses a queue (a
        first-in, first-out line). When saving, we push both children, including nulls, so every gap gets a marker. When
        reading back, we keep a queue of parents that wait for children, and we give each parent two tokens.
      </p>
      <CodeBlock lang="js" code={serLevelCode} />
      <p>
        This version writes some extra markers at the end (the four <code>#</code>). They do no harm. In an interview, choose
        the preorder version unless you are asked for another. It is shorter and needs no queue.
      </p>
      <Callout kind="warn" label="Remember the separator and the empty tree">
        Use a separator (here a comma), so that <code>12</code> and <code>1,2</code> cannot be mixed up. Also test the empty tree
        and negative numbers. Never assume that a value is a single digit.
      </Callout>

      <h2 id="practice">Practice questions</h2>
      <p>
        For each question, first ask what a recursive call should return (a node, a count, or a true/false flag). Then ask what
        it needs to be told (a range, or the largest value so far).
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Explain what each recursive call returns in the binary-tree LCA, and the one condition that makes a node the answer.</>,
          <>Say how the BST LCA uses the order of the values, and why it needs only O(1) extra space.</>,
          <>Explain how preorder plus inorder gives exactly one tree, and why a Map from value to inorder position gives O(n).</>,
          <>Explain why preorder alone cannot rebuild a tree, but preorder with null markers can.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        That finishes the tree part of the series. <strong>Lesson 46</strong> starts Part 12 with the <strong>heap</strong>. A
        heap is a tree stored inside a plain array, and it always keeps its smallest (or largest) item on top. It is the tool
        for &quot;the k largest&quot; questions, and for taking the best item again and again from what is left.
      </p>
    </DsaLessonPage>
  );
}
