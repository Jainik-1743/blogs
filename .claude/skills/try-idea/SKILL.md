---
name: try-idea
description: Run a small time-boxed throwaway experiment to answer one technical unknown, record the answer, then delete the code. Use when a design decision depends on something unproven.
context: fork
agent: architect
model: opus
effort: high
background: false
---
# Try idea (spike)

> Owner: **architect** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-architect`. Inside the agent, just do the steps.


1. Write the question as one line with a yes/no or number answer:
   "Can Supabase realtime push 500 updates/s to 100 clients?"
2. Time-box: state the limit (default 30 minutes of work).
3. Build the smallest thing that answers it in `spikes/<slug>/` (or a scratch dir). No tests, no polish.
4. Run it; capture the real output/numbers.
5. Record in `docs/tech/spikes.md`: question · approach · result (with numbers) · decision it supports.
6. Delete the spike code (don't let it become production code). `log-decision` the outcome.

If the time-box runs out: record what was learned and recommend a default with its risk.
