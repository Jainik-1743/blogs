import type { AccentName } from "./accents";
import type { Lesson } from "./lessons";

/**
 * Accent colour for every /dsa page. "emerald" keeps the series distinct from DevOps
 * (violet), JavaScript (sky) and System Design (orange); any name from lib/accents.ts works.
 */
export const DSA_ACCENT: AccentName = "emerald";

export const DSA_SERIES = {
  slug: "dsa",
  title: "DSA for Interviews, From Zero",
  tagline:
    "Data structures and algorithms for coding interviews, starting from the very first loop. Every idea is traced step by step and then practised on interview-style questions with full answers, so that it stays with you long term.",
  started: "2026",
  accent: DSA_ACCENT,
};

/** The series is split into parts, like chapters of a book. Lessons are grouped by number. */
export type DsaPart = { number: number; title: string; blurb: string; from: number; to: number };

export const DSA_PARTS: DsaPart[] = [
  { number: 1, title: "Programming From Zero", blurb: "Variables, conditions, for and while loops, functions, arrays, strings and maps — in JavaScript, traced line by line.", from: 1, to: 10 },
  { number: 2, title: "Thinking Like a Problem-Solver", blurb: "Reading a problem, Big-O, basic maths, your first recursion and counting with a hash map.", from: 11, to: 15 },
  { number: 3, title: "Sorting", blurb: "Selection, bubble and insertion sort to understand sorting; merge and quick sort to use it.", from: 16, to: 18 },
  { number: 4, title: "Arrays and the First Patterns", blurb: "Prefix sums, two pointers, sliding windows, Kadane's algorithm and matrices.", from: 19, to: 25 },
  { number: 5, title: "Hashing Patterns", blurb: "Two Sum, the “seen before?” technique, frequency maps and grouping.", from: 26, to: 27 },
  { number: 6, title: "Binary Search", blurb: "Halving a sorted array, then binary search on the answer.", from: 28, to: 29 },
  { number: 7, title: "Strings", blurb: "Palindromes, reversing, counting and substring windows.", from: 30, to: 31 },
  { number: 8, title: "Recursion and Backtracking", blurb: "Recursion trees, subsets, permutations and standard backtracking problems.", from: 32, to: 34 },
  { number: 9, title: "Linked Lists", blurb: "Build one, reverse it, and the fast/slow pointer pattern.", from: 35, to: 37 },
  { number: 10, title: "Stacks and Queues", blurb: "Valid parentheses, queues, deques and the monotonic stack.", from: 38, to: 40 },
  { number: 11, title: "Trees", blurb: "Traversals, BFS and DFS on trees, binary search trees, LCA.", from: 41, to: 45 },
  { number: 12, title: "Heaps, Greedy and Intervals", blurb: "Top-K with heaps, greedy choices and interval merging.", from: 46, to: 48 },
  { number: 13, title: "Graphs", blurb: "Storing graphs, BFS/DFS, topological sort, shortest paths, union-find.", from: 49, to: 53 },
  { number: 14, title: "Dynamic Programming", blurb: "From recursion to memoisation, then 1-D, 2-D and string DP.", from: 54, to: 57 },
  { number: 15, title: "Extras and the Interview", blurb: "Tries, bit tricks, the interview playbook and a revision plan.", from: 58, to: 60 },
];

/** A lesson as listed in the series, plus the part it belongs to and what it covers. */
export type DsaLesson = Lesson & {
  part: number;
  /** The subtopics the lesson teaches, in order. */
  topics: string[];
  /** Key LeetCode problems for this lesson, as "number. Title". */
  leetcode: string[];
};

const partOf = (n: number) => DSA_PARTS.find((p) => n >= p.from && n <= p.to)!.number;

type Row = {
  title: string;
  summary: string;
  readTime?: string;
  topics: string[];
  leetcode?: string[];
};

/*
 * The curriculum. Order and subtopics were cross-checked against the most widely used free
 * resources: Hello-Algo (krahets/hello-algo), trekhleb/javascript-algorithms, the Tech
 * Interview Handbook (yangshun/tech-interview-handbook), coding-interview-university,
 * labuladong's algorithm notes, the NeetCode roadmap and Striver's A2Z sheet.
 */
