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

const lesson = getDsaLesson("lesson-9");

export const metadata: Metadata = {
  title: `Lesson 9 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "A string is a row of characters" },
  { id: "read", label: "Reading characters" },
  { id: "immutable", label: "You can't change a string — build a new one" },
  { id: "loop", label: "Looping over a string" },
  { id: "trace", label: "Traced: reversing a word" },
  { id: "chars", label: "Checking what kind of character it is" },
  { id: "codes", label: "Character codes" },
  { id: "methods", label: "The handful of built-in methods worth knowing" },
  { id: "practice", label: "Practice questions (11)" },
  { id: "recall", label: "Make it stick" },
];

const read = `const word = "hello";

console.log(word.length);            // 5
console.log(word[0]);                // h
console.log(word[word.length - 1]);  // o
console.log(word[1] + word[2]);      // el`;

const immutable = `let word = "cat";
word[0] = "b";        // silently does nothing
console.log(word);    // cat

word = "b" + word.slice(1);   // build a NEW string and store it
console.log(word);    // bat`;

const loop = `const s = "abc";

for (let i = 0; i < s.length; i++) {
  console.log(i, s[i]);
}

for (const ch of s) {
  console.log(ch);
}

/* Output:
0 a
1 b
2 c
a
b
c
*/`;

const revCode = `const s = "cat";
let rev = "";
for (let i = s.length - 1; i >= 0; i--) {
  rev += s[i];
}
console.log(rev);`;

function revTrace() {
  const t = tracer();
  const s = "cat";
  t.step(1, "start", "s = \"cat\"", "Indices 0, 1, 2 hold c, a, t.", { s }, "s");
  let rev = "";
  t.step(2, "start", "rev = \"\"", "An empty string — the string version of starting a sum at 0.", { s, rev }, "rev");
  for (let i = s.length - 1; ; i--) {
    if (!(i >= 0)) {
      t.step(3, "stop", `CHECK: ${i} >= 0 is false`, "Walked past the first character; done.", { s, rev, i });
      break;
    }
    t.step(3, "check", `i = ${i}: s[${i}] is "${s[i]}"`, "Walk backwards from the last index.", { s, rev, i }, "i");
    rev += s[i];
    t.step(4, "run", `rev += "${s[i]}" → "${rev}"`, "Join this character onto the end of rev.", { s, rev, i }, "rev");
  }
  t.print(rev);
  t.step(6, "print", "console.log(rev)", "tac.", { s, rev });
  return t.steps;
}

const charChecks = `const ch = "G";

console.log(ch >= "a" && ch <= "z");   // false  lowercase letter?
console.log(ch >= "A" && ch <= "Z");   // true   uppercase letter?
console.log("7" >= "0" && "7" <= "9"); // true   digit?
console.log("aeiou".includes("e"));    // true   is it one of these?
console.log(ch.toLowerCase());         // g`;

const codes = `console.log("a".charCodeAt(0));       // 97   every character has a number (its code)
console.log("b".charCodeAt(0));       // 98   letters are numbered in order
console.log(String.fromCharCode(99)); // c    and back again

// Position of a lowercase letter in the alphabet, 0 to 25:
const ch = "e";
console.log(ch.charCodeAt(0) - "a".charCodeAt(0)); // 4

// Shift a letter forward by 2 places (a simple cipher):
console.log(String.fromCharCode("x".charCodeAt(0) + 2)); // z`;

const methods = `const s = "  Hello World  ";

console.log(s.trim());               // Hello World      remove spaces at both ends
console.log(s.trim().toUpperCase()); // HELLO WORLD  methods can be chained
console.log("banana".indexOf("an")); // 1    first position, or -1
console.log("banana".includes("nan"));   // true
console.log("hello".slice(1, 4));    // ell  from index 1 up to (not including) 4
console.log("a,b,c".split(","));     // [ 'a', 'b', 'c' ]  string → array
console.log(["a", "b", "c"].join("-"));  // a-b-c    array → string`;

export default function DsaLessonNinePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">A string is a row of characters</h2>
      <p>
        A string — text — behaves almost exactly like an array of characters. Every letter, digit,
        space and punctuation mark sits at an index, starting at 0, and <code>length</code> tells
        you how many there are.
      </p>
      <ArrayBoxes
        values={["h", "e", "l", "l", "o"]}
        name="word"
        caption="“hello” is five characters at indices 0–4, exactly like an array of length 5."
      />
      <p>
        So everything from Lesson 8 — index loops, best-so-far, counting, two pointers — works on
        strings too. Strings are the second most common interview topic after arrays: palindromes,
        anagrams, reversing words, counting characters.
      </p>

      <h2 id="read">Reading characters</h2>
      <CodeBlock lang="js" code={read} />

      <h2 id="immutable">You can&apos;t change a string — build a new one</h2>
      <p>
        This is the main difference from arrays: strings are <strong>immutable</strong>. You can
        read <code>word[0]</code> but you can&apos;t replace it. Every &ldquo;change&rdquo; really
        builds a <em>new</em> string.
      </p>
      <CodeBlock lang="js" code={immutable} />
      <Callout kind="note" label="When you need to change characters">
        <p className="mb-0">
          Either build a new string with <code>+=</code> (as below), or turn it into an array with{" "}
          <code>s.split(&quot;&quot;)</code>, change the array, and join it back with{" "}
          <code>arr.join(&quot;&quot;)</code>.
        </p>
      </Callout>

      <h2 id="loop">Looping over a string</h2>
      <CodeBlock lang="js" code={loop} />

      <h2 id="trace">Traced: reversing a word</h2>
      <p>
        Walk from the last index down to 0 and join each character onto a new string. The empty
        string <code>&quot;&quot;</code> is the starting value, just like 0 for a sum.
      </p>
      <CodeTrace code={revCode} steps={revTrace()} caption="rev grows by one character per iteration: t → ta → tac." />

      <h2 id="chars">Checking what kind of character it is</h2>
      <p>
        Characters can be compared with <code>&lt;</code> and <code>&gt;</code>; letters compare in
        alphabetical order (uppercase letters all come before lowercase ones). That gives simple
        checks you will use constantly:
      </p>
      <CodeBlock lang="js" code={charChecks} />

      <h2 id="codes">Character codes</h2>
      <p>
        Inside the computer, every character is stored as a number called its{" "}
        <strong>character code</strong>. Letters are numbered in alphabetical order, which makes two
        useful tricks possible: finding a letter&apos;s position in the alphabet, and moving forward
        or backward through the alphabet.
      </p>
      <CodeBlock lang="js" code={codes} />
      <p>
        The position technique (<code>code − code of &quot;a&quot;</code>) lets you count letters in an
        array of 26 counters instead of a Map. You will use it in Lesson 15 and in many anagram
        questions.
      </p>

      <h2 id="methods">The handful of built-in methods worth knowing</h2>
      <CodeBlock lang="js" code={methods} />
      <Callout kind="warn" label="Built-ins in interviews">
        <p className="mb-0">
          Use them for small jobs (lower-casing, trimming, splitting). But if the question{" "}
          <em>is</em> the method — &ldquo;reverse a string&rdquo;, &ldquo;find a substring&rdquo; —
          the interviewer wants to see the loop. When unsure, ask: &ldquo;may I use split and
          join?&rdquo;
        </p>
      </Callout>

      <h2 id="practice">Practice questions</h2>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Explain &ldquo;immutable&rdquo; with the <code>&quot;cat&quot;</code> → <code>&quot;bat&quot;</code> example.</>,
          <>Write the two-pointer palindrome check from memory.</>,
          <>Dry-run <code>compress(&quot;aabccc&quot;)</code>. (Answer: a2b1c3.)</>,
        ]}
      />
      <p>
        Next lesson: <strong>objects, Map and Set</strong> — looking things up by name, and the
        counting pattern behind a large share of interview questions.
      </p>
    </DsaLessonPage>
  );
}
