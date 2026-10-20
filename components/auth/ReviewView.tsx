"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page/PageHeader";
import QuestionCard from "@/components/QuizQuestion";
import { authErrorMessage } from "@/lib/accounts";
import { track } from "@/lib/analytics";
import { questionById, type Question } from "@/lib/quiz";
import { useToast } from "@/components/Toast";
import { BookmarksSkeleton } from "@/components/Skeleton";
import { useAccount } from "./AuthProvider";
import { useReview, type Answer } from "./ReviewProvider";
import { Notice } from "./fields";

type Card = { id: string; path: string; question: Question };

/**
 * The daily review: the quiz questions the reader missed that are due today, one at a time. Answers are collected and
 * saved in one write when the session ends (or the tab is hidden), not one write per question.
 */
export default function ReviewView() {
  const { enabled, status } = useAccount();
  const { due, items, ready, load, record } = useReview();
  const router = useRouter();
  const toast = useToast();
  const [cards, setCards] = useState<Card[] | null>(null);
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [right, setRight] = useState(0);
  const [finished, setFinished] = useState(false);
  const answers = useRef<Answer[]>([]);

  useEffect(() => {
    if (status === "out") router.replace("/login?next=/review");
    if (status === "unverified") router.replace("/verify-email?next=/review");
    if (status === "ready") load();
  }, [status, router, load]);

  // Freeze today's list when it first arrives, so answering does not reshuffle the session.
  useEffect(() => {
    if (!ready || cards !== null) return;
    setCards(due.flatMap(({ id, item }) => {
      const question = questionById(id, item);
      return question ? [{ id, path: item.p, question }] : [];
    }));
  }, [ready, due, cards]);

  const flush = useCallback(async () => {
    const batch = answers.current;
    if (batch.length === 0) return;
    answers.current = [];
    try {
      await record(batch);
    } catch (err) {
      answers.current = [...batch, ...answers.current];
      toast(authErrorMessage(err), "error");
    }
  }, [record, toast]);

  // Save what has been answered if the reader leaves the tab or the page.
  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && void flush();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      void flush();
    };
  }, [flush]);

  if (!enabled) return <Notice tone="info">Accounts are not set up on this copy of the site yet.</Notice>;
  if (status !== "ready" || !ready || cards === null) return <BookmarksSkeleton />;

  const card = cards[at];
  const next = items.filter((x) => !cards.some((c) => c.id === x.id)).sort((a, b) => a.item.d - b.item.d)[0];

  function check() {
    if (!card || picked === null) return;
    const correct = picked === card.question.answer;
    answers.current.push({ id: card.id, path: card.path, correct });
    if (correct) setRight((n) => n + 1);
    setChecked(true);
  }

  function advance() {
    if (at + 1 >= cards!.length) {
      setFinished(true);
      track("review_completed", { total: cards!.length, correct: right });
      void flush();
      return;
    }
    setAt(at + 1);
    setPicked(null);
    setChecked(false);
  }

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Review" }]}
        eyebrow="Your library"
        title="Daily review"
        summary="Questions you missed in lesson quizzes come back here after 1, 3, 7 and 14 days. Answer one right each time and it leaves the list."
        meta={[{ label: "Due today", value: String(cards.length) }, { label: "In your queue", value: String(items.length) }]}
      />

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-line bg-bg-elev p-8 text-center">
          <h2 className="m-0 text-[1.3rem] font-bold text-ink">{items.length === 0 ? "Nothing to review yet" : "You are all caught up"}</h2>
          <p className="mx-auto mt-2 mb-5 max-w-[48ch] text-ink-dim">
            {items.length === 0
              ? "Take the Quick check at the end of a lesson. Questions you miss will come back here."
              : "Nothing is due today. Come back tomorrow, or read another lesson."}
          </p>
          <Link href="/roadmap" className="inline-block rounded-lg bg-sky px-5 py-2.5 font-semibold text-bg hover:no-underline hover:brightness-110">Open the roadmap</Link>
        </div>
      ) : finished ? (
        <div className="rounded-2xl border border-sky/50 bg-sky-soft p-8 text-center">
          <h2 className="m-0 text-[1.4rem] font-bold text-ink">Review done</h2>
          <p className="mx-auto mt-2 mb-5 max-w-[48ch] text-ink-dim">You got {right} of {cards.length} right. Missed questions return tomorrow; right ones come back later and then leave the list.{next ? "" : " Nothing else is waiting."}</p>
          <Link href="/account" className="inline-block rounded-lg bg-sky px-5 py-2.5 font-semibold text-bg hover:no-underline hover:brightness-110">Back to your account</Link>
        </div>
      ) : (
        <div className="max-w-2xl rounded-2xl border border-line bg-bg-elev p-5 sm:p-7">
          <p className="m-0 mb-4 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-sky">Question {at + 1} of {cards.length}</p>
          <QuestionCard key={card.id} name="review" question={card.question} picked={picked} checked={checked} onPick={setPicked} />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {!checked ? (
              <button type="button" onClick={check} disabled={picked === null} className="rounded-lg bg-sky px-5 py-2.5 font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">Check</button>
            ) : (
              <button type="button" onClick={advance} className="rounded-lg bg-sky px-5 py-2.5 font-semibold text-bg transition hover:brightness-110">{at + 1 >= cards.length ? "Finish" : "Next question"}</button>
            )}
            <Link href={card.path} className="text-[0.85rem] font-semibold">Open the lesson</Link>
          </div>
        </div>
      )}
    </>
  );
}
