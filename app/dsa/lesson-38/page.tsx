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

const lesson = getDsaLesson("lesson-38");

export const metadata: Metadata = {
  title: `Lesson 38 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Last in, first out" },
  { id: "array", label: "A stack is an array with two rules" },
  { id: "brackets", label: "Matching brackets" },
  { id: "trace", label: "Traced: ( [ { } ] ] " },
  { id: "when", label: "How to spot a stack problem" },
  { id: "min", label: "A stack that knows its minimum" },
  { id: "postfix", label: "Evaluating postfix expressions" },
  { id: "decode", label: "Brackets inside brackets: decode a string" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const arrayCode = `const stack = [];
stack.push(1);          // [1]          put on top
stack.push(2);          // [1, 2]
stack.push(3);          // [1, 2, 3]
console.log(stack[stack.length - 1]); // 3   peek: look at the top without removing it
console.log(stack.pop());             // 3   remove and return the top
console.log(stack.pop());             // 2
console.log(stack.length);            // 1
console.log(stack.length === 0);      // false  (isEmpty)
console.log([].pop());                // undefined  (popping an empty stack does not throw)`;

const bracketsCode = `function isValid(s) {
  const pairs = { ")": "(", "]": "[", "}": "{" };   // closer -> its opener
  const stack = [];
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);                                // an opener waits for its closer
    } else {
      if (stack.pop() !== pairs[ch]) return false;   // the most recent opener must match
    }
  }
  return stack.length === 0;                         // anything left over was never closed
}

console.log(isValid("()[]{}")); // true
console.log(isValid("([{}])")); // true
console.log(isValid("(]"));     // false
console.log(isValid("(("));     // false
console.log(isValid(")"));      // false`;

const traceSrc = `const stack = [];
for (const ch of s) {
  if (ch === "(" || ch === "[" || ch === "{") {
    stack.push(ch);
  } else {
    if (stack.pop() !== pairs[ch]) return false;
  }
}
return stack.length === 0;`;

function bracketTrace() {
  const t = tracer();
  const s = "([{}]]";
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const stack: string[] = [];
  t.step(1, "start", "stack = []", "The stack holds the opening brackets that are still waiting for a closing bracket. The top is the most recent one.", { s, stack: [...stack] });
  for (const ch of s) {
    if ("([{".includes(ch)) {
      stack.push(ch);
      t.step(4, "update", `"${ch}" is an opener: push it`, "It must be closed later. It must be closed before any bracket that was pushed earlier.", { ch, stack: [...stack] }, "stack");
    } else {
      const top = stack.pop();
      t.step(6, "check", `"${ch}" is a closer: pop ${top === undefined ? "(empty)" : `"${top}"`}, need "${pairs[ch]}"`, "A closing bracket must match the most recent opening bracket that is still open. That is exactly the top of the stack.", { ch, popped: top ?? "undefined", needed: pairs[ch], stack: [...stack] }, "stack");
      if (top !== pairs[ch]) {
        t.step(6, "stop", "mismatch: return false", `The top was ${top === undefined ? "nothing" : `"${top}"`} but "${ch}" needs "${pairs[ch]}". The brackets are not nested correctly.`, { ch, stack: [...stack] });
        return t.steps;
      }
    }
  }
  t.step(9, "done", `return ${stack.length === 0}`, "Everything matched and nothing is left on the stack.", { stack: [...stack] });
  return t.steps;
}

const minCode = `class MinStack {
  constructor() { this.items = []; this.mins = []; }       // mins[i] = the smallest value among items[0..i]
  push(x) {
    this.items.push(x);
    const prevMin = this.mins.length ? this.mins[this.mins.length - 1] : Infinity;
    this.mins.push(Math.min(x, prevMin));
  }
  pop() { this.mins.pop(); return this.items.pop(); }
  top() { return this.items[this.items.length - 1]; }
  getMin() { return this.mins[this.mins.length - 1]; }     // O(1): the answer is always already stored
}

const m = new MinStack();
m.push(5); m.push(3); m.push(7);
console.log(m.getMin()); // 3
m.pop();                 // removes 7
console.log(m.getMin()); // 3
m.pop();                 // removes 3
console.log(m.getMin()); // 5`;

const postfixCode = `// Postfix (Reverse Polish): the operator comes after its two operands.
// "2 1 + 3 *" means (2 + 1) * 3.
function evalRPN(tokens) {
  const stack = [];
  for (const tok of tokens) {
    if (tok === "+" || tok === "-" || tok === "*" || tok === "/") {
      const b = stack.pop();           // the right operand was pushed LAST, so it pops first
      const a = stack.pop();
      if (tok === "+") stack.push(a + b);
      else if (tok === "-") stack.push(a - b);
      else if (tok === "*") stack.push(a * b);
      else stack.push(Math.trunc(a / b));   // division truncates toward zero
    } else {
      stack.push(Number(tok));
    }
  }
  return stack[0];
}

console.log(evalRPN(["2", "1", "+", "3", "*"]));            // 9
console.log(evalRPN(["4", "13", "5", "/", "+"]));           // 6
console.log(evalRPN(["7", "-2", "/"]));                     // -3  (trunc, not floor)`;

const decodeCode = `// "3[a2[c]]" -> "accaccacc"
function decodeString(s) {
  const counts = [];
  const texts = [];
  let cur = "";          // the text being built at the current depth
  let num = 0;           // a repeat count being read
  for (const ch of s) {
    if (ch >= "0" && ch <= "9") {
      num = num * 10 + Number(ch);       // counts can have several digits
    } else if (ch === "[") {
      counts.push(num);                  // remember the count and the text so far, then start fresh inside the bracket
      texts.push(cur);
      num = 0;
      cur = "";
    } else if (ch === "]") {
      const times = counts.pop();
      cur = texts.pop() + cur.repeat(times);   // glue the repeated inside onto what came before
    } else {
      cur += ch;
    }
  }
  return cur;
}

console.log(decodeString("3[a]2[bc]"));   // aaabcbc
console.log(decodeString("3[a2[c]]"));    // accaccacc
console.log(decodeString("2[ab]c"));      // ababc`;

export default function DsaLessonThirtyEightPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Last in, first out</h2>
      <p>
        A <strong>stack</strong> is like a pile of plates. You can only add a plate on top, and you can only take a plate from the top. So the plate
        you put on last is the first one to come off. This rule is called <strong>LIFO</strong>: last in, first out. A stack
        has just three operations. Each one is O(1), which means it takes the same short time however big the stack is:
      </p>
      <ul>
        <li><strong>push</strong> — put a value on top.</li>
        <li><strong>pop</strong> — remove and return the top value.</li>
        <li><strong>peek</strong> — look at the top value without removing it. Most stacks also have <em>isEmpty</em>, which tells you if the stack has nothing in it.</li>
      </ul>
      <p>
        You have already used a stack, even if you did not know its name. The <strong>call stack</strong> is a stack. It is the list of
        function calls that have started but not finished. This is what recursion (a function calling itself) uses. The most recent
        function call is the first to finish.
      </p>

      <h2 id="array">A stack is an array with two rules</h2>
      <p>
        JavaScript has no separate stack type, and it does not need one. If you use an array only with <code>push</code> and{" "}
        <code>pop</code>, it <em>is</em> a stack. The end of the array is the top. Both operations are O(1).
      </p>
      <CodeBlock lang="js" code={arrayCode} />
      <Callout kind="warn" label="Use the end, not the front">
        <code>unshift</code> and <code>shift</code> work on the front of an array. They have to move every other item, so they take O(n) time. Always treat the{" "}
        <em>end</em> as the top. If you write <code>shift</code> on a stack, something is wrong.
      </Callout>

      <h2 id="brackets">Matching brackets</h2>
      <p>
        Is <code>&quot;([{"{}"}])&quot;</code> correctly nested? Think about how you would check it by hand. Every opening bracket waits for its closing bracket.
        A closing bracket must close the <em>most recent</em> opening bracket that is still open. &quot;The most recent one still waiting&quot; is the top of
        a stack.
      </p>
      <CodeBlock lang="js" code={bracketsCode} />
      <p>There are three ways to fail. The same lines of code handle all three:</p>
      <ul>
        <li><code>(]</code> — the closing bracket does not match the top of the stack.</li>
        <li><code>))</code> — a closing bracket arrives when the stack is empty. Then <code>pop()</code> returns <code>undefined</code>, which never equals an opening bracket.</li>
        <li><code>((</code> — the string ends while opening brackets are still on the stack, so the last check fails.</li>
      </ul>

      <h2 id="trace">Traced: ( [ &#123; &#125; ] ] </h2>
      <CodeTrace
        code={traceSrc}
        steps={bracketTrace()}
        caption="The string ([{}]] has one closing bracket too many. The stack catches it when the last ] finds nothing to close."
      />

      <h2 id="when">How to recognise a stack problem</h2>
      <DryRun
        title="clues in the wording"
        cols={["If the problem says…", "Think…"]}
        rows={[
          ["match / nested / balanced", "stack of opening brackets"],
          ["undo, backspace, most recent first", "stack of actions or characters"],
          ["the inner part must finish before the outer part", "stack of unfinished outer parts (decode string)"],
          ["evaluate an expression", "stack of operands"],
          ["next greater / smaller element", "monotonic stack (a stack that keeps its values in order, Lesson 40)"],
          ["a DFS (depth-first search) that you want to write without recursion", "a stack that you make yourself"],
        ]}
        note="What they have in common: the item you need next is always the most recent one that you have not finished with."
      />

      <h2 id="min">A stack that knows its minimum</h2>
      <p>
        Build a stack where <code>getMin()</code> (get the smallest value) is also O(1). Looking through everything for the smallest takes O(n). One stored{" "}
        <code>min</code> variable does not work either, because it becomes wrong when you pop that smallest value. The fix is to store, next to every item, <strong>the smallest value
        among that item and everything below it</strong>. When you pop an item, you pop its stored minimum too. So the right answer is always on top.
      </p>
      <CodeBlock lang="js" code={minCode} />
      <p>The price is O(n) extra space, because you keep a second array of the same length. Every operation stays O(1).</p>

      <h2 id="postfix">Evaluating postfix expressions</h2>
      <p>
        In <strong>postfix</strong> (also called Reverse Polish) notation, the operator comes <em>after</em> its numbers (its operands). So you need no brackets and no
        rules about which operator goes first. For example, <code>2 1 + 3 *</code> means <code>(2 + 1) * 3</code>. Read from left to right. If you see a number, push it on the
        stack. If you see an operator, pop two numbers, apply the operator to them, and push the result.
      </p>
      <CodeBlock lang="js" code={postfixCode} />
      <Callout kind="warn" label="Operand order for - and /">
        The first pop gives the <em>right</em> number. If you pop <code>a</code> first and write <code>a − b</code>, you get the wrong
        sign. Division in this problem cuts off the decimal part (<code>Math.trunc</code>), so it rounds towards zero. <code>Math.floor</code> is different for negative numbers: it rounds down.
      </Callout>

      <h2 id="decode">Nested structure: decode a string</h2>
      <p>
        <code>&quot;3[a2[c]]&quot;</code> means &quot;repeat three times: <em>a</em>, then <em>c</em> repeated twice&quot;. The innermost
        bracket must finish first. That is LIFO again. When you see <code>[</code>, save the outer part (the text so far
        and the repeat count) on stacks, and start fresh inside the bracket. When you see <code>]</code>, take the saved outer part back and add
        the repeated inside text to it.
      </p>
      <CodeBlock lang="js" code={decodeCode} />
      <DryRun
        title="decoding 3[a2[c]]"
        cols={["Char", "cur", "num", "counts stack", "texts stack"]}
        rows={[
          ["3", "\"\"", "3", "[]", "[]"],
          ["[", "\"\"", "0", "[3]", "[\"\"]"],
          ["a", "\"a\"", "0", "[3]", "[\"\"]"],
          ["2", "\"a\"", "2", "[3]", "[\"\"]"],
          ["[", "\"\"", "0", "[3, 2]", "[\"\", \"a\"]"],
          ["c", "\"c\"", "0", "[3, 2]", "[\"\", \"a\"]"],
          ["]", "\"acc\"", "0", "[3]", "[\"\"]"],
          ["]", "\"accaccacc\"", "0", "[]", "[]"],
        ]}
      />

      <h2 id="practice">Practice questions</h2>
      <p>Before you code, say what the stack holds at each moment. That one sentence is the whole idea of the algorithm.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Say what LIFO means. Give two examples: one from code and one from daily life.</>,
          <>Explain what the stack holds in the brackets problem. Name the three ways it can fail.</>,
          <>Explain how MinStack gets an O(1) <code>getMin</code>, and what this costs.</>,
          <>Explain why the first value that an operator pops is the <em>right</em> number.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        <strong>Lesson 39</strong> turns the rule around. The <strong>queue</strong> is first in, first out, like people waiting in a line. It also explains why{" "}
        <code>shift()</code> is slow, and it introduces the double-ended queue (a queue you can add to and remove from at both ends).
      </p>
    </DsaLessonPage>
  );
}
