import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";
import CodeBlock from "@/components/sd/CodeBlock";

/** Lesson 2 practice questions. Every question shows each way to solve it. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Area and perimeter of a rectangle"
        level="Easy"
        examples={[
          { input: "length = 5, width = 3", output: "Area: 15\nPerimeter: 16", why: "Area = 5 × 3 = 15. Perimeter = 2 × (5 + 3) = 2 × 8 = 16." },
          { input: "length = 10, width = 10", output: "Area: 100\nPerimeter: 40", why: "Area = 10 × 10 = 100. Perimeter = 2 × (10 + 10) = 40." },
        ]}
        hints={[
          <>Store the length and the width in two variables first.</>,
          <>Area is <code>length * width</code>. Perimeter is <code>2 * (length + width)</code> — keep the brackets.</>,
        ]}
        approaches={[
          {
            name: "A variable for each result",
            idea: (
              <ol>
                <li>Store the inputs in two variables, <code>length</code> and <code>width</code>.</li>
                <li>Calculate <code>area</code> and <code>perimeter</code> into their own variables.</li>
                <li>Print both.</li>
              </ol>
            ),
            code: `const length = 5;
const width = 3;

const area = length * width;
const perimeter = 2 * (length + width);

console.log("Area:", area);           // Area: 15
console.log("Perimeter:", perimeter); // Perimeter: 16`,
            explain: <p>Naming each result makes the code easy to read and to check. The brackets in <code>2 * (length + width)</code> matter: without them, <code>2 * length + width</code> multiplies first and gives 13, which is wrong.</p>,
          },
          {
            name: "Calculate inside console.log",
            idea: <p>Skip the result variables and put the calculations straight into the print statements.</p>,
            code: `const length = 5;
const width = 3;

console.log("Area:", length * width);             // Area: 15
console.log("Perimeter:", 2 * (length + width));  // Perimeter: 16`,
            explain: <p>JavaScript calculates the expression first, then prints the result. The code is shorter, but you cannot reuse the results later.</p>,
          },
          {
            name: "Build the text with a template literal",
            idea: <p>A template literal is text between backticks. Use <code>{"${…}"}</code> inside it to place values in a sentence.</p>,
            code: `const length = 5;
const width = 3;

console.log(\`Area: \${length * width}, Perimeter: \${2 * (length + width)}\`);
// Area: 15, Perimeter: 16`,
            explain: <p>JavaScript calculates everything inside <code>{"${ }"}</code> and puts the result into the text. This is the clearest way to print a sentence that contains several values.</p>,
          },
        ]}
        compare={<p>Approach 1 is the best habit: clear names, each value calculated once. Use a template literal (Approach 3) whenever you print a sentence with values inside it.</p>}
      >
        <p>Given a length and a width, print the area (length × width) and the perimeter (2 × (length + width)).</p>
      </Problem>

      <Problem
        n={2}
        title="Swap two numbers"
        level="Easy"
        examples={[
          { input: "a = 5, b = 9", output: "a = 9 b = 5", why: "After the swap, a holds the value b had (9) and b holds the value a had (5)." },
          { input: "a = -1, b = 0", output: "a = 0 b = -1", why: "The same exchange works for any two numbers, including negatives and zero." },
        ]}
        hints={[
          <>Try <code>a = b; b = a;</code> on paper. What is in <code>b</code> at the end, and why?</>,
          <>Before you overwrite <code>a</code>, its value has to be saved somewhere.</>,
          <>Use a third variable: <code>temp = a</code>, then <code>a = b</code>, then <code>b = temp</code>.</>,
        ]}
        approaches={[
          {
            name: "A temporary variable",
            idea: (
              <ol>
                <li>Copy <code>a</code> into a spare variable, <code>temp</code>.</li>
                <li>Copy <code>b</code> into <code>a</code>. The old value of <code>a</code> is gone from <code>a</code>, but <code>temp</code> still has it.</li>
                <li>Copy <code>temp</code> into <code>b</code>.</li>
              </ol>
            ),
            code: `let a = 5;
let b = 9;

let temp = a;  // temp = 5
a = b;         // a = 9
b = temp;      // b = 5

console.log("a =", a, "b =", b); // a = 9 b = 5`,
            explain: (
              <DryRun
                title="a = 5, b = 9"
                cols={["Line", "a", "b", "temp"]}
                rows={[["temp = a", "5", "9", "5"], ["a = b", "9", "9", "5"], ["b = temp", "9", "5", "5"]]}
                highlight={2}
              />
            ),
          },
          {
            name: "Array destructuring",
            idea: <p>Destructuring is a short way to take values out of a list and put them into variables. It lets JavaScript assign two variables at once: <code>[a, b] = [b, a]</code>.</p>,
            code: `let a = 5;
let b = 9;

[a, b] = [b, a];

console.log("a =", a, "b =", b); // a = 9 b = 5`,
            explain: <p>The right side, <code>[b, a]</code>, is built first from the current values: <code>[9, 5]</code>. Then the first value goes into <code>a</code> and the second into <code>b</code>. (You will learn about arrays, which are lists written in square brackets, in Lesson 8.)</p>,
          },
          {
            name: "Arithmetic, without a third variable",
            idea: <p>Store the sum in <code>a</code>. Then get each original value back by subtracting.</p>,
            code: `let a = 5;
let b = 9;

a = a + b;  // a = 14
b = a - b;  // b = 14 - 9 = 5
a = a - b;  // a = 14 - 5 = 9

console.log("a =", a, "b =", b); // a = 9 b = 5`,
            explain: <p>This is sometimes asked as a puzzle (&ldquo;swap without a temporary variable&rdquo;). It only works for numbers, and it is harder to read, so people do not use it in real code.</p>,
          },
        ]}
        compare={<p>Know Approach 1 by heart. The same swap happens inside sorting algorithms (Lesson 16). Approach 2 is the short form you will see in modern JavaScript. Mention Approach 3 only if the interviewer asks.</p>}
      >
        <p>Swap the values of <code>a</code> and <code>b</code>, then print them.</p>
      </Problem>

      <Problem
        n={3}
        title="Minutes to hours and minutes"
        level="Easy"
        examples={[
          { input: "135", output: "2 hours 15 minutes", why: "Two whole hours are 120 minutes. 135 − 120 leaves 15 minutes." },
          { input: "60", output: "1 hours 0 minutes", why: "Exactly one hour, with nothing left over." },
          { input: "45", output: "0 hours 45 minutes", why: "Less than an hour: zero whole hours, and all 45 minutes are left over." },
        ]}
        hints={[
          <>How many whole groups of 60 fit into the number? That is the number of hours.</>,
          <><code>Math.floor(total / 60)</code> gives the whole groups. What gives the amount left over?</>,
        ]}
        approaches={[
          {
            name: "Math.floor and %",
            idea: (
              <ol>
                <li>Hours = how many whole 60s fit: <code>Math.floor(total / 60)</code>.</li>
                <li>Minutes = what is left over: <code>total % 60</code>.</li>
              </ol>
            ),
            code: `const total = 135;

const hours = Math.floor(total / 60); // 2
const minutes = total % 60;           // 15

console.log(hours + " hours " + minutes + " minutes"); // 2 hours 15 minutes`,
            explain: (
              <DryRun
                title="total = 135"
                cols={["Step", "Value"]}
                rows={[["135 / 60", "2.25"], ["Math.floor(2.25) → hours", "2"], ["135 % 60 → minutes", "15"]]}
              />
            ),
          },
          {
            name: "Math.floor, then subtract",
            idea: <p>After finding the hours, subtract the minutes that those hours use up. What remains is the minutes.</p>,
            code: `const total = 135;

const hours = Math.floor(total / 60);  // 2
const minutes = total - hours * 60;    // 135 - 120 = 15

console.log(hours + " hours " + minutes + " minutes"); // 2 hours 15 minutes`,
            explain: <p>This gives the same answer as <code>%</code>. It also shows what the remainder really means: the part that did not fit into a whole hour.</p>,
          },
        ]}
        compare={<p>Approach 1 is the standard pair, so remember it: <code>Math.floor</code> for &ldquo;how many whole groups&rdquo; and <code>%</code> for &ldquo;how much is left&rdquo;. It solves every unit-conversion question.</p>}
      >
        <p>Convert a number of minutes into hours and remaining minutes.</p>
      </Problem>

      <Problem
        n={4}
        title="Last digit, and the number without it"
        level="Easy"
        examples={[
          { input: "4729", output: "Last digit: 9\nRest: 472", why: "4729 ÷ 10 = 472 remainder 9. The remainder is the last digit. The whole part is the rest of the number." },
          { input: "50", output: "Last digit: 0\nRest: 5", why: "50 ÷ 10 = 5 remainder 0." },
        ]}
        hints={[<>Think about dividing by 10. What happens to each digit?</>, <>The remainder of dividing by 10 is the last digit. The whole part of the division is the rest.</>]}
        approaches={[
          {
            name: "% 10 and Math.floor(n / 10)",
            idea: (
              <ol>
                <li><code>n % 10</code> is the remainder after dividing by 10, which is the last digit.</li>
                <li><code>Math.floor(n / 10)</code> removes the last digit.</li>
              </ol>
            ),
            code: `const n = 4729;

const last = n % 10;
const rest = Math.floor(n / 10);

console.log("Last digit:", last); // Last digit: 9
console.log("Rest:", rest);       // Rest: 472`,
            explain: <p>Dividing by 10 moves every digit one place to the right: 4729 becomes 472.9. <code>Math.floor</code> drops the .9. The expression <code>% 10</code> gives the last digit, 9.</p>,
          },
          {
            name: "Subtract the last digit, then divide",
            idea: <p>Once you know the last digit, subtracting it leaves a number ending in 0, which divides by 10 exactly.</p>,
            code: `const n = 4729;

const last = n % 10;          // 9
const rest = (n - last) / 10; // 4720 / 10 = 472

console.log("Last digit:", last); // Last digit: 9
console.log("Rest:", rest);       // Rest: 472`,
            explain: <p>4729 − 9 = 4720, and 4720 / 10 = 472 exactly, so no rounding is needed.</p>,
          },
          {
            name: "Treat the number as text",
            idea: <p>Turn the number into a string (text) with <code>String(n)</code>, then take its last character.</p>,
            code: `const n = 4729;
const s = String(n);                        // "4729"

const last = Number(s[s.length - 1]);       // 9
const rest = Number(s.slice(0, s.length - 1)); // 472

console.log("Last digit:", last); // Last digit: 9
console.log("Rest:", rest);       // Rest: 472`,
            explain: <p><code>s[s.length - 1]</code> is the last character. (The number in square brackets is a position, counted from 0. <code>s.length</code> is the number of characters.) <code>s.slice(0, s.length - 1)</code> is everything before the last character. Strings are covered in Lesson 9. This works, but it converts back and forth between numbers and text.</p>,
          },
        ]}
        compare={<p>Use Approach 1. Interviewers expect the <code>% 10</code> and <code>Math.floor(n / 10)</code> pair. Lesson 5 builds on it to visit every digit of any number.</p>}
      >
        <p>Given a positive whole number, print its last digit and the number with the last digit removed.</p>
      </Problem>

      <Problem
        n={5}
        title="Sum of the digits of a 3-digit number"
        level="Easy"
        examples={[
          { input: "472", output: "13", why: "The digits are 4, 7 and 2. 4 + 7 + 2 = 13." },
          { input: "905", output: "14", why: "9 + 0 + 5 = 14." },
        ]}
        hints={[
          <>You already know how to get the last digit (<code>n % 10</code>) and remove it (<code>Math.floor(n / 10)</code>).</>,
          <>Do &ldquo;add the last digit, then remove it&rdquo; three times.</>,
        ]}
        approaches={[
          {
            name: "Take the last digit three times",
            idea: <p>Add the last digit to a running total, remove that digit, and repeat until all three digits are used.</p>,
            code: `let n = 472;
let sum = 0;

sum += n % 10;           // + 2
n = Math.floor(n / 10);  // n = 47
sum += n % 10;           // + 7
n = Math.floor(n / 10);  // n = 4
sum += n % 10;           // + 4

console.log(sum); // 13`,
            explain: (
              <DryRun
                title="n = 472"
                cols={["Line", "n", "n % 10", "sum"]}
                rows={[["start", "472", "—", "0"], ["sum += n % 10", "472", "2", "2"], ["n = floor(n/10)", "47", "—", "2"], ["sum += n % 10", "47", "7", "9"], ["n = floor(n/10)", "4", "—", "9"], ["sum += n % 10", "4", "4", "13"]]}
                highlight={5}
              />
            ),
          },
          {
            name: "Calculate each digit directly",
            idea: (
              <ol>
                <li>Hundreds digit: <code>Math.floor(n / 100)</code>.</li>
                <li>Tens digit: <code>Math.floor(n / 10) % 10</code>.</li>
                <li>Ones digit: <code>n % 10</code>.</li>
              </ol>
            ),
            code: `const n = 472;

const hundreds = Math.floor(n / 100);   // 4
const tens = Math.floor(n / 10) % 10;   // 47 % 10 = 7
const ones = n % 10;                    // 2

console.log(hundreds + tens + ones); // 13`,
            explain: <p>Each digit has its own formula, so the original number is never changed. This works only because we know the number has exactly three digits.</p>,
          },
          {
            name: "Read the digits as text",
            idea: <p>Convert the number to a string, then turn each character back into a number.</p>,
            code: `const s = String(472);   // "472"

const sum = Number(s[0]) + Number(s[1]) + Number(s[2]);

console.log(sum); // 13`,
            explain: <p><code>s[0]</code> is the character <code>&quot;4&quot;</code>, which is text. <code>Number</code> turns it into the number 4. Without <code>Number</code>, <code>+</code> would join the characters into <code>&quot;472&quot;</code> instead of adding them.</p>,
          },
        ]}
        compare={<p>Approach 1 is the one to learn. It repeats the same two lines, and in Lesson 5 a loop does that repetition for a number of any length. Approach 2 is short when the number of digits is fixed.</p>}
      >
        <p>Find the sum of the digits of a three-digit number.</p>
      </Problem>

      <Problem
        n={6}
        title="Predict the + results"
        level="Easy"
        examples={[
          { input: `console.log("5" + 3);`, output: "53", why: "One side is text, so + joins: \"5\" and \"3\" become \"53\"." },
          { input: `console.log(5 + 3 + "5");`, output: "85", why: "JavaScript works left to right: 5 + 3 = 8 first (two numbers), then 8 + \"5\" joins to \"85\"." },
        ]}
        hints={[<>Work from left to right, one <code>+</code> at a time.</>, <>At each <code>+</code>, ask: is either side text? If yes, it joins. If both are numbers, it adds. <code>-</code> always subtracts.</>]}
        approaches={[
          {
            name: "Apply the rule one + at a time",
            idea: <p>Work out each expression from left to right. At every step, decide whether <code>+</code> adds or joins.</p>,
            code: `console.log("5" + 3);     // 53
console.log("5" - 3);     // 2
console.log(5 + 3 + "5"); // 85
console.log("5" + 3 + 5); // 535`,
            explain: (
              <DryRun
                title="four expressions"
                cols={["Expression", "Step 1", "Step 2", "Result"]}
                rows={[
                  ['"5" + 3', 'text + number → join', "—", "53"],
                  ['"5" - 3', "- only subtracts: 5 - 3", "—", "2"],
                  ['5 + 3 + "5"', "5 + 3 = 8", '8 + "5" → join', "85"],
                  ['"5" + 3 + 5', '"5" + 3 = "53"', '"53" + 5 → join', "535"],
                ]}
              />
            ),
          },
          {
            name: "Convert the text first",
            idea: <p>If you want maths, turn the text into a number with <code>Number()</code> before using <code>+</code>.</p>,
            code: `console.log(Number("5") + 3);     // 8
console.log(5 + 3 + Number("5")); // 13`,
            explain: <p>With every value a number, <code>+</code> always adds. This is how you avoid the problem in real code, where input often arrives as text.</p>,
          },
        ]}
      >
        <p>Predict each output before running:</p>
        <CodeBlock lang="js" code={`console.log("5" + 3);\nconsole.log("5" - 3);\nconsole.log(5 + 3 + "5");\nconsole.log("5" + 3 + 5);`} />
      </Problem>

      <Problem
        n={7}
        title="Average of three numbers"
        level="Easy"
        examples={[
          { input: "4, 8, 9", output: "7", why: "4 + 8 + 9 = 21, and 21 / 3 = 7." },
          { input: "1, 2, 2", output: "1.6666666666666667", why: "1 + 2 + 2 = 5, and 5 / 3 is not a whole number, so the decimal part is kept." },
        ]}
        hints={[<>The average is the total divided by how many numbers there are.</>, <>Add first, then divide. Use brackets so the division happens last.</>]}
        approaches={[
          {
            name: "Add, then divide",
            idea: <p>Add the three numbers inside brackets, then divide by 3.</p>,
            code: `const a = 4, b = 8, c = 9;

const average = (a + b + c) / 3;

console.log(average); // 7`,
            explain: <p>Without the brackets, <code>a + b + c / 3</code> divides only <code>c</code> by 3, because division happens before addition. That gives 15 instead of 7.</p>,
          },
          {
            name: "Keep a separate total",
            idea: <p>Store the total in its own variable first. Then the division is easy to read.</p>,
            code: `const a = 1, b = 2, c = 2;

const total = a + b + c;      // 5
const average = total / 3;

console.log(average);                 // 1.6666666666666667
console.log(Math.round(average));     // 2     nearest whole number
console.log(average.toFixed(2));      // 1.67  two decimal places, as text`,
            explain: <p>When an answer must be a whole number, use <code>Math.round</code> (nearest) or <code>Math.floor</code> (round down). <code>toFixed(2)</code> gives the number as text with two decimal places, for display.</p>,
          },
        ]}
        compare={<p>Both are correct. Approach 2 is easier to read and lets you format the result in different ways. Always check whether a question wants the exact value, a rounded value, or a whole number.</p>}
      >
        <p>Print the average of three numbers (the total divided by how many numbers there are).</p>
      </Problem>

      <Problem
        n={8}
        title="Seconds to hours, minutes and seconds"
        level="Medium"
        examples={[
          { input: "3725", output: "1h 2m 5s", why: "One hour is 3600 seconds, leaving 125. 125 seconds is 2 minutes (120) and 5 seconds." },
          { input: "59", output: "0h 0m 59s", why: "Less than a minute: no whole hours, no whole minutes, 59 seconds." },
        ]}
        hints={[
          <>Start with the biggest unit. How many whole hours (3600 seconds each) fit into the total?</>,
          <>Find how many seconds are left after the hours. From those, take out the whole minutes (60 seconds each).</>,
          <>Whatever is left after the minutes is the seconds.</>,
        ]}
        approaches={[
          {
            name: "Math.floor and % twice",
            idea: (
              <ol>
                <li>Hours = <code>Math.floor(total / 3600)</code>. Seconds left = <code>total % 3600</code>.</li>
                <li>Minutes = <code>Math.floor(left / 60)</code>. Seconds = <code>left % 60</code>.</li>
              </ol>
            ),
            code: `const total = 3725;

const hours = Math.floor(total / 3600);       // 1
const afterHours = total % 3600;               // 125 seconds left
const minutes = Math.floor(afterHours / 60);  // 2
const seconds = afterHours % 60;              // 5

console.log(\`\${hours}h \${minutes}m \${seconds}s\`); // 1h 2m 5s`,
            explain: (
              <DryRun
                title="total = 3725"
                cols={["Variable", "How", "Value"]}
                rows={[["hours", "Math.floor(3725 / 3600)", "1"], ["afterHours", "3725 % 3600", "125"], ["minutes", "Math.floor(125 / 60)", "2"], ["seconds", "125 % 60", "5"]]}
              />
            ),
          },
          {
            name: "Convert everything to minutes first",
            idea: (
              <ol>
                <li>Total minutes = <code>Math.floor(total / 60)</code>. Seconds = <code>total % 60</code>.</li>
                <li>Hours = <code>Math.floor(totalMinutes / 60)</code>. Minutes = <code>totalMinutes % 60</code>.</li>
              </ol>
            ),
            code: `const total = 3725;

const totalMinutes = Math.floor(total / 60); // 62
const seconds = total % 60;                  // 5
const hours = Math.floor(totalMinutes / 60); // 1
const minutes = totalMinutes % 60;           // 2

console.log(\`\${hours}h \${minutes}m \${seconds}s\`); // 1h 2m 5s`,
            explain: <p>This uses only the number 60, which some people find easier to remember. 3725 seconds is 62 minutes and 5 seconds. 62 minutes is 1 hour and 2 minutes.</p>,
          },
        ]}
        compare={<p>Both use the same idea: <code>Math.floor</code> for whole units and <code>%</code> for the remainder. They only use a different order. Choose the one you can explain clearly.</p>}
      >
        <p>Convert a number of seconds into hours, minutes and seconds.</p>
      </Problem>
    </>
  );
}
