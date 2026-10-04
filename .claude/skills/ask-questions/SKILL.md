---
name: ask-questions
description: Find gaps in requirements and ask about them in small rounds of question cards, each with a recommended answer and a default. Use when requirements are unclear or before writing a spec.
context: fork
agent: analyst
model: opus
effort: high
background: false
---
# Ask questions

> Owner: **analyst** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-analyst`. Inside the agent, just do the steps.


## Before asking
Read the brief, glossary, decisions and assumptions. Infer what you can. Check every topic in
`references/checklist.md`; a gap is a question only if the answer changes scope, cost, design or data.

## Round rules
- Big-picture round: 10–15 questions, only what's needed to split into specs.
- Per-spec round: **max 5**, most important first. Cross-spec questions → `project/shared-questions.md`.
- Every question is a card (`references/question-card.md`): priority, why it matters, options with
  trade-offs, **Recommended + reason**, **Default if no answer**.
- Priorities: BLOCKER (can't continue), IMPORTANT (changes scope/cost), NICE-TO-KNOW (ask only if a round has room).
- Gap found later (design/build)? Raise one card tagged to its spec; keep working on the default.

## After answers
Record answers in the question file. Unanswered by the deadline → default, logged in
`project/assumptions.md`. Stop when a round has no new BLOCKER/IMPORTANT gaps.

## Asking as multiple choice
Subagents can't ask the user. The analyst writes the cards to the question file and returns its path, the card IDs
and this instruction for the **main chat**: ask them as below.
With the AskUserQuestion tool: up to 4 cards per call, BLOCKER first, 2–4 options each, recommended option
first with "(Recommended)" ("Other" is added automatically). Record each answer in its card, then ask the next batch.
Without the tool: print cards as `A) / B) / C)` and accept replies like `Q3: B`.
