import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 30 practice questions: string patterns. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Valid palindrome"
        level="Easy"
        examples={[
          { input: '"A man, a plan, a canal: Panama"', output: "true", why: 'Keeping only letters and digits and ignoring case gives "amanaplanacanalpanama", which reads the same both ways.' },
          { input: '"race a car"', output: "false", why: 'It becomes "raceacar". The outer pairs r/r, a/a and c/c match, but then "e" meets "a" and the check fails.' },
          { input: '" "', output: "true", why: "After removing everything that is not a letter or digit, the string is empty. An empty string is a palindrome." },
        ]}
        hints={[
          <>Put one pointer at each end. When must a pointer skip a character?</>,
          <>Skip with a nested <code>while</code> loop that also checks <code>l &lt; r</code>. Then the pointers never cross while skipping.</>,
        ]}
        approaches={[
          {
            name: "Clean, then compare with the reverse",
            idea: (
              <ol>
                <li>Lower-case the string and keep only letters and digits.</li>
                <li>Reverse that cleaned string.</li>
                <li>It is a palindrome if the two are equal.</li>
              </ol>
            ),
            code: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean === [...clean].reverse().join("");
}

console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car"));                     // false
console.log(isPalindrome(" "));                              // true`,
            explain: <p>This is easy to read, but it builds two extra strings. It takes O(n) time and O(n) extra space.</p>,
          },
          {
            name: "Two pointers that skip",
            idea: (
              <ol>
                <li>Start <code>l</code> at the front and <code>r</code> at the back.</li>
                <li>Move <code>l</code> right past characters that are not letters or digits. Move <code>r</code> left past them.</li>
                <li>Compare the two characters in lower case. A mismatch means the answer is false.</li>
                <li>Step both inwards and repeat while <code>l &lt; r</code>.</li>
              </ol>
            ),
            code: `function isPalindrome(s) {
  const isAlnum = (c) => /[a-z0-9]/i.test(c);
  let l = 0, r = s.length - 1;
  while (l < r) {
    while (l < r && !isAlnum(s[l])) l++;
    while (l < r && !isAlnum(s[r])) r--;
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++;
    r--;
  }
  return true;
}

console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car"));                     // false
console.log(isPalindrome(" "));                              // true`,
            explain: (
              <p>
                Every character is visited at most once, so it takes O(n) time and O(1) extra space. For <code>&quot; &quot;</code>,
                the inner loop moves <code>l</code> until it meets <code>r</code>. Then the outer loop ends and the answer is true.
              </p>
            ),
          },
        ]}
        compare={<p>Use the two-pointer version in an interview. The interviewer will often ask a follow-up about extra space. (LeetCode 125.)</p>}
      >
        <p>
          Return <code>true</code> if the string is a palindrome after you change it to lower case and remove every character
          that is not a letter or digit.
        </p>
      </Problem>

      <Problem
        n={2}
        title="Valid palindrome II (delete at most one character)"
        level="Easy"
        examples={[
          { input: '"aba"', output: "true", why: "Already a palindrome." },
          { input: '"abca"', output: "true", why: 'Delete "b" to get "aca", or delete "c" to get "aba".' },
          { input: '"abc"', output: "false", why: "Deleting any one character leaves two different letters." },
        ]}
        hints={[
          <>Run the normal two-pointer check. What should you do at the first mismatch?</>,
          <>At the first mismatch there are only two choices: skip the left character or skip the right character. Check whether either remaining middle part is a palindrome.</>,
        ]}
        approaches={[
          {
            name: "Try deleting each character",
            idea: <p>For every index, remove that character. Then test whether the rest is a palindrome.</p>,
            code: `function validPalindrome(s) {
  const isPal = (t) => t === [...t].reverse().join("");
  if (isPal(s)) return true;
  for (let i = 0; i < s.length; i++) {
    if (isPal(s.slice(0, i) + s.slice(i + 1))) return true;
  }
  return false;
}

console.log(validPalindrome("abca")); // true
console.log(validPalindrome("abc"));  // false`,
            explain: <p>There are n deletions, and each check costs O(n), so the total is O(n²) time. It is correct, but too slow for large inputs.</p>,
          },
          {
            name: "Two pointers, one allowed mismatch",
            idea: (
              <ol>
                <li>Move the pointers inwards while the characters match.</li>
                <li>At the first mismatch, the only way to succeed is to delete <code>s[l]</code> or <code>s[r]</code>.</li>
                <li>Check the two remaining ranges, <code>l+1 … r</code> and <code>l … r-1</code>, with a plain palindrome helper function.</li>
              </ol>
            ),
            code: `function validPalindrome(s) {
  const isPal = (l, r) => {
    while (l < r) {
      if (s[l] !== s[r]) return false;
      l++;
      r--;
    }
    return true;
  };
  let l = 0, r = s.length - 1;
  while (l < r) {
    if (s[l] !== s[r]) return isPal(l + 1, r) || isPal(l, r - 1);
    l++;
    r--;
  }
  return true;
}

console.log(validPalindrome("aba"));  // true
console.log(validPalindrome("abca")); // true
console.log(validPalindrome("abc"));  // false`,
            explain: (
              <p>
                In &ldquo;abca&rdquo; the first mismatch is <code>b</code> vs <code>c</code> at l = 1, r = 2. Deleting{" "}
                <code>b</code> leaves <code>s[2..2]</code> = &ldquo;c&rdquo;, which is a palindrome, so the answer is true. The helper
                runs at most twice over the middle part, so the total is O(n) time and O(1) extra space.
              </p>
            ),
          },
        ]}
        compare={<p>The key idea of this question is to branch into two choices only at the first mismatch. (LeetCode 680.)</p>}
      >
        <p>Return <code>true</code> if the string can become a palindrome after deleting <strong>at most one</strong> character.</p>
      </Problem>

      <Problem
        n={3}
        title="Longest common prefix"
        level="Easy"
        examples={[
          { input: '["flower", "flow", "flight"]', output: '"fl"', why: 'All three start with "fl", but "flo" fails on "flight".' },
          { input: '["dog", "racecar", "car"]', output: '""', why: "The first letters differ, so there is no common prefix." },
        ]}
        hints={[
          <>The answer is never longer than the shortest word.</>,
          <>Compare column by column. Is the character at index 0 the same in every word? Then is the character at index 1 the same?</>,
        ]}
        approaches={[
          {
            name: "Shrink the prefix word by word",
            idea: (
              <ol>
                <li>Start with the first word as the prefix.</li>
                <li>For each next word, cut the last character off the prefix until the word starts with the prefix.</li>
              </ol>
            ),
            code: `function longestCommonPrefix(strs) {
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

console.log(longestCommonPrefix(["flower", "flow", "flight"])); // fl
console.log(longestCommonPrefix(["dog", "racecar", "car"]));    // (empty)`,
            explain: <p>O(S) time, where S is the total number of characters, and O(1) extra space.</p>,
          },
          {
            name: "Column by column",
            idea: (
              <ol>
                <li>For each index <code>i</code> of the first word, take its character.</li>
                <li>If any other word is too short, or has a different character at <code>i</code>, return the part that has matched so far.</li>
              </ol>
            ),
            code: `function longestCommonPrefix(strs) {
  for (let i = 0; i < strs[0].length; i++) {
    for (let k = 1; k < strs.length; k++) {
      if (i === strs[k].length || strs[k][i] !== strs[0][i]) {
        return strs[0].slice(0, i);
      }
    }
  }
  return strs[0];
}

console.log(longestCommonPrefix(["flower", "flow", "flight"])); // fl
console.log(longestCommonPrefix(["dog", "racecar", "car"]));    // (empty)
console.log(longestCommonPrefix(["same"]));                      // same`,
            explain: <p>It stops at the first column that does not match, so it never reads characters past the answer. It takes O(S) time in the worst case.</p>,
          },
        ]}
        compare={<p>Both are fine. Column by column is easier to explain on a whiteboard. (LeetCode 14.)</p>}
      >
        <p>Return the longest string that is a prefix of every string in the array. Return <code>&quot;&quot;</code> (an empty string) if there is none.</p>
      </Problem>

      <Problem
        n={4}
        title="Roman to integer"
        level="Easy"
        examples={[
          { input: '"III"', output: "3", why: "1 + 1 + 1." },
          { input: '"LVIII"', output: "58", why: "L = 50, V = 5, III = 3." },
          { input: '"MCMXCIV"', output: "1994", why: "M = 1000, CM = 900, XC = 90, IV = 4." },
        ]}
        hints={[
          <>Store the values of the seven symbols in an object.</>,
          <>When is a symbol subtracted instead of added? Compare it with the symbol after it.</>,
        ]}
        approaches={[
          {
            name: "Compare with the next symbol",
            idea: (
              <ol>
                <li>Look up each symbol&apos;s value.</li>
                <li>If it is smaller than the next symbol&apos;s value, subtract it; otherwise add it.</li>
              </ol>
            ),
            code: `function romanToInt(s) {
  const v = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    if (i + 1 < s.length && v[s[i]] < v[s[i + 1]]) total -= v[s[i]];
    else total += v[s[i]];
  }
  return total;
}

console.log(romanToInt("III"));     // 3
console.log(romanToInt("LVIII"));   // 58
console.log(romanToInt("MCMXCIV")); // 1994`,
            explain: <p>One pass: O(n) time and O(1) extra space.</p>,
          },
          {
            name: "Right to left",
            idea: (
              <ol>
                <li>Walk from the last symbol to the first. Remember the previous value, which is the one to the right.</li>
                <li>If the current value is smaller than the value to its right, subtract it. Otherwise, add it.</li>
              </ol>
            ),
            code: `function romanToInt(s) {
  const v = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0, prev = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    const cur = v[s[i]];
    total += cur < prev ? -cur : cur;
    prev = cur;
  }
  return total;
}

console.log(romanToInt("MCMXCIV")); // 1994
console.log(romanToInt("IX"));      // 9`,
            explain: <p>The cost is the same. There is no bounds check for &ldquo;is there a next symbol?&rdquo;, because the previous value starts at 0.</p>,
          },
        ]}
        compare={<p>Pick the one you can write without mistakes. (LeetCode 13.)</p>}
      >
        <p>Convert a valid Roman numeral (from 1 to 3999) to an integer (a whole number).</p>
      </Problem>

      <Problem
        n={5}
        title="Longest palindromic substring"
        level="Medium"
        examples={[
          { input: '"babad"', output: '"bab"', why: '"aba" is also valid; either is accepted.' },
          { input: '"cbbd"', output: '"bb"', why: "An even-length palindrome centred between the two b's." },
        ]}
        hints={[
          <>Every palindrome has a centre. How many centres does a string of length n have?</>,
          <>From a centre, move one pointer left and one right while the characters match.</>,
          <>Remember the even case: the centre is between two characters.</>,
        ]}
        approaches={[
          {
            name: "Check every substring",
            idea: <p>Make every substring, test each one with the two-pointer palindrome check, and keep the longest.</p>,
            code: `function longestPalindrome(s) {
  const isPal = (l, r) => {
    while (l < r) if (s[l++] !== s[r--]) return false;
    return true;
  };
  let best = "";
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      if (j - i + 1 > best.length && isPal(i, j)) best = s.slice(i, j + 1);
    }
  }
  return best;
}

console.log(longestPalindrome("babad")); // bab
console.log(longestPalindrome("cbbd"));  // bb`,
            explain: <p>There are O(n²) substrings, and each check costs O(n), so the total is O(n³) time. It is fine as a starting point, but too slow when n is 1000 or more.</p>,
          },
          {
            name: "Expand around the centre",
            idea: (
              <ol>
                <li>For each index, expand twice: once for an odd-length palindrome and once for an even-length palindrome.</li>
                <li>Keep track of the best length and where it starts.</li>
              </ol>
            ),
            code: `function longestPalindrome(s) {
  let start = 0, best = 0;
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    return r - l - 1;
  };
  for (let i = 0; i < s.length; i++) {
    const len = Math.max(expand(i, i), expand(i, i + 1));
    if (len > best) {
      best = len;
      start = i - Math.floor((len - 1) / 2);
    }
  }
  return s.slice(start, start + best);
}

console.log(longestPalindrome("babad")); // bab
console.log(longestPalindrome("cbbd"));  // bb
console.log(longestPalindrome("a"));     // a`,
            explain: (
              <p>
                O(n²) time, O(1) extra space. Why is <code>start = i - Math.floor((len - 1) / 2)</code>? An odd palindrome of
                length 3 centred on i begins one place to the left (i − 1). An even palindrome of length 4 centred between i
                and i + 1 also begins at i − 1. The formula works for both.
              </p>
            ),
          },
        ]}
        compare={
          <p>
            Expanding around the centre is the standard interview answer. (A special O(n) algorithm called Manacher&apos;s algorithm exists,
            but interviewers almost never expect it.) LeetCode 5.
          </p>
        }
      >
        <p>Return the longest substring of <code>s</code> that is a palindrome.</p>
      </Problem>

      <Problem
        n={6}
        title="String compression (in place)"
        level="Medium"
        examples={[
          { input: '["a","a","b","b","c","c","c"]', output: '6, chars = ["a","2","b","2","c","3"]', why: "The runs aa, bb and ccc become a2, b2 and c3." },
          { input: '["a"]', output: '1, chars = ["a"]', why: "A run of length 1 is written without a count." },
          { input: '["a","b","b","b","b","b","b","b","b","b","b","b","b"]', output: '4, chars = ["a","b","1","2"]', why: "There are twelve b's. The count 12 is written as two characters." },
        ]}
        hints={[
          <>Use a read pointer to find the end of each run. Use a write pointer to record the results.</>,
          <>Write the character first. Write the count only if the run is longer than 1.</>,
          <>The count may have several digits. Write them one at a time.</>,
        ]}
        approaches={[
          {
            name: "Build a new array",
            idea: <p>Collect the pieces in a new array. Then copy them back into <code>chars</code>.</p>,
            code: `function compress(chars) {
  const out = [];
  let i = 0;
  while (i < chars.length) {
    let j = i;
    while (j < chars.length && chars[j] === chars[i]) j++;
    out.push(chars[i]);
    if (j - i > 1) out.push(...String(j - i));
    i = j;
  }
  for (let k = 0; k < out.length; k++) chars[k] = out[k];
  return out.length;
}

const a = ["a", "a", "b", "b", "c", "c", "c"];
console.log(compress(a));  // 6`,
            explain: <p>O(n) time, but O(n) extra space. So it breaks the &ldquo;in place&rdquo; rule.</p>,
          },
          {
            name: "Read and write pointers",
            idea: (
              <ol>
                <li><code>i</code> marks the start of a run. <code>j</code> scans to the end of the run.</li>
                <li>Write <code>chars[i]</code> at position <code>write</code>. If the run is longer than 1, write each digit of its length.</li>
                <li>Move <code>i</code> to <code>j</code> and repeat.</li>
              </ol>
            ),
            code: `function compress(chars) {
  let write = 0, i = 0;
  while (i < chars.length) {
    const ch = chars[i];
    let j = i;
    while (j < chars.length && chars[j] === ch) j++;
    chars[write++] = ch;
    if (j - i > 1) {
      for (const d of String(j - i)) chars[write++] = d;
    }
    i = j;
  }
  return write;
}

const a = ["a", "a", "b", "b", "c", "c", "c"];
const n = compress(a);
console.log(n);                    // 6
console.log(a.slice(0, n).join("")); // a2b2c3

const b = ["a", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b"];
const m = compress(b);
console.log(m);                    // 4
console.log(b.slice(0, m).join("")); // ab12`,
            explain: (
              <p>
                The write pointer never passes the read pointer. A run of length 2 or more is replaced by at most the same
                number of characters (the letter plus its digits). A run of length 1 is replaced by exactly 1 character. This takes O(n) time and O(1) extra space.
              </p>
            ),
          },
        ]}
        compare={<p>Use the two-pointer version, because the question says &ldquo;in place&rdquo;. (LeetCode 443.)</p>}
      >
        <p>
          Compress the character array in place. Each run of repeated characters becomes the character, followed by the length
          of the run if that length is more than 1. Return the new length.
        </p>
      </Problem>

      <Problem
        n={7}
        title="Rotate string"
        level="Easy"
        examples={[
          { input: 's = "abcde", goal = "cdeab"', output: "true", why: 'Moving "ab" from the front of "abcde" to the back gives "cdeab".' },
          { input: 's = "abcde", goal = "abced"', output: "false", why: "The letters are the same, but no rotation gives this order." },
        ]}
        hints={[
          <>If the lengths are different, the answer is false at once.</>,
          <>Write s twice in a row. Where does every rotation of s appear in it?</>,
        ]}
        approaches={[
          {
            name: "Try every rotation",
            idea: <p>Rotate by 1, 2, … n − 1 positions. Compare each result with the goal.</p>,
            code: `function rotateString(s, goal) {
  if (s.length !== goal.length) return false;
  for (let k = 0; k < s.length; k++) {
    if (s.slice(k) + s.slice(0, k) === goal) return true;
  }
  return false;
}

console.log(rotateString("abcde", "cdeab")); // true
console.log(rotateString("abcde", "abced")); // false`,
            explain: <p>There are n rotations, and each comparison costs O(n), so the total is O(n²) time.</p>,
          },
          {
            name: "Search in the doubled string",
            idea: <p>Every rotation of s is a substring of s + s. And any substring of s + s that has the same length as s is a rotation.</p>,
            code: `function rotateString(s, goal) {
  return s.length === goal.length && (s + s).includes(goal);
}

console.log(rotateString("abcde", "cdeab")); // true
console.log(rotateString("abcde", "abced")); // false
console.log(rotateString("a", "b"));         // false`,
            explain: <p>The built-in <code>includes</code> is fast in practice. The length check prevents wrong answers such as goal = &ldquo;bcdeab&rdquo; (this is inside &ldquo;abcdeabcde&rdquo;, but it is longer than s).</p>,
          },
        ]}
        compare={<p>The doubled string gives a one-line answer and shows that you know the trick. (LeetCode 796.)</p>}
      >
        <p>Return <code>true</code> if you can get <code>goal</code> from <code>s</code> by moving some characters from the front to the end, any number of times.</p>
      </Problem>

      <DryRun
        title="Which technique for which wording?"
        cols={["If the question says…", "Reach for…", "Cost"]}
        rows={[
          ["is it a palindrome / ignore punctuation", "two pointers from both ends, skipping", "O(n), O(1)"],
          ["longest palindromic substring", "expand around each centre", "O(n²), O(1)"],
          ["common prefix of many words", "shrink prefix, or scan columns", "O(total chars)"],
          ["convert symbols with special pairs", "look at the next character", "O(n)"],
          ["modify in place, shorter result", "read pointer + write pointer", "O(n), O(1)"],
          ["is B a rotation of A", "search B inside A + A", "O(n) typical"],
        ]}
      />
    </>
  );
}
