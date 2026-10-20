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
          { input: "nums1 = [1, 2, 3, 0, 0, 0], m = 3, nums2 = [2, 5, 6], n = 3", output: "[1, 2, 2, 3, 5, 6]", why: "The last n slots of nums1 are empty space (filled with zeros) where the merged values will go." },
          { input: "nums1 = [0], m = 0, nums2 = [1], n = 1", output: "[1]", why: "Edge case: nums1 has no real values." },
        ]}
        hints={[
          <>If you merge from the front, you would overwrite values of nums1 that you still need.</>,
          <>The empty space is at the <em>end</em>. So merge from the back. Place the largest remaining value at the last free position.</>,
        ]}
        approaches={[
          {
            name: "Merge into a new array, copy back",
            idea: <p>Do the normal merge into a temporary array. Then copy the result into nums1.</p>,
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
            idea: <p>Keep three positions: the last real value of nums1 (<code>i</code>), the last value of nums2 (<code>j</code>), and the last slot to fill (<code>k</code>). Place the larger of the two values at k, and move left.</p>,
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
                note="Once nums2 is used up, the remaining nums1 values are already in the right place. The writing position k never goes below i, so no value is overwritten too early."
              />
            ),
          },
        ]}
        compare={<p>Merging from the back is the expected answer. It takes O(m + n) time and O(1) extra space. &ldquo;Fill from the end when the free space is at the end&rdquo; is a useful trick to remember. (LeetCode 88.)</p>}
      >
        <p>
          <code>nums1</code> has length m + n. Its first m values are sorted, and the rest are zeros. Merge the sorted{" "}
          <code>nums2</code> (length n) into <code>nums1</code> so that nums1 is sorted. Change nums1 itself; do not return a new array.
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
          <>Squaring and then sorting is O(n log n). Can you use the fact that the input is already sorted?</>,
          <>The largest square comes from one of the two <em>ends</em> of the array. Fill the result from the back.</>,
        ]}
        approaches={[
          {
            name: "Square, then sort",
            idea: <p>The simple way: square every value, then sort.</p>,
            code: `function sortedSquares(nums) {
  return nums.map((x) => x * x).sort((a, b) => a - b);
}

console.log(sortedSquares([-4, -1, 0, 3, 10])); // [ 0, 1, 9, 16, 100 ]`,
            explain: <p>O(n log n).</p>,
          },
          {
            name: "Merge from both ends",
            idea: <p>The squares of the negative part get smaller as you move right. The squares of the positive part get bigger as you move right. That gives two sorted sequences. Merge them, taking the largest first.</p>,
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
            explain: <p>O(n), because each step places one value. It is the merge step from this lesson, reading two sorted sequences from their large ends.</p>,
          },
        ]}
        compare={<p>Approach 2 is the answer that interviewers expect as a follow-up. The key step is to see &ldquo;two sorted sequences hidden in one array&rdquo;. (LeetCode 977.)</p>}
      >
        <p>Given an array sorted in non-decreasing order (each value is equal to or bigger than the one before), return the squares of its values, also sorted.</p>
      </Problem>

      <Problem
        n={3}
        title="Sort an array with merge sort"
        level="Medium"
        examples={[{ input: "[5, 1, 1, 2, 0, 0]", output: "[0, 0, 1, 1, 2, 5]", why: "There can be up to 5 × 10⁴ values, so an O(n log n) sort is needed." }]}
        hints={[<>Write <code>merge</code>, then <code>mergeSort</code> with a base case of length ≤ 1.</>, <>To avoid creating many small arrays, you can sort ranges of indexes in one array and use one shared temporary array (a buffer).</>]}
        approaches={[
          {
            name: "Merge sort with slices",
            idea: <p>Use the version from the lesson.</p>,
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
            explain: <p>O(n log n) time. It is simple, but it creates many small arrays that are thrown away soon after.</p>,
          },
          {
            name: "Merge sort on index ranges",
            idea: <p>Sort <code>nums[lo..hi]</code> in place, and use one shared temporary buffer for every merge.</p>,
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
            explain: <p>The time is the same, O(n log n), and the space is O(n). But only one extra array is ever created. Working on index ranges (lo, hi) instead of copies is the style that quick sort uses too.</p>,
          },
        ]}
        compare={<p>Either one passes. Version 2 is closer to what a library does, and it avoids the cost of <code>slice</code>. (LeetCode 912.)</p>}
      >
        <p>Sort <code>nums</code> in ascending order (smallest first) without the built-in sort, in O(n log n) time.</p>
      </Problem>

      <Problem
        n={4}
        title="Intersection of two sorted arrays"
        level="Easy"
        examples={[
          { input: "[1, 2, 2, 3, 5], [2, 2, 4, 5]", output: "[2, 2, 5]", why: "Keep each common value as many times as it appears in both." },
          { input: "[1, 3], [2, 4]", output: "[]", why: "No common values." },
        ]}
        hints={[<>Both arrays are sorted. Walk through them together, as in a merge.</>, <>If the values are equal, record the value and move both fingers. Otherwise move the finger on the smaller value.</>]}
        approaches={[
          {
            name: "Merge-style walk",
            idea: <p>Use two fingers. If the values are equal, take the value and move both fingers. Otherwise move the finger on the smaller value, because that value cannot match anything later.</p>,
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
            explain: <p>O(n + m) time, and O(1) extra space apart from the output. No Set is needed, because the inputs are sorted.</p>,
          },
        ]}
        compare={<p>Compare this with Lesson 12, where unsorted input needed a Set. Sorted input often removes the need for extra memory. (Related: LeetCode 350.)</p>}
      >
        <p>Given two sorted arrays, return their common values in sorted order. A value that appears twice in both arrays appears twice in the answer.</p>
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
          <>Counting every pair is O(n²), which is too slow for 10<sup>5</sup> values.</>,
          <>During a merge, when you take an item from the right half, how many left-half items are bigger than it?</>,
        ]}
        approaches={[
          {
            name: "Merge sort that counts",
            idea: <p>Every time the merge step places a right-half item before the remaining left-half items, it adds <code>left.length - i</code> to the count.</p>,
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
        compare={<p>O(n log n) instead of O(n²). The inversion count measures &ldquo;how unsorted&rdquo; an array is. For example, it can show how different two people&apos;s rankings are.</p>}
      >
        <p>Return the number of pairs i &lt; j with <code>nums[i] &gt; nums[j]</code>, for up to 10<sup>5</sup> values.</p>
      </Problem>

      <Problem
        n={6}
        title="Merge k sorted arrays"
        level="Medium"
        examples={[{ input: "[[1, 4, 5], [1, 3, 4], [2, 6]]", output: "[1, 1, 2, 3, 4, 4, 5, 6]", why: "All values, in sorted order." }]}
        hints={[
          <>If you merge the arrays one by one into a growing result, you copy the same values again and again.</>,
          <>Merge them in pairs, like the levels of merge sort. The number of arrays goes k → k/2 → k/4 … → 1.</>,
        ]}
        approaches={[
          {
            name: "Merge one by one",
            idea: <p>Start with the first array. Then merge each next array into the result.</p>,
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
            explain: <p>With N values in total, the growing result is copied up to k times. So the time is O(N × k).</p>,
          },
          {
            name: "Merge in pairs (divide and conquer)",
            idea: <p>Merge arrays 0 and 1, then 2 and 3, and so on. Then merge those results in pairs again, until one array remains.</p>,
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
            explain: <p>Each round touches every value once, which is O(N). The number of lists halves each round, so there are log k rounds. The total is <strong>O(N log k)</strong>. This is the same reasoning as merge sort&apos;s O(n log n).</p>,
          },
        ]}
        compare={<p>Pairwise merging is the divide-and-conquer answer. Lesson 46 solves the same problem with a heap (a structure that always gives you the smallest item quickly), also in O(N log k). (Related: LeetCode 23, which uses linked lists.)</p>}
      >
        <p>Given k sorted arrays, merge them into one sorted array.</p>
      </Problem>
    </>
  );
}
