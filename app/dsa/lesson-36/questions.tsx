import Problem from "@/components/dsa/Problem";

/** Lesson 36 practice questions: reversing and fast/slow pointers. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Reverse linked list"
        level="Easy"
        examples={[
          { input: "head = [1, 2, 3, 4, 5]", output: "[5, 4, 3, 2, 1]", why: "Every arrow is turned around." },
          { input: "head = [1, 2]", output: "[2, 1]", why: "Two nodes swap roles." },
          { input: "head = []", output: "[]", why: "An empty list stays empty." },
        ]}
        hints={[
          <>You need to remember where the rest of the list is before you change a node&apos;s <code>next</code>.</>,
          <>Keep a <code>prev</code> that starts as <code>null</code>: the first node must end up pointing at <code>null</code>.</>,
        ]}
        approaches={[
          {
            name: "Iterate with prev / cur / next",
            idea: (
              <ol>
                <li>Start <code>prev = null</code>, <code>cur = head</code>.</li>
                <li>Save <code>next = cur.next</code>, point <code>cur.next</code> at <code>prev</code>.</li>
                <li>Move <code>prev</code> and <code>cur</code> forward. When <code>cur</code> is null, <code>prev</code> is the new head.</li>
              </ol>
            ),
            code: `function reverseList(head) {
  let prev = null, cur = head;
  while (cur !== null) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}

console.log(toArray(reverseList(fromArray([1, 2, 3, 4, 5])))); // [5, 4, 3, 2, 1]
console.log(toArray(reverseList(fromArray([1, 2]))));          // [2, 1]
console.log(toArray(reverseList(null)));                       // []`,
            explain: <p>O(n) time, O(1) space. Each node is visited once and only arrows change.</p>,
          },
          {
            name: "Recursion",
            idea: <p>Reverse the tail, then make the old second node point back at the head and cut the head&apos;s own link.</p>,
            code: `function reverseList(head) {
  if (head === null || head.next === null) return head;
  const newHead = reverseList(head.next);
  head.next.next = head;
  head.next = null;
  return newHead;
}

console.log(toArray(reverseList(fromArray([1, 2, 3, 4, 5])))); // [5, 4, 3, 2, 1]`,
            explain: <p>O(n) time but O(n) call-stack space; a list of 100,000 nodes can overflow the stack in JavaScript.</p>,
          },
          {
            name: "Copy values into an array",
            idea: <p>Read the values into an array, then write them back in reverse order. It is easy, but it rewrites values instead of rearranging nodes.</p>,
            code: `function reverseList(head) {
  const vals = [];
  for (let c = head; c !== null; c = c.next) vals.push(c.val);
  for (let c = head; c !== null; c = c.next) c.val = vals.pop();
  return head;
}

console.log(toArray(reverseList(fromArray([1, 2, 3])))); // [3, 2, 1]`,
            explain: <p>O(n) time and O(n) space. Fine as a first answer, but the interviewer almost always follows with &quot;now do it in O(1) space&quot;.</p>,
          },
        ]}
        compare={<p>The iterative one. Know the recursive one and its stack cost. (LeetCode 206.)</p>}
      >
        <p>Given the head of a singly linked list, reverse the list and return the new head.</p>
      </Problem>

      <Problem
        n={2}
        title="Middle of the linked list"
        level="Easy"
        examples={[
          { input: "head = [1, 2, 3, 4, 5]", output: "node 3", why: "Five nodes: the third is in the middle." },
          { input: "head = [1, 2, 3, 4, 5, 6]", output: "node 4", why: "Two middles (3 and 4): return the second." },
        ]}
        hints={[
          <>Counting the nodes works but takes two passes. Can two cursors at different speeds do it in one?</>,
        ]}
        approaches={[
          {
            name: "Count, then walk",
            idea: <p>Pass 1 counts the nodes n. Pass 2 walks <code>floor(n / 2)</code> steps.</p>,
            code: `function middleNode(head) {
  let n = 0;
  for (let c = head; c !== null; c = c.next) n++;
  let mid = head;
  for (let i = 0; i < Math.floor(n / 2); i++) mid = mid.next;
  return mid;
}

console.log(middleNode(fromArray([1, 2, 3, 4, 5])).val);    // 3
console.log(middleNode(fromArray([1, 2, 3, 4, 5, 6])).val); // 4`,
            explain: <p>O(n) time, O(1) space, two passes.</p>,
          },
          {
            name: "Slow and fast pointers",
            idea: <p>Move <code>slow</code> one step and <code>fast</code> two steps per round. When fast runs out, slow is in the middle.</p>,
            code: `function middleNode(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}

console.log(middleNode(fromArray([1, 2, 3, 4, 5])).val);    // 3
console.log(middleNode(fromArray([1, 2, 3, 4, 5, 6])).val); // 4`,
            explain: <p>Same O(n) / O(1), one pass. The shape of this loop is reused in almost every fast/slow problem.</p>,
          },
        ]}
        compare={<p>Either is accepted; the fast/slow version is what the question is checking you know. (LeetCode 876.)</p>}
      >
        <p>Return the middle node of a linked list. If there are two middle nodes, return the second one.</p>
      </Problem>

      <Problem
        n={3}
        title="Linked list cycle"
        level="Easy"
        examples={[
          { input: "[3, 2, 0, -4], last node points back to the node with value 2", output: "true", why: "Walking from the head never reaches null." },
          { input: "[1, 2], no loop", output: "false", why: "The walk ends at null." },
        ]}
        hints={[
          <>If you ever see the same node twice, there is a loop. How can you remember nodes you have seen?</>,
          <>To use no extra memory, think of two runners on a circular track.</>,
        ]}
        approaches={[
          {
            name: "Remember visited nodes",
            idea: <p>Keep a <code>Set</code> of nodes. If the next node is already in it, there is a cycle. (Nodes are objects, so the Set compares them by identity.)</p>,
            code: `function hasCycle(head) {
  const seen = new Set();
  for (let c = head; c !== null; c = c.next) {
    if (seen.has(c)) return true;
    seen.add(c);
  }
  return false;
}

const a = fromArray([3, 2, 0, -4]);
console.log(hasCycle(a));        // false
a.next.next.next.next = a.next;  // -4 points back at 2
console.log(hasCycle(a));        // true`,
            explain: <p>O(n) time, O(n) space.</p>,
          },
          {
            name: "Floyd's tortoise and hare",
            idea: <p>Slow moves 1, fast moves 2. In a cycle fast closes the gap by one per round and must meet slow.</p>,
            code: `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

const a = fromArray([3, 2, 0, -4]);
a.next.next.next.next = a.next;
console.log(hasCycle(a));                 // true
console.log(hasCycle(fromArray([1, 2]))); // false`,
            explain: <p>O(n) time, O(1) space. Compare nodes with <code>===</code>, not values: two different nodes can hold the same value.</p>,
          },
        ]}
        compare={<p>Floyd&apos;s. Start with the Set version if you are unsure, then improve it. (LeetCode 141.)</p>}
      >
        <p>Return <code>true</code> if the linked list contains a cycle.</p>
      </Problem>

      <Problem
        n={4}
        title="Palindrome linked list"
        level="Easy"
        examples={[
          { input: "head = [1, 2, 2, 1]", output: "true", why: "Reads the same both ways." },
          { input: "head = [1, 2]", output: "false", why: "1, 2 reversed is 2, 1." },
        ]}
        hints={[
          <>A singly linked list cannot be read backwards. What can you do with one half to fix that?</>,
        ]}
        approaches={[
          {
            name: "Copy to an array",
            idea: <p>Put the values in an array and compare with two pointers moving inwards.</p>,
            code: `function isPalindrome(head) {
  const vals = [];
  for (let c = head; c !== null; c = c.next) vals.push(c.val);
  for (let i = 0, j = vals.length - 1; i < j; i++, j--) {
    if (vals[i] !== vals[j]) return false;
  }
  return true;
}

console.log(isPalindrome(fromArray([1, 2, 2, 1]))); // true
console.log(isPalindrome(fromArray([1, 2])));       // false`,
            explain: <p>O(n) time, O(n) space.</p>,
          },
          {
            name: "Reverse the second half",
            idea: (
              <ol>
                <li>Find the middle with slow/fast pointers.</li>
                <li>Reverse the list from the middle onwards.</li>
                <li>Walk from the head and from the reversed half together and compare.</li>
              </ol>
            ),
            code: `function isPalindrome(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) { slow = slow.next; fast = fast.next.next; }
  let prev = null, cur = slow;
  while (cur !== null) { const next = cur.next; cur.next = prev; prev = cur; cur = next; }
  for (let a = head, b = prev; b !== null; a = a.next, b = b.next) {
    if (a.val !== b.val) return false;
  }
  return true;
}

console.log(isPalindrome(fromArray([1, 2, 3, 2, 1]))); // true
console.log(isPalindrome(fromArray([1, 2, 3])));       // false`,
            explain: <p>O(n) time, O(1) space. For an odd length the middle node ends up in the reversed half, and the comparison simply stops when the reversed half is used up, so the middle compares only with itself.</p>,
          },
        ]}
        compare={<p>The array copy is a perfectly good first answer; offer the O(1)-space version as the improvement and mention that it modifies the list. (LeetCode 234.)</p>}
      >
        <p>Return <code>true</code> if the values of a linked list read the same forwards and backwards.</p>
      </Problem>

      <Problem
        n={5}
        title="Reverse linked list II"
        level="Medium"
        examples={[
          { input: "head = [1, 2, 3, 4, 5], left = 2, right = 4", output: "[1, 4, 3, 2, 5]", why: "Only positions 2 to 4 are reversed." },
          { input: "head = [5], left = 1, right = 1", output: "[5]", why: "A section of one node is unchanged." },
        ]}
        hints={[
          <>The section can begin at the head, so use a dummy node in front.</>,
          <>Walk to the node just <em>before</em> position <code>left</code>. Everything inside the section is rewired from there.</>,
        ]}
        approaches={[
          {
            name: "Reverse the section, then reconnect",
            idea: (
              <ol>
                <li>Walk to <code>before</code>, the node in front of the section.</li>
                <li>Reverse <code>right − left + 1</code> nodes with the normal loop.</li>
                <li>Reconnect: <code>before</code> to the new section head, and the old section head to what followed.</li>
              </ol>
            ),
            code: `function reverseBetween(head, left, right) {
  const dummy = new ListNode(0, head);
  let before = dummy;
  for (let i = 1; i < left; i++) before = before.next;
  const sectionTail = before.next;           // will be last in the reversed section
  let prev = null, cur = sectionTail;
  for (let i = 0; i < right - left + 1; i++) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  before.next = prev;                        // new head of the section
  sectionTail.next = cur;                    // the rest of the list
  return dummy.next;
}

console.log(toArray(reverseBetween(fromArray([1, 2, 3, 4, 5]), 2, 4))); // [1, 4, 3, 2, 5]
console.log(toArray(reverseBetween(fromArray([5]), 1, 1)));             // [5]`,
            explain: <p>O(n) time, O(1) space. It reuses the reverse loop you already know.</p>,
          },
          {
            name: "Move nodes to the front one at a time",
            idea: <p>Keep <code>start</code> fixed. Repeatedly take the node after it and insert it right after <code>before</code>.</p>,
            code: `function reverseBetween(head, left, right) {
  const dummy = new ListNode(0, head);
  let before = dummy;
  for (let i = 1; i < left; i++) before = before.next;
  const start = before.next;
  for (let i = 0; i < right - left; i++) {
    const moving = start.next;
    start.next = moving.next;
    moving.next = before.next;
    before.next = moving;
  }
  return dummy.next;
}

console.log(toArray(reverseBetween(fromArray([1, 2, 3, 4, 5]), 2, 4))); // [1, 4, 3, 2, 5]`,
            explain: <p>Same cost, a single pass over the section, and no final reconnect step; the trade-off is that the four assignments are easy to order wrongly.</p>,
          },
        ]}
        compare={<p>The first is easier to get right under pressure. (LeetCode 92.)</p>}
      >
        <p>Reverse the nodes at positions <code>left</code> to <code>right</code> (1-based) and return the head.</p>
      </Problem>

      <Problem
        n={6}
        title="Swap nodes in pairs"
        level="Medium"
        examples={[
          { input: "head = [1, 2, 3, 4]", output: "[2, 1, 4, 3]", why: "Swap (1, 2) and (3, 4) by changing links, not values." },
          { input: "head = [1, 2, 3]", output: "[2, 1, 3]", why: "A last unpaired node stays." },
        ]}
        hints={[
          <>You are allowed to change only links. Use a dummy head and a <code>prev</code> sitting before each pair.</>,
        ]}
        approaches={[
          {
            name: "Iterate with a dummy head",
            idea: (
              <ol>
                <li><code>prev</code> sits before a pair; <code>a = prev.next</code>, <code>b = a.next</code>.</li>
                <li>Rewire: <code>prev → b → a → (rest)</code>.</li>
                <li>Move <code>prev</code> to <code>a</code>, now the second node of the pair.</li>
              </ol>
            ),
            code: `function swapPairs(head) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  while (prev.next !== null && prev.next.next !== null) {
    const a = prev.next, b = a.next;
    a.next = b.next;
    b.next = a;
    prev.next = b;
    prev = a;
  }
  return dummy.next;
}

console.log(toArray(swapPairs(fromArray([1, 2, 3, 4])))); // [2, 1, 4, 3]
console.log(toArray(swapPairs(fromArray([1, 2, 3]))));    // [2, 1, 3]
console.log(toArray(swapPairs(null)));                    // []`,
            explain: <p>O(n) time, O(1) space.</p>,
          },
          {
            name: "Recursion",
            idea: <p>Swap the first two, and let the recursion handle the rest of the list from the third node.</p>,
            code: `function swapPairs(head) {
  if (head === null || head.next === null) return head;
  const second = head.next;
  head.next = swapPairs(second.next);
  second.next = head;
  return second;
}

console.log(toArray(swapPairs(fromArray([1, 2, 3, 4])))); // [2, 1, 4, 3]`,
            explain: <p>Shorter, but O(n) stack space.</p>,
          },
        ]}
        compare={<p>The loop. Swapping values (<code>a.val</code> with <code>b.val</code>) is usually forbidden by the question. (LeetCode 24.)</p>}
      >
        <p>Swap every two adjacent nodes and return the head. Do not change the values inside nodes, only the links.</p>
      </Problem>

      <Problem
        n={7}
        title="Happy number"
        level="Easy"
        examples={[
          { input: "n = 19", output: "true", why: "1²+9²=82, 8²+2²=68, 6²+8²=100, 1²+0²+0²=1." },
          { input: "n = 2", output: "false", why: "The sequence enters a loop that never reaches 1." },
        ]}
        hints={[
          <>Replace the number by the sum of the squares of its digits, again and again. It either reaches 1 or loops. That is a linked list with a possible cycle.</>,
        ]}
        approaches={[
          {
            name: "Set of seen numbers",
            idea: <p>Keep generating the next number. If it is 1, return true. If you have seen it before, you are in a loop: return false.</p>,
            code: `function digitSquares(n) {
  let sum = 0;
  while (n > 0) { const d = n % 10; sum += d * d; n = Math.floor(n / 10); }
  return sum;
}

function isHappy(n) {
  const seen = new Set();
  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    n = digitSquares(n);
  }
  return n === 1;
}

console.log(isHappy(19)); // true
console.log(isHappy(2));  // false`,
            explain: <p>The numbers cannot grow forever (for a large n the digit-square sum is far smaller than n), so the Set stays small.</p>,
          },
          {
            name: "Floyd's slow and fast",
            idea: <p>The sequence is a &quot;list&quot; where each number points to the next. Run slow and fast along it: if they meet at 1 it is happy; if they meet anywhere else it loops.</p>,
            code: `function digitSquares(n) {
  let sum = 0;
  while (n > 0) { const d = n % 10; sum += d * d; n = Math.floor(n / 10); }
  return sum;
}

function isHappy(n) {
  let slow = n, fast = digitSquares(n);
  while (fast !== 1 && slow !== fast) {
    slow = digitSquares(slow);
    fast = digitSquares(digitSquares(fast));
  }
  return fast === 1;
}

console.log(isHappy(19)); // true
console.log(isHappy(2));  // false`,
            explain: <p>O(1) extra space. The point of the question: slow/fast pointers apply to any sequence defined by &quot;next = f(current)&quot;, not just linked lists. (LeetCode 202.)</p>,
          },
        ]}
        compare={<p>The Set is fine; mention Floyd&apos;s as the constant-space alternative.</p>}
      >
        <p>Repeatedly replace <code>n</code> by the sum of the squares of its digits. Return <code>true</code> if it reaches 1, <code>false</code> if it loops forever.</p>
      </Problem>
    </>
  );
}
