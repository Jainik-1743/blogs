"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { GLOSSARY, findEntry, type GlossaryEntry } from "@/lib/glossary";

/**
 * Finds every glossary term in the page prose and wraps it in a <span class="term">.
 * Hovering, focusing or tapping the span shows one shared tooltip with the full name,
 * a one-line meaning and a link to the lesson that explains it.
 *
 * Short forms (EC2, ALB, DNS …) are marked everywhere they appear. Ordinary words that
 * also have an entry (port, process, firewall …) are marked only on their first use per
 * page, so paragraphs do not fill up with underlines.
 */

/** Elements whose text must never be rewritten. */
const SKIP = "code, pre, a, h1, button, svg, .term, .term-tip, [data-no-glossary]";

const allNames = GLOSSARY.flatMap((e) => [e.term, ...(e.aliases ?? [])]).sort(
  (a, b) => b.length - a.length,
);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const source = `(?<![A-Za-z0-9])(${allNames.map(escape).join("|")})(?![A-Za-z0-9])`;
const pattern = new RegExp(source, "g");
/** Same regex without the g flag, so .test() has no lastIndex state. */
const hasTerm = new RegExp(source);

/** Ordinary lowercase words are only marked the first time they appear. */
const markEverywhere = (e: GlossaryEntry) => /^[A-Z0-9]/.test(e.term);

function markTerms(root: HTMLElement) {
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
      const entry = findEntry(m[1]);
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

function fillTip(tip: HTMLDivElement, entry: GlossaryEntry) {
  const lesson =
    entry.lesson !== undefined
      ? `<a href="/devops/lesson-${entry.lesson}">Lesson ${entry.lesson} →</a>`
      : "";
  tip.innerHTML = `
    <div class="term-tip-head"><strong>${entry.term}</strong><span>${entry.full}</span></div>
    <p>${entry.desc}</p>
    <div class="term-tip-foot">${lesson}<a href="/devops/glossary">All terms</a></div>`;
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

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    markTerms(main);

    const tip = buildTip();
    let current: HTMLElement | null = null;
    let hideTimer: number | undefined;

    const show = (target: HTMLElement) => {
      const entry = findEntry(target.dataset.term ?? "");
      if (!entry) return;
      window.clearTimeout(hideTimer);
      current = target;
      fillTip(tip, entry);
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
  }, [pathname]);

  return null;
}
