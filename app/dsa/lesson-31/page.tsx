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
  { id: "concept", label: "A window is two markers and a little memory" },
  { id: "template", label: "The variable-window template" },
  { id: "norepeat", label: "Longest substring without repeating characters" },
  { id: "trace", label: "Traced: windows over “abcabcbb”" },
  { id: "replace", label: "Longest repeating character replacement" },
  { id: "fixed", label: "Fixed-size windows: permutations and anagrams" },
  { id: "minwindow", label: "Minimum window substring" },
  { id: "practice", label: "Practice questions (7)" },
  { id: "recall", label: "Make it stick" },
  { id: "next", label: "Part 7 complete: what's next" },
];

const templateSrc = `// Variable-size window: grow on the right, shrink from the left while the window is not valid.
let left = 0;
for (let right = 0; right < s.length; right++) {
  // 1. add s[right] to what the window remembers (a Set, counts, ...)
  while (/* the window is not valid */) {
    // 2. remove s[left] from what the window remembers
    left++;
  }
  // 3. the window s[left..right] is valid now: save the answer (length, start, ...)
}`;

const noRepeatCode = `function lengthOfLongestSubstring(s) {
  const seen = new Set();            // letters that are inside the window now
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {     // s[right] is a repeat: shrink until it is gone
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
  t.step(3, "start", "left = 0, best = 0", "The window s[left..right] starts empty. The Set will hold exactly the letters that are inside the window.", { s, left, best, seen });
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      t.step(5, "check", `"${s[right]}" is already in the window`, `A repeated letter means the window is not valid. Remove letters from the left, starting with s[left] = "${s[left]}", until "${s[right]}" is gone.`, { right, left, seen, best }, "right");
      seen.delete(s[left]);
      left++;
      t.step(7, "update", `left = ${left}`, `We dropped one letter. The window is now s[${left}..${right}].`, { right, left, seen, best }, "left");
    }
    seen.add(s[right]);
    best = Math.max(best, right - left + 1);
    t.step(9, "run", `add "${s[right]}": window "${s.slice(left, right + 1)}", length ${right - left + 1}`, `The window has no repeats, so its length could be the answer. best = ${best}.`, { right, left, seen, best }, "best");
  }
  t.print(best);
  t.step(11, "print", "console.log(best)", "The longest window with no repeated letter had length 3 (for example “abc”).", { left, best, seen });
  return t.steps;
}

const replaceCode = `function characterReplacement(s, k) {
  const count = {};
  let left = 0, maxFreq = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    count[s[right]] = (count[s[right]] || 0) + 1;
    maxFreq = Math.max(maxFreq, count[s[right]]);        // highest count of one letter seen in any window so far
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
  const win = new Array(26).fill(0);             // letter counts of the window now
  for (const c of p) need[idx(c)]++;

  const result = [];
  for (let i = 0; i < s.length; i++) {
    win[idx(s[i])]++;                            // letter enters on the right
    if (i >= p.length) win[idx(s[i - p.length])]--;   // letter leaves on the left: the window stays p.length long
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
  let missing = t.length;                        // how many letters the window is still missing
  let left = 0, bestStart = 0, bestLen = Infinity;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (need.has(c)) {
      if (need.get(c) > 0) missing--;            // we still needed this letter
      need.set(c, need.get(c) - 1);              // can go below 0: that means an extra copy
    }
    while (missing === 0) {                      // the window has all of t: try to make it smaller
      if (right - left + 1 < bestLen) { bestLen = right - left + 1; bestStart = left; }
      const l = s[left];
      if (need.has(l)) {
        need.set(l, need.get(l) + 1);
        if (need.get(l) > 0) missing++;          // we just lost a letter we needed
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
      <h2 id="concept">A window is two markers and a little memory</h2>
      <p>
        Lessons 22 and 23 taught the sliding window on arrays. On text it is the same idea. Think of a small frame that you slide along a line of letters. Two pointers (markers), <code>left</code> and{" "}
        <code>right</code>, mark the two ends of a <strong>substring</strong> (a piece of the text with no gaps). A little memory (a Set, a Map or an array of
        counts) tells you what is inside the frame right now. Moving the window one step costs O(1), which means it takes the same short time however long the text is. You only update the
        one letter that enters or leaves. You do not count the whole substring again.
      </p>
      <p>
        The brute-force way is to check every substring. There are O(n²) substrings and each check costs O(n), so the total is O(n³). The window turns this into one O(n) pass
        (the time grows in step with the text length). Each pointer only moves forward, so together they move at most 2n times.
      </p>
      <p>Two kinds of windows cover almost every question.</p>
      <ul>
        <li><strong>Variable-size windows</strong> grow and shrink to stay valid. The question sounds like &ldquo;find the longest substring where…&rdquo;.</li>
        <li><strong>Fixed-size windows</strong> always have the same length and just slide. The question sounds like &ldquo;is any window of length k an anagram of…&rdquo;. (An anagram uses the same letters in a different order.)</li>
      </ul>

      <h2 id="template">The variable-window template</h2>
      <CodeBlock lang="js" code={templateSrc} />
      <p>
        Every problem needs three decisions: <strong>what the window remembers</strong>, <strong>when the window is not valid</strong> and{" "}
        <strong>what to save when the window is valid</strong>. Once you can answer these three, the code is easy to write.
      </p>
      <Callout kind="note" label="Longest vs shortest">
        For a <em>longest</em> valid window, save the answer <strong>after</strong> the shrinking, because the window is valid at that point. For
        a <em>shortest</em> valid window (minimum window substring), save the answer <strong>inside</strong> the shrink loop,
        while the window is still valid. Then shrink more to see if it can get even smaller.
      </Callout>

      <h2 id="norepeat">Longest substring without repeating characters</h2>
      <ul>
        <li><strong>Memory:</strong> a <code>Set</code> (a list that keeps each item only once) of the letters in the window.</li>
        <li><strong>Not valid:</strong> the new letter is already in the Set.</li>
        <li><strong>Shrink:</strong> remove letters from the left until the repeat is gone.</li>
        <li><strong>Save:</strong> the length <code>right - left + 1</code> after adding the new letter.</li>
      </ul>
      <CodeBlock lang="js" code={noRepeatCode} />
      <p>
        Each letter is added once and removed at most once, so the time is <strong>O(n)</strong>. The Set can never hold more than the
        number of different letters in the alphabet, so the space is <strong>O(min(n, alphabet))</strong>. That means it is the smaller of the text length and the alphabet size.
      </p>

      <h2 id="trace">Traced: windows over &ldquo;abcabcbb&rdquo;</h2>
      <CodeTrace
        code={traceSrc}
        steps={windowTrace()}
        caption="The window grows while the letters are new. It shrinks from the left only when a repeated letter arrives."
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
        note="The answer is 3 (“wke” or “kew”). “pwke” does not count. It skips a letter, so it is a subsequence and not a substring. A window must have no gaps."
      />

      <h2 id="replace">Longest repeating character replacement</h2>
      <p>
        You may change up to <code>k</code> letters. You want the longest window that can become one repeated letter. That is the
        longest window where <strong>(window size − count of the most common letter) ≤ k</strong>. The letters that are not the
        most common one are the ones you would change.
      </p>
      <CodeBlock lang="js" code={replaceCode} />
      <Callout kind="warn" label="Why maxFreq can be out of date, and why that is fine">
        When the window shrinks, we do not work out <code>maxFreq</code> again. So it can be bigger than the real highest count inside the
        window. This is safe. The answer can only get bigger when a window with a <em>larger</em> maxFreq appears. An out-of-date value
        never lets the window grow past a size we already reached. It also saves us from checking all 26 counters at every step.
      </Callout>

      <h2 id="fixed">Fixed-size windows: permutations and anagrams</h2>
      <p>
        An anagram of <code>p</code> has exactly the same letter counts as <code>p</code> and the same length. So slide a window
        of length <code>p.length</code> across <code>s</code>. Keep its letter counts up to date: add the letter that enters and
        subtract the letter that leaves. Then compare with the counts of <code>p</code>.
      </p>
      <CodeBlock lang="js" code={anagramCode} />
      <p>
        Comparing two arrays of 26 numbers costs O(26). That is a fixed amount, so it does not grow with the text, and the total time is O(n). The &ldquo;permutation in string&rdquo; question below uses the same loop. It just returns <code>true</code> at the first match.
      </p>

      <h2 id="minwindow">Minimum window substring</h2>
      <p>
        Find the smallest substring of <code>s</code> that contains every letter of <code>t</code>, with the right counts. The
        window is <strong>valid</strong> when no letter is missing. This is the &ldquo;shortest&rdquo; kind. Grow the window until it
        has all of <code>t</code>. Then shrink it as far as you can while it still has all of <code>t</code>. Save the best window each time.
      </p>
      <CodeBlock lang="js" code={minWindowCode} />
      <p>
        <code>need</code> counts how many copies of each letter we still want. It can go below 0 when the window holds extra
        copies. <code>missing</code> is one number that tells you at once (O(1)) whether the window is valid. So you never compare
        whole maps. The time is O(n + m), where m is the length of <code>t</code>. The space is O(m) for the letters of <code>t</code>.
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
      <p>For each question, first name the three decisions: what the window remembers, when it is not valid, and what to save.</p>

      <Questions />

      <h2 id="recall">Make it stick</h2>
      <Recall
        items={[
          <>Write the variable-window template and the three decisions every window problem needs.</>,
          <>Explain why you save the longest-window answer after shrinking, and the shortest-window answer inside the loop.</>,
          <>Work out the condition <code>windowSize − maxFreq &gt; k</code> for character replacement.</>,
          <>Explain how the &ldquo;missing&rdquo; counter lets you check the minimum window in O(1).</>,
        ]}
      />

      <h2 id="next">Part 7 complete: what&apos;s next</h2>
      <p>
        You can now solve questions on palindromes, prefixes, compression, and every common window question on text. <strong>Part 8</strong>{" "}
        moves from scanning to <em>exploring</em>. You will learn recursion trees (a function that calls itself). Then you will list every subset, permutation and combination
        with backtracking (try a choice, and undo it if it does not work).
      </p>
    </DsaLessonPage>
  );
}
