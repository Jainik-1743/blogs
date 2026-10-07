import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 22 practice questions: fixed-size sliding windows. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Maximum average subarray"
        level="Easy"
        examples={[
          { input: "nums = [1, 12, -5, -6, 50, 3], k = 4", output: "12.75", why: "The window [12, −5, −6, 50] has sum 51; 51 / 4 = 12.75." },
          { input: "nums = [5], k = 1", output: "5", why: "One window." },
        ]}
        hints={[<>The largest average comes from the largest sum divided by k. So find the largest window sum.</>]}
        approaches={[
          {
            name: "Sliding window sum",
            idea: <p>Keep the window sum. At the end, divide the best sum by k.</p>,
            code: `function findMaxAverage(nums, k) {
  let sum = 0, best = -Infinity;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
    if (i >= k) sum -= nums[i - k];
    if (i >= k - 1) best = Math.max(best, sum);
  }
  return best / k;
}

console.log(findMaxAverage([1, 12, -5, -6, 50, 3], 4)); // 12.75
console.log(findMaxAverage([5], 1));                    // 5`,
            explain: <p>O(n) time, O(1) space. <code>best</code> starts at <code>-Infinity</code> (smaller than any number) because sums can be negative.</p>,
          },
        ]}
        compare={<p>Divide once at the end, not at every step. This needs fewer operations and avoids rounding problems when you compare numbers. (LeetCode 643.)</p>}
      >
        <p>Find the largest average of any k values in a row.</p>
      </Problem>

      <Problem
        n={2}
        title="Maximum vowels in a substring of length k"
        level="Medium"
        examples={[
          { input: `s = "abciiidef", k = 3`, output: "3", why: "\"iii\" has three vowels." },
          { input: `s = "leetcode", k = 3`, output: "2", why: "\"lee\", \"eet\" and \"ode\" each have two." },
          { input: `s = "rhythms", k = 4`, output: "0", why: "No vowels at all." },
        ]}
        hints={[<>The window state is the number of vowels inside the window.</>]}
        approaches={[
          {
            name: "Sliding count",
            idea: <p>Add 1 when a vowel enters. Subtract 1 when a vowel leaves.</p>,
            code: `function maxVowels(s, k) {
  const vowels = new Set("aeiou");
  let count = 0, best = 0;
  for (let i = 0; i < s.length; i++) {
    if (vowels.has(s[i])) count++;
    if (i >= k && vowels.has(s[i - k])) count--;
    if (i >= k - 1) best = Math.max(best, count);
    if (best === k) break;                 // cannot do better than all vowels
  }
  return best;
}

console.log(maxVowels("abciiidef", 3)); // 3
console.log(maxVowels("leetcode", 3));  // 2
console.log(maxVowels("rhythms", 4));   // 0`,
            explain: <p>O(n) time, O(1) space. The early exit is optional. It shows that you know the biggest possible answer is k.</p>,
          },
        ]}
        compare={<p>This uses the template directly, with a count as the state. (LeetCode 1456.)</p>}
      >
        <p>Return the largest number of vowels in any substring (a block of letters in a row) of <code>s</code> that has length <code>k</code>.</p>
      </Problem>

      <Problem
        n={3}
        title="Windows with average at least a threshold"
        level="Medium"
        examples={[
          { input: "arr = [2, 2, 2, 2, 5, 5, 5, 8], k = 3, threshold = 4", output: "3", why: "[2, 5, 5], [5, 5, 5] and [5, 5, 8] have averages 4, 5 and 6." },
        ]}
        hints={[<>&ldquo;Average ≥ threshold&rdquo; is the same as &ldquo;sum ≥ threshold × k&rdquo;. So you do not need division.</>]}
        approaches={[
          {
            name: "Sliding sum, compare with k × threshold",
            idea: <p>Count the full windows whose sum is at least <code>k * threshold</code>.</p>,
            code: `function numOfSubarrays(arr, k, threshold) {
  const need = k * threshold;
  let sum = 0, count = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    if (i >= k) sum -= arr[i - k];
    if (i >= k - 1 && sum >= need) count++;
  }
  return count;
}

console.log(numOfSubarrays([2, 2, 2, 2, 5, 5, 5, 8], 3, 4)); // 3`,
            explain: <p>O(n) time. If you compare whole-number sums, you never work with decimal averages.</p>,
          },
        ]}
        compare={<p>It is a useful small trick to move a division to the other side of a comparison. (LeetCode 1343.)</p>}
      >
        <p>Count the windows of size <code>k</code> that have an average of at least <code>threshold</code>.</p>
      </Problem>

      <Problem
        n={4}
        title="K-radius averages"
        level="Medium"
        examples={[
          { input: "nums = [7, 4, 3, 9, 1, 8, 5, 2, 6], k = 3", output: "[-1, -1, -1, 5, 4, 4, -1, -1, -1]", why: "Index 3 averages indices 0..6: 37 / 7 = 5 (rounded down). An index with fewer than k neighbours on one side gets −1." },
          { input: "nums = [100000], k = 0", output: "[100000]", why: "k = 0: each value is its own average." },
        ]}
        hints={[<>The window around index c goes from c − k to c + k, so its size is 2k + 1.</>, <>Slide a window of size 2k + 1. When it ends at i, its centre is at i − k.</>]}
        approaches={[
          {
            name: "Fixed window of size 2k + 1",
            idea: <p>Fill the result with −1. Slide a window of size 2k + 1, and write each average at the centre of the window.</p>,
            code: `function getAverages(nums, k) {
  const size = 2 * k + 1;
  const out = new Array(nums.length).fill(-1);
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
    if (i >= size) sum -= nums[i - size];
    if (i >= size - 1) out[i - k] = Math.floor(sum / size);
  }
  return out;
}

console.log(getAverages([7, 4, 3, 9, 1, 8, 5, 2, 6], 3)); // [ -1, -1, -1, 5, 4, 4, -1, -1, -1 ]
console.log(getAverages([100000], 0));                    // [ 100000 ]`,
            explain: <p>O(n) time. The only new idea is this link: &ldquo;the window ends at i&rdquo; means &ldquo;the centre is i − k&rdquo;.</p>,
          },
        ]}
        compare={<p>Some problems describe a window by its centre and radius. First change that into a start and an end. (LeetCode 2090.)</p>}
      >
        <p>For each index, return the average (rounded down) of the values that are within distance <code>k</code> of it. Return −1 if there are fewer than k values on either side.</p>
      </Problem>

      <Problem
        n={5}
        title="Grumpy bookstore owner"
        level="Medium"
        examples={[
          {
            input: "customers = [1, 0, 1, 2, 1, 1, 7, 5], grumpy = [0, 1, 0, 1, 0, 1, 0, 1], minutes = 3",
            output: "16",
            why: "When the owner is not grumpy, the customers are always happy: 1 + 1 + 1 + 7 = 10. Using the calm technique on minutes 5–7 saves 1 + 5 = 6 more customers.",
          },
        ]}
        hints={[
          <>Split the answer in two parts: the customers who are happy anyway, plus the extra customers that the technique saves.</>,
          <>The extra customers are a window sum that counts only the grumpy minutes. Find the best window of size <code>minutes</code>.</>,
        ]}
        approaches={[
          {
            name: "Base sum + best window of gains",
            idea: <p>Use a window sum. An item counts only when the owner is grumpy at that minute.</p>,
            code: `function maxSatisfied(customers, grumpy, minutes) {
  let base = 0;
  for (let i = 0; i < customers.length; i++) {
    if (grumpy[i] === 0) base += customers[i];
  }
  let gain = 0, bestGain = 0;
  for (let i = 0; i < customers.length; i++) {
    if (grumpy[i] === 1) gain += customers[i];
    if (i >= minutes && grumpy[i - minutes] === 1) gain -= customers[i - minutes];
    bestGain = Math.max(bestGain, gain);
  }
  return base + bestGain;
}

console.log(maxSatisfied([1, 0, 1, 2, 1, 1, 7, 5], [0, 1, 0, 1, 0, 1, 0, 1], 3)); // 16`,
            explain: (
              <DryRun
                title="gain in each window of 3 minutes"
                cols={["Window", "Grumpy customers inside", "Gain"]}
                rows={[
                  ["0..2", "0", "0"],
                  ["1..3", "0 + 2", "2"],
                  ["2..4", "2", "2"],
                  ["3..5", "2 + 1", "3"],
                  ["4..6", "1", "1"],
                  ["5..7", "1 + 5", "6"],
                ]}
                highlight={5}
              />
            ),
          },
        ]}
        compare={<p>O(n) time. The key step is to separate the fixed part of the answer from the part that depends on the window. (LeetCode 1052.)</p>}
      >
        <p>
          At minute i, <code>customers[i]</code> people visit a shop. They are happy unless the owner is grumpy (<code>grumpy[i] = 1</code>).
          The owner can use a technique once to stay calm for <code>minutes</code> minutes in a row. Return the largest number of happy customers.
        </p>
      </Problem>

      <Problem
        n={6}
        title="Does any window contain a duplicate?"
        level="Easy"
        examples={[
          { input: "nums = [1, 2, 3, 1], k = 3", output: "true", why: "The two 1s are 3 positions apart. That is at most k = 3, so they fit in one window." },
          { input: "nums = [1, 2, 3, 1, 2, 3], k = 2", output: "false", why: "Equal values are always 3 apart, and 3 is more than k = 2." },
        ]}
        hints={[<>Keep a Set (a collection of different values) of the last k values. Before you add a value, check the Set.</>]}
        approaches={[
          {
            name: "Set as a sliding window",
            idea: <p>The Set holds the values of the previous k positions. Remove the value that moves out of range.</p>,
            code: `function containsNearbyDuplicate(nums, k) {
  const window = new Set();
  for (let i = 0; i < nums.length; i++) {
    if (window.has(nums[i])) return true;
    window.add(nums[i]);
    if (i >= k) window.delete(nums[i - k]);    // keep only the last k values
  }
  return false;
}

console.log(containsNearbyDuplicate([1, 2, 3, 1], 3));       // true
console.log(containsNearbyDuplicate([1, 2, 3, 1, 2, 3], 2)); // false`,
            explain: <p>O(n) time, O(k) space. Here the window state is a Set, not a sum. Lesson 26 solves the same problem with a Map of the last position of each value.</p>,
          },
        ]}
        compare={<p>Any data structure can be the window state, if it can add and remove one item in O(1). (LeetCode 219.)</p>}
      >
        <p>Return <code>true</code> if <code>nums</code> has two equal values that are at most <code>k</code> positions apart.</p>
      </Problem>
    </>
  );
}
