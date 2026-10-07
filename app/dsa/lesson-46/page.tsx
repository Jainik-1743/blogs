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

const lesson = getDsaLesson("lesson-46");

export const metadata: Metadata = {
  title: `Lesson 46 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "problem", label: "The problem: always give me the smallest" },
  { id: "idea", label: "The heap property and its array form" },
  { id: "ops", label: "Push and pop: sift up, sift down" },
  { id: "trace", label: "Traced: six pushes and one pop" },
  { id: "class", label: "Writing a Heap in JavaScript" },
  { id: "heapify", label: "Heapify: building a heap in O(n)" },
  { id: "topk", label: "Top-K: the size-k heap" },
  { id: "frequent", label: "Top k frequent elements" },
  { id: "merge", label: "Merge k sorted lists" },
  { id: "median", label: "Median of a data stream: two heaps" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const heapCode = `class Heap {
  // compare(a, b) < 0 means "a should come out before b".
  // The default makes a min-heap of numbers; pass (a, b) => b - a for a max-heap.
  constructor(compare = (a, b) => a - b) {
    this.data = [];
    this.compare = compare;
  }
  get size() { return this.data.length; }
  peek() { return this.data[0]; }                     // the top item, without removing it

  push(value) {
    const d = this.data;
    d.push(value);                                    // put it in the first free slot...
    let i = d.length - 1;
    while (i > 0) {                                   // ...and sift it up
      const parent = (i - 1) >> 1;
      if (this.compare(d[i], d[parent]) >= 0) break;  // parent is fine: stop
      [d[i], d[parent]] = [d[parent], d[i]];
      i = parent;
    }
  }

  pop() {
    const d = this.data;
    if (d.length === 0) return undefined;
    const top = d[0];
    const last = d.pop();                             // take the last item off the end...
    if (d.length > 0) {
      d[0] = last;                                    // ...put it at the root, and sift it down
      let i = 0;
      while (true) {
        const left = 2 * i + 1, right = 2 * i + 2;
        let best = i;
        if (left < d.length && this.compare(d[left], d[best]) < 0) best = left;
        if (right < d.length && this.compare(d[right], d[best]) < 0) best = right;
        if (best === i) break;                        // both children are no better: stop
        [d[i], d[best]] = [d[best], d[i]];
        i = best;
      }
    }
    return top;
  }
}

const minHeap = new Heap();
for (const x of [5, 3, 8, 1, 9, 2]) minHeap.push(x);
console.log(minHeap.peek());                          // 1
const sorted = [];
while (minHeap.size > 0) sorted.push(minHeap.pop());
console.log(sorted);                                  // [1, 2, 3, 5, 8, 9]   (n pops = heap sort, O(n log n))

const maxHeap = new Heap((a, b) => b - a);
for (const x of [5, 3, 8, 1, 9, 2]) maxHeap.push(x);
console.log(maxHeap.pop(), maxHeap.pop());            // 9 8

const byCount = new Heap((a, b) => a[1] - b[1]);      // items can be anything, if compare says how to order them
byCount.push(["a", 4]); byCount.push(["b", 1]); byCount.push(["c", 3]);
console.log(byCount.pop());                           // [ 'b', 1 ]`;

const traceSrc = `const heap = [];
for (const x of [5, 3, 8, 1, 9, 2]) {
  heap.push(x);
  let i = heap.length - 1;
  while (i > 0) {
    const parent = (i - 1) >> 1;
    if (heap[parent] <= heap[i]) break;
    [heap[parent], heap[i]] = [heap[i], heap[parent]];
    i = parent;
  }
}
const top = heap[0];
const last = heap.pop();
heap[0] = last;
let j = 0;
while (true) {
  const l = 2 * j + 1, r = 2 * j + 2;
  let small = j;
  if (l < heap.length && heap[l] < heap[small]) small = l;
  if (r < heap.length && heap[r] < heap[small]) small = r;
  if (small === j) break;
  [heap[small], heap[j]] = [heap[j], heap[small]];
  j = small;
}`;

const L = (s: string) => traceSrc.split("\n").findIndex((l) => l.includes(s)) + 1;

function heapTrace() {
  const t = tracer();
  const heap: number[] = [];
  t.step(L("const heap = []"), "start", "heap = []", "A min-heap stored in an array. Index i has its parent at (i − 1) >> 1 and its children at 2i + 1 and 2i + 2.", { heap: [] });
  for (const x of [5, 3, 8, 1, 9, 2]) {
    heap.push(x);
    let i = heap.length - 1;
    t.step(L("heap.push(x)"), "update", `push ${x} at index ${i}`, `The new item goes in the first free slot at the end, so the tree stays complete. It may now be smaller than its parent, so sift it up.`, { heap: [...heap], x, i }, "heap");
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (heap[parent] <= heap[i]) {
        t.step(L("if (heap[parent]"), "check", `${heap[parent]} ≤ ${heap[i]}: stop`, `The parent (${heap[parent]}) is not bigger than the child (${heap[i]}), so the heap property holds and the item has found its place.`, { heap: [...heap], i, parent }, "parent");
        break;
      }
      t.step(L("if (heap[parent]"), "check", `${heap[parent]} > ${heap[i]}: swap needed`, `The parent (${heap[parent]}) is bigger than the child (${heap[i]}), which a min-heap forbids.`, { heap: [...heap], i, parent }, "parent");
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
      t.step(L("[heap[parent]"), "update", `swap up to index ${i}`, `Swapped. The new item now sits at index ${i}; compare it with its next parent.`, { heap: [...heap], i }, "heap");
    }
  }
  const top = heap[0];
  const last = heap.pop()!;
  t.step(L("const last"), "update", `pop: take ${top}, remove last item ${last}`, `The minimum is always at index 0, so we read it there. To remove it without leaving a hole, take the last item off the end of the array.`, { heap: [...heap], top, last }, "last");
  heap[0] = last;
  let j = 0;
  t.step(L("heap[0] = last"), "update", `move ${last} to the root`, `The last item becomes the root. It is probably too big for that spot, so sift it down.`, { heap: [...heap], j }, "heap");
  while (true) {
    const l = 2 * j + 1, r = 2 * j + 2;
    let small = j;
    if (l < heap.length && heap[l] < heap[small]) small = l;
    if (r < heap.length && heap[r] < heap[small]) small = r;
    const kids = [l, r].filter((k) => k < heap.length).map((k) => heap[k]);
    if (small === j) {
      t.step(L("if (small === j)"), "check", kids.length ? `${heap[j]} is no bigger than its children` : `${heap[j]} has no children`, kids.length ? `Children are ${kids.join(" and ")}: none is smaller, so stop.` : "No children: stop.", { heap: [...heap], j, small }, "small");
      break;
    }
    t.step(L("if (small === j)"), "check", `smallest of ${heap[j]} and its children is ${heap[small]}`, `Children are ${kids.join(" and ")}. Swap with the smaller child (${heap[small]}) so the smaller value rises.`, { heap: [...heap], j, small }, "small");
    [heap[small], heap[j]] = [heap[j], heap[small]];
    j = small;
    t.step(L("[heap[small]"), "update", `swap down to index ${j}`, `Swapped. ${heap[j]} is now at index ${j}; look at its children next.`, { heap: [...heap], j }, "heap");
  }
  t.print(top);
  t.step(L("if (small === j)"), "done", `popped ${top}; heap = [${heap.join(", ")}]`, "The next smallest (2) is now at the root, and the array again satisfies the heap property.", { heap: [...heap], top }, "heap");
  return t.steps;
}

