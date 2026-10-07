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

const lesson = getDsaLesson("lesson-33");

export const metadata: Metadata = {
  title: `Lesson 33 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "A tree of choices" },
  { id: "pickskip", label: "Pick or skip: all subsets" },
  { id: "loop", label: "The loop form (every node is an answer)" },
  { id: "trace", label: "Traced: subsets of [1, 2, 3]" },
  { id: "dups", label: "Subsets with duplicates" },
  { id: "perms", label: "Permutations" },
  { id: "combos", label: "Combinations of size k" },
  { id: "phone", label: "Letter combinations of a phone number" },
  { id: "cost", label: "How many answers? The cost of generating them" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const pickSkipCode = `function subsets(nums) {
  const out = [];
  const path = [];
  function go(i) {
    if (i === nums.length) {          // we decided about every element: this path is one subset
      out.push([...path]);            // save a copy! path keeps changing
      return;
    }
    go(i + 1);                        // skip nums[i]
    path.push(nums[i]);               // pick nums[i]
    go(i + 1);
    path.pop();                       // undo the pick before going back
  }
  go(0);
  return out;
}

console.log(JSON.stringify(subsets([1, 2]))); // [[],[2],[1],[1,2]]`;

const loopCode = `function subsets(nums) {
  const out = [];
  const path = [];
  function go(start) {
    out.push([...path]);                        // every node of the tree is a subset
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);                       // choose
      go(i + 1);                                // explore: use only later elements, so no repeats
      path.pop();                               // un-choose (undo)
    }
  }
  go(0);
  return out;
}

console.log(JSON.stringify(subsets([1, 2, 3]))); // [[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]`;

const traceSrc = `const nums = [1, 2, 3];
const out = [], path = [];
function go(start) {
  out.push([...path]);
  for (let i = start; i < nums.length; i++) {
    path.push(nums[i]);
    go(i + 1);
    path.pop();
  }
}
go(0);
console.log(out);`;

function subsetTrace() {
  const t = tracer();
  const nums = [1, 2, 3];
  const out: number[][] = [];
  const path: number[] = [];
  const go = (start: number) => {
    out.push([...path]);
    t.step(4, "run", `save [${path.join(", ")}]`, `Every node of the tree is a valid subset, so we save a copy of the current path. ${out.length} saved so far.`, { start, path, saved: out.length }, "path");
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      t.step(6, "update", `choose ${nums[i]} → path [${path.join(", ")}]`, `Add ${nums[i]} to the path. Then try everything that can come after it (only the elements after index ${i}).`, { i, path, saved: out.length }, "path");
      go(i + 1);
      path.pop();
      t.step(8, "update", `undo ${nums[i]} → path [${path.join(", ")}]`, `All the subsets that start with this choice are done. Remove ${nums[i]}, so the next choice starts from the same path.`, { i, path, saved: out.length }, "path");
    }
  };
  t.step(2, "start", "out = [], path = []", "path holds the choices made so far. out collects every subset.", { nums, out: [], path });
  go(0);
  t.print(out.map((s) => `[${s.join(",")}]`).join(" "));
  t.step(11, "print", "console.log(out)", "All 8 subsets (2³) were made. Each node of the call tree made exactly one.", { saved: out.length });
  return t.steps;
}

const dupsCode = `function subsetsWithDup(nums) {
  nums = [...nums].sort((a, b) => a - b);        // equal values must sit next to each other
  const out = [], path = [];
  function go(start) {
    out.push([...path]);
    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue;   // we already tried this same value at THIS level
      path.push(nums[i]);
      go(i + 1);
      path.pop();
    }
  }
  go(0);
  return out;
}

console.log(JSON.stringify(subsetsWithDup([1, 2, 2]))); // [[],[1],[1,2],[1,2,2],[2],[2,2]]`;

const permCode = `function permute(nums) {
  const out = [], path = [];
  const used = new Array(nums.length).fill(false);   // which elements are already in the path
  function go() {
    if (path.length === nums.length) { out.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {          // any element not used yet may come next
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      go();
      path.pop();
      used[i] = false;
    }
  }
  go();
  return out;
}

console.log(JSON.stringify(permute([1, 2, 3]))); // [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]`;

