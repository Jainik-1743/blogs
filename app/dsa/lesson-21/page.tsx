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

const lesson = getDsaLesson("lesson-21");

export const metadata: Metadata = {
  title: `Lesson 21 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Two indices instead of two loops" },
  { id: "pair", label: "Pair sum in a sorted array" },
  { id: "trace", label: "Traced: find two values adding to 10" },
  { id: "why", label: "Why it never misses the answer" },
  { id: "same", label: "Same-direction pointers" },
  { id: "threesum", label: "3Sum: fix one, two-pointer the rest" },
  { id: "water", label: "Container with most water" },
  { id: "flag", label: "Three-way partition (Dutch national flag)" },
  { id: "templates", label: "The templates side by side" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const pairCode = `const nums = [1, 3, 4, 6, 8, 11];
const target = 10;
let l = 0, r = nums.length - 1;
while (l < r) {
  const sum = nums[l] + nums[r];
  if (sum === target) break;
  if (sum < target) l++;
  else r--;
}
console.log(l, r);`;

function pairTrace() {
  const t = tracer();
  const nums = [1, 3, 4, 6, 8, 11];
  const target = 10;
  t.step(1, "start", "nums is sorted", "Smallest on the left, largest on the right.", { nums, target });
  let l = 0, r = nums.length - 1;
  t.step(3, "start", "l = 0, r = 5", "One pointer at each end.", { nums, target, l, r }, "l");
  while (l < r) {
    const sum = nums[l] + nums[r];
    t.step(5, "run", `sum = ${nums[l]} + ${nums[r]} = ${sum}`, "Add the two values under the pointers.", { nums, target, l, r, sum }, "sum");
    if (sum === target) {
      t.step(6, "check", `${sum} === 10? yes`, "Found the pair.", { nums, target, l, r, sum });
      break;
    }
    if (sum < target) {
      l++;
      t.step(7, "update", `${sum} < 10 → l = ${l}`, `Too small. ${nums[l - 1]} with the largest remaining value is still too small, so ${nums[l - 1]} cannot be in any answer. Drop it.`, { nums, target, l, r, sum }, "l");
    } else {
      r--;
      t.step(8, "update", `${sum} > 10 → r = ${r}`, `Too big. ${nums[r + 1]} with the smallest remaining value is already too big, so ${nums[r + 1]} cannot be in any answer. Drop it.`, { nums, target, l, r, sum }, "r");
    }
  }
  t.print(`${l} ${r}`);
  t.step(10, "print", "console.log(l, r)", "nums[2] + nums[3] = 4 + 6 = 10, found in 5 steps instead of checking all 15 pairs.", { nums, l, r });
  return t.steps;
}

const subseqCode = `// Is s a subsequence of t? (Letters of s appear in t in order, not necessarily together.)
function isSubsequence(s, t) {
  let i = 0;                                  // position in s
  for (let j = 0; j < t.length && i < s.length; j++) {
    if (s[i] === t[j]) i++;                   // matched one more letter of s
  }
  return i === s.length;
}

console.log(isSubsequence("ace", "abcde")); // true
console.log(isSubsequence("aec", "abcde")); // false`;

const threeSumCode = `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;      // same first value: skip
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];
      if (sum < 0) l++;
      else if (sum > 0) r--;
      else {
        out.push([nums[i], nums[l], nums[r]]);
        l++;
        r--;
        while (l < r && nums[l] === nums[l - 1]) l++;    // skip repeated second values
      }
    }
  }
  return out;
}

console.log(threeSum([-1, 0, 1, 2, -1, -4]));
// [ [ -1, -1, 2 ], [ -1, 0, 1 ] ]`;

const waterCode = `function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    const area = Math.min(height[l], height[r]) * (r - l);
    best = Math.max(best, area);
    if (height[l] < height[r]) l++;     // the shorter line limits the area: move it
    else r--;
  }
  return best;
}

console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49`;

const flagCode = `function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;                                // do not move mid: the new value is unchecked
    }
  }
  return nums;
}

console.log(sortColors([2, 0, 2, 1, 1, 0])); // [ 0, 0, 1, 1, 2, 2 ]`;

export default function DsaLessonTwentyOnePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Two indices instead of two loops</h2>
      <p>
        Many array problems look at <em>pairs</em> of items. The obvious solution is a loop inside a loop, which
        costs O(n²) steps. The <strong>two-pointer</strong> technique uses two indices (called pointers) instead
        of two loops. Each pointer moves through the array only once, so the total is O(n). It comes in two forms:
      </p>
      <ul>
        <li><strong>From both ends</strong>. The pointers start at the two ends and move towards each other. You usually use this on a sorted array.</li>
        <li><strong>In the same direction</strong>. One pointer stays ahead of the other. This is the read/write pattern from Lesson 19.</li>
      </ul>
      <p>The main skill is knowing <em>which pointer to move</em>. You must also be able to explain why that move cannot skip the answer.</p>

      <h2 id="pair">Pair sum in a sorted array</h2>
      <p>
        Find two values in a <strong>sorted</strong> array (smallest first) that add up to a target. Put{" "}
        <code>l</code> (left) at the start and <code>r</code> (right) at the end. If the sum is too small, the only
        way to make it bigger is to move <code>l</code> to the right. If the sum is too big, move <code>r</code> to
        the left.
      </p>

      <h2 id="trace">Traced: find two values adding to 10</h2>
      <CodeTrace
        code={pairCode}
        steps={pairTrace()}
        caption="Each step discards one value for good. At most n − 1 steps, so O(n)."
      />
      <ArrayBoxes values={[1, 3, 4, 6, 8, 11]} name="nums" highlight={[2, 3]} marks={{ 2: "l", 3: "r" }} caption="Where the pointers stop: 4 + 6 = 10." />

      <h2 id="why">Why it never misses the answer</h2>
      <p>
        Interviewers often ask this question. Say <code>nums[l] + nums[r]</code> is too small. Because the array is
        sorted, every other partner for <code>nums[l]</code> is at most <code>nums[r]</code>. So every pair that
        uses <code>nums[l]</code> is also too small. This means <code>nums[l]</code> cannot be part of the answer,
        and moving <code>l</code> loses nothing. The &ldquo;too big&rdquo; case is the same idea from the other
        side. Each move removes one value that we can prove is not needed.
      </p>
      <Callout kind="note" label="Two Sum without sorting">
        <p className="mb-0">
          Sometimes the array is not sorted and you must return the original indices. Sorting would change the
          positions. In that case, the Map approach from Lesson 26 is better. It takes O(n) time and needs no sorting.
        </p>
      </Callout>

      <h2 id="same">Same-direction pointers</h2>
      <p>
        In the second form, both pointers move forward, but at different speeds. Lesson 19 used it to remove
        duplicates and to move zeros. Here is another classic problem. A <strong>subsequence</strong> of a string
        is made by taking some of its letters in the same order. The letters do not have to be next to each other.
        For example, &ldquo;ace&rdquo; is a subsequence of &ldquo;abcde&rdquo;. The task is to check whether one
        string is a subsequence of another.
      </p>
      <CodeBlock lang="js" code={subseqCode} />
      <p>
        <code>j</code> moves at every step. <code>i</code> moves only when it finds a match. This takes O(n + m)
        steps (n and m are the two string lengths). You do not have to try every way of picking letters. The sliding
        windows in Lessons 22 and 23 also use pointers that move in the same direction.
      </p>

      <h2 id="threesum">3Sum: fix one, two-pointer the rest</h2>
      <p>
        Find all <em>unique</em> triples (groups of three values) that add up to 0. Three nested loops cost O(n³).
        Do this instead. First sort the array. Then fix the first value <code>nums[i]</code>. Then use the pair-sum
        two pointers on the rest of the array, to find two values that add up to <code>-nums[i]</code>.
      </p>
      <CodeBlock lang="js" code={threeSumCode} />
      <p>
        Sorting costs O(n log n). Then you run one O(n) two-pointer pass for each of the n first values. The total
        is <strong>O(n²)</strong>. To avoid repeated triples, skip a value that is equal to the one you just used.
        Do this for <code>i</code> and for <code>l</code>. The sort makes this easy, because it puts equal values
        next to each other.
      </p>

      <h2 id="water">Container with most water</h2>
      <p>
        A vertical line of a different height stands at each index. Choose two lines. The water they can hold is{" "}
        <code>min(height[l], height[r]) × (r − l)</code>. (The water level is set by the shorter line, and the
        width is the distance between the lines.) Start with the widest pair. Then move the{" "}
        <strong>shorter</strong> line inwards. Keeping it cannot help. Any narrower container that still uses it is
        limited by the same short height, and it is also narrower.
      </p>
      <CodeBlock lang="js" code={waterCode} />
      <DryRun
        title="maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]) — first steps"
        cols={["l", "r", "heights", "area", "best", "move"]}
        rows={[
          ["0", "8", "1, 7", "1 × 8 = 8", "8", "l (1 is shorter)"],
          ["1", "8", "8, 7", "7 × 7 = 49", "49", "r (7 is shorter)"],
          ["1", "7", "8, 3", "3 × 6 = 18", "49", "r"],
          ["1", "6", "8, 8", "8 × 5 = 40", "49", "r (equal: either)"],
        ]}
        highlight={1}
        note="The best container, 49, is found on the second step; the rest of the walk only confirms it."
      />

      <h2 id="flag">Three-way partition (Dutch national flag)</h2>
      <p>
        Lesson 18 partitioned (split) an array around a pivot into two groups. With three pointers you can split an
        array into three groups in one pass. A common example is sorting an array that has only 0s, 1s and 2s. It is
        called the Dutch national flag problem because the flag has three colour bands. The meaning of the pointers:
      </p>
      <ul>
        <li>everything before <code>low</code> is 0;</li>
        <li>everything after <code>high</code> is 2;</li>
        <li>everything between <code>low</code> and <code>mid</code> is 1;</li>
        <li><code>mid</code> is the item we are checking now.</li>
      </ul>
      <CodeBlock lang="js" code={flagCode} />
      <DryRun
        title="sortColors([2, 0, 2, 1, 1, 0])"
        cols={["nums[mid]", "Action", "Array after", "low", "mid", "high"]}
        rows={[
          ["2", "swap with high", "[0, 0, 2, 1, 1, 2]", "0", "0", "4"],
          ["0", "swap with low", "[0, 0, 2, 1, 1, 2]", "1", "1", "4"],
          ["0", "swap with low", "[0, 0, 2, 1, 1, 2]", "2", "2", "4"],
          ["2", "swap with high", "[0, 0, 1, 1, 2, 2]", "2", "2", "3"],
          ["1", "move mid", "[0, 0, 1, 1, 2, 2]", "2", "3", "3"],
          ["1", "move mid", "[0, 0, 1, 1, 2, 2]", "2", "4", "3"],
        ]}
        highlight={5}
        note="mid has passed high, so every item is in its place."
      />

      <h2 id="templates">The templates side by side</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Form</th>
              <th>Start</th>
              <th>Move rule</th>
              <th>Typical problems</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Opposite ends</td><td><code>l = 0</code>, <code>r = n − 1</code></td><td>Move the side that cannot be part of a better answer</td><td>Pair sum, 3Sum, container, palindrome</td></tr>
            <tr><td>Same direction</td><td>both at 0 (or 1)</td><td>Fast pointer every step; slow pointer only when something is kept or matched</td><td>Remove duplicates, move zeros, subsequence</td></tr>
            <tr><td>Three-way</td><td><code>low = mid = 0</code>, <code>high = n − 1</code></td><td>Swap to the front or back depending on the group</td><td>Sort colors, partition</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="practice">Practice questions</h2>
      <p>For every two-pointer answer, be ready to say in one sentence why the pointer you move cannot be part of a better answer.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the sorted pair-sum loop and explain why moving l when the sum is too small is safe.</>,
          <>Explain how 3Sum avoids duplicate triples.</>,
          <>Say which line moves in &ldquo;container with most water&rdquo;, and why.</>,
          <>Dry-run the Dutch national flag on [1, 2, 0].</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Lesson 22 turns same-direction pointers into a <strong>sliding window</strong>. A sliding window is a block
        of k items that moves one step at a time. Each time it moves, you update its sum or count in O(1) (one quick
        step) and you do not need to count it again from the start.
      </p>
    </DsaLessonPage>
  );
}