const heapifyCode = `function siftDown(a, i, n) {                  // push a[i] down within the first n items
  while (true) {
    const left = 2 * i + 1, right = 2 * i + 2;
    let small = i;
    if (left < n && a[left] < a[small]) small = left;
    if (right < n && a[right] < a[small]) small = right;
    if (small === i) return;
    [a[i], a[small]] = [a[small], a[i]];
    i = small;
  }
}

function heapify(a) {                         // rearranges the array in place into a min-heap
  for (let i = (a.length >> 1) - 1; i >= 0; i--) siftDown(a, i, a.length);
  return a;                                   // items from index n/2 onwards are leaves already
}

console.log(heapify([5, 3, 8, 1, 9, 2])); // [1, 3, 2, 5, 9, 8]
console.log(heapify([9, 8, 7, 6, 5]));    // [5, 6, 7, 9, 8]`;

const kthCode = `class Heap {
  constructor(compare = (a, b) => a - b) { this.data = []; this.compare = compare; }
  get size() { return this.data.length; }
  peek() { return this.data[0]; }
  push(x) {
    const d = this.data; d.push(x);
    for (let i = d.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (this.compare(d[i], d[p]) >= 0) break;
      [d[i], d[p]] = [d[p], d[i]]; i = p;
    }
  }
  pop() {
    const d = this.data;
    if (d.length === 0) return undefined;
    const top = d[0], last = d.pop();
    if (d.length) {
      d[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1, r = l + 1;
        let b = i;
        if (l < d.length && this.compare(d[l], d[b]) < 0) b = l;
        if (r < d.length && this.compare(d[r], d[b]) < 0) b = r;
        if (b === i) break;
        [d[i], d[b]] = [d[b], d[i]]; i = b;
      }
    }
    return top;
  }
}

function kthLargest(nums, k) {
  const heap = new Heap();                    // a MIN-heap that never holds more than k items
  for (const x of nums) {
    heap.push(x);
    if (heap.size > k) heap.pop();            // evict the smallest: it cannot be among the k largest
  }
  return heap.peek();                         // the smallest of the k largest = the k-th largest
}

console.log(kthLargest([3, 2, 1, 5, 6, 4], 2));          // 5
console.log(kthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)); // 4`;

