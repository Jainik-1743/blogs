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
    if (i === nums.length) {          // decided about every element: this path is one subset
      out.push([...path]);            // copy it! path keeps changing
      return;
    }
    go(i + 1);                        // skip nums[i]
    path.push(nums[i]);               // pick nums[i]
    go(i + 1);
    path.pop();                       // undo the pick before returning
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
      go(i + 1);                                // explore: only later elements, so no repeats
      path.pop();                               // un-choose
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
    t.step(4, "run", `save [${path.join(", ")}]`, `Every node of the tree is a valid subset, so a copy of the current path is saved. ${out.length} saved so far.`, { start, path, saved: out.length }, "path");
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      t.step(6, "update", `choose ${nums[i]} → path [${path.join(", ")}]`, `Add ${nums[i]} to the path, then explore everything that can follow it (only elements after index ${i}).`, { i, path, saved: out.length }, "path");
      go(i + 1);
      path.pop();
      t.step(8, "update", `undo ${nums[i]} → path [${path.join(", ")}]`, `Everything that starts with this choice is finished. Remove ${nums[i]} so the next choice starts from the same path.`, { i, path, saved: out.length }, "path");
    }
  };
  t.step(2, "start", "out = [], path = []", "path is the choices made so far. out collects every subset.", { nums, out: [], path });
  go(0);
  t.print(out.map((s) => `[${s.join(",")}]`).join(" "));
  t.step(11, "print", "console.log(out)", "All 8 subsets (2³) were generated: each node of the call tree produced exactly one.", { saved: out.length });
  return t.steps;
}

