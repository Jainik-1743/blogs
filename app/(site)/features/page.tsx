import type { Metadata } from "next";
import type { ReactNode } from "react";
import FeaturesCta from "@/components/features/FeaturesCta";
import PageHeader from "@/components/page/PageHeader";
import SectionTitle from "@/components/page/SectionTitle";
import { pageMetadata } from "@/lib/seo";
import badges from "@/data/badges.seed.json";

export const metadata: Metadata = pageMetadata("/features");

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const Icon = ({ children }: { children: ReactNode }) => (
  <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-xl bg-sky-soft text-sky ring-1 ring-sky/30">
    <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>{children}</svg>
  </span>
);

const FEATURES: { title: string; text: string; icon: ReactNode; soon?: boolean }[] = [
  { title: "Progress that follows you", text: "Finished lessons are saved to your account, so you can start on your laptop and carry on from your phone.", icon: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" /> },
  { title: "A daily streak", text: "A flame counts the days you learn. See your current streak, your longest streak and the last seven days at a glance.", icon: <path d="M12 3c1 3-2 4-2 7a3 3 0 0 0 6 0c0-1-.5-2-1-3 3 2 5 4 5 8a8 8 0 0 1-16 0c0-4 3-6 5-9 .5 1 1 1.5 3-3z" /> },
  { title: "Reading badges", text: "Earn Silver, Gold, Platinum, Diamond and Elite as your learning days add up. Missing a day never takes a badge away.", icon: <path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.2 13.5 7 22l5-3 5 3-1.2-8.5" /> },
  { title: "Bookmarks, sorted by topic", text: "Press Save under any lesson. Your saved lessons are grouped by topic, with search, so you can find them again.", icon: <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" /> },
  { title: "Continue where you left off", text: "Come back later and we offer the last lesson you were reading, on any device.", icon: <path d="M5 4l14 8-14 8V4z" /> },
  { title: "Your reading overview", text: "A year of activity in one grid, your busiest topics and your totals, like a contribution graph for learning.", icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /> },
  { title: "Share what you earn", text: "Turn a badge or a streak into a card and a warm message to send to friends and family on WhatsApp, X, LinkedIn or email.", icon: <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" /> },
  { title: "Your own look", text: "Choose a dark or light theme and four text sizes, in one place on your account page.", icon: <path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 5 5 0 0 1-5-5z" /> },
  { title: "Cheat sheets to download", text: "24 one-page cheat sheets for Git, Linux, SQL, Docker, React and more. Read them free, and download any sheet as a PNG or a PDF.", icon: <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7" /> },
  { title: "Daily reminders", text: "Pick a time and a daily goal and get a gentle nudge. We are building this next.", icon: <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0" />, soon: true },
  { title: "New-lesson emails", text: "An optional note when new lessons and series are published. Off unless you turn it on.", icon: <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 7l9 6 9-6" />, soon: true },
];

const FAQ = [
  { q: "Is reading still free?", a: "Yes. Every lesson, guide, roadmap, glossary and the search stay free and open to everyone, with no sign-up. An account only adds the extras above." },
  { q: "What does an account cost?", a: "Nothing. It is free, and it asks for just an email and a password, or one click with Google." },
  { q: "How does a lesson count as finished?", a: "Either you press Mark as complete, or you have been reading for the lesson's stated time (for example 12 minutes) and reached the end. Only active time counts, so leaving a tab open does not." },
  { q: "What do you store about me?", a: "Your email, a name, the lessons you finished, the days you read, your bookmarks and the last page you read. Only you can see them. The privacy notice lists everything in plain words." },
  { q: "Can I have my account removed?", a: "Yes. Email us and your account and its data will be deleted." },
];

function FeatureCard({ f }: { f: (typeof FEATURES)[number] }) {
  return (
    <li className="m-0 flex flex-col rounded-2xl border border-line bg-bg-elev p-6">
      <div className="flex items-start justify-between gap-3">
        <Icon>{f.icon}</Icon>
        {f.soon && <span className="rounded-full border border-line px-2.5 py-0.5 text-[0.72rem] font-semibold text-ink-dim">Coming soon</span>}
      </div>
      <h3 className="mt-4 mb-1.5 text-[1.08rem] font-semibold text-ink">{f.title}</h3>
      <p className="m-0 text-[0.92rem] text-ink-dim">{f.text}</p>
    </li>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "What's new" }]}
        eyebrow="What's new"
        title="Free to read. Even better with an account."
        summary="Every lesson stays free for everyone. Create a free account and your learning is remembered: progress, a daily streak, badges, bookmarks and more."
        meta={[
          { label: "Reading", value: "Always free" },
          { label: "Account", value: "Free" },
          { label: "Sign-up", value: "Email or Google" },
          { label: "New features", value: "8 live" },
        ]}
      >
        <div className="mt-6"><FeaturesCta /></div>
      </PageHeader>

      <section aria-labelledby="all-features" className="mb-16">
        <SectionTitle id="all-features" title="What you get" note="Everything here is live now." />
        <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.filter((f) => !f.soon).map((f) => <FeatureCard key={f.title} f={f} />)}
        </ul>
        <h3 className="mt-12 mb-4 text-[1.1rem] font-semibold text-ink">Coming soon</h3>
        <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2">
          {FEATURES.filter((f) => f.soon).map((f) => <FeatureCard key={f.title} f={f} />)}
        </ul>
      </section>

      <section aria-labelledby="badges" className="mb-16">
        <SectionTitle id="badges" title="The badge ladder" note="Finish at least one lesson on a day and that day counts. Collect days to climb." />
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-5">
          {badges.map((b) => (
            <li key={b.id} className="m-0 flex flex-col items-center rounded-2xl border border-line bg-bg-elev px-3 py-5 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image} alt={`${b.name} badge`} width={84} height={104} loading="lazy" className="h-auto w-[5.25rem] drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]" />
              <p className="mt-3 mb-0 font-semibold text-ink">{b.name}</p>
              <p className="m-0 text-[0.8rem] text-ink-dim">{b.threshold}{b.id === "elite" ? "+" : ""} active days</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how" className="mb-16">
        <SectionTitle id="how" title="How it works" />
        <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-3">
          {[
            ["Create your account", "Use an email and a password, or continue with Google. It takes under a minute."],
            ["Read as you always do", "Open any lesson. Finish it and it is saved. Press Save to bookmark one."],
            ["Watch your habit grow", "Your streak, badges and overview fill in. Share a milestone when you earn one."],
          ].map(([t, d], i) => (
            <li key={t} className="m-0 flex gap-4 rounded-2xl border border-line bg-bg-elev p-6">
              <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky font-bold text-bg">{i + 1}</span>
              <div><h3 className="m-0 mb-1 text-[1.02rem] font-semibold text-ink">{t}</h3><p className="m-0 text-[0.9rem] text-ink-dim">{d}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq" className="mb-16">
        <SectionTitle id="faq" title="Questions" />
        <div className="border-t border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group border-b border-line py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                {f.q}<span aria-hidden="true" className="text-ink-dim transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 mb-0 max-w-[68ch] text-ink-dim">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-sky/40 bg-sky-soft px-6 py-10 text-center sm:px-12">
        <h2 className="m-0 text-[1.7rem] font-bold tracking-tight text-ink">Ready to keep your place?</h2>
        <p className="mx-auto mt-2 mb-6 max-w-[48ch] text-ink-dim">Free to join. Nothing you read today changes. You just start remembering it.</p>
        <div className="flex justify-center"><FeaturesCta /></div>
      </section>
    </>
  );
}
