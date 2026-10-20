"use client";

import Link from "next/link";
import { authErrorMessage } from "@/lib/accounts";
import { useToast } from "@/components/Toast";
import { useBookmarks } from "./BookmarksProvider";

const date = (at: number) => new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** The reader's saved lessons, newest first, with a button to remove each one. */
export default function BookmarksPanel({ seriesNames }: { seriesNames: Record<string, string> }) {
  const { items, ready, toggle } = useBookmarks();
  const toast = useToast();

  async function remove(b: (typeof items)[number]) {
    try {
      await toggle({ path: b.path, title: b.title, series: b.series });
      toast("Bookmark removed.", "info");
    } catch (err) {
      toast(authErrorMessage(err), "error");
    }
  }

  return (
    <section id="bookmarks" aria-labelledby="bookmarks-title" className="scroll-mt-24 rounded-3xl border border-line bg-bg-elev p-6 sm:p-9">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="bookmarks-title" className="m-0 text-[1.4rem] font-bold tracking-tight text-ink">Bookmarks</h2>
        {ready && items.length > 0 && <span className="text-[0.85rem] text-ink-dim">{items.length} saved</span>}
      </div>

      {!ready ? (
        <p className="mt-4 mb-0 text-ink-dim">Loading your bookmarks…</p>
      ) : items.length === 0 ? (
        <p className="mt-3 mb-0 max-w-[60ch] text-ink-dim">
          Nothing saved yet. Open any lesson and click <strong className="text-ink">Save</strong> under its title. Your bookmarks appear here on every device you sign in on.
        </p>
      ) : (
        <ul className="m-0 mt-5 list-none border-t border-line p-0">
          {items.map((b) => (
            <li key={b.path} className="m-0 flex items-center justify-between gap-4 border-b border-line py-3.5">
              <Link href={b.path} className="group min-w-0 flex-1 text-ink hover:no-underline">
                <span className="block truncate font-semibold transition group-hover:text-sky">{b.title}</span>
                <span className="block text-[0.82rem] text-ink-dim">{seriesNames[b.series] ?? b.series} · saved {date(b.at)}</span>
              </Link>
              <button type="button" onClick={() => void remove(b)} aria-label={`Remove bookmark: ${b.title}`} className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-[0.8rem] font-semibold text-ink-dim transition hover:border-[#f87171]/60 hover:text-[#f87171]">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
