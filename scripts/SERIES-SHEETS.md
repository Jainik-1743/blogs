# Writing a cheat sheet

Each series gets one cheat sheet at `/cheatsheets/series/<series>`: a dense, printable page of cards that a developer would
pin next to their screen or read the night before an interview. Look at the finished model first:
`lib/series-sheets/data/git-github.ts` (and open http://localhost:3200/cheatsheets/git-github to see how it looks on
screen). Read `lib/series-sheets/types.ts` for the block kinds.

## What a good cheat sheet is

* **A reference, not a lesson.** Facts, commands, rules, tables, formulas, snippets and gotchas that a reader can scan
  in seconds. No story telling, no long sentences. Each card links to the lesson that teaches it (`lesson: N`).
* **Detailed and accurate.** Pull the real content out of the lessons: the commands and flags, the numbers, the
  comparison tables, the "traps", the model answers to the interview questions. Do not invent facts or numbers that
  the lessons do not support. If a lesson shows output from a real run, prefer that.
* **Covers the whole series.** Every lesson should feed at least one card (the checker warns if too many lessons are
  never referenced). Order the cards like the series (first lesson first), with an "Interview one-liners" card near
  the end holding the short answers to the questions interviewers ask most.
* **10 to 15 cards, about 600 to 1,100 words in total** (the validator rejects fewer than 450 or more than 1,500 words; the
  sheet must print on two A4 pages).
* **Mixed block kinds.** A sheet made only of bullets is dull. Use `table` for comparisons, `pairs` for commands or
  terms, `code` for the three or four snippets worth memorising, `steps` for procedures, and `callout` (`warn` for
  traps, `tip` for habits). Mix them inside cards.
* Voice: short, plain words, the same as the lessons. Never write "plain English" or "simple English". No emoji.
  Text may use `backticks` for code and **bold** for the key word. No HTML, no markdown links, no other markdown.

## Limits (the validator enforces these)

* intro up to 320 characters; 8 to 16 sections; section title up to 56 characters, unique.
* 1 to 4 blocks per section. points/steps: 2 to 10 items, up to 210 characters each.
* table: 2 to 4 columns, 2 to 14 rows, cells up to 100 characters. pairs: 2 to 14 rows, left cell up to 40 characters,
  right cell up to 120. code: up to 16 lines, **each line up to 58 characters** (the cards are narrow; shorten or
  split code), note up to 160. callout: up to 220 characters.

## How to write and check one

1. Read the series' lessons (use `grep -n "^## "` for the structure, then read the parts that matter: tables,
   "Key takeaways", the interview questions and their answers, and the code).
2. Write `lib/series-sheets/data/<series>.ts`, replacing `export const SHEET ... = null;` with the real object, as in
   the Git model. Keep the file's header comment and `import type`.
3. `node --experimental-strip-types scripts/check-series-sheets.mts <series>` must print no problems (ignore the Node
   ExperimentalWarning).
4. A dev server is running at http://localhost:3200. Open `/cheatsheets/series/<series>` in a browser with Playwright
   (`/opt/node22/lib/node_modules/playwright`, Chromium at `/opt/pw-browsers/chromium`), take a full-page screenshot at
   1440 px wide, and **look at it** with the Read tool. Check: nothing is cut off, tables are readable, code does not
   overflow its card, cards look balanced. Also check the phone width (390 px: `document.documentElement.scrollWidth`
   must be 390). Fix what looks wrong. If the dev server does not answer, wait a few minutes and retry
   (`until curl -s -m 5 -o /dev/null localhost:3200/; do sleep 10; done`).
5. Re-read your sheet against the lessons once for accuracy.

## Rules of the road

* Only edit your series' data file(s). Do not edit components, CSS, the validator, or other series.
* No git commands. Do not run `next build`. Do not kill processes you did not start, and never use `pkill -f` or
  `pgrep -f` patterns.
* A sheet that fails validation is skipped in dev and FAILS the production build, so always finish with a clean check
  and never leave a half-written sheet in a data file.
