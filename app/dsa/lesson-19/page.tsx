import type { Metadata } from "next";
import ArrayBoxes from "@/components/dsa/ArrayBoxes";
import Callout from "@/components/Callout";
import CodeTrace from "@/components/dsa/CodeTrace";
import DryRun from "@/components/dsa/DryRun";
import DsaLessonPage from "@/components/dsa/DsaLesson";
import Questions from "./questions";
import Recall from "@/components/dsa/Recall";
import CodeBlock from "@/components/sd/CodeBlock";
import { getDsaLesson } from "@/lib/dsa";
import { tracer } from "@/lib/dsa-trace";

const lesson = getDsaLesson("lesson-19");

export const metadata: Metadata = {
  title: `Lesson 19 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "The problems every array round starts with" },
  { id: "extremes", label: "Largest, second largest, and is it sorted?" },
  { id: "write", label: "The read/write pointer pattern" },
  { id: "trace", label: "Traced: removing duplicates in place" },
  { id: "zeros", label: "Moving zeros to the end" },
  { id: "rotate", label: "Rotating by k: the reversal method" },
  { id: "missing", label: "Missing number and single number (XOR)" },
  { id: "union", label: "Union of two sorted arrays" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const sortedCode = `function isSorted(nums) {
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] < nums[i - 1]) return false;   // one step down is enough to fail
  }
  return true;
}

console.log(isSorted([1, 2, 2, 7])); // true
console.log(isSorted([1, 3, 2]));    // false`;

const dedupCode = `const nums = [1, 1, 2, 3, 3];
let write = 1;
for (let read = 1; read < nums.length; read++) {
  if (nums[read] !== nums[write - 1]) {
    nums[write] = nums[read];
    write++;
  }
}
console.log(write, nums.slice(0, write));`;

function dedupTrace() {
  const t = tracer();
  const nums = [1, 1, 2, 3, 3];
  t.step(1, "start", "nums = [1, 1, 2, 3, 3]", "Sorted, so equal values sit next to each other.", { nums: [...nums] }, "nums");
  let write = 1;
  t.step(2, "start", "write = 1", "nums[0] is always kept. write is where the next new value will go.", { nums: [...nums], write }, "write");
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[write - 1]) {
      t.step(4, "check", `nums[${read}] = ${nums[read]} !== last kept ${nums[write - 1]}? yes`, "A new value: keep it.", { nums: [...nums], write, read }, "read");
      nums[write] = nums[read];
      t.step(5, "update", `nums[${write}] = ${nums[read]}`, "Copy it to the write position.", { nums: [...nums], write, read }, "nums");
      write++;
      t.step(6, "update", `write = ${write}`, "The kept part grows by one.", { nums: [...nums], write, read }, "write");
    } else {
      t.step(4, "check", `nums[${read}] = ${nums[read]} !== last kept ${nums[write - 1]}? no`, "A duplicate: skip it. Only read moves on.", { nums: [...nums], write, read }, "read");
    }
  }
  t.print("3 [ 1, 2, 3 ]");
  t.step(9, "print", "console.log(write, …)", "The first 3 positions hold the unique values. Whatever is after them no longer matters.", { nums: [...nums], write });
  return t.steps;
}

const zerosCode = `function moveZeroes(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      [nums[write], nums[read]] = [nums[read], nums[write]];
      write++;
    }
  }
  return nums;
}

console.log(moveZeroes([0, 1, 0, 3, 12])); // [ 1, 3, 12, 0, 0 ]`;

const rotateCode = `function reverse(nums, i, j) {
  while (i < j) {
    [nums[i], nums[j]] = [nums[j], nums[i]];
    i++;
    j--;
  }
}

function rotate(nums, k) {
  const n = nums.length;
  k %= n;                       // rotating by n changes nothing
  reverse(nums, 0, n - 1);      // 1. reverse everything
  reverse(nums, 0, k - 1);      // 2. reverse the first k
  reverse(nums, k, n - 1);      // 3. reverse the rest
  return nums;
}

console.log(rotate([1, 2, 3, 4, 5, 6, 7], 3)); // [ 5, 6, 7, 1, 2, 3, 4 ]`;

