import Link from "next/link";
import { LESSONS, lessonHref } from "@/lib/lessons";

const rowClass =
  "grid grid-cols-[3.2rem_1fr] sm:grid-cols-[4.2rem_1fr_auto] items-baseline gap-x-4 gap-y-1 border-b border-line px-4 py-4";

/** Table of contents for the series — the "first page of the book". */
export default function LessonToc({ current }: { current?: string }) {
  return (
    <ol className="m-0 list-none p-0">
      {LESSONS.map((lesson) => {
        const num = `Lesson ${String(lesson.number).padStart(2, "0")}`;
        const body = (
          <>
            <span className="font-mono text-[0.85rem] text-sky">{num}</span>
            <span className="font-semibold">
              {lesson.title}
              <small className="mt-0.5 block text-[0.9rem] font-normal text-ink-dim">
                {lesson.summary}
              </small>
            </span>
            <span className="col-start-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim sm:col-start-auto">
              {lesson.published ? lesson.readTime ?? "read" : "coming soon"}
            </span>
          </>
        );

        if (!lesson.published) {
          return (
            <li key={lesson.slug}>
              <div className={`${rowClass} text-ink-dim [&_.text-sky]:text-ink-dim`}>{body}</div>
            </li>
          );
        }

        const isCurrent = current === lesson.slug;
        return (
          <li key={lesson.slug}>
            <Link
              href={lessonHref(lesson)}
              aria-current={isCurrent ? "page" : undefined}
              className={`${rowClass} rounded-lg text-ink hover:bg-sky-soft hover:no-underline ${
                isCurrent ? "bg-sky-soft" : ""
              }`}
            >
              {body}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
