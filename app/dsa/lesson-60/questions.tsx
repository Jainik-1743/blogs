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
          { input: "nums = [1,1,1], k = 2", output: "2", why: "The subarray [1,1] at positions 0–1, and the subarray [1,1] at positions 1–2." },
          { input: "nums = [1,2,3], k = 3", output: "2", why: "[1,2] and [3]." },
          { input: "nums = [1,-1,0], k = 0", output: "3", why: "[1,-1], [0] and [1,-1,0]. Negative numbers are allowed." },
        ]}
        hints={[
          <>Pattern from the words: &quot;contiguous&quot; (no gaps) and &quot;sum&quot;. There are two ideas: a sliding window, or prefix sums (running totals). Which one can negative numbers break?</>,
          <>A subarray from i+1 to j has the sum <code>prefix[j] - prefix[i]</code>. For a fixed j, which earlier prefix value are you looking for?</>,
          <>How many times has that earlier prefix value appeared? A Map can keep that count.</>,
        ]}
        approaches={[
          {
            name: "Brute force: every start, every end",
            idea: <p>For each start index, move the end one step at a time and keep a running sum. Add 1 to the count each time the sum equals <code>k</code>.</p>,
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
            explain: <p>O(n²) time, O(1) memory. Do not stop at the first match. With negatives and zeros, a longer subarray can also add up to <code>k</code>.</p>,
          },
          {
            name: "Prefix sums with a Map",
            idea: <p>Keep a running total called <code>prefix</code>. A subarray that ends here adds up to <code>k</code> exactly when some earlier prefix equals <code>prefix - k</code>. Store how many times each prefix has appeared. Start the Map with prefix 0 appearing once (the empty start).</p>,
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
            explain: <p>O(n) time, O(n) memory. Dry run (follow the code by hand) on <code>[1,-1,0]</code>, k = 0. The Map starts as {"{0:1}"}. x = 1: prefix 1, look up 1 → 0 found, store 1. x = -1: prefix 0, look up 0 → 1 found (count is 1), store 0 (it has now appeared twice). x = 0: prefix 0, look up 0 → 2 found (count is 3). The answer is 3.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Spot the pattern (from the words only).</strong> &quot;<em>Contiguous</em> plus <em>sum equals k</em> makes me think of two ideas: a sliding window, or prefix sums. A window works when adding an element can only make the sum bigger, because then I know when to shrink it. This problem allows negative numbers, so that breaks and I cannot use a window. Also, I must <em>count</em> all such subarrays, and not find the longest one. That fits prefix sums with a hash map, as in lesson 20.&quot;</p>
            <p><strong>Clarify.</strong> &quot;Can the numbers be negative or zero? Is the answer small enough for a normal number? How long can the array be? Is an empty subarray counted?&quot; (Suppose the answers are: yes to negatives and zeros, up to 20,000 elements, and subarrays cannot be empty.)</p>
            <p><strong>Plan.</strong> &quot;Brute force: try all pairs of start and end with a running sum. That is O(n²). It would pass for 20,000, but I can do better. A subarray from i+1 to j has the sum prefix[j] minus prefix[i]. So for each j I need the number of earlier prefixes equal to prefix[j] minus k. A map from prefix value to count gives me that in O(1).&quot;</p>
            <p><strong>Code and test.</strong> &quot;The map starts with 0 mapped to 1. This stands for the empty prefix, so a subarray that starts at index 0 is found. For each element I update the prefix, add the count for prefix minus k, and then record the prefix. I do the lookup before the store, so a subarray cannot be empty. Test on 1, -1, 0 with k = 0: the count goes 0, then 1, then 3. And 3 is the expected answer.&quot;</p>
            <p><strong>Complexity.</strong> &quot;O(n) time and O(n) memory for the map. A window would use O(1) memory, but it would be wrong with negatives.&quot; (LeetCode 560.)</p>
          </>
        }
      >
        <p>
          Given an array of integers <code>nums</code> (it may contain negative numbers and zeros) and an integer <code>k</code>, return
          the total number of contiguous subarrays (pieces with no gaps) whose sum equals <code>k</code>.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Mock interview: the longest stretch with at most two kinds of fruit"
        level="Medium"
        examples={[
          { input: "fruits = [1,2,1]", output: "3", why: "All three trees work, because there are only types 1 and 2." },
          { input: "fruits = [0,1,2,2]", output: "3", why: "[1,2,2] is the longest stretch with two types." },
          { input: "fruits = [1,2,3,2,2]", output: "4", why: "[2,3,2,2]: types 2 and 3." },
        ]}
        hints={[
          <>Pattern from the words: &quot;longest&quot;, &quot;consecutive&quot; and &quot;at most two different kinds&quot;. This is a sliding window whose size can change.</>,
          <>What do you need to know about the window at any moment? How many different kinds it holds, and how many of each kind.</>,
          <>When a third kind comes in, what do you do with the left edge until only two kinds are left?</>,
        ]}
        approaches={[
          {
            name: "Brute force: try every start",
            idea: <p>For each start tree, walk to the right and keep the different types in a Set. Stop when a third type appears. Keep the longest stretch.</p>,
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
            explain: <p>O(n²) time in the worst case (a long run of two types), O(1) memory because the Set never holds more than 3 values. It is correct, but it repeats a lot of work.</p>,
          },
          {
            name: "Variable sliding window with counts",
            idea: <p>Move the right edge forward. Keep a Map from type to count for the window. When the Map has more than two types, move the left edge to the right. Lower the counts, and delete a type when its count reaches zero. After each step the window is valid, so record its length.</p>,
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
            explain: <p>O(n) time, because each index enters the window once and leaves at most once. O(1) memory, because the Map holds at most 3 types. The delete when a count reaches zero is important. Without it, <code>counts.size</code> would never go down.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Spot the pattern.</strong> &quot;The words are <em>longest</em>, <em>consecutive</em> trees, and a limit on the number of <em>different</em> kinds: at most two. This is the sliding window with a changing size from lesson 23, with a count map to track the kinds. In the last problem, negative numbers broke the window. Here the window only holds counts that are zero or more, so it is safe to shrink it.&quot;</p>
            <p><strong>Clarify.</strong> &quot;So I must pick a stretch with no gaps, and I can hold only two types? Can the array be empty? How long can it be? Are the types small integers?&quot; (Suppose the answers are: empty returns 0, n up to 100,000.)</p>
            <p><strong>Plan.</strong> &quot;Brute force: from every start, go on until a third type appears. That is O(n²), which is too slow for 100,000. The wasted work is that when I move the start by one, I scan almost the same stretch again. A window keeps its state instead. I grow it to the right. When there are three types, I shrink it from the left until there are two again.&quot;</p>
            <p><strong>Code and test.</strong> &quot;I use a map of counts, and left starts at zero. For each right index I add the fruit. While the map has more than two entries, I remove one fruit from the left. When a count reaches zero, I delete the key. Then I update the best length. Test on 1, 2, 3, 2, 2: at index 2 the map has three types, so I remove the 1 and left becomes 1. The window 2, 3 has length 2. Then 2 and 2 make it 2, 3, 2, 2, with length 4. Edge case: empty input, the loop never runs, the answer is 0.&quot;</p>
            <p><strong>Complexity.</strong> &quot;O(n) time, because left and right only move forward. O(1) memory, because the map never holds more than three entries.&quot; (LeetCode 904.)</p>
          </>
        }
      >
        <p>
          Trees stand in a row, and <code>fruits[i]</code> is the type of fruit on tree <code>i</code>. You pick fruit from a run of
          trees next to each other. You have only two baskets, and each basket holds one type. Return the largest number of fruits you can pick.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Mock interview: the smallest capacity that ships on time"
        level="Medium"
        examples={[
          { input: "weights = [1,2,3,4,5,6,7,8,9,10], days = 5", output: "15", why: "The loads for the days are [1,2,3,4,5], [6,7], [8], [9], [10]. All fit within 15." },
          { input: "weights = [3,2,2,4,1,4], days = 3", output: "6", why: "[3,2], [2,4] and [1,4] each add up to 6 or less." },
          { input: "weights = [1,2,3,1,1], days = 4", output: "3", why: "[1,2], [3], [1,1]. Capacity 3 is the smallest that works, and no package is heavier than 3." },
        ]}
        hints={[
          <>Pattern from the words: &quot;smallest capacity so that all packages ship within D days&quot;. What happens to &quot;is it possible?&quot; as the capacity grows?</>,
          <>Once a capacity works, every bigger capacity works too. The answer to &quot;does it work?&quot; changes from no to yes only once. So you can use binary search (keep cutting the range in half).</>,
          <>What are the smallest and the largest sensible capacities? How can you check one capacity in O(n) time?</>,
        ]}
        approaches={[
          {
            name: "Brute force: try each capacity, going up",
            idea: <p>Start at the heaviest package (a smaller capacity could never carry it) and test each capacity in turn. Load the packages in order. Start a new day when the next package does not fit. Then count the days.</p>,
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
            explain: <p>There are up to (sum − max) capacities, and each one takes O(n) to test, so the time is O(n × sum). It is far too slow when the weights are large. But it gives the exact answer that the faster version must match.</p>,
          },
          {
            name: "Binary search on the capacity",
            idea: <p>The answer is between the heaviest package and the total weight. Check the middle capacity. If it ships on time, the answer is this capacity or a smaller one. If not, the answer must be bigger. Keep the smallest capacity that works.</p>,
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
            explain: <p>O(n log(sum − max)) time, O(1) memory. There are about log₂(sum) rounds, and each round is an O(n) check. The loop uses <code>low &lt; high</code> with <code>high = mid</code>, so the range always gets smaller. It ends with <code>low === high</code>, which is the smallest capacity that works.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Spot the pattern.</strong> &quot;<em>Smallest</em> capacity so that something <em>still works</em>. The answer is itself a number in a range. If capacity c is enough, then c + 1 is also enough. When the answer changes from no to yes only once, it is a sign for binary search on the answer, lesson 29. The check is a simple loop that loads the packages and counts the days.&quot;</p>
            <p><strong>Clarify.</strong> &quot;Must the packages be loaded in the given order, so that each day&apos;s load is a group with no gaps? Can a package be split? Can the number of days be more than the number of packages? How big are the weights and the array?&quot; (Suppose the answers are: the order is fixed, no splitting, 1 ≤ days ≤ n ≤ 50,000, weights up to 500.)</p>
            <p><strong>Plan.</strong> &quot;Brute force: try capacities from the heaviest package upward. That is O(n × sum). The key point is that the answer changes from no to yes only once, so I can cut the range in half each time. The lowest value is the heaviest single package. The highest value is the sum of all weights. For one capacity, I act it out: load in order and start a new day when the next package does not fit. If the days needed are within the limit, the capacity works.&quot;</p>
            <p><strong>Code and test.</strong> &quot;I write a helper called <code>daysNeeded</code>, then the binary search with <code>low &lt; high</code>. If mid works, I set high to mid, and not to mid minus 1, because mid itself may be the answer. Test on 3, 2, 2, 4, 1, 4 with 3 days: low is 4 and high is 16. mid 10 needs 2 days, so high becomes 10. mid 7 needs 3 days, so high becomes 7. mid 5 needs 4 days, so low becomes 6. mid 6 needs 3 days, so high becomes 6. Then I stop with 6. This matches the expected answer.&quot;</p>
            <p><strong>Complexity.</strong> &quot;O(n log S), where S is the sum of the weights, and O(1) extra memory.&quot; (LeetCode 1011.)</p>
          </>
        }
      >
        <p>
          A conveyor belt carries packages with the given <code>weights</code>. They must be shipped in order within <code>days</code> days.
          Each day the ship is loaded in order, and the load must not go over the ship&apos;s weight capacity. Return the smallest capacity that ships every package within{" "}
          <code>days</code> days.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Mock interview: the fewest coins"
        level="Medium"
        examples={[
          { input: "coins = [1,2,5], amount = 11", output: "3", why: "5 + 5 + 1." },
          { input: "coins = [2], amount = 3", output: "-1", why: "You cannot make 3 from coins of 2." },
          { input: "coins = [1,3,4], amount = 6", output: "2", why: "3 + 3. A greedy method (always take the biggest coin first) would take 4 + 1 + 1 = three coins." },
        ]}
        hints={[
          <>Pattern from the words: &quot;fewest&quot; and &quot;any number of each coin&quot;. Does it work to always take the largest coin? Try [1,3,4] with 6.</>,
          <>If the last coin you use is c, the rest of the amount is <code>amount - c</code>. What does that tell you about the answer for smaller amounts?</>,
          <>Let <code>best[a]</code> be the fewest coins for amount a. Write it using <code>best[a - coin]</code>.</>,
        ]}
        approaches={[
          {
            name: "Top-down: recursion with saved answers (memoisation)",
            idea: <p>The fewest coins for <code>a</code> is 1 plus the smallest of the answers for <code>a - c</code>, over every coin c. Save the answer for each amount (this is called memoisation), so you work it out only once.</p>,
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
            explain: <p>Without saved answers, the recursion tries an exponential number of paths, which means the work doubles again and again. With them, there are <code>amount + 1</code> states and <code>coins.length</code> steps for each. That is O(amount × coins) time and O(amount) memory. The recursion can go as deep as the amount, which matters if the amount is large.</p>,
          },
          {
            name: "Bottom-up: fill a table from small to big",
            idea: <p>Build <code>best[0..amount]</code> from the smallest amount. <code>best[0] = 0</code>. Each other amount is 1 plus the smallest <code>best[a - c]</code> over the coins that fit.</p>,
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
            explain: <p>The time is the same O(amount × coins) and the memory is O(amount). There is no recursion, so there is no risk of running out of call stack. Dry run on <code>[1,3,4]</code>, 6: best = [0,1,2,1,1,2,2]. For a = 6: with coin 3 → best[3] + 1 = 2, with coin 4 → best[2] + 1 = 3, with coin 1 → best[5] + 1 = 3. The smallest is 2.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Spot the pattern.</strong> &quot;<em>Fewest</em> coins, unlimited supply, an exact amount. We must find the best choice, and the same smaller amounts come up again and again. That looks like dynamic programming, lesson 55. First let me rule out the greedy method. With coins 1, 3, 4 and amount 6, taking the largest coin first gives 4 + 1 + 1, which is three coins. But 3 + 3 is only two. So greedy is wrong, and I need to try every coin.&quot;</p>
            <p><strong>Clarify.</strong> &quot;Do I have unlimited coins of each value? What should I return when the amount cannot be made? What about amount zero? How big can the amount be?&quot; (Suppose the answers are: unlimited, -1 if impossible, 0 for amount 0, amount up to 10,000.)</p>
            <p><strong>Plan.</strong> &quot;Brute force: try every combination with recursion. That is exponential. The state is just the amount that is left, and the choice is the last coin. So best of a equals 1 plus the smallest best of a minus c, over the coins. There are only amount plus one different states. So I can either save the answers in the recursion (memoise), or fill a table from 0 upward. With amounts up to 10,000 I prefer the table, because deep recursion in JavaScript can be risky.&quot;</p>
            <p><strong>Code and test.</strong> &quot;I make an array of size amount plus one, filled with Infinity, and best at zero is zero. For each amount and each coin that fits, I take the smallest value. At the end, if the result is still Infinity, I return -1. Test: coins 2, amount 3. best[1] is Infinity, best[2] is 1, and best[3] is best[1] plus 1, which is still Infinity, so the answer is -1. Coins 1, 3, 4 with 6 gives 2, as we followed earlier. Amount 0 gives 0.&quot;</p>
            <p><strong>Complexity.</strong> &quot;Time O(amount × number of coins), memory O(amount).&quot; (LeetCode 322.)</p>
          </>
        }
      >
        <p>
          You are given coin values <code>coins</code> (you have unlimited coins of each value) and a target <code>amount</code>. Return the fewest
          coins that add up to exactly <code>amount</code>, or <code>-1</code> if it is impossible.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Mock interview: the k most frequent elements (two patterns in one)"
        level="Medium"
        examples={[
          { input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]", why: "1 appears three times, 2 appears twice, and 3 appears once." },
          { input: "nums = [1], k = 1", output: "[1]", why: "A single element." },
          { input: "nums = [4,4,4,6,6,7,7,7,7], k = 1", output: "[7]", why: "7 appears four times, which is more than any other value." },
        ]}
        hints={[
          <>Pattern from the words: &quot;how often&quot; means counting. Which data structure can count any kind of value?</>,
          <>Once you have the counts, the task is &quot;take the k biggest counts&quot;. What are the ways to do that: sort, heap, or buckets?</>,
          <>A value can appear at most n times. Could you use the count itself as an index in an array?</>,
        ]}
        approaches={[
          {
            name: "Count, then sort by frequency",
            idea: <p>Count with a Map. Turn the entries into an array. Sort it by count, from biggest to smallest. Take the first k values.</p>,
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
            explain: <p>O(n) to count, plus O(u log u) to sort the u different values. That is O(n log n) in the worst case. The memory is O(u). It is simple and often good enough.</p>,
          },
          {
            name: "Count, then bucket by frequency",
            idea: <p>A count is between 1 and n. Make an array of n + 1 buckets (small lists). Put each value in the bucket that has the same number as its count. Walk through the buckets from the highest to the lowest, and collect values until you have k.</p>,
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
            explain: <p>O(n) time and O(n) memory. Counting is one pass, bucketing visits each different value once, and the scan visits at most n + 1 buckets. Use <code>Array.from</code> with a function, so every bucket is its own separate array (lesson 59).</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Spot the pattern.</strong> &quot;This has two parts. <em>How often does each value appear</em> needs a frequency map, lesson 27. <em>The k most</em> is a top-k choice, which could use a heap (lesson 46), a sort, or buckets. I will say all three options with their costs, and then choose.&quot;</p>
            <p><strong>Clarify.</strong> &quot;Is the answer unique, or what if two values tie at place k? Can I return the values in any order? Is k always at most the number of different values? How big is the array?&quot; (Suppose the answers are: the answer is unique, any order, 1 ≤ k ≤ number of different values, n up to 100,000.)</p>
            <p><strong>Plan.</strong> &quot;I count with a Map in O(n). Then I have three choices. Sorting the entries is O(u log u), where u is the number of different values. A min-heap of size k is O(u log k), which is good when k is small. Buckets numbered by frequency give O(n) overall, because no value can appear more than n times. I would first write the sort version, because it is the shortest and correct. I would mention the heap. Then I would offer the buckets if you want linear time.&quot;</p>
            <p><strong>Code and test.</strong> &quot;For the bucket version I make n plus one empty arrays with <code>Array.from</code>, and not with <code>fill</code>, so the buckets do not share one array. Test on 1, 1, 1, 2, 2, 3 with k = 2. The counts are 1→3, 2→2, 3→1. So buckets[3] = [1], buckets[2] = [2], buckets[1] = [3]. I walk from the top, collect 1 and 2, and stop. A single element returns that element.&quot;</p>
            <p><strong>Complexity.</strong> &quot;Buckets: O(n) time and O(n) memory. Sorting: O(n log n) time, O(u) memory. Heap: O(n log k) time, O(u) memory.&quot; (LeetCode 347.)</p>
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
