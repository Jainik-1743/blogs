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
          { input: "[[1, 4], [4, 5]]", output: "[[1, 5]]", why: "They touch at 4, and touching counts as overlapping." },
        ]}
        hints={[
          <>The intervals can come in any order. How does sorting by start help you?</>,
          <>Compare each interval only with the last merged one. The new end is the larger of the two ends.</>,
        ]}
        approaches={[
          {
            name: "Brute force: keep merging until nothing changes",
            idea: <p>Repeat this: find any two intervals that overlap and replace them with one interval that covers both. Then start over. Stop when a full pass finds no overlap.</p>,
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
            explain: <p>It is correct but slow. Every merge restarts the search, so the worst case is O(n³).</p>,
          },
          {
            name: "Sort by start, then sweep",
            idea: <p>Sort by start. Push the first interval. Then look at each next interval. If it starts at or before the end of the last interval, make that end longer. Otherwise, push it as a new interval.</p>,
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
            explain: <p>After sorting, only the last merged interval can overlap the next one, so one pass is enough. Taking the larger of the two ends handles an interval that lies completely inside the last one. It takes O(n log n) time and O(n) space.</p>,
          },
        ]}
        compare={<p>Use the sort and sweep. (LeetCode 56.)</p>}
      >
        <p>You get an array of intervals <code>[start, end]</code>. Merge all overlapping intervals. Return the intervals that do not overlap and cover the same ranges.</p>
      </Problem>

      <Problem
        n={2}
        title="Insert interval"
        level="Medium"
        examples={[
          { input: "intervals = [[1, 3], [6, 9]], newInterval = [2, 5]", output: "[[1, 5], [6, 9]]", why: "[2,5] overlaps [1,3], so they merge into [1,5]." },
          { input: "intervals = [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], newInterval = [4, 8]", output: "[[1, 2], [3, 10], [12, 16]]", why: "[4,8] overlaps [3,5], [6,7] and [8,10]." },
        ]}
        hints={[
          <>The list is already sorted and has no overlaps. Which intervals are surely not changed?</>,
          <>Split the list into three parts: before, overlapping, and after.</>,
        ]}
        approaches={[
          {
            name: "Add it, sort, and merge",
            idea: <p>Push the new interval into the list. Then run the merge-intervals solution.</p>,
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
            explain: <p>It is simple and correct. It takes O(n log n) because of the sort. The sort is not needed, because the input is already in order.</p>,
          },
          {
            name: "Three phases in one pass",
            idea: <p>Copy the intervals that end before the new one starts. Take in the ones that start at or before its end. Copy the rest.</p>,
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
            explain: <p>Each interval is visited once. It takes O(n) time and O(n) space for the output. The point of the question is to use the order that is already there.</p>,
          },
        ]}
        compare={<p>Use the three-phase pass, which is O(n). If you want a safe backup, mention the sort-and-merge version first. (LeetCode 57.)</p>}
      >
        <p>You get a list of intervals that are sorted by start and do not overlap. You also get a new interval. Insert it and merge where needed. The list must stay sorted, with no overlaps.</p>
      </Problem>

      <Problem
        n={3}
        title="Non-overlapping intervals"
        level="Medium"
        examples={[
          { input: "[[1, 2], [2, 3], [3, 4], [1, 3]]", output: "1", why: "Remove [1,3]. The rest do not overlap (touching is allowed)." },
          { input: "[[1, 2], [1, 2], [1, 2]]", output: "2", why: "Keep one of the three equal intervals." },
        ]}
        hints={[
          <>Removing the fewest is the same as keeping the most. Where have you seen &quot;the most intervals with no overlap&quot; before?</>,
          <>Which interval should you keep first? The one that starts first, the shortest one, or the one that ends first?</>,
        ]}
        approaches={[
          {
            name: "Dynamic programming: longest chain",
            idea: <p>Sort by start. <code>dp[i]</code> is the most intervals you can keep among the first <code>i + 1</code>, if interval <code>i</code> is the last one you keep. The answer is the total minus the best chain.</p>,
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
            explain: <p>It is correct, but it takes O(n²) time.</p>,
          },
          {
            name: "Greedy: sort by end",
            idea: <p>Sort by end. Keep an interval whenever it starts at or after the end of the last one you kept. Remove every other interval.</p>,
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
            explain: <p>The interval that ends first leaves the most room (the exchange argument from lesson 47). It takes O(n log n) time.</p>,
          },
          {
            name: "Sort by start, and on a clash drop the one that ends later",
            idea: <p>Sort by start. When the next interval overlaps the one you are holding, remove one of them. Keep the one that ends earlier.</p>,
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
            explain: <p>It is also O(n log n) and also correct, because at each clash it keeps the better interval. The sort-by-end version is easier to prove.</p>,
          },
        ]}
        compare={<p>Sort by end. (LeetCode 435.)</p>}
      >
        <p>You get some intervals. Return the fewest you must remove so that the rest do not overlap. Intervals that only touch at an end point do not overlap.</p>
      </Problem>

      <Problem
        n={4}
        title="Minimum number of arrows to burst balloons"
        level="Medium"
        examples={[
          { input: "[[10, 16], [2, 8], [1, 6], [7, 12]]", output: "2", why: "Shoot at x = 6 (this bursts [2,8] and [1,6]). Shoot again at x = 12 (this bursts [10,16] and [7,12])." },
          { input: "[[1, 2], [3, 4], [5, 6], [7, 8]]", output: "4", why: "No two balloons share a point." },
        ]}
        hints={[
          <>A group of balloons can share one arrow when they all overlap at one common point.</>,
          <>Sort by end, and shoot at the end of the first balloon.</>,
        ]}
        approaches={[
          {
            name: "Sort by start, and track the shared overlap",
            idea: <p>Sort by start. Keep the part that all balloons in the current group share (the latest start and the earliest end). If the next balloon starts after the earliest end of the group, close the group with one arrow and start a new group.</p>,
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
            explain: <p>The group shrinks to the part where all its balloons overlap. A new balloon joins only if it reaches that part. It takes O(n log n) time.</p>,
          },
          {
            name: "Sort by end, shoot at each end",
            idea: <p>Sort by end. Shoot at the end of the first balloon. Every balloon that starts at or before that point is also burst. At the first balloon that starts later, shoot again at its end.</p>,
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
            explain: <p>Shooting at the earliest end is as far right as possible while still bursting that balloon. So it catches the most later balloons. It takes O(n log n) time. It is the same loop as &quot;remove the fewest&quot;, except that balloons that only touch count as hit.</p>,
          },
        ]}
        compare={<p>Either one works. Sort by end is shorter. (LeetCode 452.)</p>}
      >
        <p>Balloons are given as <code>[xStart, xEnd]</code> on a line. An arrow shot straight up at <code>x</code> bursts every balloon with <code>xStart &lt;= x &lt;= xEnd</code>. Return the fewest arrows needed to burst all the balloons.</p>
      </Problem>

      <Problem
        n={5}
        title="Meeting rooms"
        level="Easy"
        examples={[
          { input: "[[0, 30], [5, 10], [15, 20]]", output: "false", why: "The meeting [0,30] overlaps both of the others." },
          { input: "[[7, 10], [2, 4]]", output: "true", why: "After sorting, the order is [2,4] then [7,10]. They do not clash." },
        ]}
        hints={[
          <>If the meetings were in order of start time, which pairs would you need to check?</>,
        ]}
        approaches={[
          {
            name: "Check every pair",
            idea: <p>Compare every two meetings. Return false if any pair overlaps.</p>,
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
            explain: <p>It takes O(n²) time. Notice the strict <code>&lt;</code>: a meeting that ends at 10 and another that starts at 10 do not clash.</p>,
          },
          {
            name: "Sort by start and check neighbours",
            idea: <p>After sorting by start, a clash can only happen between neighbours. Return false if any meeting starts before the previous one ends.</p>,
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
            explain: <p>Say meeting k clashes with some earlier meeting j. Then k starts before j ends. Walk from j to k. The meetings are in order of start. So either one of them already clashes with its own neighbour, or j and k are neighbours. Either way, a clash between neighbours exists. It takes O(n log n) time.</p>,
          },
        ]}
        compare={<p>Sort and check neighbours. This problem is only for paying members on LeetCode (252, &quot;Meeting Rooms&quot;), so the full problem is written out here.</p>}
      >
        <p>You get meeting times <code>[start, end]</code>. Decide whether one person could attend all of them. A meeting that ends exactly when another one starts does not clash.</p>
      </Problem>

      <Problem
        n={6}
        title="Meeting rooms II"
        level="Medium"
        examples={[
          { input: "[[0, 30], [5, 10], [15, 20]]", output: "2", why: "The meeting [0,30] runs the whole time. The other two never run together." },
          { input: "[[7, 10], [2, 4]]", output: "1", why: "They never overlap." },
        ]}
        hints={[
          <>The number of rooms you need equals the largest number of meetings happening at the same moment.</>,
          <>That largest number always happens at the start time of some meeting.</>,
          <>You only need the starts in order and the ends in order. You do not need to know which end belongs to which start.</>,
        ]}
        approaches={[
          {
            name: "Count overlaps at each start",
            idea: <p>For the start time of every meeting, count how many meetings are running at that moment. The answer is the largest count.</p>,
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
            idea: <p>Make a list of events: a time, with +1 for a start and −1 for an end. Sort by time. If times are equal, put ends before starts. Keep a running total. The answer is the highest value it reaches.</p>,
            code: `function minMeetingRooms(meetings) {
  const events = [];
  for (const [s, e] of meetings) { events.push([s, 1]); events.push([e, -1]); }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);   // at the same time, -1 (an end) comes first
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
            explain: <p>It takes O(n log n) time. The rule for equal times matters: a meeting that ends at 5 frees its room for one that starts at 5.</p>,
          },
          {
            name: "Two sorted lists, two pointers",
            idea: <p>Sort the starts and the ends separately. Go through the starts in order. If a start is before the earliest end that is still waiting, you need a new room. Otherwise, reuse that room and move the end pointer forward.</p>,
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
            explain: <p>It takes O(n log n) time and needs no heap. It does not matter that the ends are sorted separately. We only ask whether <em>some</em> meeting has already ended, never which one. (The usual other way, a min-heap of end times, gives the same answer.)</p>,
          },
        ]}
        compare={<p>Use the two-pointer version or the event sweep. Both are easy to write without a heap. This problem is only for paying members on LeetCode (253, &quot;Meeting Rooms II&quot;), so the full problem is written out here.</p>}
      >
        <p>You get meeting times <code>[start, end]</code>. Return the fewest meeting rooms you need. A meeting that ends at time t and one that starts at time t can share a room.</p>
      </Problem>

      <Problem
        n={7}
        title="Interval list intersections"
        level="Medium"
        examples={[
          { input: "A = [[0, 2], [5, 10], [13, 23], [24, 25]], B = [[1, 5], [8, 12], [15, 24], [25, 26]]", output: "[[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]]", why: "For example, [5,10] meets [1,5] at the single point 5, and it meets [8,12] in [8,10]." },
          { input: "A = [[1, 3], [5, 9]], B = []", output: "[]", why: "B is empty, so nothing intersects." },
        ]}
        hints={[
          <>The part that two intervals share goes from the later start to the earlier end, if that range makes sense.</>,
          <>Both lists are sorted. After you handle a pair, which interval can you drop?</>,
        ]}
        approaches={[
          {
            name: "Compare every pair",
            idea: <p>For every interval in A and every interval in B, work out the overlap. Keep it if it is valid.</p>,
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
            explain: <p>It takes O(m · n) time. It ignores that both lists are sorted.</p>,
          },
          {
            name: "Two pointers",
            idea: <p>Look at A[i] and B[j]. Save their overlap, if there is one. Then move past whichever ends first, because it cannot overlap anything later in the other list.</p>,
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
            explain: <p>Each step moves a pointer forward, so there are at most m + n steps. That is O(m + n) time. The output is already sorted.</p>,
          },
        ]}
        compare={<p>Use two pointers. It is very similar to merging two sorted lists. (LeetCode 986.)</p>}
      >
        <p>You get two lists of closed intervals (both ends included). Each list is sorted, and no two intervals in the same list overlap. Return the places where they overlap, also as a sorted list of intervals.</p>
      </Problem>
    </>
  );
}
