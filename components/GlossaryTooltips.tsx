"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  findEntry,
  glossaryFor,
  glossaryHref,
  glossaryLessonHref,
  type Glossary,
  type GlossaryEntry,
} from "@/lib/glossary";

/**
 * Finds every glossary term in the page prose and wraps it in a <span class="term">.
 * Hovering, focusing or tapping the span shows one shared tooltip with the full name,
 * a one-line meaning and a link to the lesson that explains it.
 *
 * Which glossary is used depends on the series the page belongs to (DevOps terms under
 * /devops, JavaScript terms under /javascript, System Design terms under /system-design),
 * so "scope" never gets an AWS meaning.
 *
 * Short forms (EC2, ALB, DNS, GEC, TDZ …) are marked everywhere they appear. Ordinary
 * words that also have an entry (port, process, closure, scope …) are marked only on
 * their first use per page, so paragraphs do not fill up with underlines.
 */

/** Elements whose text must never be rewritten. */
const SKIP = "code, pre, a, h1, button, svg, .term, .term-tip, [data-no-glossary]";

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

type Matcher = { pattern: RegExp; hasTerm: RegExp };
const matchers = new Map<Glossary, Matcher>();

/** One compiled regex per glossary, longest names first so "IP address" beats "IP". */
function matcherFor(glossary: Glossary): Matcher {
  let m = matchers.get(glossary);
  if (!m) {
    const names = glossary.entries
      .flatMap((e) => [e.term, ...(e.aliases ?? [])])
      .sort((a, b) => b.length - a.length);
    const source = `(?<![A-Za-z0-9])(${names.map(escape).join("|")})(?![A-Za-z0-9])`;
    // Same regex without the g flag, so .test() has no lastIndex state.
    m = { pattern: new RegExp(source, "g"), hasTerm: new RegExp(source) };
    matchers.set(glossary, m);
  }
  return m;
}

/** Ordinary lowercase words (and entries flagged `once`) are only marked the first time they appear. */
const markEverywhere = (e: GlossaryEntry) => !e.once && /^[A-Z0-9]/.test(e.term);

/** Entries are plain text; some examples contain markup like <script>, so escape before innerHTML. */
const html = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function markTerms(root: HTMLElement, glossary: Glossary) {
  const { pattern, hasTerm } = matcherFor(glossary);
  const seen = new Set<string>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.parentElement && !n.parentElement.closest(SKIP) && hasTerm.test(n.nodeValue ?? "")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  for (const node of nodes) {
    const text = node.nodeValue ?? "";
    const frag = document.createDocumentFragment();
    let last = 0;
    pattern.lastIndex = 0;
    for (const m of text.matchAll(pattern)) {
      const entry = findEntry(glossary, m[1]);
      if (!entry) continue;
      if (!markEverywhere(entry)) {
        if (seen.has(entry.term)) continue;
        seen.add(entry.term);
      }
      frag.append(text.slice(last, m.index));
      const span = document.createElement("span");
      span.className = "term";
      span.tabIndex = 0;
      span.dataset.term = entry.term;
      span.textContent = m[1];
      frag.append(span);
      last = m.index! + m[0].length;
    }
    if (last === 0) continue;
    frag.append(text.slice(last));
    node.replaceWith(frag);
  }
}

function buildTip(): HTMLDivElement {
  const tip = document.createElement("div");
  tip.className = "term-tip";
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  document.body.append(tip);
  return tip;
}

function fillTip(tip: HTMLDivElement, glossary: Glossary, entry: GlossaryEntry) {
  const lesson =
    entry.lesson !== undefined
      ? `<a href="${glossaryLessonHref(glossary, entry.lesson)}">Lesson ${entry.lesson} →</a>`
      : "";
  tip.innerHTML = `
    <div class="term-tip-head"><strong>${html(entry.term)}</strong><span>${html(entry.full)}</span></div>
    <p>${html(entry.desc)}</p>
    <div class="term-tip-foot">${lesson}<a href="${glossaryHref(glossary)}">All terms</a></div>`;
}

function placeTip(tip: HTMLDivElement, target: HTMLElement) {
  const r = target.getBoundingClientRect();
  const gutter = 12;
  tip.hidden = false;
  const w = tip.offsetWidth;
  const h = tip.offsetHeight;
  let left = r.left + window.scrollX;
  const maxLeft = window.scrollX + window.innerWidth - w - gutter;
  left = Math.max(window.scrollX + gutter, Math.min(left, maxLeft));
  const below = r.bottom + 8 + h < window.innerHeight;
  const top = below ? r.bottom + window.scrollY + 8 : r.top + window.scrollY - h - 8;
  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
  tip.dataset.side = below ? "below" : "above";
}

export default function GlossaryTooltips() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const glossary = glossaryFor(pathname);
    markTerms(main, glossary);

    const tip = buildTip();
    let current: HTMLElement | null = null;
    let hideTimer: number | undefined;

    const show = (target: HTMLElement) => {
      const entry = findEntry(glossary, target.dataset.term ?? "");
      if (!entry) return;
      window.clearTimeout(hideTimer);
      current = target;
      fillTip(tip, glossary, entry);
      placeTip(tip, target);
    };
    const hide = () => {
      hideTimer = window.setTimeout(() => {
        tip.hidden = true;
        current = null;
      }, 120);
    };
    const termOf = (e: Event) => (e.target as HTMLElement | null)?.closest?.(".term") as HTMLElement | null;

    const onOver = (e: Event) => {
      const t = termOf(e);
      if (t) show(t);
    };
    const onOut = (e: Event) => {
      if (termOf(e)) hide();
    };
    const onFocusIn = (e: Event) => {
      const t = termOf(e);
      if (t) show(t);
    };
    const onFocusOut = (e: Event) => {
      if (termOf(e)) hide();
    };
    // Touch screens have no hover: tap toggles, tap elsewhere closes.
    const onClick = (e: Event) => {
      // Tooltip links are plain <a> tags (the tip is built as HTML), so route them through the
      // Next.js router instead of letting the browser reload the page. Modified clicks
      // (new tab, new window) keep their normal behaviour.
      const link = (e.target as HTMLElement | null)?.closest?.(".term-tip a") as HTMLAnchorElement | null;
      const m = e as MouseEvent;
      if (link && link.origin === window.location.origin && m.button === 0 && !m.metaKey && !m.ctrlKey && !m.shiftKey && !m.altKey) {
        e.preventDefault();
        tip.hidden = true;
        current = null;
        router.push(link.pathname + link.search + link.hash);
        return;
      }
      const t = termOf(e);
      if (t) {
        e.preventDefault();
        if (current === t && !tip.hidden) {
          tip.hidden = true;
          current = null;
        } else show(t);
      } else if (!tip.contains(e.target as Node)) {
        tip.hidden = true;
        current = null;
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") tip.hidden = true;
    };
    const keepOpen = () => window.clearTimeout(hideTimer);

    main.addEventListener("mouseover", onOver);
    main.addEventListener("mouseout", onOut);
    main.addEventListener("focusin", onFocusIn);
    main.addEventListener("focusout", onFocusOut);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    tip.addEventListener("mouseenter", keepOpen);
    tip.addEventListener("mouseleave", hide);

    return () => {
      main.removeEventListener("mouseover", onOver);
      main.removeEventListener("mouseout", onOut);
      main.removeEventListener("focusin", onFocusIn);
      main.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      tip.remove();
    };
  }, [pathname, router]);

  return null;
}
