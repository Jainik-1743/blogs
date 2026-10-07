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
          { input: "\"()[]{}\"", output: "true", why: "Each opener is closed immediately." },
          { input: "\"([{}])\"", output: "true", why: "Nested correctly: the inner pair closes first." },
          { input: "\"(]\"", output: "false", why: "The closer does not match the opener." },
          { input: "\"((\"", output: "false", why: "Openers were never closed." },
        ]}
        hints={[
          <>A closer must match the <em>most recent</em> opener still open. Which structure gives the most recent item?</>,
          <>Remember to check that the stack is empty at the end, and what happens when a closer arrives with nothing to pop.</>,
        ]}
        approaches={[
          {
            name: "Repeatedly remove matched pairs",
            idea: <p>Replace <code>()</code>, <code>[]</code> and <code>{"{}"}</code> with nothing until the string stops changing. If it ends empty, it was valid.</p>,
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
            explain: <p>Correct, but each pass is O(n) and there can be O(n) passes: O(n²) worst case.</p>,
          },
          {
            name: "Stack of openers",
            idea: <p>Push openers. On a closer, pop and compare. End with an empty stack.</p>,
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
            explain: <p>O(n) time, O(n) space. An odd length can be rejected immediately as a small optimisation.</p>,
          },
        ]}
        compare={<p>The stack. (LeetCode 20.)</p>}
      >
        <p>Given a string of <code>()[]{"{}"}</code> characters, decide whether every bracket is closed by the correct type in the correct order.</p>
      </Problem>

      <Problem
        n={2}
        title="Min stack"
        level="Medium"
        examples={[
          { input: "push(-2), push(0), push(-3), getMin()", output: "-3", why: "-3 is the smallest value." },
          { input: "…then pop(), top(), getMin()", output: "0, then -2", why: "After removing -3 the minimum is -2." },
        ]}
        hints={[
          <>A single <code>min</code> variable is not enough. What do you lose when you pop the minimum?</>,
          <>What if each stack entry also remembered the minimum at that depth?</>,
        ]}
        approaches={[
          {
            name: "Scan for the minimum",
            idea: <p>Keep a plain stack; <code>getMin</code> scans every item.</p>,
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
            explain: <p><code>getMin</code> is O(n), and spreading a very large array into <code>Math.min</code> can even throw a RangeError. The question demands O(1).</p>,
          },
          {
            name: "Parallel stack of minimums",
            idea: <p>On each push, also push <code>min(x, current min)</code> onto a second stack. Pop both together.</p>,
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
            explain: <p>All operations are O(1); extra space is O(n). Storing pairs <code>[value, minSoFar]</code> in one array is equivalent.</p>,
          },
        ]}
        compare={<p>The parallel stack. (LeetCode 155.)</p>}
      >
        <p>Design a stack with <code>push</code>, <code>pop</code>, <code>top</code> and <code>getMin</code>, all in O(1).</p>
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
          <>Numbers wait on a stack; an operator takes the two most recent.</>,
          <>The first value you pop is the right-hand operand.</>,
        ]}
        approaches={[
          {
            name: "Stack of operands",
            idea: <p>Push numbers. For an operator pop <code>b</code> then <code>a</code>, compute <code>a op b</code>, push the result. The answer is the last item left.</p>,
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
            explain: <p>O(n) time, O(n) space. <code>Math.trunc</code> is needed for negatives: <code>Math.floor(-7 / 2)</code> is −4 but the question wants −3.</p>,
          },
        ]}
        compare={<p>There is only one sensible approach, so the points are in the details: operand order and truncation. (LeetCode 150.)</p>}
      >
        <p>Evaluate an arithmetic expression in Reverse Polish Notation. Division truncates toward zero.</p>
      </Problem>

      <Problem
        n={4}
        title="Decode string"
        level="Medium"
        examples={[
          { input: "\"3[a]2[bc]\"", output: "\"aaabcbc\"", why: "a three times, bc twice." },
          { input: "\"3[a2[c]]\"", output: "\"accaccacc\"", why: "Inner 2[c] first: acc, then three times." },
          { input: "\"2[ab]c\"", output: "\"ababc\"", why: "Letters after a bracket are copied as is." },
        ]}
        hints={[
          <>Brackets nest, and the innermost one finishes first.</>,
          <>When you reach <code>[</code>, you must remember the text built so far and the repeat count.</>,
          <>Counts can have more than one digit, like <code>12[a]</code>.</>,
        ]}
        approaches={[
          {
            name: "Two stacks (counts and texts)",
            idea: (
              <ol>
                <li>Read digits into <code>num</code>; letters into <code>cur</code>.</li>
                <li>On <code>[</code>, push <code>num</code> and <code>cur</code>, then reset both.</li>
                <li>On <code>]</code>, pop them and set <code>cur = oldText + cur.repeat(count)</code>.</li>
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
            explain: <p>Time is proportional to the length of the output. Space is the depth of the nesting plus the output.</p>,
          },
          {
            name: "Recursion",
            idea: <p>Write <code>decode(i)</code> that reads until a <code>]</code> or the end and returns the text; a <code>[</code> triggers a recursive call. The call stack plays the role of the two stacks.</p>,
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
            explain: <p>Same result and cost. Pick whichever you can write without bugs; the stack version has fewer moving parts.</p>,
          },
        ]}
        compare={<p>The two-stack version. (LeetCode 394.)</p>}
      >
        <p>Decode a string where <code>k[text]</code> means <code>text</code> repeated <code>k</code> times. Brackets may be nested.</p>
      </Problem>

      <Problem
        n={5}
        title="Backspace string compare"
        level="Easy"
        examples={[
          { input: "s = \"ab#c\", t = \"ad#c\"", output: "true", why: "Both become \"ac\"." },
          { input: "s = \"a#c\", t = \"b\"", output: "false", why: "\"c\" and \"b\"." },
          { input: "s = \"a##c\", t = \"#a#c\"", output: "true", why: "Backspace on empty text does nothing; both become \"c\"." },
        ]}
        hints={[
          <><code>#</code> removes the most recent character that is still there.</>,
        ]}
        approaches={[
          {
            name: "Build each string with a stack",
            idea: <p>Push letters, pop on <code>#</code> (popping an empty stack does nothing). Compare the two results.</p>,
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
            idea: <p>Walk both strings from the end, counting backspaces to skip characters, and compare the surviving characters one at a time.</p>,
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
            explain: <p>O(n + m) time, O(1) space. Going backwards is what makes this possible: a <code>#</code> only affects characters to its left.</p>,
          },
        ]}
        compare={<p>The stack first; the two-pointer version is the usual O(1)-space follow-up. (LeetCode 844.)</p>}
      >
        <p>Two typed strings contain <code>#</code> meaning backspace. Return whether they end up equal.</p>
      </Problem>

      <Problem
        n={6}
        title="Simplify path"
        level="Medium"
        examples={[
          { input: "\"/home//foo/\"", output: "\"/home/foo\"", why: "Repeated and trailing slashes are removed." },
          { input: "\"/a/./b/../../c/\"", output: "\"/c\"", why: "\".\" stays, \"..\" goes up one directory." },
          { input: "\"/../\"", output: "\"/\"", why: "You cannot go above the root." },
        ]}
        hints={[
          <>Split on <code>/</code>. Each piece is a directory name, <code>.</code>, <code>..</code> or empty.</>,
          <><code>..</code> undoes the most recent directory. That is a pop.</>,
        ]}
        approaches={[
          {
            name: "Stack of directory names",
            idea: <p>Ignore empty and <code>.</code>; pop on <code>..</code> (if not empty); push anything else. Join with <code>/</code>.</p>,
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
            explain: <p>O(n) time and space. Popping an empty stack is harmless, which handles going above the root for free.</p>,
          },
        ]}
        compare={<p>This is the standard answer and the example of &quot;undo the most recent&quot;. (LeetCode 71.)</p>}
      >
        <p>Convert an absolute Unix path to its canonical form.</p>
      </Problem>

      <Problem
        n={7}
        title="Remove all adjacent duplicates in string"
        level="Easy"
        examples={[
          { input: "\"abbaca\"", output: "\"ca\"", why: "Remove bb → \"aaca\", remove aa → \"ca\"." },
          { input: "\"azxxzy\"", output: "\"ay\"", why: "xx goes, then zz becomes adjacent and goes too." },
        ]}
        hints={[
          <>Removing a pair can make two new neighbours equal. What do you need to compare the next letter with?</>,
        ]}
        approaches={[
          {
            name: "Stack of survivors",
            idea: <p>For each letter, if it equals the top of the stack, pop (the pair cancels); otherwise push.</p>,
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
            explain: <p>O(n) time and space. The stack always holds the string-so-far with no adjacent equal letters, which is exactly the thing the next letter needs to compare with.</p>,
          },
          {
            name: "Repeat until no change",
            idea: <p>Remove one pair at a time with a regex, until nothing matches.</p>,
            code: `function removeDuplicates(s) {
  const re = /(.)\\1/;
  while (re.test(s)) s = s.replace(re, "");
  return s;
}

console.log(removeDuplicates("abbaca")); // ca
console.log(removeDuplicates("azxxzy")); // ay`,
            explain: <p>Works, but it re-scans the string after each removal: O(n²) in the worst case.</p>,
          },
        ]}
        compare={<p>The stack. (LeetCode 1047.)</p>}
      >
        <p>Repeatedly delete two equal adjacent letters until none remain, and return the result.</p>
      </Problem>
    </>
  );
}
