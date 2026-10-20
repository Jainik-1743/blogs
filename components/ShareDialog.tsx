"use client";

import { useEffect, useRef, useState } from "react";
import { FRAME_COUNT, badgeMessage, streakMessage, subjectFor } from "@/lib/share";
import { renderShareCard } from "@/lib/share-card";
import { useToast } from "@/components/Toast";
import type { Badge } from "@/lib/badges";

export type ShareTarget =
  | { kind: "badge"; badge: Badge; value: number; unit: string }
  | { kind: "streak"; days: number };

const LINK = "inline-flex items-center justify-center gap-2 rounded-lg border border-line px-3.5 py-2 text-[0.88rem] font-semibold text-ink transition hover:border-sky hover:text-sky hover:no-underline";

/**
 * A window for sharing something the reader earned: a card picture, a warm message they can edit, and buttons for
 * their phone's share sheet, WhatsApp, Telegram, X, LinkedIn, email, copy and download. Built on the native
 * <dialog> element, which sits above everything else on the page and traps the keyboard focus for us.
 */
export default function ShareDialog({ target, onClose }: { target: ShareTarget | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const toast = useToast();
  const [frame, setFrame] = useState(0);
  const [text, setText] = useState("");
  const [card, setCard] = useState<{ blob: Blob; dataUrl: string } | null>(null);
  const [cardError, setCardError] = useState(false);

  const url = typeof window !== "undefined" ? `${window.location.origin}/` : "";

  // Open and close the native dialog with the target.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (target && !d.open) {
      setFrame(0);
      d.showModal();
    }
    if (!target && d.open) d.close();
  }, [target]);

  // The message, for the chosen wording.
  useEffect(() => {
    if (!target) return;
    setText(target.kind === "badge" ? badgeMessage({ badge: target.badge, value: target.value, unit: target.unit, url }, frame) : streakMessage({ days: target.days, url }, frame));
  }, [target, frame, url]);

  // The card picture.
  useEffect(() => {
    if (!target) return;
    let live = true;
    setCard(null);
    setCardError(false);
    const host = window.location.host;
    const opts =
      target.kind === "badge"
        ? { image: target.badge.image, title: `${target.badge.name} Reader`, subtitle: `${target.value} ${target.unit}`, footer: `Learn free at ${host}`, glow: "56,189,248" }
        : { image: "/streak/streak-plate.webp", title: `${target.days}-day streak`, subtitle: "One lesson at a time", footer: `Learn free at ${host}`, glow: "255,159,28", number: target.days };
    renderShareCard(opts).then((c) => live && setCard(c)).catch(() => live && setCardError(true));
    return () => { live = false; };
  }, [target]);

  if (!target) return <dialog ref={ref} onClose={onClose} />;

  const fileName = target.kind === "badge" ? `${target.badge.id}-badge.png` : `${target.days}-day-streak.png`;
  const encoded = encodeURIComponent(text);

  async function nativeShare() {
    try {
      const file = card ? new File([card.blob], fileName, { type: "image/png" }) : null;
      if (file && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text });
      else await navigator.share({ text });
    } catch {
      /* the reader closed the share sheet */
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      toast("Message copied. Paste it anywhere.");
    } catch {
      toast("Could not copy. Select the message and copy it yourself.", "error");
    }
  }

  function download() {
    if (!card) return;
    const a = document.createElement("a");
    a.href = card.dataUrl;
    a.download = fileName;
    a.click();
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="share-title"
      className="m-auto w-[min(44rem,calc(100vw-1.5rem))] max-h-[calc(100dvh-1.5rem)] overflow-auto rounded-3xl border border-line bg-bg-elev p-0 text-ink shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="m-0 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-sky">Share</p>
            <h2 id="share-title" className="m-0 mt-1 text-[1.5rem] font-bold tracking-tight text-ink">
              {target.kind === "badge" ? `Tell someone about your ${target.badge.name} badge` : "Share your streak"}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink-dim hover:border-sky hover:text-sky">×</button>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-[13rem_1fr]">
          <div className="mx-auto w-52 sm:w-full">
            {card ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.dataUrl} alt="The picture that will be shared" className="w-full rounded-xl border border-line" />
            ) : cardError ? (
              <p className="m-0 rounded-xl border border-line p-4 text-[0.85rem] text-ink-dim">The picture could not be made. You can still send the message.</p>
            ) : (
              <span role="status" aria-busy="true" className="block aspect-[4/5] w-full animate-pulse rounded-xl bg-ink-dim/15"><span className="sr-only">Making your picture…</span></span>
            )}
            <button type="button" onClick={download} disabled={!card} className={`${LINK} mt-3 w-full disabled:opacity-50`}>Download picture</button>
          </div>

          <div className="min-w-0">
            <label htmlFor="share-text" className="mb-1.5 block text-[0.88rem] font-medium text-ink">Your message</label>
            <textarea
              id="share-text" value={text} onChange={(e) => setText(e.target.value)} rows={8}
              className="w-full resize-y rounded-xl border border-line bg-bg px-4 py-3 text-[0.95rem] leading-relaxed text-ink outline-none focus:border-sky focus:ring-2 focus:ring-sky/30"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <button type="button" onClick={() => setFrame((f) => (f + 1) % FRAME_COUNT)} className="text-[0.85rem] font-semibold text-sky hover:underline">↻ Another wording</button>
              <button type="button" onClick={copy} className="text-[0.85rem] font-semibold text-sky hover:underline">Copy message</button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <button type="button" onClick={nativeShare} className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky px-4 py-2 text-[0.88rem] font-semibold text-bg hover:brightness-110">Share…</button>
              )}
              <a className={LINK} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encoded}`}>WhatsApp</a>
              <a className={LINK} target="_blank" rel="noopener noreferrer" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encoded}`}>Telegram</a>
              <a className={LINK} target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?text=${encoded}`}>X</a>
              <a className={LINK} target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}>LinkedIn</a>
              <a className={LINK} href={`mailto:?subject=${encodeURIComponent(subjectFor(text))}&body=${encoded}`}>Email</a>
            </div>
            <p className="mt-4 mb-0 text-[0.78rem] text-ink-dim">The picture is made on your device and is not uploaded. On a phone, “Share…” sends the picture and the message together.</p>
          </div>
        </div>
      </div>
    </dialog>
  );
}
