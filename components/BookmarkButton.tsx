"use client";

import { usePathname, useRouter } from "next/navigation";
import { accountsEnabled } from "@/lib/firebase";
import { authErrorMessage } from "@/lib/accounts";
import { useAccount } from "@/components/auth/AuthProvider";
import { useBookmarks } from "@/components/auth/BookmarksProvider";
import { useToast } from "@/components/Toast";

const LESSON_PATH = /^\/([^/]+)\/lesson-\d+\/?$/;

/**
 * A bookmark button for lesson pages. Signed-in readers save or remove the lesson; visitors are sent to
 * sign in first and come straight back. It renders nothing on pages that are not lessons.
 */
export default function BookmarkButton() {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { status } = useAccount();
  const { has, toggle } = useBookmarks();
  const match = pathname.match(LESSON_PATH);
  if (!accountsEnabled || !match) return null;

  const path = pathname.replace(/\/$/, "");
  const saved = status === "ready" && has(path);

  async function click() {
    // Still asking Firebase who is signed in: do nothing yet, rather than treating the reader as signed out.
    if (status === "loading") return;
    if (status !== "ready") {
      toast("Sign in to save bookmarks.", "info");
      router.push(`/login?next=${encodeURIComponent(path)}`);
      return;
    }
    const title = document.querySelector("h1")?.textContent?.trim() || document.title;
    try {
      const nowSaved = await toggle({ path, title, series: match![1] });
      toast(nowSaved ? "Bookmark saved. See all of them on your Bookmarks page." : "Bookmark removed.", nowSaved ? "success" : "info");
    } catch (err) {
      toast(authErrorMessage(err), "error");
    }
  }

  return (
    <button
      type="button"
      onClick={click}
      aria-pressed={saved}
      aria-busy={status === "loading"}
      title={saved ? "Remove bookmark" : "Save this lesson"}
      className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[0.82rem] font-medium transition focus-visible:outline-2 focus-visible:outline-sky ${saved ? "border-sky bg-sky-soft text-sky" : "border-line bg-bg-elev text-ink-dim hover:border-sky hover:text-sky"}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
      </svg>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
