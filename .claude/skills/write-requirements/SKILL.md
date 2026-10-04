---
name: write-requirements
description: Write one FRD section using the standard template, in the project's glossary words. Use when a spec's questions are answered and its requirements need writing.
context: fork
agent: spec-writer
model: sonnet
effort: medium
background: false
---
# Write requirements

> Owner: **spec-writer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-spec-writer`. Inside the agent, just do the steps.


Write ONE section: `docs/frd/NN-<name>.md`, using `references/frd-section.md`.

## Rules
- Goal = one measurable sentence. Users = glossary roles.
- Flow = numbered steps a tester can follow. Include the main error path.
- Rules = each a single testable statement ("A slot can't be double-booked"), numbered for reference.
- Screens link to wireframes when they exist. Data lists entities and key fields, not database types.
- Non-functional = only real targets (load time, users, uptime, privacy).
- Out of scope and Assumptions are mandatory — empty means "none", written explicitly.
- No implementation or technology unless the requirements demand it.
- ≤120 lines. If larger, split the module into two sections and update the spec list.
- Top line `Status: awaiting approval`. After approval: `Status: approved YYYY-MM-DD`.
