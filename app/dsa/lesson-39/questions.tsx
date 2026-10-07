import Problem from "@/components/dsa/Problem";

/** Lesson 39 practice questions: queues and deques. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Implement queue using stacks"
        level="Easy"
        examples={[
          { input: "push(1), push(2), peek(), pop(), empty()", output: "1, 1, false", why: "1 was added first so it leaves first; 2 remains." },
        ]}
        hints={[
          <>Moving every item from one stack to another reverses their order. What does reversing a stack&apos;s content do to which item is on top?</>,
          <>Do not move on every operation. Only pour when the out-stack is empty.</>,
        ]}
        approaches={[
          {
            name: "Move everything on every operation",
            idea: <p>Keep one stack where the front of the queue is on top: to push, empty it into a helper, add the new item, pour back.</p>,
            code: `class SlowQueue {
  constructor() { this.s = []; }
  push(x) {
    const tmp = [];
    while (this.s.length) tmp.push(this.s.pop());
    this.s.push(x);
    while (tmp.length) this.s.push(tmp.pop());
  }
  pop() { return this.s.pop(); }
  peek() { return this.s[this.s.length - 1]; }
  empty() { return this.s.length === 0; }
}

const q = new SlowQueue();
q.push(1); q.push(2);
console.log(q.peek()); // 1
console.log(q.pop());  // 1
console.log(q.empty()); // false`,
            explain: <p>Correct, but every push costs O(n).</p>,
          },
          {
            name: "In-stack and out-stack (amortised O(1))",
            idea: <p>Push to the in-stack. For pop/peek, if the out-stack is empty pour the in-stack into it first.</p>,
            code: `class MyQueue {
  constructor() { this.inS = []; this.outS = []; }
  push(x) { this.inS.push(x); }
  #fill() { if (!this.outS.length) while (this.inS.length) this.outS.push(this.inS.pop()); }
  pop() { this.#fill(); return this.outS.pop(); }
  peek() { this.#fill(); return this.outS[this.outS.length - 1]; }
  empty() { return !this.inS.length && !this.outS.length; }
}

const q = new MyQueue();
q.push(1); q.push(2);
console.log(q.peek());  // 1
console.log(q.pop());   // 1
console.log(q.empty()); // false`,
            explain: <p>Each item is moved once, so the average cost is O(1) per operation even though a single pop may be O(n).</p>,
          },
        ]}
        compare={<p>The two-stack version. Say the word &quot;amortised&quot;. (LeetCode 232.)</p>}
      >
        <p>Implement a FIFO queue using only stack operations (<code>push</code> and <code>pop</code> on the end, <code>peek</code>, size/empty).</p>
      </Problem>

      <Problem
        n={2}
        title="Implement stack using queues"
        level="Easy"
        examples={[
          { input: "push(1), push(2), top(), pop(), empty()", output: "2, 2, false", why: "2 was added last so it leaves first." },
        ]}
        hints={[
          <>After adding a new item at the back of the queue, how can you bring it to the front?</>,
        ]}
        approaches={[
          {
            name: "Rotate after every push",
            idea: <p>Push the new item, then move the <code>size − 1</code> items in front of it from the front to the back. The newest item is now at the front.</p>,
            code: `class MyStack {
  constructor() { this.q = []; this.head = 0; }
  get size() { return this.q.length - this.head; }
  #dequeue() { return this.q[this.head++]; }
  push(x) {
    this.q.push(x);
    for (let i = 0; i < this.size - 1; i++) this.q.push(this.#dequeue());   // rotate the older items behind x
  }
  pop() { return this.#dequeue(); }
  top() { return this.q[this.head]; }
  empty() { return this.size === 0; }
}

const s = new MyStack();
s.push(1); s.push(2);
console.log(s.top());   // 2
console.log(s.pop());   // 2
console.log(s.empty()); // false`,
            explain: <p>push is O(n), pop/top/empty are O(1). (The head index avoids <code>shift</code>; the consumed prefix of the array is never reclaimed in this short sketch.)</p>,
          },
          {
            name: "Rotate on pop instead",
            idea: <p>Pushing is a plain enqueue. To pop, rotate all but the last item to the back and dequeue the last one.</p>,
            code: `class MyStack {
  constructor() { this.q = []; }
  push(x) { this.q.push(x); }                       // O(1)
  pop() {
    for (let i = 0; i < this.q.length - 1; i++) this.q.push(this.q.shift());
    return this.q.shift();                           // the former last item
  }
  top() { const x = this.pop(); this.q.push(x); return x; }
  empty() { return this.q.length === 0; }
}

const s = new MyStack();
s.push(1); s.push(2); s.push(3);
console.log(s.pop());  // 3
console.log(s.top());  // 2`,
            explain: <p>The cost moves to pop: O(n). Either side must pay O(n) — a stack cannot be built from one queue with every operation O(1).</p>,
          },
        ]}
        compare={<p>The first one keeps top/pop simple. Mention that one operation must be O(n). (LeetCode 225.)</p>}
      >
        <p>Implement a LIFO stack using only queue operations (enqueue at the back, dequeue from the front, peek, size, empty).</p>
      </Problem>

      <Problem
        n={3}
        title="Design circular queue"
        level="Medium"
        examples={[
          { input: "capacity 3: enQueue(1), enQueue(2), enQueue(3), enQueue(4)", output: "true, true, true, false", why: "The queue is full after three items." },
          { input: "…Rear(), deQueue(), enQueue(4), Rear()", output: "3, true, true, 4", why: "The freed slot at the start is reused by wrapping around." },
        ]}
        hints={[
          <>Track the index of the front and the number of items. Everything else follows.</>,
          <>Use <code>% capacity</code> to wrap an index past the end back to 0.</>,
        ]}
        approaches={[
          {
            name: "Fixed array, head and size",
            idea: <p>Slot for a new item: <code>(head + size) % cap</code>. Dequeue moves <code>head</code> one slot with wrap-around. Rear is <code>(head + size − 1) % cap</code>.</p>,
            code: `class CircularQueue {
  constructor(k) { this.buf = new Array(k); this.cap = k; this.head = 0; this.size = 0; }
  enQueue(x) {
    if (this.size === this.cap) return false;
    this.buf[(this.head + this.size) % this.cap] = x;
    this.size++;
    return true;
  }
  deQueue() {
    if (this.size === 0) return false;
    this.head = (this.head + 1) % this.cap;
    this.size--;
    return true;
  }
  Front() { return this.size === 0 ? -1 : this.buf[this.head]; }
  Rear() { return this.size === 0 ? -1 : this.buf[(this.head + this.size - 1) % this.cap]; }
  isEmpty() { return this.size === 0; }
  isFull() { return this.size === this.cap; }
}

const q = new CircularQueue(3);
console.log(q.enQueue(1), q.enQueue(2), q.enQueue(3), q.enQueue(4)); // true true true false
console.log(q.Rear());      // 3
console.log(q.deQueue());   // true
console.log(q.enQueue(4));  // true
console.log(q.Rear());      // 4`,
            explain: <p>All operations are O(1). Storing <code>size</code> removes the ambiguity of &quot;head equals tail&quot; meaning either empty or full.</p>,
          },
          {
            name: "Head and tail pointers, one wasted slot",
            idea: <p>Allocate <code>k + 1</code> slots and keep <code>head</code> and <code>tail</code>. Empty means <code>head === tail</code>; full means <code>(tail + 1) % (k + 1) === head</code>. One slot is deliberately left empty to tell the two states apart.</p>,
            code: `class CircularQueue {
  constructor(k) { this.buf = new Array(k + 1); this.n = k + 1; this.head = 0; this.tail = 0; }
  isEmpty() { return this.head === this.tail; }
  isFull() { return (this.tail + 1) % this.n === this.head; }
  enQueue(x) {
    if (this.isFull()) return false;
    this.buf[this.tail] = x;
    this.tail = (this.tail + 1) % this.n;
    return true;
  }
  deQueue() {
    if (this.isEmpty()) return false;
    this.head = (this.head + 1) % this.n;
    return true;
  }
  Front() { return this.isEmpty() ? -1 : this.buf[this.head]; }
  Rear() { return this.isEmpty() ? -1 : this.buf[(this.tail - 1 + this.n) % this.n]; }
}

const q = new CircularQueue(2);
console.log(q.enQueue(7), q.enQueue(8), q.enQueue(9)); // true true false
console.log(q.Rear());                                 // 8`,
            explain: <p>Same speed. Note <code>(tail − 1 + n) % n</code>: in JavaScript <code>-1 % n</code> is <code>-1</code>, so you must add <code>n</code> before taking the remainder.</p>,
          },
        ]}
        compare={<p>The first; it is easier to reason about. (LeetCode 622.)</p>}
      >
        <p>Design a fixed-capacity queue that reuses freed space, with O(1) operations.</p>
      </Problem>

      <Problem
        n={4}
        title="Sliding window maximum"
        level="Hard"
        examples={[
          { input: "nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3", output: "[3, 3, 5, 5, 6, 7]", why: "The maximum of each window of three." },
          { input: "nums = [1], k = 1", output: "[1]", why: "A single window." },
        ]}
        hints={[
          <>If a newer value is at least as large as an older one in the window, the older one can never be the answer again.</>,
          <>Keep indices, not values, so you can tell when the front has left the window.</>,
        ]}
        approaches={[
          {
            name: "Brute force",
            idea: <p>For each window take the maximum of its k values.</p>,
            code: `function maxSlidingWindow(nums, k) {
  const out = [];
  for (let i = 0; i + k <= nums.length; i++) {
    let best = -Infinity;
    for (let j = i; j < i + k; j++) best = Math.max(best, nums[j]);
    out.push(best);
  }
  return out;
}

console.log(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3)); // [3, 3, 5, 5, 6, 7]`,
            explain: <p>O(n·k). With n = k = 10⁵ that is far too slow.</p>,
          },
          {
            name: "Monotonic deque with a head index",
            idea: <p>Keep indices of decreasing values in an array used as a deque: advance <code>head</code> to drop from the front, <code>pop</code> to drop from the back.</p>,
            code: `function maxSlidingWindow(nums, k) {
  const dq = [];            // indices
  let head = 0;             // dq[head] is the front
  const out = [];
  for (let i = 0; i < nums.length; i++) {
    if (head < dq.length && dq[head] <= i - k) head++;                              // front left the window
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();        // drop smaller from the back
    dq.push(i);
    if (i >= k - 1) out.push(nums[dq[head]]);
  }
  return out;
}

console.log(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3)); // [3, 3, 5, 5, 6, 7]
console.log(maxSlidingWindow([9, 8, 7], 2));                   // [9, 8]
console.log(maxSlidingWindow([1], 1));                         // [1]`,
            explain: <p>O(n) time: each index is pushed once and removed at most once. At most one front removal is needed per step because the window moves one place at a time.</p>,
          },
        ]}
        compare={<p>Say the brute force first, then the deque. (LeetCode 239.)</p>}
      >
        <p>For every window of size <code>k</code> sliding left to right over <code>nums</code>, report the maximum.</p>
      </Problem>

      <Problem
        n={5}
        title="Number of recent calls"
        level="Easy"
        examples={[
          { input: "ping(1), ping(100), ping(3001), ping(3002)", output: "1, 2, 3, 3", why: "Count calls within the last 3000 ms, including this one." },
        ]}
        hints={[
          <>Calls arrive in increasing time. Old ones are always at the front.</>,
        ]}
        approaches={[
          {
            name: "Queue of timestamps",
            idea: <p>Enqueue <code>t</code>. Dequeue from the front while the front is older than <code>t − 3000</code>. The queue size is the answer.</p>,
            code: `class RecentCounter {
  constructor() { this.q = []; this.head = 0; }
  ping(t) {
    this.q.push(t);
    while (this.q[this.head] < t - 3000) this.head++;
    return this.q.length - this.head;
  }
}

const r = new RecentCounter();
console.log(r.ping(1));    // 1
console.log(r.ping(100));  // 2
console.log(r.ping(3001)); // 3
console.log(r.ping(3002)); // 3`,
            explain: <p>Each timestamp is added and removed at most once: amortised O(1) per ping.</p>,
          },
          {
            name: "Binary search over all pings",
            idea: <p>Keep every timestamp in a sorted array (it is sorted automatically) and binary-search the first one ≥ <code>t − 3000</code>.</p>,
            code: `class RecentCounter {
  constructor() { this.times = []; }
  ping(t) {
    this.times.push(t);
    let lo = 0, hi = this.times.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.times[mid] < t - 3000) lo = mid + 1; else hi = mid;
    }
    return this.times.length - lo;
  }
}

const r = new RecentCounter();
console.log(r.ping(1));    // 1
console.log(r.ping(3001)); // 2
console.log(r.ping(3002)); // 2`,
            explain: <p>O(log n) per ping and memory grows without bound, so the queue is better. Shown to connect with the binary search lesson.</p>,
          },
        ]}
        compare={<p>The queue. (LeetCode 933.)</p>}
      >
        <p>Count how many pings happened in the last 3000 milliseconds, counting the current one, for each new <code>ping(t)</code>.</p>
      </Problem>

      <Problem
        n={6}
        title="Time needed to buy tickets"
        level="Easy"
        examples={[
          { input: "tickets = [2, 3, 2], k = 2", output: "6", why: "Each person buys one ticket then rejoins the back; person 2 finishes at second 6." },
          { input: "tickets = [5, 1, 1, 1], k = 0", output: "8", why: "Person 0 must wait for the others to finish their single tickets between rounds." },
        ]}
        hints={[
          <>Simulating the line works. Is there also a way to compute it without simulating?</>,
        ]}
        approaches={[
          {
            name: "Simulate with a queue",
            idea: <p>Queue of indices. Take the front, buy one ticket (1 second), and if they still need more, send them to the back. Stop when person <code>k</code> is done.</p>,
            code: `function timeRequiredToBuy(tickets, k) {
  const need = [...tickets];
  const queue = tickets.map((_, i) => i);
  let head = 0, time = 0;
  while (true) {
    const i = queue[head++];
    need[i]--;
    time++;
    if (need[i] === 0) { if (i === k) return time; }
    else queue.push(i);
  }
}

console.log(timeRequiredToBuy([2, 3, 2], 2));    // 6
console.log(timeRequiredToBuy([5, 1, 1, 1], 0)); // 8`,
            explain: <p>O(total tickets) time, which can be large if one person wants many.</p>,
          },
          {
            name: "Direct formula",
            idea: <p>Person <code>k</code> buys <code>tickets[k]</code> times. In each round, a person before or at <code>k</code> buys at most <code>tickets[k]</code> tickets, and a person after <code>k</code> buys at most <code>tickets[k] − 1</code> before <code>k</code> finishes.</p>,
            code: `function timeRequiredToBuy(tickets, k) {
  let time = 0;
  for (let i = 0; i < tickets.length; i++) {
    time += Math.min(tickets[i], i <= k ? tickets[k] : tickets[k] - 1);
  }
  return time;
}

console.log(timeRequiredToBuy([2, 3, 2], 2));    // 6
console.log(timeRequiredToBuy([5, 1, 1, 1], 0)); // 8`,
            explain: <p>O(n). Simulating first and spotting the formula afterwards is a good interview path. (LeetCode 2073.)</p>,
          },
        ]}
        compare={<p>Start with the simulation, then offer the formula.</p>}
      >
        <p>People in a line each want <code>tickets[i]</code> tickets and buy one per second, rejoining the back of the line if they want more. How long until person <code>k</code> has all theirs?</p>
      </Problem>

      <Problem
        n={7}
        title="Students unable to eat lunch"
        level="Easy"
        examples={[
          { input: "students = [1, 1, 0, 0], sandwiches = [0, 1, 0, 1]", output: "0", why: "Everyone eventually gets a sandwich they like." },
          { input: "students = [1, 1, 1, 0, 0, 1], sandwiches = [1, 0, 0, 0, 1, 1]", output: "3", why: "The first student takes the 1. Two students who want 0 then take two 0 sandwiches. The next sandwich is 0 but the three students left all want 1, so they are stuck." },
        ]}
        hints={[
          <>The top sandwich is taken only by a student who wants that kind; others go to the back of the line. When can the process get stuck?</>,
        ]}
        approaches={[
          {
            name: "Simulate the queue",
            idea: <p>Rotate the students until the front student matches the top sandwich. If a full rotation without a match happens, everyone left is stuck.</p>,
            code: `function countStudents(students, sandwiches) {
  const queue = [...students];
  let top = 0, rotations = 0;
  while (queue.length && rotations < queue.length) {
    if (queue[0] === sandwiches[top]) { queue.shift(); top++; rotations = 0; }
    else { queue.push(queue.shift()); rotations++; }
  }
  return queue.length;
}

console.log(countStudents([1, 1, 0, 0], [0, 1, 0, 1]));             // 0
console.log(countStudents([1, 1, 1, 0, 0, 1], [1, 0, 0, 0, 1, 1])); // 3`,
            explain: <p>O(n²) worst case with these array operations.</p>,
          },
          {
            name: "Count each preference",
            idea: <p>Order does not matter for who can eat, only the counts. Walk the sandwiches; if no student wants the top one, stop. The remaining students are stuck.</p>,
            code: `function countStudents(students, sandwiches) {
  const want = [0, 0];
  for (const s of students) want[s]++;
  for (let i = 0; i < sandwiches.length; i++) {
    if (want[sandwiches[i]] === 0) return sandwiches.length - i;   // nobody left wants this one
    want[sandwiches[i]]--;
  }
  return 0;
}

console.log(countStudents([1, 1, 0, 0], [0, 1, 0, 1]));             // 0
console.log(countStudents([1, 1, 1, 0, 0, 1], [1, 0, 0, 0, 1, 1])); // 3`,
            explain: <p>O(n) time and O(1) space. A simulation question that dissolves into counting once you ask what really matters. (LeetCode 1700.)</p>,
          },
        ]}
        compare={<p>Counting, after mentioning the simulation.</p>}
      >
        <p>Students (0 or 1 preference) stand in a queue; a stack of sandwiches (0 or 1) is on the table. The front student takes the top sandwich if it matches, otherwise goes to the back. Return how many students never eat.</p>
      </Problem>
    </>
  );
}
