import type { ReactNode } from "react";

export type QA = { q: string; a: ReactNode };

/** Click-to-reveal questions. Try answering out loud before you open one. */
export default function InterviewQA({ items }: { items: QA[] }) {
  return (
    <div className="my-6 space-y-3">
      {items.map((item) => (
        <details key={item.q} className="group rounded-xl border border-line bg-bg-elev px-5 py-3 open:border-sky/50">
          <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden group-open:text-sky">
            <span className="mr-2 font-mono text-sky" aria-hidden="true">Q.</span>
            {item.q}
          </summary>
          <div className="mt-3 border-t border-line pt-3 text-[0.97rem]">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
