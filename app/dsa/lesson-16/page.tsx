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

const lesson = getDsaLesson("lesson-16");

export const metadata: Metadata = {
  title: `Lesson 16 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "What sorting means" },
  { id: "stability", label: "Stability: keeping ties in order" },
  { id: "selection", label: "Selection sort" },
  { id: "bubble", label: "Bubble sort and the early exit" },
  { id: "insertion", label: "Insertion sort" },
  { id: "trace", label: "Traced: insertion sort on [5, 2, 4, 1]" },
  { id: "nearly", label: "Why insertion sort loves nearly sorted data" },
  { id: "compare", label: "The three side by side" },
  { id: "practice", label: "Practice questions (6)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const stableCode = `const students = [
  { name: "Asha",  grade: "B" },
  { name: "Ben",   grade: "A" },
  { name: "Chen",  grade: "B" },
  { name: "Dara",  grade: "A" },
];

students.sort((a, b) => a.grade.localeCompare(b.grade));
console.log(students.map((s) => s.name).join(", "));
// Ben, Dara, Asha, Chen   — A's first; within each grade, the original order is kept`;

const selectionCode = `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {           // find the smallest in arr[i..]
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];  // put it at position i
  }
  return arr;
}

console.log(selectionSort([5, 3, 8, 1, 4])); // [ 1, 3, 4, 5, 8 ]`;

const bubbleCode = `function bubbleSort(arr) {
  const n = arr.length;
  for (let pass = 0; pass < n - 1; pass++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - pass; j++) {     // the last "pass" items are already in place
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;                         // no swaps: already sorted, stop early
  }
  return arr;
}

console.log(bubbleSort([5, 3, 8, 1, 4])); // [ 1, 3, 4, 5, 8 ]
console.log(bubbleSort([1, 2, 3, 4, 5])); // [ 1, 2, 3, 4, 5 ]   one pass, then stop`;

const insertionCode = `const arr = [5, 2, 4, 1];
for (let i = 1; i < arr.length; i++) {
  const key = arr[i];
  let j = i - 1;
  while (j >= 0 && arr[j] > key) {
    arr[j + 1] = arr[j];
    j--;
  }
  arr[j + 1] = key;
}
console.log(arr);`;

function insertionTrace() {
  const t = tracer();
  const arr = [5, 2, 4, 1];
  t.step(1, "start", "arr = [5, 2, 4, 1]", "The first item alone counts as a sorted part of length 1.", { arr: [...arr] }, "arr");
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    t.step(3, "start", `i = ${i}, key = ${key}`, `Take arr[${i}] out. Everything left of it (${arr.slice(0, i).join(", ")}) is already sorted.`, { arr: [...arr], i, key }, "key");
    let j = i - 1;
    t.step(4, "start", `j = ${j}`, "Start comparing with the item just left of the gap.", { arr: [...arr], i, key, j }, "j");
    while (j >= 0 && arr[j] > key) {
      t.step(5, "check", `${arr[j]} > ${key}? yes`, `${arr[j]} is bigger, so it must move one place right to make room.`, { arr: [...arr], i, key, j });
      arr[j + 1] = arr[j];
      t.step(6, "update", `arr[${j + 1}] = ${arr[j]}`, "Shift right. (For a moment the value appears twice — the key is safe in its own variable.)", { arr: [...arr], i, key, j }, "arr");
      j--;
      t.step(7, "update", `j = ${j}`, "Move one position further left.", { arr: [...arr], i, key, j }, "j");
    }
    t.step(5, "stop", j < 0 ? "j >= 0? no" : `${arr[j]} > ${key}? no`, j < 0 ? "We reached the start: the key is the smallest so far." : `${arr[j]} is not bigger, so the key belongs right after it.`, { arr: [...arr], i, key, j });
    arr[j + 1] = key;
    t.step(9, "update", `arr[${j + 1}] = ${key}`, `Drop the key into the gap. Now arr[0..${i}] is sorted.`, { arr: [...arr], i, key, j }, "arr");
  }
  t.print("[ 1, 2, 4, 5 ]");
  t.step(11, "print", "console.log(arr)", "Sorted in place.", { arr: [...arr] });
  return t.steps;
}

