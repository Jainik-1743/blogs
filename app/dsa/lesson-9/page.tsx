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
word[0] = "b";        // does nothing (in strict mode it throws a TypeError)
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
  t.step(2, "start", "rev = \"\"", "An empty string. It is the string version of starting a sum at 0.", { s, rev }, "rev");
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

// Position of a lowercase letter in the alphabet (0 to 25):
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
        A <strong>string</strong> is a piece of text, such as <code>&quot;hello&quot;</code>. A{" "}
        <strong>character</strong> is one single letter, digit, space or punctuation mark.
      </p>
      <p>
        A string works almost like an array of characters. Each character sits at an index, and the
        index starts at 0. The <code>length</code> property tells you how many characters there
        are. (One small detail: JavaScript counts in 16-bit units. Most emoji take two units, so
        their length is 2. You do not need to worry about this in this series.)
      </p>
      <ArrayBoxes
        values={["h", "e", "l", "l", "o"]}
        name="word"
        caption="“hello” is five characters at indices 0–4, exactly like an array of length 5."
      />
      <p>
        So everything from Lesson 8 works on strings too: index loops, best-so-far, counting and two
        pointers. Strings are, after arrays, one of the most common interview topics. Typical
        questions are palindromes, anagrams, reversing words and counting characters. (A{" "}
        <em>palindrome</em> reads the same forwards and backwards, like &ldquo;madam&rdquo;. An{" "}
        <em>anagram</em> is a word made by re-ordering the letters of another word, like
        &ldquo;listen&rdquo; and &ldquo;silent&rdquo;.)
      </p>

      <h2 id="read">Reading characters</h2>
      <CodeBlock lang="js" code={read} />

      <h2 id="immutable">You can&apos;t change a string — build a new one</h2>
      <p>
        This is the main difference from arrays. Strings are <strong>immutable</strong>. Immutable
        means &ldquo;cannot be changed after it is made&rdquo;. You can read <code>word[0]</code>,
        but you cannot replace it. Every &ldquo;change&rdquo; really builds a <em>new</em> string.
        (The opposite is <em>mutable</em>: an array is mutable, so you can change its items.)
      </p>
      <CodeBlock lang="js" code={immutable} />
      <Callout kind="note" label="When you need to change characters">
        <p className="mb-0">
          You have two choices. First, build a new string with <code>+=</code> (as in the trace
          below). Second, turn the string into an array with <code>s.split(&quot;&quot;)</code>,
          change the array, and join it back with <code>arr.join(&quot;&quot;)</code>.
        </p>
      </Callout>

      <h2 id="loop">Looping over a string</h2>
      <CodeBlock lang="js" code={loop} />

      <h2 id="trace">Traced: reversing a word</h2>
      <p>
        Walk from the last index down to 0. Join each character onto a new string. The empty string{" "}
        <code>&quot;&quot;</code> is the starting value, just like 0 is the starting value for a
        sum. Joining two strings with <code>+</code> or <code>+=</code> is called{" "}
        <strong>concatenation</strong>.
      </p>
      <CodeTrace code={revCode} steps={revTrace()} caption="rev grows by one character per iteration: t → ta → tac." />

      <h2 id="chars">Checking what kind of character it is</h2>
      <p>
        You can compare characters with <code>&lt;</code> and <code>&gt;</code>. Letters compare in
        alphabetical order. All uppercase letters come before all lowercase letters. This gives
        simple checks that you will use all the time:
      </p>
      <CodeBlock lang="js" code={charChecks} />

      <h2 id="codes">Character codes</h2>
      <p>
        A computer stores only numbers. So every character is stored as a number. This number is
        called its <strong>character code</strong>. For example, &ldquo;a&rdquo; is 97 and
        &ldquo;b&rdquo; is 98. The letters are numbered in alphabetical order. This allows two
        useful tricks: finding a letter&apos;s position in the alphabet, and moving forward or
        backward in the alphabet.
      </p>
      <CodeBlock lang="js" code={codes} />
      <p>
        The position trick is <code>code − code of &quot;a&quot;</code>. It gives 0 for
        &ldquo;a&rdquo;, 1 for &ldquo;b&rdquo; and so on. With it you can count letters in an array
        of 26 counters instead of a Map (a Map is a lookup table, see Lesson 10). You will use this
        in Lesson 15 and in many anagram questions.
      </p>

      <h2 id="methods">The handful of built-in methods worth knowing</h2>
      <p>
        A <strong>built-in method</strong> is a function that JavaScript already gives to every
        string. You call it with a dot. The code below shows the ones you will meet most. Note that
        every one of them returns a <em>new</em> value. None of them changes the original string.
      </p>
      <CodeBlock lang="js" code={methods} />
      <ul>
        <li><code>trim()</code> removes spaces from both ends. <code>toUpperCase()</code> and <code>toLowerCase()</code> change the letter case.</li>
        <li><code>indexOf(text)</code> gives the position where the text first appears, or -1. <code>includes(text)</code> gives true or false.</li>
        <li><code>slice(start, end)</code> gives a piece of the string. It includes <code>start</code> and does not include <code>end</code>.</li>
        <li><code>split(separator)</code> cuts a string into an array of pieces. <code>join(separator)</code> does the opposite: it glues an array of strings into one string.</li>
      </ul>
      <Callout kind="warn" label="Built-ins in interviews">
        <p className="mb-0">
          Use them for small jobs, such as lower-casing, trimming or splitting. But sometimes the
          question <em>is</em> the method, for example &ldquo;reverse a string&rdquo; or &ldquo;find
          a substring&rdquo;. Then the interviewer wants to see your loop. If you are not sure, ask:
          &ldquo;May I use split and join?&rdquo;
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
        Next lesson: <strong>objects, Map and Set</strong>. These let you look things up by name.
        You will also learn the counting pattern that is behind many interview questions.
      </p>
    </DsaLessonPage>
  );
}
