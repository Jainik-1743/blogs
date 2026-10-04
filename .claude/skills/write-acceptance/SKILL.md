---
name: write-acceptance
description: Write clear pass/fail Given/When/Then acceptance checks for requirements and tickets. Use when a rule, story or bug needs testable success criteria.
context: fork
agent: spec-writer
model: sonnet
effort: medium
background: false
---
# Write acceptance checks

> Owner: **spec-writer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-spec-writer`. Inside the agent, just do the steps.


Format: `Given <state>, when <action>, then <observable result>` — tagged to the rule it proves (`R2:`).

## Rules
- Every rule gets ≥1 check; every flow gets a happy path + at least one failure check.
- "Then" must be observable by a tester (screen text, email sent, record saved, HTTP status) — never "works correctly".
- Use real example values ("25h before", "3 items", "€0.00") — boundaries make the best checks.
- One behaviour per check. If you need "and" twice, split it.
- Cover: permissions (wrong role), empty data, invalid input, limits/boundaries, concurrency where relevant.
- Stories copy their checks verbatim as `- [ ]` boxes; developers turn each into a test.