const frequentCode = `class Heap {
  constructor(compare = (a, b) => a - b) { this.data = []; this.compare = compare; }
  get size() { return this.data.length; }
  peek() { return this.data[0]; }
  push(x) {
    const d = this.data; d.push(x);
    for (let i = d.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (this.compare(d[i], d[p]) >= 0) break;
      [d[i], d[p]] = [d[p], d[i]]; i = p;
    }
  }
  pop() {
    const d = this.data;
    if (d.length === 0) return undefined;
    const top = d[0], last = d.pop();
    if (d.length) {
      d[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1, r = l + 1;
        let b = i;
        if (l < d.length && this.compare(d[l], d[b]) < 0) b = l;
        if (r < d.length && this.compare(d[r], d[b]) < 0) b = r;
        if (b === i) break;
        [d[i], d[b]] = [d[b], d[i]]; i = b;
      }
    }
    return top;
  }
}

function topKFrequent(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);

  const heap = new Heap((a, b) => a[1] - b[1]);         // min-heap of [value, count], ordered by count
  for (const entry of count) {
    heap.push(entry);
    if (heap.size > k) heap.pop();                      // drop the least frequent of the k + 1
  }
  const result = [];
  while (heap.size > 0) result.push(heap.pop()[0]);
  return result.reverse();                              // most frequent first
}

console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [1, 2]
console.log(topKFrequent([4, 4, 5, 5, 5, 6], 1)); // [5]`;

const mergeCode = `class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}
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
class Heap {
  constructor(compare = (a, b) => a - b) { this.data = []; this.compare = compare; }
  get size() { return this.data.length; }
  peek() { return this.data[0]; }
  push(x) {
    const d = this.data; d.push(x);
    for (let i = d.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (this.compare(d[i], d[p]) >= 0) break;
      [d[i], d[p]] = [d[p], d[i]]; i = p;
    }
  }
  pop() {
    const d = this.data;
    if (d.length === 0) return undefined;
    const top = d[0], last = d.pop();
    if (d.length) {
      d[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1, r = l + 1;
        let b = i;
        if (l < d.length && this.compare(d[l], d[b]) < 0) b = l;
        if (r < d.length && this.compare(d[r], d[b]) < 0) b = r;
        if (b === i) break;
        [d[i], d[b]] = [d[b], d[i]]; i = b;
      }
    }
    return top;
  }
}

function mergeKLists(lists) {
  const heap = new Heap((a, b) => a.val - b.val);   // holds the current front node of each list
  for (const head of lists) if (head !== null) heap.push(head);
  const dummy = new ListNode(0);
  let tail = dummy;
  while (heap.size > 0) {
    const node = heap.pop();                        // the smallest front node of all lists
    tail.next = node;
    tail = node;
    if (node.next !== null) heap.push(node.next);   // its list has a new front
  }
  return dummy.next;
}

const lists = [fromArray([1, 4, 5]), fromArray([1, 3, 4]), fromArray([2, 6])];
console.log(toArray(mergeKLists(lists)));           // [1, 1, 2, 3, 4, 4, 5, 6]
console.log(toArray(mergeKLists([null, fromArray([7])]))); // [7]`;

