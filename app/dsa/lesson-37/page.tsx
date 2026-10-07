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

const lesson = getDsaLesson("lesson-37");

export const metadata: Metadata = {
  title: `Lesson 37 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "merge", label: "Merging two sorted lists" },
  { id: "trace", label: "Traced: merging 1 → 3 → 5 with 2 → 4" },
  { id: "start", label: "Where a cycle starts" },
  { id: "nth", label: "Remove the n-th node from the end" },
  { id: "intersection", label: "Where two lists meet" },
  { id: "add", label: "Adding two numbers stored in lists" },
  { id: "sort", label: "Sorting a list with merge sort" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const mergeCode = `function mergeTwoLists(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;                       // tail is where the next node will be attached
  while (a !== null && b !== null) {
    if (a.val <= b.val) { tail.next = a; a = a.next; }
    else                { tail.next = b; b = b.next; }
    tail = tail.next;
  }
  tail.next = a !== null ? a : b;         // one list is used up: attach what is left of the other
  return dummy.next;
}

console.log(toArray(mergeTwoLists(fromArray([1, 3, 5]), fromArray([2, 4])))); // [1, 2, 3, 4, 5]
console.log(toArray(mergeTwoLists(fromArray([]), fromArray([0]))));           // [0]`;

const traceSrc = `const dummy = new ListNode(0);
let tail = dummy;
while (a !== null && b !== null) {
  if (a.val <= b.val) { tail.next = a; a = a.next; }
  else                { tail.next = b; b = b.next; }
  tail = tail.next;
}
tail.next = a !== null ? a : b;
return dummy.next;`;

function mergeTrace() {
  const t = tracer();
  const a = [1, 3, 5];
  const b = [2, 4];
  let ai = 0;
  let bi = 0;
  const merged: number[] = [];
  const vars = (extra: Record<string, unknown> = {}) => ({ a: a.slice(ai), b: b.slice(bi), merged: [...merged], ...extra });
  t.step(1, "start", "dummy = ListNode(0), tail = dummy", "The dummy node is a fake first node. It means attaching the very first real node is no different from attaching any other. tail marks where to attach the next node.", vars());
  while (ai < a.length && bi < b.length) {
    t.step(3, "check", `a = ${a[ai]}, b = ${b[bi]}: both lists have nodes`, "Compare the front nodes of the two lists.", vars(), "a");
    if (a[ai] <= b[bi]) {
      const v = a[ai];
      merged.push(v);
      ai++;
      t.step(4, "update", `${v} (from a) is not larger: attach it`, `tail.next = a, then a moves to its next node. The smaller front node always goes next, because both lists are already sorted.`, vars(), "merged");
    } else {
      const v = b[bi];
      merged.push(v);
      bi++;
      t.step(5, "update", `${v} (from b) is smaller: attach it`, `tail.next = b, then b moves on.`, vars(), "merged");
    }
  }
  const left = ai < a.length ? a.slice(ai) : b.slice(bi);
  t.step(3, "check", `${ai >= a.length ? "a" : "b"} is empty: loop ends`, "One of the lists has no nodes left.", vars());
  merged.push(...left);
  t.step(8, "update", `tail.next = ${left.length ? left[0] : "null"} (the rest of the other list)`, "The remaining nodes are already sorted. They are all larger than what we have merged so far. So we attach them all in one move instead of one by one.", { merged: [...merged] }, "merged");
  t.step(9, "done", "return dummy.next", `The merged list is ${merged.join(" → ")}. We do not need the dummy node any more, so we skip it.`, { merged: [...merged] });
  return t.steps;
}

const startCode = `function detectCycle(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {                 // phase 1: they met inside the loop
      let p = head;                      // phase 2: restart one pointer from the head
      while (p !== slow) { p = p.next; slow = slow.next; }
      return p;                          // both now stand on the first node of the loop
    }
  }
  return null;                           // no cycle
}

const list = fromArray([3, 2, 0, -4, 7]);
list.next.next.next.next.next = list.next;   // the tail points back at the node holding 2
console.log(detectCycle(list).val);          // 2
console.log(detectCycle(fromArray([1, 2])));  // null`;

const nthCode = `function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let fast = dummy, slow = dummy;
  for (let i = 0; i < n; i++) fast = fast.next;     // open a gap of n nodes
  while (fast.next !== null) {                      // move both until fast is on the LAST node
    fast = fast.next;
    slow = slow.next;
  }
  slow.next = slow.next.next;                       // slow is just before the node to delete
  return dummy.next;
}

console.log(toArray(removeNthFromEnd(fromArray([1, 2, 3, 4, 5]), 2))); // [1, 2, 3, 5]
console.log(toArray(removeNthFromEnd(fromArray([1]), 1)));             // []`;

const intersectionCode = `function getIntersectionNode(a, b) {
  let p = a, q = b;
  while (p !== q) {
    p = p === null ? b : p.next;      // after finishing one list, continue on the other
    q = q === null ? a : q.next;
  }
  return p;                           // the shared node, or null if they never meet
}

// 1 -> 2 -> 8 -> 9   and   5 -> 8 -> 9   (8 is shared)
const shared = fromArray([8, 9]);
const x = new ListNode(1, new ListNode(2, shared));
const y = new ListNode(5, shared);
console.log(getIntersectionNode(x, y).val);                    // 8
console.log(getIntersectionNode(fromArray([1]), fromArray([2]))); // null`;

const addCode = `// Digits are stored in reverse order: 342 is 2 -> 4 -> 3.
function addTwoNumbers(a, b) {
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

console.log(toArray(addTwoNumbers(fromArray([2, 4, 3]), fromArray([5, 6, 4])))); // [7, 0, 8]  (342 + 465 = 807)
console.log(toArray(addTwoNumbers(fromArray([9, 9]), fromArray([1]))));          // [0, 0, 1]  (99 + 1 = 100)`;

const sortCode = `function mergeTwoLists(a, b) {
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
  if (head === null || head.next === null) return head;     // 0 or 1 node: sorted
  // find the end of the first half (slow stops BEFORE the middle)
  let slow = head, fast = head.next;
  while (fast !== null && fast.next !== null) { slow = slow.next; fast = fast.next.next; }
  const second = slow.next;
  slow.next = null;                                          // cut the list in two
  return mergeTwoLists(sortList(head), sortList(second));
}

console.log(toArray(sortList(fromArray([4, 2, 1, 3]))));    // [1, 2, 3, 4]
console.log(toArray(sortList(fromArray([-1, 5, 3, 4, 0])))); // [-1, 0, 3, 4, 5]`;

export default function DsaLessonThirtySevenPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="merge">Merging two sorted lists</h2>
      <p>
        You already merged two sorted <em>arrays</em> in the sorting part. With linked lists the idea is the same, but it
        is even neater. You do not copy anything. You just change the links of the existing nodes to put them in the right order. A{" "}
        <strong>dummy head</strong> and a <code>tail</code> pointer keep the code short. The dummy is a fake first node that you throw away at the end.
        It means attaching the first real node is no different from attaching any other.
      </p>
      <CodeBlock lang="js" code={mergeCode} />

      <h2 id="trace">Traced: merging 1 → 3 → 5 with 2 → 4</h2>
      <CodeTrace
        code={traceSrc}
        steps={mergeTrace()}
        caption="Always attach the smaller front node. When one list runs out, attach the other list's remainder in one move."
      />
      <p>
        Time is <strong>O(m + n)</strong> (m and n are the two list lengths, and every node is attached once). Extra space is <strong>O(1)</strong>. Using{" "}
        <code>&lt;=</code> instead of <code>&lt;</code> keeps the merge <strong>stable</strong>. Stable means that equal values from the first list
        stay ahead of equal values from the second list.
      </p>

      <h2 id="start">Where a cycle starts</h2>
      <p>
        Lesson 36 checked <em>whether</em> there is a cycle. To find <em>where</em> it begins, add a second phase. When slow and
        fast first meet, leave <code>slow</code> where it is and put a new pointer at the head. Move both one step at a time. They meet at
        the first node of the cycle.
      </p>
      <CodeBlock lang="js" code={startCode} />
      <p>
        <strong>Why it works.</strong> Let the straight part before the loop have length <em>a</em>. Let the meeting point
        be <em>b</em> steps into the loop, and let the loop have length <em>c</em>. Slow has walked <em>a + b</em> steps. Fast has walked twice
        as many. Fast is at the same node as slow, so it must have walked some whole number of extra laps (call it <em>k</em>). That gives <em>2(a + b) = a + b + k·c</em>,
        so <em>a + b = k·c</em>, which means <em>a = k·c − b</em>. Now start at the meeting point and walk <em>a</em> more steps.
        You end at the loop start (<em>k</em> laps, minus the <em>b</em> steps already covered). The pointer from the head also walks <em>a</em>
        steps and lands at the loop start. So they arrive together.
      </p>

      <h2 id="nth">Remove the n-th node from the end</h2>
      <p>
        You do not know the length, and you want to delete a node counted from the back. Use a <strong>gap</strong>. First, send{" "}
        <code>fast</code> n nodes ahead. Then move both pointers together. The gap between them never changes. So when fast is on the last node, slow is
        exactly one node before the node to delete. Start both at a dummy head. Then removing the real head works too.
      </p>
      <CodeBlock lang="js" code={nthCode} />
      <DryRun
        title="remove the 2nd from the end of 1 → 2 → 3 → 4 → 5"
        cols={["Moment", "slow", "fast"]}
        rows={[
          ["start", "dummy", "dummy"],
          ["after moving fast 2 steps", "dummy", "2"],
          ["fast.next exists: move both", "1", "3"],
          ["again", "2", "4"],
          ["again", "3", "5"],
          ["fast.next is null: stop. slow.next (4) is deleted", "3", "5"],
        ]}
        note="The result is 1 → 2 → 3 → 5. Fast sets a fixed distance. Slow always stays that far behind fast."
      />

      <h2 id="intersection">Where two lists meet</h2>
      <p>
        Two lists can <em>share</em> their tails. This means the same node objects, not just equal values. Here is the trick. Walk pointer{" "}
        <code>p</code> along list A and then along list B. Walk <code>q</code> along list B and then along list A. Both walk the same total
        distance, <em>len(A) + len(B)</em>. So they arrive at the shared node at the same moment. If the lists never share a node,
        both pointers reach <code>null</code> together, and the loop ends with <code>null</code>.
      </p>
      <CodeBlock lang="js" code={intersectionCode} />
      <Callout kind="warn" label="Same node, not same value">
        Two lists meet only if they share the <em>same object</em>. So compare the nodes with <code>===</code>. If you compare <code>val</code>, you would
        wrongly match two separate lists that just happen to contain equal numbers.
      </Callout>

      <h2 id="add">Adding two numbers held in lists</h2>
      <p>
        Each list holds one digit per node, with the <em>smallest</em> place first (the ones digit comes first). So adding works like the addition you learned at school.
        You go from left to right and keep a <strong>carry</strong> (the extra 1 you carry to the next digit). Keep going while either list has digits <em>or</em> there is a
        carry left. If you stop too early, <code>99 + 1</code> would lose its final 1.
      </p>
      <CodeBlock lang="js" code={addCode} />

      <h2 id="sort">Sorting a list with merge sort</h2>
      <p>
        Merge sort works well on linked lists. Finding the middle uses the slow and fast trick. Splitting takes one pointer change. Merging
        needs no extra array. It runs in <strong>O(n log n)</strong> time. Quick sort and binary search are a poor fit for lists. They need random
        access, which means jumping straight to any position. A linked list cannot do that.
      </p>
      <CodeBlock lang="js" code={sortCode} />
      <Callout kind="ok" label="Why fast starts at head.next">
        Take the two-node list <code>[1, 2]</code>. If both pointers start at <code>head</code>, slow ends on the second node. Then the
        first half would be both nodes and the second half would be empty. The recursion would never get smaller. If <code>fast</code> starts one
        step ahead, <code>slow</code> stops on the <em>last node of the first half</em>. Then both halves are always smaller.
      </Callout>

      <h2 id="practice">Practice questions</h2>
      <p>All of these use the same tools: a dummy head, a trailing pointer, slow and fast pointers, and careful changes to the links.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the merge loop with a dummy head. Explain the last line (<code>tail.next = a || b</code>).</>,
          <>Describe the two phases for finding where a cycle starts. Say what the second phase does.</>,
          <>Explain how a gap of n nodes finds the n-th node from the end in one pass.</>,
          <>Explain why the intersection trick makes both pointers walk the same distance.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        <strong>Lesson 38</strong> leaves lists and brings a new structure: the <strong>stack</strong>. A stack is last in, first out,
        like a pile of plates. You use it to match brackets, to build a stack that knows its minimum, and to work out expressions.
      </p>
    </DsaLessonPage>
  );
}
