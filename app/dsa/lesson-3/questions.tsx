import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 3 practice questions. Every question shows each way to solve it. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Even or odd"
        level="Easy"
        examples={[
          { input: "n = 10", output: "even", why: "10 ÷ 2 = 5 with remainder 0, so 10 is even." },
          { input: "n = 7", output: "odd", why: "7 ÷ 2 = 3 with remainder 1, so 7 is odd." },
          { input: "n = 0", output: "even", why: "0 ÷ 2 = 0 with remainder 0. Zero is even." },
        ]}
        hints={[<>What is the remainder when an even number is divided by 2?</>, <>The remainder operator is <code>%</code>. Check whether <code>n % 2 === 0</code>.</>]}
        approaches={[
          {
            name: "if / else",
            idea: <p>If the remainder after dividing by 2 is 0, print &ldquo;even&rdquo;; otherwise print &ldquo;odd&rdquo;.</p>,
            code: `const n = 7;

if (n % 2 === 0) {
  console.log("even");
} else {
  console.log("odd"); // odd
}`,
            explain: <p>Every whole number leaves a remainder of either 0 or 1 when divided by 2, so exactly one branch runs.</p>,
          },
          {
            name: "Ternary operator",
            idea: <p>Choose between the two words in one expression with <code>condition ? a : b</code>.</p>,
            code: `const n = 10;
console.log(n % 2 === 0 ? "even" : "odd"); // even`,
            explain: <p>The ternary operator is a short <code>if / else</code> that produces a value. It is ideal when each branch is just one value.</p>,
          },
          {
            name: "Look only at the last digit",
            idea: <p>A number is even exactly when its last digit is 0, 2, 4, 6 or 8.</p>,
            code: `const n = 1234;
const last = n % 10;   // 4

if (last === 0 || last === 2 || last === 4 || last === 6 || last === 8) {
  console.log("even"); // even
} else {
  console.log("odd");
}`,
            explain: <p>This matches the rule you learned at school. It works, but it is longer than checking <code>n % 2</code> directly.</p>,
          },
        ]}
        compare={<p>Use Approach 1 or 2. <code>n % 2 === 0</code> is the standard even-number check and appears inside many larger problems.</p>}
      >
        <p>Print <code>even</code> or <code>odd</code> for a given whole number.</p>
      </Problem>

      <Problem
        n={2}
        title="Positive, negative or zero"
        level="Easy"
        examples={[
          { input: "n = 12", output: "positive", why: "12 is greater than 0." },
          { input: "n = -3", output: "negative", why: "-3 is less than 0." },
          { input: "n = 0", output: "zero", why: "0 is neither greater nor less than 0." },
        ]}
        hints={[<>There are three possible answers, so you need three branches.</>, <>Check <code>n &gt; 0</code>, then <code>n &lt; 0</code>. What is left?</>]}
        approaches={[
          {
            name: "if / else if / else",
            idea: <p>Test &ldquo;greater than 0&rdquo;, then &ldquo;less than 0&rdquo;. If neither is true, the number must be 0.</p>,
            code: `const n = -3;

if (n > 0) {
  console.log("positive");
} else if (n < 0) {
  console.log("negative"); // negative
} else {
  console.log("zero");
}`,
            explain: <p>The final <code>else</code> needs no condition because zero is the only number left. Always test the edge case 0 — interviewers will.</p>,
          },
          {
            name: "Math.sign",
            idea: <p><code>Math.sign(n)</code> returns 1 for positive numbers, -1 for negative numbers and 0 for zero. Turn that into a word.</p>,
            code: `const n = 12;
const sign = Math.sign(n);   // 1

if (sign === 1) console.log("positive"); // positive
else if (sign === -1) console.log("negative");
else console.log("zero");`,
            explain: <p>The built-in function does the comparison for you. You still need a chain to turn the number into text.</p>,
          },
        ]}
        compare={<p>Approach 1 is clearer and needs nothing special. Knowing <code>Math.sign</code> is useful when you only need the direction of a number.</p>}
      >
        <p>Print whether a number is <code>positive</code>, <code>negative</code> or <code>zero</code>.</p>
      </Problem>

      <Problem
        n={3}
        title="Largest of three"
        level="Easy"
        examples={[
          { input: "a = 4, b = 9, c = 2", output: "9", why: "9 is bigger than both 4 and 2." },
          { input: "a = 7, b = 7, c = 3", output: "7", why: "Two numbers tie for the largest. The answer is still 7." },
        ]}
        hints={[
          <>When is <code>a</code> the largest? It must be at least as big as <code>b</code> <em>and</em> at least as big as <code>c</code>.</>,
          <>Another way: start by assuming <code>a</code> is the largest, then let <code>b</code> and <code>c</code> replace it if they are bigger.</>,
        ]}
        approaches={[
          {
            name: "Compare each number with the other two",
            idea: <p><code>a</code> is the largest if <code>a &gt;= b</code> and <code>a &gt;= c</code>. Otherwise check <code>b</code> the same way. Otherwise it is <code>c</code>.</p>,
            code: `const a = 4, b = 9, c = 2;

if (a >= b && a >= c) {
  console.log(a);
} else if (b >= a && b >= c) {
  console.log(b); // 9
} else {
  console.log(c);
}`,
            explain: <p>Use <code>&gt;=</code>, not <code>&gt;</code>. With 7, 7, 3 and a plain <code>&gt;</code>, both of the first checks fail and the program wrongly prints 3.</p>,
          },
          {
            name: "Keep the best so far",
            idea: (
              <ol>
                <li>Start with <code>best = a</code>.</li>
                <li>If <code>b</code> is bigger than <code>best</code>, replace it.</li>
                <li>If <code>c</code> is bigger than <code>best</code>, replace it.</li>
              </ol>
            ),
            code: `const a = 4, b = 9, c = 2;

let best = a;
if (b > best) best = b;
if (c > best) best = c;

console.log(best); // 9`,
            explain: (
              <DryRun
                title="a = 4, b = 9, c = 2"
                cols={["Step", "Compare", "best"]}
                rows={[["start", "—", "4"], ["check b", "9 > 4 → yes", "9"], ["check c", "2 > 9 → no", "9"]]}
              />
            ),
          },
          {
            name: "Math.max",
            idea: <p>JavaScript has a built-in function that returns the largest of its arguments.</p>,
            code: `console.log(Math.max(4, 9, 2)); // 9
console.log(Math.max(7, 7, 3)); // 7`,
            explain: <p>Correct and short. In an interview, mention it, but be ready to write Approach 2 by hand.</p>,
          },
        ]}
        compare={<p>Remember Approach 2. &ldquo;Keep the best so far&rdquo; is the pattern that finds the maximum of a whole array with a loop in Lesson 8, and it works no matter how many values there are.</p>}
      >
        <p>Print the largest of three numbers.</p>
      </Problem>

      <Problem
        n={4}
        title="Grade from marks"
        level="Easy"
        examples={[
          { input: "91", output: "A", why: "91 is 90 or more." },
          { input: "75", output: "B", why: "75 is below 90 but exactly on the B boundary (75 or more)." },
          { input: "49", output: "F", why: "49 is below 50." },
        ]}
        hints={[<>Which grade should be checked first: A or F?</>, <>Start with the strictest condition (90 and above). Each later <code>else if</code> only runs if the earlier ones failed.</>]}
        approaches={[
          {
            name: "else-if chain from the top",
            idea: <p>Check from the highest grade down. The first condition that is true decides the grade.</p>,
            code: `const marks = 75;

if (marks >= 90) {
  console.log("A");
} else if (marks >= 75) {
  console.log("B"); // B
} else if (marks >= 50) {
  console.log("C");
} else {
  console.log("F");
}`,
            explain: <p>When <code>marks &gt;= 75</code> is checked, we already know marks is below 90, so it does not need to be written again. Check the boundary exactly: 75 must give B, so it is <code>&gt;= 75</code>.</p>,
          },
          {
            name: "Full ranges with &&",
            idea: <p>Write each grade as a complete range, so the order no longer matters.</p>,
            code: `const marks = 91;

if (marks >= 90) console.log("A"); // A
if (marks >= 75 && marks < 90) console.log("B");
if (marks >= 50 && marks < 75) console.log("C");
if (marks < 50) console.log("F");`,
            explain: <p>Every condition is checked, and exactly one is true. This is longer and easier to get wrong at the boundaries, which is why the else-if chain is preferred.</p>,
          },
        ]}
        compare={<p>Use Approach 1. An else-if chain is shorter, checks fewer conditions, and cannot print two grades by mistake.</p>}
      >
        <p>90 and above: A. 75–89: B. 50–74: C. Below 50: F.</p>
      </Problem>

      <Problem
        n={5}
        title="Leap year"
        level="Medium"
        examples={[
          { input: "2024", output: "true", why: "Divisible by 4 and not by 100." },
          { input: "1900", output: "false", why: "Divisible by 4, but also by 100, and not by 400." },
          { input: "2000", output: "true", why: "Divisible by 400, which always makes a leap year." },
        ]}
        hints={[
          <>The rule: a year is a leap year if it is divisible by 400, <em>or</em> divisible by 4 but <em>not</em> by 100.</>,
          <>&ldquo;Divisible by 4&rdquo; is <code>year % 4 === 0</code>. Combine the parts with <code>||</code> and <code>&amp;&amp;</code>.</>,
        ]}
        approaches={[
          {
            name: "One combined condition",
            idea: <p>Translate the rule word by word into a single boolean expression.</p>,
            code: `const year = 1900;

const isLeap = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);

console.log(isLeap); // false`,
            explain: (
              <DryRun
                title="three years"
                cols={["year", "% 400 === 0", "% 4 === 0", "% 100 !== 0", "leap?"]}
                rows={[["2024", "false", "true", "true", "true"], ["1900", "false", "true", "false", "false"], ["2000", "true", "—", "—", "true"]]}
              />
            ),
          },
          {
            name: "Step-by-step else-if chain",
            idea: (
              <ol>
                <li>Divisible by 400 → leap year.</li>
                <li>Otherwise, divisible by 100 → not a leap year.</li>
                <li>Otherwise, divisible by 4 → leap year.</li>
                <li>Otherwise → not a leap year.</li>
              </ol>
            ),
            code: `const year = 2024;
let isLeap;

if (year % 400 === 0) isLeap = true;
else if (year % 100 === 0) isLeap = false;
else if (year % 4 === 0) isLeap = true;
else isLeap = false;

console.log(isLeap); // true`,
            explain: <p>The order is the important part: the 400 rule must come before the 100 rule, or 2000 would be wrongly rejected.</p>,
          },
        ]}
        compare={<p>Both are correct. The chain (Approach 2) is easier to read and explain; the single expression (Approach 1) is shorter. In Approach 1, the <code>—</code> cells are never checked: once the left side of <code>||</code> is true, JavaScript skips the right side (this is called short-circuiting).</p>}
      >
        <p>Print <code>true</code> if a year is a leap year, otherwise <code>false</code>.</p>
      </Problem>

      <Problem
        n={6}
        title="Can these sides make a triangle?"
        level="Easy"
        examples={[
          { input: "3, 4, 5", output: "true", why: "3 + 4 > 5, 3 + 5 > 4 and 4 + 5 > 3. All three checks pass." },
          { input: "1, 2, 3", output: "false", why: "1 + 2 = 3, which is not greater than 3. The sides would lie flat in a line." },
        ]}
        hints={[<>The rule: every pair of sides must add up to more than the third side.</>, <>That is three separate checks. All of them must be true, so join them with <code>&amp;&amp;</code>.</>]}
        approaches={[
          {
            name: "Check all three pairs",
            idea: <p>Write the three checks and join them with <code>&amp;&amp;</code>.</p>,
            code: `const a = 1, b = 2, c = 3;

const valid = a + b > c && a + c > b && b + c > a;

console.log(valid); // false`,
            explain: <p>If any one check is false, the whole expression is false.</p>,
          },
          {
            name: "Check only the longest side",
            idea: <p>If the longest side is shorter than the other two together, the other two checks are automatically true.</p>,
            code: `const a = 3, b = 4, c = 5;

const longest = Math.max(a, b, c);
const total = a + b + c;
const valid = total - longest > longest;   // the other two sides vs the longest

console.log(valid); // true`,
            explain: <p><code>total - longest</code> is the sum of the two shorter sides. Only this check can ever fail, so it is the only one needed.</p>,
          },
        ]}
        compare={<p>Approach 1 follows the rule directly and is the safest to write in an interview. Approach 2 shows a useful habit: think about which check is the hardest to pass.</p>}
      >
        <p>Given three side lengths, print whether they can form a triangle.</p>
      </Problem>

      <Problem
        n={7}
        title="FizzBuzz for one number"
        level="Easy"
        examples={[
          { input: "15", output: "FizzBuzz", why: "15 is divisible by both 3 and 5." },
          { input: "9", output: "Fizz", why: "9 is divisible by 3 but not by 5." },
          { input: "10", output: "Buzz", why: "10 is divisible by 5 but not by 3." },
          { input: "7", output: "7", why: "7 is divisible by neither, so the number itself is printed." },
        ]}
        hints={[<>There are four possible outputs. Which case is the most specific?</>, <>Check &ldquo;divisible by both&rdquo; first. If you check &ldquo;divisible by 3&rdquo; first, 15 will print Fizz and stop.</>]}
        approaches={[
          {
            name: "else-if chain, most specific case first",
            idea: <p>Check &ldquo;both&rdquo;, then &ldquo;3 only&rdquo;, then &ldquo;5 only&rdquo;, then print the number.</p>,
            code: `const n = 15;

if (n % 3 === 0 && n % 5 === 0) {
  console.log("FizzBuzz"); // FizzBuzz
} else if (n % 3 === 0) {
  console.log("Fizz");
} else if (n % 5 === 0) {
  console.log("Buzz");
} else {
  console.log(n);
}`,
            explain: <p>Divisible by both 3 and 5 is the same as divisible by 15, so the first condition can also be written <code>n % 15 === 0</code>.</p>,
          },
          {
            name: "Build the word piece by piece",
            idea: (
              <ol>
                <li>Start with an empty string.</li>
                <li>If divisible by 3, add &ldquo;Fizz&rdquo;. If divisible by 5, add &ldquo;Buzz&rdquo;.</li>
                <li>If the string is still empty, print the number instead.</li>
              </ol>
            ),
            code: `const n = 10;

let word = "";
if (n % 3 === 0) word += "Fizz";
if (n % 5 === 0) word += "Buzz";

console.log(word === "" ? n : word); // Buzz`,
            explain: <p>&ldquo;FizzBuzz&rdquo; appears naturally when both checks add their part. This version is easy to extend: adding a new rule (for example &ldquo;Bazz&rdquo; for 7) is one more line.</p>,
          },
        ]}
        compare={<p>Both are accepted. Approach 1 is the standard answer. Approach 2 is a good one to mention because it shows you think about how code changes over time.</p>}
      >
        <p>Print <code>Fizz</code> if n is divisible by 3, <code>Buzz</code> if by 5, <code>FizzBuzz</code> if by both, otherwise the number itself.</p>
      </Problem>

      <Problem
        n={8}
        title="Electricity bill with slabs"
        level="Medium"
        examples={[
          { input: "units = 80", output: "400", why: "All 80 units are in the first slab: 80 × 5 = 400." },
          { input: "units = 250", output: "1700", why: "First 100 × 5 = 500, next 100 × 7 = 700, last 50 × 10 = 500. Total 1700." },
        ]}
        hints={[
          <>Split the units into three parts: the first 100, the next 100, and everything above 200.</>,
          <>For 250 units the parts are 100, 100 and 50. Multiply each part by its own rate.</>,
        ]}
        approaches={[
          {
            name: "One branch per range",
            idea: <p>Decide which range the units fall in, then write the full cost for that range.</p>,
            code: `const units = 250;
let bill;

if (units <= 100) {
  bill = units * 5;
} else if (units <= 200) {
  bill = 100 * 5 + (units - 100) * 7;
} else {
  bill = 100 * 5 + 100 * 7 + (units - 200) * 10;
}

console.log(bill); // 1700`,
            explain: (
              <DryRun
                title="units = 250"
                cols={["Part", "Units", "Rate", "Cost"]}
                rows={[["first slab", "100", "5", "500"], ["second slab", "100", "7", "700"], ["above 200", "50", "10", "500"], ["total", "250", "", "1700"]]}
                highlight={3}
              />
            ),
          },
          {
            name: "Calculate every slab with Math.min and Math.max",
            idea: (
              <ol>
                <li>Units in slab 1 = <code>Math.min(units, 100)</code>.</li>
                <li>Units in slab 2 = what is above 100, but at most 100.</li>
                <li>Units in slab 3 = whatever is above 200 (or 0).</li>
              </ol>
            ),
            code: `const units = 250;

const slab1 = Math.min(units, 100);                       // 100
const slab2 = Math.min(Math.max(units - 100, 0), 100);    // 100
const slab3 = Math.max(units - 200, 0);                   // 50

console.log(slab1 * 5 + slab2 * 7 + slab3 * 10); // 1700`,
            explain: <p><code>Math.max(x, 0)</code> stops a part from going negative, and <code>Math.min(x, 100)</code> stops it from going above the slab size. No branches are needed, and adding a fourth slab is easy.</p>,
          },
        ]}
        compare={<p>Approach 1 is the easiest to explain. Approach 2 avoids repeating the slab prices in every branch, which matters when there are many slabs.</p>}
      >
        <p>The first 100 units cost 5 each, the next 100 cost 7 each, and every unit above 200 costs 10. Print the bill for a given number of units.</p>
      </Problem>

      <Problem
        n={9}
        title="Day name from a number"
        level="Easy"
        examples={[
          { input: "1", output: "Monday", why: "Day 1 is Monday." },
          { input: "7", output: "Sunday", why: "Day 7 is Sunday." },
          { input: "9", output: "Invalid day", why: "There is no day 9, so the default answer is printed." },
        ]}
        hints={[<>You are matching one value against seven exact options. Which statement from this lesson fits that best?</>, <>Use <code>switch (day)</code> with one <code>case</code> per day, a <code>break</code> after each, and a <code>default</code>.</>]}
        approaches={[
          {
            name: "switch",
            idea: <p>One <code>case</code> per day number, and <code>default</code> for anything else.</p>,
            code: `const day = 7;
let name;

switch (day) {
  case 1: name = "Monday"; break;
  case 2: name = "Tuesday"; break;
  case 3: name = "Wednesday"; break;
  case 4: name = "Thursday"; break;
  case 5: name = "Friday"; break;
  case 6: name = "Saturday"; break;
  case 7: name = "Sunday"; break;
  default: name = "Invalid day";
}

console.log(name); // Sunday`,
            explain: <p>Each <code>break</code> stops the switch after the matching case. Without the breaks, day 1 would fall through every case and end as &ldquo;Invalid day&rdquo;.</p>,
          },
          {
            name: "else-if chain",
            idea: <p>The same logic with <code>if</code> and <code>else if</code>.</p>,
            code: `const day = 1;
let name;

if (day === 1) name = "Monday";
else if (day === 2) name = "Tuesday";
else if (day === 3) name = "Wednesday";
else if (day === 4) name = "Thursday";
else if (day === 5) name = "Friday";
else if (day === 6) name = "Saturday";
else if (day === 7) name = "Sunday";
else name = "Invalid day";

console.log(name); // Monday`,
            explain: <p>Correct, but every line repeats <code>day ===</code>. For many exact matches, <code>switch</code> reads better.</p>,
          },
          {
            name: "Look it up in a list",
            idea: <p>Store the names in order in an array and use the day number as the position.</p>,
            code: `const day = 9;
const names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const name = day >= 1 && day <= 7 ? names[day - 1] : "Invalid day";

console.log(name); // Invalid day`,
            explain: <p>Arrays (Lesson 8) number their items from 0, so day 1 is at position 0 — hence <code>day - 1</code>. This is the shortest version and is common in real code.</p>,
          },
        ]}
        compare={<p>Use <code>switch</code> (Approach 1) for this lesson. Once you know arrays, the lookup (Approach 3) is usually the cleanest choice for mapping numbers to names.</p>}
      >
        <p>Given a number from 1 to 7, print the name of the day (1 is Monday). For any other number, print <code>Invalid day</code>.</p>
      </Problem>
    </>
  );
}
