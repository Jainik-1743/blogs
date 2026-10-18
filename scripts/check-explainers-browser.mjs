/**
 * Opens every lesson that embeds an explainer in a real browser, steps each one to the end, and reports:
 * page errors, text that overflows its box, arrow labels that sit on top of a box or on each other, and
 * horizontal overflow of the page. Optionally saves a screenshot of every explainer at its last step.
 *
 *   node scripts/check-explainers-browser.mjs <series> [lesson-number ...] [--base=http://localhost:3200] [--shots=/tmp/xp]
 *
 * Needs a running server (`next dev -p 3200` or `next start`). Exit code 1 when anything is flagged.
 */
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import { readdirSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const opt = (k, d) => (args.find((a) => a.startsWith(`--${k}=`)) ?? `--${k}=${d}`).split("=").slice(1).join("=");
const base = opt("base", "http://localhost:3200");
const shots = args.find((a) => a.startsWith("--shots=")) ? opt("shots", "/tmp/xp") : "";
const pos = args.filter((a) => !a.startsWith("--"));
const series = pos[0];
const only = pos.slice(1).map(Number);
if (!series) {
  console.log("usage: check-explainers-browser.mjs <series> [lesson-number ...]");
  process.exit(2);
}
if (shots) mkdirSync(shots, { recursive: true });

const root = process.cwd();
const lessons = new Map();
const md = join(root, "content", series);
if (existsSync(md)) {
  for (const f of readdirSync(md).filter((f) => /^\d+\.md$/.test(f))) {
    const n = Number(f.slice(0, -3));
    const src = readFileSync(join(md, f), "utf8");
    lessons.set(n, [...src.matchAll(/```explainer[^\n]*\n([^\n]+)\n```/g)].map((m) => m[1].trim()));
  }
} else {
  const app = join(root, "app", series);
  for (const d of readdirSync(app).filter((d) => /^lesson-\d+$/.test(d))) {
    const n = Number(d.slice(7));
    const src = readFileSync(join(app, d, "page.tsx"), "utf8");
    lessons.set(n, [...src.matchAll(/<Explainer\s+name="([^"]+)"/g)].map((m) => m[1]));
  }
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
let flagged = 0;
for (const [n, names] of [...lessons].sort((a, b) => a[0] - b[0])) {
  if (!names.length || (only.length && !only.includes(n))) continue;
  for (const [width, label] of [[1100, "desktop"], [390, "phone"]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const issues = [];
    page.on("pageerror", (e) => issues.push(`page error: ${e.message.split("\n")[0]}`));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_TUNNEL|Failed to load resource|googletagmanager|favicon/.test(m.text())) issues.push(`console: ${m.text().slice(0, 160)}`);
    });
    try {
      await page.goto(`${base}/${series}/lesson-${n}`, { timeout: 180000, waitUntil: "domcontentloaded" });
      await page.waitForSelector('[role="group"][aria-label$="step-by-step explainer"]', { timeout: 60000 });
    } catch (e) {
      issues.push(`could not load the page or find an explainer: ${String(e.message).split("\n")[0]}`);
    }
    const groups = page.locator('[role="group"][aria-label$="step-by-step explainer"]');
    const count = await groups.count();
    if (count !== names.length) issues.push(`expected ${names.length} explainer(s) on the page, found ${count}`);
    for (let i = 0; i < count; i++) {
      const g = groups.nth(i);
      const name = names[i] ?? `#${i}`;
      const next = g.getByRole("button", { name: /Next/ });
      let steps = 0;
      while ((await next.isEnabled()) && steps < 20) {
        await next.click();
        steps++;
        await page.waitForTimeout(60);
        const found = await g.evaluate((root) => {
          const out = [];
          const near = (a, b) => !(a.right < b.left + 1 || a.left > b.right - 1 || a.bottom < b.top + 1 || a.top > b.bottom - 1);
          for (const t of root.querySelectorAll("[data-fit]")) {
            const rect = t.parentElement.querySelector("rect");
            if (!rect) continue;
            const tb = t.getBBox();
            const rb = rect.getBBox();
            if (tb.x < rb.x + 1 || tb.x + tb.width > rb.x + rb.width - 1 || tb.y < rb.y || tb.y + tb.height > rb.y + rb.height) out.push(`text "${t.textContent.trim().slice(0, 30)}" overflows its box`);
          }
          const nodes = [...root.querySelectorAll("[data-node] rect")].map((r) => r.getBBox());
          const labels = [...root.querySelectorAll("[data-edge-label]")];
          labels.forEach((l, a) => {
            const lb = l.getBBox();
            if (nodes.some((nb) => near({ left: lb.x, right: lb.x + lb.width, top: lb.y, bottom: lb.y + lb.height }, { left: nb.x, right: nb.x + nb.width, top: nb.y, bottom: nb.y + nb.height }))) out.push(`arrow label "${l.textContent.trim()}" sits on a box: move the box, add curve, or shorten it`);
            labels.slice(a + 1).forEach((m) => {
              const mb = m.getBBox();
              if (near({ left: lb.x, right: lb.x + lb.width, top: lb.y, bottom: lb.y + lb.height }, { left: mb.x, right: mb.x + mb.width, top: mb.y, bottom: mb.y + mb.height })) out.push(`arrow labels "${l.textContent.trim()}" and "${m.textContent.trim()}" overlap`);
            });
          });
          return [...new Set(out)];
        });
        for (const f of found) if (!issues.includes(`${name}: ${f}`)) issues.push(`${name}: ${f}`);
      }
      if (shots && label === "desktop") await g.screenshot({ path: join(shots, `${name}.png`) });
    }
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > width + 1) issues.push(`the page scrolls sideways (${sw}px wide at ${width}px)`);
    if (issues.length) {
      flagged += issues.length;
      console.log(`✗ ${series}/lesson-${n} (${label})`);
      for (const s of issues) console.log(`    ${s}`);
    }
    await page.close();
  }
}
await browser.close();
console.log(flagged ? `\n${flagged} issue(s) flagged` : `✓ ${series}: all explainers run cleanly`);
process.exit(flagged ? 1 : 0);
