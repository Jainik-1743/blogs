import Problem from "@/components/dsa/Problem";

/** Lesson 58 practice questions: tries and bit manipulation. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Implement Trie (prefix tree)"
        level="Medium"
        examples={[
          {
            input: 'insert("apple"), search("apple"), search("app"), startsWith("app"), insert("app"), search("app")',
            output: "true, false, true, true",
            why: 'The calls that return something are, in order: search("apple") = true, search("app") = false (only the start of a word so far), startsWith("app") = true. After inserting "app", search("app") = true.',
          },
        ]}
        hints={[
          <>Each node needs to know its children and whether a word ends there.</>,
          <>Insert, search and startsWith all start the same way. Walk from the root, following the characters.</>,
          <>When you reach the end of the walk, what is the one difference between search and startsWith?</>,
        ]}
        approaches={[
          {
            name: "Brute force: a Set of words",
            idea: <p>Store every word in a <code>Set</code> (a built-in collection that keeps each value once and checks whether a value is in it in about O(1) time). search is a quick lookup. startsWith checks the beginning of every word, one by one.</p>,
            code: `class Trie {
  constructor() { this.words = new Set(); }
  insert(word) { this.words.add(word); }
  search(word) { return this.words.has(word); }
  startsWith(prefix) {
    for (const w of this.words) if (w.startsWith(prefix)) return true;
    return false;
  }
}

const t = new Trie();
t.insert("apple");
console.log(t.search("apple"));    // true
console.log(t.search("app"));      // false
console.log(t.startsWith("app"));  // true
t.insert("app");
console.log(t.search("app"));      // true`,
            explain: <p>This is correct. But each startsWith call takes O(total characters stored). A trie exists to avoid exactly this.</p>,
          },
          {
            name: "Trie with Map children",
            idea: <p>A node holds a <code>Map</code> of children and an <code>isEnd</code> flag. One shared helper walks along a string. It returns the node where the walk ends, or null if the path breaks.</p>,
            code: `class TrieNode {
  constructor() { this.children = new Map(); this.isEnd = false; }
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
  walk(s) {
    let node = this.root;
    for (const ch of s) {
      node = node.children.get(ch);
      if (node === undefined) return null;
    }
    return node;
  }
  search(word) { const node = this.walk(word); return node !== null && node.isEnd; }
  startsWith(prefix) { return this.walk(prefix) !== null; }
}

const t = new Trie();
t.insert("apple");
console.log(t.search("apple"));    // true
console.log(t.search("app"));      // false
console.log(t.startsWith("app"));  // true
t.insert("app");
console.log(t.search("app"));      // true`,
            explain: <p>Each operation takes O(L) for a word with L letters, however many words are stored. Memory is O(total characters inserted) in the worst case.</p>,
          },
          {
            name: "Trie with an array of 26 children",
            idea: <p>If the input is only lowercase English letters, use a fixed array of 26 slots instead of a Map. The index of a letter is its character code minus the code of &quot;a&quot;.</p>,
            code: `class Trie {
  constructor() { this.children = new Array(26).fill(null); this.isEnd = false; }   // each Trie object is also a node
  insert(word) {
    let node = this;
    for (const ch of word) {
      const i = ch.charCodeAt(0) - 97;
      if (node.children[i] === null) node.children[i] = new Trie();
      node = node.children[i];
    }
    node.isEnd = true;
  }
  walk(s) {
    let node = this;
    for (const ch of s) {
      node = node.children[ch.charCodeAt(0) - 97];
      if (node === null) return null;
    }
    return node;
  }
  search(word) { const node = this.walk(word); return node !== null && node.isEnd; }
  startsWith(prefix) { return this.walk(prefix) !== null; }
}

const t = new Trie();
t.insert("apple");
console.log(t.search("apple"));    // true
console.log(t.search("app"));      // false
console.log(t.startsWith("app"));  // true
t.insert("app");
console.log(t.search("app"));      // true`,
            explain: <p>The time is the same O(L), and finding a child is faster. But every node reserves 26 slots even if it has only one child. So it uses more memory when the trie is thin. It also works only for lowercase letters.</p>,
          },
        ]}
        compare={<p>Use the Map trie. It works for any characters and is easy to read. Mention the 26-slot array version as the usual choice for lowercase input. (LeetCode 208.)</p>}
      >
        <p>
          Design a <code>Trie</code> class with <code>insert(word)</code>, <code>search(word)</code> (true only if exactly that word
          was inserted) and <code>startsWith(prefix)</code> (true if any inserted word begins with the prefix, which is the start of a word).
        </p>
      </Problem>

      <Problem
        n={2}
        title="Design add and search words data structure"
        level="Medium"
        examples={[
          {
            input: 'addWord("bad"), addWord("dad"), addWord("mad"), search("pad"), search("bad"), search(".ad"), search("b..")',
            output: "false, true, true, true",
            why: '"pad" is not stored. "bad" is stored. ".ad" matches bad, dad and mad. "b.." matches "bad".',
          },
        ]}
        hints={[
          <>Store the words in a trie. What does a letter in the pattern allow? What does a dot allow?</>,
          <>A dot means &quot;try every child&quot;. Which technique tries several branches one after another?</>,
          <>When you have used the whole pattern, what must be true about the current node?</>,
        ]}
        approaches={[
          {
            name: "Brute force: compare with every stored word",
            idea: <p>Keep the words in an array. For each word with the same length, compare it with the pattern letter by letter. Treat <code>.</code> as a match for any letter.</p>,
            code: `class WordDictionary {
  constructor() { this.words = []; }
  addWord(word) { this.words.push(word); }
  search(pattern) {
    for (const w of this.words) {
      if (w.length !== pattern.length) continue;
      let ok = true;
      for (let i = 0; i < w.length; i++) {
        if (pattern[i] !== "." && pattern[i] !== w[i]) { ok = false; break; }
      }
      if (ok) return true;
    }
    return false;
  }
}

const d = new WordDictionary();
d.addWord("bad"); d.addWord("dad"); d.addWord("mad");
console.log(d.search("pad"));  // false
console.log(d.search("bad"));  // true
console.log(d.search(".ad"));  // true
console.log(d.search("b.."));  // true`,
            explain: <p>Each search takes O(N × L) for N stored words of length L. It is simple and fine for small inputs. But a trie avoids looking at words that cannot match.</p>,
          },
          {
            name: "Trie plus depth-first search on dots",
            idea: <p>Build a trie. To search, use recursion (a function that calls itself) with (node, position). A normal letter follows its one child. A dot tries every child and succeeds if any child succeeds. At the end of the pattern, succeed only if the node marks the end of a word.</p>,
            code: `class WordDictionary {
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
      if (i === pattern.length) return node.isEnd;
      if (pattern[i] === ".") {
        for (const child of node.children.values()) if (dfs(child, i + 1)) return true;
        return false;
      }
      const child = node.children.get(pattern[i]);
      return child !== undefined && dfs(child, i + 1);
    };
    return dfs(this.root, 0);
  }
}

const d = new WordDictionary();
d.addWord("bad"); d.addWord("dad"); d.addWord("mad");
console.log(d.search("pad"));  // false
console.log(d.search("bad"));  // true
console.log(d.search(".ad"));  // true
console.log(d.search("b.."));  // true
console.log(d.search("b."));   // false`,
            explain: <p>A pattern without dots costs O(L). With dots the search can spread out and, in the worst case, visit every node of the trie. But it skips (prunes) any branch where the letter does not match. The recursion goes at most L calls deep (the pattern length), which is small.</p>,
          },
        ]}
        compare={<p>The trie with depth-first search is the answer interviewers expect. Skipping bad branches is what makes it better than scanning the whole list. Be ready to say what the worst case is for a pattern of only dots. (LeetCode 211.)</p>}
      >
        <p>
          Design a structure with <code>addWord(word)</code> and <code>search(pattern)</code>. A pattern may contain the character{" "}
          <code>.</code>, which matches any one letter. <code>search</code> returns true if some stored word matches the whole
          pattern.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Single number"
        level="Easy"
        examples={[
          { input: "nums = [2,2,1]", output: "1", why: "Only 1 appears once." },
          { input: "nums = [4,1,2,1,2]", output: "4", why: "1 and 2 appear twice. 4 appears once." },
        ]}
        hints={[
          <>Counting how often each number appears works. Can you do it without any extra memory?</>,
          <>What is <code>x ^ x</code>? What is <code>x ^ 0</code>?</>,
          <>If you XOR all the numbers together, what is left over?</>,
        ]}
        approaches={[
          {
            name: "Count with a Map",
            idea: <p>Count how many times each value appears. Then return the value that appears once.</p>,
            code: `function singleNumber(nums) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  for (const [value, count] of counts) if (count === 1) return value;
}

console.log(singleNumber([2, 2, 1]));       // 1
console.log(singleNumber([4, 1, 2, 1, 2])); // 4
console.log(singleNumber([7]));             // 7`,
            explain: <p>O(n) time, but O(n) extra memory for the Map.</p>,
          },
          {
            name: "Set arithmetic",
            idea: <p>Add up the different values and double the result. Subtract the real sum. What is left is exactly the single number: <code>2 × sum(set) - sum(nums)</code>.</p>,
            code: `function singleNumber(nums) {
  const distinct = new Set(nums);
  let twice = 0, total = 0;
  for (const x of distinct) twice += 2 * x;
  for (const x of nums) total += x;
  return twice - total;
}

console.log(singleNumber([2, 2, 1]));       // 1
console.log(singleNumber([4, 1, 2, 1, 2])); // 4
console.log(singleNumber([7]));             // 7`,
            explain: <p>O(n) time, O(n) memory. This is a nice trick, but it still uses a Set.</p>,
          },
          {
            name: "XOR everything",
            idea: <p>With XOR, equal values cancel each other (<code>x ^ x = 0</code>). Zero changes nothing, and the order does not matter. So if you XOR the whole array, only the single value is left.</p>,
            code: `function singleNumber(nums) {
  let result = 0;
  for (const x of nums) result ^= x;
  return result;
}

console.log(singleNumber([2, 2, 1]));       // 1
console.log(singleNumber([4, 1, 2, 1, 2])); // 4
console.log(singleNumber([7]));             // 7`,
            explain: <p>O(n) time and O(1) memory. It works for values inside the 32-bit signed range, which the problem promises. Beyond that range, JavaScript&apos;s bitwise operators cut the number to 32 bits and the result would be wrong.</p>,
          },
        ]}
        compare={<p>XOR is the answer the question is looking for (linear time, constant memory). If you want a safe start, begin with the Map and then improve it. (LeetCode 136.)</p>}
      >
        <p>
          Every element of <code>nums</code> appears exactly twice, except one element that appears once. Return that element. If you can, use linear
          time (one pass) and constant extra memory.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Number of 1 bits"
        level="Easy"
        examples={[
          { input: "n = 11", output: "3", why: "11 is 1011 in binary, which has three 1s." },
          { input: "n = 128", output: "1", why: "128 is 10000000." },
          { input: "n = 4294967293", output: "31", why: "As an unsigned 32-bit value this is 11111111111111111111111111111101: thirty-one 1s." },
        ]}
        hints={[
          <>Look at the lowest bit with <code>n &amp; 1</code>, then shift. Which shift operator is safe for big inputs?</>,
          <>A faster idea: what does <code>n &amp; (n - 1)</code> do to the lowest set bit?</>,
        ]}
        approaches={[
          {
            name: "Check each bit by shifting",
            idea: <p>Add <code>n &amp; 1</code> to the count. Shift right with the unsigned operator. Repeat until n is 0.</p>,
            code: `function hammingWeight(n) {
  let count = 0;
  while (n !== 0) {
    count += n & 1;
    n >>>= 1;                 // unsigned: the sign bit does not stick
  }
  return count;
}

console.log(hammingWeight(11));          // 3
console.log(hammingWeight(128));         // 1
console.log(hammingWeight(4294967293));  // 31`,
            explain: <p>At most 32 loops, so O(1) for a fixed bit size. The <code>&gt;&gt;&gt;</code> matters. With <code>&gt;&gt;</code>, a value like 4294967293 (which the operators see as the negative number -3) would keep copying the sign bit and never reach 0.</p>,
          },
          {
            name: "Clear the lowest set bit each time",
            idea: <p><code>n &amp; (n - 1)</code> removes the lowest 1. Count how many times you can do this before n becomes 0.</p>,
            code: `function hammingWeight(n) {
  let count = 0;
  while (n !== 0) {
    n &= n - 1;
    count++;
  }
  return count;
}

console.log(hammingWeight(11));          // 3
console.log(hammingWeight(128));         // 1
console.log(hammingWeight(4294967293));  // 31`,
            explain: <p>One loop for each set bit, so there are fewer loops for numbers with few 1s. It also works for values that look negative. The operators work on the 32-bit pattern, which is why 4294967293 still gives 31.</p>,
          },
          {
            name: "String conversion",
            idea: <p>Turn the number into binary text and count the <code>&quot;1&quot;</code> characters.</p>,
            code: `function hammingWeight(n) {
  return n.toString(2).split("").filter((ch) => ch === "1").length;
}

console.log(hammingWeight(11));          // 3
console.log(hammingWeight(128));         // 1
console.log(hammingWeight(4294967293));  // 31`,
            explain: <p>This is correct for inputs that are zero or more, and quick to write. But it makes a string and an array. It is not the answer an interviewer wants, though it is fine for checking your work.</p>,
          },
        ]}
        compare={<p>Use <code>n &amp;= n - 1</code> and explain why it clears one bit in each loop. That is the idea this question tests. Remember the shift version as the simple alternative. (LeetCode 191.)</p>}
      >
        <p>
          Given a whole number <code>n</code> that is zero or more (treat it as an unsigned 32-bit value, which means it cannot be negative), return the number of 1 bits in its
          binary form.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Counting bits"
        level="Easy"
        examples={[
          { input: "n = 2", output: "[0,1,1]", why: "0 is 0, 1 is 1, 2 is 10: zero, one and one set bits." },
          { input: "n = 5", output: "[0,1,1,2,1,2]", why: "0, 1, 10, 11, 100, 101 have 0, 1, 1, 2, 1, 2 set bits." },
        ]}
        hints={[
          <>You could count the bits of each number separately. But numbers next to each other are related.</>,
          <>Shifting a number right by one drops its last bit. Is <code>i &gt;&gt; 1</code> filled in before <code>i</code> in the answer array?</>,
          <>So <code>bits[i]</code> equals <code>bits[i &gt;&gt; 1]</code> plus the dropped bit, which is <code>i &amp; 1</code>.</>,
        ]}
        approaches={[
          {
            name: "Count each number separately",
            idea: <p>For each i from 0 to n, count its set bits with the <code>n &amp; (n - 1)</code> loop.</p>,
            code: `function countBits(n) {
  const result = [];
  for (let i = 0; i <= n; i++) {
    let x = i, count = 0;
    while (x !== 0) { x &= x - 1; count++; }
    result.push(count);
  }
  return result;
}

console.log(countBits(2)); // [ 0, 1, 1 ]
console.log(countBits(5)); // [ 0, 1, 1, 2, 1, 2 ]`,
            explain: <p>O(n × k), where k is the number of bits (at most about 17 for typical limits). That is about O(n log n). It is correct, but it wastes work that neighbouring numbers could share.</p>,
          },
          {
            name: "DP using the shifted number",
            idea: <p><code>i &gt;&gt; 1</code> is i without its last bit. It is smaller than i, so its count is already known. Add 1 if the last bit (<code>i &amp; 1</code>) was set.</p>,
            code: `function countBits(n) {
  const bits = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) bits[i] = bits[i >> 1] + (i & 1);
  return bits;
}

console.log(countBits(2)); // [ 0, 1, 1 ]
console.log(countBits(5)); // [ 0, 1, 1, 2, 1, 2 ]`,
            explain: <p>O(n) time, and the output array is the only memory used. Example: bits[5] = bits[2] + 1 = 1 + 1 = 2.</p>,
          },
          {
            name: "DP using the lowest-bit trick",
            idea: <p><code>i &amp; (i - 1)</code> is i with its lowest set bit removed, and it is smaller than i. So <code>bits[i] = bits[i &amp; (i - 1)] + 1</code>.</p>,
            code: `function countBits(n) {
  const bits = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) bits[i] = bits[i & (i - 1)] + 1;
  return bits;
}

console.log(countBits(2)); // [ 0, 1, 1 ]
console.log(countBits(5)); // [ 0, 1, 1, 2, 1, 2 ]`,
            explain: <p>This is also O(n). Example: bits[6] = bits[4] + 1 = 2, because 6 is 110 and clearing its lowest 1 gives 100.</p>,
          },
        ]}
        compare={<p>Either DP version is the expected answer (O(n), with no separate loop for each number). Pick the one you can explain more clearly. (LeetCode 338.)</p>}
      >
        <p>
          Given a whole number <code>n</code>, return an array <code>ans</code> of length <code>n + 1</code>, where <code>ans[i]</code> is
          the number of 1 bits in the binary form of <code>i</code>.
        </p>
      </Problem>

      <Problem
        n={6}
        title="Power of two"
        level="Easy"
        examples={[
          { input: "n = 1", output: "true", why: "2^0 = 1." },
          { input: "n = 16", output: "true", why: "2^4 = 16." },
          { input: "n = 3", output: "false", why: "3 is not a power of two." },
        ]}
        hints={[
          <>Keep halving while the number is even. What number do you end with?</>,
          <>Write the powers of two in binary: 1, 10, 100, 1000. What is the same in all of them?</>,
          <>They have exactly one set bit. Which expression removes it and leaves 0?</>,
        ]}
        approaches={[
          {
            name: "Keep dividing by two",
            idea: <p>A power of two becomes 1 if you halve it again and again. If a number becomes odd before it reaches 1, it is not a power of two.</p>,
            code: `function isPowerOfTwo(n) {
  if (n <= 0) return false;
  while (n % 2 === 0) n /= 2;
  return n === 1;
}

console.log(isPowerOfTwo(1));    // true
console.log(isPowerOfTwo(16));   // true
console.log(isPowerOfTwo(3));    // false
console.log(isPowerOfTwo(0));    // false
console.log(isPowerOfTwo(-8));   // false`,
            explain: <p>O(log n) time and O(1) memory. It uses no bit tricks, so the 32-bit cut-off of bitwise operators cannot hurt it.</p>,
          },
          {
            name: "n & (n - 1)",
            idea: <p>A positive power of two has a single set bit. <code>n &amp; (n - 1)</code> clears it and leaves 0. Any other positive number still has a bit left.</p>,
            code: `function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

console.log(isPowerOfTwo(1));    // true
console.log(isPowerOfTwo(16));   // true
console.log(isPowerOfTwo(3));    // false
console.log(isPowerOfTwo(0));    // false
console.log(isPowerOfTwo(-8));   // false`,
            explain: <p>O(1) time and memory. You need the <code>n &gt; 0</code> check. Without it, 0 would pass, because <code>0 &amp; -1</code> is 0. The trick is safe for inputs inside the 32-bit signed range, which the problem promises. Outside that range (for example 2^32 + 1), the numbers are cut to 32 bits and the answer can be wrong.</p>,
          },
          {
            name: "Count the set bits",
            idea: <p>Count the 1 bits with the clear-lowest-bit loop from question 4. A positive power of two has exactly one.</p>,
            code: `function isPowerOfTwo(n) {
  if (n <= 0) return false;
  let ones = 0;
  while (n !== 0) { n &= n - 1; ones++; }
  return ones === 1;
}

console.log(isPowerOfTwo(1));    // true
console.log(isPowerOfTwo(16));   // true
console.log(isPowerOfTwo(3));    // false
console.log(isPowerOfTwo(0));    // false
console.log(isPowerOfTwo(-8));   // false`,
            explain: <p>This is also correct and shows the idea. But it is just a longer way to do the same one test.</p>,
          },
        ]}
        compare={<p>Give the one-line bit trick and explain it. It is the expected answer. The dividing loop is the safe back-up. (LeetCode 231.)</p>}
      >
        <p>
          Given a whole number <code>n</code>, return <code>true</code> if it is a power of two (that is, <code>n = 2^k</code> for some
          whole number <code>k &gt;= 0</code>). Otherwise return <code>false</code>.
        </p>
      </Problem>

      <Problem
        n={7}
        title="Missing number"
        level="Easy"
        examples={[
          { input: "nums = [3,0,1]", output: "2", why: "n = 3, so the range is 0 to 3. Only 2 is missing." },
          { input: "nums = [0,1]", output: "2", why: "The range is 0 to 2 and 2 is missing." },
          { input: "nums = [9,6,4,2,3,5,7,0,1]", output: "8", why: "The range is 0 to 9. Only 8 is missing." },
        ]}
        hints={[
          <>The array has n different numbers taken from the n + 1 values 0 to n. Exactly one value is missing.</>,
          <>What do you get if you add up 0 to n and subtract the sum of the array?</>,
          <>Or XOR every index and every value together. What cancels out?</>,
        ]}
        approaches={[
          {
            name: "Set lookup",
            idea: <p>Put the numbers in a Set. Then check each value from 0 to n.</p>,
            code: `function missingNumber(nums) {
  const seen = new Set(nums);
  for (let v = 0; v <= nums.length; v++) if (!seen.has(v)) return v;
}

console.log(missingNumber([3, 0, 1]));                   // 2
console.log(missingNumber([0, 1]));                      // 2
console.log(missingNumber([9, 6, 4, 2, 3, 5, 7, 0, 1])); // 8`,
            explain: <p>O(n) time and O(n) memory.</p>,
          },
          {
            name: "Sum formula",
            idea: <p>0 + 1 + ... + n equals n(n + 1) / 2. Subtract the real sum of the array. What is left is the missing number.</p>,
            code: `function missingNumber(nums) {
  const n = nums.length;
  let sum = 0;
  for (const x of nums) sum += x;
  return (n * (n + 1)) / 2 - sum;
}

console.log(missingNumber([3, 0, 1]));                   // 2
console.log(missingNumber([0, 1]));                      // 2
console.log(missingNumber([9, 6, 4, 2, 3, 5, 7, 0, 1])); // 8`,
            explain: <p>O(n) time and O(1) memory. The totals stay far below 2^53, which is the limit for exact whole numbers in JavaScript, for any realistic n.</p>,
          },
          {
            name: "XOR indices and values",
            idea: <p>Start with n. XOR in every index i and every value nums[i]. Every number from 0 to n appears twice (once as an index or as the start value, and once as a value). The missing number appears only once, so it is what is left.</p>,
            code: `function missingNumber(nums) {
  let result = nums.length;
  for (let i = 0; i < nums.length; i++) result ^= i ^ nums[i];
  return result;
}

console.log(missingNumber([3, 0, 1]));                   // 2
console.log(missingNumber([0, 1]));                      // 2
console.log(missingNumber([9, 6, 4, 2, 3, 5, 7, 0, 1])); // 8`,
            explain: <p>O(n) time, O(1) memory, and there is no risk of a huge sum. For [3,0,1]: 3 ^ (0^3) ^ (1^0) ^ (2^1) = 2.</p>,
          },
        ]}
        compare={<p>The sum formula is the shortest. XOR uses the same idea as Single Number, where pairs cancel. Naming it shows that you see the link. (LeetCode 268.)</p>}
      >
        <p>
          Given an array <code>nums</code> with <code>n</code> different numbers from the range <code>[0, n]</code>, return the one
          number in the range that is missing from the array.
        </p>
      </Problem>
    </>
  );
}
