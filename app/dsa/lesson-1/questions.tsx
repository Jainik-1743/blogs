import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";
import CodeBlock from "@/components/sd/CodeBlock";

/** Lesson 1 practice questions. Every question shows each way to solve it. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Hello, World"
        level="Easy"
        examples={[
          {
            input: "(no input)",
            output: "Hello, World!",
            why: "The program prints exactly the characters between the quotes: capital H, a comma, a space, capital W and an exclamation mark.",
          },
        ]}
        hints={[
          <>Which statement prints something on the screen? You saw it in the &ldquo;console.log&rdquo; section.</>,
          <>Text must go inside quotes: <code>console.log(&quot;…&quot;)</code>.</>,
        ]}
        approaches={[
          {
            name: "One piece of text",
            idea: <p>Put the whole sentence inside one pair of quotes and print it.</p>,
            code: `console.log("Hello, World!"); // Hello, World!`,
            explain: <p>One statement, one line of output. The computer prints the text exactly as written, so check every character.</p>,
          },
          {
            name: "Two values separated by a comma",
            idea: <p><code>console.log</code> can print several values. It puts one space between them.</p>,
            code: `console.log("Hello,", "World!"); // Hello, World!`,
            explain: <p>The first value is <code>&quot;Hello,&quot;</code> and the second is <code>&quot;World!&quot;</code>. The space between them is added automatically.</p>,
          },
          {
            name: "Join two pieces of text with +",
            idea: <p>Between two pieces of text, <code>+</code> joins them into one longer piece of text. This is called <strong>concatenation</strong>.</p>,
            code: `console.log("Hello, " + "World!"); // Hello, World!`,
            explain: <p>The space is inside the first piece of text (<code>&quot;Hello, &quot;</code>). With <code>+</code>, no space is added for you, so you must include it yourself.</p>,
          },
        ]}
        compare={<p>Approach 1 is the simplest and clearest. The other two show tools you will use often: printing several values, and joining text.</p>}
      >
        <p>Write a program that prints <code>Hello, World!</code>.</p>
      </Problem>

      <Problem
        n={2}
        title="Introduce yourself in three lines"
        level="Easy"
        examples={[
          {
            input: "(no input)",
            output: "My name is Asha\nI live in Pune\nI am learning DSA",
            why: "Each sentence appears on its own line, in the same order as in the code.",
          },
        ]}
        hints={[
          <>Each <code>console.log</code> prints one line. How many lines do you need?</>,
          <>Write three <code>console.log</code> statements, one after the other.</>,
        ]}
        approaches={[
          {
            name: "Three console.log statements",
            idea: <p>One statement per line of output.</p>,
            code: `console.log("My name is Asha");
console.log("I live in Pune");
console.log("I am learning DSA");

/* Output:
My name is Asha
I live in Pune
I am learning DSA
*/`,
            explain: <p>The computer runs the statements from top to bottom, and every <code>console.log</code> ends with a new line.</p>,
          },
          {
            name: "One console.log with \\n",
            idea: <p>Inside text, the two characters <code>\n</code> mean &ldquo;start a new line here&rdquo;.</p>,
            code: `console.log("My name is Asha\\nI live in Pune\\nI am learning DSA");

/* Output:
My name is Asha
I live in Pune
I am learning DSA
*/`,
            explain: <p><code>\n</code> is called the <strong>newline character</strong>. It is not printed. It moves the output to the next line.</p>,
          },
        ]}
        compare={<p>Use three statements while learning — it is easier to read. Knowing <code>\n</code> is still useful, because you will see it in many programs.</p>}
      >
        <p>Print your name, your city and what you are learning, each on its own line.</p>
      </Problem>

      <Problem
        n={3}
        title="Maths or text?"
        level="Easy"
        examples={[
          { input: "console.log(2 + 3);", output: "5", why: "There are no quotes, so these are numbers. + adds them." },
          { input: `console.log("2 + 3");`, output: "2 + 3", why: "Everything is inside one pair of quotes, so it is text and is printed exactly as written." },
          { input: `console.log("2" + "3");`, output: "23", why: "Both values are text. Between text, + joins instead of adding." },
        ]}
        hints={[
          <>Look at each line and ask: are the values inside quotes?</>,
          <>No quotes → numbers → <code>+</code> adds. Quotes → text → <code>+</code> joins.</>,
        ]}
        approaches={[
          {
            name: "Reason it out line by line",
            idea: <p>Decide the type of each value first, then apply the rule for <code>+</code>.</p>,
            code: `console.log(2 + 3);     // 5
