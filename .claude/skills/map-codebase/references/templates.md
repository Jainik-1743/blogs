# project/architecture.md
```
# Architecture (as built)          Mapped at: a1b2c3d on 2026-10-03
Stack:       Next.js 16 (App Router) · Postgres via Drizzle · Auth.js · Vercel
Run:         pnpm dev (http://localhost:3000) · pnpm test · pnpm e2e
Entry points: app/layout.tsx · app/api/*/route.ts · scripts/seed.ts
Layers:      UI (app/, src/features/*/ui) -> actions (src/features/*/actions.ts) -> db (src/shared/db)
Data flow:
  ```mermaid
  flowchart LR  Browser --> App[Next.js] --> DB[(Postgres)]; App --> Stripe; App --> Resend
  ```
External services: Stripe (payments, src/shared/stripe.ts) · Resend (email)
Auth & roles: session cookie; roles customer/admin checked in src/shared/auth.ts
Environments: local · preview (per PR) · production
Drift from planned design: none
```

# project/modules.md
```
# Modules                          Mapped at: a1b2c3d on 2026-10-03
| Path | Purpose | Key files | Depends on |
|---|---|---|---|
| src/features/booking | create/cancel bookings | actions.ts, save.ts, ui/Calendar.tsx | shared/db, shared/auth |
```

# project/memory.md
```
# Memory                           Mapped at: a1b2c3d on 2026-10-03
## Commands (verified)
- pnpm test:e2e needs `pnpm db:seed` first
## Conventions
- Server actions return { ok, error } — never throw to the client (src/features/*/actions.ts)
## Gotchas
- Dates are stored UTC; UI converts with src/shared/time.ts — don't use new Date().toLocaleString
## Q&A (learned)
- Q: where are emails sent? A: src/shared/email.ts via Resend; templates in emails/ (2026-10-03)
```

# project/archive.md
```
# Archive (newest first, append-only; read only for history questions)
## 2026-10-03
- Shipped: online booking (PROJ-12, PROJ-30) — release 0.2.0
- Retired fact: "payments via invoice only" (replaced by D12 Stripe)
- Handoff 2026-09-28: moved from project/handoffs/
```
