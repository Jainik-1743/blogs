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

const lesson = getDsaLesson("lesson-36");

export const metadata: Metadata = {
  title: `Lesson 36 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "reverse", label: "Reversing a list" },
  { id: "trace", label: "Traced: reversing 1 → 2 → 3" },
  { id: "recursive", label: "The recursive version" },
  { id: "middle", label: "Slow and fast pointers: the middle" },
  { id: "cycle", label: "Detecting a cycle (Floyd's algorithm)" },
  { id: "why", label: "Why the fast pointer must catch the slow one" },
  { id: "palindrome", label: "Putting it together: palindrome list" },
  { id: "part", label: "Reversing only part of a list" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const reverseCode = `function reverseList(head) {
  let prev = null;
  let cur = head;
  while (cur !== null) {
    const next = cur.next;   // 1. save the rest of the list before we cut the link
    cur.next = prev;         // 2. point this node backwards
    prev = cur;              // 3. prev steps forward
    cur = next;              // 4. cur steps forward
  }
  return prev;               // prev is the new head
}

console.log(toArray(reverseList(fromArray([1, 2, 3, 4])))); // [4, 3, 2, 1]
console.log(toArray(reverseList(fromArray([7]))));          // [7]
console.log(toArray(reverseList(null)));                    // []`;

const traceSrc = `let prev = null, cur = head;
while (cur !== null) {
  const next = cur.next;
  cur.next = prev;
  prev = cur;
  cur = next;
}
return prev;`;

function reverseTrace() {
  const t = tracer();
  const vals = [1, 2, 3];
  // reversed holds the nodes already turned around, newest first (that is the chain starting at prev)
  const reversed: number[] = [];
  const rest = () => vals.slice(reversed.length);
  t.step(1, "start", "prev = null, cur = head", "prev will become the head of the reversed part. cur is the node we are about to turn around.", { reversed: [], rest: rest(), prev: "null", cur: vals[0] });
  for (let i = 0; i < vals.length; i++) {
    const cur = vals[i];
    const next = vals[i + 1];
    const prev = reversed.length ? reversed[0] : "null";
    t.step(2, "check", `cur = ${cur} (not null)`, "There is still a node to turn around.", { reversed: [...reversed], rest: rest(), prev, cur }, "cur");
    t.step(3, "update", `next = ${next === undefined ? "null" : next}`, `Save the rest of the list first. Once ${cur}'s link is changed, this is the only way to find it again.`, { reversed: [...reversed], rest: rest(), prev, cur, next: next === undefined ? "null" : next }, "next");
    reversed.unshift(cur);
    t.step(4, "update", `${cur}.next = ${prev}`, `${cur} now points backwards, at the reversed part built so far.`, { reversed: [...reversed], rest: vals.slice(i + 1), prev, cur, next: next === undefined ? "null" : next }, "reversed");
    t.step(5, "update", `prev = ${cur}`, "The reversed part now starts at this node.", { reversed: [...reversed], rest: vals.slice(i + 1), prev: cur, cur, next: next === undefined ? "null" : next }, "prev");
    t.step(6, "update", `cur = ${next === undefined ? "null" : next}`, next === undefined ? "There is no next node, so the loop will stop." : "Step forward to the saved node.", { reversed: [...reversed], rest: vals.slice(i + 1), prev: cur, cur: next === undefined ? "null" : next }, "cur");
  }
  t.step(7, "done", `return prev = ${reversed[0]}`, "cur is null: every node has been turned around, and prev is the new head: 3 → 2 → 1.", { reversed: [...reversed], prev: reversed[0] });
  return t.steps;
}

const recursiveCode = `function reverseList(head) {
  if (head === null || head.next === null) return head;   // 0 or 1 node: already reversed
  const newHead = reverseList(head.next);                 // reverse everything after head
  head.next.next = head;                                  // the node after head must now point back at head
  head.next = null;                                       // head becomes the tail
  return newHead;
}

console.log(toArray(reverseList(fromArray([1, 2, 3, 4])))); // [4, 3, 2, 1]`;

const middleCode = `function middleNode(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;          // 1 step
    fast = fast.next.next;     // 2 steps
  }
  return slow;                 // when fast reaches the end, slow is halfway
}

console.log(middleNode(fromArray([1, 2, 3, 4, 5])).val); // 3
console.log(middleNode(fromArray([1, 2, 3, 4])).val);    // 3  (the second of the two middles)`;

const cycleCode = `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;     // they can only meet if the list loops
  }
  return false;                         // fast fell off the end: no cycle
}

const list = fromArray([1, 2, 3, 4]);
console.log(hasCycle(list));            // false
list.next.next.next.next = list.next;   // 4 now points back to 2: 1 -> 2 -> 3 -> 4 -> 2 ...
console.log(hasCycle(list));            // true`;

const palindromeCode = `function isPalindrome(head) {
  // 1. find the middle
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) { slow = slow.next; fast = fast.next.next; }
  // 2. reverse the second half
  let prev = null, cur = slow;
  while (cur !== null) { const next = cur.next; cur.next = prev; prev = cur; cur = next; }
  // 3. compare the first half with the reversed second half
  let a = head, b = prev;
  while (b !== null) {
    if (a.val !== b.val) return false;
    a = a.next; b = b.next;
  }
  return true;
}

console.log(isPalindrome(fromArray([1, 2, 2, 1])));    // true
console.log(isPalindrome(fromArray([1, 2, 3, 2, 1]))); // true
console.log(isPalindrome(fromArray([1, 2, 3])));       // false`;

const partCode = `// Reverse the nodes from position left to right (1-based).
function reverseBetween(head, left, right) {
  const dummy = new ListNode(0, head);
  let before = dummy;
  for (let i = 1; i < left; i++) before = before.next;   // the node just before the section
  const start = before.next;                              // will end up as the tail of the section
  for (let i = 0; i < right - left; i++) {
    const moving = start.next;        // take the node after start...
    start.next = moving.next;         // ...unlink it...
    moving.next = before.next;        // ...and put it at the front of the section
    before.next = moving;
  }
  return dummy.next;
}

console.log(toArray(reverseBetween(fromArray([1, 2, 3, 4, 5]), 2, 4))); // [1, 4, 3, 2, 5]`;

export default function DsaLessonThirtySixPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="reverse">Reversing a list</h2>
      <p>
        Reversing a linked list is the single most common linked-list question, and the trick is not the idea (turn every
        arrow around) but doing it <em>without losing the rest of the list</em>. You walk down the list with a cursor and, for
        each node, point its <code>next</code> backwards instead of forwards. Three variables do the job:
      </p>
      <ul>
        <li><code>cur</code> — the node being turned around right now.</li>
        <li><code>prev</code> — the node before it, which becomes <code>cur</code>&apos;s new <code>next</code>. It is also the head of the reversed part built so far.</li>
        <li><code>next</code> — a saved copy of <code>cur.next</code>, because the link is about to be overwritten.</li>
      </ul>
      <CodeBlock lang="js" code={reverseCode} />
      <Callout kind="warn" label="Save next before you cut">
        The first line in the loop is <code>const next = cur.next</code> for a reason. If you write <code>cur.next = prev</code>{" "}
        first, the only reference to the rest of the list is gone, and the loop cannot continue.
      </Callout>

      <h2 id="trace">Traced: reversing 1 → 2 → 3</h2>
      <CodeTrace
        code={traceSrc}
        steps={reverseTrace()}
        caption="'reversed' is the chain starting at prev; 'rest' is what cur has not reached yet. Each round moves one node from rest to the front of reversed."
      />
      <p>It runs in <strong>O(n)</strong> time and <strong>O(1)</strong> extra space: it reuses the existing nodes and only changes arrows.</p>

      <h2 id="recursive">The recursive version</h2>
      <p>
        Recursion reverses the list from the back. Trust the function to reverse everything <em>after</em> the head; then
        there is one job left: make the second node point back at the head.
      </p>
      <CodeBlock lang="js" code={recursiveCode} />
      <p>
        For <code>1 → 2 → 3</code>: the call on 3 returns 3 (base case). Back in the call on 2, <code>head.next.next = head</code>{" "}
        makes 3 point at 2, and <code>head.next = null</code> cuts 2 → 3. Back in the call on 1 the same step makes 2 point at 1.
        It is O(n) time but also <strong>O(n) stack space</strong>, one frame per node, so a very long list can overflow the call
        stack. The loop version has no such risk, which is why it is the one to write first.
      </p>

      <h2 id="middle">Slow and fast pointers: the middle</h2>
      <p>
        To find the middle of a list you could count the nodes, then walk half way: two passes. The{" "}
        <strong>slow and fast pointer</strong> technique does it in one. Start both at the head. Each round, <code>slow</code>{" "}
        moves one node and <code>fast</code> moves two. When <code>fast</code> reaches the end, <code>slow</code> has covered half
        the distance, so it is at the middle.
      </p>
      <CodeBlock lang="js" code={middleCode} />
      <DryRun
        title="list 1 → 2 → 3 → 4 → 5"
        cols={["Round", "slow", "fast", "Continue?"]}
        rows={[
          ["start", "1", "1", "fast and fast.next exist: yes"],
          ["1", "2", "3", "yes"],
          ["2", "3", "5", "fast.next is null: stop"],
        ]}
        note="With an even length the loop ends with fast = null and slow on the second middle node. If you need the first middle, start fast one step ahead or stop when fast.next.next is null."
      />

      <h2 id="cycle">Detecting a cycle (Floyd&apos;s algorithm)</h2>
      <p>
        A list has a <strong>cycle</strong> if some node&apos;s <code>next</code> points back to an earlier node, so walking
        never reaches <code>null</code>. The obvious fix is to remember every node you have seen in a <code>Set</code>, which costs
        O(n) memory. <strong>Floyd&apos;s tortoise and hare</strong> uses the same slow/fast pair with O(1) memory: if there is a
        cycle, the fast pointer eventually laps the slow one and they meet; if there is none, fast simply reaches the end.
      </p>
      <CodeBlock lang="js" code={cycleCode} />

      <h2 id="why">Why the fast pointer must catch the slow one</h2>
      <p>
        Once both pointers are inside the loop, look at the gap between them, counted along the loop. Each round, fast moves two
        and slow moves one, so the gap changes by exactly <strong>one</strong>. A gap that shrinks by one each round must
        reach zero; it cannot jump over zero. That is why they meet, and why a step of 2 is safe, whereas steps of 1 and 3
        could in some loops step past each other forever. A meeting costs at most about the loop length extra rounds after
        slow enters the loop, so the total is O(n).
      </p>
      <Callout kind="ok" label="Finding where the cycle starts">
        After the meeting, put one pointer back at the head and move both one step at a time. They meet again exactly at the
        node where the cycle begins (LeetCode 142). The proof is a short piece of algebra on distances; for an interview it is
        fine to know the result and the shape of the argument.
      </Callout>

      <h2 id="palindrome">Putting it together: palindrome list</h2>
      <p>
        Is <code>1 → 2 → 2 → 1</code> the same forwards and backwards? You cannot walk a singly linked list backwards, so combine
        the two techniques: find the middle with slow/fast, reverse the second half in place, then compare both halves from the
        outside in. This is O(n) time and O(1) space; copying into an array is simpler but uses O(n) space.
      </p>
      <CodeBlock lang="js" code={palindromeCode} />
      <p>
        This version leaves the list with its second half reversed. If the caller still needs the original, reverse that half again
        before returning. Mention it; interviewers like to hear it.
      </p>

      <h2 id="part">Reversing only part of a list</h2>
      <p>
        Reversing positions <em>left</em> to <em>right</em> needs a dummy head (the section may start at node 1) and a careful
        sequence of pointer moves. The version below repeatedly takes the node after <code>start</code> and moves it to the
        front of the section, so <code>start</code> drifts to the back automatically.
      </p>
      <CodeBlock lang="js" code={partCode} />

      <h2 id="practice">Practice questions</h2>
      <p>Draw three or four nodes and move the arrows with a pencil before you code. Most mistakes are visible on paper.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the iterative reverse from memory and say what each of <code>prev</code>, <code>cur</code> and <code>next</code> is for.</>,
          <>Explain why the loop condition for slow/fast is <code>fast !== null &amp;&amp; fast.next !== null</code>.</>,
          <>Explain why the fast pointer cannot jump over the slow one inside a cycle.</>,
          <>List the three steps of the palindrome-list solution.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        <strong>Lesson 37</strong> merges two sorted lists, then returns to the slow/fast and gap tricks for harder questions: where a
        cycle begins, removing the n-th node from the end, where two lists meet, adding two numbers held in lists, and sorting a list.
      </p>
    </DsaLessonPage>
  );
}