console.log("2 + 3");   // 2 + 3
console.log("2" + "3"); // 23`,
            explain: (
              <DryRun
                title="three lines"
                cols={["Line", "Values are", "+ means", "Prints"]}
                rows={[
                  ["2 + 3", "numbers", "add", "5"],
                  ['"2 + 3"', "one piece of text", "(nothing to do)", "2 + 3"],
                  ['"2" + "3"', "text and text", "join", "23"],
                ]}
              />
            ),
          },
          {
            name: "Check the type with typeof",
            idea: <p><code>typeof</code> is an operator that tells you the type of a value (what kind of value it is, such as number or text). Use it to confirm your answer.</p>,
            code: `console.log(typeof (2 + 3));     // number
console.log(typeof "2 + 3");     // string
console.log(typeof ("2" + "3")); // string`,
            explain: <p>A <strong>string</strong> is a value that is text. The third result is a string, which confirms that <code>+</code> joined the two pieces of text into <code>&quot;23&quot;</code>.</p>,
          },
        ]}
        compare={<p>In an interview you will reason it out (Approach 1). When you are unsure while practising, <code>typeof</code> gives a quick, certain answer.</p>}
      >
        <p>Without running it, predict what each line prints. Then run it and check.</p>
        <CodeBlock lang="js" code={`console.log(2 + 3);\nconsole.log("2 + 3");\nconsole.log("2" + "3");`} />
      </Problem>

      <Problem
        n={4}
        title="Predict the order"
        level="Easy"
        examples={[
          {
            input: "the program below",
            output: "C\nA\n7\nB",
            why: "The lines print in the order they are written. Line 3 has no quotes, so 10 − 3 is calculated and 7 is printed.",
          },
        ]}
        hints={[<>The computer always runs the first line first, then the second, and so on.</>, <>Which line contains maths instead of text?</>]}
        approaches={[
          {
            name: "Follow the program from top to bottom",
            idea: <p>Go through the lines one by one and write down what each one prints.</p>,
            code: `console.log("C");
console.log("A");
console.log(10 - 3);
console.log("B");

/* Output:
C
A
7
B
*/`,
            explain: <p>The order of the output always follows the order of the statements. It does not follow the alphabet or anything else. Only line 3 calculates something.</p>,
          },
        ]}
      >
        <p>What is printed, and in what order?</p>
        <CodeBlock lang="js" code={`console.log("C");\nconsole.log("A");\nconsole.log(10 - 3);\nconsole.log("B");`} />
      </Problem>

      <Problem
        n={5}
        title="Fix the SyntaxError"
        level="Easy"
        examples={[
          {
            input: `console.log("Hello);`,
            output: "Hello",
            why: "After the fix, the program prints the word Hello. Before the fix, it prints a SyntaxError and nothing else runs.",
          },
        ]}
        hints={[<>Count the quotes in the line. How many are there?</>, <>Every opening quote needs a matching closing quote before the <code>)</code>.</>]}
        approaches={[
          {
            name: "Add the missing double quote",
            idea: <p>The text opens with <code>&quot;</code> but never closes. Add the closing <code>&quot;</code>.</p>,
            code: `console.log("Hello");  // Hello`,
            explain: <p>Without the closing quote, JavaScript keeps reading until the end of the line, looking for the end of the text. It never finds it. The code breaks the rules of JavaScript, so you get a <code>SyntaxError</code> (an error about wrong code shape).</p>,
          },
          {
            name: "Use single quotes instead",
            idea: <p>Text can also be written between single quotes. Both quotes must be the same kind.</p>,
            code: `console.log('Hello');  // Hello`,
            explain: <p><code>&quot;Hello&quot;</code> and <code>&apos;Hello&apos;</code> are exactly the same text. Just never mix them. <code>&quot;Hello&apos;</code> is still an error.</p>,
          },
        ]}
        compare={<p>Either fix is correct. Pick one style of quote and use it everywhere in your code. This series uses double quotes.</p>}
      >
        <p>This line does not run. Find the problem and fix it so it prints <code>Hello</code>.</p>
      </Problem>

      <Problem
        n={6}
        title="Fix the ReferenceError"
        level="Easy"
        examples={[
          {
            input: `Console.log("Hi");`,
            output: "Hi",
            why: "After the fix, the program prints Hi. Before the fix, it prints: ReferenceError: Console is not defined.",
          },
        ]}
        hints={[<>Read the error message: which name does it say is &ldquo;not defined&rdquo;?</>, <>Compare that name with the one used in every other example. Look at the first letter.</>]}
        approaches={[
          {
            name: "Correct the capital letter",
            idea: <p>JavaScript is case-sensitive, which means a capital letter and a small letter are different. The built-in name is <code>console</code>, with a small c.</p>,
            code: `console.log("Hi");  // Hi`,
            explain: <p><code>Console</code> and <code>console</code> are two different names to JavaScript. Only <code>console</code> exists, so <code>Console</code> causes a <code>ReferenceError</code>, which means &ldquo;I do not know this name&rdquo;.</p>,
          },
        ]}
      >
        <p>This prints <code>ReferenceError: Console is not defined</code>. Why, and how do you fix it?</p>
      </Problem>

      <Problem
        n={7}
        title="Draw a box"
        level="Easy"
        examples={[
          {
            input: "(no input)",
            output: "*****\n*   *\n*****",
            why: "Three lines. The top and bottom lines have 5 stars. The middle line is a star, 3 spaces, and a star.",
          },
        ]}
        hints={[<>How many lines does the shape have? That is how many <code>console.log</code> statements you need.</>, <>The first and last lines are identical. The middle line is <code>&quot;*   *&quot;</code>.</>]}
        approaches={[
          {
            name: "One console.log per line",
            idea: <p>Write each line of the shape as its own piece of text.</p>,
            code: `console.log("*****");
console.log("*   *");
console.log("*****");

/* Output:
*****
*   *
*****
*/`,
            explain: <p>The middle line needs exactly 3 spaces so that its stars line up with the edges of the top and bottom lines.</p>,
          },
          {
            name: "Store the repeated line once",
            idea: <p>The top and bottom lines are the same. Write that text once, give it a name, and print it twice.</p>,
            code: `const edge = "*****";
const middle = "*   *";
console.log(edge);
console.log(middle);
console.log(edge);

/* Output:
*****
*   *
*****
*/`,
            explain: <p><code>edge</code> and <code>middle</code> are <strong>variables</strong> — named boxes that hold a value. You will learn them properly in Lesson 2. If the text ever needs to change, you change it in one place.</p>,
          },
        ]}
        compare={<p>Both are correct. Approach 2 avoids writing the same thing twice. This matters more as programs grow. In Lesson 6 you will draw boxes of any size with loops.</p>}
      >
        <p>Print this shape exactly. The middle line has 3 spaces between the stars.</p>
        <CodeBlock lang="text" code={`*****\n*   *\n*****`} />
      </Problem>
    </>
  );
}
