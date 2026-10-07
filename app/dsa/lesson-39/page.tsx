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

const lesson = getDsaLesson("lesson-39");

export const metadata: Metadata = {
  title: `Lesson 39 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "First in, first out" },
  { id: "shift", label: "Why shift() is slow" },
  { id: "queue", label: "A queue with a head index" },
  { id: "two-stacks", label: "A queue made of two stacks" },
  { id: "circular", label: "The circular queue" },
  { id: "deque", label: "Deque: both ends" },
  { id: "window", label: "Sliding window maximum" },
  { id: "trace", label: "Traced: window maximum of 1 3 -1 -3 5 3 6 7" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const arrayQueueCode = `const queue = [];
queue.push("a");            // enqueue at the back
queue.push("b");
queue.push("c");
console.log(queue.shift()); // a   dequeue from the front
console.log(queue.shift()); // b
console.log(queue[0]);      // c   peek the front
console.log(queue.length);  // 1`;

const queueCode = `class Queue {
  constructor() { this.items = []; this.head = 0; }          // head = index of the front item
  enqueue(x) { this.items.push(x); }
  dequeue() {
    if (this.head >= this.items.length) return undefined;
    const x = this.items[this.head];
    this.items[this.head] = undefined;                        // let the value be garbage collected
    this.head++;
    if (this.head > 1000 && this.head * 2 > this.items.length) {   // compact now and then so the array does not grow forever
      this.items = this.items.slice(this.head);
      this.head = 0;
    }
    return x;
  }
  peek() { return this.items[this.head]; }
  get size() { return this.items.length - this.head; }
}

const q = new Queue();
q.enqueue(1); q.enqueue(2); q.enqueue(3);
console.log(q.dequeue()); // 1
console.log(q.peek());    // 2
console.log(q.size);      // 2`;

const twoStacksCode = `class MyQueue {
  constructor() { this.inStack = []; this.outStack = []; }
  push(x) { this.inStack.push(x); }                    // new items always go on the in-stack
  #moveIfNeeded() {
    if (this.outStack.length === 0) {
      while (this.inStack.length) this.outStack.push(this.inStack.pop());   // reversing a stack puts the OLDEST on top
    }
  }
  pop()  { this.#moveIfNeeded(); return this.outStack.pop(); }
  peek() { this.#moveIfNeeded(); return this.outStack[this.outStack.length - 1]; }
  empty() { return this.inStack.length === 0 && this.outStack.length === 0; }
}

const q = new MyQueue();
q.push(1); q.push(2); q.push(3);
console.log(q.pop());   // 1  (moves 1,2,3 across; 1 ends on top)
q.push(4);
console.log(q.pop());   // 2  (the out-stack still holds 2 and 3, so no refill)
console.log(q.pop());   // 3
console.log(q.pop());   // 4  (out-stack empty: move 4 across)`;

const circularCode = `class CircularQueue {
  constructor(k) { this.buf = new Array(k); this.cap = k; this.head = 0; this.size = 0; }
  enQueue(x) {
    if (this.size === this.cap) return false;
    this.buf[(this.head + this.size) % this.cap] = x;   // the slot after the last item, wrapping around
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
  Rear()  { return this.size === 0 ? -1 : this.buf[(this.head + this.size - 1) % this.cap]; }
}

const q = new CircularQueue(3);
console.log(q.enQueue(1), q.enQueue(2), q.enQueue(3), q.enQueue(4)); // true true true false
console.log(q.Rear());      // 3
q.deQueue();                // frees slot 0
console.log(q.enQueue(4));  // true  (4 is stored in slot 0, wrapping around)
console.log(q.Rear());      // 4`;

const windowCode = `function maxSlidingWindow(nums, k) {
  const dq = [];                 // indices; their values are in DECREASING order, so dq[0] is the window maximum
  const out = [];
  for (let i = 0; i < nums.length; i++) {
    while (dq.length && dq[0] <= i - k) dq.shift();                       // 1. front fell out of the window
    while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();     // 2. smaller values at the back can never be the maximum again
    dq.push(i);                                                           // 3. add the new index
    if (i >= k - 1) out.push(nums[dq[0]]);                                // 4. a full window: the front is its maximum
  }
  return out;
}

console.log(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3)); // [3, 3, 5, 5, 6, 7]
console.log(maxSlidingWindow([1], 1));                        // [1]`;

const traceSrc = `const dq = [];
const out = [];
for (let i = 0; i < nums.length; i++) {
  while (dq.length && dq[0] <= i - k) dq.shift();
  while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
  dq.push(i);
  if (i >= k - 1) out.push(nums[dq[0]]);
}`;

function windowTrace() {
  const t = tracer();
  const nums = [1, 3, -1, -3, 5, 3, 6, 7];
  const k = 3;
  const dq: number[] = [];
  const out: number[] = [];
  const vals = () => dq.map((i) => nums[i]);
  t.step(1, "start", "dq = [], out = []", "The deque (a list you can add to and remove from at both ends) holds positions (indices). Their values go down from front to back. The front is always the biggest value in the current window.", { k, dq: [], out: [] });
  for (let i = 0; i < nums.length; i++) {
    t.step(3, "check", `i = ${i}, nums[i] = ${nums[i]}`, `The window now covers positions ${Math.max(0, i - k + 1)} to ${i}.`, { i, "dq values": vals(), out: [...out] }, "i");
    if (dq.length && dq[0] <= i - k) {
      const gone = dq.shift()!;
      t.step(4, "update", `front index ${gone} left the window`, `Position ${gone} is before position ${i - k + 1}, so it is outside the window. Its value ${nums[gone]} no longer counts.`, { i, "dq values": vals(), out: [...out] }, "dq values");
    }
    while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) {
      const popped = dq.pop()!;
      t.step(5, "update", `pop ${nums[popped]} from the back`, `${nums[popped]} ≤ ${nums[i]} and it is older. So it can never be the biggest value while ${nums[i]} is in the window.`, { i, "dq values": vals(), out: [...out] }, "dq values");
    }
    dq.push(i);
    t.step(6, "update", `push index ${i}`, `The values in the deque still go down from front to back: ${vals().join(", ")}.`, { i, "dq values": vals(), out: [...out] }, "dq values");
    if (i >= k - 1) {
      out.push(nums[dq[0]]);
      t.step(7, "update", `window max = ${nums[dq[0]]}`, `The front of the deque is the biggest value in this window.`, { i, "dq values": vals(), out: [...out] }, "out");
    }
  }
  return t.steps;
}

export default function DsaLessonThirtyNinePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">First in, first out</h2>
      <p>
        A <strong>queue</strong> is like a line at a ticket counter. People join at the back and are served from the front. So
        whoever arrived first leaves first. This rule is <strong>FIFO</strong>: first in, first out. It is the opposite of a stack.
        The operations are:
      </p>
      <ul>
        <li><strong>enqueue</strong> — add to the back.</li>
        <li><strong>dequeue</strong> — remove from the front and return it.</li>
        <li><strong>peek</strong> — look at the front.</li>
      </ul>
      <p>
        Queues fit anything where the order of arrival matters. Examples are print jobs and messages waiting for a worker. Later in the course,
        you will also use a queue for breadth-first search (visiting a tree or graph level by level).
      </p>
      <CodeBlock lang="js" code={arrayQueueCode} />

      <h2 id="shift">Why shift() is a trap</h2>
      <p>
        Using <code>push</code> with <code>shift</code> works, and it is fine for small data. But <code>shift()</code> removes the{" "}
        <em>first</em> item. By the rules of the language, every other item then has to move one place to the left. That makes each
        dequeue <strong>O(n)</strong>, so the time grows with the size of the array. Engines such as V8 (the part of Chrome and Node.js that runs JavaScript) have tricks that make <code>shift</code> fast for arrays up to a certain size. But those tricks can change, and they stop helping on large arrays. In an interview, you can say &quot;shift is O(n), so I
        will track a head index instead&quot;. That shows you know how arrays really work.
      </p>
      <Callout kind="warn" label="Hidden O(n²) slowness">
        Imagine a BFS (breadth-first search) that calls <code>shift()</code> once per node on a queue of 100,000 items. It can quietly turn an O(n) algorithm into
        an O(n²) one. If you are not sure, use a head index.
      </Callout>

      <h2 id="queue">A queue with a head index</h2>
      <p>
        Do not remove the front item. Leave it in place and move a <code>head</code> index (a number that points to the front item) forward. Dequeue and enqueue are
        both O(1). The array only grows, so now and then cut off the part you have already used. This clean-up is &quot;amortised&quot; O(1), which means its cost averages out to O(1) per operation.
      </p>
      <CodeBlock lang="js" code={queueCode} />

      <h2 id="two-stacks">A queue made of two stacks</h2>
      <p>
        This is a classic question: build a queue using only stacks. Keep an <strong>in-stack</strong> for new items. For{" "}
        <code>pop</code> and <code>peek</code>, use an <strong>out-stack</strong>. When the out-stack is empty, pour the whole in-stack into it. Pouring
        <em> reverses</em> the order. So the oldest item ends up on top, and that is exactly the item a queue must return.
      </p>
      <CodeBlock lang="js" code={twoStacksCode} />
      <DryRun
        title="why the average cost is O(1)"
        cols={["Fact", "Consequence"]}
        rows={[
          ["An item moves from the in-stack to the out-stack at most once", "the total moving work is at most the number of pushes"],
          ["Most pops find the out-stack already filled", "they cost O(1)"],
          ["One pop may move many items", "one single operation can be O(n)..."],
          ["...but earlier pushes already paid for that work", "amortised O(1) per operation"],
        ]}
        note="Amortised means averaged over a whole series of operations. It is not a promise for each single operation."
      />

      <h2 id="circular">The circular queue</h2>
      <p>
        A queue with a fixed capacity (a fixed maximum size) can reuse the space left behind by removed items. It does this by <strong>wrapping around</strong> the
        array, like a clock that goes from 12 back to 1. Keep the index of the front and the count of items. The next free slot is <code>(head + size) % capacity</code>.
        The modulo (<code>%</code>, the remainder after division) connects the end of the array back to its start. Keeping <code>size</code> as its own number also avoids the
        common mix-up between &quot;empty&quot; and &quot;full&quot;.
      </p>
      <CodeBlock lang="js" code={circularCode} />

      <h2 id="deque">Deque: both ends</h2>
      <p>
        A <strong>deque</strong> (say &quot;deck&quot;; it means double-ended queue) lets you add and remove at <em>both</em> ends. It can act as
        a stack, as a queue, or as something in between. JavaScript has no built-in deque. With an array, the back is fast
        (<code>push</code>, <code>pop</code>) and the front is slow (<code>shift</code>, <code>unshift</code>). In an interview, you can write
        &quot;deque&quot; and use an array (or a head-index class). Add a note that real code would use a proper deque.
      </p>

      <h2 id="window">Sliding window maximum</h2>
      <p>
        Find the biggest value in every window of size <em>k</em> (a window is k values side by side that slides along the array). Checking each window again from scratch costs O(n·k). The trick is to keep only the
        <em> candidates</em> that could still become the biggest value. Keep them in a deque of indices:
      </p>
      <ol>
        <li>Remove the front if its index is now outside the window.</li>
        <li>Remove from the back every value that is <strong>not larger</strong> than the new value. It is older and smaller. So it can never beat the new value while the new value is in the window.</li>
        <li>Add the new index at the back. The values in the deque now go down from front to back.</li>
        <li>Once the first window is full, the front of the deque is the biggest value.</li>
      </ol>
      <CodeBlock lang="js" code={windowCode} />
      <p>
        Every index enters and leaves the deque at most once, so the total work is <strong>O(n)</strong>. (With a plain array,
        <code> dq.shift()</code> itself can cost up to O(k). Question 4 shows a version with a head index where every step is truly O(1).)
      </p>

      <h2 id="trace">Traced: window maximum of 1 3 -1 -3 5 3 6 7</h2>
      <CodeTrace
        code={traceSrc}
        steps={windowTrace()}
        caption="The deque shows values (the real code stores their indices). Watch how a big new value removes every smaller value behind it."
      />
      <Callout kind="ok" label="Same idea, next lesson">
        Keeping a sequence in order (always going up, or always going down) by throwing away items that can no longer matter is called a{" "}
        <strong>monotonic</strong> structure. Lesson 40 uses a monotonic <em>stack</em> to find the next greater element.
      </Callout>

      <h2 id="practice">Practice questions</h2>
      <p>First decide which end each operation uses. That tells you whether you need a stack, a queue or a deque.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Explain FIFO. Explain why <code>Array.shift()</code> is a poor way to dequeue.</>,
          <>Describe how two stacks can make a queue. Explain why each item moves at most once.</>,
          <>Write the formula for the index of the next free slot in a circular queue. Explain what the modulo does.</>,
          <>Say the rule that always stays true for the sliding-window deque (an invariant). Name the two kinds of removal.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        <strong>Lesson 40</strong> finishes this part with the <strong>monotonic stack</strong> (a stack whose values always go up or always go down). You will solve: next greater element, daily
        temperatures, stock span, the largest rectangle in a histogram, and trapping rain water.
      </p>
    </DsaLessonPage>
  );
}
