import DryRun from "@/components/dsa/DryRun";
import Problem from "@/components/dsa/Problem";

/** Lesson 16 practice questions: the moves of the simple sorts. */
export default function Questions() {
  return (
    <>
      <Problem
        n={1}
        title="Insert into a sorted array"
        level="Easy"
        examples={[
          { input: "arr = [1, 3, 5, 8], x = 4", output: "[1, 3, 4, 5, 8]", why: "4 belongs between 3 and 5." },
          { input: "arr = [2, 6], x = 9", output: "[2, 6, 9]", why: "Edge case: x is the largest, so it goes at the end." },
          { input: "arr = [], x = 7", output: "[7]", why: "Edge case: empty array." },
        ]}
        hints={[<>This is exactly one step of insertion sort: x is the key.</>, <>Push x onto the end to make room, then shift the bigger items one place right, starting from the end.</>]}
        approaches={[
          {
            name: "Shift from the end",
            idea: <p>Make the array one item longer. Then walk from the end and move every item that is bigger than x one place right. Put x in the gap.</p>,
            code: `function insertSorted(arr, x) {
  let j = arr.length - 1;
  arr.push(x);                         // make room (this slot is overwritten when needed)
  while (j >= 0 && arr[j] > x) {
    arr[j + 1] = arr[j];
    j--;
  }
  arr[j + 1] = x;
  return arr;
}

console.log(insertSorted([1, 3, 5, 8], 4)); // [ 1, 3, 4, 5, 8 ]
console.log(insertSorted([2, 6], 9));       // [ 2, 6, 9 ]
console.log(insertSorted([], 7));           // [ 7 ]`,
            explain: <p>O(n) in the worst case (x is smaller than everything). It is O(1) when x is the largest. It is in-place, which means it makes no second array.</p>,
          },
          {
            name: "Find the position, then splice",
            idea: <p>Find the first index whose value is bigger than x. Then insert x there with <code>splice</code> (an array method that can add or remove items at any position).</p>,
            code: `function insertSorted(arr, x) {
  let i = 0;
  while (i < arr.length && arr[i] <= x) i++;
  arr.splice(i, 0, x);
  return arr;
}

console.log(insertSorted([1, 3, 5, 8], 4)); // [ 1, 3, 4, 5, 8 ]`,
            explain: <p>This is also O(n). The search is O(n), and <code>splice</code> shifts the later items (a loop that you cannot see, Lesson 12). Lesson 28 finds the position in O(log n), but the shifting still costs O(n).</p>,
          },
        ]}
        compare={<p>Approach 1 is the inner loop of insertion sort. If you understand it, the full sort is easy to write from memory.</p>}
      >
        <p>Insert <code>x</code> into the sorted array <code>arr</code> so that it stays sorted.</p>
      </Problem>

      <Problem
        n={2}
        title="Height checker"
        level="Easy"
        examples={[
          { input: "[1, 1, 4, 2, 1, 3]", output: "3", why: "Sorted is [1, 1, 1, 2, 3, 4]. Positions 2, 4 and 5 differ." },
          { input: "[5, 1, 2, 3, 4]", output: "5", why: "Sorted is [1, 2, 3, 4, 5]: every position differs." },
          { input: "[1, 2, 3]", output: "0", why: "Already in order." },
        ]}
        hints={[<>Make a sorted copy. Then compare the two arrays position by position.</>, <>Heights are between 1 and 100. A counting array (Lesson 15) can give you the sorted order without comparing items.</>]}
        approaches={[
          {
            name: "Sort a copy, compare",
            idea: <p>Copy the array, sort the copy with a comparator (the function <code>(a, b) =&gt; a - b</code>), and count the differences.</p>,
            code: `function heightChecker(heights) {
  const expected = [...heights].sort((a, b) => a - b);
  let count = 0;
  for (let i = 0; i < heights.length; i++) {
    if (heights[i] !== expected[i]) count++;
  }
  return count;
}

console.log(heightChecker([1, 1, 4, 2, 1, 3])); // 3
console.log(heightChecker([5, 1, 2, 3, 4]));    // 5`,
            explain: <p>O(n log n) for the sort. Copying with <code>[...heights]</code> is important, because <code>sort</code> changes the array that it is called on.</p>,
          },
          {
            name: "Counting sort",
            idea: <p>Count each height. Then walk the heights from 1 upwards. This walk gives the sorted order, and we compare it with the original as we go.</p>,
            code: `function heightChecker(heights) {
  const count = new Array(101).fill(0);
  for (const h of heights) count[h]++;

  let mismatches = 0;
  let h = 1;
  for (const actual of heights) {
    while (count[h] === 0) h++;        // next height in sorted order
    if (actual !== h) mismatches++;
    count[h]--;
  }
  return mismatches;
}

console.log(heightChecker([1, 1, 4, 2, 1, 3])); // 3
console.log(heightChecker([1, 2, 3]));          // 0`,
            explain: <p>O(n + 100) = O(n). This is <strong>counting sort</strong>, a sorting method that counts how many times each value appears and then writes the values out in order. When the values come from a small range, you can sort without comparing items at all.</p>,
          },
        ]}
        compare={<p>Approach 1 is the normal answer. Mention counting sort when the range of values is small. It beats the O(n log n) limit of sorts that compare items. (LeetCode 1051.)</p>}
      >
        <p>Students should stand in non-decreasing order of height (each student is as tall as or taller than the one before). Return how many positions do not match the sorted order.</p>
      </Problem>

      <Problem
        n={3}
        title="The k smallest, with selection passes"
        level="Easy"
        examples={[
          { input: "nums = [7, 2, 9, 4, 1], k = 2", output: "[1, 2]", why: "The two smallest values, in increasing order." },
          { input: "nums = [3, 3, 1], k = 3", output: "[1, 3, 3]", why: "k equals the length, so the answer is the whole array, sorted." },
        ]}
        hints={[<>Each pass of selection sort puts the next smallest value in its final place.</>, <>You only need k passes, not n.</>]}
        approaches={[
          {
            name: "k passes of selection sort",
            idea: <p>Run the outer loop of selection sort only k times. Then return the first k items.</p>,
            code: `function kSmallest(nums, k) {
  const a = [...nums];
  for (let i = 0; i < k; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[minIdx]) minIdx = j;
    }
    [a[i], a[minIdx]] = [a[minIdx], a[i]];
  }
  return a.slice(0, k);
}

console.log(kSmallest([7, 2, 9, 4, 1], 2)); // [ 1, 2 ]
console.log(kSmallest([3, 3, 1], 3));       // [ 1, 3, 3 ]`,
            explain: <p>O(n × k). This is good when k is tiny (say 3), and worse than sorting when k is large.</p>,
          },
          {
            name: "Sort, then slice",
            idea: <p>Sort a copy and take the first k.</p>,
            code: `function kSmallest(nums, k) {
  return [...nums].sort((a, b) => a - b).slice(0, k);
}

console.log(kSmallest([7, 2, 9, 4, 1], 2)); // [ 1, 2 ]`,
            explain: <p>O(n log n), whatever k is.</p>,
          },
        ]}
        compare={<p>Compare n × k with n log n. For n = 10<sup>6</sup>, log n is about 20, so selection passes win only when k &lt; 20. Lesson 46 gives an O(n log k) answer with a heap (a structure that always gives you the smallest or largest item quickly).</p>}
      >
        <p>Return the <code>k</code> smallest values of <code>nums</code> in increasing order.</p>
      </Problem>

      <Problem
        n={4}
        title="How many swaps does bubble sort make?"
        level="Medium"
        examples={[
          { input: "[3, 1, 2]", output: "2", why: "3↔1 gives [1, 3, 2], then 3↔2 gives [1, 2, 3]." },
          { input: "[5, 3, 8, 1, 4]", output: "6", why: "3 swaps in the first pass, 2 in the second, 1 in the third (see the dry run in the lesson)." },
          { input: "[1, 2, 3]", output: "0", why: "Already sorted." },
        ]}
        hints={[
          <>You could run bubble sort and count the swaps. Is there a way to get the number without sorting?</>,
          <>Each swap of neighbours fixes exactly one pair (i, j) with i &lt; j and nums[i] &gt; nums[j]. Such a pair, where a bigger number comes before a smaller one, is called an <em>inversion</em>.</>,
        ]}
        approaches={[
          {
            name: "Simulate and count",
            idea: <p>Run bubble sort on a copy and add 1 to a counter for every swap.</p>,
            code: `function bubbleSwaps(nums) {
  const a = [...nums];
  let swaps = 0;
  for (let pass = 0; pass < a.length - 1; pass++) {
    for (let j = 0; j < a.length - 1 - pass; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
      }
    }
  }
  return swaps;
}

console.log(bubbleSwaps([3, 1, 2]));       // 2
console.log(bubbleSwaps([5, 3, 8, 1, 4])); // 6`,
            explain: <p>O(n²) time.</p>,
          },
          {
            name: "Count the inversions",
            idea: <p>Count every pair i &lt; j with nums[i] &gt; nums[j]. Each such pair needs exactly one swap of neighbours to fix, and each swap fixes exactly one pair.</p>,
            code: `function bubbleSwaps(nums) {
  let inversions = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] > nums[j]) inversions++;
    }
  }
  return inversions;
}

console.log(bubbleSwaps([3, 1, 2]));       // 2
console.log(bubbleSwaps([5, 3, 8, 1, 4])); // 6
console.log(bubbleSwaps([1, 2, 3]));       // 0`,
            explain: (
              <DryRun
                title="inversions in [5, 3, 8, 1, 4]"
                cols={["Bigger value first", "Pairs"]}
                rows={[
                  ["5", "(5, 3), (5, 1), (5, 4)"],
                  ["3", "(3, 1)"],
                  ["8", "(8, 1), (8, 4)"],
                ]}
                note="6 inversions = 6 swaps."
              />
            ),
          },
        ]}
        compare={<p>Both are O(n²), but Approach 2 explains <em>why</em> the answer is that number. Lesson 17 counts inversions in O(n log n) by changing merge sort slightly.</p>}
      >
        <p>Return how many swaps bubble sort makes to sort <code>nums</code>.</p>
      </Problem>

      <Problem
        n={5}
        title="A stable sort with a comparator"
        level="Medium"
        examples={[
          {
            input: `[{Asha, B}, {Ben, A}, {Chen, B}, {Dara, A}]`,
            output: "Ben, Dara, Asha, Chen",
            why: "Sorted by grade. Ben comes before Dara, and Asha before Chen, as in the input.",
          },
        ]}
        hints={[
          <>Write an insertion sort that takes a function <code>cmp(a, b)</code>. The function returns a negative number, zero or a positive number, in the same way as the function you give to JavaScript&apos;s <code>sort</code>. (A negative number means a comes first, zero means they are equal, and a positive number means b comes first.)</>,
          <>To stay stable, shift an item only when it is <em>strictly</em> greater than the key (greater, not equal).</>,
        ]}
        approaches={[
          {
            name: "Insertion sort with cmp",
            idea: <p>Replace <code>arr[j] &gt; key</code> with <code>cmp(arr[j], key) &gt; 0</code>.</p>,
            code: `function insertionSort(arr, cmp) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && cmp(arr[j], key) > 0) {   // strictly greater: equal items never pass each other
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

const students = [
  { name: "Asha", grade: "B" },
  { name: "Ben", grade: "A" },
  { name: "Chen", grade: "B" },
  { name: "Dara", grade: "A" },
];
insertionSort(students, (a, b) => a.grade.localeCompare(b.grade));
console.log(students.map((s) => s.name).join(", ")); // Ben, Dara, Asha, Chen`,
            explain: <p>If the condition were <code>&gt;= 0</code>, equal items would jump over each other and the sort would become unstable. Chen would end up before Asha. One character decides stability.</p>,
          },
        ]}
        compare={<p>Real sorting functions work with a comparator in this way, and the next two lessons do the same.</p>}
      >
        <p>Write a <strong>stable</strong> sort that accepts a comparison function, and use it to sort students by grade.</p>
      </Problem>

      <Problem
        n={6}
        title="Sort an array (large input)"
        level="Medium"
        examples={[
          { input: "[5, 2, 3, 1]", output: "[1, 2, 3, 5]", why: "Plain ascending order." },
          { input: "[5, 1, 1, 2, 0, 0]", output: "[0, 0, 1, 1, 2, 5]", why: "Duplicates stay." },
        ]}
        hints={[
          <>Read the constraints: up to 5 × 10<sup>4</sup> values. Is O(n²) fast enough? (See Lesson 12.)</>,
          <>Values are between −5 × 10<sup>4</sup> and 5 × 10<sup>4</sup>, a range of about 10<sup>5</sup>. Add a fixed number to every value so that the smallest value maps to index 0.</>,
        ]}
        approaches={[
          {
            name: "Insertion sort",
            idea: <p>The algorithm from this lesson.</p>,
            code: `function sortArray(nums) {
  for (let i = 1; i < nums.length; i++) {
    const key = nums[i];
    let j = i - 1;
    while (j >= 0 && nums[j] > key) {
      nums[j + 1] = nums[j];
      j--;
    }
    nums[j + 1] = key;
  }
  return nums;
}

console.log(sortArray([5, 2, 3, 1])); // [ 1, 2, 3, 5 ]`,
            explain: <p>This is correct, but it is O(n²). For 5 × 10<sup>4</sup> values in reverse order, that is over a billion shifts. It fails LeetCode&apos;s time limit, which is the point of the question.</p>,
          },
          {
            name: "Counting sort over the value range",
            idea: <p>Count each value at index <code>value + 50000</code>, then write the values back into the array in order.</p>,
            code: `function sortArray(nums) {
  const OFFSET = 50000;
  const count = new Array(100001).fill(0);
  for (const x of nums) count[x + OFFSET]++;

  let i = 0;
  for (let v = 0; v < count.length; v++) {
    while (count[v]-- > 0) nums[i++] = v - OFFSET;
  }
  return nums;
}

console.log(sortArray([5, 2, 3, 1]));       // [ 1, 2, 3, 5 ]
console.log(sortArray([5, 1, 1, 2, 0, 0])); // [ 0, 0, 1, 1, 2, 5 ]
console.log(sortArray([-3, 4, -50000]));    // [ -50000, -3, 4 ]`,
            explain: <p>O(n + range) time and O(range) space. The offset (the fixed number we add) makes negative values fit as array indexes.</p>,
          },
          {
            name: "Built-in sort",
            idea: <p>Use JavaScript&apos;s sort with a numeric comparator.</p>,
            code: `function sortArray(nums) {
  return nums.sort((a, b) => a - b);
}

console.log(sortArray([5, 1, 1, 2, 0, 0])); // [ 0, 0, 1, 1, 2, 5 ]`,
            explain: <p>O(n log n). In a real interview the interviewer would often forbid this. The next two lessons build merge sort and quick sort to replace it.</p>,
          },
        ]}
        compare={<p>What to learn here: simple sorts are O(n²) and too slow for large inputs. Counting sort is a valid O(n) answer when the range is small. Otherwise you need an O(n log n) sort. (LeetCode 912.)</p>}
      >
        <p>Sort <code>nums</code> in ascending order. Constraints: up to 5 × 10<sup>4</sup> values, each between −5 × 10<sup>4</sup> and 5 × 10<sup>4</sup>.</p>
      </Problem>
    </>
  );
}
