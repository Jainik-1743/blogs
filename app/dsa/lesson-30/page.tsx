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

const lesson = getDsaLesson("lesson-30");

export const metadata: Metadata = {
  title: `Lesson 30 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Strings are arrays of characters" },
  { id: "palindrome", label: "Palindromes with two pointers" },
  { id: "expand", label: "Longest palindromic substring: expand around the centre" },
  { id: "trace", label: "Traced: expanding around every centre" },
  { id: "prefix", label: "Longest common prefix" },
  { id: "roman", label: "Roman numerals: look one character ahead" },
  { id: "compress", label: "String compression: read pointer, write pointer" },
  { id: "rotation", label: "Rotation check: the doubled-string trick" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const basicsCode = `const s = "hello";
console.log(s[0]);            // h
console.log(s[s.length - 1]); // o
console.log(s.slice(1, 4));   // ell   (index 1 up to, not including, 4)

s[0] = "J";                   // ignored (in strict mode this throws an error): strings cannot be changed
console.log(s);               // hello

const chars = [...s];         // turn the string into an array of characters
chars[0] = "J";
console.log(chars.join(""));  // Jello`;

const palCode = `function isPalindrome(s) {
  let l = 0, r = s.length - 1;
  while (l < r) {
    if (s[l] !== s[r]) return false;   // mismatch, so it is not a palindrome
    l++;
    r--;
  }
  return true;                          // every pair matched
}

console.log(isPalindrome("racecar")); // true
console.log(isPalindrome("abca"));    // false
console.log(isPalindrome(""));        // true`;

const cleanCode = `// Skip anything that is not a letter or digit, and ignore upper/lower case.
function isCleanPalindrome(s) {
  const isAlnum = (c) => /[a-z0-9]/i.test(c);
  let l = 0, r = s.length - 1;
  while (l < r) {
    while (l < r && !isAlnum(s[l])) l++;
    while (l < r && !isAlnum(s[r])) r--;
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++;
    r--;
  }
  return true;
}

console.log(isCleanPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isCleanPalindrome("race a car"));                     // false`;

const expandCode = `function longestPalindrome(s) {
  let start = 0, best = 0;

  // Grow outwards from the centre while both ends match; return the palindrome's length.
  function expand(l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      l--;
      r++;
    }
    return r - l - 1;
  }

  for (let i = 0; i < s.length; i++) {
    const len = Math.max(expand(i, i), expand(i, i + 1)); // odd centre, even centre
    if (len > best) {
      best = len;
      start = i - Math.floor((len - 1) / 2);
    }
  }
  return s.slice(start, start + best);
}

console.log(longestPalindrome("babad")); // bab
console.log(longestPalindrome("cbbd"));  // bb`;

const traceCode = `const s = "babad";
let start = 0, best = 0;
for (let i = 0; i < s.length; i++) {
  const len = Math.max(expand(i, i), expand(i, i + 1));
  if (len > best) {
    best = len;
    start = i - Math.floor((len - 1) / 2);
  }
}
console.log(s.slice(start, start + best));`;

function expandTrace() {
  const t = tracer();
  const s = "babad";
  const expand = (l: number, r: number) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    return r - l - 1;
  };
  let start = 0, best = 0;
  t.step(2, "start", "start = 0, best = 0", "No palindrome found yet. Every single character is a palindrome of length 1, so best will become at least 1.", { s, start, best });
  for (let i = 0; i < s.length; i++) {
    const odd = expand(i, i), even = expand(i, i + 1);
    const len = Math.max(odd, even);
    t.step(4, "run", `centre ${i} ("${s[i]}"): odd = ${odd}, even = ${even}`, `Expanding from the character itself gives a palindrome of length ${odd}. Expanding from the gap after it gives length ${even}. Take the larger one: ${len}.`, { s, i, odd, even, len, start, best }, "len");
    if (len > best) {
      best = len;
      start = i - Math.floor((len - 1) / 2);
      t.step(7, "update", `new best: length ${best} starting at ${start}`, `${len} is better than the previous best, so remember it. start = i − floor((len − 1) / 2) = ${start}.`, { s, i, len, start, best }, "best");
    } else {
      t.step(5, "check", `${len} is not longer than ${best}`, "This is not better, so keep the earlier answer.", { s, i, len, start, best });
    }
  }
  t.print(s.slice(start, start + best));
  t.step(10, "print", "console.log(s.slice(start, start + best))", `The substring starts at index ${start} and has length ${best}. (“aba” is equally long, so either answer is accepted.)`, { s, start, best });
  return t.steps;
}

const prefixCode = `function longestCommonPrefix(strs) {
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    // make the prefix shorter until the next word starts with it
    while (!strs[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
    }
  }
  return prefix;
}

console.log(longestCommonPrefix(["flower", "flow", "flight"])); // fl
console.log(longestCommonPrefix(["dog", "racecar", "car"]));    // (empty)`;

