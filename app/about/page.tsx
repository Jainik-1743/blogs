import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { aboutJsonLd, pageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = pageMetadata("/about");

const h2 = "mt-10 mb-3 text-[1.5rem] font-semibold text-ink";
const p = "max-w-[66ch] text-ink-dim";
const li = "text-ink-dim";

export default function AboutPage() {
  return (
    <article>
      <JsonLd data={aboutJsonLd()} />
      <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">About</p>
      <h1 className="mb-3 text-[2.2rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[1.8rem]">
        About this site and its author
      </h1>
      <p className={`${p} text-[1.1rem]`}>
        I am Jainik, a Senior Software Engineer with 5 years of experience building web applications. I focus on scalable
        front-end architecture, clean code, performance and interfaces that are easy to use. React, Next.js and Tailwind CSS
        are the tools I use most. This site is where I share clear, easy-to-follow lessons for developers who want to build and run
        software well.
      </p>

      <h2 className={h2}>Who I am</h2>
      <p className={p}>Over those five years, my work has included:</p>
      <ul className="m-0 max-w-[66ch] list-disc space-y-1.5 pl-6">
        <li className={li}>Building reusable component libraries that cut repeated code and development time.</li>
        <li className={li}>Designing role-based access control for admin and user areas.</li>
        <li className={li}>Making layouts work well on phones, tablets and desktops, and fixing cross-browser differences.</li>
        <li className={li}>Applying accessibility practices so more people can use what is built.</li>
        <li className={li}>Taking part in architecture decisions for scalable front-end systems.</li>
        <li className={li}>Owning delivery end to end while working remotely.</li>
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
      <ul className="m-0 max-w-[66ch] list-disc space-y-1.5 pl-6">
        <li className={li}>
          <strong className="text-ink">Easy to follow.</strong> Short sentences, every term explained the first time it appears.
        </li>
        <li className={li}>
          <strong className="text-ink">Examples that were run.</strong> Many lessons include a short note that says what was
          actually run and what was only read from documentation, so you know what was checked.
        </li>
        <li className={li}>
          <strong className="text-ink">Sources named.</strong> Lessons point to the specifications, documentation and public
          guides they rely on, and say when a source could not be opened.
        </li>
        <li className={li}>
          <strong className="text-ink">Made with AI assistance.</strong> I use AI tools to help research and draft these
          lessons. They are a starting point, not a final authority, and the checking notes above are there for that reason.
        </li>
        <li className={li}>
          <strong className="text-ink">Opinion is labelled.</strong> Where a lesson gives advice or common practice rather than
          a fact, it says so.
        </li>
      </ul>
      <p className={`${p} mt-4`}>
        Things change quickly. If something is out of date or wrong, please tell me and I will fix it.
      </p>

      <h2 id="contact" className={`${h2} scroll-mt-24`}>
        Contact
      </h2>
      <p className={p}>
        The best way to reach me is email:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. If you found a mistake, please include the lesson address
        and what you think is wrong. You can also email me with ideas for topics you want covered.
      </p>
      <p className={p}>
        This site collects only basic analytics. You can read how in the <Link href="/privacy">privacy notice</Link>.
      </p>
    </article>
  );
}
