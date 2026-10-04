---
name: map-codebase
description: Scan the codebase once into a small knowledge base (architecture, modules, memory, archive) so later questions skip re-reading code. Use after setup, on an existing repo, or to refresh.
context: fork
agent: codebase-expert
model: sonnet
effort: medium
background: false
---
# Map codebase

> Owner: **codebase-expert** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-codebase-expert`. Inside the agent, just do the steps.


Outputs in `project/` (templates: `references/templates.md`):

| File | Holds | Budget |
|---|---|---|
| `architecture.md` | As-built system: stack, entry points, layers, data flow diagram, external services, how to run | ≤150 lines |
| `modules.md` | Index: every folder/module → purpose, key files, depends on. The "where is X?" lookup | ≤200 lines |
| `memory.md` | Durable facts: conventions, commands, gotchas, decisions found in code, learned Q&A | ≤150 lines |
| `archive.md` | History moved out of hot files: shipped work, closed tickets, retired facts, old handoffs | append-only |

Every file starts with `Mapped at: <commit> on <date>`.

## Full map (first time, or `full` argument)
1. Run the scanner from this skill's folder: `node <skill-dir>/scripts/scan.mjs .` — it prints stack, folders, scripts, entry points, routes, tests, largest and most-changed files.
2. Read only what the scan points to: manifests, entry points, 1–2 files per main module, config, CLAUDE.md/README. Never read every file.
3. Write `architecture.md` and `modules.md` from evidence; mark guesses `(unverified)`.
4. Seed `memory.md` with commands that work (run them), conventions you saw ≥2 times, and gotchas.
5. Create `archive.md` if missing.

## Refresh (map exists)
1. `node <skill-dir>/scripts/scan.mjs . --since <Mapped-at commit>` → changed areas only.
2. Update only the affected sections; move removed/outdated facts to `archive.md` with the date.
3. Bump `Mapped at`. If >40% of files changed, do a full map instead.

## Rules
- Facts, not prose. Cite paths (`src/features/booking/save.ts`) so answers can be verified fast.
- Never store secrets, tokens or personal data in these files.
- `docs/tech/architecture.md` (if present) is the *planned* design; `project/architecture.md` is *as built*. Note any drift between them.
