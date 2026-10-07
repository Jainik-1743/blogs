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

const lesson = getDsaLesson("lesson-18");

export const metadata: Metadata = {
  title: `Lesson 18 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Do the work while splitting" },
  { id: "partition", label: "Partitioning around a pivot" },
  { id: "trace", label: "Traced: partition([7, 2, 9, 4, 5])" },
  { id: "quicksort", label: "Quick sort" },
  { id: "worst", label: "The worst case, and how to avoid it" },
  { id: "quickselect", label: "Quickselect: the k-th element without sorting" },
  { id: "js-sort", label: "JavaScript's .sort(): the text-order trap" },
  { id: "comparators", label: "Comparators: numbers, text and objects" },
  { id: "which", label: "Which sort to use" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "Part 3 complete — what's next" },
];

const partitionCode = `function partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  return i;
}
const arr = [7, 2, 9, 4, 5];
console.log(partition(arr, 0, 4), arr);`;

function partitionTrace() {
  const t = tracer();
  const arr = [7, 2, 9, 4, 5];
  const lo = 0, hi = 4;
  const pivot = arr[hi];
  t.step(2, "start", "pivot = arr[4] = 5", "Choose the last item as the pivot. The goal is to get the smaller items on its left and the rest on its right.", { arr: [...arr], pivot }, "pivot");
  let i = lo;
  t.step(3, "start", "i = 0", "i marks the place where the next item that is smaller than the pivot should go. Everything before i is smaller than the pivot.", { arr: [...arr], pivot, i }, "i");
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      t.step(5, "check", `arr[${j}] = ${arr[j]} < 5? yes`, `${arr[j]} belongs on the small side.`, { arr: [...arr], pivot, i, j });
      [arr[i], arr[j]] = [arr[j], arr[i]];
      t.step(6, "update", `swap arr[${i}] and arr[${j}]`, i === j ? "It swaps with itself, so nothing moves." : `Move ${arr[i]} into the small region.`, { arr: [...arr], pivot, i, j }, "arr");
      i++;
      t.step(7, "update", `i = ${i}`, "The small region grows by one.", { arr: [...arr], pivot, i, j }, "i");
    } else {
      t.step(5, "check", `arr[${j}] = ${arr[j]} < 5? no`, `${arr[j]} stays where it is, on the big side.`, { arr: [...arr], pivot, i, j });
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  t.step(10, "update", `swap arr[${i}] and arr[${hi}]`, `Put the pivot right after the small region. Index ${i} is now its final sorted position.`, { arr: [...arr], pivot, i }, "arr");
  t.print("2 [ 2, 4, 5, 7, 9 ]");
  t.step(14, "print", "console.log(2, arr)", "Left of index 2 are 2 and 4 (smaller). On the right are 7 and 9 (larger). Next, each side is sorted separately.", { arr: [...arr] });
  return t.steps;
}

const quickCode = `function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr;              // 0 or 1 items: already sorted
  const p = partition(arr, lo, hi);      // pivot is now at index p, in its final place
  quickSort(arr, lo, p - 1);             // sort the smaller side
  quickSort(arr, p + 1, hi);             // sort the larger side
  return arr;
}

function partition(arr, lo, hi) {
  const r = lo + Math.floor(Math.random() * (hi - lo + 1));   // random pivot
  [arr[r], arr[hi]] = [arr[hi], arr[r]];
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  return i;
}

console.log(quickSort([7, 2, 9, 4, 5, 1, 8])); // [ 1, 2, 4, 5, 7, 8, 9 ]`;

const selectCode = `function kthSmallest(arr, k) {          // k = 1 means the smallest
  let lo = 0, hi = arr.length - 1;
  const target = k - 1;                    // its index in sorted order
  while (true) {
    const p = partition(arr, lo, hi);
    if (p === target) return arr[p];
    if (p < target) lo = p + 1;           // answer is on the right side
    else hi = p - 1;                       // answer is on the left side
  }
}

function partition(arr, lo, hi) {
  const r = lo + Math.floor(Math.random() * (hi - lo + 1));
  [arr[r], arr[hi]] = [arr[hi], arr[r]];
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  return i;
}

console.log(kthSmallest([7, 2, 9, 4, 5], 2)); // 4`;

const trapCode = `console.log([10, 9, 1, 100].sort());                 // [ 1, 10, 100, 9 ]   ← text order!
console.log([10, 9, 1, 100].sort((a, b) => a - b));  // [ 1, 9, 10, 100 ]
console.log([10, 9, 1, 100].sort((a, b) => b - a));  // [ 100, 10, 9, 1 ]`;

