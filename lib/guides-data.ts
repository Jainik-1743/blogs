/**
 * Guides: curated reading paths that pull lessons from several series into one topic page, so a
 * person who searches for "system design interview" or "SQL tutorial" lands on one page that
 * shows the best order to read. Every path must be a real page; the build fails otherwise
 * (see lib/guides.ts), so a renamed or removed lesson can never leave a dead link here.
 */
export type GuideSection = { heading: string; note?: string; paths: string[] };

export type GuideDef = {
  slug: string;
  /** Page heading and share title. Keep it at 60 characters or fewer. */
  title: string;
  /** Meta description, about 155 characters. */
  description: string;
  /** One or two short paragraphs shown under the heading. */
  intro: string[];
  audience: string;
  sections: GuideSection[];
};

export const GUIDES: GuideDef[] = [
  {
    slug: "system-design-interview-guide",
    title: "System Design Interview Guide: Basics to Case Studies",
    description: "A reading order for system design interviews: requirements, estimation, caching, databases, queues, reliability and worked designs, with practice problems.",
    intro: [
      "System design interviews ask you to design a service on a whiteboard in about 45 minutes. This guide puts the lessons on this site in a sensible order: first how to approach the problem, then the building blocks, then data at scale, reliability, and finally full designs you can practise out loud.",
      "Read the sections in order the first time. Later, jump to the building block you are weakest on.",
    ],
    audience: "Developers preparing for system design rounds, and anyone who wants to understand how large systems fit together.",
    sections: [
      { heading: "Start here: how to approach any design", paths: ["/system-design/lesson-6", "/system-design/lesson-59", "/system-design/lesson-10", "/system-design/lesson-8", "/system-design/lesson-9", "/system-design/lesson-7"] },
      { heading: "Building blocks", paths: ["/system-design/lesson-12", "/system-design/lesson-14", "/system-design/lesson-15", "/system-design/lesson-16", "/system-design/lesson-18", "/system-design/lesson-19", "/system-design/lesson-20", "/system-design/lesson-29"] },
      { heading: "Data at scale", paths: ["/system-design/lesson-21", "/system-design/lesson-22", "/system-design/lesson-24", "/system-design/lesson-25", "/system-design/lesson-26", "/system-design/lesson-27", "/system-design/lesson-28"] },
      { heading: "Reliability and operations", paths: ["/system-design/lesson-40", "/system-design/lesson-41", "/system-design/lesson-42", "/system-design/lesson-43", "/system-design/lesson-44", "/system-design/lesson-46", "/system-design/lesson-47"] },
      { heading: "Worked designs", note: "Each one follows the same steps: requirements, numbers, API, data model, architecture, trade-offs.", paths: ["/system-design/lesson-60", "/system-design/lesson-61", "/system-design/lesson-62", "/system-design/lesson-63", "/system-design/lesson-64", "/design-cases/lesson-0", "/design-cases/lesson-1", "/design-cases/lesson-4", "/design-cases/lesson-5", "/design-cases/lesson-6", "/design-cases/lesson-8", "/design-cases/lesson-11"] },
      { heading: "Practise out loud", paths: ["/design-problems/lesson-0", "/design-problems/lesson-1", "/design-problems/lesson-3", "/design-problems/lesson-5", "/fullstack-qa/lesson-36", "/system-design/lesson-69"] },
    ],
  },
  {
    slug: "coding-interview-preparation-guide",
    title: "Coding Interview Preparation Guide: DSA Study Plan",
    description: "A step-by-step coding interview plan: how to study, the patterns that matter (arrays, hashing, trees, graphs, DP), mock interviews and interview-day habits.",
    intro: [
      "Coding interviews reward pattern recognition and clear communication more than memorised answers. This guide lists the lessons in the order a study plan would use them: plan first, then the core patterns, then the harder topics, then practice.",
      "Pair it with the 12-week plan in the career series, which maps each week to these lessons.",
    ],
    audience: "Anyone preparing for data structures and algorithms rounds, from first loops to interview day.",
    sections: [
      { heading: "Plan your preparation", paths: ["/career/lesson-1", "/career/lesson-2", "/dsa/lesson-11", "/dsa/lesson-12"] },
      { heading: "Arrays, hashing and searching", paths: ["/dsa/lesson-15", "/dsa/lesson-20", "/dsa/lesson-21", "/dsa/lesson-22", "/dsa/lesson-23", "/dsa/lesson-24", "/dsa/lesson-26", "/dsa/lesson-27", "/dsa/lesson-28", "/dsa/lesson-29"] },
      { heading: "Linked lists, stacks and queues", paths: ["/dsa/lesson-35", "/dsa/lesson-36", "/dsa/lesson-37", "/dsa/lesson-38", "/dsa/lesson-39", "/dsa/lesson-40"] },
      { heading: "Recursion and backtracking", paths: ["/dsa/lesson-14", "/dsa/lesson-32", "/dsa/lesson-33", "/dsa/lesson-34"] },
      { heading: "Trees, heaps and graphs", paths: ["/dsa/lesson-41", "/dsa/lesson-42", "/dsa/lesson-43", "/dsa/lesson-46", "/dsa/lesson-49", "/dsa/lesson-50", "/dsa/lesson-51", "/dsa/lesson-52", "/dsa/lesson-53"] },
      { heading: "Dynamic programming and extras", paths: ["/dsa/lesson-54", "/dsa/lesson-55", "/dsa/lesson-56", "/dsa/lesson-57", "/dsa/lesson-58"] },
      { heading: "Interview day and review", paths: ["/dsa/lesson-59", "/dsa/lesson-60", "/fullstack-qa/lesson-37", "/fullstack-qa/lesson-38", "/career/lesson-0"] },
    ],
  },
  {
    slug: "javascript-interview-guide",
    title: "JavaScript Interview Guide: Core Concepts and Questions",
    description: "Learn how JavaScript really works, then practise the questions: scope, closures, the event loop, prototypes, this, promises, modules and coding-round utilities.",
    intro: [
      "Most JavaScript interview questions come back to a few ideas: how the engine runs code, how scope and closures work, and how asynchronous code is scheduled. This guide starts with those and then moves to objects, classes, promises and modules.",
      "Each lesson is traced step by step with real output, and the question-bank lessons at the end let you practise answering out loud.",
    ],
    audience: "Developers who use JavaScript every day but want to explain it clearly in interviews.",
    sections: [
      { heading: "How JavaScript runs your code", paths: ["/javascript/lesson-1", "/javascript/lesson-2", "/javascript/lesson-7", "/javascript/lesson-8", "/javascript/lesson-13"] },
      { heading: "Closures and functions", paths: ["/javascript/lesson-10", "/javascript/lesson-11", "/javascript/lesson-12"] },
      { heading: "The event loop and async code", paths: ["/javascript/lesson-14", "/javascript-2/lesson-2", "/fullstack-qa/lesson-16"] },
      { heading: "Objects, this, classes and modules", paths: ["/javascript-2/lesson-0", "/javascript-2/lesson-1", "/javascript-2/lesson-3", "/javascript-2/lesson-4", "/javascript-2/lesson-6"] },
      { heading: "Numbers, text and memory", paths: ["/cs-foundations/lesson-2", "/cs-foundations/lesson-3", "/javascript-2/lesson-7"] },
      { heading: "Practise the questions", paths: ["/javascript/recap", "/fullstack-qa/lesson-15", "/fullstack-qa/lesson-17"] },
    ],
  },
  {
    slug: "sql-postgresql-guide",
    title: "SQL and PostgreSQL Guide: From First Query to Production",
    description: "Learn SQL with PostgreSQL step by step: SELECT, joins, grouping, window functions, schema design, indexes and EXPLAIN, transactions and safe migrations.",
    intro: [
      "SQL is the one skill that pays off in almost every developer job. This guide follows the SQL series from the first SELECT through joins, grouping and window functions, then adds the production topics: schema design, indexes, transactions and migrations.",
      "Every query in the series was run on a real PostgreSQL server, and the output shown is real.",
    ],
    audience: "Beginners learning SQL, and developers who want to understand indexes, transactions and query plans.",
    sections: [
      { heading: "The basics", paths: ["/sql-postgres/lesson-0", "/sql-postgres/lesson-1", "/sql-postgres/lesson-2", "/sql-postgres/lesson-3"] },
      { heading: "Design and speed", paths: ["/sql-postgres/lesson-4", "/sql-postgres/lesson-5", "/system-design/lesson-22", "/system-design/lesson-23"] },
      { heading: "Correctness and production", paths: ["/sql-postgres/lesson-6", "/sql-postgres/lesson-7", "/system-design/lesson-21", "/backend/lesson-7"] },
      { heading: "Interview questions and deeper Postgres", paths: ["/fullstack-qa/lesson-8", "/fullstack-qa/lesson-27", "/system-design/lesson-20"] },
    ],
  },
  {
    slug: "git-and-github-guide",
    title: "Git and GitHub Guide: Commits, Branches, Pull Requests",
    description: "Learn Git from the mental model to team workflows: the daily loop, branches and conflicts, remotes and pull requests, undoing mistakes, rebase and CI.",
    intro: [
      "Git feels confusing until you see what it stores: snapshots and pointers. This guide starts with that mental model, then builds up the daily commands, branching, pull requests and the safe ways to undo mistakes.",
      "Every command was run in a throwaway repository, and the real output is shown.",
    ],
    audience: "Developers who use Git every day but still feel unsure about merges, rebases or recovering lost work.",
    sections: [
      { heading: "The mental model and the daily loop", paths: ["/git-github/lesson-0", "/git-github/lesson-1"] },
      { heading: "Branches, remotes and pull requests", paths: ["/git-github/lesson-2", "/git-github/lesson-3", "/team-lead/lesson-3"] },
      { heading: "Undoing things and clean history", paths: ["/git-github/lesson-4", "/git-github/lesson-5"] },
      { heading: "Team workflow and automation", paths: ["/fullstack-qa/lesson-24", "/devops/lesson-14"] },
    ],
  },
  {
    slug: "devops-aws-guide",
    title: "DevOps and AWS Guide: From Git Push to Production",
    description: "A path from Linux and networking to a production setup on AWS: DNS, TLS, IAM, VPC, EC2, Docker, Nginx, scaling, CI/CD, Terraform, monitoring and cost.",
    intro: [
      "Platforms like Vercel hide a lot of work. This guide follows the DevOps series from the big picture down to raw AWS: servers, networks, databases, containers, scaling and automation, with the reasoning behind each piece.",
      "Read the foundations first; the AWS lessons build on them.",
    ],
    audience: "Developers moving from managed hosting to running their own infrastructure, and interview candidates who need to explain how deployment works.",
    sections: [
      { heading: "Foundations", paths: ["/devops/lesson-0", "/devops/lesson-1", "/devops/lesson-2", "/devops/lesson-3", "/devops/lesson-4"] },
      { heading: "Your first production setup on AWS", paths: ["/devops/lesson-5", "/devops/lesson-6", "/devops/lesson-7", "/devops/lesson-8", "/devops/lesson-9", "/devops/lesson-10"] },
      { heading: "Scale, automate, operate", paths: ["/devops/lesson-12", "/devops/lesson-14", "/devops/lesson-15", "/devops/lesson-17", "/devops/lesson-18", "/devops/lesson-19"] },
      { heading: "Containers, Kubernetes and rollouts", paths: ["/system-design/lesson-55", "/system-design/lesson-56", "/system-design/lesson-58", "/fullstack-qa/lesson-34", "/fullstack-qa/lesson-26"] },
      { heading: "Scaling a real app", paths: ["/design-cases/lesson-11", "/devops/the-pieces", "/devops/hosting-platforms"] },
    ],
  },
  {
    slug: "typescript-react-nextjs-guide",
    title: "TypeScript, React and Next.js Guide for Developers",
    description: "Learn TypeScript from zero, then go deeper on React rendering, hooks, Server Components, state management, testing and the browser performance basics.",
    intro: [
      "This guide connects the TypeScript series with the React and Next.js lessons: types and generics first, then how React renders, how hooks and Suspense work, and how to choose state tools and test what you build.",
      "It suits developers who already build UIs and want a stronger model of why things behave the way they do.",
    ],
    audience: "Front-end and full-stack developers, and interview candidates for React, Next.js and TypeScript roles.",
    sections: [
      { heading: "TypeScript from zero", paths: ["/typescript/lesson-0", "/typescript/lesson-1", "/typescript/lesson-2", "/typescript/lesson-3", "/typescript/lesson-4", "/typescript/lesson-6", "/typescript/lesson-7"] },
      { heading: "How React really works", paths: ["/frontend-depth/lesson-0", "/frontend-depth/lesson-1", "/frontend-depth/lesson-2", "/frontend-depth/lesson-3"] },
      { heading: "Performance and the browser", paths: ["/browser/lesson-8", "/browser/lesson-9", "/debugging/lesson-3", "/debugging/lesson-6"] },
      { heading: "Testing and quality", paths: ["/frontend-depth/lesson-5", "/testing/lesson-2", "/testing/lesson-4", "/frontend-depth/lesson-6"] },
      { heading: "Interview questions", paths: ["/fullstack-qa/lesson-3", "/fullstack-qa/lesson-4", "/fullstack-qa/lesson-5", "/fullstack-qa/lesson-25", "/frontend-depth/lesson-4"] },
    ],
  },
  {
    slug: "full-stack-developer-interview-guide",
    title: "Full-Stack Developer Interview Guide: Questions and Answers",
    description: "Prepare for a full-stack interview: front end, back end, databases, auth and security, debugging scenarios, experience questions and the people side.",
    intro: [
      "A full-stack interview covers a lot of ground. This guide groups the question-bank lessons by area and adds the scenario and security lessons that interviewers use to test judgement, not just memory.",
      "Start with the question bank's introduction to see how the topics are grouped.",
    ],
    audience: "Developers with a few years of experience preparing for full-stack or senior front-end and back-end roles.",
    sections: [
      { heading: "How to use the question bank", paths: ["/fullstack-qa/lesson-0", "/fullstack-qa/lesson-14"] },
      { heading: "Front end", paths: ["/fullstack-qa/lesson-1", "/fullstack-qa/lesson-4", "/fullstack-qa/lesson-5", "/fullstack-qa/lesson-28"] },
      { heading: "Back end and data", paths: ["/fullstack-qa/lesson-6", "/fullstack-qa/lesson-8", "/fullstack-qa/lesson-18", "/fullstack-qa/lesson-19", "/backend/lesson-2", "/backend/lesson-6", "/backend/lesson-7"] },
      { heading: "Auth and security", paths: ["/browser/lesson-2", "/browser/lesson-3", "/browser/lesson-4", "/fullstack-qa/lesson-22", "/fullstack-qa/lesson-31"] },
      { heading: "Debugging scenarios", paths: ["/debugging/lesson-0", "/debugging/lesson-1", "/debugging/lesson-2", "/debugging/lesson-9", "/debugging/lesson-10"] },
      { heading: "The people side", paths: ["/fullstack-qa/lesson-37", "/fullstack-qa/lesson-38", "/career/lesson-0"] },
    ],
  },
  {
    slug: "team-lead-guide",
    title: "Team Lead Guide: Decisions, People and Delivery",
    description: "How a team lead thinks: answering why questions, choosing tools, estimates and reviews, 1:1s and feedback, hiring, incidents, strategy and culture.",
    intro: [
      "Moving from developer to team lead is mostly a change in how you decide and communicate. This guide follows the team-lead series: first how to explain your choices, then delivery and quality, then people, then strategy and culture.",
      "Each lesson ends with interview-style questions and model answers, so it also works as preparation for lead interviews.",
    ],
    audience: "Senior developers stepping into leadership, and team leads who want a shared vocabulary for decisions and habits.",
    sections: [
      { heading: "Think and decide", paths: ["/team-lead/lesson-0", "/team-lead/lesson-1", "/team-lead/lesson-2", "/team-lead/lesson-5", "/team-lead/lesson-7"] },
      { heading: "Delivery and quality", paths: ["/team-lead/lesson-3", "/team-lead/lesson-6", "/team-lead/lesson-4", "/team-lead/lesson-10"] },
      { heading: "People", paths: ["/team-lead/lesson-8", "/team-lead/lesson-9", "/team-lead/lesson-17"] },
      { heading: "Strategy, growth and scale", paths: ["/team-lead/lesson-12", "/team-lead/lesson-13", "/team-lead/lesson-16", "/team-lead/lesson-14", "/team-lead/lesson-15"] },
      { heading: "Where the ideas come from", paths: ["/team-lead/lesson-11"] },
    ],
  },
  {
    slug: "software-testing-guide",
    title: "Software Testing Guide: Unit, Integration and E2E Tests",
    description: "Learn testing from the first test: unit tests and test doubles, UI tests, API and integration tests, Playwright end-to-end tests, TDD and a team test strategy.",
    intro: [
      "Good tests let you change code without fear; bad tests slow you down. This guide follows the testing series from why we test and the shapes of a test suite to unit, UI, API and end-to-end tests, then TDD and mutation testing.",
      "Every example was run, including the flaky tests that were reproduced and fixed.",
    ],
    audience: "Developers who want a clear testing strategy, and candidates preparing for testing questions.",
    sections: [
      { heading: "The foundations", paths: ["/testing/lesson-0", "/testing/lesson-1"] },
      { heading: "UI, API and end-to-end tests", paths: ["/testing/lesson-2", "/testing/lesson-3", "/testing/lesson-4"] },
      { heading: "TDD and a team strategy", paths: ["/testing/lesson-5", "/team-lead/lesson-6"] },
      { heading: "Tools and interview questions", paths: ["/fullstack-qa/lesson-21", "/frontend-depth/lesson-5", "/backend/lesson-11"] },
    ],
  },
  {
    slug: "design-patterns-guide",
    title: "Design Patterns and Low-Level Design Guide",
    description: "Learn SOLID and the classic design patterns with TypeScript, then practise object-oriented design: parking lot, LRU cache, state machines, rate limiter.",
    intro: [
      "Low-level design interviews ask you to turn a short description into classes and interfaces. This guide starts with a repeatable routine and the SOLID rules, then the three families of patterns, then full worked designs.",
      "All code is TypeScript that was run, and the worked designs include tests.",
    ],
    audience: "Developers preparing for object-oriented design rounds and anyone who wants cleaner designs.",
    sections: [
      { heading: "Routine and principles", paths: ["/low-level-design/lesson-0"] },
      { heading: "The patterns", paths: ["/low-level-design/lesson-1", "/low-level-design/lesson-2", "/low-level-design/lesson-3", "/low-level-design/lesson-4"] },
      { heading: "Worked designs", paths: ["/low-level-design/lesson-5", "/low-level-design/lesson-6", "/low-level-design/lesson-7", "/low-level-design/lesson-8", "/low-level-design/lesson-9"] },
    ],
  },
  {
    slug: "web-security-guide",
    title: "Web Security Guide for Developers: OWASP Top 10 Basics",
    description: "Learn web app security in plain English: injection, XSS, CSRF, passwords, access control, secrets, supply chain and APIs, with small examples that were run.",
    intro: [
      "Most security bugs come from a few repeating mistakes. This guide follows the OWASP Top 10 ideas in a sensible order: how attackers think, then the bugs that cause most breaches, then the habits that keep a project safe.",
      "Every example is a tiny local app that was attacked and then fixed, so you can try it yourself.",
    ],
    audience: "Web developers who want to write safer code, and candidates who get security questions in full-stack interviews.",
    sections: [
      { heading: "Think like an attacker", paths: ["/security/lesson-0"] },
      { heading: "The classic bugs", note: "Injection and browser attacks cause a large share of real breaches.", paths: ["/security/lesson-1", "/security/lesson-2", "/browser/lesson-3"] },
      { heading: "Login, access and secrets", paths: ["/security/lesson-3", "/security/lesson-4", "/security/lesson-5", "/browser/lesson-2"] },
      { heading: "Dependencies, APIs and servers", paths: ["/security/lesson-6", "/security/lesson-7", "/browser/lesson-4"] },
      { heading: "Put it into practice", paths: ["/security/lesson-8", "/fullstack-qa/lesson-31"] },
    ],
  },
  {
    slug: "ai-engineering-guide",
    title: "AI Engineering Guide: Build and Secure LLM Features",
    description: "From LLMs, agents and RAG to production: the OWASP Top 10 for LLM apps, prompt injection, evaluation, cost and latency, observability and guardrails.",
    intro: [
      "Calling a model is easy; making an LLM feature safe, measurable and affordable is the real work. This guide starts with how LLM apps are built, then follows the AI engineering series through security, evaluation, cost and production guardrails.",
      "The demos use a fake model, so you can run everything without an API key.",
    ],
    audience: "Full-stack developers adding LLM features to products, and candidates for AI engineering roles.",
    sections: [
      { heading: "How LLM apps are built", paths: ["/fullstack-qa/lesson-10", "/fullstack-qa/lesson-11", "/fullstack-qa/lesson-35"] },
      { heading: "Security", paths: ["/ai-engineering/lesson-0", "/ai-engineering/lesson-1"] },
      { heading: "Quality, cost and production", paths: ["/ai-engineering/lesson-2", "/ai-engineering/lesson-3", "/ai-engineering/lesson-4"] },
    ],
  },
];
