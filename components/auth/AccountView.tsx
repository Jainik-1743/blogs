"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EXPERIENCE_OPTIONS, GOAL_OPTIONS, authErrorMessage, checkName, initialsOf } from "@/lib/accounts";
import { dayKey, streakOf, useProgress } from "@/lib/progress";
import { previewProgress } from "@/lib/preview";
import { usePreviewDays } from "@/lib/preview-client";
import { isAdminUser } from "@/lib/admin";
import { longestStreak } from "@/lib/overview";
import StreakBadge from "@/components/StreakBadge";
import AppearanceCard from "./AppearanceCard";
import ShareDialog from "@/components/ShareDialog";
import SignInMethods from "./SignInMethods";
import { useToast } from "@/components/Toast";
import Badge from "@/components/Badge";
import BadgesPanel from "./BadgesPanel";
import ReadingOverview from "./ReadingOverview";
import BookmarksSummary from "./BookmarksSummary";
import { AccountSkeleton, BadgesSkeleton } from "@/components/Skeleton";
import { tracksOf, useBadges } from "@/lib/badges";
import { useAccount } from "./AuthProvider";
import { Notice, Switch } from "./fields";
import ProfileFields, { type ProfileValues } from "./ProfileFields";

const labelOf = (list: readonly { value: string; label: string }[], v?: string) => list.find((o) => o.value === v)?.label;

