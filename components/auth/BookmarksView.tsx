"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page/PageHeader";
import { authErrorMessage } from "@/lib/accounts";
import { useToast } from "@/components/Toast";
import { useAccount } from "./AuthProvider";
import { useBookmarks, type Bookmark } from "./BookmarksProvider";
import { Notice, inputClass } from "./fields";

type Topic = { slug: string; title: string };

const date = (at: number) => new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const OTHER = -1;

/**
 * The reader's saved lessons on their own page, grouped by topic. Each lesson sits under its first topic;
 * the chips filter by any topic a lesson belongs to. Lessons with no topic go under "Other lessons".
 */
export default function BookmarksView({ topics, pathTopics, seriesNames }: { topics: Topic[]; pathTopics: Record<string, number[]>; seriesNames: Record<string, string> }) {
  const { enabled, status } = useAccount();
  const { items, ready, toggle } = useBookmarks();
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<number | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (status === "out") router.replace("/login?next=/bookmarks");
  }, [status, router]);

  const topicsOf = (b: Bookmark) => pathTopics[b.path] ?? [];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((b) => {
      if (q && !`${b.title} ${seriesNames[b.series] ?? b.series}`.toLowerCase().includes(q)) return false;
      if (filter === "all") return true;
      return filter === OTHER ? topicsOf(b).length === 0 : topicsOf(b).includes(filter);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query, filter, seriesNames, pathTopics]);

  /** Bookmarks per topic (a lesson counts for every topic it has), for the chips. */
  const counts = useMemo(() => {
    const c = new Map<number, number>();
    for (const b of items) {
      const t = pathTopics[b.path] ?? [];
      if (t.length === 0) c.set(OTHER, (c.get(OTHER) ?? 0) + 1);
      for (const i of t) c.set(i, (c.get(i) ?? 0) + 1);
    }
    return c;
  }, [items, pathTopics]);

  /** Groups for display. In the "all" view a lesson sits under its first topic only; in a filtered view, one group. */
  const groups = useMemo(() => {
    const map = new Map<number, Bookmark[]>();
    for (const b of visible) {
      const key = filter === "all" ? (topicsOf(b)[0] ?? OTHER) : filter;
      map.set(key, [...(map.get(key) ?? []), b]);
    }
    return Array.from(map, ([key, list]) => ({ key, title: key === OTHER ? "Other lessons" : topics[key].title, slug: key === OTHER ? "" : topics[key].slug, list }))
      .sort((a, b) => (a.key === OTHER ? 1 : b.key === OTHER ? -1 : b.list.length - a.list.length || a.title.localeCompare(b.title)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, filter, topics, pathTopics]);

  async function remove(b: Bookmark) {
    try {
      await toggle({ path: b.path, title: b.title, series: b.series });
      toast("Bookmark removed.", "info");
    } catch (err) {
      toast(authErrorMessage(err), "error");
    }
  }

  if (!enabled) return <Notice tone="info">Accounts are not set up on this copy of the site yet.</Notice>;
  if (status === "loading" || status === "out") return <p className="text-ink-dim">Loading your bookmarks…</p>;

  const topicCount = new Set(items.flatMap((b) => topicsOf(b).slice(0, 1))).size;
  const seriesCount = new Set(items.map((b) => b.series)).size;

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Bookmarks" }]}
        eyebrow="Your library"
        title="Bookmarks"
        summary="Lessons you saved to come back to, grouped by topic. Save any lesson with the Save button under its title."
        meta={[
          { label: "Saved", value: String(items.length) },
          { label: "Topics", value: String(topicCount) },
          { label: "Series", value: String(seriesCount) },
          { label: "Latest", value: items[0] ? date(items[0].at) : "None yet" },
        ]}
      />

      {!ready ? (
        <p className="text-ink-dim">Loading your bookmarks…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-line bg-bg-elev p-8 text-center">
          <h2 className="m-0 text-[1.3rem] font-bold text-ink">Nothing saved yet</h2>
          <p className="mx-auto mt-2 mb-5 max-w-[46ch] text-ink-dim">Open any lesson and click <strong className="text-ink">Save</strong> under its title. It shows up here, sorted by topic, on every device you sign in on.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/roadmap" className="rounded-lg bg-sky px-5 py-2.5 font-semibold text-bg hover:no-underline hover:brightness-110">Open the roadmap</Link>
            <Link href="/topics" className="rounded-lg border border-line px-5 py-2.5 font-semibold text-ink hover:border-sky hover:text-sky hover:no-underline">Browse topics</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-col gap-4">
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your bookmarks" aria-label="Search your bookmarks" className={`${inputClass} max-w-md`} />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
              <Chip active={filter === "all"} onClick={() => setFilter("all")}>All <span className="opacity-70">{items.length}</span></Chip>
              {topics.map((t, i) => counts.get(i) ? <Chip key={t.slug} active={filter === i} onClick={() => setFilter(i)}>{t.title} <span className="opacity-70">{counts.get(i)}</span></Chip> : null)}
              {counts.get(OTHER) ? <Chip active={filter === OTHER} onClick={() => setFilter(OTHER)}>Other <span className="opacity-70">{counts.get(OTHER)}</span></Chip> : null}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="text-ink-dim">No bookmarks match. <button type="button" onClick={() => { setQuery(""); setFilter("all"); }} className="text-sky hover:underline">Clear the filters</button></p>
          ) : (
            <div className="flex flex-col gap-10">
              {groups.map((g) => (
                <section key={g.key} aria-labelledby={`g-${g.key}`}>
                  <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                    <h2 id={`g-${g.key}`} className="m-0 text-[1.3rem] font-bold tracking-tight text-ink">{g.title}</h2>
                    <span className="flex shrink-0 items-center gap-4 text-[0.85rem] text-ink-dim">
                      {g.list.length} {g.list.length === 1 ? "lesson" : "lessons"}
                      {g.slug && <Link href={`/topics/${g.slug}`} className="font-semibold">All {g.title} lessons →</Link>}
                    </span>
                  </div>
                  <ul className="m-0 list-none p-0">
                    {g.list.map((b) => (
                      <li key={b.path} className="m-0 flex items-center justify-between gap-4 border-b border-line py-3.5">
                        <Link href={b.path} className="group min-w-0 flex-1 text-ink hover:no-underline">
                          <span className="block font-semibold leading-snug transition group-hover:text-sky">{b.title}</span>
                          <span className="block text-[0.82rem] text-ink-dim">{seriesNames[b.series] ?? b.series} · saved {date(b.at)}</span>
                        </Link>
                        <button type="button" onClick={() => void remove(b)} aria-label={`Remove bookmark: ${b.title}`} className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-[0.8rem] font-semibold text-ink-dim transition hover:border-[#f87171]/60 hover:text-[#f87171]">Remove</button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-md border px-3.5 py-1.5 text-[0.85rem] font-medium transition ${active ? "border-sky bg-sky-soft text-sky" : "border-line text-ink-dim hover:border-sky hover:text-sky"}`}>
      {children}
    </button>
  );
}
