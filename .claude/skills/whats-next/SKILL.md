---
name: whats-next
description: Pick the single next action and the right agent from project state using a fixed routing table. Use when deciding what to do next in the project.
context: fork
agent: team-lead
model: sonnet
effort: low
background: false
---
# Whats next

> Owner: **team-lead** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-team-lead`. Inside the agent, just do the steps.


Input: `project/progress.md` (+ newest handoff). Do not read anything else unless a rule below needs it.

## Routing table (first matching row wins)
| State | Next action | Owner |
|---|---|---|
| User asked a question about the code | Answer from the knowledge base | codebase-expert |
| A gate is "awaiting approval" | Ask user to approve that file | you |
| BLOCKER question unanswered and no default | Ask the user (or whoever owns the requirement) | you |
| No `docs/frd/00-spec-list.md` | Big-picture questions + spec list | analyst |
| Next spec has no answered question round | Per-spec questions | analyst |
| Spec questions answered, no FRD file | Write FRD section | spec-writer |
| FRD approved, UI involved, no design | Flows → wireframes → checks | designer |
| No approved `docs/tech/architecture.md` | Tech plan | architect |
| No `project/tools.md` or check-setup failing | Setup + connect tools | setup-engineer |
| Code exists, no `project/architecture.md` | Map the codebase | codebase-expert |
| Approved FRD sections without tickets | Tickets + sprint | project-manager |
| Ticket "in review" | Review | reviewer |
| Review "changes needed" | Apply feedback | developer |
| Ticket "approved" | Test like a user | tester |
| Test failed | Fix bug | developer |
| Ticket passed test | Close ticket + update | project-manager |
| Sprint tickets all done | Release | release-manager |
| Released | Docs + sprint review, then refresh the map | doc-writer → codebase-expert |
| Sprint has open tickets | Build next ticket | developer |

## Rules
- One action, one owner. Finish in-flight work before starting new work.
- Work that does not depend on an open question continues (e.g. build spec 1 while spec 2 waits).
- Output: `Next / Owner / Brief (exact prompt with file paths) / Blocked`.
