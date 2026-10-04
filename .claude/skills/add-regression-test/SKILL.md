---
name: add-regression-test
description: Turn every found bug into an automated test that fails before the fix and passes after. Use whenever a bug is found or fixed.
context: fork
agent: developer
model: sonnet
effort: high
background: false
---
# Add regression test

> Owner: **developer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-developer` or `role-tester`. Inside the agent, just do the steps.


1. Pick the cheapest level that reproduces the bug: unit < integration < e2e.
2. Name it after the bug: `it("does not allow double booking when two users confirm at once (PROJ-30)")`.
3. Use the exact steps/data from the bug report. Run it against the unfixed code: it **must fail**. Paste the failure.
4. After the fix: it passes. Paste the pass.
5. Link the test path in the bug file (`Regression test:`).

Concurrency/timing bugs: control the clock or use parallel requests deterministically — never `sleep()` and hope.
