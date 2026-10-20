"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useReview } from "./ReviewProvider";
import { SummarySkeleton } from "@/components/Skeleton";

/** A short card on the account page that shows how many review questions are due. */
export default function ReviewSummary() {
  const { items, due, ready, load } = useReview();
  useEffect(() => load(), [load]);
  return (
    <section aria-labelledby="review-summary" className="rounded-2xl border border-line bg-bg-elev p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="review-summary" className="m-0 text-[1.1rem] font-bold text-ink">Daily review</h2>
          {!ready ? (
            <SummarySkeleton />
          ) : (
            <p className="mt-1 mb-0 text-[0.88rem] text-ink-dim">
              {items.length === 0 ? "Take a Quick check at the end of a lesson. Questions you miss come back here." : due.length > 0 ? `${due.length} ${due.length === 1 ? "question is" : "questions are"} due today.` : "Nothing is due today."}
            </p>
          )}
        </div>
        <Link href="/review" className="w-full rounded-lg border border-sky px-4 py-2.5 text-center text-[0.88rem] font-semibold text-sky hover:bg-sky-soft hover:no-underline sm:w-auto sm:py-2">{due.length > 0 ? "Start review →" : "Open →"}</Link>
      </div>
    </section>
  );
}
