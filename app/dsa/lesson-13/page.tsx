import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CodeTrace from "@/components/dsa/CodeTrace";
import DryRun from "@/components/dsa/DryRun";
import DsaLessonPage from "@/components/dsa/DsaLesson";
import Questions from "./questions";
import Recall from "@/components/dsa/Recall";
import CodeBlock from "@/components/sd/CodeBlock";
import { getDsaLesson } from "@/lib/dsa";
import { tracer } from "@/lib/dsa-trace";

const lesson = getDsaLesson("lesson-13");

export const metadata: Metadata = {
  title: `Lesson 13 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "A little maths, a lot less work" },
  { id: "digits", label: "Digit problems revisited" },
  { id: "divisors", label: "All divisors in √n steps" },
  { id: "primes", label: "Checking for a prime" },
  { id: "sieve", label: "The Sieve of Eratosthenes" },
  { id: "gcd", label: "GCD with Euclid's algorithm" },
  { id: "trace", label: "Traced: gcd(252, 105)" },
  { id: "lcm", label: "LCM from the GCD" },
  { id: "mod", label: "Remainders and modular arithmetic" },
  { id: "power", label: "Fast exponentiation" },
  { id: "summary", label: "The costs side by side" },
  { id: "practice", label: "Practice questions (9)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const digitTemplate = `function digitsOf(n, base = 10) {
  if (n === 0) return [0];
  const digits = [];
  while (n > 0) {
    digits.push(n % base);          // last digit
    n = Math.floor(n / base);       // remove it
  }
  return digits.reverse();          // they came out last-first
}

console.log(digitsOf(4072));        // [ 4, 0, 7, 2 ]
console.log(digitsOf(13, 2));       // [ 1, 1, 0, 1 ]   13 in binary`;

const divisorsCode = `function divisors(n) {
  const small = [];
  const large = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      small.push(i);                     // the small half of the pair
      if (i !== n / i) large.push(n / i);  // its partner (skip 6 × 6 twice)
    }
  }
  return [...small, ...large.reverse()];
}

console.log(divisors(36)); // [ 1, 2, 3, 4, 6, 9, 12, 18, 36 ]
console.log(divisors(13)); // [ 1, 13 ]`;

const isPrimeCode = `function isPrime(n) {
  if (n < 2) return false;                 // 0 and 1 are not prime
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;         // found a divisor
  }
  return true;
}

console.log(isPrime(97));  // true
console.log(isPrime(91));  // false   (7 × 13)
console.log(isPrime(1));   // false`;

const sieveCode = `function primesUpTo(n) {
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = false;
  isPrime[1] = false;
  for (let i = 2; i * i <= n; i++) {
    if (!isPrime[i]) continue;               // already crossed out
    for (let j = i * i; j <= n; j += i) {
      isPrime[j] = false;                    // cross out multiples of i
    }
  }
  const primes = [];
  for (let i = 2; i <= n; i++) if (isPrime[i]) primes.push(i);
  return primes;
}

console.log(primesUpTo(30)); // [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 ]`;

const gcdCode = `function gcd(a, b) {
  while (b !== 0) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a;
}
console.log(gcd(252, 105));`;

function gcdTrace() {
  const t = tracer();
  let a = 252;
  let b = 105;
  t.step(1, "start", "gcd(252, 105)", "We want the largest number that divides both.", { a, b });
  while (b !== 0) {
    t.step(2, "check", `${b} !== 0? yes`, "b is not zero yet, so keep going.", { a, b });
    const r = a % b;
    t.step(3, "run", `r = ${a} % ${b} = ${r}`, `${a} = ${Math.floor(a / b)} × ${b} + ${r}. Any common divisor of ${a} and ${b} also divides ${r}.`, { a, b, r }, "r");
    a = b;
    t.step(4, "update", `a = ${a}`, "The old b moves into a.", { a, b, r }, "a");
    b = r;
    t.step(5, "update", `b = ${b}`, `So gcd(${a}, ${b}) is the same as the gcd we started with — but the numbers are smaller.`, { a, b, r }, "b");
  }
  t.step(2, "stop", "0 !== 0? no", "b reached 0. Everything divides 0, so the answer is a.", { a, b });
  t.step(7, "done", `return ${a}`, "252 = 21 × 12 and 105 = 21 × 5, and 12 and 5 share no divisor.", { a, b });
  t.print(a);
  t.step(9, "print", "console.log(…)", "Only three loop passes for numbers in the hundreds.", { a, b });
  return t.steps;
}

const lcmCode = `function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function lcm(a, b) {
  return (a / gcd(a, b)) * b;        // divide first so the number stays small
}

console.log(gcd(12, 18));  // 6
console.log(lcm(4, 6));    // 12
console.log(lcm(21, 6));   // 42`;

const modRules = `const M = 1_000_000_007;

// Addition and multiplication: take % as often as you like
(a + b) % M  ===  ((a % M) + (b % M)) % M
(a * b) % M  ===  ((a % M) * (b % M)) % M

// Subtraction: add M before the final % so the result is never negative
(a - b) % M  →  ((a % M) - (b % M) + M) % M`;

const negMod = `console.log(7 % 3);              // 1
console.log(-7 % 3);             // -1   JavaScript keeps the sign of the left side
console.log(((-7 % 3) + 3) % 3); // 2    the mathematical remainder`;

const bigMod = `const M = 1_000_000_007;

// Wrong: the product is about 1.2 × 10^17, beyond the safe limit of 2^53 ≈ 9 × 10^15
console.log((123456789 * 987654321) % M);                         // 259106854

// Right: BigInt keeps every digit
console.log(Number((123456789n * 987654321n) % BigInt(M)));       // 259106859`;

const powerCode = `function power(x, n) {
  let result = 1;
  while (n > 0) {
    if (n % 2 === 1) result *= x;   // this bit of n is 1: include the current x
    x *= x;                         // x, x², x⁴, x⁸ …
    n = Math.floor(n / 2);          // move to the next bit
  }
  return result;
}

console.log(power(3, 13));  // 1594323
console.log(power(2, 10));  // 1024`;

export default function DsaLessonThirteenPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">A little maths, a lot less work</h2>
      <p>
        You do not need advanced maths for coding interviews. You need about six small facts. Each one
        turns a slow loop into a fast loop. Lesson 12 gave you the words to measure this. Checking every
        number up to n is O(n) (the work grows in step with n). With the right fact, the same job
        becomes O(√n) or O(log n), which is much less work.
      </p>
      <p>
        You met some of these ideas briefly in Lessons 4, 5 and 7: the prime check, the GCD loop,
        the sieve and fast power. This lesson explains <em>why</em> they work and what they cost. Then
        you can rebuild them from understanding, not from memory.
      </p>

      <h2 id="digits">Digit problems revisited</h2>
      <p>
        Lesson 5&apos;s digit loop takes a number apart. The <strong>remainder operator</strong>{" "}
        <code>%</code> gives what is left after a division, so <code>n % 10</code> is the last digit
        (for example, 4072 % 10 is 2). <code>Math.floor(n / 10)</code> divides by 10 and drops the
        decimal part, which removes that last digit. Two new observations:
      </p>
      <ul>
        <li>
          <strong>It is O(log n).</strong> Each pass removes one digit. A number n has about log₁₀ n
          digits (log₁₀ n means: how many times you can divide n by 10). Even n = 10<sup>18</sup> needs
          only 19 passes.
        </li>
        <li>
          <strong>10 is not special.</strong> Replace 10 with 2 and the same loop gives the binary
          digits. Binary is the way computers write numbers, using only 0 and 1. A single 0 or 1 is
          called a bit. You will read bits this way in Lesson 58.
        </li>
      </ul>
      <CodeBlock lang="js" code={digitTemplate} />

      <h2 id="divisors">All divisors in √n steps</h2>
      <p>
        A <strong>divisor</strong> of n is a whole number that divides n with remainder 0. For example, the
        divisors of 6 are 1, 2, 3 and 6. The obvious way to find them all is to try every number from 1
        to n. That is O(n). But divisors come in <strong>pairs</strong>: if{" "}
        <code>i</code> divides n, so does <code>n / i</code>.
      </p>
      <DryRun
        title="divisor pairs of 36"
        cols={["i (small)", "36 / i (large)", "i × (36 / i)"]}
        rows={[
          ["1", "36", "36"],
          ["2", "18", "36"],
          ["3", "12", "36"],
          ["4", "9", "36"],
          ["6", "6", "36   ← i = √36, the pairs meet"],
        ]}
        highlight={4}
        note="In every pair, the smaller number is at most √n. So we only need to try i up to √n and collect both halves of each pair."
      />
      <CodeBlock lang="js" code={divisorsCode} />
      <p>
        The √n (square root of n) is the number that gives n when you multiply it by itself. For example,
        √36 = 6. The loop condition <code>i * i &lt;= n</code> means &ldquo;i ≤ √n&rdquo;. It avoids{" "}
        <code>Math.sqrt</code> and its rounding. For n = 10<sup>12</sup>, that is 10<sup>6</sup> passes
        instead of 10<sup>12</sup>. This is the difference between an instant answer and several hours.
      </p>

      <h2 id="primes">Checking for a prime</h2>
      <p>
        A <strong>prime number</strong> is a whole number greater than 1 that has no divisors except 1 and
        itself. For example, 7 is prime, and 8 is not (2 divides it). The pairs idea gives a fast check.
        If n has any divisor other than 1 and n, the smaller number of its pair is at most √n. So if
        nothing up to √n divides n, then nothing does.
      </p>
      <CodeBlock lang="js" code={isPrimeCode} />
      <p>Time O(√n), space O(1) (it needs no extra memory). Remember the edge cases: 0 and 1 are not prime, and 2 is the only even prime.</p>

      <h2 id="sieve">The Sieve of Eratosthenes</h2>
      <p>
        The <strong>Sieve of Eratosthenes</strong> is an algorithm that finds all prime numbers up to n. To
        find <em>every</em> prime up to n, checking each number separately costs about n × √n. The
        sieve does better by working the other way round. It does not ask &ldquo;is this number
        prime?&rdquo;. Instead, it crosses out every number that is <em>not</em> prime, like a
        sieve (a kitchen strainer) that lets only the primes through. A <strong>multiple</strong> of i is
        any number you get by multiplying i by a whole number: 3, 6, 9, 12 are multiples of 3.
      </p>
      <ol>
        <li>Start with every number from 2 to n marked as prime.</li>
        <li>Take the smallest number still marked. It is prime. Cross out all its multiples.</li>
        <li>Repeat. Stop once i × i is greater than n — every number left is prime.</li>
      </ol>
      <DryRun
        title="primesUpTo(30)"
        cols={["i", "Still marked?", "Crosses out (from i × i)"]}
        rows={[
          ["2", "yes", "4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30"],
          ["3", "yes", "9, 12, 15, 18, 21, 24, 27, 30"],
          ["4", "no — skip", ""],
          ["5", "yes", "25, 30"],
          ["6", "6 × 6 = 36 > 30 — stop", ""],
        ]}
        note="Left unmarked: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29."
      />
      <p>
        Why start crossing at <code>i * i</code>? Smaller multiples of i, like 2 × 5 and 3 × 5 (when i is
        5), were already crossed out by 2 and 3. And why stop at √n? Any non-prime number up to n has a
        divisor that is at most √n, so it has already been crossed out.
      </p>
      <CodeBlock lang="js" code={sieveCode} />
      <p>
        The sieve runs in about <strong>O(n log log n)</strong> time. This is so close to O(n) that you can
        treat it as linear. It uses O(n) space for the array. It is the standard answer whenever a
        problem needs many primes, for example &ldquo;count the primes below 5,000,000&rdquo;.
      </p>

      <h2 id="gcd">GCD with Euclid&apos;s algorithm</h2>
      <p>
        The <strong>GCD</strong> (greatest common divisor) of two numbers is the largest number that
        divides both: gcd(12, 18) = 6. You can try every candidate from the smaller number downwards. That
        works, but it is O(min(a, b)). Euclid (a Greek mathematician) found a much faster way more than
        2,000 years ago. <strong>Euclid&apos;s algorithm</strong> finds the GCD by replacing the pair
        (a, b) with the smaller pair (b, a % b) again and again:
      </p>
      <Callout kind="ok" label="Euclid's rule">
        <p className="mb-1">
          <code>gcd(a, b) = gcd(b, a % b)</code>, and <code>gcd(a, 0) = a</code>.
        </p>
        <p className="mb-0">
          Why: any number that divides both a and b also divides a − b, a − 2b, and so on. In the end it
          divides the remainder a % b. So the pair (b, a % b) has exactly the same common divisors as
          (a, b), but the numbers are smaller.
        </p>
      </Callout>

      <h2 id="trace">Traced: gcd(252, 105)</h2>
      <CodeTrace
        code={gcdCode}
        steps={gcdTrace()}
        caption="Each pass replaces (a, b) with (b, a % b). The numbers shrink fast: the remainder is always smaller than b."
      />
      <p>
        The remainder becomes at most half as big every two steps. So Euclid&apos;s algorithm is{" "}
        <strong>O(log min(a, b))</strong>. For numbers around a billion, that is a few dozen passes at
        most.
      </p>

      <h2 id="lcm">LCM from the GCD</h2>
      <p>
        The <strong>LCM</strong> (least common multiple) is the smallest positive number that both a and b
        divide: lcm(4, 6) = 12. It comes straight from the GCD, because{" "}
        <code>gcd(a, b) × lcm(a, b) = a × b</code>. So lcm(a, b) = a × b / gcd(a, b).
      </p>
      <CodeBlock lang="js" code={lcmCode} />
      <p>
        For more than two numbers, apply the function to one pair at a time:{" "}
        <code>gcd(a, b, c) = gcd(gcd(a, b), c)</code>, and the same for the LCM. In JavaScript you can do
        this with one <code>reduce</code> (an array method that folds a list into one value).
      </p>

      <h2 id="mod">Remainders and modular arithmetic</h2>
      <p>
        Many problems count something enormous, such as the number of paths in a grid or the number of
        arrangements of a string. They then say &ldquo;return the answer modulo 10<sup>9</sup> + 7&rdquo;.
        The <strong>remainder</strong> is what is left after a division: 17 divided by 5 is 3 with
        remainder 2. <strong>Modulo</strong> means &ldquo;give me that remainder&rdquo;. So the problem
        wants only the remainder after dividing by 1,000,000,007. Working only with remainders is called{" "}
        <strong>modular arithmetic</strong>. It follows these rules:
      </p>
      <CodeBlock lang="text" code={modRules} />
      <p>
        So you can take <code>% M</code> after <em>every</em> addition or multiplication, and the numbers
        never grow large. Watch two details that are specific to JavaScript:
      </p>
      <p><strong>1. Negative numbers.</strong> In JavaScript, the <code>%</code> operator gives a result with the same sign as the left number. So a negative number gives a negative remainder:</p>
      <CodeBlock lang="js" code={negMod} />
      <p>
        <strong>2. Multiplying two large remainders.</strong> A normal JavaScript number is stored as a
        64-bit decimal (floating-point) value. It is exact for whole numbers only up to
        2<sup>53</sup> ≈ 9 × 10<sup>15</sup>. Two remainders near 10<sup>9</sup> multiply to about
        10<sup>18</sup>, which is past that limit. The result silently loses its last digits. Use{" "}
        <strong>BigInt</strong> for those multiplications. BigInt is a JavaScript type for whole numbers
        of any size, and you write one with an <code>n</code> at the end, like <code>12n</code>:
      </p>
      <CodeBlock lang="js" code={bigMod} />
      <Callout kind="warn" label="Silent and wrong">
        <p className="mb-0">
          The first answer is off by 5, and no error is shown. Addition is safe (two values below 10<sup>9</sup>{" "}
          add to about 2 × 10<sup>9</sup>). But any <em>multiplication</em> under a large modulus in
          JavaScript should use BigInt.
        </p>
      </Callout>

      <h2 id="power">Fast exponentiation</h2>
      <p>
        x<sup>n</sup> means x multiplied by itself n times (the exponent n says how many). Doing that with
        n multiplications is O(n). <strong>Fast exponentiation</strong> (also called exponentiation by
        squaring) is a method that finds x<sup>n</sup> with only about log n multiplications. It uses
        the fact that squaring doubles the exponent: x → x² → x⁴ → x⁸. Any n can be written as a sum of
        these powers of two. Those are its binary digits. For 13 = 8 + 4 + 1 (binary 1101):
      </p>
      <p className="text-center font-mono">3¹³ = 3⁸ × 3⁴ × 3¹</p>
      <p>
        So walk through the bits of n with the digit loop (base 2). Keep squaring x. Whenever the current
        bit is 1, multiply the current x into the result.
      </p>
      <CodeBlock lang="js" code={powerCode} />
      <DryRun
        title="power(3, 13)"
        cols={["n", "n odd?", "result", "x after squaring"]}
        rows={[
          ["13", "yes → result × 3", "3", "9"],
          ["6", "no", "3", "81"],
          ["3", "yes → result × 81", "243", "6,561"],
          ["1", "yes → result × 6,561", "1,594,323", "43,046,721"],
        ]}
        highlight={3}
        note="Four passes instead of thirteen multiplications. For n = 10⁹ it is about 30 passes instead of a billion: O(log n)."
      />
      <p>
        In real problems, fast power is almost always used together with a modulus, for example
        (2<sup>1,000,000,000</sup>) % (10<sup>9</sup> + 7). Practice question 7 builds that version, with
        BigInt.
      </p>

      <h2 id="summary">The costs side by side</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Obvious way</th>
              <th>With the right fact</th>
              <th>The fact</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Digits of n</td><td>—</td><td>O(log n)</td><td>One digit removed per pass</td></tr>
            <tr><td>All divisors of n</td><td>O(n)</td><td>O(√n)</td><td>Divisors come in pairs</td></tr>
            <tr><td>Is n prime?</td><td>O(n)</td><td>O(√n)</td><td>A divisor pair has one side ≤ √n</td></tr>
            <tr><td>All primes up to n</td><td>O(n√n)</td><td>O(n log log n)</td><td>Cross out multiples (sieve)</td></tr>
            <tr><td>gcd(a, b)</td><td>O(min(a, b))</td><td>O(log min(a, b))</td><td>gcd(a, b) = gcd(b, a % b)</td></tr>
            <tr><td>x<sup>n</sup></td><td>O(n)</td><td>O(log n)</td><td>Squaring doubles the exponent</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="practice">Practice questions</h2>
      <p>
        Before each solution, read the constraints (the limits on the input size) and use the table from
        Lesson 12 to decide which growth rate is fast enough. Most of these questions are about choosing
        the right fact.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Explain in two sentences why checking divisors up to √n is enough.</>,
          <>Run the sieve by hand for n = 50 and list the primes you get.</>,
          <>Write Euclid&apos;s GCD from memory, then dry-run gcd(84, 36).</>,
          <>Write fast power from memory and dry-run power(2, 11).</>,
          <>Say why <code>(a * b) % M</code> can be wrong in JavaScript and how to fix it.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Several ideas in this lesson have a natural recursive form. gcd(a, b) = gcd(b, a % b) is a rule
        defined using itself, and so is x<sup>n</sup> = (x<sup>n/2</sup>)². Lesson 14 introduces{" "}
        <strong>recursion</strong>, which means a function that calls itself. It also explains the call
        stack, the list of active function calls that makes recursion work.
      </p>
    </DsaLessonPage>
  );
}
