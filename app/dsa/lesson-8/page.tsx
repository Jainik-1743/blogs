import type { Metadata } from "next";
import Callout from "@/components/Callout";
import ArrayBoxes from "@/components/dsa/ArrayBoxes";
import CodeTrace from "@/components/dsa/CodeTrace";
import DsaLessonPage from "@/components/dsa/DsaLesson";
import Questions from "./questions";
import Recall from "@/components/dsa/Recall";
import CodeBlock from "@/components/sd/CodeBlock";
import { getDsaLesson } from "@/lib/dsa";
import { tracer } from "@/lib/dsa-trace";

const lesson = getDsaLesson("lesson-8");

export const metadata: Metadata = {
  title: `Lesson 8 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "An array is a row of numbered lockers" },
  { id: "basics", label: "Creating, reading and changing" },
  { id: "loop", label: "Looping over an array" },
  { id: "grow", label: "Adding and removing: push and pop" },
  { id: "patterns", label: "The four patterns behind most array questions" },
  { id: "trace", label: "Traced: finding the maximum" },
  { id: "reference", label: "Copying arrays: variables share the same array" },
  { id: "builtins", label: "Built-in methods you will use every day" },
  { id: "sorting", label: "Sorting numbers correctly" },
  { id: "mistakes", label: "Common array mistakes" },
  { id: "practice", label: "Practice questions (12)" },
  { id: "recall", label: "Make it stick" },
];

const basics = `const marks = [72, 85, 90, 64];

console.log(marks[0]);                 // 72   first item: index 0
console.log(marks[2]);                 // 90
console.log(marks.length);             // 4    how many items
console.log(marks[marks.length - 1]);  // 64   last item: index length - 1
console.log(marks[10]);                // undefined  (there is no locker 10)

marks[1] = 88;                         // change one item
console.log(marks);                    // [ 72, 88, 90, 64 ]`;

const loops = `const nums = [4, 8, 15];

// 1. Index loop: use it when you need the position i
for (let i = 0; i < nums.length; i++) {
  console.log(i, nums[i]);
}

// 2. for...of: use it when you only need the values
for (const x of nums) {
  console.log(x);
}

/* Output:
0 4
1 8
2 15
4
8
15
*/`;

const pushPop = `const stack = [1, 2];
stack.push(3);        // add to the END       → [1, 2, 3]
stack.push(4);        //                      → [1, 2, 3, 4]
const last = stack.pop();  // remove from the END, returns it
console.log(last);    // 4
console.log(stack);   // [ 1, 2, 3 ]

const empty = [];     // start empty and fill it in a loop (very common)
for (let i = 1; i <= 3; i++) empty.push(i * i);
console.log(empty);   // [ 1, 4, 9 ]`;

const maxCode = `const nums = [3, 7, 2, 9, 4];
let max = nums[0];
for (let i = 1; i < nums.length; i++) {
  if (nums[i] > max) {
    max = nums[i];
  }
}
console.log(max);`;

function maxTrace() {
  const t = tracer();
  const nums = [3, 7, 2, 9, 4];
  t.step(1, "start", "The input array", "Five numbers at indices 0 to 4.", { nums }, "nums");
  let max = nums[0];
  t.step(2, "start", "max = nums[0] = 3", "Start with the first item as the “best so far”. Do not start with 0, because every number could be negative.", { nums, max }, "max");
  for (let i = 1; ; i++) {
    if (!(i < nums.length)) {
      t.step(3, "stop", `CHECK: ${i} < 5 is false`, "Every item has been compared once.", { nums, max, i });
      break;
    }
    t.step(3, "check", `i = ${i}: look at nums[${i}] = ${nums[i]}`, "Compare this item with the best so far.", { nums, max, i }, "i");
    if (nums[i] > max) {
      t.step(4, "check", `${nums[i]} > ${max}? yes`, "A new best.", { nums, max, i });
      max = nums[i];
      t.step(5, "update", `max = ${max}`, "Replace the best so far.", { nums, max, i }, "max");
    } else {
      t.step(4, "check", `${nums[i]} > ${max}? no`, "Keep the current best; nothing changes.", { nums, max, i });
    }
  }
  t.print(String(max));
  t.step(8, "print", "console.log(max)", "The largest value: 9.", { nums, max });
  return t.steps;
}

const searching = `const nums = [5, 3, 8, 3];

console.log(nums.includes(8));    // true   is 8 anywhere in the array?
console.log(nums.indexOf(3));     // 1      first position of 3, or -1
console.log(nums.lastIndexOf(3)); // 3      last position of 3
console.log(nums.slice(1, 3));    // [ 3, 8 ]  a COPY of positions 1 and 2 (position 3 is not included)
console.log(nums.slice());        // [ 5, 3, 8, 3 ]  a full copy`;

const splice = `const nums = [10, 20, 30, 40];

nums.splice(1, 1);             // at position 1, remove 1 item
console.log(nums);             // [ 10, 30, 40 ]

nums.splice(1, 0, 15, 25);     // at position 1, remove 0 items, insert 15 and 25
console.log(nums);             // [ 10, 15, 25, 30, 40 ]`;

const mapFilterReduce = `const prices = [100, 250, 40, 80];

// map: make a NEW array by changing every item (here: add 10 percent)
const withTax = prices.map((p) => p * 1.1);
console.log(withTax.map(Math.round));          // [ 110, 275, 44, 88 ]

// filter: make a NEW array with only the items that pass a test
const cheap = prices.filter((p) => p < 100);
console.log(cheap);                            // [ 40, 80 ]

// reduce: combine all items into ONE value
const total = prices.reduce((sum, p) => sum + p, 0);
console.log(total);                            // 470`;

const sortCode = `const nums = [10, 9, 1, 100, 25];

console.log([...nums].sort());                  // [ 1, 10, 100, 25, 9 ]  ✗ sorted as TEXT
console.log([...nums].sort((a, b) => a - b));   // [ 1, 9, 10, 25, 100 ]  ✓ smallest first
console.log([...nums].sort((a, b) => b - a));   // [ 100, 25, 10, 9, 1 ]  ✓ largest first`;

const shared = `const a = [1, 2, 3];
const b = a;          // NOT a copy — b points at the SAME array
b.push(4);
console.log(a);       // [ 1, 2, 3, 4 ]  ← a changed too!

const c = [...a];     // a real copy (spread syntax)
c.push(5);
console.log(a);       // [ 1, 2, 3, 4 ]  unchanged
console.log(c);       // [ 1, 2, 3, 4, 5 ]`;

export default function DsaLessonEightPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">An array is a row of numbered lockers</h2>
      <p>
        Imagine you must store 100 exam marks. Making 100 variables (<code>mark1</code>,{" "}
        <code>mark2</code>, …) would be very hard to manage.
      </p>
      <p>
        An <strong>array</strong> is one variable that holds a list of values in order. Think of a
        row of lockers. Each locker holds one value. Each locker has a number, called its{" "}
        <strong>index</strong>. The numbering starts at <strong>0</strong>, not 1.
      </p>
      <ArrayBoxes
        name="marks"
        values={[72, 85, 90, 64]}
        caption="Four values, indices 0 to 3. The last index is always length − 1."
      />
      <p>
        A <em>data structure</em> is a way to organise data in memory so that you can use it well.
        Arrays are the data structure that interviews ask about most. Almost every question in Parts
        4–7 uses an array or a string. So this lesson and the next one are very important.
      </p>

      <h2 id="basics">Creating, reading and changing</h2>
      <CodeBlock lang="js" code={basics} />
      <Callout kind="ok" label="Three facts to never forget">
        <ul className="mb-0">
          <li>First item: <code>arr[0]</code>.</li>
          <li>Last item: <code>arr[arr.length - 1]</code>.</li>
          <li>Valid indices: <code>0</code> to <code>arr.length - 1</code>. An index outside this range gives <code>undefined</code> (&ldquo;no value&rdquo;).</li>
        </ul>
      </Callout>

      <h2 id="loop">Looping over an array</h2>
      <p>
        In Lesson 4 you saw that &ldquo;start at 0 and use <code>&lt;</code>&rdquo; is the most common
        loop in DSA. Here is why. The variable <code>i</code> takes exactly the values 0 to{" "}
        <code>length − 1</code>. That is every valid index, once.
      </p>
      <CodeBlock lang="js" code={loops} />
      <p>
        Use the index loop when the position matters. For example, you need it to compare neighbours,
        to swap items or to return an index. Use <code>for…of</code> when you only need each value.
        (<code>for…of</code> is a loop that gives you each value of an array, one at a time.)
      </p>

      <h2 id="grow">Adding and removing: push and pop</h2>
      <CodeBlock lang="js" code={pushPop} />
      <p>
        <code>push</code> is a method that adds an item to the <strong>end</strong> of an array.{" "}
        <code>pop</code> is a method that removes the last item and gives it back to you. (A{" "}
        <em>method</em> is a function that belongs to an object, here the array. You call it with a
        dot, like <code>stack.push(3)</code>.) Both are fast, because no other item has to move.
      </p>
      <p>
        There are also <code>unshift</code> and <code>shift</code>. They add and remove at the{" "}
        <em>front</em>. They can be slow on large arrays, because every other item may have to move
        one place. Lesson 12 explains why that matters.
      </p>

      <h2 id="patterns">The four patterns behind most array questions</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Pattern</th>
              <th>Before the loop</th>
              <th>Inside the loop</th>
              <th>Examples</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Accumulate</strong></td><td><code>let sum = 0</code></td><td><code>sum += arr[i]</code></td><td>sum, average, product</td></tr>
            <tr><td><strong>Best so far</strong></td><td><code>let max = arr[0]</code></td><td>replace if better</td><td>max, min, longest word</td></tr>
            <tr><td><strong>Count</strong></td><td><code>let count = 0</code></td><td><code>if (…) count++</code></td><td>count evens, count negatives</td></tr>
            <tr><td><strong>Search</strong></td><td>—</td><td><code>if (arr[i] === target) return i</code></td><td>find an index, &ldquo;does it contain…?&rdquo;</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        These are the loop patterns from Lessons 4–5, now used on arrays. Searching item by item from
        the start is called a <strong>linear search</strong>. Part 6 will show a much faster way
        when the array is sorted.
      </p>

      <h2 id="trace">Traced: finding the maximum</h2>
      <CodeTrace
        code={maxCode}
        steps={maxTrace()}
        caption="“Best so far” in action: max only changes when a bigger value appears (at 7 and at 9)."
      />

      <h2 id="reference">Copying arrays: variables share the same array</h2>
      <p>
        A variable does not hold the array itself. It holds a <em>reference</em>. A reference is
        the address of the place in memory where the array lives. When you write{" "}
        <code>const b = a</code>, you copy the address, not the lockers. Both variables then point
        to the same array:
      </p>
      <CodeBlock lang="js" code={shared} />
      <p>
        This matters when you pass an array into a function. The function can change your array.
        When a question says &ldquo;do it in place&rdquo;, it wants exactly that: change the
        original array. When a question says &ldquo;return a new array&rdquo;, copy the array first.
        The <code>[...a]</code> form is called <strong>spread syntax</strong>. It takes every item
        out of <code>a</code> and puts them in a new array.
      </p>

      <h2 id="builtins">Built-in methods you will use every day</h2>
      <p>
        JavaScript arrays come with ready-made methods that do common jobs. Each one runs a loop
        inside, so it still takes time on a large array. But the methods make your code much
        shorter.
      </p>
      <h3>Searching and copying</h3>
      <CodeBlock lang="js" code={searching} />
      <h3>Removing and inserting in the middle: splice</h3>
      <CodeBlock lang="js" code={splice} />
      <p>
        <code>splice</code> changes the array itself. Every item after the change has to move, so it
        takes longer on large arrays. <code>slice</code> (without the &ldquo;p&rdquo;) never changes
        the original. It returns a copy of a part of the array. Do not mix them up.
      </p>
      <h3>map, filter and reduce</h3>
      <p>
        These three methods each take a small function and run it on every item. A function you pass
        to another function is called a <strong>callback</strong>. Here the callbacks are arrow
        functions (Lesson 7).
      </p>
      <ul>
        <li><code>map</code> makes a <em>new array</em> of the same length. Each new item is the callback&apos;s result for the old item.</li>
        <li><code>filter</code> makes a <em>new array</em> with only the items for which the callback returns true.</li>
        <li><code>reduce</code> combines all items into <em>one value</em>. The callback receives the total so far and the next item. The last argument (here <code>0</code>) is the starting total.</li>
      </ul>
      <p>
        Here they are in code:
      </p>
      <CodeBlock lang="js" code={mapFilterReduce} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>Returns</th>
              <th>Changes the original?</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>includes</code>, <code>indexOf</code></td><td>true/false, a position</td><td>No</td></tr>
            <tr><td><code>slice</code>, <code>map</code>, <code>filter</code></td><td>a new array</td><td>No</td></tr>
            <tr><td><code>reduce</code></td><td>one value</td><td>No</td></tr>
            <tr><td><code>push</code>, <code>pop</code>, <code>splice</code>, <code>sort</code>, <code>reverse</code></td><td>(varies)</td><td><strong>Yes</strong></td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="sorting">Sorting numbers correctly</h2>
      <p>
        <code>sort()</code> is a method that puts the items of an array in order. With no arguments,
        it compares items <strong>as text</strong>. So <code>&quot;100&quot;</code> comes before{" "}
        <code>&quot;25&quot;</code>, because &ldquo;1&rdquo; comes before &ldquo;2&rdquo;. For
        numbers, always pass a <strong>comparison function</strong>. This is a function that takes
        two items, a and b. If it returns a negative number, a goes first. If it returns a positive
        number, b goes first.
      </p>
      <CodeBlock lang="js" code={sortCode} />
      <Callout kind="warn" label="Remember">
        <p className="mb-0">
          <code>(a, b) =&gt; a - b</code> sorts from smallest to largest. <code>sort</code> changes the
          original array, so the examples sort a copy (<code>[...nums]</code>). Part 3 explains how
          sorting works inside.
        </p>
      </Callout>

      <h2 id="mistakes">Common array mistakes</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mistake</th>
              <th>Fix</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>i &lt;= arr.length</code> — reads <code>arr[length]</code>, which is <code>undefined</code></td><td>Use <code>i &lt; arr.length</code></td></tr>
            <tr><td><code>let max = 0</code> on an array of negatives returns 0</td><td>Start with <code>arr[0]</code></td></tr>
            <tr><td><code>sort()</code> on numbers without a comparison function</td><td><code>sort((a, b) =&gt; a - b)</code></td></tr>
            <tr><td>Forgetting the empty array <code>[]</code></td><td>Ask what to return for it; check <code>arr.length === 0</code> first</td></tr>
            <tr><td><code>b = a</code> and expecting a copy</td><td><code>b = [...a]</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="practice">Practice questions</h2>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the four array patterns (accumulate, best so far, count, search) from memory, one line each.</>,
          <>Reverse <code>[a, b, c, d]</code> in place on paper with left/right pointers.</>,
          <>Explain why <code>const b = a</code> doesn&apos;t copy an array, and how to copy one.</>,
        ]}
      />
      <p>
        Next lesson: <strong>strings</strong>. A string is text. It works like an array of
        characters, but you can read it and not change it.
      </p>
    </DsaLessonPage>
  );
}