const medianCode = `class Heap {
  constructor(compare = (a, b) => a - b) { this.data = []; this.compare = compare; }
  get size() { return this.data.length; }
  peek() { return this.data[0]; }
  push(x) {
    const d = this.data; d.push(x);
    for (let i = d.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (this.compare(d[i], d[p]) >= 0) break;
      [d[i], d[p]] = [d[p], d[i]]; i = p;
    }
  }
  pop() {
    const d = this.data;
    if (d.length === 0) return undefined;
    const top = d[0], last = d.pop();
    if (d.length) {
      d[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1, r = l + 1;
        let b = i;
        if (l < d.length && this.compare(d[l], d[b]) < 0) b = l;
        if (r < d.length && this.compare(d[r], d[b]) < 0) b = r;
        if (b === i) break;
        [d[i], d[b]] = [d[b], d[i]]; i = b;
      }
    }
    return top;
  }
}

class MedianFinder {
  constructor() {
    this.low = new Heap((a, b) => b - a);    // max-heap: the smaller half, biggest on top
    this.high = new Heap();                  // min-heap: the larger half, smallest on top
  }
  addNum(x) {
    this.low.push(x);
    this.high.push(this.low.pop());          // route through low so every item in low stays <= every item in high
    if (this.high.size > this.low.size) this.low.push(this.high.pop());   // keep low the same size or one bigger
  }
  findMedian() {
    if (this.low.size > this.high.size) return this.low.peek();           // odd count: the middle item
    return (this.low.peek() + this.high.peek()) / 2;                      // even count: average of the two middles
  }
}

const m = new MedianFinder();
const medians = [];
for (const x of [5, 2, 8, 1, 9]) { m.addNum(x); medians.push(m.findMedian()); }
console.log(medians); // [5, 3.5, 5, 3.5, 5]`;

