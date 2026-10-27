import type { CheatSheet } from "../types.ts";

/** Cheat sheet for the "behavioral-interview" series. See scripts/SERIES-SHEETS.md. */
export const SHEET: CheatSheet | null = {
  intro:
    "The behavioral round tests what you actually did, so the plan is a small bank of true stories told in about 90 seconds each. Frameworks, shapes and scripts for every common question, from the opening three to offers. Examples are invented.",
  sections: [
    {
      title: "STAR, part by part",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Part", "Worked line (tight deadline)"],
          rows: [
            ["Situation (15% with Task)", "Six weeks before a big sale; the plan needed ten."],
            ["Task", "Decide what we can safely ship and make it visible."],
            ["Action (55%)", "Listed features must/nice/later; built payment step first; Friday update: done, at risk, need."],
            ["Result (20%)", "Shipped 4 days early; checkout errors under 1%; saved cards a month later."],
            ["Reflection (10%)", "An early, honest list of what we will not do is the best tool."],
          ],
        },
        {
          kind: "points",
          items: [
            "90 seconds is about 200 words. The usual error is 60 seconds of background and 15 of action.",
            "Add a short \"because\" to your main actions. Cut to the two or three actions that show the signal.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "The \"we\" trap: \"We decided, we tested, we shipped.\" Say \"I proposed the queue, I wrote the load test\", and share credit for the rest.",
        },
      ],
    },
    {
      title: "Question map and story bank",
      lesson: 0,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Signal", "Show"],
          rows: [
            ["Conflict", "Disagree without damage", "Listened first, shared goal"],
            ["Failure", "Honesty, learning", "Own it, name the cost, changed something"],
            ["Tight deadline", "Judgement", "Cut scope on purpose, warned early"],
            ["Hard feedback", "Coachability", "Asked questions, then changed"],
            ["Why leaving", "Attitude", "Moving toward, not away"],
          ],
        },
        {
          kind: "steps",
          items: [
            "Collect from your resume, old pull requests and last review.",
            "Pick **six** stories, at least two about mistakes or hard moments. Tag the signals each can show.",
            "Fill a matrix (stories by signals). Two ready stories per common signal.",
            "Say each aloud, cut to 90 seconds, memorise the bullets and the first sentence.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Expect follow-ups: what did YOU do, why that option, what would you do differently, how do you know it worked.",
        },
      ],
    },
    {
      title: "Tell me about yourself",
      lesson: 1,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["Present (15 s)", "Backend dev, 4 years; I own a notification service. Failures down from 3% to 0.5%."],
            ["Past (30 s)", "A startup where I did everything, then a team with review and tests."],
            ["Future (15 s)", "I want reliability work at larger scale; your platform role is that step."],
          ],
        },
        {
          kind: "points",
          items: [
            "About 60 seconds, 150 words, one number. Write the future part first.",
            "Change only the last sentence per company. Mention only highlights you could discuss for five minutes.",
            "Fresher: projects plus a user count. Career switcher: the old career as a strength, plus proof of work.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Do not start in childhood, list technologies, or say \"hard worker, team player\". The interviewer has your resume.",
        },
      ],
    },
    {
      title: "Why this company, why leaving",
      lesson: 1,
      blocks: [
        {
          kind: "pairs",
          rows: [
            ["Product", "One true thing you tried or learned"],
            ["Work", "A detail from their blog, talk, code or job post"],
            ["You", "How you fit, or what you want to learn"],
          ],
        },
        {
          kind: "table",
          head: ["You say", "They hear"],
          rows: [
            ["\"My boss was awful\"", "You will blame others"],
            ["\"I just wanted more money\"", "You leave for a higher offer"],
            ["\"I'm just looking around\"", "You are not committed"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Leaving: start with something you learned, give one neutral reason, point to the future, 30 seconds. Layoff or gap: one plain sentence, no blame.",
        },
      ],
    },
    {
      title: "Failure, conflict, feedback",
      lesson: 2,
      blocks: [
        {
          kind: "table",
          head: ["Story", "Shape"],
          rows: [
            ["Failure", "Context, my part (\"I\"), cost with a number, what I did at once, the system fix"],
            ["Conflict", "Understand their worry, name the shared goal, test or decide with data, repair"],
            ["Feedback", "Honest first reaction, ask for an example, change 2 to 3 things, show a result"],
          ],
        },
        {
          kind: "table",
          head: ["Say", "Avoid"],
          rows: [
            ["\"The mistake was mine.\"", "\"It wasn't my fault.\""],
            ["\"I asked what worried them.\"", "\"He always...\" or \"she never...\""],
            ["\"That was a fair point.\"", "\"I told them so.\""],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "No fake weakness (\"I care too much\"), no villain, no hero story for a problem you caused. Disagree with a manager: bring a fact and a smaller option.",
        },
      ],
    },
    {
      title: "Ownership, leading, impact",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Story", "Shape"],
          rows: [
            ["Ownership", "Notice (with cost), measure, act small, tell people, check"],
            ["Leading", "Goal, risk-first plan, communication, one hurdle, result"],
            ["Mentoring", "Person, need, method, visible change, lesson"],
            ["Missing data", "Knowns and unknowns, a range, safe at both ends, reversible, revisit trigger"],
            ["Impact", "Baseline, change, result"],
          ],
        },
        {
          kind: "points",
          items: [
            "Level shows in scope: junior finishes tasks, mid owns a feature, senior finds problems and brings others along.",
            "Without approval: act only on small, reversible things and tell your manager the same day.",
          ],
        },
      ],
    },
    {
      title: "Finding your numbers",
      lesson: 3,
      blocks: [
        {
          kind: "table",
          head: ["Ask", "Example"],
          rows: [
            ["Time before and after", "Build 25 min to 9 min"],
            ["Failure rate", "3% to 0.5%"],
            ["Volume", "2 million messages a day"],
            ["Time saved", "30 minutes a day for 10 people"],
            ["Tickets", "14 support requests to 3"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "No exact figure? Say \"I estimate about 40%\". Never invent 37.4%, and never claim impact you did not cause.",
        },
      ],
    },
    {
      title: "Awkward questions",
      lesson: 4,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Shape"],
          rows: [
            ["Strengths", "One or two, each with proof, linked to the role"],
            ["Weakness", "Real, not core: effect, current habits, proof of progress"],
            ["Gap or layoff", "One plain sentence, what you did, ready now"],
            ["Short stays", "Honest pattern, a reason each, what is different now"],
            ["Switching stack", "Real reason, proof you started, what transfers"],
          ],
        },
        {
          kind: "points",
          items: [
            "Personal or illegal question: answer the work concern behind it, deflect politely, or decline. Keep notes. Not legal advice.",
            "Put the awkward fact second, then follow with the future.",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Never \"I'm a perfectionist\". Never lie about dates; they can be checked.",
        },
      ],
    },
    {
      title: "Questions to ask them",
      lesson: 5,
      blocks: [
        {
          kind: "table",
          head: ["Ask", "Question"],
          rows: [
            ["Engineer", "Tell me about the last time something broke in production."],
            ["Engineer", "How does a change get from laptop to users?"],
            ["Manager", "What does success look like at 3, 6 and 12 months?"],
            ["Manager", "Why is this role open?"],
            ["Recruiter", "What are the steps, timeline and salary range?"],
          ],
        },
        {
          kind: "table",
          head: ["Red flag", "Follow-up"],
          rows: [
            ["\"We are like a family\"", "What does a normal week look like?"],
            ["Nobody can define success", "How will I know in month 6?"],
            ["\"Sign today\"", "Why is the deadline this date?"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Prepare 8, ask 3 to 5, each tied to something they said. One flag is a question; three is a pattern. Send a short thank-you the same day.",
        },
      ],
    },
    {
      title: "Offers and negotiation",
      lesson: 6,
      blocks: [
        {
          kind: "points",
          items: [
            "Know three numbers: walk-away, target, reach. Know your alternative.",
            "Ask for their range first. Never lie about current pay. Do not accept on the call; ask for details in writing.",
            "Counter once, in writing, warmly, with specific numbers and one or two reasons.",
          ],
        },
        {
          kind: "table",
          head: ["Made-up offers", "A", "B"],
          rows: [
            ["Base", "100,000", "115,000"],
            ["Cash (base + bonus)", "110,000", "120,750"],
            ["Steady total", "136,000", "128,200"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          text: "Higher base is not always higher pay. A cliff means no equity before month 12. RSUs are often taxed at vesting. Numbers here are invented.",
        },
      ],
    },
    {
      title: "Remote work and managers",
      lesson: 7,
      blocks: [
        {
          kind: "code",
          lang: "text",
          code: "Stuck: invoice export (ticket 412)\nProblem: CSV empty above 500 rows\nTried: query is fine; export ok at 100\nQuestion: should export.ts page?\nMeanwhile: moving to ticket 415",
          note: "Ask so the reader needs no follow-up question.",
        },
        {
          kind: "steps",
          items: [
            "Late task: tell your manager the moment you know.",
            "Say status, reason, new range, options, recommendation.",
            "Ask for a decision by a date.",
          ],
        },
        {
          kind: "points",
          items: [
            "Monday plan, Friday summary (done, not done, learned). Main point first, one topic per message.",
            "1:1 is your meeting: wins, help needed, feedback, growth. Write actions.",
            "Disagree once with facts and an option, then commit. Move heated chat to a call.",
          ],
        },
      ],
    },
    {
      title: "Mock round and one-week plan",
      lesson: 8,
      blocks: [
        {
          kind: "points",
          items: [
            "Score 1 to 4, with evidence, on motivation, proactivity, unstructured work, perseverance, conflict, empathy, growth, communication.",
            "Bands out of 32: 28+ strong, 24 to 27 good, 20 to 23 borderline. Any 1 is a red alert.",
          ],
        },
        {
          kind: "table",
          head: ["Day", "Task"],
          rows: [
            ["1", "Research the company, build the story bank"],
            ["2", "The big three in bullets, aloud three times"],
            ["3 to 4", "STAR for conflict, failure, ambiguity, leadership, impact; add numbers"],
            ["5", "Eight questions to ask; salary numbers"],
            ["6", "Full mock, score it, pick two fixes"],
            ["7", "Redo the fixes, logistics, sleep. Do not cram"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Answers run 1.5 to 3 minutes. Start with the point, say the result slowly, and pause two seconds before answering.",
        },
      ],
    },
    {
      title: "Interview one-liners",
      lesson: 1,
      blocks: [
        {
          kind: "table",
          head: ["Question", "Short answer"],
          rows: [
            ["Tell me about yourself", "Present, past, future in 60 seconds, one number."],
            ["Why are you leaving?", "What I am moving toward. Never blame."],
            ["Biggest weakness?", "Real, not core, with habits and proof."],
            ["Tell me about a mistake", "Own it, give the cost, show the system fix."],
            ["Salary expectations?", "Ask their range first; talk total pay."],
            ["Anything you'd do differently?", "Small and concrete, not \"nothing\"."],
            ["Any questions for us?", "Yes: three, tied to the talk."],
          ],
        },
      ],
    },
  ],
};
