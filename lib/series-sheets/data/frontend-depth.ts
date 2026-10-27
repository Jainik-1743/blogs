import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "frontend-depth" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "The ideas senior frontend interviews test: how React renders, hooks and stale closures, concurrent React and Server Components, where state lives, advanced TypeScript, testing strategy and accessibility.",
  sections: [
    {
      title: "Render, commit, reconcile",
      lesson: 0,
      blocks: [
        {
          kind: "points",
          items: [
            "**Render** calls components (must be **pure**: same props, state, context gives same output, no side effects). **Commit** changes the DOM and runs effects.",
            "Different element type at a position: subtree is destroyed, state lost. **Same type, same position**: updated, state kept.",
            "State belongs to the **position in the tree**, not to the function. Use `key` to reset it on purpose.",
            "Never define a component inside another component: new type every render, so it remounts.",
          ],
        },
        {
          kind: "table",
          head: ["Commit order", "What runs"],
          rows: [
            ["1", "DOM mutations, refs attached"],
            ["2", "`useLayoutEffect` (sync, before paint)"],
            ["3", "Browser paints"],
            ["4", "`useEffect` (after paint)"],
          ],
        },
      ],
    },
    {
      title: "State snapshots, batching, keys",
      lesson: 0,
      blocks: [
        {
          kind: "code",
          lang: "tsx",
          code: "setCount(count + 1);\nsetCount(count + 1);   // +1 in total\n\nsetCount((c) => c + 1);\nsetCount((c) => c + 1); // +2 in total",
          note: "State is a snapshot per render. Use the updater when the next value depends on the old one.",
        },
        {
          kind: "points",
          items: [
            "Batching (React 18+): updates in events, timeouts and promises give one render.",
            "Keys must be **stable and unique among siblings**. Never `Math.random()`.",
            "Index keys tie state to a position: after a delete, input text jumps to the wrong row.",
          ],
        },
      ],
    },
    {
      title: "Rules of Hooks and effects",
      lesson: 1,
      blocks: [
        {
          kind: "points",
          items: [
            "Hooks are matched **by call order** in a list. So call them at the top level only, never in `if` or loops.",
            "`useEffect` **syncs with something outside React** (subscription, timer, widget, fetch). Return a cleanup.",
            "Dependency array lists every reactive value the effect reads. `[]` runs on mount only. No array runs every render.",
            "Objects, arrays and functions made in render are new each time, so they re-run the effect. Move them out or memoise.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Do not switch off `react-hooks/exhaustive-deps`. A lie in the deps array is a stale closure.",
        },
      ],
    },
    {
      title: "Stale closures",
      lesson: 1,
      blocks: [
        {
          kind: "code",
          lang: "tsx",
          code: "useEffect(() => {\n  const id = setInterval(() => {\n    setCount((c) => c + 1); // updater\n  }, 1000);\n  return () => clearInterval(id);\n}, []);",
          note: "With `[]` and `count + 1` the callback keeps seeing count from render 1.",
        },
        {
          kind: "steps",
          items: [
            "**Functional update** so you need not read the value.",
            "**Honest dependencies**: the effect re-runs when the value changes.",
            "**Ref** holding the latest value, or `useEffectEvent` (React 19.2): reads latest props and state, is not a dependency, call it only inside effects.",
          ],
        },
      ],
    },
    {
      title: "The other hooks",
      lesson: 1,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["useRef", "Box `{ current }`. Changing it does not render. DOM nodes, timer IDs"],
            ["useLayoutEffect", "Before paint. Measure DOM, avoid flicker. Blocks paint"],
            ["useMemo", "Remember a **value** until deps change. Speed hint only"],
            ["useCallback", "Remember a **function**. Needs `React.memo` child or effect dep"],
            ["useReducer", "Many related changes by rules. `dispatch` is stable"],
            ["useId", "Unique ID, same on server and client (labels, aria)"],
            ["useSyncExternalStore", "Read a store React does not own (3 args, incl. server value)"],
            ["use (React 19)", "Read a promise or context in render. Needs Suspense; callable in `if`"],
            ["useActionState", "`[state, formAction, isPending]` from an async action"],
          ],
        },
      ],
    },
    {
      title: "You might not need an effect",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Instead of an effect for…", "Do this"],
          rows: [
            ["Copying props to state", "Compute it in render (`useMemo` if slow)"],
            ["Reacting to a click", "Put the work in the event handler"],
            ["Resetting state on id change", "`key={id}` on the component"],
            ["Telling the parent", "Call `onChange` in the same handler"],
            ["Fetching", "TanStack Query, SWR or Server Components; else clean up races"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Effects are for code that runs because the component was shown, not because the user did something.",
        },
      ],
    },
    {
      title: "Concurrent React and Suspense",
      lesson: 2,
      blocks: [
        {
          kind: "points",
          items: [
            "Urgent updates (typing, clicks) beat **transitions**. React can interrupt a transition render. Commit cannot be interrupted.",
            "`useTransition` gives `[isPending, startTransition]`. It wraps the **update**. `useDeferredValue` wraps a **value** you receive.",
            "Only updates before the first `await` inside `startTransition` are marked.",
            "**Suspense** shows a fallback while children wait (`lazy`, `use`, async Server Components). Use several boundaries, pair with error boundaries.",
          ],
        },
        {
          kind: "table",
          head: ["Aspect", "Debounce", "startTransition"],
          rows: [
            ["Fixed delay", "Yes", "No"],
            ["Interruptible", "No", "Yes"],
            ["Use for", "Typeahead fetches", "Heavy re-renders"],
          ],
        },
      ],
    },
    {
      title: "Server Components and streaming",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Server Component", "Client Component"],
          rows: [
            ["`async`, DB, files, secrets", "`useState`, effects, `onClick`"],
            ["Sends no component JS", "Bundle ships; also server-rendered once"],
            ["No state, effects, browser APIs", "Browser APIs allowed"],
            ["Can render Client Components", "Receives Server Components as `children`"],
          ],
        },
        {
          kind: "points",
          items: [
            "`\"use client\"` marks the boundary. The file and its imports join the bundle. Put it on **interactive leaves**.",
            "Props across the boundary must be **serialisable**. No functions or class instances. Server Actions are the exception.",
            "A **Server Action** (`\"use server\"`) is a public endpoint: check auth and validate input.",
            "Streaming sends the shell first, then Suspense parts. Selective hydration hydrates each boundary by priority.",
          ],
        },
      ],
    },
    {
      title: "Hydration mismatches",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Cause", "Fix"],
          rows: [
            ["`Date.now()`, `Math.random()` in render", "Compute on server and pass a prop, or set after mount"],
            ["`window`, `localStorage` in render", "Read in `useEffect`, or `useSyncExternalStore`"],
            ["Bad HTML nesting (`div` in `p`)", "Fix the markup"],
            ["Browser extensions", "`suppressHydrationWarning`, sparingly"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "A heavy library in a Client Component grows the bundle, hydration cost and server render time. Do heavy work in a Server Component, move the boundary down, lazy-load.",
        },
      ],
    },
    {
      title: "Where state lives",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Kind", "Home"],
          rows: [
            ["Local UI (open, tab)", "`useState` / `useReducer`"],
            ["Server data", "TanStack Query, SWR, RTK Query, Server Components"],
            ["Where the user is (filter, page)", "The **URL** (`searchParams`)"],
            ["Form", "React Hook Form or TanStack Form + Zod"],
            ["Shared, rare change", "Context"],
            ["Shared, frequent change", "Store with selectors (Zustand, Redux Toolkit, Jotai)"],
          ],
        },
        {
          kind: "points",
          items: [
            "Server state is a **cache of something you do not own**: key, dedupe, `staleTime`, invalidate. Do not copy it into Redux.",
            "Model status as a union, not booleans. Colocate. One source of truth.",
          ],
        },
      ],
    },
    {
      title: "TypeScript essentials",
      lesson: 4,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["unknown vs any", "`unknown` must be narrowed. `any` switches checks off"],
            ["T extends { id: string }", "Constraint: needs `id`, keeps the exact type"],
            ["K extends keyof T", "Key must exist. Returns `T[K]`"],
            ["satisfies", "Checks a value, keeps its exact type"],
            ["as const", "Literal types and `readonly`"],
            ["infer", "Name a part inside a conditional type"],
          ],
        },
        {
          kind: "table",
          head: ["Utility", "Effect"],
          rows: [
            ["`Partial` / `Required`", "All optional / all required"],
            ["`Pick` / `Omit`", "Keep / drop keys"],
            ["`Record`", "Object type with chosen keys"],
            ["`ReturnType` / `Awaited`", "Function result / unwrap a Promise"],
          ],
        },
      ],
    },
    {
      title: "Narrowing and DeepPartial",
      lesson: 4,
      blocks: [
        {
          kind: "code",
          lang: "ts",
          code: "switch (s.kind) {\n  case \"circle\":\n    return Math.PI * s.radius ** 2;\n  case \"rect\": return s.width * s.height;\n  default: {\n    const _x: never = s; // forces a case\n    return _x;\n  }\n}",
          note: "Discriminated union with an exhaustive check.",
        },
        {
          kind: "code",
          lang: "ts",
          code: "type DeepPartial<T> =\n  T extends (...a: never[]) => unknown ? T\n  : T extends readonly (infer U)[]\n    ? DeepPartial<U>[]\n  : T extends object\n    ? { [K in keyof T]?: DeepPartial<T[K]> }\n  : T;",
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Keep API types honest: one schema (Zod) for types and validation, or generate from OpenAPI. Never trust `res.json()`.",
        },
      ],
    },
    {
      title: "Testing strategy",
      lesson: 5,
      blocks: [
        {
          kind: "points",
          items: [
            "**Trophy**: static checks, many integration tests, some unit tests, few E2E (login, checkout).",
            "Query order: `getByRole` (with name), `getByLabelText`, `getByText`, `getByTestId` last. Use `user-event`.",
            "`getBy` must exist now, `queryBy` may be absent (returns `null`), `findBy` waits.",
            "**Mock the network with MSW**, not your own modules. Set `onUnhandledRequest: \"error\"`. Use a custom `render` with providers.",
            "Playwright locators and web-first assertions auto-wait. Log in once, reuse `storageState`.",
            "Snapshots only for small output. Tests that break on every refactor test implementation, not behaviour.",
          ],
        },
      ],
    },
    {
      title: "Accessibility checklist",
      lesson: 6,
      blocks: [
        {
          kind: "points",
          items: [
            "**Semantic HTML first**: `button` for actions, `a href` for navigation, `label` for inputs. A `div onClick` has no focus, role or keys.",
            "Every control needs an **accessible name** (label, text, `aria-label`). Decorative images use `alt=\"\"`. A placeholder is not a label.",
            "Keyboard: logical Tab order, visible `:focus-visible`, no traps, Escape closes popups. Roving `tabIndex` in tabs.",
            "Contrast (AA): **4.5:1** text, **3:1** large text and UI parts. Never colour alone. Respect `prefers-reduced-motion`.",
            "Test with `jsx-a11y`, axe, a keyboard pass and a screen reader. Automation finds only part of the issues.",
          ],
        },
        {
          kind: "table",
          head: ["ARIA", "Use"],
          rows: [
            ["`aria-expanded` / `aria-controls`", "Disclosure, menu state"],
            ["`aria-describedby` + `aria-invalid`", "Field hint and error"],
            ["`role=\"status\"` / `role=\"alert\"`", "Polite / urgent live announce"],
          ],
        },
      ],
    },
    {
      title: "Modals and focus",
      lesson: 6,
      blocks: [
        {
          kind: "steps",
          items: [
            "Move focus **into** the dialog on open.",
            "Keep it inside (focus trap) and make the background `inert`.",
            "Close on **Escape** and with a visible button.",
            "Return focus to the trigger on close.",
            "Give it a name (`aria-labelledby`) and `aria-modal`.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Use native `dialog` with `showModal()` or Radix, React Aria, Headless UI. After a route change move focus to the new heading. After a failed submit, to the first error.",
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
            ["Why are index keys risky?", "State sticks to the position, not the item."],
            ["Why must hooks keep order?", "React finds state by call order."],
            ["Stale count in an interval?", "Closure over render 1. Updater, deps or ref."],
            ["Context wrong when?", "Fast-changing or large values: all consumers re-render."],
            ["unknown vs any?", "Must narrow vs checks off."],
            ["Hydration error cause?", "First client render differs from server HTML."],
            ["How is ARIA harmful?", "Announces what the element cannot do."],
            ["Why mock the network?", "Real code runs, tests survive refactors."],
          ],
        },
      ],
    },
  ],
};
