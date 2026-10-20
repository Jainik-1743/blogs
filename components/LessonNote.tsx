"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { accountsEnabled } from "@/lib/firebase";
import { authErrorMessage } from "@/lib/accounts";
import { MAX_NOTE_CHARS } from "@/lib/notes";
import { useAccount } from "@/components/auth/AuthProvider";
import { useNotes } from "@/components/auth/NotesProvider";
import { inputClass } from "@/components/auth/fields";
import { useToast } from "@/components/Toast";

/**
 * A private note under a lesson. Signed-in readers write and save it to their account; visitors see an invitation.
 * A note is saved only when the reader presses Save, so typing never causes a database write.
 */
export default function LessonNote({ path, title }: { path: string; title: string }) {
  const { status } = useAccount();
  const { ready, load, get, save, remove } = useNotes();
  const toast = useToast();
  const signedIn = status === "ready";
  const saved = signedIn ? get(path) : undefined;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const series = path.split("/")[1] ?? "";

  // Read the notes once the reader has a reason to see them (a few seconds on the lesson, or opening the box).
  useEffect(() => {
    if (!signedIn) return;
    const t = window.setTimeout(load, 3000);
    return () => window.clearTimeout(t);
  }, [signedIn, load, path]);

  useEffect(() => {
    setText(saved?.text ?? "");
  }, [saved?.text, path]);

  if (!accountsEnabled || status === "loading") return null;

  if (!signedIn) {
    return (
      <div className="mt-6 rounded-xl border border-line bg-bg-elev px-5 py-4" data-no-glossary>
        <p className="m-0 text-ink-dim"><strong className="text-ink">Add private notes.</strong> <Link href={`/login?next=${encodeURIComponent(path)}`}>Sign in</Link> to write notes under any lesson. Only you can see them.</p>
      </div>
    );
  }

  const dirty = text.trim() !== (saved?.text ?? "");

  async function onSave() {
    setBusy(true);
    try {
      await save({ path, title, series, text });
      toast(text.trim() ? "Note saved." : "Note removed.");
    } catch (err) {
      toast((err as { code?: string }).code === "notes/limit" ? "You have reached the limit of 200 notes. Delete an old one first." : authErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    setBusy(true);
    try {
      await remove(path);
      setText("");
      toast("Note deleted.", "info");
    } catch (err) {
      toast(authErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="note-title" className="mt-6 rounded-xl border border-line bg-bg-elev px-5 py-4" data-no-glossary>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="note-title" className="m-0 text-[1rem] font-semibold text-ink">Your note {saved && <span className="ml-1 text-[0.78rem] font-normal text-sky">Saved</span>}</h2>
        {!open && !saved && (
          <button type="button" onClick={() => { setOpen(true); load(); }} className="rounded-lg border border-sky px-4 py-2 text-[0.88rem] font-semibold text-sky transition hover:bg-sky-soft">Add a note</button>
        )}
      </div>
      {(open || saved) && (
        <div className="mt-3">
          <label htmlFor="lesson-note" className="sr-only">Private note for this lesson</label>
          <textarea
            id="lesson-note" rows={5} maxLength={MAX_NOTE_CHARS} value={text} disabled={busy || (!ready && !open)}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && dirty && !busy) void onSave(); }}
            placeholder="Write what you want to remember. Only you can see this."
            className={`${inputClass} resize-y leading-relaxed`}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={onSave} disabled={busy || !dirty} className="rounded-lg bg-sky px-4 py-2 text-[0.88rem] font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Saving…" : "Save note"}</button>
            {saved && <button type="button" onClick={onDelete} disabled={busy} className="rounded-lg border border-line px-4 py-2 text-[0.88rem] font-semibold text-ink-dim transition hover:border-[#f87171]/60 hover:text-[#f87171] disabled:opacity-50">Delete</button>}
            <span className="ml-auto text-[0.78rem] text-ink-dim">{dirty ? "Not saved yet · " : ""}{text.length}/{MAX_NOTE_CHARS}</span>
          </div>
          <p className="m-0 mt-2 text-[0.8rem] text-ink-dim">All your notes are on the <Link href="/notes">Notes page</Link>.</p>
        </div>
      )}
    </section>
  );
}
