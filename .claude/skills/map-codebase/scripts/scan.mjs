#!/usr/bin/env node
// Cheap, deterministic codebase facts for the map-codebase skill (zero dependencies).
// Usage: node scan.mjs [repoDir] [--since <commit>]
// Prints compact markdown (~100-150 lines) so the model reads facts instead of crawling files.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const sinceIdx = args.indexOf('--since');
const since = sinceIdx >= 0 ? args[sinceIdx + 1] : null;
const root = path.resolve(args.find((a, i) => !a.startsWith('--') && i !== sinceIdx + 1) || '.');

const IGNORE = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt', '.svelte-kit', 'coverage',
  'vendor', 'target', '.venv', 'venv', '__pycache__', '.turbo', '.cache', '.idea', '.vscode', '.claude', '.agents']);
const SOURCE = /\.(js|jsx|ts|tsx|mjs|cjs|vue|svelte|py|go|rs|java|kt|rb|php|cs|swift|dart|scala|ex|exs|c|cc|cpp|h|sql|graphql|prisma)$/;

const git = (...a) => {
  try { return execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 }).trim(); }
  catch { return null; }
};
const out = [];
const say = (s = '') => out.push(s);

// ---- incremental mode: what changed since the last map
if (since) {
  const files = git('diff', '--name-only', `${since}..HEAD`);
  if (files === null) { console.error(`unknown commit ${since}`); process.exit(1); }
  const groups = {};
  for (const f of files.split('\n').filter(Boolean)) {
    const top = f.includes('/') ? f.split('/').slice(0, 2).join('/') : '(root)';
    (groups[top] ||= []).push(f);
  }
  say(`# Changes ${since.slice(0, 8)}..${git('rev-parse', '--short', 'HEAD')}`);
  say(git('log', '--oneline', '--no-merges', `${since}..HEAD`, '-n', '30') || '(no commits)');
  say('\n## Changed files by area');
  for (const [g, fs_] of Object.entries(groups).sort((a, b) => b[1].length - a[1].length)) {
    say(`- ${g} (${fs_.length}): ${fs_.slice(0, 6).map((f) => path.basename(f)).join(', ')}${fs_.length > 6 ? ', …' : ''}`);
  }
  console.log(out.join('\n'));
  process.exit(0);
}

// ---- file list (respects .gitignore when in a git repo)
let files = (git('ls-files', '--cached', '--others', '--exclude-standard') || '').split('\n').filter(Boolean);
if (!files.length) {
  const walk = (dir, rel = '') => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (IGNORE.has(e.name)) continue;
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(path.join(dir, e.name), r); else files.push(r);
    }
  };
  walk(root);
}
files = files.filter((f) => !f.split('/').some((p) => IGNORE.has(p)));

const head = git('rev-parse', '--short', 'HEAD');
say(`# Codebase scan: ${path.basename(root)}`);
say(`Commit: ${head || 'not a git repo'}${head ? `  branch: ${git('branch', '--show-current')}  commits: ${git('rev-list', '--count', 'HEAD')}  last: ${git('log', '-1', '--format=%cs %s')}` : ''}`);
say(`Files: ${files.length}  (source: ${files.filter((f) => SOURCE.test(f)).length})`);

// ---- languages
const ext = {};
for (const f of files) { const e = path.extname(f) || path.basename(f); ext[e] = (ext[e] || 0) + 1; }
say(`\n## Top file types\n${Object.entries(ext).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([e, n]) => `${e} ${n}`).join(' · ')}`);

// ---- tree (depth 2) with file counts
const dirs = {};
for (const f of files) {
  const parts = f.split('/');
  if (parts.length > 1) dirs[parts[0]] = (dirs[parts[0]] || 0) + 1;
  if (parts.length > 2) dirs[`${parts[0]}/${parts[1]}`] = (dirs[`${parts[0]}/${parts[1]}`] || 0) + 1;
}
say('\n## Folders (depth 2, file count)');
for (const [d, n] of Object.entries(dirs).sort()) {
  if (!d.includes('/') || n >= 3) say(`${d.includes('/') ? '  ' : ''}- ${d}/ (${n})`);
}
say(`- (root files): ${files.filter((f) => !f.includes('/')).slice(0, 25).join(', ')}`);

