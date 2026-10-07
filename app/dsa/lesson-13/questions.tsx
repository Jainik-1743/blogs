import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 13 practice questions. Each one is fast only with the right piece of maths. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="GCD of the smallest and largest"
        level="Easy"
        examples={[
          { input: "[2, 5, 6, 9, 10]", output: "2", why: "Smallest 2, largest 10, gcd(2, 10) = 2." },
          { input: "[7, 5, 6, 8, 3]", output: "1", why: "Smallest 3, largest 8. They share no divisor except 1." },
          { input: "[3, 3]", output: "3", why: "gcd(3, 3) = 3." },
        ]}
        hints={[<>Two separate jobs: find the minimum and maximum (one pass), then one GCD.</>, <>Use Euclid: <code>gcd(a, b) = gcd(b, a % b)</code>.</>]}
        approaches={[
          {
            name: "Try every candidate",
            idea: <p>Count down from the smallest value. The first number that divides both values is the GCD.</p>,
            code: `function findGCD(nums) {
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  for (let d = lo; d >= 1; d--) {
    if (lo % d === 0 && hi % d === 0) return d;
  }
}

console.log(findGCD([2, 5, 6, 9, 10])); // 2
console.log(findGCD([7, 5, 6, 8, 3]));  // 1`,
            explain: <p>This is correct, but the GCD part is O(min), meaning the work grows with the smaller value. With values up to 1,000 (the LeetCode limit) that is fine. With values up to 10<sup>9</sup> it is too slow.</p>,
          },
          {
            name: "Euclid",
            idea: <p>Find the minimum and maximum, then apply Euclid&apos;s rule.</p>,
            code: `function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function findGCD(nums) {
  return gcd(Math.min(...nums), Math.max(...nums));
}

console.log(findGCD([2, 5, 6, 9, 10])); // 2
console.log(findGCD([7, 5, 6, 8, 3]));  // 1
console.log(findGCD([3, 3]));           // 3`,
            explain: <p>Finding the min and max is O(n), and the GCD is O(log). The line <code>[a, b] = [b, a % b]</code> is called destructuring assignment. It sets both variables at once. It does the same job as the three lines in the traced version, but shorter.</p>,
          },
        ]}
        compare={<p>Use Euclid. It is just as short, and its speed hardly changes when the values are large. (LeetCode 1979.)</p>}
      >
        <p>Return the greatest common divisor of the smallest and the largest number in <code>nums</code>.</p>
      </Problem>

      <Problem
        n={2}
        title="Smallest number divisible by 1 to n"
        level="Easy"
        examples={[
          { input: "4", output: "12", why: "12 is divisible by 1, 2, 3 and 4, and no smaller number is." },
          { input: "10", output: "2520", why: "The classic answer: lcm(1, 2, …, 10)." },
          { input: "20", output: "232792560", why: "Still well inside the safe range of JavaScript numbers (below 2^53)." },
        ]}
        hints={[<>&ldquo;Divisible by all of them&rdquo; is exactly what the LCM (least common multiple) means.</>, <>lcm(1 … n) = lcm(lcm(1 … n−1), n). Build the answer one number at a time.</>]}
        approaches={[
          {
            name: "Try multiples",
            idea: <p>Test n, 2n, 3n, … until one is divisible by every number from 1 to n.</p>,
            code: `function smallestMultiple(n) {
  for (let x = n; ; x += n) {
    let ok = true;
    for (let d = 1; d <= n; d++) {
      if (x % d !== 0) { ok = false; break; }
    }
    if (ok) return x;
  }
}

console.log(smallestMultiple(4));  // 12
console.log(smallestMultiple(10)); // 2520`,
            explain: <p>This works for small n. For n = 20 it tests over 11 million candidates. The answer grows very fast, so this soon becomes too slow.</p>,
          },
          {
            name: "Running LCM",
            idea: <p>Start with 1 and add in each number one at a time: <code>result = lcm(result, k)</code>.</p>,
            code: `function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function smallestMultiple(n) {
  let result = 1;
  for (let k = 2; k <= n; k++) {
    result = (result / gcd(result, k)) * k;
  }
  return result;
}

console.log(smallestMultiple(4));  // 12
console.log(smallestMultiple(10)); // 2520
console.log(smallestMultiple(20)); // 232792560`,
            explain: (
              <DryRun
                title="smallestMultiple(6)"
                cols={["k", "gcd(result, k)", "result after"]}
                rows={[
                  ["2", "1", "2"],
                  ["3", "1", "6"],
                  ["4", "2", "12"],
                  ["5", "1", "60"],
                  ["6", "6", "60"],
                ]}
                highlight={4}
                note="When k already divides the result (k = 6), the GCD equals k and the result does not change."
              />
            ),
          },
        ]}
        compare={<p>Approach 2 makes n GCD calls, so it is about O(n log n) in total. Dividing by the GCD <em>before</em> multiplying keeps the in-between values small.</p>}
      >
        <p>Return the smallest positive number that every number from 1 to n divides evenly (1 ≤ n ≤ 20). &ldquo;Divides evenly&rdquo; means the remainder is 0.</p>
      </Problem>

      <Problem
        n={3}
        title="Exactly three divisors"
        level="Easy"
        examples={[
          { input: "2", output: "false", why: "Divisors: 1, 2. Only two." },
          { input: "4", output: "true", why: "Divisors: 1, 2, 4." },
          { input: "9", output: "true", why: "Divisors: 1, 3, 9." },
          { input: "12", output: "false", why: "Divisors: 1, 2, 3, 4, 6, 12." },
        ]}
        hints={[
          <>Count divisors using pairs, up to √n.</>,
          <>Divisors come in pairs. To get an <em>odd</em> count, one pair must be a single number, so i × i = n.</>,
          <>So n must be a perfect square (a number like 4, 9 or 16 that is some whole number times itself), n = p². Its only other divisor must be p. What does that say about p?</>,
        ]}
        approaches={[
          {
            name: "Count divisors in pairs",
            idea: <p>Loop i up to √n. Each divisor i adds 2 to the count (i and n / i), or adds 1 if they are the same number.</p>,
            code: `function isThree(n) {
  let count = 0;
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) count += i * i === n ? 1 : 2;
  }
  return count === 3;
}

console.log(isThree(2));  // false
console.log(isThree(4));  // true
console.log(isThree(12)); // false`,
            explain: <p>O(√n) time, O(1) space. This uses the pairs idea from the lesson directly.</p>,
          },
          {
            name: "Square of a prime",
            idea: <p>Three divisors means the divisors are 1, p and p², where p is prime. So check that n is a perfect square and that its square root is prime.</p>,
            code: `function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

function isThree(n) {
  const r = Math.round(Math.sqrt(n));
  return r * r === n && isPrime(r);
}

console.log(isThree(4));  // true
console.log(isThree(9));  // true
console.log(isThree(16)); // false   (1, 2, 4, 8, 16)`,
            explain: <p>O(n<sup>1/4</sup>): the prime check runs only up to the square root of the square root. <code>Math.sqrt</code> returns a decimal (floating-point) number that can be slightly off. So we use <code>Math.round</code> and then check <code>r * r === n</code> to be safe.</p>,
          },
        ]}
        compare={<p>Approach 1 is the one to reach for first. Approach 2 shows the kind of insight interviewers like: think about the <em>shape</em> of the answer, not just the loop. (LeetCode 1952.)</p>}
      >
        <p>Return <code>true</code> if <code>n</code> has exactly three positive divisors.</p>
      </Problem>

      <Problem
        n={4}
        title="Happy number"
        level="Easy"
        examples={[
          { input: "19", output: "true", why: "1² + 9² = 82 → 8² + 2² = 68 → 36 + 64 = 100 → 1 + 0 + 0 = 1." },
          { input: "2", output: "false", why: "2 → 4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4 → … The sequence repeats forever without reaching 1." },
        ]}
        hints={[
          <>Write a helper function that returns the sum of the squares of the digits (use the digit loop).</>,
          <>The sequence either reaches 1 or repeats. How can you notice a repeat?</>,
          <>Keep every number you have seen in a Set (a JavaScript collection that stores each value only once and can check quickly whether a value is inside).</>,
        ]}
        approaches={[
          {
            name: "Digit loop + Set of seen values",
            idea: <p>Keep replacing n with the sum of the squares of its digits. Stop at 1 (happy) or when a value repeats (not happy).</p>,
            code: `function digitSquareSum(n) {
  let sum = 0;
  while (n > 0) {
    const d = n % 10;
    sum += d * d;
    n = Math.floor(n / 10);
  }
  return sum;
}

function isHappy(n) {
  const seen = new Set();
  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    n = digitSquareSum(n);
  }
  return n === 1;
}

console.log(isHappy(19)); // true
console.log(isHappy(2));  // false`,
            explain: <p>Why must it repeat? Any number up to 10<sup>9</sup> has at most 10 digits, so the next value is at most 10 × 81 = 810. After the first step every value is small. The sequence can only visit a limited number of values, so one of them must come back.</p>,
          },
          {
            name: "Two speeds, no Set",
            idea: <p>Move one value one step at a time (slow) and another value two steps at a time (fast). If the sequence goes in a loop, the fast one catches the slow one.</p>,
            code: `function digitSquareSum(n) {
  let sum = 0;
  for (; n > 0; n = Math.floor(n / 10)) sum += (n % 10) ** 2;
  return sum;
}

function isHappy(n) {
  let slow = n;
  let fast = digitSquareSum(n);
  while (fast !== 1 && slow !== fast) {
    slow = digitSquareSum(slow);
    fast = digitSquareSum(digitSquareSum(fast));
  }
  return fast === 1;
}

console.log(isHappy(19)); // true
console.log(isHappy(2));  // false`,
            explain: <p>O(1) extra space. This &ldquo;fast and slow pointer&rdquo; idea comes back in Lesson 36, where it finds loops in linked lists.</p>,
          },
        ]}
        compare={<p>Use the Set. It is clear and easy to explain. Mention the fast and slow version if the interviewer asks you to avoid extra memory. (LeetCode 202.)</p>}
      >
        <p>
          Start with <code>n</code>. Replace it by the sum of the squares of its digits, and repeat. If
          this reaches 1, the number is <em>happy</em>. Return <code>true</code> if <code>n</code> is happy and <code>false</code> if it is not.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Ugly number"
        level="Easy"
        examples={[
          { input: "6", output: "true", why: "6 = 2 × 3." },
          { input: "1", output: "true", why: "1 has no prime factors at all, so it has none other than 2, 3 and 5." },
          { input: "14", output: "false", why: "14 = 2 × 7, and 7 is not allowed." },
          { input: "0", output: "false", why: "Edge case: an ugly number must be positive." },
        ]}
        hints={[<>Divide out every 2, then every 3, then every 5. (&ldquo;Divide out&rdquo; means keep dividing while the remainder is 0.)</>, <>What is left must be 1.</>]}
        approaches={[
          {
            name: "Divide out the allowed factors",
            idea: <p>While n is divisible by 2, divide it by 2. Do the same for 3 and 5. If n is now 1, it had no other prime factors.</p>,
            code: `function isUgly(n) {
  if (n <= 0) return false;
  for (const p of [2, 3, 5]) {
    while (n % p === 0) n /= p;
  }
  return n === 1;
}

console.log(isUgly(6));  // true
console.log(isUgly(1));  // true
console.log(isUgly(14)); // false
console.log(isUgly(0));  // false`,
            explain: <p>Each division at least halves n, so this is O(log n). The <code>n &lt;= 0</code> check is needed. <code>0 % 2</code> is 0, so without the check the loop would divide 0 by 2 forever.</p>,
          },
        ]}
        compare={<p>The loop &ldquo;divide out a factor while you can&rdquo; is the core of prime factorisation. The next question builds the full version. (LeetCode 263.)</p>}
      >
        <p>A <em>prime factor</em> of n is a prime number that divides n. For example, the prime factors of 12 are 2 and 3. An <em>ugly number</em> is a positive integer whose only prime factors are 2, 3 and 5. Return whether <code>n</code> is ugly.</p>
      </Problem>

      <Problem
        n={6}
        title="Prime factorisation"
        level="Medium"
        examples={[
          { input: "360", output: "[2, 2, 2, 3, 3, 5]", why: "360 = 2 × 2 × 2 × 3 × 3 × 5." },
          { input: "97", output: "[97]", why: "97 is prime." },
          { input: "1000000007", output: "[1000000007]", why: "A large prime: the loop must stop at √n, not at n." },
        ]}
        hints={[
          <>Try divisors from 2 upwards. Whenever d divides n, record it and divide it out. Repeat while d still divides n.</>,
          <>You only need d up to √n. If n is still greater than 1 after the loop, what must it be?</>,
        ]}
        approaches={[
          {
            name: "Trial division up to √n",
            idea: (
              <ol>
                <li>For d = 2, 3, 4, … while <code>d * d &lt;= n</code>: divide out d as many times as possible, recording it each time.</li>
                <li>If n is still greater than 1 at the end, what is left of n is itself a prime factor.</li>
              </ol>
            ),
            code: `function primeFactors(n) {
  const factors = [];
  for (let d = 2; d * d <= n; d++) {
    while (n % d === 0) {
      factors.push(d);
      n /= d;
    }
  }
  if (n > 1) factors.push(n);   // what is left is prime
  return factors;
}

console.log(primeFactors(360));        // [ 2, 2, 2, 3, 3, 5 ]
console.log(primeFactors(97));         // [ 97 ]
console.log(primeFactors(1000000007)); // [ 1000000007 ]`,
            explain: (
              <DryRun
                title="primeFactors(360)"
                cols={["d", "divides out", "n after"]}
                rows={[
                  ["2", "2, 2, 2", "45"],
                  ["3", "3, 3", "5"],
                  ["4", "— (3 × 3 … 4 × 4 = 16 > 5, stop)", "5"],
                  ["after loop", "n = 5 > 1 → push 5", ""],
                ]}
                note="Non-prime d (like 4) never divides n, because its prime factors were already divided out."
              />
            ),
          },
        ]}
        compare={<p>O(√n) time. Notice that the limit <code>d * d &lt;= n</code> uses the n that keeps <em>shrinking</em>. So the loop often stops much earlier than the square root of the original number.</p>}
      >
        <p>Prime factorisation means writing a number as a product of primes. Return the prime factors of <code>n</code> (n ≥ 2) in increasing order. Write a factor as many times as it divides n.</p>
      </Problem>

      <Problem
        n={7}
        title="Power modulo 10⁹ + 7"
        level="Medium"
        examples={[
          { input: "a = 2, b = 10", output: "1024", why: "2¹⁰ = 1024, already smaller than the modulus." },
          { input: "a = 2, b = 100", output: "976371285", why: "2¹⁰⁰ has 31 digits; only its remainder is returned." },
          { input: "a = 3, b = 200", output: "136318165", why: "Same idea." },
        ]}
        hints={[
          <>b can be 10<sup>9</sup>, so a loop of b multiplications is too slow. Use fast power (repeated squaring) from the lesson.</>,
          <>Take <code>% M</code> after every multiplication.</>,
          <>Remainders are up to about 10<sup>9</sup>, so their product is about 10<sup>18</sup>. Which JavaScript type can handle that exactly?</>,
        ]}
        approaches={[
          {
            name: "Fast power with Number (wrong)",
            idea: <p>Use the fast-power loop from the lesson and take the remainder after each multiplication.</p>,
            code: `const M = 1_000_000_007;

function powMod(a, b) {
  let result = 1;
  a %= M;
  while (b > 0) {
    if (b % 2 === 1) result = (result * a) % M;
    a = (a * a) % M;
    b = Math.floor(b / 2);
  }
  return result;
}

console.log(powMod(2, 10));  // 1024        correct (small numbers)
console.log(powMod(2, 100)); // 976371253   wrong — the right answer is 976371285`,
            explain: <p>The algorithm is right, but the arithmetic is not. Once <code>a</code> is near 10<sup>9</sup>, <code>a * a</code> goes past 2<sup>53</sup> and loses its last digits (precision). No error appears. You just get a wrong answer. This is a very common JavaScript bug in interviews.</p>,
          },
          {
            name: "Fast power with BigInt",
            idea: <p>Use the same loop, but make every value a BigInt (a JavaScript type for whole numbers of any size), so products are exact.</p>,
            code: `const M = 1_000_000_007n;

function powMod(a, b) {
  let base = BigInt(a) % M;
  let exp = BigInt(b);
  let result = 1n;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % M;
    base = (base * base) % M;
    exp = exp / 2n;              // BigInt division already rounds down
  }
  return Number(result);
}

console.log(powMod(2, 10));         // 1024
console.log(powMod(2, 100));        // 976371285
console.log(powMod(3, 200));        // 136318165
console.log(powMod(2, 1000000000)); // 140625001`,
            explain: <p>O(log b) time: about 30 passes for b = 10<sup>9</sup>. You cannot mix BigInt values with normal numbers, so every constant gets an <code>n</code>: <code>2n</code>, <code>1n</code>, <code>0n</code>. Convert back with <code>Number()</code> at the end. The result is below M, so this is safe.</p>,
          },
        ]}
        compare={<p>Always use the BigInt version when you multiply under a modulus of 10<sup>9</sup> + 7 in JavaScript. Test it with a large input. Small tests like 2¹⁰ pass even with the broken version.</p>}
      >
        <p>
          Return the remainder of a<sup>b</sup> divided by 10<sup>9</sup> + 7 (written a<sup>b</sup> mod (10<sup>9</sup> + 7)), for 1 ≤ a ≤ 10<sup>9</sup> and 0 ≤ b ≤ 10<sup>9</sup>.
        </p>
      </Problem>

      <Problem
        n={8}
        title="Pow(x, n)"
        level="Medium"
        examples={[
          { input: "x = 2, n = 10", output: "1024", why: "2¹⁰." },
          { input: "x = 2, n = -2", output: "0.25", why: "A negative exponent means 1 / x²: 1 / 4." },
          { input: "x = 3, n = 13", output: "1594323", why: "The example traced in the lesson." },
        ]}
        hints={[
          <>n can be as large as 2<sup>31</sup> − 1 (about 2 billion), so an O(n) loop is too slow.</>,
          <>For a negative n: x<sup>n</sup> = (1 / x)<sup>−n</sup>.</>,
        ]}
        approaches={[
          {
            name: "Multiply n times",
            idea: <p>Multiply x into the result |n| times (|n| means n without its minus sign). For a negative n, take 1 divided by the result.</p>,
            code: `function myPow(x, n) {
  let result = 1;
  for (let i = 0; i < Math.abs(n); i++) result *= x;
  return n < 0 ? 1 / result : result;
}

console.log(myPow(2, 10)); // 1024
console.log(myPow(2, -2)); // 0.25`,
            explain: <p>O(n). With n around 2 × 10<sup>9</sup> this is billions of multiplications, which is far too slow for these limits.</p>,
          },
          {
            name: "Fast exponentiation",
            idea: <p>Handle the sign first, then use repeated squaring (fast exponentiation).</p>,
            code: `function myPow(x, n) {
  if (n < 0) {
    x = 1 / x;
    n = -n;
  }
  let result = 1;
  while (n > 0) {
    if (n % 2 === 1) result *= x;
    x *= x;
    n = Math.floor(n / 2);
  }
  return result;
}

console.log(myPow(2, 10)); // 1024
console.log(myPow(2, -2)); // 0.25
console.log(myPow(3, 13)); // 1594323`,
            explain: <p>O(log n): about 31 passes for the largest n. There is no modulus here, because x is a decimal number and the answer is also a decimal.</p>,
          },
        ]}
        compare={<p>Approach 2 is the expected answer. Mention the negative exponent edge case before you write the loop. (LeetCode 50.)</p>}
      >
        <p>Compute x<sup>n</sup> without using <code>**</code> or <code>Math.pow</code>. Here x is a decimal number and n is a whole number that may be negative.</p>
      </Problem>

      <Problem
        n={9}
        title="Closest prime numbers in a range"
        level="Medium"
        examples={[
          { input: "left = 10, right = 19", output: "[11, 13]", why: "Primes in range: 11, 13, 17, 19. Gaps 2, 4, 2. The first pair with the smallest gap is [11, 13]." },
          { input: "left = 4, right = 6", output: "[-1, -1]", why: "Only one prime (5) in the range, so there is no pair." },
        ]}
        hints={[
          <>right can be 10<sup>6</sup>. Checking each number with the √n prime test works, but it repeats a lot of work.</>,
          <>Build one sieve up to <code>right</code>. Then walk through the primes in [left, right] and keep the smallest gap.</>,
        ]}
        approaches={[
          {
            name: "Prime test for each number",
            idea: <p>Walk from left to right, test each number with the √n check, and compare each prime with the previous prime.</p>,
            code: `function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

function closestPrimes(left, right) {
  let prev = -1;
  let best = [-1, -1];
  for (let k = left; k <= right; k++) {
    if (!isPrime(k)) continue;
    if (prev !== -1 && (best[0] === -1 || k - prev < best[1] - best[0])) best = [prev, k];
    prev = k;
  }
  return best;
}

console.log(closestPrimes(10, 19)); // [ 11, 13 ]
console.log(closestPrimes(4, 6));   // [ -1, -1 ]`,
            explain: <p>O(n√n) for a range of size n. For a range up to 10<sup>6</sup> that is about 10<sup>9</sup> steps in the worst case, which is too slow.</p>,
          },
          {
            name: "Sieve once, then scan",
            idea: <p>Use the sieve to mark every prime up to <code>right</code>. Then do the same scan, but check the array instead of testing each number.</p>,
            code: `function closestPrimes(left, right) {
  const isPrime = new Array(right + 1).fill(true);
  isPrime[0] = false;
  isPrime[1] = false;
  for (let i = 2; i * i <= right; i++) {
    if (!isPrime[i]) continue;
    for (let j = i * i; j <= right; j += i) isPrime[j] = false;
  }

  let prev = -1;
  let best = [-1, -1];
  for (let k = left; k <= right; k++) {
    if (!isPrime[k]) continue;
    if (prev !== -1 && (best[0] === -1 || k - prev < best[1] - best[0])) best = [prev, k];
    prev = k;
  }
  return best;
}

console.log(closestPrimes(10, 19)); // [ 11, 13 ]
console.log(closestPrimes(4, 6));   // [ -1, -1 ]`,
            explain: <p>The sieve takes O(n log log n) and the scan takes O(n). The space is O(n). The strict <code>&lt;</code> keeps the <em>first</em> pair when two gaps are equal, as the question asks.</p>,
          },
        ]}
        compare={<p>When a problem needs many primes, build the sieve once. (LeetCode 2523.)</p>}
      >
        <p>
          Find two primes <code>p &lt; q</code> with <code>left ≤ p &lt; q ≤ right</code> and the smallest
          possible gap <code>q − p</code>. If several pairs tie, return the one with the smallest p. If no
          pair exists, return <code>[-1, -1]</code>. (1 ≤ left ≤ right ≤ 10<sup>6</sup>.)
        </p>
      </Problem>
    </>
  );
}
