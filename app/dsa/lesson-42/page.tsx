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

const lesson = getDsaLesson("lesson-42");

export const metadata: Metadata = {
  title: `Lesson 42 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "idea", label: "Level by level" },
  { id: "flat", label: "The queue loop" },
  { id: "levels", label: "One level at a time" },
  { id: "trace", label: "Traced: level order" },
  { id: "snapshot", label: "Why the size snapshot works" },
  { id: "views", label: "Right side view and zigzag" },
  { id: "depth", label: "Minimum depth and level averages" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const flatCode = `class TreeNode {
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

// Visit nodes in breadth-first order: the root, then its children, then their children, and so on.
function bfs(root) {
  if (root === null) return [];
  const order = [];
  const queue = [root];          // nodes found but not yet visited
  let head = 0;                  // the front of the queue (so we avoid the slow shift)
  while (head < queue.length) {
    const node = queue[head++];  // take from the front
    order.push(node.val);
    if (node.left) queue.push(node.left);     // add to the back
    if (node.right) queue.push(node.right);
  }
  return order;
}

console.log(bfs(buildTree([1, 2, 3, 4, 5, null, 6]))); // [1, 2, 3, 4, 5, 6]`;

const levelsCode = `class TreeNode {
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

function levelOrder(root) {
  if (root === null) return [];
  const levels = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const size = queue.length - head;     // how many nodes are in the current level right now
    const level = [];
    for (let k = 0; k < size; k++) {
      const node = queue[head++];
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    levels.push(level);
  }
  return levels;
}

console.log(levelOrder(buildTree([3, 9, 20, null, null, 15, 7]))); // [[3], [9, 20], [15, 7]]
console.log(levelOrder(buildTree([1, 2, 3, 4, 5, null, 6])));      // [[1], [2, 3], [4, 5, 6]]
console.log(levelOrder(buildTree([])));                            // []`;

const traceSrc = `const levels = [];
const queue = [root];
let head = 0;
while (head < queue.length) {
  const size = queue.length - head;
  const level = [];
  for (let k = 0; k < size; k++) {
    const node = queue[head++];
    level.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  levels.push(level);
}`;

type TNode = { val: number; left: TNode | null; right: TNode | null };

function levelTrace() {
  const t = tracer();
  const n = (val: number, left: TNode | null = null, right: TNode | null = null): TNode => ({ val, left, right });
  const root = n(1, n(2, n(4), n(5)), n(3, null, n(6)));
  const levels: number[][] = [];
  const queue: TNode[] = [root];
  let head = 0;
  const waiting = () => queue.slice(head).map((x) => x.val);
  t.step(2, "start", "queue = [root]", "The queue holds nodes we have found but not yet visited. A queue is a line where the first one in is the first one out. We begin with just the root, node 1. head points at the front of the line.", { levels: [], queue: waiting(), head }, "queue");
  while (head < queue.length) {
    const size = queue.length - head;
    t.step(5, "check", `a new level starts: size = ${size}`, `Right now the queue holds exactly the ${size} node${size === 1 ? "" : "s"} of this level. We save that number and do not change it. Children that we add during this round wait for the next round.`, { levels: levels.map((l) => [...l]), queue: waiting(), head, size }, "size");
    const level: number[] = [];
    for (let k = 0; k < size; k++) {
      const node = queue[head++];
      level.push(node.val);
      t.step(9, "update", `visit node ${node.val}`, `We take ${node.val} from the front of the queue and add it to this level (${k + 1} of ${size}).`, { levels: levels.map((l) => [...l]), level: [...level], size, k, head, queue: waiting() }, "level");
      if (node.left) {
        queue.push(node.left);
        t.step(10, "update", `enqueue ${node.left.val}`, `${node.val} has a left child, ${node.left.val}. It goes to the back of the queue, behind the rest of this level.`, { level: [...level], size, k, head, queue: waiting() }, "queue");
      }
      if (node.right) {
        queue.push(node.right);
        t.step(11, "update", `enqueue ${node.right.val}`, `${node.val} has a right child, ${node.right.val}. It also goes to the back of the queue.`, { level: [...level], size, k, head, queue: waiting() }, "queue");
      }
    }
    levels.push(level);
    t.step(13, "update", `level done: [${level.join(", ")}]`, `The ${size} nodes of this level are done. Whatever is left in the queue is the next level, in left-to-right order.`, { levels: levels.map((l) => [...l]), head, queue: waiting() }, "levels");
  }
  t.step(14, "done", "queue is empty", "No more nodes are waiting, so we have written down every level, from the top down.", { levels: levels.map((l) => [...l]), head, queue: waiting() });
  return t.steps;
}

const viewsCode = `class TreeNode {
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

// Right side view: the last node of every level is the one you see from the right.
function rightSideView(root) {
  if (root === null) return [];
  const view = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const size = queue.length - head;
    for (let k = 0; k < size; k++) {
      const node = queue[head++];
      if (k === size - 1) view.push(node.val);   // the rightmost node of this level
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  return view;
}

// Zigzag: level 0 left to right, level 1 right to left, level 2 left to right, ...
function zigzagLevelOrder(root) {
  if (root === null) return [];
  const levels = [];
  const queue = [root];
  let head = 0;
  let leftToRight = true;
  while (head < queue.length) {
    const size = queue.length - head;
    const level = new Array(size);
    for (let k = 0; k < size; k++) {
      const node = queue[head++];
      level[leftToRight ? k : size - 1 - k] = node.val;   // write to the mirror position on odd levels
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    levels.push(level);
    leftToRight = !leftToRight;
  }
  return levels;
}

const tree = buildTree([1, 2, 3, 4, null, null, 5]);
console.log(rightSideView(tree));       // [1, 3, 5]
console.log(zigzagLevelOrder(buildTree([3, 9, 20, null, null, 15, 7]))); // [[3], [20, 9], [15, 7]]`;

const depthCode = `class TreeNode {
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

// Minimum depth: the number of nodes on the shortest path from the root to a LEAF.
// BFS reaches the closest leaf (nearest the top) first, so it can stop as soon as it sees one.
function minDepth(root) {
  if (root === null) return 0;
  const queue = [root];
  let head = 0;
  let depth = 1;
  while (head < queue.length) {
    const size = queue.length - head;
    for (let k = 0; k < size; k++) {
      const node = queue[head++];
      if (node.left === null && node.right === null) return depth;   // first leaf found = closest to the top
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    depth++;
  }
  return depth;
}

// Average of each level.
function averageOfLevels(root) {
  if (root === null) return [];
  const averages = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const size = queue.length - head;
    let sum = 0;
    for (let k = 0; k < size; k++) {
      const node = queue[head++];
      sum += node.val;
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    averages.push(sum / size);
  }
  return averages;
}

console.log(minDepth(buildTree([3, 9, 20, null, null, 15, 7])));        // 2
console.log(minDepth(buildTree([2, null, 3, null, 4, null, 5, null, 6]))); // 5
console.log(averageOfLevels(buildTree([3, 9, 20, 15, 7])));              // [3, 14.5, 11]`;

const dryRows: string[][] = [
  ["start", "[1]", "-", "-"],
  ["level 1 begins", "[1]", "1", "head moves from 0 to 1; adds 2 and 3"],
  ["level 2 begins", "[2, 3]", "2", "visit 2 (adds 4 and 5), visit 3 (adds 6)"],
  ["level 3 begins", "[4, 5, 6]", "3", "no children to add"],
  ["queue empty", "[]", "-", "done"],
];

export default function DsaLessonFortyTwoPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="idea">Level by level</h2>
      <p>
        Lesson 41 walked trees <em>depth-first</em>: go down one branch, come back, then go down the next. This lesson walks
        them <strong>breadth-first</strong>, also called <strong>level order</strong>. You visit the root, then all of its
        children, then all of <em>their</em> children, and so on. You go one whole row at a time, like reading a page line by
        line.
      </p>
      <pre>
{`      1          level 0:  1
     / \\
    2   3        level 1:  2  3
   / \\   \\
  4   5   6      level 2:  4  5  6`}
      </pre>
      <p>
        <strong>Breadth-first search (BFS)</strong> is a way of walking a tree or graph that visits all nodes at distance 1 from the start, then all nodes at distance 2, and so on. It is the right tool when the question is about <em>rows</em> or <em>how close a node is to the
        root</em>. For example: print the tree row by row, what do I see from the right side, or what is the shortest path to
        a leaf. The tool that gives this order is a <strong>queue</strong>, a first-in, first-out line, like a line at a shop.
        Nodes join at the back and leave from the front. So the children of a node always wait behind everyone who was found
        earlier. That keeps the rows in order.
      </p>

      <h2 id="flat">The queue loop</h2>
      <p>
        Start with the root in the queue. Then repeat these steps: take a node from the front, visit it, and add its children to
        the back. Lesson 39 explained why we do not use <code>queue.shift()</code> to take from the front. Removing the first
        item of a JavaScript array can take time in proportion to the length of the array. A big tree would turn O(n) into
        O(n²). Instead we keep a number <code>head</code> that marks the front, and we just move it forward. The array only
        grows. Nothing is removed.
      </p>
      <CodeBlock lang="js" code={flatCode} />
      <p>
        Every node enters the queue once and leaves once, so the time is <strong>O(n)</strong>. The extra space is the queue
        itself. It holds at most about one or two rows of the tree at a time. That is <strong>O(w)</strong>, where{" "}
        <em>w</em> is the number of nodes in the widest row. In a full tree (every row completely filled) the last row holds about half
        of all the nodes, so w can be about n/2.
      </p>
      <Callout kind="note" label="Why we say O(w) and not O(h)">
        The depth-first walks of lesson 41 used space in proportion to the <em>height</em>. BFS uses space in proportion to the{" "}
        <em>width</em>. A long thin chain is cheap for BFS. A wide, bushy tree is cheap for depth-first search. Neither one is
        always better.
      </Callout>

      <h2 id="levels">One level at a time</h2>
      <p>
        The loop above gives one flat list. Most questions want the rows kept <em>separate</em>. The trick is to save the{" "}
        <strong>length of the queue</strong> at the start of each round, like taking a photo of it. At that moment the queue
        holds exactly the nodes of one level and nothing else. So <code>size = queue.length - head</code> tells us how many nodes
        to process. We process exactly that many. Any children we add during the round wait behind them and belong to the next
        round.
      </p>
      <CodeBlock lang="js" code={levelsCode} />

      <h2 id="trace">Traced: level order</h2>
      <p>
        Watch the queue (we show only the part not yet visited), the saved size and the level being filled. Notice that{" "}
        <code>size</code> is fixed at the top of each round, even though the queue keeps growing during the round.
      </p>
      <CodeTrace
        code={traceSrc}
        steps={levelTrace()}
        caption="Three rounds, three rows: [1], then [2, 3], then [4, 5, 6]. Each round starts with a size equal to the number of nodes waiting in the queue."
      />
      <DryRun
        title="the queue between rounds"
        cols={["Moment", "Queue (front on the left)", "size", "What happens"]}
        rows={dryRows}
        note="Between rounds the queue holds exactly one level. This is a rule that always stays true, and the whole technique depends on it."
      />

      <h2 id="snapshot">Why the size snapshot works</h2>
      <p>
        Think of the queue as two groups of people standing in a line. The current level is at the front. Behind them are the
        children added so far. At the start of a round the second group is empty. Each node we process adds its children behind
        the first group. But the loop stops after <code>size</code> nodes, so it never reaches the newcomers. When the round
        ends, the front group is gone, and the newcomers become the new &quot;current level&quot;. Do not read{" "}
        <code>queue.length</code> inside the loop condition (<code>k &lt; queue.length - head</code>). That is a bug. The number
        keeps growing as you add children, and the rows get mixed together.
      </p>
      <Callout kind="warn" label="Take the snapshot before the loop">
        Write <code>const size = queue.length - head</code> once, above the inner loop. Never put the length expression inside the
        loop condition.
      </Callout>

      <h2 id="views">Right side view and zigzag</h2>
      <p>
        Once the rows are separate, many questions need only a few lines. A <strong>row</strong> (or <strong>level</strong>) is all the nodes that are the same number of steps away from the root. The <strong>right side view</strong> is what you would
        see if you stood to the right of the tree. You see the last node of each row. The other nodes in that row are hidden
        behind it. The <strong>zigzag</strong> order changes direction each row: row 0 goes left to right, row 1 goes right to
        left, and so on. We do not need to reverse a row. When a row goes right to left, we write each value straight into its
        mirror position.
      </p>
      <CodeBlock lang="js" code={viewsCode} />

      <h2 id="depth">Minimum depth and level averages</h2>
      <p>
        <strong>Minimum depth</strong> is the number of nodes on the shortest path from the root to a <em>leaf</em> (a node with
        no children). BFS goes through the tree from the top down. So the first leaf it meets is the closest one to the top, and
        it can return at once without looking at the rest of the tree. A depth-first search may have to look at much more of the tree before it knows the answer.
      </p>
      <Callout kind="warn" label="A node with one child is not a leaf">
        For a chain like <code>[2, null, 3]</code> the answer is 2, not 1. The root has a right child, so it is not a leaf. The
        only leaf is 3. The simple recursion <code>1 + Math.min(depth(left), depth(right))</code> gets this wrong, because the
        missing side counts as depth 0. Only a node with <em>both</em> children missing ends a path.
      </Callout>
      <p>
        Level <strong>averages</strong> show another benefit of saving the size. We know how many nodes are in a row, so we can
        divide the sum of the row by that number.
      </p>
      <CodeBlock lang="js" code={depthCode} />

      <h2 id="practice">Practice questions</h2>
      <p>For each question, ask two things. Do I need the rows kept separate? And what do I keep from each row: all of it, the last node, the sum, or the maximum?</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Explain why a queue (and not a stack) produces level order.</>,
          <>Explain what <code>size = queue.length - head</code> saves, and why you must take it before the inner loop.</>,
          <>Say what BFS uses its extra space for, and when that is worse than a depth-first walk.</>,
          <>Explain why BFS can stop early for minimum depth, and why a node with one child is not a leaf.</>,
          <>Write level order from memory, then change it to give the right side view.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        So far a walk only <em>visits</em> nodes. <strong>Lesson 43</strong> goes back to depth-first search, but now each call{" "}
        <strong>returns a value up to its parent</strong>. The values are heights, whether a tree is balanced, the diameter (the
        longest path) and path sums. The idea is simple: answer a question by combining what the left side and the right side
        report back. This one idea solves most of the harder tree problems.
      </p>
    </DsaLessonPage>
  );
}