// ---- manifests
const read = (f) => { try { return fs.readFileSync(path.join(root, f), 'utf8'); } catch { return null; } };
say('\n## Manifests');
for (const f of files.filter((f) => /(^|\/)package\.json$/.test(f)).slice(0, 8)) {
  try {
    const p = JSON.parse(read(f));
    say(`- ${f}: ${p.name || ''}${p.workspaces ? ' (workspaces)' : ''}`);
    if (p.scripts) say(`  scripts: ${Object.entries(p.scripts).slice(0, 15).map(([k, v]) => `${k}=\`${String(v).slice(0, 50)}\``).join(' · ')}`);
    const deps = Object.keys({ ...p.dependencies });
    if (deps.length) say(`  deps (${deps.length}): ${deps.slice(0, 25).join(', ')}`);
    const dev = Object.keys({ ...p.devDependencies });
    if (dev.length) say(`  devDeps (${dev.length}): ${dev.slice(0, 15).join(', ')}`);
  } catch { say(`- ${f}: (invalid JSON)`); }
}
for (const m of ['pyproject.toml', 'requirements.txt', 'go.mod', 'Cargo.toml', 'composer.json', 'Gemfile', 'pom.xml', 'build.gradle', 'build.gradle.kts', 'pubspec.yaml', 'mix.exs', '*.csproj']) {
  const hits = files.filter((f) => (m.startsWith('*') ? f.endsWith(m.slice(1)) : path.basename(f) === m)).slice(0, 3);
  for (const h of hits) say(`- ${h}: ${(read(h) || '').split('\n').filter((l) => l.trim()).slice(0, 6).join(' | ').slice(0, 220)}`);
}

// ---- infra & config
const CONFIG = /(^|\/)(Dockerfile|docker-compose[^/]*\.ya?ml|compose\.ya?ml|\.env\.example|tsconfig\.json|vite\.config\.\w+|next\.config\.\w+|nuxt\.config\.\w+|vercel\.(json|ts)|netlify\.toml|fly\.toml|Procfile|Makefile|turbo\.json|nx\.json|pnpm-workspace\.yaml|prisma\/schema\.prisma|drizzle\.config\.\w+|playwright\.config\.\w+|vitest\.config\.\w+|jest\.config\.\w+|\.eslintrc[^/]*|eslint\.config\.\w+|biome\.json|CLAUDE\.md|AGENTS\.md)$/;
say(`\n## Config & infra\n${files.filter((f) => CONFIG.test(f) || f.startsWith('.github/workflows/')).slice(0, 30).join(' · ') || '(none found)'}`);

// ---- entry points
const ENTRY = /(^|\/)(index|main|app|server|cli|manage|wsgi|asgi)\.(js|ts|tsx|mjs|py|go|rs)$|(^|\/)(app|pages)\/(layout|page|_app|index)\.(tsx|jsx|ts|js)$|^cmd\/[^/]+\/main\.go$|^src\/main\.rs$/;
say(`\n## Likely entry points\n${files.filter((f) => ENTRY.test(f)).slice(0, 15).join(' · ') || '(none found)'}`);

// ---- routes / API surface hints
const routes = files.filter((f) => /(^|\/)(routes?|api|controllers?|handlers?|endpoints?)\//.test(f) && SOURCE.test(f));
if (routes.length) say(`\n## API/route files (${routes.length})\n${routes.slice(0, 20).join(' · ')}`);

// ---- tests
const tests = files.filter((f) => /(\.|_)(test|spec)\.\w+$|(^|\/)(tests?|__tests__|e2e)\//.test(f));
say(`\n## Tests: ${tests.length} files${tests.length ? ` — e.g. ${tests.slice(0, 5).join(', ')}` : ''}`);

// ---- biggest source files
const sizes = files.filter((f) => SOURCE.test(f)).map((f) => {
  try { const s = fs.statSync(path.join(root, f)); return s.size < 2e6 ? [f, (read(f) || '').split('\n').length] : [f, 0]; } catch { return [f, 0]; }
}).sort((a, b) => b[1] - a[1]).slice(0, 10);
if (sizes.length) say(`\n## Largest source files (lines)\n${sizes.map(([f, n]) => `${f} ${n}`).join(' · ')}`);

// ---- hot files (git churn, 6 months)
const churn = git('log', '--since=6.months', '--name-only', '--format=', '--no-merges');
if (churn) {
  const count = {};
  for (const f of churn.split('\n').filter((f) => f && SOURCE.test(f))) count[f] = (count[f] || 0) + 1;
  const hot = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (hot.length) say(`\n## Most changed (6 months)\n${hot.map(([f, n]) => `${f} ${n}`).join(' · ')}`);
}

console.log(out.join('\n'));
