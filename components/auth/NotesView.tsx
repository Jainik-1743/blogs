"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page/PageHeader";
import { authErrorMessage } from "@/lib/accounts";
import { useToast } from "@/components/Toast";
import { useAccount } from "./AuthProvider";
import { useNotes } from "./NotesProvider";
import { Notice, inputClass } from "./fields";
import { BookmarkRowsSkeleton, BookmarksSkeleton } from "@/components/Skeleton";

const date = (at: number) => new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Every note the reader has written, newest first, with a link back to the lesson. */
export default function NotesView({ seriesNames }: { seriesNames: Record<string, string> }) {
  const { enabled, status } = useAccount();
  const { items, ready, load, remove } = useNotes();
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (status === "out") router.replace("/login?next=/notes");
    if (status === "unverified") router.replace("/verify-email?next=/notes");
    if (status === "ready") load();
  }, [status, router, load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((n) => `${n.title} ${n.text}`.toLowerCase().includes(q)) : items;
  }, [items, query]);

  async function onDelete(path: string) {
    setBusy(path);
    try {
      await remove(path);
      toast("Note deleted.", "info");
    } catch (err) {
      toast(authErrorMessage(err), "error");
    } finally {
      setBusy(null);
    }
  }

  if (!enabled) return <Notice tone="info">Accounts are not set up on this copy of the site yet.</Notice>;
  if (status !== "ready") return <BookmarksSkeleton />;

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Notes" }]}
        eyebrow="Your library"
        title="Notes"
        summary="Private notes you wrote under lessons. Only you can see them. Add one with Add a note at the end of any lesson."
        meta={[{ label: "Notes", value: String(items.length) }, { label: "Latest", value: items[0] ? date(items[0].at) : "None yet" }]}
      />

      {!ready ? (
        <BookmarkRowsSkeleton />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-line bg-bg-elev p-8 text-center">
          <h2 className="m-0 text-[1.3rem] font-bold text-ink">No notes yet</h2>
          <p className="mx-auto mt-2 mb-5 max-w-[46ch] text-ink-dim">Open any lesson, scroll to the end and choose <strong className="text-ink">Add a note</strong>. Your notes show up here on every device you sign in on.</p>
          <Link href="/roadmap" className="inline-block rounded-lg bg-sky px-5 py-2.5 font-semibold text-bg hover:no-underline hover:brightness-110">Open the roadmap</Link>
        </div>
      ) : (
        <>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your notes" aria-label="Search your notes" className={`${inputClass} mb-8 max-w-md`} />
          {visible.length === 0 ? (
            <p className="text-ink-dim">No notes match. <button type="button" onClick={() => setQuery("")} className="text-sky hover:underline">Clear the search</button></p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {visible.map((n) => (
                <li key={n.path} className="m-0 rounded-2xl border border-line bg-bg-elev p-5">
                  <Link href={n.path} className="font-semibold leading-snug text-ink hover:text-sky hover:no-underline">{n.title}</Link>
                  <p className="m-0 mt-0.5 text-[0.82rem] text-ink-dim">{seriesNames[n.series] ?? n.series} · {date(n.at)}</p>
                  <p className="mt-3 mb-0 whitespace-pre-wrap break-words text-ink">{n.text}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`${n.path}#note-title`} className="rounded-lg border border-sky px-3.5 py-1.5 text-[0.82rem] font-semibold text-sky hover:bg-sky-soft hover:no-underline">Edit in lesson</Link>
                    <button type="button" disabled={busy === n.path} onClick={() => void onDelete(n.path)} aria-label={`Delete the note on ${n.title}`} className="rounded-lg border border-line px-3.5 py-1.5 text-[0.82rem] font-semibold text-ink-dim transition hover:border-[#f87171]/60 hover:text-[#f87171] disabled:opacity-50">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
