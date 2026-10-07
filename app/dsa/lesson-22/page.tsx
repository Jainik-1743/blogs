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

const lesson = getDsaLesson("lesson-22");

export const metadata: Metadata = {
  title: `Lesson 22 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Every block of k items" },
  { id: "brute", label: "The brute force repeats work" },
  { id: "slide", label: "Slide: add one, remove one" },
  { id: "trace", label: "Traced: largest sum of 3 neighbours" },
  { id: "template", label: "The fixed-window template" },
  { id: "averages", label: "Averages of every window" },
  { id: "counting", label: "Counting inside a window" },
  { id: "map", label: "A window with a frequency map" },
  { id: "practice", label: "Practice questions (6)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const bruteCode = `function maxSumBrute(nums, k) {
  let best = -Infinity;
  for (let start = 0; start + k <= nums.length; start++) {
    let sum = 0;
    for (let i = start; i < start + k; i++) sum += nums[i];   // k steps, every time
    best = Math.max(best, sum);
  }
  return best;
}

console.log(maxSumBrute([2, 1, 5, 1, 3, 2], 3)); // 9`;

const slideCode = `const nums = [2, 1, 5, 1, 3, 2];
const k = 3;
let sum = nums[0] + nums[1] + nums[2];
let best = sum;
for (let i = k; i < nums.length; i++) {
  sum += nums[i] - nums[i - k];
  best = Math.max(best, sum);
}
console.log(best);`;

function slideTrace() {
  const t = tracer();
  const nums = [2, 1, 5, 1, 3, 2];
  const k = 3;
  let sum = nums[0] + nums[1] + nums[2];
  t.step(3, "start", "sum = 2 + 1 + 5 = 8", "Build the first window, indices 0..2, the normal way.", { nums, k, sum }, "sum");
  let best = sum;
  t.step(4, "start", "best = 8", "The first window is the best so far.", { nums, k, sum, best }, "best");
  for (let i = k; i < nums.length; i++) {
    t.step(5, "check", `i = ${i}: window becomes ${i - k + 1}..${i}`, `${nums[i]} enters on the right; ${nums[i - k]} (index ${i - k}) leaves on the left.`, { nums, k, sum, best, i }, "i");
    sum += nums[i] - nums[i - k];
    t.step(6, "update", `sum += ${nums[i]} − ${nums[i - k]} → ${sum}`, "Two operations instead of re-adding all k items.", { nums, k, sum, best, i }, "sum");
    const before = best;
    best = Math.max(best, sum);
    t.step(7, "update", `best = max(${before}, ${sum}) = ${best}`, best > before ? "A new best window." : "Not better.", { nums, k, sum, best, i }, "best");
  }
  t.print(best);
  t.step(9, "print", "console.log(best)", "The window [5, 1, 3] has the largest sum.", { nums, best });
  return t.steps;
}

const templateCode = `function fixedWindow(nums, k) {
  let state = 0;                         // e.g. a sum or a count
  let best = -Infinity;
  for (let i = 0; i < nums.length; i++) {
    state += nums[i];                    // 1. add the item entering on the right
    if (i >= k) state -= nums[i - k];    // 2. remove the item that fell off the left
    if (i >= k - 1) {                    // 3. a full window ends at i: use it
      best = Math.max(best, state);
    }
  }
  return best;
}

console.log(fixedWindow([2, 1, 5, 1, 3, 2], 3)); // 9`;

const avgCode = `function windowAverages(nums, k) {
  const out = [];
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
    if (i >= k) sum -= nums[i - k];
    if (i >= k - 1) out.push(sum / k);
  }
  return out;
}

console.log(windowAverages([1, 3, 2, 6, -1, 4, 1, 8, 2], 5)); // [ 2.2, 2.8, 2.4, 3.6, 2.8 ]`;

const vowelCode = `function maxVowels(s, k) {
  const isVowel = (ch) => "aeiou".includes(ch);
  let count = 0, best = 0;
  for (let i = 0; i < s.length; i++) {
    if (isVowel(s[i])) count++;                     // entering
    if (i >= k && isVowel(s[i - k])) count--;       // leaving
    if (i >= k - 1) best = Math.max(best, count);
  }
  return best;
}

console.log(maxVowels("abciiidef", 3)); // 3   ("iii")`;

const distinctCode = `function distinctInWindows(nums, k) {
  const freq = new Map();
  const out = [];
  for (let i = 0; i < nums.length; i++) {
    freq.set(nums[i], (freq.get(nums[i]) ?? 0) + 1);       // add the new item
    if (i >= k) {
      const old = nums[i - k];
      freq.set(old, freq.get(old) - 1);                    // remove the old item
      if (freq.get(old) === 0) freq.delete(old);           // keep size = distinct count
    }
    if (i >= k - 1) out.push(freq.size);
  }
  return out;
}

console.log(distinctInWindows([1, 2, 1, 3, 4, 2, 3], 4)); // [ 3, 4, 4, 3 ]`;

export default function DsaLessonTwentyTwoPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Every block of k items</h2>
      <p>
        Many problems ask about every <strong>window</strong>. A window is a block of k items that sit next to each
        other in an array or a string. Examples: the largest sum of 3 days in a row, the average of every 5
        readings, or the most vowels in any 4 letters in a row. An array of n items has n − k + 1 such windows.
      </p>
      <ArrayBoxes
        values={[2, 1, 5, 1, 3, 2]}
        name="nums"
        highlight={[2, 3, 4]}
        marks={{ 2: "start", 4: "end" }}
        caption="One window of size k = 3 (indices 2..4). The next window drops index 2 and adds index 5."
      />

      <h2 id="brute">The brute force repeats work</h2>
      <p>Computing each window from scratch costs k steps per window:</p>
      <CodeBlock lang="js" code={bruteCode} />
      <p>
        That costs O(n × k) steps. With n = 10<sup>5</sup> and k = 5 × 10<sup>4</sup>, it is billions of steps. But
        two windows that sit next to each other share k − 1 items. Adding those items again and again is wasted
        work. Lesson 11 told us to look for this kind of waste.
      </p>

      <h2 id="slide">Slide: add one, remove one</h2>
      <p>
        When the window moves one step to the right, only two items change. One item enters on the right and one
        item leaves on the left. So do not add everything again. Just update the sum:
      </p>
      <Callout kind="ok" label="Sliding window update">
        <p className="mb-0">
          <code>sum = sum + nums[i] − nums[i − k]</code>. Add the new item, and take away the item that is k
          positions back.
        </p>
      </Callout>

      <h2 id="trace">Traced: largest sum of 3 neighbours</h2>
      <CodeTrace
        code={slideCode}
        steps={slideTrace()}
        caption="The first window is built the normal way. Every later window costs O(1), which is one quick step. The total is O(n), whatever the value of k is."
      />
      <DryRun
        title="the four windows of size 3"
        cols={["Window", "Items", "Sum", "Computed as"]}
        rows={[
          ["0..2", "2, 1, 5", "8", "built directly"],
          ["1..3", "1, 5, 1", "7", "8 + 1 − 2"],
          ["2..4", "5, 1, 3", "9", "7 + 3 − 1"],
          ["3..5", "1, 3, 2", "6", "9 + 2 − 5"],
        ]}
        highlight={2}
      />

      <h2 id="template">The fixed-window template</h2>
      <p>
        You do not need to build the first window separately. Walk through the array once. At each index, add the
        item that enters. Remove the item that leaves, but only once the window is full. Use the window when it is
        complete:
      </p>
      <CodeBlock lang="js" code={templateCode} />
      <p>
        The three numbered steps are the whole pattern. Only the <em>state</em> changes from problem to problem. The
        state is the information you keep about the window, such as a sum, a count, or a frequency map (a Map that
        counts each value). Check the two conditions with care. <code>i &gt;= k</code> means &ldquo;an item must
        leave&rdquo;. <code>i &gt;= k - 1</code> means &ldquo;a full window exists&rdquo;. These are the places where
        off-by-one mistakes (being wrong by exactly one) usually happen.
      </p>

      <h2 id="averages">Averages of every window</h2>
      <p>A moving average is the average of the last k values, and it updates as the window moves. People use it for prices or sensor readings. It is the window sum divided by k:</p>
      <CodeBlock lang="js" code={avgCode} />

      <h2 id="counting">Counting inside a window</h2>
      <p>The state can be a count instead of a sum. In this example we find the most vowels (a, e, i, o, u) in any k letters in a row.</p>
      <CodeBlock lang="js" code={vowelCode} />

      <h2 id="map">A window with a frequency map</h2>
      <p>
        Sometimes the question is about <em>which</em> values are in the window. For example: how many distinct
        (different) values, anagrams, or duplicates. Then the state is a frequency map (Lesson 15). A frequency map
        is a Map that stores how many times each value appears. Add one to the count of the value that enters.
        Subtract one from the count of the value that leaves. Delete a key when its count reaches 0. This keeps{" "}
        <code>freq.size</code> equal to the number of distinct values.
      </p>
      <CodeBlock lang="js" code={distinctCode} />
      <DryRun
        title="distinct values in each window of size 4"
        cols={["Window", "Items", "Map after update", "Distinct"]}
        rows={[
          ["0..3", "1, 2, 1, 3", "{1: 2, 2: 1, 3: 1}", "3"],
          ["1..4", "2, 1, 3, 4", "{1: 1, 2: 1, 3: 1, 4: 1}", "4"],
          ["2..5", "1, 3, 4, 2", "{1: 1, 3: 1, 4: 1, 2: 1}", "4"],
          ["3..6", "3, 4, 2, 3", "{3: 2, 4: 1, 2: 1}", "3"],
        ]}
        note="In the last step, 1 leaves with count 0 and is deleted, so the size drops to 3."
      />

      <h2 id="practice">Practice questions</h2>
      <p>For each question, first decide what the window state is (a sum, a count or a map). Then fill in the template.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the fixed-window template from memory, with its three steps.</>,
          <>Explain why the sliding window is O(n) while the brute force is O(n × k).</>,
          <>Say what goes wrong if you forget to delete map keys whose count reaches 0.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        In this lesson the window size was fixed. In Lesson 23 the window <strong>grows and shrinks</strong>. It
        gets bigger while a rule is true, and it gets smaller when the rule breaks. This is the technique behind
        &ldquo;longest substring without repeating characters&rdquo; and many other popular problems.
      </p>
    </DsaLessonPage>
  );
}
