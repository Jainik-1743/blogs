import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";
import CodeBlock from "@/components/sd/CodeBlock";

const snippets = `// A
for (let i = 0; i < n; i++)
  for (let j = 0; j < n; j++) work();

// B
for (let i = 0; i < n; i++) work();
for (let j = 0; j < n; j++) work();

// C
for (let i = 1; i < n; i *= 2) work();

// D
for (let i = 0; i < n; i++)
  for (let j = 0; j < i; j++) work();

// E
for (let i = 0; i < n; i++)
  for (let j = 0; j < 5; j++) work();

// F
for (const x of nums) if (other.includes(x)) work();   // both arrays have length n`;

/** Lesson 12 practice questions. Every answer states its time and space complexity. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Name the Big-O"
        level="Easy"
        examples={[
          { input: "A", output: "O(n²)", why: "A loop of n inside a loop of n: n × n." },
          { input: "B", output: "O(n)", why: "Two loops one after the other: n + n = 2n, and we drop the constant 2." },
          { input: "C", output: "O(log n)", why: "i doubles each time: 1, 2, 4, 8 … It reaches n after about log₂ n steps." },
          { input: "D", output: "O(n²)", why: "The inner loop runs 0, 1, 2, … n − 1 times. That is about n²/2 in total, which is still quadratic." },
          { input: "E", output: "O(n)", why: "The inner loop always runs 5 times (a constant). So the total is 5n, which is O(n)." },
          { input: "F", output: "O(n²)", why: "includes is a hidden loop over other. So the work is n × n." },
        ]}
        hints={[
          <>Loops one after another: add. One loop inside another: multiply.</>,
          <>An inner loop with a fixed limit (like 5) is a constant. It is not another n.</>,
          <>If the loop variable is multiplied by 2 each time, how many steps does it take to pass n?</>,
        ]}
        approaches={[
          {
            name: "Measure it",
            idea: <p>Count how many times <code>work()</code> runs for bigger and bigger n. Then see how the count changes when n is multiplied by 10.</p>,
            code: `function count(n) {
  const c = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c.A++;
  for (let i = 0; i < n; i++) c.B++;
  for (let j = 0; j < n; j++) c.B++;
  for (let i = 1; i < n; i *= 2) c.C++;
  for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) c.D++;
  for (let i = 0; i < n; i++) for (let j = 0; j < 5; j++) c.E++;
  return c;
}

console.log(count(10));   // { A: 100, B: 20, C: 4, D: 45, E: 50 }
console.log(count(100));  // { A: 10000, B: 200, C: 7, D: 4950, E: 500 }
console.log(count(1000)); // { A: 1000000, B: 2000, C: 10, D: 499500, E: 5000 }`,
            explain: <p>Each time n becomes 10 times bigger, A and D become about 100 times bigger (quadratic). B and E become 10 times bigger (linear). C grows by only about 3 (logarithmic). Measuring like this is a good way to check your thinking while you learn.</p>,
          },
          {
            name: "Reason from the shape",
            idea: <p>Look at the limit of each loop and how its variable changes. Then use the rules: add for loops one after another, multiply for loops inside loops.</p>,
            code: `// A  n × n                 → O(n²)
// B  n + n = 2n             → O(n)
// C  1, 2, 4 … < n          → O(log n)
// D  0 + 1 + … + (n-1)      → n(n-1)/2 → O(n²)
// E  n × 5                  → O(n)
// F  n × (includes: n)      → O(n²)`,
            explain: <p>This is what you do in an interview. You do not run the code. You only read its shape. All six snippets use only a few variables, so every one needs O(1) extra space.</p>,
          },
        ]}
        compare={<p>Most people get D and F wrong. D looks like &ldquo;half as much work&rdquo; as A, but halving is only a constant factor. F has only one loop that you can see, but <code>includes</code> is a second, hidden loop.</p>}
      >
        <p>Give the time complexity of each snippet. Assume <code>work()</code> is O(1).</p>
        <CodeBlock lang="js" code={snippets} />
      </Problem>

      <Problem
        n={2}
        title="Sum from 1 to n"
        level="Easy"
        examples={[
          { input: "5", output: "15", why: "1 + 2 + 3 + 4 + 5 = 15." },
          { input: "100000000", output: "5000000050000000", why: "n = 10⁸. A loop needs 100 million steps. The formula needs one." },
        ]}
        hints={[
          <>The loop is O(n). Is there a way that does not depend on n at all?</>,
          <>Pair the first and last numbers: 1 + n, 2 + (n − 1), and so on. Each pair adds up to n + 1. How many pairs are there?</>,
        ]}
        approaches={[
          {
            name: "Loop",
            idea: <p>Add every number from 1 to n to a running total (an accumulator).</p>,
            code: `function sumTo(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) total += i;
  return total;
}

console.log(sumTo(5)); // 15`,
            explain: <p>Time O(n), space O(1). For n = 10<sup>8</sup> this is 100 million additions. That takes roughly between a tenth of a second and a second in JavaScript.</p>,
          },
          {
            name: "Formula",
            idea: <p>There are n/2 pairs, and each pair adds up to n + 1. So the total is <code>n × (n + 1) / 2</code>.</p>,
            code: `function sumTo(n) {
  return (n * (n + 1)) / 2;
}

console.log(sumTo(5));         // 15
console.log(sumTo(100000000)); // 5000000050000000`,
            explain: <p>Time O(1), space O(1). It is one multiplication and one division, for any n. You used this formula in &ldquo;Missing number&rdquo; in Lesson 11.</p>,
          },
        ]}
        compare={<p>The constraints decide. If n ≤ 1,000, either way is fine. If n can be 10<sup>9</sup>, only the O(1) formula is acceptable. This is the &ldquo;10<sup>9</sup> or more&rdquo; row of the table.</p>}
      >
        <p>Return 1 + 2 + … + n. Constraints: 1 ≤ n ≤ 10<sup>8</sup>.</p>
      </Problem>

      <Problem
        n={3}
        title="Check if a number and its double exist"
        level="Easy"
        examples={[
          { input: "[10, 2, 5, 3]", output: "true", why: "10 is double 5 (at positions 0 and 2)." },
          { input: "[3, 1, 7, 11]", output: "false", why: "No value is double of another value." },
          { input: "[0, 0]", output: "true", why: "Edge case: 0 is double 0, and the two 0s are at different positions." },
          { input: "[0]", output: "false", why: "Edge case: a single 0 cannot pair with itself." },
        ]}
        hints={[
          <>Brute force: check every pair. What is its Big-O?</>,
          <>For each value x, which earlier values would make a match? Both <code>2 * x</code> and <code>x / 2</code> would.</>,
          <>Keep the earlier values in a Set, so that each check is O(1).</>,
        ]}
        approaches={[
          {
            name: "Check every pair",
            idea: <p>For every pair of different positions, check whether one value is double the other value.</p>,
            code: `function checkIfExist(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (i !== j && arr[i] === 2 * arr[j]) return true;
    }
  }
  return false;
}

console.log(checkIfExist([10, 2, 5, 3])); // true
console.log(checkIfExist([3, 1, 7, 11])); // false
console.log(checkIfExist([0, 0]));        // true
console.log(checkIfExist([0]));           // false`,
            explain: <p>Time O(n²), space O(1). The check <code>i !== j</code> is what makes <code>[0]</code> return false.</p>,
          },
          {
            name: "Set of values seen so far",
            idea: <p>For each value, ask the Set whether its double or its half was seen earlier. Then add the value to the Set.</p>,
            code: `function checkIfExist(arr) {
  const seen = new Set();
  for (const x of arr) {
    if (seen.has(2 * x) || seen.has(x / 2)) return true;
    seen.add(x);
  }
  return false;
}

console.log(checkIfExist([10, 2, 5, 3])); // true
console.log(checkIfExist([3, 1, 7, 11])); // false
console.log(checkIfExist([0, 0]));        // true
console.log(checkIfExist([0]));           // false`,
            explain: <p>Time O(n), space O(n). We check before we add, so a value is never matched with itself. That is why <code>[0]</code> gives false and <code>[0, 0]</code> gives true. (For an odd x, <code>x / 2</code> is a fraction, and a fraction is never in the Set.)</p>,
          },
        ]}
        compare={<p>With up to 500 values (the LeetCode limit), both pass. Still, give the Set version and say the trade: you use O(n) extra space to go from O(n²) to O(n) time. (LeetCode 1346.)</p>}
      >
        <p>
          Return <code>true</code> if there are two different positions <code>i</code> and{" "}
          <code>j</code> with <code>arr[i] === 2 * arr[j]</code>.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Intersection of two arrays"
        level="Easy"
        examples={[
          { input: "[1, 2, 2, 1], [2, 2]", output: "[2]", why: "2 is in both arrays. Each value appears once in the result." },
          { input: "[4, 9, 5], [9, 4, 9, 8, 4]", output: "[9, 4]", why: "4 and 9 are in both arrays. The statement says that any order is accepted." },
        ]}
        hints={[
          <>There are two inputs, with lengths n and m. Use both letters in your Big-O.</>,
          <>Look for hidden loops. <code>includes</code> inside a loop is O(n × m).</>,
          <>Put one array into a Set. Then walk through the other array.</>,
        ]}
        approaches={[
          {
            name: "includes inside a loop",
            idea: <p>For each value of the first array, check the second array with <code>includes</code>. Do not add a value twice.</p>,
            code: `function intersection(nums1, nums2) {
  const result = [];
  for (const x of nums1) {
    if (nums2.includes(x) && !result.includes(x)) result.push(x);
  }
  return result;
}

console.log(intersection([1, 2, 2, 1], [2, 2]));       // [ 2 ]
console.log(intersection([4, 9, 5], [9, 4, 9, 8, 4])); // [ 4, 9 ]`,
            explain: <p>Time O(n × m), because of the hidden loop. There is also another hidden loop in <code>result.includes</code>. Space is O(1) beyond the result. The code is short, but it is slow for large inputs.</p>,
          },
          {
            name: "Two Sets",
            idea: <p>Turn the first array into a Set. Walk through the second array. Collect the matches in another Set, so that duplicates disappear.</p>,
            code: `function intersection(nums1, nums2) {
  const inFirst = new Set(nums1);
  const result = new Set();
  for (const x of nums2) {
    if (inFirst.has(x)) result.add(x);
  }
  return [...result];
}

console.log(intersection([1, 2, 2, 1], [2, 2]));       // [ 2 ]
console.log(intersection([4, 9, 5], [9, 4, 9, 8, 4])); // [ 9, 4 ]`,
            explain: <p>Time O(n + m): one pass to build the Set and one pass to check. Space O(n) for the Set.</p>,
          },
          {
            name: "Sort both, walk together",
            idea: <p>Sort both arrays. Then use one position (a pointer) in each array. Always move the pointer that points to the smaller value.</p>,
            code: `function intersection(nums1, nums2) {
  const a = [...nums1].sort((x, y) => x - y);
  const b = [...nums2].sort((x, y) => x - y);
  const result = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] < b[j]) i++;
    else if (a[i] > b[j]) j++;
    else {
      if (result[result.length - 1] !== a[i]) result.push(a[i]);
      i++;
      j++;
    }
  }
  return result;
}

console.log(intersection([4, 9, 5], [9, 4, 9, 8, 4])); // [ 4, 9 ]`,
            explain: <p>Time O(n log n + m log m) for the sorting. The walk itself is only O(n + m). This is a first look at the two-pointer pattern (Lesson 21).</p>,
          },
        ]}
        compare={<p>Two Sets is the standard answer. It is the fastest and it is easy to explain. If the interviewer adds &ldquo;both arrays are already sorted&rdquo;, Approach 3 needs only O(n + m) time and no Set. (LeetCode 349.)</p>}
      >
        <p>
          Return an array of the values that appear in both <code>nums1</code> and <code>nums2</code>.
          Each value must appear only once in the result, in any order.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Count the digits"
        level="Easy"
        examples={[
          { input: "7", output: "1", why: "One digit." },
          { input: "12345", output: "5", why: "Five digits." },
          { input: "0", output: "1", why: "Edge case: 0 still has one digit, even though the loop would not run for 0." },
        ]}
        hints={[
          <>Use the digit loop from Lesson 5: divide by 10 until nothing is left.</>,
          <>How many times can you divide n by 10? The answer is a logarithm.</>,
        ]}
        approaches={[
          {
            name: "Divide by 10",
            idea: <p>Remove the last digit with <code>Math.floor(n / 10)</code> (it divides by 10 and rounds down). Repeat until n is 0, and count each removal.</p>,
            code: `function countDigits(n) {
  if (n === 0) return 1;
  let count = 0;
  while (n > 0) {
    n = Math.floor(n / 10);
    count++;
  }
  return count;
}

console.log(countDigits(7));     // 1
console.log(countDigits(12345)); // 5
console.log(countDigits(0));     // 1`,
            explain: (
              <DryRun
                title="countDigits(12345)"
                cols={["n", "count"]}
                rows={[
                  ["12345", "0"],
                  ["1234", "1"],
                  ["123", "2"],
                  ["12", "3"],
                  ["1", "4"],
                  ["0", "5"],
                ]}
                highlight={5}
                note="Time O(log n): the loop runs once per digit, and a number n has about log₁₀ n digits. Space O(1)."
              />
            ),
          },
          {
            name: "Convert to a string",
            idea: <p>Turn the number into a string with <code>String(n)</code>. The length of the string is the number of digits.</p>,
            code: `function countDigits(n) {
  return String(n).length;
}

console.log(countDigits(12345)); // 5
console.log(countDigits(0));     // 1`,
            explain: <p>This is also O(log n), because building the string still visits every digit. The work is just hidden inside <code>String</code>. Space is O(log n) for the string.</p>,
          },
          {
            name: "Logarithm formula",
            idea: <p>A number with d digits is at least 10<sup>d−1</sup> and less than 10<sup>d</sup>. So d = <code>floor(log₁₀ n) + 1</code>. (<code>floor</code> rounds down.)</p>,
            code: `function countDigits(n) {
  if (n === 0) return 1;
  return Math.floor(Math.log10(n)) + 1;
}

console.log(countDigits(7));     // 1
console.log(countDigits(12345)); // 5
console.log(countDigits(1000));  // 4`,
            explain: <p>This shows exactly where the &ldquo;log&rdquo; comes from: the digit count is based on the logarithm. <code>Math.log10(0)</code> is <code>-Infinity</code>, so 0 still needs its own check. (Computers store decimals with tiny rounding errors. For n up to 10<sup>9</sup> this formula is fine, but Approach 1 never has this risk.)</p>,
          },
        ]}
        compare={<p>All three are correct. In an interview, give Approach 1 and say &ldquo;O(log n) time, because each step removes one digit&rdquo;. That sentence is the point of the question. (Related: LeetCode 1295.)</p>}
      >
        <p>Given a whole number <code>n</code> (0 ≤ n ≤ 10<sup>9</sup>), return how many digits it has.</p>
      </Problem>

      <Problem
        n={6}
        title="Reverse an array — time and space"
        level="Easy"
        examples={[
          { input: "[1, 2, 3, 4, 5]", output: "[5, 4, 3, 2, 1]", why: "The order is reversed." },
          { input: "[]", output: "[]", why: "Edge case: nothing to reverse." },
        ]}
        hints={[
          <>Both obvious solutions take O(n) time. Compare how much extra memory they use.</>,
          <>Swap the first and last items. Then swap the second and the second from last, and move inwards.</>,
        ]}
        approaches={[
          {
            name: "Build a new array",
            idea: <p>Walk from the end to the start. Push each item into a new array.</p>,
            code: `function reversed(nums) {
  const out = [];
  for (let i = nums.length - 1; i >= 0; i--) out.push(nums[i]);
  return out;
}

console.log(reversed([1, 2, 3, 4, 5])); // [ 5, 4, 3, 2, 1 ]
console.log(reversed([]));              // []`,
            explain: <p>Time O(n), space O(n) for the new array. The original array is unchanged. Sometimes that is exactly what you want.</p>,
          },
          {
            name: "Swap in place",
            idea: <p>Use two positions, one at each end. Swap their items. Move both positions inwards until they meet.</p>,
            code: `function reverseInPlace(nums) {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    const tmp = nums[left];
    nums[left] = nums[right];
    nums[right] = tmp;
    left++;
    right--;
  }
  return nums;
}

console.log(reverseInPlace([1, 2, 3, 4, 5])); // [ 5, 4, 3, 2, 1 ]
console.log(reverseInPlace([]));              // []`,
            explain: <p>Time O(n), because there are about n/2 swaps. Space O(1), because it uses only <code>left</code>, <code>right</code> and <code>tmp</code>, however big the array is.</p>,
          },
        ]}
        compare={<p>The time is the same, but the space is different. If the statement says &ldquo;in place&rdquo; or &ldquo;O(1) extra space&rdquo;, only Approach 2 is accepted. If it says &ldquo;do not modify the input&rdquo;, only Approach 1 is accepted. This is a clarifying question that is worth asking (Lesson 11).</p>}
      >
        <p>Reverse the order of the items in <code>nums</code>. Give the time and the extra space of each solution.</p>
      </Problem>

      <Problem
        n={7}
        title="Find all missing numbers"
        level="Medium"
        examples={[
          { input: "[4, 3, 2, 7, 8, 2, 3, 1]", output: "[5, 6]", why: "n = 8, so the values should be 1 to 8. The numbers 5 and 6 never appear (2 and 3 appear twice)." },
          { input: "[1, 1]", output: "[2]", why: "n = 2: 2 is missing." },
        ]}
        hints={[
          <>Brute force: for each k from 1 to n, check <code>nums.includes(k)</code>. What is the Big-O?</>,
          <>A Set of the values that are present gives O(n) time with O(n) space.</>,
          <>For O(1) extra space: every value v points to position v − 1. Mark that position by making its number negative. A position that is still positive at the end was never pointed to.</>,
        ]}
        approaches={[
          {
            name: "includes for each candidate",
            idea: <p>For every number from 1 to n, check with <code>includes</code> whether it is in the array.</p>,
            code: `function findDisappearedNumbers(nums) {
  const result = [];
  for (let k = 1; k <= nums.length; k++) {
    if (!nums.includes(k)) result.push(k);
  }
  return result;
}

console.log(findDisappearedNumbers([4, 3, 2, 7, 8, 2, 3, 1])); // [ 5, 6 ]`,
            explain: <p>Time O(n²), because there are n candidates and each one has a hidden O(n) search. Space O(1). With n up to 10<sup>5</sup>, that is about 10<sup>10</sup> steps, which is too slow.</p>,
          },
          {
            name: "Set of present values",
            idea: <p>Put all values in a Set. Then check each number from 1 to n.</p>,
            code: `function findDisappearedNumbers(nums) {
  const present = new Set(nums);
  const result = [];
  for (let k = 1; k <= nums.length; k++) {
    if (!present.has(k)) result.push(k);
  }
  return result;
}

console.log(findDisappearedNumbers([4, 3, 2, 7, 8, 2, 3, 1])); // [ 5, 6 ]
console.log(findDisappearedNumbers([1, 1]));                   // [ 2 ]`,
            explain: <p>Time O(n), space O(n). Most interviewers expect this answer first.</p>,
          },
          {
            name: "Mark positions in place",
            idea: (
              <ol>
                <li>For each value v, make the number at position <code>v − 1</code> negative (if it is not already negative).</li>
                <li>Use <code>Math.abs</code> (it removes the minus sign) when you read a value, because earlier steps may have made it negative.</li>
                <li>If position i is still positive at the end, the value <code>i + 1</code> never appeared.</li>
              </ol>
            ),
            code: `function findDisappearedNumbers(nums) {
  for (const x of nums) {
    const i = Math.abs(x) - 1;
    if (nums[i] > 0) nums[i] = -nums[i];
  }
  const result = [];
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] > 0) result.push(i + 1);
  }
  return result;
}

console.log(findDisappearedNumbers([4, 3, 2, 7, 8, 2, 3, 1])); // [ 5, 6 ]
console.log(findDisappearedNumbers([1, 1]));                   // [ 2 ]`,
            explain: <p>Time O(n), extra space O(1). The result array is the output, so we do not count it. The cost is that the input array is changed. So ask first whether that is allowed.</p>,
          },
        ]}
        compare={<p>This is a good example of trading space for time, and then trading back. The three solutions are O(n²) time and O(1) space, then O(n) time and O(n) space, then O(n) time and O(1) space. Give the Set version first. Mention the in-place version if the interviewer asks for O(1) extra space. (LeetCode 448.)</p>}
      >
        <p>
          <code>nums</code> has <code>n</code> values, each between <code>1</code> and <code>n</code>.
          Some values appear twice and some do not appear at all. Return every number from 1 to n that
          does not appear.
        </p>
      </Problem>
    </>
  );
}
