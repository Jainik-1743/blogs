---
name: map-user-flows
description: List user types and their goals and draw each journey step by step as a diagram. Use before wireframing or when a feature's user journey is unclear.
context: fork
agent: designer
model: sonnet
effort: medium
background: false
---
# Map user flows

> Owner: **designer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-designer`. Inside the agent, just do the steps.


Write `docs/design/flows.md`:

1. **User types** — table: type (glossary word), goal, how often, device, skill level.
2. **Flows** — one per key journey (sign up, book, pay, admin approve...). For each:
   - trigger → steps → success end; plus every branch (error, cancel, no permission, empty).
   - Mermaid diagram:
   ```mermaid
   flowchart LR
     A[Service list] --> B[Calendar] --> C{Slot free?}
     C -- yes --> D[Confirm] --> E[Success]
     C -- no --> F[Not available] --> B
   ```
3. **Screen list** → `docs/design/screens.md`: screen, purpose, data shown, primary action, flows it appears in.

## Rules
- Steps reference FRD flow numbers (`02-booking F2`). Every FRD flow must appear.
- Count clicks to the goal; flag any flow over 5 steps for simplification.