const xorCode = `console.log(5 ^ 5);          // 0   a value XOR itself is 0
console.log(5 ^ 0);          // 5   XOR with 0 changes nothing
console.log(4 ^ 1 ^ 4);      // 1   order does not matter; the pair of 4s cancels

function singleNumber(nums) {
  let x = 0;
  for (const v of nums) x ^= v;
  return x;
}

console.log(singleNumber([4, 1, 2, 1, 2])); // 4`;

const unionCode = `function unionSorted(a, b) {
  const out = [];
  let i = 0, j = 0;
  const add = (v) => { if (out[out.length - 1] !== v) out.push(v); };   // skip repeats
  while (i < a.length && j < b.length) {
    if (a[i] < b[j]) add(a[i++]);
    else if (a[i] > b[j]) add(b[j++]);
    else { add(a[i]); i++; j++; }
  }
  while (i < a.length) add(a[i++]);
  while (j < b.length) add(b[j++]);
  return out;
}

console.log(unionSorted([1, 2, 2, 4], [2, 3, 5])); // [ 1, 2, 3, 4, 5 ]`;

export default function DsaLessonNineteenPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">The problems every array round starts with</h2>
      <p>
        Part 4 is about arrays — the data structure behind most interview questions. This first lesson
        collects the classic &ldquo;warm-up&rdquo; problems. Each takes one or two passes, and each teaches a
        small technique you will reuse: a write pointer, a reversal, XOR, or a merge-style walk.
      </p>
      <p>
        Interviewers often add one rule to these problems: <strong>in place</strong> — change the given array
        and use only O(1) extra memory. That rule is what makes them interesting.
      </p>

      <h2 id="extremes">Largest, second largest, and is it sorted?</h2>
      <p>
        You have met the first two already: the &ldquo;best so far&rdquo; loop (Lesson 8) and the two-variable
        second largest (Lesson 11). Checking whether an array is sorted is the same kind of single pass — compare
        each item with the one before it:
      </p>
      <CodeBlock lang="js" code={sortedCode} />

      <h2 id="write">The read/write pointer pattern</h2>
      <p>
        Many in-place problems ask you to keep some items and drop others. Use two indices moving in the same
        direction:
      </p>
      <ul>
        <li><strong>read</strong> visits every item, one by one.</li>
        <li><strong>write</strong> points to where the next kept item should go. It never gets ahead of read.</li>
      </ul>
      <p>
        When read finds an item to keep, copy it to <code>write</code> and move write forward. At the end, the
        first <code>write</code> positions hold the answer. This is the &ldquo;same-direction&rdquo; form of two
        pointers (Lesson 21).
      </p>

      <h2 id="trace">Traced: removing duplicates in place</h2>
      <CodeTrace
        code={dedupCode}
        steps={dedupTrace()}
        caption="read checks every item; write only moves when a new value appears. Because the array is sorted, a value is new exactly when it differs from the last kept one."
      />
      <p>One pass, O(n) time, O(1) space. Without the &ldquo;sorted&rdquo; guarantee you would need a Set to know what is new.</p>

      <h2 id="zeros">Moving zeros to the end</h2>
      <p>
        Same pattern: keep the non-zero values, in order, at the front. Using a <em>swap</em> instead of a copy
        means the zeros automatically collect behind the write pointer.
      </p>
      <CodeBlock lang="js" code={zerosCode} />
      <DryRun
        title="moveZeroes([0, 1, 0, 3, 12])"
        cols={["read", "nums[read]", "Action", "Array after", "write"]}
        rows={[
          ["0", "0", "skip", "[0, 1, 0, 3, 12]", "0"],
          ["1", "1", "swap with index 0", "[1, 0, 0, 3, 12]", "1"],
          ["2", "0", "skip", "[1, 0, 0, 3, 12]", "1"],
          ["3", "3", "swap with index 1", "[1, 3, 0, 0, 12]", "2"],
          ["4", "12", "swap with index 2", "[1, 3, 12, 0, 0]", "3"],
        ]}
        highlight={4}
      />

      <h2 id="rotate">Rotating by k: the reversal method</h2>
      <p>
        Rotating right by k moves the last k items to the front: <code>[1, 2, 3, 4, 5, 6, 7]</code> rotated by 3
        is <code>[5, 6, 7, 1, 2, 3, 4]</code>. Moving one step at a time k times is O(n × k). Copying into a new
        array is O(n) but uses O(n) space. The reversal method does it in O(n) time and O(1) space with three
        reversals:
      </p>
      <DryRun
        title="rotate [1, 2, 3, 4, 5, 6, 7] by k = 3"
        cols={["Step", "Array"]}
        rows={[
          ["start", "[1, 2, 3, 4, 5, 6, 7]"],
          ["1. reverse all", "[7, 6, 5, 4, 3, 2, 1]"],
          ["2. reverse first k = 3", "[5, 6, 7, 4, 3, 2, 1]"],
          ["3. reverse the rest", "[5, 6, 7, 1, 2, 3, 4]"],
        ]}
        highlight={3}
        note="Reversing everything puts the last k items at the front, but backwards. Steps 2 and 3 put each block back in its original order."
      />
      <CodeBlock lang="js" code={rotateCode} />
      <Callout kind="warn" label="Remember k %= n">
        <p className="mb-0">
          k can be larger than the array length. Rotating 7 items by 10 is the same as rotating by 3. Without the
          remainder, the reversal ranges go out of bounds.
        </p>
      </Callout>

      <h2 id="missing">Missing number and single number (XOR)</h2>
      <p>
        Lesson 11 found the missing number with &ldquo;expected sum minus actual sum&rdquo;. A related classic:
        every value appears twice except one — find it. A frequency map works with O(n) space. For O(1) space, use{" "}
        <strong>XOR</strong> (<code>^</code>), an operator that works on the binary digits of numbers. You only
        need three facts about it:
      </p>
      <CodeBlock lang="js" code={xorCode} />
      <p>
        XOR everything together: every pair cancels to 0, and only the single value is left. Lesson 58 explains
        what XOR does to the individual bits.
      </p>
      <ArrayBoxes
        values={[4, 1, 2, 1, 2]}
        name="nums"
        highlight={[0]}
        caption="1 ^ 1 = 0 and 2 ^ 2 = 0, so XOR-ing all five values leaves 4."
      />

      <h2 id="union">Union of two sorted arrays</h2>
      <p>
        The union contains every value that is in either array, once. With sorted input, walk both arrays like
        the merge step of merge sort (Lesson 17), skipping a value if it equals the last one added:
      </p>
      <CodeBlock lang="js" code={unionCode} />
      <p>O(n + m) time. The intersection works the same way, adding a value only when both fronts are equal (Lesson 17, Question 4).</p>

      <h2 id="practice">Practice questions</h2>
      <p>Every question here can be solved in one or two passes. Aim for O(1) extra space where the question asks for it.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Explain the read/write pointer pattern and write remove-duplicates from memory.</>,
          <>Rotate [1, 2, 3, 4, 5] by k = 2 using the three reversals, on paper.</>,
          <>State the three XOR facts that make the single-number trick work.</>,
          <>Write the union of two sorted arrays without repeats.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Lesson 20 introduces the <strong>prefix sum</strong>: one extra array of running totals that makes the sum
        of any range instant. It is the first pattern in this series that turns a whole family of O(n²) problems
        into O(n).
      </p>
    </DsaLessonPage>
  );
}
