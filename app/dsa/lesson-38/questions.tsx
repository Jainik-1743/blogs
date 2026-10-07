import Problem from "@/components/dsa/Problem";

/** Lesson 38 practice questions: stacks. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Valid parentheses"
        level="Easy"
        examples={[
          { input: "\"()[]{}\"", output: "true", why: "Each opening bracket is closed right away." },
          { input: "\"([{}])\"", output: "true", why: "The brackets are nested correctly. The inner pair closes first." },
          { input: "\"(]\"", output: "false", why: "The closing bracket does not match the opening bracket." },
          { input: "\"((\"", output: "false", why: "The opening brackets were never closed." },
        ]}
        hints={[
          <>A closing bracket must match the <em>most recent</em> opening bracket that is still open. Which structure gives you the most recent item?</>,
          <>Remember to check that the stack is empty at the end. Also think about what happens when a closing bracket arrives and there is nothing to pop.</>,
        ]}
        approaches={[
          {
            name: "Repeatedly remove matched pairs",
            idea: <p>Remove <code>()</code>, <code>[]</code> and <code>{"{}"}</code> (replace them with nothing) again and again, until the string stops changing. If the string ends up empty, it was valid.</p>,
            code: `function isValid(s) {
  let prev;
  do {
    prev = s;
    s = s.replace("()", "").replace("[]", "").replace("{}", "");
  } while (s !== prev);
  return s === "";
}

console.log(isValid("([{}])")); // true
console.log(isValid("(]"));     // false`,
            explain: <p>It gives the right answer, but each pass takes O(n) time and there can be O(n) passes. So the worst case is O(n²), which is slow for long strings.</p>,
          },
          {
            name: "Stack of opening brackets",
            idea: <p>Push each opening bracket. When a closing bracket comes, pop and compare. At the end, the stack must be empty.</p>,
            code: `function isValid(s) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}

console.log(isValid("()[]{}")); // true
console.log(isValid("(]"));     // false
console.log(isValid("(("));     // false
console.log(isValid(")"));      // false`,
            explain: <p>O(n) time, O(n) space. As a small speed-up, you can reject a string with an odd length straight away.</p>,
          },
        ]}
        compare={<p>Use the stack. (LeetCode 20.)</p>}
      >
        <p>You get a string of <code>()[]{"{}"}</code> characters. Decide whether every bracket is closed by the right type of bracket, in the right order.</p>
      </Problem>

      <Problem
        n={2}
        title="Min stack"
        level="Medium"
        examples={[
          { input: "push(-2), push(0), push(-3), getMin()", output: "-3", why: "-3 is the smallest value in the stack." },
          { input: "…then pop(), top(), getMin()", output: "0, then -2", why: "After -3 is removed, the smallest value is -2." },
        ]}
        hints={[
          <>One <code>min</code> variable is not enough. What do you lose when you pop the smallest value?</>,
          <>What if each stack entry also remembered the smallest value at that position?</>,
        ]}
        approaches={[
          {
            name: "Scan for the minimum",
            idea: <p>Keep a plain stack. <code>getMin</code> looks at every item to find the smallest.</p>,
            code: `class SlowMinStack {
  constructor() { this.items = []; }
  push(x) { this.items.push(x); }
  pop() { return this.items.pop(); }
  top() { return this.items[this.items.length - 1]; }
  getMin() { return Math.min(...this.items); }
}

const s = new SlowMinStack();
s.push(-2); s.push(0); s.push(-3);
console.log(s.getMin()); // -3`,
            explain: <p><code>getMin</code> takes O(n) time. Also, passing a very large array into <code>Math.min</code> with <code>...</code> can even throw a RangeError (JavaScript&apos;s error for &quot;too many arguments&quot;). The question asks for O(1).</p>,
          },
          {
            name: "A second stack for the smallest values",
            idea: <p>On each push, also push <code>min(x, current min)</code> (the smaller of the two) onto a second stack. Pop from both stacks together.</p>,
            code: `class MinStack {
  constructor() { this.items = []; this.mins = []; }
  push(x) {
    this.items.push(x);
    this.mins.push(this.mins.length ? Math.min(x, this.mins[this.mins.length - 1]) : x);
  }
  pop() { this.mins.pop(); return this.items.pop(); }
  top() { return this.items[this.items.length - 1]; }
  getMin() { return this.mins[this.mins.length - 1]; }
}

const s = new MinStack();
s.push(-2); s.push(0); s.push(-3);
console.log(s.getMin()); // -3
s.pop();
console.log(s.top());    // 0
console.log(s.getMin()); // -2`,
            explain: <p>All operations are O(1) and the extra space is O(n). You could also store pairs <code>[value, minSoFar]</code> in one array. It works the same way.</p>,
          },
        ]}
        compare={<p>Use the second stack. (LeetCode 155.)</p>}
      >
        <p>Build a stack with <code>push</code>, <code>pop</code>, <code>top</code> and <code>getMin</code>. All four must take O(1) time.</p>
      </Problem>

      <Problem
        n={3}
        title="Evaluate Reverse Polish Notation"
        level="Medium"
        examples={[
          { input: "[\"2\", \"1\", \"+\", \"3\", \"*\"]", output: "9", why: "(2 + 1) * 3." },
          { input: "[\"4\", \"13\", \"5\", \"/\", \"+\"]", output: "6", why: "13 / 5 = 2 (truncated), 4 + 2 = 6." },
        ]}
        hints={[
          <>Numbers wait on a stack. An operator takes the two most recent numbers.</>,
          <>The first value you pop is the number on the right side of the operator.</>,
        ]}
        approaches={[
          {
            name: "Stack of operands",
            idea: <p>Push the numbers. When you see an operator, pop <code>b</code> and then <code>a</code>. Work out <code>a op b</code> and push the result. The answer is the last item left.</p>,
            code: `function evalRPN(tokens) {
  const stack = [];
  for (const t of tokens) {
    if (t === "+" || t === "-" || t === "*" || t === "/") {
      const b = stack.pop(), a = stack.pop();
      stack.push(t === "+" ? a + b : t === "-" ? a - b : t === "*" ? a * b : Math.trunc(a / b));
    } else {
      stack.push(Number(t));
    }
  }
  return stack[0];
}

console.log(evalRPN(["2", "1", "+", "3", "*"]));       // 9
console.log(evalRPN(["4", "13", "5", "/", "+"]));      // 6
console.log(evalRPN(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"])); // 22`,
            explain: <p>O(n) time, O(n) space. You need <code>Math.trunc</code> for negative numbers. <code>Math.floor(-7 / 2)</code> gives −4, but the question wants −3.</p>,
          },
        ]}
        compare={<p>There is only one good approach here. The difficulty is in the details: the order of the two numbers, and cutting off the decimal part. (LeetCode 150.)</p>}
      >
        <p>Work out the value of a maths expression written in Reverse Polish Notation. Division cuts off the decimal part (it rounds towards zero).</p>
      </Problem>

      <Problem
        n={4}
        title="Decode string"
        level="Medium"
        examples={[
          { input: "\"3[a]2[bc]\"", output: "\"aaabcbc\"", why: "a three times, then bc two times." },
          { input: "\"3[a2[c]]\"", output: "\"accaccacc\"", why: "Do the inner 2[c] first to get acc. Then repeat it three times." },
          { input: "\"2[ab]c\"", output: "\"ababc\"", why: "Letters after a bracket are copied as they are." },
        ]}
        hints={[
          <>Brackets can be inside other brackets. The innermost one finishes first.</>,
          <>When you reach <code>[</code>, you must save the text built so far and the repeat count.</>,
          <>A count can have more than one digit, like <code>12[a]</code>.</>,
        ]}
        approaches={[
          {
            name: "Two stacks (one for counts, one for texts)",
            idea: (
              <ol>
                <li>Read digits into <code>num</code>. Read letters into <code>cur</code>.</li>
                <li>On <code>[</code>, push <code>num</code> and <code>cur</code> on their stacks, then reset both.</li>
                <li>On <code>]</code>, pop both values and set <code>cur = oldText + cur.repeat(count)</code>.</li>
              </ol>
            ),
            code: `function decodeString(s) {
  const counts = [], texts = [];
  let cur = "", num = 0;
  for (const ch of s) {
    if (ch >= "0" && ch <= "9") num = num * 10 + Number(ch);
    else if (ch === "[") { counts.push(num); texts.push(cur); num = 0; cur = ""; }
    else if (ch === "]") { cur = texts.pop() + cur.repeat(counts.pop()); }
    else cur += ch;
  }
  return cur;
}

console.log(decodeString("3[a]2[bc]")); // aaabcbc
console.log(decodeString("3[a2[c]]"));  // accaccacc
console.log(decodeString("12[x]"));     // xxxxxxxxxxxx`,
            explain: <p>The time grows with the length of the output. The space is the nesting depth (how many brackets are inside each other) plus the output.</p>,
          },
          {
            name: "Recursion",
            idea: <p>Write a function that reads until it finds a <code>]</code> or the end, and then returns the text. Each <code>[</code> makes the function call itself (a recursive call). The call stack (the list of unfinished calls) does the job of the two stacks.</p>,
            code: `function decodeString(s) {
  let i = 0;
  function read() {
    let out = "", num = 0;
    while (i < s.length && s[i] !== "]") {
      const ch = s[i];
      if (ch >= "0" && ch <= "9") { num = num * 10 + Number(ch); i++; }
      else if (ch === "[") { i++; out += read().repeat(num); num = 0; i++; }   // skip "[", read inside, skip "]"
      else { out += ch; i++; }
    }
    return out;
  }
  return read();
}

console.log(decodeString("3[a2[c]]")); // accaccacc`,
            explain: <p>Same result and same cost. Pick the one you can write without bugs. The stack version has fewer parts that can go wrong.</p>,
          },
        ]}
        compare={<p>Use the two-stack version. (LeetCode 394.)</p>}
      >
        <p>Decode a string where <code>k[text]</code> means <code>text</code> repeated <code>k</code> times. Brackets can be inside other brackets.</p>
      </Problem>

      <Problem
        n={5}
        title="Backspace string compare"
        level="Easy"
        examples={[
          { input: "s = \"ab#c\", t = \"ad#c\"", output: "true", why: "Both become \"ac\"." },
          { input: "s = \"a#c\", t = \"b\"", output: "false", why: "\"c\" and \"b\"." },
          { input: "s = \"a##c\", t = \"#a#c\"", output: "true", why: "A backspace on empty text does nothing. Both become \"c\"." },
        ]}
        hints={[
          <><code>#</code> removes the most recent character that is still in the text.</>,
        ]}
        approaches={[
          {
            name: "Build each string with a stack",
            idea: <p>Push each letter. Pop when you see <code>#</code> (popping an empty stack does nothing). Then compare the two results.</p>,
            code: `function build(s) {
  const stack = [];
  for (const ch of s) {
    if (ch === "#") stack.pop();
    else stack.push(ch);
  }
  return stack.join("");
}
function backspaceCompare(s, t) { return build(s) === build(t); }

console.log(backspaceCompare("ab#c", "ad#c"));  // true
console.log(backspaceCompare("a#c", "b"));      // false
console.log(backspaceCompare("a##c", "#a#c"));  // true`,
            explain: <p>O(n + m) time and space.</p>,
          },
          {
            name: "Two pointers from the back",
            idea: <p>Walk both strings from the end. Count the backspaces so you know which characters to skip. Compare the characters that remain, one at a time.</p>,
            code: `function backspaceCompare(s, t) {
  const next = (str, i) => {
    let skip = 0;
    while (i >= 0) {
      if (str[i] === "#") { skip++; i--; }
      else if (skip > 0) { skip--; i--; }
      else break;
    }
    return i;                                  // index of the next surviving character, or -1
  };
  let i = s.length - 1, j = t.length - 1;
  while (true) {
    i = next(s, i);
    j = next(t, j);
    if (i < 0 || j < 0) return i < 0 && j < 0;  // both must run out together
    if (s[i] !== t[j]) return false;
    i--; j--;
  }
}

console.log(backspaceCompare("ab#c", "ad#c"));  // true
console.log(backspaceCompare("a##c", "#a#c"));  // true
console.log(backspaceCompare("a#c", "b"));      // false`,
            explain: <p>O(n + m) time, O(1) space. Walking backwards is what makes this work, because a <code>#</code> only affects the characters to its left.</p>,
          },
        ]}
        compare={<p>Start with the stack. The two-pointer version is the usual follow-up when the interviewer asks for O(1) space. (LeetCode 844.)</p>}
      >
        <p>Two typed strings contain <code>#</code>, which means backspace. Return whether the two final texts are equal.</p>
      </Problem>

      <Problem
        n={6}
        title="Simplify path"
        level="Medium"
        examples={[
          { input: "\"/home//foo/\"", output: "\"/home/foo\"", why: "Repeated slashes and the slash at the end are removed." },
          { input: "\"/a/./b/../../c/\"", output: "\"/c\"", why: "\".\" means the same folder. \"..\" goes up one folder." },
          { input: "\"/../\"", output: "\"/\"", why: "You cannot go above the top folder (the root)." },
        ]}
        hints={[
          <>Split the path on <code>/</code>. Each piece is a folder name, <code>.</code>, <code>..</code> or empty.</>,
          <><code>..</code> undoes the most recent folder. That is a pop.</>,
        ]}
        approaches={[
          {
            name: "Stack of folder names",
            idea: <p>Ignore empty pieces and <code>.</code>. Pop on <code>..</code> (if the stack is not empty). Push anything else. Join the stack with <code>/</code>.</p>,
            code: `function simplifyPath(path) {
  const stack = [];
  for (const part of path.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return "/" + stack.join("/");
}

console.log(simplifyPath("/home//foo/"));       // /home/foo
console.log(simplifyPath("/a/./b/../../c/"));   // /c
console.log(simplifyPath("/../"));              // /`,
            explain: <p>O(n) time and space. Popping an empty stack does no harm, so going above the root is handled without extra code.</p>,
          },
        ]}
        compare={<p>This is the standard answer. It is a good example of &quot;undo the most recent step&quot;. (LeetCode 71.)</p>}
      >
        <p>Change an absolute Unix path (a path that starts at the root /) into its shortest standard form (the canonical form).</p>
      </Problem>

      <Problem
        n={7}
        title="Remove all adjacent duplicates in string"
        level="Easy"
        examples={[
          { input: "\"abbaca\"", output: "\"ca\"", why: "Remove bb to get \"aaca\". Then remove aa to get \"ca\"." },
          { input: "\"azxxzy\"", output: "\"ay\"", why: "xx is removed. Then the two z letters are next to each other, so they are removed too." },
        ]}
        hints={[
          <>Removing a pair can make two new neighbours equal. What should you compare the next letter with?</>,
        ]}
        approaches={[
          {
            name: "Stack of the letters that remain",
            idea: <p>For each letter, check the top of the stack. If it is the same letter, pop it (the pair cancels out). If not, push the letter.</p>,
            code: `function removeDuplicates(s) {
  const stack = [];
  for (const ch of s) {
    if (stack.length && stack[stack.length - 1] === ch) stack.pop();
    else stack.push(ch);
  }
  return stack.join("");
}

console.log(removeDuplicates("abbaca"));  // ca
console.log(removeDuplicates("azxxzy"));  // ay`,
            explain: <p>O(n) time and space. The stack always holds the string so far with no equal letters side by side. That is exactly what the next letter needs to compare with.</p>,
          },
          {
            name: "Repeat until no change",
            idea: <p>Remove one pair at a time with a regex (a pattern for searching text), until nothing matches. The pattern <code>{String.raw`(.)\1`}</code> means &quot;any character followed by the same character again&quot;.</p>,
            code: `function removeDuplicates(s) {
  const re = /(.)\\1/;
  while (re.test(s)) s = s.replace(re, "");
  return s;
}

console.log(removeDuplicates("abbaca")); // ca
console.log(removeDuplicates("azxxzy")); // ay`,
            explain: <p>It works, but it scans the string again after each removal. The worst case is O(n²).</p>,
          },
        ]}
        compare={<p>Use the stack. (LeetCode 1047.)</p>}
      >
        <p>Again and again, delete two equal letters that sit next to each other, until there are none left. Return the result.</p>
      </Problem>
    </>
  );
}
