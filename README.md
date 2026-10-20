# blogs

Lesson-style blog series, built with Next.js (App Router) + Tailwind CSS v4. Dark theme only.

```sh
pnpm install
pnpm dev      # http://localhost:3000
pnpm build
```

## Structure

`app/` is split into **route groups**. A folder in parentheses is only for organising the code: it never appears in the URL, so `app/(learn)/devops/lesson-1` is still `/devops/lesson-1`. There is one root layout (`app/layout.tsx`).

| Group | What lives there | Examples |
|---|---|---|
| `(site)` | Public pages that are not a lesson series | home, `about`, `privacy`, `guides`, `roadmap`, `topics`, `glossaries`, `glossary` |
| `(learn)` | Every lesson series, one folder per series | `devops`, `dsa`, `javascript`, `system-design`, `react` ... |
| `(auth)` | Sign in and sign up | `login`, `signup` |
| `(account)` | Pages for a signed-in reader | `account` |
| `(admin)` | Owner-only tools | `admin/badges` |
| `(api)` | Route handlers that return data, not pages | `feed.xml`, `og`, `search-index.json`, `lesson-previews.json` |

Files that Next.js needs at the top of `app/` stay there: `layout.tsx`, `globals.css`, `not-found.tsx`, `manifest.ts`, `robots.ts`, `sitemap.ts` and the icons.

Everything else is outside `app/`:

- `components/` — UI. Grouped by feature (`auth/`, `home/`, `page/`, `admin/`, `dsa/`, `sd/`, `iv/`).
- `lib/` — data and logic: series registries (`lessons.ts`, `iv.ts`, ...), `registry.ts`, `roadmap.ts`, `accounts.ts`, `badges.ts`, `progress.ts`, `firebase.ts`.
- `content/` — Markdown lesson text for the series that use it.
- `data/` — seed data (for example the starting badges).
- `firestore.rules` — the database security rules. Deploy with the Firebase CLI after any change.

A lesson series: `app/(learn)/<series>/page.tsx` is the cover page and `app/(learn)/<series>/lesson-N/page.tsx` is one lesson. Lesson lists live in `lib/`.

## Adding a lesson

1. Flip `published: true` on the entry in `lib/lessons.ts` (or add a new entry).
2. Create `app/(learn)/devops/<slug>/page.tsx` — copy `lesson-0/page.tsx` as a template.
