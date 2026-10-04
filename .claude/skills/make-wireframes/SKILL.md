---
name: make-wireframes
description: Create simple grayscale clickable HTML wireframes for each screen, covering all five states. Use after user flows and the screen list exist.
context: fork
agent: designer
model: sonnet
effort: medium
background: false
---
# Make wireframes

> Owner: **designer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-designer`. Inside the agent, just do the steps.


For each screen in `docs/design/screens.md` → `docs/design/wireframes/<screen>.html`.

## Rules
- Single self-contained HTML file, no external assets, grayscale only, system font. Links between screens follow the flows.
- A state switcher at the top: **normal · loading · empty · error · success** (every screen has all 5).
- Real-looking content from the FRD (names, prices, dates) — never lorem ipsum.
- Mark the one primary action per screen. Label every input. Show validation messages.
- Responsive: test at 375px and 1280px widths.
- Add `docs/design/wireframes/index.html` linking every screen.
- Use `references/states.md` for what each state must show.
