import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 19 practice questions: classic one- and two-pass array problems. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Remove duplicates from a sorted array"
        level="Easy"
        examples={[
          { input: "[1, 1, 2]", output: "2, nums = [1, 2, _]", why: "Two unique values. What is left after them does not matter." },
          { input: "[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]", output: "5, nums = [0, 1, 2, 3, 4, …]", why: "Five unique values at the front." },
        ]}
        hints={[<>Sorted means duplicates are neighbours.</>, <>Keep a write index; copy a value only when it differs from the last value kept.</>]}
        approaches={[
          {
            name: "Set, then copy back",
            idea: <p>Collect the unique values with a Set (which keeps insertion order), then write them to the front.</p>,
            code: `function removeDuplicates(nums) {
  const unique = [...new Set(nums)];
  for (let i = 0; i < unique.length; i++) nums[i] = unique[i];
  return unique.length;
}

const a = [1, 1, 2];
console.log(removeDuplicates(a), a.slice(0, 2)); // 2 [ 1, 2 ]`,
            explain: <p>O(n) time, but O(n) extra space — it breaks the &ldquo;in place&rdquo; rule.</p>,
          },
          {
            name: "Read/write pointers",
            idea: <p>The traced algorithm from the lesson.</p>,
            code: `function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let write = 1;
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[write - 1]) nums[write++] = nums[read];
  }
  return write;
}

const b = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];
const k = removeDuplicates(b);
console.log(k, b.slice(0, k)); // 5 [ 0, 1, 2, 3, 4 ]`,
            explain: <p>O(n) time, O(1) space. <code>nums[write++] = …</code> writes at <code>write</code> and then increases it.</p>,
          },
        ]}
        compare={<p>The pointer version is the expected answer. (LeetCode 26.)</p>}
      >
        <p>Remove the duplicates from a sorted array <strong>in place</strong> so each value appears once. Return the number of unique values k; the first k positions must hold them in order.</p>
      </Problem>

      <Problem
        n={2}
        title="Remove element"
        level="Easy"
        examples={[
          { input: "nums = [3, 2, 2, 3], val = 3", output: "2, nums = [2, 2, _, _]", why: "Two values remain after removing every 3." },
          { input: "nums = [0, 1, 2, 2, 3, 0, 4, 2], val = 2", output: "5, nums = [0, 1, 3, 0, 4, …]", why: "Order of the kept values may stay as it was." },
        ]}
        hints={[<>Keep every value that is not <code>val</code>, using a write pointer.</>]}
        approaches={[
          {
            name: "Read/write pointers",
            idea: <p>Copy each value that is not <code>val</code> to the write position.</p>,
            code: `function removeElement(nums, val) {
  let write = 0;
  for (const x of nums) {
    if (x !== val) nums[write++] = x;
  }
  return write;
}

const a = [0, 1, 2, 2, 3, 0, 4, 2];
const k = removeElement(a, 2);
console.log(k, a.slice(0, k)); // 5 [ 0, 1, 3, 0, 4 ]`,
            explain: <p>O(n) time, O(1) space. The same skeleton as remove-duplicates; only the &ldquo;keep?&rdquo; test changed.</p>,
          },
        ]}
        compare={<p>Once you see the read/write pattern, a whole family of &ldquo;remove … in place&rdquo; problems uses the same five lines. (LeetCode 27.)</p>}
      >
        <p>Remove every occurrence of <code>val</code> from <code>nums</code> in place, and return how many values remain.</p>
      </Problem>

      <Problem
        n={3}
        title="Move zeroes"
        level="Easy"
        examples={[
          { input: "[0, 1, 0, 3, 12]", output: "[1, 3, 12, 0, 0]", why: "Non-zero values keep their order; zeros go to the end." },
          { input: "[0]", output: "[0]", why: "Edge case." },
        ]}
        hints={[<>Copy the non-zero values forward, then fill the rest with zeros. Or swap as you go.</>]}
        approaches={[
          {
            name: "Copy forward, then fill zeros",
            idea: <p>Two passes: compact the non-zero values, then write zeros after them.</p>,
            code: `function moveZeroes(nums) {
  let write = 0;
  for (const x of nums) if (x !== 0) nums[write++] = x;
  while (write < nums.length) nums[write++] = 0;
  return nums;
}

console.log(moveZeroes([0, 1, 0, 3, 12])); // [ 1, 3, 12, 0, 0 ]`,
            explain: <p>O(n) time, O(1) space. Easy to reason about.</p>,
          },
          {
            name: "Swap in one pass",
            idea: <p>The version from the lesson: swap each non-zero value into the write position.</p>,
            code: `function moveZeroes(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      [nums[write], nums[read]] = [nums[read], nums[write]];
      write++;
    }
  }
  return nums;
}

console.log(moveZeroes([0, 1, 0, 3, 12])); // [ 1, 3, 12, 0, 0 ]
console.log(moveZeroes([0]));              // [ 0 ]`,
            explain: <p>One pass, O(1) space, and fewer writes when there are few zeros.</p>,
          },
        ]}
        compare={<p>Both are accepted. (LeetCode 283.)</p>}
      >
        <p>Move all 0s to the end of <code>nums</code> in place, keeping the order of the other values.</p>
      </Problem>

      <Problem
        n={4}
        title="Rotate array"
        level="Medium"
        examples={[
          { input: "nums = [1, 2, 3, 4, 5, 6, 7], k = 3", output: "[5, 6, 7, 1, 2, 3, 4]", why: "The last 3 values move to the front." },
          { input: "nums = [-1, -100, 3, 99], k = 2", output: "[3, 99, -1, -100]", why: "Rotate by 2." },
          { input: "nums = [1, 2], k = 5", output: "[2, 1]", why: "k is bigger than the length: 5 % 2 = 1." },
        ]}
        hints={[
          <>Where does the value at index i end up? At <code>(i + k) % n</code>.</>,
          <>For O(1) space: reverse everything, then reverse the two blocks.</>,
        ]}
        approaches={[
          {
            name: "Extra array",
            idea: <p>Place each value directly at its new index in a copy, then copy back.</p>,
            code: `function rotate(nums, k) {
  const n = nums.length;
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[(i + k) % n] = nums[i];
  for (let i = 0; i < n; i++) nums[i] = out[i];
  return nums;
}

console.log(rotate([1, 2, 3, 4, 5, 6, 7], 3)); // [ 5, 6, 7, 1, 2, 3, 4 ]
console.log(rotate([1, 2], 5));                // [ 2, 1 ]`,
            explain: <p>O(n) time, O(n) space. The <code>% n</code> handles k larger than n automatically.</p>,
          },
          {
            name: "Three reversals",
            idea: <p>Reverse all, reverse the first k, reverse the rest.</p>,
            code: `function rotate(nums, k) {
  const n = nums.length;
  k %= n;
  const rev = (i, j) => {
    while (i < j) { [nums[i], nums[j]] = [nums[j], nums[i]]; i++; j--; }
  };
  rev(0, n - 1);
  rev(0, k - 1);
  rev(k, n - 1);
  return nums;
}

console.log(rotate([1, 2, 3, 4, 5, 6, 7], 3)); // [ 5, 6, 7, 1, 2, 3, 4 ]
console.log(rotate([-1, -100, 3, 99], 2));     // [ 3, 99, -1, -100 ]
console.log(rotate([1, 2], 5));                // [ 2, 1 ]`,
            explain: <p>O(n) time, O(1) space. Each item is swapped at most twice.</p>,
          },
        ]}
        compare={<p>Give the extra-array version first, then the reversal trick when asked for O(1) space. Do not forget <code>k %= n</code>. (LeetCode 189.)</p>}
      >
        <p>Rotate <code>nums</code> to the right by <code>k</code> steps, in place.</p>
      </Problem>

      <Problem
        n={5}
        title="Single number"
        level="Easy"
        examples={[
          { input: "[2, 2, 1]", output: "1", why: "1 appears once; 2 twice." },
          { input: "[4, 1, 2, 1, 2]", output: "4", why: "Everything else is paired." },
        ]}
        hints={[<>A Map of counts works. Can you use O(1) space?</>, <>x ^ x = 0 and x ^ 0 = x.</>]}
        approaches={[
          {
            name: "Frequency map",
            idea: <p>Count, then return the value with count 1.</p>,
            code: `function singleNumber(nums) {
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);
  for (const [x, c] of freq) if (c === 1) return x;
}

console.log(singleNumber([4, 1, 2, 1, 2])); // 4`,
            explain: <p>O(n) time, O(n) space.</p>,
          },
          {
            name: "XOR everything",
            idea: <p>Pairs cancel; the single value remains.</p>,
            code: `function singleNumber(nums) {
  let x = 0;
  for (const v of nums) x ^= v;
  return x;
}

console.log(singleNumber([2, 2, 1]));       // 1
console.log(singleNumber([4, 1, 2, 1, 2])); // 4`,
            explain: (
              <DryRun
                title="[4, 1, 2, 1, 2]"
                cols={["v", "x after x ^= v"]}
                rows={[["4", "4"], ["1", "4 ^ 1"], ["2", "4 ^ 1 ^ 2"], ["1", "4 ^ 2 (the 1s cancel)"], ["2", "4 (the 2s cancel)"]]}
                highlight={4}
              />
            ),
          },
        ]}
        compare={<p>The XOR version is the expected O(1)-space answer. (LeetCode 136.)</p>}
      >
        <p>Every value in <code>nums</code> appears twice except one. Find it in O(n) time and O(1) extra space.</p>
      </Problem>

      <Problem
        n={6}
        title="Sorted and rotated?"
        level="Easy"
        examples={[
          { input: "[3, 4, 5, 1, 2]", output: "true", why: "[1, 2, 3, 4, 5] rotated by 3." },
          { input: "[2, 1, 3, 4]", output: "false", why: "No rotation of a sorted array gives this." },
          { input: "[1, 2, 3]", output: "true", why: "Rotated by 0." },
        ]}
        hints={[
          <>In a sorted array there are no &ldquo;drops&rdquo; (a value smaller than the one before it).</>,
          <>A rotated sorted array has at most one drop — if you also compare the last value with the first.</>,
        ]}
        approaches={[
          {
            name: "Count the drops, circularly",
            idea: <p>Count positions i where <code>nums[i] &gt; nums[(i + 1) % n]</code>. At most one is allowed.</p>,
            code: `function check(nums) {
  const n = nums.length;
  let drops = 0;
  for (let i = 0; i < n; i++) {
    if (nums[i] > nums[(i + 1) % n]) drops++;
  }
  return drops <= 1;
}

console.log(check([3, 4, 5, 1, 2])); // true
console.log(check([2, 1, 3, 4]));    // false
console.log(check([1, 2, 3]));       // true`,
            explain: <p>O(n), O(1). <code>(i + 1) % n</code> wraps from the last index back to 0, so the array is treated as a circle — a trick that appears again with circular arrays in Lesson 40.</p>,
          },
        ]}
        compare={<p>Turning &ldquo;rotated&rdquo; into &ldquo;sorted around a circle&rdquo; removes the need to find the rotation point. (LeetCode 1752.)</p>}
      >
        <p>Return <code>true</code> if <code>nums</code> could be a sorted (non-decreasing) array rotated by some number of positions.</p>
      </Problem>

      <Problem
        n={7}
        title="Union of two sorted arrays"
        level="Easy"
        examples={[
          { input: "[1, 2, 2, 4], [2, 3, 5]", output: "[1, 2, 3, 4, 5]", why: "Every value from either array, once." },
          { input: "[], [1, 1]", output: "[1]", why: "Edge case: one array empty." },
        ]}
        hints={[<>A Set plus a sort works. With sorted input, a merge-style walk avoids the sort.</>]}
        approaches={[
          {
            name: "Set, then sort",
            idea: <p>Put both arrays into a Set and sort the result.</p>,
            code: `function unionSorted(a, b) {
  return [...new Set([...a, ...b])].sort((x, y) => x - y);
}

console.log(unionSorted([1, 2, 2, 4], [2, 3, 5])); // [ 1, 2, 3, 4, 5 ]`,
            explain: <p>O((n + m) log(n + m)). Ignores the fact that the inputs are sorted.</p>,
          },
          {
            name: "Merge walk",
            idea: <p>Take the smaller front value each time, skipping it if it equals the last value added.</p>,
            code: `function unionSorted(a, b) {
  const out = [];
  const add = (v) => { if (out[out.length - 1] !== v) out.push(v); };
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (j === b.length || (i < a.length && a[i] <= b[j])) add(a[i++]);
    else add(b[j++]);
  }
  return out;
}

console.log(unionSorted([1, 2, 2, 4], [2, 3, 5])); // [ 1, 2, 3, 4, 5 ]
console.log(unionSorted([], [1, 1]));              // [ 1 ]`,
            explain: <p>O(n + m). Writing the loop condition as &ldquo;either array has items left&rdquo; removes the two leftover loops.</p>,
          },
        ]}
        compare={<p>When inputs are sorted, a merge walk is almost always the best tool.</p>}
      >
        <p>Return the sorted union (each value once) of two sorted arrays.</p>
      </Problem>
    </>
  );
}
