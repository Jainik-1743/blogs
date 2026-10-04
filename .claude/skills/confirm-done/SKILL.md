---
name: confirm-done
description: Before claiming work is done, run tests, lint, type checks and build and show the real output. Use whenever about to say a task, ticket or fix is complete.
---
# Confirm done

> Used by: **developer**. Runs where it is invoked (needs the current context); just do the steps.


Run and paste the **real** final lines of each:

```
Tests:      npm test            -> 48 passed, 0 failed
Lint:       npm run lint        -> 0 problems
Types:      npm run typecheck   -> 0 errors
Build:      npm run build       -> success
E2E (if UI):npm run test:e2e -- booking -> 3 passed
Checks:     PROJ-12  2/2 acceptance checks have passing tests (names listed)
Diff:       git status clean, all commits pushed to feature/PROJ-12-booking
```

## Rules
- No command output → not done. "Should work" is not evidence.
- Any failure → fix it or report it clearly; never say "done, except...".
- Map every acceptance check to a passing test name. Missing one = not done.
- Then set ticket `Status: in review`.
