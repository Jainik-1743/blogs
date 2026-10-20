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
          <>Before you change a node&apos;s <code>next</code>, save where the rest of the list is.</>,
          <>Keep a <code>prev</code> that starts as <code>null</code>. The first node must end up pointing at <code>null</code>.</>,
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
            explain: <p>O(n) time, O(1) space. You visit each node once, and only the arrows change.</p>,
          },
          {
            name: "Recursion",
            idea: <p>Reverse the rest of the list (everything after the head). Then make the old second node point back at the head. Last, cut the head&apos;s own link.</p>,
            code: `function reverseList(head) {
  if (head === null || head.next === null) return head;
  const newHead = reverseList(head.next);
  head.next.next = head;
  head.next = null;
  return newHead;
}

console.log(toArray(reverseList(fromArray([1, 2, 3, 4, 5])))); // [5, 4, 3, 2, 1]`,
            explain: <p>O(n) time, but also O(n) call-stack space (the memory that holds unfinished function calls). A list of 100,000 nodes can overflow the stack in JavaScript.</p>,
          },
          {
            name: "Copy values into an array",
            idea: <p>Read the values into an array. Then write them back in reverse order. It is easy, but it changes the values instead of moving the nodes.</p>,
            code: `function reverseList(head) {
  const vals = [];
  for (let c = head; c !== null; c = c.next) vals.push(c.val);
  for (let c = head; c !== null; c = c.next) c.val = vals.pop();
  return head;
}

console.log(toArray(reverseList(fromArray([1, 2, 3])))); // [3, 2, 1]`,
            explain: <p>O(n) time and O(n) space. This is fine as a first answer. But the interviewer will almost always ask next, &quot;now do it in O(1) space&quot;.</p>,
          },
        ]}
        compare={<p>Use the loop version. Also know the recursive version and its stack cost. (LeetCode 206.)</p>}
      >
        <p>Given the head of a singly linked list, reverse the list and return the new head.</p>
      </Problem>

      <Problem
        n={2}
        title="Middle of the linked list"
        level="Easy"
        examples={[
          { input: "head = [1, 2, 3, 4, 5]", output: "node 3", why: "There are five nodes, so the third one is in the middle." },
          { input: "head = [1, 2, 3, 4, 5, 6]", output: "node 4", why: "Two middles (3 and 4): return the second." },
        ]}
        hints={[
          <>Counting the nodes works, but it takes two passes. Can two pointers moving at different speeds do it in one pass?</>,
        ]}
        approaches={[
          {
            name: "Count, then walk",
            idea: <p>Pass 1 counts the nodes (n). Pass 2 walks <code>floor(n / 2)</code> steps (floor rounds down to a whole number).</p>,
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
            idea: <p>Each round, move <code>slow</code> one step and <code>fast</code> two steps. When fast reaches the end, slow is in the middle.</p>,
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
            explain: <p>Same O(n) time and O(1) space, but in one pass. You will reuse this loop in almost every slow and fast pointer problem.</p>,
          },
        ]}
        compare={<p>Either one is accepted. The slow and fast version is what the question wants to see. (LeetCode 876.)</p>}
      >
        <p>Return the middle node of a linked list. If there are two middle nodes, return the second one.</p>
      </Problem>

      <Problem
        n={3}
        title="Linked list cycle"
        level="Easy"
        examples={[
          { input: "[3, 2, 0, -4], last node points back to the node with value 2", output: "true", why: "If you walk from the head, you never reach null." },
          { input: "[1, 2], no loop", output: "false", why: "The walk ends at null." },
        ]}
        hints={[
          <>If you ever see the same node twice, there is a loop. How can you remember the nodes you have seen?</>,
          <>To use no extra memory, think of two runners on a round track.</>,
        ]}
        approaches={[
          {
            name: "Remember visited nodes",
            idea: <p>Keep a <code>Set</code> (a collection with no repeats) of nodes. If the next node is already in it, there is a cycle. (Nodes are objects, so the Set checks whether it is the very same node, not just the same value.)</p>,
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
            idea: <p>Slow moves 1 step and fast moves 2 steps. Inside a cycle, fast gets one step closer to slow each round. So it must meet slow.</p>,
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
            explain: <p>O(n) time, O(1) space. Compare the nodes with <code>===</code>, not their values. Two different nodes can hold the same value.</p>,
          },
        ]}
        compare={<p>Floyd&apos;s version is best. If you are not sure, start with the Set version and then improve it. (LeetCode 141.)</p>}
      >
        <p>Return <code>true</code> if the linked list contains a cycle.</p>
      </Problem>

      <Problem
        n={4}
        title="Palindrome linked list"
        level="Easy"
        examples={[
          { input: "head = [1, 2, 2, 1]", output: "true", why: "It reads the same forwards and backwards." },
          { input: "head = [1, 2]", output: "false", why: "1, 2 reversed is 2, 1." },
        ]}
        hints={[
          <>You cannot read a singly linked list backwards. What can you do with one half of the list to fix that?</>,
        ]}
        approaches={[
          {
            name: "Copy to an array",
            idea: <p>Put the values in an array. Then compare them with two pointers, one from each end, moving towards the middle.</p>,
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
                <li>Find the middle with slow and fast pointers.</li>
                <li>Reverse the list from the middle onwards.</li>
                <li>Walk from the head and from the reversed half at the same time, and compare the values.</li>
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
            explain: <p>O(n) time, O(1) space. When the length is odd, the middle node ends up in the reversed half. The comparison stops when the reversed half is used up, so the middle node is only compared with itself.</p>,
          },
        ]}
        compare={<p>The array copy is a good first answer. Then offer the O(1)-space version as the improvement, and say that it changes the list. (LeetCode 234.)</p>}
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
          <>The section can start at the head. So put a dummy node (an extra fake node) in front.</>,
          <>Walk to the node just <em>before</em> position <code>left</code>. From there, you change the links inside the section.</>,
        ]}
        approaches={[
          {
            name: "Reverse the section, then reconnect",
            idea: (
              <ol>
                <li>Walk to <code>before</code>, the node in front of the section.</li>
                <li>Reverse <code>right − left + 1</code> nodes with the normal loop.</li>
                <li>Reconnect the pieces: link <code>before</code> to the new section head, and link the old section head to the node that came after the section.</li>
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
            explain: <p>O(n) time, O(1) space. It uses the reverse loop you already know.</p>,
          },
          {
            name: "Move nodes to the front one at a time",
            idea: <p>Keep <code>start</code> where it is. Again and again, take the node after it and put it right after <code>before</code>.</p>,
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
            explain: <p>Same cost. It makes a single pass over the section and needs no final reconnect step. The downside is that it is easy to put the four assignments in the wrong order.</p>,
          },
        ]}
        compare={<p>The first one is easier to get right when you are under pressure. (LeetCode 92.)</p>}
      >
        <p>Reverse the nodes at positions <code>left</code> to <code>right</code> (1-based) and return the head.</p>
      </Problem>

      <Problem
        n={6}
        title="Swap nodes in pairs"
        level="Medium"
        examples={[
          { input: "head = [1, 2, 3, 4]", output: "[2, 1, 4, 3]", why: "Swap (1, 2) and (3, 4) by changing links, not values." },
          { input: "head = [1, 2, 3]", output: "[2, 1, 3]", why: "The last node has no partner, so it stays where it is." },
        ]}
        hints={[
          <>You may change only the links. Use a dummy head and a <code>prev</code> pointer that sits just before each pair.</>,
        ]}
        approaches={[
          {
            name: "Iterate with a dummy head",
            idea: (
              <ol>
                <li><code>prev</code> sits just before a pair. Set <code>a = prev.next</code> and <code>b = a.next</code>.</li>
                <li>Change the links so the order becomes <code>prev → b → a → (rest)</code>.</li>
                <li>Move <code>prev</code> to <code>a</code>, which is now the second node of the pair.</li>
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
            idea: <p>Swap the first two nodes. Let the recursion handle the rest of the list, starting from the third node.</p>,
            code: `function swapPairs(head) {
  if (head === null || head.next === null) return head;
  const second = head.next;
  head.next = swapPairs(second.next);
  second.next = head;
  return second;
}

console.log(toArray(swapPairs(fromArray([1, 2, 3, 4])))); // [2, 1, 4, 3]`,
            explain: <p>The code is shorter, but it uses O(n) stack space.</p>,
          },
        ]}
        compare={<p>Use the loop. The question usually does not allow swapping values (<code>a.val</code> with <code>b.val</code>). (LeetCode 24.)</p>}
      >
        <p>Swap every two nodes that sit next to each other, and return the head. Do not change the values inside the nodes. Change only the links.</p>
      </Problem>

      <Problem
        n={7}
        title="Happy number"
        level="Easy"
        examples={[
          { input: "n = 19", output: "true", why: "1²+9²=82, 8²+2²=68, 6²+8²=100, 1²+0²+0²=1." },
          { input: "n = 2", output: "false", why: "The numbers go round in a loop and never reach 1." },
        ]}
        hints={[
          <>Replace the number with the sum of the squares of its digits, again and again. The result either reaches 1 or goes round in a loop. That is like a linked list that may have a cycle.</>,
        ]}
        approaches={[
          {
            name: "Set of seen numbers",
            idea: <p>Keep making the next number. If it is 1, return true. If you have seen it before, you are in a loop, so return false.</p>,
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
            explain: <p>The numbers cannot keep growing. For a large n, the sum of the digit squares is much smaller than n. So the Set stays small.</p>,
          },
          {
            name: "Floyd's slow and fast",
            idea: <p>Think of the sequence as a &quot;list&quot; where each number points to the next one. Run slow and fast along it. If they meet at 1, the number is happy. If they meet anywhere else, it is a loop.</p>,
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
            explain: <p>O(1) extra space. The lesson of this question: slow and fast pointers work on any sequence where &quot;next = f(current)&quot; (the next item comes from a rule applied to the current item), not just on linked lists. (LeetCode 202.)</p>,
          },
        ]}
        compare={<p>The Set is fine. Also mention Floyd&apos;s version as the option that needs only O(1) space.</p>}
      >
        <p>A <em>happy number</em> is a number that reaches 1 by the process below. Again and again, replace <code>n</code> with the sum of the squares of its digits. Return <code>true</code> if it reaches 1. Return <code>false</code> if it loops forever.</p>
      </Problem>
    </>
  );
}
