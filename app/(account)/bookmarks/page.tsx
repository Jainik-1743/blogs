import type { Metadata } from "next";
import BookmarksView from "@/components/auth/BookmarksView";
import { SERIES_LIST, TOPIC_PAGES } from "@/lib/registry";

export const metadata: Metadata = { title: "Your bookmarks", robots: { index: false, follow: false } };

export default function BookmarksPage() {
  // Everything the page needs to group a saved lesson by topic, worked out once on the server:
  // the topic list, which topics each lesson belongs to (as positions in that list) and series names.
  const topics = TOPIC_PAGES.map((t) => ({ slug: t.def.slug, title: t.def.title }));
  const pathTopics: Record<string, number[]> = {};
  TOPIC_PAGES.forEach((t, i) => t.lessons.forEach((l) => (pathTopics[l.path] ??= []).push(i)));
  const seriesNames = Object.fromEntries(SERIES_LIST.map((s) => [s.slug, s.short]));
  return <BookmarksView topics={topics} pathTopics={pathTopics} seriesNames={seriesNames} />;
}
