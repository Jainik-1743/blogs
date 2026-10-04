---
name: update-docs
description: "Update README and docs to match what was actually built: setup, env vars, commands, API and feature status. Use after a release or when behaviour changes."
context: fork
agent: doc-writer
model: haiku
background: false
---
# Update docs

> Owner: **doc-writer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-doc-writer`. Inside the agent, just do the steps.


1. Diff since the last release: `git diff <last-tag>..HEAD --stat` and the release notes.
2. Check each doc for drift and fix it:
   - README: what it is, setup steps, commands, env vars (must match `.env.example`).
   - `docs/tech/api.md` vs actual routes; `docs/tech/database.md` vs migrations.
   - FRD sections: mark built rules; note any change made during build (with decision ID).
   - `CLAUDE.md`: commands and conventions still correct; ≤60 lines.
3. Run every documented command once; mark anything you couldn't run as "not verified".
4. Delete outdated text instead of adding caveats.
5. If `project/architecture.md` exists, end by asking **codebase-expert** to refresh the map (`map-codebase`).

Output: list of files changed with one line each on what was corrected.
