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
        hints={[<>The array is sorted, and the extra space must be O(1).</>, <>Put pointers at both ends. Move the one that cannot be in the answer.</>]}
        approaches={[
          {
            name: "Map of seen values",
            idea: <p>For each value, check whether you have already seen the value <code>target - value</code>.</p>,
            code: `function twoSum(numbers, target) {
  const seen = new Map();
  for (let i = 0; i < numbers.length; i++) {
    const j = seen.get(target - numbers[i]);
    if (j !== undefined) return [j + 1, i + 1];
    seen.set(numbers[i], i);
  }
}

console.log(twoSum([2, 7, 11, 15], 9)); // [ 1, 2 ]`,
            explain: <p>O(n) time, but O(n) space. It also does not use the fact that the input is sorted.</p>,
          },
          {
            name: "Two pointers",
            idea: <p>This is the algorithm we traced in the lesson.</p>,
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
            explain: <p>O(n) time, O(1) space. This is what the problem asks for.</p>,
          },
        ]}
        compare={<p>If a problem says &ldquo;sorted&rdquo; and &ldquo;O(1) space&rdquo;, think of two pointers. (LeetCode 167.)</p>}
      >
        <p>You get a sorted array and a target. Return the 1-based positions (the first item is position 1) of the two values that add up to the target. Use O(1) extra space.</p>
      </Problem>

      <Problem
        n={2}
        title="Reverse only the vowels"
        level="Easy"
        examples={[
          { input: `"IceCreAm"`, output: `"AceCreIm"`, why: "The vowels I, e, e, A become A, e, e, I. Other letters stay." },
          { input: `"leetcode"`, output: `"leotcede"`, why: "Vowels e, e, o, e reversed are e, o, e, e." },
        ]}
        hints={[<>Use pointers from both ends. Move each pointer until it sits on a vowel, then swap the two vowels.</>]}
        approaches={[
          {
            name: "Two pointers that skip non-vowels",
            idea: <p>Work on an array of characters. Skip the consonants (letters that are not vowels) from each side. Swap each pair of vowels.</p>,
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
            explain: <p>O(n) time. In JavaScript you cannot change a string in place (Lesson 9). So we copy the letters into an array and join them at the end.</p>,
          },
        ]}
        compare={<p>It has the same shape as a palindrome check, plus a &ldquo;skip&rdquo; step. (LeetCode 345.)</p>}
      >
        <p>Reverse only the vowels of the string <code>s</code> (upper or lower case). Every other character must stay where it is.</p>
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
        hints={[<>Use one pointer in each string. Move the pointer in s only when the letters match.</>]}
        approaches={[
          {
            name: "Same-direction pointers",
            idea: <p>Walk through t. Each time the letter in t matches the next letter that s needs, move forward in s.</p>,
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
            explain: <p>O(n + m) time, O(1) space. It is always safe to take the <em>first</em> match. That leaves the most letters of t for the rest of s.</p>,
          },
        ]}
        compare={<p>It is short and common. (LeetCode 392.)</p>}
      >
        <p>Return whether <code>s</code> is a subsequence of <code>t</code>.</p>
      </Problem>

      <Problem
        n={4}
        title="3Sum"
        level="Medium"
        examples={[
          { input: "[-1, 0, 1, 2, -1, -4]", output: "[[-1, -1, 2], [-1, 0, 1]]", why: "These are the only two different triples that add up to 0." },
          { input: "[0, 0, 0, 0]", output: "[[0, 0, 0]]", why: "Only one unique triple, even though many index choices give it." },
        ]}
        hints={[
          <>Sort first. Fix the first value. Then find pairs in the rest that add up to its negative (for 4, look for pairs that add up to −4).</>,
          <>Skip equal neighbouring values, so you do not repeat a triple.</>,
        ]}
        approaches={[
          {
            name: "Three loops + a Map of keys",
            idea: <p>Try every triple. Sort each triple and turn it into a string key. Store it in a Map, so repeated triples replace each other.</p>,
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
            explain: <p>O(n³). It is too slow for 3,000 values, but you can use it to check your faster answer.</p>,
          },
          {
            name: "Sort + two pointers",
            idea: <p>This is the method from the lesson.</p>,
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
            explain: <p>O(n²) time, O(1) extra space (not counting the output and the sort). The early <code>break</code> is a small speed-up. It is possible only because the array is sorted.</p>,
          },
        ]}
        compare={<p>This is one of the most asked medium questions. Practise the lines that skip duplicates until you can write them without thinking. (LeetCode 15.)</p>}
      >
        <p>Return all unique triples <code>[a, b, c]</code> of values from <code>nums</code> (taken from three different positions) where a + b + c = 0.</p>
      </Problem>

      <Problem
        n={5}
        title="3Sum closest"
        level="Medium"
        examples={[
          { input: "nums = [-1, 2, 1, -4], target = 1", output: "2", why: "−1 + 2 + 1 = 2 is the closest possible sum to 1." },
          { input: "nums = [0, 0, 0], target = 1", output: "0", why: "Only one triple." },
        ]}
        hints={[<>The structure is the same as 3Sum. But you do not look for an exact match. Instead, keep the sum that is nearest to the target.</>]}
        approaches={[
          {
            name: "Sort + two pointers, track the closest",
            idea: <p>Move the pointers exactly as in pair sum, towards the target. Keep the best (nearest) sum you have seen.</p>,
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
            explain: <p>O(n²). Start <code>best</code> with the sum of a real triple, not with 0 or Infinity. If you start with 0, you can return a wrong answer when every real sum is far from the target.</p>,
          },
        ]}
        compare={<p>Many problems are small changes to a template like this one. Find the template first. Then change only the parts that are different. (LeetCode 16.)</p>}
      >
        <p>Return the sum of three values from <code>nums</code> that is nearest to <code>target</code>.</p>
      </Problem>

      <Problem
        n={6}
        title="Container with most water"
        level="Medium"
        examples={[
          { input: "[1, 8, 6, 2, 5, 4, 8, 3, 7]", output: "49", why: "Lines at indices 1 (height 8) and 8 (height 7): 7 × 7 = 49." },
          { input: "[1, 1]", output: "1", why: "1 × 1." },
        ]}
        hints={[<>The brute force tries every pair, which is O(n²).</>, <>Start with the widest pair. If you move the taller line inwards, you can never get more water. So move the shorter one.</>]}
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
            explain: <p>O(n²). It is too slow for 10<sup>5</sup> lines.</p>,
          },
          {
            name: "Two pointers, move the shorter line",
            idea: <p>This is the method from the lesson.</p>,
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
            explain: <p>O(n) time, O(1) space. Why it is safe: the shorter line has already been tried with the widest partner it can have. Every other container that uses it is narrower and no taller.</p>,
          },
        ]}
        compare={<p>Interviewers usually ask you to explain the pointer move. Practise saying the reason out loud. (LeetCode 11.)</p>}
      >
        <p>You get the heights of vertical lines. Choose two lines that, together with the x-axis (the flat ground), hold the most water. Return that amount.</p>
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
          <>Always send the heaviest person who is left. Can the lightest person who is left go in the same boat?</>,
        ]}
        approaches={[
          {
            name: "Sort + two pointers",
            idea: <p>The heaviest person (<code>r</code>) always takes a boat now. Add the lightest person (<code>l</code>) to the same boat if the two fit together.</p>,
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
                cols={["l (weight)", "r (weight)", "pair", "fits?", "boats"]}
                rows={[
                  ["1", "3", "1 + 3 = 4", "no → 3 goes alone", "1"],
                  ["1", "2", "1 + 2 = 3", "yes → both go", "2"],
                  ["2", "2", "same person", "alone", "3"],
                ]}
                note="The loop uses l <= r, so the last single person is counted. The l and r columns show the weights that the pointers point at."
              />
            ),
          },
        ]}
        compare={<p>The sort costs O(n log n) and the walk costs O(n). This problem mixes two pointers with a greedy choice. A greedy choice is the best-looking choice at each step. Lesson 47 explains when such choices are safe. (LeetCode 881.)</p>}
      >
        <p>Each boat carries at most two people, and their total weight must be at most <code>limit</code>. Return the smallest number of boats that can carry everyone.</p>
      </Problem>
    </>
  );
}
