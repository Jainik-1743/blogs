# blogs

Lesson-style blog series, built with Next.js (App Router) + Tailwind CSS v4. Dark theme only.

```sh
pnpm install
pnpm dev      # http://localhost:3000
pnpm build
```

## Structure

- `lib/lessons.ts` — the single list of lessons. Every table of contents, breadcrumb and prev/next pager is generated from it.
- `app/devops/page.tsx` — series "cover" page (title + contents).
- `app/devops/lesson-N/page.tsx` — one folder per lesson.
- `app/globals.css` — theme tokens and `.lesson` prose styles.

## Adding a lesson

1. Flip `published: true` on the entry in `lib/lessons.ts` (or add a new entry).
2. Create `app/devops/<slug>/page.tsx` — copy `lesson-0/page.tsx` as a template.
