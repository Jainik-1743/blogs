import Problem from "@/components/dsa/Problem";

/**
 * Lesson 60 mock interviews. Each one starts from the wording alone: name the pattern first,
 * then solve. The green "Which approach" box is a script of what to say aloud.
 */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Mock interview: how many subarrays add up to k?"
        level="Medium"
        examples={[
          { input: "nums = [1,1,1], k = 2", output: "2", why: "The subarrays [1,1] at positions 0–1 and at positions 1–2." },
          { input: "nums = [1,2,3], k = 3", output: "2", why: "[1,2] and [3]." },
          { input: "nums = [1,-1,0], k = 0", output: "3", why: "[1,-1], [0] and [1,-1,0]. Negative numbers are allowed." },
        ]}
        hints={[
          <>Pattern from the wording: &quot;contiguous&quot; and &quot;sum&quot;. Two candidates: a sliding window, or prefix sums. Which one do negative numbers rule out?</>,
          <>A subarray from i+1 to j has sum <code>prefix[j] - prefix[i]</code>. For a fixed j, which earlier prefix value are you looking for?</>,
          <>How many times has that earlier prefix value appeared? A Map can store that.</>,
        ]}
        approaches={[
          {
            name: "Brute force: every start, every end",
            idea: <p>For each starting index, extend the end one step at a time, keeping a running sum, and count each time it equals <code>k</code>.</p>,
            code: `function subarraySum(nums, k) {
  let count = 0;
  for (let start = 0; start < nums.length; start++) {
    let sum = 0;
    for (let end = start; end < nums.length; end++) {
      sum += nums[end];
      if (sum === k) count++;            // do not stop: later elements may bring the sum back to k
    }
  }
  return count;
}

console.log(subarraySum([1, 1, 1], 2));  // 2
console.log(subarraySum([1, 2, 3], 3));  // 2
console.log(subarraySum([1, -1, 0], 0)); // 3`,
            explain: <p>O(n²) time, O(1) space. Do not stop at the first match: with negatives and zeros, a longer subarray can also equal <code>k</code>.</p>,
          },
          {
            name: "Prefix sums with a Map",
            idea: <p>Keep the running total <code>prefix</code>. A subarray ending here sums to <code>k</code> exactly when some earlier prefix equals <code>prefix - k</code>. Store how many times each prefix has occurred, seeded with prefix 0 occurring once (the empty start).</p>,
            code: `function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]);          // the empty prefix, so subarrays starting at index 0 are counted
  let prefix = 0, count = 0;
  for (const x of nums) {
    prefix += x;
    count += seen.get(prefix - k) ?? 0;    // every earlier prefix of this value starts a valid subarray
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);
  }
  return count;
}

console.log(subarraySum([1, 1, 1], 2));  // 2
console.log(subarraySum([1, 2, 3], 3));  // 2
console.log(subarraySum([1, -1, 0], 0)); // 3`,
            explain: <p>O(n) time, O(n) space. Dry run on <code>[1,-1,0]</code>, k = 0: seen {"{0:1}"}. x = 1: prefix 1, look up 1 → 0, store 1. x = -1: prefix 0, look up 0 → 1 (count 1), store 0 (now two). x = 0: prefix 0, look up 0 → 2 (count 3). The answer is 3.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Recognise the pattern (from the words only).</strong> &quot;<em>Contiguous</em> plus <em>sum equals k</em> makes me think of two techniques: a sliding window, or prefix sums. A window works when adding an element only grows the sum, so I know when to shrink. The problem allows negative numbers? Then it breaks, and a window cannot be used. I am also being asked to <em>count</em> all such subarrays, not find the longest, which fits a prefix sum with a hash map, as in lesson 20.&quot;</p>
            <p><strong>Clarify.</strong> &quot;Can the numbers be negative or zero? Is the answer small enough for a normal number? How long can the array be? Is an empty subarray counted?&quot; (Suppose: yes to negatives and zeros, up to 20,000 elements, subarrays must be non-empty.)</p>
            <p><strong>Plan.</strong> &quot;Brute force: all start and end pairs with a running sum, O(n²). That would pass for 20,000, but I can do better. A subarray from i+1 to j has sum prefix[j] minus prefix[i]. So for each j I need the number of earlier prefixes equal to prefix[j] minus k. A map from prefix value to count gives me that in O(1).&quot;</p>
            <p><strong>Code and test.</strong> &quot;The map starts with 0 mapped to 1, which represents the empty prefix, so a subarray starting at index 0 is found. For each element: update the prefix, add the count for prefix minus k, then record the prefix. I do the lookup before the store so a subarray cannot be empty. Test on 1, -1, 0 with k = 0: I get 0, then 1, then 3, and 3 is the expected answer.&quot;</p>
            <p><strong>Complexity.</strong> &quot;O(n) time and O(n) space for the map. The window would have used O(1) space but would be wrong with negatives.&quot; (LeetCode 560.)</p>
          </>
        }
      >
        <p>
          Given an array of integers <code>nums</code> (which may contain negative numbers and zeros) and an integer <code>k</code>, return
          the total number of contiguous subarrays whose sum equals <code>k</code>.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Mock interview: the longest stretch with at most two kinds of fruit"
        level="Medium"
        examples={[
          { input: "fruits = [1,2,1]", output: "3", why: "All three trees: only types 1 and 2." },
          { input: "fruits = [0,1,2,2]", output: "3", why: "[1,2,2] is the longest stretch with two types." },
          { input: "fruits = [1,2,3,2,2]", output: "4", why: "[2,3,2,2]: types 2 and 3." },
        ]}
        hints={[
          <>Pattern from the wording: &quot;longest&quot;, &quot;consecutive&quot; and &quot;at most two distinct&quot;. That is the variable-size window.</>,
          <>What do you need to know about the window at any moment? How many distinct kinds it holds, and how many of each.</>,
          <>When a third kind enters, what do you do with the left edge until only two kinds remain?</>,
        ]}
        approaches={[
          {
            name: "Brute force: try every start",
            idea: <p>For each starting tree, walk right, tracking the distinct types in a Set, and stop when a third type appears. Keep the longest stretch.</p>,
            code: `function totalFruit(fruits) {
  let best = 0;
  for (let start = 0; start < fruits.length; start++) {
    const kinds = new Set();
    let end = start;
    while (end < fruits.length) {
      kinds.add(fruits[end]);
      if (kinds.size > 2) break;
      end++;
    }
    best = Math.max(best, end - start);
  }
  return best;
}

console.log(totalFruit([1, 2, 1]));       // 3
console.log(totalFruit([0, 1, 2, 2]));    // 3
console.log(totalFruit([1, 2, 3, 2, 2])); // 4
console.log(totalFruit([]));              // 0`,
            explain: <p>O(n²) time in the worst case (a long run of two types), O(1) space since the Set never holds more than 3 values. Correct but repeats a lot of work.</p>,
          },
          {
            name: "Variable sliding window with counts",
            idea: <p>Grow the right edge. Keep a Map of type to count in the window. When the Map has more than two types, move the left edge right, decreasing counts and deleting a type when its count reaches zero. After each step, the window is valid; record its length.</p>,
            code: `function totalFruit(fruits) {
  const counts = new Map();                   // type -> how many in the window
  let left = 0, best = 0;
  for (let right = 0; right < fruits.length; right++) {
    counts.set(fruits[right], (counts.get(fruits[right]) ?? 0) + 1);
    while (counts.size > 2) {                 // too many kinds: shrink from the left
      const type = fruits[left];
      counts.set(type, counts.get(type) - 1);
      if (counts.get(type) === 0) counts.delete(type);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(totalFruit([1, 2, 1]));       // 3
console.log(totalFruit([0, 1, 2, 2]));    // 3
console.log(totalFruit([1, 2, 3, 2, 2])); // 4
console.log(totalFruit([]));              // 0`,
            explain: <p>O(n) time: each index enters the window once and leaves at most once. O(1) space: the Map holds at most 3 types. The deletion when a count reaches zero matters; otherwise <code>counts.size</code> would never drop.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Recognise.</strong> &quot;The wording is <em>longest</em>, <em>consecutive</em> trees, and a limit on the number of <em>distinct</em> values: at most two. That is the variable-size sliding window from lesson 23, with a count map to track the distinct kinds. Unlike the previous prefix sum problem, all values are non-negative counts here, so the window can shrink safely.&quot;</p>
            <p><strong>Clarify.</strong> &quot;So I must pick a contiguous stretch, and I can hold only two types? Is the array possibly empty? How long can it be? Are the types small integers?&quot; (Suppose: empty returns 0, n up to 100,000.)</p>
            <p><strong>Plan.</strong> &quot;Brute force: from every start extend until a third type appears, O(n²), too slow for 100,000. Wasted work: when I move the start by one, I rescan almost the same stretch. A window keeps its state instead: expand right; when there are three types, shrink from the left until there are two again.&quot;</p>
            <p><strong>Code and test.</strong> &quot;A map of counts, left at zero. For each right index I add the fruit; while the map has more than two entries I remove one from the left; when a count reaches zero I delete the key. Then update the best length. Test on 1, 2, 3, 2, 2: at index 2 the map has three types, so I remove the 1 and left becomes 1; the window 2, 3 has length 2. Then 2 and 2 extend it to 2, 3, 2, 2: length 4. Edge: empty input, loop never runs, 0.&quot;</p>
            <p><strong>Complexity.</strong> &quot;O(n) time, because left and right each only move forward; O(1) space as the map never holds more than three entries.&quot; (LeetCode 904.)</p>
          </>
        }
      >
        <p>
          Trees stand in a row, and <code>fruits[i]</code> is the type of fruit on tree <code>i</code>. You pick fruit from a run of
          consecutive trees, and you have only two baskets, each holding one type. Return the largest number of fruits you can pick.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Mock interview: the smallest capacity that ships on time"
        level="Medium"
        examples={[
          { input: "weights = [1,2,3,4,5,6,7,8,9,10], days = 5", output: "15", why: "Day loads of [1,2,3,4,5], [6,7], [8], [9], [10] all fit within 15." },
          { input: "weights = [3,2,2,4,1,4], days = 3", output: "6", why: "[3,2], [2,4], [1,4] each total at most 6." },
          { input: "weights = [1,2,3,1,1], days = 4", output: "3", why: "[1,2], [3], [1,1]: capacity 3 is the minimum, and no package is heavier than that." },
        ]}
        hints={[
          <>Pattern from the wording: &quot;minimum capacity such that all packages ship within D days&quot;. What happens to feasibility as the capacity grows?</>,
          <>Once a capacity works, every larger capacity also works. That is a yes/no condition that flips once, so it can be binary searched.</>,
          <>What are the smallest and largest sensible capacities? How do you check one capacity in O(n)?</>,
        ]}
        approaches={[
          {
            name: "Brute force: try each capacity upward",
            idea: <p>Start at the heaviest package (a smaller capacity could never carry it) and test each capacity in turn: load packages in order, start a new day when the next one does not fit, and count the days.</p>,
            code: `function daysNeeded(weights, capacity) {
  let days = 1, load = 0;
  for (const w of weights) {
    if (load + w > capacity) { days++; load = 0; }   // this package starts a new day
    load += w;
  }
  return days;
}

function shipWithinDays(weights, days) {
  const heaviest = Math.max(...weights);
  const total = weights.reduce((a, b) => a + b, 0);
  for (let capacity = heaviest; capacity <= total; capacity++) {
    if (daysNeeded(weights, capacity) <= days) return capacity;
  }
  return total;
}

console.log(shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)); // 15
console.log(shipWithinDays([3, 2, 2, 4, 1, 4], 3));              // 6
console.log(shipWithinDays([1, 2, 3, 1, 1], 4));                 // 3`,
            explain: <p>Up to (sum − max) capacities, each tested in O(n): O(n × sum). Far too slow when the weights are large, but it defines the exact answer that the faster version must match.</p>,
          },
          {
            name: "Binary search on the capacity",
            idea: <p>The answer lies between the heaviest package and the total weight. Check the middle capacity: if it ships on time, the answer is this or smaller; otherwise it must be larger. Keep the smallest capacity that works.</p>,
            code: `function daysNeeded(weights, capacity) {
  let days = 1, load = 0;
  for (const w of weights) {
    if (load + w > capacity) { days++; load = 0; }
    load += w;
  }
  return days;
}

function shipWithinDays(weights, days) {
  let low = Math.max(...weights);                       // anything smaller cannot carry the heaviest package
  let high = weights.reduce((a, b) => a + b, 0);        // everything in one day always works
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (daysNeeded(weights, mid) <= days) high = mid;   // mid works: try smaller, but keep mid as a candidate
    else low = mid + 1;                                 // mid fails: the answer is larger
  }
  return low;
}

console.log(shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)); // 15
console.log(shipWithinDays([3, 2, 2, 4, 1, 4], 3));              // 6
console.log(shipWithinDays([1, 2, 3, 1, 1], 4));                 // 3`,
            explain: <p>O(n log(sum − max)) time, O(1) space. About log₂(sum) rounds, each an O(n) feasibility check. The loop uses <code>low &lt; high</code> with <code>high = mid</code>, so it always shrinks and ends with <code>low === high</code> as the smallest working capacity.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Recognise.</strong> &quot;<em>Minimum</em> capacity such that something <em>still works</em>. The answer is itself a number in a range, and if capacity c is enough then c + 1 is also enough. That monotonic yes/no behaviour is the signal for binary search on the answer, lesson 29. The check is a simple greedy loading simulation.&quot;</p>
            <p><strong>Clarify.</strong> &quot;Packages must be loaded in the given order, and each day&apos;s load is a contiguous group? Can a package be split? Can the number of days exceed the number of packages? How big are the weights and the array?&quot; (Suppose: order fixed, no splitting, 1 ≤ days ≤ n ≤ 50,000, weights up to 500.)</p>
            <p><strong>Plan.</strong> &quot;Brute force: try capacities from the heaviest package upward, O(n × sum). The key observation is the monotonic property, so I can halve the range each time. The lower bound is the heaviest single package, the upper bound is the sum of all weights. For a candidate capacity I simulate: load in order and start a new day when the next package does not fit. If the days needed are within the limit, the capacity works.&quot;</p>
            <p><strong>Code and test.</strong> &quot;A helper <code>daysNeeded</code>, then the binary search with <code>low &lt; high</code>. If mid works, I set high to mid, not mid minus 1, because mid itself may be the answer. Test on 3, 2, 2, 4, 1, 4 with 3 days: low 4, high 16, mid 10 needs 2 days, so high 10; mid 7 needs 3 days, high 7; mid 5 needs 4 days, so low 6; mid 6 needs 3 days, so high 6; stop with 6. Matches the expected answer.&quot;</p>
            <p><strong>Complexity.</strong> &quot;O(n log S), where S is the sum of the weights, and O(1) extra space.&quot; (LeetCode 1011.)</p>
          </>
        }
      >
        <p>
          A conveyor belt carries packages with the given <code>weights</code>, which must be shipped in order within <code>days</code> days.
          Each day the ship is loaded in order, without exceeding its weight capacity. Return the least capacity that ships every package within{" "}
          <code>days</code> days.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Mock interview: the fewest coins"
        level="Medium"
        examples={[
          { input: "coins = [1,2,5], amount = 11", output: "3", why: "5 + 5 + 1." },
          { input: "coins = [2], amount = 3", output: "-1", why: "No combination of 2s makes 3." },
          { input: "coins = [1,3,4], amount = 6", output: "2", why: "3 + 3. Greedy (take the biggest first) would take 4 + 1 + 1 = three coins." },
        ]}
        hints={[
          <>Pattern from the wording: &quot;fewest&quot; and &quot;any number of each coin&quot;. Does always taking the largest coin work? Try [1,3,4] with 6.</>,
          <>If the last coin used is c, the rest of the amount is <code>amount - c</code>. What does that say about the answer for smaller amounts?</>,
          <>Define <code>best[a]</code> as the fewest coins for amount a. Write it in terms of <code>best[a - coin]</code>.</>,
        ]}
        approaches={[
          {
            name: "Top-down: recursion with memoisation",
            idea: <p>The fewest coins for <code>a</code> is 1 plus the best of the fewest coins for <code>a - c</code> over every coin c. Cache each amount so it is computed once.</p>,
            code: `function coinChange(coins, amount) {
  const memo = new Map();
  function fewest(a) {
    if (a === 0) return 0;
    if (a < 0) return Infinity;                 // overshot: this path is impossible
    if (memo.has(a)) return memo.get(a);
    let best = Infinity;
    for (const c of coins) best = Math.min(best, 1 + fewest(a - c));
    memo.set(a, best);
    return best;
  }
  const answer = fewest(amount);
  return answer === Infinity ? -1 : answer;
}

console.log(coinChange([1, 2, 5], 11)); // 3
console.log(coinChange([2], 3));        // -1
console.log(coinChange([1, 3, 4], 6));  // 2
console.log(coinChange([1], 0));        // 0`,
            explain: <p>Without the memo the recursion explores an exponential number of paths. With it there are <code>amount + 1</code> states and <code>coins.length</code> steps each: O(amount × coins) time, O(amount) space. The recursion depth can reach the amount, which matters if amount is large.</p>,
          },
          {
            name: "Bottom-up: fill a table",
            idea: <p>Build <code>best[0..amount]</code> from the smallest amount: <code>best[0] = 0</code>, and each other amount is 1 plus the minimum of <code>best[a - c]</code> over coins that fit.</p>,
            code: `function coinChange(coins, amount) {
  const best = new Array(amount + 1).fill(Infinity);
  best[0] = 0;                                  // zero coins make amount zero
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a) best[a] = Math.min(best[a], best[a - c] + 1);
    }
  }
  return best[amount] === Infinity ? -1 : best[amount];
}

console.log(coinChange([1, 2, 5], 11)); // 3
console.log(coinChange([2], 3));        // -1
console.log(coinChange([1, 3, 4], 6));  // 2
console.log(coinChange([1], 0));        // 0`,
            explain: <p>The same O(amount × coins) time and O(amount) space, with no recursion, so no stack-depth risk. Dry run on <code>[1,3,4]</code>, 6: best = [0,1,2,1,1,2,2]. For a = 6: via coin 3 → best[3] + 1 = 2, via 4 → best[2] + 1 = 3, via 1 → best[5] + 1 = 3; minimum 2.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Recognise.</strong> &quot;<em>Fewest</em> coins, unlimited supply, an exact amount: an optimisation over choices where the same smaller amounts come up repeatedly. That smells like dynamic programming, lesson 55. First let me rule out greedy: with coins 1, 3, 4 and amount 6, taking the largest coin first gives 4 + 1 + 1 = three coins, but 3 + 3 is two. So greedy is wrong, and I need to consider every coin.&quot;</p>
            <p><strong>Clarify.</strong> &quot;Is the supply of each coin unlimited? What should I return when the amount cannot be made? What about amount zero? How large can the amount be?&quot; (Suppose: unlimited, -1 if impossible, 0 for amount 0, amount up to 10,000.)</p>
            <p><strong>Plan.</strong> &quot;Brute force: try every combination recursively, exponential. The state is just the remaining amount, and the choice is the last coin. So best of a equals 1 plus the minimum of best of a minus c over the coins. There are only amount plus one distinct states, so either memoise the recursion, or fill a table from 0 upward. With amounts up to 10,000 I prefer the table, because deep recursion in JavaScript can be risky.&quot;</p>
            <p><strong>Code and test.</strong> &quot;An array of size amount plus one filled with Infinity, best at zero is zero. For each amount and each coin that fits, take the minimum. At the end, if it is still Infinity, return -1. Test: coins 2, amount 3: best[1] is Infinity, best[2] is 1, best[3] is best[1] plus 1, still Infinity, so -1. Coins 1, 3, 4 with 6 gives 2 as traced earlier. Amount 0 gives 0.&quot;</p>
            <p><strong>Complexity.</strong> &quot;Time O(amount × number of coins), space O(amount).&quot; (LeetCode 322.)</p>
          </>
        }
      >
        <p>
          You are given coin values <code>coins</code> (you have an unlimited supply of each) and a target <code>amount</code>. Return the fewest
          coins that add up to exactly <code>amount</code>, or <code>-1</code> if it is impossible.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Mock interview: the k most frequent elements (two patterns in one)"
        level="Medium"
        examples={[
          { input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]", why: "1 appears three times, 2 appears twice, 3 once." },
          { input: "nums = [1], k = 1", output: "[1]", why: "A single element." },
          { input: "nums = [4,4,4,6,6,7,7,7,7], k = 1", output: "[7]", why: "7 appears four times, more than any other value." },
        ]}
        hints={[
          <>Pattern from the wording: &quot;how often&quot; means counting. Which structure counts any kind of value?</>,
          <>Once you have counts, the task is &quot;take the k largest by count&quot;. What are the ways to do that: sort, heap, or buckets?</>,
          <>A value can occur at most n times. Could you use the count itself as an index into an array?</>,
        ]}
        approaches={[
          {
            name: "Count, then sort by frequency",
            idea: <p>Count with a Map, turn the entries into an array, sort it by count in descending order, and take the first k values.</p>,
            code: `function topKFrequent(nums, k) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])          // highest count first
    .slice(0, k)
    .map(([value]) => value);
}

console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2));          // [ 1, 2 ]
console.log(topKFrequent([1], 1));                          // [ 1 ]
console.log(topKFrequent([4, 4, 4, 6, 6, 7, 7, 7, 7], 1)); // [ 7 ]`,
            explain: <p>O(n) to count plus O(u log u) to sort the u distinct values, which is O(n log n) in the worst case. O(u) space. Simple and often good enough.</p>,
          },
          {
            name: "Count, then bucket by frequency",
            idea: <p>A count is between 1 and n. Make an array of n + 1 buckets; put each value in the bucket numbered by its count. Walk the buckets from the highest to the lowest, collecting values until you have k.</p>,
            code: `function topKFrequent(nums, k) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);

  const buckets = Array.from({ length: nums.length + 1 }, () => []);   // buckets[f] = values that appear f times
  for (const [value, f] of counts) buckets[f].push(value);

  const result = [];
  for (let f = buckets.length - 1; f >= 1 && result.length < k; f--) {
    for (const value of buckets[f]) {
      if (result.length < k) result.push(value);
    }
  }
  return result;
}

console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2));          // [ 1, 2 ]
console.log(topKFrequent([1], 1));                          // [ 1 ]
console.log(topKFrequent([4, 4, 4, 6, 6, 7, 7, 7, 7], 1)); // [ 7 ]`,
            explain: <p>O(n) time and O(n) space: counting is one pass, bucketing visits each distinct value once, and the scan visits at most n + 1 buckets. Use <code>Array.from</code> with a function so every bucket is a separate array (lesson 59).</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Recognise.</strong> &quot;This has two parts. <em>How often does each value appear</em> is a frequency map, lesson 27. <em>The k most</em> is a top-k selection, which could use a heap (lesson 46), a sort, or buckets. I will state all three options with their costs and choose.&quot;</p>
            <p><strong>Clarify.</strong> &quot;Is the answer unique, or what if there is a tie at the k-th place? Can I return the values in any order? Is k always at most the number of distinct values? How large is the array?&quot; (Suppose: the answer is unique, any order, 1 ≤ k ≤ distinct count, n up to 100,000.)</p>
            <p><strong>Plan.</strong> &quot;Count with a Map in O(n). Then: sorting the entries is O(u log u), where u is the distinct count; a min-heap of size k is O(u log k), good when k is small; buckets indexed by frequency give O(n) overall, because no value can appear more than n times. I would start by writing the sort version since it is shortest and correct, mention the heap, and then offer the buckets if you want linear time.&quot;</p>
            <p><strong>Code and test.</strong> &quot;For the bucket version I make n plus one empty arrays with <code>Array.from</code>, not <code>fill</code>, so they do not share one array. Test on 1, 1, 1, 2, 2, 3 with k = 2: counts 1→3, 2→2, 3→1; buckets[3] = [1], buckets[2] = [2], buckets[1] = [3]. Walking from the top I collect 1 and 2 and stop. A single element returns that element.&quot;</p>
            <p><strong>Complexity.</strong> &quot;Buckets: O(n) time and O(n) space. Sorting: O(n log n) time, O(u) space. Heap: O(n log k) time, O(u) space.&quot; (LeetCode 347.)</p>
          </>
        }
      >
        <p>
          Given an integer array <code>nums</code> and an integer <code>k</code>, return the <code>k</code> most frequent elements. You may
          return the answer in any order. Assume the answer is unique.
        </p>
      </Problem>
    </>
  );
}
