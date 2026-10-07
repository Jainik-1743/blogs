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

const lesson = getDsaLesson("lesson-58");

export const metadata: Metadata = {
  title: `Lesson 58 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "why", label: "Why a trie?" },
  { id: "trie", label: "Building a trie" },
  { id: "trace", label: "Traced: insert and search" },
  { id: "wild", label: "Wildcard search with DFS" },
  { id: "bits", label: "Bits and operators in JavaScript" },
  { id: "int32", label: "The 32-bit rule" },
  { id: "tricks", label: "Check, set, clear, toggle" },
  { id: "count", label: "Counting set bits" },
  { id: "xor", label: "Power of two, XOR and the single number" },
  { id: "masks", label: "Subsets with bitmasks" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const trieCode = `// A trie (prefix tree): every node is one character; a path from the root spells a prefix.
class TrieNode {
  constructor() {
    this.children = new Map();   // character -> TrieNode
    this.isEnd = false;          // true if a stored word ends exactly here
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    node.isEnd = true;
  }

  // Follow the characters of s from the root; return the last node, or null if the path breaks.
  #walk(s) {
    let node = this.root;
    for (const ch of s) {
      node = node.children.get(ch);
      if (node === undefined) return null;
    }
    return node;
  }

  search(word) {                  // is this exact word stored?
    const node = this.#walk(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix) {            // does any stored word begin with prefix?
    return this.#walk(prefix) !== null;
  }
}

const trie = new Trie();
trie.insert("apple");
console.log(trie.search("apple"));    // true
console.log(trie.search("app"));      // false   ("app" is only a prefix so far)
console.log(trie.startsWith("app"));  // true
trie.insert("app");
console.log(trie.search("app"));      // true`;

const wildCode = `// Words can be added normally; searches may contain "." which matches any single letter.
class WordDictionary {
  constructor() { this.root = { children: new Map(), isEnd: false }; }

  addWord(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), isEnd: false });
      node = node.children.get(ch);
    }
    node.isEnd = true;
  }

  search(pattern) {
    const dfs = (node, i) => {
      if (i === pattern.length) return node.isEnd;       // consumed the whole pattern: it must end a word
      const ch = pattern[i];
      if (ch === ".") {
        for (const child of node.children.values()) {    // wildcard: try every branch
          if (dfs(child, i + 1)) return true;
        }
        return false;
      }
      const child = node.children.get(ch);
      return child !== undefined && dfs(child, i + 1);   // normal letter: follow the one matching branch
    };
    return dfs(this.root, 0);
  }
}

const dict = new WordDictionary();
dict.addWord("bad"); dict.addWord("dad"); dict.addWord("mad");
console.log(dict.search("pad"));   // false
console.log(dict.search("bad"));   // true
console.log(dict.search(".ad"));   // true
console.log(dict.search("b.."));   // true
console.log(dict.search("b."));    // false   (too short)`;

const opsCode = `console.log(5 & 3);   // 1    AND: 1 only where both bits are 1       101 & 011 = 001
console.log(5 | 3);   // 7    OR:  1 where either bit is 1            101 | 011 = 111
console.log(5 ^ 3);   // 6    XOR: 1 where the bits differ            101 ^ 011 = 110
console.log(~5);      // -6   NOT: flips every one of the 32 bits (this equals -n - 1)
console.log(5 << 1);  // 10   shift left: multiplies by 2 (while it still fits in 32 bits)
console.log(5 >> 1);  // 2    shift right: divides by 2 and rounds down
console.log(7 .toString(2));      // 111    a number as a binary string
console.log(parseInt("1011", 2)); // 11     a binary string as a number
console.log(0b1010, 0xff);        // 10 255   binary and hexadecimal literals`;