const comboCode = `function combine(n, k) {
  const out = [], path = [];
  function go(start) {
    if (path.length === k) { out.push([...path]); return; }
    // prune (cut off a branch): there must be enough numbers left (k - path.length) to fill the path
    for (let i = start; i <= n - (k - path.length) + 1; i++) {
      path.push(i);
      go(i + 1);
      path.pop();
    }
  }
  go(1);
  return out;
}

console.log(JSON.stringify(combine(4, 2))); // [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]`;

const phoneCode = `function letterCombinations(digits) {
  if (digits === "") return [];
  const letters = { 2: "abc", 3: "def", 4: "ghi", 5: "jkl", 6: "mno", 7: "pqrs", 8: "tuv", 9: "wxyz" };
  const out = [];
  function go(i, path) {
    if (i === digits.length) { out.push(path); return; }
    for (const ch of letters[digits[i]]) go(i + 1, path + ch);   // one child for each letter of this digit
  }
  go(0, "");
  return out;
}

console.log(JSON.stringify(letterCombinations("23"))); // ["ad","ae","af","bd","be","bf","cd","ce","cf"]
console.log(JSON.stringify(letterCombinations("")));   // []`;

export default function DsaLessonThirtyThreePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">A tree of choices</h2>
      <p>
        Lesson 32 drew recursion trees. In this lesson each <strong>branch is a decision</strong>. For example: use this item or not,
        which item goes next, or which letter to use. A path from the root to a leaf is one full set of decisions, and
        <strong> the leaves are the answers</strong>. To list every subset, permutation or combination, you just walk
        through the whole tree. (A subset is some of the items. A permutation is all the items in some order. A combination is a group of items where order does not matter.)
      </p>
      <p>
        Every solution in this lesson uses the same three-step move. This is the main idea of <strong>backtracking</strong>. Backtracking means you try a choice, and if you are done with it, you undo it and try the next one. It is like walking through a maze and coming back to the last turn.
      </p>
      <Callout kind="ok" label="Choose → explore → un-choose (undo)">
        <ol className="mb-0 mt-1 list-decimal pl-5">
          <li><strong>Choose</strong>: add an item to the current <code>path</code> (the list of choices made so far).</li>
          <li><strong>Explore</strong>: make a recursive call to decide everything that comes next.</li>
          <li><strong>Un-choose</strong>: remove the item with <code>path.pop()</code>. Then the next choice at the same level starts from the same state.</li>
        </ol>
      </Callout>

      <h2 id="pickskip">Pick or skip: all subsets</h2>
      <p>
        You build a subset of <code>[1, 2, 3]</code> one element at a time. For each element, you can <strong>skip</strong> it or{" "}
        <strong>pick</strong> it. There are 2 choices for each of the n elements, so there are 2<sup>n</sup> subsets.
      </p>
      <CodeBlock lang="js" code={pickSkipCode} />
      <Callout kind="warn" label="Copy the path before you save it">
        <code>path</code> is one array that every call shares, and it keeps changing. If you write <code>out.push(path)</code>, you put
        the <em>same</em> array in the result many times. At the end, all of them would be empty. Always save a copy:{" "}
        <code>out.push([...path])</code>.
      </Callout>

      <h2 id="loop">The loop form (every node is an answer)</h2>
      <p>
        There is a second way to write it. It is more general, and you will use it again for combinations and combination sum. At each call, loop over the
        items that can <em>come next</em>. You only look at items after the one you just chose (<code>start</code> only moves
        forward). So you never make the same set in two different orders. In this form, <strong>every node</strong> of the tree is a
        valid subset, not just the leaves.
      </p>
      <CodeBlock lang="js" code={loopCode} />

      <h2 id="trace">Traced: subsets of [1, 2, 3]</h2>
      <CodeTrace
        code={traceSrc}
        steps={subsetTrace()}
        caption="Watch the path grow when an element is chosen and shrink when the choice is undone. Each time a call starts, the path is saved."
      />
      <DryRun
        title="The call tree for [1, 2, 3] (loop form)"
        cols={["Call go(start)", "Saves", "Then chooses…"]}
        rows={[
          ["go(0), path []", "[]", "1, then 2, then 3"],
          ["  go(1), path [1]", "[1]", "2, then 3"],
          ["    go(2), path [1, 2]", "[1, 2]", "3"],
          ["      go(3), path [1, 2, 3]", "[1, 2, 3]", "(nothing left)"],
          ["    go(3), path [1, 3]", "[1, 3]", "(nothing left)"],
          ["  go(2), path [2]", "[2]", "3"],
          ["    go(3), path [2, 3]", "[2, 3]", "(nothing left)"],
          ["  go(3), path [3]", "[3]", "(nothing left)"],
        ]}
        note="Eight calls and eight subsets: 2³."
      />

      <h2 id="dups">Subsets with duplicates</h2>
      <p>
        Take <code>[1, 2, 2]</code>. If you pick the first 2, or pick the second 2, you get the same subset <code>[1, 2]</code>.
        The fix has two parts. First, <strong>sort</strong> the array, so equal values sit next to each other. Second, inside the loop, <strong>skip a value that is equal to the
        one before it at the same level</strong>. The condition is <code>i &gt; start &amp;&amp; nums[i] === nums[i − 1]</code>.
        The first 2 at this level is allowed, because it is at <code>i === start</code>. Later copies of 2 at the same level are skipped.
      </p>
      <CodeBlock lang="js" code={dupsCode} />

      <h2 id="perms">Permutations</h2>
      <p>
        A permutation uses <strong>every</strong> element exactly once, in some order. At each step, any element that is not in the path yet
        may come next. So the loop starts from 0 every time, and a <code>used</code> array remembers which elements are
        taken. There are n! leaves. (n! means n × (n − 1) × … × 1. For example, 3! = 6.)
      </p>
      <CodeBlock lang="js" code={permCode} />

      <h2 id="combos">Combinations of size k</h2>
      <p>
        Choose k numbers out of 1…n. The order does not matter. This is the subset loop with two changes. First, stop when the path has
        length k, because that is an answer. Second, <strong>prune</strong> (cut off) branches that cannot reach k. If there are not enough
        numbers left, do not go further.
      </p>
      <CodeBlock lang="js" code={comboCode} />

      <h2 id="phone">Letter combinations of a phone number</h2>
      <p>
        On a phone keypad, each digit has some letters (2 → abc, 3 → def …). If you type &ldquo;23&rdquo;, you can spell any letter of the first
        digit followed by any letter of the second. The tree has one level for each digit and one child for each letter.
      </p>
      <CodeBlock lang="js" code={phoneCode} />

      <h2 id="cost">How many answers? The cost of generating them</h2>
      <DryRun
        title="The size of the answer is the least time you need"
        cols={["Problem", "Number of answers", "Time (including copying each answer)"]}
        rows={[
          ["subsets of n items", "2ⁿ", "O(n · 2ⁿ)"],
          ["permutations of n items", "n!", "O(n · n!)"],
          ["combinations C(n, k)", "n! / (k! (n − k)!)", "O(k · C(n, k))"],
          ["letter combinations of d digits", "up to 4ᵈ", "O(d · 4ᵈ)"],
        ]}
        note="These take exponential time (the time grows very fast) because the answer itself is very large. You cannot be faster than the size of the output. This is why these problems only have small inputs (n ≤ 20 for subsets, n ≤ 10 for permutations)."
      />

      <h2 id="practice">Practice questions</h2>
      <p>Before you write code for each one, draw the tree for an input with 3 elements. Write down what each level decides.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the choose, explore, un-choose pattern. Explain why you must copy the path when you save it.</>,
          <>Write the loop-form subsets function. Explain why <code>start</code> only moves forward.</>,
          <>Explain the duplicate-skipping condition <code>i &gt; start &amp;&amp; nums[i] === nums[i − 1]</code>.</>,
          <>Say how many subsets, permutations and combinations there are. Explain why the running time is at least that large.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Everything in this lesson lists <em>all</em> the answers. <strong>Lesson 34</strong> adds a rule: you make
        only the answers that are valid, and you <strong>stop a branch as soon as you know it cannot work</strong>. The problems are combination sum,
        palindrome partitioning, word search and N-Queens.
      </p>
    </DsaLessonPage>
  );
}
