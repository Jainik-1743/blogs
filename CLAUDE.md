@AGENTS.md

<!-- devcrew:start -->
## devcrew
- State lives in `project/`: read `project/progress.md` (+ latest `project/handoffs/` note) before anything else; never re-read old chats.
- Specs: `docs/frd/NN-name.md`. Tickets keep IDs in progress.md. Decisions: one line in `project/decisions.md`.
- Commands: `/crew-start` begin · `/crew-next` do next step · `/crew-status` where are we · `/crew-change` requirements changed.
- Every choice is given as Decision / Options / Recommended. Questions use question cards with a default.
- Questions about the code: read `project/memory.md` + `project/modules.md` first, then verify in code (skill: answer-codebase-question). No map yet → `/map-codebase`.
- Never say "done" without showing test, lint and type-check output (skill: confirm-done).
- Approval gates: spec list, each FRD section, designs, tech plan, sprint, release.
- Skills with an "Owner:" line run inside that agent, on the model set for that work (Claude Code does this automatically). When you delegate with the Agent tool, never pass a model: the agent file sets it.
- Subagents return <= 10 lines + file paths, never full file dumps.
<!-- devcrew:end -->