const int32Code = `// JavaScript numbers are 64-bit floating point, but every bitwise operator first converts its
// operands to a 32-bit SIGNED integer (two's complement), works on those 32 bits, and gives back
// a 32-bit signed result: a number from -2147483648 to 2147483647.
console.log(1 << 30);              // 1073741824
console.log(1 << 31);              // -2147483648   bit 31 is the sign bit, so the result turns negative
console.log(1 << 32);              // 1             the shift count is taken modulo 32, so this is 1 << 0

// >>  keeps the sign (copies the top bit in);  >>>  fills with zeros, treating the 32 bits as UNSIGNED
console.log(-8 >> 1);              // -4
console.log(-8 >>> 1);             // 2147483644
console.log(-1 >>> 0);             // 4294967295    "n >>> 0" reinterprets a 32-bit pattern as an unsigned number
console.log((-5 >>> 0).toString(2)); // 11111111111111111111111111111011   the 32 bits of -5

// Anything outside 32 bits is silently truncated to its low 32 bits (a number is also cut to an integer first)
console.log(2 ** 32 + 5 | 0);      // 5             2^32 is a bit 33 positions up; it vanishes
console.log(2 ** 31 | 0);          // -2147483648   2^31 does not fit in a signed 32-bit integer
console.log(2 ** 53 | 0);          // 0             the low 32 bits of 2^53 are all zero
console.log(3.7 | 0, -3.7 | 0);    // 3 -3          the fraction is dropped (this truncates towards zero)

// Precedence trap: comparison binds tighter than &, so always bracket the bit operation.
console.log(4 & 1 === 0);          // 0             parsed as 4 & (1 === 0), i.e. 4 & false
console.log((4 & 1) === 0);        // true`;

const bigCode = `// For true 64-bit work, use BigInt: add n to a number literal and use the same operators.
console.log(1n << 40n);            // 1099511627776n
console.log((2n ** 64n) - 1n);     // 18446744073709551615n`;

const tricksCode = `const n = 0b1010;          // 10, bits (from the right, position 0) are: 0 1 0 1

// check bit i:   shift it to position 0, then keep only that bit
console.log((n >> 1) & 1);         // 1   bit 1 is set
console.log((n >> 2) & 1);         // 0   bit 2 is clear

// set bit i:     OR with a mask that has only bit i switched on
console.log(n | (1 << 2));         // 14  0b1110

// clear bit i:   AND with a mask that has every bit EXCEPT i switched on
console.log(n & ~(1 << 1));        // 8   0b1000

// toggle bit i:  XOR with the single-bit mask
console.log(n ^ (1 << 3));         // 2   0b0010
console.log(n ^ (1 << 0));         // 11  0b1011

// lowest set bit:  n & -n  keeps only the rightmost 1
console.log(12 & -12);             // 4   12 is 0b1100`;

const popCode = `// Brian Kernighan's trick: n & (n - 1) clears the lowest set bit.
// Why: subtracting 1 turns the lowest 1 into 0 and every 0 below it into 1; AND removes the whole stretch.
function countBits(n) {
  let count = 0;
  while (n !== 0) {
    n = n & (n - 1);            // one set bit removed per loop
    count++;
  }
  return count;                 // runs once per SET bit, not once per bit position
}

console.log(countBits(44));          // 3     44 is 0b101100
console.log(countBits(0));           // 0
console.log(countBits(4294967293));  // 31    0xFFFFFFFD: the whole 32 bits except one`;

const shiftCountCode = `// The straightforward way: look at the last bit, then shift it away.
function countBitsShift(n) {
  let count = 0;
  while (n !== 0) {
    count += n & 1;
    n >>>= 1;                   // UNSIGNED shift: with >> a negative number would never reach 0
  }
  return count;
}

console.log(countBitsShift(44));          // 3
console.log(countBitsShift(4294967293));  // 31`;

const powerCode = `// A power of two has exactly one set bit, so removing it leaves 0.
function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

console.log(isPowerOfTwo(16));   // true    0b10000 & 0b01111 = 0
console.log(isPowerOfTwo(18));   // false   0b10010 & 0b10001 = 0b10000
console.log(isPowerOfTwo(1));    // true    2^0
console.log(isPowerOfTwo(0));    // false
console.log(isPowerOfTwo(-8));   // false   n > 0 rejects negatives (and keeps 0, where 0 & -1 is 0, from counting)`;

const xorCode = `// Every number appears twice except one. XOR has three useful properties:
//   a ^ a = 0     a ^ 0 = a     and the order does not matter.
// So the pairs cancel and the loner is left.
function singleNumber(nums) {
  let result = 0;
  for (const x of nums) result ^= x;
  return result;
}

console.log(singleNumber([4, 1, 2, 1, 2])); // 4
console.log(singleNumber([2, 2, 1]));       // 1
console.log(singleNumber([7]));             // 7`;

const maskCode = `// n items => 2^n subsets. Read the binary digits of a mask from 0 to 2^n - 1:
// bit i set means "item i is in the subset".
function subsets(items) {
  const n = items.length;
  const result = [];
  for (let mask = 0; mask < (1 << n); mask++) {
    const subset = [];
    for (let i = 0; i < n; i++) {
      if ((mask >> i) & 1) subset.push(items[i]);
    }
    result.push(subset);
  }
  return result;
}

console.log(subsets(["a", "b", "c"]));
// [ [], [ 'a' ], [ 'b' ], [ 'a', 'b' ], [ 'c' ], [ 'a', 'c' ], [ 'b', 'c' ], [ 'a', 'b', 'c' ] ]`;

