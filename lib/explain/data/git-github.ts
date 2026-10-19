import type { ExplainerData } from "../types.ts";

/** Explainers for the "git-github" series. Names must start with "git-github-" followed by the lesson number. */
export const DATA: ExplainerData = {
  /* ------------------------------------------------------------ lesson 0 */
  "git-github-0-branches-are-pointers": {
    kind: "flow",
    title: "Commits, branches and HEAD are just pointers",
    nodes: [
      { id: "c1", label: "ece15ae", sub: "Add hello.txt", col: 0, row: 1, tone: "data" },
      { id: "c2", label: "4f4e045", sub: "Add second line and docs", col: 1.7, row: 1, tone: "data" },
      { id: "c3", label: "9a8b7c6", sub: "next commit", col: 3.4, row: 1, tone: "data" },
      { id: "main", label: "main", sub: "branch", col: 1.7, row: 0, tone: "store" },
      { id: "feature", label: "feature", sub: "branch", col: 3.4, row: 0, tone: "store" },
      { id: "head", label: "HEAD", sub: "where I am now", col: 4.8, row: 0, tone: "warn" },
    ],
    edges: [
      { id: "e-p2", from: "c2", to: "c1", label: "parent" },
      { id: "e-p3", from: "c3", to: "c2", label: "parent" },
      { id: "e-main", from: "main", to: "c2" },
      { id: "e-feat2", from: "feature", to: "c2" },
      { id: "e-feat3", from: "feature", to: "c3" },
      { id: "e-head", from: "head", to: "feature" },
    ],
    steps: [
      {
        title: "The first commit has no parent",
        note: "A commit is a small object: a snapshot of the whole project, an author, a message and a link to its parent. The very first commit is the root, so it has no parent line.",
        appear: ["c1"],
        focus: ["c1"],
      },
      {
        title: "Each new commit names its parent",
        note: "The second commit stores the hash of the first one in its parent line. History is only this chain, and git log simply walks it back from the newest commit.",
        appear: ["c2", "e-p2"],
        focus: ["c2", "e-p2"],
      },
      {
        title: "A branch is a label on one commit",
        note: "main is a text file, .git/refs/heads/main, with one hash inside. It is not a copy of your files. Creating or moving a branch means changing that one line.",
        appear: ["main", "e-main"],
        focus: ["main", "e-main"],
      },
      {
        title: "git branch feature adds a second label",
        note: "The new branch costs almost nothing: one more small file with the same hash. Right now main and feature point to the same commit.",
        appear: ["feature", "e-feat2"],
        focus: ["feature", "e-feat2"],
      },
      {
        title: "git switch feature points HEAD at it",
        note: "HEAD says where you are now, and it usually holds a branch name. Before this step it pointed at main. Now .git/HEAD reads ref: refs/heads/feature.",
        appear: ["head", "e-head"],
        focus: ["head", "e-head"],
      },
      {
        title: "A commit moves only the branch you stand on",
        note: "Git makes the new commit with the current commit as parent, then writes the new hash into feature. main stays behind. That is all 'the branch moves forward' means.",
        appear: ["c3", "e-p3", "e-feat3"],
        hide: ["e-feat2"],
        focus: ["c3", "feature", "e-feat3"],
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 1 */
  "git-github-1-add-patch": {
    kind: "flow",
    title: "One messy edit becomes two clean commits",
    nodes: [
      { id: "wt", label: "Working tree", sub: "cart.py: docstring and tax()", col: 0, row: 1, tone: "client" },
      { id: "stage", label: "Staging area", sub: "empty", col: 1.8, row: 1, tone: "queue" },
      { id: "repo", label: "Repository", sub: "newest: Add .gitignore", col: 3.6, row: 1, tone: "store" },
      { id: "status", label: "git status --short", sub: "M cart.py", col: 1.8, row: 0, tone: "plain" },
    ],
    edges: [
      { id: "e-add", from: "wt", to: "stage", label: "git add -p" },
      { id: "e-commit", from: "stage", to: "repo", label: "git commit" },
    ],
    steps: [
      {
        title: "Two changes sit in one file",
        note: "In cart.py you added a docstring to total() and a new tax() function. They are two ideas, but git diff shows them close together, so Git offers them as one hunk (one block of changes).",
        appear: ["wt", "stage", "repo", "status"],
        focus: ["wt"],
      },
      {
        title: "git add -p lets you pick parts of the file",
        note: "The p stands for patch. Git first shows one hunk, and you answer s to split it into two smaller hunks: the docstring and tax().",
        appear: ["e-add"],
        focus: ["wt", "e-add"],
      },
      {
        title: "Answer y for the docstring and n for tax()",
        note: "Only the chosen hunk goes to the staging area. The status now says MM: the file has a staged part (left letter) and an unstaged part (right letter).",
        set: { stage: "docstring only", status: "MM cart.py" },
        focus: ["stage", "status"],
      },
      {
        title: "Commit the staged part",
        note: "git diff --staged shows exactly what the next commit holds, so read it first. Then git commit saves only the docstring. The tax() edit stays in the working tree.",
        appear: ["e-commit"],
        set: { stage: "empty", repo: "newest: Document total()", status: "M cart.py" },
        focus: ["e-commit", "repo"],
      },
      {
        title: "Commit what is left",
        note: "git commit -a stages every change to tracked files and commits in one step. Here that is fine, because only tax() remains. It skips untracked files.",
        set: { wt: "clean", repo: "newest: Add tax()", status: "(nothing to show)" },
        focus: ["repo", "status"],
      },
      {
        title: "Each commit does one thing",
        note: "The log now has Document total() and Add tax() as separate commits. A reviewer reads each in a minute, and either one can be undone alone later.",
        set: { repo: "Document total(), then Add tax()" },
        focus: ["repo"],
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 2 */
  "git-github-2-merge-conflict": {
    kind: "flow",
    title: "A merge conflict, from start to resolved",
    nodes: [
      { id: "base", label: "ab4a3b0", sub: "Color: blue", col: 0, row: 1, tone: "data" },
      { id: "red", label: "7382a1e", sub: "Color: red", col: 1.8, row: 0, tone: "warn" },
      { id: "green", label: "fb24269", sub: "Color: green", col: 1.8, row: 2, tone: "server" },
      { id: "merge", label: "Merge", sub: "waiting", col: 3.6, row: 1, tone: "queue" },
      { id: "main", label: "main", col: 3.6, row: 0, tone: "store" },
      { id: "btg", label: "blue-to-green", col: 3.6, row: 2, tone: "store" },
    ],
    edges: [
      { id: "e-red", from: "red", to: "base", label: "parent" },
      { id: "e-green", from: "green", to: "base", label: "parent" },
      { id: "e-main-red", from: "main", to: "red" },
      { id: "e-btg", from: "btg", to: "green" },
      { id: "e-m-red", from: "merge", to: "red", dashed: true },
      { id: "e-m-green", from: "merge", to: "green", dashed: true },
      { id: "e-main-merge", from: "main", to: "merge" },
    ],
    steps: [
      {
        title: "Start from one commit with Color: blue",
        note: "config.txt has the line Color: blue. Both branches will start from this commit, which Git calls the merge base.",
        appear: ["base"],
        focus: ["base"],
      },
      {
        title: "Both branches change the same line",
        note: "On main someone sets red. On blue-to-green someone sets green. The history has forked, and each side has a commit the other side lacks.",
        appear: ["red", "green", "e-red", "e-green", "main", "btg", "e-main-red", "e-btg"],
        focus: ["red", "green"],
      },
      {
        title: "git merge blue-to-green stops with a conflict",
        note: "The changes touch the same line, so Git cannot choose. It stops half-way and says CONFLICT in config.txt. Nothing is lost, and the other lines merged fine.",
        appear: ["merge", "e-m-red", "e-m-green"],
        set: { merge: "CONFLICT in config.txt" },
        focus: ["merge"],
      },
      {
        title: "The markers show both sides",
        note: "Between the HEAD marker and the equals line is our side, main, with red. Below it is their side, blue-to-green, with green. You must write the final text yourself.",
        set: { merge: "ours: red, theirs: green" },
        focus: ["red", "green", "merge"],
      },
      {
        title: "git merge --abort is the safe way out",
        note: "If you are not ready, abort. Everything returns to how it was before git merge, and the working tree is clean. Use it freely.",
        hide: ["merge", "e-m-red", "e-m-green"],
        focus: ["main", "e-main-red"],
      },
      {
        title: "Resolve: edit the file, delete all marker lines",
        note: "Run the merge again and decide. Here the choice is green. The file must hold the final text only, with the three marker lines removed. Then run your tests or start the app.",
        appear: ["merge", "e-m-red", "e-m-green"],
        set: { merge: "Color: green (my choice)" },
        focus: ["merge"],
      },
      {
        title: "git add and git commit finish the merge",
        note: "The new commit f154fa8 has two parents, red and green, and its content is your decision. main now moves to it. The blue-to-green label stays where it was.",
        hide: ["e-main-red"],
        appear: ["e-main-merge"],
        set: { merge: "f154fa8, two parents" },
        focus: ["merge", "main", "e-main-merge"],
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 3 */
  "git-github-3-fetch-and-merge": {
    kind: "flow",
    title: "Fetch first, then merge: what git pull does",
    nodes: [
      { id: "bob", label: "Bob", sub: "his own clone", col: 0, row: 0, tone: "client" },
      { id: "server", label: "origin", sub: "main: 80dc38d", col: 1.8, row: 0, tone: "store" },
      { id: "aorigin", label: "Ada: origin/main", sub: "80dc38d", col: 3.6, row: 0, tone: "queue" },
      { id: "amain", label: "Ada: main", sub: "80dc38d", col: 3.6, row: 1.6, tone: "server" },
    ],
    edges: [
      { id: "e-push", from: "bob", to: "server", label: "git push" },
      { id: "e-fetch", from: "server", to: "aorigin", label: "git fetch" },
      { id: "e-merge", from: "aorigin", to: "amain", label: "git merge" },
    ],
    steps: [
      {
        title: "Everyone starts at the same commit",
        note: "The server, Ada's note of the server (origin/main) and Ada's own main all point to 80dc38d. origin/main is only a note from her last talk with the server.",
        appear: ["bob", "server", "aorigin", "amain"],
        focus: ["server", "aorigin", "amain"],
      },
      {
        title: "Bob pushes a new commit",
        note: "Bob commits and runs git push. The server's main moves to 322fd66. Ada has not been told anything.",
        appear: ["e-push"],
        set: { server: "main: 322fd66", bob: "pushed 322fd66" },
        focus: ["bob", "e-push", "server"],
      },
      {
        title: "Ada's status still says up to date",
        note: "Git never contacts the server by itself. Her git status compares main with her old note, so it cannot know about Bob's commit yet.",
        set: { amain: "80dc38d, up to date" },
        focus: ["aorigin", "amain"],
      },
      {
        title: "git fetch updates only the note",
        note: "Fetch downloads the new commit and moves origin/main. Her own branch and files are untouched, so fetch is safe at any time. Now git status says her branch is behind by 1 commit.",
        appear: ["e-fetch"],
        set: { aorigin: "322fd66", amain: "80dc38d, behind by 1" },
        focus: ["e-fetch", "aorigin"],
      },
      {
        title: "git merge origin/main moves her branch",
        note: "Nobody committed on Ada's main, so this is a fast-forward: Git only slides the label forward. git pull is exactly fetch followed by this merge (or a rebase, if you set it up).",
        appear: ["e-merge"],
        set: { amain: "322fd66, fast-forward" },
        focus: ["e-merge", "amain"],
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 4 */
  "git-github-4-reflog-rescue": {
    kind: "flow",
    title: "A hard reset looks scary, the reflog undoes it",
    nodes: [
      { id: "n1", label: "e05f10d", sub: "Add n1", col: 0, row: 1, tone: "data" },
      { id: "n2", label: "4ff95ea", sub: "Add n2", col: 1.7, row: 1, tone: "data" },
      { id: "n3", label: "9208aaa", sub: "Add n3", col: 3.4, row: 1, tone: "data" },
      { id: "main-new", label: "main", col: 3.4, row: 0, tone: "store" },
      { id: "main-old", label: "main", col: 0, row: 0, tone: "store" },
      { id: "reflog", label: "Reflog", sub: "HEAD@{0}: commit Add n3", col: 1.7, row: 2.2, tone: "warn" },
    ],
    edges: [
      { id: "e-p2", from: "n2", to: "n1", label: "parent" },
      { id: "e-p3", from: "n3", to: "n2", label: "parent" },
      { id: "e-main-new", from: "main-new", to: "n3" },
      { id: "e-main-old", from: "main-old", to: "n1" },
      { id: "e-reflog", from: "reflog", to: "n3", dashed: true, label: "HEAD@{1}" },
    ],
    steps: [
      {
        title: "Three commits, and main points to the newest",
        note: "The history is n1, n2, n3. The branch main points to 9208aaa, so all three commits are reachable and all three files are on disk.",
        appear: ["n1", "n2", "n3", "e-p2", "e-p3", "main-new", "e-main-new"],
        focus: ["main-new"],
      },
      {
        title: "git reset --hard HEAD~2 moves the branch back",
        note: "Reset only moves the label. main now points to e05f10d. The files of n2 and n3 are removed from the disk, so n1.txt is all that is left.",
        hide: ["main-new", "e-main-new"],
        appear: ["main-old", "e-main-old", "reflog"],
        set: { n2: "no branch points here", n3: "no branch points here" },
        focus: ["main-old", "n2", "n3"],
      },
      {
        title: "The commits still exist in the object store",
        note: "Nothing deleted the commit objects. They are only unreachable from any branch, so git log does not show them. This is why a committed change is very hard to lose.",
        focus: ["n2", "n3"],
      },
      {
        title: "git reflog is the diary of where HEAD has been",
        note: "Every move of HEAD is recorded. Entry HEAD@{1} is where HEAD was one move ago, and that is the lost commit 9208aaa.",
        appear: ["e-reflog"],
        set: { reflog: "HEAD@{0}: reset to HEAD~2" },
        focus: ["reflog", "e-reflog"],
      },
      {
        title: "git reset --hard HEAD@{1} brings everything back",
        note: "Point the branch at the old hash again and Git rewrites the files to match. n2.txt and n3.txt return. A deleted branch can be rescued the same way with git branch name hash.",
        hide: ["main-old", "e-main-old"],
        appear: ["main-new", "e-main-new"],
        set: { n2: "Add n2", n3: "Add n3", reflog: "HEAD@{0}: reset to HEAD@{1}" },
        focus: ["main-new", "n3"],
      },
      {
        title: "The reflog is a short-term, local safety net",
        note: "It is not pushed, a new clone has no reflog, it does not save uncommitted work, and old entries expire (by default after 30 or 90 days).",
        set: { reflog: "local only, entries expire" },
        focus: ["reflog"],
      },
    ],
  },

  /* ------------------------------------------------------------ lesson 5 */
  "git-github-5-rebase-copies": {
    kind: "flow",
    title: "Rebase copies your commits onto the new tip",
    nodes: [
      { id: "base", label: "c824ea5", sub: "Base", col: 0, row: 1, tone: "data" },
      { id: "m1", label: "b11888f", sub: "Main change 1", col: 1.5, row: 1, tone: "data" },
      { id: "f1n", label: "b0d50a6", sub: "Add f1 (new copy)", col: 3, row: 1, tone: "server" },
      { id: "f2n", label: "c9d1fb7", sub: "Add f2 (new copy)", col: 4.5, row: 1, tone: "server" },
      { id: "f1", label: "2a69f59", sub: "Add f1", col: 1.5, row: 2, tone: "data" },
      { id: "f2", label: "d1ad6f4", sub: "Add f2", col: 3, row: 2, tone: "data" },
      { id: "main-a", label: "main", col: 1.5, row: 0, tone: "store" },
      { id: "main-b", label: "main", col: 4.5, row: 0, tone: "store" },
      { id: "feature", label: "feature", col: 4.5, row: 2, tone: "store" },
    ],
    edges: [
      { id: "e-m1", from: "m1", to: "base" },
      { id: "e-f1", from: "f1", to: "base" },
      { id: "e-f2", from: "f2", to: "f1" },
      { id: "e-f1n", from: "f1n", to: "m1" },
      { id: "e-f2n", from: "f2n", to: "f1n" },
      { id: "e-main-a", from: "main-a", to: "m1" },
      { id: "e-main-b", from: "main-b", to: "f2n" },
      { id: "e-feat-old", from: "feature", to: "f2" },
      { id: "e-feat-new", from: "feature", to: "f2n" },
    ],
    steps: [
      {
        title: "Main moved on while you worked on feature",
        note: "Both lines start from Base. main has one new commit and feature has two. A merge would join them with a diamond. A rebase does something different.",
        appear: ["base", "m1", "f1", "f2", "e-m1", "e-f1", "e-f2", "main-a", "e-main-a", "feature", "e-feat-old"],
        focus: ["m1", "f1", "f2"],
      },
      {
        title: "git rebase main copies Add f1 on top of main",
        note: "Git replays your first commit after Main change 1. The content is the same, but the parent is different, so the commit is a new object with a new hash, b0d50a6.",
        appear: ["f1n", "e-f1n"],
        focus: ["f1n", "e-f1n"],
      },
      {
        title: "Then it copies Add f2 on top of that",
        note: "The second commit is replayed in the same way and gets hash c9d1fb7. If a copy conflicts with main, the rebase stops there and you fix it, then run git rebase --continue.",
        appear: ["f2n", "e-f2n"],
        focus: ["f2n", "e-f2n"],
      },
      {
        title: "Finally the branch label moves to the copies",
        note: "feature now points to the new tip. The old commits have no branch, so git log no longer shows them. The history is a straight line.",
        hide: ["e-feat-old"],
        appear: ["e-feat-new"],
        set: { f1: "old copy", f2: "old copy" },
        focus: ["feature", "e-feat-new"],
      },
      {
        title: "The old commits are not deleted",
        note: "They stay in the object store, and the reflog still lists them. That is why a bad rebase can be undone with git reset --hard ORIG_HEAD or with a hash from git reflog.",
        focus: ["f1", "f2"],
      },
      {
        title: "Now merging into main is a fast-forward",
        note: "git merge --ff-only feature only slides the main label to c9d1fb7. No merge commit is needed and the history stays linear.",
        hide: ["main-a", "e-main-a"],
        appear: ["main-b", "e-main-b"],
        focus: ["main-b", "e-main-b"],
      },
      {
        title: "Never rebase commits that others already have",
        note: "Rebasing makes new commits. If teammates already pulled the old ones, you now have different commits for the same work, and their next pull merges both versions. Rebase only your own branch before you share it.",
        focus: ["f1n", "f2n"],
      },
    ],
  },
};
