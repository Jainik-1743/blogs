import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 27 practice questions: keys, grouping, frequencies and voting. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Unique number of occurrences"
        level="Easy"
        examples={[
          { input: "[1, 2, 2, 1, 1, 3]", output: "true", why: "1 appears 3 times, 2 twice, 3 once — all counts differ." },
          { input: "[1, 2]", output: "false", why: "Both appear once." },
        ]}
        hints={[<>Count with a Map, then check whether the counts are all different with a Set.</>]}
        approaches={[
          {
            name: "Counts, then a Set of counts",
            idea: <p>A Set keeps only unique values. If no two counts are equal, the Set of counts has the same size as the Map.</p>,
            code: `function uniqueOccurrences(arr) {
  const freq = new Map();
  for (const x of arr) freq.set(x, (freq.get(x) ?? 0) + 1);
  return new Set(freq.values()).size === freq.size;
}

console.log(uniqueOccurrences([1, 2, 2, 1, 1, 3])); // true
console.log(uniqueOccurrences([1, 2]));             // false`,
            explain: <p>O(n) time. Comparing the two sizes is a common way to ask &ldquo;are they all different?&rdquo;.</p>,
          },
        ]}
        compare={<p>(LeetCode 1207.)</p>}
      >
        <p>Return <code>true</code> if every value in <code>arr</code> appears a different number of times.</p>
      </Problem>

      <Problem
        n={2}
        title="Group anagrams"
        level="Medium"
        examples={[
          { input: `["eat", "tea", "tan", "ate", "nat", "bat"]`, output: `[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]`, why: "Groups may be returned in any order." },
          { input: `[""]`, output: `[[""]]`, why: "Edge case: the empty string forms its own group." },
        ]}
        hints={[<>Give every word a key that is equal for anagrams.</>]}
        approaches={[
          {
            name: "Sorted-letters key",
            idea: <p>Group words by their sorted letters.</p>,
            code: `function groupAnagrams(strs) {
  const groups = new Map();
  for (const w of strs) {
    const key = [...w].sort().join("");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}

console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
// [ [ 'eat', 'tea', 'ate' ], [ 'tan', 'nat' ], [ 'bat' ] ]`,
            explain: <p>O(n · L log L) for n words of length L.</p>,
          },
          {
            name: "Letter-count key",
            idea: <p>Group by the 26 counts joined into a string.</p>,
            code: `function groupAnagrams(strs) {
  const groups = new Map();
  for (const w of strs) {
    const c = new Array(26).fill(0);
    for (const ch of w) c[ch.charCodeAt(0) - 97]++;
    const key = c.join(",");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}

console.log(groupAnagrams([""])); // [ [ '' ] ]`,
            explain: <p>O(n · L) time. This is slightly better for long words. Sorted keys are fine in most interviews.</p>,
          },
        ]}
        compare={<p>This is one of the most common interview questions. Explain your key choice and its cost. (LeetCode 49.)</p>}
      >
        <p>Group the words that are anagrams of each other.</p>
      </Problem>

      <Problem
        n={3}
        title="Top k frequent elements"
        level="Medium"
        examples={[
          { input: "nums = [1, 1, 1, 2, 2, 3], k = 2", output: "[1, 2]", why: "1 appears 3 times, 2 twice." },
          { input: "nums = [1], k = 1", output: "[1]", why: "One value." },
        ]}
        hints={[<>Count first, then order by count. Can you avoid an O(n log n) sort?</>, <>A count is between 1 and n. Use the counts as bucket indices.</>]}
        approaches={[
          {
            name: "Count, sort entries",
            idea: <p>Sort the Map entries by count, descending, and take the first k values.</p>,
            code: `function topKFrequent(nums, k) {
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);
  return [...freq].sort((a, b) => b[1] - a[1]).slice(0, k).map(([x]) => x);
}

console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [ 1, 2 ]`,
            explain: <p>O(n log n) time in the worst case (when all values are different).</p>,
          },
          {
            name: "Bucket by count",
            idea: <p>The method from the lesson.</p>,
            code: `function topKFrequent(nums, k) {
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);
  const bucket = Array.from({ length: nums.length + 1 }, () => []);
  for (const [x, c] of freq) bucket[c].push(x);
  const out = [];
  for (let c = nums.length; c > 0 && out.length < k; c--) out.push(...bucket[c]);
  return out.slice(0, k);
}

console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [ 1, 2 ]
console.log(topKFrequent([1], 1));                // [ 1 ]`,
            explain: <p>O(n) time and O(n) space.</p>,
          },
        ]}
        compare={<p>The problem asks for better than O(n log n). Use buckets (O(n)) or a heap (O(n log k), Lesson 46). (LeetCode 347.)</p>}
      >
        <p>Return the <code>k</code> most frequent values, in any order.</p>
      </Problem>

      <Problem
        n={4}
        title="Majority element"
        level="Easy"
        examples={[
          { input: "[3, 2, 3]", output: "3", why: "3 appears twice out of three." },
          { input: "[2, 2, 1, 1, 1, 2, 2]", output: "2", why: "Four out of seven." },
        ]}
        hints={[<>A Map works. For O(1) extra space, use voting.</>]}
        approaches={[
          {
            name: "Frequency map",
            idea: <p>Return the first value whose count passes n / 2.</p>,
            code: `function majorityElement(nums) {
  const freq = new Map();
  for (const x of nums) {
    freq.set(x, (freq.get(x) ?? 0) + 1);
    if (freq.get(x) > nums.length / 2) return x;
  }
}

console.log(majorityElement([3, 2, 3])); // 3`,
            explain: <p>O(n) time, O(n) space.</p>,
          },
          {
            name: "Sort, take the middle",
            idea: <p>A value that fills more than half of the sorted array must be at the middle index.</p>,
            code: `function majorityElement(nums) {
  const a = [...nums].sort((x, y) => x - y);
  return a[Math.floor(a.length / 2)];
}

console.log(majorityElement([2, 2, 1, 1, 1, 2, 2])); // 2`,
            explain: <p>O(n log n) time. The code is very short.</p>,
          },
          {
            name: "Boyer–Moore voting",
            idea: <p>The method from the lesson.</p>,
            code: `function majorityElement(nums) {
  let candidate = null, votes = 0;
  for (const x of nums) {
    if (votes === 0) candidate = x;
    votes += x === candidate ? 1 : -1;
  }
  return candidate;
}

console.log(majorityElement([3, 2, 3]));             // 3
console.log(majorityElement([2, 2, 1, 1, 1, 2, 2])); // 2`,
            explain: <p>O(n) time, O(1) space.</p>,
          },
        ]}
        compare={<p>Show all three, from simplest to best. A strong answer sounds like this. (LeetCode 169.)</p>}
      >
        <p>Return the value that appears more than n / 2 times. It always exists.</p>
      </Problem>

      <Problem
        n={5}
        title="Majority element II (more than n/3)"
        level="Medium"
        examples={[
          { input: "[3, 2, 3]", output: "[3]", why: "3 appears 2 times; 2 > 3/3 = 1." },
          { input: "[1, 2]", output: "[1, 2]", why: "Each appears once, and 1 > 2/3." },
          { input: "[1, 1, 1, 3, 3, 2, 2, 2]", output: "[1, 2]", why: "1 and 2 appear 3 times each; 3 > 8/3 ≈ 2.67." },
        ]}
        hints={[
          <>At most <em>two</em> values can appear more than n/3 times (three such values would need more than n items in total).</>,
          <>Run voting with two candidates. A value that matches neither candidate cancels one vote from each. Then check both candidates with a second pass.</>,
        ]}
        approaches={[
          {
            name: "Frequency map",
            idea: <p>Count the values, then keep those with a high count.</p>,
            code: `function majorityElement(nums) {
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);
  return [...freq].filter(([, c]) => c > nums.length / 3).map(([x]) => x);
}

console.log(majorityElement([1, 1, 1, 3, 3, 2, 2, 2])); // [ 1, 2 ]`,
            explain: <p>O(n) time, O(n) space.</p>,
          },
          {
            name: "Voting with two candidates",
            idea: <p>This is Boyer–Moore voting with two candidates. A check follows, because a candidate may not really appear more than n/3 times.</p>,
            code: `function majorityElement(nums) {
  let c1 = null, c2 = null, v1 = 0, v2 = 0;
  for (const x of nums) {
    if (x === c1) v1++;
    else if (x === c2) v2++;
    else if (v1 === 0) { c1 = x; v1 = 1; }
    else if (v2 === 0) { c2 = x; v2 = 1; }
    else { v1--; v2--; }
  }
  return [c1, c2].filter(
    (c, i, arr) => c !== null && arr.indexOf(c) === i && nums.filter((x) => x === c).length > nums.length / 3,
  );
}

console.log(majorityElement([3, 2, 3]));                // [ 3 ]
console.log(majorityElement([1, 2]));                   // [ 1, 2 ]
console.log(majorityElement([1, 1, 1, 3, 3, 2, 2, 2])); // [ 1, 2 ]`,
            explain: <p>O(n) time, O(1) extra space. The verification pass is required here, unlike Question 4.</p>,
          },
        ]}
        compare={<p>This is a good follow-up. It shows that you understand <em>why</em> voting works, not just the code. (LeetCode 229.)</p>}
      >
        <p>Return every value that appears more than ⌊n / 3⌋ times.</p>
      </Problem>

      <Problem
        n={6}
        title="Word pattern"
        level="Easy"
        examples={[
          { input: `pattern = "abba", s = "dog cat cat dog"`, output: "true", why: "a ↔ dog, b ↔ cat." },
          { input: `pattern = "abba", s = "dog dog dog dog"`, output: "false", why: "a and b would both map to dog." },
          { input: `pattern = "aaa", s = "dog dog"`, output: "false", why: "Edge case: different lengths." },
        ]}
        hints={[<>Split s into words. Then it is isomorphic strings with words instead of letters.</>]}
        approaches={[
          {
            name: "Two Maps",
            idea: <p>The map from letter to word and the map from word to letter must both stay consistent.</p>,
            code: `function wordPattern(pattern, s) {
  const words = s.split(" ");
  if (words.length !== pattern.length) return false;
  const pw = new Map(), wp = new Map();
  for (let i = 0; i < words.length; i++) {
    const p = pattern[i], w = words[i];
    if ((pw.has(p) && pw.get(p) !== w) || (wp.has(w) && wp.get(w) !== p)) return false;
    pw.set(p, w);
    wp.set(w, p);
  }
  return true;
}

console.log(wordPattern("abba", "dog cat cat dog")); // true
console.log(wordPattern("abba", "dog dog dog dog")); // false
console.log(wordPattern("aaa", "dog dog"));          // false`,
            explain: <p>O(n) time. The length check stops the loop from reading past the end of either list.</p>,
          },
        ]}
        compare={<p>(LeetCode 290.)</p>}
      >
        <p>Return whether the words of <code>s</code> follow <code>pattern</code>: each letter matches one word, and each word matches one letter.</p>
      </Problem>

      <Problem
        n={7}
        title="Isomorphic strings"
        level="Easy"
        examples={[
          { input: `s = "paper", t = "title"`, output: "true", why: "p→t, a→i, e→l, r→e." },
          { input: `s = "badc", t = "baba"`, output: "false", why: "b→b and d→b: two letters cannot map to the same one." },
        ]}
        hints={[<>Check the mapping in both directions (s to t, and t to s).</>, <>Another way: compare the position where each character first appeared.</>]}
        approaches={[
          {
            name: "Two Maps",
            idea: <p>The method from the lesson.</p>,
            code: `function isIsomorphic(s, t) {
  const st = new Map(), ts = new Map();
  for (let i = 0; i < s.length; i++) {
    if ((st.get(s[i]) ?? t[i]) !== t[i] || (ts.get(t[i]) ?? s[i]) !== s[i]) return false;
    st.set(s[i], t[i]);
    ts.set(t[i], s[i]);
  }
  return true;
}

console.log(isIsomorphic("paper", "title")); // true
console.log(isIsomorphic("badc", "baba"));   // false`,
            explain: <p>O(n) time. <code>?? t[i]</code> means &ldquo;if this letter has no mapping yet, any letter is fine&rdquo;.</p>,
          },
          {
            name: "First-occurrence pattern",
            idea: <p>Replace each character by the index where it first appears. Isomorphic strings give the same pattern.</p>,
            code: `function isIsomorphic(s, t) {
  const pattern = (str) => [...str].map((ch) => str.indexOf(ch)).join(",");
  return pattern(s) === pattern(t);
}

console.log(isIsomorphic("paper", "title")); // true
console.log(isIsomorphic("badc", "baba"));   // false`,
            explain: (
              <DryRun
                title="patterns"
                cols={["String", "First-occurrence pattern"]}
                rows={[["paper", "0,1,0,3,4"], ["title", "0,1,0,3,4"], ["badc", "0,1,2,3"], ["baba", "0,1,0,1"]]}
                note="indexOf is a hidden loop, so this is O(n²) for long strings. But it is a nice key idea: the pattern is a key that is equal exactly for isomorphic strings."
              />
            ),
          },
        ]}
        compare={<p>Use the two Maps in interviews. Remember the pattern idea for grouping questions such as &ldquo;group isomorphic words&rdquo;. (LeetCode 205.)</p>}
      >
        <p>Return whether <code>s</code> can be turned into <code>t</code> by always replacing a character with the same character. No two different characters may map to the same character.</p>
      </Problem>
    </>
  );
}
