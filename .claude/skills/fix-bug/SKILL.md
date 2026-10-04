---
name: fix-bug
description: Reproduce a bug, find the real root cause, add a failing test, fix it and verify. Use for any bug report, failing test or unexpected behaviour.
context: fork
agent: developer
model: opus
effort: high
background: false
---
# Fix bug

> Owner: **developer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-developer`. Inside the agent, just do the steps.

1. **Reproduce** exactly (steps from the bug report). Can't reproduce → gather more evidence (logs, data, env) before touching code.
2. **Minimize** — smallest input/steps that still fail.
3. **Hypothesize** — list ≤3 possible causes; test the cheapest one first with logs or a debugger, not guesses in code.
4. **Root cause** — explain in one sentence *why* it happens (not just where). Check for the same pattern elsewhere (grep).
5. **Failing test** that reproduces it (`add-regression-test`). Watch it fail.
6. **Fix** the cause, not the symptom. Watch the test pass; run the related suite.
7. Write in the bug file: cause · fix · test path · other places checked.

**After 3 failed fix attempts: stop.** Report what was tried, what was learned and the best remaining hypothesis.
