---
name: review-code
description: Review a code change against its ticket, FRD and project rules and report verified, ranked findings with file:line and fixes. Use after a ticket is implemented or for any pull request.
context: fork
agent: reviewer
model: opus
effort: high
background: false
---
# Review code

> Owner: **reviewer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-reviewer`. Inside the agent, just do the steps.


1. Context: ticket, FRD section, `CLAUDE.md` rules, and the diff (`git diff main...HEAD`). Read changed files in full, plus callers when behaviour changes.
2. Check in this order (`references/checklist.md`): acceptance checks → correctness/edge cases → tests → security → data/migrations → performance → design system → readability → docs.
3. Verify every finding: point to the line, explain the failing scenario (input → wrong result). Drop anything you can't verify.
4. Rank: **Must fix** (bugs, security, broken checks, missing tests) / **Should fix** (maintainability, perf) / skip nitpicks.
5. Report in the exact format below; then set ticket `Status: approved` or `changes needed`.

```
Ticket: PROJ-12      Result: Changes needed
Must fix:
  1. src/features/booking/save.ts:42 - slot not locked; two users can book the same slot -> use SELECT ... FOR UPDATE
Should fix:
  2. src/features/booking/ui.tsx:18 - no loading state -> render <Skeleton/>
Security: no issues found
Acceptance checks met: 2 of 2
```
