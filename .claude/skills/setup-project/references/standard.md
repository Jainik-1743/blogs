# Code setup standard
- Folders by feature: `src/features/booking/{ui,api,model,tests}`; shared code `src/shared/`.
- Style: formatter + linter + strict type checking; run on save (editor) and in CI.
- Tests: unit runner + Playwright e2e. Test files next to code (`*.test.ts`) or in `tests/`.
- Env: `.env.example` documents every setting; secrets never in git; validate env at startup.
- Branches: `feature/PROJ-12-booking`, `fix/PROJ-30-double-booking`, `chore/...`.
- Commits: Conventional Commits — `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.
- PR template: what changed · ticket link · screenshots · how it was tested · risks.
- CI: install (lockfile) → lint → typecheck → test → build; required to merge.
- Optional: Docker compose for local services, staging deploy, error tracking (Sentry), seed script.
