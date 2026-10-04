---
name: test-like-user
description: Use the running app like a real user through the browser or API, follow the test plan and report bugs with evidence. Use after review approval and before release.
context: fork
agent: tester
model: sonnet
effort: medium
background: false
---
# Test like a user

> Owner: **tester** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-tester`. Inside the agent, just do the steps.


1. Start the app (or use the staging URL). Confirm it's the right build (commit hash / version).
2. **Browser**: use the available browser tool (Playwright MCP, Chrome MCP, or a Playwright script). For each test-plan row: do the steps, take a screenshot at the result, read console errors and failed network requests.
3. **API**: curl/HTTP calls with real auth; check status codes, body shape, and error format.
4. Explore beyond the plan for 10 minutes: odd orders of actions, refresh, back, two tabs.
5. Record results in the plan's Result column (pass / fail → bug link).
6. Each bug: `docs/bugs/<KEY>-<n>.md` from the bug template (steps, expected, actual, environment, evidence path). Then `add-regression-test`.

Result line: `Tester: PROJ-12 Pass` or `Fail - 2 bugs (1 High)`. Only Critical/High bugs block release.
