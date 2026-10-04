---
name: write-test-first
description: Write a failing test from each acceptance check, make it pass with minimal code, then refactor. Use when implementing any ticket or behaviour change.
context: fork
agent: developer
model: sonnet
effort: high
background: false
---
# Write test first (red → green → refactor)

> Owner: **developer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-developer`. Inside the agent, just do the steps.


For each acceptance check in the ticket, in order:

1. **Red** — write one test whose name is the check ("rejects a booking for a taken slot"). Run it. It must fail **for the right reason** (assertion, not a typo/import error). Paste the failure line.
2. **Green** — write the least code that makes it pass. Run the test file. Paste the pass line.
3. **Refactor** — remove duplication, improve names; tests stay green.
4. Commit (`test:`/`feat:`) — small commits are the undo button.

## Rules
- Test behaviour through public interfaces (HTTP, UI, exported functions), not private internals.
- Choose the cheapest level that proves the check: unit for rules, integration for API+DB, e2e for the main user flow only.
- Never edit a test to match buggy behaviour. Never mark a test skipped to get green.
- Mocks only at system boundaries (network, clock, payment provider).
