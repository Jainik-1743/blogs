import Link from "next/link";
import { LESSONS, lessonHref, SERIES, type Lesson } from "@/lib/lessons";

const box = "block rounded-xl border border-line px-5 py-4";
const dir = "font-mono text-[0.75rem] uppercase tracking-[0.1em]";

type Props = {
  slug: string;
  /** Lessons of the series this page belongs to; defaults to the DevOps series. */
  lessons?: Lesson[];
  href?: (lesson: Lesson) => string;
  series?: { slug: string; title: string };
};

export default function LessonPager({
  slug,
  lessons = LESSONS,
  href = lessonHref,
  series = SERIES,
}: Props) {
  const i = lessons.findIndex((l) => l.slug === slug);
  const prev = i === -1 ? undefined : lessons[i - 1];
  const next = i === -1 ? undefined : lessons[i + 1];

  return (
    <nav className="mt-14 grid grid-cols-1 gap-4 border-t border-line pt-8 sm:grid-cols-2" aria-label="Lesson navigation">
      {prev ? (
        <Link href={href(prev)} className={`${box} text-ink hover:border-sky hover:bg-sky-soft hover:no-underline`}>
          <div className={`${dir} text-sky`}>← Previous</div>
          <div className="font-semibold">Lesson {prev.number}: {prev.title}</div>
        </Link>
      ) : (
        <Link href={`/${series.slug}`} className={`${box} text-ink hover:border-sky hover:bg-sky-soft hover:no-underline`}>
          <div className={`${dir} text-sky`}>← Series index</div>
          <div className="font-semibold">{series.title}</div>
        </Link>
      )}

      {next?.published ? (
        <Link href={href(next)} className={`${box} text-right text-ink hover:border-sky hover:bg-sky-soft hover:no-underline sm:text-right`}>
          <div className={`${dir} text-sky`}>Next →</div>
          <div className="font-semibold">Lesson {next.number}: {next.title}</div>
        </Link>
      ) : next ? (
        <div className={`${box} text-ink-dim sm:text-right`}>
          <div className={`${dir} text-ink-dim`}>Next · coming soon</div>
          <div className="font-semibold">Lesson {next.number}: {next.title}</div>
        </div>
      ) : null}
    </nav>
  );
}
