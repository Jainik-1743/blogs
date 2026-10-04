---
name: check-ux
description: Review screens against usability rules (clear labels, one main action, helpful errors, states, undo, consistent wording). Use after wireframes or UI are built.
context: fork
agent: designer
model: sonnet
effort: medium
background: false
---
# Check UX

> Owner: **designer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-designer`. Inside the agent, just do the steps.


Check each screen against this list; record failures in `docs/design/review.md` as `screen | rule | problem | fix`.

1. Clear purpose: a new user knows what the screen is for in 5 seconds.
2. One primary action, visually dominant.
3. Labels say what things are, in glossary words; no jargon or internal codes.
4. Errors say what happened and how to fix it, next to the field; input is preserved.
5. All 5 states exist (normal, loading, empty, error, success).
6. Feedback within 100ms for every action (pressed state, spinner, optimistic update).
7. Destructive actions confirm or offer undo.
8. Consistent: same action = same word, place and style everywhere.
9. Forms: minimal fields, sensible defaults, correct input types (email, tel, date), autofill works.
10. Navigation: user always knows where they are and how to go back.
11. Responsive: no horizontal scroll at 375px; touch targets ≥44px.

Output: pass/fail per rule per screen, then fix the failures (designer) or file them (developer).
