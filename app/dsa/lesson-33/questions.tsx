import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 33 practice questions: subsets, permutations and combinations. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Subsets"
        level="Medium"
        examples={[
          { input: "nums = [1, 2, 3]", output: "[[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]] (any order)", why: "All 2³ = 8 subsets." },
          { input: "nums = [0]", output: "[[], [0]]", why: "The empty set and the single element." },
        ]}
        hints={[
          <>Each element is either in a subset or not: that is a binary decision per element.</>,
          <>Use a <code>path</code> array. Choose, recurse, then pop. Save a copy of the path.</>,
        ]}
        approaches={[
          {
            name: "Pick or skip",
            idea: <p>At index i, first recurse without nums[i], then with it. At i = n, save the path.</p>,
            code: `function subsets(nums) {
  const out = [], path = [];
  function go(i) {
    if (i === nums.length) { out.push([...path]); return; }
    go(i + 1);
    path.push(nums[i]);
    go(i + 1);
    path.pop();
  }
  go(0);
  return out;
}

console.log(JSON.stringify(subsets([1, 2, 3]))); // [[],[3],[2],[2,3],[1],[1,3],[1,2],[1,2,3]]
console.log(subsets([0]).length);                // 2`,
            explain: <p>2<sup>n</sup> leaves, each copied in O(n): O(n · 2<sup>n</sup>) time.</p>,
          },
          {
            name: "Loop form (every node is an answer)",
            idea: <p>Save the path at the start of every call, then loop over later elements.</p>,
            code: `function subsets(nums) {
  const out = [], path = [];
  function go(start) {
    out.push([...path]);
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      go(i + 1);
      path.pop();
    }
  }
  go(0);
  return out;
}

console.log(JSON.stringify(subsets([1, 2, 3]))); // [[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]`,
            explain: <p>Same cost, and the shape you will reuse for combinations and combination sum.</p>,
          },
          {
            name: "Iterative: double the list for each element",
            idea: <p>Start with <code>[[]]</code>. For each element, add a copy of every existing subset with that element appended.</p>,
            code: `function subsets(nums) {
  let out = [[]];
  for (const x of nums) {
    out = out.concat(out.map((s) => [...s, x]));
  }
  return out;
}

console.log(JSON.stringify(subsets([1, 2, 3]))); // [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]`,
            explain: <p>No recursion at all: the number of subsets doubles with each element. Elegant for small inputs.</p>,
          },
        ]}
        compare={<p>Know the first two (they extend to harder problems); the third is a nice follow-up. (LeetCode 78.)</p>}
      >
        <p>Return all possible subsets of an array of distinct integers. The result must not contain duplicate subsets.</p>
      </Problem>

      <Problem
        n={2}
        title="Subsets II (with duplicates)"
        level="Medium"
        examples={[
          { input: "nums = [1, 2, 2]", output: "[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]", why: "[1, 2] appears only once, even though there are two 2s." },
          { input: "nums = [0]", output: "[[], [0]]", why: "No duplicates." },
        ]}
        hints={[
          <>If you run the plain subsets code on [1, 2, 2], which subset appears twice?</>,
          <>Sort the array so equal values are next to each other.</>,
          <>At one level of the loop, do not choose a value equal to the previous one at that level.</>,
        ]}
        approaches={[
          {
            name: "Generate all, then remove duplicates",
            idea: <p>Sort, generate every subset, and store each as a string key in a Set.</p>,
            code: `function subsetsWithDup(nums) {
  nums = [...nums].sort((a, b) => a - b);
  const seen = new Set(), out = [], path = [];
  function go(start) {
    const key = path.join(",");
    if (!seen.has(key)) { seen.add(key); out.push([...path]); }
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      go(i + 1);
      path.pop();
    }
  }
  go(0);
  return out;
}

console.log(JSON.stringify(subsetsWithDup([1, 2, 2]))); // [[],[1],[1,2],[1,2,2],[2],[2,2]]`,
            explain: <p>Correct but does wasted work: the duplicate branches are still explored before being thrown away.</p>,
          },
          {
            name: "Skip duplicates at the same level",
            idea: <p>After sorting, inside the loop <code>continue</code> when <code>i &gt; start</code> and the value equals the previous one.</p>,
            code: `function subsetsWithDup(nums) {
  nums = [...nums].sort((a, b) => a - b);
  const out = [], path = [];
  function go(start) {
    out.push([...path]);
    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue;
      path.push(nums[i]);
      go(i + 1);
      path.pop();
    }
  }
  go(0);
  return out;
}

console.log(JSON.stringify(subsetsWithDup([1, 2, 2])));    // [[],[1],[1,2],[1,2,2],[2],[2,2]]
console.log(JSON.stringify(subsetsWithDup([4, 4, 4, 1, 4]))); // [[],[1],[1,4],[1,4,4],[1,4,4,4],[1,4,4,4,4],[4],[4,4],[4,4,4],[4,4,4,4]]`,
            explain: <p>The duplicate branches are never entered. Why <code>i &gt; start</code>? The first copy at a level is a genuinely new choice; only later copies repeat it.</p>,
          },
        ]}
        compare={<p>The second one — it is the pattern also needed for Combination Sum II in the next lesson. (LeetCode 90.)</p>}
      >
        <p>Return all possible subsets of an array that may contain duplicates, without duplicate subsets.</p>
      </Problem>

      <Problem
        n={3}
        title="Permutations"
        level="Medium"
        examples={[
          { input: "nums = [1, 2, 3]", output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]", why: "3! = 6 orders." },
          { input: "nums = [0, 1]", output: "[[0, 1], [1, 0]]", why: "2! = 2." },
        ]}
        hints={[
          <>At each position, any element not yet used may be placed.</>,
          <>Track used elements with a boolean array, or by swapping elements into place.</>,
        ]}
        approaches={[
          {
            name: "Used array",
            idea: <p>Loop over all indexes; skip used ones; choose, recurse, un-choose.</p>,
            code: `function permute(nums) {
  const out = [], path = [];
  const used = new Array(nums.length).fill(false);
  function go() {
    if (path.length === nums.length) { out.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; path.push(nums[i]);
      go();
      path.pop(); used[i] = false;
    }
  }
  go();
  return out;
}

console.log(JSON.stringify(permute([1, 2, 3]))); // [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
console.log(permute([0, 1, 2, 3]).length);       // 24`,
            explain: <p>n! leaves, each copied in O(n): O(n · n!) time, O(n) extra space.</p>,
          },
          {
            name: "Swap in place",
            idea: <p>Fix position i by swapping each later element into it, recurse on i + 1, and swap back. No <code>used</code> array is needed.</p>,
            code: `function permute(nums) {
  const out = [];
  const a = [...nums];
  function go(i) {
    if (i === a.length) { out.push([...a]); return; }
    for (let j = i; j < a.length; j++) {
      [a[i], a[j]] = [a[j], a[i]];     // choose a[j] for position i
      go(i + 1);
      [a[i], a[j]] = [a[j], a[i]];     // undo
    }
  }
  go(0);
  return out;
}

console.log(JSON.stringify(permute([1, 2, 3]))); // [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,2,1],[3,1,2]]`,
            explain: <p>The same count, with the answers appearing in a slightly different order. It uses the array itself as the path.</p>,
          },
        ]}
        compare={<p>The used-array version is easier to extend (see Permutations II). (LeetCode 46.)</p>}
      >
        <p>Return all permutations of an array of distinct integers.</p>
      </Problem>

      <Problem
        n={4}
        title="Combinations"
        level="Medium"
        examples={[
          { input: "n = 4, k = 2", output: "[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]", why: "C(4, 2) = 6." },
          { input: "n = 1, k = 1", output: "[[1]]", why: "One number, chosen." },
        ]}
        hints={[
          <>Loop form: choose a number, then only numbers larger than it.</>,
          <>Stop when the path has length k.</>,
          <>Prune: if the numbers left cannot fill the path up to k, do not continue.</>,
        ]}
        approaches={[
          {
            name: "Backtracking with pruning",
            idea: <p>Loop <code>i</code> from <code>start</code> up to <code>n − (k − path.length) + 1</code>, because later starts cannot fill k slots.</p>,
            code: `function combine(n, k) {
  const out = [], path = [];
  function go(start) {
    if (path.length === k) { out.push([...path]); return; }
    for (let i = start; i <= n - (k - path.length) + 1; i++) {
      path.push(i);
      go(i + 1);
      path.pop();
    }
  }
  go(1);
  return out;
}

console.log(JSON.stringify(combine(4, 2))); // [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
console.log(JSON.stringify(combine(1, 1))); // [[1]]
console.log(combine(5, 3).length);          // 10`,
            explain: <p>C(n, k) answers. Without the pruned loop bound the code is still correct but explores many dead ends.</p>,
          },
        ]}
        compare={<p>(LeetCode 77.)</p>}
      >
        <p>Return all combinations of k numbers chosen from 1 … n.</p>
      </Problem>

      <Problem
        n={5}
        title="Letter combinations of a phone number"
        level="Medium"
        examples={[
          { input: 'digits = "23"', output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]', why: "2 → abc and 3 → def: 3 × 3 = 9 pairs." },
          { input: 'digits = ""', output: "[]", why: "No digits, no combinations." },
        ]}
        hints={[
          <>One level of the tree per digit; one child per letter on that digit.</>,
          <>Handle the empty input before starting: the answer is an empty array, not <code>[&quot;&quot;]</code>.</>,
        ]}
        approaches={[
          {
            name: "Recursion building a string",
            idea: <p>At digit i, loop over its letters and recurse with the letter appended.</p>,
            code: `function letterCombinations(digits) {
  if (digits === "") return [];
  const map = { 2: "abc", 3: "def", 4: "ghi", 5: "jkl", 6: "mno", 7: "pqrs", 8: "tuv", 9: "wxyz" };
  const out = [];
  function go(i, path) {
    if (i === digits.length) { out.push(path); return; }
    for (const ch of map[digits[i]]) go(i + 1, path + ch);
  }
  go(0, "");
  return out;
}

console.log(JSON.stringify(letterCombinations("23"))); // ["ad","ae","af","bd","be","bf","cd","ce","cf"]
console.log(JSON.stringify(letterCombinations("")));   // []
console.log(letterCombinations("79").length);          // 16`,
            explain: <p>Strings are immutable, so <code>path + ch</code> already makes a new value for each child: no undo step is needed.</p>,
          },
          {
            name: "Iterative: grow the list digit by digit",
            idea: <p>Start with <code>[&quot;&quot;]</code>; for each digit, replace every string with all of its extensions.</p>,
            code: `function letterCombinations(digits) {
  if (digits === "") return [];
  const map = { 2: "abc", 3: "def", 4: "ghi", 5: "jkl", 6: "mno", 7: "pqrs", 8: "tuv", 9: "wxyz" };
  let out = [""];
  for (const d of digits) {
    const next = [];
    for (const prefix of out) for (const ch of map[d]) next.push(prefix + ch);
    out = next;
  }
  return out;
}

console.log(JSON.stringify(letterCombinations("23"))); // ["ad","ae","af","bd","be","bf","cd","ce","cf"]`,
            explain: <p>The same O(d · 4<sup>d</sup>) work with loops instead of recursion.</p>,
          },
        ]}
        compare={<p>(LeetCode 17.)</p>}
      >
        <p>Given a string of digits 2–9, return every letter combination it could represent on a phone keypad.</p>
      </Problem>

      <Problem
        n={6}
        title="Permutations II (with duplicates)"
        level="Medium"
        examples={[
          { input: "nums = [1, 1, 2]", output: "[[1,1,2],[1,2,1],[2,1,1]]", why: "3 distinct orders, not 6." },
          { input: "nums = [1, 2, 3]", output: "6 permutations", why: "No duplicates, so the same as before." },
        ]}
        hints={[
          <>Sort first so equal values are neighbours.</>,
          <>Skip a value if it equals the previous one <em>and the previous one is not currently used</em> (it was already tried at this position).</>,
        ]}
        approaches={[
          {
            name: "Sort and skip repeated values at the same position",
            idea: <p>Use the <code>used</code> array; when <code>nums[i] === nums[i − 1]</code> and <code>!used[i − 1]</code>, skip.</p>,
            code: `function permuteUnique(nums) {
  nums = [...nums].sort((a, b) => a - b);
  const out = [], path = [];
  const used = new Array(nums.length).fill(false);
  function go() {
    if (path.length === nums.length) { out.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;   // same value already tried here
      used[i] = true; path.push(nums[i]);
      go();
      path.pop(); used[i] = false;
    }
  }
  go();
  return out;
}

console.log(JSON.stringify(permuteUnique([1, 1, 2]))); // [[1,1,2],[1,2,1],[2,1,1]]
console.log(permuteUnique([2, 2, 1, 1]).length);        // 6`,
            explain: <p>The condition lets equal values appear only in their original left-to-right order, which removes the duplicate orderings.</p>,
          },
          {
            name: "Count the values instead",
            idea: <p>Keep a Map of value → remaining count and choose a <em>value</em> (not an index) at each step. Duplicates cannot occur by construction.</p>,
            code: `function permuteUnique(nums) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) || 0) + 1);
  const out = [], path = [];
  function go() {
    if (path.length === nums.length) { out.push([...path]); return; }
    for (const [value, left] of count) {
      if (left === 0) continue;
      count.set(value, left - 1); path.push(value);
      go();
      path.pop(); count.set(value, left);
    }
  }
  go();
  return out;
}

console.log(JSON.stringify(permuteUnique([1, 1, 2]))); // [[1,1,2],[1,2,1],[2,1,1]]`,
            explain: <p>Often easier to reason about than the sorted-skip condition.</p>,
          },
        ]}
        compare={<p>Either. (LeetCode 47.)</p>}
      >
        <p>Return all unique permutations of an array that may contain duplicates.</p>
      </Problem>

      <Problem
        n={7}
        title="Generate parentheses"
        level="Medium"
        examples={[
          { input: "n = 3", output: '["((()))","(()())","(())()","()(())","()()()"]', why: "All valid strings with 3 pairs." },
          { input: "n = 1", output: '["()"]', why: "One pair." },
        ]}
        hints={[
          <>At each position you may add &ldquo;(&rdquo; or &ldquo;)&rdquo;. A tree of two choices — but most branches are invalid.</>,
          <>You may add &ldquo;(&rdquo; while you have used fewer than n. You may add &ldquo;)&rdquo; only while it would not close more than were opened.</>,
        ]}
        approaches={[
          {
            name: "Generate all, filter the valid ones",
            idea: <p>Build every string of 2n characters, then keep the balanced ones.</p>,
            code: `function generateParenthesis(n) {
  const valid = (s) => {
    let open = 0;
    for (const c of s) {
      open += c === "(" ? 1 : -1;
      if (open < 0) return false;
    }
    return open === 0;
  };
  const out = [];
  (function go(s) {
    if (s.length === 2 * n) { if (valid(s)) out.push(s); return; }
    go(s + "(");
    go(s + ")");
  })("");
  return out;
}

console.log(JSON.stringify(generateParenthesis(2))); // ["(())","()()"]`,
            explain: <p>2<sup>2n</sup> strings are built and checked: far too many as n grows.</p>,
          },
          {
            name: "Only build valid prefixes",
            idea: <p>Track how many opens and closes are used. Add &ldquo;(&rdquo; if opens &lt; n; add &ldquo;)&rdquo; if closes &lt; opens.</p>,
            code: `function generateParenthesis(n) {
  const out = [];
  function go(s, open, close) {
    if (s.length === 2 * n) { out.push(s); return; }
    if (open < n) go(s + "(", open + 1, close);
    if (close < open) go(s + ")", open, close + 1);     // never close more than are open
  }
  go("", 0, 0);
  return out;
}

console.log(JSON.stringify(generateParenthesis(3))); // ["((()))","(()())","(())()","()(())","()()()"]
console.log(generateParenthesis(4).length);          // 14`,
            explain: <p>Every prefix built is already valid, so every leaf is an answer. The count is the Catalan number (5 for n = 3, 14 for n = 4). This &ldquo;only extend with valid choices&rdquo; idea is the centre of the next lesson.</p>,
          },
        ]}
        compare={<p>The second approach. (LeetCode 22.)</p>}
      >
        <p>Given n pairs of parentheses, return every well-formed combination.</p>
      </Problem>

      <DryRun
        title="Which template for which wording?"
        cols={["The question says…", "Loop", "Starts at", "Save when…"]}
        rows={[
          ["all subsets", "for i from start", "start", "every call"],
          ["combinations of size k", "for i from start", "start", "path.length === k"],
          ["all orderings (permutations)", "for every i, skip used", "0", "path.length === n"],
          ["one choice per level (phone letters)", "for each option of this level", "—", "level === last"],
          ["duplicates in the input", "sort + skip equal at the same level", "same as above", "same as above"],
        ]}
      />
    </>
  );
}
