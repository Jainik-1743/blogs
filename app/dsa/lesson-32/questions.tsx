import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 32 practice questions: recursion trees. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Fibonacci number"
        level="Easy"
        examples={[
          { input: "n = 2", output: "1", why: "fib(2) = fib(1) + fib(0) = 1 + 0." },
          { input: "n = 4", output: "3", why: "0, 1, 1, 2, 3." },
          { input: "n = 10", output: "55", why: "The tenth Fibonacci number." },
        ]}
        hints={[
          <>fib(0) = 0 and fib(1) = 1. Every other value is the sum of the two values before it.</>,
          <>The plain recursion works, but how many calls does it make when n = 30?</>,
        ]}
        approaches={[
          {
            name: "Plain recursion",
            idea: <p>For 0 and 1, return n. For anything else, add the two smaller Fibonacci numbers.</p>,
            code: `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

console.log(fib(2));  // 1
console.log(fib(4));  // 3
console.log(fib(10)); // 55`,
            explain: <p>O(2<sup>n</sup>) time and O(n) space (the height of the tree). This is fine for n up to about 30.</p>,
          },
          {
            name: "Remember answers (memoisation)",
            idea: <p>Memoisation means remembering answers you already worked out. Save each result in a Map (a lookup table) the first time. Look in the Map before you make a recursive call.</p>,
            code: `function fib(n, memo = new Map()) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  const value = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, value);
  return value;
}

console.log(fib(30));  // 832040
console.log(fib(50));  // 12586269025`,
            explain: <p>The tree shrinks to about 2n − 1 calls, so it takes O(n) time and O(n) space.</p>,
          },
          {
            name: "A loop with two variables",
            idea: <p>Each value needs only the two before it, so keep just those two.</p>,
            code: `function fib(n) {
  let a = 0, b = 1;               // fib(0), fib(1)
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}

console.log(fib(10)); // 55
console.log(fib(0));  // 0
console.log(fib(50)); // 12586269025`,
            explain: <p>O(n) time and O(1) space. This is the best of the three.</p>,
          },
        ]}
        compare={<p>Show the recursion first, because it looks just like the definition. Use the tree to explain why it is slow. Then give the loop. (LeetCode 509.)</p>}
      >
        <p>Return the n-th Fibonacci number, where <code>fib(0) = 0</code>, <code>fib(1) = 1</code> and <code>fib(n) = fib(n − 1) + fib(n − 2)</code>.</p>
      </Problem>

      <Problem
        n={2}
        title="Pow(x, n)"
        level="Medium"
        examples={[
          { input: "x = 2, n = 10", output: "1024", why: "Ten 2s multiplied together." },
          { input: "x = 2, n = −2", output: "0.25", why: "2⁻² = 1 / 2² = 1/4." },
          { input: "x = 2, n = 0", output: "1", why: "Anything to the power 0 is 1." },
        ]}
        hints={[
          <>x<sup>n</sup> = x × x<sup>n−1</sup> works, but it takes n steps.</>,
          <>x<sup>n</sup> = (x<sup>n/2</sup>)², with one extra x when n is odd. Call the function only once.</>,
          <>A negative power is 1 divided by the same positive power.</>,
        ]}
        approaches={[
          {
            name: "Multiply n times",
            idea: <p>Loop n times, and each time multiply the result by x.</p>,
            code: `function myPow(x, n) {
  if (n < 0) { x = 1 / x; n = -n; }
  let result = 1;
  for (let i = 0; i < n; i++) result *= x;
  return result;
}

console.log(myPow(2, 10)); // 1024
console.log(myPow(2, -2)); // 0.25`,
            explain: <p>O(n) time. If n is around 2 billion, this is much too slow.</p>,
          },
          {
            name: "Fast power by halving (recursion)",
            idea: <p>Work out the half power once and square it. If n is odd, multiply by x one more time.</p>,
            code: `function myPow(x, n) {
  if (n < 0) return 1 / myPow(x, -n);
  if (n === 0) return 1;
  const half = myPow(x, Math.floor(n / 2));
  return n % 2 === 0 ? half * half : half * half * x;
}

console.log(myPow(2, 10)); // 1024
console.log(myPow(2, -2)); // 0.25
console.log(myPow(2, 0));  // 1
console.log(myPow(2, 31)); // 2147483648`,
            explain: <p>O(log n) time and O(log n) stack space, because the chain of calls is that long.</p>,
          },
          {
            name: "Fast power with a loop",
            idea: <p>Write the exponent in binary (base 2, using only 0 and 1). At each step, square x. When the current binary digit is 1, multiply x into the result.</p>,
            code: `function myPow(x, n) {
  if (n < 0) { x = 1 / x; n = -n; }
  let result = 1;
  while (n > 0) {
    if (n % 2 === 1) result *= x;   // this binary digit of the exponent is 1
    x *= x;                         // x, x^2, x^4, x^8, ...
    n = Math.floor(n / 2);
  }
  return result;
}

console.log(myPow(2, 10)); // 1024
console.log(myPow(2, -2)); // 0.25
console.log(myPow(3, 5));  // 243`,
            explain: <p>O(log n) time and O(1) space. There is no stack at all.</p>,
          },
        ]}
        compare={<p>Interviewers usually want the recursive halving first. Then they often ask, &ldquo;can you do it without a stack?&rdquo;, and the loop is the answer. (LeetCode 50.)</p>}
      >
        <p>Write <code>myPow(x, n)</code>. It returns x raised to the power n. The number n can be negative.</p>
      </Problem>

      <Problem
        n={3}
        title="K-th symbol in grammar"
        level="Medium"
        examples={[
          { input: "n = 1, k = 1", output: "0", why: 'Row 1 is "0".' },
          { input: "n = 2, k = 1", output: "0", why: 'Row 2 is "01". Its first symbol is 0.' },
          { input: "n = 2, k = 2", output: "1", why: "The second symbol of “01”." },
        ]}
        hints={[
          <>The rows are: 0 → 01 → 0110 → 01101001. Each symbol becomes two symbols in the next row: 0 → 01 and 1 → 10.</>,
          <>The k-th symbol of row n came from the ⌈k / 2⌉-th symbol of row n − 1. (⌈ ⌉ means round up.)</>,
          <>If k is odd, it is the <em>first</em> of the pair, so it is the same as the parent. If k is even, it is the <em>second</em>, so it is the opposite of the parent.</>,
        ]}
        approaches={[
          {
            name: "Build the whole row",
            idea: <p>Make every row up to row n. Then read position k.</p>,
            code: `function kthGrammar(n, k) {
  let row = "0";
  for (let i = 1; i < n; i++) {
    row = [...row].map((c) => (c === "0" ? "01" : "10")).join("");
  }
  return Number(row[k - 1]);
}

console.log(kthGrammar(1, 1)); // 0
console.log(kthGrammar(2, 2)); // 1
console.log(kthGrammar(4, 5)); // 1`,
            explain: <p>Row n has 2<sup>n−1</sup> symbols, so this takes O(2<sup>n</sup>) time. It is not possible for n = 30.</p>,
          },
          {
            name: "Follow the parent (recursion)",
            idea: <p>Ask the parent. The answer is the parent&apos;s value, flipped (0 becomes 1, 1 becomes 0) when k is even.</p>,
            code: `function kthGrammar(n, k) {
  if (n === 1) return 0;
  const parent = kthGrammar(n - 1, Math.ceil(k / 2));
  return k % 2 === 1 ? parent : 1 - parent;
}

console.log(kthGrammar(1, 1));            // 0
console.log(kthGrammar(2, 1));            // 0
console.log(kthGrammar(2, 2));            // 1
console.log(kthGrammar(4, 5));            // 1
console.log(kthGrammar(4, 6));            // 0
console.log(kthGrammar(30, 434991989));   // 0`,
            explain: <p>The recursion tree is one chain of n calls. It takes O(n) time and O(n) space, and it never builds a row.</p>,
          },
        ]}
        compare={<p>(LeetCode 779.) This is hard to see at first. It becomes clear when you draw the tree and notice that each node has one parent.</p>}
      >
        <p>Row 1 is <code>0</code>. To make the next row, replace every 0 with 01 and every 1 with 10. Return the k-th symbol of row n. Counting starts at 1.</p>
      </Problem>

      <Problem
        n={4}
        title="Tower of Hanoi"
        level="Medium"
        examples={[
          { input: "n = 1", output: "A→C", why: "One disk moves straight across." },
          { input: "n = 2", output: "A→B, A→C, B→C", why: "Put the small disk on B, move the big disk, then bring the small disk back." },
          { input: "n = 3", output: "7 moves", why: "2³ − 1 = 7." },
        ]}
        hints={[
          <>To move n disks from A to C: first move n − 1 disks from A to B (using C as helper). Then move the biggest disk from A to C. Then move the n − 1 disks from B to C (using A as helper).</>,
          <>The base case is zero disks. There is nothing to do.</>,
        ]}
        approaches={[
          {
            name: "Recursion on the number of disks",
            idea: (
              <ol>
                <li><code>hanoi(n − 1, from, via, to)</code></li>
                <li>Save the move <code>from → to</code></li>
                <li><code>hanoi(n − 1, via, to, from)</code></li>
              </ol>
            ),
            code: `function hanoi(n, from, to, via, moves = []) {
  if (n === 0) return moves;
  hanoi(n - 1, from, via, to, moves);     // clear the way
  moves.push(from + "→" + to);            // move the biggest disk
  hanoi(n - 1, via, to, from, moves);     // put the other disks back on top
  return moves;
}

console.log(hanoi(1, "A", "C", "B").join(", ")); // A→C
console.log(hanoi(2, "A", "C", "B").join(", ")); // A→B, A→C, B→C
console.log(hanoi(3, "A", "C", "B").length);     // 7
console.log(hanoi(10, "A", "C", "B").length);    // 1023`,
            explain: <p>There are 2<sup>n</sup> − 1 calls that make a move (plus empty calls with 0 disks), so the time is O(2<sup>n</sup>). You cannot do better, because that many moves are needed. The stack depth is n.</p>,
          },
        ]}
        compare={<p>A classic example where the recursive tree is <em>exactly</em> the work that is needed. No sub-problem repeats, so memoisation would not help.</p>}
      >
        <p>Move n disks from peg A to peg C, using peg B as a helper. Move one disk at a time. Never put a larger disk on a smaller disk. Return the list of moves.</p>
      </Problem>

      <Problem
        n={5}
        title="All binary strings of length n"
        level="Easy"
        examples={[
          { input: "n = 2", output: '["00", "01", "10", "11"]', why: "Each position is 0 or 1." },
          { input: "n = 3", output: "8 strings", why: "2³ = 8." },
        ]}
        hints={[
          <>At each position you make a choice: 0 or 1. So each node has two children.</>,
          <>Pass the string built so far as a parameter. When its length is n, save it.</>,
        ]}
        approaches={[
          {
            name: "A tree of choices (parameter-based)",
            idea: <p>One child call adds &ldquo;0&rdquo; to the string and the other adds &ldquo;1&rdquo;. When the string reaches length n, save it.</p>,
            code: `function binaryStrings(n) {
  const out = [];
  function build(prefix) {
    if (prefix.length === n) { out.push(prefix); return; }
    build(prefix + "0");
    build(prefix + "1");
  }
  build("");
  return out;
}

console.log(binaryStrings(2));        // ["00","01","10","11"]
console.log(binaryStrings(3).length); // 8`,
            explain: <p>There are 2<sup>n</sup> leaves, and each is a string of length n, so the time is O(n · 2<sup>n</sup>). This tree, where you pick a value at each position, is the template for subsets in the next lesson.</p>,
          },
        ]}
        compare={<p>This is the simplest first example of backtracking (trying choices and undoing them). Draw the tree for n = 2 first.</p>}
      >
        <p>Return every binary string (a string of only 0 and 1) of length <code>n</code>.</p>
      </Problem>

      <Problem
        n={6}
        title="Flatten a nested array"
        level="Medium"
        examples={[
          { input: "[1, [2, [3, [4]], 5]]", output: "[1, 2, 3, 4, 5]", why: "Every nested level is removed." },
          { input: "[[], [1], [[2]]]", output: "[1, 2]", why: "Empty arrays add nothing." },
        ]}
        hints={[
          <>The data is shaped like a tree. An element is either a number (a leaf) or an array (more branches).</>,
          <>For each element: if it is an array, flatten it with a recursive call. Otherwise, keep it.</>,
        ]}
        approaches={[
          {
            name: "Recursion",
            idea: <p>Go through the array. When an element is itself an array, make a recursive call on it.</p>,
            code: `function flatten(arr) {
  const out = [];
  for (const x of arr) {
    if (Array.isArray(x)) out.push(...flatten(x));
    else out.push(x);
  }
  return out;
}

console.log(flatten([1, [2, [3, [4]], 5]])); // [1, 2, 3, 4, 5]
console.log(flatten([[], [1], [[2]]]));      // [1, 2]`,
            explain: <p>About O(total elements) time when the nesting is shallow. Copying the inner results into the outer one at every level adds some extra work for deep nesting. The recursion depth equals the deepest nesting.</p>,
          },
          {
            name: "An explicit stack (no recursion)",
            idea: <p>Put the array&apos;s elements on a stack (a list where you add and remove only at the end, so the last item in is the first item out). Take one off. If it is an array, put its elements back on the stack.</p>,
            code: `function flatten(arr) {
  const out = [];
  const stack = [...arr];
  while (stack.length > 0) {
    const x = stack.pop();
    if (Array.isArray(x)) stack.push(...x);
    else out.push(x);
  }
  return out.reverse();              // popping goes from right to left, so reverse at the end
}

console.log(flatten([1, [2, [3, [4]], 5]])); // [1, 2, 3, 4, 5]
console.log(flatten([]));                    // []`,
            explain: <p>It is the same work, but a very deep nesting can no longer cause a stack overflow (the call stack running out of room). Changing recursion into a stack like this comes back in the trees lessons.</p>,
          },
        ]}
        compare={<p>Use recursion. Mention the stack version as your answer to &ldquo;what if the nesting is extremely deep?&rdquo;. (<code>arr.flat(Infinity)</code> exists, but the question tests the idea.)</p>}
      >
        <p>Flatten a nested array of numbers (arrays inside arrays, to any depth) into one array. Keep the order.</p>
      </Problem>

      <Problem
        n={7}
        title="How many calls does fib(n) make?"
        level="Medium"
        examples={[
          { input: "n = 4", output: "9", why: "The tree has 9 nodes (see the trace in the lesson)." },
          { input: "n = 20", output: "21891", why: "About 22 thousand calls for a small input." },
          { input: "n = 30", output: "2692537", why: "More than two and a half million." },
        ]}
        hints={[
          <>Let calls(n) be the number of calls. The root is one call, plus all the calls of its two children.</>,
          <>calls(n) = 1 + calls(n − 1) + calls(n − 2), with calls(0) = calls(1) = 1.</>,
        ]}
        approaches={[
          {
            name: "Count by counting the tree",
            idea: <p>Write the same recursion, but return the number of nodes instead of the Fibonacci value.</p>,
            code: `function fibCalls(n) {
  if (n <= 1) return 1;                         // a leaf: one call
  return 1 + fibCalls(n - 1) + fibCalls(n - 2); // me + both sub-trees
}

console.log(fibCalls(4));  // 9
console.log(fibCalls(20)); // 21891
console.log(fibCalls(30)); // 2692537`,
            explain: <p>The recursion that makes the tree is the same recursion that counts it. (It is slow too, for the same reason.)</p>,
          },
          {
            name: "A formula: 2 × fib(n + 1) − 1",
            idea: <p>The call counts follow the Fibonacci numbers themselves, so you can work them out with a loop.</p>,
            code: `function fibCallsFast(n) {
  let a = 0, b = 1;                  // fib(0), fib(1)
  for (let i = 0; i <= n; i++) [a, b] = [b, a + b];   // after the loop, a = fib(n + 1)
  return 2 * a - 1;
}

console.log(fibCallsFast(4));  // 9
console.log(fibCallsFast(20)); // 21891
console.log(fibCallsFast(30)); // 2692537`,
            explain: <p>O(n) time. The number of calls grows like 1.618<sup>n</sup> (the golden ratio, about 1.618, to the power n). That is exponential growth, but a little slower than 2<sup>n</sup>.</p>,
          },
        ]}
        compare={<p>This is a thinking exercise, not a LeetCode problem. It teaches you to turn &ldquo;how long will this take?&rdquo; into &ldquo;how many nodes does the tree have?&rdquo;.</p>}
      >
        <p>Write a function that returns how many calls the simple <code>fib(n)</code> makes, including the first call.</p>
      </Problem>

      <DryRun
        title="Cost of the functions in this lesson"
        cols={["Function", "Calls per node", "Height", "Time", "Stack space"]}
        rows={[
          ["sum of an array", "1", "n", "O(n)", "O(n)"],
          ["naive fib(n)", "2", "n", "O(2ⁿ)", "O(n)"],
          ["memoised fib(n)", "2 (but repeated calls are answered at once)", "n", "O(n)", "O(n)"],
          ["fast power", "1", "log n", "O(log n)", "O(log n)"],
          ["tower of Hanoi", "2", "n", "O(2ⁿ)", "O(n)"],
          ["binary strings of length n", "2", "n", "O(n · 2ⁿ)", "O(n)"],
        ]}
      />
    </>
  );
}
