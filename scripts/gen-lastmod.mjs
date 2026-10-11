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

const out = {};
const put = (path, files) => {
  const found = files.filter((f) => last.has(f));
  if (!found.length) return;
  const created = found.map((f) => first.get(f)).sort()[0];
  const modified = found.map((f) => last.get(f)).sort().at(-1);
  out[path] = [created, modified];
};

const appDirs = readdirSync("app", { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
for (const slug of appDirs) {
  // Markdown series: content/<slug>/NN.md  ->  /<slug>/lesson-N
  if (existsSync(`content/${slug}`)) {
    for (const f of readdirSync(`content/${slug}`)) {
      const m = f.match(/^(\d+)\.md$/);
      if (m) put(`/${slug}/lesson-${Number(m[1])}`, [`content/${slug}/${f}`]);
    }
  }
  // Hand-built pages: app/<slug>/<anything>/page.tsx
  for (const d of readdirSync(`app/${slug}`, { withFileTypes: true })) {
    if (d.isDirectory() && !d.name.startsWith("[")) put(`/${slug}/${d.name}`, [`app/${slug}/${d.name}/page.tsx`]);
  }
}

// Series index and glossary pages: newest lesson in the series.
const bySeries = {};
for (const [path, [c, m]] of Object.entries(out)) {
  const slug = path.split("/")[1];
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
out["/glossaries"] = [out["/"][0], newest];

const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync("lib/lastmod.json", JSON.stringify(sorted, null, 0) + "\n");
console.log(`lib/lastmod.json: ${Object.keys(sorted).length} paths, newest ${newest}`);
