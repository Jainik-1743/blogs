---
name: crew-start
description: "Start a new project from a requirements brief: set up project state, run the big-picture question round and propose the spec list."
disable-model-invocation: true
argument-hint: <path to brief or pasted requirements>
---
# /crew-start

Each agent runs on the model set in its file (opus for hard thinking, haiku for simple work): when delegating, never pass a model override. No subagent support (Codex, Cursor...)? Instead of delegating, follow the `role-<agent>` skill yourself.

Requirements: $ARGUMENTS

1. If `project/progress.md` is missing, create the `project/` files (progress, decisions, glossary, shared-questions, assumptions, handoffs/).
   If it exists and Phase is not Discovery, stop and suggest `/crew-next` instead.
2. Save the requirements verbatim to `docs/brief.md` (if a path was given, copy that file).
3. Delegate to the **analyst** agent (big-picture mode) with: `docs/brief.md`. It returns question cards and a draft `docs/frd/00-spec-list.md`.
4. Show the user the question cards (BLOCKER first) using the AskUserQuestion tool when available — one question per card, recommended option first.
   Record answers; unanswered → default, logged in `project/assumptions.md`.
5. Update `project/progress.md`: Phase Discovery → "awaiting spec list approval".
6. End with: the spec list, and "Approve with `/crew-next`, or tell me what to change."
