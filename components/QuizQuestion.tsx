"use client";

import type { Question } from "@/lib/quiz";

/** One multiple-choice question. Used by the lesson quiz and the review page. */
export default function QuestionCard({
  index, question, picked, checked, onPick, name,
}: { index?: number; question: Question; picked: number | null; checked: boolean; onPick: (i: number) => void; name: string }) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-2 text-[1rem] font-semibold leading-snug text-ink">{index !== undefined && <span className="mr-2 text-sky">{index + 1}.</span>}{question.q}</legend>
      {question.code && <pre className="my-2 overflow-x-auto rounded-lg border border-line bg-bg p-3 text-[0.85rem]"><code>{question.code}</code></pre>}
      <div className="flex flex-col gap-2">
        {question.options.map((o, i) => {
          const right = checked && i === question.answer;
          const wrong = checked && picked === i && i !== question.answer;
          return (
            <label key={i} className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-2.5 text-[0.92rem] transition ${right ? "border-sky bg-sky-soft text-ink" : wrong ? "border-[#f87171]/60 bg-[#f87171]/10 text-ink" : picked === i ? "border-sky text-ink" : "border-line text-ink hover:border-sky"} ${checked ? "cursor-default" : ""}`}>
              <input type="radio" name={name} checked={picked === i} disabled={checked} onChange={() => onPick(i)} className="mt-1 accent-[var(--color-sky,#38bdf8)]" />
              <span className="min-w-0 break-words">{o}{right && <span className="ml-2 font-semibold text-sky">✓ Correct</span>}{wrong && <span className="ml-2 font-semibold text-[#f87171]">✗ Not this one</span>}</span>
            </label>
          );
        })}
      </div>
      {checked && <p className="mt-2 mb-0 text-[0.88rem] text-ink-dim"><strong className="text-ink">Why: </strong>{question.why}</p>}
    </fieldset>
  );
}
