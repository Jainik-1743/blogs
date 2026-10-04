---
name: design-api
description: Design API endpoints with request, response, errors, auth and pagination in a consistent style. Use before building backend endpoints or integrations.
context: fork
agent: architect
model: opus
effort: high
background: false
---
# Design API

> Owner: **architect** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-architect`. Inside the agent, just do the steps.


Write `docs/tech/api.md` (or an OpenAPI file if the stack generates docs from it):

Per endpoint:
```
POST /bookings                      auth: customer      ticket: PROJ-12
Request:  { serviceId: string, start: ISO-8601 }
201:      { id, serviceId, start, status: "confirmed" }
Errors:   400 invalid input · 401 not logged in · 403 not allowed · 409 slot taken · 422 rule broken
Notes:    idempotency key header; locks slot row
```

## Conventions (state once at the top)
- Resource naming, plural nouns; JSON camelCase; ISO-8601 UTC dates.
- One error shape: `{ error: { code, message, field? } }`.
- Pagination (cursor), filtering, sorting conventions.
- Auth method and role checks per endpoint. Rate limits for public endpoints.
- Versioning strategy. Validation at the boundary (schema library of the stack).
