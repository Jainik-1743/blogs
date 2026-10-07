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

const lesson = getDsaLesson("lesson-31");

export const metadata: Metadata = {
  title: `Lesson 31 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "A window is two pointers and some memory" },
  { id: "template", label: "The variable-window template" },
  { id: "norepeat", label: "Longest substring without repeating characters" },
  { id: "trace", label: "Traced: windows over “abcabcbb”" },
  { id: "replace", label: "Longest repeating character replacement" },
  { id: "fixed", label: "Fixed windows: permutations and anagrams" },
  { id: "minwindow", label: "Minimum window substring" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "Part 7 complete — what's next" },
];

const templateSrc = `// Variable window: grow on the right, shrink on the left while the window is invalid.
let left = 0;
for (let right = 0; right < s.length; right++) {
  // 1. add s[right] to the window's memory (a Set, counts, ...)
  while (/* the window is invalid */) {
    // 2. remove s[left] from the window's memory
    left++;
  }
  // 3. the window s[left..right] is valid: record the answer (length, start, ...)
}`;

const noRepeatCode = `function lengthOfLongestSubstring(s) {
  const seen = new Set();            // characters currently inside the window
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {     // s[right] is a repeat: shrink until it is not
      seen.delete(s[left]);
      left++;
    }
    seen.add(s[right]);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(lengthOfLongestSubstring("abcabcbb")); // 3
console.log(lengthOfLongestSubstring("bbbbb"));    // 1
console.log(lengthOfLongestSubstring("pwwkew"));   // 3
console.log(lengthOfLongestSubstring(""));         // 0`;

const traceSrc = `const s = "abcabcbb";
const seen = new Set();
let left = 0, best = 0;
for (let right = 0; right < s.length; right++) {
  while (seen.has(s[right])) {
    seen.delete(s[left]);
    left++;
  }
  seen.add(s[right]);
  best = Math.max(best, right - left + 1);
}
console.log(best);`;

function windowTrace() {
  const t = tracer();
  const s = "abcabcbb";
  const seen = new Set<string>();
  let left = 0, best = 0;
  t.step(3, "start", "left = 0, best = 0", "The window s[left..right] starts empty. The Set will hold exactly the characters inside it.", { s, left, best, seen });
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      t.step(5, "check", `"${s[right]}" is already in the window`, `A repeat means the window is invalid. Remove s[left] = "${s[left]}" from the left until "${s[right]}" is gone.`, { right, left, seen, best }, "right");
      seen.delete(s[left]);
      left++;
      t.step(7, "update", `left = ${left}`, `Dropped one character. The window is now s[${left}..${right}].`, { right, left, seen, best }, "left");
    }
    seen.add(s[right]);
    best = Math.max(best, right - left + 1);
    t.step(9, "run", `add "${s[right]}": window "${s.slice(left, right + 1)}", length ${right - left + 1}`, `The window has no repeats, so its length is a candidate. best = ${best}.`, { right, left, seen, best }, "best");
  }
  t.print(best);
  t.step(11, "print", "console.log(best)", "The longest window without a repeat had length 3 (for example “abc”).", { left, best, seen });
  return t.steps;
}

const replaceCode = `function characterReplacement(s, k) {
  const count = {};
  let left = 0, maxFreq = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    count[s[right]] = (count[s[right]] || 0) + 1;
    maxFreq = Math.max(maxFreq, count[s[right]]);        // most common letter seen in any window so far
    // letters to change = window size - count of the most common letter
    while (right - left + 1 - maxFreq > k) {
      count[s[left]]--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}

console.log(characterReplacement("ABAB", 2));    // 4
console.log(characterReplacement("AABABBA", 1)); // 4`;

const anagramCode = `function findAnagrams(s, p) {
  const idx = (c) => c.charCodeAt(0) - 97;
  const need = new Array(26).fill(0);            // letter counts of p
  const win = new Array(26).fill(0);             // letter counts of the current window
  for (const c of p) need[idx(c)]++;

  const result = [];
  for (let i = 0; i < s.length; i++) {
    win[idx(s[i])]++;                            // letter enters on the right
    if (i >= p.length) win[idx(s[i - p.length])]--;   // letter leaves on the left: the window stays p.length wide
    if (i >= p.length - 1 && need.every((n, j) => n === win[j])) {
      result.push(i - p.length + 1);             // start index of this anagram
    }
  }
  return result;
}

console.log(findAnagrams("cbaebabacd", "abc")); // [0, 6]
console.log(findAnagrams("abab", "ab"));        // [0, 1, 2]`;

