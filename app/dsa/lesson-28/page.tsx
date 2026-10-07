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

const lesson = getDsaLesson("lesson-28");

export const metadata: Metadata = {
  title: `Lesson 28 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Halve the search space every step" },
  { id: "template", label: "The binary search template" },
  { id: "trace", label: "Traced: searching for 9" },
  { id: "bugs", label: "Infinite loops and off-by-one errors" },
  { id: "bounds", label: "Lower bound and upper bound" },
  { id: "first-last", label: "First and last occurrence" },
  { id: "predicate", label: "The general idea: find the first “true”" },
  { id: "rotated", label: "Rotated sorted arrays" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const searchCode = `const nums = [1, 3, 5, 7, 9, 11, 13];
const target = 9;
let lo = 0, hi = nums.length - 1;
while (lo <= hi) {
  const mid = Math.floor((lo + hi) / 2);
  if (nums[mid] === target) break;
  if (nums[mid] < target) lo = mid + 1;
  else hi = mid - 1;
}
console.log(lo <= hi ? "found" : "missing");`;

function searchTrace() {
  const t = tracer();
  const nums = [1, 3, 5, 7, 9, 11, 13];
  const target = 9;
  let lo = 0, hi = nums.length - 1;
  t.step(3, "start", "lo = 0, hi = 6", "If the answer exists, it is somewhere in nums[lo..hi]. For now that is the whole array.", { nums, target, lo, hi });
  while (lo <= hi) {
    t.step(4, "check", `${lo} <= ${hi}? yes`, `${hi - lo + 1} candidate${hi === lo ? "" : "s"} left.`, { nums, target, lo, hi });
    const mid = Math.floor((lo + hi) / 2);
    t.step(5, "run", `mid = ${mid}, nums[mid] = ${nums[mid]}`, "Look at the middle of the remaining range.", { nums, target, lo, hi, mid }, "mid");
    if (nums[mid] === target) {
      t.step(6, "check", `${nums[mid]} === 9? yes`, "Found.", { nums, target, lo, hi, mid });
      break;
    }
    if (nums[mid] < target) {
      lo = mid + 1;
      t.step(7, "update", `${nums[mid]} < 9 → lo = ${lo}`, `9 is bigger than this value, so it cannot be at mid or anywhere left of mid. Discard the left half.`, { nums, target, lo, hi, mid }, "lo");
    } else {
      hi = mid - 1;
      t.step(8, "update", `${nums[mid]} > 9 → hi = ${hi}`, `9 is smaller than this value, so it cannot be at mid or anywhere right of mid. Discard the right half.`, { nums, target, lo, hi, mid }, "hi");
    }
  }
  t.print("found");
  t.step(10, "print", "console.log(…)", "We looked at only 3 items instead of up to 7. For a million items, binary search needs about 20 looks.", { nums, lo, hi });
  return t.steps;
}

const templateCode = `function binarySearch(nums, target) {
  let lo = 0, hi = nums.length - 1;          // search the closed range [lo, hi]
  while (lo <= hi) {                          // non-empty while lo <= hi
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;     // mid is ruled out, so skip it
    else hi = mid - 1;
  }
  return -1;
}

console.log(binarySearch([-1, 0, 3, 5, 9, 12], 9)); // 4
console.log(binarySearch([-1, 0, 3, 5, 9, 12], 2)); // -1`;

const boundsCode = `// First index i with nums[i] >= target (nums.length if none).
function lowerBound(nums, target) {
  let lo = 0, hi = nums.length;               // half-open range [lo, hi)
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] < target) lo = mid + 1;     // mid is too small, so the answer is right of it
    else hi = mid;                            // mid might be the answer, so keep it
  }
  return lo;
}

// First index i with nums[i] > target.
function upperBound(nums, target) {
  let lo = 0, hi = nums.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

const a = [1, 2, 2, 2, 5, 7];
console.log(lowerBound(a, 2), upperBound(a, 2)); // 1 4
console.log(lowerBound(a, 3), upperBound(a, 3)); // 4 4   (3 would be inserted at 4)
console.log(upperBound(a, 2) - lowerBound(a, 2)); // 3   how many 2s`;

const predicateCode = `// The first index where check(i) becomes true, when check gives false…false, true…true.
function firstTrue(lo, hi, check) {          // searches [lo, hi); returns hi if never true
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (check(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

const nums = [1, 2, 2, 2, 5, 7];
console.log(firstTrue(0, nums.length, (i) => nums[i] >= 2)); // 1   lower bound of 2
console.log(firstTrue(0, nums.length, (i) => nums[i] > 2));  // 4   upper bound of 2`;

const rotatedCode = `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {                        // left half lo..mid is sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {                                            // right half mid..hi is sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}

console.log(search([4, 5, 6, 7, 0, 1, 2], 0)); // 4
console.log(search([4, 5, 6, 7, 0, 1, 2], 3)); // -1`;

export default function DsaLessonTwentyEightPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Halve the search space every step</h2>
      <p>
        Think of a number between 1 and 100, and I will guess it. After each guess you only say &ldquo;higher&rdquo; or
        &ldquo;lower&rdquo;. The best plan is to guess the middle each time: 50, then 25 or 75, and so on. Every answer
        removes half of the remaining possibilities. So 7 guesses are always enough (2<sup>7</sup> = 128, which is
        more than 100).
      </p>
      <p>
        <strong>Binary search</strong> is a method that finds a value in a <em>sorted</em> array by checking the middle
        item and throwing away half of the array each time. Compare the target with the middle item. If the middle item
        is too small, the target can only be in the right half. If it is too big, the target can only be in the left
        half. Halving again and again (the loop from Lesson 12) makes the time <strong>O(log n)</strong>. This means
        about 20 steps for a million items and about 30 steps for a billion items. (log n is the number of times you
        can halve n until you reach 1.)
      </p>

      <h2 id="template">The binary search template</h2>
      <p>
        Keep two indices (positions), <code>lo</code> and <code>hi</code>. They mark the range where the target could
        still be. Each step looks at the middle and throws away the half that cannot contain the target.
      </p>
      <CodeBlock lang="js" code={templateCode} />

      <h2 id="trace">Traced: searching for 9</h2>
      <CodeTrace
        code={searchCode}
        steps={searchTrace()}
        caption="Each comparison discards half of what is left. If the target exists, it is always still inside the range [lo, hi]."
      />
      <ArrayBoxes
        values={[1, 3, 5, 7, 9, 11, 13]}
        name="nums"
        highlight={[4]}
        marks={{ 3: "mid 1", 5: "mid 2", 4: "mid 3" }}
        caption="The three middles checked: index 3 (7), index 5 (11), index 4 (9)."
      />

      <h2 id="bugs">Infinite loops and off-by-one errors</h2>
      <p>
        Binary search is short, but it is easy to get wrong. An <strong>off-by-one error</strong> means a boundary is
        wrong by exactly one position. An <strong>infinite loop</strong> is a loop that never ends. Most bugs come from
        mixing two styles. Choose one style and keep its three parts (start, loop condition, moves) consistent. A
        closed range [lo, hi] includes both ends. A half-open range [lo, hi) includes lo but not hi.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Style</th>
              <th>Start</th>
              <th>Loop while</th>
              <th>Moves</th>
              <th>Use for</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Closed [lo, hi]</td><td><code>hi = n − 1</code></td><td><code>lo &lt;= hi</code></td><td><code>lo = mid + 1</code>, <code>hi = mid − 1</code></td><td>Finding an exact value</td></tr>
            <tr><td>Half-open [lo, hi)</td><td><code>hi = n</code></td><td><code>lo &lt; hi</code></td><td><code>lo = mid + 1</code>, <code>hi = mid</code></td><td>Finding a boundary (first index where…)</td></tr>
          </tbody>
        </table>
      </div>
      <Callout kind="warn" label="The infinite-loop check">
        <p className="mb-0">
          Every step must make the range smaller. Take the half-open style with <code>lo &lt; hi</code> and{" "}
          <code>mid = floor((lo + hi) / 2)</code>. Here mid is always less than hi. So <code>hi = mid</code> makes the
          range smaller, and <code>lo = mid + 1</code> does too. If you write <code>lo = mid</code> in that style, the
          loop can run forever when two items are left. When in doubt, dry-run your code with two items.
        </p>
      </Callout>
      <p>
        Writing <code>lo + Math.floor((hi - lo) / 2)</code> instead of <code>(lo + hi) / 2</code> avoids overflow.
        Overflow means a number gets too big for the space that holds it. It happens in languages with fixed-size
        integers, such as Java or C++. JavaScript numbers do not overflow at this size, but many programmers use this
        habit and interviewers recognise it.
      </p>

      <h2 id="bounds">Lower bound and upper bound</h2>
      <p>
        Often you do not need &ldquo;is it there?&rdquo;. You need &ldquo;where does it start?&rdquo;. The{" "}
        <strong>lower bound</strong> is the first index whose value is ≥ target. The <strong>upper bound</strong> is
        the first index whose value is &gt; target. Both use the half-open style. When mid might be the answer, keep it
        with <code>hi = mid</code>.
      </p>
      <CodeBlock lang="js" code={boundsCode} />
      <DryRun
        title="bounds in [1, 2, 2, 2, 5, 7]"
        cols={["target", "lower bound", "upper bound", "meaning"]}
        rows={[
          ["2", "1", "4", "the 2s are at indices 1..3"],
          ["3", "4", "4", "not present; insert at index 4"],
          ["0", "0", "0", "smaller than everything"],
          ["9", "6", "6", "larger than everything (n)"],
        ]}
      />
      <p>The lower bound is also the answer to &ldquo;search insert position&rdquo;. This is the index where the value would go to keep the array sorted.</p>

      <h2 id="first-last">First and last occurrence</h2>
      <p>
        When the array has duplicates, the first occurrence of x is at <code>lowerBound(x)</code> (check that this index
        really holds x). The last occurrence is at <code>upperBound(x) − 1</code>. The count of x is{" "}
        <code>upperBound(x) − lowerBound(x)</code>. This uses two O(log n) searches instead of an O(n) scan.
      </p>

      <h2 id="predicate">The general idea: find the first “true”</h2>
      <p>
        Lower bound and upper bound are the same algorithm with a different test. A <strong>predicate</strong> is a
        function that answers yes or no (true or false). Binary search works whenever a predicate about index i is{" "}
        <strong>false for a while and then true for the rest</strong>, like false, false, false, true, true. Binary
        search finds the first true:
      </p>
      <CodeBlock lang="js" code={predicateCode} />
      <p>
        This view makes binary search very powerful. The &ldquo;array&rdquo; does not even need to exist. Lesson 29
        searches over possible <em>answers</em> instead of indices.
      </p>

      <h2 id="rotated">Rotated sorted arrays</h2>
      <p>
        A <strong>rotated sorted array</strong> is a sorted array whose front part was moved to the back, at a point you
        do not know. An example is <code>[4, 5, 6, 7, 0, 1, 2]</code>. The whole array is not sorted. But when you cut
        it at any mid, <strong>at least one half is sorted</strong> (this lesson assumes all values are different).
        Check which half is sorted by comparing <code>nums[lo]</code> with <code>nums[mid]</code>. If the target lies
        inside the range of that sorted half, search that half. Otherwise search the other half.
      </p>
      <CodeBlock lang="js" code={rotatedCode} />
      <DryRun
        title="search([4, 5, 6, 7, 0, 1, 2], 0)"
        cols={["lo", "hi", "mid", "sorted half", "0 inside it?", "next"]}
        rows={[
          ["0", "6", "3 (7)", "left: 4..7", "no", "lo = 4"],
          ["4", "6", "5 (1)", "left: 0..1", "yes", "hi = 4"],
          ["4", "4", "4 (0)", "—", "found", "return 4"],
        ]}
        highlight={2}
      />

      <h2 id="practice">Practice questions</h2>
      <p>For each question, first write the yes/no test that changes from false to true. The code then follows from it.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the closed-range binary search from memory, and dry-run it with a missing target.</>,
          <>Write lower bound in the half-open style and explain why <code>hi = mid</code> (not <code>mid − 1</code>).</>,
          <>Explain how to count occurrences of x in a sorted array in O(log n).</>,
          <>Explain why one half of a rotated sorted array is always sorted.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Lesson 29 uses the &ldquo;first true&rdquo; idea on answers: the smallest speed, the smallest capacity, the
        largest minimum. Sometimes checking a guess is easy, but finding the answer directly is hard. Then binary
        search on the answer often solves the problem.
      </p>
    </DsaLessonPage>
  );
}
