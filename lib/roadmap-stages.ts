/**
 * The site-wide roadmap: eight steps from the basics to interviews, each with the series that belong
 * to it in reading order. Every slug is checked against the registry, so a renamed or removed series
 * fails the build instead of leaving a dead card. Edit the order here.
 */
export type StageDef = { title: string; level: string; blurb: string; series: string[] };

export const STAGES: StageDef[] = [
  { title: "Computer Basics", level: "Beginner", blurb: "How computers, the terminal, Git and networks work, plus your first data structures. Start here if you are new.", series: ["cs-foundations", "linux-shell", "git-github", "networking", "dsa"] },
  { title: "JavaScript", level: "Beginner", blurb: "The language of the web, from variables to asynchronous code, then TypeScript and the browser.", series: ["javascript", "javascript-2", "typescript", "browser"] },
  { title: "Frontend", level: "Beginner to intermediate", blurb: "Build user interfaces with React and Next.js, and learn to test them.", series: ["react", "nextjs", "frontend-depth", "testing"] },
  { title: "Backend", level: "Intermediate", blurb: "Build servers, APIs and databases, and keep them secure.", series: ["nodejs", "api-design", "sql-postgres", "backend", "security"] },
  { title: "System Design", level: "Advanced", blurb: "Plan systems that serve millions of users, with real case studies.", series: ["system-design", "design-cases", "low-level-design", "design-problems"] },
  { title: "Cloud and Operations", level: "Intermediate", blurb: "Deploy, run and monitor software in production.", series: ["devops", "docker-kubernetes", "observability", "debugging"] },
  { title: "AI Engineering", level: "Intermediate", blurb: "Use language models inside real products.", series: ["ai-engineering"] },
  { title: "Interviews and Career", level: "All levels", blurb: "Practise interview questions, write a strong resume, and prepare for the job.", series: ["career", "behavioral-interview", "team-lead", "fullstack-qa"] },
];

/** URL slug of a step's own roadmap: "Cloud and Operations" becomes "cloud-and-operations". */
export const stageSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const stageBySlug = (slug: string) => STAGES.find((st) => stageSlug(st.title) === slug);
