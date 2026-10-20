"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { accountsEnabled } from "@/lib/firebase";
import { authErrorMessage } from "@/lib/accounts";
import { quizFor, questionId } from "@/lib/quiz";
import { track } from "@/lib/analytics";
import { useAccount } from "@/components/auth/AuthProvider";
import { useReview } from "@/components/auth/ReviewProvider";
import QuestionCard from "@/components/QuizQuestion";
import { useToast } from "@/components/Toast";

/**
 * A short quiz at the end of a lesson. Anyone can take it. For a signed-in reader, the questions they miss are saved
 * in their account and come back on the Review page after 1, 3, 7 and 14 days. Nothing is kept in the browser.
 */
export default function LessonQuiz({ path }: { path: string }) {
  const questions = quizFor(path);
  const { status } = useAccount();
  const { load, record } = useReview();
  const toast = useToast();
  const [picked, setPicked] = useState<(number | null)[]>([]);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const signedIn = status === "ready";

  useEffect(() => {
    setPicked(Array(questions?.length ?? 0).fill(null));
    setChecked(false);
  }, [path, questions?.length]);

  // Read the queue once, so right answers to questions the reader missed before can move them along.
  useEffect(() => {
    if (signedIn && questions) load();
  }, [signedIn, questions, load]);

  if (!accountsEnabled || !questions) return null;

  const score = questions.filter((q, i) => picked[i] === q.answer).length;
  const complete = picked.length === questions.length && picked.every((p) => p !== null);

  async function check() {
    if (!questions) return;
    setChecked(true);
    track("quiz_completed", { path, series: path.split("/")[1] ?? "", score, total: questions.length });
    if (!signedIn) return;
    setBusy(true);
    try {
      await record(questions.map((q, i) => ({ id: questionId(path, i), path, correct: picked[i] === q.answer })));
    } catch (err) {
      toast(authErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    setPicked(Array(questions!.length).fill(null));
    setChecked(false);
  }

  return (
    <section aria-labelledby="quiz-title" className="mt-10 rounded-xl border border-line bg-bg-elev px-5 py-5" data-no-glossary>
      <p className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-sky">Quick check</p>
      <h2 id="quiz-title" className="m-0 mt-1 text-[1.3rem] font-bold text-ink">Test what you just read</h2>
      <div className="mt-5 flex flex-col gap-6">
        {questions.map((q, i) => (
          <QuestionCard key={i} index={i} name={`quiz-${i}`} question={q} picked={picked[i] ?? null} checked={checked} onPick={(n) => setPicked((p) => p.map((v, j) => (j === i ? n : v)))} />
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!checked ? (
          <button type="button" onClick={() => void check()} disabled={!complete} className="rounded-lg bg-sky px-5 py-2.5 font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">Check answers</button>
        ) : (
          <>
            <p className="m-0 font-semibold text-ink" role="status">You got {score} of {questions.length}.</p>
            <button type="button" onClick={retry} className="rounded-lg border border-line px-4 py-2 text-[0.88rem] font-semibold text-ink transition hover:border-sky hover:text-sky">Try again</button>
          </>
        )}
        {!complete && !checked && <span className="text-[0.82rem] text-ink-dim">Answer every question to check.</span>}
      </div>
      {checked && (
        <p className="m-0 mt-3 text-[0.85rem] text-ink-dim">
          {busy ? "Saving…" : signedIn ? <>Questions you missed will come back on your <Link href="/review">Review page</Link> after a day.</> : <><Link href={`/login?next=${encodeURIComponent(path)}`}>Sign in</Link> to save the questions you missed and review them later.</>}
        </p>
      )}
    </section>
  );
}
