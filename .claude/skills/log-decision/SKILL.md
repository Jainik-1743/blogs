---
name: log-decision
description: Record a decision with its reason and rejected alternatives as one line in project/decisions.md. Use whenever a meaningful choice is made or approved.
---
# Log decision

> Used by: **analyst**, **architect**, **spec-writer**. Runs where it is invoked (needs the current context); just do the steps.


Append one line to `project/decisions.md`:

```
YYYY-MM-DD | D12 | <decision> | because <reason> | rejected: <alternatives> | by <who approved: user/stakeholder/agent> | refs: <files>
```

## Rules
- Log choices someone could later ask "why?" about: scope, tech, data, UX patterns, approvals, defaults used.
- Never edit old lines. A reversed decision gets a new line: `supersedes D7`.
- Before deciding something, grep this file — don't re-decide what's already settled.
