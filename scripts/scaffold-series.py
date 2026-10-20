#!/usr/bin/env python3
"""Register a new markdown series from a JSON spec: python3 scripts/scaffold-series.py spec.json
Spec: {slug, const, title, short, tagline, accent, group, related[], lessons:[[title,summary,readTime,[tags]],...]}
Adds the series to lib/iv.ts, lib/series.ts and app/(learn)/<slug>/ (copied from app/(learn)/git-github). WRITTEN starts at 0."""
import json, sys, re, shutil, os
spec = json.load(open(sys.argv[1]))
slug, const = spec["slug"], spec["const"]
def js(s): return json.dumps(s, ensure_ascii=False)
rows = ",\n".join(f"    [{js(t)}, {js(s)}, {js(r)}, {js(tags)}]" for t, s, r, tags in spec["lessons"])
block = f'''export const {const}: IvSeries = {{
  slug: {js(slug)},
  title: {js(spec["title"])},
  short: {js(spec["short"])},
  tagline:
    {js(spec["tagline"])},
  started: "2026",
  accent: {js(spec["accent"])},
  lessons: lessons([
{rows},
  ], WRITTEN[{js(slug)}]),
}};

export const IV_SERIES: IvSeries[] = ['''
s = open("lib/iv.ts").read()
assert f"slug: {js(slug)}" not in s, "already registered"
s = s.replace("export const IV_SERIES: IvSeries[] = [", block, 1)
s = re.sub(r"(const WRITTEN: Record<string, number> = \{[^}]*?) \};", lambda m: m.group(1) + f", {js(slug)}: 0 }};", s, 1)
s = re.sub(r"(export const IV_SERIES: IvSeries\[\] = \[[^\]]*?)\];", lambda m: m.group(1) + f", {const}];", s, 1)
open("lib/iv.ts", "w").write(s)
t = open("lib/series.ts").read()
gid = spec["group"]
m = re.search(r'id: "%s",.*?slugs: \[(.*?)\]' % gid, t, re.S)
t = t[:m.end(1)] + f", {js(slug)}" + t[m.end(1):]
rel = ", ".join(js(x) for x in spec["related"])
t = re.sub(r"(export const RELATED_SERIES[^{]*\{.*?)\n\};", lambda m: m.group(1) + f"\n  {js(slug)}: [{rel}],\n}};", t, 1, flags=re.S)
open("lib/series.ts", "w").write(t)
dst = f"app/(learn)/{slug}"
if not os.path.exists(dst):
    shutil.copytree("app/(learn)/git-github", dst)
    for root, _, files in os.walk(dst):
        for f in files:
            p = os.path.join(root, f)
            c = open(p).read().replace("GITGITHUB_SERIES", const).replace("/git-github", f"/{slug}").replace("GitGithub", "".join(w.title() for w in slug.split("-")))
            open(p, "w").write(c)
print("registered", slug)
