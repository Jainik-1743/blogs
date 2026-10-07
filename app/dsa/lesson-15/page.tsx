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

const lesson = getDsaLesson("lesson-15");

export const metadata: Metadata = {
  title: `Lesson 15 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Count once, answer many times" },
  { id: "array", label: "Counting with an array" },
  { id: "trace", label: "Traced: filling a counting array" },
  { id: "letters", label: "The 26-letter array" },
  { id: "map", label: "Counting with a Map" },
  { id: "extremes", label: "Highest and lowest frequency" },
  { id: "inside", label: "Inside a hash table" },
  { id: "collisions", label: "Collisions" },
  { id: "keys", label: "Keys in JavaScript: what counts as “the same”" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "Part 2 complete — what's next" },
];

const slowQueries = `const nums = [2, 3, 2, 5, 3, 2];
const queries = [2, 4, 3];

// For every query, scan the whole array again: O(n × q)
for (const q of queries) {
  let c = 0;
  for (const x of nums) if (x === q) c++;
  console.log(q, "appears", c, "times");
}`;

const countCode = `const nums = [2, 3, 2, 5, 3, 2];
const count = new Array(6).fill(0);
for (const x of nums) {
  count[x]++;
}
console.log(count[2], count[4]);`;

function countTrace() {
  const t = tracer();
  const nums = [2, 3, 2, 5, 3, 2];
  t.step(1, "start", "nums", "The values are between 0 and 5, so one counter for each possible value is enough.", { nums }, "nums");
  const count = new Array(6).fill(0);
  t.step(2, "start", "count = [0, 0, 0, 0, 0, 0]", "count[v] will hold how many times v appears. The index is the value itself.", { nums, count: [...count] }, "count");
  for (const x of nums) {
    t.step(3, "check", `x = ${x}`, `Next value. Its counter lives at count[${x}].`, { nums, count: [...count], x }, "x");
    count[x]++;
    t.step(4, "update", `count[${x}]++ → ${count[x]}`, "No searching is needed. The value tells us exactly which box to update.", { nums, count: [...count], x }, "count");
  }
  t.print(`${count[2]} ${count[4]}`);
  t.step(6, "print", "console.log(count[2], count[4])", "Each query is now a single array read: 2 appears 3 times, 4 appears 0 times.", { nums, count: [...count] });
  return t.steps;
}

const lettersCode = `function letterCounts(s) {
  const count = new Array(26).fill(0);
  for (const ch of s) {
    count[ch.charCodeAt(0) - 97]++;     // "a" → 0, "b" → 1, … "z" → 25
  }
  return count;
}

const c = letterCounts("hello");
console.log(c[4], c[11], c[25]);  // 1 2 0   (e, l, z)`;

const mapCode = `function counts(items) {
  const freq = new Map();
  for (const x of items) freq.set(x, (freq.get(x) ?? 0) + 1);
  return freq;
}

const freq = counts([10, -4, 10, 1000000, -4, 10]);
console.log(freq.get(10));       // 3
console.log(freq.get(-4));       // 2
console.log(freq.get(7) ?? 0);   // 0   never seen`;

const extremesCode = `function mostAndLeast(nums) {
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);

  let most = null, least = null;
  for (const [value, c] of freq) {
    if (most === null || c > freq.get(most)) most = value;
    if (least === null || c < freq.get(least)) least = value;
  }
  return [most, least];
}

console.log(mostAndLeast([4, 1, 4, 2, 4, 2]));  // [ 4, 1 ]`;

const tableCode = `class HashTable {
  constructor(size = 5) {
    this.buckets = Array.from({ length: size }, () => []);
  }
  hash(key) {                                  // text → bucket number
    let h = 0;
    for (const ch of key) h += ch.charCodeAt(0);
    return h % this.buckets.length;
  }
  set(key, value) {
    const bucket = this.buckets[this.hash(key)];
    for (const pair of bucket) {
      if (pair[0] === key) { pair[1] = value; return; }   // update
    }
    bucket.push([key, value]);                             // add
  }
  get(key) {
    const bucket = this.buckets[this.hash(key)];
    for (const [k, v] of bucket) if (k === key) return v;
    return undefined;
  }
}

const t = new HashTable();
t.set("cat", 1);
t.set("dog", 2);
t.set("act", 3);
console.log(t.get("act"), t.get("dog"), t.get("cow"));  // 3 2 undefined`;

const keysCode = `const m = new Map();
m.set(1, "number one");
m.set("1", "text one");
console.log(m.size);              // 2   — 1 and "1" are different keys in a Map

const obj = {};
obj[1] = "number one";
obj["1"] = "text one";
console.log(Object.keys(obj));    // [ '1' ]   — object keys are always text

const pairs = new Map();
pairs.set([1, 2], "a");
console.log(pairs.get([1, 2]));   // undefined — a new array is a different object
pairs.set("1,2", "a");
console.log(pairs.get("1,2"));    // a         — turn the pair into a text key`;

export default function DsaLessonFifteenPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Count once, answer many times</h2>
      <p>
        Suppose you are given an array and then many questions: &ldquo;How many times does 2
        appear? And 4? And 3?&rdquo; The obvious way is to scan the whole array again for every question:
      </p>
      <CodeBlock lang="js" code={slowQueries} />
      <p>
        With n = 100,000 values and q = 100,000 questions, that is 10<sup>10</sup> steps. The better idea
        is <strong>pre-computation</strong>. Pre-computation means doing some work once, before the
        questions come, and saving the results. Here you walk the array once and record every count. Then
        you answer each question with a single lookup (reading one saved value). The total work is
        O(n + q). Storing values so that you can find them directly, without searching, is called{" "}
        <strong>hashing</strong>.
      </p>

      <h2 id="array">Counting with an array</h2>
      <p>
        A <strong>counting array</strong> is an array where the position (index) is the value you count,
        and the number stored there is how many times that value appears. It works when the values are
        small whole numbers in a known range, say 0 to 1,000. <code>count[7]</code> holds how many 7s
        there are. Reading or updating it is O(1) (it takes the same short time however big the array is),
        because an array can jump straight to any index.
      </p>

      <h2 id="trace">Traced: filling a counting array</h2>
      <CodeTrace
        code={countCode}
        steps={countTrace()}
        caption="One pass to fill the counters; after that, every question is answered by reading one box."
      />
      <ArrayBoxes
        values={[0, 0, 3, 2, 0, 1]}
        name="count"
        highlight={[2, 3, 5]}
        caption="The finished counting array for [2, 3, 2, 5, 3, 2]: the index is the value, the box holds its count."
      />
      <p>
        The cost is memory. The array needs one box for every <em>possible</em> value, even the unused
        ones. That is fine for 0 to 1,000. But values up to 10<sup>9</sup>, or negative values, do not
        fit. Then you need a Map.
      </p>

      <h2 id="letters">The 26-letter array</h2>
      <p>
        The most common fixed range in interviews is &ldquo;lowercase English letters&rdquo;. There are 26
        of them. Turn each letter into an index from 0 to 25 with its character code (Lesson 9). The
        character code is the number that stands for a letter: <code>&quot;a&quot;.charCodeAt(0)</code> is 97, so
        subtracting 97 gives 0 for &ldquo;a&rdquo;, 1 for &ldquo;b&rdquo;, and so on:
      </p>
      <CodeBlock lang="js" code={lettersCode} />
      <p>
        Two strings are anagrams (they use exactly the same letters, such as &ldquo;listen&rdquo; and
        &ldquo;silent&rdquo;) exactly when their 26 counts are equal. That is a fixed 26-step comparison,
        however long the strings are.
      </p>

      <h2 id="map">Counting with a Map</h2>
      <p>
        For anything else, such as large numbers, negative numbers or words, use the frequency map from
        Lesson 10. A <strong>Map</strong> is a JavaScript collection that stores key and value pairs, and
        it finds a value quickly from its key. A <strong>frequency map</strong> uses each item as the key
        and its count as the value. It stores only the values that actually appear:
      </p>
      <CodeBlock lang="js" code={mapCode} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Counting array</th>
              <th>Map</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Works for</td><td>Small non-negative whole numbers, letters</td><td>Any value</td></tr>
            <tr><td>Memory</td><td>One box per <em>possible</em> value</td><td>One entry per value that appears</td></tr>
            <tr><td>Speed</td><td>O(1), very fast in practice</td><td>O(1) on average</td></tr>
            <tr><td>Missing value</td><td>Reads as 0</td><td>Reads as <code>undefined</code> — use <code>?? 0</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="extremes">Highest and lowest frequency</h2>
      <p>
        Once the counts exist, many questions become one simple pass over the map. It is like finding
        the largest value in an array, but you look at the counts instead:
      </p>
      <CodeBlock lang="js" code={extremesCode} />
      <p>
        There are two passes: O(n) to count, and O(k) to scan the k distinct values (the different
        values). The comparisons use strict <code>&gt;</code> and <code>&lt;</code>, so when two values
        have the same count, the one that was seen first wins.
      </p>

      <h2 id="inside">Inside a hash table</h2>
      <p>
        How can a Map find a key without searching? A Map is built on a <strong>hash table</strong>. A hash
        table is a data structure that stores key and value pairs in an array, and it finds a key fast.
        Inside, it has an ordinary array of slots called <strong>buckets</strong>. It also has a{" "}
        <strong>hash function</strong>, which is a function that turns any key into a bucket number:
      </p>
      <ol>
        <li>To store a key, compute <code>hash(key)</code> (a number) and put the entry in that bucket.</li>
        <li>To look a key up, compute the same <code>hash(key)</code> and look only in that bucket.</li>
      </ol>
      <p>
        The hash function does the same small amount of work however many entries the table holds. So
        storing and finding take O(1). Here is a very simple hash for text with 5 buckets. Add up the
        character codes, then take the remainder after dividing by 5.
      </p>
      <DryRun
        title="hash(key) = (sum of character codes) % 5"
        cols={["Key", "Sum of codes", "Bucket"]}
        rows={[
          ["cat", "99 + 97 + 116 = 312", "2"],
          ["dog", "100 + 111 + 103 = 314", "4"],
          ["fish", "102 + 105 + 115 + 104 = 426", "1"],
          ["act", "97 + 99 + 116 = 312", "2  ← same as cat"],
        ]}
        highlight={3}
      />

      <h2 id="collisions">Collisions</h2>
      <p>
        &ldquo;cat&rdquo; and &ldquo;act&rdquo; have the same letters, so they have the same sum and the same
        bucket. When two keys land in one bucket, it is called a <strong>collision</strong>. You cannot
        avoid collisions completely, because there are far more possible keys than buckets. The usual fix
        is <strong>chaining</strong>: each bucket holds a short list of entries. A lookup goes to the
        right bucket and checks the few entries there.
      </p>
      <CodeBlock lang="js" code={tableCode} />
      <p>Real hash tables keep collisions rare in two ways:</p>
      <ul>
        <li><strong>A good hash function</strong> spreads keys evenly over the buckets. Real ones mix the characters much more than a plain sum does, so anagrams do not collide.</li>
        <li><strong>Resizing.</strong> When the table gets too full (for example, more entries than buckets), it creates a bigger bucket array and moves every entry into it. This O(n) step is rare. So the <em>average</em> cost per operation stays O(1).</li>
      </ul>
      <Callout kind="note" label="Why we say “O(1) on average”">
        <p className="mb-0">
          If every key landed in the same bucket, a lookup would check all n entries, which is O(n). With a
          good hash function this almost never happens. So Map and Set operations are quoted as O(1) on
          average. This is the exception to the worst-case rule from Lesson 12.
        </p>
      </Callout>

      <h2 id="keys">Keys in JavaScript: what counts as “the same”</h2>
      <p>Three details about keys surprise many people in interviews. The code shows each one:</p>
      <CodeBlock lang="js" code={keysCode} />
      <ul>
        <li><strong>Objects turn keys into text.</strong> <code>obj[1]</code> and <code>obj[&quot;1&quot;]</code> are the same property. A Map keeps them apart.</li>
        <li><strong>Arrays and objects are compared by identity</strong>, not by contents. Identity means &ldquo;is it the very same object in memory?&rdquo;. Two separate <code>[1, 2]</code> arrays are different keys.</li>
        <li><strong>To use a pair or a list as a key</strong>, turn it into a string first. Use <code>{"`${r},${c}`"}</code> for a grid cell (row r, column c). Use the sorted letters of a word to group anagrams (Lesson 27).</li>
      </ul>

      <h2 id="practice">Practice questions</h2>
      <p>
        In each question, decide first whether the range of values is small and fixed (use an array) or
        not (use a Map).
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Explain why answering q frequency questions costs O(n × q) without pre-computation and O(n + q) with it.</>,
          <>Write the 26-letter counting loop from memory.</>,
          <>Describe what a hash function, a bucket and a collision are, in one sentence each.</>,
          <>Say why <code>map.get([1, 2])</code> returns <code>undefined</code> even after <code>map.set([1, 2], &quot;a&quot;)</code>.</>,
        ]}
      />

      <h2 id="next">Part 2 complete — what&apos;s next</h2>
      <p>
        You can now read a problem, estimate its cost with Big-O, use basic maths, write recursion, and count
        with arrays and Maps. These are the thinking tools for everything that follows.
      </p>
      <p>
        <strong>Part 3 — Sorting</strong> starts with three simple sorting algorithms. Sorting means putting
        items in order. You will rarely write these three in an interview. But they show exactly what
        sorting does, and they explain why the faster ones in Lessons 17 and 18 are faster.
      </p>
    </DsaLessonPage>
  );
}
