#!/usr/bin/env node
/**
 * Tells IndexNow-enabled search engines (Bing, Yandex, Seznam, Naver and others; not Google)
 * about new or changed pages, so they do not have to wait for the next crawl.
 *
 *   node scripts/indexnow.mjs https://your-domain.com            # pages changed in the last 2 days
 *   node scripts/indexnow.mjs https://your-domain.com --since 2026-10-01
 *   node scripts/indexnow.mjs https://your-domain.com --all      # every page in the sitemap
 *   add --dry to print what would be sent without sending it
 *
 * Run it AFTER the new version is live, because the engine fetches the key file from your site
 * (public/32ec88239bbf62481d7a322923dd849c.txt) to prove that you own it.
 */
import { readFileSync } from "node:fs";

const KEY = "32ec88239bbf62481d7a322923dd849c";
const args = process.argv.slice(2);
const site = (args.find((a) => a.startsWith("http")) ?? "").replace(/\/+$/, "");
if (!site) {
  console.error("Usage: node scripts/indexnow.mjs https://your-domain.com [--all | --since YYYY-MM-DD] [--dry]");
  process.exit(1);
}
const all = args.includes("--all");
const dry = args.includes("--dry");
const sinceArg = args[args.indexOf("--since") + 1];
const since = all ? 0 : sinceArg && args.includes("--since") ? Date.parse(sinceArg) : Date.now() - 2 * 24 * 3600 * 1000;

const lastmod = JSON.parse(readFileSync("lib/lastmod.json", "utf8"));
const urls = Object.entries(lastmod)
  .filter(([, [, modified]]) => Date.parse(modified) >= since)
  .map(([path]) => site + path);

console.log(`${urls.length} URL(s) to submit to ${new URL(site).host}`);
if (dry || !urls.length) { if (dry) console.log(urls.join("\n")); process.exit(0); }

for (let i = 0; i < urls.length; i += 10000) {
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(site).host, key: KEY, keyLocation: `${site}/${KEY}.txt`, urlList: urls.slice(i, i + 10000) }),
  });
  console.log(`batch ${i / 10000 + 1}: HTTP ${res.status} ${res.statusText}`);
}
