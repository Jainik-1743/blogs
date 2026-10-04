---
name: plan-sprint
description: Order tickets by dependencies and value into a sprint that fits capacity. Use when starting a sprint or re-planning after changes.
context: fork
agent: project-manager
model: haiku
background: false
---
# Plan sprint

> Owner: **project-manager** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-project-manager`. Inside the agent, just do the steps.


Write `project/sprint-<n>.md`:

```
Sprint 2   2026-10-20 -> 2026-10-31   Goal: customers can book and pay online
Capacity:  8 dev-days (S=0.5, M=1)    Planned: 7.5
| # | Ticket  | Size | Depends on | Why now          |
| 1 | PROJ-12 | M    | -          | walking skeleton |
| 2 | PROJ-13 | S    | PROJ-12    | ...              |
Not in sprint: PROJ-20 (waiting on Q7)
Risks: payment provider not chosen (default Stripe)
```

## Rules
- Order: blockers and dependencies → riskiest unknowns early → highest user value → nice-to-haves.
- Fill to ~85% of capacity; leave room for bugs and review fixes.
- Tickets waiting on open answers go in only if their default is acceptable.
- One sprint goal in plain language. Approval gate before work starts.
