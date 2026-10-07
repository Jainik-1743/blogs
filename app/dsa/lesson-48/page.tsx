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
      last[1] = Math.max(last[1], sorted[i][1]);   // overlap: stretch the last interval
    } else {
      merged.push([...sorted[i]]);                  // gap: start a new one
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
  t.step(1, "start", "intervals as given", "The intervals arrive in any order, so neighbours in the list are not necessarily neighbours on the number line.", { intervals });
  intervals.sort((a, b) => a[0] - b[0]);
  t.step(1, "run", "sort by start", "Now any interval that could overlap an earlier one sits right after it.", { intervals }, "intervals");
  const merged = [[...intervals[0]]];
  t.step(2, "run", "merged = [first interval]", "The first interval is our current candidate.", { intervals, merged }, "merged");
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const overlap = intervals[i][0] <= last[1];
    t.step(5, "check", `[${intervals[i]}] starts at ${intervals[i][0]}; last ends at ${last[1]}`, overlap ? `${intervals[i][0]} <= ${last[1]}: the new interval starts before (or when) the last one ends, so they overlap.` : `${intervals[i][0]} > ${last[1]}: there is a gap, so no overlap.`, { i, intervals, merged }, "i");
    if (overlap) {
      last[1] = Math.max(last[1], intervals[i][1]);
      t.step(6, "update", `stretch last to end at ${last[1]}`, `The merged end is the larger of the two ends, in case the new interval sits inside the last one.`, { i, intervals, merged }, "merged");
    } else {
      merged.push([...intervals[i]]);
      t.step(8, "update", `push [${intervals[i]}]`, "Start a new candidate; the earlier ones are final.", { i, intervals, merged }, "merged");
    }
  }
  t.print(merged);
  t.step(11, "print", "print merged", "Three separate stretches remain.", { merged });
  return t.steps;
}

const insertCode = `function insert(intervals, newInterval) {
  const result = [];
  let i = 0;
  const n = intervals.length;
  // 1. everything that ends before the new interval starts
  while (i < n && intervals[i][1] < newInterval[0]) result.push(intervals[i++]);
  // 2. everything that overlaps: absorb it into the new interval
  let [start, end] = newInterval;
  while (i < n && intervals[i][0] <= end) {
    start = Math.min(start, intervals[i][0]);
    end = Math.max(end, intervals[i][1]);
    i++;
  }
  result.push([start, end]);
  // 3. everything that starts after the new interval ends
  while (i < n) result.push(intervals[i++]);
  return result;
}

console.log(insert([[1, 3], [6, 9]], [2, 5]));                              // [[1, 5], [6, 9]]
console.log(insert([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]));    // [[1, 2], [3, 10], [12, 16]]
console.log(insert([], [5, 7]));                                            // [[5, 7]]`;

