"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toggleFocus, useFocus } from "@/lib/focus";

const LESSON_PATH = /^\/[^/]+\/lesson-\d+\/?$/;
const RATES = [1, 1.25, 1.5, 0.85] as const;
const MAX_CHUNK = 220;

const BTN =
  "inline-flex h-9 min-w-10 items-center justify-center gap-1.5 px-3 text-[0.82rem] text-ink-dim transition hover:bg-sky-soft hover:text-sky focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky";

type Block = { el: HTMLElement; chunks: string[] };

/** Cuts a paragraph into short pieces, because some browsers stop reading long text after about 15 seconds. */
function chunk(text: string): string[] {
  const out: string[] = [];
  for (const sentence of text.split(/(?<=[.!?:;])\s+/)) {
    let rest = sentence.trim();
    while (rest.length > MAX_CHUNK) {
      const cut = rest.lastIndexOf(",", MAX_CHUNK) > 60 ? rest.lastIndexOf(",", MAX_CHUNK) + 1 : rest.lastIndexOf(" ", MAX_CHUNK);
      out.push(rest.slice(0, cut > 0 ? cut : MAX_CHUNK).trim());
      rest = rest.slice(cut > 0 ? cut : MAX_CHUNK).trim();
    }
    if (rest) out.push(rest);
  }
  return out;
}

/** The readable blocks of the lesson in page order. Code, tables and hidden answers are skipped. */
function collectBlocks(): Block[] {
  const root = document.querySelector<HTMLElement>(".lesson");
  if (!root) return [];
  const blocks: Block[] = [];
  for (const el of root.querySelectorAll<HTMLElement>("h2, h3, h4, p, li")) {
    if (el.closest("pre, table, svg, [aria-hidden='true'], [data-no-tts]")) continue;
    if (el.getClientRects().length === 0) continue; // hidden (for example a collapsed answer)
    let text: string;
    if (el.tagName === "LI") {
      if (el.querySelector(":scope > p")) continue; // its paragraphs are read on their own
      const copy = el.cloneNode(true) as HTMLElement;
      copy.querySelectorAll("ul, ol, pre, table").forEach((n) => n.remove());
      text = copy.textContent ?? "";
    } else {
      text = el.textContent ?? "";
    }
    text = text.replace(/\s+/g, " ").trim();
    if (text.length < 2) continue;
    // A heading is read with a pause after it.
    blocks.push({ el, chunks: chunk(/^H[2-4]$/.test(el.tagName) && !/[.!?]$/.test(text) ? text + "." : text) });
  }
  return blocks;
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  return en.find((v) => v.default) ?? en.find((v) => /natural|google|premium|enhanced/i.test(v.name)) ?? en[0];
}

/**
 * Two buttons for a lesson: "Listen" reads it aloud with the browser's built-in speech (nothing is
 * downloaded or saved), and "Focus" hides everything but the text. Renders nothing outside lessons.
 */
