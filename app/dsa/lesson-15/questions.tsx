import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 15 practice questions: counting with arrays and Maps. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Frequency queries"
        level="Easy"
        examples={[{ input: "nums = [2, 3, 2, 5, 3, 2], queries = [2, 4, 3]", output: "[3, 0, 2]", why: "2 appears 3 times, 4 never, 3 twice." }]}
        hints={[<>Do not scan <code>nums</code> again for every query. Count everything once first.</>]}
        approaches={[
          {
            name: "Scan for every query",
            idea: <p>For each query, count matches with a loop.</p>,
            code: `function answer(nums, queries) {
  return queries.map((q) => nums.filter((x) => x === q).length);
}

console.log(answer([2, 3, 2, 5, 3, 2], [2, 4, 3])); // [ 3, 0, 2 ]`,
            explain: <p>O(n × q) time. <code>filter</code> is a full pass over the array, and it runs inside <code>map</code> once for every query.</p>,
          },
          {
            name: "Count once with a Map",
            idea: <p>Build a frequency map, then answer each query with one lookup.</p>,
            code: `function answer(nums, queries) {
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);
  return queries.map((q) => freq.get(q) ?? 0);
}

console.log(answer([2, 3, 2, 5, 3, 2], [2, 4, 3])); // [ 3, 0, 2 ]`,
            explain: <p>O(n + q) time, and O(k) space for k distinct values (k different values). If the values were known to be small (say 0 to 1,000), a counting array would work the same way.</p>,
          },
        ]}
        compare={<p>This is the main idea of the lesson. Pay once to pre-compute (do the work in advance), and then every question is O(1).</p>}
      >
        <p>For each value in <code>queries</code>, return how many times it appears in <code>nums</code>.</p>
      </Problem>

      <Problem
        n={2}
        title="How many numbers are smaller than each one"
        level="Easy"
        examples={[
          { input: "[8, 1, 2, 2, 3]", output: "[4, 0, 1, 1, 3]", why: "For 8: four numbers (1, 2, 2, 3) are smaller. For 1: none. For each 2: only 1. For 3: 1, 2, 2." },
          { input: "[7, 7, 7]", output: "[0, 0, 0]", why: "Equal values are not smaller." },
        ]}
        hints={[
          <>Brute force means trying everything: for each number, count the others that are smaller. This is O(n²).</>,
          <>Values are between 0 and 100. Count each value. Then ask: how many numbers are smaller than v? The answer is the sum of the counts of 0 … v − 1.</>,
        ]}
        approaches={[
          {
            name: "Compare with every other number",
            idea: <p>Use two loops, one inside the other. (Here <code>map</code> and <code>filter</code> are the two loops.)</p>,
            code: `function smallerNumbersThanCurrent(nums) {
  return nums.map((x) => nums.filter((y) => y < x).length);
}

console.log(smallerNumbersThanCurrent([8, 1, 2, 2, 3])); // [ 4, 0, 1, 1, 3 ]`,
            explain: <p>O(n²) time. This is fine for the LeetCode limit of 500 values, but too slow for much more.</p>,
          },
          {
            name: "Counting array + running total",
            idea: (
              <ol>
                <li>Count each value in an array of size 101.</li>
                <li>Walk the counts from 0 upwards and keep a running total (a sum that grows as you go). Then <code>smaller[v]</code> is how many values are below v.</li>
                <li>Answer each number with <code>smaller[x]</code>.</li>
              </ol>
            ),
            code: `function smallerNumbersThanCurrent(nums) {
  const count = new Array(101).fill(0);
  for (const x of nums) count[x]++;

  const smaller = new Array(101).fill(0);
  let running = 0;
  for (let v = 0; v <= 100; v++) {
    smaller[v] = running;          // values strictly below v
    running += count[v];
  }
  return nums.map((x) => smaller[x]);
}

console.log(smallerNumbersThanCurrent([8, 1, 2, 2, 3])); // [ 4, 0, 1, 1, 3 ]
console.log(smallerNumbersThanCurrent([7, 7, 7]));       // [ 0, 0, 0 ]`,
            explain: (
              <DryRun
                title="nums = [8, 1, 2, 2, 3] (only the values that matter)"
                cols={["v", "count[v]", "smaller[v]"]}
                rows={[
                  ["1", "1", "0"],
                  ["2", "2", "1"],
                  ["3", "1", "3"],
                  ["8", "1", "4"],
                ]}
              />
            ),
          },
        ]}
        compare={<p>Approach 2 is O(n + 101) = O(n) time. The small, fixed range of values (0 to 100) is what makes a counting array possible. (LeetCode 1365.)</p>}
      >
        <p>
          For each <code>nums[i]</code>, count how many numbers in the array are strictly smaller than it.
          Values are between 0 and 100.
        </p>
      </Problem>

      <Problem
        n={3}
        title="First letter to appear twice"
        level="Easy"
        examples={[
          { input: `"abccbaacz"`, output: `"c"`, why: "c is the first letter whose second copy appears (index 3). a and b repeat later." },
          { input: `"abcdd"`, output: `"d"`, why: "Only d repeats." },
        ]}
        hints={[<>Walk along the string and remember what you have seen. The first character that you have already seen is the answer.</>]}
        approaches={[
          {
            name: "Set",
            idea: <p>A Set is a JavaScript collection that keeps each value only once. If the character is already in the Set, return it. Otherwise add it.</p>,
            code: `function repeatedCharacter(s) {
  const seen = new Set();
  for (const ch of s) {
    if (seen.has(ch)) return ch;
    seen.add(ch);
  }
}

console.log(repeatedCharacter("abccbaacz")); // c
console.log(repeatedCharacter("abcdd"));     // d`,
            explain: <p>O(n) time. The Set holds at most 26 letters, so the space is O(1).</p>,
          },
          {
            name: "26 booleans",
            idea: <p>Use the same idea with a fixed array of 26 flags (each one is <code>true</code> or <code>false</code>).</p>,
            code: `function repeatedCharacter(s) {
  const seen = new Array(26).fill(false);
  for (const ch of s) {
    const i = ch.charCodeAt(0) - 97;
    if (seen[i]) return ch;
    seen[i] = true;
  }
}

console.log(repeatedCharacter("abccbaacz")); // c`,
            explain: <p>It behaves the same way. The array version is what you would write in a language that has no built-in Set.</p>,
          },
        ]}
        compare={<p>Either is fine. The question asks for the letter whose <em>second</em> copy comes first. That is exactly the first time <code>seen.has</code> is true. (LeetCode 2351.)</p>}
      >
        <p>Return the first letter to appear twice in a string of lowercase letters (one always exists).</p>
      </Problem>

      <Problem
        n={4}
        title="All characters occur equally often"
        level="Easy"
        examples={[
          { input: `"abacbc"`, output: "true", why: "a, b and c each appear twice." },
          { input: `"aaabb"`, output: "false", why: "a appears 3 times, b only 2." },
        ]}
        hints={[<>Count every letter, then check that all the counts above zero are equal.</>, <>Put the counts into a Set. How big should the Set be if all counts are equal?</>]}
        approaches={[
          {
            name: "Count, then compare",
            idea: <p>Build the counts. Then check whether all the counts are the same number.</p>,
            code: `function areOccurrencesEqual(s) {
  const freq = new Map();
  for (const ch of s) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  return new Set(freq.values()).size === 1;
}

console.log(areOccurrencesEqual("abacbc")); // true
console.log(areOccurrencesEqual("aaabb"));  // false`,
            explain: <p>If all counts are the same, the Set of counts has exactly one item. O(n) time.</p>,
          },
        ]}
        compare={<p>Changing &ldquo;are they all equal?&rdquo; into &ldquo;does the Set of them have size 1?&rdquo; is a small trick that appears often. (LeetCode 1941.)</p>}
      >
        <p>Return <code>true</code> if every character that appears in <code>s</code> appears the same number of times.</p>
      </Problem>

      <Problem
        n={5}
        title="Most and least frequent"
        level="Easy"
        examples={[
          { input: "[10, 5, 10, 15, 10, 5]", output: "[10, 15]", why: "10 appears 3 times (most); 15 once (least)." },
          { input: "[2, 2, 1, 1]", output: "[1, 1]", why: "Tie: both values appear twice. The question says to choose the smaller value." },
        ]}
        hints={[<>Count first. Then scan the map and update the best values. Use a tie rule for equal counts.</>]}
        approaches={[
          {
            name: "Map, then one scan with a tie rule",
            idea: <p>Count first, then scan once. When two counts are equal, prefer the smaller value.</p>,
            code: `function mostAndLeast(nums) {
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);

  let most = null, least = null;
  for (const [v, c] of freq) {
    const cm = most === null ? -1 : freq.get(most);
    const cl = least === null ? Infinity : freq.get(least);
    if (c > cm || (c === cm && v < most)) most = v;
    if (c < cl || (c === cl && v < least)) least = v;
  }
  return [most, least];
}

console.log(mostAndLeast([10, 5, 10, 15, 10, 5])); // [ 10, 15 ]
console.log(mostAndLeast([2, 2, 1, 1]));           // [ 1, 1 ]`,
            explain: <p>O(n) time, O(k) space. Tie rules often cause wrong answers. Read the question for them and test them with an example like the second one.</p>,
          },
        ]}
        compare={<p>Whenever a problem says &ldquo;most frequent&rdquo;, ask the clarifying question from Lesson 11: what should happen on a tie?</p>}
      >
        <p>Return <code>[most frequent value, least frequent value]</code>. On a tie, choose the smaller value.</p>
      </Problem>

      <Problem
        n={6}
        title="Sort characters by frequency"
        level="Medium"
        examples={[
          { input: `"tree"`, output: `"eetr"`, why: "e appears twice, then t and r once each. \"eert\" is also accepted." },
          { input: `"Aabb"`, output: `"bbAa"`, why: "Upper and lower case are different characters." },
        ]}
        hints={[
          <>Count each character with a Map.</>,
          <>Sort the different characters by their count, largest first. Then write each character as many times as its count.</>,
          <>Faster idea: put the characters into buckets by count (a count is at most n).</>,
        ]}
        approaches={[
          {
            name: "Count, then sort the entries",
            idea: <p>Sort the <code>[char, count]</code> pairs by count, largest first (descending), and build the string.</p>,
            code: `function frequencySort(s) {
  const freq = new Map();
  for (const ch of s) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  return [...freq]
    .sort((a, b) => b[1] - a[1])
    .map(([ch, c]) => ch.repeat(c))
    .join("");
}

console.log(frequencySort("tree")); // eetr
console.log(frequencySort("Aabb")); // bbAa`,
            explain: <p>O(n + k log k) for k different characters. The value k is small (at most 62 letters and digits), so this is really O(n).</p>,
          },
          {
            name: "Buckets by count",
            idea: <p>Make an array where <code>buckets[c]</code> is the list of characters that appear c times. Read it from the highest count down to 1.</p>,
            code: `function frequencySort(s) {
  const freq = new Map();
  for (const ch of s) freq.set(ch, (freq.get(ch) ?? 0) + 1);

  const buckets = Array.from({ length: s.length + 1 }, () => []);
  for (const [ch, c] of freq) buckets[c].push(ch);

  let out = "";
  for (let c = s.length; c >= 1; c--) {
    for (const ch of buckets[c]) out += ch.repeat(c);
  }
  return out;
}

console.log(frequencySort("tree")); // eetr
console.log(frequencySort("Aabb")); // bbAa`,
            explain: <p>O(n) with no sorting at all. The count is used as an array index, like the counting array in this lesson. Lesson 27 uses the same bucket idea for &ldquo;top k frequent&rdquo;.</p>,
          },
        ]}
        compare={<p>Approach 1 is shorter and is the usual answer. Approach 2 is worth knowing, because the &ldquo;bucket by count&rdquo; idea comes back several times. (LeetCode 451.)</p>}
      >
        <p>Rearrange the characters of <code>s</code> so that characters that appear more often come first. Any order is accepted among characters with equal counts.</p>
      </Problem>

      <Problem
        n={7}
        title="Design a hash map"
        level="Easy"
        examples={[
          { input: "put(1, 1), put(2, 2), get(1), get(3), put(2, 1), get(2), remove(2), get(2)", output: "1, -1, 1, -1", why: "get returns the stored value or -1 when the key is missing. put on an existing key replaces its value." },
        ]}
        hints={[
          <>Use an array of buckets and a hash function such as <code>key % size</code> (the remainder of the key divided by the number of buckets).</>,
          <>Each bucket is a small array of <code>[key, value]</code> pairs. This is called chaining.</>,
        ]}
        approaches={[
          {
            name: "Buckets with chaining",
            idea: <p>Use the hash table from the lesson, for whole-number keys, and add <code>remove</code>.</p>,
            code: `class MyHashMap {
  constructor() {
    this.size = 1009;                     // a prime spreads keys more evenly
    this.buckets = Array.from({ length: this.size }, () => []);
  }
  bucket(key) {
    return this.buckets[key % this.size];
  }
  put(key, value) {
    const b = this.bucket(key);
    for (const pair of b) {
      if (pair[0] === key) { pair[1] = value; return; }
    }
    b.push([key, value]);
  }
  get(key) {
    for (const [k, v] of this.bucket(key)) if (k === key) return v;
    return -1;
  }
  remove(key) {
    const b = this.bucket(key);
    const i = b.findIndex((pair) => pair[0] === key);
    if (i !== -1) b.splice(i, 1);
  }
}

const m = new MyHashMap();
m.put(1, 1);
m.put(2, 2);
console.log(m.get(1)); // 1
console.log(m.get(3)); // -1
m.put(2, 1);
console.log(m.get(2)); // 1
m.remove(2);
console.log(m.get(2)); // -1`,
            explain: <p>With up to 10<sup>4</sup> operations spread over 1,009 buckets, each bucket stays short, so every operation is O(1) on average. A prime number of buckets causes fewer collisions when the keys follow a pattern (for example, all even, or all multiples of 10).</p>,
          },
        ]}
        compare={<p>In real code you would use <code>Map</code>. This question checks that you know how <code>Map</code> works inside: hash the key, go to its bucket, and compare keys in that bucket only. (LeetCode 706.)</p>}
      >
        <p>Build a hash map for whole-number keys without using <code>Map</code> or objects as dictionaries. Support <code>put</code>, <code>get</code> (−1 if missing) and <code>remove</code>.</p>
      </Problem>
    </>
  );
}
