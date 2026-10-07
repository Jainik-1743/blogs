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

const lesson = getDsaLesson("lesson-35");

export const metadata: Metadata = {
  title: `Lesson 35 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "A chain of nodes" },
  { id: "node", label: "Building nodes by hand" },
  { id: "traverse", label: "Traversal and length" },
  { id: "insert", label: "Insert at the head, at the tail and at a position" },
  { id: "delete", label: "Delete a node" },
  { id: "trace", label: "Traced: deleting 3 from 1 → 2 → 3 → 4" },
  { id: "dummy", label: "The dummy head trick (a fake first node)" },
  { id: "doubly", label: "Doubly linked lists" },
  { id: "vs", label: "Arrays vs linked lists" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const nodeCode = `class ListNode {
  constructor(val, next = null) {
    this.val = val;      // the data this node holds
    this.next = next;    // the next node, or null if this is the last node
  }
}

// 1 -> 2 -> 3
const c = new ListNode(3);
const b = new ListNode(2, c);
const a = new ListNode(1, b);
const head = a;                 // the first node stands for the whole list

console.log(head.val);                 // 1
console.log(head.next.val);            // 2
console.log(head.next.next.val);       // 3
console.log(head.next.next.next);      // null  (the end of the list)`;

const helperCode = `// Two small helper functions used in every example of this part.
function fromArray(values) {
  const dummy = new ListNode(0);
  let tail = dummy;
  for (const v of values) { tail.next = new ListNode(v); tail = tail.next; }
  return dummy.next;
}
function toArray(head) {
  const out = [];
  for (let cur = head; cur !== null; cur = cur.next) out.push(cur.val);
  return out;
}

console.log(toArray(fromArray([4, 5, 6]))); // [4, 5, 6]
console.log(toArray(null));                 // []`;

const traverseCode = `function length(head) {
  let count = 0;
  let cur = head;                 // a cursor (a moving marker) that walks along the list
  while (cur !== null) {
    count++;
    cur = cur.next;               // move to the next node
  }
  return count;
}

function contains(head, target) {
  for (let cur = head; cur !== null; cur = cur.next) {
    if (cur.val === target) return true;
  }
  return false;
}

const list = fromArray([4, 5, 6]);
console.log(length(list));       // 3
console.log(contains(list, 5));  // true
console.log(contains(list, 9));  // false`;

const insertCode = `// At the head: O(1). The new node points at the old head.
function addAtHead(head, val) {
  return new ListNode(val, head);          // the new node becomes the head
}

// At the tail: first walk to the last node, so it is O(n).
function addAtTail(head, val) {
  const node = new ListNode(val);
  if (head === null) return node;
  let cur = head;
  while (cur.next !== null) cur = cur.next;
  cur.next = node;
  return head;
}

// After a node: connect the new node FIRST, and only then cut the old link.
function addAfter(node, val) {
  node.next = new ListNode(val, node.next);
}

let h = fromArray([2, 3]);
h = addAtHead(h, 1);            // 1 -> 2 -> 3
h = addAtTail(h, 4);            // 1 -> 2 -> 3 -> 4
addAfter(h.next, 99);           // 1 -> 2 -> 99 -> 3 -> 4
console.log(toArray(h));        // [1, 2, 99, 3, 4]`;

const deleteCode = `function deleteValue(head, target) {
  if (head === null) return null;
  if (head.val === target) return head.next;       // we delete the head, so the next node becomes the head
  let prev = head;
  while (prev.next !== null && prev.next.val !== target) prev = prev.next;
  if (prev.next !== null) prev.next = prev.next.next;   // skip over the node: nothing points to it now
  return head;
}

console.log(toArray(deleteValue(fromArray([1, 2, 3, 4]), 3))); // [1, 2, 4]
console.log(toArray(deleteValue(fromArray([1, 2, 3, 4]), 1))); // [2, 3, 4]
console.log(toArray(deleteValue(fromArray([1, 2, 3, 4]), 9))); // [1, 2, 3, 4]`;

const traceSrc = `let prev = null, cur = head;
while (cur !== null) {
  if (cur.val === 3) {
    prev.next = cur.next;
    break;
  }
  prev = cur;
  cur = cur.next;
}`;

function deleteTrace() {
  const t = tracer();
  const vals = [1, 2, 3, 4];
  const target = 3;
  let skip = -1; // index of the node we skipped over
  const snapshot = () => vals.filter((_, i) => i !== skip);
  t.step(1, "start", "prev = null, cur = head", "cur is a cursor (a moving marker) that walks along the list. prev always stays one node behind cur. To remove a node, you must change the node before it.", { list: snapshot(), prev: "null", cur: vals[0] });
  let prevIdx = -1;
  for (let ci = 0; ci < vals.length; ci++) {
    t.step(2, "check", `cur = ${vals[ci]} (not null)`, "There is still a node to look at.", { list: snapshot(), prev: prevIdx < 0 ? "null" : vals[prevIdx], cur: vals[ci] }, "cur");
    if (vals[ci] === target) {
      skip = ci;
      t.step(4, "update", `prev.next = cur.next: ${vals[prevIdx]} now points to ${vals[ci + 1]}`, `The node before it (${vals[prevIdx]}) now jumps over ${vals[ci]}. Nothing points to ${vals[ci]} now, so it is not part of the list any more.`, { list: snapshot(), prev: vals[prevIdx], cur: vals[ci] }, "list");
      t.step(5, "done", "break", "The node is removed, so we stop walking.", { list: snapshot() });
      break;
    }
    t.step(3, "check", `${vals[ci]} is not ${target}`, "This is not the node we want, so move both markers forward.", { list: snapshot(), prev: prevIdx < 0 ? "null" : vals[prevIdx], cur: vals[ci] });
    prevIdx = ci;
    t.step(7, "update", `prev = ${vals[prevIdx]}, cur = ${vals[ci + 1]}`, "prev moves to where cur was, and cur moves one step forward.", { list: snapshot(), prev: vals[prevIdx], cur: vals[ci + 1] }, "cur");
  }
  return t.steps;
}

const dummyCode = `function removeValue(head, target) {
  const dummy = new ListNode(0, head);     // a fake node in front of the real head
  let prev = dummy;
  while (prev.next !== null) {
    if (prev.next.val === target) prev.next = prev.next.next;   // delete it, but stay on prev, because the new next may match too
    else prev = prev.next;
  }
  return dummy.next;                       // the real head (it may have changed)
}

console.log(toArray(removeValue(fromArray([6, 6, 1, 6, 2]), 6))); // [1, 2]
console.log(toArray(removeValue(fromArray([7, 7]), 7)));          // []`;

const doublyCode = `class DNode {
  constructor(val) { this.val = val; this.prev = null; this.next = null; }
}

// If you have the node itself, removal is O(1): you do not need to walk to find the node before it.
function removeNode(node) {
  if (node.prev) node.prev.next = node.next;
  if (node.next) node.next.prev = node.prev;
  node.prev = node.next = null;             // cut it off completely
}

const a = new DNode(1), b = new DNode(2), c = new DNode(3);
a.next = b; b.prev = a; b.next = c; c.prev = b;     // 1 <-> 2 <-> 3
removeNode(b);
console.log(a.next.val, c.prev.val);                // 3 1`;

const designCode = `class MyLinkedList {
  constructor() { this.head = null; this.size = 0; }

  get(index) {
    if (index < 0 || index >= this.size) return -1;
    let cur = this.head;
    for (let i = 0; i < index; i++) cur = cur.next;
    return cur.val;
  }
  addAtHead(val) { this.addAtIndex(0, val); }
  addAtTail(val) { this.addAtIndex(this.size, val); }
  addAtIndex(index, val) {
    if (index < 0 || index > this.size) return;
    const dummy = new ListNode(0, this.head);
    let prev = dummy;
    for (let i = 0; i < index; i++) prev = prev.next;      // stop at the node BEFORE the position
    prev.next = new ListNode(val, prev.next);
    this.head = dummy.next;
    this.size++;
  }
  deleteAtIndex(index) {
    if (index < 0 || index >= this.size) return;
    const dummy = new ListNode(0, this.head);
    let prev = dummy;
    for (let i = 0; i < index; i++) prev = prev.next;
    prev.next = prev.next.next;
    this.head = dummy.next;
    this.size--;
  }
}

const L = new MyLinkedList();
L.addAtHead(1); L.addAtTail(3); L.addAtIndex(1, 2);   // 1 -> 2 -> 3
console.log(L.get(1));      // 2
L.deleteAtIndex(1);         // 1 -> 3
console.log(L.get(1));      // 3`;

export default function DsaLessonThirtyFivePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">A chain of nodes</h2>
      <p>
        An array keeps its items side by side in memory. This is why <code>arr[5]</code> is instant. A <strong>linked list</strong>{" "}
        works in a different way. Each item lives in its own small object called a <strong>node</strong>. Each node holds
        <em> two</em> things: its value, and a <strong>reference to the next node</strong> (a link that tells you where the next node is; many books call it a <em>pointer</em>). You find the items by following
        the links. It is like a treasure hunt, where each clue tells you where to find the next clue.
      </p>
      <CodeBlock
        lang="text"
        code={`head
 │
 ▼
[ 1 | • ]──▶[ 2 | • ]──▶[ 3 | • ]──▶ null
  value next`}
      />
      <ul>
        <li>The <strong>head</strong> is the first node. The head stands for the whole list. If you lose the head, you lose the list.</li>
        <li>The <code>next</code> of the last node is <code>null</code> (a special value that means &ldquo;nothing here&rdquo;). This marks the end.</li>
        <li>An empty list is simply <code>head === null</code>.</li>
      </ul>
      <p>
        Linked lists are common in interviews because they test one skill in a clean way: <strong>changing links without
        losing any node</strong>. You will need the same skill later for trees and graphs.
      </p>

      <h2 id="node">Building nodes by hand</h2>
      <CodeBlock lang="js" code={nodeCode} />
      <p>
        We will use this same <code>ListNode</code> class (with <code>val</code> and <code>next</code>) in every lesson, because it
        is the class that LeetCode uses. To keep the examples short, we use two helper functions that change an array into a list and a list into an array.
      </p>
      <CodeBlock lang="js" code={helperCode} />

      <h2 id="traverse">Traversal and length</h2>
      <p>
        There is no <code>list[i]</code>. To visit every node, put a <strong>cursor</strong> (a moving marker) at the head. Move it with{" "}
        <code>cur = cur.next</code> until it becomes <code>null</code>. All other list code is built on this loop.
      </p>
      <CodeBlock lang="js" code={traverseCode} />
      <p>
        To get the <em>i</em>-th node, you must walk i steps. So access takes <strong>O(n)</strong> time, not O(1) like an array.
        This is the price you pay for a linked list.
      </p>

      <h2 id="insert">Insert at the head, at the tail and at a position</h2>
      <CodeBlock lang="js" code={insertCode} />
      <Callout kind="warn" label="Order matters: connect first, cut second">
        To insert after <code>node</code>, write <code>node.next = new ListNode(val, node.next)</code>. The new node
        points at the old next node <em>before</em> <code>node.next</code> is changed. If you change{" "}
        <code>node.next</code> first, you lose the rest of the list.
      </Callout>
      <DryRun
        title="Cost of inserting"
        cols={["Where", "Time", "Why"]}
        rows={[
          ["at the head", "O(1)", "one new node and one link change"],
          ["at the tail (only a head pointer)", "O(n)", "you must walk to the last node first"],
          ["at the tail (if you also keep a pointer to the tail)", "O(1)", "no walk needed"],
          ["after a node you already hold", "O(1)", "two link changes"],
          ["at index i", "O(i)", "walk to the node before position i"],
        ]}
      />

      <h2 id="delete">Delete a node</h2>
      <p>
        To remove a node, make the node <em>before</em> it point to the node <em>after</em> it. Nothing points to the removed
        node now, so it is not part of the list any more. (JavaScript&apos;s garbage collector, the part that cleans up unused memory, will free it.) This means you
        need the <strong>previous</strong> node. So you walk with a second marker that stays one step behind, or you stop one node early.
      </p>
      <CodeBlock lang="js" code={deleteCode} />

      <h2 id="trace">Traced: deleting 3 from 1 → 2 → 3 → 4</h2>
      <CodeTrace
        code={traceSrc}
        steps={deleteTrace()}
        caption="prev stays one step behind cur. When cur is the node to remove, prev jumps over it."
      />

      <h2 id="dummy">The dummy head trick (a fake first node)</h2>
      <p>
        Deleting the head needs different code from deleting any other node, because the head has no node before it.
        This special case causes most linked-list bugs. The fix is a <strong>dummy node</strong> (a fake extra node) that you put in front of the head.
        Now <em>every</em> real node has a node before it, including the head. The answer is <code>dummy.next</code>.
      </p>
      <CodeBlock lang="js" code={dummyCode} />
      <p>
        Look at the loop: after a delete, it does not move <code>prev</code>. After you skip a node, the <em>new</em> <code>prev.next</code>{" "}
        might match too (for example, a row of 6s). So you check it again before you move forward.
      </p>

      <h2 id="doubly">Doubly linked lists</h2>
      <p>
        A <strong>doubly linked list</strong> gives every node a <code>prev</code> link (a link to the node before it). So you can walk in both directions, and
        you can remove a node in O(1) when you only have <em>that node</em>. The cost is one extra link in each node. Also, there are more links to keep correct
        on every change: four link updates to insert, instead of two. The back and forward history of a browser can be built in this way. The LRU cache design (a cache, which is a small store of recent results, that
        throws away the item used longest ago; it is built from a hash map, which is a lookup table, plus a doubly linked list) also needs this O(1) removal.
      </p>
      <CodeBlock lang="js" code={doublyCode} />

      <h2 id="vs">Arrays vs linked lists</h2>
      <DryRun
        title="The trade-off"
        cols={["Operation", "Array", "Linked list"]}
        rows={[
          ["Access by index", "O(1)", "O(n)"],
          ["Insert / delete at the front", "O(n) (everything moves over)", "O(1)"],
          ["Insert / delete in the middle (given the node)", "O(n)", "O(1)"],
          ["Search for a value", "O(n)", "O(n)"],
          ["Memory per item", "just the value", "value + a link (more)"],
          ["Cache friendliness", "excellent (items are side by side)", "poor (items are spread out)"],
        ]}
        note="Cache friendliness means how well the computer's fast CPU cache can load your data. Items that sit side by side are loaded together, so arrays are fast to scan. In everyday JavaScript, an array is almost always the better choice. We study linked lists to learn pointer skills and to understand structures built on them (queues, LRU caches, adjacency lists)."
      />
      <h3>The three common mistakes</h3>
      <ul>
        <li><strong>Losing the rest of the list</strong>: you change <code>next</code> before you save the old next node.</li>
        <li><strong>Forgetting <code>null</code></strong>: <code>cur.next.val</code> crashes when <code>cur.next</code> is <code>null</code>. Check for <code>null</code> before you use <code>.val</code> or <code>.next</code> on a node.</li>
        <li><strong>Forgetting the head case</strong>: use a dummy node, or write separate code for the head.</li>
      </ul>

      <h2 id="practice">Practice questions</h2>
      <p>Draw the list with arrows before you write code. Draw it again after each link change.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the <code>ListNode</code> class and the loop that visits every node.</>,
          <>Explain why, when you insert after a node, you must set the <code>next</code> of the new node before you change the old link.</>,
          <>Explain what problem the dummy head solves, and write the loop that deletes all matching nodes using it.</>,
          <>Name two operations where a linked list is better than an array, and two where it is worse.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        <strong>Lesson 36</strong> uses these building blocks for three classic list techniques: reversing a list,
        finding the middle with a slow pointer and a fast pointer, and finding a cycle (a loop in the list).
      </p>
    </DsaLessonPage>
  );
}
