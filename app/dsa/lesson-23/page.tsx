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

const lesson = getDsaLesson("lesson-23");

export const metadata: Metadata = {
  title: `Lesson 23 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "When the window size is the answer" },
  { id: "template", label: "The grow-and-shrink template" },
  { id: "shortest", label: "Shortest window with a condition" },
  { id: "trace", label: "Traced: shortest subarray with sum ≥ 7" },
  { id: "longest", label: "Longest window with a condition" },
  { id: "atmost", label: "“At most k” problems" },
  { id: "counting", label: "Counting windows, and “exactly k”" },
  { id: "when", label: "When a sliding window works — and when it does not" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const templateCode = `let l = 0;
for (let r = 0; r < n; r++) {
  add(nums[r]);                 // 1. grow: take one more item on the right
  while (windowIsInvalid()) {   // 2. shrink: drop items on the left until valid again
    remove(nums[l]);
    l++;
  }
  best = Math.max(best, r - l + 1);   // 3. the window l..r is valid: use it
}`;

const shortestCode = `const nums = [2, 3, 1, 2, 4, 3], target = 7;
let l = 0, sum = 0, best = Infinity;
for (let r = 0; r < nums.length; r++) {
  sum += nums[r];
  while (sum >= target) {
    best = Math.min(best, r - l + 1);
    sum -= nums[l];
    l++;
  }
}
console.log(best);`;

function shortestTrace() {
  const t = tracer();
  const nums = [2, 3, 1, 2, 4, 3], target = 7;
  let l = 0, sum = 0, best = Infinity;
  t.step(2, "start", "l = 0, sum = 0, best = Infinity", "No window yet. Infinity means “no valid window found”.", { nums, l, sum, best });
  for (let r = 0; r < nums.length; r++) {
    sum += nums[r];
    t.step(4, "update", `r = ${r}: sum += ${nums[r]} → ${sum}`, `Grow: the window is now ${l}..${r}.`, { nums, l, r, sum, best }, "sum");
    if (sum < target) {
      t.step(5, "check", `${sum} >= 7? no`, "Not enough yet — keep growing.", { nums, l, r, sum, best });
    }
    while (sum >= target) {
      t.step(5, "check", `${sum} >= 7? yes`, `Window ${l}..${r} is valid. Record it, then try to make it shorter.`, { nums, l, r, sum, best });
      best = Math.min(best, r - l + 1);
      t.step(6, "update", `best = ${best}`, `Length ${r - l + 1}.`, { nums, l, r, sum, best }, "best");
      sum -= nums[l];
      l++;
      t.step(8, "update", `drop ${nums[l - 1]}: sum = ${sum}, l = ${l}`, "Shrink from the left.", { nums, l, r, sum, best }, "l");
    }
  }
  t.print(best);
  t.step(11, "print", "console.log(best)", "[4, 3] is the shortest window with sum ≥ 7. Each index entered once and left once: O(n).", { nums, best });
  return t.steps;
}

const longestCode = `// Longest run of 1s if you may flip at most k zeros
function longestOnes(nums, k) {
  let l = 0, zeros = 0, best = 0;
  for (let r = 0; r < nums.length; r++) {
    if (nums[r] === 0) zeros++;                 // grow
    while (zeros > k) {                          // invalid: too many zeros
      if (nums[l] === 0) zeros--;
      l++;
    }
    best = Math.max(best, r - l + 1);           // valid: record
  }
  return best;
}

console.log(longestOnes([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2)); // 6`;

const atMostCode = `// Longest subarray with at most k distinct values
function longestAtMostK(nums, k) {
  const freq = new Map();
  let l = 0, best = 0;
  for (let r = 0; r < nums.length; r++) {
    freq.set(nums[r], (freq.get(nums[r]) ?? 0) + 1);
    while (freq.size > k) {
      freq.set(nums[l], freq.get(nums[l]) - 1);
      if (freq.get(nums[l]) === 0) freq.delete(nums[l]);
      l++;
    }
    best = Math.max(best, r - l + 1);
  }
  return best;
}

console.log(longestAtMostK([1, 2, 1, 2, 3, 3, 3], 2)); // 4   ([1, 2, 1, 2] or [2, 3, 3, 3])`;

const countCode = `// How many subarrays have at most k distinct values?
function countAtMostK(nums, k) {
  const freq = new Map();
  let l = 0, count = 0;
  for (let r = 0; r < nums.length; r++) {
    freq.set(nums[r], (freq.get(nums[r]) ?? 0) + 1);
    while (freq.size > k) {
      freq.set(nums[l], freq.get(nums[l]) - 1);
      if (freq.get(nums[l]) === 0) freq.delete(nums[l]);
      l++;
    }
    count += r - l + 1;          // every window ending at r and starting in l..r is valid
  }
  return count;
}

// exactly k = (at most k) − (at most k − 1)
const exactly = (nums, k) => countAtMostK(nums, k) - countAtMostK(nums, k - 1);
console.log(exactly([1, 2, 1, 2, 3], 2)); // 7`;

export default function DsaLessonTwentyThreePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">When the window size is the answer</h2>
      <p>
        In Lesson 22, k was given. Now the question asks for the size: <em>the longest</em> substring without
        repeated letters, <em>the shortest</em> subarray with sum at least 7. Trying every start and every end is
        O(n²). A <strong>variable-size window</strong> finds the answer in O(n) with two pointers, <code>l</code>{" "}
        and <code>r</code>, that only ever move forward.
      </p>

      <h2 id="template">The grow-and-shrink template</h2>
      <p>
        Move <code>r</code> one step at a time to <strong>grow</strong> the window. Whenever the window breaks the
        rule, move <code>l</code> forward to <strong>shrink</strong> it until it follows the rule again. Then the
        window <code>l..r</code> is valid, and you can use it.
      </p>
      <CodeBlock lang="js" code={templateCode} />
      <p>
        It looks like a loop inside a loop, but <code>l</code> never moves backwards. Over the whole run,{" "}
        <code>r</code> moves n times and <code>l</code> moves at most n times — at most 2n steps, so{" "}
        <strong>O(n)</strong>.
      </p>

      <h2 id="shortest">Shortest window with a condition</h2>
      <p>
        For &ldquo;shortest&rdquo; problems, the logic flips slightly: grow until the window <em>is</em> good, then
        shrink it as long as it stays good, recording the length each time.
      </p>

      <h2 id="trace">Traced: shortest subarray with sum ≥ 7</h2>
      <CodeTrace
        code={shortestCode}
        steps={shortestTrace()}
        caption="Grow until the sum reaches 7, then shrink while it stays at 7 or more, recording each valid length."
      />

      <h2 id="longest">Longest window with a condition</h2>
      <p>
        For &ldquo;longest&rdquo; problems, shrink only while the window is <em>bad</em>, and record after the
        shrinking. A common example: the longest run of 1s if you may flip at most k zeros. The rule is &ldquo;at
        most k zeros inside the window&rdquo;:
      </p>
      <CodeBlock lang="js" code={longestCode} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Shortest window</th>
              <th>Longest window</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>While loop runs while…</td><td>the window is valid</td><td>the window is invalid</td></tr>
            <tr><td>Record the answer…</td><td>inside the while loop</td><td>after the while loop</td></tr>
            <tr><td>Start best at…</td><td><code>Infinity</code> (then check if still Infinity)</td><td><code>0</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="atmost">“At most k” problems</h2>
      <p>
        Many problems have the form &ldquo;longest window with at most k of something&rdquo; — k zeros, k distinct
        values, k replaced characters. The window state is a count or a frequency map, and the rule is
        &ldquo;that count ≤ k&rdquo;.
      </p>
      <CodeBlock lang="js" code={atMostCode} />

      <h2 id="counting">Counting windows, and “exactly k”</h2>
      <p>
        To <em>count</em> valid subarrays instead of finding the longest, notice: if <code>l..r</code> is valid and
        the rule is &ldquo;at most&rdquo;, then every shorter window ending at r is valid too. There are{" "}
        <code>r − l + 1</code> of them, so add that each step.
      </p>
      <p>
        &ldquo;Exactly k&rdquo; is harder to slide directly, because adding an item can make the window invalid
        and then valid again. The trick: <strong>exactly k = at most k − at most (k − 1)</strong>.
      </p>
      <CodeBlock lang="js" code={countCode} />

      <h2 id="when">When a sliding window works — and when it does not</h2>
      <p>
        The window only works when shrinking always helps. For sums, that needs <strong>non-negative values</strong>:
        removing an item must never increase the sum. With negative numbers, a longer window can have a smaller sum,
        and the grow-and-shrink logic gives wrong answers.
      </p>
      <Callout kind="warn" label="Negative numbers → use prefix sums instead">
        <p className="mb-0">
          &ldquo;Count subarrays with sum exactly k&rdquo; on an array that may contain negative values cannot be
          solved with a sliding window. Use prefix sums with a Map (Lesson 20).
        </p>
      </Callout>
      <DryRun
        title="choosing a technique for subarray problems"
        cols={["Problem shape", "Values", "Technique"]}
        rows={[
          ["Every block of exactly k items", "any", "Fixed window (Lesson 22)"],
          ["Longest / shortest with a rule that shrinking fixes", "non-negative, or counts", "Variable window"],
          ["Count of subarrays with sum = k", "may be negative", "Prefix sum + Map (Lesson 20)"],
          ["Largest sum of any subarray", "any", "Kadane (Lesson 24)"],
        ]}
      />

      <h2 id="practice">Practice questions</h2>
      <p>For each, decide: is it a &ldquo;longest&rdquo;, &ldquo;shortest&rdquo; or &ldquo;count&rdquo; question, and what is the rule that makes a window valid?</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the grow-and-shrink template from memory.</>,
          <>Explain why the template is O(n) even though it has a while loop inside a for loop.</>,
          <>State where the answer is recorded for &ldquo;longest&rdquo; vs &ldquo;shortest&rdquo; windows.</>,
          <>Explain the &ldquo;exactly k = at most k − at most k − 1&rdquo; trick.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Lesson 24 solves &ldquo;the largest sum of any subarray&rdquo; — a problem where windows do not work because
        values can be negative — with Kadane&apos;s algorithm: one pass and one simple decision per item.
      </p>
    </DsaLessonPage>
  );
}
