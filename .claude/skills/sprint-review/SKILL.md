---
name: sprint-review
description: "Look back at a sprint: what shipped, what slipped and why, and which skill or rule to improve. Use at the end of each sprint."
context: fork
agent: doc-writer
model: haiku
background: false
---
# Sprint review

> Owner: **doc-writer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-doc-writer`. Inside the agent, just do the steps.


Write `project/retros/sprint-<n>.md` (≤30 lines) from the sprint file, tickets, git log and review/test results:

```
Sprint 2 - goal met? yes/partly/no
Shipped:      5 tickets (PROJ-12..16), 1 release
Slipped:      PROJ-20 - waiting on an answer (Q7)
Numbers:      review rounds avg 1.4 · bugs found by tester 3 (1 High) · estimate accuracy 80%
Went well:    ...
Was slow:     ... (cause, not blame)
Improve (max 3, each a concrete change to a skill, template or CLAUDE.md rule):
  1. create-tickets: add "time zone" to tech notes for date features (2 bugs came from this)
```

Propose the improvements; apply only after the user approves.
