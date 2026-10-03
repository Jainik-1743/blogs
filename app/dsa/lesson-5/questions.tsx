import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 5 practice questions. Every question shows each way to solve it. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Count the digits"
        level="Easy"
        examples={[
          { input: "4729", output: "4", why: "4729 has the digits 4, 7, 2 and 9." },
          { input: "7", output: "1", why: "A one-digit number." },
          { input: "0", output: "1", why: "Edge case: 0 is written with one digit." },
        ]}
        hints={[
          <>Each time you divide by 10 (and drop the decimal part), the number loses one digit.</>,
          <>Count how many times you can do that before the number becomes 0. Be careful with the input 0 itself.</>,
        ]}
        approaches={[
          {
            name: "Divide by 10 until nothing is left",
            idea: <p>Remove one digit per iteration with <code>Math.floor(n / 10)</code> and count the iterations.</p>,
            code: `function countDigits(n) {
  if (n === 0) return 1;       // the loop below would not run for 0
  let count = 0;
  while (n > 0) {
    count++;
    n = Math.floor(n / 10);
  }
  return count;
}

console.log(countDigits(4729)); // 4
console.log(countDigits(7));    // 1
console.log(countDigits(0));    // 1`,
            explain: (
              <DryRun title="countDigits(4729)" cols={["n at check", "count after", "n after"]} rows={[["4729", "1", "472"], ["472", "2", "47"], ["47", "3", "4"], ["4", "4", "0"], ["0", "(loop ends)", ""]]} highlight={4} />
            ),
          },
          {
            name: "Convert to text and measure its length",
            idea: <p>The number of digits is the number of characters in the number written as text.</p>,
            code: `function countDigits(n) {
  return String(n).length;
}

console.log(countDigits(4729)); // 4
console.log(countDigits(0));    // 1`,
            explain: <p><code>String(4729)</code> is <code>&quot;4729&quot;</code>, which has length 4. Short and correct for non-negative whole numbers.</p>,
          },
          {
            name: "Logarithm",
            idea: <p>A number with k digits is between 10<sup>k−1</sup> and 10<sup>k</sup>, so k = ⌊log₁₀ n⌋ + 1.</p>,
            code: `function countDigits(n) {
  if (n === 0) return 1;
  return Math.floor(Math.log10(n)) + 1;
}

console.log(countDigits(4729)); // 4
console.log(countDigits(1000)); // 4`,
            explain: <p><code>Math.log10(4729)</code> is about 3.67; rounding down gives 3, plus 1 gives 4. This is a maths shortcut — good to know, not required.</p>,
          },
        ]}
        compare={<p>Learn Approach 1: it is the digit loop that every other question in this list builds on. Approach 2 is fine in everyday code.</p>}
      >
        <p>Count how many digits a non-negative whole number has.</p>
      </Problem>

      <Problem
        n={2}
        title="Sum of digits"
        level="Easy"
        examples={[
          { input: "4729", output: "22", why: "4 + 7 + 2 + 9 = 22." },
          { input: "5", output: "5", why: "Only one digit." },
        ]}
        hints={[<>Use the digit loop. Each iteration gives you the last digit with <code>n % 10</code>.</>, <>Add that digit to a sum, then remove it with <code>Math.floor(n / 10)</code>.</>]}
        approaches={[
          {
            name: "Digit loop",
            idea: <p>Take the last digit, add it, remove it — repeat while digits remain.</p>,
            code: `function sumDigits(n) {
  let sum = 0;
  while (n > 0) {
    sum += n % 10;
    n = Math.floor(n / 10);
  }
  return sum;
}

console.log(sumDigits(4729)); // 22`,
            explain: <p>This is the traced example from the lesson, wrapped in a function. It works for a number of any length.</p>,
          },
          {
            name: "Loop over the characters of the text",
            idea: <p>Write the number as text and add up each character as a number.</p>,
            code: `function sumDigits(n) {
  let sum = 0;
  for (const ch of String(n)) {
    sum += Number(ch);
  }
  return sum;
}

console.log(sumDigits(4729)); // 22`,
            explain: <p><code>for (const ch of text)</code> visits every character (Lesson 9). <code>Number(&quot;7&quot;)</code> turns the character into the number 7.</p>,
          },
        ]}
        compare={<p>Interviewers usually expect Approach 1, because it works with numbers only. Approach 2 is also correct and easy to read.</p>}
      >
        <p>Find the sum of the digits of n.</p>
      </Problem>

      <Problem
        n={3}
        title="Reverse a number"
        level="Easy"
        examples={[
          { input: "1234", output: "4321", why: "The digits in the opposite order." },
          { input: "1200", output: "21", why: "Reversed, the digits are 0021. Leading zeros are not written in a number, so the answer is 21." },
        ]}
        hints={[
          <>Take the digits off from the right, one at a time.</>,
          <>To add a digit to the end of a number <code>rev</code>, multiply <code>rev</code> by 10 and add the digit: <code>rev = rev * 10 + digit</code>.</>,
        ]}
        approaches={[
          {
            name: "Build the reverse digit by digit",
            idea: <p>Take the last digit of n and attach it to the end of <code>rev</code>; repeat until n is 0.</p>,
            code: `function reverseNumber(n) {
  let rev = 0;
  while (n > 0) {
    rev = rev * 10 + (n % 10);
    n = Math.floor(n / 10);
  }
  return rev;
}

console.log(reverseNumber(1234)); // 4321
console.log(reverseNumber(1200)); // 21`,
            explain: (
              <DryRun title="reverseNumber(1234)" cols={["n", "digit", "rev = rev × 10 + digit"]} rows={[["1234", "4", "4"], ["123", "3", "43"], ["12", "2", "432"], ["1", "1", "4321"]]} highlight={3} />
            ),
          },
          {
            name: "Reverse the text",
            idea: <p>Turn the number into text, reverse the characters, and turn it back into a number.</p>,
            code: `function reverseNumber(n) {
  return Number(String(n).split("").reverse().join(""));
}

console.log(reverseNumber(1234)); // 4321
console.log(reverseNumber(1200)); // 21`,
            explain: <p><code>split(&quot;&quot;)</code> makes a list of characters, <code>reverse()</code> reverses the list and <code>join(&quot;&quot;)</code> joins it back into text. <code>Number(&quot;0021&quot;)</code> is 21.</p>,
          },
        ]}
        compare={<p>Approach 1 is the expected interview answer. LeetCode 7 (Reverse Integer) adds negative numbers and a size limit — handle the sign separately and check the limit before returning.</p>}
      >
        <p>Reverse the digits of a positive number.</p>
      </Problem>

      <Problem
        n={4}
        title="Palindrome number"
        level="Easy"
        examples={[
          { input: "121", output: "true", why: "Reversed, 121 is still 121." },
          { input: "123", output: "false", why: "Reversed, 123 is 321, which is different." },
          { input: "10", output: "false", why: "Reversed, 10 is 01, which is 1." },
        ]}
        hints={[<>A palindrome equals its own reverse. You already know how to reverse a number.</>, <>The digit loop changes n. Save a copy of the original before the loop so you can compare at the end.</>]}
        approaches={[
          {
            name: "Reverse it and compare",
            idea: <p>Build the reverse of n, then check whether it equals the original.</p>,
            code: `function isPalindromeNumber(n) {
  const original = n;          // the loop will change n
  let rev = 0;
  while (n > 0) {
    rev = rev * 10 + (n % 10);
    n = Math.floor(n / 10);
  }
  return rev === original;
}

console.log(isPalindromeNumber(121));  // true
console.log(isPalindromeNumber(123));  // false
console.log(isPalindromeNumber(10));   // false`,
            explain: <p>A common bug is comparing <code>rev === n</code> after the loop. By then n is 0. Saving <code>original</code> first fixes it.</p>,
          },
          {
            name: "Compare digits from both ends as text",
            idea: <p>Write the number as text. Compare the first and last characters, then move both inwards.</p>,
            code: `function isPalindromeNumber(n) {
  const s = String(n);
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}

console.log(isPalindromeNumber(1221)); // true
console.log(isPalindromeNumber(123));  // false`,
            explain: <p>This is the <strong>two pointers</strong> technique you will meet again in Lessons 8, 9 and 21. It stops at the first mismatch.</p>,
          },
          {
            name: "Reverse only half of the number",
            idea: <p>Move digits from n into rev until rev is at least as large as n. Then compare the two halves.</p>,
            code: `function isPalindromeNumber(n) {
  if (n < 0 || (n % 10 === 0 && n !== 0)) return false;   // e.g. 10, 120
  let rev = 0;
  while (n > rev) {
    rev = rev * 10 + (n % 10);
    n = Math.floor(n / 10);
  }
  // even length: n === rev;  odd length: drop the middle digit from rev
  return n === rev || n === Math.floor(rev / 10);
}

console.log(isPalindromeNumber(1221));  // true
console.log(isPalindromeNumber(12321)); // true
console.log(isPalindromeNumber(10));    // false`,
            explain: <p>For 12321: after three iterations n = 12 and rev = 123; <code>Math.floor(123 / 10)</code> = 12 = n, so it is a palindrome. Only half the digits are processed, and the reversed number can never become too large. This is the follow-up answer for LeetCode 9.</p>,
          },
        ]}
        compare={<p>Start with Approach 1 — it is clear and correct. If asked to avoid converting to text, Approach 1 or 3 is required; Approach 3 is the most efficient.</p>}
      >
        <p>Return <code>true</code> if the number reads the same forwards and backwards. (LeetCode 9.)</p>
      </Problem>

      <Problem
        n={5}
        title="Smallest power of 2 that is at least N"
        level="Easy"
        examples={[
          { input: "20", output: "32", why: "The powers of 2 are 1, 2, 4, 8, 16, 32 … 16 is too small; 32 is the first one ≥ 20." },
          { input: "64", output: "64", why: "64 is already a power of 2." },
          { input: "1", output: "1", why: "1 is 2⁰." },
        ]}
        hints={[<>You do not know how many doublings you need — only when to stop. Which loop fits?</>, <>Start at 1 and double while the value is still smaller than N.</>]}
        approaches={[
          {
            name: "Keep doubling",
            idea: <p>Start at 1 and multiply by 2 until the value is at least N.</p>,
            code: `function nextPowerOfTwo(N) {
  let p = 1;
  while (p < N) {
    p *= 2;
  }
  return p;
}

console.log(nextPowerOfTwo(20)); // 32
console.log(nextPowerOfTwo(64)); // 64
console.log(nextPowerOfTwo(1));  // 1`,
            explain: <p>Use <code>p &lt; N</code>, not <code>p &lt;= N</code>; otherwise for N = 64 the loop doubles once more and returns 128.</p>,
          },
          {
            name: "Logarithm",
            idea: <p>The exponent needed is ⌈log₂ N⌉, so the answer is 2 raised to that power.</p>,
            code: `function nextPowerOfTwo(N) {
  return 2 ** Math.ceil(Math.log2(N));
}

console.log(nextPowerOfTwo(20)); // 32
console.log(nextPowerOfTwo(64)); // 64`,
            explain: <p><code>Math.log2(20)</code> is about 4.32; rounding up gives 5, and 2⁵ = 32. A one-line maths shortcut.</p>,
          },
        ]}
        compare={<p>Approach 1 is the clearest example of when to use <code>while</code>. Approach 2 is shorter but depends on remembering the maths.</p>}
      >
        <p>Find the smallest power of 2 (1, 2, 4, 8, …) that is greater than or equal to N.</p>
      </Problem>

      <Problem
        n={6}
        title="Count the even digits"
        level="Easy"
        examples={[
          { input: "4729", output: "2", why: "The digits 4 and 2 are even; 7 and 9 are odd." },
          { input: "2468", output: "4", why: "Every digit is even." },
        ]}
        hints={[<>Use the digit loop to visit each digit.</>, <>Inside the loop, add 1 to a counter when the digit is even.</>]}
        approaches={[
          {
            name: "Digit loop with an if",
            idea: <p>Take each digit with <code>n % 10</code>; count it if <code>digit % 2 === 0</code>.</p>,
            code: `function countEvenDigits(n) {
  let count = 0;
  while (n > 0) {
    const digit = n % 10;
    if (digit % 2 === 0) count++;
    n = Math.floor(n / 10);
  }
  return count;
}

console.log(countEvenDigits(4729)); // 2
console.log(countEvenDigits(2468)); // 4`,
            explain: <p>Lessons 3 and 5 combined: a condition inside the digit loop. Most real problems are small building blocks like this, combined.</p>,
          },
          {
            name: "Loop over the characters",
            idea: <p>Check each character of the number written as text.</p>,
            code: `function countEvenDigits(n) {
  let count = 0;
  for (const ch of String(n)) {
    if (Number(ch) % 2 === 0) count++;
  }
  return count;
}

console.log(countEvenDigits(4729)); // 2`,
            explain: <p>The same idea, reading digits from left to right instead of right to left. The order does not matter for counting.</p>,
          },
        ]}
        compare={<p>Both are correct. Approach 1 uses only arithmetic, which is what most interviewers expect for digit questions.</p>}
      >
        <p>How many digits of n are even?</p>
      </Problem>

      <Problem
        n={7}
        title="Armstrong number"
        level="Medium"
        examples={[
          { input: "153", output: "true", why: "3 digits: 1³ + 5³ + 3³ = 1 + 125 + 27 = 153." },
          { input: "9474", output: "true", why: "4 digits: 9⁴ + 4⁴ + 7⁴ + 4⁴ = 6561 + 256 + 2401 + 256 = 9474." },
          { input: "123", output: "false", why: "1³ + 2³ + 3³ = 36, which is not 123." },
        ]}
        hints={[
          <>You need two things: the number of digits k, and the sum of each digit raised to the power k.</>,
          <>Do it in two passes. The first pass counts digits on a copy of n; the second pass builds the sum.</>,
        ]}
        approaches={[
          {
            name: "Two digit loops",
            idea: (
              <ol>
                <li>Count the digits (k) using a copy of n.</li>
                <li>Loop again, adding each digit to the power k.</li>
                <li>Compare the sum with the original number.</li>
              </ol>
            ),
            code: `function isArmstrong(n) {
  const original = n;

  let k = 0, temp = n;           // pass 1: count digits on a copy
  while (temp > 0) {
    k++;
    temp = Math.floor(temp / 10);
  }

  let sum = 0;                   // pass 2: sum of digit^k
  while (n > 0) {
    sum += (n % 10) ** k;
    n = Math.floor(n / 10);
  }
  return sum === original;
}

console.log(isArmstrong(153));  // true
console.log(isArmstrong(9474)); // true
console.log(isArmstrong(123));  // false`,
            explain: <p>The first loop uses its own copy (<code>temp</code>) so that <code>n</code> is still unchanged when the second loop runs. Splitting a problem into two simple passes is a perfectly good interview answer.</p>,
          },
          {
            name: "Use the text length for k",
            idea: <p>Get the digit count from the text form, then do a single digit loop.</p>,
            code: `function isArmstrong(n) {
  const k = String(n).length;
  let sum = 0, temp = n;
  while (temp > 0) {
    sum += (temp % 10) ** k;
    temp = Math.floor(temp / 10);
  }
  return sum === n;
}

console.log(isArmstrong(153)); // true
console.log(isArmstrong(370)); // true`,
            explain: <p>Shorter: one loop instead of two. Working on <code>temp</code> keeps <code>n</code> available for the final comparison.</p>,
          },
        ]}
        compare={<p>Both are correct. Approach 2 is shorter; Approach 1 shows you can do everything with arithmetic, which some interviewers ask for.</p>}
      >
        <p>An Armstrong number equals the sum of its digits, each raised to the power of the number of digits. Check whether n is one.</p>
      </Problem>

      <Problem
        n={8}
        title="Collatz steps"
        level="Medium"
        examples={[
          { input: "6", output: "8", why: "6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1 is 8 steps." },
          { input: "1", output: "0", why: "Already 1, so no steps are needed." },
        ]}
        hints={[<>You cannot know the number of steps in advance — n sometimes goes up. Which loop fits?</>, <>Loop while <code>n !== 1</code>. Inside, apply the even or odd rule and count one step.</>]}
        approaches={[
          {
            name: "while with if / else",
            idea: <p>Repeat until n is 1: halve it if even, otherwise make it 3n + 1, and count the step.</p>,
            code: `function collatzSteps(n) {
  let steps = 0;
  while (n !== 1) {
    if (n % 2 === 0) {
      n = n / 2;
    } else {
      n = 3 * n + 1;
    }
    steps++;
  }
  return steps;
}

console.log(collatzSteps(6)); // 8
console.log(collatzSteps(1)); // 0`,
            explain: <p>The clearest case for <code>while</code>: the only thing you know is the stopping condition.</p>,
          },
          {
            name: "while with a ternary update",
            idea: <p>The same loop, choosing the next value in one line.</p>,
            code: `function collatzSteps(n) {
  let steps = 0;
  while (n !== 1) {
    n = n % 2 === 0 ? n / 2 : 3 * n + 1;
    steps++;
  }
  return steps;
}

console.log(collatzSteps(6)); // 8`,
            explain: <p>Shorter, and the update is in one place, which makes it easy to check that n changes on every iteration.</p>,
          },
        ]}
        compare={<p>Either is fine. Use the version that you find easier to read aloud.</p>}
      >
        <p>If n is even, halve it; if odd, make it 3n + 1. Count the steps until n becomes 1.</p>
      </Problem>

      <Problem
        n={9}
        title="Greatest common divisor (GCD)"
        level="Medium"
        examples={[
          { input: "48, 18", output: "6", why: "The divisors of 18 are 1, 2, 3, 6, 9, 18. The largest that also divides 48 is 6." },
          { input: "17, 5", output: "1", why: "17 and 5 share no divisor other than 1." },
        ]}
        hints={[
          <>Simple idea: try every number from the smaller input down to 1, and stop at the first one that divides both.</>,
          <>Faster idea (Euclid): gcd(a, b) = gcd(b, a % b), and gcd(a, 0) = a.</>,
        ]}
        approaches={[
          {
            name: "Try every candidate, largest first",
            idea: <p>Start at the smaller of the two numbers and count down. The first number that divides both is the answer.</p>,
            code: `function gcd(a, b) {
  for (let d = Math.min(a, b); d >= 1; d--) {
    if (a % d === 0 && b % d === 0) return d;
  }
  return 1;
}

console.log(gcd(48, 18)); // 6
console.log(gcd(17, 5));  // 1`,
            explain: <p>Easy to understand, but for large numbers it may try millions of candidates.</p>,
          },
          {
            name: "Euclid's algorithm with %",
            idea: <p>Replace the pair (a, b) with (b, a % b) until b is 0. Then a is the answer.</p>,
            code: `function gcd(a, b) {
  while (b !== 0) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a;
}

console.log(gcd(48, 18)); // 6
console.log(gcd(17, 5));  // 1`,
            explain: (
              <DryRun title="gcd(48, 18)" cols={["a", "b", "r = a % b"]} rows={[["48", "18", "12"], ["18", "12", "6"], ["12", "6", "0"], ["6", "0", "(loop ends → 6)"]]} highlight={3} />
            ),
          },
          {
            name: "Euclid's algorithm with subtraction",
            idea: <p>Subtract the smaller number from the larger one until they are equal.</p>,
            code: `function gcd(a, b) {
  while (a !== b) {
    if (a > b) a -= b;
    else b -= a;
  }
  return a;
}

console.log(gcd(48, 18)); // 6`,
            explain: <p>The original form of the method. It gives the same answer, but <code>%</code> does many subtractions in one step, so Approach 2 is much faster. (This version assumes both numbers are positive.)</p>,
          },
        ]}
        compare={<p>Use Approach 2. It is over 2,000 years old and still the standard method; it needs very few iterations even for huge numbers.</p>}
      >
        <p>Find the largest number that divides both a and b.</p>
      </Problem>

      <Problem
        n={10}
        title="Steps to reduce a number to zero"
        level="Easy"
        examples={[
          { input: "14", output: "6", why: "14 → 7 (halve) → 6 (subtract 1) → 3 → 2 → 1 → 0. That is 6 steps." },
          { input: "8", output: "4", why: "8 → 4 → 2 → 1 → 0." },
        ]}
        hints={[<>Repeat while n is greater than 0. If n is even, divide it by 2; otherwise subtract 1.</>, <>Count every step.</>]}
        approaches={[
          {
            name: "Simulate the steps",
            idea: <p>Apply the rule exactly as described and count.</p>,
            code: `function numberOfSteps(n) {
  let steps = 0;
  while (n > 0) {
    n = n % 2 === 0 ? n / 2 : n - 1;
    steps++;
  }
  return steps;
}

console.log(numberOfSteps(14)); // 6
console.log(numberOfSteps(8));  // 4`,
            explain: <p>A direct simulation. Each even step halves n, so the loop runs only a few dozen times even for very large numbers.</p>,
          },
          {
            name: "Count using the binary form",
            idea: <p>In binary, halving removes the last digit and subtracting 1 turns a final 1 into 0. So the steps are: (number of binary digits − 1) + (number of 1s).</p>,
            code: `function numberOfSteps(n) {
  if (n === 0) return 0;
  const bits = n.toString(2);                 // 14 → "1110"
  let ones = 0;
  for (const b of bits) if (b === "1") ones++;
  return bits.length - 1 + ones;              // 3 + 3 = 6
}

console.log(numberOfSteps(14)); // 6
console.log(numberOfSteps(8));  // 4`,
            explain: <p><code>n.toString(2)</code> writes n in binary. This is a preview of bit manipulation (Lesson 58); the simulation is perfectly acceptable in an interview.</p>,
          },
        ]}
        compare={<p>Give Approach 1. Approach 2 is a nice observation to mention if you have time.</p>}
      >
        <p>If n is even, divide it by 2; if it is odd, subtract 1. Return how many steps it takes to reach 0. (LeetCode 1342.)</p>
      </Problem>
    </>
  );
}
