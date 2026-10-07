import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 31 practice questions: windows on strings. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Longest substring without repeating characters"
        level="Medium"
        examples={[
          { input: '"abcabcbb"', output: "3", why: 'The longest substring with all different letters is "abc".' },
          { input: '"bbbbb"', output: "1", why: 'Only "b".' },
          { input: '"pwwkew"', output: "3", why: 'Either "wke" or "kew". "pwke" is not contiguous.' },
        ]}
        hints={[
          <>Brute force: try every start position and keep going until a letter repeats. That takes O(n²) time or more.</>,
          <>Keep a window with no repeats. When the new letter is already inside, what must change?</>,
          <>Instead of shrinking one step at a time, could you move <code>left</code> straight past the earlier copy?</>,
        ]}
        approaches={[
          {
            name: "Window with a Set",
            idea: (
              <ol>
                <li>Move <code>right</code> forward one letter at a time.</li>
                <li>While <code>s[right]</code> is already in the Set, remove <code>s[left]</code> and move <code>left</code> forward.</li>
                <li>Add <code>s[right]</code> and save the window length.</li>
              </ol>
            ),
            code: `function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) { seen.delete(s[left]); left++; }
    seen.add(s[right]);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(lengthOfLongestSubstring("abcabcbb")); // 3
console.log(lengthOfLongestSubstring("bbbbb"));    // 1
console.log(lengthOfLongestSubstring("pwwkew"));   // 3
console.log(lengthOfLongestSubstring(""));         // 0`,
            explain: <p>O(n) time, because each index enters the window once and leaves once. O(alphabet) space, which means the Set never holds more than the number of different letters.</p>,
          },
          {
            name: "Jump with a Map of last positions",
            idea: <p>Store the last index (position) of each letter. When a repeat appears inside the window, move <code>left</code> to the spot just after that old copy in one step.</p>,
            code: `function lengthOfLongestSubstring(s) {
  const last = new Map();                    // letter -> last index where we saw it
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (last.has(c) && last.get(c) >= left) left = last.get(c) + 1;   // jump past the earlier copy
    last.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(lengthOfLongestSubstring("abba"));     // 2
console.log(lengthOfLongestSubstring("tmmzuxt"));  // 5`,
            explain: <p>The check <code>last.get(c) &gt;= left</code> is important. An old copy that is already outside the window must be ignored (try &ldquo;abba&rdquo;). It is still O(n), with fewer steps.</p>,
          },
        ]}
        compare={<p>Both are fine. The Set version is easier to get right when you are nervous in an interview. (LeetCode 3.)</p>}
      >
        <p>Return the length of the longest substring of <code>s</code> that has no repeated letter.</p>
      </Problem>

      <Problem
        n={2}
        title="Longest repeating character replacement"
        level="Medium"
        examples={[
          { input: 's = "ABAB", k = 2', output: "4", why: 'Change both "A"s to "B" (or the reverse): "BBBB".' },
          { input: 's = "AABABBA", k = 1', output: "4", why: 'Change one "B": "AABA" → "AAAA".' },
        ]}
        hints={[
          <>For one window, how many letters must you change to make all the letters the same?</>,
          <>Answer: the window size minus the count of its most common letter. This number must be at most <code>k</code>.</>,
        ]}
        approaches={[
          {
            name: "Window with letter counts",
            idea: (
              <ol>
                <li>Keep the count of each letter in the window, and the highest count you have seen (<code>maxFreq</code>).</li>
                <li>If <code>size − maxFreq &gt; k</code>, the window needs too many changes, so shrink it from the left.</li>
                <li>Save the window size.</li>
              </ol>
            ),
            code: `function characterReplacement(s, k) {
  const count = {};
  let left = 0, maxFreq = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    count[s[right]] = (count[s[right]] || 0) + 1;
    maxFreq = Math.max(maxFreq, count[s[right]]);
    while (right - left + 1 - maxFreq > k) {
      count[s[left]]--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(characterReplacement("ABAB", 2));    // 4
console.log(characterReplacement("AABABBA", 1)); // 4
console.log(characterReplacement("AAAA", 0));    // 4`,
            explain: <p>O(n) time, O(26) space. <code>maxFreq</code> is allowed to be out of date after shrinking, as the lesson explained.</p>,
          },
        ]}
        compare={<p>(LeetCode 424.)</p>}
      >
        <p>You get an uppercase string and a number <code>k</code>. You may replace at most <code>k</code> letters. Return the length of the longest substring made of one repeated letter that you can get.</p>
      </Problem>

      <Problem
        n={3}
        title="Permutation in string"
        level="Medium"
        examples={[
          { input: 's1 = "ab", s2 = "eidbaooo"', output: "true", why: '"ba" is a permutation of "ab".' },
          { input: 's1 = "ab", s2 = "eidboaoo"', output: "false", why: "No window of length 2 has the letters a and b." },
        ]}
        hints={[
          <>A permutation of <code>s1</code> (the same letters in any order) has the same letter counts and the same length.</>,
          <>Slide a window of length <code>s1.length</code> over <code>s2</code>. Update the counts as letters enter and leave.</>,
        ]}
        approaches={[
          {
            name: "Sort each window",
            idea: <p>Sort <code>s1</code>. Then for each window of <code>s2</code>, sort the window and compare.</p>,
            code: `function checkInclusion(s1, s2) {
  const target = [...s1].sort().join("");
  for (let i = 0; i + s1.length <= s2.length; i++) {
    if ([...s2.slice(i, i + s1.length)].sort().join("") === target) return true;
  }
  return false;
}

console.log(checkInclusion("ab", "eidbaooo")); // true
console.log(checkInclusion("ab", "eidboaoo")); // false`,
            explain: <p>O(n · m log m) time. This is too slow when both strings are long.</p>,
          },
          {
            name: "Fixed-size window with counts",
            idea: <p>Keep two arrays of 26 counts. Add the letter that enters, remove the letter that leaves, and compare the arrays.</p>,
            code: `function checkInclusion(s1, s2) {
  if (s1.length > s2.length) return false;
  const idx = (c) => c.charCodeAt(0) - 97;
  const need = new Array(26).fill(0), win = new Array(26).fill(0);
  for (const c of s1) need[idx(c)]++;
  for (let i = 0; i < s2.length; i++) {
    win[idx(s2[i])]++;
    if (i >= s1.length) win[idx(s2[i - s1.length])]--;
    if (i >= s1.length - 1 && need.every((n, j) => n === win[j])) return true;
  }
  return false;
}

console.log(checkInclusion("ab", "eidbaooo")); // true
console.log(checkInclusion("ab", "eidboaoo")); // false
console.log(checkInclusion("abc", "ab"));      // false`,
            explain: <p>O(26 · n) = O(n) time, O(26) space.</p>,
          },
        ]}
        compare={<p>Use the fixed-size window version. (LeetCode 567.)</p>}
      >
        <p>Return <code>true</code> if <code>s2</code> contains a permutation of <code>s1</code> as a substring. Both strings use only lowercase letters.</p>
      </Problem>

      <Problem
        n={4}
        title="Find all anagrams in a string"
        level="Medium"
        examples={[
          { input: 's = "cbaebabacd", p = "abc"', output: "[0, 6]", why: '"cba" starts at 0 and "bac" at 6.' },
          { input: 's = "abab", p = "ab"', output: "[0, 1, 2]", why: '"ab", "ba", "ab".' },
        ]}
        hints={[
          <>This is question 3. The only change is that you collect every start index instead of stopping at the first one.</>,
        ]}
        approaches={[
          {
            name: "Fixed-size window with counts",
            idea: <p>Slide a window of length <code>p.length</code> and compare its counts with the counts of <code>p</code>. Every time they match, add the start index to the result.</p>,
            code: `function findAnagrams(s, p) {
  const idx = (c) => c.charCodeAt(0) - 97;
  const need = new Array(26).fill(0), win = new Array(26).fill(0);
  for (const c of p) need[idx(c)]++;
  const out = [];
  for (let i = 0; i < s.length; i++) {
    win[idx(s[i])]++;
    if (i >= p.length) win[idx(s[i - p.length])]--;
    if (i >= p.length - 1 && need.every((n, j) => n === win[j])) out.push(i - p.length + 1);
  }
  return out;
}

console.log(findAnagrams("cbaebabacd", "abc")); // [0, 6]
console.log(findAnagrams("abab", "ab"));        // [0, 1, 2]
console.log(findAnagrams("a", "ab"));           // []`,
            explain: <p>O(n) time, O(1) space.</p>,
          },
          {
            name: "Window with a single mismatch counter",
            idea: <p>Do not compare 26 counts at every step. Just track how many letters are still missing, like in minimum window.</p>,
            code: `function findAnagrams(s, p) {
  const need = new Map();
  for (const c of p) need.set(c, (need.get(c) || 0) + 1);
  let missing = p.length;
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const add = s[i];
    if (need.has(add)) { if (need.get(add) > 0) missing--; need.set(add, need.get(add) - 1); }
    if (i >= p.length) {
      const drop = s[i - p.length];
      if (need.has(drop)) { need.set(drop, need.get(drop) + 1); if (need.get(drop) > 0) missing++; }
    }
    if (missing === 0) out.push(i - p.length + 1);
  }
  return out;
}

console.log(findAnagrams("cbaebabacd", "abc")); // [0, 6]
console.log(findAnagrams("abab", "ab"));        // [0, 1, 2]`,
            explain: <p>It is still O(n), but each step costs O(1) because there is no 26-number comparison. It also works for any characters, not only lowercase letters.</p>,
          },
        ]}
        compare={<p>Use the first for clarity. The second is the more general technique. (LeetCode 438.)</p>}
      >
        <p>Return the start index of every substring of <code>s</code> that is an anagram of <code>p</code>.</p>
      </Problem>

      <Problem
        n={5}
        title="Minimum window substring"
        level="Hard"
        examples={[
          { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', why: "The shortest substring that has A, B and C." },
          { input: 's = "a", t = "a"', output: '"a"', why: "The whole string." },
          { input: 's = "a", t = "aa"', output: '""', why: "There are not enough a's." },
        ]}
        hints={[
          <>Move the right edge forward until the window has every letter of <code>t</code> (with the right counts).</>,
          <>Then shrink from the left for as long as the window stays valid. Save the smallest window you see.</>,
          <>Keep a <code>missing</code> number, so that the question &ldquo;is the window valid?&rdquo; takes O(1).</>,
        ]}
        approaches={[
          {
            name: "Check every substring",
            idea: <p>For every start and end, count the letters in that piece and test it.</p>,
            code: `function minWindow(s, t) {
  const covers = (sub) => {
    const c = {};
    for (const ch of sub) c[ch] = (c[ch] || 0) + 1;
    for (const ch of t) { if (!c[ch]) return false; c[ch]--; }
    return true;
  };
  let best = "";
  for (let i = 0; i < s.length; i++) {
    for (let j = i + t.length; j <= s.length; j++) {
      const sub = s.slice(i, j);
      if ((best === "" || sub.length < best.length) && covers(sub)) best = sub;
    }
  }
  return best;
}

console.log(minWindow("ADOBECODEBANC", "ABC")); // BANC`,
            explain: <p>O(n³) time or worse. Use it only as a starting point.</p>,
          },
          {
            name: "Grow, then shrink (the template)",
            idea: (
              <ol>
                <li>Count the letters you need from <code>t</code>. Set <code>missing = t.length</code>.</li>
                <li>Move <code>right</code> forward. Each needed letter lowers <code>missing</code>.</li>
                <li>While <code>missing === 0</code>, save the window and move <code>left</code> forward, which gives letters back.</li>
              </ol>
            ),
            code: `function minWindow(s, t) {
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);
  let missing = t.length, left = 0, bestStart = 0, bestLen = Infinity;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (need.has(c)) { if (need.get(c) > 0) missing--; need.set(c, need.get(c) - 1); }
    while (missing === 0) {
      if (right - left + 1 < bestLen) { bestLen = right - left + 1; bestStart = left; }
      const l = s[left];
      if (need.has(l)) { need.set(l, need.get(l) + 1); if (need.get(l) > 0) missing++; }
      left++;
    }
  }
  return bestLen === Infinity ? "" : s.slice(bestStart, bestStart + bestLen);
}

console.log(minWindow("ADOBECODEBANC", "ABC")); // BANC
console.log(minWindow("a", "a"));               // a
console.log(minWindow("a", "aa") === "");       // true
console.log(minWindow("aa", "aa"));             // aa`,
            explain: <p>O(n + m) time, because each pointer moves forward at most n times. O(m) space for the needed letters.</p>,
          },
        ]}
        compare={<p>Use the template. This question is marked &ldquo;Hard&rdquo;, but it is just the window template done carefully. (LeetCode 76.)</p>}
      >
        <p>Return the smallest substring of <code>s</code> that contains every letter of <code>t</code> (as many times as it appears in <code>t</code>). If there is none, return <code>&quot;&quot;</code>.</p>
      </Problem>

      <Problem
        n={6}
        title="Longest substring with at most K distinct characters"
        level="Medium"
        examples={[
          { input: 's = "eceba", k = 2', output: "3", why: '"ece" has two distinct letters.' },
          { input: 's = "aa", k = 1', output: "2", why: "The whole string." },
        ]}
        hints={[
          <>What does the window remember? How many times each letter appears, and so how many different letters there are.</>,
          <>The window is not valid when the Map has more than <code>k</code> keys.</>,
        ]}
        approaches={[
          {
            name: "Window with a count Map",
            idea: <p>Add the letter that enters. While the Map has more than <code>k</code> letters, remove letters from the left. Delete a key when its count reaches 0.</p>,
            code: `function lengthOfLongestSubstringKDistinct(s, k) {
  const count = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    count.set(s[right], (count.get(s[right]) || 0) + 1);
    while (count.size > k) {
      const l = s[left];
      count.set(l, count.get(l) - 1);
      if (count.get(l) === 0) count.delete(l);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(lengthOfLongestSubstringKDistinct("eceba", 2)); // 3
console.log(lengthOfLongestSubstringKDistinct("aa", 1));    // 2
console.log(lengthOfLongestSubstringKDistinct("abc", 0));   // 0`,
            explain: <p>O(n) time, O(k) space. Deleting a key when its count is 0 is what makes <code>count.size</code> equal the number of different letters.</p>,
          },
        ]}
        compare={<p>(LeetCode 340, a paid-only problem. This pattern is the one you will reuse most often.)</p>}
      >
        <p>Return the length of the longest substring that has at most <code>k</code> different letters.</p>
      </Problem>

      <Problem
        n={7}
        title="Fruit into baskets"
        level="Medium"
        examples={[
          { input: "fruits = [1, 2, 1]", output: "3", why: "Two types, three trees." },
          { input: "fruits = [0, 1, 2, 2]", output: "3", why: "Pick [1, 2, 2]." },
          { input: "fruits = [1, 2, 3, 2, 2]", output: "4", why: "Pick [2, 3, 2, 2]." },
        ]}
        hints={[
          <>Two baskets, and each basket holds one type. So you want the longest subarray with at most 2 different values.</>,
          <>This is the previous question with <code>k = 2</code>, but on an array.</>,
        ]}
        approaches={[
          {
            name: "At most two distinct values",
            idea: <p>It is the same window, but on an array instead of a string.</p>,
            code: `function totalFruit(fruits) {
  const count = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < fruits.length; right++) {
    count.set(fruits[right], (count.get(fruits[right]) || 0) + 1);
    while (count.size > 2) {
      const l = fruits[left];
      count.set(l, count.get(l) - 1);
      if (count.get(l) === 0) count.delete(l);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(totalFruit([1, 2, 1]));       // 3
console.log(totalFruit([0, 1, 2, 2]));    // 3
console.log(totalFruit([1, 2, 3, 2, 2])); // 4`,
            explain: <p>O(n) time, O(1) space, because the Map has at most 3 keys. The hard part is to see that this is the same problem in a different story.</p>,
          },
        ]}
        compare={<p>(LeetCode 904.)</p>}
      >
        <p>Each tree gives one type of fruit. You have two baskets, and each basket holds only one type. You must pick from trees that are next to each other. Return the most fruit you can collect.</p>
      </Problem>

      <DryRun
        title="Which window type for which wording?"
        cols={["The question says…", "Window", "Memory", "Not valid when…"]}
        rows={[
          ["longest substring with no repeats", "variable", "Set of letters", "new letter already inside"],
          ["longest … with at most k changes", "variable", "letter counts + maxFreq", "size − maxFreq > k"],
          ["longest … with at most k distinct", "variable", "Map of counts", "map.size > k"],
          ["is there an anagram / permutation", "fixed (length p)", "26 counts", "never; compare at each step"],
          ["shortest substring containing t", "variable", "need counts + missing", "valid when missing = 0, so shrink"],
        ]}
      />
    </>
  );
}
