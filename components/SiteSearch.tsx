"use client";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { SearchItem, SearchKind } from "@/lib/search-index";

type Filter = "all" | "lesson" | "question" | "term" | "guide";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "lesson", label: "Lessons" },
  { id: "question", label: "Questions" },
  { id: "term", label: "Terms" },
  { id: "guide", label: "Guides" },
];

/** Result groups in display order. Readings sit with lessons. */
const GROUPS: { id: Exclude<Filter, "all">; title: string; kinds: SearchKind[]; preview: number }[] = [
  { id: "lesson", title: "Lessons", kinds: ["Lesson", "Reading"], preview: 6 },
  { id: "guide", title: "Guides", kinds: ["Guide"], preview: 3 },
  { id: "question", title: "Interview questions", kinds: ["Question"], preview: 5 },
  { id: "term", title: "Glossary terms", kinds: ["Term"], preview: 4 },
];

const MAX_FILTERED = 40;
const RECENT_KEY = "blogs:recent-search";
const RECENT_MAX = 5;

const QUICK_LINKS: SearchItem[] = [
  { kind: "Page", series: "guides", seriesTitle: "blogs", title: "All study guides", text: "A reading order for each goal", href: "/guides" },
  { kind: "Page", series: "glossaries", seriesTitle: "blogs", title: "All glossaries", text: "Every term, by series", href: "/glossaries" },
  { kind: "Page", series: "home", seriesTitle: "blogs", title: "Browse every series", text: "The home page", href: "/" },
];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Rank by where the words land: title beats body, an early hit beats a late one. */
function score(item: SearchItem, words: string[]): number {
  const title = item.title.toLowerCase();
  const text = item.text.toLowerCase();
  let total = 0;
  for (const w of words) {
    const t = title.indexOf(w);
    if (t === 0) total += 12;
    else if (t > 0) total += title[t - 1] === " " ? 9 : 6;
    else if (text.includes(w)) total += 2;
    else return 0;
  }
  // A title that is exactly the query, or starts with it, goes first.
  const q = words.join(" ");
  if (title === q) total += 20;
  else if (title.startsWith(q)) total += 6;
  // Lessons and guides before questions and terms when the match is equal.
  return total + (item.kind === "Lesson" || item.kind === "Guide" ? 1 : 0);
}

function search(items: SearchItem[], query: string, filter: Filter): { group: (typeof GROUPS)[number]; items: SearchItem[]; total: number }[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const buckets = new Map<string, { item: SearchItem; s: number }[]>(GROUPS.map((g) => [g.id, []]));
  for (const item of items) {
    const g = GROUPS.find((x) => x.kinds.includes(item.kind));
    if (!g || (filter !== "all" && g.id !== filter)) continue;
    const s = score(item, words);
    if (s) buckets.get(g.id)!.push({ item, s });
  }
  return GROUPS.map((group) => {
    const all = (buckets.get(group.id) ?? []).sort((a, b) => b.s - a.s);
    return { group, items: all.slice(0, filter === "all" ? group.preview : MAX_FILTERED).map((x) => x.item), total: all.length };
  }).filter((g) => g.items.length);
}

