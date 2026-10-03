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

const lesson = getDsaLesson("lesson-10");

export const metadata: Metadata = {
  title: `Lesson 10 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Look things up by name, not by position" },
  { id: "objects", label: "Objects: records with named fields" },
  { id: "map", label: "Map: the dictionary you'll use in DSA" },
  { id: "frequency", label: "The frequency map pattern" },
  { id: "trace", label: "Traced: counting the letters of “banana”" },
  { id: "set", label: "Set: “have I seen this before?”" },
  { id: "why", label: "Why this is fast — a first look" },
  { id: "choose", label: "Array, object, Map or Set?" },
  { id: "practice", label: "Practice questions (11)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "Part 1 complete — what's next" },
];

const objects = `const student = {
  name: "Asha",
  age: 21,
  marks: [72, 85, 90],
};

console.log(student.name);        // Asha        dot notation
console.log(student["age"]);      // 21          bracket notation (same thing)
student.age = 22;                 // change a field
student.city = "Pune";            // add a new field
console.log(student.city);        // Pune
console.log(student.phone);       // undefined   no such field

for (const key in student) {
  console.log(key);               // name, age, marks, city (one per line)
}`;

const map = `const stock = new Map();

stock.set("apple", 10);           // add / overwrite a key
stock.set("mango", 4);
stock.set("apple", 12);           // same key: replaces 10 with 12

console.log(stock.get("apple"));  // 12
console.log(stock.get("kiwi"));   // undefined
console.log(stock.has("mango"));  // true
console.log(stock.size);          // 2
stock.delete("mango");
console.log(stock.size);          // 1

for (const [fruit, qty] of stock) {
  console.log(fruit, qty);        // apple 12
}`;

const freqCode = `const s = "banana";
const freq = new Map();
for (const ch of s) {
  freq.set(ch, (freq.get(ch) ?? 0) + 1);
}
console.log(freq);`;

function freqTrace() {
  const t = tracer();
  const s = "banana";
  t.step(1, "start", "s = \"banana\"", "Six characters to count.", { s }, "s");
  const freq = new Map<string, number>();
  t.step(2, "start", "freq = new Map()", "An empty map: character → how many times seen.", { s, freq: new Map(freq) }, "freq");
  for (const ch of s) {
    t.step(3, "check", `Next character: "${ch}"`, freq.has(ch) ? `"${ch}" is already in the map with count ${freq.get(ch)}.` : `"${ch}" is not in the map yet, so freq.get gives undefined and ?? turns that into 0.`, { s, freq: new Map(freq), ch }, "ch");
    const before = freq.get(ch) ?? 0;
    freq.set(ch, before + 1);
    t.step(4, "update", `freq.set("${ch}", ${before} + 1)`, `Store the new count for "${ch}": ${before + 1}.`, { s, freq: new Map(freq), ch }, "freq");
  }
  t.print("Map(3) { 'b' => 1, 'a' => 3, 'n' => 2 }");
  t.step(6, "print", "console.log(freq)", "b once, a three times, n twice — counted in a single pass.", { s, freq: new Map(freq) });
  return t.steps;
}

const set = `const seen = new Set();

seen.add(3);
seen.add(7);
seen.add(3);                 // already there — ignored

console.log(seen.has(7));    // true
console.log(seen.has(5));    // false
console.log(seen.size);      // 2

const unique = new Set([1, 2, 2, 3, 3, 3]);
console.log(unique.size);    // 3
console.log([...unique]);    // [ 1, 2, 3 ]   back to an array`;

export default function DsaLessonTenPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Look things up by name, not by position</h2>
      <p>
        An array answers &ldquo;what is at position 3?&rdquo;. But many questions are really
        &ldquo;how many times have I seen the letter a?&rdquo; or &ldquo;what is Asha&apos;s
        age?&rdquo;. Searching a whole array for that every time is inefficient. Instead, store
        the value under a <strong>key</strong> — a name — and look it up directly, like a word in
        a dictionary.
      </p>
      <p>
        A key with its value is a <strong>key–value pair</strong>. JavaScript gives you three
        tools built on this idea: <strong>objects</strong>, <strong>Map</strong> and{" "}
        <strong>Set</strong>. Together they are used in a large share of interview solutions — so many
        that Part 5 is built entirely on them.
      </p>

      <h2 id="objects">Objects: records with named fields</h2>
      <p>An object groups related values under field names — perfect for describing one thing.</p>
      <CodeBlock lang="js" code={objects} />

      <h2 id="map">Map: the dictionary you&apos;ll use in DSA</h2>
      <p>
        Objects can be used as dictionaries, but <code>Map</code> was designed for it: any value can
        be a key (numbers stay numbers), it remembers insertion order, and it has a built-in{" "}
        <code>size</code>. For counting and lookups in DSA, use a Map.
      </p>
      <CodeBlock lang="js" code={map} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Operation</th>
              <th>Map</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Store</td><td><code>m.set(key, value)</code></td><td>Add, or replace if the key exists</td></tr>
            <tr><td>Read</td><td><code>m.get(key)</code></td><td>The value, or <code>undefined</code></td></tr>
            <tr><td>Check</td><td><code>m.has(key)</code></td><td><code>true</code> / <code>false</code></td></tr>
            <tr><td>Remove</td><td><code>m.delete(key)</code></td><td>Delete one entry</td></tr>
            <tr><td>Count</td><td><code>m.size</code></td><td>Number of keys</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="frequency">The frequency map pattern</h2>
      <p>
        Here is the most useful line in this lesson. To count how often each thing appears, loop
        once and, for each item, add 1 to its count:
      </p>
      <Callout kind="ok" label="The frequency map — memorise this line">
        <pre className="my-1">
          <code>{`freq.set(x, (freq.get(x) ?? 0) + 1);`}</code>
        </pre>
        <p className="mb-0">
          <code>freq.get(x)</code> is the count so far — or <code>undefined</code> the first time.{" "}
          <code>?? 0</code> means &ldquo;if there is nothing there, use 0&rdquo;. Then add 1 and store
          it back.
        </p>
      </Callout>
      <p>
        Duplicates, anagrams, the most frequent element, the first unique character — all of these
        start with this one loop.
      </p>

      <h2 id="trace">Traced: counting the letters of “banana”</h2>
      <CodeTrace
        code={freqCode}
        steps={freqTrace()}
        caption="One pass over the string. The map grows a new key the first time a letter appears, and just increases the count after that."
      />

      <h2 id="set">Set: “have I seen this before?”</h2>
      <p>
        A <strong>Set</strong> is a collection that keeps each value <em>once</em>. Adding a value that is
        already there does nothing. Its most useful feature is <code>has()</code>: &ldquo;is this in
        here?&rdquo; answered instantly.
      </p>
      <CodeBlock lang="js" code={set} />

      <h2 id="why">Why this is fast — a first look</h2>
      <p>
        To check whether 7 is in an array of a million numbers, a linear search may look at all
        million. A Set or Map jumps straight to where 7 would be stored — about the same time
        whether it holds ten items or ten million. That is why many &ldquo;loop inside a loop&rdquo;
        solutions can be replaced by a single loop by adding a Map or Set. Lesson 12 puts
        numbers on this (O(n) vs O(1)), and Lesson 15 shows how it works inside.
      </p>
      <DryRun
        title="“does the collection contain x?”"
        cols={["Stored in", "How it checks", "Work for 1,000,000 items"]}
        rows={[
          ["Array", "look at items one by one", "up to 1,000,000 checks"],
          ["Set / Map", "jump straight to x's slot", "about 1 check"],
        ]}
      />

      <h2 id="choose">Array, object, Map or Set?</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>You need…</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>An ordered list, access by position</td><td>Array</td></tr>
            <tr><td>One record with named fields (a student, an order)</td><td>Object</td></tr>
            <tr><td>Counts, or a lookup from key to value</td><td>Map</td></tr>
            <tr><td>Uniqueness, or fast &ldquo;have I seen it?&rdquo;</td><td>Set</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="practice">Practice questions</h2>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the frequency-map line from memory and explain each part of it.</>,
          <>Solve &ldquo;contains duplicate&rdquo; with a Set, then say why it beats two nested loops.</>,
          <>Name one job each for an array, an object, a Map and a Set.</>,
        ]}
      />

      <h2 id="next">Part 1 complete — what&apos;s next</h2>
      <p>
        You can now write variables, conditions, both kinds of loop, nested loops, functions, and
        work with arrays, strings, Maps and Sets. That is the full toolkit every DSA problem is built
        from. Before moving on, go back and re-solve two questions from each lesson without looking —
        if any feels shaky, that lesson is worth a second read.
      </p>
      <p>
        <strong>Part 2 — Thinking Like a Problem-Solver</strong> starts with how to read an
        interview question properly, then Big-O: counting how much work your loops really do.
      </p>
    </DsaLessonPage>
  );
}
