import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 8 practice questions. Every question shows each way to solve it. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Sum of an array"
        level="Easy"
        examples={[
          { input: "[3, 7, 2, 9]", output: "21", why: "3 + 7 + 2 + 9 = 21." },
          { input: "[]", output: "0", why: "An empty array has nothing to add, so the sum is 0." },
        ]}
        hints={[<>This is the accumulate pattern: a variable before the loop, updated inside it.</>]}
        approaches={[
          {
            name: "Index loop",
            idea: <p>Start <code>sum</code> at 0 and add <code>arr[i]</code> for every index.</p>,
            code: `function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

console.log(sumArray([3, 7, 2, 9])); // 21
console.log(sumArray([]));           // 0`,
            explain: <p>For an empty array the loop never runs and 0 is returned — correct without a special case.</p>,
          },
          {
            name: "for…of",
            idea: <p>The position is not needed, so loop over the values directly.</p>,
            code: `function sumArray(arr) {
  let sum = 0;
  for (const x of arr) sum += x;
  return sum;
}

console.log(sumArray([3, 7, 2, 9])); // 21`,
            explain: <p>Shorter and less room for an off-by-one error.</p>,
          },
          {
            name: "reduce",
            idea: <p><code>reduce</code> combines all items into one value, starting from 0.</p>,
            code: `const sumArray = (arr) => arr.reduce((sum, x) => sum + x, 0);

console.log(sumArray([3, 7, 2, 9])); // 21
console.log(sumArray([]));           // 0`,
            explain: <p>The <code>0</code> at the end is the starting value. Leave it out and <code>reduce</code> throws an error on an empty array.</p>,
          },
        ]}
        compare={<p>All three are correct. In interviews, the loop versions are clearest; <code>reduce</code> is common in everyday JavaScript.</p>}
      >
        <p>Return the sum of all numbers in the array.</p>
      </Problem>

      <Problem
        n={2}
        title="Largest element"
        level="Easy"
        examples={[
          { input: "[3, 7, 2, 9, 4]", output: "9", why: "9 is larger than every other value." },
          { input: "[-5, -2, -9]", output: "-2", why: "All values are negative; -2 is the largest. Starting max at 0 would wrongly return 0." },
        ]}
        hints={[<>Keep a &ldquo;best so far&rdquo; variable. What should it start as?</>, <>Start with <code>arr[0]</code>, not 0, so that arrays of negative numbers work.</>]}
        approaches={[
          {
            name: "Best so far",
            idea: <p>Start with the first item, then replace it whenever a larger item appears.</p>,
            code: `function largest(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

console.log(largest([3, 7, 2, 9, 4])); // 9
console.log(largest([-5, -2, -9]));    // -2`,
            explain: <p>One pass through the array. This is the traced example in the lesson.</p>,
          },
          {
            name: "Math.max with spread",
            idea: <p><code>...arr</code> spreads the array into separate arguments for <code>Math.max</code>.</p>,
            code: `const largest = (arr) => Math.max(...arr);

console.log(largest([3, 7, 2, 9, 4])); // 9`,
            explain: <p>Short and correct for normal sizes. For extremely large arrays (hundreds of thousands of items) spreading can fail, so the loop is safer.</p>,
          },
          {
            name: "Sort a copy and take the last item",
            idea: <p>After sorting from smallest to largest, the largest value is at the end.</p>,
            code: `function largest(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[sorted.length - 1];
}

console.log(largest([3, 7, 2, 9, 4])); // 9`,
            explain: <p>Correct, but sorting does far more work than one pass (Lesson 12). Mention it only to show you know why it is not the best choice.</p>,
          },
        ]}
        compare={<p>Use Approach 1. It does the least work and works for every size of array.</p>}
      >
        <p>Return the largest number in a non-empty array.</p>
      </Problem>

      <Problem
        n={3}
        title="Count the even numbers"
        level="Easy"
        examples={[{ input: "[1, 4, 6, 7, 10]", output: "3", why: "4, 6 and 10 are even." }]}
        hints={[<>Start a counter at 0 and add 1 for each even value.</>]}
        approaches={[
          {
            name: "Loop and count",
            idea: <p>The count pattern: a counter that increases only when the condition is true.</p>,
            code: `function countEvens(arr) {
  let count = 0;
  for (const x of arr) {
    if (x % 2 === 0) count++;
  }
  return count;
}

console.log(countEvens([1, 4, 6, 7, 10])); // 3`,
            explain: <p>Position does not matter, so <code>for…of</code> is enough.</p>,
          },
          {
            name: "filter, then length",
            idea: <p>Keep only the even values, then count how many were kept.</p>,
            code: `const countEvens = (arr) => arr.filter((x) => x % 2 === 0).length;

console.log(countEvens([1, 4, 6, 7, 10])); // 3`,
            explain: <p>Readable, but it builds a temporary array just to count it.</p>,
          },
        ]}
        compare={<p>Approach 1 uses no extra memory. Approach 2 is fine for small inputs and reads like the problem statement.</p>}
      >
        <p>How many numbers in the array are even?</p>
      </Problem>

      <Problem
        n={4}
        title="Linear search"
        level="Easy"
        examples={[
          { input: "arr = [5, 3, 8, 3], target = 3", output: "1", why: "3 appears at positions 1 and 3; the first is 1." },
          { input: "arr = [5, 3, 8], target = 4", output: "-1", why: "4 is not in the array." },
        ]}
        hints={[<>Check each position from the start. When you find the target, return its position immediately.</>, <>If the loop finishes without finding it, return -1.</>]}
        approaches={[
          {
            name: "Index loop with early return",
            idea: <p>Return the first matching index; return -1 after the loop.</p>,
            code: `function indexOf(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

console.log(indexOf([5, 3, 8, 3], 3)); // 1
console.log(indexOf([5, 3, 8], 4));    // -1`,
            explain: <p>The search pattern. It needs the index, so it uses an index loop rather than <code>for…of</code>.</p>,
          },
          {
            name: "Built-in indexOf",
            idea: <p>Arrays already have this method.</p>,
            code: `console.log([5, 3, 8, 3].indexOf(3)); // 1
console.log([5, 3, 8].indexOf(4));    // -1`,
            explain: <p>It does exactly what Approach 1 does: it checks items one by one. Knowing that tells you how long it takes on a big array.</p>,
          },
          {
            name: "findIndex with a condition",
            idea: <p><code>findIndex</code> returns the first index whose item passes a test you provide.</p>,
            code: `const nums = [5, 3, 8, 3];
console.log(nums.findIndex((x) => x > 6)); // 2   first item greater than 6`,
            explain: <p>Useful when you are searching for a condition rather than an exact value.</p>,
          },
        ]}
        compare={<p>Be able to write Approach 1. Use the built-ins in real code. If the array is sorted, binary search (Lesson 28) is much faster.</p>}
      >
        <p>Return the index of the first occurrence of <code>target</code>, or −1 if it is not there.</p>
      </Problem>

      <Problem
        n={5}
        title="Reverse an array"
        level="Easy"
        examples={[
          { input: "[1, 2, 3, 4, 5]", output: "[5, 4, 3, 2, 1]", why: "The first item becomes the last, the second becomes the second-last, and so on." },
          { input: "[7]", output: "[7]", why: "A single item stays where it is." },
        ]}
        hints={[<>Swap the first and last items, then the second and second-last, and so on.</>, <>Use two indexes, <code>left</code> and <code>right</code>, moving towards each other. Stop when they meet.</>]}
        approaches={[
          {
            name: "Two pointers, in place",
            idea: <p>Swap the two ends, move both pointers inwards, repeat until they meet.</p>,
            code: `function reverseInPlace(arr) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;
    left++;
    right--;
  }
  return arr;
}

console.log(reverseInPlace([1, 2, 3, 4, 5])); // [ 5, 4, 3, 2, 1 ]
console.log(reverseInPlace([7]));             // [ 7 ]`,
            explain: <DryRun title="[1, 2, 3, 4, 5]" cols={["left", "right", "swap", "array after"]} rows={[["0", "4", "1 ↔ 5", "[5, 2, 3, 4, 1]"], ["1", "3", "2 ↔ 4", "[5, 4, 3, 2, 1]"], ["2", "2", "left < right is false — stop", ""]]} highlight={2} />,
          },
          {
            name: "Build a new array backwards",
            idea: <p>Walk from the last index to the first and push each item into a new array.</p>,
            code: `function reversed(arr) {
  const result = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    result.push(arr[i]);
  }
  return result;
}

console.log(reversed([1, 2, 3])); // [ 3, 2, 1 ]`,
            explain: <p>Simple, and the original array is unchanged — but it uses a second array of the same size.</p>,
          },
          {
            name: "Built-in reverse",
            idea: <p><code>arr.reverse()</code> reverses in place.</p>,
            code: `const nums = [1, 2, 3];
nums.reverse();
console.log(nums); // [ 3, 2, 1 ]`,
            explain: <p>It changes the original. Use <code>[...nums].reverse()</code> to keep the original.</p>,
          },
        ]}
        compare={<p>If the question says &ldquo;in place&rdquo; or &ldquo;without extra memory&rdquo;, use Approach 1 — your first two-pointer solution. Lesson 21 builds a whole pattern on it.</p>}
      >
        <p>Reverse the array. Try to do it without creating a second array.</p>
      </Problem>

      <Problem
        n={6}
        title="Is the array sorted?"
        level="Easy"
        examples={[
          { input: "[1, 2, 2, 5]", output: "true", why: "Every item is greater than or equal to the one before it." },
          { input: "[1, 3, 2]", output: "false", why: "2 is smaller than the 3 before it." },
        ]}
        hints={[<>Compare each item with the item just before it.</>, <>Start the loop at index 1, because index 0 has no item before it.</>]}
        approaches={[
          {
            name: "Compare neighbours",
            idea: <p>If any item is smaller than the one before it, the array is not sorted.</p>,
            code: `function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) return false;
  }
  return true;
}

console.log(isSorted([1, 2, 2, 5])); // true
console.log(isSorted([1, 3, 2]));    // false`,
            explain: <p>One drop anywhere is enough to answer false, so the function can stop early.</p>,
          },
          {
            name: "every()",
            idea: <p><code>every</code> checks whether a condition is true for every item.</p>,
            code: `const isSorted = (arr) => arr.every((x, i) => i === 0 || arr[i - 1] <= x);

console.log(isSorted([1, 2, 2, 5])); // true
console.log(isSorted([1, 3, 2]));    // false`,
            explain: <p>The second argument <code>i</code> is the position. Like Approach 1, <code>every</code> stops at the first failure.</p>,
          },
          {
            name: "Compare with a sorted copy",
            idea: <p>Sort a copy and check whether it matches the original.</p>,
            code: `function isSorted(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted.every((x, i) => x === arr[i]);
}

console.log(isSorted([1, 3, 2])); // false`,
            explain: <p>Correct, but sorting is much more work than one pass. Avoid it here.</p>,
          },
        ]}
        compare={<p>Use Approach 1.</p>}
      >
        <p>Return <code>true</code> if the array is in non-decreasing order.</p>
      </Problem>

      <Problem
        n={7}
        title="Second largest (distinct)"
        level="Medium"
        examples={[
          { input: "[12, 35, 1, 10, 34, 1]", output: "34", why: "The largest is 35; the largest value below it is 34." },
          { input: "[10, 10, 10]", output: "-1", why: "Only one distinct value exists, so there is no second largest." },
        ]}
        hints={[
          <>Simple idea: find the largest first, then find the largest value that is smaller than it.</>,
          <>One-pass idea: keep two variables, <code>first</code> and <code>second</code>. When a new largest arrives, the old largest becomes <code>second</code>.</>,
        ]}
        approaches={[
          {
            name: "Two passes",
            idea: (
              <ol>
                <li>Pass 1: find the largest value.</li>
                <li>Pass 2: find the largest value that is strictly smaller.</li>
              </ol>
            ),
            code: `function secondLargest(arr) {
  let first = -Infinity;
  for (const x of arr) if (x > first) first = x;

  let second = -Infinity;
  for (const x of arr) if (x < first && x > second) second = x;

  return second === -Infinity ? -1 : second;
}

console.log(secondLargest([12, 35, 1, 10, 34, 1])); // 34
console.log(secondLargest([10, 10, 10]));           // -1`,
            explain: <p><code>-Infinity</code> is smaller than every number, so it is a safe starting value. Easy to get right.</p>,
          },
          {
            name: "One pass with two variables",
            idea: <p>Track the largest and second largest at the same time.</p>,
            code: `function secondLargest(arr) {
  let first = -Infinity, second = -Infinity;
  for (const x of arr) {
    if (x > first) {
      second = first;    // the old largest moves down
      first = x;
    } else if (x > second && x < first) {
      second = x;
    }
  }
  return second === -Infinity ? -1 : second;
}

console.log(secondLargest([12, 35, 1, 10, 34, 1])); // 34
console.log(secondLargest([10, 10, 10]));           // -1`,
            explain: <DryRun title="[12, 35, 1, 10, 34, 1]" cols={["x", "rule", "first", "second"]} rows={[["12", "new largest", "12", "-∞"], ["35", "new largest", "35", "12"], ["1", "nothing", "35", "12"], ["10", "nothing", "35", "12"], ["34", "between", "35", "34"], ["1", "nothing", "35", "34"]]} highlight={4} />,
          },
          {
            name: "Remove duplicates and sort",
            idea: <p>Keep only distinct values (with a <code>Set</code>, Lesson 10), sort them, and take the second from the end.</p>,
            code: `function secondLargest(arr) {
  const unique = [...new Set(arr)].sort((a, b) => a - b);
  return unique.length < 2 ? -1 : unique[unique.length - 2];
}

console.log(secondLargest([12, 35, 1, 10, 34, 1])); // 34
console.log(secondLargest([10, 10, 10]));           // -1`,
            explain: <p>Short, but sorting does more work than necessary. Good to mention, not the best answer.</p>,
          },
        ]}
        compare={<p>Approach 2 is the answer interviewers look for (one pass, no extra memory). Approach 1 is a perfectly good first answer that you can then improve.</p>}
      >
        <p>Return the second largest <em>distinct</em> value, or −1 if there isn&apos;t one.</p>
      </Problem>

      <Problem
        n={8}
        title="Remove duplicates from a sorted array"
        level="Medium"
        examples={[
          { input: "[1, 1, 2, 3, 3, 3, 4]", output: "[1, 2, 3, 4]", why: "Each value is kept once, in order." },
          { input: "[]", output: "[]", why: "Nothing to remove." },
        ]}
        hints={[<>In a sorted array, equal values are always next to each other.</>, <>Keep an item only if it is different from the item before it.</>]}
        approaches={[
          {
            name: "Build a new array",
            idea: <p>Push an item if it is the first item or differs from the previous one.</p>,
            code: `function uniqueSorted(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (i === 0 || arr[i] !== arr[i - 1]) result.push(arr[i]);
  }
  return result;
}

console.log(uniqueSorted([1, 1, 2, 3, 3, 3, 4])); // [ 1, 2, 3, 4 ]
console.log(uniqueSorted([]));                    // []`,
            explain: <p>Because the input is sorted, checking the neighbour is enough.</p>,
          },
          {
            name: "In place with a write pointer",
            idea: <p>Keep a position <code>k</code> for the next unique value. Copy each new value to <code>arr[k]</code>. The first k items are the answer.</p>,
            code: `function removeDuplicates(arr) {
  if (arr.length === 0) return 0;
  let k = 1;                                // arr[0] is always kept
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[k - 1]) {
      arr[k] = arr[i];
      k++;
    }
  }
  return k;                                 // number of unique values
}

const nums = [1, 1, 2, 3, 3, 3, 4];
const k = removeDuplicates(nums);
console.log(k, nums.slice(0, k)); // 4 [ 1, 2, 3, 4 ]`,
            explain: <p>This is exactly LeetCode 26: return the count and leave the unique values at the front. No second array is used.</p>,
          },
          {
            name: "Set",
            idea: <p>A Set keeps each value only once (Lesson 10).</p>,
            code: `const uniqueSorted = (arr) => [...new Set(arr)];

console.log(uniqueSorted([1, 1, 2, 3, 3, 3, 4])); // [ 1, 2, 3, 4 ]`,
            explain: <p>Works even if the array is not sorted, but uses extra memory and is not &ldquo;in place&rdquo;.</p>,
          },
        ]}
        compare={<p>For LeetCode 26 you must use Approach 2. Approach 1 is the easiest to write; Approach 3 is the everyday shortcut.</p>}
      >
        <p>Given a sorted array, keep each value only once.</p>
      </Problem>

      <Problem
        n={9}
        title="Rotate left by one"
        level="Easy"
        examples={[{ input: "[1, 2, 3, 4, 5]", output: "[2, 3, 4, 5, 1]", why: "Every item moves one place left; the first item wraps round to the end." }]}
        hints={[<>Save the first item before it is overwritten.</>, <>Shift every other item one place left, then put the saved item at the end.</>]}
        approaches={[
          {
            name: "Save, shift, place",
            idea: <p>Save <code>arr[0]</code>, move each item one place left, put the saved item last.</p>,
            code: `function rotateLeftOne(arr) {
  if (arr.length === 0) return arr;
  const first = arr[0];
  for (let i = 1; i < arr.length; i++) {
    arr[i - 1] = arr[i];
  }
  arr[arr.length - 1] = first;
  return arr;
}

console.log(rotateLeftOne([1, 2, 3, 4, 5])); // [ 2, 3, 4, 5, 1 ]`,
            explain: <p>The same idea as the swap in Lesson 2: save a value before you overwrite it.</p>,
          },
          {
            name: "shift and push",
            idea: <p><code>shift()</code> removes and returns the first item; <code>push</code> adds it to the end.</p>,
            code: `const nums = [1, 2, 3, 4, 5];
nums.push(nums.shift());
console.log(nums); // [ 2, 3, 4, 5, 1 ]`,
            explain: <p>One line. <code>shift()</code> moves every other item internally, so it does the same amount of work as Approach 1.</p>,
          },
          {
            name: "slice and join two pieces",
            idea: <p>The answer is &ldquo;everything after the first item&rdquo; followed by &ldquo;the first item&rdquo;.</p>,
            code: `const rotateLeftOne = (arr) => [...arr.slice(1), arr[0]];

console.log(rotateLeftOne([1, 2, 3, 4, 5])); // [ 2, 3, 4, 5, 1 ]`,
            explain: <p>Builds a new array and leaves the original unchanged. Lesson 19 extends this to rotating by k positions.</p>,
          },
        ]}
        compare={<p>Approach 1 shows you understand what happens to each item. Approaches 2 and 3 are fine in everyday code.</p>}
      >
        <p>Move every element one position to the left; the first element goes to the end.</p>
      </Problem>

      <Problem
        n={10}
        title="Move zeros to the end"
        level="Medium"
        examples={[
          { input: "[0, 1, 0, 3, 12]", output: "[1, 3, 12, 0, 0]", why: "The non-zero values keep their order (1, 3, 12) and the two zeros go to the end." },
          { input: "[0]", output: "[0]", why: "Nothing to move." },
        ]}
        hints={[<>Keep a position <code>k</code>: &ldquo;where the next non-zero value should go&rdquo;.</>, <>Copy every non-zero value to position k and move k forward. Afterwards, fill everything from k to the end with zeros.</>]}
        approaches={[
          {
            name: "Write pointer, then fill zeros",
            idea: <p>Pack the non-zero values at the front, then fill the rest with zeros.</p>,
            code: `function moveZeros(arr) {
  let k = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== 0) {
      arr[k] = arr[i];
      k++;
    }
  }
  while (k < arr.length) {
    arr[k] = 0;
    k++;
  }
  return arr;
}

console.log(moveZeros([0, 1, 0, 3, 12])); // [ 1, 3, 12, 0, 0 ]`,
            explain: <DryRun title="[0, 1, 0, 3, 12]" cols={["i", "arr[i]", "action", "k after"]} rows={[["0", "0", "skip", "0"], ["1", "1", "arr[0] = 1", "1"], ["2", "0", "skip", "1"], ["3", "3", "arr[1] = 3", "2"], ["4", "12", "arr[2] = 12", "3"], ["—", "", "fill arr[3], arr[4] with 0", "5"]]} />,
          },
          {
            name: "Swap non-zeros forward",
            idea: <p>When <code>arr[i]</code> is not zero, swap it with <code>arr[k]</code>. The zeros move back automatically.</p>,
            code: `function moveZeros(arr) {
  let k = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== 0) {
      [arr[k], arr[i]] = [arr[i], arr[k]];   // swap
      k++;
    }
  }
  return arr;
}

console.log(moveZeros([0, 1, 0, 3, 12])); // [ 1, 3, 12, 0, 0 ]`,
            explain: <p>One loop, no second pass. Every swap moves a non-zero value forward and a zero backward.</p>,
          },
          {
            name: "filter, then add zeros",
            idea: <p>Make a new array of the non-zero values and add the right number of zeros.</p>,
            code: `function moveZeros(arr) {
  const nonZero = arr.filter((x) => x !== 0);
  const zeros = new Array(arr.length - nonZero.length).fill(0);
  return [...nonZero, ...zeros];
}

console.log(moveZeros([0, 1, 0, 3, 12])); // [ 1, 3, 12, 0, 0 ]`,
            explain: <p>Very readable, but it creates new arrays, so it does not meet the &ldquo;in place&rdquo; requirement of LeetCode 283.</p>,
          },
        ]}
        compare={<p>For LeetCode 283 use Approach 1 or 2 (both in place). Approach 2 is slightly shorter; Approach 1 is easier to trace.</p>}
      >
        <p>Move all zeros to the end, keeping the other numbers in their original order. Do it in place. (LeetCode 283.)</p>
      </Problem>

      <Problem
        n={11}
        title="Running sum"
        level="Easy"
        examples={[
          { input: "[1, 2, 3, 4]", output: "[1, 3, 6, 10]", why: "Each position holds the total so far: 1, 1+2, 1+2+3, 1+2+3+4." },
          { input: "[3, 1, 2, 10, 1]", output: "[3, 4, 6, 16, 17]", why: "3, 3+1, 4+2, 6+10, 16+1." },
        ]}
        hints={[<>Keep a running total. After adding each item, record the total.</>]}
        approaches={[
          {
            name: "New array with a running total",
            idea: <p>Add each item to <code>total</code> and push the total into a new array.</p>,
            code: `function runningSum(nums) {
  const result = [];
  let total = 0;
  for (const x of nums) {
    total += x;
    result.push(total);
  }
  return result;
}

console.log(runningSum([1, 2, 3, 4])); // [ 1, 3, 6, 10 ]`,
            explain: <p>The accumulator pattern, saving its value after every step.</p>,
          },
          {
            name: "In place",
            idea: <p>Each position becomes itself plus the (already updated) position before it.</p>,
            code: `function runningSum(nums) {
  for (let i = 1; i < nums.length; i++) {
    nums[i] += nums[i - 1];
  }
  return nums;
}

console.log(runningSum([3, 1, 2, 10, 1])); // [ 3, 4, 6, 16, 17 ]`,
            explain: <p>No extra array. This running total is called a <strong>prefix sum</strong>; Lesson 20 shows how it answers &ldquo;sum of any range&rdquo; questions instantly.</p>,
          },
        ]}
        compare={<p>Both are correct for LeetCode 1480. Use Approach 2 if you may change the input; otherwise Approach 1.</p>}
      >
        <p>Return an array where position i holds the sum of <code>nums[0]</code> to <code>nums[i]</code>. (LeetCode 1480.)</p>
      </Problem>

      <Problem
        n={12}
        title="Max consecutive ones"
        level="Easy"
        examples={[
          { input: "[1, 1, 0, 1, 1, 1]", output: "3", why: "The longest run of 1s is the last three." },
          { input: "[1, 0, 1, 1, 0, 1]", output: "2", why: "The longest run is the two 1s in the middle." },
        ]}
        hints={[<>Keep a counter for the current run of 1s. What happens to it when you see a 0?</>, <>Also keep the best run so far, and update it as the current run grows.</>]}
        approaches={[
          {
            name: "Current run and best run",
            idea: <p>Increase <code>current</code> on a 1, reset it to 0 on a 0, and keep the largest value it reaches.</p>,
            code: `function findMaxConsecutiveOnes(nums) {
  let current = 0, best = 0;
  for (const x of nums) {
    if (x === 1) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

console.log(findMaxConsecutiveOnes([1, 1, 0, 1, 1, 1])); // 3
console.log(findMaxConsecutiveOnes([1, 0, 1, 1, 0, 1])); // 2`,
            explain: <p>Two patterns together: a counter that resets, and &ldquo;best so far&rdquo;. One pass.</p>,
          },
          {
            name: "Split the text at the zeros",
            idea: <p>Join the array into text like <code>&quot;110111&quot;</code>, split it at every 0, and find the longest piece.</p>,
            code: `function findMaxConsecutiveOnes(nums) {
  const pieces = nums.join("").split("0");   // "110111" → ["11", "111"]
  return Math.max(...pieces.map((p) => p.length));
}

console.log(findMaxConsecutiveOnes([1, 1, 0, 1, 1, 1])); // 3`,
            explain: <p>A creative shortcut. It builds text and several arrays, so it uses much more memory than Approach 1.</p>,
          },
        ]}
        compare={<p>Use Approach 1 for LeetCode 485. Approach 2 shows that thinking about a problem differently can lead to unusual solutions.</p>}
      >
        <p>Given an array of 0s and 1s, return the length of the longest run of consecutive 1s. (LeetCode 485.)</p>
      </Problem>
    </>
  );
}
