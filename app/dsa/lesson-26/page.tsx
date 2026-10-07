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

const lesson = getDsaLesson("lesson-26");

export const metadata: Metadata = {
  title: `Lesson 26 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Trade memory for speed" },
  { id: "twosum", label: "Two Sum, three ways" },
  { id: "trace", label: "Traced: Two Sum with a Map" },
  { id: "order", label: "Check first, then store" },
  { id: "values", label: "What should the Map remember?" },
  { id: "nearby", label: "Duplicates within distance k" },
  { id: "consecutive", label: "Longest consecutive sequence" },
  { id: "subarrays", label: "Counting subarrays with a Map" },
  { id: "practice", label: "Practice questions (6)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const bruteCode = `function twoSumBrute(nums, target) {
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      if (nums[i] + nums[j] === target) return [i, j];
}

function twoSumSorted(nums, target) {
  // Sort indices by value so the original positions are not lost
  const idx = nums.map((_, i) => i).sort((a, b) => nums[a] - nums[b]);
  let l = 0, r = idx.length - 1;
  while (l < r) {
    const sum = nums[idx[l]] + nums[idx[r]];
    if (sum === target) return [idx[l], idx[r]].sort((a, b) => a - b);
    if (sum < target) l++;
    else r--;
  }
}

console.log(twoSumBrute([3, 8, 4, 5], 9));  // [ 2, 3 ]
console.log(twoSumSorted([3, 8, 4, 5], 9)); // [ 2, 3 ]`;

const mapCode = `const nums = [3, 8, 4, 5], target = 9;
const seen = new Map();
for (let i = 0; i < nums.length; i++) {
  const need = target - nums[i];
  if (seen.has(need)) {
    console.log([seen.get(need), i]);
    break;
  }
  seen.set(nums[i], i);
}`;

function mapTrace() {
  const t = tracer();
  const nums = [3, 8, 4, 5], target = 9;
  const seen = new Map<number, number>();
  t.step(2, "start", "seen = new Map()", "It maps each value to its index, for every value we have already passed.", { nums, target, seen: new Map(seen) }, "seen");
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    t.step(4, "run", `i = ${i}: need = 9 − ${nums[i]} = ${need}`, `nums[${i}] = ${nums[i]} pairs only with ${need}. Have we already seen a ${need}?`, { nums, target, seen: new Map(seen), i, need }, "need");
    if (seen.has(need)) {
      t.step(5, "check", `seen.has(${need})? yes, at index ${seen.get(need)}`, "One lookup answers the question that a whole inner loop used to answer.", { nums, target, seen: new Map(seen), i, need });
      t.print(`[ ${seen.get(need)}, ${i} ]`);
      t.step(6, "print", `console.log([${seen.get(need)}, ${i}])`, `nums[${seen.get(need)}] + nums[${i}] = ${need} + ${nums[i]} = 9.`, { nums, seen: new Map(seen), i, need });
      break;
    }
    t.step(5, "check", `seen.has(${need})? no`, `No ${need} so far.`, { nums, target, seen: new Map(seen), i, need });
    seen.set(nums[i], i);
    t.step(9, "update", `seen.set(${nums[i]}, ${i})`, `Remember ${nums[i]} so a later value can pair with it.`, { nums, target, seen: new Map(seen), i, need }, "seen");
  }
  return t.steps;
}

const nearbyCode = `function containsNearbyDuplicate(nums, k) {
  const last = new Map();                        // value → most recent index
  for (let i = 0; i < nums.length; i++) {
    if (last.has(nums[i]) && i - last.get(nums[i]) <= k) return true;
    last.set(nums[i], i);                        // overwrite: only the latest index matters
  }
  return false;
}

console.log(containsNearbyDuplicate([1, 2, 3, 1], 3));       // true
console.log(containsNearbyDuplicate([1, 2, 3, 1, 2, 3], 2)); // false`;

const consecutiveCode = `function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const x of set) {
    if (set.has(x - 1)) continue;          // not the start of a run: skip
    let len = 1;
    while (set.has(x + len)) len++;        // walk up the run: x, x+1, x+2 …
    best = Math.max(best, len);
  }
  return best;
}

console.log(longestConsecutive([100, 4, 200, 1, 3, 2]));        // 4   (1, 2, 3, 4)
console.log(longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1])); // 9`;

const niceCode = `// Count subarrays with exactly k odd numbers: prefix counts of odd numbers
function numberOfSubarrays(nums, k) {
  const seen = new Map([[0, 1]]);
  let odds = 0, count = 0;
  for (const x of nums) {
    if (x % 2 === 1) odds++;
    count += seen.get(odds - k) ?? 0;
    seen.set(odds, (seen.get(odds) ?? 0) + 1);
  }
  return count;
}

console.log(numberOfSubarrays([1, 1, 2, 1, 1], 3)); // 2`;

