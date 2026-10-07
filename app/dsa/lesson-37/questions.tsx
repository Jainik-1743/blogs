import Problem from "@/components/dsa/Problem";

/** Lesson 37 practice questions: merging, gaps, cycles and sorting lists. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Merge two sorted lists"
        level="Easy"
        examples={[
          { input: "[1, 2, 4] and [1, 3, 4]", output: "[1, 1, 2, 3, 4, 4]", why: "Always take the smaller front node." },
          { input: "[] and [0]", output: "[0]", why: "An empty list adds nothing." },
        ]}
        hints={[
          <>Compare the two front nodes and attach the smaller one. A dummy head (a fake first node) means the first node needs no special handling.</>,
          <>When one list ends, you can attach the whole of the other list.</>,
        ]}
        approaches={[
          {
            name: "Iterative with a dummy head",
            idea: <p>Keep a <code>tail</code>. Attach the smaller front node, move that list forward, and move <code>tail</code> forward. At the end, attach whatever is left.</p>,
            code: `function mergeTwoLists(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (a !== null && b !== null) {
    if (a.val <= b.val) { tail.next = a; a = a.next; }
    else { tail.next = b; b = b.next; }
    tail = tail.next;
  }
  tail.next = a !== null ? a : b;
  return dummy.next;
}

console.log(toArray(mergeTwoLists(fromArray([1, 2, 4]), fromArray([1, 3, 4])))); // [1, 1, 2, 3, 4, 4]
console.log(toArray(mergeTwoLists(fromArray([]), fromArray([0]))));              // [0]`,
            explain: <p>O(m + n) time, O(1) space.</p>,
          },
          {
            name: "Recursive",
            idea: <p>The smaller head stays at the front. Its <code>next</code> becomes the merge of the rest.</p>,
            code: `function mergeTwoLists(a, b) {
  if (a === null) return b;
  if (b === null) return a;
  if (a.val <= b.val) { a.next = mergeTwoLists(a.next, b); return a; }
  b.next = mergeTwoLists(a, b.next);
  return b;
}

console.log(toArray(mergeTwoLists(fromArray([1, 2, 4]), fromArray([1, 3, 4])))); // [1, 1, 2, 3, 4, 4]`,
            explain: <p>The code is very short, but it uses O(m + n) stack space (memory for unfinished function calls).</p>,
          },
        ]}
        compare={<p>Use the loop version for real-world code. The recursive version is a good second answer. (LeetCode 21.)</p>}
      >
        <p>Join two sorted linked lists into one sorted list by changing the links of their nodes. Return its head.</p>
      </Problem>

      <Problem
        n={2}
        title="Linked list cycle II"
        level="Medium"
        examples={[
          { input: "[3, 2, 0, -4], tail points to the node with value 2", output: "node 2", why: "The loop starts at the second node." },
          { input: "[1, 2], no loop", output: "null", why: "There is no cycle." },
        ]}
        hints={[
          <>First, use slow and fast pointers to check that a cycle exists. The place where they meet is somewhere inside the loop.</>,
          <>Start one pointer at the head and one at the meeting point. Move them at the same speed. They meet at the start of the loop.</>,
        ]}
        approaches={[
          {
            name: "Set of visited nodes",
            idea: <p>The first node that you reach a second time is the start of the cycle.</p>,
            code: `function detectCycle(head) {
  const seen = new Set();
  for (let c = head; c !== null; c = c.next) {
    if (seen.has(c)) return c;
    seen.add(c);
  }
  return null;
}

const a = fromArray([3, 2, 0, -4]);
a.next.next.next.next = a.next;
console.log(detectCycle(a).val);          // 2
console.log(detectCycle(fromArray([1]))); // null`,
            explain: <p>O(n) time and O(n) space.</p>,
          },
          {
            name: "Floyd's two phases",
            idea: (
              <ol>
                <li>Move slow and fast until they meet. If they never meet, there is no cycle.</li>
                <li>Start a pointer at the head. Move it and slow one step at a time until they are at the same node.</li>
              </ol>
            ),
            code: `function detectCycle(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      let p = head;
      while (p !== slow) { p = p.next; slow = slow.next; }
      return p;
    }
  }
  return null;
}

const a = fromArray([3, 2, 0, -4]);
a.next.next.next.next = a.next;
console.log(detectCycle(a).val); // 2`,
            explain: <p>O(n) time, O(1) space. The distance from the head to the loop start is the same as the distance from the meeting point to the loop start, if you ignore whole laps around the loop. (The proof is in the lesson.)</p>,
          },
        ]}
        compare={<p>Start with the Set. Switch to Floyd&apos;s version when the interviewer asks for O(1) space. (LeetCode 142.)</p>}
      >
        <p>Return the node where the cycle begins, or <code>null</code> if there is no cycle.</p>
      </Problem>

      <Problem
        n={3}
        title="Remove Nth node from end of list"
        level="Medium"
        examples={[
          { input: "[1, 2, 3, 4, 5], n = 2", output: "[1, 2, 3, 5]", why: "4 is the second node from the end." },
          { input: "[1], n = 1", output: "[]", why: "The only node is removed." },
          { input: "[1, 2], n = 2", output: "[2]", why: "The head is removed." },
        ]}
        hints={[
          <>Removing the head must work too. Which trick makes the head act like any other node?</>,
          <>If one pointer is n nodes ahead of another, where is the second pointer when the first one reaches the end?</>,
        ]}
        approaches={[
          {
            name: "Two passes",
            idea: <p>Count the length L. Then walk <code>L − n</code> steps from the dummy to the node just before the one to delete.</p>,
            code: `function removeNthFromEnd(head, n) {
  let len = 0;
  for (let c = head; c !== null; c = c.next) len++;
  const dummy = new ListNode(0, head);
  let prev = dummy;
  for (let i = 0; i < len - n; i++) prev = prev.next;
  prev.next = prev.next.next;
  return dummy.next;
}

console.log(toArray(removeNthFromEnd(fromArray([1, 2, 3, 4, 5]), 2))); // [1, 2, 3, 5]
console.log(toArray(removeNthFromEnd(fromArray([1, 2]), 2)));          // [2]`,
            explain: <p>O(n) time, O(1) space, but you walk the list twice.</p>,
          },
          {
            name: "One pass with a gap",
            idea: <p>Move <code>fast</code> n steps ahead. Then move both pointers until <code>fast</code> is on the last node.</p>,
            code: `function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let fast = dummy, slow = dummy;
  for (let i = 0; i < n; i++) fast = fast.next;
  while (fast.next !== null) { fast = fast.next; slow = slow.next; }
  slow.next = slow.next.next;
  return dummy.next;
}

console.log(toArray(removeNthFromEnd(fromArray([1, 2, 3, 4, 5]), 2))); // [1, 2, 3, 5]
console.log(toArray(removeNthFromEnd(fromArray([1]), 1)));             // []`,
            explain: <p>Same cost, but you walk the list only once. The dummy makes deleting the head work like any other case.</p>,
          },
        ]}
        compare={<p>Both are fine. The one-pass version is the answer interviewers expect. (LeetCode 19.)</p>}
      >
        <p>Remove the n-th node counted from the end of the list and return the head. Assume n is valid.</p>
      </Problem>

      <Problem
        n={4}
        title="Intersection of two linked lists"
        level="Easy"
        examples={[
          { input: "A = 1→2→8→9, B = 5→8→9 (8 is the same node)", output: "node 8", why: "Both lists share the tail 8→9." },
          { input: "A = 1, B = 2 (separate)", output: "null", why: "No shared node." },
        ]}
        hints={[
          <>&quot;Shared&quot; means the same node object, not just the same value.</>,
          <>If both lists had the same length, you could walk them together. How can you make them the same length?</>,
        ]}
        approaches={[
          {
            name: "Set of nodes from A",
            idea: <p>Put every node of A in a Set. Then walk B and return the first node that is in the Set.</p>,
            code: `function getIntersectionNode(a, b) {
  const seen = new Set();
  for (let c = a; c !== null; c = c.next) seen.add(c);
  for (let c = b; c !== null; c = c.next) if (seen.has(c)) return c;
  return null;
}

const shared = fromArray([8, 9]);
const x = new ListNode(1, new ListNode(2, shared));
const y = new ListNode(5, shared);
console.log(getIntersectionNode(x, y).val); // 8`,
            explain: <p>O(m + n) time, O(m) space.</p>,
          },
          {
            name: "Switch lists at the end",
            idea: <p>Walk <code>p</code> along A and then B. Walk <code>q</code> along B and then A. Both walk m + n nodes, so they reach the shared node together (or both reach <code>null</code>).</p>,
            code: `function getIntersectionNode(a, b) {
  let p = a, q = b;
  while (p !== q) {
    p = p === null ? b : p.next;
    q = q === null ? a : q.next;
  }
  return p;
}

const shared = fromArray([8, 9]);
const x = new ListNode(1, new ListNode(2, shared));
const y = new ListNode(5, shared);
console.log(getIntersectionNode(x, y).val);                       // 8
console.log(getIntersectionNode(fromArray([1]), fromArray([2]))); // null`,
            explain: <p>O(m + n) time, O(1) space. The difference in length cancels out. Each pointer walks the other list&apos;s extra length on its second trip.</p>,
          },
        ]}
        compare={<p>The switching trick is the best answer. The Set version is a safe first answer. (LeetCode 160.)</p>}
      >
        <p>Return the node where two singly linked lists start to share nodes. If they share none, return <code>null</code>.</p>
      </Problem>

      <Problem
        n={5}
        title="Add two numbers"
        level="Medium"
        examples={[
          { input: "[2, 4, 3] + [5, 6, 4]", output: "[7, 0, 8]", why: "342 + 465 = 807. The digits are stored in reverse order." },
          { input: "[9, 9] + [1]", output: "[0, 0, 1]", why: "99 + 1 = 100. The last carry needs a new node." },
        ]}
        hints={[
          <>The digits are stored with the ones digit first. That is the same order you use when you add by hand.</>,
          <>Keep looping while either list still has a node, or while there is a carry left.</>,
        ]}
        approaches={[
          {
            name: "Digit by digit with a carry",
            idea: <p>At each position, add both digits (use 0 if a list has no digit left) and the carry. Store <code>sum % 10</code> (the last digit of the sum). The new carry is <code>floor(sum / 10)</code> (the sum divided by 10, rounded down).</p>,
            code: `function addTwoNumbers(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy, carry = 0;
  while (a !== null || b !== null || carry > 0) {
    const sum = (a ? a.val : 0) + (b ? b.val : 0) + carry;
    tail.next = new ListNode(sum % 10);
    carry = Math.floor(sum / 10);
    tail = tail.next;
    if (a) a = a.next;
    if (b) b = b.next;
  }
  return dummy.next;
}

console.log(toArray(addTwoNumbers(fromArray([2, 4, 3]), fromArray([5, 6, 4])))); // [7, 0, 8]
console.log(toArray(addTwoNumbers(fromArray([9, 9]), fromArray([1]))));          // [0, 0, 1]`,
            explain: <p>O(max(m, n)) time (the length of the longer list). It never turns the list into a number. So it works for lists much longer than the 15 or so digits that a JavaScript number can hold exactly.</p>,
          },
          {
            name: "Convert to BigInt",
            idea: <p>Read each list into a <code>BigInt</code> (a JavaScript type for very large whole numbers). Add them, then split the result back into a list. It is easy to write, but it skips the point of the question.</p>,
            code: `function toBig(head) {
  let digits = "";
  for (let c = head; c !== null; c = c.next) digits = c.val + digits;
  return BigInt(digits);
}
function addTwoNumbers(a, b) {
  const total = (toBig(a) + toBig(b)).toString();
  const dummy = new ListNode(0);
  let tail = dummy;
  for (let i = total.length - 1; i >= 0; i--) { tail.next = new ListNode(Number(total[i])); tail = tail.next; }
  return dummy.next;
}

console.log(toArray(addTwoNumbers(fromArray([2, 4, 3]), fromArray([5, 6, 4])))); // [7, 0, 8]`,
            explain: <p>It gives the right answer, but interviewers expect the carry loop, and this version builds large strings. Use it only to double-check your answer.</p>,
          },
        ]}
        compare={<p>Use the carry loop. (LeetCode 2.)</p>}
      >
        <p>Each list is a number that is zero or more, with one digit per node and the ones digit first. Return their sum as a list in the same form.</p>
      </Problem>

      <Problem
        n={6}
        title="Sort list"
        level="Medium"
        examples={[
          { input: "[4, 2, 1, 3]", output: "[1, 2, 3, 4]", why: "The list is sorted from smallest to largest." },
          { input: "[-1, 5, 3, 4, 0]", output: "[-1, 0, 3, 4, 5]", why: "Negative numbers work in the same way." },
        ]}
        hints={[
          <>Which sort does not need random access (jumping straight to any position) or extra space for the merge step?</>,
          <>Split the list with slow and fast pointers. Then cut the link between the two halves.</>,
        ]}
        approaches={[
          {
            name: "Copy to an array, sort, copy back",
            idea: <p>Read the values, sort them with <code>sort((x, y) =&gt; x - y)</code>, and write them back into the nodes.</p>,
            code: `function sortList(head) {
  const vals = [];
  for (let c = head; c !== null; c = c.next) vals.push(c.val);
  vals.sort((x, y) => x - y);
  let i = 0;
  for (let c = head; c !== null; c = c.next) c.val = vals[i++];
  return head;
}

console.log(toArray(sortList(fromArray([4, 2, 1, 3])))); // [1, 2, 3, 4]`,
            explain: <p>O(n log n) time, O(n) space. It is fine in real code, but it does not show that you can work with lists.</p>,
          },
          {
            name: "Merge sort on the list",
            idea: <p>Split the list in the middle. Sort each half with recursion (the function calls itself). Then merge the two sorted halves.</p>,
            code: `function merge(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (a !== null && b !== null) {
    if (a.val <= b.val) { tail.next = a; a = a.next; } else { tail.next = b; b = b.next; }
    tail = tail.next;
  }
  tail.next = a !== null ? a : b;
  return dummy.next;
}
function sortList(head) {
  if (head === null || head.next === null) return head;
  let slow = head, fast = head.next;
  while (fast !== null && fast.next !== null) { slow = slow.next; fast = fast.next.next; }
  const second = slow.next;
  slow.next = null;
  return merge(sortList(head), sortList(second));
}

console.log(toArray(sortList(fromArray([-1, 5, 3, 4, 0])))); // [-1, 0, 3, 4, 5]`,
            explain: <p>O(n log n) time. The recursion goes O(log n) levels deep. A bottom-up version (it merges groups of size 1, 2, 4, and so on, with no recursion) needs only O(1) extra space.</p>,
          },
        ]}
        compare={<p>Use merge sort. (LeetCode 148.)</p>}
      >
        <p>Sort a linked list from smallest to largest in O(n log n) time.</p>
      </Problem>

      <Problem
        n={7}
        title="Reorder list"
        level="Medium"
        examples={[
          { input: "[1, 2, 3, 4]", output: "[1, 4, 2, 3]", why: "Take one from the front, then one from the back, and so on: 1, 4, 2, 3." },
          { input: "[1, 2, 3, 4, 5]", output: "[1, 5, 2, 4, 3]", why: "Take 1, 5, 2, 4, and then the middle node 3 is left." },
        ]}
        hints={[
          <>This question uses three earlier ideas one after another. Find the middle, reverse the second half, and then merge by taking one node from each half in turn.</>,
        ]}
        approaches={[
          {
            name: "Array of nodes with two pointers",
            idea: <p>Store the nodes in an array. Then link them again, working from both ends towards the middle.</p>,
            code: `function reorderList(head) {
  const nodes = [];
  for (let c = head; c !== null; c = c.next) nodes.push(c);
  let i = 0, j = nodes.length - 1;
  while (i < j) {
    nodes[i].next = nodes[j];
    i++;
    if (i === j) break;
    nodes[j].next = nodes[i];
    j--;
  }
  nodes[i].next = null;
}

const h = fromArray([1, 2, 3, 4, 5]);
reorderList(h);
console.log(toArray(h)); // [1, 5, 2, 4, 3]`,
            explain: <p>O(n) time, O(n) space. The last line is the important one. Without it, the final node still points at its old neighbour, and the list becomes a cycle.</p>,
          },
          {
            name: "Middle + reverse + interleave",
            idea: (
              <ol>
                <li>Find the end of the first half and cut the list at that point.</li>
                <li>Reverse the second half.</li>
                <li>Take one node from each half in turn (interleave them).</li>
              </ol>
            ),
            code: `function reorderList(head) {
  if (head === null || head.next === null) return;
  let slow = head, fast = head;
  while (fast.next !== null && fast.next.next !== null) { slow = slow.next; fast = fast.next.next; }
  let prev = null, cur = slow.next;
  slow.next = null;
  while (cur !== null) { const next = cur.next; cur.next = prev; prev = cur; cur = next; }
  let a = head, b = prev;
  while (b !== null) {
    const an = a.next, bn = b.next;
    a.next = b;
    b.next = an;
    a = an;
    b = bn;
  }
}

const h = fromArray([1, 2, 3, 4]);
reorderList(h);
console.log(toArray(h)); // [1, 4, 2, 3]
const g = fromArray([1, 2, 3, 4, 5]);
reorderList(g);
console.log(toArray(g)); // [1, 5, 2, 4, 3]`,
            explain: <p>O(n) time, O(1) space. The first half is never shorter than the second. So when the length is odd, the list ends with its middle node after interleaving.</p>,
          },
        ]}
        compare={<p>The array version is a good first answer. The three-step version is the follow-up. (LeetCode 143.)</p>}
      >
        <p>Reorder <code>L0 → L1 → … → Ln</code> into <code>L0 → Ln → L1 → Ln−1 → …</code> by changing the links of the nodes in place (no new nodes).</p>
      </Problem>
    </>
  );
}
