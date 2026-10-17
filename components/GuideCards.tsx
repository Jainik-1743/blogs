import Link from "next/link";
import { RESOLVED_GUIDES } from "@/lib/guides";

/** Look of each guide card: colour, a short badge and the label above the title. UI only. */
const LOOK: Record<string, { accent: string; badge: string; label: string }> = {
  "system-design-interview-guide": { accent: "violet", badge: "SD", label: "Interview" },
  "coding-interview-preparation-guide": { accent: "sky", badge: "</>", label: "Interview" },
  "javascript-interview-guide": { accent: "amber", badge: "JS", label: "Interview" },
  "sql-postgresql-guide": { accent: "teal", badge: "SQL", label: "Databases" },
  "git-and-github-guide": { accent: "indigo", badge: "git", label: "Tools" },
  "devops-aws-guide": { accent: "orange", badge: "ops", label: "Cloud" },
  "typescript-react-nextjs-guide": { accent: "emerald", badge: "TS", label: "Front end" },
  "full-stack-developer-interview-guide": { accent: "pink", badge: "FS", label: "Interview" },
  "team-lead-guide": { accent: "orange", badge: "TL", label: "Leadership" },
  "software-testing-guide": { accent: "lime", badge: "QA", label: "Quality" },
  "design-patterns-guide": { accent: "pink", badge: "OOP", label: "Design" },
  "web-security-guide": { accent: "violet", badge: "SEC", label: "Security" },
  "api-design-guide": { accent: "indigo", badge: "API", label: "Back end" },
  "react-guide": { accent: "sky", badge: "RX", label: "Front end" },
  "nodejs-guide": { accent: "emerald", badge: "JS", label: "Back end" },
  "behavioral-interview-guide": { accent: "pink", badge: "HR", label: "Career" },
  "nextjs-guide": { accent: "violet", badge: "NX", label: "Full stack" },
  "docker-kubernetes-guide": { accent: "orange", badge: "K8s", label: "Cloud" },
  "linux-command-line-guide": { accent: "lime", badge: "$_", label: "Tools" },
  "computer-networking-guide": { accent: "sky", badge: "IP", label: "Systems" },
  "observability-sre-guide": { accent: "rose", badge: "SLO", label: "Systems" },
  "ai-engineering-guide": { accent: "rose", badge: "AI", label: "AI" },
};

export default function GuideCards({ limit }: { limit?: number }) {
  const guides = RESOLVED_GUIDES.slice(0, limit);
  return (
    <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((g) => {
        const look = LOOK[g.slug] ?? { accent: "sky", badge: "★", label: "Guide" };
        return (
          <li key={g.slug} data-accent={look.accent} className="m-0">
            <Link
              href={`/guides/${g.slug}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-bg-elev p-5 text-ink transition duration-200 hover:-translate-y-1 hover:border-sky hover:shadow-lg hover:no-underline"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-sky opacity-70 transition group-hover:opacity-100" />
              <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sky-soft opacity-60 blur-2xl transition group-hover:opacity-100" />
              <div className="relative flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-soft font-mono text-[0.85rem] font-bold text-sky-strong ring-1 ring-sky/30">
                  {look.badge}
                </span>
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-sky">{look.label}</span>
              </div>
              <h3 className="relative mt-3 mb-1.5 text-[1.05rem] font-semibold leading-snug text-ink group-hover:text-sky-strong">
                {g.title}
              </h3>
              <p className="relative m-0 line-clamp-3 flex-1 text-[0.88rem] text-ink-dim">{g.description}</p>
              <div className="relative mt-4 flex items-center justify-between text-[0.8rem]">
                <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-ink-dim">{g.lessonCount} lessons</span>
                <span className="font-semibold text-sky transition group-hover:translate-x-1">Start reading →</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
