---
name: connect-tools
description: Connect GitHub, the ticket tracker, Slack, Figma, error tracking and other tools, and record what is connected. Use during project setup or when a tool is missing.
context: fork
agent: setup-engineer
model: sonnet
effort: medium
background: false
---
# Connect tools

> Owner: **setup-engineer** agent (Claude Code runs this skill as it, on its model). No subagents: follow `role-setup-engineer`. Inside the agent, just do the steps.


1. Detect what's available: MCP servers in this session, CLIs (`gh auth status`, `jira`, `linear`, `vercel`, ...), env vars.
2. For each needed tool (from `docs/tech/architecture.md` and the brief), choose the cheapest working path:
   MCP server > official CLI > REST API with a token > local files fallback.
3. Anything needing login, OAuth or admin rights → give the user the exact command (e.g. `! gh auth login`) and wait.
4. Record `project/tools.md`:
```
| Tool    | Purpose        | How           | Status    | Project/space |
| GitHub  | code, PRs, CI  | gh CLI        | connected | org/repo      |
| Jira    | tickets        | Atlassian MCP | connected | PROJ          |
| Slack   | updates        | Slack MCP     | missing   | #proj-updates |
```
## Rules
- Never paste tokens into files or chat; use the tool's own credential store or `.env` (git-ignored).
- Default ticket tool: Jira if connected, else GitHub Issues, else `docs/tickets/` files.
