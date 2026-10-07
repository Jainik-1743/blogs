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
  t.step(2, "start", "first = -Infinity", "Smaller than any number, so the first value we see will replace it. Starting at 0 would break on all-negative input.", { nums, first }, "first");
  let second = -Infinity;
  t.step(3, "start", "second = -Infinity", "Same idea for the runner-up.", { nums, first, second }, "second");
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
      t.step(8, "check", `${x} > ${first}? no. ${x} < ${first} and ${x} > ${second}? no`, x === first ? `${x} equals the largest. This is the duplicate case a clarifying question settled: skip it.` : `${x} is too small to matter.`, { nums, first, second, x });
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
        them on problems you have never seen before. The first skill is not coding at all. It is
        reading the problem properly.
      </p>
      <p>
        In interviews, many candidates who fail could have written the code. They solved a slightly
        different problem from the one asked, forgot an empty array, or started typing before they
        understood the examples. This lesson gives you a fixed routine that prevents all three. It
        takes about five minutes, and it saves far more time than it costs.
      </p>

      <h2 id="parts">The five parts of every problem</h2>
      <p>
        Interview and LeetCode problems are written in the same shape. Here is one we will use for
        the whole lesson:
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
            <tr><td>Examples</td><td>Concrete input → output pairs to check your understanding</td><td><code>[4, 9, 7, 2]</code> → <code>7</code></td></tr>
            <tr><td>Constraints</td><td>Limits on size and values</td><td>Up to 100,000 numbers, negatives allowed, can be empty</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Before anything else, write the input and output as a function signature. It turns a
        paragraph of text into something concrete:
      </p>
      <CodeBlock lang="js" code={`function secondLargest(nums) {   // nums: number[]  →  returns a number\n  // ...\n}`} />

      <h2 id="constraints">Reading the constraints</h2>
      <p>
        The constraints are the most skipped part of a problem, and the most useful. Each line answers
        a question you would otherwise have to guess:
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
              <td>Up to 100,000 values. Two nested loops would do about 10 billion steps — too slow. Lesson 12 shows how to make this judgement quickly.</td>
            </tr>
            <tr>
              <td><code>-10^9 &lt;= nums[i]</code></td>
              <td>Values can be <strong>negative</strong>. Starting a &ldquo;largest so far&rdquo; variable at 0 would be a bug.</td>
            </tr>
            <tr>
              <td><code>nums[i] &lt;= 10^9</code></td>
              <td>Values fit easily in a JavaScript number. Even a sum of all of them (at most 10<sup>14</sup>) stays exact.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Callout kind="note" label="Look for these words too">
        <p className="mb-0">
          &ldquo;sorted&rdquo;, &ldquo;distinct&rdquo;, &ldquo;non-negative&rdquo;, &ldquo;exactly one
          answer&rdquo;, &ldquo;in place&rdquo;, &ldquo;any order&rdquo;. Each one removes a case you would
          otherwise have to handle — or adds a rule you must follow. Underline them.
        </p>
      </Callout>

      <h2 id="clarify">Clarifying questions</h2>
      <p>
        Read the statement again and try <code>[5, 5, 3]</code>. Is the second largest value 5 (the
        second item in sorted order) or 3 (the second <em>different</em> value)? The problem does not
        say. And what should the function return for <code>[]</code> or <code>[5]</code>?
      </p>
      <p>
        When a problem is unclear, <strong>ask</strong>. Interviewers often leave gaps on purpose,
        to see whether you notice them. For this lesson, assume the interviewer answered:
      </p>
      <ul>
        <li>&ldquo;Second largest&rdquo; means the second largest <strong>distinct</strong> value, so <code>[5, 5, 3]</code> → 3.</li>
        <li>If there is no such value, return <code>null</code>. (Returning <code>-1</code> would be a bad choice here, because -1 is a valid value in the array.)</li>
      </ul>
      <p>The questions worth asking come up again and again:</p>
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
        Before thinking about code, solve an example yourself, slowly, and notice <em>how</em> you did
        it. Your own method is usually the first algorithm.
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
        Most people scan the list once, keeping the two biggest values in their head. That observation —
        &ldquo;I only need to remember two numbers&rdquo; — will become the efficient solution.
      </p>

      <h2 id="edge">Listing edge cases</h2>
      <p>
        An <strong>edge case</strong> is a valid input at the limits of the problem. Write them down
        <em> before</em> coding, with the expected answer next to each. Then they become your tests.
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
        A <strong>brute force</strong> solution is the simplest one that is correct, even if it is
        slow. Always find one first. It proves you understand the problem, it gives you something to
        test against, and in an interview a working slow answer is far better than an unfinished fast
        one.
      </p>
      <p>Brute force here: sort the values from largest to smallest, then take the first value that is smaller than the maximum.</p>
      <CodeBlock lang="js" code={bruteCode} />
      <p>
        It is correct, but sorting does more work than we need: it puts <em>every</em> value in order
        when we only care about the top two. To improve a brute force, ask: <strong>what work is
        wasted, or repeated?</strong> Here, the answer is the sorting. Our by-hand method needed only
        two variables and one pass.
      </p>

      <h2 id="trace">Traced: the one-pass solution</h2>
      <CodeTrace
        code={onePassCode}
        steps={onePassTrace()}
        caption="Keep the largest and second largest seen so far. Each new value either becomes the largest, becomes the second largest, or is ignored."
      />
      <p>
        Now test it against every row of the edge-case table. <code>[]</code> never enters the loop,
        so <code>second</code> stays <code>-Infinity</code> and the function returns <code>null</code>.{" "}
        <code>[5, 5, 5]</code> sets <code>first</code> to 5 and then skips both duplicates, so it also
        returns <code>null</code>. All seven pass.
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
        Steps 1–6 happen before you write any code, and that is intentional. When code is
        written before the problem is understood, it usually has to be rewritten.
      </p>

      <h2 id="aloud">Explaining your thinking out loud</h2>
      <p>
        In an interview, the interviewer judges your thinking, not only your final code. If you
        work in silence they cannot help you, and they cannot give you credit for good ideas you did
        not say. Talk through the eight steps. Simple sentences are enough:
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
        Practise this even when you are alone. Saying your reasoning out loud also helps you notice
        your own mistakes sooner.
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>
        For each question, go through the eight steps on paper before opening any hint. Pay special
        attention to the constraints — several of these questions change completely if you misread
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
        Several times in this lesson we said a solution was &ldquo;too slow&rdquo; or &ldquo;more work
        than needed&rdquo;. Lesson 12 makes that precise with <strong>Big-O</strong>: a simple way to
        count how much work code does, and to decide from the constraints alone which approach will be
        fast enough.
      </p>
    </DsaLessonPage>
  );
}
