import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";
import CodeBlock from "@/components/sd/CodeBlock";

/** Lesson 7 practice questions. Every question shows each way to solve it. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Square of a number"
        level="Easy"
        examples={[
          { input: "square(5)", output: "25", why: "5 × 5 = 25." },
          { input: "square(-3)", output: "9", why: "-3 × -3 = 9. A negative times a negative is positive." },
        ]}
        hints={[<>The function receives one input, n. What should it give back?</>, <>Use <code>return n * n;</code> — do not print inside the function.</>]}
        approaches={[
          {
            name: "Function declaration",
            idea: <p>Define <code>square(n)</code> and return <code>n * n</code>.</p>,
            code: `function square(n) {
  return n * n;
}

console.log(square(5));  // 25
console.log(square(-3)); // 9`,
            explain: <p>The smallest useful function. It <em>returns</em> the value so the caller can use it — for example <code>square(3) + square(4)</code>.</p>,
          },
          {
            name: "Arrow function",
            idea: <p>An arrow function is a short way to write a function. The value after <code>=&gt;</code> is returned automatically.</p>,
            code: `const square = (n) => n * n;

console.log(square(5)); // 25`,
            explain: <p>Same behaviour, shorter to write. It is common in modern JavaScript.</p>,
          },
          {
            name: "The power operator",
            idea: <p>The <code>**</code> operator raises a number to a power. <code>n ** 2</code> means n times n.</p>,
            code: `const square = (n) => n ** 2;

console.log(square(5));     // 25
console.log(Math.pow(5, 2)); // 25`,
            explain: <p><code>**</code> and <code>Math.pow</code> (a built-in function that does the same job) work for any power, not only 2.</p>,
          },
        ]}
        compare={<p>All three are correct. Use the style your team uses. In interviews, Approach 1 is the clearest.</p>}
      >
        <p>Write <code>square(n)</code> that returns n × n.</p>
      </Problem>

      <Problem
        n={2}
        title="Is it even?"
        level="Easy"
        examples={[
          { input: "isEven(4)", output: "true", why: "4 % 2 is 0." },
          { input: "isEven(7)", output: "false", why: "7 % 2 is 1." },
        ]}
        hints={[<>The function must return <code>true</code> or <code>false</code>, not print.</>, <><code>n % 2 === 0</code> is already true or false. You can return it directly.</>]}
        approaches={[
          {
            name: "Return the condition directly",
            idea: <p>A comparison such as <code>n % 2 === 0</code> already gives <code>true</code> or <code>false</code> (a boolean). So return it directly. The <code>%</code> operator gives the remainder after division.</p>,
            code: `function isEven(n) {
  return n % 2 === 0;
}

console.log(isEven(4)); // true
console.log(isEven(7)); // false`,
            explain: <p>Interviewers like this form. You do not need an <code>if</code> when the answer is already true or false.</p>,
          },
          {
            name: "if / else with two returns",
            idea: <p>Check the condition, then return <code>true</code> or <code>false</code> explicitly.</p>,
            code: `function isEven(n) {
  if (n % 2 === 0) {
    return true;
  } else {
    return false;
  }
}

console.log(isEven(4)); // true`,
            explain: <p>This is correct, but longer. If you ever write <code>if (condition) return true; else return false;</code>, you can replace it with <code>return condition;</code>.</p>,
          },
        ]}
        compare={<p>Use Approach 1.</p>}
      >
        <p>Write <code>isEven(n)</code> that returns <code>true</code> or <code>false</code>.</p>
      </Problem>

      <Problem
        n={3}
        title="Max of two, then max of three"
        level="Easy"
        examples={[
          { input: "max2(4, 9)", output: "9", why: "9 is larger than 4." },
          { input: "max3(4, 9, 2)", output: "9", why: "The larger of 4 and 9 is 9. The larger of 9 and 2 is 9." },
        ]}
        hints={[<>Write <code>max2</code> first.</>, <>Find the larger of the first two. Then find the larger of that result and the third number: <code>max2(max2(a, b), c)</code>.</>]}
        approaches={[
          {
            name: "Build max3 from max2",
            idea: <p>Solve the small problem once. Then reuse that function (a function used by another function is called a <em>helper function</em>).</p>,
            code: `function max2(a, b) {
  return a > b ? a : b;   // "? :" means: if a > b then a, else b
}

function max3(a, b, c) {
  return max2(max2(a, b), c);
}

console.log(max2(4, 9));    // 9
console.log(max3(4, 9, 2)); // 9
console.log(max3(7, 7, 3)); // 7`,
            explain: <p>Functions can call other functions. <code>max3</code> has no new logic, so there is little that can go wrong.</p>,
          },
          {
            name: "Math.max",
            idea: <p>The built-in function <code>Math.max</code> accepts any number of arguments and returns the largest.</p>,
            code: `const max3 = (a, b, c) => Math.max(a, b, c);

console.log(max3(4, 9, 2)); // 9`,
            explain: <p>This is the shortest way. Mention it, but expect the interviewer to ask you to write it yourself.</p>,
          },
        ]}
        compare={<p>Approach 1 shows the most important skill in this lesson: breaking a problem into small functions that you can reuse.</p>}
      >
        <p>Write <code>max2(a, b)</code>, then use it to write <code>max3(a, b, c)</code>.</p>
      </Problem>

      <Problem
        n={4}
        title="Celsius to Fahrenheit"
        level="Easy"
        examples={[
          { input: "toFahrenheit(100)", output: "212", why: "100 × 9 / 5 + 32 = 180 + 32 = 212. Water boils at 100 °C, which is 212 °F." },
          { input: "toFahrenheit(0)", output: "32", why: "0 × 9 / 5 + 32 = 32." },
          { input: "toFahrenheit(-40)", output: "-40", why: "-40 is the same temperature in both scales." },
        ]}
        hints={[<>The formula is F = C × 9 / 5 + 32. Return it.</>]}
        approaches={[
          {
            name: "Function declaration",
            idea: <p>Return the formula.</p>,
            code: `function toFahrenheit(c) {
  return (c * 9) / 5 + 32;
}

console.log(toFahrenheit(100)); // 212
console.log(toFahrenheit(0));   // 32
console.log(toFahrenheit(-40)); // -40`,
            explain: <p>Test with values you already know (boiling point, freezing point, −40). This is a quick way to catch a mistake in a formula.</p>,
          },
          {
            name: "Arrow function, plus the reverse conversion",
            idea: <p>A one-line formula fits an arrow function well. The reverse formula is C = (F − 32) × 5 / 9.</p>,
            code: `const toFahrenheit = (c) => (c * 9) / 5 + 32;
const toCelsius = (f) => ((f - 32) * 5) / 9;

console.log(toFahrenheit(100));          // 212
console.log(toCelsius(212));             // 100
console.log(toCelsius(toFahrenheit(37))); // 37`,
            explain: <p>If you convert there and back, you should get the original value. This is another useful self-test.</p>,
          },
        ]}
      >
        <p>Convert Celsius to Fahrenheit: F = C × 9 / 5 + 32.</p>
      </Problem>

      <Problem
        n={5}
        title="Count primes up to N"
        level="Medium"
        examples={[
          { input: "countPrimes(10)", output: "4", why: "The primes up to 10 are 2, 3, 5 and 7." },
          { input: "countPrimes(20)", output: "8", why: "2, 3, 5, 7, 11, 13, 17, 19." },
        ]}
        hints={[<>A prime number is a whole number greater than 1 that only 1 and itself divide evenly. Write a helper <code>isPrime(n)</code> first (Lesson 4, question 10).</>, <>Then loop from 2 to N. Count the numbers for which <code>isPrime</code> returns true.</>]}
        approaches={[
          {
            name: "Helper function + loop",
            idea: <p>Split the problem in two. <code>isPrime</code> checks one number. <code>countPrimes</code> does the counting.</p>,
            code: `function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;   // early return
  }
  return true;
}

function countPrimes(N) {
  let count = 0;
  for (let i = 2; i <= N; i++) {
    if (isPrime(i)) count++;
  }
  return count;
}

console.log(countPrimes(10)); // 4
console.log(countPrimes(20)); // 8`,
            explain: <p>An early <code>return false</code> replaces the flag variable and the <code>break</code> from Lesson 4. Splitting a problem into helper functions shows an interviewer that you solve problems well.</p>,
          },
          {
            name: "Sieve of Eratosthenes",
            idea: (
              <>
                <p>The sieve is an old method that finds all primes up to N by crossing out numbers. A <em>multiple</em> of p is a number you get by multiplying p by 1, 2, 3 and so on.</p>
                <ol>
                  <li>Mark every number from 2 to N as &ldquo;possibly prime&rdquo;.</li>
                  <li>For each number still marked, cross out all its multiples.</li>
                  <li>Whatever is still marked at the end is prime.</li>
                </ol>
              </>
            ),
            code: `function countPrimes(N) {
  const isPrime = new Array(N + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  for (let p = 2; p * p <= N; p++) {
    if (!isPrime[p]) continue;
    for (let m = p * p; m <= N; m += p) {
      isPrime[m] = false;              // m is a multiple of p
    }
  }
  let count = 0;
  for (let i = 2; i <= N; i++) if (isPrime[i]) count++;
  return count;
}

console.log(countPrimes(10)); // 4
console.log(countPrimes(20)); // 8`,
            explain: <p>This uses an array (Lesson 8) of true/false values. It does not test each number alone. It crosses out multiples in bulk, which is much faster for large N. Lesson 13 explains it in detail. (LeetCode 204 counts primes <em>less than</em> N. For that problem, change <code>&lt;= N</code> to <code>&lt; N</code>.)</p>,
          },
        ]}
        compare={<p>Approach 1 is fine for small N and is easy to write. For large N (LeetCode 204 allows N up to 5 million), the sieve is the expected answer.</p>}
      >
        <p>How many prime numbers are there from 1 to N?</p>
      </Problem>

      <Problem
        n={6}
        title="Power without **"
        level="Easy"
        examples={[
          { input: "power(2, 10)", output: "1024", why: "2 multiplied by itself 10 times." },
          { input: "power(5, 0)", output: "1", why: "Anything to the power 0 is 1." },
        ]}
        hints={[<>The base is the number you multiply. The exponent (<code>exp</code>) says how many times. Start a product at 1 and multiply it by the base, <code>exp</code> times.</>]}
        approaches={[
          {
            name: "Multiply in a loop",
            idea: <p>Keep a running product in a variable (an <em>accumulator</em> is a variable that collects a result step by step). Multiply it by <code>base</code> once per loop round.</p>,
            code: `function power(base, exp) {
  let result = 1;
  for (let i = 1; i <= exp; i++) {
    result *= base;
  }
  return result;
}

console.log(power(2, 10)); // 1024
console.log(power(5, 0));  // 1`,
            explain: <p>When <code>exp = 0</code>, the loop never runs and the answer stays 1. That is correct.</p>,
          },
          {
            name: "Fast power (squaring)",
            idea: <p>Fast power uses this fact: 2¹⁰ = (2⁵)². Each step squares the base and halves the exponent. When the exponent is odd, one extra factor is multiplied into the result first.</p>,
            code: `function power(base, exp) {
  let result = 1;
  while (exp > 0) {
    if (exp % 2 === 1) result *= base;   // odd: use one factor now
    base *= base;                        // square the base
    exp = Math.floor(exp / 2);           // halve the exponent
  }
  return result;
}

console.log(power(2, 10)); // 1024
console.log(power(3, 5));  // 243`,
            explain: <p>For exp = 1,000,000, the simple loop runs a million times. This version runs about 20 times. This is the answer to LeetCode 50 (Pow(x, n)), covered in Lesson 13.</p>,
          },
        ]}
        compare={<p>Write Approach 1 first. If the exponent can be large, mention Approach 2 or write it.</p>}
      >
        <p>Compute base<sup>exp</sup> for a non-negative whole exponent, without using <code>**</code> or <code>Math.pow</code>.</p>
      </Problem>

      <Problem
        n={7}
        title="LCM using GCD"
        level="Medium"
        examples={[
          { input: "lcm(4, 6)", output: "12", why: "Multiples of 4: 4, 8, 12 … Multiples of 6: 6, 12 … 12 is the first one in both lists." },
          { input: "lcm(5, 7)", output: "35", why: "5 and 7 share no factor, so the LCM is 5 × 7." },
        ]}
        hints={[<>The GCD (greatest common divisor) is the largest number that divides both a and b. The LCM is the smallest number that both divide into. They are linked by a rule: a × b = gcd(a, b) × lcm(a, b).</>, <>You already wrote <code>gcd</code> in Lesson 5. So lcm = a × b / gcd(a, b).</>]}
        approaches={[
          {
            name: "Use the GCD",
            idea: <p>Write <code>gcd</code> as a helper function. Then lcm = a / gcd × b.</p>,
            code: `function gcd(a, b) {
  while (b !== 0) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a;
}

function lcm(a, b) {
  return (a / gcd(a, b)) * b;   // divide first to keep numbers small
}

console.log(lcm(4, 6)); // 12
console.log(lcm(5, 7)); // 35`,
            explain: <p>For 4 and 6, the gcd is 2, so lcm = 4 / 2 × 6 = 12. Dividing first keeps the middle value small, so it does not become too big.</p>,
          },
          {
            name: "Check multiples of the larger number",
            idea: <p>List the multiples of the larger number one by one. Stop at the first one that the smaller number also divides evenly.</p>,
            code: `function lcm(a, b) {
  const big = Math.max(a, b), small = Math.min(a, b);
  let m = big;
  while (m % small !== 0) {
    m += big;
  }
  return m;
}

console.log(lcm(4, 6)); // 12
console.log(lcm(5, 7)); // 35`,
            explain: <p>This is easy to understand. But for large numbers with no common factors, it can take many loop rounds.</p>,
          },
        ]}
        compare={<p>Use Approach 1. Reusing <code>gcd</code> is faster, and it is a good example of helper functions.</p>}
      >
        <p>Write <code>lcm(a, b)</code>: the smallest number divisible by both a and b.</p>
      </Problem>

      <Problem
        n={8}
        title="What does it print?"
        level="Easy"
        examples={[{ input: "the code below", output: "8\nundefined", why: "The function prints 8 itself. It has no return statement, so it gives back undefined. Then line 7 prints that undefined." }]}
        hints={[<>What does a function give back if it has no <code>return</code>?</>]}
        approaches={[
          {
            name: "Trace the calls",
            idea: <p>Follow the program line by line. Remember what the function returns.</p>,
            code: `function addAndShow(a, b) {
  console.log(a + b);
}

const result = addAndShow(3, 5);
console.log(result);

/* Output:
8
undefined
*/`,
            explain: <p>Sometimes your answer &ldquo;prints the right thing&rdquo; but the judge says &ldquo;wrong answer&rdquo;. This is almost always the reason: the function printed instead of returning.</p>,
          },
          {
            name: "The fixed version",
            idea: <p>Return the value instead of printing it. Let the caller print.</p>,
            code: `function add(a, b) {
  return a + b;
}

