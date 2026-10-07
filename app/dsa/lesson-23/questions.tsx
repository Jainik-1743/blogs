import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 23 practice questions: variable-size sliding windows. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Minimum size subarray sum"
        level="Medium"
        examples={[
          { input: "target = 7, nums = [2, 3, 1, 2, 4, 3]", output: "2", why: "[4, 3] is the shortest subarray with sum ≥ 7." },
          { input: "target = 4, nums = [1, 4, 4]", output: "1", why: "[4] alone is enough." },
          { input: "target = 11, nums = [1, 1, 1, 1, 1]", output: "0", why: "Even the whole array sums to only 5." },
        ]}
        hints={[<>All values are positive, so shrinking always lowers the sum.</>, <>Shortest-window template: shrink while the sum is still ≥ target.</>]}
        approaches={[
          {
            name: "Grow and shrink",
            idea: <p>The traced algorithm. Return 0 if no window was ever valid.</p>,
            code: `function minSubArrayLen(target, nums) {
  let l = 0, sum = 0, best = Infinity;
  for (let r = 0; r < nums.length; r++) {
    sum += nums[r];
    while (sum >= target) {
      best = Math.min(best, r - l + 1);
      sum -= nums[l++];
    }
  }
  return best === Infinity ? 0 : best;
}

console.log(minSubArrayLen(7, [2, 3, 1, 2, 4, 3]));  // 2
console.log(minSubArrayLen(4, [1, 4, 4]));           // 1
console.log(minSubArrayLen(11, [1, 1, 1, 1, 1]));    // 0`,
            explain: <p>O(n) time, O(1) space. The final check turns &ldquo;never found&rdquo; (Infinity) into the required 0.</p>,
          },
        ]}
        compare={<p>A prefix-sum + binary-search solution also exists in O(n log n); the window is simpler and faster. (LeetCode 209.)</p>}
      >
        <p>Return the length of the shortest subarray whose sum is at least <code>target</code>, or 0 if there is none. All values are positive.</p>
      </Problem>

      <Problem
        n={2}
        title="Longest substring without repeating characters"
        level="Medium"
        examples={[
          { input: `"abcabcbb"`, output: "3", why: "\"abc\"." },
          { input: `"bbbbb"`, output: "1", why: "\"b\"." },
          { input: `"pwwkew"`, output: "3", why: "\"wke\". (\"pwke\" is a subsequence, not a substring.)" },
        ]}
        hints={[
          <>The rule: no character appears twice in the window.</>,
          <>When the new character is already in the window, shrink from the left until it is not.</>,
        ]}
        approaches={[
          {
            name: "Window with a Set",
            idea: <p>Grow with <code>r</code>; while <code>s[r]</code> is already in the Set, remove <code>s[l]</code> and move <code>l</code>.</p>,
            code: `function lengthOfLongestSubstring(s) {
  const inWindow = new Set();
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    while (inWindow.has(s[r])) {
      inWindow.delete(s[l]);
      l++;
    }
    inWindow.add(s[r]);
    best = Math.max(best, r - l + 1);
  }
  return best;
}

console.log(lengthOfLongestSubstring("abcabcbb")); // 3
console.log(lengthOfLongestSubstring("bbbbb"));    // 1
console.log(lengthOfLongestSubstring("pwwkew"));   // 3`,
            explain: <p>O(n): each character is added once and removed at most once.</p>,
          },
          {
            name: "Jump l with last positions",
            idea: <p>Remember the last index of each character. On a repeat, jump <code>l</code> just past the earlier copy — no step-by-step shrinking.</p>,
            code: `function lengthOfLongestSubstring(s) {
  const last = new Map();
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    if (last.has(s[r]) && last.get(s[r]) >= l) l = last.get(s[r]) + 1;
    last.set(s[r], r);
    best = Math.max(best, r - l + 1);
  }
  return best;
}

console.log(lengthOfLongestSubstring("abcabcbb")); // 3
console.log(lengthOfLongestSubstring("pwwkew"));   // 3`,
            explain: <p>Still O(n), with fewer steps. The check <code>&gt;= l</code> ignores old copies that are already outside the window.</p>,
          },
        ]}
        compare={<p>One of the most asked interview questions. Lesson 31 returns to it with other string windows. (LeetCode 3.)</p>}
      >
        <p>Return the length of the longest substring of <code>s</code> with no repeated characters.</p>
      </Problem>

      <Problem
        n={3}
        title="Max consecutive ones III"
        level="Medium"
        examples={[
          { input: "nums = [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k = 2", output: "6", why: "Flip the zeros at indices 5 and 10: indices 5–10 become six 1s in a row." },
          { input: "nums = [0, 0, 1, 1], k = 0", output: "2", why: "No flips allowed: the longest run is the two 1s." },
        ]}
        hints={[<>Restate: the longest window containing at most k zeros.</>]}
        approaches={[
          {
            name: "Longest window with ≤ k zeros",
            idea: <p>Count zeros in the window; shrink while there are more than k.</p>,
            code: `function longestOnes(nums, k) {
  let l = 0, zeros = 0, best = 0;
  for (let r = 0; r < nums.length; r++) {
    if (nums[r] === 0) zeros++;
    while (zeros > k) {
      if (nums[l] === 0) zeros--;
      l++;
    }
    best = Math.max(best, r - l + 1);
  }
  return best;
}

console.log(longestOnes([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2)); // 6
console.log(longestOnes([0, 0, 1, 1], 0));                      // 2`,
            explain: <p>O(n), O(1). The question says &ldquo;flip&rdquo;, but you never flip anything — restating the problem as a window rule is the real step.</p>,
          },
        ]}
        compare={<p>Restating &ldquo;at most k changes&rdquo; as &ldquo;at most k bad items in the window&rdquo; solves a whole family of problems. (LeetCode 1004.)</p>}
      >
        <p>Return the longest run of 1s you can get by flipping at most <code>k</code> zeros to 1.</p>
      </Problem>

      <Problem
        n={4}
        title="Fruit into baskets"
        level="Medium"
        examples={[
          { input: "[1, 2, 1]", output: "3", why: "Two types, all three trees." },
          { input: "[0, 1, 2, 2]", output: "3", why: "[1, 2, 2]." },
          { input: "[1, 2, 3, 2, 2]", output: "4", why: "[2, 3, 2, 2]." },
        ]}
        hints={[<>Two baskets, one type each: the longest window with at most 2 distinct values.</>]}
        approaches={[
          {
            name: "At most 2 distinct",
            idea: <p>The &ldquo;at most k distinct&rdquo; window from the lesson, with k = 2.</p>,
            code: `function totalFruit(fruits) {
  const freq = new Map();
  let l = 0, best = 0;
  for (let r = 0; r < fruits.length; r++) {
    freq.set(fruits[r], (freq.get(fruits[r]) ?? 0) + 1);
    while (freq.size > 2) {
      freq.set(fruits[l], freq.get(fruits[l]) - 1);
      if (freq.get(fruits[l]) === 0) freq.delete(fruits[l]);
      l++;
    }
    best = Math.max(best, r - l + 1);
  }
  return best;
}

console.log(totalFruit([1, 2, 1]));       // 3
console.log(totalFruit([0, 1, 2, 2]));    // 3
console.log(totalFruit([1, 2, 3, 2, 2])); // 4`,
            explain: <p>O(n). The story about baskets hides a standard pattern — interviewers like such stories.</p>,
          },
        ]}
        compare={<p>Practise translating the story into &ldquo;longest window with at most 2 distinct values&rdquo;. (LeetCode 904.)</p>}
      >
        <p>
          Trees in a row produce fruit of type <code>fruits[i]</code>. You have two baskets, each holding one type. Starting at any
          tree and moving right, you must pick one fruit from every tree until a fruit fits no basket. Return the most fruit you can pick.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Longest run of 1s after deleting one element"
        level="Medium"
        examples={[
          { input: "[1, 1, 0, 1]", output: "3", why: "Delete the 0: [1, 1, 1]." },
          { input: "[0, 1, 1, 1, 0, 1, 1, 0, 1]", output: "5", why: "Delete the 0 at index 4: [1, 1, 1, 1, 1]." },
          { input: "[1, 1, 1]", output: "2", why: "Edge case: you must delete one element, even a 1." },
        ]}
        hints={[<>Window with at most one 0. The answer is the window length minus 1 (the deleted element).</>]}
        approaches={[
          {
            name: "Window with ≤ 1 zero",
            idea: <p>Same as Question 3 with k = 1; subtract 1 for the deletion.</p>,
            code: `function longestSubarray(nums) {
  let l = 0, zeros = 0, best = 0;
  for (let r = 0; r < nums.length; r++) {
    if (nums[r] === 0) zeros++;
    while (zeros > 1) {
      if (nums[l] === 0) zeros--;
      l++;
    }
    best = Math.max(best, r - l);      // window length − 1
  }
  return best;
}

console.log(longestSubarray([1, 1, 0, 1]));                 // 3
console.log(longestSubarray([0, 1, 1, 1, 0, 1, 1, 0, 1]));  // 5
console.log(longestSubarray([1, 1, 1]));                    // 2`,
            explain: <p>O(n). Using <code>r - l</code> instead of <code>r - l + 1</code> handles the forced deletion, including the all-1s edge case.</p>,
          },
        ]}
        compare={<p>A one-character change from Question 3 — notice how the edge case is handled by the formula, not by an if. (LeetCode 1493.)</p>}
      >
        <p>Delete exactly one element from a binary array. Return the length of the longest run of 1s in what remains.</p>
      </Problem>

      <Problem
        n={6}
        title="Subarrays with product less than k"
        level="Medium"
        examples={[
          { input: "nums = [10, 5, 2, 6], k = 100", output: "8", why: "[10], [5], [2], [6], [10, 5], [5, 2], [2, 6], [5, 2, 6]." },
          { input: "nums = [1, 2, 3], k = 0", output: "0", why: "No product is less than 0." },
        ]}
        hints={[<>Values are positive, so a product only grows as the window grows.</>, <>Count with <code>r - l + 1</code> for each r.</>]}
        approaches={[
          {
            name: "Counting window",
            idea: <p>Keep the window product below k; every window ending at r and starting in l..r counts.</p>,
            code: `function numSubarrayProductLessThanK(nums, k) {
  if (k <= 1) return 0;
  let l = 0, product = 1, count = 0;
  for (let r = 0; r < nums.length; r++) {
    product *= nums[r];
    while (product >= k) product /= nums[l++];
    count += r - l + 1;
  }
  return count;
}

console.log(numSubarrayProductLessThanK([10, 5, 2, 6], 100)); // 8
console.log(numSubarrayProductLessThanK([1, 2, 3], 0));       // 0`,
            explain: (
              <DryRun
                title="[10, 5, 2, 6], k = 100"
                cols={["r", "window", "product", "added"]}
                rows={[
                  ["0", "[10]", "10", "1"],
                  ["1", "[10, 5]", "50", "2"],
                  ["2", "[5, 2] (10 removed)", "10", "2"],
                  ["3", "[5, 2, 6]", "60", "3"],
                ]}
                note="1 + 2 + 2 + 3 = 8. The k ≤ 1 check prevents the while loop from shrinking past r."
              />
            ),
          },
        ]}
        compare={<p>O(n). The <code>count += r - l + 1</code> step is the key idea for counting with windows. (LeetCode 713.)</p>}
      >
        <p>Count the subarrays of positive integers whose product is strictly less than <code>k</code>.</p>
      </Problem>

      <Problem
        n={7}
        title="Subarrays with exactly k different values"
        level="Hard"
        examples={[
          { input: "nums = [1, 2, 1, 2, 3], k = 2", output: "7", why: "[1,2], [2,1], [1,2], [2,3], [1,2,1], [2,1,2], [1,2,1,2]." },
          { input: "nums = [1, 2, 1, 3, 4], k = 3", output: "3", why: "[1,2,1,3], [2,1,3], [1,3,4]." },
        ]}
        hints={[<>Counting &ldquo;exactly&rdquo; directly with one window is awkward.</>, <>Count &ldquo;at most k&rdquo; and &ldquo;at most k − 1&rdquo;, and subtract.</>]}
        approaches={[
          {
            name: "atMost(k) − atMost(k − 1)",
            idea: <p>The counting window from the lesson, run twice.</p>,
            code: `function atMost(nums, k) {
  const freq = new Map();
  let l = 0, count = 0;
  for (let r = 0; r < nums.length; r++) {
    freq.set(nums[r], (freq.get(nums[r]) ?? 0) + 1);
    while (freq.size > k) {
      freq.set(nums[l], freq.get(nums[l]) - 1);
      if (freq.get(nums[l]) === 0) freq.delete(nums[l]);
      l++;
    }
    count += r - l + 1;
  }
  return count;
}

function subarraysWithKDistinct(nums, k) {
  return atMost(nums, k) - atMost(nums, k - 1);
}

console.log(subarraysWithKDistinct([1, 2, 1, 2, 3], 2)); // 7
console.log(subarraysWithKDistinct([1, 2, 1, 3, 4], 3)); // 3`,
            explain: <p>O(n): two linear passes. Every subarray with exactly k distinct values is counted by atMost(k) but not by atMost(k − 1).</p>,
          },
        ]}
        compare={<p>A hard problem that becomes short once you know the subtraction trick. The same trick counts &ldquo;exactly k odd numbers&rdquo; (LeetCode 1248) and similar problems. (LeetCode 992.)</p>}
      >
        <p>Return the number of subarrays that contain exactly <code>k</code> different values.</p>
      </Problem>
    </>
  );
}
