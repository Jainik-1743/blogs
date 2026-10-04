---
name: define-terms
description: Build and maintain a glossary so everyone uses the same words for the same things. Use when new domain terms appear or words are used inconsistently.
context: fork
agent: analyst
model: sonnet
effort: medium
background: false
---
# Define terms

> Owner: **analyst** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-analyst`. Inside the agent, just do the steps.


Maintain `project/glossary.md` as a table:

| Term | Meaning | Not to be called | Code name |
|---|---|---|---|
| Member | A paying customer with an account | user, client | `Member` |

## Rules
- Add a term when it appears in the brief, a question answer or a spec and could be misunderstood.
- One word per concept. If two words are used for one thing, pick one (recommend which) and list the other under "Not to be called".
- Code name = the identifier developers use (class, table, route). Keep it consistent across FRD, UI copy and code.
- When a term changes, grep `docs/` and flag every place that still uses the old word.
