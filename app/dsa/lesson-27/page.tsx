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
  t.step(2, "start", "groups = new Map()", "key → list of words with that key.", { groups: snap() }, "groups");
  for (const w of words) {
    const key = [...w].sort().join("");
    t.step(4, "run", `"${w}" → key "${key}"`, "Anagrams have the same letters, so sorting gives the same key.", { w, key, groups: snap() }, "key");
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

// Modern JavaScript has this built in:
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
    if (votes === 0) candidate = x;          // no current leader: x takes over
    votes += x === candidate ? 1 : -1;       // a matching vote, or one that cancels
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
        Lesson 26 used a Map to remember single values. This lesson uses it to <strong>collect</strong> values: every
        item is turned into a <strong>key</strong>, and items with the same key end up in the same list or count. The
        whole difficulty of these problems is choosing the key.
      </p>

      <h2 id="keys">Designing a good key</h2>
      <p>
        A good key is equal for two items <em>exactly</em> when they belong together. For anagrams — words with the same
        letters in a different order — there are two common keys:
      </p>
      <CodeBlock lang="js" code={keysCode} />
      <p>
        Both keys are <strong>strings</strong>. That matters in JavaScript: a Map compares arrays by identity, not by
        contents (Lesson 15), so an array of counts cannot be the key directly — join it into text first.
      </p>
      <Callout kind="note" label="Join counts with a separator">
        <p className="mb-0">
          Use <code>join(&quot;,&quot;)</code>, not <code>join(&quot;&quot;)</code>. Without a separator, counts like [1, 11]
          and [11, 1] would both become &ldquo;111&rdquo; and collide.
        </p>
      </Callout>

      <h2 id="anagrams">Group anagrams</h2>
      <p>
        Given a list of words, put anagrams together. Compute each word&apos;s key and append the word to that key&apos;s
        list. One pass, no comparisons between words at all.
      </p>

      <h2 id="trace">Traced: grouping six words</h2>
      <CodeTrace
        code={groupCode}
        steps={groupTrace()}
        caption="Each word computes its key and goes straight to its group — no word is ever compared with another."
      />
      <p>
        For n words of length up to L, the sorted key gives O(n · L log L); the count key gives O(n · L). Comparing every
        pair of words instead would be O(n² · L).
      </p>

      <h2 id="groupby">Grouping by anything</h2>
      <p>The same five lines group by any key — length, first letter, remainder, a field of an object:</p>
      <CodeBlock lang="js" code={groupByCode} />

      <h2 id="topk">Top k frequent: sort or buckets</h2>
      <p>
        To find the k most frequent values, count with a Map and then order by count. Sorting the entries costs O(n log n).
        The <strong>bucket</strong> idea from Lesson 15 avoids sorting: a count can never exceed n, so use the count as an
        array index and read the buckets from the highest count down.
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
        note="O(n) time. A heap gives O(n log k), which Lesson 46 covers."
      />

      <h2 id="majority">Majority element and Boyer–Moore voting</h2>
      <p>
        The <strong>majority element</strong> appears more than n/2 times. A frequency map finds it in O(n) time and O(n)
        space. Sorting and taking the middle value works too, because the majority must cover the middle position. But
        there is an O(1)-space method: <strong>Boyer–Moore voting</strong>.
      </p>
      <p>
        Imagine each value voting. Keep a current candidate and a vote count. A matching value adds a vote; a different
        value cancels one. When the count drops to 0, the next value becomes the candidate. Because the majority has more
        votes than all the others together, it cannot be cancelled out completely — it is the candidate at the end.
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
          If the problem does not promise that a majority exists, the final candidate might be wrong. Then do a second
          pass to count it and confirm.
        </p>
      </Callout>

      <h2 id="isomorphic">Isomorphic strings: a two-way mapping</h2>
      <p>
        Two strings are <strong>isomorphic</strong> if you can replace letters of one to get the other, with each letter
        always replaced by the same letter and no two letters replaced by the same one. One Map is not enough — it catches
        &ldquo;o → a and o → r&rdquo; but not &ldquo;b → b and d → b&rdquo;. Use one Map in each direction:
      </p>
      <CodeBlock lang="js" code={isoCode} />
      <p>The same two-Map check solves &ldquo;word pattern&rdquo; (Practice question 6), where letters map to whole words.</p>

      <h2 id="practice">Practice questions</h2>
      <p>For each grouping question, write the key function first and test it on two items that should match and two that should not.</p>

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
        You can now use Maps and Sets to remember, count and group — the tools behind a large share of medium interview
        questions.
      </p>
      <p>
        <strong>Part 6 — Binary Search</strong> introduces a completely different way to be fast: on sorted data, throw
        away half of the remaining possibilities with every comparison, for O(log n).
      </p>
    </DsaLessonPage>
  );
}
