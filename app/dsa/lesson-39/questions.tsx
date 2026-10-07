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
          { input: "push(1), push(2), peek(), pop(), empty()", output: "1, 1, false", why: "1 was added first, so it leaves first. 2 is still in the queue." },
        ]}
        hints={[
          <>Moving every item from one stack to another reverses their order. After you reverse a stack, which item is on top?</>,
          <>Do not move items on every operation. Pour only when the out-stack is empty.</>,
        ]}
        approaches={[
          {
            name: "Move everything on every operation",
            idea: <p>Keep one stack where the front of the queue is on top. To push, empty it into a helper stack, add the new item, and pour everything back.</p>,
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
            explain: <p>It gives the right answer, but every push costs O(n).</p>,
          },
          {
            name: "In-stack and out-stack (amortised O(1))",
            idea: <p>Push onto the in-stack. For pop and peek, first check the out-stack. If it is empty, pour the in-stack into it.</p>,
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
            explain: <p>Each item is moved only once. So the average cost is O(1) per operation, even though one single pop may cost O(n).</p>,
          },
        ]}
        compare={<p>Use the two-stack version. Say the word &quot;amortised&quot; (averaged over many operations). (LeetCode 232.)</p>}
      >
        <p>Build a FIFO queue using only stack operations: <code>push</code> and <code>pop</code> at the end, <code>peek</code>, and size or empty checks.</p>
      </Problem>

      <Problem
        n={2}
        title="Implement stack using queues"
        level="Easy"
        examples={[
          { input: "push(1), push(2), top(), pop(), empty()", output: "2, 2, false", why: "2 was added last, so it leaves first." },
        ]}
        hints={[
          <>After you add a new item at the back of the queue, how can you bring it to the front?</>,
        ]}
        approaches={[
          {
            name: "Rotate after every push",
            idea: <p>Push the new item. Then move the <code>size − 1</code> older items, one by one, from the front to the back. Now the newest item is at the front.</p>,
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
            explain: <p>push is O(n). pop, top and empty are O(1). (The head index avoids <code>shift</code>. In this short example, the used part at the start of the array is never cleaned up.)</p>,
          },
          {
            name: "Move the items on pop instead",
            idea: <p>Pushing is a plain enqueue. To pop, move all items except the last one from the front to the back. Then dequeue the last one.</p>,
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
            explain: <p>Now pop costs O(n). In both versions, one side (push or pop) has to pay O(n).</p>,
          },
        ]}
        compare={<p>The first one keeps top and pop simple. Say that one operation has to be O(n). (LeetCode 225.)</p>}
      >
        <p>Build a LIFO stack using only queue operations: enqueue at the back, dequeue from the front, peek, size, and empty.</p>
      </Problem>

      <Problem
        n={3}
        title="Design circular queue"
        level="Medium"
        examples={[
          { input: "capacity 3: enQueue(1), enQueue(2), enQueue(3), enQueue(4)", output: "true, true, true, false", why: "The queue is full after three items." },
          { input: "…Rear(), deQueue(), enQueue(4), Rear()", output: "3, true, true, 4", why: "The free slot at the start is reused by wrapping around." },
        ]}
        hints={[
          <>Keep track of the index of the front and the number of items. You can work out everything else from these two.</>,
          <>Use <code>% capacity</code> to wrap an index that goes past the end back to 0.</>,
        ]}
        approaches={[
          {
            name: "Fixed array, head and size",
            idea: <p>The slot for a new item is <code>(head + size) % cap</code>. Dequeue moves <code>head</code> forward by one slot and wraps around at the end. The last item (Rear) is at <code>(head + size − 1) % cap</code>.</p>,
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
            explain: <p>All operations are O(1). Storing <code>size</code> removes a problem: &quot;head equals tail&quot; could mean either empty or full.</p>,
          },
          {
            name: "Head and tail pointers, one slot left unused",
            idea: <p>Make <code>k + 1</code> slots and keep a <code>head</code> and a <code>tail</code>. Empty means <code>head === tail</code>. Full means <code>(tail + 1) % (k + 1) === head</code>. One slot is left empty on purpose, so you can tell empty and full apart.</p>,
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
            explain: <p>Same speed. Look at <code>(tail − 1 + n) % n</code>. In JavaScript, <code>-1 % n</code> is <code>-1</code>, not a valid index. So you must add <code>n</code> before you take the remainder.</p>,
          },
        ]}
        compare={<p>Use the first one. It is easier to understand. (LeetCode 622.)</p>}
      >
        <p>Design a queue with a fixed maximum size that reuses free space. Every operation must be O(1).</p>
      </Problem>

      <Problem
        n={4}
        title="Sliding window maximum"
        level="Hard"
        examples={[
          { input: "nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3", output: "[3, 3, 5, 5, 6, 7]", why: "The biggest value in each window of three." },
          { input: "nums = [1], k = 1", output: "[1]", why: "A single window." },
        ]}
        hints={[
          <>If a newer value is at least as big as an older value in the window, the older value can never be the answer again.</>,
          <>Keep indices (positions), not values. Then you can tell when the front has left the window.</>,
        ]}
        approaches={[
          {
            name: "Brute force",
            idea: <p>For each window, look at all k values and take the biggest.</p>,
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
            explain: <p>O(n·k). If n and k are both 10⁵, this is far too slow.</p>,
          },
          {
            name: "Deque whose values go down, with a head index",
            idea: <p>Keep the indices of values that go down in an array used as a deque. Move <code>head</code> forward to remove from the front. Use <code>pop</code> to remove from the back.</p>,
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
            explain: <p>O(n) time. Each index is pushed once and removed at most once. You need at most one front removal per step, because the window moves only one place at a time.</p>,
          },
        ]}
        compare={<p>Say the brute force way first, then show the deque. (LeetCode 239.)</p>}
      >
        <p>A window of size <code>k</code> slides from left to right over <code>nums</code>. For every window, report the biggest value.</p>
      </Problem>

      <Problem
        n={5}
        title="Number of recent calls"
        level="Easy"
        examples={[
          { input: "ping(1), ping(100), ping(3001), ping(3002)", output: "1, 2, 3, 3", why: "Count the calls in the last 3000 ms, including this one." },
        ]}
        hints={[
          <>Calls arrive in time order. The old ones are always at the front.</>,
        ]}
        approaches={[
          {
            name: "Queue of timestamps",
            idea: <p>Enqueue <code>t</code>. Keep removing from the front while the front is older than <code>t − 3000</code>. The size of the queue is the answer.</p>,
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
            explain: <p>Each timestamp is added once and removed at most once. So the average cost is O(1) per ping.</p>,
          },
          {
            name: "Binary search over all the pings",
            idea: <p>Keep every timestamp in an array. It is already sorted, because calls arrive in time order. Use binary search to find the first timestamp that is ≥ <code>t − 3000</code>.</p>,
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
            explain: <p>O(log n) per ping, and the memory keeps growing without limit. So the queue is better. We show this one to connect with the binary search lesson.</p>,
          },
        ]}
        compare={<p>Use the queue. (LeetCode 933.)</p>}
      >
        <p>For each new <code>ping(t)</code>, count how many pings happened in the last 3000 milliseconds, including the current one.</p>
      </Problem>

      <Problem
        n={6}
        title="Time needed to buy tickets"
        level="Easy"
        examples={[
          { input: "tickets = [2, 3, 2], k = 2", output: "6", why: "Each person buys one ticket and then goes to the back of the line. Person 2 finishes at second 6." },
          { input: "tickets = [5, 1, 1, 1], k = 0", output: "8", why: "Person 0 has to wait while the others buy their single tickets between rounds." },
        ]}
        hints={[
          <>Acting out the line step by step (a simulation) works. Is there also a way to work out the answer without it?</>,
        ]}
        approaches={[
          {
            name: "Simulate with a queue",
            idea: <p>Use a queue of indices. Take the front person. They buy one ticket (1 second). If they still need more, send them to the back. Stop when person <code>k</code> is done.</p>,
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
            explain: <p>O(total tickets) time. This can be large if one person wants many tickets.</p>,
          },
          {
            name: "Use a formula",
            idea: <p>Person <code>k</code> buys <code>tickets[k]</code> times. A person before <code>k</code> (or <code>k</code> itself) buys at most <code>tickets[k]</code> tickets. A person after <code>k</code> buys at most <code>tickets[k] − 1</code> tickets before <code>k</code> finishes.</p>,
            code: `function timeRequiredToBuy(tickets, k) {
  let time = 0;
  for (let i = 0; i < tickets.length; i++) {
    time += Math.min(tickets[i], i <= k ? tickets[k] : tickets[k] - 1);
  }
  return time;
}

console.log(timeRequiredToBuy([2, 3, 2], 2));    // 6
console.log(timeRequiredToBuy([5, 1, 1, 1], 0)); // 8`,
            explain: <p>O(n). A good path in an interview is to act it out first and then spot the formula. (LeetCode 2073.)</p>,
          },
        ]}
        compare={<p>Start with the simulation. Then show the formula.</p>}
      >
        <p>People stand in a line. Each person wants <code>tickets[i]</code> tickets and buys one per second. If they want more, they go to the back of the line. How long until person <code>k</code> has all their tickets?</p>
      </Problem>

      <Problem
        n={7}
        title="Students unable to eat lunch"
        level="Easy"
        examples={[
          { input: "students = [1, 1, 0, 0], sandwiches = [0, 1, 0, 1]", output: "0", why: "In the end, everyone gets a sandwich they like." },
          { input: "students = [1, 1, 1, 0, 0, 1], sandwiches = [1, 0, 0, 0, 1, 1]", output: "3", why: "The first student takes the 1. Then two students who want 0 take two 0 sandwiches. The next sandwich is 0, but the three students left all want 1, so they are stuck." },
        ]}
        hints={[
          <>Only a student who wants that kind of sandwich takes the top one. The others go to the back of the line. When can this get stuck?</>,
        ]}
        approaches={[
          {
            name: "Simulate the queue",
            idea: <p>Keep sending students to the back until the front student matches the top sandwich. If the whole line goes round once with no match, everyone left is stuck.</p>,
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
            explain: <p>The worst case is O(n²) with these array operations.</p>,
          },
          {
            name: "Count each preference",
            idea: <p>The order of students does not matter for who can eat. Only the counts matter. Go through the sandwiches. If no student wants the top one, stop. The students left are stuck.</p>,
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
            explain: <p>O(n) time and O(1) space. This looks like a simulation question, but it becomes simple counting once you ask what really matters. (LeetCode 1700.)</p>,
          },
        ]}
        compare={<p>Use counting, after you mention the simulation.</p>}
      >
        <p>Students stand in a queue. Each student prefers sandwich type 0 or 1. A stack of sandwiches (also 0 or 1) is on the table. The front student takes the top sandwich if it matches. If not, the student goes to the back. Return how many students never eat.</p>
      </Problem>
    </>
  );
}
