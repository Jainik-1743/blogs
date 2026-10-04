---
name: prepare-release
description: Check every ticket meets the Done rules, open the PR with the template, write release notes and verify CI and the deploy. Use when sprint work is ready to ship.
context: fork
agent: release-manager
model: haiku
background: false
---
# Prepare release

> Owner: **release-manager** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-release-manager`. Inside the agent, just do the steps.


1. **Done gate** — for each ticket: checks pass · tests added · reviewer approved · tester passed · docs updated. Any miss → stop and list it.
2. **PR** — `gh pr create` with the template: what changed, tickets (links), screenshots, how it was tested, risks, rollback plan.
3. **CI** — `gh pr checks --watch`. On failure: report the failing step + log excerpt.
4. **Release notes** → `docs/releases/<version>.md`:
```
Release 1.3 - 2026-10-20
New:     Customers can book time slots online
Fixed:   Double booking when two users clicked at once
Tickets: PROJ-12, PROJ-30
```
5. **Approval gate** — the user merges / deploys. Never merge or deploy to production yourself.
6. **Verify deploy** — check the deployed URL: HTTP 200, version visible, one key flow works, no new errors in monitoring.
7. Tag the release (`git tag v1.3`) after the user confirms.