const traceSrc = `for (const word of ["cat", "car"]) {
  let node = root;
  for (const ch of word) {
    if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
    node = node.children.get(ch);
  }
  node.isEnd = true;
}
// now search("ca"):
node = root;
for (const ch of "ca") node = node.children.get(ch);
console.log(node.isEnd);`;

type TNode = { children: Map<string, TNode>; isEnd: boolean };

function trieSummary(root: TNode): string {
  const out: string[] = [];
  const walk = (node: TNode, prefix: string) => {
    for (const [ch, child] of node.children) {
      const p = prefix + ch;
      out.push(child.isEnd ? `${p}*` : p);
      walk(child, p);
    }
  };
  walk(root, "");
  return out.length ? out.join(" ") : "(empty)";
}

function trieTrace() {
  const t = tracer();
  const root: TNode = { children: new Map(), isEnd: false };
  t.step(1, "start", "an empty trie", "Only the root exists. It represents the empty prefix. In the variable panel, a trailing * marks a node where a word ends.", { trie: trieSummary(root) }, "trie");
  for (const word of ["cat", "car"]) {
    let node = root;
    t.step(2, "update", `insert "${word}": start at the root`, `Every insertion starts at the root and walks down one character at a time.`, { word, trie: trieSummary(root) }, "word");
    let built = "";
    for (const ch of word) {
      built += ch;
      if (!node.children.has(ch)) {
        node.children.set(ch, { children: new Map(), isEnd: false });
        t.step(4, "update", `no "${built}" yet: create it`, `The node for "${ch}" does not exist under this prefix, so create it.`, { word, ch, trie: trieSummary(root) }, "trie");
      } else {
        t.step(4, "check", `"${built}" already exists: reuse it`, `"cat" and "car" share the prefix "ca", so the second word walks over nodes the first one built. That sharing is what makes a trie compact.`, { word, ch, trie: trieSummary(root) }, "ch");
      }
      node = node.children.get(ch)!;
      t.step(5, "update", `move down to "${built}"`, `node now stands for the prefix "${built}".`, { word, ch, trie: trieSummary(root) }, "node");
    }
    node.isEnd = true;
    t.step(7, "update", `mark "${word}" as a word`, `Only the last node gets isEnd = true. Without this flag we could not tell "ca" (just a prefix) from "cat" (a stored word).`, { word, trie: trieSummary(root) }, "trie");
  }
  let node = root;
  t.step(10, "update", `search("ca"): back to the root`, `Searching follows the same path without creating anything.`, { trie: trieSummary(root) }, "node");
  for (const ch of "ca") {
    node = node.children.get(ch)!;
    t.step(11, "update", `follow "${ch}"`, `The path exists, so keep going.`, { ch, trie: trieSummary(root) }, "ch");
  }
  t.print(node.isEnd);
  t.step(12, "done", `isEnd is ${node.isEnd}`, `The path "ca" exists (startsWith("ca") would be true) but no word ends there, so search("ca") is false.`, { trie: trieSummary(root) }, "node");
  return t.steps;
}

const kernighanRows: string[][] = [
  ["start", "101100  (44)", "0", "three 1-bits to remove"],
  ["n & (n - 1)", "101100 & 101011 = 101000  (40)", "1", "the lowest 1 (value 4) is gone"],
  ["n & (n - 1)", "101000 & 100111 = 100000  (32)", "2", "the next lowest 1 (value 8) is gone"],
  ["n & (n - 1)", "100000 & 011111 = 000000  (0)", "3", "n is 0: stop. The answer is 3"],
];

const opRows: string[][] = [
  ["&", "AND", "1 if both bits are 1", "check or keep bits (masking)"],
  ["|", "OR", "1 if either bit is 1", "set bits"],
  ["^", "XOR", "1 if the bits differ", "toggle bits; cancel pairs"],
  ["~", "NOT", "flip all 32 bits (~n = -n - 1)", "build masks such as ~(1 << i)"],
  ["<<", "shift left", "move bits up, fill with 0", "1 << i makes a single-bit mask"],
  [">>", "signed shift right", "move bits down, copy the sign bit in", "halve a number, rounding down"],
  [">>>", "unsigned shift right", "move bits down, fill with 0", "treat 32 bits as unsigned (n >>> 0)"],
];

export default function DsaLessonFiftyEightPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="why">Why a trie?</h2>
      <p>
        Imagine a dictionary of 100,000 words and the question &quot;does any word start with <code>pre</code>?&quot; Scanning
        every word costs O(number of words). A <strong>trie</strong> (say &quot;try&quot;; also called a <strong>prefix tree</strong>) stores words
        as paths through a tree where each edge is one character, and words that share a beginning share the path. Answering the
        question now costs O(length of the prefix), no matter how many words are stored. Autocomplete, spell checkers and word-game
        solvers use exactly this.
      </p>

      <h2 id="trie">Building a trie</h2>
      <p>
        Each node holds its <strong>children</strong>, a <code>Map</code> from a character to the next node, plus a flag{" "}
        <code>isEnd</code> saying whether a stored word finishes at that node. The flag is essential: after inserting
        &quot;apple&quot; the nodes for &quot;a&quot;, &quot;ap&quot;, &quot;app&quot; and &quot;appl&quot; all exist, yet only &quot;apple&quot; is a word.
      </p>
      <p>
        All three operations walk down from the root, one character per step, so each takes <strong>O(L)</strong> time for a word
        of length L. Space is O(total characters stored) in the worst case, less when words share prefixes.
      </p>
      <CodeBlock lang="js" code={trieCode} />
      <Callout kind="note" label="Map or array of 26?">
        A <code>Map</code> works for any alphabet and only stores letters that occur. When the input is strictly lowercase English, an
        array of 26 slots (<code>children[ch.charCodeAt(0) - 97]</code>) is a common, slightly faster alternative. The logic is
        identical.
      </Callout>

      <h2 id="trace">Traced: insert and search</h2>
      <CodeTrace
        code={traceSrc}
        steps={trieTrace()}
        caption="Inserting cat then car: the second word reuses c and a, and adds only one new node. Searching ca ends on a node whose isEnd is false."
      />

      <h2 id="wild">Wildcard search with DFS</h2>
      <p>
        Now let a search pattern contain <code>.</code>, meaning &quot;any one letter&quot;. A normal letter has exactly one place to go, but a dot
        could be any child, so we must try them all. That is a <strong>depth-first search</strong> (DFS) over the trie: follow a
        branch as deep as it goes, and back up to try the next one if it fails. The recursion tracks the node and the position in
        the pattern.
      </p>
      <CodeBlock lang="js" code={wildCode} />
      <p>
        Without dots a search is O(L). With dots it can visit many branches: in the worst case, a pattern of all dots explores the
        whole trie, which is O(total characters stored).
      </p>

      <h2 id="bits">Bits and operators in JavaScript</h2>
      <p>
        Computers store integers as <strong>bits</strong> (binary digits, 0 or 1). The number 5 is <code>101</code>: one 4, no 2, one
        1. Bit positions are counted from the right starting at 0, so in <code>101</code> bits 0 and 2 are set. JavaScript gives you
        these <strong>bitwise operators</strong>:
      </p>
      <DryRun
        title="the bitwise operators"
        cols={["Operator", "Name", "Result bit is...", "Typical use"]}
        rows={opRows}
      />
      <CodeBlock lang="js" code={opsCode} />

      <h2 id="int32">The 32-bit rule</h2>
      <p>
        Here is the detail that surprises people. A JavaScript number is a 64-bit floating-point value, but{" "}
        <strong>every bitwise operator first converts its operands to a 32-bit signed integer</strong>, in two&apos;s complement form (the
        usual way computers store negative numbers: the top bit, bit 31, is the sign, and a set sign bit means negative). The result
        is also a 32-bit signed integer, in the range <code>-2147483648</code> to <code>2147483647</code>. Three consequences:
      </p>
      <ul>
        <li>
          <strong>Overflow turns negative:</strong> <code>1 &lt;&lt; 31</code> is <code>-2147483648</code>, not 2147483648.
        </li>
        <li>
          <strong>Large values are truncated:</strong> only the low 32 bits are kept, so <code>2 ** 32 + 5 | 0</code> is{" "}
          <code>5</code>. Numbers beyond 2<sup>32</sup> silently lose their high bits. Anything above 2<sup>53</sup> is not even exact
          as a plain number.
        </li>
        <li>
          <strong>Shift counts wrap:</strong> the count is taken modulo 32, so <code>1 &lt;&lt; 32</code> equals{" "}
          <code>1 &lt;&lt; 0</code>, which is 1.
        </li>
      </ul>
      <p>
        <code>&gt;&gt;</code> (signed) copies the sign bit into the vacated places, so negatives stay negative.{" "}
        <code>&gt;&gt;&gt;</code> (unsigned) fills with zeros and returns a result from 0 to 4294967295. The idiom{" "}
        <code>n &gt;&gt;&gt; 0</code> converts a 32-bit pattern to its unsigned value.
      </p>
      <CodeBlock lang="js" code={int32Code} />
      <p>
        If you truly need more than 32 bits, use <code>BigInt</code>, whose operators have no 32-bit limit:
      </p>
      <CodeBlock lang="js" code={bigCode} />

      <h2 id="tricks">Check, set, clear, toggle</h2>
      <p>
        Four operations cover most needs. The key object is a <strong>mask</strong>: a number built to touch only some bits.{" "}
        <code>1 &lt;&lt; i</code> is the mask with only bit <code>i</code> switched on.
      </p>
      <CodeBlock lang="js" code={tricksCode} />

      <h2 id="count">Counting set bits</h2>
      <p>
        A bit that equals 1 is a <strong>set bit</strong>. The expression <code>n &amp; (n - 1)</code> removes the lowest set bit:
        subtracting 1 turns that bit into 0 and every zero below it into 1, so the AND wipes out exactly that stretch. Looping
        until <code>n</code> is 0 therefore runs once per set bit.
      </p>
      <CodeBlock lang="js" code={popCode} />
      <DryRun
        title="countBits(44)"
        cols={["Step", "n & (n - 1)", "count", "Meaning"]}
        rows={kernighanRows}
        highlight={3}
        note="Each loop removes the lowest 1 and nothing else. 44 has three 1-bits, so exactly three loops."
      />
      <p>The plain alternative checks every position. Note the unsigned shift, so a negative input still ends:</p>
      <CodeBlock lang="js" code={shiftCountCode} />

      <h2 id="xor">Power of two, XOR and the single number</h2>
      <p>
        A power of two has exactly one set bit (<code>1000</code>), so <code>n &amp; (n - 1)</code> clears it and leaves 0. Add{" "}
        <code>n &gt; 0</code> to rule out zero and negatives.
      </p>
      <CodeBlock lang="js" code={powerCode} />
      <Callout kind="warn" label="Stay inside 32 bits">
        Because <code>&amp;</code> sees only the low 32 bits, this trick is trustworthy for inputs up to 2<sup>31</sup> - 1, which is
        what interview problems promise. A value such as <code>2 ** 32 + 1</code> has <code>n - 1 = 2 ** 32</code>, and both are
        truncated before the AND, so the test would wrongly return true. Beyond 32 bits, use BigInt or a different method.
      </Callout>
      <p>
        XOR (<code>^</code>) has three properties worth memorising: <code>a ^ a = 0</code>, <code>a ^ 0 = a</code>, and the order
        does not matter. XOR a whole array in which every value appears twice except one, and all the pairs cancel, leaving the odd
        one out, in O(n) time and O(1) space:
      </p>
      <CodeBlock lang="js" code={xorCode} />

      <h2 id="masks">Subsets with bitmasks</h2>
      <p>
        You met subsets in lesson 33 with backtracking. Bits give a loop-only alternative: with n items there are 2<sup>n</sup> subsets,
        and each number from 0 to 2<sup>n</sup> - 1 written in binary says which items to take (bit i set means item i is in). It
        is practical only for small n (up to about 20, since 1 &lt;&lt; n must also stay within 32 bits).
      </p>
      <CodeBlock lang="js" code={maskCode} />

      <h2 id="practice">Practice questions</h2>
      <p>
        For the trie questions, draw the tree for two or three words first. For the bit questions, write the numbers in binary on
        paper before you code.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write a Trie class with insert, search and startsWith from memory, and say what <code>isEnd</code> is for.</>,
          <>Explain how a <code>.</code> in a pattern turns the search into a DFS over children.</>,
          <>State the 32-bit rule: what happens to <code>1 &lt;&lt; 31</code>, to <code>2 ** 32 + 5 | 0</code>, and what <code>n &gt;&gt;&gt; 0</code> does.</>,
          <>Write the four mask operations: check, set, clear and toggle bit i.</>,
          <>Explain why <code>n &amp; (n - 1)</code> clears the lowest set bit, and use it to count bits and test powers of two.</>,
          <>Explain why XOR finds the single number.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        You now have every technique in this series. <strong>Lesson 59</strong>, The Interview Playbook, is about using them under
        pressure: what to ask, how to talk through a brute force, how to code cleanly and test with a dry run, and how to use hints.
      </p>
    </DsaLessonPage>
  );
}
