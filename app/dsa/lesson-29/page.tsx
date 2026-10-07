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

const lesson = getDsaLesson("lesson-29");

export const metadata: Metadata = {
  title: `Lesson 29 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Searching for the answer itself" },
  { id: "recognise", label: "Recognising the pattern" },
  { id: "recipe", label: "The four-step recipe" },
  { id: "sqrt", label: "A first example: integer square root" },
  { id: "speed", label: "Minimum speed: Koko eating bananas" },
  { id: "trace", label: "Traced: finding Koko's speed" },
  { id: "capacity", label: "Minimum capacity and the greedy check" },
  { id: "maxmin", label: "Maximising the minimum" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "Part 6 complete — what's next" },
];

const sqrtCode = `function mySqrt(x) {
  // the last r with r * r <= x  =  (the first r with r * r > x) - 1
  let lo = 0, hi = x + 1;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (mid * mid > x) hi = mid;
    else lo = mid + 1;
  }
  return lo - 1;
}

console.log(mySqrt(8));  // 2   (2 × 2 = 4 ≤ 8, 3 × 3 = 9 > 8)
console.log(mySqrt(16)); // 4
console.log(mySqrt(0));  // 0`;

const kokoCode = `const piles = [3, 6, 7, 11], h = 8;
const hours = (k) => piles.reduce((t, p) => t + Math.ceil(p / k), 0);
let lo = 1, hi = Math.max(...piles);
while (lo < hi) {
  const mid = lo + Math.floor((hi - lo) / 2);
  if (hours(mid) <= h) hi = mid;
  else lo = mid + 1;
}
console.log(lo);`;

function kokoTrace() {
  const t = tracer();
  const piles = [3, 6, 7, 11], h = 8;
  const hours = (k: number) => piles.reduce((s, p) => s + Math.ceil(p / k), 0);
  let lo = 1, hi = Math.max(...piles);
  t.step(3, "start", "lo = 1, hi = 11", "The speed is at least 1, and 11 (the largest pile) always finishes in time: one pile per hour.", { piles, h, lo, hi });
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const hr = hours(mid);
    t.step(5, "run", `try speed ${mid}: ${piles.map((p) => Math.ceil(p / mid)).join(" + ")} = ${hr} hours`, "Checking one guess is easy: add up the hours for each pile.", { piles, h, lo, hi, mid, hours: hr }, "mid");
    if (hr <= h) {
      hi = mid;
      t.step(6, "update", `${hr} <= 8 → hi = ${hi}`, `Speed ${mid} works, so every faster speed works too. The answer is ${mid} or slower.`, { piles, h, lo, hi, mid, hours: hr }, "hi");
    } else {
      lo = mid + 1;
      t.step(7, "update", `${hr} > 8 → lo = ${lo}`, `Speed ${mid} is too slow, and so is every slower speed. The answer is faster.`, { piles, h, lo, hi, mid, hours: hr }, "lo");
    }
  }
  t.print(lo);
  t.step(9, "print", "console.log(lo)", "Speed 4 is the slowest that finishes in 8 hours. Four checks instead of trying all 11 speeds.", { piles, h, lo, hi });
  return t.steps;
}

const capacityCode = `function shipWithinDays(weights, days) {
  // Greedy check: load packages in order; start a new day when the next one does not fit.
  const daysNeeded = (cap) => {
    let d = 1, load = 0;
    for (const w of weights) {
      if (load + w > cap) { d++; load = 0; }
      load += w;
    }
    return d;
  };
  let lo = Math.max(...weights);                     // must fit the heaviest package
  let hi = weights.reduce((a, b) => a + b, 0);        // everything in one day
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (daysNeeded(mid) <= days) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

console.log(shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)); // 15`;

const maxMinCode = `// Place m balls in baskets at the given positions so the smallest gap is as large as possible.
function maxDistance(position, m) {
  const pos = [...position].sort((a, b) => a - b);
  const canPlace = (gap) => {                 // greedy: put each ball as far left as allowed
    let count = 1, last = pos[0];
    for (const p of pos) {
      if (p - last >= gap) { count++; last = p; }
    }
    return count >= m;
  };
  // canPlace is true…true, false…false — find the LAST true
  let lo = 1, hi = pos[pos.length - 1] - pos[0];
  while (lo < hi) {
    const mid = lo + Math.ceil((hi - lo) / 2);  // round UP, or lo = mid could loop forever
    if (canPlace(mid)) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

console.log(maxDistance([1, 2, 3, 4, 7], 3)); // 3   (balls at 1, 4, 7)`;

export default function DsaLessonTwentyNinePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">Searching for the answer itself</h2>
      <p>
        Lesson 28 ended with a general idea: binary search finds the first point where a yes/no question switches from
        false to true. So far the question was about array positions. In this lesson the question is about{" "}
        <strong>candidate answers</strong>.
      </p>
      <p>
        Example: &ldquo;What is the slowest eating speed that finishes all the bananas in 8 hours?&rdquo; Computing that speed
        directly is hard. But <em>checking</em> a guess is easy: at speed 5, add up the hours. And if speed 5 works, speed 6
        works too. So the question &ldquo;does speed k work?&rdquo; is false for small k and true for large k — exactly the
        shape binary search needs.
      </p>

      <h2 id="recognise">Recognising the pattern</h2>
      <p>Look for these signs in the problem statement:</p>
      <ul>
        <li>It asks for a <strong>minimum</strong> or <strong>maximum</strong> value: the smallest speed, the least capacity, the largest distance.</li>
        <li>For a given guess, you can <strong>check</strong> whether it works in about O(n) — often with a simple greedy pass.</li>
        <li>The answer is <strong>monotonic</strong>: if x works, every larger x works (or every smaller one).</li>
      </ul>

      <h2 id="recipe">The four-step recipe</h2>
      <Callout kind="ok" label="Binary search on the answer">
        <ol className="mb-0 mt-1 list-decimal pl-5">
          <li><strong>Range:</strong> the smallest and largest possible answers, <code>lo</code> and <code>hi</code>.</li>
          <li><strong>Check:</strong> write <code>works(x)</code>, usually a single O(n) pass.</li>
          <li><strong>Direction:</strong> confirm that works(x) is false…false, true…true (or the reverse).</li>
          <li><strong>Search:</strong> find the first true (for a minimum) or the last true (for a maximum).</li>
        </ol>
      </Callout>
      <p>
        The cost is <strong>O(n · log(range))</strong>: log(range) guesses, each checked in O(n). Even a range of 10<sup>9</sup>{" "}
        needs only about 30 guesses.
      </p>

      <h2 id="sqrt">A first example: integer square root</h2>
      <p>
        The integer square root of x is the largest r with r × r ≤ x. &ldquo;r × r &gt; x&rdquo; is false for small r and
        true for large r. Find the first r where it is true; the answer is one less.
      </p>
      <CodeBlock lang="js" code={sqrtCode} />

      <h2 id="speed">Minimum speed: Koko eating bananas</h2>
      <p>
        Koko has piles of bananas and h hours. At speed k she eats up to k bananas from one pile per hour (a pile of 7 at
        speed 3 takes 3 hours). Find the slowest speed that finishes in time.
      </p>
      <ul>
        <li><strong>Range:</strong> 1 to the largest pile (at that speed, every pile takes exactly 1 hour).</li>
        <li><strong>Check:</strong> total hours = sum of <code>Math.ceil(pile / k)</code>; it works if that is ≤ h.</li>
        <li><strong>Direction:</strong> faster never takes longer, so it is false…false, true…true. Find the first true.</li>
      </ul>

      <h2 id="trace">Traced: finding Koko&apos;s speed</h2>
      <CodeTrace
        code={kokoCode}
        steps={kokoTrace()}
        caption="Each guess is checked with one pass over the piles; the result rules out half of the remaining speeds."
      />
      <DryRun
        title="hours needed at each speed for piles [3, 6, 7, 11]"
        cols={["Speed", "1", "2", "3", "4", "5", "6", "…", "11"]}
        rows={[
          ["Hours", "27", "15", "10", "8", "8", "6", "…", "4"],
          ["≤ 8?", "no", "no", "no", "yes", "yes", "yes", "…", "yes"],
        ]}
        note="The first “yes” is at speed 4. Binary search finds it without computing every column."
      />

      <h2 id="capacity">Minimum capacity and the greedy check</h2>
      <p>
        Packages must be shipped in order within a number of days. What is the smallest ship capacity that works? The check
        is <strong>greedy</strong>: load packages in order, and start a new day only when the next one does not fit. Loading
        as much as possible each day can never need more days than any other way of loading.
      </p>
      <CodeBlock lang="js" code={capacityCode} />
      <p>
        The lower end of the range matters: the capacity must be at least the heaviest package, or that package could never
        be shipped. &ldquo;Split an array into k parts minimising the largest sum&rdquo; is the same problem in different words
        (Practice question 6).
      </p>

      <h2 id="maxmin">Maximising the minimum</h2>
      <p>
        Some problems ask for the <em>largest</em> value that works — for example, the largest possible smallest gap when
        placing balls in baskets. Now works(x) is true…true, false…false, and you want the <strong>last</strong> true. Two
        changes: move <code>lo = mid</code> when it works, and round mid <em>up</em> so the range always shrinks.
      </p>
      <CodeBlock lang="js" code={maxMinCode} />
      <DryRun
        title="first true vs last true"
        cols={["Goal", "works(x) looks like", "If works(mid)", "Else", "mid rounds"]}
        rows={[
          ["Minimum that works", "F F F T T T", "hi = mid", "lo = mid + 1", "down"],
          ["Maximum that works", "T T T F F F", "lo = mid", "hi = mid − 1", "up"],
        ]}
      />

      <h2 id="practice">Practice questions</h2>
      <p>For every question, write the four recipe steps as comments before any code.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>List the three signs that a problem can be solved by binary search on the answer.</>,
          <>State the four-step recipe and the overall time complexity.</>,
          <>Write the Koko check function and say why the range is 1 to max(piles).</>,
          <>Explain why &ldquo;last true&rdquo; searches round mid up.</>,
        ]}
      />

      <h2 id="next">Part 6 complete — what&apos;s next</h2>
      <p>
        You can now binary search arrays, boundaries, rotated arrays and answers. Whenever you see &ldquo;sorted&rdquo;,
        &ldquo;minimum that works&rdquo; or O(log n) in a problem, think of this part.
      </p>
      <p>
        <strong>Part 7 — Strings</strong> applies the techniques you know — two pointers, windows and frequency maps — to
        text: palindromes, prefixes, Roman numerals, compression and substring windows.
      </p>
    </DsaLessonPage>
  );
}
