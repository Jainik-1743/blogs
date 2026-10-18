# Writing step-by-step explainers

Every lesson should have at least one animated, click-through explainer. This is what makes the site stand out, so the
bar is high: each one must be **correct**, **easy to follow** and **good to look at**.

Read `lib/explain/types.ts` first. It defines the four kinds and every field. Existing examples:
`lib/explain/data/networking.ts` (seq kind) and `components/explainers/*.tsx` (how each kind is drawn).

## The four kinds

| kind | use it for | picture |
|---|---|---|
| `flow` | architectures, pipelines, state machines, trees, graphs, linked lists, call flows between components | boxes on a grid joined by arrows; steps reveal boxes/arrows, highlight some, and can change a box's second line |
| `array` | sorting, searching, two pointers, sliding window, stacks and queues, hash tables, DP tables (use a 2D grid) | a row or grid of cells with labelled pointers; marked, done and faded cells |
| `trace` | code that is easiest to understand by running it: scope, closures, hoisting, the event loop, recursion, loops | code with a "you are here" line, a variables table and console output |
| `seq` | who sends what to whom, in order: protocols, request flows, handshakes, auth flows | lifelines with arrows |

Pick the kind that shows the lesson's central idea most directly. A lesson on a hard-to-see mechanism (how a cache
fills, how a join runs, how the event loop schedules work) beats a pretty diagram of something obvious.

## How many, and what about

* **At least one per lesson**, about the idea readers find hardest. Two (never more) only when a lesson has two clearly
  different ideas that each deserve a picture.
* Read the **whole lesson** first. Use its terms, numbers and examples. Do not add claims the lesson does not make.
  The explainer must be true. If you are not sure of a fact, use the lesson's wording or leave it out.
* Lessons about people and process (team lead, career, behavioral interviews) get a `flow` of the method or cycle the
  lesson teaches (for example the steps of a good 1:1, or how to structure an answer), with concrete example text.

## Writing the text (the site's voice)

* Short sentences and everyday words. Explain any technical word the first time it appears, the way the lessons do.
* Never write the phrases "plain English" or "simple English". No emoji. No markdown, HTML or backticks in titles or
  notes (plain text only; the validator rejects them).
* 5 to 10 steps. **Each step shows one new idea.** `title` is a short phrase (at most 64 characters) saying what just
  happened. `note` is one to three sentences (25 to 420 characters) saying *why* it happens, not only what the box says.
* Use concrete values (real numbers, real names, a real request) so the reader can follow one example from start to end.

## Layout tips

* `flow`: at most 9 boxes. Columns run 0 to 5, rows 0 to 4. Box labels are short (two lines at most); put state in
  `sub` and change it with a step's `set`. Arrows must not cross boxes: use fractional columns/rows to nudge boxes and
  `curve` (-2 to 2) for return arrows or parallel arrows. Arrow labels: at most about 22 characters. Reveal things in
  the order the reader should think about them using `appear`, and `focus` what is happening now.
* `array`: 4 to 12 cells per row. Pointer labels are at most 8 characters (`low`, `mid`, `i`, `j`, `top`). Use `mark` for
  the cells being compared, `done` for the finished ones, `dim` for ruled-out ones.
* `trace`: at most 22 lines of code, each under 74 characters. Show the full variables table in each step's `vars`.
  Use `out` for what `console.log` prints.
* `seq`: at most 5 actors, labels at most 40 characters.

## Where the data goes and how a lesson embeds it

* Put definitions in `lib/explain/data/<series>.ts` in the `DATA` object. Names are
  `<series>-<lesson number>-<short-slug>`, for example `networking-3-dns-lookup`. The lesson number is the one in the
  URL (`/networking/lesson-3` is 3; `content/networking/03.md` is lesson 3; `content/<series>/00.md` is lesson 0).
* **Markdown lessons** (`content/<series>/NN.md`): add a block on its own, with a blank line before and after, in the
  body (before the interview-questions section, never inside a list or quote), right after the paragraph that
  introduces the idea:

  ````
  ```explainer
  networking-3-dns-lookup
  ```
  ````

* **TSX lessons** (`app/<series>/lesson-N/page.tsx`: devops, javascript, system-design, dsa): add
  `import Explainer from "@/components/explainers/Explainer";` and `<Explainer name="devops-5-iam-roles" />` between
  sibling blocks inside the lesson body, after the section that introduces the idea (not inside a `<p>`, `<ul>` or
  `Callout`). Change nothing else in the page.

## Checking your work (do all of it)

1. `node --experimental-strip-types scripts/check-explainers.mts <series>` validates every definition and lists
   lessons still missing an explainer. Fix every line it prints (ignore the Node "ExperimentalWarning").
2. A dev server is already running at http://localhost:3200 (do not start another one and do not run `next build`).
   `node scripts/check-explainers-browser.mjs <series> [lesson numbers...] --shots=/tmp/xp-<series>` opens each lesson in
   a real browser, steps through every explainer, and flags text that overflows a box, arrow labels sitting on boxes
   or on each other, page errors, and sideways scrolling on a phone. Fix everything it flags.
3. **Look at the pictures.** Open the screenshots it saves (`/tmp/xp-<series>/<name>.png`, the last step) with the Read
   tool. A clean check does not mean it looks good: look for crossing arrows, cramped or lopsided layouts, unreadable
   labels, and steps that do not teach. Improve until you would be happy to show it to a beginner. For `flow`, also take
   a screenshot of a middle step when the layout is complicated (a small Playwright script is fine).
4. Reread each lesson's explainer notes against the lesson text for accuracy.

## Rules of the road

* Only edit: your series' data file(s), and the lesson files you were given. Do not edit `components/`, `lib/explain/types.ts`,
  `lib/explain/validate.ts`, `app/globals.css`, or other series. If the engine blocks you, work around it and say so in your report.
* No git commands (do not commit, push, stash or reset). Do not run `next build`. Do not kill processes you did not start,
  and never use `pkill -f` or `pgrep -f` patterns (they can kill your own shell).
* Do not paste long copyrighted text; write your own notes.