const cmpCode = `const people = [
  { name: "Ravi", age: 30 },
  { name: "Lena", age: 25 },
  { name: "Omar", age: 30 },
];

// By one key
people.sort((a, b) => a.age - b.age);

// By text
people.sort((a, b) => a.name.localeCompare(b.name));

// By two keys: age descending, then name ascending for ties
people.sort((a, b) => b.age - a.age || a.name.localeCompare(b.name));
console.log(people.map((p) => p.name)); // [ 'Omar', 'Ravi', 'Lena' ]

// sort() changes the array itself. toSorted() returns a sorted copy instead
// (toSorted needs Node.js 20 or newer):
const nums = [3, 1, 2];
const sorted = nums.toSorted((a, b) => a - b);
console.log(nums, sorted);               // [ 3, 1, 2 ] [ 1, 2, 3 ]`;

export default function DsaLessonEighteenPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Do the work while splitting</h2>
      <p>
        Merge sort splits the array without looking at the values, and it does all its work when merging.
        <strong>Quick sort</strong> is a sorting algorithm that does the opposite. It picks one value, called
        the <strong>pivot</strong>. Then it rearranges the array so that everything smaller than the pivot is on
        its left and everything else is on its right. Now the pivot is exactly where it belongs in the sorted
        result. The two sides can then be sorted separately, and no merging is needed afterwards.
      </p>

      <h2 id="partition">Partitioning around a pivot</h2>
      <p>
        This rearranging step is called <strong>partitioning</strong>. Partitioning splits an array into a
        small side and a big side around the pivot. It is done in place (inside the same array), in one pass.
        Keep a boundary <code>i</code>. Everything before it is smaller than the pivot. Walk through the array.
        Each time you find a smaller item, swap it to position <code>i</code> and move the boundary one place
        right. At the end, swap the pivot itself into position <code>i</code>.
      </p>

      <h2 id="trace">Traced: partition([7, 2, 9, 4, 5])</h2>
      <CodeTrace
        code={partitionCode}
        steps={partitionTrace()}
        caption="One pass over the array. Items smaller than the pivot are swapped to the front; the pivot is then dropped in just after them."
      />
      <p>
        Partitioning is O(n) time and O(1) space. It is also useful on its own. A three-way version sorts an
        array of 0s, 1s and 2s in one pass (Lesson 21).
      </p>

      <h2 id="quicksort">Quick sort</h2>
      <p>
        Partition the array. Then quick sort the left side and the right side, using recursion. The pivot never
        moves again.
      </p>
      <CodeBlock lang="js" code={quickCode} />
      <p>
        If each pivot lands near the middle, the array halves at every level, like merge sort. That gives log n
        levels with O(n) partitioning work on each, so the time is <strong>O(n log n)</strong>. Unlike merge
        sort, quick sort needs no extra array. It needs only the recursion stack (Lesson 14), which is O(log n)
        on average. It is not stable, because swaps over a long distance can change the order of equal
        items.
      </p>

      <h2 id="worst">The worst case, and how to avoid it</h2>
      <p>
        Suppose the array is already sorted and the pivot is always the last item. Then the pivot is the
        largest value every time. One side gets n − 1 items, and the other side gets none.
      </p>
      <DryRun
        title="last-item pivot on the sorted array [1, 2, 3, 4, 5]"
        cols={["Call sorts", "Pivot", "Left side", "Right side"]}
        rows={[
          ["[1, 2, 3, 4, 5]", "5", "[1, 2, 3, 4]", "[]"],
          ["[1, 2, 3, 4]", "4", "[1, 2, 3]", "[]"],
          ["[1, 2, 3]", "3", "[1, 2]", "[]"],
          ["[1, 2]", "2", "[1]", "[]"],
        ]}
        note="n levels instead of log n, each still O(n): O(n²) time and O(n) recursion depth."
      />
      <p>
        The fix is simple: choose the pivot at <strong>random</strong>, as in the code above. Then no
        particular input can force bad pivots every time. The expected time (the average over the random
        choices) is O(n log n) for every input. Many libraries instead use the median (the middle value) of
        the first, middle and last items.
      </p>
      <Callout kind="note" label="Merge sort or quick sort?">
        <p className="mb-0">
          Merge sort: O(n log n) guaranteed, stable, but it needs O(n) extra space. Quick sort: O(n log n)
          expected, in place and usually faster in practice, but not stable, and O(n²) in the rare worst
          case. In interviews, you will be asked to explain these trade-offs more often than to write either
          sort.
        </p>
      </Callout>

      <h2 id="quickselect">Quickselect: the k-th element without sorting</h2>
      <p>
        <strong>Quickselect</strong> is an algorithm that finds the k-th smallest value without sorting the whole
        array. After one partition, the pivot is at its final index <code>p</code>. If <code>p</code> is the
        index you want, you are done. If not, the answer is on <em>one</em> side only. So continue with that
        side and ignore the other. (The code below uses a loop instead of recursion.)
      </p>
      <CodeBlock lang="js" code={selectCode} />
      <p>
        On average, each step keeps about half of the remaining items. The total work is n + n/2 + n/4 + … ≈ 2n.
        So quickselect is <strong>O(n) on average</strong>, compared with O(n log n) for sorting first. (In
        the rare worst case it is O(n²), like quick sort.) It is the classic answer to &ldquo;k-th largest
        element&rdquo;, because the k-th largest is the (n − k + 1)-th smallest.
      </p>

      <h2 id="js-sort">JavaScript&apos;s .sort(): the text-order trap</h2>
      <p>
        If you call <code>sort</code> with no arguments, it converts every item to a <strong>string</strong>
        (text) and sorts in alphabet order. For numbers this is almost never what you want:
      </p>
      <CodeBlock lang="js" code={trapCode} />
      <p>
        As text, &ldquo;100&rdquo; comes before &ldquo;9&rdquo;, because the first character &ldquo;1&rdquo;
        comes before &ldquo;9&rdquo;. <strong>Always pass a comparator when you sort numbers.</strong> This bug
        passes small tests (single digits sort correctly as text) and fails on larger values. It is one of the
        most common JavaScript interview mistakes.
      </p>

      <h2 id="comparators">Comparators: numbers, text and objects</h2>
      <p>
        A <strong>comparator</strong> is a function that you give to <code>sort</code> to tell it how to
        order two items, a and b. It returns a <strong>negative</strong> number if a should come first, a{" "}
        <strong>positive</strong> number if b should come first, and <strong>0</strong> if they are equal for
        sorting. <code>a - b</code> does exactly that for numbers in ascending order (smallest first).
      </p>
      <CodeBlock lang="js" code={cmpCode} />
      <ul>
        <li><strong>Two keys:</strong> <code>first || second</code> works because a 0 from the first comparison (a tie) is treated as &ldquo;false&rdquo;, so JavaScript uses the second comparison instead.</li>
        <li><strong>Never return a boolean</strong> such as <code>a &gt; b</code>. It gives only true or false (which become 1 or 0). It never gives a negative number, so the order can be wrong.</li>
        <li><strong>Cost:</strong> <code>sort</code> is O(n log n) and stable. Count it in your Big-O.</li>
      </ul>

      <h2 id="which">Which sort to use</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Situation</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Normal interview code</td><td><code>arr.sort((a, b) =&gt; a - b)</code> — O(n log n)</td></tr>
            <tr><td>Values in a small fixed range (letters, 0–100)</td><td>Counting sort — O(n + range)</td></tr>
            <tr><td>Only the k-th value, or the k smallest</td><td>Quickselect — O(n) average (or a heap, Lesson 46)</td></tr>
            <tr><td>&ldquo;Do not use the built-in sort&rdquo;</td><td>Merge sort (guaranteed) or quick sort with a random pivot</td></tr>
            <tr><td>Linked list</td><td>Merge sort (Lesson 37)</td></tr>
            <tr><td>Nearly sorted, or very small</td><td>Insertion sort</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="practice">Practice questions</h2>
      <p>Several of these are about writing the right comparator. You will use this skill in almost every later part.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write <code>partition</code> from memory and dry-run it on [3, 8, 1, 5].</>,
          <>Explain why quick sort is O(n²) on sorted input with a last-item pivot, and how a random pivot fixes it.</>,
          <>Say why quickselect is O(n) on average while sorting is O(n log n).</>,
          <>Predict the output of <code>[5, 25, 100].sort()</code>, and fix it.</>,
          <>Write a comparator for &ldquo;by score descending, then name ascending&rdquo;.</>,
        ]}
      />

      <h2 id="next">Part 3 complete — what&apos;s next</h2>
      <p>
        You now know what sorting does, how the O(n log n) sorts work, and how to sort anything correctly in
        JavaScript. Sorting will often appear as the first step of later solutions.
      </p>
      <p>
        <strong>Part 4 — Arrays and the First Patterns</strong> begins with the array problems that open almost
        every coding round. These are: finding the largest and second largest values, removing duplicates in
        place, rotating an array, and finding missing numbers.
      </p>
    </DsaLessonPage>
  );
}
