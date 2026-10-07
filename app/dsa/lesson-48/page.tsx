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

const lesson = getDsaLesson("lesson-48");

export const metadata: Metadata = {
  title: `Lesson 48 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "what", label: "What is an interval?" },
  { id: "overlap", label: "When do two intervals overlap?" },
  { id: "sort", label: "Sort first" },
  { id: "merge", label: "Merge intervals" },
  { id: "trace", label: "Traced: merging" },
  { id: "insert", label: "Insert an interval" },
  { id: "erase", label: "Remove the fewest: sort by end" },
  { id: "arrows", label: "Minimum arrows" },
  { id: "rooms", label: "Meeting rooms I and II" },
  { id: "intersect", label: "Intersections of two lists" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "What's next" },
];

// Draw the closed interval [s, e] on a line of positions 0..9.
function draw(s: number, e: number) {
  let line = "";
  for (let x = 0; x <= 9; x++) line += x >= s && x <= e ? "#" : ".";
  return line;
}
const overlapsClosed = (a: number[], b: number[]) => a[0] <= b[1] && b[0] <= a[1];
const overlapCases: [string, number[], number[]][] = [
  ["apart", [1, 3], [5, 8]],
  ["partial", [1, 5], [3, 8]],
  ["inside", [1, 8], [3, 5]],
  ["touching", [1, 4], [4, 8]],
  ["reversed, apart", [6, 8], [0, 3]],
];
const overlapRows: string[][] = overlapCases.map(([name, a, b]) => [
  name,
  `[${a}]  ${draw(a[0], a[1])}`,
  `[${b}]  ${draw(b[0], b[1])}`,
  overlapsClosed(a, b) ? "yes" : "no",
]);

const overlapCode = `// Two intervals [s1, e1] and [s2, e2] (both ends included) overlap
// exactly when each one starts before the other one ends.
function overlaps(a, b) {
  return a[0] <= b[1] && b[0] <= a[1];
}

console.log(overlaps([1, 3], [5, 8])); // false
console.log(overlaps([1, 5], [3, 8])); // true
console.log(overlaps([1, 8], [3, 5])); // true   (one inside the other)
console.log(overlaps([1, 4], [4, 8])); // true   (they share the point 4)`;

const mergeCode = `function merge(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);   // by start
  const merged = [[...sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (sorted[i][0] <= last[1]) {
      last[1] = Math.max(last[1], sorted[i][1]);   // overlap: make the last interval longer
    } else {
      merged.push([...sorted[i]]);                  // gap: start a new interval
    }
  }
  return merged;
}

console.log(merge([[1, 3], [8, 10], [2, 6], [15, 18]])); // [[1, 6], [8, 10], [15, 18]]
console.log(merge([[1, 4], [4, 5]]));                    // [[1, 5]]
console.log(merge([[1, 10], [2, 3], [4, 5]]));           // [[1, 10]]`;

const traceSrc = `intervals.sort((a, b) => a[0] - b[0]);
const merged = [[...intervals[0]]];
for (let i = 1; i < intervals.length; i++) {
  const last = merged[merged.length - 1];
  if (intervals[i][0] <= last[1]) {
    last[1] = Math.max(last[1], intervals[i][1]);
  } else {
    merged.push([...intervals[i]]);
  }
}
console.log(merged);`;

function mergeTrace() {
  const t = tracer();
  const intervals = [[1, 3], [8, 10], [2, 6], [15, 18]].map((p) => [...p]);
  t.step(1, "start", "intervals as given", "The intervals come in any order. So two intervals that are next to each other in the list may not be next to each other on the number line.", { intervals });
  intervals.sort((a, b) => a[0] - b[0]);
  t.step(1, "run", "sort by start", "Now any interval that could overlap an earlier one is right after it.", { intervals }, "intervals");
  const merged = [[...intervals[0]]];
  t.step(2, "run", "merged = [first interval]", "The first interval is our current choice.", { intervals, merged }, "merged");
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const overlap = intervals[i][0] <= last[1];
    t.step(5, "check", `[${intervals[i]}] starts at ${intervals[i][0]}; last ends at ${last[1]}`, overlap ? `${intervals[i][0]} <= ${last[1]}: the new interval starts before (or when) the last one ends, so they overlap.` : `${intervals[i][0]} > ${last[1]}: there is a gap, so they do not overlap.`, { i, intervals, merged }, "i");
    if (overlap) {
      last[1] = Math.max(last[1], intervals[i][1]);
      t.step(6, "update", `stretch last to end at ${last[1]}`, `The merged end is the larger of the two ends. This is in case the new interval sits inside the last one.`, { i, intervals, merged }, "merged");
    } else {
      merged.push([...intervals[i]]);
      t.step(8, "update", `push [${intervals[i]}]`, "Start a new interval. The earlier ones are final.", { i, intervals, merged }, "merged");
    }
  }
  t.print(merged);
  t.step(11, "print", "print merged", "Three separate intervals are left.", { merged });
  return t.steps;
}

