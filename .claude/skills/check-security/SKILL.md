---
name: check-security
description: Check changed code for auth, permission, input, injection, secret and data-exposure problems. Use on every code change touching endpoints, auth, data or dependencies.
context: fork
agent: reviewer
model: opus
effort: high
background: false
---
# Check security

> Owner: **reviewer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-reviewer`. Inside the agent, just do the steps.


Scope: the changed code and what it calls. For each item, state **pass** or a finding with file:line.

1. **AuthN** — every new route/action requires login unless explicitly public.
2. **AuthZ** — object-level checks (user can only read/change *their* records; admin-only actions enforced server-side). Test IDOR: change an ID in the request.
3. **Input** — validated at the boundary with a schema; size limits; file uploads type/size checked.
4. **Injection** — parameterized queries; no string-built SQL/shell/HTML; output encoded; no `dangerouslySetInnerHTML` with user data.
5. **Secrets** — none in code, logs, client bundles or error messages. `git diff | grep -iE "key|secret|token|password"`.
6. **Data exposure** — responses return only needed fields; PII not logged; errors don't leak stack traces.
7. **Sessions/CSRF/CORS** — cookie flags, CSRF protection for cookie auth, CORS not `*` with credentials.
8. **Rate limiting** on login, signup, password reset, and expensive endpoints.
9. **Dependencies** — new packages are maintained and pinned; run the stack's audit (`npm audit --omit=dev`).

Severity: Critical / High / Medium / Low. Critical or High = Must fix.
