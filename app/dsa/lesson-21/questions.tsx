import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 21 practice questions: two pointers from both ends and in the same direction. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Two Sum II (sorted input)"
        level="Medium"
        examples={[
          { input: "numbers = [2, 7, 11, 15], target = 9", output: "[1, 2]", why: "2 + 7 = 9. Positions are 1-based in this problem." },
          { input: "numbers = [-1, 0], target = -1", output: "[1, 2]", why: "−1 + 0 = −1." },
        ]}
        hints={[<>The array is sorted and extra space should be O(1).</>, <>Pointers at both ends; move the one that cannot be in the answer.</>]}
        approaches={[
          {
            name: "Map of seen values",
            idea: <p>For each value, check whether <code>target - value</code> was seen.</p>,
            code: `function twoSum(numbers, target) {
  const seen = new Map();
  for (let i = 0; i < numbers.length; i++) {
    const j = seen.get(target - numbers[i]);
    if (j !== undefined) return [j + 1, i + 1];
    seen.set(numbers[i], i);
  }
}

console.log(twoSum([2, 7, 11, 15], 9)); // [ 1, 2 ]`,
            explain: <p>O(n) time, but O(n) space — and it ignores that the input is sorted.</p>,
          },
          {
            name: "Two pointers",
            idea: <p>The traced algorithm from the lesson.</p>,
            code: `function twoSum(numbers, target) {
  let l = 0, r = numbers.length - 1;
  while (l < r) {
    const sum = numbers[l] + numbers[r];
    if (sum === target) return [l + 1, r + 1];
    if (sum < target) l++;
    else r--;
  }
}

console.log(twoSum([2, 7, 11, 15], 9)); // [ 1, 2 ]
console.log(twoSum([-1, 0], -1));       // [ 1, 2 ]`,
            explain: <p>O(n) time, O(1) space — exactly what the problem asks for.</p>,
          },
        ]}
        compare={<p>&ldquo;Sorted&rdquo; plus &ldquo;O(1) space&rdquo; in a problem statement is a strong signal for two pointers. (LeetCode 167.)</p>}
      >
        <p>Given a sorted array and a target, return the 1-based positions of the two values that add up to the target. Use O(1) extra space.</p>
      </Problem>

      <Problem
        n={2}
        title="Reverse only the vowels"
        level="Easy"
        examples={[
          { input: `"IceCreAm"`, output: `"AceCreIm"`, why: "The vowels I, e, e, A become A, e, e, I. Other letters stay." },
          { input: `"leetcode"`, output: `"leotcede"`, why: "Vowels e, e, o, e reversed are e, o, e, e." },
        ]}
        hints={[<>Pointers from both ends. Move each one until it sits on a vowel, then swap.</>]}
        approaches={[
          {
            name: "Two pointers that skip non-vowels",
            idea: <p>Work on an array of characters; skip consonants from each side; swap vowel pairs.</p>,
            code: `function reverseVowels(s) {
  const vowels = new Set("aeiouAEIOU");
  const a = [...s];
  let l = 0, r = a.length - 1;
  while (l < r) {
    if (!vowels.has(a[l])) l++;
    else if (!vowels.has(a[r])) r--;
    else {
      [a[l], a[r]] = [a[r], a[l]];
      l++;
      r--;
    }
  }
  return a.join("");
}

console.log(reverseVowels("IceCreAm")); // AceCreIm
console.log(reverseVowels("leetcode")); // leotcede`,
            explain: <p>O(n). Strings cannot be changed in place in JavaScript (Lesson 9), so we copy into an array and join at the end.</p>,
          },
        ]}
        compare={<p>The same skeleton as palindrome checking, with a &ldquo;skip&rdquo; step. (LeetCode 345.)</p>}
      >
        <p>Reverse only the vowels of the string <code>s</code> (upper or lower case), leaving every other character in place.</p>
      </Problem>

      <Problem
        n={3}
        title="Is subsequence"
        level="Easy"
        examples={[
          { input: `s = "abc", t = "ahbgdc"`, output: "true", why: "a, b, c appear in t in that order." },
          { input: `s = "axc", t = "ahbgdc"`, output: "false", why: "There is no x in t." },
          { input: `s = "", t = "abc"`, output: "true", why: "Edge case: the empty string is a subsequence of everything." },
        ]}
        hints={[<>One pointer in each string. Move the pointer in s only on a match.</>]}
        approaches={[
          {
            name: "Same-direction pointers",
            idea: <p>Walk through t; each time its letter matches the next needed letter of s, move forward in s.</p>,
            code: `function isSubsequence(s, t) {
  let i = 0;
  for (let j = 0; j < t.length && i < s.length; j++) {
    if (s[i] === t[j]) i++;
  }
  return i === s.length;
}

console.log(isSubsequence("abc", "ahbgdc")); // true
console.log(isSubsequence("axc", "ahbgdc")); // false
console.log(isSubsequence("", "abc"));       // true`,
            explain: <p>O(n + m) time, O(1) space. Taking the <em>first</em> match is always safe: it leaves the most of t for the remaining letters.</p>,
          },
        ]}
        compare={<p>Short and common. (LeetCode 392.)</p>}
      >
        <p>Return whether <code>s</code> is a subsequence of <code>t</code>.</p>
      </Problem>

      <Problem
        n={4}
        title="3Sum"
        level="Medium"
        examples={[
          { input: "[-1, 0, 1, 2, -1, -4]", output: "[[-1, -1, 2], [-1, 0, 1]]", why: "The only two different triples that add up to 0." },
          { input: "[0, 0, 0, 0]", output: "[[0, 0, 0]]", why: "Only one unique triple, even though many index choices give it." },
        ]}
        hints={[
          <>Sort first. Fix the first value; find pairs in the rest that add up to its negative.</>,
          <>Skip equal neighbouring values to avoid repeated triples.</>,
        ]}
        approaches={[
          {
            name: "Three loops + a Set of keys",
            idea: <p>Try every triple; store each sorted triple as a string key to remove duplicates.</p>,
            code: `function threeSum(nums) {
  const found = new Map();
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      for (let k = j + 1; k < nums.length; k++)
        if (nums[i] + nums[j] + nums[k] === 0) {
          const t = [nums[i], nums[j], nums[k]].sort((a, b) => a - b);
          found.set(t.join(","), t);
        }
  return [...found.values()];
}

console.log(threeSum([0, 0, 0, 0])); // [ [ 0, 0, 0 ] ]`,
            explain: <p>O(n³) — too slow for 3,000 values, but useful as a reference to test against.</p>,
          },
          {
            name: "Sort + two pointers",
            idea: <p>The method from the lesson.</p>,
            code: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (nums[i] > 0) break;                              // three positives cannot sum to 0
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];
      if (sum < 0) l++;
      else if (sum > 0) r--;
      else {
        out.push([nums[i], nums[l], nums[r]]);
        l++; r--;
        while (l < r && nums[l] === nums[l - 1]) l++;
      }
    }
  }
  return out;
}

