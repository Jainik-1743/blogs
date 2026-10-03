import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 9 practice questions. Every question shows each way to solve it. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Count the vowels"
        level="Easy"
        examples={[
          { input: `"Hello World"`, output: "3", why: "The vowels are e, o and o." },
          { input: `"sky"`, output: "0", why: "y is not counted as a vowel here." },
        ]}
        hints={[<>Visit every character. Lower-case the text first so that &ldquo;E&rdquo; and &ldquo;e&rdquo; are treated the same.</>, <><code>&quot;aeiou&quot;.includes(ch)</code> tells you whether <code>ch</code> is a vowel.</>]}
        approaches={[
          {
            name: "Loop and check with includes",
            idea: <p>Count each character that appears in <code>&quot;aeiou&quot;</code>.</p>,
            code: `function countVowels(s) {
  let count = 0;
  for (const ch of s.toLowerCase()) {
    if ("aeiou".includes(ch)) count++;
  }
  return count;
}

console.log(countVowels("Hello World")); // 3
console.log(countVowels("sky"));         // 0`,
            explain: <p><code>&quot;aeiou&quot;.includes(ch)</code> asks &ldquo;is ch one of these five?&rdquo; without five separate comparisons.</p>,
          },
          {
            name: "A Set of vowels",
            idea: <p>Put the vowels in a Set (Lesson 10) and check each character with <code>has</code>.</p>,
            code: `const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function countVowels(s) {
  let count = 0;
  for (const ch of s.toLowerCase()) if (VOWELS.has(ch)) count++;
  return count;
}

console.log(countVowels("Hello World")); // 3`,
            explain: <p>The same idea. A Set lookup is instant no matter how many characters it holds, which matters when the list of allowed characters is long.</p>,
          },
          {
            name: "Regular expression",
            idea: <p>Find every vowel at once with a pattern: <code>/[aeiou]/gi</code>.</p>,
            code: `function countVowels(s) {
  const matches = s.match(/[aeiou]/gi);   // null if there are none
  return matches ? matches.length : 0;
}

console.log(countVowels("Hello World")); // 3
console.log(countVowels("sky"));         // 0`,
            explain: <p><code>[aeiou]</code> matches any one vowel, <code>g</code> finds all matches and <code>i</code> ignores case. Short, but regular expressions are a separate skill; interviewers usually prefer the loop.</p>,
          },
        ]}
        compare={<p>Use Approach 1 in interviews. It is short and needs no extra knowledge.</p>}
      >
        <p>Count the vowels (a, e, i, o, u — either case) in a string.</p>
      </Problem>

      <Problem
        n={2}
        title="Reverse a string"
        level="Easy"
        examples={[
          { input: `"hello"`, output: `"olleh"`, why: "The characters in the opposite order." },
          { input: `"a"`, output: `"a"`, why: "One character reversed is itself." },
        ]}
        hints={[<>Strings cannot be changed, so build a new one.</>, <>Walk from the last index down to 0 and add each character to a new string.</>]}
        approaches={[
          {
            name: "Loop backwards and build",
            idea: <p>Start with an empty string and add characters from the last to the first.</p>,
            code: `function reverseString(s) {
  let rev = "";
  for (let i = s.length - 1; i >= 0; i--) {
    rev += s[i];
  }
  return rev;
}

console.log(reverseString("hello")); // olleh`,
            explain: <p>The traced example from this lesson.</p>,
          },
          {
            name: "split, reverse, join",
            idea: <p>Turn the text into an array of characters, reverse the array, and join it back.</p>,
            code: `const reverseString = (s) => s.split("").reverse().join("");

console.log(reverseString("hello")); // olleh`,
            explain: <p>The standard one-liner in everyday JavaScript.</p>,
          },
          {
            name: "Two pointers on an array of characters",
            idea: <p>LeetCode 344 gives the string as an array of characters and asks you to reverse it in place: swap from both ends.</p>,
            code: `function reverseChars(chars) {
  let left = 0, right = chars.length - 1;
  while (left < right) {
    [chars[left], chars[right]] = [chars[right], chars[left]];
    left++;
    right--;
  }
  return chars;
}

console.log(reverseChars(["h", "e", "l", "l", "o"]).join("")); // olleh`,
            explain: <p>The same two-pointer swap as reversing an array in Lesson 8. Arrays can be changed in place; strings cannot.</p>,
          },
        ]}
        compare={<p>If the question is &ldquo;reverse a string&rdquo;, write Approach 1 or 3 — the interviewer wants to see the loop. In real code, Approach 2 is fine.</p>}
      >
        <p>Return the string reversed.</p>
      </Problem>

      <Problem
        n={3}
        title="Palindrome check"
        level="Easy"
        examples={[
          { input: `"madam"`, output: "true", why: "Read backwards it is still madam." },
          { input: `"Racecar"`, output: "true", why: "Ignoring case, it reads the same both ways." },
          { input: `"hello"`, output: "false", why: "Backwards it is olleh." },
        ]}
        hints={[<>Compare the first and last characters. If they match, move both inwards.</>, <>Lower-case the string first to ignore case.</>]}
        approaches={[
          {
            name: "Two pointers",
            idea: <p>Compare characters from both ends, moving inwards. One mismatch means false.</p>,
            code: `function isPalindrome(s) {
  s = s.toLowerCase();
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}

console.log(isPalindrome("madam"));   // true
console.log(isPalindrome("Racecar")); // true
console.log(isPalindrome("hello"));   // false`,
            explain: <DryRun title={`"hello"`} cols={["left", "right", "s[left]", "s[right]", "equal?"]} rows={[["0", "4", "h", "o", "no → return false"]]} />,
          },
          {
            name: "Compare with the reverse",
            idea: <p>A palindrome equals its own reverse.</p>,
            code: `function isPalindrome(s) {
  s = s.toLowerCase();
  return s === s.split("").reverse().join("");
}

console.log(isPalindrome("Racecar")); // true`,
            explain: <p>Very short, but it always builds a full reversed copy, even when the first two characters already differ.</p>,
          },
        ]}
        compare={<p>Approach 1 is preferred: no extra string, and it stops at the first mismatch.</p>}
      >
        <p>Return <code>true</code> if the string reads the same forwards and backwards, ignoring case.</p>
      </Problem>

      <Problem
        n={4}
        title="Upper, lower and digits"
        level="Easy"
        examples={[{ input: `"Hello123"`, output: "upper 1, lower 4, digits 3", why: "H is uppercase; e, l, l, o are lowercase; 1, 2, 3 are digits." }]}
        hints={[<>Use three counters and one loop.</>, <>A character is uppercase if <code>ch &gt;= &quot;A&quot; &amp;&amp; ch &lt;= &quot;Z&quot;</code>. Lowercase and digits work the same way.</>]}
        approaches={[
          {
            name: "Range checks",
            idea: <p>Compare each character with the first and last character of each range.</p>,
            code: `function classify(s) {
  let upper = 0, lower = 0, digits = 0;
  for (const ch of s) {
    if (ch >= "A" && ch <= "Z") upper++;
    else if (ch >= "a" && ch <= "z") lower++;
    else if (ch >= "0" && ch <= "9") digits++;
  }
  return "upper " + upper + ", lower " + lower + ", digits " + digits;
}

console.log(classify("Hello123")); // upper 1, lower 4, digits 3`,
            explain: <p>Any other character (a space, punctuation) matches no branch and is not counted.</p>,
          },
          {
            name: "Compare with toUpperCase / toLowerCase",
            idea: <p>A letter is uppercase if it equals its uppercase form but not its lowercase form.</p>,
            code: `function classify(s) {
  let upper = 0, lower = 0, digits = 0;
  for (const ch of s) {
    if (ch !== ch.toLowerCase()) upper++;
    else if (ch !== ch.toUpperCase()) lower++;
    else if (ch >= "0" && ch <= "9") digits++;
  }
  return "upper " + upper + ", lower " + lower + ", digits " + digits;
}

console.log(classify("Hello123")); // upper 1, lower 4, digits 3`,
            explain: <p>This version also works for letters outside A–Z, such as &ldquo;É&rdquo;.</p>,
          },
        ]}
        compare={<p>Approach 1 is the usual answer when the input is plain English letters. Approach 2 is more general.</p>}
      >
        <p>Count the uppercase letters, lowercase letters and digits in a string.</p>
      </Problem>

      <Problem
        n={5}
        title="Capitalise every word"
        level="Easy"
        examples={[{ input: `"hello big world"`, output: `"Hello Big World"`, why: "The first letter of each word becomes uppercase." }]}
        hints={[<>A character starts a word if it is the first character, or if the character before it is a space.</>]}
        approaches={[
          {
            name: "Build character by character",
            idea: <p>Copy each character, upper-casing it when it starts a word.</p>,
            code: `function capitalise(s) {
  let result = "";
  for (let i = 0; i < s.length; i++) {
    const startsWord = i === 0 || s[i - 1] === " ";
    result += startsWord ? s[i].toUpperCase() : s[i];
  }
  return result;
}

console.log(capitalise("hello big world")); // Hello Big World`,
            explain: <p>Strings cannot be edited, so a new one is built. Looking at the previous character (<code>s[i - 1]</code>) is the same neighbour check as &ldquo;is the array sorted&rdquo;.</p>,
          },
          {
            name: "split, map, join",
            idea: <p>Split into words, capitalise each word, and join them with spaces.</p>,
            code: `function capitalise(s) {
  return s
    .split(" ")
    .map((w) => (w === "" ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

console.log(capitalise("hello big world")); // Hello Big World`,
            explain: <p><code>w[0].toUpperCase() + w.slice(1)</code> is the first letter in uppercase followed by the rest of the word. The <code>w === &quot;&quot;</code> check protects against double spaces.</p>,
          },
        ]}
        compare={<p>Both are correct. Approach 2 reads more naturally; Approach 1 shows the character-level thinking interviewers test.</p>}
      >
        <p>Make the first letter of every word uppercase.</p>
      </Problem>

      <Problem
        n={6}
        title="Count the words"
        level="Medium"
        examples={[
          { input: `"the sky is blue"`, output: "4", why: "Four words separated by single spaces." },
          { input: `"  the sky  is blue "`, output: "4", why: "Extra spaces at the start, middle and end must not create extra words." },
          { input: `"   "`, output: "0", why: "Only spaces, so no words." },
        ]}
        hints={[<>Counting spaces + 1 fails when there are extra spaces. What else marks a word?</>, <>Count the positions where a word <em>starts</em>: a non-space character that is first, or that follows a space.</>]}
        approaches={[
          {
            name: "Count word starts",
            idea: <p>A word starts at a non-space character whose previous character is a space (or that is the first character).</p>,
            code: `function countWords(s) {
  let count = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== " " && (i === 0 || s[i - 1] === " ")) count++;
  }
  return count;
}

console.log(countWords("the sky is blue"));     // 4
console.log(countWords("  the sky  is blue ")); // 4
console.log(countWords("   "));                 // 0`,
            explain: <p>Every word has exactly one start, no matter how many spaces surround it.</p>,
          },
          {
            name: "split and remove empty pieces",
            idea: <p>Split on spaces, then drop the empty strings that extra spaces create.</p>,
            code: `const countWords = (s) => s.split(" ").filter((w) => w !== "").length;

console.log(countWords("  the sky  is blue ")); // 4`,
            explain: <p>Splitting <code>&quot;a  b&quot;</code> on a single space gives <code>[&quot;a&quot;, &quot;&quot;, &quot;b&quot;]</code>. Removing the empty pieces leaves only real words.</p>,
          },
          {
            name: "trim and split on any run of spaces",
            idea: <p>Remove spaces at both ends, then split on &ldquo;one or more spaces&rdquo; with <code>/\s+/</code>.</p>,
            code: `function countWords(s) {
  const t = s.trim();
  return t === "" ? 0 : t.split(/\\s+/).length;
}

console.log(countWords("  the sky  is blue ")); // 4
console.log(countWords("   "));                 // 0`,
            explain: <p><code>\s+</code> means &ldquo;one or more whitespace characters&rdquo;, so double spaces and tabs are handled too. The empty-string check is needed because <code>&quot;&quot;.split(…)</code> returns one empty piece.</p>,
          },
        ]}
        compare={<p>Approach 1 needs no built-ins and handles every case. Approach 2 is the clearest built-in version.</p>}
      >
        <p>Count the words in a sentence that may have extra spaces anywhere.</p>
      </Problem>

      <Problem
        n={7}
        title="Longest word"
        level="Easy"
        examples={[
          { input: `"I love programming a lot"`, output: `"programming"`, why: "programming has 11 letters; no other word is longer." },
          { input: `"cat dog"`, output: `"cat"`, why: "Both words have 3 letters; the first one is returned." },
        ]}
        hints={[<>Split the sentence into words. Then use &ldquo;best so far&rdquo;, comparing lengths.</>]}
        approaches={[
          {
            name: "Best so far over the words",
            idea: <p>Keep the longest word seen so far and replace it when a longer word appears.</p>,
            code: `function longestWord(s) {
  let best = "";
  for (const w of s.split(" ")) {
    if (w.length > best.length) best = w;
  }
  return best;
}

console.log(longestWord("I love programming a lot")); // programming
console.log(longestWord("cat dog"));                  // cat`,
            explain: <p>Using <code>&gt;</code> (not <code>&gt;=</code>) means that on a tie the first longest word is kept.</p>,
          },
          {
            name: "reduce",
            idea: <p>Combine the words into one result, keeping the longer word at each step.</p>,
            code: `const longestWord = (s) =>
  s.split(" ").reduce((best, w) => (w.length > best.length ? w : best), "");

console.log(longestWord("I love programming a lot")); // programming`,
            explain: <p>The same logic in one expression.</p>,
          },
        ]}
      >
        <p>Return the longest word in a sentence of single-space-separated words.</p>
      </Problem>

      <Problem
        n={8}
        title="Reverse the words"
        level="Medium"
        examples={[
          { input: `"the sky is blue"`, output: `"blue is sky the"`, why: "The words appear in the opposite order; each word itself is unchanged." },
          { input: `"  hello   world  "`, output: `"world hello"`, why: "Extra spaces are removed and words are separated by one space." },
        ]}
        hints={[<>First get the list of real words (no empty pieces).</>, <>Then put them together in reverse order, separated by single spaces.</>]}
        approaches={[
          {
            name: "split, filter, reverse, join",
            idea: <p>Make a clean list of words, reverse it, and join with single spaces.</p>,
            code: `function reverseWords(s) {
  return s
    .split(" ")
    .filter((w) => w !== "")
    .reverse()
    .join(" ");
}

console.log(reverseWords("the sky is blue"));   // blue is sky the
console.log(reverseWords("  hello   world  ")); // world hello`,
            explain: <p>Each step does one clear job. This is the most common accepted answer for LeetCode 151.</p>,
          },
          {
            name: "Scan from the end and collect words",
            idea: <p>Walk backwards. Skip spaces; when you reach the end of a word, read the whole word and add it to the result.</p>,
            code: `function reverseWords(s) {
  const words = [];
  let i = s.length - 1;
  while (i >= 0) {
    while (i >= 0 && s[i] === " ") i--;      // skip spaces
    if (i < 0) break;
    const end = i;
    while (i >= 0 && s[i] !== " ") i--;      // move to the start of the word
    words.push(s.slice(i + 1, end + 1));
  }
  return words.join(" ");
}

console.log(reverseWords("  hello   world  ")); // world hello`,
            explain: <p>This shows the character-level work that the built-ins hide. Some interviewers ask for it as a follow-up (&ldquo;without using split&rdquo;).</p>,
          },
        ]}
        compare={<p>Start with Approach 1. Be ready to explain Approach 2 if asked not to use <code>split</code>.</p>}
      >
        <p>Reverse the order of words. Collapse multiple spaces into one and remove spaces at the ends. (LeetCode 151.)</p>
      </Problem>

      <Problem
        n={9}
        title="String compression"
        level="Medium"
        examples={[
          { input: `"aaabbc"`, output: `"a3b2c1"`, why: "Three a's, then two b's, then one c." },
          { input: `"abc"`, output: `"a1b1c1"`, why: "Every character appears once in its run." },
        ]}
        hints={[<>A <strong>run</strong> is a group of the same character next to each other. Count the length of each run.</>, <>A run ends when the next character is different, or when the string ends. Do not forget the last run.</>]}
        approaches={[
          {
            name: "Count runs while scanning",
            idea: <p>Compare each character with the previous one. Same → the run continues. Different → write out the finished run.</p>,
            code: `function compress(s) {
  if (s.length === 0) return "";
  let result = "";
  let count = 1;
  for (let i = 1; i <= s.length; i++) {
    if (i < s.length && s[i] === s[i - 1]) {
      count++;
    } else {
      result += s[i - 1] + count;   // the run has ended
      count = 1;
    }
  }
  return result;
}

console.log(compress("aaabbc")); // a3b2c1
console.log(compress("abc"));    // a1b1c1`,
            explain: <DryRun title={`"aaabbc"`} cols={["i", "s[i] vs s[i−1]", "action", "result"]} rows={[["1", "a = a", "count = 2", ""], ["2", "a = a", "count = 3", ""], ["3", "b ≠ a", "write a3", "a3"], ["4", "b = b", "count = 2", "a3"], ["5", "c ≠ b", "write b2", "a3b2"], ["6", "end", "write c1", "a3b2c1"]]} highlight={5} />,
          },
          {
            name: "Two pointers: find the end of each run",
            idea: <p>Pointer <code>i</code> marks the start of a run; move pointer <code>j</code> forward while the character stays the same. The run length is <code>j − i</code>.</p>,
            code: `function compress(s) {
  let result = "";
  let i = 0;
  while (i < s.length) {
    let j = i;
    while (j < s.length && s[j] === s[i]) j++;
    result += s[i] + (j - i);
    i = j;                         // the next run starts where this one ended
  }
  return result;
}

console.log(compress("aaabbc")); // a3b2c1`,
            explain: <p>Every run is handled in one step, so the last run needs no special treatment. Many people find this version easier to get right.</p>,
          },
        ]}
        compare={<p>Both are correct. Approach 2 avoids the common bug of forgetting the last run, so it is a good default.</p>}
      >
        <p>Replace each run of repeated characters with the character followed by its count.</p>
      </Problem>

      <Problem
        n={10}
        title="Valid palindrome (letters and digits only)"
        level="Medium"
        examples={[
          { input: `"A man, a plan, a canal: Panama"`, output: "true", why: "Keeping only letters and digits and ignoring case gives amanaplanacanalpanama, which reads the same both ways." },
          { input: `"race a car"`, output: "false", why: "Cleaned, it is raceacar; backwards it is racaecar." },
        ]}
        hints={[<>Same two pointers as question 3.</>, <>Before comparing, move each pointer past any character that is not a letter or digit.</>]}
        approaches={[
          {
            name: "Two pointers that skip other characters",
            idea: <p>Move <code>left</code> and <code>right</code> inwards, skipping punctuation and spaces, and compare the rest.</p>,
            code: `function isAlphaNum(ch) {
  return (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");
}

function isValidPalindrome(s) {
  s = s.toLowerCase();
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (!isAlphaNum(s[left])) { left++; continue; }
    if (!isAlphaNum(s[right])) { right--; continue; }
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}

console.log(isValidPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isValidPalindrome("race a car"));                     // false`,
            explain: <p>No new string is created. <code>continue</code> skips the rest of the iteration without moving the other pointer.</p>,
          },
          {
            name: "Clean the string, then compare",
            idea: <p>Build a new string containing only lowercase letters and digits, then check whether it equals its reverse.</p>,
            code: `function isValidPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean === clean.split("").reverse().join("");
}

console.log(isValidPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isValidPalindrome("race a car"));                     // false`,
            explain: <p><code>/[^a-z0-9]/g</code> matches every character that is <em>not</em> a letter or digit; <code>replace</code> removes them all. Short and clear, but it builds two new strings.</p>,
          },
        ]}
        compare={<p>Approach 2 is a fine first answer. Approach 1 is what interviewers look for in LeetCode 125, because it uses no extra memory.</p>}
      >
        <p>Ignoring case and every character that is not a letter or digit, is the string a palindrome? (LeetCode 125.)</p>
      </Problem>

      <Problem
        n={11}
        title="Length of the last word"
        level="Easy"
        examples={[
          { input: `"Hello World"`, output: "5", why: "The last word is World, which has 5 letters." },
          { input: `"   fly me   to   the moon  "`, output: "4", why: "Trailing spaces are ignored. The last word is moon." },
        ]}
        hints={[<>Start from the end of the string. Skip the spaces first.</>, <>Then count characters until you reach a space or the start of the string.</>]}
        approaches={[
          {
            name: "Scan from the end",
            idea: <p>Skip trailing spaces, then count letters until the next space.</p>,
            code: `function lengthOfLastWord(s) {
  let i = s.length - 1;
  while (i >= 0 && s[i] === " ") i--;      // skip spaces at the end
  let length = 0;
  while (i >= 0 && s[i] !== " ") {
    length++;
    i--;
  }
  return length;
}

console.log(lengthOfLastWord("Hello World"));                 // 5
console.log(lengthOfLastWord("   fly me   to   the moon  ")); // 4`,
            explain: <p>Only the characters at the end are examined, so it does very little work even for a long string.</p>,
          },
          {
            name: "trim and split",
            idea: <p>Remove the outer spaces, split into words, and measure the last one.</p>,
            code: `function lengthOfLastWord(s) {
  const words = s.trim().split(/\\s+/);
  return words[words.length - 1].length;
}

console.log(lengthOfLastWord("   fly me   to   the moon  ")); // 4`,
            explain: <p>Short and readable, but it splits the whole string just to read the last word.</p>,
          },
        ]}
        compare={<p>Both pass LeetCode 58. Approach 1 is the efficient answer; Approach 2 is quicker to write.</p>}
      >
        <p>Return the length of the last word in a string that may contain extra spaces. (LeetCode 58.)</p>
      </Problem>
    </>
  );
}
