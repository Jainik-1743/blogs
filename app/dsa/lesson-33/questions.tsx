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
          <>Each element is either in the subset or not. That is a yes-or-no decision for each element.</>,
          <>Use a <code>path</code> array. Choose, make the recursive call, then pop (undo). Save a copy of the path.</>,
        ]}
        approaches={[
          {
            name: "Pick or skip",
            idea: <p>At index i, first make the recursive call without nums[i], then make it again with nums[i]. When i = n, save the path.</p>,
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
            explain: <p>There are 2<sup>n</sup> leaves, and each one is copied in O(n). So the time is O(n · 2<sup>n</sup>).</p>,
          },
          {
            name: "Loop form (every node is an answer)",
            idea: <p>Save the path at the start of every call. Then loop over the later elements.</p>,
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
            explain: <p>The cost is the same. You will use this shape again for combinations and combination sum.</p>,
          },
          {
            name: "Loops only: double the list for each element",
            idea: <p>Start with <code>[[]]</code>. For each element, make a copy of every subset you already have and add the element to each copy.</p>,
            code: `function subsets(nums) {
  let out = [[]];
  for (const x of nums) {
    out = out.concat(out.map((s) => [...s, x]));
  }
  return out;
}

console.log(JSON.stringify(subsets([1, 2, 3]))); // [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]`,
            explain: <p>There is no recursion at all. The number of subsets doubles with each element. It is neat for small inputs.</p>,
          },
        ]}
        compare={<p>Learn the first two well, because they work for harder problems too. The third is a nice extra. (LeetCode 78.)</p>}
      >
        <p>Return all possible subsets of an array of different integers. (A subset is any group of the items, including the empty group and the whole array.) The result must not contain the same subset twice.</p>
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
          <>Sort the array, so equal values are next to each other.</>,
          <>At one level of the loop, do not choose a value that is equal to the one before it at that level.</>,
        ]}
        approaches={[
          {
            name: "Make all, then remove duplicates",
            idea: <p>Sort the array and make every subset. Turn each subset into a string and keep it in a Set, so a repeat is ignored.</p>,
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
            explain: <p>The answer is correct, but some work is wasted. The duplicate branches are still explored before they are thrown away.</p>,
          },
          {
            name: "Skip duplicates at the same level",
            idea: <p>Sort the array. Inside the loop, use <code>continue</code> (skip to the next turn) when <code>i &gt; start</code> and the value is equal to the one before it.</p>,
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
            explain: <p>The duplicate branches are never entered. Why <code>i &gt; start</code>? The first copy at a level is a new choice. Only the later copies repeat it.</p>,
          },
        ]}
        compare={<p>Use the second one. You need the same pattern for Combination Sum II in the next lesson. (LeetCode 90.)</p>}
      >
        <p>Return all possible subsets of an array that may have repeated values. The result must not have the same subset twice.</p>
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
          <>At each position, you can place any element that is not used yet.</>,
          <>Keep track of used elements with a true/false array, or by swapping elements into place.</>,
        ]}
        approaches={[
          {
            name: "Used array",
            idea: <p>Loop over all indexes and skip the used ones. Choose, make the recursive call, then undo the choice.</p>,
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
            explain: <p>There are n! leaves, and each one is copied in O(n). So the time is O(n · n!) and the extra space is O(n).</p>,
          },
          {
            name: "Swap in place",
            idea: <p>For position i, swap each later element into it one by one. Make the recursive call for i + 1, then swap back. You do not need a <code>used</code> array.</p>,
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
            explain: <p>There are the same number of answers, but they come in a slightly different order. The array itself works as the path.</p>,
          },
        ]}
        compare={<p>The used-array version is easier to change for harder problems (see Permutations II). (LeetCode 46.)</p>}
      >
        <p>Return all permutations of an array of different integers.</p>
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
          <>Use the loop form: choose a number, then choose only from the numbers larger than it.</>,
          <>Stop when the path has length k.</>,
          <>Prune: if the numbers that are left cannot fill the path up to length k, do not go on.</>,
        ]}
        approaches={[
          {
            name: "Backtracking with pruning",
            idea: <p>Loop <code>i</code> from <code>start</code> up to <code>n − (k − path.length) + 1</code>. A later start cannot fill all k places.</p>,
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
            explain: <p>There are C(n, k) answers. Without the smaller loop limit, the code is still correct, but it goes down many dead ends (branches that give no answer).</p>,
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
          { input: 'digits = "23"', output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]', why: "2 → abc and 3 → def, so 3 × 3 = 9 pairs." },
          { input: 'digits = ""', output: "[]", why: "No digits, no combinations." },
        ]}
        hints={[
          <>The tree has one level for each digit and one child for each letter of that digit.</>,
          <>Check for empty input first. The answer is an empty array, not <code>[&quot;&quot;]</code>.</>,
        ]}
        approaches={[
          {
            name: "Recursion building a string",
            idea: <p>At digit i, loop over its letters. For each letter, make the recursive call with that letter added to the string.</p>,
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
            explain: <p>Strings cannot be changed after they are made (they are immutable). So <code>path + ch</code> makes a new string for each child, and you do not need an undo step.</p>,
          },
          {
            name: "Loops only: grow the list digit by digit",
            idea: <p>Start with <code>[&quot;&quot;]</code>. For each digit, replace every string with new strings, one for each letter of that digit added at the end.</p>,
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
            explain: <p>It is the same O(d · 4<sup>d</sup>) work, but with loops instead of recursion.</p>,
          },
        ]}
        compare={<p>(LeetCode 17.)</p>}
      >
        <p>You get a string of digits from 2 to 9. Return every letter combination that these digits could spell on a phone keypad.</p>
      </Problem>

      <Problem
        n={6}
        title="Permutations II (with duplicates)"
        level="Medium"
        examples={[
          { input: "nums = [1, 1, 2]", output: "[[1,1,2],[1,2,1],[2,1,1]]", why: "3 different orders, not 6." },
          { input: "nums = [1, 2, 3]", output: "6 permutations", why: "No repeated values, so it is the same as before." },
        ]}
        hints={[
          <>Sort first, so equal values are next to each other.</>,
          <>Skip a value if it is equal to the one before it <em>and the one before it is not in use right now</em>. That means it was already tried at this position.</>,
        ]}
        approaches={[
          {
            name: "Sort and skip repeated values at the same position",
            idea: <p>Use the <code>used</code> array. When <code>nums[i] === nums[i − 1]</code> and <code>!used[i − 1]</code>, skip this value.</p>,
            code: `function permuteUnique(nums) {
  nums = [...nums].sort((a, b) => a - b);
  const out = [], path = [];
  const used = new Array(nums.length).fill(false);
  function go() {
    if (path.length === nums.length) { out.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;   // we already tried this same value here
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
            explain: <p>This condition makes equal values appear only in their original left-to-right order. That removes the repeated orderings.</p>,
          },
          {
            name: "Count the values instead",
            idea: <p>Keep a Map from each value to how many copies are left. At each step, choose a <em>value</em> (not an index). Because of this, a repeated answer can never be made.</p>,
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
            explain: <p>This is often easier to understand than the sort-and-skip condition.</p>,
          },
        ]}
        compare={<p>Either one works. (LeetCode 47.)</p>}
      >
        <p>Return all different permutations of an array that may have repeated values.</p>
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
          <>At each position you can add &ldquo;(&rdquo; or &ldquo;)&rdquo;. That is a tree with two choices at each step, but most branches are not valid.</>,
          <>You can add &ldquo;(&rdquo; while you have used fewer than n. You can add &ldquo;)&rdquo; only if it does not close more brackets than were opened.</>,
        ]}
        approaches={[
          {
            name: "Make all, keep the valid ones",
            idea: <p>Build every string of 2n characters. Then keep only the balanced ones (every opening bracket has a closing bracket).</p>,
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
            explain: <p>2<sup>2n</sup> strings are built and checked. That is far too many when n gets bigger.</p>,
          },
          {
            name: "Only build valid prefixes",
            idea: <p>Count how many opening and closing brackets you have used. Add &ldquo;(&rdquo; if opens &lt; n. Add &ldquo;)&rdquo; if closes &lt; opens.</p>,
            code: `function generateParenthesis(n) {
  const out = [];
  function go(s, open, close) {
    if (s.length === 2 * n) { out.push(s); return; }
    if (open < n) go(s + "(", open + 1, close);
    if (close < open) go(s + ")", open, close + 1);     // never close more brackets than are open
  }
  go("", 0, 0);
  return out;
}

console.log(JSON.stringify(generateParenthesis(3))); // ["((()))","(()())","(())()","()(())","()()()"]
console.log(generateParenthesis(4).length);          // 14`,
            explain: <p>Every start of a string that we build is already valid, so every leaf is an answer. The count is a Catalan number (a famous counting sequence: 1, 2, 5, 14, 42, ... for n = 1, 2, 3, 4, 5). The idea &ldquo;only add choices that are valid&rdquo; is the main idea of the next lesson.</p>,
          },
        ]}
        compare={<p>Use the second approach. (LeetCode 22.)</p>}
      >
        <p>You get n pairs of parentheses (round brackets). Return every combination that is well-formed, which means every opening bracket has a matching closing bracket.</p>
      </Problem>

      <DryRun
        title="Which template for which wording?"
        cols={["The question says…", "Loop", "Starts at", "Save when…"]}
        rows={[
          ["all subsets", "for i from start", "start", "every call"],
          ["combinations of size k", "for i from start", "start", "path.length === k"],
          ["all orderings (permutations)", "for every i, skip used", "0", "path.length === n"],
          ["one choice for each level (phone letters)", "for each option of this level", "—", "level === last"],
          ["duplicates in the input", "sort, then skip equal values at the same level", "same as above", "same as above"],
        ]}
      />
    </>
  );
}
