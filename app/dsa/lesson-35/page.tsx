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
  { id: "insert", label: "Insert at the head, the tail and a position" },
  { id: "delete", label: "Delete a node" },
  { id: "trace", label: "Traced: deleting 3 from 1 → 2 → 3 → 4" },
  { id: "dummy", label: "The dummy head trick" },
  { id: "doubly", label: "Doubly linked lists" },
  { id: "vs", label: "Arrays vs linked lists" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const nodeCode = `class ListNode {
  constructor(val, next = null) {
    this.val = val;      // the data this node holds
    this.next = next;    // the next node, or null at the end
  }
}

// 1 -> 2 -> 3
const c = new ListNode(3);
const b = new ListNode(2, c);
const a = new ListNode(1, b);
const head = a;                 // the list is identified by its first node

console.log(head.val);                 // 1
console.log(head.next.val);            // 2
console.log(head.next.next.val);       // 3
console.log(head.next.next.next);      // null  (the end of the list)`;

const helperCode = `// Two tiny helpers used in every example of this part.
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
  let cur = head;                 // a cursor that walks the list
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

// At the tail: walk to the last node first, so O(n).
function addAtTail(head, val) {
  const node = new ListNode(val);
  if (head === null) return node;
  let cur = head;
  while (cur.next !== null) cur = cur.next;
  cur.next = node;
  return head;
}

// After the node at position i: link the new node in BEFORE cutting the old link.
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
  if (head.val === target) return head.next;       // deleting the head: the next node becomes the head
  let prev = head;
  while (prev.next !== null && prev.next.val !== target) prev = prev.next;
  if (prev.next !== null) prev.next = prev.next.next;   // skip over the node: nothing points to it any more
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
  let skip = -1; // index of the node that has been skipped over
  const snapshot = () => vals.filter((_, i) => i !== skip);
  t.step(1, "start", "prev = null, cur = head", "cur is a cursor that walks the list. prev always trails one node behind it, because to remove a node you must change the node before it.", { list: snapshot(), prev: "null", cur: vals[0] });
  let prevIdx = -1;
  for (let ci = 0; ci < vals.length; ci++) {
    t.step(2, "check", `cur = ${vals[ci]} (not null)`, "There is still a node to look at.", { list: snapshot(), prev: prevIdx < 0 ? "null" : vals[prevIdx], cur: vals[ci] }, "cur");
    if (vals[ci] === target) {
      skip = ci;
      t.step(4, "update", `prev.next = cur.next: ${vals[prevIdx]} now points to ${vals[ci + 1]}`, `The node before (${vals[prevIdx]}) is rewired to jump over ${vals[ci]}. Nothing points to ${vals[ci]} any more, so it is no longer part of the list.`, { list: snapshot(), prev: vals[prevIdx], cur: vals[ci] }, "list");
      t.step(5, "done", "break", "The node is removed; stop walking.", { list: snapshot() });
      break;
    }
    t.step(3, "check", `${vals[ci]} is not ${target}`, "Not the node we want, so move both cursors forward.", { list: snapshot(), prev: prevIdx < 0 ? "null" : vals[prevIdx], cur: vals[ci] });
    prevIdx = ci;
    t.step(7, "update", `prev = ${vals[prevIdx]}, cur = ${vals[ci + 1]}`, "prev takes cur's place and cur steps forward.", { list: snapshot(), prev: vals[prevIdx], cur: vals[ci + 1] }, "cur");
  }
  return t.steps;
}

const dummyCode = `function removeValue(head, target) {
  const dummy = new ListNode(0, head);     // a fake node in front of the real head
  let prev = dummy;
  while (prev.next !== null) {
    if (prev.next.val === target) prev.next = prev.next.next;   // delete: stay on prev, a new next may also match
    else prev = prev.next;
  }
  return dummy.next;                       // the real head (it may have changed)
}

console.log(toArray(removeValue(fromArray([6, 6, 1, 6, 2]), 6))); // [1, 2]
console.log(toArray(removeValue(fromArray([7, 7]), 7)));          // []`;

const doublyCode = `class DNode {
  constructor(val) { this.val = val; this.prev = null; this.next = null; }
}

// Given the node itself, removal is O(1): no walk to find the previous node.
function removeNode(node) {
  if (node.prev) node.prev.next = node.next;
  if (node.next) node.next.prev = node.prev;
  node.prev = node.next = null;             // detach it completely
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
        An array keeps its items side by side in memory, which is why <code>arr[5]</code> is instant. A <strong>linked list</strong>{" "}
        works differently: each item lives in its own small object called a <strong>node</strong>, and each node holds
        <em> two</em> things — its value, and a <strong>reference to the next node</strong>. You find the items by following
        the references, like a treasure hunt where each clue tells you where the next one is.
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
        <li>The <strong>head</strong> is the first node. The list is identified by it: if you lose the head you lose the list.</li>
        <li>The last node&apos;s <code>next</code> is <code>null</code>, which marks the end.</li>
        <li>An empty list is just <code>head === null</code>.</li>
      </ul>
      <p>
        Linked lists matter in interviews because they test one skill in its purest form: <strong>rewiring references without
        losing anything</strong>. The same skill is needed for trees and graphs later.
      </p>

      <h2 id="node">Building nodes by hand</h2>
      <CodeBlock lang="js" code={nodeCode} />
      <p>
        We will use exactly this <code>ListNode</code> class (with <code>val</code> and <code>next</code>) throughout, because it
        is the one LeetCode uses. To keep examples short, two helpers convert between arrays and lists:
      </p>
      <CodeBlock lang="js" code={helperCode} />

      <h2 id="traverse">Traversal and length</h2>
      <p>
        There is no <code>list[i]</code>. To visit every node, start a <strong>cursor</strong> at the head and move it with{" "}
        <code>cur = cur.next</code> until it becomes <code>null</code>. This loop is the foundation of everything else.
      </p>
      <CodeBlock lang="js" code={traverseCode} />
      <p>
        Getting the <em>i</em>-th node means walking i steps, so access is <strong>O(n)</strong>, not O(1) like an array.
        That is the price of this structure.
      </p>

      <h2 id="insert">Insert at the head, the tail and a position</h2>
      <CodeBlock lang="js" code={insertCode} />
      <Callout kind="warn" label="Order matters: link in first, cut second">
        When inserting after <code>node</code>, write <code>node.next = new ListNode(val, node.next)</code>. The new node
        already points at the old next node <em>before</em> <code>node.next</code> is overwritten. If you overwrite{" "}
        <code>node.next</code> first, you lose the rest of the list.
      </Callout>
      <DryRun
        title="cost of inserting"
        cols={["Where", "Time", "Why"]}
        rows={[
          ["at the head", "O(1)", "one new node, one pointer change"],
          ["at the tail (only a head pointer)", "O(n)", "must walk to the last node first"],
          ["at the tail (also keep a tail pointer)", "O(1)", "no walk needed"],
          ["after a node you already hold", "O(1)", "two pointer changes"],
          ["at index i", "O(i)", "walk to the node before position i"],
        ]}
      />

      <h2 id="delete">Delete a node</h2>
      <p>
        To remove a node, make the node <em>before</em> it point to the node <em>after</em> it. Nothing refers to the removed
        node any more, so it is no longer part of the list (and JavaScript&apos;s garbage collector will free it). That means you
        need the <strong>previous</strong> node, so you walk with a trailing pointer or stop one node early.
      </p>
      <CodeBlock lang="js" code={deleteCode} />

      <h2 id="trace">Traced: deleting 3 from 1 → 2 → 3 → 4</h2>
      <CodeTrace
        code={traceSrc}
        steps={deleteTrace()}
        caption="prev trails one step behind cur. When cur is the node to remove, prev jumps over it."
      />

      <h2 id="dummy">The dummy head trick</h2>
      <p>
        The code for deleting the head is different from deleting any other node, because the head has no previous node.
        That special case causes most linked-list bugs. The fix is a <strong>dummy node</strong> placed in front of the head:
        now <em>every</em> real node has a previous node, the head included, and the answer is <code>dummy.next</code>.
      </p>
      <CodeBlock lang="js" code={dummyCode} />
      <p>
        Notice the loop deletes without moving <code>prev</code>: after skipping a node, the <em>new</em> <code>prev.next</code>{" "}
        might also match (the run of 6s), so you check it again before advancing.
      </p>

      <h2 id="doubly">Doubly linked lists</h2>
      <p>
        A <strong>doubly linked list</strong> adds a <code>prev</code> reference to every node, so you can walk both ways and
        remove a node <em>given only that node</em> in O(1). The cost is one extra reference per node and more pointers to
        keep consistent on every change (four pointer updates to insert, instead of two). Browsers use them for history, and
        the LRU cache design (a hash map plus a doubly linked list) relies on that O(1) removal.
      </p>
      <CodeBlock lang="js" code={doublyCode} />

      <h2 id="vs">Arrays vs linked lists</h2>
      <DryRun
        title="the trade-off"
        cols={["Operation", "Array", "Linked list"]}
        rows={[
          ["Access by index", "O(1)", "O(n)"],
          ["Insert / delete at the front", "O(n) (everything shifts)", "O(1)"],
          ["Insert / delete in the middle (given the node)", "O(n)", "O(1)"],
          ["Search for a value", "O(n)", "O(n)"],
          ["Memory per item", "just the value", "value + a reference (more)"],
          ["Cache friendliness", "excellent (contiguous)", "poor (scattered)"],
        ]}
        note="In everyday JavaScript an array is almost always the better choice. Linked lists are studied for the pointer skills and for structures built on them (queues, LRU caches, adjacency lists)."
      />
      <h3>The three classic mistakes</h3>
      <ul>
        <li><strong>Losing the rest of the list</strong>: changing <code>next</code> before saving the old next node.</li>
        <li><strong>Forgetting <code>null</code></strong>: <code>cur.next.val</code> crashes when <code>cur.next</code> is <code>null</code>. Check before you dereference.</li>
        <li><strong>Forgetting the head case</strong>: use a dummy node, or handle the head separately.</li>
      </ul>

      <h2 id="practice">Practice questions</h2>
      <p>Draw the list with arrows before you code, and redraw it after each pointer change.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the <code>ListNode</code> class and the loop that visits every node.</>,
          <>Explain why inserting after a node must set the new node&apos;s <code>next</code> before changing the old link.</>,
          <>Explain what the dummy head removes, and write the delete-all-matching loop with it.</>,
          <>Name two operations where a linked list beats an array and two where it loses.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        <strong>Lesson 36</strong> uses the building blocks above for the three classic list techniques: reversing a list,
        finding the middle with a slow and a fast pointer, and detecting a cycle.
      </p>
    </DsaLessonPage>
  );
}