export default function DsaLessonFortySixPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="problem">The problem: always give me the smallest</h2>
      <p>
        Some jobs keep asking for &quot;the smallest item so far&quot; (or the largest) while new items keep arriving: the next task with
        the earliest deadline, the nearest of many points, the lightest stone. A structure that supports{" "}
        <strong>insert an item</strong> and <strong>remove the best item</strong> is called a <strong>priority queue</strong>. How
        could you build one from what you know?
      </p>
      <ul>
        <li>An <em>unsorted</em> array: insert is O(1), but finding the minimum scans everything, O(n).</li>
        <li>A <em>sorted</em> array: the minimum is at the end, but inserting in the right place shifts items, O(n).</li>
      </ul>
      <p>
        Either way one operation costs O(n). A <strong>heap</strong> makes <em>both</em> operations O(log n), and reading the
        best item O(1). It is the standard way to build a priority queue.
      </p>
      <Callout kind="note" label="JavaScript has no built-in heap">
        Python has <code>heapq</code> and Java has <code>PriorityQueue</code>, but standard JavaScript has neither. In an interview you
        write your own, which is why this lesson builds one from scratch. It is only about 35 lines, and you will paste the same
        class into every solution in this lesson.
      </Callout>

      <h2 id="idea">The heap property and its array form</h2>
      <p>
        A <strong>binary heap</strong> is a binary tree with two rules:
      </p>
      <ul>
        <li>
          <strong>Shape:</strong> it is <em>complete</em>: every level is full except possibly the last, which is filled from the
          left. No gaps.
        </li>
        <li>
          <strong>Heap property:</strong> in a <strong>min-heap</strong> every node is less than or equal to its children (a{" "}
          <strong>max-heap</strong> is the mirror: greater than or equal). So the smallest item is always at the root.
        </li>
      </ul>
      <p>
        Notice what the property does <em>not</em> say: nothing orders siblings or cousins. A heap is only partly sorted, just
        enough to know the minimum, and that is why it is cheaper to maintain than a fully sorted list.
      </p>
      <p>
        Because the tree has no gaps, it fits in a plain array, level by level, with no pointers. For a node at index{" "}
        <code>i</code>:
      </p>
      <DryRun
        title="the index formulas, shown on the min-heap [1, 3, 2, 5, 9, 8]"
        cols={["Index i", "Value", "Parent (i − 1) >> 1", "Children 2i + 1, 2i + 2"]}
        rows={[
          ["0", "1", "none (root)", "1 and 2  (values 3, 2)"],
          ["1", "3", "0  (value 1)", "3 and 4  (values 5, 9)"],
          ["2", "2", "0  (value 1)", "5 and 6  (value 8, and 6 does not exist)"],
          ["3", "5", "1  (value 3)", "7 and 8  (neither exists)"],
          ["4", "9", "1  (value 3)", "9 and 10  (neither exists)"],
          ["5", "8", "2  (value 2)", "11 and 12  (neither exists)"],
        ]}
        note="The expression (i − 1) >> 1 is integer division by two: it shifts the bits right by one place, so (5 − 1) >> 1 = 2 and (4 − 1) >> 1 = 1. Math.floor((i − 1) / 2) means the same."
      />
      <p>
        A complete tree with n nodes has height about log₂ n. Every operation below walks along one root-to-leaf path, which is
        where the O(log n) comes from. With a million items that is only about 20 steps.
      </p>

      <h2 id="ops">Push and pop: sift up, sift down</h2>
      <p>
        Both operations break the heap property at one spot and then repair it along a single path.
      </p>
      <p>
        <strong>Push (sift up).</strong> Put the new item in the first free slot at the end of the array. That keeps the shape
        complete. It may now be smaller than its parent, so compare with the parent and swap while the parent is bigger. This
        moving-up is called <strong>sift up</strong> (or &quot;bubble up&quot;). It stops at the root or at the first parent that is not
        bigger.
      </p>
      <p>
        <strong>Pop (sift down).</strong> The answer is at index 0, but removing it leaves a hole at the root. Fill the hole with the{" "}
        <em>last</em> item of the array (so the shape stays complete, and the array just gets one shorter). That item is probably too big for
        the root, so compare it with its two children and swap with the <em>smaller</em> child while a child is smaller. This is{" "}
        <strong>sift down</strong>. Swapping with the smaller child matters: the smaller child becomes the new parent of the
        other one, so the property holds between them.
      </p>
      <p>
        Each walk is at most the height of the tree, so push and pop are both <strong>O(log n)</strong>, and peeking at index 0 is{" "}
        <strong>O(1)</strong>.
      </p>

      <h2 id="trace">Traced: six pushes and one pop</h2>
      <CodeTrace
        code={traceSrc}
        steps={heapTrace()}
        caption="Pushing 1 sifts all the way to the root, because it is the new minimum. The pop then moves the last item (8) to the root and sifts it down just one level."
      />

      <h2 id="class">Writing a Heap in JavaScript</h2>
      <p>
        The class below takes a <strong>comparator</strong>: a function <code>compare(a, b)</code> that returns a negative number when{" "}
        <code>a</code> should leave the heap before <code>b</code>. The default, <code>a − b</code>, gives a min-heap of numbers. Pass{" "}
        <code>(a, b) =&gt; b − a</code> and the very same code is a max-heap. Pass{" "}
        <code>(a, b) =&gt; a[1] − b[1]</code> and it orders pairs by their second element. One class, no duplicated logic.
      </p>
      <CodeBlock lang="js" code={heapCode} />
      <p>
        Taking all n items out with <code>pop</code> returns them in sorted order, which is <strong>heap sort</strong>, O(n log n).
        You rarely write it, but it shows the heap is doing real ordering work.
      </p>
      <Callout kind="warn" label="Do not read the heap array as sorted">
        <code>heap.data</code> is only guaranteed to have the smallest item first. Printing it, looping over it, or taking{" "}
        <code>data[1]</code> as the second smallest is a bug. Always get items out with <code>pop</code>.
      </Callout>

      <h2 id="heapify">Heapify: building a heap in O(n)</h2>
      <p>
        If you already have all n items, pushing them one by one costs O(n log n). There is a faster way, called{" "}
        <strong>heapify</strong>: treat the array as a tree and sift down every non-leaf node, starting from the last one and moving
        back to the root. The leaves (the second half of the array) are already valid one-node heaps, so the loop starts at index{" "}
        <code>n/2 − 1</code>.
      </p>
      <CodeBlock lang="js" code={heapifyCode} />
      <p>
        Why is this O(n) and not O(n log n)? A sift-down costs at most the height of the node it starts from, and most nodes are
        near the bottom: about n/2 are leaves (cost 0), n/4 are one level up (cost at most 1), n/8 cost at most 2, and so on. The
        sum n/4 · 1 + n/8 · 2 + n/16 · 3 + … stays below n. The intuition to keep: <em>few nodes are tall, and many are short</em>.
      </p>

      <h2 id="topk">Top-K: the size-k heap</h2>
      <p>
        <strong>Find the k-th largest item.</strong> Sorting everything costs O(n log n). Instead keep a heap that never grows past
        k items. Which kind? A <strong>min-heap</strong>, surprisingly: the heap holds the k largest items seen so far, and its top is
        the <em>smallest of those k</em>, which is the first item to evict when a bigger one arrives. After every item has been seen, that
        top is the k-th largest overall.
      </p>
      <CodeBlock lang="js" code={kthCode} />
      <p>
        Each of the n items costs O(log k) to push and possibly pop, so the total is <strong>O(n log k)</strong> time with{" "}
        <strong>O(k)</strong> space. When k is small this is far better than sorting, and it works on a stream where you cannot
        store everything. Remember the rule: <em>for the k largest, use a min-heap of size k; for the k smallest, use a max-heap of size k</em>.
      </p>

      <h2 id="frequent">Top k frequent elements</h2>
      <p>
        Count how often each value appears with a Map, then run the same size-k trick on the counts. The heap holds{" "}
        <code>[value, count]</code> pairs and the comparator looks at the count, so the least frequent of the current candidates
        is always on top, ready to be evicted.
      </p>
      <CodeBlock lang="js" code={frequentCode} />
      <p>
        Counting is O(n); pushing the distinct values is O(d log k) for d distinct values, so the total is O(n + d log k), which is
        at most O(n log k). (A bucket-sort version can reach O(n), shown in the practice questions.)
      </p>

      <h2 id="merge">Merge k sorted lists</h2>
      <p>
        Lesson 37 merged two sorted linked lists by repeatedly taking the smaller front node. With k lists, the next node of the
        answer is the smallest of k front nodes. Comparing all k each time costs O(k) per node; a min-heap of the current fronts
        finds the smallest in O(log k). Pop the smallest, attach it to the answer, and push the next node from the same list.
      </p>
      <CodeBlock lang="js" code={mergeCode} />
      <p>
        The heap never holds more than k nodes, and each of the N nodes is pushed and popped once: <strong>O(N log k)</strong> time,{" "}
        <strong>O(k)</strong> extra space. The nodes are relinked, not copied.
      </p>

      <h2 id="median">Median of a data stream: two heaps</h2>
      <p>
        Numbers arrive one at a time, and at any moment you must report the <strong>median</strong>: the middle value of the sorted
        data, or the average of the two middle values when the count is even. Re-sorting after each number is too slow. The trick is
        to split the data into a <strong>lower half</strong> and an <strong>upper half</strong>:
      </p>
      <ul>
        <li>the lower half lives in a <strong>max-heap</strong>, so its biggest item is on top;</li>
        <li>the upper half lives in a <strong>min-heap</strong>, so its smallest item is on top;</li>
        <li>the halves have equal size, or the lower half has one extra.</li>
      </ul>
      <p>
        Then the median is made of the two tops: the top of the lower half if the count is odd, or the average of both tops if even.
        To insert a number, push it through the lower heap into the upper one (this guarantees every lower item stays at most
        every upper item), then move one item back if the upper half became bigger.
      </p>
      <CodeBlock lang="js" code={medianCode} />
      <p>
        Adding is <strong>O(log n)</strong>, reading the median is <strong>O(1)</strong>.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>
        When a question says &quot;k largest&quot;, &quot;k closest&quot;, &quot;most frequent&quot; or &quot;repeatedly take the best&quot;, reach for a heap.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>State the heap property and give the index formulas for a node&apos;s parent and children.</>,
          <>Explain push (sift up) and pop (sift down), and why each is O(log n).</>,
          <>Say why the k-th largest uses a min-heap of size k, and what the cost is.</>,
          <>Explain how two heaps give the median of a stream in O(log n) per number.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        A heap picks the best item of what is left, over and over. <strong>Lesson 47</strong> uses that same instinct in a different
        setting: <strong>greedy algorithms</strong>, where you commit to the best-looking choice right now and prove it never hurts
        later.
      </p>
    </DsaLessonPage>
  );
}
