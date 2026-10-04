---
name: track-progress
description: Keep project/progress.md current and under 40 lines after every step. Use after any agent finishes work or state changes.
---
# Track progress

> Used by: **team-lead**. Runs where it is invoked (needs the current context); just do the steps.


Update `project/progress.md` in place. Keep it **under 40 lines** — it is read at the start of every session.

```
Phase:          Discovery | Specs | Design | Tech plan | Setup | Planning | Build (sprint n) | Release
Current spec:   02-booking (writing)
Current ticket: PROJ-12 - in review
Specs:          01 approved, 02 writing, 03 questions sent
Open questions: Q7 payment provider (asked product owner, default A)
Blockers:       none
Last step:      reviewer asked for 1 fix
Next step:      developer applies fix
Tracker:        Jira PROJ (PROJ-10..PROJ-24)
```

## Rules
- Replace lines; never append history. Finished items (approved specs, closed tickets, solved blockers)
  move to `project/archive.md` as one dated line each.
- Ticket states: todo → in progress → in review → changes needed → approved → testing → done.
- If it grows past 40 lines, move detail into the file it belongs to and link it.
