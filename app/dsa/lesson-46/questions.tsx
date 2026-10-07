import Problem from "@/components/dsa/Problem";

/** Lesson 46 practice questions: heaps and top-K. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Kth largest element in an array"
        level="Medium"
        examples={[
          { input: "nums = [3, 2, 1, 5, 6, 4], k = 2", output: "5", why: "Sorted from the largest: 6, 5, 4, 3, 2, 1. The 2nd is 5." },
          { input: "nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4", output: "4", why: "Sorted from the largest: 6, 5, 5, 4, ... Duplicates count separately, so the 4th is 4." },
        ]}
        hints={[
          <>The obvious route is to sort. What does that cost, and can you avoid ordering everything?</>,
          <>You only need to remember the k biggest items. Which one of those is the first to throw away?</>,
          <>A min-heap capped at size k has the smallest of the k largest on top.</>,
        ]}
        approaches={[
          {
            name: "Sort",
            idea: <p>Sort descending and take index <code>k − 1</code>.</p>,
            code: `function findKthLargest(nums, k) {
  return [...nums].sort((a, b) => b - a)[k - 1];
}

console.log(findKthLargest([3, 2, 1, 5, 6, 4], 2));          // 5
console.log(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)); // 4`,
            explain: <p>O(n log n) time. Always a good first answer, and it is only two lines.</p>,
          },
          {
            name: "Min-heap of size k",
            idea: (
              <ol>
                <li>Push each number into a min-heap.</li>
                <li>If the heap grows past k, pop the smallest.</li>
                <li>At the end the top is the k-th largest.</li>
              </ol>
            ),
            code: `class Heap {
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

function findKthLargest(nums, k) {
  const heap = new Heap();
  for (const x of nums) {
    heap.push(x);
    if (heap.size > k) heap.pop();
  }
  return heap.peek();
}

console.log(findKthLargest([3, 2, 1, 5, 6, 4], 2));          // 5
console.log(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)); // 4`,
            explain: <p>O(n log k) time, O(k) space. After the loop the heap holds exactly the k largest numbers, and the smallest of them is the k-th largest.</p>,
          },
          {
            name: "Quickselect",
            idea: (
              <ol>
                <li>Pick a random pivot and split the numbers into bigger, equal and smaller.</li>
                <li>If k falls inside the &quot;bigger&quot; group, continue with just that group.</li>
                <li>If it falls in the &quot;equal&quot; group, the pivot is the answer.</li>
                <li>Otherwise continue with the &quot;smaller&quot; group, with k reduced by the sizes of the groups you skipped.</li>
              </ol>
            ),
            code: `function findKthLargest(nums, k) {
  let items = nums;
  while (true) {
    const pivot = items[Math.floor(Math.random() * items.length)];
    const bigger = items.filter((x) => x > pivot);
    const equal = items.filter((x) => x === pivot);
    if (k <= bigger.length) {
      items = bigger;
    } else if (k <= bigger.length + equal.length) {
      return pivot;
    } else {
      k -= bigger.length + equal.length;
      items = items.filter((x) => x < pivot);
    }
  }
}

console.log(findKthLargest([3, 2, 1, 5, 6, 4], 2));          // 5
console.log(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)); // 4`,
            explain: <p>Average O(n): each round discards a good fraction of the items, so the work forms a shrinking sum. The worst case is O(n²) with unlucky pivots, which a random pivot makes very unlikely. It uses O(n) extra space here because of the filtered arrays.</p>,
          },
        ]}
        compare={<p>Start with the sort to show correctness, then give the size-k heap, which is the pattern interviewers expect. Mention quickselect as the O(n) average alternative. (LeetCode 215.)</p>}
      >
        <p>Return the k-th largest element of an unsorted array (the k-th in sorted order from the top, not the k-th distinct value).</p>
      </Problem>

      <Problem
        n={2}
        title="Kth largest element in a stream"
        level="Easy"
        examples={[
          { input: "KthLargest(3, [4, 5, 8, 2]), add(3), add(5), add(10), add(9), add(4)", output: "4, 5, 5, 8, 8", why: "After adding 3 the numbers are 2, 3, 4, 5, 8 and the 3rd largest is 4. After adding 5 the 3rd largest is 5, and so on." },
        ]}
        hints={[
          <>This is question 1 with items arriving over time. What state must you keep between calls?</>,
          <>Keep a min-heap of the k largest numbers seen so far.</>,
        ]}
        approaches={[
          {
            name: "Keep a sorted array",
            idea: <p>Insert each new number at its sorted position; the answer is the item k places from the end.</p>,
            code: `class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.sorted = [...nums].sort((a, b) => a - b);
  }
  add(val) {
    let i = 0;
    while (i < this.sorted.length && this.sorted[i] < val) i++;
    this.sorted.splice(i, 0, val);                     // shifting makes this O(n)
    return this.sorted[this.sorted.length - this.k];
  }
}

const kth = new KthLargest(3, [4, 5, 8, 2]);
console.log([3, 5, 10, 9, 4].map((x) => kth.add(x)));  // [4, 5, 5, 8, 8]`,
            explain: <p>O(n) per add, and the array keeps every number forever.</p>,
          },
          {
            name: "Min-heap of size k",
            idea: <p>Keep only the k largest numbers in a min-heap. The top is always the k-th largest.</p>,
            code: `class Heap {
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

class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.heap = new Heap();
    for (const x of nums) this.add(x);
  }
  add(val) {
    this.heap.push(val);
    if (this.heap.size > this.k) this.heap.pop();
    return this.heap.peek();
  }
}

const kth = new KthLargest(3, [4, 5, 8, 2]);
console.log([3, 5, 10, 9, 4].map((x) => kth.add(x)));  // [4, 5, 5, 8, 8]`,
            explain: <p>O(log k) per add and O(k) memory total. The problem guarantees there are at least k numbers when you ask, so the heap is full whenever <code>add</code> returns.</p>,
          },
        ]}
        compare={<p>The size-k min-heap: the stream may be endless, and this stores only k numbers. (LeetCode 703.)</p>}
      >
        <p>Design a class that is created with an integer <code>k</code> and an initial array, and whose <code>add(val)</code> inserts a number and returns the k-th largest of all numbers so far.</p>
      </Problem>

      <Problem
        n={3}
        title="Top k frequent elements"
        level="Medium"
        examples={[
          { input: "nums = [1, 1, 1, 2, 2, 3], k = 2", output: "[1, 2]", why: "1 appears three times and 2 twice; 3 appears once." },
          { input: "nums = [1], k = 1", output: "[1]", why: "A single value." },
        ]}
        hints={[
          <>Start by counting each value with a Map.</>,
          <>Then it is a top-k problem on the counts. A min-heap capped at k keeps the most frequent.</>,
          <>Counts are at most n. Could you place values into buckets indexed by their count?</>,
        ]}
        approaches={[
          {
            name: "Sort by count",
            idea: <p>Count, sort the distinct values by count descending, take the first k.</p>,
            code: `function topKFrequent(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
  return [...count.keys()].sort((a, b) => count.get(b) - count.get(a)).slice(0, k);
}

console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [1, 2]
console.log(topKFrequent([1], 1));                // [1]`,
            explain: <p>O(n + d log d) for d distinct values, at most O(n log n).</p>,
          },
          {
            name: "Min-heap of size k",
            idea: <p>Push each <code>[value, count]</code> pair into a min-heap ordered by count; pop whenever it exceeds k items.</p>,
            code: `class Heap {
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
  const heap = new Heap((a, b) => a[1] - b[1]);
  for (const entry of count) {
    heap.push(entry);
    if (heap.size > k) heap.pop();
  }
  const result = [];
  while (heap.size > 0) result.push(heap.pop()[0]);
  return result.reverse();
}

console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [1, 2]
console.log(topKFrequent([1], 1));                // [1]`,
            explain: <p>O(n + d log k). Good when k is much smaller than d.</p>,
          },
          {
            name: "Bucket sort by count",
            idea: (
              <ol>
                <li>Count each value.</li>
                <li>Make n + 1 buckets; put each value in the bucket numbered by its count (a value cannot appear more than n times).</li>
                <li>Read the buckets from the highest index down until you have k values.</li>
              </ol>
            ),
            code: `function topKFrequent(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [value, c] of count) buckets[c].push(value);
  const result = [];
  for (let c = buckets.length - 1; c >= 0 && result.length < k; c--) {
    for (const value of buckets[c]) {
      if (result.length < k) result.push(value);
    }
  }
  return result;
}

console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [1, 2]
console.log(topKFrequent([1], 1));                // [1]`,
            explain: <p>O(n) time and space: no heap and no sort. It works because counts are small whole numbers, a limit that general top-k problems do not have.</p>,
          },
        ]}
        compare={<p>The heap shows the pattern; the bucket version is the O(n) answer for follow-ups. (LeetCode 347.)</p>}
      >
        <p>Return the k most frequent values of an array. The answer may be in any order, and the problem guarantees it is unique.</p>
      </Problem>

      <Problem
        n={4}
        title="K closest points to origin"
        level="Medium"
        examples={[
          { input: "points = [[1, 3], [-2, 2]], k = 1", output: "[[-2, 2]]", why: "The squared distances are 10 and 8; (−2, 2) is closer." },
          { input: "points = [[3, 3], [5, -1], [-2, 4]], k = 2", output: "[[3, 3], [-2, 4]]", why: "Squared distances 18, 26 and 20, so the two smallest are 18 and 20." },
        ]}
        hints={[
          <>Do you need the real distance, or is the squared distance enough to compare? (No square root needed.)</>,
          <>For the k smallest, keep a max-heap of size k: the farthest of your k candidates sits on top, ready to be evicted.</>,
        ]}
        approaches={[
          {
            name: "Sort by distance",
            idea: <p>Sort all points by squared distance and take the first k.</p>,
            code: `function kClosest(points, k) {
  const dist = ([x, y]) => x * x + y * y;
  return [...points].sort((a, b) => dist(a) - dist(b)).slice(0, k);
}

console.log(kClosest([[1, 3], [-2, 2]], 1));            // [ [ -2, 2 ] ]
console.log(kClosest([[3, 3], [5, -1], [-2, 4]], 2));   // [ [ 3, 3 ], [ -2, 4 ] ]`,
            explain: <p>O(n log n). Squared distances keep everything in integers and give the same ordering as real distances.</p>,
          },
          {
            name: "Max-heap of size k",
            idea: <p>Push each point into a max-heap ordered by distance. If it holds more than k points, pop the farthest. What remains are the k closest.</p>,
            code: `class Heap {
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

function kClosest(points, k) {
  const dist = ([x, y]) => x * x + y * y;
  const heap = new Heap((a, b) => dist(b) - dist(a));   // max-heap by distance
  for (const p of points) {
    heap.push(p);
    if (heap.size > k) heap.pop();
  }
  const result = [];
  while (heap.size > 0) result.push(heap.pop());
  return result.reverse();                              // closest first
}

console.log(kClosest([[1, 3], [-2, 2]], 1));            // [ [ -2, 2 ] ]
console.log(kClosest([[3, 3], [5, -1], [-2, 4]], 2));   // [ [ 3, 3 ], [ -2, 4 ] ]`,
            explain: <p>O(n log k) time, O(k) space. Same pattern as the k-th largest, mirrored: k smallest means a max-heap of size k.</p>,
          },
        ]}
        compare={<p>The max-heap when k is small relative to n; the sort when you want the shortest code. Quickselect (see question 1) gives O(n) average. (LeetCode 973.)</p>}
      >
        <p>Given points <code>[x, y]</code> on a plane, return the k points closest to the origin (0, 0) by straight-line distance. The answer may be in any order.</p>
      </Problem>

      <Problem
        n={5}
        title="Merge k sorted lists"
        level="Hard"
        examples={[
          { input: "lists = [[1, 4, 5], [1, 3, 4], [2, 6]]", output: "[1, 1, 2, 3, 4, 4, 5, 6]", why: "All eight values in sorted order." },
          { input: "lists = []", output: "[]", why: "Nothing to merge." },
        ]}
        hints={[
          <>Merging two sorted lists is lesson 37. How could you reuse it for k lists?</>,
          <>At any moment the next answer is the smallest of k front nodes. What structure finds the smallest quickly?</>,
        ]}
        approaches={[
          {
            name: "Collect everything and sort",
            idea: <p>Walk every list, put all values in one array, sort it, and build a new list.</p>,
            code: `class ListNode {
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

function mergeKLists(lists) {
  const values = [];
  for (let head of lists) {
    for (; head !== null; head = head.next) values.push(head.val);
  }
  values.sort((a, b) => a - b);
  return fromArray(values);
}

console.log(toArray(mergeKLists([fromArray([1, 4, 5]), fromArray([1, 3, 4]), fromArray([2, 6])]))); // [1, 1, 2, 3, 4, 4, 5, 6]
console.log(toArray(mergeKLists([])));                                                               // []`,
            explain: <p>O(N log N) for N total nodes, and it ignores that the lists are already sorted. A fine baseline.</p>,
          },
          {
            name: "Min-heap of front nodes",
            idea: (
              <ol>
                <li>Push the first node of each non-empty list into a min-heap ordered by value.</li>
                <li>Repeatedly pop the smallest node, append it to the answer, and push its successor.</li>
              </ol>
            ),
            code: `class ListNode {
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
  const heap = new Heap((a, b) => a.val - b.val);
  for (const head of lists) if (head !== null) heap.push(head);
  const dummy = new ListNode(0);
  let tail = dummy;
  while (heap.size > 0) {
    const node = heap.pop();
    tail.next = node;
    tail = node;
    if (node.next !== null) heap.push(node.next);
  }
  return dummy.next;
}

console.log(toArray(mergeKLists([fromArray([1, 4, 5]), fromArray([1, 3, 4]), fromArray([2, 6])]))); // [1, 1, 2, 3, 4, 4, 5, 6]
console.log(toArray(mergeKLists([])));                                                               // []`,
            explain: <p>O(N log k) time and O(k) space. The heap size is bounded by the number of lists, not the number of nodes.</p>,
          },
          {
            name: "Merge in pairs (divide and conquer)",
            idea: <p>Merge lists two at a time, then merge the results two at a time, and so on until one remains, like the rounds of a tournament.</p>,
            code: `class ListNode {
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

function mergeTwo(a, b) {
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

function mergeKLists(lists) {
  if (lists.length === 0) return null;
  let current = lists;
  while (current.length > 1) {
    const next = [];
    for (let i = 0; i < current.length; i += 2) {
      next.push(i + 1 < current.length ? mergeTwo(current[i], current[i + 1]) : current[i]);
    }
    current = next;
  }
  return current[0];
}

console.log(toArray(mergeKLists([fromArray([1, 4, 5]), fromArray([1, 3, 4]), fromArray([2, 6])]))); // [1, 1, 2, 3, 4, 4, 5, 6]
console.log(toArray(mergeKLists([])));                                                               // []`,
            explain: <p>There are about log₂ k rounds and every round touches each node at most once, so O(N log k) time, with only O(1) extra space beyond the lists. Merging them one after another into a growing result would instead cost O(N·k).</p>,
          },
        ]}
        compare={<p>The heap is the most common answer; pairwise merging reaches the same time without a heap. (LeetCode 23.)</p>}
      >
        <p>Given an array of k sorted linked lists, merge them into one sorted linked list and return its head.</p>
      </Problem>

      <Problem
        n={6}
        title="Find median from data stream"
        level="Hard"
        examples={[
          { input: "addNum(5), findMedian(), addNum(2), findMedian(), addNum(8), findMedian()", output: "5, 3.5, 5", why: "[5] has median 5. [2, 5] has the average of 2 and 5. [2, 5, 8] has the middle value 5." },
        ]}
        hints={[
          <>The median splits the data into a lower half and an upper half. Which item of each half do you need?</>,
          <>The biggest of the lower half and the smallest of the upper half: a max-heap and a min-heap.</>,
          <>Keep the sizes equal (or lower one bigger) after every insert.</>,
        ]}
        approaches={[
          {
            name: "Keep a sorted array",
            idea: <p>Insert each number in sorted position; the median is read from the middle.</p>,
            code: `class MedianFinder {
  constructor() { this.sorted = []; }
  addNum(x) {
    let i = 0;
    while (i < this.sorted.length && this.sorted[i] < x) i++;
    this.sorted.splice(i, 0, x);
  }
  findMedian() {
    const n = this.sorted.length, mid = n >> 1;
    return n % 2 === 1 ? this.sorted[mid] : (this.sorted[mid - 1] + this.sorted[mid]) / 2;
  }
}

const m = new MedianFinder();
const medians = [];
for (const x of [5, 2, 8, 1, 9]) { m.addNum(x); medians.push(m.findMedian()); }
console.log(medians); // [5, 3.5, 5, 3.5, 5]`,
            explain: <p>O(n) per insert (finding the place and shifting), O(1) per median query.</p>,
          },
          {
            name: "Two heaps",
            idea: (
              <ol>
                <li><code>low</code> is a max-heap with the smaller half; <code>high</code> is a min-heap with the larger half.</li>
                <li>On insert: push into <code>low</code>, move <code>low</code>&apos;s top to <code>high</code>, and if <code>high</code> is now bigger, move its top back.</li>
                <li>Median: <code>low</code>&apos;s top if there is an odd count, else the average of both tops.</li>
              </ol>
            ),
            code: `class Heap {
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
    this.low = new Heap((a, b) => b - a);
    this.high = new Heap();
  }
  addNum(x) {
    this.low.push(x);
    this.high.push(this.low.pop());
    if (this.high.size > this.low.size) this.low.push(this.high.pop());
  }
  findMedian() {
    if (this.low.size > this.high.size) return this.low.peek();
    return (this.low.peek() + this.high.peek()) / 2;
  }
}

const m = new MedianFinder();
const medians = [];
for (const x of [5, 2, 8, 1, 9]) { m.addNum(x); medians.push(m.findMedian()); }
console.log(medians); // [5, 3.5, 5, 3.5, 5]`,
            explain: <p>O(log n) per insert and O(1) per median. Sending the new number through <code>low</code> into <code>high</code> guarantees that nothing in <code>low</code> is ever bigger than something in <code>high</code>, whichever half the number really belongs to.</p>,
          },
        ]}
        compare={<p>Two heaps. The sorted-array version is a good starting point to explain the goal. (LeetCode 295.)</p>}
      >
        <p>Design a structure that supports <code>addNum(x)</code> and <code>findMedian()</code>. The median is the middle value of the sorted numbers so far, or the mean of the two middle values when the count is even.</p>
      </Problem>

      <Problem
        n={7}
        title="Last stone weight"
        level="Easy"
        examples={[
          { input: "stones = [2, 7, 4, 1, 8, 1]", output: "1", why: "Smash 8 and 7 to leave 1; smash 4 and 2 to leave 2; smash 2 and 1 to leave 1; smash 1 and 1 to leave nothing; the single stone 1 remains." },
          { input: "stones = [1]", output: "1", why: "Only one stone, nothing to smash." },
        ]}
        hints={[
          <>Each round needs the two heaviest stones. What structure gives the largest item quickly?</>,
          <>After smashing, the leftover (if not zero) goes back in the pile.</>,
        ]}
        approaches={[
          {
            name: "Sort every round",
            idea: <p>While at least two stones remain, sort, remove the two largest, and add back their difference if it is not zero.</p>,
            code: `function lastStoneWeight(stones) {
  const pile = [...stones];
  while (pile.length > 1) {
    pile.sort((a, b) => a - b);
    const y = pile.pop(), x = pile.pop();      // y is the heaviest, x the second heaviest
    if (y !== x) pile.push(y - x);
  }
  return pile.length === 1 ? pile[0] : 0;
}

console.log(lastStoneWeight([2, 7, 4, 1, 8, 1])); // 1
console.log(lastStoneWeight([1]));                // 1
console.log(lastStoneWeight([3, 3]));             // 0`,
            explain: <p>O(n² log n): up to n rounds, each sorting up to n stones.</p>,
          },
          {
            name: "Max-heap",
            idea: <p>Keep the stones in a max-heap. Pop two, push back their difference when it is non-zero.</p>,
            code: `class Heap {
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

function lastStoneWeight(stones) {
  const heap = new Heap((a, b) => b - a);       // max-heap
  for (const s of stones) heap.push(s);
  while (heap.size > 1) {
    const y = heap.pop(), x = heap.pop();
    if (y !== x) heap.push(y - x);
  }
  return heap.size === 1 ? heap.peek() : 0;
}

console.log(lastStoneWeight([2, 7, 4, 1, 8, 1])); // 1
console.log(lastStoneWeight([1]));                // 1
console.log(lastStoneWeight([3, 3]));             // 0`,
            explain: <p>O(n log n): each round does a constant number of heap operations and removes at least one stone.</p>,
          },
        ]}
        compare={<p>The max-heap: the textbook &quot;repeatedly take the largest&quot; problem. (LeetCode 1046.)</p>}
      >
        <p>Each turn, take the two heaviest stones and smash them. If they weigh the same, both are destroyed; otherwise the lighter is destroyed and the heavier loses that much weight. Return the weight of the last remaining stone, or 0 if none is left.</p>
      </Problem>
    </>
  );
}
