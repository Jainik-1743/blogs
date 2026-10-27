import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "team-lead" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "Frameworks and checklists for the questions a team lead hears every week: why this choice, how long, what if it fails, and how you treat people. Think before you choose, give a reason, name the risk. Common practice and opinion, not law.",
  sections: [
    {
      title: "The answer shape",
      lesson: 0,
      blocks: [
        {
          kind: "steps",
          items: [
            "**Goal**: \"We needed to ...\" (the need, not the tool).",
            "**Options**: \"I looked at A, B and building it.\"",
            "**Choice** and **reason**: one to three facts, not feelings.",
            "**Risk**: what could go wrong, and how you reduce it.",
            "**Plan B**: how you go back, and what it costs.",
          ],
        },
        {
          kind: "code",
          lang: "text",
          code: "Right now I'm trying to [goal].\nI know [fact]. I don't know [unknown].\nMy guess is [x]; I'll check it by [step].\nIf that is wrong, I'll try [other idea].",
          note: "\"What are you thinking?\" Say this out loud.",
        },
        {
          kind: "callout",
          tone: "warn",
          text: "\"Because it is popular\" is not a reason alone. Stuck? Try 30 to 60 minutes, then ask with notes of what you tried.",
        },
      ],
    },
    {
      title: "Why this package?",
      lesson: 1,
      blocks: [
        {
          kind: "steps",
          items: [
            "**Need**: can the platform or 20 clear lines do it? Dates, parsing, crypto deserve a library.",
            "**Alive**: last release, unanswered issues, maintainers, security contact.",
            "**Fit**: TypeScript types, framework and runtime support.",
            "**Cost**: bundle size, transitive dependencies, license.",
            "**Exit**: wrap it in one small module of your own.",
            "**Support**: more than one person can read it.",
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["npm view PKG time.modified", "When the package last changed"],
            ["npm audit", "Known vulnerabilities"],
            ["npm outdated", "Current vs Wanted vs Latest"],
            ["npm explain PKG", "Why this is installed"],
          ],
        },
      ],
    },
    {
      title: "Estimates and code review",
      lesson: 3,
      blocks: [
        {
          kind: "points",
          items: [
            "Give a **range**, name the unknowns, include tests, review and deploy. Split pieces over 2 to 3 days.",
            "Slipping? Tell the lead the **same day**: done, left, why, options (cut scope, move date, add help).",
            "Keep **estimate**, **target**, **commitment** and **plan** apart.",
          ],
        },
        {
          kind: "table",
          head: ["Review rule", "Value"],
          rows: [
            ["Approve when", "It clearly improves code health"],
            ["Reply within", "One business day"],
            ["Change size", "About 100 lines fine, 1,000 too big"],
            ["Weight labels", "`Nit:`, Optional, FYI"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "A good comment: what you see, why it matters, an option. Comment on the code, not the person.",
        },
      ],
    },
    {
      title: "Incidents and team health",
      lesson: 4,
      blocks: [
        {
          kind: "steps",
          items: [
            "Stop the damage first: roll back, flag off.",
            "Name **one coordinator**. Send updates on a schedule.",
            "When stable, hold a **blameless** review: how did the system allow this?",
            "Write a few actions with an **owner and a date**. Check they were done.",
          ],
        },
        {
          kind: "table",
          head: ["DORA key", "Meaning"],
          rows: [
            ["Deployment frequency", "How often you release (speed)"],
            ["Lead time for changes", "Median commit to production (speed)"],
            ["Time to restore", "Median bad deploy to fix (stability)"],
            ["Change failure rate", "Failures / deploys, 1 in 4 = 25%"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Measure the process, never rank people. Rewarded numbers get gamed.",
        },
      ],
    },
    {
      title: "Design docs and tool choices",
      lesson: 5,
      blocks: [
        {
          kind: "code",
          lang: "md",
          code: "# Title: the decision\nStatus: draft | accepted | replaced\nOwner, Reviewers, Decide by: <date>\n## Problem  ## Goals / Non-goals\n## Proposal  ## Alternatives\n## Risks  ## Rollout / rollback\n## Test plan  ## Open questions",
        },
        {
          kind: "steps",
          items: [
            "Talk first, then write a short draft with an owner. Give at least two alternatives and why not.",
            "Set a date for comments. Answer every one.",
            "Decide, record the reasons and rejected ideas.",
          ],
        },
        {
          kind: "points",
          items: [
            "Language or framework: problem, team skills, hiring, ecosystem, running it at 3 a.m., how hard to undo.",
            "**Boring by default**: about three innovation tokens. Try new tools in a small spike.",
            "Skip the doc for tiny, reversible choices.",
          ],
        },
      ],
    },
    {
      title: "Debt, rewrites and team laws",
      lesson: 6,
      blocks: [
        {
          kind: "points",
          items: [
            "Debt is a **loan with interest**: take it on purpose, write it down, state the cost in business terms.",
            "Pay first where code changes often or breaks. Refactor in small steps with tests.",
            "Watch **latency, traffic, errors, saturation**.",
          ],
        },
        {
          kind: "table",
          head: ["Law", "Ask yourself"],
          rows: [
            ["Conway", "Do team borders match design borders?"],
            ["Brooks", "More people on a late project slows it"],
            ["Goodhart", "A measure used as a target breaks"],
            ["Chesterton", "Why does this exist? Find out first"],
          ],
        },
      ],
    },
    {
      title: "1:1s, feedback, delegation",
      lesson: 8,
      blocks: [
        {
          kind: "steps",
          items: [
            "**Their topics** first.",
            "Blockers: what do you need from me?",
            "Growth, then feedback both ways.",
            "Write 2 to 3 actions with names and dates.",
          ],
        },
        {
          kind: "code",
          lang: "text",
          code: "I saw:   [one specific fact]\nEffect:  [what it caused]\nAsk:     \"How do you see it?\"\nTry:     [one change], then check in",
          note: "Hard feedback: soon, private, about the work.",
        },
        {
          kind: "pairs",
          rows: [
            ["Goal / Owner", "What \"done\" is / one name"],
            ["Limits", "Deadline, budget, approvals"],
            ["Check-ins", "When and how"],
            ["Support", "What you give"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "70/10/80: pick someone who can do 70%, teach 10%, accept 80%. Disagree before the decision, commit after.",
        },
      ],
    },
    {
      title: "Mentoring, onboarding, hiring",
      lesson: 9,
      blocks: [
        {
          kind: "table",
          head: ["When", "What"],
          rows: [
            ["Before day 1", "Access, a buddy, a small first task"],
            ["Week 1", "Run the README setup, ship a tiny change"],
            ["Weeks 2 to 4", "Own a small feature, fix confusing docs"],
            ["Months 2 to 3", "Own a bigger piece, agree goals"],
          ],
        },
        {
          kind: "points",
          items: [
            "Mentor: ask \"What have you tried?\", give the smallest hint, say why.",
            "Hiring: write 4 to 6 points first, same kind of questions for all, score **before** the group talks.",
            "Prefer work-like tasks. Keep take-homes short.",
          ],
        },
      ],
    },
    {
      title: "Stakeholders, meetings, change",
      lesson: 10,
      blocks: [
        {
          kind: "code",
          lang: "text",
          code: "Status: on track | at risk | blocked\nDone: <one line, in user terms>\nNext: <one line>\nRisk: <what, how likely, what we do>\nNeed from you: <decision, with a date>",
          note: "Status and ask first. Use numbers.",
        },
        {
          kind: "points",
          items: [
            "**Why before what.** Ask: \"If we ship this, what number changes?\"",
            "Meeting: purpose, owner, agenda first, only deciders, actions with name and date.",
            "Cancel it if you can live with the outcome.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Change: talk to affected people one by one first, try small with a measure and a way back, set a review date.",
        },
      ],
    },
    {
      title: "Strategy, roadmap, build or buy",
      lesson: 12,
      blocks: [
        {
          kind: "table",
          head: ["Part", "Question"],
          rows: [
            ["Diagnosis", "What is the real problem? Numbers"],
            ["Guiding policy", "What rule rules options out?"],
            ["Coherent actions", "Which steps fit together?"],
          ],
        },
        {
          kind: "points",
          items: [
            "Can it make someone say no? If not, it is a wish list.",
            "Roadmap = **bets with date ranges**: Now, Next, Later. Firm near, loose far.",
            "Buy common plumbing, build the core. Keep your own interface in front.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Migration: tests first, run old and new side by side, set an end date, delete the old path.",
        },
      ],
    },
    {
      title: "Growth and promotion",
      lesson: 13,
      blocks: [
        {
          kind: "points",
          items: [
            "Moving up means **bigger scope and wider influence**, not more output. Management is a different job, not a promotion.",
            "Promote what the person already does for several months.",
          ],
        },
        {
          kind: "table",
          head: ["Kind", "Does what"],
          rows: [
            ["Mentorship", "Advice and teaching in private"],
            ["Sponsorship", "Uses your influence in rooms they are not in"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "\"Not yet\": name the exact gap and a next step. Promotion case: scope and impact with numbers, dated examples, feedback, honest gaps.",
        },
      ],
    },
    {
      title: "Security habits and AI rules",
      lesson: 14,
      blocks: [
        {
          kind: "table",
          head: ["STRIDE", "Breaks"],
          rows: [
            ["Spoofing", "Authentication"],
            ["Tampering", "Integrity"],
            ["Repudiation", "Accounting (logs)"],
            ["Info disclosure", "Confidentiality"],
            ["Denial of service", "Availability"],
            ["Elevation", "Authorization"],
          ],
        },
        {
          kind: "points",
          items: [
            "30-minute threat model, then **mitigate, eliminate, transfer or accept**. Make tickets.",
            "`npm ci` in CI, `npm audit`, check new package names. Leaked secret: **rotate first**.",
            "AI tools: **you commit it, you own it**. Small changes, read every line, no secrets in prompts, agents in a sandbox.",
          ],
        },
      ],
    },
    {
      title: "Ownership, on-call, retros",
      lesson: 16,
      blocks: [
        {
          kind: "points",
          items: [
            "Team borders are an architecture choice. Keep teams small, split along the work.",
            "One owner per service in a catalogue. Bus factor one: name a second person.",
            "Page only for user-visible symptoms, one runbook per alert.",
          ],
        },
        {
          kind: "steps",
          items: [
            "Retro: process, not people. Check **last time's actions**.",
            "Collect in silence, group, vote.",
            "End with 1 to 3 actions: owner, date, check.",
          ],
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 11,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["Why this package?", "Need, options, two or three facts, risk, exit."],
            ["Rewrite or refactor?", "Refactor in small steps. Rewrites lose old fixes."],
            ["Deadline will slip?", "Tell the lead the same day, with options."],
            ["Risky shortcut asked?", "Explain the risk in business words. Never trade security or law."],
            ["Late project, add people?", "Cut scope or move the date first."],
            ["Trust a popular repo?", "Stars show interest, not truth. Try small."],
          ],
        },
      ],
    },
  ],
};