export default function LessonTools() {
  const pathname = usePathname();
  const isLesson = LESSON_PATH.test(pathname);
  const focus = useFocus();
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const [rateIdx, setRateIdx] = useState(0);
  const [heading, setHeading] = useState("");

  const blocks = useRef<Block[]>([]);
  const pos = useRef({ block: 0, chunk: 0 });
  const rate = useRef<number>(RATES[0]);
  const running = useRef(false);
  const active = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined");
  }, []);

  const clearHighlight = useCallback(() => {
    active.current?.classList.remove("tts-active");
    active.current = null;
  }, []);

  const stop = useCallback(() => {
    running.current = false;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    clearHighlight();
    setState("idle");
    setHeading("");
  }, [clearHighlight]);

  const speakCurrent = useCallback(() => {
    const synth = window.speechSynthesis;
    const { block, chunk: c } = pos.current;
    const b = blocks.current[block];
    if (!b) {
      stop();
      return;
    }
    if (active.current !== b.el) {
      clearHighlight();
      b.el.classList.add("tts-active");
      active.current = b.el;
      const r = b.el.getBoundingClientRect();
      if (r.top < 90 || r.bottom > window.innerHeight - 90) b.el.scrollIntoView({ block: "center", behavior: "smooth" });
      // Show the section being read: the nearest heading above this block.
      let h = "";
      for (let i = block; i >= 0; i--) {
        const t = blocks.current[i].el.tagName;
        if (/^H[2-4]$/.test(t)) {
          h = blocks.current[i].el.textContent?.replace(/\s+/g, " ").trim() ?? "";
          break;
        }
      }
      setHeading(h);
    }
    const u = new SpeechSynthesisUtterance(b.chunks[c]);
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? "en-US";
    u.rate = rate.current;
    u.onend = () => {
      if (!running.current) return;
      if (c + 1 < b.chunks.length) pos.current = { block, chunk: c + 1 };
      else pos.current = { block: block + 1, chunk: 0 };
      speakCurrent();
    };
    u.onerror = (e) => {
      // "canceled" and "interrupted" happen when we stop or change speed on purpose.
      if (e.error !== "canceled" && e.error !== "interrupted") stop();
    };
    synth.speak(u);
  }, [clearHighlight, stop]);

  const start = useCallback(() => {
    const all = collectBlocks();
    if (!all.length) return;
    blocks.current = all;
    // Begin at the first block that is on screen, so "Listen" reads from where you are.
    let first = all.findIndex((b) => b.el.getBoundingClientRect().bottom > 100);
    if (first < 0) first = 0;
    pos.current = { block: first, chunk: 0 };
    running.current = true;
    window.speechSynthesis.cancel();
    setState("playing");
    speakCurrent();
  }, [speakCurrent]);

  const pause = useCallback(() => {
    running.current = false;
    window.speechSynthesis.cancel();
    setState("paused");
  }, []);

  const resume = useCallback(() => {
    running.current = true;
    setState("playing");
    speakCurrent();
  }, [speakCurrent]);

  const changeRate = useCallback(() => {
    const next = (rateIdx + 1) % RATES.length;
    setRateIdx(next);
    rate.current = RATES[next];
    if (state === "playing") {
      // Restart the current piece at the new speed.
      window.speechSynthesis.cancel();
      speakCurrent();
    }
  }, [rateIdx, state, speakCurrent]);

  // Stop when leaving the page, so speech never carries on over the next lesson.
  useEffect(() => {
    stop();
    const onHide = () => window.speechSynthesis?.cancel();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      stop();
    };
  }, [pathname, stop]);

  if (!isLesson) return null;

  return (
    <>
      <div className="inline-flex items-center divide-x divide-line overflow-hidden rounded-full border border-line bg-bg-elev">
        {supported ? (
          <button
            type="button"
            onClick={() => (state === "idle" ? start() : stop())}
            aria-pressed={state !== "idle"}
            title="Read this lesson aloud"
            className={`${BTN} ${state !== "idle" ? "bg-sky-soft text-sky" : ""}`}
          >
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
            {state === "idle" ? "Listen" : "Stop"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={toggleFocus}
          aria-pressed={focus}
          title="Hide everything except the lesson text"
          className={`${BTN} ${focus ? "bg-sky-soft text-sky" : ""}`}
        >
          <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
          Focus
        </button>
      </div>

      {state !== "idle" ? (
        <div
          role="region"
          aria-label="Listening controls"
          className="fixed bottom-4 left-1/2 z-40 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-bg-elev/95 py-1.5 pr-2 pl-1.5 shadow-xl shadow-black/30 backdrop-blur"
        >
          <button
            type="button"
            onClick={state === "playing" ? pause : resume}
            aria-label={state === "playing" ? "Pause" : "Resume"}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky on-sky transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
          >
            {state === "playing" ? (
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
            ) : (
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" /></svg>
            )}
          </button>
          <span className="min-w-0 max-w-[14rem] truncate px-2 text-[0.8rem] text-ink-dim max-sm:max-w-[7rem]" aria-live="polite">
            {heading || "Listening"}
          </span>
          <button type="button" onClick={changeRate} aria-label={`Speed ${RATES[rateIdx]}x. Change speed`} className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.72rem] text-ink hover:border-sky hover:text-sky">
            {RATES[rateIdx]}x
          </button>
          <button type="button" onClick={stop} aria-label="Stop listening" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-dim hover:text-sky">
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>
      ) : null}
    </>
  );
}