const dupsCode = `function subsetsWithDup(nums) {
  nums = [...nums].sort((a, b) => a - b);        // equal values must be neighbours
  const out = [], path = [];
  function go(start) {
    out.push([...path]);
    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue;   // same value already tried at THIS level
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
    for (let i = 0; i < nums.length; i++) {          // any unused element may come next
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
    // prune: there must be enough numbers left (k - path.length) to fill the path
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
    for (const ch of letters[digits[i]]) go(i + 1, path + ch);   // one child per letter of this digit
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
        Lesson 32 drew recursion trees. In this lesson each <strong>branch is a decision</strong>: include this item or not,
        which item goes next, which letter to use. A path from the root to a leaf is one complete set of decisions, and
        <strong> the leaves are the answers</strong>. To generate every subset, permutation or combination you simply walk
        the whole tree.
      </p>
      <p>
        Every solution in this lesson uses the same three-line move, which is the heart of <strong>backtracking</strong>:
      </p>
      <Callout kind="ok" label="Choose → explore → un-choose">
        <ol className="mb-0 mt-1 list-decimal pl-5">
          <li><strong>Choose</strong>: add an item to the current <code>path</code>.</li>
          <li><strong>Explore</strong>: recurse to decide everything that comes next.</li>
          <li><strong>Un-choose</strong>: remove the item (<code>path.pop()</code>), so the next sibling starts from the same state.</li>
        </ol>
      </Callout>

      <h2 id="pickskip">Pick or skip: all subsets</h2>
      <p>
        A subset of <code>[1, 2, 3]</code> is decided element by element: for each one, <strong>skip</strong> it or{" "}
        <strong>pick</strong> it. Two choices for each of n elements gives 2<sup>n</sup> subsets.
      </p>
      <CodeBlock lang="js" code={pickSkipCode} />
      <Callout kind="warn" label="Copy the path before saving it">
        <code>path</code> is one array that every call shares and keeps changing. Saving <code>out.push(path)</code> would put
        the <em>same</em> array in the result many times, and by the end all of them would be empty. Always save a copy:{" "}
        <code>out.push([...path])</code>.
      </Callout>

      <h2 id="loop">The loop form (every node is an answer)</h2>
      <p>
        There is a second, more general shape you will reuse for combinations and combination sum: at each call, loop over the
        items that may <em>come next</em>. Because you only look at items after the one just chosen (<code>start</code> moves
        forward), you never produce the same set in two orders. In this form <strong>every node</strong> of the tree is a
        valid subset, not just the leaves.
      </p>
      <CodeBlock lang="js" code={loopCode} />

      <h2 id="trace">Traced: subsets of [1, 2, 3]</h2>
      <CodeTrace
        code={traceSrc}
        steps={subsetTrace()}
        caption="Watch the path grow when an element is chosen and shrink when it is undone. Each time a call starts, the path is saved."
      />
      <DryRun
        title="the call tree for [1, 2, 3] (loop form)"
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
        note="Eight calls, eight subsets: 2³."
      />

      <h2 id="dups">Subsets with duplicates</h2>
      <p>
        With <code>[1, 2, 2]</code>, picking the first 2 and picking the second 2 give the same subset <code>[1, 2]</code>.
        The fix: <strong>sort</strong> so equal values are neighbours, and inside the loop <strong>skip a value that equals the
        previous one at the same level</strong>. The condition is <code>i &gt; start &amp;&amp; nums[i] === nums[i − 1]</code>:
        the first 2 at this level is allowed (it is at <code>i === start</code>), later copies at the same level are skipped.
      </p>
      <CodeBlock lang="js" code={dupsCode} />

      <h2 id="perms">Permutations</h2>
      <p>
        A permutation uses <strong>every</strong> element exactly once, in some order. At each step any element that is not yet
        in the path may come next, so the loop starts from 0 every time and a <code>used</code> array remembers what is
        taken. There are n! leaves.
      </p>
      <CodeBlock lang="js" code={permCode} />

      <h2 id="combos">Combinations of size k</h2>
      <p>
        Choose k numbers out of 1…n, order not mattering. It is the subset loop with two changes: stop when the path has
        length k (that is the answer), and <strong>prune</strong> branches that cannot reach k — if there are not enough
        numbers left, do not bother.
      </p>
      <CodeBlock lang="js" code={comboCode} />

      <h2 id="phone">Letter combinations of a phone number</h2>
      <p>
        Each digit on a phone maps to letters (2 → abc, 3 → def …). Typing &ldquo;23&rdquo; can spell any letter of the first
        digit followed by any letter of the second. The tree has one level per digit and one child per letter.
      </p>
      <CodeBlock lang="js" code={phoneCode} />

      <h2 id="cost">How many answers? The cost of generating them</h2>
      <DryRun
        title="size of the answer = lower bound on the time"
        cols={["Problem", "Number of answers", "Time (including copying each)"]}
        rows={[
          ["subsets of n items", "2ⁿ", "O(n · 2ⁿ)"],
          ["permutations of n items", "n!", "O(n · n!)"],
          ["combinations C(n, k)", "n! / (k! (n − k)!)", "O(k · C(n, k))"],
          ["letter combinations of d digits", "up to 4ᵈ", "O(d · 4ᵈ)"],
        ]}
        note="These are exponential because the answer itself is exponentially large. You cannot be faster than the size of the output, which is why these problems only have small inputs (n ≤ 20 for subsets, n ≤ 10 for permutations)."
      />

      <h2 id="practice">Practice questions</h2>
      <p>Before coding each one, draw the tree for a 3-element input and write what each level decides.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the choose–explore–un-choose pattern and explain why the path must be copied when saved.</>,
          <>Write the loop-form subsets function and explain why <code>start</code> only moves forward.</>,
          <>Explain the duplicate-skipping condition <code>i &gt; start &amp;&amp; nums[i] === nums[i − 1]</code>.</>,
          <>State the number of subsets, permutations and combinations, and why the running time is at least that large.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Everything in this lesson enumerates <em>all</em> answers. <strong>Lesson 34</strong> adds a constraint: you generate
        only the answers that are valid, and <strong>abandon a branch the moment it cannot work</strong> — combination sum,
        palindrome partitioning, word search and N-Queens.
      </p>
    </DsaLessonPage>
  );
}
