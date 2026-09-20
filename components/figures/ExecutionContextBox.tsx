import Figure from "./Figure";

/** The execution context as a two-column box: memory component on the left, code component on the right. */
export default function ExecutionContextBox() {
  return (
    <Figure
      caption="An execution context is a box with two halves. The left half is filled first (memory creation phase), then the right half runs line by line (code execution phase)."
      note="one context"
    >
      <div className="mx-auto max-w-[36rem] overflow-hidden rounded-lg border border-sky/50">
        <div className="border-b border-sky/40 bg-sky-soft px-4 py-2 text-center font-mono text-[0.78rem] uppercase tracking-[0.1em] text-sky-strong">
          Execution context
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="border-b border-line p-4 sm:border-b-0 sm:border-r">
            <div className="mb-1 font-semibold text-violet-200">Memory component</div>
            <div className="mb-3 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim">
              Variable environment
            </div>
            <ul className="m-0 list-none space-y-1 p-0 font-mono text-[0.85rem]">
              <li className="flex justify-between rounded bg-bg-code px-2 py-1">
                <span className="text-sky-strong">n</span>
                <span className="text-ink-dim">undefined</span>
              </li>
              <li className="flex justify-between rounded bg-bg-code px-2 py-1">
                <span className="text-sky-strong">square</span>
                <span className="text-amber-200">{"{ ...code }"}</span>
              </li>
              <li className="flex justify-between rounded bg-bg-code px-2 py-1">
                <span className="text-sky-strong">square2</span>
                <span className="text-ink-dim">undefined</span>
              </li>
            </ul>
            <p className="mb-0 mt-3 text-[0.82rem] text-ink-dim">
              Key → value pairs. Every variable and function gets a slot here <em>before</em> any
              code runs.
            </p>
          </div>
          <div className="p-4">
            <div className="mb-1 font-semibold text-emerald-200">Code component</div>
            <div className="mb-3 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim">
              Thread of execution
            </div>
            <ol className="m-0 list-none space-y-1 p-0 font-mono text-[0.85rem]">
              <li className="rounded bg-bg-code px-2 py-1 text-ink">n = 2;</li>
              <li className="rounded bg-bg-code px-2 py-1 text-ink-dim">function square … skip</li>
              <li className="rounded bg-bg-code px-2 py-1 text-ink">square2 = square(n);</li>
            </ol>
            <p className="mb-0 mt-3 text-[0.82rem] text-ink-dim">
              One line at a time, top to bottom. One thread, one thing at a time — this is the
              &ldquo;single-threaded&rdquo; part.
            </p>
          </div>
        </div>
      </div>
    </Figure>
  );
}
