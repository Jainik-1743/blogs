import Problem from "@/components/dsa/Problem";

/** Lesson 47 practice questions: greedy algorithms. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Assign cookies"
        level="Easy"
        examples={[
          { input: "g = [1, 2, 3], s = [1, 1]", output: "1", why: "Only the child with greed 1 can be satisfied; both cookies are size 1." },
          { input: "g = [1, 2], s = [1, 2, 3]", output: "2", why: "Cookie 1 satisfies greed 1 and cookie 2 satisfies greed 2; cookie 3 is left over." },
        ]}
        hints={[
          <>Should the biggest cookie go to the child with the biggest greed, or is that wasteful?</>,
          <>Sort both lists. The least greedy child is the easiest to satisfy, so serve them first.</>,
        ]}
        approaches={[
          {
            name: "Brute force: best-fitting cookie for each child",
            idea: <p>Go through the children from least to most greedy. For each, search all unused cookies for the smallest one that is big enough and use it.</p>,
            code: `function findContentChildren(g, s) {
  const children = [...g].sort((a, b) => a - b);
  const used = new Array(s.length).fill(false);
  let happy = 0;
  for (const greed of children) {
    let pick = -1;
    for (let j = 0; j < s.length; j++) {
      if (!used[j] && s[j] >= greed && (pick === -1 || s[j] < s[pick])) pick = j;
    }
    if (pick !== -1) { used[pick] = true; happy++; }
  }
  return happy;
}

console.log(findContentChildren([1, 2, 3], [1, 1])); // 1
console.log(findContentChildren([1, 2], [1, 2, 3])); // 2`,
            explain: <p>Correct but the inner search makes it O(n · m) after the sort.</p>,
          },
          {
            name: "Greedy: two sorted lists, one pass",
            idea: <p>Sort both. Walk the cookies from smallest to largest; if the current cookie satisfies the next unsatisfied child, count them and move on to the next child. Either way the cookie is finished with.</p>,
            code: `function findContentChildren(g, s) {
  g = [...g].sort((a, b) => a - b);
  s = [...s].sort((a, b) => a - b);
  let child = 0;
  for (const cookie of s) {
    if (child < g.length && cookie >= g[child]) child++;
  }
  return child;
}

console.log(findContentChildren([1, 2, 3], [1, 1])); // 1
console.log(findContentChildren([1, 2], [1, 2, 3])); // 2
console.log(findContentChildren([], [5]));           // 0`,
            explain: <p>A cookie too small for the least greedy waiting child is too small for everyone else waiting, so skipping it loses nothing. That is the exchange argument. The sorting costs O(n log n + m log m) and the scan is O(n + m).</p>,
          },
        ]}
        compare={<p>The two-list greedy: it is shorter and faster than the search. (LeetCode 455.)</p>}
      >
        <p>Each child <code>i</code> has a greed <code>g[i]</code> and each cookie <code>j</code> has a size <code>s[j]</code>. A child is satisfied if given a cookie with <code>s[j] &gt;= g[i]</code>. Each child gets at most one cookie and each cookie goes to at most one child. Return the maximum number of satisfied children.</p>
      </Problem>

      <Problem
        n={2}
        title="Lemonade change"
        level="Easy"
        examples={[
          { input: "[5, 5, 5, 10, 20]", output: "true", why: "The 10 takes one 5; the 20 takes the 10 and one 5." },
          { input: "[5, 5, 10, 10, 20]", output: "false", why: "" },
        ]}
        hints={[
          <>Only the bill of 20 involves a choice. What can 15 change be made from?</>,
          <>Which is more useful to keep: a 5 or a 10?</>,
        ]}
        approaches={[
          {
            name: "Backtracking over both ways to give change",
            idea: <p>For a 20, try giving 10 + 5 and, separately, 5 + 5 + 5; the answer is true if either choice lets you serve the rest.</p>,
            code: `function lemonadeChange(bills) {
  function go(i, fives, tens) {
    if (i === bills.length) return true;
    const b = bills[i];
    if (b === 5) return go(i + 1, fives + 1, tens);
    if (b === 10) return fives > 0 && go(i + 1, fives - 1, tens + 1);
    return (tens > 0 && fives > 0 && go(i + 1, fives - 1, tens - 1)) ||
           (fives >= 3 && go(i + 1, fives - 3, tens));
  }
  return go(0, 0, 0);
}

console.log(lemonadeChange([5, 5, 5, 10, 20]));  // true
console.log(lemonadeChange([5, 5, 10, 10, 20])); // false`,
            explain: <p>Always correct, but it can branch twice at every 20, which is exponential in the worst case.</p>,
          },
          {
            name: "Greedy: keep the fives",
            idea: <p>Count fives and tens. For a 20 prefer 10 + 5, and only fall back to three 5s.</p>,
            code: `function lemonadeChange(bills) {
  let fives = 0, tens = 0;
  for (const bill of bills) {
    if (bill === 5) fives++;
    else if (bill === 10) {
      if (fives === 0) return false;
      fives--; tens++;
    } else if (tens > 0 && fives > 0) { tens--; fives--; }
    else if (fives >= 3) fives -= 3;
    else return false;
  }
  return true;
}

console.log(lemonadeChange([5, 5, 5, 10, 20]));  // true
console.log(lemonadeChange([5, 5, 10, 10, 20])); // false
console.log(lemonadeChange([10]));               // false`,
            explain: <p>A 5 can help with both a 10 and a 20, but a 10 helps only with a 20, so using up the 10 first never hurts. One pass, O(n) time and O(1) space.</p>,
          },
        ]}
        compare={<p>The greedy, which you can justify in one sentence. (LeetCode 860.)</p>}
      >
        <p>Each lemonade costs 5. Customers pay with a 5, 10 or 20 bill, in order, and you must give exact change. You start with no money. Return whether you can serve every customer.</p>
      </Problem>

      <Problem
        n={3}
        title="Jump game"
        level="Medium"
        examples={[
          { input: "[2, 3, 1, 1, 4]", output: "true", why: "Jump 1 step to index 1, then 3 steps to the end." },
          { input: "[3, 2, 1, 0, 4]", output: "false", why: "Every path ends on index 3, whose jump length is 0." },
        ]}
        hints={[
          <>If you can reach index i, you can reach every index before it as well. What single number describes everything reachable?</>,
        ]}
        approaches={[
          {
            name: "Dynamic programming from the front",
            idea: <p>Mark each index reachable or not. For every reachable index, mark all indices it can jump to.</p>,
            code: `function canJump(nums) {
  const reach = new Array(nums.length).fill(false);
  reach[0] = true;
  for (let i = 0; i < nums.length; i++) {
    if (!reach[i]) continue;
    for (let j = i + 1; j <= i + nums[i] && j < nums.length; j++) reach[j] = true;
  }
  return reach[nums.length - 1];
}

console.log(canJump([2, 3, 1, 1, 4])); // true
console.log(canJump([3, 2, 1, 0, 4])); // false`,
            explain: <p>O(n²) because a big jump marks many indices.</p>,
          },
          {
            name: "Greedy: the farthest reachable index",
            idea: <p>Walk left to right keeping <code>farthest</code>. If you stand at an index beyond it, you are stuck.</p>,
            code: `function canJump(nums) {
  let farthest = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) return false;
    farthest = Math.max(farthest, i + nums[i]);
  }
  return true;
}

console.log(canJump([2, 3, 1, 1, 4])); // true
console.log(canJump([3, 2, 1, 0, 4])); // false
console.log(canJump([0]));             // true`,
            explain: <p>O(n) time, O(1) space. Anything up to <code>farthest</code> is reachable because a jump can always be shorter than its maximum.</p>,
          },
          {
            name: "Greedy backwards: move the goalpost",
            idea: <p>Let <code>goal</code> be the last index. Going from the right, if index <code>i</code> can reach <code>goal</code>, then <code>i</code> becomes the new goal. At the end, can index 0 be the goal?</p>,
            code: `function canJump(nums) {
  let goal = nums.length - 1;
  for (let i = nums.length - 2; i >= 0; i--) {
    if (i + nums[i] >= goal) goal = i;
  }
  return goal === 0;
}

console.log(canJump([2, 3, 1, 1, 4])); // true
console.log(canJump([3, 2, 1, 0, 4])); // false`,
            explain: <p>Same O(n); it is the same idea viewed from the other end.</p>,
          },
        ]}
        compare={<p>The forward greedy is the one to reach for first, and it is what the traced run above shows. (LeetCode 55.)</p>}
      >
        <p>You start at index 0. <code>nums[i]</code> is the maximum number of steps you can jump forward from index <code>i</code>. Return whether you can reach the last index.</p>
      </Problem>

      <Problem
        n={4}
        title="Jump game II"
        level="Medium"
        examples={[
          { input: "[2, 3, 1, 1, 4]", output: "2", why: "Jump from 0 to 1, then from 1 to 4." },
          { input: "[2, 3, 0, 1, 4]", output: "2", why: "Same route: 0 to 1 to 4." },
        ]}
        hints={[
          <>Think in waves: everything reachable with 1 jump, then everything reachable with 2 jumps, and so on.</>,
          <>While scanning one wave, track how far the next wave could reach.</>,
        ]}
        approaches={[
          {
            name: "Dynamic programming",
            idea: <p><code>dp[i]</code> is the fewest jumps to reach index i. For each i, relax every index it can jump to.</p>,
            code: `function jump(nums) {
  const n = nums.length;
  const dp = new Array(n).fill(Infinity);
  dp[0] = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j <= i + nums[i] && j < n; j++) dp[j] = Math.min(dp[j], dp[i] + 1);
  }
  return dp[n - 1];
}

console.log(jump([2, 3, 1, 1, 4])); // 2
console.log(jump([2, 3, 0, 1, 4])); // 2`,
            explain: <p>O(n²) time. Fine for small inputs; too slow for 10⁴ or more.</p>,
          },
          {
            name: "Greedy waves (implicit breadth-first search)",
            idea: <p>Keep <code>currentEnd</code> (the last index the current jump count reaches) and <code>farthest</code> (how far one more jump could go). On reaching <code>currentEnd</code>, add a jump and set <code>currentEnd = farthest</code>.</p>,
            code: `function jump(nums) {
  let jumps = 0, currentEnd = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === currentEnd) {
      jumps++;
      currentEnd = farthest;
    }
  }
  return jumps;
}

console.log(jump([2, 3, 1, 1, 4])); // 2
console.log(jump([2, 3, 0, 1, 4])); // 2
console.log(jump([0]));             // 0`,
            explain: <p>O(n) time, O(1) space. Each wave is one &quot;level&quot; of breadth-first search, so the number of waves needed to include the last index is the minimum number of jumps. This relies on the guarantee that the end is reachable.</p>,
          },
        ]}
        compare={<p>The waves greedy. Explain it as breadth-first search without a queue. (LeetCode 45.)</p>}
      >
        <p>Same setup as the previous question, but the last index is guaranteed reachable. Return the minimum number of jumps needed to reach it.</p>
      </Problem>

      <Problem
        n={5}
        title="Gas station"
        level="Medium"
        examples={[
          { input: "gas = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2]", output: "3", why: "Start at station 3 with 4 gas, arrive at 4 with 4 − 1 + 5 = 8, and so on around the circle." },
          { input: "gas = [2, 3, 4], cost = [3, 4, 3]", output: "-1", why: "Total gas 9 is less than total cost 10." },
        ]}
        hints={[
          <>If the total gas is less than the total cost, is there any hope?</>,
          <>Suppose you start at s and run dry before station i + 1. Could any station between s and i work as a start?</>,
        ]}
        approaches={[
          {
            name: "Try every starting station",
            idea: <p>For each start, simulate a full lap and check that the tank never goes below 0.</p>,
            code: `function canCompleteCircuit(gas, cost) {
  const n = gas.length;
  for (let start = 0; start < n; start++) {
    let tank = 0, ok = true;
    for (let k = 0; k < n; k++) {
      const i = (start + k) % n;
      tank += gas[i] - cost[i];
      if (tank < 0) { ok = false; break; }
    }
    if (ok) return start;
  }
  return -1;
}

console.log(canCompleteCircuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2])); // 3
console.log(canCompleteCircuit([2, 3, 4], [3, 4, 3]));             // -1`,
            explain: <p>O(n²).</p>,
          },
          {
            name: "Greedy single pass",
            idea: <p>Track the tank since the candidate start and the grand total. When the tank goes negative at station i, the candidate moves to i + 1 and the tank resets. At the end, if the grand total is not negative, the candidate is the answer.</p>,
            code: `function canCompleteCircuit(gas, cost) {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < gas.length; i++) {
    const gain = gas[i] - cost[i];
    total += gain;
    tank += gain;
    if (tank < 0) { start = i + 1; tank = 0; }
  }
  return total >= 0 ? start : -1;
}

console.log(canCompleteCircuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2])); // 3
console.log(canCompleteCircuit([2, 3, 4], [3, 4, 3]));             // -1
console.log(canCompleteCircuit([5], [4]));                         // 0`,
            explain: <p>Every failed stretch is skipped for good (no start inside it could have done better). If the grand total is at least 0, the surplus after the last candidate covers the deficit of all the stretches before it, so the last candidate works. O(n) time, O(1) space.</p>,
          },
        ]}
        compare={<p>The single pass; be ready to explain why skipping all stations between the failed start and the failure point is safe. (LeetCode 134.)</p>}
      >
        <p>There are <code>n</code> stations on a circle. Station <code>i</code> has <code>gas[i]</code> fuel, and driving to station <code>i + 1</code> costs <code>cost[i]</code>. Start with an empty tank at one station. Return the index of the start that lets you travel once around the circle clockwise, or −1 if none does (the answer is unique when it exists).</p>
      </Problem>

      <Problem
        n={6}
        title="Best time to buy and sell stock II"
        level="Medium"
        examples={[
          { input: "[7, 1, 5, 3, 6, 4]", output: "7", why: "Buy at 1, sell at 5 (+4), buy at 3, sell at 6 (+3)." },
          { input: "[1, 2, 3, 4, 5]", output: "4", why: "Buy at 1, sell at 5; the same as taking each daily rise." },
        ]}
        hints={[
          <>You may trade as many times as you like (holding at most one share). Is a long climb worth more than its daily steps added up?</>,
        ]}
        approaches={[
          {
            name: "Dynamic programming with two states",
            idea: <p>Track the best profit while holding a share and while not holding one, updating daily.</p>,
            code: `function maxProfit(prices) {
  let hold = -Infinity;     // best profit while holding a share
  let cash = 0;             // best profit while holding nothing
  for (const p of prices) {
    hold = Math.max(hold, cash - p);
    cash = Math.max(cash, hold + p);
  }
  return cash;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 7
console.log(maxProfit([1, 2, 3, 4, 5]));    // 4
console.log(maxProfit([7, 6, 4, 3, 1]));    // 0`,
            explain: <p>O(n) time, O(1) space. A good safe answer, and the same shape as harder stock questions with a fee or a cooldown.</p>,
          },
          {
            name: "Greedy: collect every rise",
            idea: <p>A climb from a to d through b and c is worth exactly the sum of its daily rises. So add every positive difference between consecutive days.</p>,
            code: `function maxProfit(prices) {
  let profit = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1];
  }
  return profit;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 7
console.log(maxProfit([1, 2, 3, 4, 5]));    // 4
console.log(maxProfit([7, 6, 4, 3, 1]));    // 0`,
            explain: <p>Buying and selling again the same day is allowed (it changes nothing), so splitting a long climb into daily trades earns the same profit. Falls are never traded. O(n) time, O(1) space.</p>,
          },
        ]}
        compare={<p>The greedy is the shortest, and the DP is the one that survives follow-ups. (LeetCode 122.)</p>}
      >
        <p>You are given the price of a stock on each day. You may buy and sell as many times as you like, but you can hold at most one share at a time. Return the maximum profit.</p>
      </Problem>

      <Problem
        n={7}
        title="Partition labels"
        level="Medium"
        examples={[
          { input: "s = \"ababcbacadefegdehijhklij\"", output: "[9, 7, 8]", why: "Pieces \"ababcbaca\", \"defegde\" and \"hijhklij\": no letter appears in two pieces." },
          { input: "s = \"eccbbbbdec\"", output: "[10]", why: "e appears at both ends, so the whole string is one piece." },
        ]}
        hints={[
          <>If a piece contains a letter, it must contain that letter&apos;s last occurrence.</>,
          <>Remember the last index of each letter. Extend the current piece&apos;s end whenever a letter pushes it further.</>,
        ]}
        approaches={[
          {
            name: "Rescan with lastIndexOf",
            idea: <p>Start a piece at <code>start</code>. Set its end to the last index of the first letter, then walk through the piece and extend the end whenever a letter&apos;s last index is further.</p>,
            code: `function partitionLabels(s) {
  const result = [];
  let start = 0;
  while (start < s.length) {
    let end = s.lastIndexOf(s[start]);
    for (let i = start; i <= end; i++) end = Math.max(end, s.lastIndexOf(s[i]));
    result.push(end - start + 1);
    start = end + 1;
  }
  return result;
}

console.log(partitionLabels("ababcbacadefegdehijhklij")); // [9, 7, 8]
console.log(partitionLabels("eccbbbbdec"));               // [10]`,
            explain: <p>Correct, but each <code>lastIndexOf</code> scans the string, so the worst case is O(n²).</p>,
          },
          {
            name: "Greedy with a last-index table",
            idea: <p>One pass to record the last index of every letter, then one pass that tracks the current piece&apos;s end. When the index reaches the end, close the piece.</p>,
            code: `function partitionLabels(s) {
  const last = new Map();
  for (let i = 0; i < s.length; i++) last.set(s[i], i);
  const result = [];
  let start = 0, end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last.get(s[i]));
    if (i === end) {
      result.push(end - start + 1);
      start = i + 1;
    }
  }
  return result;
}

console.log(partitionLabels("ababcbacadefegdehijhklij")); // [9, 7, 8]
console.log(partitionLabels("eccbbbbdec"));               // [10]
console.log(partitionLabels("a"));                         // [1]`,
            explain: <p>Making pieces as short as possible means closing each one at the first moment it can be closed, which is the greedy rule. O(n) time, O(1) space (at most 26 letters).</p>,
          },
          {
            name: "Merge each letter's span",
            idea: <p>Each letter occupies the span from its first to its last index. Pieces are exactly the merged groups of overlapping spans. This previews the next lesson.</p>,
            code: `function partitionLabels(s) {
  const first = new Map(), last = new Map();
  for (let i = 0; i < s.length; i++) {
    if (!first.has(s[i])) first.set(s[i], i);
    last.set(s[i], i);
  }
  const spans = [...first.keys()].map((ch) => [first.get(ch), last.get(ch)]).sort((a, b) => a[0] - b[0]);
  const result = [];
  let [start, end] = spans[0];
  for (const [a, b] of spans.slice(1)) {
    if (a > end) { result.push(end - start + 1); start = a; end = b; }
    else end = Math.max(end, b);
  }
  result.push(end - start + 1);
  return result;
}

console.log(partitionLabels("ababcbacadefegdehijhklij")); // [9, 7, 8]
console.log(partitionLabels("eccbbbbdec"));               // [10]`,
            explain: <p>Correct, and a good bridge to interval merging, but it does more work than the greedy.</p>,
          },
        ]}
        compare={<p>The last-index table. (LeetCode 763.)</p>}
      >
        <p>Split the string into as many pieces as possible so that each letter appears in at most one piece. Return the lengths of the pieces, in order.</p>
      </Problem>
    </>
  );
}
