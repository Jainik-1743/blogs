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
    <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((g) => {
        const look = LOOK[g.slug] ?? { accent: "sky", badge: "★", label: "Guide" };
        const minutes = g.sections.reduce((t, s) => t + s.pages.reduce((m, p) => m + (parseInt(p.readTime ?? "0", 10) || 0), 0), 0);
        return (
          <li key={g.slug} data-accent={look.accent} className="m-0">
            <Link
              href={`/guides/${g.slug}`}
              className="group flex h-full flex-col rounded-xl border border-line bg-bg-elev p-6 text-ink transition duration-200 hover:border-sky hover:no-underline"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-soft font-mono text-[0.8rem] font-bold text-sky-strong">{look.badge}</span>
                <span className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-dim">{look.label}</span>
              </div>
              <h3 className="mt-5 mb-2 text-[1.15rem] font-semibold leading-snug text-ink">{g.title}</h3>
              <p className="m-0 line-clamp-3 flex-1 text-[0.92rem] text-ink-dim">{g.description}</p>
              <dl className="m-0 mt-5 flex gap-x-5 border-t border-line pt-4 text-[0.82rem] text-ink-dim">
                <div className="flex gap-1.5"><dd className="m-0 font-semibold text-ink">{g.lessonCount}</dd><dt>lessons</dt></div>
                <div className="flex gap-1.5"><dd className="m-0 font-semibold text-ink">{g.sections.length}</dd><dt>parts</dt></div>
                {minutes > 0 && <div className="flex gap-1.5"><dd className="m-0 font-semibold text-ink">~{Math.round(minutes / 60)}h</dd><dt>reading</dt></div>}
              </dl>
              <span className="mt-4 text-[0.88rem] font-semibold text-sky">
                Start this guide <span aria-hidden="true" className="inline-block transition group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
