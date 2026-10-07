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
          <>Store <code>head</code> and <code>size</code>. Every other method can use the same walk to the node <em>before</em> the position.</>,
          <>A dummy node in front of the head removes the special case for index 0.</>,
          <>Check the limits first. <code>get</code> and <code>delete</code> need <code>0 ≤ index &lt; size</code>. Add needs <code>0 ≤ index ≤ size</code>.</>,
        ]}
        approaches={[
          {
            name: "Singly linked list with a dummy head",
            idea: (
              <ol>
                <li><code>get</code>: walk <code>index</code> steps from the head.</li>
                <li><code>addAtIndex</code> and <code>deleteAtIndex</code>: walk to the node before the position, then change the links.</li>
                <li><code>addAtHead</code> and <code>addAtTail</code> are just special cases of <code>addAtIndex</code>.</li>
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
            explain: <p>In the worst case, every operation is O(n) because of the walk. Adding at the head can be O(1) if you write it as a special case.</p>,
          },
          {
            name: "Keep a tail pointer too",
            idea: <p>A <code>tail</code> reference makes <code>addAtTail</code> O(1). The price is that you must keep it correct whenever the last node changes.</p>,
            code: `class ListNode { constructor(val, next = null) { this.val = val; this.next = next; } }

class FastTailList {
  constructor() { this.head = null; this.tail = null; this.size = 0; }
  addAtHead(val) {
    this.head = new ListNode(val, this.head);
    if (this.tail === null) this.tail = this.head;       // the first node is also the last node
    this.size++;
  }
  addAtTail(val) {
    const node = new ListNode(val);
    if (this.tail === null) this.head = this.tail = node;
    else { this.tail.next = node; this.tail = node; }     // O(1): no walk needed
    this.size++;
  }
  toArray() { const out = []; for (let c = this.head; c; c = c.next) out.push(c.val); return out; }
}

const L = new FastTailList();
L.addAtTail(2); L.addAtTail(3); L.addAtHead(1);
console.log(L.toArray()); // [1, 2, 3]`,
            explain: <p>To delete the last node, you need the node before it so you can move <code>tail</code> back. So deleting at the tail is still O(n) in a singly linked list.</p>,
          },
        ]}
        compare={<p>Use the first one, because that is what the question tests. Mention the tail pointer as a way to make it faster. (LeetCode 707.)</p>}
      >
        <p>Write a singly linked list (each node has only a <code>next</code> link) with <code>get</code>, <code>addAtHead</code>, <code>addAtTail</code>, <code>addAtIndex</code> and <code>deleteAtIndex</code>.</p>
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
          <>You may need to remove the head, again and again. The dummy node is for this special case.</>,
          <>After you skip a node, do not move forward. The next node may match too.</>,
        ]}
        approaches={[
          {
            name: "Dummy head",
            idea: <p>Walk with <code>prev</code>, starting at a dummy node. If <code>prev.next</code> matches, delete it. If not, move forward.</p>,
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
            idea: <p>Move the head forward while it matches. Then handle the rest of the list with one pointer.</p>,
            code: `function removeElements(head, val) {
  while (head !== null && head.val === val) head = head.next;    // the special case for the head
  let cur = head;
  while (cur !== null && cur.next !== null) {
    if (cur.next.val === val) cur.next = cur.next.next;
    else cur = cur.next;
  }
  return head;
}

console.log(toArray(removeElements(fromArray([1, 2, 6, 3, 4, 5, 6]), 6))); // [1, 2, 3, 4, 5]
console.log(toArray(removeElements(fromArray([7, 7, 7, 7]), 7)));          // []`,
            explain: <p>The cost is the same, but you must write the head case yourself. The dummy node saves you from writing this code.</p>,
          },
          {
            name: "Recursion",
            idea: <p>First clean the rest of the list. Then decide if you keep this node.</p>,
            code: `function removeElements(head, val) {
  if (head === null) return null;
  head.next = removeElements(head.next, val);     // the rest of the list, after cleaning
  return head.val === val ? head.next : head;     // drop this node if it matches
}

console.log(toArray(removeElements(fromArray([1, 2, 6, 3, 4, 5, 6]), 6))); // [1, 2, 3, 4, 5]`,
            explain: <p>It looks neat, but it uses O(n) stack space. A very long list could cause a stack overflow (the call stack, the memory that keeps track of open function calls, runs out of room).</p>,
          },
        ]}
        compare={<p>Use the dummy-head loop. (LeetCode 203.)</p>}
      >
        <p>Remove every node of a linked list that has the value <code>val</code>. Return the new head.</p>
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
          <>You cannot reach the node before it, so you cannot change its link.</>,
          <>What if this node <em>becomes</em> its next node? Copy the next value into it, then skip the next node.</>,
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
            explain: <p>O(1) time and space. It does not delete the given node object. It copies the value of the <em>next</em> node and deletes that next node. The list looks exactly the same afterwards. It works only because the node is never the tail.</p>,
          },
        ]}
        compare={<p>This is a trick question, not a real algorithm. (LeetCode 237.)</p>}
      >
        <p>You get only one node of a singly linked list (not the head), and it is not the tail. Delete it from the list.</p>
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
          <>Walk until the next node is not smaller than the value. Then <code>prev</code> is the node to insert after.</>,
          <>A dummy head makes inserting before the first node work the same as any other insert.</>,
        ]}
        approaches={[
          {
            name: "Walk to the right place",
            idea: <p>Stop with <code>prev</code> on the last node that is smaller than <code>val</code>. Then connect the new node.</p>,
            code: `function insertSorted(head, val) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  while (prev.next !== null && prev.next.val < val) prev = prev.next;
  prev.next = new ListNode(val, prev.next);        // connect first (the new node points at the old next node)
  return dummy.next;
}

console.log(toArray(insertSorted(fromArray([1, 3, 5]), 4))); // [1, 3, 4, 5]
console.log(toArray(insertSorted(fromArray([2, 3]), 1)));    // [1, 2, 3]
console.log(toArray(insertSorted(null, 7)));                 // [7]`,
            explain: <p>O(n) time, O(1) space. This is the main step of insertion sort (sorting by putting each item in its place) on a list.</p>,
          },
        ]}
        compare={<p>This is a warm-up for merging two sorted lists in Lesson 37.</p>}
      >
        <p>Insert a value into a linked list that is sorted from small to big. The list must stay sorted. Return the head.</p>
      </Problem>

      <Problem
        n={5}
        title="Remove duplicates from a sorted list"
        level="Easy"
        examples={[
          { input: "head = [1, 1, 2]", output: "[1, 2]", why: "The extra 1 is removed." },
          { input: "head = [1, 1, 2, 3, 3]", output: "[1, 2, 3]", why: "Both extra copies are removed." },
        ]}
        hints={[
          <>The list is sorted, so equal values sit next to each other.</>,
          <>Compare a node with its next node. If they are equal, skip the next node and do not move. If not, move forward.</>,
        ]}
        approaches={[
          {
            name: "Compare with the next node",
            idea: <p>While <code>cur.next</code> exists, delete it if it is equal to <code>cur</code>.</p>,
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
            explain: <p>O(n) time, O(1) space. You do not need a dummy, because the head is never removed. The first node of a group of equal values stays.</p>,
          },
        ]}
        compare={<p>(LeetCode 83.) The harder version (LeetCode 82) removes <em>every</em> value that appears more than once. That version needs a dummy head.</p>}
      >
        <p>You get a sorted linked list. Delete the repeated values, so that each value appears only once.</p>
      </Problem>

      <Problem
        n={6}
        title="Odd even linked list"
        level="Medium"
        examples={[
          { input: "head = [1, 2, 3, 4, 5]", output: "[1, 3, 5, 2, 4]", why: "The nodes at odd positions come first, then the nodes at even positions." },
          { input: "head = [2, 1, 3, 5, 6, 4, 7]", output: "[2, 3, 6, 7, 1, 5, 4]", why: "Positions 1, 3, 5, 7 then 2, 4, 6." },
        ]}
        hints={[
          <>Change the links to build two chains: one with the odd-position nodes, and one with the even-position nodes.</>,
          <>Remember where the even chain starts, so you can join it to the end of the odd chain.</>,
          <>Use only O(1) extra space by reusing the nodes you already have.</>,
        ]}
        approaches={[
          {
            name: "Copy values into arrays",
            idea: <p>Read the values into two arrays, join the two arrays, and build a new list.</p>,
            code: `function oddEvenList(head) {
  const odd = [], even = [];
  let i = 1;
  for (let c = head; c !== null; c = c.next, i++) (i % 2 === 1 ? odd : even).push(c.val);
  return fromArray([...odd, ...even]);
}

console.log(toArray(oddEvenList(fromArray([1, 2, 3, 4, 5])))); // [1, 3, 5, 2, 4]`,
            explain: <p>O(n) time, but it uses O(n) extra space and makes new nodes. The question asks for O(1) space by changing the links.</p>,
          },
          {
            name: "Two chains by changing links (O(1) space)",
            idea: (
              <ol>
                <li>Set <code>odd = head</code> and <code>even = head.next</code>, and remember <code>evenHead</code>.</li>
                <li>While the even node has a next node: set <code>odd.next = even.next</code>, move <code>odd</code> forward, set <code>even.next = odd.next</code>, then move <code>even</code> forward.</li>
                <li>At the end, set <code>odd.next = evenHead</code>.</li>
              </ol>
            ),
            code: `function oddEvenList(head) {
  if (head === null || head.next === null) return head;
  let odd = head, even = head.next;
  const evenHead = even;                    // where the even chain starts
  while (even !== null && even.next !== null) {
    odd.next = even.next;                   // the odd node jumps over the even node
    odd = odd.next;
    even.next = odd.next;                   // the even node jumps over the odd node
    even = even.next;
  }
  odd.next = evenHead;                      // join the two chains
  return head;
}

console.log(toArray(oddEvenList(fromArray([1, 2, 3, 4, 5]))));          // [1, 3, 5, 2, 4]
console.log(toArray(oddEvenList(fromArray([2, 1, 3, 5, 6, 4, 7]))));    // [2, 3, 6, 7, 1, 5, 4]
console.log(toArray(oddEvenList(fromArray([1, 2]))));                   // [1, 2]`,
            explain: <p>O(n) time, O(1) space. The loop stops when <code>even</code> or <code>even.next</code> is null. This works for lists with an odd length and for lists with an even length.</p>,
          },
        ]}
        compare={<p>Use the version that changes the links. It tests whether you can keep track of several pointers at once. (LeetCode 328.)</p>}
      >
        <p>Put all the nodes at odd positions together, followed by the nodes at even positions. Keep the original order inside each group. Use only O(1) extra space.</p>
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
          <>Read from left to right. Each new bit (a 0 or a 1) doubles the number so far and then adds itself.</>,
          <>Walk through the list once and keep a running number.</>,
        ]}
        approaches={[
          {
            name: "Doubling as you traverse",
            idea: <p>Start at 0. For each node, do <code>n = n * 2 + node.val</code>.</p>,
            code: `function getDecimalValue(head) {
  let n = 0;
  for (let cur = head; cur !== null; cur = cur.next) n = n * 2 + cur.val;
  return n;
}

console.log(getDecimalValue(fromArray([1, 0, 1])));    // 5
console.log(getDecimalValue(fromArray([0])));          // 0
console.log(getDecimalValue(fromArray([1, 1, 0, 0]))); // 12`,
            explain: <p>O(n) time, O(1) space. Going from left to right does not need the length of the list. A linked list does not tell you its length for free.</p>,
          },
          {
            name: "Bit shift",
            idea: <p>This is the same idea, written with bit operations. Shift the bits left by one place, then add the new bit with OR.</p>,
            code: `function getDecimalValue(head) {
  let n = 0;
  for (let cur = head; cur !== null; cur = cur.next) n = (n << 1) | cur.val;
  return n;
}

console.log(getDecimalValue(fromArray([1, 0, 1, 1]))); // 11`,
            explain: <p>The cost is the same. <code>n &lt;&lt; 1</code> means the same as <code>n * 2</code>. (JavaScript bit operations work on 32-bit numbers, which is enough here because the list has at most 30 bits. Part 15 covers bit tricks.)</p>,
          },
        ]}
        compare={<p>(LeetCode 1290.)</p>}
      >
        <p>A linked list holds the bits of a binary number (a number written with only 0 and 1). The first bit is the biggest one. Return its normal decimal value.</p>
      </Problem>

      <DryRun
        title="Link changes for the common edits"
        cols={["Edit", "Link changes", "Watch out for"]}
        rows={[
          ["insert after p", "new.next = p.next; p.next = new", "do not swap these two lines"],
          ["delete after p", "p.next = p.next.next", "p.next may be null"],
          ["delete the head", "head = head.next", "use a dummy head to avoid this case"],
          ["delete a node given only itself", "copy next.val, skip next", "fails on the tail"],
          ["swap two adjacent nodes", "three link changes", "save a reference before you overwrite a link"],
        ]}
      />
    </>
  );
}
