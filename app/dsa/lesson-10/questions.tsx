import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 10 practice questions. Every question shows each way to solve it. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Character frequency"
        level="Easy"
        examples={[{ input: `"banana"`, output: "b: 1\na: 3\nn: 2", why: "b appears once, a three times and n twice. The characters are listed in the order they first appear." }]}
        hints={[<>Use a Map that stores each character and its count.</>, <>For each character, write: <code>freq.set(ch, (freq.get(ch) ?? 0) + 1)</code>.</>]}
        approaches={[
          {
            name: "Map",
            idea: <p>Go through the string once. Add 1 to the character&apos;s count. The first time, start from 0.</p>,
            code: `function charFrequency(s) {
  const freq = new Map();
  for (const ch of s) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  return freq;
}

for (const [ch, count] of charFrequency("banana")) {
  console.log(ch + ": " + count);
}

/* Output:
b: 1
a: 3
n: 2
*/`,
            explain: <p>This is the frequency-map pattern traced in this lesson. A Map remembers the order in which the keys were first added.</p>,
          },
          {
            name: "Plain object",
            idea: <p>This is the same idea with an object. Each character is a property name.</p>,
            code: `function charFrequency(s) {
  const freq = {};
  for (const ch of s) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  return freq;
}

console.log(charFrequency("banana")); // { b: 1, a: 3, n: 2 }`,
            explain: <p>This is very common in JavaScript code. <code>freq[ch] || 0</code> gives 0 when the property does not exist yet. (<code>||</code> uses the right side for any &ldquo;empty&rdquo; value such as 0 or <code>undefined</code>. That is fine here, because a count of 0 and &ldquo;no count&rdquo; both mean 0.)</p>,
          },
          {
            name: "Array of 26 counters",
            idea: <p>For lowercase letters only, use the character-code trick from Lesson 9. It turns each letter into a position from 0 to 25.</p>,
            code: `function charFrequency(s) {
  const counts = new Array(26).fill(0);
  for (const ch of s) {
    counts[ch.charCodeAt(0) - 97]++;          // 97 is the code of "a"
  }
  return counts;
}

const counts = charFrequency("banana");
console.log(counts[0], counts[1], counts[13]); // 3 1 2   (a, b, n)`,
            explain: <p>An array is slightly faster than a Map and uses a fixed amount of memory. It works only when you know in advance which characters are possible.</p>,
          },
        ]}
        compare={<p>Use a Map (Approach 1) by default. It works for any characters. Use the 26-counter array when the problem says &ldquo;lowercase English letters only&rdquo;.</p>}
      >
        <p>Count how many times each character appears.</p>
      </Problem>

      <Problem
        n={2}
        title="Contains duplicate"
        level="Easy"
        examples={[
          { input: "[1, 2, 3, 1]", output: "true", why: "1 appears twice." },
          { input: "[1, 2, 3, 4]", output: "false", why: "Every value is different." },
        ]}
        hints={[<>Brute force means trying every possibility. Here that means comparing every pair. Can you avoid that?</>, <>Walk through the array. Remember every value you have seen in a Set. If a value is already in the Set, you found a duplicate.</>]}
        approaches={[
          {
            name: "Compare every pair",
            idea: <p>Two nested loops (a loop inside a loop) check each pair (i, j) where i &lt; j.</p>,
            code: `function containsDuplicate(nums) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] === nums[j]) return true;
    }
  }
  return false;
}

console.log(containsDuplicate([1, 2, 3, 1])); // true
console.log(containsDuplicate([1, 2, 3, 4])); // false`,
            explain: <p>This is correct, but for n items it makes about n²/2 comparisons (Lesson 6). For 100,000 items that is about 5 billion, which is far too slow.</p>,
          },
          {
            name: "Sort, then check neighbours",
            idea: <p>After sorting, equal values sit next to each other. So compare each item with its neighbour.</p>,
            code: `function containsDuplicate(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1]) return true;
  }
  return false;
}

console.log(containsDuplicate([1, 2, 3, 1])); // true`,
            explain: <p>This is much faster than comparing every pair. Sorting still costs more than one pass (Lesson 12). We sort a copy because <code>sort</code> changes the original array. If you may change the input, you can sort it directly and save the memory for the copy.</p>,
          },
          {
            name: "Set of values seen so far",
            idea: <p>Check each value against a Set of the earlier values. Then add it to the Set.</p>,
            code: `function containsDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}

console.log(containsDuplicate([1, 2, 3, 1])); // true
console.log(containsDuplicate([1, 2, 3, 4])); // false

// Even shorter: if the Set is smaller than the array, something was repeated
console.log(new Set([1, 2, 3, 1]).size !== 4); // true`,
            explain: <p>Each value is checked once, and <code>has</code> is very fast. This is the &ldquo;have I seen it before?&rdquo; idea that Part 5 is built on.</p>,
          },
        ]}
        compare={<p>Approach 3 is the expected answer for LeetCode 217. It needs one pass. Mention Approach 1 as the brute force. Mention Approach 2 if memory is limited.</p>}
      >
        <p>Return <code>true</code> if any value appears at least twice. (LeetCode 217.)</p>
      </Problem>

      <Problem
        n={3}
        title="First non-repeating character"
        level="Medium"
        examples={[
          { input: `"leetcode"`, output: `"l"`, why: "l appears once and comes first. (e appears three times.)" },
          { input: `"loveleetcode"`, output: `"v"`, why: "l and o repeat. v is the first character that appears only once." },
          { input: `"aabb"`, output: "null", why: "Every character repeats." },
        ]}
        hints={[<>You cannot know whether a character repeats until you have seen the whole string.</>, <>Pass 1: count every character. Pass 2: walk the string again. Return the first character whose count is 1.</>]}
        approaches={[
          {
            name: "Count, then scan again",
            idea: <p>Use two passes. First build a frequency map. Then walk the string again and find the first character with count 1.</p>,
            code: `function firstUnique(s) {
  const freq = new Map();
  for (const ch of s) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  for (const ch of s) {
    if (freq.get(ch) === 1) return ch;
  }
  return null;
}

console.log(firstUnique("leetcode"));     // l
console.log(firstUnique("loveleetcode")); // v
console.log(firstUnique("aabb"));         // null`,
            explain: <p>The second pass walks the <em>string</em> and not the map. So &ldquo;first&rdquo; means first in the original order. LeetCode 387 asks for the index. For that, use an index loop and return <code>i</code> instead of the character.</p>,
          },
          {
            name: "indexOf equals lastIndexOf",
            idea: <p>A character is unique if its first position and its last position are the same.</p>,
            code: `function firstUnique(s) {
  for (const ch of s) {
    if (s.indexOf(ch) === s.lastIndexOf(ch)) return ch;
  }
  return null;
}

console.log(firstUnique("loveleetcode")); // v`,
            explain: <p>This is short. But <code>indexOf</code> and <code>lastIndexOf</code> each scan the string, so the total work grows like n². It is fine for short strings only.</p>,
          },
        ]}
        compare={<p>Use Approach 1. It makes two simple passes, and each pass checks every character once.</p>}
      >
        <p>Return the first character that appears exactly once, or <code>null</code>.</p>
      </Problem>

      <Problem
        n={4}
        title="Most frequent element"
        level="Easy"
        examples={[{ input: "[1, 3, 2, 3, 3, 2]", output: "3", why: "3 appears three times, 2 appears twice and 1 appears once." }]}
        hints={[<>Count first with a frequency map.</>, <>Then find the entry with the largest count. This is the &ldquo;best so far&rdquo; pattern.</>]}
        approaches={[
          {
            name: "Count, then pick the best",
            idea: <p>Build the frequency map. Then loop over it and keep the value with the highest count.</p>,
            code: `function mostFrequent(nums) {
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);

  let best = null, bestCount = 0;
  for (const [x, count] of freq) {
    if (count > bestCount) {
      best = x;
      bestCount = count;
    }
  }
  return best;
}

console.log(mostFrequent([1, 3, 2, 3, 3, 2])); // 3`,
            explain: <p>This joins two patterns you already know: a frequency map and best-so-far.</p>,
          },
          {
            name: "Track the best while counting",
            idea: <p>Update the best answer every time a count goes up. Then you need only one loop.</p>,
            code: `function mostFrequent(nums) {
  const freq = new Map();
  let best = null, bestCount = 0;
  for (const x of nums) {
    const c = (freq.get(x) ?? 0) + 1;
    freq.set(x, c);
    if (c > bestCount) {
      best = x;
      bestCount = c;
    }
  }
  return best;
}

console.log(mostFrequent([1, 3, 2, 3, 3, 2])); // 3`,
            explain: <p>The best answer can change only when a count goes up. So it is enough to check at that moment.</p>,
          },
        ]}
        compare={<p>Both are correct and do about the same work. Approach 1 is easier to read. Approach 2 saves the second loop.</p>}
      >
        <p>Return the value that appears most often.</p>
      </Problem>

      <Problem
        n={5}
        title="Valid anagram"
        level="Easy"
        examples={[
          { input: `"listen", "silent"`, output: "true", why: "Both words use the letters e, i, l, n, s, t once each." },
          { input: `"rat", "car"`, output: "false", why: "rat has a t, but car does not have a t." },
        ]}
        hints={[<>Two words are anagrams when they use the same letters the same number of times.</>, <>Count the letters of the first word up. Count the letters of the second word down. If a count would go below zero, it is not an anagram.</>]}
        approaches={[
          {
            name: "Sort both and compare",
            idea: <p>If you sort the letters of two anagrams, you get the same text.</p>,
            code: `function isAnagram(a, b) {
  const sortWord = (w) => w.split("").sort().join("");
  return sortWord(a) === sortWord(b);
}

console.log(isAnagram("listen", "silent")); // true
console.log(isAnagram("rat", "car"));       // false`,
            explain: <p>&ldquo;listen&rdquo; and &ldquo;silent&rdquo; both become &ldquo;eilnst&rdquo;. This is very easy to write. But sorting costs more than counting.</p>,
          },
          {
            name: "Count up and down with a Map",
            idea: <p>Add 1 for each letter of <code>a</code>. Subtract 1 for each letter of <code>b</code>.</p>,
            code: `function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const count = new Map();
  for (const ch of a) count.set(ch, (count.get(ch) ?? 0) + 1);
  for (const ch of b) {
    const c = count.get(ch) ?? 0;
    if (c === 0) return false;     // b has more of this letter than a
    count.set(ch, c - 1);
  }
  return true;
}

console.log(isAnagram("listen", "silent")); // true
console.log(isAnagram("rat", "car"));       // false`,
            explain: <p>The lengths are equal and no count ever goes below zero. So every count must end at exactly 0.</p>,
          },
          {
            name: "26 counters",
            idea: <p>For lowercase letters, use an array of 26 counters instead of a Map.</p>,
            code: `function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Array(26).fill(0);
  for (let i = 0; i < a.length; i++) {
    counts[a.charCodeAt(i) - 97]++;
    counts[b.charCodeAt(i) - 97]--;
  }
  return counts.every((c) => c === 0);
}

console.log(isAnagram("listen", "silent")); // true`,
            explain: <p>Both words are processed in the same loop. At the end, every counter must be 0.</p>,
          },
        ]}
        compare={<p>Approach 1 is a good first answer. Approach 2 or 3 is the efficient answer for LeetCode 242. Use Approach 3 when the input is lowercase letters only.</p>}
      >
        <p>Do the two strings contain exactly the same letters, the same number of times? (LeetCode 242.)</p>
      </Problem>

      <Problem
        n={6}
        title="Intersection of two arrays"
        level="Easy"
        examples={[
          { input: "[1, 2, 2, 1], [2, 2]", output: "[2]", why: "2 is the only value in both arrays. It is listed once." },
          { input: "[4, 9, 5], [9, 4, 9, 8, 4]", output: "[9, 4]", why: "4 and 9 are in both arrays. Any order is accepted." },
        ]}
        hints={[<>Put one array into a Set. Then you can check quickly whether a value is in it.</>, <>Walk the other array and collect the values that are in the Set. Use a second Set so that each answer appears only once.</>]}
        approaches={[
          {
            name: "Set lookup",
            idea: <p>Make a Set from the first array. Make a second Set for the answers. Then make one pass over the second array.</p>,
            code: `function intersection(a, b) {
  const inA = new Set(a);
  const result = new Set();
  for (const x of b) {
    if (inA.has(x)) result.add(x);
  }
  return [...result];
}

console.log(intersection([1, 2, 2, 1], [2, 2]));       // [ 2 ]
console.log(intersection([4, 9, 5], [9, 4, 9, 8, 4])); // [ 9, 4 ]`,
            explain: <p>Each value is checked once. The result Set removes repeated answers for you.</p>,
          },
          {
            name: "filter with includes",
            idea: <p>Keep the values of one array that the other array also has. Then remove duplicates.</p>,
            code: `const intersection = (a, b) => [...new Set(a.filter((x) => b.includes(x)))];

console.log(intersection([4, 9, 5], [9, 4, 9, 8, 4])); // [ 4, 9 ]`,
            explain: <p>This is one line. But <code>includes</code> scans <code>b</code> for every item of <code>a</code>, so the work grows like n × m (the two array sizes multiplied).</p>,
          },
          {
            name: "Sort both, then two pointers",
            idea: <p>Sort both arrays. Then use one pointer in each array. Compare the two values and move the pointer that points to the smaller value.</p>,
            code: `function intersection(a, b) {
  a = [...a].sort((x, y) => x - y);
  b = [...b].sort((x, y) => x - y);
  const result = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] < b[j]) i++;
    else if (a[i] > b[j]) j++;
    else {
      if (result[result.length - 1] !== a[i]) result.push(a[i]);
      i++;
      j++;
    }
  }
  return result;
}

console.log(intersection([4, 9, 5], [9, 4, 9, 8, 4])); // [ 4, 9 ]`,
            explain: <p>This helps when the arrays are already sorted or memory is limited. Lesson 21 covers two pointers in depth.</p>,
          },
        ]}
        compare={<p>Approach 1 is the standard answer for LeetCode 349. Approach 3 is the follow-up when the inputs are already sorted.</p>}
      >
        <p>Return the values that appear in both arrays, each only once, in any order. (LeetCode 349.)</p>
      </Problem>

      <Problem
        n={7}
        title="Count distinct values"
        level="Easy"
        examples={[{ input: "[1, 2, 2, 3, 3, 3]", output: "3", why: "The distinct (different) values are 1, 2 and 3." }]}
        hints={[<>Which data structure keeps each value only once?</>]}
        approaches={[
          {
            name: "Set size",
            idea: <p>Put everything into a Set. The size of the Set is the number of distinct values.</p>,
            code: `const countDistinct = (nums) => new Set(nums).size;

console.log(countDistinct([1, 2, 2, 3, 3, 3])); // 3`,
            explain: <p>The Set ignores values it already has.</p>,
          },
          {
            name: "Sort and count changes",
            idea: <p>After sorting, a new distinct value starts wherever an item is different from the one before it.</p>,
            code: `function countDistinct(nums) {
  const s = [...nums].sort((a, b) => a - b);
  let count = s.length > 0 ? 1 : 0;
  for (let i = 1; i < s.length; i++) {
    if (s[i] !== s[i - 1]) count++;
  }
  return count;
}

console.log(countDistinct([3, 1, 2, 3, 2, 3])); // 3`,
            explain: <p>No Set is needed. This is the &ldquo;remove duplicates from a sorted array&rdquo; idea from Lesson 8. Here we count instead of copy.</p>,
          },
        ]}
        compare={<p>Use the Set (Approach 1).</p>}
      >
        <p>How many different values does the array contain?</p>
      </Problem>

      <Problem
        n={8}
        title="Class report from records"
        level="Easy"
        examples={[{ input: "Asha 72, Ravi 91, Meera 71", output: "Average: 78\nTopper: Ravi", why: "(72 + 91 + 71) / 3 = 234 / 3 = 78. Ravi has the highest marks." }]}
        hints={[<>Each student is an object. Read the fields with <code>s.marks</code> and <code>s.name</code>.</>, <>Use an accumulator (a variable that collects a total) for the sum. Use best-so-far for the topper.</>]}
        approaches={[
          {
            name: "One loop",
            idea: <p>In one loop, add up the marks and keep the student with the highest marks.</p>,
            code: `const students = [
  { name: "Asha", marks: 72 },
  { name: "Ravi", marks: 91 },
  { name: "Meera", marks: 71 },
];

let total = 0;
let topper = students[0];
for (const s of students) {
  total += s.marks;
  if (s.marks > topper.marks) topper = s;
}

console.log("Average: " + total / students.length); // Average: 78
console.log("Topper: " + topper.name);              // Topper: Ravi`,
            explain: <p>Real data often arrives as an array of objects (from an API, a database or a test case). The patterns are exactly the same as for arrays of numbers.</p>,
          },
          {
            name: "reduce and sort",
            idea: <p>Use <code>reduce</code> to get the total. Sort a copy by marks to find the topper.</p>,
            code: `const students = [
  { name: "Asha", marks: 72 },
  { name: "Ravi", marks: 91 },
  { name: "Meera", marks: 71 },
];

const total = students.reduce((sum, s) => sum + s.marks, 0);
const ranked = [...students].sort((a, b) => b.marks - a.marks);

console.log("Average: " + total / students.length); // Average: 78
console.log("Topper: " + ranked[0].name);           // Topper: Ravi`,
            explain: <p><code>(a, b) =&gt; b.marks - a.marks</code> sorts by marks, largest first. Sorting gives the full ranking. This helps if you also need second and third place.</p>,
          },
        ]}
        compare={<p>Approach 1 does the least work. Approach 2 is useful when you need the whole ranking.</p>}
      >
        <p>Given an array of <code>{"{ name, marks }"}</code> objects, print the average marks and the name of the topper.</p>
      </Problem>

      <Problem
        n={9}
        title="Two Sum"
        level="Medium"
        examples={[
          { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", why: "nums[0] + nums[1] = 2 + 7 = 9." },
          { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]", why: "nums[1] + nums[2] = 2 + 4 = 6. (3 + 3 is not allowed, because you cannot use the same element twice.)" },
        ]}
        hints={[
          <>Brute force: try every pair (i, j). How many pairs is that?</>,
          <>For each number x, the partner you need is <code>target - x</code>. Have you already seen it?</>,
          <>Keep a Map that stores the value and the index of every number you have seen so far. Check for the partner before you add the current number.</>,
        ]}
        approaches={[
          {
            name: "Try every pair",
            idea: <p>Use two nested loops. Return the first pair that adds up to the target.</p>,
            code: `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // [ 0, 1 ]
console.log(twoSum([3, 2, 4], 6));      // [ 1, 2 ]`,
            explain: <p>This is always a good first answer to say out loud. It makes about n²/2 checks, so it is too slow for large inputs.</p>,
          },
          {
            name: "Map of values seen so far",
            idea: <p>For each number, look for its partner in a Map. If the partner is not there, store the number and its index.</p>,
            code: `function twoSum(nums, target) {
  const indexOf = new Map();             // stores: value, then its index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (indexOf.has(need)) return [indexOf.get(need), i];
    indexOf.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // [ 0, 1 ]
console.log(twoSum([3, 2, 4], 6));      // [ 1, 2 ]`,
            explain: <DryRun title="nums = [3, 2, 4], target = 6" cols={["i", "nums[i]", "need", "in map?", "map after"]} rows={[["0", "3", "3", "no", "{3 → 0}"], ["1", "2", "4", "no", "{3 → 0, 2 → 1}"], ["2", "4", "2", "yes, at 1", "return [1, 2]"]]} highlight={2} />,
          },
          {
            name: "Sort with indexes, then two pointers",
            idea: <p>Sort the values, but remember their original positions. Then start one pointer at each end and move them towards each other.</p>,
            code: `function twoSum(nums, target) {
  const items = nums.map((value, index) => ({ value, index }));
  items.sort((a, b) => a.value - b.value);
  let left = 0, right = items.length - 1;
  while (left < right) {
    const sum = items[left].value + items[right].value;
    if (sum === target) return [items[left].index, items[right].index].sort((a, b) => a - b);
    if (sum < target) left++;      // need a bigger sum
    else right--;                  // need a smaller sum
  }
  return [];
}

console.log(twoSum([3, 2, 4], 6)); // [ 1, 2 ]`,
            explain: <p>If the sum is too small, only moving the left pointer can make it bigger. If the sum is too big, only moving the right pointer can make it smaller. This is the main idea of LeetCode 167 (Lesson 21).</p>,
          },
        ]}
        compare={<p>LeetCode 1 is one of the best-known interview questions. First say Approach 1. Then give Approach 2, which makes one pass with a Map. Lesson 26 compares all three in detail.</p>}
      >
        <p>Return the indices of the two numbers that add up to <code>target</code>. Exactly one answer exists, and you may not use the same element twice. (LeetCode 1.)</p>
      </Problem>

      <Problem
        n={10}
        title="Group words by first letter"
        level="Medium"
        examples={[{ input: `["apple", "bat", "avocado", "ball", "cat"]`, output: "a: apple, avocado\nb: bat, ball\nc: cat", why: "Words that start with the same letter are put in the same group, in their original order." }]}
        hints={[<>Use a Map. The key is the letter and the value is a list of words.</>, <>The first time you see a letter, create an empty list for it. Then push the word into that list.</>]}
        approaches={[
          {
            name: "Map of arrays",
            idea: <p>The key is the first letter. The value is an array of the words that start with that letter.</p>,
            code: `function groupByFirstLetter(words) {
  const groups = new Map();
  for (const w of words) {
    const key = w[0];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return groups;
}

for (const [letter, list] of groupByFirstLetter(["apple", "bat", "avocado", "ball", "cat"])) {
  console.log(letter + ": " + list.join(", "));
}

/* Output:
a: apple, avocado
b: bat, ball
c: cat
*/`,
            explain: <p>&ldquo;Create the list the first time you see a key, then push into it&rdquo; is the grouping pattern. If you change the key to the word&apos;s sorted letters, this becomes Group Anagrams (LeetCode 49, Lesson 27).</p>,
          },
          {
            name: "Object with reduce",
            idea: <p>Build an object whose property names are the letters.</p>,
            code: `const groups = ["apple", "bat", "avocado", "ball", "cat"].reduce((acc, w) => {
  (acc[w[0]] ??= []).push(w);       // create the list if missing, then push
  return acc;
}, {});

console.log(groups); // { a: [ 'apple', 'avocado' ], b: [ 'bat', 'ball' ], c: [ 'cat' ] }`,
            explain: <p><code>x ??= []</code> sets <code>x</code> to an empty array only if <code>x</code> is <code>undefined</code> or <code>null</code>. This is short, but it is harder for beginners to read.</p>,
          },
        ]}
        compare={<p>Use Approach 1. It is clear and it works with keys of any type.</p>}
      >
        <p>Group the words by their first letter.</p>
      </Problem>

      <Problem
        n={11}
        title="Ransom note"
        level="Easy"
        examples={[
          { input: `ransomNote = "aa", magazine = "aab"`, output: "true", why: "The magazine has two a letters. That is enough for the note." },
          { input: `ransomNote = "aa", magazine = "ab"`, output: "false", why: "The note needs two a letters, but the magazine has only one." },
        ]}
        hints={[<>Each magazine letter can be used only once. Count the letters that the magazine has.</>, <>Then go through the note and use up one count for each letter. If a count is already 0, return false.</>]}
        approaches={[
          {
            name: "Count the magazine, use it up",
            idea: <p>Make a frequency map of the magazine. Then subtract 1 for each letter of the note.</p>,
            code: `function canConstruct(ransomNote, magazine) {
  const available = new Map();
  for (const ch of magazine) available.set(ch, (available.get(ch) ?? 0) + 1);
  for (const ch of ransomNote) {
    const c = available.get(ch) ?? 0;
    if (c === 0) return false;
    available.set(ch, c - 1);
  }
  return true;
}

console.log(canConstruct("aa", "aab")); // true
console.log(canConstruct("aa", "ab"));  // false`,
            explain: <p>This is the same count-up and count-down idea as the anagram question. The difference is that the magazine may have letters left over.</p>,
          },
          {
            name: "26 counters",
            idea: <p>The input has only lowercase letters, so an array of 26 counters works.</p>,
            code: `function canConstruct(ransomNote, magazine) {
  const counts = new Array(26).fill(0);
  for (const ch of magazine) counts[ch.charCodeAt(0) - 97]++;
  for (const ch of ransomNote) {
    const i = ch.charCodeAt(0) - 97;
    if (counts[i] === 0) return false;
    counts[i]--;
  }
  return true;
}

console.log(canConstruct("aa", "aab")); // true`,
            explain: <p>This is the same logic, with a fixed amount of memory.</p>,
          },
        ]}
        compare={<p>Both are accepted for LeetCode 383. Use the array when the problem says the input is lowercase letters.</p>}
      >
        <p>Can the ransom note be built from the letters of the magazine, using each letter at most once? (LeetCode 383.)</p>
      </Problem>
    </>
  );
}