const insertCode = `function insert(intervals, newInterval) {
  const result = [];
  let i = 0;
  const n = intervals.length;
  // 1. copy everything that ends before the new interval starts
  while (i < n && intervals[i][1] < newInterval[0]) result.push(intervals[i++]);
  // 2. everything that overlaps: take it into the new interval
  let [start, end] = newInterval;
  while (i < n && intervals[i][0] <= end) {
    start = Math.min(start, intervals[i][0]);
    end = Math.max(end, intervals[i][1]);
    i++;
  }
  result.push([start, end]);
  // 3. copy everything that starts after the new interval ends
  while (i < n) result.push(intervals[i++]);
  return result;
}

console.log(insert([[1, 3], [6, 9]], [2, 5]));                              // [[1, 5], [6, 9]]
console.log(insert([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]));    // [[1, 2], [3, 10], [12, 16]]
console.log(insert([], [5, 7]));                                            // [[5, 7]]`;

const eraseCode = `// Fewest intervals to remove so the rest do not overlap.
// Same as: keep as many as possible (activity selection), then take that away from the total.
function eraseOverlapIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]);   // by END
  let kept = 0;
  let lastEnd = -Infinity;
  for (const [start, end] of sorted) {
    if (start >= lastEnd) {          // touching is fine here: [1,2] and [2,3] do not overlap
      kept++;
      lastEnd = end;
    }
  }
  return intervals.length - kept;
}

console.log(eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]])); // 1
console.log(eraseOverlapIntervals([[1, 2], [1, 2], [1, 2]]));         // 2
console.log(eraseOverlapIntervals([[1, 2], [2, 3]]));                 // 0`;

const arrowsCode = `// Balloons are intervals on a line. One arrow at x bursts every balloon with start <= x <= end.
function findMinArrowShots(points) {
  const sorted = [...points].sort((a, b) => a[1] - b[1]);   // by END
  let arrows = 0;
  let arrowAt = -Infinity;
  for (const [start, end] of sorted) {
    if (start > arrowAt) {           // the last arrow does not hit this balloon
      arrows++;
      arrowAt = end;                 // shoot as far right as possible and still hit it
    }
  }
  return arrows;
}

console.log(findMinArrowShots([[10, 16], [2, 8], [1, 6], [7, 12]])); // 2
console.log(findMinArrowShots([[1, 2], [3, 4], [5, 6], [7, 8]]));    // 4
console.log(findMinArrowShots([[1, 2], [2, 3], [3, 4], [4, 5]]));    // 2`;

const roomsCode = `// Meeting rooms I: can one person attend all meetings?
function canAttendMeetings(meetings) {
  const sorted = [...meetings].sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] < sorted[i - 1][1]) return false;   // it starts before the previous one ends
  }
  return true;
}

// Meeting rooms II: the fewest rooms needed. Sort starts and ends SEPARATELY.
function minMeetingRooms(meetings) {
  const starts = meetings.map((m) => m[0]).sort((a, b) => a - b);
  const ends = meetings.map((m) => m[1]).sort((a, b) => a - b);
  let rooms = 0;
  let e = 0;                                // the earliest meeting that has not ended yet
  for (let s = 0; s < starts.length; s++) {
    if (starts[s] < ends[e]) rooms++;       // nobody has left yet, so we need one more room
    else e++;                               // someone just left, so reuse their room
  }
  return rooms;
}

console.log(canAttendMeetings([[0, 30], [5, 10], [15, 20]])); // false
console.log(canAttendMeetings([[7, 10], [2, 4]]));            // true
console.log(minMeetingRooms([[0, 30], [5, 10], [15, 20]]));   // 2
console.log(minMeetingRooms([[7, 10], [2, 4]]));              // 1
console.log(minMeetingRooms([[1, 5], [5, 9], [9, 12]]));      // 1   (back to back is fine)`;

