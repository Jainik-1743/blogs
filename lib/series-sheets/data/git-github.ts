import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "git-github" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "Everything you reach for in daily Git, from the first commit to undoing mistakes and working with a team on GitHub. Git stores **snapshots** (commits), and a branch is only a **label** that points at one.",
  sections: [
    {
      title: "The model in 30 seconds",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "A **commit** is a snapshot of the whole project, with a parent, an author, a message and a hash.",
            "A **branch** is a movable label on a commit. `HEAD` says which branch (or commit) you are on.",
            "Work moves through three places: **working tree** → **staging area** (`add`) → **repository** (`commit`).",
            "Git compares by **hash**, so equal content has an equal hash, and history cannot change silently.",
          ],
        },
        {
          kind: "table",
          head: ["Place", "You get there with", "Undo with"],
          rows: [
            ["Working tree", "Edit a file", "`git restore FILE`"],
            ["Staging area", "`git add FILE`", "`git restore --staged FILE`"],
            ["Repository", "`git commit`", "`git reset` or `git revert`"],
          ],
        },
      ],
    },
    {
      title: "Daily loop",
      lesson: 1,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["git status", "What changed, what is staged"],
            ["git add -p", "Stage piece by piece (small commits)"],
            ["git commit -m \"msg\"", "Save the staged snapshot"],
            ["git diff", "Unstaged changes"],
            ["git diff --staged", "What the next commit will contain"],
            ["git log --oneline --graph", "Short history with branches"],
            ["git log -S\"text\"", "Find commits that added or removed text"],
            ["git show HASH", "One commit in full"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Small commits with a clear message make every later tool (`bisect`, `revert`, review) easier.",
        },
      ],
    },
    {
      title: "Good commit messages",
      lesson: 1,
      blocks: [
        {
          kind: "points",
          items: [
            "First line: **short** (about 50 characters), in the imperative: \"Fix login redirect\".",
            "Blank line, then the **why** if it is not obvious. The diff already shows the what.",
            "One idea per commit. If the message needs \"and\", it is probably two commits.",
            "Put build output, secrets and editor files in `.gitignore` before the first `add`.",
          ],
        },
      ],
    },
    {
      title: "Branches and merging",
      lesson: 2,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["git switch -c NAME", "Create a branch and move to it"],
            ["git switch NAME", "Move to an existing branch"],
            ["git branch -d NAME", "Delete a merged branch"],
            ["git merge NAME", "Join NAME into the current branch"],
            ["git merge --abort", "Back out of a merge in trouble"],
          ],
        },
        {
          kind: "table",
          head: ["Merge kind", "When", "Result"],
          rows: [
            ["Fast-forward", "Target has no new commits", "Label just moves ahead"],
            ["Merge commit", "Both sides have new commits", "A commit with two parents"],
            ["Conflict", "Both changed the same lines", "You edit, `add`, then commit"],
          ],
        },
      ],
    },
    {
      title: "Fixing a merge conflict",
      lesson: 2,
      blocks: [
        {
          kind: "steps",
          items: [
            "`git status` lists the files marked \"both modified\".",
            "Open each file and find the `<<<<<<<`, `=======` and `>>>>>>>` markers.",
            "Keep the right lines, delete the three marker lines, and save.",
            "`git add FILE`, then `git commit` (or `git merge --continue`).",
            "Run the tests. Keep branches short-lived so conflicts stay small.",
          ],
        },
      ],
    },
    {
      title: "Remotes: fetch, pull, push",
      lesson: 3,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["git remote -v", "Show the remotes and their URLs"],
            ["git fetch", "Download new commits, change nothing locally"],
            ["git pull", "`fetch` plus a merge into your branch"],
            ["git pull --rebase", "`fetch` plus a rebase (straighter history)"],
            ["git push -u origin NAME", "Send a branch and remember it"],
            ["git push", "Send the current branch"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "When unsure, `fetch` first. It is always safe, and you can look before you merge.",
        },
      ],
    },
    {
      title: "Pull request flow",
      lesson: 3,
      blocks: [
        {
          kind: "steps",
          items: [
            "Branch from an up-to-date `main`, make small commits, push the branch.",
            "Open the pull request. Say **what** changed, **why**, **how** you tested it, and what to look at.",
            "Reviewers comment. Answer every comment, push fixes as new commits.",
            "Merge (merge commit, squash or rebase, as the team chose), then delete the branch.",
          ],
        },
      ],
    },
    {
      title: "Undo: which tool?",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["I want to…", "Use", "Safe on shared history?"],
          rows: [
            ["Drop edits to a file", "`git restore FILE`", "Yes (local only)"],
            ["Fix the last commit", "`git commit --amend`", "Only before pushing"],
            ["Move the branch back", "`git reset --soft/--mixed/--hard`", "Only before pushing"],
            ["Undo a pushed commit", "`git revert HASH`", "Yes: adds a new commit"],
            ["Get a lost commit back", "`git reflog`, then `git switch -c`", "Yes"],
            ["Park work for later", "`git stash` / `git stash pop`", "Yes (local)"],
          ],
        },
      ],
    },
    {
      title: "The three kinds of reset",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Flag", "Branch moves", "Staging area", "Files"],
          rows: [
            ["`--soft`", "Yes", "Kept", "Kept"],
            ["`--mixed` (default)", "Yes", "Cleared", "Kept"],
            ["`--hard`", "Yes", "Cleared", "**Overwritten**"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`--hard` throws away uncommitted work. If you already committed it, `git reflog` can still find it.",
        },
      ],
    },
    {
      title: "Find and copy commits",
      lesson: 4,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["git cherry-pick HASH", "Copy one commit onto this branch"],
            ["git bisect start", "Begin a binary search for a bad commit"],
            ["git bisect good / bad", "Tell it how each checked commit behaves"],
            ["git bisect reset", "Finish and return to your branch"],
            ["git reflog", "Every place HEAD has been (your safety net)"],
          ],
        },
      ],
    },
    {
      title: "Rebase and clean history",
      lesson: 5,
      blocks: [
        {
          kind: "points",
          items: [
            "`git rebase main` replays your commits on top of the new `main`: a straight line, new hashes.",
            "`git rebase -i HEAD~N` lets you **squash**, **reword**, **drop** or reorder your last N commits.",
            "Rebase only commits **nobody else has**. Rewriting shared history breaks other people's copies.",
            "After a rebase you must force push: use `git push --force-with-lease`, never plain `--force`.",
          ],
        },
        {
          kind: "code",
          lang: "bash",
          code: "git switch feature\ngit rebase main\n# fix any conflicts, then:\ngit rebase --continue\ngit push --force-with-lease",
        },
      ],
    },
    {
      title: "Team rules on GitHub",
      lesson: 5,
      blocks: [
        {
          kind: "points",
          items: [
            "**Branch protection** on `main`: require a pull request, passing checks and a review.",
            "**CODEOWNERS** names who must review which paths, so changes reach the right people.",
            "**GitHub Actions** runs tests on every push: a file in `.github/workflows/` with `on`, `jobs`, `steps`.",
            "Pick one workflow (merge, squash or rebase) and write it down, so history stays consistent.",
          ],
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["Merge vs rebase?", "Merge keeps true history; rebase rewrites it into a line. Never rebase shared commits."],
            ["fetch vs pull?", "`pull` is `fetch` plus merge (or rebase)."],
            ["reset vs revert?", "`reset` moves the branch (local). `revert` adds an undoing commit (safe when shared)."],
            ["What is HEAD?", "A pointer to the commit or branch you are on."],
            ["Lost a commit?", "`git reflog` lists where HEAD was; switch to that hash."],
          ],
        },
      ],
    },
  ],
};
