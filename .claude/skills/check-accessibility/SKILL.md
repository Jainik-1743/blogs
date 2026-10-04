---
name: check-accessibility
description: "Check screens for WCAG 2.2 AA: contrast, keyboard use, focus, labels, alt text, motion and screen-reader support. Use on new or changed UI."
context: fork
agent: designer
model: sonnet
effort: medium
background: false
---
# Check accessibility (WCAG 2.2 AA)

> Owner: **designer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-designer` or `role-tester`. Inside the agent, just do the steps.


## Automated first
If the app runs: use axe (`npx @axe-core/cli <url>`) or Playwright + `@axe-core/playwright`. Paste the violation summary.

## Manual checks
- Keyboard only: Tab reaches everything in a logical order; Enter/Space activate; Esc closes modals; focus is trapped in modals and returned after.
- Focus is always visible (≥3:1 contrast).
- Contrast: text 4.5:1, large text and UI parts 3:1 — both themes.
- Every input has a visible `<label>`; errors are linked with `aria-describedby` and announced.
- Images: meaningful `alt`, decorative `alt=""`. Icon-only buttons have `aria-label`.
- Semantic HTML first (`button`, `nav`, `main`, headings in order); ARIA only when needed.
- Text resizes to 200% without loss; nothing relies on color alone.
- Respect `prefers-reduced-motion`. Touch targets ≥24px (aim 44px).

Output: `issue | WCAG ref | where | fix`, BLOCKER issues first.
