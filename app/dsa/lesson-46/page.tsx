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
  { id: "idea", label: "The heap rule and its array form" },
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
  // compare(a, b) < 0 means "a comes out before b".
  // The default makes a min-heap of numbers. Pass (a, b) => b - a for a max-heap.
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
  t.step(L("const heap = []"), "start", "heap = []", "A min-heap kept in an array. The item at index i has its parent at (i − 1) >> 1 and its children at 2i + 1 and 2i + 2.", { heap: [] });
  for (const x of [5, 3, 8, 1, 9, 2]) {
    heap.push(x);
    let i = heap.length - 1;
    t.step(L("heap.push(x)"), "update", `push ${x} at index ${i}`, `The new item goes in the first free slot at the end, so the tree has no gaps. It may now be smaller than its parent, so we move it up (sift up).`, { heap: [...heap], x, i }, "heap");
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (heap[parent] <= heap[i]) {
        t.step(L("if (heap[parent]"), "check", `${heap[parent]} ≤ ${heap[i]}: stop`, `The parent (${heap[parent]}) is not bigger than the child (${heap[i]}), so the heap rule holds. The item has found its place.`, { heap: [...heap], i, parent }, "parent");
        break;
      }
      t.step(L("if (heap[parent]"), "check", `${heap[parent]} > ${heap[i]}: swap needed`, `The parent (${heap[parent]}) is bigger than the child (${heap[i]}), and a min-heap does not allow that.`, { heap: [...heap], i, parent }, "parent");
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
      t.step(L("[heap[parent]"), "update", `swap up to index ${i}`, `Swapped. The new item is now at index ${i}. Compare it with its next parent.`, { heap: [...heap], i }, "heap");
    }
  }
  const top = heap[0];
  const last = heap.pop()!;
  t.step(L("const last"), "update", `pop: take ${top}, remove last item ${last}`, `The minimum is always at index 0, so we read it there. To remove it without leaving a hole, we take the last item off the end of the array.`, { heap: [...heap], top, last }, "last");
  heap[0] = last;
  let j = 0;
  t.step(L("heap[0] = last"), "update", `move ${last} to the root`, `The last item becomes the root. It is probably too big for that spot, so we move it down (sift down).`, { heap: [...heap], j }, "heap");
  while (true) {
    const l = 2 * j + 1, r = 2 * j + 2;
    let small = j;
    if (l < heap.length && heap[l] < heap[small]) small = l;
    if (r < heap.length && heap[r] < heap[small]) small = r;
    const kids = [l, r].filter((k) => k < heap.length).map((k) => heap[k]);
    if (small === j) {
      t.step(L("if (small === j)"), "check", kids.length ? `${heap[j]} is no bigger than its children` : `${heap[j]} has no children`, kids.length ? `The children are ${kids.join(" and ")}. None is smaller, so stop.` : "No children: stop.", { heap: [...heap], j, small }, "small");
      break;
    }
    t.step(L("if (small === j)"), "check", `smallest of ${heap[j]} and its children is ${heap[small]}`, `The children are ${kids.join(" and ")}. Swap with the smaller child (${heap[small]}), so the smaller value moves up.`, { heap: [...heap], j, small }, "small");
    [heap[small], heap[j]] = [heap[j], heap[small]];
    j = small;
    t.step(L("[heap[small]"), "update", `swap down to index ${j}`, `Swapped. ${heap[j]} is now at index ${j}. Look at its children next.`, { heap: [...heap], j }, "heap");
  }
  t.print(top);
  t.step(L("if (small === j)"), "done", `popped ${top}; heap = [${heap.join(", ")}]`, "The next smallest item (2) is now at the root, and the array follows the heap rule again.", { heap: [...heap], top }, "heap");
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
        Some jobs keep asking for &quot;the smallest item so far&quot; (or the largest) while new items keep arriving. Examples: the next
        task with the earliest deadline, the nearest of many points, or the lightest stone. A tool that can{" "}
        <strong>add an item</strong> and <strong>remove the best item</strong> is called a <strong>priority queue</strong> (a waiting
        line where the most important item goes first, not the oldest). How could you build one from what you know?
      </p>
      <ul>
        <li>An <em>unsorted</em> array: adding is O(1), but finding the minimum means looking at every item, which is O(n).</li>
        <li>A <em>sorted</em> array: the minimum is at the end, but adding in the right place moves many items, which is O(n).</li>
      </ul>
      <p>
        Either way, one of the two jobs is slow (O(n) means the work grows with the number of items). A <strong>heap</strong> makes{" "}
        <em>both</em> jobs O(log n), which is much faster. Looking at the best item is O(1), which means one step. A heap is the
        standard way to build a priority queue.
      </p>
      <Callout kind="note" label="JavaScript has no built-in heap">
        Python has <code>heapq</code> and Java has <code>PriorityQueue</code>, but standard JavaScript has neither. In an interview you
        write your own, so this lesson builds one from scratch. It is only about 35 lines. You will paste the same class into every
        solution in this lesson.
      </Callout>

      <h2 id="idea">The heap property and its array form</h2>
      <p>
        A <strong>binary heap</strong> is a binary tree (each item has at most two children below it) with two rules:
      </p>
      <ul>
        <li>
          <strong>Shape:</strong> the tree is <em>complete</em>. Every level is full, except maybe the last one. The last level is
          filled from the left. There are no gaps.
        </li>
        <li>
          <strong>Heap property:</strong> in a <strong>min-heap</strong>, every item is smaller than or equal to its children. A{" "}
          <strong>max-heap</strong> is the opposite: every item is bigger than or equal to its children. So in a min-heap, the
          smallest item is always at the top (the root).
        </li>
      </ul>
      <p>
        Notice what the rule does <em>not</em> say. It does not put brothers, sisters or cousins in order. A heap is only partly
        sorted. It is sorted just enough to know the minimum. That is why it is cheaper to keep than a fully sorted list.
      </p>
      <p>
        Because the tree has no gaps, it fits in a plain array. You store it level by level, and you need no pointers. For an item at
        index <code>i</code>:
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
        note="The expression (i − 1) >> 1 means 'divide by two and drop the decimal part'. It moves the bits one place to the right. So (5 − 1) >> 1 = 2 and (4 − 1) >> 1 = 1. Math.floor((i − 1) / 2) means the same thing."
      />
      <p>
        A complete tree with n items has a height of about log₂ n (the number of times you can halve n). Every operation below walks
        along one path from the root down to a leaf (an item with no children). That is where O(log n) comes from. With a million
        items, that is only about 20 steps.
      </p>

      <h2 id="ops">Push and pop: sift up, sift down</h2>
      <p>
        Both operations break the heap rule in one place. Then they fix it by walking along a single path.
      </p>
      <p>
        <strong>Push (sift up).</strong> Put the new item in the first free slot at the end of the array. This keeps the shape
        complete. The new item may now be smaller than its parent. So compare it with its parent, and swap while the parent is
        bigger. This moving up is called <strong>sift up</strong> (or &quot;bubble up&quot;, like a bubble rising in water). It stops at
        the root, or at the first parent that is not bigger.
      </p>
      <p>
        <strong>Pop (sift down).</strong> The answer is at index 0. But taking it out leaves a hole at the root. Fill the hole with
        the <em>last</em> item of the array. This keeps the shape complete, and the array just gets one item shorter. That item is
        probably too big for the root. So compare it with its two children. Swap it with the <em>smaller</em> child, and repeat while
        a child is smaller. This is <strong>sift down</strong>. Using the smaller child matters. That child becomes the new parent of
        the other child, so the rule still holds between them.
      </p>
      <p>
        Each walk is at most as long as the height of the tree. So push and pop are both <strong>O(log n)</strong>. Looking at index 0
        is <strong>O(1)</strong>.
      </p>

      <h2 id="trace">Traced: six pushes and one pop</h2>
      <CodeTrace
        code={traceSrc}
        steps={heapTrace()}
        caption="Pushing 1 sifts all the way up to the root, because 1 is the new minimum. The pop then moves the last item (8) to the root and sifts it down just one level."
      />

      <h2 id="class">Writing a Heap in JavaScript</h2>
      <p>
        The class below takes a <strong>comparator</strong>. This is a small function, <code>compare(a, b)</code>, that tells the heap
        which of two items should come out first. It returns a negative number when <code>a</code> should leave the heap before{" "}
        <code>b</code>. The default, <code>a − b</code>, gives a min-heap of numbers. Pass <code>(a, b) =&gt; b − a</code> and the very
        same code becomes a max-heap. Pass <code>(a, b) =&gt; a[1] − b[1]</code> and it orders pairs by their second value. So you
        write one class and you never copy the logic.
      </p>
      <CodeBlock lang="js" code={heapCode} />
      <p>
        If you take all n items out with <code>pop</code>, they come out in sorted order. This is called <strong>heap sort</strong>,
        and it is O(n log n). You rarely write it. But it shows that the heap really does ordering work.
      </p>
      <Callout kind="warn" label="Do not read the heap array as sorted">
        <code>heap.data</code> only promises that the smallest item is first. If you print it, loop over it, or use{" "}
        <code>data[1]</code> as the second smallest, you have a bug. Always take items out with <code>pop</code>.
      </Callout>

      <h2 id="heapify">Heapify: building a heap in O(n)</h2>
      <p>
        Say you already have all n items. Pushing them one by one costs O(n log n). There is a faster way, called{" "}
        <strong>heapify</strong>. Treat the array as a tree, and sift down every item that has children. Start from the last one and
        move back to the root. The leaves (the second half of the array) are already valid one-item heaps. So the loop starts at
        index <code>n/2 − 1</code>.
      </p>
      <CodeBlock lang="js" code={heapifyCode} />
      <p>
        Why is this O(n) and not O(n log n)? A sift down costs at most the height of the item it starts from. Most items are near the
        bottom. About n/2 items are leaves (cost 0). About n/4 are one level up (cost at most 1). About n/8 cost at most 2, and so on.
        The sum n/4 · 1 + n/8 · 2 + n/16 · 3 + … stays below n. Remember this idea: <em>few items are tall, and many are short</em>.
      </p>

      <h2 id="topk">Top-K: the size-k heap</h2>
      <p>
        <strong>Find the k-th largest item.</strong> Sorting everything costs O(n log n). Instead, keep a heap that never grows past
        k items. Which kind of heap? A <strong>min-heap</strong>, which is surprising. The heap holds the k largest items seen so far.
        Its top is the <em>smallest of those k</em>. That is the first item to throw out when a bigger one arrives. After you have
        seen every item, the top is the k-th largest overall.
      </p>
      <CodeBlock lang="js" code={kthCode} />
      <p>
        Each of the n items costs O(log k) to push and maybe pop. So the total is <strong>O(n log k)</strong> time and{" "}
        <strong>O(k)</strong> space. When k is small, this is much better than sorting. It also works on a stream (items that keep
        arriving) where you cannot store everything. Remember the rule: <em>for the k largest, use a min-heap of size k. For the k
        smallest, use a max-heap of size k</em>.
      </p>

      <h2 id="frequent">Top k frequent elements</h2>
      <p>
        First count how often each value appears, using a Map. Then use the same size-k trick on the counts. The heap holds{" "}
        <code>[value, count]</code> pairs, and the comparator looks at the count. So the least frequent of the current candidates is
        always on top, ready to be thrown out.
      </p>
      <CodeBlock lang="js" code={frequentCode} />
      <p>
        Counting is O(n). Pushing the different values is O(d log k), where d is the number of different values. So the total is
        O(n + d log k), which is at most O(n log k). (A bucket-sort version can reach O(n). You will see it in the practice
        questions.)
      </p>

      <h2 id="merge">Merge k sorted lists</h2>
      <p>
        Lesson 37 merged two sorted linked lists by repeatedly taking the smaller front node. With k lists, the next node of the
        answer is the smallest of k front nodes. Comparing all k fronts each time costs O(k) per node. A min-heap of the current
        fronts finds the smallest in O(log k). Pop the smallest, attach it to the answer, and push the next node from the same list.
      </p>
      <CodeBlock lang="js" code={mergeCode} />
      <p>
        The heap never holds more than k nodes, and each of the N nodes is pushed and popped once. So the time is{" "}
        <strong>O(N log k)</strong> and the extra space is <strong>O(k)</strong>. The nodes are linked again, not copied.
      </p>

      <h2 id="median">Median of a data stream: two heaps</h2>
      <p>
        Numbers arrive one at a time. At any moment you must report the <strong>median</strong>. The median is the middle value of
        the sorted data. If the count is even, it is the average of the two middle values. Sorting again after each number is too
        slow. The trick is to split the data into a <strong>lower half</strong> and an <strong>upper half</strong>:
      </p>
      <ul>
        <li>the lower half lives in a <strong>max-heap</strong>, so its biggest item is on top;</li>
        <li>the upper half lives in a <strong>min-heap</strong>, so its smallest item is on top;</li>
        <li>the two halves have the same size, or the lower half has one extra item.</li>
      </ul>
      <p>
        Now the median comes from the two tops. If the count is odd, it is the top of the lower half. If the count is even, it is the
        average of both tops. To add a number, push it into the lower heap, then pop the top of the lower heap into the upper heap.
        This makes sure every lower item stays smaller than or equal to every upper item. Then, if the upper half became bigger, move
        one item back.
      </p>
      <CodeBlock lang="js" code={medianCode} />
      <p>
        Adding is <strong>O(log n)</strong>. Reading the median is <strong>O(1)</strong>.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>
        When a question says &quot;k largest&quot;, &quot;k closest&quot;, &quot;most frequent&quot; or &quot;repeatedly take the best&quot;, think
        of a heap.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Say the heap rule, and give the index formulas for the parent and the children of an item.</>,
          <>Explain push (sift up) and pop (sift down), and why each is O(log n).</>,
          <>Say why the k-th largest uses a min-heap of size k, and what it costs.</>,
          <>Explain how two heaps give the median of a stream in O(log n) per number.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        A heap picks the best item of what is left, again and again. <strong>Lesson 47</strong> uses the same idea in a different
        place: <strong>greedy algorithms</strong>. There you take the choice that looks best right now, and you prove it never hurts
        later.
      </p>
    </DsaLessonPage>
  );
}
