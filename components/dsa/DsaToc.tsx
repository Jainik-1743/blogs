import Link from "next/link";
import { dsaLessonHref, type DsaLesson } from "@/lib/dsa";

const rowClass = "grid grid-cols-[3.2rem_1fr] sm:grid-cols-[4.2rem_1fr_auto] items-baseline gap-x-4 gap-y-1 border-b border-line px-4 py-4";

/**
 * The DSA table of contents. Like the other series' contents, plus the list of subtopics
 * each lesson covers, so the whole syllabus is visible before a lesson is written.
 */
export default function DsaToc({ lessons }: { lessons: DsaLesson[] }) {
  return (
    <ol className="m-0 list-none p-0">
      {lessons.map((lesson) => {
        const body = (
          <>
            <span className="font-mono text-[0.85rem] text-sky">Lesson {String(lesson.number).padStart(2, "0")}</span>
            <span className="font-semibold">
              {lesson.title}
              <small className="mt-0.5 block text-[0.9rem] font-normal text-ink-dim">{lesson.summary}</small>
              <small className="mt-1.5 block text-[0.8rem] font-normal leading-relaxed text-ink-dim/90">
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-sky/80">Topics · </span>
                {lesson.topics.join(" · ")}
              </small>
              {lesson.leetcode.length > 0 ? (
                <small className="mt-1 block font-mono text-[0.7rem] font-normal text-ink-dim/80">
                  {lesson.leetcode.length} LeetCode problem{lesson.leetcode.length > 1 ? "s" : ""} to practise
                </small>
              ) : null}
            </span>
            <span className="col-start-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-dim sm:col-start-auto">
              {lesson.published ? (lesson.readTime ?? "read") : "coming soon"}
            </span>
          </>
        );
        return (
          <li key={lesson.slug}>
            {lesson.published ? (
              <Link href={dsaLessonHref(lesson)} className={`${rowClass} rounded-lg text-ink hover:bg-sky-soft hover:no-underline`}>
                {body}
              </Link>
            ) : (
              <div className={`${rowClass} text-ink-dim [&_.text-sky]:text-ink-dim`}>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
