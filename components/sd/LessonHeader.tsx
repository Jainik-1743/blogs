import Link from "next/link";
import { partOf, SD_SERIES, type SdLesson } from "@/lib/system-design";

/** Breadcrumb, title block and "On this page" index shared by every System Design lesson. */
export default function LessonHeader({
  lesson,
  outline,
}: {
  lesson: SdLesson;
  outline: { id: string; label: string }[];
}) {
  const part = partOf(lesson.number);
  const num = String(lesson.number).padStart(2, "0");

  return (
    <>
      <header className="mb-8 border-b border-line pb-6">
        <nav className="mb-4 font-mono text-[0.8rem] text-ink-dim" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-sky">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/${SD_SERIES.slug}`} className="hover:text-sky">
            System Design
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/${SD_SERIES.slug}#part-${part.number}`} className="hover:text-sky">
            Part {part.number}
          </Link>
          <span className="mx-2">/</span>
          <span>Lesson {num}</span>
        </nav>
        <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">
          Part {part.number} · {part.title}
        </p>
        <h1 className="mb-2 text-[2.4rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[2rem]">
          {lesson.title}
        </h1>
        <p className="max-w-[60ch] text-[1.15rem] text-ink-dim">{lesson.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[0.72rem]">
          <span className="rounded-full border border-sky/40 bg-sky-soft px-2.5 py-0.5 text-sky">Lesson {num}</span>
          {lesson.readTime ? (
            <span className="rounded-full border border-line px-2.5 py-0.5 text-ink-dim">{lesson.readTime} read</span>
          ) : null}
          {lesson.level ? (
            <span className="rounded-full border border-line px-2.5 py-0.5 text-ink-dim">{lesson.level}</span>
          ) : null}
          {lesson.tags.map((t) => (
            <span key={t} className="rounded-full border border-line px-2.5 py-0.5 text-ink-dim">
              #{t}
            </span>
          ))}
        </div>
      </header>

      <section className="mb-10 rounded-xl border border-line bg-bg-elev px-6 py-5" aria-labelledby="on-this-page">
        <h2 id="on-this-page" className="mb-2 text-[1.1rem] font-semibold text-sky">
          On this page
        </h2>
        <ol className="m-0 list-decimal pl-5 marker:text-sky sm:columns-2 sm:gap-8">
          {outline.map((item) => (
            <li key={item.id} className="my-1 break-inside-avoid">
              <a href={`#${item.id}`} className="text-ink hover:text-sky">
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
