import Figure from "./Figure";

/** Who does each job, on Vercel vs on AWS. "you" cells are the work this course teaches. */
type Who = "platform" | "you" | "shared";

const rows: { job: string; vercel: [Who, string]; aws: [Who, string]; lesson?: number }[] = [
  { job: "HTTPS certificate", vercel: ["platform", "automatic"], aws: ["shared", "ACM issues it, you attach it"], lesson: 4 },
  { job: "Global CDN", vercel: ["platform", "built in"], aws: ["you", "set up CloudFront"], lesson: 11 },
  { job: "Scaling up and down", vercel: ["platform", "automatic"], aws: ["shared", "you write the rules, AWS runs them"], lesson: 12 },
  { job: "Server OS and patches", vercel: ["platform", "no server to see"], aws: ["you", "update your EC2 box"], lesson: 7 },
  { job: "Network and firewall", vercel: ["platform", "hidden"], aws: ["you", "VPC, subnets, security groups"], lesson: 6 },
  { job: "Database and backups", vercel: ["shared", "a separate paid service"], aws: ["shared", "RDS backs up, you set the rules"], lesson: 8 },
  { job: "Keeping the bill low", vercel: ["platform", "priced per request"], aws: ["you", "pick sizes, stop idle servers"], lesson: 19 },
];

const chip: Record<Who, string> = {
  platform: "border-line bg-bg-code text-ink-dim",
  shared: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  you: "border-sky/50 bg-sky-soft text-sky-strong",
};
const whoLabel: Record<Who, string> = { platform: "Platform", shared: "Shared", you: "You" };

function Cell({ who, text }: { who: Who; text: string }) {
  return (
    <div className={`rounded-md border px-2.5 py-1.5 ${chip[who]}`}>
      <div className="font-mono text-[0.66rem] uppercase tracking-[0.08em] opacity-90">{whoLabel[who]}</div>
      <div className="text-[0.8rem] leading-snug">{text}</div>
    </div>
  );
}

export default function ResponsibilityMatrix() {
  return (
    <Figure caption="Who does each job. On Vercel almost everything is the platform's; on AWS most of it moves to you — and the lesson number shows where you learn it.">
      <div className="mb-3 flex flex-wrap gap-2 text-[0.72rem]">
        {(["platform", "shared", "you"] as Who[]).map((w) => (
          <span key={w} className={`rounded border px-2 py-0.5 font-mono ${chip[w]}`}>{whoLabel[w]}</span>
        ))}
      </div>
      <div role="table" aria-label="Who is responsible for each job on Vercel and on AWS" className="grid gap-1.5">
        <div role="row" className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-dim">
          <span role="columnheader">Job</span>
          <span role="columnheader">Vercel</span>
          <span role="columnheader">AWS</span>
        </div>
        {rows.map((r) => (
          <div role="row" key={r.job} className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] items-stretch gap-2">
            <div role="rowheader" className="flex flex-col justify-center">
              <span className="text-[0.86rem] font-medium text-ink">{r.job}</span>
              {r.lesson !== undefined && <span className="font-mono text-[0.66rem] text-sky">Lesson {r.lesson}</span>}
            </div>
            <div role="cell"><Cell who={r.vercel[0]} text={r.vercel[1]} /></div>
            <div role="cell"><Cell who={r.aws[0]} text={r.aws[1]} /></div>
          </div>
        ))}
      </div>
    </Figure>
  );
}