const result = add(3, 5);
console.log(result); // 8`,
            explain: <p>Now the value goes back to the caller. The caller can print it, store it or use it in more calculations.</p>,
          },
        ]}
      >
        <p>Predict both lines of output:</p>
        <CodeBlock lang="js" code={`function addAndShow(a, b) {\n  console.log(a + b);\n}\n\nconst result = addAndShow(3, 5);\nconsole.log(result);`} />
      </Problem>

      <Problem
        n={9}
        title="Digital root"
        level="Medium"
        examples={[
          { input: "digitalRoot(9875)", output: "2", why: "9+8+7+5 = 29, then 2+9 = 11, then 1+1 = 2. Stop when one digit remains." },
          { input: "digitalRoot(7)", output: "7", why: "Already a single digit." },
        ]}
        hints={[<>You wrote <code>sumDigits</code> in Lesson 5. It adds up the digits of a number. Use it as a helper.</>, <>Keep replacing n with <code>sumDigits(n)</code> while n has more than one digit (n ≥ 10).</>]}
        approaches={[
          {
            name: "Repeat sumDigits",
            idea: <p>Use a loop that calls a helper function. The helper has its own loop inside. (<code>Math.floor</code> rounds a number down to a whole number, so <code>Math.floor(n / 10)</code> removes the last digit.)</p>,
            code: `function sumDigits(n) {
  let sum = 0;
  while (n > 0) {
    sum += n % 10;
    n = Math.floor(n / 10);
  }
  return sum;
}

function digitalRoot(n) {
  while (n >= 10) {
    n = sumDigits(n);
  }
  return n;
}

console.log(digitalRoot(9875)); // 2
console.log(digitalRoot(7));    // 7`,
            explain: <DryRun title="digitalRoot(9875)" cols={["n", "n >= 10?", "sumDigits(n)"]} rows={[["9875", "true", "29"], ["29", "true", "11"], ["11", "true", "2"], ["2", "false", "(return 2)"]]} highlight={3} />,
          },
          {
            name: "The mod-9 formula",
            idea: <p>A number and the sum of its digits leave the same remainder when divided by 9. Because of this, the digital root of a positive number n is 1 + (n − 1) % 9.</p>,
            code: `function digitalRoot(n) {
  if (n === 0) return 0;
  return 1 + ((n - 1) % 9);
}

console.log(digitalRoot(9875)); // 2
console.log(digitalRoot(9));    // 9`,
            explain: <p>There is no loop at all. This is the follow-up answer for LeetCode 258 (Add Digits), which asks for a solution without loops.</p>,
          },
        ]}
        compare={<p>You should be able to write Approach 1. Approach 2 is the clever follow-up. Mention it only if you can explain why it works.</p>}
      >
        <p>The digital root of n: add up the digits of n, and repeat on the result until only one digit remains.</p>
      </Problem>

      <Problem
        n={10}
        title="Power of two"
        level="Easy"
        examples={[
          { input: "isPowerOfTwo(16)", output: "true", why: "16 = 2 × 2 × 2 × 2 = 2⁴." },
          { input: "isPowerOfTwo(12)", output: "false", why: "12 = 2 × 2 × 3. The extra factor 3 means it is not a power of two." },
          { input: "isPowerOfTwo(1)", output: "true", why: "1 = 2⁰." },
        ]}
        hints={[<>A power of two is 1, 2, 4, 8, 16 and so on. While the number is even, divide it by 2. What should be left at the end if it was a power of two?</>, <>Zero and negative numbers are never powers of two.</>]}
        approaches={[
          {
            name: "Divide by 2 while possible",
            idea: <p>Keep halving while the number is even. If it was a power of two, you end at exactly 1.</p>,
            code: `function isPowerOfTwo(n) {
  if (n <= 0) return false;
  while (n % 2 === 0) {
    n = n / 2;
  }
  return n === 1;
}

console.log(isPowerOfTwo(16)); // true
console.log(isPowerOfTwo(12)); // false
console.log(isPowerOfTwo(1));  // true`,
            explain: <p>12 becomes 6, then 3. The number 3 is odd and is not 1, so the answer is false.</p>,
          },
          {
            name: "Multiply up from 1",
            idea: <p>Make the numbers 1, 2, 4, 8, … until the value reaches or passes n. Then compare it with n.</p>,
            code: `function isPowerOfTwo(n) {
  let p = 1;
  while (p < n) {
    p *= 2;
  }
  return p === n;
}

console.log(isPowerOfTwo(16)); // true
console.log(isPowerOfTwo(12)); // false`,
            explain: <p>This reuses the idea &ldquo;smallest power of two that is at least N&rdquo; from Lesson 5.</p>,
          },
          {
            name: "Bit operation",
            idea: <p>Binary is the number system that uses only 0 and 1 (bits). In binary, a power of two has exactly one 1 (8 is <code>1000</code>). Subtracting 1 changes it to <code>0111</code>. The two numbers share no 1 bit, so <code>n &amp; (n - 1)</code> is 0.</p>,
            code: `function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

console.log(isPowerOfTwo(16)); // true
console.log(isPowerOfTwo(12)); // false`,
            explain: <p>The <code>&amp;</code> operator (bitwise AND) compares two numbers bit by bit. It keeps a 1 only where both numbers have a 1. This is the well-known one-line answer for LeetCode 231. Lesson 58 explains bit operations fully.</p>,
          },
        ]}
        compare={<p>Approach 1 is easy to explain and correct. Mention Approach 3 as the follow-up that takes constant time (the same short time for any n).</p>}
      >
        <p>Return <code>true</code> if n is a power of two. (LeetCode 231.)</p>
      </Problem>
    </>
  );
}
