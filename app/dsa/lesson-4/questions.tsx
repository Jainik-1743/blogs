import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 4 practice questions. Every question shows each way to solve it. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Print 1 to N"
        level="Easy"
        examples={[
          { input: "N = 5", output: "1\n2\n3\n4\n5", why: "Every whole number from 1 up to and including 5, one per line." },
          { input: "N = 1", output: "1", why: "The smallest case: the loop runs exactly once." },
        ]}
        hints={[<>Which value should <code>i</code> start at, and which value is the last one printed?</>, <>Start at 1, keep going while <code>i &lt;= N</code>, and add 1 each time.</>]}
        approaches={[
          {
            name: "for loop",
            idea: <p>First value 1, last value N, step +1, and the body prints <code>i</code>.</p>,
            code: `const N = 5;
for (let i = 1; i <= N; i++) {
  console.log(i);
}

/* Output:
1
2
3
4
5
*/`,
            explain: <p>The loop runs N times: <code>i</code> takes the values 1, 2, …, N, and the check fails when <code>i</code> becomes N + 1.</p>,
          },
          {
            name: "while loop",
            idea: <p>A <code>while</code> loop repeats as long as its condition is true. It has the same three parts as <code>for</code>, but spread out: start before the loop, check in the brackets, update at the end of the body.</p>,
            code: `const N = 5;
let i = 1;
while (i <= N) {
  console.log(i);
  i++;
}

/* Output:
1
2
3
4
5
*/`,
            explain: <p>Forgetting <code>i++</code> is the most common mistake here. Then <code>i</code> stays 1 forever, and the loop never ends. Lesson 5 covers <code>while</code> in detail.</p>,
          },
          {
            name: "Build one string, print once",
            idea: <p>Collect all the numbers into one string (a piece of text) and print it once at the end.</p>,
            code: `const N = 5;
let out = "";
for (let i = 1; i <= N; i++) {
  out += i + (i < N ? " " : "");   // a space after every number except the last
}
console.log(out); // 1 2 3 4 5`,
            explain: <p>This is useful when a problem asks for the numbers on one line. The <code>i &lt; N ? &quot; &quot; : &quot;&quot;</code> part (a ternary, from Lesson 3) avoids a space after the last number.</p>,
          },
        ]}
        compare={<p>Use the <code>for</code> loop (Approach 1). You know the exact range, and that is what <code>for</code> is made for.</p>}
      >
        <p>Print every number from 1 to N, one per line.</p>
      </Problem>

      <Problem
        n={2}
        title="Print N down to 1"
        level="Easy"
        examples={[{ input: "N = 4", output: "4\n3\n2\n1", why: "Start at N and go down by one until 1." }]}
        hints={[<>Reverse all three parts of the loop from question 1.</>, <>Start at N, keep going while <code>i &gt;= 1</code>, and subtract 1 each time with <code>i--</code>.</>]}
        approaches={[
          {
            name: "Count down",
            idea: <p>Start at N, check <code>i &gt;= 1</code>, update with <code>i--</code>.</p>,
            code: `const N = 4;
for (let i = N; i >= 1; i--) {
  console.log(i);
}

/* Output:
4
3
2
1
*/`,
            explain: <p>A common mistake is keeping <code>i &lt;= N</code> as the check. As <code>i</code> gets smaller, that stays true forever, so the loop never stops (an infinite loop).</p>,
          },
          {
            name: "Count up, print N − i + 1",
            idea: <p>Keep the normal loop from 1 to N, but print a value that you work out from <code>i</code>.</p>,
            code: `const N = 4;
for (let i = 1; i <= N; i++) {
  console.log(N - i + 1);
}

/* Output:
4
3
2
1
*/`,
            explain: <p>When <code>i</code> is 1, the value is N. When <code>i</code> is N, the value is 1. Printing a formula that uses the loop variable is a technique you will use often in pattern problems (Lesson 6).</p>,
          },
        ]}
        compare={<p>Approach 1 is clearer. Approach 2 is worth knowing. It shows that the value you print does not have to be the loop variable itself.</p>}
      >
        <p>Print the numbers from N down to 1.</p>
      </Problem>

      <Problem
        n={3}
        title="Even numbers up to N"
        level="Easy"
        examples={[
          { input: "N = 10", output: "2\n4\n6\n8\n10", why: "The even numbers between 1 and 10." },
          { input: "N = 7", output: "2\n4\n6", why: "8 is larger than 7, so the last even number is 6." },
        ]}
        hints={[<>One way: visit every number and keep only the even ones. How do you test for even?</>, <>A faster way: start at 2 and add 2 each time.</>]}
        approaches={[
          {
            name: "Visit every number, keep the even ones",
            idea: <p>Loop from 1 to N and print <code>i</code> only when <code>i % 2 === 0</code>.</p>,
            code: `const N = 7;
for (let i = 1; i <= N; i++) {
  if (i % 2 === 0) console.log(i);
}

/* Output:
2
4
6
*/`,
            explain: <p>This is a loop combined with an <code>if</code> from Lesson 3. The loop runs N times, but only about half of the numbers are printed.</p>,
          },
          {
            name: "Jump from even to even",
            idea: <p>Start at 2 and add 2 each time, so <code>i</code> is always even.</p>,
            code: `const N = 7;
for (let i = 2; i <= N; i += 2) {
  console.log(i);
}

/* Output:
2
4
6
*/`,
            explain: <p>The loop runs only about N / 2 times and needs no <code>if</code>. Changing the update step is often the simplest way to skip values.</p>,
          },
          {
            name: "Count the k-th even number",
            idea: <p>The k-th even number is 2 × k. Loop k from 1 while 2k ≤ N.</p>,
            code: `const N = 7;
for (let k = 1; 2 * k <= N; k++) {
  console.log(2 * k);
}

/* Output:
2
4
6
*/`,
            explain: <p>This does the same amount of work as Approach 2, but it is written as a formula. Thinking &ldquo;the k-th item is …&rdquo; helps in many problems about sequences (lists of numbers that follow a rule).</p>,
          },
        ]}
        compare={<p>Approach 2 is the best. It does the least work, and its purpose is clear. Saying that it halves the number of iterations shows that you think about efficiency.</p>}
      >
        <p>Print all even numbers from 1 to N.</p>
      </Problem>

      <Problem
        n={4}
        title="Sum of 1 to N"
        level="Easy"
        examples={[
          { input: "N = 5", output: "15", why: "1 + 2 + 3 + 4 + 5 = 15." },
          { input: "N = 100", output: "5050", why: "Adding the numbers from 1 to 100 gives 5050." },
        ]}
        hints={[<>You need one answer built from many steps. Create a variable for the total <em>before</em> the loop.</>, <>Start the total at 0 and add <code>i</code> on every iteration.</>]}
        approaches={[
          {
            name: "Loop with an accumulator",
            idea: (
              <ol>
                <li>Before the loop: <code>sum = 0</code>.</li>
                <li>Inside the loop: <code>sum += i</code>.</li>
                <li>After the loop: <code>sum</code> is the answer.</li>
              </ol>
            ),
            code: `function sumTo(N) {
  let sum = 0;
  for (let i = 1; i <= N; i++) {
    sum += i;
  }
  return sum;
}

console.log(sumTo(5));   // 15
console.log(sumTo(100)); // 5050`,
            explain: (
              <>
                <p>The loop is wrapped in a <strong>function</strong> (a named block of code that you can run many times with different inputs; Lesson 7 teaches it) so we can test it with two inputs. For now, read <code>sumTo(5)</code> as &ldquo;run this with N = 5&rdquo;. The word <code>return</code> sends the answer back to the caller.</p>
                <DryRun title="sumTo(5)" cols={["i", "sum after"]} rows={[["1", "1"], ["2", "3"], ["3", "6"], ["4", "10"], ["5", "15"]]} highlight={4} />
              </>
            ),
          },
          {
            name: "The formula N × (N + 1) / 2",
            idea: <p>Pair the first and last numbers: 1 + 100, 2 + 99, and so on. Each pair adds up to N + 1, and there are N / 2 pairs.</p>,
            code: `function sumTo(N) {
  return (N * (N + 1)) / 2;
}

console.log(sumTo(5));   // 15
console.log(sumTo(100)); // 5050`,
            explain: <p>There is no loop at all. The answer takes the same time for N = 5 or N = 5,000,000. Lesson 12 calls this O(1), which means constant time.</p>,
          },
        ]}
        compare={<p>Know both. Write the loop if the question is about practising loops, and mention the formula afterwards. Interviewers like candidates who notice when a loop is not needed.</p>}
      >
        <p>Find 1 + 2 + … + N.</p>
      </Problem>

      <Problem
        n={5}
        title="Factorial"
        level="Easy"
        examples={[
          { input: "5", output: "120", why: "5! = 5 × 4 × 3 × 2 × 1 = 120." },
          { input: "0", output: "1", why: "By definition, 0! = 1. (n! means n factorial: n multiplied by every whole number below it, down to 1.)" },
        ]}
        hints={[<>This is an accumulator (see the accumulator section above), but for multiplication.</>, <>What must a product start at? (Anything multiplied by 0 is 0.)</>]}
        approaches={[
          {
            name: "Count up from 2",
            idea: <p>Start with <code>product = 1</code> and multiply by 2, 3, …, n.</p>,
            code: `function factorial(n) {
  let product = 1;              // not 0 — anything × 0 is 0
  for (let i = 2; i <= n; i++) {
    product *= i;
  }
  return product;
}

console.log(factorial(5)); // 120
console.log(factorial(0)); // 1`,
            explain: (
              <>
                <DryRun title="factorial(5)" cols={["i", "product before", "product after"]} rows={[["2", "1", "2"], ["3", "2", "6"], ["4", "6", "24"], ["5", "24", "120"]]} highlight={3} />
                <p>For n = 0 or 1 the loop never runs, so the answer stays 1. This is correct without a special case.</p>
              </>
            ),
          },
          {
            name: "Count down from n",
            idea: <p>Multiply n × (n − 1) × … × 2, in the same order as the definition.</p>,
            code: `function factorial(n) {
  let product = 1;
  for (let i = n; i >= 2; i--) {
    product *= i;
  }
  return product;
}

console.log(factorial(5)); // 120`,
            explain: <p>Multiplication gives the same result in any order, so counting down works too.</p>,
          },
          {
            name: "while loop",
            idea: <p>Multiply by n, then reduce n by 1, until n reaches 1.</p>,
            code: `function factorial(n) {
  let product = 1;
  while (n > 1) {
    product *= n;
    n--;
  }
  return product;
}

console.log(factorial(5)); // 120`,
            explain: <p>The parameter <code>n</code> (the name for the input of a function) acts as the counter itself. Changing a number parameter inside a function does not change the value in the code that called it.</p>,
          },
        ]}
        compare={<p>Any of the three is correct, and Approach 1 is the most common. Factorials grow very fast. From 23! onwards, a JavaScript number cannot store the exact value. So interview questions often ask for the answer modulo a number (the remainder after dividing by it; Lesson 13).</p>}
      >
        <p>Find n! = n × (n − 1) × … × 1, for a whole number n ≥ 0.</p>
      </Problem>

      <Problem
        n={6}
        title="Multiplication table"
        level="Easy"
        examples={[{ input: "7", output: "7 x 1 = 7\n7 x 2 = 14\n...\n7 x 10 = 70", why: "Ten lines: 7 multiplied by each number from 1 to 10." }]}
        hints={[<>The loop variable does not have to be the thing you print. Here it is the multiplier.</>, <>Loop <code>i</code> from 1 to 10 and print <code>n</code>, <code>i</code> and <code>n * i</code>.</>]}
        approaches={[
          {
            name: "Join the text with +",
            idea: <p>Loop <code>i</code> from 1 to 10 and build each line from pieces.</p>,
            code: `const n = 7;
for (let i = 1; i <= 10; i++) {
  console.log(n + " x " + i + " = " + n * i);
}

/* Output:
7 x 1 = 7
7 x 2 = 14
7 x 3 = 21
7 x 4 = 28
7 x 5 = 35
7 x 6 = 42
7 x 7 = 49
7 x 8 = 56
7 x 9 = 63
7 x 10 = 70
*/`,
            explain: <p><code>n * i</code> is worked out before the joining, because <code>*</code> has a higher priority than <code>+</code>.</p>,
          },
          {
            name: "Template literal",
            idea: <p>Write the line as text between backticks, with <code>{"${ }"}</code> placeholders for the values.</p>,
            code: `const n = 7;
for (let i = 1; i <= 3; i++) {
  console.log(\`\${n} x \${i} = \${n * i}\`);
}

/* Output:
7 x 1 = 7
7 x 2 = 14
7 x 3 = 21
*/`,
            explain: <p>This is easier to read than many <code>+</code> signs. There is also no risk of joining when you meant to add. (The example stops at 3 to keep the output short.)</p>,
          },
        ]}
        compare={<p>Both print the same text. Template literals (Approach 2) are the newer way and are easier to read.</p>}
      >
        <p>Print the multiplication table of n, from × 1 to × 10.</p>
      </Problem>

      <Problem
        n={7}
        title="Count multiples of 3 or 5"
        level="Easy"
        examples={[{ input: "N = 15", output: "7", why: "The numbers are 3, 5, 6, 9, 10, 12 and 15, which is seven in total. 15 is divisible by both, but it is counted once." }]}
        hints={[<>Start a counter at 0 before the loop.</>, <>Inside the loop, add 1 when <code>i % 3 === 0 || i % 5 === 0</code>.</>]}
        approaches={[
          {
            name: "Loop and count",
            idea: <p>Visit every number from 1 to N. Count the ones that pass the test.</p>,
            code: `function countMultiples(N) {
  let count = 0;
  for (let i = 1; i <= N; i++) {
    if (i % 3 === 0 || i % 5 === 0) count++;
  }
  return count;
}

console.log(countMultiples(15)); // 7`,
            explain: <p>This is a counting accumulator. The <code>||</code> (OR) makes one yes or no decision per number, so a number that is divisible by both is counted once.</p>,
          },
          {
            name: "Count with a formula (inclusion–exclusion)",
            idea: (
              <ol>
                <li>Multiples of 3 up to N: <code>Math.floor(N / 3)</code>.</li>
                <li>Multiples of 5: <code>Math.floor(N / 5)</code>.</li>
                <li>Numbers divisible by both (multiples of 15) were counted twice, so subtract <code>Math.floor(N / 15)</code> once.</li>
              </ol>
            ),
            code: `function countMultiples(N) {
  return Math.floor(N / 3) + Math.floor(N / 5) - Math.floor(N / 15);
}

console.log(countMultiples(15));  // 7
console.log(countMultiples(100)); // 47`,
            explain: <p>For N = 15: 5 multiples of 3, plus 3 multiples of 5, minus 1 multiple of 15, gives 7. No loop is needed, so it is instant for any N.</p>,
          },
        ]}
        compare={<p>Start with the loop (Approach 1), because it is easy to get right. If the interviewer says N can be a billion, the formula (Approach 2) is the answer they want.</p>}
      >
        <p>How many numbers from 1 to N are divisible by 3 or by 5?</p>
      </Problem>

      <Problem
        n={8}
        title="FizzBuzz, 1 to N"
        level="Easy"
        examples={[{ input: "N = 15", output: "1\n2\nFizz\n4\nBuzz\n…\n14\nFizzBuzz", why: "One line per number. Multiples of 3 become Fizz, multiples of 5 Buzz, multiples of both FizzBuzz." }]}
        hints={[<>You already solved FizzBuzz for one number in Lesson 3.</>, <>Put that code inside a loop from 1 to N.</>]}
        approaches={[
          {
            name: "else-if chain inside a loop",
            idea: <p>The answer from Lesson 3 for a single number, now run for every number from 1 to N.</p>,
            code: `const N = 15;
for (let i = 1; i <= N; i++) {
  if (i % 15 === 0) console.log("FizzBuzz");
  else if (i % 3 === 0) console.log("Fizz");
  else if (i % 5 === 0) console.log("Buzz");
  else console.log(i);
}

/* Output:
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
*/`,
            explain: <p>Divisible by both 3 and 5 is the same as divisible by 15, so the first check can be shorter.</p>,
          },
          {
            name: "Counters instead of %",
            idea: <p>Keep two counters that count up to 3 and 5 and then go back to 0. No division is needed at all.</p>,
            code: `const N = 6;
let three = 0, five = 0;
for (let i = 1; i <= N; i++) {
  three++;
  five++;
  let word = "";
  if (three === 3) { word += "Fizz"; three = 0; }
  if (five === 5) { word += "Buzz"; five = 0; }
  console.log(word || i);
}

/* Output:
1
2
Fizz
4
Buzz
Fizz
*/`,
            explain: <p><code>word || i</code> gives the word if it is not empty, and otherwise gives the number. (An empty string is falsy, from Lesson 3.) Interviewers sometimes ask this as a follow-up: &ldquo;solve it without using %&rdquo;.</p>,
          },
        ]}
        compare={<p>Approach 1 is the standard answer. Approach 2 is useful if the interviewer adds the rule &ldquo;no % allowed&rdquo;.</p>}
      >
        <p>For every number from 1 to N, print Fizz (divisible by 3), Buzz (divisible by 5), FizzBuzz (divisible by both) or the number itself. This is LeetCode 412.</p>
      </Problem>

      <Problem
        n={9}
        title="First N Fibonacci numbers"
        level="Medium"
        examples={[
          { input: "N = 7", output: "0 1 1 2 3 5 8", why: "Start with 0 and 1. Each next number is the sum of the two numbers before it: 0+1=1, 1+1=2, 1+2=3, 2+3=5, 3+5=8." },
          { input: "N = 1", output: "0", why: "Only the first number." },
        ]}
        hints={[
          <>You only need the previous two numbers each time. Keep them in two variables, <code>a</code> and <code>b</code>.</>,
          <>Each step: print <code>a</code>, compute <code>next = a + b</code>, then move both forward: <code>a = b</code>, <code>b = next</code>.</>,
        ]}
        approaches={[
          {
            name: "Two variables that slide forward",
            idea: <p><code>a</code> is the current number and <code>b</code> is the next one. After printing <code>a</code>, move both one place forward.</p>,
            code: `function fibonacci(N) {
  let a = 0, b = 1;
  let result = "";
  for (let i = 1; i <= N; i++) {
    result += a + " ";
    const next = a + b;
    a = b;
    b = next;
  }
  return result.trim();
}

console.log(fibonacci(7)); // 0 1 1 2 3 5 8
console.log(fibonacci(1)); // 0`,
            explain: (
              <DryRun
                title="fibonacci(7)"
                cols={["i", "print a", "next = a + b", "a, b after"]}
                rows={[["1", "0", "1", "1, 1"], ["2", "1", "2", "1, 2"], ["3", "1", "3", "2, 3"], ["4", "2", "5", "3, 5"], ["5", "3", "8", "5, 8"], ["6", "5", "13", "8, 13"], ["7", "8", "21", "13, 21"]]}
              />
            ),
          },
          {
            name: "Keep the whole sequence in a list",
            idea: <p>Store every number in an array (a list). Build each new number from the last two entries.</p>,
            code: `function fibonacci(N) {
  const fib = [0, 1];
  for (let i = 2; i < N; i++) {
    fib.push(fib[i - 1] + fib[i - 2]);
  }
  return fib.slice(0, N).join(" ");
}

console.log(fibonacci(7)); // 0 1 1 2 3 5 8
console.log(fibonacci(1)); // 0`,
            explain: <p>Arrays are covered in Lesson 8. <code>push</code> adds an item to the end. <code>fib[i - 1]</code> reads the item at a position. <code>slice(0, N)</code> keeps the first N items. <code>join(&quot; &quot;)</code> turns the list into one string with spaces. This uses more memory, but you can look up any earlier number.</p>,
          },
        ]}
        compare={<p>Approach 1 uses only two variables, however big N is, so give it in an interview. Approach 2 is useful when you need to look back at earlier values. This is the idea behind dynamic programming (Lesson 54), a method that saves the answers to small problems and reuses them.</p>}
      >
        <p>Each Fibonacci number is the sum of the two numbers before it, starting with 0 and 1. Print the first N numbers on one line.</p>
      </Problem>

      <Problem
        n={10}
        title="Is it prime?"
        level="Medium"
        examples={[
          { input: "7", output: "true", why: "7 is divisible only by 1 and 7." },
          { input: "12", output: "false", why: "12 is divisible by 2, 3, 4 and 6." },
          { input: "1", output: "false", why: "By definition a prime must be greater than 1." },
        ]}
        hints={[
          <>Try dividing n by every number from 2 to n − 1. If any of them divides n exactly (with remainder 0), n is not prime.</>,
          <>As soon as you find one divisor, you know the answer — stop the loop with <code>break</code>.</>,
          <>You only need to try divisors up to √n (the square root of n). Why? Divisors come in pairs, and one number in each pair is at most √n.</>,
        ]}
        approaches={[
          {
            name: "Try every divisor from 2 to n − 1",
            idea: <p>Assume n is prime. Try each divisor. If one divides n exactly, change the answer to &ldquo;not prime&rdquo; and stop.</p>,
            code: `function isPrime(n) {
  if (n < 2) return false;
  let prime = true;              // a "flag": yes until proven no
  for (let d = 2; d < n; d++) {
    if (n % d === 0) {
      prime = false;
      break;                     // one divisor is enough
    }
  }
  return prime;
}

console.log(isPrime(7));  // true
console.log(isPrime(12)); // false
console.log(isPrime(1));  // false`,
            explain: <p>The <strong>flag</strong> variable <code>prime</code> (a true/false variable that records a yes or no answer) starts as <code>true</code>. It is switched to <code>false</code> as soon as a divisor is found. For a prime like 97, this checks 95 divisors.</p>,
          },
          {
            name: "Stop at the square root",
            idea: <p>If n = a × b, one of a and b is at most √n. So if no number up to √n divides n, no larger number can divide it either.</p>,
            code: `function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

console.log(isPrime(97));  // true
console.log(isPrime(91));  // false`,
            explain: <p><code>d * d &lt;= n</code> means &ldquo;d is at most √n&rdquo;, and it needs no square root calculation. For 97 that is only 8 divisors (2 to 9) instead of 95. For 91, the loop finds 7 (91 = 7 × 13).</p>,
          },
          {
            name: "Square root, odd divisors only",
            idea: <p>Handle 2 on its own. After that, no even number can divide an odd n, so try only odd divisors.</p>,
            code: `function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;   // 2 is the only even prime
  for (let d = 3; d * d <= n; d += 2) {
    if (n % d === 0) return false;
  }
  return true;
}

console.log(isPrime(2));   // true
console.log(isPrime(97));  // true
console.log(isPrime(100)); // false`,
            explain: <p>This halves the work again. The update <code>d += 2</code> visits 3, 5, 7, 9, and so on.</p>,
          },
        ]}
        compare={<p>Give Approach 2 in an interview. It is short and much faster than Approach 1. Mention Approach 3 as a further improvement. Lesson 13 shows how to find all primes up to N at once with the Sieve of Eratosthenes.</p>}
      >
        <p>A prime is a whole number greater than 1 that is divisible only by 1 and itself. Return whether n is prime.</p>
      </Problem>
    </>
  );
}
