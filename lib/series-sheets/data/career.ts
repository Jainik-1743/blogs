import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "career" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "The three steps of interview preparation: a one-page resume of numbers, a 12-week coding study plan, and mock interviews with a scoring sheet and a mistake log. Built on one public guide, so treat it as one experienced view, not a rule.",
  sections: [
    {
      title: "Resume layout",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Order", "Section", "Rule"],
          rows: [
            ["1", "Headline + summary", "Headline under 10 words, summary under 50"],
            ["2", "Contact Information", "Name, personal email and phone, city, LinkedIn"],
            ["3", "Skills", "`Languages: JS | TS | Python`, grouped"],
            ["4", "Work Experience", "Newest first, `Company, Place | Title | MM/YYYY - MM/YYYY`"],
            ["5", "Education", "GPA only if above 3.50 / 4.00"],
            ["6", "Projects", "At least 2, linked to GitHub"],
          ],
        },
        {
          kind: "points",
          items: [
            "**One page.** A few best achievements beat many average ones. Students and under 3 years: Education first.",
            "Design for a short, distracted read. No symbols in headings.",
            "List only skills you could discuss for ten minutes.",
          ],
        },
      ],
    },
    {
      title: "The bullet formula",
      lesson: 0,
      blocks: [
        {
          kind: "code",
          lang: "text",
          code: "[Accomplishment]: [Action]\n  that resulted in [outcome]\n\nCheck: Action + Scope + Result",
          note: "Start with a strong verb. Scope = users, requests, team size.",
        },
        {
          kind: "table",
          head: ["Before", "After"],
          rows: [
            ["Improved application performance.", "Cut orders API p95 from 900 ms to 350 ms with an index and a Redis cache."],
            ["Migrated database.", "Led a 200 GB MySQL to PostgreSQL move, 10 minutes planned downtime; wrote the runbook."],
            ["Helped the team with deployments.", "Built a pipeline that deploys on merge: release time 2 hours to 15 minutes."],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Use only numbers you can explain: how measured, when, compared to what. Prefer before and after. No metric? Use scope. Never round up.",
        },
      ],
    },
    {
      title: "File format and ATS",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "Write in Word or Google Docs, export a **PDF** with selectable text. No headers or footers, 0.5 inch margins.",
            "Fonts: Arial, Calibri or Garamond, 10 pt or more. No design tools or online builders.",
            "Spell out abbreviations once (Amazon Web Services and AWS).",
          ],
        },
        {
          kind: "steps",
          items: [
            "Plain-text test: copy all text, paste into a plain file.",
            "Missing points, wrong characters or sections out of order mean you fix the file.",
            "Repeat on every export.",
          ],
        },
        {
          kind: "table",
          head: ["Claim", "Status"],
          rows: [
            ["An ATS auto-rejects by rule", "The guide's claim, not verified"],
            ["Some rank by keyword count", "The guide's claim, not verified"],
            ["Copy keywords from the post", "Only where true; do not stuff"],
          ],
        },
      ],
    },
    {
      title: "What to cut, final checks",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Cut", "Why"],
          rows: [
            ["Duties with no result", "Says nothing about what changed"],
            ["\"Hard-working, passionate\"", "Show it with a bullet"],
            ["Columns, icons, skill bars", "Parsing risk, no information"],
            ["Old or unrelated jobs", "Hides the strong lines"],
          ],
        },
        {
          kind: "points",
          items: [
            "Keep the best 3 to 5 bullets per recent job.",
            "Cover letter: under one page, do not repeat the resume, tell one relevant story.",
            "Links must open when logged out. Have someone else check spelling and dates.",
          ],
        },
      ],
    },
    {
      title: "Study-plan numbers",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["What", "The handbook says"],
          rows: [
            ["A coding round", "30 to 45 minutes"],
            ["Bare minimum", "About 30 hours"],
            ["Well prepared", "About 100 hours"],
            ["Holistic plan", "About 3 months, about 11 hours a week"],
            ["Start mocks", "At about 60% through the plan"],
          ],
        },
        {
          kind: "points",
          items: [
            "**Breadth-first**: revise all topics, then mix. For about a month.",
            "**Depth-first**: one topic at a time, high priority first. For short time.",
            "**Depth, then breadth**: for more than a month. It keeps earlier topics fresh.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Aimless grinding (30 minutes a question, 160 questions in 3 weeks) may not build retention. Keep estimates conservative.",
        },
      ],
    },
    {
      title: "The 12-week schedule",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Week", "Topics (priority)", "Hours"],
          rows: [
            ["1", "Array, String, Hash table, Recursion", "11"],
            ["2", "Sorting and searching, Matrix, Linked list, Queue, Stack", "11"],
            ["3", "Tree, Graph (high); Heap, Trie (mid)", "14"],
            ["4", "Interval, Dynamic programming, Binary, Math, Geometry", "10"],
            ["5 to 12", "75 mixed questions; mocks from about week 7", "11 a week"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Working full time? 6 hours a week for 6 months can beat 11 for 3. The shape matters: topic, practise, mix, mock.",
        },
      ],
    },
    {
      title: "Practise a topic, weekly routine",
      lesson: 1,
      blocks: [
        {
          kind: "steps",
          items: [
            "Learn the idea; trace the example by hand.",
            "Solve one question cold with a 30 to 40 minute timer, thinking aloud.",
            "Stuck: smaller example, then a hint, then the solution. Note the hint.",
            "Read a good solution; compare time and space.",
            "Write a one-line pattern note, e.g. \"sorted + pair sum: two pointers\".",
            "Re-solve it days later without looking.",
          ],
        },
        {
          kind: "table",
          head: ["Day", "What"],
          rows: [
            ["Mon, Tue", "Study the topic, 3 to 4 questions"],
            ["Wed", "2 questions from last week, no notes"],
            ["Thu", "3 mixed questions, timed"],
            ["Fri", "Read the mistake log, redo 2 old mistakes"],
            ["Weekend", "Mock (from week 7) or 2 timed questions"],
          ],
        },
      ],
    },
    {
      title: "What interviewers score",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Dimension", "Strong", "Weak"],
          rows: [
            ["Communication", "Organised, easy to follow", "Codes at once, near silent"],
            ["Problem solving", "Clarifies, optimises, few hints", "Disorganised, wrong approach"],
            ["Technical skill", "Clean, working code", "Many errors, no solution"],
            ["Testing", "Normal and corner cases, finds own bugs", "Calls it done despite bugs"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Three of four are about how you work, so they can be practised. Bands: strong hire, hire, no hire, strong no hire.",
        },
      ],
    },
    {
      title: "Before, during, after coding",
      lesson: 2,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["Before", "Clarifying questions, more examples, pick an approach"],
            ["While", "High-level structure first, narrate decisions, not keystrokes"],
            ["After", "Test with your examples, state time and space cost"],
            ["Stuck: 1", "Draw the problem and its states"],
            ["Stuck: 2", "Solve by hand, then turn the rules into code"],
            ["Stuck: 3", "More examples, split the problem, try common tools"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Last ten minutes: test two normal and two edge cases (empty, one element, duplicates, huge). If unfinished, explain the missing parts.",
        },
      ],
    },
    {
      title: "Run a mock, keep a mistake log",
      lesson: 2,
      blocks: [
        {
          kind: "steps",
          items: [
            "Take turns as interviewer and candidate; use an unseen problem and the real time limit.",
            "Interviewer stays silent while you think, and counts the hints given.",
            "Score on the sheet in writing, then talk for 10 minutes.",
            "Write the lessons in the mistake log.",
          ],
        },
        {
          kind: "code",
          lang: "text",
          code: "14 Oct  Merge intervals\nWent wrong:  forgot to sort first\nRoot cause:  jumped to code\nNext time:   plan first: \"sort?\" step 1",
          note: "Log the cause, not the symptom. Count causes monthly.",
        },
        {
          kind: "points",
          items: [
            "Fix the lowest line on the sheet this week.",
            "Record yourself once: you hear silences and \"um\".",
          ],
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
            ["Resume length?", "One page; best achievements first."],
            ["A strong bullet?", "Action, scope, result with a number."],
            ["Plain-text test?", "Paste into a text file; nothing missing or garbled."],
            ["When to start mocks?", "At about 60% through the plan."],
            ["What is scored?", "Communication, problem solving, skill, testing."],
            ["Bad round?", "Write it in the log. One round is one data point."],
          ],
        },
      ],
    },
  ],
};
