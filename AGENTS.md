<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Analytics (Mixpanel)

Product analytics live in `lib/analytics.ts` and `components/Analytics.tsx`. Events are named `object_verb` in snake_case with snake_case properties; never put an email, name or note text in an event. Add new events with `track()` at the place the action happens. Nothing is sent until the reader accepts the banner, and only on a non-localhost site with `NEXT_PUBLIC_MIXPANEL_TOKEN` set. Events go through the `/ingest` rewrite in `next.config.ts`; its host (`MIXPANEL_API_HOST`) must match the project's data region (EU by default).
