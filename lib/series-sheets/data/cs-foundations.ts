import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "cs-foundations" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "The machine under your JavaScript: memory, caches, floats, text, bits, counting, hard problems and string search. Numbers quoted from the lessons are **local measurements**, so say \"about\" in an interview.",
  sections: [
    {
      title: "How JavaScript runs (V8)",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "Pipeline: **parse**, bytecode (Ignition), then optional machine-code tiers (Sparkplug, Maglev, TurboFan).",
            "A **JIT** compiles hot code while the program runs, guessing types. A broken guess is a **deopt**: back to the interpreter.",
            "Keep types and object shapes stable in hot code. Profile before you worry.",
            "Local test: the same loop took 388 ms with the JIT and 2454 ms with `--jitless`.",
          ],
        },
        {
          kind: "table",
          head: ["Approach", "Good", "Bad"],
          rows: [
            ["Ahead-of-time (C, Rust)", "Fast to run", "Slow build, one binary per CPU"],
            ["Interpret", "Starts at once", "Slow per step"],
            ["JIT (V8, Java)", "Fast start, fast hot code", "Complex, spends memory and CPU"],
          ],
        },
      ],
    },
    {
      title: "Stack, heap and references",
      lesson: 0,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["Stack", "One frame per active call: arguments, locals, return place"],
            ["Heap", "Objects, arrays, closures. Variables hold references to them"],
            ["Stack overflow", "`RangeError`: about 12,500 frames (1 arg), 5,000 (6 args) locally"],
            ["Pass by value", "For objects the value is a reference (call by sharing)"],
            ["Garbage collection", "Frees what is unreachable from roots. A forgotten cache still leaks"],
            ["Typed array", "Flat bytes outside the JS heap. Several views can share one buffer"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "V8 has no tail call optimisation. A correct recursive DFS on 100,000 nodes can still crash. Use an explicit stack.",
        },
      ],
    },
    {
      title: "The memory pyramid",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Level", "Typical latency"],
          rows: [
            ["L1 cache (32 to 64 KB)", "about 1 ns"],
            ["L2 cache", "about 3 to 5 ns"],
            ["L3 cache (shared)", "about 10 to 40 ns"],
            ["RAM", "about 80 to 100 ns"],
            ["SSD random read", "about 10 to 100 microseconds"],
            ["Network, same data centre", "about 0.5 ms"],
            ["Network, across the world", "about 100 to 200 ms"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Remember the ratios, not the digits. Each level down is roughly 10 to 100 times slower.",
        },
      ],
    },
    {
      title: "Write cache-friendly code",
      lesson: 1,
      blocks: [
        {
          kind: "points",
          items: [
            "Memory loads in **64-byte cache lines**, so one `Float64Array` read brings 8 neighbours.",
            "**Spatial** locality: use neighbours. **Temporal** locality: reuse a value soon.",
            "4096 x 4096 matrix: 37 ms row by row, 314 ms column by column. A 512 KB matrix showed only 1.2x.",
            "Random access cost about 11 times sequential. One field of 2 million records: 4.5 ms struct of arrays, 21 ms array of objects.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "for (let r = 0; r < n; r++)\n  for (let c = 0; c < n; c++)\n    sum += m[r * n + c];",
          note: "Two O(n²) loops can differ 10 times; Big-O hides the memory pattern.",
        },
      ],
    },
    {
      title: "Floating point",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Double part", "Bits", "Job"],
          rows: [
            ["Sign", "1", "0 positive, 1 negative"],
            ["Exponent", "11", "Power of 2, bias 1023"],
            ["Mantissa", "52", "Digits after an implied leading 1"],
          ],
        },
        {
          kind: "points",
          items: [
            "`0.1 + 0.2` is `0.30000000000000004`: 1/10 is a repeating fraction in binary.",
            "Integers are exact up to `2**53 - 1`. Gaps between doubles grow with the size.",
            "`Number.EPSILON` is 2^-52, valid near 1 only.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "const near = (a, b, eps = 1e-9) =>\n  Math.abs(a - b) <=\n  eps * Math.max(1, Math.abs(a),\n                 Math.abs(b));",
        },
      ],
    },
    {
      title: "Float traps and money",
      lesson: 2,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["NaN", "Never equals itself. Use `Number.isNaN(x)`"],
            ["0 and -0", "`0 === -0` but `Object.is(0, -0)` is false"],
            ["(1.005).toFixed(2)", "\"1.00\": stored as 1.00499999999999989"],
            ["Math.floor((0.1+0.7)*10)", "7, not 8. Use `Math.round`"],
            ["Float addition", "Not associative: order changes last digits"],
            ["sort((a, b) => a - b)", "Breaks on NaN: the comparator returns NaN"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Money: integer cents, round once on the way in, give the remainder to a part when splitting. `BigInt` for huge values. IDs past 2^53 travel as strings.",
        },
      ],
    },
    {
      title: "Four sizes of a character",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Layer", "Counts", "Family emoji"],
          rows: [
            ["Grapheme cluster", "What the reader sees", "1"],
            ["Code point", "Unicode number", "5"],
            ["UTF-16 unit", "`length`, `[i]`, `slice`", "8"],
            ["UTF-8 byte", "File or network size", "18"],
          ],
        },
        {
          kind: "points",
          items: [
            "`\"😀\".length` is 2 (surrogate pair). `[...s]` goes by code point, `Intl.Segmenter` by grapheme.",
            "UTF-8 uses 1 to 4 bytes: `0xxxxxxx`, `110xxxxx 10xxxxxx`, and so on. ASCII is unchanged.",
          ],
        },
      ],
    },
    {
      title: "Text: normalise, sort, cut",
      lesson: 3,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["s.normalize(\"NFC\")", "Compare and store text in this form"],
            ["NFKC", "Loose match only: `ﬁ` to `fi`, `①` to `1`. Loses data"],
            ["new Intl.Collator(loc)", "Sort for users. Default `sort()` uses code units"],
            ["TextDecoder fatal: true", "Throw on bad bytes instead of silent U+FFFD"],
            ["s.isWellFormed()", "False when a lone surrogate exists"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Mojibake (`cafÃ©`) is a wrong decode: fix the declared encoding. Truncate on grapheme boundaries, never mid-pair. `split(\"\").reverse()` breaks emoji.",
        },
      ],
    },
    {
      title: "Bits in JavaScript",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Goal", "Expression"],
          mono: [1],
          rows: [
            ["Read, set bit i", "`(x >> i) & 1`, `x | (1 << i)`"],
            ["Clear, toggle bit i", "`x & ~(1 << i)`, `x ^ (1 << i)`"],
            ["Power of two", "`n > 0 && (n & (n - 1)) === 0`"],
            ["Clear lowest set bit", "`n & (n - 1)`"],
            ["Keep lowest set bit", "`n & -n`"],
            ["Find the single number", "XOR everything; pairs cancel"],
          ],
        },
        {
          kind: "points",
          items: [
            "Bitwise operators use **32-bit signed** ints: `1 << 32` is 1, `1 << 31` is negative, `>>> 0` makes unsigned.",
            "`>>` keeps the sign, `>>>` fills with zeros. `-1 >>> 1` is 2147483647.",
            "Two's complement: `-x === ~x + 1`. Signed 8-bit range is -128 to 127.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Odd test: `x % 2 === 1` fails for -7. Use `x % 2 !== 0` or `(x & 1) === 1`. Wrap bitwise ops in parentheses.",
        },
      ],
    },
    {
      title: "Counting and chance",
      lesson: 5,
      blocks: [
        {
          kind: "table",
          head: ["Ordered?", "Repeats?", "Count"],
          rows: [
            ["Yes", "No", "n! or n x (n-1) x ... x (n-k+1)"],
            ["No", "No", "C(n, k)"],
            ["Yes", "Yes", "n^k"],
            ["No", "Yes", "C(n + k - 1, k)"],
          ],
        },
        {
          kind: "points",
          items: [
            "`C(n, k) = C(n-1, k-1) + C(n-1, k)`. MISSISSIPPI: 11! / (4! 4! 2!) = 34,650.",
            "**Inclusion-exclusion**, or count the opposite. Divisible by 2, 3 or 5 up to 1000: 734.",
            "**Birthday**: a collision comes near sqrt(d). 23 people about 50.7%; a 32-bit hash about 77,000 items.",
            "Expected value adds even without independence. Coupon collector for 6 faces: 14.7 rolls.",
            "99% sensitive, 5% false positives, 1% base rate: a positive is real only about 16.7%.",
          ],
        },
      ],
    },
    {
      title: "Shuffle and sample",
      lesson: 5,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code: "for (let i = a.length - 1; i > 0; i--) {\n  const j = Math.floor(\n    Math.random() * (i + 1));\n  [a[i], a[j]] = [a[j], a[i]];\n}",
          note: "Fisher-Yates: O(n), every order has chance 1/n!.",
        },
        {
          kind: "points",
          items: [
            "`sort(() => Math.random() - 0.5)` is biased: the comparator is inconsistent.",
            "**Reservoir sampling** (stream, one pass): keep the first k, then replace slot j when `j < k`. For k = 1 replace with chance 1/i.",
          ],
        },
      ],
    },
    {
      title: "P, NP and hard problems",
      lesson: 6,
      blocks: [
        {
          kind: "table",
          head: ["Class", "Means", "Example"],
          rows: [
            ["P", "Quick to solve", "Sorting, shortest path, 2-SAT"],
            ["NP", "Quick to check", "All of P and below"],
            ["NP-complete", "In NP, hardest of NP", "SAT, subset sum, 3-colouring"],
            ["NP-hard", "At least that hard", "Cheapest tour, best knapsack"],
          ],
        },
        {
          kind: "table",
          head: ["Situation", "Approach"],
          rows: [
            ["n up to about 20", "Brute force or bitmask"],
            ["n up to 25 to 30", "DP over subsets (Held-Karp)"],
            ["Numbers are small", "Pseudo-polynomial DP"],
            ["Speed plus a guarantee", "Approximation"],
            ["Large and messy", "Heuristic or a solver"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "\"It is NP-hard\" starts the answer. Next: input size, easy variant (2-colouring?), then exact, DP, approximation or heuristic.",
        },
      ],
    },
    {
      title: "Search for a string",
      lesson: 7,
      blocks: [
        {
          kind: "table",
          head: ["Need", "Use", "Time"],
          rows: [
            ["Real code", "`includes` / `indexOf`", "built in"],
            ["One pattern, worst case", "KMP or Z", "O(n + m)"],
            ["Many same-length patterns", "Rabin-Karp", "O(n + m) avg"],
            ["Many different lengths", "Aho-Corasick", "O(n + total + matches)"],
            ["Short text", "Naive", "O(n x m) worst"],
          ],
        },
        {
          kind: "code",
          lang: "js",
          code: "function fail(p) {\n  const f = [0];\n  for (let i = 1, k = 0; i < p.length;\n       i++) {\n    while (k > 0 && p[i] !== p[k])\n      k = f[k - 1];\n    if (p[i] === p[k]) k++;\n    f[i] = k;\n  }\n  return f;\n}",
          note: "`ababaca` gives 0 0 1 2 3 0 1. On a mismatch use `k = f[k - 1]`, never `k = 0`.",
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Rabin-Karp must verify on equal hashes (`aa` and `ht` collide mod 101). Indexes count UTF-16 units, not letters.",
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["Compiled or interpreted?", "Both: bytecode first, hot code JIT-compiled."],
            ["Pass by value or reference?", "By value; for objects the value is a reference."],
            ["Why is 0.1 + 0.2 off?", "Binary doubles cannot hold 1/10 exactly."],
            ["Why is row-major faster?", "Cache lines hold neighbours; columns waste them."],
            ["`\"😀\".length`?", "2: UTF-16 units. Use `[...s]` or `Intl.Segmenter`."],
            ["Is a number a power of two?", "`n > 0 && (n & (n - 1)) === 0`."],
            ["Shuffle fairly?", "Fisher-Yates, not a random comparator."],
            ["Subset sum DP vs NP-complete?", "Pseudo-polynomial: polynomial in the value, not the digits."],
          ],
        },
      ],
    },
  ],
};