const romanCode = `function romanToInt(s) {
  const value = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const smallerThanNext = i + 1 < s.length && value[s[i]] < value[s[i + 1]];
    if (smallerThanNext) total -= value[s[i]];   // IV: the I counts as −1
    else total += value[s[i]];
  }
  return total;
}

console.log(romanToInt("III"));     // 3
console.log(romanToInt("LVIII"));   // 58
console.log(romanToInt("MCMXCIV")); // 1994`;

const compressCode = `function compress(chars) {
  let write = 0;   // where the next compressed character goes
  let i = 0;       // start of the current run
  while (i < chars.length) {
    const ch = chars[i];
    let j = i;
    while (j < chars.length && chars[j] === ch) j++;   // j stops after the run
    chars[write++] = ch;
    if (j - i > 1) {
      for (const digit of String(j - i)) chars[write++] = digit;
    }
    i = j;
  }
  return write;    // the new length; chars[0..write) holds the answer
}

const chars = ["a", "a", "b", "b", "c", "c", "c"];
const n = compress(chars);
console.log(n);                         // 6
console.log(chars.slice(0, n).join("")); // a2b2c3`;

const rotationCode = `function isRotation(a, b) {
  return a.length === b.length && (a + a).includes(b);
}

console.log(isRotation("abcde", "cdeab")); // true
console.log(isRotation("abcde", "abced")); // false`;

