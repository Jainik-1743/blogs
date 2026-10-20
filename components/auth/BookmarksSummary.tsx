"use client";

import Link from "next/link";
import { useBookmarks } from "./BookmarksProvider";
import { SummarySkeleton } from "@/components/Skeleton";

/** A short card on the account page that points to the full Bookmarks page. */
export default function BookmarksSummary() {
  const { items, ready } = useBookmarks();
  return (
    <section aria-labelledby="bookmarks-summary" className="rounded-2xl border border-line bg-bg-elev p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="bookmarks-summary" className="m-0 text-[1.1rem] font-bold text-ink">Bookmarks</h2>
          {!ready ? (
            <SummarySkeleton />
          ) : (
            <p className="mt-1 mb-0 text-[0.88rem] text-ink-dim">
              {items.length === 0 ? "Nothing saved yet. Use Save under any lesson title." : `${items.length} saved ${items.length === 1 ? "lesson" : "lessons"}, grouped by topic.`}
            </p>
          )}
        </div>
        <Link href="/bookmarks" className="w-full rounded-lg border border-sky px-4 py-2.5 text-center text-[0.88rem] font-semibold text-sky hover:bg-sky-soft hover:no-underline sm:w-auto sm:py-2">View all →</Link>
      </div>
    </section>
  );
}
