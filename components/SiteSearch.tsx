"use client";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { SearchItem } from "@/lib/search-index";

const MAX_RESULTS = 30;

/** Rank by where the words land: title beats body, an early hit beats a late one. */
function search(items: SearchItem[], query: string): SearchItem[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of items) {
    const title = item.title.toLowerCase();
    const text = item.text.toLowerCase();
    let score = 0;
    for (const w of words) {
      const t = title.indexOf(w);
      if (t === 0) score += 12;
      else if (t > 0) score += title[t - 1] === " " ? 9 : 6;
      else if (text.includes(w)) score += 2;
      else {
        score = 0;
        break;
      }
    }
    if (score) scored.push({ item, score: score + (item.kind === "Term" ? 0 : 1) });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS).map((s) => s.item);
}

/**
 * Search button for the header. Clicking it (or pressing "/" or Ctrl/⌘+K) opens a search
 * box in the middle of the screen that finds lessons, readings and glossary terms in every
 * series. The index is fetched from /search-index.json the first time the box opens.
 */
export default function SiteSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    trigger.current?.focus();
  }, []);

  // Global shortcuts: "/" (outside text fields) and Ctrl/⌘+K.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // On open: load the index once, focus the box, and stop the page behind from scrolling.
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || index || failed) return;
    let cancelled = false;
    fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: SearchItem[]) => !cancelled && setIndex(data))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [open, index, failed]);

  const results = useMemo(() => (index ? search(index, query) : []), [index, query]);

  useEffect(() => {
    list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (item: SearchItem | undefined) => {
    if (!item) return;
    close();
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" && results.length) {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length) {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    }
  };

  const hasQuery = query.trim().length > 0;

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search lessons and topics"
        aria-haspopup="dialog"
        title="Search ( / )"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-bg-elev text-ink-dim transition-colors hover:border-sky hover:text-sky"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="4.75" stroke="currentColor" strokeWidth="1.7" />
          <path d="m10.6 10.6 3.4 3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </button>

      {open &&
        createPortal(
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[14vh] backdrop-blur-sm max-sm:pt-[8vh]"
          onPointerDown={(e) => e.target === e.currentTarget && close()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            onKeyDown={onKeyDown}
            className="flex max-h-[70vh] w-full max-w-[600px] flex-col overflow-hidden rounded-2xl border border-line bg-bg-elev shadow-2xl shadow-black/60"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-ink-dim">
                <circle cx="7" cy="7" r="4.75" stroke="currentColor" strokeWidth="1.7" />
                <path d="m10.6 10.6 3.4 3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              <input
                ref={input}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                type="text"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls={listId}
                aria-activedescendant={results.length ? `${listId}-${active}` : undefined}
                aria-autocomplete="list"
                placeholder="Search lessons, topics, terms…"
                autoComplete="off"
                spellCheck={false}
                className="h-14 min-w-0 flex-1 bg-transparent text-[1rem] text-ink placeholder:text-ink-dim/70 focus:outline-none"
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[0.7rem] text-ink-dim max-sm:hidden">Esc</kbd>
            </div>

            <ul id={listId} ref={list} role="listbox" aria-label="Results" className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-2">
              {results.map((r, i) => (
                <li
                  key={`${r.href}-${r.title}`}
                  id={`${listId}-${i}`}
                  data-i={i}
                  role="option"
                  aria-selected={i === active}
                  onPointerMove={() => setActive(i)}
                  onClick={() => go(r)}
                  className={`cursor-pointer rounded-lg px-3 py-2.5 ${i === active ? "bg-sky-soft" : ""}`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-[0.95rem] font-medium text-ink">{r.title}</span>
                    <span className="shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-sky">{r.kind}</span>
                  </div>
                  <div className="mt-0.5 flex gap-2 text-[0.8rem] text-ink-dim">
                    <span className="shrink-0">{r.seriesTitle}</span>
                    {r.kind !== "Term" && <span className="min-w-0 truncate">· {r.text}</span>}
                  </div>
                </li>
              ))}
              {hasQuery && index && results.length === 0 && (
                <li className="px-3 py-6 text-center text-[0.9rem] text-ink-dim">No matches for “{query.trim()}”.</li>
              )}
              {failed && <li className="px-3 py-6 text-center text-[0.9rem] text-ink-dim">Couldn’t load the search index. Close and try again.</li>}
              {!hasQuery && !failed && (
                <li className="px-3 py-6 text-center text-[0.9rem] text-ink-dim">
                  Type to search every lesson, reading and glossary term — try “closure”, “VPC” or “sharding”.
                </li>
              )}
            </ul>
          </div>
        </div>,
        // Portal to <body>: the sticky header's backdrop-filter would otherwise make this
        // "fixed" layer cover only the header, so clicks outside the box never reached it.
        document.body,
      )}
    </>
  );
}
