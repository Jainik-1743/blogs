"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Preview } from "@/lib/previews";

const LESSON_HREF = /^\/[^/]+\/lesson-\d+$/;
const DELAY_MS = 260;
const GAP = 10;

type Shown = { href: string; rect: DOMRect };

let cache: Record<string, Preview> | null = null;
let loading: Promise<Record<string, Preview> | null> | null = null;

function load(): Promise<Record<string, Preview> | null> {
  if (cache) return Promise.resolve(cache);
  loading ??= fetch("/lesson-previews.json")
    .then((r) => (r.ok ? r.json() : null))
    .then((d: Record<string, Preview> | null) => (cache = d))
    .catch(() => null);
  return loading;
}

/** The address of a lesson link, or null for any other link. */
function lessonHref(a: HTMLAnchorElement | null): string | null {
  if (!a || a.closest("[data-no-preview]")) return null;
  const raw = a.getAttribute("href");
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  const path = raw.split(/[?#]/)[0].replace(/\/$/, "");
  return LESSON_HREF.test(path) ? path : null;
}

/**
 * A small card with the lesson's title, summary and read time when you point at a link to a lesson,
 * anywhere on the site. It appears after a short pause, only for a mouse (not touch), and also when
 * you tab to the link. The data is one small file, fetched the first time it is needed.
 */
export default function LinkPreview() {
  const pathname = usePathname();
  const [shown, setShown] = useState<Shown | null>(null);
  const [data, setData] = useState<Preview | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const hide = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      current.current = null;
      setShown(null);
      setPos(null);
    };

    function show(a: HTMLAnchorElement, href: string, x: number, y: number) {
      if (href === pathname.replace(/\/$/, "")) return;
      if (timer.current) clearTimeout(timer.current);
      current.current = a;
      timer.current = setTimeout(async () => {
        const all = await load();
        const p = all?.[href];
        if (!p || current.current !== a) return;
        // A link that wraps onto two lines has two boxes: use the one under the pointer.
        const rects = Array.from(a.getClientRects());
        const rect = rects.find((r) => y >= r.top - 2 && y <= r.bottom + 2 && x >= r.left - 2 && x <= r.right + 2) ?? rects[0] ?? a.getBoundingClientRect();
        setData(p);
        setShown({ href, rect });
      }, DELAY_MS);
    }

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const a = (e.target as Element | null)?.closest?.("a") as HTMLAnchorElement | null;
      if (a === current.current) return;
      const href = lessonHref(a);
      if (!a || !href) return hide();
      show(a, href, e.clientX, e.clientY);
    };
    const onFocus = (e: FocusEvent) => {
      const a = (e.target as Element | null)?.closest?.("a") as HTMLAnchorElement | null;
      const href = lessonHref(a);
      if (a && href && a.matches(":focus-visible")) {
        const r = a.getBoundingClientRect();
        show(a, href, r.left + 8, r.top + 4);
      }
    };
    const onOut = (e: PointerEvent) => {
      const to = e.relatedTarget as Node | null;
      if (current.current && !(to && current.current.contains(to))) hide();
    };

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", hide);
    window.addEventListener("scroll", hide, { passive: true });
    document.addEventListener("pointerdown", hide);
    document.addEventListener("keydown", hide);
    return () => {
      hide();
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", hide);
      window.removeEventListener("scroll", hide);
      document.removeEventListener("pointerdown", hide);
      document.removeEventListener("keydown", hide);
    };
  }, [pathname]);

  // Place the card once it has been measured: below the link if there is room, otherwise above.
  useLayoutEffect(() => {
    if (!shown || !card.current) return;
    const w = card.current.offsetWidth;
    const h = card.current.offsetHeight;
    const { rect } = shown;
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - w - 12));
    const below = rect.bottom + GAP;
    const top = below + h > window.innerHeight - 12 && rect.top - GAP - h > 12 ? rect.top - GAP - h : below;
    setPos({ left, top });
  }, [shown, data]);

  if (!shown || !data) return null;
  const [number, title, summary, readTime, series, accent] = data;
  return (
    <div
      ref={card}
      aria-hidden="true"
      data-accent={accent}
      style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, visibility: pos ? "visible" : "hidden" }}
      className="pointer-events-none fixed z-50 w-[min(22rem,calc(100vw-24px))] rounded-xl border border-line bg-bg-elev px-4 py-3 shadow-xl shadow-black/40"
    >
      <div className="mb-1 flex flex-wrap items-baseline gap-x-2 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-sky">
        <span>{series}</span>
        <span className="text-ink-dim">Lesson {number}</span>
      </div>
      <div className="text-[0.95rem] leading-snug font-semibold text-ink">{title}</div>
      <p className="mt-1.5 mb-0 line-clamp-3 text-[0.82rem] leading-relaxed text-ink-dim">{summary}</p>
      <div className="mt-2 flex items-center justify-between font-mono text-[0.68rem] text-ink-dim">
        <span>{readTime ? `${readTime} read` : ""}</span>
        <span className="text-sky">Click to open →</span>
      </div>
    </div>
  );
}
