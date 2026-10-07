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
          { input: "nums = [3,3], target = 6", output: "[0,1]", why: "Repeated numbers are fine, because they are at different positions." },
        ]}
        hints={[
          <>Say the brute force first. What does it cost, and which part of it repeats the same kind of search?</>,
          <>For each number you are really asking one question: &quot;is target minus this number somewhere else in the array?&quot;</>,
          <>Which data structure can answer &quot;have I seen this value, and where?&quot; in O(1) time?</>,
        ]}
        approaches={[
          {
            name: "Brute force: every pair",
            idea: <p>Try each index <code>i</code> with every later index <code>j</code>. Return the first pair whose values add up to the target.</p>,
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
            explain: <p>O(n²) time and O(1) memory. It is clearly correct. So it is a good starting point, and also a good way to check the faster version (the answers must match).</p>,
          },
          {
            name: "One pass with a Map",
            idea: <p>Walk through the array once and keep a Map from value to index. For each number, check if <code>target - number</code> is already in the Map. If it is, return both indices. If not, store this number.</p>,
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
            explain: <p>O(n) time, O(n) memory. Dry run (follow the code by hand) on <code>[3,2,4]</code>, target 6. At i = 0 we need 3, the map is empty, so store 3 → 0. At i = 1 we need 4, it is not there, so store 2 → 1. At i = 2 we need 2, it is at index 1, so return [1, 2]. We check first and store after. That is why the lone 3 never pairs with itself.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Clarify (minutes 0–5).</strong> &quot;So I get an array of integers and a target. I return the indices of two different positions whose values add up to the target. Can the numbers be negative? Can the same position be used twice? Is there always exactly one answer? What should I return if there is none? How big can the array be?&quot; (Suppose the answers are: negatives allowed, no reuse, at most one answer, empty array when there is none, n up to 10,000.)</p>
            <p><strong>Examples and edges (5–10).</strong> &quot;For 2, 7, 11, 15 and target 9 the answer is 0 and 1. Edge cases: two equal numbers like 3 and 3 with target 6 should return 0 and 1. A single 3 with target 6 must not return the same index twice. An empty array, or no answer, returns an empty array.&quot;</p>
            <p><strong>Brute force, then better (10–17).</strong> &quot;Brute force checks every pair. That is O(n²) time and O(1) memory. For 10,000 elements that is about fifty million checks. That would pass, but we can do better. The waste is that for each number I search the rest of the array for its partner. If I remember the numbers I have already seen in a map, that search becomes an O(1) lookup. Then the time is O(n) and the memory is O(n). Do you want me to go with the map?&quot;</p>
            <p><strong>Code (17–32).</strong> &quot;I make a map from value to index. For each position I work out the partner I need, <code>target - nums[i]</code>. If the map has it, I return its index and mine. If not, I store my own value. I store it after the check on purpose, so a number cannot match itself.&quot;</p>
            <p><strong>Test (32–39).</strong> &quot;Dry run on 3, 2, 4 with target 6. At i = 0 I need 3, the map is empty, so I store 3. At i = 1 I need 4, it is not there, so I store 2. At i = 2 I need 2, it is at index 1, so I return 1 and 2. For 3 and 3: at i = 0 I store 3. At i = 1 I need 3, it is at 0, so I return 0 and 1. For an empty array the loop does not run, and we return an empty array.&quot;</p>
            <p><strong>Complexity (39–42).</strong> &quot;The time is O(n), because there is one pass and each map operation is O(1) on average. The memory is O(n) for the map, because in the worst case it holds every element. If memory were tight, I would sort a copy of (value, index) pairs and use two pointers. That is O(n log n) time and still O(n) memory for the pairs, so the trade-off is not free.&quot; (LeetCode 1; this is lesson 26.)</p>
          </>
        }
      >
        <p>
          Given an array of integers <code>nums</code> and an integer <code>target</code>, return the indices of the two numbers that add up
          to <code>target</code>. You may not use the same element twice. Return an empty array if there is no such pair.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Mock interview: first invalid bracket (a Valid Parentheses variant)"
        level="Medium"
        examples={[
          { input: 's = "a(b)[c]{d}"', output: "-1", why: "Every bracket is matched and in the right order. Letters are ignored." },
          { input: 's = "(]"', output: "1", why: "The ] at index 1 arrives while ( is the open bracket. A ] cannot close a (." },
          { input: 's = "(()"', output: "0", why: "Nothing goes wrong along the way, but the ( at index 0 is never closed. Report the first opener that is never closed." },
          { input: 's = "())"', output: "2", why: "The second ) at index 2 has nothing left to close." },
        ]}
        hints={[
          <>First solve the plain yes/no version. Which data structure matches the most recent opener with the next closer?</>,
          <>To report an index, store indices on the stack, not characters. How do you get the character back from an index?</>,
          <>There are two ways to fail while scanning (a wrong closer, or a closer when the stack is empty) and one way at the end (openers left over). Which index goes with each?</>,
        ]}
        approaches={[
          {
            name: "Plain yes/no: delete matched pairs again and again",
            idea: <p>Start with the easy version first, as you would in the interview. Keep removing neighbouring pairs <code>()</code>, <code>[]</code> and <code>{"{}"}</code> until nothing changes. The string is valid if it ends up empty. This tells you only valid or not valid. It does not tell you the position.</p>,
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
            explain: <p>Each pass removes at least one pair or stops, and each pass costs O(n). So the worst case is O(n²). It shows you understand the problem, but it loses the positions that we need for this variant.</p>,
          },
          {
            name: "Stack of indices",
            idea: <p>Scan from left to right. A stack is a pile where you add and remove only at the top. Push the index of every opener onto it. When you see a closer, pop the top. If the stack was empty, or the opener you popped does not match, return this index. After the scan, if openers are left, the earliest one (the bottom of the stack) is the answer.</p>,
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
            explain: <p>O(n) time, O(n) memory for the stack. <code>ch in pairs</code> is safe here because <code>ch</code> is one character. So it can never equal inherited names like &quot;constructor&quot;. Dry run on <code>(]</code>: push 0. At index 1 the closer ] needs [, but the top of the stack is ( at index 0, so return 1.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Clarify.</strong> &quot;Besides round brackets there are square and curly ones. Other characters may appear, and I should ignore them? What should I return: a true/false value or the position? If the string is valid, do I return -1? If the only problem is an opener that is never closed, which index do you want: the first such opener, or the last?&quot; (Suppose the answers are: ignore other characters, return the index of the first problem, -1 if valid, and for leftovers the earliest opener that is never closed.)</p>
            <p><strong>Examples and edges.</strong> &quot;Letters mixed with correct brackets give -1. A wrong closer such as (] gives 1. A closer with nothing open, such as ), gives 0. Openers that are never closed, like (((, give the first one. The empty string is valid.&quot;</p>
            <p><strong>Plan.</strong> &quot;The plain version is the classic stack problem. The most recent opener that is not yet matched must be closed first. This is called last in, first out. A brute force would be to delete matching pairs until none are left. That is O(n²) and it destroys the indices. So I will use a stack and store indices instead of characters. Then I can report a position and still find the character with <code>s[index]</code>.&quot;</p>
            <p><strong>Code.</strong> &quot;For an opener I push its index. For a closer, I fail at once if the stack is empty or the top opener is the wrong type, and I return this index. Otherwise I pop. I skip other characters. At the end, a stack that is not empty means some openers were never closed. The bottom of the stack is the earliest one.&quot;</p>
            <p><strong>Test.</strong> &quot;On (() : push 0, push 1, the closer pops 1, the stack is [0], the loop ends, so I return stack[0] = 0. On ()) : push 0, pop it, the next closer finds an empty stack, so I return index 2. On the empty string the stack is empty, so I return -1.&quot;</p>
            <p><strong>Complexity.</strong> &quot;The time is O(n): one pass, and each stack operation is O(1). The memory is O(n) in the worst case, for example a string of only openers. I cannot do better than O(n) time, because the very last character can decide the answer.&quot; (LeetCode 20 plus a variant; this is lesson 38.)</p>
          </>
        }
      >
        <p>
          A string contains brackets <code>()</code>, <code>[]</code>, <code>{"{}"}</code> and other characters, which you ignore. Return
          the index of the first character that makes the brackets invalid. That is a closing bracket that does not match the most recent open one,
          or a closing bracket when nothing is open. If the string ends with brackets still open, return the index of the earliest one that was
          never closed. If everything is balanced, return -1.
        </p>
      </Problem>

      <Problem
        n={3}
        title="Mock interview: Merge Intervals"
        level="Medium"
        examples={[
          { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", why: "[1,3] and [2,6] overlap and become [1,6]. The others have no overlap and stay as they are." },
          { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]", why: "Intervals that only touch at 4 count as overlapping." },
          { input: "intervals = [[1,4],[2,3]]", output: "[[1,4]]", why: "The second interval is inside the first one. The merged end is the larger end, 4, not 3." },
        ]}
        hints={[
          <>Sort the intervals by their start. After that, which intervals could overlap the one you are building?</>,
          <>Keep the last merged interval. Compare only the next interval&apos;s start with the end of that last interval.</>,
          <>When they overlap, what should the new end be: the old end, the next interval&apos;s end, or the larger of the two?</>,
        ]}
        approaches={[
          {
            name: "Brute force: keep merging any pair that overlaps",
            idea: <p>Look for any two intervals that overlap. Replace them with one interval that covers both (their union). Then start again. Stop when a full scan finds no overlap.</p>,
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
            explain: <p>Each merge removes one interval, so there are at most n merges. Each restart scans O(n²) pairs, so the worst case is O(n³). It is useful for checking the faster version, and it is a good thing to say out loud before you improve it.</p>,
          },
          {
            name: "Sort by start, then sweep",
            idea: <p>Sort a copy by start. Put the first interval in the result. Then look at each next interval. If its start is not more than the end of the last interval in the result, stretch that end to the larger of the two ends. Otherwise, start a new interval.</p>,
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
            explain: <p>O(n log n) time for the sort, then one O(n) sweep. The memory is O(n) for the copy and the result. After sorting, an interval can only overlap the most recent merged one, so one comparison is enough. Dry run on <code>[[1,4],[2,3]]</code>: the result is [[1,4]]. The next start is 2, and 2 ≤ 4, so the end becomes max(4, 3) = 4.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Clarify.</strong> &quot;Each interval is a pair [start, end] with start ≤ end. Is the input sorted? Do intervals that touch, like [1,4] and [4,5], count as overlapping? May I change the input, or should I return a new array? Can the input be empty? Roughly how many intervals are there?&quot; (Suppose the answers are: unsorted, touching counts, do not change the input, empty gives an empty array, up to 10^4.)</p>
            <p><strong>Examples and edges.</strong> &quot;The sample merges the first two. Edge cases: touching intervals merge. An interval inside another one, like [1,4] and [2,3], must keep the larger end. Also unsorted input, a single interval, an empty list, and many intervals that all join into one.&quot;</p>
            <p><strong>Brute force, then better.</strong> &quot;Brute force: again and again, find any two overlapping intervals, replace them with their union, and scan again until none overlap. That is O(n³) in the worst case. The waste is that I search all pairs, because the order is random. If I sort by start, an interval can only overlap the latest merged interval, so one pass is enough. The main cost is then the sort: O(n log n).&quot;</p>
            <p><strong>Code.</strong> &quot;I copy the input and sort the copy by start, so I do not change the caller&apos;s data. For each interval I look at the last interval in my result. If the start is less than or equal to its end, they overlap, and I set the end to the larger of the two ends. I use the larger one because of the case where one interval is inside another. Otherwise I add a new interval.&quot;</p>
            <p><strong>Test.</strong> &quot;For [[1,3],[2,6],[8,10],[15,18]]: the result starts as [1,3]. 2 ≤ 3, so the end becomes 6. 8 &gt; 6, so I add [8,10]. 15 &gt; 10, so I add [15,18]. For [[1,4],[2,3]] the end stays 4. For an empty input the loop never runs and I return an empty array. One more check: I wrote <code>start &lt;= last[1]</code> with less-than-or-equal, so touching intervals merge, as we agreed.&quot;</p>
            <p><strong>Complexity.</strong> &quot;The time is O(n log n), and the sort is the biggest part. The sweep is only O(n). The memory is O(n) for the copy and the result. If the input were already sorted, I could skip the sort and get O(n).&quot; (LeetCode 56; this is lesson 48.)</p>
          </>
        }
      >
        <p>
          Given a list of intervals <code>[start, end]</code>, merge all overlapping intervals. Return the intervals that do not overlap
          and that cover exactly the same ranges. Intervals that touch at one point count as overlapping.
        </p>
      </Problem>

      <Problem
        n={4}
        title="Mock interview: can you finish all courses? (a graph problem, short form)"
        level="Medium"
        examples={[
          { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true", why: "To take course 1 you must first take course 0. So take 0, then 1." },
          { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false", why: "Each course needs the other one first. This is a cycle (a loop that never ends), so neither can start." },
          { input: "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]", output: "true", why: "Order 0, 1, 2, 3 works. Course 3 needs both 1 and 2." },
        ]}
        hints={[
          <>Draw each pair <code>[a, b]</code> as an arrow b → a (b must come first). What does an impossible schedule look like in that drawing?</>,
          <>It is a cycle in a directed graph (a graph where the links are one-way arrows). Which two methods can find a cycle?</>,
          <>Kahn&apos;s idea: a course with no unmet prerequisite can be taken now. Keep taking such courses and count how many you can take.</>,
        ]}
        approaches={[
          {
            name: "Depth-first search with three states",
            idea: <p>Give each course one of three colours: not visited, in progress (on the path we are walking now), or done. Depth-first search (DFS) means following one path as far as it goes before trying another. If DFS reaches a course that is in progress, we walked a path back to ourselves. That is a cycle, so return false.</p>,
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
            explain: <p>O(V + E) time and O(V + E) memory, where V is the number of courses and E is the number of pairs. The memory is for the adjacency list (each course&apos;s list of next courses) plus the recursion. We mark finished courses, so we never explore the same part twice. That keeps the time linear. A very long chain of prerequisites could use up the call stack in JavaScript.</p>,
          },
          {
            name: "Kahn's algorithm (count the waiting prerequisites)",
            idea: <p>For each course, count how many prerequisites it still waits for (this number is called its in-degree). Put the courses with zero into a queue (a line where the first one in is the first one out). Take one course. Lower the count of the courses that depended on it. Add any course that reaches zero to the queue. If you took every course, there was no cycle.</p>,
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
            explain: <p>O(V + E) time and memory. Dry run on <code>[[1,0],[0,1]]</code>: both courses wait for one prerequisite, so the queue starts empty. We took 0 of 2 courses, so the answer is false. There is no recursion, so there is no worry about the call stack.</p>,
          },
        ]}
        compare={
          <>
            <p><strong>Clarify.</strong> &quot;So <code>[a, b]</code> means b must be taken before a. Courses are numbered 0 to n minus 1. Can the same pair appear twice? Can a course be its own prerequisite? How big can n and the number of pairs be?&quot; (Suppose the answers are: repeated pairs are possible, a course can need itself, n up to 2,000 and up to 5,000 pairs. A course that needs itself is a cycle, so the answer is false.)</p>
            <p><strong>Examples and edges.</strong> &quot;With no prerequisites the answer is simply true. Two courses that need each other give false. A chain 0, 1, 2 gives true. A cycle with a tail, like 0 → 1 → 2 → 1, gives false even though course 0 is fine. Courses that are not linked to the others should not confuse me.&quot;</p>
            <p><strong>Model and brute force.</strong> &quot;I treat each course as a point (vertex) and each prerequisite as an arrow (directed edge) from the required course to the course that depends on it. The question becomes: does this graph have a cycle? The brute force is to try every possible order of the courses and check each one against the pairs. That is n factorial orders, which is far too slow. A smarter idea: a valid order exists exactly when the graph has no cycle, and I can find a cycle in linear time.&quot;</p>
            <p><strong>Plan.</strong> &quot;I will use Kahn&apos;s algorithm. I build an adjacency list (for each course, a list of the courses that come after it) and count how many prerequisites each course has. A course with zero can be taken now, so I put those in a queue. When I take a course, every course that depended on it has one prerequisite fewer. If that number reaches zero, I add it to the queue. If I can take all n courses, it is possible. If the queue becomes empty too early, the courses that are left are stuck in a cycle. I prefer this to the recursive DFS, because it cannot run out of call stack.&quot;</p>
            <p><strong>Code and test.</strong> &quot;I write the loop with a head index instead of <code>shift</code>. Test on 2 courses with pairs [1,0] and [0,1]: both wait for one, the queue starts empty, so I took 0 of 2, and the answer is false. Now the diamond shape with 4 courses: course 0 has zero waiting, so I take it. Courses 1 and 2 drop to zero, so I take them. Course 3 drops from two to zero, so I take it. That is 4 of 4, so the answer is true.&quot;</p>
            <p><strong>Complexity.</strong> &quot;The time is O(V + E). Each vertex (course) is queued once and each edge (pair) is handled once. The memory is O(V + E) for the adjacency list and the counts. If you want the real order of courses, the queue already holds it. That is the follow-up question, Course Schedule II.&quot; (LeetCode 207; this is lesson 51.)</p>
          </>
        }
      >
        <p>
          There are <code>numCourses</code> courses, numbered <code>0</code> to <code>numCourses - 1</code>. Each pair{" "}
          <code>[a, b]</code> in <code>prerequisites</code> means you must take course <code>b</code> before course <code>a</code>. Return{" "}
          <code>true</code> if you can finish all the courses.
        </p>
      </Problem>
    </>
  );
}
