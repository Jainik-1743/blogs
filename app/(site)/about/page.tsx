import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { aboutJsonLd, pageMetadata } from "@/lib/seo";
import { SERIES_LIST } from "@/lib/registry";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = pageMetadata("/about");

const h2 = "mt-10 mb-3 text-[1.5rem] font-semibold text-ink";
const p = "text-ink-dim";
const li = "text-ink-dim";

const lessonTotal = SERIES_LIST.reduce((n, x) => n + x.lessons.filter((l) => l.published).length, 0);
const LOVES = ["Researching", "Building things", "Learning in public", "Explaining clearly", "Solving problems", "Staying curious"];
const WORK = [
  ["🔎", "Researching a topic until it makes sense, then writing it down so it makes sense to others too."],
  ["🛠️", "Building things from an idea to something real people can use."],
  ["🧭", "Looking at the whole picture, not only one part, before making a decision."],
  ["🤝", "Working with people remotely and taking a task all the way to done."],
  ["📚", "Turning what I learn into short, step-by-step lessons."],
  ["✅", "Checking my work and saying plainly what was tested and what was not."],
];
const CHECKS = [
  ["Easy to follow", "Short sentences, every term explained the first time it appears."],
  ["Examples that were run", "Many lessons say what was actually run and what was only read from documentation."],
  ["Sources named", "Lessons point to the specifications and guides they rely on, and say when a source could not be opened."],
  ["Made with AI assistance", "AI tools help research and draft the lessons. They are a starting point, not a final authority."],
  ["Opinion is labelled", "Where a lesson gives advice rather than a fact, it says so."],
];
const card = "rounded-2xl border border-line bg-bg-elev p-5";

export default function AboutPage() {
  return (
    <article>
      <JsonLd data={aboutJsonLd()} />

      <header className="relative overflow-hidden rounded-3xl border border-line bg-bg-elev px-6 py-8 sm:px-10 sm:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky/15 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:gap-10 sm:text-left">
          <Image
            src="/jainik.png"
            alt="Portrait of Jainik, the author of this site"
            width={210}
            height={210}
            priority
            className="h-40 w-40 shrink-0 rounded-full border-2 border-sky/60 object-cover shadow-lg shadow-black/30 ring-4 ring-sky/15 sm:h-48 sm:w-48"
          />
          <div className="min-w-0 flex-1">
            <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">About</p>
            <h1 className="mb-3 text-[2.2rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[1.8rem]">
              Hi, I am Jainik
            </h1>
            <p className={`${p} m-0 text-[1.08rem]`}>
              A Senior Software Engineer with 5 years of experience. I like researching how things work, building
              something useful, and explaining it in a way anyone can follow. This site is where I share what I learn, as clear,
              easy-to-follow lessons for people who want to build and run software well.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-full bg-sky px-4 py-2 text-[0.9rem] font-semibold on-sky no-underline hover:opacity-90"
              >
                ✉ Email me
              </a>
              <a
                href="#how-lessons-are-made"
                className="inline-flex items-center rounded-full border border-line px-4 py-2 text-[0.9rem] text-ink no-underline hover:border-sky hover:text-sky"
              >
                How lessons are made
              </a>
            </div>
          </div>
        </div>
        <dl className="relative mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            ["5+", "years of experience"],
            [String(SERIES_LIST.length), "lesson series"],
            [lessonTotal.toLocaleString("en-US"), "lessons"],
          ].map(([n, l]) => (
            <div key={l} className="rounded-xl border border-line bg-bg px-2 py-3">
              <dt className="text-[1.5rem] font-bold leading-none text-sky max-sm:text-[1.25rem]">{n}</dt>
              <dd className="m-0 mt-1 text-[0.78rem] text-ink-dim">{l}</dd>
            </div>
          ))}
        </dl>
      </header>

      <h2 className={h2}>What I enjoy</h2>
      <div className="flex flex-wrap gap-2">
        {LOVES.map((k) => (
          <span key={k} className="rounded-full border border-sky/40 bg-sky/10 px-3 py-1 text-[0.85rem] text-sky">
            {k}
          </span>
        ))}
      </div>

      <h2 className={h2}>Who I am</h2>
      <p className={p}>Over those five years, the things I keep coming back to are:</p>
      <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
        {WORK.map(([i, t]) => (
          <li key={t} className={`${card} flex items-start gap-3 !py-4`}>
            <span aria-hidden="true" className="text-[1.4rem] leading-none">{i}</span>
            <span className="text-ink-dim">{t}</span>
          </li>
        ))}
      </ul>
      <p className={`${p} mt-4`}>
        I hold a Bachelor of Engineering in Information Technology (first class with distinction), which gave me the
        foundation in computer science and software engineering that these lessons build on.
      </p>

      <h2 className={h2}>What you will find here</h2>
      <p className={p}>
        Long, lesson-style series on data structures and algorithms, system design, DevOps, JavaScript, TypeScript, SQL, Git,
        testing, interview questions and team-lead skills. Every series reads like a small book: start at the first lesson and
        go forward. You can see all of them on the <Link href="/">home page</Link>, and every term has a short, clear entry in
        the <Link href="/glossaries">glossaries</Link>.
      </p>

      <h2 id="how-lessons-are-made" className={`${h2} scroll-mt-24`}>
        How the lessons are made and checked
      </h2>
      <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
        {CHECKS.map(([t, d], i) => (
          <li key={t} className={`${card} ${i === CHECKS.length - 1 && CHECKS.length % 2 ? "sm:col-span-2" : ""}`}>
            <strong className="block text-ink">{t}</strong>
            <span className="text-[0.95rem] text-ink-dim">{d}</span>
          </li>
        ))}
      </ul>
      <p className={`${p} mt-4`}>
        Things change quickly. If something is out of date or wrong, please tell me and I will fix it.
      </p>

      <h2 id="contact" className={`${h2} scroll-mt-24`}>
        Contact
      </h2>
      <div className="relative overflow-hidden rounded-3xl border border-sky/50 bg-sky/10 p-6 text-center sm:p-8">
        <p className="m-0 text-[0.95rem] text-ink-dim">Found a mistake, or want a topic covered? Write to me.</p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="mt-3 inline-block break-all rounded-full bg-sky px-6 py-3 text-[1.05rem] font-bold on-sky no-underline shadow-lg shadow-sky/20 hover:opacity-90"
        >
          ✉ {CONTACT_EMAIL}
        </a>
        <p className="mb-0 mt-3 text-[0.85rem] text-ink-dim">
          If you found a mistake, please include the lesson address and what you think is wrong.
        </p>
      </div>
      <p className={`${p} mt-4`}>
        This site collects only basic analytics. You can read how in the <Link href="/privacy">privacy notice</Link>.
      </p>
    </article>
  );
}
