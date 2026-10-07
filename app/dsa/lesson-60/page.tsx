import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Callout from "@/components/Callout";
import DryRun from "@/components/dsa/DryRun";
import DsaLessonPage from "@/components/dsa/DsaLesson";
import Questions from "./questions";
import Recall from "@/components/dsa/Recall";
import CodeBlock from "@/components/sd/CodeBlock";
import { getDsaLesson } from "@/lib/dsa";

const lesson = getDsaLesson("lesson-60");

export const metadata: Metadata = {
  title: `Lesson 60 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "how", label: "How to use this lesson" },
  { id: "limits", label: "Constraints tell you the target speed" },
  { id: "cheat", label: "The pattern cheat sheet" },
  { id: "plan", label: "An eight-week practice plan" },
  { id: "spaced", label: "Spaced repetition: 1, 3, 7 and 21 days" },
  { id: "log", label: "Keep a mistake log" },
  { id: "mock", label: "Mock interviews" },
  { id: "practice", label: "Mock interviews: spot the pattern first (5)" },
  { id: "checklist", label: "The final checklist" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

/** A link to a lesson of this series, showing just its number. */
const L = (n: number): ReactNode => (
  <Link key={n} href={`/dsa/lesson-${n}`}>
    {n}
  </Link>
);
/** Several lesson links, separated by commas. */
const Ls = (...ns: number[]): ReactNode => (
  <>
    {ns.map((n, i) => (
      <span key={n}>
        {i > 0 ? ", " : null}
        {L(n)}
      </span>
    ))}
  </>
);

const cols = ["The wording says…", "Technique", "Lesson", "Time / space"];

const limitRows: string[][] = [
  ["n up to about 20", "Try everything: subsets, permutations, backtracking", "O(2ⁿ) or O(n!)"],
  ["n up to about 500", "Three nested loops are still fine", "O(n³)"],
  ["n up to about 5,000", "Two nested loops are fine", "O(n²)"],
  ["n up to 100,000 or 1,000,000", "Sort, heap, binary search, or one pass with a map", "O(n log n) or O(n)"],
  ["n up to 10¹⁸ or \"very large number\"", "Maths or binary search on the answer: the loop cannot run n times", "O(log n) or O(√n)"],
];

const foundationRows: ReactNode[][] = [
  ["Predict or trace what some code prints", "Dry run: a table with one column per variable", Ls(1), "—"],
  ["Store a value, convert between text and numbers, remainder and whole division", "Variables, operators, % and Math.floor", Ls(2), "O(1)"],
  ["Different answer for different cases (even or odd, leap year, boundaries)", "if / else-if, && and ||, test the boundary values", Ls(3), "O(1)"],
  ["Do something n times; sum, product, count; Fizz Buzz", "for loop with an accumulator", Ls(4), "O(n) time, O(1) space"],
  ["Take a number apart digit by digit; repeat until a condition changes", "while loop with n % 10 and Math.floor(n / 10)", Ls(5), "O(digits) = O(log n)"],
  ["Print a shape; count pairs; go through a grid", "Nested loops: rows outside, columns inside", Ls(6), "O(n²)"],
  ["Package logic; answer must be returned, not printed", "Functions, early return, helper functions", Ls(7), "—"],
  ["A list of values; running total, largest, search", "Array loop: accumulate, best so far, count, search", Ls(8), "O(n)"],
  ["Characters of a text; palindrome; reverse", "String as an array of characters; build a new string", Ls(9), "O(n)"],
  ["Count items, remove duplicates, look something up by name", "Map for counts, Set for \"seen\"", Ls(10), "O(n) average"],
  ["Unclear statement or too many details", "Inputs, outputs, constraints, examples, edge cases, then code", Ls(11), "—"],
  ["\"How fast must it be?\"", "Count the steps; read the constraints (table above)", Ls(12), "—"],
  ["Divisors, primes, gcd, \"modulo 10⁹+7\", x to the power n", "√n loops, sieve, Euclid, fast exponentiation", Ls(13), "O(√n); sieve O(n log log n); gcd and power O(log n)"],
  ["The problem contains a smaller copy of itself", "Recursion: base case plus a smaller call", Ls(14), "O(depth) stack space"],
  ["\"How many times does each value appear?\"", "Counting array (fixed range) or Map", Ls(15), "O(n) time"],
];

const sortRows: ReactNode[][] = [
  ["Sort a small list and explain how; nearly sorted data", "Selection, bubble or insertion sort (insertion is O(n) on nearly sorted input)", Ls(16), "O(n²) time, O(1) space"],
  ["Sort with a guaranteed O(n log n); merge two sorted lists; count inversions", "Merge sort (divide, sort halves, merge)", Ls(17), "O(n log n) time, O(n) space"],
  ["k-th largest or smallest; partition around a value; sort numbers or objects in JavaScript", "Quickselect, quick sort, .sort with a comparator", Ls(18), "Quickselect O(n) average; .sort O(n log n)"],
];

const arrayRows: ReactNode[][] = [
  ["In place: remove, rotate, move zeroes, merge sorted", "Read pointer and write pointer; reverse in three steps", Ls(19), "O(n) time, O(1) space"],
  ["Sum of a range, many range queries, product except self, \"subarray sums to k\"", "Prefix sums (plus a Map of earlier prefix sums)", Ls(20), "O(n) to build, O(1) per query"],
  ["Sorted array and a pair; reverse; remove duplicates; triplets; container with most water", "Two pointers, from both ends or in the same direction", Ls(21), "O(n); 3Sum O(n²)"],
  ["Maximum sum or average of every block of exactly k", "Fixed sliding window: add the new, drop the old", Ls(22), "O(n) time, O(1) space"],
  ["Longest or shortest contiguous part with a condition; \"at most k distinct\"", "Variable sliding window: grow right, shrink left", Ls(23), "O(n) time"],
  ["Maximum sum of a contiguous subarray; best day to buy and sell", "Kadane: best ending here, best overall", Ls(24), "O(n) time, O(1) space"],
  ["Grid: transpose, rotate, spiral, set zeroes, sorted matrix search", "Index arithmetic on rows and columns; layers", Ls(25), "O(R × C)"],
  ["Find a pair or an earlier value that matches; duplicates within distance k; longest consecutive run", "Hash Map or Set of what you have seen", Ls(26), "O(n) time, O(n) space"],
  ["Anagrams, most frequent, majority element, isomorphic strings", "Frequency map; a good key; bucket idea; Boyer–Moore vote", Ls(27), "O(n) (sorting each key adds a log)"],
];

const searchRows: ReactNode[][] = [
  ["Sorted input, or \"find in O(log n)\"; first or last position; rotated sorted array", "Binary search with a template and lower or upper bound", Ls(28), "O(log n) time"],
  ["\"Minimum … such that it still works\" or \"maximise the smallest\"; the answer is a number in a range", "Binary search on the answer plus a feasibility check", Ls(29), "O(n log range)"],
];

const stringRows: ReactNode[][] = [
  ["Palindromes, common prefix, Roman numerals, compress, rotate", "Two pointers, expand around the centre, scan with a pointer", Ls(30), "O(n); longest palindrome O(n²)"],
  ["Substring with no repeats, replace at most k, permutation or anagram of a pattern, minimum window", "String sliding window with a count map", Ls(31), "O(n) time, O(alphabet) space"],
  ["Calls that branch; fast power; the work repeats", "Draw the recursion tree; count its nodes", Ls(32), "Fibonacci tree O(2ⁿ) before memoisation"],
  ["\"All subsets, permutations, combinations\"", "Pick or skip; swap or use a used-array", Ls(33), "O(2ⁿ × n); permutations O(n! × n)"],
  ["\"All ways\" under rules: combination sum, partitions, word search, N-Queens", "Backtracking: choose, explore, undo", Ls(34), "Exponential; pruning helps"],
];

const listStackRows: ReactNode[][] = [
  ["Nodes and pointers; insert or delete in a list", "Linked list with a dummy head", Ls(35), "O(1) at the head, O(n) to find"],
  ["Reverse a list or part of it; middle; is it a palindrome; is there a cycle", "Three-pointer reversal; fast and slow pointers", Ls(36), "O(n) time, O(1) space"],
  ["Merge sorted lists; where a cycle starts; n-th from the end; add two numbers; intersection", "Dummy head; gap pointers; Floyd's algorithm", Ls(37), "O(n) time"],
  ["Matching brackets, undo, nested structure, evaluate an expression, decode", "Stack (last in, first out)", Ls(38), "O(n) time, O(n) space"],
  ["First in, first out; queue from stacks; sliding window maximum", "Queue with a head index; deque of indices", Ls(39), "O(n) total"],
  ["\"Next greater or smaller\", days until warmer, histogram, trapped water", "Monotonic stack", Ls(40), "O(n): each item pushed and popped once"],
];

const treeRows: ReactNode[][] = [
  ["Visit every node in an order; depth; invert; same tree", "Preorder, inorder, postorder with recursion or a stack", Ls(41), "O(n) time, O(h) space"],
  ["Level by level; right side view; zigzag; minimum depth", "BFS with a queue, one level per round", Ls(42), "O(n) time, O(width) space"],
  ["Height, balanced, diameter, path sum, maximum path sum, symmetric", "DFS that returns a value up the tree", Ls(43), "O(n) time"],
  ["Binary search tree: search, insert, delete, validate, k-th smallest", "Use the left < node < right property; inorder is sorted", Ls(44), "O(h): O(log n) balanced, O(n) skewed"],
  ["Lowest common ancestor; rebuild a tree from traversals; serialise", "Recursion on the shape; a Map of inorder positions", Ls(45), "O(n) time"],
];

const heapRows: ReactNode[][] = [
  ["k-th largest, top k, k closest, merge k lists, running median", "Heap (priority queue) of size k, or two heaps", Ls(46), "O(n log k) time, O(k) space"],
  ["Best choice now is also best overall: jump game, gas station, assign cookies", "Greedy: choose locally, prove it never hurts", Ls(47), "O(n), or O(n log n) with a sort"],
  ["Overlapping ranges: merge, insert, fewest to remove, minimum arrows", "Sort by start (or end), then one sweep", Ls(48), "O(n log n) time"],
];

const graphRows: ReactNode[][] = [
  ["Cities and roads, friends, dependencies, a grid of cells", "Model it as a graph: adjacency list; cells as vertices", Ls(49), "O(V + E) to build"],
  ["Islands, regions, reachable?, flood fill, number of provinces, clone", "DFS or BFS with a visited set", Ls(50), "O(V + E); grid O(R × C)"],
  ["Fewest steps or moves in an unweighted graph or grid; spreading from many sources", "BFS (multi-source BFS: start with all sources in the queue)", Ls(50, 52), "O(V + E)"],
  ["Prerequisites, order the tasks, can all be completed, detect a cycle (directed)", "Topological sort: Kahn's algorithm or DFS colours", Ls(51), "O(V + E)"],
  ["Cheapest or shortest route with weights; at most k stops", "Dijkstra with a heap; Bellman–Ford for k limits", Ls(52), "Dijkstra O((V + E) log V)"],
  ["Are these two connected?; merge groups; redundant edge; connect everything at minimum cost", "Union-find; Kruskal's minimum spanning tree", Ls(53), "Almost O(1) per operation; Kruskal O(E log E)"],
];

const dpRows: ReactNode[][] = [
  ["Count the ways, minimum cost or maximum value, and the same sub-problems keep coming back", "Dynamic programming: define the state, memoise or tabulate", Ls(54), "States × work per state"],
  ["Choose or skip along a line: house robber, fewest coins, decode ways, word break, longest increasing subsequence", "1-D DP: dp[i] depends on earlier entries", Ls(55), "O(n) to O(n × amount); LIS O(n²)"],
  ["Grid paths, subset sum, knapsack, coin combinations", "2-D DP; roll the table to one row if you can", Ls(56), "O(R × C); knapsack O(n × W)"],
  ["Two strings: longest common subsequence, edit distance, palindromic subsequence", "DP table indexed by prefixes of both strings", Ls(57), "O(m × n) time"],
];

const extraRows: ReactNode[][] = [
  ["Prefix lookups, autocomplete, dictionary with wildcards", "Trie (prefix tree)", Ls(58), "O(length) per operation"],
  ["Single number, power of two, count set bits, all subsets by bitmask", "XOR, AND, shifts; n & (n - 1)", Ls(58), "O(1) or O(bits)"],
  ["The 45 minutes: how to behave, what to say, JavaScript traps", "Clarify, examples, brute force, code, test, complexity", Ls(59), "—"],
  ["Which lesson to review and when", "This lesson: cheat sheet, plan, spaced repetition", Ls(60), "—"],
];

const planRows: ReactNode[][] = [
  ["1", <>Lessons {Ls(11, 12, 13, 14, 15, 16, 17, 18)}. Skim lessons {Ls(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)} only if anything feels shaky.</>, "Reading problems, Big-O, hashing basics, sorting", "10", "217, 242, 268, 1512, 349, 283, 26, 88, 977, 75"],
  ["2", <>Lessons {Ls(19, 20, 21, 22, 23, 24, 25)}</>, "Prefix sums, two pointers, windows, Kadane, matrices", "14", "189, 724, 238, 560, 167, 15, 11, 643, 209, 3, 53, 121, 54, 48"],
  ["3", <>Lessons {Ls(26, 27, 28, 29, 30, 31)}</>, "Hash patterns, binary search, strings", "14", "128, 49, 347, 169, 704, 34, 33, 153, 875, 1011, 5, 424, 567, 438"],
  ["4", <>Lessons {Ls(32, 33, 34, 35, 36, 37)}</>, "Recursion, backtracking, linked lists", "12", "78, 46, 39, 79, 131, 206, 876, 141, 21, 142, 19, 2"],
  ["5", <>Lessons {Ls(38, 39, 40, 41, 42, 43, 44, 45)}</>, "Stacks, queues, monotonic stack, trees, BSTs, LCA", "14", "20, 155, 150, 739, 84, 104, 102, 199, 543, 124, 98, 230, 236, 105"],
  ["6", <>Lessons {Ls(46, 47, 48, 49, 50, 51, 52, 53)}</>, "Heaps, greedy, intervals, graphs, shortest paths, union-find", "14", "703, 973, 23, 55, 134, 56, 435, 200, 994, 133, 207, 743, 547, 684"],
  ["7", <>Lessons {Ls(54, 55, 56, 57, 58)}</>, "Dynamic programming, tries, bits", "14", "70, 746, 198, 213, 322, 91, 139, 300, 62, 64, 416, 72, 1143, 208"],
  ["8", <>Lessons {Ls(59, 60)}, plus the weak spots in your mistake log</>, "Timed mock interviews on problems you have not seen; review", "10", "Two mocks of 45 minutes, each on a mixed pair (one Easy, one Medium): 4 problems. Then 6 problems from your mistake log."],
];

const spacedRows: string[][] = [
  ["Day 0 (Monday)", "Solve it, with the solution closed if you can.", "Write one line in the mistake log: pattern and the key idea."],
  ["Day 1 (Tuesday)", "First review: solve it again from a blank page, 10 minutes.", "Memory fades fastest in the first day; this catches it."],
  ["Day 3 (Thursday)", "Second review: solve again, then say the complexity aloud.", "If you stumble, the problem goes back to day 1."],
  ["Day 7 (next Monday)", "Third review: solve it in half the time, narrating as in lesson 59.", "Now it should feel like a routine you own."],
  ["Day 21 (three weeks later)", "Final review: fresh-eyed, as if it were an interview question.", "Pass this and the problem is retired. Fail it and restart the ladder."],
];

const logRows: string[][] = [
  ["10-05", "560 Subarray Sum Equals K", "Prefix sum + Map", "Started with an empty map, so subarrays starting at index 0 were missed", "Edge case", "Seed the map with {0: 1} before the loop", "10-06"],
  ["10-06", "33 Search in Rotated Sorted Array", "Binary search", "Used < where <= was needed when comparing with the left end", "Off-by-one", "Write the sorted half's range on paper and test with two elements", "10-07"],
  ["10-07", "347 Top K Frequent Elements", "Map + bucket", "Reached for sort and said O(n); it is O(n log n)", "Complexity", "Name the dominant step aloud before stating a total", "10-08"],
];

const mistakeCategoryRows: string[][] = [
  ["Pattern", "Did not recognise the technique from the wording.", "Add the wording to the cheat sheet in your own words."],
  ["Edge case", "Empty input, one element, duplicates, negatives, zero.", "Add it to your personal edge-case list."],
  ["Off-by-one", "<, <= or index ± 1 wrong; loop bounds.", "Dry run the smallest input (size 0, 1, 2)."],
  ["Complexity", "Misjudged time or space, or forgot the recursion stack.", "Redo the analysis in the shape from lesson 59."],
  ["JavaScript", "sort() default order, shared fill arrays, -0, NaN, shift().", "Add the trap to a short list and re-read it weekly."],
  ["Communication", "Went silent, skipped clarifying, did not test.", "Record yourself on the next mock and listen back."],
];

const reviewCode = `// Given the day you solved a problem, when should you look at it again? Dates are plain "YYYY-MM-DD" text.
const GAPS = [1, 3, 7, 21];                      // days after solving

function addDays(isoDate, days) {
  const d = new Date(isoDate + "T00:00:00Z");    // the Z means UTC, so time zones cannot shift the date
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function reviewDates(solvedOn) {
  return GAPS.map((gap) => addDays(solvedOn, gap));
}

console.log(reviewDates("2026-10-05")); // [ '2026-10-06', '2026-10-08', '2026-10-12', '2026-10-26' ]
console.log(reviewDates("2026-12-30")); // [ '2026-12-31', '2027-01-02', '2027-01-06', '2027-01-20' ]`;

const logCode = `// A mistake log as data: which problems are due for review today?
const GAPS = [1, 3, 7, 21];

function addDays(isoDate, days) {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function dueToday(log, today) {
  return log
    .filter((entry) => entry.reviewsDone < GAPS.length)                              // retired after the 21-day review
    .filter((entry) => addDays(entry.solvedOn, GAPS[entry.reviewsDone]) <= today)    // "YYYY-MM-DD" text compares in date order
    .map((entry) => entry.problem);
}

const log = [
  { problem: "560 Subarray Sum Equals K", pattern: "prefix sum + Map", solvedOn: "2026-10-05", reviewsDone: 0 },
  { problem: "33 Search in Rotated Sorted Array", pattern: "binary search", solvedOn: "2026-10-05", reviewsDone: 1 },
  { problem: "347 Top K Frequent Elements", pattern: "Map + bucket", solvedOn: "2026-10-07", reviewsDone: 0 },
  { problem: "70 Climbing Stairs", pattern: "DP", solvedOn: "2026-09-01", reviewsDone: 4 },
];

console.log(dueToday(log, "2026-10-07")); // [ '560 Subarray Sum Equals K' ]
console.log(dueToday(log, "2026-10-08")); // [ '560 Subarray Sum Equals K', '33 Search in Rotated Sorted Array', '347 Top K Frequent Elements' ]`;

export default function DsaLessonSixtyPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="how">How to use this lesson</h2>
      <p>
        You have 59 lessons behind you. The risk now is not missing knowledge; it is that the knowledge is spread across many pages and, under
        pressure, you cannot find the right drawer. This lesson is the index of the drawers, plus a schedule to keep them open.
      </p>
      <p>
        Read the <a href="#cheat">cheat sheet</a> once now, then use it the way it is built: <strong>start from the words of a problem</strong>, find
        the row that sounds like it, and jump to the lesson. The last section of this page gives five mock interviews where you must name the
        pattern <em>before</em> you see any code. That skill, recognising the pattern, is most of what an interview measures.
      </p>

      <h2 id="limits">Constraints tell you the target speed</h2>
      <p>
        Before any pattern, look at the size limits in the statement (lesson 12). A common rule of thumb is that a computer does on the order of
        10⁸ simple steps per second, so the biggest allowed input suggests how much work per element you can afford. Treat it as a hint, not a law.
      </p>
      <DryRun
        title="size limit → algorithm family"
        cols={["Constraint", "What is probably expected", "Target"]}
        rows={limitRows}
        note="Example: “n ≤ 100,000, find a pair with a given sum” rules out two nested loops (10 billion steps) and points to a Map or sorting."
      />

      <h2 id="cheat">The pattern cheat sheet</h2>
      <p>
        Every table has the same four columns: the <strong>wording</strong> you will see, the <strong>technique</strong> it points to, the{" "}
        <strong>lesson</strong> (click the number) and the usual <strong>time and space</strong>. V is vertices and E is edges in a graph;
        R × C is a grid; h is the height of a tree. Together the tables cover every lesson from 1 to 60.
      </p>
      <DryRun title="Foundations: lessons 1–15" cols={cols} rows={foundationRows} />
      <DryRun title="Sorting: lessons 16–18" cols={cols} rows={sortRows} />
      <DryRun title="Arrays, windows and hashing: lessons 19–27" cols={cols} rows={arrayRows} />
      <DryRun title="Binary search: lessons 28–29" cols={cols} rows={searchRows} />
      <DryRun title="Strings, recursion and backtracking: lessons 30–34" cols={cols} rows={stringRows} />
      <DryRun title="Linked lists, stacks and queues: lessons 35–40" cols={cols} rows={listStackRows} />
      <DryRun title="Trees: lessons 41–45" cols={cols} rows={treeRows} />
      <DryRun title="Heaps, greedy and intervals: lessons 46–48" cols={cols} rows={heapRows} />
      <DryRun title="Graphs: lessons 49–53" cols={cols} rows={graphRows} />
      <DryRun title="Dynamic programming: lessons 54–57" cols={cols} rows={dpRows} />
      <DryRun title="Extras and the interview: lessons 58–60" cols={cols} rows={extraRows} />
      <Callout kind="note" label="When two rows fit">
        Many questions combine patterns. “Longest subarray with sum k” sounds like a window (lesson 23) but with negatives it is a prefix sum with a Map
        (lesson 20). “Top k frequent” is a frequency map (lesson 27) feeding a heap or buckets (lesson 46). When two rows fit, ask which one the{" "}
        <em>constraints</em> allow and which one survives your edge cases.
      </Callout>

      <h2 id="plan">An eight-week practice plan</h2>
      <p>
        The plan assumes about 90 minutes on five days a week, plus a longer session at the weekend: read a lesson, redo its examples without looking,
        then solve a few problems. It totals about <strong>100 LeetCode problems</strong>, which is realistic, and enough to see every pattern in this series more than
        once. You do not need 500; you need the same few patterns practised until they are automatic.
      </p>
      <DryRun
        title="eight weeks, week by week"
        cols={["Week", "Lessons", "Focus", "Problems", "Suggested LeetCode numbers (all appear in the lessons)"]}
        rows={planRows}
        note="Total: 10 + 14 + 14 + 12 + 14 + 14 + 14 + 10 = 102 problems. Mix easy and medium problems; if a hard one steals an hour, mark it for later and move on."
      />
      <Callout kind="warn" label="Weeks 5, 6 and 7 are heavy">
        These weeks cover 8, 8 and 5 lessons. If you work full time, give each of them two weeks and halve the daily load; a 12-week plan done steadily beats an 8-week plan
        abandoned in week 5. Never skip the review day in the plan below; it is where most of the learning happens.
      </Callout>
      <p>
        <strong>A weekly rhythm that works:</strong> Monday to Wednesday, read a lesson and solve its easier problems. Thursday, solve a medium problem with a 30-minute
        timer and narrate it aloud as in <Link href="/dsa/lesson-59">lesson 59</Link>. Friday, review the log (next section). Weekend, one longer session: the harder
        problem of the week, plus a cold re-solve of two problems from earlier weeks.
      </p>

      <h2 id="spaced">Spaced repetition: 1, 3, 7 and 21 days</h2>
      <p>
        You forget most of what you learn within days unless you retrieve it again. The trick is to retrieve it <em>just as it starts to fade</em>: soon at first,
        then with growing gaps. A schedule of <strong>1, 3, 7 and 21 days</strong> after solving a problem is simple to remember and works well:
      </p>
      <ul>
        <li><strong>1 day:</strong> the first night&apos;s sleep has already blurred the details. A short re-solve now makes the memory sturdy.</li>
        <li><strong>3 days:</strong> by now you may have forgotten the trick but remember that there is one: exactly the right difficulty.</li>
        <li><strong>7 days:</strong> the week-old problem should return quickly, and the time you spend shows what truly stuck.</li>
        <li><strong>21 days:</strong> a long gap proves it is in long-term memory. Passing means the problem is retired.</li>
      </ul>
      <p>
        If you fail a review, do not despair; put the problem back on the 1-day step. A review means solving again <strong>from a blank page</strong>, not re-reading the
        solution; the effort of retrieving is what builds the memory.
      </p>
      <DryRun
        title="one problem solved on a Monday"
        cols={["When", "What you do", "Why"]}
        rows={spacedRows}
      />
      <p>The schedule is simple enough to put in code. This function turns a solve date into its four review dates:</p>
      <CodeBlock lang="js" code={reviewCode} />
      <p>
        With a few lines more you have a tiny review queue: record each problem with the day you solved it and how many reviews you have passed, and ask which are due today.
        A paper notebook or spreadsheet works equally well; the point is that something tells you what to review, so you never have to decide.
      </p>
      <CodeBlock lang="js" code={logCode} />

      <h2 id="log">Keep a mistake log</h2>
      <p>
        Do not log the problems you solved easily. Log the ones that went wrong, and <em>why</em>. Each entry takes under a minute and has seven fields:
        the date, the problem, the pattern, what went wrong, the category of mistake, the fix in one sentence, and the next review date. Here are three example rows:
      </p>
      <DryRun
        title="a mistake log"
        cols={["Date", "Problem", "Pattern", "What went wrong", "Category", "Fix", "Review"]}
        rows={logRows}
      />
      <p>
        The category column is the valuable one. After a few weeks, count each category: your top two are your real weaknesses, and they are rarely the algorithms you feared.
        Use these categories:
      </p>
      <DryRun
        title="categories of mistakes"
        cols={["Category", "What it looks like", "Remedy"]}
        rows={mistakeCategoryRows}
      />

      <h2 id="mock">Mock interviews</h2>
      <p>
        Solving alone and solving while someone watches are different skills. Start mock interviews in week 5 (one a week), and do two in week 8.
      </p>
      <ol>
        <li><strong>Pick a problem you have not seen</strong>, ideally one a friend picks, or a random one from a list sorted by difficulty. Choose one Medium, or an Easy as a warm-up followed by a Medium.</li>
        <li><strong>Set a 45-minute timer</strong> and use the phases from <Link href="/dsa/lesson-59">lesson 59</Link>: clarify, examples, brute force, code, test, complexity.</li>
        <li><strong>Talk aloud the whole time.</strong> With no partner, speak to a rubber duck or record yourself, then listen back for silences and filler words.</li>
        <li><strong>Write in a plain editor</strong>, with no autocomplete or running, the way many interviews are done. Dry-run instead of running.</li>
        <li><strong>Score yourself on four things:</strong> did I clarify? did I state a brute force? did I test with an edge case? did I give complexities unprompted?</li>
        <li><strong>Afterwards</strong>, add anything that went wrong to the mistake log, and re-solve the problem the next day.</li>
      </ol>
      <Callout kind="ok" label="Practise being stuck">
        Choose a problem that you suspect is too hard once in a while. The skill under test is what you do at minute 12 when you have no idea: say what you tried, ask a
        clarifying question, try a smaller input, and take the hint gracefully.
      </Callout>

      <h2 id="practice">Mock interviews: spot the pattern first</h2>
      <p>
        These five break the usual order. For each one, read <em>only the problem statement</em> and write down the pattern, the target complexity and the first
        question you would ask. Then open the solutions. The green box at the end of each is a script of what to <strong>say</strong>, beginning with the moment of
        recognition, followed by the plan, the code, the test and the complexity.
      </p>
      <Questions />

      <h2 id="checklist">The final checklist</h2>
      <p>The night before an interview, and the minute before it starts, go through this list:</p>
      <ul>
        <li>I can write from memory: binary search, BFS with a queue, DFS recursively, a sliding window, a Map counter, merge of two sorted arrays.</li>
        <li>I know the time of the main structures: Map and Set lookups, sort, heap push and pop, BFS and DFS, binary search.</li>
        <li>For every problem I will <strong>clarify, give examples, say the brute force, then optimise</strong>.</li>
        <li>I will write clear names, handle the special cases first and keep the code short.</li>
        <li>I will <strong>dry-run</strong> one normal and one edge case before saying I am done.</li>
        <li>I will state time and space with what n is, without being asked.</li>
        <li>I know the JavaScript traps: sort() with a comparator, shared fill arrays, -0, NaN, 2^53, recursion depth, shift().</li>
        <li>If I am stuck for five minutes I will say what I tried and ask for a hint.</li>
        <li>I have slept, eaten, and tested my setup (editor, camera, microphone, internet).</li>
        <li>I have two questions ready for the end.</li>
      </ul>

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Without looking, say which technique each of these suggests: “contiguous, with negatives, sums to k”, “minimum such that it still works”, “prerequisites”, “fewest coins”.</>,
          <>Write the constraint → algorithm table from memory (n ≤ 20, 5,000, 100,000, 10¹⁸).</>,
          <>Explain what 1, 3, 7 and 21 mean in your spaced repetition schedule and what to do when a review fails.</>,
          <>Write the first entry of your mistake log, using the seven fields.</>,
          <>Pick three problems from the cheat sheet that you have never seen and name their patterns.</>,
          <>Book your first mock interview with a friend (or a timer) in the calendar now.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        This is the last lesson of the series, and the work from here is practice rather than reading. Three places to go next:
      </p>
      <ul>
        <li>
          <strong>The practice plan.</strong> Start again at <a href="#plan">week 1</a>, today, and put the first review dates in your calendar. Use{" "}
          <Link href="/dsa/glossary">the glossary</Link> whenever a term slips, and the <a href="#cheat">cheat sheet</a> whenever a problem looks unfamiliar.
        </li>
        <li>
          <strong>The other interview series on this site.</strong> Round out your preparation with <Link href="/system-design">System Design, Step by Step</Link>,{" "}
          <Link href="/javascript">JavaScript Core Mastery</Link> (the language behind every sample here), and the senior-engineer interview series:{" "}
          <Link href="/browser">The Browser Contract</Link>, <Link href="/backend">Backend in Depth</Link>, <Link href="/debugging">Scenario Debugging</Link>,{" "}
          <Link href="/design-problems">Practical Design Problems</Link> and <Link href="/frontend-depth">Senior Frontend Depth</Link>. When you are ready to ship
          what you build, <Link href="/devops">DevOps, From Zero</Link> follows the code into production.
        </li>
        <li>
          <strong>Real problems.</strong> The lessons&apos; LeetCode lists are your first source of problems; after them, pick a topic from the cheat sheet where your mistake
          log says you are weakest.
        </li>
      </ul>
      <Callout kind="ok" label="A last word">
        You began this series with a program that printed a line of text. You can now read a problem, choose a data structure, reason about speed, and explain your thinking to
        another person. The feeling of not being ready never fully goes away, even for engineers who interview well; what changes is that you know what to do with it. Take the
        first step of the routine, keep a small amount of practice every day, and trust the process. You are more prepared than you think. Good luck.
      </Callout>
    </DsaLessonPage>
  );
}
