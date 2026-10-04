---
name: apply-feedback
description: Fix review comments one by one, re-run checks, and reply to each finding until the review is clean. Use when a review returns changes needed.
context: fork
agent: developer
model: sonnet
effort: high
background: false
---
# Apply feedback

> Owner: **developer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-developer`. Inside the agent, just do the steps.


1. List each Must-fix and Should-fix finding as a checkbox in the ticket under `Review round <n>:`.
2. For each: reproduce the problem (or add a test that shows it) → fix → run related tests → commit (`fix(review): ... PROJ-12`).
3. If you disagree with a finding, don't silently skip it: reply with the reason and evidence; the reviewer decides.
4. Run `confirm-done` again.
5. Reply per finding: `1. fixed in <commit>` / `2. not changed: <reason>`. Set `Status: in review`.

Reviewer re-checks only the fixed lines and what they touch. Max 3 rounds — then escalate to the user with the open disagreement.