/** Wraps each matched word in <mark>, so you can see why a result matched. */
function Highlight({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  const re = new RegExp(`(${words.map(escapeRe).join("|")})`, "ig");
  const lower = new Set(words);
  return (
    <>
      {text.split(re).map((part, i) =>
        lower.has(part.toLowerCase()) ? (
          <mark key={i} className="rounded-sm bg-sky-soft px-0.5 text-sky-strong">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function readRecent(): SearchItem[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? (v as SearchItem[]).filter((x) => x && typeof x.href === "string" && typeof x.title === "string").slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function rememberRecent(item: SearchItem) {
  try {
    const keep = readRecent().filter((x) => x.href !== item.href);
    // Store the small fields only; the rest is rebuilt when the index loads.
    const slim = { kind: item.kind, series: item.series, seriesTitle: item.seriesTitle, title: item.title, text: item.text.slice(0, 80), href: item.href };
    localStorage.setItem(RECENT_KEY, JSON.stringify([slim, ...keep].slice(0, RECENT_MAX)));
  } catch {
    // Storage blocked: recents just won't be remembered.
  }
}

const KIND_LABEL: Record<SearchKind, string> = { Lesson: "Lesson", Reading: "Reading", Term: "Term", Question: "Question", Guide: "Guide", Page: "Page" };

/**
 * Search for the header: click the icon, press "/" or press Ctrl/⌘+K. It finds lessons, interview
 * questions, glossary terms and study guides across every series, grouped by type, with the
 * matching words highlighted. Empty, it shows your recent picks and a few quick links.
 * The index is fetched from /search-index.json the first time the box opens.
 */
export default function SiteSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [recent, setRecent] = useState<SearchItem[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    setFilter("all");
    trigger.current?.focus();
  }, []);

  // Global shortcuts: "/" (outside text fields) and Ctrl/⌘+K, which also closes the box when it is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // On open: focus the box, read recents, and stop the page behind from scrolling.
  useEffect(() => {
    if (!open) return;
    setRecent(readRecent());
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

  const words = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean), [query]);
  const groups = useMemo(() => (index ? search(index, query, filter) : []), [index, query, filter]);
  const hasQuery = words.length > 0;

  // One flat list drives the keyboard: results when searching, recents + quick links when empty.
  const flat = useMemo<SearchItem[]>(() => (hasQuery ? groups.flatMap((g) => g.items) : [...recent, ...QUICK_LINKS]), [hasQuery, groups, recent]);

  useEffect(() => {
    list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (item: SearchItem | undefined) => {
    if (!item) return;
    if (hasQuery) rememberRecent(item);
    close();
    router.push(item.href);
  };

  const cycleFilter = (dir: 1 | -1) => {
    const i = FILTERS.findIndex((f) => f.id === filter);
    setFilter(FILTERS[(i + dir + FILTERS.length) % FILTERS.length].id);
    setActive(0);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      e.preventDefault();
      cycleFilter(e.shiftKey ? -1 : 1);
    } else if (e.key === "ArrowDown" && flat.length) {
      e.preventDefault();
      setActive((a) => (a + 1) % flat.length);
    } else if (e.key === "ArrowUp" && flat.length) {
      e.preventDefault();
      setActive((a) => (a - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[active]);
    }
  };

  const row = (r: SearchItem, i: number) => (
    <li
      key={`${r.href}-${r.title}`}
      id={`${listId}-${i}`}
      data-i={i}
      role="option"
      aria-selected={i === active}
      onPointerMove={() => setActive(i)}
      onClick={() => go(r)}
      className={`cursor-pointer rounded-lg px-3 py-2 ${i === active ? "bg-sky-soft" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[0.95rem] font-medium text-ink">
          <Highlight text={r.title} words={hasQuery ? words : []} />
        </span>
        <span className="shrink-0 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-sky">{KIND_LABEL[r.kind]}</span>
      </div>
      <div className="mt-0.5 flex gap-2 text-[0.8rem] text-ink-dim">
        <span className="shrink-0">{r.seriesTitle}</span>
        {r.kind !== "Term" && r.text ? <span className="min-w-0 truncate">· {r.text}</span> : null}
      </div>
    </li>
  );

  // Running index across groups, so each row knows its place in the flat list.
  let n = 0;

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search lessons, questions and terms"
        aria-haspopup="dialog"
        title="Search ( Ctrl K or / )"
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
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm max-sm:pt-[6vh]"
            onPointerDown={(e) => e.target === e.currentTarget && close()}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              onKeyDown={onKeyDown}
              className="flex max-h-[76vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-line bg-bg-elev shadow-2xl shadow-black/60"
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
                  aria-expanded={flat.length > 0}
                  aria-controls={listId}
                  aria-activedescendant={flat.length ? `${listId}-${active}` : undefined}
                  aria-autocomplete="list"
                  placeholder="Search lessons, questions, terms…"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-14 min-w-0 flex-1 bg-transparent text-[1rem] text-ink placeholder:text-ink-dim/70 focus:outline-none"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setActive(0);
                      input.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink-dim hover:text-sky"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : null}
                <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[0.7rem] text-ink-dim max-sm:hidden">Esc</kbd>
              </div>

              <div role="group" aria-label="Filter results" className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-line px-3 py-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    tabIndex={-1}
                    onClick={() => {
                      setFilter(f.id);
                      setActive(0);
                      input.current?.focus();
                    }}
                    aria-pressed={filter === f.id}
                    className={`shrink-0 rounded-full border px-3 py-1 text-[0.78rem] transition-colors ${
                      filter === f.id ? "border-sky bg-sky-soft text-sky" : "border-line text-ink-dim hover:border-sky hover:text-sky"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <ul id={listId} ref={list} role="listbox" aria-label="Results" className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-2">
                {hasQuery &&
                  groups.map((g) => (
                    <Fragment key={g.group.id}>
                      <li role="presentation" className="flex items-baseline justify-between px-3 pt-2 pb-1 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-ink-dim">
                        <span>{g.group.title}</span>
                        {filter === "all" && g.total > g.items.length ? (
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => {
                              setFilter(g.group.id);
                              setActive(0);
                              input.current?.focus();
                            }}
                            className="normal-case tracking-normal text-sky hover:underline"
                          >
                            Show all {g.total}
                          </button>
                        ) : null}
                      </li>
                      {g.items.map((r) => row(r, n++))}
                    </Fragment>
                  ))}

                {hasQuery && index && groups.length === 0 && (
                  <li role="presentation" className="px-3 py-6 text-center text-[0.9rem] text-ink-dim">
                    No matches for “{query.trim()}”{filter !== "all" ? " in this filter" : ""}.
                    {filter !== "all" ? (
                      <>
                        {" "}
                        <button type="button" tabIndex={-1} onClick={() => setFilter("all")} className="text-sky hover:underline">
                          Search everything
                        </button>
                      </>
                    ) : null}
                  </li>
                )}
                {hasQuery && !index && !failed && (
                  <li role="presentation" className="px-3 py-6 text-center text-[0.9rem] text-ink-dim">
                    Loading…
                  </li>
                )}
                {failed && (
                  <li role="presentation" className="px-3 py-6 text-center text-[0.9rem] text-ink-dim">
                    Couldn’t load the search index. Close and try again.
                  </li>
                )}

                {!hasQuery && !failed && (
                  <>
                    {recent.length ? (
                      <>
                        <li role="presentation" className="px-3 pt-2 pb-1 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-ink-dim">
                          Recent
                        </li>
                        {recent.map((r) => row(r, n++))}
                      </>
                    ) : null}
                    <li role="presentation" className="px-3 pt-2 pb-1 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-ink-dim">
                      Quick links
                    </li>
                    {QUICK_LINKS.map((r) => row(r, n++))}
                    <li role="presentation" className="px-3 pt-3 pb-1 text-[0.82rem] text-ink-dim">
                      Try “closure”, “VPC”, “sharding” or “what is idempotency”.
                    </li>
                  </>
                )}
              </ul>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-4 py-2 font-mono text-[0.68rem] text-ink-dim max-sm:hidden">
                <span>
                  <kbd className="rounded border border-line px-1">↑</kbd> <kbd className="rounded border border-line px-1">↓</kbd> move
                </span>
                <span>
                  <kbd className="rounded border border-line px-1">↵</kbd> open
                </span>
                <span>
                  <kbd className="rounded border border-line px-1">Tab</kbd> change filter
                </span>
                <span className="ml-auto">
                  <kbd className="rounded border border-line px-1">Ctrl</kbd> <kbd className="rounded border border-line px-1">K</kbd> toggle
                </span>
              </div>
            </div>
          </div>,
          // Portal to <body>: the sticky header's backdrop-filter would otherwise make this
          // "fixed" layer cover only the header, so clicks outside the box never reached it.
          document.body,
        )}
    </>
  );
}
