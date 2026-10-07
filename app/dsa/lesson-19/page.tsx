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
        Part 4 is about arrays. An array is a list of values stored one after another, and each value has a
        position number called an index. Most interview questions use arrays. This first lesson collects the
        classic &ldquo;warm-up&rdquo; problems. Each one needs only one or two passes (a pass is one trip through
        the array from start to end). Each one also teaches a small technique you will use again: a write pointer,
        a reversal, XOR, or a merge-style walk.
      </p>
      <p>
        A <strong>pointer</strong> here is just a variable that holds an index. It &ldquo;points&rdquo; at one
        place in the array, like a finger on a line of text.
      </p>
      <p>
        Interviewers often add one rule: <strong>in place</strong>. In place means you change the array you were
        given, and you do not make a second big array. You may use only O(1) extra memory. O(1) means a small,
        fixed amount of memory (a few variables), however long the array is. This rule makes the problems
        interesting.
      </p>

      <h2 id="extremes">Largest, second largest, and is it sorted?</h2>
      <p>
        You have met the first two already: the &ldquo;best so far&rdquo; loop (Lesson 8) and the two-variable
        second largest (Lesson 11). Checking whether an array is sorted is the same kind of single pass. Compare
        each item with the one before it. One step down is enough to say &ldquo;not sorted&rdquo;:
      </p>
      <CodeBlock lang="js" code={sortedCode} />

      <h2 id="write">The read/write pointer pattern</h2>
      <p>
        Many in-place problems ask you to keep some items and drop the others. For these, use two pointers that
        move in the same direction:
      </p>
      <ul>
        <li><strong>read</strong> looks at every item, one by one.</li>
        <li><strong>write</strong> marks the place where the next kept item should go. It never gets ahead of read.</li>
      </ul>
      <p>
        When read finds an item to keep, copy it to <code>write</code>, then move write forward by one. At the end,
        the first <code>write</code> positions hold the answer. This is the &ldquo;same-direction&rdquo; form of
        the two-pointer technique (Lesson 21).
      </p>

      <h2 id="trace">Traced: removing duplicates in place</h2>
      <CodeTrace
        code={dedupCode}
        steps={dedupTrace()}
        caption="read checks every item; write only moves when a new value appears. Because the array is sorted, a value is new exactly when it differs from the last kept one."
      />
      <p>
        This takes one pass: O(n) time (the steps grow in line with the array length n) and O(1) space. If the
        array were not sorted, you would need a Set to know which values you have already seen. A Set is a
        collection that keeps each value only once and can tell you quickly whether it holds a value.
      </p>

      <h2 id="zeros">Moving zeros to the end</h2>
      <p>
        This uses the same pattern. Keep the non-zero values, in order, at the front. A <em>swap</em> exchanges
        two values. If you swap instead of copy, the zeros move to the back by themselves.
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
        Rotating right by k moves the last k items to the front. For example, <code>[1, 2, 3, 4, 5, 6, 7]</code>{" "}
        rotated by 3 is <code>[5, 6, 7, 1, 2, 3, 4]</code>. There are three ways to do it. Moving every item one
        step, k times, costs O(n × k). Copying into a new array costs O(n) time but also O(n) extra space. The
        reversal method needs only O(n) time and O(1) space. It uses three reversals:
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
        note="Reversing everything puts the last k items at the front, but backwards. Steps 2 and 3 turn each block the right way round again."
      />
      <CodeBlock lang="js" code={rotateCode} />
      <Callout kind="warn" label="Remember k %= n">
        <p className="mb-0">
          k can be larger than the array length. Rotating 7 items by 10 is the same as rotating by 3. The{" "}
          <code>%</code> operator gives the remainder after division (10 % 7 = 3). Without it, the reversal ranges
          would go past the end of the array.
        </p>
      </Callout>

      <h2 id="missing">Missing number and single number (XOR)</h2>
      <p>
        Lesson 11 found the missing number with &ldquo;expected sum minus actual sum&rdquo;. Here is a related
        classic. Every value appears twice, except one value. Find that one. A frequency map (a Map that counts
        each value) works, but it needs O(n) space. For O(1) space, use <strong>XOR</strong>.
      </p>
      <p>
        XOR (written <code>^</code> in JavaScript) is an operator that compares two numbers bit by bit. A bit is
        one binary digit, 0 or 1. For each bit, XOR gives 1 if the two bits are different and 0 if they are the
        same. You only need three facts about it:
      </p>
      <CodeBlock lang="js" code={xorCode} />
      <p>
        Now XOR all the values together. Every pair cancels to 0, and only the single value is left. Lesson 58
        explains XOR on the individual bits in more detail.
      </p>
      <ArrayBoxes
        values={[4, 1, 2, 1, 2]}
        name="nums"
        highlight={[0]}
        caption="1 ^ 1 = 0 and 2 ^ 2 = 0, so XOR-ing all five values leaves 4."
      />

      <h2 id="union">Union of two sorted arrays</h2>
      <p>
        The union of two arrays holds every value that is in either array, each value once. If both arrays are
        sorted, walk through them together, like the merge step of merge sort (Lesson 17). Skip a value if it
        equals the last value you added:
      </p>
      <CodeBlock lang="js" code={unionCode} />
      <p>
        This takes O(n + m) time, where n and m are the two array lengths. The intersection (the values found in
        both arrays) works the same way. Add a value only when both front values are equal (Lesson 17, Question 4).
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>You can solve every question here in one or two passes. Aim for O(1) extra space when the question asks for it.</p>

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
        Lesson 20 introduces the <strong>prefix sum</strong>. It is one extra array of running totals. With it, you
        can get the sum of any range of items almost instantly. It is the first pattern in this series that turns
        a whole group of O(n²) problems into O(n).
      </p>
    </DsaLessonPage>
  );
}
