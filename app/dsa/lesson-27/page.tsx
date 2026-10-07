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

const lesson = getDsaLesson("lesson-27");

export const metadata: Metadata = {
  title: `Lesson 27 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Group things that share a key" },
  { id: "keys", label: "Designing a good key" },
  { id: "anagrams", label: "Group anagrams" },
  { id: "trace", label: "Traced: grouping six words" },
  { id: "groupby", label: "Grouping by anything" },
  { id: "topk", label: "Top k frequent: sort or buckets" },
  { id: "majority", label: "Majority element and Boyer–Moore voting" },
  { id: "isomorphic", label: "Isomorphic strings: a two-way mapping" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "Part 5 complete — what's next" },
];

const keysCode = `// Key 1: the letters sorted — O(L log L) per word
const sortedKey = (w) => [...w].sort().join("");

// Key 2: the 26 letter counts joined — O(L) per word
function countKey(w) {
  const c = new Array(26).fill(0);
  for (const ch of w) c[ch.charCodeAt(0) - 97]++;
  return c.join(",");
}

console.log(sortedKey("listen"), sortedKey("silent")); // eilnst eilnst
console.log(countKey("abca") === countKey("caba"));     // true`;

const groupCode = `const words = ["eat", "tea", "tan", "ate", "nat", "bat"];
const groups = new Map();
for (const w of words) {
  const key = [...w].sort().join("");
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(w);
}
console.log([...groups.values()]);`;

function groupTrace() {
  const t = tracer();
  const words = ["eat", "tea", "tan", "ate", "nat", "bat"];
  const groups = new Map<string, string[]>();
  const snap = () => new Map([...groups].map(([k, v]) => [k, [...v]]));
  t.step(2, "start", "groups = new Map()", "A Map from each key to the list of words with that key.", { groups: snap() }, "groups");
  for (const w of words) {
    const key = [...w].sort().join("");
    t.step(4, "run", `"${w}" → key "${key}"`, "Anagrams have the same letters, so sorting the letters gives the same key.", { w, key, groups: snap() }, "key");
    const isNew = !groups.has(key);
    if (isNew) groups.set(key, []);
    groups.get(key)!.push(w);
    t.step(6, "update", isNew ? `new group "${key}"` : `add to group "${key}"`, isNew ? `First word with these letters: start a new list.` : `Joins the words already in this group.`, { w, key, groups: snap() }, "groups");
  }
  t.print("[ [ 'eat', 'tea', 'ate' ], [ 'tan', 'nat' ], [ 'bat' ] ]");
  t.step(8, "print", "console.log(…)", "Three groups from one pass.", { groups: snap() });
  return t.steps;
}

const groupByCode = `function groupBy(items, keyOf) {
  const groups = new Map();
  for (const item of items) {
    const k = keyOf(item);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(item);
  }
  return groups;
}

console.log(groupBy(["apple", "kiwi", "fig", "plum"], (w) => w.length));
// Map(3) { 5 => [ 'apple' ], 4 => [ 'kiwi', 'plum' ], 3 => [ 'fig' ] }

// Newer JavaScript (ES2024, Node 21 and later) has this built in:
console.log(Map.groupBy([1, 2, 3, 4, 5], (n) => (n % 2 === 0 ? "even" : "odd")));
// Map(2) { 'odd' => [ 1, 3, 5 ], 'even' => [ 2, 4 ] }`;

const topKCode = `function topKFrequent(nums, k) {
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);

  // bucket[c] = values that appear exactly c times (c is at most n)
  const bucket = Array.from({ length: nums.length + 1 }, () => []);
  for (const [x, c] of freq) bucket[c].push(x);

  const out = [];
  for (let c = nums.length; c >= 1 && out.length < k; c--) {
    for (const x of bucket[c]) {
      if (out.length < k) out.push(x);
    }
  }
  return out;
}

console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [ 1, 2 ]`;

const votingCode = `function majorityElement(nums) {
  let candidate = null, votes = 0;
  for (const x of nums) {
    if (votes === 0) candidate = x;          // no current leader: x becomes the candidate
    votes += x === candidate ? 1 : -1;       // a matching vote adds one, a different value cancels one
  }
  return candidate;
}

console.log(majorityElement([2, 2, 1, 1, 1, 2, 2])); // 2`;

const isoCode = `function isIsomorphic(s, t) {
  const st = new Map(), ts = new Map();
  for (let i = 0; i < s.length; i++) {
    const a = s[i], b = t[i];
    if ((st.has(a) && st.get(a) !== b) || (ts.has(b) && ts.get(b) !== a)) return false;
    st.set(a, b);
    ts.set(b, a);
  }
  return true;
}

console.log(isIsomorphic("egg", "add"));     // true   e→a, g→d
console.log(isIsomorphic("foo", "bar"));     // false  o would need to map to both a and r
console.log(isIsomorphic("badc", "baba"));   // false  b and d would both map to b`;

export default function DsaLessonTwentySevenPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Group things that share a key</h2>
      <p>
        Lesson 26 used a Map to remember single values. This lesson uses a Map to <strong>collect</strong> values.
        A Map is a collection of key → value pairs. Every item is turned into a <strong>key</strong> (a label). Items
        with the same key go into the same list or the same count. Think of sorting post into one box for each
        street name. The hard part of these problems is choosing the key.
      </p>

      <h2 id="keys">Designing a good key</h2>
      <p>
        A good key is equal for two items <em>exactly</em> when they belong together. An <strong>anagram</strong> is a
        word made from the same letters as another word in a different order, such as &ldquo;listen&rdquo; and
        &ldquo;silent&rdquo;. For anagrams there are two common keys:
      </p>
      <CodeBlock lang="js" code={keysCode} />
      <p>
        Both keys are <strong>strings</strong> (text). This matters in JavaScript. A Map compares arrays by identity
        (is it the very same array object?), not by contents (Lesson 15). So an array of counts cannot be the key
        directly. Join it into text first.
      </p>
      <Callout kind="note" label="Join counts with a separator">
        <p className="mb-0">
          Use <code>join(&quot;,&quot;)</code>, not <code>join(&quot;&quot;)</code>. Without a separator, the counts [1, 11]
          and [11, 1] would both become &ldquo;111&rdquo;. Two different keys would turn into the same key. This is called a collision.
        </p>
      </Callout>

      <h2 id="anagrams">Group anagrams</h2>
      <p>
        The task: given a list of words, put the anagrams together. Work out each word&apos;s key and add the word to the
        list for that key. This takes one pass, and you never compare two words with each other.
      </p>

      <h2 id="trace">Traced: grouping six words</h2>
      <CodeTrace
        code={groupCode}
        steps={groupTrace()}
        caption="Each word works out its key and goes straight to its group. No word is ever compared with another word."
      />
      <p>
        Say there are n words, each up to L letters long. The sorted key takes O(n · L log L) time. The count key takes
        O(n · L) time. Comparing every pair of words instead would take O(n² · L) time.
      </p>

      <h2 id="groupby">Grouping by anything</h2>
      <p>The same few lines can group by any key: length, first letter, remainder, or a field of an object. The function <code>keyOf</code> tells the code which key to use for each item:</p>
      <CodeBlock lang="js" code={groupByCode} />

      <h2 id="topk">Top k frequent: sort or buckets</h2>
      <p>
        The task: find the k values that appear most often. First count each value with a Map. Then put the values in
        order by count. Sorting the entries takes O(n log n) time. The <strong>bucket</strong> idea from Lesson 15
        avoids sorting. A bucket is a list that holds all values with the same count. A count can never be bigger than
        n, so use the count as an array index. Then read the buckets from the highest count down.
      </p>
      <CodeBlock lang="js" code={topKCode} />
      <DryRun
        title="[1, 1, 1, 2, 2, 3], k = 2"
        cols={["Step", "Result"]}
        rows={[
          ["counts", "1 → 3, 2 → 2, 3 → 1"],
          ["buckets", "bucket[3] = [1], bucket[2] = [2], bucket[1] = [3]"],
          ["read from c = 6 down", "take 1 (c = 3), then 2 (c = 2) — done"],
        ]}
        note="O(n) time. A heap (a structure that always gives you the biggest item quickly) gives O(n log k), which Lesson 46 covers."
      />

      <h2 id="majority">Majority element and Boyer–Moore voting</h2>
      <p>
        The <strong>majority element</strong> is the value that appears more than n/2 times (n is the length of the
        array). A frequency map finds it in O(n) time and O(n) space. Sorting and taking the middle value also works,
        because the majority value must cover the middle position. There is also a method that needs only O(1) extra
        space: <strong>Boyer–Moore voting</strong>.
      </p>
      <p>
        Imagine each value is a vote. Keep a current candidate and a vote count. A value that matches the candidate adds
        one vote. A different value cancels one vote. When the count drops to 0, the next value becomes the candidate.
        The majority value has more votes than all the other values together. So the others cannot cancel it
        completely, and it is the candidate at the end.
      </p>
      <CodeBlock lang="js" code={votingCode} />
      <DryRun
        title="majorityElement([2, 2, 1, 1, 1, 2, 2])"
        cols={["x", "candidate", "votes"]}
        rows={[
          ["2", "2", "1"],
          ["2", "2", "2"],
          ["1", "2", "1"],
          ["1", "2", "0"],
          ["1", "1", "1"],
          ["2", "1", "0"],
          ["2", "2", "1"],
        ]}
        highlight={6}
      />
      <Callout kind="warn" label="Only when a majority is guaranteed">
        <p className="mb-0">
          If the problem does not promise that a majority exists, the final candidate might be wrong. Then
          do a second pass to count the candidate and confirm it.
        </p>
      </Callout>

      <h2 id="isomorphic">Isomorphic strings: a two-way mapping</h2>
      <p>
        Two strings are <strong>isomorphic</strong> if you can change the letters of one string to get the other.
        Each letter must always change to the same letter, and no two different letters may change to the same letter.
        One Map is not enough. It catches &ldquo;o → a and o → r&rdquo; but not &ldquo;b → b and d → b&rdquo;. So use one
        Map for each direction:
      </p>
      <CodeBlock lang="js" code={isoCode} />
      <p>The same two-Map check solves &ldquo;word pattern&rdquo; (Practice question 6), where letters map to whole words.</p>

      <h2 id="practice">Practice questions</h2>
      <p>For each grouping question, write the key function first. Test it on two items that should match and two items that should not.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write two different anagram keys and say the cost of each.</>,
          <>Explain the bucket method for top k frequent and why it is O(n).</>,
          <>Dry-run Boyer–Moore voting on [3, 3, 4, 2, 3].</>,
          <>Explain why isomorphic strings need two Maps.</>,
        ]}
      />

      <h2 id="next">Part 5 complete — what&apos;s next</h2>
      <p>
        You can now use Maps and Sets to remember, count and group. These tools solve many medium-level interview
        questions.
      </p>
      <p>
        <strong>Part 6 — Binary Search</strong> shows a very different way to be fast. On sorted data, you throw
        away half of the remaining possibilities with every comparison. This takes O(log n) time.
      </p>
    </DsaLessonPage>
  );
}
