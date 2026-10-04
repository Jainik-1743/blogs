---
name: design-database
description: "Design the data model: entities, fields, relations, constraints, indexes and migrations. Use after architecture is chosen and before building features that store data."
context: fork
agent: architect
model: opus
effort: high
background: false
---
# Design database

> Owner: **architect** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-architect`. Inside the agent, just do the steps.


Write `docs/tech/database.md`:

1. **ER diagram** (Mermaid `erDiagram`) for all entities in the FRD Data sections.
2. **Per table/collection**: fields (name, type, null?, default), primary key, foreign keys with on-delete behaviour, unique constraints, check constraints.
3. **Indexes**: one line per index with the query it serves. No index without a query.
4. **Integrity rules from the FRD** enforced in the database where possible (e.g. no double booking → unique/exclusion constraint), not only in code.
5. **Sensitive data**: mark PII; retention period; encryption needs; soft vs hard delete.
6. **Migrations**: tool, naming, how to roll back; seed data for local/dev.

## Rules
- Names follow the glossary code names. Timestamps in UTC (`created_at`, `updated_at`).
- Use the ORM/migration tool of the chosen stack; schema lives in code, this doc explains it.
