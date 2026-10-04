---
name: build-ui
description: Turn approved wireframes into production UI code using the design system tokens and all five states. Use when a ticket includes screens or components.
context: fork
agent: developer
model: sonnet
effort: high
background: false
---
# Build UI

> Owner: **developer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-developer`. Inside the agent, just do the steps.


Inputs: ticket, approved wireframe, `docs/design/design-system.md`, tokens.

1. Find existing components first (grep the components folder). Reuse > extend > create.
2. Build the screen in the feature folder (`src/features/<feature>/`); shared pieces go to `src/shared/ui/`.
3. Implement all 5 states from the wireframe; wire real loading/error from the API layer.
4. Styling only through tokens / the component library theme. No raw colors or magic spacing.
5. Accessibility as you build: semantic elements, labels, focus management, keyboard paths.
6. Test: component tests for states + one e2e for the main flow (Playwright).
7. Look at it: run the app and check 375px and 1280px, both themes. Fix before `confirm-done`.

## Rules
- Copy text from the FRD/glossary exactly.
- Don't block the UI on missing backend: use a typed mock behind the same interface, and note it in the ticket.