const ROWS: Row[] = [
  // ── Part 1 — Programming from zero ─────────────────────────────────────
  {
    title: "What a Program Is, and How to Run One",
    summary: "A program is a list of instructions run top to bottom. Run your first JavaScript, read its output, and learn to predict exactly what prints.",
    readTime: "12 min",
    topics: ["What a program and a statement are", "Running JavaScript: browser console, Node.js, a .js file", "console.log and printing several values", "Top-to-bottom execution order", "Comments", "Reading errors: SyntaxError, ReferenceError, TypeError", "The dry-run habit: predict, then run"],
  },
  {
    title: "Variables and Data Types",
    summary: "Named boxes for values: numbers, strings and booleans, and the operators that combine them — including % and Math.floor, which appear in almost every DSA problem.",
    readTime: "16 min",
    topics: ["let and const", "Naming rules and camelCase", "number, string, boolean, undefined, null and typeof", "Arithmetic operators and their order", "% (remainder) and Math.floor (whole division)", "Useful Math functions: abs, min, max, round, sqrt", "Joining text and template literals", "Converting between text and numbers", "Shorthand operators: +=, ++"],
  },
  {
    title: "Conditions: if / else",
    summary: "Teach the program to make decisions. Comparisons, && and ||, else-if chains, and common questions: even or odd, largest of three, leap year.",
    readTime: "18 min",
    topics: ["Comparison operators and === vs ==", "if, else and else-if chains", "Logical operators &&, || and !", "Short-circuit evaluation", "Truthy and falsy values", "The ternary operator ? :", "The switch statement", "Testing boundary values"],
    leetcode: ["1491. Average Salary Excluding the Minimum and Maximum Salary"],
  },
  {
    title: "The for Loop",
    summary: "The most important idea in this series. Start, condition and update, traced step by step with a dry-run table until the pattern is clear.",
    readTime: "22 min",
    topics: ["Why loops exist", "The three parts: start, check, update", "The exact order of execution", "Counting up, down and in steps", "How many times a loop runs", "The accumulator pattern: sum, product, count", "Flags, break and continue", "Off-by-one errors and how to avoid them"],
    leetcode: ["412. Fizz Buzz", "509. Fibonacci Number", "1342. Number of Steps to Reduce a Number to Zero"],
  },
  {
    title: "The while Loop",
    summary: "Repeat while a condition is true. Taking a number apart digit by digit, and a clear rule for choosing between for and while.",
    readTime: "18 min",
    topics: ["while syntax and the order of execution", "The digit loop: n % 10 and Math.floor(n / 10)", "Building a number digit by digit (reverse)", "Infinite loops and how to avoid them", "do … while", "Choosing between for and while"],
    leetcode: ["9. Palindrome Number", "7. Reverse Integer", "1295. Find Numbers with Even Number of Digits", "258. Add Digits"],
  },
  {
    title: "Nested Loops and Patterns",
    summary: "A loop inside a loop is a grid: rows outside, columns inside. Built up with star and number patterns until you can draw any shape.",
    readTime: "20 min",
    topics: ["The grid model: rows and columns", "Building a row, then printing it", "Inner limits that depend on the outer variable", "A three-question recipe for any pattern", "Triangles, pyramids and hollow shapes", "Counting pairs, and how much work nested loops do"],
    leetcode: ["118. Pascal's Triangle", "1672. Richest Customer Wealth"],
  },
  {
    title: "Functions",
    summary: "Package a piece of logic, give it inputs and get a result back. The difference between return and console.log, and why every interview answer is a function.",
    readTime: "18 min",
    topics: ["Defining and calling functions", "Parameters, arguments and default values", "return vs console.log", "Scope: variables inside stay inside", "Early return", "Arrow functions", "Passing values vs passing references", "Helper functions and the LeetCode answer format"],
    leetcode: ["204. Count Primes", "231. Power of Two", "1979. Find Greatest Common Divisor of Array"],
  },
  {
    title: "Arrays",
    summary: "Many values in one variable, numbered from 0. Reading, updating, looping and the first real interview questions on arrays.",
    readTime: "24 min",
    topics: ["Indexes, length, reading and updating", "Looping: index loop and for…of", "push, pop, shift and unshift", "Four core patterns: accumulate, best so far, count, search", "Linear search", "References and copying arrays", "Built-in methods: includes, indexOf, slice, splice, sort, map, filter, reduce", "Edge cases: empty, one element, duplicates"],
    leetcode: ["1480. Running Sum of 1d Array", "26. Remove Duplicates from Sorted Array", "283. Move Zeroes", "485. Max Consecutive Ones"],
  },
  {
    title: "Strings",
    summary: "Text behaves like an array of characters that cannot be changed in place. Looping over characters, reversing, palindromes and counting.",
    readTime: "20 min",
    topics: ["Indexing and length", "Immutability: building new strings", "Looping over characters", "Character checks and character codes", "Common methods: toLowerCase, trim, includes, indexOf, slice, split, join", "Two pointers on a string", "Edge cases: empty strings, case, spaces"],
    leetcode: ["344. Reverse String", "125. Valid Palindrome", "58. Length of Last Word", "151. Reverse Words in a String"],
  },
  {
    title: "Objects, Map and Set",
    summary: "Look values up by name instead of by position. The counting pattern behind a large share of interview questions.",
    readTime: "20 min",
    topics: ["Objects: records with named fields", "Map: set, get, has, delete, size", "The frequency-map pattern", "Set: add, has and uniqueness", "Why lookups are fast", "Arrays of objects", "Choosing between array, object, Map and Set"],
    leetcode: ["217. Contains Duplicate", "242. Valid Anagram", "387. First Unique Character in a String", "383. Ransom Note", "1. Two Sum"],
  },

  // ── Part 2 — Thinking like a problem-solver ────────────────────────────
  {
    title: "How to Read a Problem",
    summary: "Input, output, constraints, examples and edge cases — and solving it by hand before writing any code.",
    readTime: "20 min",
    topics: ["Inputs, outputs and constraints", "Working through the examples by hand", "Listing edge cases", "Brute force first, then improve", "A step-by-step method for every problem", "Explaining your thinking out loud"],
    leetcode: ["268. Missing Number", "1464. Maximum Product of Two Elements in an Array", "414. Third Maximum Number", "389. Find the Difference", "1512. Number of Good Pairs"],
  },
  {
    title: "Big-O: Counting the Steps",
    summary: "How many times does the loop run? Reading time and space complexity from code, and from the constraints of a problem.",
    readTime: "24 min",
    topics: ["Why we count steps, not seconds", "O(1), O(n), O(n²), O(log n), O(n log n)", "Dropping constants and smaller terms", "Space complexity", "Best, average and worst case", "Reading the constraints to choose an approach"],
    leetcode: ["1346. Check If N and Its Double Exist", "349. Intersection of Two Arrays", "448. Find All Numbers Disappeared in an Array", "1295. Find Numbers with Even Number of Digits"],
  },
  {
    title: "Basic Maths for DSA",
    summary: "Digits, divisors, primes, the sieve, GCD and LCM, and fast powers.",
    readTime: "26 min",
    topics: ["Digit problems revisited", "All divisors in √n steps", "Prime check and the Sieve of Eratosthenes", "GCD and LCM with Euclid", "Remainders and modular arithmetic", "Fast exponentiation"],
    leetcode: ["1979. Find Greatest Common Divisor of Array", "1952. Three Divisors", "202. Happy Number", "263. Ugly Number", "204. Count Primes", "2523. Closest Prime Numbers in Range", "50. Pow(x, n)"],
  },
  {
    title: "Recursion Basics",
    summary: "A function that calls itself, a base case that stops it, and the call stack underneath.",
    readTime: "24 min",
    topics: ["Base case and recursive case", "The call stack during recursion", "Printing 1 to N and N to 1", "Sum and factorial", "Recursion on arrays and strings", "Multiple recursive calls: Fibonacci", "Stack overflow and recursion vs loops"],
    leetcode: ["509. Fibonacci Number", "344. Reverse String", "231. Power of Two"],
  },
  {
    title: "Basic Hashing",
    summary: "Counting with arrays and maps, how a hash table works inside, and why lookup becomes instant.",
    readTime: "24 min",
    topics: ["Counting with an array (fixed range, 26 letters)", "Counting with a Map (any values)", "Answering frequency queries", "Highest and lowest frequency", "How a hash table works: hash function, buckets, collisions"],
    leetcode: ["1512. Number of Good Pairs", "1365. How Many Numbers Are Smaller Than the Current Number", "2351. First Letter to Appear Twice", "1941. Check if All Characters Have Equal Number of Occurrences", "451. Sort Characters By Frequency", "706. Design HashMap"],
  },

  // ── Part 3 — Sorting ───────────────────────────────────────────────────
  {
    title: "Selection, Bubble and Insertion Sort",
    summary: "Three simple sorts that show what sorting really does.",
    readTime: "22 min",
    topics: ["What sorting means, and stability", "Selection sort", "Bubble sort and the early-exit improvement", "Insertion sort and nearly sorted data", "Comparing the three"],
    leetcode: ["1051. Height Checker", "912. Sort an Array"],
  },
  {
    title: "Merge Sort",
    summary: "Split, sort the halves, merge — divide and conquer.",
    readTime: "24 min",
    topics: ["Divide and conquer", "Merging two sorted arrays", "The recursion tree", "Why it is O(n log n)", "Extra space and stability", "Counting inversions (preview)"],
    leetcode: ["88. Merge Sorted Array", "977. Squares of a Sorted Array", "350. Intersection of Two Arrays II", "912. Sort an Array"],
  },
  {
    title: "Quick Sort, and When to Just Use .sort()",
    summary: "Partitioning around a pivot, quickselect, and sorting numbers and objects correctly in JavaScript.",
    readTime: "26 min",
    topics: ["Partitioning around a pivot", "Quick sort and pivot choice", "Worst case and how to avoid it", "Quickselect for the k-th element", "JavaScript's .sort(): the default text order and comparators", "Sorting objects by a key"],
    leetcode: ["215. Kth Largest Element in an Array", "75. Sort Colors", "1636. Sort Array by Increasing Frequency", "2418. Sort the People", "179. Largest Number", "2161. Partition Array According to Given Pivot", "912. Sort an Array"],
  },

  // ── Part 4 — Arrays and the first patterns ─────────────────────────────
  {
    title: "Array Traversal Problems",
    summary: "Largest and second largest, rotating, moving zeros, missing numbers and more — the problems every array round starts with.",
    readTime: "22 min",
    topics: ["Largest and second largest", "Checking if an array is sorted", "Removing duplicates in place", "Rotating by k (the reversal method)", "Moving zeros", "Missing number and single number", "Union and intersection of sorted arrays"],
    leetcode: ["26. Remove Duplicates from Sorted Array", "27. Remove Element", "283. Move Zeroes", "189. Rotate Array", "136. Single Number", "1752. Check if Array Is Sorted and Rotated", "268. Missing Number"],
  },
  {
    title: "Prefix Sum",
    summary: "Pre-compute running totals so that any range sum is instant.",
    readTime: "24 min",
    topics: ["Running sums", "Range sum queries", "Pivot index", "Prefix and suffix products", "Subarray sum equals k (prefix sum + Map)"],
    leetcode: ["1480. Running Sum of 1d Array", "303. Range Sum Query - Immutable", "724. Find Pivot Index", "238. Product of Array Except Self", "560. Subarray Sum Equals K", "525. Contiguous Array", "974. Subarray Sums Divisible by K"],
  },
  {
    title: "Two Pointers",
    summary: "Two indices moving towards each other or in the same direction — pair sums, reversing, removing duplicates, 3Sum.",
    readTime: "26 min",
    topics: ["Pointers from both ends", "Pair sum in a sorted array", "Same-direction pointers (read and write)", "3Sum", "Container with most water", "Three-way partition (Dutch national flag)"],
    leetcode: ["167. Two Sum II - Input Array Is Sorted", "345. Reverse Vowels of a String", "392. Is Subsequence", "15. 3Sum", "16. 3Sum Closest", "11. Container With Most Water", "881. Boats to Save People", "75. Sort Colors"],
  },
  {
    title: "Sliding Window: Fixed Size",
    summary: "Reuse the last window's work instead of recomputing it.",
    readTime: "20 min",
    topics: ["From brute force to a sliding window", "Maximum sum of k elements", "Averages of every window", "Counting with a window (vowels, matches)"],
    leetcode: ["643. Maximum Average Subarray I", "1456. Maximum Number of Vowels in a Substring of Given Length", "1343. Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold", "2090. K Radius Subarray Averages", "1052. Grumpy Bookstore Owner", "219. Contains Duplicate II"],
  },
  {
    title: "Sliding Window: Variable Size",
    summary: "Grow and shrink a window to find the longest or shortest answer.",
    readTime: "26 min",
    topics: ["The grow-and-shrink template", "Longest window with a condition", "Shortest window with a condition", "“At most k” problems"],
    leetcode: ["209. Minimum Size Subarray Sum", "3. Longest Substring Without Repeating Characters", "1004. Max Consecutive Ones III", "904. Fruit Into Baskets", "1493. Longest Subarray of 1s After Deleting One Element", "713. Subarray Product Less Than K", "992. Subarrays with K Different Integers"],
  },
  {
    title: "Kadane's Algorithm",
    summary: "The maximum subarray sum in a single pass, and the stock-trading problems built on the same idea.",
    readTime: "24 min",
    topics: ["Maximum subarray: brute force to one pass", "Returning the subarray itself", "Best time to buy and sell stock", "Maximum product subarray", "Circular subarrays"],
    leetcode: ["53. Maximum Subarray", "121. Best Time to Buy and Sell Stock", "122. Best Time to Buy and Sell Stock II", "152. Maximum Product Subarray", "918. Maximum Sum Circular Subarray", "1749. Maximum Absolute Sum of Any Subarray"],
  },
  {
    title: "2-D Arrays and Matrices",
    summary: "Rows and columns: transpose, rotate, spiral order, set zeroes and search a matrix.",
    readTime: "26 min",
    topics: ["Creating and looping over a matrix", "Row and column sums", "Transpose and rotate by 90°", "Spiral order", "Set matrix zeroes", "Searching a sorted matrix"],
    leetcode: ["1572. Matrix Diagonal Sum", "867. Transpose Matrix", "48. Rotate Image", "54. Spiral Matrix", "73. Set Matrix Zeroes", "74. Search a 2D Matrix", "240. Search a 2D Matrix II"],
  },

  // ── Part 5 — Hashing patterns ──────────────────────────────────────────
  {
    title: "Two Sum and “Seen Before?”",
    summary: "Trading memory for speed with a map of what you have already met.",
    readTime: "22 min",
    topics: ["Two Sum three ways: brute force, sort + two pointers, Map", "Duplicates within a distance k", "Longest consecutive sequence", "Counting subarrays with a Map"],
    leetcode: ["1. Two Sum", "219. Contains Duplicate II", "128. Longest Consecutive Sequence", "1679. Max Number of K-Sum Pairs", "523. Continuous Subarray Sum", "1248. Count Number of Nice Subarrays"],
  },
  {
    title: "Frequency Maps and Grouping",
    summary: "Anagrams, top frequencies, the majority element and grouping by a key.",
    readTime: "24 min",
    topics: ["Designing a good key", "Group anagrams", "Top k frequent (bucket idea)", "Majority element and Boyer–Moore voting", "Isomorphic strings"],
    leetcode: ["1207. Unique Number of Occurrences", "49. Group Anagrams", "347. Top K Frequent Elements", "169. Majority Element", "229. Majority Element II", "290. Word Pattern", "205. Isomorphic Strings"],
  },

  // ── Part 6 — Binary search ─────────────────────────────────────────────
  {
    title: "Binary Search on a Sorted Array",
    summary: "Halve the search space every step; first and last positions; rotated arrays.",
    readTime: "26 min",
    topics: ["The binary search template", "Avoiding infinite loops and off-by-one", "Lower bound and upper bound", "First and last occurrence", "Search insert position", "Rotated sorted arrays"],
    leetcode: ["704. Binary Search", "35. Search Insert Position", "34. Find First and Last Position of Element in Sorted Array", "278. First Bad Version", "33. Search in Rotated Sorted Array", "153. Find Minimum in Rotated Sorted Array", "162. Find Peak Element"],
  },
  {
    title: "Binary Search on the Answer",
    summary: "When the answer itself can be searched: square roots, eating speeds, shipping capacity.",
    readTime: "24 min",
    topics: ["Recognising a yes/no condition that flips once", "Square root", "Minimum speed and minimum capacity", "Minimising the largest part"],
    leetcode: ["69. Sqrt(x)", "875. Koko Eating Bananas", "1283. Find the Smallest Divisor Given a Threshold", "1011. Capacity To Ship Packages Within D Days", "410. Split Array Largest Sum", "1552. Magnetic Force Between Two Balls"],
  },

  // ── Part 7 — Strings ───────────────────────────────────────────────────
  {
    title: "String Patterns",
    summary: "Palindromes, reversing words, common prefixes, Roman numerals and compression.",
    topics: ["Palindromes: two pointers and expand around the centre", "Longest common prefix", "Roman numerals", "String compression", "Rotation check"],
    leetcode: ["14. Longest Common Prefix", "13. Roman to Integer", "5. Longest Palindromic Substring", "796. Rotate String", "443. String Compression"],
  },
  {
    title: "Substrings and Windows",
    summary: "Window techniques on text: no repeats, character replacement, anagrams and the minimum window.",
    topics: ["Longest substring without repeating characters", "Longest repeating character replacement", "Permutation in a string", "Find all anagrams", "Minimum window substring"],
    leetcode: ["3. Longest Substring Without Repeating Characters", "424. Longest Repeating Character Replacement", "567. Permutation in String", "438. Find All Anagrams in a String", "76. Minimum Window Substring"],
  },

  // ── Part 8 — Recursion and backtracking ────────────────────────────────
  {
    title: "Recursion Trees",
    summary: "Drawing the calls so recursion becomes easy to follow.",
    topics: ["Drawing a recursion tree", "Parameter-based vs return-based recursion", "Multiple recursive calls", "Fast power with recursion", "The cost of recursion (preview of memoisation)"],
    leetcode: ["50. Pow(x, n)", "779. K-th Symbol in Grammar", "509. Fibonacci Number"],
  },
  {
    title: "Subsets and Permutations",
    summary: "Pick or skip: generating every combination.",
    topics: ["The pick / skip decision", "All subsets", "Subsets with duplicates", "Permutations", "Combinations of size k", "Letter combinations of a phone number"],
    leetcode: ["78. Subsets", "90. Subsets II", "46. Permutations", "77. Combinations", "17. Letter Combinations of a Phone Number"],
  },
  {
    title: "Backtracking",
    summary: "Choose, explore, undo — combination sum, N-Queens, word search.",
    topics: ["The choose–explore–undo template", "Combination sum", "Palindrome partitioning", "Word search in a grid", "N-Queens"],
    leetcode: ["39. Combination Sum", "40. Combination Sum II", "131. Palindrome Partitioning", "79. Word Search", "51. N-Queens"],
  },

  // ── Part 9 — Linked lists ──────────────────────────────────────────────
  {
    title: "Building a Linked List",
    summary: "Nodes and pointers, built from scratch.",
    topics: ["Nodes and the next pointer", "Traversal and length", "Insert at head, tail and position", "Delete a node", "Doubly linked lists", "Arrays vs linked lists"],
    leetcode: ["707. Design Linked List", "203. Remove Linked List Elements", "237. Delete Node in a Linked List"],
  },
  {
    title: "Reverse and Fast/Slow Pointers",
    summary: "Reversing a list, finding the middle and detecting cycles.",
    topics: ["Reverse a list (iterative and recursive)", "Middle of a list", "Detect a cycle (Floyd's algorithm)", "Palindrome linked list", "Reverse part of a list"],
    leetcode: ["206. Reverse Linked List", "876. Middle of the Linked List", "141. Linked List Cycle", "234. Palindrome Linked List", "92. Reverse Linked List II"],
  },
  {
    title: "Merging and Cycle Problems",
    summary: "Merge sorted lists, find where a cycle starts, remove the nth node from the end.",
    topics: ["Dummy head nodes", "Merge two sorted lists", "Start of a cycle", "Remove the nth node from the end", "Intersection of two lists", "Add two numbers", "Reorder and sort a list"],
    leetcode: ["21. Merge Two Sorted Lists", "142. Linked List Cycle II", "19. Remove Nth Node From End of List", "160. Intersection of Two Linked Lists", "2. Add Two Numbers", "148. Sort List"],
  },

  // ── Part 10 — Stacks and queues ────────────────────────────────────────
  {
    title: "Stacks",
    summary: "Last in, first out — valid parentheses, a min stack and evaluating expressions.",
    topics: ["Stack operations with an array", "Valid parentheses", "Min stack", "Evaluating postfix expressions", "Decoding nested strings"],
    leetcode: ["20. Valid Parentheses", "155. Min Stack", "150. Evaluate Reverse Polish Notation", "394. Decode String", "844. Backspace String Compare"],
  },
  {
    title: "Queues and Deques",
    summary: "First in, first out, and a double-ended queue.",
    topics: ["Queue operations, and why shift() is slow", "Queue using two stacks", "Circular queue", "Deque", "Sliding window maximum with a deque"],
    leetcode: ["232. Implement Queue using Stacks", "225. Implement Stack using Queues", "622. Design Circular Queue", "239. Sliding Window Maximum"],
  },
  {
    title: "Monotonic Stack",
    summary: "Next greater element and its many forms: temperatures, stock spans, histograms, rain water.",
    topics: ["Next greater and next smaller element", "Circular arrays", "Daily temperatures", "Stock span", "Largest rectangle in a histogram", "Trapping rain water"],
    leetcode: ["496. Next Greater Element I", "503. Next Greater Element II", "739. Daily Temperatures", "901. Online Stock Span", "84. Largest Rectangle in Histogram", "42. Trapping Rain Water"],
  },

  // ── Part 11 — Trees ────────────────────────────────────────────────────
  {
    title: "Binary Trees and Traversals",
    summary: "Root, leaves and height; preorder, inorder and postorder — drawn and coded.",
    topics: ["Tree vocabulary", "Building nodes in JavaScript", "Preorder, inorder and postorder (recursive)", "Iterative traversals with a stack", "Maximum depth, same tree, invert a tree"],
    leetcode: ["144. Binary Tree Preorder Traversal", "94. Binary Tree Inorder Traversal", "145. Binary Tree Postorder Traversal", "104. Maximum Depth of Binary Tree", "226. Invert Binary Tree"],
  },
  {
    title: "Level Order (BFS) on Trees",
    summary: "Visiting a tree layer by layer with a queue.",
    topics: ["Level order with a queue", "Processing one level at a time", "Right side view", "Zigzag order", "Minimum depth"],
    leetcode: ["102. Binary Tree Level Order Traversal", "199. Binary Tree Right Side View", "103. Binary Tree Zigzag Level Order Traversal", "111. Minimum Depth of Binary Tree"],
  },
  {
    title: "DFS on Trees",
    summary: "Height, balance, diameter and path sums.",
    topics: ["Returning values up the tree", "Balanced tree", "Diameter", "Path sum", "Maximum path sum", "Symmetric tree and subtree"],
    leetcode: ["110. Balanced Binary Tree", "543. Diameter of Binary Tree", "112. Path Sum", "124. Binary Tree Maximum Path Sum", "101. Symmetric Tree"],
  },
  {
    title: "Binary Search Trees",
    summary: "Search, insert, delete, validate, and the k-th smallest value.",
    topics: ["The BST property", "Search and insert", "Delete", "Validate a BST", "K-th smallest with inorder", "Build a BST from a sorted array"],
    leetcode: ["700. Search in a Binary Search Tree", "701. Insert into a Binary Search Tree", "450. Delete Node in a BST", "98. Validate Binary Search Tree", "230. Kth Smallest Element in a BST"],
  },
  {
    title: "Lowest Common Ancestor and Building Trees",
    summary: "LCA in a binary tree and a BST, and rebuilding a tree from its traversals.",
    topics: ["LCA in a binary tree", "LCA in a BST", "Build a tree from preorder and inorder", "Serialise and deserialise a tree"],
    leetcode: ["236. Lowest Common Ancestor of a Binary Tree", "235. Lowest Common Ancestor of a Binary Search Tree", "105. Construct Binary Tree from Preorder and Inorder Traversal", "297. Serialize and Deserialize Binary Tree"],
  },

  // ── Part 12 — Heaps, greedy and intervals ──────────────────────────────
  {
    title: "Heaps and Top-K",
    summary: "A priority queue built by hand in JavaScript, and the top-K pattern.",
    topics: ["The heap property and its array form", "Push and pop: sift up and sift down", "Writing a MinHeap in JavaScript", "K-th largest and top k frequent", "Merge k sorted lists", "Median of a data stream"],
    leetcode: ["215. Kth Largest Element in an Array", "703. Kth Largest Element in a Stream", "347. Top K Frequent Elements", "973. K Closest Points to Origin", "23. Merge k Sorted Lists", "295. Find Median from Data Stream"],
  },
  {
    title: "Greedy Algorithms",
    summary: "When the best choice right now is also the best overall — and how to tell.",
    topics: ["What makes a problem greedy", "Assigning cookies and making change", "Jump game", "Gas station", "Choosing non-overlapping activities"],
    leetcode: ["455. Assign Cookies", "860. Lemonade Change", "55. Jump Game", "45. Jump Game II", "134. Gas Station"],
  },
  {
    title: "Interval Problems",
    summary: "Sort by start, then merge, insert and count overlaps.",
    topics: ["Sorting intervals", "Merge intervals", "Insert an interval", "Remove the fewest intervals", "Minimum arrows and meeting rooms"],
    leetcode: ["56. Merge Intervals", "57. Insert Interval", "435. Non-overlapping Intervals", "452. Minimum Number of Arrows to Burst Balloons"],
  },

  // ── Part 13 — Graphs ───────────────────────────────────────────────────
  {
    title: "What a Graph Is",
    summary: "Nodes, edges and the adjacency list.",
    topics: ["Vertices and edges; directed and undirected; weighted", "Adjacency list vs adjacency matrix", "Building a graph from an edge list", "Degree, paths and connected components", "Grids as graphs"],
    leetcode: ["1971. Find if Path Exists in Graph", "997. Find the Town Judge"],
  },
  {
    title: "Graph Traversal: BFS and DFS",
    summary: "Number of islands, flood fill, rotting oranges and cloning a graph.",
    topics: ["BFS with a queue and a visited set", "DFS, recursive and with a stack", "Connected components", "Grid traversal: islands and flood fill", "Multi-source BFS", "Cloning a graph"],
    leetcode: ["200. Number of Islands", "733. Flood Fill", "994. Rotting Oranges", "547. Number of Provinces", "133. Clone Graph"],
  },
  {
    title: "Topological Sort",
    summary: "Ordering tasks that depend on each other, and detecting cycles.",
    topics: ["Directed acyclic graphs", "Kahn's algorithm (in-degree)", "DFS-based ordering", "Cycle detection in directed graphs", "Course schedule"],
    leetcode: ["207. Course Schedule", "210. Course Schedule II"],
  },
  {
    title: "Shortest Paths",
    summary: "BFS for equal weights, Dijkstra for the rest, and Bellman–Ford for limits.",
    topics: ["BFS for unweighted graphs", "Dijkstra with a priority queue", "Shortest paths on a grid", "Bellman–Ford and limited stops"],
    leetcode: ["1091. Shortest Path in Binary Matrix", "743. Network Delay Time", "1631. Path With Minimum Effort", "787. Cheapest Flights Within K Stops"],
  },
  {
    title: "Union-Find",
    summary: "Grouping things fast: connected components, cycle detection and minimum spanning trees.",
    topics: ["Parent array and find", "Path compression", "Union by size or rank", "Connected components and redundant edges", "Kruskal's minimum spanning tree"],
    leetcode: ["547. Number of Provinces", "684. Redundant Connection", "721. Accounts Merge", "1584. Min Cost to Connect All Points"],
  },

  // ── Part 14 — Dynamic programming ──────────────────────────────────────
  {
    title: "Dynamic Programming From Recursion",
    summary: "Overlapping subproblems, memoisation, tabulation and saving space.",
    topics: ["Overlapping subproblems and optimal substructure", "Memoisation (top-down)", "Tabulation (bottom-up)", "Reducing space", "Climbing stairs and minimum cost"],
    leetcode: ["509. Fibonacci Number", "70. Climbing Stairs", "746. Min Cost Climbing Stairs"],
  },
  {
    title: "1-D Dynamic Programming",
    summary: "House robber, coin change, decode ways, word break and the longest increasing subsequence.",
    topics: ["Defining the state", "House robber I and II", "Coin change", "Decode ways", "Word break", "Longest increasing subsequence"],
    leetcode: ["198. House Robber", "213. House Robber II", "322. Coin Change", "91. Decode Ways", "139. Word Break", "300. Longest Increasing Subsequence"],
  },
  {
    title: "2-D Dynamic Programming",
    summary: "Grid paths and the 0/1 knapsack family.",
    topics: ["Grid paths", "Paths with obstacles and minimum path sum", "0/1 knapsack", "Partition equal subset sum", "Unbounded knapsack: coin change II"],
    leetcode: ["62. Unique Paths", "63. Unique Paths II", "64. Minimum Path Sum", "416. Partition Equal Subset Sum", "518. Coin Change II"],
  },
  {
    title: "DP on Strings",
    summary: "Longest common subsequence, edit distance and palindromic subsequences.",
    topics: ["Longest common subsequence", "Edit distance", "Longest palindromic subsequence", "LIS in O(n log n) with binary search"],
    leetcode: ["1143. Longest Common Subsequence", "72. Edit Distance", "516. Longest Palindromic Subsequence", "300. Longest Increasing Subsequence"],
  },

  // ── Part 15 — Extras and the interview ─────────────────────────────────
  {
    title: "Tries and Bit Manipulation",
    summary: "Prefix trees, and the bit tricks interviews ask.",
    topics: ["Trie: insert, search, startsWith", "Word dictionary with wildcards", "Bitwise operators: &, |, ^, <<, >>", "Checking and counting set bits", "Power of two and the single number", "Subsets with bitmasks"],
    leetcode: ["208. Implement Trie (Prefix Tree)", "211. Design Add and Search Words Data Structure", "136. Single Number", "191. Number of 1 Bits", "338. Counting Bits"],
  },
  {
    title: "The Interview Playbook",
    summary: "Clarify, plan, code, test — the 45 minutes, step by step.",
    topics: ["Clarifying questions", "Examples and edge cases out loud", "Brute force, then optimise", "Writing clean code under time pressure", "Testing with a dry run", "Stating time and space complexity", "Using hints well", "JavaScript-specific tips"],
  },
  {
    title: "Your Revision Plan",
    summary: "A pattern-recognition cheat sheet, a week-by-week plan and a recall checklist.",
    topics: ["Pattern recognition: from problem wording to technique", "A week-by-week practice plan", "Spaced repetition for problems", "Mock interviews"],
  },
];

/** Lessons with a page so far. Raise this as each part is written. */
const PUBLISHED_UP_TO = 60;

export const DSA_LESSONS: DsaLesson[] = ROWS.map((row, i) => {
  const number = i + 1;
  return {
    number,
    slug: `lesson-${number}`,
    title: row.title,
    summary: row.summary,
    readTime: row.readTime,
    published: number <= PUBLISHED_UP_TO,
    part: partOf(number),
    topics: row.topics,
    leetcode: row.leetcode ?? [],
  };
});

export function getDsaLesson(slug: string): DsaLesson {
  return DSA_LESSONS.find((l) => l.slug === slug)!;
}

export function dsaLessonHref(lesson: Lesson): string {
  return `/${DSA_SERIES.slug}/${lesson.slug}`;
}
