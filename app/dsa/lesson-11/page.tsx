import type { Metadata } from "next";
import ArrayBoxes from "@/components/dsa/ArrayBoxes";
import Callout from "@/components/Callout";
import CodeTrace from "@/components/dsa/CodeTrace";
import DryRun from "@/components/dsa/DryRun";
import DsaLessonPage from "@/components/dsa/DsaLesson";
import Questions from "./questions";
import Recall from "@/components/dsa/Recall";
import CodeBlock from "@/components/sd/CodeBlock";
import { getDsaLesson } from "@/lib/dsa";
import { tracer } from "@/lib/dsa-trace";

const lesson = getDsaLesson("lesson-11");

export const metadata: Metadata = {
  title: `Lesson 11 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Most wrong answers start with a misread question" },
  { id: "parts", label: "The five parts of every problem" },
  { id: "constraints", label: "Reading the constraints" },
  { id: "clarify", label: "Clarifying questions" },
  { id: "by-hand", label: "Solve the examples by hand" },
  { id: "edge", label: "Listing edge cases" },
  { id: "brute", label: "Brute force first, then improve" },
  { id: "trace", label: "Traced: the one-pass solution" },
  { id: "method", label: "The eight-step method" },
  { id: "aloud", label: "Explaining your thinking out loud" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const statement = `Second largest
Given an array of numbers nums, return the second largest value.

Example 1:  nums = [4, 9, 7, 2]   →  7
Example 2:  nums = [10, 5]        →  5

Constraints:
  0 <= nums.length <= 10^5
  -10^9 <= nums[i] <= 10^9`;

const bruteCode = `function secondLargest(nums) {
  const sorted = [...nums].sort((a, b) => b - a);   // largest first
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] < sorted[0]) return sorted[i];     // first value smaller than the max
  }
  return null;                                       // no second distinct value
}

console.log(secondLargest([4, 9, 7, 9, 2]));  // 7
console.log(secondLargest([5, 5, 5]));        // null
console.log(secondLargest([]));               // null`;

const onePassCode = `function secondLargest(nums) {
  let first = -Infinity;
  let second = -Infinity;
  for (const x of nums) {
    if (x > first) {
      second = first;
      first = x;
    } else if (x < first && x > second) {
      second = x;
    }
  }
  return second === -Infinity ? null : second;
}
console.log(secondLargest([4, 9, 7, 9, 2]));`;

function onePassTrace() {
  const t = tracer();
  const nums = [4, 9, 7, 9, 2];
  let first = -Infinity;
  t.step(2, "start", "first = -Infinity", "-Infinity is smaller than any number, so the first value we see will replace it. Starting at 0 would break on input with only negative numbers.", { nums, first }, "first");
  let second = -Infinity;
  t.step(3, "start", "second = -Infinity", "Same idea for the second place (the runner-up).", { nums, first, second }, "second");
  for (const x of nums) {
    t.step(4, "check", `Next value: x = ${x}`, "Take the next value from the array.", { nums, first, second, x }, "x");
    if (x > first) {
      t.step(5, "check", `${x} > ${first}? yes`, "A new largest value.", { nums, first, second, x });
      second = first;
      t.step(6, "update", `second = ${second}`, "The old largest becomes the second largest.", { nums, first, second, x }, "second");
      first = x;
      t.step(7, "update", `first = ${first}`, `${x} is the largest so far.`, { nums, first, second, x }, "first");
    } else if (x < first && x > second) {
      t.step(8, "check", `${x} < ${first} and ${x} > ${second}? yes`, "Not the largest, but better than the current runner-up.", { nums, first, second, x });
      second = x;
      t.step(9, "update", `second = ${second}`, `${x} is the new second largest.`, { nums, first, second, x }, "second");
    } else {
      t.step(8, "check", `${x} > ${first}? no. ${x} < ${first} and ${x} > ${second}? no`, x === first ? `${x} equals the largest. This is the duplicate case that our clarifying question settled: skip it.` : `${x} is too small to matter.`, { nums, first, second, x });
    }
  }
  const result = second === -Infinity ? null : second;
  t.step(12, "done", `return ${result}`, "second was changed, so it holds the answer.", { nums, first, second });
  t.print(result);
  t.step(14, "print", "console.log(…)", "One pass over five values. The duplicate 9 was handled correctly.", { nums, first, second });
  return t.steps;
}

