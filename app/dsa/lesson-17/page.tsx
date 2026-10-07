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

const lesson = getDsaLesson("lesson-17");

export const metadata: Metadata = {
  title: `Lesson 17 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Divide and conquer" },
  { id: "merge", label: "Merging two sorted arrays" },
  { id: "trace", label: "Traced: merge([1, 4, 7], [2, 3, 9])" },
  { id: "sort", label: "Merge sort: split, sort, merge" },
  { id: "tree", label: "The recursion tree" },
  { id: "cost", label: "Why it is O(n log n)" },
  { id: "space", label: "Extra space and stability" },
  { id: "inversions", label: "Counting inversions (a preview)" },
  { id: "practice", label: "Practice questions (6)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const mergeCode = `function merge(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}
console.log(merge([1, 4, 7], [2, 3, 9]));`;

function mergeTrace() {
  const t = tracer();
  const a = [1, 4, 7];
  const b = [2, 3, 9];
  t.step(1, "start", "merge([1, 4, 7], [2, 3, 9])", "Both inputs are already sorted. That is the whole trick.", { a, b });
  const out: number[] = [];
  t.step(2, "start", "out = []", "The merged result, built from left to right.", { a, b, out: [...out] }, "out");
  let i = 0, j = 0;
  t.step(3, "start", "i = 0, j = 0", "One finger at the front of each array.", { a, b, out: [...out], i, j });
  while (i < a.length && j < b.length) {
    t.step(4, "check", `Both have items left (i = ${i}, j = ${j})`, "Compare the two front items.", { a, b, out: [...out], i, j });
    if (a[i] <= b[j]) {
      t.step(5, "check", `a[${i}] = ${a[i]} <= b[${j}] = ${b[j]}? yes`, `${a[i]} is the smallest item not yet used — nothing behind it in either array can be smaller.`, { a, b, out: [...out], i, j });
      out.push(a[i++]);
      t.step(5, "update", `out.push(${out[out.length - 1]}), i = ${i}`, "Take it and move the first finger.", { a, b, out: [...out], i, j }, "out");
    } else {
      t.step(5, "check", `a[${i}] = ${a[i]} <= b[${j}] = ${b[j]}? no`, `${b[j]} is smaller.`, { a, b, out: [...out], i, j });
      out.push(b[j++]);
      t.step(6, "update", `out.push(${out[out.length - 1]}), j = ${j}`, "Take it and move the second finger.", { a, b, out: [...out], i, j }, "out");
    }
  }
  t.step(4, "stop", i === a.length ? "a is used up" : "b is used up", "One array is empty, so everything left in the other is larger than all of out — copy it across.", { a, b, out: [...out], i, j });
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  t.step(9, "update", "copy the leftovers", "Here only 9 was left.", { a, b, out: [...out], i, j }, "out");
  t.print("[ 1, 2, 3, 4, 7, 9 ]");
  t.step(12, "print", "console.log(out)", "Six items, six steps: merging is O(n + m).", { out: [...out] });
  return t.steps;
}

const sortCode = `function merge(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr;                  // base case: already sorted
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));        // sort the left half
  const right = mergeSort(arr.slice(mid));          // sort the right half
  return merge(left, right);                        // combine
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
// [ 3, 9, 10, 27, 38, 43, 82 ]`;

const inversionCode = `function countInversions(arr) {
  let count = 0;

  function sort(a) {
    if (a.length <= 1) return a;
    const mid = Math.floor(a.length / 2);
    const left = sort(a.slice(0, mid));
    const right = sort(a.slice(mid));
    const out = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) out.push(left[i++]);
      else {
        count += left.length - i;     // right[j] is smaller than every remaining left item
        out.push(right[j++]);
      }
    }
    while (i < left.length) out.push(left[i++]);
    while (j < right.length) out.push(right[j++]);
    return out;
  }

  sort(arr);
  return count;
}

console.log(countInversions([5, 3, 8, 1, 4])); // 6
console.log(countInversions([1, 2, 3]));       // 0`;