export default function DsaLessonTwentySixPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Trade memory for speed</h2>
      <p>
        Part 5 is about one idea that solves many problems: as you walk through the input,{" "}
        <strong>remember what you have seen</strong> in a Map or a Set. A <strong>Map</strong> is a collection of
        key → value pairs, like a phone book that finds a number from a name. A <strong>Set</strong> is a collection
        of unique values that can tell you quickly whether a value is inside, like a guest list. Both find an item in
        O(1) time, which means the time does not grow when the collection gets bigger.
      </p>
      <p>
        Now a question that would need an inner loop, such as &ldquo;is there an earlier value that…?&rdquo;, becomes
        one O(1) lookup. You pay O(n) extra memory, and in return O(n²) time becomes O(n) time.
      </p>

      <h2 id="twosum">Two Sum, three ways</h2>
      <p>
        The task: find the two values in an unsorted array that add up to a target, and return their indices (positions).
        It is the most famous interview question. It shows three levels of solution clearly. The first is the
        <strong> brute force</strong>, which means trying every possibility without being clever:
      </p>
      <CodeBlock lang="js" code={bruteCode} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Approach</th>
              <th>Time</th>
              <th>Extra space</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Check every pair</td><td>O(n²)</td><td>O(1)</td><td>The brute force</td></tr>
            <tr><td>Sort + two pointers (Lesson 21)</td><td>O(n log n)</td><td>O(n)</td><td>Must sort indices to keep the original positions</td></tr>
            <tr><td>Map of seen values</td><td>O(n)</td><td>O(n)</td><td>The expected answer</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="trace">Traced: Two Sum with a Map</h2>
      <p>
        For each value x, the partner it needs is <code>target − x</code>. Do not search the whole array for the
        partner. Look it up in the Map of values you have already passed:
      </p>
      <CodeTrace
        code={mapCode}
        steps={mapTrace()}
        caption="One pass. Each value first asks “has my partner appeared?”. Then it adds itself to the Map for the values that come later."
      />

      <h2 id="order">Check first, then store</h2>
      <p>
        The order of the two lines inside the loop matters. If you check <em>before</em> you store, a value can never
        pair with itself. Take <code>nums = [3, 5]</code> and target 6. If you stored first, the Map would already
        contain 3 when you look for the partner of 3, and you would wrongly return <code>[0, 0]</code>. With{" "}
        <code>[3, 3]</code>, checking first still works: the second 3 finds the first 3.
      </p>
      <Callout kind="ok" label="The “seen before?” loop">
        <pre className="my-1">
          <code>{`for (let i = 0; i < nums.length; i++) {
  if (seen has what nums[i] needs) → answer
  record nums[i] in seen
}`}</code>
        </pre>
      </Callout>

      <h2 id="values">What should the Map remember?</h2>
      <p>The key is usually the value from the array. What you store <em>with</em> it depends on what the question asks for:</p>
      <DryRun
        title="choosing what to store"
        cols={["Question asks for…", "Store", "Example"]}
        rows={[
          ["whether it appeared", "a Set", "contains duplicate"],
          ["where it appeared", "value → index", "Two Sum"],
          ["how close the last copy is", "value → latest index (overwrite)", "duplicates within k"],
          ["the longest span", "value → first index (never overwrite)", "longest subarray with sum 0"],
          ["how many times it appeared", "value → count", "count pairs, subarray sum = k"],
        ]}
      />

      <h2 id="nearby">Duplicates within distance k</h2>
      <p>
        The task: is there a value that repeats within k positions? Store each value&apos;s <strong>most recent</strong>{" "}
        index. An older copy is never closer than the latest copy, so overwriting the old index loses nothing.
      </p>
      <CodeBlock lang="js" code={nearbyCode} />

      <h2 id="consecutive">Longest consecutive sequence</h2>
      <p>
        The task: find the longest run of consecutive integers (numbers that follow each other, like 1, 2, 3, 4). The
        numbers can be in any order in the array. For example, <code>[100, 4, 200, 1, 3, 2]</code> contains 1, 2, 3, 4,
        so the answer is 4. Sorting takes O(n log n) time. A Set takes O(n) time with one clever rule: only start
        counting from a value <code>x</code> when <code>x − 1</code> is <em>not</em> in the Set. That means <code>x</code>{" "}
        is the start of a run.
      </p>
      <CodeBlock lang="js" code={consecutiveCode} />
      <p>
        Without that rule, counting from every value would take O(n²) time on an input like 1, 2, 3 … n. With the rule,
        the inner <code>while</code> loop visits each value only once, from the run it belongs to. So the total work is
        O(n).
      </p>
      <DryRun
        title="[100, 4, 200, 1, 3, 2]"
        cols={["x", "x − 1 in set?", "Action", "Run length"]}
        rows={[
          ["100", "no", "count 100", "1"],
          ["4", "yes (3)", "skip", ""],
          ["200", "no", "count 200", "1"],
          ["1", "no", "count 1, 2, 3, 4", "4"],
          ["3", "yes", "skip", ""],
          ["2", "yes", "skip", ""],
        ]}
        highlight={3}
      />

      <h2 id="subarrays">Counting subarrays with a Map</h2>
      <p>
        A <strong>subarray</strong> is a block of neighbouring items inside an array. A <strong>prefix sum</strong> is
        the total of all items from the start up to the current position. Lesson 20 counted subarrays with sum k by
        storing <em>counts of prefix sums</em>. The same &ldquo;seen before&rdquo; idea works for any running total.
        For &ldquo;subarrays with exactly k odd numbers&rdquo;, the running total is the number of odd values so far:
      </p>
      <CodeBlock lang="js" code={niceCode} />
      <p>
        The pattern is always the same. Keep a running value. Ask how many earlier running values would make the
        current subarray valid. Then record the current running value.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>Before you write code for each question, say what the key is and what value the Map stores with it.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write Two Sum with a Map from memory and explain why you check before storing.</>,
          <>Name four things a Map can store with each value, with one problem for each.</>,
          <>Explain why longest-consecutive-sequence is O(n) even with a while loop inside the for loop.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Lesson 27 uses Maps to <strong>group</strong> things: anagrams (words made from the same letters) that share a
        key, the top k most frequent values, and the majority element. It also shows a clever voting algorithm that
        uses O(1) extra space.
      </p>
    </DsaLessonPage>
  );
}