export default function DsaLessonElevenPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Most wrong answers start with a misread question</h2>
      <p>
        Part 1 gave you the tools: loops, functions, arrays, strings and Maps. Part 2 is about using
        these tools on problems you have never seen before. The first skill is not coding. It is
        reading the problem well.
      </p>
      <p>
        In interviews, many candidates who fail could have written the code. They made one of three
        mistakes. They solved a slightly different problem from the one asked. They forgot the empty
        array. Or they started typing before they understood the examples.
      </p>
      <p>
        This lesson gives you a fixed routine that prevents all three mistakes. It takes about five
        minutes, and it saves much more time than it costs.
      </p>

      <h2 id="parts">The five parts of every problem</h2>
      <p>
        Interview problems and LeetCode problems all have the same shape. (LeetCode is a website
        with coding practice problems.) Here is one problem that we will use for the whole lesson:
      </p>
      <CodeBlock lang="text" code={statement} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Part</th>
              <th>What it tells you</th>
              <th>In this problem</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Statement</td><td>The task in words</td><td>Find the second largest value</td></tr>
            <tr><td>Input</td><td>What your function receives, and its type</td><td><code>nums</code>, an array of numbers</td></tr>
            <tr><td>Output</td><td>What your function must return, and its type</td><td>One number</td></tr>
            <tr><td>Examples</td><td>Real input and output pairs. Use them to check that you understood the problem</td><td><code>[4, 9, 7, 2]</code> → <code>7</code></td></tr>
            <tr><td>Constraints</td><td>Limits on the size and on the values of the input</td><td>Up to 100,000 numbers, negatives allowed, can be empty</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Before anything else, write the input and output as a <strong>function signature</strong>.
        A function signature is the function&apos;s name, its inputs and what it returns. It turns a
        paragraph of text into something concrete:
      </p>
      <CodeBlock lang="js" code={`function secondLargest(nums) {   // nums: number[]  →  returns a number\n  // ...\n}`} />

      <h2 id="constraints">Reading the constraints</h2>
      <p>
        Constraints are the rules about what input is allowed. Many people skip them, but they are
        the most useful part of a problem. Each line answers a question that you would otherwise
        have to guess:
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Constraint</th>
              <th>What it means for your code</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>0 &lt;= nums.length</code></td>
              <td>The array can be <strong>empty</strong>. Your code must return something sensible for <code>[]</code>.</td>
            </tr>
            <tr>
              <td><code>nums.length &lt;= 10^5</code></td>
              <td>Up to 100,000 values. Two nested loops (a loop inside a loop) would do about 100,000 × 100,000 = 10 billion steps. That is too slow. Lesson 12 shows how to judge this quickly. (<code>10^5</code> means 10 to the power 5, which is 100,000.)</td>
            </tr>
            <tr>
              <td><code>-10^9 &lt;= nums[i]</code></td>
              <td>Values can be <strong>negative</strong>. Starting a &ldquo;largest so far&rdquo; variable at 0 would be a bug. (<code>10^9</code> is one billion.)</td>
            </tr>
            <tr>
              <td><code>nums[i] &lt;= 10^9</code></td>
              <td>Values fit easily in a JavaScript number. Even the sum of all of them (at most 10<sup>14</sup>) stays exact. JavaScript numbers are exact for whole numbers up to about 9 × 10<sup>15</sup>.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout kind="note" label="Look for these words too">
        <p className="mb-0">
          &ldquo;sorted&rdquo;, &ldquo;distinct&rdquo; (all different), &ldquo;non-negative&rdquo;
          (0 or more), &ldquo;exactly one answer&rdquo;, &ldquo;in place&rdquo; (change the
          original array) and &ldquo;any order&rdquo;. Each of these words either removes a case that
          you would have to handle, or adds a rule that you must follow. Underline them.
        </p>
      </Callout>

      <h2 id="clarify">Clarifying questions</h2>
      <p>
        Read the statement again and try <code>[5, 5, 3]</code>. Is the second largest value 5 (the
        second item in sorted order) or 3 (the second <em>different</em> value)? The problem does not
        say. Also, what should the function return for <code>[]</code> or <code>[5]</code>?
      </p>
      <p>
        When a problem is not clear, <strong>ask</strong>. These are called{" "}
        <strong>clarifying questions</strong>. Interviewers often leave gaps on purpose, to see if
        you notice them. For this lesson, assume that the interviewer answered like this:
      </p>
      <ul>
        <li>&ldquo;Second largest&rdquo; means the second largest <strong>distinct</strong> value, so <code>[5, 5, 3]</code> → 3.</li>
        <li>If there is no such value, return <code>null</code>. (<code>null</code> is a special value that means &ldquo;nothing&rdquo;.) Returning <code>-1</code> would be a bad choice here, because -1 can be a real value in the array.</li>
      </ul>
      <p>The same kinds of questions are worth asking again and again:</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ask about</th>
              <th>Example question</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Empty or tiny input</td><td>Can the array be empty? What should I return then?</td></tr>
            <tr><td>Duplicates</td><td>Can values repeat? Do repeated values count separately?</td></tr>
            <tr><td>Value range</td><td>Can numbers be negative or zero? Can they be very large?</td></tr>
            <tr><td>Order</td><td>Is the input sorted? Does the order of my output matter?</td></tr>
            <tr><td>No answer</td><td>What if no valid answer exists? Is there always exactly one?</td></tr>
            <tr><td>Changing the input</td><td>May I modify the array, or must I leave it unchanged?</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="by-hand">Solve the examples by hand</h2>
      <p>
        Before you think about code, solve an example yourself, slowly. Then notice <em>how</em> you
        did it. Your own method is usually the first algorithm. (An <em>algorithm</em> is a list of
        clear steps that solves a problem.)
      </p>
      <ArrayBoxes
        values={[4, 9, 7, 9, 2]}
        name="nums"
        highlight={[1, 2]}
        marks={{ 1: "largest", 2: "second" }}
        caption="By hand: scan for the largest (9), then the largest value that is smaller than 9 (7)."
        note="The second 9 is not the answer, because the interviewer asked for distinct values."
      />
      <p>
        Most people scan the list once and keep the two biggest values in their head. This
        observation is the key: &ldquo;I only need to remember two numbers.&rdquo; It will become the
        efficient solution.
      </p>

      <h2 id="edge">Listing edge cases</h2>
      <p>
        An <strong>edge case</strong> is a valid input at the very limit of what the problem allows.
        It is often the input that breaks a solution. Write the edge cases down <em>before</em> you
        code, and write the expected answer next to each. Then they become your tests.
      </p>
      <DryRun
        title="edge cases for secondLargest"
        cols={["Input", "Expected", "Why it is tricky"]}
        rows={[
          ["[]", "null", "nothing to compare"],
          ["[5]", "null", "only one value"],
          ["[5, 5, 5]", "null", "all values equal"],
          ["[7, 9]", "7", "largest is last"],
          ["[9, 7]", "7", "largest is first"],
          ["[-3, -1, -2]", "-2", "all negative"],
          ["[4, 9, 7, 9, 2]", "7", "the largest is repeated"],
        ]}
        note="The same few edge cases fit almost every array problem: empty, one element, all equal, all negative, and the answer at the very start or very end."
      />

      <h2 id="brute">Brute force first, then improve</h2>
      <p>
        A <strong>brute force</strong> solution is the simplest solution that is correct, even if it
        is slow. It tries everything. Always find one first, for three reasons. It proves that you
        understand the problem. It gives you something to test a faster solution against. And in an
        interview, a working slow answer is much better than an unfinished fast one.
      </p>
      <p>
        Brute force here: sort the values from largest to smallest. Then take the first value that
        is smaller than the maximum.
      </p>
      <CodeBlock lang="js" code={bruteCode} />
      <p>
        It is correct, but sorting does more work than we need. It puts <em>every</em> value in
        order, and we only care about the top two. To improve a brute force, ask:{" "}
        <strong>what work is wasted or repeated?</strong> Here, the wasted work is the sorting. Our
        by-hand method needed only two variables and one pass. (A <em>pass</em> is one trip through
        the whole array.)
      </p>

      <h2 id="trace">Traced: the one-pass solution</h2>
      <CodeTrace
        code={onePassCode}
        steps={onePassTrace()}
        caption="Keep the largest and second largest seen so far. Each new value either becomes the largest, becomes the second largest, or is ignored."
      />
      <p>
        Now test it against every row of the edge-case table. This is called a <strong>dry run</strong>:
        you follow the code by hand with an example input, and you do not run it on a computer. For{" "}
        <code>[]</code>, the loop never starts. So <code>second</code> stays <code>-Infinity</code>{" "}
        and the function returns <code>null</code>. For <code>[5, 5, 5]</code>, <code>first</code>{" "}
        becomes 5, and the two other 5s are skipped. So it also returns <code>null</code>. All seven
        rows pass.
      </p>

      <h2 id="method">The eight-step method</h2>
      <p>Use the same steps for every problem, from the easiest to the hardest:</p>
      <Callout kind="ok" label="Eight steps — use them every time">
        <ol className="mb-0 mt-1 list-decimal pl-5">
          <li><strong>Restate</strong> the problem in your own words.</li>
          <li><strong>Write down</strong> the input, the output and the constraints.</li>
          <li><strong>Ask</strong> clarifying questions about anything unclear.</li>
          <li><strong>Solve the examples by hand</strong> and notice your own method.</li>
          <li><strong>List edge cases</strong> with their expected answers.</li>
          <li><strong>Describe the brute force</strong> and how much work it does.</li>
          <li><strong>Improve it</strong> by removing wasted or repeated work, then write the code.</li>
          <li><strong>Test</strong> with a dry run on one example and on each edge case.</li>
        </ol>
      </Callout>
      <p>
        Steps 1 to 6 happen before you write any code. This is on purpose. If you write code before
        you understand the problem, you usually have to write it again.
      </p>

      <h2 id="aloud">Explaining your thinking out loud</h2>
      <p>
        In an interview, the interviewer judges your thinking, not only your final code. If you work
        in silence, they cannot help you. They also cannot give you credit for good ideas that you
        did not say. So talk through the eight steps. Simple sentences are enough:
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Step</th>
              <th>What you might say</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Restate</td><td>&ldquo;So I need to return the second largest distinct value, or null if there isn&apos;t one.&rdquo;</td></tr>
            <tr><td>Ask</td><td>&ldquo;Can the array be empty? Should duplicates of the maximum count?&rdquo;</td></tr>
            <tr><td>Brute force</td><td>&ldquo;The simplest approach is to sort and scan. That works, but sorting is more than we need.&rdquo;</td></tr>
            <tr><td>Improve</td><td>&ldquo;I only need the top two values, so I can track them in one pass.&rdquo;</td></tr>
            <tr><td>Code</td><td>&ldquo;first holds the largest so far, second the runner-up…&rdquo;</td></tr>
            <tr><td>Test</td><td>&ldquo;Let me dry-run [4, 9, 7, 9, 2], then check the empty array.&rdquo;</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Practise this even when you are alone. When you say your reasoning out loud, you also notice
        your own mistakes sooner.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>
        For each question, go through the eight steps on paper before you open any hint. Pay special
        attention to the constraints. Several of these questions change completely if you misread
        one line.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the eight steps from memory, in order.</>,
          <>List five clarifying questions you could ask about almost any array problem.</>,
          <>Take any LeetCode problem you have not solved and do only steps 1–6 for it, without writing code.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Several times in this lesson we said that a solution was &ldquo;too slow&rdquo; or &ldquo;more
        work than needed&rdquo;. Lesson 12 makes this exact with <strong>Big-O</strong>. Big-O is a
        simple way to count how much work code does. With it, you can decide from the constraints
        alone which approach will be fast enough.
      </p>
    </DsaLessonPage>
  );
}