export default function DsaLessonSeventeenPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Divide and conquer</h2>
      <p>
        Sorting 1,000 cards is hard. Sorting two piles of 500 is easier, and sorting a pile of one card needs
        no work at all. <strong>Divide and conquer</strong> uses this: split the problem into smaller copies,
        solve each copy (by recursion, Lesson 14), and combine the answers.
      </p>
      <p>For sorting, that becomes three steps:</p>
      <ol>
        <li><strong>Divide:</strong> cut the array into two halves.</li>
        <li><strong>Conquer:</strong> sort each half — recursively, with the same method.</li>
        <li><strong>Combine:</strong> merge the two sorted halves into one sorted array.</li>
      </ol>
      <p>
        Steps 1 and 2 are almost free to write. All the real work is in step 3, so we learn it first.
      </p>

      <h2 id="merge">Merging two sorted arrays</h2>
      <p>
        Given two arrays that are <em>already sorted</em>, produce one sorted array. Put a finger at the
        start of each. The smaller of the two front items is the smallest item overall, so take it and move
        that finger. Repeat until one array runs out, then copy the rest of the other.
      </p>

      <h2 id="trace">Traced: merge([1, 4, 7], [2, 3, 9])</h2>
      <CodeTrace
        code={mergeCode}
        steps={mergeTrace()}
        caption="Each comparison places exactly one item. Nothing is ever compared twice."
      />
      <p>
        Every step places one item in <code>out</code>, so merging arrays of lengths n and m takes{" "}
        <strong>O(n + m)</strong> time. This two-finger walk is also the start of the two-pointer pattern
        (Lesson 21).
      </p>

      <h2 id="sort">Merge sort: split, sort, merge</h2>
      <CodeBlock lang="js" code={sortCode} />
      <p>
        Read <code>mergeSort</code> using the recursion rule from Lesson 14: <em>trust</em> that the two
        recursive calls return sorted halves. Then <code>merge</code> combines them. The base case is an
        array of 0 or 1 items, which is sorted already.
      </p>

      <h2 id="tree">The recursion tree</h2>
      <p>Here is every call for <code>[38, 27, 43, 3, 9, 82, 10]</code>, one level per row:</p>
      <DryRun
        title="splitting down, then merging back up"
        cols={["Level", "Pieces"]}
        rows={[
          ["0 (split)", "[38, 27, 43, 3, 9, 82, 10]"],
          ["1 (split)", "[38, 27, 43] · [3, 9, 82, 10]"],
          ["2 (split)", "[38] · [27, 43] · [3, 9] · [82, 10]"],
          ["3 (base cases)", "[38] · [27] · [43] · [3] · [9] · [82] · [10]"],
          ["2 (merged)", "[38] · [27, 43] · [3, 9] · [10, 82]"],
          ["1 (merged)", "[27, 38, 43] · [3, 9, 10, 82]"],
          ["0 (merged)", "[3, 9, 10, 27, 38, 43, 82]"],
        ]}
        highlight={6}
        note="On the way down nothing is sorted — the array is only cut. All sorting happens in the merges on the way back up."
      />

      <h2 id="cost">Why it is O(n log n)</h2>
      <p>Look at the tree level by level:</p>
      <ul>
        <li>
          <strong>Work per level:</strong> the merges on one level together touch every item once — the pieces
          on a level add up to the whole array. So each level costs O(n).
        </li>
        <li>
          <strong>Number of levels:</strong> each level halves the piece size, from n down to 1. That is the
          halving loop from Lesson 12: about log₂ n levels.
        </li>
      </ul>
      <p>
        n work on each of log n levels gives <strong>O(n log n)</strong> — in the best, average and worst case,
        because merge sort always splits the same way regardless of the values. For n = 1,000,000 that is about
        20 million steps instead of the 10<sup>12</sup> of an O(n²) sort.
      </p>
      <DryRun
        title="cost of merge sort on n = 8"
        cols={["Level", "Pieces", "Piece size", "Work on this level"]}
        rows={[
          ["1", "2", "4", "8"],
          ["2", "4", "2", "8"],
          ["3", "8", "1", "8"],
        ]}
        note="3 levels (log₂ 8) × 8 items = 24 steps of merging."
      />

      <h2 id="space">Extra space and stability</h2>
      <p>
        Merge sort is not in place: <code>merge</code> builds a new array, so it needs <strong>O(n) extra
        space</strong>, plus O(log n) for the recursion depth. That is its main disadvantage compared with quick
        sort (Lesson 18).
      </p>
      <p>
        It is <strong>stable</strong>, thanks to one character: <code>a[i] &lt;= b[j]</code>. When the two front
        items are equal, the one from the left half — which came first in the original array — is taken first.
        Writing <code>&lt;</code> instead would still sort correctly but would lose stability.
      </p>
      <Callout kind="note" label="Where you meet merge sort in practice">
        <p className="mb-0">
          JavaScript&apos;s <code>sort</code> (TimSort) is a merge sort that first finds already-sorted runs in the
          data. Merge sort is also the standard way to sort a linked list (Lesson 37), because merging needs no
          random access.
        </p>
      </Callout>

      <h2 id="inversions">Counting inversions (a preview)</h2>
      <p>
        Lesson 16 counted <em>inversions</em> — pairs i &lt; j with arr[i] &gt; arr[j] — in O(n²). Merge sort can
        count them almost for free. During a merge, when an item from the <strong>right</strong> half is taken,
        it is smaller than every item still waiting in the left half — and each of those left items came
        before it in the original array. So that step finds <code>left.length - i</code> inversions at once.
      </p>
      <CodeBlock lang="js" code={inversionCode} />
      <p>
        Same O(n log n) as merge sort. Changing the &ldquo;combine&rdquo; step to collect extra information is a
        common divide-and-conquer technique.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>Most of these use only the <code>merge</code> step — it is more useful in interviews than the full sort.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write <code>merge</code> from memory, including the two &ldquo;leftover&rdquo; loops.</>,
          <>Draw the recursion tree for merge sort on [4, 1, 3, 2].</>,
          <>Explain O(n log n) using &ldquo;work per level&rdquo; and &ldquo;number of levels&rdquo;.</>,
          <>Say which single character makes merge sort stable.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Merge sort does its work while <em>combining</em>. Quick sort does the opposite: it does its work while{" "}
        <em>splitting</em>, and needs no merge at all. Lesson 18 covers quick sort, quickselect, and how to use
        JavaScript&apos;s <code>sort</code> correctly — including its famous trap with numbers.
      </p>
    </DsaLessonPage>
  );
}