export default function DsaLessonSixteenPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">What sorting means</h2>
      <p>
        Sorting puts items in order — numbers from smallest to largest, words alphabetically, people by
        age. It is one of the most useful things you can do to data: once an array is sorted, duplicates sit
        next to each other, the smallest and largest are at the ends, and you can search it by halving
        (Lesson 28).
      </p>
      <p>
        In JavaScript you will almost always sort with <code>arr.sort((a, b) =&gt; a - b)</code> (Lesson 18
        explains why the comparison function is needed). So why learn to sort by hand? Because the three
        simple sorts in this lesson teach the core moves — find the minimum, swap neighbours, insert into a
        sorted part — and those moves appear inside many interview problems. They also make the jump to the
        O(n log n) sorts in the next two lessons easy to understand.
      </p>

      <h2 id="stability">Stability: keeping ties in order</h2>
      <p>
        When two items compare as equal, a <strong>stable</strong> sort keeps them in the order they had
        before. This matters when you sort records by one field:
      </p>
      <CodeBlock lang="js" code={stableCode} />
      <p>
        Asha came before Chen and both have a B, so a stable sort keeps Asha first. JavaScript&apos;s{" "}
        <code>sort</code> has been guaranteed stable since 2019. An <strong>in-place</strong> sort is the
        other property to know: it rearranges the array itself using only O(1) extra memory.
      </p>

      <h2 id="selection">Selection sort</h2>
      <p>
        <strong>Idea:</strong> find the smallest item and put it first. Then find the smallest of the rest
        and put it second. Repeat.
      </p>
      <CodeBlock lang="js" code={selectionCode} />
      <DryRun
        title="selectionSort([5, 3, 8, 1, 4])"
        cols={["i", "Smallest in arr[i..]", "Swap", "Array after"]}
        rows={[
          ["0", "1 (index 3)", "5 ↔ 1", "[1, 3, 8, 5, 4]"],
          ["1", "3 (index 1)", "none needed", "[1, 3, 8, 5, 4]"],
          ["2", "4 (index 4)", "8 ↔ 4", "[1, 3, 4, 5, 8]"],
          ["3", "5 (index 3)", "none needed", "[1, 3, 4, 5, 8]"],
        ]}
        note="After pass i, positions 0..i hold the i + 1 smallest values in their final places."
      />
      <p>
        The inner loop always scans the whole unsorted part: (n − 1) + (n − 2) + … + 1 ≈ n²/2 comparisons,
        even if the array is already sorted. So selection sort is <strong>O(n²)</strong> in every case. Its
        one advantage: at most n − 1 swaps. It is not stable — a long-distance swap can jump an item over an
        equal one.
      </p>

      <h2 id="bubble">Bubble sort and the early exit</h2>
      <p>
        <strong>Idea:</strong> walk through the array comparing neighbours, and swap any pair that is in the
        wrong order. After one full pass, the largest value has &ldquo;bubbled&rdquo; to the end. Repeat on the
        rest.
      </p>
      <CodeBlock lang="js" code={bubbleCode} />
      <DryRun
        title="bubbleSort([5, 3, 8, 1, 4]) — one row per pass"
        cols={["Pass", "Swaps made", "Array after", "Fixed at the end"]}
        rows={[
          ["0", "5↔3, 8↔1, 8↔4", "[3, 5, 1, 4, 8]", "8"],
          ["1", "5↔1, 5↔4", "[3, 1, 4, 5, 8]", "5, 8"],
          ["2", "3↔1", "[1, 3, 4, 5, 8]", "4, 5, 8"],
          ["3", "none → stop early", "[1, 3, 4, 5, 8]", "all"],
        ]}
        highlight={3}
      />
      <p>
        Worst case it is O(n²), like selection sort. But the <code>swapped</code> flag gives it an{" "}
        <strong>early exit</strong>: if a whole pass makes no swaps, the array is sorted and we stop. On an
        array that is already sorted that is just one pass — O(n). Bubble sort is stable, because it only
        swaps neighbours that are strictly out of order.
      </p>

      <h2 id="insertion">Insertion sort</h2>
      <p>
        <strong>Idea:</strong> this is how most people sort playing cards in their hand. Keep a sorted part on
        the left. Take the next item, and slide it left past every bigger item until it reaches its place.
      </p>

      <h2 id="trace">Traced: insertion sort on [5, 2, 4, 1]</h2>
      <CodeTrace
        code={insertionCode}
        steps={insertionTrace()}
        caption="Each new key is compared with the sorted part from right to left. Bigger items shift one place right; the key drops into the gap."
      />
      <ArrayBoxes
        values={[2, 4, 5, 1]}
        name="arr"
        highlight={[0, 1, 2]}
        marks={{ 3: "key" }}
        caption="Before the last pass: the first three items are sorted. Key 1 will shift 5, 4 and 2 to the right and land at index 0."
      />

      <h2 id="nearly">Why insertion sort loves nearly sorted data</h2>
      <p>
        The while loop stops as soon as it finds an item that is not bigger than the key. If the array is
        already sorted, it stops immediately every time: n − 1 comparisons in total, O(n). If every item is
        only a few places from where it belongs, each key moves only a few places — still close to O(n).
        Only a reversed array forces every key all the way to the front: O(n²).
      </p>
      <Callout kind="note" label="Insertion sort in real life">
        <p className="mb-0">
          Because it is so fast on small or nearly sorted arrays, real sorting functions use insertion sort
          inside them. The algorithm behind JavaScript&apos;s <code>sort</code> in V8 (TimSort) sorts small
          sections with insertion sort and then merges them — the merging is Lesson 17.
        </p>
      </Callout>

      <h2 id="compare">The three side by side</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Selection</th>
              <th>Bubble (early exit)</th>
              <th>Insertion</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Best case (already sorted)</td><td>O(n²)</td><td>O(n)</td><td>O(n)</td></tr>
            <tr><td>Worst case (reversed)</td><td>O(n²)</td><td>O(n²)</td><td>O(n²)</td></tr>
            <tr><td>Extra space</td><td>O(1)</td><td>O(1)</td><td>O(1)</td></tr>
            <tr><td>Stable?</td><td>No</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>Swaps / writes</td><td>At most n − 1 swaps</td><td>Many swaps</td><td>Many shifts</td></tr>
            <tr><td>Best used for</td><td>When writes are expensive</td><td>Teaching only</td><td>Small or nearly sorted arrays</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        All three are O(n²), so none of them can sort 100,000 items in time (Lesson 12). For that you need the
        O(n log n) sorts: merge sort and quick sort.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>
        These questions use the <em>moves</em> of the simple sorts rather than asking you to sort a whole
        array. State the time complexity of each answer.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Describe selection, bubble and insertion sort in one sentence each.</>,
          <>Write insertion sort from memory and dry-run it on [3, 1, 2].</>,
          <>Explain what makes a sort stable, with the students example.</>,
          <>Say which of the three is O(n) on sorted input, and why selection sort is not.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Lesson 17 uses recursion from Lesson 14 to sort much faster: split the array in half, sort each half,
        and merge the two sorted halves. That is <strong>merge sort</strong>, and it is O(n log n) in every case.
      </p>
    </DsaLessonPage>
  );
}
