---
name: write-handoff
description: Write a short handoff note so a fresh session can continue without re-reading old chats. Use at the end of a session or before context gets large.
---
# Write handoff

> Used by: **team-lead**. Runs where it is invoked (needs the current context); just do the steps.


Create `project/handoffs/YYYY-MM-DD-HHMM.md` (≤25 lines):

```
# Handoff YYYY-MM-DD HH:MM
Done:        <bullets, with file paths / commit hashes>
In progress: <what, where it stopped, branch>
Next step:   <the exact next action and owner — one line a new session can execute>
Read first:  <max 5 file paths>
Watch out:   <gotchas, failing tests, pending approvals>
```

Then run `track-progress`. Keep only the 5 newest handoffs; summarize older ones into
`project/archive.md` (2–3 lines each) and delete the files.
A new session reads only `project/progress.md` + the newest handoff.
