---
name: check-setup
description: Verify the project installs, lints, type-checks, tests, builds and passes CI, and that tools are connected. Use after setup and before the first ticket.
context: fork
agent: setup-engineer
model: sonnet
effort: medium
background: false
---
# Check setup

> Owner: **setup-engineer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-setup-engineer`. Inside the agent, just do the steps.


Run each step and paste the real result (last lines of output):

| Step | Command (adapt to stack) | Result |
|---|---|---|
| Install from lockfile | `npm ci` | pass/fail |
| Lint | `npm run lint` | |
| Type check | `npm run typecheck` | |
| Unit tests | `npm test` | |
| E2E smoke | `npm run test:e2e` | |
| Build | `npm run build` | |
| App starts | `npm run dev` + curl the home/health URL | |
| CI green | `gh run list -L 1` | |
| Env complete | every key in `.env.example` exists locally | |
| Tools | each row in `project/tools.md` is connected | |

All must pass before any ticket starts. For a failure: fix it if it's setup's fault; otherwise report it as a blocker with the error.
