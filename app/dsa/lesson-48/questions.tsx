import Problem from "@/components/dsa/Problem";

/** Lesson 48 practice questions: interval problems. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Merge intervals"
        level="Medium"
        examples={[
          { input: "[[1, 3], [2, 6], [8, 10], [15, 18]]", output: "[[1, 6], [8, 10], [15, 18]]", why: "[1,3] and [2,6] overlap and become [1,6]." },
          { input: "[[1, 4], [4, 5]]", output: "[[1, 5]]", why: "They touch at 4, which counts as overlapping." },
        ]}
        hints={[
          <>The intervals may come in any order. What does sorting by start buy you?</>,
          <>Compare each interval only with the last merged one. Its new end is the larger of the two ends.</>,
        ]}
        approaches={[
          {
            name: "Brute force: keep merging until nothing changes",
            idea: <p>Repeat: find any two intervals that overlap, replace them by their union, and start over. Stop when a full pass finds no overlap.</p>,
            code: `function merge(intervals) {
  let list = intervals.map((x) => [...x]);
  let changed = true;
  while (changed) {
    changed = false;
    outer: for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (list[i][0] <= list[j][1] && list[j][0] <= list[i][1]) {
          list[i] = [Math.min(list[i][0], list[j][0]), Math.max(list[i][1], list[j][1])];
          list.splice(j, 1);
          changed = true;
          break outer;
        }
      }
    }
  }
  return list.sort((a, b) => a[0] - b[0]);
}

console.log(merge([[1, 3], [2, 6], [8, 10], [15, 18]])); // [[1, 6], [8, 10], [15, 18]]
console.log(merge([[1, 4], [4, 5]]));                    // [[1, 5]]`,
            explain: <p>Correct but slow: every merge restarts the search, so it is O(n³) in the worst case.</p>,
          },
          {
            name: "Sort by start, then sweep",
            idea: <p>Sort by start. Push the first interval. For each next one: if it starts at or before the last interval&apos;s end, extend that end; otherwise push it as new.</p>,
            code: `function merge(intervals) {
  const sorted = intervals.map((x) => [...x]).sort((a, b) => a[0] - b[0]);
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (sorted[i][0] <= last[1]) last[1] = Math.max(last[1], sorted[i][1]);
    else merged.push(sorted[i]);
  }
  return merged;
}

console.log(merge([[1, 3], [2, 6], [8, 10], [15, 18]])); // [[1, 6], [8, 10], [15, 18]]
console.log(merge([[1, 4], [4, 5]]));                    // [[1, 5]]
console.log(merge([[1, 10], [2, 3], [4, 5]]));           // [[1, 10]]`,
            explain: <p>After sorting, only the last merged interval can overlap the next one, so one pass is enough. Taking the maximum of the ends handles an interval lying completely inside the last one. O(n log n) time, O(n) space.</p>,
          },
        ]}
        compare={<p>The sort and sweep. (LeetCode 56.)</p>}
      >
        <p>Given an array of intervals <code>[start, end]</code>, merge all overlapping intervals and return the non-overlapping intervals that cover the same ranges.</p>
      </Problem>

      <Problem
        n={2}
        title="Insert interval"
        level="Medium"
        examples={[
          { input: "intervals = [[1, 3], [6, 9]], newInterval = [2, 5]", output: "[[1, 5], [6, 9]]", why: "[2,5] overlaps [1,3] and they merge into [1,5]." },
          { input: "intervals = [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], newInterval = [4, 8]", output: "[[1, 2], [3, 10], [12, 16]]", why: "[4,8] overlaps [3,5], [6,7] and [8,10]." },
        ]}
        hints={[
          <>The list is already sorted and non-overlapping. Which intervals are definitely unaffected?</>,
          <>Split the list into: before, overlapping, after.</>,
        ]}
        approaches={[
          {
            name: "Add it, sort, and merge",
            idea: <p>Push the new interval into the list and run the merge-intervals solution.</p>,
            code: `function insert(intervals, newInterval) {
  const all = [...intervals, newInterval].sort((a, b) => a[0] - b[0]);
  const merged = [[...all[0]]];
  for (let i = 1; i < all.length; i++) {
    const last = merged[merged.length - 1];
    if (all[i][0] <= last[1]) last[1] = Math.max(last[1], all[i][1]);
    else merged.push([...all[i]]);
  }
  return merged;
}

console.log(insert([[1, 3], [6, 9]], [2, 5])); // [[1, 5], [6, 9]]
console.log(insert([], [5, 7]));               // [[5, 7]]`,
            explain: <p>Simple and correct. O(n log n) because of the sort, which the input order makes unnecessary.</p>,
          },
          {
            name: "Three phases in one pass",
            idea: <p>Copy intervals that end before the new one starts; absorb those that start at or before its end; copy the rest.</p>,
            code: `function insert(intervals, newInterval) {
  const result = [];
  let i = 0;
  const n = intervals.length;
  while (i < n && intervals[i][1] < newInterval[0]) result.push(intervals[i++]);
  let [start, end] = newInterval;
  while (i < n && intervals[i][0] <= end) {
    start = Math.min(start, intervals[i][0]);
    end = Math.max(end, intervals[i][1]);
    i++;
  }
  result.push([start, end]);
  while (i < n) result.push(intervals[i++]);
  return result;
}

console.log(insert([[1, 3], [6, 9]], [2, 5]));                           // [[1, 5], [6, 9]]
console.log(insert([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8])); // [[1, 2], [3, 10], [12, 16]]
console.log(insert([[1, 5]], [2, 3]));                                   // [[1, 5]]`,
            explain: <p>Each interval is visited once: O(n) time and O(n) space for the output. Using the existing order is the point of the question.</p>,
          },
        ]}
        compare={<p>The three-phase pass, which is O(n). Mention the sort-and-merge version first if you want a safe fallback. (LeetCode 57.)</p>}
      >
        <p>You are given a list of non-overlapping intervals sorted by start, and a new interval. Insert it, merging where needed, so the list stays sorted and non-overlapping.</p>
      </Problem>

      <Problem
        n={3}
        title="Non-overlapping intervals"
        level="Medium"
        examples={[
          { input: "[[1, 2], [2, 3], [3, 4], [1, 3]]", output: "1", why: "Remove [1,3]; the rest do not overlap (touching is allowed)." },
          { input: "[[1, 2], [1, 2], [1, 2]]", output: "2", why: "Keep one of the three identical intervals." },
        ]}
        hints={[
          <>Removing the fewest is the same as keeping the most. Where have you seen &quot;most non-overlapping&quot; before?</>,
          <>Which interval should you keep first: the earliest start, the shortest, or the earliest end?</>,
        ]}
        approaches={[
          {
            name: "Dynamic programming: longest chain",
            idea: <p>Sort by start. <code>dp[i]</code> is the most intervals you can keep among the first <code>i + 1</code> if you keep interval <code>i</code> last. Answer: total minus the best chain.</p>,
            code: `function eraseOverlapIntervals(intervals) {
  const a = [...intervals].sort((x, y) => x[0] - y[0]);
  const dp = new Array(a.length).fill(1);
  let best = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < i; j++) {
      if (a[j][1] <= a[i][0]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    best = Math.max(best, dp[i]);
  }
  return a.length - best;
}

console.log(eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]])); // 1
console.log(eraseOverlapIntervals([[1, 2], [1, 2], [1, 2]]));         // 2`,
            explain: <p>Correct, but O(n²).</p>,
          },
          {
            name: "Greedy: sort by end",
            idea: <p>Sort by end. Keep an interval whenever it starts at or after the end of the last kept one; every other interval is removed.</p>,
            code: `function eraseOverlapIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]);
  let kept = 0, lastEnd = -Infinity;
  for (const [start, end] of sorted) {
    if (start >= lastEnd) { kept++; lastEnd = end; }
  }
  return intervals.length - kept;
}

console.log(eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]])); // 1
console.log(eraseOverlapIntervals([[1, 2], [1, 2], [1, 2]]));         // 2
console.log(eraseOverlapIntervals([[1, 2], [2, 3]]));                 // 0`,
            explain: <p>The interval that ends first leaves the most room (the exchange argument from lesson 47). O(n log n) time.</p>,
          },
          {
            name: "Sort by start, drop the longer one on a clash",
            idea: <p>Sort by start. When the next interval overlaps the one you are holding, remove one of them: keep whichever ends earlier.</p>,
            code: `function eraseOverlapIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  let removed = 0;
  let end = sorted[0][1];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] < end) {
      removed++;
      end = Math.min(end, sorted[i][1]);   // keep the one that ends earlier
    } else {
      end = sorted[i][1];
    }
  }
  return removed;
}

console.log(eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]])); // 1
console.log(eraseOverlapIntervals([[1, 100], [2, 3], [4, 5]]));       // 1`,
            explain: <p>Also O(n log n) and also correct, since at each clash it keeps the better candidate. The sort-by-end version is easier to prove.</p>,
          },
        ]}
        compare={<p>Sort by end. (LeetCode 435.)</p>}
      >
        <p>Given intervals, return the minimum number you must remove so the rest are non-overlapping. Intervals that only touch at an endpoint do not overlap.</p>
      </Problem>

      <Problem
        n={4}
        title="Minimum number of arrows to burst balloons"
        level="Medium"
        examples={[
          { input: "[[10, 16], [2, 8], [1, 6], [7, 12]]", output: "2", why: "Shoot at x = 6 (bursts [2,8] and [1,6]) and at x = 12 (bursts [10,16] and [7,12])." },
          { input: "[[1, 2], [3, 4], [5, 6], [7, 8]]", output: "4", why: "No two balloons share a point." },
        ]}
        hints={[
          <>A group of balloons can share an arrow when they all overlap at one common point.</>,
          <>Sort by end and shoot at the first balloon&apos;s end.</>,
        ]}
        approaches={[
          {
            name: "Sort by start, track the shared overlap",
            idea: <p>Sort by start. Keep the intersection of the balloons in the current group (latest start, earliest end). If the next balloon starts after the group&apos;s earliest end, close the group with one arrow and start a new one.</p>,
            code: `function findMinArrowShots(points) {
  const sorted = [...points].sort((a, b) => a[0] - b[0]);
  let arrows = 1;
  let groupEnd = sorted[0][1];                 // the earliest end in the current group
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] > groupEnd) { arrows++; groupEnd = sorted[i][1]; }
    else groupEnd = Math.min(groupEnd, sorted[i][1]);
  }
  return arrows;
}

console.log(findMinArrowShots([[10, 16], [2, 8], [1, 6], [7, 12]])); // 2
console.log(findMinArrowShots([[1, 2], [3, 4], [5, 6], [7, 8]]));    // 4`,
            explain: <p>The group shrinks to the part where all its balloons overlap, and a new balloon joins only if it reaches that part. O(n log n).</p>,
          },
          {
            name: "Sort by end, shoot at each end",
            idea: <p>Sort by end. Shoot the first balloon at its end. Every balloon that starts at or before that point is also burst. At the first one that starts later, shoot again at its end.</p>,
            code: `function findMinArrowShots(points) {
  const sorted = [...points].sort((a, b) => a[1] - b[1]);
  let arrows = 0, arrowAt = -Infinity;
  for (const [start, end] of sorted) {
    if (start > arrowAt) { arrows++; arrowAt = end; }
  }
  return arrows;
}

console.log(findMinArrowShots([[10, 16], [2, 8], [1, 6], [7, 12]])); // 2
console.log(findMinArrowShots([[1, 2], [2, 3], [3, 4], [4, 5]]));    // 2
console.log(findMinArrowShots([[1, 1]]));                            // 1`,
            explain: <p>Shooting at the earliest end is as far right as possible while still bursting that balloon, so it catches the most later balloons. O(n log n). The same loop as &quot;remove the fewest&quot; except the touching case counts as hit.</p>,
          },
        ]}
        compare={<p>Either. Sort by end is the shorter. (LeetCode 452.)</p>}
      >
        <p>Balloons are given as <code>[xStart, xEnd]</code> on a line. An arrow shot vertically at <code>x</code> bursts every balloon with <code>xStart &lt;= x &lt;= xEnd</code>. Return the minimum number of arrows needed to burst them all.</p>
      </Problem>

      <Problem
        n={5}
        title="Meeting rooms"
        level="Easy"
        examples={[
          { input: "[[0, 30], [5, 10], [15, 20]]", output: "false", why: "The meeting [0,30] overlaps both of the others." },
          { input: "[[7, 10], [2, 4]]", output: "true", why: "Sorted: [2,4] then [7,10]; no clash." },
        ]}
        hints={[
          <>If the meetings were in order of start time, which pairs would you need to check?</>,
        ]}
        approaches={[
          {
            name: "Check every pair",
            idea: <p>Compare every two meetings and return false if any overlap.</p>,
            code: `function canAttendMeetings(meetings) {
  for (let i = 0; i < meetings.length; i++) {
    for (let j = i + 1; j < meetings.length; j++) {
      if (meetings[i][0] < meetings[j][1] && meetings[j][0] < meetings[i][1]) return false;
    }
  }
  return true;
}

console.log(canAttendMeetings([[0, 30], [5, 10], [15, 20]])); // false
console.log(canAttendMeetings([[7, 10], [2, 4]]));            // true`,
            explain: <p>O(n²). Note the strict <code>&lt;</code>: a meeting that ends at 10 and another that starts at 10 do not clash.</p>,
          },
          {
            name: "Sort by start and check neighbours",
            idea: <p>After sorting by start, a clash can only occur between neighbours. Return false if any meeting starts before the previous one ends.</p>,
            code: `function canAttendMeetings(meetings) {
  const sorted = [...meetings].sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] < sorted[i - 1][1]) return false;
  }
  return true;
}

console.log(canAttendMeetings([[0, 30], [5, 10], [15, 20]])); // false
console.log(canAttendMeetings([[7, 10], [2, 4]]));            // true
console.log(canAttendMeetings([[1, 5], [5, 9]]));             // true
console.log(canAttendMeetings([]));                           // true`,
            explain: <p>Suppose meeting k clashes with some earlier meeting j. Then k starts before j ends. Walking from j to k, the meetings are in order of start, so either one of them already clashes with its own neighbour, or j and k are themselves neighbours. Either way a neighbour clash exists. O(n log n).</p>,
          },
        ]}
        compare={<p>Sort and check neighbours. This is a premium problem on LeetCode (252, &quot;Meeting Rooms&quot;); the statement is reproduced here.</p>}
      >
        <p>Given meeting time intervals <code>[start, end]</code>, determine whether one person could attend all of them. Meetings that end exactly when another starts do not conflict.</p>
      </Problem>

      <Problem
        n={6}
        title="Meeting rooms II"
        level="Medium"
        examples={[
          { input: "[[0, 30], [5, 10], [15, 20]]", output: "2", why: "[0,30] is always running; the other two never run together." },
          { input: "[[7, 10], [2, 4]]", output: "1", why: "They never overlap." },
        ]}
        hints={[
          <>Rooms needed equals the largest number of meetings happening at one instant.</>,
          <>That maximum always occurs at some meeting&apos;s start time.</>,
          <>You only need the starts in order and the ends in order, not which end belongs to which start.</>,
        ]}
        approaches={[
          {
            name: "Count overlaps at each start",
            idea: <p>For every meeting&apos;s start time, count how many meetings are running at that moment. The answer is the largest count.</p>,
            code: `function minMeetingRooms(meetings) {
  let best = 0;
  for (const [t] of meetings) {
    let running = 0;
    for (const [s, e] of meetings) if (s <= t && t < e) running++;
    best = Math.max(best, running);
  }
  return best;
}

console.log(minMeetingRooms([[0, 30], [5, 10], [15, 20]])); // 2
console.log(minMeetingRooms([[7, 10], [2, 4]]));            // 1`,
            explain: <p>O(n²).</p>,
          },
          {
            name: "Event sweep: +1 at starts, −1 at ends",
            idea: <p>Make a list of events (time, +1 for a start, −1 for an end), sort by time with ends before starts at equal times, and track the running total. The answer is its peak.</p>,
            code: `function minMeetingRooms(meetings) {
  const events = [];
  for (const [s, e] of meetings) { events.push([s, 1]); events.push([e, -1]); }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);   // at the same time, -1 (end) comes first
  let running = 0, best = 0;
  for (const [, delta] of events) {
    running += delta;
    best = Math.max(best, running);
  }
  return best;
}

console.log(minMeetingRooms([[0, 30], [5, 10], [15, 20]])); // 2
console.log(minMeetingRooms([[7, 10], [2, 4]]));            // 1
console.log(minMeetingRooms([[1, 5], [5, 9], [9, 12]]));    // 1`,
            explain: <p>O(n log n). The tie rule matters: a meeting ending at 5 frees its room for one starting at 5.</p>,
          },
          {
            name: "Two sorted lists, two pointers",
            idea: <p>Sort the starts and the ends separately. For each start in order: if it is before the earliest unfinished end, a new room is needed; otherwise reuse that room and advance the end pointer.</p>,
            code: `function minMeetingRooms(meetings) {
  const starts = meetings.map((m) => m[0]).sort((a, b) => a - b);
  const ends = meetings.map((m) => m[1]).sort((a, b) => a - b);
  let rooms = 0, e = 0;
  for (let s = 0; s < starts.length; s++) {
    if (starts[s] < ends[e]) rooms++;
    else e++;
  }
  return rooms;
}

console.log(minMeetingRooms([[0, 30], [5, 10], [15, 20]])); // 2
console.log(minMeetingRooms([[7, 10], [2, 4]]));            // 1
console.log(minMeetingRooms([[1, 5], [5, 9], [9, 12]]));    // 1`,
            explain: <p>O(n log n) time and no heap needed. The ends being sorted separately does not matter, because we only ask whether <em>some</em> meeting has already ended, never which one. (The usual alternative, a min-heap of end times, gives the same answer.)</p>,
          },
        ]}
        compare={<p>The two-pointer version or the event sweep; both are easy to code without a heap. This is a premium problem on LeetCode (253, &quot;Meeting Rooms II&quot;); the statement is reproduced here.</p>}
      >
        <p>Given meeting time intervals <code>[start, end]</code>, return the minimum number of conference rooms required. A meeting that ends at time t and one that starts at time t can share a room.</p>
      </Problem>

      <Problem
        n={7}
        title="Interval list intersections"
        level="Medium"
        examples={[
          { input: "A = [[0, 2], [5, 10], [13, 23], [24, 25]], B = [[1, 5], [8, 12], [15, 24], [25, 26]]", output: "[[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]]", why: "For example [5,10] meets [1,5] at the single point 5 and [8,12] in [8,10]." },
          { input: "A = [[1, 3], [5, 9]], B = []", output: "[]", why: "B is empty, so nothing intersects." },
        ]}
        hints={[
          <>The intersection of two intervals runs from the later start to the earlier end, if that range is valid.</>,
          <>Both lists are sorted. After handling a pair, which interval can you discard?</>,
        ]}
        approaches={[
          {
            name: "Compare every pair",
            idea: <p>For every interval in A and every interval in B, compute the overlap and keep it if it is valid.</p>,
            code: `function intervalIntersection(A, B) {
  const result = [];
  for (const a of A) {
    for (const b of B) {
      const lo = Math.max(a[0], b[0]);
      const hi = Math.min(a[1], b[1]);
      if (lo <= hi) result.push([lo, hi]);
    }
  }
  return result.sort((x, y) => x[0] - y[0]);
}

console.log(intervalIntersection([[1, 3], [5, 9]], [[2, 6]])); // [[2, 3], [5, 6]]`,
            explain: <p>O(m · n). Ignores that both lists are sorted.</p>,
          },
          {
            name: "Two pointers",
            idea: <p>Look at A[i] and B[j]. Record their overlap if any. Then move past whichever ends first, since it cannot overlap anything later in the other list.</p>,
            code: `function intervalIntersection(A, B) {
  const result = [];
  let i = 0, j = 0;
  while (i < A.length && j < B.length) {
    const lo = Math.max(A[i][0], B[j][0]);
    const hi = Math.min(A[i][1], B[j][1]);
    if (lo <= hi) result.push([lo, hi]);
    if (A[i][1] < B[j][1]) i++; else j++;
  }
  return result;
}

console.log(intervalIntersection([[1, 3], [5, 9]], [[2, 6]]));  // [[2, 3], [5, 6]]
console.log(intervalIntersection([[1, 3], [5, 9]], []));        // []
console.log(intervalIntersection([[1, 7]], [[3, 10]]));         // [[3, 7]]`,
            explain: <p>Each step advances a pointer, so there are at most m + n steps: O(m + n) time. The output is already sorted.</p>,
          },
        ]}
        compare={<p>Two pointers, a close cousin of merging two sorted lists. (LeetCode 986.)</p>}
      >
        <p>You are given two lists of closed intervals, each sorted and made of pairwise disjoint intervals. Return their intersection, also as a sorted list of intervals.</p>
      </Problem>
    </>
  );
}
