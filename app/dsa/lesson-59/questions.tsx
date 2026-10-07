import Problem from "@/components/dsa/Problem";

/**
 * Lesson 59 mock interview walk-throughs. Each "Which approach should you use?" box is a script:
 * what you would say aloud at each phase of the interview.
 */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Mock interview: Two Sum"
        level="Easy"
        examples={[
          { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", why: "nums[0] + nums[1] = 2 + 7 = 9." },
          { input: "nums = [3,2,4], target = 6", output: "[1,2]", why: "2 + 4 = 6. The 3 cannot pair with itself, so [0,0] is not allowed." },
          { input: "nums = [3,3], target = 6", output: "[0,1]", why: "Duplicates are fine: they are different positions." },
        ]}
        hints={[
          <>Say the brute force first. What is its cost, and which part of it repeats the same kind of search?</>,
          <>For each number you are really asking one question: &quot;is target minus this number somewhere in the array?&quot;</>,
          <>What structure answers &quot;have I seen this value, and where?&quot; in O(1)?</>,
        ]}
        approaches={[
          {
            name: "Brute force: every pair",
            idea: <p>Try each index <code>i</code> with every later index <code>j</code> and return the first pair whose values add up to the target.</p>,
            code: `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {   // j starts after i: no element is used twice
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // [ 0, 1 ]
console.log(twoSum([3, 2, 4], 6));      // [ 1, 2 ]
console.log(twoSum([3, 3], 6));         // [ 0, 1 ]
console.log(twoSum([1, 2], 10));        // []`,
            explain: <p>O(n²) time and O(1) space. It is obviously correct, which makes it a good baseline and a good oracle for testing the faster version.</p>,
          },
          {
            name: "One pass with a Map",
            idea: <p>Walk the array once, keeping a Map from value to index. For each number, check whether <code>target - number</code> is already in the Map; if so, return both indices; if not, store this number.</p>,
            code: `function twoSum(nums, target) {
  const indexOf = new Map();                       // value -> index where we saw it
  for (let i = 0; i < nums.length; i++) {
    const needed = target - nums[i];
    if (indexOf.has(needed)) return [indexOf.get(needed), i];
    indexOf.set(nums[i], i);                       // store after checking, so an element cannot pair with itself
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // [ 0, 1 ]
console.log(twoSum([3, 2, 4], 6));      // [ 1, 2 ]
console.log(twoSum([3, 3], 6));         // [ 0, 1 ]
console.log(twoSum([1, 2], 10));        // []`,
            explain: <p>O(n) time, O(n) space. Dry run on <code>[3,2,4]</code>, target 6: i = 0, needed 3, map empty, store 3 → 0. i = 1, needed 4, not found, store 2 → 1. i = 2, needed 2, found at index 1, so return [1, 2]. The check-then-store order is why the lone 3 never pairs with itself.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Clarify (minutes 0–5).</strong> &quot;So I receive an array of integers and a target, and return the indices of two different positions whose values sum to the target. Can the numbers be negative? Can the same position be used twice? Is there always exactly one answer, and what should I return if there is none? How large can the array get?&quot; (Suppose: negatives allowed, no reuse, at most one answer, empty array when none, n up to 10,000.)</p>
            <p><strong>Examples and edges (5–10).</strong> &quot;For 2, 7, 11, 15 and 9 the answer is 0 and 1. Edge cases: two equal numbers like 3 and 3 with target 6 should return 0 and 1; a single 3 with target 6 must not return the same index twice; an empty array or no answer returns an empty array.&quot;</p>
            <p><strong>Brute force, then better (10–17).</strong> &quot;Brute force checks every pair, O(n²) time and O(1) space; for 10,000 elements that is about fifty million checks, which would pass, but we can do better. The waste is that for each number I search the rest of the array for its partner. If I remember the numbers I have already seen in a map, that search becomes an O(1) lookup. That gives O(n) time for O(n) space. Do you want me to go with the map?&quot;</p>
            <p><strong>Code (17–32).</strong> &quot;I create a map from value to index. For each position I compute the needed partner, <code>target - nums[i]</code>. If the map has it I return its index and mine. Otherwise I store my own value. I deliberately store after the check so a number cannot match itself.&quot;</p>
            <p><strong>Test (32–39).</strong> &quot;Dry run on 3, 2, 4 with target 6: at i = 0 needed is 3, the map is empty, store 3. At i = 1 needed is 4, not found, store 2. At i = 2 needed is 2, found at index 1, return 1 and 2. For 3 and 3: at i = 0 store 3; at i = 1 needed 3 is found at 0, return 0 and 1. Empty array: the loop does not run and we return an empty array.&quot;</p>
            <p><strong>Complexity (39–42).</strong> &quot;Time O(n), because one pass and each map operation is O(1) on average. Space O(n) for the map, in the worst case holding every element. If memory were tight I would sort a copy of (value, index) pairs and use two pointers: O(n log n) time and O(n) space for the pairs, so the trade-off is not free.&quot; (LeetCode 1; this is lesson 26.)</p>
          </>
        }
      >
        <p>
          Given an array of integers <code>nums</code> and an integer <code>target</code>, return the indices of the two numbers that add up
          to <code>target</code>. You may not use the same element twice. Return an empty array if no pair exists.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Mock interview: first invalid bracket (a Valid Parentheses variant)"
        level="Medium"
        examples={[
          { input: 's = "a(b)[c]{d}"', output: "-1", why: "Every bracket is matched and in the right order; letters are ignored." },
          { input: 's = "(]"', output: "1", why: "The ] at index 1 arrives while ( is the open bracket: it cannot close it." },
          { input: 's = "(()"', output: "0", why: "Nothing is wrong along the way, but the ( at index 0 is never closed. Report the first unmatched opener." },
          { input: 's = "())"', output: "2", why: "The second ) at index 2 has nothing left to close." },
        ]}
        hints={[
          <>First solve the plain yes/no version. Which structure matches the most recent opener with the next closer?</>,
          <>To report an index, store indices on the stack, not characters. How do you get back the character?</>,
          <>Two ways to fail while scanning (wrong closer, or a closer with an empty stack) and one at the end (leftover openers). Which index goes with each?</>,
        ]}
        approaches={[
          {
            name: "Plain yes/no: delete matched pairs repeatedly",
            idea: <p>Start with the easy version first, as you would in the interview. Keep removing adjacent <code>()</code>, <code>[]</code> and <code>{"{}"}</code> until nothing changes; the string is valid if it ends up empty. This answers only valid or not, not the position.</p>,
            code: `function isValid(s) {
  let brackets = s.replace(/[^()\\[\\]{}]/g, "");  // drop every character that is not a bracket
  let previous;
  do {
    previous = brackets;
    brackets = brackets.replace("()", "").replace("[]", "").replace("{}", "");
  } while (brackets !== previous);
  return brackets === "";
}

console.log(isValid("a(b)[c]{d}")); // true
console.log(isValid("(]"));         // false
console.log(isValid("(()"));        // false
console.log(isValid("{[()]}"));     // true`,
            explain: <p>Each pass removes at least one pair or stops, and each pass costs O(n), so the worst case is O(n²). It is a nice proof of understanding, but it throws away the positions we need for the variant.</p>,
          },
          {
            name: "Stack of indices",
            idea: <p>Scan left to right. Push the index of every opener. On a closer, pop; if the stack was empty or the popped opener does not match, return this index. After the scan, if openers remain, the earliest one (the bottom of the stack) is the answer.</p>,
            code: `function firstInvalid(s) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];                                  // indices of openers not yet closed
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(i);
    } else if (ch in pairs) {
      if (stack.length === 0 || s[stack[stack.length - 1]] !== pairs[ch]) return i;   // nothing to close, or wrong type
      stack.pop();
    }                                                // any other character is ignored
  }
  return stack.length === 0 ? -1 : stack[0];         // the earliest opener that was never closed
}

console.log(firstInvalid("a(b)[c]{d}")); // -1
console.log(firstInvalid("(]"));         // 1
console.log(firstInvalid("(()"));        // 0
console.log(firstInvalid("())"));        // 2
console.log(firstInvalid(""));           // -1
console.log(firstInvalid("}"));          // 0`,
            explain: <p>O(n) time, O(n) space for the stack. <code>ch in pairs</code> is safe here because <code>ch</code> is a single character, so it can never equal inherited names like &quot;constructor&quot;. Dry run on <code>(]</code>: push 0; at index 1 the closer ] needs [ but the top of the stack is ( at index 0, so return 1.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Clarify.</strong> &quot;Besides round brackets there are square and curly ones, and other characters may appear and should be ignored? What should I return: a boolean or the position? If the string is valid, return -1? And if the problem is only that some opener is never closed, which index do you want: the first such opener, or the last?&quot; (Suppose: ignore other characters; return the index of the first problem; -1 if valid; for leftovers, the earliest unclosed opener.)</p>
            <p><strong>Examples and edges.</strong> &quot;Valid: letters mixed with correct brackets gives -1. A wrong closer such as (] gives 1. A closer with nothing open, such as ), gives 0. Unclosed opener ((( ) gives the first one. The empty string is valid.&quot;</p>
            <p><strong>Plan.</strong> &quot;The plain version is the classic stack problem: the most recent unmatched opener must be closed first, which is last in, first out. A brute force would be to delete matching pairs until none remain, O(n²), but it destroys indices. So I will use a stack, and store indices instead of characters, so I can report a position and still look up the character with <code>s[index]</code>.&quot;</p>
            <p><strong>Code.</strong> &quot;For an opener I push its index. For a closer I fail immediately if the stack is empty or the top opener has the wrong type, returning this index; otherwise I pop. Other characters are skipped. At the end, a non-empty stack means unclosed openers, and the bottom of the stack is the earliest.&quot;</p>
            <p><strong>Test.</strong> &quot;On (() : push 0, push 1, the closer pops 1, the stack is [0], end of the loop, return stack[0] = 0. On ()) : push 0, pop it, the next closer finds an empty stack, return index 2. On the empty string the stack is empty so I return -1.&quot;</p>
            <p><strong>Complexity.</strong> &quot;Time O(n), one pass with O(1) stack operations. Space O(n) in the worst case, such as a string of only openers. I could not do better than O(n) time because the very last character can decide the answer.&quot; (LeetCode 20 plus a variant; this is lesson 38.)</p>
          </>
        }
      >
        <p>
          A string contains brackets <code>()</code>, <code>[]</code>, <code>{"{}"}</code> and other characters, which you ignore. Return
          the index of the first character that makes the brackets invalid: a closing bracket that does not match the most recent open one, or
          a closing bracket with nothing open. If the string ends with brackets still open, return the index of the earliest one that was
          never closed. If everything is balanced, return -1.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Mock interview: Merge Intervals"
        level="Medium"
        examples={[
          { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", why: "[1,3] and [2,6] overlap and become [1,6]. The others stand alone." },
          { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]", why: "Intervals that merely touch at 4 are treated as overlapping." },
          { input: "intervals = [[1,4],[2,3]]", output: "[[1,4]]", why: "The second interval sits inside the first: the merged end is the larger end, 4, not 3." },
        ]}
        hints={[
          <>Sort the intervals by start. After that, which intervals could possibly overlap the one you are building?</>,
          <>Keep the last merged interval. Compare only the next interval&apos;s start with that interval&apos;s end.</>,
          <>When they overlap, what should the new end be: the old end, the new end, or the larger of the two?</>,
        ]}
        approaches={[
          {
            name: "Brute force: keep merging any overlapping pair",
            idea: <p>Look for any two intervals that overlap, replace them by their union, and restart. Stop when a full scan finds no overlap.</p>,
            code: `function merge(intervals) {
  const list = intervals.map(([a, b]) => [a, b]);        // copy, so the caller's data is not changed
  let changed = true;
  while (changed) {
    changed = false;
    search: for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const [a, b] = list[i], [c, d] = list[j];
        if (a <= d && c <= b) {                           // they overlap (or touch)
          list[i] = [Math.min(a, c), Math.max(b, d)];
          list.splice(j, 1);
          changed = true;
          break search;                                   // start the scan again
        }
      }
    }
  }
  return list.sort((p, q) => p[0] - q[0]);
}

console.log(merge([[1, 3], [2, 6], [8, 10], [15, 18]])); // [ [ 1, 6 ], [ 8, 10 ], [ 15, 18 ] ]
console.log(merge([[1, 4], [4, 5]]));                    // [ [ 1, 5 ] ]
console.log(merge([[1, 4], [2, 3]]));                    // [ [ 1, 4 ] ]
console.log(merge([]));                                  // []`,
            explain: <p>Each merge removes one interval, so there are at most n merges, and each restart scans O(n²) pairs: O(n³) in the worst case. It is a useful oracle for testing, and a good thing to state out loud before improving it.</p>,
          },
          {
            name: "Sort by start, then sweep",
            idea: <p>Sort a copy by start. Put the first interval in the result. For each following interval: if its start is at most the end of the last result interval, stretch that end to the larger of the two ends; otherwise start a new interval.</p>,
            code: `function merge(intervals) {
  const sorted = intervals.map(([a, b]) => [a, b]).sort((p, q) => p[0] - q[0]);   // by start; a copy
  const result = [];
  for (const [start, end] of sorted) {
    const last = result[result.length - 1];
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);               // overlap: extend, never shrink
    } else {
      result.push([start, end]);                      // gap: begin a new merged interval
    }
  }
  return result;
}

console.log(merge([[1, 3], [2, 6], [8, 10], [15, 18]])); // [ [ 1, 6 ], [ 8, 10 ], [ 15, 18 ] ]
console.log(merge([[1, 4], [4, 5]]));                    // [ [ 1, 5 ] ]
console.log(merge([[1, 4], [2, 3]]));                    // [ [ 1, 4 ] ]
console.log(merge([]));                                  // []`,
            explain: <p>O(n log n) time for the sort, then one O(n) sweep; O(n) space for the copy and the result. Once sorted, an interval can only overlap the most recent merged one, which is why one comparison suffices. Dry run on <code>[[1,4],[2,3]]</code>: result [[1,4]]; next start 2 ≤ 4, so the end becomes max(4, 3) = 4.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Clarify.</strong> &quot;Each interval is a pair [start, end] with start ≤ end. Is the input sorted? Do intervals that touch, like [1,4] and [4,5], count as overlapping? May I modify the input, or should I return a new array? Can the input be empty? How many intervals, roughly?&quot; (Suppose: unsorted, touching counts, do not mutate, empty gives an empty array, up to 10^4.)</p>
            <p><strong>Examples and edges.</strong> &quot;The sample merges the first two. Edge cases: touching intervals merge; one interval nested inside another, like [1,4] and [2,3], must keep the larger end; unsorted input; a single interval; an empty list; many intervals that all collapse into one.&quot;</p>
            <p><strong>Brute force, then better.</strong> &quot;Brute force: repeatedly find any two overlapping intervals, replace them with their union, and rescan until none overlap. That is O(n³) in the worst case. The waste is that I search all pairs because the order is random. If I sort by start, an interval can only overlap the latest merged interval, so one pass is enough. The cost becomes the sort: O(n log n).&quot;</p>
            <p><strong>Code.</strong> &quot;I copy the input and sort the copy by start, so I do not change the caller&apos;s data. For each interval I look at the last interval in my result. If the start is less than or equal to its end, they overlap and I set the end to the maximum of both ends. I use the maximum because of the nested case. Otherwise I push a new interval.&quot;</p>
            <p><strong>Test.</strong> &quot;For [[1,3],[2,6],[8,10],[15,18]]: result starts [1,3]; 2 ≤ 3 so the end becomes 6; 8 &gt; 6 so push [8,10]; 15 &gt; 10 so push [15,18]. For [[1,4],[2,3]] the end stays 4. For an empty input the loop never runs and I return an empty array. One thing to check: I wrote <code>start &lt;= last[1]</code> with less-or-equal, so touching intervals merge, as agreed.&quot;</p>
            <p><strong>Complexity.</strong> &quot;Time O(n log n), dominated by the sort; the sweep is O(n). Space O(n) for the copy and result. If the input were already sorted I could skip the sort and get O(n).&quot; (LeetCode 56; this is lesson 48.)</p>
          </>
        }
      >
        <p>
          Given a list of intervals <code>[start, end]</code>, merge all overlapping intervals and return the non-overlapping intervals that
          cover exactly the same ranges. Intervals that touch at a single point count as overlapping.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Mock interview: can you finish all courses? (a graph problem, short form)"
        level="Medium"
        examples={[
          { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true", why: "To take course 1 you must first take course 0. Take 0, then 1." },
          { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false", why: "Each course needs the other first: a cycle, so neither can start." },
          { input: "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]", output: "true", why: "Order 0, 1, 2, 3 works. Course 3 needs both 1 and 2." },
        ]}
        hints={[
          <>Draw each pair <code>[a, b]</code> as an arrow b → a (b must come first). What does an impossible schedule look like in that picture?</>,
          <>It is a cycle in a directed graph. Which two techniques can find one?</>,
          <>Kahn&apos;s idea: courses with no unmet prerequisite can be taken now. Keep taking them and see how many you manage.</>,
        ]}
        approaches={[
          {
            name: "DFS with three states",
            idea: <p>Colour each course: unvisited, in progress (on the current DFS path), or done. If DFS reaches an in-progress course, we followed a path back to ourselves: a cycle, so return false.</p>,
            code: `function canFinish(numCourses, prerequisites) {
  const next = Array.from({ length: numCourses }, () => []);
  for (const [course, before] of prerequisites) next[before].push(course);   // arrow: before -> course

  const state = new Array(numCourses).fill(0);       // 0 = unvisited, 1 = on the current path, 2 = finished
  function hasCycle(v) {
    if (state[v] === 1) return true;                 // we came back to a course on our own path
    if (state[v] === 2) return false;
    state[v] = 1;
    for (const w of next[v]) if (hasCycle(w)) return true;
    state[v] = 2;
    return false;
  }
  for (let v = 0; v < numCourses; v++) if (hasCycle(v)) return false;
  return true;
}

console.log(canFinish(2, [[1, 0]]));                          // true
console.log(canFinish(2, [[1, 0], [0, 1]]));                  // false
console.log(canFinish(4, [[1, 0], [2, 0], [3, 1], [3, 2]]));  // true
console.log(canFinish(1, []));                                // true`,
            explain: <p>O(V + E) time and O(V + E) space (the adjacency list plus the recursion). Marking finished courses stops the same sub-graph being explored again, which is what keeps this linear. A very long chain of prerequisites could overflow the recursion stack in JavaScript.</p>,
          },
          {
            name: "Kahn's algorithm (count in-degrees)",
            idea: <p>Count for each course how many prerequisites it still waits for (its in-degree). Queue the courses with zero. Take one, reduce the count of the courses that depended on it, and queue any that reach zero. If you took every course, there was no cycle.</p>,
            code: `function canFinish(numCourses, prerequisites) {
  const next = Array.from({ length: numCourses }, () => []);
  const waiting = new Array(numCourses).fill(0);     // prerequisites each course still needs
  for (const [course, before] of prerequisites) {
    next[before].push(course);
    waiting[course]++;
  }
  const queue = [];
  for (let v = 0; v < numCourses; v++) if (waiting[v] === 0) queue.push(v);
  let head = 0;
  while (head < queue.length) {
    const v = queue[head++];                         // take this course
    for (const w of next[v]) {
      waiting[w]--;
      if (waiting[w] === 0) queue.push(w);
    }
  }
  return queue.length === numCourses;                // anything stuck inside a cycle is never queued
}

console.log(canFinish(2, [[1, 0]]));                          // true
console.log(canFinish(2, [[1, 0], [0, 1]]));                  // false
console.log(canFinish(4, [[1, 0], [2, 0], [3, 1], [3, 2]]));  // true
console.log(canFinish(1, []));                                // true`,
            explain: <p>O(V + E) time and space. Dry run on <code>[[1,0],[0,1]]</code>: both courses wait for one prerequisite, so the queue starts empty and we took 0 of 2 courses: false. No recursion, so no stack-depth worry.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Clarify.</strong> &quot;So <code>[a, b]</code> means b must be taken before a. Courses are numbered 0 to n minus 1. Can the same pair appear twice, or can a course be its own prerequisite? What sizes: how large can n and the number of pairs be?&quot; (Suppose: duplicates possible, self-loops possible, n up to 2,000 and up to 5,000 pairs. A self-loop is a cycle, so false.)</p>
            <p><strong>Examples and edges.</strong> &quot;With no prerequisites it is trivially true. Two courses needing each other is false. A chain 0, 1, 2 is true. A longer cycle with a tail, like 0 → 1 → 2 → 1, is false even though 0 is fine. And disconnected courses should not confuse me.&quot;</p>
            <p><strong>Model and brute force.</strong> &quot;I model courses as vertices and each prerequisite as a directed edge from the required course to the dependent one. The question becomes: does this directed graph have a cycle? The brute force is to try every possible order of the courses and check each against the pairs, n factorial; clearly too slow. A smarter idea: a valid order exists exactly when the graph has no cycle, and I can detect a cycle in linear time.&quot;</p>
            <p><strong>Plan.</strong> &quot;I will use Kahn&apos;s algorithm. Build an adjacency list and count how many prerequisites each course has. Everything with zero can be taken immediately, so queue those. When I take a course, every course that depended on it has one fewer prerequisite; if that reaches zero, queue it. If I manage to take all n courses, it is possible; if the queue dries up early, the remaining courses are stuck in a cycle. I prefer this to the recursive DFS because it has no recursion-depth risk.&quot;</p>
            <p><strong>Code and test.</strong> &quot;I write the loop with a head index instead of <code>shift</code>. Test on 2 courses with pairs [1,0] and [0,1]: both wait for one, the queue starts empty, so I took 0 of 2: false. On the diamond with 4 courses: course 0 has zero waiting, take it, courses 1 and 2 drop to zero, take them, course 3 drops from two to zero, take it: 4 of 4, true.&quot;</p>
            <p><strong>Complexity.</strong> &quot;Time O(V + E): each vertex is queued once and each edge is handled once. Space O(V + E) for the adjacency list and the counts. If you want the actual order of courses, the queue already contains it: that is the follow-up, Course Schedule II.&quot; (LeetCode 207; this is lesson 51.)</p>
          </>
        }
      >
        <p>
          There are <code>numCourses</code> courses labelled <code>0</code> to <code>numCourses - 1</code>. Each pair{" "}
          <code>[a, b]</code> in <code>prerequisites</code> means you must take course <code>b</code> before course <code>a</code>. Return{" "}
          <code>true</code> if it is possible to finish all courses.
        </p>
      </Problem>
    </>
  );
}
