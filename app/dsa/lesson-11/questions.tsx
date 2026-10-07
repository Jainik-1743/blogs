import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 11 practice questions. Each one rewards reading the statement and constraints carefully. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Missing number"
        level="Easy"
        examples={[
          { input: "[3, 0, 1]", output: "2", why: "n = 3, so the numbers should be 0, 1, 2, 3. Only 2 is missing." },
          { input: "[0, 1]", output: "2", why: "n = 2, so the range is 0 to 2. The missing one is 2 — the end of the range is a valid answer." },
          { input: "[9, 6, 4, 2, 3, 5, 7, 0, 1]", output: "8", why: "n = 9, range 0 to 9, and 8 is the only value not present." },
        ]}
        hints={[
          <>Read the constraints: the values are <strong>distinct</strong> and come from <code>0</code> to <code>n</code>, where <code>n</code> is the array length. Exactly one is missing.</>,
          <>You know exactly which numbers <em>should</em> be there. What is their total?</>,
          <>The sum of 0 + 1 + … + n is <code>n * (n + 1) / 2</code>. Subtract the actual sum.</>,
        ]}
        approaches={[
          {
            name: "Check every candidate",
            idea: <p>For each number from 0 to n, check whether it is in the array. The first one that is not is the answer.</p>,
            code: `function missingNumber(nums) {
  const n = nums.length;
  for (let k = 0; k <= n; k++) {
    if (!nums.includes(k)) return k;
  }
}

console.log(missingNumber([3, 0, 1]));                    // 2
console.log(missingNumber([0, 1]));                       // 2
console.log(missingNumber([9, 6, 4, 2, 3, 5, 7, 0, 1]));  // 8`,
            explain: <p>The brute force. Correct, but <code>includes</code> is itself a loop over the array, so this is a loop inside a loop. Notice <code>k &lt;= n</code>, not <code>k &lt; n</code>: the second example shows the answer can be <code>n</code> itself.</p>,
          },
          {
            name: "Set of present values",
            idea: <p>Put every value into a Set once, then check 0 to n against the Set.</p>,
            code: `function missingNumber(nums) {
  const present = new Set(nums);
  for (let k = 0; k <= nums.length; k++) {
    if (!present.has(k)) return k;
  }
}

console.log(missingNumber([3, 0, 1])); // 2`,
            explain: <p>Each check is now instant, so the work is two simple passes. The cost is extra memory for the Set.</p>,
          },
          {
            name: "Expected sum minus actual sum",
            idea: (
              <ol>
                <li>The full range 0…n adds up to <code>n * (n + 1) / 2</code>.</li>
                <li>Add up the values actually present.</li>
                <li>The difference is the missing number.</li>
              </ol>
            ),
            code: `function missingNumber(nums) {
  const n = nums.length;
  let expected = (n * (n + 1)) / 2;
  let actual = 0;
  for (const x of nums) actual += x;
  return expected - actual;
}

console.log(missingNumber([3, 0, 1]));                    // 2
console.log(missingNumber([0, 1]));                       // 2
console.log(missingNumber([9, 6, 4, 2, 3, 5, 7, 0, 1]));  // 8`,
            explain: (
              <DryRun
                title="nums = [3, 0, 1]"
                cols={["Step", "Value"]}
                rows={[
                  ["n", "3"],
                  ["expected = 3 × 4 / 2", "6"],
                  ["actual = 3 + 0 + 1", "4"],
                  ["return 6 − 4", "2"],
                ]}
                highlight={3}
              />
            ),
          },
        ]}
        compare={<p>Approach 3 is the best answer: one pass and no extra memory. It only works because of the constraints — distinct values from exactly 0 to n. If the statement allowed duplicates, the sum trick would fail and you would use the Set. (LeetCode 268.)</p>}
      >
        <p>
          <code>nums</code> contains <code>n</code> distinct numbers taken from the range{" "}
          <code>0</code> to <code>n</code> (where <code>n</code> is the length of the array). Exactly
          one number from the range is missing. Return it.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Average of an array"
        level="Easy"
        examples={[
          { input: "[2, 4, 9]", output: "5", why: "(2 + 4 + 9) / 3 = 15 / 3 = 5." },
          { input: "[]", output: "0", why: "The statement says an empty array returns 0." },
        ]}
        hints={[
          <>The main case is easy. Which edge case does the statement mention explicitly?</>,
          <>What is <code>0 / 0</code> in JavaScript?</>,
        ]}
        approaches={[
          {
            name: "First attempt — and the bug",
            idea: <p>Add everything up and divide by the length.</p>,
            code: `function average(nums) {
  let sum = 0;
  for (const x of nums) sum += x;
  return sum / nums.length;
}

console.log(average([2, 4, 9])); // 5
console.log(average([]));        // NaN   ← wrong, should be 0`,
            explain: <p>For an empty array, <code>sum</code> is 0 and <code>nums.length</code> is 0. In JavaScript <code>0 / 0</code> is <code>NaN</code> (&ldquo;not a number&rdquo;) — no error is thrown, so this bug is easy to miss. Only testing the edge case finds it.</p>,
          },
          {
            name: "Handle the edge case first",
            idea: <p>Return early for the empty array, then do the normal calculation.</p>,
            code: `function average(nums) {
  if (nums.length === 0) return 0;
  let sum = 0;
  for (const x of nums) sum += x;
  return sum / nums.length;
}

console.log(average([2, 4, 9])); // 5
console.log(average([]));        // 0`,
            explain: <p>The early return (Lesson 7) keeps the edge case separate from the main logic, so both are easy to read.</p>,
          },
        ]}
        compare={<p>The lesson here is the habit, not the code: write the edge cases down first, with their expected answers, and test each one. A bug that throws no error is the hardest kind to notice.</p>}
      >
        <p>Return the average of the numbers in <code>nums</code>. If the array is empty, return <code>0</code>.</p>
      </Problem>

      <Problem
        n={3}
        title="Maximum product of two elements"
        level="Easy"
        examples={[
          { input: "[3, 4, 5, 2]", output: "12", why: "Choose 5 and 4: (5 − 1) × (4 − 1) = 4 × 3 = 12." },
          { input: "[1, 5, 4, 5]", output: "16", why: "Choose both 5s (different positions): 4 × 4 = 16. Duplicates are allowed." },
          { input: "[3, 7]", output: "12", why: "Only one pair: 2 × 6 = 12." },
        ]}
        hints={[
          <>Read the constraints: <code>2 &lt;= nums.length &lt;= 500</code> and <code>1 &lt;= nums[i] &lt;= 1000</code>. Can <code>nums[i] - 1</code> ever be negative?</>,
          <>If every factor is 0 or more, which two values give the biggest product?</>,
          <>Track the two largest values in one pass — but this time a repeated largest value <em>does</em> count (example 2).</>,
        ]}
        approaches={[
          {
            name: "Try every pair",
            idea: <p>Two nested loops over all pairs <code>i &lt; j</code>, keeping the best product.</p>,
            code: `function maxProduct(nums) {
  let best = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      best = Math.max(best, (nums[i] - 1) * (nums[j] - 1));
    }
  }
  return best;
}

console.log(maxProduct([3, 4, 5, 2])); // 12
console.log(maxProduct([1, 5, 4, 5])); // 16`,
            explain: <p>Correct, and with at most 500 values it is fast enough (about 125,000 pairs). Starting <code>best</code> at 0 is safe only because the constraints guarantee no negative products.</p>,
          },
          {
            name: "Sort, take the two largest",
            idea: <p>After sorting in increasing order, the two largest values are the last two.</p>,
            code: `function maxProduct(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const n = s.length;
  return (s[n - 1] - 1) * (s[n - 2] - 1);
}

console.log(maxProduct([3, 4, 5, 2])); // 12
console.log(maxProduct([1, 5, 4, 5])); // 16`,
            explain: <p>Short and clear. Copying with <code>[...nums]</code> leaves the caller&apos;s array unchanged.</p>,
          },
          {
            name: "One pass, top two",
            idea: <p>Keep the largest and second largest values while scanning once.</p>,
            code: `function maxProduct(nums) {
  let first = 0;
  let second = 0;
  for (const x of nums) {
    if (x > first) {
      second = first;
      first = x;
    } else if (x > second) {
      second = x;
    }
  }
  return (first - 1) * (second - 1);
}

console.log(maxProduct([3, 4, 5, 2])); // 12
console.log(maxProduct([1, 5, 4, 5])); // 16
console.log(maxProduct([3, 7]));       // 12`,
            explain: <p>Compare with the lesson&apos;s <code>secondLargest</code>: there we skipped a value equal to <code>first</code>; here it must go into <code>second</code>, because two equal values at different positions form a valid pair. Same pattern, different rule — and the examples told us which.</p>,
          },
        ]}
        compare={<p>Approach 3 does the least work; Approach 2 is perfectly fine for 500 values. Both rely on the constraint that every value is at least 1. Question 4 shows what happens when that constraint is removed. (LeetCode 1464.)</p>}
      >
        <p>
          Choose two different positions <code>i</code> and <code>j</code> and return the maximum value
          of <code>(nums[i] - 1) * (nums[j] - 1)</code>.
        </p>
        <p className="text-[0.9rem] text-ink-dim">Constraints: 2 ≤ nums.length ≤ 500, 1 ≤ nums[i] ≤ 1000.</p>
      </Problem>

      <Problem
        n={4}
        title="Maximum product of two numbers (negatives allowed)"
        level="Medium"
        examples={[
          { input: "[1, 5, 4, 5]", output: "25", why: "5 × 5 = 25." },
          { input: "[-10, -9, 1, 3]", output: "90", why: "Two negatives multiply to a positive: (−10) × (−9) = 90, which beats 1 × 3 = 3." },
          { input: "[-5, 2]", output: "-10", why: "Only one pair, so the answer is negative." },
        ]}
        hints={[
          <>The constraints now allow negative values. Is &ldquo;take the two largest&rdquo; still always right?</>,
          <>A negative times a negative is positive. Which two negatives give the biggest product?</>,
          <>The answer is either (largest × second largest) or (smallest × second smallest).</>,
        ]}
        approaches={[
          {
            name: "Try every pair",
            idea: <p>The same nested loops as before — but <code>best</code> cannot start at 0 any more.</p>,
            code: `function maxPairProduct(nums) {
  let best = -Infinity;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      best = Math.max(best, nums[i] * nums[j]);
    }
  }
  return best;
}

console.log(maxPairProduct([-10, -9, 1, 3])); // 90
console.log(maxPairProduct([-5, 2]));         // -10`,
            explain: <p>The brute force still works, which is exactly why it is useful: you can compare a faster solution against it. With <code>best = 0</code>, the last example would wrongly return 0.</p>,
          },
          {
            name: "Sort, compare both ends",
            idea: <p>After sorting, the two smallest values are at the start and the two largest at the end. Compare the two products.</p>,
            code: `function maxPairProduct(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const n = s.length;
  return Math.max(s[0] * s[1], s[n - 1] * s[n - 2]);
}

console.log(maxPairProduct([1, 5, 4, 5]));    // 25
console.log(maxPairProduct([-10, -9, 1, 3])); // 90
console.log(maxPairProduct([-5, 2]));         // -10`,
            explain: <p>Every other pair is beaten by one of these two. For the two-element case both products are the same pair, so the answer is still correct.</p>,
          },
          {
            name: "One pass, top two and bottom two",
            idea: <p>Track the two largest and the two smallest values in a single scan.</p>,
            code: `function maxPairProduct(nums) {
  let max1 = -Infinity, max2 = -Infinity;
  let min1 = Infinity, min2 = Infinity;
  for (const x of nums) {
    if (x > max1) { max2 = max1; max1 = x; }
    else if (x > max2) { max2 = x; }
    if (x < min1) { min2 = min1; min1 = x; }
    else if (x < min2) { min2 = x; }
  }
  return Math.max(max1 * max2, min1 * min2);
}

console.log(maxPairProduct([-10, -9, 1, 3])); // 90
console.log(maxPairProduct([-5, 2]));         // -10`,
            explain: <p>Two independent &ldquo;top two&rdquo; trackers in the same loop. Note the two separate <code>if</code> chains: one value can update both the maximums and the minimums.</p>,
          },
        ]}
        compare={<p>Compare this with Question 3. One changed line in the constraints (values can be negative) made the earlier solution wrong. This is why step 2 of the method — write down the constraints — comes before any code.</p>}
      >
        <p>
          Given an array of at least two integers, which may be negative, return the largest product
          of two numbers at different positions.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Third maximum number"
        level="Easy"
        examples={[
          { input: "[3, 2, 1]", output: "1", why: "The distinct values in order are 3, 2, 1. The third is 1." },
          { input: "[1, 2]", output: "2", why: "There is no third distinct value, so the statement says: return the maximum." },
          { input: "[2, 2, 3, 1]", output: "1", why: "Distinct values are 3, 2, 1 — the two 2s count once." },
        ]}
        hints={[
          <>Two phrases in the statement matter: &ldquo;distinct&rdquo; and &ldquo;if it does not exist&rdquo;.</>,
          <>Remove duplicates first, with a Set.</>,
          <>For one pass: extend the &ldquo;top two&rdquo; idea to a top three, skipping any value you already hold.</>,
        ]}
        approaches={[
          {
            name: "Set, then sort",
            idea: <p>Remove duplicates, sort from largest to smallest, and pick position 2 if it exists.</p>,
            code: `function thirdMax(nums) {
  const distinct = [...new Set(nums)].sort((a, b) => b - a);
  return distinct.length >= 3 ? distinct[2] : distinct[0];
}

console.log(thirdMax([3, 2, 1]));    // 1
console.log(thirdMax([1, 2]));       // 2
console.log(thirdMax([2, 2, 3, 1])); // 1`,
            explain: <p>A direct translation of the statement. Each phrase becomes one piece of code: &ldquo;distinct&rdquo; → Set, &ldquo;third&rdquo; → index 2, &ldquo;otherwise the maximum&rdquo; → index 0.</p>,
          },
          {
            name: "One pass, top three",
            idea: <p>Keep the three largest distinct values in <code>a</code> ≥ <code>b</code> ≥ <code>c</code>. Shift values down when a bigger one arrives.</p>,
            code: `function thirdMax(nums) {
  let a = -Infinity, b = -Infinity, c = -Infinity;
  for (const x of nums) {
    if (x === a || x === b || x === c) continue;   // already counted
    if (x > a) { c = b; b = a; a = x; }
    else if (x > b) { c = b; b = x; }
    else if (x > c) { c = x; }
  }
  return c === -Infinity ? a : c;
}

console.log(thirdMax([3, 2, 1]));    // 1
console.log(thirdMax([1, 2]));       // 2
console.log(thirdMax([2, 2, 3, 1])); // 1`,
            explain: (
              <DryRun
                title="nums = [2, 2, 3, 1]"
                cols={["x", "a", "b", "c", "what happened"]}
                rows={[
                  ["2", "2", "-Infinity", "-Infinity", "new largest"],
                  ["2", "2", "-Infinity", "-Infinity", "equal to a — skipped"],
                  ["3", "3", "2", "-Infinity", "new largest, 2 moves down"],
                  ["1", "3", "2", "1", "fills c"],
                ]}
                note="c is set, so the answer is c = 1."
              />
            ),
          },
        ]}
        compare={<p>Approach 1 is easier to get right and fine for interviews. Approach 2 uses only three variables and is a good follow-up if asked to avoid extra memory. (LeetCode 414.)</p>}
      >
        <p>
          Return the third largest <strong>distinct</strong> number in <code>nums</code>. If it does not
          exist, return the largest number.
        </p>
      </Problem>

      <Problem
        n={6}
        title="Find the added letter"
        level="Easy"
        examples={[
          { input: `s = "abcd", t = "abcde"`, output: `"e"`, why: "t is s plus the letter e." },
          { input: `s = "", t = "y"`, output: `"y"`, why: "Edge case: s is empty, so the only letter of t is the added one." },
          { input: `s = "a", t = "aa"`, output: `"a"`, why: "Edge case: the added letter can be one that already exists." },
        ]}
        hints={[
          <>The statement says t is a <strong>shuffle</strong> of s — so you cannot compare position by position.</>,
          <>Count the letters of t, then subtract the letters of s. Which count is left over?</>,
          <>Each letter has a character code. What is (sum of codes in t) − (sum of codes in s)?</>,
        ]}
        approaches={[
          {
            name: "Frequency map",
            idea: <p>Count every letter of s, then walk t and use the counts up. The first letter with no count left is the extra one.</p>,
            code: `function findTheDifference(s, t) {
  const freq = new Map();
  for (const ch of s) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  for (const ch of t) {
    const left = freq.get(ch) ?? 0;
    if (left === 0) return ch;
    freq.set(ch, left - 1);
  }
}

console.log(findTheDifference("abcd", "abcde")); // e
console.log(findTheDifference("", "y"));         // y
console.log(findTheDifference("a", "aa"));       // a`,
            explain: <p>The frequency map from Lesson 10. Example 3 is why we count, not just check membership: &ldquo;a&rdquo; is in s, but t has one more of it.</p>,
          },
          {
            name: "Sort both, compare",
            idea: <p>Sort the letters of both strings. They match position by position until the extra letter.</p>,
            code: `function findTheDifference(s, t) {
  const a = [...s].sort();
  const b = [...t].sort();
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return b[i];
  }
  return b[b.length - 1];   // the extra letter sorts to the end
}

console.log(findTheDifference("abcd", "abcde")); // e
console.log(findTheDifference("a", "aa"));       // a`,
            explain: <p>The final line handles the case where every letter of s matched — then the extra letter is the last one in sorted t.</p>,
          },
          {
            name: "Sum of character codes",
            idea: <p>Add up the codes of t, subtract the codes of s. Everything cancels except the extra letter.</p>,
            code: `function findTheDifference(s, t) {
  let total = 0;
  for (const ch of t) total += ch.charCodeAt(0);
  for (const ch of s) total -= ch.charCodeAt(0);
  return String.fromCharCode(total);
}

console.log(findTheDifference("abcd", "abcde")); // e
console.log(findTheDifference("", "y"));         // y`,
            explain: <p>This is the &ldquo;expected sum minus actual sum&rdquo; idea from Question 1, applied to letters. No extra memory at all.</p>,
          },
        ]}
        compare={<p>Approach 1 is the most general and the easiest to explain. Approach 3 is the shortest and uses no extra memory — mention it as an improvement. (LeetCode 389.)</p>}
      >
        <p>
          String <code>t</code> is made by shuffling string <code>s</code> and then adding one more
          letter at a random position. Return the added letter. Both contain lowercase letters only.
        </p>
      </Problem>

      <Problem
        n={7}
        title="Number of good pairs"
        level="Easy"
        examples={[
          { input: "[1, 2, 3, 1, 1, 3]", output: "4", why: "Pairs of positions with equal values: (0,3), (0,4), (3,4) for the 1s and (2,5) for the 3s." },
          { input: "[1, 1, 1, 1]", output: "6", why: "Every pair of the four positions counts: 4 × 3 / 2 = 6." },
          { input: "[1, 2, 3]", output: "0", why: "No value repeats." },
        ]}
        hints={[
          <>Brute force: check every pair <code>i &lt; j</code>. Write it first.</>,
          <>Look at the second example. When the fourth 1 arrives, how many new pairs does it make?</>,
          <>A new value makes one pair with every equal value seen before it. Keep counts in a Map.</>,
        ]}
        approaches={[
          {
            name: "Check every pair",
            idea: <p>Two nested loops; count pairs with equal values.</p>,
            code: `function numIdenticalPairs(nums) {
  let pairs = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] === nums[j]) pairs++;
    }
  }
  return pairs;
}

console.log(numIdenticalPairs([1, 2, 3, 1, 1, 3])); // 4
console.log(numIdenticalPairs([1, 1, 1, 1]));       // 6`,
            explain: <p>The brute force follows the statement word for word, so it is easy to trust. Use it to check the faster version.</p>,
          },
          {
            name: "Count as you go",
            idea: <p>For each value, add the number of times you have already seen it, then increase its count.</p>,
            code: `function numIdenticalPairs(nums) {
  const seen = new Map();
  let pairs = 0;
  for (const x of nums) {
    const before = seen.get(x) ?? 0;
    pairs += before;                 // pairs with every earlier equal value
    seen.set(x, before + 1);
  }
  return pairs;
}

console.log(numIdenticalPairs([1, 2, 3, 1, 1, 3])); // 4
console.log(numIdenticalPairs([1, 1, 1, 1]));       // 6
console.log(numIdenticalPairs([1, 2, 3]));          // 0`,
            explain: (
              <DryRun
                title="nums = [1, 1, 1, 1]"
                cols={["x", "seen before", "pairs"]}
                rows={[
                  ["1", "0", "0"],
                  ["1", "1", "1"],
                  ["1", "2", "3"],
                  ["1", "3", "6"],
                ]}
                highlight={3}
              />
            ),
          },
        ]}
        compare={<p>This is the &ldquo;brute force, then improve&rdquo; step in action: the nested loop repeats work by re-scanning earlier values; the Map remembers them instead. Lesson 12 shows how to measure the difference precisely. (LeetCode 1512.)</p>}
      >
        <p>
          A pair of positions <code>(i, j)</code> is <em>good</em> if <code>nums[i] === nums[j]</code>{" "}
          and <code>i &lt; j</code>. Return the number of good pairs.
        </p>
      </Problem>
    </>
  );
}
