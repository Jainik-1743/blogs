import { Suspense } from "react";
import AuthPanel from "./AuthPanel";

const PERKS = [
  { title: "Your progress is saved", text: "Finished lessons, your streak and your next lesson follow you to any device." },
  { title: "Bookmarks and notes of interest", text: "Keep the lessons you want to come back to in one place." },
  { title: "Reminders that fit your day", text: "Pick a time and a daily goal, and get a nudge when it is time to read." },
  { title: "Always free", text: "Every lesson stays open to read without an account." },
];

/** Two-column frame for the login and signup pages: why sign up on the left, the form on the right. */
export default function AuthShell({ mode }: { mode: "login" | "signup" }) {
  return (
    <div className="grid items-start gap-12 py-4 lg:grid-cols-[1fr_28rem] lg:gap-20">
      <div className="max-lg:hidden">
        <p className="mb-3 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-sky">{mode === "signup" ? "Join for free" : "Sign in"}</p>
        <h1 className="m-0 max-w-[16ch] text-[2.8rem] font-bold leading-[1.1] tracking-tight text-ink">
          {mode === "signup" ? "Keep your place. Build the habit." : "Pick up where you left off."}
        </h1>
        <ul className="m-0 mt-10 flex list-none flex-col gap-6 p-0">
          {PERKS.map((p) => (
            <li key={p.title} className="m-0 flex gap-4">
              <span aria-hidden="true" className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-soft text-[0.8rem] font-bold text-sky">✓</span>
              <span>
                <span className="block font-semibold text-ink">{p.title}</span>
                <span className="block text-[0.92rem] text-ink-dim">{p.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-line bg-bg-elev p-6 sm:p-8">
        <h1 className="sr-only lg:hidden">{mode === "signup" ? "Create an account" : "Sign in"}</h1>
        <Suspense fallback={<p className="m-0 text-ink-dim">Loading…</p>}>
          <AuthPanel mode={mode} />
        </Suspense>
      </div>
    </div>
  );
}
