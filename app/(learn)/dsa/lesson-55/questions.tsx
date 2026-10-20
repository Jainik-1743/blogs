import Problem from "@/components/dsa/Problem";

/** Lesson 55 practice questions: 1-D dynamic programming. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="House robber"
        level="Medium"
        examples={[
          { input: "nums = [1,2,3,1]", output: "4", why: "Rob house 0 (1) and house 2 (3): 1 + 3 = 4. They are not next to each other." },
          { input: "nums = [2,7,9,3,1]", output: "12", why: "Rob houses 0, 2 and 4: 2 + 9 + 1 = 12." },
        ]}
        hints={[
          <>Finish the sentence: &ldquo;best(i) is the most money from house i to the end.&rdquo;</>,
          <>For house i you either skip it or rob it. What is left to decide after each choice?</>,
          <>Each answer reads only the two before it. Do you need a whole array?</>,
        ]}
        approaches={[
          {
            name: "Recursion with memo (top-down)",
            idea: <p>Define <code>best(i)</code> as the most money from house <code>i</code> to the end. Either skip (<code>best(i + 1)</code>) or rob (<code>nums[i] + best(i + 2)</code>). Save each result in a cache. Without the cache the time is O(2<sup>n</sup>).</p>,
            code: `function rob(nums) {
  const memo = new Map();
  function best(i) {
    if (i >= nums.length) return 0;
    if (memo.has(i)) return memo.get(i);
    const result = Math.max(best(i + 1), nums[i] + best(i + 2));
    memo.set(i, result);
    return result;
  }
  return best(0);
}

console.log(rob([1, 2, 3, 1]));    // 4
console.log(rob([2, 7, 9, 3, 1])); // 12`,
            explain: <p>There are only n different values of <code>i</code>, and each is solved once. So the time and space are O(n). The recursion goes up to n levels deep.</p>,
          },
          {
            name: "Table (bottom-up)",
            idea: <p>Let <code>dp[i]</code> be the best total from the first <code>i</code> houses. <code>dp[0] = 0</code>, <code>dp[1] = nums[0]</code>, and <code>dp[i] = max(dp[i - 1], dp[i - 2] + nums[i - 1])</code>.</p>,
            code: `function rob(nums) {
  const n = nums.length;
  const dp = new Array(n + 1).fill(0);
  dp[1] = nums[0];
  for (let i = 2; i <= n; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i - 1]);
  }
  return dp[n];
}

console.log(rob([1, 2, 3, 1]));    // 4
console.log(rob([2, 7, 9, 3, 1])); // 12`,
            explain: <p>This uses the same formula, filled from left to right with no recursion. The time is O(n) and the space is O(n).</p>,
          },
          {
            name: "Two variables",
            idea: <p>Keep only <code>dp[i - 2]</code> and <code>dp[i - 1]</code>, in two variables called <code>twoBack</code> and <code>oneBack</code>. Move them forward at each step.</p>,
            code: `function rob(nums) {
  let twoBack = 0, oneBack = 0;
  for (const money of nums) {
    const current = Math.max(oneBack, twoBack + money);
    twoBack = oneBack;
    oneBack = current;
  }
  return oneBack;
}

console.log(rob([1, 2, 3, 1]));    // 4
console.log(rob([2, 7, 9, 3, 1])); // 12`,
            explain: <p>The time is O(n) and the space is O(1). Step by step on [1,2,3,1]: (0,0), then (0,1), (1,2), (2,4), (4,4). The answer is 4.</p>,
          },
        ]}
        compare={<p>Start with the memoised recursion to get the state right. Then change it to the two-variable loop. It is short, fast and uses a fixed amount of space. (LeetCode 198.)</p>}
      >
        <p>
          Houses in a row hold <code>nums[i]</code> money each. You cannot rob two houses that are next to each other. Return the most money you can rob.
        </p>
      </Problem>

      <Problem
        n={2}
        title="House robber II"
        level="Medium"
        examples={[
          { input: "nums = [2,3,2]", output: "3", why: "House 0 and house 2 are neighbours in the circle, so you cannot take both 2s. Take the 3." },
          { input: "nums = [1,2,3,1]", output: "4", why: "Rob house 0 (1) and house 2 (3). House 3 is next to house 0, so it is not used." },
        ]}
        hints={[
          <>The only new rule is that the first house and the last house are neighbours.</>,
          <>Any valid plan skips the first house, or skips the last house, or skips both.</>,
          <>Run the straight-row version twice, on two ranges, and take the larger answer. Watch out for the case with one house.</>,
        ]}
        approaches={[
          {
            name: "Two line problems",
            idea: <p>Take the better of two answers. One is robbing within <code>nums[0..n-2]</code> (last house left out). The other is robbing within <code>nums[1..n-1]</code> (first house left out). Solve each with the house-robber loop.</p>,
            code: `function robLine(nums, lo, hi) {
  let twoBack = 0, oneBack = 0;
  for (let i = lo; i <= hi; i++) {
    const current = Math.max(oneBack, twoBack + nums[i]);
    twoBack = oneBack;
    oneBack = current;
  }
  return oneBack;
}

function rob(nums) {
  if (nums.length === 1) return nums[0];
  return Math.max(robLine(nums, 0, nums.length - 2), robLine(nums, 1, nums.length - 1));
}

console.log(rob([2, 3, 2]));    // 3
console.log(rob([1, 2, 3, 1])); // 4
console.log(rob([5]));          // 5`,
            explain: <p>The two ranges together cover every valid plan. A plan that uses the first house cannot use the last house (range 1). Any other plan fits inside range 2. The time is O(n) and the space is O(1).</p>,
          },
          {
            name: "Memo with a flag",
            idea: <p>Recurse over <code>(i, tookFirst)</code>. If the first house was robbed, the last house is not allowed. This needs twice as many states, but the circle rule is kept inside the state itself.</p>,
            code: `function rob(nums) {
  const n = nums.length;
  if (n === 1) return nums[0];
  const memo = new Map();
  function best(i, tookFirst) {
    if (i >= n) return 0;
    if (i === n - 1 && tookFirst) return 0;     // the last house touches the first
    const key = i * 2 + (tookFirst ? 1 : 0);
    if (memo.has(key)) return memo.get(key);
    const skip = best(i + 1, tookFirst);
    const take = nums[i] + best(i + 2, tookFirst || i === 0);
    const result = Math.max(skip, take);
    memo.set(key, result);
    return result;
  }
  return best(0, false);
}

console.log(rob([2, 3, 2]));    // 3
console.log(rob([1, 2, 3, 1])); // 4
console.log(rob([5]));          // 5`,
            explain: <p>There are 2n states and each takes O(1), so the time and space are O(n). It is more flexible for other circle problems, but longer than the two-range trick.</p>,
          },
        ]}
        compare={<p>Use the two-range trick. Reuse the straight-row problem you already solved instead of inventing something new. Remember this idea: &ldquo;turn the new problem into one you already solved&rdquo;. (LeetCode 213.)</p>}
      >
        <p>
          This is the same as house robber, but the houses stand in a circle. The first and last houses are next to each other. Return the most money you can rob.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Coin change"
        level="Medium"
        examples={[
          { input: "coins = [1,2,5], amount = 11", output: "3", why: "5 + 5 + 1 = 11, which uses three coins." },
          { input: "coins = [2], amount = 3", output: "-1", why: "You cannot make 3 from coins of 2." },
          { input: "coins = [1], amount = 0", output: "0", why: "Zero coins make the amount zero." },
        ]}
        hints={[
          <>Greedy (always taking the biggest coin) fails for coins [1,3,4] and amount 6. Can you see why?</>,
          <>State: dp[a] is the fewest coins for exactly the amount a. Which coin was used last?</>,
          <>Use Infinity for &ldquo;impossible&rdquo;, and change it to -1 only at the end.</>,
        ]}
        approaches={[
          {
            name: "Recursion with memo",
            idea: <p><code>fewest(rest)</code> tries each coin and recurses on <code>rest - coin</code>. A negative remainder returns <code>Infinity</code> (you went over the amount). Save the results by remainder. Without the cache the time grows exponentially.</p>,
            code: `function coinChange(coins, amount) {
  const memo = new Map();
  function fewest(rest) {
    if (rest === 0) return 0;
    if (rest < 0) return Infinity;
    if (memo.has(rest)) return memo.get(rest);
    let best = Infinity;
    for (const coin of coins) best = Math.min(best, fewest(rest - coin) + 1);
    memo.set(rest, best);
    return best;
  }
  const answer = fewest(amount);
  return answer === Infinity ? -1 : answer;
}

console.log(coinChange([1, 2, 5], 11)); // 3
console.log(coinChange([2], 3));        // -1
console.log(coinChange([1], 0));        // 0`,
            explain: <p>There are at most <code>amount + 1</code> different remainders and each one tries every coin. The time is O(amount × coins) and the space is O(amount). For a big amount, the recursion can go thousands of calls deep.</p>,
          },
          {
            name: "Table (bottom-up)",
            idea: <p>Fill <code>dp[0..amount]</code> with <code>Infinity</code>, set <code>dp[0] = 0</code>, then for each amount, try every coin that fits.</p>,
            code: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log(coinChange([1, 2, 5], 11)); // 3
console.log(coinChange([2], 3));        // -1
console.log(coinChange([1], 0));        // 0`,
            explain: <p>This is the same formula, written as a loop. For [1,2,5] the table is 0, 1, 1, 2, 2, 1, 2, 2, 3, 3, 2, 3 for amounts 0 to 11. The time is O(amount × coins) and the space is O(amount). Never fill the table with <code>-1</code>, because <code>-1 + 1 = 0</code> would look like a great answer.</p>,
          },
        ]}
        compare={<p>The table is short and has no problem with deep recursion. The memo version is better when only a few amounts are ever reached. (LeetCode 322.)</p>}
      >
        <p>
          You are given coin values (you have as many coins of each value as you want) and a target <code>amount</code>. Return the fewest coins that make exactly that
          amount. Return <code>-1</code> if it cannot be made.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Decode ways"
        level="Medium"
        examples={[
          { input: 's = "12"', output: "2", why: "1|2 is AB, and 12 is L." },
          { input: 's = "226"', output: "3", why: "2|2|6 (BBF), 22|6 (VF) and 2|26 (BZ)." },
          { input: 's = "06"', output: "0", why: "A zero at the start cannot be decoded. There is no letter for 0 or for 06." },
        ]}
        hints={[
          <>State: dp[i] is the number of ways to decode the first i characters.</>,
          <>The last letter came from one digit or from two digits. When is each one allowed?</>,
          <>One digit must not be &ldquo;0&rdquo;. Two digits must make a number from 10 to 26.</>,
        ]}
        approaches={[
          {
            name: "Recursion with memo",
            idea: <p><code>ways(i)</code> counts the ways to decode the rest of the string, starting at <code>i</code>. If there is a <code>&quot;0&quot;</code> there, the answer is 0. Otherwise take one digit, and also take two digits if they make a number from 10 to 26.</p>,
            code: `function numDecodings(s) {
  const memo = new Map();
  function ways(i) {
    if (i === s.length) return 1;               // reached the end: one complete decoding
    if (s[i] === "0") return 0;
    if (memo.has(i)) return memo.get(i);
    let total = ways(i + 1);
    if (i + 1 < s.length && Number(s.slice(i, i + 2)) <= 26) total += ways(i + 2);
    memo.set(i, total);
    return total;
  }
  return ways(0);
}

console.log(numDecodings("12"));  // 2
console.log(numDecodings("226")); // 3
console.log(numDecodings("06"));  // 0`,
            explain: <p>When we reach the two-digit check, the first digit is not &ldquo;0&rdquo;, so the value is at least 10. The time and space are O(n).</p>,
          },
          {
            name: "Table with a rolling pair",
            idea: <p>Fill <code>dp[i]</code> from <code>dp[i - 1]</code> (the last digit alone) and <code>dp[i - 2]</code> (the last two digits). Then keep just two variables.</p>,
            code: `function numDecodings(s) {
  let twoBack = 0;   // dp[i - 2], unused until i = 2
  let oneBack = 1;   // dp[0] = 1: the empty prefix
  for (let i = 1; i <= s.length; i++) {
    let current = 0;
    if (s[i - 1] !== "0") current += oneBack;
    if (i >= 2) {
      const two = Number(s.slice(i - 2, i));
      if (two >= 10 && two <= 26) current += twoBack;
    }
    twoBack = oneBack;
    oneBack = current;
  }
  return oneBack;
}

console.log(numDecodings("12"));  // 2
console.log(numDecodings("226")); // 3
console.log(numDecodings("06"));  // 0`,
            explain: <p>At <code>i = 1</code> the two-digit case is skipped, and <code>twoBack</code> is set correctly by the end of that step. The time is O(n) and the space is O(1).</p>,
          },
        ]}
        compare={<p>Both are fine. Write the two-variable version once you trust the formula. It has the same shape as climbing stairs, with a validity check at each step. (LeetCode 91.)</p>}
      >
        <p>
          A message is written as digits with <code>A = 1, B = 2, &hellip;, Z = 26</code>. Given a string of digits, return the number of ways to decode it.
        </p>
      </Problem>

      <Problem
        n={5}
        title="Word break"
        level="Medium"
        examples={[
          { input: 's = "leetcode", wordDict = ["leet","code"]', output: "true", why: "leet + code." },
          { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: "true", why: "apple + pen + apple. A word can be used more than once." },
          { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: "false", why: "cats + and + og fails, and cat + sand + og fails. No word covers the last part, og." },
        ]}
        hints={[
          <>State: dp[i] is true when the first i characters can be split into words.</>,
          <>The last word is s[j..i). What must be true about j and about that slice of the string?</>,
          <>Put the dictionary into a Set so lookups are fast.</>,
        ]}
        approaches={[
          {
            name: "Recursion with memo",
            idea: <p><code>canBreak(start)</code> asks whether the rest of the string, from <code>start</code>, can be split. Try each end. If <code>s[start..end)</code> is a word and the rest works, the answer is true. Save the answer for each <code>start</code>. Failed tries are what make the plain recursion so slow.</p>,
            code: `function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const memo = new Map();
  function canBreak(start) {
    if (start === s.length) return true;
    if (memo.has(start)) return memo.get(start);
    let ok = false;
    for (let end = start + 1; end <= s.length && !ok; end++) {
      if (words.has(s.slice(start, end)) && canBreak(end)) ok = true;
    }
    memo.set(start, ok);
    return ok;
  }
  return canBreak(0);
}

console.log(wordBreak("leetcode", ["leet", "code"]));                       // true
console.log(wordBreak("applepenapple", ["apple", "pen"]));                  // true
console.log(wordBreak("catsandog", ["cats", "dog", "sand", "and", "cat"])); // false`,
            explain: <p>There are n starting points, and each tries up to n ends with a slice. That is O(n²) slices, or about O(n³) work on characters. Without the memo, a string like <code>&quot;aaaa...ab&quot;</code> with the word <code>&quot;a&quot;</code> repeats the same failing end part an enormous number of times.</p>,
          },
          {
            name: "Table (bottom-up)",
            idea: <p><code>dp[i]</code> is true if some <code>j &lt; i</code> has <code>dp[j]</code> true and <code>s[j..i)</code> is in the dictionary. We can limit <code>j</code> to the length of the longest word.</p>,
            code: `function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const longest = Math.max(...wordDict.map((w) => w.length));
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (let j = Math.max(0, i - longest); j < i; j++) {
      if (dp[j] && words.has(s.slice(j, i))) { dp[i] = true; break; }
    }
  }
  return dp[s.length];
}

console.log(wordBreak("leetcode", ["leet", "code"]));                       // true
console.log(wordBreak("applepenapple", ["apple", "pen"]));                  // true
console.log(wordBreak("catsandog", ["cats", "dog", "sand", "and", "cat"])); // false`,
            explain: <p>There are O(n × L) slices, where L is the length of the longest word. The space is O(n). For "leetcode": dp[4] = true (leet). dp[8] = true because dp[4] is true and "code" is a word.</p>,
          },
        ]}
        compare={<p>Either one is accepted. The table is easier to think about, and the longest-word limit is a cheap way to go faster. (LeetCode 139.)</p>}
      >
        <p>
          Given a string <code>s</code> and a list of words, return <code>true</code> if <code>s</code> can be split into one or more
          dictionary words in a row. A word can be used more than once.
        </p>
      </Problem>

      <Problem
        n={6}
        title="Longest increasing subsequence"
        level="Medium"
        examples={[
          { input: "nums = [10,9,2,5,3,7,101,18]", output: "4", why: "One longest chain is 2, 3, 7, 101 (or 2, 5, 7, 18)." },
          { input: "nums = [0,1,0,3,2,3]", output: "4", why: "0, 1, 2, 3." },
          { input: "nums = [7,7,7,7]", output: "1", why: "The chain must be strictly increasing, so equal values cannot be added to it." },
        ]}
        hints={[
          <>A subsequence skips some items but keeps the order. Try to define dp[i] as the best chain that ends exactly at i.</>,
          <>To end at i, look at every j before it where nums[j] &lt; nums[i].</>,
          <>The answer is the largest dp[i], not dp[n - 1].</>,
        ]}
        approaches={[
          {
            name: "Take or skip with memo",
            idea: <p><code>best(i, prev)</code> is the longest chain you can make from item <code>i</code> onward, when the last kept position is <code>prev</code>. Either skip item i, or keep it if it is larger than <code>nums[prev]</code>. Save the answers by <code>(i, prev)</code>.</p>,
            code: `function lengthOfLIS(nums) {
  const n = nums.length;
  const memo = new Map();
  function best(i, prev) {                       // prev = -1 means nothing kept yet
    if (i === n) return 0;
    const key = i * (n + 1) + (prev + 1);
    if (memo.has(key)) return memo.get(key);
    let result = best(i + 1, prev);              // skip i
    if (prev === -1 || nums[prev] < nums[i]) {
      result = Math.max(result, 1 + best(i + 1, i));  // keep i
    }
    memo.set(key, result);
    return result;
  }
  return best(0, -1);
}

console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log(lengthOfLIS([0, 1, 0, 3, 2, 3]));           // 4
console.log(lengthOfLIS([7, 7, 7, 7]));                  // 1`,
            explain: <p>Without the memo, the recursion tries all 2<sup>n</sup> subsequences. With the memo there are O(n²) states and each takes O(1). So the time and space are O(n²).</p>,
          },
          {
            name: "dp[i] = best chain ending at i",
            idea: <p>Every item starts as a chain of length 1. For each earlier, smaller <code>nums[j]</code>, set <code>dp[i] = max(dp[i], dp[j] + 1)</code>. Return the biggest value in the table.</p>,
            code: `function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1);
  let best = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    best = Math.max(best, dp[i]);
  }
  return best;
}

console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log(lengthOfLIS([0, 1, 0, 3, 2, 3]));           // 4
console.log(lengthOfLIS([7, 7, 7, 7]));                  // 1`,
            explain: <p>The time is O(n²) and the space is O(n). For [10,9,2,5,3,7,101,18] the table is 1, 1, 1, 2, 2, 3, 4, 4. A method with binary search gets O(n log n). See lesson 57.</p>,
          },
        ]}
        compare={<p>Use the &ldquo;ends at i&rdquo; table. It is simple and fine for n up to a few thousand. If n reaches 10<sup>5</sup>, you need the O(n log n) method in lesson 57. (LeetCode 300.)</p>}
      >
        <p>
          Given an array of whole numbers, return the length of the longest strictly increasing subsequence (every number is bigger than the one before).
        </p>
      </Problem>

      <Problem
        n={7}
        title="Maximum product subarray"
        level="Medium"
        examples={[
          { input: "nums = [2,3,-2,4]", output: "6", why: "The subarray [2,3] has product 6." },
          { input: "nums = [-2,0,-1]", output: "0", why: "Any subarray that includes the 0 gives 0. [-2] and [-1] are negative." },
          { input: "nums = [-2,3,-4]", output: "24", why: "Take the whole array: (-2) × 3 × (-4) = 24. Two negative numbers multiply to a positive number." },
        ]}
        hints={[
          <>Try the max-sum idea: the best product ending at i. What goes wrong?</>,
          <>A very negative product can become the largest after you multiply it by another negative number. So also keep track of the smallest product ending at i.</>,
          <>At each item there are three choices: the item alone, max × item, or min × item.</>,
        ]}
        approaches={[
          {
            name: "Brute force over all subarrays",
            idea: <p>For each start position, move the end forward while you multiply a running product. Remember the largest product.</p>,
            code: `function maxProduct(nums) {
  let best = -Infinity;
  for (let start = 0; start < nums.length; start++) {
    let product = 1;
    for (let end = start; end < nums.length; end++) {
      product *= nums[end];
      best = Math.max(best, product);
    }
  }
  return best;
}

console.log(maxProduct([2, 3, -2, 4])); // 6
console.log(maxProduct([-2, 0, -1]));   // 0
console.log(maxProduct([-2, 3, -4]));   // 24`,
            explain: <p>The time is O(n²) and the space is O(1). It is correct, but too slow for large inputs.</p>,
          },
          {
            name: "Track the max and the min ending here",
            idea: <p>Keep <code>curMax</code> and <code>curMin</code>. These are the largest and smallest products of a subarray that ends at the current item. A negative number swaps their roles. So the new values come from the item alone, <code>curMax * x</code> and <code>curMin * x</code>.</p>,
            code: `function maxProduct(nums) {
  let curMax = nums[0], curMin = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    const a = curMax * x, b = curMin * x;
    curMax = Math.max(x, a, b);              // start fresh at x, or extend
    curMin = Math.min(x, a, b);
    best = Math.max(best, curMax);
  }
  return best;
}

console.log(maxProduct([2, 3, -2, 4])); // 6
console.log(maxProduct([-2, 0, -1]));   // 0
console.log(maxProduct([-2, 3, -4]));   // 24`,
            explain: <p>On [-2,3,-4]: after -2 the pair is (-2,-2). At 3 it is (3,-6). At -4 it is (24,-12), so the answer is 24. A zero resets both to 0, and the next item starts fresh. The time is O(n) and the space is O(1).</p>,
          },
        ]}
        compare={<p>The max and min pair is the expected answer. You need the min only because a negative number can flip it into the next maximum. (LeetCode 152.)</p>}
      >
        <p>
          Given an array of whole numbers, find the subarray (one unbroken piece, at least one item) with the largest product, and return that product.
        </p>
      </Problem>
    </>
  );
}