const eraseCode = `// Fewest intervals to remove so the rest do not overlap.
// Same as: keep as many as possible (activity selection), then subtract from the total.
function eraseOverlapIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]);   // by END
  let kept = 0;
  let lastEnd = -Infinity;
  for (const [start, end] of sorted) {
    if (start >= lastEnd) {          // touching is fine: [1,2] and [2,3] do not overlap here
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
    if (start > arrowAt) {           // this balloon is not hit by the last arrow
      arrows++;
      arrowAt = end;                 // shoot as far right as possible while still hitting it
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
    if (sorted[i][0] < sorted[i - 1][1]) return false;   // starts before the previous one ends
  }
  return true;
}

// Meeting rooms II: the fewest rooms needed. Sort starts and ends SEPARATELY.
function minMeetingRooms(meetings) {
  const starts = meetings.map((m) => m[0]).sort((a, b) => a - b);
  const ends = meetings.map((m) => m[1]).sort((a, b) => a - b);
  let rooms = 0;
  let e = 0;                                // the earliest meeting that has not yet ended
  for (let s = 0; s < starts.length; s++) {
    if (starts[s] < ends[e]) rooms++;       // nobody has left yet: we need one more room
    else e++;                               // someone just left: reuse their room
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
    if (lo <= hi) result.push([lo, hi]);         // a real overlap exists
    if (A[i][1] < B[j][1]) i++; else j++;        // drop the one that ends first: it cannot overlap anything later
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
        An <strong>interval</strong> is a stretch of a number line with a start and an end: a meeting from 9 to 10, a balloon
        spanning 3 to 7 on a wall, a booking from day 5 to day 8. In code we store one as a two-item array{" "}
        <code>[start, end]</code>, and a problem hands us a list of them: <code>[[1, 3], [2, 6], [8, 10]]</code>.
      </p>
      <p>
        Interval problems ask things like: &quot;which of these overlap?&quot;, &quot;combine the overlapping ones&quot;,
        &quot;how many can I keep without any overlap?&quot;, &quot;how many things happen at the same time?&quot;. They all use the
        last lesson&apos;s trick: <strong>sort by the right key, then scan once</strong>.
      </p>

      <h2 id="overlap">When do two intervals overlap?</h2>
      <p>
        Draw two intervals on a line. They overlap when neither one is completely to the left of the other. Put differently:{" "}
        <em>each one starts before the other one ends</em>. For <code>a = [s1, e1]</code> and <code>b = [s2, e2]</code>:
      </p>
      <CodeBlock lang="js" code={overlapCode} />
      <DryRun
        title="intervals drawn on a line (positions 0 to 9, # = covered)"
        cols={["Case", "a", "b", "Overlap?"]}
        rows={overlapRows}
        note="Each row shows the two intervals stacked. When you find yourself guessing at conditions, draw the two extremes: fully apart, and one inside the other."
      />
      <Callout kind="warn" label="Touching: is it an overlap?">
        Whether <code>[1, 4]</code> and <code>[4, 8]</code> overlap depends on the problem. When merging ranges they share the point
        4, so they merge (use <code>&lt;=</code>). For meetings, one ending at 4 and the next starting at 4 is fine, so they
        do <em>not</em> clash (use <code>&lt;</code>). Read the statement and test the touching case.
      </Callout>

      <h2 id="sort">Sort first</h2>
      <p>
        If intervals are in random order, any one of them could overlap any other, which needs n² comparisons. After{" "}
        <strong>sorting by start</strong>, an interval can only overlap the ones right before it, so a single left-to-right pass
        is enough. Sorting costs O(n log n), and that is the cost of the whole solution.
      </p>

      <h2 id="merge">Merge intervals</h2>
      <p>
        <em>Merge</em>: combine all overlapping intervals into as few intervals as possible. Sort by start; keep a list of merged
        results. For each interval, if it starts at or before the end of the last merged one, stretch that one (its new end is the{" "}
        <em>larger</em> of the two ends, since the newcomer may sit entirely inside). Otherwise there is a gap, so start a new one.
      </p>
      <CodeBlock lang="js" code={mergeCode} />

      <h2 id="trace">Traced: merging</h2>
      <CodeTrace
        code={traceSrc}
        steps={mergeTrace()}
        caption="After sorting, [1,3] and [2,6] overlap and become [1,6]. [8,10] and [15,18] each start after the previous end, so they stay separate."
      />
      <p>
        Time O(n log n) for the sort plus O(n) for the scan; space O(n) for the result.
      </p>

      <h2 id="insert">Insert an interval</h2>
      <p>
        You are given a list that is already sorted and has no overlaps, plus one new interval. Insert it and merge whatever it
        touches. Because the list is sorted, there is no need to sort again: the new interval meets the list in three phases.
      </p>
      <ol>
        <li>Copy every interval that ends <em>before</em> the new one starts.</li>
        <li>Absorb every interval that starts at or before the new one&apos;s end (stretch the new one to cover them).</li>
        <li>Copy the rest.</li>
      </ol>
      <CodeBlock lang="js" code={insertCode} />
      <p>That is O(n), because each interval is handled exactly once.</p>

      <h2 id="erase">Remove the fewest: sort by end</h2>
      <p>
        <em>Non-overlapping intervals</em>: remove the fewest intervals so that the rest do not overlap. Flip it around: keep as
        many as possible. That is the activity selection problem from lesson 47, so the rule is the same: sort by{" "}
        <strong>end</strong> and keep an interval whenever it starts at or after the end of the last kept one. The earliest-ending
        interval leaves the most room, which is what the exchange argument needs. Sorting by start would fail on{" "}
        <code>[[1, 100], [2, 3], [4, 5]]</code>: it would keep the long one first and lose two.
      </p>
      <CodeBlock lang="js" code={eraseCode} />

      <h2 id="arrows">Minimum arrows</h2>
      <p>
        Balloons are intervals along the x-axis. An arrow shot straight up at position <code>x</code> bursts every balloon with{" "}
        <code>start &lt;= x &lt;= end</code>. Find the fewest arrows. This is the same sweep again: sort by end, shoot the first
        balloon at its <em>end</em> (as far right as possible while still hitting it, so it catches the most later balloons), then
        skip every balloon that arrow also hits, and shoot again at the first one it misses. The test is{" "}
        <code>start &gt; arrowAt</code> (strict: balloons that only touch share an arrow position).
      </p>
      <CodeBlock lang="js" code={arrowsCode} />

      <h2 id="rooms">Meeting rooms I and II</h2>
      <p>
        <strong>Meeting rooms I:</strong> can one person attend every meeting? Sort by start; if any meeting starts before the
        previous one has ended, the answer is no.
      </p>
      <p>
        <strong>Meeting rooms II:</strong> what is the fewest number of rooms needed? Equivalently, what is the largest number of
        meetings happening at the same moment? A classic answer uses a min-heap of end times, but JavaScript has no built-in heap, so
        here is a neat trick that needs only sorting. Sort the <em>starts</em> and the <em>ends</em> as two separate lists. Walk
        through the starts in order. If a meeting starts before the earliest unfinished end, nobody has left yet, so a new room is
        needed. Otherwise somebody just left, and we reuse their room by moving past that end.
      </p>
      <CodeBlock lang="js" code={roomsCode} />
      <Callout kind="note" label="Premium questions">
        On LeetCode, Meeting Rooms (252) and Meeting Rooms II (253) are premium-only problems. The practice section below states
        them in full, so you can solve them without an account.
      </Callout>

      <h2 id="intersect">Intersections of two lists</h2>
      <p>
        Given two lists of intervals, each sorted and each free of overlaps, list the places where an interval from one list
        overlaps an interval from the other. Use two pointers. The overlap of the pair under the pointers, if any, runs from the
        later start to the earlier end. Then advance the pointer whose interval ends first: it can overlap nothing later in the
        other list.
      </p>
      <CodeBlock lang="js" code={intersectCode} />

      <h2 id="practice">Practice questions</h2>
      <p>Before coding, decide: what to sort by, and whether touching intervals count as overlapping.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the overlap test for two intervals and explain when you use &lt; and when &lt;=.</>,
          <>Explain why merge sorts by start but &quot;remove the fewest&quot; sorts by end.</>,
          <>Describe the three phases of insert interval.</>,
          <>Explain why meeting rooms II works with separately sorted starts and ends.</>,
        ]}
      />

      <h2 id="next">What&apos;s next</h2>
      <p>
        That finishes this part on heaps, greedy choices and intervals. <strong>Lesson 49</strong> begins the next one with{" "}
        <strong>graphs</strong>: a collection of nodes joined by edges, and the way to represent and search them.
      </p>
    </DsaLessonPage>
  );
}
