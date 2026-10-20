import Link from "next/link";

const GOALS = [
  { n: "01", title: "Crack coding interviews", text: "Patterns, traced solutions and model answers, from arrays to dynamic programming.", href: "/guides/coding-interview-preparation-guide" },
  { n: "02", title: "Design large systems", text: "Scaling, caching, queues and real design cases, explained from first principles.", href: "/guides/system-design-interview-guide" },
  { n: "03", title: "Ship and run software", text: "Linux, Git, Docker, AWS and Kubernetes: how code reaches production and stays up.", href: "/guides/devops-aws-guide" },
  { n: "04", title: "Build full-stack apps", text: "JavaScript, TypeScript, React, Next.js and Node.js, with the reasoning behind each choice.", href: "/guides/typescript-react-nextjs-guide" },
] as const;

/** Four goals, each leading to a ready-made guide. Set as a ruled grid, not as floating cards. */
export default function GoalCards() {
  return (
    <ul className="m-0 grid list-none overflow-hidden rounded-xl border border-line p-0 sm:grid-cols-2 lg:grid-cols-4">
      {GOALS.map((g, i) => (
        <li key={g.n} className={`m-0 bg-bg-elev ${i > 0 ? "border-t border-line sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l sm:border-line" : ""} ${i > 0 ? "lg:border-l lg:border-line" : ""} ${i >= 2 ? "sm:border-t sm:border-line lg:border-t-0" : ""}`}>
          <Link href={g.href} className="group flex h-full flex-col p-6 text-ink transition hover:bg-bg hover:no-underline">
            <span className="font-mono text-[0.8rem] text-sky">{g.n}</span>
            <h3 className="mt-6 mb-2 text-[1.1rem] font-semibold leading-snug">{g.title}</h3>
            <p className="m-0 flex-1 text-[0.92rem] text-ink-dim">{g.text}</p>
            <span className="mt-5 text-[0.88rem] font-semibold text-sky">Open guide <span aria-hidden="true" className="inline-block transition group-hover:translate-x-1">→</span></span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
