import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CodeTrace from "@/components/dsa/CodeTrace";
import DryRun from "@/components/dsa/DryRun";
import DsaLessonPage from "@/components/dsa/DsaLesson";
import Questions from "./questions";
import Recall from "@/components/dsa/Recall";
import CodeBlock from "@/components/sd/CodeBlock";
import { getDsaLesson } from "@/lib/dsa";
import { tracer } from "@/lib/dsa-trace";

const lesson = getDsaLesson("lesson-47");

export const metadata: Metadata = {
  title: `Lesson 47 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "idea", label: "The idea: take the best option now" },
  { id: "fails", label: "When greedy fails" },
  { id: "proof", label: "Why a greedy choice is safe" },
  { id: "cookies", label: "Assign cookies and lemonade change" },
  { id: "jump", label: "Jump game" },
  { id: "trace", label: "Traced: can we reach the end?" },
  { id: "jump2", label: "Jump game II: fewest jumps" },
  { id: "gas", label: "Gas station" },
  { id: "activity", label: "Activity selection" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

const coinCode = `// Greedy: always take the biggest coin that fits.
function greedyCoins(coins, amount) {
  const sorted = [...coins].sort((a, b) => b - a);   // biggest first
  let count = 0;
  for (const c of sorted) {
    while (amount >= c) { amount -= c; count++; }
  }
  return amount === 0 ? count : -1;
}

// Brute force: try every first coin, again and again (slow, but always right).
function bestCoins(coins, amount) {
  if (amount === 0) return 0;
  let best = Infinity;
  for (const c of coins) {
    if (c <= amount) best = Math.min(best, 1 + bestCoins(coins, amount - c));
  }
  return best;
}

console.log(greedyCoins([1, 5, 10, 25], 41)); // 4   (25 + 10 + 5 + 1: greedy is right for these coins)
console.log(greedyCoins([1, 3, 4], 6));       // 3   (4 + 1 + 1)
console.log(bestCoins([1, 3, 4], 6));         // 2   (3 + 3)`;

const cookiesCode = `function findContentChildren(g, s) {      // g = how greedy each child is, s = size of each cookie
  g = [...g].sort((a, b) => a - b);
  s = [...s].sort((a, b) => a - b);
  let child = 0;
  for (const cookie of s) {                // give cookies from smallest to largest
    if (child < g.length && cookie >= g[child]) child++;   // this cookie makes the least greedy waiting child happy
  }
  return child;
}

console.log(findContentChildren([1, 2, 3], [1, 1]));    // 1
console.log(findContentChildren([1, 2], [1, 2, 3]));    // 2
console.log(findContentChildren([10, 9, 8, 7], [5, 6, 7, 8])); // 2`;

const lemonadeCode = `function lemonadeChange(bills) {
  let fives = 0, tens = 0;
  for (const bill of bills) {
    if (bill === 5) fives++;
    else if (bill === 10) { if (fives === 0) return false; fives--; tens++; }
    else {                                   // 20: change is 15, so prefer 10 + 5 (a ten is not useful for most future change)
      if (tens > 0 && fives > 0) { tens--; fives--; }
      else if (fives >= 3) fives -= 3;
      else return false;
    }
  }
  return true;
}

console.log(lemonadeChange([5, 5, 5, 10, 20])); // true
console.log(lemonadeChange([5, 5, 10, 10, 20])); // false`;

const jumpCode = `function canJump(nums) {
  let farthest = 0;                          // the farthest index we can reach so far
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) return false;          // index i is out of reach, so we are stuck before it
    farthest = Math.max(farthest, i + nums[i]);
  }
  return true;
}

console.log(canJump([2, 3, 1, 1, 4])); // true
console.log(canJump([3, 2, 1, 0, 4])); // false
console.log(canJump([0]));             // true`;

const traceSrc = `let farthest = 0;
for (let i = 0; i < nums.length; i++) {
  if (i > farthest) break;
  farthest = Math.max(farthest, i + nums[i]);
}
console.log(farthest >= nums.length - 1);`;

function jumpTrace() {
  const t = tracer();
  const nums = [3, 2, 1, 0, 4];
  let farthest = 0;
  t.step(1, "start", "farthest = 0", "farthest is the highest index we know we can reach. We stand on index 0, so we can reach at least index 0.", { nums, farthest });
  let stuckAt = -1;
  for (let i = 0; i < nums.length; i++) {
    const stuck = i > farthest;
    t.step(3, "check", `i = ${i}: is ${i} > ${farthest}?`, stuck ? `Index ${i} is further than anything we can reach, so we are stuck.` : `Index ${i} is within reach, so we can stand there and look at its jump.`, { nums, i, farthest }, "i");
    if (stuck) { stuckAt = i; break; }
    farthest = Math.max(farthest, i + nums[i]);
    t.step(4, "update", `farthest = max(…, ${i} + ${nums[i]}) = ${farthest}`, `From index ${i} we can jump up to ${nums[i]} steps. That reaches index ${i + nums[i]}.`, { nums, i, farthest }, "farthest");
  }
  const ok = farthest >= nums.length - 1;
  t.print(ok);
  t.step(6, "print", `farthest ${farthest} >= ${nums.length - 1}? ${ok}`, stuckAt >= 0 ? "Every path ends at the 0 on index 3, so the last index 4 stays out of reach." : "We reached the end.", { nums, farthest, stuckAt });
  return t.steps;
}

const jumpTwoCode = `function jump(nums) {                       // fewest jumps to reach the last index (the end can always be reached)
  let jumps = 0;
  let currentEnd = 0;                        // the farthest index we can reach with 'jumps' jumps
  let farthest = 0;                          // the farthest index we can reach with 'jumps + 1' jumps
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === currentEnd) {                  // we have used all of the current jump's range, so we must jump again
      jumps++;
      currentEnd = farthest;
    }
  }
  return jumps;
}

console.log(jump([2, 3, 1, 1, 4])); // 2   (0 -> 1 -> 4)
console.log(jump([2, 3, 0, 1, 4])); // 2
console.log(jump([1, 1, 1, 1]));    // 3`;

const gasCode = `function canCompleteCircuit(gas, cost) {
  let total = 0;                             // gas - cost over the whole circle
  let tank = 0;                              // fuel since the candidate start
  let start = 0;
  for (let i = 0; i < gas.length; i++) {
    const gain = gas[i] - cost[i];
    total += gain;
    tank += gain;
    if (tank < 0) {                          // we cannot reach station i + 1 from 'start', or from any station between
      start = i + 1;
      tank = 0;
    }
  }
  return total >= 0 ? start : -1;
}

console.log(canCompleteCircuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2])); // 3
console.log(canCompleteCircuit([2, 3, 4], [3, 4, 3]));             // -1`;

const activityCode = `// Each activity is [start, end]. Pick as many non-overlapping activities as possible.
function maxActivities(activities) {
  const sorted = [...activities].sort((a, b) => a[1] - b[1]);   // earliest END first
  let count = 0;
  let lastEnd = -Infinity;
  for (const [start, end] of sorted) {
    if (start >= lastEnd) {                  // it fits after the last activity we chose
      count++;
      lastEnd = end;
    }
  }
  return count;
}

const acts = [[1, 4], [3, 5], [0, 6], [5, 7], [3, 9], [5, 9], [6, 10], [8, 11], [8, 12], [2, 14], [12, 16]];
console.log(maxActivities(acts)); // 4   ([1,4], [5,7], [8,11], [12,16])`;

export default function DsaLessonFortySevenPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="idea">The idea: take the best option now</h2>
      <p>
        A <strong>greedy algorithm</strong> builds an answer one step at a time. At every step it takes the option that looks best{" "}
        <em>right now</em>. It never goes back to change its mind. It does not try every choice, and it never undoes a step. That is
        why greedy solutions are usually short and fast. Often they are just one sort and one loop.
      </p>
      <p>
        There is a catch. The choice that is best right now is not always best overall. Greedy only gives the right answer when the
        problem has the <strong>greedy-choice property</strong>. This means a choice that looks best locally (in one small step) can
        always lead to the best answer overall. Interview greedy problems are the ones where this is true. Your job is to{" "}
        <em>notice</em> it and to explain why.
      </p>

      <h2 id="fails">When greedy fails</h2>
      <p>
        Take <em>coin change</em>: use the fewest coins to make an amount. The greedy habit is &quot;take the biggest coin that
        fits&quot;. With everyday coins (1, 5, 10, 25) that works. With coins <code>[1, 3, 4]</code> and amount 6, it does not:
      </p>
      <CodeBlock lang="js" code={coinCode} />
      <DryRun
        title="coins [1, 3, 4], amount 6"
        cols={["Strategy", "Coins taken", "Count"]}
        rows={[
          ["greedy (biggest first)", "4, then 1, then 1", "3"],
          ["optimal (best possible)", "3, then 3", "2"],
        ]}
        note="Taking the 4 felt best. But it left 2, and 2 can only be made from two 1s."
      />
      <Callout kind="warn" label="A choice that is best locally is not always best overall">
        When greedy fails like this, the right tool is usually <strong>dynamic programming</strong>. This is a method that solves each
        smaller version of the problem once, remembers its answer, and builds the big answer from those. Here you would remember the
        fewest coins for every smaller amount. You will meet it later in the series. This coin example is its
        classic first problem. For now, learn this habit: before you trust a greedy idea, try to break it with a small example.
      </Callout>

      <h2 id="proof">Why a greedy choice is safe</h2>
      <p>
        How do you show (to yourself and to an interviewer) that a greedy rule is correct? The usual way is the{" "}
        <strong>exchange argument</strong>. In plain words, it goes like this:
      </p>
      <ol>
        <li>Imagine <em>some</em> best possible answer. You do not know it yet.</li>
        <li>Suppose it is different from the greedy choice at the first step.</li>
        <li>
          Swap the greedy choice into it, in place of what it chose. If the answer is <em>not worse</em> after the swap, then there
          is always a best answer that starts with the greedy choice.
        </li>
        <li>Repeat this for the smaller problem that is left.</li>
      </ol>
      <p>
        For the coins, the swap fails. You cannot replace a 3 with a 4 without breaking the total. For activity selection (below),
        the swap works. That is why that greedy rule is correct.
      </p>

      <h2 id="cookies">Assign cookies and lemonade change</h2>
      <p>
        <strong>Assign cookies:</strong> each child has a greed number. This is the smallest cookie size that makes the child happy.
        Each cookie has a size. A child gets at most one cookie. Make as many children happy as you can. The greedy rule: sort both
        lists. Then give each cookie, smallest first, to the least greedy child who is still waiting, if the cookie is big enough. If
        a small cookie cannot satisfy the least greedy child, it cannot satisfy anyone. So you can safely throw it away.
      </p>
      <CodeBlock lang="js" code={cookiesCode} />
      <p>
        <strong>Lemonade change:</strong> each customer pays with 5, 10 or 20 for a lemonade that costs 5. You must give the exact
        change back. You start with no money. The only real decision is a 20 bill, which needs 15 back. A 5 bill is the flexible one,
        because it makes change for both 10 and 20. A 10 bill helps only with a 20. So spend a 10 first, and keep the 5s:
      </p>
      <CodeBlock lang="js" code={lemonadeCode} />

      <h2 id="jump">Jump game</h2>
      <p>
        You stand on index 0 of an array of numbers that are not negative. <code>nums[i]</code> is the <em>longest</em> jump you can
        make from index <code>i</code>. Can you reach the last index? Do not try every path. Track one number instead: the{" "}
        <strong>farthest index you could possibly have reached</strong>. Every index up to it is reachable, because you can always
        take a shorter jump. So each index you walk over can push that limit further.
      </p>
      <CodeBlock lang="js" code={jumpCode} />

      <h2 id="trace">Traced: can we reach the end?</h2>
      <CodeTrace
        code={traceSrc}
        steps={jumpTrace()}
        caption="Every jump from index 0 to 3 reaches at most index 3, which holds a 0. Index 4 is never within reach."
      />

      <h2 id="jump2">Jump game II: fewest jumps</h2>
      <p>
        Now we know the end can be reached, and we want the <em>smallest number of jumps</em>. Think of it as walking in
        &quot;waves&quot;. With 0 jumps, you only cover index 0. With 1 jump, you cover the indexes up to <code>currentEnd</code>.
        While you look at the indexes inside the current wave, remember the farthest place the <em>next</em> jump could land. When
        you reach the end of the wave, you must use a jump. The next wave ends at that farthest place. This is a breadth-first search
        (checking everything one step away, then everything two steps away, and so on) without a queue. (A queue is a waiting line that normal breadth-first search uses to remember what to visit next. Here two numbers are enough.)
      </p>
      <CodeBlock lang="js" code={jumpTwoCode} />
      <DryRun
        title="nums = [2, 3, 1, 1, 4]"
        cols={["i", "farthest", "i === currentEnd?", "jumps", "currentEnd"]}
        rows={[
          ["start", "0", "-", "0", "0"],
          ["0", "2", "yes: jump", "1", "2"],
          ["1", "4", "no", "1", "2"],
          ["2", "4", "yes: jump", "2", "4"],
          ["3", "4", "no", "2", "4"],
        ]}
        note="The loop stops before the last index, because we never need to jump from it. Answer: 2 jumps (for example 0 → 1 → 4)."
      />

      <h2 id="gas">Gas station</h2>
      <p>
        The stations are on a circle. Station <code>i</code> gives you <code>gas[i]</code> fuel. The trip to the next station costs{" "}
        <code>cost[i]</code>. You start with an empty tank. Find the station where you can start and drive one full lap, or return
        −1. Two facts make this greedy:
      </p>
      <ul>
        <li>If the total gas is less than the total cost, no start works.</li>
        <li>
          Say you start at <code>s</code>, and your tank first goes below zero on the way to station <code>i + 1</code>. Then no
          station between <code>s</code> and <code>i</code> can be a good start either. Each of them would reach the failing part with
          no more fuel than you had, and that was not enough. So move the start to <code>i + 1</code>.
        </li>
      </ul>
      <CodeBlock lang="js" code={gasCode} />

      <h2 id="activity">Activity selection</h2>
      <p>
        You have a list of activities. Each one has a start time and an end time. You can attend only one at a time. What is the
        largest number you can attend? There are three tempting rules: pick the earliest start, pick the shortest, or pick the
        earliest <strong>end</strong>. Only the last one is always right. Here is the exchange argument. The activity that ends first
        leaves the most room for everything else. Say a best schedule starts with a different activity. Swap it for the one that ends
        first. That one ends no later, so nothing after it clashes.
      </p>
      <CodeBlock lang="js" code={activityCode} />
      <Callout kind="note" label="The pattern to remember">
        Many greedy problems are just <strong>sort, then one scan</strong>. The hard part is choosing <em>what to sort by</em>. For
        scheduling, sort by end time. For cookies, sort by size. Lesson 48 uses this same idea for intervals.
      </Callout>

      <h2 id="practice">Practice questions</h2>
      <p>For each one, say the greedy rule in one sentence. Then try to break it with a tiny example.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Explain the greedy-choice property, and show with coins [1, 3, 4] that it can fail.</>,
          <>Explain an exchange argument in your own words.</>,
          <>Say why activity selection sorts by end time and not by start time.</>,
          <>Say how jump game II is like a breadth-first search without a queue.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        <strong>Lesson 48</strong> takes the habit &quot;sort by the right key, then scan&quot; and uses it on a family of problems
        about <strong>intervals</strong> (ranges such as 1 to 5). You will merge them, insert into them, and remove the fewest
        overlapping ones.
      </p>
    </DsaLessonPage>
  );
}
