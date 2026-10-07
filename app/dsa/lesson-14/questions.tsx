import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 14 practice questions. Each one shows the recursive solution next to a loop or a better recursion. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Sum of digits, recursively"
        level="Easy"
        examples={[
          { input: "472", output: "13", why: "4 + 7 + 2 = 13." },
          { input: "5", output: "5", why: "A single digit is its own sum — the base case." },
        ]}
        hints={[
          <>Smaller problem: the number without its last digit, <code>Math.floor(n / 10)</code>.</>,
          <>sumDigits(n) = (last digit) + sumDigits(rest).</>,
        ]}
        approaches={[
          {
            name: "Recursion",
            idea: <p>The answer is the last digit plus the digit sum of the rest. A number below 10 is its own answer.</p>,
            code: `function sumDigits(n) {
  if (n < 10) return n;
  return (n % 10) + sumDigits(Math.floor(n / 10));
}

console.log(sumDigits(472)); // 13
console.log(sumDigits(5));   // 5`,
            explain: (
              <DryRun
                title="sumDigits(472)"
                cols={["Call", "Returns"]}
                rows={[
                  ["sumDigits(472)", "2 + sumDigits(47) = 2 + 11 = 13"],
                  ["sumDigits(47)", "7 + sumDigits(4) = 7 + 4 = 11"],
                  ["sumDigits(4)", "4 (base case)"],
                ]}
              />
            ),
          },
          {
            name: "Loop",
            idea: <p>The digit loop from Lesson 5.</p>,
            code: `function sumDigits(n) {
  let sum = 0;
  while (n > 0) {
    sum += n % 10;
    n = Math.floor(n / 10);
  }
  return sum;
}

console.log(sumDigits(472)); // 13`,
            explain: <p>Same O(log n) time, but O(1) space instead of O(log n) stack frames.</p>,
          },
        ]}
        compare={<p>Both are fine: the depth is only the number of digits. The recursion is a good first exercise because the smaller problem is so clear.</p>}
      >
        <p>Return the sum of the digits of a non-negative integer <code>n</code>, using recursion.</p>
      </Problem>

      <Problem
        n={2}
        title="Power of two"
        level="Easy"
        examples={[
          { input: "16", output: "true", why: "16 = 2⁴." },
          { input: "1", output: "true", why: "1 = 2⁰ — the base case." },
          { input: "6", output: "false", why: "6 / 2 = 3, and 3 is odd and not 1." },
          { input: "0", output: "false", why: "Edge case: 0 is not a power of two (and halving it never ends)." },
        ]}
        hints={[<>n is a power of two exactly when n is 1, or n is even and n / 2 is a power of two.</>, <>Do not forget n ≤ 0.</>]}
        approaches={[
          {
            name: "Recursion",
            idea: <p>Translate the definition: base cases for 1 and for anything not positive or odd; otherwise recurse on n / 2.</p>,
            code: `function isPowerOfTwo(n) {
  if (n === 1) return true;
  if (n <= 0 || n % 2 !== 0) return false;
  return isPowerOfTwo(n / 2);
}

console.log(isPowerOfTwo(16)); // true
console.log(isPowerOfTwo(1));  // true
console.log(isPowerOfTwo(6));  // false
console.log(isPowerOfTwo(0));  // false`,
            explain: <p>O(log n) calls, because n halves each time. Without the <code>n &lt;= 0</code> check, <code>isPowerOfTwo(0)</code> would recurse on 0 forever and overflow the stack.</p>,
          },
          {
            name: "Loop",
            idea: <p>Keep dividing by 2 while n is even; a power of two ends at exactly 1.</p>,
            code: `function isPowerOfTwo(n) {
  if (n <= 0) return false;
  while (n % 2 === 0) n /= 2;
  return n === 1;
}

console.log(isPowerOfTwo(16)); // true
console.log(isPowerOfTwo(6));  // false`,
            explain: <p>Same time, O(1) space. (Lesson 58 shows a one-line bit trick for this.)</p>,
          },
        ]}
        compare={<p>Notice how the recursive version has <em>several</em> base cases. That is normal: list every input you can answer directly. (LeetCode 231.)</p>}
      >
        <p>Return <code>true</code> if <code>n</code> is a power of two.</p>
      </Problem>

      <Problem
        n={3}
        title="Reverse a string in place"
        level="Easy"
        examples={[{ input: `["h", "e", "l", "l", "o"]`, output: `["o", "l", "l", "e", "h"]`, why: "The characters are swapped from both ends towards the middle." }]}
        hints={[<>Swap the first and last characters. What smaller problem is left?</>, <>Recurse with <code>left + 1</code> and <code>right - 1</code>. Stop when they meet.</>]}
        approaches={[
          {
            name: "Recursion with two indices",
            idea: <p>Swap <code>s[left]</code> and <code>s[right]</code>, then reverse the part between them.</p>,
            code: `function reverseString(s, left = 0, right = s.length - 1) {
  if (left >= right) return;               // 0 or 1 characters left
  [s[left], s[right]] = [s[right], s[left]];
  reverseString(s, left + 1, right - 1);
}

const s = ["h", "e", "l", "l", "o"];
reverseString(s);
console.log(s); // [ 'o', 'l', 'l', 'e', 'h' ]`,
            explain: <p>About n/2 calls, so O(n) time and O(n) stack space. Default parameters let the caller write just <code>reverseString(s)</code>.</p>,
          },
          {
            name: "Two-pointer loop",
            idea: <p>The same swaps in a while loop.</p>,
            code: `function reverseString(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]];
    left++;
    right--;
  }
}

const s = ["h", "e", "l", "l", "o"];
reverseString(s);
console.log(s); // [ 'o', 'l', 'l', 'e', 'h' ]`,
            explain: <p>O(n) time, O(1) space — the version LeetCode&apos;s &ldquo;O(1) extra memory&rdquo; rule asks for.</p>,
          },
        ]}
        compare={<p>Compare the two: the loop&apos;s <code>left++</code> and <code>right--</code> became the recursive call&apos;s arguments. Converting between loops and recursion is often this direct. (LeetCode 344.)</p>}
      >
        <p>Reverse an array of characters in place.</p>
      </Problem>

      <Problem
        n={4}
        title="Palindrome check, recursively"
        level="Easy"
        examples={[
          { input: `"racecar"`, output: "true", why: "r = r, a = a, c = c, then only e is left." },
          { input: `"abca"`, output: "false", why: "The outer pair matches, but b ≠ c." },
          { input: `""`, output: "true", why: "Edge case: an empty string reads the same both ways." },
        ]}
        hints={[<>A string is a palindrome if its first and last characters match <em>and</em> the middle part is a palindrome.</>]}
        approaches={[
          {
            name: "Recursion with two indices",
            idea: <p>Compare the ends; if they match, check the inside.</p>,
            code: `function isPalindrome(s, i = 0, j = s.length - 1) {
  if (i >= j) return true;
  if (s[i] !== s[j]) return false;
  return isPalindrome(s, i + 1, j - 1);
}

console.log(isPalindrome("racecar")); // true
console.log(isPalindrome("abca"));    // false
console.log(isPalindrome(""));        // true`,
            explain: <p>Two base cases: nothing left to compare (true), or a mismatch (false). O(n) time, O(n) stack.</p>,
          },
        ]}
        compare={<p>Lesson 9 solved this with a loop; this version shows the same idea as a definition. Both are O(n) time.</p>}
      >
        <p>Return whether the string <code>s</code> reads the same forwards and backwards, using recursion.</p>
      </Problem>

      <Problem
        n={5}
        title="Fibonacci number"
        level="Easy"
        examples={[
          { input: "2", output: "1", why: "0, 1, 1 — fib(2) = 1." },
          { input: "10", output: "55", why: "0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55." },
        ]}
        hints={[<>The direct recursion is correct but repeats work. For n ≤ 30 it still passes.</>, <>A loop only needs the last two values.</>]}
        approaches={[
          {
            name: "Direct recursion",
            idea: <p>fib(n) = fib(n − 1) + fib(n − 2), with fib(0) = 0 and fib(1) = 1.</p>,
            code: `function fib(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}

console.log(fib(2));  // 1
console.log(fib(10)); // 55`,
            explain: <p>About O(2ⁿ) time because the same values are recomputed many times, and O(n) stack depth.</p>,
          },
          {
            name: "Loop with two variables",
            idea: <p>Walk forward from 0 and 1, keeping only the previous two numbers.</p>,
            code: `function fib(n) {
  let a = 0, b = 1;               // fib(0), fib(1)
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}

console.log(fib(2));  // 1
console.log(fib(10)); // 55
console.log(fib(50)); // 12586269025`,
            explain: <p>O(n) time, O(1) space. <code>fib(50)</code> is instant here; the recursive version would make over 40 billion calls.</p>,
          },
        ]}
        compare={<p>Know both: the recursion shows you understand the definition, and the loop shows you noticed the repeated work. Lesson 54 adds the middle ground — recursion with memory. (LeetCode 509.)</p>}
      >
        <p>Return the n-th Fibonacci number, where fib(0) = 0 and fib(1) = 1 (0 ≤ n ≤ 30).</p>
      </Problem>

      <Problem
        n={6}
        title="Is the array sorted?"
        level="Easy"
        examples={[
          { input: "[1, 2, 2, 5]", output: "true", why: "Every item is at least the one before it." },
          { input: "[3, 1, 4]", output: "false", why: "1 is smaller than 3." },
          { input: "[]", output: "true", why: "Edge case: nothing is out of order." },
        ]}
        hints={[<>The array from index i onwards is sorted if <code>arr[i] &lt;= arr[i + 1]</code> and the array from i + 1 onwards is sorted.</>]}
        approaches={[
          {
            name: "Recursion with an index",
            idea: <p>Check one neighbouring pair, then the rest.</p>,
            code: `function isSorted(arr, i = 0) {
  if (i >= arr.length - 1) return true;     // 0 or 1 items left
  if (arr[i] > arr[i + 1]) return false;
  return isSorted(arr, i + 1);
}

console.log(isSorted([1, 2, 2, 5])); // true
console.log(isSorted([3, 1, 4]));    // false
console.log(isSorted([]));           // true`,
            explain: <p>O(n) time and O(n) stack. Note the base case uses <code>arr.length - 1</code>, because each step looks at <code>i + 1</code>.</p>,
          },
        ]}
        compare={<p>The pattern &ldquo;check the first part, recurse on the rest&rdquo; works for any question of the form &ldquo;do all items satisfy…&rdquo;.</p>}
      >
        <p>Return whether the array is sorted in non-decreasing order, using recursion.</p>
      </Problem>

      <Problem
        n={7}
        title="Count occurrences"
        level="Easy"
        examples={[
          { input: "arr = [3, 1, 3, 3, 2], x = 3", output: "3", why: "3 appears at indices 0, 2 and 3." },
          { input: "arr = [], x = 7", output: "0", why: "Edge case: empty array." },
        ]}
        hints={[<>count(from i) = (1 if arr[i] is x, else 0) + count(from i + 1).</>]}
        approaches={[
          {
            name: "Return-value recursion",
            idea: <p>Each call returns the count for its part of the array; the caller adds its own item.</p>,
            code: `function countOf(arr, x, i = 0) {
  if (i === arr.length) return 0;
  return (arr[i] === x ? 1 : 0) + countOf(arr, x, i + 1);
}

console.log(countOf([3, 1, 3, 3, 2], 3)); // 3
console.log(countOf([], 7));              // 0`,
            explain: <p>The answer is built on the way back up: the deepest call returns 0, and each frame adds 0 or 1.</p>,
          },
          {
            name: "Parameter recursion",
            idea: <p>Carry the count so far as an argument; return it at the end.</p>,
            code: `function countOf(arr, x, i = 0, count = 0) {
  if (i === arr.length) return count;
  return countOf(arr, x, i + 1, count + (arr[i] === x ? 1 : 0));
}

console.log(countOf([3, 1, 3, 3, 2], 3)); // 3`,
            explain: <p>Here the answer is built on the way <em>down</em>, like an accumulator in a loop. The base case simply returns it.</p>,
          },
        ]}
        compare={<p>These are the two styles of recursion you will meet again in Lesson 32: build the answer from returned values, or carry it in a parameter. Both are O(n).</p>}
      >
        <p>Return how many times <code>x</code> appears in <code>arr</code>, using recursion.</p>
      </Problem>
    </>
  );
}