const minWindowCode = `function minWindow(s, t) {
  const need = new Map();                        // how many of each letter we still need
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);
  let missing = t.length;                        // letters still missing from the window
  let left = 0, bestStart = 0, bestLen = Infinity;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (need.has(c)) {
      if (need.get(c) > 0) missing--;            // this letter was still needed
      need.set(c, need.get(c) - 1);              // may go negative: an extra copy
    }
    while (missing === 0) {                      // the window covers t: try to shrink it
      if (right - left + 1 < bestLen) { bestLen = right - left + 1; bestStart = left; }
      const l = s[left];
      if (need.has(l)) {
        need.set(l, need.get(l) + 1);
        if (need.get(l) > 0) missing++;          // we just gave up a letter we needed
      }
      left++;
    }
  }
  return bestLen === Infinity ? "" : s.slice(bestStart, bestStart + bestLen);
}

console.log(minWindow("ADOBECODEBANC", "ABC")); // BANC
console.log(minWindow("a", "a"));               // a
console.log(minWindow("a", "aa") === "");       // true`;

export default function DsaLessonThirtyOnePage() {
  return (
    <DsaLessonPage lesson={lesson} outline={outline}>
      <h2 id="concept">A window is two pointers and some memory</h2>
      <p>
        Lessons 22 and 23 introduced the sliding window on arrays. On text it is the same idea: two pointers, <code>left</code> and{" "}
        <code>right</code>, mark a <strong>contiguous substring</strong>, and a little memory (a Set, a Map or an array of
        counts) describes what is currently inside it. Moving the window one step costs O(1) because you only update the
        character that enters or leaves, instead of recounting the whole substring.
      </p>
      <p>
        That turns the brute-force &ldquo;check every substring&rdquo; (O(n²) substrings × O(n) to check = O(n³)) into a single
        O(n) pass: each pointer only ever moves forward, so together they move at most 2n times.
      </p>
      <p>Two kinds of windows cover almost every question:</p>
      <ul>
        <li><strong>Variable windows</strong> grow and shrink to stay valid — &ldquo;the longest substring such that…&rdquo;.</li>
        <li><strong>Fixed windows</strong> have a set size and slide — &ldquo;is any window of length k an anagram of…&rdquo;.</li>
      </ul>

      <h2 id="template">The variable-window template</h2>
      <CodeBlock lang="js" code={templateSrc} />
      <p>
        Three decisions define every problem: <strong>what the window remembers</strong>, <strong>when it is invalid</strong> and{" "}
        <strong>what to record when it is valid</strong>. Once you can answer them, the code writes itself.
      </p>
      <Callout kind="note" label="Longest vs shortest">
        For a <em>longest</em> valid window, record the answer <strong>after</strong> shrinking (the window is valid there). For
        a <em>shortest</em> valid window (minimum window substring), record the answer <strong>inside</strong> the shrink loop,
        while the window is still valid, then shrink further to try to make it smaller.
      </Callout>

      <h2 id="norepeat">Longest substring without repeating characters</h2>
      <ul>
        <li><strong>Memory:</strong> a <code>Set</code> of the characters in the window.</li>
        <li><strong>Invalid:</strong> the incoming character is already in the Set.</li>
        <li><strong>Shrink:</strong> remove from the left until the repeat is gone.</li>
        <li><strong>Record:</strong> <code>right - left + 1</code> after adding.</li>
      </ul>
      <CodeBlock lang="js" code={noRepeatCode} />
      <p>
        Each character is added once and removed at most once, so the time is <strong>O(n)</strong>; the Set holds at most the
        alphabet size, so the space is <strong>O(min(n, alphabet))</strong>.
      </p>

      <h2 id="trace">Traced: windows over &ldquo;abcabcbb&rdquo;</h2>
      <CodeTrace
        code={traceSrc}
        steps={windowTrace()}
        caption="The window grows while characters are new, and shrinks from the left only when a repeat arrives."
      />
      <DryRun
        title='"pwwkew"'
        cols={["right", "char", "repeat?", "window after", "best"]}
        rows={[
          ["0", "p", "no", "p", "1"],
          ["1", "w", "no", "pw", "2"],
          ["2", "w", "yes → drop p, w", "w", "2"],
          ["3", "k", "no", "wk", "2"],
          ["4", "e", "no", "wke", "3"],
          ["5", "w", "yes → drop w", "kew", "3"],
        ]}
        note="The answer is 3 (“wke” or “kew”). Note “pwke” is a subsequence, not a substring: a window must be contiguous."
      />

      <h2 id="replace">Longest repeating character replacement</h2>
      <p>
        You may change up to <code>k</code> letters. The longest window you can turn into a single repeated letter is the
        longest window where <strong>(window size − count of the most common letter) ≤ k</strong>: the letters that are not the
        most common one are the ones you would change.
      </p>
      <CodeBlock lang="js" code={replaceCode} />
      <Callout kind="warn" label="Why maxFreq may be stale — and why that is fine">
        When the window shrinks, <code>maxFreq</code> is not recomputed, so it can be larger than the true maximum inside the
        window. That is safe: the answer can only grow when a window with a <em>larger</em> maxFreq appears, and a stale value
        never lets the window grow past a size that was already achieved. It saves scanning 26 counters on every step.
      </Callout>

      <h2 id="fixed">Fixed windows: permutations and anagrams</h2>
      <p>
        An anagram of <code>p</code> has exactly the same letter counts as <code>p</code> and the same length. So slide a window
        of length <code>p.length</code> across <code>s</code>, keep its letter counts up to date (add the entering letter,
        subtract the leaving one) and compare with the counts of <code>p</code>.
      </p>
      <CodeBlock lang="js" code={anagramCode} />
      <p>
        Comparing two arrays of 26 numbers is O(26), which is constant, so the time is O(n). The &ldquo;permutation in string&rdquo; question below is the same loop returning <code>true</code> at the first match.
      </p>

      <h2 id="minwindow">Minimum window substring</h2>
      <p>
        Find the smallest substring of <code>s</code> that contains every letter of <code>t</code>, with the right counts. The
        window is <strong>valid</strong> when nothing is missing, so this is the &ldquo;shortest&rdquo; flavour: grow until the window
        covers <code>t</code>, then shrink as far as possible while it still does, recording the best each time.
      </p>
      <CodeBlock lang="js" code={minWindowCode} />
      <p>
        <code>need</code> counts how many copies of each letter are still wanted; it may go negative when the window holds extra
        copies. <code>missing</code> is a single number telling you in O(1) whether the window is valid, which avoids comparing
        whole maps. The time is O(n + m), and the space is O(m) for the letters of <code>t</code>.
      </p>
      <DryRun
        title='minWindow("ADOBECODEBANC", "ABC")'
        cols={["Event", "Window", "Valid?", "Best so far"]}
        rows={[
          ["right reaches C (index 5)", "ADOBEC", "yes", "ADOBEC (6)"],
          ["shrink: drop A", "DOBEC", "no", "ADOBEC (6)"],
          ["right reaches A (index 10)", "DOBECODEBA", "yes (after drops: CODEBA)", "CODEBA (6)"],
          ["right reaches C (index 12)", "ODEBANC", "yes (after drops: BANC)", "BANC (4)"],
        ]}
        note="The shortest window is “BANC”."
      />

      <h2 id="practice">Practice questions</h2>
      <p>For each question, first name the three decisions: what the window remembers, when it is invalid, and what to record.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the variable-window template and the three decisions every window problem needs.</>,
          <>Explain why the longest-window answer is recorded after shrinking and the shortest-window answer inside the loop.</>,
          <>Derive the condition <code>windowSize − maxFreq &gt; k</code> for character replacement.</>,
          <>Explain how the &ldquo;missing&rdquo; counter makes the minimum-window check O(1).</>,
        ]}
      />

      <h2 id="next">Part 7 complete — what&apos;s next</h2>
      <p>
        You can now handle palindromes, prefixes, compression, and every common window question on text. <strong>Part 8</strong>{" "}
        moves from scanning to <em>exploring</em>: recursion trees, then generating every subset, permutation and combination with
        backtracking.
      </p>
    </DsaLessonPage>
  );
}