console.log(threeSum([-1, 0, 1, 2, -1, -4])); // [ [ -1, -1, 2 ], [ -1, 0, 1 ] ]
console.log(threeSum([0, 0, 0, 0]));          // [ [ 0, 0, 0 ] ]`,
            explain: <p>O(n²) time, O(1) extra space besides the output (and the sort). The early <code>break</code> is a small optimisation that the sort makes possible.</p>,
          },
        ]}
        compare={<p>One of the most asked medium questions. Practise the duplicate-skipping lines until they are automatic. (LeetCode 15.)</p>}
      >
        <p>Return all unique triples <code>[a, b, c]</code> of values from <code>nums</code> (at different positions) with a + b + c = 0.</p>
      </Problem>

      <Problem
        n={5}
        title="3Sum closest"
        level="Medium"
        examples={[
          { input: "nums = [-1, 2, 1, -4], target = 1", output: "2", why: "−1 + 2 + 1 = 2 is the closest possible sum to 1." },
          { input: "nums = [0, 0, 0], target = 1", output: "0", why: "Only one triple." },
        ]}
        hints={[<>Same structure as 3Sum. Instead of looking for an exact match, keep the sum with the smallest distance to the target.</>]}
        approaches={[
          {
            name: "Sort + two pointers, track the closest",
            idea: <p>Move the pointers exactly as in pair sum (towards the target), recording the best sum seen.</p>,
            code: `function threeSumClosest(nums, target) {
  nums.sort((a, b) => a - b);
  let best = nums[0] + nums[1] + nums[2];
  for (let i = 0; i < nums.length - 2; i++) {
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];
      if (Math.abs(sum - target) < Math.abs(best - target)) best = sum;
      if (sum < target) l++;
      else if (sum > target) r--;
      else return sum;                      // exact match: cannot do better
    }
  }
  return best;
}

console.log(threeSumClosest([-1, 2, 1, -4], 1)); // 2
console.log(threeSumClosest([0, 0, 0], 1));      // 0`,
            explain: <p>O(n²). Starting <code>best</code> at a real triple (not 0 or Infinity) avoids a wrong answer when every sum is far from the target.</p>,
          },
        ]}
        compare={<p>Many problems are small changes of a template like this. Recognise the template first, then change only what differs. (LeetCode 16.)</p>}
      >
        <p>Return the sum of three values from <code>nums</code> that is closest to <code>target</code>.</p>
      </Problem>

      <Problem
        n={6}
        title="Container with most water"
        level="Medium"
        examples={[
          { input: "[1, 8, 6, 2, 5, 4, 8, 3, 7]", output: "49", why: "Lines at indices 1 (height 8) and 8 (height 7): 7 × 7 = 49." },
          { input: "[1, 1]", output: "1", why: "1 × 1." },
        ]}
        hints={[<>Brute force tries every pair: O(n²).</>, <>Start wide. Moving the taller line inwards can never give more water. Move the shorter one.</>]}
        approaches={[
          {
            name: "Every pair",
            idea: <p>Two loops over all pairs.</p>,
            code: `function maxArea(h) {
  let best = 0;
  for (let i = 0; i < h.length; i++)
    for (let j = i + 1; j < h.length; j++)
      best = Math.max(best, Math.min(h[i], h[j]) * (j - i));
  return best;
}

console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49`,
            explain: <p>O(n²) — too slow for 10<sup>5</sup> lines.</p>,
          },
          {
            name: "Two pointers, move the shorter line",
            idea: <p>The method from the lesson.</p>,
            code: `function maxArea(h) {
  let l = 0, r = h.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, Math.min(h[l], h[r]) * (r - l));
    if (h[l] < h[r]) l++;
    else r--;
  }
  return best;
}

console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
console.log(maxArea([1, 1]));                      // 1`,
            explain: <p>O(n), O(1). The argument: the shorter line has already been used with the widest possible partner; every other container using it is narrower and no taller.</p>,
          },
        ]}
        compare={<p>Interviewers usually ask you to justify the pointer move — practise saying the argument out loud. (LeetCode 11.)</p>}
      >
        <p>Given line heights, choose two lines that together with the x-axis hold the most water. Return that amount.</p>
      </Problem>

      <Problem
        n={7}
        title="Boats to save people"
        level="Medium"
        examples={[
          { input: "people = [3, 2, 2, 1], limit = 3", output: "3", why: "Boats: (1, 2), (2), (3)." },
          { input: "people = [3, 5, 3, 4], limit = 5", output: "4", why: "No two people fit together, so everyone needs a boat." },
        ]}
        hints={[
          <>Each boat holds at most two people. Sort the weights.</>,
          <>Always send the heaviest remaining person. Can the lightest remaining person go with them?</>,
        ]}
        approaches={[
          {
            name: "Sort + two pointers",
            idea: <p>The heaviest person (<code>r</code>) always takes a boat now. Add the lightest (<code>l</code>) if they fit together.</p>,
            code: `function numRescueBoats(people, limit) {
  people.sort((a, b) => a - b);
  let l = 0, r = people.length - 1, boats = 0;
  while (l <= r) {
    if (people[l] + people[r] <= limit) l++;   // lightest joins the heaviest
    r--;                                        // heaviest always leaves
    boats++;
  }
  return boats;
}

console.log(numRescueBoats([3, 2, 2, 1], 3)); // 3
console.log(numRescueBoats([3, 5, 3, 4], 5)); // 4`,
            explain: (
              <DryRun
                title="sorted [1, 2, 2, 3], limit 3"
                cols={["l", "r", "pair", "fits?", "boats"]}
                rows={[
                  ["1", "3", "1 + 3 = 4", "no → 3 alone", "1"],
                  ["1", "2", "1 + 2 = 3", "yes → both", "2"],
                  ["2", "2", "same person", "alone", "3"],
                ]}
                note="The loop uses l <= r so the last single person is counted."
              />
            ),
          },
        ]}
        compare={<p>O(n log n) for the sort, O(n) for the walk. This mixes two pointers with a greedy choice — Lesson 47 explains when such choices are safe. (LeetCode 881.)</p>}
      >
        <p>Each boat carries at most two people with total weight at most <code>limit</code>. Return the minimum number of boats to carry everyone.</p>
      </Problem>
    </>
  );
}
