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
      t.step(6, "update", `arr[${j + 1}] = ${arr[j]}`, "Shift right. For a moment the value appears twice. This is fine, because the key is safe in its own variable.", { arr: [...arr], i, key, j }, "arr");
      j--;
      t.step(7, "update", `j = ${j}`, "Move one position further left.", { arr: [...arr], i, key, j }, "j");
    }
    t.step(5, "stop", j < 0 ? "j >= 0? no" : `${arr[j]} > ${key}? no`, j < 0 ? "We reached the start, so the key is the smallest so far." : `${arr[j]} is not bigger, so the key belongs right after it.`, { arr: [...arr], i, key, j });
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
        <strong>Sorting</strong> means putting items in order: numbers from smallest to largest, words in
        alphabet order, or people by age. It is one of the most useful things you can do to data. Once an
        array is sorted, equal values sit next to each other, and the smallest and largest values are at
        the two ends. You can also search a sorted array by halving it again and again (Lesson 28).
      </p>
      <p>
        In JavaScript you will almost always sort with <code>arr.sort((a, b) =&gt; a - b)</code>. (Lesson 18
        explains why the comparison function <code>(a, b) =&gt; a - b</code> is needed.) So why learn to
        sort by hand? The three simple sorts in this lesson teach three core moves: find the smallest item,
        swap neighbours, and insert an item into a sorted part. These moves appear inside many interview
        problems. They also make the O(n log n) sorts in the next two lessons easier to understand.
        (O(n²) means the work grows with n × n. O(n log n) is much smaller, so it is much faster.)
      </p>

      <h2 id="stability">Stability: keeping ties in order</h2>
      <p>
        When two items compare as equal, a <strong>stable</strong> sort keeps them in the order that they
        had before sorting. This matters when you sort records (objects with several fields) by one
        field:
      </p>
      <CodeBlock lang="js" code={stableCode} />
      <p>
        Asha came before Chen and both have a B, so a stable sort keeps Asha first. JavaScript&apos;s{" "}
        <code>sort</code> has been guaranteed stable since 2019 (ES2019). There is one more property to
        know. An <strong>in-place</strong> sort rearranges the array itself and uses only O(1) extra
        memory (a fixed small amount that does not grow with n).
      </p>

      <h2 id="selection">Selection sort</h2>
      <p>
        <strong>Selection sort</strong> is a sorting algorithm that repeatedly selects the smallest
        remaining item and puts it in its place. <strong>Idea:</strong> find the smallest item and put it
        first. Then find the smallest of the rest and put it second. Repeat until the array is sorted. (To
        swap two items means to exchange their positions.)
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
        The inner loop always scans the whole unsorted part. That is (n − 1) + (n − 2) + … + 1 ≈ n²/2
        comparisons, even if the array is already sorted. So selection sort is <strong>O(n²)</strong> in
        every case. Its one advantage is that it makes at most n − 1 swaps. It is not stable. A swap over a
        long distance can move an item past an equal item.
      </p>

      <h2 id="bubble">Bubble sort and the early exit</h2>
      <p>
        <strong>Bubble sort</strong> is a sorting algorithm that repeatedly compares neighbours and swaps
        them when they are in the wrong order. <strong>Idea:</strong> walk through the array, compare each
        pair of neighbours, and swap any pair that is in the wrong order. After one full pass (one walk
        through the array), the largest value has &ldquo;bubbled&rdquo; to the end, like an air bubble
        rising in water. Repeat on the rest.
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
        In the worst case it is O(n²), like selection sort. But the <code>swapped</code> flag gives it an{" "}
        <strong>early exit</strong>. If a whole pass makes no swaps, the array is already sorted, so we
        stop. On an array that is already sorted, that is just one pass, so it takes O(n). Bubble sort is
        stable, because it swaps only neighbours that are strictly out of order (equal neighbours stay
        where they are).
      </p>

      <h2 id="insertion">Insertion sort</h2>
      <p>
        <strong>Insertion sort</strong> is a sorting algorithm that builds a sorted part one item at a time,
        by inserting each new item into its correct place. <strong>Idea:</strong> this is how most people
        sort playing cards in their hand. Keep a sorted part on the left. Take the next item (called the{" "}
        <em>key</em>) and slide it left past every bigger item until it reaches its place.
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
        already sorted, it stops at once every time. That is n − 1 comparisons in total, so O(n). If every
        item is only a few places from where it belongs, each key moves only a few places, so the total is
        still close to O(n). Only a reversed array forces every key all the way to the front, and that
        costs O(n²).
      </p>
      <Callout kind="note" label="Insertion sort in real life">
        <p className="mb-0">
          Insertion sort is very fast on small or nearly sorted arrays, so real sorting functions use it
          inside. V8 is the JavaScript engine in Chrome and Node.js. Its <code>sort</code> uses an algorithm
          called TimSort. TimSort sorts small sections with insertion sort and then merges them. The
          merging step is Lesson 17.
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
        In the worst case all three are O(n²). So none of them can sort 100,000 items in time (Lesson 12).
        For that you need the O(n log n) sorts: merge sort and quick sort.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>
        These questions use the <em>moves</em> of the simple sorts. They do not ask you to sort a whole
        array. Say the time complexity of each answer.
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
        Lesson 17 uses recursion from Lesson 14 to sort much faster. Split the array in half, sort each
        half, and merge the two sorted halves into one. This is <strong>merge sort</strong>, and it is
        O(n log n) in every case.
      </p>
    </DsaLessonPage>
  );
}
