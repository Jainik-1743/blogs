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

const lesson = getDsaLesson("lesson-14");

export const metadata: Metadata = {
  title: `Lesson 14 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "A function that calls itself" },
  { id: "parts", label: "Base case and recursive case" },
  { id: "trace", label: "Traced: factorial(4) and the call stack" },
  { id: "stack", label: "The call stack, drawn" },
  { id: "order", label: "Printing 1 to N and N to 1" },
  { id: "sum", label: "Sum and factorial" },
  { id: "arrays", label: "Recursion on arrays and strings" },
  { id: "fib", label: "Two calls at once: Fibonacci" },
  { id: "overflow", label: "Stack overflow" },
  { id: "vs-loops", label: "Recursion or a loop?" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const countdown = `function countdown(n) {
  if (n === 0) {                // base case: stop here
    console.log("Lift-off!");
    return;
  }
  console.log(n);
  countdown(n - 1);             // recursive case: a smaller problem
}

countdown(3);
// 3
// 2
// 1
// Lift-off!`;

const factCode = `function factorial(n) {
  if (n === 1) return 1;
  return n * factorial(n - 1);
}
console.log(factorial(4));`;

function factTrace() {
  const t = tracer();
  const stack: string[] = [];
  function fact(n: number): number {
    stack.push(`factorial(${n})`);
    t.step(1, "start", `Call factorial(${n})`, stack.length === 1 ? "The first call. A new frame is placed on the call stack." : `A new frame for n = ${n} goes on top of the stack. The frames below are paused, waiting.`, { n, stack: [...stack] }, "stack");
    if (n === 1) {
      t.step(2, "check", "n === 1? yes — base case", "No further call is needed. This frame can answer directly.", { n, stack: [...stack] });
      stack.pop();
      t.step(2, "done", "return 1", "The top frame is removed, and 1 goes back to the frame below.", { n, returned: 1, stack: [...stack] }, "stack");
      return 1;
    }
    t.step(2, "check", `${n} === 1? no`, "Not the base case, so we need a smaller answer first.", { n, stack: [...stack] });
    t.step(3, "run", `${n} * factorial(${n - 1})`, `To finish, this frame needs factorial(${n - 1}). It pauses here and makes the call.`, { n, stack: [...stack] });
    const sub = fact(n - 1);
    const result = n * sub;
    stack.pop();
    t.step(3, "done", `return ${n} * ${sub} = ${result}`, `factorial(${n - 1}) answered ${sub}. This frame resumes, finishes the multiplication and is removed.`, { n, returned: result, stack: [...stack] }, "returned");
    return result;
  }
  const answer = fact(4);
  t.print(answer);
  t.step(5, "print", "console.log(24)", "The stack grew to four frames, then emptied in reverse order.", { stack: [] });
  return t.steps;
}

const orderCode = `function upTo(n) {
  if (n === 0) return;
  upTo(n - 1);          // first handle 1 … n-1
  console.log(n);       // then print n  → printed on the way back
}

function downFrom(n) {
  if (n === 0) return;
  console.log(n);       // print n first → printed on the way in
  downFrom(n - 1);
}

upTo(3);    // 1 2 3
downFrom(3); // 3 2 1`;

const sumCode = `// sum(n) = n + sum(n - 1),   sum(0) = 0
function sumTo(n) {
  if (n === 0) return 0;
  return n + sumTo(n - 1);
}

// n! = n × (n - 1)!,   0! = 1
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log(sumTo(5));      // 15
console.log(factorial(5));  // 120
console.log(factorial(0));  // 1`;

const arrCode = `// The sum of an array = first item + the sum of the rest
function sumArray(arr, i = 0) {
  if (i === arr.length) return 0;          // nothing left
  return arr[i] + sumArray(arr, i + 1);
}

// A string reversed = (the rest reversed) + the first character
function reverse(s) {
  if (s.length <= 1) return s;
  return reverse(s.slice(1)) + s[0];
}

console.log(sumArray([4, 1, 7]));  // 12
console.log(reverse("code"));      // edoc`;

const fibCode = `function fib(n) {
  if (n < 2) return n;                 // fib(0) = 0, fib(1) = 1
  return fib(n - 1) + fib(n - 2);      // two recursive calls
}

console.log(fib(10)); // 55`;

const overflowCode = `function forever(n) {
  return forever(n + 1);   // no base case
}

forever(0);
// RangeError: Maximum call stack size exceeded`;

export default function DsaLessonFourteenPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">A function that calls itself</h2>
      <p>
        You are standing in a long queue (a line of people) and want to know your position. You cannot
        see the front. So you ask the person in front of you: &ldquo;What is your position?&rdquo; They
        do not know either, so they ask the person in front of them, and so on. The person at the very
        front knows the answer without asking: &ldquo;1&rdquo;. Each answer then travels back: 2, 3, 4…
        until it reaches you.
      </p>
      <p>
        That is <strong>recursion</strong>. Recursion is a way of solving a problem by asking the same
        question about a smaller version of the problem. In code, it is a function that calls itself.
        (A function is a named block of code that you can run by calling its name.) The example below
        counts down from 3. Each call prints one number and then calls the same function with a smaller
        number.
      </p>
      <CodeBlock lang="js" code={countdown} />

      <h2 id="parts">Base case and recursive case</h2>
      <p>Every correct recursive function has these three parts:</p>
      <Callout kind="ok" label="The three rules of recursion">
        <ol className="mb-0 mt-1 list-decimal pl-5">
          <li><strong>A base case</strong> is the smallest input. The function answers it directly, with no further call. (This is the person at the front of the queue.)</li>
          <li><strong>A recursive case</strong> is the part where the function calls itself on a <em>smaller</em> input and uses that answer.</li>
          <li><strong>Progress</strong> means every call moves closer to the base case, so the base case is always reached.</li>
        </ol>
      </Callout>
      <p>
        The hardest part for beginners is trusting the recursive call. Take the{" "}
        <strong>factorial</strong> as an example. The factorial of n, written n!, is n × (n − 1) × … × 1.
        So 4! = 4 × 3 × 2 × 1 = 24. When you write <code>factorial(n - 1)</code>, do not try to follow it
        all the way down. Assume it returns the correct answer for n − 1. Then ask only:{" "}
        <em>how do I use that to get the answer for n?</em>{" "}
        Since n! = n × (n − 1)!, the answer is <code>n * factorial(n - 1)</code>.
      </p>

      <h2 id="trace">Traced: factorial(4) and the call stack</h2>
      <p>
        Now let us follow it all the way down once, to see what the computer really does. Watch the{" "}
        <code>stack</code> variable. It shows every call that has started but has not finished yet.
      </p>
      <CodeTrace
        code={factCode}
        steps={factTrace()}
        caption="Going in, each call pauses and waits for a smaller one. Coming out, each paused call resumes and finishes its multiplication."
      />

      <h2 id="stack">The call stack, drawn</h2>
      <p>
        The <strong>call stack</strong> is the list of function calls that are still running. A stack is a
        list where you add and remove items only at the top, like a pile of plates. Each call gets its own{" "}
        <strong>frame</strong>. A frame is the note the computer keeps for one call: its own copy of{" "}
        <code>n</code> and the place where the call must continue. New frames go on top. Only the top
        frame runs. When it returns, it is removed and the frame below continues.
      </p>
      <DryRun
        title="the call stack for factorial(4), top of stack on the left"
        cols={["Moment", "Stack (top first)", "What happens"]}
        rows={[
          ["1", "f(4)", "f(4) needs f(3)"],
          ["2", "f(3) · f(4)", "f(3) needs f(2)"],
          ["3", "f(2) · f(3) · f(4)", "f(2) needs f(1)"],
          ["4", "f(1) · f(2) · f(3) · f(4)", "base case: f(1) returns 1"],
          ["5", "f(2) · f(3) · f(4)", "f(2) returns 2 × 1 = 2"],
          ["6", "f(3) · f(4)", "f(3) returns 3 × 2 = 6"],
          ["7", "f(4)", "f(4) returns 4 × 6 = 24"],
        ]}
        highlight={3}
        note="Four frames exist at the deepest point. A recursion that goes n levels deep needs n frames at once. That is O(n) memory, even though we made no array."
      />
      <p>
        This is why recursion has a <strong>space cost</strong>. Lesson 12 said that space complexity counts
        the extra memory a program uses. The call stack is extra memory. So <code>factorial(n)</code> uses
        O(n) space.
      </p>

      <h2 id="order">Printing 1 to N and N to 1</h2>
      <p>
        Where you put the work decides the order. You can put it before the recursive call or after it.
        Work done <em>before</em> the call happens on the way down. Work done <em>after</em> the call
        happens on the way back up.
      </p>
      <CodeBlock lang="js" code={orderCode} />
      <DryRun
        title="upTo(3): the print runs after the call returns"
        cols={["Going in", "Coming back out"]}
        rows={[
          ["upTo(3) calls upTo(2)", "upTo(3) prints 3 (last)"],
          ["upTo(2) calls upTo(1)", "upTo(2) prints 2"],
          ["upTo(1) calls upTo(0)", "upTo(1) prints 1 (first)"],
          ["upTo(0) returns (base case)", ""],
        ]}
      />

      <h2 id="sum">Sum and factorial</h2>
      <p>
        Many maths definitions are already recursive. Write the definition, translate each line into code,
        and the function is finished:
      </p>
      <CodeBlock lang="js" code={sumCode} />
      <p>
        Note the base case <code>n &lt;= 1</code> in this <code>factorial</code>. It also covers
        0! = 1 (by definition, the factorial of 0 is 1). If the base case were only <code>n === 1</code>,
        then <code>factorial(0)</code> would call <code>factorial(-1)</code>, then{" "}
        <code>factorial(-2)</code>, and never stop. (The earlier traced version only works for n ≥ 1.)
      </p>

      <h2 id="arrays">Recursion on arrays and strings</h2>
      <p>
        For an array or string, &ldquo;a smaller problem&rdquo; usually means &ldquo;the same thing
        without its first item&rdquo;. You can pass an index that moves forward, or you can pass a
        shorter copy:
      </p>
      <CodeBlock lang="js" code={arrCode} />
      <p>
        Passing an index is cheaper. <code>s.slice(1)</code> makes a copy of the string (everything except
        the first character) on every call. That adds an O(n) step to each of the n calls, so the total
        is O(n²). For short inputs either way is fine. In interviews, prefer the index.
      </p>

      <h2 id="fib">Two calls at once: Fibonacci</h2>
      <p>
        The <strong>Fibonacci numbers</strong> are a list of numbers where each one is the sum of the two
        before it: 0, 1, 1, 2, 3, 5, 8, 13… The definition translates directly into code with{" "}
        <strong>two</strong> recursive calls:
      </p>
      <CodeBlock lang="js" code={fibCode} />
      <p>
        It is correct, but look at how many calls it makes. <code>fib(5)</code> calls{" "}
        <code>fib(4)</code> and <code>fib(3)</code>. Then <code>fib(4)</code> calls <code>fib(3)</code>{" "}
        <em>again</em>. The same values are worked out over and over:
      </p>
      <DryRun
        title="total calls made by fib(n)"
        cols={["n", "fib(n)", "Calls"]}
        rows={[
          ["5", "5", "15"],
          ["10", "55", "177"],
          ["20", "6,765", "21,891"],
          ["30", "832,040", "2,692,537"],
        ]}
        highlight={3}
        note="Each step up in n multiplies the work by about 1.6. That is exponential growth (the work multiplies at every step), roughly O(2ⁿ) from Lesson 12."
      />
      <p>
        A loop that remembers the last two values does the same job in O(n). Lesson 32 draws these
        calls as a tree. Lesson 54 fixes the repetition with <strong>memoisation</strong>. Memoisation
        means saving the answer of a call the first time you work it out, so that you can reuse it
        instead of calculating it again. It is the first step into dynamic programming (solving a big
        problem by saving the answers to its small problems).
      </p>

      <h2 id="overflow">Stack overflow</h2>
      <p>
        Every frame uses memory, and the call stack has a size limit. Suppose there is no base case, or the
        base case is never reached. Then the stack fills up. This is called a{" "}
        <strong>stack overflow</strong>, and JavaScript stops the program with an error:
      </p>
      <CodeBlock lang="js" code={overflowCode} />
      <p>
        In Node.js the limit is roughly 10,000 frames for a simple function. The exact number depends on
        the engine and on how much each frame stores. So even a <em>correct</em> recursion fails if it
        goes too deep. <code>sumTo(100000)</code> overflows, while a loop handles it easily.
      </p>
      <Callout kind="warn" label="When you see “Maximum call stack size exceeded”">
        <p className="mb-0">
          Check three things. Is there a base case? Does every call move towards it? Could the input
          make the recursion deeper than about 10,000 levels?
        </p>
      </Callout>

      <h2 id="vs-loops">Recursion or a loop?</h2>
      <p>Anything written with recursion can be written with a loop, and the other way round. Choose the one that is easier to read:</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Use a loop when…</th>
              <th>Use recursion when…</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>You walk through items one by one (sum, max, count)</td><td>The problem splits into smaller copies of itself (trees, merge sort)</td></tr>
            <tr><td>The depth could be very large (100,000+)</td><td>The depth is small, such as log n or the height of a tree</td></tr>
            <tr><td>You want O(1) extra space</td><td>You need to try several choices and undo them (backtracking)</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        For the simple problems in this lesson, loops are usually better in practice. We use recursion
        here because the problems are small enough to follow every step. You will need the same skill
        for trees (Part 11), backtracking (Part 8) and dynamic programming (Part 14), where recursion is
        the natural tool. (Backtracking means trying a choice, and going back to undo it if it does not
        work.)
      </p>

      <h2 id="practice">Practice questions</h2>
      <p>
        For each question, write the base case first, then the recursive case. Then dry-run the smallest
        input that is not the base case. (To dry-run means to follow the code by hand, line by line,
        with a small input.)
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>State the three rules of recursion from memory.</>,
          <>Draw the call stack for <code>sumTo(3)</code> at its deepest point, with what each frame is waiting for.</>,
          <>Explain why <code>upTo(n)</code> prints 1 first even though it is called with n first.</>,
          <>Say why <code>fib(30)</code> makes millions of calls, and what the loop version does instead.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        Lesson 15 closes Part 2 with hashing. You will count with arrays and Maps and answer frequency
        questions. Then you will look inside a hash table to see why <code>map.get</code> takes about
        the same time for ten items as for ten million.
      </p>
    </DsaLessonPage>
  );
}
