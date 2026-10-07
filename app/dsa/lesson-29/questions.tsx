import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 29 practice questions: binary search on the answer. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Integer square root"
        level="Easy"
        examples={[
          { input: "4", output: "2", why: "2 × 2 = 4." },
          { input: "8", output: "2", why: "√8 ≈ 2.83; round down." },
        ]}
        hints={[<>The answer is the last r with r × r ≤ x.</>]}
        approaches={[
          {
            name: "Last true",
            idea: <p>Search r in [0, x]; &ldquo;r × r ≤ x&rdquo; is true…true, false…false.</p>,
            code: `function mySqrt(x) {
  let lo = 0, hi = x;
  while (lo < hi) {
    const mid = lo + Math.ceil((hi - lo) / 2);
    if (mid * mid <= x) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

console.log(mySqrt(4));          // 2
console.log(mySqrt(8));          // 2
console.log(mySqrt(2147395599)); // 46339`,
            explain: <p>O(log x). This is the &ldquo;last true&rdquo; form, so mid rounds up.</p>,
          },
        ]}
        compare={<p>Do not use <code>Math.sqrt</code> — the question tests the search. (LeetCode 69.)</p>}
      >
        <p>Return the square root of a non-negative integer <code>x</code>, rounded down, without built-in power functions.</p>
      </Problem>

      <Problem
        n={2}
        title="Koko eating bananas"
        level="Medium"
        examples={[
          { input: "piles = [3, 6, 7, 11], h = 8", output: "4", why: "Traced in the lesson." },
          { input: "piles = [30, 11, 23, 4, 20], h = 5", output: "30", why: "Five piles in five hours: one pile per hour, so the speed must be at least the largest pile." },
        ]}
        hints={[<>Range 1 … max(piles). Check: sum of ceil(pile / k) ≤ h.</>]}
        approaches={[
          {
            name: "First speed that works",
            idea: <p>The traced algorithm.</p>,
            code: `function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const k = lo + Math.floor((hi - lo) / 2);
    let hours = 0;
    for (const p of piles) hours += Math.ceil(p / k);
    if (hours <= h) hi = k;
    else lo = k + 1;
  }
  return lo;
}

console.log(minEatingSpeed([3, 6, 7, 11], 8));        // 4
console.log(minEatingSpeed([30, 11, 23, 4, 20], 5));  // 30`,
            explain: <p>O(n log m), where m is the largest pile.</p>,
          },
        ]}
        compare={<p>(LeetCode 875.)</p>}
      >
        <p>Return the smallest eating speed k that lets Koko finish all piles within <code>h</code> hours.</p>
      </Problem>

      <Problem
        n={3}
        title="Smallest divisor given a threshold"
        level="Medium"
        examples={[
          { input: "nums = [1, 2, 5, 9], threshold = 6", output: "5", why: "With 5: 1 + 1 + 1 + 2 = 5 ≤ 6. With 4: 1 + 1 + 2 + 3 = 7 > 6." },
        ]}
        hints={[<>The same shape as Koko: a bigger divisor gives a smaller sum.</>]}
        approaches={[
          {
            name: "First divisor that works",
            idea: <p>Range 1 … max(nums); check the sum of rounded-up divisions.</p>,
            code: `function smallestDivisor(nums, threshold) {
  let lo = 1, hi = Math.max(...nums);
  while (lo < hi) {
    const d = lo + Math.floor((hi - lo) / 2);
    const sum = nums.reduce((s, x) => s + Math.ceil(x / d), 0);
    if (sum <= threshold) hi = d;
    else lo = d + 1;
  }
  return lo;
}

console.log(smallestDivisor([1, 2, 5, 9], 6)); // 5`,
            explain: <p>O(n log m). Recognising that this is Koko in different words is the whole question.</p>,
          },
        ]}
        compare={<p>(LeetCode 1283.)</p>}
      >
        <p>Find the smallest positive divisor such that the sum of every value divided by it (each rounded up) is at most <code>threshold</code>.</p>
      </Problem>

      <Problem
        n={4}
        title="Capacity to ship packages within D days"
        level="Medium"
        examples={[
          { input: "weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5", output: "15", why: "Days: [1–5], [6, 7], [8], [9], [10]." },
          { input: "weights = [3, 2, 2, 4, 1, 4], days = 3", output: "6", why: "Days: [3, 2], [2, 4], [1, 4]." },
        ]}
        hints={[<>Range: max(weights) … sum(weights). Check with the greedy loader.</>]}
        approaches={[
          {
            name: "First capacity that works",
            idea: <p>The method from the lesson.</p>,
            code: `function shipWithinDays(weights, days) {
  const need = (cap) => {
    let d = 1, load = 0;
    for (const w of weights) {
      if (load + w > cap) { d++; load = 0; }
      load += w;
    }
    return d;
  };
  let lo = Math.max(...weights), hi = weights.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (need(mid) <= days) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

console.log(shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)); // 15
console.log(shipWithinDays([3, 2, 2, 4, 1, 4], 3));              // 6`,
            explain: <p>O(n log(sum)).</p>,
          },
        ]}
        compare={<p>(LeetCode 1011.)</p>}
      >
        <p>Packages must ship in the given order. Return the smallest ship capacity that ships all of them within <code>days</code> days.</p>
      </Problem>

      <Problem
        n={5}
        title="Split array, minimise the largest sum"
        level="Hard"
        examples={[
          { input: "nums = [7, 2, 5, 10, 8], k = 2", output: "18", why: "[7, 2, 5] and [10, 8]: the larger sum is 18, and no split does better." },
          { input: "nums = [1, 2, 3, 4, 5], k = 2", output: "9", why: "[1, 2, 3] and [4, 5]." },
        ]}
        hints={[<>&ldquo;k parts&rdquo; = &ldquo;k days&rdquo;, &ldquo;largest sum&rdquo; = &ldquo;capacity&rdquo;. It is Question 4.</>]}
        approaches={[
          {
            name: "Same as ship capacity",
            idea: <p>Find the smallest limit for which the greedy split needs at most k parts.</p>,
            code: `function splitArray(nums, k) {
  const parts = (limit) => {
    let p = 1, sum = 0;
    for (const x of nums) {
      if (sum + x > limit) { p++; sum = 0; }
      sum += x;
    }
    return p;
  };
  let lo = Math.max(...nums), hi = nums.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (parts(mid) <= k) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

console.log(splitArray([7, 2, 5, 10, 8], 2)); // 18
console.log(splitArray([1, 2, 3, 4, 5], 2));  // 9`,
            explain: <p>O(n log(sum)). A hard problem that is easy once the pattern is recognised.</p>,
          },
        ]}
        compare={<p>(LeetCode 410.)</p>}
      >
        <p>Split <code>nums</code> into <code>k</code> non-empty contiguous parts so that the largest part sum is as small as possible. Return that sum.</p>
      </Problem>

      <Problem
        n={6}
        title="Magnetic force between two balls"
        level="Medium"
        examples={[
          { input: "position = [1, 2, 3, 4, 7], m = 3", output: "3", why: "Balls at 1, 4 and 7: the gaps are 3 and 3." },
          { input: "position = [5, 4, 3, 2, 1, 1000000000], m = 2", output: "999999999", why: "Put the two balls at the ends." },
        ]}
        hints={[<>Maximise the minimum gap: find the last gap that still lets you place m balls greedily.</>]}
        approaches={[
          {
            name: "Last true, greedy placement",
            idea: <p>The method from the lesson.</p>,
            code: `function maxDistance(position, m) {
  const pos = [...position].sort((a, b) => a - b);
  const canPlace = (gap) => {
    let count = 1, last = pos[0];
    for (const p of pos) if (p - last >= gap) { count++; last = p; }
    return count >= m;
  };
  let lo = 1, hi = pos[pos.length - 1] - pos[0];
  while (lo < hi) {
    const mid = lo + Math.ceil((hi - lo) / 2);
    if (canPlace(mid)) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

console.log(maxDistance([1, 2, 3, 4, 7], 3));                  // 3
console.log(maxDistance([5, 4, 3, 2, 1, 1000000000], 2));      // 999999999`,
            explain: (
              <DryRun
                title="canPlace for [1, 2, 3, 4, 7], m = 3"
                cols={["gap", "balls placed at", "≥ 3 balls?"]}
                rows={[["2", "1, 3, 7", "yes"], ["3", "1, 4, 7", "yes"], ["4", "1, 7", "no"]]}
                note="Last true: 3."
              />
            ),
          },
        ]}
        compare={<p>O(n log n + n log(range)). (LeetCode 1552.)</p>}
      >
        <p>Place <code>m</code> balls in baskets at the given positions so that the smallest distance between any two balls is as large as possible. Return that distance.</p>
      </Problem>
    </>
  );
}
