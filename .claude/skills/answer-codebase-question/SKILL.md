---
name: answer-codebase-question
description: Answer questions about the codebase using the project knowledge base first (memory, modules, architecture), then verify in code and cite file:line. Use for "where/how/why does X work" questions about this project.
context: fork
agent: codebase-expert
model: sonnet
effort: medium
background: false
---
# Answer codebase question

> Owner: **codebase-expert** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-codebase-expert`. Inside the agent, just do the steps.


1. **Look up first** (cheap): `project/memory.md` (Q&A, gotchas) → `project/modules.md` (where) → `project/architecture.md` (how it fits).
   History questions ("why did we...", "when was...") → `project/decisions.md`, then `project/archive.md`.
2. **Verify**: open only the files the lookup points to; read just the relevant part. Confirm the answer in code.
   No knowledge base yet? Say so, answer from a targeted search (grep/glob), and suggest `/map-codebase`.
3. **Answer**: direct answer first, then evidence as `path:line`. Mark anything unverified.
4. **Keep the map true**:
   - lookup was wrong or stale → fix that line (and bump nothing else);
   - the answer took real digging and will be asked again → add one line under `## Q&A (learned)` in `memory.md` with the date;
   - `memory.md` over 150 lines → move the oldest Q&A to `archive.md`.
5. Many changes since `Mapped at` in the area you touched (`git diff --stat <commit>..HEAD -- <path>`)? Suggest `/map-codebase` refresh.

Never answer from the knowledge base alone when the code is available — it is an index, not the truth.
