import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 26 practice questions: the "seen before?" technique. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Two Sum"
        level="Easy"
        examples={[
          { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", why: "2 + 7 = 9." },
          { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]", why: "2 + 4. Not [0, 0]: a value cannot be used twice." },
          { input: "nums = [3, 3], target = 6", output: "[0, 1]", why: "Two different positions with the same value are fine." },
        ]}
        hints={[<>For each x, the partner is target − x. Look it up among the values already seen.</>]}
        approaches={[
          {
            name: "Map of value → index",
            idea: <p>Check for the partner, then store the current value.</p>,
            code: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
}

console.log(twoSum([2, 7, 11, 15], 9)); // [ 0, 1 ]
console.log(twoSum([3, 2, 4], 6));      // [ 1, 2 ]
console.log(twoSum([3, 3], 6));         // [ 0, 1 ]`,
            explain: <p>O(n) time, O(n) space. Mention the O(n²) brute force first, then improve.</p>,
          },
        ]}
        compare={<p>The pattern behind this question appears in dozens of others — learn the shape, not just the answer. (LeetCode 1.)</p>}
      >
        <p>Return the indices of the two values that add up to <code>target</code>. Exactly one answer exists.</p>
      </Problem>

      <Problem
        n={2}
        title="Contains duplicate within k"
        level="Easy"
        examples={[
          { input: "nums = [1, 0, 1, 1], k = 1", output: "true", why: "The 1s at indices 2 and 3 are 1 apart." },
          { input: "nums = [1, 2, 3, 1, 2, 3], k = 2", output: "false", why: "Copies are always 3 apart." },
        ]}
        hints={[<>Store each value&apos;s latest index.</>]}
        approaches={[
          {
            name: "Map of latest index",
            idea: <p>On a repeat, compare the distance to the latest copy; then update the index.</p>,
            code: `function containsNearbyDuplicate(nums, k) {
  const last = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (i - (last.get(nums[i]) ?? -Infinity) <= k) return true;
    last.set(nums[i], i);
  }
  return false;
}

console.log(containsNearbyDuplicate([1, 0, 1, 1], 1));       // true
console.log(containsNearbyDuplicate([1, 2, 3, 1, 2, 3], 2)); // false`,
            explain: <p>O(n) time, O(n) space. Using <code>-Infinity</code> for &ldquo;never seen&rdquo; makes the distance infinitely large, so no separate <code>has</code> check is needed.</p>,
          },
        ]}
        compare={<p>Lesson 22 solved this with a Set window of size k (O(k) space); this version is simpler to write. (LeetCode 219.)</p>}
      >
        <p>Return <code>true</code> if two equal values are at most <code>k</code> positions apart.</p>
      </Problem>

      <Problem
        n={3}
        title="Longest consecutive sequence"
        level="Medium"
        examples={[
          { input: "[100, 4, 200, 1, 3, 2]", output: "4", why: "1, 2, 3, 4." },
          { input: "[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]", output: "9", why: "0 to 8." },
          { input: "[]", output: "0", why: "Edge case." },
        ]}
        hints={[<>Sorting is O(n log n). The problem asks for O(n).</>, <>Put everything in a Set. Only start counting from values whose predecessor is missing.</>]}
        approaches={[
          {
            name: "Sort, then scan",
            idea: <p>Sort; walk and extend the run when the next value is exactly one more (ignore duplicates).</p>,
            code: `function longestConsecutive(nums) {
  if (nums.length === 0) return 0;
  const a = [...nums].sort((x, y) => x - y);
  let best = 1, run = 1;
  for (let i = 1; i < a.length; i++) {
    if (a[i] === a[i - 1]) continue;
    run = a[i] === a[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

console.log(longestConsecutive([100, 4, 200, 1, 3, 2])); // 4`,
            explain: <p>O(n log n).</p>,
          },
          {
            name: "Set, count from run starts",
            idea: <p>The method from the lesson.</p>,
            code: `function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const x of set) {
    if (set.has(x - 1)) continue;
    let len = 1;
    while (set.has(x + len)) len++;
    best = Math.max(best, len);
  }
  return best;
}

console.log(longestConsecutive([100, 4, 200, 1, 3, 2]));         // 4
console.log(longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1])); // 9
console.log(longestConsecutive([]));                             // 0`,
            explain: <p>O(n) time, O(n) space. Looping over the Set rather than the array also skips duplicate values.</p>,
          },
        ]}
        compare={<p>Explain why the inner while loop does not make it O(n²) — that explanation is what the interviewer is listening for. (LeetCode 128.)</p>}
      >
        <p>Return the length of the longest run of consecutive integers that can be formed from the values of <code>nums</code>, in O(n) time.</p>
      </Problem>

      <Problem
        n={4}
        title="Maximum number of k-sum pairs"
        level="Medium"
        examples={[
          { input: "nums = [1, 2, 3, 4], k = 5", output: "2", why: "Remove (1, 4) and (2, 3)." },
          { input: "nums = [3, 1, 3, 4, 3], k = 6", output: "1", why: "Only one (3, 3) pair can be formed; the third 3 has no partner left." },
        ]}
        hints={[<>Like Two Sum, but each value can be used once. Store counts of unpaired values.</>]}
        approaches={[
          {
            name: "Map of unpaired counts",
            idea: <p>If an unpaired partner exists, use it (decrease its count); otherwise store this value as unpaired.</p>,
            code: `function maxOperations(nums, k) {
  const waiting = new Map();
  let pairs = 0;
  for (const x of nums) {
    const need = k - x;
    if ((waiting.get(need) ?? 0) > 0) {
      waiting.set(need, waiting.get(need) - 1);
      pairs++;
    } else {
      waiting.set(x, (waiting.get(x) ?? 0) + 1);
    }
  }
  return pairs;
}

console.log(maxOperations([1, 2, 3, 4], 5));    // 2
console.log(maxOperations([3, 1, 3, 4, 3], 6)); // 1`,
            explain: (
              <DryRun
                title="[3, 1, 3, 4, 3], k = 6"
                cols={["x", "need", "partner waiting?", "pairs", "waiting after"]}
                rows={[
                  ["3", "3", "no", "0", "{3: 1}"],
                  ["1", "5", "no", "0", "{3: 1, 1: 1}"],
                  ["3", "3", "yes", "1", "{3: 0, 1: 1}"],
                  ["4", "2", "no", "1", "{3: 0, 1: 1, 4: 1}"],
                  ["3", "3", "no (count 0)", "1", "{3: 1, 1: 1, 4: 1}"],
                ]}
              />
            ),
          },
          {
            name: "Sort + two pointers",
            idea: <p>Sorted pair sum, but count every match and move both pointers.</p>,
            code: `function maxOperations(nums, k) {
  const a = [...nums].sort((x, y) => x - y);
  let l = 0, r = a.length - 1, pairs = 0;
  while (l < r) {
    const s = a[l] + a[r];
    if (s === k) { pairs++; l++; r--; }
    else if (s < k) l++;
    else r--;
  }
  return pairs;
}

console.log(maxOperations([1, 2, 3, 4], 5)); // 2`,
            explain: <p>O(n log n) time, O(1) extra space after sorting.</p>,
          },
        ]}
        compare={<p>Map: O(n) time, O(n) space. Sort: O(n log n) time, less memory. Mention both. (LeetCode 1679.)</p>}
      >
        <p>In one operation you remove two values that add up to <code>k</code>. Return the maximum number of operations.</p>
      </Problem>

      <Problem
        n={5}
        title="Continuous subarray sum"
        level="Medium"
        examples={[
          { input: "nums = [23, 2, 4, 6, 7], k = 6", output: "true", why: "[2, 4] sums to 6." },
          { input: "nums = [23, 2, 6, 4, 7], k = 13", output: "false", why: "No subarray of length ≥ 2 has a sum divisible by 13." },
          { input: "nums = [5, 0, 0], k = 3", output: "true", why: "[0, 0] sums to 0, and 0 is a multiple of every k." },
        ]}
        hints={[
          <>Two prefix sums with the same remainder mod k enclose a subarray whose sum is a multiple of k.</>,
          <>The subarray must have length at least 2: store the <em>first</em> index of each remainder.</>,
        ]}
        approaches={[
          {
            name: "Remainder → first index",
            idea: <p>Walk with a running remainder. If the same remainder appeared at least 2 positions earlier, the part in between works.</p>,
            code: `function checkSubarraySum(nums, k) {
  const first = new Map([[0, -1]]);       // remainder 0 "seen" before index 0
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum = (sum + nums[i]) % k;
    if (first.has(sum)) {
      if (i - first.get(sum) >= 2) return true;
    } else {
      first.set(sum, i);
    }
  }
  return false;
}

console.log(checkSubarraySum([23, 2, 4, 6, 7], 6));  // true
console.log(checkSubarraySum([23, 2, 6, 4, 7], 13)); // false
console.log(checkSubarraySum([5, 0, 0], 3));         // true`,
            explain: <p>O(n) time, O(min(n, k)) space. Keeping only the first index makes the length check as generous as possible. Values here are non-negative, so no remainder fix is needed.</p>,
          },
        ]}
        compare={<p>Three earlier ideas meet here: prefix sums (Lesson 20), remainders (Lesson 13) and &ldquo;store the first index&rdquo; (this lesson). (LeetCode 523.)</p>}
      >
        <p>Return <code>true</code> if some subarray of length at least 2 has a sum that is a multiple of <code>k</code>.</p>
      </Problem>

      <Problem
        n={6}
        title="Count nice subarrays"
        level="Medium"
        examples={[
          { input: "nums = [1, 1, 2, 1, 1], k = 3", output: "2", why: "[1, 1, 2, 1] and [1, 2, 1, 1]." },
          { input: "nums = [2, 4, 6], k = 1", output: "0", why: "No odd numbers." },
        ]}
        hints={[<>Turn each value into 1 (odd) or 0 (even). Now it is &ldquo;subarray sum equals k&rdquo;.</>]}
        approaches={[
          {
            name: "Prefix count of odds + Map",
            idea: <p>The code from the lesson.</p>,
            code: `function numberOfSubarrays(nums, k) {
  const seen = new Map([[0, 1]]);
  let odds = 0, count = 0;
  for (const x of nums) {
    odds += x % 2;
    count += seen.get(odds - k) ?? 0;
    seen.set(odds, (seen.get(odds) ?? 0) + 1);
  }
  return count;
}

console.log(numberOfSubarrays([1, 1, 2, 1, 1], 3)); // 2
console.log(numberOfSubarrays([2, 4, 6], 1));       // 0`,
            explain: <p>O(n). Lesson 23&apos;s &ldquo;at most k − at most (k − 1)&rdquo; window also works, since all counts are non-negative.</p>,
          },
        ]}
        compare={<p>Reducing a new problem to one you already know (here, subarray sum = k) is the main skill this part teaches. (LeetCode 1248.)</p>}
      >
        <p>Return the number of subarrays that contain exactly <code>k</code> odd numbers.</p>
      </Problem>
    </>
  );
}
