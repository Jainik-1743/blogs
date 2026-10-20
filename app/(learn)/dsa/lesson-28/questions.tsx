import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 28 practice questions: binary search on sorted (and rotated) arrays. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Binary search"
        level="Easy"
        examples={[
          { input: "nums = [-1, 0, 3, 5, 9, 12], target = 9", output: "4", why: "9 is at index 4." },
          { input: "nums = [-1, 0, 3, 5, 9, 12], target = 2", output: "-1", why: "Not present." },
        ]}
        hints={[<>Closed range [lo, hi], loop while lo &lt;= hi.</>]}
        approaches={[
          {
            name: "Closed-range template",
            idea: <p>The template from the lesson.</p>,
            code: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

console.log(search([-1, 0, 3, 5, 9, 12], 9)); // 4
console.log(search([-1, 0, 3, 5, 9, 12], 2)); // -1`,
            explain: <p>O(log n) time, O(1) extra space.</p>,
          },
        ]}
        compare={<p>Practise writing it until you can do it without thinking. (LeetCode 704.)</p>}
      >
        <p>Return the index of <code>target</code> in the sorted array, or −1. Use O(log n) time.</p>
      </Problem>

      <Problem
        n={2}
        title="Search insert position"
        level="Easy"
        examples={[
          { input: "nums = [1, 3, 5, 6], target = 5", output: "2", why: "Found at index 2." },
          { input: "nums = [1, 3, 5, 6], target = 2", output: "1", why: "2 would go between 1 and 3." },
          { input: "nums = [1, 3, 5, 6], target = 7", output: "4", why: "After everything." },
        ]}
        hints={[<>This is the lower bound: the first index whose value is ≥ target.</>]}
        approaches={[
          {
            name: "Lower bound",
            idea: <p>Half-open binary search for the first value ≥ target.</p>,
            code: `function searchInsert(nums, target) {
  let lo = 0, hi = nums.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

console.log(searchInsert([1, 3, 5, 6], 5)); // 2
console.log(searchInsert([1, 3, 5, 6], 2)); // 1
console.log(searchInsert([1, 3, 5, 6], 7)); // 4`,
            explain: <p>O(log n) time. Starting <code>hi</code> at <code>nums.length</code> (not length − 1) is what allows the answer &ldquo;after everything&rdquo;.</p>,
          },
        ]}
        compare={<p>(LeetCode 35.)</p>}
      >
        <p>Return the index of <code>target</code> if found; otherwise the index where it would be inserted to keep the array sorted.</p>
      </Problem>

      <Problem
        n={3}
        title="First and last position"
        level="Medium"
        examples={[
          { input: "nums = [5, 7, 7, 8, 8, 10], target = 8", output: "[3, 4]", why: "The 8s are at indices 3 and 4." },
          { input: "nums = [5, 7, 7, 8, 8, 10], target = 6", output: "[-1, -1]", why: "Not present." },
          { input: "nums = [], target = 0", output: "[-1, -1]", why: "Edge case: empty." },
        ]}
        hints={[<>The lower bound gives the first index. The upper bound minus 1 gives the last index.</>]}
        approaches={[
          {
            name: "Find first, then scan right",
            idea: <p>Find the first 8 with <code>indexOf</code> (a simple scan), then walk right to the last 8.</p>,
            code: `function searchRange(nums, target) {
  const i = nums.indexOf(target);
  if (i === -1) return [-1, -1];
  let j = i;
  while (j + 1 < nums.length && nums[j + 1] === target) j++;
  return [i, j];
}

console.log(searchRange([5, 7, 7, 8, 8, 10], 8)); // [ 3, 4 ]`,
            explain: <p>O(n) time in the worst case (when all values are equal). The problem asks for O(log n), so this is not enough.</p>,
          },
          {
            name: "Two binary searches",
            idea: <p>Use lowerBound(target) for the first index and upperBound(target) − 1 for the last index.</p>,
            code: `function searchRange(nums, target) {
  const bound = (strict) => {
    let lo = 0, hi = nums.length;
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (nums[mid] < target || (strict && nums[mid] === target)) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  const first = bound(false);
  if (first === nums.length || nums[first] !== target) return [-1, -1];
  return [first, bound(true) - 1];
}

console.log(searchRange([5, 7, 7, 8, 8, 10], 8)); // [ 3, 4 ]
console.log(searchRange([5, 7, 7, 8, 8, 10], 6)); // [ -1, -1 ]
console.log(searchRange([], 0));                  // [ -1, -1 ]`,
            explain: <p>O(log n) time. One helper function with a flag gives both bounds.</p>,
          },
        ]}
        compare={<p>This is a very common medium question. It checks whether you can change the template to find boundaries. (LeetCode 34.)</p>}
      >
        <p>Return the first and last index of <code>target</code> in a sorted array, or [−1, −1], in O(log n).</p>
      </Problem>

      <Problem
        n={4}
        title="First bad version"
        level="Easy"
        examples={[{ input: "n = 5, first bad = 4", output: "4", why: "isBad(3) is false, isBad(4) is true; every version after a bad one is also bad." }]}
        hints={[<>isBad(i) gives false…false, true…true. Find the first true.</>]}
        approaches={[
          {
            name: "First true",
            idea: <p>This is binary search with a yes/no test (a predicate), over versions 1…n.</p>,
            code: `function firstBadVersion(n, isBad) {
  let lo = 1, hi = n;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (isBad(mid)) hi = mid;      // mid might be the first bad one
    else lo = mid + 1;             // mid is good: the first bad one is later
  }
  return lo;
}

console.log(firstBadVersion(5, (v) => v >= 4));          // 4
console.log(firstBadVersion(2126753390, (v) => v >= 1702766719)); // 1702766719`,
            explain: <p>O(log n) calls to <code>isBad</code>. That is about 31 calls for n ≈ 2 × 10<sup>9</sup>. There is no array here at all, only a yes/no question.</p>,
          },
        ]}
        compare={<p>This is the clearest example of &ldquo;find the first true&rdquo;. (LeetCode 278.)</p>}
      >
        <p>There are versions 1 to n. From some version on, all versions are bad. Return the first bad version, and call <code>isBad(v)</code> as few times as possible.</p>
      </Problem>

      <Problem
        n={5}
        title="Search in a rotated sorted array"
        level="Medium"
        examples={[
          { input: "nums = [4, 5, 6, 7, 0, 1, 2], target = 0", output: "4", why: "See the dry run in the lesson." },
          { input: "nums = [4, 5, 6, 7, 0, 1, 2], target = 3", output: "-1", why: "Not present." },
          { input: "nums = [1], target = 0", output: "-1", why: "Edge case." },
        ]}
        hints={[<>At least one half next to mid is sorted. Decide whether the target lies in that sorted half.</>]}
        approaches={[
          {
            name: "Sorted-half test",
            idea: <p>The method from the lesson.</p>,
            code: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}

console.log(search([4, 5, 6, 7, 0, 1, 2], 0)); // 4
console.log(search([4, 5, 6, 7, 0, 1, 2], 3)); // -1
console.log(search([1], 0));                   // -1`,
            explain: <p>O(log n) time. The <code>&lt;=</code> in <code>nums[lo] &lt;= nums[mid]</code> handles the case lo = mid (a left half with one item).</p>,
          },
        ]}
        compare={<p>(LeetCode 33.)</p>}
      >
        <p>A sorted array of distinct values was rotated at an unknown index. Return the index of <code>target</code>, or −1, in O(log n).</p>
      </Problem>

      <Problem
        n={6}
        title="Minimum in a rotated sorted array"
        level="Medium"
        examples={[
          { input: "[3, 4, 5, 1, 2]", output: "1", why: "The rotation point." },
          { input: "[4, 5, 6, 7, 0, 1, 2]", output: "0", why: "The drop from 7 to 0 marks the minimum." },
          { input: "[11, 13, 15, 17]", output: "11", why: "Edge case: not rotated (or rotated by n)." },
        ]}
        hints={[<>Compare nums[mid] with nums[hi]. If nums[mid] &gt; nums[hi], the drop (and so the minimum) is to the right of mid.</>]}
        approaches={[
          {
            name: "Compare with the right end",
            idea: <p>The test &ldquo;nums[i] ≤ nums[last]&rdquo; gives false…false, true…true. The minimum is at the first true.</p>,
            code: `function findMin(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] > nums[hi]) lo = mid + 1;   // minimum is strictly right of mid
    else hi = mid;                            // mid could be the minimum
  }
  return nums[lo];
}

console.log(findMin([3, 4, 5, 1, 2]));       // 1
console.log(findMin([4, 5, 6, 7, 0, 1, 2])); // 0
console.log(findMin([11, 13, 15, 17]));      // 11`,
            explain: (
              <DryRun
                title="[4, 5, 6, 7, 0, 1, 2]"
                cols={["lo", "hi", "mid", "nums[mid] > nums[hi]?", "next"]}
                rows={[["0", "6", "3 (7)", "7 > 2 yes", "lo = 4"], ["4", "6", "5 (1)", "1 > 2 no", "hi = 5"], ["4", "5", "4 (0)", "0 > 1 no", "hi = 4"]]}
                note="lo = hi = 4: the minimum is 0."
              />
            ),
          },
        ]}
        compare={<p>Comparing with <code>nums[hi]</code> instead of <code>nums[lo]</code> handles the not-rotated case without a special check. (LeetCode 153.)</p>}
      >
        <p>Return the smallest value of a rotated sorted array of distinct values, in O(log n).</p>
      </Problem>

      <Problem
        n={7}
        title="Find a peak element"
        level="Medium"
        examples={[
          { input: "[1, 2, 3, 1]", output: "2", why: "3 is larger than both of its neighbours." },
          { input: "[1, 2, 1, 3, 5, 6, 4]", output: "5", why: "6 is a peak. The value 2 at index 1 is also a peak, so either answer is accepted." },
        ]}
        hints={[
          <>The array is not sorted, but binary search still works. Treat the space outside the array as −∞ (smaller than any value).</>,
          <>If nums[mid] &lt; nums[mid + 1], you are on a rising slope. A peak must exist to the right.</>,
        ]}
        approaches={[
          {
            name: "Walk uphill with binary search",
            idea: <p>Go towards the larger neighbour. A rising slope must end in a peak.</p>,
            code: `function findPeakElement(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] < nums[mid + 1]) lo = mid + 1;   // rising: a peak is to the right
    else hi = mid;                                 // falling: mid or something left is a peak
  }
  return lo;
}

console.log(findPeakElement([1, 2, 3, 1]));          // 2
console.log(findPeakElement([1, 2, 1, 3, 5, 6, 4])); // 5`,
            explain: <p>O(log n) time. Binary search does not need a sorted array. It only needs a rule that tells you which half certainly contains <em>an</em> answer.</p>,
          },
        ]}
        compare={<p>Interviewers like this question because it shows that binary search does not always need sorted data. (LeetCode 162.)</p>}
      >
        <p>A peak is a value strictly larger than its neighbours (the space outside the array counts as −∞). Neighbouring values are never equal. Return the index of any peak, in O(log n) time.</p>
      </Problem>
    </>
  );
}
