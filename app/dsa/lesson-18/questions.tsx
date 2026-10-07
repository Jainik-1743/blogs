import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 18 practice questions: partitioning, quickselect and comparators. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Kth largest element"
        level="Medium"
        examples={[
          { input: "nums = [3, 2, 1, 5, 6, 4], k = 2", output: "5", why: "Sorted descending: 6, 5, 4 … — the 2nd is 5." },
          { input: "nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4", output: "4", why: "6, 5, 5, 4 — duplicates count separately." },
        ]}
        hints={[
          <>Sorting works in O(n log n). Can you avoid sorting everything?</>,
          <>The k-th largest is at index <code>n - k</code> of the ascending sorted array. Use quickselect to find that index.</>,
        ]}
        approaches={[
          {
            name: "Sort",
            idea: <p>Sort descending and take index k − 1.</p>,
            code: `function findKthLargest(nums, k) {
  return [...nums].sort((a, b) => b - a)[k - 1];
}

console.log(findKthLargest([3, 2, 1, 5, 6, 4], 2));          // 5
console.log(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)); // 4`,
            explain: <p>O(n log n). A perfectly good first answer.</p>,
          },
          {
            name: "Quickselect",
            idea: <p>Partition with a random pivot until the pivot lands on index n − k.</p>,
            code: `function findKthLargest(nums, k) {
  const a = [...nums];
  const target = a.length - k;
  let lo = 0, hi = a.length - 1;
  while (true) {
    const r = lo + Math.floor(Math.random() * (hi - lo + 1));
    [a[r], a[hi]] = [a[hi], a[r]];
    const pivot = a[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; i++; }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    if (i === target) return a[i];
    if (i < target) lo = i + 1;
    else hi = i - 1;
  }
}

console.log(findKthLargest([3, 2, 1, 5, 6, 4], 2));          // 5
console.log(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)); // 4`,
            explain: <p>O(n) on average, O(n²) in a very unlikely worst case. O(1) extra space apart from the copy.</p>,
          },
        ]}
        compare={<p>Give the sort first, then quickselect as the improvement. Lesson 46 adds a third answer with a heap, O(n log k), which is also good for data that arrives one item at a time. (LeetCode 215.)</p>}
      >
        <p>Return the k-th largest value in <code>nums</code> (not the k-th distinct value).</p>
      </Problem>

      <Problem
        n={2}
        title="Sort colors (0s, 1s and 2s)"
        level="Medium"
        examples={[
          { input: "[2, 0, 2, 1, 1, 0]", output: "[0, 0, 1, 1, 2, 2]", why: "All 0s, then 1s, then 2s." },
          { input: "[2, 0, 1]", output: "[0, 1, 2]", why: "Small case." },
        ]}
        hints={[
          <>Only three possible values: counting sort works in two passes.</>,
          <>For one pass: partition into three regions at once — 0s at the front, 2s at the back, 1s in the middle.</>,
        ]}
        approaches={[
          {
            name: "Count, then rewrite",
            idea: <p>Count the 0s, 1s and 2s, then overwrite the array.</p>,
            code: `function sortColors(nums) {
  const count = [0, 0, 0];
  for (const x of nums) count[x]++;
  let i = 0;
  for (let v = 0; v < 3; v++) {
    for (let c = 0; c < count[v]; c++) nums[i++] = v;
  }
  return nums;
}

console.log(sortColors([2, 0, 2, 1, 1, 0])); // [ 0, 0, 1, 1, 2, 2 ]`,
            explain: <p>O(n) time, O(1) space, two passes.</p>,
          },
          {
            name: "Three-way partition (one pass)",
            idea: (
              <ol>
                <li><code>low</code>: next place for a 0. <code>high</code>: next place for a 2. <code>mid</code> scans.</li>
                <li>0 → swap to <code>low</code>, move both. 1 → just move <code>mid</code>. 2 → swap to <code>high</code>, move <code>high</code> only (the swapped-in value is not checked yet).</li>
              </ol>
            ),
            code: `function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++; mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    }
  }
  return nums;
}

console.log(sortColors([2, 0, 2, 1, 1, 0])); // [ 0, 0, 1, 1, 2, 2 ]
console.log(sortColors([2, 0, 1]));          // [ 0, 1, 2 ]`,
            explain: <p>One pass, O(1) space. This is partitioning with two boundaries instead of one, known as the Dutch national flag algorithm. Lesson 21 traces it step by step.</p>,
          },
        ]}
        compare={<p>Counting is easiest. The one-pass partition is the follow-up interviewers ask for. (LeetCode 75.)</p>}
      >
        <p>Sort an array containing only 0, 1 and 2 in place, without the built-in sort.</p>
      </Problem>

      <Problem
        n={3}
        title="Sort by increasing frequency"
        level="Easy"
        examples={[
          { input: "[1, 1, 2, 2, 2, 3]", output: "[3, 1, 1, 2, 2, 2]", why: "3 appears once, 1 twice, 2 three times." },
          { input: "[2, 3, 1, 3, 2]", output: "[1, 3, 3, 2, 2]", why: "1 once; 2 and 3 twice each — on a tie, larger value first." },
        ]}
        hints={[<>Count with a Map first.</>, <>Comparator with two keys: frequency ascending, then value descending.</>]}
        approaches={[
          {
            name: "Frequency map + two-key comparator",
            idea: <p>Sort by count; on equal counts, by value descending.</p>,
            code: `function frequencySort(nums) {
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);
  return nums.sort((a, b) => freq.get(a) - freq.get(b) || b - a);
}

console.log(frequencySort([1, 1, 2, 2, 2, 3])); // [ 3, 1, 1, 2, 2, 2 ]
console.log(frequencySort([2, 3, 1, 3, 2]));    // [ 1, 3, 3, 2, 2 ]`,
            explain: <p>O(n log n). The comparator reads the counts from the Map — sorting by a computed key is a very common pattern.</p>,
          },
        ]}
        compare={<p>The <code>||</code> trick turns two rules into one comparator. (LeetCode 1636.)</p>}
      >
        <p>Sort <code>nums</code> by how often each value appears, least frequent first. If two values appear equally often, put the larger value first.</p>
      </Problem>

      <Problem
        n={4}
        title="Sort the people by height"
        level="Easy"
        examples={[{ input: `names = ["Mary", "John", "Emma"], heights = [180, 165, 170]`, output: `["Mary", "Emma", "John"]`, why: "Tallest first: 180, 170, 165." }]}
        hints={[<>Sorting <code>names</code> alone loses the link to the heights. Sort indices, or pairs.</>]}
        approaches={[
          {
            name: "Sort indices by height",
            idea: <p>Make the list of indices [0, 1, 2 …], sort it by the height at each index, then map to names.</p>,
            code: `function sortPeople(names, heights) {
  return names
    .map((_, i) => i)
    .sort((a, b) => heights[b] - heights[a])
    .map((i) => names[i]);
}

console.log(sortPeople(["Mary", "John", "Emma"], [180, 165, 170])); // [ 'Mary', 'Emma', 'John' ]`,
            explain: <p>O(n log n). Sorting <em>indices</em> keeps parallel arrays together without building objects. The same trick appears in interval and scheduling problems.</p>,
          },
          {
            name: "Sort pairs",
            idea: <p>Zip names and heights into pairs, sort the pairs, take the names.</p>,
            code: `function sortPeople(names, heights) {
  return names
    .map((name, i) => [heights[i], name])
    .sort((a, b) => b[0] - a[0])
    .map(([, name]) => name);
}

console.log(sortPeople(["Mary", "John", "Emma"], [180, 165, 170])); // [ 'Mary', 'Emma', 'John' ]`,
            explain: <p>Same cost, often easier to read.</p>,
          },
        ]}
        compare={<p>Both are fine. (LeetCode 2418.)</p>}
      >
        <p>Given <code>names</code> and their <code>heights</code> (all different), return the names sorted by height, tallest first.</p>
      </Problem>

      <Problem
        n={5}
        title="Largest number"
        level="Medium"
        examples={[
          { input: "[10, 2]", output: `"210"`, why: "\"2\" + \"10\" = \"210\" is larger than \"102\"." },
          { input: "[3, 30, 34, 5, 9]", output: `"9534330"`, why: "Not simply largest first: 3 must come before 30, because \"330\" > \"303\"." },
          { input: "[0, 0]", output: `"0"`, why: "Edge case: not \"00\"." },
        ]}
        hints={[
          <>Numeric order does not work, and plain text order does not either (3 vs 30).</>,
          <>For two numbers a and b, which order makes the bigger string: a + b or b + a? Use exactly that as the comparator.</>,
        ]}
        approaches={[
          {
            name: "Custom comparator on joined strings",
            idea: <p>Put a before b when the string a + b is larger than b + a.</p>,
            code: `function largestNumber(nums) {
  const s = nums
    .map(String)
    .sort((a, b) => (b + a).localeCompare(a + b))
    .join("");
  return s[0] === "0" ? "0" : s;
}

console.log(largestNumber([10, 2]));           // 210
console.log(largestNumber([3, 30, 34, 5, 9])); // 9534330
console.log(largestNumber([0, 0]));            // 0`,
            explain: (
              <DryRun
                title="comparing pairs"
                cols={["a", "b", "a + b", "b + a", "First"]}
                rows={[
                  ["3", "30", "330", "303", "3"],
                  ["9", "5", "95", "59", "9"],
                  ["34", "3", "343", "334", "34"],
                ]}
                note="b + a and a + b have the same length, so comparing them as text compares them as numbers."
              />
            ),
          },
        ]}
        compare={<p>The whole problem is choosing the comparator. O(n log n) comparisons, each O(length of the numbers). (LeetCode 179.)</p>}
      >
        <p>Arrange the non-negative integers so that, written one after another, they form the largest possible number. Return it as a string.</p>
      </Problem>

      <Problem
        n={6}
        title="Partition around a pivot, keeping order"
        level="Medium"
        examples={[
          { input: "nums = [9, 12, 5, 10, 14, 3, 10], pivot = 10", output: "[9, 5, 3, 10, 10, 12, 14]", why: "Smaller values, then values equal to 10, then larger values — each group in its original order." },
        ]}
        hints={[<>Quick sort&apos;s in-place partition does not keep the original order. Is extra space allowed here?</>, <>Three lists: less, equal, greater.</>]}
        approaches={[
          {
            name: "Three lists",
            idea: <p>One pass, appending each value to the list for its group, then join them.</p>,
            code: `function pivotArray(nums, pivot) {
  const less = [], equal = [], greater = [];
  for (const x of nums) {
    if (x < pivot) less.push(x);
    else if (x === pivot) equal.push(x);
    else greater.push(x);
  }
  return [...less, ...equal, ...greater];
}

console.log(pivotArray([9, 12, 5, 10, 14, 3, 10], 10)); // [ 9, 5, 3, 10, 10, 12, 14 ]`,
            explain: <p>O(n) time and O(n) space. It is a <em>stable</em> partition — the price is extra memory. This is the trade-off between merge-style and quick-style algorithms in miniature.</p>,
          },
        ]}
        compare={<p>If the problem had said &ldquo;in place, order does not matter&rdquo;, the Lomuto partition from the lesson would be the answer. Read which one is asked. (LeetCode 2161.)</p>}
      >
        <p>Rearrange <code>nums</code> so that values less than <code>pivot</code> come first, then values equal to it, then larger values. Keep the original order inside each group.</p>
      </Problem>

      <Problem
        n={7}
        title="Quick sort an array"
        level="Medium"
        examples={[{ input: "[5, 2, 3, 1]", output: "[1, 2, 3, 5]", why: "Up to 5 × 10⁴ values, possibly already sorted or all equal." }]}
        hints={[
          <>Use a random pivot so sorted input does not cause O(n²).</>,
          <>Many equal values also make the Lomuto partition unbalanced. A three-way partition (less / equal / greater) fixes that.</>,
        ]}
        approaches={[
          {
            name: "Quick sort, random pivot, three-way partition",
            idea: <p>Partition into &lt; pivot, = pivot, &gt; pivot (like Sort Colors), then recurse only on the outer two parts.</p>,
            code: `function sortArray(nums) {
  function sort(lo, hi) {
    if (lo >= hi) return;
    const pivot = nums[lo + Math.floor(Math.random() * (hi - lo + 1))];
    let lt = lo, i = lo, gt = hi;
    while (i <= gt) {
      if (nums[i] < pivot) { [nums[lt], nums[i]] = [nums[i], nums[lt]]; lt++; i++; }
      else if (nums[i] > pivot) { [nums[i], nums[gt]] = [nums[gt], nums[i]]; gt--; }
      else i++;
    }
    sort(lo, lt - 1);       // values < pivot
    sort(gt + 1, hi);       // values > pivot
  }
  sort(0, nums.length - 1);
  return nums;
}

console.log(sortArray([5, 2, 3, 1]));             // [ 1, 2, 3, 5 ]
console.log(sortArray([5, 1, 1, 2, 0, 0]));       // [ 0, 0, 1, 1, 2, 5 ]
console.log(sortArray(new Array(8).fill(7)));     // [ 7, 7, 7, 7, 7, 7, 7, 7 ]`,
            explain: <p>Expected O(n log n). With all values equal, the first partition puts everything in the &ldquo;equal&rdquo; part and both recursive calls are empty — O(n) instead of the O(n²) a two-way partition would take.</p>,
          },
        ]}
        compare={<p>Random pivot handles sorted input; three-way partitioning handles duplicates. Together they make quick sort robust. (LeetCode 912.)</p>}
      >
        <p>Sort <code>nums</code> with quick sort, so that it stays fast on sorted input and on input with many equal values.</p>
      </Problem>
    </>
  );
}
