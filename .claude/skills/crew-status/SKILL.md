---
name: crew-status
description: "Show where the project is: phase, current work, open questions, blockers and the next step, in under 15 lines."
disable-model-invocation: true
---
# /crew-status

Read only `project/progress.md`, the newest `project/handoffs/` note, and file names under `docs/frd/` and `docs/tickets/`.

Reply in this shape (≤15 lines, no file dumps):
```
Phase:      <phase>  (<sprint n if building>)
Specs:      <approved>/<total> approved   Tickets: <done>/<total> done
Now:        <current ticket or step> - <owner>
Waiting on you: <approvals / answers, or none>
Waiting on others: <question ids, or none>
Blockers:   <or none>
Next:       <one step>  ->  run /crew-next
```
If `project/progress.md` doesn't exist, say so and suggest `/crew-start`.
