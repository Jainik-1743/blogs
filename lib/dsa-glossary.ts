import type { Glossary, GlossaryEntry } from "./glossary";

/**
 * Every term the DSA series leans on, with a one-line meaning and the lesson that explains it.
 * Hovering (or tapping) any of these inside a /dsa lesson shows the entry in place; the full
 * list is rendered at /dsa/glossary.
 *
 * Capitalised terms (DSA, REPL …) are marked everywhere they appear. Lowercase ones
 * (dry run, accumulator …) are marked only on their first use per page.
 */
const ENTRIES: GlossaryEntry[] = [
  // ── Basics ─────────────────────────────────────────────────────────────
  { term: "DSA", full: "Data Structures and Algorithms", desc: "Data structures are ways to store data (arrays, maps, trees); algorithms are step-by-step methods to solve a problem with them. Coding interviews test both.", lesson: 1, group: "Basics" },
  { term: "Node.js", full: "Node.js", desc: "A program that runs JavaScript outside the browser. You type node file.js in a terminal and it runs the file.", lesson: 1, group: "Basics" },
  { term: "REPL", full: "Read–Eval–Print Loop", desc: "The interactive prompt you get by typing node with no file, or the browser console: type one line, see the result immediately.", lesson: 1, group: "Basics" },
  { term: "statement", aliases: ["statements"], full: "Statement", desc: "One instruction, usually one line ending in a semicolon. A program is a list of statements run from top to bottom.", lesson: 1, group: "Basics" },
  { term: "dry run", aliases: ["Dry run", "dry-run", "Dry-run"], full: "Dry run", desc: "Running code by hand on paper: write down every variable after every line. The single best way to understand loops and find bugs.", lesson: 1, group: "Basics" },
  { term: "variable", aliases: ["variables"], full: "Variable", desc: "A named box that holds a value. let creates one you can change; const creates one you cannot reassign.", lesson: 2, group: "Basics" },
  { term: "data type", aliases: ["data types", "Data types"], full: "Data type", desc: "The kind of value: number, string, boolean, undefined, null, object. typeof tells you which one you have.", lesson: 2, group: "Basics" },
  { term: "operator", aliases: ["operators"], full: "Operator", desc: "A symbol that does something to values: + - * / % for maths, === and < for comparing, && and || for combining true/false.", lesson: 2, group: "Basics" },
  { term: "modulo", aliases: ["remainder operator"], full: "Modulo (%)", desc: "a % b is the remainder after dividing a by b. n % 2 === 0 means n is even; n % 10 is the last digit of n.", lesson: 2, group: "Basics" },
  { term: "boolean", aliases: ["booleans"], full: "Boolean", desc: "A value that is either true or false. Every condition in an if or a loop is turned into a boolean.", lesson: 3, group: "Basics" },
  // ── Loops ──────────────────────────────────────────────────────────────
  { term: "iteration", aliases: ["iterations"], full: "Iteration", desc: "One pass through the body of a loop. A loop that runs 5 times has 5 iterations.", lesson: 4, group: "Loops" },
  { term: "loop variable", full: "Loop variable", desc: "The counter a loop changes on every iteration, usually called i. It decides when the loop stops.", lesson: 4, group: "Loops" },
  { term: "accumulator", aliases: ["accumulators"], full: "Accumulator", desc: "A variable that collects a result across iterations — start it at 0 (for a sum) or 1 (for a product), then add or multiply inside the loop.", lesson: 4, group: "Loops" },
  { term: "off-by-one", aliases: ["off by one", "Off-by-one"], full: "Off-by-one error", desc: "A loop that runs one time too many or too few, usually from < vs <= or starting at 0 vs 1. The most common loop bug.", lesson: 4, group: "Loops" },
  { term: "infinite loop", aliases: ["infinite loops"], full: "Infinite loop", desc: "A loop whose condition never becomes false, so it never stops. Usually the update step is missing or moves the wrong way.", lesson: 5, group: "Loops" },
  { term: "nested loop", aliases: ["nested loops", "Nested loops"], full: "Nested loop", desc: "A loop inside another loop. The inner loop runs completely for every single iteration of the outer one — think rows and columns.", lesson: 6, group: "Loops" },
  // ── Functions ──────────────────────────────────────────────────────────
  { term: "function", aliases: ["functions"], full: "Function", desc: "A named, reusable block of code. It takes inputs (parameters) and gives back a result with return.", lesson: 7, group: "Functions" },
  { term: "parameter", aliases: ["parameters"], full: "Parameter", desc: "The name a function uses for an input, written in its definition: function add(a, b) has parameters a and b.", lesson: 7, group: "Functions" },
  { term: "argument", aliases: ["arguments"], full: "Argument", desc: "The actual value passed in when you call a function: in add(2, 3), 2 and 3 are the arguments.", lesson: 7, group: "Functions" },
  { term: "return value", full: "Return value", desc: "What a function gives back to whoever called it. Without a return statement a function gives back undefined.", lesson: 7, group: "Functions" },
  // ── Collections ────────────────────────────────────────────────────────
  { term: "array", aliases: ["arrays"], full: "Array", desc: "An ordered list of values in one variable. Positions are numbered from 0, so the last index is length − 1.", lesson: 8, group: "Collections" },
  { term: "index", aliases: ["indices", "indexes"], full: "Index", desc: "The position number of an item in an array or string, starting at 0.", lesson: 8, group: "Collections" },
  { term: "linear search", full: "Linear search", desc: "Checking items one by one from the start until you find what you want. Simple, and the baseline every faster search is compared with.", lesson: 8, group: "Collections" },
  { term: "string", aliases: ["strings"], full: "String", desc: "Text. In JavaScript a string behaves like a read-only array of characters: s[0], s.length — but s[0] = 'x' does nothing.", lesson: 9, group: "Collections" },
  { term: "palindrome", aliases: ["palindromes"], full: "Palindrome", desc: "Something that reads the same forwards and backwards: \"level\", \"madam\", the number 121.", lesson: 9, group: "Collections" },
  { term: "immutable", full: "Immutable", desc: "Cannot be changed after it is created. JavaScript strings are immutable — every change makes a new string.", lesson: 9, group: "Collections" },
  { term: "key–value", aliases: ["key-value"], full: "Key–value pair", desc: "One entry in an object or Map: a key (like a word) and the value stored under it (like its count).", lesson: 10, group: "Collections" },
  { term: "frequency map", aliases: ["frequency maps", "Frequency map"], full: "Frequency map", desc: "A Map from each item to how many times it appears. Behind a huge share of interview questions: duplicates, anagrams, most frequent.", lesson: 10, group: "Collections" },
  { term: "Set", once: true, full: "Set", desc: "A collection that keeps each value only once and answers “is this in here?” instantly with has().", lesson: 10, group: "Collections" },
];

export const DSA_GLOSSARY: Glossary = {
  series: "dsa",
  seriesTitle: "DSA for Interviews, From Zero",
  groups: ["Basics", "Loops", "Functions", "Collections"],
  entries: ENTRIES,
};
