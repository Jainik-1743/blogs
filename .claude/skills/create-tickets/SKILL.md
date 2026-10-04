---
name: create-tickets
description: Split an approved FRD section into epics and small vertical story, task and bug tickets using the standard templates. Use when specs are approved and work needs planning.
context: fork
agent: project-manager
model: haiku
background: false
---
# Create tickets

> Owner: **project-manager** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-project-manager`. Inside the agent, just do the steps.


From ONE approved FRD section → `docs/tickets/<KEY>.md` (local IDs `T-001` until synced).

1. Epic = the FRD module. Stories = vertical slices a user can see (UI + API + data), one or two rules each.
2. Tasks = technical work with no visible feature (setup, migration, monitoring).
3. Use the templates: `references/story.md`, `references/bug.md`, `references/task.md`.
4. Copy acceptance checks verbatim from the FRD into each story; every FRD check lands in exactly one story.
5. Fill Depends on, Out of scope (pointing at the ticket that covers it) and Done when.

## Rules
- First story of a module = the thinnest end-to-end path ("walking skeleton"); later stories add rules.
- No horizontal tickets ("build all APIs"). No ticket without acceptance checks.
- End with a coverage table: FRD rule → ticket.