function Card({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-bg-elev p-6 sm:p-7">
      <h2 className="m-0 text-[1.1rem] font-bold text-ink">{title}</h2>
      {text && <p className="mt-1 mb-0 text-[0.88rem] text-ink-dim">{text}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** The signed-in reader's page: who they are, their progress and their settings. */
export default function AccountView() {
  const { enabled, status, user, profile, profileError, signOut, updateProfile } = useAccount();
  const real = useProgress();
  // Owner-only preview: /account?preview=120 shows the page as if the streak were 120 days. Display only, nothing is saved.
  const previewDays = usePreviewDays();
  const [shareStreak, setShareStreak] = useState(false);
  const previewing = previewDays !== null && isAdminUser(user);
  const progress = previewing ? previewProgress(previewDays!) : real;
  const badges = useBadges(status === "ready");
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<ProfileValues>({ name: "", experience: "", goal: "", emailUpdates: false });
  const [nameError, setNameError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "out") router.replace("/login?next=/account");
    if (status === "unverified") router.replace("/verify-email?next=/account");
  }, [status, router]);

  useEffect(() => {
    if (profile) setValues({ name: profile.name, experience: profile.experience ?? "", goal: profile.goal ?? "", emailUpdates: profile.emailUpdates });
  }, [profile]);

  if (!enabled) return <Notice tone="info">Accounts are not set up on this copy of the site yet.</Notice>;
  if (status !== "ready" || !profile || !user) return <AccountSkeleton />;

  const streak = streakOf(progress.days);
  const longest = longestStreak(progress.days);
  const readToday = progress.days.includes(dayKey());
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const date = dayKey(d);
    return { date, label: d.toLocaleDateString("en", { weekday: "short" }).slice(0, 2), on: progress.days.includes(date), today: i === 6 };
  });
  const tracks = tracksOf(badges.badges, progress);
  /** The badge shown beside the avatar: the highest one earned in the first track that has any. */
  const badge = { current: tracks.find((t) => t.current)?.current ?? null };
  const dirty =
    values.name.trim() !== profile.name || values.experience !== (profile.experience ?? "") || values.goal !== (profile.goal ?? "");

  async function save(ev: FormEvent) {
    ev.preventDefault();
    const problem = checkName(values.name);
    setNameError(problem);
    if (problem) return toast(problem, "error");
    setBusy(true);
    try {
      await updateProfile({ name: values.name, experience: values.experience, goal: values.goal, emailUpdates: values.emailUpdates });
      toast("Profile saved.");
    } catch (err) {
      toast(authErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  }

  /** The email switch saves by itself, so it never waits for the Save button. */
  async function setEmailUpdates(on: boolean) {
    setValues((v) => ({ ...v, emailUpdates: on }));
    try {
      await updateProfile({ name: profile!.name, experience: profile!.experience, goal: profile!.goal, emailUpdates: on });
      toast(on ? "You will get an email when new lessons are published." : "Email updates are off.");
    } catch (err) {
      setValues((v) => ({ ...v, emailUpdates: !on }));
      toast(authErrorMessage(err), "error");
    }
  }

  const goal = labelOf(GOAL_OPTIONS, profile.goal);
  const experience = labelOf(EXPERIENCE_OPTIONS, profile.experience);

  return (
    <div className="flex flex-col gap-6">
      {/* Who you are */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-bg-elev p-6 sm:p-9">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sky-soft to-transparent" />
        <div className="relative flex flex-wrap items-center gap-6">
          <span className="relative shrink-0">
            <span aria-hidden="true" className="grid h-20 w-20 place-items-center rounded-full bg-sky text-[1.8rem] font-bold tracking-wide text-bg ring-4 ring-sky-soft">{initialsOf(profile.name)}</span>
            {badge.current && <span className="absolute -right-3 -bottom-3"><Badge badge={badge.current} size={38} /></span>}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="m-0 truncate text-[2rem] font-bold leading-tight tracking-tight text-ink max-sm:text-[1.6rem]">{profile.name}</h1>
            <p className="m-0 mt-1 break-all text-ink-dim">{profile.email}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[0.78rem]">
              <span className={`rounded-full border px-2.5 py-0.5 ${user.emailVerified ? "border-sky/50 text-sky" : "border-line text-ink-dim"}`}>{user.emailVerified ? "✓ Email verified" : "Email not verified"}</span>
              {badge.current && <span className="rounded-full border border-sky/50 px-2.5 py-0.5 text-sky">{badge.current.name} badge</span>}
              {experience && <span className="rounded-full border border-line px-2.5 py-0.5 text-ink-dim">{experience}</span>}
              {goal && <span className="rounded-full border border-line px-2.5 py-0.5 text-ink-dim">{goal}</span>}
            </div>
          </div>
          <button type="button" onClick={() => void signOut().then(() => { toast("You are signed out.", "info"); router.replace("/"); })} className="rounded-lg border border-line px-4 py-2 text-[0.88rem] font-semibold text-ink transition hover:border-sky hover:text-sky">Sign out</button>
        </div>
      </section>

      {profileError && <Notice tone="error">Your profile could not be saved to the database ({profileError}). Check that the Firestore rules are deployed, then sign out and in again.</Notice>}

      {previewing && (
        <Notice tone="info">
          Preview mode: showing {previewDays} days in a row. This is only how the page would look. Nothing is saved.{" "}
          <Link href="/account" className="font-semibold">Exit preview</Link>
        </Notice>
      )}

      <ShareDialog target={shareStreak ? { kind: "streak", days: streak } : null} onClose={() => setShareStreak(false)} />

      <AppearanceCard />

      {/* Streak */}
      <section id="streak" aria-labelledby="streak-title" className="scroll-mt-24 rounded-3xl border border-line bg-bg-elev p-6 sm:p-9">
        <div className="flex flex-wrap items-center gap-8">
          <StreakBadge days={streak} size={220} />
          <div className="min-w-0 flex-1 basis-72">
            <p className="m-0 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-sky">Day streak</p>
            <h2 id="streak-title" className="m-0 mt-1 text-[1.6rem] font-bold leading-tight tracking-tight text-ink">
              {streak === 0 ? "Start your streak today" : `${streak}-day streak`}
            </h2>
            <p className="mt-1 mb-0 max-w-[50ch] text-ink-dim">
              {readToday
                ? "You finished a lesson today. Come back tomorrow to keep the flame going."
                : streak > 0
                  ? "Finish a lesson today to keep your streak alive."
                  : "Finish one lesson to light the flame. Then come back every day."}
            </p>
            {longest > streak && <p className="mt-3 mb-0 text-[0.9rem] text-ink-dim">Your longest streak is <strong className="text-ink">{longest} days</strong>. Beat it!</p>}
            {streak > 0 && (
              <button type="button" onClick={() => setShareStreak(true)} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-sky px-4 py-2 text-[0.88rem] font-semibold text-sky transition hover:bg-sky-soft">
                <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" /></svg>
                Share my streak
              </button>
            )}
            <ol aria-label="The last 7 days" className="m-0 mt-5 flex list-none gap-2 p-0">
              {week.map((d) => (
                <li key={d.date} className="m-0 flex flex-col items-center gap-1.5" title={`${d.date}${d.on ? ": read" : ""}`}>
                  <span aria-hidden="true" className={`grid h-8 w-8 place-items-center rounded-full border text-[0.8rem] font-bold ${d.on ? "border-transparent bg-[#ff9f1c] text-[#2a1200]" : d.today ? "border-sky text-ink-dim" : "border-line text-transparent"}`}>{d.on ? "✓" : "·"}</span>
                  <span className="text-[0.7rem] text-ink-dim">{d.label}</span>
                  <span className="sr-only">{d.on ? "read" : "no lesson"}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <BookmarksSummary />

      <ReadingOverview progress={progress} />

      {badges.loading ? <BadgesSkeleton /> : tracks.length > 0 && <BadgesPanel tracks={tracks} />}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          <Card title="Profile" text="Your name appears on your account. The other two answers are optional.">
            <form onSubmit={save} noValidate className="flex flex-col gap-5">
              <ProfileFields values={values} onChange={(p) => setValues((v) => ({ ...v, ...p }))} errors={{ name: nameError }} disabled={busy} />
              <div className="flex items-center gap-3">
                <button type="submit" disabled={busy || !dirty} className="rounded-lg bg-sky px-5 py-2.5 font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button>
                {dirty && !busy && <span className="text-[0.82rem] text-ink-dim">You have unsaved changes.</span>}
              </div>
            </form>
          </Card>

          <SignInMethods />

          <Card title="Email" text="Choose what we may send to your address.">
            <div className="flex flex-col gap-5">
              <Switch id="email-updates" label="New lessons and series" text="One short email when something new is published. Off by default." checked={values.emailUpdates} onChange={setEmailUpdates} />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Keep learning">
            {progress.next ? (
              <Link href={progress.next.path} className="group block rounded-xl border border-sky/40 bg-sky-soft px-4 py-3 text-ink hover:no-underline">
                <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-sky">Up next</span>
                <span className="mt-0.5 flex items-center justify-between gap-3 font-semibold leading-snug">{progress.next.title}<span aria-hidden="true" className="transition group-hover:translate-x-1">→</span></span>
              </Link>
            ) : (
              <p className="m-0 text-[0.88rem] text-ink-dim">Finish a lesson and the next one to read shows up here.</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/roadmap" className="rounded-lg bg-sky px-4 py-2 text-[0.85rem] font-semibold text-bg hover:no-underline hover:brightness-110">Roadmap</Link>
              <Link href="/guides" className="rounded-lg border border-line px-4 py-2 text-[0.85rem] font-semibold text-ink hover:border-sky hover:text-sky hover:no-underline">Guides</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
