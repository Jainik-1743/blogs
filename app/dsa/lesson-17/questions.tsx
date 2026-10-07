import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 17 practice questions: the merge step and divide and conquer. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Merge sorted array (in place)"
        level="Easy"
        examples={[
          { input: "nums1 = [1, 2, 3, 0, 0, 0], m = 3, nums2 = [2, 5, 6], n = 3", output: "[1, 2, 2, 3, 5, 6]", why: "The last n slots of nums1 are empty space (zeros) for the merge." },
          { input: "nums1 = [0], m = 0, nums2 = [1], n = 1", output: "[1]", why: "Edge case: nums1 has no real values." },
        ]}
        hints={[
          <>Merging from the front would overwrite values of nums1 you still need.</>,
          <>The empty space is at the <em>end</em>. Merge from the back: place the largest remaining value at the last free position.</>,
        ]}
        approaches={[
          {
            name: "Merge into a new array, copy back",
            idea: <p>The normal merge into a temporary array, then copy it into nums1.</p>,
            code: `function merge(nums1, m, nums2, n) {
  const out = [];
  let i = 0, j = 0;
  while (i < m && j < n) out.push(nums1[i] <= nums2[j] ? nums1[i++] : nums2[j++]);
  while (i < m) out.push(nums1[i++]);
  while (j < n) out.push(nums2[j++]);
  for (let k = 0; k < m + n; k++) nums1[k] = out[k];
}

const a = [1, 2, 3, 0, 0, 0];
merge(a, 3, [2, 5, 6], 3);
console.log(a); // [ 1, 2, 2, 3, 5, 6 ]`,
            explain: <p>O(m + n) time, O(m + n) extra space.</p>,
          },
          {
            name: "Merge from the back",
            idea: <p>Three positions: the last real value of nums1 (<code>i</code>), the last of nums2 (<code>j</code>), and the last slot to fill (<code>k</code>). Place the larger of the two values at k and move left.</p>,
            code: `function merge(nums1, m, nums2, n) {
  let i = m - 1, j = n - 1, k = m + n - 1;
  while (j >= 0) {                          // until every nums2 value is placed
    if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];
    else nums1[k--] = nums2[j--];
  }
}

const a = [1, 2, 3, 0, 0, 0];
merge(a, 3, [2, 5, 6], 3);
console.log(a); // [ 1, 2, 2, 3, 5, 6 ]

const b = [0];
merge(b, 0, [1], 1);
console.log(b); // [ 1 ]`,
            explain: (
              <DryRun
                title="nums1 = [1, 2, 3, _, _, _], nums2 = [2, 5, 6]"
                cols={["Compare", "Place at k", "nums1 after"]}
                rows={[
                  ["3 vs 6", "6 at 5", "[1, 2, 3, _, _, 6]"],
                  ["3 vs 5", "5 at 4", "[1, 2, 3, _, 5, 6]"],
                  ["3 vs 2", "3 at 3", "[1, 2, 3, 3, 5, 6]"],
                  ["2 vs 2", "2 (nums2) at 2", "[1, 2, 2, 3, 5, 6]"],
                ]}
                note="Once nums2 is used up, the remaining nums1 values are already in place. The writing position k never overtakes i, so nothing is overwritten too early."
              />
            ),
          },
        ]}
        compare={<p>Merging from the back is the expected answer: O(m + n) time and O(1) extra space. &ldquo;Fill from the end when the free space is at the end&rdquo; is a useful trick to remember. (LeetCode 88.)</p>}
      >
        <p>
          <code>nums1</code> has length m + n: its first m values are sorted, the rest are zeros. Merge the sorted{" "}
          <code>nums2</code> (length n) into <code>nums1</code> so that nums1 is sorted.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Squares of a sorted array"
        level="Easy"
        examples={[
          { input: "[-4, -1, 0, 3, 10]", output: "[0, 1, 9, 16, 100]", why: "The squares are 16, 1, 0, 9, 100; sorted gives this." },
          { input: "[-7, -3, 2, 3, 11]", output: "[4, 9, 9, 49, 121]", why: "Negative numbers can have large squares." },
        ]}
        hints={[
          <>Squaring then sorting is O(n log n). Can you use the fact that the input is sorted?</>,
          <>The largest square is at one of the two <em>ends</em>. Fill the result from the back.</>,
        ]}
        approaches={[
          {
            name: "Square, then sort",
            idea: <p>The direct way.</p>,
            code: `function sortedSquares(nums) {
  return nums.map((x) => x * x).sort((a, b) => a - b);
}

console.log(sortedSquares([-4, -1, 0, 3, 10])); // [ 0, 1, 9, 16, 100 ]`,
            explain: <p>O(n log n).</p>,
          },
          {
            name: "Merge from both ends",
            idea: <p>The squares of the negative part decrease from the left; the squares of the positive part increase to the right. That is two sorted sequences — merge them, largest first.</p>,
            code: `function sortedSquares(nums) {
  const out = new Array(nums.length);
  let left = 0, right = nums.length - 1;
  for (let k = nums.length - 1; k >= 0; k--) {
    const a = nums[left] * nums[left];
    const b = nums[right] * nums[right];
    if (a > b) { out[k] = a; left++; }
    else { out[k] = b; right--; }
  }
  return out;
}

console.log(sortedSquares([-4, -1, 0, 3, 10])); // [ 0, 1, 9, 16, 100 ]
console.log(sortedSquares([-7, -3, 2, 3, 11])); // [ 4, 9, 9, 49, 121 ]`,
            explain: <p>O(n): each step places one value. It is the merge step from this lesson, reading two sorted sequences from their large ends.</p>,
          },
        ]}
        compare={<p>Approach 2 is the expected follow-up answer. Recognising &ldquo;two sorted sequences hidden in one array&rdquo; is the key step. (LeetCode 977.)</p>}
      >
        <p>Given an array sorted in non-decreasing order, return the squares of its values, also sorted.</p>
      </Problem>

      <Problem
        n={3}
        title="Sort an array with merge sort"
        level="Medium"
        examples={[{ input: "[5, 1, 1, 2, 0, 0]", output: "[0, 0, 1, 1, 2, 5]", why: "Up to 5 × 10⁴ values: an O(n log n) sort is required." }]}
        hints={[<>Write <code>merge</code>, then <code>mergeSort</code> with a base case of length ≤ 1.</>, <>To avoid creating many small arrays, you can sort index ranges of one array and use one shared buffer.</>]}
        approaches={[
          {
            name: "Merge sort with slices",
            idea: <p>The version from the lesson.</p>,
            code: `function sortArray(nums) {
  if (nums.length <= 1) return nums;
  const mid = Math.floor(nums.length / 2);
  const a = sortArray(nums.slice(0, mid));
  const b = sortArray(nums.slice(mid));
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}

console.log(sortArray([5, 1, 1, 2, 0, 0])); // [ 0, 0, 1, 1, 2, 5 ]`,
            explain: <p>O(n log n) time. Simple, but it creates many short-lived arrays.</p>,
          },
          {
            name: "Merge sort on index ranges",
            idea: <p>Sort <code>nums[lo..hi]</code> in place, using one temporary buffer for every merge.</p>,
            code: `function sortArray(nums) {
  const buf = new Array(nums.length);

  function sort(lo, hi) {                   // sorts nums[lo..hi]
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    sort(lo, mid);
    sort(mid + 1, hi);
    let i = lo, j = mid + 1, k = lo;
    while (i <= mid && j <= hi) buf[k++] = nums[i] <= nums[j] ? nums[i++] : nums[j++];
    while (i <= mid) buf[k++] = nums[i++];
    while (j <= hi) buf[k++] = nums[j++];
    for (let t = lo; t <= hi; t++) nums[t] = buf[t];
  }

  sort(0, nums.length - 1);
  return nums;
}

console.log(sortArray([5, 1, 1, 2, 0, 0]));       // [ 0, 0, 1, 1, 2, 5 ]
console.log(sortArray([38, 27, 43, 3, 9, 82, 10])); // [ 3, 9, 10, 27, 38, 43, 82 ]`,
            explain: <p>Same O(n log n) time and O(n) space, but only one extra array is ever created. Working on index ranges (lo, hi) instead of copies is the style quick sort uses too.</p>,
          },
        ]}
        compare={<p>Either passes. Version 2 is closer to what a library does and avoids <code>slice</code> costs. (LeetCode 912.)</p>}
      >
        <p>Sort <code>nums</code> in ascending order without using the built-in sort, in O(n log n) time.</p>
      </Problem>

      <Problem
        n={4}
        title="Intersection of two sorted arrays"
        level="Easy"
        examples={[
          { input: "[1, 2, 2, 3, 5], [2, 2, 4, 5]", output: "[2, 2, 5]", why: "Keep each common value as many times as it appears in both." },
          { input: "[1, 3], [2, 4]", output: "[]", why: "No common values." },
        ]}
        hints={[<>Both arrays are sorted. Walk them together like a merge.</>, <>If the values are equal, record it and move both; otherwise move the smaller one.</>]}
        approaches={[
          {
            name: "Merge-style walk",
            idea: <p>Two fingers. Equal → take it and advance both; otherwise advance the finger on the smaller value, which cannot match anything later.</p>,
            code: `function intersectSorted(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { out.push(a[i]); i++; j++; }
    else if (a[i] < b[j]) i++;
    else j++;
  }
  return out;
}

console.log(intersectSorted([1, 2, 2, 3, 5], [2, 2, 4, 5])); // [ 2, 2, 5 ]
console.log(intersectSorted([1, 3], [2, 4]));                // []`,
            explain: <p>O(n + m) time, O(1) extra space apart from the output — no Set needed because the inputs are sorted.</p>,
          },
        ]}
        compare={<p>Compare with Lesson 12, where unsorted input needed a Set. Sorted input often removes the need for extra memory. (Related: LeetCode 350.)</p>}
      >
        <p>Given two sorted arrays, return their common values (with repeats), in sorted order.</p>
      </Problem>

      <Problem
        n={5}
        title="Count inversions fast"
        level="Hard"
        examples={[
          { input: "[2, 4, 1, 3, 5]", output: "3", why: "(2, 1), (4, 1), (4, 3)." },
          { input: "[5, 4, 3, 2, 1]", output: "10", why: "Every pair is inverted: 5 × 4 / 2 = 10." },
        ]}
        hints={[
          <>The O(n²) pair count is too slow for 10<sup>5</sup> values.</>,
          <>During a merge, when you take from the right half, how many left-half items are bigger than it?</>,
        ]}
        approaches={[
          {
            name: "Merge sort that counts",
            idea: <p>The merge step adds <code>left.length - i</code> every time a right-half item is placed before the remaining left-half items.</p>,
            code: `function countInversions(nums) {
  let count = 0;
  function sort(a) {
    if (a.length <= 1) return a;
    const mid = Math.floor(a.length / 2);
    const l = sort(a.slice(0, mid)), r = sort(a.slice(mid));
    const out = [];
    let i = 0, j = 0;
    while (i < l.length && j < r.length) {
      if (l[i] <= r[j]) out.push(l[i++]);
      else { count += l.length - i; out.push(r[j++]); }
    }
    return out.concat(l.slice(i), r.slice(j));
  }
  sort(nums);
  return count;
}

console.log(countInversions([2, 4, 1, 3, 5])); // 3
console.log(countInversions([5, 4, 3, 2, 1])); // 10`,
            explain: (
              <DryRun
                title="the final merge of [2, 4] and [1, 3, 5]"
                cols={["Take", "From", "Inversions added"]}
                rows={[
                  ["1", "right", "2 (both 2 and 4 are bigger)"],
                  ["2", "left", "0"],
                  ["3", "right", "1 (only 4 is left and bigger)"],
                  ["4", "left", "0"],
                  ["5", "right", "0 (left is empty)"],
                ]}
                note="Earlier merges found none, so the total is 2 + 1 = 3."
              />
            ),
          },
        ]}
        compare={<p>O(n log n) instead of O(n²). Inversion count measures &ldquo;how unsorted&rdquo; an array is — for example, how similar two people&apos;s rankings are.</p>}
      >
        <p>Return the number of pairs i &lt; j with <code>nums[i] &gt; nums[j]</code>, for up to 10<sup>5</sup> values.</p>
      </Problem>

      <Problem
        n={6}
        title="Merge k sorted arrays"
        level="Medium"
        examples={[{ input: "[[1, 4, 5], [1, 3, 4], [2, 6]]", output: "[1, 1, 2, 3, 4, 4, 5, 6]", why: "All values, in sorted order." }]}
        hints={[
          <>Merging the arrays one by one into a growing result repeats a lot of copying.</>,
          <>Merge them in pairs, like the levels of merge sort: k arrays → k/2 → k/4 … → 1.</>,
        ]}
        approaches={[
          {
            name: "Merge one by one",
            idea: <p>Start with the first array and merge each next array into the result.</p>,
            code: `function merge(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);
  return out.concat(a.slice(i), b.slice(j));
}

function mergeK(lists) {
  let result = [];
  for (const list of lists) result = merge(result, list);
  return result;
}

console.log(mergeK([[1, 4, 5], [1, 3, 4], [2, 6]])); // [ 1, 1, 2, 3, 4, 4, 5, 6 ]`,
            explain: <p>With N values in total, the growing result is copied k times: O(N × k).</p>,
          },
          {
            name: "Merge in pairs (divide and conquer)",
            idea: <p>Merge arrays 0+1, 2+3, …, then merge those results in pairs again, until one array remains.</p>,
            code: `function merge(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);
  return out.concat(a.slice(i), b.slice(j));
}

function mergeK(lists) {
  if (lists.length === 0) return [];
  while (lists.length > 1) {
    const next = [];
    for (let i = 0; i < lists.length; i += 2) {
      next.push(i + 1 < lists.length ? merge(lists[i], lists[i + 1]) : lists[i]);
    }
    lists = next;
  }
  return lists[0];
}

console.log(mergeK([[1, 4, 5], [1, 3, 4], [2, 6]])); // [ 1, 1, 2, 3, 4, 4, 5, 6 ]
console.log(mergeK([]));                             // []`,
            explain: <p>Each round touches every value once (O(N)), and the number of lists halves each round, so there are log k rounds: <strong>O(N log k)</strong>. The same reasoning as merge sort&apos;s O(n log n).</p>,
          },
        ]}
        compare={<p>Pairwise merging is the divide-and-conquer answer. Lesson 46 solves the same problem with a heap, also in O(N log k). (Related: LeetCode 23, with linked lists.)</p>}
      >
        <p>Given k sorted arrays, merge them into one sorted array.</p>
      </Problem>
    </>
  );
}
