import type { ExplainerData } from "../types.ts";

/** Explainers for the "testing" series. Names must start with "testing-" followed by the lesson number. */
export const DATA: ExplainerData = {
  // ---- lesson 0: why we test ----
  "testing-0-weak-tests-pass": {
    kind: "trace",
    title: "Two green tests, one wrong function",
    intro: "This is the totalWithTax bug from the lesson. It should add the tax to the subtotal, but it only returns the tax.",
    code: [
      "export function totalWithTax(subtotal, rate) {",
      "  return subtotal * rate;   // bug: forgot subtotal +",
      "}",
      "",
      'test("returns a number", () => {',
      '  assert.equal(typeof totalWithTax(100, 0.2), "number");',
      "});",
      'test("zero stays zero", () => {',
      "  assert.equal(totalWithTax(0, 0.2), 0);",
      "});",
      'test("adds 20% tax to 100", () => {',
      "  assert.equal(totalWithTax(100, 0.2), 120);",
      "});",
    ],
    varsTitle: "Inside the test",
    steps: [
      {
        line: 6,
        vars: [["test", "returns a number"], ["subtotal", "100"], ["rate", "0.2"]],
        title: "Test 1 calls the function with 100 and 0.2",
        note: "A test runs the code with a known input, then checks the result. The first test only wants to know that the answer is a number.",
      },
      {
        line: 2,
        vars: [["test", "returns a number"], ["subtotal", "100"], ["rate", "0.2"], ["returned", "20"]],
        title: "The buggy line returns 20, not 120",
        note: "It multiplies instead of adding. The right answer is 120, but this code gives 20. Nothing has noticed yet, because no assertion has looked at the value.",
      },
      {
        line: 6,
        vars: [["test", "returns a number"], ["typeof 20", '"number"'], ["assertion", "true"]],
        out: "pass: returns a number",
        title: "Test 1 passes, because 20 is a number",
        note: "Any number would pass this check, including a wrong one. The test runs the line, but it checks almost nothing.",
      },
      {
        line: 9,
        vars: [["test", "zero stays zero"], ["subtotal", "0"], ["returned", "0 * 0.2 = 0"], ["assertion", "true"]],
        out: "pass: zero stays zero",
        title: "Test 2 passes too, even with the bug",
        note: "Zero times anything is zero, so the buggy code gives the same answer as the correct code for this input. The test cannot tell the two apart.",
      },
      {
        line: 12,
        vars: [["test", "adds 20% tax to 100"], ["returned", "20"], ["expected", "120"], ["assertion", "false"]],
        out: "fail: adds 20% tax to 100  (20 !== 120)",
        title: "Test 3 checks a real value and goes red",
        note: "This test checks the value for a normal input. It is the only one that notices. A red test with a clear message points straight at the bug.",
      },
      {
        line: 2,
        vars: [["lines run by tests", "all of them"], ["coverage", "100%"], ["bug found by test 1 and 2", "no"]],
        title: "Coverage was 100% and the bug was still there",
        note: "Tests 1 and 2 already ran every line of the function. Coverage shows which lines ran, not whether anything was checked. Tests can find bugs, but a green run never proves there are none.",
      },
    ],
  },

  // ---- lesson 1: test doubles ----
  "testing-1-test-doubles": {
    kind: "flow",
    title: "Four kinds of test double around signUp",
    intro: "This is the signUp function from the lesson. It needs a user store, a clock and a mailer. The test passes in a stand-in for each.",
    nodes: [
      { id: "test", label: "The test", sub: "passes the doubles in", col: 0, row: 1, tone: "client" },
      { id: "sign", label: "signUp", sub: "the unit under test", col: 1.7, row: 1, tone: "server" },
      { id: "now", label: "Stub: now", sub: "always the same date", col: 1.7, row: 0, tone: "queue" },
      { id: "fake", label: "Fake users", sub: "array in memory", col: 3.4, row: 0, tone: "data" },
      { id: "spy", label: "Spy on save", sub: "wraps the real one", col: 3.4, row: 1, tone: "warn" },
      { id: "mock", label: "Mock: send", sub: "records its calls", col: 3.4, row: 2, tone: "store" },
    ],
    edges: [
      { id: "e-test", from: "test", to: "sign", label: "signUp(email, doubles)" },
      { id: "e-now", from: "sign", to: "now", label: "now()" },
      { id: "e-find", from: "sign", to: "fake", label: "findByEmail" },
      { id: "e-save", from: "sign", to: "spy", label: "save()" },
      { id: "e-thru", from: "spy", to: "fake", label: "calls through" },
      { id: "e-send", from: "sign", to: "mock", label: "send()" },
      { id: "e-assert", from: "test", to: "mock", label: "asserts the calls", dashed: true, curve: -1.2 },
    ],
    steps: [
      {
        title: "Inject the dependencies, then call signUp",
        note: "signUp takes its users, mailer and clock as arguments. That is dependency injection, and it lets the test hand in replacements. No real database, email service or clock is touched.",
        appear: ["test", "sign", "e-test"],
        focus: ["test", "sign", "e-test"],
      },
      {
        title: "Stub: a fixed answer for the clock",
        note: "A stub returns a canned answer and the test does not check how it was called. The clock always says 2026-01-02, so the test can check an exact createdAt.",
        appear: ["now", "e-now"],
        focus: ["now", "e-now"],
      },
      {
        title: "Fake: a small but really working store",
        note: "fakeUsers finds and saves rows in an array. Unlike a stub, it has real behaviour, so a duplicate email really is found the second time. It is realistic without a real database.",
        appear: ["fake", "e-find"],
        focus: ["fake", "e-find"],
        set: { fake: "rows: 0" },
      },
      {
        title: "Spy: watch a real function, still run it",
        note: "mock.method wraps users.save. It records the call and by default still calls the real save, so the test can check both the call count and that a row really was stored.",
        appear: ["spy", "e-save", "e-thru"],
        focus: ["spy", "e-save", "e-thru"],
        set: { fake: "rows: 1", spy: "1 call recorded" },
      },
      {
        title: "Mock: check an effect with no return value",
        note: "Sending an email returns nothing useful. The mock records every call, and the test asserts it was called once with a@b.com and Welcome. Use a mock only when the effect itself is the behaviour.",
        appear: ["mock", "e-send", "e-assert"],
        focus: ["mock", "e-send", "e-assert"],
        set: { mock: "1 call: a@b.com" },
      },
      {
        title: "Prefer real, then fake, then stub, then mock",
        note: "Double the edges of your system: the network, the database, the clock, the email provider. Do not double your own pure logic. A mocked internal makes the test brittle, and it hides the real code.",
        focus: ["now", "fake", "spy", "mock"],
      },
    ],
  },

  // ---- lesson 2: UI component tests ----
  "testing-2-find-by-waits-for-msw": {
    kind: "flow",
    title: "Testing a component that loads data: findBy and MSW",
    intro: "This is the UserList test from the lesson. The page changes only after a network answer, so the test has to wait for it.",
    nodes: [
      { id: "test", label: "The test", sub: "Testing Library", col: 0, row: 0.7, tone: "client" },
      { id: "comp", label: "UserList", sub: "in a fake page", col: 2, row: 0.7, tone: "server" },
      { id: "msw", label: "MSW handler", sub: "answers requests", col: 4, row: 0.7, tone: "queue" },
    ],
    edges: [
      { id: "e-render", from: "test", to: "comp", label: "render" },
      { id: "e-fetch", from: "comp", to: "msw", label: "fetch /api/users", curve: -0.6 },
      { id: "e-find", from: "test", to: "comp", label: "findByRole(list)", dashed: true, curve: 0.9 },
      { id: "e-resp", from: "msw", to: "comp", label: "200 + 2 users", curve: -0.6 },
    ],
    steps: [
      {
        title: "render puts the component in a fake page",
        note: "The component starts in its loading state. getByText finds Loading users right now, because that text is already on the page. It throws at once if the element is missing.",
        appear: ["test", "comp", "e-render"],
        focus: ["test", "comp", "e-render"],
        set: { comp: "shows: Loading users..." },
      },
      {
        title: "The component asks the network for users",
        note: "The component code is unchanged and still calls fetch. The test did not replace fetch. It prepared a handler with server.use, and MSW sits below the code to answer the request.",
        appear: ["msw", "e-fetch"],
        focus: ["msw", "e-fetch"],
        set: { msw: "handler: 2 users" },
      },
      {
        title: "findByRole waits, instead of failing now",
        note: "A getBy query would throw straight away, because the list is not on the page yet. findBy keeps retrying until the element appears or the timeout ends. No sleep and no guessing a delay.",
        appear: ["e-find"],
        focus: ["test", "e-find"],
        set: { test: "waiting for the list" },
      },
      {
        title: "MSW answers and the page updates",
        note: "The handler returns two users. The component moves from loading to success and draws a list called Users with Asha and Ben. This all happens later than the test's first line.",
        appear: ["e-resp"],
        focus: ["msw", "e-resp", "comp"],
        set: { comp: "shows: list of 2 users" },
      },
      {
        title: "findBy resolves, then the test checks",
        note: "The list is found, so the test goes on. It checks the text, counts two list items, and uses queryBy to show that Loading users is gone. queryBy returns null for something absent.",
        focus: ["test", "comp"],
        set: { test: "list found, asserts pass" },
      },
      {
        title: "Test the error and empty states too",
        note: "Give a second test a handler that returns status 500. The component shows an alert, Could not load users (HTTP 500). Loading, success and error are the three states every async component has.",
        hide: ["e-find"],
        focus: ["msw", "comp"],
        set: { msw: "handler: status 500", comp: "shows: alert, HTTP 500" },
      },
    ],
  },

  // ---- lesson 3: integration tests ----
  "testing-3-api-test-in-process": {
    kind: "flow",
    title: "One API test touches many real parts",
    intro: "This is the notes API from the lesson. The app is built by a function and called in the same process, so no server is started by hand.",
    nodes: [
      { id: "test", label: "Test + supertest", sub: "fresh world per test", col: 0, row: 0.7, tone: "client" },
      { id: "app", label: "createApp()", sub: "auth, validation", col: 1.7, row: 0.7, tone: "server" },
      { id: "db", label: "Real SQLite", sub: "in memory, real SQL", col: 3.4, row: 0, tone: "data" },
      { id: "queue", label: "Fake queue", sub: "records messages", col: 3.4, row: 1.5, tone: "queue" },
    ],
    edges: [
      { id: "e-req", from: "test", to: "app", label: "POST /notes" },
      { id: "e-401", from: "app", to: "test", label: "401 no token", curve: -0.8 },
      { id: "e-db", from: "app", to: "db", label: "INSERT row" },
      { id: "e-q", from: "app", to: "queue", label: "publish" },
      { id: "e-201", from: "app", to: "test", label: "201 + id", curve: -0.8 },
    ],
    steps: [
      {
        title: "Build the app from its dependencies",
        note: "createApp takes the database, queue and clock as arguments and does not call listen. The test builds a fresh app with a fresh in-memory database, and supertest sends it a real HTTP request.",
        appear: ["test", "app", "e-req"],
        focus: ["test", "app", "e-req"],
      },
      {
        title: "No token: a 401 and nothing else happens",
        note: "The auth middleware is really attached to the route, and this test proves it. A request with no Authorization header gets 401 before any handler code runs.",
        appear: ["e-401"],
        focus: ["app", "e-401"],
      },
      {
        title: "A valid token and title reach the database",
        note: "Now the request passes auth and validation. The handler writes the note with real SQL into a real database. A unit test with a mocked database could never tell you the SQL is right.",
        hide: ["e-401"],
        appear: ["db", "e-db"],
        focus: ["app", "db", "e-db"],
        set: { db: "1 note stored" },
      },
      {
        title: "The handler publishes an event to the queue",
        note: "The broker is outside our control, so a fake with the same publish interface stands in. It records the message note.created, so the test can check our side of the boundary.",
        appear: ["queue", "e-q"],
        focus: ["queue", "e-q"],
        set: { queue: "note.created x1" },
      },
      {
        title: "The test checks four things at once",
        note: "The answer is 201 with the id. The test also reads the stored row, the exact time from the injected clock, and the queued message. Check the data as well as the status code.",
        appear: ["e-201"],
        focus: ["test", "e-201", "db", "queue"],
      },
      {
        title: "A bad body must change nothing",
        note: "Send a blank title with a valid token. The answer is 400, no row is inserted and no message is published. Checking these non-effects catches bugs that a status code alone would hide.",
        focus: ["app", "e-201"],
        set: { db: "unchanged", queue: "0 messages" },
      },
    ],
  },

  // ---- lesson 4: flaky tests ----
  "testing-4-sleep-vs-retrying-assertion": {
    kind: "array",
    title: "A fixed sleep guesses. A retrying assertion waits for the result.",
    intro: "A test adds a todo. The slow test server answers anywhere from 100 to 500 ms later. Each column is a moment in time.",
    indexLabels: ["", "0 ms", "100 ms", "200 ms", "300 ms", "400 ms", "500 ms"],
    cells: [
      ["server", "waiting", "waiting", "waiting", "answers", "done", "done"],
      ["page", "0 todos", "0 todos", "0 todos", "1 todo", "1 todo", "1 todo"],
      ["sleep", "", "", "", "", "", ""],
      ["retrying", "", "", "", "", "", ""],
    ],
    steps: [
      {
        title: "The server answers at an uneven time",
        note: "Today it answers after 300 ms. On another run it could be 100 or 500. The page shows no todo until the answer arrives. This unevenness is what makes tests flaky.",
        mark: [[0, 4], [1, 4]],
        pointers: [{ at: [0, 4], label: "answer" }],
      },
      {
        title: "A sleep of 200 ms reads too early",
        note: "The flaky test clicks Add, waits a fixed 200 ms, then reads the count once. At 200 ms the page still has 0 todos, so the check fails with Expected 1, Received 0.",
        cells: [
          ["server", "waiting", "waiting", "waiting", "answers", "done", "done"],
          ["page", "0 todos", "0 todos", "0 todos", "1 todo", "1 todo", "1 todo"],
          ["sleep", "click", "sleeping", "reads 0", "", "", ""],
          ["retrying", "", "", "", "", "", ""],
        ],
        mark: [[2, 3], [1, 3]],
        pointers: [{ at: [2, 3], label: "too soon" }],
      },
      {
        title: "On a fast run the same test passes by luck",
        note: "If the server happens to answer in 100 ms, the same test reads 1 todo at 200 ms and passes. Same code, different result. A test that passes and fails with no code change is flaky.",
        cells: [
          ["server", "waiting", "answers", "done", "done", "done", "done"],
          ["page", "0 todos", "1 todo", "1 todo", "1 todo", "1 todo", "1 todo"],
          ["sleep", "click", "sleeping", "reads 1", "", "", ""],
          ["retrying", "", "", "", "", "", ""],
        ],
        done: [[2, 3]],
        mark: [[0, 2]],
      },
      {
        title: "The web-first assertion retries until it is true",
        note: "expect(items).toHaveCount(1) checks again and again until it passes or the timeout ends. It looks at 0, 100 and 200 ms, sees 0 todos, and tries again. It no longer depends on how fast the server is.",
        cells: [
          ["server", "waiting", "waiting", "waiting", "answers", "done", "done"],
          ["page", "0 todos", "0 todos", "0 todos", "1 todo", "1 todo", "1 todo"],
          ["sleep", "", "", "", "", "", ""],
          ["retrying", "not yet", "not yet", "not yet", "", "", ""],
        ],
        dim: [[3, 0], [3, 1], [3, 2]],
        pointers: [{ at: [3, 1], label: "retry" }],
      },
      {
        title: "It passes the moment the todo appears",
        note: "At 300 ms the count is 1 and the assertion passes, with no wasted time. Wait for the result, not for a guessed time. A longer sleep, more retries or force true only hide the race.",
        cells: [
          ["server", "waiting", "waiting", "waiting", "answers", "done", "done"],
          ["page", "0 todos", "0 todos", "0 todos", "1 todo", "1 todo", "1 todo"],
          ["sleep", "", "", "", "", "", ""],
          ["retrying", "not yet", "not yet", "not yet", "passes", "", ""],
        ],
        done: [[3, 4]],
        dim: [[3, 0], [3, 1], [3, 2]],
      },
    ],
  },

  // ---- lesson 5: mutation testing ----
  "testing-5-mutants-killed-survived": {
    kind: "array",
    title: "Mutation testing: would your tests notice a bug?",
    intro: "Stryker changed the String Calculator one small step at a time and ran the five tests from the lesson on each version.",
    cells: [
      ["line", "mutant", "tests"],
      ["line 5", "a - b", ""],
      ["line 2", "if(false)", ""],
      ["line 2", "string", ""],
      ["line 4", "n <= 0", ""],
    ],
    steps: [
      {
        title: "A mutant is the code with one tiny bug added",
        note: "The tool copies the code and changes one thing, such as plus to minus, or an if test to false. Then it runs your tests. The question is simple: does any test fail?",
        mark: [[1, 1], [2, 1], [3, 1], [4, 1]],
      },
      {
        title: "A test fails, so the mutant is killed",
        note: "Changing the sum from a plus b to a minus b breaks the test for 1 and 2, which expects 3. A failing test means the mutant is killed. This is the result you want.",
        cells: [
          ["line", "mutant", "tests"],
          ["line 5", "a - b", "killed"],
          ["line 2", "if(false)", ""],
          ["line 2", "string", ""],
          ["line 4", "n <= 0", ""],
        ],
        done: [[1, 2]],
        mark: [[1, 1]],
      },
      {
        title: "Every test stays green, so the mutant survived",
        note: "Changing n less than 0 into n less than or equal to 0 broke nothing. No test uses a zero. A version that rejected 0 as negative would pass the whole suite, so this points to a missing test.",
        cells: [
          ["line", "mutant", "tests"],
          ["line 5", "a - b", "killed"],
          ["line 2", "if(false)", ""],
          ["line 2", "string", ""],
          ["line 4", "n <= 0", "survived"],
        ],
        done: [[1, 2]],
        mark: [[4, 1], [4, 2]],
        pointers: [{ at: [4, 2], label: "no zero" }],
      },
      {
        title: "Two more survivors point at dead code",
        note: "The line that returns 0 for an empty string is not needed. An empty string splits into one empty piece, Number of it is 0, and the sum is 0 anyway. The mutants behave like the original, so no test can tell them apart.",
        cells: [
          ["line", "mutant", "tests"],
          ["line 5", "a - b", "killed"],
          ["line 2", "if(false)", "survived"],
          ["line 2", "string", "survived"],
          ["line 4", "n <= 0", "survived"],
        ],
        done: [[1, 2]],
        mark: [[2, 2], [3, 2], [4, 2]],
      },
      {
        title: "Read each survivor: add a test or delete code",
        note: "Add a test that add of 0,5 gives 5 to kill the zero mutant. Delete the redundant line, which removes its mutants too. Score: 17 of 20 killed is 85 percent before, and 16 of 16 after.",
        cells: [
          ["line", "mutant", "tests"],
          ["line 5", "a - b", "killed"],
          ["line 2", "gone", "deleted"],
          ["line 2", "gone", "deleted"],
          ["line 4", "n <= 0", "killed"],
        ],
        done: [[1, 2], [4, 2]],
        dim: [[2, 0], [2, 1], [2, 2], [3, 0], [3, 1], [3, 2]],
      },
    ],
  },
};
