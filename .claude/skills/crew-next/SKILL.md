---
name: crew-next
description: "Do the next step of the project: ask the team lead what's next, delegate it to the right agent, and update progress."
disable-model-invocation: true
argument-hint: "[optional note, e.g. 'approved' or an answer]"
---
# /crew-next

Each agent runs on the model set in its file (opus for hard thinking, haiku for simple work): when delegating, never pass a model override. No subagent support (Codex, Cursor...)? Instead of delegating, follow the `role-<agent>` skill yourself.

User note: $ARGUMENTS

1. If the note approves or answers something, record it first (approval → `project/decisions.md`; answer → the question file + remove from Open questions).
2. Apply the `whats-next` skill (or delegate to the **team-lead** agent) to get: Next / Owner / Brief.
3. If Owner is "you": show what needs approval or an answer, with a recommendation. Stop.
4. Otherwise delegate the Brief to the Owner agent. Pass file paths, not file contents.
5. When it returns, run `track-progress`. Show the user ≤8 lines: what was done, files, what's next.
6. Independent steps (e.g. spec 2 questions while spec 1 is built) may run as parallel agents.
