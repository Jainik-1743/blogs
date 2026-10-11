#!/usr/bin/env python3
"""python3 scripts/publish-series.py <slug> <lesson-count> <terms-file>...
Merges glossary term lines into lib/iv-terms.ts and sets the WRITTEN count in lib/iv.ts."""
import sys, re
slug, n, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
body = "".join(open(f).read().rstrip() + "\n" for f in files)
t = open("lib/iv-terms.ts").read()
assert f'  "{slug}": [' not in t, "terms already merged"
i = t.index('\n};', t.index("export const IV_TERMS"))
t = t[:i] + f'\n  "{slug}": [\n{body}  ],' + t[i:]
open("lib/iv-terms.ts", "w").write(t)
s = open("lib/iv.ts").read()
s, c = re.subn(r'("%s"|%s): \d+' % (slug, slug), f'"{slug}": {n}', s, 1)
assert c == 1
open("lib/iv.ts", "w").write(s)
