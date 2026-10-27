import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "testing" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "How to test: what to test, unit tests and doubles, component, API and browser tests, flaky tests, and how to know your tests are any good. Aim for **the most confidence for the least cost**.",
  sections: [
    {
      title: "What a passing test proves",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "A green test proves only that **the cases you wrote** worked today. Tests find bugs, they cannot show there are none.",
            "A test can be wrong (bad expected value) or weak (runs code, checks almost nothing).",
            "Two weak tests (`typeof` is number, zero stays zero) passed on `subtotal * rate` and gave 100% coverage.",
            "Watch every test go **red** once, for the right reason. A test never seen failing may be unable to fail.",
          ],
        },
        {
          kind: "code",
          lang: "bash",
          code:
            "node --test --test-reporter=spec\n# finds *.test.js, *-test.js, *_test.js\n# ✖ adds 20% tax to 100\n#   20 !== 120",
          note: "`node:test` is built in and Stable in Node 22.",
        },
      ],
    },
    {
      title: "Speed, cost, confidence, shapes",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Kind", "Speed", "Confidence", "False alarms from"],
          rows: [
            ["Unit", "ms", "Narrow", "Tests tied to the build"],
            ["Integration", "10 to 50 ms", "Pieces fit", "Test data, shared state"],
            ["End-to-end", "1 to 10 s", "A real user path", "Timing, network, browser"],
          ],
        },
        {
          kind: "table",
          head: ["Shape", "Most tests are", "Fits"],
          rows: [
            ["Pyramid", "Unit", "Pure logic, libraries"],
            ["Trophy", "Integration (static checks at base)", "UI apps, API-heavy apps"],
            ["Honeycomb", "One service with its neighbours", "Many small services"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Shapes are models, not laws. All agree: few E2E tests, and match your tests to where the risk is.",
        },
      ],
    },
    {
      title: "What to test, what to skip",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "**Test**: business rules, edge cases (empty, zero, one, max), error paths, every bug you already had, paths users cannot lose.",
            "**Skip**: other people's code (test your use of it), pure wiring, exact styling, private details, generated code.",
            "Ask: if this fails, will I know something real is broken? If I would just update the test, do not write it.",
            "Test **behaviour, not construction**: a test of a private `_items` array broke on a harmless refactor, the public `total()` test did not.",
          ],
        },
      ],
    },
    {
      title: "Anatomy of a unit test",
      lesson: 1,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code:
            "import { describe, it } from 'node:test';\nimport assert from 'node:assert/strict';\n\ndescribe('applyDiscount', () => {\n  it('takes the percent off', () => {\n    const r = applyDiscount(2000, 25);\n    assert.equal(r, 1500);\n  });\n});",
          note: "Arrange, act (once), assert. One behaviour per test: no \"and\" in the name.",
        },
        {
          kind: "table",
          head: ["Need", "node:assert/strict", "Vitest"],
          rows: [
            ["Same value", "`equal(a, b)`", "`toBe`"],
            ["Same content", "`deepEqual`", "`toEqual`"],
            ["Throws", "`throws(fn, {message})`", "`toThrow('x')`"],
            ["Rejects", "`await rejects(p)`", "`await ...rejects.toThrow()`"],
          ],
        },
      ],
    },
    {
      title: "Test doubles",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Double", "Does", "Use when"],
          rows: [
            ["Stub", "Returns a canned answer", "Controlling an input (time, a user)"],
            ["Mock", "Records calls; test asserts on them", "The effect is the point: email sent once"],
            ["Spy", "Wraps a real function, still runs it", "Watching real code"],
            ["Fake", "Small working version (in-memory repo)", "Realistic behaviour, no slow system"],
          ],
        },
        {
          kind: "points",
          items: [
            "Prefer the real thing, then a fake, then a stub, a mock last. Inject dependencies as arguments.",
            "Double the **edges**: network, database, clock, randomness, email. Not your own pure logic.",
            "A hand-written mock can drift from the real API: the test stays green and production breaks.",
          ],
        },
      ],
    },
    {
      title: "Time, async and isolation",
      lesson: 1,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code:
            "it('calls once after quiet', (t) => {\n  t.mock.timers.enable(\n    { apis: ['setTimeout'] });\n  const fn = mock.fn();\n  const d = debounce(fn, 300);\n  d('a'); d('b'); d('c');\n  t.mock.timers.tick(300);\n  assert.equal(fn.mock.callCount(), 1);\n});",
          note: "Vitest: `vi.useFakeTimers()`, `vi.advanceTimersByTime()`, `vi.setSystemTime()`. Always restore.",
        },
        {
          kind: "points",
          items: [
            "Always `await` or `return` async assertions. A missing `await` on `assert.rejects` gave a green test for a false claim.",
            "Isolation: each test passes alone, shuffled, in parallel. Module-level state (a `Set`) failed when one test ran alone.",
            "Find order bugs with `-t \"name\"` and `--sequence.shuffle`. Reset state in `beforeEach`.",
          ],
        },
      ],
    },
    {
      title: "Component tests (Testing Library)",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Family", "Missing element", "Use for"],
          rows: [
            ["`getBy`", "Throws", "Must be there now"],
            ["`queryBy`", "Returns `null`", "Checking it is absent"],
            ["`findBy`", "Waits, then throws", "Appears later (async)"],
          ],
        },
        {
          kind: "points",
          items: [
            "Query order: `getByRole` with `name`, `getByLabelText`, text, `getByTestId` last. A failing role query often means a real a11y bug.",
            "Use `userEvent.setup()` before `render`, and `await` every `user.*`. Prefer it to `fireEvent`.",
            "Vitest has no global `afterEach`: add `afterEach(() => cleanup())` or you get \"found multiple elements\".",
            "Skip big snapshots, state and CSS layout (jsdom has no layout).",
          ],
        },
      ],
    },
    {
      title: "Network mocking and async UI",
      lesson: 2,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code:
            "beforeAll(() => server.listen(\n  { onUnhandledRequest: 'error' }));\nafterEach(() => { cleanup();\n  server.resetHandlers(); });\nafterAll(() => server.close());\n\nserver.use(http.get(url, () =>\n  HttpResponse.json([{ id: 1 }])));",
          note: "MSW answers the request, so the component code is the real code. One handler per test.",
        },
        {
          kind: "points",
          items: [
            "Test all states: loading, success, empty, error. Use `await screen.findByRole(...)`; `waitFor` for non-element conditions.",
            "Forms: validation messages (`role=\"alert\"`, `aria-invalid`), no request when invalid, exact request body, server error then retry.",
            "An unhandled request can hide behind your error UI and still pass. Watch for `[MSW] Error`.",
          ],
        },
      ],
    },
    {
      title: "Integration and API tests",
      lesson: 3,
      blocks: [
        {
          kind: "points",
          items: [
            "Integration = two or more of **your own real parts**. Fake only what you do not own and cannot run cheaply.",
            "`createApp({ db, queue, clock })` returns the app and never calls `listen`. `supertest` binds a free port. Real socket: `listen(0)`.",
            "Assert status, body, stored rows, published messages, and **non-effects** on failure.",
            "Use the production database engine. SQLite can pass where Postgres fails.",
          ],
        },
        {
          kind: "table",
          head: ["DB strategy", "Watch out"],
          rows: [
            ["Transaction rollback", "Code must use the same connection"],
            ["Truncate before each test", "Delete in foreign-key order"],
            ["Private DB or schema per test or worker", "Setup cost: migrate once per worker"],
          ],
        },
      ],
    },
    {
      title: "Auth, contracts, webhooks",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Auth case", "Expect"],
          rows: [
            ["No or bad token", "401"],
            ["Valid token, someone else's resource", "404 or 403, **data unchanged**"],
            ["Normal user on admin route", "403"],
            ["Your own resource", "2xx"],
          ],
        },
        {
          kind: "points",
          items: [
            "Contracts: OpenAPI schema check (`ajv`) for the provider; consumer-driven (Pact) for known callers. Extra fields are safe, removing one breaks.",
            "Webhooks: wrong signature is 401, valid is stored, **same event twice is stored once**. Sign the raw body bytes.",
            "Queues: fake with the same interface; assert published and not published. Test the worker separately.",
            "Speed: build once per file, migrate once per run, clean by rollback, small seeds, factories not one big seed.",
          ],
        },
      ],
    },
    {
      title: "End-to-end with Playwright",
      lesson: 4,
      blocks: [
        {
          kind: "code",
          lang: "js",
          code:
            "await page.getByLabel('Todo').fill('x');\nawait page.getByRole('button',\n  { name: 'Add' }).click();\n// retries until true. No sleep.\nawait expect(items).toHaveCount(1);",
          note: "Forget `await` before `expect(locator)` and the check never runs.",
        },
        {
          kind: "points",
          items: [
            "One E2E test per business journey (login, pay), not per feature. 5 to 20 is common.",
            "Locators: role, label, text, test id last. Strict mode errors if more than one match: be specific.",
            "Auto-waiting: visible, stable, enabled, receives events. Never `waitForTimeout` or `{ force: true }`.",
            "Each test gets a fresh context; the server data is yours to isolate. Log in once with `storageState` and gitignore `.auth/`.",
            "`page.route` mocks third parties and rare errors, not your own API in main journeys. Set `trace: 'on-first-retry'`.",
          ],
        },
      ],
    },
    {
      title: "Flaky tests",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Cause", "Fix"],
          rows: [
            ["Time (sleeps, real clock)", "`page.clock.setFixedTime`, retrying assertions"],
            ["Data (shared account)", "Unique user or ids per test"],
            ["Ordering", "Every test sets up its own state"],
            ["Animation (opacity 0.999)", "`toHaveCSS` retries, or disable animations"],
            ["Network (CI slower)", "Wait for the result, mock unstable parties"],
          ],
        },
        {
          kind: "steps",
          items: [
            "Reproduce: `--repeat-each=20`, then fewer or more `--workers`.",
            "Open the trace at the first step that differs.",
            "Name the cause from the five.",
            "Fix the cause, then repeat to prove it.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Retries, longer timeouts and silent `test.skip` hide flakiness. A test that needed a retry gets a ticket.",
        },
      ],
    },
    {
      title: "TDD and property tests",
      lesson: 5,
      blocks: [
        {
          kind: "steps",
          items: [
            "Red: one small failing test, for the right reason.",
            "Green: the simplest code, even a fake (`return 0`).",
            "Refactor with all tests green.",
          ],
        },
        {
          kind: "code",
          lang: "js",
          code:
            "fc.assert(fc.property(fc.nat(100000),\n  (cents) => {\n    assert.equal(\n      parseMoney(formatCents(cents)),\n      cents);\n  }));\n// Counterexample: [1]",
          note: "Shrinking finds a small failure. Save the seed. Keep an example test per bug.",
        },
        {
          kind: "points",
          items: [
            "Good properties: round trip, idempotent, never crashes.",
            "A bug fix starts with a failing test that reproduces it.",
          ],
        },
      ],
    },
    {
      title: "Mutation testing, coverage, review",
      lesson: 5,
      blocks: [
        {
          kind: "points",
          items: [
            "Stryker changes code (`<` to `<=`). A failing test **kills** the mutant; a passing run means it **survived**. Score = killed / total.",
            "A survivor means a missing test (`n <= 0` needed an `add('0,5')` test) or dead code (a redundant `if`). Read each one.",
            "An assertion-free test gave 100% coverage and a 37.5% mutation score. Use coverage to find gaps, never as a target.",
            "Run mutation on core modules or nightly: cost is mutants times test time.",
          ],
        },
        {
          kind: "table",
          head: ["Review test PRs: ask", "Why"],
          rows: [
            ["Would it fail if the code were wrong?", "Mutation in your head"],
            ["Did I see it fail?", "Bug fixes show red first"],
            ["Behaviour or internals? Right layer?", "Refactor safety"],
            ["Deterministic and independent?", "No sleeps, clock, shared data"],
          ],
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["Green suite means no bugs?", "No. It means the written cases passed."],
            ["Stub vs mock?", "Stub feeds an answer; mock asserts on calls."],
            ["getBy vs queryBy vs findBy?", "Throws now; null for absent; waits for async."],
            ["Mock fetch?", "Use MSW at the network layer instead."],
            ["Why not port 3000 in tests?", "Collisions. Use `listen(0)` or supertest."],
            ["Fix a flaky test?", "Find the cause (time, data, order, animation, network)."],
            ["Is 100% coverage good?", "It shows what ran, not what was checked."],
          ],
        },
      ],
    },
  ],
};
