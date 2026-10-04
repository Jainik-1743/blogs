---
name: estimate-tickets
description: Size each ticket S or M and split anything larger. Use after tickets are created and before sprint planning.
context: fork
agent: project-manager
model: haiku
background: false
---
# Estimate tickets

> Owner: **project-manager** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-project-manager`. Inside the agent, just do the steps.


Sizes: **S** < half a day · **M** about a day · **L** = must split (never stays L).

For each ticket, estimate from: number of acceptance checks, layers touched (UI/API/data), new vs reused components, unknowns, integrations.
- Unknown that could double the size → note `Risk:` and suggest a `try-idea` spike task.
- Split L by: rule (one rule per story), user role, happy path vs edge cases, read vs write, UI vs admin.
- After splitting, every original acceptance check must still land in exactly one ticket.

Output: table `KEY | title | size | risk`, plus the totals (S count, M count, ≈ days).
