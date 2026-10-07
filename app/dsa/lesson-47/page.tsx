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

const coinCode = `// Greedy: always take the biggest coin that still fits.
function greedyCoins(coins, amount) {
  const sorted = [...coins].sort((a, b) => b - a);   // biggest first
  let count = 0;
  for (const c of sorted) {
    while (amount >= c) { amount -= c; count++; }
  }
  return amount === 0 ? count : -1;
}

// Brute force: try every first coin, recursively (slow, but always right).
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

const cookiesCode = `function findContentChildren(g, s) {      // g = greed of each child, s = size of each cookie
  g = [...g].sort((a, b) => a - b);
  s = [...s].sort((a, b) => a - b);
  let child = 0;
  for (const cookie of s) {                // offer cookies from smallest to largest
    if (child < g.length && cookie >= g[child]) child++;   // this cookie satisfies the least greedy waiting child
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
    else {                                   // 20: change is 15, prefer 10 + 5 (a ten is useless for most future change)
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
  let farthest = 0;                          // the furthest index we are able to reach so far
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) return false;          // index i is out of reach: we are stuck before it
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
  t.step(1, "start", "farthest = 0", "farthest is the highest index we know we can reach. Standing on index 0, we can reach at least index 0.", { nums, farthest });
  let stuckAt = -1;
  for (let i = 0; i < nums.length; i++) {
    const stuck = i > farthest;
    t.step(3, "check", `i = ${i}: is ${i} > ${farthest}?`, stuck ? `Index ${i} is further than anything we can reach, so we are stuck.` : `Index ${i} is within reach, so we may stand there and look at its jump.`, { nums, i, farthest }, "i");
    if (stuck) { stuckAt = i; break; }
    farthest = Math.max(farthest, i + nums[i]);
    t.step(4, "update", `farthest = max(…, ${i} + ${nums[i]}) = ${farthest}`, `From index ${i} we could jump up to ${nums[i]} steps, reaching index ${i + nums[i]}.`, { nums, i, farthest }, "farthest");
  }
  const ok = farthest >= nums.length - 1;
  t.print(ok);
  t.step(6, "print", `farthest ${farthest} >= ${nums.length - 1}? ${ok}`, stuckAt >= 0 ? "Every path piles up on the 0 at index 3, and the last index 4 stays out of reach." : "We reached the end.", { nums, farthest, stuckAt });
  return t.steps;
}

const jumpTwoCode = `function jump(nums) {                       // minimum jumps to reach the last index (the end is always reachable)
  let jumps = 0;
  let currentEnd = 0;                        // the furthest index reachable with 'jumps' jumps
  let farthest = 0;                          // the furthest index reachable with 'jumps + 1' jumps
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === currentEnd) {                  // we have used up the current jump's range, so we must jump again
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
    if (tank < 0) {                          // we cannot reach station i + 1 from 'start', nor from any station between
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
    if (start >= lastEnd) {                  // it fits after the last chosen activity
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
        A <strong>greedy algorithm</strong> builds an answer one step at a time, and at every step it takes whichever option looks
        best <em>right now</em>, without ever going back to reconsider. There is no trying everything and no undoing. That is why
        greedy solutions are usually short and fast: often one sort and one loop.
      </p>
      <p>
        The catch is that &quot;best right now&quot; is not always best overall. A greedy algorithm is only correct for a problem that
        has the <strong>greedy-choice property</strong>: some locally best choice can always be extended to a globally best
        answer. Greedy problems on interviews are the ones where that is true, and your job is to <em>notice</em> it and be able to
        explain why.
      </p>

      <h2 id="fails">When greedy fails</h2>
      <p>
        Take <em>coin change</em>: use the fewest coins to make an amount. The greedy habit is &quot;take the biggest coin that
        fits&quot;. With the coins of everyday money (1, 5, 10, 25) that works. With coins <code>[1, 3, 4]</code> and amount 6 it
        does not:
      </p>
      <CodeBlock lang="js" code={coinCode} />
      <DryRun
        title="coins [1, 3, 4], amount 6"
        cols={["Strategy", "Coins taken", "Count"]}
        rows={[
          ["greedy (biggest first)", "4, then 1, then 1", "3"],
          ["optimal", "3, then 3", "2"],
        ]}
        note="Grabbing the 4 felt best, but it left an awkward remainder of 2 that can only be made from two 1s."
      />
      <Callout kind="warn" label="A local optimum is not always the global optimum">
        When greedy fails like this, the right tool is usually <strong>dynamic programming</strong>: remember the best answer for
        every smaller amount and build up from there. We meet it in a later part of the series, and this very example is its
        classic first problem. For now, the lesson is the habit: before trusting a greedy idea, try to break it with a small
        example.
      </Callout>

      <h2 id="proof">Why a greedy choice is safe</h2>
      <p>
        How do you convince yourself (and an interviewer) that a greedy rule is correct? The standard argument is the{" "}
        <strong>exchange argument</strong>, and in plain words it goes like this:
      </p>
      <ol>
        <li>Imagine <em>some</em> best possible answer, which we do not know yet.</li>
        <li>Suppose it differs from the greedy choice at the first step.</li>
        <li>
          Swap the greedy choice into it in place of what it chose. If the answer is <em>no worse</em> after the swap, then there is
          always a best answer that starts with the greedy choice.
        </li>
        <li>Repeat for the smaller problem that remains.</li>
      </ol>
      <p>
        For the coins, the swap fails: you cannot replace a 3 by a 4 without breaking the total. For activity selection (below),
        the swap works, which is exactly why that greedy rule is correct.
      </p>

      <h2 id="cookies">Assign cookies and lemonade change</h2>
      <p>
        <strong>Assign cookies:</strong> each child has a greed (the smallest cookie size that satisfies them) and each cookie has a
        size. A child gets at most one cookie. Maximise the number of satisfied children. The greedy rule: sort both lists, then give
        each cookie, smallest first, to the least greedy child still waiting if it is big enough. A small cookie that cannot satisfy
        the least greedy child cannot satisfy anyone, so it is safely thrown away.
      </p>
      <CodeBlock lang="js" code={cookiesCode} />
      <p>
        <strong>Lemonade change:</strong> each customer pays 5, 10 or 20 for a 5 lemonade and you must give exact change, starting
        with no money. The only real decision is a 20, which needs 15 back. Fives are the flexible coin, since they make change for
        both 10 and 20, whereas a ten helps only a 20. So spend a ten first and keep fives:
      </p>
      <CodeBlock lang="js" code={lemonadeCode} />

      <h2 id="jump">Jump game</h2>
      <p>
        You stand on index 0 of an array of non-negative numbers. <code>nums[i]</code> is the <em>maximum</em> jump from index{" "}
        <code>i</code>. Can you reach the last index? Instead of exploring paths, track a single number: the{" "}
        <strong>farthest index you could possibly have reached</strong>. Every index up to it is reachable (you can always take a
        shorter jump), so each index we walk over can extend that frontier.
      </p>
      <CodeBlock lang="js" code={jumpCode} />

      <h2 id="trace">Traced: can we reach the end?</h2>
      <CodeTrace
        code={traceSrc}
        steps={jumpTrace()}
        caption="Every jump from indices 0 to 3 reaches at most index 3, which holds a 0. Index 4 is never within reach."
      />

      <h2 id="jump2">Jump game II: fewest jumps</h2>
      <p>
        Now the end is guaranteed reachable and we want the <em>minimum number of jumps</em>. Think of it as walking in
        &quot;waves&quot;. With 0 jumps you cover only index 0. With 1 jump you cover indices up to <code>currentEnd</code>. While
        scanning the indices inside the current wave, record the farthest place the <em>next</em> jump could land. When the scan
        reaches the end of the wave, you must spend a jump, and the next wave ends at that farthest place. This is a breadth-first
        search level by level, without any queue.
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
        note="The loop stops before the last index, since we never need to jump from it. Answer: 2 jumps (for example 0 → 1 → 4)."
      />

      <h2 id="gas">Gas station</h2>
      <p>
        Stations are on a circle. Station <code>i</code> gives <code>gas[i]</code> fuel and the trip to the next station costs{" "}
        <code>cost[i]</code>. Starting with an empty tank, find the station from which you can complete one full lap, or −1. Two
        facts make it greedy:
      </p>
      <ul>
        <li>If total gas is less than total cost, no start works.</li>
        <li>
          If you start at <code>s</code> and your tank first goes negative on the way to station <code>i + 1</code>, then no station
          between <code>s</code> and <code>i</code> can be a valid start either (each of them would arrive at the failing stretch
          with at most the fuel you had, which was not enough). So jump the candidate to <code>i + 1</code>.
        </li>
      </ul>
      <CodeBlock lang="js" code={gasCode} />

      <h2 id="activity">Activity selection</h2>
      <p>
        You have a list of activities, each with a start and an end time. You can attend only one at a time. What is the maximum
        number you can attend? Three tempting rules: pick the earliest start, pick the shortest, or pick the earliest{" "}
        <strong>end</strong>. Only the last is always right. The exchange argument: the activity that ends first leaves the most room
        for everything else. If an optimal schedule starts with a different activity, swap it for the earliest-ending one, which
        ends no later, so nothing after it collides.
      </p>
      <CodeBlock lang="js" code={activityCode} />
      <Callout kind="note" label="The pattern to remember">
        Many greedy problems reduce to <strong>sort, then one scan</strong>. The hard part is choosing <em>what to sort by</em>: for
        scheduling it is the end time, for cookies it is the size. Lesson 48 uses this exact idea for intervals.
      </Callout>

      <h2 id="practice">Practice questions</h2>
      <p>For each one, state the greedy rule in one sentence, then try to break it with a tiny example.</p>

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
        <strong>Lesson 48</strong> turns the &quot;sort by the right key, then scan&quot; habit into a family of problems about{" "}
        <strong>intervals</strong>: merging them, inserting into them and removing the fewest overlapping ones.
      </p>
    </DsaLessonPage>
  );
}