export default function DsaLessonThirtyPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Strings are arrays of characters</h2>
      <p>
        Part 7 uses what you already know (two pointers, windows and frequency maps) on text. The only new idea is how
        JavaScript treats a string, so we start there. A <strong>string</strong> is a piece of text, a sequence of
        characters such as &ldquo;hello&rdquo;.
      </p>
      <p>
        A string behaves like a read-only array. <code>s[i]</code> gives the character at index i (its position, counting
        from 0). <code>s.length</code> is the number of characters. A <code>for</code> loop can walk through it. But a
        string is <strong>immutable</strong>, which means you can never change a character inside it. Every
        &ldquo;change&rdquo; builds a new string and leaves the old one as it was.
      </p>
      <CodeBlock lang="js" code={basicsCode} />
      <Callout kind="warn" label="The hidden cost of building strings">
        <code>result += ch</code> inside a loop creates a new string each time. In some languages this makes a loop that
        looks like O(n) behave more like O(n²), because every step copies the whole string. JavaScript engines are
        usually fast enough here. But for interviews, the safe habit is to collect the pieces in an array and call{" "}
        <code>join(&quot;&quot;)</code> once at the end. (<code>join</code> glues the array items into one string.)
      </Callout>
      <p>
        These methods are worth knowing well. <code>slice(a, b)</code> copies the part from index a up to (not
        including) b. <code>startsWith</code> checks the beginning of a string. <code>includes</code> checks whether
        some text is inside. <code>indexOf</code> gives the position of some text, or −1. <code>split(&quot;&quot;)</code>{" "}
        turns a string into an array of characters. <code>charCodeAt</code> gives the number code of a character.{" "}
        <code>toLowerCase</code> makes all letters small. And <code>[...s].reverse().join(&quot;&quot;)</code> reverses a
        string.
      </p>

      <h2 id="palindrome">Palindromes with two pointers</h2>
      <p>
        A <strong>palindrome</strong> is a word or text that reads the same forwards and backwards, such as
        &ldquo;racecar&rdquo; or &ldquo;noon&rdquo;. Put one pointer (an index that marks a position) at each end and
        walk them towards each other. If every pair of characters matches, the text is a palindrome. This is the
        two-pointer technique from Lesson 21, used on text. It takes O(n) time and O(1) extra space.
      </p>
      <CodeBlock lang="js" code={palCode} />
      <p>
        Real questions add extra characters: spaces, punctuation and capital letters. Do not build a cleaned copy unless
        you must. Instead, let each pointer <em>skip</em> the characters that do not count.
      </p>
      <CodeBlock lang="js" code={cleanCode} />

      <h2 id="expand">Longest palindromic substring: expand around the centre</h2>
      <p>
        A <strong>substring</strong> is a continuous part of a string. Finding the longest palindrome <em>inside</em> a
        string looks hard, but every palindrome has a centre. An odd-length palindrome (&ldquo;aba&rdquo;) is centred on
        one character. An even-length palindrome (&ldquo;abba&rdquo;) is centred between two characters. So try every
        possible centre and <strong>expand outwards</strong> while the two ends match.
      </p>
      <ul>
        <li>There are 2n − 1 centres (n characters plus n − 1 gaps between them).</li>
        <li>Each expansion costs up to O(n) time, so the total is <strong>O(n²) time and O(1) extra space</strong>.</li>
        <li>Checking every substring and testing each one would take O(n³) time. Expanding is much better.</li>
      </ul>
      <CodeBlock lang="js" code={expandCode} />
      <p>
        <code>expand</code> returns <code>r - l - 1</code>. When the loop stops, <code>l</code> and <code>r</code> have
        both stepped one place <em>past</em> the palindrome, so we remove those two extra places. For the odd case,{" "}
        <code>expand(i, i)</code> starts with a palindrome of length 1. For the even case, <code>expand(i, i + 1)</code>{" "}
        may fail at once and return 0.
      </p>

      <h2 id="trace">Traced: expanding around every centre</h2>
      <CodeTrace
        code={traceCode}
        steps={expandTrace()}
        caption="Each centre is expanded in both the odd form and the even form. We remember the longest result so far."
      />
      <DryRun
        title='longest palindrome in "babad"'
        cols={["Centre i", "Char", "odd", "even", "best so far"]}
        rows={[
          ["0", "b", "1", "0", "1  (b)"],
          ["1", "a", "3", "0", "3  (bab)"],
          ["2", "b", "3", "0", "3  (bab)"],
          ["3", "a", "1", "0", "3  (bab)"],
          ["4", "d", "1", "0", "3  (bab)"],
        ]}
        highlight={1}
        note="Centre 1 expands from “a” to “bab”. Centre 2 finds “aba”, which has the same length, so we keep the first one."
      />

      <h2 id="prefix">Longest common prefix</h2>
      <p>
        A <strong>prefix</strong> is the beginning part of a string. The common prefix of a list of words is the longest
        beginning that all the words share. It can never be longer than the first word. Start with{" "}
        <code>prefix = strs[0]</code>. Compare it with each next word, and cut characters off the end of the prefix
        until the word starts with it. When the prefix becomes empty, every word &ldquo;starts with&rdquo; it, so the
        loop always ends.
      </p>
      <CodeBlock lang="js" code={prefixCode} />
      <p>
        The cost is O(total characters) in the worst case. Another way is to scan column by column: compare character 0
        of every word, then character 1, and stop at the first mismatch. Practice question 3 shows both ways.
      </p>

      <h2 id="roman">Roman numerals: look one character ahead</h2>
      <p>
        Roman numerals are letters that stand for numbers: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000.
        You add the values from left to right, with one exception. When a small value sits <em>before</em> a larger
        one (IV, IX, XL, XC, CD, CM), the small value is <strong>subtracted</strong>. So walk through the string. If the
        current value is smaller than the next value, subtract it. Otherwise, add it.
      </p>
      <CodeBlock lang="js" code={romanCode} />
      <DryRun
        title="MCMXCIV = 1994"
        cols={["Char", "Value", "Next bigger?", "Total after"]}
        rows={[
          ["M", "1000", "no", "1000"],
          ["C", "100", "yes (M)", "900"],
          ["M", "1000", "no", "1900"],
          ["X", "10", "yes (C)", "1890"],
          ["C", "100", "no (I is smaller)", "1990"],
          ["I", "1", "yes (V)", "1989"],
          ["V", "5", "no (end)", "1994"],
        ]}
      />

      <h2 id="compress">String compression: read pointer, write pointer</h2>
      <p>
        A <em>run</em> is a group of the same character in a row. Compress each run into the character plus its count:{" "}
        <code>aabbccc</code> becomes <code>a2b2c3</code>. A single character stays as it is. To do this{" "}
        <em>in place</em> (inside the same array, without making a second one), use two pointers that both move
        forward. A <strong>read</strong> pointer finds each run. A <strong>write</strong> pointer records the result.
        The write pointer can never overtake the read pointer, because the compressed form is never longer than the run
        it replaces.
      </p>
      <CodeBlock lang="js" code={compressCode} />
      <Callout kind="note" label="Counts of 10 or more">
        A run of 12 letters becomes the letter followed by the two characters &ldquo;1&rdquo; and &ldquo;2&rdquo;. That is
        why the count is written with <code>for (const digit of String(j - i))</code>: one array slot for each digit.
      </Callout>

      <h2 id="rotation">Rotation check: the doubled-string trick</h2>
      <p>
        A <strong>rotation</strong> of a string moves some characters from the front to the back. Is
        &ldquo;cdeab&rdquo; a rotation of &ldquo;abcde&rdquo;? Join the original to itself: &ldquo;abcdeabcde&rdquo;.
        Every rotation of the original appears inside this doubled string as a substring. So the check has two parts:
        the lengths are the same, and the doubled string includes the other string.
      </p>
      <CodeBlock lang="js" code={rotationCode} />

      <h2 id="practice">Practice questions</h2>
      <p>Before you write the loop, say the pointer moves out loud. Where does each pointer start, and when does it move?</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the two-pointer palindrome check from memory, then extend it to skip punctuation.</>,
          <>Explain why there are 2n − 1 centres and why the expand function returns <code>r - l - 1</code>.</>,
          <>State the rule for Roman numerals and trace &ldquo;MCMXCIV&rdquo; on paper.</>,
          <>Explain why the write pointer in string compression can never pass the read pointer.</>,
          <>Prove why &ldquo;a + a includes b&rdquo; detects a rotation.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        You can now solve the classic text questions with pointers and centres. <strong>Lesson 31</strong> moves from
        checking a whole string to using <em>windows inside a string</em>. It covers the longest substring without
        repeats, character replacement, anagrams and the well-known minimum window problem.
      </p>
    </DsaLessonPage>
  );
}
