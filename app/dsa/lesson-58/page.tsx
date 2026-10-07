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
  { id: "wild", label: "Wildcard search (depth-first search)" },
  { id: "bits", label: "Bits and operators in JavaScript" },
  { id: "int32", label: "The 32-bit rule" },
  { id: "tricks", label: "Check, set, clear and flip a bit" },
  { id: "count", label: "Counting set bits" },
  { id: "xor", label: "Power of two, XOR and the single number" },
  { id: "masks", label: "Subsets with bit masks" },
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
  t.step(1, "start", "an empty trie", "Only the root exists. It stands for the empty prefix (nothing typed yet). In the variable panel, a * at the end marks a node where a word ends.", { trie: trieSummary(root) }, "trie");
  for (const word of ["cat", "car"]) {
    let node = root;
    t.step(2, "update", `insert "${word}": start at the root`, `Every insert starts at the root and goes down one character at a time.`, { word, trie: trieSummary(root) }, "word");
    let built = "";
    for (const ch of word) {
      built += ch;
      if (!node.children.has(ch)) {
        node.children.set(ch, { children: new Map(), isEnd: false });
        t.step(4, "update", `no "${built}" yet: create it`, `There is no node for "${ch}" under this prefix, so make one.`, { word, ch, trie: trieSummary(root) }, "trie");
      } else {
        t.step(4, "check", `"${built}" already exists: reuse it`, `"cat" and "car" share the start "ca", so the second word uses nodes the first word already made. This sharing keeps a trie small.`, { word, ch, trie: trieSummary(root) }, "ch");
      }
      node = node.children.get(ch)!;
      t.step(5, "update", `move down to "${built}"`, `node now stands for the start of the word "${built}".`, { word, ch, trie: trieSummary(root) }, "node");
    }
    node.isEnd = true;
    t.step(7, "update", `mark "${word}" as a word`, `Only the last node gets isEnd = true. Without this flag we could not tell "ca" (only the start of a word) from "cat" (a stored word).`, { word, trie: trieSummary(root) }, "trie");
  }
  let node = root;
  t.step(10, "update", `search("ca"): back to the root`, `Searching follows the same path but does not create anything.`, { trie: trieSummary(root) }, "node");
  for (const ch of "ca") {
    node = node.children.get(ch)!;
    t.step(11, "update", `follow "${ch}"`, `The path is there, so keep going.`, { ch, trie: trieSummary(root) }, "ch");
  }
  t.print(node.isEnd);
  t.step(12, "done", `isEnd is ${node.isEnd}`, `The path "ca" is there (startsWith("ca") would be true), but no word ends there. So search("ca") is false.`, { trie: trieSummary(root) }, "node");
  return t.steps;
}

const kernighanRows: string[][] = [
  ["start", "101100  (44)", "0", "three 1-bits to remove"],
  ["n & (n - 1)", "101100 & 101011 = 101000  (40)", "1", "the lowest 1 (value 4) is removed"],
  ["n & (n - 1)", "101000 & 100111 = 100000  (32)", "2", "the next lowest 1 (value 8) is removed"],
  ["n & (n - 1)", "100000 & 011111 = 000000  (0)", "3", "n is 0, so stop. The answer is 3"],
];

const opRows: string[][] = [
  ["&", "AND", "1 if both bits are 1", "check bits or keep only some bits (masking)"],
  ["|", "OR", "1 if either bit is 1", "set bits"],
  ["^", "XOR", "1 if the bits differ", "flip bits; cancel pairs"],
  ["~", "NOT", "flip all 32 bits (~n = -n - 1)", "make masks such as ~(1 << i)"],
  ["<<", "shift left", "move bits up, fill with 0", "1 << i makes a mask with one bit on"],
  [">>", "signed shift right", "move bits down, copy the sign bit into the gap", "halve a number, rounding down"],
  [">>>", "unsigned shift right", "move bits down, fill with 0", "read 32 bits as a positive number (n >>> 0)"],
];

export default function DsaLessonFiftyEightPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="why">Why a trie?</h2>
      <p>
        Imagine a dictionary of 100,000 words. You ask: &quot;does any word start with <code>pre</code>?&quot; (A prefix is the
        beginning of a word.) Checking every word takes O(number of words) time. A <strong>trie</strong> (say &quot;try&quot;; it is
        also called a <strong>prefix tree</strong>) is a better way. It stores words as paths through a tree, where each step is one
        character. Words that start the same way share the same path. Think of a phone book where all the names starting with
        &ldquo;Sm&rdquo; sit together. Now the question costs only O(length of the prefix), however many words are stored.
        Autocomplete, spell checkers and word-game solvers use this idea.
      </p>

      <h2 id="trie">Building a trie</h2>
      <p>
        Each node holds its <strong>children</strong>. This is a <code>Map</code> (a list of pairs) that links a character to the next
        node. Each node also has a flag called <code>isEnd</code>. It says if a stored word finishes at that node. The flag is needed.
        After you insert &quot;apple&quot;, the nodes for &quot;a&quot;, &quot;ap&quot;, &quot;app&quot; and &quot;appl&quot; all exist.
        But only &quot;apple&quot; is a word.
      </p>
      <p>
        All three operations (insert, search and startsWith) walk down from the root, one character at a time. So each takes{" "}
        <strong>O(L)</strong> time for a word with L letters. Memory is O(total characters stored) in the worst case. It is less when
        words share the same start.
      </p>
      <CodeBlock lang="js" code={trieCode} />
      <Callout kind="note" label="Map or array of 26?">
        A <code>Map</code> works for any alphabet and stores only the letters that appear. If the input is only lowercase English
        letters, you can use an array with 26 slots instead (<code>children[ch.charCodeAt(0) - 97]</code>). This is common and a little
        faster. The logic is the same.
      </Callout>

      <h2 id="trace">Traced: insert and search</h2>
      <CodeTrace
        code={traceSrc}
        steps={trieTrace()}
        caption="We insert cat, then car. The second word reuses c and a, and adds only one new node. Searching ca ends on a node where isEnd is false."
      />

      <h2 id="wild">Wildcard search with DFS</h2>
      <p>
        Now let the search pattern contain <code>.</code>, which means &quot;any one letter&quot;. A normal letter has exactly one way to
        go. A dot could be any child, so we must try all of them. This is a <strong>depth-first search</strong> (DFS). You follow one
        branch as deep as it goes. If it fails, you go back up and try the next branch. It is like exploring a maze: walk down one
        corridor until it ends, then return and try another. The recursion (a function that calls itself) keeps track of the node and
        the position in the pattern.
      </p>
      <CodeBlock lang="js" code={wildCode} />
      <p>
        Without dots, a search takes O(L). With dots it can visit many branches. In the worst case, a pattern of only dots explores the
        whole trie. That takes O(total characters stored).
      </p>

      <h2 id="bits">Bits and operators in JavaScript</h2>
      <p>
        Computers store whole numbers as <strong>bits</strong> (binary digits, each one a 0 or a 1). Think of a row of light switches
        that are either off (0) or on (1). The number 5 is <code>101</code>: one 4, no 2, and one 1. We count bit positions from the
        right, starting at 0. So in <code>101</code>, bits 0 and 2 are set (on). JavaScript has these <strong>bitwise operators</strong>
        (operators that work on each bit):
      </p>
      <DryRun
        title="the bitwise operators"
        cols={["Operator", "Name", "Result bit is...", "Typical use"]}
        rows={opRows}
      />
      <CodeBlock lang="js" code={opsCode} />

      <h2 id="int32">The 32-bit rule</h2>
      <p>
        This detail surprises many people. A JavaScript number is normally a 64-bit decimal-style value (floating point). But{" "}
        <strong>every bitwise operator first turns its inputs into 32-bit signed integers</strong>. &ldquo;Signed&rdquo; means the
        number can be negative. The form used is called two&apos;s complement, which is the usual way computers store negative numbers.
        In it, the top bit (bit 31) is the sign. If that bit is on, the number is negative. The result is also a 32-bit signed
        integer, from <code>-2147483648</code> to <code>2147483647</code>. This has three effects:
      </p>
      <ul>
        <li>
          <strong>Too-big numbers turn negative:</strong> <code>1 &lt;&lt; 31</code> is <code>-2147483648</code>, not 2147483648.
        </li>
        <li>
          <strong>Big values are cut off:</strong> only the lowest 32 bits are kept, so <code>2 ** 32 + 5 | 0</code> is{" "}
          <code>5</code>. Numbers beyond 2<sup>32</sup> lose their high bits, and there is no warning. Anything above 2<sup>53</sup> is
          not even exact as a normal number.
        </li>
        <li>
          <strong>Shift counts wrap around:</strong> the count is taken modulo 32 (the remainder after dividing by 32). So{" "}
          <code>1 &lt;&lt; 32</code> equals <code>1 &lt;&lt; 0</code>, which is 1.
        </li>
      </ul>
      <p>
        <code>&gt;&gt;</code> (signed shift) copies the sign bit into the empty places, so negative numbers stay negative.{" "}
        <code>&gt;&gt;&gt;</code> (unsigned shift) fills the empty places with zeros and gives a result from 0 to 4294967295. The
        common trick <code>n &gt;&gt;&gt; 0</code> turns a 32-bit pattern into a positive number.
      </p>
      <CodeBlock lang="js" code={int32Code} />
      <p>
        If you really need more than 32 bits, use <code>BigInt</code> (a number type for very big whole numbers). Its operators have no 32-bit limit:
      </p>
      <CodeBlock lang="js" code={bigCode} />

      <h2 id="tricks">Check, set, clear, toggle</h2>
      <p>
        Four operations cover most needs: check a bit, set it (turn it on), clear it (turn it off), and toggle it (flip it). The key tool
        is a <strong>mask</strong>. A mask is a number made to touch only some bits, like a stencil that lets paint through only in
        some places. <code>1 &lt;&lt; i</code> is the mask with only bit <code>i</code> switched on.
      </p>
      <CodeBlock lang="js" code={tricksCode} />

      <h2 id="count">Counting set bits</h2>
      <p>
        A bit that equals 1 is called a <strong>set bit</strong>. The expression <code>n &amp; (n - 1)</code> removes the lowest set
        bit. Here is why. Subtracting 1 turns that bit into 0, and turns every zero below it into 1. Then the AND wipes out exactly
        that part. So if you loop until <code>n</code> is 0, the loop runs once for each set bit.
      </p>
      <CodeBlock lang="js" code={popCode} />
      <DryRun
        title="countBits(44)"
        cols={["Step", "n & (n - 1)", "count", "Meaning"]}
        rows={kernighanRows}
        highlight={3}
        note="Each loop removes the lowest 1 and nothing else. 44 has three 1-bits, so there are exactly three loops."
      />
      <p>The simple way checks every bit position. Notice the unsigned shift. It makes sure the loop still ends for a negative input:</p>
      <CodeBlock lang="js" code={shiftCountCode} />

      <h2 id="xor">Power of two, XOR and the single number</h2>
      <p>
        A power of two (1, 2, 4, 8, 16 and so on) has exactly one set bit, like <code>1000</code>. So <code>n &amp; (n - 1)</code>{" "}
        clears it and leaves 0. Add <code>n &gt; 0</code> to rule out zero and negative numbers.
      </p>
      <CodeBlock lang="js" code={powerCode} />
      <Callout kind="warn" label="Stay inside 32 bits">
        <code>&amp;</code> sees only the lowest 32 bits. So this trick is safe for inputs up to 2<sup>31</sup> - 1, which is what
        interview problems promise. Take a value like <code>2 ** 32 + 1</code>. Here <code>n - 1 = 2 ** 32</code>. Both numbers are
        cut to 32 bits before the AND, so the test would wrongly return true. For more than 32 bits, use BigInt or a different method.
      </Callout>
      <p>
        XOR (<code>^</code>) has three properties worth remembering: <code>a ^ a = 0</code>, <code>a ^ 0 = a</code>, and the order
        does not matter. Now take an array where every value appears twice, except one. XOR all the values together. The pairs cancel
        each other, and only the odd one out is left. This takes O(n) time and O(1) memory:
      </p>
      <CodeBlock lang="js" code={xorCode} />

      <h2 id="masks">Subsets with bitmasks</h2>
      <p>
        You met subsets in lesson 33, where we used backtracking. Bits give another way that needs only a loop. With n items there are
        2<sup>n</sup> subsets. Each number from 0 to 2<sup>n</sup> - 1, written in binary, tells you which items to take. If bit i is
        set, item i is in the subset. This works only for small n (up to about 20), because 1 &lt;&lt; n must also fit in 32 bits.
      </p>
      <CodeBlock lang="js" code={maskCode} />

      <h2 id="practice">Practice questions</h2>
      <p>
        For the trie questions, first draw the tree for two or three words. For the bit questions, first write the numbers in binary on
        paper. Then write the code.
      </p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write a Trie class with insert, search and startsWith from memory. Say what <code>isEnd</code> is for.</>,
          <>Explain how a <code>.</code> in a pattern turns the search into a depth-first search over the children.</>,
          <>State the 32-bit rule. Say what happens to <code>1 &lt;&lt; 31</code> and to <code>2 ** 32 + 5 | 0</code>, and what <code>n &gt;&gt;&gt; 0</code> does.</>,
          <>Write the four mask operations: check, set, clear and toggle (flip) bit i.</>,
          <>Explain why <code>n &amp; (n - 1)</code> clears the lowest set bit. Use it to count bits and to test for powers of two.</>,
          <>Explain why XOR finds the number that appears only once.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        You now have every technique in this series. <strong>Lesson 59</strong>, The Interview Playbook, is about using them when you
        feel pressure. It covers what to ask, how to explain a brute-force (try everything) answer, how to write clean code and test it
        with a dry run, and how to use hints.
      </p>
    </DsaLessonPage>
  );
}
