import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "typescript" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "TypeScript from setup to strict migration: narrowing, objects and classes, generics, utility and mapped types, modules, runtime validation, and reading errors. Types are **erased**, so the checker never sees real data.",
  sections: [
    {
      title: "What TypeScript is",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Tool", "Checks types?", "Use it for"],
          rows: [
            ["`tsc`", "Yes (the only one)", "`tsc --noEmit` in CI and editors"],
            ["`tsx file.ts`", "No", "Run now (strips types)"],
            ["`node file.ts`", "No", "Run on Node 22.18+ (strips types)"],
          ],
        },
        {
          kind: "points",
          items: [
            "TypeScript = JavaScript + a checker. `interface`, `type` and `: string` are deleted, so you cannot test them at runtime.",
            "Node's stripping fails on enums, parameter properties and runtime namespaces. It ignores `tsconfig.json`, so `paths` do not work.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`JSON.parse(s) as { id: number }` passes `tsc` and still crashes at runtime. `as` is an instruction, not a conversion.",
        },
      ],
    },
    {
      title: "A starter tsconfig",
      lesson: 0,
      blocks: [
        {
          kind: "code",
          lang: "json",
          code: "{ \"compilerOptions\": {\n  \"target\": \"es2022\", \"module\": \"nodenext\",\n  \"strict\": true,\n  \"noUncheckedIndexedAccess\": true,\n  \"skipLibCheck\": true,\n  \"isolatedModules\": true,\n  \"verbatimModuleSyntax\": true,\n  \"erasableSyntaxOnly\": true,\n  \"allowImportingTsExtensions\": true,\n  \"noEmit\": true, \"types\": [\"node\"] },\n  \"include\": [\"src\"] }",
        },
        {
          kind: "pairs",
          rows: [
            ["strict", "Null checks, `noImplicitAny` and more (default since TS 6)"],
            ["noUncheckedIndexedAccess", "`arr[i]` becomes `T | undefined`; not in `strict`"],
            ["skipLibCheck", "Skip `.d.ts` checks: faster, hides library errors"],
            ["verbatimModuleSyntax", "Imports kept as written; types need `import type`"],
          ],
        },
      ],
    },
    {
      title: "Basic types and inference",
      lesson: 1,
      blocks: [
        {
          kind: "points",
          items: [
            "Primitives are lowercase: `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined`. Tuple: `[string, number]`.",
            "`let x = \"a\"` is `string` (widened). `const x = \"a\"` is `\"a\"` (literal). `{ dir: \"up\" }` has `dir: string`; fix with an annotation or `as const`.",
            "Let inference work for locals. Write **parameter types**, **exported return types**, and empty starts.",
          ],
        },
        {
          kind: "table",
          head: ["Type", "Meaning", "Calls allowed?"],
          rows: [
            ["`any`", "Checker off, spreads everywhere", "Anything"],
            ["`unknown`", "Safe unknown: narrow first", "None until narrowed"],
            ["`never`", "No value (throws, impossible)", "n/a"],
          ],
        },
      ],
    },
    {
      title: "Narrowing and unions",
      lesson: 1,
      blocks: [
        {
          kind: "code",
          lang: "ts",
          code: "type Shape =\n  | { kind: \"circle\"; r: number }\n  | { kind: \"square\"; side: number };\n\nfunction area(s: Shape): number {\n  switch (s.kind) {\n    case \"circle\":\n      return Math.PI * s.r ** 2;\n    case \"square\": return s.side ** 2;\n    default: return fail(s); // takes never\n  }\n}",
        },
        {
          kind: "points",
          items: [
            "Narrow with `typeof`, `instanceof`, `in`, `=== null`, truthiness, `Array.isArray`, or a `kind` tag.",
            "Traps: `typeof null` is `\"object\"`; `if (!count)` also drops `0`.",
            "`x!` adds nothing at runtime. Use a real check that throws, `??`, or `?.`.",
          ],
        },
      ],
    },
    {
      title: "Objects, interface vs type",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Topic", "interface", "type"],
          rows: [
            ["Declared twice", "Merges", "Error `TS2300`"],
            ["Unions, tuples, functions", "No", "Yes"],
            ["Extend", "`extends` (clash errors early)", "`&` (clash becomes `never`)"],
          ],
        },
        {
          kind: "points",
          items: [
            "`?` makes a property optional (adds `| undefined`). `readonly` is compile time only; use `Object.freeze` for real.",
            "Index signature `{ [k: string]: number }` reads as `number | undefined` with `noUncheckedIndexedAccess`. Known keys: `Record<\"a\" | \"b\", number>`.",
          ],
        },
      ],
    },
    {
      title: "Structural typing and excess checks",
      lesson: 2,
      blocks: [
        {
          kind: "points",
          items: [
            "Shape decides, not the name. Two classes with the same fields are interchangeable unless branded.",
            "**Excess property check**: only for an object literal written in place (`TS2561`, with a \"Did you mean\" hint). Not for a variable or a cast.",
            "**Weak type** (`TS2559`): an all-optional type with no property in common is refused.",
          ],
        },
        {
          kind: "code",
          lang: "ts",
          code: "const dirs = [\"up\", \"down\"] as const;\ntype Dir = (typeof dirs)[number];\n// \"up\" | \"down\"\n\nconst p = { red: [255, 0], green: \"#0f0\" }\n  satisfies Record<string, string|number[]>;\np.red.map(n => n);   // precise type kept",
          note: "`satisfies` checks and keeps precision; an annotation widens; `as` skips the check.",
        },
      ],
    },
    {
      title: "Classes and enums",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Feature", "Behaviour"],
          rows: [
            ["`private`", "Compile time only; visible in `Object.keys`"],
            ["`#pin`", "Real runtime private; hidden from `keys`"],
            ["Parameter property", "`constructor(public x)`: needs codegen, banned by `erasableSyntaxOnly`"],
            ["`enum`", "Runtime object; prefer a union of literals"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "`const { method } = obj; method()` loses `this` and crashes with no `tsc` error. Use an arrow field, `bind`, or call `obj.method()`.",
        },
      ],
    },
    {
      title: "Function types and overloads",
      lesson: 3,
      blocks: [
        {
          kind: "points",
          items: [
            "Optional and default parameters go last; rest `...xs: number[]` collects the rest.",
            "`void` = ignore the result (`() => 42` fits `() => void`). `never` = never returns.",
            "**Overloads**: several body-less signatures plus one implementation. Callers see only the overloads, tried in order (`TS2769` if none fit). Prefer a union or generic.",
            "`this` parameter: `function who(this: { name: string })` is erased and stops lost-`this` calls (`TS2684`).",
          ],
        },

      ],
    },
    {
      title: "Generics",
      lesson: 3,
      blocks: [
        {
          kind: "code",
          lang: "ts",
          code: "function first<T>(xs: T[]): T | undefined {\n  return xs[0];\n}\nfunction len<T extends { length: number }>(\n  x: T) {\n  return x.length;      // T kept\n}\nfunction get<T, K extends keyof T>(\n  o: T, k: K): T[K] {\n  return o[k];      // wrong key = error\n}",
        },
        {
          kind: "points",
          items: [
            "Inference reads arguments and callbacks. With nothing to infer (empty list), pass the type argument yourself.",
            "A bare type parameter has no members (`TS2339`); add `extends`. If it appears once in the signature, drop it.",
            "`keyof` = key union. `typeof v` = a value's type. Indexed access `T[K]`. `(typeof a)[number]` = item type.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "A generic fetch that only casts `T` is a lie: make the caller pass a parser. For an event emitter, one map from event name to payload, with `K extends keyof E`, ties every event to its data.",
        },
      ],
    },

    {
      title: "Utility types",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Type", "Result"],
          rows: [
            ["`Partial` / `Required`", "All optional / all required"],
            ["`Pick` / `Omit`", "Keep / drop object keys"],
            ["`Record`", "Object with given keys and value type"],
            ["`Exclude` / `Extract`", "Drop / keep union members"],
            ["`ReturnType`, `Parameters`", "Read a function type"],
            ["`Awaited`", "Type after `await`"],
          ],
        },
        {
          kind: "points",
          items: [
            "PATCH body: `Partial` of `Omit` of the User without `id`. Async result: `Awaited` of `ReturnType` of the function.",
            "`Omit` on a union collapses to the shared keys. Make a distributive helper.",
          ],
        },
      ],
    },
    {
      title: "Mapped, conditional, template types",
      lesson: 4,
      blocks: [
        {
          kind: "code",
          lang: "ts",
          code: "type P2<T> = { [K in keyof T]?: T[K] };\ntype Mut<T> =\n  { -readonly [K in keyof T]-?: T[K] };\ntype Getters<T> = {\n  [K in keyof T\n    as `get${Capitalize<string & K>}`]:\n    () => T[K];\n};\ntype Ret<T> =\n  T extends (...a: any[]) => infer R\n    ? R : never;",
          note: "`as` renames keys (`never` drops them). `[T]` wrapping stops distribution.",
        },
        {
          kind: "points",
          items: [
            "Looping over `keyof T` keeps modifiers. `+`/`-` add or remove `readonly` and `?`.",
            "A naked type parameter in `extends` distributes over a union. Wrap both sides in `[ ]` to stop it; needed to test for `never`.",
            "Template types build string unions, such as `\"onClick\" | \"onFocus\"`. Stop when the type is harder than the code (`TS2589` = too deep).",
          ],
        },
      ],
    },
    {
      title: "Modules and declaration files",
      lesson: 5,
      blocks: [
        {
          kind: "table",
          head: ["Project", "module", "moduleResolution"],
          rows: [
            ["Node app or library", "`nodenext`", "`nodenext`"],
            ["Vite or Next.js", "`esnext` / `preserve`", "`bundler`"],
          ],
        },
        {
          kind: "points",
          items: [
            "Under `nodenext` write the output extension: `import \"./util.js\"` in a `.ts` file.",
            "`paths` helps only the checker. `node` still fails with `ERR_MODULE_NOT_FOUND`; add a bundler alias or `imports` in `package.json`.",
            "`@types/x` gives types to JS libraries (`TS7016` if missing). A `.d.ts` with a top-level `import`/`export` **augments** instead of declaring.",
            "`__dirname` passes `tsc` but crashes in ESM. Use `import.meta.dirname`.",
            "Monorepo: `references` and `tsc -b`. Library: `declaration`, `exports` with `types` first, check with `@arethetypeswrong/cli`.",
          ],
        },
        {
          kind: "code",
          lang: "ts",
          code: "// env.d.ts\ndeclare global {\n  namespace NodeJS {\n    interface ProcessEnv {\n      DATABASE_URL: string }\n  }\n}\nexport {};",
        },
      ],
    },

    {
      title: "React, Express and runtime validation",
      lesson: 6,
      blocks: [
        {
          kind: "table",
          head: ["Case", "Write"],
          rows: [
            ["Empty state", "Give `useState` a type argument: `User | null`, `string[]`"],
            ["Events", "`ChangeEvent` of the element, or an inline handler"],
            ["Element ref", "`useRef` starts `null`: use `ref.current?.focus()`"],
            ["Reducer", "Action union with a `type` tag"],
            ["Express", "`Request` params, body, query; `req.body` is `any`"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "A hand-written guard `x is Todo` is trusted fully; checking only `id` lets a bad `done` through. Brand same-shaped ids (`string & { __brand: \"UserId\" }`) in one validated place.",
        },
        {
          kind: "code",
          lang: "ts",
          code: "const User = z.object({ id: z.number() });\ntype User = z.infer<typeof User>;\n\nconst r = User.safeParse(req.body);\nif (!r.success)\n  return res.status(400).json(r.error);\nconst env = Env.parse(process.env);",
          note: "`parse` throws; `safeParse` returns { success, data or error }. Parse `process.env` once at startup; use `z.coerce.number()`.",
        },
      ],
    },

    {
      title: "Common errors and fixes",
      lesson: 7,
      blocks: [
        {
          kind: "table",
          head: ["Code", "Means", "Fix"],
          rows: [
            ["`TS2322`", "Type A not assignable to B", "Fix the value or widen the type"],
            ["`TS2339`", "Property does not exist", "Fix the name or the type"],
            ["`TS2345`", "Wrong argument type", "Pass the right type"],
            ["`TS18048` / `TS2532`", "Possibly `undefined`", "`if`, `?.`, `??`"],
            ["`TS2307`", "Cannot find module", "Path, extension, install, `declare module`"],
          ],
        },
        {
          kind: "points",
          items: [
            "Read errors **from the bottom**: the last indented line is the cause. `tsc` shows the first difference only.",
            "Use `@ts-expect-error` with a reason, not `@ts-ignore`: a stale one fails with `TS2578`.",
          ],
        },
      ],
    },
    {
      title: "Migrating to strict",
      lesson: 7,
      blocks: [
        {
          kind: "steps",
          items: [
            "Add `allowJs` and a `tsconfig`. Keep the build green.",
            "Add `checkJs` (or `// @ts-check` per file) with JSDoc types.",
            "Rename to `.ts` a folder at a time, still non-strict.",
            "Turn on `noImplicitAny` first (`any` hides other errors), then `strictNullChecks`.",
            "Then the other `strict` flags one by one; `noUncheckedIndexedAccess` last.",
            "Commit after each step: all at once gave 18 errors, in steps 10, then 1 at a time.",
          ],
        },
        {
          kind: "points",
          items: [
            "CI: `tsc --noEmit` (or `tsc -b`). Plain `tsc` exits 2 but still writes JS.",
            "`typescript-eslint` adds `no-floating-promises`, no explicit `any`, no `!`, no `@ts-ignore`.",
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
            ["any vs unknown?", "`any` switches checks off; `unknown` forces a narrow first."],
            ["interface vs type?", "`interface` merges; `type` names unions, tuples, functions."],
            ["Enum or union?", "Union of literals: no runtime code. `as const` object if you need the list."],
            ["Why can types not protect API data?", "They are erased; validate at the edge with a schema."],
            ["When is `as` fine?", "A check the compiler cannot follow, inside a tested helper. Never on outside data."],
          ],
        },
      ],
    },
  ],
};
