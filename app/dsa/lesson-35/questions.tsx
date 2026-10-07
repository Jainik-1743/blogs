import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 35 practice questions: building and editing linked lists. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Design a linked list"
        level="Medium"
        examples={[
          { input: "addAtHead(1), addAtTail(3), addAtIndex(1, 2), get(1)", output: "2", why: "The list is 1 → 2 → 3." },
          { input: "…then deleteAtIndex(1), get(1)", output: "3", why: "The list is 1 → 3." },
        ]}
        hints={[
          <>Store <code>head</code> and <code>size</code>. Every other method can be written with the same walk to the node <em>before</em> the position.</>,
          <>A dummy node in front of the head removes the special case for index 0.</>,
          <>Check bounds first: <code>get</code> and <code>delete</code> need <code>0 ≤ index &lt; size</code>; add needs <code>0 ≤ index ≤ size</code>.</>,
        ]}
        approaches={[
          {
            name: "Singly linked list with a dummy head",
            idea: (
              <ol>
                <li><code>get</code>: walk <code>index</code> steps from the head.</li>
                <li><code>addAtIndex</code> / <code>deleteAtIndex</code>: walk to the node before the position, then rewire.</li>
                <li><code>addAtHead</code> and <code>addAtTail</code> are special cases of <code>addAtIndex</code>.</li>
              </ol>
            ),
            code: `class ListNode { constructor(val, next = null) { this.val = val; this.next = next; } }

class MyLinkedList {
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
    for (let i = 0; i < index; i++) prev = prev.next;
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
L.addAtHead(1); L.addAtTail(3); L.addAtIndex(1, 2);
console.log(L.get(1));     // 2
L.deleteAtIndex(1);
console.log(L.get(1));     // 3
console.log(L.get(5));     // -1`,
            explain: <p>Every operation is O(n) in the worst case because of the walk (O(1) for head insertion if you special-case it).</p>,
          },
          {
            name: "Keep a tail pointer too",
            idea: <p>A <code>tail</code> reference makes <code>addAtTail</code> O(1), at the price of keeping it correct when the last node changes.</p>,
            code: `class ListNode { constructor(val, next = null) { this.val = val; this.next = next; } }

class FastTailList {
  constructor() { this.head = null; this.tail = null; this.size = 0; }
  addAtHead(val) {
    this.head = new ListNode(val, this.head);
    if (this.tail === null) this.tail = this.head;       // the first node is also the last
    this.size++;
  }
  addAtTail(val) {
    const node = new ListNode(val);
    if (this.tail === null) this.head = this.tail = node;
    else { this.tail.next = node; this.tail = node; }     // O(1): no walk
    this.size++;
  }
  toArray() { const out = []; for (let c = this.head; c; c = c.next) out.push(c.val); return out; }
}

const L = new FastTailList();
L.addAtTail(2); L.addAtTail(3); L.addAtHead(1);
console.log(L.toArray()); // [1, 2, 3]`,
            explain: <p>Deleting the last node then also needs the previous node to move <code>tail</code> back, so deletion at the tail is still O(n) in a singly linked list.</p>,
          },
        ]}
        compare={<p>The first one — it is what the question tests. Mention the tail pointer as an optimisation. (LeetCode 707.)</p>}
      >
        <p>Implement a singly linked list with <code>get</code>, <code>addAtHead</code>, <code>addAtTail</code>, <code>addAtIndex</code> and <code>deleteAtIndex</code>.</p>
      </Problem>

      <Problem
        n={2}
        title="Remove linked list elements"
        level="Easy"
        examples={[
          { input: "head = [1, 2, 6, 3, 4, 5, 6], val = 6", output: "[1, 2, 3, 4, 5]", why: "Both 6s are removed." },
          { input: "head = [7, 7, 7, 7], val = 7", output: "[]", why: "Every node matches, including the head." },
          { input: "head = [], val = 1", output: "[]", why: "Nothing to do." },
        ]}
        hints={[
          <>The head may need removing, repeatedly. That special case is what the dummy node is for.</>,
          <>After skipping a node, do not advance: the next one may also match.</>,
        ]}
        approaches={[
          {
            name: "Dummy head",
            idea: <p>Walk with <code>prev</code> starting at a dummy node; delete <code>prev.next</code> when it matches, otherwise advance.</p>,
            code: `function removeElements(head, val) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  while (prev.next !== null) {
    if (prev.next.val === val) prev.next = prev.next.next;
    else prev = prev.next;
  }
  return dummy.next;
}

console.log(toArray(removeElements(fromArray([1, 2, 6, 3, 4, 5, 6]), 6))); // [1, 2, 3, 4, 5]
console.log(toArray(removeElements(fromArray([7, 7, 7, 7]), 7)));          // []
console.log(toArray(removeElements(null, 1)));                             // []`,
            explain: <p>O(n) time, O(1) space.</p>,
          },
          {
            name: "Without a dummy: skip the head first",
            idea: <p>Move the head forward while it matches, then handle the rest with one pointer.</p>,
            code: `function removeElements(head, val) {
  while (head !== null && head.val === val) head = head.next;    // the head special case
  let cur = head;
  while (cur !== null && cur.next !== null) {
    if (cur.next.val === val) cur.next = cur.next.next;
    else cur = cur.next;
  }
  return head;
}

console.log(toArray(removeElements(fromArray([1, 2, 6, 3, 4, 5, 6]), 6))); // [1, 2, 3, 4, 5]
console.log(toArray(removeElements(fromArray([7, 7, 7, 7]), 7)));          // []`,
            explain: <p>The same cost, but you must write the head case by hand. This is the code the dummy node saves you from.</p>,
          },
          {
            name: "Recursion",
            idea: <p>Remove from the rest of the list first, then decide whether to keep this node.</p>,
            code: `function removeElements(head, val) {
  if (head === null) return null;
  head.next = removeElements(head.next, val);     // the cleaned rest of the list
  return head.val === val ? head.next : head;     // drop this node if it matches
}

console.log(toArray(removeElements(fromArray([1, 2, 6, 3, 4, 5, 6]), 6))); // [1, 2, 3, 4, 5]`,
            explain: <p>Elegant, but it uses O(n) stack space; a very long list could overflow the stack.</p>,
          },
        ]}
        compare={<p>The dummy-head loop. (LeetCode 203.)</p>}
      >
        <p>Remove every node of a linked list whose value equals <code>val</code> and return the new head.</p>
      </Problem>

      <Problem
        n={3}
        title="Delete node in a linked list (given only that node)"
        level="Medium"
        examples={[
          { input: "head = [4, 5, 1, 9], node = 5", output: "[4, 1, 9]", why: "You are given the node with value 5, not the head." },
          { input: "head = [4, 5, 1, 9], node = 1", output: "[4, 5, 9]", why: "The node is never the tail." },
        ]}
        hints={[
          <>You cannot reach the previous node, so you cannot rewire it.</>,
          <>What if the node <em>becomes</em> its next node: copy the next value into it, then skip the next node?</>,
        ]}
        approaches={[
          {
            name: "Copy the next node over this one",
            idea: (
              <ol>
                <li>Copy <code>node.next.val</code> into <code>node.val</code>.</li>
                <li>Set <code>node.next = node.next.next</code>.</li>
              </ol>
            ),
            code: `function deleteNode(node) {
  node.val = node.next.val;
  node.next = node.next.next;
}

const head = fromArray([4, 5, 1, 9]);
const five = head.next;
deleteNode(five);
console.log(toArray(head)); // [4, 1, 9]`,
            explain: <p>O(1) time and space. It does not delete the given node object; it deletes the <em>next</em> one after copying its value, which is observably the same list. It only works because the node is guaranteed not to be the tail.</p>,
          },
        ]}
        compare={<p>A trick question rather than an algorithm. (LeetCode 237.)</p>}
      >
        <p>You are given only a node (not the head) of a singly linked list, and it is not the tail. Delete it from the list.</p>
      </Problem>

      <Problem
        n={4}
        title="Insert into a sorted linked list"
        level="Easy"
        examples={[
          { input: "head = [1, 3, 5], val = 4", output: "[1, 3, 4, 5]", why: "4 goes between 3 and 5." },
          { input: "head = [2, 3], val = 1", output: "[1, 2, 3]", why: "A new head." },
          { input: "head = [], val = 7", output: "[7]", why: "A one-node list." },
        ]}
        hints={[
          <>Walk until the next node is not smaller than the value; <code>prev</code> is the node to insert after.</>,
          <>A dummy head makes inserting before the first node the same as any other.</>,
        ]}
        approaches={[
          {
            name: "Walk to the right place",
            idea: <p>Stop with <code>prev</code> on the last node smaller than <code>val</code>, then link in.</p>,
            code: `function insertSorted(head, val) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  while (prev.next !== null && prev.next.val < val) prev = prev.next;
  prev.next = new ListNode(val, prev.next);        // link in first (new node points at the old next)
  return dummy.next;
}

console.log(toArray(insertSorted(fromArray([1, 3, 5]), 4))); // [1, 3, 4, 5]
console.log(toArray(insertSorted(fromArray([2, 3]), 1)));    // [1, 2, 3]
console.log(toArray(insertSorted(null, 7)));                 // [7]`,
            explain: <p>O(n) time, O(1) space. This is the inner step of insertion sort on a list.</p>,
          },
        ]}
        compare={<p>A warm-up for merging two sorted lists in Lesson 37.</p>}
      >
        <p>Insert a value into an ascending sorted linked list so it stays sorted, and return the head.</p>
      </Problem>

      <Problem
        n={5}
        title="Remove duplicates from a sorted list"
        level="Easy"
        examples={[
          { input: "head = [1, 1, 2]", output: "[1, 2]", why: "One duplicate 1 removed." },
          { input: "head = [1, 1, 2, 3, 3]", output: "[1, 2, 3]", why: "Both duplicates removed." },
        ]}
        hints={[
          <>Because the list is sorted, duplicates sit next to each other.</>,
          <>Compare a node with its next node. If equal, skip the next one without moving; otherwise advance.</>,
        ]}
        approaches={[
          {
            name: "Compare with the next node",
            idea: <p>While <code>cur.next</code> exists, delete it if it equals <code>cur</code>.</p>,
            code: `function deleteDuplicates(head) {
  let cur = head;
  while (cur !== null && cur.next !== null) {
    if (cur.val === cur.next.val) cur.next = cur.next.next;
    else cur = cur.next;
  }
  return head;
}

console.log(toArray(deleteDuplicates(fromArray([1, 1, 2]))));       // [1, 2]
console.log(toArray(deleteDuplicates(fromArray([1, 1, 2, 3, 3])))); // [1, 2, 3]
console.log(toArray(deleteDuplicates(fromArray([2, 2, 2]))));       // [2]`,
            explain: <p>O(n) time, O(1) space. No dummy is needed because the head is never removed (the first of a run stays).</p>,
          },
        ]}
        compare={<p>(LeetCode 83.) The harder version (82) removes <em>every</em> value that has duplicates, which does need a dummy head.</p>}
      >
        <p>Given a sorted linked list, delete all duplicates so each value appears once.</p>
      </Problem>

      <Problem
        n={6}
        title="Odd even linked list"
        level="Medium"
        examples={[
          { input: "head = [1, 2, 3, 4, 5]", output: "[1, 3, 5, 2, 4]", why: "Nodes at odd positions first, then even positions." },
          { input: "head = [2, 1, 3, 5, 6, 4, 7]", output: "[2, 3, 6, 7, 1, 5, 4]", why: "Positions 1, 3, 5, 7 then 2, 4, 6." },
        ]}
        hints={[
          <>Build two chains by rewiring: one of odd-position nodes, one of even-position nodes.</>,
          <>Remember where the even chain starts, so you can attach it to the end of the odd chain.</>,
          <>Work in O(1) extra space by reusing the existing nodes.</>,
        ]}
        approaches={[
          {
            name: "Copy values into arrays",
            idea: <p>Read the values into two arrays, concatenate, and rebuild the list.</p>,
            code: `function oddEvenList(head) {
  const odd = [], even = [];
  let i = 1;
  for (let c = head; c !== null; c = c.next, i++) (i % 2 === 1 ? odd : even).push(c.val);
  return fromArray([...odd, ...even]);
}

console.log(toArray(oddEvenList(fromArray([1, 2, 3, 4, 5])))); // [1, 3, 5, 2, 4]`,
            explain: <p>O(n) time but O(n) extra space and new nodes; the question asks for O(1) space by rewiring.</p>,
          },
          {
            name: "Two chains by rewiring (O(1) space)",
            idea: (
              <ol>
                <li><code>odd = head</code>, <code>even = head.next</code>, and remember <code>evenHead</code>.</li>
                <li>While there is an even node with a next: <code>odd.next = even.next</code>, advance <code>odd</code>, <code>even.next = odd.next</code>, advance <code>even</code>.</li>
                <li>Finally <code>odd.next = evenHead</code>.</li>
              </ol>
            ),
            code: `function oddEvenList(head) {
  if (head === null || head.next === null) return head;
  let odd = head, even = head.next;
  const evenHead = even;                    // where the even chain begins
  while (even !== null && even.next !== null) {
    odd.next = even.next;                   // the odd node skips over the even one
    odd = odd.next;
    even.next = odd.next;                   // the even node skips over the odd one
    even = even.next;
  }
  odd.next = evenHead;                      // join the chains
  return head;
}

console.log(toArray(oddEvenList(fromArray([1, 2, 3, 4, 5]))));          // [1, 3, 5, 2, 4]
console.log(toArray(oddEvenList(fromArray([2, 1, 3, 5, 6, 4, 7]))));    // [2, 3, 6, 7, 1, 5, 4]
console.log(toArray(oddEvenList(fromArray([1, 2]))));                   // [1, 2]`,
            explain: <p>O(n) time, O(1) space. The loop stops when <code>even</code> or <code>even.next</code> is null, which covers both odd and even lengths.</p>,
          },
        ]}
        compare={<p>The rewiring version. It is a good test of tracking several pointers at once. (LeetCode 328.)</p>}
      >
        <p>Group all nodes at odd positions together, followed by the nodes at even positions, keeping the relative order within each group. Use O(1) extra space.</p>
      </Problem>

      <Problem
        n={7}
        title="Convert binary number in a linked list to integer"
        level="Easy"
        examples={[
          { input: "head = [1, 0, 1]", output: "5", why: "Binary 101 is 5." },
          { input: "head = [0]", output: "0", why: "Zero." },
          { input: "head = [1, 1, 0, 0]", output: "12", why: "Binary 1100." },
        ]}
        hints={[
          <>Reading left to right, each new bit doubles the number so far and adds itself.</>,
          <>Traverse once and keep a running number.</>,
        ]}
        approaches={[
          {
            name: "Doubling as you traverse",
            idea: <p>Start at 0; for each node, <code>n = n * 2 + node.val</code>.</p>,
            code: `function getDecimalValue(head) {
  let n = 0;
  for (let cur = head; cur !== null; cur = cur.next) n = n * 2 + cur.val;
  return n;
}

console.log(getDecimalValue(fromArray([1, 0, 1])));    // 5
console.log(getDecimalValue(fromArray([0])));          // 0
console.log(getDecimalValue(fromArray([1, 1, 0, 0]))); // 12`,
            explain: <p>O(n) time, O(1) space. Left to right needs no knowledge of the length, which a linked list does not give you for free.</p>,
          },
          {
            name: "Bit shift",
            idea: <p>The same idea written with bit operations: shift left by one and OR in the bit.</p>,
            code: `function getDecimalValue(head) {
  let n = 0;
  for (let cur = head; cur !== null; cur = cur.next) n = (n << 1) | cur.val;
  return n;
}

console.log(getDecimalValue(fromArray([1, 0, 1, 1]))); // 11`,
            explain: <p>Identical cost. <code>n &lt;&lt; 1</code> is the same as <code>n * 2</code> (Part 15 covers bit tricks).</p>,
          },
        ]}
        compare={<p>(LeetCode 1290.)</p>}
      >
        <p>A linked list holds the bits of a binary number, most significant bit first. Return its decimal value.</p>
      </Problem>

      <DryRun
        title="Pointer moves for the common edits"
        cols={["Edit", "Pointer changes", "Watch out for"]}
        rows={[
          ["insert after p", "new.next = p.next; p.next = new", "do not swap the two lines"],
          ["delete after p", "p.next = p.next.next", "p.next may be null"],
          ["delete the head", "head = head.next", "use a dummy head to avoid this case"],
          ["delete a node given only itself", "copy next.val, skip next", "fails on the tail"],
          ["swap two adjacent nodes", "three pointer changes", "save a reference before overwriting"],
        ]}
      />
    </>
  );
}
