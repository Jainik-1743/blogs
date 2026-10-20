import type { Metadata } from "next";
import NotesView from "@/components/auth/NotesView";
import { SERIES_LIST } from "@/lib/registry";

export const metadata: Metadata = { title: "Your notes", robots: { index: false, follow: false } };

export default function NotesPage() {
  const seriesNames = Object.fromEntries(SERIES_LIST.map((s) => [s.slug, s.short]));
  return <NotesView seriesNames={seriesNames} />;
}
