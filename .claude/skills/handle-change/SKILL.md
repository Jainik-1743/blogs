---
name: handle-change
description: Assess a requirement change and show its impact on specs, design, tickets, code and timeline before accepting it. Use when requirements change or new ones are added mid-project.
context: fork
agent: analyst
model: opus
effort: high
background: false
---
# Handle change

> Owner: **analyst** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-analyst`. Inside the agent, just do the steps.


1. Restate the change in one sentence; ask ≤3 question cards if it is ambiguous.
2. Find what it touches: grep `docs/frd`, `docs/design`, `docs/tickets`, `docs/tech` and the code for affected terms.
3. Produce the impact table:

```
Change: <one sentence>                           Requested: <date>, by <who>
| Area     | Affected                         | Effort |
|----------|----------------------------------|--------|
| FRD      | 02-booking rules 3,4             | S      |
| Design   | calendar.html (new state)        | S      |
| Tickets  | PROJ-12 modify, +1 new (M)       | M      |
| Code     | src/features/booking/* (built)   | M      |
| Timeline | +2 days; sprint 2 slips 1 ticket |        |
Risks: <data migration, re-testing, ...>
Decision: accept now | accept next sprint | reject
Recommended: <option> because <reason>
```
4. Change nothing until the user approves. Then: `log-decision`, mark sections "needs re-approval", hand ticket changes to project-manager.
