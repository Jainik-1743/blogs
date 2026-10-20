import Link from "next/link";
import type { SeriesInfo } from "@/lib/registry";

/** One series as a row: coloured marker, title, one-line summary and lesson count. */
export default function SeriesCard({ s }: { s: SeriesInfo }) {
  const published = s.lessons.filter((l) => l.published).length;
  return (
    <Link
      href={`/${s.slug}`}
      data-accent={s.accent}
      className="group flex items-start gap-4 border-b border-line py-4 text-ink hover:no-underline"
    >
      <span aria-hidden="true" className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-sky" />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-snug transition group-hover:text-sky">{s.title}</span>
        <span className="mt-0.5 line-clamp-2 block text-[0.88rem] text-ink-dim">{s.tagline}</span>
      </span>
      <span className="shrink-0 pt-0.5 text-[0.8rem] text-ink-dim">{published} lessons</span>
    </Link>
  );
}
