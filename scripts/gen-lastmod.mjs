#!/usr/bin/env node
/**
 * Writes lib/lastmod.json: for every page path, [firstCommitDate, lastCommitDate] taken from
 * git history of the file that renders it. The sitemap, the RSS feed and the JSON-LD read it so
 * they report real dates instead of "now".
 *
 * Run it before you deploy:   node scripts/gen-lastmod.mjs
 * It needs the full git history (not a shallow clone), so run it locally and commit the result.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, readdirSync, existsSync, readFileSync } from "node:fs";

// Commits that touched many pages without changing their content (codemods, renames, formatting).
// List their SHAs (one per line, `#` for comments) in scripts/lastmod-ignore.txt so they do not
// reset every page's "last modified" date.
const ignored = new Set(
  existsSync("scripts/lastmod-ignore.txt")
    ? readFileSync("scripts/lastmod-ignore.txt", "utf8").split("\n").map((l) => l.replace(/#.*/, "").trim()).filter(Boolean)
    : [],
);
const log = execFileSync("git", ["log", "--format=@@%H %cI", "--name-only", "--no-renames"], { maxBuffer: 1 << 28 }).toString();
const first = new Map();
const last = new Map();
let date = "";
let skip = false;
for (const line of log.split("\n")) {
  if (line.startsWith("@@")) {
    const [sha, when] = line.slice(2).split(" ");
    skip = [...ignored].some((i) => sha.startsWith(i));
    date = new Date(when).toISOString();
    continue;
  }
  const file = line.trim();
  if (!file || skip) continue;
  if (!last.has(file)) last.set(file, date);           // log is newest first
  first.set(file, date);                                // keeps overwriting, ends as the oldest
}

// Pages live in route groups such as app/(learn)/<slug>, which do not change the URL. Before the groups
// existed they sat at app/<slug>, so a file's history is looked up under both paths and no page loses its date.
const legacyPath = (f) => f.replace(/^app\/\([^)]+\)\//, "app/");

const out = {};
const put = (path, files) => {
  const found = files.flatMap((f) => [f, legacyPath(f)]).filter((f, i, all) => all.indexOf(f) === i && last.has(f));
  if (!found.length) return;
  const created = found.map((f) => first.get(f)).sort()[0];
  const modified = found.map((f) => last.get(f)).sort().at(-1);
  out[path] = [created, modified];
};

// Every route folder, whether it sits directly in app/ or inside a route group: [slug, folder].
const topLevel = readdirSync("app", { withFileTypes: true }).filter((d) => d.isDirectory());
const routeDirs = topLevel.flatMap((d) =>
  d.name.startsWith("(")
    ? readdirSync(`app/${d.name}`, { withFileTypes: true }).filter((x) => x.isDirectory()).map((x) => [x.name, `app/${d.name}/${x.name}`])
    : [[d.name, `app/${d.name}`]],
);
/** The folder that renders a top-level route, for example "about" -> "app/(site)/about". */
const dirOf = (slug) => routeDirs.find(([name]) => name === slug)?.[1] ?? `app/${slug}`;

for (const [slug, dir] of routeDirs) {
  // Markdown series: content/<slug>/NN.md  ->  /<slug>/lesson-N
  if (existsSync(`content/${slug}`)) {
    for (const f of readdirSync(`content/${slug}`)) {
      const m = f.match(/^(\d+)\.md$/);
      if (m) put(`/${slug}/lesson-${Number(m[1])}`, [`content/${slug}/${f}`]);
    }
  }
  // Hand-built pages: app/<slug>/<anything>/page.tsx
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (d.isDirectory() && !d.name.startsWith("[")) put(`/${slug}/${d.name}`, [`${dir}/${d.name}/page.tsx`]);
  }
}

// Stand-alone top-level pages.
for (const slug of ["about", "privacy", "glossaries"]) put(`/${slug}`, [`${dirOf(slug)}/page.tsx`]);

// Guides: the guide definitions file, or the template for the index.
const guideSlugs = [...readFileSync("lib/guides-data.ts", "utf8").matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1]);
put("/guides", ["lib/guides-data.ts", `${dirOf("guides")}/page.tsx`]);
for (const slug of guideSlugs) put(`/guides/${slug}`, ["lib/guides-data.ts", `${dirOf("guides")}/[slug]/page.tsx`]);

// The roadmap: its data files, page and components.
const roadmapFiles = ["lib/roadmap.ts", "lib/roadmap-stages.ts", "components/RoadmapPage.tsx", "components/RoadmapTree.tsx", "components/RoadmapLessonTree.tsx", "components/RoadmapPath.tsx"];
put("/roadmap", [...roadmapFiles, `${dirOf("roadmap")}/page.tsx`]);
put("/roadmap/detailed", [...roadmapFiles, `${dirOf("roadmap")}/detailed/page.tsx`]);

// Series index and glossary pages: newest lesson in the series.
const bySeries = {};
for (const [path, [c, m]] of Object.entries(out)) {
  const slug = path.split("/")[1];
  if (slug === "guides" || slug === "roadmap") continue;
  (bySeries[slug] ??= []).push([c, m]);
}
let newest = "";
for (const [slug, dates] of Object.entries(bySeries)) {
  const created = dates.map((d) => d[0]).sort()[0];
  const modified = dates.map((d) => d[1]).sort().at(-1);
  out[`/${slug}`] = [created, modified];
  if (!out[`/${slug}/glossary`]) out[`/${slug}/glossary`] = [created, modified];
  if (modified > newest) newest = modified;
}
out["/"] = [out["/dsa"]?.[0] ?? newest, newest];
out["/glossaries"] ??= [out["/"][0], newest];

const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync("lib/lastmod.json", JSON.stringify(sorted, null, 0) + "\n");
console.log(`lib/lastmod.json: ${Object.keys(sorted).length} paths, newest ${newest}`);
