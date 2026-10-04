---
name: build-step-by-step
description: Make one small change, verify it, commit it, then take the next step. Use for any multi-step implementation to keep changes safe and reviewable.
---
# Build step by step

> Used by: **developer**. Runs where it is invoked (needs the current context); just do the steps.


1. Write the plan as ≤7 steps in the ticket file under `Plan:` — each step leaves the app working.
2. For each step:
   - change ≤ ~100 lines, touching as few files as possible;
   - run the fast checks for what you touched (related tests + typecheck + lint on changed files);
   - commit with a Conventional Commit message referencing the ticket (`feat(booking): lock slot row PROJ-12`);
   - tick the step.
3. If a step fails twice, stop and re-plan that step smaller; don't pile changes on a red build.
4. Pull/rebase from main before the last step to surface conflicts early.

Keep notes for the reviewer in the ticket (`Notes for review:`) — decisions, trade-offs, known limits.