const intersectCode = `// Two lists of sorted, non-overlapping intervals. Return where they overlap.
function intervalIntersection(A, B) {
  const result = [];
  let i = 0, j = 0;
  while (i < A.length && j < B.length) {
    const lo = Math.max(A[i][0], B[j][0]);       // the later start
    const hi = Math.min(A[i][1], B[j][1]);       // the earlier end
    if (lo <= hi) result.push([lo, hi]);         // there is a real overlap
    if (A[i][1] < B[j][1]) i++; else j++;        // move past the one that ends first, because it cannot overlap anything later
  }
  return result;
}

console.log(intervalIntersection([[0, 2], [5, 10], [13, 23], [24, 25]], [[1, 5], [8, 12], [15, 24], [25, 26]]));
// [[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]]
console.log(intervalIntersection([[1, 3], [5, 9]], []));  // []`;

export default function DsaLessonFortyEightPage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="what">What is an interval?</h2>
      <p>
        An <strong>interval</strong> is a part of a number line with a start and an end. Examples: a meeting from 9 to 10, a balloon
        spanning 3 to 7 on a wall, or a booking from day 5 to day 8. In code, we store one as an array with two items:{" "}
        <code>[start, end]</code>. A problem gives us a list of them: <code>[[1, 3], [2, 6], [8, 10]]</code>.
      </p>
      <p>
        Interval problems ask questions like these. Which of them overlap (share some of the same space)? Combine the overlapping
        ones. How many can I keep without any overlap? How many things happen at the same time? They all use the trick from the last
        lesson: <strong>sort by the right key, then scan once</strong>.
      </p>

      <h2 id="overlap">When do two intervals overlap?</h2>
      <p>
        Draw two intervals on a line. They overlap when neither one is completely to the left of the other. Another way to say it:{" "}
        <em>each one starts before the other one ends</em>. For <code>a = [s1, e1]</code> and <code>b = [s2, e2]</code>:
      </p>
      <CodeBlock lang="js" code={overlapCode} />
      <DryRun
        title="intervals drawn on a line (positions 0 to 9, # = covered)"
        cols={["Case", "a", "b", "Overlap?"]}
        rows={overlapRows}
        note="Each row shows the two intervals one above the other. When you are not sure about a condition, draw the two extreme cases: fully apart, and one inside the other."
      />
      <Callout kind="warn" label="Touching: is it an overlap?">
        Whether <code>[1, 4]</code> and <code>[4, 8]</code> overlap depends on the problem. When you merge ranges, they share the point
        4, so they merge (use <code>&lt;=</code>). For meetings, one that ends at 4 and the next that starts at 4 do <em>not</em>{" "}
        clash (use <code>&lt;</code>). Read the problem carefully and test the touching case.
      </Callout>

      <h2 id="sort">Sort first</h2>
      <p>
        If the intervals are in random order, any one of them could overlap any other. That needs n² comparisons (about n times n).
        After <strong>sorting by start</strong>, an interval can only overlap the ones right before it. So one pass from left to right
        is enough. Sorting costs O(n log n), and that is the cost of the whole solution.
      </p>

      <h2 id="merge">Merge intervals</h2>
      <p>
        <em>Merge</em> means: combine all overlapping intervals, so that you have as few intervals as possible. Sort by start, and
        keep a list of merged results. Look at each interval. If it starts at or before the end of the last merged interval, stretch
        that one. Its new end is the <em>larger</em> of the two ends, because the new interval may sit completely inside the old
        one. Otherwise there is a gap, so start a new interval.
      </p>
      <CodeBlock lang="js" code={mergeCode} />

      <h2 id="trace">Traced: merging</h2>
      <CodeTrace
        code={traceSrc}
        steps={mergeTrace()}
        caption="After sorting, [1,3] and [2,6] overlap and become [1,6]. [8,10] and [15,18] each start after the previous end, so they stay separate."
      />
      <p>
        The time is O(n log n) for the sort, plus O(n) for the scan. The space is O(n) for the result.
      </p>

      <h2 id="insert">Insert an interval</h2>
      <p>
        You get a list that is already sorted and has no overlaps. You also get one new interval. Put it in, and merge whatever it
        touches. The list is already sorted, so you do not need to sort again. The new interval meets the list in three phases.
      </p>
      <ol>
        <li>Copy every interval that ends <em>before</em> the new one starts.</li>
        <li>Take in every interval that starts at or before the end of the new one. Stretch the new one to cover them.</li>
        <li>Copy the rest.</li>
      </ol>
      <CodeBlock lang="js" code={insertCode} />
      <p>This is O(n), because each interval is handled exactly once.</p>

      <h2 id="erase">Remove the fewest: sort by end</h2>
      <p>
        <em>Non-overlapping intervals</em>: remove as few intervals as you can, so that the rest do not overlap. Turn it around: keep
        as many as you can. That is the activity selection problem from lesson 47, so the rule is the same. Sort by{" "}
        <strong>end</strong>. Keep an interval whenever it starts at or after the end of the last one you kept. The interval that
        ends first leaves the most room, and that is what the exchange argument needs. Sorting by start would fail on{" "}
        <code>[[1, 100], [2, 3], [4, 5]]</code>. It would keep the long one first and lose the other two.
      </p>
      <CodeBlock lang="js" code={eraseCode} />

      <h2 id="arrows">Minimum arrows</h2>
      <p>
        Balloons are intervals along the x-axis (the line going left to right). An arrow shot straight up at position <code>x</code>{" "}
        bursts every balloon with <code>start &lt;= x &lt;= end</code>. Find the fewest arrows. It is the same sort-then-scan idea again. Sort by
        end. Shoot at the <em>end</em> of the first balloon. This is as far right as possible while still hitting it, so it catches
        the most later balloons. Skip every balloon that this arrow also hits. Then shoot again at the first balloon it misses. The
        test is <code>start &gt; arrowAt</code>. It is strict, because balloons that only touch can share one arrow.
      </p>
      <CodeBlock lang="js" code={arrowsCode} />

      <h2 id="rooms">Meeting rooms I and II</h2>
      <p>
        <strong>Meeting rooms I:</strong> can one person attend every meeting? Sort by start. If any meeting starts before the
        previous one has ended, the answer is no.
      </p>
      <p>
        <strong>Meeting rooms II:</strong> what is the fewest rooms you need? Another way to ask: what is the largest number of
        meetings at the same moment? A classic answer uses a min-heap (lesson 46) of end times. But JavaScript has no built-in heap, so here is a
        neat trick that needs only sorting. Sort the <em>starts</em> and the <em>ends</em> as two separate lists. Walk through the
        starts in order. If a meeting starts before the earliest end that is still waiting, nobody has left yet, so you need a new
        room. Otherwise someone just left. Reuse their room by moving past that end.
      </p>
      <CodeBlock lang="js" code={roomsCode} />
      <Callout kind="note" label="Premium questions">
        On LeetCode, Meeting Rooms (252) and Meeting Rooms II (253) are only for paying members. The practice section below writes
        them out in full, so you can solve them without an account.
      </Callout>

      <h2 id="intersect">Intersections of two lists</h2>
      <p>
        You get two lists of intervals. Each list is sorted and has no overlaps inside it. List the places where an interval from one
        list overlaps an interval from the other. Use two pointers (two markers that move along the lists). The overlap of the pair
        under the pointers, if there is one, goes from the later start to the earlier end. Then move the pointer whose interval ends
        first. That interval cannot overlap anything later in the other list.
      </p>
      <CodeBlock lang="js" code={intersectCode} />

      <h2 id="practice">Practice questions</h2>
      <p>Before you write code, decide two things. What will you sort by? Do touching intervals count as overlapping?</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the overlap test for two intervals, and explain when you use &lt; and when you use &lt;=.</>,
          <>Explain why merge sorts by start, but &quot;remove the fewest&quot; sorts by end.</>,
          <>Describe the three phases of insert interval.</>,
          <>Explain why meeting rooms II works with starts and ends sorted separately.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        That finishes this part on heaps, greedy choices and intervals. <strong>Lesson 49</strong> starts the next part with{" "}
        <strong>graphs</strong>. A graph is a set of nodes joined by edges (think of cities joined by roads). You will learn how to
        store graphs and how to search them.
      </p>
    </DsaLessonPage>
  );
}
