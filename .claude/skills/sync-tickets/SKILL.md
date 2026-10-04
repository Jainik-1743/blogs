---
name: sync-tickets
description: Create and update tickets in Jira, Linear or GitHub Issues and keep tracker IDs in the progress file. Use after tickets are created or their status changes.
context: fork
agent: project-manager
model: haiku
background: false
---
# Sync tickets

> Owner: **project-manager** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-project-manager`. Inside the agent, just do the steps.


Tracker comes from `project/tools.md` (Jira > Linear > GitHub Issues > local files).

1. Create: epic first, then stories/tasks linked to it. Map fields: title, description (story body as markdown), labels, size → story points (S=1, M=3), dependencies → "blocks" links.
2. Rename the local file to the tracker key (`T-003.md` → `PROJ-14.md`) and update references in `docs/`.
3. Status changes: move the tracker issue and the `Status:` line together. Comment with the PR link when a PR opens.
4. Record the key range in `project/progress.md` (`Tracker: Jira PROJ-10..PROJ-24`).

## Rules
- Idempotent: search the tracker by title/epic before creating to avoid duplicates.
- Use the tracker's MCP server or CLI; batch where supported. Never paste tokens into files.
- If no tracker is connected, local files are the source of truth — say so.
