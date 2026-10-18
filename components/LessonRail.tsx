"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LESSON_PATH = /^\/[^/]+\/lesson-\d+\/?$/;

type Heading = { id: string; label: string };

const slugOf = (s: string) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "section";

/**
 * "On this page" for lessons. On wide screens it sits in the space to the right of the text and follows you down,
 * lighting up the section you are in. On smaller screens it is a Contents button that opens the same list.
 * It reads the lesson's <h2> headings from the page, so every lesson template gets it without changes.
 */
export default function LessonRail() {
  const pathname = usePathname();
  const active = LESSON_PATH.test(pathname);
  const [heads, setHeads] = useState<Heading[]>([]);
  const [current, setCurrent] = useState("");
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    setHeads([]);
    setOpen(false);
    if (!active) return;
    let tries = 0;
    let timer = 0;
    const scan = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(".lesson h2"));
      if (els.length < 3 && tries++ < 6) {
        timer = window.setTimeout(scan, 150);
        return;
      }
      const used = new Set<string>();
      const list: Heading[] = [];
      for (const el of els) {
        const label = (el.textContent ?? "").trim();
        if (!label) continue;
        let id = el.id;
        if (!id) {
          id = slugOf(label);
          let n = 2;
          while (used.has(id) || document.getElementById(id)) id = `${slugOf(label)}-${n++}`;
          el.id = id;
        }
        used.add(id);
        list.push({ id, label });
      }
      setHeads(list.length >= 3 ? list : []);
    };
    timer = window.setTimeout(scan, 60);
    return () => window.clearTimeout(timer);
  }, [active, pathname]);

  useEffect(() => {
    if (!heads.length) return;
    const body = document.querySelector(".lesson");
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = body?.getBoundingClientRect();
      setShown(Boolean(rect && rect.top < 120 && rect.bottom > 360));
      let cur = heads[0].id;
      for (const h of heads) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 140) cur = h.id;
      }
      setCurrent(cur);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [heads]);

  // Keep the current item visible inside the rail's own scroll area.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>("[aria-current='true']");
    el?.scrollIntoView({ block: "nearest" });
  }, [current]);

  if (!active || !heads.length) return null;

  const list = (
    <ol ref={listRef} className="m-0 list-none space-y-0.5 p-0">
      {heads.map((h) => {
        const on = h.id === current;
        return (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={on ? "true" : undefined}
              onClick={() => setOpen(false)}
              className={`block border-l-2 py-1 pl-3 pr-1 text-[0.82rem] leading-snug no-underline transition-colors ${
                on ? "border-sky font-semibold text-sky" : "border-line text-ink-dim hover:border-sky/60 hover:text-ink"
              }`}
            >
              {h.label}
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      {/* Wide screens: a rail in the space beside the text. */}
      <aside
        data-lesson-rail
        aria-label="On this page"
        className={`fixed top-24 z-30 hidden w-[var(--rail)] transition-opacity duration-200 lg:block ${shown ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ left: "calc(50% + var(--container) / 2 - var(--rail))" }}
      >
        <p className="mb-2 mt-0 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-dim">On this page</p>
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">{list}</div>
      </aside>

      {/* Smaller screens: a Contents button. */}
      <div data-lesson-rail className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`fixed bottom-4 right-4 z-40 inline-flex h-10 items-center gap-2 rounded-full border border-line bg-bg-elev px-4 text-[0.82rem] font-semibold text-ink shadow-lg shadow-black/30 transition-opacity ${
            shown || open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          ☰ Contents
        </button>
        {open ? (
          <>
            <button type="button" aria-label="Close contents" onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default bg-black/40" />
            <div className="fixed inset-x-3 bottom-16 z-50 max-h-[60vh] overflow-y-auto rounded-2xl border border-line bg-bg-elev p-4 shadow-2xl shadow-black/50">
              <p className="mb-2 mt-0 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-dim">On this page</p>
              {list}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
