import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "react" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "React 19 in one place: components and JSX, the render and commit cycle, state, effects, hooks, forms, data fetching, state placement, performance, patterns and testing. A component is a **pure function** from props and state to UI.",
  sections: [
    {
      title: "JSX and components",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "JSX is function calls: a tag becomes `jsx(X, { a: \"1\" })`, which returns a plain **element** object.",
            "Component names start with a **capital**. Lowercase makes a DOM tag and your function is never called.",
            "Return one root (or a fragment). Close every tag. `className`, `htmlFor`, `onClick`. `style` takes an object.",
            "`true`, `false`, `null`, `undefined` render nothing. A plain object as a child is an error.",
            "Props are read-only and flow **down**. Events go up: pass a callback prop.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`{count && ...}` renders `0` when count is 0. Write `count > 0 && ...`. Also `onClick={f()}` calls f during render. Write `onClick={f}`.",
        },
      ],
    },
    {
      title: "Pure rendering and lists",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "Render must be **pure**: same props, state, context give the same JSX, with no changes to outside variables, no fetch, no timers.",
            "Strict Mode (dev only) calls components twice to expose impurity. Local mutation of things made in this render is fine.",
            "Lists need a `key`: **stable and unique among siblings**, ideally a data ID. Not `Math.random()`. Index only for static lists.",
            "Conditional rendering is plain JS: early `return`, ternary, `&&`, `return null`.",
          ],
        },
      ],
    },
    {
      title: "Trigger, render, commit",
      lesson: 1,
      blocks: [
        {
          kind: "code",
          lang: "text",
          code: "render Parent, render Child\nref attached\nlayoutEffect Child\n(browser paints)\neffect Child, effect Parent",
          note: "Real order from a traced run. Children's effects run before their parent's.",
        },
        {
          kind: "points",
          items: [
            "**Render** calls your functions. **Commit** touches the DOM, only where it differs. A re-render can change nothing.",
            "A parent render re-renders all children, unless the child is wrapped in `memo`.",
            "Same type at the same position keeps state. Different type resets it. `key` changes identity.",
          ],
        },
      ],
    },
    {
      title: "useState rules",
      lesson: 1,
      blocks: [
        {
          kind: "code",
          lang: "tsx",
          code: "setCount(count + 1); // x3 gives +1\nsetCount((c) => c + 1); // x3 gives +3\nconst [v] = useState(\n  () => readStorage()); // lazy",
        },
        {
          kind: "points",
          items: [
            "State is a **snapshot**. The setter queues a render. The variable in your handler does not change.",
            "Updates are **batched** into one render, also in timeouts and promises (React 18+).",
            "Never mutate. Copy: `{ ...obj, k }`, `[...arr, x]`, `arr.filter`, `arr.map`. React compares with `Object.is`.",
            "Do not store what you can compute. Do not copy props into state. Keep state low, lift only when siblings must agree.",
          ],
        },
      ],
    },
    {
      title: "Keys and identity bugs",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Bug", "Cause", "Fix"],
          rows: [
            ["Input text jumps to another row", "`key={index}` after a delete", "`key={item.id}`"],
            ["Typed text lost on parent render", "Component defined inside a component", "Define at module level"],
            ["Old form state after prop change", "Same type, same position", "`key={userId}`"],
          ],
        },
      ],
    },
    {
      title: "useEffect",
      lesson: 2,
      blocks: [
        {
          kind: "code",
          lang: "tsx",
          code: "useEffect(() => {\n  const c = connect(roomId);\n  return () => c.disconnect(); // cleanup\n}, [roomId]);",
          note: "Old cleanup runs first, then the new setup. Unmount runs the last cleanup.",
        },
        {
          kind: "table",
          head: ["Form", "Runs"],
          rows: [
            ["`useEffect(fn, [a, b])`", "After mount and when a or b changes"],
            ["`useEffect(fn, [])`", "Mount only (cleanup on unmount)"],
            ["`useEffect(fn)`", "After every render"],
          ],
        },
        {
          kind: "points",
          items: [
            "Effects **sync with an outside system**. They are not \"on mount\" or \"on update\" hooks.",
            "Strict Mode runs setup, cleanup, setup in dev. Write the cleanup. Never \"fix\" it with a ref flag.",
            "Object or function dependencies are new each render, so the effect re-runs. Use primitives.",
          ],
        },
      ],
    },
    {
      title: "Effect traps and fixes",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Trap", "Fix"],
          rows: [
            ["Stale closure in `setInterval`", "`setCount(c => c + 1)`, honest deps, or `useEffectEvent`"],
            ["Fetch race (old answer lands last)", "`ignore` flag or `AbortController`"],
            ["Derived state in an effect", "Compute in render (extra render otherwise)"],
            ["Reset state on prop change", "`key`, not an effect"],
            ["Reaction to a click", "Event handler"],
            ["`async` effect function", "Define async inside, call it"],
            ["Effect sets state it depends on", "Infinite loop: restructure"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Never silence `exhaustive-deps`. `useLayoutEffect` runs before paint: only to measure the DOM.",
        },
      ],
    },
    {
      title: "Hooks cheat list",
      lesson: 3,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["useRef", "Box that does not render. DOM nodes, timer IDs. In 19 `ref` is a prop"],
            ["useMemo", "Skip a slow calculation. A hint, may be dropped"],
            ["useCallback", "Same function identity. Only helps `memo` children and deps"],
            ["useReducer", "Many updates, rules in one pure fn. `dispatch` is stable"],
            ["useSyncExternalStore", "Subscribe to a non-React store safely"],
            ["use (19)", "Read a promise or context. Callable in `if`. Promise must be stable"],
            ["useId", "Unique, hydration-safe ID for labels"],
          ],
        },
        {
          kind: "points",
          items: [
            "Rules: top level only, never in conditions, loops, handlers or after an early return. React matches hooks **by call order**.",
            "A custom hook (name starts with `use`) shares **logic, not state**. Each call has its own.",
          ],
        },
      ],
    },
    {
      title: "Events and forms",
      lesson: 4,
      blocks: [
        {
          kind: "points",
          items: [
            "`onChange` fires on every keystroke. Events bubble. `stopPropagation` stops them. `preventDefault` stops a submit reload.",
            "A button in a form submits by default: use `type=\"button\"` for the rest.",
            "**Controlled**: `value` + `onChange`, start with `\"\"` never `undefined`. **Uncontrolled**: `defaultValue`, read with `FormData`.",
            "Validate on the server too. Labels with `htmlFor`, `aria-invalid`, `aria-describedby`, `role=\"alert\"`.",
          ],
        },
        {
          kind: "pairs",
          rows: [
            ["form action={fn}", "Calls fn(formData) in a transition"],
            ["useActionState(fn, init)", "`[state, formAction, isPending]`"],
            ["useFormStatus()", "`pending` of the parent form (call in a child)"],
            ["useOptimistic", "Temporary value until the real state arrives"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "React 19 resets uncontrolled fields after an action. Return typed values in state and use them as `defaultValue`.",
        },
      ],
    },
    {
      title: "Fetching server data",
      lesson: 5,
      blocks: [
        {
          kind: "points",
          items: [
            "`fetch` does **not** reject on 404 or 500. Check `res.ok` and throw. Aborted fetch rejects with `AbortError`.",
            "Effect fetching has races, no sharing, no cache, waterfalls. Use TanStack Query, SWR, RTK Query or a framework loader.",
            "Query key holds **everything the function reads**: `[\"user\", id]`. `staleTime` (default 0) is how long data is fresh. `gcTime` (5 min) is how long unused data is kept.",
            "After a mutation, `invalidateQueries` to refetch. Retry defaults to 3. Never copy `data` into state.",
            "`use(promise)` + Suspense: promise must be created outside render. Suspense does not remove waterfalls.",
          ],
        },
      ],
    },
    {
      title: "Where state lives",
      lesson: 6,
      blocks: [
        {
          kind: "table",
          head: ["State is…", "Put it in"],
          rows: [
            ["One component's", "`useState` there"],
            ["Siblings must agree", "Closest common parent"],
            ["Computable", "Nowhere: compute in render"],
            ["Many fields, many updates", "`useReducer`"],
            ["Many readers, rarely changes", "Context"],
            ["Server data", "Query cache"],
            ["Shared, changes often", "Store with selectors (Zustand, Redux Toolkit)"],
            ["Shareable or survives refresh", "The URL"],
          ],
        },
        {
          kind: "points",
          items: [
            "Context re-renders **every consumer**, even `memo` ones. Split contexts, memoise the value, put state and dispatch apart.",
            "Zustand: selector returning a new object each time can loop. Pick narrow slices.",
          ],
        },
      ],
    },
    {
      title: "Performance",
      lesson: 7,
      blocks: [
        {
          kind: "steps",
          items: [
            "**Measure** first: render counter, `Profiler`, DevTools. Production build, throttled CPU.",
            "A component renders for 3 reasons: first time, own state or context, **parent rendered**.",
            "Cheapest fix: move state down, or pass heavy parts as `children`.",
            "`memo` + stable props (`useCallback`). One inline function defeats `memo` (15 renders, 0 when fixed).",
            "Long lists: virtualise (50,006 DOM nodes became 115). Heavy code: `lazy` + Suspense.",
            "Slow but unavoidable: `useTransition` or `useDeferredValue`. Fix the render if it takes 2 s.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "React Compiler adds memoization at build time (15 renders to 0). Components and hooks only. Still learn `memo` and `useMemo`.",
        },
      ],
    },
    {
      title: "Patterns, boundaries, portals",
      lesson: 8,
      blocks: [
        {
          kind: "points",
          items: [
            "Composition: `children`, slots (JSX props), compound components, render props, custom hooks. Avoid 25 boolean props.",
            "**Error boundary** catches render errors (and errors in `startTransition`). Not event handlers, timers or promises. Reset with a new `key`.",
            "Boundaries: root, per route, per widget. **Portals** move the DOM node only; context and event bubbling follow the React tree.",
          ],
        },
        {
          kind: "table",
          head: ["Term", "Meaning"],
          rows: [
            ["SSR", "Server makes first HTML, browser hydrates"],
            ["Server Component", "Runs only on server, code never shipped"],
            ["`'use client'`", "Marks the client boundary, not \"no SSR\""],
            ["`'use server'`", "Marks Server Functions, not Server Components"],
          ],
        },
      ],
    },
    {
      title: "Testing React",
      lesson: 8,
      blocks: [
        {
          kind: "points",
          items: [
            "Test like a user: render, `getByRole` (with name) first, then `getByLabelText`, `getByText`. `getByTestId` last.",
            "`getBy` throws, `queryBy` returns null (assert absence), `findBy` waits. Use `userEvent`, and `await` every action.",
            "Mock the edges (network, timers), not your own components. `renderHook` for hooks. Snapshots only when small.",
            "jsdom has no layout: keep a few end-to-end tests.",
          ],
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 9,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["Is the virtual DOM why React is fast?", "No. It saves manual updates; speed comes from fewer renders."],
            ["setState three times?", "Adds 1. Use the updater form."],
            ["Why keys?", "Identity, so state follows the item."],
            ["Effects run twice?", "Strict Mode in dev. Fix cleanup."],
            ["When does a component re-render?", "New, own state or context, or parent rendered."],
            ["Does `memo` always work?", "No: inline function props and context defeat it."],
            ["Server Components vs SSR?", "Different. SSR hydrates. RSC code never ships."],
            ["Context vs store?", "Context carries a value. Stores give selectors."],
          ],
        },
      ],
    },
  ],
};
