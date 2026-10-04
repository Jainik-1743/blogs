---
name: build-design-system
description: Define design tokens and shared components (color, type, spacing, buttons, forms, cards, tables, modals) with light and dark mode. Use once per project before building UI.
context: fork
agent: designer
model: sonnet
effort: medium
background: false
---
# Build design system

> Owner: **designer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-designer`. Inside the agent, just do the steps.


Outputs: `docs/design/tokens.css` (or the stack's equivalent, e.g. Tailwind theme) + `docs/design/design-system.md`.

1. **Tokens** as CSS variables: color (semantic: `--bg`, `--fg`, `--muted`, `--primary`, `--danger`, `--success`, `--border`),
   type scale (6 sizes), spacing (4px base: 4/8/12/16/24/32/48), radius, shadow, motion duration.
   Dark mode by redefining the same variables under `[data-theme=dark]` and `prefers-color-scheme`.
2. **Components** — for each: purpose, variants, states (hover/focus/disabled/loading/error), accessibility notes:
   button, input, select, checkbox, textarea, form field (label+help+error), card, table, modal, toast, tabs, badge, empty state, skeleton.
3. **Rules**: one primary button per view; focus ring always visible; minimum 44px touch targets.

## Rules
- If the stack has a component library (shadcn/ui, MUI...), map tokens onto it instead of rebuilding components.
- Contrast: text ≥4.5:1, large text/UI ≥3:1 in BOTH themes — verify, don't assume.
- Code uses tokens only; no raw hex values in components.
